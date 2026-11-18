// ─────────────────────────────────────────────────────────────
// Оплата криптой через Crypto Pay (@CryptoBot) с автовыдачей и продлением.
//
// Что продаём — та же прайс-ссылка (deals): тариф, цена в рублях и срок берутся
// из строки прайса, счёт выставляется в рублях, человек платит USDT/TON/BTC
// по курсу CryptoBot.
//
// Путь: t.me/testtoyzbot?start=cp_<dealId> → бот выставляет счёт с payload
// cp:<dealId>:<tgId> → после оплаты доступ открывает вебхук Crypto Pay,
// кнопка «Открыть кабинет» в CryptoBot (start=cpok) или ежедневный крон —
// что сработает первым. Повтор отсекается по order_id в purchases.
//
// Автосписаний у крипты нет: за 3 дня до конца срока крон сам присылает
// человеку новый счёт на тот же срок. Не оплатил — доступ кончается сам.
//
// order_id и source доступа: cp_<dealId>_<invoiceId>. По префиксу cp_ крон
// понимает, что доступ крипто-подписочный, а по dealId — что продлевать.
// ─────────────────────────────────────────────────────────────

import { startForDeal } from './start360';
import crypto from 'crypto';
import { prisma } from './prisma';
import { grantAccess } from './access';
import { getDeal, dealProduct, alreadyProcessed, countPayment, formatPrice, formatDays } from './deals';
import { sendWelcomeT2, sendWelcomeT3 } from './onboarding';
import { notifyAdmin, sendBotMessage } from './telegram';
import { T2_PRODUCT_SLUG } from '@/content/intake-tarif2';
import { INTAKE_PRODUCT_SLUG } from '@/content/intake-tarif3';

const API = 'https://pay.crypt.bot/api';
const BOT = 'https://t.me/testtoyzbot';
const CABINET = 'https://world.thesashatoyz.com/dostup';

export interface CpInvoice {
  invoice_id: number;
  status: 'active' | 'paid' | 'expired';
  amount: string;
  fiat?: string;
  paid_asset?: string;
  paid_amount?: string;
  payload?: string;
  bot_invoice_url: string;
  mini_app_invoice_url?: string;
  paid_at?: string;
}

function token(): string {
  const t = process.env.CRYPTO_PAY_TOKEN;
  if (!t) throw new Error('CRYPTO_PAY_TOKEN not set');
  return t;
}

async function call<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Crypto-Pay-API-Token': token(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`Crypto Pay ${method}: ${JSON.stringify(json.error)}`);
  return json.result as T;
}

/** Вебхук Crypto Pay подписан HMAC-SHA256 от тела, ключ = SHA256(токена). */
export function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const secret = crypto.createHash('sha256').update(token()).digest();
  const check = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return check.length === signature.length && crypto.timingSafeEqual(Buffer.from(check), Buffer.from(signature));
}

export function parsePayload(payload?: string): { dealId: string; telegramId: number } | null {
  const m = /^cp:([a-z0-9]{1,32}):(\d{3,15})$/i.exec(payload || '');
  return m ? { dealId: m[1], telegramId: parseInt(m[2], 10) } : null;
}

/** Счёт на позицию прайса для конкретного человека. */
export async function createInvoice(dealId: string, telegramId: number, renewal = false): Promise<CpInvoice | null> {
  const deal = await getDeal(dealId);
  if (!deal || deal.status !== 'active') return null;
  return call<CpInvoice>('createInvoice', {
    currency_type: 'fiat',
    fiat: 'RUB',
    amount: String(deal.price),
    accepted_assets: 'USDT,TON,BTC',
    description: `${deal.title}${renewal ? ' (продление)' : ''}, доступ на ${formatDays(deal.days)}`,
    payload: `cp:${deal.id}:${telegramId}`,
    paid_btn_name: 'callback',
    paid_btn_url: `${BOT}?start=cpok`,
    allow_comments: false,
    allow_anonymous: false,
    expires_in: renewal ? 7 * 24 * 3600 : 24 * 3600,
  });
}

/** Оплаченные счета, самые свежие первыми (до 1000 штук). */
export async function paidInvoices(count = 200): Promise<CpInvoice[]> {
  const r = await call<{ items: CpInvoice[] }>('getInvoices', { status: 'paid', count });
  return r.items || [];
}

/**
 * Открыть доступ по оплаченному счёту. Повторный вызов по тому же счёту ничего
 * не делает, поэтому вебхук, кнопка и крон могут сработать все три.
 * Возвращает 'granted' | 'seen' | 'skip'.
 */
export async function fulfillInvoice(inv: CpInvoice, via: string): Promise<'granted' | 'seen' | 'skip'> {
  if (inv.status !== 'paid') return 'skip';
  const p = parsePayload(inv.payload);
  if (!p) return 'skip';
  const deal = await getDeal(p.dealId);
  const product = deal ? dealProduct(deal.tier) : null;
  if (!deal || !product) {
    await notifyAdmin(`⚠️ Крипта: оплачен счёт ${inv.invoice_id}, но позиция прайса ${p.dealId} не найдена. Доступ НЕ выдан, tg ${p.telegramId}.`, { parseMode: null });
    return 'skip';
  }

  const orderId = `cp_${deal.id}_${inv.invoice_id}`;
  if (await alreadyProcessed(orderId)) return 'seen';

  const tg = p.telegramId;
  const amount = Math.round(parseFloat(inv.amount)) || deal.price;

  // Был ли у человека этот продукт до оплаты: тогда это продление, без приветствия.
  const before = await prisma.productAccess.findFirst({
    where: { telegramId: BigInt(tg), productSlug: product.slug },
    orderBy: { createdAt: 'desc' },
  });
  const renewal = Boolean(before?.expiresAt && before.expiresAt > new Date());

  const user = await prisma.user.upsert({ where: { telegramId: BigInt(tg) }, create: { telegramId: BigInt(tg) }, update: {} });
  const prod = await prisma.product.upsert({
    where: { slug: product.slug },
    create: { slug: product.slug, name: product.name, price: product.price, type: product.type },
    update: {},
  });
  await prisma.purchase.create({
    data: { userId: user.id, productId: prod.id, amount, source: 'cryptopay', prodamusOrderId: orderId },
  });
  await grantAccess({ product, telegramId: tg, source: orderId, days: deal.days, notBefore: startForDeal(deal.id) });
  await countPayment(deal.id);

  const after = await prisma.productAccess.findFirst({
    where: { telegramId: BigInt(tg), productSlug: product.slug },
    orderBy: { createdAt: 'desc' },
  });
  const until = after?.expiresAt ? after.expiresAt.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' }) : '';

  let welcomed = false;
  if (!renewal) {
    welcomed = product.slug === T2_PRODUCT_SLUG
      ? await sendWelcomeT2(tg, false, deal.startsIntake ? 't3' : 't2')
      : product.slug === INTAKE_PRODUCT_SLUG ? await sendWelcomeT3(tg) : false;
  }
  if (!welcomed) {
    await sendBotMessage(
      tg,
      renewal
        ? `готово ⚡\n\nоплата криптой принята, доступ продлён до <b>${until}</b>.`
        : `готово ⚡\n\nоплата криптой принята: <b>${deal.title}</b>, доступ до <b>${until}</b>.\n\nвсё в кабинете, жми кнопку ниже.`,
      { inline_keyboard: [[{ text: '🚪 Открыть кабинет', web_app: { url: CABINET } }]] },
      'HTML',
      'payment-receipt',
    );
  }

  await notifyAdmin(
    `💳 Крипта ${renewal ? '(продление) ' : ''}«${deal.title}»\n${formatPrice(amount)} · ${inv.paid_amount || ''} ${inv.paid_asset || ''}\nTG ${tg} · до ${until}\nOrder: ${orderId} · ${via}`,
    { alsoWork: true, parseMode: null },
  );
  return 'granted';
}

/** Пройтись по свежим оплаченным счетам и выдать то, что ещё не выдано. */
export async function sweepPaid(onlyTelegramId?: number): Promise<number> {
  let n = 0;
  for (const inv of await paidInvoices()) {
    const p = parsePayload(inv.payload);
    if (!p || (onlyTelegramId && p.telegramId !== onlyTelegramId)) continue;
    if ((await fulfillInvoice(inv, onlyTelegramId ? 'button' : 'sweep')) === 'granted') n++;
  }
  return n;
}

/**
 * Продление: крипто-доступы, которые кончаются в ближайшие 3 дня, получают
 * новый счёт в личку. Один счёт на один срок: отметка в events по дате конца.
 */
export async function sendRenewals(): Promise<number> {
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 24 * 3600 * 1000);
  const rows = await prisma.productAccess.findMany({
    where: { source: { startsWith: 'cp_' }, status: 'active', expiresAt: { gt: now, lte: soon }, telegramId: { not: null } },
  });
  let sent = 0;
  for (const a of rows) {
    const m = /^cp_([a-z0-9]{1,32})_\d+$/i.exec(a.source || '');
    if (!m || !a.telegramId || !a.expiresAt) continue;
    const key = `${a.id}:${a.expiresAt.toISOString()}`;
    const done = await prisma.event.findFirst({ where: { type: 'cryptopay_renewal_sent', metadata: { path: ['key'], equals: key } } });
    if (done) continue;

    const tg = Number(a.telegramId);
    const deal = await getDeal(m[1]);
    const inv = await createInvoice(m[1], tg, true).catch(() => null);
    if (!deal || !inv) continue;

    const until = a.expiresAt.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' });
    await sendBotMessage(
      tg,
      `доступ в кабинет до <b>${until}</b>.\n\nчтобы продлить ещё на ${formatDays(deal.days)}, оплати счёт криптой: ${formatPrice(deal.price)} в USDT, TON или BTC.`,
      { inline_keyboard: [[{ text: `Продлить за ${formatPrice(deal.price)}`, url: inv.bot_invoice_url }]] },
      'HTML',
      'cryptopay-renewal',
    );
    await prisma.event.create({
      data: { type: 'cryptopay_renewal_sent', source: 'thesasha', telegramId: a.telegramId, productSlug: a.productSlug, metadata: { key, deal: deal.id, invoice: inv.invoice_id } },
    });
    sent++;
  }
  return sent;
}
