// Конспект личного созвона 2026-09-29. Сгенерирован из
// GSD-BRAND/clients/nia-songwriter/lichnoe/2026-09-29/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_NIA_2026_09_29 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Грядка для артистов</title>
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
  <p class="kicker">Личный созвон · 29 сентября 2026</p>
  <h1>Грядка для артистов</h1>
  <p class="sub">Разобрали, почему всё работало, а потом перестало. Решили продавать не курс по сонграйтингу,
  а личную работу для артистов, а курс положить внутрь как базу материалов. Первый шаг один: собрать оффер.
  Пока он не утверждён, дальше не двигаемся.</p>
  <div class="meta">
    <span>131 минута</span>
    <span>Сегмент: артисты</span>
    <span>Продаём: личную работу</span>
    <span>Первым делом: оффер</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Оффера нет, есть посты</a></li>
    <li><a href="#s2">Что сломалось</a></li>
    <li><a href="#s3">Конвертер перед созвоном</a></li>
    <li><a href="#s4">Заявки нужны безостановочно</a></li>
    <li><a href="#s5">Сражаться с ветром или использовать его</a></li>
    <li><a href="#s6">Ты продаёшь тем, кто позади</a></li>
    <li><a href="#s7">Скучная повторяемая модель</a></li>
    <li><a href="#s8">Где ты твёрдая: артисты</a></li>
    <li><a href="#s9">Информация не продаётся, продаётся доступ к тебе</a></li>
    <li><a href="#s10">Сначала глыба, потом скульптура</a></li>
    <li><a href="#s11">Песня для Бруно Марса</a></li>
    <li><a href="#s12">YouTube Content ID</a></li>
    <li><a href="#s13">Кейсы: старые работают, если на них вести</a></li>
    <li><a href="#s14">Без запусков</a></li>
    <li><a href="#s15">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Где авария</h2>
  <p>Почему продажи шли, а потом встали</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Оффера нет, есть посты</h3>
    <span class="ts">00:00:22</span>
  </div>
  <p>Оффера, собранного в одном месте, у тебя нет. Ты подбирала его под каждого человека на созвоне, а снаружи
  были только посты. Поэтому и дёргаешься во все стороны: налево, направо, вверх, вниз.</p>
  <p>Оффер нужен даже не столько людям, сколько нам самим: чтобы понимать, для кого мы это делаем. Из него
  прорастает контент. Если грядка не подготовлена и семена не посажены, поливать её контентом бесполезно:
  сколько ни лей, ничего не вырастет.</p>
  <blockquote>Если люди доходили до созвона, восемь из десяти покупали. До момента, пока я всё это не сломала.</blockquote>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Что сломалось</h3>
    <span class="ts">00:07:32</span>
  </div>
  <p>В то, что «люди долбоёбы», я не верю. Если что-то работало, а потом перестало, дело не в людях, а в том,
  что мы начали делать по-другому. Разложили хронологию:</p>
  <ul class="b">
    <li>последний хороший запуск в мае прошлого года, двухдневный интенсив без продаж, но серия созвонов, на которых ты продавала;</li>
    <li>устала, отдала заявки отделу продаж, они их почти все слили;</li>
    <li>запуск в сентябре на полмиллиона, потом осень «по стуку в день», последние предоплаты в ноябре-декабре, часть людей пропала;</li>
    <li>марафон за 7 777 и 11 000, через который хотела продать курс, не собрался. Лично для тебя это был критический момент;</li>
    <li>последний созвон два месяца назад: «всё охуенно, это ровно то, что мне нужно, сколько стоит?» и дальше «денег нет».</li>
  </ul>
  <p>И главное изменение рынка: нейронки. Ты сама первым делом связала падение с ними. Человек думает: зачем
  учиться писать песни, если мне может написать Suno.</p>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Конвертер перед созвоном</h3>
    <span class="ts">00:11:56</span>
  </div>
  <p>Люди приходят к тебе из книжки за тысячу рублей, из тиктока, откуда угодно, и про тебя толком ничего не знают.
  Ждать год, пока они прогреются в канале, у нас нет времени.</p>
  <p>Я в анкете спрашиваю не только «давно ли подписан», но и «что из моих длинных материалов смотрел или читал».
  Если только карусели, человек не прогрет, и созваниваться с ним вхолостую нет смысла. Я отправляю его на конвертер:
  один длинный материал, который продаёт идеи и закрывает возражения. Его не надо писать заново каждый раз,
  он делается один раз хорошо.</p>
  <div class="box fix">
    <p class="lbl">Цепочка</p>
    <p>Контент → конвертер → анкета → созвон. Продаём идеи, а не продукт.</p>
  </div>
  <p>Твой вариант конвертера это видео. Читать твоя аудитория, скорее всего, не любит.</p>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Заявки нужны безостановочно</h3>
    <span class="ts">00:15:41</span>
  </div>
  <p>Заполненная анкета это заявка. Нам нужно, чтобы их было как можно больше и чтобы они шли постоянно.
  Как только трафик останавливается, анкеты не заполняются, и продавать некому. Это я вижу и на себе.</p>
  <p>Ссылка на анкету в каждом посте не зашквар. Пока что это для «лохов», и мы с тобой пока «лохи».
  Ты хочешь сразу стать Бруно Марсом, а гитару в руки взяла неделю назад и не хочешь учить «Кузнечика».</p>
  <p>Пока собираем остальное, работаем с тем, что есть: у тебя есть пост с призывом, который приносил заявки.
  Во всех соцсетях ставим ссылку не просто на канал, а на этот конкретный пост.</p>
</section>

<div class="call">
  <h2>Часть 2. Что продаём и кому</h2>
  <p>Новый ракурс, сегмент и форма продукта</p>
</div>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Сражаться с ветром или использовать его</h3>
    <span class="ts">00:23:20</span>
  </div>
  <p>99% вокруг вещают про ИИ, Suno и Эминема, который поёт треки пятидесятых. Если мы выходим апологетами
  «надо уметь писать», мы воюем с ветром, перевоспитывая людей. Ты сама этим занимаешься всю карьеру, и тебя это вымотало.</p>
  <p>Другой путь: использовать то, чего они все хотят. У тех, кто пишет через нейронки, те же проблемы: нет прослушиваний,
  нет заработка, нет продвижения и позиционирования. Как у ребят в Алматы с двадцатью приложениями в день через вайб-кодинг:
  приложения есть, трафика и денег нет.</p>
  <div class="box">
    <p class="lbl">Два варианта</p>
    <ol>
      <li><b>Война с ИИ.</b> Оставить курс как есть и драться: «кто пишет через ИИ, тот никому не нужен, ему всегда будут платить копейки». Тяжело, но это враг, и под это можно придумать много роликов. Ты такие и снимаешь.</li>
      <li><b>Курс через призму продвижения.</b> Рыбачим людей на то, чего они хотят (прослушивания, продвижение, карьера), а внутри ты продаёшь свои смыслы: «если пишете хуету, её никто не купит».</li>
    </ol>
  </div>
  <p>Смыслы совмещаются: люди, которые пишут сами и за песнями которых стоит личность, это элитарно, дорого и не для всех.
  Это и есть аудитория, с которой ты хочешь работать.</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Ты продаёшь тем, кто позади</h3>
    <span class="ts">00:28:37</span>
  </div>
  <p>«Если бы у меня был лям подписчиков, я бы задавила авторитетом» это синдром самозванца. Ты оцениваешь себя
  глазами своей будущей версии. А продаём мы не тем, кто впереди тебя, а тем, кто на два-три шага позади.</p>
  <p>Полторы тысячи в телеге это тоже надо было сделать. Альбом в чартах набрал 666 тысяч прослушиваний за три дня,
  песня продана за миллион. Для тебя это стало нормой, как горы у меня за окном: люди, которые живут у океана,
  им не восхищаются.</p>
  <blockquote>Ты капец себя обесцениваешь, просто невероятно.</blockquote>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Скучная повторяемая модель</h3>
    <span class="ts">00:32:31</span>
  </div>
  <p>Ты попросила план, который на 80% будет тебе противен, но ты будешь его делать ради результата. Это плохая стратегия.
  То, что не опирается на твои ценности и вызывает тошноту, сжирает в десять раз больше ресурса. Ты так уже один раз
  «охуенно отдохнула» и вместо масштабирования всё погасила.</p>
  <p>Отличие мастера от любителя: любитель ищет новые фишки, мастер делает базу постоянно. Один канал, который
  работает и который ты контролируешь. Сейчас у тебя американские горки. Задача выстроить простую повторяемую модель.
  Скучно? Да. Но работает. А когда придёшь с «Саша, у меня пятнадцать созвонов в неделю, я не успеваю», тогда начнём разбирать.</p>
  <p class="note">Поэтому поэтапно. Не пытайся сделать всё за неделю.</p>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Где ты твёрдая: артисты</h3>
    <span class="ts">00:39:30</span>
  </div>
  <p>Два сегмента, коммерческие сонграйтеры и артисты, это разный контент, разные офферы, разные конвертеры.
  Совместить их значит проебаться везде.</p>
  <p>В апреле меня самого размотало: я пытался перепрыгнуть уровни, как в игре, где ты второго уровня и пятый раз
  прыгаешь на босса пятнадцатого. Я вернулся туда, где я твёрдый, в контент, за месяц собрал курс и воронку,
  и всё начало работать.</p>
  <p>Коммерческие сонграйтеры тебе неприятны: большинство ищут волшебную кнопку или социальный лифт.
  А артисты, которые хотят писать, выступать, выпускаться, тебе ближе. Про их карьеру ты «уебашишь любого».</p>
  <div class="box fix">
    <p class="lbl">Сегмент</p>
    <p>Артисты. Ты помогаешь им писать охуенные песни, продвигаться, выстроить позиционирование и привлечь внимание к своей музыке.
    Второй сегмент, коммерческих сонграйтеров, пока убираем.</p>
  </div>
  <p class="note">Писать коммерческую музыку от своего имени ради денег ты не станешь, и это правильно: если на это не стоит, работать не будет.</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Информация не продаётся, продаётся доступ к тебе</h3>
    <span class="ts">00:44:47</span>
  </div>
  <p>Люди сейчас не платят за информацию: у всех нейронки и бесплатные полезные материалы. Ценность во внедрении
  и в доступе к тебе, в том, что ты проведёшь за ручку. Все, кто приходит ко мне, уже покупали курсы и ничего не сделали,
  или им не помогали, или кураторам было всё равно.</p>
  <p>Курс не надо переделывать или дополнять. Мы берём его и заворачиваем в личную работу. Курс идёт внутри, ты составляешь
  человеку маршрутную карту и ссылаешься на свои материалы: курс, мастер-класс Music Money Making, всё остальное.
  Это твоя хата, и ты в ней хозяйка: переставляешь, переименовываешь, открываешь и закрываешь продажи.</p>
  <div class="box fix">
    <p class="lbl">Техника</p>
    <p>Все материалы из разных потоков собираешь в один канал для тех, кто на личной работе. Добавила человека,
    закончилась работа, удалила. Домашки он присылает тебе лично, в этом и есть личная работа. Групповой тариф
    не продаём, добавляем фразу «пока что».</p>
  </div>
  <p>Цены, которые были: личный тариф курса 250 тысяч (300, 250 по анкете предзаписи), личная работа вне курса
  400 тысяч за три месяца, шесть созвонов раз в две недели.</p>
  <p>Ты боишься, что не можешь гарантировать результат. Я тоже никому ничего не гарантирую. Я гарантирую, что будет
  выстроена система, собран оффер и будут первые клиенты. Если где-то авария, разбираемся. Риск всегда есть,
  я иду на него осознанно.</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Сначала глыба, потом скульптура</h3>
    <span class="ts">01:04:27</span>
  </div>
  <p>Ты всегда делала наоборот: продукт был больше оффера, и люди внутри охуевали, «вау, нихуя себе». Это авария.
  Продукт охуенный, теперь нужен такой же охуенный оффер, чтобы донести это до людей снаружи.</p>
  <p>Сначала накидываешь максимум, как будто у тебя есть все ресурсы вселенной, чтобы сделать из артиста суперзвезду.
  Потом вычёркиваем то, что нереально или где сопротивление. Что накидали на созвоне:</p>
  <ul class="b">
    <li>считаем математику: сколько песен в месяц, цена песни, стоимость часа;</li>
    <li>собираем прайс-лист;</li>
    <li>ищем базу клиентов и выстраиваем личный бренд;</li>
    <li>механики сонграйтинга, которые позволяют работать в любом жанре;</li>
    <li>правильно взятое ТЗ: 80% успеха, без мозгоёбли и правок;</li>
    <li>позиционирование и портфолио, чтобы отличаться от конкурентов;</li>
    <li>созвон раз в неделю, доступ в чат, база подрядчиков, твоя телефонная книга.</li>
  </ul>
  <p>Каждый пункт это боль, страх, желание или возражение, которое закрывает оффер. Вокруг этих пунктов потом строится
  весь маркетинг. Под артистов первые пункты про заработок на заказах можно вычеркнуть, остальное подходит.</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Песня для Бруно Марса</h3>
    <span class="ts">00:57:36</span>
  </div>
  <p>Инструмент для портфолио, я называю это бренд-кейсы. Кейси Нейстат с братом десять лет делали ролики
  для Nike без заказа и вешали у себя на сайте. Клиенты платили им в десять раз больше, а через десять лет Nike заказал официально.
  Товарищ-дизайнер нарисовал постер боя Хабиба и Макгрегора, и UFC взяли его как официальный.</p>
  <p>Так же артист может написать песню «для Бруно Марса», а дизайнер интерьеров собрать квартиру для Зендеи.
  Хороший маркетинг и пиздёж это тонкая грань, но здесь никто никого не обманывает: песню для Бруно Марса можно написать хоть сейчас.</p>
  <p class="note">Тебе не обязательно делать это самой. Это инструмент, который ты можешь предложить человеку в личной работе.</p>
</section>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">YouTube Content ID</h3>
    <span class="ts">01:50:37</span>
  </div>
  <p>Рекламный канал для артистов, про который мало кто знает. Если песня звучит в ролике, YouTube платит автору
  за каждый просмотр ролика. Есть каналы с подборками «топ-50 Shazam», «топ TikTok» по 300-500 тысяч просмотров.</p>
  <p>Я платил такому каналу 1 200 рублей за размещение, подключил Content ID за 75 долларов через TuneCore. Через два месяца
  вернулось 80 долларов, потом по две песни в подборку, и возвращалось 200-300 долларов в месяц. При этом росли Shazam,
  Apple Music, Spotify. Даже в ноль это бесплатный трафик на все площадки, в СНГ такого больше нигде нет.</p>
  <blockquote>Скрины и контакт чувака отправлю. Можешь про это пост сделать: «ребята, я тут что нашла, посмотрите».</blockquote>
  <p>Из-за ограничений YouTube в плюс сейчас, скорее всего, не выйдет, но трафик на площадки должен идти всё равно.
  Надо узнать у твоего лейбла (Белград, работает через OneRPM), монетизируют ли они Content ID.</p>
</section>

<div class="call">
  <h2>Часть 3. Как продаём</h2>
  <p>Кейсы, продажи без запусков и порядок действий</p>
</div>

<section id="s13">
  <div class="sec-head">
    <span class="sec-num">13</span>
    <h3 class="t">Кейсы: старые работают, если на них вести</h3>
    <span class="ts">01:09:32</span>
  </div>
  <p>Переносить кейсы в отдельную инсту или просто переписывать и перевыкладывать бессмысленно: кейс работает, только когда
  на него ведут трафик. Кейс Васи у меня уже мхом покрылся, но когда через два года я начал стрелять в фитнес-тренеров
  каруселью «как мне жаль фитнес-тренеров» и отправил их на кейс Васи, он снова заработал.</p>
  <div class="box fix">
    <p class="lbl">Как делаем в телеге</p>
    <ol>
      <li>Пишешь новый пост под одну боль из точки «до», например «почему одни пишут тексты легко и быстро, а другие мучаются по две недели».</li>
      <li>В нём свои новые тезисы и ссылка на старый кейс Саши.</li>
      <li>В старом посте с кейсом внизу меняешь ссылку на актуальный оффер и анкету: посты в телеге можно редактировать.</li>
    </ol>
  </div>
  <p>В кейсе продаёт не «до и после», а подробная ситуация, с которой человек пришёл. Желания у всех одинаковые, а ситуации разные.
  Человек узнаёт себя в точке А и думает: помогла ему, поможет и мне.</p>
  <p>Отзыв выпускницы после года личной работы у тебя уже лежит. Если продавать личную работу, то через него.
  Договорись с ней записать разговор про то, с чем она пришла, максимально подробно.</p>
</section>

<section id="s14">
  <div class="sec-head">
    <span class="sec-num">14</span>
    <h3 class="t">Без запусков</h3>
    <span class="ts">01:16:57</span>
  </div>
  <p>Я не продаю курс, я продаю работу со мной, и поэтому продаю асинхронно: первый созвон с каждым лично, стартуем, как
  только человек оплатил. Мне важнее стабильные деньги, чем импульсные. Дедлайны я публично обозначаю, но это не мешает
  продавать в закрытую тем, кто оставил анкету.</p>
  <p>«Если можно купить в любой момент, никто не будет ждать» работает в канале, а не в переписке один на один. Там аргументов
  миллион: «сейчас есть одно место по предварительной цене», «вижу, что у тебя интересная история, и готова тебя взять».</p>
  <p>Если дорого: внутренняя рассрочка, потом банк, потом предоплата 10 тысяч за место в группе, которая стартует такого-то числа.
  Но сначала продаём самое ценное и дорогое, личную работу.</p>
  <p>Продаём тёплым: канал и база тех, кто покупал. До холодной аудитории нам как ракам до Китая.
  Завтра выходить с «покупайте» не нужно. Неделю показываешь, что готовишь, и плавно переводишь канал в режим флирта.</p>
</section>

<section id="s15">
  <div class="sec-head">
    <span class="sec-num">15</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">01:58:01</span>
  </div>
  <div class="box">
    <p class="lbl">Порядок</p>
    <ol class="steps">
      <li>Оффер на личную работу для артистов через призму продвижения, по воркшопу «Солдаут». Сначала глыба: всё, что можешь дать артисту, если бы у тебя были ресурсы вселенной.</li>
      <li>Оффер в группу мне на обратную связь. Пока оффер не утверждён, дальше не двигаемся.</li>
      <li>Потом карта смыслов: 3-5 ключевых смыслов, которыми мы кроем страхи, боли и возражения.</li>
      <li>Потом конвертер, скорее всего видео.</li>
      <li>Потом контент.</li>
    </ol>
  </div>
  <div class="box">
    <p class="lbl">За тобой</p>
    <ul>
      <li>Спросить у лейбла, монетизируют ли они YouTube Content ID.</li>
      <li>Прислать мне видео для чат-бота и продающее видео с YouTube.</li>
      <li>Прислать отзыв выпускницы, где она рефлексирует, что было и что стало.</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Скрины и контакт канала с подборками.</li>
      <li>Обратная связь по офферу, по обоим видео и по отзыву выпускницы.</li>
      <li>План на дальше после оффера. Если понадобится, ещё один личный созвон.</li>
    </ul>
  </div>
  <p class="note">Давай поэтапно. Не торопись и не пытайся сделать всё сразу. И пользуйся моими мозгами в своём запуске: никто не мешает.</p>
</section>

<div class="foot">
  Личный созвон 29 сентября 2026, 131 минута.
</div>

</div>
</body>
</html>
`;
