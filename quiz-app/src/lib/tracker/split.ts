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

Каждый шаг:
- одно конкретное действие, которое можно отметить сделанным;
- начинается с глагола в повелительном наклонении («Написать», «Созвониться», «Выложить»);
- до 60 символов, без нумерации, точек в конце и пояснений в скобках;
- без «подумать», «проанализировать ситуацию» и прочих шагов, по которым непонятно, сделано или нет.

Квест: 3–8 шагов в порядке выполнения, последний шаг = задача доведена до результата у живых людей (опубликовано, отправлено, оплачено).
Регулярная задача: 2–5 пунктов чек-листа, которые реально сделать за один период.
Если контекста мало, предложи самый вероятный путь, не задавай вопросов.
Если уже есть сделанные шаги, не повторяй их, предложи только оставшиеся.`;

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
}): Promise<string[]> {
  const lines = [
    `Задача: ${input.title}`,
    input.kind === 'routine'
      ? `Тип: регулярная, ${PERIOD_RU[input.period ?? 'day']}`
      : 'Тип: разовый квест',
  ];
  if (input.note?.trim()) lines.push(`Контекст от Саши: ${input.note.trim()}`);
  if (input.done?.length) lines.push(`Уже сделано:\n${input.done.map((s) => `- ${s}`).join('\n')}`);

  const res = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 2000,
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
    .slice(0, 10);
}
