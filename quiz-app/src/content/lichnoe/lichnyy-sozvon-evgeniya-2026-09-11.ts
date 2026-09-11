// Конспект личного созвона 2026-09-11. Сгенерирован из
// GSD-BRAND/clients/evgenia-sokolchik/lichnoe/2026-09-11/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_EVGENIYA_2026_09_11 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон 11 сентября 2026</title>
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
  <p class="kicker">Личный созвон · 11 сентября 2026</p>
  <h1>Ты покупаешь просмотры очень дорого</h1>
  <p class="sub">Фундамент почти собран: три кейса, анкета, оффер, две карусели. Осталось залить
  видео и добить призыв. А главный тормоз теперь не стратегия, а то, что один рилс монтируется
  три дня и всё равно не выходит. Это мы не обсуждаем, это мы проверяем экспериментом.</p>
  <div class="meta">
    <span>40 минут</span>
    <span>3 кейса записаны</span>
    <span>Эксперимент недели: рилс за час</span>
    <span>Следующий созвон: пятница, 11:00 МСК</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Что уже собрано и что осталось до запуска</a></li>
    <li><a href="#s2">Карусели строим вокруг темы, а не вокруг имени</a></li>
    <li><a href="#s3">Сценарии не согласовываем</a></li>
    <li><a href="#s4">Кэш-магнит: либо новое, либо узкое</a></li>
    <li><a href="#s5">Заголовок, который попал</a></li>
    <li><a href="#s6">Люди не хотят ебашить, и это не лечится</a></li>
    <li><a href="#s7">Три дня на один рилс это авария</a></li>
    <li><a href="#s8">Эксперимент: час по таймеру против одного дубля</a></li>
    <li><a href="#s9">Анкета: вопрос про доход</a></li>
    <li><a href="#s10">Гайды продаём в закрытую</a></li>
    <li><a href="#s11">Воркшоп нужен другой</a></li>
    <li><a href="#s12">Задачи на неделю</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Фундамент собран, осталось запустить</h2>
  <p>Что уже лежит готовое и в каком порядке это выкладываем</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Что уже собрано и что осталось до запуска</h3>
    <span class="ts">00:02:55</span>
  </div>
  <p>У нас есть три кейса, анкета, собранный оффер и две карусели: на пацанов и на девчонок,
  обе с приглашением на созвон. Цепочка дальше простая. Ты грузишь видео, кидаешь мне ссылки,
  я вставляю их в статьи, мы финализируем кейсы и выкладываем карусели.</p>
  <div class="facts">
    <div class="fact"><div class="n">3</div><div class="l">кейса записаны и расписаны: травма, декрет, плавающий график</div></div>
    <div class="fact"><div class="n">2</div><div class="l">карусели-оффера готовы и ждут отмашки</div></div>
    <div class="fact"><div class="n">1</div><div class="l">анкета, через которую идёт запись на созвон</div></div>
  </div>
  <p>Чего мы с тобой чуть не забыли: внутри самих видео про совместную работу не говорится
  ни слова. Это чиню я, будет крупная плашка с призывом прямо под каждым видео. У меня
  в кейсах с Васей внутри ролика тоже ничего нет, и люди всё равно записываются, потому что
  я отправляю не ссылку на видос, а ссылку на статью-кейс. И анкету в кейсы тоже вставлю,
  ты правильно напомнила.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Карусели строим вокруг темы, а не вокруг имени</h3>
    <span class="ts">00:04:00</span>
  </div>
  <p>Нужны ещё три карусели по кейсам, но не в формате «мой кейс с Машей». Заходим через тему,
  которая внутри кейса. Мама в декрете, значит заголовок в духе «почему мамам в декрете сложнее
  худеть в десять раз». Ты даёшь свою позицию и тезисы, историю клиентки вставляешь в конце
  как пруф, и дальше призыв: напишите «хочу как Катя», отправлю видео.</p>
  <blockquote><p>Я сначала высказываю своё какое-то мнение, а потом сую туда вот эти истории,
  которые у нас есть.</p></blockquote>
  <p>Ровно так. У нас три сегмента, к которым всё сводится: травмы, мамы в декрете и та,
  у кого плавающий график и нет времени. Контент делаем с разных углов, а призывами жонглируем:
  они повторяются и ведут на эти три кейса.</p>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Сценарии не согласовываем</h3>
    <span class="ts">00:31:26</span>
  </div>
  <p>По сценариям, которые ты мне скидывала: делай всё и не переспрашивай. Я не даю обратную
  связь до того, как рилс записан. За то время, что мы правим текст, ты могла выложить три
  штуки, а так мы будем править их бесконечно.</p>
</section>

<div class="call">
  <h2>Часть 2. Статья-конвертер</h2>
  <p>Кейсы создают доверие, но метод не продают</p>
</div>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Кэш-магнит: либо новое, либо узкое</h3>
    <span class="ts">00:07:40</span>
  </div>
  <p>Человек смотрит кейсы и думает: окей, работает с фитнес-тренерами, а в чём методика,
  непонятно. Поэтому нужна статья-конвертер. Она потом превращается в видео, и её можно крутить
  циклично: неделю потыкал сегмент, собрал аудиторию, через месяц вернулся.</p>
  <div class="box fix">
    <p class="lbl">Что вообще работает</p>
    <ul>
      <li><b>Новое.</b> Люди уже наобжигались на старых решениях</li>
      <li><b>Узкое.</b> Через сегментацию человек себя узнаёт</li>
    </ul>
  </div>
  <p class="note">«Как скинуть десять килограмм за месяц» работало в 2015 году. Сейчас это
  не работает ни у кого.</p>
  <p>Твоя идея про переворот рынка, «если весь рынок говорит, что вот это хорошо, считать,
  что это плохо», для контента отличная. Для конвертера она слишком узкая. Нам нужно посередине:
  достаточно широко и достаточно узко одновременно.</p>
  <blockquote><p>А ты такая раз, хуяк, пришла и говоришь: от кортизола реально жиреют.</p></blockquote>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Заголовок, который попал</h3>
    <span class="ts">00:20:27</span>
  </div>
  <p>А вот это попадание. Ты сказала: «Много ко мне кто приходит и говорит: я всё делаю,
  но результатов нет». И дальше про своего клиента: «Андрюх, а что ты жирный-то тогда,
  если ты всё делаешь?»</p>
  <p>Моя первая статья, с которой я заработал первый миллион, называлась «Почему эксперты
  в Инстаграме делают много, а зарабатывают мало». Механика та же: конкретный сегмент плюс
  реальная боль.</p>
  <p class="note">У тебя с заголовками проблем нет вообще. Ты просто не понимаешь, насколько
  ты в этом крутая.</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Люди не хотят ебашить, и это не лечится</h3>
    <span class="ts">00:11:37</span>
  </div>
  <p>Сопротивление я видел у тебя по лицу: «Не, мне не нравится». И ты сама объяснила,
  откуда оно: «Я знаю. Вот здесь у меня и возник этот диссонанс».</p>
  <p>Люди действительно не хотят ебашить. Наша задача не обмануть их, а запаковать идею так,
  чтобы её вообще стали слушать. Ты это делаешь и в жизни: про билеты в Таиланд ходила вокруг
  мужа с «там такие билеты дешёвые, так чисто случайно попались», а с мамой в детстве стояла
  в магазине с большими глазами.</p>
  <blockquote><p>С мамой работало. Чем больше Михе пытаешься сказать, что так надо,
  тем больше он ерепенится.</p></blockquote>
  <p>Вот в этом и суть: чтобы дать людям то, что надо, это надо завернуть в то, что они хотят.</p>
</section>

<div class="call">
  <h2>Часть 3. Производство контента</h2>
  <p>Самое узкое место на сегодня</p>
</div>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Три дня на один рилс это авария</h3>
    <span class="ts">00:22:58</span>
  </div>
  <p>Ты сама назвала самое сложное: производство контента и монтаж этих видосов. Записать
  говорящую голову быстро, а дальше затык.</p>
  <blockquote><p>Вот я сейчас монтирую рилс уже третий день, и я не могу его выпустить.</p></blockquote>
  <p>Время съедает не резка, а придумывание визуала: какие картинки, как его вообще сделать.
  И на выходе «получается как-то некрасиво, мне не нравится». На один ролик уходит часа три.</p>
  <div class="box bad">
    <p class="lbl">Что здесь на самом деле происходит</p>
    <ul>
      <li>Ты сама сказала: «все эти ролики, которые у меня выложены, они-то не набирают супер много и так»</li>
      <li>Значит часы уходят, а разницы в просмотрах нет. Ты покупаешь просмотры очень дорого</li>
      <li>Отдельно про наследие: «я вот с этим Андреем когда работала, он меня эти рилсы заставлял прям вылизывать», «постоянно этим задрачивал». Нравится ли тебе это делать: нет. Значит не надо</li>
    </ul>
  </div>
  <p class="note">Нейронка короткий контент быстрее не сделает, я пробовал: руками выходит быстрее.</p>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Эксперимент: час по таймеру против одного дубля</h3>
    <span class="ts">00:24:37</span>
  </div>
  <p>Мы не уговариваем мозг, мы ему показываем. Поэтому на этой неделе делаем так.</p>
  <div class="box fix">
    <p class="lbl">Порядок</p>
    <ul>
      <li>Ставишь таймер на час. Что получилось за час, то и выкладываешь, и не оцениваешь</li>
      <li>Сразу же снимаешь то же самое второй раз: включила камеру, рассказала потоком, субтитры, заголовок текстом в начале</li>
      <li>Выкладываешь и сравниваем просмотры вдвоём</li>
    </ul>
  </div>
  <p>У меня один ролик занял пятнадцать минут, другой шесть часов. Оба набрали по шесть тысяч
  просмотров. Количество времени, потраченное на монтаж, на результат не влияет.</p>
  <p class="note">Сначала оптимизируемся под количество, потом под качество. Три ролика
  по тысяче просмотров лучше одного на три тысячи, если на них ушло втрое меньше времени:
  итераций и заходов больше.</p>
</section>

<div class="call">
  <h2>Часть 4. Анкета, деньги и мелочи</h2>
  <p>Что докручиваем по ходу</p>
</div>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Анкета: вопрос про доход</h3>
    <span class="ts">00:35:00</span>
  </div>
  <p>Ты спросила, нужно ли включать вопрос про зарплату. Да, добавляй. И подпиши комментарием,
  зачем он нужен: чтобы понимать, какие тренировки, медикаменты и анализы человек может себе
  позволить. Подпись сразу снимает возражение.</p>
  <p>Человеку с доходом пятьдесят тысяч мы не будем набирать БАДов, а человеку с пятьюстами
  можно сразу предложить нормальные анализы.</p>
  <p>Про «через одного отвечаю» на историю с кубиками: это классика и не только у тебя.
  Ты точно подметила разницу между частной практикой и массовым продуктом. У меня то же самое
  на продажах: кто покупает за пять тысяч, выносит голову вопросами и гарантиями, а кто платит
  триста тысяч, говорит «Сань, всё заебись, погнали». По анкетам ты начнёшь видеть, кому что
  подходит. Лестницу диалога разберём, когда анкеты пойдут.</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Гайды продаём в закрытую</h3>
    <span class="ts">00:33:51</span>
  </div>
  <p>У вас готова куча гайдов: и по БАДам, и по Оземпику. Продавать их в открытую на лендинге
  не надо. Продавай в закрытую: человек заполнил анкету, ты видишь его доход, предлагаешь
  групповое, он говорит дорого, и вот тут ты даёшь продукт, где он может помочь себе сам.</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Воркшоп нужен другой</h3>
    <span class="ts">00:36:13</span>
  </div>
  <p>Ты искала не тот воркшоп. Нужен «Новый уровень контента», он в кабинете, там шесть уровней.
  Он не решает измеримую техническую задачу, он должен развернуть то, как ты вообще смотришь
  на контент.</p>
  <p>Промаха при этом нет: «Продающий контент» тоже в дело. Это два режима, между которыми
  я переключаюсь. Когда разберёшься с обоими, станет понятно, как их совмещать, и тебе легче
  будет воспринимать то, что я рассказываю.</p>
</section>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Задачи на неделю</h3>
    <span class="ts">00:39:00</span>
  </div>
  <ul class="chk">
    <li>Написать два-три названия статьи в рамке «что-то новое» и два-три под конкретный сегмент, как решение его большой проблемы</li>
    <li>Сделать три карусели вокруг кейсов: травмы, мамы в декрете, нет времени. Сначала твоя позиция и тезисы, история внутри как пруф</li>
    <li>Выложить готовые карусели-офферы после моей отмашки</li>
    <li>Добавить в анкету вопрос о доходе с поясняющей подписью</li>
    <li>Доделать текущий рилс по таймеру на час, выложить и не оценивать</li>
    <li>Сразу после этого снять то же самое одним дублем с субтитрами и заголовком, выложить и сравнить просмотры со мной</li>
    <li>Продолжать снимать контент вокруг выбранных тем, не дожидаясь моей правки сценариев</li>
    <li>Посмотреть воркшоп «Новый уровень контента» целиком, все шесть уровней</li>
    <li>Наговорить мне голосовыми в группу пункты для статьи по методичке кэш-магнита, когда определимся с ракурсом</li>
    <li>Передать Мише, чтобы написал мне, что он хочет предложить</li>
  </ul>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Сделать призыв под каждым кейсом, крупной плашкой под видео</li>
      <li>Вставить анкету в кейсы</li>
      <li>Дать отмашку, когда карусели можно выкладывать</li>
      <li>Перенести собранный оффер в документ и показать, как самой вносить правки</li>
      <li>Начать писать статью, как только выберем ракурс по твоим названиям</li>
      <li>Разобрать с тобой лестницу диалога по анкетам, когда они начнут заполняться</li>
      <li>Ответить Мише, когда он напишет, что хочет</li>
      <li>Компенсировать двадцать минут этого созвона на следующем</li>
    </ul>
  </div>
  <p class="note">Видео ты залила в тот же день, ссылки пришли, плееры уже стоят в статьях.
  Первый пункт прошлого списка закрыт.</p>
</section>

<div class="foot">
  Личный созвон 11 сентября 2026, 40 минут. Следующий: пятница, 11:00 по Москве.
</div>

</div>
</body>
</html>
`;
