// ─────────────────────────────────────────────────────────────
// Ежедневный сбор расхода на сервисы.
//
// Крон живёт на серверах Vercel (vercel.json): цифры набираются, даже когда
// ноутбук выключен. Окно по умолчанию — семь дней назад: сервисы досчитывают
// вчерашний день с задержкой, а повторный проход просто перезапишет строки.
//
// Разовый добор истории: /api/cron-costs?from=2026-06-01&to=2026-08-31
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { collectCosts } from '@/lib/costs/collect';

const CRON_SECRET = process.env.CRON_SECRET;

const DEFAULT_WINDOW_DAYS = 7;

function day(offsetDays = 0): string {
  return new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const from = params.get('from') ?? day(-DEFAULT_WINDOW_DAYS);
  const to = params.get('to') ?? day();

  try {
    const result = await collectCosts(from, to);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
