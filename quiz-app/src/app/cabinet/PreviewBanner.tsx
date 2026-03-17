'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { usePreview } from './PreviewContext';

export default function PreviewBanner() {
  const { previewMode, isPreview } = usePreview();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!isPreview) return null;

  const switchMode = (mode: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (mode === 'none') {
      params.delete('preview');
    } else {
      params.set('preview', mode);
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? '?' + qs : ''}`);
  };

  return (
    <div className="preview-banner">
      <div className="preview-banner-inner">
        <span className="preview-banner-label">
          {previewMode === 'client' ? 'Клиент' : 'Бесплатный'}
        </span>
        <div className="preview-banner-buttons">
          <button
            className={`preview-btn ${previewMode === 'client' ? 'preview-btn--active' : ''}`}
            onClick={() => switchMode('client')}
          >
            Клиент
          </button>
          <button
            className={`preview-btn ${previewMode === 'free' ? 'preview-btn--active' : ''}`}
            onClick={() => switchMode('free')}
          >
            Free
          </button>
          <button
            className="preview-btn preview-btn--close"
            onClick={() => switchMode('none')}
          >
            x
          </button>
        </div>
      </div>
    </div>
  );
}
