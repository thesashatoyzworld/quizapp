import Link from 'next/link';
import { waiting, waited, heat, readyChats } from '@/lib/sales/dialogs';
import PrepareAll from './PrepareAll';

// Очередь личных переписок: кто остался без ответа и сколько ждёт.
//
// Раньше это была лента подсказок в телеграме, куда сыпались все разговоры
// вперемешку. Здесь каждый человек — строка, и открывается отдельно.

export const dynamic = 'force-dynamic';

const COLOR = {
  hot: '#ff6b6b',
  warm: '#ffb547',
  fresh: 'var(--neon-cyan)',
} as const;

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontSize: '0.72rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  verticalAlign: 'top',
};

export default async function DialogiPage() {
  const rows = await waiting();
  const hot = rows.filter((r) => heat(r) === 'hot').length;
  const ready = await readyChats(rows.map((r) => r.chatId));

  return (
    <div style={{ padding: '24px 28px' }}>
      <h1 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Диалоги</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
        {rows.length
          ? `${rows.length} ждут ответа${hot ? `, из них ${hot} дольше четырёх часов` : ''}`
          : 'все отвечены'}
      </p>

      <PrepareAll waiting={rows.length} ready={ready.size} />

      {rows.length ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr>
                <th style={th}>Ждёт</th>
                <th style={th}>Кто</th>
                <th style={th}>Доход</th>
                <th style={th}>Последнее сообщение</th>
                <th style={th} />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.chatId}>
                  <td style={{ ...td, color: COLOR[heat(r)], whiteSpace: 'nowrap' }}>
                    {waited(r.waitingSeconds)}
                    {r.unanswered > 1 ? (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {r.unanswered} сообщения подряд
                      </div>
                    ) : null}
                  </td>
                  <td style={td}>
                    <div>{r.name || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {r.username ? `@${r.username}` : 'без ника'}
                      {r.leadId ? ` · анкета №${r.leadId}` : ' · анкеты нет'}
                    </div>
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.income || '—'}</td>
                  <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {r.lastText.replace(/\n/g, ' ').slice(0, 120)}
                    {r.lastText.length > 120 ? '…' : ''}
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    {ready.has(r.chatId) ? (
                      <div style={{ fontSize: '0.72rem', color: 'var(--neon-cyan)', marginBottom: 4 }}>
                        ответ готов
                      </div>
                    ) : null}
                    <Link
                      href={r.leadId ? `/admin/zayavki/${r.leadId}` : `/admin/dialogi/${r.chatId}`}
                      style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}
                    >
                      открыть →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
