// Seeds «Как пишем карусели» (studio_guide_sections) from scripts/studio-guide-seed.md.
// Idempotent: new sections are inserted, sections nobody edited yet (updated_by = 'seed')
// follow the file, sections edited by Sasha or Danya are never overwritten.
// Every insert or change writes a version (actor 'seed').
//
// Run: node scripts/studio-guide-seed.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import { readFileSync } from 'node:fs';
import pg from 'pg';

const md = readFileSync(new URL('./studio-guide-seed.md', import.meta.url), 'utf8');
const sections = md.split(/^<!-- section: /m).filter((p) => p.trim()).map((part, i) => {
  const m = part.match(/^([a-z0-9-]+) \| (.+?) -->\n([\s\S]*)$/);
  if (!m) throw new Error(`плохой заголовок раздела: ${part.slice(0, 60)}`);
  return { slug: m[1], title: m[2].trim(), body: m[3].trim(), sort: (i + 1) * 10 };
});

const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
for (const s of sections) {
  const { rows } = await client.query('SELECT title, body, updated_by FROM studio_guide_sections WHERE slug = $1', [s.slug]);
  const row = rows[0];
  let action = 'без изменений';
  if (!row) {
    await client.query('INSERT INTO studio_guide_sections (slug, title, body, sort, updated_by) VALUES ($1, $2, $3, $4, $5)', [s.slug, s.title, s.body, s.sort, 'seed']);
    action = 'добавлен';
  } else if (row.updated_by !== 'seed') {
    action = `правил ${row.updated_by}, не трогаю`;
  } else if (row.title !== s.title || row.body !== s.body) {
    await client.query('UPDATE studio_guide_sections SET title = $2, body = $3, sort = $4, updated_at = CURRENT_TIMESTAMP WHERE slug = $1', [s.slug, s.title, s.body, s.sort]);
    action = 'обновлён из файла';
  }
  if (action === 'добавлен' || action === 'обновлён из файла') {
    await client.query('INSERT INTO studio_guide_versions (slug, title, body, actor, note) VALUES ($1, $2, $3, $4, $5)', [s.slug, s.title, s.body, 'seed', 'исходная версия']);
  }
  console.log(`${s.slug.padEnd(10)} ${s.title}: ${action}`);
}
await client.end();
