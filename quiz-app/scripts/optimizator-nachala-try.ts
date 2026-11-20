// Local check of «Начало из залётов» and the stats reader. Run: npx tsx scripts/optimizator-nachala-try.ts <script.txt> [screenshot ...]
import { config } from 'dotenv';
config({ path: '.env.local' });
import { readFileSync } from 'node:fs';

async function main() {
  const { buildNachala } = await import('../src/lib/optimizator/nachala');
  const { readScreens } = await import('../src/lib/optimizator/stats');
  const [scriptPath, ...shots] = process.argv.slice(2);
  if (shots.length) {
    const m = await readScreens(shots.map((p) => ({ mime: p.endsWith('.png') ? 'image/png' : 'image/jpeg', data: readFileSync(p) })));
    console.log('metrics', m);
  }
  if (scriptPath) {
    const n = await buildNachala(readFileSync(scriptPath, 'utf8'), 'lecture');
    console.log(JSON.stringify(n, null, 1));
  }
  process.exit(0);
}
main();
