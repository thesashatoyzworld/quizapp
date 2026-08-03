import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { INTAKE_TOTAL } from '@/content/intake-tarif3';

export const dynamic = 'force-dynamic';

function fmt(d: Date | null) {
  if (!d) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(d);
}

export default async function IntakeListPage() {
  const intakes = await prisma.intake.findMany({
    orderBy: [{ completedAt: 'desc' }, { invitedAt: 'desc' }],
    include: { _count: { select: { answers: true } } },
  });

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontSize: '1.25rem', marginBottom: 4 }}>
        АНКЕТЫ ТАРИФА 3
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>
        сбор до первого созвона 1-1. приглашение из бота: /anketa_send @username
      </p>

      {intakes.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>анкет пока нет</p>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {intakes.map((i) => {
          const who = i.username ? '@' + i.username
            : i.firstName || i.label || (i.telegramId !== null ? String(i.telegramId) : 'без имени');
          const label =
            i.status === 'done' ? 'собрана'
            : i.status === 'in_progress' ? `вопрос ${Math.min(i.currentStep + 1, INTAKE_TOTAL)} из ${INTAKE_TOTAL}`
            : i.telegramId === null ? 'ссылка выдана, не открывал'
            : 'приглашён, не начал';
          const color =
            i.status === 'done' ? 'var(--neon-cyan)'
            : i.status === 'in_progress' ? '#ffd166'
            : 'var(--text-muted)';

          return (
            <Link
              key={i.id}
              href={`/admin/anketa/${i.id}`}
              style={{
                display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
                padding: '14px 16px', textDecoration: 'none',
                background: 'var(--bg-secondary)',
                border: '1px solid rgba(0, 240, 255, 0.15)', borderRadius: 8,
              }}
            >
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{who}</span>
              <span style={{ color, fontSize: '0.85rem' }}>
                {label}
                <span style={{ color: 'var(--text-muted)' }}>
                  {' · '}{i._count.answers} ответов
                  {i.completedAt ? ` · ${fmt(i.completedAt)}` : i.invitedAt ? ` · ${fmt(i.invitedAt)}` : ''}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
