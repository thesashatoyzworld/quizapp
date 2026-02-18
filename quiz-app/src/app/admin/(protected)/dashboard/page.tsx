import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const EVENTS_DB_ID = process.env.NOTION_EVENTS_DB_ID!;

interface EventRow {
  type: string;
  timestamp: string;
  user_id: number | null;
  username: string;
  result_id: string;
}

async function getDashboardData() {
  const response = await notion.dataSources.query({
    data_source_id: EVENTS_DB_ID,
    page_size: 100,
  });

  const events: EventRow[] = (response.results as any[])
    .map((p) => ({
      type: p.properties.event_type?.title?.[0]?.plain_text as string,
      timestamp: (p.properties.timestamp?.date?.start as string) || '',
      user_id: p.properties.user_id?.number as number | null,
      username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
      result_id: (p.properties.result_id?.rich_text?.[0]?.plain_text as string) || '',
    }))
    .filter(e => e.type && e.type !== 'admin_config');

  const funnelSteps = ['bot_start', 'webapp_open', 'quiz_complete', 'subscribe_click', 'payment_click', 'payment_success'];
  const uniqueByStep: Record<string, Set<number>> = {};
  funnelSteps.forEach(s => { uniqueByStep[s] = new Set(); });

  const counts: Record<string, number> = {};

  events.forEach(e => {
    counts[e.type] = (counts[e.type] || 0) + 1;
    if (e.user_id && uniqueByStep[e.type]) uniqueByStep[e.type].add(e.user_id);
  });

  const funnel = funnelSteps.map(step => ({ step, count: uniqueByStep[step].size }));
  const maxCount = Math.max(...funnel.map(f => f.count), 1);

  const recent = [...events]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return { funnel, maxCount, counts, recent, total: events.length };
}

const STEP_LABELS: Record<string, string> = {
  bot_start: 'Bot Start',
  webapp_open: 'WebApp Open',
  quiz_complete: 'Quiz Complete',
  subscribe_click: 'Subscribe Click',
  payment_click: 'Payment Click',
  payment_success: 'Payment Success',
};

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export default async function DashboardPage() {
  const { funnel, maxCount, counts, recent, total } = await getDashboardData();

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    border: '1px solid rgba(0, 240, 255, 0.15)',
    borderRadius: '10px',
    padding: '20px 24px',
    flex: '1 1 160px',
    minWidth: '140px',
  };

  const metricCards = [
    { label: 'Bot Starts', value: counts['bot_start'] || 0 },
    { label: 'Quiz Done', value: counts['quiz_complete'] || 0 },
    { label: 'Subscribed', value: counts['subscribe_click'] || 0 },
    { label: 'Pay Clicks', value: counts['payment_click'] || 0 },
    { label: 'Paid', value: counts['payment_success'] || 0, highlight: true },
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {total} events total
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

      {/* Funnel */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '10px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Воронка
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {funnel.map(({ step, count }, i) => {
            const prev = i > 0 ? funnel[i - 1].count : count;
            const conv = prev > 0 ? Math.round((count / prev) * 100) : 100;
            const width = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
            return (
              <div key={step}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{STEP_LABELS[step]}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {count}
                    {i > 0 && <span style={{ marginLeft: '8px', color: conv >= 50 ? 'var(--success)' : 'var(--danger)', fontSize: '0.75rem' }}>{conv}%</span>}
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${width}%`,
                    background: 'var(--neon-cyan)',
                    borderRadius: '3px',
                    transition: 'width 0.3s',
                  }} />
                </div>
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
                {['Время', 'Событие', 'Username', 'Result'].map(h => (
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
