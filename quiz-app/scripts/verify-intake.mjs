// Сквозная проверка анкеты тарифа 3: гейт → вопросы → ответы → досье.
//
// Бьёт по реальному /api/telegram-webhook теми же апдейтами, что шлёт Telegram,
// и сверяет результат по базе. Сообщения в Telegram при этом реально уходят,
// поэтому телефоны берём несуществующие: BOT_TOKEN отдаст 403 «chat not found»,
// а логика анкеты отработает целиком.
//
// Запуск (dev-сервер поднят):
//   node --env-file=.env.local scripts/verify-intake.mjs

import pg from 'pg';

const BASE = process.env.INTAKE_BASE || 'http://localhost:3000';
const HOOK = `${BASE}/api/telegram-webhook`;

// Заведомо несуществующие id: диалога с ботом у них нет.
const TG_WITH_ACCESS = 999000001;
const TG_NO_ACCESS = 999000002;

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const from = (id) => ({ id, first_name: 'Проверка', username: `probe_${id}` });

// Роут отбивает всё, что пришло без секрета Телеграма (401). Прогон должен
// представляться так же, иначе до анкеты дело не дойдёт.
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

const send = (body) =>
  fetch(HOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(SECRET ? { 'X-Telegram-Bot-Api-Secret-Token': SECRET } : {}),
    },
    body: JSON.stringify(body),
  });

const text = (id, t) => send({ message: { chat: { id }, from: from(id), text: t } });
const voice = (id, fileId, duration = 30) =>
  send({ message: { chat: { id }, from: from(id), voice: { file_id: fileId, duration, file_size: 50000 } } });
const press = (id, data) =>
  send({ callback_query: { id: String(Date.now()), data, from: from(id), message: { chat: { id }, message_id: 1 } } });

const intakeOf = async (tg) =>
  (await db.query('SELECT * FROM intakes WHERE telegram_id = $1', [tg])).rows[0] || null;
const answersOf = async (intakeId) =>
  (await db.query('SELECT * FROM intake_answers WHERE intake_id = $1 ORDER BY created_at', [intakeId])).rows;

let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed++;
  console.log(`${ok ? 'OK    ' : 'ПРОВАЛ'} ${name}${ok || !detail ? '' : ' — ' + detail}`);
};

await db.connect();

// Убираем следы прошлого прогона.
await db.query('DELETE FROM intakes WHERE telegram_id = ANY($1)', [[TG_WITH_ACCESS, TG_NO_ACCESS]]);
await db.query('DELETE FROM product_access WHERE source = $1', ['verify-intake-script']);
await db.query('DELETE FROM users WHERE telegram_id = ANY($1)', [[TG_WITH_ACCESS, TG_NO_ACCESS]]);

// Готовим двоих: одному даём тариф 3, второму нет.
for (const tg of [TG_WITH_ACCESS, TG_NO_ACCESS]) {
  await db.query(
    `INSERT INTO users (id, telegram_id, username, first_name, created_at)
     VALUES (gen_random_uuid(), $1, $2, 'Проверка', now())
     ON CONFLICT (telegram_id) DO NOTHING`,
    [tg, `probe_${tg}`],
  );
}
await db.query(
  `INSERT INTO product_access
     (id, telegram_id, product_slug, role, status, source, period, granted_at, created_at, updated_at)
   VALUES (gen_random_uuid(), $1, 'uroven-t3', 'uroven', 'active', 'verify-intake-script', 'month', now(), now(), now())`,
  [TG_WITH_ACCESS],
);

// 1. Без тарифа 3 анкета не открывается
await text(TG_NO_ACCESS, '/anketa');
check('1. без тарифа 3 — отказ', (await intakeOf(TG_NO_ACCESS)) === null);

// 2. С доступом анкета заводится
await text(TG_WITH_ACCESS, '/anketa');
let intake = await intakeOf(TG_WITH_ACCESS);
check('2. с тарифом 3 — анкета заведена', intake !== null && intake.status === 'invited', intake?.status);

// 3. «погнали» переводит в работу и ставит первый вопрос
await press(TG_WITH_ACCESS, 'intake:start');
intake = await intakeOf(TG_WITH_ACCESS);
check('3. старт — статус in_progress, шаг 0', intake.status === 'in_progress' && intake.current_step === 0,
  `${intake.status}/${intake.current_step}`);

// 4. «дальше» с пустого вопроса не пускает
await press(TG_WITH_ACCESS, 'intake:next');
intake = await intakeOf(TG_WITH_ACCESS);
check('4. «дальше» с пустого вопроса не двигает', intake.current_step === 0, `шаг ${intake.current_step}`);

// 5. Три сообщения на один вопрос копятся в один шаг
await text(TG_WITH_ACCESS, 'первый кусок ответа');
await text(TG_WITH_ACCESS, 'второй кусок');
await text(TG_WITH_ACCESS, 'https://instagram.com/probe');
let answers = await answersOf(intake.id);
check('5. три сообщения — три ответа на шаге 0',
  answers.filter((a) => a.step === 0).length === 3, `${answers.length} шт`);

// 6. Теперь «дальше» двигает
await press(TG_WITH_ACCESS, 'intake:next');
intake = await intakeOf(TG_WITH_ACCESS);
check('6. «дальше» с заполненного — шаг 1', intake.current_step === 1, `шаг ${intake.current_step}`);

// 7. «пропустить» помечает и двигает
await press(TG_WITH_ACCESS, 'intake:skip');
intake = await intakeOf(TG_WITH_ACCESS);
answers = await answersOf(intake.id);
check('7. «пропустить» — отметка и шаг 2',
  intake.current_step === 2 && answers.some((a) => a.step === 1 && a.skipped),
  `шаг ${intake.current_step}`);

// 8. «потом» и возврат по /anketa на то же место
await press(TG_WITH_ACCESS, 'intake:later');
await text(TG_WITH_ACCESS, '/anketa');
intake = await intakeOf(TG_WITH_ACCESS);
check('8. «потом» + /anketa — тот же шаг 2', intake.current_step === 2, `шаг ${intake.current_step}`);

// 9. Голосовое сохраняется с file_id (расшифровка идёт фоном, file_id битый — транскрипта не будет)
await voice(TG_WITH_ACCESS, 'probe-file-id-not-real');
answers = await answersOf(intake.id);
const v = answers.find((a) => a.kind === 'voice');
check('9. голосовое сохранено с file_id', Boolean(v?.file_id), v ? 'есть' : 'нет записи');

// 10. Юзернейм обновляется, если сменился
await db.query('UPDATE users SET username = $1 WHERE telegram_id = $2', ['staryy_hendl', TG_WITH_ACCESS]);
await text(TG_WITH_ACCESS, 'ещё сообщение');
const u = (await db.query('SELECT username FROM users WHERE telegram_id = $1', [TG_WITH_ACCESS])).rows[0];
check('10. протухший юзернейм обновлён', u.username === `probe_${TG_WITH_ACCESS}`, u.username);

// 10a. Сообщение из ГРУППЫ не должно попадать в анкету.
// Бот сидит админом в клиентских группах. Без проверки на приватный чат он
// принимал сообщения оттуда за ответы на вопросы и отвечал прямо в группу.
const beforeGroup = (await answersOf(intake.id)).length;
await send({
  message: {
    chat: { id: -1009000000001, type: 'supergroup' },
    from: from(TG_WITH_ACCESS),
    text: 'обычное рабочее сообщение в группе',
  },
});
const afterGroup = (await answersOf(intake.id)).length;
check('10a. сообщение из группы НЕ попадает в анкету', afterGroup === beforeGroup,
  `было ${beforeGroup}, стало ${afterGroup}`);

// 11. Доходим до конца: анкета закрывается
for (let i = intake.current_step; i < 11; i++) {
  await press(TG_WITH_ACCESS, 'intake:skip');
}
intake = await intakeOf(TG_WITH_ACCESS);
check('11. после 11 вопросов — статус done', intake.status === 'done' && intake.completed_at !== null, intake.status);

// 12. Повторный /anketa на собранной не сбрасывает её
await text(TG_WITH_ACCESS, '/anketa');
intake = await intakeOf(TG_WITH_ACCESS);
check('12. повторный /anketa не сбрасывает собранную', intake.status === 'done', intake.status);

// ── Ссылка, выданная вслепую: человека нет в базе, привязка при переходе ──

const TG_BLIND = 999000003;
const blindFrom = { id: TG_BLIND, first_name: 'Незнакомец', username: 'probe_blind' };

await db.query(`DELETE FROM intakes WHERE label = 'probe-blind' OR telegram_id = $1`, [TG_BLIND]);
await db.query('DELETE FROM users WHERE telegram_id = $1', [TG_BLIND]);

const blindToken = 'probeblindtoken1';
await db.query(
  `INSERT INTO intakes (id, label, status, current_step, invite_token, invited_at, created_at, updated_at)
   VALUES (gen_random_uuid(), 'probe-blind', 'invited', 0, $1, now(), now(), now())`,
  [blindToken],
);

// 13. Анкета существует без telegram_id
let blind = (await db.query('SELECT * FROM intakes WHERE invite_token = $1', [blindToken])).rows[0];
check('13. слепая ссылка заводится без telegram_id', blind.telegram_id === null, String(blind.telegram_id));

// 14. Переход по ссылке привязывает её к тому, кто открыл
await send({ message: { chat: { id: TG_BLIND }, from: blindFrom, text: `/start intake_${blindToken}` } });
blind = (await db.query('SELECT * FROM intakes WHERE invite_token = $1', [blindToken])).rows[0];
check('14. переход по ссылке привязал telegram_id',
  String(blind.telegram_id) === String(TG_BLIND), String(blind.telegram_id));

// 15. Дальше анкета работает как обычная, без гейта по тарифу
await press(TG_BLIND, 'intake:start');
blind = (await db.query('SELECT * FROM intakes WHERE invite_token = $1', [blindToken])).rows[0];
check('15. по ссылке анкета стартует без тарифа в базе', blind.status === 'in_progress', blind.status);

await db.query(`DELETE FROM intakes WHERE label = 'probe-blind' OR telegram_id = $1`, [TG_BLIND]);
await db.query('DELETE FROM users WHERE telegram_id = $1', [TG_BLIND]);

// Уборка
await db.query('DELETE FROM intakes WHERE telegram_id = ANY($1)', [[TG_WITH_ACCESS, TG_NO_ACCESS]]);
await db.query('DELETE FROM product_access WHERE source = $1', ['verify-intake-script']);
await db.query('DELETE FROM users WHERE telegram_id = ANY($1)', [[TG_WITH_ACCESS, TG_NO_ACCESS]]);
await db.end();

console.log(failed ? `\n${failed} проверок провалено` : '\nвсе проверки прошли');
process.exit(failed ? 1 : 0);
