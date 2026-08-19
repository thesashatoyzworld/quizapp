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

/** Сколько строк карты клиент видит в кабинете, по картам разом. */
async function sharedByRoadmap(): Promise<Map<string, number>> {
  const where = { visibility: 'shared' };
  const [steps, metrics, tasks, notes] = await Promise.all([
    prisma.roadmapStep.groupBy({ by: ['roadmapId'], where, _count: { _all: true } }),
    prisma.roadmapMetric.groupBy({ by: ['roadmapId'], where, _count: { _all: true } }),
    prisma.roadmapTask.groupBy({ by: ['roadmapId'], where, _count: { _all: true } }),
    prisma.roadmapNote.groupBy({ by: ['roadmapId'], where, _count: { _all: true } }),
  ]);
  const out = new Map<string, number>();
  for (const row of [...steps, ...metrics, ...tasks, ...notes]) {
    out.set(row.roadmapId, (out.get(row.roadmapId) ?? 0) + row._count._all);
  }
  return out;
}

export default async function RoadmapsPage() {
  const shared = await sharedByRoadmap();
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
        где каждый стоит, куда идёт и за кем сейчас ход. правки сохраняются сразу; что из этого видит клиент — строкой под именем
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
          const rows = shared.get(r.id) ?? 0;
          const money = r.paidAmount
            ? `${r.returned.toLocaleString('ru-RU')} из ${r.paidAmount.toLocaleString('ru-RU')} ₽`
            : '—';

          return (
            <Link key={r.id} href={`/admin/roadmaps/${r.slug}`} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.name}>{r.clientName}</span>
                <span className={styles.tier}>{r.tier ?? ''}</span>
              </div>

              {/* Видно ли карту человеку — отдельная строка, а не мелкая подпись:
                  открытая карта без единой открытой строки это пустой экран у клиента. */}
              <div className={styles.visLine}>
                {!r.clientVisible && <span className={styles.visOff}>у клиента её нет</span>}
                {r.clientVisible && rows > 0 && (
                  <span className={styles.visOn}>клиент видит {rows} строк</span>
                )}
                {r.clientVisible && rows === 0 && (
                  <span className={styles.visEmpty}>открыта, но клиент видит пустой экран</span>
                )}
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
