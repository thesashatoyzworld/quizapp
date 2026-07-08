'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Content, NavNode, Page } from '@/content/formula/types';
import { RenderBlocks } from './blocks';

// Плоский порядок слугов (для клавиш и валидности) берём из prev/next в данных.

function NavTree({
  nodes,
  active,
  onNav,
  depth = 0,
}: {
  nodes: NavNode[];
  active: string;
  onNav: (slug: string) => void;
  depth?: number;
}) {
  return (
    <ul className="fx-nav-list">
      {nodes.map((n) => (
        <li key={n.slug}>
          <a
            href={`?p=${n.slug}`}
            className={`fx-nav-item fx-d${depth} ${active === n.slug ? 'fx-nav-active' : ''} fx-c-${n.color || ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNav(n.slug);
            }}
          >
            {n.color && <span className="fx-nav-chip" />}
            <span className="fx-nav-title">{n.title}</span>
          </a>
          {n.children && n.children.length > 0 && (
            <NavTree nodes={n.children} active={active} onNav={onNav} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

// Плоский список [slug,title] всех узлов навигации (для авто-индекса групп).
function flattenNav(nodes: NavNode[], out: NavNode[] = []): NavNode[] {
  for (const n of nodes) {
    out.push(n);
    if (n.children) flattenNav(n.children, out);
  }
  return out;
}

export default function FormulaApp({ content }: { content: Content }) {
  const { nav, pages } = content;
  const firstSlug = nav[0]?.slug || 'vvedenie';
  const [active, setActive] = useState<string>(firstSlug);
  const [menuOpen, setMenuOpen] = useState(false);
  const pendingAnchor = useRef<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const navTo = useCallback(
    (slug: string, anchor?: string) => {
      if (!pages[slug] && !flattenNav(nav).some((n) => n.slug === slug)) return;
      pendingAnchor.current = anchor || null;
      setActive(slug);
      setMenuOpen(false);
      try {
        window.history.replaceState(null, '', `?p=${slug}${anchor ? '#' + anchor : ''}`);
      } catch {
        /* noop */
      }
    },
    [nav, pages],
  );

  // Первичная инициализация из URL (?p=slug#anchor).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('p');
    const hash = window.location.hash.replace(/^#/, '');
    if (p && (pages[p] || flattenNav(nav).some((n) => n.slug === p))) {
      pendingAnchor.current = hash || null;
      setActive(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // После смены страницы — прокрутка к якорю или вверх.
  useEffect(() => {
    const a = pendingAnchor.current;
    pendingAnchor.current = null;
    requestAnimationFrame(() => {
      if (a) {
        const el = document.getElementById(a);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
      mainRef.current?.scrollTo({ top: 0 });
      window.scrollTo({ top: 0 });
    });
  }, [active]);

  const page: Page | undefined = pages[active];
  const groupNode = !page ? flattenNav(nav).find((n) => n.slug === active) : undefined;

  return (
    <div className="fx-shell">
      <button className="fx-burger" onClick={() => setMenuOpen((v) => !v)} aria-label="Меню">
        {menuOpen ? '✕' : '☰'} Разделы
      </button>

      <aside className={`fx-side ${menuOpen ? 'fx-side-open' : ''}`}>
        <a
          className="fx-side-brand"
          href={`?p=${firstSlug}`}
          onClick={(e) => {
            e.preventDefault();
            navTo(firstSlug);
          }}
        >
          Формула<br />вирусного<br />контента
        </a>
        <NavTree nodes={nav} active={active} onNav={navTo} />
      </aside>

      <main className="fx-main" ref={mainRef}>
        <article className="fx-article">
          {page ? (
            <>
              <h1 className={`fx-title fx-c-${page.color || ''}`}>{page.title}</h1>
              <RenderBlocks blocks={page.blocks} onNav={navTo} />
              <PrevNext page={page} pages={pages} onNav={navTo} />
            </>
          ) : groupNode ? (
            <>
              <h1 className={`fx-title fx-c-${groupNode.color || ''}`}>{groupNode.title}</h1>
              <div className="fx-index">
                {(groupNode.children || []).map((ch) => (
                  <a
                    key={ch.slug}
                    className="fx-index-card"
                    href={`?p=${ch.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navTo(ch.slug);
                    }}
                  >
                    <span className="fx-index-title">{ch.title}</span>
                    <span className="fx-index-arr">→</span>
                  </a>
                ))}
              </div>
            </>
          ) : (
            <p className="fx-p">Раздел не найден.</p>
          )}
        </article>
      </main>
    </div>
  );
}

function PrevNext({
  page,
  pages,
  onNav,
}: {
  page: Page;
  pages: Record<string, Page>;
  onNav: (slug: string) => void;
}) {
  const prev = page.prev ? pages[page.prev] : undefined;
  const next = page.next ? pages[page.next] : undefined;
  if (!prev && !next) return null;
  return (
    <nav className="fx-prevnext">
      {prev ? (
        <a
          className="fx-pn fx-pn-prev"
          href={`?p=${prev.slug}`}
          onClick={(e) => {
            e.preventDefault();
            onNav(prev.slug);
          }}
        >
          <span className="fx-pn-lab">← Назад</span>
          <span className="fx-pn-title">{prev.title}</span>
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a
          className="fx-pn fx-pn-next"
          href={`?p=${next.slug}`}
          onClick={(e) => {
            e.preventDefault();
            onNav(next.slug);
          }}
        >
          <span className="fx-pn-lab">Далее →</span>
          <span className="fx-pn-title">{next.title}</span>
        </a>
      ) : (
        <span />
      )}
    </nav>
  );
}
