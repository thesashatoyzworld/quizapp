import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callSecretOk } from '@/lib/roadmap/call-secret';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Row {
  telegram_id: string;
  name: string | null;
  username: string | null;
  product: string | null;
  track: string | null;
  roadmap_slug: string | null;
}

// GET /api/roadmap-calls/clients
// Everyone "in the base" (same rule as lib/clients-base.ts): active tier 2/3 access
// or an open roadmap. The call pipeline matches a 1-on-1 call against this list:
// found = client (konspekt goes to "Личное"), not found = lead.
// Header x-roadmap-secret.
export async function GET(req: NextRequest) {
  if (!callSecretOk(req.headers.get('x-roadmap-secret'))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const rows = await prisma.$queryRaw<Row[]>`
    WITH acc AS (
      SELECT a.telegram_id, max(a.product_slug) AS product, max(a.track) AS track
        FROM product_access a
       WHERE a.status = 'active'
         AND a.product_slug IN ('uroven-t2', 'uroven-t3')
         AND (a.expires_at IS NULL OR a.expires_at > now())
         AND a.track IS DISTINCT FROM 'service'
       GROUP BY a.telegram_id
    ), rm AS (
      SELECT DISTINCT ON (r.telegram_id) r.telegram_id, r.slug, r.client_name, r.username
        FROM roadmaps r
       WHERE NOT r.archived AND r.telegram_id IS NOT NULL
       ORDER BY r.telegram_id, r.updated_at DESC
    )
    SELECT coalesce(acc.telegram_id, rm.telegram_id)::text AS telegram_id,
           coalesce(rm.client_name, u.first_name) AS name,
           coalesce(rm.username, u.username) AS username,
           acc.product, acc.track, rm.slug AS roadmap_slug
      FROM acc
      FULL JOIN rm ON rm.telegram_id = acc.telegram_id
      LEFT JOIN users u ON u.telegram_id = coalesce(acc.telegram_id, rm.telegram_id)`;

  return NextResponse.json({ ok: true, clients: rows });
}
