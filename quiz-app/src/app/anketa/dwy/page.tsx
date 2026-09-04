'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  WHO_OPTIONS, HAS_PRODUCT_OPTIONS, LEVELS,
  INCOME_OPTIONS, HOURS_OPTIONS, FOLLOWING_OPTIONS, READINESS_OPTIONS,
  FOLLOWERS_SCALE, formatFollowers,
  DWY_MODES, DWY_FIELDS, isDwyKind, type DwyField,
} from '@/content/dwy';

// Telegram Login Widget убран намеренно: в мобильном браузере он не видит
// сессию из приложения и уводит на oauth.telegram.org вводить номер и код.
// Трафик идёт из шапки профиля в Instagram — на таком трении отваливается
// большинство. Контакт человек вписывает руками.

function Field({ label, optional, children }: {
  label: string; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="dwy-field">
      <label className="dwy-label">
        {label}
        {optional && <span className="dwy-opt">необязательно</span>}
      </label>
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

/**
 * Подписчики слайдером.
 *
 * Цифру пишут неохотно и округляют в свою пользу, а из списка «до 1000 / до
 * 10 000» не выбрать тому, у кого 1 200. Слайдер отвечается одним движением
 * и сам показывает, что маленькая цифра здесь нормальна.
 *
 * Двигаем не число, а номер ступени: между 100 и 500 разница решающая, между
 * 300 и 500 тысячами — уже нет, и на линейной шкале весь рабочий диапазон
 * уместился бы в первый сантиметр.
 */
function Followers({ value, touched, onChange }: {
  value: number; touched: boolean; onChange: (v: number) => void;
}) {
  const index = Math.max(0, FOLLOWERS_SCALE.indexOf(value));
  return (
    <div className="dwy-slider">
      <div className={touched ? 'dwy-value' : 'dwy-value-off'}>
        {touched ? formatFollowers(value) : 'перетащите ползунок'}
      </div>
      <input
        type="range"
        className="dwy-range"
        min={0}
        max={FOLLOWERS_SCALE.length - 1}
        step={1}
        value={index}
        onChange={(e) => onChange(FOLLOWERS_SCALE[Number(e.target.value)])}
      />
      <div className="dwy-scale">
        <span>0</span>
        <span>1 000</span>
        <span>50 000</span>
        <span>1 млн</span>
      </div>
    </div>
  );
}

function DwyInner() {
  const params = useSearchParams();
  const source = params.get('from') || 'direct';
  // Одна страница на два потока: без параметра — менторство, ?kind=t2|t3 —
  // лист ожидания закрытого тарифа. Вопросы те же, отличаются шапка и метка.
  const rawKind = params.get('kind');
  const kind = isDwyKind(rawKind) ? rawKind : 'mentor';
  const mode = DWY_MODES[kind];

  const [name, setName] = useState('');
  // Ссылка на личку: по ней уходим сами и на неё же смотрит запасная кнопка.
  const [handoffUrl, setHandoffUrl] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [who, setWho] = useState('');
  const [hasProduct, setHasProduct] = useState('');
  const [product, setProduct] = useState('');
  const [level, setLevel] = useState(0);
  const [tried, setTried] = useState('');
  const [want, setWant] = useState('');
  const [income, setIncome] = useState('');
  const [hours, setHours] = useState('');
  const [following, setFollowing] = useState('');
  // Ползунок стоит на нуле и до первого касания это не ответ, а его отсутствие:
  // «совсем нет» — тоже осмысленная цифра, и отличать её надо явно.
  const [followers, setFollowers] = useState(0);
  const [followersSet, setFollowersSet] = useState(false);
  const [readiness, setReadiness] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  // Остальные вопросы раскрывает тот, кто хочет, чтобы Саша посмотрел его
  // до открытия набора. У менторства скрывать нечего — там видно всё.
  const [expanded, setExpanded] = useState(false);

  // Какие поля обязательны — решает режим. У менторства это девять вопросов,
  // у листа ожидания только имя и контакт: человек просит напомнить о наборе,
  // а не проходит отбор, и стена из девяти вопросов его просто разворачивает.
  const values: Record<DwyField, string> = {
    name, contact, phone, instagram, who, hasProduct,
    level: level ? String(level) : '', tried, want, income, hours,
    following, readiness,
    followers: followersSet ? String(followers) : '',
  };
  const need = (f: DwyField) => mode.required.includes(f);
  const ready = contact.trim().length >= 3
    && mode.required.every((f) => values[f].trim().length > 0);

  const hidden = DWY_FIELDS.filter((f) => !mode.visible.includes(f));

  // Пометку «необязательно» ставим только тому, что видно сразу: внутри
  // раскрытого блока необязательно вообще всё, и одиннадцать одинаковых
  // пометок там только шумят.
  function renderField(f: DwyField) {
    const optional = mode.visible.includes(f) && !need(f);
    switch (f) {
      case 'name':
        return (
          <Field key={f} label="Как вас зовут" optional={optional}>
            <input className="dwy-input" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
        );
      case 'contact':
        return (
          <Field key={f} label="Ваш телеграм" optional={optional}>
            <input className="dwy-input" placeholder="@username"
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              value={contact} onChange={(e) => setContact(e.target.value)} />
            <p className="dwy-hint">Туда я напишу. Нет юзернейма — оставьте почту.</p>
          </Field>
        );
      // Телефон и инстаграм не обязательны нигде: юзернейм правда пишут
      // с опечатками, но номер на холодном трафике отдают неохотно —
      // на обязательном поле теряем больше, чем страхуем.
      case 'phone':
        return (
          <Field key={f} label="Ваш телефон" optional={optional}>
            <input className="dwy-input" type="tel" inputMode="tel"
              placeholder="+7 999 111-22-33" autoComplete="tel"
              value={phone} onChange={(e) => setPhone(e.target.value)} />
            <p className="dwy-hint">Запасной канал, если в телеграме не дойдёт.</p>
          </Field>
        );
      case 'instagram':
        return (
          <Field key={f} label="Ваш инстаграм" optional={optional}>
            <input className="dwy-input" placeholder="@nickname"
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              value={instagram} onChange={(e) => setInstagram(e.target.value)} />
            <p className="dwy-hint">Посмотрю ваш блог до того, как отвечу.</p>
          </Field>
        );
      case 'who':
        return (
          <Field key={f} label="Кто вы" optional={optional}>
            <Chips options={WHO_OPTIONS} value={who} onChange={setWho} />
          </Field>
        );
      case 'hasProduct':
        return (
          <Field key={f} label="Есть ли у вас услуга или продукт" optional={optional}>
            <Chips options={HAS_PRODUCT_OPTIONS} value={hasProduct} onChange={setHasProduct} />
            {(hasProduct === 'да' || hasProduct === 'в процессе') && (
              <input className="dwy-input" placeholder="Какой?"
                value={product} onChange={(e) => setProduct(e.target.value)} />
            )}
          </Field>
        );
      case 'level':
        return (
          <Field key={f} label="На каком вы уровне" optional={optional}>
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
        );
      case 'tried':
        return (
          <Field key={f} label="Что уже пробовали с контентом и чем закончилось" optional={optional}>
            <textarea className="dwy-area" rows={4}
              value={tried} onChange={(e) => setTried(e.target.value)} />
          </Field>
        );
      case 'want':
        return (
          <Field key={f} label="Что хотите получить через 3 месяца" optional={optional}>
            <textarea className="dwy-area" rows={4}
              value={want} onChange={(e) => setWant(e.target.value)} />
          </Field>
        );
      case 'income':
        return (
          <Field key={f} label="Сколько зарабатываете сейчас" optional={optional}>
            <Chips options={INCOME_OPTIONS} value={income} onChange={setIncome} />
          </Field>
        );
      case 'hours':
        return (
          <Field key={f} label="Сколько часов в неделю готовы вкладывать" optional={optional}>
            <Chips options={HOURS_OPTIONS} value={hours} onChange={setHours} />
          </Field>
        );
      case 'followers':
        return (
          <Field key={f} label="Сколько подписчиков в инстаграме" optional={optional}>
            <Followers
              value={followers}
              touched={followersSet}
              onChange={(v) => {
                setFollowers(v);
                setFollowersSet(true);
              }}
            />
          </Field>
        );
      case 'following':
        return (
          <Field key={f} label="Как давно вы на меня подписаны" optional={optional}>
            <Chips options={FOLLOWING_OPTIONS} value={following} onChange={setFollowing} />
          </Field>
        );
      case 'readiness':
        return (
          <Field key={f} label="Насколько вы готовы к покупке" optional={optional}>
            <Chips options={READINESS_OPTIONS} value={readiness} onChange={setReadiness} />
          </Field>
        );
    }
  }

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
          kind,
          answers: {
            name, contact, phone, instagram,
            who, hasProduct, product, level, tried, want, income, hours,
            following, readiness,
            followers: followersSet ? followers : null,
          },
        }),
      });
      if (!res.ok) {
        setError('Не отправилось. Попробуйте ещё раз.');
        setSending(false);
        return;
      }
      const data = await res.json().catch(() => ({}));
      // Номером анкеты подписано сообщение, которым человек начинает
      // переписку: по нему бот на том конце знает, кто пишет.
      const id = typeof data?.id === 'number' ? data.id : null;

      // Человека не спрашиваем, хочет ли он написать — открываем телеграм
      // сами. Разговор всё равно начинать ему: бот постучаться первым не
      // может. Экран «спасибо» при этом отрисовывается: если переход не
      // сработал (Instagram WebView такое умеет), на нём осталась кнопка.
      if (mode.handoff) {
        const text = `привет) анкета на менторство - ${name.trim()}${id ? `, #${id}` : ''}`;
        const url = `https://t.me/${mode.handoff.account}?text=${encodeURIComponent(text)}`;
        setHandoffUrl(url);
        setSent(true);
        window.location.assign(url);
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
          {mode.thanks.map((line, i) => (
            <p key={i} className={i === 0 ? 'dwy-done-h' : 'dwy-done-p'}>{line}</p>
          ))}
          {mode.handoff && handoffUrl && (
            <div className="dwy-handoff">
              <p className="dwy-handoff-note">{mode.handoff.note}</p>
              <a className="dwy-handoff-btn" href={handoffUrl}>{mode.handoff.button}</a>
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="dwy-intro">
            <h1 className="dwy-h1">{mode.title}</h1>
            {mode.argument.map((line, i) => <p key={i} className="dwy-arg">{line}</p>)}
          </section>

          <form className="dwy-form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            {mode.visible.map(renderField)}

            {expanded && hidden.map(renderField)}

            {/* Ссылка стоит НАД кнопкой: раскрытые вопросы появляются выше неё,
                и кнопка всегда остаётся последним, что видит человек. */}
            {!expanded && hidden.length > 0 && mode.moreLabel && (
              <button type="button" className="dwy-more" onClick={() => setExpanded(true)}>
                {mode.moreLabel}
              </button>
            )}

            {error && <p className="dwy-err">{error}</p>}

            <button className="dwy-submit" type="submit" disabled={!ready || sending}>
              {sending ? 'Отправляю…' : mode.submitLabel}
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
        /* Пометка живёт в строке вопроса и не должна с ним спорить:
           её задача — снять напряжение, а не привлечь внимание. */
        .dwy-opt {
          font-weight: 400; font-size: 12.5px; color: var(--mut);
          margin-left: 8px; white-space: nowrap;
        }
        /* Ссылка, а не вторая кнопка: рядом с «Записаться» она не должна
           спорить за внимание — записаться можно и без неё. */
        .dwy-more {
          display: block; width: 100%; text-align: left; cursor: pointer;
          font-family: inherit; font-size: 14.5px; line-height: 1.45;
          color: var(--acc); background: none; border: none;
          border-bottom: 1px dashed currentColor; padding: 0 0 2px;
          margin: 4px 0 22px; align-self: flex-start;
        }
        .dwy-more:active { opacity: .6; }
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
        /* Слайдер подписчиков. Значение стоит НАД дорожкой: на телефоне палец
           закрывает ползунок, и подпись под ним человек просто не видит. */
        .dwy-slider { margin-top: 10px; }
        .dwy-value {
          font-size: 24px; font-weight: 800; color: var(--acc);
          letter-spacing: -0.02em; line-height: 1.1;
        }
        .dwy-value-off { font-size: 15px; font-weight: 500; color: var(--mut); line-height: 1.6; }
        .dwy-range {
          width: 100%; margin: 14px 0 0; height: 4px; border-radius: 2px;
          background: var(--line); outline: none;
          -webkit-appearance: none; appearance: none;
        }
        /* Кружок крупный намеренно: 26px это минимум, за который уверенно
           берёшься пальцем, не целясь. */
        .dwy-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 26px; height: 26px; border-radius: 50%; cursor: pointer;
          background: var(--acc); border: 3px solid #fff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, .22);
        }
        .dwy-range::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%; cursor: pointer;
          background: var(--acc); border: 3px solid #fff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, .22);
        }
        .dwy-scale {
          display: flex; justify-content: space-between;
          font-size: 11.5px; color: var(--mut); margin-top: 7px;
        }
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
        .dwy-handoff { margin-top: 28px; }
        .dwy-handoff-note { font-size: 16px; color: var(--mut); margin: 0 0 14px; line-height: 1.5; }
        .dwy-handoff-btn {
          display: inline-block; padding: 15px 26px; border-radius: 12px;
          background: var(--fg); color: var(--bg); text-decoration: none;
          font-size: 17px; font-weight: 600;
        }
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
