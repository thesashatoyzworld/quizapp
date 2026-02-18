import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const EVENTS_DB_ID = process.env.NOTION_EVENTS_DB_ID!;

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

interface EventRow {
  type: string;
  user_id: number | null;
  username: string;
  first_name: string;
  timestamp: string;
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
      if (!type) continue;
      all.push({
        type,
        user_id: p.properties.user_id?.number as number | null,
        username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
        first_name: (p.properties.first_name?.rich_text?.[0]?.plain_text as string) || '',
        timestamp: (p.properties.timestamp?.date?.start as string) || '',
      });
    }
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return all;
}

interface QueueEntry {
  userId: number;
  username: string;
  firstName: string;
  priority: number;
  label: string;
  labelColor: string;
  reason: string;
  dm_sent: boolean;
  dm_replied: boolean;
  dm_sent_at: string;
  lastEventAt: string;
}

function buildQueue(events: EventRow[]): QueueEntry[] {
  type UserData = {
    types: Set<string>;
    username: string;
    firstName: string;
    lastAt: string;
    dm_sent: boolean;
    dm_replied: boolean;
    dm_sent_at: string;
  };

  const users = new Map<string, UserData>();

  for (const e of events) {
    if (!e.user_id) continue;
    const key = String(e.user_id);

    if (!users.has(key)) {
      users.set(key, {
        types: new Set(),
        username: '',
        firstName: '',
        lastAt: '',
        dm_sent: false,
        dm_replied: false,
        dm_sent_at: '',
      });
    }

    const u = users.get(key)!;
    u.types.add(e.type);

    if (e.username) u.username = e.username;
    if (e.first_name) u.firstName = e.first_name;
    if (!e.type.startsWith('admin_') && e.timestamp > u.lastAt) u.lastAt = e.timestamp;

    if (e.type === 'admin_dm_sent') { u.dm_sent = true; u.dm_sent_at = e.timestamp; }
    if (e.type === 'admin_dm_replied') u.dm_replied = true;
  }

  const result: QueueEntry[] = [];

  for (const [key, u] of users) {
    const userId = parseInt(key);
    const t = u.types;

    // Skip already paid
    if (t.has('payment_success') || t.has('connectors_payment')) continue;

    let priority = 99;
    let label = '';
    let labelColor = '';
    let reason = '';

    if (t.has('payment_click')) {
      if (u.dm_replied) {
        priority = 1; label = 'Горячий'; labelColor = '#ff2a6d';
        reason = 'Нажал оплатить · ответил на ДМ — готов к покупке';
      } else if (u.dm_sent) {
        priority = 2; label = 'Горячий'; labelColor = '#ff2a6d';
        reason = 'Нажал оплатить · ждём ответа на ДМ';
      } else {
        priority = 3; label = 'Горячий'; labelColor = '#ff2a6d';
        reason = 'Нажал оплатить · ещё не написали';
      }
    } else if (t.has('result_view') || t.has('subscribe_click')) {
      if (u.dm_replied) {
        priority = 4; label = 'Тёплый'; labelColor = 'rgba(255,180,0,0.9)';
        reason = 'Видел результат · ответил на ДМ';
      } else if (u.dm_sent) {
        priority = 5; label = 'Тёплый'; labelColor = 'rgba(255,180,0,0.9)';
        reason = 'Видел результат · ждём ответа';
      } else {
        priority = 6; label = 'Тёплый'; labelColor = 'rgba(255,180,0,0.9)';
        reason = 'Видел результат · не написали';
      }
    } else if (t.has('quiz_complete')) {
      if (u.dm_replied) {
        priority = 7; label = 'Средний'; labelColor = 'var(--neon-cyan)';
        reason = 'Завершил квиз · ответил на ДМ';
      } else if (u.dm_sent) {
        priority = 8; label = 'Средний'; labelColor = 'var(--neon-cyan)';
        reason = 'Завершил квиз · ждём ответа';
      } else {
        priority = 9; label = 'Средний'; labelColor = 'var(--neon-cyan)';
        reason = 'Завершил квиз · не написали';
      }
    } else {
      continue; // too early in funnel
    }

    result.push({
      userId,
      username: u.username,
      firstName: u.firstName,
      priority,
      label,
      labelColor,
      reason,
      dm_sent: u.dm_sent,
      dm_replied: u.dm_replied,
      dm_sent_at: u.dm_sent_at,
      lastEventAt: u.lastAt,
    });
  }

  return result.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return new Date(b.lastEventAt).getTime() - new Date(a.lastEventAt).getTime();
  });
}

export default async function QueuePage() {
  const events = await getAllEvents();
  const queue = buildQueue(events);

  const hot = queue.filter(u => u.priority <= 3);
  const warm = queue.filter(u => u.priority >= 4 && u.priority <= 6);
  const mid = queue.filter(u => u.priority >= 7);

  const notContacted = queue.filter(u => !u.dm_sent).length;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Очередь
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {queue.length} человек в работе · не написали {notContacted}
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {[
          { label: 'Горячие', count: hot.length, color: '#ff2a6d', border: 'rgba(255,42,109,0.3)' },
          { label: 'Тёплые', count: warm.length, color: 'rgba(255,180,0,0.9)', border: 'rgba(255,180,0,0.25)' },
          { label: 'Средние', count: mid.length, color: 'var(--neon-cyan)', border: 'rgba(0,240,255,0.15)' },
          { label: 'Не написали', count: notContacted, color: 'var(--text-secondary)', border: 'rgba(255,255,255,0.1)' },
        ].map(c => (
          <div key={c.label} style={{
            background: 'var(--bg-secondary)',
            border: `1px solid ${c.border}`,
            borderRadius: '10px',
            padding: '16px 20px',
            minWidth: '120px',
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: c.color, fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: '4px' }}>
              {c.count}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Queue table */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
                {['#', 'Username', 'Имя', 'Статус', 'Что сделать', 'ДМ', 'Последняя активность'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Очередь пуста — все оплатили или ещё не прошли квиз
                  </td>
                </tr>
              )}
              {queue.map((u, i) => (
                <tr key={u.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{i + 1}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--neon-cyan)', whiteSpace: 'nowrap' }}>
                    {u.username ? `@${u.username}` : `[${u.userId}]`}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{u.firstName || '—'}</td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      color: u.labelColor,
                      border: `1px solid ${u.labelColor}44`,
                      borderRadius: '4px',
                      padding: '2px 7px',
                    }}>
                      {u.label}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{u.reason}</td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    {u.dm_replied ? (
                      <span style={{ color: 'var(--success)', fontSize: '0.75rem' }}>✓ Ответил</span>
                    ) : u.dm_sent ? (
                      <span style={{ color: 'rgba(255,180,0,0.8)', fontSize: '0.75rem' }}>Отправили {formatDate(u.dm_sent_at)}</span>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>Не писали</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {formatDate(u.lastEventAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
