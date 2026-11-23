// «Шанс на залёт»: the reels-base score (reels-optimizer prompts/kallaway/baza/score_model.py, score_label.py).
// 62 techniques confirmed within author on the base, weight 0.7·log OR. One Sonnet call marks which ones the script
// has; three calls vote because one labelling moved the band in 10 of 15 scripts (20.11). Length is counted here.
// Validation on new authors: AUC within author 0.67, hit share by band 33/37/53/57/69%.
// Rebuild the model: python3 export_shans.py <baza> src/lib/optimizator/data/shans-model.json (see scripts/).
import Anthropic from '@anthropic-ai/sdk';
import { llm } from './llm';
import { prisma } from '@/lib/prisma';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';
import MODEL_JSON from './data/shans-model.json';
import type { Shans } from './view';

type Feature = { set: string; id: string; name: string; part: string; weight: number; or: number };
const M = MODEL_JSON as unknown as {
  cuts: number[]; bands: string[]; pct: number[]; prompt: string; features: Feature[];
  validation: { hit_share_by_band_new_authors: number[] };
};
const LABEL_MODEL = 'claude-sonnet-5-5';
const VOTES = 3;
const anthropic = llm(); // OPT_VIA_CLI: local subscription runs (llm.ts)

function lengthKey(t: string): string {
  const n = t.split(/\s+/).filter(Boolean).length;
  return n < 40 ? 'len_short' : n < 220 ? 'len_mid' : n <= 450 ? 'len_90_180' : 'len_180p';
}

async function labelOnce(script: string): Promise<Set<string> | null> {
  const msg = await anthropic.messages.create({
    model: LABEL_MODEL, max_tokens: 8000, thinking: { type: 'adaptive' }, output_config: { effort: 'low' },
    messages: [{ role: 'user', content: M.prompt.replace('{SCRIPT}', () => script.slice(0, 2500)) }],
  });
  await recordAnthropicUsage(LABEL_MODEL, msg.usage, 'optimizator');
  const text = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
  const m = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (!m) return null;
  try {
    const arr = JSON.parse(m[0]) as { p?: unknown; format?: unknown }[];
    const o = arr[0];
    if (!o) return null;
    const out = new Set<string>(Array.isArray(o.p) ? o.p.filter((x): x is string => typeof x === 'string' && x.includes(':')) : []);
    if (typeof o.format === 'string') out.add('format:' + o.format);
    return out;
  } catch { return null; }
}

/** Never throws; null when the labelling failed every time. */
export async function scoreShans(script: string): Promise<Shans | null> {
  try {
    const runs = (await Promise.all(Array.from({ length: VOTES }, () => labelOnce(script).catch(() => null))))
      .filter((r): r is Set<string> => !!r);
    if (!runs.length) return null;
    const count = new Map<string, number>();
    for (const r of runs) for (const k of r) count.set(k, (count.get(k) || 0) + 1);
    const has = new Set([...count].filter(([, n]) => n * 2 > runs.length).map(([k]) => k));
    has.add('misha:' + lengthKey(script));
    const got = M.features.filter((f) => has.has(`${f.set}:${f.id}`));
    const score = got.reduce((s, f) => s + f.weight, 0);
    const band = M.cuts.filter((c) => score >= c).length;
    const pct = Math.max(1, Math.min(99, M.pct.filter((c) => score >= c).length));
    const plus = got.filter((f) => f.weight > 0).sort((a, b) => b.weight - a.weight).map((f) => ({ name: f.name, part: f.part, or: f.or }));
    const minus = got.filter((f) => f.weight < 0).sort((a, b) => a.weight - b.weight).map((f) => ({ name: f.name, part: f.part, or: f.or }));
    return {
      score: Math.round(score * 1000) / 1000, band, bandName: M.bands[band], pct,
      hitShare: M.validation.hit_share_by_band_new_authors[band], plus, minus, votes: runs.length,
    };
  } catch (err) {
    console.error('[optimizator/shans]', String((err as Error)?.message || err).slice(0, 300));
    return null;
  }
}

export async function saveShans(runId: string, s: Shans): Promise<void> {
  await prisma.$executeRaw`
    UPDATE optimizator_runs SET result = jsonb_set(result::jsonb, '{shans}', ${JSON.stringify(s)}::jsonb) WHERE id = ${runId}`;
}
