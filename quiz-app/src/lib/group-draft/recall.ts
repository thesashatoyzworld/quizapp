/**
 * Похожие ответы Саши за пределами группы: личка клиентов, их личные группы,
 * разборы созвонов. Всё целиком в промпт не влезет, поэтому под каждый вопрос
 * подбираются ближайшие по полнотекстовому поиску Postgres.
 *
 * Корпус собирается скриптом scripts/sasha-voice-build.mts и живёт только в
 * базе: репозиторий публичный.
 */
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';
import { pickTerms } from './terms';

/** Сколько кандидатов поиск по словам отдаёт на отбор и сколько остаётся в промпте. */
const CANDIDATES = 50;
const CHAT_LIMIT = 15;
const CALL_LIMIT = 10;

/** Отбор по смыслу: дёшево и быстро, черновик пишет модель посильнее. */
const RERANK_MODEL = process.env.GROUP_RECALL_MODEL || 'claude-haiku-4-5';
const anthropic = new Anthropic();

export interface RecallItem {
  source: string;
  topic: string | null;
  question: string;
  answer: string;
}

/**
 * Сколько документов корпуса содержат каждую основу слова. Нужна, чтобы искать
 * по редким словам вопроса («нумерология», «закреп»), а не по общим («делать»,
 * «контент»): иначе наверх всплывают длинные расшифровки голосовых, где есть
 * всё. Корпус меняется только пересборкой, поэтому держится в памяти несколько часов.
 */
let stats: { total: number; df: Map<string, number>; at: number } | null = null;
const STATS_TTL_MS = 6 * 60 * 60 * 1000;

async function corpusStats() {
  // Корпус пересобирается раз в неделю, живой процесс не должен держать старые цифры.
  if (stats && Date.now() - stats.at < STATS_TTL_MS) return stats;
  const [rows, [{ total }]] = await Promise.all([
    prisma.$queryRaw<{ word: string; ndoc: number }[]>`
      select word, ndoc from ts_stat($$select to_tsvector('russian', question || ' ' || answer) from sasha_voice_item$$)`,
    prisma.$queryRaw<{ total: number }[]>`select count(*)::int as total from sasha_voice_item`,
  ]);
  stats = { total, df: new Map(rows.map((r) => [r.word, Number(r.ndoc)])), at: Date.now() };
  return stats;
}

async function search(terms: string[], chats: boolean, limit: number): Promise<RecallItem[]> {
  const q = terms.join(' | ');
  // Нормализация 1: длинный текст не выигрывает только длиной. Совпадение в
  // вопросе важнее совпадения в ответе.
  return prisma.$queryRaw<RecallItem[]>`
    select source, topic, question, answer
    from sasha_voice_item, to_tsquery('simple', ${q}) query
    where (source = 'sozvon') = ${!chats}
      and to_tsvector('russian', question || ' ' || answer) @@ query
    order by ts_rank(to_tsvector('russian', question), query, 1) * 2
           + ts_rank(to_tsvector('russian', answer), query, 1) desc
    limit ${limit}`;
}

/**
 * Слова совпадают, а смысл часто мимо: «как выкладывать карусель» находит
 * «как выкладывать сторис». Поэтому кандидатов из поиска отбирает модель:
 * оставляет только то, где Саша отвечал на похожую ситуацию.
 */
export async function rerank(question: string, items: RecallItem[], keep: number): Promise<RecallItem[]> {
  if (items.length <= keep) return items;
  const list = items
    .map((c, i) => `[${i}] ${c.question.slice(0, 300).replace(/\s+/g, ' ')} → ${c.answer.slice(0, 200).replace(/\s+/g, ' ')}`)
    .join('\n');
  try {
    const res = await anthropic.messages.create({
      model: RERANK_MODEL,
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content:
            `Вопрос ученика ментору:\n${question.slice(0, 2000)}\n\n` +
            `Ниже прошлые пары «ситуация → ответ ментора». Выбери до ${keep} номеров, где ситуация по смыслу ` +
            `похожа на вопрос или ответ ментора прямо пригодится, чтобы на него ответить. Самые полезные первыми. ` +
            `Если подходящих нет, верни пустой список. Ответ только номера через запятую, без текста.\n\n${list}`,
        },
      ],
    });
    await recordAnthropicUsage(RERANK_MODEL, res.usage, 'group');
    const text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    const ids = [...new Set((text.match(/\d+/g) ?? []).map(Number))].filter((i) => i < items.length);
    return ids.slice(0, keep).map((i) => items[i]);
  } catch (e) {
    console.error('[group-draft] отбор похожих упал', e);
    return items.slice(0, keep);
  }
}

/**
 * Ученик формулирует по-своему, а Саша о том же говорит другими словами:
 * «не набирает охваты» против «не долистывают», «шапка» против «био». Модель
 * дописывает к вопросу слова, которыми о такой ситуации говорят в переписке,
 * и поиск ищет и по ним. Эмбеддингов у API Claude нет, это их замена.
 */
export async function expand(question: string): Promise<string> {
  try {
    const res = await anthropic.messages.create({
      model: RERANK_MODEL,
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content:
            `Вопрос ученика ментору по онлайн-продажам экспертов (оффер, карусели, рилсы, лендинг, продажи в переписке):\n` +
            `${question.slice(0, 2000)}\n\n` +
            'Выпиши 15-25 слов и коротких фраз, которыми о такой ситуации говорят ментор и ученики в чате: ' +
            'синонимы, сленг, конкретные термины, то, что ментор скорее всего ответит. ' +
            'Только слова через запятую, без пояснений.',
        },
      ],
    });
    await recordAnthropicUsage(RERANK_MODEL, res.usage, 'group');
    return res.content.map((b) => (b.type === 'text' ? b.text : '')).join(' ');
  } catch (e) {
    console.error('[group-draft] расширение вопроса упало', e);
    return '';
  }
}

async function lexemes(text: string): Promise<string[]> {
  if (!text.trim()) return [];
  const [{ lex }] = await prisma.$queryRaw<{ lex: string[] }[]>`
    select coalesce(array_agg(lexeme), '{}') as lex from unnest(to_tsvector('russian', ${text.slice(0, 4000)}))`;
  return lex;
}

export async function recall(question: string): Promise<{ chats: RecallItem[]; calls: RecallItem[] }> {
  try {
    const [{ total, df }, extra] = await Promise.all([corpusStats(), expand(question)]);
    const [own, more] = await Promise.all([lexemes(question), lexemes(extra)]);
    const terms = [...new Set([...pickTerms(own, df, total), ...pickTerms(more, df, total)])];
    if (!terms.length) return { chats: [], calls: [] };
    const [chatPool, callPool] = await Promise.all([search(terms, true, CANDIDATES), search(terms, false, CANDIDATES)]);
    const [chats, calls] = await Promise.all([
      rerank(question, chatPool, CHAT_LIMIT),
      rerank(question, callPool, CALL_LIMIT),
    ]);
    return { chats, calls };
  } catch (e) {
    // Без похожих черновик всё равно пишется, просто беднее.
    console.error('[group-draft] поиск похожих упал', e);
    return { chats: [], calls: [] };
  }
}

export function renderRecall({ chats, calls }: { chats: RecallItem[]; calls: RecallItem[] }): string {
  const parts: string[] = [];
  if (chats.length) {
    parts.push(
      '## Как Саша отвечал на похожее в личке и в группах клиентов\n\n' +
        'Это живая переписка: отсюда голос и длина ответа.\n\n' +
        chats.map((c) => `клиент: ${c.question}\nСаша: ${c.answer}`).join('\n\n'),
    );
  }
  if (calls.length) {
    parts.push(
      '## Что Саша говорил на созвонах в похожих ситуациях\n\n' +
        'Пересказ устной речи: бери отсюда позицию и аргументы, а не стиль. ' +
        'В чате Саша говорит то же самое, но короче.\n\n' +
        calls.map((c) => `ситуация (${c.topic || 'другое'}): ${c.question}\nСаша: ${c.answer}`).join('\n\n'),
    );
  }
  return parts.join('\n\n');
}
