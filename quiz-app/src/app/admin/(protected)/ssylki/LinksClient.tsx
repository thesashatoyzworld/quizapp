'use client';

import { useState } from 'react';
import type { DealRow } from '@/lib/deals';

const TIER_LABEL: Record<string, string> = {
  t1: 'Тариф 1',
  t2: 'Тариф 2',
  t3: 'Тариф 3',
};

// Каталожные ссылки живут в коде, не в прайсе: у них своя механика.
// Тариф 2 это настоящая подписка Продамуса с автосписанием, тариф 1 разовый
// и бессрочный. Показываем их здесь же, чтобы прайс был в одном месте.
const CATALOG_LINKS = [
  {
    title: 'Группа, работаешь сам · подписка',
    price: 10000,
    term: 'каждый месяц',
    link: 'https://t.me/testtoyzbot?start=uroven_t2_svoi',
    why: 'списывается само каждые 30 дней',
  },
  {
    title: 'Новый уровень контента · тариф 1',
    price: 5450,
    term: 'навсегда',
    link: 'https://t.me/testtoyzbot?start=uroven_kanal',
    why: 'разовая оплата, доступ не кончается',
  },
];

function money(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₽';
}

function days(n: number): string {
  const last = n % 10;
  const teen = n % 100 >= 11 && n % 100 <= 14;
  const word = teen || last === 0 || last >= 5 ? 'дней' : last === 1 ? 'день' : 'дня';
  return `${n} ${word}`;
}

function when(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

const EMPTY = { tier: 't3', price: '', days: '90', title: '', note: '' };

export default function LinksClient({ initial }: { initial: DealRow[] }) {
  const [deals, setDeals] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ ...EMPTY });
  const [editing, setEditing] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function send(payload: Record<string, unknown>) {
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/admin/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) {
        setErr(data.error || 'не сохранилось');
        return false;
      }
      setDeals(data.deals);
      return true;
    } catch (e) {
      setErr(String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    const payload = editing
      ? { action: 'update', id: editing, title: form.title, note: form.note, price: Number(form.price), days: Number(form.days) }
      : { action: 'create', tier: form.tier, price: Number(form.price), days: Number(form.days), title: form.title, note: form.note };
    if (await send(payload)) {
      setForm({ ...EMPTY });
      setEditing(null);
    }
  }

  function startEdit(d: DealRow) {
    setEditing(d.id);
    setForm({ tier: d.tier, price: String(d.price), days: String(d.days), title: d.title, note: d.note || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function copy(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(link);
      setTimeout(() => setCopied((c) => (c === link ? null : c)), 1500);
    } catch {
      setErr('браузер не дал скопировать, выдели ссылку руками');
    }
  }

  const card: React.CSSProperties = {
    background: 'var(--bg-secondary)', border: '1px solid rgba(0,240,255,0.15)',
    borderRadius: 10, padding: '16px', marginBottom: 18,
  };
  const cardLabel: React.CSSProperties = {
    fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'var(--text-muted)', marginBottom: 10,
  };
  const input: React.CSSProperties = {
    background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
    color: 'var(--text-primary)', padding: '7px 10px', fontSize: '0.85rem', minWidth: 0,
  };
  const btn: React.CSSProperties = {
    padding: '7px 14px', borderRadius: 6, border: '1px solid var(--neon-cyan)',
    background: 'rgba(0,240,255,0.12)', color: 'var(--neon-cyan)', fontSize: '0.85rem', cursor: 'pointer',
  };
  const ghost: React.CSSProperties = {
    ...btn, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'var(--text-muted)',
  };
  const th: React.CSSProperties = {
    textAlign: 'left', padding: '10px 12px', fontSize: '0.7rem', letterSpacing: '0.06em',
    textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid rgba(0,240,255,0.15)',
    whiteSpace: 'nowrap',
  };
  const td: React.CSSProperties = {
    padding: '9px 12px', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top',
  };
  const tdNum: React.CSSProperties = { ...td, textAlign: 'right', whiteSpace: 'nowrap' };
  const linkStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', color: 'var(--text-muted)',
    wordBreak: 'break-all',
  };

  return (
    <div style={{ maxWidth: 1180 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontSize: '1.1rem', letterSpacing: '0.1em', marginBottom: 4 }}>
        ССЫЛКИ ДЛЯ ОПЛАТЫ
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 18, maxWidth: 760 }}>
        Каждая ссылка многоразовая: кидай кому угодно и сколько угодно раз. Человек открывает её в боте,
        видит название, цену и срок, платит. Дальше само: доступ на указанный срок, оплата в разделе «Выручка»,
        приветствие и интервью. Счета руками в кабинете Продамуса больше не выставлять, у них пустой номер
        заказа, и платёж проходит мимо системы.
      </p>

      {err && (
        <div style={{ ...card, borderColor: '#ef476f', color: '#ef476f', fontSize: '0.85rem' }}>{err}</div>
      )}

      <div style={card}>
        <div style={cardLabel}>{editing ? 'правим позицию' : 'новая позиция'}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            style={{ ...input, width: 110, opacity: editing ? 0.4 : 1 }}
            value={form.tier}
            disabled={!!editing}
            onChange={(e) => setForm({ ...form, tier: e.target.value })}
          >
            <option value="t3">Тариф 3</option>
            <option value="t2">Тариф 2</option>
            <option value="t1">Тариф 1</option>
          </select>
          <input
            style={{ ...input, width: 120 }}
            placeholder="цена"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <input
            style={{ ...input, width: 100 }}
            placeholder="дней"
            value={form.days}
            onChange={(e) => setForm({ ...form, days: e.target.value })}
          />
          <input
            style={{ ...input, flex: '2 1 260px' }}
            placeholder="название, его увидит человек и чек Продамуса"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            style={{ ...input, flex: '1 1 160px' }}
            placeholder="заметка себе"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
          <button style={{ ...btn, opacity: busy ? 0.5 : 1 }} disabled={busy} onClick={submit}>
            {editing ? 'сохранить' : 'создать ссылку'}
          </button>
          {editing && (
            <button style={ghost} disabled={busy} onClick={() => { setEditing(null); setForm({ ...EMPTY }); }}>
              отмена
            </button>
          )}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 10 }}>
          Позиция это разовый платёж на срок. Автопродления у неё нет: карточка подписки в Продамусе держит
          фиксированную сумму, произвольную под каждого не выставить. Следующий срок продаётся той же ссылкой
          ещё раз, доступ при этом продлевается от текущей даты окончания.
          {editing && ' Цену и срок можно менять, пока по позиции не было ни одной оплаты.'}
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 26 }}>
        <thead>
          <tr>
            <th style={th}>Позиция</th>
            <th style={{ ...th, textAlign: 'right' }}>Цена</th>
            <th style={{ ...th, textAlign: 'right' }}>Срок</th>
            <th style={{ ...th, textAlign: 'right' }}>Оплат</th>
            <th style={th}>Ссылка</th>
            <th style={th} />
          </tr>
        </thead>
        <tbody>
          {deals.length === 0 && (
            <tr><td style={{ ...td, color: 'var(--text-muted)' }} colSpan={6}>прайс пуст</td></tr>
          )}
          {deals.map((d) => {
            const off = d.status !== 'active';
            return (
              <tr key={d.id} style={{ opacity: off ? 0.45 : 1 }}>
                <td style={td}>
                  <div>{d.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 3 }}>
                    {TIER_LABEL[d.tier] || d.tier}
                    {d.note ? ` · ${d.note}` : ''}
                    {off ? ' · закрыта' : ''}
                  </div>
                </td>
                <td style={tdNum}>{money(d.price)}</td>
                <td style={tdNum}>{days(d.days)}</td>
                <td style={tdNum}>
                  {d.paidCount || ''}
                  {d.lastPaidAt && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{when(d.lastPaidAt)}</div>
                  )}
                </td>
                <td style={{ ...td, maxWidth: 320 }}>
                  <div style={linkStyle}>{d.link}</div>
                </td>
                <td style={{ ...td, whiteSpace: 'nowrap', textAlign: 'right' }}>
                  <button style={{ ...btn, marginRight: 6 }} onClick={() => copy(d.link)}>
                    {copied === d.link ? 'скопировано' : 'копировать'}
                  </button>
                  <button style={{ ...ghost, marginRight: 6 }} disabled={busy} onClick={() => startEdit(d)}>
                    править
                  </button>
                  <button
                    style={ghost}
                    disabled={busy}
                    onClick={() => send({ action: 'status', id: d.id, status: off ? 'active' : 'off' })}
                  >
                    {off ? 'открыть' : 'закрыть'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={cardLabel}>каталожные, живут в коде</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {CATALOG_LINKS.map((c) => (
            <tr key={c.link}>
              <td style={td}>
                <div>{c.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 3 }}>{c.why}</div>
              </td>
              <td style={tdNum}>{money(c.price)}</td>
              <td style={tdNum}>{c.term}</td>
              <td style={{ ...td, maxWidth: 320 }}>
                <div style={linkStyle}>{c.link}</div>
              </td>
              <td style={{ ...td, whiteSpace: 'nowrap', textAlign: 'right' }}>
                <button style={btn} onClick={() => copy(c.link)}>
                  {copied === c.link ? 'скопировано' : 'копировать'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
