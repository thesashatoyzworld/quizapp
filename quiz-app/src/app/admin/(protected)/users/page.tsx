import { Client } from '@notionhq/client';
import Link from 'next/link';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const FOLLOWUP_DS_ID = process.env.NOTION_FOLLOWUP_DB_ID!;

const RESULT_LABELS: Record<string, string> = {
  invisible: 'Невидимка',
  doer: 'Деятель',
  generous: 'Щедрый',
  unstable: 'Нестабильный',
  scale: 'Масштаб',
};

interface User {
  id: string;
  user_id: number | null;
  username: string;
  first_name: string;
  result_id: string;
  registered_at: string;
  messages_sent: number;
  paid: boolean;
}

async function getUsers(): Promise<User[]> {
  const response = await notion.dataSources.query({
    data_source_id: FOLLOWUP_DS_ID,
    page_size: 100,
  });

  return (response.results as any[])
    .map((p) => ({
      id: p.id as string,
      user_id: p.properties.user_id?.number as number | null,
      username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
      first_name: (p.properties.first_name?.rich_text?.[0]?.plain_text as string) || '',
      result_id: (p.properties.result_id?.select?.name as string) || '',
      registered_at: (p.properties.registered_at?.date?.start as string) || '',
      messages_sent: (p.properties.messages_sent?.number as number) ?? 0,
      paid: (p.properties.paid?.checkbox as boolean) ?? false,
    }))
    .sort((a, b) => new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime());
}

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

interface PageProps {
  searchParams: Promise<{ filter?: string; result_id?: string }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = params.filter || 'all';
  const resultFilter = params.result_id;

  let users = await getUsers();

  if (filter === 'paid') users = users.filter(u => u.paid);
  if (filter === 'archetype' && resultFilter) users = users.filter(u => u.result_id === resultFilter);

  const paid = users.filter(u => u.paid).length;
  const total = users.length;

  const filterLinkStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    textDecoration: 'none',
    border: '1px solid',
    borderColor: active ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.1)',
    color: active ? 'var(--neon-cyan)' : 'var(--text-muted)',
    background: active ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Users</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {total} users · {paid} paid
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <Link href="/admin/users" style={filterLinkStyle(filter === 'all')}>All</Link>
        <Link href="/admin/users?filter=paid" style={filterLinkStyle(filter === 'paid')}>Paid</Link>
        {Object.entries(RESULT_LABELS).map(([id, label]) => (
          <Link
            key={id}
            href={`/admin/users?filter=archetype&result_id=${id}`}
            style={filterLinkStyle(filter === 'archetype' && resultFilter === id)}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Table */}
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
                {['Username', 'Name', 'Archetype', 'Registered', 'Msgs', 'Paid'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 16px', color: 'var(--neon-cyan)' }}>
                    {u.username ? `@${u.username}` : `[${u.user_id}]`}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                    {u.first_name || '—'}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                    {RESULT_LABELS[u.result_id] || u.result_id || '—'}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {formatDate(u.registered_at)}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {u.messages_sent}
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    {u.paid
                      ? <span style={{ color: 'var(--success)', fontSize: '1rem' }}>✓</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>
                    }
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Нет пользователей
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
