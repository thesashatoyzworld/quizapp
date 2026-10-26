/**
 * Телеграм для Лёхи: личка Саши с ботом, куда идут черновики и карточки.
 * Общий кусок первого сообщения (run.ts) и диалога (dialog.ts).
 */

const BOT_TOKEN = process.env.BOT_TOKEN;

/** Куда слать черновики: личка Саши с ботом. */
export function lehaChatId(): string {
  return (process.env.LEHA_CHAT_ID || process.env.ADMIN_CHAT_ID || '').trim();
}

export function isLehaAdmin(chatId: number | string): boolean {
  return [lehaChatId(), process.env.ADMIN_CHAT_ID, process.env.ADMIN_CHAT_ID_WORK]
    .map((v) => (v || '').trim())
    .filter(Boolean)
    .includes(String(chatId));
}

export async function tg(method: string, body: object): Promise<{ ok: boolean; result?: { message_id?: number }; description?: string }> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) console.error(`[leha] ${method}: ${data.error_code} ${data.description}`);
    return data;
  } catch (e) {
    console.error(`[leha] ${method} упал`, e);
    return { ok: false };
  }
}

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Кнопка-заглушка вместо решённых: видно, чем кончилось. */
export const done = (label: string) => ({ inline_keyboard: [[{ text: label, callback_data: 'noop' }]] });
