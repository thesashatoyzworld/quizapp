'use strict';
// Monitoring for uniq-server: a permanent event log (jobs.json is swept after 24 h, this is not),
// Telegram alerts on failures, and a daily digest. Zero deps, like the rest of the service.
//
// Env: UNIQ_TG_TOKEN + UNIQ_TG_CHAT enable Telegram; without them alerts only go to the journal.
//      UNIQ_DIGEST_HOUR_UTC (default 4 = 09:00 Almaty) is when the daily digest is sent.

const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');

const DAY_MS = 24 * 3600 * 1000;

function tgSend(token, chat, text, replyMarkup) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) });
    const req = https.request({
      host: 'api.telegram.org', path: `/bot${token}/sendMessage`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }, timeout: 10000,
    }, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode === 200)); });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end(body);
  });
}

function readLog(file, sinceMs = 0) {
  let raw = '';
  try { raw = fs.readFileSync(file, 'utf8'); } catch { return []; }
  const out = [];
  for (const line of raw.split('\n')) {
    if (!line) continue;
    try { const e = JSON.parse(line); if (e.t >= sinceMs) out.push(e); } catch { /* torn line */ }
  }
  return out;
}

function dirBytes(dir) {
  let n = 0;
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return 0; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) n += dirBytes(p);
    else { try { n += fs.statSync(p).size; } catch { /* gone */ } }
  }
  return n;
}

const mb = (b) => `${Math.round(b / 1e6)} МБ`;
const sec = (s) => (s >= 90 ? `${Math.round(s / 60)} мин` : `${Math.round(s)} с`);

/** Text of the digest over events in [from, to). Pure, so it is testable. */
function digestText(events, { from, to, diskBytes, load } = {}) {
  const jobs = events.filter((e) => e.ev === 'job' && e.t >= from && e.t < to);
  const users = new Set(jobs.map((j) => j.uid));
  const versions = jobs.reduce((n, j) => n + j.done, 0);
  const failedJobs = jobs.filter((j) => j.failed > 0);
  const perVersion = jobs.filter((j) => j.done > 0).map((j) => j.procSec / j.done);
  const avg = perVersion.length ? perVersion.reduce((a, b) => a + b, 0) / perVersion.length : 0;
  const maxWait = jobs.reduce((m, j) => Math.max(m, j.waitSec || 0), 0);
  const restarts = events.filter((e) => e.ev === 'start' && e.t >= from && e.t < to).length;
  const rejected = events.filter((e) => e.ev === 'reject' && e.t >= from && e.t < to).length;
  const maxQueue = events.filter((e) => e.t >= from && e.t < to && typeof e.queue === 'number')
    .reduce((m, e) => Math.max(m, e.queue), 0);

  const lines = ['Уникализатор за сутки'];
  if (!jobs.length) lines.push('Роликов не было.');
  else {
    lines.push(`Роликов: ${jobs.length}, людей: ${users.size}, версий: ${versions}`);
    lines.push(`Одна версия в среднем: ${sec(avg)}, дольше всех ждали в очереди: ${sec(maxWait)}`);
    lines.push(`Очередь доходила до: ${maxQueue}`);
  }
  lines.push(failedJobs.length ? `С ошибками: ${failedJobs.length}` : 'Ошибок нет');
  if (rejected) lines.push(`Отказов по лимитам: ${rejected}`);
  if (restarts) lines.push(`Перезапусков сервиса: ${restarts}`);

  // Free users' funnel: unique people per step (page events + server side).
  const inDay = (e) => e.t >= from && e.t < to;
  const people = (pred) => new Set(events.filter((e) => inDay(e) && pred(e)).map((e) => e.uid)).size;
  const page = (what) => people((e) => e.ev === 'page' && e.free && e.what === what);
  const opened = page('open');
  if (opened) {
    const freeJobs = people((e) => e.ev === 'enqueue' && e.plan && e.plan !== 'paid');
    lines.push('', 'Бесплатные (людей):');
    lines.push(`открыли ${opened}, экран подписки ${page('sub_screen')}, подписались ${page('sub_ok')}`);
    lines.push(`загрузили ролик ${freeJobs}, скачали ${people((e) => e.ev === 'page' && e.free && (e.what === 'download' || e.what === 'download_all'))}`);
    lines.push(`упёрлись в недельный лимит ${people((e) => e.ev === 'reject' && e.reason === 'week')}, поделились ссылкой ${people((e) => e.ev === 'page' && e.free && (e.what === 'share' || e.what === 'copy'))}`);
    const credited = events.filter((e) => inDay(e) && e.ev === 'first' && e.credited).length;
    if (credited) lines.push(`друзей засчитано: ${credited}`);
  }
  const reminded = events.filter((e) => inDay(e) && e.ev === 'remind' && e.ok).length;
  if (reminded) lines.push(`Напоминаний в бот: ${reminded}`);
  if (diskBytes != null) lines.push(`Место под видео занято: ${mb(diskBytes)}`);
  if (load) lines.push(`Нагрузка сервера сейчас: ${load}`);
  return lines.join('\n');
}

function createMonitor(opts = {}) {
  const dataDir = opts.dataDir;
  const file = path.join(dataDir, 'log.jsonl');
  const token = opts.tgToken ?? process.env.UNIQ_TG_TOKEN;
  const chat = opts.tgChat ?? process.env.UNIQ_TG_CHAT;
  const digestHour = Number(opts.digestHourUtc ?? process.env.UNIQ_DIGEST_HOUR_UTC ?? 4);
  const sendTg = opts.send || ((text) => (token && chat ? tgSend(token, chat, text) : Promise.resolve(false)));
  const lastAlert = new Map();

  function log(ev, data = {}) {
    const e = { t: Date.now(), ev, ...data };
    try { fs.appendFileSync(file, JSON.stringify(e) + '\n'); } catch (err) { console.error(`monitor log: ${err.message}`); }
    return e;
  }

  /** Alert, with the same key at most once per `everyMs` so a crash loop does not flood the chat. */
  function alert(key, text, everyMs = 10 * 60 * 1000) {
    const now = Date.now();
    if (now - (lastAlert.get(key) || 0) < everyMs) return Promise.resolve(false);
    lastAlert.set(key, now);
    console.error(`ALERT ${key}: ${text}`);
    return sendTg(`⚠️ Уникализатор: ${text}`);
  }

  function digest(now = Date.now()) {
    const events = readLog(file, now - DAY_MS);
    const load = os.loadavg().map((x) => x.toFixed(2)).join(' / ');
    return digestText(events, { from: now - DAY_MS, to: now, diskBytes: dirBytes(dataDir), load });
  }

  // Daily digest: check every 10 min, send once per UTC day at the configured hour.
  const stampFile = path.join(dataDir, 'digest.stamp');
  async function maybeDigest(now = Date.now()) {
    const d = new Date(now);
    if (d.getUTCHours() !== digestHour) return false;
    const day = d.toISOString().slice(0, 10);
    let last = '';
    try { last = fs.readFileSync(stampFile, 'utf8').trim(); } catch { /* first run */ }
    if (last === day) return false;
    fs.writeFileSync(stampFile, day);
    await sendTg(digest(now));
    return true;
  }
  let timer = null;
  function start() {
    timer = setInterval(() => { maybeDigest().catch((e) => console.error(`digest: ${e.message}`)); }, 10 * 60 * 1000);
    timer.unref();
  }
  function stop() { if (timer) clearInterval(timer); }

  return { log, alert, digest, maybeDigest, start, stop, file, readAll: () => readLog(file) };
}

module.exports = { createMonitor, digestText, readLog, tgSend };
