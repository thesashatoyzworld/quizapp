import Link from 'next/link';

// Две части раздела «Инстаграм»: люди из воронок ChatPlace и старая
// авто-ответилка на комментарии.
const TABS = [
  { href: '/admin/instagram', label: 'Люди' },
  { href: '/admin/instagram/autoreply', label: 'Автоответы' },
];

export default function IgNav({ active }: { active: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
      {TABS.map(({ href, label }) => {
        const on = href === active;
        return (
          <Link
            key={href}
            href={href}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: '0.82rem',
              textDecoration: 'none',
              border: `1px solid ${on ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.12)'}`,
              background: on ? 'rgba(0,240,255,0.12)' : 'transparent',
              color: on ? 'var(--neon-cyan)' : 'var(--text-secondary)',
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
