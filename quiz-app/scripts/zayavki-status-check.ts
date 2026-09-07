// Куда автомат имеет право двигать статус заявки, а куда не лезет.
//
// Правило одно: машина ставит только то, что видно из базы, и только вперёд.
// Всё, что решил человек — созвон, клиент, отказ — она не отменяет.
import { decideStatus, type LeadFacts } from '../src/lib/zayavki/decide-status';
import type { LeadStatus } from '../src/content/lead-status';

const NOBODY: LeadFacts = { weWrote: false, theyReplied: false, paid: false };
const WROTE: LeadFacts = { weWrote: true, theyReplied: false, paid: false };
const REPLIED: LeadFacts = { weWrote: true, theyReplied: true, paid: false };
const PAID: LeadFacts = { weWrote: true, theyReplied: true, paid: true };

const CASES: [string, LeadStatus, LeadFacts, LeadStatus | null][] = [
  ['переписки нет — статус не трогаем', 'new', NOBODY, null],
  ['написали первыми', 'new', WROTE, 'written'],
  ['ответил, а статус ещё новая — сразу через ступень', 'new', REPLIED, 'replied'],
  ['ответил после нашего', 'written', REPLIED, 'replied'],
  ['оплатил', 'replied', PAID, 'client'],
  ['оплатил, а статус ещё новая', 'new', PAID, 'client'],

  ['то же самое второй раз — писать нечего', 'written', WROTE, null],
  ['ответил и снова ответил', 'replied', REPLIED, null],

  // Назад не ходим: человек мог ответить, а потом мы написали последними —
  // это не повод откатывать «ответил» обратно в «написал».
  ['мы написали последними после его ответа', 'replied', WROTE, null],

  // Решения человека машина не трогает вовсе.
  ['созвон назначен руками', 'call', REPLIED, null],
  ['клиент отмечен руками', 'client', REPLIED, null],
  ['отказ отмечен руками', 'rejected', REPLIED, null],
  ['отказался, но потом оплатил — решает Саша', 'rejected', PAID, null],
];

let bad = 0;
for (const [name, current, facts, want] of CASES) {
  const got = decideStatus(current, facts);
  if (got !== want) {
    bad++;
    console.log(`ХОТЕЛИ ${want}, ПОЛУЧИЛИ ${got}: ${name} (было «${current}»)`);
  }
}
console.log(bad === 0 ? `все ${CASES.length} случая разобраны верно` : `ошибок: ${bad}`);
process.exit(bad === 0 ? 0 : 1);
