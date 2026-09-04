import Link from 'next/link';
import { notFound } from 'next/navigation';
import { threadOf, readySuggestion } from '@/lib/sales/dialogs';
import { outcomeOf, wakeIn } from '@/lib/sales/outcome';
import SalesThread from '../SalesThread';
import OutcomeButtons from '../OutcomeButtons';

// Переписка человека, у которого анкеты нет: пришёл не с формы или писал с
// другого аккаунта. У кого анкета есть, того открываем на его странице
// заявки — там рядом лежит всё остальное, что мы про него знаем.

export const dynamic = 'force-dynamic';

export default async function DialogPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  const rows = await threadOf(chatId);
  if (!rows.length) notFound();

  const [ready, mark] = await Promise.all([readySuggestion(chatId), outcomeOf(chatId)]);

  return (
    <div style={{ padding: '24px 28px', maxWidth: 900 }}>
      <Link
        href="/admin/dialogi"
        style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}
      >
        ← к диалогам
      </Link>
      <h1 style={{ fontSize: '1.3rem', margin: '10px 0 12px' }}>Переписка</h1>

      <div style={{ marginBottom: 20 }}>
        <OutcomeButtons
          chatId={chatId}
          outcome={mark?.outcome ?? null}
          wakeIn={mark ? wakeIn(mark.wakeAt) : null}
        />
      </div>

      <SalesThread
        chatId={chatId}
        ready={ready}
        messages={rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
      />
    </div>
  );
}
