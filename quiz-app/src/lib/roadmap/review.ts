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

/**
 * Телеграм не берёт сообщение длиннее 4096 символов, а карта в них не влезает.
 * Режем по границам элементов, а не по символам: обрубленная на полуслове
 * задача читается хуже, чем лишнее сообщение.
 */
function chunk(header: string, items: string[], limit = 3800): string[] {
  const out: string[] = [];
  let current = header;

  for (const item of items) {
    const next = current ? `${current}\n${item}` : item;
    if (next.length > limit && current) {
      out.push(current);
      current = item;
    } else {
      current = next;
    }
  }
  if (current) out.push(current);

  return out;
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

  const first = chunk(`🗺 <b>Черновик карты</b> · ${esc(who)}`, [
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
  ]);

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
  const second = chunk(`📋 <b>Задачи</b> · ${esc(who)}\n`, weeks);

  // Личная строка для человека идёт отдельно от внутренних заметок: её Саша
  // читает как текст сообщения, а не как заметку про клиента.
  const handoff = roadmap.notes.find((n) => n.kind === 'handoff');
  const inner = roadmap.notes.filter((n) => n.kind !== 'handoff');

  const third = chunk(
    `✉️ <b>Что уйдёт человеку вместе со ссылкой</b>\n\n<i>${esc(handoff?.body || 'нет')}</i>\n\n🔒 <b>Внутренние заметки</b> (человек их не видит)\n`,
    inner.map((note) => `\n${KIND_MARK[note.kind] || '•'} ${esc(note.body)}\n<i>${esc(note.source || '')}</i>`),
  );

  return [...first, ...second, ...third];
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
