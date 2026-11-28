// 28.11 cost bench: the bundles + body edit exactly as the nachala route builds them, on saved student runs, through the
// claude CLI on the subscription, with the API price of every call summed (OPT_CLI_COST). Compare OPT_CHEAP=0 vs 1, then
// judge the openings blind with GSD-BRAND clients/sasha/optimizator-zamer/judge_bundles.py.
// Run: env -u ANTHROPIC_API_KEY -u ANTHROPIC_AUTH_TOKEN OPT_VIA_CLI=1 OPT_CLI_COST=1 OPT_CHEAP=1 CLAUDE_BIN=~/.local/bin/claude \
//   npx tsx scripts/optimizator-cost-bench.ts <in.json [{code, tg, script}]> <out.json>
import { config } from 'dotenv';
config({ path: '.env.local' });
import { readFileSync, writeFileSync } from 'node:fs';

type Res = { format?: { type?: never }; viewer_reasons?: { stop?: never }; rewrite?: { script?: string }; shans?: { hitShare?: number } };

async function main() {
  const [inp, outp] = process.argv.slice(2);
  const { prisma } = await import('../src/lib/prisma');
  const { buildNachala } = await import('../src/lib/optimizator/nachala');
  const { buildTelo } = await import('../src/lib/optimizator/telo');
  const cases = JSON.parse(readFileSync(inp, 'utf8')) as { code: string; tg?: string; script: string }[];
  const out: Record<string, unknown> = {};
  const t0 = Date.now();

  async function one(c: { code: string; tg?: string; script: string }) {
    const run = await prisma.optimizatorRun.findUnique({ where: { id: c.code }, select: { script: true, result: true, telegramId: true } });
    if (!run?.result) { console.error('no run', c.code); return; }
    const res = run.result as unknown as Res;
    const ig = await prisma.$queryRaw<{ ig: string }[]>`SELECT ig FROM optimizator_ig WHERE telegram_id = ${run.telegramId} LIMIT 1`.catch(() => []);
    const ownAuthor = ig[0]?.ig || undefined;
    const t = Date.now();
    const n = await buildNachala(run.script, res.format?.type, { stop: res.viewer_reasons?.stop, rewrite: res.rewrite?.script, ownAuthor });
    const own = res.shans?.hitShare;
    const cands = [...n.picks.filter((p) => p.editor?.usable !== false).map((p) => ({ text: p.text, share: p.shans?.hitShare, speech: p.speech })),
      ...(n.fallback?.versions || []).filter((v) => v.kind !== 'own').map((v) => ({ text: v.text, share: v.shans?.hitShare, speech: v.speech }))]
      .filter((x) => x.text && typeof x.share === 'number' && (own === undefined || x.share! >= own))
      .sort((a, b) => b.share! - a.share!);
    const base = cands[0];
    const telo = await buildTelo(base?.text || run.script, base?.share ?? own ?? 0);
    out[c.code] = {
      picks: n.picks.map((p) => ({ plaque: p.plaque, speech: p.speech, own: p.src.own, usable: p.editor?.usable, share: p.shans?.hitShare })),
      fallback: (n.fallback?.versions || []).filter((v) => v.kind !== 'own').map((v) => ({ kind: v.kind, plaque: v.plaque, speech: v.speech, share: v.shans?.hitShare })),
      own, telo: telo ? { before: telo.before, share: telo.share, top: telo.top, note: telo.note, text: telo.text } : null,
      ms: Date.now() - t,
    };
    console.error(`${c.code}: ${n.picks.length} picks, telo ${telo ? `${Math.round(telo.before * 100)}→${Math.round(telo.share * 100)}` : '-'}, ${Math.round((Date.now() - t) / 1000)} s`);
  }

  const queue = [...cases];
  await Promise.all(Array.from({ length: 4 }, async () => { for (let c = queue.shift(); c; c = queue.shift()) await one(c).catch((e) => console.error(c!.code, e)); }));
  const cost = (globalThis as unknown as { __optCost?: Record<string, { calls: number; usd: number }> }).__optCost || {};
  const usd = Object.values(cost).reduce((s, v) => s + v.usd, 0);
  writeFileSync(outp, JSON.stringify({ cases: out, cost, usdPerCase: usd / Math.max(1, Object.keys(out).length), minutes: (Date.now() - t0) / 60000 }, null, 1));
  console.error('cost', JSON.stringify(cost), 'per case', (usd / Math.max(1, Object.keys(out).length)).toFixed(3));
  process.exit(0);
}
main();
