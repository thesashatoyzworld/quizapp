import { NextRequest, NextResponse } from 'next/server';
import { verifiedViewer } from '@/lib/reels/store';
import { tiersForTelegram } from '@/lib/kb/tier';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';
import { analyzeScript } from '@/lib/optimizator/analyze';
import { MODEL, UNLIMITED_IDS, limitFor, monthKey } from '@/lib/optimizator/config';
import { getRun, history, releaseSlot, reserveSlot, saveRun, usedThisMonth } from '@/lib/optimizator/store';
import { FIELD_MAX, SCRIPT_MAX, SCRIPT_MIN, toStudent, type Goal, type Stage } from '@/lib/optimizator/view';

export const runtime = 'nodejs';
// The analysis takes 70-135 s (model thinking is on).
export const maxDuration = 300;

// Section «Оптимизатор рилсов»: a student pastes a reel script, the server runs
// the Kallaway analysis prompt and saves the result.
//
//   GET  /api/cabinet/optimizator        → { identified, access, tier, used, limit, history }
//   GET  /api/cabinet/optimizator?id=... → { run } (owner only)
//   POST /api/cabinet/optimizator        → { run, used, limit } | { error, code }
//
// Identity is signed only (x-tg-init-data or kb_session cookie): runs cost money.

type Viewer = { id: number; tier: number; limit: number };

async function viewerOf(request: NextRequest): Promise<Viewer | null> {
  const id = verifiedViewer(request);
  if (!id) return null;
  const tiers = await tiersForTelegram(id);
  const tier = tiers.uroven ?? 0;
  const admin = UNLIMITED_IDS.has(id);
  return { id, tier: admin ? Math.max(tier, 3) : tier, limit: tiers.uroven !== undefined || admin ? limitFor(id, tier) : 0 };
}

const fail = (status: number, code: string, error: string, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ error, code, ...extra }, { status });

export async function GET(request: NextRequest) {
  try {
    const v = await viewerOf(request);
    if (!v) return NextResponse.json({ identified: false, access: false });
    if (v.limit <= 0) return NextResponse.json({ identified: true, access: false, tier: v.tier });

    const id = request.nextUrl.searchParams.get('id');
    if (id) {
      const run = await getRun(v.id, id);
      if (!run) return fail(404, 'not_found', 'Разбор не найден');
      return NextResponse.json({ run });
    }
    const [used, items] = await Promise.all([usedThisMonth(v.id), history(v.id)]);
    return NextResponse.json({ identified: true, access: true, tier: v.tier, used, limit: v.limit, history: items });
  } catch (err) {
    console.error('[optimizator] GET failed:', err);
    return fail(500, 'server_error', 'Не получилось загрузить раздел. Обнови страницу.');
  }
}

function clean(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

export async function POST(request: NextRequest) {
  let v: Viewer | null;
  try {
    v = await viewerOf(request);
  } catch (err) {
    console.error('[optimizator] access check failed:', err);
    return fail(500, 'server_error', 'Не получилось проверить доступ. Попробуй ещё раз.');
  }
  if (!v) return fail(401, 'not_identified', 'Войди через Telegram, чтобы запустить разбор.');
  if (v.limit <= 0) return fail(403, 'no_access', 'Раздел открыт ученикам курса «Новый Уровень».');

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail(400, 'bad_json', 'Не получилось прочитать запрос.');
  }
  const script = typeof body.script === 'string' ? body.script.trim() : '';
  const goal = body.goal === 'virality' ? 'virality' : body.goal === 'conversion' ? 'conversion' : null;
  if (!goal) return fail(400, 'bad_goal', 'Выбери цель ролика: заявки или охват.');
  // Missing stage = draft (older clients); any other value is rejected.
  const stage: Stage | null =
    body.stage === undefined || body.stage === null || body.stage === 'draft' ? 'draft' : body.stage === 'filmed' ? 'filmed' : null;
  if (!stage) return fail(400, 'bad_stage', 'Выбери, снят ли уже ролик.');
  if (script.length < SCRIPT_MIN) {
    return fail(400, 'script_too_short', `Сценарий слишком короткий: нужно хотя бы ${SCRIPT_MIN} символов.`);
  }
  if (script.length > SCRIPT_MAX) {
    return fail(400, 'script_too_long', `Сценарий слишком длинный: до ${SCRIPT_MAX} символов.`);
  }
  const niche = clean(body.niche, FIELD_MAX);
  const audience = clean(body.audience, FIELD_MAX);

  const month = monthKey();
  let reserved: number | null;
  try {
    reserved = await reserveSlot(v.id, v.limit);
  } catch (err) {
    console.error('[optimizator] reserve failed:', err);
    return fail(500, 'reserve_failed', 'Не получилось начать разбор. Попробуй ещё раз.');
  }
  if (reserved === null) {
    return fail(429, 'limit_reached', `Разборы на этот месяц закончились (${v.limit} из ${v.limit}). Новые откроются первого числа.`, {
      used: v.limit,
      limit: v.limit,
    });
  }

  const res = await analyzeScript({ script, goal: goal as Goal, stage, niche, audience });
  if (res.usage) await recordAnthropicUsage(MODEL, res.usage, 'optimizator');

  if (!res.ok) {
    console.error('[optimizator] analysis failed:', res.code, res.detail);
    await releaseSlot(v.id, month).catch((e) => console.error('[optimizator] release failed:', e));
    await saveRun({
      telegramId: v.id, goal: goal as Goal, stage, niche, audience, script, result: null, model: MODEL,
      inputTokens: res.usage?.input_tokens ?? null, outputTokens: res.usage?.output_tokens ?? null,
      durationMs: res.durationMs, status: 'error', error: `${res.code}: ${res.detail}`,
    }).catch((e) => console.error('[optimizator] save error run failed:', e));
    return fail(502, res.code, 'Разбор не получился, попытка не списана. Попробуй ещё раз через минуту.', {
      used: reserved - 1,
      limit: v.limit,
    });
  }

  let runId: string;
  try {
    runId = await saveRun({
      telegramId: v.id, goal: goal as Goal, stage, niche, audience, script, result: res.analysis, model: MODEL,
      inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens,
      durationMs: res.durationMs, status: 'ok',
    });
  } catch (err) {
    // The result is paid for: return it even if saving failed.
    console.error('[optimizator] save failed:', err);
    runId = '';
  }

  return NextResponse.json({
    run: {
      id: runId,
      createdAt: new Date().toISOString(),
      goal,
      stage,
      niche,
      audience,
      script,
      result: toStudent(res.analysis),
    },
    used: reserved,
    limit: v.limit,
  });
}
