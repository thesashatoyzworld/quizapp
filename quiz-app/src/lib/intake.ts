// Анкета тарифа 3: бот собирает досье в личке до первого созвона 1-1.
//
// Вся логика живёт здесь, вебхук только зовёт функции: route.ts уже 874 строки.
// Тексты вопросов — в src/content/intake-tarif3.ts.

import { prisma } from '@/lib/prisma';
import { sendBotMessage, notifyAdmin } from '@/lib/telegram';
import { transcribeTgVoice, TG_FILE_LIMIT_BYTES } from '@/lib/whisper';
import {
  INTAKE_PREAMBLE,
  INTAKE_QUESTIONS,
  INTAKE_TEXTS,
  INTAKE_TOTAL,
  INTAKE_PRODUCT_SLUG,
  INTAKE_ROLE,
} from '@/content/intake-tarif3';

export const INTAKE_CB = {
  start: 'intake:start',
  next: 'intake:next',
  skip: 'intake:skip',
  later: 'intake:later',
} as const;

/** Добивающий вопрос Саши лежит в тех же ответах со step = -1. */
export const EXTRA_STEP = -1;

type IntakeRow = {
  id: string;
  telegramId: bigint;
  username: string | null;
  firstName: string | null;
  status: string;
  currentStep: number;
  inviteToken: string | null;
};

// ─────────────────────────────────────────────
// Доступ
// ─────────────────────────────────────────────

/** Активный тариф 3. Гейт для /anketa и для приглашения из вебхука оплаты. */
export async function hasTarif3Access(telegramId: number | bigint): Promise<boolean> {
  const access = await prisma.productAccess.findFirst({
    where: {
      telegramId: BigInt(telegramId),
      role: INTAKE_ROLE,
      productSlug: INTAKE_PRODUCT_SLUG,
      status: 'active',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });
  return Boolean(access);
}

/**
 * Юзернеймы в базе протухают: у Дарьи лежал dariya_basina, а реальный хендл
 * dariya_basinaa. Она сменила его после захода, а мы не обновляли.
 * Без этого досье будет ссылаться на мёртвый хендл.
 */
export async function syncUsername(
  telegramId: number | bigint,
  username?: string | null,
  firstName?: string | null,
): Promise<void> {
  if (!username && !firstName) return;
  const tg = BigInt(telegramId);

  await prisma.user
    .updateMany({
      where: { telegramId: tg },
      data: {
        ...(username ? { username } : {}),
        ...(firstName ? { firstName } : {}),
      },
    })
    .catch(() => {});

  await prisma.intake
    .updateMany({
      where: { telegramId: tg },
      data: {
        ...(username ? { username } : {}),
        ...(firstName ? { firstName } : {}),
      },
    })
    .catch(() => {});
}

// ─────────────────────────────────────────────
// Жизненный цикл анкеты
// ─────────────────────────────────────────────

export async function getIntake(telegramId: number | bigint): Promise<IntakeRow | null> {
  return prisma.intake.findUnique({ where: { telegramId: BigInt(telegramId) } });
}

/** Одна анкета на человека: повторный вызов возвращает существующую. */
export async function ensureIntake(
  telegramId: number | bigint,
  username?: string | null,
  firstName?: string | null,
  inviteToken?: string,
): Promise<IntakeRow> {
  const tg = BigInt(telegramId);
  const existing = await prisma.intake.findUnique({ where: { telegramId: tg } });
  if (existing) return existing;

  return prisma.intake.create({
    data: {
      telegramId: tg,
      username: username || null,
      firstName: firstName || null,
      status: 'invited',
      ...(inviteToken ? { inviteToken } : {}),
    },
  });
}

function questionKeyboard() {
  return {
    inline_keyboard: [
      [{ text: INTAKE_TEXTS.next, callback_data: INTAKE_CB.next }],
      [
        { text: INTAKE_TEXTS.skip, callback_data: INTAKE_CB.skip },
        { text: INTAKE_TEXTS.later, callback_data: INTAKE_CB.later },
      ],
    ],
  };
}

/** Преамбула с тремя просьбами и кнопкой «погнали». */
export async function sendPreamble(chatId: number): Promise<void> {
  await sendBotMessage(chatId, INTAKE_PREAMBLE, {
    inline_keyboard: [[{ text: INTAKE_TEXTS.startButton, callback_data: INTAKE_CB.start }]],
  });
}

export async function sendCurrentQuestion(intake: IntakeRow, chatId: number): Promise<void> {
  const step = intake.currentStep;
  if (step >= INTAKE_TOTAL) {
    await finishIntake(intake, chatId);
    return;
  }

  const q = INTAKE_QUESTIONS[step];
  const text = `${INTAKE_TEXTS.counter(step)}\n\n*${q.title}*\n\n${q.body}`;
  await sendBotMessage(chatId, text, questionKeyboard());
}

/** Кнопка «погнали»: переводит анкету в работу и выдаёт первый вопрос. */
export async function beginIntake(intake: IntakeRow, chatId: number): Promise<void> {
  const updated = await prisma.intake.update({
    where: { id: intake.id },
    data: {
      status: 'in_progress',
      startedAt: intake.status === 'invited' ? new Date() : undefined,
    },
  });
  await sendCurrentQuestion(updated, chatId);
}

/**
 * «дальше →». Не пускаем вперёд с пустого вопроса: иначе анкету прощёлкивают
 * за десять секунд и досье оказывается пустым.
 */
export async function advanceIntake(intake: IntakeRow, chatId: number): Promise<void> {
  const answered = await prisma.intakeAnswer.count({
    where: { intakeId: intake.id, step: intake.currentStep },
  });

  if (answered === 0) {
    await sendBotMessage(
      chatId,
      'на этот вопрос ещё нет ответа. ответь голосом или текстом, либо жми «пропустить»',
      questionKeyboard(),
    );
    return;
  }

  await moveToNextStep(intake, chatId);
}

export async function skipStep(intake: IntakeRow, chatId: number): Promise<void> {
  await prisma.intakeAnswer.create({
    data: { intakeId: intake.id, step: intake.currentStep, kind: 'text', skipped: true },
  });
  await sendBotMessage(chatId, INTAKE_TEXTS.skipped);
  await moveToNextStep(intake, chatId);
}

async function moveToNextStep(intake: IntakeRow, chatId: number): Promise<void> {
  const next = intake.currentStep + 1;

  if (next >= INTAKE_TOTAL) {
    const done = await prisma.intake.update({
      where: { id: intake.id },
      data: { currentStep: next },
    });
    await finishIntake(done, chatId);
    return;
  }

  const updated = await prisma.intake.update({
    where: { id: intake.id },
    data: { currentStep: next },
  });
  await sendCurrentQuestion(updated, chatId);
}

export async function pauseIntake(intake: IntakeRow, chatId: number): Promise<void> {
  await prisma.intake.update({ where: { id: intake.id }, data: { status: 'in_progress' } });
  await sendBotMessage(chatId, INTAKE_TEXTS.laterBye);
}

async function finishIntake(intake: IntakeRow, chatId: number): Promise<void> {
  await prisma.intake.update({
    where: { id: intake.id },
    data: { status: 'done', completedAt: new Date() },
  });

  await sendBotMessage(chatId, INTAKE_TEXTS.finished);
  await notifyIntakeDone(intake.id);
}

// ─────────────────────────────────────────────
// Приём ответов
// ─────────────────────────────────────────────

export interface IncomingMessage {
  chatId: number;
  telegramId: number;
  username?: string | null;
  firstName?: string | null;
  text?: string;
  voice?: { file_id: string; duration?: number; file_size?: number };
  photo?: { file_id: string }[];
  document?: { file_id: string; file_name?: string };
  videoNote?: { file_id: string; duration?: number };
}

/**
 * Сообщение во время анкеты. Возвращает true, если сообщение съедено анкетой
 * и вебхуку дальше делать нечего.
 *
 * Расшифровку голосового вызывающий запускает отдельно через transcribePending
 * в after(): Whisper дольше, чем можно держать вебхук.
 */
export async function handleIntakeMessage(
  msg: IncomingMessage,
): Promise<{ handled: boolean; transcribeAnswerId?: string }> {
  const intake = await getIntake(msg.telegramId);
  if (!intake) return { handled: false };

  // Анкета собрана: человек просто пишет Саше, не мешаем.
  if (intake.status === 'done') {
    const extra = await hasOpenExtraQuestion(intake.id);
    if (!extra) return { handled: false };
    return saveAnswer(intake, msg, EXTRA_STEP, extra.extraQuestion);
  }

  if (intake.status !== 'in_progress') return { handled: false };

  return saveAnswer(intake, msg, intake.currentStep);
}

async function hasOpenExtraQuestion(intakeId: string) {
  // Последний добивающий вопрос Саши без ответа после него.
  const last = await prisma.intakeAnswer.findFirst({
    where: { intakeId, step: EXTRA_STEP, extraQuestion: { not: null }, kind: 'question' },
    orderBy: { createdAt: 'desc' },
  });
  if (!last) return null;

  const answeredAfter = await prisma.intakeAnswer.count({
    where: { intakeId, step: EXTRA_STEP, kind: { not: 'question' }, createdAt: { gt: last.createdAt } },
  });
  return answeredAfter > 0 ? null : last;
}

async function saveAnswer(
  intake: IntakeRow,
  msg: IncomingMessage,
  step: number,
  extraQuestion?: string | null,
): Promise<{ handled: boolean; transcribeAnswerId?: string }> {
  const base = {
    intakeId: intake.id,
    step,
    ...(extraQuestion ? { extraQuestion } : {}),
  };

  // Голосовое
  if (msg.voice) {
    if ((msg.voice.file_size || 0) > TG_FILE_LIMIT_BYTES) {
      await sendBotMessage(msg.chatId, INTAKE_TEXTS.voiceTooBig, questionKeyboard());
      return { handled: true };
    }

    const answer = await prisma.intakeAnswer.create({
      data: {
        ...base,
        kind: 'voice',
        fileId: msg.voice.file_id,
        durationSec: msg.voice.duration ?? null,
      },
    });

    await sendBotMessage(msg.chatId, INTAKE_TEXTS.voiceReceived, questionKeyboard());
    return { handled: true, transcribeAnswerId: answer.id };
  }

  // Кружок: расшифровку не пробуем, кладём ссылкой
  if (msg.videoNote) {
    await prisma.intakeAnswer.create({
      data: {
        ...base,
        kind: 'video_note',
        fileId: msg.videoNote.file_id,
        durationSec: msg.videoNote.duration ?? null,
      },
    });
    await sendBotMessage(msg.chatId, INTAKE_TEXTS.saved, questionKeyboard());
    return { handled: true };
  }

  if (msg.photo?.length) {
    // Телеграм шлёт лесенку размеров, берём самый большой.
    const biggest = msg.photo[msg.photo.length - 1];
    await prisma.intakeAnswer.create({
      data: { ...base, kind: 'photo', fileId: biggest.file_id, rawText: msg.text || null },
    });
    await sendBotMessage(msg.chatId, INTAKE_TEXTS.saved, questionKeyboard());
    return { handled: true };
  }

  if (msg.document) {
    await prisma.intakeAnswer.create({
      data: {
        ...base,
        kind: 'document',
        fileId: msg.document.file_id,
        rawText: msg.document.file_name || null,
      },
    });
    await sendBotMessage(msg.chatId, INTAKE_TEXTS.saved, questionKeyboard());
    return { handled: true };
  }

  if (msg.text) {
    await prisma.intakeAnswer.create({ data: { ...base, kind: 'text', rawText: msg.text } });
    await sendBotMessage(msg.chatId, INTAKE_TEXTS.saved, questionKeyboard());
    return { handled: true };
  }

  return { handled: false };
}

/**
 * Расшифровка голосового. Запускается в after() после ответа Telegram.
 * Упала — ответ не теряется: остаётся fileId, Саша послушает сам.
 */
export async function transcribePending(answerId: string, chatId: number): Promise<void> {
  const answer = await prisma.intakeAnswer.findUnique({ where: { id: answerId } });
  if (!answer?.fileId) return;

  try {
    const text = await transcribeTgVoice(answer.fileId);
    await prisma.intakeAnswer.update({ where: { id: answerId }, data: { transcript: text } });
  } catch (error) {
    console.error('intake: whisper failed', answerId, error);
    await sendBotMessage(chatId, INTAKE_TEXTS.voiceFailed);
  }
}

// ─────────────────────────────────────────────
// Уведомление Саше
// ─────────────────────────────────────────────

async function notifyIntakeDone(intakeId: string): Promise<void> {
  const intake = await prisma.intake.findUnique({
    where: { id: intakeId },
    include: { answers: true },
  });
  if (!intake) return;

  const voices = intake.answers.filter((a) => a.kind === 'voice').length;
  const skipped = intake.answers.filter((a) => a.skipped).length;
  const minutes = Math.round(
    intake.answers.reduce((sum, a) => sum + (a.durationSec || 0), 0) / 60,
  );

  const who = intake.username ? '@' + intake.username : intake.firstName || String(intake.telegramId);
  const base = process.env.NEXT_PUBLIC_CABINET_URL || 'https://world.thesashatoyz.com';

  await notifyAdmin(
    `📋 <b>Анкета собрана</b>\n\n` +
      `👤 ${who}\n` +
      `🎙 голосовых: ${voices}${minutes ? ` (~${minutes} мин)` : ''}\n` +
      `⏭ пропущено вопросов: ${skipped}\n\n` +
      `<a href="${base}/api/intake/${intake.id}">открыть досье</a>`,
  );
}
