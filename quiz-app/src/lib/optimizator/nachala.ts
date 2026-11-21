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
import type { FormatType, Nachala, NachalaBest, NachalaPick, PromiseCheck, ViewerReason } from './view';
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

type Opening = {
  code: string; author: string; ratio: number; likes: number | null; plaque: string | null; first: string; speech30: string;
  fam: string; fam_name: string; fam_or: number; tier: number; topic: string | null; format: string | null; promise: string | null; url: string;
  expect_type: string | null; explicit: boolean | null;
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
  for (let attempt = 0; attempt < 2; attempt++) {
    const out = await new Promise<string>((res) => {
      const p = spawn(process.env.CLAUDE_BIN || 'claude', ['-p', '--tools', '', '--strict-mcp-config', '--setting-sources', '', '--no-session-persistence', '--model', model], { cwd });
      let o = '';
      p.stdout.on('data', (d) => { o += d; });
      p.on('close', () => res(o));
      p.on('error', () => res(''));
      p.stdin.end(prompt);
    });
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

async function pool(topic: string | null, format: string | null, excludeAuthor?: string): Promise<Opening[]> {
  const rows = topic
    ? await prisma.$queryRaw<Opening[]>`
        SELECT * FROM optimizator_openings WHERE topic = ${topic}
        ORDER BY (format = ${format ?? ''})::int DESC, tier ASC, ratio DESC LIMIT 500`
    : await prisma.$queryRaw<Opening[]>`
        SELECT * FROM optimizator_openings WHERE format = ${format ?? ''} ORDER BY tier ASC, ratio DESC LIMIT 500`;
  const perAuthor = new Map<string, number>();
  const perFam = new Map<string, number>();
  const out: Opening[] = [];
  for (const r of rows) {
    if (excludeAuthor && r.author === excludeAuthor) continue; // bench: the tested reel's author must not leak in
    // at most 2 per author and 6 per family, so the pool covers many constructions
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

export async function buildNachala(script: string, formatType: FormatType | undefined, opts: { stop?: ViewerReason; rewrite?: string; topic?: string | null; excludeAuthor?: string } = {}): Promise<Nachala> {
  const t0 = Date.now();
  const [pay, topic] = await Promise.all([
    ask(OPUS, PAY + script, 'medium').then((t) => json<Payoff>(t, '{') ?? {}),
    opts.topic !== undefined ? Promise.resolve(opts.topic) : topicOf(script).catch(() => null),
  ]);
  const format = (formatType && FORMAT_OF[formatType]) || null;
  const [P, origCheck] = await Promise.all([
    pool(topic, format, opts.excludeAuthor),
    (() => { const o = openingOf(script); return check(o.plaque, script.replace(/\[Текст на экране[^\]]*\]/g, '')); })(),
  ]);
  const orig = { ...openingOf(script), check: origCheck };
  const payoff = { type: pay.type || '', payoff: pay.payoff || '', quote: pay.quote || '', notGiven: pay.not_given || '' };
  if (P.length < 3) return { v: 2, payoff, orig, picks: [], topic, ms: Date.now() - t0, empty: true, best: { keep: true, why: 'none' } };

  const cands = P.map((b) => `=== код ${b.code} (×${b.ratio.toFixed(1)}; семейство «${b.fam_name}» ×${b.fam_or.toFixed(1)}${b.tier === 0 ? ', подтверждено' : ''})\n` +
    `плашка: ${b.plaque || '(нет)'}\nречь: ${b.speech30}\nзритель ждал и получил: ${b.promise || ''}${b.expect_type ? ` (${b.expect_type}${b.explicit === false ? ', из сцены, не словами' : ''})` : ''}`).join('\n');
  const prompt = `Ниже сценарий рилса, что он реально даёт зрителю, и ${P.length} начал чужих залётов. У каждого начала указано, чего зритель ждал после него, и в том ролике он это получил.
Правило из базы 4825 рилсов: если ролик отдаёт то, чего зритель ждёт после начала, он залетает в 2 раза чаще; если начало ничего не открывает, в 3 раза реже. Ожидание может быть названо словами («три причины») или возникать из сцены, конфликта, странной фразы («чем кончится?»), работает одинаково. Поэтому начало должно создавать ожидание ровно того, что сценарий даёт.

ЧТО СЦЕНАРИЙ ДАЁТ: ${payoff.payoff} (тип: ${payoff.type}; где: «${payoff.quote}»)
ЧЕГО СЦЕНАРИЙ НЕ ДАЁТ: ${payoff.notGiven || '—'}

1) Выбери 3 начала из РАЗНЫХ семейств, у которых тип ожидания совпадает с тем, что даёт сценарий (ждали способ, и сценарий даёт способ; ждали развязку, и сценарий рассказывает историю до конца). Сценка и история могут начинаться прямо со сцены, без слов о том, что будет. При прочих равных бери семейства с пометкой «подтверждено». Семейство бери только если смысл конструкции есть в сценарии: «тяжёлый факт биографии» = потеря, провал, беда автора, а не его успех; «сейчас все обсуждают» = в сценарии есть конкретная вещь, которую все видели; «запрет» = сценарий правда говорит не делать привычного.
2) Перенеси начало-образец: сохрани его скелет предложения (порядок частей, длину, тип первой фразы: утверждение, запрет, вопрос, реплика), замени только содержание на тему сценария. Должно быть видно, что это то же начало с другой темой.
3) Ожидание = отдача сценария, не больше. Не создавай ожидания того, что в «чего не даёт». Новых фактов, цифр, имён, оценок не выдумывай (нельзя «никто не говорит», «самый ленивый», «я наконец понял», если этого нет в сценарии).
4) Без анонсов: нельзя «объясню», «расскажу», «покажу», «разберём», «скажу», «вот что», «вот почему», «и что делать», «что вместо», «давайте разберёмся». Начало само по себе цепляет утверждением, запретом, сценой или вопросом, а не сообщает, о чём будет ролик.
5) Голос автора: бери его слова и интонацию из сценария. Если автор ругается, злится, говорит разговорно (мат, «короче», «блин»), начало тоже так звучит; не делай его вежливее и глаже.
6) Тему и формат не меняй. Плашка 2-6 слов, первая фраза до 15 слов; в диалоге первая фраза это реплика персонажа.
Верни только JSON-массив из 3 объектов: [{"code": "код образца", "plaque": "...", "speech": "...", "promise": "чего зритель ждёт после этого начала", "kept_in": "дословная фраза сценария, где он это получает"}]

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
        `После этого начала зритель ждёт не того, что даёт сценарий. Проверка: «${c.gap}». Перепиши начало в той же конструкции так, ` +
        `чтобы зритель ждал ровно того, что сценарий даёт: ${payoff.payoff}. Ничего не выдумывай. Сохрани слова и интонацию автора, без анонсов («объясню», «расскажу», «покажу», «вот что»). Плашка 2-6 слов, первая фраза до 15 слов: не пересказывай весь способ, только пообещай его.\nСейчас: плашка «${p.plaque}», речь «${p.speech}».\n` +
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

  // 21.11: one answer instead of three. Family of the student's own opening and of each adapted pick
  // (an adaptation that lost its construction, «Три причины…» without a number, is not shown).
  const fams = await classify([{ id: 'orig', ...orig }, ...picks.map((p, i) => ({ id: `p${i}`, plaque: p.plaque, speech: p.speech }))]);
  const of = FAM_BY_ID.get(fams.get('orig') || 'f00') || FAM_BY_ID.get('f00')!;
  const origFam = { id: of.id, name: of.name, x: of.or };
  picks.forEach((p, i) => { p.fits = fams.get(`p${i}`) === byCode.get(p.src.code)?.fam; });
  const best = decide({ ...orig, fam: origFam }, picks, opts.stop);
  let text: string | undefined;
  if (!best.keep && opts.rewrite) text = await withOpening(opts.rewrite, picks[best.i]).catch(() => undefined);
  return { v: 2, payoff, orig: { ...orig, fam: origFam }, picks, topic, ms: Date.now() - t0, best, text };
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

/** Announcement words: the base gives an announced opening ↓ (O-REPORT), and the generator still slips into them. */
const ANNOUNCE = /(объясн|расскаж|покаж|разбер[её]м|скажу|вот что|вот почему|вот как|что делать|что вместо|давайте разбер)/i;

/** Keep the own opening when it is a strong construction the reel keeps, or it already stops the viewer and is kept;
 * else the best pick that still has its construction: promise kept, then family strength, then the source ratio. */
function decide(orig: Nachala['orig'] & { fam: { x: number } }, picks: NachalaPick[], stop?: ViewerReason): NachalaBest {
  const d = orig.check.delivered;
  if (orig.fam.x >= STRONG_FAM && (d === 'full' || d === 'partial')) return { keep: true, why: 'strong' };
  if (d === 'full' && (!stop || stop.answer === 'yes' || stop.score >= 7)) return { keep: true, why: 'stops' };
  const ok = picks.map((p, i) => ({ p, i })).filter(({ p }) => p.fits && p.check.delivered !== 'no' && !ANNOUNCE.test(p.plaque + ' ' + p.speech))
    .sort((a, b) => Number(b.p.check.delivered === 'full') - Number(a.p.check.delivered === 'full') || b.p.src.famX - a.p.src.famX || b.p.src.ratio - a.p.src.ratio);
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
