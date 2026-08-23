// Предпросмотр карты в боте и её отправка человеку после одобрения.
//
// Черновик лежит в базе закрытым, а Саша читает его прямо в личке с ботом:
// диагноз и ступени, задачи по неделям, внутренние заметки. Одобрение это
// одна кнопка: карта открывается в кабинете и человеку уходит сообщение.

import { prisma } from '@/lib/prisma';
import { getAdminChatId } from '@/lib/notion';
import { sendBotMessage } from '@/lib/telegram';
import { roadmapReadyMessage, ROADMAP_BUTTON } from '@/content/roadmap-message';
import { openForClient } from './store';

const CABINET = (process.env.NEXT_PUBLIC_CABINET_URL || 'https://world.thesashatoyz.com').replace(/\/$/, '');

/** Телеграм режет сообщение на 4096 байтах, режем сами и честно говорим об этом. */
function clip(text: string, limit = 3900): string {
  return text.length <= limit ? text : `${text.slice(0, limit)}\n\n[…обрезано, целиком в админке]`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const STATUS_MARK: Record<string, string> = {
  done: '✅',
  partial: '🟡',
  blocked: '🔴',
  todo: '⬜',
};

const KIND_MARK: Record<string, string> = {
  insight: '💡',
  risk: '⚠️',
  blocker: '⛔',
  decision: '🎯',
};

/** Три сообщения предпросмотра: диагноз и ступени, задачи по неделям, заметки. */
export async function previewMessages(roadmapId: string): Promise<string[]> {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    include: {
      steps: { orderBy: { position: 'asc' } },
      metrics: { orderBy: { position: 'asc' } },
      tasks: { orderBy: [{ dueOn: 'asc' }, { position: 'asc' }] },
      notes: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!roadmap) throw new Error(`карта ${roadmapId} не найдена`);

  const who = roadmap.username ? `@${roadmap.username}` : roadmap.clientName;

  const first = [
    `🗺 <b>Черновик карты</b> · ${esc(who)}`,
    '',
    `<b>Куда идём:</b> ${esc(roadmap.goal || '')}`,
    '',
    `<b>Цель месяца:</b> ${esc(roadmap.periodGoal || '')}`,
    '',
    '<b>Ступени</b>',
    ...roadmap.steps.map((s) => `${STATUS_MARK[s.status] || '⬜'} ${s.position}. ${esc(s.title)}\n<i>${esc(s.evidence || '')}</i>`),
    '',
    '<b>Цифры на старте</b>',
    ...roadmap.metrics.map((m) => `• ${esc(m.label)}: ${esc(m.startValue || '')}`),
  ].join('\n');

  // Задачи группируются по дате: она же граница недели.
  const byWeek = new Map<string, typeof roadmap.tasks>();
  for (const t of roadmap.tasks) {
    const key = t.dueOn ? t.dueOn.toISOString().slice(0, 10) : 'без срока';
    byWeek.set(key, [...(byWeek.get(key) || []), t]);
  }

  const weeks: string[] = [];
  let n = 0;
  for (const [due, tasks] of byWeek) {
    n += 1;
    weeks.push(`<b>Неделя ${n}</b> (до ${due})`);
    for (const t of tasks) {
      const owner = t.owner === 'sasha' ? ' 👤<i>Саша</i>' : '';
      const link = t.linkLabel ? `\n   🔗 ${esc(t.linkLabel)}` : '\n   🔗 <i>без материала</i>';
      weeks.push(`• ${esc(t.title)}${owner}${link}\n   <i>${esc(t.why || '')}</i>`);
    }
    weeks.push('');
  }
  const second = `📋 <b>Задачи</b> · ${esc(who)}\n\n${weeks.join('\n')}`;

  const third = [
    `🔒 <b>Внутренние заметки</b> · ${esc(who)}`,
    '<i>человек их не видит</i>',
    '',
    ...roadmap.notes.map((note) => `${KIND_MARK[note.kind] || '•'} ${esc(note.body)}\n<i>${esc(note.source || '')}</i>`),
  ].join('\n\n');

  return [clip(first), clip(second), clip(third)];
}

/** Кнопки под последним сообщением предпросмотра. */
function reviewKeyboard(roadmapId: string, slug: string) {
  return {
    inline_keyboard: [
      [{ text: '✅ Одобрить и отправить', callback_data: `karta_ok:${roadmapId}` }],
      [{ text: '🔄 Пересобрать', callback_data: `karta_redo:${roadmapId}` }],
      [{ text: '✏️ Править в админке', url: `${CABINET}/admin/roadmaps/${slug}` }],
    ],
  };
}

/**
 * Отправляет Сашe черновик на проверку. Возвращает false, если бот не смог
 * достучаться: тогда карта всё равно лежит в админке.
 */
export async function sendPreview(roadmapId: string, warnings: string[] = []): Promise<boolean> {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    select: { slug: true, telegramId: true, tasks: { select: { id: true } }, steps: { select: { id: true } } },
  });
  if (!roadmap) return false;

  const adminChatId = await getAdminChatId();
  if (!adminChatId) return false;
  const admin = Number(adminChatId);

  const parts = await previewMessages(roadmapId);
  for (const part of parts) {
    const sent = await sendBotMessage(admin, part, undefined, 'HTML');
    if (!sent.ok) return false;
  }

  const tail = [
    `ступеней ${roadmap.steps.length}, задач ${roadmap.tasks.length}`,
    warnings.length ? `\n⚠️ на что посмотреть:\n${warnings.map((w) => `• ${esc(w)}`).join('\n')}` : '',
    roadmap.telegramId ? '' : '\n⚠️ telegram id неизвестен, отправить человеку карту бот не сможет',
  ]
    .filter(Boolean)
    .join('\n');

  const sent = await sendBotMessage(admin, tail, reviewKeyboard(roadmapId, roadmap.slug), 'HTML');
  return sent.ok;
}

/**
 * Одобрение: карта открывается в кабинете, человеку уходит сообщение с кнопкой.
 * Повторное нажатие безопасно, но сообщение уйдёт второй раз, поэтому кнопка
 * снимается сразу после первого (см. вебхук).
 */
export async function approveAndSend(roadmapId: string): Promise<string> {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    include: { tasks: { orderBy: { dueOn: 'asc' } }, steps: true },
  });
  if (!roadmap) return 'карта не найдена';
  if (!roadmap.telegramId) return 'у карты нет telegram id, человеку её не отправить';

  const shared = await openForClient(roadmapId);

  // Первая неделя это ближайший срок среди задач клиента.
  const clientTasks = roadmap.tasks.filter((t) => t.owner === 'client');
  const firstDue = clientTasks[0]?.dueOn?.toISOString().slice(0, 10);
  const thisWeek = clientTasks.filter((t) => t.dueOn?.toISOString().slice(0, 10) === firstDue).length;

  const takeaway = await prisma.roadmapNote.findFirst({
    where: { roadmapId, kind: 'handoff' },
    select: { body: true },
  });

  const text = roadmapReadyMessage({
    steps: roadmap.steps.length,
    tasksThisWeek: thisWeek,
    mainTakeaway: takeaway?.body || '',
  });

  const sent = await sendBotMessage(Number(roadmap.telegramId), text, {
    inline_keyboard: [[{ text: ROADMAP_BUTTON, web_app: { url: `${CABINET}/karta` } }]],
  }, 'HTML');

  if (!sent.ok) {
    return `карта открыта (${shared} строк), но сообщение не ушло: человек не начинал диалог с ботом или заблокировал его`;
  }

  return `карта открыта и отправлена, строк видно ${shared}`;
}
