// Server-only. Free users of the Уникализатор must be subscribed to Sasha's channel.
export const UNIQ_CHANNEL = '@sashatoyz';
export const UNIQ_CHANNEL_URL = 'https://t.me/sashatoyz';

/** true / false, or null when Telegram did not answer (callers let the person through then). */
export async function isChannelMember(userId: number, token = process.env.BOT_TOKEN || ''): Promise<boolean | null> {
  if (!token) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getChatMember?chat_id=${encodeURIComponent(UNIQ_CHANNEL)}&user_id=${userId}`, { cache: 'no-store' });
    const data = await res.json();
    if (!data.ok) {
      // «user not found» / «participant not found» means not subscribed; anything else is an outage.
      if (/not found/i.test(String(data.description))) return false;
      console.error('[uniq] getChatMember:', data.description);
      return null;
    }
    return ['member', 'administrator', 'creator', 'restricted'].includes(data.result?.status)
      && !(data.result?.status === 'restricted' && data.result?.is_member === false);
  } catch (err) {
    console.error('[uniq] getChatMember failed:', err);
    return null;
  }
}
