'use client';

import { useState, useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { useTracking } from '@/hooks/useTracking';
import { buildPaymentUrl } from '@/lib/telegram';

export default function MasterclassPage() {
  const [utmSource, setUtmSource] = useState<string | null>(null);
  const { user, userId, webApp } = useTelegram();
  const { trackEvent } = useTracking(user, utmSource);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source');
    if (source) {
      setUtmSource(source);
    }

    // Track page view
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    fetch('/api/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'masterclass_view',
        user_id: tgUser?.id,
        username: tgUser?.username,
        first_name: tgUser?.first_name,
        utm_source: source || undefined,
      }),
    }).catch(() => {});
  }, []);

  const handlePayment = async () => {
    // Track payment click
    await trackEvent('payment_click', {
      result_title: 'Мастер-класс (прямая покупка)',
      amount: 3450,
    });

    if (!userId) {
      alert('Откройте страницу через Telegram для оплаты');
      return;
    }

    try {
      const paymentUrl = buildPaymentUrl(userId, 'masterclass_direct');

      if (webApp) {
        webApp.openLink(paymentUrl);
      } else {
        window.open(paymentUrl, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Ошибка создания платежа. Попробуйте ещё раз.');
    }
  };

  return (
    <>
      {/* Background layers */}
      <div className="grid-bg" />
      <div className="scanlines" />
      <div className="glow-sphere glow-sphere-1" />
      <div className="glow-sphere glow-sphere-2" />

      {/* HUD Corners */}
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <main className="quiz-container">
        <div className="quiz-content">
          <div className="animate-1">
            <div className="cta-badge" style={{ marginBottom: 'var(--space-md)' }}>
              МАСТЕР-КЛАСС
            </div>
            <h1 className="title-xl text-cyan" style={{ marginBottom: 'var(--space-sm)' }}>
              «ПРОДАЮЩИЙ КОНТЕНТ»
            </h1>
            <div className="title-line" style={{ marginBottom: 'var(--space-lg)' }} />
          </div>

          <div className="card animate-2" style={{ marginBottom: 'var(--space-xl)' }}>
            <p className="text-secondary text-center mb-lg" style={{ fontSize: '1.1rem' }}>
              Как создавать контент, который продаёт. Без танцев в сторис. Без "давай пользу и жди"
            </p>

            <div className="cta-details">
              <span>24 февраля</span>
              <span>17:00 мск</span>
              <span>2 часа</span>
            </div>
          </div>

          <div className="card animate-3" style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 className="label mb-md">Что будет на мастер-классе:</h3>
            <ul className="cta-list">
              <li>
                <strong>Схема сборки Продающего Контента</strong> — пошаговый алгоритм, который превращает "обучающие" посты в "продающие"
              </li>
              <li>
                <strong>3 промпта для нейросетей</strong> — вставляете в нейронку, получаете готовый продающий контент за минуты
              </li>
              <li>
                <strong>Готовая воронка</strong>, которая принесла 8 000 подписчиков и 300+ продаж с 4 рилсов
              </li>
              <li>
                <strong>Методика создания лид-магнитов</strong>, за которыми люди приходят сами толпами
              </li>
              <li>
                <strong>«Фирменный рецепт»</strong> — секретный ингредиент, который выделит вас среди тысяч других экспертов
              </li>
            </ul>
          </div>

          <div className="card animate-4" style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 className="label mb-md">Что получите дополнительно:</h3>
            <ul className="cta-list cta-list-bonus">
              <li>5 структур-шаблонов продающих постов</li>
              <li>Чек-лист сборки воронки (от оффера до лид-магнитов)</li>
              <li>"Копипаст" файл с лучшими продающими постами</li>
            </ul>
          </div>

          <div className="card animate-5" style={{ marginBottom: 'var(--space-lg)', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
            <h4 className="label mb-sm">Бонус сразу после оплаты:</h4>
            <p className="text-cyan mb-sm"><strong>Шаблон «Богатая ЦА»</strong></p>
            <p className="text-secondary">
              2 промта скормленные нейронке и у вас за 20 минут на руках вся информация по вашей целевой аудитории и самым платежеспособным сегментам.
            </p>
          </div>

          <div className="card animate-6" style={{ marginBottom: 'var(--space-lg)', background: 'rgba(157, 78, 221, 0.1)', border: '1px solid rgba(157, 78, 221, 0.3)' }}>
            <h4 className="label mb-sm">Гарантия:</h4>
            <p className="text-secondary">
              Если после мастер-класса поймёте, что система не подходит — верну деньги. Без вопросов. Весь риск на мне.
            </p>
          </div>

          <div className="card card-cta animate-7" style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="cta-price">
              <span className="price-amount">3 450</span>
              <span className="price-currency">руб</span>
            </div>

            <p className="cta-note" style={{ marginBottom: 'var(--space-lg)' }}>
              Оплата в любой валюте, включая крипту.<br/>
              Живой эфир + запись навсегда.
            </p>

            <button
              onClick={handlePayment}
              className="btn-neon"
              style={{ width: '100%', maxWidth: '400px', fontSize: '1.2rem', padding: 'var(--space-md) var(--space-lg)' }}
            >
              Купить мастер-класс
            </button>
          </div>

          <div className="animate-8" style={{ textAlign: 'center' }}>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              <strong>P.S.</strong> Живой разбор. Реальные кейсы. Без воды и теории.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
