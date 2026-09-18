// Конспект личного созвона 2026-09-18. Сгенерирован из
// GSD-BRAND/clients/natalya-ninchich/lichnoe/2026-09-18/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_NATALYA_NINCHICH_2026_09_18 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон 18 сентября 2026</title>
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
  <p class="kicker">Личный созвон · 18 сентября 2026</p>
  <h1>Забрать свой опыт себе</h1>
  <p class="sub">Тормозят не знания и не техника, а то, что ты не присвоила себе свой опыт: свой путь через
  здоровье и результаты людей, которым ты помогла. Поэтому первый шаг не оффер и не воронка, а инвентаризация:
  описать руками истории, проговорить их на камеру и потом начать рассказывать об этом публично.
  Контент при этом не останавливаем.</p>
  <div class="meta">
    <span>62 минуты</span>
    <span>Сегмент: женщины за 35 с детьми</span>
    <span>Первым делом: 3-5 историй</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Опыт, а не ошибка</a></li>
    <li><a href="#s2">Люди отползают, и это нормально</a></li>
    <li><a href="#s3">Синдром самозванца дипломом не лечится</a></li>
    <li><a href="#s4">Инвентаризация опыта</a></li>
    <li><a href="#s5">Твоя история</a></li>
    <li><a href="#s6">Результаты у тебя есть</a></li>
    <li><a href="#s7">Обжиг: рассказ, а не скриншот</a></li>
    <li><a href="#s8">Пятеро детей это козырь</a></li>
    <li><a href="#s9">Оффер после историй</a></li>
    <li><a href="#s10">Рилс не удалять</a></li>
    <li><a href="#s11">Контент идёт, как идёт</a></li>
    <li><a href="#s12">Гайд по тарелочкам</a></li>
    <li><a href="#s13">Страшно, потому что много нового</a></li>
    <li><a href="#s14">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. С чего стартуем</h2>
  <p>Состояние, люди вокруг и синдром самозванца</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Опыт, а не ошибка</h3>
    <span class="ts">00:00:16</span>
  </div>
  <p>Ты пришла на созвон в тяжёлом состоянии: рассрочка далась против себя. И сама же через минуту поправилась:</p>
  <blockquote>Может быть, и не ошибку, да. Опыт. В любом случае, я получила опыт, я сделала выводы.</blockquote>
  <p>С этой формулировкой и работаем. Мы ещё ничего не сделали, и задача сейчас выжать из этого максимум,
  а не сидеть в вине. У меня были покупки и за 400 тысяч рублей, и за 5 тысяч долларов, в моменте было больно,
  но всё, что я там брал, потом вернулось.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Люди отползают, и это нормально</h3>
    <span class="ts">00:06:00</span>
  </div>
  <p>Как только ты стала в Instagram смелее и честнее, часть людей начала отворачиваться, кто-то даже попросил
  удалить их фотографии. Ты двадцать лет была «удобной, хорошей девочкой», и люди привыкли к этой картине.
  Ты меняешься, они защищают свою коробку. К тебе это отношения не имеет.</p>
  <p>Ты сама ответила, почему им не нравится: «потому что сами не могут так». Как только ответ есть, тема
  перестаёт жечь. Твои люди просто ещё не пришли, а новые уже пишут: «ты очень сильная, но не каждый так сможет».</p>
  <p>С близкими то же самое: у тебя впервые появилась своя комната, а люди двадцать лет заходили в неё
  когда хотели. Границы уже работают: когда ты после перерыва снова наготовила, вместо дежурного «спасибо»
  услышала «как вкусно, объедение».</p>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Синдром самозванца дипломом не лечится</h3>
    <span class="ts">00:08:56</span>
  </div>
  <p>На вопрос, фитнес-тренер ли ты: «можно назвать, но я очень неуверенно по этой теме двигаюсь».
  А твёрдое при этом есть: ты тренируешься каждый день и ты результат своего продукта.</p>
  <p>Учиться хорошо, база нужна. Но после диплома синдром самозванца никуда не денется: мозг попросит второй
  диплом, потом повышение квалификации, потом соревнования. Ко мне приходили тренеры со ста двадцатью тысячами
  подписчиков и кучей кубков, которым завтра нечем платить за кредит. Кубки от этого не спасают.</p>
  <p>Плюс сравнение: смотришь на других тренеров и думаешь, что показываешь «какую-то фигню». Это ручка громкости:
  вышла на двадцать процентов, посветила, спряталась. Чтобы тебя начали замечать и платить, её надо выкрутить
  на сто. Мешает этому не техника.</p>
</section>

<div class="call">
  <h2>Часть 2. Инвентаризация опыта</h2>
  <p>Главная задача ближайших дней</p>
</div>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Инвентаризация опыта</h3>
    <span class="ts">00:12:56</span>
  </div>
  <p>Опыт не присваивается, пока он не озвучен. Скриншоты отзывов в актуальном это ожидание, что кто-то придёт
  и похлопает. А одобрения извне всегда будет мало: пока ты сама себе не скажешь, что тебе уже можно,
  остальные тоже не скажут.</p>
  <ol class="steps">
    <li>Садишься и руками описываешь 3-4 истории клиентов: с чем человек пришёл, какой путь вы прошли, что делали,
    с какими сложностями столкнулись, что не получалось и к какому результату пришли.</li>
    <li>Отдельно одна история про себя.</li>
    <li>Ставишь камеру и проговариваешь написанное вслух. Двадцать минут значит двадцать, тридцать значит тридцать.</li>
    <li>Присылаешь мне текст и скриншот, что видео снято. Дальше покажу, как из этого сделать статьи и кейсы.</li>
  </ol>
  <p>Ты сразу возразила, что люди ушли. Описываешь до той точки, где результат был, дальше не надо.
  Ушли значит получили то, за чем приходили.</p>
  <p class="note">Это не рилс и не сторителлинг. Мы делаем это для тебя: когда опишешь, у тебя структурируется
  в голове, и ты начнёшь смотреть на себя по-другому.</p>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Твоя история</h3>
    <span class="ts">00:15:51</span>
  </div>
  <blockquote>Гормональные изменения сильные. Железо упало, я просто начала терять сознание. Волосы выпадали и не могла спать год.</blockquote>
  <p>И ты вытащила себя сама: спорт, нормальное питание, нутрициология. Двадцать лет жила только ради семьи,
  «кофе с булочкой», и здоровье вернуло тебя к тому, что надо думать о себе.</p>
  <p>Начни с ситуации год назад: переезд, с каким списком проблем столкнулась, как полетело здоровье. Дальше максимально
  подробно, что происходило, что ты начала делать и к чему пришла. «Думаю, с чего начать» не решается планом,
  начни с чего угодно.</p>
  <p>На вопрос, гордишься ли ты собой: «да, я в этом плане очень горжусь, потому что путь большой проделан».
  Это ощущение и надо закрепить. До состояния, когда можешь подойти к зеркалу и сказать «я крутая», и это
  не вызывает ни кринжа, ни вины. Тогда контент, продажи и оффер пойдут как по маслу.</p>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Результаты у тебя есть</h3>
    <span class="ts">00:24:59</span>
  </div>
  <ul class="b">
    <li>Участница клуба была в сильной депрессии, занятия помогли ей выйти. Люди с этим годами не справляются, а у неё
    теперь есть инструменты, чтобы не впадать туда снова.</li>
    <li>Одноклассница, которая когда-то ходила к тебе на тренировки, через много лет написала, что благодарна:
    сама стала фитнес-инструктором, и у неё поменялась жизнь.</li>
    <li>Ты вела кондитерку и курсы, когда дети были грудными погодками.</li>
  </ul>
  <p>Я с кейсом Васи первые полгода делал то же самое: рассказал один раз и забил, «ну не двадцать же миллионов».
  А потом понял, что человеку жизнь изменил. Когда забираешь это себе, молчать об этом становится невозможно.</p>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Обжиг: рассказ, а не скриншот</h3>
    <span class="ts">00:28:48</span>
  </div>
  <p>Из глины лепят вазу, потом ставят в печь, и форма затвердевает. Ты добавила своё: «как хлеб печь, из муки
  и воды делается форма». Публичный рассказ о том, как ты помогла себе и другим, и есть обжиг.</p>
  <p>Где рассказывать: сторис, пост, карусель, рилс. Чем больше, тем крепче. И ты сама сформулировала точно:
  не скриншот, а рассказ «через призму меня, что это моя заслуга».</p>
  <p class="note">Порядок такой: сначала истории собираем, потом начинаем про них рассказывать.</p>
</section>

<div class="call">
  <h2>Часть 3. Сегмент и оффер</h2>
  <p>Для кого ты и когда собираем предложение</p>
</div>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Пятеро детей это козырь</h3>
    <span class="ts">00:32:52</span>
  </div>
  <p>Для тебя это рутина: пятеро детей, переезд, эмиграция, потерянный бизнес, и ты ещё успеваешь заниматься собой.
  Со стороны это фора, которой нет у тренеров из ленты. Эмиграция это стресс, новая жизнь и куча новых вводных,
  и ты имеешь полное право говорить, что можно и нужно делать женщине после 35 с детьми.</p>
  <p>У меня сейчас в работе тренер-мужчина: 20-30 заявок на созвон, пятнадцать созвонов, ни одной продажи.
  К нему приходят женщины, а он не вникает в их проблемы и он не женщина. Не доверяют. В сегмент многодетных мам
  у тебя фора в пять детей.</p>
  <div class="box fix">
    <p class="lbl">Сегмент</p>
    <p>Женщины за 35, у которых много детей и нет времени и которые забили на себя.</p>
  </div>
  <p>Тренировки с дочкой, которые ты уже показываешь, ровно в эту сторону.</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Оффер после историй</h3>
    <span class="ts">00:34:50</span>
  </div>
  <p>Оффер это коммерческое предложение для клиента. Собирать будем, но после инвентаризации. Если начать сейчас,
  на каждом пункте всплывёт «а можно ли так», «а тут я не знаю как», и оффер выйдет жиденьким.
  Собираем его из состояния «я это уже делала, я могу».</p>
  <p>Ты сама принесла пример. С банком, приложением, которое не скачивается в Сербии, и переводами ты разобралась
  сама, хотя мозг взрывался. Если ты растишь пятерых детей, в этом мире нет ничего, с чем бы ты не справилась.
  Instagram, продажи и оффер проще, чем быть многодетной мамой.</p>
  <blockquote>Кейсы и оффер это грядка с семенами. Контент и трафик это вода. Если грядки нет, сколько ни лей, ничего не вырастет.</blockquote>
  <p>Деньги при этом не стыдно. Сначала маска на себя, потом на детей: пока базовые потребности не закрыты,
  ты в тревоге и помогать можешь только узкому кругу.</p>
</section>

<div class="call">
  <h2>Часть 4. Контент</h2>
  <p>Что делать с тем, что уже выходит</p>
</div>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Рилс не удалять</h3>
    <span class="ts">00:38:15</span>
  </div>
  <p>Рилс, который выстрелил, продолжает набирать, и в комментариях пишут разное. Мысль «может, удалить» не слушаем.
  Ты вышла туда, потому что блог сейчас твоя опора, и это нормальная причина.</p>
  <p>Ответ на гадости не удаление, а второй ролик: «у меня тут рилс начал набирать, мне пишут гадости, хочу ответить».
  Своими словами, без сглаживания. Люди раздают советы, ничего не зная про твою жизнь. Разреши себе злиться:
  блог это твой дом, и если приходят с мечом, отвечаешь тем же.</p>
  <p>Противовес ты тоже принесла сама. В день, когда руки совсем опустились, тебе написала актриса Ирина Гринёва:
  слова поддержки и просьба про рецепт хлеба на закваске. Это тоже материал для ролика.</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Контент идёт, как идёт</h3>
    <span class="ts">00:46:46</span>
  </div>
  <p>Контент это безостановочная задача, мы его сейчас просто не трогаем. Ты и так держишь ритм: выкладываешь
  каждый день по ощущениям, и назвала это правильно, дисциплина. Рыба, ртуть и омега, темы из обучения
  на нутрициолога, всё идёт.</p>
  <p>Параллельно начинаем работу над фундаментом, а я подбрасываю идеи по ходу.</p>
</section>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Гайд по тарелочкам</h3>
    <span class="ts">00:50:01</span>
  </div>
  <p>Тарелочки заходят, но сами по себе людей в оплату не приводят. У одной пары с пятьюдесятью тысячами подписчиков
  на рецептах дальше двух-трёх тысяч рублей дело не шло. Рецепт борща на пять миллионов просмотров автору денег не принёс.</p>
  <p>При этом тебе уже написали: «мне так нравятся твои тарелочки, у тебя есть гайд или рецепты, чтобы я могла купить?»
  Набросок у тебя есть. Можем начать с него, чтобы ты вошла в ритм продаж. Покажи, посмотрим вместе.</p>
</section>

<section id="s13">
  <div class="sec-head">
    <span class="sec-num">13</span>
    <h3 class="t">Страшно, потому что много нового</h3>
    <span class="ts">00:57:10</span>
  </div>
  <p>Ты выбрала себя сразу везде: в работе, в семье, пошла на второе обучение, не закончив первое, и ещё стала
  старостой в группе, где одни качки. Ты прыгнула с первого уровня на пятнадцатый, как сжатая пружина.
  Пугает не то, справишься ли, а объём нового. Мы все боимся нового, это нормально.</p>
  <p>До января ты три года почти не выходила из дома, а сейчас ходишь, общаешься и ведёшь блог. Опирайся на то,
  что с пятью детьми ты справилась. С этим точно разберёшься.</p>
  <blockquote>Мне сейчас легче и даже вот оптимизм появился. Не знаю, как это будет, но я прям чувствую, что я со всем справлюсь.</blockquote>
</section>

<section id="s14">
  <div class="sec-head">
    <span class="sec-num">14</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">00:54:12</span>
  </div>
  <div class="box">
    <p class="lbl">Первым делом</p>
    <ol>
      <li>Описать текстом свою историю: год назад, переезд, здоровье, что начала делать, к чему пришла.</li>
      <li>Описать 3-4 истории клиентов до точки, где был результат.</li>
      <li>Проговорить это на камеру, 20-30 минут. Не для публикации.</li>
      <li>Прислать мне текст и скриншот, что видео снято.</li>
    </ol>
  </div>
  <div class="box">
    <p class="lbl">Параллельно</p>
    <ul>
      <li>Вести заметки в тетради: что понимаешь, как меняется ощущение себя.</li>
      <li>Рилс не удалять. Если захочешь, снять ответ тем, кто пишет гадости.</li>
      <li>Контент каждый день, как чувствуешь.</li>
      <li>Показать мне набросок гайда по тарелочкам.</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Посмотреть твои истории и показать, как превратить тексты и видео в статьи и кейсы.</li>
      <li>Посмотреть гайд, решить, начинаем ли продажи с него.</li>
      <li>Дальше вместе собираем оффер.</li>
    </ul>
  </div>
  <p class="note">Вопросы пиши в группу. Групповые созвоны по понедельникам в 7:00 и в 17:00 по Москве, не обязательные:
  можно прийти на десять минут, можно на час, можно на оба. Там показывают, что сделали, и задают вопросы.</p>
</section>

<div class="foot">
  Личный созвон 18 сентября 2026, 62 минуты.
</div>

</div>
</body>
</html>
`;
