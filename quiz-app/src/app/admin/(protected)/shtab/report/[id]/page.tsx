import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import { getShtabReport } from '@/lib/shtab/data';
import { renderMarkdown } from '@/lib/shtab/md';
import styles from '../../shtab.module.css';

export const dynamic = 'force-dynamic';

const KIND: Record<string, string> = { pr: 'PR', file: 'файл', url: 'ссылка' };

export default async function ShtabReportPage({ params }: { params: Promise<{ id: string }> }) {
  // Защита есть в layout, но отчёт закрытый: проверяем и здесь.
  if (!(await getAdminSession())) redirect('/admin');

  const { id } = await params;
  const data = await getShtabReport(id);
  if (!data) notFound();
  const { report, fileAliases, fileTitles } = data;

  const codeHref = (code: string) => (fileAliases[code] ? `/admin/shtab/file/${fileAliases[code]}` : null);
  const date = report.shiftDate.toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC',
  });

  return (
    <div className={styles.page}>
      <Link href="/admin/shtab" className={styles.back}>← штаб</Link>
      <h1 className={styles.h1}>СМЕНА {date}</h1>
      <div className={styles.sub}>{report.title}</div>

      <div className={styles.card}>
        <div className={styles.md} dangerouslySetInnerHTML={{ __html: renderMarkdown(report.forSasha, { codeHref }) }} />
      </div>

      {report.links.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Что получилось</div>
          <ul className={styles.links}>
            {report.links.map((l, i) => {
              const href = l.kind === 'file' && l.fileId ? `/admin/shtab/file/${l.fileId}` : l.url;
              if (!href) return null;
              const external = l.kind !== 'file';
              const label = l.kind === 'file' && l.fileId ? fileTitles[l.fileId] ?? l.label : l.label;
              return (
                <li key={i} className={styles.linkItem}>
                  <span className={styles.linkKind}>{KIND[l.kind] ?? l.kind}</span>
                  <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>{label}</a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {report.forStrategist && (
        <details className={styles.collapse}>
          <summary className={styles.summary}>Для стратега</summary>
          <div
            className={`${styles.md} ${styles.collapseBody}`}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(report.forStrategist, { codeHref }) }}
          />
        </details>
      )}

      {report.brief && (
        <details className={styles.collapse}>
          <summary className={styles.summary}>Что было поставлено на ночь</summary>
          <div
            className={`${styles.md} ${styles.collapseBody}`}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(report.brief, { codeHref }) }}
          />
        </details>
      )}
    </div>
  );
}
