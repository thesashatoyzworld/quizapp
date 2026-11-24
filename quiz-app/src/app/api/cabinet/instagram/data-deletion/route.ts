import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { deleteByMetaUser, parseSignedRequest } from '@/lib/instagram/connect';

export const runtime = 'nodejs';

// Meta "Data Deletion Request" callback: POST form signed_request=<sig>.<payload>.
// Deletes the stored connection (token, ids, username) right away and answers
// with a status url + confirmation code, as Meta requires.
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const data = parseSignedRequest(String(form?.get('signed_request') || ''));
  if (!data?.user_id) return NextResponse.json({ error: 'invalid signed_request' }, { status: 400 });
  const deleted = await deleteByMetaUser(String(data.user_id));
  const code = randomBytes(8).toString('hex');
  console.log('[ig-connect] data deletion', code, 'rows', deleted);
  return NextResponse.json({ url: `https://thesashatoyz.com/data-deletion?code=${code}`, confirmation_code: code });
}
