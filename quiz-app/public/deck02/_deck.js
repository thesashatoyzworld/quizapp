/* ============================================================
   НОВЫЙ УРОВЕНЬ КОНТЕНТА — движок презентаций
   Каждый файл объявляет const SLIDES = [...] и вызывает Deck.build(SLIDES).

   Типы слайдов (k):
     cover  {t, sub}                       — обложка
     sec    {n, t}                         — разделитель ("часть", заголовок)
     st     {t, sub, sm|xs, dark, warm}    — тезис
     num    {t, sub, grey}                 — крупное число
     list   {kicker, t, items[], numbered} — список
     quote  {kicker, t, sub}               — врезка-история (t может быть массивом строк)
     img    {kicker, t, src, cap, h}       — картинка
     table  {kicker, t, head[], rows[][]}  — таблица (ячейка "+" => зелёная, "-" => красная)
     cards  {kicker, t, cards:[{h,p}]}     — карточки
     car    {kicker, t, items:[{src,h,p}]} — карусель: картинка + контекст под ней.
                                             ← → листают внутри неё, с последней уходят на след. слайд
     ix     {kicker, t, html, init}        — интерактив: html-строка + функция init(root)

   Общие поля: dark, warm, todo (пометка «нужен визуал», видна по клавише N)
   ============================================================ */
const Deck = (() => {
  const esc = s => String(s == null ? '' : s);

  function render(s) {
    const cls = ['dslide', s.dark ? 'dark' : '', s.warm ? 'warm' : '', s.k === 'cover' ? 'cover-slide' : ''].filter(Boolean).join(' ');
    let inner = '';
    const kicker = s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : '';

    switch (s.k) {
      case 'cover':
        inner = `<div class="c"><div class="cov">${esc(s.t)}</div>${s.sub ? `<div class="csub">${esc(s.sub)}</div>` : ''}</div>`;
        break;
      case 'sec':
        inner = `<div class="c">${s.n ? `<div class="secn">${esc(s.n)}</div>` : ''}<div class="sec">${esc(s.t)}</div>${s.sub ? `<div class="sub">${esc(s.sub)}</div>` : ''}</div>`;
        break;
      case 'num':
        inner = `<div class="c"><div class="num${s.grey ? ' grey' : ''}">${esc(s.t)}</div>${s.sub ? `<div class="sub">${esc(s.sub)}</div>` : ''}</div>`;
        break;
      case 'list': {
        const tag = s.numbered ? 'num-list' : '';
        const items = (s.items || []).map(i => `<div class="li">${esc(i)}</div>`).join('');
        inner = `<div class="c">${kicker}${s.t ? `<div class="st sm" style="margin-bottom:38px">${esc(s.t)}</div>` : ''}<div class="list ${tag}">${items}</div></div>`;
        break;
      }
      case 'quote': {
        const body = Array.isArray(s.t) ? s.t.map(l => `<div>${esc(l)}</div>`).join('') : esc(s.t);
        inner = `<div class="c">${kicker}<div class="quote">${body}</div>${s.sub ? `<div class="sub">${esc(s.sub)}</div>` : ''}</div>`;
        break;
      }
      case 'img':
        inner = `<div class="c">${kicker}${s.t ? `<div class="st xs" style="margin-bottom:30px">${esc(s.t)}</div>` : ''}
          <div class="imgwrap"><img src="${esc(s.src)}" alt="" ${s.h ? `style="max-height:${s.h}px"` : ''}></div>
          ${s.cap ? `<div class="imgcap">${esc(s.cap)}</div>` : ''}</div>`;
        break;
      case 'table': {
        const head = (s.head || []).map(h => `<th>${esc(h)}</th>`).join('');
        const rows = (s.rows || []).map(r => `<tr>${r.map(c => {
          const t = String(c);
          if (t.startsWith('+')) return `<td class="yes">${esc(t.slice(1))}</td>`;
          if (t.startsWith('-')) return `<td class="no">${esc(t.slice(1))}</td>`;
          return `<td>${esc(t)}</td>`;
        }).join('')}</tr>`).join('');
        inner = `<div class="c">${kicker}${s.t ? `<div class="st xs" style="margin-bottom:30px">${esc(s.t)}</div>` : ''}
          <table class="t"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
        break;
      }
      case 'cards': {
        const cards = (s.cards || []).map(c => `<div class="card"><h4>${esc(c.h)}</h4><p>${esc(c.p)}</p></div>`).join('');
        inner = `<div class="c">${kicker}${s.t ? `<div class="st sm" style="margin-bottom:40px">${esc(s.t)}</div>` : ''}<div class="cards">${cards}</div></div>`;
        break;
      }
      case 'car': {
        const items = s.items || [];
        const frames = items.map((it, i) =>
          `<figure class="cfr${i === 0 ? ' on' : ''}"><img src="${esc(it.src)}" alt="">
             <figcaption>${it.h ? `<b>${esc(it.h)}</b>` : ''}${it.p ? `<span>${esc(it.p)}</span>` : ''}</figcaption></figure>`).join('');
        const dots = items.map((_, i) => `<button class="cdot${i === 0 ? ' on' : ''}" data-i="${i}"></button>`).join('');
        inner = `<div class="c">${kicker}${s.t ? `<div class="st xs" style="margin-bottom:24px">${esc(s.t)}</div>` : ''}
          <div class="carousel" data-i="0" data-n="${items.length}">
            <div class="cfrs">${frames}</div>
            <div class="cbar">
              <button class="carrow" data-d="-1" title="назад">‹</button>
              <div class="cdots">${dots}</div>
              <button class="carrow" data-d="1" title="дальше">›</button>
              <div class="ccnt">1 / ${items.length}</div>
            </div>
          </div></div>`;
        break;
      }
      case 'ix':
        inner = `<div class="c">${kicker}${s.t ? `<div class="st xs" style="margin-bottom:34px">${esc(s.t)}</div>` : ''}<div class="ix">${s.html || ''}</div>${s.hint ? `<div class="ix-hint">${esc(s.hint)}</div>` : ''}</div>`;
        break;
      default: {
        const size = s.xs ? ' xs' : (s.sm ? ' sm' : '');
        inner = `<div class="c">${kicker}<div class="st${size}">${esc(s.t)}</div>${s.sub ? `<div class="sub">${esc(s.sub)}</div>` : ''}</div>`;
      }
    }

    const todo = s.todo ? `<div class="todo">ВИЗУАЛ: ${esc(s.todo)}</div>` : '';
    return `<section class="${cls}">${todo}<div class="content">${inner}</div>
      <div class="vbox"><div class="vguide"><div class="t">кадр камеры</div><div class="s">9:16</div></div></div>
    </section>`;
  }

  let idx = 0, slides = [], nodes = [];

  /* ── КАРУСЕЛЬ (тип car) ─────────────────────────────────────────────
     Листается сама по ← →, и только с последнего кадра стрелка уводит
     на следующий слайд. Клик по картинке — тоже дальше (по кругу).      */
  function initCar(root) {
    const car = root.querySelector('.carousel');
    if (!car) return;
    const frames = [...car.querySelectorAll('.cfr')];
    const dots = [...car.querySelectorAll('.cdot')];

    const set = i => {
      const n = frames.length;
      i = Math.max(0, Math.min(n - 1, i));
      car.dataset.i = i;
      frames.forEach((f, j) => f.classList.toggle('on', j === i));
      dots.forEach((d, j) => d.classList.toggle('on', j === i));
      car.querySelector('.ccnt').textContent = (i + 1) + ' / ' + n;
      car.querySelectorAll('.carrow').forEach(b => {
        const d = Number(b.dataset.d);
        b.disabled = (d < 0 && i === 0) || (d > 0 && i === n - 1);
      });
    };
    car._set = set;

    car.querySelectorAll('.carrow').forEach(b =>
      b.addEventListener('click', () => set(Number(car.dataset.i) + Number(b.dataset.d))));
    dots.forEach(d => d.addEventListener('click', () => set(Number(d.dataset.i))));
    car.querySelector('.cfrs').addEventListener('click', () => {
      const i = Number(car.dataset.i);
      set(i >= frames.length - 1 ? 0 : i + 1);
    });
    set(0);
  }

  // шаг внутри карусели текущего слайда; true — значит слайд листать не надо
  function carStep(dir) {
    const car = nodes[idx] && nodes[idx].querySelector('.carousel');
    if (!car || !car._set) return false;
    const i = Number(car.dataset.i), next = i + dir;
    if (next < 0 || next > Number(car.dataset.n) - 1) return false;
    car._set(next);
    return true;
  }

  const nav = dir => { if (!carStep(dir)) show(idx + dir); };

  /* ── СУФЛЁР ─────────────────────────────────────────────────────────── */
  const say = (typeof SAY !== 'undefined' && Array.isArray(SAY)) ? SAY : null;
  const PH_KEY = 'nuk_prompter';

  function buildPrompter() {
    if (!say) return;
    const el = document.createElement('div');
    el.id = 'prompter';
    el.innerHTML = `
      <div class="meta">
        <div class="pn" id="p-n">01</div>
        <div class="pt" id="p-t"></div>
        <div class="pd" id="p-d"></div>
        <div class="pnote" id="p-note"></div>
      </div>
      <div class="say" id="p-say"></div>
      <div class="side">
        <button id="p-bigger" title="крупнее">A+</button>
        <button id="p-full" title="полный текст блока (R)">≡</button>
        <div class="lbl">T · R</div>
        <button id="p-hide" title="скрыть (T)">✕</button>
      </div>`;
    document.body.appendChild(el);

    let fs = Number(localStorage.getItem(PH_KEY + '_fs') || 26);
    const sayEl = el.querySelector('#p-say');
    sayEl.style.fontSize = fs + 'px';
    el.querySelector('#p-bigger').addEventListener('click', () => {
      fs = fs >= 40 ? 20 : fs + 4;
      sayEl.style.fontSize = fs + 'px';
      localStorage.setItem(PH_KEY + '_fs', fs);
    });
    el.querySelector('#p-hide').addEventListener('click', togglePrompter);
    el.querySelector('#p-full').addEventListener('click', () => toggleFullText());

    // высота панели по высоте окна, но не больше 340px
    const ph = Math.min(340, Math.round(window.innerHeight * 0.3));
    document.documentElement.style.setProperty('--ph', ph + 'px');

    if (localStorage.getItem(PH_KEY) !== 'off') document.body.classList.add('prompt');
  }

  function togglePrompter() {
    if (!say) return;
    document.body.classList.toggle('prompt');
    localStorage.setItem(PH_KEY, document.body.classList.contains('prompt') ? 'on' : 'off');
    fit();
  }

  /* ── ВТОРОЙ СЛОЙ: полный текст блока ────────────────────────────────── */
  const full = (typeof FULL !== 'undefined' && FULL && Array.isArray(FULL.sections)) ? FULL : null;

  function buildFullText() {
    if (!full) return;
    const el = document.createElement('div');
    el.id = 'fulltext';
    el.innerHTML = `
      <div class="ft-top">
        <div class="ttl">Полный текст блока</div>
        <div class="sub">${full.src.replace(/\.md$/, '')}</div>
        <button id="ft-sync" title="вернуться к текущему слайду">↕ к слайду</button>
        <button id="ft-close" title="закрыть (R / Esc)">✕</button>
      </div>
      <div class="ft-body" id="ft-body">
        ${full.sections.map((s, i) =>
          `<div class="ft-sec" data-i="${i}"><h4>${s.h}</h4>${s.html}</div>`).join('')}
      </div>`;
    document.body.appendChild(el);
    el.querySelector('#ft-close').addEventListener('click', toggleFullText);
    el.querySelector('#ft-sync').addEventListener('click', () => scrollFullTo(idx, true));
  }

  function scrollFullTo(i, smooth) {
    if (!full) return;
    const si = (full.map && full.map[i] != null) ? full.map[i] : 0;
    const body = document.getElementById('ft-body');
    if (!body) return;
    body.querySelectorAll('.ft-sec').forEach(s => s.classList.toggle('on', Number(s.dataset.i) === si));
    const target = body.querySelector(`.ft-sec[data-i="${si}"]`);
    if (target) body.scrollTo({ top: target.offsetTop - 18, behavior: smooth ? 'smooth' : 'auto' });
  }

  function toggleFullText() {
    if (!full) return;
    document.body.classList.toggle('fulltext');
    if (document.body.classList.contains('fulltext')) scrollFullTo(idx, false);
  }

  function updatePrompter() {
    if (!say) return;
    const s = say[idx] || {};
    const q = id => document.getElementById(id);
    q('p-n').textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    q('p-t').textContent = s.t || '';
    q('p-d').textContent = s.d ? '~' + s.d + ' сек' : '';
    q('p-note').textContent = s.note || '';
    const sayEl = q('p-say');
    sayEl.innerHTML = (s.say || '')
      .split('\n').filter(Boolean)
      .map(l => '<p>' + l
        .replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')      // **жирный** из сценария
        .replace(/(^|\s)_(.+?)_(?=\s|$)/g, '$1<i>$2</i>')
        + '</p>')
      .join('') || '<p style="opacity:.4">— текста читки нет —</p>';
    sayEl.scrollTop = 0;
  }

  function show(i) {
    idx = Math.max(0, Math.min(slides.length - 1, i));
    nodes.forEach((n, j) => n.classList.toggle('on', j === idx));
    document.getElementById('cnt').textContent =
      String(idx + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    document.getElementById('pbar').style.width = ((idx + 1) / slides.length * 100) + '%';
    const s = slides[idx];
    if (s._init && !s._done) { try { s._init(nodes[idx]); s._done = true; } catch (e) { console.warn(e); } }
    updatePrompter();
    if (document.body.classList.contains('fulltext')) scrollFullTo(idx, true);
    location.hash = 's' + (idx + 1);
  }

  function setClean(on) {
    document.body.classList.toggle('clean', on);
    if (on) document.body.classList.remove('prompt');   // суфлёр режет высоту стейджа
    fit();
    setTimeout(fit, 260);                               // #fit едет с transition .2s
  }

  function fit() {
    if (say) {
      const ph = Math.min(340, Math.round(window.innerHeight * 0.3));
      document.documentElement.style.setProperty('--ph', ph + 'px');
    }
    const st = document.getElementById('stage');
    const h = document.getElementById('fit').clientHeight;
    const k = Math.min(window.innerWidth / 1920, h / 1080);
    st.style.transform = 'scale(' + k + ')';
  }

  function build(list) {
    slides = list;
    const deck = document.getElementById('deck');
    deck.innerHTML = list.map(render).join('');
    nodes = [...deck.querySelectorAll('.dslide')];
    list.forEach(s => {
      if (s.k === 'ix' && typeof s.init === 'function') s._init = s.init;
      else if (s.k === 'car') s._init = initCar;
    });

    document.querySelectorAll('.ab[data-dir]').forEach(b =>
      b.addEventListener('click', () => nav(Number(b.dataset.dir))));
    const fs = document.getElementById('fsbtn');
    if (fs) fs.addEventListener('click', () =>
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());

    document.addEventListener('keydown', e => {
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { nav(1); e.preventDefault(); }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) { nav(-1); e.preventDefault(); }
      if (e.key === 'Home') show(0);
      if (e.key === 'End') show(slides.length - 1);
      if (e.key.toLowerCase() === 'f') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
      if (e.key.toLowerCase() === 'v') document.body.classList.toggle('nocam');
      if (e.key.toLowerCase() === 'k') setClean(!document.body.classList.contains('clean'));
      if (e.key.toLowerCase() === 'n') document.body.classList.toggle('notes');
      if (e.key.toLowerCase() === 't') togglePrompter();
      if (e.key.toLowerCase() === 'r') toggleFullText();
      if (e.key === 'Escape' && document.body.classList.contains('fulltext')) toggleFullText();
    });

    buildPrompter();
    buildFullText();

    window.addEventListener('resize', fit);
    window.addEventListener('hashchange', () => {
      const n = Number((location.hash || '').replace('#s', ''));
      if (n > 0 && n - 1 !== idx) show(n - 1);
    });
    const standalone = window.navigator.standalone === true ||
      (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
    if (location.search.indexOf('clean') > -1 || standalone) setClean(true);
    fit();
    const h = Number((location.hash || '').replace('#s', ''));
    show(h > 0 ? h - 1 : 0);
  }

  return { build, show: i => show(i), nav, setClean, get index() { return idx; } };
})();
