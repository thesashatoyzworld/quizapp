import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// События страницы /huki: анонимные, по session_id из sessionStorage.
// Кабинетный /api/cabinet/track сюда не подходит — он пишет только опознанных,
// а на хуки приходят из инсты люди без Телеграма.
//
//   POST { type, session_id, cta?, via?, after_gate?, ref?, ctx?, path? } → 204
//
// Пишем в общую `events` c source='web', funnel='huki'. utm берём из адреса страницы.

const TYPES = new Set([
  'huki_view',        // открыл страницу
  'huki_gate_view',   // увидел окно подписки (база закрыта)
  'huki_gate_click',  // нажал в окне: open_bot | subscribe | check
  'huki_unlock',      // база открылась: via = subscribed | client | cabinet | pass
  'huki_cta_click',   // клик на «Поток Спроса»: cta = potok-main | potok-feed
]);

const clip = (v: unknown, n = 200) => (typeof v === 'string' ? v.slice(0, n) : null);

export async function POST(request: NextRequest) {
  try {
    const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const type = clip(b.type, 40);
    const sid = clip(b.session_id, 64);
    if (!type || !TYPES.has(type) || !sid) return new NextResponse(null, { status: 204 });

    const path = clip(b.path, 300) || '/huki';
    let utm: URLSearchParams;
    try { utm = new URL(path, 'https://x').searchParams; } catch { utm = new URLSearchParams(); }

    await prisma.event.create({
      data: {
        type,
        source: 'web',
        funnel: 'huki',
        utmSource: utm.get('utm_source'),
        utmMedium: utm.get('utm_medium'),
        utmCampaign: utm.get('utm_campaign'),
        metadata: {
          session_id: sid,
          path,
          cta: clip(b.cta, 40),
          via: clip(b.via, 20),
          after_gate: b.after_gate === true,
          ref: clip(b.ref, 300),
          ctx: clip(b.ctx, 20),
        },
      },
    });
  } catch (e) {
    console.error('[huki/track]', e);
  }
  return new NextResponse(null, { status: 204 });
}
