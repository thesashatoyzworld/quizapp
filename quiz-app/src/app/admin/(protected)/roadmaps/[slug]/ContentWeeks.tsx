import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from '../roadmap.module.css';

const WEEKS = 6;

function weekStart(d: Date) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); // неделя с понедельника
  return x;
}

function label(key: string) {
  const from = new Date(key + 'T00:00:00Z');
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 6);
  const f = (x: Date) => `${String(x.getUTCDate()).padStart(2, '0')}.${String(x.getUTCMonth() + 1).padStart(2, '0')}`;
  return `${f(from)}–${f(to)}`;
}

/** Что человек выложил за последние недели. Данные заливает scripts/ig-import.mjs. */
export default async function ContentWeeks({ slug }: { slug: string }) {
  const since = weekStart(new Date());
  since.setUTCDate(since.getUTCDate() - 7 * (WEEKS - 1));

  const posts = await prisma.igPost.findMany({
    where: { slug, postedAt: { gte: since } },
    orderBy: { postedAt: 'desc' },
  });

  if (posts.length === 0) {
    return (
      <section className={styles.contentBlock}>
        <h2 className={styles.contentH2}>КОНТЕНТ В ИНСТАГРАМЕ</h2>
        <p className={styles.contentEmpty}>
          лента ещё не собрана. прогнать в GSD-BRAND <code>scripts/ig-monitor</code> и залить:{' '}
          <code>node scripts/ig-import.mjs &lt;ник&gt; {slug}</code>
        </p>
      </section>
    );
  }

  const handle = posts[0].handle;
  const sync = await prisma.igSync.findUnique({ where: { handle } });
  const coveredFrom = sync?.coveredFrom ?? null;

  const weeks: { key: string; total: number; onRoute: number; known: boolean }[] = [];
  for (let i = 0; i < WEEKS; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + 7 * i);
    const key = d.toISOString().slice(0, 10);
    const weekEnd = new Date(d);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
    const inWeek = posts.filter((p) => weekStart(p.postedAt).toISOString().slice(0, 10) === key);
    // Неделя целиком раньше того, докуда мы смотрели, — это не «ничего не
    // выложил», а «мы туда не заглядывали».
    const known = coveredFrom ? weekEnd > coveredFrom : inWeek.length > 0;
    weeks.push({ key, total: inWeek.length, onRoute: inWeek.filter((p) => p.onRoute).length, known });
  }

  const lastKey = [...weeks].reverse().find((w) => w.total > 0)?.key ?? weeks[weeks.length - 1].key;
  const lastWeek = posts.filter((p) => weekStart(p.postedAt).toISOString().slice(0, 10) === lastKey);
  const shown = lastWeek.slice(0, 8);

  return (
    <section className={styles.contentBlock}>
      <div className={styles.contentHead}>
        <h2 className={styles.contentH2}>КОНТЕНТ В ИНСТАГРАМЕ</h2>
        <a className={styles.contentHandle} href={`https://instagram.com/${handle}`} target="_blank" rel="noopener noreferrer">
          @{handle}
        </a>
        <Link href={`/admin/content/${handle}`} className={styles.contentAll}>весь контент →</Link>
      </div>

      <div className={styles.weekStrip}>
        {weeks.map((w) => (
          <div key={w.key} className={w.total ? styles.weekTile : styles.weekTileEmpty}>
            <span className={styles.weekTileLabel}>{label(w.key)}</span>
            <span className={styles.weekTileTotal}>{w.known ? w.total : '?'}</span>
            {w.known ? (
              w.total > 0 && (
                <span className={w.onRoute ? styles.weekTileOn : styles.weekTileOff}>{w.onRoute} по маршруту</span>
              )
            ) : (
              <span className={styles.weekTileOff}>не смотрели</span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.lastWeekTitle}>
        последняя неделя с выходами · {label(lastKey)}
        {coveredFrom && (
          <> · лента собрана с {coveredFrom.toISOString().slice(8, 10)}.{coveredFrom.toISOString().slice(5, 7)}</>
        )}
      </div>
      <ul className={styles.contentList}>
        {shown.map((p) => (
          <li key={p.id} className={styles.contentItem}>
            <span className={styles.contentDate}>
              {String(p.postedAt.getUTCDate()).padStart(2, '0')}.{String(p.postedAt.getUTCMonth() + 1).padStart(2, '0')}
            </span>
            <span className={styles.contentType}>{p.type}</span>
            <a className={styles.contentTheme} href={p.url} target="_blank" rel="noopener noreferrer">
              {p.theme || p.hook || '(без разбора)'}
            </a>
            {p.plays != null && <span className={styles.contentPlays}>{p.plays.toLocaleString('ru-RU')}</span>}
            {p.onRoute === true && <span className={styles.contentOn}>по маршруту</span>}
            {p.onRoute === false && <span className={styles.contentOff}>мимо</span>}
          </li>
        ))}
      </ul>
      {lastWeek.length > shown.length && (
        <Link href={`/admin/content/${handle}`} className={styles.contentAll}>
          ещё {lastWeek.length - shown.length} на этой неделе →
        </Link>
      )}
    </section>
  );
}
