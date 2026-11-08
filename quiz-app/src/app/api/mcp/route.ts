// MCP endpoint for «Студия» (stateless Streamable HTTP). Danya plugs his own
// AI client in with `Authorization: Bearer <his studio key>`; the key decides
// who acts. Only studio data is exposed here.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import { actorForKey } from '@/lib/studio/keys';
import {
  StudioError, addComment, attachPost, getItem, getLibraryEntry, listItems, listLibrary, listRules, loadBoard, saveLibraryEntry,
  searchLibrary, updateItem,
} from '@/lib/studio/store';
import { LIB_BASES, type LibBase } from '@/lib/studio/library';
import {
  STAGES, STAGE_LABEL, addDays, aggregateVariants, fmt, localDate, weekStart, type Actor, type Kind, type Stage,
} from '@/lib/studio/view';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'ГГГГ-ММ-ДД');
const kind = z.enum(['reel', 'carousel']);

const json = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });

/** Tool errors go back to the model as text instead of breaking the call. */
function safe<A>(fn: (args: A) => Promise<unknown>) {
  return async (args: A) => {
    try {
      return json(await fn(args));
    } catch (e) {
      const message = e instanceof StudioError ? e.message : 'внутренняя ошибка';
      if (!(e instanceof StudioError)) console.error('[studio mcp]', e instanceof Error ? e.message : e);
      return { content: [{ type: 'text' as const, text: message }], isError: true };
    }
  };
}

function buildServer(actor: Actor) {
  const server = new McpServer({ name: 'studio', version: '1.0.0' });

  server.registerTool('list_schedule', {
    description: 'Расписание контента Саши в Instagram (рилсы и карусели) за период и карточки без даты. Даты в UTC+5. По умолчанию текущая и следующая неделя.',
    inputSchema: { from: date.optional(), to: date.optional(), kind: kind.optional() },
  }, safe(async ({ from, to, kind: k }: { from?: string; to?: string; kind?: Kind }) => {
    const start = from ?? weekStart(localDate());
    const end = to ?? addDays(start, 13);
    const base = k ? { kind: k } : {};
    const [scheduled, unscheduled] = await Promise.all([
      listItems({ ...base, planDate: { gte: new Date(`${start}T00:00:00Z`), lte: new Date(`${end}T00:00:00Z`) } }),
      listItems({ ...base, planDate: null, stage: { notIn: ['skip', 'published'] } }),
    ]);
    return { from: start, to: end, stages: STAGE_LABEL, scheduled, unscheduled };
  }));

  server.registerTool('get_item', {
    description: 'Карточка контента целиком: ТЗ (ссылка, кратко, HTML если есть), комментарии, снимки статистики.',
    inputSchema: { id: z.string() },
  }, safe(async ({ id }: { id: string }) => {
    const item = await getItem(id);
    if (!item) throw new StudioError('не найдено');
    return item;
  }));

  server.registerTool('list_rules', {
    description: '«Что работает»: правила Саши для рилсов и каруселей и на каких цифрах они стоят.',
    inputSchema: { kind: kind.optional() },
  }, safe(async ({ kind: k }: { kind?: Kind }) => listRules(k)));

  server.registerTool('get_variant_stats', {
    description: 'Статистика по группам копий одной правки (variant): сколько копий, лучшая копия и среднее по снимку не раньше 48 часов после выхода. Правку судим по группе, не по одной заливке.',
    inputSchema: { variant: z.string().optional() },
  }, safe(async ({ variant }: { variant?: string }) => {
    const board = await loadBoard();
    return aggregateVariants(board.items, board.stats)
      .filter((g) => (variant ? g.key === variant : true))
      .map((g) => ({
        variant: g.key, label: g.label, kind: g.kind, copies: g.copies.length, published: g.published, measured: g.measured,
        status: g.measured ? 'ok' : g.published ? 'ещё рано' : 'ещё не вышло',
        best: g.best && { id: g.best.item.id, copyNo: g.best.item.copyNo, shortcode: g.best.item.shortcode, views: g.best.snap?.views },
        avg: Object.fromEntries(Object.entries(g.avg).map(([m, v]) => [m, fmt(m as never, v, g.kind)])),
        copiesDetail: g.copies.map((c) => ({ id: c.item.id, copyNo: c.item.copyNo, shortcode: c.item.shortcode, snapshot: c.snap })),
      }));
  }));

  server.registerTool('set_stage', {
    description: `Сменить этап карточки: ${STAGES.filter((s) => s !== 'published').map((s) => `${s} (${STAGE_LABEL[s]})`).join(', ')}. «Вышло» ставится через attach_post.`,
    inputSchema: { id: z.string(), stage: z.enum(['text', 'edit', 'ready', 'skip']) },
  }, safe(async ({ id, stage }: { id: string; stage: Stage }) => {
    await updateItem(actor, id, { stage });
    return { ok: true, id, stage };
  }));

  server.registerTool('attach_post', {
    description: 'Привязать вышедший пост: ссылка instagram.com/reel/<code> или instagram.com/p/<code>. Этап станет «Вышло», цифры подтянутся при ежедневном обновлении.',
    inputSchema: { id: z.string(), url: z.string() },
  }, safe(async ({ id, url }: { id: string; url: string }) => ({ ok: true, id, shortcode: await attachPost(id, url) })));

  server.registerTool('add_comment', {
    description: 'Оставить комментарий к карточке от своего имени.',
    inputSchema: { id: z.string(), text: z.string().min(1).max(4000) },
  }, safe(async ({ id, text }: { id: string; text: string }) => ({ ok: true, commentId: await addComment(actor, id, text) })));

  const base = z.enum(LIB_BASES as [LibBase, ...LibBase[]]);

  server.registerTool('search_library', {
    description: 'Поиск по библиотеке Саши: position (позиции с оценкой A/B/C), story (истории и пруфы), problem (проблемы аудитории). Возвращает коротко: id, код, название, оценка, группа, цитата. Полностью: get_library_entry.',
    inputSchema: {
      base: base.optional(), query: z.string().optional(), grade: z.enum(['A', 'B', 'C']).optional(),
      group: z.string().optional(), limit: z.number().int().min(1).max(100).optional(),
    },
  }, safe(async ({ base: b, query, grade, group, limit }: { base?: LibBase; query?: string; grade?: string; group?: string; limit?: number }) => {
    const { open, entries } = await listLibrary(actor);
    if (actor !== 'sasha' && !open) throw new StudioError('библиотека пока закрыта: Саша её проверяет');
    const hits = searchLibrary(entries, { base: b, q: query, grade, group }, limit ?? 20);
    return {
      total: hits.length,
      entries: hits.map((e) => ({ id: e.id, base: e.base, code: e.code, title: e.title, grade: e.grade, group: e.group, quote: e.quote, flags: e.flags, warnings: e.warnings })),
    };
  }));

  server.registerTool('get_library_entry', {
    description: 'Запись библиотеки целиком: текст, цитаты, источник, предупреждения (их соблюдать: «не использовать как пруф», «нужно согласие», расхождения в цифрах). id вида position:Z4 или код (Z4, 1а, BV.0).',
    inputSchema: { id: z.string(), base: base.optional() },
  }, safe(async ({ id, base: b }: { id: string; base?: LibBase }) => getLibraryEntry(actor, id, b)));

  server.registerTool('upsert_library_entry', {
    description: 'Только для ключа Саши: создать или поправить запись библиотеки. Поиск записи по id или по base+code; без них создаётся новая. Поправленная запись не перезаписывается импортом.',
    inputSchema: {
      id: z.string().optional(), base: base.optional(), code: z.string().optional(), title: z.string().optional(),
      grade: z.enum(['A', 'B', 'C']).nullable().optional(), group: z.string().optional(), body: z.string().optional(),
      quote: z.string().nullable().optional(), source: z.string().nullable().optional(), warnings: z.string().nullable().optional(),
      usedIn: z.string().nullable().optional(), visibility: z.enum(['all', 'sasha']).optional(), flags: z.array(z.string()).optional(),
    },
  }, safe(async (args: Record<string, unknown>) => {
    if (actor !== 'sasha') throw new StudioError('править библиотеку может только Саша');
    return { ok: true, id: await saveLibraryEntry(actor, args, 'sasha-mcp') };
  }));

  return server;
}

async function handle(request: Request): Promise<Response> {
  const auth = request.headers.get('authorization') ?? '';
  const actor = actorForKey(auth.startsWith('Bearer ') ? auth.slice(7).trim() : null);
  if (!actor) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: { 'www-authenticate': 'Bearer' } });
  }
  const server = buildServer(actor);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  return transport.handleRequest(request);
}

export { handle as GET, handle as POST, handle as DELETE };
