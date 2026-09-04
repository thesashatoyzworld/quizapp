import { prisma } from '@/lib/prisma';

// Человек сказал «давай», получил ссылку — и не оплатил.
//
// Это самая дорогая точка всей переписки: работа уже сделана, согласие уже
// получено, и дальше всё решает пара касаний. Помощник должен знать, что
// разговор стоит именно здесь, иначе начинает продавать заново тому, кто
// уже согласился.

/** Ссылка, по которой платят: страница тарифов, бот с оплатой, Продамус. */
const PAY_LINK = /(thesashatoyz\.com\/uroven|start=uroven|prodamus|\/pay\/|ссылк[аиу] для оплаты)/i;

export type AwaitingPayment = {
  /** Когда отправили ссылку. */
  sentAt: Date;
  hours: number;
  /** Сказал ли человек «да» после ссылки: согласие есть, денег нет. */
  agreed: boolean;
};

/**
 * Ждём ли мы от этого человека оплату.
 *
 * Оплату проверяем по выданному доступу: product_access ключуется телеграмным
 * id, а он же служит id чата в личке. Есть доступ — человек уже купил, и
 * никаких напоминаний ему слать не надо.
 */
export async function awaitingPayment(chatId: string): Promise<AwaitingPayment | null> {
  // telegram_id в product_access хранится числом, а id чата у нас строка.
  const paid = await prisma.productAccess.count({ where: { telegramId: BigInt(chatId) } });
  if (paid > 0) return null;

  const rows = await prisma.tgBusinessMsg.findMany({
    where: { chatId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { side: true, text: true, createdAt: true },
  });

  const link = rows.find((r) => r.side === 'us' && PAY_LINK.test(r.text));
  if (!link) return null;

  // «Да, давай», «ок», «оплачу» после ссылки — согласие, за которым не
  // последовало денег. Отвечать на такое надо иначе, чем на молчание.
  //
  // ⚠️ Без \b: в JS граница слова считается по ASCII, и после кириллицы её
  // просто нет — «Ок» с \b не совпадало вообще. Вместо неё запрет на букву
  // следом, иначе «Дай подумать» читалось бы как согласие.
  const YES = /^(да+|ок|окей|хорошо|давай|беру|оплачу|сейчас|понял[а]?)(?![а-яё])/i;
  const agreed = rows.some(
    (r) => r.side === 'client' && r.createdAt > link.createdAt && YES.test(r.text.trim()),
  );

  return {
    sentAt: link.createdAt,
    hours: Math.round((Date.now() - link.createdAt.getTime()) / 3_600_000),
    agreed,
  };
}

/** Строка для промпта: где стоит разговор и сколько уже стоит. */
export function describePayment(p: AwaitingPayment | null): string | null {
  if (!p) return null;
  const when = p.hours < 24 ? `${p.hours} ч назад` : `${Math.round(p.hours / 24)} дн назад`;
  return p.agreed
    ? `⚠️ ССЫЛКА НА ОПЛАТУ отправлена ${when}, человек ответил согласием, но оплаты нет. Продавать заново не надо: он уже сказал да.`
    : `⚠️ ССЫЛКА НА ОПЛАТУ отправлена ${when}, оплаты нет.`;
}

/**
 * Мяч на его стороне: последнее слово человека ничего от нас не требует.
 *
 * «Ок», «да, давай», «спасибо» после нашего сообщения — это принято
 * к сведению, а не вопрос. Объяснять такому человеку, почему мы молчали,
 * незачем: мы ему ничего не должны, ход был его.
 */
export function theirMove(lastClientText: string): boolean {
  const t = lastClientText.trim();
  if (t.includes('?')) return false;
  if (t.length > 60) return false;
  // Вопрос часто приходит без знака: «хорошо, а когда начнём». Ошибиться
  // здесь безопаснее в сторону «ждёт ответа», чем промолчать в ответ на вопрос.
  // ⚠️ Снова без : он работает по латинице и с кириллицей не срабатывает.
  if (/(^|[^а-яё])(когда|как|что|скольк|какой|какая|где|почему|зачем|можно ли|нужно ли)/i.test(t)) {
    return false;
  }
  return /^(да+|ок|окей|хорошо|понял[а]?|спасибо|договорились|давай|беру|оплачу|сейчас|принял[а]?|отлично|супер)(?![а-яё])/i.test(
    t,
  );
}

/**
 * Кто из этих чатов уже оплатил.
 *
 * Одним запросом на весь список: в очереди это нужно на каждой строке, а
 * доступ ключуется тем же телеграмным id, что и чат. Нечисловые id (чат из
 * инсты, скриншоты) просто не попадают в выборку.
 */
export async function paidChats(chatIds: string[]): Promise<Set<string>> {
  const ids = chatIds.filter((id) => /^\d+$/.test(id)).map((id) => BigInt(id));
  if (!ids.length) return new Set();

  const rows = await prisma.productAccess.findMany({
    where: { telegramId: { in: ids } },
    select: { telegramId: true },
    distinct: ['telegramId'],
  });
  return new Set(rows.map((r) => String(r.telegramId)));
}
