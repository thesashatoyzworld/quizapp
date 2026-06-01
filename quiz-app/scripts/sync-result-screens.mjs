// Синк result-экранов квиза «Разрешение быстрых денег» из GSD-BRAND в public/.
// Источник правды — у Саши в GSD-BRAND. Перед деплоем гоняем этот скрипт,
// чтобы /r/result-<slug>.html и /screenshots/* в quiz-app были свежими.
//
// Запуск:  node scripts/sync-result-screens.mjs
import { mkdirSync, copyFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, '../../../GSD-BRAND/clients/sasha/04-offers/mk-razreshenie-deneg/leadmagnet');
const SRC_SHOTS = join(here, '../../../GSD-BRAND/clients/sasha/04-offers/mk-razreshenie-deneg/screenshots');
const OUT_R = join(here, '../public/r');
const OUT_SHOTS = join(here, '../public/screenshots');

if (!existsSync(SRC)) {
  console.error('Не найден источник result-экранов:', SRC);
  process.exit(1);
}

mkdirSync(OUT_R, { recursive: true });
mkdirSync(OUT_SHOTS, { recursive: true });

let n = 0;
for (const f of readdirSync(SRC)) {
  if (/^result-.+\.html$/.test(f)) {
    copyFileSync(join(SRC, f), join(OUT_R, f));
    n++;
  }
}

let s = 0;
if (existsSync(SRC_SHOTS)) {
  for (const f of readdirSync(SRC_SHOTS)) {
    copyFileSync(join(SRC_SHOTS, f), join(OUT_SHOTS, f));
    s++;
  }
}

console.log(`Синк готов: ${n} result-экранов → public/r/, ${s} скриншотов → public/screenshots/`);
