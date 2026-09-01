// Спросить помощника про человека, не поднимая бота.
//
//   npx tsx scripts/sales-ask.ts who_is_ann
//
// Показывает найденную переписку и варианты ответа — то же самое, что потом
// увидит ассистент в телеграме.
import { config } from 'dotenv';
config({ path: '.env.local' });

// Модули тянем уже после чтения .env: prisma.ts поднимает клиент прямо при
// импорте и без DATABASE_URL падает, а обычные import подняты наверх файла.
const load = async () => ({
  ...(await import('../src/lib/sales/answer')),
  ...(await import('../src/lib/sales/lead')),
});

const handle = process.argv[2];
if (!handle) {
  console.error('Usage: npx tsx scripts/sales-ask.ts <ник>');
  process.exit(1);
}

async function main() {
  const { suggestReply, renderThread } = await load();
  const started = Date.now();
  const res = await suggestReply(handle);

  if (!res.found) {
    console.log(`не нашёл: ${handle}`);
    process.exit(1);
  }

  console.log(`\n=== ${res.who}${res.waiting ? ` · ждёт ${res.waiting}` : ''} ===\n`);
  console.log(renderThread(res.thread!.messages));

  console.log(`\n=== что написать (${res.variants.length}) ===`);
  for (const [i, v] of res.variants.entries()) {
    console.log(`\n--- вариант ${i + 1} ---`);
    console.log(v.text);
    console.log(`   ↳ ${v.why}`);
  }

  if (res.callSasha) console.log(`\n[ЗДЕСЬ НУЖЕН САША] ${res.callSasha}`);
  console.log(`\nвремя: ${((Date.now() - started) / 1000).toFixed(1)} с`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
