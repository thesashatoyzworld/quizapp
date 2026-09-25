import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { callLabel, type ClientResult, type ProposalPayload } from '@/lib/roadmap/call-proposals';
import styles from '../../roadmap.module.css';

export const dynamic = 'force-dynamic';

// What a group call proposes for each client's roadmap: the log entry, every
// task change with the quote it rests on, and the names without a roadmap.
// Read-only: applying is the bot button.

const STATUS: Record<string, string> = {
  pending: 'ждёт твоей кнопки в боте',
  applying: 'применяется',
  applied: 'внесено в карты',
  partial: 'внесено частично',
  failed: 'не внеслось',
};

const box: React.CSSProperties = {
  border: '1px solid rgba(0, 240, 255, 0.15)',
  borderRadius: 10,
  padding: '14px 16px',
  marginBottom: 14,
};
const op: React.CSSProperties = { margin: '10px 0 0', paddingLeft: 12, borderLeft: '2px solid rgba(0, 240, 255, 0.25)' };

function Quote({ ts, text }: { ts?: string; text?: string }) {
  if (!text) return null;
  return (
    <div className={styles.noteSrc}>
      {ts ? `${ts} · ` : ''}«{text}»
    </div>
  );
}

export default async function CallProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await prisma.roadmapCallProposal.findUnique({ where: { id } });
  if (!row) notFound();

  const p = row.payload as unknown as ProposalPayload;
  const results = Array.isArray(row.result) ? (row.result as unknown as ClientResult[]) : [];
  const bySlug = new Map(results.map((r) => [r.slug, r]));

  const slugs = p.perClient.map((c) => c.slug);
  const roadmaps = await prisma.roadmap.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, clientName: true, tasks: { select: { key: true, title: true, why: true, status: true } } },
  });
  const map = new Map(roadmaps.map((r) => [r.slug, r]));

  return (
    <div className={styles.page}>
      <Link href="/admin/roadmaps" className={styles.back}>← карты клиентов</Link>
      <h1 className={styles.h1}>СОЗВОН {callLabel(p.callDate, p.sozvonSlug)}: ПРАВКИ В КАРТЫ</h1>
      <p className={styles.sub}>
        {p.title ? `${p.title}. ` : ''}Статус: {STATUS[row.status] || row.status}
        {row.appliedAt ? `, ${row.appliedAt.toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}` : ''}
      </p>

      {p.perClient.length === 0 && <p className={styles.empty}>никого из клиентов с картой не нашёл</p>}

      {p.perClient.map((c) => {
        const r = map.get(c.slug);
        const done = bySlug.get(c.slug);
        const taskOf = (key: string) => r?.tasks.find((t) => t.key === key);
        return (
          <section key={c.slug} style={box}>
            <div className={styles.row}>
              <Link href={`/admin/roadmaps/${c.slug}`} className={styles.name}>
                {r?.clientName || c.heardName}
              </Link>
              <span className={styles.k}>услышал как «{c.heardName}»</span>
            </div>

            {done && (
              <div className={styles.noteSrc}>
                {done.status === 'applied' ? '✅ внесено' : done.status === 'skipped' ? '⏭ пропущено' : '❌ не внесено'}
                {done.error ? `: ${done.error}` : ''}
                {done.warnings.length ? ` · ${done.warnings.join('; ')}` : ''}
              </div>
            )}

            <div style={op}>
              <div className={styles.k}>в «Что решили», клиент видит</div>
              <div className={styles.noteBody}>{c.logEntry}</div>
            </div>

            {c.tasks.update.map((u) => {
              const t = taskOf(u.key);
              return (
                <div key={u.key} style={op}>
                  <div className={styles.k}>
                    {u.drop ? 'снять задачу' : 'поправить задачу'} <code>{u.key}</code>
                    {t?.status === 'done' ? ' (уже сделана, не тронется)' : ''}
                  </div>
                  <div className={styles.taskWhy}>было: {t?.title || 'задачи с таким ключом нет'}</div>
                  {u.title && <div className={styles.noteBody}>станет: {u.title}</div>}
                  {u.why && <div className={styles.taskWhy}>зачем: {u.why}</div>}
                  <Quote ts={u.ts} text={u.quote} />
                </div>
              );
            })}

            {c.tasks.insert.map((t) => (
              <div key={t.key} style={op}>
                <div className={styles.k}>
                  новая задача {t.owner === 'sasha' ? 'на тебе' : 'клиенту'} <code>{t.key}</code>
                </div>
                <div className={styles.noteBody}>{t.title}</div>
                {t.why && <div className={styles.taskWhy}>зачем: {t.why}</div>}
                <Quote ts={t.ts} text={t.quote} />
              </div>
            ))}

            {c.quotes.length > 0 && (
              <div style={op}>
                <div className={styles.k}>на чём держится запись</div>
                {c.quotes.map((q, i) => (
                  <Quote key={i} ts={q.ts} text={q.text} />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {p.unmatched.length > 0 && (
        <section style={box}>
          <div className={styles.k}>без карты</div>
          {p.unmatched.map((u, i) => (
            <div key={i} className={styles.noteBody}>
              {u.heardName}: <span className={styles.taskWhy}>{u.why}</span>
            </div>
          ))}
        </section>
      )}

      {(p.warnings?.length ?? 0) > 0 && (
        <section style={box}>
          <div className={styles.k}>что отброшено по дороге</div>
          {p.warnings!.map((w, i) => (
            <div key={i} className={styles.taskWhy}>{w}</div>
          ))}
        </section>
      )}
    </div>
  );
}
