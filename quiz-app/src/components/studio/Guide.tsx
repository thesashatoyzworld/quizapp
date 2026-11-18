'use client';

// «Как пользоваться»: the Studio guide. Danya lands here on his first visit.
// The MCP link shown is always the viewer's own (built on the server).

import { useState } from 'react';
import { clientSteps, guideSections } from '@/lib/studio/guide';
import Md from './Md';
import s from './studio.module.css';

export default function Guide({ mcpUrl, libraryOpen, onDone }: { mcpUrl: string | null; libraryOpen: boolean; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const sections = guideSections({ libraryOpen });

  async function copy() {
    if (!mcpUrl) return;
    try {
      await navigator.clipboard.writeText(mcpUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: select the text so a long press / Cmd+C works
      (document.getElementById('studio-mcp-url') as HTMLInputElement | null)?.select();
    }
  }

  return (
    <div className={s.guide}>
      <nav className={s.guideToc} aria-label="Разделы">
        {sections.map((sec) => <a key={sec.id} href={`#guide-${sec.id}`} className={s.guideTocLink}>{sec.title}</a>)}
      </nav>

      {sections.map((sec) => (
        <section key={sec.id} id={`guide-${sec.id}`} className={s.guideSection} aria-labelledby={`guide-h-${sec.id}`}>
          <h3 id={`guide-h-${sec.id}`} className={s.guideTitle}>{sec.title}</h3>
          {sec.id === 'mcp' && mcpUrl && (
            <div className={s.mcpBox}>
              <label className={s.field} htmlFor="studio-mcp-url">Твоя ссылка MCP</label>
              <div className={s.inline}>
                <input id="studio-mcp-url" className={`${s.input} ${s.mcpUrl}`} value={mcpUrl} readOnly onFocus={(e) => e.target.select()} />
                <button className={s.btnPrimary} onClick={copy}>{copied ? 'Скопировано' : 'Скопировать'}</button>
              </div>
            </div>
          )}
          {sec.id === 'mcp' && !mcpUrl && <p className={s.muted}>Личная ссылка не настроена, напиши Саше.</p>}
          <Md text={sec.md} />
          {sec.id === 'mcp' && mcpUrl && (
            <div className={s.clients}>
              {clientSteps(mcpUrl).map((c) => (
                <details key={c.name} className={s.client}>
                  <summary className={s.clientName}>{c.name}</summary>
                  <Md text={c.md} />
                </details>
              ))}
            </div>
          )}
        </section>
      ))}

      <div className={s.saveBar}>
        <button className={s.btnPrimary} onClick={onDone}>Понятно, к расписанию</button>
      </div>
    </div>
  );
}
