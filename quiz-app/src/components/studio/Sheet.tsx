'use client';

import { useEffect } from 'react';
import s from './studio.module.css';

/** Side panel (full screen on the phone): Escape and a click outside close it. */
export default function Sheet({ label, onClose, children }: { label: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className={s.overlay} onClick={onClose}>
      <aside className={s.drawer} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        {children}
      </aside>
    </div>
  );
}
