'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTelegram } from '@/hooks/useTelegram';
import { usePreview } from './PreviewContext';
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

// Section metadata with item counts and locked states
const sectionsMeta = [
  {
    href: '/cabinet/materials',
    icon: '\u{1F4DA}',
    name: 'Материалы',
    desc: 'Видео, PDF, гайды',
    totalItems: 13,
    freeItems: 3,
  },
  {
    href: '/cabinet/metodichki',
    icon: '\u{1F4CB}',
    name: 'Методички',
    desc: 'Пошаговые фреймворки',
    totalItems: 6,
    freeItems: 2,
  },
  {
    href: '/cabinet/announcements',
    icon: '\u{1F4E2}',
    name: 'Анонсы',
    desc: 'Новости и обновления',
    totalItems: 3,
    freeItems: 3,
  },
  {
    href: '/cabinet/calendar',
    icon: '\u{1F4C5}',
    name: 'Календарь',
    desc: 'Ближайшие события',
    totalItems: 3,
    freeItems: 3,
  },
  {
    href: '/cabinet/feed',
    icon: '\u26A1',
    name: 'Лента Коннектора',
    desc: 'Мысли, инсайты, закулисье',
    totalItems: 4,
    freeItems: 4,
  },
];

export default function CabinetDashboard() {
  const { userId, user, isReady } = useTelegram();
  const { previewMode, isClientPreview, isFreePreview } = usePreview();
  const searchParams = useSearchParams();
  const [cabinetUser, setCabinetUser] = useState<CabinetUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Build query string to pass preview param to sub-pages
  const previewQs = previewMode ? `?preview=${previewMode}` : '';

  useEffect(() => {
    if (!isReady) return;

    // Track cabinet open
    if (userId && !previewMode) {
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
      if (!userId && !previewMode) {
        setLoading(false);
        return;
      }

      // In preview mode without a real user, create mock data
      if (previewMode && !userId) {
        if (isClientPreview) {
          setCabinetUser({
            id: 'preview-client',
            firstName: 'Клиент',
            quizResult: 'doer',
            purchases: [
              {
                id: 'preview-1',
                product: { id: 'p1', slug: 'masterclass', name: 'Мастер-класс', materials: [{id:'m1'},{id:'m2'},{id:'m3'},{id:'m4'},{id:'m5'}] },
              },
              {
                id: 'preview-2',
                product: { id: 'p2', slug: 'connectors-basic', name: 'Коннекторы', materials: [{id:'m6'},{id:'m7'},{id:'m8'},{id:'m9'},{id:'m10'}] },
              },
            ],
          });
        } else {
          setCabinetUser({
            id: 'preview-free',
            firstName: 'Гость',
            quizResult: 'invisible',
            purchases: [],
          });
        }
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
  }, [userId, isReady, previewMode, isClientPreview]);

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
  const hasPurchases = (cabinetUser?.purchases?.length || 0) > 0;
  const totalProducts = cabinetUser?.purchases?.length || 0;
  const totalMaterials = cabinetUser?.purchases?.reduce(
    (sum, p) => sum + (p.product.materials?.length || 0), 0
  ) || 0;

  // Determine if user has full access (for section badge display)
  const hasFullAccess = isClientPreview || hasPurchases;

  return (
    <>
      {/* Header */}
      <div className="cabinet-header animate-1">
        <div className="cabinet-header-top">
          <div>
            <div className="cabinet-greeting">
              {firstName
                ? <>Привет, <span className="cabinet-greeting-name">{firstName}</span></>
                : 'Личный кабинет'
              }
            </div>
            <div className="cabinet-subtitle">Ваше пространство для роста</div>
          </div>
        </div>
      </div>

      {/* Archetype Badge */}
      {quizResult && archetypeNames[quizResult] && (
        <div className="cabinet-archetype animate-2">
          <div className="cabinet-archetype-label">Ваш архетип</div>
          <div className="cabinet-archetype-name">{archetypeNames[quizResult]}</div>
        </div>
      )}

      {/* Stats */}
      {(hasFullAccess || totalProducts > 0) && (
        <div className="cabinet-stats animate-2">
          <div className="cabinet-stat-card">
            <div className="cabinet-stat-number">
              {isClientPreview ? 2 : totalProducts}
            </div>
            <div className="cabinet-stat-label">Продуктов</div>
          </div>
          <div className="cabinet-stat-card">
            <div className="cabinet-stat-number">
              {isClientPreview ? 13 : totalMaterials}
            </div>
            <div className="cabinet-stat-label">Материалов</div>
          </div>
        </div>
      )}

      {/* Section Cards — aizdec.me inspired grid */}
      <div className="cabinet-section-title animate-3">Разделы</div>
      <div className="cabinet-sections animate-3">
        {sectionsMeta.map((section) => {
          const accessible = hasFullAccess ? section.totalItems : section.freeItems;
          const hasLocked = accessible < section.totalItems && !hasFullAccess;

          return (
            <Link
              key={section.href}
              href={`${section.href}${previewQs}`}
              className="cabinet-section-card"
            >
              <span className="cabinet-section-icon">{section.icon}</span>
              <div className="cabinet-section-info">
                <div className="cabinet-section-name">{section.name}</div>
                <div className="cabinet-section-desc">{section.desc}</div>
              </div>
              <div className="cabinet-section-right">
                {hasLocked && (
                  <span className="cabinet-section-count">
                    {accessible}/{section.totalItems}
                  </span>
                )}
                <span className="cabinet-section-arrow">{'\u203A'}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Upgrade CTA for free users */}
      {!hasFullAccess && (
        <div className="cabinet-upgrade-banner animate-4">
          <div className="cabinet-upgrade-title">Получите полный доступ</div>
          <div className="cabinet-upgrade-text">
            Все материалы, методички и групповые занятия в одном месте
          </div>
          <Link href="/connectors" className="cabinet-upgrade-btn">
            Посмотреть программы {'\u2192'}
          </Link>
        </div>
      )}

      <CabinetNav />
    </>
  );
}
