'use client';

import { useState } from 'react';
import type { Expense } from '@/lib/budget/data';
import {
  BUCKETS, INFO, MONTHS, almatyToday, bucketsFor, currentLifeWeek, defaultMonth,
  formatMoney, type Bucket, type Currency, type MonthKey,
} from '@/content/budget';
import styles from './byudzhet.module.css';

const sum = (list: Expense[]) => list.reduce((s, e) => s + e.amount, 0);

function shortDate(d: string) {
  return `${d.slice(8, 10)}.${d.slice(5, 7)}`;
}

export default function BudgetClient({ initial }: { initial: Expense[] }) {
  const [expenses, setExpenses] = useState(initial);
  const [month, setMonth] = useState<MonthKey>(defaultMonth());
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function call(body: Record<string, unknown>): Promise<boolean> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `ошибка ${res.status}`);
      setExpenses(json.expenses as Expense[]);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  const inMonth = expenses.filter((e) => e.spentAt.startsWith(month));
  const week = currentLifeWeek();
  const weekSpent = sum(expenses.filter((e) => e.bucket === 'life' && e.spentAt >= week.start && e.spentAt <= week.end));
  const weekLeft = week.limit - weekSpent;

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>Бюджет до запуска 360</h1>
      <p className={styles.sub}>
        16 ноября – 15 января · подушка {formatMoney(INFO.cushion, 'RUB')} не трогаем · выводы на Kaspi:{' '}
        {INFO.withdrawals.map((w) => `${formatMoney(w.amount, 'RUB')} (${w.label})`).join(', ')}
      </p>

      {error && <div className={styles.error}>{error}</div>}

      <section className={styles.week}>
        <div className={styles.weekHead}>
          Жизнь на неделю {shortDate(week.start)}–{shortDate(week.end)}
        </div>
        <div className={`${styles.weekBig} ${weekLeft < 0 ? styles.neg : ''}`}>{formatMoney(weekLeft, 'KZT')}</div>
        <div className={styles.hint}>
          осталось на эту неделю · потрачено {formatMoney(weekSpent, 'KZT')} из {formatMoney(week.limit, 'KZT')}
        </div>
        <Bar spent={weekSpent} limit={week.limit} />
      </section>

      <ManualAdd busy={busy} onSave={(e) => call({ action: 'save', expenses: [e] })} />

      <div className={styles.months} role="tablist">
        {MONTHS.map((m) => (
          <button
            key={m.key}
            type="button"
            role="tab"
            aria-selected={m.key === month}
            className={`${styles.chip} ${m.key === month ? styles.chipOn : ''}`}
            onClick={() => setMonth(m.key)}
          >
            {m.label}
            {m.sub && <span className={styles.chipSub}> {m.sub}</span>}
          </button>
        ))}
      </div>

      {(['KZT', 'RUB'] as Currency[]).map((cur) => {
        const buckets = bucketsFor(cur);
        const limit = buckets.reduce((s, b) => s + b.limits[month], 0);
        const spent = sum(inMonth.filter((e) => e.currency === cur));
        return (
          <section key={cur} className={styles.group}>
            <div className={styles.groupHead}>
              <span className={styles.h2}>{cur === 'KZT' ? 'Kaspi, тенге' : 'Рублёвый счёт'}</span>
              <span className={styles.hint}>
                потрачено {formatMoney(spent, cur)} из {formatMoney(limit, cur)}
              </span>
            </div>
            <ul className={styles.list}>
              {buckets.map((b) => (
                <BucketRow
                  key={b.id}
                  bucket={b}
                  month={month}
                  rows={inMonth.filter((e) => e.bucket === b.id)}
                  open={open === b.id}
                  busy={busy}
                  onToggle={() => setOpen(open === b.id ? null : b.id)}
                  onBucket={(id, bucket) => call({ action: 'bucket', id, bucket })}
                  onDelete={(id) => call({ action: 'delete', id })}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function Bar({ spent, limit }: { spent: number; limit: number }) {
  const over = spent > limit;
  const w = limit > 0 ? Math.min(100, (spent / limit) * 100) : spent > 0 ? 100 : 0;
  return (
    <div className={styles.bar}>
      <i className={over ? styles.barOver : ''} style={{ width: `${w}%` }} />
    </div>
  );
}

function BucketRow({
  bucket, month, rows, open, busy, onToggle, onBucket, onDelete,
}: {
  bucket: Bucket;
  month: MonthKey;
  rows: Expense[];
  open: boolean;
  busy: boolean;
  onToggle: () => void;
  onBucket: (id: string, bucket: string) => void;
  onDelete: (id: string) => void;
}) {
  const limit = bucket.limits[month];
  const spent = sum(rows);
  const left = limit - spent;
  const cur = bucket.currency;
  if (!limit && !spent && bucket.id !== 'other' && bucket.id !== 'rother') return null;
  return (
    <li className={styles.bucket}>
      <button type="button" className={styles.bucketHead} aria-expanded={open} onClick={onToggle}>
        <span className={styles.bucketName}>
          <span className={styles.caret} aria-hidden="true">{open ? '▾' : '▸'}</span>
          {bucket.label}
          <span className={styles.bucketHint}>{bucket.hint}</span>
        </span>
        <span className={`${styles.left} ${left < 0 ? styles.neg : ''}`}>
          {limit ? formatMoney(left, cur) : spent ? formatMoney(spent, cur) : '0'}
          <span className={styles.leftLabel}>{limit ? 'осталось' : 'потрачено'}</span>
        </span>
      </button>
      {limit > 0 && <Bar spent={spent} limit={limit} />}
      <div className={styles.hint}>
        {limit ? `потрачено ${formatMoney(spent, cur)} из ${formatMoney(limit, cur)}` : 'лимита нет'}
        {` · ${rows.length} ${rows.length === 1 ? 'запись' : 'записей'}`}
      </div>
      {open && (
        <div className={styles.rows}>
          {bucket.items && <div className={styles.items}>В плане: {bucket.items.join(', ')}</div>}
          {!rows.length && <div className={styles.hint}>За этот месяц записей нет</div>}
          {rows.map((e) => (
            <div key={e.id} className={styles.row}>
              <span className={styles.rowDate}>{shortDate(e.spentAt)}</span>
              <span className={styles.rowName}>{e.merchant || 'без названия'}</span>
              <span className={styles.rowAmount}>{formatMoney(e.amount, e.currency)}</span>
              <span className={styles.rowActions}>
                <select
                  className={styles.select}
                  value={e.bucket}
                  disabled={busy}
                  aria-label="Корзина"
                  onChange={(ev) => onBucket(e.id, ev.target.value)}
                >
                  {bucketsFor(e.currency).map((b) => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className={styles.del}
                  disabled={busy}
                  aria-label="Удалить"
                  onClick={() => {
                    if (confirm(`Удалить ${e.merchant || 'запись'} на ${formatMoney(e.amount, e.currency)}?`)) onDelete(e.id);
                  }}
                >
                  ✕
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

function ManualAdd({
  busy,
  onSave,
}: {
  busy: boolean;
  onSave: (e: Omit<Expense, 'id'>) => Promise<boolean>;
}) {
  const [show, setShow] = useState(false);
  const [spentAt, setSpentAt] = useState(almatyToday());
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('KZT');
  const [bucket, setBucket] = useState('life');
  const [merchant, setMerchant] = useState('');

  if (!show) {
    return (
      <button type="button" className={styles.ghost} onClick={() => setShow(true)}>
        + Добавить вручную
      </button>
    );
  }

  const value = Number(amount.replace(/\s/g, '').replace(',', '.'));

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const ok = await onSave({ spentAt, amount: value, currency, bucket, merchant: merchant.trim(), source: 'manual', note: '' });
    if (ok) {
      setAmount('');
      setMerchant('');
    }
  }

  return (
    <form className={styles.panel} onSubmit={submit}>
      <div className={styles.formGrid}>
        <input className={styles.input} type="date" value={spentAt} onChange={(e) => setSpentAt(e.target.value)} required />
        <input
          className={styles.input}
          inputMode="decimal"
          placeholder="Сумма"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select
          className={styles.input}
          value={currency}
          onChange={(e) => {
            const c = e.target.value as Currency;
            setCurrency(c);
            setBucket(c === 'RUB' ? 'danya' : 'life');
          }}
        >
          <option value="KZT">₸ Kaspi</option>
          <option value="RUB">₽ Т-Банк</option>
        </select>
        <select className={styles.input} value={bucket} onChange={(e) => setBucket(e.target.value)}>
          {BUCKETS.filter((b) => b.currency === currency).map((b) => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
        <input
          className={`${styles.input} ${styles.wide}`}
          placeholder="Что это (магазин, сервис, кому)"
          value={merchant}
          maxLength={200}
          onChange={(e) => setMerchant(e.target.value)}
        />
      </div>
      <div className={styles.formRow}>
        <button type="submit" className={styles.primary} disabled={busy || !(value > 0)}>
          Записать
        </button>
        <button type="button" className={styles.ghost} onClick={() => setShow(false)}>
          Свернуть
        </button>
      </div>
    </form>
  );
}
