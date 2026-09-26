import type { CSSProperties } from 'react';
import {
  PLAN_EVENTS,
  PLAN_KICKER,
  PLAN_NOTES,
  PLAN_VIDEOS,
  type PlanEvent,
} from '@/lib/content-plan/youtube';
import styles from './kontent.module.css';

export const dynamic = 'force-dynamic';

const TZ = 'Europe/Moscow';
const DAY_MS = 86_400_000;
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

/** 'YYYY-MM-DD' -> UTC midnight ms. Day-granular, so UTC avoids DST drift. */
function toMs(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function toIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Monday-based weekday index 0..6. */
function weekdayIdx(ms: number): number {
  return (new Date(ms).getUTCDay() + 6) % 7;
}

function todayIso(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${d}.${String(m).padStart(2, '0')}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function KontentPage() {
  const today = todayIso();
  const videos = new Map(PLAN_VIDEOS.map((v) => [v.id, v]));

  const byDate = new Map<string, PlanEvent[]>();
  for (const ev of PLAN_EVENTS) {
    const list = byDate.get(ev.date) ?? [];
    list.push(ev);
    byDate.set(ev.date, list);
  }

  const eventMs = PLAN_EVENTS.map((e) => toMs(e.date));
  const first = Math.min(...eventMs);
  const last = Math.max(...eventMs);
  const start = first - weekdayIdx(first) * DAY_MS;
  const end = last + (6 - weekdayIdx(last)) * DAY_MS;

  const days: string[] = [];
  for (let t = start; t <= end; t += DAY_MS) days.push(toIso(t));

  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameYear = startDate.getUTCFullYear() === endDate.getUTCFullYear();
  const sameMonth = sameYear && startDate.getUTCMonth() === endDate.getUTCMonth();
  const title = sameMonth
    ? `${capitalize(MONTHS[startDate.getUTCMonth()])} ${endDate.getUTCFullYear()}`
    : `${capitalize(MONTHS[startDate.getUTCMonth()])}${sameYear ? '' : ` ${startDate.getUTCFullYear()}`} – ${MONTHS[endDate.getUTCMonth()]} ${endDate.getUTCFullYear()}`;

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <p className={styles.kicker}>{PLAN_KICKER}</p>
          <h1 className={styles.h1}>{title}</h1>
        </div>
        <div className={styles.legend}>
          {PLAN_VIDEOS.map((v) => (
            <span key={v.id} className={styles.legendItem} style={{ '--c': v.color } as CSSProperties}>
              {v.title} · выход {shortDate(v.releaseDate)}
            </span>
          ))}
        </div>
      </header>

      <div className={styles.cal}>
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={`${styles.wd} ${i >= 5 ? styles.we : ''}`}>
            {w}
          </div>
        ))}

        {days.map((iso, i) => {
          const events = byDate.get(iso) ?? [];
          const isToday = iso === today;
          const isPast = iso < today;
          const isRelease = events.some((e) => e.kind === 'release');
          const [, m, d] = iso.split('-').map(Number);
          const showMonth = i === 0 || d === 1;

          const cls = [
            styles.cell,
            events.length === 0 ? styles.empty : '',
            isPast ? styles.past : '',
            isToday ? styles.today : '',
            isRelease ? styles.pub : '',
          ].join(' ');

          return (
            <div key={iso} className={cls}>
              <div className={styles.num}>
                <span className={styles.day}>{d}</span>
                {showMonth && <small>{MONTHS_SHORT[m - 1]}</small>}
                <small className={styles.mobileWd}>{WEEKDAYS[i % 7]}</small>
                {isToday && <small>сегодня</small>}
              </div>
              {events.map((ev, j) => {
                const video = ev.videoId ? videos.get(ev.videoId) : undefined;
                const evCls = [
                  styles.ev,
                  ev.kind === 'free' ? styles.free : '',
                  ev.kind === 'shoot' || ev.kind === 'release' ? styles.big : '',
                ].join(' ');
                const prefix = ev.kind === 'done' ? '✓ ' : ev.kind === 'release' ? '▶ ' : '';
                return (
                  <div
                    key={j}
                    className={evCls}
                    style={video ? ({ '--c': video.color } as CSSProperties) : undefined}
                    title={video?.title}
                  >
                    {prefix}
                    {ev.text}
                    {ev.who && <i> · {ev.who}</i>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {PLAN_NOTES.length > 0 && (
        <div className={styles.notes}>
          {PLAN_NOTES.map((n) => (
            <div key={n.label} className={`${styles.box} ${n.risk ? styles.risk : ''}`}>
              <p className={styles.lbl}>{n.label}</p>
              {n.paragraphs.map((p, k) => (
                <p key={k}>{p}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
