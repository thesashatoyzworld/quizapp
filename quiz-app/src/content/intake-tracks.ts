// Два трека анкеты: тариф 2 (маршрут по материалам) и тариф 3 (досье к созвону).
//
// Механика анкеты одна на оба, различаются только тексты. Логика в lib/intake.ts
// берёт нужный набор отсюда по полю `track` самой анкеты, а не по тарифу
// в момент разговора: тариф может смениться на середине, а вопросы человеку
// должны достаться те же, с которыми он начал.

import {
  INTAKE_PREAMBLE,
  INTAKE_QUESTIONS,
  INTAKE_TEXTS,
  INTAKE_TOTAL,
  INTAKE_INVITE,
  INTAKE_PRODUCT_SLUG,
  type IntakeQuestion,
} from './intake-tarif3';
import {
  T2_PREAMBLE,
  T2_QUESTIONS,
  T2_TEXTS,
  T2_TOTAL,
  T2_INVITE,
  T2_PRODUCT_SLUG,
} from './intake-tarif2';

export type IntakeTrack = 't2' | 't3';

/** Старые анкеты заведены до появления треков, все они менторские. */
export const DEFAULT_TRACK: IntakeTrack = 't3';

/** Реплики бота: у треков они одни и те же, кроме нескольких строк. */
export type IntakeTexts = {
  [K in keyof typeof INTAKE_TEXTS]: (typeof INTAKE_TEXTS)[K] extends (step: number) => string
    ? (step: number) => string
    : string;
};

export interface TrackContent {
  productSlug: string;
  preamble: string;
  questions: IntakeQuestion[];
  total: number;
  invite: string;
  texts: IntakeTexts;
}

export const TRACKS: Record<IntakeTrack, TrackContent> = {
  t3: {
    productSlug: INTAKE_PRODUCT_SLUG,
    preamble: INTAKE_PREAMBLE,
    questions: INTAKE_QUESTIONS,
    total: INTAKE_TOTAL,
    invite: INTAKE_INVITE,
    texts: INTAKE_TEXTS,
  },
  t2: {
    productSlug: T2_PRODUCT_SLUG,
    preamble: T2_PREAMBLE,
    questions: T2_QUESTIONS,
    total: T2_TOTAL,
    invite: T2_INVITE,
    // Служебные реплики общие, переопределены только те, что обещают созвон.
    texts: { ...INTAKE_TEXTS, ...T2_TEXTS },
  },
};

export function trackContent(track?: string | null): TrackContent {
  return TRACKS[(track as IntakeTrack) || DEFAULT_TRACK] || TRACKS[DEFAULT_TRACK];
}
