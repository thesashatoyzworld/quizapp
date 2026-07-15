'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DWY_TITLE, DWY_ARGUMENT, WHO_OPTIONS, HAS_PRODUCT_OPTIONS, LEVELS,
  INCOME_OPTIONS, HOURS_OPTIONS, DWY_THANKS,
} from '@/content/dwy';

// Telegram Login Widget убран намеренно: в мобильном браузере он не видит
// сессию из приложения и уводит на oauth.telegram.org вводить номер и код.
// Трафик идёт из шапки профиля в Instagram — на таком трении отваливается
// большинство. Контакт человек вписывает руками.

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="dwy-field">
      <label className="dwy-label">{label}</label>
      {children}
    </div>
  );
}

function Chips({ options, value, onChange }: {
  options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="dwy-chips">
      {options.map((o) => (
        <button key={o} type="button"
          className={`dwy-chip ${value === o ? 'dwy-chip-on' : ''}`}
          onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

function DwyInner() {
  const params = useSearchParams();
  const source = params.get('from') || 'direct';

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [who, setWho] = useState('');
  const [hasProduct, setHasProduct] = useState('');
  const [product, setProduct] = useState('');
  const [level, setLevel] = useState(0);
  const [tried, setTried] = useState('');
  const [want, setWant] = useState('');
  const [income, setIncome] = useState('');
  const [hours, setHours] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const ready = !!name.trim() && contact.trim().length >= 3 && !!who && !!hasProduct
    && level > 0 && !!tried.trim() && !!want.trim() && !!income && !!hours;

  async function submit() {
    if (!ready || sending) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/dwy-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          answers: { name, contact, who, hasProduct, product, level, tried, want, income, hours },
        }),
      });
      if (!res.ok) {
        setError('Не отправилось. Попробуйте ещё раз.');
        setSending(false);
        return;
      }
      setSent(true);
    } catch {
      setError('Не отправилось. Проверьте связь и попробуйте ещё раз.');
      setSending(false);
    }
  }

  return (
    <main className="dwy">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&subset=cyrillic,latin&display=swap" rel="stylesheet" />

      {sent ? (
        <section className="dwy-done">
          {DWY_THANKS.map((line, i) => (
            <p key={i} className={i === 0 ? 'dwy-done-h' : 'dwy-done-p'}>{line}</p>
          ))}
        </section>
      ) : (
        <>
          <section className="dwy-intro">
            <h1 className="dwy-h1">{DWY_TITLE}</h1>
            {DWY_ARGUMENT.map((line, i) => <p key={i} className="dwy-arg">{line}</p>)}
          </section>

          <form className="dwy-form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <Field label="Как вас зовут">
              <input className="dwy-input" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>

            <Field label="Ваш телеграм">
              <input className="dwy-input" placeholder="@username"
                autoCapitalize="none" autoCorrect="off" spellCheck={false}
                value={contact} onChange={(e) => setContact(e.target.value)} />
              <p className="dwy-hint">Туда я напишу. Нет юзернейма — оставьте почту.</p>
            </Field>

            <Field label="Кто вы">
              <Chips options={WHO_OPTIONS} value={who} onChange={setWho} />
            </Field>

            <Field label="Есть ли у вас услуга или продукт">
              <Chips options={HAS_PRODUCT_OPTIONS} value={hasProduct} onChange={setHasProduct} />
              {(hasProduct === 'да' || hasProduct === 'в процессе') && (
                <input className="dwy-input" placeholder="Какой?"
                  value={product} onChange={(e) => setProduct(e.target.value)} />
              )}
            </Field>

            <Field label="На каком вы уровне">
              <div className="dwy-levels">
                {LEVELS.map((l, i) => (
                  <button key={l} type="button"
                    className={`dwy-level ${level === i + 1 ? 'dwy-level-on' : ''}`}
                    onClick={() => setLevel(i + 1)}>
                    <span className="dwy-level-n">{i + 1}</span>
                    <span>{l}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Что уже пробовали с контентом и чем закончилось">
              <textarea className="dwy-area" rows={4}
                value={tried} onChange={(e) => setTried(e.target.value)} />
            </Field>

            <Field label="Что хотите получить через 3 месяца">
              <textarea className="dwy-area" rows={4}
                value={want} onChange={(e) => setWant(e.target.value)} />
            </Field>

            <Field label="Сколько зарабатываете сейчас">
              <Chips options={INCOME_OPTIONS} value={income} onChange={setIncome} />
            </Field>

            <Field label="Сколько часов в неделю готовы вкладывать">
              <Chips options={HOURS_OPTIONS} value={hours} onChange={setHours} />
            </Field>

            {error && <p className="dwy-err">{error}</p>}

            <button className="dwy-submit" type="submit" disabled={!ready || sending}>
              {sending ? 'Отправляю…' : 'Отправить анкету'}
            </button>
          </form>
        </>
      )}

      <style>{`
        /* globals.css запирает html/body в height:100% под квиз в Mini App —
           длинная анкета в такой странице не скроллится. Тот же обход, что в /dostup. */
        html, body {
          background: #fffcfa !important;
          height: auto !important; min-height: 100% !important;
          overflow-y: auto !important; position: static !important;
        }
        .dwy {
          --bg: #fffcfa; --fg: #1c1917; --mut: #78716c;
          --acc: #c4653a; --line: #e7e1db; --surf: #ffffff;
          max-width: 620px; margin: 0 auto; padding: 40px 18px 80px;
          font-family: 'Inter', system-ui, sans-serif; color: var(--fg);
          background: var(--bg); min-height: 100svh;
        }
        .dwy * { box-sizing: border-box; }
        .dwy-intro { margin-bottom: 30px; }
        .dwy-h1 {
          font-size: 27px; font-weight: 800; letter-spacing: -0.025em;
          line-height: 1.15; margin: 0 0 18px;
        }
        /* Первая строка аргумента — хук, держим её крупнее и плотнее остальных,
           но ниже заголовка: сначала «куда я попал», потом «почему заполняю». */
        .dwy-arg { font-size: 18px; line-height: 1.5; margin: 0 0 12px; font-weight: 400; }
        .dwy-arg:first-of-type { font-size: 20px; font-weight: 600; }
        .dwy-field { margin-bottom: 26px; }
        .dwy-label { display: block; font-weight: 700; font-size: 15.5px; margin-bottom: 10px; }
        .dwy-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .dwy-chip {
          cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500;
          padding: 9px 14px; border-radius: 999px; border: 1px solid var(--line);
          background: var(--surf); color: var(--fg); transition: .12s;
        }
        .dwy-chip:hover { border-color: var(--acc); }
        .dwy-chip-on { background: var(--acc); border-color: var(--acc); color: #fff; }
        .dwy-levels { display: grid; gap: 8px; }
        .dwy-level {
          display: flex; align-items: center; gap: 11px; text-align: left; cursor: pointer;
          font-family: inherit; font-size: 14.5px; padding: 12px 14px; border-radius: 11px;
          border: 1px solid var(--line); background: var(--surf); color: var(--fg); transition: .12s;
        }
        .dwy-level:hover { border-color: var(--acc); }
        .dwy-level-on { border-color: var(--acc); background: #fdf3ee; }
        .dwy-level-n {
          flex: 0 0 auto; width: 24px; height: 24px; border-radius: 50%;
          display: grid; place-items: center; font-size: 12px; font-weight: 700;
          background: #f2ece7; color: var(--mut);
        }
        .dwy-level-on .dwy-level-n { background: var(--acc); color: #fff; }
        .dwy-input, .dwy-area {
          width: 100%; font-family: inherit; font-size: 16px; color: var(--fg);
          background: var(--surf); border: 1px solid var(--line);
          border-radius: 10px; padding: 12px 14px; margin-top: 8px; resize: vertical;
        }
        .dwy-input:focus, .dwy-area:focus { outline: none; border-color: var(--acc); }
        .dwy-hint { color: var(--mut); font-size: 12.5px; margin: 7px 0 0; line-height: 1.4; }
        .dwy-err { color: #b3261e; font-size: 14px; margin: 0 0 14px; }
        .dwy-submit {
          width: 100%; cursor: pointer; border: none; font-family: inherit;
          font-size: 16.5px; font-weight: 700; padding: 15px; border-radius: 11px;
          background: var(--acc); color: #fff; transition: opacity .15s; margin-top: 6px;
        }
        .dwy-submit:disabled { opacity: .4; cursor: default; }
        .dwy-submit:not(:disabled):active { transform: translateY(1px); }
        .dwy-done { padding: 60px 0; }
        .dwy-done-h { font-size: 25px; font-weight: 700; margin: 0 0 12px; letter-spacing: -0.02em; }
        .dwy-done-p { font-size: 18px; color: var(--mut); margin: 0; line-height: 1.5; }
        @media (max-width: 560px) {
          .dwy { padding: 28px 15px 60px; }
          .dwy-h1 { font-size: 24px; }
          .dwy-arg:first-of-type { font-size: 18.5px; }
          .dwy-arg { font-size: 17px; }
        }
      `}</style>
    </main>
  );
}

export default function DwyAnketaPage() {
  return <Suspense fallback={null}><DwyInner /></Suspense>;
}
