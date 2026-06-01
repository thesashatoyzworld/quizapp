// Показать всех записавшихся в лист ожидания МК «Разрешение быстрых денег».
// Запуск:  node check-moneymk-waitlist.cjs
require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");

(async () => {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const { rows } = await client.query(
    `SELECT telegram_id, username, first_name, last_name, created_at
       FROM money_mk_waitlist
   ORDER BY created_at ASC`
  );
  console.log(`\nЛист ожидания «Разрешение быстрых денег»: ${rows.length} чел.\n`);
  rows.forEach((r, i) => {
    const name = [r.first_name, r.last_name].filter(Boolean).join(" ") || "—";
    const un = r.username ? "@" + r.username : "без username";
    const when = new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ");
    console.log(`${String(i + 1).padStart(3)}. ${name}  ${un}  id:${r.telegram_id}  (${when})`);
  });
  console.log("");
  await client.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
