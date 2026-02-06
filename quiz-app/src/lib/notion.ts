import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const EVENTS_DS_ID = process.env.NOTION_EVENTS_DB_ID || '';
const FOLLOWUP_DS_ID = process.env.NOTION_FOLLOWUP_DB_ID || '';

interface TrackEventPayload {
  event_type: string;
  user_id?: number;
  result_id?: string;
  result_title?: string;
  result_stage?: string;
  amount?: number;
}

export async function trackEvent(payload: TrackEventPayload) {
  try {
    await notion.pages.create({
      parent: { data_source_id: EVENTS_DS_ID },
      properties: {
        event_type: {
          title: [{ text: { content: payload.event_type } }],
        },
        user_id: {
          number: payload.user_id ?? null,
        },
        result_id: {
          rich_text: [{ text: { content: payload.result_id || '' } }],
        },
        result_title: {
          rich_text: [{ text: { content: payload.result_title || '' } }],
        },
        result_stage: {
          rich_text: [{ text: { content: payload.result_stage || '' } }],
        },
        amount: {
          number: payload.amount ?? null,
        },
        timestamp: {
          date: { start: new Date().toISOString() },
        },
      },
    });
  } catch (error) {
    console.error('Failed to track event to Notion:', error);
  }
}

export async function registerFollowUp(userId: number, resultId: string) {
  try {
    // Deduplicate: check if user already exists in FollowUpQueue
    const existing = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DS_ID,
      filter: {
        property: 'user_id',
        number: { equals: userId },
      },
    });

    if (existing.results.length > 0) {
      return; // Already registered
    }

    await notion.pages.create({
      parent: { data_source_id: FOLLOWUP_DS_ID },
      properties: {
        user_id_title: {
          title: [{ text: { content: String(userId) } }],
        },
        user_id: {
          number: userId,
        },
        result_id: {
          select: { name: resultId },
        },
        registered_at: {
          date: { start: new Date().toISOString() },
        },
        messages_sent: {
          number: 0,
        },
        paid: {
          checkbox: false,
        },
      },
    });
  } catch (error) {
    console.error('Failed to register follow-up in Notion:', error);
  }
}

export async function markFollowUpPaid(userId: number) {
  try {
    const results = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DS_ID,
      filter: {
        property: 'user_id',
        number: { equals: userId },
      },
    });

    if (results.results.length === 0) return;

    const pageId = results.results[0].id;
    await notion.pages.update({
      page_id: pageId,
      properties: {
        paid: { checkbox: true },
      },
    });
  } catch (error) {
    console.error('Failed to mark follow-up as paid in Notion:', error);
  }
}

interface PendingUser {
  user_id: number;
  result_id: string;
  messages_sent: number;
  page_id: string;
}

export async function getPendingUsers(): Promise<PendingUser[]> {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const results = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DS_ID,
      filter: {
        and: [
          { property: 'paid', checkbox: { equals: false } },
          { property: 'messages_sent', number: { less_than: 4 } },
          {
            or: [
              { property: 'last_sent_at', date: { is_empty: true } },
              { property: 'last_sent_at', date: { before: twentyFourHoursAgo } },
            ],
          },
        ],
      },
    });

    return results.results.map((page) => {
      const props = (page as Record<string, unknown>).properties as Record<string, unknown>;

      const userIdProp = props.user_id as { number: number | null } | undefined;
      const resultIdProp = props.result_id as { select: { name: string } | null } | undefined;
      const messagesSentProp = props.messages_sent as { number: number | null } | undefined;

      return {
        user_id: userIdProp?.number ?? 0,
        result_id: resultIdProp?.select?.name ?? '',
        messages_sent: messagesSentProp?.number ?? 0,
        page_id: page.id,
      };
    }).filter(u => u.user_id > 0 && u.result_id);
  } catch (error) {
    console.error('Failed to get pending users from Notion:', error);
    return [];
  }
}

export async function updateFollowUpSent(userId: number) {
  try {
    const results = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DS_ID,
      filter: {
        property: 'user_id',
        number: { equals: userId },
      },
    });

    if (results.results.length === 0) return;

    const page = results.results[0];
    const props = (page as Record<string, unknown>).properties as Record<string, unknown>;
    const messagesSentProp = props.messages_sent as { number: number | null } | undefined;
    const currentCount = messagesSentProp?.number ?? 0;

    await notion.pages.update({
      page_id: page.id,
      properties: {
        messages_sent: { number: currentCount + 1 },
        last_sent_at: { date: { start: new Date().toISOString() } },
      },
    });
  } catch (error) {
    console.error(`Failed to update follow-up sent for user ${userId}:`, error);
  }
}
