import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/admin/dashboard', label: 'Дашборд' },
  { href: '/admin/queue', label: 'Очередь' },
  { href: '/admin/users', label: 'Пользователи' },
  { href: '/admin/payments', label: 'Оплаты' },
  { href: '/admin/broadcasts', label: 'Рассылки' },
];

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: 'var(--font-body)' }}>
      {/* Sidebar */}
      <nav style={{
        width: '200px',
        flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid rgba(0, 240, 255, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(0, 240, 255, 0.1)' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            color: 'var(--neon-cyan)',
            letterSpacing: '0.15em',
            marginBottom: '4px',
          }}>
            ADMIN
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>@thesashatoyz</div>
        </div>

        <div style={{ flex: 1, padding: '12px 0' }}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'block',
                padding: '10px 20px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(0, 240, 255, 0.1)' }}>
          <a
            href="/api/admin/logout"
            style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textDecoration: 'none' }}
          >
            Выйти
          </a>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
