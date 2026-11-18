import type { Metadata } from 'next';
import { DWY_MODES, isDwyKind } from '@/content/dwy';
import AnketaForm from './AnketaForm';

// The form is a client component, so link previews per mode have to be declared here.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string | string[] }>;
}): Promise<Metadata> {
  const { kind } = await searchParams;
  const meta = isDwyKind(kind) ? DWY_MODES[kind].meta : undefined;
  if (!meta) return {};
  return { title: meta.title, description: meta.description, openGraph: meta };
}

export default function DwyAnketaPage() {
  return <AnketaForm />;
}
