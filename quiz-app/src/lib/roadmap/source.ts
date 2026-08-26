// Вход для сборки маршрутной карты: анкета человека и оглавление материалов.
//
// Собирается ровно тот же материал, из которого карта собиралась руками:
// расшифровки ответов по вопросам плюс список того, что человеку открыто
// по его тарифу. Ничего из общих знаний модели сюда не попадает.

import { prisma } from '@/lib/prisma';
import { trackContent } from '@/content/intake-tracks';
import { renderMap, visibleTo, type MapEntry } from '@/lib/kb/map';
import { tiersForTelegram } from '@/lib/kb/tier';
import { transcribeTgVoice } from '@/lib/whisper';

const WEBAPP = (process.env.NEXT_PUBLIC_CABINET_URL || 'https://world.thesashatoyz.com').replace(/\/$/, '');
const WORKSHOPS_HOST = 'https://kabinet.thesashatoyz.com';

export interface RoadmapSource {
  intakeId: string;
  telegramId: number | null;
  username: string | null;
  firstName: string | null;
  track: string;
  /** анкета целиком: вопрос, затем ответы человека по порядку */
  transcript: string;
  /** оглавление открытых ему материалов для промпта */
  catalog: string;
  /** те же материалы объектами: по ним строятся ссылки в задачах */
  entries: MapEntry[];
}

/**
 * Ссылка на материал. Собирается кодом, а не моделью: модель называет только
 * `section/slug`, всё остальное здесь. Правило повторяет кнопку бота по
 * материалам (lib/kb/ask.ts): курс, разборы и созвоны открываются сразу
 * по `?open=`, воркшопы живут на своём домене и опознают человека по `?tg=`.
 */
export function materialUrl(entry: MapEntry, telegramId: number | null): string {
  if (entry.external) {
    return `${WORKSHOPS_HOST}${entry.path}${telegramId ? `?tg=${telegramId}` : ''}`;
  }
  return ['kurs', 'razbory', 'sozvony'].includes(entry.section)
    ? `${WEBAPP}${entry.path}?open=${encodeURIComponent(entry.slug)}`
    : `${WEBAPP}${entry.path}`;
}

/** Ответы человека на один вопрос, склеенные в текст. Голосовые идут расшифровками. */
function answerText(answers: { kind: string; rawText: string | null; transcript: string | null; skipped: boolean; durationSec: number | null }[]): string {
  if (answers.length === 0) return '(без ответа)';
  if (answers.every((a) => a.skipped)) return '(пропустил)';

  return answers
    .map((a) => {
      if (a.skipped) return null;
      const body = (a.transcript || a.rawText || '').trim();
      if (!body) {
        // Фото и документы в карту не идут, но их наличие само по себе факт.
        return `(${a.kind}, без текста)`;
      }
      const mark = a.kind === 'voice' ? `голосовое${a.durationSec ? ` ${Math.round(a.durationSec / 60)} мин` : ''}: ` : '';
      return mark + body;
    })
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Добор расшифровок перед сборкой.
 *
 * Бот мог не справиться в момент ответа: кончились кредиты, моргнула сеть.
 * Тогда карта собралась бы из пустоты, что и случилось у Михаила Коробицына
 * 26.08.2026. Вторая попытка стоит секунды, а пустая карта стоит доверия.
 */
export async function fillMissingTranscripts(
  intakeId: string,
): Promise<{ filled: number; failed: number; skipped: number }> {
  const pending = await prisma.intakeAnswer.findMany({
    where: { intakeId, kind: 'voice', transcript: null, fileId: { not: null }, skipped: false },
    orderBy: { step: 'asc' },
    take: 20,
    select: { id: true, fileId: true, step: true, createdAt: true },
  });

  // У анкет до 25.08.2026 расшифровка лежит не в самом голосовом, а парным
  // текстовым ответом следом (так у Ани и у Лекомцева). Такие не добираем:
  // ответ удвоится, и модель прочитает его дважды.
  const texts = await prisma.intakeAnswer.findMany({
    where: { intakeId, kind: 'text' },
    select: { step: true, createdAt: true },
  });
  const hasPairedText = (step: number, at: Date) =>
    texts.some(
      (t) =>
        t.step === step &&
        t.createdAt.getTime() >= at.getTime() &&
        t.createdAt.getTime() - at.getTime() < 5 * 60 * 1000,
    );

  let filled = 0;
  let failed = 0;
  let skipped = 0;

  for (const answer of pending) {
    if (hasPairedText(answer.step, answer.createdAt)) {
      skipped += 1;
      continue;
    }

    try {
      const text = await transcribeTgVoice(answer.fileId as string);
      await prisma.intakeAnswer.update({
        where: { id: answer.id },
        data: { transcript: text, transcriptStatus: 'ok' },
      });
      filled += 1;
    } catch (error) {
      console.error('roadmap: retry transcription failed', answer.id, error);
      await prisma.intakeAnswer.update({
        where: { id: answer.id },
        data: { transcriptStatus: 'failed' },
      });
      failed += 1;
    }
  }

  return { filled, failed, skipped };
}

/**
 * Анкета текстом. Формат тот же, в котором анкеты читались глазами:
 * заголовок вопроса, сам вопрос курсивом, ниже ответ.
 */
export async function buildSource(intakeId: string): Promise<RoadmapSource> {
  const retried = await fillMissingTranscripts(intakeId);
  if (retried.filled) console.log(`roadmap: добрал ${retried.filled} расшифровок`);
  if (retried.skipped) console.log(`roadmap: ${retried.skipped} голосовых пропустил, расшифровка лежит парным текстом`);
  if (retried.failed) console.warn(`roadmap: ${retried.failed} голосовых остались без расшифровки`);

  const intake = await prisma.intake.findUnique({
    where: { id: intakeId },
    include: { answers: { orderBy: { createdAt: 'asc' } } },
  });
  if (!intake) throw new Error(`анкета ${intakeId} не найдена`);

  const questions = trackContent(intake.track).questions;
  const parts: string[] = [];

  questions.forEach((q, i) => {
    const own = intake.answers.filter((a) => a.step === i);
    parts.push(`## ${i + 1}. ${q.title}\n\n> ${q.body}\n\n${answerText(own)}`);
  });

  // Добивающие вопросы Саши после сбора анкеты лежат под шагом -1.
  const extra = intake.answers.filter((a) => a.step === -1);
  for (const a of extra) {
    parts.push(`## добивающий вопрос Саши\n\n> ${a.extraQuestion || ''}\n\n${answerText([a])}`);
  }

  const telegramId = intake.telegramId ? Number(intake.telegramId) : null;

  // Без telegram id доступы не поднять: берём базовый набор тарифа 2.
  const tiers = telegramId ? await tiersForTelegram(telegramId) : { uroven: 2 };
  const entries = visibleTo(tiers);

  return {
    intakeId: intake.id,
    telegramId,
    username: intake.username,
    firstName: intake.firstName || intake.label,
    track: intake.track,
    transcript: parts.join('\n\n'),
    catalog: renderMap(entries),
    entries,
  };
}
