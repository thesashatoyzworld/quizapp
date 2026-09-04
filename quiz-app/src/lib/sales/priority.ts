import type { WaitingRow } from './dialogs';
import type { ReadyStep } from './dialogs';

// Кого Саша разбирает сам, а кому ответ уходит пачкой.
//
// Проверять по одному пятнадцать диалогов в день он не может, а держать
// очередь без ответа дороже: люди отваливаются молча. Поэтому массовая
// отправка есть, но не для всех.
//
// Граница проходит по цене ошибки. Уточняющий вопрос («какой у тебя чек?»)
// в худшем случае неловкий. Названная цена, оффер на 130 000 или разговор
// с человеком, который тянет на «Делаем за вас», — это деньги, и туда
// автоматика не лезет.

export type Priority = {
  /** true — только руками. */
  manual: boolean;
  /** Почему именно этот попал к Саше. Пусто, если уходит сам. */
  reason: string | null;
};

/** Дорогие ступени: их называет Саша, а не пачка. */
const PRICEY = [/130\s?000/, /130к/i, /300\s?000/, /300к/i, /400-500/, /делаем за вас/i];

/** Любая сумма в тексте: цена — самая дорогая точка разговора. */
const MONEY = /\b(5\s?450|10\s?000|25\s?000|50\s?000|130\s?000|300\s?000|227)\b/;

/** Человек сам заговорил про деньги — отвечать на это должен Саша. */
const ASKED_MONEY = /(скольк|цен[аеуы]|стоим|стоит|бюджет|оплат|рассроч|дорого)/i;

export function priority(row: WaitingRow, step: ReadyStep | null): Priority {
  // Бот сам поднял руку — значит в базе нет ответа или человек крупный.
  if (step?.callSasha) return { manual: true, reason: step.callSasha };

  const income = (row.income || '').trim();
  if (income.startsWith('500')) {
    return { manual: true, reason: 'доход 500к+, это «Делаем за вас»' };
  }
  if (income.startsWith('150')) {
    return { manual: true, reason: 'доход 150-500к, тянет на дорогой формат' };
  }

  if (step?.sell && PRICEY.some((r) => r.test(step.sell))) {
    return { manual: true, reason: `ведём на дорогое: ${step.sell.slice(0, 60)}` };
  }

  if (step?.message && MONEY.test(step.message)) {
    return { manual: true, reason: 'в ответе называется цена' };
  }

  if (ASKED_MONEY.test(row.lastText)) {
    return { manual: true, reason: 'человек сам спросил про деньги' };
  }

  return { manual: false, reason: null };
}
