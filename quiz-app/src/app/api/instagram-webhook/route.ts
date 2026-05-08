import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — верификация webhook от Meta
export async function GET(request: NextRequest) {
  const verifyToken = process.env.IG_VERIFY_TOKEN;
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge || '', { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

// POST — обработка входящих комментариев
export async function POST(request: NextRequest) {
  const body = await request.json();

  console.log('🔔 IG Webhook POST received:', JSON.stringify(body).slice(0, 500));

  // Сохраняем лог в БД для дебага
  try {
    await prisma.igWebhookLog.create({
      data: { payload: JSON.stringify(body) },
    });
  } catch (e) {
    console.error('Failed to log webhook:', e);
  }

  // Сразу ответить 200 — Meta требует ответ за 20 секунд
  // Обработку делаем в фоне
  processWebhook(body).catch(console.error);

  return NextResponse.json({ status: 'ok' });
}

async function processWebhook(body: WebhookBody) {
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field === 'comments') {
        await handleComment(change.value);
      }
    }
  }
}

async function handleComment(comment: CommentValue) {
  const { id: commentId, text, from, media } = comment;

  if (!text || !commentId) return;

  // Проверяем дедупликацию
  const existing = await prisma.igReply.findUnique({
    where: { commentId },
  });
  if (existing) return;

  // Ищем совпадение с ключевым словом
  const keywords = await prisma.igKeyword.findMany({
    where: { active: true },
  });

  const matchedKeyword = keywords.find((kw) =>
    text.toLowerCase().includes(kw.keyword.toLowerCase())
  );

  if (!matchedKeyword) return;

  // Записываем в базу
  const reply = await prisma.igReply.create({
    data: {
      keywordId: matchedKeyword.id,
      commentId,
      igUserId: from?.id || 'unknown',
      igUsername: from?.username || null,
      mediaId: media?.id || null,
      commentText: text,
      replySent: false,
    },
  });

  // Отправляем Private Reply
  try {
    const response = await fetch(
      `https://graph.instagram.com/v24.0/${process.env.IG_ACCOUNT_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.IG_PAGE_TOKEN}`,
        },
        body: JSON.stringify({
          recipient: { comment_id: commentId },
          message: { text: matchedKeyword.replyText },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      await prisma.igReply.update({
        where: { id: reply.id },
        data: { error },
      });
      console.error('IG Private Reply error:', error);
      return;
    }

    await prisma.igReply.update({
      where: { id: reply.id },
      data: { replySent: true },
    });

    console.log(
      `✅ Private Reply sent to @${from?.username || 'unknown'} for keyword "${matchedKeyword.keyword}"`
    );
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await prisma.igReply.update({
      where: { id: reply.id },
      data: { error: errorMsg },
    });
    console.error('IG Private Reply exception:', errorMsg);
  }
}

// Типы

interface WebhookBody {
  entry?: Array<{
    id: string;
    time: number;
    changes?: Array<{
      field: string;
      value: CommentValue;
    }>;
  }>;
}

interface CommentValue {
  id: string;
  text?: string;
  from?: {
    id: string;
    username?: string;
  };
  media?: {
    id: string;
    media_product_type?: string;
  };
  timestamp?: string;
}
