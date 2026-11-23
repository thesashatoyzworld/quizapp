import { NextRequest, NextResponse, after } from 'next/server';
import { verifiedViewer } from '@/lib/reels/store';
import { prisma } from '@/lib/prisma';
import { buildNachala, saveNachala } from '@/lib/optimizator/nachala';
import { buildTelo } from '@/lib/optimizator/telo';
import type { Analysis, Nachala } from '@/lib/optimizator/view';

export const runtime = 'nodejs';
// Bundles (formula + editor) take 2-4 min; the build runs after the response (after()), within this budget.
export const maxDuration = 800;

/** A job older than this is considered dead (the function was killed) and may be started again. */
const STALE_MS = 14 * 60_000;

type Res = Analysis & { nachala?: Nachala; nachala_pending?: number; nachala_error?: string };

async function mark(id: string, key: 'nachala_pending' | 'nachala_error', value: number | string | null): Promise<void> {
  if (value === null) {
    await prisma.$executeRaw`UPDATE optimizator_runs SET result = result::jsonb - ${key} WHERE id = ${id}`;
  } else {
    await prisma.$executeRaw`UPDATE optimizator_runs SET result = jsonb_set(result::jsonb, ${`{${key}}`}::text[], ${JSON.stringify(value)}::jsonb) WHERE id = ${id}`;
  }
}

// «Начало из залётов» for a saved run (owner only), built once in the background and stored in the run:
//   POST /api/cabinet/optimizator/nachala { id } → { nachala } | { pending: true } | { error }
// 23.11: the build no longer holds the request (a tunnel or proxy cuts a request at ~100 s, the bundles take 2-4 min):
// the first call starts it and answers pending, the screen asks again every few seconds.
// Not counted against the monthly limit: it completes the analysis the student already paid a slot for.
export async function POST(request: NextRequest) {
  const tg = verifiedViewer(request);
  if (!tg) return NextResponse.json({ error: 'Войди через Telegram.' }, { status: 401 });
  let id = '';
  try { id = String(((await request.json()) as { id?: unknown }).id ?? ''); } catch { /* empty */ }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Нет разбора.' }, { status: 400 });
  const run = await prisma.optimizatorRun.findFirst({ where: { id, telegramId: BigInt(tg), status: 'ok' }, select: { script: true, result: true } });
  if (!run?.result) return NextResponse.json({ error: 'Разбор не найден.' }, { status: 404 });
  const res = run.result as unknown as Res;
  // v5 (23.11 bundles with their chance + the body edited up to the top band); older cached picks are rebuilt once.
  if (res.nachala?.v === 5) return NextResponse.json({ nachala: res.nachala });
  if (res.nachala_error) {
    await mark(id, 'nachala_error', null);
    return NextResponse.json({ error: 'Не получилось подобрать начало. Попробуй ещё раз через минуту.' }, { status: 502 });
  }
  if (res.nachala_pending && Date.now() - res.nachala_pending < STALE_MS) return NextResponse.json({ pending: true });

  await mark(id, 'nachala_pending', Date.now());
  after(async () => {
    try {
      // the student's Instagram, so his own hits go first (optimizator_ig from students.json, else the reels space header)
      const ig = await prisma.$queryRaw<{ ig: string }[]>`SELECT ig FROM optimizator_ig WHERE telegram_id = ${BigInt(tg)} LIMIT 1`.catch(() => []);
      const ownAuthor = ig[0]?.ig || (await prisma.reelSpace.findUnique({ where: { telegramId: BigInt(tg) }, select: { igHandle: true } }).catch(() => null))?.igHandle || undefined;
      const n = await buildNachala(run.script, res.format?.type, { stop: res.viewer_reasons?.stop, rewrite: res.rewrite?.script, ownAuthor });
      // «было»: the run's own chance, read now (it is scored in parallel with the bundles)
      const now = await prisma.optimizatorRun.findUnique({ where: { id }, select: { result: true } }).catch(() => null);
      const own = (now?.result as unknown as { shans?: { hitShare?: number } } | null)?.shans?.hitShare;
      if (typeof own === 'number') n.origShare = own;
      // 23.11 «довести до верхней ступени»: the body is edited on top of the best usable bundle (or the script itself)
      const cands = [...n.picks.filter((p) => p.editor?.usable !== false).map((p) => ({ text: p.text, share: p.shans?.hitShare, speech: p.speech })),
        ...(n.fallback?.versions || []).filter((v) => v.kind !== 'own').map((v) => ({ text: v.text, share: v.shans?.hitShare, speech: v.speech }))]
        .filter((c) => c.text && typeof c.share === 'number' && (own === undefined || c.share! >= own))
        .sort((a, b) => b.share! - a.share!);
      const base = cands[0];
      const telo = await buildTelo(base?.text || run.script, base?.share ?? own ?? 0);
      if (telo && base) telo.base = base.speech;
      n.telo = telo;
      n.v = 5;
      await saveNachala(id, n);
      console.log(`[optimizator/nachala] ${id}: ${n.picks.length} picks, own ${ownAuthor || '-'}, fallback ${n.fallback?.versions.length ?? 0}, best ${JSON.stringify(n.best)}, telo ${n.telo ? `${Math.round(n.telo.before * 100)}→${Math.round(n.telo.share * 100)}` : '-'}, ${Math.round(n.ms / 1000)} s`);
    } catch (err) {
      console.error('[optimizator/nachala] failed', id, String((err as Error)?.message || err).slice(0, 300));
      await mark(id, 'nachala_error', String((err as Error)?.message || err).slice(0, 200)).catch(() => {});
    } finally {
      await mark(id, 'nachala_pending', null).catch(() => {});
    }
  });
  return NextResponse.json({ pending: true });
}
