import { NextRequest, NextResponse } from 'next/server';
import { verifiedViewer } from '@/lib/reels/store';
import { sendBotMessage } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Уникализатор: пожелания и баги со страницы /uniq уходят Саше в бота.
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

export async function POST(request: NextRequest) {
  const id = verifiedViewer(request);
  if (!id) return NextResponse.json({ error: 'Войди через Telegram, чтобы отправить.' }, { status: 401 });
  let text = '';
  try { text = String(((await request.json()) as { text?: unknown }).text ?? '').trim(); } catch { /* empty */ }
  if (!text) return NextResponse.json({ error: 'Напиши хоть пару слов.' }, { status: 400 });
  if (text.length > MAX) text = text.slice(0, MAX) + '…';

  const msg = `💬 Уникализатор, обратная связь\nОт: ${who(request.headers.get('x-tg-init-data'), id)}\n\n${text}`;
  const r = await sendBotMessage(SASHA, msg, undefined, null);
  if (!r.ok) {
    console.error('[uniq/feedback] send failed', id);
    return NextResponse.json({ error: 'Не получилось отправить. Попробуй ещё раз или напиши Саше в личку.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
