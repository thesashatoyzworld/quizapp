import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import RoadmapView, { ROADMAP_VIEW_CSS, type RoadmapCard } from '@/components/RoadmapView';
import { currentStepPosition } from '@/lib/roadmap';

export const dynamic = 'force-dynamic';

// Предпросмотр карты глазами клиента. Тот же компонент, что и в кабинете,
// но без гейта по telegram id — иначе Саша под своим аккаунтом увидел бы
// свою карту, а не карту клиента.
//
//   ?mode=now      — что человек видит прямо сейчас (только shared-строки)
//   ?mode=defaults — что он увидит, если нажать «открыть базовый набор»
//
// Галочки в предпросмотре не жмутся: это чужие задачи.

const M = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function ru(date: Date | null): string {
  if (!date) return '';
  return `${date.getDate()} ${M[date.getMonth()]}`;
}

export default async function RoadmapPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { slug } = await params;
  const { mode } = await searchParams;
  const defaults = mode !== 'now';

  const r = await prisma.roadmap.findUnique({
    where: { slug },
    include: {
      metrics: { orderBy: { position: 'asc' } },
      steps: { orderBy: { position: 'asc' } },
      tasks: { orderBy: { position: 'asc' } },
      notes: { orderBy: [{ happenedOn: 'desc' }, { createdAt: 'desc' }] },
    },
  });

  if (!r) notFound();

  // Базовый набор повторяет share-defaults в /api/admin/roadmap: путь, цифры
  // кроме возврата денег, и задачи клиента. Держать эти два места в согласии
  // важнее, чем сэкономить строчку.
  const shared = (v: string) => v === 'shared';
  const metrics = r.metrics.filter((m) => (defaults ? m.key !== 'revenue' : shared(m.visibility)));
  const steps = r.steps.filter((s) => (defaults ? true : shared(s.visibility)));
  const tasks = r.tasks.filter((t) => (defaults ? t.owner === 'client' : shared(t.visibility)));
  const notes = r.notes.filter((n) => shared(n.visibility));

  const card: RoadmapCard = {
    clientName: r.clientName,
    intro: r.clientIntro ?? '',
    goal: r.goal ?? '',
    periodGoal: r.periodGoal ?? '',
    currentStep: currentStepPosition(steps),
    metrics: metrics.map((m) => ({
      key: m.key,
      label: m.label,
      startValue: m.startValue ?? '',
      currentValue: m.currentValue ?? '',
      unit: m.unit ?? '',
    })),
    steps: steps.map((s) => ({
      position: s.position,
      title: s.title,
      status: s.status,
      evidence: s.evidence ?? '',
    })),
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      why: t.why ?? '',
      owner: t.owner,
      status: t.status,
      dueOn: ru(t.dueOn),
      linkUrl: t.linkUrl ?? '',
      linkLabel: t.linkLabel ?? '',
    })),
    notes: notes.map((n) => ({
      kind: n.kind,
      body: n.body,
      happenedOn: ru(n.happenedOn),
    })),
  };

  const empty = !card.metrics.length && !card.steps.length && !card.tasks.length;

  return (
    <div style={{ padding: '20px 0 60px' }}>
      <div style={{
        maxWidth: 540, margin: '0 auto 16px', padding: '0 16px',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        fontFamily: 'var(--font-body)', fontSize: '0.8rem',
      }}>
        <Link href={`/admin/roadmaps/${slug}`} style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>
          ← к карте
        </Link>
        <span style={{ color: 'var(--text-muted)' }}>предпросмотр глазами клиента:</span>
        <Link
          href={`/admin/roadmaps/${slug}/preview?mode=defaults`}
          style={{
            color: defaults ? 'var(--neon-cyan)' : 'var(--text-muted)',
            textDecoration: defaults ? 'none' : 'underline',
          }}
        >если открыть базовый набор</Link>
        <Link
          href={`/admin/roadmaps/${slug}/preview?mode=now`}
          style={{
            color: !defaults ? 'var(--neon-cyan)' : 'var(--text-muted)',
            textDecoration: !defaults ? 'none' : 'underline',
          }}
        >что видит сейчас</Link>
        {!r.clientVisible && (
          <span style={{ color: '#ffb45d' }}>карта ещё закрыта, в кабинете её нет</span>
        )}
      </div>

      <main className="km-wrap" style={{ borderRadius: 18 }}>
        <header className="km-top">
          <span className="km-back">‹ Кабинет</span>
          <div className="km-brand">Карта</div>
          <div className="km-sub">Где ты сейчас, куда идём и что делаем на этой неделе</div>
        </header>

        {empty ? (
          <div className="km-card">
            <p className="km-empty">
              Клиенту сейчас нечего показать: ни одна строка карты ему не открыта.
            </p>
          </div>
        ) : (
          <RoadmapView card={card} />
        )}

        <style>{ROADMAP_VIEW_CSS}</style>
      </main>
    </div>
  );
}
