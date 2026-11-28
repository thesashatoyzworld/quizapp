// 28.11 bench of the quick check (src/lib/optimizator/quick.ts) on saved student scripts, through the claude CLI on the
// subscription with output tokens priced (OPT_CLI_COST). Input tokens the CLI hides: estimated from prompt length.
// Run: env -u ANTHROPIC_API_KEY -u ANTHROPIC_AUTH_TOKEN OPT_VIA_CLI=1 OPT_CLI_COST=1 CLAUDE_BIN=~/.local/bin/claude \
//   npx tsx scripts/optimizator-quick-bench.ts <in.json [{code, script}]> <out.json>
import { config } from 'dotenv';
config({ path: '.env.local' });
import { readFileSync, writeFileSync } from 'node:fs';

async function main() {
  const [inp, outp] = process.argv.slice(2);
  const { quickCheck } = await import('../src/lib/optimizator/quick');
  const cases = JSON.parse(readFileSync(inp, 'utf8')) as { code: string; script: string }[];
  const out: Record<string, unknown> = {};
  const queue = [...cases];
  await Promise.all(Array.from({ length: 4 }, async () => {
    for (let c = queue.shift(); c; c = queue.shift()) {
      const t = Date.now();
      const q = await quickCheck(c.script).catch((e) => { console.error(c!.code, e); return null; });
      out[c.code] = { script: c.script, q, ms: Date.now() - t };
      console.error(`${c.code}: ${q ? `${q.shans.pct}% minus ${q.minus.length} add ${q.add.length}` : 'fail'}, ${Math.round((Date.now() - t) / 1000)} s`);
    }
  }));
  const cost = (globalThis as unknown as { __optCost?: Record<string, { calls: number; usd: number }> }).__optCost || {};
  const usd = Object.values(cost).reduce((s, v) => s + v.usd, 0);
  writeFileSync(outp, JSON.stringify({ cases: out, cost, outUsdPerCase: usd / Math.max(1, cases.length) }, null, 1));
  console.error('cost', JSON.stringify(cost), 'output usd per case', (usd / Math.max(1, cases.length)).toFixed(4));
  process.exit(0);
}
main();
