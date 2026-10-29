import { NextRequest, NextResponse } from 'next/server';
import { verifiedViewer } from '@/lib/reels/store';
import { tiersForTelegram } from '@/lib/kb/tier';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';
import { analyzeScript } from '@/lib/optimizator/analyze';
import { LADDER_ON, MODEL, UNLIMITED_IDS, limitFor, monthKey } from '@/lib/optimizator/config';
import { findDemand, scriptPhrases, type DemandEvidence } from '@/lib/optimizator/demand';
import { runLadder } from '@/lib/optimizator/ladder';
import {
  getRun, history, lastUsername, releaseSlot, reserveSlot, saveRun, studentLadder, usedThisMonth, type StoredDemand,
} from '@/lib/optimizator/store';
import { SCRIPT_MAX, SCRIPT_MIN, normalizeUsername, toStudent, type Analysis, type DemandLink } from '@/lib/optimizator/view';

export const runtime = 'nodejs';
// The analysis takes 70-135 s (model thinking is on), plus up to 8 s of demand search.
// The ladder runs alongside: own reels on the first run per week add HikerAPI + Scribe.
export const maxDuration = 300;

// Section «Оптимизатор рилсов»: a student pastes a reel script, the server looks
// up demand evidence in the outliers base (findDemand), runs the Kallaway analysis
// prompt and saves the result. Goal and format are detected by the model.
// In parallel the ladder (Opus) compares the script with 8 reels of known outcome:
// the student's own past reels when an Instagram username is given, else expert
// reels on a close topic. Same run, same monthly slot.
//
//   GET  /api/cabinet/optimizator        → { identified, access, tier, used, limit, history, instagram, ladder }
//   GET  /api/cabinet/optimizator?id=... → { run } (owner only)
//   POST /api/cabinet/optimizator {script, instagram?} → { run, used, limit } | { error, code }
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
    const [used, items, instagram] = await Promise.all([
      usedThisMonth(v.id), history(v.id), lastUsername(v.id).catch(() => null),
    ]);
    return NextResponse.json({
      identified: true, access: true, tier: v.tier, used, limit: v.limit, history: items, instagram, ladder: LADDER_ON,
    });
  } catch (err) {
    console.error('[optimizator] GET failed:', err);
    return fail(500, 'server_error', 'Не получилось загрузить раздел. Обнови страницу.');
  }
}

const LINK_TEXT_MAX = 140;

/**
 * Keep only matched ids that were actually sent, and turn them into Instagram links
 * here on the server: the model never sees urls, so it cannot invent one.
 */
function linkDemand(evidence: DemandEvidence, analysis: Analysis): StoredDemand {
  const byId = new Map(evidence.items.map((it) => [it.id, it]));
  const d = analysis.demand;
  let links: DemandLink[] = [];
  if (d) {
    if (!evidence.searched) {
      // Nothing was searched: whatever the model says, there is no evidence either way.
      d.status = 'no_data';
      d.matched_ids = [];
    }
    d.matched_ids = [...new Set(d.matched_ids.filter((id) => byId.has(id)))].slice(0, 5);
    links = d.matched_ids.map((id) => {
      const it = byId.get(id)!;
      const text = it.text.replace(/\s+/g, ' ').trim();
      return {
        id, author: it.author, kind: it.kind, ratio: it.ratio, url: it.url,
        text: text.length > LINK_TEXT_MAX ? text.slice(0, LINK_TEXT_MAX - 1) + '…' : text,
      };
    });
  }
  return { ...evidence, links };
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
  if (script.length < SCRIPT_MIN) {
    return fail(400, 'script_too_short', `Сценарий слишком короткий: нужно хотя бы ${SCRIPT_MIN} символов.`);
  }
  if (script.length > SCRIPT_MAX) {
    return fail(400, 'script_too_long', `Сценарий слишком длинный: до ${SCRIPT_MAX} символов.`);
  }

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

  const instagram = normalizeUsername(body.instagram);
  // One Haiku call for search phrases, shared by the demand search and the ladder's topic anchors.
  const phrases = scriptPhrases(script);
  phrases.catch(() => { /* findDemand and the ladder handle it */ });
  // Never throws; runs next to the analysis so the total time barely grows.
  const ladderP = LADDER_ON ? runLadder({ script, username: instagram, phrases }) : Promise.resolve(null);

  // Never throws; its Haiku call records its own cost.
  const evidence = await findDemand(script, phrases);
  const res = await analyzeScript({
    script,
    demand: { ...evidence, items: evidence.items.map(({ url: _url, ...it }) => { void _url; return it; }) },
  });
  if (res.usage) await recordAnthropicUsage(MODEL, res.usage, 'optimizator');

  const ladder = await ladderP;
  if (ladder) {
    const u = ladder.usage;
    console.log(`[optimizator] ladder ${ladder.kind} ${ladder.wins}/${ladder.total} score ${ladder.score}: ` +
      `in ${u.input} out ${u.output} cache r ${u.cacheRead} w ${u.cacheWrite}, ${Math.round(u.ms / 1000)} s`);
  }

  if (!res.ok) {
    console.error('[optimizator] analysis failed:', res.code, res.detail);
    await releaseSlot(v.id, month).catch((e) => console.error('[optimizator] release failed:', e));
    await saveRun({
      telegramId: v.id, goal: 'unknown', script, result: null, demand: { ...evidence, links: [] }, model: MODEL,
      inputTokens: res.usage?.input_tokens ?? null, outputTokens: res.usage?.output_tokens ?? null,
      durationMs: res.durationMs, status: 'error', error: `${res.code}: ${res.detail}`,
    }).catch((e) => console.error('[optimizator] save error run failed:', e));
    return fail(502, res.code, 'Разбор не получился, попытка не списана. Попробуй ещё раз через минуту.', {
      used: reserved - 1,
      limit: v.limit,
    });
  }

  const demand = linkDemand(evidence, res.analysis);
  let runId: string;
  try {
    runId = await saveRun({
      telegramId: v.id, goal: res.analysis.goal, script, result: res.analysis, demand, model: MODEL, ladder, instagram,
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
      goal: res.analysis.goal,
      stage: null,
      script,
      result: toStudent(res.analysis),
      demandLinks: demand.links,
      ladder: ladder ? studentLadder(ladder) : null,
    },
    used: reserved,
    limit: v.limit,
  });
}
