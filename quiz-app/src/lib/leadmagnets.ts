import fs from 'fs';
import path from 'path';

export interface LeadMagnet {
  title: string;
  url: string;
  channelUsername: string;
  intro: string;
  softPitch?: string;
  /** When true, the bot checks channel subscription before delivering the magnet. */
  requireSub?: boolean;
  /** Text shown to a non-subscriber asking them to join the channel first. */
  gateText?: string;
}

let cache: Record<string, LeadMagnet> | null = null;

function load(): Record<string, LeadMagnet> {
  if (cache) return cache;
  const file = path.join(process.cwd(), 'content', 'leadmagnets.json');
  if (!fs.existsSync(file)) {
    cache = {};
    return cache;
  }
  cache = JSON.parse(fs.readFileSync(file, 'utf-8'));
  return cache!;
}

export function getLeadMagnet(slug: string): LeadMagnet | null {
  return load()[slug] ?? null;
}
