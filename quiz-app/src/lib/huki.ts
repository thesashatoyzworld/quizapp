import crypto from 'node:crypto';
import type { NextRequest } from 'next/server';
import data from '@/content/huki-data.json';
import { prisma } from './prisma';
import { SESSION_COOKIE, verifyInitData, verifySession } from './telegram-login';

// ─────────────────────────────────────────────────────────────
// База «5000 хуков» (/huki) за подпиской на канал.
//
// Страница открыта всем, но в HTML лежит только превью. Вся база и файлы
// отдаются отсюда, и только тому, у кого есть пропуск:
//   - cookie `huki_pass` (выдаётся после проверки подписки);
//   - сессия кабинета `kb_session` — клиентов не гейтим;
//   - подписанная initData мини-аппа + подписка на канал или активный доступ.
//
// Снаружи в Телеграм ведёт кнопка на бота (`?start=huki`): бот сам проверяет
// подписку и присылает web_app-кнопку, а внутри мини-аппа срабатывает initData.
// ─────────────────────────────────────────────────────────────

export interface Hook {
  n: number | null;
  hook: string;
  example: string;
  psychology: string;
}
export interface HookCategory {
  name: string;
  file: string;
  items: Hook[];
}

export const HUKI = data as HookCategory[];

/** Промпт для нейронки: на странице под блюром, текст отдаём только с базой. */
export const HUKI_PROMPT = "Ниже база хуков для рилс и каруселей. У каждого есть шаблон, пример и психология: почему он цепляет.\n\nМоя ниша: [чем ты занимаешься]\nКто меня смотрит: [кто твой человек и что у него болит]\nО чём ролик или пост: [тема одной фразой]\n\nПодбери из базы 10 шаблонов, которые лучше всего подходят под эту тему, и перепиши каждый под меня.\nДля каждого дай:\n1. номер шаблона из базы\n2. готовую первую фразу, как я сказал бы её вслух\n3. одну строку, почему это зацепит именно мою аудиторию\n\nБери только шаблоны из базы, новые не придумывай.\nПиши просто, без канцелярита и пафоса.";
export const HUKI_CHANNEL = '@sashatoyz';
export const PASS_COOKIE = 'huki_pass';
export const PASS_TTL_SEC = 60 * 60 * 24 * 365;

const NL = '\n';
const fmt = (h: Hook) =>
  (h.n != null ? '№ ' + h.n + NL : '') +
  'Хук: ' + h.hook +
  (h.example ? NL + 'Пример: ' + h.example : '') +
  (h.psychology ? NL + 'Психология: ' + h.psychology : '');

export function categoryText(c: HookCategory): string {
  return 'БАЗА ХУКОВ · ' + c.name + NL + NL + c.items.map(fmt).join(NL + NL);
}

export function allText(): string {
  const total = HUKI.reduce((a, c) => a + c.items.length, 0);
  return (
    '5000 ВИРУСНЫХ ХУКОВ С ПСИХОЛОГИЕЙ' + NL +
    total + ' хуков в ' + HUKI.length + ' категориях. У каждого: шаблон, пример и почему он цепляет.' + NL + NL +
    'КАТЕГОРИИ:' + NL + HUKI.map((c) => '- ' + c.name + ' (' + c.items.length + ')').join(NL) +
    NL + NL + NL +
    HUKI.map((c) => '='.repeat(40) + NL + categoryText(c)).join(NL + NL + NL) + NL
  );
}

// Пропуск: `h.<telegramId>.<exp>.<hmac>`. Префикс не даёт спутать его с сессией
// кабинета, у которой тот же секрет и формат `id.exp.hmac`.
export function signPass(telegramId: number, secret: string): string {
  const exp = Math.floor(Date.now() / 1000) + PASS_TTL_SEC;
  const payload = `h.${telegramId}.${exp}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyPass(token: string | undefined | null, secret: string): number | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== 'h') return null;
  const [, idStr, expStr, sig] = parts;
  const expected = crypto.createHmac('sha256', secret).update(`h.${idStr}.${expStr}`).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(sig, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Math.floor(Date.now() / 1000) > Number(expStr)) return null;
  return Number(idStr) || null;
}

export async function isChannelMember(userId: number, botToken: string): Promise<boolean> {
  const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${encodeURIComponent(HUKI_CHANNEL)}&user_id=${userId}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    if (!json.ok) {
      console.error('[huki] getChatMember failed:', JSON.stringify(json));
      return false;
    }
    return ['creator', 'administrator', 'member', 'restricted'].includes(json.result?.status);
  } catch (e) {
    console.error('[huki] getChatMember error:', e);
    return false;
  }
}

async function hasActiveAccess(telegramId: number): Promise<boolean> {
  try {
    const row = await prisma.productAccess.findFirst({
      where: {
        telegramId: BigInt(telegramId),
        status: 'active',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true },
    });
    return !!row;
  } catch (e) {
    console.error('[huki] access lookup failed:', e);
    return false;
  }
}

export type HukiAccess =
  | { ok: true; telegramId: number | null; via: 'pass' | 'cabinet' | 'subscribed' | 'client' }
  | { ok: false; reason: 'anonymous' | 'not_subscribed' };

/** Кто пришёл и пускать ли его. Cookie проверяются первыми: они ничего не стоят. */
export async function resolveAccess(
  request: NextRequest,
  opts: { initData?: string; pass?: string } = {},
): Promise<HukiAccess> {
  const botToken = process.env.BOT_TOKEN || '';
  const secret = process.env.SESSION_SECRET || botToken;

  const cookiePass = verifyPass(request.cookies.get(PASS_COOKIE)?.value, secret);
  if (cookiePass) return { ok: true, telegramId: cookiePass, via: 'pass' };

  const urlPass = verifyPass(opts.pass, secret);
  if (urlPass) return { ok: true, telegramId: urlPass, via: 'pass' };

  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value, secret);
  if (session) return { ok: true, telegramId: session, via: 'cabinet' };

  const tgId = opts.initData ? verifyInitData(opts.initData, botToken) : null;
  if (!tgId) return { ok: false, reason: 'anonymous' };

  if (await isChannelMember(tgId, botToken)) return { ok: true, telegramId: tgId, via: 'subscribed' };
  if (await hasActiveAccess(tgId)) return { ok: true, telegramId: tgId, via: 'client' };
  return { ok: false, reason: 'not_subscribed' };
}
