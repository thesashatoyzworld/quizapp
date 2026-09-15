// Конспект личного созвона 2026-09-15. Сгенерирован из
// GSD-BRAND/clients/dmitrii-poshin/lichnoe/2026-09-15/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_DMITRII_2026_09_15 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон 15 сентября 2026</title>
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
  <p class="kicker">Личный созвон · 15 сентября 2026</p>
  <h1>Фитнес для тех, кто уехал</h1>
  <p class="sub">Разобрали, как разгрузиться деньгами, а не часами, и как без страха обкатать онлайн
  на своих же клиентах. Нашли сегмент, который тебе не надо выдумывать: иммигранты. Под него собираем
  оффер, кейсы через изменения в жизни и контент без прицеливания.</p>
  <div class="meta">
    <span>55 минут</span>
    <span>14-15 клиентов в зале</span>
    <span>Сегмент: иммигранты</span>
    <span>Первым делом: сообщения клиентам и оффер</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Разгружаемся через цену</a></li>
    <li><a href="#s2">Оплата за три месяца</a></li>
    <li><a href="#s3">Онлайн обкатываем на своих</a></li>
    <li><a href="#s4">Тем, кто на паузе</a></li>
    <li><a href="#s5">Деньги или смысл</a></li>
    <li><a href="#s6">Сегмент: иммигранты</a></li>
    <li><a href="#s7">Медобразование не нужно</a></li>
    <li><a href="#s8">Кейсы через изменения в жизни</a></li>
    <li><a href="#s9">Оффер: путь вместо обещаний</a></li>
    <li><a href="#s10">Грядка: оффер, анкета, созвон</a></li>
    <li><a href="#s11">Оффер на созвон</a></li>
    <li><a href="#s12">Камера: просто начать ходить в зал</a></li>
    <li><a href="#s13">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Деньги в моменте</h2>
  <p>Что можно сделать с клиентами, которые у тебя уже есть</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Разгружаемся через цену</h3>
    <span class="ts">00:00:11</span>
  </div>
  <p>Ты сейчас сам себя разгружаешь: новых почти не берёшь, тех, кто ушёл на больничные и выходные,
  не зазываешь. Клиенты твои, в зале ты на аренде, вся статистика ведётся в твоём же приложении.</p>
  <p>Правило простое: если разгружаемся, то разгружаемся через повышение цены. Три месяца назад ты уже
  поднял с 50 до 70 лари, часть недолгих клиентов отвалилась, а денег в итоге стало больше, чем было.
  Это ровно та схема, по которой и дальше надо двигаться.</p>
  <p class="note">Если после повышения все без исключения сказали «окей, без проблем», значит, повысил мало.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Оплата за три месяца</h3>
    <span class="ts">00:03:18</span>
  </div>
  <p>Пакеты у тебя на неделю и на месяц, цена за тренировку в них одинаковая. Месяц по три тренировки
  в неделю: 12 × 70 = 840 лари. Предлагать платить за месяц сразу человеку невыгодно, выгода только твоя.
  А каждое продление это небольшой нервяк: продлит или нет.</p>
  <div class="facts">
    <div class="fact"><div class="n">2520</div><div class="l">лари за три месяца без скидки</div></div>
    <div class="fact"><div class="n">−15%</div><div class="l">скидка за оплату сразу</div></div>
    <div class="fact"><div class="n">2140</div><div class="l">лари платит человек</div></div>
    <div class="fact"><div class="n">380</div><div class="l">лари он сохраняет</div></div>
  </div>
  <p>По деньгам тебе чуть невыгодно, но это стабильность и спокойствие на три месяца вперёд, плюс деньги
  приходят сразу. Сейчас у тебя 14-15 клиентов, и это комфортная нагрузка, в зале жить не приходится.</p>
  <div class="box fix">
    <p class="lbl">Сообщение всем текущим клиентам</p>
    <p>Привет! Есть возможность сохранить 380 лари на нашей работе с тобой. Рассказать подробнее?</p>
  </div>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Онлайн обкатываем на своих</h3>
    <span class="ts">00:08:12</span>
  </div>
  <p>Новых клиентов в зал набирать не хочется, хочется постепенно переводить всё в онлайн. Практики онлайна
  у тебя пока не было, только тренировки по видеосвязи с теми, кто уехал в отпуск. Когда процесс новый,
  он вызывает сопротивление: а как выстраивать работу, а как будут идти процессы.</p>
  <p>Поэтому пока мы собираем фундамент, онлайн параллельно обкатываем на тех, кто уже с тобой.
  Скорее всего, на три месяца все скажут «интересно», но не все смогут себе позволить. Тем, кто отказался,
  второе сообщение:</p>
  <div class="box fix">
    <p class="lbl">Сообщение тем, кто сказал нет</p>
    <p>Понял. Смотри, я сейчас запускаю формат работы в онлайне, и он будет подешевле, чем офлайн. Может, тебе это будет интереснее?</p>
  </div>
  <p>Задача взять два-три человека, чтобы начать обкатывать этот процесс. На онлайне мы немного теряем
  в деньгах, но если двое-трое заплатят за три месяца, разрыв закрывается.</p>
  <blockquote>Никогда не работает так, что мы сейчас всё подготовим и потом начнём. Мы создаём себе новый
  контекст, и только в нём мозг начинает под это перестраиваться.</blockquote>
  <p>Ты сам сказал, что с работой тренером было ровно так: понятия не имел, как должно быть, и разобрался в процессе.</p>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Тем, кто на паузе</h3>
    <span class="ts">00:11:50</span>
  </div>
  <p>Третья группа: отпуск, болезнь, переезд, прошлые клиенты. Им ничего не предлагаем, только запускаем
  диалог. Человек расскажет свою ситуацию, и уже под неё подстраиваешь предложение.</p>
  <div class="box fix">
    <p class="lbl">Сообщение</p>
    <p>Привет, как дела? Как твоя форма? Или перестал заниматься?</p>
  </div>
  <p>Ты сразу вспомнил людей, которые, скорее всего, на сто процентов согласятся. Главное здесь не бояться
  мыслей «у меня пока не настроено А, нет Б и я не знаю, как В».</p>
</section>

<div class="call">
  <h2>Часть 2. Позиционирование</h2>
  <p>Для кого ты и о чём говоришь</p>
</div>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Деньги или смысл</h3>
    <span class="ts">00:14:33</span>
  </div>
  <p>Тебе понравились видео с Васей. Но Вася сначала шёл чисто за деньгами: родился ребёнок, было всё равно,
  что делать. Деньги и система пошли, а через год случился смысловой кризис, всё встало на паузу, и сейчас
  он проходит те же процессы заново. Фундамент мы тогда не собирали.</p>
  <p>Поэтому важно понимать, в какой ты точке. Ты сказал, что финансовые проблемы подзакрыл, с фоновой тревогой
  эмиграции научился жить, а блог не пошёл как раз потому, что было непонятно, зачем.</p>
  <blockquote>Мне хочется иметь этот глубинный смысл, чтобы он был моей ценностью и опорой. Хотелось бы
  делать всё это с жёстким фундаментом, на который я мог бы опираться.</blockquote>
  <p>Значит, начинаем с фундамента.</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Сегмент: иммигранты</h3>
    <span class="ts">00:17:31</span>
  </div>
  <p>Ты уехал из маленького города в 2022-м, когда на родительский адрес пришла повестка: собрал чемодан
  и не возвращался. В Грузии занялся спиной, восстановился, сил и энергии стало больше. И все твои клиенты
  тоже иммигранты, чаще всего такие же вынужденные.</p>
  <p>На первых порах важно сосредоточиться на сегменте. Иначе получается «и для мужиков, и для женщин,
  и похудеть, и накачаться, и с травмой», то есть для всех и ни для кого. Задача сегмента не добавить
  себе что-то, а от чего-то отказаться.</p>
  <ul class="b">
    <li><b>Боль максимальная.</b> Человек покинул дом, стресс большой, он сам ищет решение, его не надо пятнадцать раз прогревать.</li>
    <li><b>Платёжеспособность.</b> Люди, которые уезжают, скорее всего, с деньгами.</li>
    <li><b>Ничего не надо выдумывать.</b> Ты сам это проживаешь, контент про это делать просто.</li>
    <li><b>Кейсы уже есть.</b> Твои клиенты и есть этот сегмент.</li>
  </ul>
  <p>Для сравнения: у меня есть клиент, тоже тренер, который пошёл к женщинам. Сделали карусели и рилсы,
  в первый день пятнадцать заявок, пятнадцать созвонов и ни одной покупки: мужчине-тренеру женщины не доверяют,
  а он не понимает, как с ними говорить. Мужик, который рассказывает мамам в декрете, как похудеть,
  должен очень круто садиться на уши, чтобы ему поверили.</p>
  <p><span class="tc">52:06</span> Тебе откликнулось: и ниша, и кейсы про то, как меняется жизнь, «сейчас это ощущается правильным».</p>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Медобразование не нужно</h3>
    <span class="ts">00:20:49</span>
  </div>
  <p>Тему физических болей в спине ты уже пробовал, и не хватило уверенности говорить о ней широко без
  медицинского образования.</p>
  <p>У меня нет диплома маркетолога, я не коуч и не психолог. Но спокойно говорю о том, что проживал сам
  и что разбирал вместе с клиентами. Практику для этого образование не нужно.</p>
  <p>Синдром самозванца быстро не решается: нужно месяц-два побыть в процессе, чтобы самоценность поднялась
  и фраза «я охуенный, имею право говорить что хочу» перестала вызывать кринж. Ты сказал, что очень этого хочешь,
  и уже начал работать с психологом. Это очень круто, мне самому год терапии сильно помог.</p>
  <blockquote>Туман войны: пока не двигаешь юнит по карте, не знаешь, где ресурсы и где враги.
  Позиционирование собирается только в процессе и в действии.</blockquote>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Кейсы через изменения в жизни</h3>
    <span class="ts">00:25:04</span>
  </div>
  <p>Фотографии «до» ты у людей стеснялся просить, исходных точек нет. Но с некоторыми работаешь давно,
  и прогресс есть и в форме, и в самочувствии.</p>
  <p>И это даже к лучшему. Работая с фитнес-тренерами, я всё больше понимаю, что из «до и после» в килограммах
  и мышцах надо выходить. Внешка всех заебала, про здоровье слишком сложно, люди не хотят меняться. Люди хотят
  денег, свободы, признания. Поэтому кейс рассказываем через то, как изменилась жизнь человека:</p>
  <ul class="b">
    <li>стресс и привычки</li>
    <li>появились силы запустить свой проект</li>
    <li>смог принять ключевые решения: переезд, развод, помириться с женой</li>
    <li>всё, что про физическую реальность, а не про отражение в зеркале</li>
  </ul>
  <p><b>Первый кейс твой</b>: ты сам результат своего продукта. Плюс два-три кейса клиентов, всё сквозь призму эмиграции.</p>
  <p><span class="tc">34:09</span> Как сделать без запары: посмотреть воркшоп «Кэш-магниты», надиктовать истории
  голосовыми в Claude, скинуть ему текст воркшопа и попросить собрать кейс на лендинг. Чем больше артефактов
  (сообщения, видеоотзывы), тем реалистичнее. Можно и запросить их у людей.</p>
</section>

<div class="call">
  <h2>Часть 3. Оффер и воронка</h2>
  <p>Сначала грядка и семечки, потом вода</p>
</div>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Оффер: путь вместо обещаний</h3>
    <span class="ts">00:28:53</span>
  </div>
  <p>Ты посмотрел два воркшопа и накидал оффер с нейронкой, но сам не понимаешь, на чём делать акцент.
  Скелет берём готовый: оффер Васи, я скинул тебе скрин. Вася до сих пор по нему работает, даже когда перестал
  вести блог. Принцип из «Солдаута» ты понял.</p>
  <p>Задача: взять оффер Васи и собрать его под иммигрантов, с их проблемами.</p>
  <p>Ты писал, что тебе стрёмно обещать результат. Это уже и не работает. Я тоже не могу обещать результат,
  потому что не знаю твоего состояния, навыков, стрессоустойчивости. Сейчас продаёт не яркий результат,
  а понятный процесс, прозрачный путь и формулировки, от которых человеку не страшно: «блин, это не так сложно,
  как мне казалось».</p>
  <p><span class="tc">32:34</span> Выгоды заземляем на реальность. В пути у каждого шага есть желание и чекпоинт:
  как человек поймёт, что шаг пройден. Чекпоинты формулируем через физическую реальность:</p>
  <div class="box">
    <p class="lbl">Как могут звучать чекпоинты</p>
    <ul>
      <li>проще просыпаться по утрам</li>
      <li>тело само хочет двигаться</li>
      <li>задачи, которые откладывал полгода, не замечаешь, как начинаешь за них хвататься</li>
      <li>больше энергии</li>
    </ul>
  </div>
  <p>Дальше оффер визуально собираем в презентацию и ставим на лендинг через Claude. Сегодня записываю видео,
  как это делается, у тебя подписка есть, так что проблем не будет.</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Грядка: оффер, анкета, созвон</h3>
    <span class="ts">00:36:48</span>
  </div>
  <p>Оффер это семечки и грядка. Трафик, то есть рилсы и карусели, это вода. Если оффера нет, лить воду смысла нет.</p>
  <p>Пока ты не умеешь продавать через созвон, продавать без созвона будет сильно сложнее, а через мини-продукты
  и автоворонки смысла нет вообще. Недавно приходила тренер с 25 тысячами подписчиков: пять автоворонок,
  шесть лид-магнитов, куча мини-продуктов и ноль заявок. Раньше не работало, теперь не работает автоматически.</p>
  <p>Сначала самый дорогой оффер, личная работа с тобой, должен стабильно продаваться через созвон. Когда ты придёшь
  и скажешь «не успеваю созвоны проводить и анкеты обрабатывать», тогда думаем про автоматизацию и новые тарифы.</p>
  <ol class="steps">
    <li><b>Три карусели в закрепе</b>: оффер на работу с тобой, оффер на созвон, кейс.</li>
    <li>Все три ведут на <b>анкету</b>. В конце рилсов и каруселей призыв: «подробнее в закрепе».</li>
    <li>Анкета ведёт на <b>созвон</b>, на созвоне ты озвучиваешь оффер.</li>
  </ol>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Оффер на созвон</h3>
    <span class="ts">00:42:16</span>
  </div>
  <p>Большой оффер на работу с тобой состоит из многих этапов. Для созвона берём один кусочек: то, что люди
  хотели бы получить первым.</p>
  <p>«Давайте созвонимся, разберу вашу ситуацию» никому не нужно. Консультация, диагностика, разбор уже не работают.
  Человек должен понимать, что он заберёт с созвона.</p>
  <div class="box">
    <p class="lbl">Например</p>
    <ul>
      <li>на созвоне собираем персональную продуктовую корзину и меню</li>
      <li>разбираемся, почему у вас нет энергии</li>
    </ul>
  </div>
  <p>Собрали один вариант, пустили на него трафик, смотрим. Не работает, собираем второй, потом третий. Задача найти
  оффер, который даёт больше всего заявок на созвон. Ты сформулировал точно: найти небольшую боль, которую можно
  закрыть прямо на созвоне.</p>
</section>

<div class="call">
  <h2>Часть 4. Контент</h2>
  <p>Параллельно со всем остальным</p>
</div>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Камера: просто начать ходить в зал</h3>
    <span class="ts">00:45:47</span>
  </div>
  <p>Контент я раскладываю как навык. Навык самое выгодное вложение: научился водить, и тебя больше не парит садиться
  за руль. Уровни: хочу, но не делаю · делал, но бросил · делаю, но бесит · делаю, не бесит, но трачу много
  времени · трачу нормально, но нет результата.</p>
  <p>Пока человек не ходит в зал, нет смысла говорить про технику и план питания. Помнишь пример из «Атомных привычек»:
  человеку предложили просто приходить в зал и ничего не делать. Две недели приходил, на третью стало скучно, и он
  начал что-то делать.</p>
  <p>Так что параллельно со всем остальным просто включай камеру и рассказывай. Что у тебя сейчас происходит, как и почему
  ты переехал, чего хочешь, что на душе. Без прицеливания.</p>
  <ul class="b">
    <li>Не смотрим на цифры, смотрим на ощущения: где вылезают демоны и сопротивление.</li>
    <li>Страшно публиковать, складывай в галерею. Когда подумаешь «а это можно выложить», выкладывай.</li>
    <li>Победа это выложенная контентная единица, без напряга.</li>
  </ul>
  <p>Монтажёр у тебя есть, у меня тоже есть ребята, когда понадобится. Со временем контент перестанет напрягать и станет фоном.</p>
</section>

<section id="s13">
  <div class="sec-head">
    <span class="sec-num">13</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">00:53:16</span>
  </div>
  <div class="box">
    <p class="lbl">Деньги в моменте</p>
    <ul>
      <li>Написать текущим клиентам про оплату за три месяца: 2140 вместо 2520 лари.</li>
      <li>Тем, кто отказался: онлайн подешевле. Цель два-три человека, чтобы обкатать онлайн.</li>
      <li>Тем, кто на паузе, и прошлым клиентам: «как дела, как форма?»</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">Фундамент, по порядку</p>
    <ol>
      <li>Собрать оффер на работу по примеру оффера Васи, под иммигрантов.</li>
      <li>Отправить оффер в группу на обратную связь.</li>
      <li>Собрать оффер презентацией и лендингом через Claude, по моему видео.</li>
      <li>Собрать 3-4 кейса через изменения в жизни: первый свой. Голосовыми в Claude по воркшопу «Кэш-магниты».</li>
      <li>Поставить оффер и кейсы на лендинг.</li>
      <li>Собрать оффер на созвон: один кусочек результата.</li>
      <li>Анкета и три карусели в закреп: оффер на работу, оффер на созвон, кейс.</li>
    </ol>
  </div>
  <div class="box">
    <p class="lbl">Параллельно</p>
    <ul>
      <li>Включать камеру и рассказывать, можно в галерею.</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Видео, как собрать оффер в презентацию и лендинг через Claude.</li>
      <li>Обратная связь по офферу, когда пришлёшь в группу.</li>
    </ul>
  </div>
  <p class="note">Вопросы пиши в группу. Групповые созвоны по понедельникам в 7:00 и в 17:00 по Москве, час, не обязательные:
  можно прийти на пятнадцать минут со своим вопросом, можно посидеть и послушать остальных.</p>
</section>

<div class="foot">
  Личный созвон 15 сентября 2026, 55 минут.
</div>

</div>
</body>
</html>
`;
