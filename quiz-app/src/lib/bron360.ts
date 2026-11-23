// Бронь «Личного бренда на 360» (2 000 ₽, в счёт первого месяца, старт 19.01).
//
//   цепочка  — лист ожидания kind=360 получает по сообщению в день (CHAIN), начиная с BRON360_START;
//              кто записался позже, получает первое сразу после «Старт» в боте, дальше по дню.
//              Выпадают: забронировавшие, нажавшие «не актуально», заблокировавшие бота.
//   оплата   — /pay/bron360?u=<tg> → Продамус, order_id bron360_<tg>_<хвост> → prodamus-webhook → onBronPaid.
//   доступ   — роль bron360 до BRON_ACCESS_UNTIL: неделя 1 место №N + интервью (трек '360') + уникализатор
//              без лимитов, неделя 2 оптимизатор (bronOptOpen).
//   крон     — /api/cron-bron360 раз в день: следующий шаг цепочки, уникализатор через сутки, оптимизатор на 7-й день.

import { prisma } from '@/lib/prisma';
import { sendBotMessage, notifyAdmin } from '@/lib/telegram';
import { CATALOG } from '@/lib/catalog';
import { grantAccess } from '@/lib/access';
import { UNIQ_ADMINS } from '@/lib/uniq/access';
import {
  CHAIN, OPT_OUT_BUTTON, ROADMAP_URL, paidText, paidTextNoIntake, START_BUTTON,
  UNIQ_OPEN_TEXT, UNIQ_BUTTON, OPT_OPEN_TEXT, OPT_BUTTON, BRON_SEATS,
} from '@/content/bron360';

export const BRON_SLUG = 'bron-360';
export const BRON_ROLE = 'bron360';
export const BRON_CB_OFF = 'bron360_off';
/** Доступ брони живёт до старта и неделю после: дальше человек на 360 по доплате. */
export const BRON_ACCESS_UNTIL = new Date('2027-01-26T00:00:00+03:00');
const CABINET = (process.env.NEXT_PUBLIC_CABINET_URL || 'https://world.thesashatoyz.com').replace(/\/$/, '');
const BOT = process.env.BOT_USERNAME || 'testtoyzbot';
export const BOT_BRON_URL = `https://t.me/${BOT}?start=bron360`;

const DAY = 24 * 3600_000;
/** Между шагами цепочки: сутки с запасом на то, что крон срабатывает в одно время. */
const STEP_GAP = 20 * 3600_000;

const EV = {
  chain: 'bron360_chain',
  off: 'bron360_optout',
  blocked: 'bron360_blocked',
  paid: 'bron360_paid',
  uniq: 'bron360_uniq_sent',
  opt: 'bron360_opt_sent',
} as const;

/** Когда начинается цепочка. Нет переменной = цепочка не идёт (включает Саша). */
export function chainStart(): Date | null {
  const raw = (process.env.BRON360_START || '').trim();
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}
export function chainRunning(now = new Date()): boolean {
  const s = chainStart();
  return !!s && now >= s;
}

export function payUrl(tg: number, src: string, test = false): string {
  return `${CABINET}/pay/bron360?u=${tg}&src=${encodeURIComponent(src)}${test ? '&k=test' : ''}`;
}

// ── брони ─────────────────────────────────────────────────

async function activeBrons() {
  return prisma.productAccess.findMany({
    where: { productSlug: BRON_SLUG, status: 'active' },
    select: { telegramId: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
}

/** Сколько мест занято. Тестовые брони Саши не считаются. */
export async function seatsTaken(): Promise<number> {
  const rows = await activeBrons();
  return rows.filter((r) => !(r.telegramId && UNIQ_ADMINS.has(Number(r.telegramId)))).length;
}

/** Место человека №N по порядку брони, null = брони нет. */
export async function seatOf(tg: number): Promise<number | null> {
  const rows = (await activeBrons()).filter((r) => !(r.telegramId && UNIQ_ADMINS.has(Number(r.telegramId))));
  const i = rows.findIndex((r) => Number(r.telegramId) === tg);
  if (i >= 0) return i + 1;
  // Саша на тесте: показываем следующее место, в счёт не идёт.
  if (UNIQ_ADMINS.has(tg) && (await hasBron(tg))) return rows.length + 1;
  return null;
}

export async function hasBron(tg: number): Promise<boolean> {
  const row = await prisma.productAccess.findFirst({
    where: { telegramId: BigInt(tg), productSlug: BRON_SLUG, status: 'active', OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    select: { id: true },
  });
  return !!row;
}

export async function seatsFull(): Promise<boolean> {
  return (await seatsTaken()) >= BRON_SEATS;
}

/** Оптимизатор брони открывается на второй неделе: через 7 дней после брони. */
export async function bronOptOpen(tg: number): Promise<boolean> {
  const row = await prisma.productAccess.findFirst({
    where: { telegramId: BigInt(tg), productSlug: BRON_SLUG, status: 'active', OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  if (!row) return false;
  return UNIQ_ADMINS.has(tg) || Date.now() - row.createdAt.getTime() >= 7 * DAY - 6 * 3600_000;
}

// ── цепочка ───────────────────────────────────────────────

function chainKeyboard(tg: number, step: number, test = false) {
  const s = CHAIN[step];
  const rows: object[][] = [];
  if (s.roadmap) rows.push([{ text: 'смотреть роадмап', url: ROADMAP_URL }]);
  rows.push([{ text: s.book, url: payUrl(tg, `m${step + 1}`, test) }]);
  rows.push([{ text: OPT_OUT_BUTTON, callback_data: BRON_CB_OFF }]);
  return { inline_keyboard: rows };
}

/** Отправить шаг цепочки. log=false для теста Саши: в прогресс не пишем. */
export async function sendChainStep(tg: number, step: number, opts: { log?: boolean; test?: boolean; taken?: number } = {}) {
  const { log = true, test = false } = opts;
  const taken = opts.taken ?? (step === CHAIN.length - 1 ? await seatsTaken() : 0);
  const res = await sendBotMessage(tg, CHAIN[step].text(taken), chainKeyboard(tg, step, test), null);
  if (log) {
    if (res.ok) {
      await prisma.event.create({ data: { type: EV.chain, source: 'bron360', telegramId: BigInt(tg), metadata: { step, key: CHAIN[step].key, messageId: res.messageId ?? null } } });
    } else if (res.blocked) {
      await prisma.event.create({ data: { type: EV.blocked, source: 'bron360', telegramId: BigInt(tg), metadata: { step } } });
    }
  }
  return res;
}

async function tgSet(type: string): Promise<Set<number>> {
  const rows = await prisma.event.findMany({ where: { type }, select: { telegramId: true } });
  return new Set(rows.filter((r) => r.telegramId != null).map((r) => Number(r.telegramId)));
}

/** Телеграмы листа ожидания 360, до которых бот может достучаться. */
export async function waitlistTelegrams(): Promise<number[]> {
  const leads = await prisma.dwyLead.findMany({ where: { kind: '360', telegramId: { not: null } }, select: { telegramId: true } });
  return [...new Set(leads.map((l) => Number(l.telegramId)).filter((n) => Number.isFinite(n) && n > 0))];
}

/** Шаг цепочки, который человек должен получить сейчас, или null. */
async function nextStepFor(tg: number, now: Date): Promise<number | null> {
  const sent = await prisma.event.findMany({
    where: { type: EV.chain, telegramId: BigInt(tg) },
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  if (sent.length >= CHAIN.length) return null;
  if (sent.length && now.getTime() - sent[0].createdAt.getTime() < STEP_GAP) return null;
  return sent.length;
}

/** Записался после старта: первое сообщение сразу после «Старт». */
export async function chainOnJoin(tg: number): Promise<boolean> {
  if (!chainRunning()) return false;
  if (await hasBron(tg)) return false;
  const off = await prisma.event.findFirst({ where: { type: { in: [EV.off, EV.chain] }, telegramId: BigInt(tg) }, select: { id: true } });
  if (off) return false;
  const r = await sendChainStep(tg, 0);
  return r.ok;
}

export async function optOut(tg: number): Promise<void> {
  const seen = await prisma.event.findFirst({ where: { type: EV.off, telegramId: BigInt(tg) }, select: { id: true } });
  if (!seen) await prisma.event.create({ data: { type: EV.off, source: 'bron360', telegramId: BigInt(tg) } });
}

// ── после оплаты ──────────────────────────────────────────

function daysUntilEnd(now = new Date()): number {
  return Math.max(1, Math.ceil((BRON_ACCESS_UNTIL.getTime() - now.getTime()) / DAY));
}

/** Вызывается вебхуком Продамуса один раз на оплату. */
export async function onBronPaid(tg: number, orderId: string, amount: number, username?: string | null): Promise<void> {
  // Повтор вебхука по той же оплате: ничего второй раз не шлём.
  const dup = await prisma.event.findFirst({ where: { type: EV.paid, metadata: { path: ['orderId'], equals: orderId } }, select: { id: true } });
  if (dup) return;

  await grantAccess({ product: CATALOG.bron_360, telegramId: tg, source: orderId, days: daysUntilEnd() });
  await prisma.event.create({ data: { type: EV.paid, source: 'bron360', telegramId: BigInt(tg), productSlug: BRON_SLUG, metadata: { orderId, amount } } });

  const seat = (await seatOf(tg)) ?? (await seatsTaken());

  // Интервью: трек '360'. Если у человека уже есть анкета (ученик т2/т3), второй не заводим.
  const { ensureIntake } = await import('@/lib/intake');
  const existing = await prisma.intake.findUnique({ where: { telegramId: BigInt(tg) }, select: { id: true, track: true, status: true } });
  const fresh = !existing || (existing.track === '360' && existing.status !== 'done');
  if (!existing) await ensureIntake(tg, username ?? null, null, undefined, '360');

  if (fresh) {
    await sendBotMessage(tg, paidText(seat), { inline_keyboard: [[{ text: START_BUTTON, callback_data: 'intake:start' }]] }, null, 'bron360');
  } else {
    await sendBotMessage(tg, paidTextNoIntake(seat), undefined, null, 'bron360');
    await sendUniqOpen(tg);
  }

  const taken = await seatsTaken();
  await notifyAdmin(
    `💰 <b>Бронь 360</b>: место №${seat}\n👤 ${username ? '@' + username : 'tg ' + tg}\n💵 ${amount} ₽\nзанято ${taken} из ${BRON_SEATS}${fresh ? '' : '\n⚠ анкета у него уже была, интервью не запускал'}`,
    { alsoWork: true },
  );
}

/** Неделя 1: уникализатор. Один раз на человека. */
export async function sendUniqOpen(tg: number): Promise<void> {
  const seen = await prisma.event.findFirst({ where: { type: EV.uniq, telegramId: BigInt(tg) }, select: { id: true } });
  if (seen) return;
  const r = await sendBotMessage(tg, UNIQ_OPEN_TEXT, { inline_keyboard: [[{ text: UNIQ_BUTTON, web_app: { url: `${CABINET}/uniq` } }]] }, null, 'bron360');
  if (r.ok) await prisma.event.create({ data: { type: EV.uniq, source: 'bron360', telegramId: BigInt(tg) } });
}

/** Неделя 2: оптимизатор. Один раз на человека. */
export async function sendOptOpen(tg: number): Promise<void> {
  const seen = await prisma.event.findFirst({ where: { type: EV.opt, telegramId: BigInt(tg) }, select: { id: true } });
  if (seen) return;
  const r = await sendBotMessage(tg, OPT_OPEN_TEXT, { inline_keyboard: [[{ text: OPT_BUTTON, web_app: { url: `${CABINET}/optimizator` } }]] }, null, 'bron360');
  if (r.ok) await prisma.event.create({ data: { type: EV.opt, source: 'bron360', telegramId: BigInt(tg) } });
}

// ── крон ──────────────────────────────────────────────────

export async function runBronCron(now = new Date()) {
  const report = { chain: [0, 0, 0, 0, 0, 0] as number[], blocked: 0, uniq: 0, opt: 0, skipped: 'none' as string };

  // Брони: уникализатор через сутки (если интервью ещё не закончено), оптимизатор на 7-й день.
  const brons = await activeBrons();
  for (const b of brons) {
    if (!b.telegramId) continue;
    const tg = Number(b.telegramId);
    const age = now.getTime() - b.createdAt.getTime();
    if (age >= DAY - 4 * 3600_000) {
      const had = await prisma.event.findFirst({ where: { type: EV.uniq, telegramId: BigInt(tg) }, select: { id: true } });
      if (!had) { await sendUniqOpen(tg); report.uniq++; }
    }
    if (age >= 7 * DAY - 6 * 3600_000) {
      const had = await prisma.event.findFirst({ where: { type: EV.opt, telegramId: BigInt(tg) }, select: { id: true } });
      if (!had) { await sendOptOpen(tg); report.opt++; }
    }
  }

  if (!chainRunning(now)) {
    report.skipped = chainStart() ? 'before start' : 'BRON360_START not set';
    return report;
  }

  const [all, off, blocked] = await Promise.all([waitlistTelegrams(), tgSet(EV.off), tgSet(EV.blocked)]);
  const booked = new Set(brons.map((b) => Number(b.telegramId)));
  const taken = await seatsTaken();
  for (const tg of all) {
    if (off.has(tg) || blocked.has(tg) || booked.has(tg)) continue;
    const step = await nextStepFor(tg, now);
    if (step == null) continue;
    const r = await sendChainStep(tg, step, { taken });
    if (r.ok) report.chain[step]++;
    else if (r.blocked) report.blocked++;
  }
  return report;
}

/** /bron360_stat для Саши. */
export async function bronStat(): Promise<string> {
  const [all, off, blocked, brons] = await Promise.all([waitlistTelegrams(), tgSet(EV.off), tgSet(EV.blocked), activeBrons()]);
  const leads = await prisma.dwyLead.count({ where: { kind: '360' } });
  const sent = await prisma.event.groupBy({ by: ['telegramId'], where: { type: EV.chain }, _count: { _all: true } });
  const perStep = Array(CHAIN.length).fill(0);
  for (const s of sent) for (let i = 0; i < Math.min(s._count._all, CHAIN.length); i++) perStep[i]++;
  const start = chainStart();
  return [
    `бронь 360`,
    `старт цепочки: ${start ? start.toISOString() : 'не задан (BRON360_START)'}`,
    `лист ожидания: ${leads}, в боте ${all.length}`,
    `получили: ${perStep.map((n, i) => `${i + 1}: ${n}`).join(' · ')}`,
    `отписались: ${off.size} · заблокировали бота: ${blocked.size}`,
    `брони: ${await seatsTaken()} из ${BRON_SEATS}${brons.length !== (await seatsTaken()) ? ' (+ тест Саши)' : ''}`,
  ].join('\n');
}
