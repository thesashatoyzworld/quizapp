// MCP endpoint for «Студия» (stateless Streamable HTTP). Danya plugs his own
// AI client in with `Authorization: Bearer <his studio key>` or, for clients
// that only take a URL (claude.ai, ChatGPT), `/api/mcp?key=<his studio key>`.
// The key decides who acts. Only studio data is exposed here. Never log the
// request URL or headers: they carry the key.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import { actorForKey, keyFromRequest } from '@/lib/studio/keys';
import {
  StudioError, addComment, attachPost, getItem, getLibraryEntry, getMuzeyPoint, libraryOpenToDanya, listItems, listLibrary, listRules, loadBoard,
  editMuzeyPointTitle, hideMuzeyPoint, listGuide, podborPoints, saveGuideSection, saveLibraryEntry, searchLibrary, useMuzeyPoint, updateItem,
} from '@/lib/studio/store';
import { LIB_BASES, type LibBase } from '@/lib/studio/library';
import { guideMarkdown } from '@/lib/studio/guide';
import { guideToMarkdown } from '@/lib/studio/carousel-guide';
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

const CAROUSEL_FLOW = [
  'Собери карусель Саши. Начни с get_carousel_guide: прочитай гайд целиком и иди строго по нему, не по памяти.',
  'Порядок: podbor_points (поинт из музея идей, get_point для цитат) → карточка (сохрани её комментарием к карточке карусели через add_comment) → use_point (поинт + заход + карусель) → слайды → подсушка → само-чек → готовый текст отдай Саше комментарием через add_comment. Его правки вноси буквально. После публикации attach_post.',
].join('\n');

/** Server-level instructions: clients inject them, so Danya's AI gets the flow without a local skill. */
const INSTRUCTIONS = 'Студия Саши: контент Instagram. Когда просят карусель, поинт или заход: сначала вызови get_carousel_guide целиком и иди строго по нему; поинты бери через podbor_points; связку поинт + заход фиксируй use_point; готовый текст отдай Саше комментарием через add_comment. Как пользоваться Студией в целом: get_onboarding.';

function buildServer(actor: Actor) {
  const server = new McpServer({ name: 'studio', version: '1.0.0' }, { instructions: INSTRUCTIONS });

  server.registerPrompt('karusel', {
    title: 'Карусель Саши',
    description: 'Собрать карусель Саши по гайду: гайд → поинт из музея → карточка → use_point → слайды → подсушка → текст Саше.',
    argsSchema: { tema: z.string().optional() },
  }, ({ tema }: { tema?: string }) => ({
    messages: [{
      role: 'user' as const,
      content: { type: 'text' as const, text: `${CAROUSEL_FLOW}${tema?.trim() ? `\n\nТема или заход: ${tema.trim()}` : ''}` },
    }],
  }));

  server.registerTool('get_onboarding', {
    description: 'Как работать в Студии Саши: цикл карточки, копии, как судим статистику, правила, библиотека, как собирать карусели из музея идей, какой инструмент для чего. Прочитай один раз в начале работы.',
    inputSchema: {},
  }, safe(async () => ({ markdown: guideMarkdown({ libraryOpen: actor === 'sasha' || (await libraryOpenToDanya()) }) })));

  server.registerTool('list_schedule', {
    description: 'Карточки контента Саши (рилсы и карусели): расписание по дням и карточки «Без даты». Для «что у меня на неделе» вызывай без параметров (текущая и следующая неделя, даты UTC+5). Чтобы найти карточку по словам («бабушка», «мама», «дед, копия 1»), передай query: поиск по названию и variant за все даты. У копий одной правки общий variant и свой copyNo. id карточки нужен для get_item, set_stage, attach_post, add_comment.',
    inputSchema: { from: date.optional(), to: date.optional(), kind: kind.optional(), query: z.string().optional() },
  }, safe(async ({ from, to, kind: k, query }: { from?: string; to?: string; kind?: Kind; query?: string }) => {
    const base = k ? { kind: k } : {};
    if (query?.trim()) {
      const q = query.trim();
      const items = await listItems({ ...base, OR: [{ title: { contains: q, mode: 'insensitive' } }, { variant: { contains: q, mode: 'insensitive' } }] });
      return { query: q, stages: STAGE_LABEL, items: items.slice(0, 60) };
    }
    const start = from ?? weekStart(localDate());
    const end = to ?? addDays(start, 13);
    const [scheduled, unscheduled] = await Promise.all([
      listItems({ ...base, planDate: { gte: new Date(`${start}T00:00:00Z`), lte: new Date(`${end}T00:00:00Z`) } }),
      listItems({ ...base, planDate: null, stage: { notIn: ['skip', 'published'] } }),
    ]);
    return { from: start, to: end, stages: STAGE_LABEL, scheduled, unscheduled };
  }));

  server.registerTool('get_item', {
    description: 'Карточка целиком по id из list_schedule: ТЗ (кратко, ссылка, полный HTML брифа), комментарии, снимки статистики. Для «покажи ТЗ на …».',
    inputSchema: { id: z.string() },
  }, safe(async ({ id }: { id: string }) => {
    const item = await getItem(id);
    if (!item) throw new StudioError('не найдено');
    return item;
  }));

  server.registerTool('list_rules', {
    description: '«Что работает»: правила Саши для рилсов и каруселей (для перезаливов обязательны) и на каких цифрах они стоят. Для «какие правила для перезалива».',
    inputSchema: { kind: kind.optional() },
  }, safe(async ({ kind: k }: { kind?: Kind }) => listRules(k)));

  server.registerTool('get_variant_stats', {
    description: 'Какие правки сработали: статистика по группам копий одной правки (variant), сколько копий вышло, лучшая копия и среднее по снимку не раньше 48 часов после выхода. Правку судим по группе, не по одной заливке. Без variant вернёт все группы.',
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
    description: `Сменить этап карточки (id из list_schedule): ${STAGES.filter((s) => s !== 'published').map((s) => `${s} (${STAGE_LABEL[s]})`).join(', ')}. «Переведи в Готово» = ready. «Вышло» ставится только через attach_post.`,
    inputSchema: { id: z.string(), stage: z.enum(['text', 'edit', 'ready', 'skip']) },
  }, safe(async ({ id, stage }: { id: string; stage: Stage }) => {
    await updateItem(actor, id, { stage });
    return { ok: true, id, stage };
  }));

  server.registerTool('attach_post', {
    description: 'Прикрепить ссылку на вышедший пост к карточке (id из list_schedule, у каждой копии своя карточка): instagram.com/reel/<code> или instagram.com/p/<code>. Этап станет «Вышло», цифры подтянутся при ежедневном обновлении.',
    inputSchema: { id: z.string(), url: z.string() },
  }, safe(async ({ id, url }: { id: string; url: string }) => ({ ok: true, id, shortcode: await attachPost(id, url) })));

  server.registerTool('add_comment', {
    description: 'Оставить комментарий к карточке от своего имени, например вопрос Саше по ТЗ.',
    inputSchema: { id: z.string(), text: z.string().min(1).max(4000) },
  }, safe(async ({ id, text }: { id: string; text: string }) => ({ ok: true, commentId: await addComment(actor, id, text) })));

  const base = z.enum(LIB_BASES as [LibBase, ...LibBase[]]);

  server.registerTool('search_library', {
    description: 'Поиск по библиотеке Саши: position (позиции с оценкой A/B/C), story (истории и пруфы: «найди пруфы про …»), problem (проблемы аудитории по портретам: «какие проблемы у тех, кто боится выложить», group = портрет). Возвращает коротко: id, код, название, оценка, группа, цитата. Полностью: get_library_entry.',
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

  server.registerTool('get_carousel_guide', {
    description: '«Как пишем карусели»: порядок работы, карточка, железные правила, скелет, голос Саши, подсушка, само-чек, пруфы и образцы (залетевшие карусели Саши, эталон голоса и ритма, строки не копировать). ОБЯЗАТЕЛЬНО вызвать и прочитать ЦЕЛИКОМ до того, как писать любую карточку или любой слайд, и идти строго по нему, а не по памяти. Без slug вернёт все разделы; со slug один раздел.',
    inputSchema: { slug: z.string().optional() },
  }, safe(async ({ slug }: { slug?: string }) => ({ markdown: guideToMarkdown(await listGuide(slug?.trim() || undefined)) })));

  server.registerTool('update_guide', {
    description: 'Поправить раздел «Как пишем карусели» (slug из get_carousel_guide). body = весь новый текст раздела в markdown, не кусок: он заменит старый. note = коротко, что и почему поменял. Старая версия сохраняется в истории, Саша может вернуть. Править только когда человек прямо попросил.',
    inputSchema: { slug: z.string(), body: z.string().min(1).max(50000), note: z.string().max(500).optional(), title: z.string().max(200).optional() },
  }, safe(async ({ slug, body, note, title }: { slug: string; body: string; note?: string; title?: string }) => saveGuideSection(actor, slug, { body, note, title })));

  server.registerTool('podbor_points', {
    description: 'Музей идей Саши: поинты для карточек каруселей из его созвонов. Сначала «горячее» (hot: мысль, к которой Саша возвращался на разных созвонах за 2 недели), потом мысли, которые он повторяет чаще всего. У каждого id, мысль, почему он сейчас, 2-3 дословные цитаты Саши (созвон, дата, таймкод) и used: сколько раз уже использован, uses: пары «заход → карусель» с цифрами, если карусель вышла. Работает пара поинт + заход: брать уже использованный поинт с новым или проверенным заходом нормально, смотри по цифрам, какие пары сработали. tolko_novye: true = только ещё не использованные. Поинт для карточки бери отсюда, а не из головы. Источник в карточке пиши как [созвон дата таймкод].',
    inputSchema: { limit: z.number().int().min(1).max(50).optional(), tolko_novye: z.boolean().optional() },
  }, safe(async ({ limit, tolko_novye }: { limit?: number; tolko_novye?: boolean }) => ({ points: await podborPoints(actor, limit ?? 10, !!tolko_novye) })));

  server.registerTool('get_point', {
    description: 'Поинт из музея целиком по id из podbor_points: все цитаты Саши, которые можно использовать, суть каждой и все прошлые использования (заход → карусель, цифры).',
    inputSchema: { id: z.string() },
  }, safe(async ({ id }: { id: string }) => getMuzeyPoint(actor, id)));

  server.registerTool('use_point', {
    description: 'Записать использование поинта: поинт + заход в карусели. Вызывать после того, как Саша сказал «да» на карточку. zahod = текст захода (заголовка), karusel = короткое название карусели латиницей через дефис (например nedelya-2026-11-29-huk), item_id = id карточки карусели из list_schedule, если она есть (по ней подтянутся цифры). Поинт из подбора не пропадает, у него растёт счётчик использований.',
    inputSchema: { id: z.string(), zahod: z.string().min(1).max(500), karusel: z.string().min(1).max(120), item_id: z.string().optional() },
  }, safe(async ({ id, zahod, karusel, item_id }: { id: string; zahod: string; karusel: string; item_id?: string }) => useMuzeyPoint(actor, id, zahod, karusel, item_id)));

  server.registerTool('hide_point', {
    description: 'Пометить поинт из музея как «мимо» (не про нас, банально, не подходит для каруселей): он пропадёт из podbor_points у всех. Это единственный способ убрать поинт: использованные поинты остаются. reason обязательно: коротко, почему мимо. Вернуть: unhide_point. Делать только когда человек прямо попросил.',
    inputSchema: { id: z.string(), reason: z.string().min(1).max(500) },
  }, safe(async ({ id, reason }: { id: string; reason: string }) => hideMuzeyPoint(actor, id, true, reason)));

  server.registerTool('unhide_point', {
    description: 'Вернуть в podbor_points поинт, который раньше пометили «мимо» через hide_point.',
    inputSchema: { id: z.string() },
  }, safe(async ({ id }: { id: string }) => hideMuzeyPoint(actor, id, false)));

  server.registerTool('edit_point_title', {
    description: 'Переписать формулировку поинта из музея (как он показывается в podbor_points и get_point). Исходная формулировка музея сохраняется (originalTitle). Пустой title = вернуть исходную. note = зачем поменял. Делать только когда человек прямо попросил.',
    inputSchema: { id: z.string(), title: z.string().max(1000), note: z.string().max(500).optional() },
  }, safe(async ({ id, title, note }: { id: string; title: string; note?: string }) => editMuzeyPointTitle(actor, id, title, note)));

  return server;
}

async function handle(request: Request): Promise<Response> {
  const actor = actorForKey(keyFromRequest(request.url, request.headers.get('authorization')));
  if (!actor) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: { 'www-authenticate': 'Bearer' } });
  }
  const server = buildServer(actor);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  return transport.handleRequest(request);
}

// Stateless server: no standalone SSE stream and no sessions. A GET used to open
// an SSE stream that never closed, so every connected client held a function
// until the 60 s timeout and reconnected: ~2500 timeouts a day, which used up
// the Vercel CPU limit on 21.11.2026. The MCP spec lets a server answer 405 here;
// clients then talk over POST only.
function methodNotAllowed(): Response {
  return new Response(null, { status: 405, headers: { allow: 'POST' } });
}

export { handle as POST, methodNotAllowed as GET, methodNotAllowed as DELETE };
