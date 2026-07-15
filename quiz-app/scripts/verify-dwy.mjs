// Сквозная проверка /api/dwy-lead. Подписывает payload ровно так же, как Telegram,
// и бьёт в живой роут — проверяет всю цепочку: подпись → валидация → база → уведомление.
//
// Запуск (dev-сервер должен быть поднят):
//   node --env-file=.env.local scripts/verify-dwy.mjs
//   node --env-file=.env.local scripts/verify-dwy.mjs --bad-hash      // ждём 401
//   node --env-file=.env.local scripts/verify-dwy.mjs --no-username   // ждём 400
import crypto from 'node:crypto';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) { console.error('BOT_TOKEN не задан'); process.exit(1); }

const BASE = process.env.DWY_BASE || 'http://localhost:3000';
const badHash = process.argv.includes('--bad-hash');
const noUsername = process.argv.includes('--no-username');

const auth = {
  id: 788334680,
  first_name: 'Проверка',
  auth_date: Math.floor(Date.now() / 1000),
};
if (!noUsername) auth.username = 'dwy_probe';

// Как в src/lib/telegram-login.ts: secret = SHA256(token),
// hash = HMAC-SHA256(data-check-string, secret).
const checkString = Object.keys(auth).sort().map((k) => `${k}=${auth[k]}`).join('\n');
const secret = crypto.createHash('sha256').update(BOT_TOKEN).digest();
auth.hash = badHash
  ? 'de4db33f'.repeat(8)
  : crypto.createHmac('sha256', secret).update(checkString).digest('hex');

const res = await fetch(`${BASE}/api/dwy-lead`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    auth,
    source: 'verify-script',
    answers: {
      who: 'эксперт',
      hasProduct: 'да',
      product: 'консультации',
      level: 3,
      tried: 'снимал рилсы полгода, охваты встали',
      want: 'стабильный поток заявок из контента',
      income: '150–500к',
      hours: '5–10 часов',
      contact: '',
    },
  }),
});

const expected = badHash ? 401 : noUsername ? 400 : 200;
const body = await res.text();
console.log('status:', res.status, body);
console.log(res.status === expected ? `OK (ждали ${expected})` : `ПРОВАЛ: ждали ${expected}`);
process.exit(res.status === expected ? 0 : 1);
