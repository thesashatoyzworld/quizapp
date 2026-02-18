import { Client } from '@notionhq/client';
import Link from 'next/link';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const EVENTS_DB_ID = process.env.NOTION_EVENTS_DB_ID!;

interface EventRow {
  type: string;
  timestamp: string;
  user_id: number | null;
  username: string;
  result_id: string;
}

async function getAllEvents(): Promise<EventRow[]> {
  const allResults: EventRow[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: EVENTS_DB_ID,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const p of response.results as any[]) {
      const type = p.properties.event_type?.title?.[0]?.plain_text as string;
      if (!type || type === 'admin_config') continue;
      allResults.push({
        type,
        timestamp: (p.properties.timestamp?.date?.start as string) || '',
        user_id: p.properties.user_id?.number as number | null,
        username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
        result_id: (p.properties.result_id?.rich_text?.[0]?.plain_text as string) || '',
      });
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return allResults;
}

const FUNNEL_STEPS = [
  { key: 'bot_start', label: 'Запуск бота' },
  { key: 'webapp_open', label: 'Открыл приложение' },
  { key: 'quiz_start', label: 'Начал квиз' },
  { key: 'quiz_complete', label: 'Завершил квиз' },
  { key: 'subscribe_click', label: 'Подписался' },
  { key: 'result_view', label: 'Просмотрел результат' },
  { key: 'payment_click', label: 'Нажал оплатить' },
  { key: 'payment_success', label: 'Оплатил' },
];

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export default async function DashboardPage() {
  const events = await getAllEvents();

  const uniqueByStep: Record<string, Set<number>> = {};
  FUNNEL_STEPS.forEach(s => { uniqueByStep[s.key] = new Set(); });
  const counts: Record<string, number> = {};

  events.forEach(e => {
    counts[e.type] = (counts[e.type] || 0) + 1;
    if (e.user_id && uniqueByStep[e.type]) uniqueByStep[e.type].add(e.user_id);
  });

  const funnel = FUNNEL_STEPS.map(s => ({ ...s, count: uniqueByStep[s.key].size }));

  const recent = [...events]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const metricCards = [
    { label: 'Запусков бота', value: funnel[0].count },
    { label: 'Квиз пройден', value: funnel[3].count },
    { label: 'Подписались', value: funnel[4].count },
    { label: 'Кликнули оплатить', value: funnel[6].count },
    { label: 'Оплатили', value: funnel[7].count, highlight: true },
  ];

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    border: '1px solid rgba(0, 240, 255, 0.15)',
    borderRadius: '10px',
    padding: '20px 24px',
    flex: '1 1 160px',
    minWidth: '140px',
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Дашборд
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {events.length} событий всего
        </p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {metricCards.map(({ label, value, highlight }) => (
          <div key={label} style={{
            ...cardStyle,
            borderColor: highlight ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 240, 255, 0.15)',
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: highlight ? 'var(--success)' : 'var(--neon-cyan)',
              fontFamily: 'var(--font-display)',
              lineHeight: 1,
              marginBottom: '6px',
            }}>
              {value}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Funnel block diagram */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '10px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Воронка
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
          {funnel.map((step, i) => {
            const prev = i > 0 ? funnel[i - 1].count : step.count;
            const conv = prev > 0 ? Math.round((step.count / prev) * 100) : 100;
            const isLast = i === funnel.length - 1;

            return (
              <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Block — clickable */}
                <Link
                  href={`/admin/funnel?step=${step.key}`}
                  style={{
                    width: '100%',
                    maxWidth: '480px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: step.key === 'payment_success'
                      ? 'rgba(0, 255, 136, 0.08)'
                      : 'rgba(0, 240, 255, 0.05)',
                    border: `1px solid ${step.key === 'payment_success' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 240, 255, 0.2)'}`,
                    borderRadius: '8px',
                    padding: '12px 20px',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {step.label}
                  </span>
                  <span style={{
                    color: step.key === 'payment_success' ? 'var(--success)' : 'var(--neon-cyan)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                  }}>
                    {step.count}
                  </span>
                </Link>

                {/* Arrow + conversion */}
                {!isLast && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '4px 0',
                    gap: '0',
                  }}>
                    <div style={{ width: '1px', height: '8px', background: 'rgba(255,255,255,0.15)' }} />
                    <div style={{
                      fontSize: '0.7rem',
                      color: conv >= 70 ? 'var(--success)' : conv >= 40 ? 'var(--neon-cyan)' : 'rgba(255,42,109,0.8)',
                      padding: '2px 8px',
                    }}>
                      {i > 0 ? `${conv}%` : ''}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', lineHeight: 1 }}>▼</div>
                    <div style={{ width: '1px', height: '4px', background: 'rgba(255,255,255,0.15)' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent events */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '10px',
        padding: '24px',
      }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Последние события
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Время', 'Событие', 'Username', 'Архетип'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(e.timestamp)}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)', fontSize: '0.7rem' }}>{e.type}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{e.username ? `@${e.username}` : '—'}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{e.result_id || '—'}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Нет данных</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
