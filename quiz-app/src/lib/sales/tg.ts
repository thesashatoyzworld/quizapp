import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { sendBotMessage } from '@/lib/telegram';
import { suggestFromThread, type SalesStep } from './answer';

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

/**
 * Кому уходят подсказки: рабочий аккаунт плюс те, кого Саша добавил.
 *
 * Именно рабочий, а не ADMIN_CHAT_ID — тот личный. Переписки ведутся с
 * @sashatoyzwork, подсказки к ним должны лежать там же, а не в другом чате
 * на другом телефоне.
 */
export function helpers(): number[] {
  return [
    process.env.ADMIN_CHAT_ID_WORK,
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
export async function findLead(text: string, username?: string | null) {
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

/** Анкета человека строками для промпта. Нужна и личке, и скриншотам. */
export function describeLead(lead: Awaited<ReturnType<typeof findLead>>): string {
  if (!lead) return 'анкеты не нашёл — человек пришёл не с формы или писал с другого аккаунта';
  return [
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
  ]
    .filter(Boolean)
    .join('\n');
}

/** Что известно о человеке из личного чата — уходит в промпт перед перепиской. */
function describe(
  msg: TgBusinessMessage,
  lead: Awaited<ReturnType<typeof findLead>>,
): string {
  return [
    msg.chat.username ? `ник: @${msg.chat.username}` : null,
    msg.chat.first_name ? `имя в телеграме: ${msg.chat.first_name}` : null,
    'канал: личка в телеграме, не инстаграм',
    describeLead(lead),
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Хвост переписки: последние сообщения, в порядке разговора.
 *
 * ⚠️ Именно последние. С «orderBy asc, take: 40» приезжали сорок самых
 * старых — пока история копилась с нуля, разницы не было, но после заливки
 * выгрузки из Telegram Desktop бот читал бы знакомство недельной давности
 * и не видел, о чём речь сейчас.
 */
async function thread(chatId: string, take = 40) {
  const rows = await prisma.tgBusinessMsg.findMany({
    where: { chatId },
    orderBy: { createdAt: 'desc' },
    take,
  });
  return rows.reverse();
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

  // ⚠️ Чат с ботом подключение тоже отдаёт. Свои же подсказки прилетают сюда
  // как чужие сообщения, бот отвечает на них новыми подсказками — и так по
  // кругу. Отсекаем ботов и собственные служебные чаты до всякой работы.
  if (msg.from?.is_bot) return;
  if (helpers().includes(msg.chat.id)) return;
  // Свой же чат узнаём по токену: его первая часть — это id бота. Признака
  // is_bot в апдейте может не оказаться, а петля стоит дорого.
  if (msg.chat.id === Number((process.env.BOT_TOKEN || '').split(':')[0])) return;

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

  // Анкету ищем по любому сообщению, включая наши: человек в чате один и
  // тот же, и привязка не должна зависеть от того, кто написал последним.
  const lead = await findLead(side === 'client' ? text : '', msg.chat.username);

  // Пишем через create, а не upsert: телеграм повторяет апдейт, если ответа
  // не дождался, а разбор занимает полминуты. Конфликт по ключу — значит это
  // повтор, и подсказку по нему слать второй раз не надо.
  try {
    await prisma.tgBusinessMsg.create({
      data: {
        id: `${msg.chat.id}:${msg.message_id}`,
        chatId: String(msg.chat.id),
        side,
        username: msg.chat.username || null,
        name: msg.chat.first_name || null,
        text,
        leadId: lead?.id ?? null,
        createdAt: new Date(msg.date * 1000),
      },
    });
  } catch {
    return;
  }

  if (side !== 'client') return;

  const rows = await thread(String(msg.chat.id));

  const step = await suggestFromThread({
    about: describe(msg, lead),
    rendered: render(rows),
  });

  const who = msg.chat.username ? `@${msg.chat.username}` : msg.chat.first_name || 'без ника';
  await sendStep({
    connId: msg.business_connection_id,
    chatId: String(msg.chat.id),
    head: [
      `${who}${lead ? ` · анкета №${lead.id}` : ' · анкеты нет'}`,
      step.stage ? ` · ${step.stage}` : '',
      `\nнаписал: ${text.slice(0, 300)}`,
    ].join(''),
    step,
  });
}

/**
 * Показать шаг тому, кто ведёт переписку: карточка, само сообщение и кнопки.
 *
 * Сообщение приходит отдельным куском, чтобы его можно было скопировать
 * одним нажатием, если отправлять хочется руками и с правками.
 */
export async function sendStep(params: {
  connId: string;
  chatId: string;
  head: string;
  step: SalesStep;
}): Promise<void> {
  const { connId, chatId, head, step } = params;

  for (const helper of helpers()) {
    await sendBotMessage(helper, head, undefined, null);

    if (!step.message) {
      await sendBotMessage(helper, 'шаг не собрался, посмотри сам', undefined, null);
      continue;
    }

    // Текст живёт в базе, кнопка несёт только id: в callback_data 64 байта.
    const saved = await prisma.tgSuggestion.create({
      data: { id: randomUUID(), connId, chatId, text: step.message },
    });

    await sendBotMessage(
      helper,
      step.message,
      {
        inline_keyboard: [
          [
            { text: '📤 отправить', callback_data: `sndv:${saved.id}` },
            { text: '↻ другой', callback_data: `rgen:${chatId}` },
          ],
        ],
      },
      null,
    );

    await sendBotMessage(helper, `— ${step.why}`, undefined, null);

    if (step.callSasha) {
      await sendBotMessage(helper, `нужен ты: ${step.callSasha}`, undefined, null);
    }
  }
}

/** Собрать шаг заново по тому же чату — кнопка «другой». */
export async function regenerate(chatId: string): Promise<boolean> {
  const rows = await thread(chatId);
  if (!rows.length) return false;

  const last = rows[rows.length - 1];
  const conn = await prisma.tgBusinessConn.findFirst({ orderBy: { connectedAt: 'desc' } });
  const lead = await findLead('', last.username);

  const step = await suggestFromThread({
    about: [
      last.username ? `ник: @${last.username}` : null,
      last.name ? `имя в телеграме: ${last.name}` : null,
      'канал: личка в телеграме, не инстаграм',
      'предыдущий вариант не подошёл — дай другой ход, не переписывай тот же',
      describeLead(lead),
    ]
      .filter(Boolean)
      .join('\n'),
    rendered: render(rows),
  });

  await sendStep({
    connId: conn?.id || '',
    chatId,
    head: `${last.username ? '@' + last.username : last.name || 'человек'}${lead ? ` · анкета №${lead.id}` : ''}${step.stage ? ` · ${step.stage}` : ''}\nдругой ход:`,
    step,
  });
  return true;
}

/**
 * Нажали «отправить» под вариантом — уходит человеку от имени аккаунта.
 *
 * Пишем через business_connection_id: сообщение появляется в переписке как
 * Сашино, а не как сообщение бота. Право на это выдано при подключении
 * (can_reply), без него телеграм откажет.
 */
export async function sendSuggestion(id: string): Promise<{ ok: boolean; error?: string }> {
  const s = await prisma.tgSuggestion.findUnique({ where: { id } });
  if (!s) return { ok: false, error: 'вариант потерялся, собери заново' };
  if (s.sentAt) return { ok: false, error: 'уже отправлено' };

  const token = process.env.BOT_TOKEN;
  if (!token) return { ok: false, error: 'нет токена' };

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      business_connection_id: s.connId,
      chat_id: Number(s.chatId),
      text: s.text,
    }),
  });
  const body = (await res.json()) as { ok: boolean; description?: string };
  if (!body.ok) {
    console.error('[business] отправка не прошла', body.description);
    return { ok: false, error: body.description || 'телеграм отказал' };
  }

  await prisma.tgSuggestion.update({ where: { id }, data: { sentAt: new Date() } });
  return { ok: true };
}
