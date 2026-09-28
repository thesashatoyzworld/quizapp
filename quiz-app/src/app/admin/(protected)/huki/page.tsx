import Link from 'next/link';
import { getHukiStats, type HukiPeriod } from '@/lib/huki-stats';

export const dynamic = 'force-dynamic';

const PERIODS: { key: HukiPeriod; label: string }[] = [
  { key: 'today', label: 'Сегодня' },
  { key: '7d', label: '7 дней' },
  { key: '30d', label: '30 дней' },
  { key: 'all', label: 'Всё время' },
];

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : '—');
const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,240,255,0.12)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
        {hint && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// Шаг воронки: число, доля от предыдущего шага и пояснение, что считаем.
function Steps({ rows }: { rows: { label: string; value: string | number; conv?: string; note?: string }[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <td style={td}>
              {r.label}
              {r.note && <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 2 }}>{r.note}</div>}
            </td>
            <td style={tdNum}>{r.value}</td>
            <td style={{ ...td, textAlign: 'right', width: 70, color: 'var(--text-muted)' }}>{r.conv ?? ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const th: React.CSSProperties = { textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.72rem', padding: '6px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const td: React.CSSProperties = { padding: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' };
const tdNum: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)', fontWeight: 600 };

export default async function HukiStatsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const sp = await searchParams;
  const period = (PERIODS.find((p) => p.key === sp.period)?.key ?? '7d') as HukiPeriod;
  const s = await getHukiStats(period);
  const newSubs = s.bot.subscribed;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Хуки: подписки и «Поток Спроса»</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {PERIODS.map((p) => (
            <Link key={p.key} href={`/admin/huki?period=${p.key}`} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', textDecoration: 'none',
              border: '1px solid rgba(0,240,255,0.25)',
              background: p.key === period ? 'rgba(0,240,255,0.15)' : 'transparent',
              color: p.key === period ? 'var(--text-primary)' : 'var(--text-muted)',
            }}>{p.label}</Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Зашли на /huki', value: s.page.visitors },
          { label: 'Новых подписчиков', value: newSubs },
          { label: 'Кликнули «Поток»', value: s.potok.ctaClicks },
          { label: 'Оплат «Потока»', value: s.potok.purchases },
          { label: 'В канале сейчас', value: s.channelMembers ?? '—' },
        ].map((k) => (
          <div key={k.label} style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {typeof k.value === 'number' ? k.value.toLocaleString('ru-RU') : k.value}
            </div>
          </div>
        ))}
      </div>

      <Section title="Подписка на канал" hint="люди = уникальные сессии на странице, в боте = уникальные аккаунты">
        <Steps rows={[
          { label: 'Зашли на страницу', value: s.page.visitors, note: `в браузере ${s.page.browser} · в Телеграме ${s.page.miniapp}` },
          { label: 'Увидели окно подписки', value: s.page.gateSeen, conv: pct(s.page.gateSeen, s.page.visitors), note: 'база была закрыта' },
          { label: 'Нажали «Открыть через Telegram»', value: s.page.openBot, conv: pct(s.page.openBot, s.page.gateSeen) },
          { label: 'Пришли в бота неподписанными', value: s.bot.gated, conv: pct(s.bot.gated, s.page.openBot) },
          { label: 'Подписались на канал', value: s.bot.subscribed, conv: pct(s.bot.subscribed, s.bot.gated), note: 'нажали «я подписался», бот увидел подписку' },
          { label: 'Бот выдал базу', value: s.bot.delivered, note: 'включая тех, кто уже был подписан' },
          { label: 'База открылась на странице', value: s.page.unlocked, note: `из них после окна подписки: ${s.page.unlockedAfterGate}` },
        ]} />
      </Section>

      <Section title="«Поток Спроса» с этой страницы" hint="оплаты сводятся с чекаутом по номеру заказа">
        <Steps rows={[
          { label: 'Кликнули «Поток Спроса»', value: s.potok.ctaClicks, conv: pct(s.potok.ctaClicks, s.page.visitors), note: `окно сверху ${s.potok.ctaMain} · карточка в ленте ${s.potok.ctaFeed}` },
          { label: 'Дошли до лендинга', value: s.potok.landingVisits, conv: pct(s.potok.landingVisits, s.potok.ctaClicks) },
          { label: 'Открыли оплату', value: s.potok.checkouts, conv: pct(s.potok.checkouts, s.potok.landingVisits) },
          { label: 'Оплатили', value: s.potok.purchases, conv: pct(s.potok.purchases, s.potok.checkouts), note: s.potok.revenue ? rub(s.potok.revenue) : undefined },
        ]} />
      </Section>

      <Section title="По дням">
        {s.byDay.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>За период событий нет.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>День</th>
                <th style={{ ...th, textAlign: 'right' }}>Зашли</th>
                <th style={{ ...th, textAlign: 'right' }}>Окно подписки</th>
                <th style={{ ...th, textAlign: 'right' }}>Подписались</th>
                <th style={{ ...th, textAlign: 'right' }}>Клик «Поток»</th>
              </tr>
            </thead>
            <tbody>
              {s.byDay.map((d) => (
                <tr key={d.day}>
                  <td style={td}>{d.day}</td>
                  <td style={tdNum}>{d.visitors}</td>
                  <td style={tdNum}>{d.gateSeen}</td>
                  <td style={tdNum}>{d.subscribed}</td>
                  <td style={tdNum}>{d.ctaClicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  );
}
