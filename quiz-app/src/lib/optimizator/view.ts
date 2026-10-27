// Client-safe types and helpers for the Optimizator page. No Prisma, no prompt here:
// this file is imported by the 'use client' page.

export type Goal = 'conversion' | 'virality';

/** v4 only: draft = script before filming; filmed = transcript (rewrite was an editing plan). v5 runs have none. */
export type Stage = 'draft' | 'filmed';

export type FormatType = 'position' | 'lecture' | 'story' | 'skit' | 'reaction' | 'demo' | 'dialogue' | 'unknown';

export type DemandStatus = 'in_flow' | 'weak' | 'none' | 'no_data';

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

export interface Fix {
  text: string;
  /** A ready line from the rewrite; null when the student has to bring the material. */
  example: string | null;
}

/** kallaway-2 (v5). Fields marked "v4" exist only in old saved runs (kallaway-1). */
export interface Analysis {
  schema_version: string;
  input_ok: boolean;
  /** v5: goal inferred from the text. */
  detected_goal?: { goal: Goal; confidence: 'high' | 'low'; evidence: string };
  goal: Goal;
  /** v5 */
  format?: { type: FormatType; why: string };
  /** v5: judged from the demand evidence sent with the script. */
  demand?: { status: DemandStatus; summary: string; matched_ids: string[] };
  /** v4: echo of the input stage. */
  stage?: Stage;
  verdict: string;
  overall_score: number;
  /** v4+: predicted reach vs the author's usual reel, 0-100. */
  reach_potential?: number;
  readiness: 'ready' | 'needs_work' | 'rewrite';
  /** v5: 2-3 main fixes. */
  top_fixes?: Fix[];
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
  /** v4 */
  to_fix?: { priority: number; kind: 'fix' | 'bring'; text: string; source: string | null }[];
  warnings: string[];
}

/** A post from the outliers base the model matched to the script's topic. Built on the server. */
export interface DemandLink {
  id: string;
  author: string;
  kind: 'reel' | 'carousel';
  ratio: number;
  text: string;
  url: string;
}

/** What the student sees: the analysis without internal math (weights, caps). */
export type StudentAnalysis = Omit<Analysis, 'caps_applied' | 'criteria' | 'reach_potential' | 'top_fixes' | 'to_fix'> & {
  criteria: Omit<Criterion, 'weight'>[];
  /** The model's reach_potential (v4+); for old runs topic + angle + hook, normalized to 0-100. */
  reach_potential: number;
  /** true when reach_potential came from the model (v4+ scale), false for the old derived value. */
  reach_from_model: boolean;
  /** v5 top_fixes; for v4 runs the first three to_fix items. */
  top_fixes: Fix[];
  /** true for kallaway-2 runs: goal, format and demand come from the model. */
  v5: boolean;
};

export interface HistoryItem {
  id: string;
  createdAt: string;
  goal: Goal;
  score: number | null;
  firstLine: string;
}

export interface SavedRun {
  id: string;
  createdAt: string;
  goal: Goal;
  /** v4 runs only. */
  stage: Stage | null;
  script: string;
  result: StudentAnalysis;
  demandLinks: DemandLink[];
}

export const SCRIPT_MIN = 80;
export const SCRIPT_MAX = 6000;

export const FORMAT_NAME: Record<FormatType, string> = {
  position: 'позиция в камеру',
  lecture: 'объяснение',
  story: 'история',
  skit: 'сценка',
  reaction: 'реакция',
  demo: 'показ',
  dialogue: 'разговор',
  unknown: 'не понятен',
};

export const DEMAND_STATUS: Record<DemandStatus, string> = {
  in_flow: 'в потоке',
  weak: 'слабый сигнал',
  none: 'не видно спроса',
  no_data: 'мало данных',
};

/** Fallback for runs saved before v4: the three criteria that decide reach (topic, angle, hook), 0-100. */
export function reachPotential(criteria: { id: string; score: number }[]): number {
  const pick = (id: string) => criteria.find((c) => c.id === id)?.score ?? 0;
  return Math.round(((pick('topic') + pick('angle') + pick('hook')) / 30) * 100);
}

/** Safety net: the model sometimes leaks English terms and internal rule codes into Russian text. */
function localizeGoals(text: string): string {
  return text
    .replace(/\bconversion\b/gi, 'заявки')
    .replace(/\bvirality\b/gi, 'охват')
    .replace(/\bstage\s*[:=]?\s*filmed\b/gi, 'ролик снят')
    .replace(/\bstage\s*[:=]?\s*draft\b/gi, 'сценарий до съёмки')
    .replace(/\bfilmed\b/gi, 'снятый ролик')
    .replace(/\breach_potential\b/gi, 'потенциал охвата')
    .replace(/\bin_flow\b/gi, 'в потоке')
    .replace(/\bno_data\b/gi, 'мало данных')
    .replace(/\block-in\b/gi, 'удержание после хука')
    .replace(/\bCTA\b/g, 'призыв')
    // Internal rule codes of the prompt («(Д6)», «(Д3, Д4)», «(по данным Саши: Д1)», «[S45]») mean nothing to a student.
    .replace(/\s*\((?:по данным Саши:?\s*)?Д\d+(?:\s*(?:,|и)\s*Д\d+)*\)/g, '')
    .replace(/\s*\[S\d+\]/g, '');
}

/** Enum-valued keys are left as they are. */
const ENUM_KEYS = new Set(['goal', 'stage', 'type', 'status', 'confidence', 'format', 'hook_format', 'format_level', 'id', 'kind', 'source_type', 'schema_version', 'matched_ids', 'source']);

/** Apply localizeGoals to every string value except enum fields. */
function localizeDeep<T>(val: T, key?: string): T {
  if (typeof val === 'string') return (key && ENUM_KEYS.has(key) ? val : localizeGoals(val)) as T;
  if (Array.isArray(val)) return val.map((v) => localizeDeep(v, key && ENUM_KEYS.has(key) ? key : undefined)) as T;
  if (val && typeof val === 'object') {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) o[k] = localizeDeep(v, k);
    return o as T;
  }
  return val;
}

export function toStudent(raw: Analysis): StudentAnalysis {
  const a = localizeDeep(raw);
  const { caps_applied: _caps, criteria, reach_potential: modelReach, top_fixes, to_fix, ...rest } = a;
  void _caps;
  const fromModel = typeof modelReach === 'number' && Number.isFinite(modelReach);
  const fixes: Fix[] = Array.isArray(top_fixes)
    ? top_fixes.filter((f) => f && typeof f.text === 'string').map((f) => ({ text: f.text, example: f.example || null }))
    : [...(to_fix || [])].sort((x, y) => x.priority - y.priority).slice(0, 3).map((f) => ({ text: f.text, example: null }));
  return {
    ...rest,
    goal: rest.detected_goal?.goal ?? rest.goal,
    criteria: (criteria || []).map(({ weight: _w, ...c }) => { void _w; return c; }),
    reach_potential: fromModel ? Math.max(0, Math.min(100, Math.round(modelReach))) : reachPotential(criteria || []),
    reach_from_model: fromModel,
    top_fixes: fixes,
    v5: rest.schema_version === 'kallaway-2',
    // v4+ runs: the label follows the scale even if the model drifts; old runs keep their own.
    readiness: fromModel && typeof rest.overall_score === 'number' ? readinessFor(rest.overall_score) : rest.readiness,
  };
}

/** v4+ scale: ordinary reel ~65, hit 75+; ready from 65, needs work 45-64, rewrite below 45. */
export function readinessFor(score: number): Analysis['readiness'] {
  return score >= 65 ? 'ready' : score >= 45 ? 'needs_work' : 'rewrite';
}

/** Kallaway link in the result: youtu.be/ID?t=N → full URL. */
export function sourceUrl(source: string | null | undefined): string | null {
  if (!source || !/^youtu\.be\/[A-Za-z0-9_-]{11}\?t=\d+$/.test(source)) return null;
  return `https://${source}`;
}
