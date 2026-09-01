// Собирает базу продаж в модуль, который читает бот.
//
//   node scripts/sales-kb-build.mjs
//
// Документы живут в GSD-BRAND (там их правит Саша), а бот на Vercel до чужой
// папки не дотянется и читать файлы с диска в рантайме тоже не может:
// трассировка Next кладёт в бандл не всё. Поэтому тексты вшиваются в
// src/content/sales-kb/index.ts. Правишь документ — пересобираешь модуль.
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'C:/Users/OTVAJE/Documents/ClaudeCode/Projects/GSD-BRAND/clients/sasha/sales-bot';
const OUT = path.join(process.cwd(), 'src/content/sales-kb/index.ts');

// Библиотека диалогов сюда не входит: 137 тысяч знаков в каждый запрос не
// возят. Она подключается отдельно, когда ассистент просит живой пример.
const DOCS = [
  ['instrukciya', '00-instrukciya-proekta.md', 'Как отвечать: голос, границы, когда звать Сашу'],
  ['produkty', '01-produkty-i-tseny.md', 'Продукты, цены, схемы оплаты. Единственный источник цифр'],
  ['anketa', '02-anketa-komu-pisat.md', 'С чего начинать переписку, кого брать первым, где стоп-линия'],
  ['priemy', '03-zhivye-dialogi.md', 'Разбор приёмов Саши и расшифровки голосовых'],
  ['materialy', '05-materialy.md', 'Что кому отправлять: кейсы, статьи, ссылки с метками'],
];

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

let out = `// СГЕНЕРИРОВАНО scripts/sales-kb-build.mjs — руками не править.
// Источник: GSD-BRAND/clients/sasha/sales-bot/*.md
// Правишь документ там — запусти: node scripts/sales-kb-build.mjs

export type SalesDoc = { id: string; title: string; text: string };

export const SALES_DOCS: SalesDoc[] = [
`;

let total = 0;
for (const [id, file, title] of DOCS) {
  const full = path.join(SRC, file);
  if (!fs.existsSync(full)) {
    console.error(`нет файла: ${full}`);
    process.exit(1);
  }
  const text = fs.readFileSync(full, 'utf8');
  total += text.length;
  out += `  {\n    id: ${JSON.stringify(id)},\n    title: ${JSON.stringify(title)},\n    text: \`${esc(text)}\`,\n  },\n`;
  console.log(`${file.padEnd(30)} ${String(text.length).padStart(7)} знаков`);
}

out += `];

/** Вся база одной строкой — то, что уезжает в промпт помощника. */
export const SALES_KB = SALES_DOCS.map((d) => \`# \${d.title}\\n\\n\${d.text}\`).join('\\n\\n---\\n\\n');
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out, 'utf8');
console.log(`\nитого ${total} знаков → ${path.relative(process.cwd(), OUT)}`);
console.log(`примерно ${Math.round(total / 3.5 / 1000)} тыс. токенов на запрос (с кэшем в десять раз дешевле)`);
