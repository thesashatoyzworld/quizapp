import { Client } from '@notionhq/client';
import FunnelChart from './FunnelChart';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const EVENTS_DB_ID = process.env.NOTION_EVENTS_DB_ID!;
const FOLLOWUP_DB_ID = process.env.NOTION_FOLLOWUP_DB_ID!;

interface EventRow {
  type: string;
  timestamp: string;
  user_id: number | null;
  username: string;
  first_name: string;
  result_id: string;
}

async function getAllEvents(): Promise<EventRow[]> {
  const all: EventRow[] = [];
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
      all.push({
        type,
        timestamp: (p.properties.timestamp?.date?.start as string) || '',
        user_id: p.properties.user_id?.number as number | null,
        username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
        first_name: (p.properties.first_name?.rich_text?.[0]?.plain_text as string) || '',
        result_id: (p.properties.result_id?.rich_text?.[0]?.plain_text as string) || '',
      });
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return all;
}

// Load username map from FollowUpQueue (uid → {username, first_name})
async function getUsernameMap(): Promise<Map<number, { username: string; first_name: string }>> {
  const map = new Map<number, { username: string; first_name: string }>();
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DB_ID,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const p of response.results as any[]) {
      const uid = p.properties.user_id?.number as number | null;
      if (!uid) continue;
      map.set(uid, {
        username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
        first_name: (p.properties.first_name?.rich_text?.[0]?.plain_text as string) || '',
      });
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return map;
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
  const [events, usernameMap] = await Promise.all([getAllEvents(), getUsernameMap()]);

  // Enrich events with username from FollowUpQueue if missing
  for (const e of events) {
    if (e.user_id && (!e.username || !e.first_name)) {
      const found = usernameMap.get(e.user_id);
      if (found) {
        if (!e.username) e.username = found.username;
        if (!e.first_name) e.first_name = found.first_name;
      }
    }
  }

  // Build funnel: unique users per step, deduplicated
  const stepUsersMap: Record<string, Map<string, EventRow>> = {};
  FUNNEL_STEPS.forEach(s => { stepUsersMap[s.key] = new Map(); });

  const counts: Record<string, number> = {};

  for (const e of events) {
    counts[e.type] = (counts[e.type] || 0) + 1;
    if (stepUsersMap[e.type]) {
      const key = e.user_id ? String(e.user_id) : `anon_${e.timestamp}`;
      const existing = stepUsersMap[e.type].get(key);
      // Keep latest event per user per step
      if (!existing || new Date(e.timestamp) > new Date(existing.timestamp)) {
        stepUsersMap[e.type].set(key, e);
      }
    }
  }

  const funnelSteps = FUNNEL_STEPS.map(s => ({
    key: s.key,
    label: s.label,
    count: stepUsersMap[s.key].size,
    users: Array.from(stepUsersMap[s.key].values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map(u => ({
        user_id: u.user_id,
        username: u.username,
        first_name: u.first_name,
        result_id: u.result_id,
        timestamp: u.timestamp,
      })),
  }));

  const recent = [...events]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const metricCards = [
    { label: 'Запусков бота', value: funnelSteps[0].count },
    { label: 'Квиз пройден', value: funnelSteps[3].count },
    { label: 'Подписались', value: funnelSteps[4].count },
    { label: 'Кликнули оплатить', value: funnelSteps[6].count },
    { label: 'Оплатили', value: funnelSteps[7].count, highlight: true },
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

      {/* Funnel with toggles */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '10px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Воронка — нажми на этап чтобы увидеть людей
        </h2>
        <FunnelChart steps={funnelSteps} />
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
