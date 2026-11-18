// The viewer's own MCP URL for the guide. Server only: reads the key from env.
import { headers } from 'next/headers';
import { ownKey } from './keys';
import type { Actor } from './view';

export async function mcpUrlFor(actor: Actor): Promise<string | null> {
  const key = ownKey(actor);
  if (!key) return null;
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'world.thesashatoyz.com';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}/api/mcp?key=${encodeURIComponent(key)}`;
}
