import { Client } from '@upstash/qstash';

const qstash = new Client({ token: process.env.QSTASH_TOKEN || '' });

const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || '';

export async function scheduleFollowUp(
  userId: number,
  resultId: string,
  messageIndex: number,
  delaySec: number,
) {
  if (!WEBAPP_URL) {
    console.error('[QStash] WEBAPP_URL not set, cannot schedule follow-up');
    return;
  }

  try {
    await qstash.publishJSON({
      url: `${WEBAPP_URL}/api/send-followup`,
      body: { userId, resultId, messageIndex },
      delay: delaySec,
    });
    console.log(`[QStash] Scheduled follow-up #${messageIndex} for user ${userId} in ${delaySec}s`);
  } catch (error) {
    console.error(`[QStash] Failed to schedule follow-up for user ${userId}:`, error);
  }
}
