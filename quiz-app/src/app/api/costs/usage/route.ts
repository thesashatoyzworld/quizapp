// ─────────────────────────────────────────────────────────────
// Приёмник расхода на Claude из проектов вне кабинета.
//
// Конвейер созвонов, reels-optimizer и прочие живут отдельно и жгут тот же
// ключ. Чтобы их расход не проходил мимо, они шлют сюда usage после каждого
// вызова, а считается он ровно так же, как у кабинета.
//
// Гейт тот же, что у кронов: Bearer CRON_SECRET. Ключей и денег в теле нет,
// только счётчики токенов.
//
// Пример:
//   curl -X POST https://world.thesashatoyz.com/api/costs/usage \
//     -H "Authorization: Bearer $CRON_SECRET" -H "Content-Type: application/json" \
//     -d '{"model":"claude-opus-5","consumer":"zoom","usage":{"input_tokens":1200,"output_tokens":800}}'
//
// consumer необязателен и нужен только для разбивки «кто сжёг» в кабинете.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { recordAnthropicUsage, type CostConsumer } from '@/lib/costs/anthropic';

/** Кого сюда пускаем в разбивку. Незнакомое имя падает в «прочее». */
const CONSUMERS: CostConsumer[] = ['sales', 'kb', 'roadmap', 'zoom', 'other'];

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    model?: string;
    consumer?: string;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_read_input_tokens?: number | null;
      cache_creation_input_tokens?: number | null;
    };
  } | null;

  if (!body?.model || !body.usage) {
    return NextResponse.json({ error: 'нужны model и usage' }, { status: 400 });
  }

  const input = Number(body.usage.input_tokens ?? 0);
  const output = Number(body.usage.output_tokens ?? 0);
  if (!Number.isFinite(input) || !Number.isFinite(output)) {
    return NextResponse.json({ error: 'токены должны быть числами' }, { status: 400 });
  }

  const consumer = CONSUMERS.find((c) => c === body.consumer) ?? 'other';

  await recordAnthropicUsage(
    body.model,
    {
      input_tokens: input,
      output_tokens: output,
      cache_read_input_tokens: Number(body.usage.cache_read_input_tokens ?? 0),
      cache_creation_input_tokens: Number(body.usage.cache_creation_input_tokens ?? 0),
    },
    consumer,
  );

  return NextResponse.json({ ok: true });
}
