// Конспект личного созвона 2026-09-11. Сгенерирован из
// GSD-BRAND/clients/movlatgirei/lichnoe/2026-09-11/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_MOVLATGIREI_2026_09_11 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон 11 сентября 2026</title>
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
  <p class="kicker">Личный созвон · 11 сентября 2026</p>
  <h1>Ты продаёшь занятие вокалом. А покупать будут «Хозяина голоса»</h1>
  <p class="sub">Разобрали, почему прайс-лист из четырёх строк проигрывает любому,
  кто дешевле, и выбрали сегмент, вокруг которого собираем всё: хоббисты, те самые
  70% твоих денег. Дальше твоя работа: расписать путь текстом. Плюс два контентных
  формата, которые снимаются без подготовки, и база из шестидесяти человек,
  с которой ты ни разу не работал.</p>
  <div class="meta">
    <span>54 минуты</span>
    <span>Сегмент: хобби, 70% выручки</span>
    <span>Программа: «Хозяин голоса»</span>
    <span>До понедельника: текст оффера в группу</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Абонемент это не оффер</a></li>
    <li><a href="#s2">Камера на уроке: контент, который не надо придумывать</a></li>
    <li><a href="#s3">Формат «лады»: пять-шесть роликов за один присест</a></li>
    <li><a href="#s4">Шестьдесят человек, которым ты ни разу не написал</a></li>
    <li><a href="#s5">Концерт 19 сентября как повод</a></li>
    <li><a href="#s6">Три тысячи за занятие</a></li>
    <li><a href="#s7">Прайс-лист против оффера</a></li>
    <li><a href="#s8">Выбираем сегмент: хобби</a></li>
    <li><a href="#s9">Что они на самом деле покупают</a></li>
    <li><a href="#s10">«Хозяин голоса»</a></li>
    <li><a href="#s11">Почему исчезают после прайса</a></li>
    <li><a href="#s12">Задачи</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Контент, который уже происходит</h2>
  <p>Пока собираем оффер, съёмка идёт параллельно и не останавливается</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Абонемент это не оффер</h3>
    <span class="ts">00:00:57</span>
  </div>
  <p><span class="tc">01:11</span> У тебя есть абонементы на четыре, восемь и двенадцать занятий,
  при полной оплате чуть дешевле. Ты сам сказал про это: <span class="q">это занятие вокалом, да,
  просто</span>. Это не оффер, это единица измерения твоего времени.</p>
  <p>Разница на пальцах. Один человек говорит «двенадцать тренировок». Другой говорит
  «помогу похудеть на десять килограмм за девяносто дней». Если моя цель похудеть, я выберу
  второго, потому что он продаёт результат, а первый продаёт часы.</p>
  <blockquote>
    <p>Пока ты продаёшь занятие, тебя всегда побеждает тот, кто дешевле. Сравнивать-то нечего,
    кроме цены за час.</p>
  </blockquote>
  <p class="note">Что важно: твой апсейл уже работает, и его трогать не будем. Порог входа
  низкий, человек заходит на одно занятие, дальше почти все садятся на абонемент.
  Твои слова: <span class="q">может быть, три-четыре человека, кто разово оплачивает,
  а так все остальные по абонементу</span>. Это уже правильно собрано.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Камера на уроке: контент, который не надо придумывать</h3>
    <span class="ts">00:04:46</span>
  </div>
  <p>Ты рассказал про сегодняшний урок с сильной вокалисткой: ты предлагаешь ей свой взгляд,
  другой звук, другой способ спеть фразу, и она говорит <span class="q">о, никогда я так
  не думала, интересно</span>. Тебя прёт, её прёт. Я спросил, снимаешь ли ты это. Ответ:
  <span class="q">редко снимаю, просто привычки нет</span>.</p>
  <p>Вот это и есть твой контент. В музыке магия рождается в процессе, и люди это считывают:
  когда видно, что происходит прямо сейчас, включается совсем другое внимание. Я это поймал
  ещё на улице, когда фристайлил и собирал первые 270 тысяч подписчиков: работает не результат,
  а момент, когда он рождается.</p>
  <div class="box">
    <p class="lbl">Как это выглядит на практике</p>
    <ul>
      <li>Ставишь камеру на каждом уроке. В кадре ты и ученик.</li>
      <li>Распевки и рутина не нужны. Из часа есть два-три куска, где что-то произошло.</li>
      <li>Эти куски идут в сторис, рилсы и в архив, откуда потом берём всегда.</li>
    </ul>
  </div>
  <p class="note">Это не задача на неделю, это привычка. Камера включается вместе со светом
  в студии.</p>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Формат «лады»: пять-шесть роликов за один присест</h3>
    <span class="ts">00:07:03</span>
  </div>
  <p>Референс, который я тебе описал: девушка поёт одну и ту же гамму в разных ладах,
  один за другим, две минуты. Я сидел эти две минуты как заколдованный. Лайков под миллион.
  Тебе такое сделать легко.</p>
  <ul class="b">
    <li><b>Попарно.</b> Классический и арабский. Классический и романский. И так далее.
    Один ролик это два лада.</li>
    <li><b>Потом все четыре.</b> Финальный ролик, где ты проходишь их подряд.</li>
    <li><b>Развитие формата.</b> Не гамма, а известная песня: как она звучала бы в другом ладу.</li>
  </ul>
  <p><span class="tc">15:56</span> Репертуар лучше русский. Если поёшь только на английском,
  в рекомендации пойдёт англоязычная аудитория, а работаешь ты в основном с русской.
  «В лесу родилась ёлочка» или «Спят усталые игрушки» в арабском ладу это готовый Аладдин,
  и это будут пересматривать.</p>
  <p>Без подложки и без музыки, как в референсе. Сначала повторяем то, что уже работает,
  усложнять будем потом.</p>
  <blockquote>
    <p>Рилсы это казино. Не залетело не значит плохо сделано: не то время, не те люди.
    Поэтому не один ролик, а пять-шесть за один заход.</p>
  </blockquote>
</section>

<div class="call">
  <h2>Часть 2. База, о которой ты забыл</h2>
  <p>Самые тёплые деньги лежат у тех, кто уже однажды заплатил</p>
</div>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Шестьдесят человек, которым ты ни разу не написал</h3>
    <span class="ts">00:16:40</span>
  </div>
  <p>База у тебя есть, ты её ведёшь. Сейчас в работе три человека онлайн и двадцать с чем-то
  офлайн, а всего через тебя прошло, по твоей же прикидке, минимум пятьдесят-шестьдесят.
  Вопрос, поддерживаешь ли ты с ушедшими контакт: <span class="q">только если там в соцсетях
  мы можем друг друга лайкнуть</span>.</p>
  <div class="facts">
    <div class="fact"><div class="n">3</div><div class="l">учеников онлайн сейчас</div></div>
    <div class="fact"><div class="n">20+</div><div class="l">учеников офлайн сейчас</div></div>
    <div class="fact"><div class="n">50-60</div><div class="l">прошли через тебя за всё время</div></div>
    <div class="fact"><div class="n">3-5</div><div class="l">новых людей в месяц</div></div>
  </div>
  <p>Человек, который однажды заплатил, это самая горячая аудитория, какая у тебя есть.
  При этом такие вещи люди откладывают бесконечно. Моя жена год назад сказала, что хочет
  на вокал. Дошла ли она? Нет. Не потому что передумала, а потому что идеальный момент
  не наступает сам.</p>
  <blockquote>
    <p>Твоё появление само по себе актуализирует желание. Когда проблема всплывёт,
    они вспомнят тебя, а не кого-то из поиска.</p>
  </blockquote>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Концерт 19 сентября как повод</h3>
    <span class="ts">00:19:37</span>
  </div>
  <p>Я начал рассказывать про знакомого педагога из Лос-Анджелеса, который раз в месяц
  снимал маленький клуб и собирал учеников на показательные выступления. Оказалось,
  у тебя это уже есть: <span class="q">это мы делаем, у нас каждый месяц тусовки проходят</span>.
  Ближайшая 19 сентября.</p>
  <p>Чего нет: ты не зовёшь туда бывших. Текущим проговариваешь на уроках, а тем, кто ушёл,
  лично не пишешь вообще. А это и есть повод написать, который не выглядит как продажа.</p>
  <div class="box">
    <p class="lbl">Что делаешь</p>
    <ol>
      <li>Собираешь всех, кто хоть раз заплатил тебе деньги. Бывших и текущих.</li>
      <li>Пишешь каждому лично: как дела, как с пением, продолжаешь или забросил.</li>
      <li>Зовёшь на тусовку 19 сентября.</li>
    </ol>
  </div>
  <p>Из шестидесяти придут человек двадцать. Они снова попадут в атмосферу, кто-то захочет
  выйти на сцену сам, и несколько человек вернутся к занятиям. Это не разовая акция,
  это система, которую надо гонять постоянно.</p>
</section>

<div class="call">
  <h2>Часть 3. Оффер</h2>
  <p>Один сегмент, одно обещание, один путь</p>
</div>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Три тысячи за занятие</h3>
    <span class="ts">00:23:48</span>
  </div>
  <p>Ты недавно начал брать три тысячи, но таких пока мало: большинство платят около двух,
  по абонементу выходит ещё меньше. При этом к тебе идут студенты вуза, ребята из кавер-бэндов
  и практикующие певцы.</p>
  <blockquote>
    <p>Всё, напродавались. Новым обозначаешь три тысячи.</p>
  </blockquote>
  <p>Логика простая. Человек решает через весы: цена против ценности. Цена это всегда стресс.
  Значит, поднимая цену, надо поднимать и то, что человек видит на второй чаше. Не поднимать
  цену нельзя вообще: инфляция съест, и твой доход будет падать при том же количестве уроков.
  А чтобы ценность росла, нужен оффер, а не прайс.</p>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Прайс-лист против оффера</h3>
    <span class="ts">00:25:40</span>
  </div>
  <p>Ты прислал свой актуальный прайс. Я его вижу так же, как его видит человек из переписки:
  одно занятие, четыре занятия, восемь. Всё. Никакого пути, никакого результата, никакого тебя.</p>
  <p>Что нужно вместо: документ на восемь-десять слайдов, где есть обещание, путь к результату,
  как именно ты работаешь и почему именно так. Ты сказал, что живьём это иногда проговариваешь:
  <span class="q">абонемент фиксирует ваше стабильное время</span>. Но текстом путь не расписан
  нигде, и человек, который не дошёл до урока, про это не узнает.</p>
  <p class="note">Порядок такой: сначала расписываешь текстом, мы докручиваем в чате,
  и только потом собираем из этого презентацию. Как собрать красиво нейронкой, покажу отдельно.</p>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Выбираем сегмент: хобби</h3>
    <span class="ts">00:28:58</span>
  </div>
  <p>У тебя три группы: хоббисты, студенты-вокалисты и практикующие профессионалы.
  По деньгам расклад ты дал сам.</p>
  <div class="scroll">
  <table>
    <tr><th>Сегмент</th><th>Доля выручки</th><th>Что с ним делаем</th></tr>
    <tr><td>Хобби</td><td>около 70%</td><td>берём в работу первым</td></tr>
    <tr><td>Студенты-вокалисты</td><td>остаток</td><td>позже</td></tr>
    <tr><td>Профессионалы</td><td>маленький процент</td><td>позже</td></tr>
  </table>
  </div>
  <p>По кайфу тебе как раз профи: сегодняшняя вокалистка, где не надо объяснять базу и вы
  работаете над мелизмами и украшениями. Это остаётся, никуда не девается. Но контент и оффер
  строим вокруг тех, кто приносит деньги сейчас. Когда эта ветка заработает как часы,
  переходим к следующей.</p>
  <blockquote>
    <p>Когда мы для всех, мы ни для кого.</p>
  </blockquote>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Что они на самом деле покупают</h3>
    <span class="ts">00:32:13</span>
  </div>
  <p>Твои же формулировки, как люди приходят и что говорят:</p>
  <ul class="b">
    <li>хочу лучше контролировать голос</li>
    <li>побороть неуверенность на сцене</li>
    <li>хочу лучше петь в караоке</li>
    <li>нужна сценическая практика</li>
    <li>голос звучит слабо и вяло</li>
    <li>я ору, а не пою</li>
    <li>голос быстро устаёт</li>
    <li>самовыражение</li>
  </ul>
  <p>Это один и тот же человек, описанный с разных сторон. Половина пунктов про механику,
  половина про то, что случится, когда механика встанет на место.</p>
  <p><span class="tc">37:53</span> И ещё важное про то, кому это продаётся. Мой друг из Самары,
  35 лет, двое детей, предприниматель, в 33 записался на хип-хоп и четвёртый год танцует
  на баттлах. Запрос там был не «научиться танцевать», а старое нереализованное желание,
  на которое когда-то пришлось забить. Твоя ученица-айтишница, которая с детства мечтала петь
  и после концерта с группой сказала, что всю жизнь мечтала так сделать, это ровно тот же
  человек. Вот про них и надо говорить в контенте: какие задачи вокал решает на самом деле,
  что он лечит, почему в сорок не поздно.</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">«Хозяин голоса»</h3>
    <span class="ts">00:40:28</span>
  </div>
  <p>Нейронка предложила «голос начинает вас слушаться». Слушаются хозяина. Отсюда название
  твоей авторской программы.</p>
  <div class="box fix">
    <p class="lbl">Авторская методика «Хозяин голоса»</p>
    <p>Через два месяца вы поёте час и голос не садится. Берёте верх, не переходя на крик.
    Выходите к микрофону не гадая, получится сегодня или нет, потому что знаете, как ваш
    голос устроен и как им владеть. Вы становитесь хозяином своего голоса, а значит
    и того, что происходит вокруг вас.</p>
  </div>
  <p>Названная методика звучит дороже, чем «занятие вокалом», ещё до того, как человек
  увидел цену. Твоя реакция: <span class="q">прикольно, интересно, мне нравится</span>.
  Формулировку я скину отдельно текстом.</p>
  <p class="note">Дальше нужен путь. Не список услуг, а описание процесса: что происходит
  на входе, что в первый месяц, как человек понимает, что двигается, чем заканчивается.
  Это ты пишешь сам, потому что процесс твой, и никто кроме тебя его не знает.</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Почему исчезают после прайса</h3>
    <span class="ts">00:44:50</span>
  </div>
  <p>Свежий случай: девушка написала, что тебя посоветовали, ты отправил прайс и всё,
  молчание. Потом ты написал ей ещё раз про расписание, она даже не прочитала.</p>
  <p>Две причины, обе чинятся.</p>
  <ul class="b">
    <li><b>Она пришла за услугой, а не к тебе.</b> В такой позиции на рынке всегда побеждает
    тот, кто дешевле. Лечится тем, что везде звучит твоя философия, твой подход и твой результат.
    Чтобы человек хотел не «на вокал», а конкретно к тебе.</li>
    <li><b>Диалог начинается с цены.</b> Лечится анкетой: сначала человек заполняет,
    потом вы разговариваете. Аргумент честный: работы много, беру не всех, сначала анкета.</li>
  </ul>
  <p>Анкета даёт тебе данные до разговора: что человек хочет, какой у него опыт, чем занимается.
  Про доход в твоей нише спрашивать не стоит, а вот вид деятельности и профессия скажут
  то же самое. Делается за полчаса в Яндекс Формах, образец у меня в шапке профиля,
  выпендриваться со слайдерами не нужно.</p>
  <p class="note">Отдельно на будущее: короткое видео на пять-десять минут, которое человек
  смотрит до или после анкеты, где ты раскрываешь подход. Тогда в диалог он приходит уже тёплым.
  Это не сейчас, это когда встанет оффер.</p>
  <p><span class="tc">48:54</span> И ещё. Про свои услуги в контенте ты не говоришь почти никогда,
  в каруселях начал недавно, а формата «в этом месяце беру четыре человека» не делал ни разу.
  При 955 подписчиках это прямо потерянные заявки.</p>
</section>

<div class="call">
  <h2>Часть 4. Что дальше</h2>
  <p>До понедельника, чтобы на групповом созвоне было что разбирать</p>
</div>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Задачи</h3>
    <span class="ts">00:52:22</span>
  </div>
  <div class="box">
    <p class="lbl">За тобой</p>
    <ul>
      <li><b>Расписать текстом оффер «Хозяин голоса»:</b> обещание, путь по этапам, что происходит
      на каждом, для кого это. Отправить в группу «Коннекторы», докрутим там.</li>
      <li><b>Написать всей базе.</b> Всем, кто хоть раз платил: бывшим и текущим. Лично, каждому:
      как дела, как с пением. И пригласить на тусовку 19 сентября.</li>
      <li><b>Снять 5-6 роликов в формате «лады».</b> Сначала попарно, потом все четыре подряд.
      Дальше известная русская песня в другом ладу.</li>
      <li><b>Включать камеру на уроках.</b> Каждый урок, ты и ученик в кадре. Ничего не готовить заранее.</li>
      <li><b>Новым называть три тысячи</b> за занятие.</li>
      <li><b>Сделать анкету</b> в Яндекс Формах по образцу из моей шапки профиля. Отправлять её
      до прайса, а не после.</li>
      <li><b>Карусели продолжать</b>, с рельсов не слетаем. Только теперь вокруг смыслов
      хобби-сегмента.</li>
      <li><b>Прийти на групповой созвон в понедельник.</b> 17:00 или 19:00 по Москве, можно на оба.</li>
    </ul>
  </div>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Скинуть ссылку на группу «Коннекторы»: до тебя она не дошла, это наша авария.</li>
      <li>Прислать формулировку «Хозяин голоса» текстом.</li>
      <li>Разобрать твой оффер, когда пришлёшь, и докрутить обещание и цену.</li>
      <li>Показать, как собрать из утверждённого текста презентацию нейронкой.</li>
    </ul>
  </div>
  <p class="note">Профи и студентов пока не трогаем, хотя работать с ними тебе кайфовее.
  Разберёмся с хобби, дальше пойдёт быстрее. Я на связи в чате, если что, пиши.</p>
</section>

<div class="foot">
  Личный созвон 11 сентября 2026, 54 минуты.
</div>

</div>
</body>
</html>
`;
