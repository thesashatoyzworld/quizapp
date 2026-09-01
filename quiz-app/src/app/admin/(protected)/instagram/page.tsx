import { getIgLeads, getIgAutomationOptions, getLastSyncAt, matchFormFilled } from '@/lib/ig-leads';
import IgNav from './IgNav';
import IgLeadsClient from './IgLeadsClient';

export const dynamic = 'force-dynamic';

export default async function InstagramLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ funnel?: string; q?: string }>;
}) {
  const { funnel, q } = await searchParams;
  let leads, automations, lastSyncAt;

  try {
    // Дешёвая сверка с анкетами на каждом заходе: один запрос, зато статусы
    // всегда свежие, даже если полная сверка с ChatPlace ещё не запускалась.
    await matchFormFilled().catch((e) => console.error('[Instagram leads] сверка с анкетами:', e));

    [leads, automations, lastSyncAt] = await Promise.all([
      getIgLeads({ automationId: funnel && funnel !== 'all' ? funnel : undefined, q }),
      getIgAutomationOptions(),
      getLastSyncAt(),
    ]);
  } catch (e) {
    console.error('[Instagram leads] DB error:', e);
    return (
      <div>
        <IgNav active="/admin/instagram" />
        <p style={{ color: '#ff4444' }}>
          Таблица лидов недоступна: {String(e)}. Создать её: <code>node scripts/ig-leads-create-tables.mjs</code>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1180 }}>
      <IgNav active="/admin/instagram" />
      <IgLeadsClient
        leads={leads}
        automations={automations}
        lastSyncAt={lastSyncAt}
        funnel={funnel || 'all'}
        query={q || ''}
      />
    </div>
  );
}
