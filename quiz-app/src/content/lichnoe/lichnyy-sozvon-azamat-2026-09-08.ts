// Конспект личного созвона 2026-09-08. Сгенерирован из
// GSD-BRAND/clients/azamat-gimaev/lichnoe/2026-09-08/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_AZAMAT_2026_09_08 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон 8 сентября 2026</title>
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
  <p class="kicker">Личный созвон · 8 сентября 2026</p>
  <h1>Ты продаёшь логикой людям, которые покупают эмоциями. И самооценку держишь на их деньгах</h1>
  <p class="sub">Разобрали, почему созвоны не закрываются: слабый прогрев до разговора, отсутствие
  дожима внутри него и твоё состояние, привязанное к чужому «да». Плюс выбрали первый сегмент,
  в который начинаем целиться контентом.</p>
  <div class="meta">
    <span>61 минута</span>
    <span>Сегмент недели: карьеристки и женщины-предприниматели</span>
    <span>Разбор в понедельник</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Пока не работает связка «созвон и деньги», остальное не поедет</a></li>
    <li><a href="#s2">Не отпускай «я подумаю»</a></li>
    <li><a href="#s3">Где они сливаются на самом деле</a></li>
    <li><a href="#s4">Пост в телеге вместо прогрева</a></li>
    <li><a href="#s5">Промежуточный вопрос: а зачем тебе это</a></li>
    <li><a href="#s6">Ты продаёшь логикой, они покупают эмоциями</a></li>
    <li><a href="#s7">Три разные задачи, которые нельзя смешивать</a></li>
    <li><a href="#s8">Самооценка на внешних опорах</a></li>
    <li><a href="#s9">Цифры просмотров ничего про тебя не говорят</a></li>
    <li><a href="#s10">Хватит бить широко: выбираем сегмент</a></li>
    <li><a href="#s11">Поток спроса по этому сегменту</a></li>
    <li><a href="#s12">Задачи на неделю</a></li>
  </ol>
</nav>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Пока не работает связка «созвон и деньги», остальное не поедет</h3>
    <span class="ts">00:00:04</span>
  </div>
  <p>Нам в любом случае нужно больше людей на созвоны, потому что деньги сейчас берутся там.
  И пока мы не нашли, что именно работает у тебя на созвоне, всё остальное будет идти тяжело.
  Если не понятно, как продавать в разговоре один на один, то через контент и переписку будет
  только сложнее: там меньше контакта и меньше твоего влияния.</p>
  <p class="note">Поэтому неделя уходит на два фронта сразу: разбор созвонов и контент под
  выбранный сегмент. Не наоборот.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Не отпускай «я подумаю»</h3>
    <span class="ts">00:02:52</span>
  </div>
  <p>Вчерашний созвон закончился на «подумаю»: договорились, что за три часа она решает,
  с предоплатой минус десять процентов. Потом написала, что всё равно надо подумать, и пропала.</p>
  <p>Дальше делаем иначе. Прямо на созвоне: мы оба взрослые люди, давай решим сейчас, надо тебе
  это или нет. Уговаривать и ждать я не буду. Задавай вопросы, я отвечу, и решаем.</p>
  <p>Почему это работает. Человек пришёл к тебе, чтобы выйти из зоны комфорта. Решение это стресс:
  надо начать что-то делать и ещё заплатить. Когда мы отпускаем его думать, он возвращается
  в ту самую рутину, из которой пытался вылезти, и там его засасывает обратно.</p>
  <p class="note">Твоя же статистика это подтверждает: все, кто заходил в работу, платили сразу
  после созвона. Все, кто уходил с возражением, не вернулись.</p>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Где они сливаются на самом деле</h3>
    <span class="ts">00:08:43</span>
  </div>
  <p>Смотрели твою переписку. Слив происходит не на цене и не на кейсе, а в момент, когда ты
  начинаешь согласовывать время созвона. Кейс посмотрели, всё понравилось, дошли до выбора
  времени и растворились.</p>
  <p>Это значит, что до созвона человек ещё не прогрет настолько, чтобы платить своим временем.
  Чинится это тем, что идёт перед созвоном.</p>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Пост в телеге вместо прогрева</h3>
    <span class="ts">00:10:03</span>
  </div>
  <p>Сейчас перед созвоном ты отправляешь пост в телеграме. Человек читает его за три минуты
  и забывает. Сравни с тем, что отправляю я: статья с двумя видео, где Вася сам своим языком
  рассказывает, что мы делали и что получилось.</p>
  <p>Что это даёт. Во-первых, квалификацию: тот, кто посмотрел час видео, действительно
  заинтересован, остальные отваливаются сами и не тратят твоё время. Во-вторых, доверие: человек
  провёл с тобой час, и продаёт не твой рот, а другой человек, который уже получил результат.</p>
  <p class="note">Отсюда задача на ближайшее время: свои кейсы под запись, а не текстом.</p>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Промежуточный вопрос: а зачем тебе это</h3>
    <span class="ts">00:07:02</span>
  </div>
  <p>В диалоге ты спрашиваешь, почему вес возвращается и что мешает начать. Это правильные вопросы,
  но между ними не хватает главного: а зачем тебе вообще этот вес сбрасывать.</p>
  <p>Этот вопрос маринует человека дольше и вытаскивает настоящую мотивацию, а не «хочу похудеть».
  Дальше с этой мотивацией и работаем на созвоне.</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Ты продаёшь логикой, они покупают эмоциями</h3>
    <span class="ts">00:12:10</span>
  </div>
  <p>Ты спокойный и неэмоциональный: даже когда тебе плохо, ты описываешь это ровно. Причина
  сейчас не так важна, важно другое: женщины, с которыми ты созваниваешься, это чувствуют очень
  сильно.</p>
  <p>Логика, цифры и аргументы это мужская покупка. Женская покупка идёт через эмоции. Вспомни
  созвон с Дашей: чем больше я говорил, что у неё есть и что она умеет, тем больше она
  расцветала, и к концу разговора она уже сама видела, как мы работаем.</p>
  <p class="note">Разбираем отдельно, что именно мешает тебе подключаться эмоционально:
  ты не чувствуешь ничего или не считываешь, что происходит у человека на той стороне.</p>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Три разные задачи, которые нельзя смешивать</h3>
    <span class="ts">00:16:25</span>
  </div>
  <ul>
    <li>Первая: чувствовать себя на созвоне расслабленно. Вчера это уже получилось, и она это, скорее всего, почувствовала.</li>
    <li>Вторая: научиться продавать из этой расслабленности.</li>
    <li>Третья: из этой же расслабленности дожимать и не отпускать на «подумаю».</li>
  </ul>
  <p>Это три отдельные задачи, и мешать их в одну кучу нельзя. Расслабленность без дожима денег
  не приносит, дожим без расслабленности превращается в передавливание.</p>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Самооценка на внешних опорах</h3>
    <span class="ts">00:18:01</span>
  </div>
  <p>Ты сказал: расслаблен я тогда, когда вижу, что человек готов. То есть твоё состояние
  делегировано наружу. Ветер подул налево, тебя понесло налево. Внутренних опор в этой
  конструкции нет.</p>
  <p>Дальше по цепочке. Заплатили значит я молодец, не заплатили значит я плохой. Самовосприятие
  висит на чужом решении, и люди это считывают за первые секунды разговора, как считываешь ты
  звонок приятеля, который полгода молчал, а тут вдруг набрал.</p>
  <p>Что делаем: разводим деньги и любовь к себе. Деньги это работа. Пока результаты приклеены
  к самооценке, каждое «нет» бьёт по тебе, и действовать спокойно становится невозможно.</p>
  <p class="note">Заработать можно было бы и так, но мы бы упёрлись в это позже, на первых
  отказах, и по кругу.</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Цифры просмотров ничего про тебя не говорят</h3>
    <span class="ts">00:45:59</span>
  </div>
  <p>Ролик набрал пятьдесят тысяч, ты молодец. Набрал две тысячи, ты ничтожество. Это рандом,
  который к тебе отношения не имеет, а ты через него себя определяешь.</p>
  <p>Два примера. Парень с аудиторией вдвое больше твоей зарабатывает столько же. И Катя,
  у которой ролики набирают две-три тысячи просмотров: мать-одиночка с двумя детьми, сегмент
  только кондитеры, считает не просмотры, а деньги. Её фраза: у меня каждый месяц с нуля,
  я просто работаю.</p>
  <p class="note">Старое обесценивать и сносить не нужно. Нужно поменять отношение: цифры это
  не про тебя.</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Хватит бить широко: выбираем сегмент</h3>
    <span class="ts">00:48:00</span>
  </div>
  <p>Широкий заход у тебя не работает: контент выходит, а покупок нет. Значит целимся прицельно.
  Из вариантов ты сам выбрал карьеристок и женщин-предпринимателей, они тебе симпатичнее.</p>
  <p>Твёрдой квалификации именно под сегмент у тебя пока нет, поэтому мы их перебираем и смотрим,
  где отзывается тебе самому. Неделю работаем с этим, дальше корректируемся или пробуем следующий.</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Поток спроса по этому сегменту</h3>
    <span class="ts">00:53:50</span>
  </div>
  <p>Смотрели ютуб вживую. В лоб всё занято общим: как похудеть, похудеть быстро, похудеть без
  срывов. Заходить надо сбоку, косвенными запросами: как худеть, когда ты вечно на работе,
  что делать, когда нет сил на тренировки.</p>
  <p>Работающие углы для этого сегмента: почесать эго (почему женщины, которые делают бизнес,
  худеют быстрее) и обходной путь без пересиливания (чит-код, как обойти систему).</p>
  <p class="note">Механику потока спроса я разбираю в курсе «Новый уровень контента»,
  плюс там теперь есть практикум, где я собираю заходы руками.</p>
</section>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Задачи на неделю</h3>
    <span class="ts">00:58:58</span>
  </div>
  <ul class="chk">
    <li>Собрать через нейронку боли, страхи, желания и возражения сегмента карьеристок: топ пять по каждому пункту</li>
    <li>На каждый пункт прописать свой тейк, то есть чем ты бьёшь эту карту</li>
    <li>Всю неделю делать контент под этот сегмент, максимум, сколько сможешь, начиная с сегодня</li>
    <li>Поискать в потоке спроса косвенные запросы: работа, нехватка сил, отсутствие времени</li>
    <li>Следующий созвон вести без отпускания на «подумаю»: решение да или нет прямо в разговоре</li>
    <li>Добавить в диалог вопрос «а зачем тебе вообще этот вес сбрасывать» и мариновать на нём дольше</li>
    <li>Прислать выложенное к понедельнику, разбираем и корректируемся</li>
  </ul>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Запись созвона и это саммари. Сделано.</li>
      <li>Скинуть видео с Катей, когда смонтируем: там про фокус на деньгах вместо просмотров</li>
      <li>Разобрать то, что ты выложишь за неделю, в понедельник</li>
    </ul>
  </div>
  <p class="note">Карты аудитории и наши тейки это фундамент под весь контент недели. Без них
  мы придумываем из воздуха, потому что ни ты, ни я с этим сегментом пока не работали.</p>
</section>

</div>
</body>
</html>
`;
