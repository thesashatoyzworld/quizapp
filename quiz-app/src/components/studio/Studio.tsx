'use client';

// «Студия»: one board for Sasha (/admin/studio) and Danya (/studio).
// Week schedule, item card, stats by copy group, «Что работает».

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ACTOR_LABEL, KIND_LABEL, STAGES, STAGE_LABEL, STAGE_OWNER, addDays, aggregateVariants, fmt, pickSnapshot, weekDays,
  weekStart, type Actor, type Board, type ItemView, type Kind, type Metric, type RuleView, type Snapshot,
} from '@/lib/studio/view';
import s from './studio.module.css';

type Tab = 'week' | 'stats' | 'rules';

const DOW = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const dayNum = (iso: string) => Number(iso.slice(8, 10));
const monthOf = (iso: string) => MONTHS[Number(iso.slice(5, 7)) - 1];
const shortDate = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

function weekLabel(monday: string) {
  const sun = addDays(monday, 6);
  return monthOf(monday) === monthOf(sun)
    ? `${dayNum(monday)}–${dayNum(sun)} ${monthOf(sun)}`
    : `${dayNum(monday)} ${monthOf(monday)} – ${dayNum(sun)} ${monthOf(sun)}`;
}

const latest = (snaps: Snapshot[] | undefined) => (snaps?.length ? snaps[snaps.length - 1] : null);

async function call(op: string, payload: Record<string, unknown>) {
  const res = await fetch('/api/studio', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ op, ...payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `ошибка ${res.status}`);
  return data;
}

export default function Studio({ board, actor, today }: { board: Board; actor: Actor; today: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('week');
  const [monday, setMonday] = useState(weekStart(today));
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const isSasha = actor === 'sasha';

  async function run(op: string, payload: Record<string, unknown>, done?: string) {
    setError('');
    setStatus('');
    try {
      const data = await call(op, payload);
      if (done) setStatus(done);
      startTransition(() => router.refresh());
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ошибка');
      return null;
    }
  }

  async function sync() {
    setStatus('тяну из Instagram…');
    const r = await run('sync', {});
    if (r) setStatus(`обновлено: постов ${r.media}, новых ${r.created}${r.failed.length ? `, не вышло ${r.failed.length}` : ''}`);
  }

  const open = board.items.find((i) => i.id === openId) ?? null;

  return (
    <div className={s.root}>
      <div className={s.tabs} role="tablist">
        {([['week', 'Неделя'], ['stats', 'Статистика'], ['rules', 'Что работает']] as [Tab, string][]).map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} className={s.tab} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
        {isSasha && (
          <button className={s.btn} onClick={sync} disabled={pending}>Обновить из Instagram</button>
        )}
      </div>
      {(status || error) && <p className={error ? s.error : s.status} role="status">{error || status}</p>}

      {tab === 'week' && (
        <Week
          board={board} monday={monday} today={today} isSasha={isSasha}
          onWeek={(n) => setMonday(n === 0 ? weekStart(today) : addDays(monday, 7 * n))}
          onOpen={setOpenId} onAdd={() => setAdding(true)}
        />
      )}
      {tab === 'stats' && <Stats board={board} onOpen={setOpenId} />}
      {tab === 'rules' && <Rules rules={board.rules} isSasha={isSasha} run={run} />}

      {open && (
        <Drawer
          key={open.id} item={open} actor={actor} board={board} run={run} onClose={() => setOpenId(null)}
        />
      )}
      {adding && <AddItem run={run} onClose={() => setAdding(false)} onCreated={(id) => { setAdding(false); setOpenId(id); }} />}
    </div>
  );
}

// ─── week ───

function Week({ board, monday, today, isSasha, onWeek, onOpen, onAdd }: {
  board: Board; monday: string; today: string; isSasha: boolean;
  onWeek: (n: number) => void; onOpen: (id: string) => void; onAdd: () => void;
}) {
  const days = weekDays(monday);
  const unscheduled = board.items.filter((i) => !i.planDate && i.stage !== 'skip' && i.stage !== 'published');
  return (
    <>
      <div className={s.toolbar}>
        <button className={s.btn} onClick={() => onWeek(-1)} aria-label="Прошлая неделя">‹</button>
        <span className={s.weekLabel}>{weekLabel(monday)}</span>
        <button className={s.btn} onClick={() => onWeek(1)} aria-label="Следующая неделя">›</button>
        {monday !== weekStart(today) && <button className={s.btnGhost} onClick={() => onWeek(0)}>к сегодня</button>}
        {isSasha && <button className={`${s.btn} ${s.push}`} onClick={onAdd}>+ Добавить</button>}
      </div>

      <div className={s.board}>
      <div className={s.week}>
        {days.map((d, i) => {
          const items = board.items.filter((it) => it.planDate === d);
          return (
            <section key={d} className={`${s.day} ${d === today ? s.today : ''}`} aria-label={`${DOW[i]} ${dayNum(d)} ${monthOf(d)}`}>
              <h3 className={s.dayHead}>
                <span>{DOW[i]}</span> <span className={s.dayNum}>{dayNum(d)}</span>
                {items.length > 0 && <span className={s.count}>{items.length}</span>}
              </h3>
              {items.length === 0 && <p className={s.empty}>пусто</p>}
              {items.map((it) => <Card key={it.id} item={it} snaps={board.stats[it.shortcode ?? '']} onOpen={onOpen} />)}
            </section>
          );
        })}
      </div>

      <section className={s.nodate}>
        <h3 className={s.sectionHead}>Без даты <span className={s.count}>{unscheduled.length}</span></h3>
        {unscheduled.length === 0 && <p className={s.empty}>всё расставлено</p>}
        <div className={s.nodateGrid}>
          {unscheduled.map((it) => <Card key={it.id} item={it} snaps={undefined} onOpen={onOpen} />)}
        </div>
      </section>
      </div>
    </>
  );
}

function Card({ item, snaps, onOpen }: { item: ItemView; snaps: Snapshot[] | undefined; onOpen: (id: string) => void }) {
  const last = latest(snaps);
  return (
    <button className={`${s.card} ${item.stage === 'skip' ? s.skipped : ''}`} onClick={() => onOpen(item.id)}>
      <span className={s.cardTop}>
        <span className={`${s.kind} ${item.kind === 'carousel' ? s.kindCarousel : ''}`}>{KIND_LABEL[item.kind]}</span>
        <span className={`${s.stage} ${s[`stage_${item.stage}`]}`}>{STAGE_LABEL[item.stage]}</span>
      </span>
      <span className={s.cardTitle}>{item.title}</span>
      {(item.variant || STAGE_OWNER[item.stage] || last) && (
        <span className={s.cardMeta}>
          {item.variant && <span>{item.variant}{item.copyNo ? ` · копия ${item.copyNo}` : ''}</span>}
          {STAGE_OWNER[item.stage] && <span>{STAGE_OWNER[item.stage]}</span>}
          {last?.views != null && <span>{fmt('views', last.views, item.kind)} просм.</span>}
        </span>
      )}
    </button>
  );
}

// ─── item drawer ───

function Sheet({ label, onClose, children }: { label: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className={s.overlay} onClick={onClose}>
      <aside className={s.drawer} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        {children}
      </aside>
    </div>
  );
}

function Drawer({ item, actor, board, run, onClose }: {
  item: ItemView; actor: Actor; board: Board;
  run: (op: string, p: Record<string, unknown>, done?: string) => Promise<unknown>; onClose: () => void;
}) {
  const isSasha = actor === 'sasha';
  const [form, setForm] = useState({
    title: item.title, kind: item.kind as string, variant: item.variant ?? '', copyNo: item.copyNo?.toString() ?? '',
    stage: item.stage as string, planDate: item.planDate ?? '', briefUrl: item.briefUrl ?? '', briefText: item.briefText ?? '',
  });
  const [link, setLink] = useState('');
  const [comment, setComment] = useState('');
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const comments = board.comments.filter((c) => c.itemId === item.id);
  const snaps = board.stats[item.shortcode ?? ''];
  const at48 = pickSnapshot(snaps);
  const last = latest(snaps);

  const dirty = JSON.stringify(form) !== JSON.stringify({
    title: item.title, kind: item.kind, variant: item.variant ?? '', copyNo: item.copyNo?.toString() ?? '',
    stage: item.stage, planDate: item.planDate ?? '', briefUrl: item.briefUrl ?? '', briefText: item.briefText ?? '',
  });

  function save() {
    const data: Record<string, unknown> = { stage: form.stage, planDate: form.planDate };
    if (isSasha) Object.assign(data, { title: form.title, kind: form.kind, variant: form.variant, copyNo: form.copyNo, briefUrl: form.briefUrl, briefText: form.briefText });
    if (form.stage === item.stage) delete data.stage;
    run('update', { id: item.id, data }, 'сохранено');
  }

  return (
    <Sheet label={item.title} onClose={onClose}>
        <div className={s.drawerHead}>
          <span className={`${s.kind} ${item.kind === 'carousel' ? s.kindCarousel : ''}`}>{KIND_LABEL[item.kind]}</span>
          {item.author === 'api' && <span className={s.muted}>найден в Instagram</span>}
          <button className={s.close} onClick={onClose} aria-label="Закрыть" autoFocus>×</button>
        </div>

        {isSasha
          ? <textarea className={`${s.input} ${s.titleInput}`} rows={2} value={form.title} onChange={set('title')} aria-label="Название" />
          : <h2 className={s.drawerTitle}>{item.title}</h2>}

        <div className={s.fields}>
          <label className={s.field}>Этап
            <select className={s.input} value={form.stage} onChange={set('stage')}>
              {STAGES.filter((st) => st !== 'published' || item.stage === 'published').map((st) => (
                <option key={st} value={st} disabled={st === 'published'}>{STAGE_LABEL[st]}</option>
              ))}
            </select>
          </label>
          <label className={s.field}>Дата выхода
            <input className={s.input} type="date" value={form.planDate} onChange={set('planDate')} />
          </label>
          {isSasha && (
            <>
              <label className={s.field}>Тип
                <select className={s.input} value={form.kind} onChange={set('kind')}>
                  <option value="reel">Рилс</option>
                  <option value="carousel">Карусель</option>
                </select>
              </label>
              <label className={s.field}>Группа копий
                <input className={s.input} value={form.variant} onChange={set('variant')} placeholder="mama-vyrez" />
              </label>
              <label className={s.field}>Копия №
                <input className={s.input} inputMode="numeric" value={form.copyNo} onChange={set('copyNo')} />
              </label>
            </>
          )}
          {!isSasha && item.variant && (
            <p className={s.field}>Группа копий<span className={s.value}>{item.variant}{item.copyNo ? ` · копия ${item.copyNo}` : ''}</span></p>
          )}
        </div>

        <h3 className={s.blockHead}>ТЗ</h3>
        {isSasha ? (
          <>
            <textarea className={s.input} rows={3} value={form.briefText} onChange={set('briefText')} placeholder="Коротко, что сделать" aria-label="ТЗ коротко" />
            <input className={s.input} value={form.briefUrl} onChange={set('briefUrl')} placeholder="Ссылка на ТЗ" aria-label="Ссылка на ТЗ" />
          </>
        ) : (
          item.briefText ? <p className={s.text}>{item.briefText}</p> : <p className={s.muted}>ТЗ пока нет</p>
        )}
        <div className={s.links}>
          {item.hasBriefHtml && <a className={s.link} href={`/studio/brief/${item.id}`} target="_blank" rel="noreferrer">Открыть ТЗ</a>}
          {item.briefUrl && <a className={s.link} href={item.briefUrl} target="_blank" rel="noreferrer">ТЗ по ссылке</a>}
        </div>

        {dirty && (
          <div className={s.saveBar}>
            <button className={s.btnPrimary} onClick={save}>Сохранить</button>
          </div>
        )}

        <h3 className={s.blockHead}>Пост</h3>
        {item.permalink && <a className={s.link} href={item.permalink} target="_blank" rel="noreferrer">{item.permalink.replace('https://www.', '')}</a>}
        <div className={s.inline}>
          <input className={s.input} value={link} onChange={(e) => setLink(e.target.value)} placeholder="instagram.com/reel/…" aria-label="Ссылка на пост" />
          <button className={s.btn} disabled={!link.trim()} onClick={() => run('attach', { id: item.id, url: link.trim() }, 'пост привязан').then((r) => r && setLink(''))}>
            {item.permalink ? 'Заменить' : 'Привязать'}
          </button>
        </div>

        <h3 className={s.blockHead}>Цифры</h3>
        {!item.shortcode ? <p className={s.muted}>ещё не вышло</p> : !last ? <p className={s.muted}>цифры появятся после обновления</p> : (
          <div className={s.statWrap}>
            <table className={s.table}>
              <thead><tr><th></th><th>через 48 ч</th><th>сейчас</th></tr></thead>
              <tbody>
                {(item.kind === 'reel'
                  ? (['views', 'avgWatchMs', 'skipRate', 'comments', 'shares', 'saved', 'follows'] as Metric[])
                  : (['views', 'saved', 'shares', 'comments', 'follows'] as Metric[])).map((m) => (
                  <tr key={m}>
                    <th scope="row">{METRIC_LABEL[m]}</th>
                    <td>{at48 ? fmt(m, at48[m], item.kind) : 'ещё рано'}</td>
                    <td>{fmt(m, last[m], item.kind)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={s.muted}>снято {shortDate(last.takenAt.slice(0, 10))}, через {Math.round(last.ageHours)} ч после выхода</p>
          </div>
        )}

        <h3 className={s.blockHead}>Комментарии</h3>
        {comments.length === 0 && <p className={s.muted}>пока нет</p>}
        <ul className={s.comments}>
          {comments.map((c) => (
            <li key={c.id} className={s.comment}>
              <span className={s.commentHead}>{ACTOR_LABEL[c.author] ?? c.author} · {shortDate(c.createdAt.slice(0, 10))}</span>
              <span className={s.text}>{c.text}</span>
            </li>
          ))}
        </ul>
        <textarea className={s.input} rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Написать комментарий" aria-label="Комментарий" />
        <div className={s.saveBar}>
          <button className={s.btn} disabled={!comment.trim()} onClick={() => run('comment', { id: item.id, text: comment }).then((r) => r && setComment(''))}>
            Отправить
          </button>
        </div>
    </Sheet>
  );
}

function AddItem({ run, onClose, onCreated }: {
  run: (op: string, p: Record<string, unknown>) => Promise<unknown>; onClose: () => void; onCreated: (id: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<Kind>('reel');
  return (
    <Sheet label="Новая карточка" onClose={onClose}>
        <div className={s.drawerHead}>
          <h2 className={s.drawerTitle}>Новая карточка</h2>
          <button className={s.close} onClick={onClose} aria-label="Закрыть">×</button>
        </div>
        <label className={s.field}>Тип
          <select className={s.input} value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
            <option value="reel">Рилс</option>
            <option value="carousel">Карусель</option>
          </select>
        </label>
        <label className={s.field}>Название
          <input className={s.input} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </label>
        <div className={s.saveBar}>
          <button
            className={s.btnPrimary} disabled={!title.trim()}
            onClick={() => run('create', { data: { title, kind } }).then((r) => r && onCreated((r as { id: string }).id))}
          >
            Создать
          </button>
        </div>
    </Sheet>
  );
}

// ─── stats ───

const METRIC_LABEL: Record<Metric, string> = {
  views: 'Просмотры', avgWatchMs: 'Досмотр', skipRate: 'Пролистали', comments: 'Комментарии',
  shares: 'Репосты', saved: 'Сохранения', follows: 'Подписки',
};
const REEL_METRICS: Metric[] = ['views', 'avgWatchMs', 'skipRate', 'comments', 'shares', 'saved', 'follows'];

function Stats({ board, onOpen }: { board: Board; onOpen: (id: string) => void }) {
  const groups = useMemo(() => aggregateVariants(board.items, board.stats), [board]);
  const pubTime = (g: (typeof groups)[number]) => g.copies[0]?.item.publishedAt ?? '';
  const variants = groups.filter((g) => g.kind === 'reel' && !g.key.startsWith('item:'));
  const singles = groups.filter((g) => g.kind === 'reel' && g.key.startsWith('item:') && g.published)
    .sort((a, b) => pubTime(b).localeCompare(pubTime(a)));
  const carousels = groups.filter((g) => g.kind === 'carousel' && g.published)
    .sort((a, b) => pubTime(b).localeCompare(pubTime(a)));

  return (
    <>
      <p className={s.note}>
        Правку судим по группе копий: одну заливку решает первая порция зрителей. Цифры по снимку не раньше 48 часов после выхода, до этого «ещё рано».
        Подписки с рилса Instagram не отдаёт.
      </p>

      <h3 className={s.sectionHead}>Рилсы по правкам</h3>
      {variants.length === 0 && <p className={s.empty}>пока нет групп копий</p>}
      <div className={s.groups}>
        {variants.map((g) => (
          <article key={g.key} className={s.group}>
            <header className={s.groupHead}>
              <span className={s.groupName}>{g.copies[0]?.item.title ?? g.label}</span>
              <span className={s.muted}>{g.key} · копий {g.copies.length} · вышло {g.published} · замерено {g.measured}</span>
            </header>
            {g.measured === 0 ? (
              <p className={s.early}>{g.published ? 'ещё рано: ждём 48 часов после выхода' : 'ещё не вышло'}</p>
            ) : (
              <>
                <dl className={s.tiles}>
                  {REEL_METRICS.map((m) => (
                    <div key={m} className={s.tile}>
                      <dt>{METRIC_LABEL[m]}{m === 'follows' ? '' : ', ср.'}</dt>
                      <dd>{fmt(m, g.avg[m], 'reel')}</dd>
                    </div>
                  ))}
                </dl>
                {g.best && (
                  <p className={s.best}>
                    Лучшая: <button className={s.linkBtn} onClick={() => onOpen(g.best!.item.id)}>
                      {g.best.item.copyNo ? `копия ${g.best.item.copyNo}` : g.best.item.title}
                    </button>, {fmt('views', g.best.snap?.views, 'reel')} просм.
                  </p>
                )}
              </>
            )}
            <ul className={s.copies}>
              {g.copies.map((c) => (
                <li key={c.item.id}>
                  <button className={s.linkBtn} onClick={() => onOpen(c.item.id)}>
                    копия {c.item.copyNo ?? '?'}
                  </button>
                  <span className={s.muted}>
                    {c.snap ? `${fmt('views', c.snap.views, 'reel')} просм.` : c.item.shortcode ? 'ещё рано' : STAGE_LABEL[c.item.stage]}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <h3 className={s.sectionHead}>Остальные рилсы</h3>
      <StatTable groups={singles} metrics={REEL_METRICS} kind="reel" onOpen={onOpen} />

      <h3 className={s.sectionHead}>Карусели и посты</h3>
      <StatTable groups={carousels} metrics={['views', 'saved', 'shares', 'follows']} kind="carousel" onOpen={onOpen} />
    </>
  );
}

function StatTable({ groups, metrics, kind, onOpen }: {
  groups: ReturnType<typeof aggregateVariants>; metrics: Metric[]; kind: Kind; onOpen: (id: string) => void;
}) {
  if (!groups.length) return <p className={s.empty}>пока нет</p>;
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr><th>Дата</th><th>Пост</th>{metrics.map((m) => <th key={m}>{METRIC_LABEL[m]}</th>)}</tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const c = g.copies[0];
            return (
              <tr key={g.key}>
                <td className={s.nowrap}>{c.item.planDate ? shortDate(c.item.planDate) : ''}</td>
                <td><button className={`${s.linkBtn} ${s.clip}`} onClick={() => onOpen(c.item.id)}>{c.item.title}</button></td>
                {c.snap
                  ? metrics.map((m) => <td key={m} className={s.num}>{fmt(m, c.snap![m], kind)}</td>)
                  : <td colSpan={metrics.length} className={s.muted}>ещё рано</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── rules ───

const RULE_KIND: Record<RuleView['kind'], string> = { reel: 'Рилсы', carousel: 'Карусели', all: 'Всё' };

function Rules({ rules, isSasha, run }: {
  rules: RuleView[]; isSasha: boolean; run: (op: string, p: Record<string, unknown>, done?: string) => Promise<unknown>;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <>
      <ol className={s.rules}>
        {rules.map((r) => editing === r.id
          ? <RuleForm key={r.id} rule={r} run={run} onDone={() => setEditing(null)} />
          : (
            <li key={r.id} className={s.rule}>
              <span className={s.ruleKind}>{RULE_KIND[r.kind]}</span>
              <span className={s.ruleText}>{r.text}</span>
              {r.evidence && <span className={s.muted}>{r.evidence}</span>}
              {isSasha && (
                <span className={s.ruleActions}>
                  <button className={s.linkBtn} onClick={() => setEditing(r.id)}>править</button>
                  <button className={s.linkBtn} onClick={() => confirm('Удалить правило?') && run('rule-delete', { id: r.id })}>удалить</button>
                </span>
              )}
            </li>
          ))}
      </ol>
      {rules.length === 0 && <p className={s.empty}>правил пока нет</p>}
      {isSasha && editing !== 'new' && <button className={s.btn} onClick={() => setEditing('new')}>+ Правило</button>}
      {isSasha && editing === 'new' && (
        <ol className={s.rules}><RuleForm rule={{ id: '', kind: 'reel', text: '', evidence: '', order: rules.length + 1 }} run={run} onDone={() => setEditing(null)} /></ol>
      )}
    </>
  );
}

function RuleForm({ rule, run, onDone }: {
  rule: RuleView; run: (op: string, p: Record<string, unknown>) => Promise<unknown>; onDone: () => void;
}) {
  const [f, setF] = useState({ kind: rule.kind as string, text: rule.text, evidence: rule.evidence ?? '', order: String(rule.order) });
  return (
    <li className={`${s.rule} ${s.ruleEdit}`}>
      <div className={s.fields}>
        <label className={s.field}>Для
          <select className={s.input} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
            <option value="reel">Рилсы</option><option value="carousel">Карусели</option><option value="all">Всё</option>
          </select>
        </label>
        <label className={s.field}>Порядок
          <input className={s.input} inputMode="numeric" value={f.order} onChange={(e) => setF({ ...f, order: e.target.value })} />
        </label>
      </div>
      <label className={s.field}>Правило
        <textarea className={s.input} rows={2} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} />
      </label>
      <label className={s.field}>На чём стоит
        <input className={s.input} value={f.evidence} onChange={(e) => setF({ ...f, evidence: e.target.value })} />
      </label>
      <div className={s.inline}>
        <button className={s.btnPrimary} disabled={!f.text.trim()} onClick={() => run('rule', { data: { id: rule.id || undefined, ...f, order: Number(f.order) } }).then((r) => r && onDone())}>
          Сохранить
        </button>
        <button className={s.btnGhost} onClick={onDone}>Отмена</button>
      </div>
    </li>
  );
}

