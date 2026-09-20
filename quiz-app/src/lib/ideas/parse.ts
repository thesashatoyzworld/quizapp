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
  if (!source) return 'Reference without caption';
  const words = source.split(/\s+/);
  const head = words.slice(0, 7).join(' ');
  return words.length > 7 ? `${head}…` : head;
}

export function buildParsePrompt(draft: DraftIdea): string {
  const parts: string[] = [];
  if (draft.rawText) parts.push(`Message text:\n${draft.rawText}`);
  if (draft.voiceTranscript) parts.push(`Voice transcription:\n${draft.voiceTranscript}`);
  if (draft.refs.length) {
    const list = draft.refs
      .map((r) => (r.kind === 'link' ? `link ${r.url} (${r.domain})` : r.kind))
      .join(', ');
    parts.push(`Attachments: ${list}`);
  }

  return `Here is an idea from a collection. Parse it and return ONLY JSON, no explanation.

${parts.join('\n\n')}

JSON fields:
- "title": headline of 3-7 words, capturing the essence of the idea
- "type": one of ${IDEA_TYPES.join(' | ')}
- "summary": one or two lines in the author's words, no embellishment. Do not
  invent what is not in the message. Nothing to say: null
- "tags": up to five short tags, array of strings

Short vertical video is reel. Long YouTube video is bigvideo.
Slide deck is carousel. Text in a channel is post. Product, price or sale
is offer. Process, tool or automation is system. Not sure: other.`;
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
    return fail(`model returned not JSON: ${raw.slice(0, 200)}`);
  }

  const title = typeof data?.title === 'string' ? data.title.trim() : '';
  if (!title) return fail('model did not return title');

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
