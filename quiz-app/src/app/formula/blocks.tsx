'use client';

import React from 'react';
import type { Block, Rich, ListItem } from '@/content/formula/types';
import { VIDEO_MAP } from '@/content/formula/videoMap';

// Метка зрителя (Telegram @username · id) для динамического вотермарка Kinescope.
// Заполняется в page.tsx из initData Telegram, прокидывается через провайдер в
// FormulaApp. Плеер рисует её плавающей поверх видео — если запись сольют,
// видно, чей аккаунт. Пусто = без вотермарка (напр. на превью-ссылке).
export const WatermarkContext = React.createContext<string>('');

// Картинки лежат в /public/formula/img/... ; в контенте путь вида assets/img/...
function imgSrc(src: string): string {
  return '/formula/' + src.replace(/^assets\//, '');
}

type NavFn = (slug: string, anchor?: string) => void;

export function RichText({ rich, onNav }: { rich: Rich[]; onNav: NavFn }) {
  return (
    <>
      {rich.map((r, i) => {
        let node: React.ReactNode = r.text;
        if (r.bold) node = <strong key={i}>{node}</strong>;
        if (r.italic) node = <em key={i}>{node}</em>;
        if (r.link) {
          if (r.link.to) {
            const to = r.link.to;
            const anchor = r.link.anchor;
            return (
              <a
                key={i}
                className="fx-link"
                href={`?p=${to}${anchor ? '#' + anchor : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNav(to, anchor);
                }}
              >
                {node}
              </a>
            );
          }
          if (r.link.href) {
            return (
              <a key={i} className="fx-link" href={r.link.href} target="_blank" rel="noopener noreferrer">
                {node}
              </a>
            );
          }
        }
        return <React.Fragment key={i}>{node}</React.Fragment>;
      })}
    </>
  );
}

function VideoBlock({ loomId }: { loomId: string }) {
  const watermark = React.useContext(WatermarkContext);
  const kin = VIDEO_MAP[loomId];
  let src: string;
  if (kin) {
    src = `https://kinescope.io/embed/${kin}`;
    if (watermark) src += `?watermark=${encodeURIComponent(watermark)}`;
  } else {
    src = `https://www.loom.com/embed/${loomId}`;
  }
  return (
    <div className="fx-video">
      <iframe
        src={src}
        title="Видео"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function ListBlock({ ordered, items, onNav }: { ordered: boolean; items: ListItem[]; onNav: NavFn }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={ordered ? 'fx-ol' : 'fx-ul'}>
      {items.map((it, i) => (
        <li key={i}>
          {it.rich && it.rich.length > 0 && <RichText rich={it.rich} onNav={onNav} />}
          {it.children && it.children.length > 0 && (
            <div className="fx-li-children">
              <RenderBlocks blocks={it.children} onNav={onNav} />
            </div>
          )}
        </li>
      ))}
    </Tag>
  );
}

const CALLOUT_ARROWS: Record<string, string> = { '➡️': '→', '⬅️': '←' };

export function RenderBlocks({ blocks, onNav }: { blocks: Block[]; onNav: NavFn }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'p':
            return (
              <p className="fx-p" key={i}>
                <RichText rich={b.rich} onNav={onNav} />
              </p>
            );
          case 'heading': {
            const lvl = b.level === 3 ? 3 : 2;
            const H = (lvl === 3 ? 'h3' : 'h2') as 'h2' | 'h3';
            return (
              <H className={`fx-h${lvl}`} id={b.anchor} key={i}>
                <RichText rich={b.rich} onNav={onNav} />
              </H>
            );
          }
          case 'video':
            return <VideoBlock key={i} loomId={b.loomId} />;
          case 'image':
            // eslint-disable-next-line @next/next/no-img-element
            return <img className="fx-img" key={i} src={imgSrc(b.src)} alt={b.alt || ''} loading="lazy" />;
          case 'file':
            return (
              <div className={`fx-file ${b.available ? '' : 'fx-file-soon'}`} key={i}>
                <span className="fx-file-ic">📎</span>
                <span className="fx-file-name">{b.name}</span>
                <span className="fx-file-arr">{b.available ? '↓' : 'скоро'}</span>
              </div>
            );
          case 'list':
            return <ListBlock key={i} ordered={b.ordered} items={b.items} onNav={onNav} />;
          case 'toggle':
            return (
              <details className={`fx-toggle fx-c-${b.color || ''}`} key={i}>
                <summary className="fx-toggle-sum">{b.title}</summary>
                <div className="fx-toggle-body">
                  <RenderBlocks blocks={b.children} onNav={onNav} />
                </div>
              </details>
            );
          case 'callout': {
            const ic = b.icon || '';
            return (
              <div className={`fx-callout fx-c-${b.color || 'gray_bg'}`} key={i}>
                {ic && <span className="fx-callout-ic">{CALLOUT_ARROWS[ic] || ic}</span>}
                <div className="fx-callout-body">
                  <RenderBlocks blocks={b.children} onNav={onNav} />
                </div>
              </div>
            );
          }
          case 'childpage':
            return (
              <a
                className="fx-childpage"
                key={i}
                href={`?p=${b.to}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNav(b.to);
                }}
              >
                <span className="fx-childpage-ic">▸</span>
                <span className="fx-childpage-title">{b.title}</span>
                <span className="fx-childpage-arr">→</span>
              </a>
            );
          case 'divider':
            return <hr className="fx-hr" key={i} />;
          default:
            return null;
        }
      })}
    </>
  );
}
