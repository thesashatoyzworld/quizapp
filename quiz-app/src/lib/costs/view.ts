// Типы и подписи для страницы расходов. Отдельным файлом намеренно: страница
// клиентская, а `report.ts` тянет Prisma, за ней `pg`, а за ним `dns`/`net`,
// которых в браузере нет — сборка Turbopack падает. Всё, что нужно клиенту,
// живёт здесь и не знает про базу.

export type Pricing = {
  cdn_gb?: number;
  storage_gb?: number;
  encoding_min?: number;
  per_1k_chars?: number;
};

export type MetricLine = {
  metric: string;
  value: number;
  cost: number | null;
};

export type ServiceMonth = {
  service: string;
  title: string;
  currency: string;
  /** Фиксированная часть тарифа за месяц. */
  planAmount: number;
  /** Сколько набежало по потреблению. */
  usageCost: number;
  /** План плюс потребление. */
  total: number;
  /** Ожидаемый итог месяца, если темп сохранится. */
  projection: number;
  metrics: MetricLine[];
  billingDay: number | null;
  note: string | null;
  /** Есть ли у сервиса вообще собранные цифры — иначе это просто запись. */
  hasUsage: boolean;
};

export type CostsReport = {
  month: string; // YYYY-MM
  monthLabel: string;
  today: string;
  daysElapsed: number;
  daysInMonth: number;
  usdRub: number | null;
  services: ServiceMonth[];
  totalRub: number;
  totalUsd: number;
  projectionRub: number;
  /** Расход по дням в рублях, для графика. */
  daily: { date: string; rub: number }[];
  lastCollectedAt: string | null;
};

export const METRIC_LABEL: Record<string, string> = {
  cdn_bytes: 'трафик',
  storage_bytes: 'хранение',
  encoding_seconds: 'кодирование',
  characters: 'символы',
  input_tokens: 'входные токены',
  output_tokens: 'выходные токены',
  cache_read_tokens: 'токены из кэша',
  cache_write_tokens: 'запись в кэш',
};

/** Человеческий вид значения метрики: байты в гигабайтах, секунды в минутах. */
export function formatMetric(metric: string, value: number): string {
  if (metric === 'storage_bytes') return `${(value / 1_000_000_000).toFixed(1)} ГБ в среднем`;
  if (metric.endsWith('_bytes')) return `${(value / 1_000_000_000).toFixed(1)} ГБ`;
  if (metric.endsWith('_seconds')) return `${Math.round(value / 60)} мин`;
  return value.toLocaleString('ru-RU');
}
