import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Data Deletion | SASHA TOYZ' };

const box = { maxWidth: 680, margin: '40px auto', padding: 20, fontFamily: 'sans-serif', lineHeight: 1.55 } as const;

export default async function DataDeletionPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const safe = code && /^[0-9a-f]{8,32}$/i.test(code) ? code : null;
  return (
    <div style={box}>
      <h1>Data Deletion Instructions</h1>
      <p>Last updated: November 24, 2026</p>

      {safe && (
        <p style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
          Deletion request <b>{safe}</b> received. The Instagram connection, access token and stored account
          data for your Meta account were deleted from our systems.
        </p>
      )}

      <p>
        This page covers our Meta apps: &quot;SASHA TOYZ Stats&quot; (reels statistics in the student cabinet)
        and the Instagram comment auto-reply app.
      </p>

      <h2>What data we store</h2>
      <ul>
        <li>
          SASHA TOYZ Stats: the Instagram account id and username of the connected professional account,
          the access token issued by Meta, and the recent media list with insights metrics (views, reach,
          saves, shares, interactions).
        </li>
        <li>
          Auto-reply: your Instagram username and comment text, only when you comment on our content with a
          specific keyword.
        </li>
      </ul>

      <h2>How to delete your data</h2>
      <ul>
        <li>
          Press &quot;Отключить&quot; (Disconnect) in the Instagram block of the student cabinet. The connection
          and the token are deleted immediately.
        </li>
        <li>
          Remove the app &quot;SASHA TOYZ Stats&quot; in Instagram or Facebook settings (Apps and websites /
          Business integrations). Meta notifies us and we delete the data automatically.
        </li>
        <li>
          Or email <a href="mailto:thesashatoyz@gmail.com">thesashatoyz@gmail.com</a> with the subject
          &quot;Data Deletion Request&quot; and your Instagram username.
        </li>
      </ul>

      <h2>Deletion timeline</h2>
      <p>
        Your data is deleted within 30 days of the request (automatic requests are processed immediately).
        For email requests you will receive a confirmation email once the deletion is complete.
      </p>
    </div>
  );
}
