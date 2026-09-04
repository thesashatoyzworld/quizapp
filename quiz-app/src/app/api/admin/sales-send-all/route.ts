import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { sendAs } from '@/lib/sales/tg';
import { waiting, readySuggestion } from '@/lib/sales/dialogs';
import { priority } from '@/lib/sales/priority';

// Разослать готовые ответы всем, кого не надо разбирать руками.
//
// Саша: «я не могу проверять каждый ответ, нужно выделить приоритетных и всё».
// Поэтому пачкой уходят только безопасные ходы — уточняющие вопросы. Всё, где
// называется цена, где ведём на дорогое или где человек сам спросил про
// деньги, остаётся ему (см. lib/sales/priority).
//
// GET отдаёт предпросмотр: кому и что уйдёт. POST отправляет.
export const maxDuration = 300;

async function plan() {
  const rows = await waiting();

  const auto: { chatId: string; who: string; text: string; suggestionId: string }[] = [];
  const manual: { chatId: string; who: string; reason: string; leadId: number | null }[] = [];

  for (const r of rows) {
    const step = await readySuggestion(r.chatId);
    const who = r.name || (r.username ? `@${r.username}` : r.chatId);
    const p = priority(r, step);

    if (p.manual) {
      manual.push({ chatId: r.chatId, who, reason: p.reason || 'разобрать самому', leadId: r.leadId });
      continue;
    }
    // Без готового ответа отправлять нечего: сперва «собрать ответы всем».
    if (!step?.message) continue;

    auto.push({ chatId: r.chatId, who, text: step.message, suggestionId: step.id });
  }

  return { auto, manual };
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { auto, manual } = await plan();
  return NextResponse.json({ ok: true, auto, manual });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Подтверждение приходит из интерфейса вместе со списком, который Саша
  // видел глазами: отправка необратима, и молчаливое «отправить всё» без
  // сверки того, что уйдёт, здесь недопустимо.
  const { confirm } = await request.json().catch(() => ({ confirm: false }));
  if (confirm !== true) {
    return NextResponse.json({ error: 'нужно подтверждение' }, { status: 400 });
  }

  const { auto, manual } = await plan();

  let sent = 0;
  const failed: { who: string; error: string }[] = [];

  for (const item of auto) {
    const res = await sendAs(item.chatId, item.text);
    if (!res.ok) {
      failed.push({ who: item.who, error: res.error || 'не ушло' });
      continue;
    }
    sent += 1;

    // Правку не пишем: текст ушёл как есть, а пара «предложили = отправили»
    // ничему не учит и только разбавляет реальные поправки Саши.
    await prisma.tgSuggestion
      .update({ where: { id: item.suggestionId }, data: { sentAt: new Date() } })
      .catch(() => {});
  }

  return NextResponse.json({ ok: true, sent, failed, manual: manual.length });
}
