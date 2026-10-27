// Client-safe types and helpers for the Optimizator page. No Prisma, no prompt here:
// this file is imported by the 'use client' page.

export type Goal = 'conversion' | 'virality';

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
  verdict: string;
  overall_score: number;
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
export type StudentAnalysis = Omit<Analysis, 'caps_applied' | 'criteria'> & {
  criteria: Omit<Criterion, 'weight'>[];
  /** topic + angle + hook, normalized to 0-100. */
  reach_potential: number;
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
  niche: string | null;
  audience: string | null;
  script: string;
  result: StudentAnalysis;
}

export const SCRIPT_MIN = 80;
export const SCRIPT_MAX = 6000;
export const FIELD_MAX = 300;

/** Reach potential: the three criteria that decide reach (topic, angle, hook), 0-100. */
export function reachPotential(criteria: { id: string; score: number }[]): number {
  const pick = (id: string) => criteria.find((c) => c.id === id)?.score ?? 0;
  return Math.round(((pick('topic') + pick('angle') + pick('hook')) / 30) * 100);
}

export function toStudent(a: Analysis): StudentAnalysis {
  const { caps_applied: _caps, criteria, ...rest } = a;
  void _caps;
  return {
    ...rest,
    criteria: (criteria || []).map(({ weight: _w, ...c }) => { void _w; return c; }),
    reach_potential: reachPotential(criteria || []),
  };
}

/** Kallaway link in the result: youtu.be/ID?t=N → full URL. */
export function sourceUrl(source: string | null | undefined): string | null {
  if (!source || !/^youtu\.be\/[A-Za-z0-9_-]{11}\?t=\d+$/.test(source)) return null;
  return `https://${source}`;
}
