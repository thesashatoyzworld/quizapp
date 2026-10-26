import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import { getShtabFile } from '@/lib/shtab/data';
import { renderMarkdown } from '@/lib/shtab/md';
import styles from '../../shtab.module.css';

export const dynamic = 'force-dynamic';

export default async function ShtabFilePage({ params }: { params: Promise<{ id: string }> }) {
  // Файлы закрытые: проверяем сессию и здесь, не только в layout.
  if (!(await getAdminSession())) redirect('/admin');

  const { id } = await params;
  const file = await getShtabFile(id);
  if (!file) notFound();

  const updated = file.updatedAt.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Almaty',
  });

  return (
    <div className={styles.page} style={file.kind === 'html' ? { maxWidth: 'none' } : undefined}>
      <Link href="/admin/shtab" className={styles.back}>← штаб</Link>
      <div className={styles.fileHead}>
        <h1 className={styles.h1} style={{ marginBottom: 0 }}>{file.title}</h1>
        <span className={styles.filePath}>{file.path} · {updated}</span>
      </div>

      {file.kind === 'html' ? (
        // Без allow-same-origin: скрипты страницы работают, но до админки не дотянутся.
        <iframe
          className={styles.frame}
          srcDoc={file.body}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          title={file.title}
        />
      ) : (
        <div className={styles.card}>
          <div className={styles.md} dangerouslySetInnerHTML={{ __html: renderMarkdown(file.body) }} />
        </div>
      )}
    </div>
  );
}
