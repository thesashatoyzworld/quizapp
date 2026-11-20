// «Начало из залётов»: openings of other authors' hits, tied to what this reel actually gives.
// Research 20.11.2026 (reels-optimizer prompts/kallaway/baza):
//  - skip belongs to the opening and repeats (Sasha's re-uploads: ±4 pp), so hit openings are openings proven on a live audience;
//  - a recognizable opening construction matters: none x0.59 within author (FAM-REPORT.txt);
//  - the promise of the opening must be kept: fully kept x1.52, not kept x0.48 within author (PROMISE-REPORT.txt);
//    on Sasha's reels a partly kept promise cuts the watch-through (AUC 0.70).
// Flow (MVP clients/sasha/reels-8dney-2026-11-18/mvp/bank_mvp3.py): payoff of the script (Opus) → pool of bank openings of the
// same topic/format whose own promise was kept (optimizator_openings) → Opus picks 3 of different families and adapts them to
// promise exactly the payoff → each is checked by the same promise labeler as the base (Sonnet); a failed one is narrowed once.
// Server only.
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';
import { topicOf } from './baza';
import type { FormatType, Nachala, NachalaPick, PromiseCheck } from './view';

const anthropic = new Anthropic();
const OPUS = 'claude-opus-5-5';
const SONNET = 'claude-sonnet-5-5';
const POOL = 60;

type Opening = {
  code: string; author: string; ratio: number; likes: number | null; plaque: string | null; first: string; speech30: string;
  fam: string; fam_name: string; fam_or: number; tier: number; topic: string | null; format: string | null; promise: string | null; url: string;
};

/** Base format labels (label.py) for the optimizer's format types. */
const FORMAT_OF: Partial<Record<FormatType, string>> = {
  position: 'position', lecture: 'lecture', story: 'story', skit: 'dialogue', dialogue: 'dialogue', reaction: 'reaction', demo: 'demo',
};

/** Opus/Sonnet 5.5 always think (adaptive); max_tokens leaves room for it. Effort low for the checks, medium elsewhere. */
async function ask(model: string, prompt: string, effort: 'low' | 'medium'): Promise<string> {
  const msg = await anthropic.messages.create({
    model, max_tokens: 16_000, thinking: { type: 'adaptive' }, output_config: { effort }, messages: [{ role: 'user', content: prompt }],
  });
  await recordAnthropicUsage(model, msg.usage, 'optimizator');
  return msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
}

function json<T>(text: string, open: '[' | '{'): T | null {
  const i = text.indexOf(open);
  if (i < 0) return null;
  const close = open === '[' ? ']' : '}';
  const j = text.lastIndexOf(close);
  try { return JSON.parse(text.slice(i, j + 1)) as T; } catch { return null; }
}

/** Plaque from a «[Текст на экране: ...]» mark and the first ~30 words of speech, as in the MVP. */
export function openingOf(script: string): { plaque: string; speech: string } {
  const pl = script.match(/\[Текст на экране[^:\]]*:\s*([^\]]+)\]/);
  const body = script.split('\n').filter((l) => l.trim() && !l.trim().startsWith('[') && !l.trim().startsWith('**'));
  // Transcripts carry «0.0-3.4 | » timing marks per line.
  const speech = body.slice(0, 3).map((l) => l.replace(/^\s*[0-9.]+-[0-9.]+\s*\|\s*/, '')).join(' ').split(/\s+/).slice(0, 30).join(' ');
  return { plaque: pl ? pl[1].trim() : '', speech };
}

/** The script without its first speech line and plaque marks: the new opening replaces them in the check. */
function bodyWithoutOpening(script: string): string {
  let dropped = false;
  return script.split('\n').filter((l) => {
    const s = l.trim();
    if (s.startsWith('[Текст на экране')) return false;
    if (!dropped && s && !s.startsWith('[') && !s.startsWith('**')) { dropped = true; return false; }
    return true;
  }).join('\n');
}

const PAY = `Ниже сценарий рилса. Определи, что зритель РЕАЛЬНО получает, если досмотрит: не тема, а конкретная отдача.
Верни только JSON-объект: {"type": "способ|объяснение причины|результат/цифры|история с развязкой|позиция/мнение|список|новость|эмоция", "payoff": "что получает зритель, одной фразой, только по тексту", "quote": "дословная фраза из сценария, где это выдаётся", "not_given": "что сценарий НЕ даёт, хотя тема намекает (например способа нет, только мысль), или пусто"}

СЦЕНАРИЙ:
`;

// Same wording as reels-optimizer baza/promise.py: the check must be the labeler the x1.52 / x0.48 were measured with.
const CHECK = `Ниже расшифровки рилсов. У каждого плашка на экране в начале (если есть) и полный текст речи. Результатов ты не знаешь.
Для каждого ролика:
1) promise: что начало (плашка + первые 1-2 фразы) обещает зрителю получить, если он досмотрит. Одна короткая фраза. Если начало ничего не обещает (просто тема, анонс, приветствие) пиши "нет".
2) delivered: выполняет ли остальной ролик это обещание:
   "full" = зритель получает ровно заявленное;
   "partial" = получает частично, размыто или не то, что ждал по началу (обещан способ, а дана мысль; обещаны цифры, а их нет; обещан ответ, а ответ «приходите на консультацию»);
   "no" = суть ролика про другое или обещанного нет совсем;
   "none" = начало ничего не обещало.
3) gap: если partial/no, одной фразой чего не хватило; иначе "".
Будь строгим: оценивай по тексту, а не по тому, что автор мог иметь в виду.
Верни только JSON-массив: [{"id": "<id>", "promise": "...", "delivered": "full|partial|no|none", "gap": "..."}]

РОЛИКИ:
`;

async function check(plaque: string, text: string): Promise<PromiseCheck> {
  const out = await ask(SONNET, CHECK + `=== id r1\nплашка: ${plaque || '(нет)'}\nречь: ${text.split(/\s+/).slice(0, 400).join(' ')}`, 'low');
  const r = json<{ promise?: string; delivered?: string; gap?: string }[]>(out, '[')?.[0];
  const d = r?.delivered;
  return { delivered: d === 'full' || d === 'partial' || d === 'no' || d === 'none' ? d : 'unknown', promise: r?.promise || '', gap: r?.gap || '' };
}

async function pool(topic: string | null, format: string | null): Promise<Opening[]> {
  const rows = topic
    ? await prisma.$queryRaw<Opening[]>`
        SELECT * FROM optimizator_openings WHERE topic = ${topic}
        ORDER BY (format = ${format ?? ''})::int DESC, tier ASC, ratio DESC LIMIT 500`
    : await prisma.$queryRaw<Opening[]>`
        SELECT * FROM optimizator_openings WHERE format = ${format ?? ''} ORDER BY tier ASC, ratio DESC LIMIT 500`;
  const perAuthor = new Map<string, number>();
  const perFam = new Map<string, number>();
  const out: Opening[] = [];
  for (const r of rows) { // at most 2 per author and 6 per family, so the pool covers many constructions
    if ((perAuthor.get(r.author) ?? 0) >= 2 || (perFam.get(r.fam) ?? 0) >= 6) continue;
    perAuthor.set(r.author, (perAuthor.get(r.author) ?? 0) + 1);
    perFam.set(r.fam, (perFam.get(r.fam) ?? 0) + 1);
    out.push(r);
    if (out.length >= POOL) break;
  }
  return out;
}

type Payoff = { type?: string; payoff?: string; quote?: string; not_given?: string };
type Raw = { code?: string; plaque?: string; speech?: string; promise?: string; kept_in?: string };

export async function buildNachala(script: string, formatType: FormatType | undefined): Promise<Nachala> {
  const t0 = Date.now();
  const [pay, topic] = await Promise.all([
    ask(OPUS, PAY + script, 'medium').then((t) => json<Payoff>(t, '{') ?? {}),
    topicOf(script).catch(() => null),
  ]);
  const format = (formatType && FORMAT_OF[formatType]) || null;
  const [P, origCheck] = await Promise.all([
    pool(topic, format),
    (() => { const o = openingOf(script); return check(o.plaque, script.replace(/\[Текст на экране[^\]]*\]/g, '')); })(),
  ]);
  const orig = { ...openingOf(script), check: origCheck };
  const payoff = { type: pay.type || '', payoff: pay.payoff || '', quote: pay.quote || '', notGiven: pay.not_given || '' };
  if (P.length < 3) return { payoff, orig, picks: [], topic, ms: Date.now() - t0, empty: true };

  const cands = P.map((b) => `=== код ${b.code} (×${b.ratio.toFixed(1)}; семейство «${b.fam_name}» ×${b.fam_or.toFixed(1)}${b.tier === 0 ? ', подтверждено' : ''})\n` +
    `плашка: ${b.plaque || '(нет)'}\nречь: ${b.speech30}\nобещало и выполнило: ${b.promise || ''}`).join('\n');
  const prompt = `Ниже сценарий рилса, что он реально даёт зрителю, и ${P.length} начал чужих залётов. У каждого начала указано, что оно обещало, и это обещание в том ролике было выполнено полностью.
Правило из базы 4481 рилса: если ролик выполняет обещание начала, он залетает в 1,5 раза чаще; не выполняет, в 2 раза реже. Поэтому начало должно обещать ровно то, что сценарий даёт.

ЧТО СЦЕНАРИЙ ДАЁТ: ${payoff.payoff} (тип: ${payoff.type}; где: «${payoff.quote}»)
ЧЕГО СЦЕНАРИЙ НЕ ДАЁТ: ${payoff.notGiven || '—'}

1) Выбери 3 начала из РАЗНЫХ семейств, у которых тип обещания совпадает с тем, что даёт сценарий (обещали способ, и сценарий даёт способ; обещали историю, и сценарий рассказывает историю). При прочих равных бери семейства с пометкой «подтверждено».
2) Адаптируй: та же конструкция, но обещание = отдача сценария, не больше. Не обещай того, что в «чего не даёт». Новых фактов, цифр, оценок и обещаний не выдумывай (нельзя «никто не говорит», «самый ленивый», «я наконец понял», если этого нет в сценарии). Тему и формат не меняй. Плашка 2-6 слов, первая фраза до 15 слов; в диалоге первая фраза это реплика персонажа.
Верни только JSON-массив из 3 объектов: [{"code": "код образца", "plaque": "...", "speech": "...", "promise": "что начало обещает", "kept_in": "дословная фраза сценария, где обещание выполняется"}]

СЦЕНАРИЙ:
${script}

НАЧАЛА ЗАЛЁТОВ:
${cands}`;
  const raw = json<Raw[]>(await ask(OPUS, prompt, 'medium'), '[') ?? [];
  const byCode = new Map(P.map((b) => [b.code, b]));
  const body = bodyWithoutOpening(script);
  const picks: NachalaPick[] = await Promise.all(raw.filter((r) => r.code && byCode.has(r.code) && r.speech).slice(0, 3).map(async (r) => {
    const src = byCode.get(r.code!)!;
    let p = { plaque: r.plaque || '', speech: r.speech!, promise: r.promise || '', keptIn: r.kept_in || '' };
    let c = await check(p.plaque, p.speech + '\n' + body);
    let narrowed = false;
    if (c.delivered !== 'full') {
      const fix = json<{ plaque?: string; speech?: string; promise?: string }>(await ask(OPUS,
        `Начало рилса обещает больше или другое, чем даёт сценарий. Проверка: «${c.gap}». Перепиши начало в той же конструкции так, ` +
        `чтобы оно обещало ровно то, что сценарий даёт: ${payoff.payoff}. Ничего не выдумывай. Плашка 2-6 слов, первая фраза до 15 слов: не пересказывай весь способ, только пообещай его.\nСейчас: плашка «${p.plaque}», речь «${p.speech}».\n` +
        'Верни только JSON-объект: {"plaque": "...", "speech": "...", "promise": "..."}\n\nСЦЕНАРИЙ:\n' + script, 'medium'), '{');
      if (fix?.speech) {
        const c2 = await check(fix.plaque || '', fix.speech + '\n' + body);
        p = { ...p, plaque: fix.plaque || '', speech: fix.speech, promise: fix.promise || p.promise };
        c = c2;
        narrowed = true;
      }
    }
    return {
      ...p, check: c, narrowed,
      src: { code: src.code, author: src.author, ratio: src.ratio, likes: src.likes, first: src.first, plaque: src.plaque, url: src.url,
             famName: src.fam_name, famX: src.fam_or, confirmed: src.tier === 0 },
    };
  }));
  picks.sort((a, b) => Number(b.check.delivered === 'full') - Number(a.check.delivered === 'full'));
  return { payoff, orig, picks, topic, ms: Date.now() - t0 };
}

/** Stored inside optimizator_runs.result as \`nachala\`, so the shared link shows it too. */
export async function saveNachala(runId: string, n: Nachala): Promise<void> {
  await prisma.$executeRaw`
    UPDATE optimizator_runs SET result = jsonb_set(result::jsonb, '{nachala}', ${JSON.stringify(n)}::jsonb) WHERE id = ${runId}`;
}
