// Откуда берутся цифры расхода. Каждый сервис отдаёт своё, приводим к общей
// форме: (день, метрика, значение).
//
// Проверено 01.09.2026 живыми ключами:
//   Kinescope   /v1/billing/usage        — cdn (байты), storage (байты за день), encoding (секунды)
//   ElevenLabs  /v1/usage/character-stats — символы по дням, права `user_read` НЕ требует
//   ЦБ РФ       daily_json.js             — курс доллара, без ключа
//
// Anthropic здесь нет намеренно: биллинг-эндпоинт закрыт и для рабочего ключа
// (401), и для OAuth Claude Code (403). Расход по моделям считается из `usage`
// в ответах самих вызовов, это отдельный слой.

/** Один день одной метрики одного сервиса. */
export type UsagePoint = {
  date: string; // YYYY-MM-DD
  metric: string;
  value: number;
  /** Деньги, если сервис назвал их сам. Иначе считаются по тарифу. */
  cost?: number;
  currency?: string;
};

const KINESCOPE_API = 'https://api.kinescope.io';
const ELEVENLABS_API = 'https://api.elevenlabs.io';

/** YYYY-MM-DD из даты в UTC. */
export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────
// Kinescope
// ─────────────────────────────────────────────────────────────

/**
 * Трафик, хранение и кодирование по дням.
 *
 * Единицы у сервиса разные и в документации описаны неточно: encoding там
 * назван минутами, но по факту это секунды — 120 037 за август сходится с
 * 33 часами исходников, а «120 тысяч минут» это две тысячи часов, которых не
 * было. Сверено с реальным счётом за август: 1938 ₽ против расчётных 1928 ₽.
 */
export async function kinescopeUsage(from: string, to: string): Promise<UsagePoint[]> {
  const token = process.env.KINESCOPE_TOKEN;
  if (!token) throw new Error('нет KINESCOPE_TOKEN');

  const res = await fetch(`${KINESCOPE_API}/v1/billing/usage?from=${from}&to=${to}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`kinescope ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const body = (await res.json()) as { data?: { date: string; usage: number; product: string }[] };
  const metricOf: Record<string, string> = {
    cdn: 'cdn_bytes',
    storage: 'storage_bytes',
    encoding: 'encoding_seconds',
  };

  // Одна дата может прийти несколькими строками (разбивка по проектам) — складываем.
  const sums = new Map<string, number>();
  for (const row of body.data ?? []) {
    const metric = metricOf[row.product];
    if (!metric) continue;
    const key = `${row.date.slice(0, 10)}|${metric}`;
    sums.set(key, (sums.get(key) ?? 0) + (row.usage ?? 0));
  }

  return [...sums].map(([key, value]) => {
    const [date, metric] = key.split('|');
    return { date, metric, value };
  });
}

// ─────────────────────────────────────────────────────────────
// ElevenLabs
// ─────────────────────────────────────────────────────────────

/**
 * Расход по дням. Отвечает на обычный рабочий ключ; `/v1/user/subscription`
 * (остаток пакета) — нет, там нужно право `user_read`.
 *
 * Тариф знать не нужно: у метрики `fiat_units_spent` сервис сам называет
 * потраченное, в центах. Сверено 01.09.2026 — 31 августа 406 минут стоили
 * 148,87 единиц, то есть $0,22 за час расшифровки, ровно прайс Scribe.
 */
export async function elevenLabsUsage(from: string, to: string): Promise<UsagePoint[]> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('нет ELEVENLABS_API_KEY');

  const startUnix = Date.parse(`${from}T00:00:00Z`);
  const endUnix = Date.parse(`${to}T23:59:59Z`);

  async function series(metric: string): Promise<Map<string, number>> {
    const res = await fetch(
      `${ELEVENLABS_API}/v1/usage/character-stats?start_unix=${startUnix}&end_unix=${endUnix}&metric=${metric}`,
      { headers: { 'xi-api-key': key as string } },
    );
    if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${(await res.text()).slice(0, 200)}`);

    const body = (await res.json()) as { time?: number[]; usage?: Record<string, number[]> };
    const rows = Object.values(body.usage ?? {});
    const out = new Map<string, number>();
    (body.time ?? []).forEach((ms, i) => {
      // Разрезов может быть несколько (по продуктам, по ключам) — нам нужна сумма.
      const value = rows.reduce((sum, row) => sum + (row[i] ?? 0), 0);
      if (value > 0) out.set(isoDay(new Date(ms)), value);
    });
    return out;
  }

  const [spent, minutes, credits] = await Promise.all([
    series('fiat_units_spent'),
    series('minutes_used'),
    series('credits'),
  ]);

  const points: UsagePoint[] = [];
  for (const [date, value] of minutes) {
    const cents = spent.get(date);
    points.push({
      date,
      metric: 'minutes_used',
      value,
      // Единицы приходят в центах, храним в долларах, как остальной прайс.
      ...(cents === undefined ? {} : { cost: cents / 100, currency: 'USD' }),
    });
  }
  for (const [date, value] of credits) {
    points.push({ date, metric: 'credits', value });
  }
  return points;
}

// ─────────────────────────────────────────────────────────────
// Курс
// ─────────────────────────────────────────────────────────────

/** Курс доллара ЦБ на сегодня. Без него доллары не свести с выпиской банка. */
export async function usdRubRate(): Promise<number | null> {
  try {
    const res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    if (!res.ok) return null;
    const body = (await res.json()) as { Valute?: { USD?: { Value?: number } } };
    return body.Valute?.USD?.Value ?? null;
  } catch {
    return null; // курс — украшение, из-за него сбор расхода падать не должен
  }
}
