import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const EVENTS_DB_ID = process.env.NOTION_EVENTS_DB_ID!;
const FOLLOWUP_DB_ID = process.env.NOTION_FOLLOWUP_DB_ID!;
const BOT_TOKEN = process.env.BOT_TOKEN;

async function getEventsUsernameMap(): Promise<Map<number, { username: string; first_name: string }>> {
  const map = new Map<number, { username: string; first_name: string }>();
  let cursor: string | undefined;
  do {
    const response = await notion.dataSources.query({
      data_source_id: EVENTS_DB_ID,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    for (const p of response.results as any[]) {
      const uid = p.properties.user_id?.number as number | null;
      if (!uid) continue;
      const username = (p.properties.username?.rich_text?.[0]?.plain_text as string) || '';
      const first_name = (p.properties.first_name?.rich_text?.[0]?.plain_text as string) || '';
      if (!username && !first_name) continue;
      const existing = map.get(uid);
      if (!existing || (username && !existing.username)) {
        map.set(uid, { username, first_name });
      }
    }
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return map;
};

async function getTelegramUser(userId: number): Promise<{ username: string; first_name: string } | null> {
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${userId}`);
    const data = await r.json();
    if (!data.ok) return null;
    return {
      username: data.result.username || '',
      first_name: data.result.first_name || '',
    };
  } catch {
    return null;
  }
}

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

interface Payment {
  id: string;
  timestamp: string;
  username: string;
  first_name: string;
  user_id: number | null;
  result_id: string;
  amount: number;
  utm_source: string;
}

async function getPayments(): Promise<{ payments: Payment[]; total: number }> {
  const allResults: Payment[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: EVENTS_DB_ID,
      filter: {
        property: 'event_type',
        title: { equals: 'payment_success' },
      },
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const p of response.results as any[]) {
      allResults.push({
        id: p.id as string,
        timestamp: (p.properties.timestamp?.date?.start as string) || '',
        username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
        first_name: (p.properties.first_name?.rich_text?.[0]?.plain_text as string) || '',
        user_id: p.properties.user_id?.number as number | null,
        result_id: (p.properties.result_id?.rich_text?.[0]?.plain_text as string) || '',
        amount: (p.properties.amount?.number as number) ?? 0,
        utm_source: (p.properties.utm_source?.rich_text?.[0]?.plain_text as string) || '',
      });
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  // Deduplicate: one payment per user (keep the one with highest amount, then latest)
  const seen = new Map<string, Payment>();
  for (const p of allResults.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())) {
    const key = p.user_id ? String(p.user_id) : p.id;
    if (!seen.has(key) || (p.amount > (seen.get(key)?.amount ?? 0))) {
      seen.set(key, p);
    }
  }

  const payments = Array.from(seen.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  return { payments, total };
}

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' +
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export default async function PaymentsPage() {
  const [{ payments, total }, usernameMap, eventsUsernameMap] = await Promise.all([
    getPayments(),
    getUsernameMap(),
    getEventsUsernameMap(),
  ]);

  // Enrich: Events DB → FollowUpQueue → Telegram API as fallback
  await Promise.all(payments.map(async (p) => {
    if (!p.user_id) return;
    // 1. Try events DB (payment_click etc. have username)
    const fromEvents = eventsUsernameMap.get(p.user_id);
    if (fromEvents) {
      if (!p.username) p.username = fromEvents.username;
      if (!p.first_name) p.first_name = fromEvents.first_name;
    }
    // 2. Try FollowUpQueue
    const fromQueue = usernameMap.get(p.user_id);
    if (fromQueue) {
      if (!p.username) p.username = fromQueue.username;
      if (!p.first_name) p.first_name = fromQueue.first_name;
    }
    // 3. Still missing — ask Telegram directly
    if (!p.username && !p.first_name) {
      const tg = await getTelegramUser(p.user_id);
      if (tg) {
        p.username = tg.username;
        p.first_name = tg.first_name;
      }
    }
  }));

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Оплаты
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {payments.length} покупок · итого:{' '}
          <span style={{ color: 'var(--success)', fontWeight: 600 }}>
            {total.toLocaleString('ru-RU')} ₽
          </span>
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: '10px',
          padding: '20px 24px',
          minWidth: '180px',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: '6px' }}>
            {total.toLocaleString('ru-RU')} ₽
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Всего оплачено</div>
        </div>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          borderRadius: '10px',
          padding: '20px 24px',
          minWidth: '140px',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: '6px' }}>
            {payments.length}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Покупателей</div>
        </div>
      </div>

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
                {['Дата', 'Username', 'Имя', 'Архетип', 'Сумма', 'Источник'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(p.timestamp)}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--neon-cyan)' }}>
                    {p.username ? `@${p.username}` : `[${p.user_id}]`}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{p.first_name || '—'}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{p.result_id || '—'}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--success)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {p.amount.toLocaleString('ru-RU')} ₽
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{p.utm_source || '—'}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Нет оплат
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
