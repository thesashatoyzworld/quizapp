// Конспект личного созвона 2026-09-25. Сгенерирован из
// GSD-BRAND/clients/evgenia-sokolchik/lichnoe/2026-09-25/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_EVGENIYA_2026_09_25 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон · 25 сентября 2026</title>
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
  <p class="kicker">Личный созвон · 25 сентября 2026</p>
  <h1>Грядку собрали, теперь её надо поливать</h1>
  <p class="sub">За месяц пять новых людей и 164 000 заработано. Оффер на созвон, кейсы и
  карусели с оффером уже есть, поэтому сейчас главное это контент: он приводит людей
  в профиль, а профиль приводит заявки. На этот месяц контент стоит первым в приоритетах,
  плюс статья-конвертер и идеи, которые уже где-то сработали.</p>
  <div class="meta">
    <span>57 минут</span>
    <span>164 000 заработано за месяц</span>
    <span>Приоритет месяца: контент</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Съёмка без интернета</a></li>
    <li><a href="#s2">Когда кончилась мана</a></li>
    <li><a href="#s3">Карусель «как сказать мужу»</a></li>
    <li><a href="#s4">Деньги за месяц</a></li>
    <li><a href="#s5">Что уже собрано и чего нет</a></li>
    <li><a href="#s6">Статья: заходим через то, чего они хотят</a></li>
    <li><a href="#s7">Грядка и полив</a></li>
    <li><a href="#s8">Поток спроса: идеи, которые уже сработали</a></li>
    <li><a href="#s9">Вампиры, орки и Джон Уик</a></li>
    <li><a href="#s10">Монтажёр подождёт</a></li>
    <li><a href="#s11">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Неделя в дороге</h2>
  <p>Как не выпасть из контента, когда всё против</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Съёмка без интернета</h3>
    <span class="ts">00:00:45</span>
  </div>
  <p>Ты у мамы в регионе: объявляют беспилотники, глушат всё, открыть сценарий с телефона
  не получается. Дома лают собаки, завела их внутрь, стало ещё хуже. В итоге переписала
  сценарий от руки и нашла квартиру посуточно, чтобы спокойно снять.</p>
  <blockquote><p>Я от руки написала. От руки, короче, переписала его с телефона.</p></blockquote>
  <p>Ты большая молодец: нашла вариант, хотя всегда можно сказать «неудобно, ничего
  не работает, нет настроения». Сними про это рилс: про тех, кто хочет, и тех, кто ищет
  оправдания.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Когда кончилась мана</h3>
    <span class="ts">00:02:23</span>
  </div>
  <p>Когда подбираешься к своему лимиту, можно заставить себя, но это кредит: потом
  заплатишь втрое. Я на такой неделе поступил иначе: взял рилсы, которые уже выкладывал
  в пробники, и выложил их снова. Те, что с говорящей головой, на новую аудиторию сработали
  плохо, а сторителлинг на футажах из галереи лучше. Монтажёр убрал моё лицо и поставил
  футажи.</p>
  <div class="facts">
    <div class="fact"><div class="n">1 400</div><div class="l">просмотров и 10 подписок у перемонтированного ролика</div></div>
    <div class="fact"><div class="n">2 500</div><div class="l">просмотров и 15 подписок у второго</div></div>
  </div>
  <div class="box fix">
    <p class="lbl">Что можешь сделать ты</p>
    <ul>
      <li>У снятых роликов голос уже есть. Открываешь проект, убираешь себя, ставишь футажи из зала, из жизни, из дороги</li>
      <li>Такими роликами добираешь норму на тяжёлой неделе. Это протеиновый батончик, а не еда: одной и той же перевыкладкой трафик не построишь</li>
    </ul>
  </div>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Карусель «как сказать мужу»</h3>
    <span class="ts">00:06:12</span>
  </div>
  <p>Я очень верю в эту идею. Это суперболь: люди, по-моему, из-за этого вообще разводятся,
  потому что не понимают, как об этом разговаривать.</p>
  <blockquote><p>Солдатик под навесом, а навес уже даже сломался. И они, возможно, даже
  не соотносят это с этой причиной.</p></blockquote>
  <div class="box">
    <p class="lbl">Как делаем</p>
    <ul>
      <li>Сразу два варианта: как сказать жене и как сказать мужу. Бьём со всех стволов</li>
      <li>Слово «уёбище» сильно сужает аудиторию. Вариант: написать его, зачеркнуть и сверху написать «чудовище»</li>
      <li>Если карусель сработает, через неделю выкладываем те же смыслы под другим названием. Что сработало раз, сработает второй и третий</li>
      <li>Рилсы на ту же тему сначала в пробники, чтобы твоя аудитория видела карусели, а новая рилсы</li>
    </ul>
  </div>
</section>

<div class="call">
  <h2>Часть 2. Где мы сейчас</h2>
  <p>Цифры месяца и что осталось собрать</p>
</div>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Деньги за месяц</h3>
    <span class="ts">00:09:30</span>
  </div>
  <div class="facts">
    <div class="fact"><div class="n">5</div><div class="l">новых человек за месяц</div></div>
    <div class="fact"><div class="n">77 000</div><div class="l">уже пришло от новых</div></div>
    <div class="fact"><div class="n">164 000</div><div class="l">заработано, если считать полные суммы без рассрочек</div></div>
    <div class="fact"><div class="n">163 500</div><div class="l">пришло всего вместе с теми, кто продлился</div></div>
  </div>
  <p>Считай обе цифры: сколько заработала и сколько получила по факту. Деньги размазываются
  по дистанции, и только вторая цифра показывает, насколько работают наши действия.</p>
  <p>На этой неделе контент почти не выходил, и внимания стало меньше. Это важно замечать.
  Когда видишь связку «контент залетел, пошли заявки, пошли деньги», она крепнет в голове,
  и контент сам поднимается в приоритетах: его делаешь в начале недели и в начале дня,
  а не когда останется время.</p>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Что уже собрано и чего нет</h3>
    <span class="ts">00:15:05</span>
  </div>
  <div class="box fix">
    <p class="lbl">Есть</p>
    <ul>
      <li>Оффер на созвон и две карусели с ним: для женщин и для мужчин</li>
      <li>Три кейса на сайте, ты уже отправляешь на них людей после анкеты</li>
      <li>Два кейса собраны в карусели, призыв в них: «пиши хочу, как Аня»</li>
    </ul>
  </div>
  <div class="box bad">
    <p class="lbl">Нет</p>
    <ul>
      <li>Третий кейс в карусель: вылетел из головы</li>
      <li>Статья-конвертер: ещё не начата</li>
      <li>Оффер и карусель на работу с тобой не собирали, пока и не нужно. Сначала добиваем статью</li>
    </ul>
  </div>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Статья: заходим через то, чего они хотят</h3>
    <span class="ts">00:18:26</span>
  </div>
  <p>Тема та же, про ноги кентавра. Твой вывод из неё: пока ты сама не чувствуешь себя
  кайфово, можно худеть и менять внешность сколько угодно, никто тебя любить и принимать
  не будет. Поменялось всё, когда ты перестала зависеть от того, что тебе говорят.</p>
  <p>Независимость это то, что им надо. А хотят они другого: чтобы на них смотрели мужчины,
  восхищались, чтобы любил муж. И ещё конкуренция с другими женщинами:</p>
  <blockquote><p>Если им сделала комплимент женщина, они будут помнить его вместо тех ста
  комплиментов, которые им сделали мужики.</p></blockquote>
  <p>У мужчин заход через статус и контроль, «хозяин своей жизни». У женщин через эмоции.
  Фитнес и питание здесь инструмент: за ним приходят, потому что чего-то хотят, а внутри
  мы раскрываем независимость.</p>
  <div class="box">
    <p class="lbl">Направления для названия</p>
    <ul>
      <li>Как перестать выключать свет, когда он тебя раздевает</li>
      <li>Как раздеться при нём и не думать о животе</li>
      <li>Тело, после которого бывший не пишет первым</li>
      <li>Как носить то, что нравится, а не то, что прячет</li>
      <li>Как в этот раз выйти на пляж без парео</li>
    </ul>
  </div>
  <p>Чем точнее, тем лучше. Крутимся вокруг этого, остальные варианты отложим на вторую
  статью. Пачку заголовков я тебе скину. Саму статью наговариваешь по пунктам из воркшопа.</p>
</section>

<div class="call">
  <h2>Часть 3. Как контент превращается в заявки</h2>
  <p>Конвертеры есть, нужен трафик</p>
</div>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Грядка и полив</h3>
    <span class="ts">00:29:51</span>
  </div>
  <p>Оффер и кейсы это наша грядка. Контент это вода. Чем больше контента, тем больше
  посещений профиля, чем больше посещений, тем больше анкет. Если грядку не поливать
  трафиком, ничего не вырастет. Сами люди на карусель с оффером заходят только в редких
  случаях.</p>
  <blockquote><p>То есть все эти рилсы, сторис либо карусели, они должны вести на карусель
  на оффер, оффер на созвон.</p></blockquote>
  <div class="box fix">
    <p class="lbl">Как ставить призывы</p>
    <ul>
      <li>Не в каждом ролике, а там, где это логично вытекает из темы</li>
      <li>Ведём на карусель с оффером или на карусели с кейсами</li>
      <li>В «топ способов» призыв обязательно. Пятый способ «начни с себя», шестой «отправь ему это», и оффер для него: превратим его из чудовища в дракона</li>
      <li>Если прямой призыв не ложится, собери мост на два-три слайда, чтобы логично подвести к предложению</li>
      <li>Карусели ссылаются друг на друга: «не понимаешь, как работает жир? вот эта карусель». Так человек ходит по твоему профилю</li>
    </ul>
  </div>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Поток спроса: идеи, которые уже сработали</h3>
    <span class="ts">00:40:49</span>
  </div>
  <p>Пока мы берём идеи из головы, мы не знаем, сработают они или нет. Непроверенная идея
  и непроверенная упаковка. Задача: самой пройти этот путь и собрать идеи, которые уже
  залетели у других на YouTube, в рилсах и каруселях, и взять у них заход и упаковку.</p>
  <p>Где смотреть: кабинет, «Новый уровень контента», уровень 5 «Делаю, но нет результата».
  Там показано, как искать руками, через нейронку и в Инсте.</p>
  <p>Пример: моя карусель «Как продать свой вайб». Заход я взял с ролика на YouTube, который
  набрал 360 тысяч просмотров, а второй её ролик на ту же тему 55 тысяч при 18 тысячах
  подписчиков. Такие выбросы показывают, что людям это нужно.</p>
  <p>Твой смысл «не будешь пахать, будешь выглядеть стрёмно» им надо, но они этого не хотят.
  Можно выкрутить громкость в боль, как делают жёсткие тренеры, но это тянет за собой кучу
  хейта. Проще найти упаковку, которую они хотят, и завернуть смысл в неё. Как с быстрыми
  способами похудеть: смеёмся над ними, даём свою позицию (чем быстрее худеешь, тем дороже
  платишь и тем быстрее жир вернётся с братками) и ссылаемся на следующую карусель.</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Вампиры, орки и Джон Уик</h3>
    <span class="ts">00:49:16</span>
  </div>
  <blockquote><p>Есть ли у вампиров дефицит витамина D?</p></blockquote>
  <p>Это охуенно, делаем и рилсы, и карусели. Как худеют орки, эльфы, зомби, диета ситхов
  и джедаев, почему у Джона Уика не клинит поясницу, когда он дерётся в тесной тройке.
  Здесь сходится то, что им надо, и то, чего они хотят. Внутрь встраиваешь свои смыслы
  и дальше отправляешь на свои тейки.</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Монтажёр подождёт</h3>
    <span class="ts">00:50:34</span>
  </div>
  <p>На красиво пока забиваем. Нанять монтажёра логично, но не сейчас. Этот месяц контент
  у тебя номер один, и делаешь его сама, чтобы мозг увидел, что связка работает. Если
  держать ритм пять-семь единиц контента в неделю, за второй месяц денег должно быть
  примерно вдвое больше. Когда пойдёт по три сотни, выделишь 20–25 тысяч на монтажёра,
  и это решение придёт само.</p>
  <p>Сейчас ты зашиваешься не из-за объёма. Расписание ещё не внедрено, и ты в дороге.
  По графику время у тебя есть.</p>
  <blockquote><p>Если я ставлю сценарий два часа, по-любому я буду там примерно четыре сидеть.</p></blockquote>
  <p>Учись делать быстро. Поставила два часа, два часа сидишь, время закончилось, всё.
  Писателей так учат: четыре тысячи слов в день, не меньше и не больше, даже если
  вдохновение. Стабильность это признак мастерства.</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">00:54:30</span>
  </div>
  <ul class="chk">
    <li>На следующей неделе выложить всё, что сейчас снимаешь (почему после свадьбы полнеют и остальное), и параллельно готовить контент на неделю после</li>
    <li>Собрать «топ способов» для женщин: оформить в карусель и параллельно записать рилсы. Призыв на оффер обязательно</li>
    <li>Карусель «как сказать мужу»: «уёбище» зачеркнуть и написать «чудовище». Рилсы сначала в пробники</li>
    <li>Снять ещё три рилса, которые обговорили</li>
    <li>Собрать третий кейс в карусель</li>
    <li>Статья-конвертер: наговорить по пунктам из воркшопа</li>
    <li>Пройти уровень 5 «Нового уровня контента» и собрать идеи, которые уже сработали у других</li>
    <li>Сделать контент про вампиров, орков, ситхов и Джона Уика</li>
    <li>Призывы ставить там, где логично: на карусель с оффером или на кейсы</li>
    <li>Работать по таймеру: сколько поставила, столько и сидишь</li>
    <li>Считать две цифры: сколько заработала и сколько пришло по факту</li>
    <li>По желанию: рилс про съёмку без интернета и сценарий от руки</li>
  </ul>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Скинуть пачку вариантов названия для статьи</li>
    </ul>
  </div>
</section>

<div class="foot">
  Личный созвон 25 сентября 2026, 57 минут.
</div>

</div>
</body>
</html>
`;
