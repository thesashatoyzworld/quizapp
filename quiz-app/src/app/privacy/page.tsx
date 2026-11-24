import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy | SASHA TOYZ' };

const box = { maxWidth: 680, margin: '40px auto', padding: 20, fontFamily: 'sans-serif', lineHeight: 1.55 } as const;

export default function PrivacyPage() {
  return (
    <div style={box}>
      <h1>Privacy Policy</h1>
      <p>Last updated: November 24, 2026</p>
      <p>
        This policy covers the Meta (Instagram/Facebook) apps run by SASHA TOYZ on thesashatoyz.com:
        &quot;SASHA TOYZ Stats&quot; (reels statistics for students of our program) and our Instagram
        comment auto-reply app. Contact: <a href="mailto:thesashatoyz@gmail.com">thesashatoyz@gmail.com</a>.
      </p>

      <h2>SASHA TOYZ Stats</h2>
      <h3>What we collect</h3>
      <p>
        When a student connects their Instagram professional account in our student cabinet and approves
        access in the Meta login window, we receive and store:
      </p>
      <ul>
        <li>the Instagram account id and username of the connected professional account;</li>
        <li>an access token issued by Meta for that account (kept on our server only);</li>
        <li>
          the list of recent posts and reels of that account (id, caption, link, date, type, likes and
          comments count) and their insights metrics: views, reach, saves, shares and total interactions.
        </li>
      </ul>
      <p>
        We request only the permissions instagram_basic and instagram_manage_insights. We cannot publish,
        comment, send messages or change anything in the account.
      </p>
      <h3>Why</h3>
      <p>
        To show the student the statistics of their own reels in their personal cabinet and to use these
        numbers in the analysis of their content inside our program. The data is shown only to the student
        who connected the account and to the program&apos;s author for coaching purposes.
      </p>
      <h3>Storage and sharing</h3>
      <p>
        Data is stored in our database on secured servers. We do not sell, rent or share it with third
        parties and do not use it for advertising.
      </p>
      <h3>Retention</h3>
      <p>
        We keep the connection while the account stays connected. When the student disconnects, removes the
        app in Instagram or Facebook settings, or asks for deletion, we delete the access token and the stored
        account data within 30 days (usually immediately).
      </p>
      <h3>How to disconnect</h3>
      <ul>
        <li>press &quot;Отключить&quot; (Disconnect) in the Instagram block of the student cabinet; or</li>
        <li>
          remove &quot;SASHA TOYZ Stats&quot; in Instagram (Settings → Website permissions → Apps and websites)
          or in Facebook (Settings → Business integrations / Apps and websites).
        </li>
      </ul>

      <h2>Instagram comment auto-reply</h2>
      <p>
        This app collects Instagram usernames and comment data solely to send automated replies to people
        who comment on our content with specific keywords. Data is used only to deliver the requested content
        via Instagram Direct Messages, is not sold or shared, and is kept only as long as needed for the
        service to work.
      </p>

      <h2>Data deletion</h2>
      <p>
        You can ask us to delete your data at any time: email{' '}
        <a href="mailto:thesashatoyz@gmail.com">thesashatoyz@gmail.com</a> with the subject
        &quot;Data Deletion Request&quot; and your Instagram username. We delete the data within 30 days.
        Details: <a href="/data-deletion">thesashatoyz.com/data-deletion</a>.
      </p>
    </div>
  );
}
