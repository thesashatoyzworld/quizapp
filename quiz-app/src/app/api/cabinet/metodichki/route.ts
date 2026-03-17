import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMetodichki } from '@/data/cabinet-content';

// Returns all metodichki with user's access info
// GET /api/cabinet/metodichki?telegramId=123
export async function GET(request: NextRequest) {
  try {
    const telegramId = request.nextUrl.searchParams.get('telegramId');

    const allMetodichki = getMetodichki();

    // If no telegramId, return with all paid items locked
    if (!telegramId) {
      const result = allMetodichki.map(m => ({
        ...m,
        hasAccess: m.isFree,
        url: m.isFree ? m.url : undefined,
      }));
      return NextResponse.json({ success: true, metodichki: result });
    }

    // Find user and their purchases
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
      include: {
        purchases: {
          include: {
            product: {
              select: { slug: true },
            },
          },
        },
      },
    });

    const purchasedSlugs = new Set(
      user?.purchases.map(p => p.product.slug) || []
    );

    const result = allMetodichki.map(m => {
      const hasAccess = m.isFree || (m.productSlug ? purchasedSlugs.has(m.productSlug) : false);
      return {
        ...m,
        hasAccess,
        url: hasAccess ? m.url : undefined,
      };
    });

    return NextResponse.json({ success: true, metodichki: result });
  } catch (error) {
    console.error('[Cabinet] Metodichki fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
