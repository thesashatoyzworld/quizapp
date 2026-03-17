import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCatalogSections } from '@/data/cabinet-content';

// Returns full catalog with user's access info
// GET /api/cabinet/catalog?telegramId=123
export async function GET(request: NextRequest) {
  try {
    const telegramId = request.nextUrl.searchParams.get('telegramId');

    const sections = getCatalogSections();

    // If no telegramId, return catalog with all items locked (except free)
    if (!telegramId) {
      const result = sections.map(section => ({
        ...section,
        items: section.items.map(item => ({
          ...item,
          hasAccess: item.isFree,
          // Strip URL for locked items
          url: item.isFree ? item.url : undefined,
        })),
      }));

      return NextResponse.json({ success: true, sections: result, purchasedSlugs: [] });
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

    const result = sections.map(section => ({
      ...section,
      items: section.items.map(item => {
        const hasAccess = item.isFree || (item.productSlug ? purchasedSlugs.has(item.productSlug) : false);
        return {
          ...item,
          hasAccess,
          // Strip URL for locked items
          url: hasAccess ? item.url : undefined,
        };
      }),
    }));

    return NextResponse.json({
      success: true,
      sections: result,
      purchasedSlugs: Array.from(purchasedSlugs),
    });
  } catch (error) {
    console.error('[Cabinet] Catalog fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
