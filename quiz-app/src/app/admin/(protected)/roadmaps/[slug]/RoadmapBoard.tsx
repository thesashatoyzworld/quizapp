'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../roadmap.module.css';

// Редактор одной карты. Всё правится на месте: клик по статусу ступени,
// галочка на задаче, цифра в панели. Сохранение сразу, без кнопки «применить».

interface Metric { id: string; key: string; label: string; startValue: string; currentValue: string; unit: string; visibility: string }
interface Step { id: string; position: number; title: string; status: string; evidence: string; visibility: string }
interface Task { id: string; title: string; why: string; owner: string; status: string; dueOn: string; visibility: string }
interface Note { id: string; kind: string; body: string; source: string; happenedOn: string; visibility: string }

export interface BoardData {
  id: string;
  slug: string;
  goal: string;
  periodGoal: string;
  returned: number;
  clientVisible: boolean;
  clientIntro: string;
  hasTelegram: boolean;
  metrics: Metric[];
  steps: Step[];
  tasks: Task[];
  notes: Note[];
}

const STEP_CYCLE = ['todo', 'partial', 'done', 'blocked'] as const;
const STEP_LABEL: Record<string, string> = { done: 'пройден', partial: 'частично', blocked: 'стоим здесь', todo: 'впереди' };
const KIND_LABEL: Record<string, string> = { blocker: 'блокер', risk: 'риск', decision: 'решение', insight: 'наблюдение', touch: 'касание' };
const KIND_CLASS: Record<string, string> = {
  blocker: styles.kindBlocker, risk: styles.kindRisk, decision: styles.kindDecision,
  insight: styles.kindInsight, touch: styles.kindTouch,
};

export default function RoadmapBoard({ data }: { data: BoardData }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Локальные копии: правка видна сразу, ответ сервера догоняет.
  const [goal, setGoal] = useState(data.goal);
  const [periodGoal, setPeriodGoal] = useState(data.periodGoal);
  const [clientVisible, setClientVisible] = useState(data.clientVisible);
  const [clientIntro, setClientIntro] = useState(data.clientIntro);
  const [metrics, setMetrics] = useState(data.metrics);
  const [steps, setSteps] = useState(data.steps);
  const [tasks, setTasks] = useState(data.tasks);
  const [notes, setNotes] = useState(data.notes);

  const [newTask, setNewTask] = useState({ title: '', why: '', owner: 'client', dueOn: '' });
  const [newNote, setNewNote] = useState({ kind: 'insight', body: '', source: '' });

  async function send(entity: string, op: string, payload: Record<string, unknown>) {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity, op, roadmapId: data.id, ...payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'не сохранилось');
      startTransition(() => router.refresh());
      return json as { ok: true; id?: string; autoShared?: number };
    } catch (e) {
      setError(e instanceof Error ? e.message : 'не сохранилось');
      return null;
    } finally {
      setSaving(false);
    }
  }

  // Глазок на строке: видит ли её клиент в кабинете. Внутреннее по умолчанию,
  // открываем поштучно или кнопкой «открыть базовый набор».
  function EyeBtn({ visibility, onFlip }: { visibility: string; onFlip: (next: string) => void }) {
    const on = visibility === 'shared';
    return (
      <button
        className={`${styles.eye} ${on ? styles.eyeOn : ''}`}
        title={on ? 'клиент это видит' : 'только я'}
        onClick={() => onFlip(on ? 'internal' : 'shared')}
      >{on ? '◉' : '○'}</button>
    );
  }

  const sharedCount = steps.filter((s) => s.visibility === 'shared').length
    + metrics.filter((m) => m.visibility === 'shared').length
    + tasks.filter((t) => t.visibility === 'shared').length
    + notes.filter((n) => n.visibility === 'shared').length;

  // Те же правила, что и на сервере: путь целиком, цифры кроме возврата,
  // задачи клиента. Держим локальную копию в согласии с базой.
  function markDefaultsLocally() {
    setSteps((prev) => prev.map((x) => ({ ...x, visibility: 'shared' })));
    setMetrics((prev) => prev.map((x) => (x.key === 'revenue' ? x : { ...x, visibility: 'shared' })));
    setTasks((prev) => prev.map((x) => (x.owner === 'client' ? { ...x, visibility: 'shared' } : x)));
  }

  async function shareDefaults() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'roadmap', op: 'share-defaults', roadmapId: data.id }),
      });
      if (!res.ok) throw new Error('не открылось');
      markDefaultsLocally();
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'не открылось');
    } finally {
      setSaving(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const openTasks = tasks.filter((t) => t.status !== 'done' && t.status !== 'dropped');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <>
      <div className={styles.share}>
        <div className={styles.shareRow}>
          <label className={styles.shareToggle}>
            <input
              type="checkbox"
              checked={clientVisible}
              onChange={async (e) => {
                const next = e.target.checked;
                setClientVisible(next);
                const json = await send('roadmap', 'update', { id: data.id, data: { clientVisible: next } });
                // Сервер сам открывает базовый набор, если внутри всё было
                // внутренним: включённая карта не должна приезжать пустой.
                if (json?.autoShared) markDefaultsLocally();
              }}
            />
            Карта открыта клиенту
          </label>
          <span className={`${styles.shareState} ${clientVisible ? styles.shareStateOn : ''}`}>
            {clientVisible ? `видит ${sharedCount} строк` : 'в кабинете её нет'}
          </span>
          <button className={styles.btn} disabled={saving} onClick={shareDefaults}>
            открыть базовый набор
          </button>
          <a
            className={styles.shareLink}
            href={`/admin/roadmaps/${data.slug}/preview`}
            target="_blank"
            rel="noopener noreferrer"
          >посмотреть его глазами ↗</a>
        </div>
        <textarea
          className={styles.shareIntro}
          rows={2}
          value={clientIntro}
          placeholder="строка сверху карты: зачем она и что с ней делать"
          onChange={(e) => setClientIntro(e.target.value)}
          onBlur={() => clientIntro !== data.clientIntro && send('roadmap', 'update', { id: data.id, data: { clientIntro } })}
        />
        {!data.hasTelegram && (
          <div className={styles.shareWarn}>
            У карты не проставлен telegram id — клиент её не откроет: кабинет опознаёт только по нему.
          </div>
        )}
        {clientVisible && sharedCount === 0 && (
          <div className={styles.shareWarn}>
            Карта открыта, но ни одна строка не помечена глазком — человек увидит пустой экран
            из вступления и целей. Жми «открыть базовый набор».
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.h2}>КУДА ИДЁМ</span>
          <span className={styles.saveState}>
            {error ? <span style={{ color: '#ff5d73' }}>{error}</span> : saving ? 'сохраняю…' : 'сохраняется само'}
          </span>
        </div>
        <textarea
          className={styles.goal}
          rows={2}
          value={goal}
          placeholder="цель работы целиком"
          onChange={(e) => setGoal(e.target.value)}
          onBlur={() => goal !== data.goal && send('roadmap', 'update', { id: data.id, data: { goal } })}
        />
        <div style={{ height: 8 }} />
        <textarea
          className={styles.goal}
          rows={2}
          value={periodGoal}
          placeholder="цель ближайших двух недель"
          onChange={(e) => setPeriodGoal(e.target.value)}
          onBlur={() => periodGoal !== data.periodGoal && send('roadmap', 'update', { id: data.id, data: { periodGoal } })}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.h2}>ПАНЕЛЬ</span>
          <span className={styles.hint}>сверху было на старте, снизу сейчас</span>
        </div>
        <div className={styles.metrics}>
          {metrics.map((m) => (
            <div key={m.id} className={styles.metric}>
              <div className={styles.metricLabel}>
                {m.label}
                <EyeBtn
                  visibility={m.visibility}
                  onFlip={(next) => {
                    setMetrics((prev) => prev.map((x) => x.id === m.id ? { ...x, visibility: next } : x));
                    send('metric', 'update', { id: m.id, roadmapId: data.id, data: { visibility: next } });
                  }}
                />
              </div>
              <div className={styles.metricVals}>
                <input
                  className={styles.metricInput}
                  value={m.currentValue}
                  onChange={(e) => setMetrics((prev) => prev.map((x) => x.id === m.id ? { ...x, currentValue: e.target.value } : x))}
                  onBlur={(e) => send('metric', 'update', { id: m.id, data: { currentValue: e.target.value } })}
                />
                {m.unit && <span className={styles.metricArrow}>{m.unit}</span>}
              </div>
              {m.startValue !== '' && (
                <div style={{ marginTop: 6 }}>
                  <span className={styles.metricStart}>было {m.startValue}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.h2}>ЛЕСТНИЦА</span>
          <span className={styles.hint}>клик по точке меняет статус</span>
        </div>
        <div className={styles.steps}>
          {steps.map((s) => (
            <div key={s.id} className={styles.step}>
              <button
                className={styles.stepBtn}
                title={STEP_LABEL[s.status]}
                onClick={() => {
                  const next = STEP_CYCLE[(STEP_CYCLE.indexOf(s.status as typeof STEP_CYCLE[number]) + 1) % STEP_CYCLE.length];
                  setSteps((prev) => prev.map((x) => x.id === s.id ? { ...x, status: next } : x));
                  send('step', 'update', { id: s.id, data: { status: next } });
                }}
              >
                <span className={styles.stepNum}>{s.position}</span>
                <span className={`${styles.dot} ${styles[s.status] ?? styles.todo}`} />
              </button>
              <div className={styles.stepBody}>
                <div className={styles.stepName}>{s.title}</div>
                <input
                  className={styles.stepEvidence}
                  style={{ background: 'none', border: 'none', outline: 'none', width: '100%' }}
                  value={s.evidence}
                  placeholder="чем подтверждается"
                  onChange={(e) => setSteps((prev) => prev.map((x) => x.id === s.id ? { ...x, evidence: e.target.value } : x))}
                  onBlur={(e) => send('step', 'update', { id: s.id, data: { evidence: e.target.value } })}
                />
              </div>
              {s.status === 'blocked' && <span className={styles.stepHere}>ЗДЕСЬ</span>}
              <EyeBtn
                visibility={s.visibility}
                onFlip={(next) => {
                  setSteps((prev) => prev.map((x) => x.id === s.id ? { ...x, visibility: next } : x));
                  send('step', 'update', { id: s.id, roadmapId: data.id, data: { visibility: next } });
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.h2}>ЗАДАЧИ</span>
          <span className={styles.hint}>{openTasks.length} открыто · {doneTasks.length} закрыто</span>
        </div>

        <div className={styles.tasks}>
          {[...openTasks, ...doneTasks].map((t) => {
            const done = t.status === 'done';
            const overdue = !done && t.dueOn && t.dueOn < today;
            return (
              <div key={t.id} className={`${styles.task} ${done ? styles.taskDone : ''}`}>
                <input
                  type="checkbox"
                  className={styles.check}
                  checked={done}
                  onChange={(e) => {
                    const status = e.target.checked ? 'done' : 'todo';
                    setTasks((prev) => prev.map((x) => x.id === t.id ? { ...x, status } : x));
                    send('task', 'update', { id: t.id, data: { status } });
                  }}
                />
                <div className={styles.taskBody}>
                  <div className={`${styles.taskTitle} ${done ? styles.taskDoneTitle : ''}`}>{t.title}</div>
                  {t.why && <div className={styles.taskWhy}>{t.why}</div>}
                </div>
                <div className={styles.taskMeta}>
                  {t.dueOn && <span className={overdue ? styles.overdue : ''}>{t.dueOn.slice(8, 10)}.{t.dueOn.slice(5, 7)}</span>}
                  <button
                    className={styles.owner}
                    title="кому передать"
                    onClick={() => {
                      const owner = t.owner === 'client' ? 'sasha' : 'client';
                      setTasks((prev) => prev.map((x) => x.id === t.id ? { ...x, owner } : x));
                      send('task', 'update', { id: t.id, data: { owner } });
                    }}
                  >
                    {t.owner === 'sasha' ? 'я' : 'он'}
                  </button>
                  <EyeBtn
                    visibility={t.visibility}
                    onFlip={(next) => {
                      setTasks((prev) => prev.map((x) => x.id === t.id ? { ...x, visibility: next } : x));
                      send('task', 'update', { id: t.id, roadmapId: data.id, data: { visibility: next } });
                    }}
                  />
                  <button
                    className={styles.del}
                    title="удалить"
                    onClick={() => {
                      setTasks((prev) => prev.filter((x) => x.id !== t.id));
                      send('task', 'delete', { id: t.id });
                    }}
                  >×</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.add}>
          <input
            className={styles.input}
            placeholder="новая задача"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <input
            className={styles.input}
            placeholder="зачем она"
            value={newTask.why}
            onChange={(e) => setNewTask({ ...newTask, why: e.target.value })}
          />
          <input
            className={styles.select}
            type="date"
            value={newTask.dueOn}
            onChange={(e) => setNewTask({ ...newTask, dueOn: e.target.value })}
          />
          <select
            className={styles.select}
            value={newTask.owner}
            onChange={(e) => setNewTask({ ...newTask, owner: e.target.value })}
          >
            <option value="client">за клиентом</option>
            <option value="sasha">за мной</option>
          </select>
          <button
            className={styles.btn}
            disabled={!newTask.title.trim() || saving}
            onClick={async () => {
              const visibility = clientVisible && newTask.owner === 'client' ? 'shared' : 'internal';
              const res = await send('task', 'create', { data: { ...newTask, visibility } });
              if (res?.id) {
                setTasks((prev) => [...prev, { ...newTask, id: res.id!, status: 'todo', visibility }]);
                setNewTask({ title: '', why: '', owner: 'client', dueOn: '' });
              }
            }}
          >добавить</button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.h2}>ЗАМЕТКИ</span>
          <span className={styles.hint}>блокеры, риски, решения, наблюдения</span>
        </div>

        <div className={styles.notes}>
          {notes.map((n) => (
            <div key={n.id} className={styles.note}>
              <span className={`${styles.noteKind} ${KIND_CLASS[n.kind] ?? styles.kindInsight}`}>
                {KIND_LABEL[n.kind] ?? n.kind}
              </span>
              <div className={styles.noteBody}>
                {n.body}
                {(n.source || n.happenedOn) && (
                  <div className={styles.noteSrc}>
                    {[n.source, n.happenedOn ? `${n.happenedOn.slice(8, 10)}.${n.happenedOn.slice(5, 7)}` : ''].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
              <EyeBtn
                visibility={n.visibility}
                onFlip={(next) => {
                  setNotes((prev) => prev.map((x) => x.id === n.id ? { ...x, visibility: next } : x));
                  send('note', 'update', { id: n.id, roadmapId: data.id, data: { visibility: next } });
                }}
              />
              <button
                className={styles.del}
                onClick={() => {
                  setNotes((prev) => prev.filter((x) => x.id !== n.id));
                  send('note', 'delete', { id: n.id });
                }}
              >×</button>
            </div>
          ))}
        </div>

        <div className={styles.add}>
          <select
            className={styles.select}
            value={newNote.kind}
            onChange={(e) => setNewNote({ ...newNote, kind: e.target.value })}
          >
            {Object.entries(KIND_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
          <input
            className={styles.input}
            placeholder="что заметили"
            value={newNote.body}
            onChange={(e) => setNewNote({ ...newNote, body: e.target.value })}
          />
          <input
            className={styles.input}
            style={{ maxWidth: 180, minWidth: 120 }}
            placeholder="откуда"
            value={newNote.source}
            onChange={(e) => setNewNote({ ...newNote, source: e.target.value })}
          />
          <button
            className={styles.btn}
            disabled={!newNote.body.trim() || saving}
            onClick={async () => {
              const payload = { ...newNote, happenedOn: today };
              const res = await send('note', 'create', { data: payload });
              if (res?.id) {
                setNotes((prev) => [{ ...payload, id: res.id!, visibility: 'internal' }, ...prev]);
                setNewNote({ kind: 'insight', body: '', source: '' });
              }
            }}
          >добавить</button>
        </div>
      </div>
    </>
  );
}
