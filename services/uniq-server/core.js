// copied from Danya's Uniqalizator 1.0.0 core.js
// Server changes: x264 preset/threads from env (UNIQ_PRESET, UNIQ_THREADS), ffmpeg under nice (UNIQ_NICE),
// optional history key prefix (keyPrefix) so history is per uid:fingerprint.
'use strict';
// Логика уникализатора = перенос tools/uniq/uniq.py на JS (те же диапазоны, те же фильтры ffmpeg).
const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CANDIDATES = 64;
const SCALE = { zoom: 0.006, speed: 0.002, dx: 0.25, dy: 0.25, contrast: 0.015,
  bright: 0.01, sat: 0.03, rs: 0.01, bs: 0.01, fps_k: 4 };

// Как round() в Python: половина уходит к чётному, иначе размеры кадра разойдутся с uniq.py.
function pyRound(x) {
  const r = Math.round(x);
  return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r;
}
const even = (x) => pyRound(x / 2) * 2;
const uni = (a, b, d) => Number((a + Math.random() * (b - a)).toFixed(d));
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

function run(ffmpeg, args, { binary = false, onSpawn } = {}) {
  return new Promise((resolve, reject) => {
    const nice = process.env.UNIQ_NICE ?? '10';
    const [cmd, argv] = nice !== '0' ? ['nice', ['-n', nice, ffmpeg, ...args]] : [ffmpeg, args];
    const p = spawn(cmd, argv, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    if (onSpawn) onSpawn(p);
    const out = [];
    let err = '';
    p.stdout.on('data', (d) => { if (binary) out.push(d); });
    p.stderr.on('data', (d) => { err = (err + d.toString('utf8')).slice(-65536); });
    p.on('error', reject);
    p.on('close', (code, signal) => resolve({ code, signal, out: binary ? Buffer.concat(out) : null, err }));
  });
}

// ffprobe не кладём ради размера: всё нужное печатает сам ffmpeg -i.
async function probe(ffmpeg, file) {
  const { err } = await run(ffmpeg, ['-hide_banner', '-i', file]);
  const lines = err.split(/\r?\n/);
  const idx = lines.findIndex((l) => /Stream #\d+:\d+.*: Video: /.test(l));
  if (idx < 0) throw new Error('это не похоже на видео');
  const vline = lines[idx];
  const dims = vline.match(/, (\d+)x(\d+)/);
  const durM = err.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!dims) throw new Error('не удалось прочитать размер кадра');
  if (!durM) throw new Error('не удалось прочитать длительность');
  let W = +dims[1], H = +dims[2];
  // Видео с телефона часто хранится повёрнутым: ffmpeg развернёт кадр сам, размеры надо поменять местами.
  let rot = null;
  for (let i = idx + 1; i < lines.length && !/Stream #/.test(lines[i]); i++) {
    const m = lines[i].match(/rotation of (-?[\d.]+) degrees/);
    if (m) rot = +m[1];
  }
  if (rot !== null && Math.abs(rot) % 180 === 90) [W, H] = [H, W];
  // yuv420p требует чётных сторон.
  W -= W % 2; H -= H % 2;
  const tbr = vline.match(/([\d.]+)(k?) tbr/);
  const fpsM = vline.match(/([\d.]+) fps/);
  let fps = tbr ? parseFloat(tbr[1]) * (tbr[2] ? 1000 : 1) : (fpsM ? parseFloat(fpsM[1]) : 30);
  if (!(fps > 0) || fps > 240) fps = fpsM && parseFloat(fpsM[1]) > 0 ? parseFloat(fpsM[1]) : 30;
  const dur = +durM[1] * 3600 + +durM[2] * 60 + +durM[3];
  if (dur < 1) throw new Error('видео короче секунды');
  return { W, H, dur, hasAudio: lines.some((l) => /Stream #\d+:\d+.*: Audio: /.test(l)), fps };
}

// Отпечаток: размер + первые и последние 2 МБ. Переименование файла его не меняет.
function fingerprint(file) {
  const size = fs.statSync(file).size;
  const h = crypto.createHash('sha1').update(String(size));
  const fd = fs.openSync(file, 'r');
  try {
    const CH = 2 << 20;
    const head = Buffer.alloc(Math.min(CH, size));
    fs.readSync(fd, head, 0, head.length, 0);
    h.update(head);
    const pos = Math.max(0, size - CH);
    const tail = Buffer.alloc(size - pos);
    fs.readSync(fd, tail, 0, tail.length, pos);
    h.update(tail);
  } finally { fs.closeSync(fd); }
  return h.digest('hex').slice(0, 16);
}

const COS = Array.from({ length: 32 }, (_, u) =>
  Array.from({ length: 32 }, (_, x) => Math.cos(Math.PI * (2 * x + 1) * u / 64)));

// 64-битный pHash кадра в момент t: 16 hex-символов.
async function phash(ffmpeg, file, t, onSpawn) {
  const r = await run(ffmpeg, ['-v', 'error', '-ss', t.toFixed(3), '-i', file, '-frames:v', '1',
    '-vf', 'scale=32:32:flags=area,format=gray', '-f', 'rawvideo', '-'], { binary: true, onSpawn });
  if (r.out.length < 1024) throw new Error('не удалось прочитать кадр');
  const d = [];
  for (let u = 0; u < 8; u++) for (let v = 0; v < 8; v++) {
    let s = 0;
    for (let y = 0; y < 32; y++) {
      const cy = COS[u][y];
      for (let x = 0; x < 32; x++) s += cy * r.out[y * 32 + x] * COS[v][x];
    }
    d.push(s);
  }
  const sorted = d.slice(1).sort((a, b) => a - b);
  const med = sorted[(sorted.length - 1) / 2]; // 63 значения без DC, середина одна
  let hex = '';
  for (let i = 0; i < 64; i += 4) {
    let n = 0;
    for (let b = 0; b < 4; b++) n = n * 2 + (d[i + b] > med ? 1 : 0);
    hex += n.toString(16);
  }
  return hex;
}

function sample() {
  return {
    zoom: uni(0.92, 0.985, 3),
    dx: uni(-0.8, 0.8, 2),
    dy: uni(-0.8, 0.8, 2),
    line: choice(['red', 'blue', null]),
    side: choice(['right', 'left', 'top', 'bottom']),
    speed: uni(1.003, 1.02, 4),
    contrast: uni(0.94, 1.03, 3),
    bright: uni(-0.03, 0.02, 3),
    sat: uni(0.92, 1.08, 3),
    rs: uni(-0.04, 0.02, 3),
    bs: uni(-0.05, 0.01, 3),
    fps_k: 1 + Math.floor(Math.random() * 30),
    t_in: uni(0, 0.3, 3),
    t_out: uni(0, 0.3, 3),
    gain: uni(-0.6, 0.6, 2),
    crf: choice([18, 19, 20, 21, 22]),
  };
}

function distance(a, b) {
  let s = 0;
  for (const k of Object.keys(SCALE)) {
    if (k in a && k in b) s += ((a[k] || 0) - (b[k] || 0)) ** 2 / SCALE[k] ** 2;
  }
  s += (a.line !== b.line ? 1 : 0) + (a.line && b.line && a.side !== b.side ? 1 : 0);
  return Math.sqrt(s);
}

// Из кандидатов берём самого далёкого от всех уже выданных версий.
function pick(used) {
  let best = null, bestD = -1;
  for (let i = 0; i < CANDIDATES; i++) {
    const c = sample();
    const d = used.length ? Math.min(...used.map((u) => distance(c, u))) : 1e9;
    if (d > bestD) { best = c; bestD = d; }
  }
  best.min_dist = bestD < 1e8 ? Math.round(bestD * 10) / 10 : null;
  return best;
}

function buildArgs(src, dst, p, info) {
  const { W, H, dur, hasAudio, fps } = info;
  const w = even(W * p.zoom), h = even(H * p.zoom);
  const mx = Math.floor((W - w) / 2), my = Math.floor((H - h) / 2);
  let x = mx + Math.floor(pyRound(p.dx * mx) / 2) * 2;
  let y = my + Math.floor(pyRound(p.dy * my) / 2) * 2;
  x = Math.max(0, Math.min(W - w, x));
  y = Math.max(0, Math.min(H - h, y));
  const vf = [`scale=${w}:${h}:flags=lanczos`];
  if (p.line) {
    const box = { right: `x=${w - 1}:y=0:w=1:h=${h}`, left: `x=0:y=0:w=1:h=${h}`,
      top: `x=0:y=0:w=${w}:h=1`, bottom: `x=0:y=${h - 1}:w=${w}:h=1` }[p.side];
    vf.push(`drawbox=${box}:color=${p.line}@1:t=fill`);
  }
  const fpsNum = pyRound(fps * 1000) + p.fps_k;
  vf.push(
    `eq=contrast=${p.contrast}:brightness=${p.bright}:saturation=${p.sat}`,
    `colorbalance=rm=${p.rs}:bm=${p.bs}:rh=${p.rs}:bh=${p.bs}`,
    `pad=${W}:${H}:${x}:${y}:black`,
    `setpts=(PTS-STARTPTS)/${p.speed}`,
    `fps=${fpsNum}/1000`,
    'format=yuv420p',
  );
  const span = dur - p.t_in - p.t_out;
  const outLen = span / p.speed;
  const args = ['-v', 'error', '-y', '-ss', String(p.t_in), '-t', span.toFixed(3), '-i', src,
    '-map', '0:v:0', '-vf', vf.join(',')];
  if (hasAudio) {
    args.push('-map', '0:a:0', '-af', `atempo=${p.speed},volume=${p.gain}dB,aresample=48000`,
      '-c:a', 'aac', '-b:a', '160k', '-ar', '48000');
  }
  args.push('-c:v', 'libx264', '-preset', process.env.UNIQ_PRESET || 'veryfast',
    '-threads', String(process.env.UNIQ_THREADS || 2), '-crf', String(p.crf), '-profile:v', 'high',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-map_metadata', '-1', '-map_chapters', '-1',
    '-metadata', `asset_id=${crypto.randomUUID()}`,
    '-metadata', `recipe_id=${crypto.randomBytes(16).toString('hex')}`,
    '-movflags', '+faststart+use_metadata_tags', '-t', outLen.toFixed(3), dst);
  return { args, outLen };
}

class History {
  constructor(file) {
    this.file = file;
    try { this.data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { this.data = {}; }
  }
  entry(key, name) { return (this.data[key] = this.data[key] || { name, versions: [] }); }
  save() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.data));
    fs.renameSync(tmp, this.file);
  }
  stats() {
    const all = Object.values(this.data);
    return { videos: all.length, versions: all.reduce((n, e) => n + e.versions.length, 0) };
  }
}

function nextIndex(dir) {
  const nums = fs.readdirSync(dir).map((f) => /^(\d+)\.mp4$/i.exec(f)).filter(Boolean).map((m) => +m[1]);
  return (nums.length ? Math.max(...nums) : 0) + 1;
}

// Одна очередь: несколько видео, по N версий на каждое, emit сообщает о ходе работы.
class Job {
  constructor({ ffmpeg, history, files, count, outRoot, parallel = 2, emit, keyPrefix = '' }) {
    Object.assign(this, { ffmpeg, history, files, outRoot, parallel, emit, keyPrefix });
    this.count = Math.max(1, Math.min(50, count | 0));
    this.children = new Set();
    this.stopped = false;
  }
  track = (p) => {
    this.children.add(p);
    p.on('close', () => this.children.delete(p));
    if (this.stopped) p.kill();
  };
  stop() {
    this.stopped = true;
    for (const p of this.children) p.kill();
  }
  async run() {
    const total = this.files.length * this.count;
    let done = 0, failed = 0;
    this.emit({ type: 'start', total });
    for (const src of this.files) {
      if (this.stopped) break;
      const name = path.basename(src);
      const stem = path.parse(src).name;
      try {
        const info = await probe(this.ffmpeg, src);
        const dir = path.join(this.outRoot || path.dirname(src), `${stem}_uniq`);
        fs.mkdirSync(dir, { recursive: true });
        const hash0 = await phash(this.ffmpeg, src, info.dur / 3, this.track);
        const entry = this.history.entry(this.keyPrefix + fingerprint(src), name);
        const used = [...entry.versions];
        const start = nextIndex(dir);
        const plan = [];
        for (let k = 0; k < this.count; k++) {
          const p = pick(used);
          used.push(p);
          plan.push({ i: start + k, p });
        }
        this.emit({ type: 'file', name, dir });
        let cursor = 0;
        const worker = async () => {
          while (cursor < plan.length && !this.stopped) {
            const { i, p } = plan[cursor++];
            const dst = path.join(dir, `${i}.mp4`);
            const part = path.join(dir, `${i}.part.mp4`);
            try {
              const { args, outLen } = buildArgs(src, part, p, info);
              const r = await run(this.ffmpeg, args, { onSpawn: this.track });
              if (this.stopped) throw new Error('stopped');
              if (r.code !== 0) throw new Error((r.err.trim().split(/\r?\n/).pop()) || 'ffmpeg упал');
              fs.renameSync(part, dst);
              const hash1 = await phash(this.ffmpeg, dst, info.dur / 3 / p.speed, this.track);
              entry.versions.push({ ...p, file: dst, at: Math.floor(Date.now() / 1000) });
              this.history.save();
              done++;
              this.emit({ type: 'version', name, i, file: dst, dir, hash0, hash1, done, failed, total,
                speed: p.speed, zoom: p.zoom, outLen: Math.round(outLen * 100) / 100 });
            } catch (e) {
              fs.rmSync(part, { force: true });
              if (this.stopped) return;
              failed++;
              this.emit({ type: 'error', name, i, message: e.message, done, failed, total });
            }
          }
        };
        await Promise.all(Array.from({ length: Math.max(1, this.parallel) }, worker));
      } catch (e) {
        if (this.stopped) break;
        failed += this.count;
        this.emit({ type: 'error', name, message: e.message, done, failed, total });
      }
    }
    this.emit({ type: 'end', done, failed, total, stopped: this.stopped, stats: this.history.stats() });
    return { done, failed, total, stopped: this.stopped };
  }
}

module.exports = { probe, fingerprint, phash, sample, distance, pick, buildArgs, History, Job, nextIndex, pyRound, even };
