'use client';

import Link from 'next/link';
import { useState } from 'react';
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
    : moves
        .filter((c) => !isDone(c) && c.map.week && c.map.week > thisWeek)
        .map((c) => c.map.week!)
        .sort()[0] ?? null;
  const early = nextWeek ? moves.filter((c) => c.map.week === nextWeek && !isDone(c)) : [];
  const [allNow, setAllNow] = useState(false);
  const shownNow = allNow ? nowList : nowList.slice(0, 3);

  const stageOf = (key: string) => map.stages.find((s) => s.key === key);

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <Link href="/admin/treker" className={styles.back}>
          ← Трекер
        </Link>
      </div>

      <header className={styles.score}>
        <div className={styles.kicker}>Лист ожидания «360»</div>
        <div className={styles.scoreLine}>
          <span className={styles.scoreNum}>{score.total}</span>
          <span className={styles.scoreOf}>из {LIST_TARGET}</span>
        </div>
        <div className={styles.scoreBar} aria-hidden>
          <span className={styles.scoreFill} style={{ width: `${Math.min(100, (score.total / LIST_TARGET) * 100)}%` }} />
          <span className={styles.scorePlan} style={{ left: `${Math.min(100, (plan / LIST_TARGET) * 100)}%` }} />
        </div>
        <div className={styles.scoreSub}>
          <span className={diff >= 0 ? styles.ahead : styles.behind}>
            {diff >= 0 ? `впереди графика на ${diff}` : `отстаёшь от графика на ${-diff}`}
          </span>
          {' · '}по графику сегодня {plan}
        </div>
        <div className={styles.scoreSub}>
          на этой неделе +{weekNow}, нужно ~{perWeek} в неделю ·{' '}
          {daysLeft > 0
            ? `до открытия набора ${daysLeft} ${plural(daysLeft, 'день', 'дня', 'дней')}, ${shortDate(map.deadline)}`
            : 'набор открыт'}
        </div>
        <div className={styles.scoreWhy}>90 в листе ≈ 30 оплат, если платит каждый третий</div>
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

      <Weeks map={map} weeks={weeks} thisWeek={thisWeek} score={score} perWeek={perWeek} moves={moves} stageOf={stageOf} />

      {later.length > 0 && <Later cards={later} />}
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
                    <span style={{ width: `${Math.min(100, (got / perWeek) * 100)}%` }} />
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
