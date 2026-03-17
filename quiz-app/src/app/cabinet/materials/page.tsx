'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTelegram } from '@/hooks/useTelegram';
import { usePreview, resolveAccess } from '../PreviewContext';
import CabinetNav from '../CabinetNav';

interface CatalogItem {
  id: string;
  title: string;
  description: string;
  type: string;
  isFree: boolean;
  hasAccess: boolean;
  productSlug?: string;
  url?: string;
  sortOrder: number;
}

interface CatalogSection {
  id: string;
  name: string;
  description: string;
  items: CatalogItem[];
}

const materialIcons: Record<string, string> = {
  video: '\u{1F3A5}',
  pdf: '\u{1F4C4}',
  link: '\u{1F517}',
  telegram_group: '\u{1F4AC}',
};

function getMaterialIcon(type: string): string {
  return materialIcons[type] || '\u{1F4CE}';
}

export default function MaterialsPage() {
  const { userId, isReady, webApp } = useTelegram();
  const { previewMode, isPreview } = usePreview();
  const [sections, setSections] = useState<CatalogSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const previewQs = previewMode ? `?preview=${previewMode}` : '';

  useEffect(() => {
    if (!isReady) return;

    // Track section view (skip in preview mode)
    if (userId && !isPreview) {
      fetch('/api/cabinet/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'section_view',
          telegram_id: userId,
          metadata: { section: 'materials' },
        }),
      }).catch(() => {});
    }

    async function fetchCatalog() {
      try {
        const url = userId
          ? `/api/cabinet/catalog?telegramId=${userId}`
          : '/api/cabinet/catalog';
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setSections(data.sections);
          // Auto-expand first section
          if (data.sections.length > 0) {
            setExpandedSections(new Set([data.sections[0].id]));
          }
        }
      } catch (error) {
        console.error('Failed to fetch catalog:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, [userId, isReady, isPreview]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const handleItemClick = useCallback((item: CatalogItem) => {
    const hasAccess = resolveAccess(item, previewMode);
    if (!hasAccess || !item.url) return;

    // Track material view
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
            material_type: item.type,
          },
        }),
      }).catch(() => {});
    }

    // In preview mode, don't actually open links
    if (isPreview) return;

    // Open the URL
    if (item.type === 'telegram_group' && webApp) {
      webApp.openTelegramLink(item.url);
    } else if (webApp) {
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

  // Compute counts with preview mode awareness
  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const totalAccessible = sections.reduce(
    (sum, s) => sum + s.items.filter(i => resolveAccess(i, previewMode)).length, 0
  );

  return (
    <>
      <Link href={`/cabinet${previewQs}`} className="cabinet-back animate-1">
        {'\u2190'} Назад
      </Link>

      <h1 className="cabinet-page-title animate-1">Материалы</h1>

      {/* Access stats */}
      <div className="cabinet-access-stats animate-2">
        <div className="cabinet-access-stat">
          <span className="cabinet-access-stat-num cabinet-access-stat-num--available">{totalAccessible}</span>
          <span className="cabinet-access-stat-label">Доступно</span>
        </div>
        <div className="cabinet-access-stat-divider" />
        <div className="cabinet-access-stat">
          <span className="cabinet-access-stat-num">{totalItems}</span>
          <span className="cabinet-access-stat-label">Всего</span>
        </div>
      </div>

      <div className="animate-3">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const sectionAccessible = section.items.filter(i => resolveAccess(i, previewMode)).length;
          const isFreeSection = section.id === 'free-materials';

          return (
            <div key={section.id} className="cabinet-product-group">
              <div
                className={`cabinet-product-header ${isFreeSection ? 'cabinet-product-header--free' : ''}`}
                onClick={() => toggleSection(section.id)}
              >
                <div className="cabinet-product-header-info">
                  <span className="cabinet-product-name">{section.name}</span>
                  <span className="cabinet-product-count">
                    {sectionAccessible === section.items.length
                      ? `${section.items.length} материалов`
                      : `${sectionAccessible} из ${section.items.length} доступно`
                    }
                  </span>
                </div>
                <span className={`cabinet-product-toggle ${isExpanded ? 'open' : ''}`}>
                  {'\u25BC'}
                </span>
              </div>

              {isExpanded && (
                <div className="cabinet-materials-list">
                  {section.items.map((item) => {
                    const hasAccess = resolveAccess(item, previewMode);
                    return (
                      <div
                        key={item.id}
                        className={`cabinet-material-item ${!hasAccess ? 'cabinet-material-item--locked' : ''}`}
                        onClick={() => handleItemClick(item)}
                      >
                        <span className="cabinet-material-icon">
                          {getMaterialIcon(item.type)}
                        </span>
                        <div className="cabinet-material-info">
                          <div className="cabinet-material-title">
                            {item.title}
                            {item.isFree && (
                              <span className="cabinet-badge cabinet-badge--free">FREE</span>
                            )}
                          </div>
                          {item.description && (
                            <div className="cabinet-material-desc">{item.description}</div>
                          )}
                        </div>
                        {hasAccess ? (
                          <span className="cabinet-material-arrow">{'\u203A'}</span>
                        ) : (
                          <span className="cabinet-lock-icon">{'\u{1F512}'}</span>
                        )}
                      </div>
                    );
                  })}

                  {/* CTA for locked sections */}
                  {sectionAccessible < section.items.length && !isFreeSection && (
                    <div className="cabinet-paywall-cta">
                      <div className="cabinet-paywall-text">
                        Получите доступ ко всем материалам
                      </div>
                      <Link href="/connectors" className="cabinet-paywall-btn">
                        Узнать подробности {'\u2192'}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Global CTA for free users */}
      {totalAccessible < totalItems && (
        <div className="cabinet-upgrade-banner animate-4">
          <div className="cabinet-upgrade-title">Хотите больше?</div>
          <div className="cabinet-upgrade-text">
            Получите доступ ко всем материалам, методичкам и групповым занятиям
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
