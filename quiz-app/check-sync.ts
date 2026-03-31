import { PrismaClient } from './src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: 'postgresql://postgres.dprrznvwumvockukdbvw:Kozlova14041972%21@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres' });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const rows = await prisma.syncWaitlist.findMany({ orderBy: { createdAt: 'desc' } });

  if (rows.length === 0) {
    console.log('Таблица sync_waitlist пуста');
  } else {
    console.log(`Найдено записей: ${rows.length}\n`);
    for (const r of rows) {
      console.log(`#${r.id} | TG: ${r.telegramId} | @${r.username || '-'} | ${r.firstName || '-'} | ${r.tier.toUpperCase()} | ${r.createdAt.toISOString()}`);
    }
  }

  process.exit(0);
}

main();
