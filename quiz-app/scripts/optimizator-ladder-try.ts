// Run the ladder on one script without the cabinet: prints the place, the references
// and the token usage. Paid: two Opus calls, plus HikerAPI + Scribe on the first own
// run per username per week. HIKERAPI_KEY may come from the shell env.
//
//   npx tsx scripts/optimizator-ladder-try.ts <script.txt> [instagram username]
import { config } from 'dotenv';
config({ path: '.env.local' });
import { readFileSync } from 'node:fs';

const load = async () => ({
  ...(await import('../src/lib/optimizator/ladder')),
  ...(await import('../src/lib/optimizator/demand')),
});

const [file, username] = process.argv.slice(2);
if (!file) {
  console.error('Usage: npx tsx scripts/optimizator-ladder-try.ts <script.txt> [username]');
  process.exit(1);
}
async function main() {
const { runLadder, scriptPhrases } = await load();
const script = readFileSync(file, 'utf8').trim();
const phrases = scriptPhrases(script);
phrases.then((p) => console.log('phrases:', p.join(' | ')), () => console.log('phrases: failed'));
const l = await runLadder({ script, username: username ? username.replace(/^@/, '').toLowerCase() : null, phrases });
if (!l) {
  console.log('ladder: null');
  process.exit(0);
}
console.log(`${l.kind}: сильнее ${l.wins} из ${l.total}, score ${l.score}, confident ${l.confident}`);
for (const r of l.refs) {
  const out = r.plays !== null ? `${r.outcome} ${r.plays} plays ×${r.ratio}` : `${r.outcome} ×${r.ratio}`;
  console.log(`  ${r.won ? 'WIN ' : 'lose'} ${String(r.margin).padStart(4)}  ${out}  «${r.label}»`);
}
const u = l.usage;
const cost = (u.input * 4 + u.output * 20 + u.cacheRead * 0.2 + u.cacheWrite * 5) / 1e6;
console.log(`usage: in ${u.input} out ${u.output} cache read ${u.cacheRead} write ${u.cacheWrite}, $${cost.toFixed(3)}, ${Math.round(u.ms / 1000)} s`);
process.exit(0);
}

main();
