import type { Metadata } from 'next';

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="legal">
      {children}
      <footer className="legal-foot">
        <p>ИП Копосов Александр Эдуардович</p>
        <p>ИНН 143531925720 · ОГРН 323390000060641</p>
        <p>thesashatoyz@gmail.com</p>
        <p>
          <a href="/legal/privacy">Политика</a> · <a href="/legal/consent">Согласие на обработку данных</a> ·{' '}
          <a href="/legal/ads">Согласие на рекламу</a>
        </p>
      </footer>
      <style>{`
        html, body {
          background: #fffcfa !important;
          height: auto !important; min-height: 100% !important;
          overflow-y: auto !important; position: static !important;
        }
        .legal {
          max-width: 680px; margin: 0 auto; padding: 40px 16px 64px; color: #1c1917;
          font: 16px/1.6 Inter, system-ui, sans-serif;
        }
        .legal h1 { font-size: 26px; line-height: 1.2; margin: 0 0 8px; }
        .legal h2 { font-size: 18px; margin: 28px 0 8px; }
        .legal p, .legal ul { margin: 0 0 12px; }
        .legal ul { padding-left: 20px; }
        .legal a { color: #a8522c; }
        .legal-date { color: #78716c; font-size: 14px; }
        .legal-foot { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e7e1db; color: #78716c; font-size: 14px; }
        .legal-foot p { margin: 0 0 4px; }
      `}</style>
    </main>
  );
}
