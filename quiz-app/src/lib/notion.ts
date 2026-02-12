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

export async function registerFollowUp(userId: number, resultId: string): Promise<boolean> {
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
      return false; // Already registered
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
    return true; // New entry created
  } catch (error) {
    console.error('Failed to register follow-up in Notion:', error);
    return false;
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
  registered_at: string | null;
  last_sent_at: string | null;
}

export async function getPendingUsers(): Promise<PendingUser[]> {
  try {
    const now = new Date();
    const threeMinutesAgo = now.getTime() - 3 * 60 * 1000;
    const twelveHoursAgo = now.getTime() - 12 * 60 * 60 * 1000;

    // Simple filter — time checks done in JS to avoid nested and/or issues
    const results = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DS_ID,
      filter: {
        and: [
          { property: 'paid', checkbox: { equals: false } },
          { property: 'messages_sent', number: { less_than: 4 } },
        ],
      },
    });

    return results.results.map((page) => {
      const props = (page as Record<string, unknown>).properties as Record<string, unknown>;

      const userIdProp = props.user_id as { number: number | null } | undefined;
      const resultIdProp = props.result_id as { select: { name: string } | null } | undefined;
      const messagesSentProp = props.messages_sent as { number: number | null } | undefined;
      const registeredAtProp = props.registered_at as { date: { start: string } | null } | undefined;
      const lastSentAtProp = props.last_sent_at as { date: { start: string } | null } | undefined;

      return {
        user_id: userIdProp?.number ?? 0,
        result_id: resultIdProp?.select?.name ?? '',
        messages_sent: messagesSentProp?.number ?? 0,
        page_id: page.id,
        registered_at: registeredAtProp?.date?.start ?? null,
        last_sent_at: lastSentAtProp?.date?.start ?? null,
      };
    }).filter(u => {
      if (u.user_id <= 0 || !u.result_id) return false;

      if (u.messages_sent === 0) {
        // First message: 3 min after registration
        if (!u.registered_at) return false;
        return new Date(u.registered_at).getTime() < threeMinutesAgo;
      } else {
        // Subsequent messages: 12h after last sent
        if (!u.last_sent_at) return true;
        return new Date(u.last_sent_at).getTime() < twelveHoursAgo;
      }
    });
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

/**
 * Mark user as blocked when bot receives 403 error.
 * Sets paid=true to stop future sends (reusing existing field instead of adding new property).
 */
export async function markUserBlocked(userId: number) {
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
        paid: { checkbox: true }, // Reuse paid field to mean "stop sending"
      },
    });

    console.log(`User ${userId} marked as blocked`);
  } catch (error) {
    console.error(`Failed to mark user ${userId} as blocked:`, error);
  }
}

/**
 * Save admin chat_id to Notion Events DB.
 * Uses event_type="admin_config" to store admin chat_id.
 * Note: Last person to /start the bot becomes the admin (single-admin bot).
 */
export async function saveAdminChatId(chatId: number) {
  try {
    // Check if admin_config entry already exists
    const existing = await notion.dataSources.query({
      data_source_id: EVENTS_DS_ID,
      filter: {
        property: 'event_type',
        title: { equals: 'admin_config' },
      },
    });

    if (existing.results.length > 0) {
      // Update existing admin_config
      const pageId = existing.results[0].id;
      await notion.pages.update({
        page_id: pageId,
        properties: {
          user_id: { number: chatId },
          timestamp: { date: { start: new Date().toISOString() } },
        },
      });
    } else {
      // Create new admin_config entry
      await notion.pages.create({
        parent: { data_source_id: EVENTS_DS_ID },
        properties: {
          event_type: {
            title: [{ text: { content: 'admin_config' } }],
          },
          user_id: {
            number: chatId,
          },
          timestamp: {
            date: { start: new Date().toISOString() },
          },
        },
      });
    }

    console.log(`Admin chat_id saved: ${chatId}`);
  } catch (error) {
    console.error('Failed to save admin chat_id to Notion:', error);
  }
}

/**
 * Get admin chat_id from Notion or env var fallback.
 * Priority: ADMIN_CHAT_ID env var > Notion admin_config
 */
export async function getAdminChatId(): Promise<string | null> {
  // Check env var first (fallback/override)
  const envChatId = process.env.ADMIN_CHAT_ID;
  if (envChatId && envChatId.trim() !== '') {
    return envChatId.trim();
  }

  // Query Notion for admin_config
  try {
    const results = await notion.dataSources.query({
      data_source_id: EVENTS_DS_ID,
      filter: {
        property: 'event_type',
        title: { equals: 'admin_config' },
      },
    });

    if (results.results.length === 0) {
      return null;
    }

    const page = results.results[0];
    const props = (page as Record<string, unknown>).properties as Record<string, unknown>;
    const userIdProp = props.user_id as { number: number | null } | undefined;
    const chatId = userIdProp?.number;

    return chatId ? String(chatId) : null;
  } catch (error) {
    console.error('Failed to get admin chat_id from Notion:', error);
    return null;
  }
}
