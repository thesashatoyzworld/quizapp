// Конспект личного созвона 2026-09-15. Сгенерирован из
// GSD-BRAND/clients/voleslav/lichnoe/2026-09-15/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_VOLESLAV_2026_09_15 = String.raw`<!DOCTYPE html>
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
  <h1>Снаряга для бродяги</h1>
  <p class="sub">Разобрали кашу в голове: что предлагать людям первым делом. Собрали скелет оффера
  на персональный подбор снаряжения за 5 000 рублей, придумали таблицу, которая будет его продавать,
  и поговорили, как снимать контент, пока ты не в походе.</p>
  <div class="meta">
    <span>56 минут</span>
    <span>Первый оффер: 5 000 ₽</span>
    <span>Продаёт таблица «сколько сохраните»</span>
    <span>Первым делом: таблица и истории</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Что предлагать людям</a></li>
    <li><a href="#s2">Цена: комфортная, без напряга</a></li>
    <li><a href="#s3">Платят за результат, а не за консультацию</a></li>
    <li><a href="#s4">Скелет оффера</a></li>
    <li><a href="#s5">Таблица, которая продаёт</a></li>
    <li><a href="#s6">Пруфы: истории и отзывы</a></li>
    <li><a href="#s7">Контент, когда ты не в походе</a></li>
    <li><a href="#s8">«Если не гид, то и денег не будет»</a></li>
    <li><a href="#s9">Снимать на объектах</a></li>
    <li><a href="#s10">Видео с края</a></li>
    <li><a href="#s11">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Первый оффер</h2>
  <p>Разблокировать ветку с деньгами на самом понятном предложении</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Что предлагать людям</h3>
    <span class="ts">00:00:02</span>
  </div>
  <p>Ты посмотрел два видео, про продажи и про оффер, но после возвращения в Москву и выхода на работу
  в голове была каша. Сначала засуетился, потом растерялся, и правильно сделал, что отложил всё до созвона,
  а не стал производить бурную деятельность без пользы.</p>
  <p>Главный затык был в том, что предлагать, кроме помощи со снаряжением. Так это и предлагаем.
  Люди уже спрашивают про снарягу и про первый поход, пусть и не заваливают. Это нормально: пока мы
  не говорим, что у нас есть предложение, приходят только те, у кого вопрос прям назрел, а остальные пишут
  «классный контент, спасибо».</p>
  <p>Опыта продаж у тебя не было, поэтому берём планку несложную и понятную. Воронки и прочие сложные штуки
  сейчас не нужны. Задача одна: разблокировать для себя ветку с деньгами, которая сейчас пугает и непонятна.</p>
  <p class="note">Я сам частично твоя целевая аудитория: мы сейчас часто ходим в горы, и на предложение
  «подберу под вас весь инвентарь под ваши запросы» я бы откликнулся.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Цена: комфортная, без напряга</h3>
    <span class="ts">00:04:28</span>
  </div>
  <p>Комфортная для тебя сумма за созвон с человеком прозвучала так: пять тысяч. Ты вспомнил моё видео,
  где я говорю, что это мало. Но здесь вопрос уровня.</p>
  <p>Это как в альпинизме: если без опыта начать делать сложные штуки, риск аварии слишком большой. Психика
  так же реагирует на всё новое и сложное. В будущем ты сможешь продавать консультацию и за двадцать, и за тридцать
  тысяч, но сейчас такую цифру тебе даже вслух назвать будет сложно.</p>
  <blockquote>Как только сделаешь две-три продажи, мозг поймёт: это возможно, люди готовы за это платить, мне окей
  про это рассказывать, я сам вижу в этом ценность. Дальше начнёшь входить в азарт.</blockquote>
  <p>Ты и так постоянно консультируешь людей в блоге. Теперь начинаем делать это за деньги.</p>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Платят за результат, а не за консультацию</h3>
    <span class="ts">00:07:01</span>
  </div>
  <p>Твоя аудитория делится на две категории: люди с деньгами, у которых мало времени, и те, кто ходит в эконом-режиме,
  потому что просто любит это дело. Ты сам сформулировал, чем полезен обоим: экономишь время на поисках снаряжения
  и находишь то, что подойдёт под задачи дешевле.</p>
  <p>Пример: я хочу кроссовки Scarpa. А ты знаешь, что я переплачиваю за бренд, и можно взять менее популярную фирму,
  которая для ноги и для походов не хуже. По сути ты сохраняешь мне деньги и время. Горный хранитель времени.</p>
  <p>Называть это консультацией не нужно. За диагностики, разборы и консультации сейчас платят неохотно, людям важно понимать,
  какой результат они получат на выходе. Эту мысль ты уже вынес из видео.</p>
  <p class="note">Про название: оффер можно назвать не душно. Например, «Снаряга для бродяги».</p>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Скелет оффера</h3>
    <span class="ts">00:11:40</span>
  </div>
  <p>Раскладываем на путь: что человек делает первым, вторым и третьим, и что у него будет на выходе. Логика та же,
  что у нас с тобой: интервью, маршрутная карта, созвон. Черновик мы собрали прямо на созвоне, ссылку на документ
  я скинул тебе в личку.</p>
  <div class="box fix">
    <p class="lbl">Черновик оффера</p>
    <p><b>Обещание.</b> Сохраню ваше время и деньги на персональном подборе снаряжения для походов.</p>
    <ol>
      <li>Вы заполняете анкету, чтобы я понял ваш запрос, бюджет и пожелания.</li>
      <li>Я собираю полный список экипировки в разных ценовых сегментах под ваши запросы. На этом этапе показываю,
      сколько денег можно сохранить, не переплачивая за дорогие бренды и получая то же качество. Укажу вещи, на которых
      можно сэкономить, и те, на которых этого делать не надо: ваше здоровье, комфорт и спокойствие самая важная часть похода.</li>
      <li>Созваниваемся на час, я презентую вам список. На выходе у вас финальная карта экипировки со ссылками, где всё взять.</li>
    </ol>
    <p>Вы тратите час своего времени вместо целой недели на поиски, чтение информации и подбор экипировки.</p>
    <p><b>Стоимость:</b> 5 000 рублей.</p>
  </div>
  <p><span class="tc">20:27</span> Формулировку «на которых можно сэкономить» предложил ты, и она точнее, чем «стоит экономить».</p>
  <p><span class="tc">22:06</span> «Несколько лет, чтобы во всём разобраться» звучит слишком утрированно. Человек понимает, что может
  разобраться сам, просто потратит не час, а неделю. Поэтому пишем неделю.</p>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Таблица, которая продаёт</h3>
    <span class="ts">00:16:42</span>
  </div>
  <p>Оффер по факту будет продавать таблица. Если человек видит, что ты можешь помочь ему сохранить, допустим,
  сорок тысяч рублей, твоя пятёрка на этом фоне вообще копейки. Я сам тебе готов её перевести.</p>
  <div class="scroll">
  <table>
    <tr><th>Вещь</th><th>Что берут все</th><th>Цена</th><th>Альтернатива</th><th>Цена</th><th>Сохранённые деньги</th></tr>
    <tr><td>Обувь</td><td>Scarpa</td><td>около 20 000</td><td>Altra, Hoka</td><td>в районе 20 000</td><td>на обуви лучше не экономить</td></tr>
    <tr><td>Мембранная куртка</td><td></td><td></td><td></td><td></td><td>здесь можно</td></tr>
    <tr><td>Термобельё</td><td></td><td></td><td></td><td></td><td>здесь можно</td></tr>
    <tr><td colspan="5"><b>Итого</b></td><td><b>сколько сохранит человек</b></td></tr>
  </table>
  </div>
  <p>Что входит в экипировку, ты перечислил сам: обувь, рюкзак, палатка, спальник, коврик, мембранная куртка,
  термобельё, треккинговые палки, очки, фонарик и мелочь вроде гермомешков. Слово «экономия» не нравится,
  поэтому колонка называется «сохранённые деньги».</p>
  <p>Таблица это пример для наглядности, заполняешь её ты. Строки, где экономить нельзя, тоже оставляем:
  это смысл, который человеку важно понять.</p>
  <p><span class="tc">29:26</span> Мысль «можно пойти и в кедах, я сам так в первые походы ходил» правдивая, но в этот оффер её не пишем.
  Мы идём зарабатывать деньги.</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Пруфы: истории и отзывы</h3>
    <span class="ts">00:31:28</span>
  </div>
  <p>Таблиц ты никому не составлял, всё подбирал по памяти и на словах. Один человек написал в Инстаграме перед походом
  по Крыму, и вы почти три часа общались голосовыми. Он собирался взять большие тяжёлые ботинки и идти в них по жаре,
  а ты сказал: «чувак, возьми кроссовки». Помог от души.</p>
  <p>Такие истории нам нужны как доказательство, что ты это уже делал и реально помогал людям сохранить деньги и время.
  Потом ставим оффер вместе с ними на сайт, я покажу, как это сделать, это несложно.</p>
  <ul class="b">
    <li><b>3-5 историй</b>, где ты помог человеку с экипировкой. Надиктовать голосовыми в Claude, он соберёт в текст.</li>
    <li><b>Отзывы.</b> Написать тем, кому помог, тому же парню с Крымом, и спросить, как прошёл поход. Если помогал бесплатно,
    люди без проблем напишут пару слов, хватит скриншотов.</li>
    <li><b>Список контактов.</b> Выписать в таблицу всех, кто интересовался экипировкой. Потом пойдём им писать.</li>
  </ul>
  <p><span class="tc">30:03</span> Claude у тебя завис на регистрации и с VPN, и без. Попробуй другой VPN: у ребят в России
  открывается и работает. Через него соберём оффер в презентацию, это сильно проще, чем самому накидывать картинки и текст.
  Видео, как это сделать, выложу.</p>
</section>

<div class="call">
  <h2>Часть 2. Контент и голова</h2>
  <p>Чтобы мышца не атрофировалась, пока ты на объектах</p>
</div>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Контент, когда ты не в походе</h3>
    <span class="ts">00:35:02</span>
  </div>
  <p>Ты сходил вокруг Эльбруса, неделю не выдержал в Москве и прошёл от Большого Тхача до Красной Поляны, встречал медведей.
  Понял, что очень устал от Москвы, а в горах перезаряжаешься. Отсюда желание собрать продукт, который не завязан только на походах.
  А когда выкладывал, как просто идёшь, просмотры падали.</p>
  <p>Здесь есть искажение: будто нельзя делать контент и продавать, пока ты бесконечно не ходишь. Походы нельзя проходить без остановки.
  Ты сходил, и у тебя остались истории. Рассказывать про походы, экипировку, риски, здоровье можно не находясь в походе. Важно миксовать:
  кадры плюс что-то полезное.</p>
  <p>Так же у меня с кейсами. Про Васю я могу рассказывать до конца жизни. Если кто-то напишет «Саня, задолбал про Васю», значит,
  я как маркетолог сработал хорошо: люди запомнили результат.</p>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">«Если не гид, то и денег не будет»</h3>
    <span class="ts">00:39:10</span>
  </div>
  <p>Было убеждение: кроме подбора снаряжения, продавать можно только услуги гида. А водить людей тебя не вставляет, ты ходишь в походы,
  чтобы отдыхать. Так и не надо, если не прёт.</p>
  <blockquote>Туман войны: ты появился на локации, карта закрыта, и ты пытаешься рассуждать по той части, что уже открыта. Понять,
  как пройти игру, можно только если начать ходить по карте.</blockquote>
  <p>Сейчас мозг даже не понимает, что на этом можно зарабатывать. Поэтому сначала проходим первый, второй, третий уровень. В процессе
  появятся новые идеи, напишут новые люди, и стратегия будет меняться по новым данным.</p>
  <p>Один вектор на будущее, чтобы было куда смотреть. Люди с деньгами очень ценят уникальный опыт. Например, ты раз в месяц собираешь
  трёх человек в место, куда никто не ходит, по сто тысяч с каждого, и это триста тысяч. Три человека тебя не сильно напрягут. Сейчас сто тысяч
  кажутся большой суммой, потому что первый уровень ещё не пройден, а я рассказываю про босса тридцатого уровня.</p>
  <p class="note">Ты сказал: «это не страшно, это вектор». Для масштаба: кто-то сделал больше четырёхсот продаж курса о том, как открыть
  пиво без открывашки.</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Снимать на объектах</h3>
    <span class="ts">00:37:33</span>
  </div>
  <p>Ты промышленный альпинист. Это обалденный контент: ни у кого из конкурентов нет доступа к таким локациям. Висишь перед окном,
  включаешь камеру и рассказываешь про походы, экстрим, что угодно.</p>
  <p><span class="tc">46:18</span> До середины октября у тебя три объекта подряд, после них время освободится на пару месяцев перед зимой.
  Значит, снимаем в процессе работы.</p>
  <p>Тебе кажется, что это некрасиво: моешь грязные окна. Но это твоя реальность. То, что для тебя ежедневная норма, для сотен тысяч
  людей невиданная штука: обычный человек никогда не окажется в тех точках, где бываешь ты. Прошлые ролики с работы собрали таких же
  промышленных альпинистов со словами «ничего особенного», потому что рассказывать надо для простых людей.</p>
  <p>Была у меня девушка с шестью тысячами подписчиков: не знала, что снимать. Выяснилось, что она живёт в Германии на своей ферме с коровами и собаками.
  Для неё норма, для других вау. У меня самого горы за окном стали фоном, хотя в первый приезд это был отвал башки.</p>
  <blockquote>Особенность мы меряем не по себе, а по другим людям. Контент это окошко в твой дом, чтобы люди могли посмотреть,
  что у тебя происходит. Цифры это следствие того, насколько ты готов открываться.</blockquote>
  <ul class="b">
    <li>Задача сейчас не просмотры, а чтобы ты продолжал снимать и мышца не атрофировалась.</li>
    <li>Идеи про снаряжение, которые ты накидал, тоже годятся: хоть про карабины.</li>
    <li>Как и что говорить, разберём, когда дойдём до контента.</li>
  </ul>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Видео с края</h3>
    <span class="ts">00:51:45</span>
  </div>
  <p>Ты выложил в сторис, как идёшь по краю на высоте, и получил от начальника и от владельца бизнес-центра. Видео осталось в телефоне.
  Объект заканчиваешь дня через три, после этого его можно выкладывать. Главное, чтобы здание было не узнать и не было брендинга.</p>
  <p>Негативных отзывов тоже было много: без страховки, мог сорваться. История двоякая, и через это можно зайти: внутренняя свобода и то,
  как ты работаешь со страхом. Страх это то, что останавливает человека от жизни, которую он хочет.</p>
  <p>Если контент вызывает негатив, значит, найдётся и позитив. Хуже всего, когда он не вызывает никаких эмоций. Похулиганил, и классно.
  Твой блог, твоя жизнь, пока ты никому целенаправленно не причиняешь вред.</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">00:27:44</span>
  </div>
  <div class="box">
    <p class="lbl">Оффер, по порядку</p>
    <ol>
      <li>Заполнить таблицу для оффера: вещь, что берут все, цена, альтернатива, цена, сохранённые деньги. Отметить, на чём можно сэкономить, а на чём нельзя.</li>
      <li>Оффер с таблицей отправить мне на обратную связь.</li>
      <li>Запустить Claude, попробовать другой VPN.</li>
      <li>Собрать 3-5 историй, где ты помог человеку с экипировкой. Голосовыми в Claude.</li>
      <li>Написать тем, кому помогал, спросить, как прошёл поход, и собрать отзывы.</li>
      <li>Выписать в таблицу контакты всех, кто интересовался экипировкой.</li>
    </ol>
  </div>
  <div class="box">
    <p class="lbl">Параллельно</p>
    <ul>
      <li>Снимать на объектах и рассказывать для простых людей. Цель не просмотры, а продолжать снимать.</li>
      <li>Когда закончишь объект, выложить видео с края, без узнаваемого здания и брендинга.</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Видео, как собрать оффер в презентацию через Claude.</li>
      <li>Обратная связь по офферу и таблице.</li>
      <li>Показать, как поставить оффер на сайт.</li>
    </ul>
  </div>
  <p class="note">Из всех чатов тебе нужен только общий. Читать всё, что там происходит, не надо: есть вопрос или нужна обратная связь,
  пишешь туда мне. Групповые созвоны по понедельникам в 7:00 и в 17:00 по Москве, не обязательные: можно заскочить на пятнадцать минут
  с вопросом, можно посидеть и послушать остальных.</p>
</section>

<div class="foot">
  Личный созвон 15 сентября 2026, 56 минут.
</div>

</div>
</body>
</html>
`;
