import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from '../roadmap.module.css';
import RoadmapBoard from './RoadmapBoard';

export const dynamic = 'force-dynamic';

function iso(d: Date | null) {
  return d ? d.toISOString() : null;
}

function ru(d: Date | null) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(d);
}

export default async function RoadmapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const r = await prisma.roadmap.findUnique({
    where: { slug },
    include: {
      metrics: { orderBy: { position: 'asc' } },
      steps: { orderBy: { position: 'asc' } },
      tasks: { orderBy: [{ status: 'asc' }, { dueOn: 'asc' }, { position: 'asc' }] },
      notes: { orderBy: [{ happenedOn: 'desc' }, { createdAt: 'desc' }] },
    },
  });

  if (!r) notFound();

  const left = r.accessUntil
    ? Math.ceil((r.accessUntil.getTime() - Date.now()) / 86_400_000)
    : null;

  // BigInt и Date в клиентский компонент не уезжают: отдаём примитивы.
  const board = {
    id: r.id,
    goal: r.goal ?? '',
    periodGoal: r.periodGoal ?? '',
    returned: r.returned,
    metrics: r.metrics.map((m) => ({
      id: m.id,
      key: m.key,
      label: m.label,
      startValue: m.startValue ?? '',
      currentValue: m.currentValue ?? '',
      unit: m.unit ?? '',
    })),
    steps: r.steps.map((s) => ({
      id: s.id,
      position: s.position,
      title: s.title,
      status: s.status,
      evidence: s.evidence ?? '',
    })),
    tasks: r.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      why: t.why ?? '',
      owner: t.owner,
      status: t.status,
      dueOn: t.dueOn ? t.dueOn.toISOString().slice(0, 10) : '',
    })),
    notes: r.notes.map((n) => ({
      id: n.id,
      kind: n.kind,
      body: n.body,
      source: n.source ?? '',
      happenedOn: n.happenedOn ? n.happenedOn.toISOString().slice(0, 10) : '',
    })),
  };

  return (
    <div className={styles.page}>
      <Link href="/admin/roadmaps" className={styles.back}>← все карты</Link>

      <div className={styles.head}>
        <h1 className={styles.h1}>{r.clientName.toUpperCase()}</h1>
      </div>

      <div className={styles.headMeta}>
        <span>тариф <b>{r.tier ?? '—'}</b></span>
        {r.username && <span>телеграм <b>@{r.username}</b></span>}
        <span>старт <b>{ru(r.startedAt)}</b></span>
        <span>
          доступ до <b>{ru(r.accessUntil)}</b>
          {left !== null && ` · ${left} дн.`}
        </span>
        <span>
          вернул <b>
            {r.returned.toLocaleString('ru-RU')}
            {r.paidAmount ? ` из ${r.paidAmount.toLocaleString('ru-RU')}` : ''} ₽
          </b>
        </span>
        {iso(r.lastTouchAt) && <span>касание <b>{ru(r.lastTouchAt)}</b></span>}
      </div>

      <RoadmapBoard data={board} />
    </div>
  );
}
