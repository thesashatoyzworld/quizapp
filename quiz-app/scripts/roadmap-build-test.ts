// Прогон всего цикла кроме отправки: анкета → модель → база → текст предпросмотра.
//
// Запуск: npx tsx scripts/roadmap-build-test.ts <username|telegramId> [--send]
//
// Без --send ничего никуда не уходит: карта ложится в базу закрытой, а те же
// сообщения, что ушли бы Саше, печатаются в файл roadmap-preview-<slug>.txt.
import { config } from 'dotenv';
config({ path: '.env.local' });

import fs from 'node:fs';

const arg = process.argv[2];
const send = process.argv.includes('--send');

if (!arg) {
  console.error('Usage: npx tsx scripts/roadmap-build-test.ts <username|telegramId> [--send]');
  process.exit(1);
}

async function main() {
  const { findIntakeFor, buildRoadmap } = await import('../src/lib/roadmap/build');
  const { buildSource } = await import('../src/lib/roadmap/source');
  const { generateRoadmap } = await import('../src/lib/roadmap/generate');
  const { saveDraft, slugFor } = await import('../src/lib/roadmap/store');
  const { previewMessages } = await import('../src/lib/roadmap/review');

  const intakeId = await findIntakeFor(arg);
  if (!intakeId) throw new Error(`анкета ${arg} не найдена`);

  if (send) {
    const result = await buildRoadmap(intakeId);
    console.log(`карта ${result.slug} собрана, предпросмотр ${result.previewSent ? 'отправлен' : 'НЕ отправлен'}`);
    return;
  }

  const source = await buildSource(intakeId);
  const started = new Date();
  const until = new Date(started);
  until.setUTCMonth(until.getUTCMonth() + 1);

  const t0 = Date.now();
  const draft = await generateRoadmap(source, started, until);
  console.log(`модель отработала за ${Math.round((Date.now() - t0) / 1000)} c`);

  const slug = slugFor(source.username, source.telegramId, intakeId);
  const roadmapId = await saveDraft(draft, {
    slug,
    clientName: source.firstName || source.username || slug,
    telegramId: source.telegramId,
    username: source.username,
    startedAt: started,
    accessUntil: until,
  });
  console.log(`карта записана: ${slug} (${roadmapId}), закрыта от клиента`);

  const parts = await previewMessages(roadmapId);
  const file = `roadmap-preview-${slug}.txt`;
  fs.writeFileSync(file, parts.join('\n\n————————————————\n\n'), 'utf8');

  console.log(`\n${file}`);
  parts.forEach((p, i) => console.log(`сообщение ${i + 1}: ${p.length} символов`));
  if (draft.warnings.length) {
    console.log('\nпредупреждения:');
    for (const w of draft.warnings) console.log(` - ${w}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
