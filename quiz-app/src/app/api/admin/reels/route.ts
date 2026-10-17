import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { refreshStats, versionView } from '@/lib/reels/store';
import { autoPlan, codeOf, STAGES, todayIso, type Stage } from '@/lib/reels/plan';

export const runtime = 'nodejs';
export const maxDuration = 300;

// Правки доски роликов из /admin/reels/[tg]. Поля белыми списками.
//
//   GET  ?brief=<id>                      → { html } для просмотра ТЗ
//   POST { op: 'space', telegramId, data } — имя и инстаграм в шапке
//   POST { op: 'create'|'update'|'delete', entity: 'brief'|'version', ... }
//   POST { op: 'autoplan', telegramId }    — «расставить по дням»
//   POST { op: 'stats', telegramId }       — обновить просмотры (Apify)

type Entity = 'brief' | 'version';

const FIELDS: Record<Entity, string[]> = {
  brief: ['order', 'title', 'label', 'summary', 'state', 'stateLabel', 'html'],
  version: ['briefId', 'reel', 'title', 'version', 'order', 'stage', 'planDate', 'uploadedAt', 'note'],
};
const INT_FIELDS = new Set(['order']);
const DATE_FIELDS = new Set(['planDate', 'uploadedAt']);
const REQUIRED: Record<Entity, string[]> = { brief: ['title'], version: ['briefId', 'reel', 'title'] };
const BRIEF_STATES = new Set(['ok', 'wait', 'go']);

function pick(entity: Entity, data: Record<string, unknown>): Record<string, unknown> | string {
  const out: Record<string, unknown> = {};
  for (const key of FIELDS[entity]) {
    if (!(key in data)) continue;
    const raw = data[key];
    if (raw === '' || raw === null) {
      if (REQUIRED[entity].includes(key)) return `пустое поле ${key}`;
      out[key] = key === 'order' ? 0 : null;
      continue;
    }
    if (INT_FIELDS.has(key)) {
      const n = Number(raw);
      out[key] = Number.isFinite(n) ? Math.round(n) : 0;
    } else if (DATE_FIELDS.has(key)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(raw))) return `неверная дата ${key}`;
      out[key] = new Date(`${raw}T00:00:00Z`);
    } else {
      out[key] = String(raw);
    }
  }
  if ('stage' in out && !STAGES.includes(out.stage as Stage)) return 'неизвестный этап';
  if ('state' in out && out.state != null && !BRIEF_STATES.has(out.state as string)) return 'неизвестный статус ТЗ';
  return out;
}

/** Этап сменился: тянем за ним связанные поля, как в трекере. */
function stageSideEffects(data: Record<string, unknown>, link: unknown): string | null {
  if (!('stage' in data)) return null;
  if (data.stage === 'up') {
    const code = codeOf(typeof link === 'string' ? link : '');
    if (!code) return 'нужна ссылка вида instagram.com/reel/…';
    data.code = code;
    data.planDate = null;
    if (!('uploadedAt' in data) || !data.uploadedAt) data.uploadedAt = new Date(`${todayIso()}T00:00:00Z`);
    return null;
  }
  // Сняли отметку «выложен»: ссылка и цифры относятся к рилсу, которого больше нет.
  Object.assign(data, { code: null, uploadedAt: null, plays: null, likes: null, comments: null, statsAt: null });
  if (data.stage === 'tz') data.planDate = null;
  return null;
}

function tgOf(raw: unknown): bigint | null {
  return typeof raw === 'string' || typeof raw === 'number' ? (/^\d+$/.test(String(raw)) ? BigInt(String(raw)) : null) : null;
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = request.nextUrl.searchParams.get('brief') || '';
  const brief = await prisma.reelBrief.findUnique({ where: { id }, select: { html: true } });
  if (!brief?.html) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ html: brief.html });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const op = body.op as string;

  try {
    if (op === 'space') {
      const telegramId = tgOf(body.telegramId);
      if (!telegramId) return NextResponse.json({ error: 'Missing telegramId' }, { status: 400 });
      const clientName = String(body.data?.clientName ?? '').trim() || null;
      const igHandle = String(body.data?.igHandle ?? '').trim().replace(/^@/, '') || null;
      await prisma.reelSpace.upsert({
        where: { telegramId },
        create: { telegramId, clientName, igHandle },
        update: { clientName, igHandle },
      });
      return NextResponse.json({ ok: true });
    }

    if (op === 'autoplan' || op === 'stats') {
      const telegramId = tgOf(body.telegramId);
      if (!telegramId) return NextResponse.json({ error: 'Missing telegramId' }, { status: 400 });
      if (op === 'stats') return NextResponse.json({ ok: true, ...(await refreshStats([telegramId])) });

      const rows = await prisma.reelVersion.findMany({ where: { telegramId } });
      const plan = autoPlan(rows.map(versionView), todayIso());
      for (const p of plan) {
        await prisma.reelVersion.update({ where: { id: p.id }, data: { planDate: new Date(`${p.planDate}T00:00:00Z`) } });
      }
      return NextResponse.json({ ok: true, planned: plan.length });
    }

    const entity = body.entity as Entity;
    if (!FIELDS[entity]) return NextResponse.json({ error: 'Unknown entity' }, { status: 400 });
    const delegate = entity === 'brief' ? prisma.reelBrief : prisma.reelVersion;

    if (op === 'delete') {
      if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
      if (entity === 'brief' && (await prisma.reelVersion.count({ where: { briefId: body.id } })) > 0) {
        return NextResponse.json({ error: 'в ТЗ есть версии: сначала удали их' }, { status: 400 });
      }
      // @ts-expect-error union of delegates, both have delete
      await delegate.delete({ where: { id: body.id } });
      return NextResponse.json({ ok: true });
    }

    if (op !== 'create' && op !== 'update') return NextResponse.json({ error: 'Unknown op' }, { status: 400 });

    const data = pick(entity, body.data || {});
    if (typeof data === 'string') return NextResponse.json({ error: data }, { status: 400 });
    if (entity === 'version') {
      const err = stageSideEffects(data, body.data?.link);
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }

    // Владелец строки: при создании из тела, при правке из самой строки.
    let telegramId: bigint | null;
    if (op === 'create') {
      telegramId = tgOf(body.telegramId);
      if (!telegramId) return NextResponse.json({ error: 'Missing telegramId' }, { status: 400 });
      const missing = REQUIRED[entity].find((k) => !data[k]);
      if (missing) return NextResponse.json({ error: `пустое поле ${missing}` }, { status: 400 });
    } else {
      if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
      // @ts-expect-error union of delegates, both have findUnique
      const row = (await delegate.findUnique({ where: { id: body.id }, select: { telegramId: true } })) as { telegramId: bigint } | null;
      if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });
      telegramId = row.telegramId;
    }

    // Версия может жить только в ТЗ того же клиента.
    if (entity === 'version' && data.briefId) {
      const brief = await prisma.reelBrief.findFirst({ where: { id: data.briefId as string, telegramId } });
      if (!brief) return NextResponse.json({ error: 'ТЗ не найдено' }, { status: 400 });
    }

    if (op === 'create') {
      // @ts-expect-error union of delegates, both have create
      const created = await delegate.create({ data: { ...data, telegramId } });
      return NextResponse.json({ ok: true, id: created.id });
    }
    // @ts-expect-error union of delegates, both have update
    await delegate.update({ where: { id: body.id }, data });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown';
    console.error('reels write failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
