'use client';

import { useState, useEffect } from 'react';

export function StickyCta({ buttonText }: { buttonText: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;

      // Show after 25% scroll
      const shouldShow = scrollPercent > 0.25;

      // Hide near bottom CTA section (last 10%)
      const nearBottom = scrollPercent > 0.9;

      setVisible(shouldShow && !nearBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  const scrollToBottom = () => {
    const ctaSection = document.querySelector('.card-cta');
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="connectors-sticky-cta">
      <button className="connectors-sticky-cta-btn" onClick={scrollToBottom}>
        {buttonText}
      </button>
    </div>
  );
}
