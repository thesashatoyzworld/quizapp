import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLeadCard, kindLabel } from '@/lib/zayavki';
import { chatOfLead, threadOf, readySuggestion } from '@/lib/sales/dialogs';
import SalesThread from '../../dialogi/SalesThread';
import OutcomeButtons from '../../dialogi/OutcomeButtons';
import { outcomeOf, wakeIn } from '@/lib/sales/outcome';
import LeadWork from './LeadWork';

export const dynamic = 'force-dynamic';

function fmt(d: Date | string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

function day(d: Date | string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

const card: React.CSSProperties = {
  background: 'var(--bg-secondary)', border: '1px solid rgba(0,240,255,0.15)',
  borderRadius: 10, padding: 16,
};

const cardTitle: React.CSSProperties = {
  fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.06em', marginBottom: 10,
};

const link: React.CSSProperties = { color: 'var(--neon-cyan)', textDecoration: 'none' };

const CHAT_STATE: Record<string, string> = {
  active: 'диалог живой',
  stopped: 'молчит',
  unsubscribe: 'отписался',
};

const IG_STATUS: Record<string, string> = {
  new: 'новый',
  filled: 'анкета, не писать',
  written: 'написали',
  replied: 'ответил',
  bought: 'купил',
  rejected: 'слился',
};

const INTAKE_STATUS: Record<string, string> = {
  invited: 'приглашён, не начал',
  in_progress: 'заполняет',
  done: 'собрана',
};

export default async function LeadCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const leadId = Number(id);
  if (!Number.isInteger(leadId)) notFound();

  const data = await getLeadCard(leadId);
  if (!data) notFound();

  const { lead, answers, otherForms, funnels, bot, intake, purchases, accesses, waitlists } = data;

  // Личная переписка человека, если она у нас есть. Держим её рядом с анкетой
  // намеренно: отвечать, не видя, что он про себя написал, — как раз то, из-за
  // чего помощник предлагал людям то, что им уже говорили.
  const chatId = await chatOfLead({ id: lead.id, username: lead.username });
  const thread = chatId ? await threadOf(chatId) : [];
  const readyStep = chatId ? await readySuggestion(chatId) : null;
  // Чем кончился разговор. Стоит рядом с перепиской, а не со статусом заявки:
  // статус ведёт саму заявку, а пометка — конкретный диалог в личке.
  const outcomeMark = chatId ? await outcomeOf(chatId) : null;

  return (
    <div style={{ maxWidth: 900 }}>
      <Link href="/admin/zayavki" style={{ ...link, fontSize: '0.82rem' }}>← все заявки</Link>

      <h1 style={{
        fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)',
        fontSize: '1.3rem', margin: '12px 0 2px',
      }}>
        {lead.name}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 18 }}>
        {kindLabel(lead.kind)} · пришла {fmt(lead.createdAt)}
        {lead.source ? ` · источник: ${lead.source}` : ''}
      </p>

      <div style={{ display: 'grid', gap: 14 }}>
        {/* Контакты идут первыми: главное действие по заявке — написать человеку. */}
        <div style={card}>
          <div style={cardTitle}>Связь</div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: '0.9rem' }}>
            {lead.username ? (
              <a href={`https://t.me/${lead.username}`} target="_blank" rel="noopener noreferrer" style={link}>
                телеграм @{lead.username}
              </a>
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>контакт: {lead.contact || '—'}</span>
            )}
            {lead.instagramHandle ? (
              <a href={`https://instagram.com/${lead.instagramHandle}`} target="_blank" rel="noopener noreferrer" style={link}>
                инстаграм @{lead.instagramHandle}
              </a>
            ) : lead.instagram ? (
              <span style={{ color: 'var(--text-secondary)' }}>инстаграм: {lead.instagram}</span>
            ) : null}
            {lead.phone && (
              <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{lead.phone}</span>
            )}
            {lead.username && lead.contact && lead.contact.toLowerCase() !== lead.username.toLowerCase() && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>вписал: {lead.contact}</span>
            )}
          </div>
        </div>

        {chatId && thread.length ? (
          <div style={{ marginBottom: 12 }}>
            <OutcomeButtons
              chatId={chatId}
              outcome={outcomeMark?.outcome ?? null}
              wakeIn={outcomeMark ? wakeIn(outcomeMark.wakeAt) : null}
            />
          </div>
        ) : null}

        {chatId && thread.length ? (
          <SalesThread
            chatId={chatId}
            ready={readyStep}
            compact
            messages={thread.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
          />
        ) : null}

        <LeadWork
          id={lead.id}
          status={lead.status}
          note={lead.note}
          updatedBy={lead.updatedBy}
          updatedAt={lead.updatedAt ? lead.updatedAt.toISOString() : null}
        />

        <div style={card}>
          <div style={cardTitle}>Ответы анкеты</div>
          {answers.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Только имя и контакт — в листе ожидания остальное не спрашивается.
            </div>
          )}
          <div style={{ display: 'grid', gap: 10 }}>
            {answers.map((a) => (
              <div key={a.label}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{a.label}</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{a.value}</div>
              </div>
            ))}
          </div>
        </div>

        {otherForms.length > 0 && (
          <div style={card}>
            <div style={cardTitle}>Приходил ещё</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {otherForms.map((f) => (
                <Link key={f.id} href={`/admin/zayavki/${f.id}`} style={{ ...link, fontSize: '0.85rem' }}>
                  {kindLabel(f.kind)} · {fmt(f.createdAt)}{f.source ? ` · ${f.source}` : ''}
                </Link>
              ))}
            </div>
          </div>
        )}

        {funnels.length > 0 && (
          <div style={card}>
            <div style={cardTitle}>Воронка в инстаграме</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {funnels.map((f, i) => (
                <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {f.keyword ? `«${f.keyword}»` : f.automationName || 'без названия'}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {IG_STATUS[f.status] || f.status}
                    {f.chatStatus ? ` · ${CHAT_STATE[f.chatStatus] || f.chatStatus}` : ''}
                    {f.chatHandler === 'open' ? ' · у оператора' : ''}
                    {' · пришёл '}{day(f.firstSeenAt)}
                    {' · последняя активность '}{day(f.lastEventAt)}
                  </div>
                  {f.note && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>
                      заметка ассистента: {f.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={card}>
          <div style={cardTitle}>В боте и кабинете</div>
          <div style={{ display: 'grid', gap: 8, fontSize: '0.85rem' }}>
            {bot ? (
              <div style={{ color: 'var(--text-secondary)' }}>
                бота запускал {day(bot.startedAt)} · id <code style={{ color: 'var(--text-primary)' }}>{bot.telegramId}</code>
                {bot.firstName ? ` · ${bot.firstName}` : ''}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>
                бота не запускал — по нику в базе не нашёлся
              </div>
            )}

            {intake && (
              <div>
                <Link href={`/admin/anketa/${intake.id}`} style={link}>
                  анкета из бота ({intake.track}) — {INTAKE_STATUS[intake.status] || intake.status}
                  {intake.completedAt ? ` · ${day(intake.completedAt)}` : ''}
                </Link>
              </div>
            )}

            {accesses.length > 0 && (
              <div style={{ color: 'var(--text-secondary)' }}>
                доступы: {accesses.map((a) => (
                  `${a.productSlug} (${a.role}${a.status !== 'active' ? `, ${a.status}` : ''}${
                    a.expiresAt ? `, до ${day(a.expiresAt)}` : ''
                  })`
                )).join(', ')}
              </div>
            )}

            {waitlists.length > 0 && (
              <div style={{ color: 'var(--text-secondary)' }}>
                листы ожидания: {waitlists.map((w) => `${w.label} · ${day(w.createdAt)}`).join(', ')}
              </div>
            )}
          </div>
        </div>

        <div style={card}>
          <div style={cardTitle}>Деньги</div>
          {purchases.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>покупок нет</div>
          ) : (
            <div style={{ display: 'grid', gap: 6 }}>
              {purchases.map((p, i) => (
                <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{p.amount.toLocaleString('ru-RU')} ₽</span>
                  {' · '}{p.name}{' · '}{day(p.createdAt)}
                  {p.source ? ` · ${p.source}` : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
