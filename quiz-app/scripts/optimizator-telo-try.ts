// Local check of the body edit on a saved run, exactly as the nachala route does it, without saving.
// Run: env -u ANTHROPIC_API_KEY -u ANTHROPIC_AUTH_TOKEN OPT_VIA_CLI=1 CLAUDE_BIN=~/.local/bin/claude npx tsx scripts/optimizator-telo-try.ts <runId>
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const { prisma } = await import('../src/lib/prisma');
  const { buildNachala } = await import('../src/lib/optimizator/nachala');
  const { buildTelo } = await import('../src/lib/optimizator/telo');
  const run = await prisma.optimizatorRun.findUnique({ where: { id: process.argv[2] }, select: { script: true, result: true } });
  const res = run!.result as unknown as { format?: { type?: never }; viewer_reasons?: { stop?: never }; rewrite?: { script?: string }; shans?: { hitShare?: number } };
  const t0 = Date.now();
  const n = await buildNachala(run!.script, res.format?.type, { stop: res.viewer_reasons?.stop, rewrite: res.rewrite?.script });
  const own = res.shans?.hitShare;
  const cands = [...n.picks.filter((p) => p.editor?.usable !== false).map((p) => ({ text: p.text, share: p.shans?.hitShare, speech: p.speech })),
    ...(n.fallback?.versions || []).filter((v) => v.kind !== 'own').map((v) => ({ text: v.text, share: v.shans?.hitShare, speech: v.speech }))]
    .filter((c) => c.text && typeof c.share === 'number' && (own === undefined || c.share! >= own)).sort((a, b) => b.share! - a.share!);
  console.log('own', own, 'bundles', n.picks.map((p) => [p.shans?.hitShare, p.editor?.usable, p.speech]));
  const t1 = Date.now();
  const telo = await buildTelo(cands[0]?.text || run!.script, cands[0]?.share ?? own ?? 0);
  console.log(JSON.stringify(telo, null, 1), `nachala ${Math.round((t1 - t0) / 1000)} s, telo ${Math.round((Date.now() - t1) / 1000)} s`);
  process.exit(0);
}
main();
