import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { suggestFromThread } from '@/lib/sales/answer';
import { leadOfChat, describeLead, describeAccess } from '@/lib/sales/tg';
import { waiting, threadOf, readySuggestion } from '@/lib/sales/dialogs';
import { awaitingPayment, describePayment, theirMove } from '@/lib/sales/payment';

// Собрать ответы сразу всем, кто ждёт.
//
// Когда очередь накопилась за сутки, открывать одиннадцать человек и на
// каждом ждать по минуте — час работы. Здесь разбор идёт разом: к моменту,
// когда Саша дойдёт до третьего, у всех уже готов текст.
export const maxDuration = 300;

/** Сколько разбираем за один заход. Разбор идёт параллельно, но не бесконечно. */
const BATCH = 12;

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // force — собрать заново даже тем, у кого ответ уже готов. Нужно после
  // правки правил: старые тексты собраны по прежним и молча устаревают.
  const { force } = await request.json().catch(() => ({ force: false }));

  const rows = await waiting();

  if (force === true) {
    await prisma.tgSuggestion.deleteMany({
      where: { sentAt: null, chatId: { in: rows.map((r) => r.chatId) } },
    });
  }

  // Тех, у кого ответ уже собран после их последней реплики, пропускаем:
  // повторный разбор стоит денег и даёт то же самое.
  const todo: typeof rows = [];
  let already = 0;
  for (const r of rows) {
    if (await readySuggestion(r.chatId)) {
      already += 1;
      continue;
    }
    if (todo.length >= BATCH) continue;
    todo.push(r);
  }

  if (!todo.length) {
    return NextResponse.json({ ok: true, prepared: 0, already, left: 0 });
  }

  // Первый разбор идёт отдельно и прогревает кэш базы: если запустить все
  // разом, они стартуют до того, как кэш записан, и каждый платит полную цену.
  const head = todo.shift();
  const first = head ? [await one(head)] : [];

  const done = [...first, ...(await Promise.all(todo.map(one)))];

  async function one(r: (typeof rows)[number]) {
      try {
        const thread = await threadOf(r.chatId, 60);
        if (!thread.length) return false;

        const lead = await leadOfChat(r.chatId, r.username);
        const rendered = thread
          .map((m) => {
            const when = m.createdAt.toISOString().slice(0, 16).replace('T', ' ');
            return `[${when}] ${m.side === 'client' ? 'ЧЕЛОВЕК' : 'МЫ'}: ${m.text}`;
          })
          .join('\n');

        const step = await suggestFromThread({
          about: [
            r.username ? `ник: @${r.username}` : null,
            r.name ? `имя в телеграме: ${r.name}` : null,
            'канал: личка в телеграме, не инстаграм',
            await describeAccess(r.chatId),
            describePayment(await awaitingPayment(r.chatId)),
            describeLead(lead),
          ]
            .filter(Boolean)
            .join('\n'),
          rendered,
          waitingSeconds: r.waitingSeconds,
          theirMove: theirMove(r.lastText),
        });

        if (!step.message) return false;
        await prisma.tgSuggestion.create({
          data: {
            id: randomUUID(),
            connId: '',
            chatId: r.chatId,
            text: step.message,
            why: step.why,
            stage: step.stage,
            callSasha: step.callSasha,
            sell: step.sell,
            plan: step.plan,
          },
        });
        return true;
      } catch (e) {
        console.error('[sales-prepare] не собрался шаг', r.chatId, e);
        return false;
      }
  }

  const prepared = done.filter(Boolean).length;
  return NextResponse.json({
    ok: true,
    prepared,
    already,
    failed: done.length - prepared,
    // Осталось без ответа: у кого не было и кого не взяли в этот заход.
    left: Math.max(0, rows.length - already - prepared),
  });
}
