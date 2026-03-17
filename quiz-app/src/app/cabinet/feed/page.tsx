'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTelegram } from '@/hooks/useTelegram';
import { usePreview } from '../PreviewContext';
import CabinetNav from '../CabinetNav';

interface ConnectorPost {
  id: string;
  date: string;
  title: string;
  content: string;
  type: string;
}

interface FeedItem {
  id: string;
  title: string;
  description: string;
  type: string;
  url?: string;
}

interface FeedData {
  archetype: string;
  archetypeName: string;
  intro: string;
  items: FeedItem[];
}

const postTypeLabels: Record<string, string> = {
  insight: 'Инсайт',
  update: 'Обновление',
  behind_the_scenes: 'Закулисье',
  tip: 'Совет',
};

const feedTypeLabels: Record<string, string> = {
  article: 'Статья',
  tip: 'Совет',
  exercise: 'Упражнение',
  case: 'Кейс',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  const month = months[date.getMonth()];
  return `${day} ${month}`;
}

export default function FeedPage() {
  const { userId, isReady } = useTelegram();
  const { previewMode, isPreview, isClientPreview } = usePreview();
  const [posts, setPosts] = useState<ConnectorPost[]>([]);
  const [feed, setFeed] = useState<FeedData | null>(null);
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
          metadata: { section: 'feed' },
        }),
      }).catch(() => {});
    }

    async function fetchData() {
      try {
        // Fetch connector feed
        const postsRes = await fetch('/api/cabinet/connector-feed');
        const postsData = await postsRes.json();
        if (postsData.success) {
          setPosts(postsData.posts);
        }

        // For preview mode, provide mock archetype feed
        if (isPreview) {
          const archetype = isClientPreview ? 'doer' : 'invisible';
          const feedRes = await fetch(`/api/cabinet/feed?archetype=${archetype}`);
          const feedData = await feedRes.json();
          if (feedData.success) {
            setFeed(feedData.feed);
          }
        } else if (userId) {
          // Fetch personalized feed if user has quiz result
          const userRes = await fetch(`/api/cabinet/user?telegramId=${userId}`);
          const userData = await userRes.json();

          if (userData.success && userData.user.quizResult) {
            const feedRes = await fetch(`/api/cabinet/feed?archetype=${userData.user.quizResult}`);
            const feedData = await feedRes.json();
            if (feedData.success) {
              setFeed(feedData.feed);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch feed:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, isReady, isPreview, isClientPreview]);

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

      <h1 className="cabinet-page-title animate-1">Лента Коннектора</h1>

      {/* Connector's feed posts */}
      {posts.length > 0 && (
        <div className="animate-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="cabinet-connector-post"
              data-type={post.type}
            >
              <div className="cabinet-connector-post-meta">
                <span className="cabinet-connector-post-type">
                  {postTypeLabels[post.type] || post.type}
                </span>
                <span className="cabinet-connector-post-date">
                  {formatDate(post.date)}
                </span>
              </div>
              <div className="cabinet-connector-post-title">{post.title}</div>
              <div className="cabinet-connector-post-content">{post.content}</div>
            </div>
          ))}
        </div>
      )}

      {/* Personalized recommendations */}
      {feed && (
        <div className="animate-3">
          <div className="cabinet-section-title" style={{ marginTop: 'var(--space-lg)' }}>
            Для вас
          </div>

          <div className="cabinet-archetype" style={{ marginBottom: 'var(--space-md)' }}>
            <div className="cabinet-archetype-label">Ваш архетип</div>
            <div className="cabinet-archetype-name">{feed.archetypeName}</div>
          </div>

          <div className="cabinet-feed-intro">{feed.intro}</div>

          {feed.items.map((item) => (
            <div
              key={item.id}
              className="cabinet-feed-item"
              data-type={item.type}
            >
              <div className="cabinet-feed-type">
                {feedTypeLabels[item.type] || item.type}
              </div>
              <div className="cabinet-feed-title">{item.title}</div>
              <div className="cabinet-feed-desc">{item.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* No quiz result prompt */}
      {!feed && !isPreview && (
        <div className="animate-3" style={{ marginTop: 'var(--space-lg)' }}>
          <div className="cabinet-section-title">Персональные рекомендации</div>
          <div className="cabinet-empty">
            <div className="cabinet-empty-icon">{'\u26A1'}</div>
            <div className="cabinet-empty-title">Пройдите диагностику</div>
            <div className="cabinet-empty-text">
              Чтобы получить персональные рекомендации, пройдите диагностику контента
            </div>
            <Link href="/" className="cabinet-empty-cta">
              Пройти диагностику
            </Link>
          </div>
        </div>
      )}

      <CabinetNav />
    </>
  );
}
