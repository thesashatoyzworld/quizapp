'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ClientRow, ClientsReport, Track } from '@/lib/clients';
import styles from './clients.module.css';

const TILES: { key: Exclude<Track, 'service'>; label: string; hint: string }[] = [
  { key: 'lichka', label: 'Личка', hint: 'веду один на один' },
  { key: 'group', label: 'Группа', hint: 'делаем вместе' },
  { key: 't2', label: 'Тариф 2', hint: 'карта и чат' },
];

const SWITCH: { key: Track; label: string }[] = [
  { key: 'lichka', label: 'личка' },
  { key: 'group', label: 'группа' },
  { key: 'service', label: 'не клиент' },
];

function ru(d: Date | string | null) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' }).format(new Date(d));
}

function money(v: number | null) {
  return v ? `${v.toLocaleString('ru-RU')} ₽` : '—';
}

export default function ClientsClient({ initial }: { initial: ClientsReport }) {
  const router = useRouter();
  const [open, setOpen] = useState<Exclude<Track, 'service'>>('lichka');
  const [saving, setSaving] = useState<string | null>(null);

  const counts = {
    lichka: initial.lichka.length,
    group: initial.group.length,
    t2: initial.t2.length,
  };
  const total = counts.lichka + counts.group + counts.t2;

  async function move(row: ClientRow, track: Track) {
    if (row.track === track) return;
    setSaving(row.accessId);
    await fetch('/api/admin/clients/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessId: row.accessId, track }),
    });
    setSaving(null);
    router.refresh();
  }

  const rows = initial[open];

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>КЛИЕНТЫ СЕЙЧАС</h1>
      <p className={styles.sub}>
        считаем по действующим доступам. служебные и партнёрские в счёт не идут — их видно кнопкой «не клиент»
      </p>

      <div className={styles.tiles}>
        {TILES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setOpen(t.key)}
            className={`${styles.tile} ${open === t.key ? styles.tileActive : ''}`}
          >
            <div className={styles.tileLabel}>{t.label}</div>
            <div className={styles.tileValue}>{counts[t.key]}</div>
            <div className={styles.tileHint}>{t.hint}</div>
          </button>
        ))}
      </div>

      <p className={styles.total}>
        всего в работе <b>{total}</b>
        {initial.service.length > 0 && ` · служебных доступов ${initial.service.length}`}
      </p>

      <h2 className={styles.groupTitle}>{TILES.find((t) => t.key === open)?.label.toUpperCase()}</h2>

      {rows.length === 0 && <p className={styles.empty}>здесь пока никого</p>}

      <div className={styles.cards}>
        {rows.map((row) => (
          <div key={row.accessId} className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.name}>{row.name}</span>
              <span className={styles.tier}>{row.productSlug.replace('uroven-', '')}</span>
            </div>

            <div className={styles.nick}>
              {row.username ? (
                <a href={`https://t.me/${row.username}`} target="_blank" rel="noreferrer">
                  @{row.username}
                </a>
              ) : (
                'телеграм не привязан'
              )}
            </div>

            <div className={styles.rows}>
              <div className={styles.row}>
                <span className={styles.k}>доступ</span>
                <span className={row.daysLeft !== null && row.daysLeft < 14 ? styles.vWarn : styles.v}>
                  {row.expiresAt
                    ? `до ${ru(row.expiresAt)}${row.daysLeft !== null ? ` · ${row.daysLeft} дн.` : ''}`
                    : 'бессрочно'}
                </span>
              </div>
              <div className={styles.row}>
                <span className={styles.k}>с нами с</span>
                <span className={styles.v}>{ru(row.grantedAt)}</span>
              </div>
              {row.paidAmount !== null && (
                <div className={styles.row}>
                  <span className={styles.k}>занёс</span>
                  <span className={styles.v}>{money(row.paidAmount)}</span>
                </div>
              )}
              <div className={styles.row}>
                <span className={styles.k}>карта</span>
                <span className={styles.v}>
                  {row.roadmapSlug ? (
                    <Link href={`/admin/roadmaps/${row.roadmapSlug}`}>открыть</Link>
                  ) : (
                    'не заведена'
                  )}
                </span>
              </div>
            </div>

            <div className={styles.switch}>
              {SWITCH.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  disabled={saving === row.accessId}
                  onClick={() => move(row, s.key)}
                  className={`${styles.switchBtn} ${row.track === s.key ? styles.switchOn : ''}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
