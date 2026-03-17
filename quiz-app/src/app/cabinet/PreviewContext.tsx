'use client';

import { createContext, useContext, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

export type PreviewMode = 'client' | 'free' | null;

interface PreviewContextValue {
  previewMode: PreviewMode;
  isPreview: boolean;
  /** When true, simulate paid client (all access) */
  isClientPreview: boolean;
  /** When true, simulate free user (only free items accessible) */
  isFreePreview: boolean;
}

const PreviewContext = createContext<PreviewContextValue>({
  previewMode: null,
  isPreview: false,
  isClientPreview: false,
  isFreePreview: false,
});

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const previewParam = searchParams.get('preview') as PreviewMode;

  const value = useMemo<PreviewContextValue>(() => {
    const mode = (previewParam === 'client' || previewParam === 'free') ? previewParam : null;
    return {
      previewMode: mode,
      isPreview: mode !== null,
      isClientPreview: mode === 'client',
      isFreePreview: mode === 'free',
    };
  }, [previewParam]);

  return (
    <PreviewContext.Provider value={value}>
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreview() {
  return useContext(PreviewContext);
}

/**
 * Determine access for an item based on preview mode.
 * - client preview: everything accessible
 * - free preview: only free items accessible
 * - no preview: use actual hasAccess from API
 */
export function resolveAccess(
  item: { isFree: boolean; hasAccess?: boolean },
  previewMode: PreviewMode
): boolean {
  if (previewMode === 'client') return true;
  if (previewMode === 'free') return item.isFree;
  return item.hasAccess ?? item.isFree;
}
