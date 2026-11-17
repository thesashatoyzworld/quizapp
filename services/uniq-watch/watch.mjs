#!/usr/bin/env node
// Uniq bug watcher. Runs on the VPS next to uniq-server: systemd uniq-watch.timer, every 10 minutes (see README.md).
//
// One tick (as root):
//   1. Sasha's taps on «Выкатить» / «Отклонить» (events uniq_fix_decision, written by the bot webhook)
//      → squash the fix branch into master and push (Vercel deploys the cabinet), copy uniq-server files
//      to /opt/uniq-server with a backup, restart, health check, roll back on failure. Or drop the branch.
//   2. New signals: feedback from the /uniq page (events uniq_feedback) and alerts in /var/lib/uniq/log.jsonl.
//   3. Signals found → headless Claude as the unprivileged user uqclaude in a throwaway clone:
//      diagnose, fix, test, commit. Claude has no GitHub key, no database and no write access to the service;
//      the watcher pushes its branch and asks Sasha in @testtoyzbot. Nothing reaches production without his tap.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STATE_DIR = process.env.UNIQ_WATCH_DIR || '/var/lib/uqwatch';
const REPO = process.env.UNIQ_WATCH_REPO || path.join(STATE_DIR, 'quizapp'); // clone with the deploy key (push)
const DEPS = process.env.UNIQ_WATCH_DEPS || '/opt/quizapp/quiz-app'; // node_modules with pg
const SERVICE_DIR = '/opt/uniq-server';
const LOG = process.env.UNIQ_LOG || '/var/lib/uniq/log.jsonl';
const CLAUDE_USER = process.env.UNIQ_WATCH_CLAUDE_USER || 'uqclaude';
const CLAUDE_TIMEOUT_MS = 45 * 60 * 1000;
const MAX_RUNS_PER_DAY = 6;
const IGNORE_ALERTS = /^(queue)$/; // load, not a bug
const GH = 'https://github.com/thesashatoyzworld/quizapp';
const DRY = process.argv.includes('--dry'); // collect and print signals, change nothing

const STATE_FILE = path.join(STATE_DIR, 'state.json');
const LOCK = path.join(STATE_DIR, 'lock');
const pg = createRequire(path.join(DEPS, 'package.json'))('pg');
const BOT = process.env.BOT_TOKEN;
const SASHA = (process.env.ADMIN_CHAT_ID || '788334680').trim();

fs.mkdirSync(STATE_DIR, { recursive: true });
const say = (...a) => console.log(new Date().toISOString(), ...a);

// ---------- small helpers ----------
function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20, ...opts }).trim();
}
const git = (args, cwd = REPO) => sh('git', ['-c', 'safe.directory=*', '-C', cwd, ...args]);

async function db(fn) {
  const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  try { return await fn(c); } finally { await c.end(); }
}

async function tg(text, buttons) {
  if (DRY) { say('TG (dry):', text); return; }
  const body = { chat_id: SASHA, text: text.slice(0, 4000), disable_web_page_preview: true };
  if (buttons) body.reply_markup = { inline_keyboard: buttons };
  const r = await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }).then((x) => x.json()).catch((e) => ({ ok: false, description: e.message }));
  if (!r.ok) say('tg failed:', r.description);
}

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return null; }
}
function saveState(s) {
  fs.writeFileSync(STATE_FILE + '.tmp', JSON.stringify(s, null, 2));
  fs.renameSync(STATE_FILE + '.tmp', STATE_FILE);
}

function lock() {
  try {
    const st = fs.statSync(LOCK);
    if (Date.now() - st.mtimeMs < 2 * 3600 * 1000) return false; // a tick (maybe a long Claude run) is still going
    fs.rmSync(LOCK, { force: true });
  } catch { /* no lock */ }
  fs.writeFileSync(LOCK, String(process.pid));
  return true;
}

// ---------- signals ----------
async function collect(state) {
  const signals = [];
  // Service log: alerts (failed versions, crash, restart mid-job, cabinet unreachable) and failed bot sends.
  const lines = sh('tail', ['-n', '3000', LOG]).split('\n');
  let logT = state.logT;
  for (const l of lines) {
    let e; try { e = JSON.parse(l); } catch { continue; }
    if (!(e.t > state.logT)) continue;
    logT = Math.max(logT, e.t);
    if (e.ev === 'alert' && !IGNORE_ALERTS.test(e.key)) signals.push({ kind: 'alert', at: new Date(e.t).toISOString(), key: e.key, text: e.text });
    if (e.ev === 'sent' && e.failed > 0) signals.push({ kind: 'send_failed', at: new Date(e.t).toISOString(), uid: e.uid, job: e.id, failed: e.failed });
  }
  // Feedback form under /uniq. Claude gets no database, so everything it needs about the person goes in here.
  const fb = await db((c) => c.query(
    `select e.created_at::text as at_raw, e.telegram_id::text as tg, e.metadata,
       (select json_agg(json_build_object('product', pa.product, 'tier', pa.tier, 'expires', pa.expires_at))
          from product_access pa where pa.telegram_id = e.telegram_id) as access
     from events e where e.type = 'uniq_feedback' and e.created_at > $1::timestamp order by e.created_at`, [state.fbAt])
    .catch(() => c.query(
      `select created_at::text as at_raw, telegram_id::text as tg, metadata from events
       where type = 'uniq_feedback' and created_at > $1::timestamp order by created_at`, [state.fbAt])));
  let fbAt = state.fbAt;
  for (const r of fb.rows) {
    // events.created_at is timestamp without time zone (UTC). Going through a JS Date
    // shifts it by the VPS zone (+3), the cursor lands 3 h back and the same feedback
    // is picked up again on every tick. Keep the raw text and compare as timestamp.
    fbAt = r.at_raw;
    signals.push({ kind: 'feedback', at: fbAt, tg: r.tg, from: r.metadata?.from, text: r.metadata?.text, access: r.access || undefined });
  }
  return { signals, logT, fbAt };
}

// ---------- fix run ----------
function prompt(fix, signals, resultFile) {
  return fs.readFileSync(path.join(HERE, 'prompt.md'), 'utf8')
    .replaceAll('{{ID}}', fix.id)
    .replaceAll('{{RESULT}}', resultFile)
    .replaceAll('{{SIGNALS}}', JSON.stringify(signals, null, 2));
}

function runClaude(cwd, text, logFile) {
  const { uid, gid } = fs.statSync(cwd); // the clone is chowned to uqclaude
  const home = sh('getent', ['passwd', CLAUDE_USER]).split(':')[5];
  const env = {
    PATH: '/usr/local/bin:/usr/bin:/bin', HOME: home, USER: CLAUDE_USER, LANG: 'C.UTF-8',
    CLAUDE_CODE_OAUTH_TOKEN: process.env.CLAUDE_CODE_OAUTH_TOKEN, FORCE_COLOR: '0',
  };
  return new Promise((resolve) => {
    const out = fs.openSync(logFile, 'a');
    const p = spawn('claude', ['-p', text, '--permission-mode', 'bypassPermissions'], { cwd, env, uid, gid, stdio: ['ignore', out, out] });
    const timer = setTimeout(() => { p.kill('SIGTERM'); resolve('timeout'); }, CLAUDE_TIMEOUT_MS);
    p.on('error', (e) => { clearTimeout(timer); resolve(`spawn: ${e.message}`); });
    p.on('close', (code) => { clearTimeout(timer); resolve(code === 0 ? 'ok' : `exit ${code}`); });
  });
}

function cleanup(fix) {
  fs.rmSync(fix.wt, { recursive: true, force: true });
  try { git(['branch', '-D', fix.branch]); } catch { /* gone */ }
}

const describe = (s) => s.kind === 'feedback' ? `отзыв от ${s.from || s.tg}: «${String(s.text || '').slice(0, 300)}»`
  : s.kind === 'alert' ? `тревога сервера: ${String(s.text || '').slice(0, 300)}`
  : `бот не смог прислать ${s.failed} версий (ролик ${s.job})`;

async function startFix(state, signals) {
  const d = new Date();
  const id = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${crypto.randomBytes(2).toString('hex')}`;
  const dir = path.join(STATE_DIR, 'fixes', id);
  fs.mkdirSync(dir, { recursive: true });
  const fix = { id, branch: `fix/uniq-auto-${id}`, wt: path.join(STATE_DIR, 'wt', id), dir, status: 'running', startedAt: d.toISOString(), signals };
  state.fixes[id] = fix;
  saveState(state);

  // Throwaway clone owned by uqclaude; objects are shared read-only with REPO, so it is cheap.
  git(['fetch', '-q', 'origin', 'master']);
  git(['branch', '-f', fix.branch, 'origin/master']);
  fs.mkdirSync(path.dirname(fix.wt), { recursive: true });
  sh('git', ['clone', '-q', '--shared', '-b', fix.branch, REPO, fix.wt]);
  git(['config', 'user.name', 'Sasha Toyz'], fix.wt);
  git(['config', 'user.email', 'thesashatoyz@gmail.com'], fix.wt);
  try { fs.symlinkSync(path.join(DEPS, 'node_modules'), path.join(fix.wt, 'quiz-app/node_modules')); } catch { /* ok */ }
  const resultFile = path.join(fix.wt, '.uniq-fix-result.json');
  sh('chown', ['-R', `${CLAUDE_USER}:${CLAUDE_USER}`, fix.wt]);

  await tg(`🔧 Уникализатор: вижу проблему, разбираюсь сам.\n\n${signals.map((s) => '• ' + describe(s)).join('\n')}\n\nНапишу, что нашёл (обычно 10–30 минут).`);
  const how = await runClaude(fix.wt, prompt(fix, signals, resultFile), path.join(dir, 'claude.log'));
  let r = null;
  try { r = JSON.parse(fs.readFileSync(resultFile, 'utf8')); } catch { /* no verdict */ }
  fs.rmSync(resultFile, { force: true });
  fix.finishedAt = new Date().toISOString();
  fix.result = r;

  // What Claude committed on top of master. Its own word is not enough: the commits decide.
  let ahead = 0, files = [];
  try {
    ahead = Number(git(['rev-list', '--count', `origin/${fix.branch}..HEAD`], fix.wt) || 0);
    files = git(['diff', '--name-only', `origin/${fix.branch}`, 'HEAD'], fix.wt).split('\n').filter(Boolean);
  } catch { /* no commits */ }

  if (r && r.kind === 'fix' && ahead > 0) {
    // Push from the uqclaude-owned clone into REPO: a fetch the other way runs
    // upload-pack inside the clone, which refuses it as dubious ownership.
    git(['push', '-q', '-f', REPO, `HEAD:refs/heads/${fix.branch}`], fix.wt);
    git(['push', '-q', '-f', 'origin', `${fix.branch}:${fix.branch}`]);
    fix.status = 'proposed';
    fix.files = files;
    fix.vps = files.some((f) => f.startsWith('services/uniq-server/'));
    fix.vercel = files.some((f) => f.startsWith('quiz-app/'));
    const where = [fix.vps && 'сервер уникализатора', fix.vercel && 'кабинет (Vercel)'].filter(Boolean).join(' и ');
    saveState(state);
    await tg(`🛠 ${r.title || 'Починка уникализатора'}\n\n${r.summary || ''}\n\nКуда поедет: ${where || 'только тесты/доки'}. Проверено: ${r.checked || '—'}`,
      [[{ text: '✅ Выкатить', callback_data: `uqfix_ok:${id}` }, { text: '✖️ Отклонить', callback_data: `uqfix_no:${id}` }],
        [{ text: 'Что поменял', url: `${GH}/compare/master...${encodeURIComponent(fix.branch)}` }]]);
    fs.rmSync(fix.wt, { recursive: true, force: true }); // the branch now lives in REPO and on GitHub
  } else {
    fix.status = 'closed';
    cleanup(fix);
    if (r && (r.kind === 'not_bug' || r.kind === 'noise')) {
      await tg(`💬 ${r.title || 'Не баг'}\n\n${r.summary || ''}${r.reply_draft ? `\n\nЧерновик ответа${r.who ? ' для ' + r.who : ''}:\n${r.reply_draft}` : ''}`);
    } else {
      await tg(`⚠️ Уникализатор: не смог починить сам (${how}${r && r.kind === 'fix' ? ', правка не закоммичена' : ''}).\n\n${r?.summary || 'Вердикта нет.'}\n\nРасшифровка: ${path.join(dir, 'claude.log')}`);
    }
  }
  saveState(state);
}

// ---------- decisions and deploy ----------
async function decisions(state) {
  const waiting = Object.values(state.fixes).filter((f) => f.status === 'proposed' || f.status === 'approved');
  if (!waiting.length) return;
  const rows = (await db((c) => c.query(
    `select metadata from events where type = 'uniq_fix_decision' and metadata->>'id' = any($1) order by created_at`,
    [waiting.map((f) => f.id)]))).rows;
  for (const f of waiting) {
    const d = rows.filter((r) => r.metadata.id === f.id).pop();
    if (f.status === 'proposed' && !d) continue;
    if (DRY) { say('decision (dry):', f.id, d?.metadata); continue; }
    if (d && d.metadata.ok === false) {
      try { git(['push', '-q', 'origin', '--delete', f.branch]); } catch (e) { say('delete branch:', e.message); }
      cleanup(f);
      f.status = 'rejected';
      saveState(state);
      continue;
    }
    f.status = 'approved';
    await deploy(state, f);
  }
}

async function deploy(state, f) {
  const r = f.result || {};
  if (f.vps && sh('sh', ['-c', 'pgrep -c ffmpeg || true']) !== '0') { say(`deploy ${f.id}: encoding in progress, next tick`); saveState(state); return; }
  try {
    if (!f.merged) {
      git(['fetch', '-q', 'origin', 'master']);
      git(['checkout', '-q', '--detach', 'origin/master']);
      try {
        git(['merge', '--squash', f.branch]);
      } catch (e) {
        git(['reset', '-q', '--hard', 'origin/master']);
        throw new Error(`не сливается с master (кто-то поменял те же места): ${e.message.slice(0, 120)}`);
      }
      git(['-c', 'user.name=Sasha Toyz', '-c', 'user.email=thesashatoyz@gmail.com', 'commit', '-q', '-m',
        `uniq: ${r.title || 'auto fix'} (uniq-watch ${f.id})\n\n${(r.summary || '').slice(0, 1500)}\n\nCo-Authored-By: Claude <noreply@anthropic.com>`]);
      git(['push', '-q', 'origin', 'HEAD:master']);
      try { git(['push', '-q', 'origin', '--delete', f.branch]); } catch { /* ok */ }
      f.merged = git(['rev-parse', '--short', 'HEAD']);
      saveState(state);
    }
    let vpsNote = '';
    if (f.vps) {
      const bak = path.join(SERVICE_DIR, `bak-${f.id}`);
      fs.mkdirSync(bak, { recursive: true });
      const live = fs.readdirSync(SERVICE_DIR).filter((n) => n.endsWith('.js'));
      for (const n of live) fs.copyFileSync(path.join(SERVICE_DIR, n), path.join(bak, n));
      const files = git(['ls-tree', '--name-only', 'HEAD', 'services/uniq-server/']).split('\n').filter((p) => p.endsWith('.js'));
      for (const p of files) fs.writeFileSync(path.join(SERVICE_DIR, path.basename(p)), git(['show', `HEAD:${p}`]) + '\n');
      sh('chown', ['uniq:uniq', path.join(SERVICE_DIR, 'server.js')]);
      sh('systemctl', ['restart', 'uniq-server']);
      await new Promise((ok) => setTimeout(ok, 4000));
      const active = sh('sh', ['-c', 'systemctl is-active uniq-server || true']);
      const code = sh('sh', ['-c', 'curl -s -o /dev/null -w "%{http_code}" https://uniq.thesashatoyz.com/api/me || true']);
      if (active !== 'active' || code !== '401') {
        for (const n of live) fs.copyFileSync(path.join(bak, n), path.join(SERVICE_DIR, n));
        sh('systemctl', ['restart', 'uniq-server']);
        f.status = 'rolled_back';
        saveState(state);
        await tg(`❌ ${r.title || 'Починка'}: после выкатки сервис не ответил как надо (${active}, ${code}). Вернул прошлую версию, уникализатор работает как до починки. В master правка осталась (${f.merged}), её надо откатить.`);
        return;
      }
      vpsNote = 'Сервер обновлён и отвечает. ';
    }
    f.status = 'deployed';
    cleanup(f);
    saveState(state);
    await tg(`✅ Выкатил: ${r.title || f.id}. ${vpsNote}${f.vercel ? 'Кабинет обновится сам через 2–3 минуты (Vercel). ' : ''}${r.reply_draft ? `\n\nЧерновик ответа${r.who ? ' для ' + r.who : ''}:\n${r.reply_draft}` : ''}`);
  } catch (e) {
    f.status = 'deploy_failed';
    f.error = e.message;
    saveState(state);
    await tg(`❌ Не смог выкатить «${r.title || f.id}»: ${String(e.message).slice(0, 300)}`);
  }
}

// ---------- main ----------
async function main() {
  if (!lock()) { say('previous tick still running'); return; }
  try {
    let state = loadState();
    if (!state) {
      // First run: start from now, history is not replayed.
      state = { logT: Date.now(), fbAt: new Date().toISOString(), fixes: {}, day: '', runs: 0 };
      saveState(state);
      say('initialized');
      return;
    }
    await decisions(state);
    const { signals, logT, fbAt } = await collect(state);
    if (DRY) { say('signals:', JSON.stringify(signals, null, 2)); return; }
    state.logT = logT; state.fbAt = fbAt;
    const today = new Date().toISOString().slice(0, 10);
    if (state.day !== today) { state.day = today; state.runs = 0; state.pausedSaid = false; }
    saveState(state);
    if (!signals.length) return;
    if (state.runs >= MAX_RUNS_PER_DAY) {
      if (!state.pausedSaid) { await tg(`⏸ Уникализатор: за сегодня уже ${state.runs} разборов, дальше сам не чиню до завтра. Новое:\n${signals.map((s) => '• ' + describe(s)).join('\n')}`); state.pausedSaid = true; saveState(state); }
      return;
    }
    state.runs++;
    saveState(state);
    await startFix(state, signals);
  } finally {
    fs.rmSync(LOCK, { force: true });
  }
}

main().catch((e) => {
  say('tick failed:', e.stack || e.message);
  fs.rmSync(LOCK, { force: true });
  process.exitCode = 1;
});
