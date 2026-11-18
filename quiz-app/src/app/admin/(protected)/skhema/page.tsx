import { getBoard, listBoards } from '@/lib/board/data';
import SkhemaClient from './SkhemaClient';

export const dynamic = 'force-dynamic';

type PageProps = { searchParams: Promise<{ b?: string }> };

export default async function SkhemaPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const boards = await listBoards();
  const slug = sp.b ?? boards.find((b) => b.slug === 'karuseli')?.slug ?? boards[0]?.slug;
  const board = slug ? await getBoard(slug) : null;
  return <SkhemaClient boards={boards} initial={board} />;
}
