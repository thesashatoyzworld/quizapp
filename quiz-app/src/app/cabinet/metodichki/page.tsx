'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTelegram } from '@/hooks/useTelegram';
import { usePreview, resolveAccess } from '../PreviewContext';
import CabinetNav from '../CabinetNav';

interface MetodichkaData {
  id: string;
  title: string;
  description: string;
  stepsCount: number;
  estimatedTime: string;
  isFree: boolean;
  hasAccess: boolean;
  productSlug?: string;
  url?: string;
  tags: string[];
}

export default function MetodichkiPage() {
  const { userId, isReady, webApp } = useTelegram();
  const { previewMode, isPreview } = usePreview();
  const [metodichki, setMetodichki] = useState<MetodichkaData[]>([]);
  const [loading, setLoading] = useState(true);

  const previewQs = previewMode ? `?preview=${previewMode}` : '';

  useEffect(() => {
    if (!isReady) return;

    // Track section view
    if (userId && !isPreview) {
      fetch('/api/cabinet/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'section_view',
          telegram_id: userId,
          metadata: { section: 'metodichki' },
        }),
      }).catch(() => {});
    }

    async function fetchMetodichki() {
      try {
        const url = userId
          ? `/api/cabinet/metodichki?telegramId=${userId}`
          : '/api/cabinet/metodichki';
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setMetodichki(data.metodichki);
        }
      } catch (error) {
        console.error('Failed to fetch metodichki:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetodichki();
  }, [userId, isReady, isPreview]);

  const handleItemClick = useCallback((item: MetodichkaData) => {
    const hasAccess = resolveAccess(item, previewMode);
    if (!hasAccess || !item.url) return;

    // Track view
    if (userId && !isPreview) {
      fetch('/api/cabinet/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'material_view',
          telegram_id: userId,
          metadata: {
            material_id: item.id,
            material_title: item.title,
            material_type: 'metodichka',
          },
        }),
      }).catch(() => {});
    }

    if (isPreview) return;

    if (webApp) {
      webApp.openLink(item.url);
    } else {
      window.open(item.url, '_blank');
    }
  }, [userId, webApp, previewMode, isPreview]);

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

  const accessibleCount = metodichki.filter(m => resolveAccess(m, previewMode)).length;

  return (
    <>
      <Link href={`/cabinet${previewQs}`} className="cabinet-back animate-1">
        {'\u2190'} Назад
      </Link>

      <h1 className="cabinet-page-title animate-1">Методички</h1>

      <div className="cabinet-metodichki-intro animate-2">
        Пошаговые гайды и фреймворки для работы с контентом, аудиторией и продажами.
        {accessibleCount < metodichki.length && (
          <> {accessibleCount} из {metodichki.length} доступно.</>
        )}
      </div>

      <div className="animate-3">
        {metodichki.map((item) => {
          const hasAccess = resolveAccess(item, previewMode);
          return (
            <div
              key={item.id}
              className={`cabinet-metodichka-card ${!hasAccess ? 'cabinet-metodichka-card--locked' : ''}`}
              onClick={() => handleItemClick(item)}
            >
              {/* Header row */}
              <div className="cabinet-metodichka-header">
                <div className="cabinet-metodichka-title">
                  {item.title}
                  {item.isFree && (
                    <span className="cabinet-badge cabinet-badge--free">FREE</span>
                  )}
                </div>
                {hasAccess ? (
                  <span className="cabinet-material-arrow">{'\u203A'}</span>
                ) : (
                  <span className="cabinet-lock-icon">{'\u{1F512}'}</span>
                )}
              </div>

              {/* Description */}
              <div className="cabinet-metodichka-desc">{item.description}</div>

              {/* Meta row */}
              <div className="cabinet-metodichka-meta">
                <span className="cabinet-metodichka-meta-item">
                  {item.stepsCount} шагов
                </span>
                <span className="cabinet-metodichka-meta-divider">{'\u00B7'}</span>
                <span className="cabinet-metodichka-meta-item">
                  {item.estimatedTime}
                </span>
              </div>

              {/* Tags */}
              <div className="cabinet-metodichka-tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="cabinet-metodichka-tag">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Locked overlay */}
              {!hasAccess && (
                <div className="cabinet-locked-overlay">
                  <span className="cabinet-locked-overlay-text">
                    Доступно в программе
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upgrade CTA */}
      {accessibleCount < metodichki.length && (
        <div className="cabinet-upgrade-banner animate-4">
          <div className="cabinet-upgrade-title">Все методички в одном месте</div>
          <div className="cabinet-upgrade-text">
            Получите доступ ко всем {metodichki.length} методичкам в рамках программы
          </div>
          <Link href="/connectors" className="cabinet-upgrade-btn">
            Узнать подробности {'\u2192'}
          </Link>
        </div>
      )}

      <CabinetNav />
    </>
  );
}
