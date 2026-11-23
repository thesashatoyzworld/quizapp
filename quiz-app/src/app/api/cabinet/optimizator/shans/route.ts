import { NextRequest, NextResponse } from 'next/server';
import { verifiedViewer } from '@/lib/reels/store';
import { prisma } from '@/lib/prisma';
import { saveShans, scoreShans } from '@/lib/optimizator/shans';
import type { Shans } from '@/lib/optimizator/view';

export const runtime = 'nodejs';
export const maxDuration = 120;

// «Шанс на залёт» for a saved run (owner only), computed once and stored in the run.
// New runs get it inside the analysis; this fills older runs when they are opened.
//   POST /api/cabinet/optimizator/shans { id } → { shans } | { error }
export async function POST(request: NextRequest) {
  const tg = verifiedViewer(request);
  if (!tg) return NextResponse.json({ error: 'Войди через Telegram.' }, { status: 401 });
  let id = '';
  try { id = String(((await request.json()) as { id?: unknown }).id ?? ''); } catch { /* empty */ }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Нет разбора.' }, { status: 400 });
  const run = await prisma.optimizatorRun.findFirst({ where: { id, telegramId: BigInt(tg), status: 'ok' }, select: { script: true, result: true } });
  if (!run?.result) return NextResponse.json({ error: 'Разбор не найден.' }, { status: 404 });
  const res = run.result as unknown as { shans?: Shans };
  if (res.shans) return NextResponse.json({ shans: res.shans });
  const s = await scoreShans(run.script);
  if (!s) return NextResponse.json({ error: 'Не получилось посчитать шанс. Попробуй ещё раз через минуту.' }, { status: 502 });
  await saveShans(id, s);
  return NextResponse.json({ shans: s });
}
