'use client';

import { useEffect, useState } from 'react';

export function PaymentSuccessBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Clean up URL param without reload
    const url = new URL(window.location.href);
    if (url.searchParams.has('payment')) {
      url.searchParams.delete('payment');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="connectors-payment-success" style={{
      background: 'rgba(0, 255, 136, 0.1)',
      border: '2px solid #00ff88',
      borderRadius: '12px',
      padding: 'var(--space-lg)',
      textAlign: 'center',
      marginBottom: 'var(--space-lg)',
      position: 'relative',
    }}>
      <button
        onClick={() => setVisible(false)}
        style={{
          position: 'absolute',
          top: '8px',
          right: '12px',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          fontSize: '1.2rem',
          cursor: 'pointer',
        }}
        aria-label="Закрыть"
      >
        &times;
      </button>
      <h3 style={{
        color: '#00ff88',
        fontSize: '1.3rem',
        fontWeight: 700,
        marginBottom: 'var(--space-sm)',
      }}>
        Оплата получена!
      </h3>
      <p style={{
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        marginBottom: 0,
      }}>
        Саша свяжется с вами в ближайшее время для организации старта.
      </p>
    </div>
  );
}
