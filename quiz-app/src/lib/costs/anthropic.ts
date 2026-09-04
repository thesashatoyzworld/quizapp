// Расход на Claude API. Биллинг Anthropic закрыт: отчёт по деньгам отдают
// только админ-ключу (`sk-ant-admin…`), рабочий ключ получает 401, а OAuth
// Claude Code — 403. Поэтому считаем сами: в каждом ответе приходит usage,
// умножаем на прайс и складываем в тот же service_usage_daily.
//
// Считается только то, что идёт через код кабинета. Вызовы из терминала и
// подписка Claude Code сюда не попадают — подписка и так фиксированная.
//
// Кроме общей суммы пишем разбивку по тому, кто сжёг: помощник в продажах,
// бот по материалам, маршрутные карты. 04.09 баланс обнулился за день, и по
// одной общей цифре было не видно ни кто это был, ни что кэш перестал
// работать. Теперь видно и то и другое, а на превышении дневного порога
// прилетает сообщение в личку.

import { prisma } from '@/lib/prisma';
import { notifyAdmin } from '@/lib/telegram';

/** Доллары за миллион токенов. Кэш: чтение 0.1×, запись 1.25× от входа. */
const PRICES: Record<string, { input: number; output: number }> = {
  'claude-opus-5': { input: 5, output: 25 },
  'claude-opus-4-8': { input: 5, output: 25 },
  'claude-sonnet-5': { input: 2, output: 10 },
  'claude-haiku-4-5': { input: 1, output: 5 },
};

const MTOK = 1_000_000;

/** Кто сжёг. Подписи для кабинета лежат в view.ts. */
export type CostConsumer = 'sales' | 'kb' | 'roadmap' | 'zoom' | 'other';

/** Шаг лестницы порогов за день, в долларах. */
const ALERT_STEP_USD = Number(process.env.COSTS_ALERT_USD || 5);

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

function today(): Date {
  return new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
}

async function addDay(metric: string, value: number, cost: number) {
  if (value <= 0) return;
  await prisma.serviceUsageDaily.upsert({
    where: { service_date_metric: { service: 'anthropic_api', date: today(), metric } },
    create: {
      service: 'anthropic_api',
      date: today(),
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

/** Сколько уже насчитано за сегодня по Claude, в долларах. */
async function spentToday(): Promise<number> {
  const agg = await prisma.serviceUsageDaily.aggregate({
    where: { service: 'anthropic_api', date: today() },
    _sum: { cost: true },
  });
  return agg._sum.cost ?? 0;
}

/**
 * Сообщение в личку, когда день перешагнул очередную ступень порога.
 *
 * Дедуп без отдельного флага: пишем только тому вызову, на котором перешли
 * границу. Два параллельных вызова в теории дадут два сообщения — это дешевле,
 * чем таблица состояния ради сторожа.
 */
async function alertIfCrossed(before: number, after: number) {
  if (ALERT_STEP_USD <= 0) return;
  const step = Math.floor(after / ALERT_STEP_USD);
  if (step <= Math.floor(before / ALERT_STEP_USD)) return;

  const rows = await prisma.anthropicUsageDaily.findMany({
    where: { date: today() },
    orderBy: { cost: 'desc' },
  });
  const byConsumer = new Map<string, number>();
  for (const r of rows) byConsumer.set(r.consumer, (byConsumer.get(r.consumer) ?? 0) + r.cost);

  const lines = [
    `⚠️ <b>Claude за сегодня: $${after.toFixed(2)}</b>`,
    '',
    ...[...byConsumer]
      .sort((a, b) => b[1] - a[1])
      .map(([who, cost]) => `• ${who} — $${cost.toFixed(2)}`),
    '',
    '<a href="https://world.thesashatoyz.com/admin/rashody">Раздел «Расходы»</a>',
  ];
  await notifyAdmin(lines.join('\n'), { parseMode: 'HTML', disableLinkPreview: true });
}

/**
 * Записать расход одного вызова. Никогда не бросает: учёт денег не повод
 * ронять ответ клиенту.
 */
export async function recordAnthropicUsage(
  model: string,
  usage: AnthropicUsage,
  consumer: CostConsumer = 'other',
): Promise<void> {
  try {
    const price = priceOf(model);
    const cacheRead = usage.cache_read_input_tokens ?? 0;
    const cacheWrite = usage.cache_creation_input_tokens ?? 0;

    const cost = {
      input: (usage.input_tokens / MTOK) * price.input,
      output: (usage.output_tokens / MTOK) * price.output,
      cacheRead: (cacheRead / MTOK) * price.input * 0.1,
      cacheWrite: (cacheWrite / MTOK) * price.input * 1.25,
    };
    const total = cost.input + cost.output + cost.cacheRead + cost.cacheWrite;

    const before = await spentToday();

    await addDay('input_tokens', usage.input_tokens, cost.input);
    await addDay('output_tokens', usage.output_tokens, cost.output);
    await addDay('cache_read_tokens', cacheRead, cost.cacheRead);
    await addDay('cache_write_tokens', cacheWrite, cost.cacheWrite);

    await prisma.anthropicUsageDaily.upsert({
      where: { date_consumer_model: { date: today(), consumer, model } },
      create: {
        date: today(),
        consumer,
        model,
        calls: 1,
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        cacheReadTokens: cacheRead,
        cacheWriteTokens: cacheWrite,
        cost: total,
      },
      update: {
        calls: { increment: 1 },
        inputTokens: { increment: usage.input_tokens },
        outputTokens: { increment: usage.output_tokens },
        cacheReadTokens: { increment: cacheRead },
        cacheWriteTokens: { increment: cacheWrite },
        cost: { increment: total },
      },
    });

    await alertIfCrossed(before, before + total);
  } catch (err) {
    console.error('[costs] расход Claude не записался:', err);
  }
}
