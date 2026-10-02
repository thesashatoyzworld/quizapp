// Конспект личного созвона 2026-10-02. Сгенерирован из
// GSD-BRAND/clients/leonid/lichnoe/2026-10-02/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_LEONID_2026_10_02 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон · Леонид · 2 октября 2026</title>
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
  <p class="kicker">Личный созвон · 2 октября 2026</p>
  <h1>Первая версия живее двухсотой</h1>
  <p class="sub">В понедельник придут первые ролики, каждый в четырёх версиях, и ты сам грузишь
  их в пробные рилсы. Для своих подписчиков снимаешь фристайлом, без вылизывания, и первый
  такой ролик выходит сегодня. В следующую пятницу второй контент-созвон по темам и первым
  фразам, которые уже где-то сработали. Плюс ставим тебе Claude Code, и обсудили твою идею
  платформы по подписке.</p>
  <div class="meta">
    <span>46 минут</span>
    <span>Ролики: понедельник 5 октября</span>
    <span>Следующий созвон: пятница 9 октября</span>
    <span>Сегодня: рилс на своих</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Один ролик, четыре версии</a></li>
    <li><a href="#s2">Пробные рилсы</a></li>
    <li><a href="#s3">Две ветки: фристайл и экспертный</a></li>
    <li><a href="#s4">Ролик сегодня</a></li>
    <li><a href="#s5">Шапка профиля</a></li>
    <li><a href="#s6">Первые три секунды</a></li>
    <li><a href="#s7">Как готовимся к пятнице</a></li>
    <li><a href="#s8">Claude Code вместо приложения</a></li>
    <li><a href="#s9">Платформа по твоей теме</a></li>
    <li><a href="#s10">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Ролики, которые придут в понедельник</h2>
  <p>Почему версий четыре и куда их грузить</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Один ролик, четыре версии</h3>
    <span class="ts">00:00:02</span>
  </div>
  <p>Задачи монтажу я передал, ролики будут к понедельнику. Каждый в нескольких вариантах:
  короткая и длинная версия по хронометражу, и в каждой два старта. Первый начинается
  с твоей говорящей головы, дальше футажи. Второй чисто из футажей, которые ты прислал.</p>
  <p>Зачем так. Инста очень казиношная: из-за первых двух слов ролик может полететь или
  не полететь. Мы сейчас тестируем один и тот же текст с разным первым кадром:</p>
  <div class="facts">
    <div class="fact"><div class="n">300</div><div class="l">просмотров на новую аудиторию, когда первый кадр моё лицо</div></div>
    <div class="fact"><div class="n">3 000</div><div class="l">просмотров у того же ролика, когда он начинается с футажа</div></div>
  </div>
  <p>Чуть ли не в десять раз больше только из-за первого кадра. Поэтому всегда сразу делаем
  несколько версий одного и того же.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Пробные рилсы</h3>
    <span class="ts">00:01:30</span>
  </div>
  <p>Инста где-то год назад выкатила функцию пробных рилс. Обычный рилс показывается и твоей
  аудитории, и новой. В пробники можно грузить сколько угодно роликов, и их видит только
  новая аудитория. Твои подписчики их не увидят, пока ты сам не откроешь ролик.</p>
  <p>Креаторы на Западе и уже в СНГ жёстко этим пользуются и грузят в пробники по девять,
  по десять рилс в день. Ролики от монтажа идут туда: смотрим, что работает лучше,
  и постепенно открываем на твою аудиторию.</p>
  <div class="box fix">
    <p class="lbl">Как будет</p>
    <ul>
      <li>В понедельник присылаю ролики вместе с инструкцией, как грузить пробные рилсы</li>
      <li>Описания к роликам собираю сам через нейронку и присылаю готовыми</li>
      <li>Четыре версии ты загружаешь в течение дня сам</li>
    </ul>
  </div>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Две ветки: фристайл и экспертный</h3>
    <span class="ts">00:02:13</span>
  </div>
  <p>Ты сказал, что на космические просмотры не рассчитываешь. Первая задача для тебя
  просто начать постить и не чувствовать дискомфорт. Мешает идеалист:</p>
  <blockquote><p>Я сижу в офисе до девяти вечера и пытаюсь там одну и ту же тему рассказать.</p></blockquote>
  <p>Я десять лет занимался музыкой, сам записывал голос на студии и записывал других.
  В девяноста процентах случаев первый записанный вариант лучше следующих двухсот попыток,
  потому что он живой и настоящий. Дальше идёт отфильтровывание, и чем больше фильтруешь,
  тем больше оно умирает.</p>
  <p>Ты возразил, что с экспертной темой иначе: с наскока можно наговорить лишнего, а когда
  садишься и пересобираешь ответ, получается коротко и ёмко. Договорились развести
  это на две ветки.</p>
  <div class="box">
    <p class="lbl">Две ветки</p>
    <ul>
      <li>Самореализация: делишься, общаешься со своими, держишь обязательство. Фристайлом, обычными рилсами на свою аудиторию</li>
      <li>Экспертный контент: его можно рихтовать и отфильтровывать. Это ролики от монтажа, они идут через пробники</li>
    </ul>
  </div>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Ролик сегодня</h3>
    <span class="ts">00:04:35</span>
  </div>
  <p>Первый рилс, где ты идёшь по лесу и говоришь, что берёшь обязательство вести блог,
  народ поддержал. После него тишина, и ты сам это чувствуешь:</p>
  <blockquote><p>Я хочу что-то да записать, а то типа вот буду говорить, буду вести блог
  и блядь, заебись, пропал такой чувак.</p></blockquote>
  <p>Вот про это и снимаешь: выложил ролик, взял обязательство, теперь не знаю, про что
  снимать, напишите в комментариях. Это как свидание: не знаешь, что будешь делать,
  и приходится импровизировать. Мозг начинает играть.</p>
  <p>Чтобы в комментарии не налетели пацаны из подъезда, сам направь внимание. Например:
  я сейчас занимаюсь бизнесом, с маркетплейсами происходит какое-то сумасшествие,
  кто-то за этим следит, рассказывать вам про это или нет? Так ты чуть отфильтруешься
  и сегментируешься.</p>
  <div class="box fix">
    <p class="lbl">Сегодня</p>
    <ul>
      <li>Снять и выложить рилс на свою аудиторию, ссылку мне</li>
    </ul>
  </div>
</section>

<div class="call">
  <h2>Часть 2. Профиль</h2>
  <p>Как не просидеть неделю над одной строчкой</p>
</div>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Шапка профиля</h3>
    <span class="ts">00:08:38</span>
  </div>
  <p>Сейчас у тебя написано «архитектор цепочек поставок». Вариант: имя, фамилия и через
  слэш первый ключевой запрос твоей аудитории, как его ищут в Гугле. Поисковики индексируют
  именно эту строчку. В моей нише меня через поиск искать никто не будет, а в твоей большая
  вероятность, что ищут через Google. Например: «Строй бизнес вбелую».</p>
  <p>Ты не хочешь ставить всё на одну боль ради заявок, тебе важно, чтобы видели целый круг
  возможностей. Тогда подходи не с точки зрения правильного решения, а как к своему дому:
  чтобы мебель была такая, с которой тебе по кайфу.</p>
  <p>И не сиди неделю над формулировкой. Бери первую херовую и двигайся с ней. С одним
  тренером я так шёл: «обрести уверенность», дальше «вернём энергию за девяносто дней»,
  и через пять минут вышло «хозяин своей жизни». Третья формулировка появилась только
  потому, что были первые две.</p>
  <div class="box fix">
    <p class="lbl">Что делаешь</p>
    <ul>
      <li>Даёшь себе час: что за час написал, с тем и идёшь. Поменять можно потом</li>
    </ul>
  </div>
</section>

<div class="call">
  <h2>Часть 3. Следующий контент-созвон</h2>
  <p>Темы и первые фразы, которые уже сработали</p>
</div>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Первые три секунды</h3>
    <span class="ts">00:15:32</span>
  </div>
  <p>Логика простая: не остановили внимание за первые три секунды, человек скипнул. Если
  скипнула большая часть тех, кому показали ролик, дальше он не пойдёт: не досмотрят,
  не нажмут на кнопки.</p>
  <p>Ты спросил, можно ли тогда просто сказать «хуй», и все будут смотреть. Смотреть будут,
  но не те. У меня была ровно такая история: карусель «мозг геймера работает иначе»
  залетела, я сделал на ту же тему рилс, и он улетел к подросткам, которые сидят
  в Майнкрафте.</p>
  <div class="facts">
    <div class="fact"><div class="n">50 000</div><div class="l">просмотров у рилса про геймеров</div></div>
    <div class="fact"><div class="n">4 000</div><div class="l">лайков, и почти все не та аудитория</div></div>
  </div>
  <p>Поэтому я разбиваю работу на этапы. Первый промежуточный результат: попадаем в аудиторию,
  и просмотры чуть выше среднего. Условно, из семи роликов шесть набрали по двести-триста
  на новую аудиторию, а один полторы-две тысячи. Значит, эта тема им интереснее, и делаем
  в неё дабл даун: та же тема с разных ракурсов.</p>
  <p>Заголовки берём рабочие. Со знакомым экспортёром машин из Китая брали первые фразы
  роликов, которые на YouTube набирали по миллиону-два, он говорил их один в один,
  а дальше свои тезисы. До этого фристайлом было двести-триста просмотров, после
  пошли тридцать семь и пятьдесят тысяч.</p>
  <blockquote><p>То, что один раз в них сработало, оно сработает с вероятностью девяносто,
  восемьдесят процентов второй раз.</p></blockquote>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Как готовимся к пятнице</h3>
    <span class="ts">00:14:31</span>
  </div>
  <p>Контент на следующую неделю уже есть, поэтому сегодня ничего не снимали. В следующую
  пятницу садимся вторым раундом, как в прошлый раз. Сам ты тоже продолжаешь снимать,
  но живой разговор тебе нужен как практика.</p>
  <div class="box">
    <p class="lbl">Как сделаем</p>
    <ul>
      <li>Я готовлю темы и вопросы и прописываю конкретные фразы, с которых желательно начать</li>
      <li>Ищу заголовки вокруг твоих тем, которые уже сработали у других</li>
      <li>Твоя идея: три-четыре темы ты получаешь заранее, три-четыре экспромтом. Посмотрим, какая разница</li>
    </ul>
  </div>
</section>

<div class="call">
  <h2>Часть 4. Нейронки</h2>
  <p>Что можно собрать под себя</p>
</div>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Claude Code вместо приложения</h3>
    <span class="ts">00:23:32</span>
  </div>
  <p>ElevenLabs ты не подключил: нашёл несколько версий и не понял, какая нужна. Подключается
  через MCP-коннектор, ссылку на нужный я скину.</p>
  <p>Главная разница с приложением. Я работаю в Claude Code, он стоит в рабочей среде VS Code
  и видит весь компьютер: могу сказать «найди все документы по воркшопам и собери
  в один HTML», и он пошёл. В режиме Bypass он не спрашивает разрешение на каждое действие,
  даёшь команду и уходишь. Он умеет открывать браузер и сам кликать, так и ищутся заходы,
  которые я тебе нахожу: я скормил ему наш созвон, он собрал ядра твоих тем, сделал
  запросы на YouTube и пошёл искать.</p>
  <p>Как устроены созвоны. Запись появилась в Zoom, Claude её скачивает, на сервере делается
  расшифровка через ElevenLabs, другой агент собирает саммари, видео уходит в Kinescope,
  и всё прилетает тебе в кабинет. Код я не пишу, я просто сказал, что хочу,
  чтобы это происходило без меня.</p>
  <p>Подход такой: не придумывать, что бы собрать, а смотреть, где тратишь время. Из этой
  проблемы и рождается решение, плюс стимул довести до рабочего состояния. У меня так
  появились кабинет с выручкой, куда падают оплаты из Продамуса с прогресс-баром к KPI,
  и раздел с диалогами, где нейронка предлагает ответ на возражение. Сервер стоит
  тысячу рублей, на нём работает то, что должно идти при выключенном компьютере.</p>
  <div class="box fix">
    <p class="lbl">Что делаешь</p>
    <ul>
      <li>Ставишь VS Code и Claude Code по моей инструкции, у тебя Windows</li>
      <li>Подключаешь ElevenLabs по ссылке</li>
    </ul>
  </div>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Платформа по твоей теме</h3>
    <span class="ts">00:40:27</span>
  </div>
  <p>Твоя идея: платформа для своей аудитории, где часть консультаций и рутины берёт
  на себя нейронка, по подписке.</p>
  <blockquote><p>База знаний, где будет разбита, скажем, цепочка поставок по этапам. И на каждом
  этапе будет сделан такой инструмент, который решает конкретный этап.</p></blockquote>
  <div class="facts">
    <div class="fact"><div class="n">1 900 ₽</div><div class="l">в месяц за доступ ко всему, твой ориентир</div></div>
  </div>
  <p>Классная тема. Внутри ещё актуальное: дайджест новостей, новые законы, как сохранить
  деньги. Порядок тот же, что у меня: сначала собираешь для себя и решаешь свою проблему,
  потом рассказываешь и продаёшь своей базе. Отдельно делать приложение и пытаться его
  запушить это выстрел в ногу. Дальше это можно отдавать в лизинг, например логистам
  в Казахстане, а эксклюзивные права продавать отдельно.</p>
  <p>План ты сформулировал сам: личный бренд, целевые подписчики, продукт, который ты
  испытал на себе, и монетизация на свою базу.</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">00:46:02</span>
  </div>
  <ul class="chk">
    <li>Сегодня снять и выложить рилс на свою аудиторию: взял обязательство, не знаю, про что снимать, пишите. Направить внимание на бизнес и маркетплейсы. Ссылку мне</li>
    <li>Шапка профиля: имя, фамилия и через слэш запрос, как тебя ищут. Час на формулировку, дальше двигаемся с ней</li>
    <li>В понедельник 5 октября загрузить четыре версии ролика в пробные рилсы по инструкции</li>
    <li>Поставить VS Code и Claude Code, подключить ElevenLabs</li>
    <li>Пятница 9 октября: второй контент-созвон</li>
  </ul>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>В понедельник ролики, описания к ним и инструкция по пробным рилсам</li>
      <li>К понедельнику-вторнику документ с темами и фразами к пятнице, половину тебе заранее</li>
      <li>Инструкция, как поставить VS Code и Claude Code на Windows</li>
      <li>Ссылка на ElevenLabs</li>
    </ul>
  </div>
</section>

<div class="foot">
  Личный созвон 2 октября 2026, 46 минут.
</div>

</div>
</body>
</html>
`;
