// Конспект личного созвона 2026-09-28. Сгенерирован из
// GSD-BRAND/clients/daniel-osipov/lichnoe/2026-09-28/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_DANIEL_2026_09_28 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон 28 сентября 2026</title>
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
<body>
<div class="wrap">

<header class="doc">
  <p class="kicker">Личный созвон · 28 сентября 2026</p>
  <h1>Та же комната, другой коридор</h1>
  <p class="sub">Контент перестал быть обязаловкой, и тебя потянуло учить юмору и импровизации.
  Решили так: месяц полный фокус на контент в эту сторону, начинаем с чат-рулетки,
  оффер и продажи пока не трогаем.</p>
  <div class="meta">
    <span>56 минут</span>
    <span>Фокус: месяц контента про юмор и импровизацию</span>
    <span>Первый формат: чат-рулетка</span>
    <span>Оффер для корпоративов: на паузе</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Неделя: снимаешь и кайфуешь</a></li>
    <li><a href="#s2">Проблему выгружать на бумагу</a></li>
    <li><a href="#s3">Люди, которых не понять</a></li>
    <li><a href="#s4">Если у меня всё есть, у меня всё будет</a></li>
    <li><a href="#s5">Дырку не заполнить просмотрами</a></li>
    <li><a href="#s6">Тянет учить юмору и импровизации</a></li>
    <li><a href="#s7">Юмор как инструмент, продаём проявленность</a></li>
    <li><a href="#s8">Десять тысяч за час</a></li>
    <li><a href="#s9">Та же комната, другой коридор</a></li>
    <li><a href="#s10">Поставить себя в условия без плана</a></li>
    <li><a href="#s11">Чат-рулетка</a></li>
    <li><a href="#s12">Нужен оператор</a></li>
    <li><a href="#s13">Продажи потом</a></li>
    <li><a href="#s14">Карта остаётся</a></li>
    <li><a href="#s15">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Что поменялось</h2>
  <p>Контент и голова за эту неделю</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Неделя: снимаешь и кайфуешь</h3>
    <span class="ts">00:00:05</span>
  </div>
  <p>Много сторис про юмор и про то, куда ты хочешь в мероприятиях. Снял даже, как ходишь
  на бесплатный разговорный клуб по английскому. Сам говоришь, что раньше никогда бы такое
  не выложил. Плюс один рилс про юмор и сегодня видеовизитка.</p>
  <p><span class="tc">00:42</span> Главное даже не количество. Вырабатывается привычка: что-то
  интересное в жизни, сразу достаёшь телефон. И нет надрыва «сейчас сниму, и это зайдёт».
  Снимаешь спокойно и сам от этого получаешь удовольствие.</p>
  <blockquote>Получилось прочувствовать момент: снимать контент для работы, а не быть зависимым от него.</blockquote>
  <p>Это супер. Когда съёмка перестаёт иметь негативный привкус, психика сама поднимает её
  в приоритетах. То, что нам не нравится, мозг старается выкинуть, то, что в кайф, двигает наверх.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Проблему выгружать на бумагу</h3>
    <span class="ts">00:02:10</span>
  </div>
  <p>Ты рассказал про книгу «Терапия беспокойства»: по методам КПТ выписываешь страхи,
  убеждения, ложные установки и перепрошиваешь их. Сидишь пять часов, пишешь и не веришь,
  что правда так думал. После этого на всё смотришь по-другому, и взгляды поменялись
  буквально за два-три дня.</p>
  <p><span class="tc">03:10</span> У меня тетрадка сейчас работает как батут. Когда всё
  плюс-минус ровно, пишу редко. Как только появляется фоновая тревога или всплывают заёбы,
  сажусь писать. Нас никто не учил, как жить: мы первое поколение, у которого вся
  Александрийская библиотека лежит в кармане, и учимся по ходу.</p>
  <p><span class="tc">05:40</span> Проблему, которая крутится в голове, головой не решить:
  ты пытаешься решить её тем же мозгом, который её создал. Собака, которая бегает за хвостом.</p>
  <blockquote>Выгрузил проблему на бумагу, это уже половина решения. Мозг переключается
  из режима думания о проблеме в режим её решения.</blockquote>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Люди, которых не понять</h3>
    <span class="ts">00:06:31</span>
  </div>
  <p>Ты поймал себя на том, что люди живут в ожидании, каким будет их будущее, и в мыслях
  о прошлом: что не так ответил, зачем были те отношения. И стоят на месте этими мыслями.
  Лучше поставить цель и всё делать в настоящем.</p>
  <p><span class="tc">07:39</span> Мой пример. Были в жизни люди, чья категория непонятна:
  чувак появляется, мы вместе суетимся, потом он пропадает на год, потом снова друзья,
  потом снова два года тишины. С девушкой то же самое: тянемся, стоп, опять тянемся, стоп.
  Я долго ломал голову и пытался вытащить из них ответы. Потом понял, что трачу кучу
  энергии на людей, которые не могут разобраться в себе.</p>
  <p>С теми, кто понятен, всё понятно и без додумывания. Друг остаётся другом, даже если мы
  год не общаемся: встретились и за два часа решили любую проблему.</p>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Если у меня всё есть, у меня всё будет</h3>
    <span class="ts">00:11:01</span>
  </div>
  <p>Когда ставишь своё состояние на первое место, будущее перестаёт иметь такое значение.
  Ты знаешь вектор, в котором тебе клёво. Я это собрал в одну фразу:</p>
  <blockquote>Если у меня всё есть, у меня всё будет.</blockquote>
  <p><span class="tc">11:49</span> Сначала страшно: получается, от целей отказаться? Нет,
  тут про доверие к себе. Психолог мне как-то сказала: «Ты хочешь выиграть в игру или
  с кайфом поиграть?» Я себя знаю: если играю с кайфом, я её по-любому пройду.
  Зачем тогда стараться пройти.</p>
  <p>Когда ты на сто процентов принимаешь свою реальность, внутри нет дырок, которые надо
  затыкать суррогатами. Тогда вещи начинают приходить легко, потому что они тебе не нужны.
  Ты добавил, что даже деньги в этот момент становятся следствием.</p>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Дырку не заполнить просмотрами</h3>
    <span class="ts">00:13:28</span>
  </div>
  <p>Ты сказал, что контент, который выкладываешь с заёбом и ненавистью, ничего хорошего
  не принесёт. Просмотры и подписчиков он принесёт, но это не то.</p>
  <p><span class="tc">13:51</span> Представь дырку внутри, которую пытаешься чем-то
  компенсировать. Положил туда просмотры, чтобы почувствовать себя значимым, и пустота
  выросла ровно на столько же. Был литр, заполнил литр, стало два. Налил два, там уже четыре.
  Это бесконечно, пока латаешь внутреннее внешним.</p>
  <p>Закрывается это через принятие того, что есть сейчас, и благодарность. Жизнь
  замечательна у тех, кто её замечает. Когда объём заполнен, человек светится, и это
  чувствуется. На свет слетаются все: никто не хочет общаться с душными и тяжёлыми.</p>
  <div class="box">
    <p class="lbl">Как это связано с контентом</p>
    <p>Когда ребята переживают, что где-то слишком резко или неправильно, я говорю: вообще
    похуй. Люди идут на внутреннюю силу, а внутренняя сила это смелость быть полным и жить
    жизнь на сто процентов. Это возможно в любом возрасте, в любой профессии и нише.
    Круто, что ты приходишь к этому в двадцать четыре.</p>
  </div>
</section>

<div class="call">
  <h2>Часть 2. Новый вектор</h2>
  <p>Куда тянет и как это стыкуется с мероприятиями</p>
</div>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Тянет учить юмору и импровизации</h3>
    <span class="ts">00:17:18</span>
  </div>
  <p>Раньше было чувство, что навыков и знаний много, а куда направить, непонятно. Сейчас
  как будто выходишь из тоннеля. Корпоративы, юбилеи и свадьбы ты по-прежнему хочешь вести.
  Но когда начал выкладывать рилсы про юмор, про его магию, пошли хорошие отклики,
  и тебя тянет именно туда.</p>
  <blockquote>Монтирую в CapCut и думаю: ебать, что будет. И мне хочется вот туда.</blockquote>
  <p><span class="tc">18:39</span> Ты боишься, что отклики это иллюзия. А какая разница?
  Ты интуитивно чувствуешь, что, когда это делаешь, из тебя прёт. Значит делаем.</p>
  <p><span class="tc">19:17</span> Снова рассказал про Мишу. Пятьдесят четыре года,
  геодезист, месяц сомневался, покупать или нет, потом приносил сценки по анекдотам.
  Я ему говорил одно: ты прячешься за масками. Он снял ролик прямо на стройке,
  и тот улетел на шестьсот тысяч. Он пошёл не от рабочих задач, а от своей реальности.
  Дальше совет простой: шути свои шутки на стройке с мужиками.</p>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Юмор как инструмент, продаём проявленность</h3>
    <span class="ts">00:21:35</span>
  </div>
  <p>Юмор и импровизация здесь инструмент. Я спросил, что они дают человеку. Ты ответил:
  стабильную самооценку и лютую уверенность, потому что принимаешь себя таким, какой есть.
  Это и есть проявленность.</p>
  <p><span class="tc">22:01</span> С фитнес-тренерами та же история. Они всех заебали
  «похудей на десять килограмм». Люди заходят в соцсети не худеть, а отвлечься от
  похудения. Им нужно другое: чувство контроля, уверенность, вернуть свою силу.</p>
  <div class="box">
    <p class="lbl">Если думать про продукт</p>
    <p>Я бы выстраивал его вокруг проявленности. Но вперёд не забегаем: ты этим занимаешься
    недавно, сам сейчас в пересборке, и твёрдые результаты другим людям нам пока
    предложить сложно.</p>
  </div>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Десять тысяч за час</h3>
    <span class="ts">00:23:09</span>
  </div>
  <p>Чувствуешь, что поднимаешься на уровень выше: хочется не просто вести, а учить.
  И уже заработал на этом. Предприниматель из чата по нейрогимнастике видел, что ты ведущий
  и выступаешь на стендапе, и написал: хочу обрести чувство юмора, это важно для работы.
  Ты в Zoom рассказал ему свои упражнения на ассоциативное мышление и каламбуры и получил
  десять тысяч за час.</p>
  <blockquote>Эта десятка дороже, чем двести штук за мероприятие.</blockquote>
  <p>Он нашёл тебя случайно. А таких, как он, очень много.</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Та же комната, другой коридор</h3>
    <span class="ts">00:27:20</span>
  </div>
  <p>Ты сам сформулировал: когда люди увидят тебя в юморе и импровизации, продавать себя
  можно будет везде. И ведущим, и тренером, и куда угодно.</p>
  <p><span class="tc">27:43</span> Это двери в одну и ту же комнату. Ты окунулся
  в творчество и понял, что коридор коммерса сейчас не твой. Но комната та же. Карина
  Мурашкина ведёт мероприятия и делает свои шоу. У кого есть аудитория, те и корпоративы
  ведут, и чеки там другие. Поэтому фокусируемся на контенте.</p>
  <p><span class="tc">28:23</span> Ты видишь много мест, где импровизация нужна, а её
  не учат. В академии Матч ТВ учат читать с суфлёра, хотя у ведущего на эфире никогда
  ничего не идёт по плану. Ты уже написал шеф-редактору, с которым там познакомился,
  идея ему понравилась, и он понёс её начальству. С ораторскими курсами то же самое:
  учат говорить, но не импровизировать.</p>
  <p><span class="tc">30:07</span> С хорошим портфолио в импровизации и юморе ты сможешь
  заходить туда, и это новый трафик с богатыми клиентами. Похожее у тебя уже было: работал
  в клубе мафии, собрал огромную базу постоянников, вышел в самозанятость, и они пошли
  за тобой. Сейчас как будто нашёл ещё глоток свежего воздуха.</p>
</section>

<div class="call">
  <h2>Часть 3. Форматы</h2>
  <p>Что снимаем и с чего начинаем</p>
</div>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Поставить себя в условия без плана</h3>
    <span class="ts">00:24:45</span>
  </div>
  <p>Кого посмотреть: Илья Куруч, он ходит по улицам и в метро в разных образах и заранее
  собирает словесные комбо из прилагательных и существительных. Полуимпровизация, очень
  смешно. И Карина Мурашкина, она снимала юморные вайны, а сейчас очень популярная ведущая.</p>
  <p><span class="tc">26:18</span> Для импровизации нужно создавать себе условия, где ты
  реально не знаешь, что будешь делать. Иду в заведения, чтобы меня бесплатно накормили.
  Договориться с таксистом о бесплатной поездке. Добыть бесплатные цветы. Сразу появляется
  вызов, а сверху юмор и импровизация, и это комбо даёт очень много контента.</p>
  <p><span class="tc">31:06</span> Можно радикальнее: доехать до Самары с нулём денег,
  только на импровизации и чувстве юмора. Серия роликов. Мой кент так доехал на велосипеде
  из Екатеринбурга до Сочи и набрал шестьдесят тысяч подписчиков. Правда, деньги на этом
  зарабатывать у него не вышло, коммерческая часть не качалась.</p>
  <p><span class="tc">32:44</span> Ещё варианты. Попросить друзей придумать тебе задание,
  о котором ты не знаешь. Или механика как в DnD: есть гейм-мастер, который говорит, куда
  идти и какая следующая задача, а ты не знаешь, что будет дальше. Позвонить куда-нибудь
  и залутать бесплатную пиццу.</p>
  <blockquote>Я прям это чувствую. Я бы с кайфом это сделал.</blockquote>
  <p><span class="tc">34:56</span> Ты сказал, что вся проблема импровизации в том, что
  люди не понимают, как её продать. Импровизаторы, которые учились в Америке, преподают
  в России и получают девяносто, сто тысяч в месяц. Потому что контент для себя не делают
  и про них никто не знает.</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Чат-рулетка</h3>
    <span class="ts">00:38:20</span>
  </div>
  <p>Самое простое, что можно делать не выходя из дома: не нужен человек и не нужна
  подготовка. Садишься в чат-рулетку и погнал. Задача, например, рассмешить десять человек
  за десять минут, на экране таймер, и в ролике пишем, что ты не готовишься,
  это чистая импровизация.</p>
  <p><span class="tc">39:37</span> Можно и длинные ролики: нейронка или чат рандомно
  выдаёт тебе персонажа, и ты, не переодеваясь, с каждым новым собеседником становишься
  другим. С одним ты инженер из Ульяновска, которого бросила жена, со следующим сразу
  предприниматель из Саратова, у которого пять минут назад угнали Прадо. Из этого режутся
  нарезки.</p>
  <p><span class="tc">38:43</span> Ты сформулировал, в чём тут магия юмора: хорошо шутить
  получается, когда разрешаешь себе смеяться над собой. Когда не боишься быть глупым,
  странным, любым. Чат-рулетка это как раз показывает. Как с девушкой с собакой на
  разговорном клубе: ты сказал «какой красивый слон», и её разъебало.</p>
  <p><span class="tc">44:28</span> Посмотрели западный ролик из чат-рулетки, где парень
  «застал свою девушку с другим», а в итоге выясняется, что это близняшки. Это постановка,
  но отыграно так, что веришь, и там миллионы просмотров. Снято без оператора, просто
  экраном. Ещё скину тебе фокусника, который показывает в чат-рулетке пошлые фокусы
  и жёстко стебётся над собеседниками.</p>
  <div class="box">
    <p class="lbl">Почему вызов работает</p>
    <p>Когда есть интересный вызов, у зрителя сразу вопрос: получится или нет. Значит он
    досмотрит до конца, а не пролистает, как пролистал бы просто разговор. Я так раскачивал
    свой TikTok до двухсот семидесяти тысяч: звонил в Додо и читал рэп, делали постановки
    со звонками, просил людей на улице сказать три слова и собирал из них трек.</p>
  </div>
</section>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Нужен оператор</h3>
    <span class="ts">00:48:20</span>
  </div>
  <p>Для всего, что с живым взаимодействием на улице, сам снимать не сможешь. Нужен
  человек, который будет ходить за тобой с камерой. Плюс можно ходить на открытые микрофоны,
  ничего не писать заранее и работать с залом.</p>
  <p><span class="tc">53:35</span> Напиши в треде: нужен видеограф, Москва, пишите в личку.
  Закидают, желающих будет много. Одно но: в диалоге проверяй и щупай, чтобы
  не пропадали. Это у них самое частое.</p>
</section>

<section id="s13">
  <div class="sec-head">
    <span class="sec-num">13</span>
    <h3 class="t">Продажи потом</h3>
    <span class="ts">00:43:07</span>
  </div>
  <p>Ты хотел показать тренера по речи Вячеслава Усова, которому очень круто удаётся себя
  продавать. Давай разделять. Сначала запускаем ветку контента, чтобы в течение месяца
  ты вошёл в ритм и ролики выходили постоянно. Как продавать, разберёмся дальше, принцип
  тот же, что с оффером для корпоративов: у людей есть проблема, мы решаем её своими
  инструментами.</p>
  <p><span class="tc">43:49</span> Ты прав, так мы убиваем двух зайцев: показывая себя
  в импровизации и юморе, продаёшь себя и как тренера по юмору, и как ведущего.</p>
  <p><span class="tc">50:02</span> Экспертные ролики тоже можно, миксуй. Правил нет:
  это твой дом, ставь стол куда хочешь. Важно, чтобы всё шло в одном векторе. Стратегическая
  задача одна: чтобы как можно больше людей начали тебя смотреть. Принесёт ли это
  мероприятия и обучения? Сто процентов.</p>
  <p><span class="tc">54:24</span> Тренер по речи продаётся проще: эту идею давно продали
  до нас, она привязана к медийности, к блогам и конференциям. Юмор продавать будет чуть
  сложнее, но думать об этом сейчас нет смысла. Пойдёт трафик, тогда и будем щупать.</p>
</section>

<section id="s14">
  <div class="sec-head">
    <span class="sec-num">14</span>
    <h3 class="t">Карта остаётся</h3>
    <span class="ts">00:55:20</span>
  </div>
  <p>Ты спросил, будет ли теперь другая карта. Нет. Ты просто оголодал по творчеству:
  долго себя душил, а сейчас отпустил, и тебя тянет в эту сторону. Поделаешь неделю-другую,
  столкнёшься с реальностью, что деньги всё равно нужно зарабатывать, пойдут обращения,
  и оффер понадобится, чтобы было что показывать людям. К этой задаче вернёмся, когда
  накопится мана. Со временем всё сбалансируется, а пока идём туда, куда несёт поток.</p>
  <p>В Инстаграме пока ничего не меняем, просто пилим контент весь месяц.</p>
</section>

<section id="s15">
  <div class="sec-head">
    <span class="sec-num">15</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">00:54:58</span>
  </div>
  <div class="box">
    <p class="lbl">За тобой</p>
    <ul>
      <li><b>Ролики из чат-рулетки.</b> На этой неделе. Например, рассмешить десять человек за десять минут, таймер в кадре, без подготовки.</li>
      <li><b>Ссылки на Инстаграм.</b> Каждый ролик сразу заливаешь и кидаешь ссылку в чат.</li>
      <li><b>Выписать ситуации без плана.</b> Куда себя можно поставить: поездка без денег, бесплатная еда, таксист, задание от друзей.</li>
      <li><b>Найти оператора.</b> Пост в треде «нужен видеограф, Москва», в диалоге проверять, что человек не пропадёт.</li>
      <li>Посмотреть Илью Куруча, Карину Мурашкину и комика, название которого я скинул.</li>
      <li>Скинуть мне ролики Вячеслава Усова и фокусника со стендапа.</li>
      <li>В Инстаграме ничего не меняем, месяц полный фокус на контент.</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Запись созвона и конспект.</li>
      <li>Скинуть ролик с чат-рулеткой и фокусника из чат-рулетки.</li>
      <li>Накидывать в чат идеи форматов и гипотезы, как их снять.</li>
    </ul>
  </div>
</section>

<div class="foot">
  Личный созвон 28 сентября 2026, 56 минут.
</div>

</div>
</body>
</html>
`;
