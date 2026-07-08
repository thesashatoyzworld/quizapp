import { NextRequest, NextResponse } from 'next/server';
import { registerFollowUp } from '@/lib/notion';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_USERNAME = '@sashatoyz';

export async function POST(request: NextRequest) {
  try {
    const { user_id, result_id, username, first_name } = await request.json();

    if (!user_id) {
      return NextResponse.json(
        { subscribed: false, error: 'user_id is required' },
        { status: 400 }
      );
    }

    if (!BOT_TOKEN) {
      console.error('BOT_TOKEN not configured');
      return NextResponse.json(
        { subscribed: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Call Telegram Bot API to check membership
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${CHANNEL_USERNAME}&user_id=${user_id}`
    );

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', data);
      return NextResponse.json(
        { subscribed: false, error: data.description || 'Telegram API error' },
        { status: 200 }
      );
    }

    // Check if user is a member (not 'left' or 'kicked')
    const status = data.result?.status;
    const isSubscribed = ['member', 'administrator', 'creator'].includes(status);

    // Backup: if subscribed and we have result_id, ensure user is in FollowUpQueue
    // This catches cases where the client-side quiz_complete tracking failed
    if (isSubscribed && result_id && user_id) {
      registerFollowUp(user_id, result_id, username, first_name).catch(() => {});
    }

    return NextResponse.json({ subscribed: isSubscribed, status });
  } catch (error) {
    console.error('Check subscription error:', error);
    return NextResponse.json(
      { subscribed: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
