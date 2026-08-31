// Анкета: бот собирает вводные в личке. Два трека, механика одна.
//   t3 — досье до первого созвона 1-1 на менторстве, 11 вопросов;
//   t2 — вводные под маршрут по материалам на месяц, 6 вопросов.
//
// Поверх треков есть личная анкета: когда Саша уже созвонился с человеком,
// переспрашивать то, что прозвучало на созвоне, глупо. Тогда в строке анкеты
// лежат свои вопросы (custom_questions), и трек остаётся только для реплик бота.
//
// Вся логика живёт здесь, вебхук только зовёт функции: route.ts уже 874 строки.
// Тексты вопросов — в src/content/intake-tarif{2,3}.ts, раскладка по трекам
// в src/content/intake-tracks.ts.

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
  INTAKE_EXTRA_INTRO,
} from '@/content/intake-tarif3';
import { T2_PRODUCT_SLUG } from '@/content/intake-tarif2';
import { trackContent, type IntakeTrack } from '@/content/intake-tracks';
import type { IntakeQuestion } from '@/content/intake-tarif3';
import { scheduleIntakeReminder } from '@/lib/qstash';
import { randomBytes } from 'crypto';

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
  // Пусто у анкеты, выданной ссылкой вслепую: человека, который ни разу не
  // заходил в бота, мы по telegram_id не знаем до его первого перехода.
  telegramId: bigint | null;
  username: string | null;
  firstName: string | null;
  label?: string | null;
  status: string;
  /** t2 | t3, см. content/intake-tracks.ts. У анкет до появления треков — t3. */
  track?: string | null;
  /** Личные вопросы под этого человека. Пусто = вопросы трека. */
  customQuestions?: unknown;
  currentStep: number;
  inviteToken: string | null;
};

// ─────────────────────────────────────────────
// Личная анкета
// ─────────────────────────────────────────────

/** Что лежит в custom_questions: свои вопросы и, по желанию, своя преамбула. */
export interface CustomIntake {
  preamble?: string;
  questions: IntakeQuestion[];
}

/**
 * Разбор личных вопросов из базы. Строку туда кладёт скрипт, а не человек
 * руками, но анкета на середине ломаться не должна: кривой json = вопросы трека.
 */
export function parseCustomIntake(raw: unknown): CustomIntake | null {
  if (!raw || typeof raw !== 'object') return null;

  const list = (raw as { questions?: unknown }).questions;
  if (!Array.isArray(list) || list.length === 0) return null;

  const questions: IntakeQuestion[] = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') return null;
    const { title, body } = item as { title?: unknown; body?: unknown };
    if (typeof title !== 'string' || typeof body !== 'string' || !title || !body) return null;
    questions.push({ title, body });
  }

  const preamble = (raw as { preamble?: unknown }).preamble;
  return { questions, preamble: typeof preamble === 'string' && preamble ? preamble : undefined };
}

/** Вопросы этой анкеты: личные, если они есть, иначе вопросы трека. */
export function intakeQuestions(intake: Pick<IntakeRow, 'track' | 'customQuestions'>): IntakeQuestion[] {
  return parseCustomIntake(intake.customQuestions)?.questions ?? trackContent(intake.track).questions;
}

/** Сколько всего вопросов в этой анкете. */
export function intakeTotal(intake: Pick<IntakeRow, 'track' | 'customQuestions'>): number {
  return intakeQuestions(intake).length;
}

/**
 * Преамбула обещает количество вопросов, и у личной анкеты оно другое.
 * Число в текстах треков стоит как {n}, подставляем перед отправкой.
 */
export function withCount(text: string, total: number): string {
  return text.replaceAll('{n}', String(total));
}

// ─────────────────────────────────────────────
// Доступ
// ─────────────────────────────────────────────

/** Активный тариф 3. Гейт для приглашения из вебхука оплаты. */
export async function hasTarif3Access(telegramId: number | bigint): Promise<boolean> {
  return (await resolveTrack(telegramId)) === 't3';
}

/**
 * Какой набор вопросов положен человеку по его доступам. Тариф 3 старше:
 * у кого он есть, тот идёт на менторскую анкету, даже если рядом висит t2
 * (так вышло у тех, кто доплачивал с тарифа на тариф).
 * null = анкета ему вообще не полагается.
 */
export async function resolveTrack(telegramId: number | bigint): Promise<IntakeTrack | null> {
  const rows = await prisma.productAccess.findMany({
    where: {
      telegramId: BigInt(telegramId),
      role: INTAKE_ROLE,
      productSlug: { in: [INTAKE_PRODUCT_SLUG, T2_PRODUCT_SLUG] },
      status: 'active',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { productSlug: true },
  });

  if (rows.some((r) => r.productSlug === INTAKE_PRODUCT_SLUG)) return 't3';
  if (rows.some((r) => r.productSlug === T2_PRODUCT_SLUG)) return 't2';
  return null;
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

/**
 * Первый переход по ссылке, выданной вслепую: узнаём, кто это, и привязываем.
 * Если у человека уже есть своя анкета — отдаём её, а пустую закрываем,
 * иначе на один telegram_id получилось бы две.
 */
export async function claimBlindIntake(
  intake: IntakeRow,
  telegramId: number,
  username?: string | null,
  firstName?: string | null,
): Promise<IntakeRow> {
  if (intake.telegramId !== null) return intake;

  const own = await prisma.intake.findUnique({ where: { telegramId: BigInt(telegramId) } });
  if (own) {
    await prisma.intake.update({
      where: { id: intake.id },
      data: { status: 'superseded', inviteToken: null },
    });
    return own;
  }

  return prisma.intake.update({
    where: { id: intake.id },
    data: {
      telegramId: BigInt(telegramId),
      username: username || null,
      firstName: firstName || null,
    },
  });
}

/** Одна анкета на человека: повторный вызов возвращает существующую. */
export async function ensureIntake(
  telegramId: number | bigint,
  username?: string | null,
  firstName?: string | null,
  inviteToken?: string,
  track?: IntakeTrack,
): Promise<IntakeRow> {
  const tg = BigInt(telegramId);
  const existing = await prisma.intake.findUnique({ where: { telegramId: tg } });
  if (existing) return existing;

  const created = await prisma.intake.create({
    data: {
      telegramId: tg,
      username: username || null,
      firstName: firstName || null,
      status: 'invited',
      ...(track ? { track } : {}),
      ...(inviteToken ? { inviteToken } : {}),
    },
  });

  // Одно напоминание через сутки. Успеет закончить — обработчик сам пропустит.
  await scheduleIntakeReminder(created.id);

  return created;
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

/** Преамбула с просьбами и кнопкой «погнали». */
export async function sendPreamble(
  chatId: number,
  intake?: Pick<IntakeRow, 'track' | 'customQuestions'> | null,
): Promise<void> {
  const custom = parseCustomIntake(intake?.customQuestions);
  const total = custom?.questions.length ?? trackContent(intake?.track).total;
  const text = custom?.preamble ?? trackContent(intake?.track).preamble;

  await sendBotMessage(chatId, withCount(text, total), {
    inline_keyboard: [[{ text: INTAKE_TEXTS.startButton, callback_data: INTAKE_CB.start }]],
  });
}

export async function sendCurrentQuestion(intake: IntakeRow, chatId: number): Promise<void> {
  const questions = intakeQuestions(intake);
  const step = intake.currentStep;
  if (step >= questions.length) {
    await finishIntake(intake, chatId);
    return;
  }

  const q = questions[step];
  const text = `вопрос ${step + 1} из ${questions.length}\n\n*${q.title}*\n\n${q.body}`;
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

  if (next >= intakeTotal(intake)) {
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

  await sendBotMessage(chatId, trackContent(intake.track).texts.finished);
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
// Команды Саши
// ─────────────────────────────────────────────

/** Принимает @username, username или telegram_id. */
async function resolveTarget(arg: string) {
  const raw = arg.trim().replace(/^@/, '');
  if (!raw) return null;

  if (/^\d+$/.test(raw)) {
    const byId = await prisma.user.findUnique({ where: { telegramId: BigInt(raw) } });
    return byId ?? { telegramId: BigInt(raw), username: null, firstName: null };
  }

  return prisma.user.findFirst({
    where: { username: { equals: raw, mode: 'insensitive' } },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * `/anketa_send @username` — бот пишет человеку сам.
 * Работает только если человек когда-либо начинал диалог с ботом:
 * первым Telegram написать не даёт. Не вышло — отдаём ссылку.
 */
export async function adminSendInvite(arg: string): Promise<string> {
  const target = await resolveTarget(arg);
  if (!target) return `не нашёл ${arg} в базе. дай telegram_id числом или используй /anketa_link`;

  const tg = Number(target.telegramId);
  const track = await resolveTrack(tg);

  const intake = await ensureIntake(tg, target.username, target.firstName, undefined, track ?? undefined);
  if (intake.status === 'done') return `у ${arg} анкета уже собрана`;
  if (intake.status === 'in_progress') return `${arg} уже проходит, сейчас на вопросе ${intake.currentStep + 1}`;

  const sent = await sendBotMessage(tg, withCount(trackContent(intake.track).invite, intakeTotal(intake)));
  if (!sent.ok) {
    const link = await adminCreateLink(arg);
    return `бот не смог написать ${arg} (не начинал диалог или заблокировал).\n\n${link}`;
  }

  await sendPreamble(tg, intake);

  const warn = track ? '' : '\n\n⚠ активного тарифа в базе у него нет, приглашение всё равно ушло';
  return `приглашение отправлено ${arg} (анкета ${intakeTotal(intake)} вопросов)${warn}`;
}

/**
 * `/anketa_link @username` — персональная ссылка.
 *
 * Работает и вслепую: человека, который ни разу не заходил в бота, мы по
 * telegram_id не знаем, и Telegram по юзернейму его не отдаёт. Тогда анкета
 * заводится пустой, а привязка происходит при первом переходе по ссылке.
 * Ровно поэтому ссылку нельзя пересылать: досье достанется тому, кто открыл.
 */
export async function adminCreateLink(arg: string): Promise<string> {
  const target = await resolveTarget(arg);
  const bot = process.env.BOT_USERNAME || 'testtoyzbot';
  const link = (t: string) => `https://t.me/${bot}?start=intake_${t}`;

  // Человека знаем: ссылка привязана к его telegram_id.
  if (target) {
    const tg = Number(target.telegramId);
    const existing = await prisma.intake.findUnique({ where: { telegramId: BigInt(tg) } });
    if (existing?.inviteToken) return link(existing.inviteToken);

    const token = randomBytes(9).toString('base64url');
    if (existing) {
      await prisma.intake.update({ where: { id: existing.id }, data: { inviteToken: token } });
    } else {
      await ensureIntake(tg, target.username, target.firstName, token);
    }
    return link(token);
  }

  // Не знаем: заводим анкету без telegram_id, метим именем.
  const label = arg.trim();
  const blind = await prisma.intake.findFirst({
    where: { telegramId: null, label, status: 'invited' },
    orderBy: { invitedAt: 'desc' },
  });
  if (blind?.inviteToken) {
    return `${link(blind.inviteToken)}\n\n(${label} в боте не был, ссылка уже выдавалась. привяжется к тому, кто по ней перейдёт, пересылать нельзя)`;
  }

  const token = randomBytes(9).toString('base64url');
  const created = await prisma.intake.create({
    data: { label, status: 'invited', inviteToken: token },
  });
  await scheduleIntakeReminder(created.id);

  return `${link(token)}\n\n(${label} в боте не был. анкета привяжется к тому, кто по ссылке перейдёт, поэтому пересылать её нельзя)`;
}

/** `/anketa_add @username <вопрос>` — добить персонально после сбора анкеты. */
export async function adminAddQuestion(arg: string, question: string): Promise<string> {
  const target = await resolveTarget(arg);
  if (!target) return `не нашёл ${arg} в базе`;

  const tg = Number(target.telegramId);
  const intake = await prisma.intake.findUnique({ where: { telegramId: BigInt(tg) } });
  if (!intake) return `у ${arg} анкеты нет, сначала /anketa_send`;

  await prisma.intakeAnswer.create({
    data: { intakeId: intake.id, step: EXTRA_STEP, kind: 'question', extraQuestion: question },
  });

  const sent = await sendBotMessage(tg, `${INTAKE_EXTRA_INTRO}\n\n${question}`);
  return sent.ok ? `вопрос ушёл ${arg}` : `не смог написать ${arg}`;
}

/** `/anketa_list` — кто на каком месте. */
export async function adminList(): Promise<string> {
  const all = await prisma.intake.findMany({
    where: { status: { not: 'superseded' } },
    orderBy: { invitedAt: 'desc' },
    take: 20,
  });
  if (!all.length) return 'анкет пока нет';

  const lines = all.map((i) => {
    const who = i.username ? '@' + i.username
      : i.firstName || i.label || (i.telegramId !== null ? String(i.telegramId) : 'без имени');
    if (i.status === 'done') return `✅ ${who} — собрана`;
    if (i.status === 'in_progress') return `⏳ ${who} — вопрос ${i.currentStep + 1} из ${intakeTotal(i)}`;
    if (i.telegramId === null) return `🔗 ${who} — ссылка выдана, ещё не открывал`;
    return `📨 ${who} — приглашён, не начал`;
  });

  return lines.join('\n');
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

  const who = intake.username ? '@' + intake.username
    : intake.firstName || intake.label || String(intake.telegramId ?? 'без имени');
  const base = (process.env.NEXT_PUBLIC_CABINET_URL || 'https://world.thesashatoyz.com').replace(/\/$/, '');

  // Тариф 2 ждёт маршрутную карту, тариф 3 — созвон. Разное следующее действие,
  // поэтому оно и написано прямо в уведомлении.
  const isRoute = trackContent(intake.track).productSlug === T2_PRODUCT_SLUG;
  const next = isRoute
    ? '\n\nдальше: собрать маршрутную карту по материалам'
    : '';

  await notifyAdmin(
    `📋 <b>Анкета собрана</b> (${isRoute ? 'тариф 2' : 'менторство'})\n\n` +
      `👤 ${who}\n` +
      `🎙 голосовых: ${voices}${minutes ? ` (~${minutes} мин)` : ''}\n` +
      `⏭ пропущено вопросов: ${skipped}\n\n` +
      `<a href="${base}/admin/anketa/${intake.id}">открыть досье</a>` +
      next,
    { alsoWork: true, disableLinkPreview: true },
  );
}
