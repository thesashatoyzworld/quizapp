import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { INTAKE_QUESTIONS, INTAKE_TOTAL } from '@/content/intake-tarif3';
import { EXTRA_STEP } from '@/lib/intake';

export const dynamic = 'force-dynamic';

const card = {
  background: 'var(--bg-secondary)',
  border: '1px solid rgba(0, 240, 255, 0.15)',
  borderRadius: 8,
  padding: '16px 18px',
};

function fmt(d: Date | null) {
  if (!d) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(d);
}

/** Ссылки в ответах должны кликаться: половина вопросов просит именно ссылки. */
function withLinks(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((p, idx) =>
    /^https?:\/\//.test(p) ? (
      <a key={idx} href={p} target="_blank" rel="noreferrer" style={{ color: 'var(--neon-cyan)' }}>
        {p}
      </a>
    ) : (
      <span key={idx}>{p}</span>
    ),
  );
}

export default async function IntakeDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const intake = await prisma.intake.findUnique({
    where: { id },
    include: { answers: { orderBy: { createdAt: 'asc' } } },
  });
  if (!intake) notFound();

  const who = intake.username ? '@' + intake.username : intake.firstName || String(intake.telegramId);
  const voices = intake.answers.filter((a) => a.kind === 'voice');
  const totalMin = Math.round(voices.reduce((s, a) => s + (a.durationSec || 0), 0) / 60);
  const extras = intake.answers.filter((a) => a.step === EXTRA_STEP);

  return (
    <div style={{ maxWidth: 820 }}>
      <Link href="/admin/anketa" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>
        ‹ все анкеты
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontSize: '1.25rem', margin: '10px 0 4px' }}>
        {who}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 22 }}>
        id {String(intake.telegramId)}
        {intake.startedAt ? ` · начал ${fmt(intake.startedAt)}` : ''}
        {intake.completedAt ? ` · закончил ${fmt(intake.completedAt)}` : ` · статус: ${intake.status}`}
        {voices.length ? ` · голосовых ${voices.length}${totalMin ? ` (~${totalMin} мин)` : ''}` : ''}
      </p>

      <div style={{ display: 'grid', gap: 14 }}>
        {INTAKE_QUESTIONS.map((q, step) => {
          const answers = intake.answers.filter((a) => a.step === step);
          const skipped = answers.some((a) => a.skipped);

          return (
            <section key={step} style={card}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', letterSpacing: '0.08em' }}>
                {step + 1} / {INTAKE_TOTAL}
              </div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1rem', margin: '4px 0 6px' }}>{q.title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 12, lineHeight: 1.5 }}>
                {q.body}
              </p>

              {skipped && <p style={{ color: '#ff8fa3', fontSize: '0.85rem' }}>пропущено</p>}

              {!skipped && answers.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', opacity: 0.6 }}>нет ответа</p>
              )}

              <div style={{ display: 'grid', gap: 12 }}>
                {answers.filter((a) => !a.skipped).map((a) => (
                  <Answer key={a.id} answer={a} />
                ))}
              </div>
            </section>
          );
        })}

        {extras.length > 0 && (
          <section style={{ ...card, borderColor: 'rgba(255, 209, 102, 0.35)' }}>
            <h2 style={{ color: '#ffd166', fontSize: '1rem', marginBottom: 10 }}>добивающие вопросы</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {extras.map((a) =>
                a.kind === 'question' ? (
                  <p key={a.id} style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
                    {a.extraQuestion}
                  </p>
                ) : (
                  <Answer key={a.id} answer={a} />
                ),
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

type AnswerRow = {
  id: string;
  kind: string;
  rawText: string | null;
  transcript: string | null;
  fileId: string | null;
  durationSec: number | null;
  createdAt: Date;
};

function Answer({ answer }: { answer: AnswerRow }) {
  const src = answer.fileId ? `/api/admin/intake-file/${answer.fileId}` : null;

  if (answer.kind === 'voice') {
    return (
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: 6 }}>
          🎙 голосовое{answer.durationSec ? ` · ${answer.durationSec} сек` : ''}
        </div>
        {src && <audio controls src={src} style={{ width: '100%', maxWidth: 420, marginBottom: 8 }} />}
        {answer.transcript ? (
          <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {withLinks(answer.transcript)}
          </p>
        ) : (
          <p style={{ color: '#ff8fa3', fontSize: '0.85rem' }}>расшифровки нет, слушать записью</p>
        )}
      </div>
    );
  }

  if (answer.kind === 'photo') {
    return (
      <div>
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" style={{ maxWidth: '100%', borderRadius: 6, display: 'block' }} />
        )}
        {answer.rawText && (
          <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginTop: 6 }}>{withLinks(answer.rawText)}</p>
        )}
      </div>
    );
  }

  if (answer.kind === 'video_note') {
    return (
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: 6 }}>
          ⭕ кружок{answer.durationSec ? ` · ${answer.durationSec} сек` : ''}
        </div>
        {src && <video controls src={src} style={{ width: 240, borderRadius: '50%' }} />}
      </div>
    );
  }

  if (answer.kind === 'document') {
    return (
      <div style={{ fontSize: '0.9rem' }}>
        📎{' '}
        {src ? (
          <a href={src} target="_blank" rel="noreferrer" style={{ color: 'var(--neon-cyan)' }}>
            {answer.rawText || 'файл'}
          </a>
        ) : (
          answer.rawText || 'файл'
        )}
      </div>
    );
  }

  return (
    <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
      {withLinks(answer.rawText || '')}
    </p>
  );
}
