// «Личный бренд на 360»: оплата картой разовая (прайс-ссылка), автосписания нет.
// Поэтому продление — напоминанием в бота: за 3 дня до конца доступа и в сам
// день окончания, с кнопками оплаты на месяц и на год. Оплата по кнопке
// продлевает от текущей даты окончания (grantAccess), дни не сгорают.
// Одно напоминание на срок и этап: отметка в events по ключу.

import { prisma } from './prisma';
import { formatPrice } from './deals';
import { sendBotMessage } from './telegram';

const MONTH = 'mwbmt1kb7nhq';
const YEAR = 'mwblsry39hvk';
const DEALS = [MONTH, YEAR];
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://quizapp-ivory-delta.vercel.app';
const MSK = 3 * 3600_000;
const DAY = 86400_000;

const mskDay = (d: Date) => Math.floor((d.getTime() + MSK) / DAY);
const payUrl = (deal: string, tg: bigint) => `${WEBAPP_URL}/pay/deal/${deal}?u=${tg}`;

export async function sendRenewals360(now = new Date(), dry = false) {
  const soon = new Date(now.getTime() + 4 * DAY);
  const rows = await prisma.productAccess.findMany({
    where: {
      status: 'active',
      telegramId: { not: null },
      expiresAt: { gt: new Date(now.getTime() - DAY), lte: soon },
      OR: DEALS.map((d) => ({ source: { startsWith: `deal_${d}_` } })),
    },
  });

  const out: { tg: string; stage: string; until: string }[] = [];
  for (const a of rows) {
    if (!a.telegramId || !a.expiresAt) continue;
    const left = mskDay(a.expiresAt) - mskDay(now);
    const stage = left === 3 ? 'before' : left === 0 ? 'day' : null;
    if (!stage) continue;

    const key = `${a.id}:${a.expiresAt.toISOString()}:${stage}`;
    const done = await prisma.event.findFirst({ where: { type: 'renew360_sent', metadata: { path: ['key'], equals: key } } });
    if (done) continue;

    const until = a.expiresAt.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' });
    out.push({ tg: String(a.telegramId), stage, until });
    if (dry) continue;

    const text = stage === 'before'
      ? `напоминаю про продление ⚡\n\nдоступ в «Личный бренд на 360» до <b>${until}</b>.\n\nпродлить можно уже сейчас: срок продлится от ${until}, дни не сгорят. твоя цена сохраняется, пока ты внутри.`
      : `сегодня последний день доступа ⚡\n\nчтобы не выпасть из маршрута, продли по кнопке ниже. твоя цена сохраняется.`;
    const r = await sendBotMessage(
      Number(a.telegramId),
      text,
      { inline_keyboard: [
        [{ text: `Продлить на месяц · ${formatPrice(10000)}`, url: payUrl(MONTH, a.telegramId) }],
        [{ text: `На год · ${formatPrice(100000)}`, url: payUrl(YEAR, a.telegramId) }],
      ] },
      'HTML',
      'renew360',
    );
    await prisma.event.create({
      data: { type: 'renew360_sent', source: 'thesasha', telegramId: a.telegramId, productSlug: a.productSlug, metadata: { key, stage, ok: r.ok, blocked: !!r.blocked } },
    });
  }
  return { renew360: out };
}
