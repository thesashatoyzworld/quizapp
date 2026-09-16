// Онбординг тарифов 2 и 3: приветственный пакет и следом интервью.
//
// Зовётся из двух мест, где доступ становится живым: редима `/start paid_<token>`
// (оплата картой) и ветки uroven в вебхуке Продамуса (оплата из бота). Оба пути
// приводят к одному и тому же человеку, поэтому защита от повтора обязательна:
// по ссылке возврата кликают дважды, а вебхук Продамус умеет прислать повторно.
//
// Тарифы различаются только текстом и треком анкеты, механика одна: выписать
// именную ссылку в группу, поздороваться, запустить интервью, отметить событие.

import { prisma } from '@/lib/prisma';
import { sendBotMessage, createGroupInvite } from '@/lib/telegram';
import { welcomeText, WELCOME_BUTTON } from '@/content/onboarding-t2';
import { welcomeTextT3, WELCOME_BUTTON_T3 } from '@/content/onboarding-t3';
import { trackContent, type IntakeTrack } from '@/content/intake-tracks';
import { ensureIntake, sendPreamble, getIntake, intakeTotal, withCount } from '@/lib/intake';

const CABINET_URL =
  (process.env.NEXT_PUBLIC_CABINET_URL || 'https://world.thesashatoyz.com').replace(/\/$/, '') +
  '/dostup';

/** Всё, чем тариф отличается в приветствии. Новый тариф добавляется сюда. */
const TIERS: Record<IntakeTrack, {
  slug: string;
  label: string;
  button: string;
  text: (invite: string | null, withIntake: boolean) => string;
}> = {
  t2: {
    slug: 'uroven-t2',
    label: 'uroven t2',
    button: WELCOME_BUTTON,
    text: (invite) => welcomeText(invite),
  },
  t3: {
    slug: 'uroven-t3',
    label: 'uroven t3',
    button: WELCOME_BUTTON_T3,
    text: (invite, withIntake) => welcomeTextT3(invite, withIntake),
  },
};

/** Уже здоровались? Отметка живёт событием, отдельной таблицы под это не нужно. */
async function alreadyWelcomed(telegramId: number): Promise<boolean> {
  const seen = await prisma.event.findFirst({
    where: { type: 'welcome_sent', telegramId: BigInt(telegramId) },
    select: { id: true },
  });
  return Boolean(seen);
}

/**
 * Анкета уже пройдена? Тогда интервью запускать не надо, а в приветствии вместо
 * пункта про интервью человеку обещаем карту. Так бывает у оплат мимо кассы:
 * доступ выдали руками, анкету человек прошёл, а приветствие догоняет потом.
 */
async function intakeDone(telegramId: number): Promise<boolean> {
  const intake = await getIntake(telegramId);
  return Boolean(intake && intake.status !== 'invited');
}

/**
 * Приветствие тарифа плюс запуск интервью.
 *
 * Возвращает false, если ничего не отправляли: так вызывающий понимает, что
 * человеку надо показать обычное сообщение про доступ, а не молчать.
 */
export async function sendWelcome(
  telegramId: number,
  tier: IntakeTrack,
  force = false,
): Promise<boolean> {
  if (!force && (await alreadyWelcomed(telegramId))) return false;

  const cfg = TIERS[tier];
  const withIntake = !(await intakeDone(telegramId));

  // Ссылку в группу выписываем в этот же момент: она именная и на одно
  // вступление, поэтому заранее её держать негде. Не выписалась — пункт про
  // группу выпадет, остальное приветствие уйдёт как есть.
  const invite = await createGroupInvite(telegramId, cfg.label);
  if (!invite) console.warn('[onboarding] ссылка в группу не выписалась', telegramId);

  const sent = await sendBotMessage(telegramId, cfg.text(invite, withIntake), {
    inline_keyboard: [[{ text: cfg.button, web_app: { url: CABINET_URL } }]],
  });
  if (!sent.ok) {
    console.error('[onboarding] приветствие не ушло', telegramId, sent);
    return false;
  }

  await prisma.event
    .create({
      data: {
        type: 'welcome_sent',
        source: 'thesasha',
        telegramId: BigInt(telegramId),
        productSlug: cfg.slug,
        metadata: { track: tier, groupInvite: invite || null },
      },
    })
    .catch((e) => console.error('[onboarding] отметку welcome_sent записать не смог:', e));

  if (withIntake) await startIntake(telegramId, tier);
  return true;
}

/** Совместимость с прежними вызовами: тариф 2 здоровается так же, как раньше. */
export async function sendWelcomeT2(telegramId: number, force = false): Promise<boolean> {
  return sendWelcome(telegramId, 't2', force);
}

/** Тариф 3: то же самое, свой текст и менторский трек анкеты. */
export async function sendWelcomeT3(telegramId: number, force = false): Promise<boolean> {
  return sendWelcome(telegramId, 't3', force);
}

/**
 * Интервью сразу за доступом: момент максимальной мотивации, человек только
 * что заплатил. Трек замораживаем сейчас, даже если тариф потом сменится:
 * вопросы должны остаться те, с которыми человек начал.
 *
 * Повторный заход молчит: анкету трогаем, только пока она `invited`, поэтому
 * второй клик по своей же ссылке не сбросит начатое и не спросит заново.
 */
export async function startIntake(telegramId: number, track: IntakeTrack): Promise<void> {
  try {
    const existing = await getIntake(telegramId);
    if (existing && existing.status !== 'invited') return;

    const intake = await ensureIntake(telegramId, undefined, undefined, undefined, track);
    await sendBotMessage(telegramId, withCount(trackContent(intake.track).invite, intakeTotal(intake)));
    await sendPreamble(telegramId, intake);
  } catch (e) {
    console.error('[onboarding] интервью не запустилось', telegramId, e);
  }
}

/** Тариф по живым доступам: третий старше второго, поэтому проверяется первым. */
async function tierOf(telegramId: bigint): Promise<IntakeTrack | null> {
  const rows = await prisma.productAccess.findMany({
    where: { telegramId, status: 'active', productSlug: { in: ['uroven-t3', 'uroven-t2'] } },
    select: { productSlug: true },
  });
  if (rows.some((r) => r.productSlug === 'uroven-t3')) return 't3';
  if (rows.some((r) => r.productSlug === 'uroven-t2')) return 't2';
  return null;
}

/**
 * `/welcome @username [t2|t3]` — руками запустить онбординг тому, чья оплата
 * прошла мимо системы (крипта, PayPal, перевод, счёт руками в Продамусе).
 * Доступ такому человеку выдаётся руками, а приветствие, ссылка в группу и
 * интервью висят на вебхуке оплаты, то есть не случаются вовсе.
 *
 * Тариф берём из живых доступов, аргументом его можно продавить.
 *
 * Возвращает готовый ответ админу.
 */
export async function adminWelcome(arg: string): Promise<string> {
  const [who = '', asked = ''] = arg.trim().split(/\s+/);
  const raw = who.replace(/^@/, '');
  if (!raw) return 'кому: /welcome @username [t2|t3]';

  const user = /^\d+$/.test(raw)
    ? await prisma.user.findUnique({ where: { telegramId: BigInt(raw) } })
    : await prisma.user.findFirst({
      where: { username: { equals: raw, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });

  if (!user) return `не нашёл ${who} в базе. он должен хоть раз запустить бота`;

  const tg = Number(user.telegramId);
  const forced = asked === 't2' || asked === 't3' ? (asked as IntakeTrack) : null;
  const live = await tierOf(user.telegramId);
  const tier = forced || live;
  if (!tier) return `у ${who} нет активного тарифа 2 или 3. или выдай доступ, или скажи тариф: /welcome ${who} t3`;

  if (await alreadyWelcomed(tg)) return `${who} уже здоровались раньше, ничего не отправил`;

  const hadIntake = await intakeDone(tg);
  const ok = await sendWelcome(tg, tier);
  if (!ok) return `не смог написать ${who}: не начинал диалог с ботом или заблокировал его`;

  const warn = live ? '' : `\n\n⚠ активного тарифа в базе у него нет, приветствие ушло как ${tier}`;
  const intake = hadIntake ? 'анкета уже пройдена, интервью не запускал' : 'интервью запущено';
  return `${who}: приветствие ${tier} ушло, ссылка в группу выписана, ${intake}${warn}`;
}

/** Старое имя команды: пусть внешние вызовы не ломаются. */
export const adminWelcomeT2 = adminWelcome;
