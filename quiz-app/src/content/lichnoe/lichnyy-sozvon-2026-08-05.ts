// Конспект личного созвона 2026-08-05. Сгенерирован из
// GSD-BRAND/clients/dariya-basina/lichnoe/2026-08-05/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_2026_08_05 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон 5 августа 2026</title>
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
  <p class="kicker">Личный созвон · 5 августа 2026</p>
  <h1>Как вытащить себя из круга «почистила, полежала, деньги кончились»</h1>
  <p class="sub">Разложили всё, что ты продаёшь, собрали тарифную сетку на обучение и договорились,
  с чего начинаешь: список покупателей, два оффера, две анкеты.</p>
  <div class="meta">
    <span>63 минуты</span>
    <span>3 тарифа</span>
    <span>2 оффера</span>
    <span>Следующий шаг: понедельник, 17:00 МСК</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Развилка: деньги или контент</a></li>
    <li><a href="#s2">Что у тебя есть в продаже</a></li>
    <li><a href="#s3">Сколько чистка стоит в батарейке</a></li>
    <li><a href="#s4">Чистка это go-to оффер, а не двигатель</a></li>
    <li><a href="#s5">Отделить железо от ритуалистики</a></li>
    <li><a href="#s6">Первое дело: список покупателей</a></li>
    <li><a href="#s7">Тарифная сетка 30 / 60 / 100</a></li>
    <li><a href="#s8">Ученики и потребители</a></li>
    <li><a href="#s9">Чем добить оффер до сотки</a></li>
    <li><a href="#s10">Продавать всегда сверху вниз</a></li>
    <li><a href="#s11">Рассрочка: Продамус и договор</a></li>
    <li><a href="#s12">Два оффера, а не один</a></li>
    <li><a href="#s13">Под каким углом продавать диагностику</a></li>
    <li><a href="#s14">Две анкеты</a></li>
    <li><a href="#s15">Промо: посты, сторис, два закрепа</a></li>
    <li><a href="#s16">Написать тем, кто уже покупал</a></li>
    <li><a href="#s17">Порядок действий и понедельник</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Что есть сейчас</h2>
  <p>Инвентаризация: продукты, цены, чего это стоит тебе</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Развилка: сначала деньги или сначала контент</h3>
    <span class="ts">00:01:24</span>
  </div>
  <p>Первый вопрос созвона: с чем идём сначала. Либо разбираемся с контентом для рилсов и каруселей,
  либо идём зарабатывать. Ты выбрала деньги.</p>
  <blockquote>
    <p>«Наверное, давай сначала денег. Когда бабки идут, там и контент как бы идёт».</p>
  </blockquote>
  <p>Из-за этого выбора весь дальнейший разговор идёт снизу вверх: сначала <b>кто конечный покупатель
  и чем мы продаём</b>, потом оффер и тарифная сетка, и только в конце контент. Не наоборот.</p>
  <div class="box">
    <p class="lbl">Логика, которую держим в голове</p>
    <ul>
      <li>Кто наш конечный потребитель</li>
      <li>Чем мы ему продаём</li>
      <li>Оффер, продукт, тарифная сетка, оффер на диагностику</li>
      <li>И только потом контент под всё это</li>
    </ul>
  </div>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Что у тебя есть в продаже</h3>
    <span class="ts">00:02:27</span>
  </div>
  <p>Выписали всё хозяйство целиком. Получилось так:</p>
  <div class="scroll">
  <table>
    <tr><th>Продукт</th><th>Цена</th><th>Время</th></tr>
    <tr><td>Чистка, минимальный набор</td><td class="tc">15 000</td><td>1,5 часа</td></tr>
    <tr><td>Чистка, средний набор</td><td class="tc">30 000</td><td>2:10 до 2:15</td></tr>
    <tr><td>Чистка, полный набор</td><td class="tc">45 000</td><td>около 3 часов</td></tr>
    <tr><td>Свечи офлайн, малый набор</td><td class="tc">3 500</td><td></td></tr>
    <tr><td>Свечи офлайн, большой набор</td><td class="tc">7 000</td><td></td></tr>
    <tr><td>Обучение свечам</td><td class="tc">40 000</td><td></td></tr>
    <tr><td>Курс «Магия»</td><td class="tc">100 000</td><td>2 месяца</td></tr>
    <tr><td>Обучение таро</td><td class="tc">20 000</td><td></td></tr>
    <tr><td>Расклад таро</td><td class="tc">3 000</td><td>20 минут</td></tr>
    <tr><td>Астропрогноз на год</td><td class="tc">7 000</td><td>1,5 часа</td></tr>
  </table>
  </div>
  <p class="note">Разброс уместный: у людей действительно разные запросы. Проблема не в наборе продуктов,
  а в том, что оффер на диагностику должен подходить всем сразу, а под каждый из этих продуктов
  он звучал бы по-разному.</p>
</section>

<section id="s3" class="err">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Сколько чистка стоит в батарейке</h3>
    <span class="ts">00:05:28</span>
    <span class="verdict bad">узкое место</span>
  </div>
  <p>Пересчитали чистки не в часах работы, а в днях восстановления. Картина изменилась:</p>
  <div class="scroll">
  <table>
    <tr><th>Чистка</th><th>Работа</th><th>Восстановление</th><th>Реально уходит</th></tr>
    <tr><td class="tc">15 000</td><td>1,5 часа</td><td>отоспаться часов 8</td><td>почти сутки</td></tr>
    <tr><td class="tc">30 000</td><td>2:10</td><td>сутки</td><td>больше суток</td></tr>
    <tr><td class="tc">45 000</td><td>3 часа</td><td>полтора суток, можно и разболеться</td><td>2 дня и больше</td></tr>
  </table>
  </div>
  <blockquote>
    <p>«Тут на днях я бабушку чистила семидесятишестилетнюю, потом полтора суток из дома не выходила
    и блевала всю ночь. Но у бабок я заработала».</p>
  </blockquote>
  <p>Вывод, который прозвучал на созвоне: <b>ты меняешь свои деньги не на время, а на энергию</b>.
  И вернуть кредит себе (отоспаться, отключить телефон) это не то же самое, что набрать сверху
  и пойти дальше. Без набора сверху получается замкнутый круг.</p>
  <blockquote>
    <p>«Подняла на чистках, полежала, отоспалась, потом опять».</p>
  </blockquote>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Чистка это go-to оффер, а не двигатель</h3>
    <span class="ts">00:11:19</span>
  </div>
  <p>Чистку не убираем, но переводим в другой статус. Это оффер, который можно быстро вкинуть,
  быстро сделать и получить деньги, когда деньги нужны срочно. Масштабироваться в него нельзя:
  на этом пути ты заканчиваешься в больнице, а не в масштабе.</p>
  <div class="box fix">
    <p class="lbl">Как теперь относимся к чистке</p>
    <ul>
      <li>Нужны деньги срочно: подрубаем, вопросов нет</li>
      <li>Человек не берёт обучение, а негатив у него есть: допродаём чистку</li>
      <li>Но приоритет и развитие теперь не здесь</li>
    </ul>
  </div>
  <p class="note">На созвоне это прозвучало прямо: «я не против того, чтобы ты заработала денег,
  просто держи в уме, что контекст изменился, и приоритеты тоже».</p>
</section>

<div class="call">
  <h2>Часть 2. Что собираем</h2>
  <p>Тарифная сетка, два оффера, рассрочка</p>
</div>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Отделить железо от ритуалистики</h3>
    <span class="ts">00:15:31</span>
  </div>
  <p>Идея твоя: не отдавать всю магию сразу, а выделить отдельный тариф чисто на отливки железом.
  Причина простая и подтверждается твоими же продажами.</p>
  <blockquote>
    <p>«Чиститься хотят все, но маги их пугают. Там очень много теории, эгрегоров разных,
    кого-то это вообще пугает, им туда страшно идти».</p>
  </blockquote>
  <p>Плюс аргумент к цене: одна чистка железом стоит дорого, так что курс отбивается в любом случае.</p>
  <div class="box">
    <p class="lbl">Чем это подтверждается</p>
    <ul>
      <li>Заявок на чистку железом было много, но продавала ты не отдельно, а всю магию целиком, и пришло сильно меньше народа</li>
      <li>Курс за 100 000 продавался один раз, учениц было шесть: две пришли через диагностику, четыре со свечей</li>
      <li>По свечам четыре потока за пять месяцев, и всё из одной и той же аудитории</li>
      <li>Магию предлагала, но не шли: «дорого» и «боятся так глубоко заходить»</li>
    </ul>
  </div>
  <p>То есть возражения известны заранее. Их и разбираем тарифами.</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Первое дело: список покупателей</h3>
    <span class="ts">00:18:07</span>
  </div>
  <p>Есть линия денег. По одну сторону подписчики, по другую те, кто хоть раз заплатил.
  Кто её пересёк, тот горячий: ему не нужно объяснять и доказывать по пятнадцать раз.
  Это самая тёплая база, на которой всегда можно заработать.</p>
  <p>Такого списка у тебя никогда не было.</p>
  <div class="box fix">
    <p class="lbl">Что сделать</p>
    <ul>
      <li>Собрать в одно место всех, кто хоть раз платил. Где угодно: гугл-таблица, заметки, папка в телеграме</li>
      <li>Подписать по каждому: что покупал, когда покупал, за сколько</li>
    </ul>
  </div>
  <p class="note">Это первый пункт в твоём списке дел, и к нему мы вернёмся в пункте 16:
  по этому же списку пойдёт первое промо.</p>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Тарифная сетка 30 / 60 / 100</h3>
    <span class="ts">00:20:12</span>
  </div>
  <p>Собрали сетку так, чтобы у человека был вход на любом бюджете и чтобы страх «слишком глубоко»
  не закрывал ему дверь совсем.</p>
  <div class="scroll">
  <table>
    <tr><th>Тариф</th><th>Что входит</th></tr>
    <tr><td class="tc">30 000</td><td>Магия железом. Доступ к материалам</td></tr>
    <tr><td class="tc">60 000</td><td>Всё то же плюс ритуалы плюс обратная связь в чате лично от тебя</td></tr>
    <tr><td class="tc">100 000</td><td>Всё то же плюс продвижение и монетизация: как ты находишь клиентов и как с ними работаешь</td></tr>
  </table>
  </div>
  <p>Второй тариф называем сопровождением. Аргумент к нему сильный и логичный: <b>я помогаю вам
  не испугаться всего этого и провожу так, чтобы вы не наступили на грабли</b>. Это ровно то возражение,
  из-за которого ученицы не шли в магию.</p>
  <p class="note">Отдельно отмечено: обратная связь именно личная, от тебя. Сейчас у всех кураторы,
  и «лично от меня» само по себе стоит денег.</p>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Ученики и потребители: два разных сегмента</h3>
    <span class="ts">00:22:57</span>
  </div>
  <p>В твоей аудитории два разных типа людей, и путать их нельзя:</p>
  <ul class="b">
    <li><b>Ученики</b> хотят научиться делать то, что делаешь ты. Их у тебя больше</li>
    <li><b>Потребители</b> хотят, чтобы ты сделала работу за них</li>
  </ul>
  <p>Сейчас берём в работу учеников: под них оффер, под них тарифная сетка, под них контент.
  Потребители никуда не денутся, к ним вернёмся отдельно, и оффер у них будет другой:
  не обучение, а сопровождение по конкретной ситуации. Сложная сделка, покупка дома,
  тяжёлый развод. Там ты идёшь рядом весь путь, а не проводишь разовый ритуал.</p>
  <div class="box">
    <p class="lbl">Почему сначала одна ветка</p>
    <p>Пока не начнёт крутиться одна ветка целиком, за остальные не беремся.
    Когда с ней станет комфортно работать, подключаем следующую.</p>
  </div>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Чем добить оффер до сотки</h3>
    <span class="ts">00:29:12</span>
  </div>
  <p>В верхний тариф добавляем продвижение и монетизацию. Тезис: <b>окупаемость через три месяца</b>.
  Ценность подскакивает мгновенно, потому что ты продаёшь уже не магию, а результат.</p>
  <p>Это честно: у тебя небольшая аудитория, но денег ты на ней зарабатываешь нормально,
  в отличие от подавляющего большинства тех, кто этим занимается. Значит, есть чему учить.</p>
  <p class="note">Материалы по продвижению и монетизации Саша передаст, чтобы ты добрала недостающее
  и вставила в курс.</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Продавать всегда сверху вниз</h3>
    <span class="ts">00:33:52</span>
  </div>
  <p>Никогда не начинаем с дешёвого. Если сразу предложить нижний тариф, человек уже не сможет
  заплатить больше. Поэтому маршрут такой:</p>
  <ul class="steps">
    <li>Предлагаем 100 000</li>
    <li>«Дорого» → банковская рассрочка</li>
    <li>Всё ещё дорого → внутренняя рассрочка 50 на 50</li>
    <li>Всё ещё дорого → 60 000, и по той же схеме с рассрочкой</li>
    <li>Всё ещё дорого → 30 000, и снова та же схема</li>
  </ul>
  <p>Так конверсия с диагностики станет заметно выше: человеку есть куда спускаться,
  и разговор не заканчивается на первом «нет».</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Рассрочка: Продамус и внутренний договор</h3>
    <span class="ts">00:34:27</span>
  </div>
  <p>Сейчас ты даёшь рассрочку на словах и страдаешь: у людей то одно, то другое, то пятое.
  Продамус когда-то начинала подключать, но до конца не довела.</p>
  <div class="box fix">
    <p class="lbl">Продамус</p>
    <ul>
      <li>Подключение стоит 10 000, по реферальной ссылке от Саши 8 000</li>
      <li>Комиссия 3 до 3,5 процента, работает и для самозанятых</li>
      <li>Сам отправляет данные в «Мой налог»</li>
      <li>Рассрочки от банков на 6, 12 и 24 месяца, банков около пяти</li>
      <li>Можно сделать ссылку на мини-продукт (например, «сделай сам чёрную свечу» за 1 000), чтобы оплата проходила без тебя</li>
    </ul>
  </div>
  <p>Про внутреннюю рассрочку: шаблон договора Саша передаст. Смысл договора не в суде,
  а в том, что человек подтверждает намерение не словами, а на бумаге. При этом,
  учитывая твою деятельность, договор тебе скорее всего и не понадобится: кидали тебя ноль раз.</p>
  <p class="note">Продамус подключаем до того, как начнём куда-то звать людей.
  Рассрочка это то, что вытаскивает крупные чеки.</p>
</section>

<div class="call">
  <h2>Часть 3. Что делаем дальше</h2>
  <p>Офферы, анкеты, промо</p>
</div>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Два оффера, а не один</h3>
    <span class="ts">00:43:16</span>
  </div>
  <p>Офферов нужно два, потому что продаём мы дважды:</p>
  <ul class="b">
    <li><b>Оффер на обучение</b> с тарифной сеткой. Его ты продаёшь на диагностике</li>
    <li><b>Оффер на диагностику</b>. На неё тоже нужно звать и приглашать</li>
  </ul>
  <p>Важная смена рамки: <b>диагностика больше не зарабатывает деньги</b>. Деньги зарабатывают
  три тарифа. Диагностика нужна, чтобы отфильтровать платёжеспособных и продать им обучение.</p>
  <p>Как собирать оффер, показано в воркшопе <b>«Солдаут вашего продукта»</b>.
  Главный принцип оттуда: продаём результат, а не обучение. У оффера должно быть обещание
  и понятный маршрут, как это обещание исполняется.</p>
  <p class="note">Диагностику можно сделать чуть дешевле обычного, чтобы расширить вход.
  Дедлайна по сборке офферов нет, собираешь в своём темпе, потом отправляешь на обратную связь.</p>
</section>

<section id="s13">
  <div class="sec-head">
    <span class="sec-num">13</span>
    <h3 class="t">Под каким углом продавать диагностику</h3>
    <span class="ts">00:46:27</span>
  </div>
  <p>Оффер на диагностику должен цеплять всех, кого мы ведём в обучение. Скомбинировали из двух частей:</p>
  <blockquote>
    <p>Проверка магических способностей плюс разбор твоего денежного потенциала в магии.
    На выходе человек получает маршрутную карту, что ему делать.</p>
  </blockquote>
  <p>Из этого предложение об обучении вытекает логически: «я могу тебе с этим помочь,
  у меня уже всё готово».</p>
  <div class="box">
    <p class="lbl">С чем на самом деле приходят твои ученицы (твои же слова)</p>
    <ul>
      <li>Есть ли сила, есть ли дар</li>
      <li>Не навредит ли это мне и моей семье</li>
      <li>Получится ли у меня</li>
      <li>Смогу ли я на этом потом заработать</li>
      <li>Чувствуют силу, но не знают, как её реализовать</li>
      <li>Сами пробовали крутить свечи, но не знают правил и боятся навредить</li>
    </ul>
  </div>
  <div class="box fix">
    <p class="lbl">Твоя задача по этому пункту</p>
    <p>Накидать 3 до 5 тезисов: через какой ракурс и угол можно заходить в диагностику.
    Первый ракурс уже есть, нужны твои, потому что аудиторию ты знаешь лучше.</p>
  </div>
</section>

<section id="s14">
  <div class="sec-head">
    <span class="sec-num">14</span>
    <h3 class="t">Две анкеты</h3>
    <span class="ts">00:51:57</span>
  </div>
  <p>Ни лендинг, ни красивая страница пока не нужны: продаём всё равно через созвон. Нужны две анкеты,
  обычные гугл-формы:</p>
  <ul class="b">
    <li>Анкета под обучение</li>
    <li>Анкета под диагностику</li>
  </ul>
  <p>Делаем сразу обе, потому что дальше будем ими жонглировать. По методу манимейкера:
  одну неделю зовём всех на диагностику, вторую неделю, пока проводим эти диагностики,
  делаем прямое промо обучения.</p>
</section>

<section id="s15">
  <div class="sec-head">
    <span class="sec-num">15</span>
    <h3 class="t">Промо: посты, сторис, два закрепа</h3>
    <span class="ts">00:54:56</span>
  </div>
  <ul class="b">
    <li>Посты в телеграме</li>
    <li>Сторис</li>
    <li>Две карусели в закреп профиля: одна с призывом заполнить первую анкету, вторая на вторую анкету</li>
  </ul>
  <p>Закрепы висят постоянно, анкеты заполняются постоянно, ты постоянно взаимодействуешь
  с этими людьми и собираешь базу.</p>
  <div class="box">
    <p class="lbl">Про инстаграм</p>
    <p>У тебя есть аккаунт, где ты выкладываешь только прогноз на день, и его смотрят
    около 70 живых человек ежедневно. Это 70 потенциальных клиентов, которым ты сейчас
    не рассказываешь ни про чистки, ни про обучение. Инстаграм подключаем после того,
    как соберём и запустим основную ветку.</p>
  </div>
</section>

<section id="s16">
  <div class="sec-head">
    <span class="sec-num">16</span>
    <h3 class="t">Написать тем, кто уже покупал</h3>
    <span class="ts">00:55:58</span>
  </div>
  <p>Это шаг 4.1 и самый быстрый способ получить деньги: оффер по списку покупателей,
  который ты соберёшь первым пунктом. Смотри воркшоп <b>«Заявки каждый день»</b>, логика простая.</p>
  <ul class="steps">
    <li>Пишешь человеку лично: привет, как дела, как после курса, занимаешься, практикуешься, как прогресс</li>
    <li>Задача первого сообщения только одна: запустить диалог</li>
    <li>Она отвечает, что не получается и в чём затык</li>
    <li>Дальше по ситуации: либо зовёшь на диагностику, либо сразу предлагаешь обучение</li>
  </ul>
  <p class="note">Если у человека всё хорошо, заход другой: «собираю группу девчонок,
  помогу развиваться в магии и с монетизацией, интересно было бы или нет».</p>
</section>

<section id="s17">
  <div class="sec-head">
    <span class="sec-num">17</span>
    <h3 class="t">Порядок действий и понедельник</h3>
    <span class="ts">00:59:10</span>
  </div>
  <blockquote>
    <p>«У меня такой страх, я думаю: сколько работы. Я же никогда так не работала. Как бы хаос тут,
    но это то, чего мне не хватало, и я понимаю, почему я не масштабируюсь».</p>
  </blockquote>
  <p>Жёсткого дедлайна нет, делаешь в своём темпе. К понедельнику сколько успеешь, столько успеешь,
  на созвоне обсудим.</p>
  <ul class="chk">
    <li>Собрать список покупателей: кто, что покупал, когда, за сколько</li>
    <li>Подключить Продамус по реферальной ссылке</li>
    <li>Посмотреть воркшоп «Солдаут вашего продукта»</li>
    <li>Собрать два оффера в тексте и отправить на обратную связь</li>
    <li>Накинуть 3 до 5 тезисов по ракурсам диагностики</li>
    <li>Сделать две анкеты в гугл-формах</li>
    <li>Посмотреть воркшоп «Заявки каждый день» и написать по списку покупателей</li>
    <li>Посты, сторис, две карусели в закреп</li>
  </ul>
  <div class="box fix">
    <p class="lbl">Что за Сашей</p>
    <ul>
      <li>Реферальная ссылка на Продамус</li>
      <li>Шаблон договора внутренней рассрочки</li>
      <li>Материалы по продвижению и монетизации для верхнего тарифа</li>
      <li>Разбор цепочки диалога и созвона в воскресенье</li>
      <li>Обратная связь по двум офферам, когда пришлёшь</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">Групповой созвон</p>
    <p>Понедельник, 17:00 по Москве. В чат группы писать не стесняйся:
    групповая динамика работает, и когда пишешь ты, расписываются и остальные.</p>
  </div>
</section>

<p class="foot">Конспект личного созвона 5 августа 2026. Запись и текст доступны только тебе.</p>

</div>
</body>
</html>
`;
