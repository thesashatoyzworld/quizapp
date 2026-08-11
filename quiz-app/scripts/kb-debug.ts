// Отладка шага выбора: печатает сырой ответ модели на один вопрос.
//   npx tsx scripts/kb-debug.ts "вопрос"
import { config } from 'dotenv';
config({ path: '.env.local' });

import Anthropic from '@anthropic-ai/sdk';
import { visibleTo, renderMap } from '../src/lib/kb/map';

async function main() {
  const question = process.argv[2] || 'у меня не получается начать снимать, страшно';
  const entries = visibleTo({ uroven: 2 });
  const client = new Anthropic({ apiKey: (process.env.ANTHROPIC_API_KEY || '').trim() });

  const message = await client.messages.create({
    model: process.env.KB_MODEL || 'claude-haiku-4-5',
    max_tokens: 256,
    system: [
      {
        type: 'text',
        text:
          'Ты подбираешь материал по оглавлению курса. Верни section и slug из квадратных скобок.\n\n' +
          `ОГЛАВЛЕНИЕ:\n\n${renderMap(entries)}`,
        cache_control: { type: 'ephemeral' },
      },
    ],
    output_config: {
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            found: { type: 'boolean' },
            section: { type: 'string' },
            slug: { type: 'string' },
          },
          required: ['found', 'section', 'slug'],
          additionalProperties: false,
        },
      },
    },
    messages: [{ role: 'user', content: question }],
  });

  console.log('ВОПРОС:', question);
  console.log('stop_reason:', message.stop_reason);
  console.log('usage:', JSON.stringify(message.usage));
  console.log('content:', JSON.stringify(message.content, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
