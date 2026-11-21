// Local check of «Шанс на залёт». Run: npx tsx scripts/optimizator-shans-try.ts <script.txt>
import { config } from 'dotenv';
config({ path: '.env.local' });
import { readFileSync } from 'node:fs';

async function main() {
  const { scoreShans } = await import('../src/lib/optimizator/shans');
  const t0 = Date.now();
  const s = await scoreShans(readFileSync(process.argv[2], 'utf8'));
  console.log(JSON.stringify(s, null, 1), Math.round((Date.now() - t0) / 1000) + ' s');
  process.exit(0);
}
main();
