import Link from 'next/link';
import { waiting, waited, heat, readySuggestion } from '@/lib/sales/dialogs';
import { priority } from '@/lib/sales/priority';
import { awaitingPayment, paidChats } from '@/lib/sales/payment';
import { paidLately, parked, wakeIn } from '@/lib/sales/outcome';
import PrepareAll from './PrepareAll';
import SendAll from './SendAll';
import OutcomeButtons from './OutcomeButtons';

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

const parkedHead: React.CSSProperties = {
  fontSize: '0.72rem',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--text-muted)',
  marginBottom: 8,
};

const parkedRow: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'baseline',
  padding: '4px 0',
  flexWrap: 'wrap',
};

/** Сколько ушедших показываем: список копится месяцами, а нужен он изредка. */
const LOST_SHOWN = 15;

function who(p: { name: string | null; username: string | null; chatId: string }): string {
  return p.name || (p.username ? `@${p.username}` : p.chatId);
}

function personHref(p: { leadId: number | null; chatId: string }): string {
  return p.leadId ? `/admin/zayavki/${p.leadId}` : `/admin/dialogi/${p.chatId}`;
}

const td: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  verticalAlign: 'top',
};

export default async function DialogiPage() {
  // Отложенных `waiting` уже не отдаёт: отсечение стоит в самом запросе,
  // иначе помеченный «слился» попал бы и в сборку ответов, и в рассылку.
  const rows = await waiting();

  const [away, paidCount, paid] = await Promise.all([
    parked(),
    paidLately(30),
    paidChats(rows.map((r) => r.chatId)),
  ]);
  const think = away.filter((t) => t.outcome === 'thinking');
  const lost = away.filter((t) => t.outcome === 'lost');

  const hot = rows.filter((r) => heat(r) === 'hot').length;

  // Кто уходит пачкой, а кого Саша разбирает сам — считаем здесь же, чтобы
  // в списке было видно до всякой рассылки.
  const steps = new Map(
    await Promise.all(rows.map(async (r) => [r.chatId, await readySuggestion(r.chatId)] as const)),
  );
  const ready = new Set([...steps].filter(([, v]) => v).map(([k]) => k));
  const mine = new Map(rows.map((r) => [r.chatId, priority(r, steps.get(r.chatId) ?? null)]));

  // Кому отправили ссылку и кто до сих пор не оплатил: самая дорогая точка,
  // её видно отдельным значком.
  const pay = new Map(
    await Promise.all(rows.map(async (r) => [r.chatId, await awaitingPayment(r.chatId)] as const)),
  );
  const mineCount = [...mine.values()].filter((p) => p.manual).length;

  return (
    <div style={{ padding: '24px 28px' }}>
      <h1 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Диалоги</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 6 }}>
        {rows.length
          ? `${rows.length} ждут ответа${hot ? `, из них ${hot} дольше четырёх часов` : ''}` +
            `${mineCount ? ` · ★ ${mineCount} на тебе` : ''}`
          : 'все отвечены'}
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 20 }}>
        оплатили за 30 дней: {paidCount}
        {away.length ? ` · отложено: ${think.length} думают, ${lost.length} слились` : ''}
      </p>

      {away.length ? (
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 20,
            fontSize: '0.85rem',
          }}
        >
          {think.length ? (
            <>
              <div style={parkedHead}>думают</div>
              {think.map((t) => (
                <div key={t.chatId} style={parkedRow}>
                  <Link href={personHref(t)} style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>
                    {who(t)}
                  </Link>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    вернуться {wakeIn(t.wakeAt)}
                  </span>
                  <OutcomeButtons chatId={t.chatId} outcome="thinking" wakeIn={wakeIn(t.wakeAt)} />
                </div>
              ))}
            </>
          ) : null}

          {lost.length ? (
            <>
              <div style={{ ...parkedHead, marginTop: think.length ? 14 : 0 }}>
                слились{lost.length > LOST_SHOWN ? ` · ${lost.length}, показаны свежие` : ''}
              </div>
              {lost.slice(0, LOST_SHOWN).map((t) => (
                <div key={t.chatId} style={parkedRow}>
                  <Link href={personHref(t)} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    {who(t)}
                  </Link>
                  <OutcomeButtons chatId={t.chatId} outcome="lost" />
                </div>
              ))}
            </>
          ) : null}
        </div>
      ) : null}

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
                    <div>
                      {mine.get(r.chatId)?.manual ? (
                        <span
                          title={mine.get(r.chatId)?.reason || ''}
                          style={{ color: '#ffb547', marginRight: 6 }}
                        >
                          ★
                        </span>
                      ) : null}
                      {r.name || '—'}
                      {paid.has(r.chatId) ? (
                        <span
                          title="доступ выдан, человек уже оплатил"
                          style={{ color: '#4ade80', marginLeft: 6, fontSize: '0.8rem' }}
                        >
                          ✅ клиент
                        </span>
                      ) : null}
                      {pay.get(r.chatId) ? (
                        <span
                          title={`ссылка на оплату отправлена ${pay.get(r.chatId)!.hours} ч назад, оплаты нет`}
                          style={{ color: '#ffb547', marginLeft: 6, fontSize: '0.8rem' }}
                        >
                          💳 {pay.get(r.chatId)!.hours} ч
                        </span>
                      ) : null}
                    </div>
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
                    <div style={{ marginTop: 6 }}>
                      <OutcomeButtons chatId={r.chatId} outcome={null} />
                    </div>
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
