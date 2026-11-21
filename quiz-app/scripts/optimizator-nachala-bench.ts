// Level 1 bench of «Начало из залётов» on base reels with known outcome (reels-optimizer baza/bench.py makes the input and the report).
// The tested reel's author is excluded from the bank pool; topic comes from the base label. Model calls go through the claude CLI:
//   OPT_VIA_CLI=1 npx tsx scripts/optimizator-nachala-bench.ts <bench_in.json> <bench_out.json> [workers]
import { config } from 'dotenv';
config({ path: '.env.local' });
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

async function main() {
  const { buildNachala } = await import('../src/lib/optimizator/nachala');
  const [inp, outp, w] = process.argv.slice(2);
  const rows = JSON.parse(readFileSync(inp, 'utf8')) as { code: string; author: string; topic: string | null; script: string }[];
  const done: Record<string, unknown> = existsSync(outp) ? JSON.parse(readFileSync(outp, 'utf8')) : {};
  const todo = rows.filter((r) => !done[r.code]);
  let k = 0;
  async function worker() {
    while (k < todo.length) {
      const r = todo[k++];
      try {
        const n = await buildNachala(r.script, undefined, { topic: r.topic, excludeAuthor: r.author });
        done[r.code] = { payoff: n.payoff, orig: n.orig, best: n.best, empty: !!n.empty, ms: n.ms, fallback: n.fallback,
          picks: n.picks.map((p) => ({ plaque: p.plaque, speech: p.speech, d: p.check.delivered, fits: p.fits, overlap: p.overlap, bodyGap: p.bodyGap, fam: p.src.famName, x: p.src.famX, src: p.src.code })) };
      } catch (e) { done[r.code] = { error: String((e as Error).message).slice(0, 200) }; }
      writeFileSync(outp, JSON.stringify(done, null, 1));
      console.log(Object.keys(done).length, '/', rows.length);
    }
  }
  await Promise.all(Array.from({ length: Number(w) || 6 }, worker));
  process.exit(0);
}
main();
