'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTelegram } from '@/hooks/useTelegram';
import { usePreview } from '../PreviewContext';
import CabinetNav from '../CabinetNav';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  joinUrl?: string;
  type: string;
}

const eventTypeLabels: Record<string, string> = {
  masterclass: 'Мастер-класс',
  group_call: 'Групповой созвон',
  webinar: 'Вебинар',
  deadline: 'Дедлайн',
};

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  const month = months[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month}, ${hours}:${minutes}`;
}

export default function CalendarPage() {
  const { userId, isReady, webApp } = useTelegram();
  const { previewMode, isPreview } = usePreview();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
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
          metadata: { section: 'calendar' },
        }),
      }).catch(() => {});
    }

    async function fetchEvents() {
      try {
        const res = await fetch('/api/cabinet/events');
        const data = await res.json();
        if (data.success) {
          setEvents(data.events);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [userId, isReady, isPreview]);

  const handleJoinClick = (url: string) => {
    if (isPreview) return;

    if (url.includes('t.me') && webApp) {
      webApp.openTelegramLink(url);
    } else if (webApp) {
      webApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

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
      <Link href={`/cabinet${previewQs}`} className="cabinet-back animate-1">
        {'\u2190'} Назад
      </Link>

      <h1 className="cabinet-page-title animate-1">Календарь</h1>

      {events.length === 0 ? (
        <div className="cabinet-empty animate-2">
          <div className="cabinet-empty-icon">{'\u{1F4C5}'}</div>
          <div className="cabinet-empty-title">Ближайших событий пока нет</div>
          <div className="cabinet-empty-text">
            Как только появятся новые события, они отобразятся здесь
          </div>
        </div>
      ) : (
        <div className="animate-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="cabinet-event-item"
              data-type={event.type}
            >
              <div className="cabinet-event-date">
                {eventTypeLabels[event.type] || event.type} &mdash; {formatEventDate(event.date)}
              </div>
              <div className="cabinet-event-title">{event.title}</div>
              <div className="cabinet-event-desc">{event.description}</div>
              {event.joinUrl && (
                <button
                  className="cabinet-event-join"
                  onClick={() => handleJoinClick(event.joinUrl!)}
                >
                  Присоединиться {'\u2192'}
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
