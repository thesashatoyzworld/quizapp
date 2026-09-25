// Group call -> roadmaps.
//
// The server pipeline (agent-hub zoom-drainer) listens to a group call and posts
// what Sasha told each client: one log entry and a few task changes per person.
// Here the proposal is stored, Sasha gets one bot message with "apply" and "view",
// and only his tap changes the roadmaps. Every client is applied in its own
// transaction: one broken roadmap does not block the rest.

import { prisma } from '@/lib/prisma';
import { getAdminChatId } from '@/lib/notion';
import { sendBotMessage } from '@/lib/telegram';

const CABINET = (process.env.NEXT_PUBLIC_CABINET_URL || 'https://world.thesashatoyz.com').replace(/\/$/, '');

/** Hard limits: the pipeline should stay well under them, these only stop garbage. */
const MAX_OPS_PER_CLIENT = 4;
const MAX_CLIENTS = 15;
const MAX_LOG = 1200;
const MAX_TITLE = 300;
const MAX_WHY = 800;

export interface Quote {
  ts: string;
  text: string;
}

export interface TaskInsert {
  /** assigned here on save: gc0914-1, gc0914-2 */
  key?: string;
  title: string;
  why?: string;
  owner: 'client' | 'sasha';
  ts?: string;
  quote?: string;
}

export interface TaskUpdate {
  key: string;
  title?: string;
  why?: string;
  /** true = take the task off the roadmap (status dropped), never delete */
  drop?: boolean;
  ts?: string;
  quote?: string;
}

export interface ClientProposal {
  slug: string;
  heardName: string;
  logEntry: string;
  tasks: { insert: TaskInsert[]; update: TaskUpdate[] };
  quotes: Quote[];
}

export interface Unmatched {
  heardName: string;
  why: string;
}

export interface ProposalPayload {
  jobId: string;
  callDate: string;
  sozvonSlug?: string | null;
  title?: string | null;
  perClient: ClientProposal[];
  unmatched: Unmatched[];
  /** what the pipeline or this endpoint dropped on the way, for the view page */
  warnings?: string[];
}

export interface ClientResult {
  slug: string;
  name: string;
  status: 'applied' | 'skipped' | 'failed';
  inserted: number;
  updated: number;
  dropped: number;
  warnings: string[];
  error?: string;
}

// ---------- candidates for the model ----------

/** Active roadmaps with their tasks: what the pipeline matches heard names against. */
export async function listCandidates() {
  const roadmaps = await prisma.roadmap.findMany({
    where: { archived: false },
    orderBy: { clientName: 'asc' },
    select: {
      slug: true,
      clientName: true,
      username: true,
      tier: true,
      goal: true,
      periodGoal: true,
      clientVisible: true,
      tasks: {
        orderBy: { position: 'asc' },
        select: { key: true, title: true, why: true, owner: true, status: true, position: true, visibility: true },
      },
    },
  });

  return roadmaps.map((r) => ({
    slug: r.slug,
    client_name: r.clientName,
    username: r.username,
    tier: r.tier,
    goal: r.goal,
    period_goal: r.periodGoal,
    client_visible: r.clientVisible,
    tasks: r.tasks,
  }));
}

// ---------- normalizing what the pipeline sent ----------

const str = (v: unknown, max: number): string =>
  typeof v === 'string' ? noDash(v).trim().slice(0, max) : '';

/** Client text never carries the long dash. */
function noDash(s: string): string {
  return s.replace(/\s*\u2014\s*/g, ' - ');
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Cleans the posted proposal: unknown slugs go to unmatched, ops over the limit
 * and ops without a key are dropped, insert keys are assigned. Returns an error
 * string when the body is unusable as a whole.
 */
export function normalizePayload(
  raw: unknown,
  known: Map<string, Set<string>>,
): { payload: ProposalPayload } | { error: string } {
  const b = raw as Record<string, unknown>;
  if (!b || typeof b !== 'object') return { error: 'body must be an object' };

  const jobId = str(b.jobId, 100);
  const callDate = str(b.callDate, 10);
  if (!jobId) return { error: 'jobId is required' };
  if (!DATE_RE.test(callDate)) return { error: 'callDate must be YYYY-MM-DD' };

  const warnings: string[] = Array.isArray(b.warnings) ? b.warnings.map((w) => str(w, 300)).filter(Boolean) : [];
  const unmatched: Unmatched[] = (Array.isArray(b.unmatched) ? b.unmatched : [])
    .map((u: Record<string, unknown>) => ({ heardName: str(u?.heardName, 100), why: str(u?.why, 300) }))
    .filter((u) => u.heardName);

  const mmdd = callDate.slice(5).replace('-', '');
  const perClient: ClientProposal[] = [];
  const seen = new Set<string>();

  for (const c of (Array.isArray(b.perClient) ? b.perClient : []).slice(0, MAX_CLIENTS) as Record<string, unknown>[]) {
    const slug = str(c?.slug, 100);
    const heardName = str(c?.heardName, 100) || slug;
    const keys = known.get(slug);
    if (!keys) {
      unmatched.push({ heardName, why: `карты «${slug}» среди активных нет` });
      continue;
    }
    if (seen.has(slug)) {
      warnings.push(`${heardName}: вторая запись на ту же карту ${slug} отброшена`);
      continue;
    }
    seen.add(slug);

    const logEntry = str(c.logEntry, MAX_LOG);
    const tasks = (c.tasks ?? {}) as Record<string, unknown>;
    const quotes: Quote[] = (Array.isArray(c.quotes) ? c.quotes : [])
      .map((q: Record<string, unknown>) => ({ ts: str(q?.ts, 12), text: str(q?.text, 600) }))
      .filter((q) => q.text)
      .slice(0, 8);

    const update: TaskUpdate[] = [];
    for (const u of (Array.isArray(tasks.update) ? tasks.update : []) as Record<string, unknown>[]) {
      const key = str(u?.key, 100);
      if (!keys.has(key)) {
        warnings.push(`${heardName}: правка задачи с ключом «${key}», которого в карте нет, отброшена`);
        continue;
      }
      const op: TaskUpdate = { key, ts: str(u.ts, 12), quote: str(u.quote, 600) };
      if (u.drop === true) op.drop = true;
      const title = str(u.title, MAX_TITLE);
      const why = str(u.why, MAX_WHY);
      if (title) op.title = title;
      if (why) op.why = why;
      if (!op.drop && !op.title && !op.why) continue;
      update.push(op);
    }

    const insert: TaskInsert[] = [];
    for (const t of (Array.isArray(tasks.insert) ? tasks.insert : []) as Record<string, unknown>[]) {
      const title = str(t?.title, MAX_TITLE);
      if (!title) continue;
      insert.push({
        title,
        why: str(t.why, MAX_WHY),
        owner: t.owner === 'sasha' ? 'sasha' : 'client',
        ts: str(t.ts, 12),
        quote: str(t.quote, 600),
      });
    }

    // Updates first: changing a task on the roadmap beats piling up a new one.
    const room = Math.max(0, MAX_OPS_PER_CLIENT - update.length);
    if (update.length > MAX_OPS_PER_CLIENT || insert.length > room) {
      warnings.push(`${heardName}: изменений больше ${MAX_OPS_PER_CLIENT}, лишние отброшены`);
    }
    const keptUpdate = update.slice(0, MAX_OPS_PER_CLIENT);
    const keptInsert = insert.slice(0, room).map((t, i) => ({ ...t, key: `gc${mmdd}-${i + 1}` }));

    // The log note is what marks the call as applied to this roadmap: no note, no ops.
    if (!logEntry) {
      warnings.push(`${heardName}: нет записи в журнал, карту не трогаю`);
      continue;
    }
    perClient.push({ slug, heardName, logEntry, tasks: { insert: keptInsert, update: keptUpdate }, quotes });
  }

  return {
    payload: {
      jobId,
      callDate,
      sozvonSlug: str(b.sozvonSlug, 40) || null,
      title: str(b.title, 300) || null,
      perClient,
      unmatched,
      warnings,
    },
  };
}

// ---------- saving and the bot message ----------

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

/** 14.09, or "14.09 (2)" for the second call of the day: the same text marks the log note. */
export function callLabel(callDate: string, sozvonSlug?: string | null): string {
  const [, m, d] = callDate.split('-');
  const n = sozvonSlug?.match(/^\d{4}-\d{2}-\d{2}-(\d+)$/)?.[1];
  return n ? `${d}.${m} (${n})` : `${d}.${m}`;
}

export function noteSource(callDate: string, sozvonSlug?: string | null): string {
  return `групповой созвон ${callLabel(callDate, sozvonSlug)}`;
}

export function viewUrl(id: string): string {
  return `${CABINET}/admin/roadmaps/call-proposals/${id}`;
}

function counts(c: ClientProposal): string {
  const inserted = c.tasks.insert.length;
  const dropped = c.tasks.update.filter((u) => u.drop).length;
  const changed = c.tasks.update.length - dropped;
  return `+${inserted} ${plural(inserted, 'задача', 'задачи', 'задач')}, изменено ${changed}, снято ${dropped}`;
}

/** The one message Sasha gets per call. HTML, well under 4096 characters. */
export function proposalMessage(p: ProposalPayload, names: Map<string, string>): string {
  const head = `🗺 <b>Созвон ${callLabel(p.callDate, p.sozvonSlug)}: правки в карты</b>`;
  const title = p.title ? `<i>${esc(p.title)}</i>` : '';
  const lines = p.perClient.map((c) => `• <b>${esc(names.get(c.slug) || c.heardName)}</b>: ${counts(c)}`);
  const unmatched = p.unmatched.length
    ? `\nБез карты: ${p.unmatched.map((u) => esc(u.heardName)).join(', ')}`
    : '';
  const empty = p.perClient.length ? '' : '\nНикого из клиентов с картой не нашёл, применять нечего.';
  const tail = '\nПока не нажмёшь «Применить», у клиентов ничего не меняется.';

  let text = [head, title, '', ...lines, unmatched, empty, tail].filter((l) => l !== '').join('\n');
  // The list is short by design; this only guards the Telegram limit.
  if (text.length > 4000) text = `${text.slice(0, 3990)}…`;
  return text;
}

export function proposalKeyboard(id: string, applicable: boolean) {
  const view = [{ text: '👀 Посмотреть', url: viewUrl(id) }];
  return {
    inline_keyboard: applicable ? [[{ text: '✅ Применить всё', callback_data: `gcp_ok:${id}` }], view] : [view],
  };
}

/**
 * Buttons while applying and after it. Anything short of a full 'applied'
 * keeps a retry: a run that died mid-apply or failed for some clients can be
 * tapped again, and clients already applied are skipped by the note guard.
 */
export function retryKeyboard(id: string, status: string) {
  const view = [{ text: '👀 Посмотреть', url: viewUrl(id) }];
  if (status === 'applied') return { inline_keyboard: [view] };
  return { inline_keyboard: [[{ text: '🔁 Повторить', callback_data: `gcp_ok:${id}` }], view] };
}

async function clientNames(slugs: string[]): Promise<Map<string, string>> {
  const rows = await prisma.roadmap.findMany({ where: { slug: { in: slugs } }, select: { slug: true, clientName: true } });
  return new Map(rows.map((r) => [r.slug, r.clientName]));
}

/**
 * Stores the proposal and messages Sasha. The same jobId posted again returns
 * the stored row; the message is sent again only if the first send failed.
 */
export async function saveAndNotify(payload: ProposalPayload): Promise<{ id: string; created: boolean; notified: boolean }> {
  const existing = await prisma.roadmapCallProposal.findUnique({ where: { jobId: payload.jobId } });
  let row = existing;
  if (!row) {
    try {
      row = await prisma.roadmapCallProposal.create({
        data: {
          jobId: payload.jobId,
          callDate: new Date(payload.callDate),
          sozvonSlug: payload.sozvonSlug,
          title: payload.title,
          payload: payload as unknown as object,
        },
      });
    } catch {
      // Two posts raced on the unique job id: the other one won.
      row = await prisma.roadmapCallProposal.findUnique({ where: { jobId: payload.jobId } });
      if (!row) throw new Error('proposal was not saved');
    }
  }

  if (row.tgMessageId) return { id: row.id, created: !existing, notified: true };

  const stored = row.payload as unknown as ProposalPayload;
  const admin = await getAdminChatId();
  if (!admin) return { id: row.id, created: !existing, notified: false };

  const names = await clientNames(stored.perClient.map((c) => c.slug));
  const sent = await sendBotMessage(
    Number(admin),
    proposalMessage(stored, names),
    proposalKeyboard(row.id, stored.perClient.length > 0 && row.status === 'pending'),
    'HTML',
  );
  if (sent.ok && sent.messageId) {
    await prisma.roadmapCallProposal.update({
      where: { id: row.id },
      data: { tgChatId: String(admin), tgMessageId: sent.messageId },
    });
  }
  return { id: row.id, created: !existing, notified: sent.ok };
}

// ---------- apply ----------

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/** Rolls a dry-run transaction back after it has done its writes. */
class DryRunRollback extends Error {
  constructor(public result: ClientResult) {
    super('dry run');
  }
}

async function applyClientTx(
  tx: Tx,
  c: ClientProposal,
  meta: { callDate: string; source: string },
): Promise<ClientResult> {
  const roadmap = await tx.roadmap.findUnique({
    where: { slug: c.slug },
    select: {
      id: true,
      clientName: true,
      archived: true,
      clientVisible: true,
      tasks: { select: { id: true, key: true, status: true, position: true } },
    },
  });
  const res: ClientResult = { slug: c.slug, name: c.heardName, status: 'applied', inserted: 0, updated: 0, dropped: 0, warnings: [] };
  if (!roadmap) return { ...res, status: 'failed', error: 'карта не найдена' };
  res.name = roadmap.clientName;
  if (roadmap.archived) return { ...res, status: 'skipped', error: 'карта в архиве' };

  // The log note marks the call as applied to this roadmap: a second tap or a
  // retry after a timeout finds it and changes nothing. Looked up by source
  // alone, whatever its visibility.
  const already = await tx.roadmapNote.findFirst({
    where: { roadmapId: roadmap.id, source: meta.source },
    select: { id: true },
  });
  if (already) return { ...res, status: 'skipped', warnings: ['этот созвон уже внесён в карту'] };

  for (const u of c.tasks.update) {
    const matches = roadmap.tasks.filter((t) => t.key === u.key);
    if (matches.length !== 1) {
      res.warnings.push(`задача «${u.key}» ${matches.length ? 'встречается дважды' : 'пропала из карты'}, пропустил`);
      continue;
    }
    const task = matches[0];
    if (task.status === 'done') {
      res.warnings.push(`задача «${u.key}» уже сделана, не трогал`);
      continue;
    }
    if (u.drop) {
      if (task.status === 'dropped') continue;
      await tx.roadmapTask.update({ where: { id: task.id }, data: { status: 'dropped' } });
      res.dropped += 1;
      continue;
    }
    const data: { title?: string; why?: string } = {};
    if (u.title) data.title = u.title;
    if (u.why) data.why = u.why;
    await tx.roadmapTask.update({ where: { id: task.id }, data });
    res.updated += 1;
  }

  const taken = new Set(roadmap.tasks.map((t) => t.key).filter(Boolean));
  let position = roadmap.tasks.reduce((max, t) => Math.max(max, t.position), -1);
  for (const t of c.tasks.insert) {
    const base = t.key || `gc-${meta.callDate.slice(5).replace('-', '')}`;
    let key = base;
    for (let n = 2; taken.has(key); n += 1) key = `${base}-${n}`;
    taken.add(key);
    position += 1;
    await tx.roadmapTask.create({
      data: {
        roadmapId: roadmap.id,
        key,
        position,
        title: t.title,
        why: t.why || null,
        owner: t.owner,
        status: 'todo',
        // Same rule as opening a roadmap: the client sees his own tasks, Sasha's stay internal.
        visibility: t.owner === 'client' && roadmap.clientVisible ? 'shared' : 'internal',
      },
    });
    res.inserted += 1;
  }

  await tx.roadmapNote.create({
    data: {
      roadmapId: roadmap.id,
      kind: 'decision',
      body: c.logEntry,
      source: meta.source,
      happenedOn: new Date(meta.callDate),
      // Internal: the call summary reaches clients elsewhere. The guard above
      // matches on source only, so visibility never affects re-apply.
      visibility: 'internal',
    },
  });

  await tx.roadmap.update({ where: { id: roadmap.id }, data: { lastTouchAt: new Date() } });
  return res;
}

/**
 * Applies every client of a payload, each in its own transaction. With dryRun
 * each transaction does its writes and is rolled back: the result shows what
 * would happen against the live roadmaps.
 */
export async function applyPayload(p: ProposalPayload, opts: { dryRun?: boolean } = {}): Promise<ClientResult[]> {
  const meta = { callDate: p.callDate, source: noteSource(p.callDate, p.sozvonSlug) };
  const results: ClientResult[] = [];

  // Sequential on purpose: a handful of clients, and one connection at a time
  // keeps the webhook well inside the pool.
  for (const c of p.perClient) {
    try {
      const r = await prisma.$transaction(
        async (tx) => {
          const res = await applyClientTx(tx, c, meta);
          if (opts.dryRun) throw new DryRunRollback(res);
          return res;
        },
        { timeout: 20_000 },
      );
      results.push(r);
    } catch (err) {
      if (err instanceof DryRunRollback) {
        results.push(err.result);
        continue;
      }
      results.push({
        slug: c.slug,
        name: c.heardName,
        status: 'failed',
        inserted: 0,
        updated: 0,
        dropped: 0,
        warnings: [],
        error: String((err as Error)?.message || err).slice(0, 300),
      });
    }
  }
  return results;
}

/** Result lines for the bot message after the tap. */
export function resultMessage(p: ProposalPayload, results: ClientResult[]): string {
  const lines = results.map((r) => {
    if (r.status === 'failed') return `❌ <b>${esc(r.name)}</b>: не внёс, ${esc(r.error || 'ошибка')}`;
    if (r.status === 'skipped') return `⏭ <b>${esc(r.name)}</b>: ${esc(r.error || r.warnings[0] || 'пропустил')}`;
    const w = r.warnings.length ? `\n   ⚠️ ${r.warnings.map(esc).join('; ')}` : '';
    return `✅ <b>${esc(r.name)}</b>: +${r.inserted}, изменено ${r.updated}, снято ${r.dropped}${w}`;
  });
  const text = [`🗺 <b>Созвон ${callLabel(p.callDate, p.sozvonSlug)}: внёс в карты</b>`, '', ...lines].join('\n');
  return text.length > 4000 ? `${text.slice(0, 3990)}…` : text;
}

/** A run stuck in 'applying' longer than this is taken as dead and can be claimed again. */
export const STALE_CLAIM_MS = 3 * 60 * 1000;

/**
 * Claims the proposal with one conditional update, so two taps never both win.
 * Claimable: pending, failed, partial, or applying with a claim older than
 * STALE_CLAIM_MS (the function died mid-apply).
 */
export async function claimProposal(id: string): Promise<{ claimed: true } | { claimed: false; text: string }> {
  const now = new Date();
  const stale = new Date(now.getTime() - STALE_CLAIM_MS);
  const claim = await prisma.roadmapCallProposal.updateMany({
    where: {
      id,
      OR: [
        { status: { in: ['pending', 'failed', 'partial'] } },
        { status: 'applying', OR: [{ claimedAt: null }, { claimedAt: { lt: stale } }] },
      ],
    },
    data: { status: 'applying', claimedAt: now },
  });
  if (claim.count === 1) return { claimed: true };

  const row = await prisma.roadmapCallProposal.findUnique({ where: { id }, select: { status: true } });
  if (!row) return { claimed: false, text: 'предложение не найдено' };
  if (row.status === 'applying') return { claimed: false, text: 'уже применяется. Если зависло, повтори через 3 минуты' };
  return { claimed: false, text: 'уже применено' };
}

/** Applies a proposal this call has claimed and stores the outcome. */
export async function runClaimedProposal(id: string): Promise<{ ok: boolean; status: string; text: string }> {
  const row = await prisma.roadmapCallProposal.findUniqueOrThrow({ where: { id } });
  const payload = row.payload as unknown as ProposalPayload;

  let results: ClientResult[];
  try {
    results = await applyPayload(payload);
  } catch (err) {
    await prisma.roadmapCallProposal.update({
      where: { id },
      data: { status: 'failed', result: { error: String((err as Error)?.message || err) } },
    });
    return { ok: false, status: 'failed', text: 'не получилось применить, подробности на странице предложения' };
  }

  const failed = results.filter((r) => r.status === 'failed').length;
  const status = failed === 0 ? 'applied' : failed === results.length ? 'failed' : 'partial';
  await prisma.roadmapCallProposal.update({
    where: { id },
    data: { status, result: results as unknown as object, appliedAt: new Date() },
  });

  return { ok: failed === 0, status, text: resultMessage(payload, results) };
}

/** Claim plus apply in one call, for callers that do not need the split. */
export async function applyProposal(
  id: string,
): Promise<{ claimed: boolean; ok: boolean; status?: string; text: string }> {
  const claim = await claimProposal(id);
  if (!claim.claimed) return { claimed: false, ok: false, text: claim.text };
  return { claimed: true, ...(await runClaimedProposal(id)) };
}
