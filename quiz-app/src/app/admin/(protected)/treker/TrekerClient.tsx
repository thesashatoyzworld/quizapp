'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TaskView } from '@/lib/tracker/data';
import type { Period } from '@/lib/tracker/periods';
import Link from 'next/link';
import { mondayOf, shortDate, todayLocal, weeksUntil, type MapView } from '@/lib/tracker/karta-shared';
import PhotoImport from './PhotoImport';
import Ring from './Ring';
import { TagChip, TagEditor } from './Tags';
import styles from './treker.module.css';

type Kind = 'quest' | 'routine';

const PERIOD_LABEL: Record<Period, string> = { day: 'каждый день', week: 'каждую неделю', month: 'каждый месяц' };
const PERIOD_NOW: Record<Period, string> = { day: 'сегодня', week: 'эта неделя', month: 'этот месяц' };

async function call(body: Record<string, unknown>): Promise<TaskView | null> {
  const res = await fetch('/api/admin/tracker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `ошибка ${res.status}`);
  return json.task ?? null;
}

function pct(p: number) {
  return `${Math.round(p * 100)}%`;
}

function counts(t: TaskView) {
  if (t.steps.length === 0) return t.doneWhole ? 'готово' : 'без шагов';
  return `${t.steps.filter((s) => s.done).length}/${t.steps.length}`;
}

function recompute(t: TaskView): TaskView {
  const progress = t.steps.length ? t.steps.filter((s) => s.done).length / t.steps.length : t.doneWhole ? 1 : 0;
  const history = t.history.length
    ? [...t.history.slice(0, -1), { ...t.history[t.history.length - 1], progress }]
    : t.history;
  return { ...t, progress, history };
}

/**
 * Заряд с учётом вложенности: шаги задачи и её дети считаются поровну,
 * ребёнок даёт свою долю (0..1). Задача без шагов и детей = «сделано целиком».
 */
function treeProgress(tasks: TaskView[]): { progress: Map<string, number>; children: Map<string, TaskView[]> } {
  const children = new Map<string, TaskView[]>();
  const ids = new Set(tasks.filter((t) => !t.archived).map((t) => t.id));
  for (const t of tasks) {
    if (t.archived || !t.parentId || !ids.has(t.parentId)) continue;
    const list = children.get(t.parentId) ?? [];
    list.push(t);
    children.set(t.parentId, list);
  }
  const progress = new Map<string, number>();
  const byId = new Map(tasks.map((t) => [t.id, t]));
  function of(id: string, depth = 0): number {
    const cached = progress.get(id);
    if (cached !== undefined) return cached;
    const t = byId.get(id)!;
    const kids = depth > 30 ? [] : (children.get(id) ?? []);
    let units = t.steps.length + kids.length;
    let done = t.steps.filter((s) => s.done).length + kids.reduce((sum, k) => sum + of(k.id, depth + 1), 0);
    if (units === 0) {
      units = 1;
      done = t.doneWhole ? 1 : 0;
    }
    const p = done / units;
    progress.set(id, p);
    return p;
  }
  tasks.forEach((t) => of(t.id));
  return { progress, children };
}

export default function TrekerClient({
  initialTasks,
  initialOpen,
  map,
}: {
  initialTasks: TaskView[];
  initialOpen: string | null;
  map: MapView | null;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [openId, setOpenId] = useState<string | null>(initialOpen);
  const [adding, setAdding] = useState<Kind | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Кнопка «назад» на телефоне закрывает задачу, а не уходит из раздела.
  useEffect(() => {
    const onPop = () => setOpenId(new URLSearchParams(window.location.search).get('t'));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const open = useCallback((id: string | null) => {
    setOpenId(id);
    const url = id ? `?t=${id}` : window.location.pathname;
    window.history.pushState(null, '', url);
  }, []);

  // Скролл наверх после того, как экран сменился, иначе круг внутри задачи срезан.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.querySelector('main')?.scrollTo({ top: 0 });
  }, [openId]);

  const put = useCallback((t: TaskView) => {
    setTasks((all) => (all.some((x) => x.id === t.id) ? all.map((x) => (x.id === t.id ? t : x)) : [...all, t]));
  }, []);

  // Быстрые тапы по шагам шлют несколько запросов подряд, ответы приходят вразнобой.
  // Применяем ответ сервера, только если он на последний запрос по этой задаче.
  const seq = useRef<Record<string, number>>({});

  const run = useCallback(
    async (body: Record<string, unknown>, optimistic?: TaskView) => {
      setError(null);
      // Новые задачи без id: у каждой свой ключ, иначе параллельные создания (фото тетрадки) глушат друг друга.
      const key = String(optimistic?.id ?? body.taskId ?? body.id ?? `new-${Math.random()}`);
      const mine = (seq.current[key] = (seq.current[key] ?? 0) + 1);
      if (optimistic) put(optimistic);
      try {
        const t = await call(body);
        if (t && seq.current[key] === mine) put(t);
        return t;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        // Откат: перечитываем всё с сервера, а не угадываем прошлое состояние.
        const res = await fetch('/api/admin/tracker').catch(() => null);
        const json = res?.ok ? await res.json().catch(() => null) : null;
        if (json?.tasks) setTasks(json.tasks);
        return null;
      }
    },
    [put],
  );

  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const knownTags = useMemo(() => {
    const count = new Map<string, number>();
    tasks.filter((t) => !t.archived).forEach((t) => t.tags.forEach((g) => count.set(g, (count.get(g) ?? 0) + 1)));
    return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [tasks]);
  const knownTagNames = knownTags.map(([t]) => t);

  const tree = useMemo(() => treeProgress(tasks), [tasks]);
  const withTree = useMemo(
    () => tasks.map((t) => ({ ...t, progress: tree.progress.get(t.id) ?? t.progress })),
    [tasks, tree],
  );
  const activeIds = new Set(tasks.filter((t) => !t.archived).map((t) => t.id));
  const active = withTree.filter((t) => !t.archived);
  const inner = (id: string) => tree.children.get(id)?.length ?? 0;
  const activeById = new Map(active.map((t) => [t.id, t]));
  const parentOf = (t: TaskView) => (t.parentId ? activeById.get(t.parentId) : undefined);
  const depth = (t: TaskView) => {
    let d = 0;
    for (let p = parentOf(t); p && d < 30; p = parentOf(p)) d++;
    return d;
  };
  /** Цепочку из одного звена («Финансы → 1,6 млн → 100 человек») проскакиваем до развилки. */
  const collapse = (t: TaskView): { task: TaskView; via: string[] } => {
    const via: string[] = [];
    let node = t;
    for (let i = 0; i < 30 && node.steps.length === 0; i++) {
      const kids = tree.children.get(node.id) ?? [];
      if (kids.length !== 1) break;
      via.push(node.title);
      node = activeById.get(kids[0].id) ?? node;
    }
    return { task: node, via };
  };
  // Главная = то, что делать: задачи без вложенных, с любого уровня. Пустые области
  // сразу под целью («Путешествия» без шагов) задачами не считаются.
  const goals = active.filter((t) => !parentOf(t) && inner(t.id) > 0);
  // Задачи с карты запуска на главной только свои для этой недели (и несделанные хвосты),
  // остальные живут на карте и открываются там уровнями.
  const thisWeek = mondayOf(todayLocal());
  // Регулярные и задачи без недели не прячем.
  const onMapLater = (t: TaskView) =>
    !!t.map &&
    t.kind !== 'routine' &&
    (t.map.later || (!!t.map.week && (t.map.week > thisWeek || (t.map.week < thisWeek && t.progress >= 1))));
  const shown = tagFilter
    ? active.filter((t) => t.tags.includes(tagFilter))
    : active.filter((t) => inner(t.id) === 0 && !(t.steps.length === 0 && depth(t) === 1) && !onMapLater(t));
  const where = (t: TaskView) => parentOf(t)?.title;

  async function reload() {
    const res = await fetch('/api/admin/tracker').catch(() => null);
    const json = res?.ok ? await res.json().catch(() => null) : null;
    if (json?.tasks) setTasks(json.tasks);
  }

  /** «Сделал задачу»: сразу заряжаем её и всё внутри, потом сверяемся с сервером. */
  async function complete(id: string, done: boolean) {
    const ids = new Set([id]);
    for (let grew = true; grew; ) {
      grew = false;
      for (const t of tasks) {
        if (!t.archived && t.parentId && ids.has(t.parentId) && !ids.has(t.id)) {
          ids.add(t.id);
          grew = true;
        }
      }
    }
    setError(null);
    setTasks((all) =>
      all.map((t) =>
        ids.has(t.id) ? recompute({ ...t, doneWhole: done, steps: t.steps.map((x) => ({ ...x, done })) }) : t,
      ),
    );
    try {
      await call({ action: 'completeTask', id, done });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    reload();
  }
  const routines = shown.filter((t) => t.kind === 'routine');
  const quests = shown.filter((t) => t.kind === 'quest');
  const archived = withTree.filter((t) => t.archived);
  const current = openId ? withTree.find((t) => t.id === openId) : undefined;

  if (current) {
    return (
      <div className={styles.page}>
        {error && <div className={styles.error}>{error}</div>}
        <TaskInside
          key={current.id}
          task={current}
          all={withTree}
          kids={(tree.children.get(current.id) ?? []).map((k) => withTree.find((x) => x.id === k.id)!)}
          inner={inner}
          collapse={collapse}
          onComplete={(done) => complete(current.id, done)}
          knownTags={knownTagNames}
          run={run}
          onOpen={open}
          map={map}
          onDeleted={() => {
            open(current.parentId && activeIds.has(current.parentId) ? current.parentId : null);
            reload();
          }}
        />
      </div>
    );
  }

  const routinesDone = routines.filter((t) => t.progress >= 1).length;
  const questsLeft = quests.filter((t) => t.progress < 1).length;

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>ТРЕКЕР</h1>
      <div className={styles.sub}>
        Регулярные: {routinesDone}/{routines.length} заряжено · квестов в работе: {questsLeft}
      </div>
      {error && <div className={styles.error}>{error}</div>}

      {map && (
        <Link href="/admin/treker/karta" className={styles.mapLink}>
          <span className={styles.mapLinkIcon}>🗺</span>
          <span>
            <b>Карта запуска</b>
            <span className={styles.mapLinkSub}>{map.title} · {shortDate(map.deadline)}</span>
          </span>
          <span className={styles.mapLinkGo}>→</span>
        </Link>
      )}

      <div className={styles.toolbar}>
        <PhotoImport
          knownTags={knownTagNames}
          onCreate={async (t) => !!(await run({ action: 'createTask', ...t }))}
        />
      </div>

      {knownTags.length > 0 && (
        <div className={styles.filters}>
          <button
            type="button"
            className={`${styles.tag} ${styles.tagAll} ${tagFilter ? '' : styles.tagOn}`}
            onClick={() => setTagFilter(null)}
          >
            все <span className={styles.tagCount}>{active.filter((t) => inner(t.id) === 0 && !(t.steps.length === 0 && depth(t) === 1)).length}</span>
          </button>
          {knownTags.map(([t, n]) => (
            <TagChip
              key={t}
              tag={t}
              count={n}
              active={tagFilter === t}
              onClick={() => setTagFilter(tagFilter === t ? null : t)}
            />
          ))}
        </div>
      )}

      {goals.length > 0 && !tagFilter && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.h2}>Цели</h2>
            <span className={styles.hint}>заряжаются от всего, что внутри</span>
          </div>
          <div className={styles.grid}>
            {goals.map((g) => (
              <TaskCard key={g.id} task={g} inner={inner(g.id)} onOpen={open} />
            ))}
          </div>
        </section>
      )}

      <Section
        title="Регулярные"
        hint="сами сбрасываются в новый день, неделю или месяц"
        tasks={routines}
        knownTags={knownTagNames}
        defaultTag={tagFilter}
        kind="routine"
        adding={adding === 'routine'}
        onAdd={() => setAdding('routine')}
        onCancel={() => setAdding(null)}
        onOpen={open}
        inner={inner}
        where={where}
        onCreate={async (body) => {
          const t = await run({ action: 'createTask', kind: 'routine', ...body });
          if (t) setAdding(null);
        }}
      />

      <Section
        title="Квесты"
        hint="разовые: круг заряжается шаг за шагом"
        tasks={quests}
        knownTags={knownTagNames}
        defaultTag={tagFilter}
        kind="quest"
        adding={adding === 'quest'}
        onAdd={() => setAdding('quest')}
        onCancel={() => setAdding(null)}
        onOpen={open}
        inner={inner}
        where={where}
        onCreate={async (body) => {
          const t = await run({ action: 'createTask', kind: 'quest', ...body });
          if (t) setAdding(null);
        }}
      />

      {archived.length > 0 && (
        <details className={styles.archive}>
          <summary className={styles.archiveSummary}>Архив · {archived.length}</summary>
          <div className={styles.grid}>
            {archived.map((t) => (
              <TaskCard key={t.id} task={t} onOpen={open} small />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  tasks,
  knownTags,
  defaultTag,
  kind,
  adding,
  onAdd,
  onCancel,
  onOpen,
  inner,
  where,
  onCreate,
}: {
  title: string;
  hint: string;
  tasks: TaskView[];
  knownTags: string[];
  defaultTag: string | null;
  kind: Kind;
  adding: boolean;
  onAdd: () => void;
  onCancel: () => void;
  onOpen: (id: string) => void;
  inner: (id: string) => number;
  where: (t: TaskView) => string | undefined;
  onCreate: (body: { title: string; period?: Period; note?: string; tags: string[]; steps: string[] }) => Promise<void>;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.h2}>{title}</h2>
        <span className={styles.hint}>{hint}</span>
      </div>
      <div className={styles.grid}>
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} inner={inner(t.id)} where={where(t)} onOpen={onOpen} />
        ))}
        {adding ? (
          <NewTask kind={kind} knownTags={knownTags} defaultTag={defaultTag} onCancel={onCancel} onCreate={onCreate} />
        ) : (
          <button type="button" className={styles.addCard} onClick={onAdd}>
            <span className={styles.addRing}>+</span>
            <span className={styles.cardTitle}>{kind === 'quest' ? 'Новый квест' : 'Новая регулярная'}</span>
          </button>
        )}
      </div>
    </section>
  );
}

function TaskCard({
  task,
  onOpen,
  small,
  inner = 0,
  where,
}: {
  task: TaskView;
  onOpen: (id: string) => void;
  small?: boolean;
  inner?: number;
  /** Откуда задача: родитель или проскоченная цепочка. */
  where?: string;
}) {
  const full = task.progress >= 1;
  return (
    <button type="button" className={styles.card} onClick={() => onOpen(task.id)}>
      <Ring
        progress={task.progress}
        size={small ? 72 : 112}
        label={full ? '✓' : pct(task.progress)}
        sub={small ? undefined : inner ? `${inner} внутри` : counts(task)}
      />
      <span className={styles.cardTitle}>{task.title}</span>
      {where && !small && <span className={styles.cardWhere}>{where}</span>}
      {task.tags.length > 0 && !small && (
        <span className={styles.cardTags}>
          {task.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
        </span>
      )}
      {task.kind === 'routine' && task.period && !small && (
        <span className={styles.cardMeta}>
          {PERIOD_NOW[task.period]}
          {!full && task.timeLeft ? ` · ещё ${task.timeLeft}` : ''}
        </span>
      )}
    </button>
  );
}

function NewTask({
  kind,
  knownTags,
  defaultTag,
  onCancel,
  onCreate,
}: {
  kind: Kind;
  knownTags: string[];
  defaultTag: string | null;
  onCancel: () => void;
  onCreate: (body: { title: string; period?: Period; note?: string; tags: string[]; steps: string[] }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState<Period>('day');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>(defaultTag ? [defaultTag] : []);
  const [manual, setManual] = useState(false);
  const [steps, setSteps] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    await onCreate({
      title,
      period: kind === 'routine' ? period : undefined,
      note: note.trim() || undefined,
      tags,
      steps: manual ? steps.split('\n').map((s) => s.trim()).filter(Boolean) : [],
    });
    setBusy(false);
  }

  return (
    <form className={styles.newTask} onSubmit={submit}>
      <input
        className={styles.input}
        autoFocus
        placeholder={kind === 'quest' ? 'Что за квест' : 'Что делаем регулярно'}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
      />
      {kind === 'routine' && (
        <div className={styles.periods}>
          {(['day', 'week', 'month'] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.chip} ${period === p ? styles.chipOn : ''}`}
              onClick={() => setPeriod(p)}
            >
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>
      )}
      <textarea
        className={styles.textarea}
        rows={2}
        placeholder="Пара слов контекста, если надо (для кого, к какому сроку, что уже есть)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <TagEditor tags={tags} known={knownTags} onChange={setTags} />
      {manual ? (
        <textarea
          className={styles.textarea}
          rows={4}
          placeholder="Шаги, по одному на строку"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
        />
      ) : (
        <div className={styles.hint}>
          Шаги разложит нейронка, потом их можно поправить.{' '}
          <button type="button" className={styles.linkBtn} onClick={() => setManual(true)}>
            Вписать самому
          </button>
        </div>
      )}
      <div className={styles.formRow}>
        <button type="submit" className={styles.primary} disabled={!title.trim() || busy}>
          {busy ? (manual ? 'Создаю…' : 'Раскладываю на шаги…') : 'Создать'}
        </button>
        <button type="button" className={styles.ghost} onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}

function TaskInside({
  task,
  all,
  kids,
  inner,
  collapse,
  onComplete,
  knownTags,
  run,
  onOpen,
  map,
  onDeleted,
}: {
  map: MapView | null;
  task: TaskView;
  all: TaskView[];
  kids: TaskView[];
  inner: (id: string) => number;
  collapse: (t: TaskView) => { task: TaskView; via: string[] };
  onComplete: (done: boolean) => void;
  knownTags: string[];
  run: (body: Record<string, unknown>, optimistic?: TaskView) => Promise<TaskView | null>;
  onOpen: (id: string | null) => void;
  onDeleted: () => void;
}) {
  const [addingKid, setAddingKid] = useState<Kind | null>(null);
  const byId = useMemo(() => new Map(all.map((t) => [t.id, t])), [all]);
  // Путь наверх: «Жизнь мечты › Финансы › …»
  const path = useMemo(() => {
    const out: TaskView[] = [];
    for (let p = task.parentId ? byId.get(task.parentId) : undefined, i = 0; p && i < 30; p = p.parentId ? byId.get(p.parentId) : undefined, i++) {
      if (!p.archived) out.unshift(p);
    }
    return out;
  }, [task.parentId, byId]);
  // Куда можно перенести: всё, кроме самой задачи и её потомков.
  const moveTargets = useMemo(() => {
    const banned = new Set([task.id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const t of all) {
        if (t.parentId && banned.has(t.parentId) && !banned.has(t.id)) {
          banned.add(t.id);
          grew = true;
        }
      }
    }
    const depth = (t: TaskView) => {
      let d = 0;
      for (let p = t.parentId ? byId.get(t.parentId) : undefined; p && d < 30; p = p.parentId ? byId.get(p.parentId) : undefined) d++;
      return d;
    };
    // Порядок дерева: родитель, под ним дети с отступом.
    const out: { id: string; label: string }[] = [];
    const walk = (parent: string | null) => {
      all
        .filter((t) => !t.archived && !banned.has(t.id) && (t.parentId ?? null) === parent)
        .forEach((t) => {
          out.push({ id: t.id, label: `${'  '.repeat(depth(t))}${t.title}` });
          walk(t.id);
        });
    };
    walk(null);
    return out;
  }, [all, byId, task.id]);
  const kidsDone = kids.filter((k) => k.progress >= 1).length;
  const [newStep, setNewStep] = useState('');
  const [note, setNote] = useState(task.note ?? '');
  const [editingTitle, setEditingTitle] = useState(false);
  const stepInput = useRef<HTMLInputElement>(null);
  const full = task.progress >= 1;
  const doneCount = task.steps.filter((s) => s.done).length;

  const [thinking, setThinking] = useState<'finer' | 'coarser' | null>(null);

  async function suggest(coarser = false) {
    const undone = task.steps.filter((s) => !s.done).length;
    const q = coarser
      ? `Укрупнить ${undone} несделанных шагов: склеить мелкие технические в соседние? Сделанные останутся.`
      : `Раздробить ${undone} несделанных шагов мельче? Сделанные останутся.`;
    if (undone && !window.confirm(q)) return;
    setThinking(coarser ? 'coarser' : 'finer');
    await run({ action: 'suggestSteps', id: task.id, coarser });
    setThinking(null);
  }

  const nextStep = useMemo(() => task.steps.find((s) => !s.done), [task.steps]);

  function toggle(stepId: string, done: boolean) {
    const optimistic = recompute(
      stepId === ''
        ? { ...task, doneWhole: done }
        : { ...task, steps: task.steps.map((s) => (s.id === stepId ? { ...s, done } : s)) },
    );
    run({ action: 'toggle', taskId: task.id, stepId, done }, optimistic);
  }

  async function addStep(e: React.FormEvent) {
    e.preventDefault();
    const title = newStep.trim();
    if (!title) return;
    setNewStep('');
    await run({ action: 'addStep', taskId: task.id, title });
    stepInput.current?.focus();
  }

  return (
    <div className={styles.inside}>
      <nav className={styles.crumbs} aria-label="Путь">
        <button type="button" className={styles.crumb} onClick={() => onOpen(null)}>
          Все
        </button>
        {path.map((p) => (
          <span key={p.id} className={styles.crumbItem}>
            <span className={styles.crumbSep}>›</span>
            <button type="button" className={styles.crumb} onClick={() => onOpen(p.id)}>
              {p.title}
            </button>
          </span>
        ))}
      </nav>

      <div className={styles.hero}>
        <div className={styles.heroRing}>
          <Ring
            progress={task.progress}
            size={200}
            stroke={12}
            label={full ? '✓' : pct(task.progress)}
            sub={
              kids.length
                ? `${kidsDone} из ${kids.length} внутри${task.steps.length ? ` · ${doneCount}/${task.steps.length} шагов` : ''}`
                : task.steps.length
                  ? `${doneCount} из ${task.steps.length} шагов`
                  : full
                    ? 'готово'
                    : 'без шагов'
            }
          />
        </div>
        <div className={styles.heroText}>
          <div className={styles.kind}>
            {task.kind === 'quest' ? 'Квест' : `Регулярная · ${task.period ? PERIOD_LABEL[task.period] : ''}`}
            {task.kind === 'routine' && task.timeLeft && !full ? ` · до сброса ${task.timeLeft}` : ''}
          </div>
          {editingTitle ? (
            <input
              className={`${styles.input} ${styles.titleInput}`}
              autoFocus
              defaultValue={task.title}
              maxLength={200}
              onBlur={(e) => {
                setEditingTitle(false);
                const v = e.target.value.trim();
                if (v && v !== task.title) run({ action: 'updateTask', id: task.id, title: v }, { ...task, title: v });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                if (e.key === 'Escape') setEditingTitle(false);
              }}
            />
          ) : (
            <h1 className={styles.title} onClick={() => setEditingTitle(true)} title="Нажми, чтобы переименовать">
              {task.title}
            </h1>
          )}
          <TagEditor
            tags={task.tags}
            known={knownTags}
            onChange={(tags) => run({ action: 'setTags', id: task.id, tags }, { ...task, tags })}
          />
          {full ? (
            <button
              type="button"
              className={styles.undoBtn}
              onClick={() => {
                const what = kids.length ? 'все шаги и задачи внутри' : 'все шаги';
                if (window.confirm(`Вернуть в работу? Снимутся отметки: ${what}.`)) onComplete(false);
              }}
            >
              ✓ Сделано · вернуть в работу
            </button>
          ) : (
            <button type="button" className={styles.doneBtn} onClick={() => onComplete(true)}>
              ✓{' '}
              {task.kind === 'routine' && task.period
                ? { day: 'Сделал на сегодня', week: 'Сделал на эту неделю', month: 'Сделал в этом месяце' }[task.period]
                : 'Сделал задачу'}
            </button>
          )}
          {nextStep && !full && <div className={styles.next}>Следующий шаг: {nextStep.title}</div>}
          {task.kind === 'routine' && task.period && (
            <div className={styles.periods}>
              {(['day', 'week', 'month'] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.chip} ${task.period === p ? styles.chipOn : ''}`}
                  onClick={() => p !== task.period && run({ action: 'updateTask', id: task.id, period: p })}
                >
                  {PERIOD_LABEL[p]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {task.history.length > 0 && (
        <div className={styles.history}>
          <div className={styles.label}>Последние {task.history.length}</div>
          <div className={styles.historyRow}>
            {task.history.map((h, i) => (
              <div key={h.key} className={styles.historyItem} title={h.key}>
                <Ring progress={h.progress} size={26} stroke={4} />
                {i === task.history.length - 1 && <span className={styles.historyNow}>{PERIOD_NOW[task.period!]}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {kids.length > 0 || addingKid ? (
        <>
          <div className={styles.label}>Внутри</div>
          <div className={`${styles.grid} ${styles.kidsGrid}`}>
            {kids.map((k) => {
              const c = collapse(k);
              return (
                <TaskCard
                  key={k.id}
                  task={c.task}
                  inner={inner(c.task.id)}
                  where={c.via.length ? c.via.join(' › ') : undefined}
                  onOpen={(id) => onOpen(id)}
                />
              );
            })}
            {addingKid ? (
              <NewTask
                kind={addingKid}
                knownTags={knownTags}
                defaultTag={null}
                onCancel={() => setAddingKid(null)}
                onCreate={async (body) => {
                  const t = await run({ action: 'createTask', kind: addingKid, parentId: task.id, ...body });
                  if (t) setAddingKid(null);
                }}
              />
            ) : (
              <div className={styles.addKid}>
                <button type="button" className={styles.ghost} onClick={() => setAddingKid('quest')}>
                  + квест внутрь
                </button>
                <button type="button" className={styles.ghost} onClick={() => setAddingKid('routine')}>
                  + регулярная внутрь
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        // У обычной задачи пустой блок «Внутри» не нужен: одна тихая строка.
        <div className={styles.addKidInline}>
          <button type="button" className={styles.linkBtn} onClick={() => setAddingKid('quest')}>
            + задача внутрь
          </button>
          <span className={styles.hint}>круг будет заряжаться и от неё</span>
        </div>
      )}

      <div className={styles.stepsHead}>
        <div className={styles.label}>Шаги</div>
        <span className={styles.aiBtns}>
          {task.steps.filter((s) => !s.done).length > 1 && (
            <button type="button" className={styles.aiBtn} onClick={() => suggest(true)} disabled={!!thinking}>
              {thinking === 'coarser' ? 'Склеиваю…' : 'Укрупнить'}
            </button>
          )}
          <button type="button" className={styles.aiBtn} onClick={() => suggest(false)} disabled={!!thinking}>
            {thinking === 'finer' ? 'Раскладываю…' : task.steps.length ? '✨ Раздробить мельче' : '✨ Разбить на шаги'}
          </button>
        </span>
      </div>
      {task.steps.length === 0 && (
        <button
          type="button"
          className={`${styles.wholeBtn} ${task.doneWhole ? styles.wholeOn : ''}`}
          onClick={() => toggle('', !task.doneWhole)}
        >
          {task.doneWhole ? '✓ Сделано' : 'Отметить сделанным'}
        </button>
      )}
      <StepList
        steps={task.steps}
        onToggle={(s) => toggle(s.id, !s.done)}
        onRename={(id, title) =>
          run(
            { action: 'updateStep', id, title },
            { ...task, steps: task.steps.map((x) => (x.id === id ? { ...x, title } : x)) },
          )
        }
        onReorder={(ids) => {
          const byId = new Map(task.steps.map((x) => [x.id, x]));
          run(
            { action: 'reorderSteps', taskId: task.id, ids },
            { ...task, steps: ids.map((id) => byId.get(id)!).filter(Boolean) },
          );
        }}
        onSplit={(id) => run({ action: 'splitStep', id })}
        onDelete={(id) =>
          run({ action: 'deleteStep', id }, recompute({ ...task, steps: task.steps.filter((x) => x.id !== id) }))
        }
      />
      <form className={styles.addStep} onSubmit={addStep}>
        <input
          ref={stepInput}
          className={styles.input}
          placeholder="+ шаг (Enter, чтобы добавить)"
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          maxLength={300}
        />
      </form>

      <div className={styles.label}>Заметка</div>
      <textarea
        className={styles.textarea}
        rows={3}
        placeholder="Ссылки, контекст, на чём остановился"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => {
          if (note !== (task.note ?? '')) run({ action: 'updateTask', id: task.id, note }, { ...task, note });
        }}
      />

      <div className={styles.moveRow}>
        <span className={styles.label}>Лежит внутри</span>
        <select
          className={styles.select}
          value={task.parentId && byId.has(task.parentId) ? task.parentId : ''}
          onChange={(e) =>
            run({ action: 'setParent', id: task.id, parentId: e.target.value || null }, { ...task, parentId: e.target.value || null })
          }
        >
          <option value="">— на главном экране —</option>
          {moveTargets.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {map && <OnMap task={task} map={map} run={run} />}

      <div className={styles.footer}>
        <button type="button" className={styles.ghost} onClick={() => run({ action: 'moveTask', id: task.id, dir: -1 })}>
          ← левее
        </button>
        <button type="button" className={styles.ghost} onClick={() => run({ action: 'moveTask', id: task.id, dir: 1 })}>
          правее →
        </button>
        <button
          type="button"
          className={styles.ghost}
          onClick={() => run({ action: 'archiveTask', id: task.id, archived: !task.archived })}
        >
          {task.archived ? 'Вернуть из архива' : 'В архив'}
        </button>
        <button
          type="button"
          className={styles.danger}
          onClick={async () => {
            const q = kids.length
              ? `Удалить «${task.title}» с шагами? ${kids.length} задач внутри поднимутся на уровень выше.`
              : `Удалить «${task.title}» вместе с шагами?`;
            if (!window.confirm(q)) return;
            const res = await fetch('/api/admin/tracker', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'deleteTask', id: task.id }),
            });
            if (res.ok) onDeleted();
          }}
        >
          Удалить
        </button>
      </div>
    </div>
  );
}

type Step = { id: string; title: string; done: boolean };

type Drag = {
  id: string;
  pointerId: number;
  startY: number;
  dy: number;
  /** Строка уже поехала (мышь сдвинулась дальше порога). */
  active: boolean;
  tops: number[];
  heights: number[];
  gap: number;
};

const DRAG_THRESHOLD = 5;

/** Новый порядок, пока тянем: куда встал перетаскиваемый шаг. */
function dragOrder(steps: Step[], d: Drag): string[] {
  const from = steps.findIndex((s) => s.id === d.id);
  const center = d.tops[from] + d.heights[from] / 2 + d.dy;
  const others = steps.filter((s) => s.id !== d.id);
  let index = 0;
  steps.forEach((s, i) => {
    if (s.id !== d.id && d.tops[i] + d.heights[i] / 2 < center) index++;
  });
  const ids = others.map((s) => s.id);
  ids.splice(index, 0, d.id);
  return ids;
}

/**
 * Шаги, которые тянутся мышкой за любое место строки, а пальцем за ручку ⠿
 * (иначе строка перехватывала бы прокрутку на телефоне). Пока тянем, DOM не
 * меняется: строки только сдвигаются transform-ом, порядок пишется на отпускании.
 */
function StepList({
  steps,
  onToggle,
  onRename,
  onReorder,
  onSplit,
  onDelete,
}: {
  steps: Step[];
  onToggle: (s: Step) => void;
  onRename: (id: string, title: string) => void;
  onReorder: (ids: string[]) => void;
  onSplit: (id: string) => Promise<unknown>;
  onDelete: (id: string) => void;
}) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const [settling, setSettling] = useState(false);
  const refs = useRef(new Map<string, HTMLLIElement>());
  const justDragged = useRef(false);

  const order = drag?.active ? dragOrder(steps, drag) : null;

  function offset(id: string, i: number): number {
    if (!drag?.active || !order) return 0;
    if (id === drag.id) return drag.dy;
    const k = order.indexOf(id);
    let top = drag.tops[0];
    for (let j = 0; j < k; j++) top += drag.heights[steps.findIndex((s) => s.id === order[j])] + drag.gap;
    return top - drag.tops[i];
  }

  function onPointerDown(e: React.PointerEvent<HTMLLIElement>, id: string) {
    const t = e.target as HTMLElement;
    const onHandle = !!t.closest('[data-handle]');
    if (e.button !== 0) return;
    if (!onHandle && (e.pointerType !== 'mouse' || t.closest('button, input, textarea'))) return;
    const rects = steps.map((s) => refs.current.get(s.id)!.getBoundingClientRect());
    setDrag({
      id,
      pointerId: e.pointerId,
      startY: e.clientY,
      dy: 0,
      active: onHandle,
      tops: rects.map((r) => r.top),
      heights: rects.map((r) => r.height),
      gap: rects.length > 1 ? rects[1].top - rects[0].bottom : 6,
    });
    // Захват только у ручки: на строке он ломал бы клик по тексту (правка шага).
    if (onHandle) {
      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const dy = e.clientY - drag.startY;
    const active = drag.active || Math.abs(dy) > DRAG_THRESHOLD;
    if (active && !drag.active) {
      window.getSelection()?.removeAllRanges();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    setDrag({ ...drag, dy, active });
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    if (drag.active) {
      justDragged.current = true;
      setTimeout(() => (justDragged.current = false), 0);
      const ids = dragOrder(steps, drag);
      // Без анимации на кадр смены порядка, иначе строки прыгают из старых мест.
      setSettling(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setSettling(false)));
      if (ids.some((id, i) => id !== steps[i].id)) onReorder(ids);
    }
    setDrag(null);
  }

  function onKeyMove(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const ids = steps.map((s) => s.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    onReorder(ids);
  }

  return (
    <ol className={`${styles.steps} ${drag?.active ? styles.stepsDragging : ''} ${settling ? styles.stepsSettling : ''}`}>
      {steps.map((s, i) => (
        <StepRow
          key={s.id}
          step={s}
          liRef={(el) => {
            if (el) refs.current.set(s.id, el);
            else refs.current.delete(s.id);
          }}
          lifted={drag?.active === true && drag.id === s.id}
          y={offset(s.id, i)}
          onPointerDown={(e) => onPointerDown(e, s.id)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClickCapture={(e) => {
            if (justDragged.current) {
              justDragged.current = false;
              e.stopPropagation();
              e.preventDefault();
            }
          }}
          onHandleKey={(dir) => onKeyMove(i, dir)}
          onToggle={() => onToggle(s)}
          onRename={(title) => onRename(s.id, title)}
          onSplit={() => onSplit(s.id)}
          onDelete={() => onDelete(s.id)}
        />
      ))}
    </ol>
  );
}

function StepRow({
  step,
  liRef,
  lifted,
  y,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onClickCapture,
  onHandleKey,
  onToggle,
  onRename,
  onSplit,
  onDelete,
}: {
  step: Step;
  liRef: (el: HTMLLIElement | null) => void;
  lifted: boolean;
  y: number;
  onPointerDown: (e: React.PointerEvent<HTMLLIElement>) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onClickCapture: (e: React.MouseEvent) => void;
  onHandleKey: (dir: -1 | 1) => void;
  onToggle: () => void;
  onRename: (title: string) => void;
  onSplit: () => Promise<unknown>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [splitting, setSplitting] = useState(false);
  return (
    <li
      ref={liRef}
      className={`${styles.step} ${step.done ? styles.stepDone : ''} ${lifted ? styles.stepLifted : ''}`}
      style={y ? { transform: `translateY(${y}px)` } : undefined}
      onPointerDown={editing ? undefined : onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
    >
      <span
        className={styles.handle}
        data-handle
        role="button"
        tabIndex={0}
        aria-label="Перетащить шаг (стрелки вверх и вниз)"
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            onHandleKey(-1);
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            onHandleKey(1);
          }
        }}
      >
        ⠿
      </span>
      <button
        type="button"
        className={styles.check}
        onClick={onToggle}
        aria-label={step.done ? 'Снять отметку' : 'Отметить шаг'}
        aria-pressed={step.done}
      >
        <span className={styles.checkDot} />
      </button>
      {editing ? (
        <input
          className={`${styles.input} ${styles.stepInput}`}
          autoFocus
          defaultValue={step.title}
          maxLength={300}
          onBlur={(e) => {
            setEditing(false);
            const v = e.target.value.trim();
            if (v && v !== step.title) onRename(v);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            if (e.key === 'Escape') setEditing(false);
          }}
        />
      ) : (
        <span className={styles.stepTitle} onClick={() => setEditing(true)}>
          {step.title}
        </span>
      )}
      <span className={`${styles.stepTools} ${splitting ? styles.stepToolsBusy : ''}`}>
        <button
          type="button"
          disabled={splitting}
          title="Раздробить этот шаг мельче"
          aria-label="Раздробить шаг мельче"
          onClick={async () => {
            setSplitting(true);
            await onSplit();
            setSplitting(false);
          }}
        >
          {splitting ? '…' : '✂'}
        </button>
        <button type="button" onClick={onDelete} aria-label="Удалить шаг">
          ✕
        </button>
      </span>
    </li>
  );
}

/** Где задача на карте запуска: шаг пути клиента, неделя и «к запуску / потом». */
function OnMap({
  task,
  map,
  run,
}: {
  task: TaskView;
  map: MapView;
  run: (body: Record<string, unknown>, optimistic?: TaskView) => Promise<TaskView | null>;
}) {
  const m = task.map;
  const weeks = weeksUntil(mondayOf(todayLocal()), map.deadline);
  if (m?.week && !weeks.includes(m.week)) weeks.unshift(m.week);
  const set = (next: { stage: string | null; later?: boolean; week?: string | null; move?: string | null }) =>
    run(
      { action: 'setMap', id: task.id, ...next },
      {
        ...task,
        map: next.stage
          ? { stage: next.stage, later: !!next.later, week: next.week ?? null, move: next.move ?? m?.move ?? null }
          : null,
      },
    );
  return (
    <div className={styles.moveRow}>
      <span className={styles.label}>На карте</span>
      <select
        className={styles.select}
        value={m?.stage ?? ''}
        onChange={(e) => set({ stage: e.target.value || null, later: m?.later, week: m?.week })}
      >
        <option value="">— не на карте —</option>
        {map.stages.map((s) => (
          <option key={s.key} value={s.key}>
            {s.title}
          </option>
        ))}
      </select>
      {m && (
        <>
          <select
            className={styles.select}
            value={m.later ? 'later' : (m.week ?? '')}
            onChange={(e) =>
              e.target.value === 'later'
                ? set({ stage: m.stage, later: true, week: null })
                : set({ stage: m.stage, later: false, week: e.target.value || null })
            }
          >
            <option value="">к запуску, без недели</option>
            {weeks.map((w) => (
              <option key={w} value={w}>
                неделя {shortDate(w)}
              </option>
            ))}
            <option value="later">потом, после запуска</option>
          </select>
          <input
            key={m.move ?? ''}
            className={styles.select}
            defaultValue={m.move ?? ''}
            placeholder="что это даёт счёту"
            onBlur={(e) => {
              if (e.target.value.trim() !== (m.move ?? '')) set({ ...m, move: e.target.value });
            }}
          />
        </>
      )}
    </div>
  );
}
