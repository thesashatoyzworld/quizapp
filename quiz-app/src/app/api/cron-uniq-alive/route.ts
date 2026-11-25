// Каждые 10 минут: жив ли сервер уникализатора (uniq.thesashatoyz.com на VPS).
// 25.11 VPS пролежал ~час, узнали из отзывов людей. Проверка снаружи, с Vercel:
// если сервер лежит, его собственные алерты не дойдут. Пишет Саше только при смене
// состояния (упал / поднялся), состояние в events type uniq_alive.
import { NextRequest, NextResponse } from 'next/server';
import { sendBotMessage } from '@/lib/telegram';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SASHA = 788334680;
const URL_ME = 'https://uniq.thesashatoyz.com/api/me';

async function ping(): Promise<string | null> {
  try {
    const r = await fetch(URL_ME, { signal: AbortSignal.timeout(8000), cache: 'no-store' });
    // 401 без токена = сервис отвечает; 5xx = Caddy жив, сервис нет.
    return r.status < 500 ? null : `HTTP ${r.status}`;
  } catch (e) {
    return String((e as Error)?.message || e).slice(0, 120);
  }
}

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let err = await ping();
  if (err) { await new Promise((r) => setTimeout(r, 5000)); err = await ping(); }
  const up = !err;

  const last = await prisma.event.findFirst({ where: { type: 'uniq_alive' }, orderBy: { createdAt: 'desc' } });
  const wasUp = (last?.metadata as { up?: boolean } | null)?.up ?? true;
  if (up === wasUp) return NextResponse.json({ up, changed: false });

  await prisma.event.create({ data: { type: 'uniq_alive', source: 'uniq', metadata: { up, err, at: Date.now() } } });
  // created_at без зоны и съезжает при чтении, поэтому время берём из metadata.at.
  const lastAt = (last?.metadata as { at?: number } | null)?.at;
  const since = lastAt ? Math.round((Date.now() - lastAt) / 60000) : null;
  const text = up
    ? `✅ Уникализатор снова отвечает${since !== null ? ` (лежал ~${since} мин)` : ''}.`
    : `🔴 Уникализатор не отвечает: ${err}.\nПроверь сервер toyz-cloud-nl в Timeweb (или скажи Claude «подними уникализатор»).`;
  await sendBotMessage(SASHA, text, undefined, null);
  return NextResponse.json({ up, changed: true, err });
}
