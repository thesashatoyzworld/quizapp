// «Довести до верхней ступени» (23.11, Sasha: «не хочется снимать ролик, который поднялся на 50%»): when the script with the
// best bundle is still below the top band of «шанс на залёт», the body is edited: what pulls it down (minus techniques of the
// chance model) goes or is reworked, 1-3 structural plus techniques are added, no new facts. Kept as is: the opening (the
// bundle's job), the call to action with its code word (the student's automation listens for it), client cases, numbers.
// Bench 23.11 (scripts/optimizator-telo-bench.ts, GSD-BRAND optimizator-zamer/telo_out_keep.json): 14 of 15 scripts below the
// top band reached it, the recheck held in 11; a blind Opus judge chose the edit in 14 of 15; 4 of 15 edits added facts, so an
// invention check with one repair follows. The shown chance is the lower of two scorings. Server only.
import { ask, json } from './nachala';
import { scoreShans } from './shans';
import MODEL_JSON from './data/shans-model.json';
import type { Shans, Telo } from './view';

type F = { set: string; id: string; name: string; part: string; weight: number };
const M = MODEL_JSON as unknown as { cuts: number[]; features: F[]; validation: { hit_share_by_band_new_authors: number[] } };
const TOP_SCORE = M.cuts[M.cuts.length - 1];
const TOP_SHARE = M.validation.hit_share_by_band_new_authors[M.cuts.length];
const OPUS = 'claude-opus-5-5';
const SONNET = 'claude-sonnet-5-5';

/** Plus techniques an edit may add without new facts (structure and phrasing, not events or numbers). */
const ADDABLE = new Set([
  'dsc:d21', 'dsc:d20', 'priemy:p04', 'priemy:p06', 'priemy:p14', 'g3:g3_11', 'priemy:p28', 'priemy:p31', 'priemy:p30',
  'priemy:p33', 'dsc:d25', 'priemy:p17', 'priemy:p34', 'g3:g3_19', 'g3:g3_02', 'priemy:p13', 'g3:g3_23', 'dsc:d35',
  'g3:g3_26', 'g3:g3_04', 'g3:g3_25', 'g3:g3_14', 'priemy:p20', 'priemy:p07', 'dsc:d28', 'priemy:p15',
]);
const ADD = M.features.filter((f) => ADDABLE.has(`${f.set}:${f.id}`)).sort((a, b) => b.weight - a.weight);

const SPLIT = '===ПРАВКИ===';

async function rewrite(orig: string, cur: string, minus: string[], plus: string[], score: number, fix?: string): Promise<{ text: string; changes: string[] } | null> {
  const prompt = `Ты редактор рилсов. Ниже сценарий автора. По базе из 4 700 рилсов мы знаем, какие приёмы в тексте мешают ролику залететь, а какие помогают.
Задача: поправить ТЕЛО сценария так, чтобы убрать то, что мешает, и добавить 1-3 помогающих приёма. Сейчас счёт ${score.toFixed(2)}, нужно добрать ещё ${Math.max(0, TOP_SCORE - score).toFixed(2)}.

ЖЁСТКИЕ ПРАВИЛА:
- Не выдумывай фактов, цифр, имён, историй, результатов, которых нет в исходнике: ни про автора, ни про клиентов, ни про зрителя. Можно переставлять, сокращать, переформулировать то, что есть.
- Голос автора: его слова, его обращение (ты/вы), его разговорный стиль. Меняй только нужные куски, остальное оставь дословно.
- Начало ролика (плашка и первые две фразы) не трогай.
- Призыв в конце (кодовое слово, куда писать, что получат) оставь ДОСЛОВНО, на том же месте: автоматизация автора ловит именно это слово именно там.
- Не удаляй кейсы и результаты клиентов и конкретные цифры (цены, граммы, калории, суммы). Их можно сократить, переставить, переподать (кейс как короткая история человека, а не как довод «смотрите какие результаты»), но факт должен остаться.
- Пометки монтажа (%% … %%, [В кадре: …], [Текст на экране: …]) сохраняй символ в символ, с теми же скобками и знаками.
- Не делай текст длиннее исходного больше чем на 15%.
${fix ? `\nПРОШЛАЯ ПРАВКА ВЫДУМАЛА ЛИШНЕЕ, убери это: ${fix}\n` : ''}
МЕШАЕТ (есть в тексте, убери или переделай так, чтобы признака не осталось): ${minus.length ? minus.join('; ') : 'нет'}
УЖЕ ЕСТЬ (сохрани): ${plus.length ? plus.join('; ') : 'нет'}
МОЖНО ДОБАВИТЬ (по силе, бери то, что естественно ложится на этот материал): ${ADD.filter((f) => !plus.includes(f.name)).map((f) => `${f.name} (${f.part})`).join('; ')}

ИСХОДНИК АВТОРА:
${orig}
${cur !== orig ? `\nТЕКУЩАЯ ПРАВКА (продолжай от неё):\n${cur}\n` : ''}
Верни новый сценарий целиком, без комментариев. Потом строку ${SPLIT} и 2-4 строки, что поменял и зачем, простыми словами для автора, каждая с «- ». Не упоминай эти правила и базу приёмов, пиши как редактор автору.`;
  const out = await ask(OPUS, prompt, 'medium');
  const [text, notes = ''] = out.split(SPLIT);
  const t = text.trim();
  if (t.split(/\s+/).length < orig.split(/\s+/).length * 0.5) return null;
  return { text: t, changes: notes.split('\n').map((l) => l.replace(/^\s*[-•]\s*/, '').trim()).filter(Boolean).slice(0, 4) };
}

/** What the edit claims that the original does not have; empty when clean. */
async function invented(orig: string, edit: string): Promise<string> {
  const out = await ask(SONNET, 'Ниже исходный сценарий рилса и его правка. Найди в правке факты, цифры, имена, события, истории, утверждения о людях ' +
    '(об авторе, клиентах, зрителе), которых НЕТ в исходнике. Перефразирование, перестановка, риторика, метафоры и вопросы выдумкой не считаются. ' +
    'Отдельно: изменён ли призыв в конце (кодовое слово, куда писать).\n' +
    'Верни только JSON: {"invented": ["что выдумано, коротко"], "cta_changed": true/false}\n\nИСХОДНИК:\n' + orig + '\n\nПРАВКА:\n' + edit, 'low');
  const r = json<{ invented?: string[]; cta_changed?: boolean }>(out, '{');
  const bad = [...(r?.invented || []), r?.cta_changed ? 'призыв в конце изменён, верни его дословно' : ''].filter(Boolean);
  return bad.join('; ');
}

/** null when the script already is in the top band or nothing could be done. Never throws. */
export async function buildTelo(script: string, before: number): Promise<Telo | null> {
  const t0 = Date.now();
  try {
    const s0 = await scoreShans(script);
    if (!s0 || s0.score >= TOP_SCORE) return null;
    let s: Shans = s0;
    let cur = script; let changes: string[] = []; let fix: string | undefined; let left = '';
    for (let i = 0; i < 3 && (s.score < TOP_SCORE || fix); i++) {
      const r: { text: string; changes: string[] } | null = await rewrite(script, cur, s.minus.map((x) => x.name), s.plus.map((x) => x.name), s.score, fix).catch(() => null);
      if (!r) break;
      const [sn, bad]: [Shans | null, string] = await Promise.all([scoreShans(r.text), invented(script, r.text).catch(() => '')]);
      if (!sn) break;
      fix = bad || undefined;
      // an edit with invented facts never becomes the result; it is retried once with what to remove
      if (!bad && sn.score >= s.score) { cur = r.text; s = sn; changes = r.changes; }
      left = bad;
    }
    if (cur === script) return null;
    // second, independent count of the final text: the lower of the two is shown, so a lucky labelling does not inflate it
    const re = await scoreShans(cur, { fresh: true });
    const share = Math.min(s.hitShare, re?.hitShare ?? s.hitShare);
    return {
      text: cur, changes, before, share, top: share >= TOP_SHARE,
      minus: (re && re.hitShare < s.hitShare ? re : s).minus.map((x) => x.name),
      ms: Date.now() - t0, ...(left ? { note: left } : {}),
    };
  } catch (err) {
    console.error('[optimizator/telo]', String((err as Error)?.message || err).slice(0, 300));
    return null;
  }
}
