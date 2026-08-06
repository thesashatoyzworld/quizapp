// Конспект личного созвона 2026-08-05. Сгенерирован из
// GSD-BRAND/clients/konstantin-bobrov/lichnoe/2026-08-05/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_KONSTANTIN_2026_08_05 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон 5 августа 2026 · Константин</title>
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
  <h1>Что для тебя очевидно, для покупателя козырь</h1>
  <p class="sub">Разобрали, кому именно продаём, собрали карту из шести смыслов и договорились,
  с чего начинается контент: чужой рабочий заход и пинг-понг.</p>
  <div class="meta">
    <span>60 минут</span>
    <span>3 гипотезы</span>
    <span>6 смыслов</span>
    <span>Следующий шаг: понедельник, 17:00 МСК</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Два типа инвесторов: где ты теряешь дважды</a></li>
    <li><a href="#s2">Эльфийский язык</a></li>
    <li><a href="#s3">Гипотеза 1: узкий сегмент через его же ценности</a></li>
    <li><a href="#s4">Маркеры: депозиты и налоговая</a></li>
    <li><a href="#s5">ВНЖ за квартиру: козырь, который ты считаешь общеизвестным</a></li>
    <li><a href="#s6">Формула единицы: смысл, пруф, упаковка</a></li>
    <li><a href="#s7">Чеснок и ветчина</a></li>
    <li><a href="#s8">Лестница Ханта: почему безопасность не работает на входе</a></li>
    <li><a href="#s9">Гипотезы 2 и 3: развести недвижимость и Дубай</a></li>
    <li><a href="#s10">Карта смыслов: шесть тезисов</a></li>
    <li><a href="#s11">Пруфы: своё видео с цифрами и кейсы клиентов</a></li>
    <li><a href="#s12">Маркеры к кейсам: кому что отправлять</a></li>
    <li><a href="#s13">Пинг-понг и закон о клевете</a></li>
    <li><a href="#s14">Поток спроса вместо ведра</a></li>
    <li><a href="#s15">Один заход, несколько роликов</a></li>
    <li><a href="#s16">Что делаешь до понедельника</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Кому продаём</h2>
  <p>Сегмент, его язык и маркеры, по которым он себя узнаёт</p>
</div>

<section id="s1" class="err">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Два типа инвесторов: где ты теряешь дважды</h3>
    <span class="ts">00:00:39</span>
    <span class="verdict bad">узкое место</span>
  </div>
  <p>Начали с того, что ты сам хочешь уйти от текущего формата. Причина не в контенте,
  а в том, кто на него приходит. Ты разложил своих покупателей на две группы:</p>
  <div class="scroll">
  <table>
    <tr><th>Кто</th><th>Как решает</th><th>Твоя комиссия</th><th>Сколько сил</th></tr>
    <tr><td>Покупает для себя и детей, вдолгую</td><td>по доверию к тебе и понятному застройщику, цифры вторичны</td><td class="tc">4 %</td><td>меньше</td></tr>
    <tr><td>Профессиональный инвестор</td><td>торгуется, требует ниже рынка, ищет лучшую цену</td><td class="tc">2 %</td><td>вдвое больше</td></tr>
  </table>
  </div>
  <p>Потеря получается тройная: комиссия вдвое меньше, времени и сил вдвое больше,
  плюс маркетинговый бюджет разливается по разным направлениям сразу.</p>
  <p>Дальше весь созвон идёт только про первую группу. Вторую в контенте не ловим.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Эльфийский язык</h3>
    <span class="ts">00:03:00</span>
  </div>
  <p>Человек приходит и говорит простыми словами: хочу вложить деньги так, чтобы через пять лет
  они не потеряли в цене, чтобы была точка присутствия, чтобы можно было приехать.
  А ты это внутри себя переводишь на профессиональный язык: параметры, доходность, аналитика.
  И отвечаешь уже на нём.</p>
  <p>Ты сам это узнал: <span class="q">типаж такой, человек оттуда, начинаю сам себя загибать
  и нахожу проблему в деле</span>.</p>
  <div class="box">
    <p class="lbl">Где какой язык уместен</p>
    <ul>
      <li>Контент для привлечения внимания: только их язык и их формулировки</li>
      <li>Контент для влюбления в тебя: ценности, философия, подход</li>
      <li>Авторитет и аналитика: созвон, кейсы, статьи, YouTube. Не вход в воронку</li>
    </ul>
  </div>
  <p class="note">Аналогия с созвона: если выйти к людям с фразой «у вас нет продаж, потому что
  на нижнем уровне воронки не поднимается авторитет», человек услышит только «хочу подписчиков».
  Всё верно по сути и мимо по адресу.</p>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Гипотеза 1: узкий сегмент через его же ценности</h3>
    <span class="ts">00:06:20</span>
  </div>
  <p>Первая из трёх гипотез: делать максимально узкий контент про недвижимость в Дубае,
  но через призму ценностей той аудитории, которая нам нужна. Не про объекты, а про то,
  зачем этим людям объекты.</p>
  <div class="box">
    <p class="lbl">Почему узко работает: кейс Кати</p>
    <ul>
      <li>Ниша кондитеров, услуга локальная, таргет в России отключён. Скепсиса было много</li>
      <li>Она стала долбить в один узкий сегмент, и слово «кондитер» само сегментирует: кондитер на нём останавливается</li>
      <li>Пришла со 150 тысяч в месяц, вышла на 800 тысяч и миллион</li>
    </ul>
  </div>
  <p>Узость не даёт больших охватов и не выносит в рекомендации. Она приводит именно тех,
  кто нужен. Но для этого нужны маркеры, через которые человек себя узнаёт.
  У кондитеров таким маркером была профессия, у тебя её нет, поэтому маркеры ищем другие.</p>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Маркеры: депозиты и налоговая</h3>
    <span class="ts">00:09:20</span>
  </div>
  <p>Портрет ты дал сам: бизнесмены из России, у которых есть деньги, и главная задача у них
  не заработать, а не потерять. Отсюда первые два маркера.</p>
  <div class="facts">
    <div class="fact"><div class="n">1</div><div class="l">Деньги лежат на депозите, и человек не знает, что с ними делать</div></div>
    <div class="fact"><div class="n">2</div><div class="l">Давит налоговая: камералки, вопросы к деньгам</div></div>
  </div>
  <p>Первый маркер сразу отсекает тех, у кого денег нет: разговор идёт про то, что делать
  с суммой, которая уже есть. Второй ты описал как повторяющийся нюанс почти у всех
  клиентов этого типа: они ищут, где сохранить деньги, чтобы через три или четыре года
  ими воспользоваться.</p>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">ВНЖ за квартиру: козырь, который ты считаешь общеизвестным</h3>
    <span class="ts">00:12:10</span>
  </div>
  <p>На вопрос про бонусы при покупке ты ответил буднично: на базе квартиры человек получает
  Emirates ID, то есть ВНЖ на два или на десять лет в зависимости от стоимости.
  И сразу оценил это как «ничего особенного».</p>
  <blockquote>
    <p>Как думаешь, много людей про это знает?</p>
    <p>Мне кажется, что все.</p>
  </blockquote>
  <p>Не все. Это и есть искажение эксперта: то, что тебе кажется очевидным, для человека снаружи
  звучит как открытие. Свои очевидности не оцениваем, а выписываем.</p>
  <div class="box fix">
    <p class="lbl">Что из этого собирается</p>
    <ul>
      <li>Купил квартиру, получил ВНЖ на 2 или 10 лет</li>
      <li>По своему ВНЖ легализуешь семью</li>
      <li>Без квартиры ВНЖ даёт только работа, бизнес или счёт на сопоставимую сумму</li>
      <li>Рядом легла теория четырёх флагов: паспорт одной страны и несколько ВНЖ в других,
      потому что заранее не известно, где завтра будет спокойно</li>
    </ul>
  </div>
</section>

<div class="call">
  <h2>Часть 2. Что продаём в контенте</h2>
  <p>Формула единицы и карта смыслов</p>
</div>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Формула единицы: смысл, пруф, упаковка</h3>
    <span class="ts">00:14:40</span>
  </div>
  <p>Любая единица контента складывается из трёх вещей, и заголовок тут вторичен.</p>
  <ul class="b">
    <li><b>Смысл</b> это идея, которую мы продаём. Отсылка к «Началу»: самый живучий паразит
    внутри человека это идея, и если она завладела человеком, вывести её невозможно</li>
    <li><b>Пруф</b> это почему тебе стоит верить</li>
    <li><b>Упаковка</b> это почему человек вообще на это посмотрит</li>
  </ul>
  <p>Карта смыслов это 3 до 5 ключевых идей, которые транслируются безостановочно.
  Не тысяча идей разными способами, а одна идея тысячей способов.</p>
  <p class="note">Пример с созвона: Aviasales годами продаёт одну идею про самые дешёвые билеты
  и меняет только упаковки.</p>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Чеснок и ветчина</h3>
    <span class="ts">00:17:40</span>
  </div>
  <p>Мальчику подарили собаку, на неё налипли клещи. Бабушка говорит: дай ей чеснок,
  фермент подействует и клещи отвалятся. Собака чеснок не ест. Бабушка объясняет:
  заверни чеснок в ветчину. Собака съедает всё.</p>
  <p>Чеснок это то, что человеку надо. Ветчина это то, что он хочет. Толстому человеку
  фитнес-тренер говорит «займись здоровьем», а тот хочет ветчину. Задача завернуть первое во второе.</p>
  <p>Твой случай ровно про это: ты закидывал людям чеснок в чистом виде.</p>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Лестница Ханта: почему безопасность не работает на входе</h3>
    <span class="ts">00:22:10</span>
  </div>
  <p>Ты назвал маркером то, что люди выбирают понятных застройщиков. Это уже уровень
  «в поиске решения»: человек знает, чего хочет, и сравнивает варианты.
  В контент на привлечение мы выходим на уровень выше, где человек осознаёт проблему,
  но решения ещё не знает.</p>
  <div class="box">
    <p class="lbl">Куда что идёт</p>
    <ul>
      <li>Верхний уровень, в контент: деньги лежат мёртвым грузом, налоговая, нестабильность, дети</li>
      <li>Нижний уровень, в кейсы, статьи, YouTube и созвон: застройщики, метраж, доходность, сравнение объектов</li>
    </ul>
  </div>
  <p>Отдельно ты дал аргумент, который поднимает безопасность обратно наверх:
  ОАЭ на втором месте по безопасности после Швейцарии. В такой формулировке это уже смысл,
  а не характеристика объекта.</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Гипотезы 2 и 3: развести недвижимость и Дубай</h3>
    <span class="ts">00:27:20</span>
  </div>
  <p>Вторая и третья гипотезы про то, чтобы перестать склеивать две темы в одну.
  Недвижимость сама по себе интересна более широкому кругу людей, чем недвижимость строго в Дубае.</p>
  <ul class="b">
    <li><b>Гипотеза 2.</b> Контент отдельно про недвижимость как способ вложить деньги: как смотреть,
    как выбирать, как покупать</li>
    <li><b>Гипотеза 3.</b> Контент отдельно про Дубай и Эмираты: жизнь, безопасность, образование,
    новости и изменения в законодательстве</li>
  </ul>
  <p>Решение по порядку: не выбираем одну, а идём подряд. Сначала первая гипотеза,
  потом чистая недвижимость, потом чистые Эмираты.</p>
  <p class="note">Новости и законы это не отдельная тема, а формат упаковки. Новость берём только тогда,
  когда она ложится на один из наших смыслов.</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Карта смыслов: шесть тезисов</h3>
    <span class="ts">00:30:00</span>
  </div>
  <p>То, что мы продаём безостановочно и разными способами:</p>
  <ol class="steps">
    <li><b>Квартира в Дубае это выход из нестабильности.</b> Ликвидность, рост цен,
    ВНЖ на 2 или 10 лет и легализация семьи в одном пакете</li>
    <li><b>Это способ убрать деньги из-под давления.</b> Вложение, которое можно распаковать
    через три или четыре года и получать с него доходность</li>
    <li><b>В Эмиратах безопасно.</b> Второе место после Швейцарии, дверь дома можно оставить открытой</li>
    <li><b>В Эмиратах выгодно жить.</b> Ракурс против рынка: все считают, что там дорого,
    а выгоднее, чем в Таиланде и Вьетнаме</li>
    <li><b>В Эмиратах сильное образование.</b> Международные университеты, после школ реально
    поступают в Кембридж и подобные</li>
    <li><b>Эмираты хорошая страна для эмиграции.</b> 80 процентов населения экспаты, поэтому
    ощущения чужого нет: когда не дома почти все, страна становится домом для всех</li>
  </ol>
  <p>Седьмой смысл лежит отдельно, под вторую гипотезу: недвижимость это выгодное вложение,
  и вот как её смотреть, выбирать и покупать.</p>
</section>

<div class="call">
  <h2>Часть 3. Чем подтверждаем</h2>
  <p>Пруфы и маркеры к ним</p>
</div>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Пруфы: своё видео с цифрами и кейсы клиентов</h3>
    <span class="ts">00:38:40</span>
  </div>
  <p>Артефакты у тебя уже есть, и рынок помогает: он прозрачный, по контрактам видно,
  за сколько объект куплен, за сколько перепродан и за сколько сдаётся.</p>
  <div class="facts">
    <div class="fact"><div class="n">1</div><div class="l">Видео про свою квартиру: съёмка, фактическая доходность по контрактам</div></div>
    <div class="fact"><div class="n">2</div><div class="l">Два видео с разбором конкретных сделок клиентов по цифрам</div></div>
    <div class="fact"><div class="n">5 до 8</div><div class="l">Сделок, где объект уже сдан, остальные ещё строятся</div></div>
  </div>
  <p>Твоё уточнение: у Саши сегментация кейсов по нишам клиентов, у тебя она будет по стратегиям,
  например перепродажа строящегося против готового объекта. Ценность в строящемся часто в том,
  что ты достал то, чего не смог достать другой.</p>
</section>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Маркеры к кейсам: кому что отправлять</h3>
    <span class="ts">00:41:20</span>
  </div>
  <p>Кейс работает не сам по себе, а под ситуацию человека. Поэтому к каждому кейсу
  прописывается, кому и когда он отправляется.</p>
  <div class="box">
    <p class="lbl">Как это устроено у Саши</p>
    <ul>
      <li>Пришёл фитнес-тренер: отправляется кейс Васи, потому что он бьёт точно в этот сегмент</li>
      <li>Возражение «нужны миллионные просмотры»: тот же кейс Васи, но другой стороной.
      Начинали при 390 подписчиках, сейчас 1 500, доход около 500 тысяч в месяц второй год,
      купил две квартиры в Питере</li>
      <li>Непонятно, что за человек: сначала статья про методологию. Либо он покупает подход,
      либо работы не будет, потому что ожидания разъедутся с реальностью</li>
    </ul>
  </div>
  <p>Одна и та же единица контента заходит в разные сегменты, если менять,
  какую проблему она закрывает.</p>
  <div class="box fix">
    <p class="lbl">Что делаешь</p>
    <ul>
      <li>Берёшь то, что уже снято, и маркируешь: кому подойдёт, в какой ситуации отправляется,
      зайдёт ли тому, кто тебя ещё не знает</li>
      <li>Остальные сделки фиксируешь тезисно и описываешь постепенно</li>
    </ul>
  </div>
  <p class="note">Работа делается один раз, а дальше это бесконечный патрон: пруф идёт в шортсы,
  в карусели и в личную переписку, когда к тебе обращаются. В сегменте с высоким чеком
  доверие решает, поэтому пруфы обязательны.</p>
</section>

<div class="call">
  <h2>Часть 4. С чего начинаем контент</h2>
  <p>Форматы, поток спроса и план на неделю</p>
</div>

<section id="s13">
  <div class="sec-head">
    <span class="sec-num">13</span>
    <h3 class="t">Пинг-понг и закон о клевете</h3>
    <span class="ts">00:45:40</span>
  </div>
  <p>Тебе нравится формат, где человек разносит чужое видео. Ограничение реальное:
  за клевету на физическое лицо или компанию в ОАЭ можно получить штраф, travel ban
  или выдворение из страны.</p>
  <div class="box fix">
    <p class="lbl">Обход, который остаётся</p>
    <ul>
      <li>Разбирать тех, кто находится вне Эмиратов: например, продают жильё в Таиланде
      или несут дичь про рынок Дубая</li>
      <li>За такой разбор в ОАЭ тебе ничего не будет</li>
    </ul>
  </div>
  <p>По монтажу: пинг-понг должен быть рубленый. Она фраза, ты реакция, она фраза, ты реакция.
  Не тридцать секунд её монолога и тридцать секунд твоего.</p>
  <p class="note">Формат выбран ещё и потому, что он тебе самому нравится. Когда человеку
  прикольно это делать, работает заметно лучше, чем когда через силу.</p>
</section>

<section id="s14">
  <div class="sec-head">
    <span class="sec-num">14</span>
    <h3 class="t">Поток спроса вместо ведра</h3>
    <span class="ts">00:47:30</span>
  </div>
  <p>Темы не выдумываются. Сначала ищется поток спроса, то есть то, что уже собрало просмотры.</p>
  <ol class="steps">
    <li>Заходишь на YouTube</li>
    <li>Пишешь слово «недвижимость»</li>
    <li>В фильтрах выбираешь Shorts</li>
    <li>Смотришь верх выдачи. На созвоне первые же ролики были на 8 и на 6 миллионов просмотров</li>
  </ol>
  <p>Если ролик собрал такие цифры, это струя, а не догадка. Когда темы берутся наугад,
  ты ходишь с ведром и надеешься, что накапает.</p>
  <p class="note">В Instagram поисковой системы нет, поэтому ищем на YouTube.
  Саша ищет так же и отдельно показывал, что то же самое умеет делать нейронка
  через браузер, но это не обязательное условие.</p>
</section>

<section id="s15">
  <div class="sec-head">
    <span class="sec-num">15</span>
    <h3 class="t">Один заход, несколько роликов</h3>
    <span class="ts">00:51:20</span>
  </div>
  <p>Найденный ролик используется двумя способами: снимаешь свой с тем же заходом
  и снимаешь разбор, где этот ролик разваливаешь. Один референс превращается в два формата.</p>
  <p>Копируется только заход. Дальше идут твои тезисы, твои смыслы и твой пруф.</p>
  <div class="box">
    <p class="lbl">Пример, что заход переиспользуется</p>
    <p>Ролик про то, что сейчас худшее время покупать машину из Китая, собрал 3 миллиона просмотров.
    Его пересняли три раза, и каждый раз он давал около 50 тысяч просмотров.</p>
  </div>
  <p>Как это выглядит на твоём материале: начало про то, что квартиры покупать плохо,
  особенно в России, дальше причины, дальше сравнение того, как развивался рынок недвижимости
  в России и в Эмиратах, в конце пруф с клиентом и цифрами по сделке.</p>
</section>

<section id="s16">
  <div class="sec-head">
    <span class="sec-num">16</span>
    <h3 class="t">Что делаешь до понедельника</h3>
    <span class="ts">00:53:40</span>
  </div>
  <ul class="chk">
    <li>Промаркировать кейсы, которые уже сняты: кому подойдёт и в какой ситуации отправляется</li>
    <li>Остальные сделки зафиксировать тезисно, описывать постепенно</li>
    <li>Найти 3 до 5 роликов по недвижимости и Эмиратам через YouTube Shorts</li>
    <li>Написать 3 до 5 сценариев с тем же заходом, но со своими смыслами</li>
    <li>Написать 3 до 5 сценариев пинг-понга, где разваливаешь чужой ролик</li>
  </ul>
  <p>Пишешь как умеешь, без попыток сделать идеально. Структура правится в процессе.
  Обычно Саша обратную связь по сценариям не даёт, потому что люди расстраиваются
  и перестают снимать, но ты сказал, что относишься к ней нормально, поэтому корректировать будет.</p>
  <div class="box fix">
    <p class="lbl">Что за Сашей</p>
    <ul>
      <li>Скриншоты схемы с созвона и саммари</li>
      <li>Запись созвона</li>
      <li>Ссылка на групповой чат</li>
      <li>Корректировка сценариев, когда пришлёшь</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">Групповой созвон</p>
    <p>Понедельник, 17:00 по Москве. В чат писать не стесняйся: когда пишет один,
    расписываются и остальные.</p>
  </div>
  <p class="note">Оригинальные форматы, которых на рынке ещё нет, оставили на потом.
  Сначала обкатываем эти два на выбранных смыслах и смотрим на результат.</p>
</section>

<p class="foot">Конспект личного созвона 5 августа 2026. Запись и текст доступны только тебе.</p>

</div>
</body>
</html>
`;
