import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from '../content.module.css';

export const dynamic = 'force-dynamic';

function weekStart(d: Date) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7));
  return x;
}

function weekLabel(key: string) {
  const from = new Date(key + 'T00:00:00Z');
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 6);
  const f = (x: Date) => `${String(x.getUTCDate()).padStart(2, '0')}.${String(x.getUTCMonth() + 1).padStart(2, '0')}`;
  return `${f(from)} — ${f(to)}`;
}

export default async function ContentByHandlePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  const posts = await prisma.igPost.findMany({
    where: { handle },
    orderBy: { postedAt: 'desc' },
    take: 200,
  });
  if (posts.length === 0) notFound();

  const slug = posts.find((p) => p.slug)?.slug ?? null;
  const card = slug ? await prisma.roadmap.findUnique({ where: { slug }, select: { clientName: true, slug: true } }) : null;

  const byWeek = new Map<string, typeof posts>();
  for (const p of posts) {
    const key = weekStart(p.postedAt).toISOString().slice(0, 10);
    if (!byWeek.has(key)) byWeek.set(key, []);
    byWeek.get(key)!.push(p);
  }

  return (
    <div className={styles.page}>
      <Link href="/admin/content" className={styles.back}>← все клиенты</Link>
      <h1 className={styles.h1}>{card?.clientName ?? `@${handle}`}</h1>
      <p className={styles.sub}>
        @{handle}
        {card && <> · <Link className={styles.inlineLink} href={`/admin/roadmaps/${card.slug}`}>маршрутная карта</Link></>}
      </p>

      {[...byWeek.entries()].map(([week, items]) => {
        const onRoute = items.filter((p) => p.onRoute).length;
        const plays = items.filter((p) => p.plays != null).map((p) => p.plays!);
        const median = plays.length ? plays.slice().sort((a, b) => a - b)[Math.floor(plays.length / 2)] : null;

        return (
          <section key={week} className={styles.week}>
            <div className={styles.weekHead2}>
              <span className={styles.weekTitle}>{weekLabel(week)}</span>
              <span className={styles.weekStat}>
                {items.length} единиц · {onRoute} по маршруту
                {median != null && <> · медиана {median.toLocaleString('ru-RU')} просмотров</>}
              </span>
            </div>

            <ul className={styles.list}>
              {items.map((p) => (
                <li key={p.id} className={styles.item}>
                  <div className={styles.itemHead}>
                    <span className={styles.date}>
                      {String(p.postedAt.getUTCDate()).padStart(2, '0')}.{String(p.postedAt.getUTCMonth() + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.type}>{p.type}</span>
                    <a className={styles.theme} href={p.url} target="_blank" rel="noopener noreferrer">
                      {p.theme || p.hook || '(без разбора)'}
                    </a>
                    {p.onRoute === true && <span className={styles.badgeOn}>по маршруту</span>}
                    {p.onRoute === false && <span className={styles.badgeOff}>мимо</span>}
                  </div>
                  <div className={styles.itemMeta}>
                    {p.plays != null && <span>{p.plays.toLocaleString('ru-RU')} просмотров</span>}
                    {p.format && <span>{p.format}</span>}
                    {p.purpose && <span>{p.purpose}</span>}
                    {p.leadsTo && <span>ведёт: {p.leadsTo}</span>}
                  </div>
                  {p.why && <div className={styles.why}>{p.why}</div>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
