// Конспект личного созвона 2026-11-17. Сгенерирован из
// GSD-BRAND/clients/maria-fokina/lichnoe/2026-11-17/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_MARIYA_2026_11_17 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон 17.11.2026</title>
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
  <p class="kicker">Личный созвон · 17 ноября 2026</p>
  <h1>Деньги, которые можно купить дёшево</h1>
  <p class="sub">Начали с первых разговоров: из десяти в группу зашла одна, большинство пришли не твоей аудиторией, а бесплатные встречи в терапии вообще не рекомендуются. Созвоны пока убираем, конвертер переделываем во вторую очередь, сначала наводим порядок.
  Разложили деньги. Группа и личка дают семьдесят-восемьдесят процентов выручки, при этом CRM нет, и непонятно, как разовые мероприятия переводят людей в личку и группу. План на два миллиона: четыре группы по девять человек, личка двадцать сессий в неделю, супервизия, коучинг и один мини-продукт в месяц. Задача выйти на эту цифру, не переплачивая временем и энергией, и удержать её три-шесть месяцев.
  По анализу канала: охваты и лайки с доходом не связаны, повторы тем работают хуже первого запуска, а работает новизна и актуальность инфоповода. Собрали календарь до февраля: три недели промо утренней группы с тридцатого ноября, старт двадцать второго декабря, стратсессия десятого января.
  Упростили хозяйство: почту закрываем серией писем, Макс отдаём ассистенту, канал «Анонсы» закрываем. Всё, что не даёт денег, убираем из головы.
  Следующую группу тестируем через Инсту, а техспециалист делает размеченные ссылки под каждую точку, чтобы видеть, откуда пришёл человек и что его довело до оплаты.</p>
  <div class="meta">
    <span>65 минут</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Десять разговоров и одна в группе</a></li>
    <li><a href="#s2">Призоловы на бесплатных встречах</a></li>
    <li><a href="#s3">Первая встреча сразу рабочая</a></li>
    <li><a href="#s4">Таблица дохода и пакет-коучинг</a></li>
    <li><a href="#s5">Что дают разовые мероприятия</a></li>
    <li><a href="#s6">Личка: шестнадцать человек, потолок двадцать</a></li>
    <li><a href="#s7">Убрала коучинг, и стало легче</a></li>
    <li><a href="#s8">Группа от семи до девяти</a></li>
    <li><a href="#s9">Два миллиона: четыре группы по девять</a></li>
    <li><a href="#s10">Деньги, которые можно купить дёшево</a></li>
    <li><a href="#s11">В идущую группу новых не добираем</a></li>
    <li><a href="#s12">Охваты с доходом не связаны</a></li>
    <li><a href="#s13">Деньги добирались мимо</a></li>
    <li><a href="#s14">Я закрыла группу</a></li>
    <li><a href="#s15">Выводы только после конца промо</a></li>
    <li><a href="#s16">Новогодник в Питере</a></li>
    <li><a href="#s17">Стратсессия «план на год»</a></li>
    <li><a href="#s18">Fuck Up Night за скобками</a></li>
    <li><a href="#s19">Три группы, ближайшая до 21 декабря</a></li>
    <li><a href="#s20">Повторы работают хуже</a></li>
    <li><a href="#s21">Новизна и актуальность инфоповода</a></li>
    <li><a href="#s22">Шестое декабря наберётся само</a></li>
    <li><a href="#s23">Стратсессия десятого января</a></li>
    <li><a href="#s24">Утренняя группа с 22 декабря</a></li>
    <li><a href="#s25">Пролонгировалась одна</a></li>
    <li><a href="#s26">План по неделям</a></li>
    <li><a href="#s27">Какую задачу решает каждая соцсеть</a></li>
    <li><a href="#s28">Два варианта для Инсты</a></li>
    <li><a href="#s29">Метка под каждый пост</a></li>
    <li><a href="#s30">Почта, Макс и «Анонсы»</a></li>
    <li><a href="#s31">Почту закрываем серией писем</a></li>
    <li><a href="#s32">Макс дублирует ассистент</a></li>
    <li><a href="#s33">Это занимает место в голове</a></li>
    <li><a href="#s34">Канал «Анонсы» закрываем</a></li>
    <li><a href="#s35">Следующую группу через Инсту</a></li>
    <li><a href="#s36">Ритм на декабрь, январь, февраль</a></li>
    <li><a href="#s37">Созвоны пока убираем</a></li>
    <li><a href="#s38">Архитектура в схему за неделю</a></li>
    <li><a href="#s39">Задача для техспеца</a></li>
    <li><a href="#s40">Как выглядит метка</a></li>
    <li><a href="#s41">Ссылка под каждую точку</a></li>
    <li><a href="#s42">Метка рекламы</a></li>
    <li><a href="#s43">Откуда вы про группу узнали</a></li>
    <li><a href="#s44">Контент всё ещё во фристайле</a></li>
    <li><a href="#s45">На чём остановились</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Первые разговоры</h2>
  <p>Почему из десяти созвонов в группу зашла одна и что делать с бесплатными встречами</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Десять разговоров и одна в группе</h3>
    <span class="ts">00:01:30</span>
  </div>
  <p>Группа собралась, это хорошая новость. А по первым разговорам итог такой: <span class="q">10 созвонов и только одна, получается, зашла в группу</span>.</p>
  <p>Одну встречу ты отменила сама, потому что человек заполнил анкету ночью, и проводить ты не стала. Ещё одна девушка пришла не через созвон, а через пост с воронкой на группу.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Призоловы на бесплатных встречах</h3>
    <span class="ts">00:02:40</span>
  </div>
  <p>Спросил, что люди говорят. Ответ: <span class="q">Подавляющая часть, это вообще не моя ЦА</span>. И дальше: <span class="q">Это то, чего я боялась на самом деле. Это эти призоловы, которые ходят на все бесплатные встречи</span>.</p>
  <p>Одной знакомой пришлось сказать прямо, чтобы перестала ходить кругами. На её «я вам помогаю» ответ был: <span class="q">вы мне мешаете</span>.</p>
  <p>Я предложил два хода. Первый: повесить на встречу любой ценник, тысяча или две тысячи рублей, сумма значения не имеет. Второй: пересобрать карусель-конвертер, чтобы она уже на уровне смыслов отфильтровывала людей, которые до тебя добираются.</p>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Первая встреча сразу рабочая</h3>
    <span class="ts">00:03:50</span>
  </div>
  <p>Ты объяснила, где тут противоречие. У тебя есть встреча-знакомство, и она отлично конвертит, потому что подразумевает, что дальше человек заходит в работу или вы не сходитесь. Других вариантов нет.</p>
  <p>А с бесплатными встречами в терапии нюанс: <span class="q">нам не очень можно проводить бесплатные встречи</span>. Человек, который не очень здоров, <span class="q">сидит как на собеседовании</span>, рассказывает правильные вещи, с ним всё хорошо. Заходит в работу, перенапрягается с первой встречи и начинает творить дичь. Поэтому есть <span class="q">дидактическая рекомендация, бесплатные встречи по терапии не проводить</span>.</p>
  <p>Я бы обыграл так: приходи на платную терапию, первая встреча рабочая, и после неё можно просто не оставаться. Но к этому вернёмся позже, задача была добрать группу, и она решена.</p>
</section>

<div class="call">
  <h2>Часть 2. Деньги и цифры</h2>
  <p>Откуда выручка, где потолок по личке и группе и как выглядят два миллиона</p>
</div>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Таблица дохода и пакет-коучинг</h3>
    <span class="ts">00:06:10</span>
  </div>
  <p>Я соотнёс таблицу дохода, которую ты скидывала, с запусками в телеге и тем, что происходило в Инстаграме. В среднем выходит около миллиона в месяц, бывало полтора и миллион шестьсот. За 2026 год получается 1,1-1,3 миллиона в месяц.</p>
  <p>Ты уточнила: <span class="q">Я не указала там то, что приходит по оплатам по счетам</span>. Сумма на деле больше, но на выводы это не влияет, оставляем как есть.</p>
  <p>В таблице был «пакет». <span class="q">Пакет это коучинг</span>. До 2025 года он давал чуть ли не половину выручки, потом ты от него отказалась. Сейчас группа и личная терапия дают семьдесят-восемьдесят процентов.</p>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Что дают разовые мероприятия</h3>
    <span class="ts">00:08:30</span>
  </div>
  <p>Проблема в том, что <span class="q">нету нормально настроенной CRM-системы и мониторинга клиентов</span>. Мы не знаем, как маленькие запусковые продукты и разовые мероприятия переводят людей в личку и в группу.</p>
  <p>Пример: в январе 2026 разовые мероприятия дали триста тысяч. Можно решить, что делать их неэффективно. Но мы не знаем, какой эффект они дали для роста группы и лички, и сколько времени ушло на их промо.</p>
  <p>Отсюда первое, что нужно сделать: простую схему, чтобы через месяц-два мы сели и точно понимали, как каждая активность влияет на деньги. Ты согласна.</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Личка: шестнадцать человек, потолок двадцать</h3>
    <span class="ts">00:10:22</span>
  </div>
  <p>В личке ты заполнена. <span class="q">У меня сейчас получается в среднем где-то 15-16 сессий в неделю</span>, это пятнадцать-шестнадцать разных людей. Два-три человека можешь добрать точно, потолок двадцать в неделю.</p>
  <div class="facts">
    <div class="fact"><div class="n">15-16</div><div class="l">сессий в неделю сейчас, столько же разных людей</div></div>
    <div class="fact"><div class="n">20</div><div class="l">сессий в неделю, потолок</div></div>
    <div class="fact"><div class="n">60 → 80</div><div class="l">сессий в месяц сейчас и цель</div></div>
    <div class="fact"><div class="n">13 000</div><div class="l">рублей за сессию</div></div>
  </div>
  <p>Я поделился своим: у меня группа человек десять и пятеро в личке, и я быстро понял, что не могу расти, если буду только разменивать время и энергию на людей. Семьдесят-восемьдесят процентов ресурса уходит не на работу, а на то, чтобы работать с головой человека.</p>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Убрала коучинг, и стало легче</h3>
    <span class="ts">00:12:02</span>
  </div>
  <p>Ты заметила интересную вещь и предложила, что это может быть темой для контента. Когда ты убрала коучинг, пропали переключения: терапевт, потом коуч, потом совещание, потом группа, потом снова коуч.</p>
  <p>Теперь самочувствие другое: <span class="q">Я могу провести группу и 5 сессий</span>, а потом ещё разговаривать, поужинать дома и поболтать о чём-нибудь.</p>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Группа от семи до девяти</h3>
    <span class="ts">00:13:31</span>
  </div>
  <p>Деньги можно добрать личкой, но выгоднее группой. Уточнили рамки: <span class="q">могу запустить, когда там минимум 7 человек. Мой максимум, я веду ее одна, это 9 человек</span>.</p>
  <p>Пятнадцать в группе уже много. Для этого нужен второй терапевт в пару, а ты <span class="q">не очень хочу, если честно</span>.</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Два миллиона: четыре группы по девять</h3>
    <span class="ts">00:17:53</span>
  </div>
  <p>Пересчитали под твои ограничения, и вот как выглядят два миллиона в месяц.</p>
  <div class="box fix">
    <p class="lbl">План на два миллиона</p>
    <ul>
      <li>Четыре группы по девять человек</li>
      <li>Личка двадцать сессий в неделю, это около миллиона</li>
      <li>Супервизия и коучинг</li>
      <li>Один мини-продукт в месяц, им просто добираем</li>
    </ul>
  </div>
  <p>Твоя реакция: <span class="q">Это очень похоже на то, что я и планировала</span>. И ещё: <span class="q">он не выглядит удавиться на этом плане</span>.</p>
  <p>Задача всего остального, кроме группы и лички, собирать людей в комнате ожидания, чтобы циркуляция не заканчивалась. Освободилась личка, ты предлагаешь её кому-то из группы, листу ожидания или тем, кто покупал разовые продукты. Или даёшь один анонс. По твоему опыту <span class="q">как только говорю о том, что у меня есть места, они уходят просто обычно за день</span>.</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Деньги, которые можно купить дёшево</h3>
    <span class="ts">00:18:30</span>
  </div>
  <p>Первостепенно выйти на эту цифру, но <span class="q">не переплачивать за эти деньги с точки зрения времени и энергии</span>.</p>
  <p>Как я это вижу: <span class="q">есть деньги, которые можно купить очень дорого, а есть деньги, которые можно купить дешево</span>. Этот баланс и надо выдержать.</p>
  <p>Второе: зафиксироваться на цифре, чтобы в разрезе трёх-шести месяцев планка держалась и мы видели это в динамике.</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">В идущую группу новых не добираем</h3>
    <span class="ts">00:19:51</span>
  </div>
  <p>Нейросеть сначала посчитала по-своему: семь-восемь новых участников в месяц на смену уходящим. Так не работает: <span class="q">Мы не можем добирать в старую группу новых людей</span>. Только собирать новых в новую группу. Под это и пересобираем расчёт.</p>
</section>

<div class="call">
  <h2>Часть 3. Что показал анализ</h2>
  <p>Связь соцсетей с деньгами, откуда добирались люди и почему важен последний день промо</p>
</div>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Охваты с доходом не связаны</h3>
    <span class="ts">00:21:01</span>
  </div>
  <p>Главное, что увидел: <span class="q">Связь с просмотрами канала, с лайками в инсте вообще не коррелирует у тебя под доходом</span>. Нет такого, что пришёл приток аудитории или вышла тема и денег стало больше.</p>
  <p>Объяснение, скорее всего, в другом: у тебя коммерческий бэкграунд, и ты умеешь добирать KPI, который себе ставишь. Ты согласилась.</p>
</section>

<section id="s13">
  <div class="sec-head">
    <span class="sec-num">13</span>
    <h3 class="t">Деньги добирались мимо</h3>
    <span class="ts">00:22:02</span>
  </div>
  <p>Во многих окнах непонятно, откуда добирались деньги и люди. Скорее всего это рассылки, личные сообщения, сторис, которые уже не посмотреть.</p>
  <p>В этом и проблема: <span class="q">нет организованного вот этого пайплайна</span>, и однозначных выводов сделать нельзя.</p>
  <p>Ты назвала это главной проблемой: <span class="q">мне там что-то навеяло, я такая, надо вот это сделать</span>.</p>
</section>

<section id="s14">
  <div class="sec-head">
    <span class="sec-num">14</span>
    <h3 class="t">Я закрыла группу</h3>
    <span class="ts">00:22:34</span>
  </div>
  <p>Как раз пример со сторис в воскресенье. Лежала, вспомнила, что я говорил сделать сторис, и написала: <span class="q">все, я закрыла группу</span>. И люди пришли.</p>
  <p>Раньше ты так делала только на мероприятия: за сутки до старта писала, кто не успел, залетайте. И тут же начиналось: куда платить, я не заметила. Хотя до этого можно было <span class="q">6 недель просто каждый день рассказывать</span> про мероприятие, и никто ничего не видел.</p>
</section>

<section id="s15">
  <div class="sec-head">
    <span class="sec-num">15</span>
    <h3 class="t">Выводы только после конца промо</h3>
    <span class="ts">00:23:21</span>
  </div>
  <p>Этому я научился у ментора на Западе. Он делал <span class="q">2 недели промо основного оффера, 2 недели промо воркшопа</span>.</p>
  <p>Его ключевой тезис: <span class="q">никогда не делайте выводы о промо-компании, пока она не закончилась. Потому что чаще всего большая часть оплат приходит в последний день</span>. Причина простая: закрывается, я не успею.</p>
</section>

<div class="call">
  <h2>Часть 4. Календарь до февраля</h2>
  <p>Мероприятия декабря, группы, стратсессия и что показали повторы тем</p>
</div>

<section id="s16">
  <div class="sec-head">
    <span class="sec-num">16</span>
    <h3 class="t">Новогодник в Питере</h3>
    <span class="ts">00:23:52</span>
  </div>
  <p>Шестого декабря у тебя мероприятие в Санкт-Петербурге. Это новогодник в месте Димы Румянцева: тусуемся, едим, и ты читаешь лекцию <span class="q">про приверженность целям на марафонской дистанции</span>.</p>
</section>

<section id="s17">
  <div class="sec-head">
    <span class="sec-num">17</span>
    <h3 class="t">Стратсессия «план на год»</h3>
    <span class="ts">00:24:51</span>
  </div>
  <p>Есть традиционная встреча на новогодних праздниках: стратсессия «план на год». Динамичная, <span class="q">все меня ненавидят, потому что надо очень быстро все делать</span>, но с групповыми практиками и прикольная. За три часа человек собирает план на год.</p>
  <p>Делаешь её в январе, не в декабре: в декабре все уставшие.</p>
</section>

<section id="s18">
  <div class="sec-head">
    <span class="sec-num">18</span>
    <h3 class="t">Fuck Up Night за скобками</h3>
    <span class="ts">00:25:31</span>
  </div>
  <p>Есть идея сделать Fuck Up Night с белорусскими коллегами: что-то вроде стендапа про факапы, <span class="q">Жить страшно и смешно</span>. Ты видишь это как развлечение и способ попробовать новый формат.</p>
  <p>Пока выносим за скобки. По твоим словам, продашь сама без проблем. Вопрос только в том, когда, и как это встраивается в план.</p>
</section>

<section id="s19">
  <div class="sec-head">
    <span class="sec-num">19</span>
    <h3 class="t">Три группы, ближайшая до 21 декабря</h3>
    <span class="ts">00:26:41</span>
  </div>
  <p>Сейчас у тебя три группы. <span class="q">Ближайшая заканчивается 21 декабря</span>.</p>
</section>

<section id="s20">
  <div class="sec-head">
    <span class="sec-num">20</span>
    <h3 class="t">Повторы работают хуже</h3>
    <span class="ts">00:28:00</span>
  </div>
  <p>Пока я всё это смотрел и лопатил с нейронкой, стало видно, что у тебя очень много всего разного.</p>
  <p>И вот что вылезло: каждый раз, когда перезапускается старая тема, она работает хуже. По цифрам: <span class="q">Первый запуск темы за полгода дает медиане 50 оплат</span>, повторы около тридцати.</p>
</section>

<section id="s21">
  <div class="sec-head">
    <span class="sec-num">21</span>
    <h3 class="t">Новизна и актуальность инфоповода</h3>
    <span class="ts">00:29:02</span>
  </div>
  <p>Работает новизна. Причём это <span class="q">может быть то же самое, но с новым названием в новой упаковке</span>. Ты согласна.</p>
  <p>Третье: актуальность инфоповода. Стратсессия в январе работает, потому что люди отдохнули, расслабились, у них появилось время спланировать, и вокруг все пишут планы и резолюции. Окно актуальности открыто. Но переупаковать всё равно надо будет.</p>
</section>

<section id="s22">
  <div class="sec-head">
    <span class="sec-num">22</span>
    <h3 class="t">Шестое декабря наберётся само</h3>
    <span class="ts">00:30:10</span>
  </div>
  <p>Спросил, сколько нужно рассказывать про Питер. <span class="q">Вообще про это не нужно рассказывать. Я могу периодически делать просто вбросы</span>.</p>
  <p>Каждый раз после вброса кто-то покупает: вчера кинула информацию в телеге и Максе, девушка уже оплатила, ещё двое на подходе. <span class="q">судя по тому, как оно набирается, оно уже наберется</span>. Отменять не будешь, отдельного промо не нужно.</p>
</section>

<section id="s23">
  <div class="sec-head">
    <span class="sec-num">23</span>
    <h3 class="t">Стратсессия десятого января</h3>
    <span class="ts">00:31:21</span>
  </div>
  <p>Подбирали дату. Раньше ты делала стратсессию пятого или девятого, на воскресенье. Посмотрели выходные в Европе и Казахстане: четвёртое отрежет Европу, третье слишком рано.</p>
  <p>Остановились на десятом января. Это воскресенье, и в понедельник люди выйдут на работу собранными. Промо стратсессии идёт с двадцать восьмого декабря по десятое января.</p>
</section>

<section id="s24">
  <div class="sec-head">
    <span class="sec-num">24</span>
    <h3 class="t">Утренняя группа с 22 декабря</h3>
    <span class="ts">00:35:31</span>
  </div>
  <p>Остаётся месяц с тридцатого ноября до двадцать восьмого декабря. Группа заканчивается двадцать первого, значит сразу можно начать новую.</p>
  <p>Твоё предложение: <span class="q">утренняя группа очень людей интересует. Я могу поставить ее с 22 декабря</span>. На этом и фокусируемся.</p>
</section>

<section id="s25">
  <div class="sec-head">
    <span class="sec-num">25</span>
    <h3 class="t">Пролонгировалась одна</h3>
    <span class="ts">00:36:32</span>
  </div>
  <p>Тем, кто в заканчивающейся группе, ты хочешь предложить не продолжать: там много людей, <span class="q">которые там по два с половиной года в этой группе</span>, им бы сделать паузу.</p>
  <p>И сложность в другом. Про группу, которую собирали сейчас, ты рассчитывала, что продлятся почти всем составом. <span class="q">Одна пролонгировалась. И это была прям неожиданность для меня большая</span>.</p>
</section>

<section id="s26">
  <div class="sec-head">
    <span class="sec-num">26</span>
    <h3 class="t">План по неделям</h3>
    <span class="ts">00:37:10</span>
  </div>
  <p>Сегодня семнадцатое, до тридцатого две недели. Этого хватит, чтобы подготовиться и начать хоть как-то замерять.</p>
  <div class="scroll">
  <table>
    <tr><th>Когда</th><th>Что делаем</th></tr>
    <tr><td class="tc">до 30.11</td><td>Фристайл, цель закрыли хорошо. Готовимся к замерам</td></tr>
    <tr><td class="tc">06.12</td><td>Новогодник в Питере, набирается сам, только вбросы</td></tr>
    <tr><td class="tc">30.11-21.12</td><td>Три недели промо новой утренней группы</td></tr>
    <tr><td class="tc">22.12</td><td>Старт новой группы на смену той, что заканчивается 21.12</td></tr>
    <tr><td class="tc">21.12-28.12</td><td>Фристайл</td></tr>
    <tr><td class="tc">28.12-10.01</td><td>Промо стратсессии «план на год»</td></tr>
    <tr><td class="tc">10.01</td><td>Стратсессия</td></tr>
  </table>
  </div>
  <p>Ты подтвердила: <span class="q">Да, вполне</span>.</p>
</section>

<div class="call">
  <h2>Часть 5. Упрощаем хозяйство</h2>
  <p>Какая площадка что делает и от чего отказываемся</p>
</div>

<section id="s27">
  <div class="sec-head">
    <span class="sec-num">27</span>
    <h3 class="t">Какую задачу решает каждая соцсеть</h3>
    <span class="ts">00:37:53</span>
  </div>
  <p>Продуктов много, хозяйство большое, и его нужно упростить насколько возможно. Плюс непонятно, какую задачу решает каждая соцсеть.</p>
  <p>Пример свежий: раньше фокус был на телегу, промо там шло тяжело. <span class="q">В Инстаграме начали делать сториз, бам, группа собралась</span>.</p>
</section>

<section id="s28">
  <div class="sec-head">
    <span class="sec-num">28</span>
    <h3 class="t">Два варианта для Инсты</h3>
    <span class="ts">00:38:51</span>
  </div>
  <div class="box">
    <p class="lbl">Вариант 1</p>
    <ul>
      <li>Единственная задача Инсты: переводить людей в телегу, в том числе сторис</li>
      <li>В телеге греем и продаём: анонсы продуктов, наборы в группу, вперемешку с полезным</li>
      <li>Так проще всё мониторить</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">Вариант 2</p>
    <ul>
      <li>Инста тоже продаёт, например сторис</li>
      <li>Тогда под каждый инструмент нужна отдельная ссылка, чтобы видеть, сколько оттуда приходит и какие конверсии</li>
      <li>Раз в месяц кто-то снимает охваты, чтобы понимать, где что работает</li>
    </ul>
  </div>
  <p>Сложность в том, что ветки переплетаются: сторис ведут на одну анкету, карусель на другую, рилсы на карусель. Мониторить такое хозяйство тяжело, и в телеге то же самое.</p>
</section>

<section id="s29">
  <div class="sec-head">
    <span class="sec-num">29</span>
    <h3 class="t">Метка под каждый пост</h3>
    <span class="ts">00:41:30</span>
  </div>
  <p>Я у себя настроил так, чтобы видеть, с какого поста заполняется анкета. Это делается через UTM-метки.</p>
  <div class="box fix">
    <p class="lbl">Как это будет на промо группы</p>
    <ul>
      <li>С тридцатого начинаем промо, за три недели выходит, например, пятнадцать постов в телеге</li>
      <li>Под каждый пост со ссылкой на анкету своя метка</li>
      <li>Анкету заполнили тридцать человек, оплатили девять, группа собрана</li>
      <li>Видим, откуда пришли эти люди, что их довело до анкеты и почему девять купили</li>
    </ul>
  </div>
  <p>Получается петля обратной связи: понимаем, что лучше влияет на промо группы. Да, <span class="q">выглядит как задротство</span>, можно и без этого. Но мне хочется идти к уменьшению энтропии, потому что сейчас мы не знаем, какой пост продаёт, а какой нет.</p>
</section>

<section id="s30">
  <div class="sec-head">
    <span class="sec-num">30</span>
    <h3 class="t">Почта, Макс и «Анонсы»</h3>
    <span class="ts">00:43:21</span>
  </div>
  <p>Ты подняла то, с чем непонятно что делать. Почтовая рассылка <span class="q">выглядит, как сказать, немножко убитой</span>: тёплая аудитория, участвует в опросах, что-то покупала, но больше ни во что не конвертит.</p>
  <p>Макс ничего не продаёт, разве что собрал деньги на благотворительность. И канал «Анонсы» в телеге, около ста семидесяти человек, которые что-то покупали или были на мероприятиях. Тоже не конвертят.</p>
</section>

<section id="s31">
  <div class="sec-head">
    <span class="sec-num">31</span>
    <h3 class="t">Почту закрываем серией писем</h3>
    <span class="ts">00:44:54</span>
  </div>
  <p>Посмотрели цифры: в базе около двух тысяч, подтвердили рассылку 1217, письма смотрят примерно двести-двести тридцать семь человек. Продаёт ли? <span class="q">Слушай, я вижу, что нет</span>.</p>
  <p>Почта как прямой контакт с человеком хороша, но у нас её не читают: вводят, чтобы что-то забрать, и всё. Я сам у себя эту задачу решаю через телеграм-бота.</p>
  <div class="box fix">
    <p class="lbl">Что делаем с почтой</p>
    <ul>
      <li>Точка сбора людей: телеграм-канал</li>
      <li>Серия из одного-трёх писем: вся информация теперь в ТГ-канале, подписывайтесь</li>
      <li>Под рассылку отдельная ссылка, чтобы посмотреть, сколько людей с неё подпишется</li>
      <li>Потом рассылку закрываем и убираем из поля внимания</li>
    </ul>
  </div>
</section>

<section id="s32">
  <div class="sec-head">
    <span class="sec-num">32</span>
    <h3 class="t">Макс дублирует ассистент</h3>
    <span class="ts">00:48:51</span>
  </div>
  <p>В Максе почти две тысячи человек. Можешь сказать, что они ничего не покупают? <span class="q">Абсолютно</span>. Одна участница группы попросила дублировать туда информацию, потому что ей плохо проходят сообщения в телеге. А двое, записавшиеся оттуда на первый разговор, пришли без денег.</p>
  <p>Стратегии на страхе я не люблю. Идея завести резервные площадки на случай блокировки рациональна, но у нас ещё ни разу не было блокировки, которую люди не научились обходить.</p>
  <p>Поэтому: ассистент дублирует посты из телеги в Макс, под любую активность ставим метку «Макс», а ты туда внимания не обращаешь вообще.</p>
</section>

<section id="s33">
  <div class="sec-head">
    <span class="sec-num">33</span>
    <h3 class="t">Это занимает место в голове</h3>
    <span class="ts">00:52:42</span>
  </div>
  <p>Ты сказала, что заливаешь посты в Макс сама: <span class="q">Две кнопки нажать</span>. Но это всё равно внимание.</p>
  <p>Каждое переключение кажется двумя минутами, но мерить надо не минутами, а тем, сколько ты про это думаешь. Ты же спрашиваешь меня, что там с почтой, что с Максом. Значит в голове это занимает место и собирает пыль.</p>
</section>

<section id="s34">
  <div class="sec-head">
    <span class="sec-num">34</span>
    <h3 class="t">Канал «Анонсы» закрываем</h3>
    <span class="ts">00:53:31</span>
  </div>
  <p>Сто семьдесят человек, тоже не покупают. Пишем сообщение: <span class="q">я закрываю эту группу, вся информация дальнейшая будет в моем телеграм канале. Если вы подписаны, прекрасно, если нет, подпишитесь</span>.</p>
  <p>Так избавились от трёх вещей, которые занимают место в голове. Принцип один: всё, что не даёт денег, из головы убираем.</p>
</section>

<div class="call">
  <h2>Часть 6. Инста, трекинг и контент</h2>
  <p>Тест продвижения группы через Инсту, размеченные ссылки и ближайшие шаги по контенту</p>
</div>

<section id="s35">
  <div class="sec-head">
    <span class="sec-num">35</span>
    <h3 class="t">Следующую группу через Инсту</h3>
    <span class="ts">00:54:10</span>
  </div>
  <p>Раз сторис продают, следующую группу, которую собираем, я бы прямо затестил через Инсту и активно её там попродвигали.</p>
  <p>Часть будет вести в телегу, часть прямо с Инсты. Архитектуру я подсоберу по цифрам, чтобы было понятнее. Цель: понимать, какая площадка что делает.</p>
</section>

<section id="s36">
  <div class="sec-head">
    <span class="sec-num">36</span>
    <h3 class="t">Ритм на декабрь, январь, февраль</h3>
    <span class="ts">00:54:42</span>
  </div>
  <p>В декабре добираем ещё одну группу, их снова три параллельно. В январе стратсессия, с неё можно добирать четвёртую группу, а в феврале активный запуск группы.</p>
  <p>Ты подтвердила: <span class="q">тогда реально получается классный ритм и будет хорошо</span>.</p>
</section>

<section id="s37">
  <div class="sec-head">
    <span class="sec-num">37</span>
    <h3 class="t">Созвоны пока убираем</h3>
    <span class="ts">00:55:21</span>
  </div>
  <p>По первым разговорам решение: <span class="q">созвоны, убираем пока нафиг их</span>.</p>
  <p>Карусель-конвертер тогда надо переделать, но это вторая очередь. Сначала наводим порядок.</p>
</section>

<section id="s38">
  <div class="sec-head">
    <span class="sec-num">38</span>
    <h3 class="t">Архитектура в схему за неделю</h3>
    <span class="ts">00:55:51</span>
  </div>
  <p>Вариант, где бот под каждой публикацией присылает ссылку и запоминает, откуда пришёл человек, сейчас будет слишком сложно настроить.</p>
  <p>Нужна архитектура хозяйства, которую на этом этапе может воспринять и твоя голова, и моя. <span class="q">Я это в схему соберу, отправлю тебе и утвердим с тобой в течение недели</span>.</p>
</section>

<section id="s39">
  <div class="sec-head">
    <span class="sec-num">39</span>
    <h3 class="t">Задача для техспеца</h3>
    <span class="ts">00:56:22</span>
  </div>
  <p>Что точно нужно в первую очередь: <span class="q">нам нужно мониторить путь человека</span>, откуда он пришёл.</p>
  <p>У тебя есть техспециалист в GetCourse. Группу продаёшь через GetCourse, потому что иностранные оплаты через Продамус не проходят. Значит просишь техспеца сделать размеченные ссылки на группу.</p>
</section>

<section id="s40">
  <div class="sec-head">
    <span class="sec-num">40</span>
    <h3 class="t">Как выглядит метка</h3>
    <span class="ts">00:57:30</span>
  </div>
  <p>Показал, как сделал у себя на запуске нового продукта: продукт 360, промо, ТГ-канал и дата. Хочу точно знать, откуда и почему идут люди и что продаёт хорошо.</p>
  <p>У тебя будет так же: сайт, дальше продукт, промо, площадка и дата. Последнюю часть ты каждый раз можешь менять сама. Главное, чтобы техспец настроил трекинг этих ссылок и информация где-то собиралась.</p>
</section>

<section id="s41">
  <div class="sec-head">
    <span class="sec-num">41</span>
    <h3 class="t">Ссылка под каждую точку</h3>
    <span class="ts">00:59:21</span>
  </div>
  <div class="box fix">
    <p class="lbl">Какие ссылки на группу нужны</p>
    <ul>
      <li>Для ТГ-канала</li>
      <li>Для сторис</li>
      <li>Для шапки профиля: это работает фоном, когда люди заходят в профиль и открывают описание</li>
      <li>Для карусели-конвертера: выдаётся по ключевому слову через автоматизацию</li>
      <li>Метка рекламы</li>
    </ul>
  </div>
  <p>Автоматизацию по ключевому слову ты можешь сделать сама без проблем.</p>
</section>

<section id="s42">
  <div class="sec-head">
    <span class="sec-num">42</span>
    <h3 class="t">Метка рекламы</h3>
    <span class="ts">00:59:54</span>
  </div>
  <p>Ты объяснила, как это бывает: люди приходят с рекламы, подписываются на канал, ещё ничего не прочитали, а уже идёт промо группы, и они записываются. И прямо говорят, что пришли с рекламы.</p>
  <p>Значит нужен трекинг: человек пришёл с рекламы, получил метку. Если он заходит в группу, мы видим, что он с рекламы.</p>
</section>

<section id="s43">
  <div class="sec-head">
    <span class="sec-num">43</span>
    <h3 class="t">Откуда вы про группу узнали</h3>
    <span class="ts">01:01:20</span>
  </div>
  <p>В сторис ты писала «напишите в личку», а люди писали в телегу. Одна девушка с московского мероприятия, которую ты видела впервые: отсидела его молча и потом написала. А та, что говорила, что очень хочет на группу, так и не явилась.</p>
  <p>Даже если пишут в телегу, это нужно внедрить: спрашивать, откуда человек про группу узнал. <span class="q">Вот прям суперключевой вопрос</span>.</p>
</section>

<section id="s44">
  <div class="sec-head">
    <span class="sec-num">44</span>
    <h3 class="t">Контент всё ещё во фристайле</h3>
    <span class="ts">01:04:30</span>
  </div>
  <p>Спросил, получилось ли систематизировать контент. <span class="q">Все еще в режиме фристайла</span>. Ты во что-то упираешься и думала наговорить мне голосом, во что именно, потому что <span class="q">мне прям, блин, не идет</span>.</p>
  <p>Решили сразу на практике. Сегодня вторник, завтра собираешь список идей, которые реализуешь в четверг и пятницу и которые выйдут на следующей неделе. А я повыступаю трекером поэтапно, в процессе демоны сами начнут всплывать.</p>
</section>

<section id="s45">
  <div class="sec-head">
    <span class="sec-num">45</span>
    <h3 class="t">На чём остановились</h3>
    <span class="ts">01:05:23</span>
  </div>
  <p>Сейчас главное собрать архитектуру визуально и утвердить с тобой. А ты пока отказываешься от лишних площадок и даёшь команду техспецу настроить ссылки. Саммари я пришлю.</p>
  <ul class="chk">
    <li>Первые разговоры пока убираем: большинство пришли не твоей аудиторией, а бесплатные встречи в терапии не рекомендуются</li>
    <li>Карусель-конвертер переделываем во вторую очередь, сначала порядок</li>
    <li>План на два миллиона: четыре группы по девять, личка двадцать в неделю, супервизия, коучинг и мини-продукт в месяц</li>
    <li>Выходим на цифру, не переплачивая временем и энергией, и держим её три-шесть месяцев</li>
    <li>Охваты и лайки с доходом не связаны, работает новизна и актуальность инфоповода, повторы тем дают меньше оплат</li>
    <li>Выводы о промо делаем только после его окончания: большая часть оплат приходит в последний день</li>
    <li>До 30.11 фристайл и подготовка к замерам</li>
    <li>06.12 новогодник в Питере набирается сам, только вбросы</li>
    <li>30.11-21.12 три недели промо утренней группы, старт 22.12</li>
    <li>21.12-28.12 фристайл, 28.12-10.01 промо стратсессии, стратсессия 10 января</li>
    <li>Со стратсессии добираем четвёртую группу, активный запуск группы в феврале</li>
    <li>Fuck Up Night пока за скобками</li>
    <li>Почту закрываем серией писем со ссылкой на ТГ-канал</li>
    <li>В Макс посты дублирует ассистент с меткой «Макс»</li>
    <li>Канал «Анонсы» закрываем, всё в основном канале</li>
    <li>Следующую группу тестируем через Инсту: часть ведёт в телегу, часть прямо с Инсты</li>
  </ul>
  <div class="box fix">
    <p class="lbl">Что делаешь дальше</p>
    <ul>
      <li>Завтра, 18.11, прислать список идей контента на четверг и пятницу, которые выйдут на следующей неделе</li>
      <li>Попросить техспеца в GetCourse сделать размеченные ссылки на группу: ТГ-канал, сторис, шапка профиля, карусель-конвертер по ключевому слову, метка рекламы</li>
      <li>Сделать серию из одного-трёх писем «вся информация теперь в ТГ-канале» с отдельной ссылкой и закрыть рассылку</li>
      <li>Отдать дублирование постов в Макс ассистенту</li>
      <li>Написать в канал «Анонсы», что он закрывается, и закрыть</li>
      <li>Всех, кто пишет про группу, спрашивать, откуда узнали</li>
      <li>До 30.11 подготовиться к промо утренней группы</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">Что делаю я</p>
    <ul>
      <li>Соберу архитектуру воронки и трекинга в схему, отправлю и утвердим в течение недели</li>
      <li>Пришлю саммари</li>
      <li>Буду трекером по контенту: разберём твой список идей</li>
    </ul>
  </div>
</section>

<div class="foot">
  Личный созвон 17 ноября 2026, 65 минут.
</div>

</div>
</body>
</html>
`;
