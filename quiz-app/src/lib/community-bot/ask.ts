// Обращение к модели и живые зависимости бота «Сообщества».

import Anthropic from '@anthropic-ai/sdk';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';
import { addBotComment, notifyBotPost, notifyNewPost } from '@/lib/forum';
import { buildSystem, VERDICT_SCHEMA } from './prompt';
import type { ModelVerdict } from './route';
import type { BotDeps } from './index';

const MODEL = process.env.COMMUNITY_BOT_MODEL || process.env.KB_MODEL || 'claude-haiku-4-5';

let client: Anthropic | null = null;

function anthropic(): Anthropic {
  if (!client) {
    const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
    client = new Anthropic({ apiKey });
  }
  return client;
}

/** Справка и оглавление одинаковые для всех веток — кэшируем на час, как в kb-боте. */
const CACHE: { type: 'ephemeral'; ttl: '1h' } = { type: 'ephemeral', ttl: '1h' };

export async function askModel(question: string): Promise<ModelVerdict | null> {
  const message = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 512,
    system: [{ type: 'text', text: buildSystem(), cache_control: CACHE }],
    output_config: { format: { type: 'json_schema', schema: VERDICT_SCHEMA } },
    messages: [{ role: 'user', content: `ВЕТКА УЧЕНИКА:\n\n${question}` }],
  });
  await recordAnthropicUsage(MODEL, message.usage, 'kb');

  for (const b of message.content) {
    if (b.type === 'text') {
      try {
        return JSON.parse(b.text) as ModelVerdict;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export const liveDeps: BotDeps = {
  env: process.env,
  ask: askModel,
  addBotComment,
  notifyAdmin: notifyBotPost,
  notifyNewPost,
};
