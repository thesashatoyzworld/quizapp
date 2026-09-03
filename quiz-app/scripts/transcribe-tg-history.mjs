// Расшифровывает голосовые, приехавшие из выгрузки Telegram Desktop.
//
// Запуск: node scripts/transcribe-tg-history.mjs [--chat <id>] [--limit N] [--dry]
//
// Импорт (scripts/import-tg-export.mjs) кладёт голосовые заглушкой и держит
// путь к файлу в media_ref. Здесь заглушка меняется на слова: у Кристины,
// например, три из пяти ключевых реплик были наговорены, и без них помощник
// читал переписку с дырками ровно там, где человек объяснял, чего хочет.
//
// Движок тот же, что у живых голосовых, — ElevenLabs Scribe. Локальный whisper
// дешевле, но качество у него заметно ниже, а разъезжаться историей и живым
// потоком нельзя: помощник читает их одним куском.
import { config } from 'dotenv';
config({ path: '.env.local' });
import fs from 'node:fs';
import pg from 'pg';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const chat = (() => {
  const i = args.indexOf('--chat');
  return i >= 0 ? args[i + 1] : null;
})();
const limit = (() => {
  const i = args.indexOf('--limit');
  return i >= 0 ? Number(args[i + 1]) : 200;
})();

const key = (process.env.ELEVENLABS_API_KEY || '').trim();
if (!key) {
  console.error('Нет ELEVENLABS_API_KEY в .env.local');
  process.exit(1);
}

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

// Берём только те, что пришли из выгрузки: у живых в media_ref лежит file_id
// телеграма, их разбирает сам обработчик в момент получения.
const rows = (
  await db.query(
    `SELECT id, chat_id, media_ref, text, created_at
       FROM tg_business_msg
      WHERE media_type = 'voice'
        AND media_ref LIKE '%/%'
        AND text LIKE '[голосовое%'
        ${chat ? 'AND chat_id = $2' : ''}
      ORDER BY created_at
      LIMIT $1`,
    chat ? [limit, chat] : [limit],
  )
).rows;

if (!rows.length) {
  console.log('Нерасшифрованных голосовых из выгрузки нет.');
  await db.end();
  process.exit(0);
}
console.log(`Нерасшифрованных: ${rows.length}`);

async function scribe(file) {
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(file)], { type: 'audio/ogg' }), file.split('/').pop());
  form.append('model_id', (process.env.ELEVENLABS_STT_MODEL || 'scribe_v2').trim());
  form.append('language_code', 'rus');
  form.append('tag_audio_events', 'false');
  form.append('diarize', 'false');

  const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': key },
    body: form,
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
  return ((await res.json()).text || '').trim();
}

let done = 0;
let missing = 0;
for (const r of rows) {
  if (!fs.existsSync(r.media_ref)) {
    // Выгрузку могли уже удалить: заглушку оставляем как есть, чтобы дырка
    // в переписке была видна, а не выглядела молчанием.
    console.log(`  нет файла: ${r.media_ref}`);
    missing += 1;
    continue;
  }
  try {
    const text = await scribe(r.media_ref);
    if (!text) {
      console.log(`  пусто: ${r.id}`);
      continue;
    }
    console.log(`  ${r.id}: ${text.slice(0, 110)}${text.length > 110 ? '…' : ''}`);
    if (!dry) await db.query('UPDATE tg_business_msg SET text = $2 WHERE id = $1', [r.id, text]);
    done += 1;
  } catch (e) {
    console.error(`  упало на ${r.id}:`, e.message);
  }
}

console.log(
  dry
    ? `\n--dry: расшифровал ${done}, ничего не записал.`
    : `\nРасшифровано ${done}${missing ? `, файлов не нашлось ${missing}` : ''}.`,
);
await db.end();
