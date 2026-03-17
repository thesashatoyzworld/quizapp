import { NextResponse } from 'next/server';
import { getAnnouncementsSorted } from '@/data/cabinet-content';

export async function GET() {
  try {
    const announcements = getAnnouncementsSorted();
    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    console.error('[Cabinet] Announcements fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
