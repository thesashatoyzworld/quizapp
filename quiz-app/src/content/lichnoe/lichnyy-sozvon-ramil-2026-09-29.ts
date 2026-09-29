// Конспект личного созвона 2026-09-29. Сгенерирован из
// GSD-BRAND/clients/ramil/lichnoe/2026-09-29/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_RAMIL_2026_09_29 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Вкус жизни</title>
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
  <h1>Вкус жизни</h1>
  <p class="sub">Разложили твою программу на три ступени и каждую сформулировали через результат.
  Договорились о формате и цене. Решили, что первым делом ты надиктовываешь свою историю, а оффер
  собираешь так, чтобы абстракцию было видно в обычной жизни человека.</p>
  <div class="meta">
    <span>77 минут</span>
    <span>3 месяца · 24 созвона</span>
    <span>90 000 ₽</span>
    <span>Первым делом: история голосовыми</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">С чего начинаем</a></li>
    <li><a href="#s2">Ты результат своего продукта</a></li>
    <li><a href="#s3">Три ступени программы</a></li>
    <li><a href="#s4">Метод это дрель, вкус жизни это ремонт</a></li>
    <li><a href="#s5">Формат и цена</a></li>
    <li><a href="#s6">Заземлить на реальность</a></li>
    <li><a href="#s7">Второй оффер: на первый созвон</a></li>
    <li><a href="#s8">Для кого</a></li>
    <li><a href="#s9">История и артефакты</a></li>
    <li><a href="#s10">Контент: просто войти в ритм</a></li>
    <li><a href="#s11">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Что ты продаёшь</h2>
  <p>Программа, её ступени и название</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">С чего начинаем</h3>
    <span class="ts">00:00:02</span>
  </div>
  <p>Ключевая точка сейчас это оффер и продукт, то, что мы предлагаем людям. Из него дальше прорастают
  и контент, и воронка, и сегменты.</p>
  <p>Внутри пути, который ты прожил, уже заложена механика. Мы часто не присваиваем себе то, что с нами
  происходило, потому что для нас это норма. Когда я разобрался с контентом и за два-три месяца набрал
  270 тысяч подписчиков в Тиктоке, я смог описать этот путь от проблемы до результата по шагам. С этого
  мы начинаем и с тобой.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Ты результат своего продукта</h3>
    <span class="ts">00:05:32</span>
  </div>
  <p>Ты сразу снял вопрос: делиться историей ты не стесняешься и закрываться не собираешься.</p>
  <blockquote>Этим в любом случае придётся делиться. Мне это и нужно. Мне нужно идти к людям.</blockquote>
  <p>Кейсов с другими людьми сейчас нет, и это нормально. Свои первые продажи я делал без чужих кейсов,
  только на описании своего пути. Когда у тебя есть такая точка опоры, про неё легко рассказывать
  с любым контентом.</p>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Три ступени программы</h3>
    <span class="ts">00:09:49</span>
  </div>
  <p>Вся программа у тебя в огромной тетради. Карта не есть территория, на каждого ложится по-своему,
  но механика есть, и она трёхэтапная. Основа это гьяна-йога, йога знания: через интеллект в подсознание.
  Человек живёт во множестве масок, психология лечит их по одной, а суть в том, чтобы он увидел, что ни одной
  из них не является.</p>
  <div class="scroll">
  <table>
    <tr><th>Ступень</th><th>Что происходит</th><th>Результат</th></tr>
    <tr><td class="tc">1</td><td>Связка мысль, эмоция, реакция. Учимся видеть эмоцию, не бегать от неё и отрезать путь к непроизвольной реакции.</td><td>Найти свои программы автопилота и простроить план, как их выключать.</td></tr>
    <tr><td class="tc">2</td><td>Трансформация я-образа. Разрубаем связку мысли и эмоции: эмоция приходит, но человек чувствует её фоном.</td><td>Мысли и эмоции перестают тобой управлять.</td></tr>
    <tr><td class="tc">3</td><td>Состояние творения. Нет плохих и хороших дней, каждая минута вкусная. Приходит через инсайт, его нельзя скопировать.</td><td>Вкус к жизни.</td></tr>
  </table>
  </div>
  <blockquote>Тебя машина обрызгала с ног до головы, а ты говоришь: «Да, это охеренно, пойду что-нибудь другое надену».
  Вот тогда жизнь, вот это вкус.</blockquote>
  <p class="note">Три листа тетради про первую ступень сжали в одну фразу: найти автопилот и выключить его.
  Дальше опорные столбы будем заливать фундаментом.</p>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Метод это дрель, вкус жизни это ремонт</h3>
    <span class="ts">00:37:35</span>
  </div>
  <p>Ты называешь программу «Метод трансформации реальности». Это инструмент. А человек покупает результат.
  «Вкус жизни» звучит у тебя несколько раз, и он попадает в тех, в кого мы будем целиться.</p>
  <div class="box fix">
    <p class="lbl">Рабочее название</p>
    <p>«Вкус жизни». Метод трансформации реальности остаётся тем, как ты к этому приводишь.</p>
  </div>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Формат и цена</h3>
    <span class="ts">00:23:19</span>
  </div>
  <div class="facts">
    <div class="fact"><div class="n">3 мес</div><div class="l">по месяцу на каждую ступень</div></div>
    <div class="fact"><div class="n">24</div><div class="l">созвона, по два в неделю</div></div>
    <div class="fact"><div class="n">90 мин</div><div class="l">каждый, чтобы не обрубать человека, когда он раскрылся</div></div>
    <div class="fact"><div class="n">90 000 ₽</div><div class="l">за три месяца, 30 000 в месяц</div></div>
  </div>
  <ul class="b">
    <li>Только личная работа, группу пока не собираешь.</li>
    <li>Доступ в чате: отвечаешь, когда не спишь и не отдыхаешь.</li>
    <li>Практики под каждого человека, под его восприятие, а не «вчера прочитал в книжке».</li>
    <li>Это форма терапии: закрепляем через действие.</li>
    <li>В идеале полгода, по два месяца на ступень. Это можно предлагать после трёх месяцев, чтобы закрепить.</li>
  </ul>
  <p>Цена ниже ценности, и это правильно на старте. В клининге у тебя было так же: начал с 90 и за два месяца
  вышел на 180. Сделали три продажи, подняли на 20-30%, ещё три, ещё подняли.</p>
  <blockquote>Покупаешь автомобиль в кредит, через месяц остываешь, а кредит тяготит. А тут за 30 тысяч в месяц
  ты меняешь свою жизнь.</blockquote>
</section>

<div class="call">
  <h2>Часть 2. Как это продать</h2>
  <p>Оффер через физическую реальность, оффер на созвон и сегмент</p>
</div>

<section id="s6" class="err">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Заземлить на реальность</h3>
    <span class="ts">00:48:07</span>
  </div>
  <p><b>Главное, когда будешь писать оффер.</b> «Выключить автопилот», «чистый кайф», «мысли перестают управлять»
  это абстракция. Тысяча человек прочитает, и каждый поймёт по-своему. Наша задача заземлить каждую ступень:
  как изменится физическая реальность человека.</p>
  <p>Задаёшь себе вопрос: я пришёл, прошёл первую ступень, что со мной будет? «Спокойствие». А в чём оно проявляется?
  Так мы и дошли до формулировок:</p>
  <ul class="b">
    <li>перестанешь орать на детей и на окружающих;</li>
    <li>уйдёт тревога, связанная с деньгами;</li>
    <li>станут лучше отношения в семье и на работе.</li>
  </ul>
  <p>Пишем так, чтобы подросток прочитал и понял, что он получит. Nike показывает, как человек в кроссовках
  быстро бежит, и не обещает, что так будет у всех. Стоматолог продаёт белоснежную улыбку, а не алмазный бор.</p>
  <p>Не заморачивайся, если формулировка сразу не идёт. Первая херовая открывает путь ко второй херовой,
  вторая к третьей нормальной, третья к четвёртой классной. Как напишешь, так и присылай, докрутим.</p>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Второй оффер: на первый созвон</h3>
    <span class="ts">00:55:54</span>
  </div>
  <p>Ты продавал через созвон, тебе это понятно и комфортно. Но разборы, диагностики и консультации сейчас
  не продаются: их делают все, человек получает информацию и минимум прикладного.</p>
  <p>Поэтому первый созвон собираем как отдельный продукт: берём один этап из программы, который человек
  хочет получить. Ты предложил сам: провести его по первой ступени. Взяли его ситуацию, развернули, и если он
  хотя бы чуть-чуть соприкоснулся («блин, точно, а я так не думал»), он понимает, что это работает.</p>
  <div class="box fix">
    <p class="lbl">Оффер на созвон</p>
    <p>Первая ступень, поданная через результат. Человек уходит с созвона с тем, что уже почувствовал на себе.</p>
  </div>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Для кого</h3>
    <span class="ts">00:59:22</span>
  </div>
  <p>Когда делаешь всё для всех, не попадаешь ни в кого. Оффер потом превращается в контент в закрепе,
  и человек должен узнать в нём себя.</p>
  <p>Это не люди, у которых проблемы на уровне пирамиды Маслоу. Сложные случаи, где нужно лечение и год работы,
  пока не берём. Это люди с деньгами: в бизнесе, на хорошей должности, небольшие, но устойчивые предприниматели.</p>
  <blockquote>Когда всего добьёшься, выть хочется. Работа есть, семья есть, вроде всё нормально. А что я, блин, страдаю?</blockquote>
  <p>Две базовые потребности, которые ты назвал: <b>баблофобия</b> и <b>отношения</b> (в семье и на работе).
  Начинаем с одного: предприниматели и деньги. Тогда «перестанешь орать на окружающих» надо переформулировать
  через линзу денег. Потом так же можно собрать оффер под отношения. Два-три оффера под разные сегменты
  работают точнее одного на всех.</p>
  <p class="note">Скинул тебе пример товарища: консультация «Как зарабатывать стабильно и без паники», дальше три месяца
  коучинга за 500 тысяч. Вектор похож: люди с деньгами, которые херачат, а бабок всё мало.</p>
</section>

<div class="call">
  <h2>Часть 3. Доверие и контент</h2>
  <p>История, которая продаёт, и ритм</p>
</div>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">История и артефакты</h3>
    <span class="ts">00:32:07</span>
  </div>
  <p>Рилсы, карусели и истории только привлекают внимание. Дальше человека надо куда-то отправить: статья, видео
  или серия постов, которые продают идею и показывают твой авторитет. Это мост. Когда люди доверяют, они покупают.
  Проблема холодного трафика ровно в том, что человека сложно утеплить.</p>
  <div class="box fix">
    <p class="lbl">Как делаем</p>
    <ol>
      <li>Ты рассказываешь свою историю голосовыми мне в личку в Телеграме, с нового аккаунта.</li>
      <li>Я собираю из неё структуру и статью.</li>
      <li>Артефакты, если найдутся: фото, скриншоты, старые сторис и посты, переписки. Будут, классно. Не будет, ничего страшного.</li>
    </ol>
  </div>
  <p>Материала там много: психоанализ, пробуждение, прошлое офицера и охрана танкеров от пиратов в Индийском
  океане, клининг и тендеры, где ты показывал реальные платёжки. И то, как ты перестал пить: «вот оно стоит,
  а я не могу руку притянуть». Если это суметь передать людям, будет космос.</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Контент: просто войти в ритм</h3>
    <span class="ts">01:11:06</span>
  </div>
  <p>Оффер, кейсы и минимальная воронка это грядка. Трафик и контент это вода. Пока грядки нет, сколько ни поливай,
  не прорастёт. Поэтому сейчас собираем грядку, а контент идёт параллельно, как мышца.</p>
  <p>Задача одна: войти в ритм. Выложил что-то, победа. Нет времени, снял за 15 минут, пока куда-то идёшь.
  Из лёгкого процесса, а не через час раздумий, как правильно. Поток спроса, упаковку и оптимизацию наслоим потом.</p>
  <blockquote>Просто приходить в спортзал. Можно ни хера не делать, просто приходить.</blockquote>
  <p>Группа, если отвлекает потоком вкладок и сообщений, не обязательна: работаем в личке.</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">01:16:46</span>
  </div>
  <div class="box">
    <p class="lbl">За тобой</p>
    <ol>
      <li>Надиктовать свою историю голосовыми мне в личку. Всплывут артефакты, присылай.</li>
      <li>Собрать оффер «Вкус жизни» по воркшопу «Солдаут»: три ступени, формат, цена, и у каждой ступени результат в физической реальности. Прицел: предприниматели и деньги.</li>
      <li>Собрать оффер на первый созвон: первая ступень через результат.</li>
      <li>Оба оффера текстом мне на обратную связь. Утвердим и поставим на лендинг через нейронку.</li>
      <li>Контент параллельно: просто выкладывать, войти в ритм.</li>
    </ol>
  </div>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Собрать из твоих голосовых статью с историей.</li>
      <li>Узнать у ребят, как они заводили аккаунт Claude, и прислать тебе.</li>
      <li>Посмотреть видео, которое ты пришлёшь, и дать обратную связь.</li>
      <li>Обратная связь по офферам.</li>
    </ul>
  </div>
  <p class="note">Следующий созвон во вторник, 6 октября, в 11:00.</p>
</section>

<div class="foot">
  Личный созвон 29 сентября 2026, 77 минут.
</div>

</div>
</body>
</html>
`;
