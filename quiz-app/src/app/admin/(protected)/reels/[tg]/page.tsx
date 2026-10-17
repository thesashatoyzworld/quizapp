import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLichka, loadSpace } from '@/lib/reels/store';
import styles from '../reels.module.css';
import ReelsAdmin from './ReelsAdmin';

export const dynamic = 'force-dynamic';

export default async function ReelsClientPage({ params }: { params: Promise<{ tg: string }> }) {
  const { tg } = await params;
  if (!/^\d+$/.test(tg)) notFound();
  const telegramId = BigInt(tg);
  const [space, lichka] = await Promise.all([loadSpace(telegramId), isLichka(telegramId)]);

  return (
    <div className={styles.page}>
      <Link href="/admin/reels" className={styles.back}>‹ все клиенты</Link>
      <h1 className={styles.h1}>РОЛИКИ · {space.clientName || tg}</h1>
      <p className={styles.sub}>{space.igHandle ? `@${space.igHandle} · ` : ''}telegram {tg}</p>
      {!lichka && <p className={styles.warn}>не на личке сейчас: в кабинете клиент эту доску не увидит.</p>}
      <ReelsAdmin telegramId={tg} space={space} />
    </div>
  );
}
