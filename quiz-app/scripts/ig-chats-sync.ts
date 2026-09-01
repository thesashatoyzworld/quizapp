// Собрать ники из инста-директа руками.
//
//   npx tsx scripts/ig-chats-sync.ts [чатов, по умолчанию 400] [карточек за заход, 120]
//
// То же самое дважды в день делает крон /api/cron-ig-chats — сама работа
// живёт в src/lib/sales/chats-sync.ts, здесь только запуск. Скрипт нужен для
// первого наполнения и когда хочется догнать прямо сейчас.
//
// Зачем ники собираются заранее: список чатов ChatPlace отдаёт имя, но не ник.
// Ник лежит в карточке чата, а карточки под нагрузкой отвечают 429 — Cloudflare
// просит ждать по тридцать секунд. Поймали на живом, когда помощник искал
// человека прямо во время вопроса и молча никого не находил.
import { config } from 'dotenv';
config({ path: '.env.local' });

const chats = Number(process.argv[2] || 400);
const budget = Number(process.argv[3] || 120);

async function main() {
  // Импорт после чтения .env: prisma поднимает клиент прямо при импорте.
  const { syncIgChats } = await import('../src/lib/sales/chats-sync');

  const started = Date.now();
  const r = await syncIgChats({ chats, budget });

  console.log(
    [
      `посмотрели чатов: ${r.seen}`,
      `уже знали: ${r.known}`,
      `ников взяли из воронок даром: ${r.fromLeads}`,
      `запросили карточек: ${r.fetched}`,
      `получили ников: ${r.handles}`,
      `ошибок: ${r.failed}`,
      `всего ников в базе: ${r.total}`,
      `время: ${((Date.now() - started) / 1000).toFixed(0)} с`,
    ].join('\n'),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
