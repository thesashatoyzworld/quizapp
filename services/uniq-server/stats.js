'use strict';
// Read the permanent log on the VPS: `node stats.js [days]` (default 7) prints a digest per day.
const path = require('path');
const { digestText, readLog } = require('./monitor');

const days = Number(process.argv[2] || 7);
const file = path.join(process.env.UNIQ_DATA || '/var/lib/uniq', 'log.jsonl');
const now = Date.now();
const DAY = 86400000;
const events = readLog(file, now - days * DAY);
for (let d = days - 1; d >= 0; d--) {
  const to = now - d * DAY;
  const from = to - DAY;
  console.log(`\n${new Date(from).toISOString().slice(0, 10)}`);
  console.log(digestText(events, { from, to }));
}
