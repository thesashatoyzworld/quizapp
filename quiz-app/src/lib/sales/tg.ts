import { prisma } from '@/lib/prisma';
import { sendBotMessage } from '@/lib/telegram';
import { suggestFromThread } from './answer';

// Личка рабочего аккаунта.
//
// Бот подключён к @sashatoyzwork через «Chat automation», поэтому его личные
// переписки приходят сюда отдельным типом апдейта — business_message. Это
// НЕ обычные сообщения боту: путать их с ними нельзя, иначе команды кабинета
// начнут срабатывать на разговоры с клиентами.
//
// Пока бот работает суфлёром: в саму переписку не пишет, а показывает Саше
// в личном чате, что он бы ответил. Снять предохранитель — дело одной ветки
// в handleBusinessMessage, но сперва Саша должен согласиться с тем, что видит.
//
// ⚠️ Историю чата Telegram боту не отдаёт. Видно только то, что пришло после
// подключения, поэтому переписку копим сами в tg_business_msg.

export type TgBusinessConnection = {
  id: string;
  user: { id: number; username?: string };
  rights?: { can_reply?: boolean };
  can_reply?: boolean;
  is_enabled: boolean;
};

export type TgBusinessMessage = {
  business_connection_id: string;
  message_id: number;
  from?: { id: number; username?: string; first_name?: string; is_bot?: boolean };
  chat: { id: number; type: string; username?: string; first_name?: string };
  date: number;
  text?: string;
  caption?: string;
};

/** Кому уходят подсказки: Саша плюс те, кого он добавил. */
function helpers(): number[] {
  return [
    process.env.ADMIN_CHAT_ID,
    ...(process.env.SALES_HELPER_CHAT_IDS || '').split(','),
  ]
    .map((v) => Number((v || '').trim()))
    .filter((v) => Number.isFinite(v) && v > 0);
}

/** Подключение бота к аккаунту: запоминаем, чтобы потом уметь отвечать. */
export async function saveConnection(conn: TgBusinessConnection): Promise<void> {
  const canReply = conn.rights?.can_reply ?? conn.can_reply ?? false;
  await prisma.tgBusinessConn.upsert({
    where: { id: conn.id },
    create: {
      id: conn.id,
      userId: String(conn.user.id),
      username: conn.user.username || null,
      canReply,
      isEnabled: conn.is_enabled,
    },
    update: {
      username: conn.user.username || null,
      canReply,
      isEnabled: conn.is_enabled,
    },
  });

  for (const chatId of helpers()) {
    await sendBotMessage(
      chatId,
      conn.is_enabled
        ? `подключился к личке @${conn.user.username || conn.user.id}\n` +
            `${canReply ? 'отвечать разрешено' : 'права отвечать нет, только читаю'}\n\n` +
            'дальше по каждому входящему буду присылать, что бы я ответил'
        : `отключили от лички @${conn.user.username || conn.user.id}`,
      undefined,
      null,
    );
  }
}

/**
 * Подключение по его id. Апдейт о подключении приходит один раз, в момент
 * привязки бота, и если бот тогда ещё не был подписан на этот тип — он ушёл
 * в никуда. Поэтому недостающее добираем у телеграма по id из сообщения:
 * без владельца не отличить Сашины реплики от чужих.
 */
async function ensureConnection(id: string) {
  const known = await prisma.tgBusinessConn.findUnique({ where: { id } });
  if (known) return known;

  const token = process.env.BOT_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getBusinessConnection?business_connection_id=${encodeURIComponent(id)}`,
    );
    const body = (await res.json()) as { ok: boolean; result?: TgBusinessConnection };
    if (!body.ok || !body.result) {
      console.error('[business] подключение не отдалось', JSON.stringify(body).slice(0, 200));
      return null;
    }
    await saveConnection(body.result);
    return prisma.tgBusinessConn.findUnique({ where: { id } });
  } catch (e) {
    console.error('[business] getBusinessConnection упал', e);
    return null;
  }
}

/** Анкета человека: сперва по номеру из сообщения, потом по нику. */
async function findLead(text: string, username?: string | null) {
  const marked = text.match(/#(\d{1,7})\b/);
  if (marked) {
    const byId = await prisma.dwyLead.findUnique({ where: { id: Number(marked[1]) } });
    if (byId) return byId;
  }
  if (username) {
    return prisma.dwyLead.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
      orderBy: { id: 'desc' },
    });
  }
  return null;
}

/** Что известно о человеке — это уходит в промпт перед перепиской. */
function describe(
  msg: TgBusinessMessage,
  lead: Awaited<ReturnType<typeof findLead>>,
): string {
  const lines = [
    msg.chat.username ? `ник: @${msg.chat.username}` : null,
    msg.chat.first_name ? `имя в телеграме: ${msg.chat.first_name}` : null,
    'канал: личка в телеграме, не инстаграм',
  ];

  if (lead) {
    lines.push(
      `АНКЕТА №${lead.id} от ${lead.createdAt.toISOString().slice(0, 10)}:`,
      lead.firstName ? `  имя: ${lead.firstName}` : '',
      lead.who ? `  кто: ${lead.who}` : '',
      lead.hasProduct ? `  продукт: ${lead.hasProduct}${lead.product ? ` (${lead.product})` : ''}` : '',
      lead.level ? `  уровень: ${lead.level}` : '',
      lead.tried ? `  что пробовал: ${lead.tried}` : '',
      lead.want ? `  что хочет через 3 месяца: ${lead.want}` : '',
      lead.income ? `  доход: ${lead.income}` : '',
      lead.hours ? `  часов в неделю: ${lead.hours}` : '',
      lead.instagram ? `  инстаграм: ${lead.instagram}` : '',
    );
  } else {
    lines.push('анкеты не нашёл — человек пришёл не с формы или писал с другого аккаунта');
  }

  return lines.filter(Boolean).join('\n');
}

/** Переписка строками, как её ждёт промпт. */
function render(rows: { side: string; text: string; createdAt: Date }[]): string {
  if (!rows.length) return '(переписки ещё нет)';
  return rows
    .map((r) => {
      const when = r.createdAt.toISOString().slice(0, 16).replace('T', ' ');
      return `[${when}] ${r.side === 'client' ? 'ЧЕЛОВЕК' : 'МЫ'}: ${r.text}`;
    })
    .join('\n');
}

/**
 * Сообщение из личной переписки рабочего аккаунта.
 *
 * Приходят и чужие реплики, и Сашины собственные — по ним и собирается тред.
 * Подсказку готовим только когда последнее слово за человеком.
 */
export async function handleBusinessMessage(msg: TgBusinessMessage): Promise<void> {
  const text = (msg.text || msg.caption || '').trim();
  if (!text) return;
  // Группы и каналы мимо: помощник про переписку один на один.
  if (msg.chat.type !== 'private') return;

  const conn = await ensureConnection(msg.business_connection_id);
  // Свои сообщения тоже сохраняем: без них модель не увидит, что мы уже
  // ответили, и предложит отвечать на несказанное.
  const side =
    conn && String(msg.from?.id) === conn.userId
      ? 'us'
      : // Подключение не добралось — тогда по грубому признаку: входящее
        // всегда приходит от того же, чей это чат.
        !conn && msg.from && msg.from.id !== msg.chat.id
        ? 'us'
        : 'client';

  const lead = side === 'client' ? await findLead(text, msg.chat.username) : null;

  await prisma.tgBusinessMsg.upsert({
    where: { id: `${msg.chat.id}:${msg.message_id}` },
    create: {
      id: `${msg.chat.id}:${msg.message_id}`,
      chatId: String(msg.chat.id),
      side,
      username: msg.chat.username || null,
      name: msg.chat.first_name || null,
      text,
      leadId: lead?.id ?? null,
      createdAt: new Date(msg.date * 1000),
    },
    update: {},
  });

  if (side !== 'client') return;

  const rows = await prisma.tgBusinessMsg.findMany({
    where: { chatId: String(msg.chat.id) },
    orderBy: { createdAt: 'asc' },
    take: 40,
  });

  const known = lead ?? (await findLead('', msg.chat.username));
  const { variants, callSasha } = await suggestFromThread({
    about: describe(msg, known),
    rendered: render(rows),
  });

  const who = msg.chat.username ? `@${msg.chat.username}` : msg.chat.first_name || 'без ника';
  const head = [
    `${who}${known ? ` · анкета №${known.id}` : ' · анкеты нет'}`,
    `\nнаписал: ${text.slice(0, 300)}`,
  ].join('');

  for (const chatId of helpers()) {
    await sendBotMessage(chatId, head, undefined, null);
    for (const [i, v] of variants.entries()) {
      await sendBotMessage(chatId, `${i + 1}. ${v.text}\n\n— ${v.why}`, undefined, null);
    }
    if (!variants.length) {
      await sendBotMessage(chatId, 'вариантов не получилось, посмотри сам', undefined, null);
    }
    if (callSasha) {
      await sendBotMessage(chatId, `нужен ты: ${callSasha}`, undefined, null);
    }
  }
}
