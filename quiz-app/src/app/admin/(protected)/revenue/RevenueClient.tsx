'use client';

import { useMemo, useState } from 'react';
import type { MonthReport, RevenueEntry } from '@/lib/revenue';

const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

const CHANNELS: Record<string, string> = {
  prodamus: 'Продамус',
  manual: 'мимо кассы',
};

function money(n: number): string {
  return Math.round(n).toLocaleString('ru-RU') + ' ₽';
}
function shortMoney(n: number): string {
  if (n >= 1000) return Math.round(n / 1000) + 'к';
  return String(Math.round(n));
}
function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}
function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY = { paidAt: today(), amount: '', payout: '', who: '', product: '', channel: 'manual', note: '' };

export default function RevenueClient({ initial }: { initial: MonthReport }) {
  const [report, setReport] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ ...EMPTY });
  const [editing, setEditing] = useState<string | null>(null);
  const [goalDraft, setGoalDraft] = useState(String(initial.totals.target));

  const t = report.totals;
  const ahead = t.delta >= 0;
  const maxDay = useMemo(() => Math.max(...t.byDay.map((d) => d.amount), 1), [t.byDay]);

  async function send(payload: Record<string, unknown>) {
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/admin/revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: report.month, ...payload }),
      });
      const data = await r.json();
      if (!r.ok) {
        setErr(data.error || 'не сохранилось');
        return false;
      }
      setReport(data);
      return true;
    } catch (e) {
      setErr(String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function loadMonth(month: string) {
    setBusy(true);
    setErr('');
    try {
      const r = await fetch(`/api/admin/revenue?month=${month}`);
      const data = await r.json();
      if (!r.ok) { setErr(data.error || 'не загрузилось'); return; }
      setReport(data);
      setGoalDraft(String(data.totals.target));
      window.history.replaceState(null, '', `/admin/revenue?month=${month}`);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!form.amount) { setErr('без суммы записывать нечего'); return; }
    const ok = await send({
      action: editing ? 'update' : 'create',
      id: editing,
      paidAt: form.paidAt,
      amount: Number(form.amount),
      payout: form.payout === '' ? null : Number(form.payout),
      who: form.who,
      product: form.product,
      channel: form.channel,
      note: form.note,
    });
    if (ok) { setForm({ ...EMPTY }); setEditing(null); }
  }

  function startEdit(e: RevenueEntry) {
    setEditing(e.id);
    setForm({
      paidAt: e.paidAt,
      amount: String(e.amount),
      payout: e.payout == null ? '' : String(e.payout),
      who: e.who,
      product: e.product,
      channel: e.channel,
      note: e.note,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const card: React.CSSProperties = {
    background: 'var(--bg-secondary)', border: '1px solid rgba(0,240,255,0.15)',
    borderRadius: 10, padding: '14px 16px', minWidth: 150, flex: '1 1 150px',
  };
  const cardLabel: React.CSSProperties = {
    fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'var(--text-muted)', marginBottom: 6,
  };
  const cardValue: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: '1.35rem' };
  const input: React.CSSProperties = {
    background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
    color: 'var(--text-primary)', padding: '7px 10px', fontSize: '0.85rem', minWidth: 0,
  };
  const btn: React.CSSProperties = {
    padding: '7px 14px', borderRadius: 6, border: '1px solid var(--neon-cyan)',
    background: 'rgba(0,240,255,0.12)', color: 'var(--neon-cyan)', fontSize: '0.85rem', cursor: 'pointer',
  };
  const th: React.CSSProperties = {
    textAlign: 'left', padding: '10px 12px', fontSize: '0.7rem', letterSpacing: '0.06em',
    textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid rgba(0,240,255,0.15)',
    whiteSpace: 'nowrap',
  };
  const td: React.CSSProperties = {
    padding: '9px 12px', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top',
  };

  return (
    <div style={{ maxWidth: 1180 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontSize: '1.1rem', letterSpacing: '0.1em', marginBottom: 4 }}>
        ВЫРУЧКА · {monthLabel(report.month).toUpperCase()}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 18 }}>
        Полной картины денег в базе нет: сюда падает только то, что прошло через наш чекаут. Менторские сделки,
        тариф 2 и переводы мимо кассы вносим руками, иначе в конце месяца их никто не вспомнит.
      </p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <button style={{ ...btn, opacity: busy ? 0.5 : 1 }} disabled={busy} onClick={() => loadMonth(shiftMonth(report.month, -1))}>← предыдущий</button>
        <button style={{ ...btn, opacity: busy ? 0.5 : 1 }} disabled={busy} onClick={() => loadMonth(shiftMonth(report.month, 1))}>следующий →</button>
        <span style={{ flex: 1 }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>цель месяца</span>
        <input style={{ ...input, width: 120 }} value={goalDraft} onChange={(e) => setGoalDraft(e.target.value)} />
        <button style={btn} disabled={busy} onClick={() => send({ action: 'goal', target: Number(goalDraft) })}>сохранить</button>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={card}>
          <div style={cardLabel}>собрано</div>
          <div style={{ ...cardValue, color: 'var(--neon-cyan)' }}>{money(t.gross)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>на счёт {money(t.net)}</div>
        </div>
        <div style={card}>
          <div style={cardLabel}>цель</div>
          <div style={cardValue}>{money(t.target)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{money(t.perDayPlan)} в день</div>
        </div>
        <div style={card}>
          <div style={cardLabel}>план на {t.daysPassed} {t.daysPassed === 1 ? 'день' : 'дней'}</div>
          <div style={cardValue}>{money(t.planToDate)}</div>
          <div style={{ fontSize: '0.75rem', color: ahead ? '#06d6a0' : '#ef476f', marginTop: 4 }}>
            {ahead ? 'опережение' : 'отставание'} {money(Math.abs(t.delta))}
          </div>
        </div>
        <div style={card}>
          <div style={cardLabel}>осталось собрать</div>
          <div style={cardValue}>{money(t.remain)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {t.perDayNeeded > 0 ? `${money(t.perDayNeeded)} в день` : 'месяц закрыт'}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: 10, padding: '16px 16px 10px', marginBottom: 18 }}>
        <div style={{ ...cardLabel, marginBottom: 12 }}>по дням, пунктир — дневной план</div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 3, height: 120 }}>
          <div style={{
            position: 'absolute', left: 0, right: 0, borderTop: '1px dashed rgba(255,255,255,0.25)',
            bottom: `${Math.min((t.perDayPlan / maxDay) * 100, 100)}%`,
          }} />
          {t.byDay.map((d) => (
            <div key={d.day} title={`${d.day}: ${money(d.amount)}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
              <div style={{
                height: `${(d.amount / maxDay) * 100}%`,
                background: d.amount >= t.perDayPlan ? '#06d6a0' : 'rgba(0,240,255,0.45)',
                borderRadius: '2px 2px 0 0', minHeight: d.amount > 0 ? 2 : 0,
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 3, marginTop: 5 }}>
          {t.byDay.map((d) => (
            <div key={d.day} style={{ flex: 1, textAlign: 'center', fontSize: '0.55rem', color: 'var(--text-muted)' }}>
              {d.day % 5 === 0 || d.day === 1 ? d.day : ''}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: 10, padding: 16, marginBottom: 18 }}>
        <div style={{ ...cardLabel, marginBottom: 10 }}>{editing ? 'правим запись' : 'добавить оплату'}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input style={{ ...input, width: 140 }} type="date" value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} />
          <input style={{ ...input, width: 110 }} placeholder="сумма" inputMode="numeric" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input style={{ ...input, width: 120 }} placeholder="к выплате" inputMode="numeric" value={form.payout} onChange={(e) => setForm({ ...form, payout: e.target.value })} />
          <input style={{ ...input, width: 190 }} placeholder="кто" value={form.who} onChange={(e) => setForm({ ...form, who: e.target.value })} />
          <input style={{ ...input, width: 190 }} placeholder="что купил" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} />
          <select style={{ ...input, width: 140 }} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
            <option value="prodamus">Продамус</option>
            <option value="manual">мимо кассы</option>
          </select>
          <input style={{ ...input, flex: '1 1 200px' }} placeholder="заметка" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <button style={{ ...btn, opacity: busy ? 0.5 : 1 }} disabled={busy} onClick={submit}>{editing ? 'сохранить' : 'записать'}</button>
          {editing && (
            <button style={{ ...btn, borderColor: 'rgba(255,255,255,0.2)', background: 'transparent', color: 'var(--text-secondary)' }}
              onClick={() => { setEditing(null); setForm({ ...EMPTY }); }}>отмена</button>
          )}
        </div>
        {err && <div style={{ color: '#ef476f', fontSize: '0.8rem', marginTop: 8 }}>{err}</div>}
      </div>

      {report.orphans.length > 0 && (
        <div style={{ background: 'rgba(255,209,102,0.08)', border: '1px solid rgba(255,209,102,0.35)', borderRadius: 10, padding: 16, marginBottom: 18 }}>
          <div style={{ fontSize: '0.85rem', marginBottom: 8 }}>
            В базе есть {report.orphans.length} {report.orphans.length === 1 ? 'оплата' : 'оплат'} на {money(report.orphans.reduce((s, o) => s + o.amount, 0))}, которых нет в реестре.
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
            {report.orphans.slice(0, 6).map((o) => `${o.paidAt.slice(8)}.${o.paidAt.slice(5, 7)} · ${money(o.amount)}`).join('   ')}
            {report.orphans.length > 6 ? '   …' : ''}
          </div>
          <button style={{ ...btn, borderColor: '#ffd166', background: 'rgba(255,209,102,0.15)', color: '#ffd166' }}
            disabled={busy} onClick={() => send({ action: 'import' })}>забрать в реестр</button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-secondary)', borderRadius: 10, overflow: 'hidden' }}>
        <thead>
          <tr>
            <th style={th}>дата</th>
            <th style={th}>кто</th>
            <th style={th}>что</th>
            <th style={{ ...th, textAlign: 'right' }}>сумма</th>
            <th style={{ ...th, textAlign: 'right' }}>к выплате</th>
            <th style={th}>канал</th>
            <th style={th}>заметка</th>
            <th style={th} />
          </tr>
        </thead>
        <tbody>
          {report.entries.map((e) => (
            <tr key={e.id}>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>{e.paidAt.slice(8)}.{e.paidAt.slice(5, 7)}</td>
              <td style={td}>{e.who || '—'}</td>
              <td style={td}>{e.product || '—'}</td>
              <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-display)' }}>{money(e.amount)}</td>
              <td style={{ ...td, textAlign: 'right', color: 'var(--text-muted)' }}>{e.payout == null ? '—' : money(e.payout)}</td>
              <td style={{ ...td, color: 'var(--text-muted)' }}>{CHANNELS[e.channel] || e.channel}</td>
              <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.78rem' }}>{e.note}</td>
              <td style={{ ...td, whiteSpace: 'nowrap', textAlign: 'right' }}>
                <button onClick={() => startEdit(e)} style={{ background: 'none', border: 'none', color: 'var(--neon-cyan)', cursor: 'pointer', fontSize: '0.78rem' }}>править</button>
                <button onClick={() => { if (confirm('удалить запись?')) send({ action: 'delete', id: e.id }); }}
                  style={{ background: 'none', border: 'none', color: '#ef476f', cursor: 'pointer', fontSize: '0.78rem' }}>удалить</button>
              </td>
            </tr>
          ))}
          {report.entries.length === 0 && (
            <tr><td style={{ ...td, color: 'var(--text-muted)' }} colSpan={8}>за этот месяц ничего не записано</td></tr>
          )}
        </tbody>
        {report.entries.length > 0 && (
          <tfoot>
            <tr>
              <td style={{ ...td, fontWeight: 600 }} colSpan={3}>итого {report.entries.length}</td>
              <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)' }}>{money(t.gross)}</td>
              <td style={{ ...td, textAlign: 'right', color: 'var(--text-muted)' }}>{money(t.net)}</td>
              <td style={td} colSpan={3} />
            </tr>
          </tfoot>
        )}
      </table>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 12 }}>
        Комиссия видна разницей между суммой и выплатой: рублёвые платежи теряют около 4 %, а с конвертацией валюты — все 10 %.
        Цель считается по сумме, столбик «на счёт» показывает, сколько из этого реально доходит. Максимум в дне — {shortMoney(maxDay)}.
      </p>
    </div>
  );
}
