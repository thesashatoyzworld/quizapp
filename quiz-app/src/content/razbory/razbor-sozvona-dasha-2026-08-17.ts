// Сгенерировано из GSD-BRAND/clients/sasha/razbory/2026-08-17-razbor-sozvona-dasha/RAZBOR.html.
// Правь исходник в GSD-BRAND и перегенерируй скриптом razbor-to-ts.mjs, руками не трогай.
// Маркер <!--VIDEO_SLOT--> заменяется на плеер в API-роуте /api/cabinet/razbory.

export const RAZBOR_SOZVONA_DASHA_2026_08_17 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Разбор своего созвона: Саша и Даша</title>
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

  section.good-b{border-left:4px solid var(--good)}
  section.good-b .sec-num{color:var(--good)}
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
  .box.warn{border-color:var(--bad); background:var(--bad-bg)}
  .box.warn .lbl{color:var(--bad)}

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
    <p class="kicker">Разбор своего созвона · Саша и Даша</p>
    <h1>Как продать, никого не толкая</h1>
    <p class="sub">Пара к разбору Азамата: там видно, как продажа рассыпается, здесь как она собирается. Три части: переписка до созвона, сам созвон, возврат в понедельник до оплаты. Клиент: Даша, автоблогер про BMW и эзотерик. Разбор с её одобрения.</p>
    <div class="meta">
      <span>созвон 30.07.2026</span><span>1 ч 36 мин</span><span>эзотерика плюс автоблог</span><span>чек 150 000 ₽</span><span>15 дней от первого сообщения до оплаты</span>
    </div>
  </header>

  <!--VIDEO_SLOT-->

  <nav class="toc">
    <h3>Содержание</h3>
    <ol>
      <li><a href="#kto">Кто на созвоне</a></li>
      <li><a href="#glavnoe">Главный вывод</a></li>
      <li><a href="#perepiska">Переписка до созвона</a></li>
      <li><a href="#pochemu">Почему согласился на созвон</a></li>
      <li><a href="#kontakt">Контакт вместо скрипта</a></li>
      <li><a href="#vozrazheniya">Как закрывались барьеры</a></li>
      <li><a href="#priemy">Приёмы по таймкодам</a></li>
      <li><a href="#dengi">Цена и математика</a></li>
      <li><a href="#podumat">«Мне надо подумать»</a></li>
      <li><a href="#ponedelnik">Понедельник: три страха, один вопрос</a></li>
      <li><a href="#sravnenie">Даша против Азамата</a></li>
      <li><a href="#karkas">Каркас</a></li>
      <li><a href="#citaty">Цитаты под контент</a></li>
    </ol>
  </nav>

  <div class="call"><h2>Расстановка</h2><p>кто, что продаётся, чем закончилось</p></div>

  <section id="kto">
    <div class="sec-head"><span class="sec-num">01</span><h3 class="t">Кто на созвоне</h3></div>
    <p><b>Продавец:</b> Саша. Менторство по контенту в двух форматах: личный 300 000 ₽ за три месяца, групповой 150 000 ₽.</p>
    <p><b>Клиент:</b> Даша. Автоблогер про BMW в инстаграме, параллельно эзотерика: таро, чистки, магия. По образованию психолог, три года работала с зависимыми. Из найма ушла два месяца назад, доход около 500 000 ₽, продаёт по сарафану через телеграм. После 16 августа уезжает: Питер, Беларусь, дальше возможно Вьетнам.</p>
    <p><b>Её линейка:</b> расклад 3 000 ₽, консультация 7 500 ₽, чистка 15 000 ₽ только для своих, мини-курсы 5 000 ₽, курс по свечам 40 000 ₽ и четыре пройденных потока, курс по магии 100 000 ₽ готов и ещё не продавался.</p>
    <p><b>Её запрос своими словами:</b> хочу качать аккаунт про машины, потому что про BMW снимать легко, а про эзотерику сложно. Первый месяц ролики залетали, теперь еле набирают 50 или 70 тысяч просмотров, и то раз на раз не приходится.</p>
    <blockquote><p>Деньги лежат в эзотерике, а снимать хочется про машины. Она это знает, и поэтому стоит на месте. Весь созвон работает на то, чтобы она сама сняла этот конфликт.</p></blockquote>
    <div class="facts">
      <div class="fact"><div class="n">300 000 ₽</div><div class="l">личный формат, назван первым</div></div>
      <div class="fact"><div class="n">150 000 ₽</div><div class="l">групповой, в него она и зашла</div></div>
      <div class="fact"><div class="n">6 дней</div><div class="l">от созвона до оплаты</div></div>
      <div class="fact"><div class="n">2 недели</div><div class="l">за столько вложение отбивается её же курсом</div></div>
    </div>
  </section>

  <section id="glavnoe">
    <div class="sec-head"><span class="sec-num">02</span><h3 class="t">Главный вывод разбора</h3><span class="ts">00:56:07</span></div>
    <blockquote>
      <p>«Моя задача сделать ребалансировку: раздуть желание и снизить стресс.»</p>
      <p>«Чем больше неотвеченных вопросов в голове человека, тем больше стресса. Чем больше стресса, тем меньше желания.»</p>
    </blockquote>
    <p>Дальше всё складывается из трёх движений, и ни одно не работает без остальных.</p>
    <ul class="b">
      <li><b>Понять, чего человек хочет на самом деле,</b> и раздувать это желание, как огонёк</li>
      <li><b>Снимать стресс решениями,</b> а не аргументами и спорами</li>
      <li><b>Плыть туда, куда хочет человек,</b> а не тащить его к себе</li>
    </ul>
    <blockquote><p>«Люди боятся своих желаний. Боятся не потому, что им кажется, что это сложно, тяжело, больно и долго. Их страхи оправданы только тогда, когда желание маленькое, не раздутое, не подсвеченное, и человек не видит пути.» <span class="ts">00:56:58</span></p></blockquote>
  </section>

  <div class="call"><h2>Часть 1. До созвона</h2><p>переписка с 20 по 30 июля, где и сделана продажа</p></div>

  <section class="good-b" id="perepiska">
    <div class="sec-head"><span class="sec-num">03</span><h3 class="t">Десять дней вопросов, ни одного оффера</h3><span class="verdict good">так надо</span></div>
    <div class="scroll">
    <table>
      <thead><tr><th>Тайм</th><th>Что произошло</th><th>Зачем</th></tr></thead>
      <tbody>
        <tr><td class="tc">00:00:45</td><td>Даша: «сколько стоит личная консультация»</td><td>Консультации Саша не проводит, потому что не видел от них результата. Отказ есть, диалог не закрыт</td></tr>
        <tr><td class="tc">00:01:31</td><td>Видит её анкету на менторство и спрашивает: заработок с блога или с рекламы</td><td>Завязать диалог, проявить интерес и понять, чем вообще может помочь</td></tr>
        <tr><td class="tc">00:02:01</td><td>Она: есть предложения от детейлингов, разборок и перекупов, но отказываюсь, боюсь, что ролики не взлетят</td><td>Уточняет: то есть единственная задача, чтобы ролики залетали?</td></tr>
        <tr><td class="tc">00:02:53</td><td>Спрашивает, смотрела ли она материалы. Она пересмотрела всё, что в доступе</td><td>Понял, что она тёплая. Экспертность доказывать не придётся</td></tr>
        <tr><td class="tc">00:03:21</td><td>Спрашивает про найм и откуда доход 500 000</td><td>Выясняется телеграм, эзотерика, клиенты и готовые продукты. Появилось за что цепляться</td></tr>
        <tr><td class="tc">00:04:17</td><td>«А чего ты боишься? Автоблогер и эзотерик, это же круто»</td><td>Первый выход на её внутренний конфликт</td></tr>
        <tr><td class="tc">00:05:09</td><td>Даёт позицию: важно расставить приоритеты и выбрать траекторию, совместить тоже можно, но не сразу</td><td>Она отвечает: «ты мне такие фундаментальные вопросы задал, я задумываюсь»</td></tr>
        <tr><td class="tc">00:05:55</td><td>Она молчит два дня. Пишет: планирую график созвонов, есть вопросы по работе?</td><td>Не оставлять висяки: да да, нет нет</td></tr>
        <tr><td class="tc">00:06:31</td><td>Она сама ночью пишет, что думает развивать эзотерический инстаграм</td><td>Вывод пришёл изнутри неё</td></tr>
        <tr><td class="tc">00:06:31</td><td>И сама выкладывает возражение: покупала ведение у известной маркетологини, та редко отвечала</td><td>Возражение всплыло до созвона, есть время ответить спокойно</td></tr>
        <tr><td class="tc">00:07:26</td><td>Отвечает голосовыми: даёт ракурс BMW плюс эзотерика и объясняет, почему на рекламе не заработать</td><td>Решение её конфликта вместо спора с ней</td></tr>
        <tr><td class="tc">00:08:39</td><td>Про включённость: штурман с картой, руки на руле у тебя. Предлагает не коммититься на три месяца, а начать с месяца</td><td>Снимает её главное возражение по формату</td></tr>
        <tr><td class="tc">00:09:08</td><td>Предлагает кейсы и телеграмы клиентов, чтобы сама у них спросила</td><td>Проверяемость вместо обещаний</td></tr>
        <tr><td class="tc">00:09:08</td><td>Она: «серьёзные деньги в эзотерике, я задумалась. Давай созвонимся, ты меня поменял одним вопросом»</td><td>Созвон запросила она</td></tr>
      </tbody>
    </table>
    </div>
    <blockquote><p>«Я задал вопросы, обозначил свою позицию и ракурс решения проблемы. Она сама ответила себе на эти вопросы, даже не через мои связки. Ничего сверхъестественного я не делал.» <span class="ts">00:10:45</span></p></blockquote>
    <p class="note">Висяки Саша закрывает жёстко: через час после молчания «Даш, вопрос?», через два дня «планирую график созвонов». Причина простая: они сжирают энергию.</p>
  </section>

  <section id="pochemu">
    <div class="sec-head"><span class="sec-num">04</span><h3 class="t">Почему он вообще согласился на созвон</h3><span class="ts">00:10:00</span></div>
    <p>Раньше на такой запрос ответил бы отказом. Здесь сложились четыре условия:</p>
    <ol class="steps">
      <li>Она уже зарабатывает в эзотерике без нового трафика, значит с трафиком станет сильно больше</li>
      <li>В нише очень много денег</li>
      <li>Уникальный ракурс он увидел сразу и понимает, как его реализовать</li>
      <li>Ему нужен кейс в эзотерике, которого до сих пор нет</li>
    </ol>
    <p class="note">Это же и есть фильтр на созвоны: есть ли деньги в нише, есть ли что продавать, виден ли ракурс, нужен ли тебе такой кейс.</p>
  </section>

  <div class="call"><h2>Часть 2. Созвон</h2><p>30 июля, полтора часа с комментариями по ходу</p></div>

  <section id="kontakt">
    <div class="sec-head"><span class="sec-num">05</span><h3 class="t">Контакт вместо скрипта</h3><span class="ts">00:12:06</span></div>
    <p>Начинает неформально: «ну рассказывай, Дарья на BMW, которая занимается эзотерикой». Курит, матерится, всё время проверяет дистанцию.</p>
    <blockquote>
      <p>«Официальщина и скриптованность не создают близости и контакта с человеком.»</p>
      <p>«Я всегда в режиме щупанья границ: что можно, что нельзя.» <span class="ts">00:12:45</span></p>
    </blockquote>
    <p>Созвон по видео нужен ради языка тела. Он не оценивает в уме, а чувствует, насколько человек тёплый, рациональный, зажатый.</p>
    <blockquote><p>«Если бы мы разговаривали на уровне логики, как у Азамата на созвоне, ничего не понятно. А на уровне чувств всё становится понятно сразу же.» <span class="ts">00:39:46</span></p></blockquote>
  </section>

  <section id="vozrazheniya">
    <div class="sec-head"><span class="sec-num">06</span><h3 class="t">Как закрывались барьеры</h3><span class="verdict good">решение, а не спор</span></div>
    <p>Правило одно: не обесценивать страх. У любого возражения есть два вектора ответа.</p>
    <div class="box warn">
      <p class="lbl">Так человек закрывается</p>
      <p style="margin:0">Объяснять, что это не проблема и ничего страшного тут нет. Человек чувствует, что его страх обесценили.</p>
    </div>
    <div class="box fix">
      <p class="lbl">Так страх снимается · 00:18:02</p>
      <p style="margin:0">«Смотри, есть решение, я тебе с этим помогу. Это не так страшно, как тебе кажется, потому что я через это уже проходил несколько раз.»</p>
    </div>
    <div class="scroll">
    <table>
      <thead><tr><th>Тайм</th><th>Барьер</th><th>Чем закрыт</th></tr></thead>
      <tbody>
        <tr><td class="tc">00:16:30</td><td>Эзотерика тонкая тема, нужны договоры, нужен юрист, а то не дай бог что</td><td>Три решения подряд: анкета отсекает неадекватных, контентные единицы прогревают до сделки, договор у юриста стоит 15 000 ₽</td></tr>
        <tr><td class="tc">00:20:49</td><td>Не хочет продавать эзотерику в инстаграме, это не для широкой аудитории</td><td>И не надо: инстаграм приводит людей в телеграм, продажи остаются в телеграме</td></tr>
        <tr><td class="tc">00:36:44</td><td>«Сейчас мужики отпишутся, таро не таро»</td><td>Люди покупают человека, а не тему. Отпишутся эти, придут те, кому откликается. Плюс жёны сами будут отправлять мужьям</td></tr>
        <tr><td class="tc">00:46:44</td><td>«Мне надо подумать», плюс отъезд в Беларусь и путешествия</td><td>Поездка не мешает, а нужна: чем актуальнее контекст, тем лучше работает контент</td></tr>
        <tr><td class="tc">01:21:03</td><td>Хочет вести не в аккаунте BMW, а на втором, эзотерическом</td><td>«Да, это можно сделать». Аккаунт про тачки становится каналом перелива</td></tr>
        <tr><td class="tc">01:31:26</td><td>После созвона: страх роста, страх денег, страх, что не хватит времени и сил</td><td>Один вопрос, ниже отдельным блоком</td></tr>
      </tbody>
    </table>
    </div>
    <div class="box">
      <p class="lbl">Три решения на первый барьер · 00:30:58</p>
      <ol>
        <li><b>Анкетирование.</b> По ответам видно, адекватный человек или нет. «Что пробовал? Ничего. Какой доход? До 50 тысяч. Чем занимаешься? Ещё не определился» это отказ или мини-продукт за 3 000</li>
        <li><b>Контентные единицы.</b> Аудиоподкаст про подход, второй про кейс, длинное видео. Тем, кто подписался неделю назад, сначала это, потом разговор</li>
        <li><b>Договор.</b> Универсальный, юрист собрал за 15 000 ₽</li>
      </ol>
    </div>
    <p>Про досудебные претензии он рассказывает историю до конца, и это отдельный приём: раз сам поднял пугающую тему, обязан её закрыть, иначе оставил человеку страх.</p>
    <blockquote><p>«Если я говорю про досудебные претензии в работе с клиентами, а у меня на созвоне сидит клиент, мне важно рассказать всю историю целиком. Поэтому я трачу на это время.» <span class="ts">00:34:18</span></p></blockquote>
  </section>

  <section id="priemy">
    <div class="sec-head"><span class="sec-num">07</span><h3 class="t">Приёмы по таймкодам</h3></div>
    <div class="scroll">
    <table>
      <thead><tr><th>Тайм</th><th>Приём</th><th>Почему работает</th></tr></thead>
      <tbody>
        <tr><td class="tc">00:14:18</td><td>Слушает, не перебивает, фиксирует её негативный опыт с инстаграмом</td><td>Якоря, к которым можно вернуться позже</td></tr>
        <tr><td class="tc">00:19:22</td><td>Первым делом снимает навязанные правила: можно делать так, как ты хочешь</td><td>Она пришла с чужими «ты должна», и это половина её тормоза</td></tr>
        <tr><td class="tc">00:20:03</td><td>Кейс-дроп в контексте разговора, а не парадом кейсов</td><td>«Я всегда в контексте вбрасываю какие-то свои кейсы и результаты»</td></tr>
        <tr><td class="tc">00:22:02</td><td>Заранее полистал её телеграм, о котором она не рассказывала</td><td>Пять минут внимания и информация на руках</td></tr>
        <tr><td class="tc">00:23:16</td><td>Возвращает её же поведение: ты сама посмотрела мой контент перед заявкой</td><td>Роль контента доказана её собственным опытом</td></tr>
        <tr><td class="tc">00:28:19</td><td>Накидывает идеи из её мира: подбор машины по картам, астропрогноз, когда брать авто</td><td>Ракурс собран из того, чего хочет она, а не из того, что правильно</td></tr>
        <tr><td class="tc">00:29:35</td><td>Идеи возможны только потому, что до созвона он понял её желание, проблему и страхи</td><td>«Люди очень часто сами этого ещё не понимают»</td></tr>
        <tr><td class="tc">00:30:21</td><td>Слышит по голосу и улыбке, что откликается, и начинает раздувать</td><td>«Начинаю дуть в этот огонёк, чтобы он раздувался сильнее»</td></tr>
        <tr><td class="tc">00:51:05</td><td>Точка контакта из её мира: «Божественная матрица», квантовая механика, своя история про карусель в потоке</td><td>«Мысль простая: я с тобой на одной волне»</td></tr>
        <tr><td class="tc">00:55:26</td><td>Метафора ракеты: много топлива нужно, чтобы оторваться от земли, дальше движение почти бесплатное</td><td>Объясняет, зачем вкладываться в аудиторию вообще</td></tr>
        <tr><td class="tc">00:57:55</td><td>История друга: два года снимал контент чужим аккаунтам, своей аудитории нет, денег нет</td><td>Цена бездействия через живого человека, без давления</td></tr>
        <tr><td class="tc">01:01:05</td><td>Спрашивает её прайс и линейку продуктов</td><td>Чтобы посчитать окупаемость вложения в него</td></tr>
        <tr><td class="tc">01:14:30</td><td>Подсвечивает свой интерес: давно хотел кейс в эзотерике</td><td>Желание продавца тоже аргумент, если оно настоящее</td></tr>
        <tr><td class="tc">01:15:26</td><td>Цифры рынка: сервис таро на нейронке с оборотом 10 млн $ в год, рынок психологии вырос втрое с 2022</td><td>Заходит через цифры, а не только через эмоции</td></tr>
        <tr><td class="tc">01:27:22</td><td>«Чем нестабильнее обстановка, тем больше зарабатывают коучи, психологи и помогающие практики»</td><td>Почему этим выгодно заниматься именно сейчас</td></tr>
      </tbody>
    </table>
    </div>
    <p>И то, чего он сознательно <b>не</b> делает: не разбирает её воронку, не читает её посты, не оценивает её офферы.</p>
    <blockquote><p>«Это всё вызовет ещё миллион дополнительных вопросов и сомнений. Чем больше неотвеченных вопросов в голове человека, тем больше стресса, а чем больше стресса, тем меньше желания.» <span class="ts">00:56:07</span></p></blockquote>
  </section>

  <div class="call"><h2>Деньги и финал</h2><p>цена, «надо подумать» и возврат в понедельник</p></div>

  <section id="dengi">
    <div class="sec-head"><span class="sec-num">08</span><h3 class="t">Цена и математика</h3><span class="ts">01:04:52</span></div>
    <p>Личный формат 300 000 ₽ за три месяца назван первым, групповой 150 000 ₽ вторым.</p>
    <blockquote><p>«Я сразу понимал, что вряд ли она зайдёт в личку за три сотки. Но обозначить это нужно, потому что на фоне трёхсот сто пятьдесят будет казаться супер дешёвой сделкой.» <span class="ts">01:06:30</span></p></blockquote>
    <p>Дальше окупаемость считается её же прайсом, и сделка перестаёт быть тратой.</p>
    <div class="box fix">
      <p class="lbl">Как это звучит · 01:14:05</p>
      <p style="margin:0">«Шестьдесят вернём двумя продажами твоего курса по магии. Эти деньги вернутся через две недели.»</p>
    </div>
    <p>Быстрые деньги здесь не случайно: продавать долгий результат тяжело.</p>
    <blockquote><p>«Людям сложно покупать что-то длинное. Важно, чтобы в предложении было что-то короткое, быстрые победы, за которые можно зацепиться.» <span class="ts">01:18:01</span></p></blockquote>
    <div class="box warn">
      <p class="lbl">Что Саша считает своей недоработкой · 01:06:30</p>
      <p style="margin:0">После трёхсот тысяч надо было спросить «а что ты думаешь по поводу этой суммы» и только потом переходить к рассрочкам и групповому формату. Здесь он пошёл на чувстве, потому что видел много страха и понимал уровень её дохода.</p>
    </div>
  </section>

  <section id="podumat">
    <div class="sec-head"><span class="sec-num">09</span><h3 class="t">«Мне надо подумать»</h3><span class="ts">01:08:18</span></div>
    <p>Мягкий вариант первым, жёсткий остаётся в запасе.</p>
    <ol class="steps">
      <li>Спрашивает, сколько нужно времени. Она: три дня, обычно я с этим сплю и проживаю</li>
      <li>Фиксирует дату: «давай в понедельник спишемся, скажешь да да, нет нет»</li>
      <li>Аргументирует, почему лучше начать на следующей неделе: успеем встроить её поездку в контент, не будет двух пустых недель</li>
    </ol>
    <blockquote><p>«Каждый раз, когда вы обозначаете причину любого действия, любого предложения, это работает гораздо лучше.» <span class="ts">01:09:06</span></p></blockquote>
    <p>Предоплату не берёт, и это тоже решение, а не забывчивость.</p>
    <blockquote><p>«Я чувствую по её реакциям, микрожестам и словам, что у неё всё улеглось. Дальше нужно просто дать свободу и пространство, не передавить. Если я всё сделал на созвоне правильно, она вернётся.» <span class="ts">01:29:26</span></p></blockquote>
    <p class="note">Есть и второй, агрессивный вектор: развернуть рамку и сказать «я с тобой работать не буду, потому что тебе это не надо, ты просто себе это говоришь». Работает, потому что человек начинает продавать себе сам, но нужна смелость и точное чувство ситуации.</p>
  </section>

  <section class="good-b" id="ponedelnik">
    <div class="sec-head"><span class="sec-num">10</span><h3 class="t">Понедельник: три страха и один вопрос</h3><span class="ts">01:30:38</span></div>
    <p>В понедельник он пишет первым: «привет, как ты, есть решение по поводу работы?» Она отвечает голосовыми и сама выкладывает страхи: страх роста, страх денег, страх, что не хватит времени, ресурсов и сил. И отдельно: «может, я зайду попозже, вдруг будет более идеальный момент».</p>
    <blockquote><p>«Это здорово. Могло быть и так, что она сказала бы: я решила, что нет. Тогда нам важно было бы понять причину. В контексте диалога с Дашей это было возможно, потому что на созвоне я выстроил безопасную среду, где не страшно поделиться.»</p></blockquote>
    <div class="box fix">
      <p class="lbl">Вопрос, которым закрыта сделка · 01:32:12</p>
      <p style="margin:0">«А ты думаешь, что настанет момент, когда тебе не будет страшно?»</p>
    </div>
    <p>Вывод, что такого момента не будет, делает она сама. Дальше он добивает тремя движениями.</p>
    <ul class="b">
      <li>«Я в этом лесу уже столько находился, тропы знаю, людей водил. Просто доверься мне»</li>
      <li>«Голос страха работает как охранник: его задача безопасность, он не понимает развития»</li>
      <li>«Чудовище в шкафу пугает ровно до момента, пока дверь шкафа не откроется»</li>
    </ul>
    <p>Она спрашивает, можно ли платить по частям. Он скидывает ссылку, она оплачивает.</p>
  </section>

  <section id="sravnenie">
    <div class="sec-head"><span class="sec-num">11</span><h3 class="t">Даша против Азамата</h3><span class="verdict bad">та же ошибка, вид сверху</span></div>
    <div class="scroll">
    <table>
      <thead><tr><th>Что</th><th>У Азамата</th><th>Здесь</th></tr></thead>
      <tbody>
        <tr><td>До созвона</td><td>Ничего не выяснил, не прогрел, кейс рассказывал уже на созвоне</td><td>Четыре круга вопросов, позиция и ракурс решения ещё в переписке</td></tr>
        <tr><td>Чего хочет клиент</td><td>Дама сказала, чего хочет, но он в это не пошёл, пошёл по скрипту</td><td>Понял, что она хочет денег, и всё транслировал через эту линзу</td></tr>
        <tr><td>Кто делает выводы</td><td>Выводы за клиента делал он, она соглашалась</td><td>Выводы делала она сама, отвечая на его вопросы</td></tr>
        <tr><td>Уровень разговора</td><td>Логика: пункт А, пункт Б</td><td>Чувства: слышит голос, видит улыбку, идёт за реакцией</td></tr>
        <tr><td>Возражения</td><td>Отработаны наполовину, «дорого» без вопроса «почему»</td><td>Каждый барьер закрыт решением, а не спором</td></tr>
        <tr><td>Финал</td><td>«Надо подумать, обсудить с мужем», отпущена без фиксации</td><td>Дата ответа, причина, возврат первым и вопрос-ключ</td></tr>
      </tbody>
    </table>
    </div>
    <blockquote><p>«У Азамата дама обозначила, чего она хочет, но он не стал в это идти. Он пошёл по скрипту, и в этом проблема этих скриптов.» <span class="ts">00:36:07</span></p></blockquote>
  </section>

  <section id="karkas">
    <div class="sec-head"><span class="sec-num">12</span><h3 class="t">Каркас</h3><span class="verdict good">чеклист</span></div>
    <ul class="chk">
      <li><b>До созвона задавать вопросы, а не продавать:</b> что хочет, что пробовал, что продаёт, давно ли подписан</li>
      <li><b>Давать позицию, а не оффер:</b> «важно выбрать траекторию» вместо «купи у меня»</li>
      <li><b>Не оставлять висяки:</b> через день, через два, да да, нет нет</li>
      <li><b>Прочитать человека до созвона:</b> его телеграм, посты, анкету, это пять минут</li>
      <li><b>Решить, стоит ли созвон:</b> есть ли деньги в нише, есть ли что продавать, виден ли ракурс, нужен ли тебе кейс</li>
      <li><b>Начинать с контакта,</b> неформально, проверяя границы</li>
      <li><b>Слушать и не перебивать:</b> в безопасной среде человек сам выложит все возражения</li>
      <li><b>Каждый страх закрывать решением,</b> ни один не обесценивать</li>
      <li><b>Поднял пугающую тему, закрой её до конца</b></li>
      <li><b>Кейсы вбрасывать в контексте,</b> не парадом</li>
      <li><b>Идеи собирать из мира клиента,</b> а не из того, что правильно</li>
      <li><b>Услышал отклик, раздувай:</b> «мне ложится» это зелёный флаг</li>
      <li><b>Плыть туда, куда хочет человек,</b> маневрировать потом, карта всё равно у тебя</li>
      <li><b>Считать окупаемость его прайсом,</b> чтобы сделка стала безусловной</li>
      <li><b>Дорогой формат называть первым,</b> и спрашивать реакцию на цену до рассрочек</li>
      <li><b>«Надо подумать»:</b> сколько времени, конкретная дата, причина, почему раньше лучше</li>
      <li><b>Не передавливать предоплатой,</b> если смыслы уложились</li>
      <li><b>Возвращаться первым</b> и закрывать остаток вопросом, а не аргументом</li>
    </ul>
  </section>

  <section id="citaty">
    <div class="sec-head"><span class="sec-num">13</span><h3 class="t">Цитаты под контент</h3></div>
    <blockquote><p>«Мы не работаем с бизнесом, мы работаем с людьми. Когда вы это поймёте, станет сильно проще и денег станет сильно больше.»</p></blockquote>
    <blockquote><p>«Моя задача сделать ребалансировку: раздуть желание и снизить стресс.»</p></blockquote>
    <blockquote><p>«Люди боятся своих желаний. Их страхи оправданы только тогда, когда желание маленькое, не раздутое, не подсвеченное, и человек не видит пути.»</p></blockquote>
    <blockquote><p>«А ты думаешь, что настанет момент, когда тебе не будет страшно?»</p></blockquote>
    <blockquote><p>«Голос страха работает как охранник: его задача безопасность, он не понимает развития.»</p></blockquote>
    <blockquote><p>«Чудовище в шкафу пугает ровно до момента, пока дверь шкафа не откроется.»</p></blockquote>
    <blockquote><p>«Они покупают не тему и не услугу, а человека. Твою философию, твою позицию, твои взгляды.»</p></blockquote>
    <blockquote><p>«Люди хотят коннекта, люди хотят доверия. Оптимизироваться надо под это.»</p></blockquote>
    <blockquote><p>«Чем больше человека мы добавляем в любой блог, тем круче он начинает работать.»</p></blockquote>
    <blockquote><p>«Я рядом в качестве штурмана с картой. Руки на руле у тебя, ноги на педалях у тебя.»</p></blockquote>
    <blockquote><p>«Плыть с человеком вместе, а не за волосы тащить его к себе.»</p></blockquote>
    <blockquote><p>«Если я всё сделал на созвоне правильно, она вернётся.»</p></blockquote>
    <blockquote><p>«Когда формируется навык, проблем с продажами и с деньгами у вас больше никогда не будет. Как научились ходить и больше не переживаете, что не сможете ходить.»</p></blockquote>
  </section>

  <p class="foot">Собрано из полной расшифровки записи, 1 ч 36 мин 08 сек. Таймкоды соответствуют файлу <code>transcript.txt</code> в этой же папке. Разбор опубликован с одобрения Даши, о чём Саша говорит в записи дважды.</p>

</div>
</body>
</html>
`;
