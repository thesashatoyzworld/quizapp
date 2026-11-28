'use client';

import Link from 'next/link';

// Не импортировать сюда @/lib/metki: он тянет Prisma в клиентский бандл.
type Row = {
  label: string;
  first_at: string;
  pressed: number;
  tracked: boolean;
  got: number;
  watched: number;
  checkout: number;
  paid: number;
  paid_sum: number;
  anon_checkout: number;
  anon_paid: number;
  anon_paid_sum: number;
};

const WINDOWS = [1, 3, 7];

function money(n: number): string {
  return Math.round(n).toLocaleString('ru-RU') + ' ₽';
}

function when(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export default function MetkiClient({ rows, w }: { rows: Row[]; w: number }) {
  const th: React.CSSProperties = {
    textAlign: 'left', padding: '10px 12px', fontSize: '0.7rem', letterSpacing: '0.06em',
    textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid rgba(0,240,255,0.15)',
    whiteSpace: 'nowrap',
  };
  const td: React.CSSProperties = {
    padding: '9px 12px', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top',
  };
  const tdNum: React.CSSProperties = { ...td, textAlign: 'right', whiteSpace: 'nowrap' };
  const muted: React.CSSProperties = { color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 3 };
  const chip = (on: boolean): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 6, fontSize: '0.8rem', textDecoration: 'none',
    border: on ? '1px solid var(--neon-cyan)' : '1px solid rgba(255,255,255,0.15)',
    background: on ? 'rgba(0,240,255,0.12)' : 'transparent',
    color: on ? 'var(--neon-cyan)' : 'var(--text-muted)',
  });

  // До 28.11 у этих меток не было разметки доставки, а сайт потока не знал человека:
  // там прочерк, а не ноль. Оплаты считаются всегда, они привязаны к аккаунту.
  const num = (r: Row, n: number) => (r.tracked || n > 0 ? n : '—');
  const pct = (n: number, of: number) => (of > 0 && n > 0 ? ` · ${Math.round((n / of) * 100)}%` : '');

  return (
    <div style={{ maxWidth: 1180 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontSize: '1.1rem', letterSpacing: '0.1em', marginBottom: 4 }}>
        ПОСТЫ
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 14, maxWidth: 760 }}>
        одна строка на метку из ссылки бота, например potok_tg2811 или kazino_tg_2711. каждого человека
        считаем один раз и смотрим, что он сделал за {w} дн. после своего первого клика. ты сам не считаешься.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 14, maxWidth: 760 }}>
        нажали: запустили бота по метке. получили: бот доставил обещанное или человек открыл страницу.
        посмотрели: смотрел видео или листал страницу. пошли платить: открыли оплату. оплатили: деньги пришли.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {WINDOWS.map((x) => (
          <Link key={x} href={`/admin/metki?w=${x}`} style={chip(x === w)}>
            {x} дн.
          </Link>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Метка</th>
            <th style={th}>Первый клик</th>
            <th style={{ ...th, textAlign: 'right' }}>Нажали</th>
            <th style={{ ...th, textAlign: 'right' }}>Получили</th>
            <th style={{ ...th, textAlign: 'right' }}>Посмотрели</th>
            <th style={{ ...th, textAlign: 'right' }}>Пошли платить</th>
            <th style={{ ...th, textAlign: 'right' }}>Оплатили</th>
            <th style={{ ...th, textAlign: 'right' }}>Сумма</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td style={{ ...td, color: 'var(--text-muted)' }} colSpan={8}>кликов по меткам пока нет</td></tr>
          )}
          {rows.map((r) => {
            const checkout = r.checkout + r.anon_checkout;
            const paid = r.paid + r.anon_paid;
            const sum = r.paid_sum + r.anon_paid_sum;
            return (
              <tr key={r.label}>
                <td style={td}>
                  <div style={{ fontFamily: 'var(--font-mono, monospace)' }}>{r.label}</div>
                  {!r.tracked && <div style={muted}>доставку размечаем с 28.11</div>}
                </td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{when(r.first_at)}</td>
                <td style={tdNum}>{r.pressed}</td>
                <td style={tdNum}>{num(r, r.got)}{pct(r.got, r.pressed)}</td>
                <td style={tdNum}>{num(r, r.watched)}{pct(r.watched, r.pressed)}</td>
                <td style={tdNum}>
                  {num(r, checkout)}
                  {r.anon_checkout > 0 && <div style={muted}>{r.anon_checkout} без телеграма</div>}
                </td>
                <td style={tdNum}>{paid || ''}</td>
                <td style={tdNum}>{sum > 0 ? money(sum) : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
