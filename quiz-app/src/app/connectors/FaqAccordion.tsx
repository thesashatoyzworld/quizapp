'use client';

import { useState } from 'react';

type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="connectors-faq">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <button
            key={index}
            className={`connectors-faq-item ${isOpen ? 'connectors-faq-item-open' : ''}`}
            onClick={() => setOpenIndex(isOpen ? null : index)}
            aria-expanded={isOpen}
          >
            <div className="connectors-faq-question">
              <span>{item.question}</span>
              <span className={`connectors-faq-chevron ${isOpen ? 'connectors-faq-chevron-open' : ''}`}>
                &#9660;
              </span>
            </div>
            <div
              className="connectors-faq-answer-wrapper"
              style={{
                maxHeight: isOpen ? '500px' : '0',
                opacity: isOpen ? 1 : 0,
              }}
            >
              <p className="connectors-faq-answer">{item.answer}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
