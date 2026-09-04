// Сборка маршрутной карты по анкете: одно обращение к модели, дальше проверки.
//
// Модель отвечает по строгой схеме, поэтому разбирать текст не нужно. Ссылки на
// материалы и даты она НЕ пишет: называет материал идентификатором section/slug
// и неделю числом, остальное считает код. Так выдуманная ссылка невозможна
// в принципе.
//
// Транспорт до модели живёт в llm.ts: в проде API, локально Claude CLI по
// подписке. Промпт, схема и разбор общие, поэтому карта получается одна и та же.

import type { MapEntry } from '@/lib/kb/map';
import { SYSTEM, buildUserPrompt, planOf } from './prompt';
import { callModel } from './llm';
import { materialUrl, type RoadmapSource } from './source';

// ── что возвращает модель ────────────────────────────────────────────────────

export interface DraftTask {
  key: string;
  title: string;
  why: string;
  owner: 'client' | 'sasha';
  week: number;
  /** section/slug из оглавления либо null для работы руками */
  material: string;
}

export interface Draft {
  goal: string;
  mainTakeaway: string;
  periodGoal: string;
  clientIntro: string;
  level: { number: number; title: string; evidence: string };
  metrics: { key: string; label: string; startValue: string }[];
  steps: { position: number; title: string; status: string; evidence: string }[];
  tasks: DraftTask[];
  notes: { kind: string; body: string; source: string }[];
}

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['goal', 'mainTakeaway', 'periodGoal', 'clientIntro', 'level', 'metrics', 'steps', 'tasks', 'notes'],
  properties: {
    goal: { type: 'string', description: 'куда человек идёт вообще, его целью и его словами' },
    mainTakeaway: {
      type: 'string',
      description:
        'одна мысль для сообщения человеку: главное, что видно из его анкеты и с чего начинается маршрут. Три-четыре строки, на «ты», без вступлений',
    },
    periodGoal: { type: 'string', description: 'что должно измениться за месяц доступа' },
    clientIntro: { type: 'string', description: 'две-три строки над картой в кабинете' },
    level: {
      type: 'object',
      additionalProperties: false,
      required: ['number', 'title', 'evidence'],
      properties: {
        number: { type: 'integer', description: 'от 1 до 6' },
        title: { type: 'string' },
        evidence: { type: 'string', description: 'почему именно этот уровень, фактами из анкеты' },
      },
    },
    metrics: {
      type: 'array',
      description: 'от 3 до 6 метрик',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['key', 'label', 'startValue'],
        properties: {
          key: { type: 'string', description: 'латиницей, без пробелов: views, leads, sales' },
          label: { type: 'string' },
          startValue: { type: 'string' },
        },
      },
    },
    steps: {
      type: 'array',
      description: 'от 4 до 7 ступеней',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['position', 'title', 'status', 'evidence'],
        properties: {
          position: { type: 'integer', description: 'порядковый номер ступени, с единицы' },
          title: { type: 'string' },
          status: { type: 'string', enum: ['done', 'partial', 'blocked', 'todo'] },
          evidence: { type: 'string' },
        },
      },
    },
    tasks: {
      type: 'array',
      description: 'от 12 до 16 задач',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['key', 'title', 'why', 'owner', 'week', 'material'],
        properties: {
          key: { type: 'string', description: 'латиницей через дефис, уникальный: w1-kurs-00' },
          title: { type: 'string' },
          why: { type: 'string', description: 'зачем это именно ему, с опорой на его слова' },
          owner: { type: 'string', enum: ['client', 'sasha'] },
          week: { type: 'integer', description: 'неделя маршрута: 1, 2, 3 или 4' },
          material: {
            type: 'string',
            description: 'идентификатор из оглавления вида section/slug. Пустая строка, если задача не про материал',
          },
        },
      },
    },
    notes: {
      type: 'array',
      description: 'от 4 до 8 заметок',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['kind', 'body', 'source'],
        properties: {
          kind: { type: 'string', enum: ['insight', 'risk', 'blocker', 'decision'] },
          body: { type: 'string' },
          source: { type: 'string', description: 'откуда это известно: анкета, вопрос 5' },
        },
      },
    },
  },
} as const;

// ── что уходит в базу ────────────────────────────────────────────────────────

export interface RoadmapTask {
  key: string;
  title: string;
  why: string;
  owner: string;
  dueOn: string;
  status: 'todo';
  linkUrl?: string;
  linkLabel?: string;
}

export interface RoadmapDraft {
  goal: string;
  mainTakeaway: string;
  periodGoal: string;
  clientIntro: string;
  metrics: { key: string; label: string; startValue: string; currentValue: string }[];
  steps: { position: number; title: string; status: string; evidence: string }[];
  tasks: RoadmapTask[];
  notes: { kind: string; body: string; source: string; happenedOn: string }[];
  /** что стоит глянуть глазами: пустой список значит, что придраться не к чему */
  warnings: string[];
  /** чем собрано: api за деньги или cli по подписке */
  backend: 'api' | 'cli';
  usage: { input: number; output: number };
}

/** Понедельник + 7·n: границы недель маршрута от даты старта. */
export function weekEnds(startedAt: Date, count = 4): string[] {
  const out: string[] = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date(startedAt);
    d.setUTCDate(d.getUTCDate() + i * 7);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Карту собирает модель, но ссылки, даты и уникальность ключей — код.
 * Здесь же копятся предупреждения: Саша по ним видит, где черновик хромает,
 * не перечитывая всю карту.
 */
export function assemble(draft: Draft, source: RoadmapSource, startedAt: Date): Omit<RoadmapDraft, 'usage' | 'backend'> {
  const byId = new Map<string, MapEntry>();
  for (const e of source.entries) byId.set(`${e.section}/${e.slug}`, e);

  const weeks = weekEnds(startedAt);
  const warnings: string[] = [];
  const seen = new Set<string>();

  const tasks: RoadmapTask[] = draft.tasks.map((t, i) => {
    let key = t.key.trim() || `task-${i + 1}`;
    if (seen.has(key)) {
      warnings.push(`ключ задачи «${key}» повторяется, второй переименован`);
      key = `${key}-${i + 1}`;
    }
    seen.add(key);

    const task: RoadmapTask = {
      key,
      title: t.title,
      why: t.why,
      owner: t.owner === 'sasha' ? 'sasha' : 'client',
      dueOn: weeks[Math.min(Math.max(t.week, 1), 4) - 1],
      status: 'todo',
    };

    if (t.material?.trim()) {
      const entry = byId.get(t.material.trim());
      if (entry) {
        task.linkUrl = materialUrl(entry, source.telegramId);
        task.linkLabel = entry.title;
      } else {
        // Материала нет в оглавлении: ссылку не ставим, но и задачу не выкидываем.
        warnings.push(`задача «${t.title}»: материала ${t.material} нет в кабинете, ссылка не поставлена`);
      }
    }

    return task;
  });

  const blocked = draft.steps.filter((s) => s.status === 'blocked').length;
  if (blocked !== 1) warnings.push(`ступеней со статусом blocked ${blocked}, а затык должен быть один`);

  const perWeek = [1, 2, 3, 4].map((w) => draft.tasks.filter((t) => t.week === w).length);
  if (perWeek.some((n) => n === 0)) warnings.push(`пустые недели: ${perWeek.map((n, i) => (n ? null : i + 1)).filter(Boolean).join(', ')}`);

  const withMaterial = draft.tasks.filter((t) => t.material?.trim()).length;
  if (withMaterial < 4) warnings.push(`задач с материалами всего ${withMaterial}: маршрут по материалам, а материалов почти нет`);

  const today = iso(new Date());

  return {
    goal: draft.goal,
    mainTakeaway: draft.mainTakeaway,
    periodGoal: draft.periodGoal,
    clientIntro: draft.clientIntro,
    metrics: draft.metrics.map((m) => ({ ...m, currentValue: m.startValue })),
    steps: draft.steps
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((s, i) => ({ ...s, position: i + 1 })),
    tasks,
    // Диагноз по шести уровням — первая заметка: с неё Саша начинает проверку.
    notes: [
      {
        kind: 'insight',
        body: `Уровень ${draft.level.number}: ${draft.level.title}. ${draft.level.evidence}`,
        source: 'диагноз по анкете',
        happenedOn: today,
      },
      ...draft.notes.map((n) => ({ ...n, happenedOn: today })),
    ],
    warnings,
  };
}

/**
 * Проверка формы ответа.
 *
 * У API её делает strict tool use, у CLI такого механизма нет, поэтому схему
 * держим здесь: непройденная проверка возвращается модели текстом, и она
 * пересобирает карту. Проверяем только форму, а не смысл: смысловые придирки
 * копятся отдельно, в warnings у assemble.
 */
export function validateDraft(data: unknown): string[] {
  const problems: string[] = [];
  const d = data as Partial<Draft> | null;
  if (!d || typeof d !== 'object') return ['ответ не объект'];

  for (const field of ['goal', 'mainTakeaway', 'periodGoal', 'clientIntro'] as const) {
    if (typeof d[field] !== 'string' || !d[field]?.trim()) problems.push(`поле ${field} пустое или не строка`);
  }

  if (!d.level || typeof d.level !== 'object') {
    problems.push('нет объекта level');
  } else {
    if (!Number.isInteger(d.level.number) || d.level.number < 1 || d.level.number > 6) {
      problems.push('level.number должен быть целым от 1 до 6');
    }
    if (!d.level.title?.trim()) problems.push('level.title пустой');
    if (!d.level.evidence?.trim()) problems.push('level.evidence пустой');
  }

  if (!Array.isArray(d.metrics) || d.metrics.length < 3 || d.metrics.length > 6) {
    problems.push('metrics должно быть от 3 до 6 штук');
  } else {
    d.metrics.forEach((m, i) => {
      if (!m?.key?.trim() || !m?.label?.trim() || !m?.startValue?.trim()) problems.push(`metrics[${i}]: пустое поле`);
    });
  }

  if (!Array.isArray(d.steps) || d.steps.length < 4 || d.steps.length > 7) {
    problems.push('steps должно быть от 4 до 7 ступеней');
  } else {
    const allowed = new Set(['done', 'partial', 'blocked', 'todo']);
    d.steps.forEach((s, i) => {
      if (!Number.isInteger(s?.position)) problems.push(`steps[${i}]: position не целое число`);
      if (!s?.title?.trim()) problems.push(`steps[${i}]: пустой title`);
      if (!allowed.has(s?.status)) problems.push(`steps[${i}]: статус «${s?.status}» не из списка`);
      if (!s?.evidence?.trim()) problems.push(`steps[${i}]: пустой evidence`);
    });
    const blocked = d.steps.filter((s) => s?.status === 'blocked').length;
    if (blocked !== 1) problems.push(`ступеней со статусом blocked ${blocked}, а затык должен быть ровно один`);
  }

  if (!Array.isArray(d.tasks) || d.tasks.length < 12 || d.tasks.length > 16) {
    problems.push('tasks должно быть от 12 до 16 задач');
  } else {
    d.tasks.forEach((t, i) => {
      if (!t?.key?.trim()) problems.push(`tasks[${i}]: пустой key`);
      if (!t?.title?.trim()) problems.push(`tasks[${i}]: пустой title`);
      if (!t?.why?.trim()) problems.push(`tasks[${i}]: пустой why`);
      if (t?.owner !== 'client' && t?.owner !== 'sasha') problems.push(`tasks[${i}]: owner «${t?.owner}» не client и не sasha`);
      if (![1, 2, 3, 4].includes(t?.week)) problems.push(`tasks[${i}]: week «${t?.week}» не 1-4`);
      if (typeof t?.material !== 'string') problems.push(`tasks[${i}]: material должен быть строкой, пустой если задача без материала`);
    });
  }

  if (!Array.isArray(d.notes) || d.notes.length < 4 || d.notes.length > 8) {
    problems.push('notes должно быть от 4 до 8 заметок');
  } else {
    const kinds = new Set(['insight', 'risk', 'blocker', 'decision']);
    d.notes.forEach((n, i) => {
      if (!kinds.has(n?.kind)) problems.push(`notes[${i}]: вид «${n?.kind}» не из списка`);
      if (!n?.body?.trim()) problems.push(`notes[${i}]: пустой body`);
      if (!n?.source?.trim()) problems.push(`notes[${i}]: пустой source`);
    });
  }

  return problems;
}

/** Одно обращение к модели. Всё остальное считает assemble. */
export async function generateRoadmap(source: RoadmapSource, startedAt: Date, accessUntil: Date): Promise<RoadmapDraft> {
  const name = source.firstName || source.username || 'клиент';

  const user = buildUserPrompt({
    name: source.username ? `${name} (@${source.username})` : name,
    plan: planOf(source.track),
    transcript: source.transcript,
    catalog: source.catalog,
    startedAt: iso(startedAt),
    accessUntil: iso(accessUntil),
    weeks: weekEnds(startedAt),
  });

  const reply = await callModel<Draft>({
    system: SYSTEM,
    user,
    schema: SCHEMA,
    toolName: 'roadmap',
    toolDescription: 'Готовая маршрутная карта клиента',
    validate: validateDraft,
  });

  const draft = reply.data;
  if (!draft?.steps?.length || !draft?.tasks?.length) {
    throw new Error(
      `карта пришла пустой (транспорт ${reply.backend}, поля: ${Object.keys(draft || {}).join(', ') || 'нет'}, ` +
        `ступеней ${draft?.steps?.length ?? 0}, задач ${draft?.tasks?.length ?? 0})`,
    );
  }

  return {
    ...assemble(draft, source, startedAt),
    backend: reply.backend,
    usage: reply.usage,
  };
}
