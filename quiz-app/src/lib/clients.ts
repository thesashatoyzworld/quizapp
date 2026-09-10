// ─────────────────────────────────────────────────────────────
// Кто сейчас в работе: личка, группа «делаем вместе», тариф 2.
//
// Считаем по активным доступам (product_access), а не по картам: карта есть
// не у каждого, а доступ есть у всех, кто платил. Поток ведения лежит в
// колонке track — её нет в schema.prisma, потому что база общая и колонки
// заводятся скриптом (scripts/access-add-track.mjs), поэтому читаем сырым SQL.
//
// Доступы с track='service' — мои собственные и партнёрские, в счёт не идут.
// ─────────────────────────────────────────────────────────────

import { prisma } from './prisma';

export type Track = 'lichka' | 'group' | 't2' | 'service';

export interface ClientRow {
  accessId: string;
  telegramId: string | null;
  name: string;
  username: string | null;
  productSlug: string;
  track: Track;
  grantedAt: Date;
  expiresAt: Date | null;
  /** сколько дней доступа осталось; null — бессрочный */
  daysLeft: number | null;
  /** карта в /admin/roadmaps, если заведена */
  roadmapSlug: string | null;
  paidAmount: number | null;
  returned: number | null;
}

export interface ClientsReport {
  lichka: ClientRow[];
  group: ClientRow[];
  t2: ClientRow[];
  service: ClientRow[];
}

interface RawRow {
  access_id: string;
  telegram_id: string | null;
  product_slug: string;
  track: string | null;
  granted_at: Date;
  expires_at: Date | null;
  user_name: string | null;
  username: string | null;
  roadmap_slug: string | null;
  roadmap_name: string | null;
  paid_amount: number | null;
  returned: number | null;
}

function daysLeft(until: Date | null): number | null {
  if (!until) return null;
  return Math.ceil((until.getTime() - Date.now()) / 86_400_000);
}

/** Поток: у тарифа 2 он свой, у тарифа 3 берём размеченный, непомеченного t3 считаем группой. */
function resolveTrack(row: RawRow): Track {
  if (row.track === 'service') return 'service';
  if (row.product_slug === 'uroven-t2') return 't2';
  return row.track === 'lichka' ? 'lichka' : 'group';
}

export async function getCurrentClients(): Promise<ClientsReport> {
  // Карту берём одну на человека: у некоторых их две (перезаведённая),
  // обычный LEFT JOIN на этом месте задваивал бы человека в счётчике.
  const rows = await prisma.$queryRaw<RawRow[]>`
    SELECT pa.id                              AS access_id,
           pa.telegram_id::text               AS telegram_id,
           pa.product_slug,
           pa.track,
           pa.granted_at,
           pa.expires_at,
           u.first_name                       AS user_name,
           COALESCE(u.username, r.username)   AS username,
           r.slug                             AS roadmap_slug,
           r.client_name                      AS roadmap_name,
           r.paid_amount,
           r.returned
    FROM product_access pa
    LEFT JOIN users u ON u.id = pa.user_id
    LEFT JOIN LATERAL (
      SELECT * FROM roadmaps
      WHERE telegram_id = pa.telegram_id AND archived = false
      ORDER BY updated_at DESC LIMIT 1
    ) r ON true
    WHERE pa.status = 'active'
      AND pa.product_slug IN ('uroven-t2', 'uroven-t3')
    ORDER BY pa.granted_at DESC
  `;

  const report: ClientsReport = { lichka: [], group: [], t2: [], service: [] };

  for (const row of rows) {
    const track = resolveTrack(row);
    report[track].push({
      accessId: row.access_id,
      telegramId: row.telegram_id,
      name: row.roadmap_name ?? row.user_name ?? (row.username ? `@${row.username}` : 'без имени'),
      username: row.username,
      productSlug: row.product_slug,
      track,
      grantedAt: row.granted_at,
      expiresAt: row.expires_at,
      daysLeft: daysLeft(row.expires_at),
      roadmapSlug: row.roadmap_slug,
      paidAmount: row.paid_amount,
      returned: row.returned,
    });
  }

  return report;
}

/** Перенести человека в другой поток. Пишем в ту же колонку track. */
export async function setClientTrack(accessId: string, track: Track): Promise<void> {
  // 't2' в базе не храним: тариф 2 виден по product_slug, а track нужен только
  // чтобы отделить личку от группы и спрятать служебные доступы.
  const value = track === 't2' ? null : track;
  await prisma.$executeRaw`UPDATE product_access SET track = ${value} WHERE id = ${accessId}`;
}
