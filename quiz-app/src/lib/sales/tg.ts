import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { sendBotMessage } from '@/lib/telegram';
import { transcribeTgVoice, TG_FILE_LIMIT_BYTES } from '@/lib/whisper';
import { suggestFromThread, type SalesStep } from './answer';
import { pushDigest } from './digest';

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

type TgVoice = { file_id: string; duration?: number; file_size?: number };

export type TgBusinessMessage = {
  business_connection_id: string;
  message_id: number;
  from?: { id: number; username?: string; first_name?: string; is_bot?: boolean };
  chat: { id: number; type: string; username?: string; first_name?: string };
  date: number;
  text?: string;
  caption?: string;
  voice?: TgVoice;
  video_note?: TgVoice;
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

/**
 * Анкета человека по чату — всё, что о нём известно, а не только ник.
 *
 * `findLead` по нику мимо тех, у кого ника в телеграме нет вовсе: анкета
 * редиректит человека в личку, и ник там не обязателен. 04.09 на таком
 * человеке помощник написал «у меня почему-то не открывается сама анкета» —
 * вранье в лицо, притом что номер анкеты стоял в первой же его реплике,
 * а привязка уже лежала в базе.
 *
 * Порядок: привязка, поставленная при разборе сообщений → номер #NNN из его
 * реплик → ник.
 */
export async function leadOfChat(chatId: string, username?: string | null) {
  const linked = await prisma.tgBusinessMsg.findFirst({
    where: { chatId, leadId: { not: null } },
    orderBy: { createdAt: 'desc' },
    select: { leadId: true },
  });
  if (linked?.leadId) {
    const byLink = await prisma.dwyLead.findUnique({ where: { id: linked.leadId } });
    if (byLink) return byLink;
  }

  const said = await prisma.tgBusinessMsg.findMany({
    where: { chatId, side: 'client' },
    orderBy: { createdAt: 'asc' },
    take: 20,
    select: { text: true },
  });
  const marker = said.map((m) => m.text.match(/#(\d{1,7})\b/)?.[1]).find(Boolean);
  if (marker) {
    const byId = await prisma.dwyLead.findUnique({ where: { id: Number(marker) } });
    if (byId) return byId;
  }

  return username ? findLead('', username) : null;
}

/**
 * Человек уже заплатил.
 *
 * Без этой строки помощник продаёт заново тому, кто вчера оплатил и пришёл с
 * вопросом: в переписке про оплату может не быть ни слова, деньги приходят
 * мимо чата. Доступ создаётся только платежом, поэтому факт железный.
 */
const PRODUCT_TITLE: Record<string, string> = {
  'uroven-t1': 'тариф 1, курс «Новый уровень контента»',
  'uroven-t2': 'тариф 2, курс плюс обратная связь',
  'uroven-t3': 'тариф 3, курс плюс личная работа',
  'workshop-soldout': 'воркшоп «Солдаут»',
  'mk-dengi': 'мастер-класс «Разрешение быстрых денег»',
};

export async function describeAccess(chatId: string): Promise<string | null> {
  if (!/^\d+$/.test(chatId)) return null;
  const rows = await prisma.productAccess.findMany({
    where: { telegramId: BigInt(chatId), status: 'active' },
    orderBy: { grantedAt: 'desc' },
    select: { productSlug: true, grantedAt: true },
  });
  if (!rows.length) return null;

  const what = rows
    .map((r) => `${PRODUCT_TITLE[r.productSlug] ?? r.productSlug} (${r.grantedAt.toISOString().slice(0, 10)})`)
    .join(', ');
  return `✅ УЖЕ КЛИЕНТ, оплачено: ${what}. Продавать это заново не надо ни при каких словах в переписке. Помоги с тем, о чём он спрашивает, а следующую ступень предлагай только если он сам заговорит о ней или явно упрётся в потолок купленного.`;
}

/**
 * Откуда человек пришёл. В анкете это `source` из адреса страницы.
 *
 * Важно для первого шага: пришедший со страницы кейса уже его прочитал, и
 * вопрос «а ты кейс мой видел?» выглядит так, будто мы не читали, откуда он
 * взялся. Живой случай 03.09 с тренером, пришедшим с кейса Васи.
 */
function cameFrom(source: string | null): string | null {
  if (!source) return null;

  const known: Record<string, string> = {
    bio: 'из шапки профиля в инстаграме',
    direct: 'написал в директ сам',
    tg: 'из телеграма',
    'tg-channel': 'из телеграм-канала',
    uroven: 'со страницы тарифов',
  };
  if (known[source]) return known[source];

  if (source.startsWith('case-')) {
    const who = source.slice('case-'.length);
    return `со страницы кейса «${who}» — ЭТОТ КЕЙС ОН УЖЕ ЧИТАЛ. Не предлагай его снова и не спрашивай, видел ли: он с него и пришёл. Опирайся на кейс как на общее знание`;
  }
  if (source.startsWith('yt-')) return `с ролика на ютубе (${source.slice(3)})`;
  return source;
}

/**
 * Как давно человек читает Сашу.
 *
 * Вопрос «а какие-то мои материалы ты уже смотрел?» задаётся по методичке
 * всем подряд. Тому, кто читает год, он показывает, что мы его не знаем, и
 * тратит ход. Тому, кто пришёл с одного рилса, наоборот, кейс нужен раньше
 * любого разговора о деньгах.
 */
function following(value: string | null): string {
  if (!value) return '';
  const line = `  подписан на Сашу: ${value}`;
  if (value.startsWith('больше года') || value.startsWith('несколько')) {
    return `${line} — ТЁПЛЫЙ. Не спрашивай, смотрел ли он материалы: смотрел. Опирайся на них как на общее знание`;
  }
  if (value.startsWith('ещё не')) {
    return `${line} — ХОЛОДНЫЙ, Сашу почти не знает. Кейс под его нишу нужен раньше разговора о деньгах`;
  }
  return line;
}

/**
 * Насколько человек готов платить — его собственный ответ в анкете.
 *
 * Это не разрешение продавать в лоб: человек отвечал до разговора и мог
 * ошибиться в обе стороны. Но темп он задаёт честнее, чем догадка по тону.
 */
function readiness(value: string | null): string {
  if (!value) return '';
  const line = `  готовность к покупке (сам отметил в анкете): ${value}`;
  if (value.startsWith('вполне')) {
    return `${line} — ГОТОВ. Не пересказывай ценность и не грей: выясни факты, назови формат и цену`;
  }
  if (value.startsWith('ещё не')) {
    return `${line} — НЕ ГОТОВ. К цене не веди, пока он сам о ней не заговорит`;
  }
  return line;
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
    following(lead.following),
    readiness(lead.readiness),
    lead.instagram ? `  инстаграм: ${lead.instagram}` : '',
    cameFrom(lead.source) ? `  пришёл: ${cameFrom(lead.source)}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/** «01:51» для заглушки: без длительности непонятно, реплика это или монолог. */
function stamp(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds)) return '';
  return ` ${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
}

/**
 * Голосовое в переписке — это тоже разговор, и часто самая важная его часть:
 * человек проговаривает возражение целиком, тогда как текстом отвечает
 * односложно. Пока их не расшифровывали, помощник видел в треде дырку и
 * отвечал на несказанное.
 *
 * Расшифровку ведёт тот же lib/whisper, что и голосовые анкеты, — движок
 * задаётся TRANSCRIBE_PROVIDER, отдельного здесь заводить не надо.
 */
async function transcribeVoice(v: TgVoice): Promise<{ text: string; failed: boolean }> {
  const label = `[голосовое${stamp(v.duration)}`;
  if ((v.file_size || 0) > TG_FILE_LIMIT_BYTES) {
    return { text: `${label}, слишком большое для расшифровки]`, failed: true };
  }
  try {
    const text = (await transcribeTgVoice(v.file_id)).trim();
    return text
      ? { text, failed: false }
      : { text: `${label}, расшифровка пустая]`, failed: true };
  } catch (e) {
    console.error('[business] голосовое не расшифровалось', e);
    return { text: `${label}, расшифровать не вышло]`, failed: true };
  }
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
  const said = (msg.text || msg.caption || '').trim();
  const voice = msg.voice || msg.video_note;
  if (!said && !voice) return;
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
  const lead = await findLead(side === 'client' ? said : '', msg.chat.username);

  const id = `${msg.chat.id}:${msg.message_id}`;

  // Пишем через create, а не upsert: телеграм повторяет апдейт, если ответа
  // не дождался, а разбор занимает полминуты. Конфликт по ключу — значит это
  // повтор, и подсказку по нему слать второй раз не надо.
  //
  // Голосовое кладём заглушкой ДО расшифровки — иначе повторный апдейт успел
  // бы отправить тот же файл в расшифровку второй раз, за отдельные деньги.
  try {
    await prisma.tgBusinessMsg.create({
      data: {
        id,
        chatId: String(msg.chat.id),
        side,
        username: msg.chat.username || null,
        name: msg.chat.first_name || null,
        text: said || `[голосовое${stamp(voice?.duration)}, расшифровывается]`,
        leadId: lead?.id ?? null,
        mediaType: voice ? (msg.video_note ? 'video' : 'voice') : null,
        mediaRef: voice?.file_id ?? null,
        createdAt: new Date(msg.date * 1000),
      },
    });
  } catch {
    return;
  }

  let text = said;
  let voiceFailed = false;
  if (voice) {
    const heard = await transcribeVoice(voice);
    voiceFailed = heard.failed;
    text = said ? `${said}\n${heard.text}` : heard.text;
    await prisma.tgBusinessMsg.update({ where: { id }, data: { text } });
  }

  if (side !== 'client') return;

  // Подсказку здесь больше не собираем. Во-первых, разбор идёт около минуты
  // против шестидесяти секунд вебхука — на длинных тредах он не успевал, и
  // помощник молчал ровно там, где шёл живой разговор. Во-вторых, четыре
  // сообщения на каждую входящую реплику превращали чат в кашу.
  //
  // Вместо этого правим одну сводку: кто ждёт и сколько. Ответ собирается
  // в кабинете, на странице человека, по кнопке.
  if (voiceFailed) {
    const who = msg.chat.username ? `@${msg.chat.username}` : msg.chat.first_name || 'человек';
    for (const helper of helpers()) {
      await sendBotMessage(helper, `${who}: голосовое не разобралось, послушай сам`, undefined, null);
    }
  }

  await pushDigest();
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
  const lead = await leadOfChat(chatId, last.username);

  const step = await suggestFromThread({
    about: [
      last.username ? `ник: @${last.username}` : null,
      last.name ? `имя в телеграме: ${last.name}` : null,
      'канал: личка в телеграме, не инстаграм',
      'предыдущий вариант не подошёл — дай другой ход, не переписывай тот же',
      await describeAccess(chatId),
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
 * Отправить человеку произвольный текст от имени рабочего аккаунта.
 *
 * Нужна кабинету: там ответ можно поправить руками перед отправкой, поэтому
 * шлём текст, а не заранее сохранённый вариант.
 *
 * Отправленное сразу кладём в переписку под ключом из ответа телеграма. Тот
 * же ключ придёт следом апдейтом business_message — и отвалится дедупом,
 * вместо того чтобы лечь в тред вторым таким же сообщением.
 */
export async function sendAs(
  chatId: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const body = text.trim();
  if (!body) return { ok: false, error: 'пустой текст' };

  const token = process.env.BOT_TOKEN;
  if (!token) return { ok: false, error: 'нет токена' };

  const conn = await prisma.tgBusinessConn.findFirst({
    where: { isEnabled: true },
    orderBy: { connectedAt: 'desc' },
  });
  if (!conn) return { ok: false, error: 'бот не подключён к личке' };
  if (!conn.canReply) return { ok: false, error: 'нет права отвечать, проверь настройки бизнес-бота' };

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      business_connection_id: conn.id,
      chat_id: Number(chatId),
      text: body,
    }),
  });
  const out = (await res.json()) as {
    ok: boolean;
    description?: string;
    result?: { message_id: number; date: number };
  };
  if (!out.ok || !out.result) {
    console.error('[business] отправка из кабинета не прошла', out.description);
    return { ok: false, error: out.description || 'телеграм отказал' };
  }

  const known = await prisma.tgBusinessMsg.findFirst({
    where: { chatId },
    orderBy: { createdAt: 'desc' },
    select: { username: true, name: true, leadId: true },
  });

  await prisma.tgBusinessMsg
    .create({
      data: {
        id: `${chatId}:${out.result.message_id}`,
        chatId,
        side: 'us',
        username: known?.username ?? null,
        name: known?.name ?? null,
        text: body,
        leadId: known?.leadId ?? null,
        createdAt: new Date(out.result.date * 1000),
      },
    })
    .catch(() => {});

  return { ok: true };
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
