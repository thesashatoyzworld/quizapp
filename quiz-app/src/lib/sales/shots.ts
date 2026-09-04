import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';
import { sendBotMessage, getTelegramFilePath, downloadTelegramFile } from '@/lib/telegram';
import { suggestFromThread } from './answer';
import { findLead, describeLead, helpers } from './tg';

// Скриншоты переписок.
//
// Не всё живёт в подключённой личке: часть разговоров идёт с другого аккаунта,
// часть началась до подключения, а история чата боту не отдаётся вовсе.
// Поэтому переписку можно просто сфотографировать и прислать — модель прочитает
// её с картинки и предложит, что писать дальше.
//
// Альбом телеграм шлёт по одному апдейту на картинку, поэтому картинки
// собираются через tg_shot: первый апдейт ждёт остальных и разбирает пачку.

const anthropic = new Anthropic();

/** Одно место на файл: по этой же строке считается цена вызова. */
const MODEL = 'claude-sonnet-5';

/** Сколько ждём остальные картинки альбома. */
const ALBUM_WAIT_MS = 4000;

const READ_SYSTEM = `Ты читаешь скриншоты переписки и превращаешь их в текст.

На картинках чат: сообщения одного человека и наши ответы. Верни их по порядку,
сверху вниз, слева направо по картинкам.

Как отличать стороны: наши сообщения обычно справа и другим цветом, чужие слева.
Если цвет и сторона спорят между собой, верь стороне.

Имя собеседника ищи в шапке чата на первой картинке. Ник — если он там виден.

Не пересказывай и не исправляй: переноси текст как написано, с опечатками.
Служебное (время, галочки о прочтении, «печатает…», кнопки) не переноси.`;

const READ_SCHEMA = {
  type: 'object',
  properties: {
    who: { type: ['string', 'null'], description: 'имя собеседника из шапки чата' },
    handle: { type: ['string', 'null'], description: 'ник собеседника, если виден, без собаки' },
    messages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          side: { type: 'string', enum: ['client', 'us'], description: 'кто написал' },
          text: { type: 'string' },
        },
        required: ['side', 'text'],
        additionalProperties: false,
      },
    },
  },
  required: ['who', 'handle', 'messages'],
  additionalProperties: false,
} as const;

type ReadResult = {
  who: string | null;
  handle: string | null;
  messages: { side: 'client' | 'us'; text: string }[];
};

async function asImageBlock(fileId: string) {
  const path = await getTelegramFilePath(fileId);
  const buf = await downloadTelegramFile(path);
  const media = path.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  return {
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: media as 'image/png' | 'image/jpeg',
      data: Buffer.from(buf).toString('base64'),
    },
  };
}

/** Картинки → переписка текстом. */
async function readShots(fileIds: string[]): Promise<ReadResult> {
  const images = [];
  for (const id of fileIds) images.push(await asImageBlock(id));

  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: READ_SYSTEM,
    messages: [
      {
        role: 'user',
        content: [...images, { type: 'text', text: 'Прочитай переписку с этих скриншотов.' }],
      },
    ],
    output_config: { format: { type: 'json_schema', schema: READ_SCHEMA } },
  });

  await recordAnthropicUsage(MODEL, res.usage, 'sales');

  const block = res.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') return { who: null, handle: null, messages: [] };
  try {
    return JSON.parse(block.text) as ReadResult;
  } catch {
    return { who: null, handle: null, messages: [] };
  }
}

export type ShotMessage = {
  chat: { id: number };
  message_id: number;
  photo?: { file_id: string }[];
  media_group_id?: string;
  caption?: string;
};

/**
 * Скриншот (или альбом) переписки → что написать дальше.
 * Возвращает false, если это не наш случай и сообщение должно идти дальше.
 */
export async function handleScreenshots(msg: ShotMessage): Promise<boolean> {
  if (!msg.photo?.length) return false;
  if (!helpers().includes(msg.chat.id)) return false;

  // Самая большая версия картинки — последняя в списке.
  const fileId = msg.photo[msg.photo.length - 1].file_id;
  const key = `${msg.chat.id}:${msg.message_id}`;

  await prisma.tgShot.upsert({
    where: { id: key },
    create: {
      id: key,
      groupId: msg.media_group_id || null,
      chatId: String(msg.chat.id),
      fileId,
      caption: msg.caption || null,
    },
    update: {},
  });

  let shots = [{ fileId, caption: msg.caption || null }];

  if (msg.media_group_id) {
    // Ждём остальные картинки альбома, потом разбирает тот апдейт, что пришёл
    // первым: иначе на три скриншота прилетит три одинаковых ответа.
    await new Promise((r) => setTimeout(r, ALBUM_WAIT_MS));
    const rows = await prisma.tgShot.findMany({
      where: { groupId: msg.media_group_id },
      orderBy: { createdAt: 'asc' },
    });
    if (rows[0]?.id !== key) return true;
    shots = rows.map((r) => ({ fileId: r.fileId, caption: r.caption }));
  }

  await sendBotMessage(
    msg.chat.id,
    shots.length > 1 ? `читаю ${shots.length} скриншота…` : 'читаю скриншот…',
    undefined,
    null,
  );

  const read = await readShots(shots.map((s) => s.fileId));

  if (!read.messages.length) {
    await sendBotMessage(
      msg.chat.id,
      'на картинке переписки не видно. если это скрин чата — пришли покрупнее, целиком',
      undefined,
      null,
    );
    return true;
  }

  // Подпись к скриншоту — тоже подсказка: «это @ник» или «тут про цену».
  const caption = shots.map((s) => s.caption).filter(Boolean).join(' ');
  const lead = await findLead(caption, read.handle || null);

  const about = [
    read.who ? `имя: ${read.who}` : null,
    read.handle ? `ник: @${read.handle}` : null,
    'канал: переписка со скриншота, прислана вручную',
    caption ? `от Саши к скриншоту: ${caption}` : null,
    describeLead(lead),
  ]
    .filter(Boolean)
    .join('\n');

  const rendered = read.messages
    .map((m) => `${m.side === 'client' ? 'ЧЕЛОВЕК' : 'МЫ'}: ${m.text}`)
    .join('\n');

  const step = await suggestFromThread({ about, rendered });

  const who = read.handle ? `@${read.handle}` : read.who || 'человек со скриншота';
  await sendBotMessage(
    msg.chat.id,
    `${who}${lead ? ` · анкета №${lead.id}` : ''}${step.stage ? ` · ${step.stage}` : ''}\nсообщений на скрине: ${read.messages.length}`,
    undefined,
    null,
  );
  if (step.message) {
    await sendBotMessage(msg.chat.id, step.message, undefined, null);
    await sendBotMessage(msg.chat.id, `— ${step.why}`, undefined, null);
  } else {
    await sendBotMessage(msg.chat.id, 'шаг не собрался, посмотри сам', undefined, null);
  }
  if (step.callSasha) {
    await sendBotMessage(msg.chat.id, `нужен ты: ${step.callSasha}`, undefined, null);
  }

  return true;
}
