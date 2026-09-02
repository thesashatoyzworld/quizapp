#!/usr/bin/env node
/**
 * Вебхук бота: посмотреть и переставить с секретом.
 *
 *   node scripts/set-webhook.mjs status        # что стоит сейчас
 *   node scripts/set-webhook.mjs gen           # сгенерировать секрет (в env не пишет)
 *   node scripts/set-webhook.mjs set           # поставить URL из env + secret_token
 *   node scripts/set-webhook.mjs set <url>     # то же, но URL руками
 *
 * Берёт BOT_TOKEN и TELEGRAM_WEBHOOK_SECRET из .env.local (или окружения).
 * Секрет должен совпадать с тем, что прописан в Vercel, иначе бот замолчит:
 * роут начнёт отдавать 401 на настоящие апдейты.
 */
import { config } from 'dotenv';
import { randomBytes } from 'node:crypto';

config({ path: '.env.local' });

const TOKEN = process.env.BOT_TOKEN;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const DEFAULT_URL = 'https://quiz.thesashatoyz.com/api/telegram-webhook';

// Что бот слушает. Список явный: без него Телеграм ставит свой набор по
// умолчанию, а он меняется от версии к версии.
//   business_connection — бота подключили к личке рабочего аккаунта
//   business_message    — сообщение в этой личке, разбирает ветка помощника
const ALLOWED = ['message', 'callback_query', 'business_connection', 'business_message'];

if (!TOKEN) {
  console.error('Нет BOT_TOKEN — положи его в .env.local');
  process.exit(1);
}

const api = async (method, body) => {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  return res.json();
};

const [cmd, arg] = process.argv.slice(2);

if (cmd === 'gen') {
  // Телеграм принимает A-Z a-z 0-9 _ - длиной 1-256.
  console.log(randomBytes(24).toString('base64url'));
  process.exit(0);
}

if (cmd === 'status' || !cmd) {
  const info = await api('getWebhookInfo');
  const r = info.result || {};
  console.log('URL:                ', r.url || '(не задан)');
  // Сам секрет Телеграм не показывает. Косвенный признак расхождения:
  // pending_update_count растёт, а в last_error висит 401.
  console.log('Ожидает апдейтов:   ', r.pending_update_count ?? 0);
  console.log('Последняя ошибка:   ', r.last_error_message || '—',
    r.last_error_date ? new Date(r.last_error_date * 1000).toISOString() : '');
  console.log('Секрет локально:    ', SECRET ? `задан (${SECRET.length} симв.)` : 'НЕ ЗАДАН');
  console.log('Слушает:            ', (r.allowed_updates || ['(набор по умолчанию)']).join(', '));
  process.exit(0);
}

if (cmd === 'set') {
  if (!SECRET) {
    console.error('Нет TELEGRAM_WEBHOOK_SECRET в .env.local.');
    console.error('Сгенерируй: node scripts/set-webhook.mjs gen');
    console.error('Пропиши его в .env.local И в Vercel (production, preview, development),');
    console.error('дождись деплоя — и только потом set.');
    process.exit(1);
  }
  const url = arg || DEFAULT_URL;
  const res = await api('setWebhook', {
    url,
    secret_token: SECRET,
    allowed_updates: ALLOWED,
    // Апдейты, накопленные за время раскатки, отбрасывать не надо.
    drop_pending_updates: false,
  });
  console.log(res.ok ? `✅ Вебхук стоит на ${url}, секрет передан` : res);
  process.exit(res.ok ? 0 : 1);
}

console.error(`Неизвестная команда: ${cmd}. Есть status, gen, set.`);
process.exit(1);
