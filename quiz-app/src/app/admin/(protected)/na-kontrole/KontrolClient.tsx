'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { WatchItem, WatchReport } from '@/lib/kontrol';
import styles from './kontrol.module.css';

/** За сколько дней до денег пора писать человеку самому. lib/kontrol тянет prisma, в браузер его не везём. */
const TALK_BEFORE_DAYS = 10;

// «Деньги на столе»: кто и когда должен занести, и видно ли по нему, что занесёт.
// Строка = человек. Слева дата и деньги, справа следы в кабинете и на карте,
// снизу заметка: что он говорит и чем рискуем.

const KIND_RU: Record<WatchItem['kind'], string> = {
  agreed: 'договорились',
  renewal: 'продление руками',
  auto: 'спишется само',
};

function rub(n: number): string {
  return `${n.toLocaleString('ru-RU')} ₽`;
}

function ddmm(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Moscow' });
}

function when(days: number): string {
  if (days < 0) return `просрочка ${-days} дн.`;
  if (days === 0) return 'сегодня';
  if (days === 1) return 'завтра';
  return `через ${days} дн.`;
}

function ago(days: number | null): string {
  if (days === null) return 'ни разу';
  if (days <= 0) return 'сегодня';
  if (days === 1) return 'вчера';
  return `${days} дн. назад`;
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400_000);
}

/** Флаги, из-за которых на человека надо смотреть прямо сейчас. */
function flags(i: WatchItem): { text: string; tone: 'hot' | 'warn' }[] {
  const out: { text: string; tone: 'hot' | 'warn' }[] = [];
  if (i.daysLeft < 0) out.push({ text: 'не заплатил', tone: 'hot' });
  if (i.chat?.lastSide === 'client') out.push({ text: 'ждёт ответа', tone: 'hot' });
  const noteAge = daysSince(i.noteAt);
  if (i.daysLeft >= 0 && i.daysLeft <= TALK_BEFORE_DAYS && (noteAge === null || noteAge > 7)) {
    out.push({ text: 'пора написать', tone: 'hot' });
  }
  if (i.tg && (i.lastSeenDays === null || i.lastSeenDays >= 7)) out.push({ text: 'не заходит в кабинет', tone: 'warn' });
  if (i.roadmap && i.roadmap.clientOverdue > 0) out.push({ text: `просрочил задач: ${i.roadmap.clientOverdue}`, tone: 'warn' });
  return out;
}

function Note({ item }: { item: WatchItem }) {
  const [text, setText] = useState(item.note);
  const [saved, setSaved] = useState(item.note);
  const [at, setAt] = useState(item.noteAt);
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle');

  async function save() {
    if (text === saved) return;
    setState('saving');
    const res = await fetch('/api/admin/watch-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: item.key, note: text }),
    }).catch(() => null);
    if (!res || !res.ok) {
      setState('error');
      return;
    }
    const body = (await res.json()) as { at: string };
    setSaved(text);
    setAt(text.trim() ? body.at : null);
    setState('idle');
  }

  return (
    <div className={styles.note}>
      <textarea
        className={styles.noteInput}
        value={text}
        placeholder="что говорит, что мешает, чем рискуем"
        rows={text ? Math.min(6, text.split('\n').length + 1) : 2}
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
      />
      <div className={styles.noteMeta}>
        {state === 'saving' && 'сохраняю…'}
        {state === 'error' && <span className={styles.err}>не сохранилось, попробуй ещё раз</span>}
        {state === 'idle' && text !== saved && 'сохранится, когда уберёшь курсор'}
        {state === 'idle' && text === saved && at && `обновлено ${ddmm(at)}`}
      </div>
    </div>
  );
}

function Row({ item }: { item: WatchItem }) {
  const f = flags(item);
  const due = item.daysLeft < 0 ? styles.dueHot : item.daysLeft <= TALK_BEFORE_DAYS ? styles.dueWarn : styles.due;

  return (
    <article className={styles.row}>
      <div className={styles.money}>
        <div className={due}>{ddmm(item.dueAt)}</div>
        <div className={styles.when}>{when(item.daysLeft)}</div>
        <div className={styles.amount}>
          {rub(item.amount)}
          {item.amountGuessed && <span className={styles.guess} title="оплат человека в базе нет, взята цена тарифа"> ≈</span>}
        </div>
        <div className={`${styles.kind} ${styles[item.kind]}`}>{KIND_RU[item.kind]}</div>
      </div>

      <div className={styles.body}>
        <div className={styles.head}>
          <span className={styles.name}>{item.who}</span>
          {item.username && !item.who.includes(`@${item.username}`) && <span className={styles.user}>@{item.username}</span>}
          {item.tier !== null && <span className={styles.tier}>т{item.tier}</span>}
        </div>
        <div className={styles.label}>
          {item.label}
          {item.kind === 'agreed' && (item.botReminders ? ' · бот напомнит сам' : ' · напоминаний нет, пишешь сам')}
        </div>

        {f.length > 0 && (
          <div className={styles.flags}>
            {f.map((x) => (
              <span key={x.text} className={x.tone === 'hot' ? styles.flagHot : styles.flagWarn}>{x.text}</span>
            ))}
          </div>
        )}

        <dl className={styles.signals}>
          {item.tg ? (
            <>
              <div>
                <dt>кабинет</dt>
                <dd className={item.lastSeenDays === null || item.lastSeenDays >= 7 ? styles.bad : undefined}>
                  {item.lastSeenDays === null && item.lessonsTotal === null ? 'доступ закрыт' : ago(item.lastSeenDays)}
                </dd>
              </div>
              {item.lessonsTotal !== null && (
                <div>
                  <dt>курс</dt>
                  <dd>{item.lessonsRead} из {item.lessonsTotal} уроков · {item.minutes} мин видео</dd>
                </div>
              )}
              <div>
                <dt>карта</dt>
                <dd>
                  {item.roadmap ? (
                    <Link href={`/admin/roadmaps/${item.roadmap.slug}`} className={styles.link}>
                      {item.roadmap.done} из {item.roadmap.total} задач
                    </Link>
                  ) : 'нет'}
                </dd>
              </div>
              {item.roadmap && (
                <div>
                  <dt>касание</dt>
                  <dd>{ddmm(item.roadmap.lastTouchAt)}</dd>
                </div>
              )}
              <div>
                <dt>писал сам</dt>
                <dd className={item.chat?.clientAt ? undefined : styles.muted}>
                  {item.chat?.clientAt ? ago(daysSince(item.chat.clientAt)) : 'переписки нет'}
                </dd>
              </div>
              {item.chat && (
                <div className={styles.wide}>
                  <dt>
                    последнее в телеграме · {item.chat.where} · {ddmm(item.chat.lastAt)}
                  </dt>
                  <dd>
                    <span className={styles.who}>{item.chat.lastSide === 'client' ? 'он:' : 'ты:'}</span> {item.chat.lastText}
                  </dd>
                </div>
              )}
              {item.roadmap?.nextClientTask && (
                <div className={styles.wide}>
                  <dt>ход клиента</dt>
                  <dd>{item.roadmap.nextClientTask}</dd>
                </div>
              )}
            </>
          ) : (
            <div className={styles.wide}>
              <dt>кабинет</dt>
              <dd>в боте его нет, следов не видно</dd>
            </div>
          )}
        </dl>

        <Note item={item} />
      </div>
    </article>
  );
}

export default function KontrolClient({ report }: { report: WatchReport }) {
  const [kind, setKind] = useState<'all' | 'agreed' | 'renewal'>('all');
  const shown = report.items.filter((i) =>
    kind === 'all' ? true : kind === 'agreed' ? i.kind === 'agreed' : i.kind !== 'agreed',
  );
  const hot = report.items.filter((i) => flags(i).some((f) => f.tone === 'hot')).length;

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>ДЕНЬГИ НА СТОЛЕ</h1>
      <p className={styles.sub}>
        от кого в ближайшие два месяца ждём оплату или продление, и видно ли по человеку, что он занесёт.
        заметка сохраняется сама
      </p>

      <div className={styles.totals}>
        <div>
          <div className={styles.totalValue}>{rub(report.agreed30)}</div>
          <div className={styles.totalLabel}>договорились, 30 дней</div>
        </div>
        <div>
          <div className={styles.totalValueDim}>{rub(report.renewal30)}</div>
          <div className={styles.totalLabel}>если продлятся, 30 дней</div>
        </div>
        <div>
          <div className={hot ? styles.totalHot : styles.totalValueDim}>{hot}</div>
          <div className={styles.totalLabel}>горят прямо сейчас</div>
        </div>
      </div>

      {report.waiting.length > 0 && (
        <section className={styles.waiting}>
          <div className={styles.waitingHead}>клиенты ждут ответа · {report.waiting.length}</div>
          {report.waiting.map((w) => (
            <div key={w.chatId} className={styles.waitingRow}>
              <div className={styles.waitingWho}>
                {w.where === 'рабочий' ? (
                  <Link href={`/admin/dialogi/${w.chatId}`} className={styles.link}>{w.who}</Link>
                ) : (
                  <span>{w.who}</span>
                )}
                <span className={styles.user}>
                  {w.username ? `@${w.username} · ` : ''}{w.where} · {ago(daysSince(w.at))}
                </span>
              </div>
              <div className={styles.waitingText}>{w.text}</div>
            </div>
          ))}
        </section>
      )}

      <div className={styles.tabs}>
        {([['all', 'все'], ['agreed', 'договорились'], ['renewal', 'продления']] as const).map(([k, t]) => (
          <button key={k} className={kind === k ? styles.tabOn : styles.tab} onClick={() => setKind(k)}>
            {t}
          </button>
        ))}
      </div>

      {shown.length === 0 && <p className={styles.empty}>никого</p>}
      <div className={styles.list}>
        {shown.map((i) => <Row key={i.key} item={i} />)}
      </div>

      <p className={styles.hint}>
        договорённость добавить: <code>node scripts/payment-due.mjs add &lt;tg&gt; &lt;ссылка&gt; &lt;сумма&gt; &lt;ДД.ММ.ГГГГ&gt; &quot;метка&quot; &quot;кто&quot;</code>
      </p>
    </div>
  );
}
