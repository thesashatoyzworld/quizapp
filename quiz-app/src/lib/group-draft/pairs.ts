/**
 * Пары «вопрос ученика → ответ Саши» из ленты группы.
 *
 * В старых выгрузках нет ни reply, ни тем форума, поэтому пара собирается по
 * соседству: подряд идущие сообщения Саши склеиваются в один ответ, вопросом
 * считаются сообщения учеников перед ним (до трёх, не старше 12 часов).
 * Там, где reply есть, берётся именно то сообщение, на которое он ответил.
 */
import type { ShotPair } from './prompt';

export interface Msg {
  id: number;
  at: Date;
  owner: boolean;
  who: string;
  text: string;
  replyTo: number | null;
  thread: number | null;
}

const ANSWER_GAP_MS = 10 * 60 * 1000;
const QUESTION_WINDOW_MS = 12 * 60 * 60 * 1000;

/** Объявления и служебное: голоса в них нет. */
function isNoise(text: string): boolean {
  const t = text.trim();
  return (
    t.length < 12 ||
    /zoom\.us\/j\//.test(t) ||
    /^\[(голосовое|кружок|картинка|файл|document|photo)[^\]]*\]$/i.test(t)
  );
}

const clean = (s: string) => s.replace(/\n{3,}/g, '\n\n').trim();

export function buildPairs(all: Msg[], qLimit = 500, aLimit = 900): ShotPair[] {
  const byId = new Map(all.map((m) => [m.id, m]));
  const pairs: ShotPair[] = [];

  for (let i = 0; i < all.length; i++) {
    const m = all[i];
    if (!m.owner) continue;
    // Начало ответа: предыдущее сообщение не Саши в том же окне.
    const prevOwner = i > 0 && all[i - 1].owner && m.at.getTime() - all[i - 1].at.getTime() < ANSWER_GAP_MS;
    if (prevOwner) continue;

    const parts = [m];
    for (let j = i + 1; j < all.length; j++) {
      const n = all[j];
      if (!n.owner || n.at.getTime() - parts[parts.length - 1].at.getTime() > ANSWER_GAP_MS) break;
      if (n.thread !== m.thread) break;
      parts.push(n);
    }
    const answer = clean(parts.map((p) => p.text).filter((t) => !isNoise(t)).join('\n\n'));
    if (!answer || answer.length < 15) continue;

    let question = '';
    const replied = m.replyTo !== null ? byId.get(m.replyTo) : undefined;
    if (replied && !replied.owner) {
      question = `${replied.who}: ${replied.text}`;
    } else {
      const q: Msg[] = [];
      for (let k = i - 1; k >= 0 && q.length < 3; k--) {
        const p = all[k];
        if (m.at.getTime() - p.at.getTime() > QUESTION_WINDOW_MS) break;
        if (p.owner) break;
        if (m.thread !== null && p.thread !== null && p.thread !== m.thread) continue;
        q.unshift(p);
      }
      question = q.map((p) => `${p.who}: ${p.text}`).join('\n');
    }
    question = clean(question);
    if (!question) continue;

    pairs.push({ question: question.slice(0, qLimit), answer: answer.slice(0, aLimit) });
  }
  return pairs;
}
