// Карта из готового JSON: черновик из файла проходит тот же assemble и saveDraft,
// что и автосборка.
//
// Нужен, когда карту собрала не модель, а человек: правки Саши по живой карте
// проще внести в JSON и залить, чем объяснять их модели заново. Форма файла та
// же, что возвращает модель (см. Draft в lib/roadmap/generate.ts).
//
// npx tsx scripts/roadmap-save-json.ts <username|telegramId> <draft.json>
import { config } from 'dotenv';
config({ path: '.env.local' });

import fs from 'node:fs';

async function main() {
  const [arg, draftPath] = process.argv.slice(2);

  const { findIntakeFor } = await import('../src/lib/roadmap/build');
  const { buildSource } = await import('../src/lib/roadmap/source');
  const { assemble } = await import('../src/lib/roadmap/generate');
  const { saveDraft, slugFor } = await import('../src/lib/roadmap/store');
  const { previewMessages } = await import('../src/lib/roadmap/review');
  const { getActiveAccessByTelegram } = await import('../src/lib/access');
  const { prisma } = await import('../src/lib/prisma');

  const intakeId = await findIntakeFor(arg);
  if (!intakeId) throw new Error('анкета не найдена');

  const source = await buildSource(intakeId);
  const raw = JSON.parse(fs.readFileSync(draftPath, 'utf8'));

  // Окно доступа берём из реальной выдачи, как это делает build.ts
  const access = source.telegramId ? await getActiveAccessByTelegram(source.telegramId) : [];
  const uroven = access.find((r: { productSlug: string }) => r.productSlug.startsWith('uroven-'));
  const startedAt = uroven?.grantedAt ?? new Date();
  const accessUntil = uroven?.expiresAt ?? new Date();
  console.log('доступ:', uroven?.productSlug, startedAt.toISOString().slice(0, 10), '→', accessUntil.toISOString().slice(0, 10));

  const assembled = assemble(raw, source, startedAt);
  // Собрано руками, поэтому ни транспорта, ни токенов за этим нет.
  const draft = { ...assembled, backend: 'cli' as const, usage: { input: 0, output: 0 } };

  const slug = slugFor(source.username, source.telegramId, intakeId);
  const roadmapId = await saveDraft(draft, {
    slug,
    clientName: source.firstName || source.username || slug,
    telegramId: source.telegramId,
    username: source.username,
    startedAt,
    accessUntil,
  });

  // saveDraft прибивает тариф к t2 за 10 000, хотя карта собирается и людям
  // с другим доступом. Ставим реальный слаг доступа; сумму можно передать
  // третьим аргументом, иначе оставляем как есть.
  const paid = Number(process.argv[4] || 0);
  await prisma.roadmap.update({
    where: { id: roadmapId },
    data: {
      tier: uroven?.productSlug ?? 'uroven-t2',
      ...(paid > 0 ? { paidAmount: paid } : {}),
    },
  });

  console.log(`карта ${slug} (${roadmapId}) записана, закрыта от клиента`);
  if (draft.warnings.length) {
    console.log('предупреждения:');
    for (const w of draft.warnings) console.log(' -', w);
  } else {
    console.log('предупреждений нет');
  }

  const parts = await previewMessages(roadmapId);
  const file = `roadmap-preview-${slug}.txt`;
  fs.writeFileSync(file, parts.join('\n\n————————————————\n\n'), 'utf8');
  console.log('предпросмотр:', file);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
