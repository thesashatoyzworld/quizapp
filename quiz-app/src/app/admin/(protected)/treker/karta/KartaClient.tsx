'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { TaskView } from '@/lib/tracker/data';
import {
  LEVELS,
  MAX_LEVEL,
  UNLOCK_AFTER,
  addDays,
  daysBetween,
  milestoneOfWeek,
  mondayOf,
  shortDate,
  todayLocal,
  weeksUntil,
  type MapView,
} from '@/lib/tracker/karta-shared';
import Ring from '../Ring';
import styles from './karta.module.css';

type Card = TaskView & { map: NonNullable<TaskView['map']> };

const open = (id: string) => `/admin/treker?t=${id}`;
const isDone = (t: TaskView) => t.progress >= 1;

export default function KartaClient({ map: initialMap, tasks }: { map: MapView; tasks: TaskView[] }) {
  const [map, setMap] = useState(initialMap);
  const [error, setError] = useState<string | null>(null);

  const today = todayLocal();
  const thisWeek = mondayOf(today);
  const cards = useMemo(
    () => tasks.filter((t): t is Card => !!t.map && !t.archived),
    [tasks],
  );
  const doneNow = cards.filter(isDone).length;
  const toUnlock = Math.max(0, UNLOCK_AFTER - (doneNow - map.levelBase));
  const goal = map.goalTaskId ? tasks.find((t) => t.id === map.goalTaskId) : undefined;
  const daysLeft = daysBetween(today, map.deadline);
  // Заряд цели = доля сделанного из того, что нужно к запуску.
  const needed = cards.filter((c) => !c.map.later);
  const launchProgress = needed.length ? needed.reduce((s, c) => s + Math.min(1, c.progress), 0) / needed.length : 0;

  const weekCards = (w: string) => cards.filter((c) => !c.map.later && c.map.week === w);
  // Хвосты прошлых недель тоже «на этой неделе»: несделанное не пропадает.
  const nowList = cards
    .filter((c) => !c.map.later && !isDone(c) && c.map.week && c.map.week <= thisWeek)
    .sort((a, b) => (a.map.week! < b.map.week! ? -1 : a.map.week! > b.map.week! ? 1 : 0));
  const top3 = nowList.slice(0, 3);

  async function act(body: Record<string, unknown>) {
    setError(null);
    const res = await fetch('/api/admin/tracker/karta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: map.id, ...body }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return setError(json.error || `ошибка ${res.status}`);
    if (json.map) setMap(json.map);
  }

  const fresh = (n: number) => map.level >= n && n > 1 && !map.hintsSeen.includes(`level${n}`);

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <Link href="/admin/treker" className={styles.back}>
          ← Трекер
        </Link>
        <Levels level={map.level} />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <header className={styles.goal}>
        <Ring progress={launchProgress} size={72} stroke={6} label={`${Math.round(launchProgress * 100)}%`} />
        <div>
          <div className={styles.kicker}>{map.title}</div>
          <h1 className={styles.goalTitle}>{goal?.title ?? 'Цель запуска'}</h1>
          <div className={styles.goalSub}>
            {daysLeft > 0 ? `до запуска ${daysLeft} ${plural(daysLeft, 'день', 'дня', 'дней')}` : 'запуск'} ·{' '}
            {shortDate(map.deadline)}
          </div>
        </div>
      </header>

      {/* Уровень 1: три дела этой недели. */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Сейчас</h2>
        {top3.length === 0 ? (
          <p className={styles.empty}>На этой неделе всё сделано.</p>
        ) : (
          <div className={styles.now}>
            {top3.map((c) => (
              <Link key={c.id} href={open(c.id)} className={styles.nowCard}>
                <Ring progress={c.progress} size={44} stroke={4} />
                <span className={styles.nowTitle}>{c.title}</span>
                {c.map.week! < thisWeek && <span className={styles.tail}>с прошлой недели</span>}
              </Link>
            ))}
          </div>
        )}
        {map.level === 1 && nowList.length > 3 && (
          <p className={styles.more}>и ещё {nowList.length - 3} на этой неделе, они появятся, когда закроешь эти</p>
        )}
      </section>

      {map.level >= 2 && (
        <Reveal fresh={fresh(2)} n={2} onSeen={() => act({ action: 'seeHint', hint: 'level2' })}>
          <Timeline map={map} thisWeek={thisWeek} weekCards={weekCards} />
        </Reveal>
      )}

      {map.level >= 3 && (
        <Reveal fresh={fresh(3)} n={3} onSeen={() => act({ action: 'seeHint', hint: 'level3' })}>
          <StoryMap map={map} cards={cards} later={map.level >= 4} fresh4={fresh(4)} onSeen4={() => act({ action: 'seeHint', hint: 'level4' })} />
        </Reveal>
      )}

      <footer className={styles.unlock}>
        {map.level < MAX_LEVEL &&
          (toUnlock === 0 ? (
            <button type="button" className={styles.unlockReady} onClick={() => act({ action: 'levelUp', doneNow })}>
              Открыть уровень {map.level + 1}: {LEVELS[map.level].name}
            </button>
          ) : (
            <div className={styles.unlockWait}>
              <div className={styles.unlockBar}>
                {Array.from({ length: UNLOCK_AFTER }, (_, i) => (
                  <span key={i} className={i < UNLOCK_AFTER - toUnlock ? styles.pipOn : styles.pip} />
                ))}
              </div>
              <span>
                Закрой ещё {toUnlock} {plural(toUnlock, 'дело', 'дела', 'дел')}, и откроется «{LEVELS[map.level].name}»
              </span>
              <button type="button" className={styles.linkBtn} onClick={() => act({ action: 'levelUp', doneNow })}>
                открыть сейчас
              </button>
            </div>
          ))}
        {map.level > 1 && (
          <button type="button" className={styles.linkBtn} onClick={() => act({ action: 'levelDown', doneNow })}>
            слишком много, вернуть уровень {map.level - 1}
          </button>
        )}
      </footer>
    </div>
  );
}

function Levels({ level }: { level: number }) {
  return (
    <ol className={styles.levels} aria-label="Уровни карты">
      {LEVELS.map((l) => (
        <li key={l.n} className={l.n <= level ? styles.levelOn : styles.levelOff} title={l.name}>
          <span className={styles.levelDot}>{l.n <= level ? l.n : '🔒'}</span>
          <span className={styles.levelName}>{l.name}</span>
        </li>
      ))}
    </ol>
  );
}

/** Новый слой: один раз подсвечен с подсказкой в одну строку, потом обычный. */
function Reveal({ fresh, n, onSeen, children }: { fresh: boolean; n: number; onSeen: () => void; children: React.ReactNode }) {
  const [glow] = useState(fresh);
  useEffect(() => {
    if (fresh) onSeen();
    // Отмечаем один раз при появлении слоя.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section className={`${styles.section} ${glow ? styles.fresh : ''}`}>
      {glow && (
        <div className={styles.freshHint}>
          <b>Новое: {LEVELS[n - 1].name}.</b> {LEVELS[n - 1].hint}
        </div>
      )}
      {children}
    </section>
  );
}

function Timeline({
  map,
  thisWeek,
  weekCards,
}: {
  map: MapView;
  thisWeek: string;
  weekCards: (w: string) => Card[];
}) {
  const weeks = weeksUntil(thisWeek, map.deadline);
  const [picked, setPicked] = useState(thisWeek);
  const list = weekCards(picked).sort((a, b) => Number(isDone(a)) - Number(isDone(b)));
  const ms = milestoneOfWeek(map.milestones, picked);

  return (
    <>
      <h2 className={styles.h2}>Неделя за неделей</h2>
      <div className={styles.timeline}>
        {weeks.map((w) => {
          const cs = weekCards(w);
          const done = cs.filter(isDone).length;
          const m = milestoneOfWeek(map.milestones, w);
          const pause = m?.kind === 'pause';
          const launch = m?.kind === 'launch';
          return (
            <button
              key={w}
              type="button"
              onClick={() => setPicked(w)}
              className={[
                styles.week,
                w === thisWeek ? styles.weekNow : '',
                w === picked ? styles.weekPicked : '',
                pause ? styles.weekPause : '',
                launch ? styles.weekLaunch : '',
              ].join(' ')}
              title={m?.label}
            >
              <span className={styles.weekDate}>{launch ? '🚀' : shortDate(w)}</span>
              {cs.length > 0 ? (
                <span className={styles.weekBar}>
                  <span style={{ width: `${(done / cs.length) * 100}%` }} />
                </span>
              ) : (
                <span className={styles.weekNone}>{pause ? 'пауза' : ''}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.weekHead}>
        {shortDate(picked)} – {shortDate(addDays(picked, 6))}
        {picked === thisWeek && ' · эта неделя'}
        {ms && <span className={styles.weekMark}> · {ms.label}</span>}
      </div>
      {list.length === 0 ? (
        <p className={styles.empty}>{ms?.kind === 'pause' ? 'Ничего не строим.' : 'На эту неделю дел нет.'}</p>
      ) : (
        <ul className={styles.weekList}>
          {list.map((c) => (
            <li key={c.id}>
              <Link href={open(c.id)} className={`${styles.row} ${isDone(c) ? styles.rowDone : ''}`}>
                <Ring progress={c.progress} size={22} stroke={3} />
                <span>{c.title}</span>
                <span className={styles.stageTag}>{map.stages.find((s) => s.key === c.map.stage)?.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function StoryMap({
  map,
  cards,
  later,
  fresh4,
  onSeen4,
}: {
  map: MapView;
  cards: Card[];
  later: boolean;
  fresh4: boolean;
  onSeen4: () => void;
}) {
  const byStage = (key: string, l: boolean) =>
    cards
      .filter((c) => c.map.stage === key && c.map.later === l)
      .sort((a, b) => Number(isDone(a)) - Number(isDone(b)) || (a.map.week ?? '9').localeCompare(b.map.week ?? '9'));
  const [glow4] = useState(fresh4);
  useEffect(() => {
    if (later && fresh4) onSeen4();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [later]);

  return (
    <>
      <h2 className={styles.h2}>Путь клиента</h2>
      <div className={styles.mapScroll}>
        <div className={styles.map} style={{ gridTemplateColumns: `repeat(${map.stages.length}, minmax(150px, 1fr))` }}>
          {map.stages.map((s, i) => (
            <div key={s.key} className={styles.stageHead}>
              <span className={styles.stageN}>{i + 1}</span>
              {s.title}
              {s.hint && <span className={styles.stageHint}>{s.hint}</span>}
            </div>
          ))}
          {map.stages.map((s) => (
            <div key={s.key} className={styles.col}>
              {byStage(s.key, false).map((c) => (
                <MapCard key={c.id} c={c} />
              ))}
            </div>
          ))}
          <div className={styles.line} style={{ gridColumn: `1 / -1` }}>
            <span>к запуску {shortDate(map.deadline)}</span>
          </div>
          {later &&
            map.stages.map((s) => (
              <div key={s.key} className={`${styles.col} ${styles.colLater} ${glow4 ? styles.fresh : ''}`}>
                {byStage(s.key, true).map((c) => (
                  <MapCard key={c.id} c={c} />
                ))}
              </div>
            ))}
        </div>
      </div>
      {later && glow4 && (
        <div className={styles.freshHint}>
          <b>Новое: {LEVELS[3].name}.</b> {LEVELS[3].hint}
        </div>
      )}
    </>
  );
}

function MapCard({ c }: { c: Card }) {
  return (
    <Link href={open(c.id)} className={`${styles.mapCard} ${isDone(c) ? styles.mapCardDone : ''}`}>
      <Ring progress={c.progress} size={18} stroke={3} />
      <span className={styles.mapCardTitle} title={c.title}>
        {c.title}
      </span>
      {c.map.week && !isDone(c) && <span className={styles.mapCardWeek}>{shortDate(c.map.week)}</span>}
    </Link>
  );
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
