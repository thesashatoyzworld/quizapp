import { sendBotMessage } from '@/lib/telegram';
import { suggestReply } from './answer';
import { parseHandle } from './parse';

// Ветка бота для помощника в продажах.
//
// Ассистент пишет «@nedosek_coach» или «/w nedosek_coach» — бот сам достаёт
// живую переписку из инста-директа и предлагает, что написать дальше.
// Ответ уходит несколькими сообщениями: каждый вариант отдельно, чтобы его
// можно было скопировать одним нажатием.
//
// Кто имеет доступ: личный и рабочий аккаунты Саши плюс те, кто перечислен
// в SALES_HELPER_CHAT_IDS через запятую (ассистент).

export type SalesAskResult = { handled: boolean; work?: () => Promise<void> };

function allowed(chatId: number | string): boolean {
  const id = String(chatId);
  const ids = [
    process.env.ADMIN_CHAT_ID,
    process.env.ADMIN_CHAT_ID_WORK,
    ...(process.env.SALES_HELPER_CHAT_IDS || '').split(','),
  ]
    .map((v) => (v || '').trim())
    .filter(Boolean);
  return ids.includes(id);
}

export async function handleSalesQuestion(params: {
  chatId: number;
  text: string;
}): Promise<SalesAskResult> {
  const { chatId, text } = params;
  if (!allowed(chatId)) return { handled: false };

  const handle = parseHandle(text);
  if (!handle) return { handled: false };

  // Переписка и модель занимают около минуты — держать вебхук столько нельзя.
  // Отвечаем Телеграму сразу, работу отдаём наружу, в after().
  await sendBotMessage(chatId, `смотрю переписку с @${handle}…`, undefined, null);

  const work = async () => {
    try {
      const res = await suggestReply(handle);

      if (!res.found) {
        await sendBotMessage(
          chatId,
          `не нашёл @${handle} в инста-директе\n\n` +
            'проверь ник, либо человек писал давно и выпал из свежих чатов',
          undefined,
          null,
        );
        return;
      }

      const last = res.thread?.messages[res.thread.messages.length - 1];
      const head = [
        `${res.who}${res.waiting ? ` · ждёт ${res.waiting}` : ''}`,
        last ? `\nпоследнее: ${last.side === 'client' ? '' : '(наше) '}${(last.message || '').slice(0, 300)}` : '',
      ].join('');
      await sendBotMessage(chatId, head, undefined, null);

      for (const [i, v] of res.variants.entries()) {
        await sendBotMessage(chatId, `${i + 1}. ${v.text}\n\n— ${v.why}`, undefined, null);
      }

      if (res.callSasha) {
        await sendBotMessage(chatId, `здесь нужен Саша: ${res.callSasha}`, undefined, null);
      }
    } catch (e) {
      console.error('[sales] ошибка ветки помощника:', e);
      await sendBotMessage(chatId, `не смог собрать ответ по @${handle}: ${String(e).slice(0, 200)}`, undefined, null);
    }
  };

  return { handled: true, work };
}
