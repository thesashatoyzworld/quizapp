// Конспект личного созвона 2026-09-18. Сгенерирован из
// GSD-BRAND/clients/leonid/lichnoe/2026-09-18/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_LEONID_2026_09_18 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон · Леонид · 18 сентября 2026</title>
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
  <p class="kicker">Личный созвон · 18 сентября 2026</p>
  <h1>Антикризисник, который видит всё изнутри</h1>
  <p class="sub">Разобрали, почему контент про карго и белую логистику не продавал, и поделили аудиторию
  на сегменты. Нашли форму, в которой тебе не надо сидеть говорящей головой в офисе: разговор со мной
  и нарезка поверх твоих футажей. Параллельно собираем фундамент: оффер, кейсы и лендинг с заявками.</p>
  <div class="meta">
    <span>50 минут</span>
    <span>Созвоны по пятницам в 12:00 мск</span>
    <span>Следующий: 25 сентября</span>
    <span>Первым делом: папка, оффер, кейсы</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Контент для тех, кто уже ищет</a></li>
    <li><a href="#s2">Между говорящей головой и трэшем</a></li>
    <li><a href="#s3">Четыре сегмента</a></li>
    <li><a href="#s4">Региональным нужен товар</a></li>
    <li><a href="#s5">Промышленники: истории вместо лекций</a></li>
    <li><a href="#s6">Селлеры: горячее окно</a></li>
    <li><a href="#s7">Разговор и нарезка</a></li>
    <li><a href="#s8">Как выглядит ролик</a></li>
    <li><a href="#s9">Оффер и кейсы</a></li>
    <li><a href="#s10">Грядка: лендинг, анкета, бот</a></li>
    <li><a href="#s11">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Почему контент не продавал</h2>
  <p>Что было с SMM-щицей и почему это не давало заявок</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Контент для тех, кто уже ищет</h3>
    <span class="ts">00:00:34</span>
  </div>
  <p>В рабочем аккаунте было много роликов про карго, про белую, про цифры. Под это завели телеграм-канал,
  туда перетекали люди, спрашивали, ты отвечал бесплатно, давал «обезболивающие», и люди пропадали.
  Ты сам сказал, почему: проблема не была подсвечена.</p>
  <p>А вот что под этим. Вы говорили для людей, которые уже ищут подрядчика по логистике. Это очень узкий
  круг. Ты сам заходишь в инстаграм посмотреть фишки по нейронкам и гороскоп, а не решать рабочие задачи.
  Твоя аудитория точно так же: предприниматель занят по горло, в соцсети он идёт отвлечься.</p>
  <p class="note">Когда вещаешь для узкого сегмента, взаимодействий с роликом не хватает, чтобы его показали
  большему числу людей. Задача контента выйти из этого узкого круга.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Между говорящей головой и трэшем</h3>
    <span class="ts">00:04:54</span>
  </div>
  <p>Ролик с Путиным набрал около 60 тысяч, другие по 9 тысяч, и почти все они мало связаны с логистикой.
  Ты сопротивлялся SMM-щице, не хотел постановок. Она в целом говорила правильные вещи про удержание,
  просто не придумала, как сделать это тебе комфортно. Если тебе некомфортно, через неделю скажешь
  «нахер мне это надо».</p>
  <p>Сейчас ты видишь две крайности: либо говорящая голова за столом рассказывает сложное про логистику,
  либо пляски под вирусную мелодию. Между ними большой спектр, и наша задача найти там своё место.</p>
</section>

<div class="call">
  <h2>Часть 2. Кому говорим</h2>
  <p>Русскоговорящие люди с бизнесом, который завязан на Китай</p>
</div>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Четыре сегмента</h3>
    <span class="ts">00:07:12</span>
  </div>
  <ul class="b">
    <li><b>Селлеры</b> на Wildberries, Ozon и Яндекс.Маркете, которые возили товар из Китая.</li>
    <li><b>Действующий бизнес</b>, который уже закупает в Китае для себя или на перепродажу: шины, запчасти, оборудование.</li>
    <li><b>Промышленные предприятия</b>: оборудование и сырьё. Сам собственник в соцсетях вряд ли сидит, зато сидят закупщики, менеджеры по ВЭД, директора по закупкам. Они и принимают решения.</li>
    <li><b>Региональные предприниматели</b>: кафе где-нибудь в Дагестане, которому нужен аппарат для молочки. Из Китая они никогда ничего не покупали.</li>
  </ul>
  <p><span class="tc">26:07</span> Действующий бизнес тебе интересен меньше всего: у них всё уже ездит,
  а просто продавать перевозку ты не хочешь. Интересны консалтинг и комплексная логистика. Поэтому в фокусе
  селлеры, промышленники и региональные.</p>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Региональным нужен товар, а не логистика</h3>
    <span class="ts">00:09:09</span>
  </div>
  <p>Кафе в регионе не интересна твоя логистика. Ему интересна штука, которая за сто тысяч быстро делает
  что-то из молока: «о, хочу такой товар». Показываешь товар, человек пишет «как это взять», дальше логистика
  идёт через тебя. Это уже не продажа перевозки, а комплексная продажа товара, тебе самому это интереснее.</p>
  <p>Материал под это есть: аккаунт «Первые руки», фабрики мебели и посуды, первая группа клиентов из сети
  ресторанов уже съездила. Отдельно искать товары у тебя сейчас нет времени, поэтому эту ветку пока не трогаем.
  Она ждёт твоей поездки в Китай.</p>
  <p class="note">Когда в следующий раз поедешь в Китай, камеру из рук не выпускай. Что потом с этим делать,
  разберёмся.</p>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Промышленники: истории вместо лекций</h3>
    <span class="ts">00:16:39</span>
  </div>
  <p>Почему сработал ролик с Путиным? Актуальный инфоповод, который крутится прямо сейчас, плюс лицо,
  которое знают все. Для этой аудитории это законы и проблемы заводов: страна импортозависимая, европейские
  детали и оборудование через санкции почти не достать, а на замену идёт китайское.</p>
  <p><span class="tc">18:45</span> Пример. Мой друг лётчик в иркутской авиакомпании: после начала СВО
  самолёты в лизинге остались стоять, а свои обслуживают, разбирая старые, потому что запчастей нет.
  Вы как раз возите запчасти для авиации. Вот наш контент: не трэш и не лекция, а история про то, что
  происходит сейчас. Ты в поле видишь это изнутри.</p>
  <div class="box">
    <p class="lbl">Как звучит такой заход</p>
    <p>Лесопилки обанкротились, леса нет, всё выкупил Китай. А ребята из Барнаула придумали вот такую тему
    и вышли из кризиса. Смысл, который продаём: бизнесу не кранты, решить можно вот так или вот так.</p>
  </div>
  <p>Можно рассказывать и не свои истории, а истории знакомых предпринимателей. Ты тут в роли антикризисника.
  Истории умеют рассказывать все: когда ты за ужином с друзьями рассказываешь, что у тебя случилось, тебя
  слушают. Люди приходят в соцсети отвлечься, поэтому смыслы заворачиваем в историю, а не в поучение.</p>
  <p class="note">В массовый поток из таких роликов обязательно попадут и те, кто эти самолёты собирает
  и ими управляет. Их по воронке будет меньше, но это и есть твоя целевуха.</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Селлеры: горячее окно</h3>
    <span class="ts">00:34:39</span>
  </div>
  <div class="facts">
    <div class="fact"><div class="n">1 октября</div><div class="l">закон о платформенной экономике, маркетплейсы проверяют селлеров</div></div>
    <div class="fact"><div class="n">конец октября</div><div class="l">ещё один закон, и карго всё</div></div>
    <div class="fact"><div class="n">85%</div><div class="l">случаев в белую выходит дороже</div></div>
  </div>
  <p>Уговаривать больше не надо: в белую перейдут все, государство вынудило. Главная боль теперь в том,
  чтобы перейти без потери времени, без ошибок и без потери денег. И побочный эффект: штрафы прилетят всем.</p>
  <p>Ролик сразу представляется: «если собираетесь торговать на маркетплейсах, забудьте, там трындец».
  Он зацепит и действующих селлеров, и тех, кто только собирается. Лучший контент для врача не «проверьте
  простату», а последствия того, что будет, если этим не заниматься.</p>
  <p><span class="tc">38:20</span> Ты пугать не очень хочешь: пугальщиков на рынке и так много. Ничего
  страшного. Задача верхнего уровня только привлечь внимание. Дальше в том же ролике можно сказать, сколько
  времени и денег потеряет тот, кто обратится не к тем. А учить и показывать выгоды удобнее ниже: длинное
  видео на YouTube или статья. Предприниматель спокойно посидит двадцать минут.</p>
  <p class="note">Многие пытаются в одном рилсе и внимание привлечь, и авторитет показать, и выгоды расписать.
  Так не помещается. Одну тему обстреливаем с разных ракурсов и спускаем людей в длинный формат, а оттуда
  в консалтинг.</p>
</section>

<div class="call">
  <h2>Часть 3. Как делаем контент</h2>
  <p>Без офиса, без плясок и без монтажа твоими руками</p>
</div>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Разговор и нарезка</h3>
    <span class="ts">00:28:47</span>
  </div>
  <p>Я собираю всё, что мы обсудили, и готовлю темы. Мы созваниваемся, ты ставишь камеру сбоку, я задаю
  вопросы, ты рассказываешь истории. Получается что-то вроде подкаста, его мы нарезаем.</p>
  <p>С SMM-щицей было похоже: она спрашивала, ты отвечал. Только вы стреляли наугад. Мы берём темы,
  которые уже дали результат. Я это называю потоком спроса: водопад из просмотров, темы и заходы, которые
  уже набрали цифры. Например, «что будет с Wildberries через пять лет» или «они открывают заводы
  в Казахстане». Подсасываемся к этой трубе и переливаем трафик себе.</p>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Как выглядит ролик</h3>
    <span class="ts">00:30:30</span>
  </div>
  <p>Референс: мой приятель из Алматы, у них клиника мужского здоровья. Он записал голосовое и наложил его
  на видео из своей галереи, отдельно ничего не снимал. Смена картинки держит внимание, а в уши тем временем
  идёт смысл. Ты сам так делал в Китае: снимали видеоряд, речь накладывали отдельно.</p>
  <p>Монтировать ты не будешь. Монтажёр получает ссылку на папку, кусок нашего разговора и референс.
  Час разговора даёт контент примерно на две недели. Ты один раз собираешь папку, дальше от тебя нужно
  только посидеть со мной час.</p>
  <div class="box fix">
    <p class="lbl">Что собрать в папку</p>
    <p>Видео и фото, где есть ты. Тема не важна, важно лицо: как едешь, как работаешь, как заполняешь
    документы, как отдыхаешь, как танцуешь. Мы делаем личный бренд, поэтому стоки не берём. Туда же всё,
    что отсняли в Китае на фабриках. Как сделать общую папку на айфоне, пришлю инструкцию отдельно.</p>
  </div>
</section>

<div class="call">
  <h2>Часть 4. Фундамент</h2>
  <p>Параллельно с контентом собираем грядку, которую потом поливаем трафиком</p>
</div>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Оффер и кейсы</h3>
    <span class="ts">00:44:20</span>
  </div>
  <p>Оффер на консалтинг у тебя практически есть, надо причесать. Присылай в Ворде, докручиваем его вместе
  в течение недели.</p>
  <p>Кейсов у тебя «хренова гора», но они не описаны. Берёшь два-три из разных сегментов, чтобы были разные.</p>
  <div class="box">
    <p class="lbl">Как описывать кейс</p>
    <ul>
      <li>Точка А максимально подробно: с какой ситуацией человек пришёл.</li>
      <li>Что делали в процессе.</li>
      <li>Что получили на выходе.</li>
      <li>Артефакты: отзывы на бланках, отзывы в Яндексе, цифры, видео.</li>
    </ul>
  </div>
  <p class="note">Работает не результат: результат все хотят одинаковый, бабок и ничего не делать. Работает
  ситуация. Человек узнаёт в ней себя и думает: «Леонид помогал таким же, как я, значит, поможет и мне».</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Грядка: лендинг, анкета, бот</h3>
    <span class="ts">00:47:58</span>
  </div>
  <ol class="steps">
    <li>Оффер на лендинге.</li>
    <li>Форма анкеты на сайте.</li>
    <li>Бот в телеграме, который ловит анкеты и присылает уведомление о заявке.</li>
    <li>Кейсы на том же сайте.</li>
    <li>Потом оптимизация под поиск и нейронки, чтобы кейсы выдавались на запросы.</li>
  </ol>
  <p>Всё это собирается через Claude, как в моём видео про сайт: пару кнопок, двадцать минут, и подрядчики
  по сайтам больше не нужны. Правки на лендинге можно делать голосовыми.</p>
  <p><span class="tc">49:26</span> Сейчас на запрос «как привезти товар из Китая» в Google отвечает Gemini,
  а не обычная выдача. Доплачивать команде 70 тысяч за GEO не нужно, сделаем через нейронки, когда сайт
  встанет на хостинг.</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">00:43:05</span>
  </div>
  <div class="box fix">
    <p class="lbl">До 25 сентября</p>
    <ol>
      <li>Собрать общую папку iCloud с видео и фото, где есть ты, и прислать ссылку.</li>
      <li>Сложить туда всё, что отсняли в Китае.</li>
      <li>Прислать оффер на консалтинг в Ворде.</li>
      <li>Описать в Ворде 2-3 кейса из разных сегментов, приложить отзывы.</li>
      <li>Скинуть ссылку на телеграм-канал.</li>
    </ol>
  </div>
  <div class="box">
    <p class="lbl">Дальше, по порядку</p>
    <ol>
      <li>25 сентября в 12:00 первый контент-созвон: камера сбоку, темы готовлю я.</li>
      <li>Поставить оффер на лендинг с анкетой и ботом.</li>
      <li>Поставить кейсы на сайт.</li>
      <li>Оптимизировать сайт под поиск и нейронки.</li>
    </ol>
  </div>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Инструкция, как сделать общую папку на айфоне.</li>
      <li>Видео, как собрать оффер на лендинг через Claude с анкетой и ботом.</li>
      <li>Темы, заходы и инфоповоды из потока спроса к 25 сентября.</li>
      <li>Схема сегментов графикой: рисовалка на созвоне слетела.</li>
      <li>Докрутить оффер вместе с тобой, когда пришлёшь.</li>
    </ul>
  </div>
  <p class="note">Созваниваемся по пятницам в 12:00 по Москве. Задачи и ссылки на материалы в «Карте».</p>
</section>

<div class="foot">
  Личный созвон 18 сентября 2026, 50 минут.
</div>

</div>
</body>
</html>
`;
