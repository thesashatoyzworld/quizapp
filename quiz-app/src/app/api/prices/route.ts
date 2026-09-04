import { NextResponse } from 'next/server';
import { prices, newPrices, priceChanged, CHANGE_LABEL } from '@/content/prices';

// Цены для статических страниц. Страница оплаты лежит в public/ и импортировать
// модуль не может, а держать там вторую копию цифр уже дорого стоило: 20.08
// закэшированная страница со старой ценой отправила 3 450 вместо 5 450.
//
// Деньги здесь не решаются: ссылку на оплату собирает /pay/<tier> на сервере.
// Это только то, что человек видит.
export const dynamic = 'force-dynamic';

export function GET() {
  const now = prices();
  const next = newPrices();
  return NextResponse.json(
    {
      t1: now.t1,
      t2Month: now.t2Month,
      t3Month: now.t3Month,
      /** Пока цена не сменилась: что и когда станет. Дальше null. */
      change: priceChanged() ? null : { label: CHANGE_LABEL, t1: next.t1, t2Month: next.t2Month, t3Month: next.t3Month },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
