/**
 * Что ученик прислал вместе с вопросом: картинки, pdf, ссылки на гугл-доки и
 * лендинги. Без этого черновик отвечает вслепую, а большая часть вопросов в
 * группе как раз «глянь оффер / карусель / сайт».
 */
import { htmlToText } from '@/lib/kb/map';

/** Bot API отдаёт файлы до 20 МБ, модели больше и не надо. */
const MAX_FILE_BYTES = 15 * 1024 * 1024;
/** Карусель приходит пачкой по 10-13 слайдов: меньше лимит резал её конец. */
const MAX_FILES = 20;
const MAX_LINKS = 3;
const MAX_SHOTS = 2;
const LINK_TEXT_LIMIT = 15000;
const LINK_TIMEOUT_MS = 8000;
/** Рендер в браузере идёт дольше простого запроса. */
const READER_TIMEOUT_MS = 40000;
/** Меньше этого текста в HTML: страницу рисует скрипт, без браузера её не прочесть. */
const MIN_PAGE_TEXT = 400;

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

async function fetchWithTimeout(url: string, ms: number, init: RequestInit = {}): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { redirect: 'follow', ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Страницу открывает r.jina.ai в настоящем браузере: так читаются лендинги на
 * скриптах и артефакты Claude, которые простым запросом отдают пустую оболочку.
 */
const READER = 'https://r.jina.ai/';

function readerHeaders(extra: Record<string, string>): Record<string, string> {
  const key = process.env.JINA_API_KEY?.trim();
  return { ...extra, ...(key ? { Authorization: `Bearer ${key}` } : {}) };
}

async function readerText(url: string): Promise<string> {
  const res = await fetchWithTimeout(READER + url, READER_TIMEOUT_MS, {
    headers: readerHeaders({ 'X-Return-Format': 'markdown', 'X-Timeout': '30' }),
  });
  if (!res.ok) throw new Error(`reader ${res.status}`);
  return res.text();
}

/** Первый экран страницы картинкой: дизайн лендинга текстом не передать. */
async function readerShot(url: string): Promise<ContentBlock | null> {
  const res = await fetchWithTimeout(READER + url, READER_TIMEOUT_MS, {
    headers: readerHeaders({ Accept: 'application/json', 'X-Return-Format': 'screenshot', 'X-Timeout': '30' }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: { screenshotUrl?: string } };
  const shotUrl = json.data?.screenshotUrl;
  if (!shotUrl) return null;
  const img = await fetchWithTimeout(shotUrl, LINK_TIMEOUT_MS);
  if (!img.ok) return null;
  const buf = Buffer.from(await img.arrayBuffer());
  if (!buf.byteLength || buf.byteLength > MAX_FILE_BYTES) return null;
  return { type: 'image', source: { type: 'base64', media_type: 'image/png', data: buf.toString('base64') } };
}

/** Приватный артефакт Claude и любая страница за входом. */
export function isLoginWall(text: string): boolean {
  return /sign in to view|log in to (view|continue)|войдите, чтобы/i.test(text);
}

/** Артефакты Claude рисуются скриптом всегда, простой запрос там бесполезен. */
export function needsBrowser(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return host === 'claude.ai' || host.endsWith('.claude.site') || host === 'claude.site';
  } catch {
    return false;
  }
}

export async function linkBlocks(text: string): Promise<{ blocks: ContentBlock[]; missed: string[] }> {
  const blocks: ContentBlock[] = [];
  const missed: string[] = [];
  let shots = 0;
  for (const url of extractUrls(text).slice(0, MAX_LINKS)) {
    const target = exportUrl(url);
    if (!target) continue;
    const isDoc = target !== url;
    try {
      let plain = '';
      let page = false;
      if (!needsBrowser(url)) {
        const res = await fetchWithTimeout(target, LINK_TIMEOUT_MS);
        // Закрытый гугл-док редиректит на страницу входа.
        if (!res.ok || res.url.includes('accounts.google.com')) {
          missed.push(isDoc ? `${url} (закрыт доступ)` : url);
          continue;
        }
        const type = res.headers.get('content-type') || '';
        const body = await res.text();
        page = type.includes('html');
        plain = page ? htmlToText(body) : body;
      }
      if (!isDoc && (needsBrowser(url) || plain.trim().length < MIN_PAGE_TEXT)) {
        plain = await readerText(url);
        page = true;
      }
      if (isLoginWall(plain)) {
        missed.push(`${url} (закрыта, нужен публичный доступ по ссылке)`);
        continue;
      }
      const clipped = plain.replace(/\n{3,}/g, '\n\n').trim().slice(0, LINK_TEXT_LIMIT);
      if (!clipped) {
        missed.push(url);
        continue;
      }
      blocks.push({ type: 'text', text: `Содержимое ссылки ${url}:\n\n${clipped}` });
      if (page && shots < MAX_SHOTS) {
        const shot = await readerShot(url).catch(() => null);
        if (shot) {
          shots++;
          blocks.push({ type: 'text', text: `Первый экран ${url}:` }, shot);
        }
      }
    } catch {
      missed.push(url);
    }
  }
  return { blocks, missed };
}
