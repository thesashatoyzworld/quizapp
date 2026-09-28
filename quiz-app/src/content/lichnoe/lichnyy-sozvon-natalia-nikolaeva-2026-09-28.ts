// Конспект личного созвона 2026-09-28. Сгенерирован из
// GSD-BRAND/clients/natalia-nikolaeva/lichnoe/2026-09-28/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_NATALIA_NIKOLAEVA_2026_09_28 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон · 28 сентября 2026</title>
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
  <p class="kicker">Личный созвон · 28 сентября 2026</p>
  <h1>Сначала флирт, потом предложение</h1>
  <p class="sub">Возобновляем контент после двух недель паузы. Держимся сигнала, который
  у тебя уже сработал, это проявленность. Целимся в психологов и коучей. Их боли заворачиваем
  в то, что они любят: исследования, новые инструменты, кино. Оффер собираем под них же.</p>
  <div class="meta">
    <span>55 минут</span>
    <span>Сегмент: психологи и коучи</span>
    <span>Следующий созвон: понедельник</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Брать чужой заход работает</a></li>
    <li><a href="#s2">Вектор аудитории: на кого тебя показывают</a></li>
    <li><a href="#s3">Корневая тема и расширение</a></li>
    <li><a href="#s4">Продукта в профиле нет</a></li>
    <li><a href="#s5">Психологи и коучи</a></li>
    <li><a href="#s6">Что у психологов болит</a></li>
    <li><a href="#s7">Заворачиваем в то, что они любят</a></li>
    <li><a href="#s8">Сценарий через исследование</a></li>
    <li><a href="#s9">Контент-терапия</a></li>
    <li><a href="#s10">Проще или сложнее</a></li>
    <li><a href="#s11">Оффер</a></li>
    <li><a href="#s12">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Контент: куда бить</h2>
  <p>Что уже сработало и как это использовать</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Брать чужой заход работает</h3>
    <span class="ts">00:00:29</span>
  </div>
  <p>За три недели я ещё сильнее убедился: брать чужой контент это самая выгодная стратегия,
  когда эго перестаёт выделываться. Пример: ролик на YouTube «Как продать свой вайб» набрал
  триста тысяч на канале с десятью тысячами подписчиков. Через одиннадцать месяцев автор залила
  его ещё раз с тем же названием и почти той же обложкой, и он снова набрал пятьдесят тысяч.
  Я взял это начало в карусель и отметил её.</p>
  <p>Мы берём только начало и заголовок, дальше идут свои тезисы и смыслы. Пост тоже пишется
  буквами, которые придумали Кирилл и Мефодий, и никто не предъявляет. Этот приём сильно
  повышает шансы, но не гарантирует, что залетит.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Вектор аудитории: на кого тебя показывают</h3>
    <span class="ts">00:03:31</span>
  </div>
  <p>Почему один и тот же заход у одного срабатывает, а у другого нет. У автора, у которого
  сработало, аудитория смещена условно на тридцать градусов влево, а твоя на двадцать вправо.
  Алгоритм показывает рабочую тему не тем людям, и она флопается. У меня так: как только
  снимаю про деньги, вниз, как только про контент, вверх. Аудитория собиралась на контенте.</p>
  <div class="facts">
    <div class="fact"><div class="n">8 000</div><div class="l">просмотров у ролика «если вы стесняетесь» с мемами</div></div>
    <div class="fact"><div class="n">~400</div><div class="l">обычный потолок в пробниках</div></div>
    <div class="fact"><div class="n">2</div><div class="l">сигнала выше среднего, оба про проявленность</div></div>
  </div>
  <p>Восемь тысяч для тебя выброс. Ты там начинаешь с себя и прямо говоришь, для кого ролик.
  Вывод: тебя показывают тем, кто хочет вести блог, но боится и стесняется. Эту аудиторию
  и надо продолбить. Предлагаю неделю посвятить теме проявленности и стеснения и посмотреть,
  будет ли выше среднего. Остальное пока не трогаем.</p>
  <p class="note">У маленьких аккаунтов фора, к ним требований меньше. У меня клиент,
  54 года, снимал сценки с анекдотами, не шло. Я сказал: хватит прятаться за персонажами,
  покажи себя. Он выложил ролик про свою работу на стройке и получил 150 тысяч.</p>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Корневая тема и расширение</h3>
    <span class="ts">00:11:19</span>
  </div>
  <p>Чем больше контента, тем лучше понимаешь, кто тебя смотрит, и тем проще заворачивать
  через это другие смыслы. Мой аккаунт три года как тамагочи, который всё понял: мне нужно
  продажи, энергию и психологию подавать через призму контента. Твой ещё ищет.</p>
  <div class="box fix">
    <p class="lbl">Как расширяться</p>
    <ul>
      <li>Корень: проявленность</li>
      <li>Дальше добавляем вторую тему на стыке: проявленность и маркетинг, проявленность и продажи</li>
    </ul>
  </div>
</section>

<div class="call">
  <h2>Часть 2. Под кого работаем</h2>
  <p>Сегмент и его боли</p>
</div>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Продукта в профиле нет</h3>
    <span class="ts">00:13:50</span>
  </div>
  <blockquote><p>Нет у меня вообще ничего про продукт, вообще ничего. У меня был кейс про фирму,
  и всё.</p></blockquote>
  <p>Оффер был «плюс триста тысяч к доходу», он слишком общий и ничего не конкретизирует.
  Нужно прицелиться в кого-то одного. На примере Кати вижу: когда выходишь и говоришь «мы для
  мам», «мы для кондитеров», конверсия заметно растёт.</p>
  <p>Маршрута два: тестировать сегменты в контенте и менять гипотезу, если не идёт, или
  отталкиваться от себя, с кем ты сама хочешь работать. Выбираем второе, потому что у тебя
  есть вера в подход и база кейсов.</p>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Психологи и коучи</h3>
    <span class="ts">00:19:09</span>
  </div>
  <blockquote><p>У меня кейсов психологов много в коучинге, они все приходили из серии «хочу
  вести соцсети».</p></blockquote>
  <p>Это наша твёрдая база, в подходе мы уверены. Трансформационные туры, про которые ты
  рассказала, тоже про это: коучинг с психологией. Контент для психологов и коучей, их желание
  вести блог, проявляться и зарабатывать. Оффер строим вокруг заземлённых результатов,
  а путь описываем их языком, а не языком маркетологов.</p>
  <p>Слово «коучинг» наружу не выносим. Это как технический документ: мы понимаем, что внутри
  коучинг, но подаём его через конечный результат. До этого контент был больше про маркетинг,
  а ты сама уже сместила вектор.</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Что у психологов болит</h3>
    <span class="ts">00:21:59</span>
  </div>
  <p>Психологи соревнуются друг с другом. В голове у них две аудитории: клиенты и другие
  психологи. Пишут чаще для второй, чтобы показать сообществу, что они крутые, поэтому пишут
  сложно. Ещё два лагеря: одни считают, что рассказывать о клиентах нельзя, это тайна,
  другие рассказывают, и первые их терпеть не могут.</p>
  <div class="box bad">
    <p class="lbl">Возражения из твоей карусели прошлого декабря</p>
    <ul>
      <li>Это несерьёзно, я не блогер</li>
      <li>Я не люблю продавать</li>
      <li>В соцсетях и так полно крутых психологов</li>
      <li>Мой контент должен быть безупречным</li>
      <li>Я же не клоун, я не люблю публичность</li>
      <li>Нормальные клиенты не ищут психолога в соцсетях</li>
      <li>Если буду вести соцсети, клиенты перестанут меня уважать</li>
    </ul>
  </div>
  <p>Эти боли в лоб не продаются: люди заходят в соцсети отвлечься, а не учиться. Их надо
  завернуть во что-то более широкое.</p>
</section>

<div class="call">
  <h2>Часть 3. Упаковка</h2>
  <p>Как выйти к психологам не в лоб</p>
</div>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Заворачиваем в то, что они любят</h3>
    <span class="ts">00:23:13</span>
  </div>
  <p>Пример из фитнеса: вместо очередного «как похудеть» делаем «топ пять способов сказать
  мужу, что он жирный» и такой же пост про жену. Карусель и рилсы сразу. Может не сработать,
  но если сработает, то сильно. Скину, когда выложим.</p>
  <p>Что любят психологи: задротничать, читать, учиться, новые исследования и инструменты.
  Проблема: ведение соцсетей они воспринимают как клоунаду. Значит, соединяем смех, клоунов
  и науку.</p>
  <div class="box">
    <p class="lbl">Упаковка: «Целитель Адамс»</p>
    <ul>
      <li>Фильм 1998 года с Робином Уильямсом. Врач смешил детей и смехом помогал им лечиться, а медицинское сообщество его осуждало</li>
      <li>Рассказываем, как смех может спасать жизни, и подкрепляем наукой для задротов</li>
      <li>Заходить можно через фильм или через личную трагедию самого Уильямса</li>
    </ul>
  </div>
  <p>Если выйти в лоб: «пока психолог воспринимает соцсети как клоунаду, он будет бедным», это
  рубилово. Оно тоже приносит заявки, но на новую аудиторию не выходит.</p>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Сценарий через исследование</h3>
    <span class="ts">00:32:32</span>
  </div>
  <p>Пример я накидал на ходу, исследование условное, важен принцип: «недавно вышло
  исследование, где посчитали доходы психологов, которые ведут соцсети и которые не ведут».</p>
  <ol class="steps">
    <li><b>Упаковка.</b> Исследование, то, что им интересно</li>
    <li><b>Разворот.</b> Кажется очевидным, что у них больше денег, потому что больше аудитория. А нет: их уровень проявленности вызывает больше доверия, клиенты покупают их идеи и быстрее созревают для терапии</li>
    <li><b>Пруф.</b> Кейс: я это пробовала со своей клиенткой, вот история</li>
    <li><b>Призыв.</b> На оффер или на карусель</li>
  </ol>
  <p>Второй вариант той же идеи: без разворота, сразу пруф и призыв.</p>
  <div class="box">
    <p class="lbl">Твои ходы</p>
    <ul>
      <li>Чек: на площадке рядом психологи за десять тысяч, кто выберет за двадцать. Блог даёт играть чеком и линейкой</li>
      <li>Показать карточку психолога на площадке, одно фото и описание как на HeadHunter, рядом его Инстаграм с роликами. Познакомиться с человеком проще</li>
      <li>Человек не ищет психолога специально, но листает ленту, и ему попадается рилс про то, что у него болит</li>
    </ul>
  </div>
  <p class="note">Проще, как для пятиклассника. Многие не понимают, что работают через
  агрегатор: она зарегистрировалась на Ясно и считает это «площадкой, где я нахожу клиентов».</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Контент-терапия</h3>
    <span class="ts">00:42:11</span>
  </div>
  <p>Слово витает в воздухе, пока его почти никто не использует. Психологи всё время ищут
  новые инструменты, даём им то, чего они хотят, а потом подсвечиваем слепые пятна.</p>
  <div class="box">
    <p class="lbl">Как это можно подать</p>
    <ul>
      <li>На Западе набирает популярность новое направление, контент-терапия: проработанное с психологом долго закрепляется, поэтому рефлексию выкладывают публично</li>
      <li>Как с гончарным делом: ваза мягкая, чтобы она затвердела, её обжигают в печи. Публичное заявление делает то же самое с новой формой психики</li>
      <li>Разворот: немногие психологи могут пользоваться этим инструментом, потому что сами не проработали свои травмы и боятся проявленности. Дальше призыв</li>
    </ul>
  </div>
  <p>Это инструмент для клиента психолога. Документ с этими набросками я тебе отправил.</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Проще или сложнее</h3>
    <span class="ts">00:47:31</span>
  </div>
  <blockquote><p>Я смотрю, у меня заходит лучше, когда прям короткие понятные посылы.</p></blockquote>
  <p>Чем проще и чем меньше текста, тем лучше, это у всех. Накидываем, сушим, накидываем,
  сушим, со временем рука набивается. Но работает и обратное: люди любят исследования,
  у одного про нейробиологию сложные ролики собирают по десять-пятнадцать тысяч лайков.
  Однозначных выводов не делаем, пока не проверим гипотезу пятью-десятью заходами.</p>
  <p>Прямо позвать психолога к себе значит позвать замуж на первом свидании. Они нас не знают,
  поэтому начинаем с флирта: исследования, новые методы, страшилки. Пример: «а вы знали, что
  в Японии люди платят семьдесят долларов в час, чтобы человек просто побыл рядом?» Любопытство,
  а внутрь встроено про поднятие чека.</p>
</section>

<div class="call">
  <h2>Часть 4. Оффер</h2>
  <p>Под психологов и коучей</p>
</div>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Оффер</h3>
    <span class="ts">00:51:39</span>
  </div>
  <blockquote><p>Они хотят систему. Я когда проводила КЗ, они как эти попугайчики: система,
  система, система.</p></blockquote>
  <div class="box fix">
    <p class="lbl">Рабочая формулировка</p>
    <ul>
      <li><b>Экологичная система привлечения клиентов через блог для психологов и коучей</b></li>
      <li>«Экологичная» сразу маркер, что это не про бизнес-рубилово. Они не хотят продавать, хотят, чтобы покупали сами. Про продажи говорим уже после оплаты</li>
      <li>Обещание: через 90 дней блог работает, приводит клиентов, и вы от него кайфуете</li>
      <li>По твоей статистике результат начинается через полтора месяца, это пишешь дальше в чекпоинтах</li>
      <li>Первый этап строим вокруг быстрых результатов</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">Порядок сборки</p>
    <ul>
      <li>Выписываешь все проблемы, которые у них есть</li>
      <li>К каждой придумываешь решение</li>
      <li>Выбрасываешь всё, что сложно реализовать</li>
      <li>Выстраиваешь последовательность</li>
    </ul>
  </div>
</section>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">00:54:45</span>
  </div>
  <ul class="chk">
    <li>Неделю делать контент вокруг проявленности и стеснения и смотреть, будет ли выше среднего</li>
    <li>В течение недели накидывать идеи для психологов и коучей по принципу упаковки: исследование, фильм, контент-терапия, «а вы знали». Присылать мне, покорректирую</li>
    <li>Упаковки искать через поток спроса: YouTube, Threads, Инстаграм</li>
    <li>Посмотреть «Целитель Адамс»</li>
    <li>Поднять свою декабрьскую карусель с возражениями психологов</li>
    <li>Собрать оффер «Экологичная система привлечения клиентов через блог для психологов и коучей»: проблемы, решения, убрать сложное, последовательность. Первый этап про быстрые результаты</li>
    <li>Выводы по теме делать не раньше, чем после пяти-десяти заходов</li>
  </ul>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Документ с набросками по психологам (отправлен)</li>
      <li>Скинуть пример фитнес-каруселей «топ пять способов», когда выложим</li>
      <li>Корректировать твои идеи и оффер</li>
    </ul>
  </div>
</section>

<div class="foot">
  Личный созвон 28 сентября 2026, 55 минут. Следующий: понедельник.
</div>

</div>
</body>
</html>
`;
