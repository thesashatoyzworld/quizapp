import Link from 'next/link';
import { notFound } from 'next/navigation';
import { threadOf } from '@/lib/sales/dialogs';
import SalesThread from '../SalesThread';

// Переписка человека, у которого анкеты нет: пришёл не с формы или писал с
// другого аккаунта. У кого анкета есть, того открываем на его странице
// заявки — там рядом лежит всё остальное, что мы про него знаем.

export const dynamic = 'force-dynamic';

export default async function DialogPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  const rows = await threadOf(chatId);
  if (!rows.length) notFound();

  return (
    <div style={{ padding: '24px 28px', maxWidth: 900 }}>
      <Link
        href="/admin/dialogi"
        style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}
      >
        ← к диалогам
      </Link>
      <h1 style={{ fontSize: '1.3rem', margin: '10px 0 20px' }}>Переписка</h1>

      <SalesThread
        chatId={chatId}
        messages={rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
      />
    </div>
  );
}
