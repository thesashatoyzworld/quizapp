// Evaluate «Начало» v2 on reels with known outcome. Run: npx tsx scripts/optimizator-nachala-eval.ts <in.json> <out.json>
// in: [{code, views, skip, script}]; no analysis run here, so the «already stops» rule sees no stop score.
import { config } from 'dotenv';
config({ path: '.env.local' });
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

async function main() {
  const { buildNachala } = await import('../src/lib/optimizator/nachala');
  const [inp, outp] = process.argv.slice(2);
  const rows = JSON.parse(readFileSync(inp, 'utf8')) as { code: string; views: number; skip: number; script: string }[];
  const done: Record<string, unknown> = existsSync(outp) ? JSON.parse(readFileSync(outp, 'utf8')) : {};
  const todo = rows.filter((r) => !done[r.code]);
  let k = 0;
  async function worker() {
    while (k < todo.length) {
      const r = todo[k++];
      try {
        const n = await buildNachala(r.script, undefined, {});
        done[r.code] = { views: r.views, skip: r.skip, payoff: n.payoff, orig: n.orig, best: n.best, picks: n.picks.map((p) => ({ plaque: p.plaque, speech: p.speech, d: p.check.delivered, fits: p.fits, fam: p.src.famName, x: p.src.famX })), topic: n.topic, empty: !!n.empty };
      } catch (e) { done[r.code] = { error: String((e as Error).message).slice(0, 200), views: r.views }; }
      writeFileSync(outp, JSON.stringify(done, null, 1));
      console.log(Object.keys(done).length, '/', rows.length);
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  process.exit(0);
}
main();
