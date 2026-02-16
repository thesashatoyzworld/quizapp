'use client';

import { useState, useEffect, useRef } from 'react';

export function StickyCta({ buttonText }: { buttonText: string }) {
  const [visible, setVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const scrolledPast25 = useRef(false);

  useEffect(() => {
    // Scroll listener: show after 25% of page scrolled
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;

      scrolledPast25.current = scrollPercent > 0.25;
      setVisible(scrolledPast25.current && !footerVisible);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [footerVisible]);

  useEffect(() => {
    // IntersectionObserver: hide when footer/CTA section is visible
    const footerEl = document.querySelector('.card-cta');
    if (!footerEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0]?.isIntersecting ?? false;
        setFooterVisible(isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(footerEl);

    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll to CTA section
      const ctaSection = document.querySelector('.card-cta');
      if (ctaSection) {
        ctaSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="connectors-sticky-cta">
      <button className="connectors-sticky-cta-btn" onClick={scrollToPricing}>
        {buttonText}
      </button>
    </div>
  );
}
