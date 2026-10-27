// Optimizator: one Claude call that analyzes a reel script by Kallaway's method.
// Server only (imports the prompt). Ported from reels-optimizer
// prompts/kallaway/runs/run.mjs, which is the validated call: system = system.md,
// user = JSON of the input, response = one JSON object, unknown keys stripped.
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './system';
import { OUTPUT_SCHEMA } from './output-schema';
import { stripUnknown } from './strip';
import { MAX_TOKENS, MODEL } from './config';
import type { Analysis, Goal, Stage } from './view';

const anthropic = new Anthropic();

export interface AnalyzeInput {
  script: string;
  goal: Goal;
  stage: Stage;
  niche: string | null;
  audience: string | null;
}

export interface AnalyzeOk {
  ok: true;
  analysis: Analysis;
  usage: Anthropic.Usage;
  durationMs: number;
}

export interface AnalyzeFail {
  ok: false;
  code: 'claude_error' | 'truncated' | 'parse_error' | 'bad_shape';
  detail: string;
  usage: Anthropic.Usage | null;
  durationMs: number;
}

/** Repeats the prompt's main rule next to the script: only the author's facts, placeholders for the rest. */
const NO_FABRICATION =
  'Напоминание к этому сценарию: в rewrite и hooks используй только факты из script, niche и audience. ' +
  'Не добавляй кейсы, клиентов, имена, цифры, сроки, результаты и действия автора, которых нет в сценарии. ' +
  'Где нужно доказательство или пример, а у автора его нет, ставь заглушку [вставь ...] и дублируй её в rewrite.placeholders. ' +
  'Во всём русском тексте называй цели «заявки» и «охват», никогда не пиши conversion, virality и другие английские термины. ' +
  'Значения enum в JSON (поле goal и другие) оставляй как в схеме.';

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // The prompt demands bare JSON; tolerate a stray fence or preamble anyway.
    const a = text.indexOf('{');
    const b = text.lastIndexOf('}');
    if (a < 0 || b <= a) throw new Error('no JSON object in response');
    return JSON.parse(text.slice(a, b + 1));
  }
}

function shapeOk(a: Analysis): string | null {
  if (typeof a !== 'object' || a === null) return 'not an object';
  if (typeof a.verdict !== 'string') return 'verdict missing';
  if (typeof a.overall_score !== 'number') return 'overall_score missing';
  if (a.input_ok === false) return null; // UI shows the verdict only
  if (!Array.isArray(a.criteria) || a.criteria.length !== 7) return 'criteria must have 7 items';
  if (!Array.isArray(a.hooks)) return 'hooks missing';
  if (!a.rewrite || typeof a.rewrite.script !== 'string') return 'rewrite missing';
  if (!a.hook_gate || !a.topic_angle) return 'hook_gate/topic_angle missing';
  return null;
}

export async function analyzeScript(input: AnalyzeInput): Promise<AnalyzeOk | AnalyzeFail> {
  const t0 = Date.now();
  const payload = { script: input.script, goal: input.goal, stage: input.stage, niche: input.niche, audience: input.audience };
  let msg: Anthropic.Message;
  try {
    // Streaming only to keep the SDK happy with a 24k max_tokens; we wait for the final message.
    msg = await anthropic.messages
      .stream({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: JSON.stringify(payload) },
              { type: 'text', text: NO_FABRICATION },
            ],
          },
        ],
      })
      .finalMessage();
  } catch (err) {
    return { ok: false, code: 'claude_error', detail: String((err as Error)?.message || err).slice(0, 300), usage: null, durationMs: Date.now() - t0 };
  }
  const durationMs = Date.now() - t0;
  if (msg.stop_reason === 'max_tokens') {
    return { ok: false, code: 'truncated', detail: 'stop_reason=max_tokens', usage: msg.usage, durationMs };
  }
  const text = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
  let parsed: unknown;
  try {
    parsed = parseJson(text);
  } catch (err) {
    return { ok: false, code: 'parse_error', detail: String((err as Error).message).slice(0, 200), usage: msg.usage, durationMs };
  }
  const analysis = stripUnknown(OUTPUT_SCHEMA, parsed) as Analysis;
  const bad = shapeOk(analysis);
  if (bad) return { ok: false, code: 'bad_shape', detail: bad, usage: msg.usage, durationMs };
  return { ok: true, analysis, usage: msg.usage, durationMs };
}
