// Прогон сборки БЕЗ записи в базу и без отправки: видно, что модель собрала
// и в каком порядке. Нужен, когда меняешь промпт и хочешь проверить правило
// на живой анкете, не трогая карту человека (у открытой карты пересборка
// стёрла бы его галочки).
//
//   npx tsx scripts/roadmap-dry-run.ts <username|telegramId>
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const who = process.argv[2];
  const { findIntakeFor } = await import('../src/lib/roadmap/build');
  const { buildSource } = await import('../src/lib/roadmap/source');
  const { generateRoadmap } = await import('../src/lib/roadmap/generate');

  const intakeId = await findIntakeFor(who);
  if (!intakeId) throw new Error(`анкета ${who} не найдена`);

  const source = await buildSource(intakeId);
  const started = new Date();
  const until = new Date(started);
  until.setUTCMonth(until.getUTCMonth() + 1);

  const t0 = Date.now();
  const draft = await generateRoadmap(source, started, until);
  console.log(`модель: ${Math.round((Date.now() - t0) / 1000)} c\n`);

  console.log('ЦЕЛЬ МЕСЯЦА:', draft.periodGoal, '\n');
  // в готовом драфте недели уже превращены в дедлайны, группируем по ним
  const byWeek = new Map<string, string[]>();
  for (const t of draft.tasks) {
    const arr = byWeek.get(t.dueOn) || [];
    arr.push(`  ${t.owner === 'sasha' ? '[Саша] ' : ''}${t.title}${t.linkLabel ? `  → ${t.linkLabel}` : ''}`);
    byWeek.set(t.dueOn, arr);
  }
  [...byWeek.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([due, items], i) => {
      console.log(`НЕДЕЛЯ ${i + 1} (до ${due})`);
      items.forEach((x) => console.log(x));
      console.log('');
    });
}
main().then(() => process.exit(0));
