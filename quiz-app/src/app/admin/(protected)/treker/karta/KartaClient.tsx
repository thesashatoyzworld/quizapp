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
  type PathStep,
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
  const openDetails = (target: 'schet' | 'put' = 'schet') => {
    setOpened(true);
    requestAnimationFrame(() =>
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
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
      <GoalReactor
        total={score.total}
        fresh={weekNow}
        plan={plan}
        deadline={map.deadline}
        onOpen={() => openDetails('schet')}
        onPath={() => openDetails('put')}
      />

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

          {map.path.length > 0 && <ClientPath path={map.path} cards={cards} thisWeek={thisWeek} />}

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
 * Задник: сфера из точечных нитей, расходящихся из центра (референс Саши, Pinterest 18.11).
 * 90 длинных нитей = 90 мест в листе: у записавшихся на конце горит точка
 * (эта неделя зелёная, раньше бирюзовая), остальные ждут тусклыми. Вокруг тонкие нити для объёма.
 * Canvas + rAF: медленно вращается в 3D, нити шевелятся, при входе прорастают из центра.
 */
function StrandSphere({ total, fresh }: { total: number; fresh: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const N = LIST_TARGET;
    const filled = Math.min(N, total);
    const freshFrom = filled - Math.min(fresh, filled);
    const FILL = Math.min(2400, 700 + filled * 90);
    const DELAY = 450;

    // Детерминированный рандом: сфера одна и та же при каждом открытии.
    let seed = 360;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

    type Strand = {
      d: [number, number, number];
      u: [number, number, number];
      v: [number, number, number];
      len: number;
      freq: number;
      amp: number;
      ph: number;
      speed: number;
      person: number; // -1 = просто нить
      dots: number;
    };
    const strands: Strand[] = [];
    const make = (person: number) => {
      // равномерно по сфере
      const z = rnd() * 2 - 1;
      const a = rnd() * Math.PI * 2;
      const s = Math.sqrt(1 - z * z);
      const d: [number, number, number] = [s * Math.cos(a), s * Math.sin(a), z];
      // два перпендикуляра для завитков
      const t: [number, number, number] = Math.abs(d[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      const u: [number, number, number] = [
        d[1] * t[2] - d[2] * t[1],
        d[2] * t[0] - d[0] * t[2],
        d[0] * t[1] - d[1] * t[0],
      ];
      const ul = Math.hypot(...u);
      u[0] /= ul;
      u[1] /= ul;
      u[2] /= ul;
      const v: [number, number, number] = [
        d[1] * u[2] - d[2] * u[1],
        d[2] * u[0] - d[0] * u[2],
        d[0] * u[1] - d[1] * u[0],
      ];
      const len = person >= 0 ? 0.88 + rnd() * 0.12 : 0.25 + rnd() * 0.7;
      strands.push({
        d,
        u,
        v,
        len,
        freq: 3 + rnd() * 7,
        amp: 0.05 + rnd() * 0.1,
        ph: rnd() * Math.PI * 2,
        speed: 0.25 + rnd() * 0.5,
        person,
        dots: Math.round(len * (person >= 0 ? 95 : 62)),
      });
    };
    for (let i = 0; i < N; i++) make(i);
    for (let i = 0; i < 330; i++) make(-1);

    let W = 0;
    let H = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    let raf = 0;
    let t0 = 0;
    const frame = (now: number) => {
      if (!t0) t0 = now;
      const e = now - t0;
      const ts = e / 1000;
      const grow = 1 - Math.pow(1 - Math.min(1, e / 1800), 3);
      const k = Math.min(1, Math.max(0, (e - DELAY) / FILL));
      const lit = Math.round((1 - Math.pow(1 - k, 4)) * filled);
      const breath = k < 1 ? 0.6 : (1 - Math.cos(((e - DELAY - FILL) / 2600) * 2 * Math.PI)) / 2;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.46;
      const ay = ts * 0.06;
      const ax = 0.35 + Math.sin(ts * 0.05) * 0.12;
      const cyA = Math.cos(ay);
      const syA = Math.sin(ay);
      const cxA = Math.cos(ax);
      const sxA = Math.sin(ax);
      const F = 3.2;

      const project = (x: number, y: number, z: number) => {
        const x1 = x * cyA + z * syA;
        const z1 = -x * syA + z * cyA;
        const y2 = y * cxA - z1 * sxA;
        const z2 = y * sxA + z1 * cxA;
        const p = F / (F + z2);
        return [cx + x1 * R * p, cy + y2 * R * p, z2, p] as const;
      };

      for (const s of strands) {
        const n = Math.max(1, Math.floor(s.dots * grow));
        const sway = ts * s.speed + s.ph;
        const isP = s.person >= 0;
        for (let j = 1; j <= n; j++) {
          const r = (j / s.dots) * s.len;
          const w = Math.sin(r * s.freq + sway) * s.amp * r * 1.6;
          const w2 = Math.cos(r * s.freq * 0.7 + sway * 1.3) * s.amp * r * 1.2;
          const x = s.d[0] * r + s.u[0] * w + s.v[0] * w2;
          const y = s.d[1] * r + s.u[1] * w + s.v[1] * w2;
          const z = s.d[2] * r + s.u[2] * w + s.v[2] * w2;
          const [px, py, pz] = project(x, y, z);
          // центр приглушён, чтобы читалось число; задние точки темнее
          const fadeIn = 0.12 + 0.88 * Math.min(1, Math.max(0, (r - 0.12) / 0.32));
          const depth = 0.45 + 0.55 * (1 - (pz + 1) / 2);
          const a = (isP ? 0.5 : 0.3) * fadeIn * depth;
          if (a < 0.01) continue;
          ctx.fillStyle = `rgba(190,255,235,${a.toFixed(3)})`;
          const sz = isP ? 1.4 : 1.1;
          ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
        }
        // узел на конце нити
        if (grow > 0.98) {
          const r = s.len;
          const w = Math.sin(r * s.freq + sway) * s.amp * r * 1.6;
          const w2 = Math.cos(r * s.freq * 0.7 + sway * 1.3) * s.amp * r * 1.2;
          const [px, py, pz] = project(
            s.d[0] * r + s.u[0] * w + s.v[0] * w2,
            s.d[1] * r + s.u[1] * w + s.v[1] * w2,
            s.d[2] * r + s.u[2] * w + s.v[2] * w2,
          );
          const depth = 0.4 + 0.6 * (1 - (pz + 1) / 2);
          if (isP && s.person < lit) {
            const col = s.person >= freshFrom ? '0,255,136' : '0,240,255';
            const g = 7 + 5 * breath;
            const grad = ctx.createRadialGradient(px, py, 0, px, py, g);
            grad.addColorStop(0, `rgba(${col},${(0.9 * depth).toFixed(3)})`);
            grad.addColorStop(1, `rgba(${col},0)`);
            ctx.fillStyle = grad;
            ctx.fillRect(px - g, py - g, g * 2, g * 2);
            ctx.fillStyle = `rgba(240,255,248,${depth.toFixed(3)})`;
            ctx.fillRect(px - 1.4, py - 1.4, 2.8, 2.8);
          } else if (isP) {
            ctx.fillStyle = `rgba(255,255,255,${(0.28 * depth).toFixed(3)})`;
            ctx.fillRect(px - 1.1, py - 1.1, 2.2, 2.2);
          } else {
            ctx.fillStyle = `rgba(220,255,245,${(0.22 * depth).toFixed(3)})`;
            ctx.fillRect(px - 0.8, py - 0.8, 1.6, 1.6);
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [total, fresh]);

  return <canvas ref={ref} className={styles.sphere} aria-hidden />;
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
  onPath,
}: {
  total: number;
  fresh: number;
  plan: number;
  deadline: string;
  onOpen: () => void;
  onPath: () => void;
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
        <StrandSphere total={total} fresh={fresh} />
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
        <div className={`${styles.rPace} ${total >= plan ? styles.rPaceUp : styles.rPaceDown}`}>
          <span className={styles.rPaceArrow} aria-hidden>
            {total >= plan ? '▲' : '▼'}
          </span>
          {total >= plan ? `+${total - plan} к графику` : `−${plan - total} к графику`}
          <span className={styles.rPacePlan}>по плану сегодня {plan}</span>
        </div>
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
      <button type="button" className={styles.rPath} onClick={onPath}>
        путь клиента
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

type PointState = 'done' | 'now' | 'week' | 'later' | 'none';

/** Состояние точки пути по её задачам: готово, в работе к неделе, после запуска или задачи нет. */
function pointState(
  p: PathStep['points'][number],
  tasks: Card[],
  thisWeek: string,
): { state: PointState; label: string } {
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

const PATH_KEY = 'karta-put-shown';

/**
 * Путь клиента: шаги человека от «увидел» до результата. Открываются по одному кнопкой «дальше»,
 * в каждом точки, которые человек встречает, и что к ним готово.
 */
function ClientPath({ path, cards, thisWeek }: { path: PathStep[]; cards: Card[]; thisWeek: string }) {
  const [shown, setShown] = useState(1);
  const [fresh, setFresh] = useState<number | null>(null);
  const [openPoint, setOpenPoint] = useState<string | null>(null);

  useEffect(() => {
    try {
      const n = Number(localStorage.getItem(PATH_KEY));
      if (n >= 1) setShown(Math.min(path.length, n));
    } catch {}
  }, [path.length]);

  const show = (n: number) => {
    setShown(n);
    setFresh(n - 1);
    try {
      localStorage.setItem(PATH_KEY, String(n));
    } catch {}
    requestAnimationFrame(() =>
      document.getElementById(`put-${n - 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
  };

  const steps = path.map((s) => {
    const points = s.points.map((p) => {
      const tasks = cards.filter((c) => c.map.point === p.key);
      return { ...p, tasks, ...pointState(p, tasks, thisWeek) };
    });
    const done = points.filter((p) => p.state === 'done').length;
    const prep = points.filter((p) => p.state === 'now' || p.state === 'week' || p.state === 'none').length;
    return { ...s, points, done, prep };
  });
  const prepAll = steps.reduce((n, s) => n + s.prep, 0);
  const next = steps[shown];

  return (
    <section id="put" className={`${styles.section} ${styles.putSection}`}>
      <h2 className={styles.h2}>
        Путь клиента
        <span className={styles.h2Count}>
          {' '}
          · шаг {shown} из {steps.length}
        </span>
      </h2>

      <ol className={styles.path}>
        {steps.slice(0, shown).map((s, i) => (
          <li
            key={s.key}
            id={`put-${i}`}
            className={`${styles.pStep} ${i === fresh ? styles.pStepNew : ''}`}
            style={{ '--f': s.points.length ? s.done / s.points.length : 0 } as React.CSSProperties}
          >
            <div className={styles.pRail}>
              <span className={styles.pNum}>{i + 1}</span>
            </div>
            <div className={styles.pBody}>
              <div className={styles.pHead}>
                <span className={styles.pTitle}>{s.title}</span>
                <span className={styles.pCount}>
                  готово {s.done} из {s.points.length}
                </span>
              </div>
              <div className={styles.pDoes}>человек {s.does}</div>
              <ul className={styles.pPoints}>
                {s.points.map((p) => {
                  const isOpen = openPoint === p.key;
                  return (
                    <li key={p.key}>
                      <button
                        type="button"
                        className={styles.pPoint}
                        data-state={p.state}
                        aria-expanded={isOpen}
                        disabled={!p.tasks.length}
                        onClick={() => setOpenPoint(isOpen ? null : p.key)}
                      >
                        <span className={styles.pDot} aria-hidden />
                        <span className={styles.pPointTitle}>{p.title}</span>
                        <span className={styles.pState}>{p.label}</span>
                      </button>
                      {isOpen && (
                        <ul className={styles.pTasks}>
                          {p.tasks.map((c) => (
                            <li key={c.id}>
                              <Link href={open(c.id)} className={`${styles.row} ${isDone(c) ? styles.rowDone : ''}`}>
                                <Ring progress={c.progress} size={20} stroke={3} />
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
                    </li>
                  );
                })}
              </ul>
              {s.prep > 0 && (
                <div className={styles.pPrep}>
                  подготовить до открытия: {s.prep} {plural(s.prep, 'точку', 'точки', 'точек')}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      {next ? (
        <button type="button" className={styles.pNext} onClick={() => show(shown + 1)}>
          <span className={styles.pNextKicker}>дальше</span>
          <span>{next.title}</span>
          <span className={styles.rOpenArrow} aria-hidden>
            →
          </span>
        </button>
      ) : (
        <div className={styles.pEnd}>
          Весь путь открыт · подготовить до открытия: {prepAll} {plural(prepAll, 'точку', 'точки', 'точек')}
          <button type="button" className={styles.linkBtn} onClick={() => show(1)}>
            свернуть путь
          </button>
        </div>
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
