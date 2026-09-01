// Два обращения к модели: выбрать материал по карте, потом ответить по его тексту.
//
// Первое обращение видит только оглавление (открытое тарифу спрашивающего),
// второе — текст одного выбранного материала. Модель не отвечает из общих
// знаний: не хватило текста — возвращает признак «ответа нет».

import Anthropic from '@anthropic-ai/sdk';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';
import { materialText, renderMap, textAround, type MapEntry } from './map';

const MODEL = process.env.KB_MODEL || 'claude-haiku-4-5';

// Клиент создаётся при первом вопросе, а не при импорте модуля: иначе ключ
// читается раньше, чем окружение успевает подняться.
let client: Anthropic | null = null;

function anthropic(): Anthropic {
  if (!client) {
    const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
    client = new Anthropic({ apiKey });
  }
  return client;
}

export interface KbAnswer {
  entry: MapEntry;
  text: string;
  /** название блока внутри материала, если модель смогла его назвать */
  block: string | null;
}

/**
 * Кэш на час, а не на пять минут по умолчанию.
 *
 * Оглавление и текст материала — большие неизменные куски, которые едут в
 * каждом вопросе. Запись в часовой кэш стоит вдвое против обычной цены, зато
 * чтение — десятую часть. При пятиминутном кэше вопросы приходят реже, чем он
 * живёт, и каждый платит полную цену; при часовом окупается с третьего вопроса.
 */
const CACHE: { type: 'ephemeral'; ttl: '1h' } = { type: 'ephemeral', ttl: '1h' };

/** Сколько токенов ушло на вопрос — чтобы видеть деньги, а не догадываться. */
export interface KbUsage {
  /** входные мимо кэша, полная цена */
  input: number;
  /** прочитано из кэша, десятая часть цены */
  cacheRead: number;
  /** записано в кэш, двойная цена (ttl 1h) */
  cacheWrite: number;
  output: number;
}

export const ZERO_USAGE: KbUsage = { input: 0, cacheRead: 0, cacheWrite: 0, output: 0 };

async function addUsage(a: KbUsage, m: Anthropic.Message): Promise<KbUsage> {
  await recordAnthropicUsage(MODEL, m.usage);
  return {
    input: a.input + m.usage.input_tokens,
    cacheRead: a.cacheRead + (m.usage.cache_read_input_tokens ?? 0),
    cacheWrite: a.cacheWrite + (m.usage.cache_creation_input_tokens ?? 0),
    output: a.output + m.usage.output_tokens,
  };
}

/**
 * Цена вопроса в долларах по прайсу Haiku 4.5: $1 за миллион входных,
 * $5 за выходные. Запись в часовой кэш — вдвое, чтение — десятая часть.
 */
export function usdOf(u: KbUsage): number {
  return (
    (u.input * 1 + u.cacheWrite * 2 + u.cacheRead * 0.1 + u.output * 5) / 1_000_000
  );
}

const SELECT_SYSTEM = `Ты подбираешь материал по оглавлению курса Саши Тойза.

Тебе дают оглавление и вопрос ученика. Верни ровно один материал, в котором
скорее всего лежит ответ: в поле id — метку из квадратных скобок целиком,
ровно как она написана в оглавлении, вместе с косой чертой. Например
id = "kurs/02-uroven-1". Ничего к ней не добавляй и не переписывай.

В поле block скопируй заголовок блока этого материала, где ответ вероятнее
всего лежит — дословно из строки «блоки:». Если блоков у материала не показано
или ни один не подходит, оставь block пустой строкой.

Если в оглавлении нет ничего подходящего, верни found=false. Лучше честно
сказать «нет», чем притянуть неподходящий материал: ученик получит ответ не по делу.`;

const ANSWER_SYSTEM = `Ты отвечаешь ученику Саши Тойза по его же материалам.

Правила:
- Ответ не длиннее трёх предложений. Без вводных вроде «конечно» и «отличный вопрос».
- Только то, что есть в переданном тексте. Ничего из общих знаний.
- Пиши так же, как написан материал: просто, живой речью, без канцелярита.
  Обращение бери из материала — где он на «ты», пиши на «ты», где на «вы» — на «вы».
- Не называй имён участников разборов и созвонов и их цифры — только сам приём.
  Это относится и к полю block: если блок в материале назван по имени человека,
  назови его по сути, без имени.
- Не обещай сроков, дат и цен: они меняются, и ты о них не знаешь.
- Если переданного текста не хватает на ответ, верни found=false и не выдумывай.
- Если можешь, назови блок внутри материала, где это лежит.`;

const SELECT_SCHEMA = {
  type: 'object',
  properties: {
    found: { type: 'boolean' },
    id: {
      type: 'string',
      description: 'метка материала из квадратных скобок целиком, например kurs/02-uroven-1',
    },
    block: {
      type: 'string',
      description: 'заголовок блока из строки «блоки:» дословно, либо пустая строка',
    },
  },
  required: ['found', 'id', 'block'],
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

/**
 * Блоки разборов и созвонов часто названы по имени человека («Даша: оффер
 * зашёл рано»). Промпт просит имя не называть, но заголовок соблазнительно
 * скопировать дословно — поэтому чистим ещё и кодом, по списку участников.
 * Сравниваем по корню имени: «Даша» ловит и «Даши», и «Даше».
 */
function stripPeople(block: string | null, people: string[]): string | null {
  if (!block) return null;

  let out = block.trim();
  for (const person of people) {
    const root = person.trim().slice(0, Math.max(3, person.trim().length - 1));
    if (!root) continue;
    const re = new RegExp(root, 'i');
    if (!re.test(out)) continue;

    // «Имя: суть» и «Имя — суть» превращаются в «суть»
    const cut = out.replace(new RegExp(`^${root}\\p{L}*\\s*[:—–-]\\s*`, 'iu'), '');
    if (cut !== out && !re.test(cut)) {
      out = cut;
      continue;
    }
    return null; // имя сидит внутри — блок целиком не показываем
  }
  return out || null;
}

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
): Promise<{ entry: MapEntry | null; block: string | null; usage: KbUsage }> {
  if (!entries.length) return { entry: null, block: null, usage: ZERO_USAGE };

  const message = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 256,
    system: [
      {
        type: 'text',
        text: `${SELECT_SYSTEM}\n\nОГЛАВЛЕНИЕ:\n\n${renderMap(entries)}`,
        // Оглавление одинаковое для всех, кому открыт один набор разделов,
        // и едет в каждом вопросе — самый выгодный кусок для кэша.
        cache_control: CACHE,
      },
    ],
    output_config: { format: { type: 'json_schema', schema: SELECT_SCHEMA } },
    messages: [{ role: 'user', content: question }],
  });

  const usage = await addUsage(ZERO_USAGE, message);
  const picked = firstJson<{ found: boolean; id: string; block: string }>(message);
  if (!picked?.found || !picked.id) return { entry: null, block: null, usage };

  // Модель иногда оборачивает метку в скобки или добавляет пробелы — сверяем по сути.
  const wanted = picked.id.trim().replace(/^\[|\]$/g, '').toLowerCase();
  const entry =
    entries.find((e) => `${e.section}/${e.slug}`.toLowerCase() === wanted) ??
    entries.find((e) => e.slug.toLowerCase() === wanted) ??
    null;
  return { entry, block: picked.block?.trim() || null, usage };
}

/**
 * Шаг 2: ответить по тексту выбранного материала.
 *
 * Текст материала намеренно НЕ кэшируется. Материалов шесть десятков, и один
 * и тот же дважды за час выбирается редко — запись в кэш стоила бы вдвое, а
 * читать её было бы почти некому. Кэш окупается только на оглавлении, которое
 * едет в каждом вопросе.
 */
export async function answerFrom(
  question: string,
  entry: MapEntry,
  hint: string | null = null,
): Promise<{ answer: KbAnswer | null; usage: KbUsage }> {
  const full = materialText(entry);
  if (!full) return { answer: null, usage: ZERO_USAGE };

  const window = textAround(full, hint);
  let usage = ZERO_USAGE;

  // Сначала пробуем окном вокруг блока. Не хватило — тот же вопрос по полному
  // тексту: лишнее обращение платится редко, а ответ не теряется.
  for (const text of window ? [window, full] : [full]) {
    const message = await anthropic().messages.create({
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

    usage = await addUsage(usage, message);
    const parsed = firstJson<{ found: boolean; answer: string; block: string }>(message);
    if (parsed?.found && parsed.answer.trim()) {
      return {
        answer: {
          entry,
          text: parsed.answer.trim(),
          block: stripPeople(parsed.block?.trim() || null, entry.people),
        },
        usage,
      };
    }
  }

  return { answer: null, usage };
}

/** Весь путь: вопрос → ответ с адресом, либо null, если ответа в материалах нет. */
export async function answerQuestion(
  question: string,
  entries: MapEntry[],
): Promise<{ answer: KbAnswer | null; usage: KbUsage }> {
  const picked = await selectEntry(question, entries);
  if (!picked.entry) return { answer: null, usage: picked.usage };

  const answered = await answerFrom(question, picked.entry, picked.block);
  return {
    answer: answered.answer,
    usage: {
      input: picked.usage.input + answered.usage.input,
      cacheRead: picked.usage.cacheRead + answered.usage.cacheRead,
      cacheWrite: picked.usage.cacheWrite + answered.usage.cacheWrite,
      output: picked.usage.output + answered.usage.output,
    },
  };
}
