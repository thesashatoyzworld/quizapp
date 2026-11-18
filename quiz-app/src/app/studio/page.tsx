import type { Metadata } from 'next';
import Studio from '@/components/studio/Studio';
import s from '@/components/studio/studio.module.css';
import { currentActor, libraryOpenToDanya, loadBoard } from '@/lib/studio/store';
import { localDate } from '@/lib/studio/view';
import { mcpUrlFor } from '@/lib/studio/mcp-url';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Студия', robots: { index: false, follow: false } };

// Danya's door: studio_session cookie from /studio/enter?k=…, no admin access.
export default async function StudioPage() {
  const actor = await currentActor();
  if (!actor) {
    return (
      <main className={s.page}>
        <h1 className={s.h1}>СТУДИЯ</h1>
        <p className={s.sub}>Нет доступа. Открой личную ссылку, которую прислал Саша.</p>
      </main>
    );
  }
  const board = await loadBoard();
  return (
    <main className={s.page}>
      <h1 className={s.h1}>СТУДИЯ</h1>
      <p className={s.sub}>рилсы и карусели Саши: что выходит когда, у кого сейчас, как сработало</p>
      <Studio board={board} actor={actor} today={localDate()} mcpUrl={await mcpUrlFor(actor)} libraryOpen={actor === 'sasha' || (await libraryOpenToDanya())} />
    </main>
  );
}
