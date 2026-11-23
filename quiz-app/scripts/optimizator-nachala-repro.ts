// 21.11 offline check without filming: base reels where the AUTHOR copied a template hit of the same topic close to its words
// (reels-optimizer baza/copies/repro_in.json, 67% of such copies are hits). The copied opening is cut off, the generator gets the
// body and a pool of 60 same-topic template hits with the author's real donor hidden among them.
//   OPT_VIA_CLI=1 npx tsx scripts/optimizator-nachala-repro.ts <repro_in.json> <repro_out.json> [workers]
import { config } from 'dotenv';
config({ path: '.env.local' });
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

async function main() {
  const { buildNachala } = await import('../src/lib/optimizator/nachala');
  const [inp, outp, w] = process.argv.slice(2);
  const rows = JSON.parse(readFileSync(inp, 'utf8')) as { code: string; topic: string; script: string; pool: never[] }[];
  const done: Record<string, unknown> = existsSync(outp) ? JSON.parse(readFileSync(outp, 'utf8')) : {};
  const todo = rows.filter((r) => !done[r.code]);
  let k = 0;
  async function worker() {
    while (k < todo.length) {
      const r = todo[k++];
      try {
        const n = await buildNachala(r.script, undefined, { topic: r.topic, pool: r.pool });
        done[r.code] = { best: n.best, picks: n.picks.map((p) => ({ plaque: p.plaque, speech: p.speech, d: p.check.delivered, overlap: p.overlap, src: p.src.code })) };
      } catch (e) { done[r.code] = { error: String((e as Error).message).slice(0, 200) }; }
      writeFileSync(outp, JSON.stringify(done, null, 1));
      console.log(Object.keys(done).length, '/', rows.length);
    }
  }
  await Promise.all(Array.from({ length: Number(w) || 6 }, worker));
  process.exit(0);
}
main();
