import { NextRequest, NextResponse } from 'next/server';
import { verifiedViewer } from '@/lib/reels/store';
import { sendBotMessage } from '@/lib/telegram';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Уникализатор: пожелания и баги со страницы /uniq уходят Саше в бота
// и пишутся в events (type uniq_feedback), чтобы их можно было найти потом.
//   POST /api/cabinet/uniq/feedback { text } → { ok } | 401 / 400 / 502
// Identity is signed only (x-tg-init-data or kb_session cookie).

const SASHA = 788334680;
const MAX = 2000;

function who(initData: string | null, id: number): string {
  try {
    const u = JSON.parse(new URLSearchParams(initData || '').get('user') || '{}') as { id?: number; first_name?: string; last_name?: string; username?: string };
    if (u.id === id) {
      const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
      return [name, u.username ? `@${u.username}` : ''].filter(Boolean).join(' ') + ` (id ${id})`;
    }
  } catch { /* fall through */ }
  return `id ${id}`;
}

// initData is often missing (cookie session): name the person from users instead of a bare id.
async function whoFromDb(id: number): Promise<string> {
  const u = await prisma.user.findUnique({ where: { telegramId: BigInt(id) } }).catch(() => null);
  if (!u) return `id ${id}`;
  return [u.firstName, u.username ? `@${u.username}` : ''].filter(Boolean).join(' ') + ` (id ${id})`;
}

export async function POST(request: NextRequest) {
  const id = verifiedViewer(request);
  if (!id) return NextResponse.json({ error: 'Войди через Telegram, чтобы отправить.' }, { status: 401 });
  let text = '';
  try { text = String(((await request.json()) as { text?: unknown }).text ?? '').trim(); } catch { /* empty */ }
  if (!text) return NextResponse.json({ error: 'Напиши хоть пару слов.' }, { status: 400 });
  if (text.length > MAX) text = text.slice(0, MAX) + '…';

  let from = who(request.headers.get('x-tg-init-data'), id);
  if (from.startsWith('id ')) from = await whoFromDb(id);
  await prisma.event.create({
    data: { type: 'uniq_feedback', source: 'uniq', telegramId: BigInt(id), metadata: { text, from } },
  }).catch((e) => console.error('[uniq/feedback] save failed', id, e));
  const msg = `💬 Уникализатор, обратная связь\nОт: ${from}\n\n${text}`;
  const r = await sendBotMessage(SASHA, msg, undefined, null);
  if (!r.ok) {
    console.error('[uniq/feedback] send failed', id);
    return NextResponse.json({ error: 'Не получилось отправить. Попробуй ещё раз или напиши Саше в личку.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
