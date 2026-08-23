// Пересобрать текст предпросмотра по уже лежащей в базе карте, без модели.
// Запуск: npx tsx scripts/roadmap-preview-render.ts <slug>
import { config } from 'dotenv';
config({ path: '.env.local' });
import fs from 'node:fs';

const slug = process.argv[2];
if (!slug) { console.error('Usage: npx tsx scripts/roadmap-preview-render.ts <slug>'); process.exit(1); }

async function main() {
  const { prisma } = await import('../src/lib/prisma');
  const { previewMessages } = await import('../src/lib/roadmap/review');
  const roadmap = await prisma.roadmap.findUnique({ where: { slug }, select: { id: true } });
  if (!roadmap) throw new Error(`карты ${slug} нет`);
  const parts = await previewMessages(roadmap.id);
  const file = `roadmap-preview-${slug}.txt`;
  fs.writeFileSync(file, parts.map((p, i) => `=== СООБЩЕНИЕ ${i + 1} (${p.length} символов) ===\n${p}`).join('\n\n'), 'utf8');
  console.log(`${file}: сообщений ${parts.length}, длины ${parts.map((p) => p.length).join(', ')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
