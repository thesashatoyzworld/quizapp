// Конспект личного созвона 2026-09-25. Сгенерирован из
// GSD-BRAND/clients/nikita-miroshnik/lichnoe/2026-09-25/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_NIKITA_2026_09_25 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Хозяин своей жизни</title>
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
  <p class="kicker">Личный созвон · 25 сентября 2026</p>
  <h1>Хозяин своей жизни</h1>
  <p class="sub">Выбрали аудиторию: пацаны. Разобрали, почему продаём не тело и питание, а то, кем человек
  хочет стать. И почему первым делом ты садишься не за оффер, а за свою историю: пока опыт не присвоен,
  про него не получится ни рассказывать, ни продавать.</p>
  <div class="meta">
    <span>60 минут</span>
    <span>Аудитория: парни</span>
    <span>Отправная точка: «хозяин своей жизни»</span>
    <span>Первым делом: твоя история</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Для всех значит ни для кого</a></li>
    <li><a href="#s2">Что лежит под «слабостью»</a></li>
    <li><a href="#s3">Марио, а не цветочек</a></li>
    <li><a href="#s4">Позиционирование и туман войны</a></li>
    <li><a href="#s5">Формулировки: сначала камень</a></li>
    <li><a href="#s6">Доверие: своя история и кейсы</a></li>
    <li><a href="#s7">Инвентаризация опыта</a></li>
    <li><a href="#s8">Кейсы: подробная точка А</a></li>
    <li><a href="#s9">Грядка и вода</a></li>
    <li><a href="#s10">Лестница Ханта</a></li>
    <li><a href="#s11">Чеснок в ветчине: «хочу» и «надо»</a></li>
    <li><a href="#s12">Щупаем сегменты</a></li>
    <li><a href="#s13">Для тех, кто позади</a></li>
    <li><a href="#s14">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Кому и что продаём</h2>
  <p>Аудитория, оффер и отправная точка для формулировок</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Для всех значит ни для кого</h3>
    <span class="ts">00:00:02</span>
  </div>
  <p>Главная проблема фитнес-тренеров: все для всех. «Помогу похудеть или накачаться». Для мужчин или для женщин?
  «И для тех, и для тех». Так не работает. Когда мы для всех, как все остальные, контент превращается в жижу
  и не попадает ни в кого.</p>
  <p>Ты работал с девушками, но сам понимаешь, что это не твоя стратегия. Идём к пацанам: ты сам прошёл этот путь
  и знаешь, что посоветовать. И продаются они по-разному. Девушки покупают через эмоции, безопасность, внешний вид.
  Пацанам продаём через статус и силу, через переход от слабости к силе.</p>
  <blockquote>Представь, что листаешь ленту, и тебе говорят: «Если ты Никита Григорьевич, фитнес-тренер, посмотри
  обязательно это видео». Ты по-любому тормознёшь и посмотришь.</blockquote>
  <p>По тому же принципу работает прицеливание в контенте, кейсах, лид-магнитах и оффере. Чем больше человек узнаёт
  себя в том, что ты делаешь, тем больше он думает: «Это для меня. Никита с этим уже работал, значит, может помочь и мне».</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Что лежит под «слабостью»</h3>
    <span class="ts">00:04:28</span>
  </div>
  <p>Твоя тема из анкеты: от слабости к силе, без фармы и чудо-таблеток, через движение, режим и функциональное тело.
  На вопрос, что под слабостью лежит, ты ответил сам:</p>
  <ul>
    <li>робость в разговоре, переминание с ноги на ногу, тревожность рядом с мужчиной старше или крупнее, когда сразу берёшь позицию слабого и начинаешь прислуживать;</li>
    <li>порнография, сигареты, маты: привычки, которые ты не контролируешь;</li>
    <li>мусорная еда, «кушать что угодно»;</li>
    <li>начинать и бросать: везде, где есть вызов, сливаешься, потому что тут сорвался и тут сорвался.</li>
  </ul>
  <p>Отвечая на вопросы, ты по сути уже обозначил свой оффер. Оффер это трансформация: перестать быть слабым и стать сильным.</p>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Марио, а не цветочек</h3>
    <span class="ts">00:06:00</span>
  </div>
  <p>Между «слабый» и «сильный» лежат инструменты: тело, питание, привычки, тренировки. Фитнес-тренеры пытаются продавать
  именно их: как качаться, как поднимать гантельки, как накачать жопу. А человек не хочет инструменты. Он хочет избавиться
  от одного состояния и прийти в другое.</p>
  <p>Картинка с Марио: потенциальный клиент плюс твой продукт равно клиент, который теперь может делать новые крутые штуки.
  Люди покупают не цветочек, а эффект от него: большой, сильный, мощный. Когда ты начнёшь собирать предложение, контент
  и кейсы вокруг этого, а не вокруг инструментов, ты уже будешь дальше, чем 90% людей на рынке.</p>
  <blockquote>Мне надо продавать не инструменты, а то, кем они хотят быть. (твоя формулировка, всё верно)</blockquote>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Позиционирование и туман войны</h3>
    <span class="ts">00:09:29</span>
  </div>
  <p>Ты спросил, нормально ли позиционироваться не коучем, а человеком, который показывает свой путь и выводит пацанов
  хотя бы в своё состояние. До позиционирования дойдём. Идеальное позиционирование за раз не собирается: можно два часа
  копаться в голове, и это неэффективно.</p>
  <p>Работаем как в игре с туманом войны. Открыта только та часть карты, где ты стоишь. Чтобы открылось остальное,
  надо подойти к краю и сделать действие. Берём отправную точку «слабость и сила», собираем оффер, кейсы, начинаем контент,
  смотрим на обратную связь и на свои ощущения. За пару недель ты сам скажешь: «Саня, я вот это ещё понял».</p>
  <p class="note">У меня позиционирование в процессе действий пересобиралось раз семь.</p>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Формулировки: сначала камень</h3>
    <span class="ts">00:11:48</span>
  </div>
  <p>Чего хотят пацаны? Накидывали по ходу: путь к силе за 90 дней, уверенность, стать уверенным в себе мужчиной,
  уверенный взгляд. Мужики воспринимают это через статус, и так вышли на «хозяин своей жизни». Туда же ложится всё,
  что ты перечислял про контроль.</p>
  <div class="box fix">
    <p class="lbl">Отправная точка для оффера</p>
    <p>Хозяин своей жизни: от слабости к силе</p>
  </div>
  <p>Не парься по поводу формулировок. Скульптор выдалбливает лишнее из здоровенного камня, а у нас камня пока нет.
  Сначала накидываешь как можно больше вариантов, потом убираешь лишнее. Пока не записал первую формулировку,
  не придёшь ко второй: из этой приходим к этой, из этой к следующей.</p>
</section>

<div class="call">
  <h2>Часть 2. Почему тебе поверят</h2>
  <p>Своя история, кейсы и синдром самозванца</p>
</div>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Доверие: своя история и кейсы</h3>
    <span class="ts">00:14:46</span>
  </div>
  <p>Оффер показывает ценность. Но прежде чем заплатить, человек должен доверять тебе и чувствовать, что ты шаришь.
  Как это доказать, ты ответил сам: рассказать свою историю, где ты был слабым и как менялся, и кейсы, в том числе неудачные.</p>
  <p>Кейс это длинная единица, которая показывает: мы столкнулись с проблемой, прошли путь и решили её. Твоя история тоже кейс:
  ты результат своего продукта. Многие это недооценивают. Свои первые 400 продаж на мини-продуктах я сделал без чужих кейсов,
  только на своей истории.</p>
  <blockquote>Ты себе уже помог. Просто ты это себе не присвоил.</blockquote>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Инвентаризация опыта</h3>
    <span class="ts">00:18:24</span>
  </div>
  <p>Тебе 24, значит, ты 24-го уровня. А ощущаешь себя, по твоим словам, на 14-м. Жизнь не пускает тебя на 30-й, как игра
  не пускает к боссу, пока ты не готов. Задача добрать эти десять уровней.</p>
  <p>По пути ты получал мешочки с опытом, но летел вперёд, и они остались лежать. Нужно пройти обратно, забрать их и положить в кассу.
  Тогда прогресс-бар поднимется.</p>
  <p>Ты сам сказал, что обесцениваешь то, что было, и сравниваешь себя с Игорем Войтенко. Сравнение начинается, когда нет внутренних
  опор. Это как сравнивать старенькую Volvo с космической станцией: ракете нужно много топлива, чтобы взлететь, а в космосе на неё
  законы притяжения уже не действуют.</p>
  <p>И ещё один маркер. Ты пришёл к другому человеку за изменениями и заплатил за это деньги. На это способен примерно один процент.
  Значит, ты уже много проблем решал, просто не отрефлексировал.</p>
  <div class="box fix">
    <p class="lbl">Как делаем</p>
    <ol>
      <li>Google Doc, пишешь свою историю по годам: с какими проблемами разбирался, какие ситуации проживал. Не для публикации, для себя.</li>
      <li>Параллельно комментариями фиксируешь ощущения. Особенно ловишь места, где обесцениваешь: «ну делал, и что такого».</li>
      <li>Если после текста эффекта не почувствовал, ставишь камеру и рассказываешь то же самое вслух. Проговаривание работает сильнее письма.</li>
      <li>Документ кидаешь в группу. Стесняешься, тогда мне в личку, ничего страшного.</li>
    </ol>
  </div>
  <p>Финальная стадия присвоения это публичный рассказ. Как обжиг у глиняной вазы: пока не обожгли, форма не закреплена.
  Пересмотри финальный баттл в «Восьмой миле», где он сам на себя выносит всё, что о нём можно сказать, и отдаёт микрофон.
  Кредиты и факапы это твоя история, и она нормальная. Либо неудачи определяют тебя и дёргают как кукловод, либо ты их забираешь
  себе и решаешь, как они на тебя работают.</p>
  <p class="note">Я десять лет занимался музыкой и долго считал их потерянными. Через пять месяцев после того, как перестал
  обесценивать этот опыт, вспомнил озвучку в духе Гоблина, которую делал с другом, перенёс её в свои ролики и набрал 40 тысяч
  подписчиков за два месяца.</p>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Кейсы: подробная точка А</h3>
    <span class="ts">00:33:45</span>
  </div>
  <p>Сейчас у тебя в онлайне девушка на личном наставничестве с классными результатами, до этого ребята занимались с тобой в зале.
  Онлайн это или офлайн, значения не имеет.</p>
  <p>Нужно 3-5 кейсов с разными ситуациями. Желания у всех одинаковые: уверенность, деньги, красота, здоровье. Поэтому до/после
  с финальным результатом никому не интересно. Кейс продаёт, когда человек узнаёт себя в точке А.</p>
  <blockquote>Выкладываю кейс фитнес-тренера с маленьким блогом, и все фитнес-тренеры с маленьким блогом думают: «О, это я».
  Если он ещё и молодой отец, мои все молодые бати.</blockquote>
  <p>Поэтому точку А, с которой человек пришёл, описываем максимально подробно. Тогда читающий думает: «Никита помог чуваку
  в такой же ситуации, как я, значит, поможет и мне».</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Грядка и вода</h3>
    <span class="ts">00:35:59</span>
  </div>
  <p>Оффер, кейсы и воронка это грядка. Контент и трафик это вода. Если оффера и кейсов нет, сколько ни поливай, ничего
  не вырастет, вода льётся вхолостую. Многие приходят с «давайте просто сделаем контент», и это не работает.</p>
  <p>Отсюда порядок: сначала оффер, оформить его через нейронки, собрать кейсы, выгнать синдром самозванца.
  И только потом поливаем грядку контентом.</p>
</section>

<div class="call">
  <h2>Часть 3. Про что будет контент</h2>
  <p>Кому его делаем и как говорить о том, что им надо</p>
</div>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Лестница Ханта</h3>
    <span class="ts">00:39:02</span>
  </div>
  <p>На первой ступени люди не осознают проблему, им окей. На второй осознают: «я жирный, мне некомфортно». Дальше ищут решение,
  выбирают между тренерами и покупают.</p>
  <p>Кто смотрит «два самых эффективных упражнения на трапецию»? Те, кто уже ходит в зал, или коллеги. Если человек уже ходит
  в зал, ты ему как тренер не нужен. Ты сам сказал, что поэтому и был внутренний диссонанс: «нахера это выкладывать, кому это интересно».</p>
  <p>Ко мне приходил тренер со 120 тысячами подписчиков, медалями и сертификатами, которому нечем было платить за кредит.
  Он снимал упражнения. Другой снимал рецепты: отдаёт всё в бесплатном контенте, и покупать у него уже незачем. Перешёл на продающий
  контент, получил 20 лайков, и ему физически плохо: с иглы просмотров слезть тяжело. Наша задача танцевать вокруг тех, кто
  проблему осознаёт, а не вокруг тех, кто уже решает её сам.</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Чеснок в ветчине: «хочу» и «надо»</h3>
    <span class="ts">00:43:46</span>
  </div>
  <p>Собака не ест чеснок, хотя он снимет клещей. Бабушка говорит: заверни чеснок в ветчину. Чтобы дать людям то, что им надо,
  заворачиваем это в то, чего они хотят.</p>
  <p>Режим им надо, но не хочется. Поэтому до оплаты в контенте говорим только про то, что они хотят. После оплаты говорим то, что надо.
  В соцсети люди приходят отвлечься, а не учиться, и мозг там всегда выбирает лёгкий путь.</p>
  <p>Цепочка «зачем», которую прошли вместе:</p>
  <ul>
    <li>красивое тело, чтобы уважали и обращали внимание, в том числе девушки;</li>
    <li>разобраться с вредными привычками, чтобы вернуть энергию. Пока привычки тебя контролируют, ты отдаёшь им свою силу. Разобрался, забрал силу обратно;</li>
    <li>сила нужна для статуса, денег и признания.</li>
  </ul>
  <p>Итого: ты помогаешь человеку вернуть свою силу и стать хозяином своей жизни. Тело, питание и режим это инструменты,
  а результат вот он.</p>
  <p class="note">Можно выкрутить «надо» на максимум, как Игорь: «что, тебя не заебало быть слабаком?» Это тоже работает, но мне
  такой подход не нравится. Попробуешь и почувствуешь, твоё это или нет.</p>
</section>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Щупаем сегменты</h3>
    <span class="ts">00:51:31</span>
  </div>
  <p>Ты сказал, что затычка у тебя в самозванце: как говорить про уверенность и деньги, если сам не можешь назвать себя богатым.
  Продвигать то, чего у тебя нет, очень сложно. Толстому тяжело продавать программу похудения. Поэтому начни с истории, а не с оффера:
  когда распишешь свою историю и кейсы, увидишь, где у тебя твёрдые точки, где ты точно знаешь, как помочь.</p>
  <p>Например, вредные привычки. Это большая боль пацанов, а азартные игры отдельная боль, про которую почти никто не говорит.
  Щупаем: поговорили про одну привычку, посмотрели на отклик. Пошёл отклик от пацанов, собираем под них оффер: с помощью фитнеса
  и здоровья заменяем эту привычку и возвращаем себе силу. Не сработало или тема не твоя, пробуем другой сегмент.</p>
  <blockquote>За ядро берём не то, что на рынке, а то, где ты уверен и вынесешь любого по этой теме. Про это тебе будет легко
  и рассказывать, и продавать.</blockquote>
  <p>Даже маленькие результаты не обесценивай и не фильтруй. Ты смотришь на них изнутри своего контекста, а я могу увидеть там золото.</p>
</section>

<section id="s13">
  <div class="sec-head">
    <span class="sec-num">13</span>
    <h3 class="t">Для тех, кто позади</h3>
    <span class="ts">00:57:19</span>
  </div>
  <p>У меня из окна горы, для меня это норма. Люди, которые приезжают в Алматы впервые, стоят с отвисшей челюстью.
  Так же с твоим путём: каждую решённую проблему ты перестал замечать.</p>
  <p>Мерить себя мы начинаем по кумирам, которые впереди. Но контент и предложение делаются для тех, кто позади: для Никиты
  трёхлетней и пятилетней давности.</p>
</section>

<section id="s14">
  <div class="sec-head">
    <span class="sec-num">14</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">00:58:42</span>
  </div>
  <div class="box">
    <p class="lbl">По порядку</p>
    <ol>
      <li>Своя история в Google Doc по годам, с комментариями про ощущения и места, где обесцениваешь. Не почувствовал эффекта, рассказываешь на камеру.</li>
      <li>Документ в группу, или мне в личку, если не хочешь, чтобы видели.</li>
      <li>Оффер для пацанов по воркшопу «Солдаут», отправная точка «хозяин своей жизни». Продаём Марио, а не цветочек.</li>
      <li>Оформить оффер через нейронки: раздел «Нейронки», лендинг через Claude.</li>
      <li>3-5 кейсов с разными ситуациями, точка А подробно. Первый твой.</li>
      <li>Дальше контент вокруг того, чего хотят, и проверка сегментов через вредные привычки.</li>
    </ol>
  </div>
  <div class="box">
    <p class="lbl">Всю неделю</p>
    <ul>
      <li>Листаешь ленту и считаешь, сколько тренеров делают контент про то, чего хотят люди, а сколько про свои упражнения.</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Картинка с Марио.</li>
      <li>Обратная связь по документу с историей и по офферу, когда пришлёшь.</li>
    </ul>
  </div>
  <p class="note">Выполнил задачу, кидай в группу: я смотрю и даю обратную связь, а ты пока берёшься за следующую.
  Групповые созвоны по понедельникам в 7:00 и 17:00 по Москве, у тебя это 6:00 и 16:00.</p>
</section>

<div class="foot">
  Личный созвон 25 сентября 2026, 60 минут.
</div>

</div>
</body>
</html>
`;
