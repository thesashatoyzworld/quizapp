// Онбординг тарифа 2: приветственный пакет и следом интервью.
//
// Зовётся из двух мест, где доступ становится живым: редима `/start paid_<token>`
// (оплата картой) и ветки uroven в вебхуке Продамуса (оплата из бота). Оба пути
// приводят к одному и тому же человеку, поэтому защита от повтора обязательна:
// по ссылке возврата кликают дважды, а вебхук Продамус умеет прислать повторно.

import { prisma } from '@/lib/prisma';
import { sendBotMessage } from '@/lib/telegram';
import { welcomeText, WELCOME_BUTTON } from '@/content/onboarding-t2';
import { trackContent } from '@/content/intake-tracks';
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
export async function sendWelcomeT2(telegramId: number): Promise<boolean> {
  if (await alreadyWelcomed(telegramId)) return false;

  const sent = await sendBotMessage(telegramId, welcomeText(), {
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
        metadata: { track: 't2' },
      },
    })
    .catch((e) => console.error('[onboarding] отметку welcome_sent записать не смог:', e));

  await startIntakeT2(telegramId);
  return true;
}

/**
 * Интервью сразу за приветствием: момент максимальной мотивации, человек только
 * что заплатил. Анкету заводим с треком t2, даже если тариф потом сменится:
 * вопросы должны остаться те, с которыми человек начал.
 */
async function startIntakeT2(telegramId: number): Promise<void> {
  try {
    const existing = await getIntake(telegramId);
    if (existing && existing.status !== 'invited') return;

    const intake = await ensureIntake(telegramId, undefined, undefined, undefined, 't2');
    await sendBotMessage(telegramId, withCount(trackContent(intake.track).invite, intakeTotal(intake)));
    await sendPreamble(telegramId, intake);
  } catch (e) {
    console.error('[onboarding] интервью не запустилось', telegramId, e);
  }
}
