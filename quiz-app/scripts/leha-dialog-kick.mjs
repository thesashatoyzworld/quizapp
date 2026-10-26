// Пнуть Лёху в диалоге: ответить в чате прямо сейчас.
//
//   node scripts/leha-dialog-kick.mjs <chat_id>            ответить на висящее сообщение
//   node scripts/leha-dialog-kick.mjs <chat_id> --resume   включить снова после «Саша написал сам»
//
// Чат должен быть в LEHA_DIALOG_CHATS на Vercel, иначе задача ничего не сделает.
// Скрипт заводит строку в leha_dialog, ставит ответ на «сейчас» и кладёт задачу
// в QStash на /api/leha. Дальше всё как обычно: рабочие часы, LEHA_MODE, проверки.
//
// Нужны в .env.local: DATABASE_URL (или DIRECT_URL), QSTASH_TOKEN,
// NEXT_PUBLIC_WEBAPP_URL. Другой файл: ENV_FILE=../path/.env.local
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE || '.env.local' });
import pg from 'pg';
import { Client as QStash } from '@upstash/qstash';

const chatId = (process.argv[2] || '').trim();
const resume = process.argv.includes('--resume');
if (!/^\d+$/.test(chatId)) {
  console.error('нужен chat_id: node scripts/leha-dialog-kick.mjs 450843326 [--resume]');
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_WEBAPP_URL;
if (!url || !process.env.QSTASH_TOKEN) {
  console.error('нет NEXT_PUBLIC_WEBAPP_URL или QSTASH_TOKEN в env');
  process.exit(1);
}

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

// Время в базе без пояса, это UTC: пишем now() в UTC явно.
const NOW = `(now() AT TIME ZONE 'UTC')`;
const last = await db.query(
  `SELECT username, name, lead_id FROM tg_business_msg WHERE chat_id = $1 ORDER BY created_at DESC LIMIT 1`,
  [chatId],
);
const known = last.rows[0] || {};
const lead = await db.query(
  `SELECT lead_id FROM tg_business_msg WHERE chat_id = $1 AND lead_id IS NOT NULL ORDER BY created_at DESC LIMIT 1`,
  [chatId],
);

const row = await db.query(
  `INSERT INTO leha_dialog (chat_id, lead_id, username, name, status, due_at, enabled_at, created_at, updated_at)
   VALUES ($1, $2, $3, $4, 'active', ${NOW}, ${NOW}, ${NOW}, ${NOW})
   ON CONFLICT (chat_id) DO UPDATE SET
     due_at = ${NOW},
     updated_at = ${NOW},
     status = CASE WHEN $5 OR leha_dialog.status IN ('active', 'composing') THEN 'active' ELSE leha_dialog.status END,
     stop_reason = CASE WHEN $5 THEN NULL ELSE leha_dialog.stop_reason END,
     enabled_at = CASE WHEN $5 THEN ${NOW} ELSE leha_dialog.enabled_at END
   RETURNING status, enabled_at`,
  [chatId, lead.rows[0]?.lead_id ?? null, known.username ?? null, known.name ?? null, resume],
);
await db.end();

const { status } = row.rows[0];
if (status !== 'active') {
  console.log(`статус ${status}: Лёха в этом чате ждёт Сашу. Включить: добавь --resume`);
  process.exit(0);
}

const qstash = new QStash({ token: process.env.QSTASH_TOKEN });
await qstash.publishJSON({ url: `${url}/api/leha`, body: { dialogChatId: chatId }, retries: 1 });
console.log(`ок: задача ушла, Лёха ответит в чате ${known.username ? '@' + known.username : chatId} в ближайшую минуту (если 9:00-21:00 по Алмате)`);
