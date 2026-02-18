import { createHmac, createHash, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const SESSION_SECRET = process.env.BOT_TOKEN!;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '788334680';

export interface TelegramAuthData {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
}

/**
 * Verify Telegram Login Widget hash.
 * https://core.telegram.org/widgets/login#checking-authorization
 */
export function verifyTelegramAuth(data: TelegramAuthData): boolean {
  const { hash, ...fields } = data;

  const dataCheckString = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  // For Login Widget: secret_key = SHA256(bot_token) as raw bytes
  const secretKey = createHash('sha256').update(process.env.BOT_TOKEN!).digest();
  const expectedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  try {
    if (hash.length !== expectedHash.length) return false;
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
  } catch {
    return false;
  }
}

export function isAdminUser(id: string): boolean {
  return id === ADMIN_CHAT_ID;
}

export function createSessionToken(userId: string): string {
  const payload = JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const encoded = Buffer.from(payload).toString('base64url');
  const sig = createHmac('sha256', SESSION_SECRET).update(encoded).digest('hex');
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string): { userId: string } | null {
  const dotIdx = token.lastIndexOf('.');
  if (dotIdx < 0) return null;

  const encoded = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);

  try {
    const expectedSig = createHmac('sha256', SESSION_SECRET).update(encoded).digest('hex');
    if (sig.length !== expectedSig.length) return null;
    if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'))) return null;

    const data = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (data.exp < Date.now()) return null;

    return { userId: data.userId };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
