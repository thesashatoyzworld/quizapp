import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.nextUrl.searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'telegramId is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
      include: {
        purchases: {
          include: {
            product: {
              include: {
                materials: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Serialize BigInt for JSON
    const serializedUser = {
      id: user.id,
      telegramId: user.telegramId.toString(),
      username: user.username,
      firstName: user.firstName,
      quizResult: user.quizResult,
      createdAt: user.createdAt.toISOString(),
      purchases: user.purchases.map(p => ({
        id: p.id,
        amount: p.amount,
        createdAt: p.createdAt.toISOString(),
        product: {
          id: p.product.id,
          slug: p.product.slug,
          name: p.product.name,
          type: p.product.type,
          materials: p.product.materials.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            type: m.type,
            url: m.url,
            sortOrder: m.sortOrder,
          })),
        },
      })),
    };

    return NextResponse.json({ success: true, user: serializedUser });
  } catch (error) {
    console.error('[Cabinet] User fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
