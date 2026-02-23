'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

const ERROR_MESSAGES: Record<string, string> = {
  missing: 'Введите пароль.',
  invalid: 'Неверный пароль.',
};

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.href = '/admin/dashboard';
      } else {
        const data = await res.json();
        setErrorMsg(ERROR_MESSAGES[data.error] || 'Ошибка авторизации.');
        setLoading(false);
      }
    } catch {
      setErrorMsg('Ошибка соединения.');
      setLoading(false);
    }
  };

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
          Введите пароль
        </p>

        {(error || errorMsg) && (
          <div style={{
            background: 'rgba(255, 42, 109, 0.1)',
            border: '1px solid rgba(255, 42, 109, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#ff2a6d',
            fontSize: '0.875rem',
            marginBottom: '24px',
          }}>
            {errorMsg || ERROR_MESSAGES[error!] || 'Ошибка авторизации.'}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            autoFocus
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(0, 240, 255, 0.05)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              marginBottom: '16px',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: loading ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0, 240, 255, 0.15)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRadius: '8px',
              color: 'var(--neon-cyan)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
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
