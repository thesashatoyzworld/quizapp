import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarize, groupSections, type TaskRow } from './summary';

const now = new Date('2026-01-20T12:00:00Z');
const d = (s: string) => new Date(`${s}T00:00:00Z`);

function row(p: Partial<TaskRow> & { id: string }): TaskRow {
  return {
    section: 'A', sectionOrder: 0, grp: null, text: p.id, detail: null,
    status: 'open', lineDate: null, doneAt: null, ...p,
  };
}

const tasks = [
  row({ id: 't1' }),
  row({ id: 't2', status: 'done', doneAt: d('2026-01-18') }),
  row({ id: 't3', status: 'done', lineDate: d('2026-01-01') }),
  row({ id: 't4', status: 'wip', section: 'B', sectionOrder: 1 }),
  row({ id: 't5', section: 'B', sectionOrder: 1 }),
  row({ id: 't6', status: 'wip', section: 'B', sectionOrder: 1 }),
  row({ id: 't7', status: 'frozen', section: 'C', sectionOrder: 2 }),
];

test('summary counts open tasks, done within 7 days, last shift', () => {
  const s = summarize(tasks, [{ id: 'r1', shiftDate: d('2026-01-18') }, { id: 'r2', shiftDate: d('2026-01-19') }], now);
  assert.deepEqual(s, { open: 4, doneWeek: 1, lastReport: { id: 'r2', shiftDate: d('2026-01-19') } });
});

test('summary without reports', () => {
  assert.equal(summarize([], [], now).lastReport, null);
});

test('sections keep tracker order, wip first, done and frozen apart', () => {
  const s = groupSections([...tasks].reverse());
  assert.deepEqual(s.map((x) => x.title), ['A', 'B', 'C']);
  assert.deepEqual(s[1].open.map((t) => t.id), ['t6', 't4', 't5']);
  assert.deepEqual(s[0].done.map((t) => t.id), ['t3', 't2']);
  assert.deepEqual(s[2].open, []);
  assert.deepEqual(s[2].done.map((t) => t.id), ['t7']);
});
