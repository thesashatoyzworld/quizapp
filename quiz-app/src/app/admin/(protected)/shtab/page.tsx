import Link from 'next/link';
import { getShtabBoard } from '@/lib/shtab/data';
import { inline, plainPreview } from '@/lib/shtab/md';
import type { TaskRow } from '@/lib/shtab/summary';
import styles from './shtab.module.css';

export const dynamic = 'force-dynamic';

const MARK: Record<string, string> = { wip: '⏳', paused: '⏸️', done: '✅', frozen: '🧊', open: '•' };

function day(d: Date): string {
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
}

function stamp(d: Date): string {
  return d.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Almaty',
  });
}

function TaskList({ tasks, codeHref }: { tasks: TaskRow[]; codeHref: (c: string) => string | null }) {
  let grp: string | null = null;
  return (
    <ul className={styles.tasks}>
      {tasks.flatMap((t) => {
        const items = [];
        if (t.grp && t.grp !== grp) items.push(<li key={`g-${t.id}`} className={styles.grp}>{t.grp}</li>);
        grp = t.grp;
        items.push(
          <li key={t.id} className={styles.task}>
            <span className={styles.mark}>{MARK[t.status] ?? '•'}</span>
            <div className={styles.taskBody}>
              <div dangerouslySetInnerHTML={{ __html: inline(t.text, { codeHref }) }} />
              {t.detail && (
                <div className={styles.detail} dangerouslySetInnerHTML={{ __html: inline(t.detail, { codeHref }) }} />
              )}
            </div>
          </li>,
        );
        return items;
      })}
    </ul>
  );
}

export default async function ShtabPage() {
  const { summary, sections, reports, fileAliases, syncedAt } = await getShtabBoard();
  const codeHref = (code: string) => (fileAliases[code] ? `/admin/shtab/file/${fileAliases[code]}` : null);

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>ШТАБ</h1>
      <div className={styles.sub}>
        Задачи из трекера и отчёты ночных смен.
        {syncedAt ? ` Обновлено ${stamp(syncedAt)}.` : ' Данных пока нет: запусти синхронизацию штаба.'}
      </div>

      <div className={styles.totals}>
        <div>
          <div className={styles.totalValue}>{summary.open}</div>
          <div className={styles.totalLabel}>открытых задач</div>
        </div>
        <div>
          <div className={styles.totalValue}>{summary.doneWeek}</div>
          <div className={styles.totalLabel}>сделано за 7 дней</div>
        </div>
        <div>
          {summary.lastReport ? (
            <Link href={`/admin/shtab/report/${summary.lastReport.id}`} className={styles.totalLink}>
              <div className={styles.totalValue}>{day(summary.lastReport.shiftDate)}</div>
              <div className={styles.totalLabel}>последняя смена →</div>
            </Link>
          ) : (
            <>
              <div className={styles.totalValue}>—</div>
              <div className={styles.totalLabel}>смен ещё не было</div>
            </>
          )}
        </div>
      </div>

      <h2 className={styles.h2}>Задачи</h2>
      {sections.length === 0 && <p className={styles.empty}>Задач нет.</p>}
      {sections.map((s) => (
        <details key={s.title} className={styles.section} open={s.open.length > 0}>
          <summary className={styles.summary}>
            <span>{s.title}</span>
            <span className={styles.count}>
              {s.open.length > 0 ? `открыто ${s.open.length}` : 'всё закрыто'}
            </span>
          </summary>
          {s.open.length > 0 && <TaskList tasks={s.open} codeHref={codeHref} />}
          {s.done.length > 0 && (
            <details className={styles.doneBlock}>
              <summary className={styles.doneSummary}>Сделано и отложено: {s.done.length}</summary>
              <TaskList tasks={s.done} codeHref={codeHref} />
            </details>
          )}
        </details>
      ))}

      <h2 className={styles.h2}>Ночные смены</h2>
      {reports.length === 0 && <p className={styles.empty}>Отчётов пока нет.</p>}
      {reports.map((r) => (
        <Link key={r.id} href={`/admin/shtab/report/${r.id}`} className={styles.shift}>
          <div className={styles.shiftDate}>{day(r.shiftDate)} · {r.title}</div>
          <div className={styles.shiftPreview}>{plainPreview(r.forSasha)}</div>
        </Link>
      ))}
    </div>
  );
}
