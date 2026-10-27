// Client-safe types and helpers for the Optimizator page. No Prisma, no prompt here:
// this file is imported by the 'use client' page.

export type Goal = 'conversion' | 'virality';

/** draft = script before filming; filmed = transcript of a filmed reel (rewrite is an editing plan). */
export type Stage = 'draft' | 'filmed';

export type CriterionId = 'topic' | 'angle' | 'hook' | 'proof' | 'clarity' | 'retention' | 'cta';

export interface Criterion {
  id: CriterionId;
  name: string;
  score: number;
  weight: number;
  reasoning: string;
  quote: string | null;
  source: string | null;
  source_type: 'kallaway' | 'extrapolation';
}

export interface Hook {
  text: string;
  on_screen_text: string;
  format: string;
  why: string;
  source: string | null;
}

export interface Analysis {
  schema_version: string;
  input_ok: boolean;
  goal: Goal;
  /** v4+: echo of the input stage. Old saved runs have none. */
  stage?: Stage;
  verdict: string;
  overall_score: number;
  /** v4+: predicted reach vs the author's usual reel, 0-100. Old saved runs have none. */
  reach_potential?: number;
  readiness: 'ready' | 'needs_work' | 'rewrite';
  core_idea: string;
  assumptions: string[];
  topic_angle: {
    topic: string;
    angle: string;
    audience_ring: number;
    format_level: string;
    shock_score: number;
    verdict: string;
    better_angle: string | null;
    source: string | null;
  };
  hook_gate: {
    first_sentence: string;
    pass: boolean;
    subject: boolean;
    stakes: boolean;
    clear: boolean;
    fast: boolean;
    hook_format: string;
    reason: string;
    source: string | null;
  };
  criteria: Criterion[];
  caps_applied: string[];
  hooks: Hook[];
  rewrite: { script: string; placeholders: string[]; changes: string[] };
  to_fix: { priority: number; kind: 'fix' | 'bring'; text: string; source: string | null }[];
  warnings: string[];
}

/** What the student sees: the analysis without internal math (weights, caps). */
export type StudentAnalysis = Omit<Analysis, 'caps_applied' | 'criteria' | 'reach_potential'> & {
  criteria: Omit<Criterion, 'weight'>[];
  /** The model's reach_potential (v4+); for old runs topic + angle + hook, normalized to 0-100. */
  reach_potential: number;
  /** true when reach_potential came from the model (v4 scale), false for the old derived value. */
  reach_from_model: boolean;
};

export interface HistoryItem {
  id: string;
  createdAt: string;
  goal: Goal;
  stage: Stage;
  score: number | null;
  firstLine: string;
}

export interface SavedRun {
  id: string;
  createdAt: string;
  goal: Goal;
  stage: Stage;
  niche: string | null;
  audience: string | null;
  script: string;
  result: StudentAnalysis;
}

export const SCRIPT_MIN = 80;
export const SCRIPT_MAX = 6000;
export const FIELD_MAX = 300;

/** Fallback for runs saved before v4: the three criteria that decide reach (topic, angle, hook), 0-100. */
export function reachPotential(criteria: { id: string; score: number }[]): number {
  const pick = (id: string) => criteria.find((c) => c.id === id)?.score ?? 0;
  return Math.round(((pick('topic') + pick('angle') + pick('hook')) / 30) * 100);
}

/** Safety net: the model sometimes leaks the English goal names into Russian text. */
function localizeGoals(text: string): string {
  return text.replace(/\bconversion\b/gi, 'заявки').replace(/\bvirality\b/gi, 'охват');
}

/** Apply localizeGoals to every string value; enum fields are left as they are. */
function localizeDeep<T>(val: T, key?: string): T {
  if (typeof val === 'string') return (key === 'goal' ? val : localizeGoals(val)) as T;
  if (Array.isArray(val)) return val.map((v) => localizeDeep(v)) as T;
  if (val && typeof val === 'object') {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) o[k] = localizeDeep(v, k);
    return o as T;
  }
  return val;
}

export function toStudent(raw: Analysis): StudentAnalysis {
  const a = localizeDeep(raw);
  const { caps_applied: _caps, criteria, reach_potential: modelReach, ...rest } = a;
  void _caps;
  const fromModel = typeof modelReach === 'number' && Number.isFinite(modelReach);
  return {
    ...rest,
    criteria: (criteria || []).map(({ weight: _w, ...c }) => { void _w; return c; }),
    reach_potential: fromModel ? Math.max(0, Math.min(100, Math.round(modelReach))) : reachPotential(criteria || []),
    reach_from_model: fromModel,
    // v4 runs: the label follows the v4 scale even if the model drifts; old runs keep their own.
    readiness: fromModel && typeof rest.overall_score === 'number' ? readinessFor(rest.overall_score) : rest.readiness,
  };
}

/** v4 scale: ordinary reel ~65, hit 75+; ready from 65, needs work 45-64, rewrite below 45. */
export function readinessFor(score: number): Analysis['readiness'] {
  return score >= 65 ? 'ready' : score >= 45 ? 'needs_work' : 'rewrite';
}

/** Kallaway link in the result: youtu.be/ID?t=N → full URL. */
export function sourceUrl(source: string | null | undefined): string | null {
  if (!source || !/^youtu\.be\/[A-Za-z0-9_-]{11}\?t=\d+$/.test(source)) return null;
  return `https://${source}`;
}
