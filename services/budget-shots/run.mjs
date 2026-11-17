// Budget screenshot recognizer (VPS). One run = drain the queue:
// take the next pending screenshot from the cabinet, read it with headless
// Claude (CLI on Sasha's subscription, no API key), post the JSON back.
// The cabinet records the expenses itself. Started by zoom-intake on upload
// (POST /budget-shot) and by budget-shots.timer every 15 minutes as a safety net.
//
// Env (/etc/budget-shots.env): CABINET_URL, CRON_SECRET, CLAUDE_CODE_OAUTH_TOKEN,
// optional VERCEL_BYPASS (preview deployments behind protection).
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CABINET = (process.env.CABINET_URL || 'https://world.thesashatoyz.com').replace(/\/$/, '');
const CLAUDE_USER = process.env.BUDGET_CLAUDE_USER || 'uqclaude';
const TIMEOUT_MS = 10 * 60 * 1000;
const PY = process.env.BUDGET_PY || '/opt/budget-shots/venv/bin/python';
const MAX_PER_RUN = 40;

const headers = {
  authorization: `Bearer ${process.env.CRON_SECRET}`,
  'content-type': 'application/json',
  ...(process.env.VERCEL_BYPASS ? { 'x-vercel-protection-bypass': process.env.VERCEL_BYPASS } : {}),
};

async function api(method, body) {
  const res = await fetch(`${CABINET}/api/budget-shots`, { method, headers, body: body && JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${res.status}: ${json.error || ''}`);
  return json;
}

function runClaude(dir, prompt, schema) {
  const home = execFileSync('getent', ['passwd', CLAUDE_USER], { encoding: 'utf8' }).split(':')[5];
  const { uid, gid } = fs.statSync(dir);
  const env = {
    PATH: '/usr/local/bin:/usr/bin:/bin', HOME: home, USER: CLAUDE_USER, LANG: 'C.UTF-8',
    CLAUDE_CODE_OAUTH_TOKEN: process.env.CLAUDE_CODE_OAUTH_TOKEN, FORCE_COLOR: '0',
  };
  const args = ['-p', prompt, '--output-format', 'json', '--json-schema', JSON.stringify(schema),
    '--tools', 'Read', '--allowedTools', 'Read'];
  return new Promise((resolve, reject) => {
    const p = spawn('claude', args, { cwd: dir, env, uid, gid, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { err += d; });
    const timer = setTimeout(() => { p.kill('SIGTERM'); reject(new Error('распознавание не уложилось в 10 минут')); }, TIMEOUT_MS);
    p.on('error', (e) => { clearTimeout(timer); reject(e); });
    p.on('close', (code) => {
      clearTimeout(timer);
      try {
        const r = JSON.parse(out);
        if (r.is_error || !r.structured_output) throw new Error(String(r.result || r.subtype || 'нет ответа').slice(0, 300));
        resolve(r.structured_output);
      } catch (e) {
        reject(new Error(code ? `claude exit ${code}: ${(err || out).slice(0, 300)}` : e.message));
      }
    });
  });
}

for (let n = 0; n < MAX_PER_RUN; n++) {
  const { prompt, schema, shots } = await api('GET');
  const shot = shots?.[0];
  if (!shot) break;
  const m = /^data:(image\/(\w+)|application\/pdf);base64,(.+)$/s.exec(shot.image);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'budget-shot-'));
  try {
    if (!m) throw new Error('битый файл');
    let file;
    if (m[1] === 'application/pdf') {
      // Statements: give Claude the text layer, it is exact and cheap to read.
      const pdf = path.join(dir, 'statement.pdf');
      fs.writeFileSync(pdf, Buffer.from(m[3], 'base64'));
      const text = execFileSync(PY, ['-c', 'import pymupdf,sys\nprint("\\n".join(p.get_text() for p in pymupdf.open(sys.argv[1])))', pdf],
        { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
      if (!text.trim()) throw new Error('в PDF нет текста, пришли скрин');
      file = path.join(dir, 'statement.txt');
      fs.writeFileSync(file, text);
    } else {
      file = path.join(dir, `shot.${m[2] === 'jpeg' ? 'jpg' : m[2]}`);
      fs.writeFileSync(file, Buffer.from(m[3], 'base64'));
    }
    execFileSync('chown', ['-R', `${CLAUDE_USER}:`, dir]);
    const output = await runClaude(dir, prompt.replaceAll('{{FILE}}', file), schema);
    const r = await api('POST', { id: shot.id, output });
    console.log(new Date().toISOString(), shot.id, JSON.stringify({ added: r.result?.added, duplicates: r.result?.duplicates, skipped: r.result?.skipped }));
  } catch (e) {
    console.error(new Date().toISOString(), shot.id, e.message);
    await api('POST', { id: shot.id, error: e.message }).catch((x) => console.error('report failed', x.message));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
