'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/cabinet', icon: '\u2302', label: 'Главная' },
  { href: '/cabinet/materials', icon: '\u{1F4DA}', label: 'Материалы' },
  { href: '/cabinet/metodichki', icon: '\u{1F4CB}', label: 'Методички' },
  { href: '/cabinet/feed', icon: '\u26A1', label: 'Лента' },
  { href: '/cabinet/calendar', icon: '\u{1F4C5}', label: 'Ещё' },
];

export default function CabinetNav() {
  const pathname = usePathname();

  return (
    <nav className="cabinet-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`cabinet-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="cabinet-nav-icon">{item.icon}</span>
            <span className="cabinet-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
