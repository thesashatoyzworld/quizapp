'use client';

import React, { ReactNode } from 'react';
import PaymentButton from '@/components/PaymentButton';

export interface CTASectionProps {
  subtitle: string;
  features: ReactNode[];
  bonuses: ReactNode[];
  psLines: string[];
  resultTitle: string;
  userId?: number | null;
  resultId?: string;
  onPaymentClick?: () => void;
}

export function CTASection({
  subtitle,
  features,
  bonuses,
  psLines,
  resultTitle,
  userId,
  resultId,
  onPaymentClick,
}: CTASectionProps) {
  return (
    <div className="card card-cta">
      <div className="cta-badge">МАСТЕР-КЛАСС</div>
      <h2 className="cta-title">«ПРОДАЮЩИЙ КОНТЕНТ»</h2>
      <p className="cta-subtitle">{subtitle}</p>

      <div className="cta-details">
        <span>24 февраля</span>
        <span>17:00 мск</span>
        <span>2 часа</span>
      </div>

      <div className="cta-content">
        <h3 className="label mb-md">Что будет на мастер-классе:</h3>
        <ul className="cta-list">
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>

        <h3 className="label mb-md mt-lg">Что получите дополнительно:</h3>
        <ul className="cta-list cta-list-bonus">
          {bonuses.map((bonus, index) => (
            <li key={index}>{bonus}</li>
          ))}
        </ul>
      </div>

      <div className="cta-guarantee">
        <h4 className="label mb-sm">Гарантия:</h4>
        <p className="text-secondary">
          Если после мастер-класса поймёте, что система не подходит — верну деньги. Без вопросов. Весь риск на мне.
        </p>
      </div>

      <div className="cta-bonus">
        <h4 className="label mb-sm">Бонус сразу после оплаты:</h4>
        <p className="text-cyan"><strong>Шаблон «Богатая ЦА»</strong></p>
        <p className="text-secondary">
          2 промта скормленные нейронке и у вас за 20 минут на руках вся информация по вашей целевой аудитории и самым платежеспособным сегментам.
        </p>
      </div>

      <div className="cta-price">
        <span className="price-amount">3 450</span>
        <span className="price-currency">руб</span>
      </div>

      <p className="cta-note">
        Оплата в любой валюте, включая крипту.<br/>
        Живой эфир + запись навсегда.
      </p>

      <div className="cta-action">
        <PaymentButton
          resultTitle={resultTitle}
          userId={userId}
          resultId={resultId}
          onPaymentClick={onPaymentClick}
        />
      </div>

      <div className="cta-ps">
        {psLines.map((line, index) => (
          <p key={index} className="text-muted">
            <strong>P.{index > 0 ? 'P.'.repeat(index) : 'S.'}</strong> {line}
          </p>
        ))}
      </div>
    </div>
  );
}
