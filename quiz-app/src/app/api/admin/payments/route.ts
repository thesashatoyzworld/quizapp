import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  void request;

  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        user: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const payments = purchases.map((p) => ({
      id: p.id,
      timestamp: p.createdAt.toISOString(),
      user_id: Number(p.user.telegramId) || null,
      product: p.product.name,
      product_slug: p.product.slug,
      amount: p.amount,
      source: p.source || '',
      order_id: p.prodamusOrderId || '',
    }));

    const total = payments.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({ payments, total, count: payments.length });
  } catch (error) {
    console.error('[Admin Payments]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
