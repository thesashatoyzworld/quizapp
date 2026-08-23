// Прогон сборки карты без записи в базу: посмотреть глазами, что выходит.
//
// Запуск: npx tsx scripts/roadmap-preview.ts <username|intakeId> [файл.json]
//
// Ничего не пишет в таблицы карт и никому не отправляет. Результат кладётся
// в файл, чтобы сравнить с картой, собранной руками.
import { config } from 'dotenv';
config({ path: '.env.local' });

import fs from 'node:fs';

// Модули приложения подгружаются внутри main(), уже после config():
// prisma читает DATABASE_URL в момент загрузки модуля, а статический import
// поднимается выше всего остального.

const arg = process.argv[2];
const out = process.argv[3] || 'roadmap-preview.json';

if (!arg) {
  console.error('Usage: npx tsx scripts/roadmap-preview.ts <username|intakeId> [out.json]');
  process.exit(1);
}

async function findIntake(prisma: PrismaLike, needle: string) {
  if (/^[0-9a-f-]{36}$/i.test(needle)) {
    return prisma.intake.findUnique({ where: { id: needle } });
  }
  const clean = needle.replace(/^@/, '');
  return prisma.intake.findFirst({
    where: { username: { equals: clean, mode: 'insensitive' } },
    orderBy: { createdAt: 'desc' },
  });
}

type PrismaLike = typeof import('../src/lib/prisma')['prisma'];

async function main() {
  const { prisma } = await import('../src/lib/prisma');
  const { buildSource } = await import('../src/lib/roadmap/source');
  const { generateRoadmap } = await import('../src/lib/roadmap/generate');

  const intake = await findIntake(prisma, arg);
  if (!intake) throw new Error(`анкета ${arg} не найдена`);

  console.log(`анкета ${intake.id}: ${intake.username || intake.firstName}, трек ${intake.track}, статус ${intake.status}`);

  const source = await buildSource(intake.id);
  console.log(`анкета ${source.transcript.length} символов, материалов открыто ${source.entries.length}`);

  const started = new Date();
  const until = new Date(started);
  until.setUTCMonth(until.getUTCMonth() + 1);

  const t0 = Date.now();
  const draft = await generateRoadmap(source, started, until);
  console.log(`собрано за ${Math.round((Date.now() - t0) / 1000)} c, токенов ${draft.usage.input} на вход, ${draft.usage.output} на выход`);

  fs.writeFileSync(out, JSON.stringify(draft, null, 2), 'utf8');
  console.log(`\n${out}`);
  console.log(`ступеней ${draft.steps.length}, задач ${draft.tasks.length}, заметок ${draft.notes.length}`);
  if (draft.warnings.length) {
    console.log('\nпредупреждения:');
    for (const w of draft.warnings) console.log(` - ${w}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
