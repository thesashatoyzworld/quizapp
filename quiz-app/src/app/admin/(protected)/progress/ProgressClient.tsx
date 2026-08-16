'use client';

import { Fragment, useMemo, useState } from 'react';
import type { Student } from '@/lib/progress';

// Раздел «Обучение»: кто из купивших что открывал, читал и досматривал.
// Строка = человек, раскрытие = его курс по урокам плюс всё остальное,
// куда он заходил.

const SECTION_RU: Record<string, string> = {
  kurs: 'курс',
  razbory: 'разборы',
  sozvony: 'созвоны',
  lichnoe: 'личное',
  prompty: 'промпты',
  potok: 'поток спроса',
  formula: 'формула',
  workshops: 'воркшопы',
};

function fmt(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

/** «сегодня» / «3 дня назад» — чтобы видеть, кто отвалился, не считая в уме. */
function ago(days: number | null): string {
  if (days === null) return 'ни разу';
  if (days <= 0) return 'сегодня';
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} дн. назад`;
  if (days < 30) return `${Math.floor(days / 7)} нед. назад`;
  return `${Math.floor(days / 30)} мес. назад`;
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ width: 54, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: '100%', background: color }} />
    </div>
  );
}

export default function ProgressClient({ students }: { students: Student[] }) {
  const [tier, setTier] = useState<'all' | 3 | 2 | 1>('all');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const counts = useMemo(() => ({
    all: students.length,
    3: students.filter((s) => s.tier === 3).length,
    2: students.filter((s) => s.tier === 2).length,
    1: students.filter((s) => s.tier === 1).length,
  }), [students]);

  const shown = tier === 'all' ? students : students.filter((s) => s.tier === tier);

  const silent = shown.filter((s) => s.daysSince === null).length;
  const week = shown.filter((s) => s.daysSince !== null && s.daysSince < 7).length;

  const th: React.CSSProperties = {
    textAlign: 'left', padding: '10px 12px', fontSize: '0.7rem', letterSpacing: '0.06em',
    textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid rgba(0,240,255,0.15)',
    position: 'sticky', top: 0, background: 'var(--bg-secondary)', whiteSpace: 'nowrap',
  };
  const td: React.CSSProperties = {
    padding: '9px 12px', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle',
  };

  return (
    <div style={{ maxWidth: 1180 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontSize: '1.1rem', letterSpacing: '0.1em', marginBottom: 4 }}>
        ОБУЧЕНИЕ · КТО КАК ИДЁТ
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 16 }}>
        Все с активным доступом «Нового уровня контента». Прочитано — статья урока домотана до конца,
        досмотрено — запись урока пройдена больше половины. Жми на строку: раскроется курс по урокам
        и всё остальное, куда человек заходил.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        {(['all', 3, 2, 1] as const).map((v) => {
          const active = tier === v;
          const label = v === 'all' ? 'все' : `тариф ${v}`;
          return (
            <button key={String(v)} onClick={() => setTier(v)} style={{
              padding: '5px 12px', borderRadius: 6,
              border: `1px solid ${active ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.12)'}`,
              background: active ? 'rgba(0,240,255,0.13)' : 'transparent',
              color: active ? 'var(--neon-cyan)' : 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer',
            }}>
              {label} <span style={{ opacity: 0.6 }}>{counts[v]}</span>
            </button>
          );
        })}
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 16 }}>
        Заходили за неделю: <b style={{ color: '#06d6a0' }}>{week}</b> ·
        {' '}ни одного следа: <b style={{ color: silent ? '#ef476f' : 'var(--text-muted)' }}>{silent}</b> из {shown.length}
      </p>

      <div style={{ overflowX: 'auto', border: '1px solid rgba(0,240,255,0.12)', borderRadius: 10 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr>
              <th style={{ ...th, width: 26 }}></th>
              <th style={th}>Контакт</th>
              <th style={th}>Имя</th>
              <th style={th}>Тариф</th>
              <th style={th}>Доступ до</th>
              <th style={th}>Прочитано</th>
              <th style={th}>Досмотрено</th>
              <th style={th}>Минут</th>
              <th style={th}>Был</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((s) => {
              const contact = s.username ? `@${s.username}` : `id ${s.tg}`;
              const link = s.username ? `https://t.me/${s.username}` : `tg://user?id=${s.tg}`;
              const isOpen = !!open[s.tg];
              const toggle = () => setOpen((o) => ({ ...o, [s.tg]: !o[s.tg] }));
              const readPct = s.lessonsTotal ? (s.lessonsRead / s.lessonsTotal) * 100 : 0;
              const watchPct = s.lessonsTotal ? (s.lessonsWatched / s.lessonsTotal) * 100 : 0;
              return (
                <Fragment key={s.tg}>
                  <tr style={{ opacity: s.lastSeen ? 1 : 0.62 }}>
                    <td style={{ ...td, cursor: 'pointer', color: 'var(--text-muted)', userSelect: 'none' }} onClick={toggle}>
                      {isOpen ? '▾' : '▸'}
                    </td>
                    <td style={td}>
                      <a href={link} target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--neon-cyan)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        {contact}
                      </a>
                    </td>
                    <td style={{ ...td, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.name || '—'}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 5, fontSize: '0.75rem',
                        color: s.tier >= 3 ? '#ffd166' : s.tier === 2 ? '#00f0ff' : 'var(--text-muted)',
                        border: `1px solid ${s.tier >= 3 ? '#ffd16655' : s.tier === 2 ? '#00f0ff55' : 'rgba(255,255,255,0.12)'}`,
                      }}>
                        т{s.tier}
                      </span>
                    </td>
                    <td style={{ ...td, color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {s.expiresAt ? fmt(s.expiresAt) : 'бессрочно'}
                    </td>
                    <td style={{ ...td, cursor: 'pointer' }} onClick={toggle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                        <Bar value={readPct} color="#06d6a0" />
                        <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                          {s.lessonsRead}/{s.lessonsTotal}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...td, cursor: 'pointer' }} onClick={toggle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                        <Bar value={watchPct} color="#00f0ff" />
                        <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                          {s.lessonsWatched}/{s.lessonsTotal}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...td, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                      {s.minutes ? s.minutes : '—'}
                    </td>
                    <td style={{ ...td, color: s.lastSeen ? 'var(--text-muted)' : '#ef476f', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {ago(s.daysSince)}
                    </td>
                  </tr>

                  {isOpen && (
                    <tr>
                      <td />
                      <td colSpan={8} style={{ padding: '4px 12px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ maxWidth: 720 }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '8px 0 8px' }}>
                          Курс по урокам
                        </div>
                        <div style={{ display: 'grid', gap: 4 }}>
                          {s.lessons.map((l) => (
                            <div key={l.slug} style={{
                              display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem',
                              color: l.read || l.watched ? 'var(--text-secondary)' : 'var(--text-muted)',
                            }}>
                              <span style={{ width: 22, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{l.num}</span>
                              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {l.title}
                              </span>
                              <span title="статья дочитана" style={{ width: 18, color: l.read ? '#06d6a0' : 'rgba(255,255,255,0.15)' }}>
                                {l.read ? '✓' : '·'}
                              </span>
                              <Bar value={l.watched} color={l.watched >= 50 ? '#00f0ff' : '#ffd166'} />
                              <span style={{ width: 42, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>
                                {l.watched ? `${l.watched}%` : '—'}
                              </span>
                              <span style={{ width: 58, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>
                                {l.minutes ? `${l.minutes} мин` : ''}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '16px 0 8px' }}>
                          Остальные разделы
                        </div>
                        {s.sections.length === 0 && s.extras.length === 0 && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Никуда не заходил</div>
                        )}
                        {s.sections.length > 0 && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                            {s.sections.map((x) => (
                              <span key={x.section} style={{
                                padding: '4px 9px', borderRadius: 6, fontSize: '0.78rem',
                                border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-secondary)',
                              }}>
                                {SECTION_RU[x.section] || x.section}
                                <span style={{ color: 'var(--text-muted)' }}> · {x.visits} · {fmt(x.lastAt)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                        {s.extras.map((e) => (
                          <div key={`${e.kind}:${e.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '2px 0' }}>
                            <span style={{ width: 92, color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                              {SECTION_RU[e.kind] || e.kind}
                            </span>
                            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
                            {e.watched !== null && (
                              <>
                                <Bar value={e.watched} color={e.watched >= 50 ? '#00f0ff' : '#ffd166'} />
                                <span style={{ width: 42, textAlign: 'right', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{e.watched}%</span>
                              </>
                            )}
                            <span style={{ width: 46, textAlign: 'right', color: 'var(--text-muted)' }}>{fmt(e.at)}</span>
                          </div>
                        ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {shown.length === 0 && (
              <tr><td colSpan={9} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>Пусто в этом фильтре</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
