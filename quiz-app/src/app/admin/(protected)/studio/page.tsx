import Studio from '@/components/studio/Studio';
import s from '@/components/studio/studio.module.css';
import { loadBoard } from '@/lib/studio/store';
import { localDate } from '@/lib/studio/view';

export const dynamic = 'force-dynamic';

// Контент Instagram Саши и Дани: расписание, карточки, цифры по группам копий.
// Даня видит то же на /studio по личной ссылке.
export default async function StudioAdminPage() {
  const board = await loadBoard();
  return (
    <div>
      <h1 className={s.h1}>СТУДИЯ</h1>
      <p className={s.sub}>рилсы и карусели: что выходит когда, у кого сейчас, как сработало. Даня видит это же на /studio</p>
      <Studio board={board} actor="sasha" today={localDate()} />
    </div>
  );
}
