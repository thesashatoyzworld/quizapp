import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { suggestFromThread } from '@/lib/sales/answer';
import { findLead, describeLead } from '@/lib/sales/tg';
import { waiting, threadOf, readySuggestion } from '@/lib/sales/dialogs';

// Собрать ответы сразу всем, кто ждёт.
//
// Когда очередь накопилась за сутки, открывать одиннадцать человек и на
// каждом ждать по минуте — час работы. Здесь разбор идёт разом: к моменту,
// когда Саша дойдёт до третьего, у всех уже готов текст.
export const maxDuration = 300;

/** Сколько разбираем за один заход. Разбор идёт параллельно, но не бесконечно. */
const BATCH = 12;

export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await waiting();

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

  const done = await Promise.all(
    todo.map(async (r) => {
      try {
        const thread = await threadOf(r.chatId, 60);
        if (!thread.length) return false;

        const lead = await findLead('', r.username);
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
            describeLead(lead),
          ]
            .filter(Boolean)
            .join('\n'),
          rendered,
          waitingSeconds: r.waitingSeconds,
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
          },
        });
        return true;
      } catch (e) {
        console.error('[sales-prepare] не собрался шаг', r.chatId, e);
        return false;
      }
    }),
  );

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
