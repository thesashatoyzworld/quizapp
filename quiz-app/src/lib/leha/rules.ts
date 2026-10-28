/**
 * Лёха: первое сообщение тому, кто заполнил анкету и написал на рабочий аккаунт.
 *
 * Здесь только правила, без Prisma и без сети: когда писать, когда молчать.
 * Так их можно прогнать тестами на синтетике, не трогая базу.
 */

/**
 * Режим. По умолчанию shadow: черновик уходит Саше с кнопками, человеку ничего.
 * live включается только точным значением LEHA_MODE=live, любое другое
 * значение (опечатка, пустота) остаётся shadow. off выключает Лёху целиком.
 */
export type LehaMode = 'off' | 'shadow' | 'live';

export function lehaMode(raw: string | undefined = process.env.LEHA_MODE): LehaMode {
  const v = (raw || '').trim().toLowerCase();
  if (v === 'live') return 'live';
  if (v === 'off') return 'off';
  return 'shadow';
}

/** Не больше стольких первых сообщений в сутки (сутки по Алмате). */
export const DAILY_LIMIT = 10;

/** Анкета считается свежей столько времени: дальше это уже не ответ на заявку. */
export const FRESH_MS = 72 * 60 * 60 * 1000;

/**
 * Пауза перед черновиком. Человек часто шлёт шаблон из анкеты, а следом
 * вторую строку по делу: ждём, чтобы ответить на обе.
 */
export const SETTLE_MS = 90 * 1000;

/** Рабочие часы по Алмате: с 9:00 включительно до 21:00. */
export const WORK_FROM_HOUR = 9;
export const WORK_TO_HOUR = 21;
const ALMATY_OFFSET_MS = 5 * 60 * 60 * 1000;

/** Час по Алмате (UTC+5, без перехода на летнее время). */
export function almatyHour(at: Date): number {
  return new Date(at.getTime() + ALMATY_OFFSET_MS).getUTCHours();
}

export function inWorkHours(at: Date): boolean {
  const h = almatyHour(at);
  return h >= WORK_FROM_HOUR && h < WORK_TO_HOUR;
}

/** Полночь по Алмате для суток, в которые попадает момент, в UTC. */
export function almatyDayStart(at: Date): Date {
  const local = new Date(at.getTime() + ALMATY_OFFSET_MS);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - ALMATY_OFFSET_MS);
}

/** Ближайший момент, когда можно писать: сейчас, если часы рабочие, иначе 9:00. */
export function nextWorkMoment(at: Date): Date {
  if (inWorkHours(at)) return at;
  const start = almatyDayStart(at);
  const today9 = new Date(start.getTime() + WORK_FROM_HOUR * 60 * 60 * 1000);
  return at < today9 ? today9 : new Date(today9.getTime() + 24 * 60 * 60 * 1000);
}

export type LeadFacts = {
  id: number;
  username: string | null;
  telegramId: string | null;
  createdAt: Date;
};

export type TriggerFacts = {
  mode: LehaMode;
  lead: LeadFacts | null;
  /** Сообщений человека в этом чате после анкеты, включая только что пришедшее. */
  clientMsgsSinceLead: number;
  /**
   * Наших сообщений в этом чате после анкеты и за неделю до неё: Саша уже
   * ведёт разговор сам, влезать не надо.
   */
  ourMsgsSinceLead: number;
  /** Черновик по этой анкете уже заводился. */
  hasDraft: boolean;
  /** Черновиков, назначенных на сутки plannedDueAt(now) по Алмате. */
  draftsOnDueDay: number;
  now: Date;
};

export type SkipReason =
  | 'off'
  | 'no_lead'
  | 'stale_lead'
  | 'not_first'
  | 'sasha_answered'
  | 'already_drafted'
  | 'daily_limit';

export type Verdict = { go: true; dueAt: Date } | { go: false; reason: SkipReason };

/** Когда собирать черновик на сообщение, пришедшее в момент now. */
export function plannedDueAt(now: Date): Date {
  return nextWorkMoment(new Date(now.getTime() + SETTLE_MS));
}

/** Сколько смотреть назад до анкеты, ища Сашины сообщения. */
export const LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Пришло сообщение человека в личку рабочего аккаунта: заводить ли черновик.
 * dueAt: когда его собирать. Ночью это утро, днём через паузу.
 */
export function decideTrigger(f: TriggerFacts): Verdict {
  if (f.mode === 'off') return { go: false, reason: 'off' };
  if (!f.lead) return { go: false, reason: 'no_lead' };
  if (f.now.getTime() - f.lead.createdAt.getTime() > FRESH_MS) return { go: false, reason: 'stale_lead' };
  if (f.ourMsgsSinceLead > 0) return { go: false, reason: 'sasha_answered' };
  if (f.clientMsgsSinceLead !== 1) return { go: false, reason: 'not_first' };
  if (f.hasDraft) return { go: false, reason: 'already_drafted' };

  if (f.draftsOnDueDay >= DAILY_LIMIT) return { go: false, reason: 'daily_limit' };
  const dueAt = plannedDueAt(f.now);
  return { go: true, dueAt };
}

export type RunFacts = {
  mode: LehaMode;
  status: string;
  ourMsgsSinceLead: number;
  now: Date;
};

export type RunStep =
  | { kind: 'draft' }
  | { kind: 'wait'; until: Date }
  | { kind: 'close'; status: 'answered' | 'off' }
  | { kind: 'noop' };

/**
 * Задача проснулась собрать черновик. Всё могло поменяться за паузу: Саша
 * ответил сам, режим выключили, час ушёл за 21:00.
 */
export function decideRun(f: RunFacts): RunStep {
  if (f.status !== 'queued') return { kind: 'noop' };
  if (f.mode === 'off') return { kind: 'close', status: 'off' };
  if (f.ourMsgsSinceLead > 0) return { kind: 'close', status: 'answered' };
  if (!inWorkHours(f.now)) return { kind: 'wait', until: nextWorkMoment(f.now) };
  return { kind: 'draft' };
}

/**
 * Черновик собран: отдать человеку сразу (live) или Саше на кнопки (shadow).
 * В live ещё раз проверяем часы: модель могла думать до 21:00 с хвостиком.
 * Тогда сам не шлёт, а отдаёт Саше: пусть решает он.
 */
export function deliveryOf(mode: LehaMode, now: Date): 'send' | 'review' {
  return mode === 'live' && inWorkHours(now) ? 'send' : 'review';
}
