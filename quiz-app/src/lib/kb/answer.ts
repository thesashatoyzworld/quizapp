// Два обращения к модели: выбрать материал по карте, потом ответить по его тексту.
//
// Первое обращение видит только оглавление (открытое тарифу спрашивающего),
// второе — текст одного выбранного материала. Модель не отвечает из общих
// знаний: не хватило текста — возвращает признак «ответа нет».

import Anthropic from '@anthropic-ai/sdk';
import { materialText, renderMap, type MapEntry } from './map';

const MODEL = process.env.KB_MODEL || 'claude-haiku-4-5';

const client = new Anthropic({ apiKey: (process.env.ANTHROPIC_API_KEY || '').trim() });

export interface KbAnswer {
  entry: MapEntry;
  text: string;
  /** название блока внутри материала, если модель смогла его назвать */
  block: string | null;
}

const SELECT_SYSTEM = `Ты подбираешь материал по оглавлению курса Саши Тойза.

Тебе дают оглавление и вопрос ученика. Верни ровно один материал, в котором
скорее всего лежит ответ, — в виде section и slug из квадратных скобок.

Если в оглавлении нет ничего подходящего, верни found=false. Лучше честно
сказать «нет», чем притянуть неподходящий материал: ученик получит ответ не по делу.`;

const ANSWER_SYSTEM = `Ты отвечаешь ученику Саши Тойза по его же материалам.

Правила:
- Ответ не длиннее трёх предложений. Без вводных вроде «конечно» и «отличный вопрос».
- Только то, что есть в переданном тексте. Ничего из общих знаний.
- Пиши тоном материалов: просто, на «ты», без канцелярита.
- Не называй имён участников разборов и созвонов и их цифры — только сам приём.
- Не обещай сроков, дат и цен: они меняются, и ты о них не знаешь.
- Если переданного текста не хватает на ответ, верни found=false и не выдумывай.
- Если можешь, назови блок внутри материала, где это лежит.`;

const SELECT_SCHEMA = {
  type: 'object',
  properties: {
    found: { type: 'boolean' },
    section: { type: 'string' },
    slug: { type: 'string' },
  },
  required: ['found', 'section', 'slug'],
  additionalProperties: false,
} as const;

const ANSWER_SCHEMA = {
  type: 'object',
  properties: {
    found: { type: 'boolean' },
    answer: { type: 'string' },
    block: { type: 'string' },
  },
  required: ['found', 'answer', 'block'],
  additionalProperties: false,
} as const;

function firstJson<T>(message: Anthropic.Message): T | null {
  for (const b of message.content) {
    if (b.type === 'text') {
      try {
        return JSON.parse(b.text) as T;
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** Шаг 1: выбрать материал по карте. */
export async function selectEntry(
  question: string,
  entries: MapEntry[],
): Promise<MapEntry | null> {
  if (!entries.length) return null;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: [
      {
        type: 'text',
        text: `${SELECT_SYSTEM}\n\nОГЛАВЛЕНИЕ:\n\n${renderMap(entries)}`,
        // Оглавление одинаковое для всех, кому открыт один набор разделов.
        cache_control: { type: 'ephemeral' },
      },
    ],
    output_config: { format: { type: 'json_schema', schema: SELECT_SCHEMA } },
    messages: [{ role: 'user', content: question }],
  });

  const picked = firstJson<{ found: boolean; section: string; slug: string }>(message);
  if (!picked?.found) return null;

  return entries.find((e) => e.section === picked.section && e.slug === picked.slug) ?? null;
}

/** Шаг 2: ответить по тексту выбранного материала. */
export async function answerFrom(
  question: string,
  entry: MapEntry,
): Promise<KbAnswer | null> {
  const text = materialText(entry);
  if (!text) return null;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: ANSWER_SYSTEM,
    output_config: { format: { type: 'json_schema', schema: ANSWER_SCHEMA } },
    messages: [
      {
        role: 'user',
        content: `МАТЕРИАЛ «${entry.title}»:\n\n${text}\n\n---\n\nВОПРОС УЧЕНИКА: ${question}`,
      },
    ],
  });

  const parsed = firstJson<{ found: boolean; answer: string; block: string }>(message);
  if (!parsed?.found || !parsed.answer.trim()) return null;

  return { entry, text: parsed.answer.trim(), block: parsed.block?.trim() || null };
}

/** Весь путь: вопрос → ответ с адресом, либо null, если ответа в материалах нет. */
export async function answerQuestion(
  question: string,
  entries: MapEntry[],
): Promise<KbAnswer | null> {
  const entry = await selectEntry(question, entries);
  if (!entry) return null;
  return answerFrom(question, entry);
}
