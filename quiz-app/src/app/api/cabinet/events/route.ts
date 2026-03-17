import { NextResponse } from 'next/server';
import { getUpcomingEvents } from '@/data/cabinet-content';

export async function GET() {
  try {
    const events = getUpcomingEvents();
    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error('[Cabinet] Events fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
