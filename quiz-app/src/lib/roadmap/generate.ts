// Сборка маршрутной карты по анкете: одно обращение к модели, дальше проверки.
//
// Модель отвечает вызовом инструмента со строгой схемой, поэтому разбирать
// текст не нужно. Ссылки на материалы и даты она НЕ пишет: называет материал
// идентификатором section/slug и неделю числом, остальное считает код. Так
// выдуманная ссылка невозможна в принципе.

import Anthropic from '@anthropic-ai/sdk';
import type { MapEntry } from '@/lib/kb/map';
import { SYSTEM, buildUserPrompt } from './prompt';
import { materialUrl, type RoadmapSource } from './source';

const MODEL = process.env.ROADMAP_MODEL || 'claude-opus-5';

let client: Anthropic | null = null;

function anthropic(): Anthropic {
  if (!client) {
    const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
    client = new Anthropic({ apiKey });
  }
  return client;
}

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
export function assemble(draft: Draft, source: RoadmapSource, startedAt: Date): Omit<RoadmapDraft, 'usage'> {
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

/** Одно обращение к модели. Всё остальное считает assemble. */
export async function generateRoadmap(source: RoadmapSource, startedAt: Date, accessUntil: Date): Promise<RoadmapDraft> {
  const name = source.firstName || source.username || 'клиент';

  const user = buildUserPrompt({
    name: source.username ? `${name} (@${source.username})` : name,
    transcript: source.transcript,
    catalog: source.catalog,
    startedAt: iso(startedAt),
    accessUntil: iso(accessUntil),
    weeks: weekEnds(startedAt),
  });

  // Карта длинная, поэтому стрим: без него большой max_tokens упирается в таймаут.
  const message = await anthropic()
    .messages.stream({
      model: MODEL,
      max_tokens: 32000,
      system: SYSTEM,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high' },
      tools: [
        {
          name: 'roadmap',
          description: 'Готовая маршрутная карта клиента',
          input_schema: SCHEMA as unknown as Anthropic.Tool['input_schema'],
          strict: true,
        },
      ],
      tool_choice: { type: 'tool', name: 'roadmap' },
      messages: [{ role: 'user', content: user }],
    })
    .finalMessage();

  const block = message.content.find((b) => b.type === 'tool_use' && b.name === 'roadmap');
  if (!block || block.type !== 'tool_use') {
    throw new Error(`модель не вернула карту (stop_reason: ${message.stop_reason})`);
  }

  const draft = block.input as Draft;
  if (!draft.steps?.length || !draft.tasks?.length) {
    throw new Error(
      `карта пришла пустой (stop_reason: ${message.stop_reason}, поля: ${Object.keys(draft || {}).join(', ') || 'нет'}, ` +
        `ступеней ${draft?.steps?.length ?? 0}, задач ${draft?.tasks?.length ?? 0}, вышло токенов ${message.usage.output_tokens})`,
    );
  }

  return {
    ...assemble(draft, source, startedAt),
    usage: { input: message.usage.input_tokens, output: message.usage.output_tokens },
  };
}
