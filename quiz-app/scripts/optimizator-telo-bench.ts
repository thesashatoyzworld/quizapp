// 23.11 experiment «довести до верхней ступени» (Sasha: «не хочется снимать ролик, который поднялся на 50%»).
// For each script: score the chance; if below the top band, rewrite only the fragments that pull it down (minus techniques)
// and add structural plus techniques without inventing facts, rescore, up to 3 rounds. Then a blind Opus judge compares
// the original and the rewrite (invented facts, author voice, which one to film).
// Run (subscription, no API): env -u ANTHROPIC_API_KEY -u ANTHROPIC_AUTH_TOKEN OPT_VIA_CLI=1 CLAUDE_BIN=~/.local/bin/claude \
//   npx tsx scripts/optimizator-telo-bench.ts <in.json> <out.json>     in: [{code, script}]
import { config } from 'dotenv';
config({ path: '.env.local' });
import { readFileSync, writeFileSync } from 'node:fs';

const TOP = 1.037; // score cut of the top band (shans-model.json cuts[3])
const ROUNDS = 3;
const REWRITE_MODEL = 'claude-opus-5-5';

// plus techniques a rewrite may add without new facts (structure and phrasing, not events or numbers)
const ADDABLE = new Set([
  'dsc:d21', 'dsc:d20', 'priemy:p04', 'priemy:p06', 'priemy:p14', 'g3:g3_11', 'priemy:p28', 'priemy:p31', 'priemy:p30',
  'priemy:p33', 'dsc:d25', 'priemy:p17', 'priemy:p34', 'g3:g3_19', 'g3:g3_02', 'priemy:p13', 'g3:g3_23', 'dsc:d35',
  'g3:g3_26', 'g3:g3_04', 'g3:g3_25', 'g3:g3_14', 'priemy:p20', 'priemy:p07', 'dsc:d28', 'priemy:p15',
]);

type F = { set: string; id: string; name: string; part: string; weight: number };

const text = (m: { content: { type: string; text?: string }[] }) => m.content.map((b) => (b.type === 'text' ? b.text || '' : '')).join('');

async function main() {
  const [inp, outp] = process.argv.slice(2);
  const { scoreShans } = await import('../src/lib/optimizator/shans');
  const { llm } = await import('../src/lib/optimizator/llm');
  const M = (await import('../src/lib/optimizator/data/shans-model.json')).default as unknown as { features: F[] };
  const byName = new Map(M.features.map((f) => [f.name, f]));
  const ai = llm();
  const cases = JSON.parse(readFileSync(inp, 'utf8')) as { code: string; script: string }[];

  const addList = M.features.filter((f) => ADDABLE.has(`${f.set}:${f.id}`)).sort((a, b) => b.weight - a.weight);

  async function rewrite(orig: string, cur: string, minus: string[], plus: string[], score: number): Promise<string> {
    const need = Math.max(0, TOP - score).toFixed(2);
    const prompt = `Ты редактор рилсов. Ниже сценарий автора. По базе из 4 700 рилсов мы знаем, какие приёмы в тексте мешают ролику залететь, а какие помогают.
Задача: поправить ТЕЛО сценария так, чтобы убрать то, что мешает, и добавить 1-3 помогающих приёма. Сейчас счёт ${score.toFixed(2)}, нужно добрать ещё ${need}.

ЖЁСТКИЕ ПРАВИЛА:
- Не выдумывай фактов, цифр, имён, историй, результатов, которых нет в исходнике. Можно переставлять, сокращать, переформулировать то, что есть.
- Голос автора: его слова, его обращение (ты/вы), его разговорный стиль. Меняй только нужные куски, остальное оставь дословно.
- Первые две фразы (начало ролика) не трогай.
- Не делай текст длиннее исходного больше чем на 15%.

МЕШАЕТ (есть в тексте, убери или переделай так, чтобы признака не осталось): ${minus.length ? minus.join('; ') : 'нет'}
УЖЕ ЕСТЬ (сохрани): ${plus.length ? plus.join('; ') : 'нет'}
МОЖНО ДОБАВИТЬ (по силе, бери то, что естественно ложится на этот материал): ${addList.filter((f) => !plus.includes(f.name)).map((f) => `${f.name} (+${f.weight.toFixed(2)}, ${f.part})`).join('; ')}

ИСХОДНИК АВТОРА:
${orig}
${cur !== orig ? `\nТЕКУЩАЯ ПРАВКА (продолжай от неё):\n${cur}\n` : ''}
Верни только новый сценарий целиком, без комментариев.`;
    const m = await ai.messages.create({ model: REWRITE_MODEL, max_tokens: 6000, messages: [{ role: 'user', content: prompt }] } as never);
    return text(m as never).trim();
  }

  async function judge(orig: string, fixed: string, code: string) {
    const flip = code.length % 2 === 0;
    const [A, B] = flip ? [fixed, orig] : [orig, fixed];
    const prompt = `Ты строгий редактор рилсов. Два варианта одного сценария одного автора. Ответь только JSON:
{"film": "A" или "B" (какой снимать, чтобы набрал больше), "invented": true/false (есть ли в одном из вариантов факты, цифры, истории, которых нет в другом), "invented_in": "A"|"B"|null, "voice": "A"|"B"|"равно" (какой звучит живее как устная речь автора), "why": "коротко"}

=== A
${A}

=== B
${B}`;
    const m = await ai.messages.create({ model: REWRITE_MODEL, max_tokens: 3000, messages: [{ role: 'user', content: prompt }] } as never);
    const t = text(m as never);
    try {
      const j = JSON.parse(t.match(/\{[\s\S]*\}/)![0]);
      const map = (x: string | null) => (x === 'A' ? (flip ? 'fixed' : 'orig') : x === 'B' ? (flip ? 'orig' : 'fixed') : x);
      return { film: map(j.film), invented: j.invented, invented_in: map(j.invented_in), voice: map(j.voice), why: j.why };
    } catch { return null; }
  }

  async function one(c: { code: string; script: string }) {
    const t0 = Date.now();
    const s0 = await scoreShans(c.script);
    if (!s0) return { code: c.code, error: 'score' };
    const rounds: { score: number; share: number; minus: string[]; plus: string[] }[] = [];
    let cur = c.script; let s = s0;
    if (s0.score < TOP) {
      for (let i = 0; i < ROUNDS && s.score < TOP; i++) {
        const next = await rewrite(c.script, cur, s.minus.map((x) => x.name), s.plus.map((x) => x.name), s.score).catch(() => '');
        if (!next) break;
        const sn = await scoreShans(next);
        if (!sn) break;
        rounds.push({ score: sn.score, share: sn.hitShare, minus: sn.minus.map((x) => x.name), plus: sn.plus.map((x) => x.name) });
        if (sn.score >= s.score) { cur = next; s = sn; }
      }
    }
    // the final text scored once more: one labelling is noisy, the band must hold
    const recheck = cur !== c.script ? await scoreShans(cur) : null;
    const j = cur !== c.script ? await judge(c.script, cur, c.code) : null;
    const r = {
      code: c.code, ms: Date.now() - t0,
      orig: { share: s0.hitShare, score: s0.score, minus: s0.minus.map((x) => x.name), plus: s0.plus.map((x) => x.name) },
      fixed: cur !== c.script ? { share: s.hitShare, score: s.score, recheck: recheck?.hitShare ?? null, minus: s.minus.map((x) => x.name), plus: s.plus.map((x) => x.name), text: cur } : null,
      rounds, judge: j,
      words: [c.script.split(/\s+/).length, cur.split(/\s+/).length],
    };
    console.log(`${c.code}: ${Math.round(s0.hitShare * 100)}% → ${Math.round(s.hitShare * 100)}% (recheck ${recheck ? Math.round(recheck.hitShare * 100) + '%' : '-'}), judge ${j ? `film ${j.film}, invented ${j.invented ? j.invented_in : 'no'}, voice ${j.voice}` : '-'}, ${Math.round(r.ms / 1000)} s`);
    return r;
  }

  const out: unknown[] = [];
  const queue = [...cases];
  await Promise.all(Array.from({ length: 4 }, async () => { for (let c; (c = queue.shift());) out.push(await one(c)); }));
  writeFileSync(outp, JSON.stringify(out, null, 1));
  void byName;
  process.exit(0);
}
main();
