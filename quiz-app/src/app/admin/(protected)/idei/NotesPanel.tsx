'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './idei.module.css';
import {
  NOTE_KINDS,
  NOTE_LABEL,
  NOTE_GROUP_LABEL,
  noteTarget,
  normalizeNoteText,
  type NoteKind,
} from '@/lib/ideas/notes';

export interface Note {
  id: string;
  kind: string;
  text: string;
  chosen: boolean;
  done: boolean;
  position: number;
}

/**
 * The one-page sheet inside a card: substance, theses, title options, the
 * frames the thumbnail needs, tasks. Everything is one kind of record with a
 * mark, so adding is one field and one chip, not five forms.
 */
export default function NotesPanel({
  ideaId,
  notes,
  onNotes,
}: {
  ideaId: string;
  notes: Note[];
  onNotes: (next: Note[]) => void;
}) {
  const [kind, setKind] = useState<NoteKind>('thesis');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const input = useRef<HTMLTextAreaElement>(null);

  // The mark you used last is the one you keep using for the next few lines.
  useEffect(() => {
    const saved = localStorage.getItem('ideas:noteKind');
    if (saved && (NOTE_KINDS as readonly string[]).includes(saved)) setKind(saved as NoteKind);
  }, []);

  function pickKind(k: NoteKind) {
    setKind(k);
    localStorage.setItem('ideas:noteKind', k);
  }

  async function add() {
    // A pasted block becomes one note per line: ten titles arrive together.
    const lines = text.split('\n').map(normalizeNoteText).filter(Boolean);
    if (lines.length === 0) return;
    setBusy(true);
    setError('');
    const added: Note[] = [];
    try {
      for (const line of lines) {
        const res = await fetch(`/api/admin/ideas/${ideaId}/notes`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ kind, text: line }),
        });
        if (!res.ok) {
          setError(res.status === 401 ? 'Сессия истекла, обнови страницу' : 'Не записалось');
          break;
        }
        const json = (await res.json()) as { note: Note };
        added.push(json.note);
      }
      if (added.length) onNotes([...notes, ...added]);
      if (added.length === lines.length) setText('');
      input.current?.focus();
    } catch {
      setError('Не записалось, проверь связь');
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>, apply: (n: Note[]) => Note[]) {
    setError('');
    const res = await fetch(`/api/admin/ideas/${ideaId}/notes/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);
    if (!res || !res.ok) {
      setError(res?.status === 401 ? 'Сессия истекла, обнови страницу' : 'Не сохранилось');
      return;
    }
    onNotes(apply(notes));
  }

  async function remove(id: string) {
    setError('');
    const res = await fetch(`/api/admin/ideas/${ideaId}/notes/${id}`, { method: 'DELETE' }).catch(
      () => null,
    );
    if (!res || !res.ok) {
      setError('Не удалилось');
      return;
    }
    onNotes(notes.filter((n) => n.id !== id));
  }

  function saveEdit(id: string) {
    const next = normalizeNoteText(draft);
    setEditing(null);
    const current = notes.find((n) => n.id === id);
    if (!next || !current || next === current.text) return;
    void patch(id, { text: next }, (ns) => ns.map((n) => (n.id === id ? { ...n, text: next } : n)));
  }

  return (
    <div className={styles.sheet}>
      {NOTE_KINDS.map((k) => {
        const rows = notes.filter((n) => n.kind === k).sort((a, b) => a.position - b.position);
        if (rows.length === 0) return null;
        const target = noteTarget(k);
        return (
          <section key={k} className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockName}>{NOTE_GROUP_LABEL[k]}</span>
              {target ? (
                <span className={rows.length >= target ? styles.countOk : styles.countLow}>
                  {rows.length} / {target}
                </span>
              ) : (
                <span className={styles.countPlain}>{rows.length}</span>
              )}
            </div>
            <ul className={styles.noteList}>
              {rows.map((n) => (
                <li key={n.id} className={n.done ? styles.noteDone : styles.note}>
                  {k === 'task' && (
                    <button
                      className={styles.check}
                      title={n.done ? 'вернуть в работу' : 'сделано'}
                      onClick={() =>
                        void patch(n.id, { done: !n.done }, (ns) =>
                          ns.map((x) => (x.id === n.id ? { ...x, done: !n.done } : x)),
                        )
                      }
                    >
                      {n.done ? '✓' : ''}
                    </button>
                  )}
                  {editing === n.id ? (
                    <input
                      className={styles.noteEdit}
                      value={draft}
                      autoFocus
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => saveEdit(n.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(n.id);
                        if (e.key === 'Escape') setEditing(null);
                      }}
                    />
                  ) : (
                    <span
                      className={n.chosen ? styles.noteTextChosen : styles.noteText}
                      onClick={() => {
                        setEditing(n.id);
                        setDraft(n.text);
                      }}
                      title="нажми, чтобы поправить"
                    >
                      {n.text}
                    </span>
                  )}
                  {k === 'title' && (
                    <button
                      className={n.chosen ? styles.betOn : styles.bet}
                      title="на этот заголовок ставим"
                      onClick={() =>
                        void patch(n.id, { chosen: !n.chosen }, (ns) =>
                          ns.map((x) => ({
                            ...x,
                            chosen: x.kind === 'title' ? x.id === n.id && !n.chosen : x.chosen,
                          })),
                        )
                      }
                    >
                      этот
                    </button>
                  )}
                  <button className={styles.drop} title="убрать" onClick={() => void remove(n.id)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <div className={styles.composer}>
        <div className={styles.kindRow}>
          {NOTE_KINDS.map((k) => (
            <button
              key={k}
              className={kind === k ? styles.kindChipOn : styles.kindChip}
              onClick={() => pickKind(k)}
            >
              {NOTE_LABEL[k]}
            </button>
          ))}
          {busy && <span className={styles.busy}>записываю…</span>}
        </div>
        <textarea
          ref={input}
          className={styles.composerInput}
          value={text}
          rows={1}
          placeholder={`${NOTE_LABEL[kind]}: пиши и Enter. Shift+Enter даёт новую строку, вставка списком добавит по строке.`}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!busy) void add();
            }
          }}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
