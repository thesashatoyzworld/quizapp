// Онбординг тарифа 2: приветственный пакет и следом интервью.
//
// Зовётся из двух мест, где доступ становится живым: редима `/start paid_<token>`
// (оплата картой) и ветки uroven в вебхуке Продамуса (оплата из бота). Оба пути
// приводят к одному и тому же человеку, поэтому защита от повтора обязательна:
// по ссылке возврата кликают дважды, а вебхук Продамус умеет прислать повторно.

import { prisma } from '@/lib/prisma';
import { sendBotMessage, createGroupInvite } from '@/lib/telegram';
import { welcomeText, WELCOME_BUTTON } from '@/content/onboarding-t2';
import { trackContent, type IntakeTrack } from '@/content/intake-tracks';
import { ensureIntake, sendPreamble, getIntake, intakeTotal, withCount } from '@/lib/intake';

const CABINET_URL =
  (process.env.NEXT_PUBLIC_CABINET_URL || 'https://world.thesashatoyz.com').replace(/\/$/, '') +
  '/dostup';

/** Уже здоровались? Отметка живёт событием, отдельной таблицы под это не нужно. */
async function alreadyWelcomed(telegramId: number): Promise<boolean> {
  const seen = await prisma.event.findFirst({
    where: { type: 'welcome_sent', telegramId: BigInt(telegramId) },
    select: { id: true },
  });
  return Boolean(seen);
}

/**
 * Приветствие тарифа 2 плюс запуск интервью.
 *
 * Возвращает false, если ничего не отправляли: так вызывающий понимает, что
 * человеку надо показать обычное сообщение про доступ, а не молчать.
 */
export async function sendWelcomeT2(telegramId: number, force = false): Promise<boolean> {
  if (!force && (await alreadyWelcomed(telegramId))) return false;

  // Ссылку в группу выписываем в этот же момент: она именная и на одно
  // вступление, поэтому заранее её держать негде. Не выписалась — пункт про
  // группу выпадет, остальное приветствие уйдёт как есть.
  const invite = await createGroupInvite(telegramId);
  if (!invite) console.warn('[onboarding] ссылка в группу не выписалась', telegramId);

  const sent = await sendBotMessage(telegramId, welcomeText(invite), {
    inline_keyboard: [[{ text: WELCOME_BUTTON, web_app: { url: CABINET_URL } }]],
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
        productSlug: 'uroven-t2',
        metadata: { track: 't2', groupInvite: invite || null },
      },
    })
    .catch((e) => console.error('[onboarding] отметку welcome_sent записать не смог:', e));

  await startIntake(telegramId, 't2');
  return true;
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

/**
 * `/welcome @username` — руками запустить онбординг тому, чья оплата прошла
 * мимо системы (крипта, PayPal, перевод). Доступ такому человеку выдаётся
 * руками, а приветствие, ссылка в группу и интервью висят на вебхуке оплаты,
 * то есть не случаются вовсе.
 *
 * Возвращает готовый ответ админу.
 */
export async function adminWelcomeT2(arg: string): Promise<string> {
  const raw = arg.trim().replace(/^@/, '');
  if (!raw) return 'кому: /welcome @username';

  const user = /^\d+$/.test(raw)
    ? await prisma.user.findUnique({ where: { telegramId: BigInt(raw) } })
    : await prisma.user.findFirst({
      where: { username: { equals: raw, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });

  if (!user) return `не нашёл ${arg} в базе. он должен хоть раз запустить бота`;

  const tg = Number(user.telegramId);
  const access = await prisma.productAccess.findFirst({
    where: { telegramId: user.telegramId, productSlug: 'uroven-t2', status: 'active' },
  });

  if (await alreadyWelcomed(tg)) return `${arg} уже здоровались раньше, ничего не отправил`;

  const ok = await sendWelcomeT2(tg);
  if (!ok) return `не смог написать ${arg}: не начинал диалог с ботом или заблокировал его`;

  const warn = access ? '' : '\n\n⚠ активного тарифа 2 в базе у него нет, приветствие всё равно ушло';
  return `${arg}: приветствие ушло, ссылка в группу выписана, интервью запущено${warn}`;
}
