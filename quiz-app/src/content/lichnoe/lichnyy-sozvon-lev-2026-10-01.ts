// Конспект личного созвона 2026-10-01. Сгенерирован из
// GSD-BRAND/clients/lev/lichnoe/2026-10-01/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_LEV_2026_10_01 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Всё на 10 октября</title>
<style>
  :root{
    --bg:#f6f3ee; --card:#fffdfa; --ink:#22201c; --muted:#87826f;
    --line:#e6e0d5; --accent:#b5763a; --accent-soft:#f0e4d4; --chip:#ece3d3;
    --quote:#6d5a33; --quote-bg:#f3ead9; --mark:#c8452f;
    --good:#3f7d4e; --good-bg:#e7f1e6; --bad:#c8452f; --bad-bg:#fbe8e3;
  }
  @media (prefers-color-scheme: dark){
    :root{
      --bg:#161411; --card:#201d18; --ink:#ece7dd; --muted:#9a9282;
      --line:#332e26; --accent:#d69a5f; --accent-soft:#33291d; --chip:#2c2519;
      --quote:#d8b483; --quote-bg:#26200f; --mark:#e8735c;
      --good:#7ec08c; --good-bg:#1c2a1e; --bad:#e8735c; --bad-bg:#2e1a15;
    }
  }
  :root[data-theme="dark"]{
    --bg:#161411; --card:#201d18; --ink:#ece7dd; --muted:#9a9282;
    --line:#332e26; --accent:#d69a5f; --accent-soft:#33291d; --chip:#2c2519;
    --quote:#d8b483; --quote-bg:#26200f; --mark:#e8735c;
    --good:#7ec08c; --good-bg:#1c2a1e; --bad:#e8735c; --bad-bg:#2e1a15;
  }
  :root[data-theme="light"]{
    --bg:#f6f3ee; --card:#fffdfa; --ink:#22201c; --muted:#87826f;
    --line:#e6e0d5; --accent:#b5763a; --accent-soft:#f0e4d4; --chip:#ece3d3;
    --quote:#6d5a33; --quote-bg:#f3ead9; --mark:#c8452f;
    --good:#3f7d4e; --good-bg:#e7f1e6; --bad:#c8452f; --bad-bg:#fbe8e3;
  }
  *{box-sizing:border-box}
  body{margin:0; background:var(--bg); color:var(--ink);
    font-family:ui-sans-serif,system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    line-height:1.62; font-size:17px; -webkit-font-smoothing:antialiased}
  .wrap{max-width:860px; margin:0 auto; padding:56px 24px 110px}

  header.doc{border-bottom:2px solid var(--line); padding-bottom:26px; margin-bottom:20px}
  .kicker{text-transform:uppercase; letter-spacing:.16em; font-size:11.5px; color:var(--accent); font-weight:800; margin:0 0 12px}
  h1{font-size:38px; line-height:1.06; margin:0 0 12px; font-weight:800; letter-spacing:-.015em}
  .sub{color:var(--muted); font-size:15.5px; margin:0; max-width:64ch}
  .meta{display:flex; flex-wrap:wrap; gap:8px; margin-top:18px}
  .meta span{font-size:12.5px; background:var(--chip); color:var(--ink); padding:5px 11px; border-radius:999px; font-weight:600}

  nav.toc{background:var(--card); border:1px solid var(--line); border-radius:16px; padding:20px 24px; margin:18px 0 30px}
  nav.toc h3{margin:0 0 10px; font-size:13px; text-transform:uppercase; letter-spacing:.12em; color:var(--muted)}
  nav.toc ol{margin:0; padding-left:20px; columns:2; column-gap:28px}
  nav.toc li{margin:3px 0; font-size:14px}
  nav.toc a{color:var(--ink); text-decoration:none; border-bottom:1px solid transparent}
  nav.toc a:hover{border-bottom-color:var(--accent); color:var(--accent)}
  @media (max-width:640px){ nav.toc ol{columns:1} }

  .call{margin:42px 0 8px; padding:18px 22px; background:var(--accent-soft); border-radius:14px; border:1px solid var(--line)}
  .call h2{margin:0 0 4px; font-size:24px; font-weight:800; letter-spacing:-.01em}
  .call p{margin:0; font-size:13.5px; color:var(--muted); font-weight:600}

  section{background:var(--card); border:1px solid var(--line); border-radius:16px; padding:24px 28px; margin:16px 0;
    box-shadow:0 1px 2px rgba(0,0,0,.03)}
  .sec-head{display:flex; align-items:baseline; gap:12px; margin:0 0 6px; flex-wrap:wrap}
  .sec-num{font-size:12.5px; font-weight:800; color:var(--accent); font-variant-numeric:tabular-nums; letter-spacing:.04em}
  h3.t{font-size:21px; margin:0; font-weight:800; letter-spacing:-.01em; flex:1 1 auto}
  .ts{font-size:12px; color:var(--muted); font-variant-numeric:tabular-nums; font-weight:700; background:var(--chip); padding:3px 9px; border-radius:999px}
  section > p{margin:12px 0}
  section p:first-of-type{margin-top:14px}

  section.err{border-left:4px solid var(--bad)}
  section.err .sec-num{color:var(--bad)}
  .verdict{display:inline-block; font-size:11.5px; font-weight:800; letter-spacing:.1em; text-transform:uppercase;
    padding:3px 10px; border-radius:999px}
  .verdict.good{background:var(--good-bg); color:var(--good)}
  .verdict.bad{background:var(--bad-bg); color:var(--bad)}

  ul.b{margin:12px 0; padding:0; list-style:none}
  ul.b > li{position:relative; padding:7px 0 7px 24px; border-bottom:1px dashed var(--line)}
  ul.b > li:last-child{border-bottom:none}
  ul.b > li::before{content:"›"; position:absolute; left:3px; top:7px; color:var(--accent); font-weight:800}
  b{font-weight:700}
  .q{background:var(--quote-bg); color:var(--quote); padding:2px 7px; border-radius:5px; font-style:italic}

  blockquote{margin:16px 0; padding:14px 18px; background:var(--quote-bg); border-left:3px solid var(--accent);
    border-radius:0 10px 10px 0; color:var(--quote); font-size:16px}
  blockquote p{margin:0}
  blockquote p + p{margin-top:8px}

  .box{border:1px solid var(--line); border-radius:12px; padding:16px 18px; margin:16px 0; background:var(--bg)}
  .box .lbl{font-size:11.5px; text-transform:uppercase; letter-spacing:.13em; font-weight:800; color:var(--accent); margin:0 0 8px}
  .box ol{margin:0; padding-left:20px}
  .box ol li{margin:6px 0}
  .box ul{margin:0; padding-left:20px}
  .box ul li{margin:5px 0}
  .box.fix{border-color:var(--good); background:var(--good-bg)}
  .box.fix .lbl{color:var(--good)}

  table{width:100%; border-collapse:collapse; margin:16px 0; font-size:15px}
  th,td{text-align:left; padding:9px 10px; border-bottom:1px solid var(--line); vertical-align:top}
  th{font-size:12px; text-transform:uppercase; letter-spacing:.09em; color:var(--muted)}
  td.tc{font-variant-numeric:tabular-nums; font-weight:700; color:var(--accent); white-space:nowrap}
  span.tc{font-size:12.5px; font-variant-numeric:tabular-nums; font-weight:700; color:var(--accent); background:var(--accent-soft); padding:2px 7px; border-radius:999px; margin-right:6px; white-space:nowrap}
  .scroll{overflow-x:auto}

  .steps{counter-reset:st; margin:16px 0; padding:0; list-style:none}
  .steps li{counter-increment:st; position:relative; padding:10px 0 10px 44px; border-bottom:1px solid var(--line)}
  .steps li:last-child{border-bottom:none}
  .steps li::before{content:counter(st); position:absolute; left:0; top:9px; width:28px; height:28px; border-radius:50%;
    background:var(--accent); color:#fff; font-size:13px; font-weight:800; display:flex; align-items:center; justify-content:center}

  .chk{margin:16px 0; padding:0; list-style:none}
  .chk li{position:relative; padding:9px 0 9px 30px; border-bottom:1px dashed var(--line)}
  .chk li:last-child{border-bottom:none}
  .chk li::before{content:"\2610"; position:absolute; left:4px; top:8px; color:var(--accent); font-weight:800; font-size:16px}

  .facts{display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin:18px 0}
  .fact{background:var(--bg); border:1px solid var(--line); border-radius:12px; padding:14px 16px}
  .fact .n{font-size:26px; font-weight:800; letter-spacing:-.02em; color:var(--accent); line-height:1.1}
  .fact .l{font-size:12.5px; color:var(--muted); margin-top:4px; line-height:1.35}

  .note{font-size:13.5px; color:var(--muted); font-style:italic}
  .foot{margin-top:48px; padding-top:22px; border-top:1px solid var(--line); font-size:13px; color:var(--muted)}
  @media (max-width:560px){ .wrap{padding:36px 15px 70px} h1{font-size:29px} section{padding:20px 18px} body{font-size:16.5px} }
</style>
</head>
<body>
<div class="wrap">

<header class="doc">
  <p class="kicker">Личный созвон · 1 октября 2026</p>
  <h1>Всё на 10 октября</h1>
  <p class="sub">Не ломаем план, который у тебя уже запущен, а выжимаем из него максимум. Один вебинар
  10 октября, старт потока 19-го. До вебинара собираешь оффер на вебинар, его структуру, оффер обучения
  через результат и продающий контент вокруг хайпа, который у тебя сейчас есть.</p>
  <div class="meta">
    <span>64 минуты</span>
    <span>Вебинар: сб 10 октября</span>
    <span>Старт потока: 19 октября</span>
    <span>Цель: 10 мест</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Где ты сейчас</a></li>
    <li><a href="#s2">Просмотры и деньги это разное</a></li>
    <li><a href="#s3">Один вебинар, старт 19-го</a></li>
    <li><a href="#s4">Оффер на вебинар</a></li>
    <li><a href="#s5">Структура вебинара</a></li>
    <li><a href="#s6">Оффер обучения через результат</a></li>
    <li><a href="#s7">Контент до 10 октября</a></li>
    <li><a href="#s8">Что после 10-го</a></li>
    <li><a href="#s9">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Где мы</h2>
  <p>Что уже запущено и почему не конвертит</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Где ты сейчас</h3>
    <span class="ts">00:01:30</span>
  </div>
  <p>Почву вы готовили с апреля. Сейчас накатили несколько нейро-роликов, и всё полетело: видео на 10 миллионов
  (Царукян и Хабиб), ролики со Сталиным и теннисистами по 1,6 миллиона. На волне ты собрал воронку на обучение
  с тарифами.</p>
  <ul class="b">
    <li>С вирусных роликов зашла неплатёжеспособная аудитория. Продано два места, одного человека дожал личным звонком.</li>
    <li>В боте (BotHelp) больше тысячи человек, по ним пойдёт рассылка на вебинар.</li>
    <li>План был такой: бесплатные вебинары 6 и 10 октября, старт потока 12-го.</li>
    <li>Цель: продать хотя бы 10 мест в группу, на эти деньги снять студию и записать обучение на русском и английском.</li>
    <li>Английская ветка: пошли заказы от 600 долларов, написал менеджер 21 Savage. Но это тоже с вирусного контента, а не через Spectre.</li>
  </ul>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Просмотры и деньги это разное</h3>
    <span class="ts">00:05:50</span>
  </div>
  <p>Трафик на такие ролики сейчас можно залить на любую языковую аудиторию. У меня товарищ в Тиктоке делал
  ролики на 10-20 миллионов, а смотрели их бразильцы. Эти цифры нужны, чтобы на волне хайпа сделать продажи,
  но как только в контенте появляешься ты, охват падает.</p>
  <p>Нам не нужны 10 миллионов дагестанцев и не нужны 3 тысячи просмотров. Нужно 40-100 тысяч, но тех людей,
  которые платят. Масштабировать то, что ещё не работает, смысла нет: на масштабе оно тоже не заработает.</p>
  <blockquote>На берегу кажется, что тысячу продаж по тысяче рублей сделать проще, чем две по пятьсот тысяч.
  В реальности ровно наоборот.</blockquote>
  <p>Поэтому выстраиваем сверху: собираем максимально дорогой продукт.</p>
  <p class="note">Русский и английский в одном аккаунте могут отталкивать друг друга, и вы рискуете не попасть ни в кого.
  Это обсудим после 10 октября, сейчас на это не тратим ни минуты.</p>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Один вебинар, старт 19-го</h3>
    <span class="ts">00:33:23</span>
  </div>
  <p>Два одинаковых вебинара не нужны: кто записался на первый, на второй не придёт. Если второй про другое,
  то на два разных вебинара сейчас нет времени. Лучше хорошо подготовиться к одному.</p>
  <div class="box fix">
    <p class="lbl">Новый таймлайн</p>
    <ol>
      <li>4-10 октября: промо вебинара.</li>
      <li>Суббота, 10 октября: вебинар. 6-е убираем.</li>
      <li>11-18 октября: промо работы с тобой и оффера обучения.</li>
      <li>19 октября: старт потока, не 12-го.</li>
    </ol>
  </div>
  <p>Тем двоим, кто уже оплатил, дай предобучение, например как оплатить и настроить подписки на нейросети.
  Предобучение это всегда тема: у человека есть, куда направить внимание, и он не сидит наедине с мыслью
  «а точно ли мне это».</p>
  <p>И с любого, кто готов, бери предоплату в любом размере: тысяча, пять, десять. Деньгами человек подтверждает
  намерение. Пока он ничего не перевёл, решение висит в воздухе и его можно передумать.</p>
</section>

<div class="call">
  <h2>Часть 2. Вебинар</h2>
  <p>Оффер, структура и что ты на нём продаёшь</p>
</div>

<section id="s4" class="err">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Оффер на вебинар</h3>
    <span class="ts">00:20:37</span>
  </div>
  <p><b>Это главное сейчас.</b> Вебинар у тебя ключевой этап воронки. Если на него придёт мало людей, неважно, что мы
  там продаём и какой классный у нас продукт.</p>
  <p>«Научиться делать ролики через нейронку» никому не интересно. Всем интересно то, что у тебя уже есть: миллионы
  просмотров, лайки от звёзд, заказы от брендов.</p>
  <div class="box fix">
    <p class="lbl">Обещание вебинара</p>
    <p>Как делать вирусные ролики на миллионы просмотров через ИИ.</p>
  </div>
  <p>«Бесплатный вебинар» звучит как первое свидание, где ты мямлишь: меня зовут Лев, я контент снимаю. Оффер должен
  лететь в лицо: как за семь дней начать получать лайки от мировых звёзд, заказы от брендов, и скриншоты к этому.
  Чтобы человек подумал: я должен там быть.</p>
  <p>Вторая задача оффера это FOMO. Зачем идти на вебинар, если можно потом посмотреть запись? Поэтому надо донести,
  что второй раз такой возможности не будет. Окно схлопывается, как с биткоином в 2013-м: Instagram всё больше
  внимания отдаёт ИИ-контенту, и кто не зайдёт сейчас, опоздает.</p>
  <ul class="b">
    <li>Посадочная: убрать 6 октября, оставить только 10-е, оффер и скриншоты (лайк ASAP Rocky).</li>
    <li>Всех вести на эту посадочную. Поставить её в шапку себе и Матвею.</li>
    <li>Вторая воронка через deep link не нужна. Можно чуть выдохнуть и не делать того, что ещё не успел себе объяснить.</li>
  </ul>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Структура вебинара</h3>
    <span class="ts">00:22:45</span>
  </div>
  <p>Вебинар это игра в карты. Люди приходят со своим набором болей, желаний, страхов и возражений. Наша задача
  побить их карты. Если просто сидеть и рассказывать, какой ты классный, вебинар не отработает.</p>
  <p><b>Шаг 1.</b> До структуры выписать топ-5: боли, желания, возражения, страхи. Первые возражения у тебя уже есть
  от стоматолога, которого ты дожимал звонком:</p>
  <ul class="b">
    <li>нужно ли мощное железо, чтобы работать с ИИ;</li>
    <li>что входит в каждый пакет и что даст Pro по сравнению со Start.</li>
  </ul>
  <p>Остальное можно добрать через нейронку: скормить ей оффер, запустить десяток аватаров и выгрузить их вопросы,
  страхи и желания.</p>
  <p><b>Шаг 2.</b> Три-пять твёрдых тейков, чем вы отличаетесь от всех, кто учит делать видео через нейросети. Не много,
  но таких, в которых ты сам уверен. Пример, как это может звучать:</p>
  <blockquote>Большинство продают обучение нейросетям, а клиентов у них нет. Наша студия каждый день получает заявки
  в работу, и мы прошли путь с нуля до работы с брендами. Мы практики, которые помогут пройти этот путь вам.</blockquote>
  <p>И тут же скриншот оплаты от клиента. Одним блоком определили врага, отстроились от конкурентов и показали
  своё преимущество. Твой путь сюда ложится: сам учился по YouTube, бесплатно делал бренды, собрал портфолио
  и через два месяца имел проектов примерно на 250 тысяч.</p>
  <p><b>Шаг 3.</b> Структура блоками. Если ты познакомился и на десятой минуте начал рассказывать, как делать, через
  пятнадцать минут все уйдут: всё уже рассказали. Порядок такой:</p>
  <ol class="b">
    <li>Продать идею.</li>
    <li>Закрыть боли, желания, страхи, возражения.</li>
    <li>Авторитет (можно поменять местами с предыдущим).</li>
    <li>Как мы делаем такие ролики, в самом конце.</li>
  </ol>
  <p>Не дословно, а тезисами: блок один, блок два, блок три. Можно спросить у нейронки, как собирается продающий
  вебинар, и разложить свои блоки по этой структуре. Присылаешь мне на обратную связь.</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Оффер обучения через результат</h3>
    <span class="ts">00:34:47</span>
  </div>
  <p>Люди мало ценят информацию. «Шесть лайв-уроков» и «сертификат с индивидуальным номером» ни о чём не говорят.
  Наша задача повысить ценность предложения: всё, что пишем, пишем через результат.</p>
  <p>В заголовке тарифа не хватает срока. «Первый AI-ролик на миллион просмотров за 7 дней» сильнее, чем просто
  «первый AI-ролик». Сертификат убираем. Модули, которых пока нет, можно доснять по ходу потока: я так постоянно делаю.</p>
  <p>Тариф Start на созвоне пересобрали как путь:</p>
  <div class="scroll">
  <table>
    <tr><th>Этап</th><th>Что делаем</th></tr>
    <tr><td class="tc">1</td><td>Выбираем бренд, с которым работаем всё обучение.</td></tr>
    <tr><td class="tc">2</td><td>Настраиваем рабочую среду, где будем создавать ролики на миллионы просмотров.</td></tr>
    <tr><td class="tc">3</td><td>Создаём первые фото с продуктом бренда.</td></tr>
    <tr><td class="tc">4</td><td>Пишем вирусные сценарии для бренда с нейросетями.</td></tr>
    <tr><td class="tc">5</td><td>Анимируем и собираем финальное видео для бренда.</td></tr>
  </table>
  </div>
  <div class="box fix">
    <p class="lbl">На выходе</p>
    <ul>
      <li>Готовый кейс для портфолио с брендом, который знают миллионы.</li>
      <li>Настроенная рабочая среда, в которой ты быстро создаёшь контент.</li>
      <li>Навык делать ролики через ИИ на миллионы просмотров.</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">Как проходит</p>
    <ul>
      <li>Шесть живых созвонов в группе со Львом и Матвеем, два раза в неделю.</li>
      <li>Месяц обратной связи и поддержки в чате от команды Spectre.</li>
      <li>Каждую задачу проверяем лично.</li>
    </ul>
  </div>
  <p>Второй тариф расписываешь так же: всё, что в Start, плюс то, что сверху, и каждое через результат.</p>
  <ul class="b">
    <li>Личный созвон со Львом после обучения: разбор вашего контента и помощь с масштабированием.</li>
    <li>Сайт и портфолио: делаем вместе, ставим на хостинг, на выходе ваше портфолио в интернете, которое все видят.</li>
    <li>Добавить монетизацию: как находить клиентов, вести переговоры, составлять коммерческое предложение. Начни с этого: кассу будут делать именно эти вещи.</li>
  </ul>
</section>

<div class="call">
  <h2>Часть 3. Как довести людей до вебинара</h2>
  <p>Контент, хайп и фокус</p>
</div>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Контент до 10 октября</h3>
    <span class="ts">00:45:33</span>
  </div>
  <p>Контент сейчас продающий. На охваты не смотрим вообще: сроки вы себе уже поставили, задача выжать из них максимум.</p>
  <p>Сначала собираешь тезисами таблицу: Телеграм (рассылка по базе бота), рилсы, сторис, карусели, и по дням до
  10 октября, что когда выходит. Всё вокруг желаний и проблем аудитории.</p>
  <p>Главное, что у тебя сейчас есть, это волна. Вспомни историю с белёвской пастилой: человек написал коммент, он
  начал разлетаться, и они целый месяц делали всё вокруг этого комментария, сами раздували хайп. У тебя то же самое.</p>
  <div class="box fix">
    <p class="lbl">Что обязательно в контенте</p>
    <ul>
      <li>На тебя подписываются со всех стран мира, вы не ожидали, что так выстрелит.</li>
      <li>Лайк ASAP Rocky, скриншотом.</li>
      <li>Менеджер 21 Savage и другие заказы, которые к вам приходят.</li>
      <li>Призыв на вебинар: кто хочет работать с мировыми звёздами, приходите, покажем, как делать так же.</li>
    </ul>
  </div>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Что после 10-го</h3>
    <span class="ts">00:54:21</span>
  </div>
  <p>Тебе 24, мне 34, и я в твоём возрасте был такой же: пытаешься сделать всё сразу и торопишься. Ты уже думаешь
  про агентство, английские аккаунты и как это совмещать. Это будущее, которого пока нет, а внимание туда уходит.
  На твоём языке: ты тратишь токены на переключение контекста.</p>
  <blockquote>Твоя дата смерти и перерождения феникса это 10 октября. Больше ни о чём не думай.</blockquote>
  <p>Отменять, сворачивать и переделывать смысла нет. Если сделаешь, как договорились, за пять дней успеешь больше,
  чем за последний месяц.</p>
  <p>Дальше смотрим по результатам. Например, три продажи: либо работаем с этими людьми и занимаемся глобальным
  развитием, либо ещё неделю добираем в закрытую через прямой оффер.</p>
  <p>Вебинар запишется, и это тоже инструмент, но не в открытую: иначе ты сам себе стреляешь в ногу после «такого
  больше не будет». Ведём людей на анкету и по ответам смотрим, насколько человек готов. Тёплому можно написать:
  «вижу, что тебе интересно, давай открою тебе вебинар, посмотришь и обсудим форматы работы».</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">00:56:44</span>
  </div>
  <div class="box">
    <p class="lbl">За тобой</p>
    <ol>
      <li>Оффер на вебинар: как делать вирусные ролики на миллионы просмотров через ИИ, с FOMO.</li>
      <li>Выписать топ-5 болей, желаний, страхов и возражений и три-пять твёрдых тейков, чем вы отличаетесь.</li>
      <li>Структура вебинара тезисами по блокам: идея, боли и возражения, авторитет, в конце как делаем.</li>
      <li>Пересобрать оффер обучения через результат: срок «за 7 дней», без сертификата, Start как путь из пяти этапов, во втором тарифе монетизация.</li>
      <li>Посадочная: убрать 6 октября, оставить 10-е, оффер и скриншоты. Поставить в шапку себе и Матвею.</li>
      <li>Перенести старт потока на 19 октября и дать оплатившим предобучение.</li>
      <li>Контент-план до 10 октября таблицей: Телеграм, рилсы, сторис, карусели, вокруг хайпа и с призывом на вебинар.</li>
    </ol>
    <p>Каждый пункт, как готов, присылай мне в группу и пингуй. Даю обратную связь, докручиваем, идём к следующему.</p>
  </div>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Расшифровать твои голосовые и свести их с этим созвоном в карту в кабинете.</li>
      <li>Обратная связь по всему, что пришлёшь.</li>
    </ul>
  </div>
  <p class="note">Ближайшие созвоны в понедельник, 5 октября, утром и вечером. Период интенсивный, приходи на оба.</p>
</section>

<div class="foot">
  Личный созвон 1 октября 2026, 64 минуты.
</div>

</div>
</body>
</html>
`;
