// Optimizator: one Claude call that analyzes a reel script by Kallaway's method.
// Server only (imports the prompt). Ported from reels-optimizer
// prompts/kallaway/runs/run.mjs, which is the validated call: system = system.md,
// user = JSON {script, demand}, response = one JSON object, unknown keys stripped.
// Goal and format are detected by the model from the text (prompt v5).
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './system';
import { OUTPUT_SCHEMA } from './output-schema';
import { stripUnknown } from './strip';
import { MAX_TOKENS, MODEL } from './config';
import type { Analysis } from './view';
import type { DemandItem } from './demand';

const anthropic = new Anthropic();

/** Demand evidence as the model sees it: no Instagram urls (they stay on the server). */
export interface DemandInput {
  window_days: number;
  searched: boolean;
  coverage_posts: number;
  items: Omit<DemandItem, 'url'>[];
}

export interface AnalyzeInput {
  script: string;
  demand: DemandInput;
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
  'Напоминание к этому сценарию: в rewrite и hooks используй только факты из script. ' +
  'Не добавляй кейсы, клиентов, имена, цифры, сроки, результаты и действия автора, которых нет в сценарии. ' +
  'Где нужно доказательство или пример, а у автора его нет, ставь заглушку [вставь ...] и дублируй её в rewrite.placeholders. ' +
  'Во всём русском тексте называй цели «заявки» и «охват», никогда не пиши conversion, virality и другие английские термины. ' +
  'Не упоминай номера правил (Д1, Д2 и т.п.) в тексте для ученика. ' +
  'Если по базе мало постов на эту тему, пиши «в базе мало данных по этой теме», а не «спроса нет». ' +
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
  if (!a.detected_goal || (a.detected_goal.goal !== 'conversion' && a.detected_goal.goal !== 'virality')) return 'detected_goal missing';
  if (!a.format || typeof a.format.type !== 'string') return 'format missing';
  if (!a.demand || typeof a.demand.status !== 'string' || !Array.isArray(a.demand.matched_ids)) return 'demand missing';
  if (!Array.isArray(a.top_fixes) || a.top_fixes.length === 0) return 'top_fixes missing';
  if (!Array.isArray(a.criteria) || a.criteria.length !== 7) return 'criteria must have 7 items';
  if (!Array.isArray(a.hooks)) return 'hooks missing';
  if (!a.rewrite || typeof a.rewrite.script !== 'string') return 'rewrite missing';
  if (!a.hook_gate || !a.topic_angle) return 'hook_gate/topic_angle missing';
  return null;
}

export async function analyzeScript(input: AnalyzeInput): Promise<AnalyzeOk | AnalyzeFail> {
  const t0 = Date.now();
  const payload = { script: input.script, demand: input.demand };
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
  // goal is documented as equal to detected_goal.goal; keep them in sync for the goal column.
  if (analysis.detected_goal) analysis.goal = analysis.detected_goal.goal;
  return { ok: true, analysis, usage: msg.usage, durationMs };
}
