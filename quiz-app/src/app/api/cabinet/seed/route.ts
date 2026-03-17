import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Seed endpoint — creates test products and materials for cabinet development
// Usage: POST /api/cabinet/seed?telegramId=YOUR_TELEGRAM_ID
// Only works in development or with admin auth

export async function POST(request: NextRequest) {
  try {
    const telegramId = request.nextUrl.searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'telegramId query param required' },
        { status: 400 }
      );
    }

    // ── Products ──
    const masterclass = await prisma.product.upsert({
      where: { slug: 'masterclass' },
      create: {
        slug: 'masterclass',
        name: 'Мастер-класс «Продающий контент»',
        price: 3450,
        type: 'one_time',
        active: true,
      },
      update: {},
    });

    const connectorsBasic = await prisma.product.upsert({
      where: { slug: 'connectors-basic' },
      create: {
        slug: 'connectors-basic',
        name: 'Коннекторы — Базовый',
        price: 120000,
        type: 'one_time',
        active: true,
      },
      update: {},
    });

    const connectorsPremium = await prisma.product.upsert({
      where: { slug: 'connectors-premium' },
      create: {
        slug: 'connectors-premium',
        name: 'Коннекторы — Премиум',
        price: 240000,
        type: 'one_time',
        active: true,
      },
      update: {},
    });

    // ── Materials for Masterclass ──
    const masterclassMaterials = [
      {
        title: 'Запись мастер-класса',
        description: 'Полная запись эфира (2ч 15мин)',
        type: 'video',
        url: 'https://example.com/masterclass-recording',
        sortOrder: 1,
      },
      {
        title: 'Презентация мастер-класса',
        description: 'PDF со всеми слайдами',
        type: 'pdf',
        url: 'https://example.com/masterclass-slides.pdf',
        sortOrder: 2,
      },
      {
        title: '3 промпта для нейросетей',
        description: 'Готовые промпты для создания контента',
        type: 'pdf',
        url: 'https://example.com/prompts.pdf',
        sortOrder: 3,
      },
      {
        title: 'Шаблон «Богатая ЦА»',
        description: 'Бонусный материал для анализа аудитории',
        type: 'pdf',
        url: 'https://example.com/target-audience.pdf',
        sortOrder: 4,
      },
      {
        title: 'Чат участников МК',
        description: 'Telegram группа для обсуждения',
        type: 'telegram_group',
        url: 'https://t.me/+example_masterclass_chat',
        sortOrder: 5,
      },
    ];

    // ── Materials for Connectors Basic ──
    const connectorsBasicMaterials = [
      {
        title: 'Модуль 1: Фундамент',
        description: 'Видеоурок — 45 мин',
        type: 'video',
        url: 'https://example.com/module-1',
        sortOrder: 1,
      },
      {
        title: 'Модуль 2: Контент-система',
        description: 'Видеоурок — 60 мин',
        type: 'video',
        url: 'https://example.com/module-2',
        sortOrder: 2,
      },
      {
        title: 'Модуль 3: Продающий контент',
        description: 'Видеоурок — 50 мин',
        type: 'video',
        url: 'https://example.com/module-3',
        sortOrder: 3,
      },
      {
        title: 'Рабочая тетрадь',
        description: 'PDF с заданиями на 12 недель',
        type: 'pdf',
        url: 'https://example.com/workbook.pdf',
        sortOrder: 4,
      },
      {
        title: 'Групповой чат',
        description: 'Telegram группа участников',
        type: 'telegram_group',
        url: 'https://t.me/+example_connectors_chat',
        sortOrder: 5,
      },
    ];

    // ── Materials for Connectors Premium ──
    const connectorsPremiumMaterials = [
      ...connectorsBasicMaterials.map(m => ({ ...m, sortOrder: m.sortOrder })),
      {
        title: 'Бонус: Персональный разбор',
        description: 'Ссылка на запись персонального разбора',
        type: 'video',
        url: 'https://example.com/personal-review',
        sortOrder: 6,
      },
      {
        title: 'Бонус: Шаблоны воронок',
        description: 'Готовые шаблоны продающих воронок',
        type: 'link',
        url: 'https://example.com/funnel-templates',
        sortOrder: 7,
      },
    ];

    // Create materials (delete existing first to avoid duplicates)
    await prisma.material.deleteMany({ where: { productId: masterclass.id } });
    await prisma.material.deleteMany({ where: { productId: connectorsBasic.id } });
    await prisma.material.deleteMany({ where: { productId: connectorsPremium.id } });

    for (const mat of masterclassMaterials) {
      await prisma.material.create({
        data: { productId: masterclass.id, ...mat },
      });
    }

    for (const mat of connectorsBasicMaterials) {
      await prisma.material.create({
        data: { productId: connectorsBasic.id, ...mat },
      });
    }

    for (const mat of connectorsPremiumMaterials) {
      await prisma.material.create({
        data: { productId: connectorsPremium.id, ...mat },
      });
    }

    // ── User + Purchase ──
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(telegramId) },
      create: {
        telegramId: BigInt(telegramId),
        username: 'test_user',
        firstName: 'Тестовый',
        quizResult: 'generous',
      },
      update: {
        quizResult: 'generous', // Set a quiz result for feed testing
      },
    });

    // Create test purchases (avoid duplicates)
    const existingPurchases = await prisma.purchase.findMany({
      where: { userId: user.id },
      select: { productId: true },
    });
    const purchasedProductIds = new Set(existingPurchases.map(p => p.productId));

    if (!purchasedProductIds.has(masterclass.id)) {
      await prisma.purchase.create({
        data: {
          userId: user.id,
          productId: masterclass.id,
          amount: 3450,
          source: 'seed',
        },
      });
    }

    if (!purchasedProductIds.has(connectorsBasic.id)) {
      await prisma.purchase.create({
        data: {
          userId: user.id,
          productId: connectorsBasic.id,
          amount: 120000,
          source: 'seed',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Seed data created',
      data: {
        products: [masterclass.slug, connectorsBasic.slug, connectorsPremium.slug],
        materials: {
          masterclass: masterclassMaterials.length,
          connectorsBasic: connectorsBasicMaterials.length,
          connectorsPremium: connectorsPremiumMaterials.length,
        },
        userId: user.id,
        purchases: 2,
      },
    });
  } catch (error) {
    console.error('[Cabinet Seed] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Seed failed', details: String(error) },
      { status: 500 }
    );
  }
}
