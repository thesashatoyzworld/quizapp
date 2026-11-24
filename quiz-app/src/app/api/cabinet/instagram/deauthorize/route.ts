import { NextRequest, NextResponse } from 'next/server';
import { deleteByMetaUser, parseSignedRequest } from '@/lib/instagram/connect';

export const runtime = 'nodejs';

// Meta "Deauthorize" callback: the person removed the app in Facebook/Instagram
// settings. The token is useless now, so the connection is deleted.
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const data = parseSignedRequest(String(form?.get('signed_request') || ''));
  if (!data?.user_id) return NextResponse.json({ error: 'invalid signed_request' }, { status: 400 });
  const deleted = await deleteByMetaUser(String(data.user_id));
  console.log('[ig-connect] deauthorize rows', deleted);
  return NextResponse.json({ ok: true });
}
