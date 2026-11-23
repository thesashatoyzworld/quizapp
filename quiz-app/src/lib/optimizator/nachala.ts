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
import type { FormatType, Nachala, NachalaBest, NachalaFallback, NachalaPick, PromiseCheck, ViewerReason } from './view';
import FAM_JSON from './data/fam-model.json';

/** 40 families of openings from the base (baza/fam.py), odds within author; f00 = no recognizable construction (×0.59). */
type Fam = { id: string; name: string; template: string; examples: string[]; or: number };
const FAMS: Fam[] = [...(FAM_JSON as Fam[]), { id: 'f00', name: 'Без узнаваемой конструкции', template: 'ни одно семейство не подходит', examples: [], or: 0.59 }];
const FAM_BY_ID = new Map(FAMS.map((f) => [f.id, f]));
/** A family this strong on the base is worth keeping (the confirmed ↑ ones are ×1.46 and up). */
const STRONG_FAM = 1.4;

const anthropic = new Anthropic();
const OPUS = 'claude-opus-5-5';
const SONNET = 'claude-sonnet-5-5';
const POOL = 60;

export type Opening = {
  code: string; author: string; ratio: number; likes: number | null; plaque: string | null; first: string; speech30: string;
  fam: string; fam_name: string; fam_or: number; tier: number; topic: string | null; format: string | null; promise: string | null; url: string;
  expect_type: string | null; explicit: boolean | null; tmpl: string | null;
  /** 23.11 bundle: gate type of the opening with its base odds within author, the blocks right after the hook, a student's own hit. */
  gate: string | null; gate_x: number | null; after: string | null; own: boolean;
};

/** Gate types (baza/gates.py) in plain words for the student. */
const GATE_RU: Record<string, string> = {
  result_money: 'результат или цифра', teaser: 'недосказанность', light_fun: 'лёгкое, смешное', reproach: 'упрёк зрителю',
  abstract_thesis: 'тезис', personal_story: 'начало личной истории', scene_line: 'реплика из сценки',
};

/** 23.11: a topic with few bank openings borrows from the nearest ones (питание had 3 of 10 student cases with an empty pool). */
const NEAR: Record<string, string[]> = {
  питание: ['еда_рецепты', 'фитнес_тело', 'здоровье_медицина'], еда_рецепты: ['питание'], фитнес_тело: ['питание', 'здоровье_медицина'],
  здоровье_медицина: ['фитнес_тело', 'питание'], психология_саморазвитие: ['отношения_семья', 'образование_языки'],
  отношения_семья: ['психология_саморазвитие', 'дети_родительство'], дети_родительство: ['отношения_семья'],
  блогинг_контент: ['маркетинг_реклама', 'бизнес_продажи'], маркетинг_реклама: ['блогинг_контент', 'бизнес_продажи'],
  бизнес_продажи: ['маркетинг_реклама', 'деньги_инвестиции', 'карьера_работа'], деньги_инвестиции: ['бизнес_продажи', 'карьера_работа'],
  карьера_работа: ['бизнес_продажи', 'психология_саморазвитие'], образование_языки: ['психология_саморазвитие'],
  красота_стиль: ['здоровье_медицина'], дом_быт: ['деньги_инвестиции', 'бизнес_продажи'], нейросети_технологии: ['блогинг_контент', 'бизнес_продажи'],
};

/** Base format labels (label.py) for the optimizer's format types. */
const FORMAT_OF: Partial<Record<FormatType, string>> = {
  position: 'position', lecture: 'lecture', story: 'story', skit: 'dialogue', dialogue: 'dialogue', reaction: 'reaction', demo: 'demo',
};

/** Opus/Sonnet 5.5 always think (adaptive); max_tokens leaves room for it. Effort low for the checks, medium elsewhere. */
async function ask(model: string, prompt: string, effort: 'low' | 'medium'): Promise<string> {
  if (process.env.OPT_VIA_CLI) return askCli(model, prompt);
  const msg = await anthropic.messages.create({
    model, max_tokens: 16_000, thinking: { type: 'adaptive' }, output_config: { effort }, messages: [{ role: 'user', content: prompt }],
  });
  await recordAnthropicUsage(model, msg.usage, 'optimizator');
  return msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
}

/** Bench runs (scripts/optimizator-nachala-bench.ts) go through the local claude CLI on the subscription, not the paid API. */
async function askCli(model: string, prompt: string): Promise<string> {
  const { spawn } = await import('node:child_process');
  const { mkdtempSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const cwd = mkdtempSync(join(tmpdir(), 'optcli-'));
  // 21.11: dotenv puts ANTHROPIC_API_KEY into the env, and the CLI then bills the paid API instead of the subscription
  // (it drained the API balance and the cabinet stopped). The bench must never inherit it.
  const cliEnv = { ...process.env }; delete cliEnv.ANTHROPIC_API_KEY; delete cliEnv.ANTHROPIC_AUTH_TOKEN;
  for (let attempt = 0; attempt < 2; attempt++) {
    const out = await new Promise<string>((res) => {
      const p = spawn(process.env.CLAUDE_BIN || 'claude', ['-p', '--tools', '', '--strict-mcp-config', '--setting-sources', '', '--no-session-persistence', '--model', model], { cwd, env: cliEnv });
      let o = '', e = '';
      p.stdout.on('data', (d) => { o += d; });
      p.stderr.on('data', (d) => { e += d; });
      p.on('close', (code) => { if (!o.trim()) console.error('askCli empty', model, code, e.slice(0, 300)); res(o); });
      p.on('error', () => res(''));
      p.stdin.end(prompt);
    });
    if (process.env.OPT_CLI_DEBUG) console.error('askCli', model, JSON.stringify(out.slice(0, 200)));
    if (out.trim()) return out;
  }
  return '';
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

/** The speech without its first phrase (and a short second one) and plaque marks: the new opening replaces them in the check.
 * 21.11: it used to drop the whole first line, and a transcript or a one-paragraph script is one line, so the check saw
 * the new opening with no reel after it and failed it ("no"), which then triggered a narrowing into a vaguer opening. */
function bodyWithoutOpening(script: string): string {
  const speech = script.split('\n').map((l) => l.trim()).filter((s) => s && !s.startsWith('[') && !s.startsWith('**'))
    .map((l) => l.replace(/^[0-9.]+-[0-9.]+\s*\|\s*/, '')).join(' ');
  const sents = speech.split(/(?<=[.!?…])\s+/);
  let drop = 1;
  if (sents[0] && sents[0].split(/\s+/).length < 6 && sents.length > 2) drop = 2;
  return sents.slice(drop).join(' ');
}

const PAY = `Ниже сценарий рилса. Определи, что зритель РЕАЛЬНО получает, если досмотрит: не тема, а конкретная отдача.
Верни только JSON-объект: {"type": "ответ|способ|причина|развязка|исход|цифра|список|мнение", "payoff": "что получает зритель, одной фразой, только по тексту", "quote": "дословная фраза из сценария, где это выдаётся", "not_given": "что сценарий НЕ даёт, хотя тема намекает (например способа нет, только мысль), или пусто"}

СЦЕНАРИЙ:
`;

// Same wording as reels-optimizer baza/expect.py (21.11): the check must be the labeler the x2.03 / x0.33 were measured with.
// Expectation, not a stated promise: a scene's «how will it end» counts as much as «three reasons» (x1.40 vs x1.39).
const CHECK = `Ниже расшифровки рилсов. У каждого плашка на экране в начале (если есть) и полный текст речи. Результатов ты не знаешь.
Представь зрителя, который увидел только начало (плашку и первые 1-2 фразы) и решает, смотреть ли дальше. Ожидание = то, чего он теперь ждёт от ролика, даже если автор этого не сказал словами. Сценка создаёт ожидание «чем кончится», конфликт «кто прав и чем закончится», странная фраза «что это значит», вопрос «какой ответ», заявленный способ «сам способ».
Для каждого ролика:
1) expect: чего ждёт зритель после начала, одной короткой фразой.
2) type: ответ (на вопрос или загадку) | способ (как сделать) | причина (почему так) | развязка (чем кончится сцена или история) | исход (кто прав, чем кончится конфликт или спор) | цифра (результат, сумма, итог) | список (перечень) | мнение (позиция автора по теме) | ничего (начало ничего не открывает: приветствие, тема без зацепки, анонс «сегодня поговорим»).
3) explicit: true, если ожидание прямо названо словами («покажу как», «три причины», вопрос зрителю); false, если оно возникает из сцены, конфликта, интриги, эмоции.
4) paid: даёт ли ролик то, чего зритель ждёт: "full" = да, ровно это; "partial" = частично, размыто или не то (ждёт способ, получает мысль; ждёт развязку, ролик обрывается; ждёт ответ, получает «пишите в директ»); "no" = нет, ролик про другое; "none" = ждать было нечего (type ничего).
5) at: где ролик это даёт: "start" = прямо в первых фразах (ждать нечего дальше), "middle", "end" (ближе к концу), "never".
6) gap: если partial/no, одной фразой чего не хватило; иначе "".
Будь строгим: оценивай по тексту, а не по тому, что автор мог иметь в виду.
Верни только JSON-массив: [{"id": "<id>", "expect": "...", "type": "...", "explicit": true, "paid": "full|partial|no|none", "at": "start|middle|end|never", "gap": "..."}]

РОЛИКИ:
`;

async function check(plaque: string, text: string): Promise<PromiseCheck> {
  const out = await ask(SONNET, CHECK + `=== id r1\nплашка: ${plaque || '(нет)'}\nречь: ${text.split(/\s+/).slice(0, 400).join(' ')}`, 'low');
  const r = json<{ expect?: string; type?: string; paid?: string; gap?: string }[]>(out, '[')?.[0];
  const d = r?.paid;
  // PromiseCheck keeps its field names (stored runs, view): delivered = paid off, promise = the expectation.
  return { delivered: d === 'full' || d === 'partial' || d === 'no' || d === 'none' ? d : 'unknown', promise: r?.expect || '', gap: r?.gap || '' };
}

/** A scripted dialogue («Голос 1: …», «Мама: …»): a dialogue donor turns a monologue into a skit, so it never goes to a monologue. */
const isDialogue = (t: string) => /(голос\s*\d\s*:|^\s*[А-ЯЁ][а-яё]{1,12}\s*:)/im.test(t);

async function pool(topic: string | null, format: string | null, excludeAuthor?: string, dialogue = true, ownAuthor?: string): Promise<Opening[]> {
  // 23.11: ratio capped at 15 in the order: a single x400 explosion is a fluke more than a repeatable move; the gate's base odds rank
  // a confirmed teaser or scene line over a neutral thesis at the same tier.
  const byTopics = (topics: string[]) => prisma.$queryRaw<Opening[]>`
    SELECT * FROM optimizator_openings WHERE topic = ANY(${topics}) AND NOT own
    ORDER BY (topic = ${topics[0]})::int DESC, (format = ${format ?? ''})::int DESC, tier ASC, COALESCE(gate_x, 1) DESC, LEAST(ratio, 15) DESC LIMIT 500`;
  let rows = topic
    ? await byTopics([topic])
    : await prisma.$queryRaw<Opening[]>`
        SELECT * FROM optimizator_openings WHERE format = ${format ?? ''} AND NOT own ORDER BY tier ASC, COALESCE(gate_x, 1) DESC, LEAST(ratio, 15) DESC LIMIT 500`;
  if (topic && rows.length < 10 && NEAR[topic]) rows = await byTopics([topic, ...NEAR[topic]]);
  // the student's own hits go first, whatever the topic: his own proven opening beats any stranger's
  const own = ownAuthor ? await prisma.$queryRaw<Opening[]>`
    SELECT * FROM optimizator_openings WHERE own AND author = ${ownAuthor} ORDER BY (topic = ${topic ?? ''})::int DESC, ratio DESC LIMIT 3` : [];
  const perAuthor = new Map<string, number>();
  const perFam = new Map<string, number>();
  const out: Opening[] = [...own];
  for (const r of rows) {
    if (excludeAuthor && r.author === excludeAuthor) continue; // bench: the tested reel's author must not leak in
    if (!dialogue && isDialogue(r.speech30)) continue;
    // at most 2 per author and 6 per family, so the pool covers many constructions
    if ((perAuthor.get(r.author) ?? 0) >= 2 || (perFam.get(r.fam) ?? 0) >= 6) continue;
    perAuthor.set(r.author, (perAuthor.get(r.author) ?? 0) + 1);
    perFam.set(r.fam, (perFam.get(r.fam) ?? 0) + 1);
    out.push(r);
    if (out.length >= POOL) break;
  }
  return out;
}

/** Lowercased words only, to find a quoted line inside the script whatever the punctuation and line breaks. */
const norm = (t: string) => (t.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).join(' ');

/** Stems of the opening words (first 5 letters, words of 3+ letters), plaque + first 15 words of speech. */
function stems(plaque: string | null, speech: string): string[] {
  const s = `${plaque || ''} ${speech.split(/\s+/).slice(0, 15).join(' ')}`.toLowerCase();
  return (s.match(/[\p{L}\p{N}]+/gu) || []).filter((w) => w.length > 2).map((w) => w.slice(0, 5));
}
/** Share of the donor's opening words kept in the new one. Base (copies/COPIES-REPORT.txt, 21.11): a copy of a hit keeping
 * 0.30+ of the donor's words x2.12 within author (0.45+ x2.46), below 0.30 x1.0-1.2: closeness carries the donor's result. */
export function donorOverlap(donor: { plaque: string | null; speech: string }, mine: { plaque: string; speech: string }): number {
  const d = stems(donor.plaque, donor.speech);
  const m = new Set(stems(mine.plaque, mine.speech));
  return d.length ? d.filter((w) => m.has(w)).length / d.length : 0;
}
const MIN_OVERLAP = 0.3;
/** Authors who copied hits kept a median 0.40 of the donor's words; above this the copy speaks in the donor's voice. */
const MAX_OVERLAP = 0.55;

/** Facts, numbers, names, events or claims in the opening that the script does not have (the bench labeler's wording); '' when clean. */
/** Gate types of an opening as the base labels them (gates.py brief), to keep the student off the weak ones. */
const GATE_DEF = `Тип начала (как его встречает зритель в ленте, плашка + первая фраза вместе), один из:
result_money: обещает или называет конкретный результат, деньги, цифру, превращение
teaser: короткая интригующая недосказанность, загадка, неожиданное утверждение, хочется узнать остальное
light_fun: шутка, ирония, абсурд, лёгкое настроение
recognition: описывает ситуацию или чувство, в котором зритель узнаёт себя («Когда муж опять…», «Ты тоже открываешь холодильник каждые 5 минут?», «Если у тебя тоже…»)
question: нейтральный прямой вопрос зрителю или вопрос темы
reproach: упрекает, ругает, обвиняет зрителя
abstract_thesis: общее утверждение, совет или принцип без конкретного крючка
personal_story: начинает личную историю или событие
mid_thought: начинается с середины мысли, вода, нет входа
scene_line: реплика внутри разыгранной сценки
announcement: анонс, новость, «сейчас расскажу про…», «сегодня поговорим о…», промо`;
/** 23.11: weak gate types (gates_rating.json): recognition x0.67, mid-thought x0.53, announcement x0.77, question x0.81. */
const WEAK_GATES = new Set(['recognition', 'mid_thought', 'announcement', 'question']);
/** A first phrase above 15 words was the bench's long-opening flag; hand-made bundles were 10-15 words. */
const MAX_FIRST_WORDS = 15;
const firstWords = (speech: string) => ((speech.trim().match(/^[\s\S]*?[.!?…](\s|$)/)?.[0] || speech).match(/[\p{L}\p{N}]+/gu) || []).length;

async function invented(script: string, p: { plaque: string; speech: string }): Promise<{ bad: string; gate: string }> {
  const out = await ask(SONNET, 'Ниже сценарий рилса и новое начало для него. Проверь: есть ли в начале факты, цифры, имена, события, оценки или утверждения, ' +
    'которых НЕТ в сценарии (выдумано или взято откуда-то ещё). Перефразирование того, что есть в сценарии, выдумкой не считается. ' +
    'И отдельно: звучит ли начало естественно по-русски и по смыслу, как живая речь автора (natural false, если фраза корявая, склеенная, бессмысленная или противоречит сценарию).\n' +
    GATE_DEF + '\n' +
    'Верни только JSON-массив: [{"i": 0, "invented": true, "what": "что выдумано, коротко, или пусто", "natural": true, "why": "если не естественно, почему", "hook": "тип начала"}]\n\nСЦЕНАРИЙ:\n' + script +
    `\n\nНАЧАЛА:\n0) плашка: ${p.plaque || '(нет)'} | речь: ${p.speech}`, 'low');
  const r = json<{ invented?: boolean; what?: string; natural?: boolean; why?: string; hook?: string }[]>(out, '[')?.[0];
  const bad = [r?.invented ? (r.what || 'есть выдуманное') : '', r?.natural === false ? `звучит неестественно: ${r.why || ''}` : ''].filter(Boolean);
  return { bad: bad.join('; '), gate: r?.hook || '' };
}

type Payoff = { type?: string; payoff?: string; quote?: string; not_given?: string };
type Raw = { code?: string; plaque?: string; speech?: string; promise?: string; kept_in?: string; next?: string; drop?: string };

export async function buildNachala(script: string, formatType: FormatType | undefined, opts: { stop?: ViewerReason; rewrite?: string; topic?: string | null; excludeAuthor?: string; ownAuthor?: string; pool?: Opening[] } = {}): Promise<Nachala> {
  const t0 = Date.now();
  const [pay, topic] = await Promise.all([
    ask(OPUS, PAY + script, 'medium').then((t) => json<Payoff>(t, '{') ?? {}),
    opts.topic !== undefined ? Promise.resolve(opts.topic) : topicOf(script).catch(() => null),
  ]);
  const format = (formatType && FORMAT_OF[formatType]) || null;
  const [P, origCheck] = await Promise.all([
    opts.pool ? Promise.resolve(opts.pool.filter((r) => isDialogue(script) || !isDialogue(r.speech30))) : pool(topic, format, opts.excludeAuthor, isDialogue(script), opts.ownAuthor),
    (() => { const o = openingOf(script); return check(o.plaque, script.replace(/\[Текст на экране[^\]]*\]/g, '')); })(),
  ]);
  const orig = { ...openingOf(script), check: origCheck };
  // an own hit with the same opening is this very reel re-uploaded or re-checked, not a donor (23.11: Artem's «дом за 1,4 млн»)
  for (let i = P.length - 1; i >= 0; i--) if (P[i].own && donorOverlap({ plaque: P[i].plaque, speech: P[i].speech30 }, orig) >= 0.6) P.splice(i, 1);
  const payoff = { type: pay.type || '', payoff: pay.payoff || '', quote: pay.quote || '', notGiven: pay.not_given || '' };
  if (P.length < 3) return { v: 2, payoff, orig, picks: [], topic, ms: Date.now() - t0, empty: true, best: { keep: true, why: 'none' }, fallback: await fallback(script, orig, payoff) };

  const cands = P.map((b) => `=== код ${b.code}${b.own ? ' (СВОЙ ЗАЛЁТ АВТОРА СЦЕНАРИЯ' : ' ('}×${b.ratio.toFixed(1)}; семейство «${b.fam_name}» ×${b.fam_or.toFixed(1)}${b.tier === 0 && !b.own ? ', подтверждено' : ''}` +
    `${b.gate && GATE_RU[b.gate] ? `; заход «${GATE_RU[b.gate]}»${b.gate_x ? ` ×${b.gate_x.toFixed(2)}` : ''}` : ''})\n` +
    `плашка: ${b.plaque || '(нет)'}\nречь: ${b.speech30}\nшаблон: ${b.tmpl || '—'}\nсразу после хука у него: ${b.after || '—'}\nзритель ждал и получил: ${b.promise || ''}${b.expect_type ? ` (${b.expect_type}${b.explicit === false ? ', из сцены, не словами' : ''})` : ''}`).join('\n');
  const prompt = `Ниже сценарий рилса, что он реально даёт зрителю, и ${P.length} начал чужих залётов. У каждого начала указано, чего зритель ждал после него, и в том ролике он это получил.
Правило из базы 4825 рилсов: если ролик отдаёт то, чего зритель ждёт после начала, он залетает в 2 раза чаще; если начало ничего не открывает, в 3 раза реже. Ожидание может быть названо словами («три причины») или возникать из сцены, конфликта, странной фразы («чем кончится?»), работает одинаково. Поэтому начало должно создавать ожидание ровно того, что сценарий даёт.
Второе правило из базы: начало, перенесённое близко к тексту залёта, переносит его результат (копия, где осталась треть слов образца и больше, залетает в 2 раза чаще). Перенос по смыслу своими словами не даёт ничего. Поэтому начало переносится почти дословно.

ЧТО СЦЕНАРИЙ ДАЁТ: ${payoff.payoff} (тип: ${payoff.type}; где: «${payoff.quote}»)
ЧЕГО СЦЕНАРИЙ НЕ ДАЁТ: ${payoff.notGiven || '—'}

1) Выбери 5 начал из РАЗНЫХ семейств, у которых тип ожидания совпадает с тем, что даёт сценарий (ждали способ, и сценарий даёт способ; ждали развязку, и сценарий рассказывает историю до конца). Сценка и история могут начинаться прямо со сцены, без слов о том, что будет. При прочих равных бери семейства с пометкой «подтверждено». Семейство бери только если смысл конструкции есть в сценарии: «тяжёлый факт биографии» = потеря, провал, беда автора, а не его успех; «сейчас все обсуждают» = в сценарии есть конкретная вещь, которую все видели; «запрет» = сценарий правда говорит не делать привычного.
2) Перенеси начало-образец почти дословно по его шаблону: заполни слоты шаблона [в скобках] словами из сценария, скелет и слова-крючки образца оставь, в том же порядке и той же длины (обычно это 30-50% его слов, как у живых авторов, которые копировали залёты). Бери только те образцы, чей шаблон естественно ложится на первый ход сценария; если ради шаблона приходится выдумывать или фраза становится корявой, бери другой образец. Меняй только те слова, которые обязаны поменяться под тему сценария (предмет, ниша, цифра, имя, профессия), и только на то, что есть в сценарии. Минимум половина слов образца должна остаться теми же. Не перефразируй и не улучшай.
3) Ожидание = отдача сценария, не больше. Не создавай ожидания того, что в «чего не даёт». Новых фактов, цифр, имён, оценок не выдумывай (нельзя «никто не говорит», «самый ленивый», «я наконец понял», если этого нет в сценарии).
4) Не добавляй слов и анонсов, которых нет в образце («объясню», «расскажу», «покажу», «вот что»): если в образце их нет, их нет и в переносе.
5) Голос автора сценария, не образца: обращение (ты или вы), связки и разговорные слова («короче», «смотри», «бля»), мат и манеру бери из сценария. Живые авторы так и копируют: «Только не говори мне, что ты до сих пор не ведёшь блог» → «Бля, только не говори, что ты до сих пор скачиваешь фильмы». Начало должно звучать так, будто его сказал автор сценария.
6) Тему и формат сценария не меняй. Длина как у образца; в диалоге первая фраза это реплика персонажа.
7) Если среди начал есть СВОЙ ЗАЛЁТ АВТОРА СЦЕНАРИЯ и его конструкция ложится на сценарий, бери его первым: своё проверенное начало сильнее чужого.
8) Что сразу после начала. Правило из базы: когда сразу после хука идут шаги или примеры, ролик залетает в 1,7 раза чаще; когда после хука самопрезентация («я ведущий», «подпишись»), подводка или утешение, сильно реже. Для каждого начала найди в сценарии кусок, который должен идти сразу за ним (обычно первый шаг, первый пример или первое блюдо из списка), и верни его ДОСЛОВНО фразой из сценария; это должна быть фраза, которой ещё нет в новом начале (не повторяй то, что начало уже сказало). Если между началом и этим куском в сценарии стоит самопрезентация, призыв подписаться, подводка или утешение, назови это дословно в drop: это убрать или перенести в конец. Если ничего мешающего нет, drop пустой.
Верни только JSON-массив из 5 объектов: [{"code": "код образца", "plaque": "...", "speech": "...", "promise": "чего зритель ждёт после этого начала", "kept_in": "дословная фраза сценария, где он это получает", "next": "дословная фраза сценария, которая идёт сразу после начала", "drop": "дословный кусок сценария, который убрать или перенести в конец, или пусто"}]

СЦЕНАРИЙ:
${script}

НАЧАЛА ЗАЛЁТОВ:
${cands}`;
  const raw = json<Raw[]>(await ask(OPUS, prompt, 'medium'), '[') ?? [];
  const byCode = new Map(P.map((b) => [b.code, b]));
  const body = bodyWithoutOpening(script);
  const fitMsg = (src: Opening, p: { plaque: string; speech: string }, why: string) =>
    `${why}\nОбразец (чужой залёт): плашка «${src.plaque || ''}», речь «${src.speech30.split(/\s+/).slice(0, 15).join(' ')}».\nСейчас: плашка «${p.plaque}», речь «${p.speech}».\n` +
    'Перенеси образец почти дословно: оставь его слова и порядок, меняй только слова, которые обязаны поменяться под тему (предмет, ниша, цифра, имя), и только на то, что есть в сценарии. Минимум половина слов образца остаётся. Ничего не выдумывай.\n' +
    'Верни только JSON-объект: {"plaque": "...", "speech": "...", "promise": "..."}\n\nСЦЕНАРИЙ:\n' + script;
  const all: (NachalaPick | null)[] = await Promise.all(raw.filter((r) => r.code && byCode.has(r.code) && r.speech).slice(0, 5).map(async (r) => {
    const src = byCode.get(r.code!)!;
    const donor = { plaque: src.plaque, speech: src.speech30 };
    let p = { plaque: r.plaque || '', speech: r.speech!, promise: r.promise || '', keptIn: r.kept_in || '' };
    // the «what goes right after» line must be the script's own words, else it is not shown (no invented next step)
    const inScript = (q?: string) => { const w = norm(q || ''); return w.length > 8 && norm(script).includes(w) ? (q || '').trim() : undefined; };
    const next = inScript(r.next);
    const drop = inScript(r.drop);
    let narrowed = false;
    // 1) closeness: a paraphrase does not carry the donor's result, so it gets one retry and is dropped if still far
    if (donorOverlap(donor, p) < MIN_OVERLAP) {
      const fix = json<{ plaque?: string; speech?: string; promise?: string }>(await ask(OPUS, fitMsg(src, p, 'Начало ушло слишком далеко от образца: осталось мало его слов.'), 'medium'), '{');
      if (fix?.speech) { p = { ...p, plaque: fix.plaque || '', speech: fix.speech, promise: fix.promise || p.promise }; narrowed = true; }
    }
    if (donorOverlap(donor, p) < MIN_OVERLAP) return null;
    // 21.11 blind test: the generator kept 65% of the donor's words, authors 40%, and Sonnet told them apart in 94%: too literal = the donor's voice
    if (donorOverlap(donor, p) > MAX_OVERLAP) {
      const fix = json<{ plaque?: string; speech?: string; promise?: string }>(await ask(OPUS, fitMsg(src, p,
        'Перенос звучит голосом образца, а не автора сценария. Оставь скелет образца, но обращение, связки, разговорные слова и манеру возьми из сценария автора.'), 'medium'), '{');
      if (fix?.speech) {
        const q = { plaque: fix.plaque || '', speech: fix.speech };
        if (donorOverlap(donor, q) >= MIN_OVERLAP) { p = { ...p, ...q, promise: fix.promise || p.promise }; narrowed = true; }
      }
    }
    // 1b) a near-verbatim copy drags the donor's own facts along («осень 2026», «таких, как я, не любят»: 41% of v5 variants on the
    // bench); claims absent from the script are swapped for the script's own or dropped, the donor's other words stay
    // 23.11: a long first phrase is shortened once (the donor's second sentence often rides along)
    if (firstWords(p.speech) > MAX_FIRST_WORDS) {
      const fix = json<{ plaque?: string; speech?: string; promise?: string }>(await ask(OPUS, fitMsg(src, p,
        `Первая фраза слишком длинная (${firstWords(p.speech)} слов). Сократи первую фразу до ${MAX_FIRST_WORDS} слов и меньше: оставь крючок образца, убери пояснения и вторую мысль.`), 'medium'), '{');
      if (fix?.speech && donorOverlap(donor, { plaque: fix.plaque || '', speech: fix.speech }) >= MIN_OVERLAP) {
        p = { ...p, plaque: fix.plaque || '', speech: fix.speech, promise: fix.promise || p.promise }; narrowed = true;
      }
      if (firstWords(p.speech) > MAX_FIRST_WORDS) return null;
    }
    // 23.11: a variant that is the student's own opening in other words gives him nothing
    if (!src.own && donorOverlap({ plaque: orig.plaque, speech: orig.speech }, p) >= 0.5) return null;
    let inv = await invented(script, p);
    if (inv.bad) {
      const fix = json<{ plaque?: string; speech?: string; promise?: string }>(await ask(OPUS, fitMsg(src, p,
        `В переносе есть проблемы: ${inv.bad}. Выдуманное замени на то, что есть в сценарии, или убери; корявое сделай живой речью автора. Остальные слова образца не трогай.`), 'medium'), '{');
      if (!fix?.speech) return null;
      const q = { plaque: fix.plaque || '', speech: fix.speech };
      if (donorOverlap(donor, q) < MIN_OVERLAP || firstWords(q.speech) > MAX_FIRST_WORDS) return null;
      inv = await invented(script, q);
      if (inv.bad) return null;
      p = { ...p, ...q, promise: fix.promise || p.promise }; narrowed = true;
    }
    // 23.11: the donor's gate is good, but the adaptation may slide into a weak one (recognition, announcement): out
    if (WEAK_GATES.has(inv.gate)) return null;
    // 2) the reel must pay off what the opening opens; one narrowing that keeps the donor's words, else a warning about the body
    let c = await check(p.plaque, p.speech + '\n' + body);
    let bodyGap: string | undefined;
    if (c.delivered !== 'full') {
      const fix = json<{ plaque?: string; speech?: string; promise?: string }>(await ask(OPUS, fitMsg(src, p,
        `После этого начала зритель ждёт не того, что даёт сценарий (${c.gap}). Сценарий даёт: ${payoff.payoff}. Поменяй в переносе только слова, из-за которых ожидание расходится со сценарием.`), 'medium'), '{');
      if (fix?.speech && donorOverlap(donor, { plaque: fix.plaque || '', speech: fix.speech }) >= MIN_OVERLAP) {
        const c2 = await check(fix.plaque || '', fix.speech + '\n' + body);
        if (c2.delivered === 'full' || c.delivered !== 'partial') {
          p = { ...p, plaque: fix.plaque || '', speech: fix.speech, promise: fix.promise || p.promise }; c = c2; narrowed = true;
        }
      }
      if (c.delivered !== 'full') bodyGap = c.gap || 'ролик не отдаёт того, чего ждут после этого начала';
    }
    return {
      ...p, check: c, narrowed, overlap: donorOverlap(donor, p), bodyGap, next, drop,
      src: { code: src.code, author: src.author, ratio: src.ratio, likes: src.likes, first: src.first, plaque: src.plaque, url: src.url,
             famName: src.fam_name, famX: src.fam_or, confirmed: src.tier === 0, own: !!src.own, tmpl: src.tmpl,
             gate: src.gate && GATE_RU[src.gate] ? GATE_RU[src.gate] : undefined, gateX: src.gate_x ?? undefined, after: src.after || undefined },
    };
  }));
  // 23.11: 5 candidates, so that 3 survive the checks (with 3 asked, 4 of 10 student cases ended with 1-2 variants)
  const picks = all.filter((p): p is NachalaPick => !!p);
  picks.sort((a, b) => Number(!!b.src.own) - Number(!!a.src.own) || Number(b.check.delivered === 'full') - Number(a.check.delivered === 'full'));
  picks.splice(3);

  // 21.11: one answer instead of three. Family of the student's own opening and of each adapted pick
  // (an adaptation that lost its construction, «Три причины…» without a number, is not shown).
  const fams = await classify([{ id: 'orig', ...orig }, ...picks.map((p, i) => ({ id: `p${i}`, plaque: p.plaque, speech: p.speech }))]);
  const of = FAM_BY_ID.get(fams.get('orig') || 'f00') || FAM_BY_ID.get('f00')!;
  const origFam = { id: of.id, name: of.name, x: of.or };
  picks.forEach((p, i) => { p.fits = fams.get(`p${i}`) === byCode.get(p.src.code)?.fam; });
  const best = decide({ ...orig, fam: origFam }, picks, opts.stop);
  let text: string | undefined;
  if (!best.keep && opts.rewrite) text = await withOpening(opts.rewrite, picks[best.i]).catch(() => undefined);
  // v6: no donor fits → defects of the own opening, a repair, a confirmed form, as a set for trial reels
  const fb = (best.keep && best.why === 'none') || process.env.OPT_FALLBACK_ALL ? await fallback(script, orig, payoff) : undefined;
  return { v: 2, payoff, orig: { ...orig, fam: origFam }, picks, topic, ms: Date.now() - t0, best, text, fallback: fb };
}

/** Opening defects confirmed within author on the base (O-REPORT.txt, EXPECT-REPORT.txt, 20-21.11). */
const DEFECTS: Record<string, { label: string; x: number }> = {
  nothing: { label: 'начало ничего не открывает: зрителю нечего ждать', x: 0.33 },
  unpaid: { label: 'ролик не отдаёт того, чего ждут после начала', x: 0.52 },
  partial: { label: 'ролик отдаёт ожидание начала только частично', x: 0.65 },
  midthought: { label: 'начало с середины мысли, без контекста', x: 0.58 },
  term: { label: 'термин в первой фразе, непонятный новичку', x: 0.6 },
  stream: { label: 'анонс эфира или встречи вместо зацепки', x: 0.14 },
  buy: { label: 'призыв купить в начале', x: 0.1 },
};
/** Confirmed constructions (fam-model.json verdict ↑), astrology f25 aside: offered as a form when there is no donor. */
const STRONG_FAMS = FAMS.filter((f) => f.id !== 'f25' && (f as Fam & { verdict?: string }).verdict?.startsWith('↑'));

async function fallback(script: string, orig: Nachala['orig'], payoff: Nachala['payoff']): Promise<NachalaFallback> {
  const defects: NachalaFallback['defects'] = [];
  const d = orig.check.delivered;
  if (d === 'none') defects.push({ id: 'nothing', ...DEFECTS.nothing, where: orig.check.promise || '' });
  if (d === 'no') defects.push({ id: 'unpaid', ...DEFECTS.unpaid, where: orig.check.gap });
  if (d === 'partial') defects.push({ id: 'partial', ...DEFECTS.partial, where: orig.check.gap });
  const lab = json<{ midthought?: string; term?: string; stream?: string; buy?: string }>(await ask(SONNET,
    'Ниже начало рилса (плашка + первые фразы) и сценарий. Отметь только то, что правда есть в начале, иначе пустая строка:\n' +
    'midthought: начало с середины мысли, зритель не понимает, о чём речь (процитируй);\nterm: в первой фразе термин или жаргон, непонятный новичку (какой);\n' +
    'stream: начало анонсирует эфир, встречу, вебинар вместо зацепки (процитируй);\nbuy: начало призывает купить, записаться, перейти по ссылке (процитируй).\n' +
    'Верни только JSON-объект: {"midthought": "", "term": "", "stream": "", "buy": ""}\n\n' +
    `НАЧАЛО: плашка: ${orig.plaque || '(нет)'} | речь: ${orig.speech}\n\nСЦЕНАРИЙ:\n${script}`, 'low'), '{') ?? {};
  for (const id of ['midthought', 'term', 'stream', 'buy'] as const) if (lab[id]) defects.push({ id, ...DEFECTS[id], where: lab[id]! });
  const forms = STRONG_FAMS.map((f) => `${f.id} «${f.name}» ×${f.or.toFixed(1)}: ${f.template}${f.examples[0] ? ` (пример: «${f.examples[0]}»)` : ''}`).join('\n');
  const gen = json<{ repair?: { plaque?: string; speech?: string }; form?: { fam?: string; plaque?: string; speech?: string } }>(await ask(OPUS,
    `Ниже сценарий рилса и его начало. Подходящего залёта-донора для этого ролика нет, поэтому нужны две версии начала для теста в пробных рилсах.\n` +
    `ЧТО СЦЕНАРИЙ ДАЁТ ЗРИТЕЛЮ: ${payoff.payoff}\nДЕФЕКТЫ НАЧАЛА ПО БАЗЕ: ${defects.map((x) => `${x.label}${x.where ? ` («${x.where}»)` : ''}`).join('; ') || 'не найдены'}\n\n` +
    '1) repair: минимальная починка начала словами автора: убери дефекты и сделай так, чтобы после начала зритель ждал ровно того, что даёт сценарий. Меняй как можно меньше, интонация и мат автора остаются.\n' +
    '2) form: то же начало в одной из подтверждённых конструкций ниже, только если она естественно ложится на сценарий; если ни одна не ложится, верни form пустым. Слова бери из сценария.\n' +
    'Ничего не выдумывай: никаких фактов, цифр, имён, событий, которых нет в сценарии.\n\nКОНСТРУКЦИИ:\n' + forms +
    `\n\nНАЧАЛО СЕЙЧАС: плашка: ${orig.plaque || '(нет)'} | речь: ${orig.speech}\n\nСЦЕНАРИЙ:\n${script}\n\n` +
    'Верни только JSON-объект: {"repair": {"plaque": "...", "speech": "..."}, "form": {"fam": "f07", "plaque": "...", "speech": "..."}}', 'medium'), '{') ?? {};
  const body = bodyWithoutOpening(script);
  const versions: NachalaFallback['versions'] = [{ kind: 'own', plaque: orig.plaque, speech: orig.speech, check: orig.check }];
  for (const [kind, v] of [['repair', gen.repair], ['form', gen.form]] as const) {
    if (!v?.speech) continue;
    const q = { plaque: v.plaque || '', speech: v.speech };
    if ((await invented(script, q)).bad) continue;
    const c = await check(q.plaque, q.speech + '\n' + body);
    if (c.delivered === 'no' || c.delivered === 'none') continue;
    const f = kind === 'form' ? FAM_BY_ID.get((v as { fam?: string }).fam || '') : undefined;
    versions.push({ kind, ...q, check: c, famName: f?.name, famX: f?.or });
  }
  return { defects, versions };
}

async function classify(items: { id: string; plaque: string; speech: string }[]): Promise<Map<string, string>> {
  const list = FAMS.map((f) => `${f.id} «${f.name}»: ${f.template}${f.examples[0] ? ` (пример: «${f.examples[0]}»)` : ''}`).join('\n');
  const out = await ask(SONNET, 'Отнеси каждое начало рилса (плашка + первые фразы) к одному семейству конструкций из списка. ' +
    'Смотри на форму, а не на тему: «Число + список» только если в начале есть число и перечисление, вопрос только если это вопрос и т.д. ' +
    'Если конструкция не совпадает ни с одним семейством, ставь f00.\n\nСЕМЕЙСТВА:\n' + list +
    '\n\nВерни только JSON-массив: [{"id": "...", "fam": "f01"}]\n\nНАЧАЛА:\n' +
    items.map((x) => `=== ${x.id}\nплашка: ${x.plaque || '(нет)'}\nречь: ${x.speech}`).join('\n'), 'low');
  const arr = json<{ id?: string; fam?: string }[]>(out, '[') ?? [];
  return new Map(arr.filter((o) => o.id && o.fam && FAM_BY_ID.has(o.fam)).map((o) => [o.id!, o.fam!]));
}

/** Keep the own opening when it is a strong construction the reel keeps, or it already stops the viewer and is kept;
 * else the best pick that still has its construction: promise kept, then family strength, then the source ratio. */
function decide(orig: Nachala['orig'] & { fam: { x: number } }, picks: NachalaPick[], stop?: ViewerReason): NachalaBest {
  const d = orig.check.delivered;
  if (orig.fam.x >= STRONG_FAM && (d === 'full' || d === 'partial')) return { keep: true, why: 'strong' };
  if (d === 'full' && (!stop || stop.answer === 'yes' || stop.score >= 7)) return { keep: true, why: 'stops' };
  // v5 (21.11): a close copy of a hit whose expectation the reel pays off (x1.50 on the base); the family fit and the announce filter
  // are gone: a near-verbatim copy keeps the donor's own words, announcements included, and that is what carries the result.
  const ok = picks.map((p, i) => ({ p, i })).filter(({ p }) => (p.overlap ?? 0) >= MIN_OVERLAP && p.check.delivered === 'full')
    .sort((a, b) => (b.p.overlap ?? 0) - (a.p.overlap ?? 0) || b.p.src.ratio - a.p.src.ratio);
  if (!ok.length) return { keep: true, why: 'none' };
  return { keep: false, i: ok[0].i };
}

/** The final text with the chosen opening in place of the old one; nothing else changes. */
async function withOpening(text: string, p: NachalaPick): Promise<string | undefined> {
  const out = await ask(SONNET, 'Ниже текст рилса и новое начало. Поставь новое начало вместо старого: строку «[Текст на экране: …]» в начале замени на новую плашку, ' +
    'первую фразу речи (или первые 1-2, если они про то же) замени на новую первую фразу. Если следующая фраза повторяет новое начало, убери повтор. ' +
    'Остальной текст не меняй ни словом, переносы строк и пометки в квадратных скобках сохрани. Верни только итоговый текст, без пояснений.\n\n' +
    `НОВОЕ НАЧАЛО:\nплашка: ${p.plaque || '(нет)'}\nпервая фраза: ${p.speech}\n\nТЕКСТ:\n${text}`, 'low');
  const t = out.trim();
  return t.length > text.length * 0.6 ? t : undefined;
}

/** Stored inside optimizator_runs.result as \`nachala\`, so the shared link shows it too. */
export async function saveNachala(runId: string, n: Nachala): Promise<void> {
  await prisma.$executeRaw`
    UPDATE optimizator_runs SET result = jsonb_set(result::jsonb, '{nachala}', ${JSON.stringify(n)}::jsonb) WHERE id = ${runId}`;
}
