'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/hooks/useTelegram';
import CabinetNav from '../CabinetNav';

interface Announcement {
  id: string;
  date: string;
  title: string;
  content: string;
  actionText?: string;
  actionUrl?: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function AnnouncementsPage() {
  const { userId, isReady } = useTelegram();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    // Track section view
    if (userId) {
      fetch('/api/cabinet/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'section_view',
          telegram_id: userId,
          metadata: { section: 'announcements' },
        }),
      }).catch(() => {});
    }

    async function fetchAnnouncements() {
      try {
        const res = await fetch('/api/cabinet/announcements');
        const data = await res.json();
        if (data.success) {
          setAnnouncements(data.announcements);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
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

  return (
    <>
      <Link href="/cabinet" className="cabinet-back animate-1">
        {'<'} Назад
      </Link>

      <h1 className="cabinet-page-title animate-1">Анонсы</h1>

      {announcements.length === 0 ? (
        <div className="cabinet-empty animate-2">
          <div className="cabinet-empty-icon">{'\u{1F4E2}'}</div>
          <div className="cabinet-empty-title">Новых анонсов пока нет</div>
          <div className="cabinet-empty-text">
            Следите за обновлениями — здесь будут важные новости
          </div>
        </div>
      ) : (
        <div className="animate-2">
          {announcements.map((ann) => (
            <div key={ann.id} className="cabinet-announcement">
              <div className="cabinet-announcement-date">{formatDate(ann.date)}</div>
              <div className="cabinet-announcement-title">{ann.title}</div>
              <div className="cabinet-announcement-text">{ann.content}</div>
              {ann.actionText && ann.actionUrl && (
                <button
                  className="cabinet-announcement-action"
                  onClick={() => router.push(ann.actionUrl!)}
                >
                  {ann.actionText} {'\u2192'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <CabinetNav />
    </>
  );
}
