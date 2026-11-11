'use strict';
// Uniq server: HTTP API around Danya's core.js. One global FIFO queue, one version at a time.
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { probe, fingerprint, History, Job } = require('./core');
const { createMonitor, tgSend } = require('./monitor');

// What the page may report (POST /api/ev). Anything else is rejected, so the log stays readable.
const PAGE_EVENTS = new Set(['open', 'sub_screen', 'sub_ok', 'sub_no', 'pick', 'upload', 'download', 'download_all', 'share', 'copy', 'feedback', 'limit',
  'cta_view_uroven', 'cta_click_uroven', 'cta_view_potok', 'cta_click_potok', 'cta_view_360', 'cta_click_360']);

const MAX_PER_VIDEO = 5;
const MAX_BYTES = 500 * 1024 * 1024;
const MAX_DURATION = 180;
const OUTPUT_TTL_MS = 24 * 3600 * 1000;

const b64u = (buf) => Buffer.from(buf).toString('base64url');

function sign(payload, secret) {
  const p = b64u(JSON.stringify(payload));
  return `${p}.${b64u(crypto.createHmac('sha256', secret).update(p).digest())}`;
}

function verify(token, secret) {
  if (!token || typeof token !== 'string') return null;
  const [p, s, extra] = token.split('.');
  if (!p || !s || extra !== undefined) return null;
  const want = crypto.createHmac('sha256', secret).update(p).digest();
  const got = Buffer.from(s, 'base64url');
  if (got.length !== want.length || !crypto.timingSafeEqual(got, want)) return null;
  let data;
  try { data = JSON.parse(Buffer.from(p, 'base64url').toString('utf8')); } catch { return null; }
  if (!data || typeof data.uid !== 'string' || !data.uid) return null;
  if (!(Number(data.exp) > Date.now() / 1000)) return null;
  return data;
}

// Reserve up to `count` versions for key. Returns {count, used} or {error} when nothing is left.
function reserve(usage, key, count) {
  const used = usage[key] || 0;
  if (used >= MAX_PER_VIDEO) return { error: 'лимит 5 версий на этот ролик исчерпан', used };
  const n = Math.min(count, MAX_PER_VIDEO - used);
  usage[key] = used + n;
  return { count: n, used: used + n };
}

function refund(usage, key, n) {
  if (n <= 0) return;
  usage[key] = Math.max(0, (usage[key] || 0) - n);
  if (!usage[key]) delete usage[key];
}

const WEEK_MS = 7 * 24 * 3600 * 1000;

// Limits come signed in the token: plan {w: videos per rolling 7 days (0 = unlimited), v: versions per video}.
// Older tokens: `free` → 1×2, otherwise unlimited.
function planOf(auth) {
  const p = auth.plan;
  if (p && Number.isFinite(+p.w) && Number.isFinite(+p.v)) {
    return { w: Math.max(0, Math.floor(+p.w)), v: Math.min(MAX_PER_VIDEO, Math.max(1, Math.floor(+p.v))) };
  }
  return auth.free ? { w: 1, v: 2 } : { w: 0, v: MAX_PER_VIDEO };
}

const plural = (n, one, few, many) => {
  const a = n % 10, b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
};
const inDays = (ms) => {
  const h = Math.max(1, Math.ceil(ms / 3600e3));
  if (h < 24) return `${h} ${plural(h, 'час', 'часа', 'часов')}`;
  const d = Math.ceil(h / 24);
  return `${d} ${plural(d, 'день', 'дня', 'дней')}`;
};

function writeJson(file, data) {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, file);
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

function createServer(opts = {}) {
  const secret = opts.secret || process.env.UNIQ_SECRET;
  if (!secret) throw new Error('UNIQ_SECRET is required');
  const dataDir = opts.dataDir || process.env.UNIQ_DATA || '/var/lib/uniq';
  const ffmpeg = opts.ffmpeg || process.env.UNIQ_FFMPEG || 'ffmpeg';
  const origins = (opts.origins || process.env.UNIQ_ORIGINS ||
    'https://world.thesashatoyz.com,https://thesashatoyz.com,https://www.thesashatoyz.com,http://localhost:3000')
    .split(',').map((s) => s.trim()).filter(Boolean);
  const maxBytes = opts.maxBytes || MAX_BYTES;
  const mon = opts.monitor || createMonitor({ dataDir });
  // Referral: the cabinet is told when someone finishes their first video ever (friend credit).
  const cabinetUrl = (opts.cabinetUrl ?? process.env.UNIQ_CABINET_URL ?? 'https://world.thesashatoyz.com').replace(/\/+$/, '');
  const notifyFirst = opts.notifyFirst || ((uid) => fetch(`${cabinetUrl}/api/cabinet/uniq/first`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sign({ uid, exp: Math.floor(Date.now() / 1000) + 600 }, secret)}` },
    body: '{}',
  }).then(async (r) => {
    if (!r.ok) throw new Error(`cabinet ${r.status}`);
    const d = await r.json().catch(() => ({}));
    mon.log('first', { uid, credited: !!d.credited, ...(d.reason ? { reason: d.reason } : {}) });
  }));
  const uploadsDir = path.join(dataDir, 'uploads');
  const outDir = path.join(dataDir, 'out');
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });

  const usageFile = path.join(dataDir, 'usage.json');
  const jobsFile = path.join(dataDir, 'jobs.json');
  const usage = readJson(usageFile);
  const history = new History(path.join(dataDir, 'history.json'));
  const jobs = new Map(Object.entries(readJson(jobsFile)));
  const queue = [];
  const uploading = new Set();
  let running = null;

  const saveUsage = () => writeJson(usageFile, usage);
  // quota.json: uid → creation times of their limited videos in the last 7 days (jobs.json is swept after 24 h).
  // seen.json: uid → 1 for everyone who ever got a version, so «first video» survives the sweep.
  const quotaFile = path.join(dataDir, 'quota.json');
  const seenFile = path.join(dataDir, 'seen.json');
  const quota = readJson(quotaFile);
  const seen = readJson(seenFile);
  if (!fs.existsSync(seenFile)) {
    for (const e of mon.readAll ? mon.readAll() : []) if (e.ev === 'job' && e.done > 0) seen[e.uid] = 1;
    for (const j of jobs.values()) if (j.done > 0) seen[j.uid] = 1;
    writeJson(seenFile, seen);
  }
  const saveQuota = () => writeJson(quotaFile, quota);
  const weekUsed = (uid, now = Date.now()) => {
    const list = (quota[uid] || []).filter((t) => now - t < WEEK_MS).sort((a, b) => a - b);
    if (list.length) quota[uid] = list; else delete quota[uid];
    return list;
  };
  // A limited video that produced nothing does not count against the week.
  const giveQuotaBack = (j) => {
    if (!j.quotaAt || j.done) return;
    quota[j.uid] = (quota[j.uid] || []).filter((t) => t !== j.quotaAt);
    if (!quota[j.uid].length) delete quota[j.uid];
    saveQuota();
  };

  // Bot reminders (reminders.json): «check the reach» a day after a video, «new video available»
  // when a limited week frees up. Sent 09:00-21:00 Almaty only, one per uid+kind.
  const remindFile = path.join(dataDir, 'reminders.json');
  const reminders = readJson(remindFile);
  const saveReminders = () => writeJson(remindFile, reminders);
  const remind = (uid, kind, at) => {
    if (!/^\d+$/.test(String(uid))) return; // test uids and the like have no Telegram chat
    reminders[`${uid}:${kind}`] = { uid: String(uid), kind, at };
    saveReminders();
  };
  const tgToken = opts.tgToken ?? process.env.UNIQ_TG_TOKEN;
  const sendReminder = opts.sendReminder || ((uid, text) => (tgToken ? tgSend(tgToken, uid, text, {
    inline_keyboard: [[{ text: 'Открыть уникализатор', web_app: { url: `${cabinetUrl}/uniq` } }]],
  }) : Promise.resolve(false)));
  const REMIND_TEXT = {
    check: 'Прошли сутки с твоих версий. Глянь охваты пробных рилсов: какая версия набрала больше, ту можно выложить в ленту. А тема, которая зашла, стоит ещё одного ролика.',
    refill: 'Новый ролик в уникализаторе доступен. Какой из твоих роликов на этой неделе зашёл лучше всего? Его и прогони.',
  };
  async function tickReminders(now = Date.now()) {
    const hourAlmaty = (new Date(now).getUTCHours() + 5) % 24;
    if (hourAlmaty < 9 || hourAlmaty >= 21) return 0;
    let sent = 0;
    for (const [k, r] of Object.entries(reminders)) {
      if (r.at > now) continue;
      delete reminders[k];
      saveReminders();
      const ok = await sendReminder(r.uid, REMIND_TEXT[r.kind] || '').catch(() => false);
      mon.log('remind', { uid: r.uid, kind: r.kind, ok: !!ok });
      sent++;
    }
    return sent;
  }
  const remindTimer = setInterval(() => { tickReminders().catch((e) => console.error(`reminders: ${e.message}`)); }, 10 * 60 * 1000);
  remindTimer.unref();
  const saveJobs = () => writeJson(jobsFile, Object.fromEntries(jobs));

  // A restart kills whatever was in flight: fail it and give the versions back.
  let killed = 0;
  for (const j of jobs.values()) {
    if (j.status === 'queued' || j.status === 'running') {
      killed++;
      refund(usage, j.key, j.count - j.done);
      j.failed = j.count - j.done;
      j.status = j.done ? 'done' : 'failed';
      j.error = j.done ? undefined : 'сервер перезапустился, попробуй ещё раз';
      j.finishedAt = Date.now();
      giveQuotaBack(j);
      fs.rmSync(j.src, { force: true });
    }
  }
  saveUsage();
  saveJobs();
  mon.log('start', { killed });
  if (killed) mon.alert('restart', `сервис перезапустился посреди работы, сорвалось роликов: ${killed}. Людям вернули лимит, им надо загрузить заново.`);

  const load = () => queue.length + (running ? 1 : 0);

  function position(j) {
    if (j.status === 'running') return 0;
    const i = queue.indexOf(j.id);
    return i < 0 ? 0 : i + (running ? 1 : 0);
  }

  function view(j) {
    return {
      id: j.id, status: j.status, position: position(j), total: j.count, done: j.done,
      failed: j.failed, versions: j.versions.map((v) => ({ i: v.i, size: v.size, url: `/files/${j.id}/${v.i}.mp4` })),
      ...(j.error ? { error: j.error } : {}),
    };
  }

  function activeJob(uid) {
    for (const j of jobs.values()) if (j.uid === uid && (j.status === 'queued' || j.status === 'running')) return j;
    return null;
  }

  async function pump() {
    if (running || !queue.length) return;
    const j = jobs.get(queue.shift());
    running = j;
    j.status = 'running';
    j.startedAt = Date.now();
    saveJobs();
    try {
      const job = new Job({
        ffmpeg, history, files: [j.src], count: j.count, outRoot: path.join(outDir, j.id), parallel: 1,
        keyPrefix: `${j.uid}:`,
        emit: (e) => {
          if (e.type === 'file') j.dir = e.dir;
          if (e.type === 'version') {
            j.done = e.done;
            j.versions.push({ i: e.i, size: fs.statSync(e.file).size, file: e.file });
            saveJobs();
          }
          if (e.type === 'error') {
            j.failed = e.failed;
            j.lastError = e.message;
            console.error(`job ${j.id} error: ${e.message}`);
          }
        },
      });
      await job.run();
    } catch (e) {
      j.lastError = e.message;
      console.error(`job ${j.id} crashed: ${e.message}`);
    }
    const lastError = j.lastError;
    j.failed = j.count - j.done;
    refund(usage, j.key, j.failed);
    saveUsage();
    j.status = j.done ? 'done' : 'failed';
    if (!j.done) j.error = 'не удалось обработать видео';
    giveQuotaBack(j);
    if (j.done) remind(j.uid, 'check', j.finishedAt + 24 * 3600 * 1000);
    if (j.done && !seen[j.uid]) {
      seen[j.uid] = 1;
      writeJson(seenFile, seen);
      Promise.resolve().then(() => notifyFirst(j.uid))
        .catch((e) => mon.alert('first', `не смог сообщить кабинету о первом ролике ${j.uid}: ${e.message}`, 3600 * 1000));
    }
    delete j.lastError;
    j.finishedAt = Date.now();
    fs.rmSync(j.src, { force: true });
    saveJobs();
    running = null;
    mon.log('job', {
      id: j.id, uid: j.uid, count: j.count, done: j.done, failed: j.failed,
      srcBytes: j.srcBytes, srcSec: j.srcSec,
      waitSec: Math.round((j.startedAt - j.createdAt) / 1000),
      procSec: Math.round((j.finishedAt - j.startedAt) / 1000),
      outBytes: j.versions.reduce((n, v) => n + v.size, 0), queue: queue.length,
      ...(lastError ? { error: String(lastError).slice(0, 300) } : {}),
    });
    if (j.failed) {
      mon.alert(`fail:${j.id}`, `не получилось ${j.failed} из ${j.count} версий (ролик ${j.id}, человек ${j.uid}). Ошибка: ${String(lastError || 'неизвестно').slice(0, 200)}`);
    }
    setImmediate(pump);
  }

  function sweep() {
    const now = Date.now();
    for (const j of [...jobs.values()]) {
      if (j.finishedAt && now - j.finishedAt > OUTPUT_TTL_MS) {
        fs.rmSync(path.join(outDir, j.id), { recursive: true, force: true });
        jobs.delete(j.id);
      }
    }
    saveJobs();
  }
  sweep();
  const sweepTimer = setInterval(sweep, 3600 * 1000);
  sweepTimer.unref();

  function send(res, code, body) {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
  }

  async function handleUpload(req, res, url, auth) {
    const uid = auth.uid;
    const rejectLog = (reason) => mon.log('reject', { uid, reason });
    if (uploading.has(uid) || activeJob(uid)) { rejectLog('busy'); return send(res, 409, { error: 'у тебя уже есть ролик в работе, дождись, пока он закончится' }); }
    const plan = planOf(auth);
    if (plan.w) {
      const used = weekUsed(uid);
      if (used.length >= plan.w) {
        const wait = used[used.length - plan.w] + WEEK_MS - Date.now();
        rejectLog('week');
        const more = plan.w < 5 ? ' Приведи друга, и у тебя каждую неделю будет на 1 ролик больше.' : '';
        return send(res, 429, {
          error: `Лимит на неделю: ${plan.w} ${plural(plan.w, 'ролик', 'ролика', 'роликов')}. Следующий можно через ${inDays(wait)}.${more}`,
          code: 'week',
        });
      }
    }
    const len = Number(req.headers['content-length']);
    if (len > maxBytes) { rejectLog('size'); return send(res, 413, { error: 'файл больше 500 МБ' }); }
    let count = parseInt(url.searchParams.get('count') || '1', 10);
    if (!(count >= 1 && count <= MAX_PER_VIDEO)) return send(res, 400, { error: 'количество версий от 1 до 5' });
    count = Math.min(count, plan.v);
    let name = 'video.mp4';
    try { name = path.basename(decodeURIComponent(req.headers['x-filename'] || '')) || name; } catch {}
    const stem = path.parse(name).name.slice(0, 120) || 'video';

    const id = crypto.randomBytes(9).toString('base64url');
    const src = path.join(uploadsDir, `${id}.bin`);
    uploading.add(uid);
    try {
      const ok = await new Promise((resolve, reject) => {
        let bytes = 0;
        const out = fs.createWriteStream(src);
        req.on('data', (chunk) => {
          bytes += chunk.length;
          if (bytes > maxBytes) { req.unpipe(out); out.destroy(); resolve(false); }
        });
        req.on('aborted', () => { out.destroy(); reject(new Error('upload aborted')); });
        req.on('error', (e) => { out.destroy(); reject(e); });
        out.on('error', reject);
        out.on('finish', () => resolve(true));
        req.pipe(out);
      });
      if (!ok) {
        fs.rmSync(src, { force: true });
        res.setHeader('Connection', 'close');
        res.on('finish', () => req.destroy());
        rejectLog('size');
        return send(res, 413, { error: 'файл больше 500 МБ' });
      }
      let info;
      try { info = await probe(ffmpeg, src); } catch (e) {
        fs.rmSync(src, { force: true });
        rejectLog('probe');
        return send(res, 400, { error: e.message });
      }
      if (info.dur > MAX_DURATION) {
        fs.rmSync(src, { force: true });
        rejectLog('duration');
        return send(res, 400, { error: 'ролик длиннее 3 минут' });
      }
      const key = `${uid}:${fingerprint(src)}`;
      const r = reserve(usage, key, count);
      if (r.error) {
        fs.rmSync(src, { force: true });
        rejectLog('limit');
        return send(res, 429, { error: r.error, used: r.used, max: MAX_PER_VIDEO });
      }
      saveUsage();
      // Only one upload per uid at a time (uploading set), so this check-then-add cannot race.
      let quotaAt;
      if (plan.w) {
        quotaAt = Date.now();
        const used = weekUsed(uid);
        used.push(quotaAt);
        quota[uid] = used;
        saveQuota();
        // Week is full now: tell them in the bot when the oldest slot frees up.
        if (used.length >= plan.w) remind(uid, 'refill', used[used.length - plan.w] + WEEK_MS);
      }
      const j = { id, uid, key, stem, src, count: r.count, ...(quotaAt ? { quotaAt } : {}), status: 'queued', done: 0, failed: 0,
        versions: [], createdAt: Date.now(), srcBytes: fs.statSync(src).size, srcSec: Math.round(info.dur) };
      jobs.set(id, j);
      queue.push(id);
      mon.log('enqueue', { id, uid, count: r.count, plan: plan.w ? `${plan.w}x${plan.v}` : 'paid', queue: load() });
      if (load() >= 4) mon.alert('queue', `в очереди ${load()} роликов, люди ждут дольше обычного. Если так часто, пора сервер мощнее.`, 3600 * 1000);
      saveJobs();
      send(res, 200, { jobId: id, count: r.count, used: r.used, remaining: MAX_PER_VIDEO - r.used, position: position(j) });
      setImmediate(pump);
    } catch (e) {
      fs.rmSync(src, { force: true });
      if (!res.headersSent && !res.destroyed) send(res, 400, { error: 'загрузка прервалась' });
    } finally {
      uploading.delete(uid);
    }
  }

  function handleFile(req, res, id, i, auth) {
    const j = jobs.get(id);
    if (!j || j.uid !== auth.uid) return send(res, 404, { error: 'файл не найден' });
    const v = j.versions.find((x) => x.i === i);
    if (!v || !fs.existsSync(v.file)) return send(res, 404, { error: 'файл не найден' });
    const fname = `${j.stem}_${i}.mp4`;
    const ascii = fname.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': fs.statSync(v.file).size,
      'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fname)}`,
    });
    fs.createReadStream(v.file).on('error', () => res.destroy()).pipe(res);
  }

  const server = http.createServer((req, res) => handle(req, res).catch((e) => {
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: 'ошибка сервера' }); else res.destroy();
  }));

  async function handle(req, res) {
    const origin = req.headers.origin;
    if (origin && origins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    }
    if (req.method === 'OPTIONS') {
      if (origin && origins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Filename');
        res.setHeader('Access-Control-Max-Age', '86400');
      }
      res.writeHead(204);
      return res.end();
    }
    try {
      // Prefix the origin instead of using a base: "//x" would otherwise be read as a host.
      let url;
      try { url = new URL(`http://x${req.url.startsWith('/') ? '' : '/'}${req.url}`); } catch {
        return send(res, 400, { error: 'неверный адрес' });
      }
      if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { ok: true, queue: load() });

      const bearer = /^Bearer (.+)$/.exec(req.headers.authorization || '');
      const auth = verify(bearer ? bearer[1] : url.searchParams.get('t'), secret);
      if (!auth) return send(res, 401, { error: 'войди в кабинет заново' });

      if (req.method === 'GET' && url.pathname === '/api/me') {
        const a = activeJob(auth.uid);
        const plan = planOf(auth);
        const used = plan.w ? weekUsed(auth.uid) : [];
        const week = plan.w ? {
          limit: plan.w, used: used.length,
          nextAt: used.length >= plan.w ? used[used.length - plan.w] + WEEK_MS : null,
        } : null;
        return send(res, 200, { uid: auth.uid, maxPerVideo: plan.v, active: a ? view(a) : null, week });
      }
      // Behaviour events from the page (opened, downloaded, shared…) go to the same log as jobs.
      if (req.method === 'POST' && url.pathname === '/api/ev') {
        const body = await new Promise((resolve) => {
          let raw = '';
          req.on('data', (c) => { raw += c; if (raw.length > 2000) req.destroy(); });
          req.on('end', () => resolve(raw));
          req.on('error', () => resolve(''));
        });
        let e = {};
        try { e = JSON.parse(body || '{}'); } catch { /* ignore */ }
        if (!PAGE_EVENTS.has(e.ev)) return send(res, 400, { error: 'неизвестное событие' });
        mon.log('page', { uid: auth.uid, what: e.ev, free: !!planOf(auth).w });
        return send(res, 200, { ok: true });
      }
      if (req.method === 'POST' && url.pathname === '/api/jobs') return await handleUpload(req, res, url, auth);
      let m = /^\/api\/jobs\/([\w-]+)$/.exec(url.pathname);
      if (req.method === 'GET' && m) {
        const j = jobs.get(m[1]);
        if (!j || j.uid !== auth.uid) return send(res, 404, { error: 'задача не найдена' });
        return send(res, 200, view(j));
      }
      m = /^\/files\/([\w-]+)\/(\d+)\.mp4$/.exec(url.pathname);
      if (req.method === 'GET' && m) return handleFile(req, res, m[1], +m[2], auth);
      send(res, 404, { error: 'не найдено' });
    } catch (e) {
      console.error(e);
      if (!res.headersSent) send(res, 500, { error: 'ошибка сервера' });
    }
  }
  // Big uploads over slow links must not hit Node's default 5-minute request timeout.
  server.requestTimeout = 0;
  server.on('close', () => { clearInterval(sweepTimer); clearInterval(remindTimer); mon.stop(); });
  server.uniq = { usage, history, jobs, queue, monitor: mon, quota, reminders, tickReminders };
  return server;
}

module.exports = { createServer, sign, verify, reserve, refund, planOf, MAX_PER_VIDEO };

if (require.main === module) {
  const port = Number(process.env.UNIQ_PORT || 8795);
  const server = createServer();
  const mon = server.uniq.monitor;
  mon.start();
  // Crash: tell Sasha, then exit and let systemd restart the service.
  const die = (kind) => (e) => {
    console.error(kind, e);
    const t = setTimeout(() => process.exit(1), 8000);
    mon.alert('crash', `сервис упал (${kind}: ${String(e && e.message || e).slice(0, 200)}), systemd поднимет его сам`, 0)
      .finally(() => { clearTimeout(t); process.exit(1); });
  };
  process.on('uncaughtException', die('uncaughtException'));
  process.on('unhandledRejection', die('unhandledRejection'));
  server.listen(port, process.env.UNIQ_HOST || '127.0.0.1', () => console.log(`uniq-server on :${port}`));
}
