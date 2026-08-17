import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from './roadmap.module.css';

export const dynamic = 'force-dynamic';

const STEP_LABEL: Record<string, string> = {
  done: 'пройден',
  partial: 'частично',
  blocked: 'стоим',
  todo: 'впереди',
};

function ru(d: Date | null) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' }).format(d);
}

function daysLeft(until: Date | null) {
  if (!until) return null;
  return Math.ceil((until.getTime() - Date.now()) / 86_400_000);
}

export default async function RoadmapsPage() {
  const roadmaps = await prisma.roadmap.findMany({
    where: { archived: false },
    orderBy: { clientName: 'asc' },
    include: {
      steps: { orderBy: { position: 'asc' } },
      tasks: { where: { status: { in: ['todo', 'doing'] } }, orderBy: [{ dueOn: 'asc' }, { position: 'asc' }] },
      metrics: { orderBy: { position: 'asc' } },
    },
  });

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>МАРШРУТНЫЕ КАРТЫ</h1>
      <p className={styles.sub}>
        где каждый стоит, куда идёт и за кем сейчас ход. правки сохраняются сразу, клиенты этого пока не видят
      </p>

      {roadmaps.length === 0 && (
        <p className={styles.empty}>
          карт пока нет. залить первую: <code>node scripts/roadmap-import.mjs azamat-gimaev</code>
        </p>
      )}

      <div className={styles.cards}>
        {roadmaps.map((r) => {
          // Стоим на первой ступени, которая ещё не пройдена.
          const current = r.steps.find((s) => s.status === 'blocked')
            ?? r.steps.find((s) => s.status !== 'done')
            ?? null;
          const next = r.tasks[0] ?? null;
          const left = daysLeft(r.accessUntil);
          const money = r.paidAmount
            ? `${r.returned.toLocaleString('ru-RU')} из ${r.paidAmount.toLocaleString('ru-RU')} ₽`
            : '—';

          return (
            <Link key={r.id} href={`/admin/roadmaps/${r.slug}`} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.name}>{r.clientName}</span>
                <span className={styles.tier}>{r.tier ?? ''}</span>
              </div>

              <div className={styles.stepLine}>
                <span className={`${styles.dot} ${styles[current?.status ?? 'todo']}`} />
                <span className={styles.stepTitle}>
                  {current ? `${current.position}. ${current.title}` : 'вся лестница пройдена'}
                </span>
                {current && <span className={styles.stepState}>{STEP_LABEL[current.status]}</span>}
              </div>

              <div className={styles.rows}>
                <div className={styles.row}>
                  <span className={styles.k}>следующий шаг</span>
                  <span className={styles.v}>{next ? next.title : 'не назначен'}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.k}>за кем ход</span>
                  <span className={styles.v}>
                    {next ? (next.owner === 'sasha' ? 'за тобой' : 'за клиентом') : '—'}
                    {next?.dueOn ? ` · до ${ru(next.dueOn)}` : ''}
                  </span>
                </div>
                <div className={styles.row}>
                  <span className={styles.k}>вернул</span>
                  <span className={styles.v}>{money}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.k}>доступ</span>
                  <span className={left !== null && left < 30 ? styles.vWarn : styles.v}>
                    {r.accessUntil ? `до ${ru(r.accessUntil)}${left !== null ? ` · ${left} дн.` : ''}` : '—'}
                  </span>
                </div>
                <div className={styles.row}>
                  <span className={styles.k}>последнее касание</span>
                  <span className={styles.v}>{ru(r.lastTouchAt)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
