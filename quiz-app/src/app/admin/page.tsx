'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://quiz.thesashatoyz.com';

const ERROR_MESSAGES: Record<string, string> = {
  missing: 'Данные авторизации отсутствуют.',
  expired: 'Время авторизации истекло. Попробуйте снова.',
  invalid: 'Неверная подпись авторизации.',
  forbidden: 'Доступ запрещён.',
};

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    const container = document.getElementById('tg-login-container');
    if (!container) return;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'testtoyzbot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-auth-url', `${WEBAPP_URL}/api/admin/auth`);
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    container.appendChild(script);

    return () => {
      if (container.contains(script)) container.removeChild(script);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-body)',
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        borderRadius: '12px',
        padding: '48px',
        textAlign: 'center',
        maxWidth: '360px',
        width: '100%',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.75rem',
          color: 'var(--neon-cyan)',
          letterSpacing: '0.15em',
          marginBottom: '8px',
        }}>
          ADMIN
        </div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '8px',
        }}>
          TheSasha
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          marginBottom: '32px',
        }}>
          Войдите через Telegram
        </p>

        {error && (
          <div style={{
            background: 'rgba(255, 42, 109, 0.1)',
            border: '1px solid rgba(255, 42, 109, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#ff2a6d',
            fontSize: '0.875rem',
            marginBottom: '24px',
          }}>
            {ERROR_MESSAGES[error] || 'Ошибка авторизации.'}
          </div>
        )}

        <div id="tg-login-container" style={{ display: 'flex', justifyContent: 'center' }} />
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
