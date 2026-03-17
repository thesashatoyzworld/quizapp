import { NextRequest, NextResponse } from 'next/server';
import { getFeedByArchetype } from '@/data/cabinet-content';

export async function GET(request: NextRequest) {
  try {
    const archetype = request.nextUrl.searchParams.get('archetype');

    if (!archetype) {
      return NextResponse.json(
        { success: false, error: 'archetype parameter is required' },
        { status: 400 }
      );
    }

    const feed = getFeedByArchetype(archetype);

    if (!feed) {
      return NextResponse.json(
        { success: false, error: 'Unknown archetype', archetype },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, feed });
  } catch (error) {
    console.error('[Cabinet] Feed fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
