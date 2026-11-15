'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TaskView } from '@/lib/tracker/data';
import type { Period } from '@/lib/tracker/periods';
import Ring from './Ring';
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

export default function TrekerClient({
  initialTasks,
  initialOpen,
}: {
  initialTasks: TaskView[];
  initialOpen: string | null;
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
      const key = String(optimistic?.id ?? body.taskId ?? body.id ?? 'new');
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

  const active = tasks.filter((t) => !t.archived);
  const routines = active.filter((t) => t.kind === 'routine');
  const quests = active.filter((t) => t.kind === 'quest');
  const archived = tasks.filter((t) => t.archived);
  const current = openId ? tasks.find((t) => t.id === openId) : undefined;

  if (current) {
    return (
      <div className={styles.page}>
        {error && <div className={styles.error}>{error}</div>}
        <TaskInside
          key={current.id}
          task={current}
          run={run}
          onBack={() => open(null)}
          onDeleted={() => {
            setTasks((all) => all.filter((x) => x.id !== current.id));
            open(null);
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

      <Section
        title="Регулярные"
        hint="сами сбрасываются в новый день, неделю или месяц"
        tasks={routines}
        kind="routine"
        adding={adding === 'routine'}
        onAdd={() => setAdding('routine')}
        onCancel={() => setAdding(null)}
        onOpen={open}
        onCreate={async (body) => {
          const t = await run({ action: 'createTask', kind: 'routine', ...body });
          if (t) setAdding(null);
        }}
      />

      <Section
        title="Квесты"
        hint="разовые: круг заряжается шаг за шагом"
        tasks={quests}
        kind="quest"
        adding={adding === 'quest'}
        onAdd={() => setAdding('quest')}
        onCancel={() => setAdding(null)}
        onOpen={open}
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
  kind,
  adding,
  onAdd,
  onCancel,
  onOpen,
  onCreate,
}: {
  title: string;
  hint: string;
  tasks: TaskView[];
  kind: Kind;
  adding: boolean;
  onAdd: () => void;
  onCancel: () => void;
  onOpen: (id: string) => void;
  onCreate: (body: { title: string; period?: Period; note?: string; steps: string[] }) => Promise<void>;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.h2}>{title}</h2>
        <span className={styles.hint}>{hint}</span>
      </div>
      <div className={styles.grid}>
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onOpen={onOpen} />
        ))}
        {adding ? (
          <NewTask kind={kind} onCancel={onCancel} onCreate={onCreate} />
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

function TaskCard({ task, onOpen, small }: { task: TaskView; onOpen: (id: string) => void; small?: boolean }) {
  const full = task.progress >= 1;
  return (
    <button type="button" className={styles.card} onClick={() => onOpen(task.id)}>
      <Ring
        progress={task.progress}
        size={small ? 72 : 112}
        label={full ? '✓' : pct(task.progress)}
        sub={small ? undefined : counts(task)}
      />
      <span className={styles.cardTitle}>{task.title}</span>
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
  onCancel,
  onCreate,
}: {
  kind: Kind;
  onCancel: () => void;
  onCreate: (body: { title: string; period?: Period; note?: string; steps: string[] }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState<Period>('day');
  const [note, setNote] = useState('');
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
  run,
  onBack,
  onDeleted,
}: {
  task: TaskView;
  run: (body: Record<string, unknown>, optimistic?: TaskView) => Promise<TaskView | null>;
  onBack: () => void;
  onDeleted: () => void;
}) {
  const [newStep, setNewStep] = useState('');
  const [note, setNote] = useState(task.note ?? '');
  const [editingTitle, setEditingTitle] = useState(false);
  const stepInput = useRef<HTMLInputElement>(null);
  const full = task.progress >= 1;
  const doneCount = task.steps.filter((s) => s.done).length;

  const [thinking, setThinking] = useState(false);

  async function suggest() {
    const undone = task.steps.filter((s) => !s.done).length;
    if (undone && !window.confirm(`Заменить ${undone} несделанных шагов новыми? Сделанные останутся.`)) return;
    setThinking(true);
    await run({ action: 'suggestSteps', id: task.id });
    setThinking(false);
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
      <button type="button" className={styles.back} onClick={onBack}>
        ← Все задачи
      </button>

      <div className={styles.hero}>
        <div className={styles.heroRing}>
          <Ring
            progress={task.progress}
            size={200}
            stroke={12}
            label={full ? '✓' : pct(task.progress)}
            sub={task.steps.length ? `${doneCount} из ${task.steps.length} шагов` : full ? 'готово' : 'без шагов'}
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
          {nextStep && <div className={styles.next}>Следующий шаг: {nextStep.title}</div>}
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

      <div className={styles.stepsHead}>
        <div className={styles.label}>Шаги</div>
        <button type="button" className={styles.aiBtn} onClick={suggest} disabled={thinking}>
          {thinking ? 'Раскладываю…' : task.steps.length ? '✨ Пересобрать несделанные' : '✨ Разбить на шаги'}
        </button>
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
            if (!window.confirm(`Удалить «${task.title}» вместе с шагами?`)) return;
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
  onDelete,
}: {
  steps: Step[];
  onToggle: (s: Step) => void;
  onRename: (id: string, title: string) => void;
  onReorder: (ids: string[]) => void;
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
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
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
      <span className={styles.stepTools}>
        <button type="button" onClick={onDelete} aria-label="Удалить шаг">
          ✕
        </button>
      </span>
    </li>
  );
}
