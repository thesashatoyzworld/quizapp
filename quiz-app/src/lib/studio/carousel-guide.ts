// «Как пишем карусели»: sections live in the database (studio_guide_sections),
// Sasha and Danya both edit them, every save is a version. Pure: shared by the
// Studio tab, the API route and MCP.

export interface GuideSectionView {
  slug: string;
  title: string;
  body: string;
  sort: number;
  updatedBy: string;
  updatedAt: string;
}

export interface GuideVersionView {
  id: number;
  slug: string;
  title: string;
  body: string;
  actor: string;
  note: string | null;
  createdAt: string;
}

export const GUIDE_AUTHOR: Record<string, string> = { sasha: 'Саша', danya: 'Даня', seed: 'исходная версия' };
export const STUDIO_ADMIN_URL = 'https://world.thesashatoyz.com/admin/studio';
export const GUIDE_BODY_MAX = 50_000;

/** Trimmed body and title, or an error message in Russian. */
export function checkGuideEdit(input: { title?: unknown; body?: unknown; note?: unknown }):
  { title?: string; body: string; note: string | null } | string {
  const body = String(input.body ?? '').replace(/\r\n/g, '\n').trim();
  if (!body) return 'пустой текст раздела';
  if (body.length > GUIDE_BODY_MAX) return 'слишком длинный раздел';
  const title = input.title === undefined || input.title === null ? undefined : String(input.title).trim();
  if (title !== undefined && !title) return 'пустое название раздела';
  const note = String(input.note ?? '').trim().slice(0, 500) || null;
  return { ...(title !== undefined ? { title } : {}), body, note };
}

const escapeHtml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Telegram (HTML) note to Sasha when Danya edits a section. */
export function guideEditNotice(title: string, note: string | null, restored = false): string {
  return [
    `Даня ${restored ? 'вернул старую версию раздела' : 'поправил раздел'} «${escapeHtml(title)}» в «Как пишем карусели»`,
    ...(note ? [`Заметка: ${escapeHtml(note)}`] : []),
    `<a href="${STUDIO_ADMIN_URL}">Открыть Студию</a> → вкладка «Карусели» → «История»`,
  ].join('\n');
}

/** The guide as one markdown document for the AI. */
export function guideToMarkdown(sections: Pick<GuideSectionView, 'slug' | 'title' | 'body'>[]): string {
  return [
    '# Как пишем карусели Саши',
    ...sections.map((s) => `## ${s.title} (раздел ${s.slug})\n\n${s.body}`),
  ].join('\n\n') + '\n';
}
