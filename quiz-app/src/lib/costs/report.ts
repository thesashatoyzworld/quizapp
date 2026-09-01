// Сводка расхода за месяц: что уже потрачено, из чего сложилось и во что
// упрёмся к концу месяца.
//
// Каждый сервис считает в своей валюте, поэтому итог собираем дважды — в
// рублях и в долларах, по курсу ЦБ на последний собранный день.

import { prisma } from '@/lib/prisma';
import type { CostsReport, MetricLine, ServiceMonth } from './view';

export type { CostsReport, MetricLine, Pricing, ServiceMonth } from './view';

const MONTHS = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
];

const SERVICE_ORDER = ['anthropic_api', 'claude_sub', 'elevenlabs', 'kinescope', 'zoom'];

const SERVICE_TITLE: Record<string, string> = {
  anthropic_api: 'Claude API',
  claude_sub: 'Claude, подписка',
  elevenlabs: 'ElevenLabs',
  kinescope: 'Kinescope',
  zoom: 'Zoom',
};

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Границы месяца по строке YYYY-MM. */
function monthRange(month: string): { from: Date; to: Date; days: number } {
  const [y, m] = month.split('-').map(Number);
  return {
    from: new Date(Date.UTC(y, m - 1, 1)),
    to: new Date(Date.UTC(y, m, 0)),
    days: new Date(Date.UTC(y, m, 0)).getUTCDate(),
  };
}

export async function getCostsReport(month?: string): Promise<CostsReport> {
  const now = new Date();
  const key = month ?? iso(now).slice(0, 7);
  const { from, to, days } = monthRange(key);

  const [plans, usage, fx] = await Promise.all([
    prisma.serviceCostPlan.findMany({ where: { active: true } }),
    prisma.serviceUsageDaily.findMany({
      where: { date: { gte: from, lte: to } },
      orderBy: { date: 'asc' },
    }),
    prisma.fxRateDaily.findFirst({ orderBy: { date: 'desc' } }),
  ]);

  const usdRub = fx?.usdRub ?? null;
  const toRub = (value: number, currency: string) =>
    currency === 'RUB' ? value : usdRub ? value * usdRub : 0;

  // Текущий месяц считаем по прошедшим дням, прошлый — целиком.
  const isCurrent = key === iso(now).slice(0, 7);
  const daysElapsed = isCurrent ? now.getUTCDate() : days;

  const services: ServiceMonth[] = [];
  for (const plan of plans) {
    const rows = usage.filter((u) => u.service === plan.service);

    const byMetric = new Map<string, MetricLine>();
    const seenDays = new Map<string, number>();
    for (const row of rows) {
      const line = byMetric.get(row.metric) ?? { metric: row.metric, value: 0, cost: null };
      line.value += row.value;
      if (row.cost !== null) line.cost = (line.cost ?? 0) + row.cost;
      byMetric.set(row.metric, line);
      seenDays.set(row.metric, (seenDays.get(row.metric) ?? 0) + 1);
    }

    // Хранение — величина на день, а не за период: складывать байто-дни в
    // «гигабайты за месяц» бессмысленно. Показываем среднее за собранные дни,
    // ровно так же, как считает деньги сам Kinescope.
    const storage = byMetric.get('storage_bytes');
    if (storage) storage.value /= seenDays.get('storage_bytes') || 1;

    const usageCost = [...byMetric.values()].reduce((sum, m) => sum + (m.cost ?? 0), 0);
    const total = plan.amount + usageCost;
    // Тариф платится целиком в любом случае, растёт только потребление.
    const projection = plan.amount + (daysElapsed ? (usageCost / daysElapsed) * days : 0);

    services.push({
      service: plan.service,
      title: SERVICE_TITLE[plan.service] ?? plan.title,
      currency: plan.currency,
      planAmount: plan.amount,
      usageCost,
      total,
      projection,
      metrics: [...byMetric.values()].sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0)),
      billingDay: plan.billingDay,
      note: plan.note,
      hasUsage: rows.length > 0,
    });
  }

  services.sort(
    (a, b) => SERVICE_ORDER.indexOf(a.service) - SERVICE_ORDER.indexOf(b.service),
  );

  const totalRub = services.reduce((sum, s) => sum + toRub(s.total, s.currency), 0);
  const projectionRub = services.reduce((sum, s) => sum + toRub(s.projection, s.currency), 0);
  const totalUsd = usdRub ? totalRub / usdRub : 0;

  // Расход по дням: складываем всё в рубли, иначе график не сложить.
  const perDay = new Map<string, number>();
  for (const row of usage) {
    if (row.cost === null) continue;
    const date = iso(row.date);
    perDay.set(date, (perDay.get(date) ?? 0) + toRub(row.cost, row.currency ?? 'RUB'));
  }
  const daily = [...perDay].sort().map(([date, rub]) => ({ date, rub }));

  const last = usage.length ? usage[usage.length - 1] : null;

  return {
    month: key,
    monthLabel: `${MONTHS[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`,
    today: iso(now),
    daysElapsed,
    daysInMonth: days,
    usdRub,
    services,
    totalRub,
    totalUsd,
    projectionRub,
    daily,
    lastCollectedAt: last ? iso(last.date) : null,
  };
}

