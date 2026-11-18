'use client';

import { useRef, useState } from 'react';
import type { Period } from '@/lib/tracker/periods';
import { TagEditor } from './Tags';
import styles from './treker.module.css';

type Found = {
  title: string;
  kind: 'quest' | 'routine';
  period: Period | null;
  tags: string[];
  note: string | null;
  existing: string | null;
  pick: boolean;
};

const MAX_SIDE = 2000;

/** Ужать фото с телефона до ~2000px JPEG: оригинал 5–10 МБ не пролезает в запрос. */
async function shrink(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('не открылось фото'));
      i.src = url;
    });
    const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * k);
    canvas.height = Math.round(img.naturalHeight * k);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const PERIOD_SHORT: Record<Period, string> = { day: 'день', week: 'неделя', month: 'месяц' };

export default function PhotoImport({
  knownTags,
  onCreate,
}: {
  knownTags: string[];
  /** Заводит одну задачу (с шагами от нейронки). Возвращает true, если получилось. */
  onCreate: (t: { title: string; kind: 'quest' | 'routine'; period?: Period; tags: string[]; note?: string }) => Promise<boolean>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<'idle' | 'reading' | 'review' | 'creating'>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [found, setFound] = useState<Found[]>([]);
  const [done, setDone] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setStage('reading');
    try {
      const image = await shrink(file);
      setPreview(image);
      const res = await fetch('/api/admin/tracker/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `ошибка ${res.status}`);
      const list = (json.tasks as Omit<Found, 'pick'>[]).map((t) => ({ ...t, pick: !t.existing }));
      if (!list.length) throw new Error('на фото не нашлось задач');
      setFound(list);
      setStage('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStage('idle');
    } finally {
      if (input.current) input.current.value = '';
    }
  }

  function patch(i: number, p: Partial<Found>) {
    setFound((all) => all.map((t, j) => (j === i ? { ...t, ...p } : t)));
  }

  async function createAll() {
    const picked = found.filter((t) => t.pick && t.title.trim());
    setStage('creating');
    setDone(0);
    // По три одновременно: каждая задача ждёт нейронку для шагов 10–20 с.
    let next = 0;
    const failed: Found[] = [];
    async function worker() {
      while (next < picked.length) {
        const t = picked[next++];
        const ok = await onCreate({
          title: t.title.trim(),
          kind: t.kind,
          period: t.kind === 'routine' ? (t.period ?? 'day') : undefined,
          tags: t.tags,
          note: t.note ?? undefined,
        });
        if (!ok) failed.push(t);
        setDone((d) => d + 1);
      }
    }
    await Promise.all([worker(), worker(), worker()]);
    if (failed.length) {
      setFound(failed.map((t) => ({ ...t, pick: true })));
      setError(`Не завелись ${failed.length}, попробуй ещё раз`);
      setStage('review');
    } else {
      close();
    }
  }

  function close() {
    setStage('idle');
    setFound([]);
    setPreview(null);
    setError(null);
  }

  const pickedCount = found.filter((t) => t.pick).length;

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {stage === 'idle' && (
        <button type="button" className={styles.photoBtn} onClick={() => input.current?.click()}>
          <span aria-hidden="true">📷</span> Фото из тетрадки
        </button>
      )}
      {error && stage === 'idle' && <div className={styles.error}>{error}</div>}

      {stage !== 'idle' && (
        <div className={styles.photoPanel}>
          <div className={styles.photoHead}>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL превью, оптимизировать нечего */}
            {preview && <img src={preview} alt="Страница тетрадки" className={styles.photoThumb} />}
            <div>
              <div className={styles.photoTitle}>
                {stage === 'reading' && 'Читаю почерк…'}
                {stage === 'review' && `Нашёл ${found.length} ${found.length === 1 ? 'задачу' : 'задач'}`}
                {stage === 'creating' && `Завожу и раскладываю на шаги: ${done} из ${found.filter((t) => t.pick).length}`}
              </div>
              <div className={styles.hint}>
                {stage === 'reading' && 'Обычно 10–20 секунд'}
                {stage === 'review' && 'Поправь, что прочитано не так, сними галочки с лишнего'}
                {stage === 'creating' && 'Круги появляются по мере готовности'}
              </div>
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}

          {stage === 'review' && (
            <>
              <ul className={styles.foundList}>
                {found.map((t, i) => (
                  <li key={i} className={`${styles.found} ${t.pick ? '' : styles.foundOff}`}>
                    <button
                      type="button"
                      className={`${styles.check} ${t.pick ? styles.checkOn : ''}`}
                      aria-pressed={t.pick}
                      aria-label={t.pick ? 'Не заводить' : 'Заводить'}
                      onClick={() => patch(i, { pick: !t.pick })}
                    >
                      <span className={styles.checkDot} />
                    </button>
                    <div className={styles.foundBody}>
                      <input
                        className={`${styles.input} ${styles.foundTitle}`}
                        value={t.title}
                        maxLength={200}
                        onChange={(e) => patch(i, { title: e.target.value })}
                      />
                      <div className={styles.foundMeta}>
                        <select
                          className={styles.select}
                          value={t.kind === 'routine' ? (t.period ?? 'day') : 'quest'}
                          onChange={(e) => {
                            const v = e.target.value;
                            patch(i, v === 'quest' ? { kind: 'quest', period: null } : { kind: 'routine', period: v as Period });
                          }}
                        >
                          <option value="quest">квест</option>
                          {(['day', 'week', 'month'] as Period[]).map((p) => (
                            <option key={p} value={p}>
                              регулярная · {PERIOD_SHORT[p]}
                            </option>
                          ))}
                        </select>
                        <TagEditor tags={t.tags} known={knownTags} onChange={(tags) => patch(i, { tags })} />
                      </div>
                      {t.note && <div className={styles.foundNote}>{t.note}</div>}
                      {t.existing && <div className={styles.foundExisting}>Уже есть в трекере: «{t.existing}»</div>}
                    </div>
                  </li>
                ))}
              </ul>
              <div className={styles.formRow}>
                <button type="button" className={styles.primary} disabled={!pickedCount} onClick={createAll}>
                  Завести {pickedCount}
                </button>
                <button type="button" className={styles.ghost} onClick={close}>
                  Отмена
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
