'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { TaskView } from '@/lib/tracker/data';
import {
  LIST_START,
  LIST_TARGET,
  addDays,
  daysBetween,
  milestoneOfWeek,
  mondayOf,
  planBy,
  shortDate,
  todayLocal,
  weeksUntil,
  type MapView,
  type Score,
} from '@/lib/tracker/karta-shared';
import Ring from '../Ring';
import styles from './karta.module.css';

type Card = TaskView & { map: NonNullable<TaskView['map']> };

const open = (id: string) => `/admin/treker?t=${id}`;
const isDone = (t: TaskView) => t.progress >= 1;
const byWeek = (a: Card, b: Card) => (a.map.week ?? '9').localeCompare(b.map.week ?? '9');

/**
 * Карта запуска как игра: счёт = живые записи в лист ожидания, цель 90.
 * Дело на карте = ход, у каждого подписано, что он даёт счёту.
 */
export default function KartaClient({ map, tasks, score }: { map: MapView; tasks: TaskView[]; score: Score }) {
  const today = todayLocal();
  const thisWeek = mondayOf(today);
  const cards = tasks.filter((t): t is Card => !!t.map && !t.archived);
  const moves = cards.filter((c) => !c.map.later);
  const later = cards.filter((c) => c.map.later);

  const weeks = weeksUntil(LIST_START, map.deadline);
  const perWeek = Math.ceil(LIST_TARGET / weeks.length);
  const plan = planBy(today, map.deadline);
  const diff = score.total - plan;
  const daysLeft = daysBetween(today, map.deadline);
  const weekNow = score.byWeek[thisWeek] ?? 0;

  // Ходы этой недели и несделанные хвосты прошлых.
  const nowList = moves.filter((c) => !isDone(c) && c.map.week && c.map.week <= thisWeek).sort(byWeek);
  const always = moves.filter((c) => !isDone(c) && !c.map.week);
  const doneThisWeek = moves.filter((c) => c.map.week === thisWeek && isDone(c)).length;
  const totalThisWeek = moves.filter((c) => c.map.week === thisWeek).length;
  // Неделя закрыта: ходы ближайшей следующей недели можно взять раньше.
  const nextWeek = nowList.length
    ? null
    : (moves
        .filter((c) => !isDone(c) && c.map.week && c.map.week > thisWeek)
        .map((c) => c.map.week!)
        .sort()[0] ?? null);
  const early = nextWeek ? moves.filter((c) => c.map.week === nextWeek && !isDone(c)) : [];
  const [allNow, setAllNow] = useState(false);
  const shownNow = allNow ? nowList : nowList.slice(0, 3);

  const stageOf = (key: string) => map.stages.find((s) => s.key === key);
  const [opened, setOpened] = useState(false);
  const openDetails = () => {
    setOpened(true);
    requestAnimationFrame(() =>
      document.getElementById('schet')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <Link href="/admin/treker" className={styles.back}>
          ← Трекер
        </Link>
      </div>

      {/* Первый экран: только цель и кнопка. Остальное по кнопке. */}
      <GoalReactor total={score.total} fresh={weekNow} plan={plan} deadline={map.deadline} onOpen={openDetails} />

      {opened && (
        <div id="schet" className={styles.details}>
          <header className={styles.score}>
            <div className={styles.scoreText}>
              <div className={styles.kicker}>Лист ожидания «360»</div>
              <div className={styles.scoreSub}>
                <span className={diff >= 0 ? styles.ahead : styles.behind}>
                  {diff >= 0 ? `впереди графика на ${diff}` : `отстаёшь от графика на ${-diff}`}
                </span>
                <span className={styles.scoreMuted}> · по графику сегодня {plan}</span>
              </div>
              <div className={styles.scoreSub}>
                на этой неделе <b className={styles.freshNum}>+{weekNow}</b>, нужно ~{perWeek} в неделю
              </div>
              <div className={styles.scoreSub}>
                {daysLeft > 0
                  ? `до открытия набора ${daysLeft} ${plural(daysLeft, 'день', 'дня', 'дней')}, ${shortDate(map.deadline)}`
                  : 'набор открыт'}
              </div>
              <div className={styles.scoreWhy}>90 в листе ≈ 30 оплат, если платит каждый третий</div>
            </div>
          </header>

          <section className={styles.section}>
            <h2 className={styles.h2}>
              Ходы этой недели
              {totalThisWeek > 0 && (
                <span className={styles.h2Count}>
                  {' '}
                  · {doneThisWeek} из {totalThisWeek}
                </span>
              )}
            </h2>
            {shownNow.length === 0 ? (
              <>
                <p className={styles.weekClosed}>Неделя закрыта ✓</p>
                {nextWeek && early.length > 0 && (
                  <>
                    <div className={styles.alwaysHead}>Можно взять раньше, с недели {shortDate(nextWeek)}:</div>
                    <div className={styles.moves}>
                      {early.map((c) => (
                        <Move key={c.id} c={c} stage={stageOf(c.map.stage)} tail={false} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className={styles.moves}>
                {shownNow.map((c) => (
                  <Move key={c.id} c={c} stage={stageOf(c.map.stage)} tail={!!c.map.week && c.map.week < thisWeek} />
                ))}
              </div>
            )}
            {nowList.length > 3 && (
              <button type="button" className={styles.linkBtn} onClick={() => setAllNow(!allNow)}>
                {allNow ? 'свернуть' : `ещё ${nowList.length - 3} на этой неделе`}
              </button>
            )}
            {always.length > 0 && (
              <div className={styles.always}>
                <div className={styles.alwaysHead}>Каждую неделю</div>
                {always.map((c) => (
                  <Row key={c.id} c={c} stage={stageOf(c.map.stage)} />
                ))}
              </div>
            )}
          </section>

          <Weeks
            map={map}
            weeks={weeks}
            thisWeek={thisWeek}
            score={score}
            perWeek={perWeek}
            moves={moves}
            stageOf={stageOf}
          />

          {later.length > 0 && <Later cards={later} />}
        </div>
      )}
    </div>
  );
}

/**
 * Первый экран карты: реактор цели. Дуга заполняется до числа людей в листе,
 * по внешнему кольцу 90 рисок, одна риска = один человек, загораются по одной.
 * На конце дуги точка «сейчас» пускает волны, свечение дышит, по дорожке ходит блик.
 * Всё на rAF через ref, а не CSS: у Саши в браузере reduced motion.
 */
function GoalReactor({
  total,
  fresh,
  plan,
  deadline,
  onOpen,
}: {
  total: number;
  fresh: number;
  plan: number;
  deadline: string;
  onOpen: () => void;
}) {
  const N = LIST_TARGET;
  const filled = Math.min(N, total);
  const S = 400;
  const C = S / 2;
  const R = 138; // основная дуга
  const LEN = 2 * Math.PI * R;
  const T0 = 160; // риски
  const T1 = 172;
  const freshFrom = filled - Math.min(fresh, filled);

  const root = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const arcGlow = useRef<SVGCircleElement>(null);
  const head = useRef<SVGGElement>(null);
  const sweep = useRef<SVGCircleElement>(null);
  const ripples = useRef<(SVGCircleElement | null)[]>([]);
  const ticks = useRef<(SVGLineElement | null)[]>([]);
  const num = useRef<HTMLSpanElement>(null);

  const polar = (r: number, frac: number) => {
    const a = frac * 2 * Math.PI - Math.PI / 2;
    return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
  };

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const FILL = Math.min(2400, 700 + filled * 90);
    const DELAY = 450;
    let raf = 0;
    let t0 = 0;
    let lit = -1;

    const frame = (t: number) => {
      if (!t0) t0 = t;
      const e = t - t0;
      // 1) вход: всё проявляется
      el.style.setProperty('--in', Math.min(1, e / 600).toFixed(3));
      // 2) заполнение до числа людей
      const k = Math.min(1, Math.max(0, (e - DELAY) / FILL));
      const ease = 1 - Math.pow(1 - k, 4);
      const v = ease * filled;
      const frac = v / N;
      arc.current?.setAttribute('stroke-dasharray', `${(frac * LEN).toFixed(2)} ${LEN}`);
      arcGlow.current?.setAttribute('stroke-dasharray', `${(frac * LEN).toFixed(2)} ${LEN}`);
      const [hx, hy] = polar(R, frac);
      head.current?.setAttribute('transform', `translate(${hx.toFixed(2)} ${hy.toFixed(2)})`);
      const n = Math.round(v);
      if (n !== lit) {
        lit = n;
        if (num.current) num.current.textContent = String(n);
        ticks.current.forEach((tk, i) => tk?.setAttribute('data-on', i < n ? (i >= freshFrom ? 'f' : 'o') : ''));
      }
      // 3) после заполнения: дыхание, волны от точки, блик по дорожке
      const life = Math.max(0, e - DELAY - FILL);
      const breath = (1 - Math.cos((life / 2600) * 2 * Math.PI)) / 2;
      el.style.setProperty('--p', (k < 1 ? 0.6 : breath).toFixed(3));
      ripples.current.forEach((c, i) => {
        if (!c) return;
        const ph = k < 1 ? 0 : (life / 2200 + i / 3) % 1;
        c.setAttribute('r', (6 + ph * 34).toFixed(2));
        c.setAttribute('opacity', k < 1 ? '0' : ((1 - ph) * 0.55).toFixed(3));
      });
      // Искра бежит по заполненной дуге от начала к точке «сейчас», раз в ~3,2 с.
      if (sweep.current) {
        const sp = k < 1 ? 0 : (life % 3200) / 3200;
        const len = Math.min(LEN * 0.06, frac * LEN * 0.4);
        const pos = sp * Math.max(0, frac * LEN - len);
        sweep.current.setAttribute('stroke-dasharray', `0 ${pos.toFixed(2)} ${len.toFixed(2)} ${LEN}`);
        sweep.current.setAttribute('opacity', k < 1 ? '0' : Math.sin(sp * Math.PI).toFixed(3));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filled]);

  const planFrac = Math.min(plan, N) / N;
  const [p0x, p0y] = polar(T1 + 10, planFrac);
  const [p1x, p1y] = polar(T1 + 22, planFrac);
  const days = daysBetween(todayLocal(), deadline);

  return (
    <div ref={root} className={styles.reactor}>
      <div className={styles.reactorStage}>
        <svg
          viewBox={`0 0 ${S} ${S}`}
          className={styles.reactorSvg}
          aria-label={`${total} из ${N} в листе ожидания`}
          role="img"
        >
          <defs>
            <linearGradient id="kr-arc" gradientUnits="userSpaceOnUse" x1={C} y1={C - R} x2={C + R} y2={C + R}>
              <stop offset="0" stopColor="#00f0ff" />
              <stop offset="0.6" stopColor="#00ff88" />
              <stop offset="1" stopColor="#d6ff5c" />
            </linearGradient>
            <radialGradient id="kr-core" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#00ff88" stopOpacity="0.18" />
              <stop offset="0.55" stopColor="#00f0ff" stopOpacity="0.05" />
              <stop offset="1" stopColor="#00f0ff" stopOpacity="0" />
            </radialGradient>
            <filter id="kr-blur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
            <filter id="kr-soft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ядро и направляющие */}
          <circle cx={C} cy={C} r={R - 6} fill="url(#kr-core)" className={styles.rCore} />
          <circle cx={C} cy={C} r={194} className={styles.rGuide} />
          <circle cx={C} cy={C} r={112} className={styles.rGuideDash} />

          {/* 90 рисок: одна = один человек */}
          {Array.from({ length: N }, (_, i) => {
            const f = (i + 0.5) / N;
            const big = i % 10 === 9;
            const [x0, y0] = polar(T0 - (big ? 4 : 0), f);
            const [x1, y1] = polar(T1, f);
            return (
              <line
                key={i}
                ref={(el) => {
                  ticks.current[i] = el;
                }}
                x1={x0}
                y1={y0}
                x2={x1}
                y2={y1}
                className={styles.tick}
                data-on=""
              />
            );
          })}

          {/* план на сегодня: где должен быть счёт */}
          {plan > 0 && plan < N && <line x1={p0x} y1={p0y} x2={p1x} y2={p1y} className={styles.rPlan} />}

          {/* дорожка, свечение, дуга, блик */}
          <circle cx={C} cy={C} r={R} className={styles.rTrack} />
          <g transform={`rotate(0 ${C} ${C})`}>
            <circle
              ref={arcGlow}
              cx={C}
              cy={C}
              r={R}
              className={styles.rArcGlow}
              stroke="url(#kr-arc)"
              filter="url(#kr-blur)"
              strokeDasharray={`0 ${LEN}`}
              transform={`rotate(-90 ${C} ${C})`}
            />
            <circle
              ref={arc}
              cx={C}
              cy={C}
              r={R}
              className={styles.rArc}
              stroke="url(#kr-arc)"
              strokeDasharray={`0 ${LEN}`}
              transform={`rotate(-90 ${C} ${C})`}
            />
          </g>
          <circle
            ref={sweep}
            cx={C}
            cy={C}
            r={R}
            className={styles.rSweep}
            stroke="#ffffff"
            strokeDasharray={`0 ${LEN}`}
            transform={`rotate(-90 ${C} ${C})`}
            opacity="0"
          />

          {/* точка «сейчас» с волнами */}
          <g ref={head} transform={`translate(${C} ${C - R})`}>
            {[0, 1, 2].map((i) => (
              <circle
                key={i}
                ref={(el) => {
                  ripples.current[i] = el;
                }}
                r="6"
                className={styles.rRipple}
                opacity="0"
              />
            ))}
            <circle r="9" className={styles.rHeadHalo} filter="url(#kr-blur)" />
            <circle r="5.5" className={styles.rHead} filter="url(#kr-soft)" />
          </g>
        </svg>

        <div className={styles.reactorCenter}>
          <span ref={num} className={styles.rNum}>
            0
          </span>
          <span className={styles.rOf}>
            <span className={styles.rSlash} /> из {N}
          </span>
        </div>
      </div>

      <div className={styles.reactorCaption}>
        <div className={styles.rGoal}>в листе ожидания «360»</div>
        <div className={styles.rMeta}>
          открытие {shortDate(deadline)}
          {days > 0 && ` · ${days} ${plural(days, 'день', 'дня', 'дней')}`}
        </div>
      </div>

      <button type="button" className={styles.rOpen} onClick={onOpen}>
        <span>Открыть карту</span>
        <span className={styles.rOpenArrow} aria-hidden>
          →
        </span>
      </button>
    </div>
  );
}

type StageOf = (key: string) => MapView['stages'][number] | undefined;

function Move({ c, stage, tail }: { c: Card; stage?: MapView['stages'][number]; tail: boolean }) {
  return (
    <Link href={open(c.id)} className={styles.move}>
      <Ring progress={c.progress} size={40} stroke={4} />
      <span className={styles.moveBody}>
        <span className={styles.moveTitle}>{c.title}</span>
        <span className={styles.moveWhy}>
          {stage && <span className={stageClass(c.map.stage)}>{stage.title}</span>}
          {c.map.move ?? stage?.hint}
          {tail && <span className={styles.tail}> · с прошлой недели</span>}
        </span>
      </span>
    </Link>
  );
}

function Row({ c, stage }: { c: Card; stage?: MapView['stages'][number] }) {
  return (
    <Link href={open(c.id)} className={`${styles.row} ${isDone(c) ? styles.rowDone : ''}`}>
      <Ring progress={c.progress} size={22} stroke={3} />
      <span className={styles.rowBody}>
        <span>{c.title}</span>
        {(c.map.move ?? stage?.hint) && <span className={styles.rowWhy}>{c.map.move ?? stage?.hint}</span>}
      </span>
      {stage && <span className={stageClass(c.map.stage)}>{stage.title}</span>}
    </Link>
  );
}

function stageClass(key: string) {
  return `${styles.chip} ${key === 'lyudi' ? styles.chipPeople : styles.chipMoney}`;
}

function Weeks({
  map,
  weeks,
  thisWeek,
  score,
  perWeek,
  moves,
  stageOf,
}: {
  map: MapView;
  weeks: string[];
  thisWeek: string;
  score: Score;
  perWeek: number;
  moves: Card[];
  stageOf: StageOf;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const weekMoves = (w: string) => moves.filter((c) => c.map.week === w);
  const list = picked ? weekMoves(picked).sort((a, b) => Number(isDone(a)) - Number(isDone(b))) : [];
  const ms = picked ? milestoneOfWeek(map.milestones, picked) : undefined;

  return (
    <section className={styles.section}>
      <h2 className={styles.h2}>Недели до открытия</h2>
      <div className={styles.timeline}>
        {weeks.map((w) => {
          const m = milestoneOfWeek(map.milestones, w);
          const pause = m?.kind === 'pause';
          const launch = m?.kind === 'launch';
          const past = w <= thisWeek;
          const got = score.byWeek[w] ?? 0;
          const ms = weekMoves(w);
          const left = ms.filter((c) => !isDone(c)).length;
          return (
            <button
              key={w}
              type="button"
              onClick={() => setPicked(picked === w ? null : w)}
              className={[
                styles.week,
                w === thisWeek ? styles.weekNow : '',
                w === picked ? styles.weekPicked : '',
                pause ? styles.weekPause : '',
                launch ? styles.weekLaunch : '',
              ].join(' ')}
              title={m?.label}
            >
              <span className={styles.weekDate}>{launch ? `🚀 ${shortDate(m!.from)}` : shortDate(w)}</span>
              {past ? (
                <>
                  <span className={got >= perWeek ? styles.weekGot : styles.weekGotLow}>+{got}</span>
                  <span className={styles.weekBar}>
                    <span
                      style={{
                        width: `${Math.min(100, (got / perWeek) * 100)}%`,
                      }}
                    />
                  </span>
                </>
              ) : (
                <span className={styles.weekNone}>
                  {pause ? 'пауза' : ms.length ? `${left} ${plural(left, 'ход', 'хода', 'ходов')}` : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {picked && (
        <>
          <div className={styles.weekHead}>
            {shortDate(picked)} – {shortDate(addDays(picked, 6))}
            {picked === thisWeek && ' · эта неделя'}
            {picked <= thisWeek && ` · в лист +${score.byWeek[picked] ?? 0}`}
            {ms && <span className={styles.weekMark}> · {ms.label}</span>}
          </div>
          {list.length === 0 ? (
            <p className={styles.empty}>{ms?.kind === 'pause' ? 'Ничего не строим.' : 'Ходов на эту неделю нет.'}</p>
          ) : (
            <ul className={styles.weekList}>
              {list.map((c) => (
                <li key={c.id}>
                  <Row c={c} stage={stageOf(c.map.stage)} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function Later({ cards }: { cards: Card[] }) {
  const [open_, setOpen] = useState(false);
  return (
    <section className={styles.section}>
      <button type="button" className={styles.linkBtn} onClick={() => setOpen(!open_)}>
        {open_ ? 'свернуть «потом»' : `потом, после открытия: ${cards.length}`}
      </button>
      {open_ && (
        <ul className={styles.weekList} style={{ marginTop: 10 }}>
          {cards.map((c) => (
            <li key={c.id}>
              <Link href={open(c.id)} className={`${styles.row} ${styles.rowLater}`}>
                <Ring progress={c.progress} size={18} stroke={3} />
                <span>{c.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
