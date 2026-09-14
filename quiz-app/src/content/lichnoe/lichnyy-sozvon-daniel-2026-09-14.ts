// Конспект личного созвона 2026-09-14. Сгенерирован из
// GSD-BRAND/clients/daniel-osipov/lichnoe/2026-09-14/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_DANIEL_2026_09_14 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон 14 сентября 2026</title>
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
  <p class="kicker">Личный созвон · 14 сентября 2026</p>
  <h1>Сначала грядка и семечки, потом вода</h1>
  <p class="sub">Трафика пока нет, поэтому деньги лежат в твоих действиях: диалоги с теми, кто тебя уже знает,
  кейсы на сайт и контент без монтажёра. Под конец нащупали вектор, который закрывает сразу
  и позиционирование, и контент: ведущий для миллионеров.</p>
  <div class="meta">
    <span>58 минут</span>
    <span>9 тёплых контактов собрано</span>
    <span>4 рилса за неделю</span>
    <span>К следующему созвону: 3-5 кейсов и три ролика</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Неделя: камера заряжает, а не пугает</a></li>
    <li><a href="#s2">Оффер в презентацию собираю я</a></li>
    <li><a href="#s3">Контакты: тёплые, средние, холодные</a></li>
    <li><a href="#s4">Что писать тем, с кем работал</a></li>
    <li><a href="#s5">Каждый диалог это созданная возможность</a></li>
    <li><a href="#s6">Не сошлись по цене или по датам</a></li>
    <li><a href="#s7">Кейсы: без них наше «да» пустое</a></li>
    <li><a href="#s8">Компании, которые запрещают съёмку</a></li>
    <li><a href="#s9">Съёмка 19 сентября</a></li>
    <li><a href="#s10">Три ролика голосом</a></li>
    <li><a href="#s11">Отказаться, чтобы расти</a></li>
    <li><a href="#s12">Ведущий для миллионеров</a></li>
    <li><a href="#s13">Задачи на неделю</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Неделя и оффер</h2>
  <p>Что сделано и что дальше беру на себя</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Неделя: камера заряжает, а не пугает</h3>
    <span class="ts">00:00:11</span>
  </div>
  <p>За неделю четыре рилса и сторис, плюс со вчерашнего мероприятия снял ролик про странность,
  которую сам заметил: мало кто ездит на работу с чемоданом, а ты возвращаешься с ним,
  как будто с Курского вокзала.</p>
  <blockquote>Я думал просто, что если я поставлю камеру, то я буду минут пять тупить вообще.
  А тут у тебя возникает какой-то импульс, ты его рассказываешь и уже что-то получается.</blockquote>
  <p>Это импровизация и юмор работают на камеру. Главное сейчас этот вайб сохранять и ловить себя
  в потоке. Когда это устаканится внутри, поверх будет проще наслаивать технические и рабочие вещи.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Оффер в презентацию собираю я</h3>
    <span class="ts">00:02:49</span>
  </div>
  <p>Показал, как это делается через Клод: новый чат, текст оффера и просьба разложить его
  в презентацию, чтобы выглядело дорого и не било в глаза потоком букв. Оплатить можно через МТС Pay.</p>
  <p><span class="tc">21:28</span> Первый заход собрался криво: он взял твой старый оффер из PDF,
  а не тот, что мы доделали в Google Doc, потому что доступа к документу у него не было.</p>
  <p><span class="tc">30:35</span> Решили так: чтобы не тратить на это созвон и не отправлять тебя
  на две недели делать то, чего ты ни разу не делал, я соберу презентацию сам на твоём примере
  и запишу видео, как собирал. Дальше будешь повторять за мной под другие сегменты.
  Презентацию сразу ставим на сайт.</p>
  <p class="note">Что мне для этого нужно от тебя: фотки и твоя старая видео-визитка. Она тебе не нравится,
  но это значения не имеет. Лучше сделанное, чем ничего. Новая визитка на тридцать секунд снимается
  двадцатого в студии, появится, заменим.</p>
</section>

<div class="call">
  <h2>Часть 2. Деньги в действиях</h2>
  <p>Пока нет трафика, работаем с теми, кто уже рядом</p>
</div>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Контакты: тёплые, средние, холодные</h3>
    <span class="ts">00:04:37</span>
  </div>
  <p>Ты собрал девять человек: организаторы и HR, с которыми уже работал. Новых не искал, думал,
  что нужно откопать только своих. Задачу продлеваем, и это не разовая история: пока у нас дефицит
  трафика и нет очереди, наши деньги лежат в активных действиях с нашей стороны.</p>
  <div class="scroll">
  <table>
    <thead><tr><th>Кто</th><th>Что с ними делаем</th></tr></thead>
    <tbody>
      <tr><td><b>Тёплые, с кем работал</b></td><td>Они тебя помнят, контекст напоминать не надо. Сразу запускаем диалог.</td></tr>
      <tr><td><b>С кем общался, но до работы не дошло</b></td><td>Выписываешь. Смотрим не дальше года, дальше уже не вспомнят.</td></tr>
      <tr><td><b>Холодные</b></td><td>Пока откладываем, сначала доделываем оффер и кейсы.</td></tr>
    </tbody>
  </table>
  </div>
  <p><span class="tc">05:38</span> Где брать новых: например, в 2ГИС по запросу «организация мероприятий»
  есть все контакты. Режим такой: не садиться на два часа рассылки, а 15-30 минут в день,
  три-четыре сообщения, на постоянной основе.</p>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Что писать тем, с кем работал</h3>
    <span class="ts">00:08:41</span>
  </div>
  <p>Ты сразу предложил зайти с новой темой: тем, кому вёл мафию, провести квиз про их компанию.
  Базовое правило продаж: прежде чем что-то предлагать, узнай текущую ситуацию. Может, им это
  неактуально или у них другие планы. Чем больше вопросов задаёшь, тем больше инфы, и тем точнее
  формулируешь предложение.</p>
  <div class="box fix">
    <p class="lbl">Сообщение</p>
    <p>Привет! Я сейчас собираю график мероприятий до конца года. Пишу узнать, какие у вас планы, или ещё не планировали?</p>
  </div>
  <p>Задача сообщения одна: запустить диалог. Дальше сориентируешься сам.</p>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Каждый диалог это созданная возможность</h3>
    <span class="ts">00:11:02</span>
  </div>
  <p>Два моих случая, чтобы было понимание масштаба. Девушка просто поставила лайк на рилс. Написали:
  «Видел лайк, спасибо. Вижу, ты уже продвигаешься в онлайне, как успехи? Или просто контент понравился?»
  Завязался диалог, отправили три длинных ролика, потом предложение. Она ушла разбираться с судом
  и сама вернулась через пару месяцев. Сделка на пятьсот тысяч.</p>
  <p>Второй: девушка оставила комментарий в Threads, четыре года была подписана и ни разу ничего
  не покупала. Разговорились, я спросил: «А почему мы с вами ещё не поработали?» Созвон, двести
  пятьдесят тысяч.</p>
  <p><span class="tc">13:51</span> Возможность может сработать, может нет, но чем их больше, тем больше
  шансов. Если ответят «мы только что провели тимбилдинг, пока не думаем», спрашиваешь, когда
  с ними имеет смысл связаться. Сказали «в конце октября», ставишь в календарь или в отложенные.
  Так ты сам стимулируешь сарафан.</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Не сошлись по цене или по датам</h3>
    <span class="ts">00:15:12</span>
  </div>
  <p>Ты сказал, что процентов девяносто таких просто не сошлись по цене, причём разница не десять
  тысяч, а восемьдесят-девяносто процентов: люди искали подешевле, а не тебя. Этих ты уже отдаёшь
  другим ведущим и берёшь комиссию. Это партнёрский маркетинг, нормальная тема среди корпоратов
  и предпринимателей, многие просто стесняются. Это тоже деньги на столе.</p>
  <p>А вот те, у кого дата была уже занята, это отдельная история, и им пишем:</p>
  <div class="box fix">
    <p class="lbl">Сообщение</p>
    <p>Здравствуйте, имя. Это Даниил. Мы с вами обсуждали мероприятие такого-то числа. Пишу узнать, как у вас всё прошло?</p>
  </div>
  <p>Кто-то окажется недоволен тем, как прошло, у тебя освободятся даты, у кого-то актуализируется
  новое мероприятие. Плюс полистай за последние три месяца Телеграм, WhatsApp, Макс: там стопудово
  найдутся два-три контакта, с которыми можно поговорить.</p>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Кейсы: без них наше «да» пустое</h3>
    <span class="ts">00:31:57</span>
  </div>
  <p>Главная задача недели. Корпоратив спросит: «Даниил, а вы уже проводили?» Сейчас нам нечего
  отправить, кроме слова «да». А ссылка на сайт, где расписаны истории трёх компаний со скриншотами
  и контактами людей, которым можно позвонить и спросить про тебя, сильно поднимает доверие.</p>
  <ul class="b">
    <li>С чем пришёл человек и какая была задача</li>
    <li>Как выстраивали процесс</li>
    <li>Как прошло</li>
    <li>Артефакты: фото, видео, план мероприятия, презентация, сообщения «Даниэл, спасибо, было офигенно», видеоотзывы</li>
  </ul>
  <p><span class="tc">34:42</span> Ты сказал, что про свадьбы рассказать нечего, их было всего две-три.
  Ну и что, рассказываем про одну. Не оценивай: тебе кажется, что кейс это голливудский блокбастер,
  а если не блокбастер, то и рассказывать не стоит. Нам важно показать, что ты с этим уже работал.</p>
  <p><span class="tc">47:04</span> Это делается один раз и навсегда, а дальше пополняется: прошло
  мероприятие, подсобрал, выложил на сайт, рассказал в сторис, сделал карусель. Мы всегда
  показываем процесс своей работы.</p>
  <blockquote>Нам сейчас нужно фундамент собрать: грядочку построить, семечки туда положить и только
  потом всё это водой обливать. Вода это трафик.</blockquote>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Компании, которые запрещают съёмку</h3>
    <span class="ts">00:33:41</span>
  </div>
  <p>Ток-шоу у компании, где шеф бывший полковник-следователь, снять не дали. И ты часто с этим
  сталкиваешься: даже когда обещаешь снимать только себя, говорят «мы не хотим».</p>
  <p>Ход такой: договорились на двести десять или сто девяносто, предлагаешь скидку до ста семидесяти
  или ста шестидесяти при условии, что мероприятие можно снимать. Сказали нет, не трогаем.
  Твои мероприятия это продукт лицом, и нам важно, чтобы они копились. А про тех, кто запретил
  съёмку, в кейсах всё равно можно рассказать словами.</p>
</section>

<div class="call">
  <h2>Часть 3. Контент</h2>
  <p>Без монтажёра, но про профессию</p>
</div>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Съёмка 19 сентября</h3>
    <span class="ts">00:24:01</span>
  </div>
  <p>Следующее мероприятие девятнадцатого: восемнадцатилетие, тридцать человек, взаимодействовать
  будешь много. Самому себя снимать во время мероприятия неэтично по отношению к клиенту, поэтому
  нужен человек, который просто придёт и поснимает на телефон. Монтаж не нужен, копим материал.</p>
  <p><span class="tc">25:57</span> Петличка DJI уже пришла. Приёмник в телефон, петличку не снимаешь,
  ведёшь мероприятие, звук пишется сразу.</p>
  <p>Кого звать: знакомую рилсмейкершу ты звать не хочешь из-за личной истории, и не надо, если
  будет дискомфортно. Остаются сестра и кенты, у которых можно спросить. Если никого, пост
  в Threads: «Москва, мобилограф, нужен человек на два часа такого-то числа, пишите в личку».
  Завалят.</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Три ролика голосом</h3>
    <span class="ts">00:35:37</span>
  </div>
  <p>В моих последних роликах меня в кадре нет: я записывал голосовое, а монтажёр собирал ролик
  из архивных видео, фоток и текста. Так же у коллеги ролик про «Сашу, который покупает макароны
  Султан, и Нурлана, который одевается в Massimo Dutti» набрал миллион двести. Залёт зависит
  от того, насколько интересно рассказана история.</p>
  <p><span class="tc">39:42</span> Ты спросил, может ли это сделать нейронка. Может, но сейчас мы долго
  будем разбираться: кадры, длительность, музыка, субтитры. Быстрее руками в CapCut на телефоне.
  Когда встанет на рельсы и начнёт бесить, посмотрим другие варианты.</p>
  <ol class="steps">
    <li>Пишешь текст. Я свой сначала написал, потом начитал.</li>
    <li>Начитываешь в петличку, в камеру говорить не обязательно.</li>
    <li>Сверху кадры с мероприятий, репетиций, импровизаций, фотки, субтитры.</li>
  </ol>
  <div class="box">
    <p class="lbl">Темы</p>
    <ol>
      <li><b>Почему на празднике решает импровизация.</b> Твоя идея: взять кадры у видеографа, где ты ведёшь, и рассказать, как ты видишь праздник.</li>
      <li><b>Трэшовая история с мероприятия.</b> Не твоя боль про пароход с одним столом за день до корпоратива, её зритель не поймёт, а трэш: дымовые шашки, обожжённая рука, гости, заблудившиеся в зимнем лесу. Можно приукрасить, весь стендап на этом живёт.</li>
      <li><b>Миллионеры.</b> Почему все относятся к ним как к космическим существам, а они тоже любят поугарать. Подробно ниже.</li>
    </ol>
  </div>
  <p>Задача не залёт, а пощупать территорию: где тебе сложно, где непонятно, насколько ты гибкий.</p>
</section>

<div class="call">
  <h2>Часть 4. Позиционирование</h2>
  <p>Куда ты идёшь через год</p>
</div>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Отказаться, чтобы расти</h3>
    <span class="ts">00:48:46</span>
  </div>
  <p>Свежий разговор про знакомого ведущего из Алматы. Весёлый, харизматичный, андеграундный,
  но не глянец, и иногда перегибает с юмором: несколько раз пошутил про директора, после этого
  компания с ним работать перестала. Он ведёт крупные городские мероприятия, но не воспринимается
  как ведущий, который стоит дорого.</p>
  <p>Проблема в том, что у него нишевые суперсилы, а идёт он туда, где он не суперсилен. Топовые
  компании хотят Кена из Барби. Он полирует свой контент и замирает посередине: ни громкость
  рок-н-ролла выкрутить не может, ни в эсквайр превратиться. Это мёртвая зона.</p>
  <blockquote>Для того чтобы начать расти, важно не делать что-то, а порой отказаться от чего-то.
  Тогда остаётся только то, куда мы готовы бить и на чём делать акцент.</blockquote>
  <p>Подумай неделю: где ты себя видишь через год и органично ли тебе идти туда, куда идёшь.</p>
</section>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Ведущий для миллионеров</h3>
    <span class="ts">00:52:38</span>
  </div>
  <p>Ты сам описал, как меняешься: раньше был вайб разъёбного МС, который заряжает зал, «оп, давай,
  давай». Но энергичность и молодость это небольшие бабки, тебя воспринимают как человека, который
  работает. Сейчас это перерастает в шоу, где тонко, смешно и с восхищением.</p>
  <blockquote>Организатор говорит: «Даниел, с миллионерами вообще лучше не шутить». А я говорю:
  если вести шаблонно с миллионерами, их это в жизни заебало. Миллионеры любят, когда их стебут.
  Но стёб при этом очень добрый.</blockquote>
  <p>И две истории с той же тусовки. Девушка в леопардовой шубе с собакой: «Ух ты, какая сладкая!
  Можно погладить?» Гладишь девушку, а не собаку, зал умирает, она тоже. И «Алексей, здравствуйте,
  помогите мне найти красивого мужчину»: подколол, но человеку приятно, он звезда вечера.</p>
  <div class="facts">
    <div class="fact"><div class="n">легче</div><div class="l">рассмешить богатых, по твоим словам</div></div>
    <div class="fact"><div class="n">благодарнее</div><div class="l">и платить им не в падлу</div></div>
    <div class="fact"><div class="n">устали</div><div class="l">от того, что им постоянно облизывают жопы</div></div>
  </div>
  <p><span class="tc">55:17</span> Мне кажется, это недообслуженная аудитория, и вектор закрывает всё сразу:
  называем тебя ведущим для миллионеров и весь контент делаем для них. Рубрики вроде «как развлекаются
  миллионеры» или «проблемы миллионеров». Охваты поначалу в космос не улетят, зато это снайперские
  выстрелы по людям, у которых есть деньги. Минусов пока не вижу. Пока на подумать.</p>
</section>

<section id="s13">
  <div class="sec-head">
    <span class="sec-num">13</span>
    <h3 class="t">Задачи на неделю</h3>
    <span class="ts">00:58:08</span>
  </div>
  <div class="box">
    <p class="lbl">За тобой</p>
    <ul>
      <li><b>Кейсы, главное.</b> 3-5 мероприятий: с чем пришли, как выстраивали, как прошло, все артефакты и отзывы. Можно одну свадьбу. Не торопись, неделя есть.</li>
      <li>Фотки и старая видео-визитка в группу.</li>
      <li>Три ролика голосом: импровизация на празднике, трэш-история, миллионеры.</li>
      <li>Найти человека, который снимет мероприятие 19 сентября на телефон.</li>
      <li>Написать тёплым контактам про график до конца года.</li>
      <li>Выписать тех, с кем общались, но до работы не дошло, за последний год, и написать им.</li>
      <li>Искать новые контакты, 15-30 минут в день.</li>
      <li>Подумать, где ты через год, и про вектор «ведущий для миллионеров».</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Собрать оффер в презентацию и записать видео, как собирал, чтобы ты дальше повторял сам.</li>
      <li>Поставить оффер на сайт и собрать кейсы в пачку, когда пришлёшь.</li>
      <li>Показать пару примеров роликов голосом с кадрами.</li>
    </ul>
  </div>
</section>

<div class="foot">
  Личный созвон 14 сентября 2026, 58 минут.
</div>

</div>
</body>
</html>
`;
