import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from './content.module.css';

export const dynamic = 'force-dynamic';

const WEEKS = 8;

/** Понедельник недели, в которую попала дата. */
function weekStart(d: Date) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const shift = (x.getUTCDay() + 6) % 7; // воскресенье это конец недели, не начало
  x.setUTCDate(x.getUTCDate() - shift);
  return x;
}

function weekKey(d: Date) {
  return weekStart(d).toISOString().slice(0, 10);
}

function weekLabel(key: string) {
  const from = new Date(key + 'T00:00:00Z');
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 6);
  const f = (x: Date) => `${String(x.getUTCDate()).padStart(2, '0')}.${String(x.getUTCMonth() + 1).padStart(2, '0')}`;
  return `${f(from)}–${f(to)}`;
}

export default async function ContentPage() {
  const since = weekStart(new Date());
  since.setUTCDate(since.getUTCDate() - 7 * (WEEKS - 1));

  const [posts, roadmaps, syncs] = await Promise.all([
    prisma.igPost.findMany({ where: { postedAt: { gte: since } }, orderBy: { postedAt: 'desc' } }),
    prisma.roadmap.findMany({ where: { archived: false }, select: { slug: true, clientName: true } }),
    prisma.igSync.findMany(),
  ]);

  // Докуда конвейер смотрел каждую ленту: без этого пустая клетка врёт,
  // будто человек ничего не выложил.
  const coveredFrom = new Map(syncs.map((s) => [s.handle, s.coveredFrom]));

  const nameBySlug = new Map(roadmaps.map((r) => [r.slug, r.clientName]));

  const weeks: string[] = [];
  for (let i = 0; i < WEEKS; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + 7 * i);
    weeks.push(d.toISOString().slice(0, 10));
  }

  type Cell = { total: number; onRoute: number };
  const grid = new Map<string, Map<string, Cell>>();
  const lastSeen = new Map<string, Date>();

  for (const p of posts) {
    if (!grid.has(p.handle)) grid.set(p.handle, new Map());
    const row = grid.get(p.handle)!;
    const key = weekKey(p.postedAt);
    const cell = row.get(key) ?? { total: 0, onRoute: 0 };
    cell.total += 1;
    if (p.onRoute) cell.onRoute += 1;
    row.set(key, cell);
    if (!lastSeen.has(p.handle) || lastSeen.get(p.handle)! < p.postedAt) lastSeen.set(p.handle, p.postedAt);
  }

  const handles = [...grid.keys()].sort();
  const slugByHandle = new Map(posts.map((p) => [p.handle, p.slug]));

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>КОНТЕНТ ПО НЕДЕЛЯМ</h1>
      <p className={styles.sub}>
        сколько единиц человек выложил и сколько из них двигают его маршрут. сторис сюда не попадают:
        публично их не достать, нужен вход клиента через наше приложение
      </p>

      {handles.length === 0 && (
        <p className={styles.empty}>
          пока пусто. собрать ленту в GSD-BRAND и залить: <code>node scripts/ig-import.mjs azamat.gimaev azamat-gimaev</code>
        </p>
      )}

      {handles.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.who}>кто</th>
                {weeks.map((w) => (
                  <th key={w} className={styles.weekHead}>{weekLabel(w)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {handles.map((h) => {
                const row = grid.get(h)!;
                const slug = slugByHandle.get(h) ?? null;
                const name = (slug && nameBySlug.get(slug)) || `@${h}`;
                return (
                  <tr key={h}>
                    <td className={styles.who}>
                      <Link href={`/admin/content/${h}`} className={styles.name}>{name}</Link>
                      <span className={styles.handle}>@{h}</span>
                    </td>
                    {weeks.map((w) => {
                      const cell = row.get(w);
                      const weekEnd = new Date(w + 'T00:00:00Z');
                      weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
                      const from = coveredFrom.get(h);
                      const known = from ? weekEnd > from : Boolean(cell);
                      if (!cell) {
                        return (
                          <td key={w} className={styles.cellEmpty}>
                            {known ? '0' : <span title="ленту за эту неделю не собирали">не смотрели</span>}
                          </td>
                        );
                      }
                      return (
                        <td key={w} className={styles.cell}>
                          <span className={styles.total}>{cell.total}</span>
                          <span className={cell.onRoute ? styles.onRoute : styles.offRoute}>
                            {cell.onRoute} по маршруту
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
