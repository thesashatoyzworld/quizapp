import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { trackEvent } from '@/lib/notion';
import { notifyAdmin, sendBotMessage, editAdminMarkup, type NotifyRef } from '@/lib/telegram';
import { leadKeyboard, parseLeadCallback } from '@/lib/lead-keyboard';
import { STATUS_LABEL, type LeadStatus } from '@/content/lead-status';
import { prisma } from '@/lib/prisma';
import { getLeadMagnet, type LeadMagnet } from '@/lib/leadmagnets';
import { CATALOG, getProductBySlug } from '@/lib/catalog';
import { canBuy, isOnSale, PERSONAL_KEY, WAITLIST_ANKETA_ASK, WAITLIST_OFFER, waitlistLink } from '@/lib/sales';
import { grantAccess, bindAccessToTelegram } from '@/lib/access';
import { handleKbQuestion } from '@/lib/kb/ask';
import { handleSalesQuestion } from '@/lib/sales/ask';
import {
  handleBusinessMessage, saveConnection,
  type TgBusinessConnection, type TgBusinessMessage,
} from '@/lib/sales/tg';
import { handleScreenshots } from '@/lib/sales/shots';
import {
  INTAKE_CB,
  adminAddQuestion,
  claimBlindIntake,
  adminCreateLink,
  adminList,
  adminSendInvite,
  advanceIntake,
  beginIntake,
  ensureIntake,
  getIntake,
  handleIntakeMessage,
  resolveTrack,
  pauseIntake,
  sendCurrentQuestion,
  sendPreamble,
  skipStep,
  syncUsername,
  transcribePending,
} from '@/lib/intake';
import { sendWelcomeT2 } from '@/lib/onboarding';
import { findIntakeFor, rebuildRoadmap } from '@/lib/roadmap/build';
import { approveAndSend } from '@/lib/roadmap/review';
import { scheduleRoadmapBuild } from '@/lib/qstash';
import { INTAKE_TEXTS } from '@/content/intake-tarif3';
import { trackContent } from '@/content/intake-tracks';

// Держим функцию открытой дольше дефолтных 10с: kazino-флоу ждёт ~7с между
// сообщением про канал и статьёй. 60с нужны анкете: расшифровка голосового
// идёт в after() и на пятиминутной записи Whisper не укладывается в 20с.
export const maxDuration = 60;

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://quizapp-ivory-delta.vercel.app';

// Телеграм подписывает свои запросы заголовком: тот же секрет, что передан
// в setWebhook. Без проверки роут дёргает кто угодно, а с базой знаний каждый
// чужой POST — два обращения к модели за наш счёт (лимит 20/сутки считается по
// telegram_id, а его в поддельном апдейте можно поставить любой).
// Ставится скриптом `node scripts/set-webhook.mjs set`.
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

function isFromTelegram(request: NextRequest): boolean {
  // Секрет не задан — пропускаем всех, как было. Это окно на раскатку:
  // код уезжает в прод раньше, чем секрет прописан в Vercel и в setWebhook.
  if (!WEBHOOK_SECRET) return true;
  return request.headers.get('x-telegram-bot-api-secret-token') === WEBHOOK_SECRET;
}

interface TelegramUpdate {
  // Личка рабочего аккаунта, к которому подключён бот. Отдельный тип: это
  // НЕ сообщения боту, и в общий разбор ниже они попадать не должны.
  business_connection?: TgBusinessConnection;
  business_message?: TgBusinessMessage;
  message?: {
    chat: {
      id: number;
      // private | group | supergroup | channel. Анкета живёт только в личке:
      // бот сидит админом в клиентских группах, и без этой проверки он
      // принимал сообщения оттуда за ответы на вопросы и отвечал в группу.
      type?: string;
    };
    text?: string;
    from?: {
      id?: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    // Анкета принимает не только текст: голосовые, скрины, кружки, файлы.
    voice?: { file_id: string; duration?: number; file_size?: number };
    photo?: { file_id: string }[];
    // Номер сообщения: по нему альбом из скриншотов разбирает только первый
    // апдейт, иначе на три картинки прилетит три одинаковых ответа.
    message_id?: number;
    // Альбом приходит по апдейту на картинку, склеивается по этому полю.
    media_group_id?: string;
    document?: { file_id: string; file_name?: string };
    video_note?: { file_id: string; duration?: number };
    caption?: string;
  };
  callback_query?: {
    id: string;
    data?: string;
    from: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    message?: {
      chat: { id: number; type?: string };
      message_id: number;
    };
  };
}

async function sendMessage(chatId: number, text: string, replyMarkup?: object) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!result.ok) {
    console.error('Telegram sendMessage failed:', JSON.stringify(result));
  }
  return result;
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    }),
  });
}

async function editMessageText(
  chatId: number,
  messageId: number,
  text: string,
  markup?: { inline_keyboard: unknown[][] },
) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      ...(markup ? { reply_markup: markup } : {}),
    }),
  });
}

/** Кнопка на анкету листа ожидания — единственная дверь в этот список. */
function anketaButton(tier: string) {
  return {
    inline_keyboard: [[{ text: '✍️ Заполнить анкету', url: waitlistLink(tier, 'bot') }]],
  };
}

// Записи в лист ожидания одним кликом больше нет: из бота приходил только
// username, а достучаться потом получалось не всегда. Единственная дверь —
// анкета, там же и телефон с инстаграмом. Старые ссылки и кнопки не ломаем,
// а уводим на неё же. Прежние записи лежат в events как `waitlist_join`.

// Check whether a user is a member of a public channel.
// Requires @testtoyzbot to be an admin of that channel, otherwise Telegram
// returns an error and we fail open (treat as subscribed) to avoid blocking
// users on a misconfiguration.
async function isChannelMember(channelUsername: string, userId: number): Promise<boolean> {
  const channel = channelUsername.startsWith('@') ? channelUsername : `@${channelUsername}`;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${encodeURIComponent(channel)}&user_id=${userId}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.ok) {
      console.error('getChatMember failed:', JSON.stringify(data));
      return true; // fail open — don't lock people out if the bot isn't admin yet
    }
    const status = data.result?.status as string;
    return ['creator', 'administrator', 'member'].includes(status);
  } catch (err) {
    console.error('getChatMember error:', err);
    return true; // fail open on network errors
  }
}

// Deliver a lead magnet: warm message + web_app button, plus analytics.
async function deliverLeadMagnet(
  chatId: number,
  slug: string,
  lm: LeadMagnet,
  firstName: string,
  username: string,
  fullName: string,
) {
  const lmText = `привет, ${firstName}\n\n${lm.intro}${lm.softPitch ? '\n\n' + lm.softPitch : ''}`;
  const lmMarkup = {
    inline_keyboard: [
      [{ text: '📖 Открыть гайд', web_app: { url: lm.url } }],
    ],
  };

  await sendMessage(chatId, lmText, lmMarkup);

  await Promise.all([
    trackEvent({
      event_type: 'leadmagnet_delivered',
      user_id: chatId,
      username: username || undefined,
      first_name: fullName || undefined,
      utm_source: `leadmagnet_${slug}`,
      metadata: { slug },
    }),
    notifyAdmin(
      `🪝 <b>Лид-магнит выдан</b>\n\n` +
      `Материал: ${lm.title}\n` +
      `Slug: <code>${slug}</code>\n` +
      `👤 ${fullName || '—'}\n` +
      `💬 ${username ? '@' + username : 'без username'}\n` +
      `🆔 <code>${chatId}</code>`
    ),
  ]);
}

// Ask a non-subscriber to join the channel before getting the magnet.
async function sendSubscriptionGate(chatId: number, slug: string, lm: LeadMagnet, firstName: string) {
  const channel = lm.channelUsername.startsWith('@') ? lm.channelUsername : `@${lm.channelUsername}`;
  const gateText =
    lm.gateText ||
    `привет, ${firstName}\n\nчтобы забрать материал — подпишись на канал, оттуда я и делюсь всем этим\n\nподписался? жми кнопку ниже 👇`;

  const gateMarkup = {
    inline_keyboard: [
      [{ text: '📲 Подписаться на канал', url: `https://t.me/${channel.replace(/^@/, '')}` }],
      [{ text: '✅ Я подписался', callback_data: `checksub:${slug}` }],
    ],
  };

  await sendMessage(chatId, gateText, gateMarkup);
}

/**
 * Личка или нет. В приватном чате chat.id совпадает с id отправителя, в группе
 * chat.id отрицательный и общий на всех. Анкета работает только в личке:
 * бот админом сидит в клиентских группах, и без этой проверки он принимал
 * сообщения оттуда за ответы на вопросы анкеты и отвечал прямо в группу.
 */
/** Кому вообще можно менять статус заявки кнопкой: только личный и рабочий аккаунт Саши. */
function isAdminChat(chatId: number | string): boolean {
  const id = String(chatId);
  return [process.env.ADMIN_CHAT_ID, process.env.ADMIN_CHAT_ID_WORK]
    .map((v) => (v || '').trim())
    .filter(Boolean)
    .includes(id);
}

/**
 * Нажали кнопку статуса под заявкой.
 *
 * Статус пишем в ту же колонку, что правится в кабинете, — раздел «Заявки» и бот
 * показывают одно и то же. Кнопки перерисовываем во всех чатах, куда уходило
 * уведомление: на личном и рабочем аккаунте под одной заявкой не должно висеть
 * два разных состояния.
 */
async function handleLeadStatusButton(
  cb: NonNullable<TelegramUpdate['callback_query']>,
  leadId: number,
  status: LeadStatus,
) {
  const chatId = cb.message?.chat.id;
  if (chatId === undefined || !isAdminChat(chatId)) {
    await answerCallbackQuery(cb.id);
    return;
  }

  const who = cb.from.username ? '@' + cb.from.username : `tg:${cb.from.id}`;

  let lead;
  try {
    lead = await prisma.dwyLead.update({
      where: { id: leadId },
      data: { status, updatedBy: who, updatedAt: new Date() },
    });
  } catch (error) {
    console.error('[lead-button] не записал статус', error);
    await answerCallbackQuery(cb.id, 'Не сохранилось, попробуй ещё раз');
    return;
  }

  await answerCallbackQuery(cb.id, `Статус: ${STATUS_LABEL[status]}`);

  // Куда уходило уведомление. Старые заявки этого не помнят — тогда правим
  // хотя бы то сообщение, по которому нажали.
  const stored = Array.isArray(lead.notifyRefs) ? (lead.notifyRefs as unknown as NotifyRef[]) : [];
  const refs = stored.length
    ? stored
    : [{ chatId: String(chatId), messageId: cb.message!.message_id }];

  const markup = leadKeyboard(leadId, status);
  await Promise.all(refs.map((ref) => editAdminMarkup(ref, markup)));
}

function isPrivateChat(chat: { id: number; type?: string }, fromId?: number): boolean {
  if (chat.type) return chat.type === 'private';
  return fromId !== undefined && chat.id === fromId;
}

export async function POST(request: NextRequest) {
  // Чужой запрос отбиваем до чтения тела: ни записей в базу, ни обращений
  // к модели. Телеграму 401 никогда не прилетит — он шлёт заголовок сам.
  if (!isFromTelegram(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const update: TelegramUpdate = await request.json();

    // Личка рабочего аккаунта идёт своей веткой и с ранним выходом. Ниже
    // весь разбор висит на update.message — команды, кабинет, анкеты, — и
    // если пустить переписки с клиентами туда же, бот начнёт отвечать на них
    // как на команды себе.
    if (update.business_connection) {
      await saveConnection(update.business_connection);
      return NextResponse.json({ ok: true });
    }

    if (update.business_message) {
      // Работу делаем прямо в запросе, не откладывая в after(): фоновая
      // часть до человека не доходит — на этом уже обожглись в ветке
      // помощника. Полминуты вебхук держит, у роута maxDuration 60.
      try {
        await handleBusinessMessage(update.business_message);
      } catch (e) {
        console.error('[business_message] разбор не прошёл', e);
      }
      return NextResponse.json({ ok: true });
    }

    // Handle inline button callbacks
    if (update.callback_query) {
      const cb = update.callback_query;
      const data = cb.data || '';

      // Кнопки статуса под уведомлением о заявке с сайта.
      const leadHit = parseLeadCallback(data);
      if (leadHit) {
        await handleLeadStatusButton(cb, leadHit.leadId, leadHit.status);
        return NextResponse.json({ ok: true });
      }

      // Кнопки анкеты тарифа 3
      if (data.startsWith('intake:') && cb.message) {
        const chatId = cb.message.chat.id;
        await answerCallbackQuery(cb.id);

        // Кнопки анкеты тоже только в личке.
        if (!isPrivateChat(cb.message.chat, cb.from.id)) return NextResponse.json({ ok: true });

        await syncUsername(cb.from.id, cb.from.username, cb.from.first_name);
        const intake = await getIntake(cb.from.id);

        if (!intake) {
          await sendMessage(chatId, INTAKE_TEXTS.noAccess);
          return NextResponse.json({ ok: true });
        }

        if (data === INTAKE_CB.start) await beginIntake(intake, chatId);
        else if (data === INTAKE_CB.next) await advanceIntake(intake, chatId);
        else if (data === INTAKE_CB.skip) await skipStep(intake, chatId);
        else if (data === INTAKE_CB.later) await pauseIntake(intake, chatId);

        return NextResponse.json({ ok: true });
      }

      // Лист ожидания «Нового уровня контента»: набор на тариф закрыт.
      // Кнопка не записывает, а ведёт на анкету — список один, живёт
      // в `dwy_leads` вместе с анкетами на менторство.
      if (data.startsWith('waitlist_') && cb.message) {
        const tier = data.slice('waitlist_'.length);
        const chatId = cb.message.chat.id;

        if (!['t1', 't2', 't3'].includes(tier)) {
          await answerCallbackQuery(cb.id);
          return NextResponse.json({ ok: true });
        }

        await syncUsername(cb.from.id, cb.from.username, cb.from.first_name);
        await answerCallbackQuery(cb.id);
        await editMessageText(
          chatId,
          cb.message.message_id,
          WAITLIST_ANKETA_ASK,
          anketaButton(tier),
        );

        return NextResponse.json({ ok: true });
      }

      // Masterclass SYNC waitlist join
      if (data === 'mcsync_join' && cb.message) {
        const tgUserId = cb.from.id;
        const username = cb.from.username || null;
        const firstName = cb.from.first_name || null;
        const lastName = cb.from.last_name || null;
        const chatId = cb.message.chat.id;
        const messageId = cb.message.message_id;

        try {
          const existing = await prisma.masterclassSyncWaitlist.findUnique({
            where: { telegramId: BigInt(tgUserId) },
          });

          if (existing) {
            await answerCallbackQuery(cb.id, 'Ты уже в списке ✓');
            await editMessageText(
              chatId,
              messageId,
              `Ты уже в листе ожидания ✓\n\nКак только появятся новости — напишу первым.`
            );
          } else {
            await prisma.masterclassSyncWaitlist.create({
              data: {
                telegramId: BigInt(tgUserId),
                username,
                firstName,
                lastName,
              },
            });

            await answerCallbackQuery(cb.id, 'Ты в списке ✓');
            await editMessageText(
              chatId,
              messageId,
              `Готово ⚡\n\nТы в листе ожидания мастеркласса <b>SYNC</b>.\n\nКак только появятся даты и детали — напишу первым.`
            );

            await notifyAdmin(
              `📌 <b>Новая запись в waitlist SYNC</b>\n\n` +
              `👤 ${[firstName, lastName].filter(Boolean).join(' ') || '—'}\n` +
              `💬 ${username ? '@' + username : 'без username'}\n` +
              `🆔 <code>${tgUserId}</code>`
            );

            await trackEvent({
              event_type: 'masterclasssync_waitlist_join',
              user_id: tgUserId,
              username: username || undefined,
              first_name: firstName || undefined,
              utm_source: 'masterclasssync',
            });
          }
        } catch (err) {
          console.error('mcsync_join error:', err);
          await answerCallbackQuery(cb.id, 'Что-то пошло не так, попробуй ещё раз');
        }

        return NextResponse.json({ ok: true });
      }

      // МК «Разрешение быстрых денег» waitlist join
      if (data === 'rdmk_join' && cb.message) {
        const tgUserId = cb.from.id;
        const username = cb.from.username || null;
        const firstName = cb.from.first_name || null;
        const lastName = cb.from.last_name || null;
        const chatId = cb.message.chat.id;
        const messageId = cb.message.message_id;

        try {
          const existing = await prisma.moneyMkWaitlist.findUnique({
            where: { telegramId: BigInt(tgUserId) },
          });

          if (existing) {
            await answerCallbackQuery(cb.id, 'Ты уже в списке ✓');
            await editMessageText(
              chatId,
              messageId,
              `ты уже в списке ✓\n\nкак открою даты — напишу одному из первых.`
            );
          } else {
            await prisma.moneyMkWaitlist.create({
              data: {
                telegramId: BigInt(tgUserId),
                username,
                firstName,
                lastName,
              },
            });

            await answerCallbackQuery(cb.id, 'Ты в списке ✓');
            await editMessageText(
              chatId,
              messageId,
              `готово ⚡\n\nты в листе ожидания «Разрешение быстрых денег».\n\nсейчас добиваю инфраструктуру и программу — как открою даты, напишу тебе одному из первых.`
            );

            // Уведомление админу для этого МК намеренно отключено —
            // список смотрим вручную через check-moneymk-waitlist.cjs.

            await trackEvent({
              event_type: 'moneymk_waitlist_join',
              user_id: tgUserId,
              username: username || undefined,
              first_name: firstName || undefined,
              utm_source: 'razreshenie_deneg',
            });
          }
        } catch (err) {
          console.error('rdmk_join error:', err);
          await answerCallbackQuery(cb.id, 'Что-то пошло не так, попробуй ещё раз');
        }

        return NextResponse.json({ ok: true });
      }

      // Subscription gate re-check: "Я подписался"
      if (data.startsWith('checksub:') && cb.message) {
        const slug = data.slice('checksub:'.length);
        const userId = cb.from.id;
        const chatId = cb.message.chat.id;
        const firstName = cb.from.first_name || 'друг';
        const username = cb.from.username || '';
        const fullName = [cb.from.first_name, cb.from.last_name].filter(Boolean).join(' ');

        const lm = getLeadMagnet(slug);
        if (!lm) {
          await answerCallbackQuery(cb.id, 'Материал не найден');
          return NextResponse.json({ ok: true });
        }

        const subscribed = await isChannelMember(lm.channelUsername, userId);
        if (subscribed) {
          await answerCallbackQuery(cb.id, 'Готово ✓');
          await editMessageText(chatId, cb.message.message_id, 'спасибо, что подписался 🤝 держи материал ниже');
          await deliverLeadMagnet(chatId, slug, lm, firstName, username, fullName);
        } else {
          await answerCallbackQuery(cb.id, 'Пока не вижу подписку — подпишись и нажми ещё раз');
        }

        return NextResponse.json({ ok: true });
      }

      // Черновик маршрутной карты: одобрить или пересобрать. Только Саша.
      if ((data.startsWith('karta_ok:') || data.startsWith('karta_redo:')) && cb.message) {
        const isAdmin = String(cb.message.chat.id) === (process.env.ADMIN_CHAT_ID || '').trim();
        if (!isAdmin) {
          await answerCallbackQuery(cb.id);
          return NextResponse.json({ ok: true });
        }

        const roadmapId = data.slice(data.indexOf(':') + 1);
        const chatId = cb.message.chat.id;
        const messageId = cb.message.message_id;

        if (data.startsWith('karta_ok:')) {
          // Кнопки снимаем сразу: одобрение нажимается один раз, иначе
          // человек получит второе такое же сообщение.
          await answerCallbackQuery(cb.id, 'Отправляю…');
          await editMessageText(chatId, messageId, 'отправляю карту…');
          const result = await approveAndSend(roadmapId);
          await editMessageText(chatId, messageId, result);
          return NextResponse.json({ ok: true });
        }

        await answerCallbackQuery(cb.id, 'Пересобираю…');
        const queued = await rebuildRoadmap(roadmapId);
        await editMessageText(chatId, messageId, queued);
        return NextResponse.json({ ok: true });
      }

      // Unknown callback — just ack
      await answerCallbackQuery(cb.id);
      return NextResponse.json({ ok: true });
    }

    // Сборка маршрутной карты руками: /karta_sobrat @username. Только Саша.
    if (
      update.message?.text?.startsWith('/karta_sobrat') &&
      String(update.message.chat.id) === (process.env.ADMIN_CHAT_ID || '').trim()
    ) {
      const chatId = update.message.chat.id;
      const arg = update.message.text.trim().split(/\s+/)[1] || '';

      if (!arg) {
        await sendBotMessage(chatId, 'кому: /karta_sobrat @username', undefined, null);
        return NextResponse.json({ ok: true });
      }

      const intakeId = await findIntakeFor(arg);
      if (!intakeId) {
        await sendBotMessage(chatId, `анкеты ${arg} нет в базе, собирать не из чего`, undefined, null);
        return NextResponse.json({ ok: true });
      }

      // Сборка идёт минуты, вебхук столько не живёт: уводим в очередь.
      await scheduleRoadmapBuild(intakeId, 1);
      await sendBotMessage(chatId, `собираю карту ${arg}, черновик пришлю сюда через пару минут`, undefined, null);
      return NextResponse.json({ ok: true });
    }

    // Команды Саши по анкетам. Только из его чата, ADMIN_CHAT_ID.
    if (
      update.message?.text?.startsWith('/anketa_') &&
      String(update.message.chat.id) === (process.env.ADMIN_CHAT_ID || '').trim()
    ) {
      const chatId = update.message.chat.id;
      const raw = update.message.text.trim();
      const [cmd, ...rest] = raw.split(/\s+/);
      const arg = rest[0] || '';
      const tail = rest.slice(1).join(' ');

      let reply: string;
      if (cmd === '/anketa_send') {
        reply = arg ? await adminSendInvite(arg) : 'кому: /anketa_send @username';
      } else if (cmd === '/anketa_link') {
        reply = arg ? await adminCreateLink(arg) : 'кому: /anketa_link @username';
      } else if (cmd === '/anketa_add') {
        reply = arg && tail ? await adminAddQuestion(arg, tail) : 'формат: /anketa_add @username текст вопроса';
      } else if (cmd === '/anketa_list') {
        reply = await adminList();
      } else {
        reply = 'команды: /anketa_send, /anketa_link, /anketa_add, /anketa_list';
      }

      // Без parse_mode: подчёркивание в юзернейме Markdown принимает за курсив.
      await sendBotMessage(chatId, reply, undefined, null);
      return NextResponse.json({ ok: true });
    }

    // Анкета тарифа 3: человек сам вернулся продолжить или начать.
    if (
      update.message?.text?.trim().startsWith('/anketa') &&
      update.message.from?.id &&
      isPrivateChat(update.message.chat, update.message.from.id)
    ) {
      const chatId = update.message.chat.id;
      const tgId = update.message.from.id;

      await syncUsername(tgId, update.message.from.username, update.message.from.first_name);

      // Набор вопросов зависит от тарифа: t3 — досье к созвону, t2 — маршрут.
      const track = await resolveTrack(tgId);
      if (!track) {
        await sendMessage(chatId, INTAKE_TEXTS.noAccess);
        return NextResponse.json({ ok: true });
      }

      const intake = await ensureIntake(
        tgId,
        update.message.from.username || null,
        update.message.from.first_name || null,
        undefined,
        track,
      );

      if (intake.status === 'done') {
        await sendMessage(chatId, trackContent(intake.track).texts.alreadyDone);
      } else if (intake.status === 'in_progress') {
        await sendMessage(chatId, trackContent(intake.track).texts.resume);
        await sendCurrentQuestion(intake, chatId);
      } else {
        await sendPreamble(chatId, intake);
      }

      return NextResponse.json({ ok: true });
    }

    // Помощник в продажах. Стоит перед анкетой намеренно: анкета забирает
    // любое сообщение своего человека и отвечает «записал», а ник в ответ на
    // её вопрос никто не шлёт. Ветка узкая — только свои чаты и только когда
    // в сообщении есть ник, поэтому анкете она не мешает. Здесь же ловятся
    // команды: ниже по коду сообщения с «/» отрезаны.
    if (
      update.message?.text &&
      update.message.from?.id &&
      isPrivateChat(update.message.chat, update.message.from.id)
    ) {
      const sales = await handleSalesQuestion({
        chatId: update.message.chat.id,
        text: update.message.text,
      });
      if (sales.handled) return NextResponse.json({ ok: true });
    }

    // Скриншот переписки от своих. Тоже перед анкетой: она забирает картинки
    // как ответ на свой вопрос. Ветка узкая — только чаты помощника.
    if (
      update.message?.photo?.length &&
      update.message.from?.id &&
      isPrivateChat(update.message.chat, update.message.from.id)
    ) {
      const m = update.message;
      const shot = await handleScreenshots({
        chat: { id: m.chat.id },
        message_id: m.message_id ?? 0,
        photo: m.photo,
        media_group_id: m.media_group_id,
        caption: m.caption,
      });
      if (shot) return NextResponse.json({ ok: true });
    }

    // Ответ на вопрос анкеты: голос, текст, скрин, ссылка, кружок, файл.
    // Команды сюда не попадают, они разобраны выше.
    if (
      update.message?.from?.id &&
      !update.message.text?.startsWith('/') &&
      isPrivateChat(update.message.chat, update.message.from.id)
    ) {
      const m = update.message;
      const tgId = m.from!.id!;

      await syncUsername(tgId, m.from?.username, m.from?.first_name);

      const result = await handleIntakeMessage({
        chatId: m.chat.id,
        telegramId: tgId,
        username: m.from?.username,
        firstName: m.from?.first_name,
        text: m.text || m.caption,
        voice: m.voice,
        photo: m.photo,
        document: m.document,
        videoNote: m.video_note,
      });

      if (result.handled) {
        // Whisper дольше, чем можно держать вебхук: отвечаем Telegram сразу,
        // расшифровка догоняет фоном.
        if (result.transcribeAnswerId) {
          const answerId = result.transcribeAnswerId;
          after(async () => {
            await transcribePending(answerId, m.chat.id);
          });
        }
        return NextResponse.json({ ok: true });
      }

      // Анкета сообщение не забрала — значит человек просто написал вопрос.
      // Отвечаем по материалам курса. Голосовые и файлы база знаний не берёт:
      // эти типы занимает анкета, пересечение сломало бы обе ветки.
      if (m.text) {
        const kb = await handleKbQuestion({
          chatId: m.chat.id,
          telegramId: tgId,
          text: m.text,
        });
        if (kb.handled) return NextResponse.json({ ok: true });
      }
    }

    // Handle /start command (with or without parameters)
    if (update.message?.text?.startsWith('/start')) {
      const chatId = update.message.chat.id;
      const firstName = update.message.from?.first_name || 'друг';
      const username = update.message.from?.username || '';
      const fullName = [update.message.from?.first_name, update.message.from?.last_name].filter(Boolean).join(' ');

      // Parse UTM source from /start parameter (e.g. "/start youtube")
      const parts = update.message.text.split(' ');
      const startParam = parts.length > 1 ? parts[1].trim() : '';

      // Debug logging
      console.log('Webhook received:', { text: update.message.text, startParam });

      // Персональная ссылка на анкету: /start intake_<token>.
      // Нужна тем, кто ни разу не заходил в бота: им бот написать первым не может,
      // ссылку выдаёт Саша руками, поэтому гейт по базе здесь не нужен.
      if (startParam.startsWith('intake_')) {
        const token = startParam.slice('intake_'.length);
        const tgId = update.message.from?.id || chatId;

        const found = await prisma.intake.findUnique({ where: { inviteToken: token } });
        await syncUsername(tgId, username || null, update.message.from?.first_name || null);

        // Ссылку могли выдать вслепую: тогда анкета без telegram_id и
        // привязывается к тому, кто первым по ней пришёл.
        const byToken = found
          ? await claimBlindIntake(found, tgId, username || null, update.message.from?.first_name || null)
          : null;

        if (byToken) {
          if (byToken.status === 'done') {
            await sendMessage(chatId, trackContent(byToken.track).texts.alreadyDone);
          } else if (byToken.status === 'in_progress') {
            await sendMessage(chatId, trackContent(byToken.track).texts.resume);
            await sendCurrentQuestion(byToken, chatId);
          } else {
            await sendPreamble(chatId, byToken);
          }
        } else {
          // Токена нет: пускаем, только если доступ есть в базе.
          const track = await resolveTrack(tgId);
          if (track) {
            const intake = await ensureIntake(
              tgId,
              username || null,
              update.message.from?.first_name || null,
              undefined,
              track,
            );
            await sendPreamble(chatId, intake);
          } else {
            await sendMessage(chatId, INTAKE_TEXTS.noAccess);
          }
        }

        await trackEvent({
          event_type: 'intake_open',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: 'intake_link',
        });

        return NextResponse.json({ ok: true });
      }

      // Авто-выдача доступа после оплаты картой на сайте: /start paid_<token>.
      // Продамус редиректит сюда после успешной оплаты; код подтверждён вебхуком
      // (Event type web_paid/mk_web_paid). Продукт берём из события — работает для
      // любого продукта (МК, «Новый уровень контента» и т.д.).
      if (startParam.startsWith('paid_')) {
        const token = startParam.slice('paid_'.length);
        try {
          const ev = await prisma.event.findFirst({
            where: { type: { in: ['web_paid', 'mk_web_paid'] }, metadata: { path: ['token'], equals: token } },
            orderBy: { createdAt: 'desc' },
          });

          if (!ev) {
            // Оплата ещё не долетела вебхуком (или код не найден) — просим повторить.
            await sendMessage(
              chatId,
              `${firstName}, вижу тебя 👋\n\nоплата ещё обрабатывается — нажми /start через минуту, и я открою доступ. если не поможет — напиши сюда.`
            );
            return NextResponse.json({ ok: true });
          }

          const meta = (ev.metadata || {}) as { consumed?: boolean; boundTelegramId?: number; amount?: number; orderId?: string };
          // Продукт и источник доступа — из события. Легаси mk_web_paid без productSlug → mk-dengi.
          const product = getProductBySlug(ev.productSlug || 'mk-dengi') || CATALOG.mk_dengi;
          const source = meta.orderId || `mkdengi_web_${token}`;
          const amount = meta.amount || product.price;

          if (meta.consumed && meta.boundTelegramId && meta.boundTelegramId !== chatId) {
            await sendMessage(chatId, `этот код уже активирован на другом аккаунте. если это ошибка — напиши сюда.`);
            return NextResponse.json({ ok: true });
          }

          // Идемпотентно: создаём юзера, покупку (если ещё не выдавали), помечаем код использованным.
          const user = await prisma.user.upsert({
            where: { telegramId: BigInt(chatId) },
            create: { telegramId: BigInt(chatId), username: username || null, firstName: update.message.from?.first_name || null },
            update: {},
          });

          if (!meta.consumed) {
            const dbProduct = await prisma.product.findUnique({ where: { slug: product.slug } });
            if (dbProduct) {
              await prisma.purchase.create({
                data: { userId: user.id, productId: dbProduct.id, amount, source: 'web_redeem', prodamusOrderId: `paid_${token}` },
              });
            }
          }

          // Привязываем выданный картой доступ к этому Telegram (source = <prefix>_web_<token>).
          await bindAccessToTelegram(source, chatId, user.id);

          // Срок выдаём ТОЛЬКО на первом редиме. grantAccess для подписки продлевает
          // от max(текущий срок, сейчас), поэтому каждый повторный /start paid_<token>
          // дарил бы ещё месяц за ту же оплату (так у части т2 накопилось 2-6 месяцев).
          // Исключение — доступа нет вовсе (старый платёж, ручная чистка): тогда выдаём.
          const alreadyHasAccess = await prisma.productAccess.findFirst({
            where: { telegramId: BigInt(chatId), productSlug: product.slug },
          });
          if (!meta.consumed || !alreadyHasAccess) {
            await grantAccess({ product, telegramId: chatId, userId: user.id, source });
          }

          await prisma.event.update({
            where: { id: ev.id },
            data: { telegramId: BigInt(chatId), metadata: { ...meta, token, consumed: true, boundTelegramId: chatId } },
          });

          // Тариф 2 встречает своим пакетом: где что лежит, группа, следом интервью.
          // Остальные продукты — прежним коротким сообщением про кабинет.
          const welcomed =
            product.slug === 'uroven-t2' ? await sendWelcomeT2(chatId) : false;

          if (!welcomed) {
            await sendMessage(
              chatId,
              `готово ⚡\n\nоплата подтверждена, доступ к <b>${product.name}</b> открыт. материалы — в кабинете, жми кнопку ниже.`,
              { inline_keyboard: [[{ text: '🚪 Открыть кабинет', web_app: { url: 'https://world.thesashatoyz.com/dostup' } }]] }
            );
          }

          await notifyAdmin(
            `✅ <b>Доступ выдан по коду</b> (оплата картой)\n\n${product.name}\n👤 ${fullName || '—'}\n💬 ${username ? '@' + username : 'без username'}\n🆔 <code>${chatId}</code>\nToken: <code>${token}</code>`,
            { alsoWork: true },
          );
        } catch (err) {
          console.error('paid redeem error:', err);
          await sendMessage(chatId, `что-то пошло не так с активацией. напиши сюда — открою доступ вручную.`);
        }

        return NextResponse.json({ ok: true });
      }

      // Кабинет deep-link: /start kabinet → присылаем кнопку кабинета.
      // Нужен для ручной выдачи доступа (крипта и т.п.), где вебхука оплаты
      // не было и кнопка автоматически не приходила. Ничего не выдаёт — сам
      // кабинет гейтит по telegram_id и покажет только реально купленное.
      if (startParam === 'kabinet' || startParam === 'dostup') {
        await prisma.user.upsert({
          where: { telegramId: BigInt(chatId) },
          create: { telegramId: BigInt(chatId), username: username || null, firstName: update.message.from?.first_name || null },
          update: {},
        });
        await sendMessage(
          chatId,
          `${firstName}, кабинет здесь 👇\n\nвнутри все материалы, к которым у тебя открыт доступ. если чего-то не хватает — напиши сюда.`,
          { inline_keyboard: [[{ text: '🚪 Открыть кабинет', web_app: { url: 'https://world.thesashatoyz.com/dostup' } }]] }
        );
        return NextResponse.json({ ok: true });
      }

      // Разделы кабинета deep-link: /start sozvony | razbory → кнопка сразу в раздел.
      // Нужен для анонсов в группе: ссылка из поста открывает нужный раздел в боте.
      // Ничего не выдаёт — раздел гейтит по telegram_id на сервере.
      if (startParam === 'sozvony' || startParam === 'razbory') {
        const room = startParam === 'sozvony'
          ? { url: 'https://world.thesashatoyz.com/sozvony', button: '🎥 Открыть созвоны', what: 'записи групповых созвонов с конспектами' }
          : { url: 'https://world.thesashatoyz.com/razbory', button: '🎥 Открыть разборы', what: 'разборы созвонов учеников с конспектами' };
        await prisma.user.upsert({
          where: { telegramId: BigInt(chatId) },
          create: { telegramId: BigInt(chatId), username: username || null, firstName: update.message.from?.first_name || null },
          update: {},
        });
        await sendMessage(
          chatId,
          `${firstName}, ${room.what} здесь 👇\n\nраздел открыт на тарифах 2 и 3. если не открывается — напиши сюда.`,
          { inline_keyboard: [[{ text: room.button, web_app: { url: room.url } }]] }
        );
        return NextResponse.json({ ok: true });
      }

      // Личное: /start lichnoe → кнопка в раздел с персональными материалами.
      // Отдельно от sozvony/razbory: там гейт по тарифу, здесь по конкретному
      // человеку, поэтому и текст другой. Ссылку можно слать одну на всех:
      // у кого материалов нет, тот увидит пустой раздел и ничего чужого.
      if (startParam === 'lichnoe') {
        await prisma.user.upsert({
          where: { telegramId: BigInt(chatId) },
          create: { telegramId: BigInt(chatId), username: username || null, firstName: update.message.from?.first_name || null },
          update: {},
        });
        await sendMessage(
          chatId,
          `${firstName}, запись нашего созвона и конспект здесь 👇\n\nэто твой личный раздел: внутри только твои материалы, больше их не видит никто. если не открывается, напиши сюда.`,
          { inline_keyboard: [[{ text: '🎥 Открыть личное', web_app: { url: 'https://world.thesashatoyz.com/lichnoe' } }]] }
        );
        return NextResponse.json({ ok: true });
      }

      // Lead-magnet deep link (slug from content/leadmagnets.json)
      if (startParam) {
        const lm = getLeadMagnet(startParam);
        if (lm) {
          // Subscription gate: hold the magnet until the user joins the channel.
          // In a private chat the chat.id equals the user's telegram id.
          if (lm.requireSub) {
            const subscribed = await isChannelMember(lm.channelUsername, chatId);
            if (!subscribed) {
              await sendSubscriptionGate(chatId, startParam, lm, firstName);
              await trackEvent({
                event_type: 'leadmagnet_gated',
                user_id: chatId,
                username: username || undefined,
                first_name: fullName || undefined,
                utm_source: `leadmagnet_${startParam}`,
                metadata: { slug: startParam },
              });
              return NextResponse.json({ ok: true });
            }
          }

          await deliverLeadMagnet(chatId, startParam, lm, firstName, username, fullName);
          return NextResponse.json({ ok: true });
        }
      }

      // Sprint waitlist deep link
      if (startParam === 'sprint') {
        const sprintUrl = `${WEBAPP_URL}/sprint`;
        const sprintText = `Привет, ${firstName}! 🔥

<b>Спринт: Собери digital-систему за день</b>

8 часов в Zoom → уходишь с рабочим сайтом, формой заявок и уведомлениями в Telegram.

А потом сам меняешь что угодно — голосом, без программиста.

Заполни анкету — расскажу детали 👇`;

        const sprintMarkup = {
          inline_keyboard: [
            [
              {
                text: '📋 Заполнить анкету',
                web_app: { url: sprintUrl },
              },
            ],
          ],
        };

        await sendMessage(chatId, sprintText, sprintMarkup);

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: 'sprint',
        });

        return NextResponse.json({ ok: true });
      }

      // Masterclass SYNC waitlist deep link
      if (startParam === 'masterclasssync') {
        const mcsyncText = `Привет, ${firstName}! ⚡

<b>Мастеркласс SYNC</b>

[Описание мастеркласса появится позже]

Запишись в лист ожидания — напишу первым, когда откроются места и появятся детали 👇`;

        const mcsyncMarkup = {
          inline_keyboard: [
            [
              {
                text: '📌 Записаться в лист ожидания',
                callback_data: 'mcsync_join',
              },
            ],
          ],
        };

        await sendMessage(chatId, mcsyncText, mcsyncMarkup);

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: 'masterclasssync',
        });

        return NextResponse.json({ ok: true });
      }

      // Квиз «блоки на деньги» как Mini App — вход с Инсты на ТЕСТ
      // quiz_dengi_ig и т.п. → метка источника прокидывается в utm_source квиза и трекинг
      if (startParam === 'quiz_dengi' || startParam.startsWith('quiz_dengi_')) {
        // текст-болванка, Саша может переписать голосом
        const quizText = `${firstName}, погнали ⚡

короткий тест — покажу, какой именно блок мешает тебе получать деньги. жми 👇`;

        const quizMarkup = {
          inline_keyboard: [
            [
              {
                text: '🧭 Пройти тест',
                web_app: { url: `https://quiz.thesashatoyz.com/quiz-money?utm_source=${startParam}` },
              },
            ],
          ],
        };

        await sendMessage(chatId, quizText, quizMarkup);

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: startParam,
        });

        return NextResponse.json({ ok: true });
      }

      // МК «Разрешение быстрых денег» waitlist deep link
      // принимаем и метки источника: razreshenie_deneg_ig (Instagram) и т.п. — попадают в utm_source трекинга
      if (startParam === 'razreshenie_deneg' || startParam.startsWith('razreshenie_deneg_')) {
        const rdmkText = `${firstName}, ты почти в списке ⚡

<b>«Разрешение быстрых денег»</b> — 7 дней, на которых я прокачу тебя на своей энергии на новый уровень.

цель простая: помочь тебе перейти на ту сторону берега. где тебе можно проявляться и сиять. где можно получать любые деньги. где можно делать то, что ты хочешь.

это не курс и не информация — это экшн. стык коучинга и маркетинга, который сразу закрепляем на практике. три этапа: голова, инструменты, действие.

кто хочет быть в числе первых — жми 👇`;

        const rdmkMarkup = {
          inline_keyboard: [
            [
              {
                text: '📌 Я в числе первых',
                callback_data: 'rdmk_join',
              },
            ],
          ],
        };

        await sendMessage(chatId, rdmkText, rdmkMarkup);

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: startParam,
        });

        return NextResponse.json({ ok: true });
      }

      // Страница МК «Разрешение быстрых денег» (лендинг) сразу из бота.
      // Для постов в TG с прямым CTA: t.me/testtoyzbot?start=mk_page (или mk_page_<источник>).
      // Человек остаётся в базе бота (bot_start), метка уходит в utm_source лендинга.
      if (startParam === 'mk_page' || startParam.startsWith('mk_page_')) {
        // текст-болванка, Саша может переписать голосом
        const pageText = `${firstName}, всё про мастер-класс «Разрешение быстрых денег» — тут 👇`;

        const pageMarkup = {
          inline_keyboard: [
            [
              {
                text: '⚡ Открыть страницу МК',
                web_app: { url: `https://thesashatoyz.com/mk-dengi?utm_source=${startParam}` },
              },
            ],
          ],
        };

        await sendMessage(chatId, pageText, pageMarkup);

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: startParam,
        });

        return NextResponse.json({ ok: true });
      }

      // «Новый уровень контента» — deep-link uroven[_<тариф>][_<метка источника>].
      // Тариф необязателен, метка тоже: uroven_t2_kanal → тариф 2 + источник «kanal»,
      // uroven_kanal → тариф по умолчанию + тот же источник. Так видно, какой канал
      // привёл покупателя (utm_source = uroven_<метка>).
      // Открываем компактный checkout в мини-аппе; оплата привязывается к Telegram.
      // Старая ссылка записи с сайта: t.me/testtoyzbot?start=waitlist_t2.
      // Её могли разослать, поэтому не молчим — уводим на анкету, там же
      // спрашиваем телефон и инстаграм. Сами тут ничего не записываем.
      if (startParam.startsWith('waitlist_')) {
        const tier = startParam.slice('waitlist_'.length).split('_')[0];
        if (['t1', 't2', 't3'].includes(tier)) {
          await sendMessage(chatId, `${firstName}, ${WAITLIST_ANKETA_ASK}`, anketaButton(tier));
          await trackEvent({
            event_type: 'bot_start',
            user_id: chatId,
            username: username || undefined,
            first_name: fullName || undefined,
            utm_source: 'uroven_waitlist',
            metadata: { product: 'uroven', tier, startParam },
          });
          return NextResponse.json({ ok: true });
        }
      }

      if (startParam === 'uroven' || startParam.startsWith('uroven_')) {
        const rest = startParam.startsWith('uroven_') ? startParam.slice('uroven_'.length) : '';
        const parts = rest ? rest.split('_') : [];
        const hasTier = ['t1', 't2', 't3'].includes(parts[0]);
        const safeTier = hasTier ? parts[0] : 't1';
        // Метка: только буквы/цифры/дефис, до 32 символов. Пустая → нет метки.
        const src = (hasTier ? parts.slice(1) : parts).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32) || null;

        // Личная ссылка на закрытый тариф: uroven_t2_svoi. Тот же ключ, что
        // у веб-ссылки /pay/t2?k=svoi — Саша даёт её в переписке одному человеку.
        // Меткой она и остаётся: в аналитике такие оплаты видно как uroven_svoi.
        const personal = src === PERSONAL_KEY;

        // Человек пришёл по старой ссылке на тариф, набор которого закрыт.
        // Не молчим и не открываем чекаут — объясняем и предлагаем лист ожидания.
        if (!canBuy(safeTier, personal)) {
          await sendMessage(
            chatId,
            `${firstName}, ${WAITLIST_OFFER[safeTier as 't1' | 't2' | 't3'] || 'этот тариф сейчас закрыт.'}\n\n${WAITLIST_ANKETA_ASK}`,
            anketaButton(safeTier),
          );
          await trackEvent({
            event_type: 'bot_start',
            user_id: chatId,
            username: username || undefined,
            first_name: fullName || undefined,
            utm_source: src ? `uroven_${src}` : startParam,
            metadata: { product: 'uroven', tier: safeTier, src, startParam, closed: true },
          });
          return NextResponse.json({ ok: true });
        }

        // Ключ едет в чекаут: там своя копия режима продаж, без него мини-апп
        // покажет закрытому тарифу кнопку листа ожидания вместо оплаты.
        const checkoutUrl =
          `${WEBAPP_URL}/uroven/checkout.html?tier=${safeTier}` +
          `${src ? `&src=${src}` : ''}${personal ? `&k=${PERSONAL_KEY}` : ''}`;

        // По личной ссылке человек знает, что набор закрыт: на сайте написано
        // именно так. Одной строкой снимаем вопрос, почему кнопка всё-таки есть.
        const intro =
          personal && !isOnSale(safeTier)
            ? `${firstName}, набор на этот тариф закрыт, тебе открываю лично ⚡`
            : `${firstName}, открываю «Новый уровень контента» ⚡`;

        await sendMessage(chatId, intro, {
          inline_keyboard: [[{ text: '⚡ Оформить доступ', web_app: { url: checkoutUrl } }]],
        });

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: src ? `uroven_${src}` : startParam,
          metadata: { product: 'uroven', tier: safeTier, src, startParam },
        });

        return NextResponse.json({ ok: true });
      }

      // Статья «Инстаграм это казино» (лонгрид про алгоритм) как Mini App.
      // Вход из Instagram через trampoline: thesashatoyz.com/tg/testtoyzbot?start=kazino
      // Метки источника: kazino_stories / kazino_bio / kazino_reels → в utm_source (bot_start).
      // Человек попадает в базу бота, статья открывается внутри мини-аппа (пруфы через tg.openLink).
      if (startParam === 'kazino' || startParam.startsWith('kazino_')) {
        // текст-болванка, Саша может переписать голосом
        const kazinoText = `${firstName}, держи 👇

разбор на реальных аккаунтах: почему «секрет алгоритма» — это миф, и как обыграть это казино`;

        const kazinoMarkup = {
          inline_keyboard: [
            [{ text: '📖 Читать разбор', web_app: { url: 'https://thesashatoyz.com/algoritm-sistema.html' } }],
          ],
        };

        // Сначала мягкий пул в канал (текст Саши, дословно)…
        const channelText = `подписку проверять не буду, но если реально хочешь:

• обыгрывать это казино
• зарабатывать капусту из блога
• шуметь своим проектом на всю катушку

каждый день я делюсь инсайтами и тем, о чем вам не расскажет ни один маркетолог

буду ждать тебя тут 👇`;

        await sendMessage(chatId, channelText, {
          inline_keyboard: [
            [{ text: '📣 мой канал в telegram', url: 'https://t.me/sashatoyz' }],
          ],
        });

        // …потом, с паузой ~7с, сама статья.
        await new Promise((r) => setTimeout(r, 7000));
        await sendMessage(chatId, kazinoText, kazinoMarkup);

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: startParam,
        });

        return NextResponse.json({ ok: true });
      }

      // МК «Разрешение быстрых денег» — открываем лендинг в мини-аппе,
      // оплата идёт прямо из него (см. public/mk/index.html), вебхук ловит оплату.
      if (startParam === 'mk_dengi') {
        const mkText = `${firstName}, открываю мастер-класс ⚡`;

        const mkMarkup = {
          inline_keyboard: [
            [{ text: '⚡ Открыть мастер-класс', web_app: { url: `${WEBAPP_URL}/mk/index.html` } }],
          ],
        };

        await sendMessage(chatId, mkText, mkMarkup);

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: 'mk_dengi',
        });

        return NextResponse.json({ ok: true });
      }

      // МК Синхронизация deep link
      if (startParam === 'sync_mk') {
        const mkSyncUrl = 'https://thesashatoyz.com/sync/mk';
        const syncText = `Привет, ${firstName}!

<b>МК «Синхронизация» — 27 апреля, 17:00 МСК</b>

За 2 часа уберём шум, найдём ваше «хочу» — фундамент, на котором собирается проект всей жизни.

2 450 ₽ (первые 10 мест) → потом 3 450 ₽
Запись + методичка навсегда.`;

        const syncMarkup = {
          inline_keyboard: [
            [{ text: 'Открыть лендинг', web_app: { url: mkSyncUrl } }],
          ],
        };

        await sendMessage(chatId, syncText, syncMarkup);
        return NextResponse.json({ ok: true });
      }

      // Special handling for masterclass deep link
      if (startParam === 'masterclass' || startParam === 'buy_mc') {
        console.log('Masterclass flow triggered!');
        const masterclassUrl = `${WEBAPP_URL}/masterclass?utm_source=telegram_bot`;
        const masterclassText = `<b>Приглашение на Мастер-класс — "Продающий Контент"</b>

Как трансформировать контент в продажи через соц. сети
2 часа | 3 450 ₽

<b>Что будет на мастер-классе:</b>
Это не лекция про теорию.
Это разбор конкретных постов и трансформация в режиме реального времени.

<b>1. Схема сборки Продающего Контента</b>
Пошаговый алгоритм, который превращает "обучающие" посты в "продающие"

<b>2. 3 промпта для нейросетей</b> — вставляете в нейронку, получаете готовый продающий контент за минуты

<b>3. Готовая воронка с 4 рилсов</b> — не теория, а реальная система, которую вы сможете скопировать

<b>4. Методика создания лид-магнитов</b>, за которыми люди приходят сами толпами.

<b>5. «Фирменный рецепт»</b> — секретный ингредиент, который выделит вас среди тысяч других экспертов.

<b>Та же схема дала такие результаты:</b>

• <b>Маша</b> — коммерческий сценарист
4 рилса → 2 000 000 ₽ за месяц
350+ продаж мастер-класса

• <b>Вася</b> — фитнес-тренер
С 100 000 до 500 000 ₽/месяц
При 500 подписчиках

• <b>Женя</b>
С $2 000 до $8 000/месяц

<b>Результат:</b>
Цель: окупить мастер-класс минимум в 3 раза за 14 дней.
Вы создадите контент, который приводит клиентов — без танцев в сторис и бесплатных созвонов.

<b>Гарантия:</b>
Если после мастер-класса поймёте, что система не подходит — верну деньги. Без вопросов.

<b>Бонус сразу после оплаты:</b>
Шаблон «Богатая ЦА» — за 20 минут получите всю информацию по вашей целевой аудитории.

<b>Стоимость: 3 450 ₽</b>
Живой эфир + запись навсегда.`;

        const masterclassMarkup = {
          inline_keyboard: [
            [
              {
                text: '📖 Ознакомиться подробнее',
                web_app: { url: masterclassUrl },
              },
            ],
          ],
        };

        await sendMessage(chatId, masterclassText, masterclassMarkup);

        // Track bot_start with masterclass source
        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: 'telegram_bot_masterclass',
        });

        return NextResponse.json({ ok: true });
      }

      // Default flow — квиз «блоки на деньги» (старый квиз «Диагностика контента» убран)
      const defaultUtm = startParam || 'bot_start';
      const webappUrl = `https://quiz.thesashatoyz.com/quiz-money?utm_source=${encodeURIComponent(defaultUtm)}`;

      // текст-болванка, Саша может переписать голосом
      const welcomeText = `${firstName}, погнали ⚡

короткий тест — покажу, какой именно блок мешает тебе получать деньги. жми 👇`;

      const replyMarkup = {
        inline_keyboard: [
          [
            {
              text: '🧭 Пройти тест',
              web_app: { url: webappUrl },
            },
          ],
        ],
      };

      await sendMessage(chatId, welcomeText, replyMarkup);

      // Track bot_start event (user clicked the link and opened the bot)
      await trackEvent({
        event_type: 'bot_start',
        user_id: chatId,
        username: username || undefined,
        first_name: fullName || undefined,
        utm_source: startParam || undefined,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
