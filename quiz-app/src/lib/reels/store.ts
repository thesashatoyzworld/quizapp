// Раздел «Ролики»: доступ, чтение пространства клиента и обновление просмотров.
// Только сервер: здесь Prisma.

import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyInitData, verifySession, SESSION_COOKIE } from '@/lib/telegram-login';
import { fetchProfileReels, fetchReelStats, type ProfileReel } from './apify';
import type { ReelBriefView, ReelVersionView, Stage } from './plan';

// Личка = действующий тариф 3 на треке lichka. SQL, а не prisma: колонки
// track в схеме нет, она есть только в базе.
export async function isLichka(telegramId: number | bigint): Promise<boolean> {
  const id = String(telegramId);
  const rows = await prisma.$queryRaw<{ yes: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM product_access a
       WHERE a.telegram_id::text = ${id} AND a.status = 'active'
         AND a.product_slug = 'uroven-t3' AND a.track = 'lichka'
         AND (a.expires_at IS NULL OR a.expires_at > now())
    ) AS yes`;
  return rows[0]?.yes === true;
}

export interface LichkaClient {
  telegramId: string;
  name: string;
  expiresAt: Date | null;
}

/** Все на личке сейчас. Имя: шапка роликов, потом карта, потом профиль бота. */
export async function lichkaClients(): Promise<LichkaClient[]> {
  const rows = await prisma.$queryRaw<{ telegram_id: bigint; name: string | null; expires_at: Date | null }[]>`
    SELECT a.telegram_id, MAX(a.expires_at) AS expires_at,
           COALESCE(
             (SELECT s.client_name FROM reel_spaces s WHERE s.telegram_id = a.telegram_id),
             (SELECT r.client_name FROM roadmaps r WHERE r.telegram_id = a.telegram_id AND NOT r.archived LIMIT 1),
             (SELECT u.first_name FROM users u WHERE u.telegram_id = a.telegram_id)
           ) AS name
      FROM product_access a
     WHERE a.status = 'active' AND a.product_slug = 'uroven-t3' AND a.track = 'lichka'
       AND (a.expires_at IS NULL OR a.expires_at > now()) AND a.telegram_id IS NOT NULL
     GROUP BY a.telegram_id`;
  return rows
    .map((r) => ({ telegramId: String(r.telegram_id), name: r.name || String(r.telegram_id), expiresAt: r.expires_at }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

/**
 * Кто пишет. Только подписанное: initData из Mini App или сессия-cookie после
 * входа через Telegram Login. Голый ?telegramId для записи не годится.
 */
export function verifiedViewer(request: NextRequest): number | null {
  const botToken = process.env.BOT_TOKEN || '';
  const initData = request.headers.get('x-tg-init-data');
  const fromInit = initData ? verifyInitData(initData, botToken) : null;
  if (fromInit) return fromInit;
  return verifySession(request.cookies.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET || botToken);
}

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

type VersionRow = Awaited<ReturnType<typeof prisma.reelVersion.findMany>>[number];

export function versionView(v: VersionRow): ReelVersionView {
  return {
    id: v.id,
    briefId: v.briefId,
    reel: v.reel,
    title: v.title,
    version: v.version ?? '',
    order: v.order,
    stage: v.stage as Stage,
    planDate: iso(v.planDate),
    code: v.code,
    uploadedAt: iso(v.uploadedAt),
    plays: v.plays,
    likes: v.likes,
    comments: v.comments,
    statsAt: v.statsAt ? v.statsAt.toISOString() : null,
    note: v.note ?? '',
  };
}

export async function loadSpace(telegramId: bigint) {
  const [space, briefs, versions] = await Promise.all([
    prisma.reelSpace.findUnique({ where: { telegramId } }),
    prisma.reelBrief.findMany({
      where: { telegramId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      // HTML не тащим: он большой и нужен только при открытии ТЗ.
      select: { id: true, order: true, title: true, label: true, summary: true, state: true, stateLabel: true, html: false },
    }),
    prisma.reelVersion.findMany({ where: { telegramId }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }),
  ]);
  const withHtml = new Set(
    (await prisma.reelBrief.findMany({ where: { telegramId, html: { not: null } }, select: { id: true } })).map((b) => b.id),
  );
  const briefViews: ReelBriefView[] = briefs.map((b) => ({
    id: b.id,
    order: b.order,
    title: b.title,
    label: b.label ?? '',
    summary: b.summary ?? '',
    state: b.state,
    stateLabel: b.stateLabel ?? '',
    hasHtml: withHtml.has(b.id),
  }));
  return {
    clientName: space?.clientName ?? '',
    igHandle: space?.igHandle ?? '',
    briefs: briefViews,
    versions: versions.map(versionView),
  };
}

/** Новые ролики из профиля заводим, только если они не старше этого. */
const DISCOVER_DAYS = 45;

/** Куда складываем найденные в профиле ролики, которых не было в ТЗ. */
const autoBriefId = (telegramId: bigint) => `auto-${telegramId}`;

/** Подпись рилса → её первая строка, коротко; без подписи — дата. */
function titleFromCaption(caption: string, at: Date): string {
  const line = caption.split('\n').map((l) => l.trim()).find(Boolean) ?? '';
  if (!line) return `Ролик от ${at.toISOString().slice(8, 10)}.${at.toISOString().slice(5, 7)}`;
  return line.length > 80 ? `${line.slice(0, 77).trimEnd()}…` : line;
}

/**
 * Раз в день по всем клиентам (или по одному из админки):
 * 1. Вкладка «Reels» их профилей одним запуском Apify: там видны и пробные.
 * 2. Известным роликам — свежие просмотры. Новые — на доску, выложенными.
 * 3. Известные, которых на вкладке не нашлось, добираем по прямым ссылкам.
 * Что Apify не вернул, остаётся как было: пустое не превращаем в ноль.
 */
export async function refreshStats(telegramIds: bigint[]) {
  const now = new Date();
  const spaces = await prisma.reelSpace.findMany({
    where: { telegramId: { in: telegramIds }, igHandle: { not: null } },
    select: { telegramId: true, igHandle: true },
  });
  let profiles = new Map<string, ProfileReel[]>();
  try {
    profiles = await fetchProfileReels(spaces.map((s) => s.igHandle as string));
  } catch (err) {
    // Без вкладки «Reels» всё равно обновим известные по прямым ссылкам.
    console.error('[reels] вкладка Reels не собралась:', err);
  }

  const versions = await prisma.reelVersion.findMany({
    where: { telegramId: { in: telegramIds }, code: { not: null } },
    select: { id: true, code: true, stage: true, telegramId: true },
  });
  const known = new Set(versions.map((v) => v.code as string));
  const fromProfile = new Map([...profiles.values()].flat().map((r) => [r.code, r]));

  // Не нашлось на вкладке: удалён, скрыт или старше лимита — пробуем по ссылке.
  const up = versions.filter((v) => v.stage === 'up');
  const direct = await fetchReelStats(up.map((v) => v.code as string).filter((c) => !fromProfile.has(c)))
    .catch((err) => { console.error('[reels] прямые ссылки не собрались:', err); return new Map(); });

  let updated = 0;
  for (const v of up) {
    const s = fromProfile.get(v.code as string) ?? direct.get(v.code as string);
    if (!s) continue;
    await prisma.reelVersion.update({
      where: { id: v.id },
      data: { plays: s.plays, likes: s.likes, comments: s.comments, statsAt: now },
    });
    updated++;
  }

  let discovered = 0;
  const since = new Date(now.getTime() - DISCOVER_DAYS * 864e5);
  for (const space of spaces) {
    const fresh = (profiles.get((space.igHandle as string).replace(/^@/, '').toLowerCase()) ?? [])
      .filter((r) => !known.has(r.code) && r.timestamp && new Date(r.timestamp) >= since);
    if (!fresh.length) continue;
    const briefId = autoBriefId(space.telegramId);
    await prisma.reelBrief.upsert({
      where: { id: briefId },
      create: {
        id: briefId, telegramId: space.telegramId, order: 99, title: 'Найдено в профиле', label: '',
        summary: 'Ролики, которые нашлись в профиле, но не были в ТЗ. Сопоставить с ТЗ можно в админке.',
        state: 'ok', stateLabel: 'не из ТЗ',
      },
      update: {},
    });
    for (const r of fresh) {
      const at = new Date(r.timestamp as string);
      await prisma.reelVersion.create({
        data: {
          id: `ig-${r.code}`, telegramId: space.telegramId, briefId, reel: '', title: titleFromCaption(r.caption, at),
          version: '', order: 900, stage: 'up', code: r.code, uploadedAt: new Date(`${r.timestamp!.slice(0, 10)}T00:00:00Z`),
          plays: r.plays, likes: r.likes, comments: r.comments, statsAt: now,
          note: 'Найден в профиле автоматически, с ТЗ не сопоставлен',
        },
      });
      known.add(r.code);
      discovered++;
    }
  }

  return { reels: up.length, updated, missing: up.length - updated, discovered };
}
