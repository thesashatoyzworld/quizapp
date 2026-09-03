import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { suggestFromThread } from '@/lib/sales/answer';
import { findLead, describeLead } from '@/lib/sales/tg';
import { threadOf } from '@/lib/sales/dialogs';

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

  const { chatId, another } = await request.json();
  if (!chatId || typeof chatId !== 'string') {
    return NextResponse.json({ error: 'chatId обязателен' }, { status: 400 });
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
  });

  return NextResponse.json({ ok: true, step });
}
