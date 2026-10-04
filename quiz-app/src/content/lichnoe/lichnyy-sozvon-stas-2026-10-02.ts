// Конспект личного созвона 2026-10-02. Сгенерирован из
// GSD-BRAND/clients/stas/lichnoe/2026-10-02/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_STAS_2026_10_02 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон · Стас · 2 октября 2026</title>
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
  <h1>Куда целимся: бабки и передача бизнеса детям</h1>
  <p class="sub">Контент на две недели снят, теперь вопрос, о чём он и что мы в итоге продаём.
  Ты пришёл с фразой «зарабатывать ртом», и за час из неё выросли два направления: помогать
  предпринимателю выйти на следующий уровень денег и сопровождать передачу семейного бизнеса
  следующему поколению. Монтаж следующей недели забирают мои ребята, в понедельник
  инструкция по загрузке, следующий контент-созвон в пятницу 9 октября.</p>
  <div class="meta">
    <span>61 минута</span>
    <span>Инструкция: понедельник 5 октября</span>
    <span>Ролики на 12-18 октября: до 12 октября</span>
    <span>Следующий созвон: пятница 9 октября</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Монтажёр и поток</a></li>
    <li><a href="#s2">Загрузка роликов</a></li>
    <li><a href="#s3">Зачем прицеливаться</a></li>
    <li><a href="#s4">Что у тебя можно купить</a></li>
    <li><a href="#s5">Мотивация как инструмент, а не продукт</a></li>
    <li><a href="#s6">Направление первое: бабки</a></li>
    <li><a href="#s7">Как бы ты работал с человеком</a></li>
    <li><a href="#s8">Ответственность и договор</a></li>
    <li><a href="#s9">Направление второе: передача бизнеса</a></li>
    <li><a href="#s10">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Ролики</h2>
  <p>Кто монтирует следующую неделю и как грузить</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Монтажёр и поток</h3>
    <span class="ts">00:00:03</span>
  </div>
  <p>Твой монтажёр нестабильный: к понедельнику доделает то, что взял, а новое готов брать
  только с шестнадцатого. Это классика с фрилансерами, у меня был монтажёр, которого я три года
  учил, и он всё равно пропадал с предоплатами клиентов. Нам контент нужен на потоке, режим
  «хочу работаю, хочу нет» не подходит.</p>
  <p>Получается так: с понедельника грузим то, что сделал твой монтажёр, эта неделя закрыта.
  Неделя с 12 по 18 октября проседает, поэтому её ТЗ я отдаю своим ребятам.</p>
  <div class="box fix">
    <p class="lbl">Как будет</p>
    <ul>
      <li>Твой монтажёр к понедельнику доделывает свои ролики</li>
      <li>ТЗ на следующую неделю уходит моей команде, каждый ролик сразу в четырёх версиях</li>
      <li>Дедлайн до 12 октября, чтобы пачка на неделю 12-18 была готова заранее</li>
    </ul>
  </div>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Загрузка роликов</h3>
    <span class="ts">00:03:36</span>
  </div>
  <p>Версий четыре, потому что инстаграм капризный: один и тот же ролик с разным началом даёт
  совершенно разные результаты. Куда грузить, как грузить и что писать в описании, ты пока
  не знаешь, поэтому в понедельник присылаю инструкцию, и дальше грузишь сам.</p>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Зачем прицеливаться</h3>
    <span class="ts">00:04:33</span>
  </div>
  <p>Две недели мы снимали, к камере ты привык. Я собирал референсы и увидел, что могу найти
  сколько угодно залетающих роликов про рестораны, про сердце и операции. Повторять их можно,
  но сначала нужен ответ: куда мы целимся. Контент должен крутиться вокруг того, что мы
  в итоге продаём, иначе он разбегается в разные стороны.</p>
  <p>Первое, что ты мне написал, когда я спросил, чего ты хочешь:</p>
  <blockquote><p>Если это возможно, то лучше, конечно, зарабатывать ртом.</p></blockquote>
  <p>Значит, нужен оффер. UGC и распаковки с вайлдбериз нам не про то, это консалтинг
  предпринимателей. Осталось понять, каких и с чем.</p>
</section>

<div class="call">
  <h2>Часть 2. Что ты продаёшь</h2>
  <p>Смотрим на твой танк снаружи</p>
</div>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Что у тебя можно купить</h3>
    <span class="ts">00:07:53</span>
  </div>
  <p>Ты считаешь, что делаешь базовые вещи, «седьмой класс физики», и удивляешься, почему
  люди замолкают и слушают. Это нормально: то, что мы делаем каждый день, кажется обычным,
  а другие слушают с открытым ртом. Но позиционирование строится не на интересных историях,
  а на проблеме, которую ты в своей жизни решил и умеешь решить другим. Я так в 2022 году
  пришёл к контенту: сам разобрался, увидел, что проблема есть у всех и на неё есть спрос.</p>
  <p>Что нашли у тебя:</p>
  <div class="box">
    <p class="lbl">Твои сильные стороны</p>
    <ul>
      <li>Системное мышление и траблшутинг: разобрать ситуацию на части, найти противоречие и узкое место, предложить перпендикулярное решение, которое всё переворачивает</li>
      <li>К тебе и так приходят за советом: «а как бы ты поступил», как к старцу</li>
      <li>Видишь человека и описываешь ему со стороны его танк, после чего у него появляется вера в себя и энергия на действия</li>
      <li>Нетворкинг: расширять круг, через который решаются вопросы</li>
      <li>Маркетинговая стратегия для офлайн-бизнеса: кто мы, куда мы и как держать курс</li>
    </ul>
  </div>
  <p>Про коучинг без диплома: всем всё равно, коуч ты или нет, если ты вызываешь доверие.
  У меня есть кейс, человек без образования снимал на фронталку, как не бояться камеры,
  и к нему пошли за консультациями. Для примера траблшутера в России посмотри Олега Брагинского.</p>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Мотивация как инструмент, а не продукт</h3>
    <span class="ts">00:21:29</span>
  </div>
  <p>Ты хороший мотиватор, но мотивация жидкая, как и «уверенность»: для тысячи людей это слово
  значит тысячу разных вещей. Абстракции продаются только через магию. Продукт должен быть
  привязан к физическому результату, который человек может измерить. Мотивация остаётся
  вспомогательным инструментом, чтобы подтолкнуть человека делать.</p>
  <p>По сути всё сводится к страху. Твоя формула: у человека есть только вера или её отсутствие,
  а иначе страх. Отсюда тема про два метра высоты и два метра глубины.</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Направление первое: бабки</h3>
    <span class="ts">00:25:36</span>
  </div>
  <p>Ролевая игра: я зарабатываю миллион в месяц и хочу десять, сферу менять не хочу.
  Ты сказал, что поможешь, если запрос честный: десятка уже рядом, а дотянуться не могу.
  «Лежу на диване, хочу десятку» это другая задача.</p>
  <p>Переводчик на Афоне рассказал, о чём спрашивают старцев: «Топ три темы: бабки, бабы
  и здоровье». Из твоих направлений все, кроме одного, сводятся к деньгам. Ты до мозга
  костей предприниматель, поэтому вектор зафиксировали: бабки. Методики и инструменты вторичны,
  их я из тебя достану.</p>
  <blockquote><p>У меня была одна несбывшаяся мечта, Subaru Impreza WRX синего цвета.
  Я её не купил, потому что перепрыгнул сразу на Audi.</p></blockquote>
  <p>Эту историю записал себе, она звучит дорого и пойдёт в контент.</p>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Как бы ты работал с человеком</h3>
    <span class="ts">00:36:42</span>
  </div>
  <p>Ты провёл не одну сотню собеседований и на девяносто пять процентов угадывал, будет человек
  работать или нет. Метод такой: резюме превращается в историю жизни без пробелов, и за двадцать
  минут получается портрет человека. Каркас процесса, который набросали:</p>
  <div class="box">
    <p class="lbl">Черновой каркас</p>
    <ul>
      <li>Интервью и портрет человека: вся его история, без пробелов</li>
      <li>Чем он занимается, почему и совпадает ли профессия с ним самим</li>
      <li>Истинная мотивация дохода. Раньше двигало выживание, а желание «иксануть» по силе совсем другое</li>
      <li>Развилка: либо честно сказать себе, что этого достаточно, либо найти новую мотивацию. Если раньше гнала морковка сзади, теперь нужна морковка спереди</li>
    </ul>
  </div>
  <p>Танк на тяжёлых гусеницах двести километров в час не поедет: «Братан, тебе надо
  колёса поменять». Это пока технические формулировки, не финальные.</p>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Ответственность и договор</h3>
    <span class="ts">00:46:51</span>
  </div>
  <p>Ты заметил, что за деньгами часто идут из детской позиции: человек хочет снять с себя
  ответственность. Ты сам так пришёл ко мне: «Ты сейчас ответственен за мою дисциплину».
  Таким людям нужен взрослый.</p>
  <p>Формулировать «я сниму с вас ответственность» нельзя. Ответственность общая: результат
  равен обязательствам. Человек берёт обязательство перед кем-то и подтверждает намерение
  деньгами, а значит начинает уделять этому внимание. Формулировка, которая мне очень нравится:</p>
  <blockquote><p>Помогаю создать контекст, в котором ваша цель начнёт реализовываться сама.</p></blockquote>
  <p>Про риск, что человек заплатит за успех и успеха не получит: это решается договором
  и офертой. Оплата это акцепт оферты, юрист собирает такой документ недорого.</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Направление второе: передача бизнеса</h3>
    <span class="ts">00:55:26</span>
  </div>
  <p>Твоя идея под конец созвона: передача владения бизнесом от поколения к поколению.
  Те, кто сегодня владеет крупным бизнесом, родились примерно в 1955-1970 годах, они
  на пенсии или около неё, и у всех взрослые дети.</p>
  <p>Проблема острая и на стыке: юриспруденция, психология семейных отношений и перестройка
  бизнеса из ручного управления собственника во владельческий контроль, когда нужно нанять
  генерального. Ты это прожил: компания, где ты работал, была семейной. Ты хорошо знаешь
  то поколение, это были твои заказчики, и со своими детьми строишь это уже по-другому.</p>
  <p>Ты считаешь, что продаётся это тяжело, слишком щепетильно. С лендинга сопровождение
  за два миллиона никто не купит, но нужны точки входа с минимальным стрессом, например
  консультация, а дальше крупное сопровождение. Контент здесь может быть очень острым:
  отношения в богатых семьях, дети и наследство.</p>
  <div class="box fix">
    <p class="lbl">Итог</p>
    <ul>
      <li>Два оффера, которые работают в тандеме: деньги для предпринимателя и передача бизнеса</li>
      <li>Темы контента целим под оба, начинаем со следующего созвона в пятницу</li>
    </ul>
  </div>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">00:59:41</span>
  </div>
  <ul class="chk">
    <li>Голосовыми в личку: как технически шла бы работа в первом направлении, где ты помогаешь заработать больше. Сколько созвонов, восемь или двенадцать, есть ли переписка, сколько времени, как тебе комфортно</li>
    <li>Голосовыми про передачу бизнеса: в чём твоя компетенция, с чем помогаешь, как идёт процесс</li>
    <li>Ответить на вопросы к каркасу оффера, когда пришлю</li>
    <li>С понедельника 5 октября грузить ролики от своего монтажёра по инструкции</li>
    <li>Пятница 9 октября: контент-созвон под запись</li>
  </ul>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>ТЗ на неделю 12-18 октября своей команде, четыре версии каждого ролика, срок до 12 октября</li>
      <li>В понедельник инструкция: куда и как грузить ролики, что писать в описании</li>
      <li>Каркас оффера по этому созвону и вопросы к тебе</li>
      <li>Из твоих голосовых собрать два конструктора офферов</li>
      <li>Темы к пятнице 9 октября прицельно под оба направления</li>
    </ul>
  </div>
</section>

<div class="foot">
  Личный созвон 2 октября 2026, 61 минута.
</div>

</div>
</body>
</html>
`;
