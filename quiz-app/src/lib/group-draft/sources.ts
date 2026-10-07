/**
 * Что ученик прислал вместе с вопросом: картинки, pdf, ссылки на гугл-доки и
 * лендинги. Без этого черновик отвечает вслепую, а большая часть вопросов в
 * группе как раз «глянь оффер / карусель / сайт».
 */
import { htmlToText } from '@/lib/kb/map';

/** Bot API отдаёт файлы до 20 МБ, модели больше и не надо. */
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_FILES = 8;
const MAX_LINKS = 3;
const LINK_TEXT_LIMIT = 15000;
const LINK_TIMEOUT_MS = 8000;

export type ContentBlock =
  | { type: 'text'; text: string }
  | {
      type: 'image';
      source: { type: 'base64'; media_type: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'; data: string };
    }
  | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } };

export interface FileRef {
  fileId: string;
  mime: string | null;
}

const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function fileBlocks(files: FileRef[]): Promise<{ blocks: ContentBlock[]; missed: number }> {
  // Ленивый импорт: telegram.ts тянет базу, а тест ссылок её не должен.
  const { getTelegramFilePath, downloadTelegramFile } = await import('@/lib/telegram');
  const blocks: ContentBlock[] = [];
  let missed = 0;
  for (const f of files.slice(0, MAX_FILES)) {
    const mime = f.mime || '';
    const isPdf = mime === 'application/pdf';
    if (!isPdf && !IMAGE_MIME.has(mime)) {
      missed++;
      continue;
    }
    try {
      const path = await getTelegramFilePath(f.fileId);
      const buf = Buffer.from(await downloadTelegramFile(path));
      if (buf.byteLength > MAX_FILE_BYTES) {
        missed++;
        continue;
      }
      const data = buf.toString('base64');
      blocks.push(
        isPdf
          ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } }
          : {
              type: 'image',
              source: { type: 'base64', media_type: mime as 'image/jpeg', data },
            },
      );
    } catch (e) {
      console.error('[group-draft] файл не скачался', f.fileId, e);
      missed++;
    }
  }
  missed += Math.max(0, files.length - MAX_FILES);
  return { blocks, missed };
}

const URL_RE = /https?:\/\/[^\s<>"')]+/g;

export function extractUrls(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.match(URL_RE) ?? []) {
    const url = raw.replace(/[.,;:!?]+$/, '');
    if (!out.includes(url)) out.push(url);
  }
  return out;
}

/**
 * Куда идти за текстом. Гугл-доки открытые по ссылке отдают экспорт без входа,
 * инстаграм без входа не отдаёт ничего, туда не ходим вовсе.
 */
export function exportUrl(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, '');
  if (/(^|\.)instagram\.com$|(^|\.)t\.me$|zoom\.us$/.test(host)) return null;

  if (host === 'docs.google.com') {
    const m = u.pathname.match(/^\/(document|spreadsheets|presentation)\/d\/([^/]+)/);
    if (!m) return null;
    const [, kind, id] = m;
    if (kind === 'document') return `https://docs.google.com/document/d/${id}/export?format=txt`;
    if (kind === 'spreadsheets') {
      const gid = u.hash.match(/gid=(\d+)/)?.[1] || u.searchParams.get('gid');
      return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv${gid ? `&gid=${gid}` : ''}`;
    }
    return `https://docs.google.com/presentation/d/${id}/export/txt`;
  }
  return url;
}

export async function linkBlocks(text: string): Promise<{ blocks: ContentBlock[]; missed: string[] }> {
  const blocks: ContentBlock[] = [];
  const missed: string[] = [];
  for (const url of extractUrls(text).slice(0, MAX_LINKS)) {
    const target = exportUrl(url);
    if (!target) continue;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), LINK_TIMEOUT_MS);
      const res = await fetch(target, { redirect: 'follow', signal: ctrl.signal });
      clearTimeout(timer);
      const type = res.headers.get('content-type') || '';
      // Закрытый гугл-док редиректит на страницу входа.
      if (!res.ok || res.url.includes('accounts.google.com')) {
        missed.push(url);
        continue;
      }
      const body = await res.text();
      const plain = type.includes('html') ? htmlToText(body) : body;
      const clipped = plain.replace(/\n{3,}/g, '\n\n').trim().slice(0, LINK_TEXT_LIMIT);
      if (!clipped) {
        missed.push(url);
        continue;
      }
      blocks.push({ type: 'text', text: `Содержимое ссылки ${url}:\n\n${clipped}` });
    } catch {
      missed.push(url);
    }
  }
  return { blocks, missed };
}
