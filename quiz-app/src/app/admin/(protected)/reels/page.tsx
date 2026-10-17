import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { lichkaClients } from '@/lib/reels/store';
import styles from './reels.module.css';

export const dynamic = 'force-dynamic';

// Все на личке и сколько у каждого роликов на каком этапе.
export default async function ReelsListPage() {
  const clients = await lichkaClients();
  const ids = clients.map((c) => BigInt(c.telegramId));
  const [stages, briefs] = await Promise.all([
    prisma.reelVersion.groupBy({ by: ['telegramId', 'stage'], where: { telegramId: { in: ids } }, _count: { _all: true } }),
    prisma.reelBrief.groupBy({ by: ['telegramId'], where: { telegramId: { in: ids } }, _count: { _all: true } }),
  ]);
  const count = (tg: string, stage: string) =>
    stages.find((s) => String(s.telegramId) === tg && s.stage === stage)?._count._all ?? 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>РОЛИКИ</h1>
      <p className={styles.sub}>
        клиенты лички: ТЗ монтажёру, монтаж, расписание и выложенное. клиент видит свою доску в кабинете, раздел «Ролики» появляется, как только здесь есть хоть одно ТЗ или версия
      </p>
      {clients.length === 0 && <p className={styles.sub}>на личке сейчас никого.</p>}
      <div className={styles.cards}>
        {clients.map((c) => {
          const b = briefs.find((x) => String(x.telegramId) === c.telegramId)?._count._all ?? 0;
          return (
            <Link key={c.telegramId} href={`/admin/reels/${c.telegramId}`} className={styles.card}>
              <div className={styles.cardName}>{c.name}</div>
              <div className={styles.cardMeta}>
                {b || count(c.telegramId, 'tz') || count(c.telegramId, 'done') || count(c.telegramId, 'up')
                  ? `ТЗ ${b} · в ТЗ ${count(c.telegramId, 'tz')} · смонт. ${count(c.telegramId, 'done')} · выложено ${count(c.telegramId, 'up')}`
                  : 'доска не заведена'}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
