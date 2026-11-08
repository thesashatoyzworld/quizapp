'use client';

// «Студия»: one board for Sasha (/admin/studio) and Danya (/studio).
// Schedule (week or month, plan or published), item card, stats by copy
// group, «Что работает».

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ACTOR_LABEL, KIND_LABEL, MODE_LABEL, STAGES, STAGE_LABEL, STAGE_OWNER, addDays, addMonths, aggregateVariants,
  collapseCopies, copiesLabel, fmt, inMode, monthGrid, pickSnapshot, weekDays, weekStart,
  type Actor, type Board, type CardGroup, type ItemView, type Kind, type Metric, type Mode, type RuleView, type Snapshot,
} from '@/lib/studio/view';
import s from './studio.module.css';

type Tab = 'schedule' | 'stats' | 'rules';
type View = 'week' | 'month';

const DOW = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const dayNum = (iso: string) => Number(iso.slice(8, 10));
const monthOf = (iso: string) => MONTHS[Number(iso.slice(5, 7)) - 1];
const shortDate = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
const dowOf = (iso: string) => DOW[(new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7];

function weekLabel(monday: string) {
  const sun = addDays(monday, 6);
  return monthOf(monday) === monthOf(sun)
    ? `${dayNum(monday)}–${dayNum(sun)} ${monthOf(sun)}`
    : `${dayNum(monday)} ${monthOf(monday)} – ${dayNum(sun)} ${monthOf(sun)}`;
}
const monthLabel = (iso: string) => `${MONTHS_NOM[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;

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
  const [tab, setTab] = useState<Tab>('schedule');
  const [view, setView] = useState<View>('week');
  const [mode, setMode] = useState<Mode>('plan');
  const [anchor, setAnchor] = useState(today); // any day inside the shown week or month
  const [openId, setOpenId] = useState<string | null>(null);
  const [copies, setCopies] = useState<ItemView[] | null>(null);
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
  const shown = useMemo(() => board.items.filter((i) => inMode(i, mode)), [board.items, mode]);
  const openGroup = (g: CardGroup) => (g.items.length > 1 ? setCopies(g.items) : setOpenId(g.items[0].id));
  const step = (n: number) => setAnchor(n === 0 ? today : view === 'week' ? addDays(anchor, 7 * n) : addMonths(anchor, n));
  const atToday = view === 'week' ? weekStart(anchor) === weekStart(today) : anchor.slice(0, 7) === today.slice(0, 7);

  return (
    <div className={s.root}>
      <div className={s.tabs} role="tablist">
        {([['schedule', 'Расписание'], ['stats', 'Статистика'], ['rules', 'Что работает']] as [Tab, string][]).map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} className={s.tab} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
        {isSasha && (
          <button className={s.btn} onClick={sync} disabled={pending}>Обновить из Instagram</button>
        )}
      </div>
      {(status || error) && <p className={error ? s.error : s.status} role="status">{error || status}</p>}

      {tab === 'schedule' && (
        <>
          <div className={s.toolbar}>
            <Segmented label="Вид" value={view} onChange={setView} options={[['week', 'Неделя'], ['month', 'Месяц']]} />
            <Segmented label="Что показать" value={mode} onChange={setMode} options={(['plan', 'published', 'all'] as Mode[]).map((m) => [m, MODE_LABEL[m]])} />
          </div>
          <div className={s.toolbar}>
            <button className={s.btn} onClick={() => step(-1)} aria-label={view === 'week' ? 'Прошлая неделя' : 'Прошлый месяц'}>‹</button>
            <span className={s.weekLabel}>{view === 'week' ? weekLabel(weekStart(anchor)) : monthLabel(anchor)}</span>
            <button className={s.btn} onClick={() => step(1)} aria-label={view === 'week' ? 'Следующая неделя' : 'Следующий месяц'}>›</button>
            {!atToday && <button className={s.btnGhost} onClick={() => step(0)}>к сегодня</button>}
            {isSasha && <button className={`${s.btn} ${s.push}`} onClick={() => setAdding(true)}>+ Добавить</button>}
          </div>
          <div className={s.board}>
            {view === 'week'
              ? <Week items={shown} board={board} monday={weekStart(anchor)} today={today} onOpen={openGroup} />
              : <Month items={shown} board={board} anchor={anchor} today={today} onOpen={openGroup} />}
            {mode !== 'published' && <NoDate items={shown} board={board} onOpen={openGroup} />}
          </div>
        </>
      )}
      {tab === 'stats' && <Stats board={board} onOpen={setOpenId} />}
      {tab === 'rules' && <Rules rules={board.rules} isSasha={isSasha} run={run} />}

      {copies && !open && <CopiesSheet items={copies} onOpen={setOpenId} onClose={() => setCopies(null)} />}
      {open && (
        <Drawer
          key={open.id} item={open} actor={actor} board={board} run={run} onClose={() => setOpenId(null)}
        />
      )}
      {adding && <AddItem run={run} onClose={() => setAdding(false)} onCreated={(id) => { setAdding(false); setOpenId(id); }} />}
    </div>
  );
}

function Segmented<T extends string>({ label, value, onChange, options }: {
  label: string; value: T; onChange: (v: T) => void; options: [T, string][];
}) {
  return (
    <div className={s.segmented} role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} className={s.segment} aria-pressed={value === v} onClick={() => onChange(v)}>{text}</button>
      ))}
    </div>
  );
}

// ─── schedule ───

type GroupOpen = (g: CardGroup) => void;

function Week({ items, board, monday, today, onOpen }: {
  items: ItemView[]; board: Board; monday: string; today: string; onOpen: GroupOpen;
}) {
  return (
    <div className={s.week}>
      {weekDays(monday).map((d, i) => {
        const groups = collapseCopies(items.filter((it) => it.planDate === d));
        return (
          <section key={d} className={`${s.day} ${d === today ? s.today : ''}`} aria-label={`${DOW[i]} ${dayNum(d)} ${monthOf(d)}`}>
            <h3 className={s.dayHead}>
              <span>{DOW[i]}</span> <span className={s.dayNum}>{dayNum(d)}</span>
              {groups.length > 0 && <span className={s.count}>{groups.length}</span>}
            </h3>
            {groups.length === 0 && <p className={s.empty}>пусто</p>}
            {groups.map((g) => <Card key={g.key} group={g} board={board} onOpen={onOpen} />)}
          </section>
        );
      })}
    </div>
  );
}

function Month({ items, board, anchor, today, onOpen }: {
  items: ItemView[]; board: Board; anchor: string; today: string; onOpen: GroupOpen;
}) {
  const weeks = monthGrid(anchor);
  const month = anchor.slice(0, 7);
  const byDay = (d: string) => collapseCopies(items.filter((it) => it.planDate === d));
  const listDays = weeks.flat().filter((d) => d.startsWith(month)).map((d) => [d, byDay(d)] as const).filter(([, g]) => g.length);
  return (
    <>
      <div className={s.month} role="grid" aria-label={monthLabel(anchor)}>
        <div className={s.monthRow} role="row">
          {DOW.map((d) => <div key={d} className={s.monthDow} role="columnheader">{d}</div>)}
        </div>
        {weeks.map((w) => (
          <div key={w[0]} className={s.monthRow} role="row">
            {w.map((d) => {
              const groups = byDay(d);
              return (
                <div
                  key={d} role="gridcell" aria-label={`${dayNum(d)} ${monthOf(d)}`}
                  className={`${s.cell} ${d.startsWith(month) ? '' : s.cellOut} ${d === today ? s.today : ''}`}
                >
                  <span className={s.cellNum}>{dayNum(d)}</span>
                  {groups.map((g) => <Chip key={g.key} group={g} board={board} onOpen={onOpen} />)}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* phone: only the days that have something */}
      <div className={s.monthList}>
        {listDays.length === 0 && <p className={s.empty}>в этом месяце пусто</p>}
        {listDays.map(([d, groups]) => (
          <section key={d} className={`${s.day} ${d === today ? s.today : ''}`}>
            <h3 className={s.dayHead}>
              <span>{dowOf(d)}</span> <span className={s.dayNum}>{dayNum(d)}</span> <span>{monthOf(d)}</span>
              <span className={s.count}>{groups.length}</span>
            </h3>
            {groups.map((g) => <Card key={g.key} group={g} board={board} onOpen={onOpen} />)}
          </section>
        ))}
      </div>
    </>
  );
}

function NoDate({ items, board, onOpen }: { items: ItemView[]; board: Board; onOpen: GroupOpen }) {
  const groups = collapseCopies(items.filter((i) => !i.planDate && i.stage !== 'published' && i.stage !== 'skip'));
  return (
    <section className={s.nodate}>
      <h3 className={s.sectionHead}>Без даты <span className={s.count}>{groups.length}</span></h3>
      {groups.length === 0 && <p className={s.empty}>всё расставлено</p>}
      <div className={s.nodateGrid}>
        {groups.map((g) => <Card key={g.key} group={g} board={board} onOpen={onOpen} />)}
      </div>
    </section>
  );
}

/** Post preview: our thumbnail route for published posts, a neutral tile by kind otherwise. */
function KindIcon({ kind, small }: { kind: ItemView['kind']; small?: boolean }) {
  const reel = kind === 'reel';
  return (
    <span
      className={`${s.kindIcon} ${reel ? s.kindReel : s.kindCarousel} ${small ? s.kindSmall : ''}`}
      role="img"
      aria-label={KIND_LABEL[kind]}
      title={KIND_LABEL[kind]}
    >
      {reel ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
          <rect x="4" y="3" width="16" height="18" rx="3" />
          <path d="M10 9v6l5-3z" fill="currentColor" stroke="none" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="7" width="13" height="14" rx="2.5" />
          <path d="M8 4.5h10.5a2 2 0 0 1 2 2V17" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

function Thumb({ item, className }: { item: ItemView; className?: string }) {
  const [broken, setBroken] = useState(false);
  if (item.mediaId && !broken) {
    // eslint-disable-next-line @next/next/no-img-element -- streamed from our own route, sizes vary
    return <img className={`${s.thumb} ${className ?? ''}`} src={`/api/studio/thumb/${item.mediaId}`} alt="" loading="lazy" onError={() => setBroken(true)} />;
  }
  return (
    <span className={`${s.thumb} ${s.thumbEmpty} ${className ?? ''}`} aria-hidden="true">
      {item.kind === 'reel' ? (
        <svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 7.5v9l7-4.5z" fill="currentColor" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="5" width="11" height="14" rx="2" /><path d="M19 7v10" /></svg>
      )}
    </span>
  );
}

function Card({ group, board, onOpen }: { group: CardGroup; board: Board; onOpen: GroupOpen }) {
  const item = group.items[0];
  const n = group.items.length;
  const last = n === 1 ? latest(board.stats[item.shortcode ?? '']) : null;
  return (
    <button className={`${s.card} ${item.stage === 'skip' ? s.skipped : ''}`} onClick={() => onOpen(group)}>
      <Thumb item={item} />
      <span className={s.cardBody}>
        <span className={s.cardTop}>
          <KindIcon kind={item.kind} />
          <span className={`${s.stage} ${s[`stage_${item.stage}`]}`}>{STAGE_LABEL[item.stage]}</span>
        </span>
        <span className={s.cardTitle}>{item.title}</span>
        <span className={s.cardMeta}>
          {n > 1 && <span className={s.copyBadge}>×{copiesLabel(n)}</span>}
          {n === 1 && item.variant && <span>{item.variant}{item.copyNo ? ` · копия ${item.copyNo}` : ''}</span>}
          {STAGE_OWNER[item.stage] && <span>{STAGE_OWNER[item.stage]}</span>}
          {last?.views != null && <span>{fmt('views', last.views, item.kind)} просм.</span>}
        </span>
      </span>
    </button>
  );
}

/** Month cell entry: thumbnail, kind, stage colour, copies count. */
function Chip({ group, board, onOpen }: { group: CardGroup; board: Board; onOpen: GroupOpen }) {
  const item = group.items[0];
  const n = group.items.length;
  const views = n === 1 ? latest(board.stats[item.shortcode ?? ''])?.views : null;
  const label = `${KIND_LABEL[item.kind]}, ${STAGE_LABEL[item.stage]}${n > 1 ? `, ${copiesLabel(n)}` : ''}: ${item.title}`;
  return (
    <button className={`${s.chip} ${s[`chip_${item.stage}`]}`} onClick={() => onOpen(group)} title={label} aria-label={label}>
      <Thumb item={item} className={s.chipThumb} />
      <span className={s.chipBody}>
        <span className={s.chipLine}>
          <KindIcon kind={item.kind} small />
          {n > 1 && <span className={s.copyBadge}>×{n}</span>}
          <span className={s.chipTitle}>{item.title}</span>
        </span>
        {views != null && <span className={s.chipKind}>{fmt('views', views, item.kind)}</span>}
      </span>
    </button>
  );
}

function CopiesSheet({ items, onOpen, onClose }: { items: ItemView[]; onOpen: (id: string) => void; onClose: () => void }) {
  const first = items[0];
  return (
    <Sheet label={`Копии: ${first.title}`} onClose={onClose}>
      <div className={s.drawerHead}>
        <KindIcon kind={first.kind} />
        <span className={s.muted}>{first.variant} · {copiesLabel(items.length)}</span>
        <button className={s.close} onClick={onClose} aria-label="Закрыть" autoFocus>×</button>
      </div>
      <h2 className={s.drawerTitle}>{first.title}</h2>
      <ul className={s.copyList}>
        {items.map((it) => (
          <li key={it.id}>
            <button className={s.copyRow} onClick={() => onOpen(it.id)}>
              <Thumb item={it} className={s.chipThumb} />
              <span className={s.copyName}>Копия {it.copyNo ?? '?'}</span>
              <span className={`${s.stage} ${s[`stage_${it.stage}`]}`}>{STAGE_LABEL[it.stage]}</span>
              <span className={s.muted}>{it.planDate ? shortDate(it.planDate) : 'без даты'}</span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
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
          <KindIcon kind={item.kind} />
          {item.author === 'api' && <span className={s.muted}>найден в Instagram</span>}
          <button className={s.close} onClick={onClose} aria-label="Закрыть" autoFocus>×</button>
        </div>

        {item.mediaId && (
          <a className={s.drawerThumbLink} href={item.permalink ?? undefined} target="_blank" rel="noreferrer" aria-label="Открыть пост в Instagram">
            <Thumb item={item} className={s.drawerThumb} />
          </a>
        )}

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
            <header className={s.groupHeadRow}>
              <Thumb item={(g.best ?? g.copies.find((c) => c.item.mediaId) ?? g.copies[0]).item} className={s.chipThumb} />
              <span className={s.groupHead}>
                <span className={s.groupName}>{g.copies[0]?.item.title ?? g.label}</span>
                <span className={s.muted}>{g.key} · копий {g.copies.length} · вышло {g.published} · замерено {g.measured}</span>
              </span>
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
          <tr><th>Дата</th><th><span className={s.srOnly}>Превью</span></th><th>Пост</th>{metrics.map((m) => <th key={m}>{METRIC_LABEL[m]}</th>)}</tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const c = g.copies[0];
            return (
              <tr key={g.key}>
                <td className={s.nowrap}>{c.item.planDate ? shortDate(c.item.planDate) : ''}</td>
                <td className={s.thumbCell}><Thumb item={c.item} className={s.tableThumb} /></td>
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

