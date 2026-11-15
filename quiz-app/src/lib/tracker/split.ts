// Разбивка задачи трекера на шаги нейронкой: Саша пишет только название
// (и, если хочет, пару слов контекста), шаги предлагает модель.
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

const SYSTEM = `Ты раскладываешь задачу на шаги для личного трекера Саши. Саша эксперт по личному бренду и контенту в Instagram: ведёт клиентов (наставничество, созвоны, маршрутные карты), снимает рилсы и карусели, запускает продукты, работает с подрядчиками и нейронками.

Дроби мелко. Каждый шаг:
- одно конкретное действие на один заход, 15–40 минут работы; если дольше, дроби дальше;
- такое, что открыл трекер и сразу понятно, что делать прямо сейчас;
- начинается с глагола в повелительном наклонении («Написать», «Созвониться», «Выложить»);
- до 70 символов, без нумерации, точек в конце и пояснений в скобках;
- без «подумать», «проанализировать ситуацию» и прочих шагов, по которым непонятно, сделано или нет.

Если в задаче есть количество («7 каруселей», «3 рилса», «5 клиентам»), у каждой единицы свои шаги с номером: «Карусель 3: написать текст слайдов». Общие шаги (подбор тем на всю пачку, отправка одним ТЗ) остаются общими.
Квест: 6–20 шагов в порядке выполнения, последний шаг = результат у живых людей (опубликовано, отправлено, оплачено).
Регулярная задача: столько пунктов, сколько реально нужно за период, до 25, в порядке выполнения.

Как Саша работает (используй, если задача про это):
- Карусели: собрать свежие поинты, которых нет в ленте (свои данные, опыт, клиенты) → проверить поинт на банальность и на повтор по базе своих каруселей → подобрать под поинт проверенный заход из базы залётов → собрать карточку (тема, заход, поинт, выгода читателю, мост к продукту, CTA) → утвердить карточку («берём») → только потом текст слайдов → ТЗ на дизайн Дане → проверить готовое → выложить.
- Рилсы: выбросы ниши → суть референса → наш поинт → текст по ходу референса → съёмка → монтаж → проверка оптимизатором → выкладка, перезаливы в пробные.
- Клиенты: созвон → саммари → маршрутная карта → сообщение в боте.

Если контекста мало, предложи самый вероятный путь, не задавай вопросов.
Если уже есть сделанные шаги, не повторяй их, предложи только оставшиеся.
Если дан текущий план, не выкидывай его: сохрани смысл и порядок пунктов, а каждый пункт раздроби мельче.`;

const SCHEMA = {
  type: 'object',
  properties: { steps: { type: 'array', items: { type: 'string' } } },
  required: ['steps'],
  additionalProperties: false,
} as const;

const PERIOD_RU: Record<Period, string> = { day: 'каждый день', week: 'каждую неделю', month: 'каждый месяц' };

export async function splitIntoSteps(input: {
  title: string;
  note?: string | null;
  kind: 'quest' | 'routine';
  period?: Period | null;
  done?: string[];
  /** Текущие несделанные шаги: план, который надо раздробить мельче. */
  plan?: string[];
}): Promise<string[]> {
  const lines = [
    `Задача: ${input.title}`,
    input.kind === 'routine'
      ? `Тип: регулярная, ${PERIOD_RU[input.period ?? 'day']}`
      : 'Тип: разовый квест',
  ];
  if (input.note?.trim()) lines.push(`Контекст от Саши: ${input.note.trim()}`);
  if (input.done?.length) lines.push(`Уже сделано:\n${input.done.map((s) => `- ${s}`).join('\n')}`);
  if (input.plan?.length) lines.push(`Текущий план (раздроби мельче):\n${input.plan.map((s) => `- ${s}`).join('\n')}`);

  const res = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 4000,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    system: SYSTEM,
    messages: [{ role: 'user', content: lines.join('\n') }],
  });
  if (res.stop_reason === 'refusal') throw new Error('нейронка отказалась разбивать задачу');
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
  const parsed = JSON.parse(text) as { steps?: unknown };
  const steps = Array.isArray(parsed.steps) ? parsed.steps : [];
  return steps
    .map((s) => String(s).trim().replace(/[.;]+$/, ''))
    .filter(Boolean)
    .map((s) => s.slice(0, 300))
    .slice(0, 30);
}

/** Один шаг → 2–6 подшагов, которые встанут на его место. */
export async function splitOneStep(input: { task: string; step: string; around: string[] }): Promise<string[]> {
  const res = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 2000,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: [
          `Задача: ${input.task}`,
          `Все шаги задачи:\n${input.around.map((s) => `- ${s}`).join('\n')}`,
          `Раздроби ТОЛЬКО этот шаг на 2–6 подшагов, которые его полностью закрывают: «${input.step}».`,
          'Не повторяй соседние шаги. Верни только подшаги.',
        ].join('\n\n'),
      },
    ],
  });
  if (res.stop_reason === 'refusal') throw new Error('нейронка отказалась дробить шаг');
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
  const parsed = JSON.parse(text) as { steps?: unknown };
  return (Array.isArray(parsed.steps) ? parsed.steps : [])
    .map((s) => String(s).trim().replace(/[.;]+$/, ''))
    .filter(Boolean)
    .map((s) => s.slice(0, 300))
    .slice(0, 8);
}
