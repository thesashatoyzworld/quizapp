import { Client } from '@notionhq/client';
import Link from 'next/link';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const EVENTS_DB_ID = process.env.NOTION_EVENTS_DB_ID!;

const STEP_LABELS: Record<string, string> = {
  bot_start: 'Запуск бота',
  webapp_open: 'Открыл приложение',
  quiz_start: 'Начал квиз',
  quiz_complete: 'Завершил квиз',
  subscribe_click: 'Подписался',
  result_view: 'Просмотрел результат',
  payment_click: 'Нажал оплатить',
  payment_success: 'Оплатил',
};

interface UserAtStep {
  user_id: number | null;
  username: string;
  first_name: string;
  result_id: string;
  timestamp: string;
}

async function getUsersAtStep(step: string): Promise<UserAtStep[]> {
  const all: UserAtStep[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: EVENTS_DB_ID,
      filter: {
        property: 'event_type',
        title: { equals: step },
      },
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const p of response.results as any[]) {
      all.push({
        user_id: p.properties.user_id?.number as number | null,
        username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
        first_name: (p.properties.first_name?.rich_text?.[0]?.plain_text as string) || '',
        result_id: (p.properties.result_id?.rich_text?.[0]?.plain_text as string) || '',
        timestamp: (p.properties.timestamp?.date?.start as string) || '',
      });
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  // Deduplicate by user_id, keep latest event
  const seen = new Map<string, UserAtStep>();
  for (const u of all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())) {
    const key = u.user_id ? String(u.user_id) : `anon_${u.timestamp}`;
    if (!seen.has(key)) seen.set(key, u);
  }

  return Array.from(seen.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

interface PageProps {
  searchParams: Promise<{ step?: string }>;
}

export default async function FunnelStepPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const step = params.step || 'bot_start';
  const label = STEP_LABELS[step] || step;

  const users = await getUsersAtStep(step);

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link
          href="/admin/dashboard"
          style={{
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← Воронка
        </Link>
        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
            {label}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {users.length} уникальных пользователей
          </p>
        </div>
      </div>

      {/* Step selector */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {Object.entries(STEP_LABELS).map(([key, lbl]) => (
          <Link
            key={key}
            href={`/admin/funnel?step=${key}`}
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              textDecoration: 'none',
              border: '1px solid',
              borderColor: key === step ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.1)',
              color: key === step ? 'var(--neon-cyan)' : 'var(--text-muted)',
              background: key === step ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
              whiteSpace: 'nowrap',
            }}
          >
            {lbl}
          </Link>
        ))}
      </div>

      {/* Users table */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '10px',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
                {['Username', 'Имя', 'Архетип', 'Время'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 16px', color: 'var(--neon-cyan)' }}>
                    {u.username ? `@${u.username}` : u.user_id ? `[${u.user_id}]` : '—'}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                    {u.first_name || '—'}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>
                    {u.result_id || '—'}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {formatDate(u.timestamp)}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Нет данных
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
