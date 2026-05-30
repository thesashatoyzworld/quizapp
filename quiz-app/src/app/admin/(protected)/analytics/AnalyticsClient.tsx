'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { Analytics, Period, Kpis } from '@/lib/analytics';

const PERIOD_LABELS: Record<Period, string> = { today: 'Сегодня', '7d': '7 дней', '30d': '30 дней' };

// Pretty names for known slugs / blog paths.
const TITLES: Record<string, string> = {
  '10-chit-kodov': '10 чит-кодов',
  'pochemu-kontent-ne-idet': 'Почему контент не идёт',
  'urovni-navyka-kontenta': '6 уровней навыка',
  '/blog/10-chit-kodov-dlya-kontenta': '10 чит-кодов',
  '/blog/urovni-navyka-kontenta': '6 уровней навыка',
  '/blog/pochemu-kontent-ne-idet': 'Почему контент не идёт',
  '/blog/naydi-svoyu-igru': 'Найди свою игру',
  '/blog/ne-obnulyay-svoy-opyt': 'Не обнуляй свой опыт',
};
const titleOf = (k: string) => TITLES[k] || k.replace('/blog/', '');

function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (prev === 0) {
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{cur > 0 ? 'новое' : '—'}</span>;
  }
  const pct = Math.round(((cur - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <span style={{ color: up ? 'var(--success)' : 'var(--danger)', fontSize: '0.7rem', fontWeight: 600 }}>
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  );
}

function KpiCard({ label, value, prev, accent }: { label: string; value: number; prev: number; accent: string }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: `1px solid ${accent}33`,
      borderRadius: 12,
      padding: '16px 18px',
      minWidth: 0,
    }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: '1.9rem', fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</span>
        <Delta cur={value} prev={prev} />
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid rgba(0,240,255,0.12)',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
        {hint && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const th: React.CSSProperties = { textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.72rem', padding: '6px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const td: React.CSSProperties = { padding: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)' };
const tdNum: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)', fontWeight: 600 };

export default function AnalyticsClient({ data }: { data: Analytics }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const setPeriod = (p: Period) =>
    startTransition(() => router.push(`/admin/analytics?period=${p}`));

  const k: Kpis = data.kpis;
  const p: Kpis = data.kpisPrev;

  const chartData = data.byDay.map((d) => ({
    day: d.day.slice(5), // MM-DD
    Визиты: d.visits,
    'Лид-магниты': d.leadmagnets,
  }));

  return (
    <div style={{ opacity: pending ? 0.6 : 1, transition: 'opacity 0.15s', maxWidth: 1100 }}>
      {/* Header + period switch */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Аналитика</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{data.totalEvents} событий за период</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-tertiary)', padding: 4, borderRadius: 10 }}>
          {(['today', '7d', '30d'] as Period[]).map((per) => {
            const active = per === data.period;
            return (
              <button
                key={per}
                onClick={() => setPeriod(per)}
                style={{
                  border: 'none', cursor: 'pointer', padding: '7px 14px', borderRadius: 7, fontSize: '0.8rem', fontWeight: 600,
                  background: active ? 'var(--neon-cyan)' : 'transparent',
                  color: active ? '#04121a' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                {PERIOD_LABELS[per]}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 22 }}>
        <KpiCard label="Визиты сайта" value={k.visits} prev={p.visits} accent="var(--neon-cyan)" />
        <KpiCard label="Лид-магниты" value={k.leadmagnets} prev={p.leadmagnets} accent="var(--neon-magenta)" />
        <KpiCard label="В бот" value={k.botStarts} prev={p.botStarts} accent="var(--neon-purple)" />
        <KpiCard label="Заявки DFV" value={k.applications} prev={p.applications} accent="var(--xp-gold)" />
      </div>

      {/* Daily chart */}
      <Section title="По дням" hint="визиты + выданные лид-магниты">
        {chartData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Нет данных за период.</p>
        ) : (
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="Визиты" fill="#00f0ff" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Лид-магниты" fill="#ff00aa" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Section>

      {/* Articles */}
      <Section title="Статьи" hint="просмотры на сайте">
        {data.articles.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Нет просмотров за период.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Статья</th><th style={{ ...th, textAlign: 'right' }}>Просмотры</th><th style={{ ...th, textAlign: 'right' }}>Уники</th></tr></thead>
              <tbody>
                {data.articles.map((a) => (
                  <tr key={a.path}><td style={td}>{titleOf(a.path)}</td><td style={tdNum}>{a.views}</td><td style={tdNum}>{a.uniq}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Lead magnets */}
      <Section title="Лид-магниты" hint="выдано ботом">
        {data.leadmagnets.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Нет выдач за период.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Магнит</th><th style={{ ...th, textAlign: 'right' }}>Выдано</th></tr></thead>
              <tbody>
                {data.leadmagnets.map((m) => (
                  <tr key={m.slug}><td style={td}>{titleOf(m.slug)}</td><td style={tdNum}>{m.delivered}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Podcast + Bot/Quiz side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        <Section title="Подкаст ПАЧЕСНАКУ" hint="заходы на страницу">
          {data.podcastViews === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              Пока 0 — на странице подкаста нет трекера. Поставлю <code style={{ color: 'var(--neon-cyan)' }}>&lt;Tracker/&gt;</code>, и заходы начнут считаться.
            </p>
          ) : (
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--neon-purple)' }}>{data.podcastViews}</div>
          )}
        </Section>

        <Section title="Бот / Квиз">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              ['Старты бота', data.botQuiz.starts],
              ['Квиз начат', data.botQuiz.quizStarts],
              ['Квиз пройден', data.botQuiz.quizDone],
              ['Оплаты', data.botQuiz.payments],
            ].map(([label, val]) => (
              <div key={label as string}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
