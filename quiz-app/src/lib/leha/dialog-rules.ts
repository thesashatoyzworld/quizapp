/**
 * Лёха ведёт весь диалог до продажи. Только в чатах из LEHA_DIALOG_CHATS.
 *
 * Здесь только правила, без Prisma и без сети: когда отвечать, когда молчать,
 * что из текста модели нельзя отправлять человеку. Под тесты.
 */
import { SETTLE_MS, almatyDayStart, inWorkHours, nextWorkMoment, type LehaMode } from './rules';
import { rub, type PriceSet } from '@/content/prices';

/** Чаты, где Лёха ведёт разговор целиком. Через запятую, id чата. */
export function dialogChats(raw: string | undefined = process.env.LEHA_DIALOG_CHATS): string[] {
  return (raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isDialogChat(chatId: string, raw?: string): boolean {
  return dialogChats(raw).includes(String(chatId));
}

/** Не больше стольких сообщений Лёхи в одном чате за сутки по Алмате. */
export const DIALOG_DAILY_LIMIT = 20;

/** Сообщение длиннее этого не уходит само: оффер целиком укладывается в 700. */
export const DIALOG_MAX_LEN = 700;

/** Модель думает до минуты; дольше пяти минут «пишет» только упавшая задача. */
export const COMPOSING_STALE_MS = 5 * 60 * 1000;

/** Когда отвечать на реплику, пришедшую в момент now. Та же пауза, что у первого сообщения. */
export function dialogDueAt(now: Date): Date {
  return nextWorkMoment(new Date(now.getTime() + SETTLE_MS));
}

/** Сколько Лёха уже отправил сегодня: счётчик обнуляется в полночь по Алмате. */
export function sentToday(dayStart: Date | null, dayCount: number, now: Date): number {
  if (!dayStart) return 0;
  return dayStart.getTime() === almatyDayStart(now).getTime() ? dayCount : 0;
}

export type DialogRunFacts = {
  mode: LehaMode;
  inList: boolean;
  status: string;
  dueAt: Date | null;
  updatedAt: Date;
  /** Кто написал последним в чате. */
  lastSide: 'client' | 'us' | null;
  sentToday: number;
  /** После включения в чате есть Сашины реплики (не Лёхины). */
  sashaWrote: boolean;
  now: Date;
};

export type DialogStep =
  | { kind: 'compose' }
  | { kind: 'wait'; until: Date }
  | { kind: 'stop'; reason: 'sasha_wrote' }
  | { kind: 'noop'; why: string };

/**
 * Задача проснулась ответить. За паузу всё могло поменяться: человек дописал
 * (dueAt сдвинулся), Саша ответил сам, наступила ночь, кончился дневной лимит.
 */
export function decideDialogRun(f: DialogRunFacts): DialogStep {
  if (!f.inList) return { kind: 'noop', why: 'чат не в LEHA_DIALOG_CHATS' };
  if (f.mode === 'off') return { kind: 'noop', why: 'LEHA_MODE=off' };

  const stale = f.status === 'composing' && f.now.getTime() - f.updatedAt.getTime() > COMPOSING_STALE_MS;
  if (f.status === 'composing' && !stale) {
    // Пока одна задача пишет, вторая ждёт рядом, а не теряется: человек мог
    // дописать, и ответ на это кто-то должен собрать.
    return f.dueAt ? { kind: 'wait', until: new Date(f.now.getTime() + 30 * 1000) } : { kind: 'noop', why: 'уже пишет' };
  }
  if (f.status !== 'active' && !stale) return { kind: 'noop', why: `статус ${f.status}` };
  if (f.sashaWrote) return { kind: 'stop', reason: 'sasha_wrote' };
  if (!f.dueAt) return { kind: 'noop', why: 'отвечать не на что' };
  if (f.now < f.dueAt) return { kind: 'wait', until: f.dueAt };
  if (!inWorkHours(f.now)) return { kind: 'wait', until: nextWorkMoment(f.now) };
  // Два сообщения подряд без ответа человека Лёха не пишет никогда.
  if (f.lastSide !== 'client') return { kind: 'noop', why: 'последнее слово наше' };
  if (f.sentToday >= DIALOG_DAILY_LIMIT) {
    const tomorrow9 = nextWorkMoment(new Date(almatyDayStart(f.now).getTime() + 24 * 60 * 60 * 1000));
    return { kind: 'wait', until: tomorrow9 };
  }
  return { kind: 'compose' };
}

export const SENT_BY_LEHA = 'sent-by:leha';

/**
 * Саша написал в чат сам после включения Лёхи. Его реплика в базе это наша
 * сторона без метки Лёхи. Эхо Лёхиного же сообщения узнаём по тексту: апдейт
 * телеграма может лечь в базу раньше, чем sendAs поставит метку.
 */
export function sashaTookOver(
  rows: { side: string; mediaRef: string | null; text: string; createdAt: Date }[],
  enabledAt: Date,
  lastSentText: string | null,
): boolean {
  return rows.some(
    (r) =>
      r.side === 'us' &&
      r.createdAt >= enabledAt &&
      r.mediaRef !== SENT_BY_LEHA &&
      !(lastSentText && r.text.trim() === lastSentText.trim()),
  );
}

// ─── Ссылки ────────────────────────────────────────────────────────────────

const SITE = 'thesashatoyz.com';
const PAY = 'world.thesashatoyz.com/pay';

/**
 * Материалы из документа «Материалы» (GSD-BRAND/clients/sasha/sales-bot/05).
 * Только отсюда: ссылки не из списка Лёха не шлёт никогда.
 */
export const MATERIALS: { path: string; what: string }[] = [
  { path: `${SITE}/uroven`, what: 'страница тарифов: только если сам спросил про форматы' },
  { path: `${SITE}/cases/vasya`, what: 'кейс Васи, фитнес, 535 подписчиков и 500к+: «мало подписчиков», потолок по клиентам, страх поднять цену' },
  { path: `${SITE}/cases/vlad`, what: 'кейс Влада, психолог: мягкие ниши, «нет методологии», «отпишутся если продавать»' },
  { path: `${SITE}/cases/zhenya`, what: 'кейс Жени, тренер по бегу: тёплая аудитория не покупает, неудобно писать первым' },
  { path: `${SITE}/cases/dima`, what: 'кейс Димы: в найме, нет времени; деньги прямыми продажами без блога' },
  { path: `${SITE}/cases/danya`, what: 'кейс Дани: «сто тысяч просмотров и ноль продаж», «зачем наставник»' },
  { path: `${SITE}/cases/masha`, what: 'кейс Маши, сценарист: работает на чужие проекты, а своим не занимается' },
  { path: `${SITE}/cases/milena`, what: 'кейс Милены: просмотры есть, подписчиков нет; «не о чем снимать»' },
  { path: `${SITE}/cases/anton`, what: 'кейс Антона, танцы: «в моей нише не платят», творческие ниши' },
  { path: `${SITE}/cases/valit`, what: 'кейс Валита, AI и SaaS: куча идей, размазан фокус' },
  { path: `${SITE}/algoritm-sistema.html`, what: 'статья «Инстаграм это казино»: рилсы не заходят, просмотров нет' },
  { path: 'youtu.be/BwYVXI6z6b4', what: 'видео-разбор «Казино» 72 минуты: то же, для тех, кто не читает' },
  { path: `${SITE}/blog/pochemu-kontent-ne-idet`, what: 'статья: стараюсь, а отклика нет; охваты есть, денег нет' },
  { path: `${SITE}/blog/urovni-navyka-kontenta`, what: 'статья «6 уровней навыка контента»: подход Саши' },
  { path: `${SITE}/mosseri-razbor.html`, what: 'разбор Моссери: скептику, «докажи»' },
  { path: `${SITE}/blog/10-chit-kodov-dlya-kontenta`, what: '«10 чит-кодов»: нет времени на контент' },
  { path: `${SITE}/blog/ne-obnulyay-svoy-opyt`, what: 'статья про синдром самозванца: «мне нечего сказать»' },
  { path: `${SITE}/blog/naydi-svoyu-igru`, what: 'статья «Найди свою игру»: всегда бросаю' },
  { path: `${SITE}/podcast/pochemu-tvoy-kontent-ne-rabotaet`, what: 'подкаст: слушает, а не читает' },
  { path: `${SITE}/podcast/ne-zarabatyvat-razreshit-sebe-poluchat`, what: 'подкаст: блок на деньги' },
  { path: 'youtu.be/yPVe749WQIc', what: 'видео «что я за перец»: вообще не знает Сашу' },
  { path: 't.me/sashatoyz/1756', what: 'пост про Катю с математикой: застрял на дешёвых продуктах' },
  { path: 'instagram.com/p/DcP5H5DDEgJ', what: 'карусель про сроки: хочет результат за месяц' },
];

/** Оплата тарифа 1 с привязкой к его телеграму: доступ выдастся сам. */
export const payT1Link = (chatId: string) => `https://${PAY}/t1?u=${chatId}`;

/** Личные ссылки на закрытые тарифы: только с Сашиного ок. */
export const personalLink = (tier: 't2' | 't3', chatId: string) => `https://${PAY}/${tier}?k=svoi&u=${chatId}`;

/** Ссылка к сравнимому виду: без протокола, www, хвоста и параметров. */
export function normalizeLink(url: string): string {
  return url
    .trim()
    .replace(/[)\].,!?;:»"']+$/, '')
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split(/[?#]/)[0]
    .replace(/\/+$/, '')
    .toLowerCase();
}

/** Все ссылки в тексте, как написаны. */
export function extractLinks(text: string): string[] {
  const re = /(?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>«»"]*)?/gi;
  return (text.match(re) || []).filter((m) => /\/|^https?:/i.test(m) || /\.(com|ru|be|me|io)$/i.test(m));
}

export type LinkVerdict = 'ok' | 'personal' | 'foreign';

/** ok: можно слать само; personal: личная ссылка на т2/т3, только с Сашиного ок. */
export function checkLinks(text: string): { verdict: LinkVerdict; bad: string[] } {
  const ok = new Set([...MATERIALS.map((m) => m.path), `${PAY}/t1`].map((l) => l.toLowerCase()));
  const personal = new Set([`${PAY}/t2`, `${PAY}/t3`]);
  const bad: string[] = [];
  let hasPersonal = false;
  for (const raw of extractLinks(text)) {
    const n = normalizeLink(raw);
    if (ok.has(n)) continue;
    if (personal.has(n)) {
      hasPersonal = true;
      continue;
    }
    bad.push(raw);
  }
  if (bad.length) return { verdict: 'foreign', bad };
  return { verdict: hasPersonal ? 'personal' : 'ok', bad };
}

// ─── Цены ──────────────────────────────────────────────────────────────────

/** Суммы, которые можно называть: прайс, рассрочка тарифа 1, доплата т1 → т2. */
export function allowedAmounts(p: PriceSet): Set<number> {
  return new Set([
    p.t1,
    p.t2Month,
    p.t2Pack,
    p.t3Month,
    p.groupOnce,
    p.groupMonth,
    p.solo,
    p.dfvFrom,
    p.dfvTo,
    Math.round(p.t1 / 24),
    p.t2Month - p.t1,
    p.t3Month * 3,
  ]);
}

/**
 * Суммы в рублях из текста: «6 550 ₽», «12000р», «155к рублей», «60 тыс. руб».
 * Без валюты рядом число не считается ценой: в кейсах «500к в месяц» это доход.
 */
export function extractAmounts(text: string): number[] {
  const re = /(\d{1,3}(?:[  ]\d{3})+|\d+)(?:[.,]\d+)?\s*(к|k|тыс\.?|тысяч[а-я]*)?\s*(₽|р\.?(?![а-яё])|руб[а-яё.]*)/gi;
  const out: number[] = [];
  for (const m of text.matchAll(re)) {
    const n = Number(m[1].replace(/[  ]/g, ''));
    out.push(m[2] ? n * 1000 : n);
  }
  return out;
}

// ─── Текст ─────────────────────────────────────────────────────────────────

const SELF_FEMININE = /(^|\n)\s*(видела|посмотрела|хотела|увидела|прочитала|поняла|глянула|подумала|написала)([^а-яё]|$)|(^|[^а-яё])я\s+(уже\s+|тоже\s+|бы\s+)?(видела|посмотрела|хотела|увидела|прочитала|поняла|глянула|подумала|написала|рада|готова)([^а-яё]|$)/i;
const SELF_TALK = /(^|[^а-яё])(стоп|пишу как|в мужском роде|как ассистент|как ии|я бот|языковая модель)([^а-яё]|$)|\.\.\s*нет,/i;

/**
 * Привести текст модели к сообщению. problem: почему нельзя отправить само,
 * personal: в тексте личная ссылка на закрытый тариф (только с Сашиного ок).
 */
export function cleanDialogReply(raw: string, p: PriceSet): { text: string | null; problem: string | null; personal: boolean } {
  let t = (raw || '').trim();
  t = t.replace(/^["“”']+|["“”']+$/g, '').trim();
  t = t.replace(/\s*[—–]\s*/g, ' - ');
  t = t.replace(/[«»]/g, '"');
  t = t.replace(/\n{3,}/g, '\n\n');
  if (!t) return { text: null, problem: 'пусто', personal: false };
  if (t.length > DIALOG_MAX_LEN) return { text: t, problem: 'слишком длинно', personal: false };
  if (SELF_TALK.test(t)) return { text: null, problem: 'служебное в тексте', personal: false };
  if (SELF_FEMININE.test(t)) return { text: t, problem: 'о себе в женском роде', personal: false };

  const links = checkLinks(t);
  if (links.verdict === 'foreign') return { text: t, problem: `ссылка не из списка: ${links.bad.join(', ')}`, personal: false };

  const ok = allowedAmounts(p);
  const wrong = extractAmounts(t).filter((n) => !ok.has(n));
  if (wrong.length) return { text: t, problem: `цена не из прайса: ${wrong.map(rub).join(', ')}`, personal: false };

  return { text: t, problem: null, personal: links.verdict === 'personal' };
}

export type Delivery = 'send' | 'review' | 'escalate';

/**
 * Что делать с готовым ответом. Модель позвала Сашу, текст с изъяном или
 * личная ссылка: человеку ничего, Саше карточка. Иначе live шлёт сам, shadow
 * отдаёт на кнопки.
 */
export function dialogDelivery(f: {
  mode: LehaMode;
  callSasha: string | null;
  problem: string | null;
  personal: boolean;
  hasText: boolean;
  now: Date;
}): Delivery {
  if (f.callSasha || f.personal || !f.hasText) return 'escalate';
  if (f.problem) return f.mode === 'live' ? 'escalate' : 'review';
  return f.mode === 'live' && inWorkHours(f.now) ? 'send' : 'review';
}
