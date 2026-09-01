// Разбор ников: что бот должен подхватывать, а что пропускать дальше.
import { parseHandle } from '../src/lib/sales/parse';

const CASES: [string | null, string][] = [
  ['nedosek_coach', '@nedosek_coach'],
  ['nedosek_coach', '/w nedosek_coach'],
  ['nedosek_coach', '/w @nedosek_coach'],
  ['who_is_ann', 'что писать @who_is_ann'],
  ['alexshumsky_', '@alexshumsky_ что дальше'],
  [null, 'привет'],
  [null, 'как дела с оплатой курса'],
  [null, 'а что там по тарифу 2, сколько стоит и как оплатить, расскажи подробно пожалуйста'],
  [null, ''],
];

let bad = 0;
for (const [want, text] of CASES) {
  const got = parseHandle(text);
  if (got !== want) { bad++; console.log(`ХОТЕЛИ ${want}, ПОЛУЧИЛИ ${got}: "${text}"`); }
}
console.log(bad === 0 ? `все ${CASES.length} разобраны верно` : `ошибок: ${bad}`);
process.exit(bad === 0 ? 0 : 1);
