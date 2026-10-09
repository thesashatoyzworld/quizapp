// ─────────────────────────────────────────────────────────────
// Уведомления Продамуса по подпискам (тариф 2 по карточке подписки).
//
// Зачем отдельный адрес. Обычный вебхук (/api/prodamus-webhook) получает только
// первую оплату подписки. Автосписания и отключения Продамус шлёт на «URL для
// уведомлений о совершении оплат по подписке» в настройках подписок, и до 09.10.2026
// там было пусто: деньги списывались, а доступ по expires_at заканчивался.
//
// Почему не тот же адрес. Вебхук принял бы автосписание за новую покупку т2 и
// заново отправил бы человеку приветственный пакет, а уведомление об отключении
// (без payment_status = success) ушло бы Саше как «оплата не прошла».
//
// Что делаем:
//   автосписание прошло   → продлеваем доступ на месяц, пишем покупку, сообщаем Саше;
//   первая оплата (payment_num = 1) → ничего, её проводит обычный вебхук;
//   всё остальное (отключение, неуспешное списание, завершение) → только сообщаем.
// Каждый заход пишется в events (type `sub_wh`) до проверки подписи.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveProductByOrderId, getProductBySlug, CatalogProduct } from '@/lib/catalog';
import { grantAccess } from '@/lib/access';
import { telegramsByEmail } from '@/lib/payer-match';
import { tgFromOrderId } from '@/lib/order-id';
import { notifyAdmin } from '@/lib/telegram';
import { T2_PRODUCT_SLUG } from '@/content/intake-tarif2';
import {
  parseProdamusBody, prodamusSignature, verifyProdamusSignature, sortDeep,
} from '@/lib/prodamus-sign';

type Body = Record<string, unknown>;

function str(v: unknown): string {
  return v == null ? '' : String(v);
}

/**
 * Наш order_id первой оплаты этой подписки. profile_id — номер подписки
 * конкретного человека, он записан в логе вебхука рядом с order_num.
 */
async function firstOrderByProfile(profileId: string): Promise<string | null> {
  if (!profileId) return null;
  const rows = await prisma.$queryRaw<{ order: string }[]>`
    SELECT metadata->>'order' AS "order"
      FROM events
     WHERE type IN ('wh_debug', 'sub_wh')
       AND metadata->>'subProfile' = ${profileId}
       AND metadata->>'order' IS NOT NULL
     ORDER BY created_at ASC`;
  return rows.map((r) => r.order).find((o) => resolveProductByOrderId(o)) ?? null;
}

interface Payer {
  telegramId: number | null;
  /** наш order_id первой оплаты; по нему находится веб-доступ без телеграма */
  order: string | null;
  how: string;
}

async function findPayer(body: Body, profileId: string): Promise<Payer> {
  const own = str(body.order_num);
  if (own && resolveProductByOrderId(own)) {
    return { telegramId: tgFromOrderId(own), order: own, how: 'order_num' };
  }
  const first = await firstOrderByProfile(profileId);
  if (first) return { telegramId: tgFromOrderId(first), order: first, how: `подписка ${profileId}` };
  const email = str(body.customer_email);
  if (email) {
    const tgs = await telegramsByEmail(email).catch(() => [] as number[]);
    if (tgs.length === 1) return { telegramId: tgs[0], order: null, how: 'почта' };
  }
  return { telegramId: null, order: null, how: '' };
}

async function recordPurchase(tg: number, product: CatalogProduct, amount: number, key: string) {
  const user = await prisma.user.upsert({
    where: { telegramId: BigInt(tg) },
    create: { telegramId: BigInt(tg) },
    update: {},
  });
  const p = await prisma.product.upsert({
    where: { slug: product.slug },
    create: { slug: product.slug, name: product.name, price: product.price, type: product.type },
    update: {},
  });
  await prisma.purchase.create({
    data: { userId: user.id, productId: p.id, amount, source: 'autopay', prodamusOrderId: key },
  });
}

function fmtDate(d: Date | null | undefined): string {
  return d ? d.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' }) : '—';
}

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = parseProdamusBody(await request.text(), request.headers.get('content-type') || '');
  } catch (e) {
    console.error('[Prodamus Sub] bad body', e);
    return NextResponse.json({ success: false }, { status: 400 });
  }
  const signature = prodamusSignature(request.headers);
  const sub = (body.subscription || {}) as Record<string, unknown>;
  const profileId = str(sub.profile_id);
  const products = body.products as Record<string, Record<string, string>> | undefined;
  const first = products?.['0'] || (Array.isArray(products) ? products[0] : undefined);
  const amount = parseInt(str(first?.sum ?? first?.price ?? body.sum ?? sub.cost), 10) || 0;
  const status = str(body.payment_status);
  const paymentNum = parseInt(str(sub.payment_num), 10) || 0;

  // Формат этих уведомлений нигде толком не описан: пишем всё как есть.
  await prisma.event.create({
    data: {
      type: 'sub_wh', source: 'thesasha',
      metadata: {
        hasSign: !!signature,
        paymentStatus: status || null,
        order: str(body.order_num || body.order_id) || null,
        prodamusOrder: str(body.order_id) || null,
        email: str(body.customer_email) || null,
        sum: amount || null,
        subId: str(sub.id) || null,
        subProfile: profileId || null,
        paymentNum: paymentNum || null,
        actionCode: str(sub.action_code || body.action_code) || null,
        sample: JSON.stringify(sortDeep(body)).slice(0, 4000),
      },
    },
  }).catch((e) => console.error('[Prodamus Sub] log failed', e));

  if (!verifyProdamusSignature(body, signature)) {
    console.error('[Prodamus Sub] signature mismatch');
    return NextResponse.json({ success: false }, { status: 403 });
  }

  try {
    const payer = await findPayer(body, profileId);
    const who = [
      payer.telegramId ? `TG ${payer.telegramId}` : '',
      str(body.customer_email),
    ].filter(Boolean).join(' · ') || 'не опознан';
    const name = str(first?.name || sub.name) || 'подписка';

    // Не оплата: отключение, завершение, неудачная попытка списания.
    if (status !== 'success') {
      const flags = [
        sub.active_user === '0' ? 'клиент отключил' : '',
        sub.active_manager === '0' ? 'отключена в кабинете' : '',
        str(sub.date_completion) ? `завершена ${str(sub.date_completion)}` : '',
        status ? `статус «${str(body.payment_status_description) || status}»` : '',
        str(sub.action_code || body.action_code),
      ].filter(Boolean).join(', ');
      await notifyAdmin(
        `🔕 Подписка: ${name}\n${flags || 'уведомление без оплаты'}\nКто: ${who}\nПодписка №${profileId || '—'}`,
        { alsoWork: true, parseMode: null },
      );
      return NextResponse.json({ success: true });
    }

    // Первую оплату проводит обычный вебхук: там приветствие и выдача.
    if (paymentNum === 1) return NextResponse.json({ success: true });

    const key = `autopay_${str(body.order_id) || `${profileId}_${paymentNum}`}`;
    // Повтор того же уведомления не должен продлить доступ второй раз.
    const seen = await prisma.event.findFirst({
      where: { type: 'autopay_done', metadata: { path: ['key'], equals: key } },
      select: { id: true },
    });
    if (seen) return NextResponse.json({ success: true });

    const product = (payer.order && resolveProductByOrderId(payer.order))
      || getProductBySlug(T2_PRODUCT_SLUG);
    if (!product || (!payer.telegramId && !payer.order)) {
      await notifyAdmin(
        `🔁 Автосписание ${amount.toLocaleString('ru-RU')} ₽, человека НЕ опознал\n${name}\n`
        + `Контакт: ${who}\nПодписка №${profileId || '—'}, платёж ${paymentNum || '?'}\n\nДоступ сам не продлён, продли руками.`,
        { alsoWork: true, parseMode: null },
      );
      return NextResponse.json({ success: true });
    }

    // С телеграмом продлеваем его доступ; оплата с сайта без привязки —
    // доступ, выданный по order_id первой оплаты.
    const accessId = await grantAccess({
      product,
      telegramId: payer.telegramId,
      source: payer.order || key,
    });
    await prisma.event.create({
      data: {
        type: 'autopay_done', source: 'thesasha', productSlug: product.slug,
        telegramId: payer.telegramId ? BigInt(payer.telegramId) : null,
        metadata: { key, amount, order: payer.order, accessId, subProfile: profileId || null },
      },
    });
    if (payer.telegramId) await recordPurchase(payer.telegramId, product, amount, key);
    const access = await prisma.productAccess.findUnique({ where: { id: accessId } });

    await notifyAdmin(
      `🔁 Автосписание прошло\n${name}\n${amount.toLocaleString('ru-RU')} ₽, платёж ${paymentNum || '?'}\n`
      + `Кто: ${who} (опознан: ${payer.how})\nДоступ продлён до ${fmtDate(access?.expiresAt)}`,
      { alsoWork: true, parseMode: null },
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[Prodamus Sub] failed', e);
    await notifyAdmin(
      `⚠️ Вебхук подписок упал: ${e instanceof Error ? e.message : String(e)}\nПодписка №${profileId || '—'}, ${amount} ₽`,
      { alsoWork: true, parseMode: null },
    ).catch(() => {});
    // 200, чтобы Продамус не долбил повторами; запись в events есть.
    return NextResponse.json({ success: true });
  }
}
