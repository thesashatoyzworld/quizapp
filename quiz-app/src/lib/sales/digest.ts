import { prisma } from '@/lib/prisma';
import { sendBotMessage, editBotMessageText } from '@/lib/telegram';
import { waiting, waited, heat, type WaitingRow } from './dialogs';
import { helpers } from './tg';

// Очередь личек одним сообщением в телеграме.
//
// Подсказка на каждое входящее превращала чат в кашу: человек пишет очередью
// из пяти реплик, а в ответ прилетает двадцать сообщений вперемешку с чужими
// разговорами. Теперь бот держит одну сводку и правит её на месте, а работа
// идёт в кабинете, на странице человека.

/**
 * Как долго правим одно и то же сообщение. Дальше шлём новое: сводка,
 * уехавшая вверх на сотню сообщений, всё равно не видна.
 */
const REUSE_MINUTES = 45;

function base(): string {
  return (process.env.NEXT_PUBLIC_CABINET_URL || 'https://world.thesashatoyz.com').replace(/\/$/, '');
}

/**
 * Кого нельзя проморгать: доход от 150к — это верх лестницы, а 500к+ —
 * единственный фильтр на «Делаем за вас».
 *
 * ⚠️ Сравниваем по началу строки, а не по вхождению: «50–150к» тоже содержит
 * «150», и по подстроке молния горела бы у половины списка.
 */
function rich(income: string | null): boolean {
  const v = (income || '').trim();
  return v.startsWith('150') || v.startsWith('500');
}

function line(r: WaitingRow): string {
  const mark = heat(r) === 'hot' ? '🔴' : heat(r) === 'warm' ? '🟡' : '🟢';
  const who = r.name || (r.username ? `@${r.username}` : 'без имени');
  const link = r.leadId ? `${base()}/admin/zayavki/${r.leadId}` : `${base()}/admin/dialogi/${r.chatId}`;
  const tail = [
    waited(r.waitingSeconds),
    r.unanswered > 1 ? `${r.unanswered} сообщения` : null,
    rich(r.income) ? `⚡ ${r.income}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return `${mark} <a href="${link}">${who}</a> — ${tail}`;
}

export function digestText(rows: WaitingRow[]): string {
  if (!rows.length) return 'Все отвечены.';

  const hot = rows.filter((r) => heat(r) === 'hot').length;
  const head = `<b>Ждут ответа: ${rows.length}</b>${hot ? `, дольше четырёх часов — ${hot}` : ''}`;

  // Сверху те, кто ждёт дольше всех: чем дольше молчим, тем меньше шанс
  // вообще довести разговор до продажи.
  const body = rows.slice(0, 12).map(line).join('\n');
  const more = rows.length > 12 ? `\n\n…и ещё ${rows.length - 12}` : '';

  return `${head}\n\n${body}${more}`;
}

/**
 * Показать очередь: обновить существующую сводку или прислать новую.
 *
 * Вызывается на каждое входящее, но сообщений в чате от этого не прибавляется —
 * меняется текст уже отправленного.
 */
export async function pushDigest(): Promise<void> {
  const rows = await waiting();
  const text = digestText(rows);
  const markup = {
    inline_keyboard: [[{ text: 'открыть диалоги', url: `${base()}/admin/dialogi` }]],
  };

  for (const chatId of helpers()) {
    const known = await prisma.tgDigest.findUnique({ where: { chatId: String(chatId) } });
    const fresh =
      known && Date.now() - known.sentAt.getTime() < REUSE_MINUTES * 60 * 1000;

    if (fresh) {
      const ok = await editBotMessageText(chatId, known.messageId, text, markup);
      if (ok) continue;
      // Сообщение удалили или оно слишком старое для правки — шлём новое.
    }

    const sent = await sendBotMessage(chatId, text, markup, 'HTML');
    if (sent.ok && sent.messageId) {
      await prisma.tgDigest.upsert({
        where: { chatId: String(chatId) },
        create: { chatId: String(chatId), messageId: sent.messageId },
        update: { messageId: sent.messageId, sentAt: new Date() },
      });
    }
  }
}
