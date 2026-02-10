'use client';

import { useEffect } from 'react';

export function ScrollFix() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.style.height = 'auto';
    body.style.height = 'auto';
    body.style.overflowY = 'auto';

    return () => {
      html.style.height = '';
      body.style.height = '';
      body.style.overflowY = '';
    };
  }, []);

  return null;
}
