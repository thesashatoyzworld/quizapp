// Parse an idea with the model. Writes ONLY to title, type, summary, tags.
//
// Source (rawText, voiceTranscript) is never touched: in the card there is
// a toggle for "source", and it must show what the person wrote, not what
// Haiku understood.
//
// Parsing does not block writing: if the model fails, returns garbage, or
// omits the title, the idea is still created with parsed=false and a title
// from the first words.
import Anthropic from '@anthropic-ai/sdk';
import { IDEA_TYPES, type DraftIdea, type IdeaType } from './types';

const MODEL = process.env.IDEAS_MODEL || 'claude-haiku-4-5-20251001';

let client: Anthropic | null = null;

function anthropic(): Anthropic {
  if (!client) {
    const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
    client = new Anthropic({ apiKey });
  }
  return client;
}

export interface IdeaParse {
  title: string;
  type: IdeaType;
  summary: string | null;
  tags: string[];
  parsed: boolean;
  parseError: string | null;
}

export function fallbackTitle(draft: DraftIdea): string {
  const source = (draft.rawText || draft.voiceTranscript || '').trim();
  if (!source) return 'Референс без подписи';
  const words = source.split(/\s+/);
  const head = words.slice(0, 7).join(' ');
  return words.length > 7 ? `${head}…` : head;
}

export function buildParsePrompt(draft: DraftIdea): string {
  const parts: string[] = [];
  if (draft.rawText) parts.push(`Текст сообщения:\n${draft.rawText}`);
  if (draft.voiceTranscript) parts.push(`Расшифровка голосового:\n${draft.voiceTranscript}`);
  if (draft.refs.length) {
    const list = draft.refs
      .map((r) => (r.kind === 'link' ? `link ${r.url} (${r.domain})` : r.kind))
      .join(', ');
    parts.push(`Вложения: ${list}`);
  }

  return `Вот идея из копилки. Разбери её и верни ТОЛЬКО JSON, без пояснений.

${parts.join('\n\n')}

Поля JSON:
- "title": заголовок из 3-7 слов, по сути идеи
- "type": одно из ${IDEA_TYPES.join(' | ')}
- "summary": одна-две строки словами автора, без украшательств. Не додумывай
  того, чего в сообщении нет. Нечего сказать: null
- "tags": до пяти коротких меток, массив строк

Короткое вертикальное видео это reel. Длинное видео на YouTube это bigvideo.
Набор слайдов это carousel. Текст в канал это post. Продукт, цена или продажа
это offer. Процесс, инструмент или автоматизация это system. Не понял: other.`;
}

export function normalizeParse(raw: string, draft: DraftIdea): IdeaParse {
  const fail = (reason: string): IdeaParse => ({
    title: fallbackTitle(draft),
    type: 'other',
    summary: null,
    tags: [],
    parsed: false,
    parseError: reason,
  });

  const fenced = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();

  let data: any;
  try {
    data = JSON.parse(fenced);
  } catch {
    return fail(`модель вернула не JSON: ${raw.slice(0, 200)}`);
  }

  const title = typeof data?.title === 'string' ? data.title.trim() : '';
  if (!title) return fail('модель не вернула заголовок');

  const type: IdeaType = IDEA_TYPES.includes(data?.type) ? data.type : 'other';
  const summary = typeof data?.summary === 'string' && data.summary.trim() ? data.summary.trim() : null;
  const tags = Array.isArray(data?.tags)
    ? data.tags.filter((t: unknown) => typeof t === 'string' && t.trim()).slice(0, 5)
    : [];

  return { title, type, summary, tags, parsed: true, parseError: null };
}

export async function parseIdea(draft: DraftIdea): Promise<IdeaParse> {
  try {
    const res = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 400,
      temperature: 0,
      messages: [{ role: 'user', content: buildParsePrompt(draft) }],
    });
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');
    return normalizeParse(text, draft);
  } catch (e: any) {
    return {
      title: fallbackTitle(draft),
      type: 'other',
      summary: null,
      tags: [],
      parsed: false,
      parseError: e?.message || String(e),
    };
  }
}
