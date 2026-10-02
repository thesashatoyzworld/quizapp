// Конспект личного созвона 2026-10-02. Сгенерирован из
// GSD-BRAND/clients/evgenia-sokolchik/lichnoe/2026-10-02/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_EVGENIYA_2026_10_02 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон · 2 октября 2026</title>
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
  <p class="kicker">Личный созвон · 2 октября 2026</p>
  <h1>Упрощаем воронку, чтобы цифры начали говорить</h1>
  <p class="sub">Посчитали сентябрь от охвата до продаж. Призывы ведут в три разных места,
  поэтому однозначный вывод сделать нельзя. Сводим всё к двум каруселям с оффером и двум
  анкетам, обливаем их трафиком в октябре и смотрим, где проседает. Плюс переделываем рилс
  «как сказать мужу», берём рабочий заход для карусели и включаем сторис.</p>
  <div class="meta">
    <span>63 минуты</span>
    <span>56 509 охват за сентябрь</span>
    <span>6 анкет, 3 продажи</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Где у нас есть призыв</a></li>
    <li><a href="#s2">Сентябрь в цифрах</a></li>
    <li><a href="#s3">Накопительный эффект</a></li>
    <li><a href="#s4">Две карусели, две анкеты</a></li>
    <li><a href="#s5">Карусель по рабочему заходу</a></li>
    <li><a href="#s6">Рилс «как сказать мужу»: юмор или польза</a></li>
    <li><a href="#s7">Сторис три раза в неделю</a></li>
    <li><a href="#s8">Темы пошире: отношения</a></li>
    <li><a href="#s9">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Что дал сентябрь</h2>
  <p>Считаем от входа к выходу</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Где у нас есть призыв</h3>
    <span class="ts">00:00:06</span>
  </div>
  <p>Ты написала 12 рилсов плюс 4 в пробном. Пересчитали, в скольких мы реально
  куда-то отправляем человека. Призывом считается только переход на карусель или в шапку
  профиля.</p>
  <blockquote><p>Я не считаю за призыв к действию, типа заходи в блог, тут больше полезной
  информации. Это не считается, это халтура.</p></blockquote>
  <div class="facts">
    <div class="fact"><div class="n">5</div><div class="l">рилсов с призывом на карусель с оффером, все в пробниках</div></div>
    <div class="fact"><div class="n">3</div><div class="l">карусели ведут на оффер</div></div>
    <div class="fact"><div class="n">3</div><div class="l">карусели ведут на кейсы</div></div>
    <div class="fact"><div class="n">3</div><div class="l">продающие сторис</div></div>
  </div>
  <p>В рилсах до наших созвонов призывов почти нет: карусели с оффером тогда ещё не было.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Сентябрь в цифрах</h3>
    <span class="ts">00:05:00</span>
  </div>
  <p>Взяли статистику профиля строго с 1 по 30 сентября и разложили по шагам.</p>
  <div class="facts">
    <div class="fact"><div class="n">56 509</div><div class="l">охват</div></div>
    <div class="fact"><div class="n">729</div><div class="l">посещений профиля</div></div>
    <div class="fact"><div class="n">23</div><div class="l">нажатия на ссылку</div></div>
    <div class="fact"><div class="n">6</div><div class="l">анкет</div></div>
    <div class="fact"><div class="n">3</div><div class="l">продажи</div></div>
  </div>
  <p>На входе около 24 единиц контента: 12 рилсов, 9 каруселей, 3 продающие сторис.
  Из трёх анкет без покупки одна девушка перестала отвечать после «давай забронируем место»,
  вторая не ответила совсем. Одна из купивших написала, что пришла с рилса.</p>
  <p>Логика простая: эти шаги связаны. Увеличиваем охват, растут посещения профиля, переходы,
  анкеты и продажи. Растёт он либо от объёма контента, либо от того, что контент лучше
  отрабатывает.</p>
  <blockquote><p>Мне главное, чтобы ты поняла логику, даже не поняла, а купила эту идею,
  чтобы твой мозг, ну, купил эту идею.</p></blockquote>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Накопительный эффект</h3>
    <span class="ts">00:13:33</span>
  </div>
  <p>У меня охват в августе был около 780 тысяч, в сентябре около 800 тысяч, контента
  столько же: каждый день карусель и рилс. А денег в сентябре стало в три раза больше.
  Анкет в августе было 56, в сентябре 112 при том же охвате.</p>
  <ul>
    <li>Эффект сжатой пружины: люди, которые заплатили в сентябре, прогревались на контенте июля и августа</li>
    <li>Призывов и офферов в сентябре было сильно больше</li>
    <li>Основной поток заявок приходит с одной-двух единиц, которые стрельнули. Остальные добивают. Чтобы что-то стрельнуло, нужен объём</li>
  </ul>
  <p>Те 729 человек, что открывали твой профиль в сентябре, могут в октябре купить идею,
  а в ноябре дойти до оффера. Многие бросают как раз потому, что не видят эффекта сразу.</p>
  <p>Ты сказала, что не расстроена отсутствием новых: моральных сил брать людей сейчас нет,
  всё ушло в контент. Когда накатывает тревога, напоминай себе: если разобраться
  в базовых принципах, дальше это вопрос времени. Срезать путь через нейронку, не поняв
  принцип, как раз уводит от цели.</p>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Две карусели, две анкеты</h3>
    <span class="ts">00:16:39</span>
  </div>
  <p>Сейчас призывы ведут в шапку, на оффер и на кейсы, и мы не можем понять, насколько
  конвертит сам оффер. Сами анкету заполнили только два человека, остальных ты отправила.
  Задача была не выстроить трекинг, а запустить процессы. Теперь упрощаем воронку.</p>
  <blockquote><p>Нам нужно упростить воронку настолько, чтобы мы могли делать однозначные
  выводы.</p></blockquote>
  <div class="box fix">
    <p class="lbl">Как теперь устроено</p>
    <ul>
      <li>Два оффера: на созвон и на совместную работу с тобой. Твой вопрос, не хотят ли люди сразу на продукт без созвона, ровно про это</li>
      <li>Две анкеты: на созвон и на совместную работу</li>
      <li>В контенте один призыв: на одну из двух каруселей. Чередуешь и помечаешь себе, где какой</li>
      <li>В шапку профиля больше не отправляем: там сразу анкета без оффера, вывода не сделать</li>
      <li>Саму шапку пока не трогаем, оставляем как есть</li>
    </ul>
  </div>
  <p>В октябре обливаем эти две карусели трафиком. Если охват вырастет, посещения
  вырастут, а анкет не станет больше, значит проблема в оффере, и мы точно знаем где.</p>
  <p>Сайт с кейсами ты отправляла примерно троим, в открытом доступе его нет. На страницы
  кейсов поставили статистику, теперь видно, кто их открывает и смотрит ли видео.</p>
</section>

<div class="call">
  <h2>Часть 2. Контент на октябрь</h2>
  <p>Что переделываем и что добавляем</p>
</div>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Карусель по рабочему заходу</h3>
    <span class="ts">00:27:31</span>
  </div>
  <p>Я в эту идею уверен, но хорошая идея часто хоронится из-за первых трёх секунд. Поэтому
  иногда надо брать рабочий заход один в один: первый слайд, первую фразу, может быть второй
  слайд. Карусель-референс я тебе скинул: «Лучше один раз показать этот пост жене
  и сэкономить себе годы объяснений».</p>
  <p>Если оставить «сохранить отношения» или «годы объяснений», мы не привязываемся к фитнесу
  и уходим в психологию, а это не наш профиль. Привязываем к телу:</p>
  <blockquote><p>Лучше один раз показать этот пост жене и больше никогда не ругаться из-за
  темы лишнего веса.</p></blockquote>
  <ul>
    <li>Внутри тезисы, которые разворачивают мышление, но про фитнес. Например: если мужчина покупает вам абонемент в спортзал, это не значит, что он считает вас толстой</li>
    <li>Делаем две версии: показать жене и показать мужу</li>
    <li>Рамка: как об этом разговаривать и что как воспринимать. Варианты наполнения можно погонять с нейронкой</li>
    <li>Ноги кентавра сюда не тащим: это уже про ред флаги, отдельная тема</li>
  </ul>
  <p>С прошлой недели ещё не выложены две единицы: карусель и рилс «как сказать жене».</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Рилс «как сказать мужу»: юмор или польза</h3>
    <span class="ts">00:33:48</span>
  </div>
  <p>Первая версия «Топ шесть способов сказать мужу, что он жирный» шла минуту тридцать две.
  Вторую ты подрезала до трёх способов: 309 просмотров, тоже одна подписка, но пропусков меньше.
  Вторая сработала лучше и по зрителям, и по пропускам, её открываем в профиле, первую нет.
  Открывать по очереди, не всё разом.</p>
  <p>Главная проблема: 278 человек посмотрели, а на кнопки нажали двое. Ты в одном ролике
  и отыгрываешь сценку, и даёшь полезное, и в итоге мы ни там, ни там. Ролику, чтобы
  показываться дальше, нужны нажатия.</p>
  <blockquote><p>Если это юмор, то это прям смешно должно быть. Ну, типа, вот мы уводим туда.
  Если это польза, то мы прям, ну, как бы в пользу уходим. Совмещать это невероятно тяжело.</p></blockquote>
  <div class="box">
    <p class="lbl">Два пути</p>
    <ul>
      <li>Юмор: оставляем только сценки, без твоих комментариев, и кидаем в пробник. Тогда лайков должно быть больше</li>
      <li>Польза: сохраняют и пересылают рецепты, шаблоны, списки. Можно сделать в виде сообщений: если скажешь мужу вот так, не сработает, а вот так он всё поймёт правильно</li>
    </ul>
  </div>
  <div class="box fix">
    <p class="lbl">Мелочь, которая решает</p>
    <ul>
      <li>Субтитры ставь под подбородком. Когда они внизу, внимание разъезжается между текстом, лицом и животом. Под подбородком всё в одном поле</li>
    </ul>
  </div>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Сторис три раза в неделю</h3>
    <span class="ts">00:52:02</span>
  </div>
  <p>Хочу, чтобы ты делала больше сторис. Это супер недооценённый продающий инструмент:
  я в сентябре выходил в сторис семь или восемь раз за месяц и всё равно получил оттуда
  кучу заявок.</p>
  <div class="box fix">
    <p class="lbl">Как строим</p>
    <ul>
      <li>Начинаем с бытовой истории, в которой люди узнают себя, и сводим к выводу про фитнес. У тебя такие сторис уже собирают больше просмотров, как про детский центр</li>
      <li>Пример: две недели у мамы без тренинга, на 500 калорий выше нормы, и всё время голодная, потому что суп и каша не насыщают. Сверху фото с утрированным фильтром «съездила к маме»</li>
      <li>Раз в неделю одна сторис с тейком и «кому актуально, огонёк»</li>
    </ul>
  </div>
  <div class="box bad">
    <p class="lbl">Что не поднимает охват</p>
    <ul>
      <li>Нажатия на стикеры и опросы</li>
      <li>Поднимает только ответ в директ на сторис. Инста запоминает, кто отправил огонёк, и следующие сторис показывает им</li>
    </ul>
  </div>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Темы пошире: отношения</h3>
    <span class="ts">00:59:23</span>
  </div>
  <p>На следующей неделе пощупаем темы шире похудения: про женщин, про мужчин, про отношения.
  Ноги кентавра это про ред флаги мужиков: не надо ради этого уебка издеваться над собой,
  это важно делать для себя, чтобы чувствовать себя охуенно. Внутри при этом твои смыслы,
  а не очередное «люби себя, детка».</p>
  <blockquote><p>Я помню, у меня даже была подопечная такая, которой муж говорил: «Твоими бы
  ногами, да в футбол играть».</p></blockquote>
  <p>Можно рилс про самые уебищные фразы, которые мужья говорят жёнам и жёны мужьям.
  Поищи заходы вокруг отношений, и вокруг них уже потанцуем.</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">00:58:40</span>
  </div>
  <ul class="chk">
    <li>Собрать оффер на совместную работу с тобой и карусель на него. Текстом прислать мне на правку</li>
    <li>Сделать вторую анкету: на совместную работу</li>
    <li>Во всём контенте ставить призыв только на одну из двух каруселей с оффером, чередовать и помечать, где какой. В шапку не отправлять</li>
    <li>Перемонтировать рилс «как сказать мужу» только сценками, без комментариев, субтитры под подбородок, и кинуть в пробник</li>
    <li>Для каждой единицы решать: юмор или польза, не смешивать</li>
    <li>Собрать карусель по заходу «Лучше один раз показать этот пост жене и больше никогда не ругаться из-за темы лишнего веса», две версии: жене и мужу</li>
    <li>Выложить оставшиеся карусель и рилс «как сказать жене»</li>
    <li>Сторис три раза в неделю: бытовая история и вывод про фитнес. Раз в неделю сторис с тейком и огоньком</li>
    <li>На следующей неделе поискать заходы на темы про отношения: ред флаги, худшие фразы мужей и жён</li>
  </ul>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Нейронка ищет заходы под идею «как сказать мужу или жене», что найду, скину</li>
      <li>Наглядно пересчитать воронку отдельно</li>
      <li>Поправить текст оффера, когда пришлёшь</li>
    </ul>
  </div>
</section>

<div class="foot">
  Личный созвон 2 октября 2026, 63 минуты.
</div>

</div>
</body>
</html>
`;
