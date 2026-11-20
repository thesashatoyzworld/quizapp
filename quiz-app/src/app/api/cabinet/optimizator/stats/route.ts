import { NextRequest, NextResponse } from 'next/server';
import { verifiedViewer } from '@/lib/reels/store';
import { prisma } from '@/lib/prisma';
import { UNLIMITED_IDS } from '@/lib/optimizator/config';
import { cleanMetrics, confirmStats, createStats, deleteStats, readScreens, statsForRun, statsImage } from '@/lib/optimizator/stats';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Stats screenshots of a published reel, attached to a run (owner only).
//   POST   multipart { runId, files[] (≤4 images, ≤3 MB each, compressed on the client) } → { id, metrics } (draft)
//   PUT    { id, opening, reelUrl, metrics }  → { ok, stats } (student checked the numbers)
//   DELETE { id } → { ok }
//   GET    ?img=<uuid> → the screenshot (owner or Sasha)
const MAX_BYTES = 3 * 1024 * 1024;
const MAX_FILES = 4;
const MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const err = (status: number, error: string) => NextResponse.json({ error }, { status });

function cleanOpening(v: unknown): string | null {
  const s = typeof v === 'string' ? v.trim().slice(0, 300) : '';
  return s || null;
}
function cleanUrl(v: unknown): string | null {
  const s = typeof v === 'string' ? v.trim() : '';
  return /^https?:\/\/(www\.)?instagram\.com\//i.test(s) ? s.slice(0, 300) : null;
}

async function ownsRun(runId: string, tg: number): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(runId)) return false;
  const r = await prisma.optimizatorRun.findFirst({ where: { id: runId, telegramId: BigInt(tg), status: 'ok' }, select: { id: true } });
  return !!r;
}

export async function POST(request: NextRequest) {
  const tg = verifiedViewer(request);
  if (!tg) return err(401, 'Войди через Telegram.');
  let form: FormData;
  try { form = await request.formData(); } catch { return err(400, 'Не получилось прочитать файлы.'); }
  const runId = String(form.get('runId') || '');
  if (!(await ownsRun(runId, tg))) return err(404, 'Разбор не найден.');
  const files = form.getAll('files').filter((f): f is File => f instanceof Blob).slice(0, MAX_FILES);
  if (!files.length) return err(400, 'Приложи хотя бы один скрин статистики.');
  const images: { mime: string; data: Buffer }[] = [];
  for (const f of files) {
    if (!MIMES.has(f.type)) return err(400, 'Нужны картинки: скрины статистики (jpg или png).');
    if (f.size > MAX_BYTES) return err(400, 'Скрин больше 3 МБ.');
    images.push({ mime: f.type, data: Buffer.from(await f.arrayBuffer()) });
  }
  try {
    const metrics = await readScreens(images);
    const id = await createStats({ runId, telegramId: tg, opening: cleanOpening(form.get('opening')), reelUrl: cleanUrl(form.get('reelUrl')), metrics, images });
    return NextResponse.json({ id, metrics });
  } catch (e) {
    console.error('[optimizator/stats] read failed', runId, String((e as Error)?.message || e).slice(0, 300));
    return err(502, 'Не получилось прочитать скрины. Попробуй ещё раз.');
  }
}

export async function PUT(request: NextRequest) {
  const tg = verifiedViewer(request);
  if (!tg) return err(401, 'Войди через Telegram.');
  let b: { id?: unknown; opening?: unknown; reelUrl?: unknown; metrics?: unknown; runId?: unknown };
  try { b = await request.json(); } catch { return err(400, 'Не получилось прочитать запрос.'); }
  const id = String(b.id || '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return err(400, 'Нет записи.');
  const metrics = cleanMetrics((b.metrics && typeof b.metrics === 'object' ? b.metrics : {}) as Record<string, unknown>);
  const ok = await confirmStats(id, tg, { opening: cleanOpening(b.opening), reelUrl: cleanUrl(b.reelUrl), metrics });
  if (!ok) return err(404, 'Запись не найдена.');
  const runId = String(b.runId || '');
  return NextResponse.json({ ok: true, stats: (await ownsRun(runId, tg)) ? await statsForRun(runId) : undefined });
}

export async function DELETE(request: NextRequest) {
  const tg = verifiedViewer(request);
  if (!tg) return err(401, 'Войди через Telegram.');
  let id = '';
  try { id = String(((await request.json()) as { id?: unknown }).id || ''); } catch { /* empty */ }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return err(400, 'Нет записи.');
  return NextResponse.json({ ok: await deleteStats(id, tg) });
}

export async function GET(request: NextRequest) {
  const tg = verifiedViewer(request);
  const id = request.nextUrl.searchParams.get('img') || '';
  if (!tg || !/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse('not found', { status: 404 });
  const im = await statsImage(id, tg, UNLIMITED_IDS.has(tg));
  if (!im) return new NextResponse('not found', { status: 404 });
  return new NextResponse(new Uint8Array(im.data), { headers: { 'Content-Type': im.mime, 'Cache-Control': 'private, max-age=86400' } });
}
