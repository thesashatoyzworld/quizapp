// Прогон расшифровки на локальном файле. Ничего никуда не отправляет.
//
// npx tsx scripts/transcribe-test.mts <путь к файлу> [провайдер]
//
// Провайдер вторым аргументом перебивает TRANSCRIBE_PROVIDER из .env.local:
// так проверяется запасной путь, не трогая настройки.
import { config } from 'dotenv';
config({ path: '.env.local' });
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('нужен путь к аудиофайлу');
  if (process.argv[3]) process.env.TRANSCRIBE_PROVIDER = process.argv[3];

  const { transcribeAudio, currentProvider } = await import('../src/lib/transcribe');
  const buffer = fs.readFileSync(file);

  const t0 = Date.now();
  const text = await transcribeAudio(buffer, path.basename(file));

  console.log(`провайдер: ${currentProvider()}`);
  console.log(`${Math.round((Date.now() - t0) / 1000)} c, ${text.length} символов\n`);
  console.log(text);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
