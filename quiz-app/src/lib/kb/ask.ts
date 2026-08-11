// Ветка «человек написал боту вопрос»: приём, лимиты, ответ, логи.
//
// Вызывается из telegram-webhook после анкеты тарифа 3 — если анкета
// сообщение не забрала, оно попадает сюда.

import { prisma } from '@/lib/prisma';
import { sendBotMessage } from '@/lib/telegram';
import { visibleTo } from './map';
import { tiersForTelegram } from './tier';
import { answerQuestion } from './answer';

const WEBAPP = (process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://world.thesashatoyz.com').replace(/\/$/, '');

/** Длиннее — просим сформулировать короче: это уже не вопрос, а история. */
const MAX_QUESTION = 500;
/** Больше двадцати вопросов в сутки — не человек учится, а кто-то жжёт токены. */
const MAX_PER_DAY = 20;

/** Похоже ли это на вопрос, а не на «спасибо» или пересланный файл. */
function looksLikeQuestion(text: string): boolean {
  const t = text.trim();
  if (t.length < 8) return false;
  if (/^(спасибо|спс|ок|окей|ага|да|нет|привет|здравствуйте|хорошо|понял|поняла)[!.…\s]*$/i.test(t)) return false;
  return true;
}

async function askedToday(telegramId: number): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return prisma.event.count({
    where: { type: 'kb_question', telegramId: BigInt(telegramId), createdAt: { gt: since } },
  });
}

// Индексная сигнатура нужна Prisma: колонка metadata это Json.
interface KbLog {
  [k: string]: string | number | boolean | undefined;
  question: string;
  tier: number;
  section?: string;
  slug?: string;
  answered?: boolean;
}

async function log(type: 'kb_question' | 'kb_gap', telegramId: number, metadata: KbLog) {
  try {
    await prisma.event.create({
      data: { type, telegramId: BigInt(telegramId), utmSource: 'kb', metadata },
    });
  } catch (e) {
    // Логи не должны ронять ответ человеку.
    console.error('[kb] log failed', e);
  }
}

export interface KbResult {
  handled: boolean;
}

export async function handleKbQuestion(params: {
  chatId: number;
  telegramId: number;
  text: string;
}): Promise<KbResult> {
  const { chatId, telegramId } = params;
  const question = params.text.trim();

  if (!looksLikeQuestion(question)) return { handled: false };

  if (question.length > MAX_QUESTION) {
    await sendBotMessage(
      chatId,
      'Слишком длинный вопрос — я не пойму, что именно искать. Сформулируй короче, одним предложением.',
      undefined,
      null,
    );
    return { handled: true };
  }

  const tiers = await tiersForTelegram(telegramId);
  const entries = visibleTo(tiers);

  if (!entries.length) {
    await sendBotMessage(
      chatId,
      'Я отвечаю по материалам «Нового уровня контента» — у тебя к ним пока нет доступа.',
      { inline_keyboard: [[{ text: 'Что это за курс', url: 'https://thesashatoyz.com/uroven' }]] },
      null,
    );
    return { handled: true };
  }

  if ((await askedToday(telegramId)) >= MAX_PER_DAY) {
    await sendBotMessage(
      chatId,
      'На сегодня хватит вопросов — возвращайся завтра. А пока лучше сделай то, что уже разобрали.',
      undefined,
      null,
    );
    return { handled: true };
  }

  // Два обращения к модели занимают 4-6 секунд: показываем, что ищем.
  await sendBotMessage(chatId, 'Ищу в материалах…', undefined, null);

  let answer;
  try {
    answer = await answerQuestion(question, entries);
  } catch (e) {
    console.error('[kb] answer failed', e);
    await sendBotMessage(chatId, 'Не смог посмотреть материалы, попробуй ещё раз через минуту.', undefined, null);
    return { handled: true };
  }

  if (!answer) {
    await log('kb_gap', telegramId, { question, tier: tiers.uroven ?? 0 });
    await sendBotMessage(
      chatId,
      'Этого в материалах нет. Спроси иначе или задай вопрос Саше на групповом созвоне.',
      undefined,
      null,
    );
    return { handled: true };
  }

  const where = answer.block ? `${answer.entry.title} → ${answer.block}` : answer.entry.title;
  const text = `${answer.text}\n\nЭто здесь: ${where}`;

  // Курс, разборы и созвоны открывают материал сразу по ?open=<slug>.
  // В промптах, «Потоке» и «Формуле» открывать нечего — ведём в раздел.
  const deepLink = ['kurs', 'razbory', 'sozvony'].includes(answer.entry.section)
    ? `${WEBAPP}${answer.entry.path}?open=${encodeURIComponent(answer.entry.slug)}`
    : `${WEBAPP}${answer.entry.path}`;

  await sendBotMessage(
    chatId,
    text,
    { inline_keyboard: [[{ text: 'Открыть в кабинете', web_app: { url: deepLink } }]] },
    null,
  );

  await log('kb_question', telegramId, {
    question,
    section: answer.entry.section,
    slug: answer.entry.slug,
    tier: tiers.uroven ?? 0,
    answered: true,
  });

  return { handled: true };
}
