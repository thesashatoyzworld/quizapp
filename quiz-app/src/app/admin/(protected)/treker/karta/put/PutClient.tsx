'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { TaskView } from '@/lib/tracker/data';
import { mondayOf, shortDate, todayLocal, type MapView, type PathRoute } from '@/lib/tracker/karta-shared';
import Ring from '../../Ring';
import styles from '../karta.module.css';

type Card = TaskView & { map: NonNullable<TaskView['map']> };
type PointState = 'done' | 'now' | 'week' | 'later' | 'none';
type Item = { key: string; title: string; sub?: string; tasks: Card[]; state: PointState; label: string };

const isDone = (t: TaskView) => t.progress >= 1;
const toPrep = (s: PointState) => s === 'now' || s === 'week' || s === 'none';
const WORST: PointState[] = ['none', 'now', 'week', 'later', 'done'];

/** Состояние точки по её задачам: готово, в работе, к неделе, после запуска или задачи нет. */
function stateOf(ready: boolean | undefined, tasks: Card[], thisWeek: string): { state: PointState; label: string } {
  const left = tasks.filter((c) => !isDone(c));
  if (!tasks.length) return ready ? { state: 'done', label: 'работает' } : { state: 'none', label: 'задачи нет' };
  if (!left.length) return { state: 'done', label: 'готово' };
  const active = left.filter((c) => !c.map.later);
  if (!active.length) return { state: 'later', label: 'после запуска' };
  const weeks = active
    .map((c) => c.map.week)
    .filter((w): w is string => !!w)
    .sort();
  if (!weeks.length || weeks[0] <= thisWeek) return { state: 'now', label: 'в работе' };
  return { state: 'week', label: `к ${shortDate(weeks[0])}` };
}

/** Сколько человек пришло по меткам маршрута. */
const cameFrom = (r: PathRoute, sources: Record<string, number>) =>
  r.from
    ? Object.entries(sources)
        .filter(([s]) => r.from!.some((f) => s.startsWith(f)))
        .reduce((n, [, v]) => n + v, 0)
    : null;

const setQuery = (patch: Record<string, string | null>, push: boolean) => {
  const u = new URLSearchParams(window.location.search);
  for (const [k, v] of Object.entries(patch)) {
    if (v) u.set(k, v);
    else u.delete(k);
  }
  const url = u.size ? `?${u}` : window.location.pathname;
  // Без запроса к серверу: Next подхватывает history и обновляет useSearchParams.
  if (push) window.history.pushState(null, '', url);
  else window.history.replaceState(null, '', url);
};

/**
 * Путь клиента: цепочка шагов. Шаг раскрывается прямо здесь. Внутри маршруты, каждый отдельно:
 * выбираешь источник, его шаги открываются по одному, как в схеме промо группы Маши.
 */
export default function PutClient({
  map,
  tasks,
  sources,
}: {
  map: MapView;
  tasks: TaskView[];
  sources: Record<string, number>;
}) {
  const q = useSearchParams();
  const thisWeek = mondayOf(todayLocal());
  const cards = tasks.filter((t): t is Card => !!t.map && !t.archived);
  const item = (key: string, title: string, ready?: boolean, sub?: string, point?: string): Item => {
    const ts = cards.filter((c) => c.map.point === (point ?? key));
    return { key, title, sub, tasks: ts, ...stateOf(ready, ts, thisWeek) };
  };

  const steps = map.path.map((s) => {
    const routes = (s.routes ?? []).map((r) => {
      const nodes = r.nodes.map((n) => item(n.key, n.title, n.ready, n.sub, n.point));
      const worst = WORST.find((w) => nodes.some((n) => n.state === w)) ?? 'done';
      return { ...r, nodes, worst, came: cameFrom(r, sources) };
    });
    const items = routes.length ? routes.flatMap((r) => r.nodes) : s.points.map((p) => item(p.key, p.title, p.ready));
    return {
      ...s,
      routes,
      items,
      done: items.filter((p) => p.state === 'done').length,
      prep: items.filter((p) => toPrep(p.state)).length,
    };
  });
  const prepAll = steps.reduce((n, s) => n + s.prep, 0);
  const openKey = q.get('s');

  const toggle = (key: string) => {
    const closing = openKey === key;
    setQuery({ s: closing ? null : key, r: null }, true);
    if (!closing)
      requestAnimationFrame(() =>
        document.getElementById(`put-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      );
  };

  return (
    <div className={styles.put}>
      <nav className={styles.putCrumbs}>
        <Link href="/admin/treker/karta">← Карта</Link>
      </nav>
      <h1 className={styles.putTitle}>Путь клиента</h1>
      <div className={styles.putStat}>
        от «увидел» до результата · <span className={styles.putPrep}>подготовить до открытия {prepAll}</span>
      </div>

      <ol className={`${styles.putChain} ${openKey ? styles.putFocus : ''}`}>
        {steps.map((s, i) => {
          const isOpen = openKey === s.key;
          return (
            <li
              key={s.key}
              id={`put-${s.key}`}
              className={isOpen ? styles.putOpen : ''}
              style={{ '--f': s.items.length ? s.done / s.items.length : 0, '--i': i } as React.CSSProperties}
            >
              <button type="button" className={styles.putNode} aria-expanded={isOpen} onClick={() => toggle(s.key)}>
                <span className={`${styles.pNum} ${styles.pNumIcon}`}>
                  <StepIcon k={s.key} fallback={i + 1} />
                  <span className={styles.pNumBadge}>{i + 1}</span>
                </span>
                <span className={styles.putNodeBody}>
                  <span className={styles.putNodeTitle}>{s.title}</span>
                  <span className={styles.putNodeMeta}>
                    {s.routes.length
                      ? `${s.routes.length} ${s.routes.length < 5 ? 'маршрута' : 'маршрутов'}`
                      : `${s.items.length} ${s.items.length === 1 ? 'ветка' : s.items.length < 5 ? 'ветки' : 'веток'}`}
                    {s.prep > 0 ? (
                      <span className={styles.putPrep}> · подготовить {s.prep}</span>
                    ) : s.done === s.items.length ? (
                      <span className={styles.putOk}> · готово</span>
                    ) : (
                      <span> · к открытию готово</span>
                    )}
                  </span>
                </span>
                <span className={styles.putChevron} aria-hidden>
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              {isOpen && (
                <div className={styles.putInside}>
                  <div className={styles.pDoes}>человек {s.does}</div>
                  {s.routes.length ? <Routes step={s} routeKey={q.get('r')} /> : <Points items={s.items} />}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Иконки шагов пути: линия 1.7, скругления, как в остальном кабинете. */
const ICONS: Record<string, React.ReactNode> = {
  // Увидел: глаз.
  uvidel: (
    <>
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  // Записался в лист: лист с галочкой.
  zapisalsya: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
      <path d="M9 3.5V5h6V3.5M8.5 12.5l2.3 2.3 4.7-4.8" />
    </>
  ),
  // Ждёт открытия: песочные часы.
  zhdet: (
    <>
      <path d="M6.5 3.5h11M6.5 20.5h11" />
      <path d="M7.5 3.5c0 4.5 4.5 5.5 4.5 8.5s-4.5 4-4.5 8.5M16.5 3.5c0 4.5-4.5 5.5-4.5 8.5s4.5 4 4.5 8.5" />
    </>
  ),
  // Оплатил: карта.
  oplatil: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M7 14.5h4" />
    </>
  ),
  // Вошёл: ключ.
  voshel: (
    <>
      <circle cx="8" cy="12" r="4" />
      <path d="M12 12h9M18 12v3M15.5 12v2" />
    </>
  ),
  // Первый месяц: маршрутная карта.
  rabotaet: (
    <>
      <path d="M9 4.5 3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2-6-2Z" />
      <path d="M9 4.5v13M15 6.5v13" />
    </>
  ),
  // Результат: график вверх.
  rezultat: (
    <>
      <path d="M3.5 19.5h17" />
      <path d="m4.5 15 5-5 3.5 3.5 6.5-7" />
      <path d="M15 6.5h4.5V11" />
    </>
  ),
};

function StepIcon({ k, fallback }: { k: string; fallback: number }) {
  const icon = ICONS[k];
  if (!icon) return <>{fallback}</>;
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {icon}
    </svg>
  );
}

type RouteView = Omit<PathRoute, 'nodes'> & { nodes: Item[]; worst: PointState; came: number | null };

/** Маршруты шага: вкладки сверху, выбранный маршрут один, шаги открываются по клику. */
function Routes({ step, routeKey }: { step: { routes: RouteView[] }; routeKey: string | null }) {
  const route = step.routes.find((r) => r.key === routeKey) ?? step.routes[0];
  // Сколько шагов маршрута открыто, у каждого маршрута своё.
  const [shown, setShown] = useState<Record<string, number>>({});
  const [openNode, setOpenNode] = useState<string | null>(null);
  const n = shown[route.key] ?? 1;
  const total = route.nodes.length + 1;

  return (
    <>
      <div className={styles.putTabs} role="tablist">
        {step.routes.map((r) => (
          <button
            key={r.key}
            type="button"
            role="tab"
            aria-selected={r.key === route.key}
            className={styles.putTab}
            data-state={r.worst}
            onClick={() => setQuery({ r: r.key }, false)}
          >
            <span className={styles.pDot} aria-hidden />
            {r.title}
            {r.came !== null && <span className={styles.putTabN}>{r.came}</span>}
          </button>
        ))}
      </div>

      <div className={styles.lane} key={route.key}>
        {route.nodes.slice(0, n).map((node, i) => {
          const isOpen = openNode === node.key;
          return (
            <div key={node.key} className={styles.laneItem}>
              {i > 0 && <div className={styles.laneArrow} aria-hidden />}
              <button
                type="button"
                className={styles.laneBlock}
                data-state={node.state}
                aria-expanded={isOpen}
                disabled={!node.tasks.length}
                onClick={() => setOpenNode(isOpen ? null : node.key)}
              >
                <span className={styles.laneHead}>
                  <b>{node.title}</b>
                  <span className={styles.pState}>{node.label}</span>
                </span>
                {node.sub && <span className={styles.laneSub}>{node.sub}</span>}
              </button>
              {isOpen && <TaskList tasks={node.tasks} />}
            </div>
          );
        })}
        {n >= total && (
          <div className={styles.laneItem}>
            <div className={styles.laneArrow} aria-hidden />
            {route.came !== null ? (
              <div className={`${styles.laneBlock} ${styles.laneEnd}`}>
                <span className={styles.laneHead}>
                  <b>В листе ожидания</b>
                  <span className={styles.laneCame}>пришло {route.came}</span>
                </span>
              </div>
            ) : (
              <div className={`${styles.laneBlock} ${styles.laneGap}`} data-state="none">
                <span className={styles.laneHead}>
                  <b>Как отсюда попадает в лист</b>
                  <span className={styles.pState}>не решено</span>
                </span>
                <span className={styles.laneSub}>ссылки с меткой нет, приход не считается</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.laneNav}>
        {n < total ? (
          <>
            <button type="button" className={styles.pNext} onClick={() => setShown({ ...shown, [route.key]: n + 1 })}>
              <span className={styles.pNextKicker}>дальше</span>
              <span>
                шаг {n + 1} из {total}
              </span>
              <span className={styles.rOpenArrow} aria-hidden>
                ↓
              </span>
            </button>
            <button type="button" className={styles.linkBtn} onClick={() => setShown({ ...shown, [route.key]: total })}>
              весь маршрут
            </button>
          </>
        ) : (
          <button type="button" className={styles.linkBtn} onClick={() => setShown({ ...shown, [route.key]: 1 })}>
            сначала
          </button>
        )}
      </div>
    </>
  );
}

/** Шаг без маршрутов: ветки списком, задачи раскрываются на месте. */
function Points({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className={styles.putBranches}>
      {items.map((p, i) => (
        <li key={p.key} style={{ '--i': i } as React.CSSProperties}>
          <button
            type="button"
            className={styles.pPoint}
            data-state={p.state}
            aria-expanded={open === p.key}
            disabled={!p.tasks.length}
            onClick={() => setOpen(open === p.key ? null : p.key)}
          >
            <span className={styles.pDot} aria-hidden />
            <span className={styles.pPointTitle}>{p.title}</span>
            <span className={styles.pState}>{p.label}</span>
          </button>
          {open === p.key && <TaskList tasks={p.tasks} />}
        </li>
      ))}
    </ul>
  );
}

function TaskList({ tasks }: { tasks: Card[] }) {
  return (
    <ul className={styles.putTasks}>
      {tasks.map((c) => (
        <li key={c.id}>
          <Link href={`/admin/treker?t=${c.id}`} className={`${styles.putTask} ${isDone(c) ? styles.rowDone : ''}`}>
            <Ring progress={c.progress} size={26} stroke={3} />
            <span className={styles.rowBody}>
              <span>{c.title}</span>
              <span className={styles.rowWhy}>
                {isDone(c)
                  ? 'сделано'
                  : c.map.later
                    ? 'после запуска'
                    : c.map.week
                      ? `неделя ${shortDate(c.map.week)}`
                      : 'каждую неделю'}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
