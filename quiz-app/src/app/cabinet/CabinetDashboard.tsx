'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTelegram } from '@/hooks/useTelegram';
import CabinetNav from './CabinetNav';

interface UserPurchase {
  id: string;
  product: {
    id: string;
    slug: string;
    name: string;
    materials: { id: string }[];
  };
}

interface CabinetUser {
  id: string;
  firstName: string | null;
  quizResult: string | null;
  purchases: UserPurchase[];
}

const archetypeNames: Record<string, string> = {
  invisible: 'Эксперт-невидимка',
  doer: 'Делатель без системы',
  generous: 'Щедрый эксперт',
  unstable: 'Нестабильные результаты',
  scale: 'Готовы к масштабированию',
};

export default function CabinetDashboard() {
  const { userId, user, isReady } = useTelegram();
  const [cabinetUser, setCabinetUser] = useState<CabinetUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    // Track cabinet open
    if (userId) {
      fetch('/api/cabinet/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'cabinet_open',
          telegram_id: userId,
        }),
      }).catch(() => {});
    }

    // Fetch user data
    async function fetchUser() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/cabinet/user?telegramId=${userId}`);
        const data = await res.json();
        if (data.success) {
          setCabinetUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch cabinet user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId, isReady]);

  if (!isReady || loading) {
    return (
      <>
        <div className="cabinet-loading">
          <div className="cabinet-spinner" />
          <span className="cabinet-loading-text">Загрузка...</span>
        </div>
        <CabinetNav />
      </>
    );
  }

  const firstName = cabinetUser?.firstName || user?.first_name || null;
  const quizResult = cabinetUser?.quizResult || null;
  const totalProducts = cabinetUser?.purchases?.length || 0;
  const totalMaterials = cabinetUser?.purchases?.reduce(
    (sum, p) => sum + (p.product.materials?.length || 0), 0
  ) || 0;

  const sections = [
    {
      href: '/cabinet/materials',
      icon: '\u{1F4DA}',
      name: 'Материалы',
      desc: totalMaterials > 0
        ? `${totalMaterials} материалов доступно`
        : 'Видео, PDF, ссылки',
    },
    {
      href: '/cabinet/metodichki',
      icon: '\u{1F4CB}',
      name: 'Методички',
      desc: 'Пошаговые гайды и фреймворки',
    },
    {
      href: '/cabinet/announcements',
      icon: '\u{1F4E2}',
      name: 'Анонсы',
      desc: 'Новости и обновления',
    },
    {
      href: '/cabinet/calendar',
      icon: '\u{1F4C5}',
      name: 'Календарь',
      desc: 'Ближайшие события',
    },
    {
      href: '/cabinet/feed',
      icon: '\u26A1',
      name: 'Лента Коннектора',
      desc: 'Мысли, инсайты, закулисье',
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="cabinet-header animate-1">
        <div className="cabinet-greeting">
          {firstName
            ? <>Привет, <span className="cabinet-greeting-name">{firstName}</span></>
            : 'Личный кабинет'
          }
        </div>
        <div className="cabinet-subtitle">Ваше пространство для роста</div>
      </div>

      {/* Archetype Badge */}
      {quizResult && archetypeNames[quizResult] && (
        <div className="cabinet-archetype animate-2">
          <div className="cabinet-archetype-label">Ваш архетип</div>
          <div className="cabinet-archetype-name">{archetypeNames[quizResult]}</div>
        </div>
      )}

      {/* Stats */}
      <div className="cabinet-stats animate-2">
        <div className="cabinet-stat-card">
          <div className="cabinet-stat-number">{totalProducts}</div>
          <div className="cabinet-stat-label">Продуктов</div>
        </div>
        <div className="cabinet-stat-card">
          <div className="cabinet-stat-number">{totalMaterials}</div>
          <div className="cabinet-stat-label">Материалов</div>
        </div>
      </div>

      {/* Section Links */}
      <div className="cabinet-section-title animate-3">Разделы</div>
      <div className="cabinet-sections animate-3">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="cabinet-section-card">
            <span className="cabinet-section-icon">{section.icon}</span>
            <div className="cabinet-section-info">
              <div className="cabinet-section-name">{section.name}</div>
              <div className="cabinet-section-desc">{section.desc}</div>
            </div>
            <span className="cabinet-section-arrow">{'\u203A'}</span>
          </Link>
        ))}
      </div>

      <CabinetNav />
    </>
  );
}
