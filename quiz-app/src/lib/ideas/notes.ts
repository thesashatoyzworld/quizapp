// What piles up inside one idea card.
//
// The card is Paddy Galloway's "one-page sheet": one line of substance, a
// skeleton of theses, title options, the frames the thumbnail needs. He puts
// numbers on two of them - ten titles, and a brief naming five frames to shoot
// before the video is filmed - so those two carry a target and the rest do not.

export const NOTE_KINDS = ['core', 'thesis', 'title', 'thumb', 'task'] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];

export const NOTE_LABEL: Record<NoteKind, string> = {
  core: 'суть',
  thesis: 'тезис',
  title: 'заголовок',
  thumb: 'кадр обложки',
  task: 'задача',
};

/** Plural heading above each block. */
export const NOTE_GROUP_LABEL: Record<NoteKind, string> = {
  core: 'суть',
  thesis: 'тезисы',
  title: 'заголовки',
  thumb: 'кадры обложки',
  task: 'задачи',
};

const TARGET: Partial<Record<NoteKind, number>> = { title: 10, thumb: 5 };

export function isNoteKind(value: string): value is NoteKind {
  return (NOTE_KINDS as readonly string[]).includes(value);
}

/** How many of this kind a packed idea needs, null when there is no such number. */
export function noteTarget(kind: NoteKind): number | null {
  return TARGET[kind] ?? null;
}

export interface NoteLike {
  kind: string;
  text: string;
  chosen?: boolean;
  done?: boolean;
}

/**
 * One line, no list marks. Notes arrive pasted from Telegram and from other
 * lists, so a leading dash or number is punctuation, not content.
 */
export function normalizeNoteText(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:[-–•*]|\d+[.)])\s+/, '')
    .trim();
}

export function countByKind(notes: NoteLike[]): Record<NoteKind, number> {
  const out = { core: 0, thesis: 0, title: 0, thumb: 0, task: 0 };
  for (const n of notes) if (isNoteKind(n.kind)) out[n.kind] += 1;
  return out;
}

/**
 * The line under a collapsed card: where the work actually stands. Only what
 * exists is shown - an empty idea stays quiet in the feed.
 */
export function feedSummary(notes: NoteLike[]): string {
  const c = countByKind(notes);
  const openTasks = notes.filter((n) => n.kind === 'task' && !n.done).length;
  const parts: string[] = [];
  if (c.thesis) parts.push(`тезисов ${c.thesis}`);
  if (c.title) parts.push(`заголовков ${c.title}/${TARGET.title}`);
  if (c.thumb) parts.push(`кадров ${c.thumb}/${TARGET.thumb}`);
  if (openTasks) parts.push(`задач ${openTasks}`);
  return parts.join(' · ');
}

/** The title the career would be bet on, null while nothing is marked. */
export function chosenTitle(notes: NoteLike[]): string | null {
  return notes.find((n) => n.kind === 'title' && n.chosen)?.text ?? null;
}
