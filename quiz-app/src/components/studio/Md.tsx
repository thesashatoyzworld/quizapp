import s from './studio.module.css';

/**
 * Tiny markdown for Studio texts: **bold**, `code`, «> » quotes, «- » bullets,
 * «1. » steps, «### » headings, tables as rows. Builds React nodes, no HTML injection.
 */
export default function Md({ text }: { text: string }) {
  const inline = (t: string) =>
    t.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) =>
      p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong>
        : p.startsWith('`') && p.endsWith('`') && p.length > 1 ? <code key={i} className={s.mdCode}>{p.slice(1, -1)}</code>
          : p);
  return (
    <div className={s.md}>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className={s.mdGap} />;
        if (/^\|[-| ]+\|$/.test(line.trim())) return null;
        if (line.startsWith('|')) return <div key={i} className={s.mdRow}>{line.split('|').slice(1, -1).map((c, j) => <span key={j}>{inline(c.trim())}</span>)}</div>;
        if (line.startsWith('> ')) return <blockquote key={i} className={s.mdQuote}>{inline(line.slice(2))}</blockquote>;
        const step = line.match(/^(\d+)\. (.*)$/);
        if (step) return <div key={i} className={s.mdStep}><span className={s.mdStepNum}>{step[1]}</span><span>{inline(step[2])}</span></div>;
        const bullet = line.match(/^(\s*)- (.*)$/);
        if (bullet) return <div key={i} className={s.mdLi} style={{ paddingLeft: 12 + bullet[1].length * 6 }}>{inline(bullet[2])}</div>;
        if (line.startsWith('### ')) return <h4 key={i} className={s.mdH}>{line.slice(4)}</h4>;
        return <p key={i} className={s.mdP}>{inline(line)}</p>;
      })}
    </div>
  );
}
