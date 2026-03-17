import { NextResponse } from 'next/server';
import { getConnectorFeed } from '@/data/cabinet-content';

export async function GET() {
  try {
    const posts = getConnectorFeed();
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error('[Cabinet] Connector feed fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
