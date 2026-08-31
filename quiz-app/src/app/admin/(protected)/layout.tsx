import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import Link from 'next/link';
import styles from './admin-shell.module.css';

const NAV_LINKS = [
  { href: '/admin/dashboard', label: 'Дашборд' },
  { href: '/admin/roadmaps', label: 'Карты клиентов' },
  { href: '/admin/analytics', label: 'Аналитика' },
  { href: '/admin/uroven', label: 'Лиды · Уровень' },
  { href: '/admin/anketa', label: 'Анкеты' },
  { href: '/admin/zayavki', label: 'Заявки' },
  { href: '/admin/queue', label: 'Очередь' },
  { href: '/admin/campaigns', label: 'Кампании' },
  { href: '/admin/users', label: 'Пользователи' },
  { href: '/admin/payments', label: 'Оплаты' },
  { href: '/admin/broadcasts', label: 'Рассылки' },
  { href: '/admin/instagram', label: 'Инстаграм' },
  { href: '/admin/content', label: 'Контент' },
  { href: '/admin/euvgen', label: 'EuvgenGlob' },
  { href: '/admin/sync', label: 'SYNC' },
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
