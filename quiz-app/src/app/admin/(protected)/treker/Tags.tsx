'use client';

import { useState } from 'react';
import styles from './treker.module.css';

// Цвет метки считается из её имени: одна и та же метка везде одного цвета, таблица цветов не нужна.
const PALETTE = ['#00f0ff', '#ff4fd8', '#b388ff', '#00ff88', '#ffd166', '#ff8a5c', '#5cc8ff', '#c6ff4f'];

export function tagColor(tag: string): string {
  let h = 0;
  for (const ch of tag) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function TagChip({
  tag,
  active,
  count,
  onClick,
  onRemove,
}: {
  tag: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
  onRemove?: () => void;
}) {
  const color = tagColor(tag);
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick, 'aria-pressed': !!active } : {})}
      className={`${styles.tag} ${active ? styles.tagOn : ''}`}
      style={{ ['--tag' as string]: color }}
    >
      <span className={styles.tagDot} />#{tag}
      {count !== undefined && <span className={styles.tagCount}>{count}</span>}
      {onRemove && (
        <button
          type="button"
          className={styles.tagX}
          aria-label={`Убрать метку ${tag}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          ×
        </button>
      )}
    </Tag>
  );
}

/** Метки задачи: чипы с крестиком и поле «+ метка» с подсказками из уже существующих. */
export function TagEditor({
  tags,
  known,
  onChange,
}: {
  tags: string[];
  known: string[];
  onChange: (tags: string[]) => void;
}) {
  const [value, setValue] = useState('');
  const suggestions = known.filter((t) => !tags.includes(t));

  function add(raw: string) {
    const v = raw.trim().replace(/^#+/, '').toLowerCase().slice(0, 24);
    setValue('');
    if (v && !tags.includes(v)) onChange([...tags, v]);
  }

  return (
    <div className={styles.tagEditor}>
      {tags.map((t) => (
        <TagChip key={t} tag={t} onRemove={() => onChange(tags.filter((x) => x !== t))} />
      ))}
      <input
        className={styles.tagInput}
        list="tracker-tags"
        placeholder="+ метка"
        value={value}
        maxLength={24}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add(value);
          }
        }}
        onBlur={() => value.trim() && add(value)}
      />
      <datalist id="tracker-tags">
        {suggestions.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </div>
  );
}
