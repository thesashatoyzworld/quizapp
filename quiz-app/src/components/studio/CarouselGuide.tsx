'use client';

// «Карусели»: the carousel guide («Как пишем карусели»). Sasha and Danya both
// edit sections; every save is a version, any version can be brought back.
// Danya's edits reach Sasha in Telegram (server side).

import { useCallback, useEffect, useState } from 'react';
import { GUIDE_AUTHOR, type GuideSectionView, type GuideVersionView } from '@/lib/studio/carousel-guide';
import Md from './Md';
import Sheet from './Sheet';
import s from './studio.module.css';

async function post(op: string, payload: Record<string, unknown>) {
  const res = await fetch('/api/studio', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ op, ...payload }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `ошибка ${res.status}`);
  return data;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', { timeZone: 'Asia/Almaty', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const who = (a: string) => GUIDE_AUTHOR[a] ?? a;

export default function CarouselGuide() {
  const [sections, setSections] = useState<GuideSectionView[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [history, setHistory] = useState<GuideSectionView | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/studio?part=guide', { cache: 'no-store' });
      if (!res.ok) throw new Error(`ошибка ${res.status}`);
      setSections((await res.json()).sections);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ошибка');
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (!sections) return <p className={error ? s.error : s.muted}>{error || 'загружаю…'}</p>;
  if (!sections.length) return <p className={s.note}>Разделов пока нет.</p>;

  return (
    <div className={s.guide}>
      <p className={s.note}>
        Как Саша пишет карусели. Твоя нейронка читает это же через MCP (get_carousel_guide), поэтому правки здесь меняют и её работу.
        Каждое сохранение остаётся в истории, любую версию можно вернуть.
      </p>
      <nav className={s.guideToc} aria-label="Разделы">
        {sections.map((sec) => <a key={sec.slug} href={`#cg-${sec.slug}`} className={s.guideTocLink}>{sec.title}</a>)}
      </nav>
      {error && <p className={s.error} role="alert">{error}</p>}

      {sections.map((sec) => (
        <section key={sec.slug} id={`cg-${sec.slug}`} className={s.guideSection} aria-labelledby={`cg-h-${sec.slug}`}>
          <div className={s.cgHead}>
            <h3 id={`cg-h-${sec.slug}`} className={s.guideTitle}>{sec.title}</h3>
            {editing !== sec.slug && (
              <span className={s.cgActions}>
                <button className={s.btnGhost} onClick={() => setHistory(sec)}>История</button>
                <button className={s.btn} onClick={() => { setError(''); setEditing(sec.slug); }}>Править</button>
              </span>
            )}
          </div>
          {editing === sec.slug
            ? <Editor section={sec} onCancel={() => setEditing(null)} onSaved={async () => { setEditing(null); await load(); }} onError={setError} />
            : <Md text={sec.body} />}
          <p className={s.muted}>{sec.updatedBy === 'seed' ? 'исходная версия' : `правил ${who(sec.updatedBy)}, ${when(sec.updatedAt)}`}</p>
        </section>
      ))}

      {history && <History section={history} onClose={() => setHistory(null)} onRestored={async () => { setHistory(null); await load(); }} />}
    </div>
  );
}

function Editor({ section, onCancel, onSaved, onError }: {
  section: GuideSectionView; onCancel: () => void; onSaved: () => void; onError: (m: string) => void;
}) {
  const [title, setTitle] = useState(section.title);
  const [body, setBody] = useState(section.body);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    onError('');
    try {
      await post('guide-save', { slug: section.slug, title, body, note });
      onSaved();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'ошибка');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={s.cgEditor}>
      <label className={s.field}>Название
        <input className={s.input} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className={s.field}>{'Текст (**жирный**, «- » список, «1. » шаги, «### » подзаголовок, «> » цитата)'}
        <textarea className={`${s.input} ${s.cgText}`} value={body} onChange={(e) => setBody(e.target.value)} rows={18} />
      </label>
      <label className={s.field}>Что поменял и зачем (по желанию)
        <input className={s.input} value={note} onChange={(e) => setNote(e.target.value)} placeholder="например: добавил правило про CTA" />
      </label>
      <div className={s.cgActions}>
        <button className={s.btnGhost} onClick={onCancel} disabled={busy}>Отмена</button>
        <button className={s.btnPrimary} onClick={save} disabled={busy}>{busy ? 'Сохраняю…' : 'Сохранить'}</button>
      </div>
    </div>
  );
}

function History({ section, onClose, onRestored }: { section: GuideSectionView; onClose: () => void; onRestored: () => void }) {
  const [versions, setVersions] = useState<GuideVersionView[] | null>(null);
  const [shown, setShown] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/studio?part=guide-history&slug=${encodeURIComponent(section.slug)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`ошибка ${r.status}`))))
      .then((d) => setVersions(d.versions))
      .catch((e) => setError(e instanceof Error ? e.message : 'ошибка'));
  }, [section.slug]);

  async function restore(v: GuideVersionView) {
    setBusy(true);
    setError('');
    try {
      await post('guide-restore', { versionId: v.id });
      onRestored();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ошибка');
      setBusy(false);
    }
  }

  return (
    <Sheet label={`История: ${section.title}`} onClose={onClose}>
      <div className={s.drawerHead}>
        <h2 className={s.drawerTitle}>История: {section.title}</h2>
        <button className={s.close} onClick={onClose} aria-label="Закрыть" autoFocus>×</button>
      </div>
      {error && <p className={s.error} role="alert">{error}</p>}
      {!versions && !error && <p className={s.muted}>загружаю…</p>}
      {versions?.length === 0 && <p className={s.muted}>версий пока нет</p>}
      <ol className={s.cgVersions}>
        {versions?.map((v, i) => (
          <li key={v.id} className={s.cgVersion}>
            <div className={s.cgHead}>
              <span>
                <strong>{who(v.actor)}</strong> · {when(v.createdAt)}{i === 0 && <span className={s.muted}> · сейчас</span>}
              </span>
              <span className={s.cgActions}>
                <button className={s.linkBtn} onClick={() => setShown(shown === v.id ? null : v.id)} aria-expanded={shown === v.id}>
                  {shown === v.id ? 'скрыть' : 'посмотреть'}
                </button>
                {i > 0 && <button className={s.btn} onClick={() => restore(v)} disabled={busy}>Вернуть эту версию</button>}
              </span>
            </div>
            {v.note && <p className={s.text}>{v.note}</p>}
            {shown === v.id && <div className={s.cgPreview}><Md text={v.body} /></div>}
          </li>
        ))}
      </ol>
    </Sheet>
  );
}
