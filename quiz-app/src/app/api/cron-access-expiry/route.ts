// ─────────────────────────────────────────────────────────────
// Ежедневная сводка по концам доступов.
//
// Гейт кабинета режет человека молча: `status` остаётся 'active', а внутрь его
// уже не пускает истёкшая дата. За июль-август так тихо вышли Диана и Виола
// (трижды подряд) — узнавали от них самих, спустя дни.
//
// Крон живёт на серверах Vercel (vercel.json), а не на машине Саши: сводка
// приходит, даже когда ноутбук выключен.
//
// Считаем ТОЛЬКО подписочные доступы (expires_at не null). Бессрочные —
// подарочные и партнёрские — не трогаем.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const CRON_SECRET = process.env.CRON_SECRET;

/** Сколько дней назад доступ ещё считаем «свежепротухшим» и показываем. */
const OVERDUE_WINDOW_DAYS = 7;
/** За сколько дней предупреждаем заранее. */
const SOON_WINDOW_DAYS = 3;

const MSK_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Дата в московском времени: «11.09 00:00». База хранит UTC. */
function msk(date: Date): string {
  const d = new Date(date.getTime() + MSK_OFFSET_MS);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

const TIER_LABEL: Record<string, string> = {
  'uroven-t1': 'т1',
  'uroven-t2': 'т2',
  'uroven-t3': 'т3',
  'sync-month': 'синхро',
  'group-week': 'группа',
};

interface Row {
  who: string;
  slug: string;
  expiresAt: Date;
  days: number;
}

function line(r: Row): string {
  const tier = TIER_LABEL[r.slug] || r.slug;
  return `• ${r.who} — ${tier}, ${msk(r.expiresAt)}`;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const from = new Date(now.getTime() - OVERDUE_WINDOW_DAYS * 86400_000);
    const to = new Date(now.getTime() + SOON_WINDOW_DAYS * 86400_000);

    const access = await prisma.productAccess.findMany({
      where: {
        status: 'active',
        expiresAt: { not: null, gte: from, lte: to },
      },
      orderBy: { expiresAt: 'asc' },
    });

    // Имена подтягиваем одним запросом: в product_access лежит только telegram_id.
    const ids = access.map((a) => a.telegramId).filter((v): v is bigint => v !== null);
    const users = ids.length
      ? await prisma.user.findMany({ where: { telegramId: { in: ids } } })
      : [];
    const nameOf = new Map(
      users.map((u) => [String(u.telegramId), u.username ? `@${u.username}` : (u.firstName || String(u.telegramId))]),
    );

    const rows: Row[] = access.map((a) => ({
      who: nameOf.get(String(a.telegramId)) || String(a.telegramId ?? '—'),
      slug: a.productSlug,
      expiresAt: a.expiresAt as Date,
      days: Math.round(((a.expiresAt as Date).getTime() - now.getTime()) / 86400_000),
    }));

    const overdue = rows.filter((r) => r.expiresAt <= now);
    const today = rows.filter((r) => r.expiresAt > now && r.days === 0);
    const soon = rows.filter((r) => r.expiresAt > now && r.days > 0);

    // Тишина, когда ничего не горит: сводка не должна превращаться в фон.
    if (!overdue.length && !today.length && !soon.length) {
      return NextResponse.json({ success: true, sent: false, checked: rows.length });
    }

    const parts: string[] = ['⏰ Доступы'];
    if (overdue.length) {
      parts.push('', `Истекли (${overdue.length}) — доступ уже закрыт:`, ...overdue.map(line));
    }
    if (today.length) {
      parts.push('', `Истекают сегодня (${today.length}):`, ...today.map(line));
    }
    if (soon.length) {
      parts.push('', `Ближайшие ${SOON_WINDOW_DAYS} дня (${soon.length}):`, ...soon.map(line));
    }
    parts.push('', 'Автосписания у этих доступов нет — продлевать руками.');
    const text = parts.join('\n');

    if (BOT_TOKEN && ADMIN_CHAT_ID) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text }),
      });
    } else {
      console.error('[Access Expiry] Missing BOT_TOKEN or ADMIN_CHAT_ID');
    }

    return NextResponse.json({
      success: true,
      sent: true,
      overdue: overdue.length,
      today: today.length,
      soon: soon.length,
      text,
    });
  } catch (error) {
    console.error('[Access Expiry] Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
