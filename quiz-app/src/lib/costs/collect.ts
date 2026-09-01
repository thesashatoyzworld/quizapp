// Сбор расхода: сходить в сервисы, посчитать деньги по тарифу, положить в базу.
//
// Деньги считаем здесь, а не при показе: ставки со временем меняются, и день,
// посчитанный по вчерашнему тарифу, должен таким и остаться.

import { prisma } from '@/lib/prisma';
import { elevenLabsUsage, kinescopeUsage, usdRubRate, type UsagePoint } from './sources';
import type { Pricing } from './view';

const GB = 1_000_000_000;

/** Сколько дней в месяце этой даты — хранение тарифицируется средним за месяц. */
function daysInMonth(date: string): number {
  const [y, m] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/**
 * Деньги за один день по одной метрике. Возвращает null, если ставки нет:
 * тогда потребление в базе есть, а сумма пустая — так честнее, чем считать
 * по выдуманному тарифу.
 */
function costOf(point: UsagePoint, pricing: Pricing | null): number | null {
  if (!pricing) return null;
  switch (point.metric) {
    case 'cdn_bytes':
      return pricing.cdn_gb ? (point.value / GB) * pricing.cdn_gb : null;
    // Kinescope отдаёт хранение за каждый день отдельно, а счёт выставляет по
    // среднему за месяц. Делим на длину месяца — сумма дней даёт среднее.
    case 'storage_bytes':
      return pricing.storage_gb
        ? ((point.value / GB) * pricing.storage_gb) / daysInMonth(point.date)
        : null;
    case 'encoding_seconds':
      return pricing.encoding_min ? (point.value / 60) * pricing.encoding_min : null;
    case 'characters':
      return pricing.per_1k_chars ? (point.value / 1000) * pricing.per_1k_chars : null;
    default:
      return null;
  }
}

async function savePoints(service: string, points: UsagePoint[]): Promise<number> {
  const plan = await prisma.serviceCostPlan.findUnique({ where: { service } });
  const pricing = (plan?.pricing as unknown as Pricing | null) ?? null;
  const currency = plan?.currency ?? null;

  for (const point of points) {
    const cost = costOf(point, pricing);
    const data = {
      value: point.value,
      cost,
      currency: cost === null ? null : currency,
      source: 'api',
    };
    await prisma.serviceUsageDaily.upsert({
      where: {
        service_date_metric: { service, date: new Date(`${point.date}T00:00:00Z`), metric: point.metric },
      },
      create: { service, date: new Date(`${point.date}T00:00:00Z`), metric: point.metric, ...data },
      update: data,
    });
  }
  return points.length;
}

export type CollectResult = {
  from: string;
  to: string;
  saved: Record<string, number>;
  failed: Record<string, string>;
  usdRub: number | null;
};

/**
 * Собрать окно дней. Окно, а не один день: сервисы досчитывают вчерашние
 * цифры с задержкой, и повторный проход их поправит — ключ (сервис, день,
 * метрика) уникальный, строка перезапишется.
 */
export async function collectCosts(from: string, to: string): Promise<CollectResult> {
  const saved: Record<string, number> = {};
  const failed: Record<string, string> = {};

  const jobs: [string, () => Promise<UsagePoint[]>][] = [
    ['kinescope', () => kinescopeUsage(from, to)],
    ['elevenlabs', () => elevenLabsUsage(from, to)],
  ];

  // Последовательно и по одному: упавший сервис не должен уносить остальные.
  for (const [service, run] of jobs) {
    try {
      saved[service] = await savePoints(service, await run());
    } catch (err) {
      failed[service] = err instanceof Error ? err.message : String(err);
    }
  }

  const usdRub = await usdRubRate();
  if (usdRub) {
    const today = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
    await prisma.fxRateDaily.upsert({
      where: { date: today },
      create: { date: today, usdRub },
      update: { usdRub },
    });
  }

  return { from, to, saved, failed, usdRub };
}
