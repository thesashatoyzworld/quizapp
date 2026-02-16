import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const EVENTS_DS_ID = process.env.NOTION_EVENTS_DB_ID || '';
const FOLLOWUP_DS_ID = process.env.NOTION_FOLLOWUP_DB_ID || '';

interface TrackEventPayload {
  event_type: string;
  user_id?: number;
  username?: string;
  first_name?: string;
  result_id?: string;
  result_title?: string;
  result_stage?: string;
  amount?: number;
  utm_source?: string;
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
        username: {
          rich_text: [{ text: { content: payload.username || '' } }],
        },
        first_name: {
          rich_text: [{ text: { content: payload.first_name || '' } }],
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
        utm_source: {
          rich_text: [{ text: { content: payload.utm_source || '' } }],
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

export async function registerFollowUp(userId: number, resultId: string, username?: string, firstName?: string): Promise<boolean> {
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
        username: {
          rich_text: [{ text: { content: username || '' } }],
        },
        first_name: {
          rich_text: [{ text: { content: firstName || '' } }],
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

export async function getFollowUpUsername(userId: number): Promise<string> {
  try {
    const results = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DS_ID,
      filter: {
        property: 'user_id',
        number: { equals: userId },
      },
    });

    if (results.results.length === 0) return '';

    const page = results.results[0];
    const props = (page as Record<string, unknown>).properties as Record<string, unknown>;
    const usernameProp = props.username as { rich_text: Array<{ plain_text: string }> } | undefined;
    return usernameProp?.rich_text?.[0]?.plain_text || '';
  } catch (error) {
    console.error(`Failed to get username for user ${userId}:`, error);
    return '';
  }
}

export async function isFollowUpPaid(userId: number): Promise<boolean> {
  try {
    const results = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DS_ID,
      filter: {
        property: 'user_id',
        number: { equals: userId },
      },
    });

    if (results.results.length === 0) return false;

    const page = results.results[0];
    const props = (page as Record<string, unknown>).properties as Record<string, unknown>;
    const paidProp = props.paid as { checkbox: boolean } | undefined;
    return paidProp?.checkbox === true;
  } catch (error) {
    console.error(`Failed to check paid status for user ${userId}:`, error);
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
 * Check if user has a bot_start event (for backfilling missing events)
 */
export async function hasBotStart(userId: number): Promise<boolean> {
  try {
    const results = await notion.dataSources.query({
      data_source_id: EVENTS_DS_ID,
      filter: {
        and: [
          {
            property: 'event_type',
            title: { equals: 'bot_start' },
          },
          {
            property: 'user_id',
            number: { equals: userId },
          },
        ],
      },
      page_size: 1,
    });

    return results.results.length > 0;
  } catch (error) {
    console.error('Failed to check bot_start:', error);
    return false;
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
