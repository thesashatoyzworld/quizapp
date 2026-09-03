import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { suggestFromThread } from '@/lib/sales/answer';
import { findLead, describeLead } from '@/lib/sales/tg';
import { threadOf, readySuggestion } from '@/lib/sales/dialogs';
import { randomUUID } from 'node:crypto';

// Собрать следующий шаг по переписке — по кнопке в кабинете, а не на каждое
// входящее.
//
// Так и задумано: разбор занимает около минуты, а вебхуку телеграма отведено
// шестьдесят секунд. Пока подсказка собиралась внутри вебхука, на длинных
// тредах она не рождалась вовсе — молчание случалось ровно там, где шёл
// живой разговор о деньгах. Здесь время не поджимает.
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { chatId, another, steer } = await request.json();
  if (!chatId || typeof chatId !== 'string') {
    return NextResponse.json({ error: 'chatId обязателен' }, { status: 400 });
  }

  // Ответ мог быть собран заранее пачкой — тогда отдаём его сразу, вместо
  // того чтобы заставлять ждать минуту второй раз. Кнопка «другой» этот
  // короткий путь пропускает намеренно.
  // Заданное направление — всегда новый разбор: готовый ответ собран без него.
  if (!another && !steer) {
    const ready = await readySuggestion(chatId);
    if (ready) {
      const { id: _id, ...step } = ready;
      void _id;
      return NextResponse.json({ ok: true, cached: true, step });
    }
  }

  const rows = await threadOf(chatId, 60);
  if (!rows.length) return NextResponse.json({ error: 'переписки нет' }, { status: 404 });

  const last = await prisma.tgBusinessMsg.findFirst({
    where: { chatId },
    orderBy: { createdAt: 'desc' },
    select: { username: true, name: true },
  });
  const lead = await findLead('', last?.username ?? null);

  const rendered = rows
    .map((r) => {
      const when = r.createdAt.toISOString().slice(0, 16).replace('T', ' ');
      return `[${when}] ${r.side === 'client' ? 'ЧЕЛОВЕК' : 'МЫ'}: ${r.text}`;
    })
    .join('\n');

  const step = await suggestFromThread({
    about: [
      last?.username ? `ник: @${last.username}` : null,
      last?.name ? `имя в телеграме: ${last.name}` : null,
      'канал: личка в телеграме, не инстаграм',
      another ? 'предыдущий вариант не подошёл — дай другой ход, не переписывай тот же' : null,
      describeLead(lead),
    ]
      .filter(Boolean)
      .join('\n'),
    rendered,
    steer: typeof steer === 'string' && steer.trim() ? steer.trim().slice(0, 500) : null,
  });

  // Кладём в базу: если Саша ушёл со страницы и вернулся, ответ уже готов.
  if (step.message) {
    await prisma.tgSuggestion.create({
      data: {
        id: randomUUID(),
        connId: '',
        chatId,
        text: step.message,
        why: step.why,
        stage: step.stage,
        callSasha: step.callSasha,
      },
    });
  }

  return NextResponse.json({ ok: true, step });
}
