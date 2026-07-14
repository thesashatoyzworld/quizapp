import crypto from 'node:crypto';

/**
 * Telegram Login Widget verification + browser session cookie.
 *
 * The cabinet (/dostup) is Telegram-gated. Inside the Mini App we get the id
 * from initData; in a desktop browser there's no Telegram context, so we let
 * the user sign in with the official Telegram Login Widget. Telegram signs the
 * user data with the bot token (HMAC), which we verify here — this id is
 * cryptographically trustworthy, unlike the unsigned Mini App id.
 *
 * After verifying, we mint a short HMAC-signed session cookie so the browser
 * stays logged in without re-checking the widget every request.
 */

export const SESSION_COOKIE = 'kb_session';
const SESSION_TTL_SEC = 60 * 60 * 24 * 30; // 30 days
const AUTH_MAX_AGE_SEC = 60 * 60 * 24; // widget payload must be < 1 day old

export type TelegramLoginData = Record<string, string>;

/** Verify the Telegram Login Widget payload against the bot token. */
export function verifyTelegramLogin(data: TelegramLoginData, botToken: string): { ok: boolean; telegramId?: number } {
  const hash = data.hash;
  if (!hash) return { ok: false };

  // data-check-string: all fields except hash, sorted, joined "key=value" by \n.
  const checkString = Object.keys(data)
    .filter((k) => k !== 'hash')
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join('\n');

  // secret = SHA256(bot_token); expected = HMAC-SHA256(checkString, secret).
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const expected = crypto.createHmac('sha256', secret).update(checkString).digest('hex');

  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false };

  // Reject stale payloads (replay protection).
  const authDate = Number(data.auth_date || 0);
  if (!authDate || Math.floor(Date.now() / 1000) - authDate > AUTH_MAX_AGE_SEC) return { ok: false };

  const telegramId = Number(data.id);
  if (!telegramId) return { ok: false };
  return { ok: true, telegramId };
}

/** Mint a signed session token `telegramId.exp.hmac`. */
export function signSession(telegramId: number, secret: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const payload = `${telegramId}.${exp}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

/** Verify a session token; returns the telegramId if valid and unexpired. */
export function verifySession(token: string | undefined, secret: string): number | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [idStr, expStr, sig] = parts;
  const payload = `${idStr}.${expStr}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(sig, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Math.floor(Date.now() / 1000) > Number(expStr)) return null;
  const id = Number(idStr);
  return id || null;
}

export const SESSION_MAX_AGE = SESSION_TTL_SEC;
