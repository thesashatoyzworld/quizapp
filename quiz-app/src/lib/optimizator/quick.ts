// Server-only. 28.11 «Быстрая проверка»: the cheap daily check of the free optimizer (Sasha: «за 1 бакс заходить такой штукой
// пользоваться это дорого»). The same chance score as the full analysis (shans.ts, 3 Sonnet labellings) plus one Sonnet call
// that turns the bare technique names into plain words about THIS text: where the minus sits and what to do with it, and up to
// two strong techniques it lacks that fit the topic. Nothing is rewritten: ready openings and the body edit stay in the full
// analysis, a cheap single rewrite without the checks would be worse (cost bench 28.11).
import { llm } from './llm';
import { scoreShans } from './shans';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';
import MODEL_JSON from './data/shans-model.json';
import type { Shans } from './view';

type Feature = { set: string; id: string; name: string; part: string; weight: number; or: number };
const M = MODEL_JSON as unknown as { prompt: string; features: Feature[] };
const MODEL = 'claude-sonnet-5-5';
const anthropic = llm();

// «set:id Name: question?» lines of the labelling prompt: what each technique means, in the words the score was built on
const QUESTION = new Map<string, string>();
for (const line of M.prompt.split('\n')) {
  const m = /^(\w+:\w+) [^:]+: (.+)$/.exec(line.trim());
  if (m) QUESTION.set(m[1], m[2]);
}
const FORMAT = new Map<string, string>();
for (const line of M.prompt.split('\n')) {
  const m = /^- (\w+): (.+)$/.exec(line.trim());
  if (m) FORMAT.set(m[1], m[2]);
}
const keyOf = (name: string) => M.features.find((f) => f.name === name);
const meaning = (f: Feature) => (f.set === 'format' ? FORMAT.get(f.id) : QUESTION.get(`${f.set}:${f.id}`)) || '';

export type QuickHint = { name: string; part: string; quote?: string; why: string; fix: string };
export type QuickAdd = { name: string; part: string; how: string };
export type Quick = { shans: Shans; minus: QuickHint[]; add: QuickAdd[] };

const RULES = `Ты помогаешь автору рилсов понять, что мешает его сценарию набрать просмотры. Оценку уже посчитала модель на базе из тысяч рилсов: она нашла в тексте приёмы, которые в базе стабильно снижают просмотры, и не нашла сильных приёмов, которые их поднимают. Твоя задача объяснить это простыми словами про ЭТОТ текст.

Правила:
- Пиши как живой человек, на «ты», коротко. Без терминов модели, без процентов, без слов «приём», «фактор», «модель».
- Не переписывай сценарий и не давай готовых фраз для вставки. Говори, что сделать, а не пиши за автора.
- Для каждого минуса: процитируй дословно кусок текста, где он сидит (до 15 слов, точно как в тексте; если минус про весь ролик, цитату не давай), одной фразой объясни, почему это мешает зрителю, и одной-двумя фразами что сделать.
- Из списка «можно добавить» выбери не больше двух, которые естественно ложатся на тему и подачу этого текста. Если ни один не ложится, верни пустой список: притянутый за уши совет хуже никакого.
- Кодовое слово в комментариях автор ставит ради заявок, это его воронка. Не советуй его убирать. Объясни, что оно немного режет охват, и что сделать, чтобы ролик был ценен и без слова: главная польза в самом ролике, слово ведёт за продолжением, а не за сутью.
- Не используй длинное тире.

Верни только JSON: {"minus":[{"name":"<имя минуса как в списке>","quote":"<цитата или пусто>","why":"...","fix":"..."}],"add":[{"name":"<имя как в списке>","how":"<что и где сделать, 1-2 фразы>"}]}`;

/** null when the score failed; hints may be empty when the explanation failed (the score is still shown). Never throws. */
export async function quickCheck(script: string): Promise<Quick | null> {
  const shans = await scoreShans(script);
  if (!shans) return null;
  const minusF = shans.minus.map((m) => keyOf(m.name)).filter((f): f is Feature => !!f);
  const have = new Set([...shans.plus, ...shans.minus].map((x) => x.name));
  // strong techniques the text lacks; a format is not «added», it is the whole video
  const absent = M.features.filter((f) => f.weight > 0 && f.set !== 'format' && !have.has(f.name))
    .sort((a, b) => b.weight - a.weight).slice(0, 12);
  if (!minusF.length && !absent.length) return { shans, minus: [], add: [] };

  const list = [
    'МИНУСЫ, найденные в тексте:',
    ...(minusF.length ? minusF.map((f) => `- ${f.name} (${f.part}): ${meaning(f)}`) : ['- нет']),
    '',
    'МОЖНО ДОБАВИТЬ (сильные приёмы, которых в тексте нет):',
    ...absent.map((f) => `- ${f.name} (${f.part}): ${meaning(f)}`),
    '',
    'СЦЕНАРИЙ:',
    script.slice(0, 2500),
  ].join('\n');

  try {
    const msg = await anthropic.messages.create({
      model: MODEL, max_tokens: 4000, thinking: { type: 'adaptive' }, output_config: { effort: 'low' },
      system: RULES,
      messages: [{ role: 'user', content: list }],
    });
    await recordAnthropicUsage(MODEL, msg.usage, 'optimizator');
    const text = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    if (process.env.OPT_QDEBUG) console.error('[quick raw]', text.slice(0, 3000));
    const j = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}') as { minus?: Partial<QuickHint>[]; add?: Partial<QuickAdd>[] };
    const clean = (s?: string) => (s || '').replace(/\s[—–]\s/g, ', ').replace(/[—]/g, ',').trim();
    // the model echoes «Name (part)» as listed
    const nameOf = (s?: string) => (s || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
    const minus = (j.minus || []).flatMap((h) => {
      const f = minusF.find((x) => x.name === nameOf(h.name));
      if (!f || !h.fix) return [];
      // a quote the text does not contain is dropped, the hint stays
      const q = (h.quote || '').trim();
      return [{ name: f.name, part: f.part, quote: q && script.includes(q) ? clean(q) : undefined, why: clean(h.why), fix: clean(h.fix) }];
    });
    const add = (j.add || []).flatMap((a) => {
      const f = absent.find((x) => x.name === nameOf(a.name));
      return f && a.how ? [{ name: f.name, part: f.part, how: clean(a.how) }] : [];
    }).slice(0, 2);
    return { shans, minus, add };
  } catch (err) {
    console.error('[optimizator/quick]', String((err as Error)?.message || err).slice(0, 300));
    return { shans, minus: [], add: [] };
  }
}
