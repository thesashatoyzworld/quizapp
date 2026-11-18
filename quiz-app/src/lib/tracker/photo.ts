// Фото утренней тетрадки → список задач. Саша пишет задачи от руки,
// фоткает страницу, нейронка читает почерк и предлагает задачи с метками.
// Шаги здесь не собираются: их раскладывает createTask, по задаче на запрос.
import Anthropic from '@anthropic-ai/sdk';
import type { Period } from './periods';

const MODEL = process.env.TRACKER_MODEL || 'claude-opus-5-5';

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  if (!client) {
    const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
    client = new Anthropic({ apiKey });
  }
  return client;
}

export type PhotoTask = {
  title: string;
  kind: 'quest' | 'routine';
  period: Period | null;
  tags: string[];
  note: string | null;
  /** Название уже заведённой задачи, если на фото она же. */
  existing: string | null;
};

const SYSTEM = `Перед тобой фото страницы из тетрадки Саши: утром он от руки выписывает задачи. Саша эксперт по личному бренду и контенту в Instagram: клиенты, созвоны, карусели, рилсы, запуски продуктов, подрядчики (Даня делает дизайн каруселей и монтаж).

Прочитай почерк и верни задачи для трекера:
- title: задача своими словами Саши, коротко, до 80 символов, с глаголом. Сокращения раскрывай, если понятно («ТЗ Д.» → «Отправить ТЗ Дане»), имена людей сохраняй;
- kind: routine, если написано как регулярное («каждый день», «ежедневно», «по пн», привычки), иначе quest;
- period: для routine day | week | month, для quest null;
- tags: 1–2 метки в нижнем регистре. Сначала бери из списка существующих меток, новую заводи, только если ни одна не подходит;
- note: что ещё написано рядом с задачей (подпункты, срок, кому), иначе null. Подпункты не превращай в отдельные задачи;
- existing: если это та же задача, что уже заведена в трекере (по смыслу, не по буквам), впиши её название из списка ровно как там; иначе null.

Зачёркнутое и отмеченное галочкой как сделанное пропускай. Неразборчивое слово передай как видишь со знаком вопроса, не выдумывай. Даты, заголовки страниц и рисунки задачами не считаются.`;

const SCHEMA = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          kind: { type: 'string', enum: ['quest', 'routine'] },
          period: { anyOf: [{ type: 'string', enum: ['day', 'week', 'month'] }, { type: 'null' }] },
          tags: { type: 'array', items: { type: 'string' } },
          note: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          existing: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        },
        required: ['title', 'kind', 'period', 'tags', 'note', 'existing'],
        additionalProperties: false,
      },
    },
  },
  required: ['tasks'],
  additionalProperties: false,
} as const;

export type ImageType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

export async function readNotebook(input: {
  base64: string;
  mediaType: ImageType;
  tags: string[];
  titles: string[];
}): Promise<PhotoTask[]> {
  const context = [
    `Существующие метки: ${input.tags.length ? input.tags.join(', ') : 'пока нет'}`,
    `Задачи, которые уже в трекере:\n${input.titles.length ? input.titles.map((t) => `- ${t}`).join('\n') : '- нет'}`,
  ].join('\n\n');

  const res = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 8000,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: input.mediaType, data: input.base64 } },
          { type: 'text', text: context },
        ],
      },
    ],
  });
  if (res.stop_reason === 'refusal') throw new Error('нейронка отказалась читать фото');
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
  const parsed = JSON.parse(text) as { tasks?: PhotoTask[] };
  const known = new Set(input.titles);
  return (parsed.tasks ?? [])
    .filter((t) => t && String(t.title || '').trim())
    .slice(0, 40)
    .map((t) => ({
      title: String(t.title).trim().slice(0, 200),
      kind: t.kind === 'routine' ? 'routine' : 'quest',
      period: t.kind === 'routine' ? ((['day', 'week', 'month'] as const).find((p) => p === t.period) ?? 'day') : null,
      tags: Array.isArray(t.tags) ? t.tags.map(String) : [],
      note: t.note ? String(t.note).slice(0, 2000) : null,
      existing: t.existing && known.has(t.existing) ? t.existing : null,
    }));
}
