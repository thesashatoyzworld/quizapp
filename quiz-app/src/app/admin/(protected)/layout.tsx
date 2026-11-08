import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import Link from 'next/link';
import styles from './admin-shell.module.css';

// Removed from the menu 08.11.2026 (pages still exist): Дашборд, Очередь, Кампании,
// Пользователи, Оплаты, Рассылки, all leftovers of the archived quiz bot.
const NAV_LINKS = [
  { href: '/admin/shtab', label: 'Штаб' },
  { href: '/admin/idei', label: 'Идеи' },
  { href: '/admin/roadmaps', label: 'Карты клиентов' },
  { href: '/admin/reels', label: 'Ролики' },
  { href: '/admin/studio', label: 'Студия' },
  { href: '/admin/na-kontrole', label: 'Деньги на столе' },
  { href: '/admin/analytics', label: 'Аналитика' },
  { href: '/admin/huki', label: 'Хуки' },
  { href: '/admin/progress', label: 'Обучение' },
  { href: '/admin/anketa', label: 'Анкеты' },
  { href: '/admin/zayavki', label: 'Заявки' },
  { href: '/admin/ssylki', label: 'Ссылки для оплаты' },
  { href: '/admin/revenue', label: 'Выручка' },
  { href: '/admin/rashody', label: 'Расходы' },
  { href: '/admin/instagram', label: 'Instagram' },
];

// Sleeping sections (no fresh data or no work through them since September), kept one click away.
const ARCHIVE_LINKS = [
  { href: '/admin/uroven', label: 'Лиды · Уровень' },
  { href: '/admin/dialogi', label: 'Диалоги' },
  { href: '/admin/content', label: 'Контент' },
  { href: '/admin/kontent', label: 'YouTube' },
];

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  return (
    <div className={styles.shell}>
      <nav className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandTitle}>ADMIN</div>
          <div className={styles.brandSub}>@thesashatoyz</div>
        </div>

        <div className={styles.links}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={styles.link}>
              {label}
            </Link>
          ))}
          <details className={styles.archive}>
            <summary className={styles.archiveSummary}>Архив</summary>
            {ARCHIVE_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className={`${styles.link} ${styles.archiveLink}`}>
                {label}
              </Link>
            ))}
          </details>
          {/* Phone: the menu is a horizontal strip, a <details> inside it breaks the row. */}
          <span className={styles.archiveMobile}>
            <span className={styles.archiveMobileLabel}>Архив:</span>
            {ARCHIVE_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className={`${styles.link} ${styles.archiveLink}`}>
                {label}
              </Link>
            ))}
          </span>
        </div>

        <div className={styles.logoutWrap}>
          <a href="/api/admin/logout" className={styles.logout}>
            Выйти
          </a>
        </div>
      </nav>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
