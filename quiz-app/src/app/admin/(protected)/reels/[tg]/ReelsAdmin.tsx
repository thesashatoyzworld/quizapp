'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ReelsBoard, { REELS_BOARD_CSS } from '@/components/ReelsBoard';
import { addDays, todayIso, type Column, type ReelBriefView, type ReelVersionView } from '@/lib/reels/plan';
import styles from '../reels.module.css';

// Доска роликов одного клиента с правкой. Та же доска, что в кабинете, плюс
// кнопки этапов, формы ТЗ и версий, «расставить по дням» и просмотры.

interface Space {
  clientName: string;
  igHandle: string;
  briefs: ReelBriefView[];
  versions: ReelVersionView[];
}

type Form =
  | { kind: 'space' }
  | { kind: 'brief'; id?: string }
  | { kind: 'version'; id?: string };

const STAGE_LABEL: Record<string, string> = { tz: 'в ТЗ', done: 'смонтировано', up: 'выложено', skip: 'не выкладываем' };
const STATE_LABEL: Record<string, string> = { wait: 'ждём', go: 'в работе', ok: 'готово' };

export default function ReelsAdmin({ telegramId, space }: { telegramId: string; space: Space }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState<Form | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [inline, setInline] = useState<{ id: string; kind: 'date' | 'link' } | null>(null);
  const [inlineVal, setInlineVal] = useState('');
  const [viewer, setViewer] = useState<{ title: string; html: string } | null>(null);
  const today = todayIso();

  async function send(payload: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId, ...payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'не сохранилось');
      startTransition(() => router.refresh());
      return json;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'не сохранилось');
      return null;
    } finally {
      setBusy(false);
    }
  }

  const update = (id: string, data: Record<string, unknown>) => send({ op: 'update', entity: 'version', id, data });

  function openForm(f: Form) {
    setError('');
    setHtmlFile(null);
    if (f.kind === 'space') {
      setValues({ clientName: space.clientName, igHandle: space.igHandle });
    } else if (f.kind === 'brief') {
      const b = space.briefs.find((x) => x.id === f.id);
      setValues(b
        ? { title: b.title, label: b.label, summary: b.summary, state: b.state, stateLabel: b.stateLabel, order: String(b.order) }
        : { title: '', label: '', summary: '', state: 'wait', stateLabel: '', order: String(space.briefs.length + 1) });
    } else {
      const v = space.versions.find((x) => x.id === f.id);
      const maxOrder = space.versions.reduce((m, x) => Math.max(m, x.order), 0);
      setValues(v
        ? {
            briefId: v.briefId, reel: v.reel, title: v.title, version: v.version, order: String(v.order),
            stage: v.stage, planDate: v.planDate ?? '', uploadedAt: v.uploadedAt ?? '', note: v.note,
            link: v.code ? `https://www.instagram.com/reel/${v.code}/` : '',
          }
        : {
            briefId: space.briefs[space.briefs.length - 1]?.id ?? '', reel: '', title: '', version: '',
            order: String(maxOrder + 1), stage: 'tz', planDate: '', uploadedAt: '', note: '', link: '',
          });
    }
    setForm(f);
  }

  async function saveForm() {
    if (!form) return;
    let ok: unknown = null;
    if (form.kind === 'space') {
      ok = await send({ op: 'space', data: values });
    } else if (form.kind === 'brief') {
      const data: Record<string, unknown> = { ...values };
      if (htmlFile) data.html = await htmlFile.text();
      ok = await send({ op: form.id ? 'update' : 'create', entity: 'brief', id: form.id, data });
    } else {
      const { link, ...rest } = values;
      const data: Record<string, unknown> = { ...rest, link };
      if (rest.stage !== 'up') delete data.uploadedAt;
      ok = await send({ op: form.id ? 'update' : 'create', entity: 'version', id: form.id, data });
    }
    if (ok) setForm(null);
  }

  async function remove() {
    if (!form || form.kind === 'space' || !form.id) return;
    if (!window.confirm('Удалить насовсем?')) return;
    if (await send({ op: 'delete', entity: form.kind, id: form.id })) setForm(null);
  }

  async function submitInline(v: ReelVersionView) {
    if (!inline) return;
    const ok = inline.kind === 'link'
      ? await update(v.id, { stage: 'up', link: inlineVal })
      : await update(v.id, { planDate: inlineVal || null });
    if (ok) setInline(null);
  }

  async function openBrief(b: ReelBriefView) {
    try {
      const res = await fetch(`/api/admin/reels?brief=${encodeURIComponent(b.id)}`);
      const data = await res.json();
      if (data.html) setViewer({ title: b.title, html: data.html });
    } catch { /* noop */ }
  }

  async function autoPlan() {
    const r = await send({ op: 'autoplan' });
    if (r) setStatus(r.planned ? `расставлено: ${r.planned}` : 'нечего расставлять');
  }

  async function refreshStats() {
    setStatus('обновляю просмотры, это до пары минут…');
    const r = await send({ op: 'stats' });
    setStatus(r ? `обновлено ${r.updated} из ${r.reels}${r.missing ? `, не нашлось ${r.missing}` : ''}` : '');
  }

  function versionExtra(v: ReelVersionView, col: Column) {
    const btn = (label: string, onClick: () => void, primary = false) => (
      <button type="button" className={`rl-btn${primary ? ' rl-btn-primary' : ''}`} disabled={busy} onClick={onClick}>{label}</button>
    );
    const openInline = (kind: 'date' | 'link') => {
      setInline({ id: v.id, kind });
      setInlineVal(kind === 'date' ? v.planDate || addDays(today, 1) : '');
    };
    return (
      <>
        <div className="rl-acts">
          {col === 'tz' && btn('смонтирован', () => update(v.id, { stage: 'done' }), true)}
          {(col === 'done' || col === 'plan') && (
            <>
              {btn(col === 'plan' ? 'другой день' : 'на день', () => openInline('date'))}
              {btn('выложен по ссылке', () => openInline('link'), true)}
              {btn('в ТЗ', () => update(v.id, { stage: 'tz' }))}
            </>
          )}
          {col === 'up' && btn('снять отметку', () => update(v.id, { stage: 'done' }))}
          {col !== 'up' && btn('не выкладываем', () => update(v.id, { stage: 'skip' }))}
          {btn('изменить', () => openForm({ kind: 'version', id: v.id }))}
        </div>
        {inline?.id === v.id && (
          <form className="rl-form" onSubmit={(e) => { e.preventDefault(); submitInline(v); }}>
            <input className="rl-input" autoFocus autoComplete="off"
              type={inline.kind === 'date' ? 'date' : 'text'}
              placeholder={inline.kind === 'link' ? 'ссылка на рилс' : undefined}
              value={inlineVal} onChange={(e) => setInlineVal(e.target.value)} />
            <button className="rl-btn rl-btn-primary" type="submit" disabled={busy}>ок</button>
            <button className="rl-btn" type="button" onClick={() => setInline(null)} aria-label="Отмена">×</button>
          </form>
        )}
      </>
    );
  }

  const field = (key: string, label: string, props: Record<string, unknown> = {}) => (
    <label className={styles.field}>
      {label}
      <input className={styles.input} value={values[key] ?? ''} {...props}
        onChange={(e) => setValues((s) => ({ ...s, [key]: e.target.value }))} />
    </label>
  );
  const select = (key: string, label: string, options: Record<string, string>) => (
    <label className={styles.field}>
      {label}
      <select className={styles.input} value={values[key] ?? ''} onChange={(e) => setValues((s) => ({ ...s, [key]: e.target.value }))}>
        {Object.entries(options).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
    </label>
  );

  const skipped = space.versions.filter((v) => v.stage === 'skip');

  return (
    <>
      <div className={styles.toolbar}>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy} onClick={() => openForm({ kind: 'brief' })}>+ ТЗ</button>
        <button type="button" className={styles.btn} disabled={busy || space.briefs.length === 0} onClick={() => openForm({ kind: 'version' })}>+ версия</button>
        <button type="button" className={styles.btn} disabled={busy} onClick={refreshStats}>обновить просмотры</button>
        <button type="button" className={styles.btn} disabled={busy} onClick={() => openForm({ kind: 'space' })}>имя и инстаграм</button>
        {status && <span className={styles.status}>{status}</span>}
        {error && <span className={styles.error}>{error}</span>}
      </div>

      {form && (
        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            {form.kind === 'space' ? 'Шапка' : form.kind === 'brief' ? (form.id ? 'ТЗ' : 'Новое ТЗ') : (form.id ? 'Версия' : 'Новая версия')}
          </div>
          {form.kind === 'space' && (
            <div className={styles.row}>
              {field('clientName', 'имя')}
              {field('igHandle', 'инстаграм, без @')}
            </div>
          )}
          {form.kind === 'brief' && (
            <>
              {field('title', 'название')}
              <div className={styles.row}>
                {field('label', 'подпись на версиях, например 25.09 v3')}
                {field('order', 'порядок', { type: 'number' })}
              </div>
              {field('summary', 'коротко')}
              <div className={styles.row}>
                {select('state', 'цвет статуса', STATE_LABEL)}
                {field('stateLabel', 'статус словами')}
              </div>
              <label className={styles.field}>
                HTML с ТЗ{form.id && space.briefs.find((b) => b.id === form.id)?.hasHtml ? ' (уже загружен, новый файл заменит)' : ''}
                <input className={styles.input} type="file" accept=".html,text/html"
                  onChange={(e) => setHtmlFile(e.target.files?.[0] ?? null)} />
              </label>
            </>
          )}
          {form.kind === 'version' && (
            <>
              <div className={styles.row}>
                {select('briefId', 'ТЗ', Object.fromEntries(space.briefs.map((b) => [b.id, b.title])))}
                {field('reel', 'номер ролика')}
                {field('order', 'порядок в очереди', { type: 'number' })}
              </div>
              {field('title', 'название')}
              <div className={styles.row}>
                {field('version', 'версия')}
                {select('stage', 'этап', STAGE_LABEL)}
                {values.stage === 'done' && field('planDate', 'день выкладки', { type: 'date' })}
                {values.stage === 'up' && field('uploadedAt', 'выложен', { type: 'date' })}
              </div>
              {values.stage === 'up' && field('link', 'ссылка на рилс')}
              {field('note', 'заметка')}
            </>
          )}
          <div className={styles.toolbar}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy} onClick={saveForm}>сохранить</button>
            <button type="button" className={styles.btn} onClick={() => setForm(null)}>отмена</button>
            {form.kind !== 'space' && form.id && <button type="button" className={styles.btn} disabled={busy} onClick={remove}>удалить</button>}
          </div>
        </div>
      )}

      <div className={styles.surface}>
        <ReelsBoard
          briefs={space.briefs}
          versions={space.versions}
          today={today}
          onOpenBrief={openBrief}
          briefExtra={(b) => (
            <button type="button" className="rl-btn" style={{ justifySelf: 'start' }} onClick={() => openForm({ kind: 'brief', id: b.id })}>изменить</button>
          )}
          versionExtra={versionExtra}
          doneExtra={<button type="button" className="rl-btn" disabled={busy} onClick={autoPlan}>расставить по дням</button>}
        />
        {skipped.length > 0 && (
          <div className={styles.skipped}>
            Не выкладываем, клиент их не видит:
            <ul>
              {skipped.map((v) => (
                <li key={v.id}>
                  {v.reel} · {v.title}{v.version ? ` · ${v.version}` : ''}{' '}
                  <button type="button" className="rl-btn" disabled={busy} onClick={() => update(v.id, { stage: 'tz' })}>вернуть в ТЗ</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {viewer && (
        <div className="rv-viewer" role="dialog" aria-modal="true" aria-label={viewer.title}>
          <div className="rv-bar">
            <button type="button" className="rl-btn" onClick={() => setViewer(null)}>‹ закрыть</button>
            <span>{viewer.title}</span>
          </div>
          <iframe className="rv-frame" srcDoc={viewer.html} title={viewer.title} />
        </div>
      )}

      <style>{`
        ${REELS_BOARD_CSS}
        .rv-viewer { position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column; background: #fff; }
        .rv-bar { display: flex; gap: 12px; align-items: center; padding: 10px 12px; background: #fff; color: #222; border-bottom: 1px solid #ddd; font-weight: 700; }
        .rv-frame { flex: 1; width: 100%; border: none; }
      `}</style>
    </>
  );
}
