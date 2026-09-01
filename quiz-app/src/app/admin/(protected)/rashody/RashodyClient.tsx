'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { CostsReport, ServiceMonth } from '@/lib/costs/report';
import { METRIC_LABEL, formatMetric } from '@/lib/costs/report';
import styles from './rashody.module.css';

function rub(value: number): string {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

function money(value: number, currency: string): string {
  return currency === 'RUB'
    ? rub(value)
    : `$${value.toFixed(value < 10 ? 2 : 0)}`;
}

/** Соседний месяц строкой YYYY-MM. */
function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function PlanForm({ service, onDone }: { service: ServiceMonth; onDone: () => void }) {
  const [amount, setAmount] = useState(String(service.planAmount));
  const [currency, setCurrency] = useState(service.currency);
  const [billingDay, setBillingDay] = useState(service.billingDay ? String(service.billingDay) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch('/api/admin/cost-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: service.service,
        amount: Number(amount.replace(',', '.')),
        currency,
        billingDay: billingDay ? Number(billingDay) : null,
        note: service.note,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? 'не сохранилось');
      return;
    }
    onDone();
  }

  return (
    <div className={styles.form}>
      <label className={styles.field}>
        <span>сумма за месяц</span>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
      </label>
      <label className={styles.field}>
        <span>валюта</span>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="RUB">₽</option>
          <option value="USD">$</option>
        </select>
      </label>
      <label className={styles.field}>
        <span>день списания</span>
        <input
          value={billingDay}
          onChange={(e) => setBillingDay(e.target.value)}
          inputMode="numeric"
          placeholder="—"
        />
      </label>
      <button className={styles.save} onClick={save} disabled={saving}>
        {saving ? 'сохраняю…' : 'сохранить'}
      </button>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

export default function RashodyClient({ report }: { report: CostsReport }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);

  const maxDay = Math.max(1, ...report.daily.map((d) => d.rub));

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>РАСХОДЫ</h1>
      <div className={styles.sub}>
        {report.monthLabel}
        {report.lastCollectedAt && ` · цифры собраны по ${report.lastCollectedAt}`}
        {report.usdRub && ` · доллар ${report.usdRub.toFixed(2)} ₽`}
      </div>

      <div className={styles.months}>
        <Link href={`/admin/rashody?month=${shiftMonth(report.month, -1)}`} className={styles.monthLink}>
          ← предыдущий
        </Link>
        <Link href={`/admin/rashody?month=${shiftMonth(report.month, 1)}`} className={styles.monthLink}>
          следующий →
        </Link>
      </div>

      <div className={styles.totals}>
        <div className={styles.totalMain}>
          <div className={styles.totalValue}>{rub(report.totalRub)}</div>
          <div className={styles.totalLabel}>
            за месяц{report.usdRub ? ` · $${report.totalUsd.toFixed(0)}` : ''}
          </div>
        </div>
        <div className={styles.totalSide}>
          <div className={styles.sideValue}>{rub(report.projectionRub)}</div>
          <div className={styles.sideLabel}>
            выйдет к концу месяца, если темп сохранится ({report.daysElapsed} из{' '}
            {report.daysInMonth} дней)
          </div>
        </div>
      </div>

      {report.daily.length > 0 && (
        <div className={styles.chart}>
          {report.daily.map((d) => (
            <div key={d.date} className={styles.barWrap} title={`${d.date}: ${rub(d.rub)}`}>
              <div className={styles.bar} style={{ height: `${(d.rub / maxDay) * 100}%` }} />
              <div className={styles.barDay}>{d.date.slice(8)}</div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.cards}>
        {report.services.map((s) => (
          <div key={s.service} className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardTitle}>{s.title}</div>
              <div className={styles.cardTotal}>{money(s.total, s.currency)}</div>
            </div>

            <div className={styles.breakdown}>
              {s.planAmount > 0 && <span>тариф {money(s.planAmount, s.currency)}</span>}
              {s.usageCost > 0 && <span>потребление {money(s.usageCost, s.currency)}</span>}
              {s.billingDay && <span>списание {s.billingDay}-го</span>}
              {s.total === 0 && !s.hasUsage && <span className={styles.dim}>сумма не заведена</span>}
            </div>

            {s.metrics.length > 0 && (
              <div className={styles.metrics}>
                {s.metrics.map((m) => (
                  <div key={m.metric} className={styles.metric}>
                    <span className={styles.metricName}>{METRIC_LABEL[m.metric] ?? m.metric}</span>
                    <span className={styles.metricValue}>{formatMetric(m.metric, m.value)}</span>
                    <span className={styles.metricCost}>
                      {m.cost === null ? '—' : money(m.cost, s.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {s.note && <div className={styles.note}>{s.note}</div>}

            {editing === s.service ? (
              <PlanForm
                service={s}
                onDone={() => {
                  setEditing(null);
                  router.refresh();
                }}
              />
            ) : (
              <button className={styles.edit} onClick={() => setEditing(s.service)}>
                править тариф
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
