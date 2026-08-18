// Конспект группового созвона 2026-08-17. Сгенерирован из
// GSD-BRAND/clients/sasha/sozvony/2026-08-17/KONSPEKT.html — править там, не здесь.

export const SOZVON_2026_08_17 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Групповой созвон 17.08.2026</title>
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
    <p class="kicker">Групповой созвон · 17 августа 2026</p>
    <h1>Когда перестало получаться, снижают цену входа, а не задирают усилие</h1>
    <p class="sub">Разбор по кругу: Азамат, Константин, Даша, Сева. Как разорвать петлю, где каждый следующий созвон проводится с меньшей уверенностью, чем предыдущий. Почему вылизанный ролик проигрывает снятому на коленке. Что продавать, когда план питания собирает нейронка. И что делать, если аудитория пришла совсем не за тем, что вы хотите продавать. Ниже вся встреча по таймкодам записи.</p>
    <div class="meta">
      <span>17.08.2026</span><span>64 мин</span><span>Азамат</span><span>Константин</span><span>Даша</span><span>Сева</span>
    </div>
  </header>

  <!--VIDEO_SLOT-->

  <nav class="toc">
    <h3>Содержание</h3>
    <ol>
      <li><a href="#glavnoe">Главное за встречу</a></li>
      <li><a href="#azamat">Азамат: разорвать петлю неудачных созвонов</a></li>
      <li><a href="#minioffer">Мини-оффер на неделю и гарантия возврата</a></li>
      <li><a href="#neyronka">Что продавать, когда план соберёт нейронка</a></li>
      <li><a href="#keysy">Кейсы: показывать ситуацию, а не результат</a></li>
      <li><a href="#kostya">Константин: вылизанность не работает</a></li>
      <li><a href="#kazino">Инстаграм это казино</a></li>
      <li><a href="#potok">Поток спроса: где брать темы</a></li>
      <li><a href="#yapping">Yapping и истории, которые вы и так умеете</a></li>
      <li><a href="#otsenka">Не оценивай себя</a></li>
      <li><a href="#dasha">Даша: аудитория пришла не за тем</a></li>
      <li><a href="#vozrazhenie">Возражение, вокруг которого собирается контент</a></li>
      <li><a href="#seva">Сева: как называть цену</a></li>
      <li><a href="#zadachi">Задачи участникам</a></li>
      <li><a href="#citaty">Цитаты под контент</a></li>
    </ol>
  </nav>

  <div class="call"><h2>Главное</h2><p>три вещи, ради которых стоит пересмотреть запись</p></div>

  <section id="glavnoe">
    <div class="sec-head"><span class="sec-num">01</span><h3 class="t">Главное за встречу</h3></div>
    <ul class="b">
      <li><b>Когда уверенность падает, снижают цену, а не поднимают усилие.</b> Азамату: продать неделю за 2 900 вместо двадцати тысяч. Не ради денег, а чтобы мозг увидел, что люди платят. <span class="q">Это радикальный ход, он направлен не на зарабатывание денег, он направлен на возвращение уверенности</span>.</li>
      <li><b>Вылизанность убивает просмотры.</b> Чем больше ролик похож на рекламу, тем меньше доверия. У Кости один и тот же текст: снятый небрежно улетел на 60 000, снятый со светом и обработкой не пошёл вообще.</li>
      <li><b>Продавать надо то, чего не сделает нейронка.</b> План питания собирается за минуту и бесплатно. Значит ценность недели с тренером ищем во внимании, в состоянии и в том, что человека держат и не дают слиться.</li>
    </ul>
  </section>

  <div class="call"><h2>По кругу</h2><p>разбор каждого участника</p></div>

  <section id="azamat">
    <div class="sec-head"><span class="sec-num">02</span><h3 class="t">Азамат: разорвать петлю неудачных созвонов</h3><span class="ts">01:00 · 10:21</span></div>
    <p><b>Где стоит:</b> все задания сделаны, кроме двух. Не посмотрен «Кэш-магнит» и не оформлены кейсы. За неделю три поста, пост с оффером на личную работу дал две заявки и одну консультацию.</p>
    <p><b>Что с отказавшими:</b> написал всем, кто сказал нет или ушёл думать. Часть промолчала, остальные ответили то же самое про деньги. Предложил формат мини-группы, в ответ тишина.</p>
    <p>Сам про себя: <span class="q">обратку, которую ты мне дал, я всю понимаю, но как только доходит до дела, будто встаю на старые рельсы</span>.</p>
    <div class="box">
      <p class="lbl">Диагноз · 06:00</p>
      <p>Замкнутый круг. Каждый созвон, который заканчивается словом «нет», роняет уверенность. Из низкой уверенности следующий созвон заходит с завышенными ожиданиями и завышенной планкой. Дальше по кругу, и с каждым витком хуже.</p>
    </div>
    <p class="note">Разрывать этот круг решили не техникой продажи, а ценой. Задача ближайших двух недель звучит буквально так: заработать хоть какие-то деньги, чтобы вернуть себе ощущение «мне платят».</p>
  </section>

  <section id="minioffer">
    <div class="sec-head"><span class="sec-num">03</span><h3 class="t">Мини-оффер на неделю и гарантия возврата</h3><span class="ts">06:00 · 21:52</span></div>
    <p><b>Конструкция:</b> одна неделя работы, начинается с личного созвона, стоит 2 900. Не потому, что работа столько стоит, а потому, что при такой цене соотношение цены и ценности очевидно в пользу клиента.</p>
    <div class="box fix">
      <p class="lbl">Текст сообщения тем, кто сказал нет · 18:00</p>
      <p>Привет. Я знаю, что могу помочь тебе с твоей ситуацией, и уверен, что мы получим результат. Предлагаю поработать в формате недели: <i>(здесь встаёт оффер, три пункта)</i>. Чтобы ты поняла и почувствовала, что со мной комфортно и что мы гораздо быстрее и точнее придём к результату. Работаем неделю, начинаем с созвона один на один, стоит 2 900. И если через неделю ты скажешь, что мой подход не работает и ты не увидела никакой ценности, я без проблем верну тебе деньги.</p>
    </div>
    <p><b>Почему гарантия.</b> Кейсов пока нет, поэтому заходим на уверенности. Свои первые продажи по 300 000 Саша сделал после сорока созвонов ровно в тот момент, когда начал говорить: работаем два месяца, не получаем результат, продолжаю работать с тобой до результата.</p>
    <blockquote><p>Я либался с этими созвонами бесконечно. Сорок созвонов провёл. И в тот момент, когда начал предлагать гарантию работы до результата, люди начали соглашаться. Тогда я и заработал свой первый миллион.</p></blockquote>
    <p class="note">Жёсткий комитмент про работу до результата сейчас брать не стоит. Начинаем с малого: возврат денег за неделю, если не увидела ценности.</p>
  </section>

  <section id="neyronka">
    <div class="sec-head"><span class="sec-num">04</span><h3 class="t">Что продавать, когда план соберёт нейронка</h3><span class="ts">16:30 · 23:33</span></div>
    <p>Оффер «составлю план питания» больше не работает. Любая девчонка открывает нейронку, получает план, продуктовую корзину и магазины рядом с домом. Бесплатно и за минуту.</p>
    <p>Значит задача до следующего созвона: сесть и придумать, что реально ценного можно дать за неделю, когда человек один и всё внимание на нём.</p>
    <div class="box fix">
      <p class="lbl">Куда думать · 22:42</p>
      <ul>
        <li>Через результат: что физически успеваем сделать за семь дней.</li>
        <li>Через состояние: как человек себя чувствует всю неделю, когда его ведут.</li>
        <li>Через эмоции и восприятие, особенно у женщин: как на неё смотрят, что замечает муж, как села одежда.</li>
      </ul>
    </div>
    <p class="note">Собрать пачку идей и принести, дальше вместе подсушим или дополним.</p>
  </section>

  <section id="keysy">
    <div class="sec-head"><span class="sec-num">05</span><h3 class="t">Кейсы: показывать ситуацию, а не результат</h3><span class="ts">10:23 · 17:28</span></div>
    <p><b>Каркас статьи-кейса.</b> Она не обязана быть большой, но в ней должны быть четыре точки: с какой ситуацией человек пришёл, что делали в процессе, с какими сложностями сталкивались, к какому результату пришли. Фото и отзыв сверху.</p>
    <div class="box fix">
      <p class="lbl">Как получить материал · 11:14</p>
      <ol>
        <li>Выбрать одну-двух клиенток со сложной исходной ситуацией и хорошим результатом.</li>
        <li>Написать: <span class="q">мы сделали классный результат, буду признателен, если созвонимся на двадцать-тридцать минут и запишем видео, я хочу помочь большему количеству девчонок и показать им, что это возможно</span>.</li>
        <li>Созвониться в Zoom и поставить на запись. Дальше это ролик на YouTube, статья из транскрипта, куски в сторис и рилсы.</li>
      </ol>
    </div>
    <p>Отказов у Саши на такую просьбу не было ни разу, если результат действительно был.</p>
    <p><b>Главное про фокус.</b> Здоровье не продаётся через финальный результат. Оно продаётся через боль, страх и последствия, потому что люди годами игнорируют свои проблемы и трогаются с места только когда заболит.</p>
    <blockquote><p>Если бы они показывали только финальные результаты, где люди накачаны и стройные, это бы так не работало. Там видна проблемная ситуация, и люди узнают себя в ней, а не в результатах.</p></blockquote>
    <p class="note">Отсюда же вывод про подачу: раз френдли-режим Азамату не идёт, значит ручку громкости выкручиваем в другую сторону и бьём прямо в боль. Середина не работает.</p>
  </section>

  <section id="kostya">
    <div class="sec-head"><span class="sec-num">06</span><h3 class="t">Константин: вылизанность не работает</h3><span class="ts">23:33 · 30:13</span></div>
    <p><b>Где стоит:</b> залил два рилса в пробный режим, третий на подходе. Одна тема, разные концовки и разные заходы. Рилс по аренде дал 60 000 просмотров, точная его копия с теми же словами, но с лучшей обработкой, не дала ничего.</p>
    <div class="box fix">
      <p class="lbl">Ответ Севы как практика · 25:21</p>
      <ul>
        <li>В большинстве ниш вылизанность не работает.</li>
        <li>Чем больше ролик похож на рекламу, тем меньше доверия и тем меньше просмотров.</li>
        <li>Исключение: эксперты, которым красивая картинка органична и в ней раскрывается их вайб.</li>
        <li>Идеально снятое видео это когда ты понимаешь, как работать со светом и композицией, и сознательно всё это упрощаешь.</li>
      </ul>
    </div>
    <p><b>Аргумент через ROI.</b> Три часа на ролик и три тысячи просмотров против тридцати минут и тех же трёх тысяч. Побеждает объём, потому что за три часа можно снять шесть роликов.</p>
    <p class="note">Оговорка Саши: если без картинки некомфортно, тогда нужен процесс. Расписание, поставленный свет, пять-шесть готовых сценариев и съёмка пачкой.</p>
  </section>

  <section id="kazino">
    <div class="sec-head"><span class="sec-num">07</span><h3 class="t">Инстаграм это казино</h3><span class="ts">27:30 · 33:00</span></div>
    <p>Один и тот же ролик, залитый параллельно в пробный режим, дал 5 000 просмотров на первой заливке и 360 000 на второй. В самом ролике не поменялось ничего.</p>
    <div class="box fix">
      <p class="lbl">Что из этого следует</p>
      <ul>
        <li>Не сработало один раз, значит это не приговор ролику. Снять то же самое из другой локации, за рулём, где угодно.</li>
        <li>Делать третий и четвёртый заход. Если сигнал уже был, на одной из попыток тема выстрелит снова.</li>
        <li>В каруселях разброс меньше: тема, залетевшая у коллеги, повторяется чаще. Но при маленькой аудитории сначала рилсы, карусели энергозатратнее.</li>
      </ul>
    </div>
    <p><b>Почему чужая тема может не сработать.</b> Алгоритм подбирает зрителя по интересам, обучившись на вашей аудитории. Карусель «во сколько постить для максимального охвата» у аудитории новичков берёт 30 000 лайков, а у Саши на аудитории про продающий контент та же тема собрала 8 000 просмотров.</p>
    <blockquote><p>У неё аудитория, которая недавно открыла Инстаграм. У меня люди, которые читают более тяжёлые смыслы. Поэтому оно могло и не сработать.</p></blockquote>
  </section>

  <section id="potok">
    <div class="sec-head"><span class="sec-num">08</span><h3 class="t">Поток спроса: где брать темы</h3><span class="ts">33:00 · 35:53</span></div>
    <div class="box fix">
      <p class="lbl">Механика на примере машин из Китая</p>
      <ol>
        <li>Ищем на YouTube ролик по своей теме, который уже собрал просмотры. Например: почему не стоит покупать новую машину из Китая в 2026 году.</li>
        <li>Смотрим, что там: чувак сидит в тачке, монолог на две минуты, без монтажа и без хуков.</li>
        <li>Переписываем под смыслы и тезисы своего клиента.</li>
        <li>Снимаем этот рилс три раза.</li>
      </ol>
    </div>
    <p class="note">Подробный разбор с примерами лежит в материалах кабинета, пятый уровень «Нового уровня контента».</p>
  </section>

  <section id="yapping">
    <div class="sec-head"><span class="sec-num">09</span><h3 class="t">Yapping и истории, которые вы и так умеете</h3><span class="ts">36:22 · 40:00</span></div>
    <p>Вопрос Кости: в двухминутном монологе ведь тоже нужна структура, чтобы человек досмотрел после третьей секунды. Ответ: подойти можно и структурно, как к сериалу, но это надолго и заебёт.</p>
    <blockquote><p>Когда ты с друзьями собираешься и у тебя есть история, которой хочется поделиться, мы все умеем рассказывать интересно. Только тогда, когда делаем это естественно, когда самим хочется поделиться.</p></blockquote>
    <p><b>Материал у Кости уже есть:</b> шейхи, Эмираты, недвижка, аварии и приколы в процессе. Показывать, что происходит и как он это разруливает.</p>
    <p class="note">Практическая часть: снять обзоры чужих роликов в двух вариантах. Первый как видит сам, второй по правкам Саши, с врезкой в середину повествования. Чем больше тейков, тем больше выводов.</p>
  </section>

  <section id="otsenka">
    <div class="sec-head"><span class="sec-num">10</span><h3 class="t">Не оценивай себя</h3><span class="ts">38:14 · 42:43</span></div>
    <p>Костя про конкурента: он естественно и складно говорит на камеру, а у меня так не выйдет. Ответ Саши строится на простом примере: свой голос в записи всем кажется хуже, чем изнутри.</p>
    <blockquote><p>Через год ко мне придёт какой-нибудь Константин Бобров и скажет: у меня есть конкурент, первая версия Константина Боброва, он делает yapping и очень интересно рассказывает истории. И я ему скажу то же самое.</p></blockquote>
    <p>Дальше про позицию, из которой вообще стоит работать:</p>
    <blockquote><p>Нам не нужно ничего делать для того, чтобы мы были пиздатыми. Единственное, что нам нужно, это разрешить себе быть пиздатыми. Дальше вопрос времени, когда остальные это заметят.</p></blockquote>
    <p class="note">Что это даёт на практике: Сева писал рилсы по четыре часа, пока не перестал оценивать каждый кадр. Сейчас на ролик уходит десять-пятнадцать минут.</p>
  </section>

  <section id="dasha">
    <div class="sec-head"><span class="sec-num">11</span><h3 class="t">Даша: аудитория пришла не за тем</h3><span class="ts">43:12 · 50:03</span></div>
    <p><b>Где стоит:</b> телеграм-аудитория на курс не идёт, запроса мало. Две консультации за день, обе с запросом про мужчину, обе ушли на чистки. Готовые учиться магии были в Телеграме, а не в Инстаграме.</p>
    <div class="box">
      <p class="lbl">Созвон, который она записала и удалила · 45:01</p>
      <p>Клиентка из старых, анкету не заполняла. Весь разговор про то, что денег нет, ничего не помогает и она обошла тысячу мастеров. Даша в работу не пошла, предложила приходить, когда будет готова.</p>
      <p>Что здесь важно: анкета до созвона нужна именно для этого. По ней видно заранее, что человек не в ресурсе и разговора не будет.</p>
    </div>
    <p><b>Развилка, которую поставил Саша.</b> Либо долбим дальше в обучение магии и заработок на магии, и тогда нужен полностью новый контент и новый вектор, потому что текущая аудитория собрана на другое. Либо строим ветку на том, что уже покупают.</p>
    <p>Ответ Даши закрыл вопрос:</p>
    <blockquote><p>Они даже не хотят созваниваться, понимаешь. Они хотят тупо ритуал. Они хотят чиститься, чистить денежный канал. И они все боятся одного и того же.</p></blockquote>
    <p class="note">Ветку про мини-группы и диагностику «где у вас блок на деньги» проговорили, но упёрлись в то же самое: аудитория не хочет делать сама, она хочет, чтобы сделали за неё.</p>
  </section>

  <section id="vozrazhenie">
    <div class="sec-head"><span class="sec-num">12</span><h3 class="t">Возражение, вокруг которого собирается контент</h3><span class="ts">50:03 · 56:07</span></div>
    <p>Если все боятся одного и того же, значит весь ближайший контент собирается вокруг этого страха. Не вокруг продукта.</p>
    <div class="box fix">
      <p class="lbl">Три задачи до завтра · 52:15</p>
      <ol>
        <li>Написать сегодня двум девочкам, которые боялись, но зашли и получили результат. Выбрать даты, созвониться, поставить на запись. Из этого собирается статья.</li>
        <li>Записать подкаст вокруг главного возражения: страшно, вредно, небезопасно, что будет с моей жизнью.</li>
        <li>Посмотреть разбор их же созвона, который Саша выложил в бот в этот день.</li>
      </ol>
    </div>
    <p><b>Отдельная линия:</b> продукт-самопомогайка хотя бы за 5 000. Нельзя зарабатывать только своим временем и своей энергией. Нужна единица, которая продаётся без её участия, дальше на неё же собираются продажи дороже.</p>
    <p class="note">План в новом векторе Саша обещал прислать на следующий день.</p>
  </section>

  <section id="seva">
    <div class="sec-head"><span class="sec-num">13</span><h3 class="t">Сева: как называть цену</h3><span class="ts">56:15 · 01:02:00</span></div>
    <p><b>Ситуация:</b> шеф-повар, точка работает полтора года, сейчас продают франшизу. Под франшизу качают его личный бренд, поедут вместе в Китай. Клиент ждёт, когда Сева назовёт сумму. Пятнадцать единиц контента, сам думал про 200 000.</p>
    <div class="box fix">
      <p class="lbl">Что посоветовал Саша</p>
      <ul>
        <li>Называть 250 000 и потом уступить до 200 000. Место для торга закладывается заранее.</li>
        <li>Жильё и билеты оплачивает клиент, они не входят в гонорар.</li>
        <li>Двести за такой кейс это нормально: поездка, франшиза, федеральная задача.</li>
      </ul>
    </div>
    <p class="note">Севе открыт доступ к «Новому уровню контента». Смотреть пятый уровень про поток спроса, теорию и практику.</p>
  </section>

  <div class="call"><h2>Дальше</h2><p>что делать до следующей встречи</p></div>

  <section id="zadachi">
    <div class="sec-head"><span class="sec-num">14</span><h3 class="t">Задачи участникам</h3></div>
    <div class="scroll">
      <table>
        <tr><th>Кто</th><th>Что</th></tr>
        <tr><td>Азамат</td><td>Посмотреть «Кэш-магнит». Собрать один-два кейса по каркасу: ситуация, процесс, сложности, результат. Сделать про них карусель и рилс. Написать двум клиенткам со сложной историей и созвониться на 20-30 минут с записью. Придумать, что даём за неделю, и собрать мини-оффер. Отправить финальное сообщение всем, кто сказал нет. Посмотреть разбор продажи в боте</td></tr>
        <tr><td>Константин</td><td>Упростить съёмку: без света и вычурности, максимально просто. Снять обзоры чужих роликов в двух вариантах, свой и по правкам Саши. Попробовать заход через середину повествования. Присылать ссылки на новые ролики, пробники Саша не видит</td></tr>
        <tr><td>Даша</td><td>Сегодня написать двум девочкам, которые боялись и зашли, договориться о датах и созвониться с записью. Записать подкаст вокруг главного возражения: страх и безопасность. Посмотреть разбор их созвона в боте</td></tr>
        <tr><td>Сева</td><td>Назвать клиенту цену по Китаю: 250 000 с посадкой до 200 000. Посмотреть пятый уровень про поток спроса. Написать, когда сделка срастётся</td></tr>
      </table>
    </div>
  </section>

  <section id="citaty">
    <div class="sec-head"><span class="sec-num">15</span><h3 class="t">Цитаты под контент</h3></div>
    <ul class="b">
      <li>«Нам нужно вытащить тебя из петли, где каждый созвон превращается в боль»</li>
      <li>«Это радикальный ход. Он направлен не на зарабатывание денег, он направлен на возвращение уверенности»</li>
      <li>«Зачем ей платить тебе деньги, если она соберёт это через нейронку»</li>
      <li>«Здоровье никогда не продаётся через конечный результат. Всегда через боль, через страх, через последствия»</li>
      <li>«Люди узнают себя в проблеме, а не в результатах»</li>
      <li>«Чем больше твой ролик похож на рекламу, тем меньше у тебя будет просмотров»</li>
      <li>«Инста это казино»</li>
      <li>«Нам не нужно ничего делать для того, чтобы мы были пиздатыми. Единственное, что нам нужно, это разрешить себе быть пиздатыми»</li>
      <li>«Они даже не хотят созваниваться. Они хотят тупо ритуал»</li>
      <li>«Ты не можешь зарабатывать только за счёт своего времени и своей энергии»</li>
    </ul>
  </section>

  <p class="foot">Конспект собран по записи созвона 17 августа 2026 года. Таймкоды указаны по записи в кабинете.</p>

</div>
</body>
</html>
`;
