// Stats of a published reel, from the student's own screenshots of Instagram insights. The point: close the loop
// opening → live numbers. Skip rate is the opening's own number (Sasha's re-uploads: ±4 pp), so with the chosen
// opening stored next to it the optimizer can be checked on real reels, not on a model judge.
// One Sonnet vision call reads the numbers; the student checks and fixes them before saving. Server only.
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';
import type { ReelMetrics, StatsEntry } from './view';
import { METRIC_KEYS } from './view';

const anthropic = new Anthropic();
const MODEL = 'claude-sonnet-5-5';

const READ = `На скриншотах статистика одного рилса из Instagram (раздел «Статистика» / Insights), иногда на русском, иногда на английском, может быть несколько экранов.
Выпиши числа, которые видишь. Не угадывай: если числа нет на скринах, ставь null. «1,2 тыс.» = 1200, «12,5K» = 12500. Проценты пиши числом без знака %.
Поля:
- views: просмотры / воспроизведения (Views, Plays)
- reach: охват, аккаунтов охвачено (Accounts reached)
- likes, comments, shares (репосты/отправки, Shares), saves (сохранения), reposts (репосты в ленту, Reposts)
- follows: подписки с этого рилса
- skip_rate: доля пропусков, % («Доля пропусков», «Пропустили», Skip rate)
- avg_watch_s: среднее время просмотра в секундах («Среднее время просмотра»; 0:12 = 12)
- watch_total_s: общее время просмотра в секундах (часы/минуты переведи в секунды)
- duration_s: длительность ролика в секундах, если видна
- nonfollowers_pct: доля просмотров/охвата НЕ подписчиков, %
- published: дата публикации, если видна, в формате ГГГГ-ММ-ДД
Верни только JSON-объект с этими ключами.`;

export async function readScreens(images: { mime: string; data: Buffer }[]): Promise<ReelMetrics> {
  const msg = await anthropic.messages.create({
    model: MODEL, max_tokens: 8000, thinking: { type: 'adaptive' }, output_config: { effort: 'low' },
    messages: [{
      role: 'user',
      content: [
        ...images.map((im) => ({
          type: 'image' as const,
          source: { type: 'base64' as const, media_type: im.mime as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif', data: im.data.toString('base64') },
        })),
        { type: 'text' as const, text: READ },
      ],
    }],
  });
  await recordAnthropicUsage(MODEL, msg.usage, 'optimizator');
  const t = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
  const a = t.indexOf('{'); const b = t.lastIndexOf('}');
  let raw: Record<string, unknown> = {};
  try { raw = a >= 0 ? JSON.parse(t.slice(a, b + 1)) : {}; } catch { raw = {}; }
  return cleanMetrics(raw);
}

/** Keep known keys only: numbers ≥ 0 (percents ≤ 100), published as YYYY-MM-DD. */
export function cleanMetrics(raw: Record<string, unknown>): ReelMetrics {
  const out: ReelMetrics = {};
  for (const k of METRIC_KEYS) {
    const v = raw[k];
    if (k === 'published') {
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) out.published = v;
      continue;
    }
    const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v.replace(/\s/g, '').replace(',', '.')) : NaN;
    if (!Number.isFinite(n) || n < 0) continue;
    if ((k === 'skip_rate' || k === 'nonfollowers_pct') && n > 100) continue;
    out[k] = Math.round(n * 10) / 10;
  }
  return out;
}

export async function createStats(data: {
  runId: string; telegramId: number; opening: string | null; reelUrl: string | null; metrics: ReelMetrics; images: { mime: string; data: Buffer }[];
}): Promise<string> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    INSERT INTO optimizator_stats (run_id, telegram_id, opening, reel_url, metrics, status)
    VALUES (${data.runId}, ${BigInt(data.telegramId)}, ${data.opening}, ${data.reelUrl}, ${JSON.stringify(data.metrics)}::jsonb, 'draft')
    RETURNING id::text AS id`;
  const id = rows[0].id;
  for (const im of data.images) {
    await prisma.$executeRaw`INSERT INTO optimizator_stats_images (stats_id, mime, data) VALUES (${id}::uuid, ${im.mime}, ${im.data})`;
  }
  return id;
}

/** The student confirms (and may correct) the numbers. Owner only. */
export async function confirmStats(id: string, telegramId: number, upd: { opening: string | null; reelUrl: string | null; metrics: ReelMetrics }): Promise<boolean> {
  const n = await prisma.$executeRaw`
    UPDATE optimizator_stats SET opening = ${upd.opening}, reel_url = ${upd.reelUrl}, metrics = ${JSON.stringify(upd.metrics)}::jsonb, status = 'ok'
     WHERE id = ${id}::uuid AND telegram_id = ${BigInt(telegramId)}`;
  return n > 0;
}

export async function deleteStats(id: string, telegramId: number): Promise<boolean> {
  const n = await prisma.$executeRaw`DELETE FROM optimizator_stats WHERE id = ${id}::uuid AND telegram_id = ${BigInt(telegramId)}`;
  return n > 0;
}

export async function statsForRun(runId: string): Promise<StatsEntry[]> {
  const rows = await prisma.$queryRaw<{ id: string; created_at: Date; opening: string | null; reel_url: string | null; metrics: ReelMetrics | null; status: string; images: string[] | null }[]>`
    SELECT s.id::text AS id, s.created_at, s.opening, s.reel_url, s.metrics, s.status,
           (SELECT array_agg(i.id::text ORDER BY i.created_at) FROM optimizator_stats_images i WHERE i.stats_id = s.id) AS images
      FROM optimizator_stats s WHERE s.run_id = ${runId} AND s.status = 'ok' ORDER BY s.created_at`;
  return rows.map((r) => ({
    id: r.id, createdAt: r.created_at.toISOString(), opening: r.opening, reelUrl: r.reel_url, metrics: r.metrics || {}, images: r.images || [],
  }));
}

export async function statsImage(id: string, telegramId: number, admin: boolean): Promise<{ mime: string; data: Buffer } | null> {
  const rows = await prisma.$queryRaw<{ mime: string; data: Buffer; telegram_id: bigint }[]>`
    SELECT i.mime, i.data, s.telegram_id FROM optimizator_stats_images i JOIN optimizator_stats s ON s.id = i.stats_id WHERE i.id = ${id}::uuid`;
  const r = rows[0];
  if (!r || (!admin && Number(r.telegram_id) !== telegramId)) return null;
  return { mime: r.mime, data: Buffer.from(r.data) };
}
