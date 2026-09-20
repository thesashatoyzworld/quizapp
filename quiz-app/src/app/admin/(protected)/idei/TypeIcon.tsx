// Icons and colours for the seven idea types.
//
// One colour per type, taken from the admin's own neon palette so the feed
// still reads as one system. The icon carries the meaning at a glance, the
// colour carries it in peripheral vision when scrolling a long feed.

export const TYPE_LABEL: Record<string, string> = {
  reel: 'рилс',
  bigvideo: 'большое видео',
  carousel: 'карусель',
  post: 'пост',
  offer: 'оффер',
  system: 'система',
  other: 'прочее',
};

// Hue per type. Kept distinct at a glance: pink, orange, cyan, green, gold,
// purple, grey. Anything added later must stay clear of its neighbours.
export const TYPE_COLOR: Record<string, string> = {
  reel: '#ff00aa',
  bigvideo: '#ff6b2c',
  carousel: '#00f0ff',
  post: '#3dff9a',
  offer: '#ffd700',
  system: '#9d4edd',
  other: 'rgba(255, 255, 255, 0.45)',
};

export function typeColor(type: string): string {
  return TYPE_COLOR[type] ?? TYPE_COLOR.other;
}

export function typeLabel(type: string): string {
  return TYPE_LABEL[type] ?? type;
}

/**
 * A 14px line icon per type, inheriting the surrounding colour so the badge,
 * the filter chip and the card stripe never drift apart.
 */
export function TypeIcon({ type, size = 14 }: { type: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (type) {
    // Vertical frame with a play mark: a phone-shaped video.
    case 'reel':
      return (
        <svg {...common}>
          <rect x="4.5" y="1.5" width="7" height="13" rx="1.6" />
          <path d="M7 6.2l2.6 1.8L7 9.8z" fill="currentColor" stroke="none" />
        </svg>
      );
    // Wide frame with a play mark: a landscape video.
    case 'bigvideo':
      return (
        <svg {...common}>
          <rect x="1.5" y="3.5" width="13" height="9" rx="1.6" />
          <path d="M6.6 6.3l3 1.7-3 1.7z" fill="currentColor" stroke="none" />
        </svg>
      );
    // Stacked cards: slides one behind another.
    case 'carousel':
      return (
        <svg {...common}>
          <rect x="5" y="3" width="9" height="10" rx="1.4" />
          <path d="M3 4.6v7.8" />
          <path d="M1.5 6.2v4.6" />
        </svg>
      );
    // Lines of text.
    case 'post':
      return (
        <svg {...common}>
          <rect x="2.5" y="2" width="11" height="12" rx="1.6" />
          <path d="M5 5.5h6M5 8h6M5 10.5h3.5" />
        </svg>
      );
    // A price tag.
    case 'offer':
      return (
        <svg {...common}>
          <path d="M8.2 1.8H14v5.8l-6.6 6.6a1.2 1.2 0 01-1.7 0L1.6 9.9a1.2 1.2 0 010-1.7z" />
          <circle cx="11.2" cy="4.8" r="1.05" />
        </svg>
      );
    // Sliders: a process you tune.
    case 'system':
      return (
        <svg {...common}>
          <path d="M2 5h12M2 11h12" />
          <circle cx="6" cy="5" r="1.7" />
          <circle cx="10.5" cy="11" r="1.7" />
        </svg>
      );
    // Anything the model could not place.
    default:
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6.2" />
          <path d="M8 4.8v3.6M8 11.1v.1" />
        </svg>
      );
  }
}
