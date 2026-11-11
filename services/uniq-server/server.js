'use strict';
// Uniq server: HTTP API around Danya's core.js. One global FIFO queue, one version at a time.
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { probe, fingerprint, History, Job } = require('./core');
const { createMonitor } = require('./monitor');

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
  // Token flag `free` (not a student of the course): at most this many videos per 24 h.
  const freePerDay = Number(opts.freePerDay ?? process.env.UNIQ_FREE_PER_DAY ?? 1);
  const mon = opts.monitor || createMonitor({ dataDir });
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
    if (auth.free) {
      // Jobs live 24 h after they finish, so every job created in the last 24 h is still here.
      // A job that produced nothing does not count.
      const dayAgo = Date.now() - 24 * 3600 * 1000;
      const recent = [...jobs.values()].filter((j) => j.uid === uid && j.createdAt > dayAgo && !(j.status === 'failed' || (j.finishedAt && !j.done)))
        .sort((a, b) => a.createdAt - b.createdAt);
      if (recent.length >= freePerDay) {
        const h = Math.max(1, Math.ceil((recent[recent.length - freePerDay].createdAt + 24 * 3600 * 1000 - Date.now()) / 3600e3));
        rejectLog('free');
        return send(res, 429, { error: `бесплатно ${freePerDay === 1 ? '1 ролик' : `${freePerDay} ролика`} в сутки, следующий можно через ${h} ч. Ученикам курса «Новый уровень» без ограничений`, code: 'free' });
      }
    }
    const len = Number(req.headers['content-length']);
    if (len > maxBytes) { rejectLog('size'); return send(res, 413, { error: 'файл больше 500 МБ' }); }
    let count = parseInt(url.searchParams.get('count') || '1', 10);
    if (!(count >= 1 && count <= MAX_PER_VIDEO)) return send(res, 400, { error: 'количество версий от 1 до 5' });
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
      const j = { id, uid, key, stem, src, count: r.count, status: 'queued', done: 0, failed: 0,
        versions: [], createdAt: Date.now(), srcBytes: fs.statSync(src).size, srcSec: Math.round(info.dur) };
      jobs.set(id, j);
      queue.push(id);
      mon.log('enqueue', { id, uid, count: r.count, queue: load() });
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
        return send(res, 200, { uid: auth.uid, maxPerVideo: MAX_PER_VIDEO, active: a ? view(a) : null });
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
  server.on('close', () => { clearInterval(sweepTimer); mon.stop(); });
  server.uniq = { usage, history, jobs, queue, monitor: mon };
  return server;
}

module.exports = { createServer, sign, verify, reserve, refund, MAX_PER_VIDEO };

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
