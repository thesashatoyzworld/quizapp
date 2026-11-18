// ─────────────────────────────────────────────────────────────
// Оплата из-за рубежа через PayPal: подписка с автосписанием и автовыдачей.
//
// Путь: t.me/testtoyzbot?start=pp_<plan> → бот создаёт подписку PayPal
// с custom_id pp:<plan>:<tgId> и даёт кнопку на страницу подтверждения →
// человек подтверждает → PayPal списывает первый платёж и потом сам каждый
// период. Каждое списание (PAYMENT.SALE.COMPLETED) продлевает доступ.
//
// Доступ открывает что сработает первым: вебхук, кнопка возврата из PayPal
// (start=ppok) или ежедневный крон. Повтор отсекается по order_id
// pp_<plan>_<transactionId> в purchases.
//
// Срок за платёж 31 / 366 дней: PayPal списывает по календарю, и запас в
// день не даёт крону истечения закрыть доступ в утро списания.
//
// Env: PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_MODE (live|sandbox),
// PAYPAL_PLAN_MONTH, PAYPAL_PLAN_YEAR, PAYPAL_WEBHOOK_ID.
// ─────────────────────────────────────────────────────────────

import { startForDeal } from './start360';
import { prisma } from './prisma';
import { grantAccess } from './access';
import { getDeal, dealProduct, alreadyProcessed, countPayment, formatPrice } from './deals';
import { sendWelcomeT2, sendWelcomeT3 } from './onboarding';
import { notifyAdmin, sendBotMessage } from './telegram';
import { T2_PRODUCT_SLUG } from '@/content/intake-tarif2';
import { INTAKE_PRODUCT_SLUG } from '@/content/intake-tarif3';

const BOT = 'https://t.me/testtoyzbot';
const CABINET = 'https://world.thesashatoyz.com/dostup';

export type PpPlanKey = 'month' | 'year';

/** Тарифы PayPal. dealId: позиция прайса «Личный бренд на 360» (тариф, название, счётчик). */
export const PP_PLANS: Record<PpPlanKey, { env: string; dealId: string; days: number; usd: number; label: string }> = {
  month: { env: 'PAYPAL_PLAN_MONTH', dealId: 'mwbmt1kb7nhq', days: 31, usd: 120, label: 'месяц' },
  year: { env: 'PAYPAL_PLAN_YEAR', dealId: 'mwblsry39hvk', days: 366, usd: 1200, label: 'год' },
};

function api(): string {
  return process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

let cached: { token: string; until: number } | null = null;
async function accessToken(): Promise<string> {
  if (cached && cached.until > Date.now()) return cached.token;
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!id || !secret) throw new Error('PAYPAL_CLIENT_ID / PAYPAL_SECRET not set');
  const res = await fetch(`${api()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  const j = await res.json();
  if (!j.access_token) throw new Error(`PayPal token: ${JSON.stringify(j)}`);
  cached = { token: j.access_token, until: Date.now() + (j.expires_in - 120) * 1000 };
  return cached.token;
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${api()}${path}`, {
    method,
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`PayPal ${method} ${path}: ${res.status} ${text.slice(0, 500)}`);
  return (text ? JSON.parse(text) : {}) as T;
}

export interface PpSubscription {
  id: string;
  status: string;
  plan_id: string;
  custom_id?: string;
  links?: { href: string; rel: string }[];
  subscriber?: { email_address?: string; name?: { given_name?: string; surname?: string } };
}

export function parseCustom(custom?: string): { plan: PpPlanKey; telegramId: number } | null {
  const m = /^pp:(month|year):(\d{3,15})$/.exec(custom || '');
  return m ? { plan: m[1] as PpPlanKey, telegramId: parseInt(m[2], 10) } : null;
}

/** Подписка для конкретного телеграма. Возвращает ссылку на подтверждение в PayPal. */
export async function createSubscription(plan: PpPlanKey, telegramId: number): Promise<{ id: string; approveUrl: string } | null> {
  const planId = process.env[PP_PLANS[plan].env];
  if (!planId) throw new Error(`${PP_PLANS[plan].env} not set`);
  const sub = await call<PpSubscription>('POST', '/v1/billing/subscriptions', {
    plan_id: planId,
    custom_id: `pp:${plan}:${telegramId}`,
    application_context: {
      brand_name: 'SASHA TOYZ',
      locale: 'ru-RU',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'SUBSCRIBE_NOW',
      return_url: `${BOT}?start=ppok`,
      cancel_url: BOT,
    },
  });
  const approveUrl = sub.links?.find((l) => l.rel === 'approve')?.href;
  if (!approveUrl) return null;
  await prisma.event.create({
    data: { type: 'paypal_sub_created', source: 'thesasha', telegramId: BigInt(telegramId), metadata: { sub: sub.id, plan } },
  });
  return { id: sub.id, approveUrl };
}

export async function getSubscription(id: string): Promise<PpSubscription> {
  return call<PpSubscription>('GET', `/v1/billing/subscriptions/${encodeURIComponent(id)}`);
}

interface PpTransaction { id: string; status: string; amount_with_breakdown?: { gross_amount?: { value: string; currency_code: string } } }

async function completedTransactions(subId: string, sinceDays: number): Promise<PpTransaction[]> {
  const end = new Date(Date.now() + 3600 * 1000).toISOString();
  const start = new Date(Date.now() - sinceDays * 24 * 3600 * 1000).toISOString();
  const r = await call<{ transactions?: PpTransaction[] }>(
    'GET',
    `/v1/billing/subscriptions/${encodeURIComponent(subId)}/transactions?start_time=${start}&end_time=${end}`,
  );
  return (r.transactions || []).filter((t) => t.status === 'COMPLETED');
}

/**
 * Провести одно списание по подписке. Идемпотентно по transactionId,
 * поэтому вебхук, кнопка и крон могут сработать все три.
 */
export async function fulfillPayment(sub: PpSubscription, transactionId: string, gross: string | undefined, via: string): Promise<'granted' | 'seen' | 'skip'> {
  const c = parseCustom(sub.custom_id);
  if (!c) return 'skip';
  const cfg = PP_PLANS[c.plan];
  const deal = await getDeal(cfg.dealId);
  const product = deal ? dealProduct(deal.tier) : null;
  if (!deal || !product) {
    await notifyAdmin(`⚠️ PayPal: списание ${transactionId}, но позиция ${cfg.dealId} не найдена. Доступ НЕ выдан, tg ${c.telegramId}.`, { parseMode: null });
    return 'skip';
  }

  const orderId = `pp_${c.plan}_${transactionId}`;
  if (await alreadyProcessed(orderId)) return 'seen';

  const tg = c.telegramId;
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
  // В purchases сумма в рублях по прайсу: выручка считается в рублях.
  await prisma.purchase.create({
    data: { userId: user.id, productId: prod.id, amount: deal.price, source: 'paypal', prodamusOrderId: orderId },
  });
  await grantAccess({ product, telegramId: tg, source: `pp_${c.plan}_${sub.id}`, days: cfg.days, notBefore: startForDeal(deal.id) });
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
        ? `готово ⚡\n\nPayPal списал оплату, доступ продлён до <b>${until}</b>.`
        : `готово ⚡\n\nоплата через PayPal принята: <b>${deal.title}</b>, доступ до <b>${until}</b>.\n\nвсё в кабинете, жми кнопку ниже.`,
      { inline_keyboard: [[{ text: '🚪 Открыть кабинет', web_app: { url: CABINET } }]] },
      'HTML',
      'payment-receipt',
    );
  }

  const who = sub.subscriber?.email_address || '';
  await notifyAdmin(
    `💳 PayPal ${renewal ? '(продление) ' : ''}«${deal.title}»\n$${gross || cfg.usd} · ${formatPrice(deal.price)} по прайсу\nTG ${tg}${who ? ` · ${who}` : ''} · до ${until}\nOrder: ${orderId} · ${via}`,
    { alsoWork: true, parseMode: null },
  );
  return 'granted';
}

/** Проверить подписку целиком: провести все списания за последние N дней. */
export async function sweepSubscription(subId: string, via: string, sinceDays = 40): Promise<number> {
  const sub = await getSubscription(subId);
  if (!parseCustom(sub.custom_id)) return 0;
  let n = 0;
  for (const t of await completedTransactions(subId, sinceDays)) {
    if ((await fulfillPayment(sub, t.id, t.amount_with_breakdown?.gross_amount?.value, via)) === 'granted') n++;
  }
  return n;
}

/** Все подписки, созданные ботом за последние ~13 месяцев (или одного человека). */
async function knownSubscriptions(onlyTelegramId?: number): Promise<string[]> {
  const since = new Date(Date.now() - 400 * 24 * 3600 * 1000);
  const rows = await prisma.event.findMany({
    where: {
      type: 'paypal_sub_created',
      createdAt: { gte: since },
      ...(onlyTelegramId ? { telegramId: BigInt(onlyTelegramId) } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: onlyTelegramId ? 5 : 1000,
  });
  const ids = rows.map((r) => (r.metadata as { sub?: string } | null)?.sub).filter((x): x is string => Boolean(x));
  return [...new Set(ids)];
}

/**
 * Добрать списания, которые не дошли вебхуком. Без телеграма: все подписки,
 * у которых статус ACTIVE/SUSPENDED/CANCELLED (отменённая могла успеть списать).
 */
export async function sweepPaypal(onlyTelegramId?: number): Promise<number> {
  let n = 0;
  for (const id of await knownSubscriptions(onlyTelegramId)) {
    try {
      const sub = await getSubscription(id);
      if (sub.status === 'APPROVAL_PENDING' || sub.status === 'APPROVED') continue;
      n += await sweepSubscription(id, onlyTelegramId ? 'button' : 'sweep', onlyTelegramId ? 3 : 5);
    } catch (e) {
      console.error('[paypal] sweep', id, e);
    }
  }
  return n;
}

/** Проверка подписи вебхука через API PayPal. */
export async function verifyWebhook(headers: Headers, rawBody: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  const h = (k: string) => headers.get(k) || '';
  if (!h('paypal-transmission-sig')) return false;
  const r = await call<{ verification_status: string }>('POST', '/v1/notifications/verify-webhook-signature', {
    auth_algo: h('paypal-auth-algo'),
    cert_url: h('paypal-cert-url'),
    transmission_id: h('paypal-transmission-id'),
    transmission_sig: h('paypal-transmission-sig'),
    transmission_time: h('paypal-transmission-time'),
    webhook_id: webhookId,
    webhook_event: JSON.parse(rawBody),
  }).catch(() => null);
  return r?.verification_status === 'SUCCESS';
}
