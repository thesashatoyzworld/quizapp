// Кто из анкет остался без расшифровок и добираются ли они.
//
//   npx tsx scripts/intake-transcripts-check.mts <username|telegramId>
//   npx tsx scripts/intake-transcripts-check.mts <username|telegramId> --fill
//   npx tsx scripts/intake-transcripts-check.mts --all
//
// Без --fill ничего не меняет: только показывает, что лежит в базе.
import { config } from 'dotenv';
config({ path: '.env.local' });

async function report(intakeId: string, who: string) {
  const { prisma } = await import('../src/lib/prisma');

  const answers = await prisma.intakeAnswer.findMany({
    where: { intakeId, kind: 'voice' },
    orderBy: { step: 'asc' },
    select: { step: true, transcript: true, transcriptStatus: true, durationSec: true },
  });

  const empty = answers.filter((a) => !a.transcript).length;
  console.log(`\n${who}: голосовых ${answers.length}, без текста ${empty}`);

  for (const a of answers) {
    const body = a.transcript ? `${a.transcript.length} символов` : 'ПУСТО';
    console.log(`  шаг ${a.step}: ${a.durationSec ?? '?'} c, ${body}, статус ${a.transcriptStatus ?? '-'}`);
  }
  return empty;
}

async function main() {
  const { prisma } = await import('../src/lib/prisma');

  if (process.argv.includes('--all')) {
    const intakes = await prisma.intake.findMany({
      orderBy: { invitedAt: 'desc' },
      select: { id: true, username: true, firstName: true, telegramId: true },
    });
    for (const i of intakes) {
      await report(i.id, i.username ? '@' + i.username : i.firstName || String(i.telegramId));
    }
    return;
  }

  const arg = process.argv[2];
  if (!arg) throw new Error('нужен username, telegram id или --all');

  const { findIntakeFor } = await import('../src/lib/roadmap/build');
  const intakeId = await findIntakeFor(arg);
  if (!intakeId) throw new Error(`анкета ${arg} не найдена`);

  await report(intakeId, arg);

  if (process.argv.includes('--fill')) {
    const { fillMissingTranscripts } = await import('../src/lib/roadmap/source');
    console.log('\nдобираю…');
    console.log(await fillMissingTranscripts(intakeId));
    await report(intakeId, arg + ' (после добора)');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
