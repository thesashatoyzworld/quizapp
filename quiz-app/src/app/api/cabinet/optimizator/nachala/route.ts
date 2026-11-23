import { NextRequest, NextResponse } from 'next/server';
import { verifiedViewer } from '@/lib/reels/store';
import { prisma } from '@/lib/prisma';
import { buildNachala, saveNachala } from '@/lib/optimizator/nachala';
import type { Analysis, Nachala } from '@/lib/optimizator/view';

export const runtime = 'nodejs';
// Payoff + pick (Opus) + 3 checks and up to 3 narrowings: typically 60-120 s.
export const maxDuration = 300;

// «Начало из залётов» for a saved run (owner only), built once and stored in the run:
//   POST /api/cabinet/optimizator/nachala { id } → { nachala } | { error }
// Not counted against the monthly limit: it completes the analysis the student already paid a slot for.
export async function POST(request: NextRequest) {
  const tg = verifiedViewer(request);
  if (!tg) return NextResponse.json({ error: 'Войди через Telegram.' }, { status: 401 });
  let id = '';
  try { id = String(((await request.json()) as { id?: unknown }).id ?? ''); } catch { /* empty */ }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Нет разбора.' }, { status: 400 });
  const run = await prisma.optimizatorRun.findFirst({ where: { id, telegramId: BigInt(tg), status: 'ok' }, select: { script: true, result: true } });
  if (!run?.result) return NextResponse.json({ error: 'Разбор не найден.' }, { status: 404 });
  const res = run.result as unknown as Analysis & { nachala?: Nachala };
  // v3 (23.11 bundles: formula + editor, what goes right after); older cached picks are rebuilt once.
  if (res.nachala?.v === 3) return NextResponse.json({ nachala: res.nachala });
  try {
    // the student's Instagram, so his own hits go first (optimizator_ig from students.json, else the reels space header)
    const ig = await prisma.$queryRaw<{ ig: string }[]>`SELECT ig FROM optimizator_ig WHERE telegram_id = ${BigInt(tg)} LIMIT 1`.catch(() => []);
    const ownAuthor = ig[0]?.ig || (await prisma.reelSpace.findUnique({ where: { telegramId: BigInt(tg) }, select: { igHandle: true } }).catch(() => null))?.igHandle || undefined;
    const n = await buildNachala(run.script, res.format?.type, { stop: res.viewer_reasons?.stop, rewrite: res.rewrite?.script, ownAuthor });
    if (n.picks.length || n.empty) await saveNachala(id, n);
    console.log(`[optimizator/nachala] ${id}: ${n.picks.length} picks, fits ${n.picks.filter((p) => p.fits).length}, orig ${n.orig.check.delivered} ${n.orig.fam?.id}, best ${JSON.stringify(n.best)}, ${Math.round(n.ms / 1000)} s`);
    return NextResponse.json({ nachala: n });
  } catch (err) {
    console.error('[optimizator/nachala] failed', id, String((err as Error)?.message || err).slice(0, 300));
    return NextResponse.json({ error: 'Не получилось подобрать начало. Попробуй ещё раз через минуту.' }, { status: 502 });
  }
}
