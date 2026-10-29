// Optimizator ladder: one script in, a place among reels of known outcome out.
// Port of reels-optimizer prompts/kallaway/pairs/ladder.py: the script is paired with
// 8 references (own past reels, or expert anchors on a close topic), the v7 analyzer
// prompt is the system prompt, the model picks the stronger text in each pair. Every
// pair is asked twice with A and B swapped (two calls), so position bias cancels out.
// Server only. Never throws: any failure or a refusal returns null and the UI hides
// the block.
import Anthropic from '@anthropic-ai/sdk';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';
import { SYSTEM_PROMPT } from './system';
import { pickAnchors } from './anchors';
import { getOwnRefs, ownRefsAvailable } from './refs';
import {
  LADDER_CONFIDENT, LADDER_CUT, LADDER_MAX_TOKENS, LADDER_MIN_OWN, LADDER_MODEL, LADDER_REFS,
} from './config';
import { firstSentence, type Ladder, type LadderKind, type LadderRef } from './view';

const anthropic = new Anthropic();

// Texts as in ladder.py (ASK + TAIL), do not reword: they are what was measured.
const ASK: Record<LadderKind, string> = {
  own: 'Ниже {n} пар сценариев Reels. В каждой паре два ролика ОДНОГО автора (тот же человек, та же аудитория), между строками ===id A=== / ===id B=== и ===end===. Для каждой пары реши, какой из двух наберёт больше охвата.',
  anchor: 'Ниже {n} пар сценариев Reels. В каждой паре ролики РАЗНЫХ авторов на близкую тему, между строками ===id A=== / ===id B=== и ===end===. Размер аккаунтов разный, поэтому сравнивай не просмотры, а то, какой ролик сильнее обгонит обычный уровень своего автора. Для каждой пары реши, какой из двух.',
};
const TAIL = ` Сравнивай их между собой: всё, что в системном промпте сказано про тему, формат, старт, конкретику, рекламу, позицию, причины зрителя, используй как знание. Полный разбор не пиши.

Верни только JSON-массив, по объекту на пару, в том же порядке:
{"id": "...", "winner": "A"|"B", "confidence": 50-100}
Только массив, без markdown.

{pairs}`;

/** A reference with its text (server side) and what the student sees. */
type Ref = { text: string; view: Omit<LadderRef, 'won' | 'margin'> };

export type LadderUsage = {
  model: string;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  ms: number;
};

export type LadderResult = Ladder & { usage: LadderUsage };

type Answer = { id: string; winner: 'A' | 'B'; confidence: number };

/** Own reels when there is a username, keys and at least 4 reels with speech; else anchors. */
async function references(username: string | null, phrases: Promise<string[]>): Promise<{ kind: LadderKind; refs: Ref[] }> {
  if (username && ownRefsAvailable()) {
    const own = await getOwnRefs(username);
    if (own.status === 'ok' && own.refs.length >= LADDER_MIN_OWN) {
      return {
        kind: 'own',
        refs: own.refs.slice(0, LADDER_REFS).map((r) => ({
          text: r.text,
          view: { label: firstSentence(r.text), outcome: r.outcome, ratio: r.ratio, plays: r.plays },
        })),
      };
    }
  }
  const anchors = await pickAnchors(await phrases.catch(() => [] as string[]));
  return {
    kind: 'anchor',
    refs: anchors.map((a) => ({
      text: a.text,
      view: { label: a.first_line, outcome: a.class, ratio: a.ratio, plays: null },
    })),
  };
}

function buildMessage(kind: LadderKind, script: string, refs: Ref[], scriptIs: ('A' | 'B')[]): string {
  const pairs = refs.map((r, i) => {
    const id = `r${i + 1}`;
    const [a, b] = scriptIs[i] === 'A' ? [script, r.text] : [r.text, script];
    return `===${id} A===\n${a.slice(0, LADDER_CUT)}\n===end===\n===${id} B===\n${b.slice(0, LADDER_CUT)}\n===end===`;
  });
  // Function replacers: a script may contain "$&" and the like.
  return (ASK[kind] + TAIL).replace('{n}', () => String(refs.length)).replace('{pairs}', () => pairs.join('\n\n'));
}

function parseAnswers(text: string, n: number): Map<string, Answer> | null {
  const m = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (!m) return null;
  let arr: unknown;
  try { arr = JSON.parse(m[0]); } catch { return null; }
  if (!Array.isArray(arr)) return null;
  const out = new Map<string, Answer>();
  for (const o of arr as Partial<Answer>[]) {
    if (!o || typeof o.id !== 'string' || (o.winner !== 'A' && o.winner !== 'B')) continue;
    const c = Number(o.confidence);
    out.set(o.id, { id: o.id, winner: o.winner, confidence: Number.isFinite(c) ? Math.max(50, Math.min(100, c)) : 50 });
  }
  // A partial answer would quietly shrink the ladder; treat it as a failed call.
  return out.size === n ? out : null;
}

/** One order. `started` resolves when the response begins: the system prompt is cached by then. */
function ask(message: string, started?: () => void): Promise<Anthropic.Message> {
  const stream = anthropic.messages.stream({
    model: LADDER_MODEL,
    max_tokens: LADDER_MAX_TOKENS,
    // Same v7 prompt as the analyzer; the cache is per model, so the ladder writes its own.
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: message }],
  });
  if (started) stream.once('streamEvent', started);
  return stream.finalMessage();
}

export async function runLadder(input: {
  script: string;
  username: string | null;
  phrases: Promise<string[]>;
}): Promise<LadderResult | null> {
  const t0 = Date.now();
  try {
    const { kind, refs } = await references(input.username, input.phrases);
    if (refs.length < LADDER_MIN_OWN) return null;

    const first = refs.map(() => (Math.random() < 0.5 ? 'A' : 'B') as 'A' | 'B');
    const second = first.map((s) => (s === 'A' ? 'B' : 'A') as 'A' | 'B');

    // The second call waits until the first one has started answering: by then the
    // ~25k-token system prompt is in the cache and the second call reads it at 0.05×
    // instead of writing it again. 20 s cap so a slow start does not stall the run.
    let go!: () => void;
    const begun = new Promise<void>((r) => { go = r; });
    const timer = setTimeout(() => go(), 20_000);
    let firstFailed = false;
    const m1 = ask(buildMessage(kind, input.script, refs, first), () => go());
    m1.catch(() => { firstFailed = true; go(); });
    const m2 = begun.then(() => {
      if (firstFailed) throw new Error('first order failed, second skipped');
      return ask(buildMessage(kind, input.script, refs, second));
    });
    const settled = await Promise.allSettled([m1, m2]);
    clearTimeout(timer);

    const usage: LadderUsage = { model: LADDER_MODEL, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, ms: 0 };
    const msgs: Anthropic.Message[] = [];
    for (const s of settled) {
      if (s.status === 'rejected') {
        console.error('[optimizator/ladder] call failed:', String((s.reason as Error)?.message || s.reason).slice(0, 300));
        continue;
      }
      const msg = s.value;
      await recordAnthropicUsage(LADDER_MODEL, msg.usage, 'optimizator_ladder');
      usage.input += msg.usage.input_tokens;
      usage.output += msg.usage.output_tokens;
      usage.cacheRead += msg.usage.cache_read_input_tokens ?? 0;
      usage.cacheWrite += msg.usage.cache_creation_input_tokens ?? 0;
      msgs.push(msg);
    }
    usage.ms = Date.now() - t0;
    if (msgs.length < 2) return null;

    const answers: Map<string, Answer>[] = [];
    for (const msg of msgs) {
      if (msg.stop_reason === 'refusal' || msg.stop_reason === 'max_tokens') {
        console.error('[optimizator/ladder] stop_reason', msg.stop_reason);
        return null;
      }
      const parsed = parseAnswers(msg.content.map((b) => (b.type === 'text' ? b.text : '')).join(''), refs.length);
      if (!parsed) {
        console.error('[optimizator/ladder] unparsable answer');
        return null;
      }
      answers.push(parsed);
    }

    let total = 0;
    const out: LadderRef[] = refs.map((r, i) => {
      const id = `r${i + 1}`;
      let margin = 0;
      [first, second].forEach((sides, k) => {
        const a = answers[k].get(id)!;
        margin += (a.winner === sides[i] ? 1 : -1) * a.confidence;
      });
      total += margin;
      return { ...r.view, won: margin > 0, margin };
    });
    const score = Math.round(total / (refs.length * 2));
    return {
      kind,
      wins: out.filter((r) => r.won).length,
      total: out.length,
      score,
      confident: Math.abs(score) >= LADDER_CONFIDENT,
      refs: out,
      username: kind === 'own' ? input.username : null,
      usage,
    };
  } catch (err) {
    console.error('[optimizator/ladder]', String((err as Error)?.message || err).slice(0, 300));
    return null;
  }
}
