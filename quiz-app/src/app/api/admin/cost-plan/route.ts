// Правка тарифа из кабинета: сумма, валюта, день списания, заметка.
//
// Ставки сверх пакета (pricing) отсюда не трогаем — они сверяются со счётом
// и живут в scripts/costs-seed-plans.mjs, чтобы не потеряться.

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as {
    service?: string;
    amount?: number;
    currency?: string;
    billingDay?: number | null;
    note?: string | null;
  };

  if (!body.service) return NextResponse.json({ error: 'нет service' }, { status: 400 });

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    return NextResponse.json({ error: 'сумма должна быть числом' }, { status: 400 });
  }

  const billingDay =
    body.billingDay === null || body.billingDay === undefined ? null : Number(body.billingDay);
  if (billingDay !== null && (!Number.isInteger(billingDay) || billingDay < 1 || billingDay > 31)) {
    return NextResponse.json({ error: 'день списания вне диапазона' }, { status: 400 });
  }

  const plan = await prisma.serviceCostPlan.update({
    where: { service: body.service },
    data: {
      amount,
      currency: body.currency === 'RUB' ? 'RUB' : 'USD',
      billingDay,
      note: body.note ?? null,
    },
  });

  return NextResponse.json({ ok: true, plan: { service: plan.service, amount: plan.amount } });
}
