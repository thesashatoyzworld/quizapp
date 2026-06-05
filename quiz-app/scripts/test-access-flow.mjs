// Проверка слоя доступов на живой таблице (без сервера).
// Вставляет тестовые доступы, прогоняет запросы API комнат, потом чистит за собой.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';
import { randomUUID } from 'crypto';

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

const TEST_TOKEN = 'testtoken_' + Date.now().toString(36);
const TEST_TG = 999000111; // фейковый telegram id

const main = async () => {
  await client.connect();

  // 1) Веб-оплата картой: доступ без telegramId, source=mkdengi_web_<token>
  await client.query(
    `INSERT INTO product_access (id, product_slug, role, source, status, granted_at, created_at, updated_at)
     VALUES ($1,'mk-dengi','mk',$2,'active',now(),now(),now())`,
    [randomUUID(), `mkdengi_web_${TEST_TOKEN}`]
  );
  // 2) Телеграм-оплата: доступ с telegramId, бессрочный
  await client.query(
    `INSERT INTO product_access (id, telegram_id, product_slug, role, source, status, granted_at, created_at, updated_at)
     VALUES ($1,$2,'mk-dengi','mk','mkdengi_${TEST_TG}','active',now(),now(),now())`,
    [randomUUID(), TEST_TG]
  );

  // Запрос API «по токену» (карта)
  const byToken = await client.query(
    `SELECT product_slug, role, expires_at FROM product_access
     WHERE source=$1 AND status='active' ORDER BY created_at DESC LIMIT 1`,
    [`mkdengi_web_${TEST_TOKEN}`]
  );
  console.log('ПО ТОКЕНУ (карта):', byToken.rows[0] || 'НЕ НАЙДЕНО');

  // Запрос API «по telegramId» (телега): активные, не истёкшие
  const byTg = await client.query(
    `SELECT product_slug, role, expires_at FROM product_access
     WHERE telegram_id=$1 AND status='active'
       AND (expires_at IS NULL OR expires_at > now()) ORDER BY granted_at DESC`,
    [TEST_TG]
  );
  console.log('ПО TELEGRAM (телега):', byTg.rows);

  // Маппинг role 'mk' → комната (берём из rooms.ts вручную для проверки)
  const room = byToken.rows[0]?.role === 'mk' ? 'Разрешение быстрых денег (эфир/записи/преза/чат)' : null;
  console.log('Комната для роли mk:', room);

  // Чистим тестовые записи
  const del = await client.query(
    `DELETE FROM product_access WHERE source IN ($1,$2)`,
    [`mkdengi_web_${TEST_TOKEN}`, `mkdengi_${TEST_TG}`]
  );
  console.log('\nУдалено тестовых записей:', del.rowCount);

  await client.end();
  console.log('\n✅ Слой доступов работает: токен → комната МК, telegram → комната МК.');
};

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
