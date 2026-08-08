// Статья урока «06-uroven-5» курса «Новый Уровень Контента».
// СГЕНЕРИРОВАНО: GSD-BRAND/scripts/kurs-to-ts.mjs 06 — руками не править,
// править исходник kurs/06-uroven-5.html и перегенерировать.

export const UROVEN_5_06 = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Времени хватает, а отклика нет · Новый уровень контента</title>
<style>
/* ============================================================
   НОВЫЙ УРОВЕНЬ КОНТЕНТА — статьи уровней.
   Системный стиль, как в algoritm-sistema.html: Times, колонка 620,
   оранжевый акцент, жёсткие рамки, offset-тени, Courier-лейблы.
   ============================================================ */
:root{
  --accent:#e8590c;
  --marker:#ffb239;
  --done:#2f9e44;
  --miss:#c0392b;
}
*{box-sizing:border-box;}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;text-size-adjust:100%;}
html,body{max-width:100%;overflow-x:hidden;}
body{margin:0;background:#fff;color:#000;font-size:20px;line-height:1.62;}
body,body *,body *::before,body *::after{font-family:"Times New Roman",Times,serif;}
a{color:var(--accent);text-decoration:underline;}
a:hover{color:#000;}
.ac,.em{color:var(--accent);}
.muted{color:#666;}

/* прогресс чтения */
#progress{position:fixed;top:0;left:0;height:3px;width:0;background:var(--accent);z-index:50;transition:width .1s linear;}

/* навбар */
.nav{border-bottom:1px solid #ccc;}
.navInner{max-width:720px;margin:0 auto;padding:14px 24px;display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap;}
.brand{font-weight:bold;font-size:18px;color:#000;text-decoration:none;}
.navLinks{display:flex;gap:16px;flex-wrap:wrap;font-size:14px;}
.navLink{color:var(--accent);text-decoration:underline;}
.navLink:hover{color:#000;}

/* шапка уровня */
.arthead{border-bottom:1px solid #ccc;}
.ahin{max-width:620px;margin:0 auto;padding:40px 24px 30px;}
.backlink{display:inline-block;font-size:14px;color:#666;text-decoration:none;margin-bottom:20px;}
.backlink:hover{color:#000;}
.lvlbadge{display:inline-block;font-family:"Courier New",Courier,monospace;font-size:12px;letter-spacing:.14em;
  text-transform:uppercase;color:#fff;background:var(--accent);padding:5px 10px;margin-bottom:16px;font-weight:bold;}
.arthead h1{font-size:2.4em;font-weight:bold;line-height:1.13;margin:0 0 16px;}
.arthead .dek{font-size:1.1em;color:#444;line-height:1.5;margin:0 0 22px;max-width:60ch;}
.taskline{border:1px solid #000;border-left:4px solid var(--accent);background:#fffaf2;padding:12px 16px;font-size:16px;line-height:1.45;}
.taskline b{color:var(--accent);}

/* контейнер и секции */
.wrap{max-width:620px;width:100%;margin:0 auto;padding:0 24px;}
section{padding:38px 0;border-bottom:1px dashed #ccc;}
section:last-of-type{border-bottom:none;}
.slabel{display:inline-block;font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:var(--accent);font-weight:bold;margin-bottom:12px;}

/* типографика */
h2{font-size:1.6em;font-weight:bold;line-height:1.18;margin:0 0 10px;}
h3{font-size:1.2em;font-weight:bold;line-height:1.25;margin:22px 0 6px;}
h4{font-size:1.05em;font-weight:bold;margin:18px 0 4px;}
p{margin:0 0 14px;}
.lead{font-size:1.15em;line-height:1.45;font-weight:bold;}
.punch{font-size:1.5em;font-weight:bold;line-height:1.2;margin:26px 0;}
ul,ol{margin:0 0 16px;padding-left:24px;}
li{margin:0 0 6px;}
blockquote{margin:24px 0;padding:8px 0 8px 18px;border-left:3px solid var(--accent);color:#333;}
blockquote p{margin:0 0 6px;font-size:1.05em;line-height:1.42;}
blockquote p:last-child{margin-bottom:0;}
img{max-width:100%;height:auto;display:block;margin:20px auto;border:1px solid #ddd;}
figure{margin:24px 0;}
figcaption{font-size:14px;color:#666;text-align:center;margin-top:8px;}

/* карточки и врезки */
.callout{border:1px solid #000;background:#fafafa;padding:20px 22px;margin:20px 0;}
.callout .ct{font-family:"Courier New",Courier,monospace;font-size:12px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--accent);font-weight:bold;margin-bottom:8px;}
.warnbox{border:1px solid var(--accent);background:#fffaf2;padding:16px 18px;margin:20px 0;font-size:16px;line-height:1.45;}
.tbl{width:100%;border-collapse:collapse;font-size:16px;margin:20px 0;}
.tbl th,.tbl td{border:1px solid #ccc;padding:9px 11px;text-align:left;vertical-align:top;}
.tbl th{background:#f5f2f0;font-size:13px;text-transform:uppercase;letter-spacing:.08em;}
.tbl td.yes{color:var(--done);font-weight:bold;}
.tbl td.no{color:var(--miss);font-weight:bold;}
.tbl-scroll{overflow-x:auto;}
/* скриншоты внутри таблицы — сравнение «оригинал / мой заход» */
.tbl td img{margin:0;border:1px solid #ddd;max-width:100%;}
.tbl td:has(img){padding:8px;}
.tbl td a{font-size:13px;word-break:break-all;}

/* задача и маркер уровня */
.taskbox{border:2px solid #000;box-shadow:5px 5px 0 var(--accent);padding:22px 24px;margin:26px 0;}
.taskbox .tt{font-family:"Courier New",Courier,monospace;font-size:12px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--accent);font-weight:bold;margin-bottom:10px;}
.markerbox{border:1px solid #000;background:#f4fbf5;border-left:4px solid var(--done);padding:16px 18px;margin:22px 0;}
.markerbox .tt{font-family:"Courier New",Courier,monospace;font-size:12px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--done);font-weight:bold;margin-bottom:6px;}

/* пометки для Саши: [визуал: ...] и [ждёт ...] */
.todo{display:none;font-family:"Courier New",Courier,monospace;font-size:13px;line-height:1.4;
  color:#b45309;background:#fffbeb;border:1px dashed #f59e0b;padding:8px 12px;margin:14px 0;}
body.rev .todo{display:block;}

/* нижняя навигация между уровнями */
.lvlnav{display:flex;gap:14px;justify-content:space-between;padding:34px 0 60px;flex-wrap:wrap;}
.lvlnav a{flex:1;min-width:220px;border:1px solid #000;padding:14px 16px;text-decoration:none;color:#000;background:#fff;}
.lvlnav a:hover{background:#fffaf2;border-color:var(--accent);}
.lvlnav a .k{display:block;font-family:"Courier New",Courier,monospace;font-size:11px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--accent);margin-bottom:4px;}
.lvlnav a .n{font-weight:bold;font-size:17px;line-height:1.25;}
.lvlnav a.next{text-align:right;}

/* оглавление + процент */
.readnav{position:fixed;right:20px;bottom:20px;z-index:45;display:flex;flex-direction:column;align-items:flex-end;gap:10px;}
.readnav .toc{display:none;background:#fff;border:2px solid #000;box-shadow:4px 4px 0 rgba(0,0,0,.18);
  padding:12px 14px;max-width:260px;max-height:56vh;overflow-y:auto;font-size:14px;line-height:1.35;}
.readnav.open .toc{display:block;}
.readnav .toc a{display:block;color:#333;text-decoration:none;padding:4px 0;border-bottom:1px solid #eee;}
.readnav .toc a:last-child{border-bottom:none;}
.readnav .toc a.on{color:var(--accent);font-weight:bold;}
.readnav .toc a.sub{padding-left:12px;font-size:13px;color:#666;}
.readnav-btns{display:flex;align-items:center;gap:10px;}
.readnav .rbtn{width:44px;height:44px;background:#fff;border:2px solid #000;box-shadow:3px 3px 0 rgba(0,0,0,.18);
  display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;padding:0;}
.readnav .rbtn:hover{border-color:var(--accent);color:var(--accent);}
.readnav .pct{position:relative;width:46px;height:46px;}
.readnav .pct svg{transform:rotate(-90deg);}
.readnav .pct span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-family:"Courier New",Courier,monospace;font-size:12px;font-weight:bold;}
@media(max-width:560px){.readnav{right:12px;bottom:12px;}.readnav .toc{max-width:200px;}}

/* CTA */
.softcta{border:1px solid #000;border-left:4px solid var(--accent);background:#fffaf2;padding:16px 18px;margin:26px 0;
  display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
.softcta .sct{flex:1;min-width:200px;font-size:16px;line-height:1.45;}
.softcta .sct b{color:var(--accent);}
.bevel{display:inline-block;background:var(--accent);color:#fff;text-decoration:none;font-weight:bold;
  padding:11px 18px;border:2px solid #000;box-shadow:4px 4px 0 #000;font-size:16px;}
.bevel:hover{background:#000;color:#fff;box-shadow:4px 4px 0 var(--accent);}

/* интерактивы — общая рамка */
.ix{border:2px solid #000;background:#fff;padding:20px 22px;margin:26px 0;box-shadow:5px 5px 0 rgba(0,0,0,.1);}
.ix .ixt{font-family:"Courier New",Courier,monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--accent);font-weight:bold;margin-bottom:12px;}
.ix .ixh{font-size:1.15em;font-weight:bold;line-height:1.25;margin-bottom:14px;}
.ix .ixhint{font-size:14px;color:#666;margin-top:12px;font-style:italic;}
.ixbtn{border:1px solid #000;background:#fff;padding:9px 14px;font-size:15px;cursor:pointer;font-family:inherit;}
.ixbtn:hover{border-color:var(--accent);color:var(--accent);}
.ixbtn.on{background:var(--accent);border-color:#000;color:#fff;}
.ix .k{display:block;font-family:"Courier New",Courier,monospace;font-size:11px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--accent);font-weight:bold;margin:12px 0 4px;}
.ix .ok{color:var(--done);} .ix .bad{color:var(--miss);}
.ix p{font-size:16px;line-height:1.45;margin:0 0 8px;}

/* диагностика */
.dg{display:flex;flex-direction:column;gap:7px;}
.dgr{display:flex;align-items:center;gap:14px;border:1px solid #ccc;background:#fff;padding:11px 14px;
  cursor:pointer;text-align:left;font-family:inherit;font-size:16px;}
.dgr:hover{border-color:var(--accent);}
.dgr.on{border-color:var(--accent);background:#fffaf2;}
.dgr b{color:var(--accent);font-size:19px;min-width:18px;}
.dgout{margin-top:16px;border-top:1px solid #ddd;padding-top:14px;font-size:16px;line-height:1.45;min-height:52px;}

/* замки */
.lk{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
@media(max-width:560px){.lk{grid-template-columns:repeat(2,1fr);}}
.lki{border:1px solid #ccc;background:#fff;padding:12px 10px;cursor:pointer;text-align:left;font-family:inherit;}
.lki:hover{border-color:var(--accent);}
.lki.on{border-color:var(--accent);background:#fffaf2;}
.lki .ic{display:block;font-size:22px;line-height:1;}
.lki .nm{display:block;font-size:15px;font-weight:bold;margin-top:6px;line-height:1.2;}
.lkout{margin-top:16px;border-top:1px solid #ddd;padding-top:14px;font-size:16px;line-height:1.45;min-height:70px;}

/* долина */
.vly{width:100%;height:auto;display:block;margin:6px 0;}
.vly .vp{cursor:pointer;}
.vly .vp.on circle{fill:var(--accent);r:15;}
.vly .vp.on text{fill:#000;}
.vlyout{margin-top:10px;border-top:1px solid #ddd;padding-top:14px;font-size:16px;line-height:1.45;min-height:60px;}

/* причины */
.cz{display:flex;flex-direction:column;gap:7px;}
.czi{display:flex;justify-content:space-between;align-items:center;gap:14px;border:1px solid #ccc;background:#fff;
  padding:11px 14px;cursor:pointer;text-align:left;font-family:inherit;font-size:16px;}
.czi:hover{border-color:var(--accent);}
.czi.on{border-color:var(--accent);background:#fffaf2;}
.czi .t{font-weight:bold;}
.czi .g{font-size:13px;color:var(--accent);white-space:nowrap;}
.czout{margin-top:16px;border-top:1px solid #ddd;padding-top:14px;font-size:16px;line-height:1.45;min-height:44px;}

/* ручка громкости */
.kn{display:flex;gap:22px;align-items:center;flex-wrap:wrap;}
.knd{flex:0 0 180px;} .knd svg{width:180px;height:180px;}
.kns{flex:1;min-width:240px;}
.knm{display:flex;gap:8px;margin-bottom:14px;}
.knt{font-size:16px;line-height:1.45;min-height:66px;}
.knc{display:flex;gap:8px;margin-top:8px;}
.knw{color:var(--miss);font-weight:bold;font-size:15px;margin-top:10px;min-height:20px;}

/* калькулятор */
.cl label{display:flex;align-items:center;gap:12px;font-size:16px;margin-bottom:12px;flex-wrap:wrap;}
.cl input[type=range]{flex:1;min-width:180px;accent-color:#e8590c;}
.cl label b{color:var(--accent);min-width:60px;text-align:right;}
.clres{display:flex;gap:24px;border-top:1px solid #ddd;padding-top:16px;margin-top:6px;flex-wrap:wrap;}
.clres > div{flex:1;min-width:180px;}
.clres .k{margin:0 0 4px;}
.clres b{display:block;font-size:32px;line-height:1.1;}
.clres .s{display:block;font-size:14px;color:#666;margin-top:4px;}

/* докрутка */
.tb{display:flex;flex-wrap:wrap;gap:7px;}
.tbi{border:1px solid #ccc;background:#fff;padding:9px 13px;cursor:pointer;font-family:inherit;font-size:15px;font-weight:bold;}
.tbi:hover{border-color:var(--accent);}
.tbi.on{border-color:var(--accent);background:#fffaf2;}
.tbout{margin-top:16px;border-top:1px solid #ddd;padding-top:14px;font-size:16px;line-height:1.45;min-height:70px;}

/* формула */
.un{display:flex;gap:10px;flex-wrap:wrap;}
.uni{flex:1;min-width:170px;border:2px solid #000;padding:13px 14px;transition:.2s;}
.uni.off{opacity:.22;border-style:dashed;}
.uni b{display:block;font-size:16px;margin:4px 0 6px;}
.uni p{font-size:14px;color:#555;line-height:1.35;}
.unout{margin-top:16px;border-top:1px solid #ddd;padding-top:14px;font-size:16px;line-height:1.45;min-height:44px;}

/* переупаковка */
.rp{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;}
@media(max-width:560px){.rp{grid-template-columns:1fr;}}
.rpi{border:1px dashed #ccc;background:#fff;padding:10px 13px;cursor:pointer;font-family:inherit;font-size:15px;color:#888;text-align:left;}
.rpi:hover{border-color:var(--accent);}
.rpi.on{border-style:solid;border-color:var(--accent);background:#fffaf2;color:#000;font-weight:bold;}
.rpout{margin-top:16px;border-top:1px solid #ddd;padding-top:14px;font-size:18px;}
.rpout b{font-size:28px;color:var(--accent);}

/* карта пути */
.pth{display:flex;flex-direction:column-reverse;gap:6px;}
.pti{display:flex;align-items:center;gap:12px;border:1px solid #ccc;background:#fff;padding:10px 13px;
  cursor:pointer;text-align:left;font-family:inherit;font-size:15px;}
.pti:hover{border-color:var(--accent);}
.pti.done{border-color:var(--done);background:#f4fbf5;}
.pti .n{font-weight:bold;color:var(--accent);min-width:16px;}
.pti.done .n{color:var(--done);}
.pti .t{font-weight:bold;min-width:150px;}
.pti .g{flex:1;font-size:13px;color:#666;}
.pti .ck{opacity:0;color:var(--done);font-weight:bold;}
.pti.done .ck{opacity:1;}
.pthout{margin-top:16px;border-top:1px solid #ddd;padding-top:14px;font-size:16px;min-height:30px;}

/* весы */
.sc{display:flex;height:46px;border:2px solid #000;overflow:hidden;}
.scl{background:var(--accent);color:#fff;width:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;transition:.3s;}
.scr{background:#000;color:#fff;width:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;transition:.3s;}
.scc{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;}
.scout{margin-top:16px;font-size:16px;line-height:1.45;min-height:44px;}

/* карусель иллюстраций (%%carousel%% в markdown) */
.kcar{margin:26px 0;border:1px solid #ddd;background:#fff;padding:18px 18px 14px;}
.kcfrs{position:relative;cursor:pointer;}
.kcfr{margin:0;display:none;}
.kcfr.on{display:block;}
.kcfr img{width:100%;display:block;border:1px solid #eee;margin:0;}
.kcfr figcaption{margin-top:14px;min-height:76px;}
.kcfr figcaption b{display:block;font-size:1.05em;margin-bottom:5px;}
.kcfr figcaption span{display:block;font-size:.95em;line-height:1.5;color:#444;}
.kcbar{display:flex;align-items:center;gap:14px;margin-top:12px;border-top:1px solid #eee;padding-top:12px;}
.kcarrow{width:34px;height:34px;border:1px solid #bbb;background:#fff;cursor:pointer;font-size:18px;
  line-height:1;font-family:inherit;color:#000;padding:0;}
.kcarrow:hover:not(:disabled){background:#000;color:#fff;border-color:#000;}
.kcarrow:disabled{opacity:.28;cursor:default;}
.kcdots{display:flex;gap:7px;}
.kcdot{width:9px;height:9px;padding:0;border:1px solid #000;background:#fff;cursor:pointer;}
.kcdot.on{background:var(--accent);border-color:var(--accent);}
.kccnt{margin-left:auto;font-family:"Courier New",Courier,monospace;font-size:12px;color:#888;}

</style>
</head>
<body>
<div id="progress"></div>

<header class="arthead"><div class="ahin">
  <div class="lvlbadge">Уровень 5</div>
  <h1>Времени хватает, а отклика нет</h1>
  <p class="dek">Вы выкладываете спокойно и регулярно, а в ответ тишина. Самый большой уровень курса.</p>
  <div class="taskline"><b>Задача:</b> Начать получать отклик. Не джекпот, а промежуточные результаты.</div>
</div></header>

<!--VIDEO_SLOT-->


<main class="wrap">
<section>
<p>Сразу предупреждение для тех, кто прыгнул сюда через предыдущие уровни</p>
<p>Если вы пришли только за цифрами, это ваша ответственность. С вероятностью 99% вас ждет разочарование: даже если цифры получатся, повторить вы их не сможете, а дальше бросите</p>
<p>Я не просто так выстроил эту систему по уровням</p>
<p>Представьте: вам дают бесконечное количество кубиков и 20 секунд, чтобы построить самую высокую башню</p>
<p>Вы будете складывать их друг на друга столбиком. И любое дуновение ветра эту башню роняет, а собирать придется с нуля</p>
<p>А если вам дают год - вы будете строить совсем по-другому. Широкое основание, и потом вверх</p>
<p>Мы здесь собрались для игры в долгую и ради результатов, которые держатся</p>
<p>Итак, вы дошли до места, где процесс уже собран</p>
<p>Вы делаете контент, он вас не бесит и не отнимает много времени</p>
<p>Вы выкладываете спокойно и регулярно</p>
<p>А в ответ тишина</p>
<p>Просмотров нет, комментариев нет, клиентов нет</p>
<p>И вот здесь опускаются руки у большинства - потому что непонятно, что еще делать</p>
<p>Ведь вы уже сделали все, что от вас просили: начали, не бросили, перестали себя мучить, ускорились</p>
<p>Задача этого уровня - начать получать отклик</p>
<p>Но не джекпот, а <strong>промежуточные результаты</strong></p>
<p>Ролики, которые идут выше среднего</p>
<p>Комментарии в духе "блин, наконец-то кто-то это сказал"</p>
<p>Первые заявки и первые люди, которые приходят и говорят: я вас смотрю</p>
<p>Вы проходите этот уровень, когда контент начинает попадать - пусть не каждый раз, но регулярно</p>
<p>И вы понимаете, почему он попал, и можете это повторить</p>
</section>
<section>
<h2>Чем опасно застрять здесь</h2>
<p>Ловушка здесь одна, и в нее падают почти все</p>
<p>Человек получает промежуточный результат - и не замечает его</p>
<p>Было 200 просмотров, стало 1 500</p>
<p>Пришло два комментария от живых людей</p>
<p>Это и есть сигнал, что направление верное</p>
<p>Но человек ждал 100 000, поэтому решает, что "не сработало", и меняет все подряд</p>
<p>Тем более что выложенный контент - уже победа</p>
<h3>Мой путь до 40к</h3>
<p>Перед тем как я набрал 40 000 подписчиков, я прошел вот такой путь</p>
<p>И я общался с коллегами-рилсмейкерами: у всех он был примерно такой же</p>
<p>Начал с четырех форматов: говорящая голова, диалог со стримами и интервью, сценки и сторителл</p>
<p>Я подошел к этому как к лаборатории. Не гадал, что зайдет, а просто взял четыре формата и протестировал</p>
<img src="/kurs/assets/l5-formaty-4.jpg" alt="">
<p>У меня на тот момент было 200 подписчиков, а просмотры, которые вы видите под кадрами, накапали за три года, что эти ролики висят</p>
<p>Что вышло с каждым:</p>
<ul><li><strong>говорящая голова</strong> - отпала, потому что я долго монтировал (хотя и там были промежуточные результаты)</li><li><strong>стрим, интервью, диалог</strong> - отпали, потому что я кринжово себя чувствовал: я разговаривал сам с собой</li><li><strong>сторителл</strong> - работал, один ролик набрал 30 000, но делать его было долго</li><li><strong>сценки</strong> - быстро, прикольно, и они стабильно набирали по 1 500 - 3 000 просмотров</li></ul>
<p>И я решил: буду делать сценки</p>
<p>Потому что они:</p>
<ul><li>делаются быстро (время)</li><li>мне прикольно (не вызывают сопротивления)</li><li>дают промежуточные результаты</li></ul>
<p>Дальше я начал докручивать:</p>
<ul><li>у меня было три персонажа - я упростил до двух, чтобы людям было понятнее</li><li>у меня не было фишки - я начал озвучивать себя</li><li>я не брал то, что работает - и начал брать англоязычные ролики и адаптировать их в свои сценки</li></ul>
<p>Через неделю, где-то на 7-8 ролик, рилс полетел</p>
<p>И самое важное: я не хотел его выкладывать</p>
<p>Он казался мне длинным, странным и стремным</p>
<p>Вспоминаем прошлый уровень: мы не оцениваем свой контент. Если бы я его тогда оценивал, я бы его не выложил. А если бы не выложил, у меня не было бы того, что есть сейчас</p>
<p>Но у меня было святое правило</p>
<p class="punch">Если я снял - я доделываю. Если я сделал - я выкладываю</p>
<p>Именно этот рилс привел в аккаунт первые 20 тысяч человек, а дальше формат добрал до сорока</p>
<p>[Полный разбор этой истории](<a href="https://youtu.be/EZEccsXv0Aw" target="_blank" rel="noopener">https://youtu.be/EZEccsXv0Aw</a>) есть у меня на YouTube. Там на примере одного ролика разложена вся логика целиком</p>
<p>Вывод, ради которого я это рассказал: промежуточные результаты - это сигналы</p>
<p>Сигналы, что мы показываемся на новую аудиторию и что люди это смотрят, и им интересно</p>
<p>Самая большая ошибка людей, которые создают контент - пропускать шаг с промежуточными результатами</p>
<p>И сразу договоримся, что считать промежуточным результатом: это количество просмотров выше вашего обычного среднего</p>
<p>То есть если у вас 200 подписчиков, то 1 500 - 3 000 просмотров - это уже он</p>
<p>Схема простая: начать делать контент, поймать промежуточные результаты, докручивать и бить в эти точки</p>
<p>Большие цифры придут</p>
</section>
<section>
<h2>Важно: здесь меняются правила</h2>
<p>Четыре уровня я говорил вам одно и то же</p>
<p>Не смотрите на цифры</p>
<p>Не оценивайте себя через них</p>
<p>Критерий один - вы выложили</p>
<p>С этого уровня правило меняется: <strong>теперь мы на цифры смотрим</strong></p>
<p>И я объясню, почему это не противоречие</p>
<p>Раньше цифры были для вас оценкой</p>
<p>Вы смотрели на просмотры и делали вывод о себе: хороший я или плохой, есть у меня талант или нет</p>
<p>В таком режиме цифры вредны, потому что они рандомные, а вы делаете из рандома приговор себе</p>
<p>Теперь цифры становятся <strong>информацией</strong></p>
<p>Не «мало просмотров, значит я бездарь», а «мало просмотров, значит слабое начало, надо переделать первые три секунды»</p>
<p>Это разные вещи, хотя цифра одна и та же</p>
<p>Разница в том, что вы с ней делаете: страдаете или чините</p>
<p>Поэтому переходить сюда можно только после четвертого уровня</p>
<p>Пока контент бесит и жрет время, любая цифра автоматически читается как оценка, и вы просто получите новый повод себя мучить</p>
<p class="punch">Как это выглядит на практике:</p>
<ul><li>смотрим не после каждой публикации, а раз в одну-две недели пачкой</li><li>смотрим не на одну единицу, а на серию: у одной единицы цифры это лотерея, у десяти уже видна закономерность</li><li>сравниваем не с чужими аккаунтами, а со своим собственным средним</li></ul>
<p>Все остальное в этом уровне держится на этом переключателе</p>
<p>Если вы продолжите читать цифры как оценку, ни докрутка, ни метод гипотез работать не будут</p>
</section>
<section>
<h2>1. Сначала про эго, потому что здесь оно ломает больше всего людей</h2>
<p>На этом уровне вам придется делать неприятную вещь</p>
<p>Смотреть на то, что уже работает у других, и использовать это</p>
<p>И вот тут эго встает на задние лапы</p>
<p>Мир не такой уж и сложный на самом деле - сложным делаем его мы</p>
<p>Наше эго, которое по тем или иным причинам не хочет использовать то, что работает и дает результаты</p>
<p>Нам хочется быть особенными</p>
<p>Нам хочется быть героями и выстрадать свои победы</p>
<p>Нам хочется вечно чего-то нового и сакрального</p>
<p>Но рабочие инструменты до банальности простые</p>
<p>Все те люди, которых вы смотрите, набирают просмотры и аудиторию не потому, что они самые талантливые, умные или хитрые</p>
<p>Они делают простые вещи. Они берут то, что работает</p>
<p>Второй способ, которым эго сюда лезет - через отказ закрывать спрос аудитории</p>
<p>Смотрите, как это выглядит</p>
<p>Аудитория хочет быстро похудеть</p>
<p>А тренер говорит: "я не могу про это рассказывать, это сложно, больно и вообще неправильно"</p>
<p>Но они этого хотят</p>
<p>И у вас есть варианты:</p>
<ul><li>не использовать это вообще и сидеть лапу сосать</li><li>зайти в тот же спрос со <strong>своим</strong> тезисом: развалить миф про быстрое похудение, дать антипозицию, обыграть юмором, утрировать</li></ul>
<p>Никто не заставляет вас говорить чужое</p>
<p>Но игнорировать то, что людей волнует, - значит остаться незамеченным</p>
<p>И задайте себе честный вопрос: вы хотите результатов или повыёбываться?</p>
<p>Давайте сначала сделаем результаты, а повыёбываться успеете потом</p>
</section>
<section>
<h2>2. Разворот камеры</h2>
<p>Это главный переход этого уровня</p>
<p>От "что я хочу сказать" - к "что человек хочет услышать"</p>
<p>Это, кстати, вторая половина слова "личный <strong>бренд</strong>"</p>
<p>В чем разрыв: у вас в голове методология, а у человека - конкретная боль из жизни</p>
<p>Вы говорите "нужно выстроить систему контента, которая учитывает поток спроса"</p>
<p>А он думает "я делаю ролики, и их никто не смотрит"</p>
<p>Заходить надо со стороны его боли, а до своей глубины доводить потом</p>
<blockquote><p>В 99% случаев тренер снимает ролики про упражнения в спортзале: про трапециевидные мышцы и как правильно разгибать руки</p><p>Привлекать это будет минимальное количество людей, а смотреть - такие же фанаты</p><p>И если вы думаете "ну это же очевидно" - я на 100% скажу, что мы очень часто скатываемся в такую же чушь</p><p>Это нормально: мы любим свое дело</p><p>Но важно не забывать, зачем мы это делаем</p></blockquote>
<p>У меня есть фраза, которую я включил в свою Библию Контента:</p>
<p class="punch">не разговаривай с орками на эльфийском, они не поймут</p>
<p>Мы все профессионально деформированы и большую часть времени разговариваем с аудиторией на непонятном ей языке</p>
<p>Так делает большинство - поэтому их и не замечают, они непонятны</p>
<blockquote><p>Нара - реанимировали "мертвый" блог на 5 000 подписчиков</p><p>в июне Нара взяла у меня консультацию</p><p>она снимала полезные видео по продвижению в Инстаграме на английском языке</p><p>делала очень много, тратила на это большую часть времени, а результатов не было</p><p>я спросил ее: а в Армении вообще смотрят рилсы, много ли людей рассказывает про это на армянском? она сказала - нет</p><p>и я предложил ей радикальное изменение: сменить английский язык на армянский</p><p>гипотеза была такая: она находится в Армении, значит контент с большей вероятностью будет показываться там, а на армянском про это почти никто не говорит</p><p>она удивилась и сначала отнеслась к этому с недоверием</p><p>мы прописали план, я показал приемы и техники, и разошлись</p><p>через два месяца я узнал, как у нее дела - блог ожил</p><p>она была непонятна тем, кто ее смотрел</p><p>а как только начала говорить с людьми на их языке - контент заработал</p></blockquote>
<img src="/kurs/assets/nara-otzyv.jpg" alt="">
<p>Ее словами: начала активно вести блог на армянском с мая, сейчас 3 500 подписчиков, несколько рилс залетели на 300к, 180к и 280к, остальные больше 10к</p>
<p>И главное: новая работа и несколько предложений на сотрудничество</p>
<p>И магия здесь происходит на пересечении двух вещей</p>
<p>Того, во что вы верите (это мы собрали на третьем уровне)</p>
<p>И того, что хотят люди (это мы собираем здесь)</p>
<p>Только на пересечении - ни там, ни там по отдельности</p>
</section>
<section>
<h2>3. Поток спроса</h2>
<p>Это первая половина коктейля</p>
<p>Поток спроса - <strong>это то, что хотят смотреть и потреблять люди</strong></p>
<p>Где его видеть:</p>
<ul><li>он у вас в ленте рекомендаций</li><li>он на страничках ваших коллег с аудиторией</li><li>он в просмотрах и лайках того, что вы находите через поиск на ютубе</li></ul>
<p>То есть это то, что уже дало результаты и показало цифры</p>
<p>Как его искать руками - четыре способа с примерами и скриншотами - разбираем в практике, в блоке <i>Общая формула</i></p>
<p>Здесь важно только одно уточнение, потому что его почти все понимают неправильно</p>
<p>Копировать один в один - не работает</p>
<p>Ко мне приходили десятки людей, которые отдавали по 20 000 баксов продюсерам, те делали им по 60 рилсов, и ни один не работал</p>
<p>Потому что это только первая часть ингредиента для коктейля</p>
<p>Объясню на картинках</p>
<img src="/kurs/assets/l5-potok-1.png" alt="">
<p>Когда вы "просто" делаете контент - вы подставляете ведро и ждете, что вам нальют охватов с неба</p>
<img src="/kurs/assets/l5-potok-2.png" alt="">
<p>А поток спроса вот он, рядом: это то, что уже работает и дает результаты</p>
<img src="/kurs/assets/l5-potok-3.png" alt="">
<p>Задача не в том, чтобы ждать дождя, а в том, чтобы взять то, что сработало у других, и проложить желоб от этого потока к своему ведру</p>
<img src="/kurs/assets/l5-potok-4.png" alt="">
<p>Но раскрыть по-своему: сквозь свою позицию, свой опыт и свое видение</p>
<p>Покажу на живом примере</p>
<img src="/kurs/assets/l5-kollega-zahod.jpg" alt="">
<p>Вот карусель моей коллеги: "просто публикуйте все подряд, даже если это откровенно слабый контент"</p>
<p>Она там рассказывает про формирование привычки</p>
<p>27,5 тысяч лайков и 12,6 тысяч сохранений - тема людям заходит, спрос на нее есть</p>
<p>Причем на англоязычном рынке я видел ролик с тем же смыслом, который набрал 4 миллиона просмотров. Возможно, она взяла заход оттуда</p>
<p>Я взял этот заход и собрал его три раза:</p>
<p><img src="/kurs/assets/l5-moya-karusel-1.jpg" alt=""> <img src="/kurs/assets/l5-moya-karusel-2.jpg" alt=""> <img src="/kurs/assets/l5-moya-karusel-3.jpg" alt=""></p>
<p>257 826 просмотров в июне, 54 610 в июле, 19 537 в августе</p>
<p>И вот что важно: внутри у каждой свои смыслы, наполнение каждый раз разное</p>
<p>Я не копировал карусель. Я взял только заход и наполнил его собой</p>
<p>Вторая часть - ваша позиция и то, во что вы верите</p>
<p class="punch">ВАША ПРАВДА</p>
<p>Когда эти две вещи стыкуются - получаются цифры</p>
<p>Вот как это выглядит:</p>
<ul><li>слева круг <strong>"хочу я"</strong> - то, о чем вы хотите говорить, во что верите</li><li>справа круг <strong>"хотят они"</strong> - то, что люди уже готовы смотреть</li></ul>
<p>Если делать только то, что хотите вы - это стрелять наугад</p>
<p>Если делать только то, что хотят люди - это выгорать, потому что будете говорить чужими словами</p>
<p>А результаты в контенте лежат в пересечении</p>
</section>
<section>
<h2>Из чего состоит контентная единица</h2>
<p>Если смотреть на смысловую часть, а не на техническую:</p>
<ul><li><strong>смысл</strong> - ключевая идея, которую мы продаем</li><li><strong>пруф</strong> - доказательство, что этот смысл рабочий</li><li><strong>упаковка</strong> - сладкая оболочка, чтобы человек это скушал</li></ul>
<p>Полный разбор формулы - в блоке <i>Общая формула</i>: чем пруф отличается от упаковки, шесть видов пруфа, что делать, если своих результатов еще нет, и почему упаковка это не про красоту</p>
<p>Пример, как это работает вместе</p>
<p>Возьмем ту самую карусель, которую я показывал в блоке про карты</p>
<p>Смысл в ней такой: дело не в тебе, у тебя нормальный контент - просто алгоритм рандомный</p>
<p>Смысл не сильно новый, его так или иначе говорили и до меня</p>
<p><strong>Пруфом</strong> здесь стал мой эксперимент</p>
<p>Я показал перезаливы одного и того же файла и то, во что они превращались</p>
<p>Смысл перестал быть просто словами: под ним появились цифры, которые можно проверить</p>
<p><strong>Упаковкой</strong> стало резкое и противоречивое заявление: "алгоритм инстаграм далба*б"</p>
<p>Не "алгоритм работает не так, как вы думаете", не "разбираем механику ранжирования", а вот так</p>
<p>Смысл при этом остался тот же самый - поменялась только дверь, в которую человек заходит</p>
<img src="/kurs/assets/l5-karusel-algoritm.jpg" alt="">
<p>99 434 просмотра, 3,7 тысячи комментариев, 875 сохранений</p>
<p>Про техническую часть - хуки, заголовки, призывы к действию - я подробно рассказываю в Формуле Вирусного Контента, здесь повторяться не буду</p>
<p>А как эту единицу размножить на много заходов, как проверять гипотезы и что делать, если не идет - все это во второй части уровня, в практике</p>
</section>
<section>
<h2>4. Карта смыслов - ваши карты против их карт</h2>
<p>Если вы что-то продаете в онлайне, вы наверняка слышали про кастдевы</p>
<p>Это когда вы идете разговаривать с целевой аудиторией, чтобы вытащить их боли, страхи, желания и возражения</p>
<p>Многие думают, что именно это и нужно использовать в контенте</p>
<p>Но эти боли всегда одинаковые</p>
<p>Что вы не знаете, что толстые задолбались быть толстыми?</p>
<p>Что бедные затрахались быть бедными?</p>
<p>Что некрасивые хотят быть красивыми?</p>
<p>Оно всегда одно и то же</p>
<p>Решает не это</p>
<p>Решает то, <strong>как вы отвечаете</strong> на эти боли</p>
<p>Вот есть боль: контент не привлекает клиентов</p>
<p>Она общеизвестная, и не надо ходить два часа разговаривать с людьми, чтобы это понять</p>
<p>Но ответить на нее можно по-разному</p>
<p>Я скажу: у вас не продающий контент</p>
<p>Мой коллега скажет: у тебя не настроена воронка</p>
<p>Другой коллега скажет: тебе не нужен контент, тебе нужен таргет</p>
<p>По сути это игра в карты с аудиторией</p>
<p>У них на руках их карты - боли, желания, страхи, возражения - и они их разыгрывают</p>
<p>Нам эти карты нужно чем-то крыть</p>
<p>Выглядит это так. Человек кидает карту: "у меня дерьмовый контент, поэтому он не работает"</p>
<p>Я крою своей: "у тебя нормальный контент, просто алгоритм рандомный"</p>
<p>И вот здесь у человека появляется интерес</p>
<p>Вот эти наши козыри и есть карта смыслов</p>
<p>Достаточно найти 3-5 таких смыслов и дальше танцевать в контенте вокруг них</p>
<p>Как собирается карта - в отдельном блоке <i>Общая формула</i>, там же моя собственная карта из пяти ядер</p>
<p>А если хотите собрать ее за один разговор - под это есть промпт: на выходе 3-5 ваших ядер, проверка каждого на работоспособность, пруфы под них и по десять заходов на каждое ядро → <i>Промпт — карта смыслов</i></p>
<h3>Какие смыслы работают, а какие нет</h3>
<p>Здесь есть четыре категории, и разница между ними решает все</p>
<p><strong>Общеизвестные</strong> - реакция "я это и так знаю", свайп:</p>
<ul><li>чтобы зарабатывать, нужно продавать</li><li>контент нужно делать регулярно</li><li>чтобы похудеть, нужно меньше есть и больше двигаться</li></ul>
<p><strong>Сложнодоказуемые</strong> - реакция "это бред", свайп:</p>
<ul><li>можно зарабатывать миллион, работая два часа в день</li><li>я вышел на 500К за первый месяц без вложений и аудитории</li><li>воронки продаж больше не работают</li></ul>
<p><strong>Противоречат общепринятому, но легко доказуемы на вашем опыте</strong> - вот это работает:</p>
<ul><li>полезный контент убивает продажи (я даю пользу, а не покупают - и это правда)</li><li>нишу не нужно выбирать, нужно соединить то, что уже есть</li></ul>
<p><strong>Дают новое объяснение знакомой проблеме</strong> - и это работает лучше всего:</p>
<ul><li>у тебя не мало клиентов, у тебя слабая идея - ты продаешь помидоры, которые есть у всех</li><li>ты не продаешь не потому что стесняешься, а потому что сам не веришь, что твой опыт это ценность</li></ul>
<p>Если вы фитнес-тренер и рыбачите на "чтобы похудеть, надо ходить в зал" - спасибо, кэп, свайп и отписка</p>
<p>Если идея слабая - она не будет работать, без разницы, как вы ее упакуете</p>
<p>А сильная идея работает, даже когда вы рассказываете про нее, сидя на унитазе и врубив фронтальную камеру</p>
</section>
<section>
<h2>5. Упаковка смыслов</h2>
<p>Смысл сам по себе не цепляет - его нужно во что-то завернуть</p>
<p>Из чего собирается упаковка и как её делать руками - в блоке <i>Общая формула</i></p>
<p>Здесь про главную ошибку, из-за которой упаковку вообще не открывают</p>
<h3>Чеснок и ветчина</h3>
<p>И вот здесь главная ошибка упаковки</p>
<p>Вы все хотите дать человеку <strong>чеснок</strong> - то, что ему нужно</p>
<p>А он хочет <strong>ветчину</strong> - то, чего он хочет</p>
<p>Пример: человеку с лишним весом надо заняться здоровьем</p>
<p>Вы так ему и говорите: займись своим здоровьем</p>
<p>А он это не берет и не смотрит, потому что он этого не хочет</p>
<p>При этом смысл остается тот же: вы все равно приведете его к здоровью</p>
<p>Но зайти надо через то, чего он хочет</p>
<p>Упаковка - это не про то, чтобы врать. Это про то, чтобы вас вообще открыли</p>
<p>Вся мысль в трех кадрах:</p>
<img src="/kurs/assets/l5-chesnok-1.png" alt="">
<p>Вы протягиваете человеку чеснок, а он отмахивается и тянется к ветчине</p>
<img src="/kurs/assets/l5-chesnok-2.png" alt="">
<p>Вы берете тот же самый чеснок и заворачиваете его в ветчину</p>
<img src="/kurs/assets/l5-chesnok-3.png" alt="">
<p>И он ест его сам, с огромным аппетитом. Чеснок внутри тот же</p>
</section>
<section>
<h2>6. Промежуточные результаты - как они выглядят на самом деле</h2>
<blockquote><p>Женя, 470 подписчиков</p><p>он вообще не создавал контента до этого, но 14 лет занимается машинами и обладает огромной экспертизой</p><p>сначала задача была просто привыкнуть к камере - мы записывали видео на созвонах</p><p>когда он стал чувствовать себя уверенней, начали добавлять ингредиенты</p><p>и как только начали попадать в поток спроса - цифры начали меняться</p><p>для аккаунта в 470 подписчиков это огромная победа</p><p>да, это не "30 000 подписчиков с одного рилса"</p><p>но и задача не стоит запустить ракету</p></blockquote>
<img src="/kurs/assets/zhenya-do-posle.jpg" alt="">
<p>Слева первый этап: 215 просмотров, 162 охваченных аккаунта, 5 секунд среднего просмотра, ноль подписок</p>
<p>Справа второй, когда подключили поток спроса: 31 847 просмотров, 26 125 аккаунтов, 21 секунда, 37 подписок</p>
<p>Дальше это перестало быть разовым: у него уже несколько роликов по 60 тысяч</p>
<p>Та же схема сработала у Наташи на аккаунте с 44 подписчиками - с первого же видео, как только подключили поток спроса. Тот ролик набрал 380 тысяч</p>
<p>И у клиента с 450 подписчиками, где мы взяли начало у ролика с ютуба и подставили его тезисы</p>
<p>Чтобы выбить джекпот, нужно выкладывать этот контент постоянно</p>
<p>Мы не влияем на то, будет джекпот или нет</p>
<p>Мы влияем только на то, что выкладываем и как часто</p>
<p>Цифры на выходе - уже на стороне алгоритма</p>
<p><strong>Живой маркер, который важнее цифр:</strong> комментарии и сообщения в личку в духе "блин, наконец-то кто-то это сказал"</p>
<p>Если такое начало приходить - вы попали, даже если цифры еще скромные</p>
</section>
<section>
<h2>Антипаттерны этого уровня</h2>
<ul><li><strong>"алгоритм меня не любит"</strong> - алгоритм вас не знает, это рулетка, и мы это разобрали в статье про казино</li><li><strong>"у меня нет аудитории"</strong> - у Васи 1 500 подписчиков, 500 тысяч рублей в месяц и две купленные квартиры, у Наташи было 44</li><li><strong>бросать на промежуточном результате</strong> вместо того, чтобы докручивать</li><li><strong>копировать один в один</strong> вместо того, чтобы подставлять свои смыслы</li><li><strong>гнаться за джекпотом</strong> - это возвращает вас на второй уровень, к завышенным ожиданиям и разочарованию</li></ul>
</section>
<section>
<span class="slabel">коротко</span><h2>Саммари</h2>
<p>Отклик появляется на пересечении двух вещей</p>
<p>Того, что уже хотят смотреть люди - поток спроса</p>
<p>И того, во что вы правда верите - ваша правда</p>
<p>А цифры - это следствие доверия, интереса и постоянства</p>
<p>Вам верят, вас хотят смотреть, и вы не пропадаете. Никогда не наоборот</p>
</section>
<section>
<span class="slabel">делаем руками</span><h2>Задача</h2><div class="taskbox"><div class="tt">задача уровня</div>
<p>Задача этого блока - просто понять концепцию и принцип</p>
<p>Ничего делать руками пока не надо</p>
<p>Дальше идёт практика - там мы разбираем всё это подробно и по шагам, и там же будет задача</p>
</div></section>

<!--FOOTER_SLOT-->
</main>

<div class="readnav" id="readnav">
  <div class="toc"></div>
  <div class="readnav-btns">
    <button class="rbtn" id="tocToggle" title="оглавление">☰</button>
    <div class="pct">
      <svg width="46" height="46"><circle cx="23" cy="23" r="19" fill="#fff" stroke="#ddd" stroke-width="3"/>
        <circle id="rcArc" cx="23" cy="23" r="19" fill="none" stroke="#e8590c" stroke-width="3" stroke-linecap="round"/></svg>
      <span id="rcPct">0%</span>
    </div>
  </div>
</div>

<script>
/* ============================================================
   Статьи курса: прогресс чтения, оглавление со scroll-spy, режим правок.
   Режим правок: ?review=1 или #review — показывает пометки [визуал: …] и [ждёт …].
   ============================================================ */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    if (/[?&]review=1/.test(location.search) || location.hash === '#review') document.body.classList.add('rev');

    /* ---------- оглавление ---------- */
    const nav = document.getElementById('readnav');
    const toc = nav && nav.querySelector('.toc');
    const heads = [...document.querySelectorAll('section h2, section h3')];
    if (toc && heads.length) {
      heads.forEach((h, i) => {
        if (!h.id) h.id = 'h' + i;
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        if (h.tagName === 'H3') a.className = 'sub';
        a.addEventListener('click', () => nav.classList.remove('open'));
        toc.appendChild(a);
      });
      const btn = document.getElementById('tocToggle');
      if (btn) btn.addEventListener('click', () => nav.classList.toggle('open'));
      if (window.innerWidth >= 900) nav.classList.add('open');
    }

    /* ---------- прогресс + активный пункт ---------- */
    const bar = document.getElementById('progress');
    const arc = document.getElementById('rcArc');
    const pctTxt = document.getElementById('rcPct');
    const links = toc ? [...toc.querySelectorAll('a')] : [];
    const R = 19, LEN = 2 * Math.PI * R;
    if (arc) { arc.style.strokeDasharray = LEN; arc.style.strokeDashoffset = LEN; }

    function onScroll() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(1, h.scrollTop / max) : 0;
      if (bar) bar.style.width = (p * 100) + '%';
      if (arc) arc.style.strokeDashoffset = LEN * (1 - p);
      if (pctTxt) pctTxt.textContent = Math.round(p * 100) + '%';

      let cur = 0;
      heads.forEach((el, i) => { if (el.getBoundingClientRect().top < 140) cur = i; });
      links.forEach((a, i) => a.classList.toggle('on', i === cur));
      const on = links[cur];
      if (on && toc && nav.classList.contains('open')) {
        const t = on.offsetTop - toc.clientHeight / 2;
        if (Math.abs(toc.scrollTop - t) > 60) toc.scrollTop = t;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  });
})();

</script>
<script>
/* ============================================================
   Интерактивы для статей курса. Рендерятся в <div class="ix" data-ix="имя">.
   Те же механики, что в презентациях, адаптированные под чтение с экрана.
   ============================================================ */
(function () {
  const H = (s) => { const d = document.createElement('div'); d.innerHTML = s.trim(); return d.firstElementChild; };

  const IX = {};

  /* ---------- диагностика уровня ---------- */
  IX.diag = (root) => {
    const L = [
      ['1', 'хотите, но ничего не делаете', 'Уровень 1. Хочу, но не делаю', 'Задача: просто начать выкладывать. Плевать какой контент, плевать какие цифры.', '02-uroven-1.html'],
      ['2', 'когда-то делали, но бросили', 'Уровень 2. Делал, но бросил', 'Вы на первом, просто выключили игру. Задача: понять, что выбило, и вернуться с пониженной планкой.', '03-uroven-2.html'],
      ['3', 'делаете, но вас раздражает то, что вы делаете', 'Уровень 3. Делаю, но бесит', 'Задача: собрать комфортную среду — свою форму, свою правду, свою ставку.', '04-uroven-3.html'],
      ['4', 'не раздражает, но времени не хватает', 'Уровень 4. Не бесит, но жрёт время', 'Задача: сжать время, а не найти его. Больше времени не будет.', '05-uroven-4.html'],
      ['5', 'времени хватает, а отклика нет', 'Уровень 5. Времени хватает, а отклика нет', 'Задача: поймать промежуточные результаты и научиться их докручивать.', '06-uroven-5.html'],
      ['6', 'всё работает, хочу больше', 'Уровень 6. Всё работает, хочу больше', 'Задача: масштабировать то, что уже работает.', '08-uroven-6.html'],
    ];
    root.innerHTML = \`<div class="ixt">диагностика</div><div class="ixh">На каком вы уровне прямо сейчас</div>
      <div class="dg">\${L.map((l, i) => \`<button class="dgr" data-i="\${i}"><b>\${l[0]}</b><span>\${l[1]}</span></button>\`).join('')}</div>
      <div class="dgout muted">нажмите на строку, которая про вас</div>\`;
    const out = root.querySelector('.dgout');
    root.querySelectorAll('.dgr').forEach(b => b.addEventListener('click', () => {
      root.querySelectorAll('.dgr').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      const l = L[+b.dataset.i];
      out.classList.remove('muted');
      out.innerHTML = \`<b>\${l[2]}</b><br>\${l[3]}<br><a href="\${l[4]}">Перейти к уровню →</a>\`;
    }));
  };

  /* ---------- шесть замков ---------- */
  IX.locks = (root) => {
    const L = [
      ['👀', 'Страх осуждения', 'Психика сформирована так, чтобы НЕ выделяться: вне стаи шансов выжить было мало. Заставляя себя, вы боретесь со своей природой.', 'Снимайте в галерею, никуда не выкладывая. И заведите новый аккаунт, где вас никто не знает.'],
      ['📉', 'Страх неудачи', 'Вы пришли в спортзал и после первого упражнения встали на весы. Ничего не изменилось — разочарование.', 'Смените критерий: выложил единицу = победа. Результат привычки — её повторение, а не цифры.'],
      ['💎', 'Перфекционизм', 'Скрытая форма страха. Планка настолько высокая, что вызывает стресс, а стресс съедает время и энергию, которых нет.', 'Один дубль — не переснимать вообще. И потолок времени вместо потолка качества: выкладываете то, что получилось, когда время вышло.'],
      ['🎭', 'Синдром самозванца', '«Я недостаточно хорош» → надо стараться → слишком тяжело → оправдание → бездействие → «я недостаточно хорош». Цикл замкнулся.', 'Принять текущий уровень. Инвентаризация опыта — выписать свои кейсы. Признание от другого человека.'],
      ['👑', 'Эго', '«Это слишком просто». Эго хочет выстрадать результат, иначе он ничего не стоит. Чаще всего с этим сталкиваются творцы.', 'Разделите контент и свою потребность. Быть уникальным — в продукте. Контент — инструмент привлечения внимания.'],
      ['🔋', 'Нет мотивации', 'Насколько быстро вы загораетесь, настолько же быстро тухнете. Чаще всего это значит, что вы этого не хотите.', 'Вернуться к цепочке «зачем» в блоке про цель. И честно: часть вещей решается только с психотерапевтом.'],
    ];
    root.innerHTML = \`<div class="ixt">кликните на любой</div><div class="ixh">Что именно вас держит</div>
      <div class="lk">\${L.map((l, i) => \`<button class="lki" data-i="\${i}"><span class="ic">\${l[0]}</span><span class="nm">\${l[1]}</span></button>\`).join('')}</div>
      <div class="lkout muted">каждый замок открывается своим ключом</div>\`;
    const out = root.querySelector('.lkout');
    root.querySelectorAll('.lki').forEach(b => b.addEventListener('click', () => {
      root.querySelectorAll('.lki').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      const l = L[+b.dataset.i];
      out.classList.remove('muted');
      out.innerHTML = \`<b>\${l[0]} \${l[1]}</b><div class="k">что за этим стоит</div><p>\${l[2]}</p><div class="k">как обойти</div><p>\${l[3]}</p>\`;
    }));
  };

  /* ---------- долина отчаяния ---------- */
  IX.valley = (root) => {
    const S = [
      [60, 70, 'Неинформированный оптимизм', 'Нашли идею, которая вдохновляет, готовы окунуться на 100%. Ещё не знаете, что впереди.'],
      [230, 130, 'Информированный пессимизм', 'Оказывается, всё не так просто. Не хватает навыков или недооценили сложность.'],
      [420, 250, 'Долина отчаяния', 'Всё валится из рук, сила воли трещит. Мозг подкидывает НОВУЮ классную идею или говорит «мы устали». Здесь выходят 95%.'],
      [640, 140, 'Информированный оптимизм', 'Прошли испытание, всё начинает медленно работать. Опыт есть, вы близко.'],
      [820, 60, 'Успех', 'Результат получен.'],
    ];
    root.innerHTML = \`<div class="ixt">кликните на стадию</div><div class="ixh">Любое движение к цели выглядит так</div>
      <svg viewBox="0 0 900 300" class="vly">
        <path d="M60,70 C160,80 180,120 230,130 C320,150 350,240 420,250 C520,262 560,180 640,140 C720,100 760,70 820,60"
              fill="none" stroke="#ddd" stroke-width="6"/>
        \${S.map((s, i) => \`<g class="vp" data-i="\${i}"><circle cx="\${s[0]}" cy="\${s[1]}" r="11" fill="#bbb"/>
           <text x="\${s[0]}" y="\${s[1] - 24}" text-anchor="middle" font-size="15" font-weight="bold" fill="#666">\${i + 1}</text></g>\`).join('')}
        <text x="420" y="292" text-anchor="middle" font-size="15" fill="#c0392b" font-weight="bold">здесь выходят 95%</text>
      </svg>
      <div class="vlyout muted">нажмите на точку</div>\`;
    const out = root.querySelector('.vlyout');
    root.querySelectorAll('.vp').forEach(g => g.addEventListener('click', () => {
      root.querySelectorAll('.vp').forEach(x => x.classList.remove('on'));
      g.classList.add('on');
      const s = S[+g.dataset.i];
      out.classList.remove('muted');
      out.innerHTML = \`<b>Стадия \${+g.dataset.i + 1}. \${s[2]}</b><p>\${s[3]}</p>\`;
    }));
  };

  /* ---------- почему вы вышли из игры ---------- */
  IX.causes = (root) => {
    const C = [
      ['Вы ждали результатов', 'на первый уровень', 'И не увидели их в тот срок, который сами себе назначили.'],
      ['Вы задрали планку сложности', 'на первый уровень', 'Снимали слишком долго, монтировали слишком тщательно, требовали от себя слишком много.'],
      ['Вы делали не в той форме', 'на третий уровень', 'Писали, хотя комфортнее говорить. Или снимали, хотя проще писать.'],
      ['Вы говорили не своё', 'на третий уровень', 'Брали чужие темы и смыслы, потому что они «должны работать».'],
      ['У вас изменился контекст', 'вы ничего не бросали', 'Переезд, работа, ребёнок, здоровье. Это вообще не про контент.'],
    ];
    root.innerHTML = \`<div class="ixt">найдите свою причину</div><div class="ixh">Вариантов немного, и они почти всегда отсюда</div>
      <div class="cz">\${C.map((c, i) => \`<button class="czi" data-i="\${i}"><span class="t">\${c[0]}</span><span class="g">\${c[1]}</span></button>\`).join('')}</div>
      <div class="czout muted">от причины зависит, куда вам идти</div>\`;
    const out = root.querySelector('.czout');
    root.querySelectorAll('.czi').forEach(b => b.addEventListener('click', () => {
      root.querySelectorAll('.czi').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      const c = C[+b.dataset.i];
      out.classList.remove('muted');
      out.innerHTML = \`<b>\${c[1]}</b> — \${c[2]}\`;
    }));
  };

  /* ---------- ручка громкости ---------- */
  IX.knob = (root) => {
    const V = {
      p: ['вы вообще не говорите, что у вас можно что-то купить — люди искренне не знают, чем вы занимаетесь',
        'есть где-то в шапке профиля, но вы про это молчите',
        'иногда упоминаете вскользь, в конце, извиняющимся тоном',
        'регулярно рассказываете, что делаете и с какими задачами к вам приходят',
        'есть прямые предложения с призывом к действию, вы запускаете диалоги первым',
        'активная промо-кампания: оффер каждый день, во всех форматах, пока не закроете задачу'],
      r: ['вы не проявляетесь, вас нет',
        'выкладываете раз в месяц то, что не жалко',
        'делитесь, но всё время себя одёргиваете',
        'делитесь тем, что вам самому интересно, без оглядки на продажи',
        'говорите свободно и про то, что вас правда занимает',
        'отдаётесь процессу полностью, делаете только то, что хотите, вообще не думая про деньги'],
    };
    root.innerHTML = \`<div class="ixt">инструмент</div><div class="ixh">Ручка громкости</div>
      <div class="kn">
        <div class="knd"><svg viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="82" fill="#fff" stroke="#000" stroke-width="3"/>
          <circle class="arc" cx="100" cy="100" r="70" fill="none" stroke="#e8590c" stroke-width="14"
                  stroke-linecap="round" transform="rotate(135 100 100)" stroke-dasharray="0 999"/>
          <line class="ptr" x1="100" y1="100" x2="100" y2="42" stroke="#000" stroke-width="6" stroke-linecap="round"
                transform="rotate(-135 100 100)"/>
          <circle cx="100" cy="100" r="9" fill="#000"/>
          <text class="val" x="100" y="152" text-anchor="middle" font-size="34" font-weight="bold" fill="#e8590c">0</text>
        </svg></div>
        <div class="kns">
          <div class="knm"><button class="ixbtn on" data-m="p">Передатчик</button><button class="ixbtn" data-m="r">Приёмник</button></div>
          <p class="knt"></p>
          <div class="knc"><button class="ixbtn" data-s="-1">− тише</button><button class="ixbtn" data-s="1">громче +</button></div>
          <p class="knw"></p>
        </div>
      </div>\`;
    let m = 'p', v = 0;
    const arc = root.querySelector('.arc'), ptr = root.querySelector('.ptr'), val = root.querySelector('.val'),
      txt = root.querySelector('.knt'), warn = root.querySelector('.knw');
    const FULL = 2 * Math.PI * 70 * (270 / 360);
    const draw = () => {
      ptr.setAttribute('transform', \`rotate(\${-135 + v * 54} 100 100)\`);
      arc.setAttribute('stroke-dasharray', \`\${(FULL * v / 5).toFixed(1)} 999\`);
      val.textContent = v;
      txt.innerHTML = \`<b>\${v}</b> — \${V[m][v]}\`;
      warn.textContent = (v === 2 || v === 3) ? 'На двойке не работает ни один режим.' : '';
    };
    root.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => {
      root.querySelectorAll('[data-m]').forEach(x => x.classList.remove('on'));
      b.classList.add('on'); m = b.dataset.m; draw();
    }));
    root.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => {
      v = Math.max(0, Math.min(5, v + (+b.dataset.s))); draw();
    }));
    draw();
  };

  /* ---------- калькулятор времени ---------- */
  IX.calc = (root) => {
    root.innerHTML = \`<div class="ixt">посчитайте</div><div class="ixh">Сколько времени забирает контент и сколько можно вернуть</div>
      <div class="cl">
        <label>единиц контента в неделю <input type="range" class="c1" min="1" max="15" value="5"><b class="c1v">5</b></label>
        <label>часов на одну единицу сейчас <input type="range" class="c2" min="1" max="8" step="0.5" value="3"><b class="c2v">3 ч</b></label>
        <div class="clres">
          <div><span class="k">сейчас в месяц</span><b class="bad now">0 ч</b><span class="s nowd"></span></div>
          <div><span class="k">если сжать до 30 минут</span><b class="ok aft">0 ч</b><span class="s aftd"></span></div>
        </div>
      </div>\`;
    const q = s => root.querySelector(s);
    const upd = () => {
      const c = +q('.c1').value, h = +q('.c2').value;
      q('.c1v').textContent = c; q('.c2v').textContent = h + ' ч';
      const now = c * h * 4.3, aft = c * 0.5 * 4.3;
      q('.now').textContent = Math.round(now) + ' ч';
      q('.nowd').textContent = 'это ' + (now / 8).toFixed(1) + ' рабочих дней в месяц';
      q('.aft').textContent = Math.round(aft) + ' ч';
      q('.aftd').textContent = 'освободится ' + Math.round(now - aft) + ' часов, это ' + ((now - aft) / 8).toFixed(1) + ' рабочих дней';
    };
    q('.c1').addEventListener('input', upd); q('.c2').addEventListener('input', upd); upd();
  };

  /* ---------- докрутка по симптому ---------- */
  IX.troub = (root) => {
    const T = [
      ['Мало просмотров', 'Вы не цепляете внимание', 'Неинтересные первые 3–4 секунды.', 'Придумать отличительную фишку · сделать заголовок интереснее · выбрать более интересную идею'],
      ['Мало сохранений', 'Нет ценности, нечего сохранять', 'Человеку нечего забрать с собой.', 'Показать решение визуально: на доске, в тетрадке, графикой · поменять идею на такую, которую можно показать'],
      ['Мало репостов', 'Люди не узнают свою ситуацию', 'Делятся тем, в чём узнают себя.', 'Искать идеи, актуальные для зрителя · показывать ситуации, с которыми аудитория реально сталкивается'],
      ['Мало лайков', 'Слабая идея', 'Лайк — реакция на саму мысль.', 'Вернуться к карте смыслов и проверить идею по четырём категориям'],
      ['Мало комментариев', 'Нет эмоции', 'Это никого не задевает.', 'Комментарии сейчас в самом низу приоритета: все гоняют ключевые слова, площадка понизила их в рейтинге'],
    ];
    root.innerHTML = \`<div class="ixt">выберите симптом</div><div class="ixh">Работаем по причинам, а не наугад</div>
      <div class="tb">\${T.map((t, i) => \`<button class="tbi" data-i="\${i}">\${t[0]}</button>\`).join('')}</div>
      <div class="tbout muted">нажмите на симптом</div>\`;
    const out = root.querySelector('.tbout');
    root.querySelectorAll('.tbi').forEach(b => b.addEventListener('click', () => {
      root.querySelectorAll('.tbi').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      const t = T[+b.dataset.i];
      out.classList.remove('muted');
      out.innerHTML = \`<b>\${t[1]}</b><p class="muted">\${t[2]}</p><p>\${t[3]}</p>\`;
    }));
  };

  /* ---------- тест на выкидывание ---------- */
  IX.unit = (root) => {
    root.innerHTML = \`<div class="ixt">тест на выкидывание</div><div class="ixh">Уберите элемент и посмотрите, что сломается</div>
      <div class="un">
        <div class="uni" data-el="s"><span class="k">смысл</span><b>Что я утверждаю</b>
          <p>«можно не тратить кучу времени на контент, который сдохнет за час»</p><button class="ixbtn">убрать</button></div>
        <div class="uni" data-el="p"><span class="k">пруф</span><b>Чем я это держу</b>
          <p>статистика двух единиц: рилс за 3 минуты и карусель за 15 минут</p><button class="ixbtn">убрать</button></div>
        <div class="uni" data-el="u"><span class="k">упаковка</span><b>Как это заходит</b>
          <p>формат эксперимента: «я проверил на себе и показываю цифры»</p><button class="ixbtn">убрать</button></div>
      </div>
      <div class="unout"><b class="ok">Всё на месте.</b> Человек начинает смотреть, верит и забирает смысл.</div>\`;
    const st = { s: true, p: true, u: true };
    const out = root.querySelector('.unout');
    const txt = () => {
      const { s, p, u } = st;
      if (s && p && u) return '<b class="ok">Всё на месте.</b> Человек начинает смотреть, верит и забирает смысл.';
      if (!u && s && p) return '<b class="bad">Без упаковки:</b> цифры и мысль остались, но их никто не увидит.';
      if (!p && s && u) return '<b class="bad">Без пруфа:</b> осталось «не тратьте много времени» — то есть мнение. Таких мнений в ленте тысяча.';
      if (!s && p && u) return '<b class="bad">Без смысла:</b> красивый эксперимент, из которого непонятно, что вы утверждаете.';
      if (!s && !p) return '<b class="bad">Осталась только форма.</b> Посмотрят и забудут через минуту.';
      if (!p && !u) return '<b class="bad">Голое утверждение.</b> Ни смотреть, ни верить.';
      if (!s && !u) return '<b class="bad">Набор цифр без идеи и без входа.</b> Это не контент, это отчёт.';
      return '<b class="bad">Пусто.</b> Ничего не осталось.';
    };
    root.querySelectorAll('.uni').forEach(b => {
      b.querySelector('button').addEventListener('click', () => {
        const k = b.dataset.el; st[k] = !st[k];
        b.classList.toggle('off', !st[k]);
        b.querySelector('button').textContent = st[k] ? 'убрать' : 'вернуть';
        out.innerHTML = txt();
      });
    });
  };

  /* ---------- конструктор переупаковки ---------- */
  IX.repurpose = (root) => {
    const O = [['длинное видео на YouTube', 1], ['3 нарезки в Reels', 3], ['3 шортса на YouTube', 3],
      ['пост в телеграм', 1], ['2 карусели', 2], ['4 тредса', 4]];
    root.innerHTML = \`<div class="ixt">соберите свою переупаковку</div><div class="ixh">Один рабочий созвон → сколько единиц</div>
      <div class="rp">\${O.map((o, i) => \`<button class="rpi" data-w="\${o[1]}">\${o[0]}</button>\`).join('')}</div>
      <div class="rpout">из одной записи получается <b>0</b> единиц контента</div>\`;
    const out = root.querySelector('.rpout');
    root.querySelectorAll('.rpi').forEach(o => o.addEventListener('click', () => {
      o.classList.toggle('on');
      let n = 0; root.querySelectorAll('.rpi.on').forEach(x => n += +x.dataset.w);
      out.innerHTML = \`из одной записи получается <b>\${n}</b> единиц контента\`;
    }));
  };

  /* ---------- весы ХОЧУ / НАДО ---------- */
  IX.scale = (root) => {
    root.innerHTML = \`<div class="ixt">баланс</div><div class="ixh">Что делать с вашим перекосом</div>
      <div class="sc"><div class="scl">ХОЧУ</div><div class="scr">НАДО</div></div>
      <div class="scc"><button class="ixbtn" data-s="h">много ХОЧУ, мало НАДО</button><button class="ixbtn" data-s="n">много НАДО, мало ХОЧУ</button></div>
      <div class="scout muted">выберите свой перекос</div>\`;
    const l = root.querySelector('.scl'), r = root.querySelector('.scr'), out = root.querySelector('.scout');
    const D = {
      h: ['78%', '22%', '<b>Создаём условия для действий.</b> Подносим кочергу к жопке: органичный дедлайн, обещание другому человеку, расписание. Энергия есть, не хватает необходимости.'],
      n: ['22%', '78%', '<b>Протыкаем ёмкость.</b> Отпускаем ситуацию, разрешаем себе своё ХОЧУ — и оно появляется. Давление сбрасывается, на освободившемся месте появляются силы.'],
    };
    root.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => {
      root.querySelectorAll('[data-s]').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      const d = D[b.dataset.s];
      l.style.width = d[0]; r.style.width = d[1];
      out.classList.remove('muted'); out.innerHTML = d[2];
    }));
  };

  /* ---------- карта пройденного пути ---------- */
  IX.path = (root) => {
    const S = [
      ['Зачем вам блог', 'есть цепочка, которая держит контент в приоритетах'],
      ['Уровень 1 · начали', 'знаете, как обходить свою систему безопасности, а не бороться с ней'],
      ['Уровень 2 · вернулись', 'знаете, почему бросили и что делать, если повторится'],
      ['Уровень 3 · не бесит', 'собрали свою форму, свою правду и свою ставку'],
      ['Уровень 4 · не жрёт время', 'единица занимает столько, сколько вы ей отвели'],
      ['Уровень 5 · есть отклик', 'поток спроса плюс ваша правда, упакованные так, чтобы человек узнал себя'],
      ['Уровень 6 · масштаб', 'тиражируете то, что работает, вместо того чтобы пахать больше'],
    ];
    root.innerHTML = \`<div class="ixt">отметьте, что уже закрыто</div><div class="ixh">Пройдитесь по своему пути</div>
      <div class="pth">\${S.map((s, i) => \`<button class="pti" data-i="\${i}"><span class="n">\${i === 0 ? '0' : i}</span>
        <span class="t">\${s[0]}</span><span class="g">\${s[1]}</span><span class="ck">✓</span></button>\`).join('')}</div>
      <div class="pthout muted">нажимайте на ступени, которые вы уже закрыли</div>\`;
    const out = root.querySelector('.pthout');
    root.querySelectorAll('.pti').forEach(b => b.addEventListener('click', () => {
      b.classList.toggle('done');
      const n = root.querySelectorAll('.pti.done').length;
      out.classList.toggle('muted', n === 0);
      out.innerHTML = n === 0 ? 'нажимайте на ступени, которые вы уже закрыли'
        : (n === S.length ? '<b>Весь стек собран.</b> Дальше — сверка раз в месяц и масштаб.'
          : \`Закрыто <b>\${n}</b> из \${S.length}. Остальное — ваш план на ближайшие месяцы.\`);
    }));
  };

  /* ---------- карусель иллюстраций (собирается генератором из %%carousel%%) ---------- */
  function initCarousels() {
    document.querySelectorAll('.kcar').forEach(car => {
      const frames = [...car.querySelectorAll('.kcfr')];
      const dots = [...car.querySelectorAll('.kcdot')];
      const cnt = car.querySelector('.kccnt');
      const set = i => {
        i = Math.max(0, Math.min(frames.length - 1, i));
        car.dataset.i = i;
        frames.forEach((f, j) => f.classList.toggle('on', j === i));
        dots.forEach((d, j) => d.classList.toggle('on', j === i));
        cnt.textContent = (i + 1) + ' / ' + frames.length;
        car.querySelectorAll('.kcarrow').forEach(b => {
          const d = Number(b.dataset.d);
          b.disabled = (d < 0 && i === 0) || (d > 0 && i === frames.length - 1);
        });
      };
      car.querySelectorAll('.kcarrow').forEach(b =>
        b.addEventListener('click', () => set(Number(car.dataset.i) + Number(b.dataset.d))));
      dots.forEach(d => d.addEventListener('click', () => set(Number(d.dataset.i))));
      car.querySelector('.kcfrs').addEventListener('click', () => {
        const i = Number(car.dataset.i);
        set(i >= frames.length - 1 ? 0 : i + 1);
      });
      set(0);
    });
  }

  /* ---------- запуск ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initCarousels();
    document.querySelectorAll('.ix[data-ix]').forEach(el => {
      const fn = IX[el.dataset.ix];
      if (fn) { try { fn(el); } catch (e) { console.warn('ix ' + el.dataset.ix, e); } }
      else el.innerHTML = '<div class="ixt">интерактив</div><p class="muted">' + el.dataset.ix + ' — не найден</p>';
    });
  });
})();

</script>
</body>
</html>
`;
