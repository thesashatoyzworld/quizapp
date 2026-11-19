'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { TaskView } from '@/lib/tracker/data';
import { mondayOf, shortDate, todayLocal, type MapView, type PathPoint } from '@/lib/tracker/karta-shared';
import Ring from '../../Ring';
import styles from '../karta.module.css';

type Card = TaskView & { map: NonNullable<TaskView['map']> };
type PointState = 'done' | 'now' | 'week' | 'later' | 'none';

const isDone = (t: TaskView) => t.progress >= 1;

/** Состояние ветки по её задачам: готово, в работе, к неделе, после запуска или задачи нет. */
function pointState(p: PathPoint, tasks: Card[], thisWeek: string): { state: PointState; label: string } {
  const left = tasks.filter((c) => !isDone(c));
  if (!tasks.length) return p.ready ? { state: 'done', label: 'готово' } : { state: 'none', label: 'задачи нет' };
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

const toPrep = (s: PointState) => s === 'now' || s === 'week' || s === 'none';

/**
 * Путь клиента отдельным экраном. Три уровня, каждый открывается сам по себе:
 * цепочка шагов → один шаг с его ветками → одна ветка с задачами. Уровень в адресе (?s=&p=),
 * поэтому «назад» в браузере работает.
 */
export default function PutClient({ map, tasks }: { map: MapView; tasks: TaskView[] }) {
  const q = useSearchParams();
  const thisWeek = mondayOf(todayLocal());
  const cards = tasks.filter((t): t is Card => !!t.map && !t.archived);

  const steps = map.path.map((s) => {
    const points = s.points.map((p) => {
      const ts = cards.filter((c) => c.map.point === p.key);
      return { ...p, tasks: ts, ...pointState(p, ts, thisWeek) };
    });
    return {
      ...s,
      points,
      done: points.filter((p) => p.state === 'done').length,
      prep: points.filter((p) => toPrep(p.state)).length,
    };
  });

  const si = steps.findIndex((s) => s.key === q.get('s'));
  const step = si >= 0 ? steps[si] : null;
  const point = step?.points.find((p) => p.key === q.get('p')) ?? null;
  const go = (s?: string, p?: string) => {
    const u = new URLSearchParams();
    if (s) u.set('s', s);
    if (p) u.set('p', p);
    // Без запроса к серверу: Next подхватывает pushState и обновляет useSearchParams.
    window.history.pushState(null, '', u.size ? `?${u}` : window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prepAll = steps.reduce((n, s) => n + s.prep, 0);

  // Ветка: только её задачи.
  if (step && point) {
    return (
      <div className={styles.put} key={`${step.key}/${point.key}`}>
        <nav className={styles.putCrumbs}>
          <button type="button" onClick={() => go()}>
            Путь
          </button>
          <span aria-hidden>›</span>
          <button type="button" onClick={() => go(step.key)}>
            {si + 1}. {step.title}
          </button>
        </nav>
        <div className={styles.putView}>
          <div className={styles.putKicker} data-state={point.state}>
            <span className={styles.pDot} aria-hidden />
            {point.label}
          </div>
          <h1 className={styles.putTitle}>{point.title}</h1>
          {point.tasks.length === 0 ? (
            <p className={styles.putEmpty}>
              {point.ready ? 'Уже работает, задач не нужно.' : 'Задачи нет. Это и надо подготовить.'}
            </p>
          ) : (
            <ul className={styles.putTasks}>
              {point.tasks.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/treker?t=${c.id}`}
                    className={`${styles.putTask} ${isDone(c) ? styles.rowDone : ''}`}
                  >
                    <Ring progress={c.progress} size={30} stroke={3} />
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
          )}
        </div>
      </div>
    );
  }

  // Шаг: только его ветки.
  if (step) {
    const prev = steps[si - 1];
    const next = steps[si + 1];
    return (
      <div className={styles.put} key={step.key}>
        <nav className={styles.putCrumbs}>
          <button type="button" onClick={() => go()}>
            Путь
          </button>
          <span aria-hidden>›</span>
          <span>
            шаг {si + 1} из {steps.length}
          </span>
        </nav>
        <div className={styles.putView}>
          <div
            className={styles.putStepHead}
            style={{ '--f': step.points.length ? step.done / step.points.length : 0 } as React.CSSProperties}
          >
            <span className={styles.pNum}>{si + 1}</span>
            <div>
              <h1 className={styles.putTitle}>{step.title}</h1>
              <div className={styles.pDoes}>человек {step.does}</div>
            </div>
          </div>
          <div className={styles.putStat}>
            готово {step.done} из {step.points.length}
            {step.prep > 0 && <span className={styles.putPrep}> · подготовить {step.prep}</span>}
          </div>
          <ul className={styles.putBranches}>
            {step.points.map((p, i) => (
              <li key={p.key} style={{ '--i': i } as React.CSSProperties}>
                <button
                  type="button"
                  className={styles.pPoint}
                  data-state={p.state}
                  onClick={() => go(step.key, p.key)}
                >
                  <span className={styles.pDot} aria-hidden />
                  <span className={styles.pPointTitle}>{p.title}</span>
                  <span className={styles.pState}>{p.label}</span>
                  <span className={styles.putChevron} aria-hidden>
                    ›
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.putNav}>
            {prev ? (
              <button type="button" className={styles.linkBtn} onClick={() => go(prev.key)}>
                ← {prev.title}
              </button>
            ) : (
              <span />
            )}
            {next && (
              <button type="button" className={styles.pNext} onClick={() => go(next.key)}>
                <span className={styles.pNextKicker}>дальше</span>
                <span>{next.title}</span>
                <span className={styles.rOpenArrow} aria-hidden>
                  →
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Цепочка шагов: только названия, каждый открывается отдельно.
  return (
    <div className={styles.put} key="root">
      <nav className={styles.putCrumbs}>
        <Link href="/admin/treker/karta">← Карта</Link>
      </nav>
      <div className={styles.putView}>
        <h1 className={styles.putTitle}>Путь клиента</h1>
        <div className={styles.putStat}>
          от «увидел» до результата · <span className={styles.putPrep}>подготовить до открытия {prepAll}</span>
        </div>
        <ol className={styles.putChain}>
          {steps.map((s, i) => (
            <li
              key={s.key}
              style={{ '--f': s.points.length ? s.done / s.points.length : 0, '--i': i } as React.CSSProperties}
            >
              <button type="button" className={styles.putNode} onClick={() => go(s.key)}>
                <span className={styles.pNum}>{i + 1}</span>
                <span className={styles.putNodeBody}>
                  <span className={styles.putNodeTitle}>{s.title}</span>
                  <span className={styles.putNodeMeta}>
                    {s.points.length} {s.points.length === 1 ? 'ветка' : s.points.length < 5 ? 'ветки' : 'веток'}
                    {s.prep > 0 ? (
                      <span className={styles.putPrep}> · подготовить {s.prep}</span>
                    ) : s.done === s.points.length ? (
                      <span className={styles.putOk}> · готово</span>
                    ) : (
                      <span> · к открытию готово</span>
                    )}
                  </span>
                </span>
                <span className={styles.putChevron} aria-hidden>
                  ›
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
