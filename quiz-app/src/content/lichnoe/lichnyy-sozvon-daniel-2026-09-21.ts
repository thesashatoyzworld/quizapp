// Конспект личного созвона 2026-09-21. Сгенерирован из
// GSD-BRAND/clients/daniel-osipov/lichnoe/2026-09-21/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_DANIEL_2026_09_21 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон 21 сентября 2026</title>
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
  <p class="kicker">Личный созвон · 21 сентября 2026</p>
  <h1>Люди хотят людей, а не глянец</h1>
  <p class="sub">Неделя закрыта почти вся, камера перестала пугать. Дальше про то, как не прятаться
  за отыгрышем в кадре, какие форматы пробуем прямо сейчас и почему мафию с квизами трогаем
  только после того, как добьём ветку корпоративов.</p>
  <div class="meta">
    <span>67 минут</span>
    <span>Долг: видео про случай на свадьбе</span>
    <span>Новые форматы: уровни, разбор импровизации</span>
    <span>Приоритет: корпоративы, остальное после</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Неделя: сделал почти всё</a></li>
    <li><a href="#s2">Миша, который прятался за юмором</a></li>
    <li><a href="#s3">Формат говорящей головы</a></li>
    <li><a href="#s4">Туман войны и метод проб</a></li>
    <li><a href="#s5">Уровни ведущего мероприятий</a></li>
    <li><a href="#s6">Импровизация как тема роликов</a></li>
    <li><a href="#s7">Продающее пока не зашиваем</a></li>
    <li><a href="#s8">Мафия и квизы: не сейчас</a></li>
    <li><a href="#s9">Суббота: прожарка не в тот момент</a></li>
    <li><a href="#s10">Мероприятие прошло не так, это не про тебя</a></li>
    <li><a href="#s11">Клод: двадцать долларов и урок в кабинете</a></li>
    <li><a href="#s12">Монтаж нейронкой</a></li>
    <li><a href="#s13">Не пушить себя</a></li>
    <li><a href="#s14">Книжки против действия</a></li>
    <li><a href="#s15">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Контент</h2>
  <p>Что снимаем на этой неделе и в каком порядке</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Неделя: сделал почти всё</h3>
    <span class="ts">00:00:00</span>
  </div>
  <p>Визитка, сторис, съёмка. Не записал только видео про случай на свадьбе, хотя сам думал,
  что вообще ничего не успеешь. Сразу после созвона садишься за трэш-историю, пока в потоке.</p>
  <blockquote>Я думал, я вообще не успею всё сделать, но в итоге много чего сделал.</blockquote>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Миша, который прятался за юмором</h3>
    <span class="ts">00:00:38</span>
  </div>
  <p>Рассказал про парня из группы, у которого сейчас полетел контент. Он пришёл, долго сомневался,
  потом купил, потом ещё две недели морозился с апгрейдом. Я ему с самого старта говорил одно
  и то же: ты прячешься за юмором, как только перестанешь прятаться, всё начнёт работать.
  Взрослый мужик, который хочет шутить и заниматься стендапом.</p>
  <p><span class="tc">01:09</span> Он каждый раз приносил одни и те же рилсы со сценками. Такое
  работало три года назад, когда я начинал. Сейчас это никому не нужно, и по цифрам видно:
  двести, триста просмотров. Я говорил: начни показывать себя, натягивай свой юмор на реальную
  жизнь. Ты же знаешь таких комиков, Рязанов, Задорнов. Они не анекдоты писали, они про жизнь
  рассказывали, и грустно, и весело.</p>
  <p><span class="tc">02:50</span> Через неделю он начал выкладывать со стройки: рассказывает,
  какой там происходит пиздец. Первый ролик тридцать тысяч просмотров, дальше сто двадцать тысяч.
  Даже если бы цифры были скромнее, это всё равно лучше, чем отыгрывать фасад.</p>
  <blockquote>Люди хотят людей. Не глянец, не жёсткий лоск, а настоящие истории.</blockquote>
  <p>Ему же сказал упростить язык: строительные термины, и на двадцатой секунде мозг отключается.
  Рассказывай так, будто объясняешь ребёнку, тогда понятно всем.</p>
  <div class="box">
    <p class="lbl">Зачем я это тебе рассказываю</p>
    <p>Твоя тема лежит в той же плоскости. Когда мы притягиваем аудиторию отыгрышем, мы неизбежно
    упираемся в то, что как только отыгрыш заканчивается, людям плевать. Ты как таковой им
    не интересен. Канал с мемами тоже всегда будет работать, но человека за ним никто
    не заметит. Нам нужно ядро, которому интересен ты.</p>
  </div>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Формат говорящей головы</h3>
    <span class="ts">00:05:00</span>
  </div>
  <p>Показал автора, продукт которого купил накануне. Шестьсот тысяч подписчиков, набрал их
  на формате, где он просто включает фронталку и рассказывает. Кадр чуть более профессиональный,
  но по сути это говорящая голова. Ролики улетают на миллионы.</p>
  <p><span class="tc">08:22</span> Начало у него всегда одинаковое, он сразу говорит, для кого это:
  «Привет, интересные люди, curious humans. Добро пожаловать в мою рубрику. Если вы любите думать,
  эта серия для вас».</p>
  <p>Ты сам сказал, что тебе всегда интересно смотреть, как человек что-то говорит на камеру:
  листаешь ленту, а там наконец живой человек, и это может касаться тебя. Значит пробуем.</p>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Туман войны и метод проб</h3>
    <span class="ts">00:09:28</span>
  </div>
  <p>Мы сейчас как в начале игры: карта закрыта туманом, где лежит твоё золото, мы не знаем.
  Задача не угадать с первого раза, а исследовать карту. Чем больше исследуем, тем больше данных.
  Поэтому форматы не выбираются в голове, они щупаются руками.</p>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Уровни ведущего мероприятий</h3>
    <span class="ts">00:21:55</span>
  </div>
  <p>Формат, который я скидывал в группу. Один человек в трёх точках кадра, камера стоит на месте,
  маски собираются в CapCut. Подписи: новичок, любитель, продвинутый. И дальше показываешь,
  как каждый из них, например, здоровается с залом.</p>
  <p>В СНГ его ещё никто не трогал, я сам его пару месяцев держу в сохранёнках. Делается несложно,
  главное чтобы камера не двигалась. Двух-трёх роликов хватит, чтобы понять, заходит или нет.
  Плюс такое попадает и в коллег, а это тоже нормально.</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Импровизация как тема роликов</h3>
    <span class="ts">00:23:14</span>
  </div>
  <p>Ты принёс две свои идеи, обе рабочие.</p>
  <ol class="steps">
    <li><b>Корпоратив, где ты был говорящим конём.</b> Такого никто не слышал, это твоя уникальность.</li>
    <li><b>Разбор импровизации.</b> Люди думают, что у ведущих и у политиков всё заготовлено.
    На самом деле заготовок нет, есть развитый импульс: человек быстро входит в реакцию.</li>
  </ol>
  <p><span class="tc">24:33</span> Твой пример: Рейган, рядом лопается воздушный шар, и он говорит
  «промахнулись». Заготовить такое невозможно, это чистая импровизация.</p>
  <blockquote>Импровизация дарит легендарные моменты. Вы не можете к ним подготовиться,
  но вы можете создать для них условия.</blockquote>
  <p><span class="tc">25:14</span> Второй заход к той же теме: разбирать известные сцены из фильмов,
  где актёров явно понесло и сцена не была заскриптована. Из недавнего мне попалась сцена
  из «Острых козырьков», где Том Харди орёт на героя Киллиана Мёрфи. Главное, чтобы тебе самому
  было интересно это крутить и разбирать.</p>
  <div class="box">
    <p class="lbl">Почему это работает</p>
    <p>Это называется заимствование авторитета, вирусное ядро. Тебя пока никто не знает, но Рейгана
    и Тома Харди знают все. Посмотрят из-за них, а подпишутся из-за тебя: из-за того, что ты
    про это говоришь.</p>
  </div>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Продающее пока не зашиваем</h3>
    <span class="ts">00:26:49</span>
  </div>
  <p>Ты предложил сразу разворачивать разбор в сторону «и на вашем празднике будет так же».
  Пока не надо. Сначала просто начни их делать, продающие ингредиенты зашьём потом, вместе.</p>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Мафия и квизы: не сейчас</h3>
    <span class="ts">00:29:10</span>
  </div>
  <p>Ты хочешь контент про мафию и квизы, потому что спрос на них есть и они идут с понедельника
  по четверг, а корпоративы на выходных. Тема живая: сейчас идёт шоу «Мастер игры», можно сделать
  разбор, можно «пять способов разнообразить мафию», про квизы контента почти никто не делает.
  Из того же ряда настолки: ребята с запада первыми начали стримить свои партии в DnD без графики,
  три камеры и люди, которые читают вслух, и раскачали себя до миллионов подписчиков и двух
  мультиков.</p>
  <p><span class="tc">34:00</span> Но порядок такой: сначала добиваем ветку корпоративов, потом
  по этому же принципу разворачиваем свадьбы, мафию и квизы.</p>
  <blockquote>Оффер, сайт, анкета и кейсы это грядка с семечками. Пока грядки нет, мы просто льём
  воду на землю: практикуемся, а прорасти там нечему.</blockquote>
</section>

<div class="call">
  <h2>Часть 2. Суббота и выводы</h2>
  <p>Про мероприятие, которое пошло не по плану</p>
</div>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Суббота: прожарка не в тот момент</h3>
    <span class="ts">00:10:54</span>
  </div>
  <p>Ты сам разобрал: прожарку воткнул в начало, когда зал ещё не разогрет. После того как ребята
  попели и потанцевали, та же прожарка зашла бы. Не шутка была плохая, а момент.</p>
  <blockquote>Это ошибка, но это не значит, что я плохой.</blockquote>
  <p>Это и есть здоровая петля обратной связи: провёл, посмотрел на реакцию, сделал вывод, поправил.
  Что обычно делают вместо этого: забирают всё на себя и уходят в самобичевание. На следующее
  мероприятие человек выходит не подготовленным, а с завышенной планкой ожиданий, начинает очень
  стараться, и получается хуже. Людям нравится лёгкость, а не старание.</p>
  <p><span class="tc">13:00</span> В переговорах то же самое. Получили отказ, расстроились,
  не обработали, следующая заявка приходит, и мы заходим на созвон с мыслью «теперь по-любому
  надо продать». И начинаем перебарщивать.</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Мероприятие прошло не так, это не про тебя</h3>
    <span class="ts">00:15:07</span>
  </div>
  <p>Твоя история: премиальная мафия, которую ты ведёшь постоянно, выложила афишу на среду
  без тебя. Написал им, ответили, что очень любят, но хотят попробовать другого ведущего.
  Раньше принял бы на свой счёт, сейчас нет. Человек хочет сравнить, это нормальная практика.</p>
  <p>Я так же научился не тащить на себя чужое. У меня была девочка, которая зашла на три месяца
  и вышла через полтора: оказалось, не готова делать то, о чём договаривались. Один рилс
  в инстаграме, ничего не набрал, а планка требований к себе такая, будто она миллион
  на казино поставила. За ней приходилось бегать, на пятый раз я сказал, что так не могу.</p>
  <p>Когда границы выстроены, ты не принимаешь провал на личный счёт. Не ты плохой. Может,
  каких-то навыков пока не хватает, их можно развить. Может, вылезло то, чего ты не мог
  предвидеть, теперь знаешь.</p>
</section>

<div class="call">
  <h2>Часть 3. Нейронки</h2>
  <p>Что ставим на этой неделе и зачем</p>
</div>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Клод: двадцать долларов и урок в кабинете</h3>
    <span class="ts">00:35:40</span>
  </div>
  <p>Тяжело не потому что сложно, а потому что новое. Новое всегда тяжело. Берёшь подписку
  за двадцать долларов, оплата с российской карты проходит через МТС Pay.</p>
  <p><span class="tc">36:48</span> Ты спросил, чем Клод лучше других. По-честному, на бытовых задачах
  разницы нет, это как спорить, «Макларен» или «Феррари»: решает пилот. Я сажаю всех на Клод просто
  потому, что сам работаю в нём, собрал на нём не один сайт и приложение и точно знаю, где что
  ломается и как чинится. В чужой экосистеме я тебе так не помогу.</p>
  <p class="note">Урок про нейронки уже лежит у тебя в кабинете, я отправлял его тебе в бота.
  Если не найдёшь сообщение, открывай кабинет и листай вниз до раздела «Нейронки».</p>
</section>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Монтаж нейронкой</h3>
    <span class="ts">00:38:24</span>
  </div>
  <p>Ты спросил, монтирую ли я сам. Смысл вопроса понятен: либо платишь монтажёру, либо платишь
  за нейронку. Нейронка на говорящей голове уже справляется, а чуть сложнее, и это большой процесс:
  транскрибация, сверка со скринами, нарезка. Токенов жрёт много.</p>
  <p>Из свежего: DaVinci можно подключить к Клоду и командовать программой словами, ничего в ней
  не умея. Сам пока не пробовал, но это вопрос времени.</p>
  <blockquote>Бабки рубят не те, кто боится, что нейронка заменит мир, а те, кто пользуется
  удобством.</blockquote>
  <p><span class="tc">41:14</span> Так было с радио против газет, так было в двадцать первом году
  с тиктоком: взрослые серьёзные предприниматели говорили, что это детский сад, а через два года
  все завели себе и шортсы, и рилсы. Сейчас ко мне приходят сорокалетние мужики со словами
  «пора начинать личный бренд».</p>
  <p><span class="tc">01:05:12</span> Твоя идея в конце: подключить нейронку к телеграм-боту,
  чтобы квиз про компанию собирался сам. Загрузил информацию, на выходе готовая презентация,
  а не три-четыре часа руками. Это как раз то, ради чего я и плачу за подписку: она забирает
  время и нервы. Конспект этого созвона собирается так же.</p>
</section>

<div class="call">
  <h2>Часть 4. Личное</h2>
  <p>Твой вопрос про трансформацию</p>
</div>

<section id="s13">
  <div class="sec-head">
    <span class="sec-num">13</span>
    <h3 class="t">Не пушить себя</h3>
    <span class="ts">00:43:54</span>
  </div>
  <p>Ты рассказал, что сейчас на стыке: была эмоциональная зависимость от человека, а теперь
  ты этого человека благодаришь за опыт, который изменил жизнь. И спросил, как это было у меня.</p>
  <p>С деревом нельзя ускориться: тянуть его руками вверх бесполезно, можно только поливать,
  давать свет и убирать сорняки. После года терапии я понял, что самое экологичное, что можно
  для себя сделать, это дать себе время и не торопить.</p>
  <p><span class="tc">46:30</span> Я в двадцать восемь вернулся в родной город, из которого
  сбегал раз шесть. Ни карьеры, ни отношений, ни денег, взрослый мужик в двухкомнатной квартире
  с родителями. Было тяжело, но именно тогда я дозрел понять, что это не просто так.</p>
  <blockquote>Я как будто пытался наебать игру: прыгнуть на пятнадцатый уровень, не пройдя ещё второй.
  И игра каждый раз возвращала меня на второй.</blockquote>
  <p>Сначала виноваты все: школа, учителя, окружение, не тот город, не то время. Потом рынок.
  Потом принимаешь ответственность, и на первой стадии начинаешь чувствовать вину за всё,
  что было. Это тоже проходит, просто не сразу.</p>
  <p><span class="tc">51:38</span> Ты сам сказал важную вещь: раньше гонялся за деньгами,
  сейчас цепочка перевернулась.</p>
  <blockquote>Деньги это следствие. Когда ставишь их выше своих интересов, заработать не получится.</blockquote>
  <p>Цена таких денег огромная: ты транслируешь во вселенную, что твоё здоровье и твои близкие
  значения не имеют. У меня была похожая штука с играми: ставил максимальную сложность,
  иначе «не считается». Жена спросила, я хочу с кайфом поиграть или пройти игру. После этого
  Человека-паука я прошёл за три дня.</p>
  <p class="note">Сравнивай себя с собой, а не с другими. Ты уже делаешь больше, чем девяносто
  девять процентов: работаешь над собой, двигаешься в карьере и не боишься тратить деньги
  на обучение, а не только на свои ошибки. Давить сверху на это не надо.</p>
</section>

<section id="s14">
  <div class="sec-head">
    <span class="sec-num">14</span>
    <h3 class="t">Книжки против действия</h3>
    <span class="ts">00:55:19</span>
  </div>
  <blockquote>Покупая много курсов и читая много книг, ты создаёшь иллюзию, что растёшь.
  А по факту это лишь инструмент.</blockquote>
  <p>Согласен. Нельзя научиться ездить на байке, прочитав книжку. Я поэтому перестал слушать
  большинство гуру: то, что они говорят, часто вообще не стыкуется с реальностью. У меня есть
  семья и обязательства, я не могу уехать в монастырь на год, чтобы разобраться в себе.
  Учусь только через действие, по-настоящему усваивается только то, что сделал.</p>
  <p><span class="tc">57:44</span> И твоя история со вчерашнего актёрского: ты рассказал про субботу,
  девушка ответила «может, не получилось, потому что не смешно». Раньше начал бы доказывать,
  сейчас просто решил, что рассказывать ей больше не будешь. Самооценка при этом не просела.
  Это и есть та самая ловушка: начинаешь оправдываться перед человеком, которого знаешь неделю,
  и оказываешься зависимым от его слов.</p>
</section>

<section id="s15">
  <div class="sec-head">
    <span class="sec-num">15</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">01:04:09</span>
  </div>
  <div class="box">
    <p class="lbl">За тобой</p>
    <ul>
      <li><b>Трэш-история.</b> Снимаешь сегодня, сразу после созвона, пока в потоке.</li>
      <li><b>Случай на свадьбе.</b> Единственное, что осталось с прошлой недели.</li>
      <li><b>Уровни ведущего мероприятий.</b> Два-три ролика, камера на одном месте, маски в CapCut.</li>
      <li><b>Говорящий конь.</b> Кейс с корпоратива, которого ни у кого больше нет.</li>
      <li><b>Разбор импровизации.</b> Рейган с шариком, плюс сцена из фильма, где актёров понесло.</li>
      <li>Продающие ингредиенты в эти ролики пока не зашиваем.</li>
      <li>Оплатить Клод, двадцать долларов, через МТС Pay.</li>
      <li>Посмотреть урок в разделе «Нейронки» в кабинете.</li>
      <li>Завтра выделить два часа и сесть за сайт.</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Конспект созвона, в течение двух часов.</li>
      <li>Скинуть урок по Клоду.</li>
      <li>На неделе доделать анкету и сайт, чтобы было что отправлять клиентам.</li>
    </ul>
  </div>
</section>

<div class="foot">
  Личный созвон 21 сентября 2026, 67 минут.
</div>

</div>
</body>
</html>
`;
