import { getIgLeads, getIgAutomationOptions, getLastSyncAt } from '@/lib/ig-leads';
import IgNav from './IgNav';
import IgLeadsClient from './IgLeadsClient';

export const dynamic = 'force-dynamic';

export default async function InstagramLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ funnel?: string }>;
}) {
  const { funnel } = await searchParams;
  let leads, automations, lastSyncAt;

  try {
    [leads, automations, lastSyncAt] = await Promise.all([
      getIgLeads({ automationId: funnel && funnel !== 'all' ? funnel : undefined }),
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
      <IgLeadsClient leads={leads} automations={automations} lastSyncAt={lastSyncAt} funnel={funnel || 'all'} />
    </div>
  );
}
