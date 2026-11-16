#!/usr/bin/env node
// Uniq bug watcher. Runs on Sasha's Mac from launchd every 10 minutes (see README.md).
//
// One tick:
//   1. Sasha's taps on «Выкатить» / «Отклонить» (events uniq_fix_decision, written by the bot webhook)
//      → merge the PR and deploy it to the VPS with a backup and a health check, or close the PR.
//   2. New signals: feedback from the /uniq page (events uniq_feedback) and alerts in the VPS log.
//   3. Signals found → headless Claude in a fresh worktree from origin/master: diagnose, fix, test, open a PR.
//      Its verdict goes to Sasha in @testtoyzbot. Nothing reaches production without his tap.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = execFileSync('git', ['-C', HERE, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const QUIZ_APP = process.env.UNIQ_WATCH_QUIZ_APP || path.join(os.homedir(), 'Documents/ClaudeCode/Projects/TheSasha/quiz-app');
const STATE_DIR = process.env.UNIQ_WATCH_DIR || path.join(os.homedir(), '.uniq-watch');
const STATE_FILE = path.join(STATE_DIR, 'state.json');
const LOCK = path.join(STATE_DIR, 'lock');
const SSH = ['-o', 'ConnectTimeout=15', '-o', 'BatchMode=yes', '-i', path.join(os.homedir(), '.ssh/vps_timeweb'), 'root@72.56.16.252'];
const CLAUDE = process.env.UNIQ_WATCH_CLAUDE || path.join(os.homedir(), '.local/bin/claude');
const CLAUDE_TIMEOUT_MS = 45 * 60 * 1000;
const MAX_RUNS_PER_DAY = 6;
const IGNORE_ALERTS = /^(queue)$/; // load, not a bug
const DRY = process.argv.includes('--dry'); // collect and print signals, change nothing

const req = createRequire(path.join(QUIZ_APP, 'package.json'));
req('dotenv').config({ path: path.join(QUIZ_APP, '.env.local'), quiet: true });
const pg = req('pg');
const BOT = process.env.BOT_TOKEN;
const SASHA = (process.env.ADMIN_CHAT_ID || '788334680').trim();

fs.mkdirSync(STATE_DIR, { recursive: true });
const say = (...a) => console.log(new Date().toISOString(), ...a);

// ---------- small helpers ----------
function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20, ...opts }).trim();
}
const ssh = (remote, opts) => sh('ssh', [...SSH, remote], opts);

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
  // VPS log: alerts (failed versions, crash, restart mid-job, cabinet unreachable) and failed bot sends.
  const lines = ssh('tail -n 3000 /var/lib/uniq/log.jsonl').split('\n');
  let logT = state.logT;
  for (const l of lines) {
    let e; try { e = JSON.parse(l); } catch { continue; }
    if (!(e.t > state.logT)) continue;
    logT = Math.max(logT, e.t);
    if (e.ev === 'alert' && !IGNORE_ALERTS.test(e.key)) signals.push({ kind: 'alert', at: new Date(e.t).toISOString(), key: e.key, text: e.text });
    if (e.ev === 'sent' && e.failed > 0) signals.push({ kind: 'send_failed', at: new Date(e.t).toISOString(), uid: e.uid, job: e.id, failed: e.failed });
  }
  // Feedback form under /uniq.
  const fb = await db((c) => c.query(
    `select id, created_at, telegram_id::text as tg, metadata from events
     where type = 'uniq_feedback' and created_at > $1 order by created_at`, [state.fbAt]));
  let fbAt = state.fbAt;
  for (const r of fb.rows) {
    fbAt = r.created_at.toISOString();
    signals.push({ kind: 'feedback', at: fbAt, tg: r.tg, from: r.metadata?.from, text: r.metadata?.text });
  }
  return { signals, logT, fbAt };
}

// ---------- fix run ----------
function prompt(fix, signals, resultFile) {
  return fs.readFileSync(path.join(HERE, 'prompt.md'), 'utf8')
    .replaceAll('{{ID}}', fix.id)
    .replaceAll('{{RESULT}}', resultFile)
    .replaceAll('{{QUIZ_APP_ENV}}', path.join(QUIZ_APP, '.env.local'))
    .replaceAll('{{SIGNALS}}', JSON.stringify(signals, null, 2));
}

function runClaude(cwd, text, logFile) {
  return new Promise((resolve) => {
    const out = fs.openSync(logFile, 'a');
    const p = spawn(CLAUDE, ['-p', text, '--permission-mode', 'bypassPermissions'], { cwd, stdio: ['ignore', out, out] });
    const timer = setTimeout(() => { p.kill('SIGTERM'); resolve('timeout'); }, CLAUDE_TIMEOUT_MS);
    p.on('error', (e) => { clearTimeout(timer); resolve(`spawn: ${e.message}`); });
    p.on('close', (code) => { clearTimeout(timer); resolve(code === 0 ? 'ok' : `exit ${code}`); });
  });
}

function removeWorktree(fix) {
  try { sh('git', ['-C', REPO, 'worktree', 'remove', '--force', fix.wt]); } catch { fs.rmSync(fix.wt, { recursive: true, force: true }); }
  try { sh('git', ['-C', REPO, 'worktree', 'prune']); } catch { /* ignore */ }
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

  sh('git', ['-C', REPO, 'fetch', '-q', 'origin', 'master']);
  sh('git', ['-C', REPO, 'worktree', 'add', '-q', '-b', fix.branch, fix.wt, 'origin/master']);
  try { fs.symlinkSync(path.join(QUIZ_APP, 'node_modules'), path.join(fix.wt, 'quiz-app/node_modules')); } catch { /* ok */ }

  await tg(`🔧 Уникализатор: вижу проблему, разбираюсь сам.\n\n${signals.map((s) => '• ' + describe(s)).join('\n')}\n\nНапишу, что нашёл (обычно 10–30 минут).`);
  const resultFile = path.join(dir, 'result.json');
  const how = await runClaude(fix.wt, prompt(fix, signals, resultFile), path.join(dir, 'claude.log'));
  let r = null;
  try { r = JSON.parse(fs.readFileSync(resultFile, 'utf8')); } catch { /* no verdict */ }
  fix.finishedAt = new Date().toISOString();
  fix.result = r;

  if (r && r.kind === 'fix' && r.pr_url) {
    fix.status = 'proposed';
    fix.pr = r.pr_url;
    const where = [r.deploy_vps && 'сервер уникализатора', r.deploy_vercel && 'кабинет (Vercel)'].filter(Boolean).join(' и ');
    await tg(`🛠 ${r.title || 'Починка уникализатора'}\n\n${r.summary || ''}\n\nКуда поедет: ${where || '—'}. Проверено: ${r.checked || '—'}`,
      [[{ text: '✅ Выкатить', callback_data: `uqfix_ok:${id}` }, { text: '✖️ Отклонить', callback_data: `uqfix_no:${id}` }],
        [{ text: 'Открыть PR', url: r.pr_url }]]);
  } else {
    fix.status = 'closed';
    removeWorktree(fix);
    if (r && (r.kind === 'not_bug' || r.kind === 'noise')) {
      await tg(`💬 ${r.title || 'Не баг'}\n\n${r.summary || ''}${r.reply_draft ? `\n\nЧерновик ответа${r.who ? ' для ' + r.who : ''}:\n${r.reply_draft}` : ''}`);
    } else {
      await tg(`⚠️ Уникализатор: не смог починить сам (${how}).\n\n${r?.summary || 'Вердикта нет.'}\n\nЛог: ${path.join(dir, 'claude.log')}`);
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
    if (d && d.metadata.ok === false) {
      if (!DRY) { try { sh('gh', ['pr', 'close', f.pr, '--delete-branch'], { cwd: REPO }); } catch (e) { say('close:', e.message); } removeWorktree(f); }
      f.status = 'rejected';
      saveState(state);
      continue;
    }
    f.status = 'approved';
    if (!DRY) await deploy(state, f);
  }
}

function vpsBusy() {
  return ssh('pgrep -c ffmpeg || true') !== '0';
}

async function deploy(state, f) {
  const r = f.result || {};
  if (r.deploy_vps && vpsBusy()) { say(`deploy ${f.id}: VPS is encoding, retry next tick`); saveState(state); return; }
  try {
    if (!f.merged) {
      sh('gh', ['pr', 'merge', f.pr, '--squash', '--delete-branch'], { cwd: REPO });
      f.merged = true;
      saveState(state);
    }
    let vpsNote = '';
    if (r.deploy_vps) {
      sh('git', ['-C', REPO, 'fetch', '-q', 'origin', 'master']);
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'uniq-deploy-'));
      const files = sh('git', ['-C', REPO, 'ls-tree', '--name-only', 'origin/master', 'services/uniq-server/'])
        .split('\n').filter((p) => p.endsWith('.js'));
      for (const p of files) fs.writeFileSync(path.join(tmp, path.basename(p)), sh('git', ['-C', REPO, 'show', `origin/master:${p}`]) + '\n');
      const bak = `/opt/uniq-server/bak-${f.id}`;
      ssh(`mkdir -p ${bak} && cp /opt/uniq-server/*.js ${bak}/`);
      sh('scp', ['-q', ...SSH.slice(0, -1), ...fs.readdirSync(tmp).map((n) => path.join(tmp, n)), `${SSH.at(-1)}:/opt/uniq-server/`]);
      ssh('chown uniq:uniq /opt/uniq-server/server.js; systemctl restart uniq-server');
      await new Promise((ok) => setTimeout(ok, 4000));
      const healthy = ssh('systemctl is-active uniq-server; curl -s -o /dev/null -w "%{http_code}" https://uniq.thesashatoyz.com/api/me') ;
      if (!/active\s*401/.test(healthy.replace(/\n/g, ' '))) {
        ssh(`cp ${bak}/*.js /opt/uniq-server/ && chown uniq:uniq /opt/uniq-server/server.js && systemctl restart uniq-server`);
        f.status = 'rolled_back';
        saveState(state);
        await tg(`❌ ${r.title || 'Починка'}: после выкатки сервис не ответил как надо (${healthy.replace(/\n/g, ' ')}). Вернул прошлую версию, сервис работает как до починки. PR смёржен, его надо откатить: ${f.pr}`);
        return;
      }
      vpsNote = 'Сервер обновлён и отвечает. ';
    }
    f.status = 'deployed';
    removeWorktree(f);
    saveState(state);
    await tg(`✅ Выкатил: ${r.title || f.id}. ${vpsNote}${r.deploy_vercel ? 'Кабинет обновится сам через 2–3 минуты (Vercel). ' : ''}${r.reply_draft ? `\n\nЧерновик ответа${r.who ? ' для ' + r.who : ''}:\n${r.reply_draft}` : ''}`);
  } catch (e) {
    f.status = 'deploy_failed';
    f.error = e.message;
    saveState(state);
    await tg(`❌ Не смог выкатить ${r.title || f.id}: ${String(e.message).slice(0, 300)}`);
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

main().catch(async (e) => {
  say('tick failed:', e.stack || e.message);
  fs.rmSync(LOCK, { force: true });
  process.exitCode = 1;
});
