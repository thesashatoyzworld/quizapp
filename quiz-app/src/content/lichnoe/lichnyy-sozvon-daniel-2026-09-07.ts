// Конспект личного созвона 2026-09-07. Сгенерирован из
// GSD-BRAND/clients/daniel-osipov/lichnoe/2026-09-07/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_DANIEL_2026_09_07 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон 7 сентября 2026</title>
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
  <p class="kicker">Личный созвон · 7 сентября 2026</p>
  <h1>Ты уже делаешь работу на триста тысяч, но продаёшь её как микрофон за шестьдесят</h1>
  <p class="sub">Разложили твой корпоратив по этапам ровно так, как ты его сам рассказал: анкета,
  сбор инфы о компании, созвон с боссом, план мероприятия, подготовка, координация площадки.
  Всё это уже происходит, но клиент этого не видит, поэтому и торгуется. Наша задача на неделю:
  вытащить процесс наружу и оформить один оффер под корпоративы.</p>
  <div class="meta">
    <span>75 минут</span>
    <span>Первый сегмент: корпоративы</span>
    <span>190 000 сорвалось из-за незаданного вопроса про бюджет</span>
    <span>К следующему созвону: оффер плюс 10 контактов</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Почему сначала оффер, а не контент</a></li>
    <li><a href="#s2">Один сегмент, один оффер. Берём корпоративы</a></li>
    <li><a href="#s3">Чем ты отличаешься от ведущего за те же деньги</a></li>
    <li><a href="#s4">Этап ноль: всё, что происходит до оплаты</a></li>
    <li><a href="#s5">Этап один: работа после оплаты</a></li>
    <li><a href="#s6">Петя и Вася: почему план продаёт сам</a></li>
    <li><a href="#s7">Этап ноль делаем бесплатным</a></li>
    <li><a href="#s8">Свадьба за 190 и порог в 60</a></li>
    <li><a href="#s9">Внутри каждой проблемы клиента лежат твои деньги</a></li>
    <li><a href="#s10">Контент параллельно: камера сбоку</a></li>
    <li><a href="#s11">Как не стать заложником просмотров</a></li>
    <li><a href="#s12">Задачи на неделю</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Оффер</h2>
  <p>Почему всё остальное без него не считается</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Почему сначала оффер, а не контент</h3>
    <span class="ts">00:01:04</span>
  </div>
  <p>Ты посмотрел «Солдаут» и сказал честно: «не могу сказать, что я всё понял на все сто
  процентов, потому что одно дело просто прочитать, а другое дело уже всё использовать».
  Так и есть, навык доводится руками, поэтому весь созвон мы его и доводили.</p>
  <p>Логика простая: маркетинг умножает оффер, а не заменяет его. Ко мне поголовно приходят
  фитнес-тренеры с двадцатью пятью, тридцатью, пятьюдесятью тысячами подписчиков, а зарабатывают
  они как кассиры «Пятёрочки», по сто, по сто пятьдесят тысяч. Один пришёл со ста двадцатью
  тысячами подписчиков, гора мускул, «Мистер Олимпия», и говорит: «Блин, Саня, мне завтра
  за кредит платить нечем». Контент и трафик это вода. Растение дохлое, поливай сколько хочешь.</p>
  <p>Отдельно держи в голове: у тебя услуговый бизнес, а не коучинг. Пока нет личного бренда,
  ты в позиции догоняющего, клиент всегда сверху. Значит твой инструмент это не выпендрёж
  и не райдер, а точность предложения.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Один сегмент, один оффер. Берём корпоративы</h3>
    <span class="ts">00:04:52</span>
  </div>
  <p>Универсальный оффер для всех не попадёт ни в кого. Те, кто ищет ведущего на свадьбу, это
  не те же люди, что зовут тебя на «Мафию» и «Бункер». Со временем у тебя накопится семь-восемь
  офферов: отдельно корпоративы, отдельно свадьбы, отдельно конференции. Начинаем с корпоративов,
  потому что тебе самому там интереснее и деньги идут оттуда.</p>
  <p><span class="tc">07:10</span> Каналы у тебя сейчас: «вообще я продвигаю себя только Авито,
  Яндекс.Услуги и сарафанное радио». В холодную не пишешь, с агентствами не работаешь, хотя
  сам про рассылку сказал: «вообще это очень хороший метод, это очень хорошая тема».</p>
  <p>Про агентства запомни механику. Моя жена, выбирая ведущего, считает свою маржу: у тебя
  двести, и в эти двести уже вшиты диджей и активности, а у другого ведущего сто пятьдесят,
  но всё остальное докупается отдельно и в сумме выходит триста. Она возьмёт тебя, потому что
  перепродаст за триста пятьдесят и положит себе сто пятьдесят. Чем больше вшито в твой чек,
  тем выгоднее тебя продавать.</p>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Чем ты отличаешься от ведущего за те же деньги</h3>
    <span class="ts">00:09:46</span>
  </div>
  <p>Ты ответил на этот вопрос сам, и это ядро оффера: «для меня корпоратив это импровизационный
  спектакль, это ток-шоу с боссом компании, это разговоры с сотрудниками». И дальше: «ты никого
  не заставляешь в конкурсах участвовать вообще. Ты просто взаимодействуешь».</p>
  <blockquote>Вот босс сидит на месте, у нас ток-шоу, и я как будто бы прихожу устраиваться
  к нему на работу. При этом я отыгрываю какого-то сотрудника. Все умирают со смеху.</blockquote>
  <p>Идея рабочая, выкрути её дальше: пусть босс приходит устраиваться на работу к самому себе,
  а ты отыгрываешь босса. Его будет разъёбывать сильнее, потому что он видит себя со стороны,
  а сотрудники смотрят, как разъёбывают его.</p>
  <p class="note">Сюда же твоя подготовка: сайт компании, отзывы, соцсети, фотография гендиректора,
  который на фото «ебать какой серьёзный», а в жизни кайфовый чел. Ты играешь на контрасте,
  и это ровно то, за что платят больше, только клиент об этом пока не знает.</p>
</section>

<div class="call">
  <h2>Часть 2. Каркас, который мы собрали</h2>
  <p>Твой процесс, разложенный по этапам</p>
</div>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Этап ноль: всё, что происходит до оплаты</h3>
    <span class="ts">00:16:00</span>
  </div>
  <p>Ты сам поймал момент: «у меня это так фигово отработано, потому что я всё тебе это говорю,
  но я не могу это продать. Я не понимаю, как это продать, с каким контекстом». Поэтому мы
  разложили процесс по шагам, слово в слово так, как ты его рассказал.</p>
  <ul>
    <li>Клиент заполняет анкету: год основания, миссия, ценности, девиз, лого. Плюс новый пункт про бюджет, о нём ниже.</li>
    <li>Ты собираешь информацию о компании: сайт, соцсети, отзывы, контент.</li>
    <li>По желанию созвон с боссом. Твоя же формулировка: «давайте созвонимся с боссом, чтобы он понимал, за что он платит деньги». Оставляй как есть, она хорошая.</li>
    <li>Три дня на сборку плана мероприятия.</li>
    <li>Отправляешь план на одобрение или презентуешь его на созвоне.</li>
    <li>Вносишь правки, и только дальше начинается работа.</li>
  </ul>
  <p><span class="tc">31:15</span> На каждом шаге работает правило трёх уровней: фу, норм и вау.
  Клиент проходит путь знакомства с тобой (портфолио, соцсети, сайт, переписка, созвон, оффер,
  план), и чем больше вау на каждой точке, тем проще заплатить больше. План мероприятия это тоже
  точка касания, поэтому его надо оформлять: дорого, минималистично, но не теряя вайб.</p>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Этап один: работа после оплаты</h3>
    <span class="ts">00:40:07</span>
  </div>
  <ul>
    <li>Подготовка всех активностей по мероприятию, семь-четырнадцать дней.</li>
    <li>Подготовка визуальных материалов: презентации, видео, фото.</li>
    <li>Чат с диджеем, сборка плейлиста и утверждение его в чате с эйчаром.</li>
    <li>Диалог и координация с площадкой: аппаратура, оборудование.</li>
    <li>Работа с персоналом, чтобы в день мероприятия не было аварий: когда горячее, когда холодное.</li>
    <li>Координация и отчётность по прогрессу.</li>
  </ul>
  <p><span class="tc">44:56</span> Ты сам объяснил, почему тащишь на себе ещё и организацию:
  «так как у меня не упакован профиль, не упакован контент, ко мне не идут организаторы. Им важно,
  чтобы у чела был виден вайб сразу». На этом этапе это нормально. Дальше это станет твоим
  преимуществом в оффере: ты не просто ведущий, ты закрываешь координацию.</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Петя и Вася: почему план продаёт сам</h3>
    <span class="ts">00:24:04</span>
  </div>
  <p>Приходит Петя и говорит: отвезу тебя в Нью-Йорк, стоит столько-то. Приходит Вася и
  раскладывает весь маршрут: поезд до Праги, три дня с панками, перелёт в Мадрид, фестиваль,
  прямой рейс в Нью-Йорк, гостиница забронирована, встречающий в аэропорту, сим-карты куплены,
  программа на пять дней. Стоит столько же. Ты ответил сам: «Да, конечно, я выберу того,
  у кого план есть».</p>
  <p>Точное описание считывается как сила, потому что у человека не остаётся вопросов. Тот же
  механизм в «Восьмой миле»: Эминем в финальном баттле первым сам рассказал про себя всё, за что
  его могли зацепить, и оппоненту нечего было сказать. Закрывай вопросы наперёд.</p>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Этап ноль делаем бесплатным</h3>
    <span class="ts">00:34:14</span>
  </div>
  <p>План мероприятия под конкретную компанию собирается бесплатно и до оплаты. Ты сказал:
  «будет круто, да, будет круто». Логика в дефиците трафика: заявками ты сейчас не завален,
  значит можешь вкладываться в каждого входящего.</p>
  <p>Бояться, что план украдут, не надо. Мы продаём не концепцию, а тебя: твои приколы, импровизацию
  и ток-шоу никто не повторит. Зато бесплатный разбор становится входом в холодную рассылку эйчарам:
  «я соберу вам план корпоратива бесплатно, посмотрите и решите, работаем или нет».</p>
</section>

<div class="call">
  <h2>Часть 3. Деньги и возражения</h2>
  <p>Где ты уже терял и как это закрыть</p>
</div>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Свадьба за 190 и порог в 60</h3>
    <span class="ts">00:36:34</span>
  </div>
  <blockquote>Я скинул план мероприятия, клиенту всё очень понравилось. Я в конце указал цену.
  Это была свадьба. И клиент говорит: «Данил, всё шикарно, у нас просто не хватает денег».
  Я такой: блядь, я два дня ебал нос себе. И вы просто говорите нет денег.</blockquote>
  <div class="facts">
    <div class="fact"><div class="n">190 000</div><div class="l">твоя цена на свадьбу</div></div>
    <div class="fact"><div class="n">60 000</div><div class="l">их бюджет на ведущего и диджея вместе</div></div>
    <div class="fact"><div class="n">2 дня</div><div class="l">сгорели вслепую</div></div>
  </div>
  <p><span class="tc">37:30</span> Твой собственный вывод: «моя ошибка в том, что я не собрал
  их ценовой порог». Фикс на один пункт: в анкету добавляешь строку «какой бюджет вы рассматриваете
  на ведущего». Дальше ты сразу видишь, приоритетный это клиент или нет. Выделяют двести, триста,
  пятьсот, работаешь. Выделяют шестьдесят, это красный флаг, и решение принимаешь заранее,
  а не после двух дней работы.</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Внутри каждой проблемы клиента лежат твои деньги</h3>
    <span class="ts">00:46:53</span>
  </div>
  <p><span class="tc">38:28</span> Сначала про возражение. «Нет денег» это чаще про ценность,
  чем про деньги, и ход у тебя остаётся всегда: «Вам ведь всё нравится то, что я придумал?
  Мне вы тоже очень нравитесь. Давайте придумаем, как найти деньги, потому что я знаю, что приведу
  вам такое мероприятие, о котором вы ни разу в жизни не пожалеете». Деньги находятся,
  было бы желание.</p>
  <p>Дальше мы начали выписывать проблемы, страхи, боли и желания корпоративного клиента и
  придумывать решения. Успели две штуки, остальное на тебе.</p>
  <table>
    <thead><tr><th>Проблема клиента</th><th>Чем закрываем</th></tr></thead>
    <tbody>
      <tr>
        <td><b>Придёт меньше людей, чем ждали.</b> Твой случай: «нас будет шестьдесят», пришло двадцать. Босс расстроен, потому что переплатил.</td>
        <td>Общий чат или канал сотрудников с прогревом до мероприятия: спойлеры, кружочки, вопросы про фотки в шашечке. За два дня пишешь каждому лично и уточняешь, придёт или нет. Кто не приходит, записывает короткое видео с вопросом или пожеланием, ты показываешь его на празднике. Идею с видео предложил ты сам.</td>
      </tr>
      <tr>
        <td><b>Страх, что не всем зайдёт.</b> «Боссу и эйчару понравилось, но каким-то серьёзным дяденькам это не зайдёт». Плюс частая просьба: «у нас есть очень тихие ребята, вы их вообще не трогайте».</td>
        <td>Твоя же формулировка, готовый кусок оффера: «молчаливый гость молчаливый, потому что он стесняется. Но стеснение уходит, когда происходит эмоциональный обмен». И дальше: «атмосфера создаётся за счёт атмосферы, которую задал ведущий», а не за счёт гостей. В оффер это идёт как обещание: разговорю любого и выведу на позитив.</td>
      </tr>
      <tr>
        <td><b>Форс-мажор, мероприятие отменили за три дня.</b></td>
        <td>Отсеяли: на форс-мажор ты не влияешь. Не тратим на это место в оффере.</td>
      </tr>
    </tbody>
  </table>
  <p>Дальше по этой же схеме: фиксируешь проблему, накидываешь решения так, будто ресурс у тебя
  неограниченный. Лишнее отрежем потом, вместе.</p>
</section>

<div class="call">
  <h2>Часть 4. Контент</h2>
  <p>Параллельно офферу, без ставки на просмотры</p>
</div>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Контент параллельно: камера сбоку</h3>
    <span class="ts">01:01:53</span>
  </div>
  <p>На новом аккаунте у тебя ноль подписчиков, на старом около тысячи трёхсот. Про старый ты
  сказал точно: «моя аудитория это просто друзья, такой был раньше Инстаграм в две тысячи
  четырнадцатом, все смотрели, как ты выкладываешь фотки с закатом. Клиента нет, вообще нет
  клиента». И назвал причину паузы честно: страх осуждения.</p>
  <p>Режим на неделю простой: камеру не выключаешь. Ставишь сбоку и снимаешь, ничего заранее
  не готовим, никаких приколов и инструментов. Это коллекционирование артефактов. Одиннадцатого
  у тебя мероприятие, снимай.</p>
  <p><span class="tc">1:03:15</span> Плюс истории, которых у тебя гора. Ты рассказал про корпоратив
  следователей: играл в сценке курящего коня, который расследует преступление, потому что босс
  ходит на конный спорт. Люди умирали со смеху. Эту историю просто берёшь и рассказываешь
  на камеру, слово в слово, как рассказал мне. Ты сам сказал: «пока ты говоришь, я понимаю,
  что вообще думать не умею». Так и не надо думать, надо включать камеру.</p>
  <p class="note">Твоя же мысль, которая просится в контент отдельно: ведущий это камертон.
  Если ведущий унылый, никаких эмоций у гостей не будет, потому что атмосферу задаёт он,
  а не они.</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Как не стать заложником просмотров</h3>
    <span class="ts">01:06:07</span>
  </div>
  <p>Ты спросил, как отдыхать от контента и не уйти в цифровую зависимость. Механика такая:
  снимаешь по ходу дела и никуда сразу не выкладываешь. Раз в неделю выделяешь в расписании
  два часа, садишься, монтируешь то, что накопилось за пять дней, и ставишь в отложку.</p>
  <p>Тянуть проверять просмотры будет, это проходят все. Лечится одним: фокус с цифр на себя.
  У меня сейчас клиентка-эзотерик застряла ровно здесь, оценивает себя через просмотры: ролик
  не набрал, значит она плохая. Ты формируешь навык, как научился ходить или писать сообщения.
  Результат это вопрос времени, а не оценка тебя. Тем более у тебя как у ведущего этот навык
  умножен на пять: удерживать внимание это твоя работа, осталось включить камеру.</p>
  <p><span class="tc">1:13:39</span> По книгам, которые ты просил. Сначала мой материал про алгоритм
  казино, он ровно про это. Дальше Сет Годин, «Фиолетовая корова» и This is Marketing, базовые
  вещи и без агрессии. И Марти Ноймейер, Zag, про бренд простыми словами, у него же есть
  The Brand Gap.</p>
</section>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Задачи на неделю</h3>
    <span class="ts">01:11:31</span>
  </div>
  <div class="box">
    <p class="lbl">За тобой</p>
    <ul>
      <li>Дописать оффер по корпоративам в документе, который я скинул: довести этапность до конца по каркасу выше.</li>
      <li>Выписать проблемы, страхи, желания и боли корпоративного клиента и придумать решение на каждое. Фантазируй так, будто ресурс неограниченный.</li>
      <li>Прислать мне готовый идеальный вариант, обтешем в чате.</li>
      <li>Скачать Клод. Как подключать, покажу.</li>
      <li>Найти десять контактов: можно пять эйчаров и пять организаторов мероприятий. LinkedIn, Instagram, откуда угодно. Выписывай все соцсети человека.</li>
      <li>Добавить в анкету пункт про бюджет на ведущего.</li>
      <li>Снимать себя всю неделю, включая мероприятие одиннадцатого. Заранее ничего не готовить.</li>
      <li>Выделить в расписании два часа под монтаж и отложку.</li>
      <li>Прислать три-четыре контентные единицы, можно ссылками.</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Разобрать твой вариант оффера, когда пришлёшь, и прикинуть, что оставляем.</li>
      <li>Показать, как поставить и подключить Клод.</li>
      <li>На следующем созвоне утверждаем первый оффер и разбираем заходы к эйчарам и организаторам.</li>
    </ul>
  </div>
  <p class="note">Свадьбы и юбилеи пока не трогаем. Разберёшься с принципом на корпоративах,
  дальше пойдёт сильно быстрее. Если будут аварии и станет сложно, пиши, я на связи.</p>
</section>

<div class="foot">
  Личный созвон 7 сентября 2026, 75 минут.
</div>

</div>
</body>
</html>
`;
