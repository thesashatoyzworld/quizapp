// Where an idea stands. One ladder, not two: the triage status and the
// production stage are the same question asked at different moments.
//
// The steps are Paddy Galloway's order of work: an idea survives the cut
// (it can be packed into a title and a thumbnail), gets packed, the brief
// goes out before filming, then it is shot and published.

export const IDEA_STATUSES = [
  'raw',
  'picked',
  'packing',
  'brief',
  'filming',
  'published',
  'rejected',
] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export const IDEA_STATUS_LABEL: Record<IdeaStatus, string> = {
  raw: 'сырое',
  picked: 'прошла отсев',
  packing: 'упаковка',
  brief: 'ТЗ отдано',
  filming: 'снимается',
  published: 'опубликовано',
  rejected: 'отклонили',
};

/**
 * Values written before the ladder grew. Rows are left alone: remapping live
 * data would be a write against production for a cosmetic gain.
 */
const LEGACY: Record<string, IdeaStatus> = {
  in_work: 'packing',
  shipped: 'published',
};

export function isIdeaStatus(value: string): value is IdeaStatus {
  return (IDEA_STATUSES as readonly string[]).includes(value);
}

/** What to show for a stored value, whatever era it comes from. */
export function normalizeStatus(stored: string): IdeaStatus {
  if (isIdeaStatus(stored)) return stored;
  return LEGACY[stored] ?? 'raw';
}

/** Every stored value that means this step, for a WHERE clause. */
export function statusDbValues(status: IdeaStatus): string[] {
  const legacy = Object.entries(LEGACY)
    .filter(([, to]) => to === status)
    .map(([from]) => from);
  return [status, ...legacy];
}
