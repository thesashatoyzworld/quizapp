// Сводка и раскладка задач штаба. Без базы, чтобы проверять тестами.

export type TaskRow = {
  id: string;
  section: string;
  sectionOrder: number;
  grp: string | null;
  text: string;
  detail: string | null;
  /** open | wip | paused | done | frozen */
  status: string;
  lineDate: Date | null;
  doneAt: Date | null;
};

export type Section = {
  title: string;
  open: TaskRow[];
  done: TaskRow[];
};

const DAY = 86400e3;

export const isOpen = (t: TaskRow) => t.status !== 'done' && t.status !== 'frozen';

export function summarize(
  tasks: TaskRow[],
  reports: { id: string; shiftDate: Date }[],
  now: Date,
) {
  const weekAgo = now.getTime() - 7 * DAY;
  const doneWeek = tasks.filter((t) => {
    if (t.status !== 'done') return false;
    const at = t.doneAt ?? t.lineDate;
    return at ? at.getTime() >= weekAgo : false;
  }).length;
  const last = [...reports].sort((a, b) => b.shiftDate.getTime() - a.shiftDate.getTime())[0] ?? null;
  return {
    open: tasks.filter(isOpen).length,
    doneWeek,
    lastReport: last ? { id: last.id, shiftDate: last.shiftDate } : null,
  };
}

/**
 * Разделы в порядке трекера. В разделе сначала открытые (в работе выше),
 * сделанные и замороженные отдельно, их показываем свёрнутыми.
 */
export function groupSections(tasks: TaskRow[]): Section[] {
  const bySection = new Map<string, { order: number; rows: TaskRow[] }>();
  for (const t of tasks) {
    const s = bySection.get(t.section) ?? { order: t.sectionOrder, rows: [] };
    s.rows.push(t);
    bySection.set(t.section, s);
  }
  const rank = (t: TaskRow) => (t.status === 'wip' ? 0 : 1);
  return [...bySection.entries()]
    .sort((a, b) => a[1].order - b[1].order)
    .map(([title, s]) => ({
      title,
      // sort стабильный: внутри одного ранга остаётся порядок трекера
      open: s.rows.filter(isOpen).sort((a, b) => rank(a) - rank(b)),
      done: s.rows.filter((t) => !isOpen(t)),
    }));
}
