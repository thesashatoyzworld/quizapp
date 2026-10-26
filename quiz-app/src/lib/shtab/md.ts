// Небольшой рендер markdown для отчётов штаба. Тексты пишут агенты и стратег,
// поэтому всё экранируется, а ссылки ставим только на http(s) и свои страницы.
// Поддержано то, что встречается в отчётах: заголовки, списки, таблицы,
// жирный, `код`, [ссылки](url), голые URL, «PR quizapp #217», ``` блоки.

export type MdOptions = {
  /** Путь в `коде` → ссылка на страницу файла, если такой файл сохранён. */
  codeHref?: (code: string) => string | null;
};

const REPOS: Record<string, string> = {
  quizapp: 'quizapp',
  'quiz-app': 'quizapp',
  'agent-hub': 'agent-hub',
  'gsd-brand': 'gsd-brand',
};

/** «PR quizapp #217», «PR #211» → ссылка на GitHub. Без репозитория считаем quizapp. */
export function prUrl(repo: string | undefined, num: string): string | null {
  const r = repo ? REPOS[repo.toLowerCase()] : 'quizapp';
  return r ? `https://github.com/thesashatoyzworld/${r}/pull/${num}` : null;
}

export const PR_RE = /\bPR\s+(?:(quizapp|quiz-app|agent-hub|gsd-brand)\s+)?#(\d+)/gi;

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function safeHref(url: string): string | null {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/admin/')) return url;
  return null;
}

function a(href: string, label: string): string {
  const external = /^https?:/i.test(href);
  return `<a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noreferrer"' : ''}>${label}</a>`;
}

/** Инлайн-разметка одной строки. */
export function inline(src: string, opts: MdOptions = {}): string {
  // Код и ссылки вынимаем заранее, чтобы жирный и автоссылки их не трогали.
  const slots: string[] = [];
  const keep = (html: string) => `\u0000${slots.push(html) - 1}\u0000`;

  let s = src.replace(/`([^`]+)`/g, (_, code: string) => {
    const html = `<code>${escapeHtml(code)}</code>`;
    const href = opts.codeHref?.(code);
    return keep(href ? a(href, html) : html);
  });

  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label: string, url: string) => {
    const href = safeHref(url);
    return href ? keep(a(href, escapeHtml(label))) : m;
  });

  s = s.replace(/https?:\/\/[^\s<>()"]+[^\s<>()".,;:!?]/g, (url) => keep(a(url, escapeHtml(url))));

  s = s.replace(PR_RE, (m, repo: string | undefined, num: string) => {
    const url = prUrl(repo, num);
    return url ? keep(a(url, escapeHtml(m))) : m;
  });

  s = escapeHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');

  return s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => slots[Number(i)]);
}

function tableRow(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

const isTableSep = (line: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);

/** Markdown → HTML. Результат безопасно вставлять через dangerouslySetInnerHTML. */
export function renderMarkdown(md: string, opts: MdOptions = {}): string {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let para: string[] = [];
  let list: { tag: 'ul' | 'ol'; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) out.push(`<p>${para.map((l) => inline(l, opts)).join('<br>')}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${i}</li>`).join('')}</${list.tag}>`);
    list = null;
  };
  const flush = () => {
    flushPara();
    flushList();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^\s*```/.test(line)) {
      flush();
      const code: string[] = [];
      while (++i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i]);
      out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    if (!line.trim()) {
      flush();
      continue;
    }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flush();
      const level = Math.min(h[1].length + 1, 5);
      out.push(`<h${level}>${inline(h[2], opts)}</h${level}>`);
      continue;
    }

    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      flush();
      out.push('<hr>');
      continue;
    }

    if (line.trim().startsWith('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      flush();
      const head = tableRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(tableRow(lines[i++]));
      i--;
      out.push(
        '<div class="md-table"><table><thead><tr>' +
          head.map((c) => `<th>${inline(c, opts)}</th>`).join('') +
          '</tr></thead><tbody>' +
          rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c, opts)}</td>`).join('')}</tr>`).join('') +
          '</tbody></table></div>',
      );
      continue;
    }

    const li = line.match(/^\s*(?:([-*+])|(\d+)[.)])\s+(.*)$/);
    if (li) {
      flushPara();
      const tag = li[1] ? 'ul' : 'ol';
      if (!list || list.tag !== tag) {
        flushList();
        list = { tag, items: [] };
      }
      const box = li[3].match(/^\[([ xX])\]\s+(.*)$/);
      list.items.push(box ? `${box[1] === ' ' ? '☐' : '☑'} ${inline(box[2], opts)}` : inline(li[3], opts));
      continue;
    }

    // Продолжение пункта списка с отступом.
    if (list && /^\s{2,}\S/.test(line)) {
      list.items[list.items.length - 1] += `<br>${inline(line.trim(), opts)}`;
      continue;
    }

    flushList();
    para.push(line.trim());
  }
  flush();
  return out.join('\n');
}

/** Первые строки текста без разметки: для превью в списке смен. */
export function plainPreview(md: string, maxLines = 3, maxChars = 220): string {
  const lines = md
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !/^#{1,4}\s/.test(l) && !/^-{3,}$/.test(l))
    .slice(0, maxLines)
    .map((l) => l.replace(/[*`]/g, '').replace(/^\s*(?:[-*+]|\d+[.)])\s+/, ''));
  const text = lines.join(' ');
  return text.length > maxChars ? text.slice(0, maxChars - 1).trimEnd() + '…' : text;
}
