// Расход на Claude API. Биллинг Anthropic закрыт: отчёт по деньгам отдают
// только админ-ключу (`sk-ant-admin…`), рабочий ключ получает 401, а OAuth
// Claude Code — 403. Поэтому считаем сами: в каждом ответе приходит usage,
// умножаем на прайс и складываем в тот же service_usage_daily.
//
// Считается только то, что идёт через код кабинета. Вызовы из терминала и
// подписка Claude Code сюда не попадают — подписка и так фиксированная.

import { prisma } from '@/lib/prisma';

/** Доллары за миллион токенов. Кэш: чтение 0.1×, запись 1.25× от входа. */
const PRICES: Record<string, { input: number; output: number }> = {
  'claude-opus-5': { input: 5, output: 25 },
  'claude-opus-4-8': { input: 5, output: 25 },
  'claude-sonnet-5': { input: 2, output: 10 },
  'claude-haiku-4-5': { input: 1, output: 5 },
};

const MTOK = 1_000_000;

export type AnthropicUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
};

/** Прайс модели. Незнакомая модель считается по Opus — лучше завысить, чем потерять. */
function priceOf(model: string) {
  const key = Object.keys(PRICES).find((m) => model.startsWith(m));
  return PRICES[key ?? 'claude-opus-5'];
}

async function addDay(metric: string, value: number, cost: number) {
  if (value <= 0) return;
  const today = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  await prisma.serviceUsageDaily.upsert({
    where: { service_date_metric: { service: 'anthropic_api', date: today, metric } },
    create: {
      service: 'anthropic_api',
      date: today,
      metric,
      value,
      cost,
      currency: 'USD',
      source: 'computed',
    },
    // День набирается вызовами, поэтому прибавляем, а не перезаписываем —
    // в отличие от сервисов, которые отдают готовую сумму за день.
    update: { value: { increment: value }, cost: { increment: cost } },
  });
}

/**
 * Записать расход одного вызова. Никогда не бросает: учёт денег не повод
 * ронять ответ клиенту.
 */
export async function recordAnthropicUsage(model: string, usage: AnthropicUsage): Promise<void> {
  try {
    const price = priceOf(model);
    const cacheRead = usage.cache_read_input_tokens ?? 0;
    const cacheWrite = usage.cache_creation_input_tokens ?? 0;

    await addDay('input_tokens', usage.input_tokens, (usage.input_tokens / MTOK) * price.input);
    await addDay('output_tokens', usage.output_tokens, (usage.output_tokens / MTOK) * price.output);
    await addDay('cache_read_tokens', cacheRead, (cacheRead / MTOK) * price.input * 0.1);
    await addDay('cache_write_tokens', cacheWrite, (cacheWrite / MTOK) * price.input * 1.25);
  } catch (err) {
    console.error('[costs] расход Claude не записался:', err);
  }
}
