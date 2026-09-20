'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './idei.module.css';
import { TypeIcon, TYPE_LABEL, typeColor, typeLabel } from './TypeIcon';

const STATUS_LABEL: Record<string, string> = {
  raw: 'сырое',
  in_work: 'в работе',
  shipped: 'сняли',
  rejected: 'отклонили',
};

const SOURCE_LABEL: Record<string, string> = {
  channel: 'канал «Идеи»',
  'sneg-220': 'Даня, большие видео',
};

interface Ref {
  id: string;
  kind: string;
  url: string | null;
  domain: string | null;
  caption: string | null;
  tgLink: string;
  mediaUrl: string | null;
  thumbUrl: string | null;
}

interface Idea {
  id: string;
  source: string;
  title: string;
  type: string;
  summary: string | null;
  tags: string[];
  parsed: boolean;
  status: string;
  rawText: string | null;
  voiceTranscript: string | null;
  authorUsername: string | null;
  tgLink: string;
  occurredAt: string;
  refs: Ref[];
}

export default function IdeasClient({
  ideas,
  filters,
}: {
  ideas: Idea[];
  filters: { type?: string; source?: string; status?: string; q?: string };
}) {
  const router = useRouter();
  const [showRaw, setShowRaw] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Тумблер «сводка / исходник» переживает перезагрузку.
  useEffect(() => {
    setShowRaw(localStorage.getItem('ideas:showRaw') === '1');
  }, []);

  function toggleRaw() {
    const next = !showRaw;
    setShowRaw(next);
    localStorage.setItem('ideas:showRaw', next ? '1' : '0');
  }

  function setFilter(key: string, value: string) {
    const p = new URLSearchParams(filters as Record<string, string>);
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`/admin/idei?${p.toString()}`);
  }

  async function setStatus(id: string, status: string) {
    setErrors((e) => ({ ...e, [id]: '' }));
    try {
      const res = await fetch(`/api/admin/ideas/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const msg =
          res.status === 401
            ? 'Сессия истекла, обнови страницу'
            : 'Не получилось сменить статус';
        setErrors((e) => ({ ...e, [id]: msg }));
        return;
      }
      // Обновляем только после успеха: иначе старое значение перерисуется
      // так, будто клик не сработал.
      router.refresh();
    } catch {
      setErrors((e) => ({ ...e, [id]: 'Не получилось сменить статус, проверь связь' }));
    }
  }

  async function reparse(id: string) {
    setErrors((e) => ({ ...e, [id]: '' }));
    try {
      const res = await fetch(`/api/admin/ideas/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reparse: true }),
      });
      if (!res.ok) {
        const msg =
          res.status === 401
            ? 'Сессия истекла, обнови страницу'
            : 'Не получилось разобрать заново';
        setErrors((e) => ({ ...e, [id]: msg }));
        return;
      }
      router.refresh();
    } catch {
      setErrors((e) => ({ ...e, [id]: 'Не получилось разобрать заново, проверь связь' }));
    }
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={styles.h1}>Идеи</h1>
        <p className={styles.sub}>Лента идей из канала и от Дани. Статус двигаешь руками, исходник всегда рядом.</p>
        <div className={styles.typeRow}>
          <button
            className={filters.type ? styles.typeChip : styles.typeChipOn}
            onClick={() => setFilter('type', '')}
          >
            все
          </button>
          {Object.keys(TYPE_LABEL).map((v) => (
            <button
              key={v}
              className={filters.type === v ? styles.typeChipOn : styles.typeChip}
              style={{ ['--type-color' as string]: typeColor(v) }}
              onClick={() => setFilter('type', filters.type === v ? '' : v)}
            >
              <TypeIcon type={v} />
              {typeLabel(v)}
            </button>
          ))}
        </div>

        <div className={styles.controls}>
          <select value={filters.source || ''} onChange={(e) => setFilter('source', e.target.value)}>
            <option value="">все источники</option>
            {Object.entries(SOURCE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <select value={filters.status || ''} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">все статусы</option>
            {Object.entries(STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <button className={styles.toggle} onClick={toggleRaw}>
            {showRaw ? 'показывать сводку' : 'показывать исходник'}
          </button>
        </div>
      </header>

      {ideas.length === 0 && <p className={styles.empty}>Пока пусто.</p>}

      <div className={styles.list}>
        {ideas.map((i) => (
          <article
            key={i.id}
            className={styles.card}
            style={{ ['--type-color' as string]: typeColor(i.type) }}
          >
            <div className={styles.cardHead}>
              <span className={styles.badge}>
                <TypeIcon type={i.type} />
                {typeLabel(i.type)}
              </span>
              <h2 className={styles.title}>{i.title}</h2>
              {!i.parsed && <span className={styles.warn} title="модель не разобрала, заголовок из первых слов">не разобрано</span>}
            </div>

            <div className={styles.meta}>
              <span>{SOURCE_LABEL[i.source] || i.source}</span>
              <span>{new Date(i.occurredAt).toLocaleString('ru-RU')}</span>
              {i.authorUsername && <span>@{i.authorUsername}</span>}
              <a href={i.tgLink} target="_blank" rel="noreferrer">открыть в Telegram</a>
            </div>

            {showRaw || open === i.id ? (
              <div className={styles.raw}>
                {i.rawText && <pre className={styles.pre}>{i.rawText}</pre>}
                {i.voiceTranscript && (
                  <>
                    <div className={styles.rawLabel}>расшифровка голосового</div>
                    <pre className={styles.pre}>{i.voiceTranscript}</pre>
                  </>
                )}
                {!i.rawText && !i.voiceTranscript && <p className={styles.empty}>Только вложения.</p>}
              </div>
            ) : (
              i.summary && <p className={styles.summary}>{i.summary}</p>
            )}

            {i.refs.length > 0 && (
              <div className={styles.refs}>
                {i.refs.map((r) => {
                  if (r.kind === 'link') {
                    return (
                      <a key={r.id} className={styles.link} href={r.url || '#'} target="_blank" rel="noreferrer">
                        {r.domain}
                      </a>
                    );
                  }
                  if (r.kind === 'voice' || r.kind === 'audio') {
                    return r.mediaUrl ? <audio key={r.id} controls src={r.mediaUrl} className={styles.audio} /> : null;
                  }
                  if (r.kind === 'document') {
                    return (
                      <a key={r.id} className={styles.link} href={r.tgLink} target="_blank" rel="noreferrer">
                        {r.caption ? `документ: ${r.caption}` : 'документ'}
                      </a>
                    );
                  }
                  if (r.kind === 'video_note') {
                    if (r.thumbUrl) {
                      return (
                        <a key={r.id} href={r.tgLink} target="_blank" rel="noreferrer">
                          <img className={styles.thumb} src={r.thumbUrl} alt={r.caption || 'кружок'} loading="lazy" />
                        </a>
                      );
                    }
                    return (
                      <a key={r.id} className={styles.link} href={r.tgLink} target="_blank" rel="noreferrer">
                        кружок
                      </a>
                    );
                  }
                  const src = r.thumbUrl || r.mediaUrl;
                  return src ? (
                    <a key={r.id} href={r.tgLink} target="_blank" rel="noreferrer">
                      <img className={styles.thumb} src={src} alt={r.caption || r.kind} loading="lazy" />
                    </a>
                  ) : (
                    <a key={r.id} className={styles.link} href={r.tgLink} target="_blank" rel="noreferrer">
                      {r.caption || r.kind}
                    </a>
                  );
                })}
              </div>
            )}

            <div className={styles.actions}>
              {Object.entries(STATUS_LABEL).map(([v, l]) => (
                <button
                  key={v}
                  className={i.status === v ? styles.statusOn : styles.status}
                  data-status={v}
                  onClick={() => setStatus(i.id, v)}
                >
                  {l}
                </button>
              ))}
              <button className={styles.status} onClick={() => reparse(i.id)}>
                разобрать заново
              </button>
              <button className={styles.status} onClick={() => setOpen(open === i.id ? null : i.id)}>
                {open === i.id ? 'свернуть' : 'как было'}
              </button>
            </div>

            {errors[i.id] && <p className={styles.error}>{errors[i.id]}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
