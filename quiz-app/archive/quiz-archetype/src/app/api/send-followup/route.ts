import { NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import followUpMessages, { ResultId } from '@/data/followup-messages';
import { isFollowUpPaid, updateFollowUpSent, markUserBlocked, getFollowUpUsername } from '@/lib/notion';
import { sendTelegramMessage, sendTelegramVideo, buildPaymentUrl, notifyAdmin, VIDEO_FILE_ID } from '@/lib/telegram';
import { scheduleFollowUp } from '@/lib/qstash';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
});

interface FollowUpPayload {
  userId: number;
  resultId: string;
  messageIndex: number;
}

export async function POST(request: NextRequest) {
  // Verify QStash signature
  const signature = request.headers.get('upstash-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  const body = await request.text();

  try {
    await receiver.verify({ signature, body });
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload: FollowUpPayload = JSON.parse(body);
  const { userId, resultId, messageIndex } = payload;

  console.log(`[send-followup] Processing message #${messageIndex} for user ${userId} (result: ${resultId})`);

  // Check if user has paid — stop sending if yes
  const paid = await isFollowUpPaid(userId);
  if (paid) {
    console.log(`[send-followup] User ${userId} has paid, skipping`);
    return NextResponse.json({ success: true, skipped: true, reason: 'paid' });
  }

  // Validate result_id and message index
  const messages = followUpMessages[resultId as ResultId];
  if (!messages || messageIndex >= messages.length) {
    console.log(`[send-followup] Invalid resultId=${resultId} or messageIndex=${messageIndex}`);
    return NextResponse.json({ success: false, error: 'Invalid message params' }, { status: 400 });
  }

  const message = messages[messageIndex];
  const paymentUrl = buildPaymentUrl(userId, resultId);

  // Send message
  let result: { ok: boolean; blocked?: boolean };

  if (message.hasVideo && VIDEO_FILE_ID) {
    result = await sendTelegramVideo(userId, VIDEO_FILE_ID, message.text, paymentUrl);
  } else {
    result = await sendTelegramMessage(userId, message.text, paymentUrl);
  }

  // Get username for admin notifications
  const username = await getFollowUpUsername(userId);
  const userLabel = username ? `@${username}` : `user ${userId}`;

  if (result.blocked) {
    await markUserBlocked(userId);
    await notifyAdmin(`\uD83D\uDEAB ${userLabel} blocked the bot during follow-up #${messageIndex + 1}`);
    return NextResponse.json({ success: true, blocked: true });
  }

  if (!result.ok) {
    await notifyAdmin(`\u274C Failed to send follow-up #${messageIndex + 1} to ${userLabel}`);
    return NextResponse.json({ success: false, error: 'Send failed' }, { status: 500 });
  }

  // Update Notion
  await updateFollowUpSent(userId);

  // Schedule next message if not the last one
  const nextIndex = messageIndex + 1;
  if (nextIndex < messages.length) {
    await scheduleFollowUp(userId, resultId, nextIndex, 43200); // 12 hours
  }

  const timestamp = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  await notifyAdmin(`\uD83D\uDCE8 Follow-up #${messageIndex + 1} sent to ${userLabel} (${resultId})\n\u23F0 ${timestamp}`);

  console.log(`[send-followup] Message #${messageIndex + 1} sent to user ${userId}`);

  return NextResponse.json({ success: true, messageIndex, userId });
}
