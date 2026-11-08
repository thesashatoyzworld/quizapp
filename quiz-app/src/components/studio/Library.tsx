'use client';

// «Библиотека»: positions, stories/proofs and audience problems, the source of
// truth for Sasha's content. Sasha edits; Danya reads a redacted copy, and only
// after Sasha opens the library to him.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FLAG_LABEL, LIB_BASES, LIB_BASE_LABEL, filterLibrary, type LibBase, type LibraryEntry } from '@/lib/studio/library';
import Sheet from './Sheet';
import s from './studio.module.css';

interface Filters {
  q: string;
  grade: string;
  group: string;
  core: boolean;
  unused: boolean;
  source: '' | 'comments' | 'voice';
  overlap: boolean;
}
const EMPTY: Filters = { q: '', grade: '', group: '', core: false, unused: false, source: '', overlap: false };
const GROUP_LABEL: Record<LibBase, string> = { position: 'Категория', story: 'Тема', problem: 'Портрет' };

async function post(op: string, payload: Record<string, unknown>) {
  const res = await fetch('/api/studio', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ op, ...payload }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `ошибка ${res.status}`);
  return data;
}

export default function Library({ isSasha }: { isSasha: boolean }) {
  const [data, setData] = useState<{ open: boolean; entries: LibraryEntry[] } | null>(null);
  const [error, setError] = useState('');
  const [base, setBase] = useState<LibBase>('position');
  const [f, setF] = useState<Filters>(EMPTY);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/studio?part=library', { cache: 'no-store' });
      if (!res.ok) throw new Error(`ошибка ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ошибка');
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const entries = useMemo(() => data?.entries ?? [], [data]);
  const ofBase = useMemo(() => entries.filter((e) => e.base === base), [entries, base]);
  const groups = useMemo(() => [...new Set(ofBase.map((e) => e.group))], [ofBase]);
  const shown = useMemo(
    () => filterLibrary(ofBase, { ...f, grade: f.grade || undefined, group: f.group || undefined, source: f.source || undefined }),
    [ofBase, f],
  );
  const open = entries.find((e) => e.id === openId) ?? null;

  async function save(payload: Record<string, unknown>) {
    setError('');
    try {
      const r = await post('library-save', { data: payload });
      await load();
      return r.id as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ошибка');
      return null;
    }
  }

  async function toggleDanya() {
    setError('');
    try {
      await post('library-open', { open: !data?.open });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ошибка');
    }
  }

  if (!data) return <p className={error ? s.error : s.muted}>{error || 'загружаю библиотеку…'}</p>;
  if (!isSasha && !data.open) {
    return <p className={s.note}>Библиотеку Саша ещё проверяет. Она появится здесь, когда он её откроет.</p>;
  }

  const sashaOnly = entries.filter((e) => e.visibility === 'sasha').length;
  const set = (patch: Partial<Filters>) => setF({ ...f, ...patch });

  return (
    <>
      {isSasha && (
        <div className={`${s.libGate} ${data.open ? s.libGateOpen : ''}`}>
          <span>
            {data.open
              ? `Даня видит библиотеку: без имён, ников и контактов; ${sashaOnly} записей только для тебя.`
              : `Даня пока не видит библиотеку. Когда откроешь, он получит её без имён, ников и контактов, а ${sashaOnly} записей с цифрами клиентов останутся только у тебя.`}
          </span>
          <button className={s.btn} onClick={toggleDanya}>{data.open ? 'Закрыть от Дани' : 'Открыть Дане'}</button>
        </div>
      )}
      {error && <p className={s.error} role="alert">{error}</p>}

      <div className={s.toolbar}>
        <div className={s.segmented} role="group" aria-label="База">
          {LIB_BASES.map((b) => (
            <button key={b} className={s.segment} aria-pressed={base === b} onClick={() => { setBase(b); setF(EMPTY); }}>
              {LIB_BASE_LABEL[b]} <span className={s.segCount}>{entries.filter((e) => e.base === b).length}</span>
            </button>
          ))}
        </div>
        {isSasha && <button className={`${s.btn} ${s.push}`} onClick={() => setCreating(true)}>+ Запись</button>}
      </div>

      <div className={s.libFilters}>
        <input
          className={`${s.input} ${s.libSearch}`} type="search" value={f.q} onChange={(e) => set({ q: e.target.value })}
          placeholder="Поиск по коду, названию, тексту" aria-label="Поиск"
        />
        {base === 'position' && (
          <select className={s.input} value={f.grade} onChange={(e) => set({ grade: e.target.value })} aria-label="Оценка">
            <option value="">Все оценки</option><option value="A">A</option><option value="B">B</option><option value="C">C</option>
          </select>
        )}
        <select className={s.input} value={f.group} onChange={(e) => set({ group: e.target.value })} aria-label={GROUP_LABEL[base]}>
          <option value="">{GROUP_LABEL[base]}: все</option>
          {groups.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        {base === 'problem' && (
          <select className={s.input} value={f.source} onChange={(e) => set({ source: e.target.value as Filters['source'] })} aria-label="Источник">
            <option value="">Комментарии и голос</option><option value="comments">Комментарии</option><option value="voice">Голос: анкеты, чаты, созвоны</option>
          </select>
        )}
        {base === 'position' && <Check label="ядро" checked={f.core} onChange={(v) => set({ core: v })} />}
        {base === 'story' && <Check label="не использовано" checked={f.unused} onChange={(v) => set({ unused: v })} />}
        {base === 'problem' && <Check label="охват + деньги" checked={f.overlap} onChange={(v) => set({ overlap: v })} />}
      </div>
      <p className={s.muted}>
        показано {shown.length} из {ofBase.length}
        {JSON.stringify(f) !== JSON.stringify(EMPTY) && <> · <button className={s.linkBtn} onClick={() => setF(EMPTY)}>сбросить</button></>}
      </p>

      <div className={s.libList}>
        {shown.map((e) => <LibCard key={e.id} entry={e} onOpen={() => setOpenId(e.id)} />)}
      </div>
      {shown.length === 0 && <p className={s.empty}>ничего не нашлось</p>}

      {open && <LibDrawer key={open.id} entry={open} isSasha={isSasha} save={save} onClose={() => setOpenId(null)} />}
      {creating && (
        <LibDrawer
          entry={null} base={base} isSasha save={save} onClose={() => setCreating(false)}
          onCreated={(id) => { setCreating(false); setOpenId(id); }}
        />
      )}
    </>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={s.check}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}
    </label>
  );
}

function GradeChip({ grade }: { grade: LibraryEntry['grade'] }) {
  if (!grade) return null;
  return <span className={`${s.grade} ${s[`grade${grade}`]}`} aria-label={`оценка ${grade}`}>{grade}</span>;
}

const CARD_FLAGS = ['core', 'top', 'overlap', 'unused', 'voice'];

function LibCard({ entry, onOpen }: { entry: LibraryEntry; onOpen: () => void }) {
  const flags = entry.flags.filter((x) => CARD_FLAGS.includes(x));
  return (
    <button className={s.libCard} onClick={onOpen}>
      <span className={s.libCardTop}>
        <span className={s.code}>{entry.code}</span>
        <GradeChip grade={entry.grade} />
        {flags.map((x) => <span key={x} className={s.flag}>{FLAG_LABEL[x]}</span>)}
        {entry.visibility === 'sasha' && <span className={`${s.flag} ${s.flagPrivate}`}>только Саше</span>}
        {entry.warnings && <span className={`${s.flag} ${s.flagWarn}`}>есть оговорки</span>}
      </span>
      <span className={s.libTitle}>{entry.title}</span>
      <span className={s.libQuote}>{entry.quote ? (entry.quote.startsWith('«') ? entry.quote : `«${entry.quote}»`) : entry.group}</span>
    </button>
  );
}

// ─── drawer ───

/** Tiny markdown: **bold**, «> » quotes, «- » bullets, tables as rows. No HTML injection. */
function Md({ text }: { text: string }) {
  const inline = (t: string) => t.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p));
  return (
    <div className={s.md}>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className={s.mdGap} />;
        if (/^\|[-| ]+\|$/.test(line.trim())) return null;
        if (line.startsWith('|')) return <div key={i} className={s.mdRow}>{line.split('|').slice(1, -1).map((c, j) => <span key={j}>{inline(c.trim())}</span>)}</div>;
        if (line.startsWith('> ')) return <blockquote key={i} className={s.mdQuote}>{inline(line.slice(2))}</blockquote>;
        const bullet = line.match(/^(\s*)- (.*)$/);
        if (bullet) return <div key={i} className={s.mdLi} style={{ paddingLeft: 12 + bullet[1].length * 6 }}>{inline(bullet[2])}</div>;
        if (line.startsWith('### ')) return <h4 key={i} className={s.mdH}>{line.slice(4)}</h4>;
        return <p key={i} className={s.mdP}>{inline(line)}</p>;
      })}
    </div>
  );
}

function LibDrawer({ entry, base, isSasha, save, onClose, onCreated }: {
  entry: LibraryEntry | null; base?: LibBase; isSasha: boolean;
  save: (p: Record<string, unknown>) => Promise<string | null>; onClose: () => void; onCreated?: (id: string) => void;
}) {
  const [editing, setEditing] = useState(!entry);
  const [form, setForm] = useState({
    code: entry?.code ?? '', title: entry?.title ?? '', grade: entry?.grade ?? '', group: entry?.group ?? '',
    visibility: entry?.visibility ?? 'all', quote: entry?.quote ?? '', source: entry?.source ?? '',
    warnings: entry?.warnings ?? '', usedIn: entry?.usedIn ?? '', body: entry?.body ?? '',
  });
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const kind = entry?.base ?? base ?? 'position';

  async function submit() {
    const id = await save(entry ? { id: entry.id, ...form, code: undefined } : { base: kind, ...form });
    if (!id) return;
    if (!entry) onCreated?.(id);
    else setEditing(false);
  }

  return (
    <Sheet label={entry ? `${entry.code}: ${entry.title}` : 'Новая запись'} onClose={onClose}>
      <div className={s.drawerHead}>
        {entry && <span className={s.code}>{entry.code}</span>}
        {entry && <GradeChip grade={entry.grade} />}
        <span className={s.muted}>{LIB_BASE_LABEL[kind]}{entry?.group ? ` · ${entry.group}` : ''}</span>
        <button className={s.close} onClick={onClose} aria-label="Закрыть" autoFocus>×</button>
      </div>

      {!editing && entry && (
        <>
          <h2 className={s.drawerTitle}>{entry.title}</h2>
          {(entry.flags.length > 0 || entry.visibility === 'sasha') && (
            <div className={s.libCardTop}>
              {entry.flags.map((x) => <span key={x} className={s.flag}>{FLAG_LABEL[x] ?? x}</span>)}
              {entry.visibility === 'sasha' && <span className={`${s.flag} ${s.flagPrivate}`}>только Саше</span>}
            </div>
          )}
          {entry.warnings && entry.warnings !== entry.body && (
            <div className={s.warnBox} role="note"><strong>Оговорки</strong><Md text={entry.warnings} /></div>
          )}
          {entry.warnings && entry.warnings === entry.body
            ? <div className={s.warnBox} role="note"><Md text={entry.body} /></div>
            : <Md text={entry.body} />}
          {entry.source && <><h3 className={s.blockHead}>Источник</h3><p className={s.text}>{entry.source}</p></>}
          {entry.usedIn && <><h3 className={s.blockHead}>Где уже было</h3><p className={s.text}>{entry.usedIn}</p></>}
          <p className={s.muted}>{entry.updatedBy === 'import' ? 'из импорта' : `правил ${entry.updatedBy}`}</p>
          {isSasha && <div className={s.saveBar}><button className={s.btn} onClick={() => setEditing(true)}>Править</button></div>}
        </>
      )}

      {editing && isSasha && (
        <>
          {!entry && (
            <label className={s.field}>Код (можно пусто)
              <input className={s.input} value={form.code} onChange={set('code')} placeholder="например Z13" />
            </label>
          )}
          <label className={s.field}>Название
            <textarea className={s.input} rows={2} value={form.title} onChange={set('title')} />
          </label>
          <div className={s.fields}>
            {kind === 'position' && (
              <label className={s.field}>Оценка
                <select className={s.input} value={form.grade} onChange={set('grade')}>
                  <option value="">нет</option><option value="A">A</option><option value="B">B</option><option value="C">C</option>
                </select>
              </label>
            )}
            <label className={s.field}>Кто видит
              <select className={s.input} value={form.visibility} onChange={set('visibility')}>
                <option value="all">Саша и Даня</option><option value="sasha">Только Саша</option>
              </select>
            </label>
          </div>
          <label className={s.field}>{GROUP_LABEL[kind]}
            <input className={s.input} value={form.group} onChange={set('group')} />
          </label>
          <label className={s.field}>Цитата для списка
            <textarea className={s.input} rows={2} value={form.quote} onChange={set('quote')} />
          </label>
          <label className={s.field}>Оговорки (видны жёлтым)
            <textarea className={s.input} rows={2} value={form.warnings} onChange={set('warnings')} />
          </label>
          <label className={s.field}>Источник
            <textarea className={s.input} rows={2} value={form.source} onChange={set('source')} />
          </label>
          <label className={s.field}>Текст (markdown)
            <textarea className={`${s.input} ${s.bodyInput}`} rows={12} value={form.body} onChange={set('body')} />
          </label>
          <div className={s.inline}>
            <button className={s.btnPrimary} disabled={!form.title.trim()} onClick={submit}>{entry ? 'Сохранить' : 'Создать'}</button>
            {entry && <button className={s.btnGhost} onClick={() => setEditing(false)}>Отмена</button>}
          </div>
        </>
      )}
    </Sheet>
  );
}
