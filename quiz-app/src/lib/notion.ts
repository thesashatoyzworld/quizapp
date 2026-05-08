import { Client } from '@notionhq/client';
import { prisma } from '@/lib/prisma';

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

// Upsert user in Supabase (create if not exists, update username/firstName if provided)
async function upsertUser(telegramId: number, username?: string, firstName?: string) {
  try {
    await prisma.user.upsert({
      where: { telegramId: BigInt(telegramId) },
      create: {
        telegramId: BigInt(telegramId),
        username: username || null,
        firstName: firstName || null,
      },
      update: {
        ...(username ? { username } : {}),
        ...(firstName ? { firstName } : {}),
      },
    });
  } catch (error) {
    console.error('[Supabase] Failed to upsert user:', error);
  }
}

export async function trackEvent(payload: TrackEventPayload) {
  // Notion write (existing)
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

  // Supabase dual-write
  try {
    // Upsert user if we have telegram_id
    if (payload.user_id) {
      await upsertUser(payload.user_id, payload.username, payload.first_name);
      // Update quiz result if this is a quiz_complete event
      if (payload.event_type === 'quiz_complete' && payload.result_id) {
        await prisma.user.update({
          where: { telegramId: BigInt(payload.user_id) },
          data: { quizResult: payload.result_id },
        });
      }
    }

    // Find user id for relation (optional)
    let userId: string | undefined;
    if (payload.user_id) {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(payload.user_id) },
        select: { id: true },
      });
      userId = user?.id;
    }

    await prisma.event.create({
      data: {
        type: payload.event_type,
        userId: userId || null,
        telegramId: payload.user_id ? BigInt(payload.user_id) : null,
        source: 'thesasha',
        funnel: 'quiz',
        productSlug: payload.amount ? 'masterclass' : null,
        utmSource: payload.utm_source || null,
        metadata: payload.result_title || payload.result_id
          ? { result_id: payload.result_id, result_title: payload.result_title, result_stage: payload.result_stage, amount: payload.amount }
          : undefined,
      },
    });
  } catch (error) {
    console.error('[Supabase] Failed to track event:', error);
  }
}

export async function registerFollowUp(userId: number, resultId: string, username?: string, firstName?: string): Promise<boolean> {
  // Notion write (existing)
  try {
    const existing = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DS_ID,
      filter: {
        property: 'user_id',
        number: { equals: userId },
      },
    });

    if (existing.results.length > 0) {
      // Still write to Supabase in case it's missing there
      try {
        await prisma.followUp.upsert({
          where: { telegramId: BigInt(userId) },
          create: {
            telegramId: BigInt(userId),
            username: username || null,
            resultId: resultId,
          },
          update: {},
        });
      } catch (e) {
        console.error('[Supabase] Failed to upsert follow-up:', e);
      }
      return false;
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
  } catch (error) {
    console.error('Failed to register follow-up in Notion:', error);
  }

  // Supabase dual-write
  try {
    await upsertUser(userId, username, firstName);
    await prisma.followUp.upsert({
      where: { telegramId: BigInt(userId) },
      create: {
        telegramId: BigInt(userId),
        username: username || null,
        resultId: resultId,
      },
      update: {},
    });
  } catch (error) {
    console.error('[Supabase] Failed to register follow-up:', error);
  }

  return true;
}

export async function getUserInfo(userId: number): Promise<{ username: string; first_name: string }> {
  // Try Supabase first
  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(userId) },
      select: { username: true, firstName: true },
    });
    if (user && (user.username || user.firstName)) {
      return { username: user.username || '', first_name: user.firstName || '' };
    }
  } catch (error) {
    console.error('[Supabase] Failed to get user info:', error);
  }

  // Fallback to Notion
  try {
    const results = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DS_ID,
      filter: { property: 'user_id', number: { equals: userId } },
    });
    if (results.results.length > 0) {
      const props = (results.results[0] as Record<string, unknown>).properties as Record<string, unknown>;
      const username = (props.username as { rich_text: Array<{ plain_text: string }> })?.rich_text?.[0]?.plain_text || '';
      const first_name = (props.first_name as { rich_text: Array<{ plain_text: string }> })?.rich_text?.[0]?.plain_text || '';
      if (username || first_name) return { username, first_name };
    }
    const evResults = await notion.dataSources.query({
      data_source_id: EVENTS_DS_ID,
      filter: { property: 'user_id', number: { equals: userId } },
      page_size: 1,
    });
    if (evResults.results.length > 0) {
      const props = (evResults.results[0] as Record<string, unknown>).properties as Record<string, unknown>;
      const username = (props.username as { rich_text: Array<{ plain_text: string }> })?.rich_text?.[0]?.plain_text || '';
      const first_name = (props.first_name as { rich_text: Array<{ plain_text: string }> })?.rich_text?.[0]?.plain_text || '';
      return { username, first_name };
    }
  } catch (error) {
    console.error(`Failed to get user info for ${userId}:`, error);
  }
  return { username: '', first_name: '' };
}

export async function getFollowUpUsername(userId: number): Promise<string> {
  // Try Supabase first
  try {
    const followUp = await prisma.followUp.findUnique({
      where: { telegramId: BigInt(userId) },
      select: { username: true },
    });
    if (followUp?.username) return followUp.username;
  } catch (error) {
    console.error('[Supabase] Failed to get follow-up username:', error);
  }

  // Fallback to Notion
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
  // Try Supabase first
  try {
    const followUp = await prisma.followUp.findUnique({
      where: { telegramId: BigInt(userId) },
      select: { paid: true },
    });
    if (followUp) return followUp.paid;
  } catch (error) {
    console.error('[Supabase] Failed to check paid status:', error);
  }

  // Fallback to Notion
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
  // Notion write
  try {
    const results = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DS_ID,
      filter: {
        property: 'user_id',
        number: { equals: userId },
      },
    });

    if (results.results.length > 0) {
      const pageId = results.results[0].id;
      await notion.pages.update({
        page_id: pageId,
        properties: {
          paid: { checkbox: true },
        },
      });
    }
  } catch (error) {
    console.error('Failed to mark follow-up as paid in Notion:', error);
  }

  // Supabase dual-write
  try {
    await prisma.followUp.updateMany({
      where: { telegramId: BigInt(userId) },
      data: { paid: true },
    });
  } catch (error) {
    console.error('[Supabase] Failed to mark follow-up as paid:', error);
  }
}

export async function updateFollowUpSent(userId: number) {
  // Notion write
  try {
    const results = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DS_ID,
      filter: {
        property: 'user_id',
        number: { equals: userId },
      },
    });

    if (results.results.length > 0) {
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
    }
  } catch (error) {
    console.error(`Failed to update follow-up sent for user ${userId}:`, error);
  }

  // Supabase dual-write
  try {
    const existing = await prisma.followUp.findUnique({
      where: { telegramId: BigInt(userId) },
      select: { messagesSent: true },
    });
    if (existing) {
      await prisma.followUp.update({
        where: { telegramId: BigInt(userId) },
        data: {
          messagesSent: existing.messagesSent + 1,
          lastSentAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('[Supabase] Failed to update follow-up sent:', error);
  }
}

export async function markUserBlocked(userId: number) {
  // Notion write
  try {
    const results = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DS_ID,
      filter: {
        property: 'user_id',
        number: { equals: userId },
      },
    });

    if (results.results.length > 0) {
      const pageId = results.results[0].id;
      await notion.pages.update({
        page_id: pageId,
        properties: {
          paid: { checkbox: true },
        },
      });
    }

    console.log(`User ${userId} marked as blocked`);
  } catch (error) {
    console.error(`Failed to mark user ${userId} as blocked:`, error);
  }

  // Supabase dual-write
  try {
    await prisma.followUp.updateMany({
      where: { telegramId: BigInt(userId) },
      data: { paid: true },
    });
  } catch (error) {
    console.error('[Supabase] Failed to mark user as blocked:', error);
  }
}

export async function saveAdminChatId(chatId: number) {
  try {
    const existing = await notion.dataSources.query({
      data_source_id: EVENTS_DS_ID,
      filter: {
        property: 'event_type',
        title: { equals: 'admin_config' },
      },
    });

    if (existing.results.length > 0) {
      const pageId = existing.results[0].id;
      await notion.pages.update({
        page_id: pageId,
        properties: {
          user_id: { number: chatId },
          timestamp: { date: { start: new Date().toISOString() } },
        },
      });
    } else {
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

export async function hasBotStart(userId: number): Promise<boolean> {
  // Try Supabase first
  try {
    const count = await prisma.event.count({
      where: {
        type: 'bot_start',
        telegramId: BigInt(userId),
      },
    });
    if (count > 0) return true;
  } catch (error) {
    console.error('[Supabase] Failed to check bot_start:', error);
  }

  // Fallback to Notion
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

export async function getAdminChatId(): Promise<string | null> {
  const envChatId = process.env.ADMIN_CHAT_ID;
  if (envChatId && envChatId.trim() !== '') {
    return envChatId.trim();
  }

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
