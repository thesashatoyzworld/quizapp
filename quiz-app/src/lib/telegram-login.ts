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
const INITDATA_MAX_AGE_SEC = 60 * 60 * 24; // Mini App initData must be < 1 day old
const TICKET_TTL_SEC = 5 * 60; // handoff link to the browser is short-lived

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

/**
 * Verify Mini App initData.
 *
 * The id we read from `initDataUnsafe` on the client is exactly that — unsafe:
 * anyone can call our API with someone else's number. The raw `initData` string,
 * on the other hand, is signed by Telegram, so it is the only thing we can trust
 * when handing out a browser session.
 *
 * Note the secret differs from the Login Widget: here it is
 * HMAC(bot_token, "WebAppData"), not SHA256(bot_token).
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyInitData(initData: string, botToken: string): number | null {
  if (!initData || !botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  const checkString = [...params.entries()]
    .filter(([k]) => k !== 'hash')
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expected = crypto.createHmac('sha256', secret).update(checkString).digest('hex');

  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const authDate = Number(params.get('auth_date') || 0);
  if (!authDate || Math.floor(Date.now() / 1000) - authDate > INITDATA_MAX_AGE_SEC) return null;

  try {
    const user = JSON.parse(params.get('user') || '{}') as { id?: number };
    return user.id || null;
  } catch {
    return null;
  }
}

/**
 * One-time-ish handoff ticket: the Mini App asks for it, the browser trades it
 * for a normal session. Lives five minutes, so a leaked link is useless by the
 * time anyone finds it. Prefixed so it can never be confused with a session token.
 */
export function signTicket(telegramId: number, secret: string): string {
  const exp = Math.floor(Date.now() / 1000) + TICKET_TTL_SEC;
  const payload = `t.${telegramId}.${exp}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

/** Verify a handoff ticket; returns the telegramId if valid and unexpired. */
export function verifyTicket(token: string | undefined, secret: string): number | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== 't') return null;
  const [, idStr, expStr, sig] = parts;
  const payload = `t.${idStr}.${expStr}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(sig, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Math.floor(Date.now() / 1000) > Number(expStr)) return null;
  const id = Number(idStr);
  return id || null;
}
