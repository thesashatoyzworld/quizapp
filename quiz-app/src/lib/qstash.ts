import { Client } from '@upstash/qstash';

const qstash = new Client({ token: process.env.QSTASH_TOKEN || '' });

const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || '';

/**
 * Одно напоминание по анкете через сутки. Второго нет: долбить человека,
 * заплатившего 150к, не надо.
 */
export async function scheduleIntakeReminder(intakeId: string, delaySec = 24 * 60 * 60) {
  if (!WEBAPP_URL) {
    console.error('[QStash] WEBAPP_URL not set, cannot schedule intake reminder');
    return;
  }

  try {
    await qstash.publishJSON({
      url: `${WEBAPP_URL}/api/intake-reminder`,
      body: { intakeId },
      delay: delaySec,
    });
  } catch (error) {
    console.error(`[QStash] Failed to schedule intake reminder for ${intakeId}:`, error);
  }
}

/**
 * Сборка маршрутной карты после закрытой анкеты тарифа 2.
 *
 * Отдельной задачей, а не прямо в вебхуке: обращение к модели занимает
 * пару минут, а вебхук Telegram столько ждать не может. Небольшая задержка
 * на случай, если человек дошлёт что-то следом за последним ответом.
 */
export async function scheduleRoadmapBuild(intakeId: string, delaySec = 120) {
  if (!WEBAPP_URL) {
    console.error('[QStash] WEBAPP_URL not set, cannot schedule roadmap build');
    return;
  }

  try {
    await qstash.publishJSON({
      url: `${WEBAPP_URL}/api/roadmap-generate`,
      body: { intakeId },
      delay: delaySec,
      retries: 1,
    });
  } catch (error) {
    console.error(`[QStash] Failed to schedule roadmap build for ${intakeId}:`, error);
  }
}

export async function scheduleFollowUp(
  userId: number,
  resultId: string,
  messageIndex: number,
  delaySec: number,
) {
  if (!WEBAPP_URL) {
    console.error('[QStash] WEBAPP_URL not set, cannot schedule follow-up');
    return;
  }

  try {
    await qstash.publishJSON({
      url: `${WEBAPP_URL}/api/send-followup`,
      body: { userId, resultId, messageIndex },
      delay: delaySec,
    });
    console.log(`[QStash] Scheduled follow-up #${messageIndex} for user ${userId} in ${delaySec}s`);
  } catch (error) {
    console.error(`[QStash] Failed to schedule follow-up for user ${userId}:`, error);
  }
}

/**
 * Склейка пачки сообщений в идею. Задача ставится на каждое сообщение:
 * пришло ещё одно: сработавшая задача увидит, что тишины не было, и
 * перепланирует себя.
 */
export async function scheduleIdeaAssemble(batchKey: string, delaySec: number) {
  if (!WEBAPP_URL) {
    console.error('[QStash] WEBAPP_URL not set, cannot schedule idea assemble');
    return;
  }

  try {
    await qstash.publishJSON({
      url: `${WEBAPP_URL}/api/ideas/assemble`,
      body: { batchKey },
      delay: delaySec,
    });
  } catch (error) {
    console.error(`[QStash] Failed to schedule idea assemble for ${batchKey}:`, error);
  }
}

/**
 * Напоминание купившему с сайта, если за час он не привязал оплату к Telegram.
 * Одно: дальше пишет Саша руками.
 */
export async function schedulePaidReminder(orderId: string, delaySec = 60 * 60) {
  if (!WEBAPP_URL) {
    console.error('[QStash] WEBAPP_URL not set, cannot schedule paid reminder');
    return;
  }

  try {
    await qstash.publishJSON({
      url: `${WEBAPP_URL}/api/paid-reminder`,
      body: { orderId },
      delay: delaySec,
    });
  } catch (error) {
    console.error(`[QStash] Failed to schedule paid reminder for ${orderId}:`, error);
  }
}

/**
 * Черновик ответа на вопрос в «Коннекторах». Ставится на каждое сообщение
 * ученика с задержкой: задача сама проверит, замолчал ли человек, и
 * перепланирует себя, если нет. Дубли гасит уникальный ключ черновика.
 */
export async function scheduleGroupDraft(key: string, delaySec = 150) {
  if (!WEBAPP_URL) {
    console.error('[QStash] WEBAPP_URL not set, cannot schedule group draft');
    return;
  }

  try {
    await qstash.publishJSON({
      url: `${WEBAPP_URL}/api/group-draft`,
      body: { key },
      delay: delaySec,
      retries: 1,
    });
  } catch (error) {
    console.error(`[QStash] Failed to schedule group draft for ${key}:`, error);
  }
}

/**
 * Лёха собирает первое сообщение по анкете. Задача одна на анкету; ночью
 * назначается на утро, поэтому задержка бывает и в двенадцать часов.
 */
export async function scheduleLehaDraft(draftId: string, delaySec: number) {
  if (!WEBAPP_URL) {
    console.error('[QStash] WEBAPP_URL not set, cannot schedule leha draft');
    return;
  }

  try {
    await qstash.publishJSON({
      url: `${WEBAPP_URL}/api/leha`,
      body: { draftId },
      delay: Math.max(0, Math.round(delaySec)),
      retries: 1,
    });
  } catch (error) {
    console.error(`[QStash] Failed to schedule leha draft ${draftId}:`, error);
  }
}

/**
 * Лёха отвечает в диалоге. Ставится на каждую реплику человека: сработавшая
 * задача сама увидит, что человек дописал, и перепланирует себя.
 */
/** remind: напоминание «получилось посмотреть?» вместо ответа. */
export async function scheduleLehaDialog(chatId: string, delaySec: number, remind = false) {
  if (!WEBAPP_URL) {
    console.error('[QStash] WEBAPP_URL not set, cannot schedule leha dialog');
    return;
  }

  try {
    await qstash.publishJSON({
      url: `${WEBAPP_URL}/api/leha`,
      body: remind ? { dialogChatId: chatId, remind: true } : { dialogChatId: chatId },
      delay: Math.max(0, Math.round(delaySec)),
      retries: 1,
    });
  } catch (error) {
    console.error(`[QStash] Failed to schedule leha dialog ${chatId}:`, error);
  }
}
