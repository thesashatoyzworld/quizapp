'use client';

import { useState, useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { useTracking } from '@/hooks/useTracking';
import { buildPaymentUrl } from '@/lib/payment';

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
              Как трансформировать контент в продажи через соц. сети
            </p>

            <div className="cta-details">
              <span>24 февраля</span>
              <span>17:00 мск</span>
              <span>2 часа</span>
            </div>

            <p className="text-secondary mt-lg" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              Это не лекция про теорию.<br/>
              Это разбор конкретных постов и трансформация в режиме реального времени.
            </p>
          </div>

          <div className="card animate-3" style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 className="label mb-md">Что будет на мастер-классе:</h3>
            <ul className="cta-list">
              <li>
                <strong>1. Схема сборки Продающего Контента</strong><br/>
                Пошаговый алгоритм, который превращает "обучающие" посты в "продающие"
              </li>
              <li>
                <strong>2. 3 промпта для нейросетей</strong><br/>
                Вставляете в нейронку, получаете готовый продающий контент за минуты
              </li>
              <li>
                <strong>3. Готовая воронка с 4 рилсов</strong><br/>
                Не теория, а реальная система, которую вы сможете скопировать
              </li>
              <li>
                <strong>4. Методика создания лид-магнитов</strong><br/>
                За которыми люди приходят сами толпами
              </li>
              <li>
                <strong>5. «Фирменный рецепт»</strong><br/>
                Секретный ингредиент, который выделит вас среди тысяч других экспертов
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

          <div className="card animate-5" style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 className="label mb-md text-center">Та же схема дала такие результаты:</h3>

            <div style={{ display: 'grid', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
              <div style={{ padding: 'var(--space-md)', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '8px' }}>
                <p className="text-cyan mb-sm"><strong>Маша — коммерческий сценарист</strong></p>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  4 рилса → 2 000 000 ₽ за месяц<br/>
                  350+ продаж мастер-класса<br/>
                  10 000+ подписчиков в воронке
                </p>
              </div>

              <div style={{ padding: 'var(--space-md)', background: 'rgba(157, 78, 221, 0.1)', border: '1px solid rgba(157, 78, 221, 0.3)', borderRadius: '8px' }}>
                <p className="text-magenta mb-sm"><strong>Вася — фитнес-тренер</strong></p>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  С 100 000 до 500 000 ₽/месяц<br/>
                  При 500 подписчиках<br/>
                  Стабильный доход каждый месяц
                </p>
              </div>

              <div style={{ padding: 'var(--space-md)', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)', borderRadius: '8px' }}>
                <p className="text-green mb-sm"><strong>Женя</strong></p>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  С $2 000 до $8 000/месяц<br/>
                  Используя ту же схему контента
                </p>
              </div>
            </div>

            <p className="text-center text-secondary" style={{ fontSize: '0.95rem' }}>
              Эту же систему вы получите на мастер-классе
            </p>
          </div>

          <div className="card animate-6" style={{ marginBottom: 'var(--space-lg)', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
            <h4 className="label mb-sm">Ваш результат:</h4>
            <p className="text-secondary">
              Цель: окупить мастер-класс минимум в 3 раза за 14 дней.<br/>
              Вы создадите контент, который приводит клиентов — без танцев в сторис и бесплатных созвонов.
            </p>
          </div>

          <div className="card animate-7" style={{ marginBottom: 'var(--space-lg)', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
            <h4 className="label mb-sm">Бонус сразу после оплаты:</h4>
            <p className="text-cyan mb-sm"><strong>Шаблон «Богатая ЦА»</strong></p>
            <p className="text-secondary">
              За 20 минут получите всю информацию по вашей целевой аудитории и самым платежеспособным сегментам.
            </p>
          </div>

          <div className="card animate-8" style={{ marginBottom: 'var(--space-lg)', background: 'rgba(157, 78, 221, 0.1)', border: '1px solid rgba(157, 78, 221, 0.3)' }}>
            <h4 className="label mb-sm">Гарантия:</h4>
            <p className="text-secondary">
              Если после мастер-класса поймёте, что система не подходит — верну деньги. Без вопросов.
            </p>
          </div>

          <div className="card card-cta animate-9" style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="cta-price">
              <span className="price-amount">3 450</span>
              <span className="price-currency">₽</span>
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

          <div className="animate-10" style={{ textAlign: 'center' }}>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              <strong>P.S.</strong> Живой разбор. Реальные кейсы. Без воды и теории.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
