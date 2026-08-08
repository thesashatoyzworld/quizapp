// Статья урока «08-uroven-6» курса «Новый Уровень Контента».
// СГЕНЕРИРОВАНО: GSD-BRAND/scripts/kurs-to-ts.mjs 08 — руками не править,
// править исходник kurs/08-uroven-6.html и перегенерировать.

export const UROVEN_6_08 = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Всё работает, хочу больше · Новый уровень контента</title>
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
  <div class="lvlbadge">Уровень 6</div>
  <h1>Всё работает, хочу больше</h1>
  <p class="dek">У вас пошло, есть результат. Теперь вопрос, как масштабировать и не выгореть.</p>
  <div class="taskline"><b>Задача:</b> Масштабировать то, что уже работает. Больше результата с тех же усилий.</div>
</div></header>

<!--VIDEO_SLOT-->


<main class="wrap">
<section>
<p>title: Уровень 6 - все работает, хочу больше</p>
<p>date: 2026-07-27</p>
<p>tags:</p>
<ul><li>course</li><li>content</li></ul>
<p>status: draft</p>
<p>level: L6</p>
<p>related:</p>
<ul><li>"<i>6 уровней навыка</i>"</li><li>"<i>Уровень 5 - времени хватает, а отклика нет</i>"</li><li>"<i>Уровень 4 - не бесит, но жрет время</i>"</li></ul>
<p># Уровень 6. Все работает, хочу больше</p>
<p>Собран из каркасов <code>Блоки/15 — Масштаб</code> и <code>Блоки/12 — Площадки</code> + посты канала <code>1592</code> (2 литра трафика), <code>1504</code> (апрель без создания контента), <code>1553</code> (два пути роста), <code>1483</code> (Threads и Женя), <code>1660</code> (быть первым), <code>1716</code> (Макс).</p>
<p>Формулировка уровня: у вас пошло, есть результат</p>
<p>Теперь вопрос, как масштабировать и не выгореть</p>
<p>Вы прошли пять уровней</p>
<p>Контент выходит, не бесит, не жрет весь день и дает отклик</p>
<p>Появился первый устойчивый результат: подписки, заявки, клиенты, деньги</p>
<p>И вместе с ним появляется мысль</p>
<p class="punch">«А что если делать этого в два раза больше»</p>
<p>Вот здесь начинается уровень</p>
</section>
<section>
<h2>Чем опасно застрять здесь</h2>
<p>Опасность одна и она предсказуемая</p>
<p>Человек читает слово «масштаб» как «объем»</p>
<p>Работало пять роликов в неделю - давайте пятнадцать</p>
<p>Работал инстаграм - давайте еще телеграм, ютуб, тикток и тредс одновременно</p>
<p>Через три недели он выгорает и откатывается на третий уровень, где контент снова бесит</p>
<p>Только теперь еще и с ощущением, что он уже пробовал и не вывез</p>
<p>Поэтому первое, что нужно зафиксировать</p>
<p class="punch">Масштаб - это не больше усилий. Это больше результата с тех же усилий</p>
<p>Тиражируется то, что уже работает</p>
<p>Ничего нового вы здесь не изобретаете</p>
</section>
<section>
<h2>1. Сначала проверьте, есть ли что масштабировать</h2>
<p>Масштаб подключается только тогда, когда у вас <strong>хотя бы один канал стабильно дает результат</strong></p>
<p>Не «один ролик залетел», а работает система: вы понимаете, что делаете, и понимаете, почему это откликается</p>
<p>Если этого нет - вы не на шестом уровне, вы на пятом, и вам туда</p>
<p>Потому что масштабировать то, что не работает, - это просто умножать ноль</p>
<p>Быстрее вы получите не результат, а усталость</p>
<p>То же самое со словом «автоматизировать»</p>
<p>Все любят автоворонки, но автоматизируется ровно то же правило: если система не работает, после автоматизации она будет не работать автоматически</p>
<p>В офлайне это видно нагляднее</p>
<p>Человек открыл точку общепита, хочет больше денег и открывает вторую</p>
<p>А первая настроена хреново - и начинается расфокус, куча энергии и внимания в две стороны, вторая точка работает так же хреново</p>
<p>Деньги приходят не через «умножить», а через одну единицу, отлаженную как часы</p>
<p>И только после этого - вторая</p>
</section>
<section>
<h2>2. Два пути роста - выберите свой</h2>
<p>Есть два разных способа расти, и их постоянно путают</p>
<blockquote><p>недавно посмотрел подкаст мастодонтов рынка инфобиза</p><p>Тимочко и Пыриков</p><p>первый - 1,1 млн подписчиков, супер-блогер, делает запуски на 160 млн рублей</p><p>второй - 120 тысяч подписчиков, рекордсмен геткурса, делает запуски на 200 млн рублей</p><p>один двигается через блог, шоу и охваты</p><p>второй - через эффективность, структуру и точечные касания</p><p>оба подхода работают</p></blockquote>
<p>Но второй путь гораздо лучше, когда у вас нет активов: большой аудитории и капитала на закуп рекламы</p>
<p>Когда каждая подписка на вес золота, а каждая заявка как колбаса в девяностых</p>
<p>Я сам пишу подписчикам лично</p>
<p>Сам обрабатываю каждую заявку</p>
<p>Иногда сам созваниваюсь</p>
<p>Потому что при таком подходе я нахожусь в той же ситуации, что и мой клиент: в дефиците подписчиков, трафика и внимания</p>
<p>И решения от этого становятся точнее</p>
<p>Если человек с 16 тысячами подписчиков делает запуск на 60 миллионов - значит и вы можете сделать свой миллион на тысяче подписчиков</p>
<p>Так что первый вопрос уровня не «как охватить больше людей»</p>
<p>А <strong>какой из двух путей ваш</strong></p>
</section>
<section>
<h2>3. Новый контент делают те, у кого старый плохой</h2>
<p>Фраза не моя, это Виталий Говорухин, но я ее украл, потому что она бьет точно</p>
<p>Первое, что делает человек на этом уровне, - садится придумывать новое</p>
<p>Хотя у него уже лежит гора того, что сработало</p>
<p>Соберите файл со ссылками на ваши лучшие единицы: посты в телеграме, рилсы, сторис, карусели</p>
<p>Чтобы под рукой всегда был контент, который можно перезалить</p>
<p>Туда же соберите папку с фото и видео футажами: их можно отдать монтажеру и постоянно использовать в сторис</p>
<p>Не переживайте, люди не помнят, что смотрели вчера</p>
<p>Попробуйте сами вспомнить, что вы смотрели вчера у кого-то - вряд ли получится</p>
<p>Одну идею вообще нужно рассказать пять-семь раз, чтобы она прижилась в голове человека</p>
<p>А если вам говорят «ты это уже рассказывал» - отлично, значит задача выполнена</p>
<p>Как перезаливать внутри одной площадки, мы разбирали на прошлом уровне</p>
<p>Здесь важна сама привычка: <strong>сначала смотрим, что уже есть, потом создаем новое</strong></p>
</section>
<section>
<h2>4. Одна начинка - разные формы</h2>
<div class="ix" data-ix="repurpose"></div>
<p>Вот основной инструмент этого уровня</p>
<p>Пост в телеграме превращается в сторис</p>
<p>Сторис превращается в рилс</p>
<p>Рилс превращается в пост</p>
<p>Длинное видео с ютуба режется на короткие</p>
<p>Статья становится длинным видео</p>
<p>Тред становится роликом</p>
<p>Начинка одна - меняется только форма</p>
<p>Вы уже собрали смысл, нашли пруф и упаковали его</p>
<p>Второй раз эту работу делать не нужно</p>
<p>Самый жирный пример - один рабочий созвон</p>
<p>Он превращается в длинное видео на ютубе: если запаковать обложку, название и SEO под поток спроса, даже записанный зум отлично сработает и приведет клиентов</p>
<p>Из того же исходника режется три шортса, две карусели, нарезки в рилс, пост или два в телеграм и тред</p>
<p>Один файл - и у вас закрыты почти все площадки</p>
<p>Вот как это выглядело у меня за один апрель</p>
<blockquote><p>я ни разу не создавал контент</p><p>не писал сценарии, не собирал контент-план, не организовывал съемки</p><p>все, что делал - писал в телеграм каждый день по двадцать минут</p><p>остальное - коллекция</p><p>итог: 200 000 охватов, 45 000 аккаунтов, 30% новой аудитории</p><p>это 15 000 человек, которые увидели меня и мой контент</p><p>при этом я занимался клиентами, бизнесом и собой, а не контентом</p></blockquote>
<p>И еще одна деталь оттуда же</p>
<p>Это были нарезки созвонов с клиентами и инсайты из работы</p>
<p>То есть такой контент <strong>по умолчанию продающий</strong></p>
<p>Вы не переупаковываете абстрактную пользу, вы показываете свою работу</p>
</section>
<section>
<h2>5. Площадки: куда вообще имеет смысл расширяться</h2>
<p>Здесь простой критерий, который отсекает половину вариантов</p>
<p class="punch">Есть площадки с органическими показами на новую аудиторию, а есть без них</p>
<p>Телеграм - закрытая экосистема</p>
<p>Там нет входящего трафика: чтобы туда пришли новые люди, их надо привести снаружи или купить рекламу</p>
<p>Писать в телеграм классно, но сам по себе он вам новых людей не принесет</p>
<p>Поэтому нужна хотя бы одна площадка с новым трафиком: рилсы, шортсы, тредс, длинные видео на ютубе</p>
<p>Они приводят людей, а телеграм их удерживает</p>
<p>Про российские площадки скажу честно</p>
<p>Несмотря на весь пуш и блокировки конкурентов, я не видел ни одного известного кейса органического роста</p>
<p>Наоборот, встречаю жалобы, что и за деньги льют ботов</p>
<p>Поэтому мой выбор - площадки, где органика реально работает</p>
<p>Чтобы не гадать, вот как это раскладывается по формам</p>
<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Ваша форма</th><th>Куда идти</th><th>Органика на новых</th><th>Что учесть</th></tr></thead><tbody><tr><td>Короткое видео</td><td>Reels, TikTok, YouTube Shorts</td><td>Есть, самая сильная</td><td>Одна съемка - три площадки, файл тот же</td></tr><tr><td>Длинное видео</td><td>YouTube</td><td>Есть, плюс работает поиск</td><td>Долго разгоняется, зато живет годами</td></tr><tr><td>Короткий текст</td><td>Threads</td><td>Есть, сейчас волна</td><td>30 секунд на пост, площадку пушат в ленте и сторис</td></tr><tr><td>Длинный текст</td><td>Telegram</td><td>Нет</td><td>Удерживает, но сам людей не приводит. Трафик заводим снаружи</td></tr><tr><td>Визуал, схемы</td><td>Карусели в Instagram</td><td>Есть</td><td>Собираются быстрее видео, живут дольше</td></tr><tr><td>Любая</td><td>Дзен, RuTube, ВК Клипы</td><td>Кейсов не видел</td><td>Пуш есть, органического роста не встречал</td></tr></tbody></table></div>
<p>Читается таблица так: слева то, что вам комфортно делать, справа - где это увидят новые люди</p>
<p>Отдельно про ютуб: он приводит не количество, а качество</p>
<p>У ролика может быть 200 просмотров и с них 200 заявок, потому что человек искал ровно это</p>
<p>Плюс длинные единицы прекрасно работают на прогрев</p>
<p>К вам пришел человек, заполнил анкету - а показать ему до созвона нечего, нечем создать доверие и авторитет</p>
<p>Вот для этого длинное видео и лежит, работая вдолгую</p>
<p>Если ваша форма стоит в строке без органики - вам нужна вторая площадка под ту же начинку, а не смена формы</p>
<p class="punch">Ключевое правило уровня: одна новая площадка за раз</p>
<p>Не все сразу</p>
<p>Раскачали одну, получили результат - только потом добавляете следующую</p>
<h3>Пример: как это сработало у меня в Threads</h3>
<blockquote><p>когда в тредс хлынула волна трафика, я начал туда писать</p><p>вам не нужно монтировать видео и писать сценарии - тридцать секунд и пост готов</p><p>за полгода заметил три вещи: комментируешь других - охваты растут, делаешь репост в сторис - большой охват на сторис, набирающий тредс рекомендуется в ленте инстаграма</p><p>и главное: оттуда пришел клиент</p><p>Женя, тренер по бегу из Ташкента, тот самый, с которым мы потом перешли на свободную форму</p><p>сначала он увидел мои посты и они ему откликнулись</p><p>потом посмотрел подкаст, который я туда выложил</p><p>потом я закинул карусель с результатами за январь - и это стало финальным аргументом</p><p>за первый месяц работы мы добавили к его доходу 1 200 долларов</p><p>при этом он не был подписан на меня в инстаграме и не смотрел мой контент там</p><p>только тредс</p></blockquote>
<p>Путь простой: <strong>привлечение, влюбление, авторитет</strong></p>
<p>Пост привлек внимание, подкаст показал живого человека и создал доверие, карусель с результатами дала авторитет</p>
<p>Три разные формы одного и того же смысла, разложенные по этапам</p>
<p>Второго клиента я нашел там же, просто в комментариях: мы долго переписывались, я позвал ее на созвон - сделка на 250 тысяч рублей</p>
<p>И честно скажу: я лез в тредс не ради масштаба</p>
<p>Я просто щупал и экспериментировал, потому что это моя работа</p>
<h3>Про новые площадки и терпение</h3>
<blockquote><p>в 2013 мы начали выкладывать видео на ютуб, когда никто вообще не вел соцсети</p><p>в 2016 начали вести влоги, когда это еще не было популярным</p><p>в 2019 начали делать тикток, когда площадку считали детской</p><p>в 2021 снимали короткую коммерческую рекламу, когда бизнесы еще пытались быть в соцсетях «бизнесами»</p><p>и каждый раз мы это бросали</p><p>потому что не видели вокруг подтверждения, что мы правы</p><p>нам не хватало терпения просто продолжать</p></blockquote>
<p>Заход на новую площадку почти всегда выглядит глупо в первые месяцы</p>
<p>Там мало людей, непонятные правила и никаких подтверждений, что вы не тратите время зря</p>
<p>Подтверждения приходят позже, и обычно к тем, кто не бросил</p>
</section>
<section>
<h2>6. Расширение зоны влияния</h2>
<p>Когда вы начали получать результаты в своем сегменте аудитории, зону влияния можно расширять</p>
<p>Сначала вы работаете с теми, кто уже ищет ровно то, что у вас есть</p>
<p>Дальше идете к тем, кто до вас еще не дошел</p>
<p>Здесь помогает <strong>лестница Ханта</strong> - пять ступеней осознанности</p>
<p>На верхней ступени человек выбирает, у кого купить: сравнивает вас с конкурентами. Таких меньше всего, зато они горячие</p>
<p>Ниже - выбирает решение: уже решил, что будет делать, ищет чем и с кем</p>
<p>Еще ниже - ищет варианты: понял проблему, смотрит, как ее вообще решают</p>
<p>Дальше - чувствует, что что-то не так: проблема есть, названия у нее пока нет</p>
<p>И на нижней ступени - вообще не думает об этом. Таких больше всего, и путь до покупки у них самый долгий</p>
<p>Ваш контент сейчас говорит с одной-двумя ступенями</p>
<p>Расширение - это спуск на ступень ниже: аудитория шире, но человек идет к вам дольше</p>
<h3>Два пути расширения</h3>
<p>Расширяться можно в две стороны: по <strong>аудитории</strong> или по <strong>тематике</strong></p>
<p>Возьмем пример: вы продаете и рассказываете про недвижимость в Дубае</p>
<p><strong>Путь первый - расширяем тематику.</strong> Тема остается, география уходит: вы говорите про недвижимость как таковую, людям из любой страны</p>
<p><strong>Путь второй - расширяем аудиторию.</strong> География остается, тема уходит: вы говорите про Дубай, а не только про квартиры в нем</p>
<p>А дальше расширение идет уже в жизнь за границей и лайфстайл</p>
<p>⚠️ Расширяем в одну сторону за раз, а не в обе сразу. Это то же правило, что и с площадками</p>
<p>Если вы готовы масштабироваться и хотите, чтобы я вам с этим помог - напишите мне в личку</p>
<p>Созвонимся и разберем вашу ситуацию</p>
</section>
<section>
<h2>7. Монетизация - следующий этап</h2>
<p>Дальше своими руками вы не вытянете</p>
<p>Чтобы расти, нужны будут другие люди - те, кто развяжет вам руки</p>
<p>А другим людям надо платить</p>
<p>Поэтому монетизация здесь не «когда-нибудь потом», а следующий этап</p>
<p>Пока контент не приносит денег, команду вам собирать не на что, и потолок остается там же, где был</p>
<p>И вот здесь происходит смена статуса</p>
<p>Вы перестаете быть просто автором, который делает контент</p>
<p>Вы переходите в статус небольшого предпринимателя: у вас появляются люди, обязательства перед ними и расходы, которые надо отбивать</p>
<p>Это звучит страшнее, чем есть</p>
<p>Но именно с этого момента ваши сутки перестают быть потолком</p>
<p>И тут важный момент по срокам</p>
<p>Как только у вас пойдет трафик, монетизацию придется подключать</p>
<p>Иначе получается глупо: люди приходят, а взять с них нечего - продавать нечего, оффера нет, и вкладывать в команду тоже не из чего</p>
<p>Как я могу вам с этим помочь</p>
<p>Вы можете добрать к курсу все мои материалы по заработку через блог и в онлайне - те самые, которые мы использовали с Васей</p>
<p>Плюс доступ к общему чату, где я даю обратную связь</p>
<p>Плюс созвон раз в месяц для вопросов и сверки, кто где находится</p>
<p>Плюс каждую неделю я выкладываю туда дополнительные материалы: прикладные инструменты, промпты под нейронку, разборы продающих созвонов</p>
<p>Стоит это 10 000₽ в месяц, минус то, что вы заплатили за этот курс</p>
<p>Взяли курс за 3 450 - первый месяц выходит 6 550, дальше снова 10 000 в месяц</p>
<p>По-моему, это адекватная цена: если я помогу вам выйти хотя бы на 100 тысяч в месяц, это 10% от них, а на 500 тысячах - вообще копейки</p>
<p>Предложение действует месяц с момента покупки</p>
<p>Если интересно - напишите мне лично, я выдам доступ</p>
<p>И еще одна вещь, ради которой все это затевается</p>
<p>До этого момента вы были единственным вложением в свой блог</p>
<p>Вкладывали энергию и время, потому что других ресурсов не было</p>
<p>Выстроили монетизацию - блог начал приносить деньги</p>
<p>И вот теперь эти деньги можно вернуть обратно в блог: подрядчики, платный трафик, продакшн</p>
<p>Круг замыкается, и дальше он крутится сам</p>
<p>Каждый следующий оборот вы вкладываете уже не только себя</p>
</section>
<section>
<h2>8. Команда</h2>
<p>Про монтажера и ассистента мы подробно разбирали на четвертом уровне, повторяться не буду</p>
<p>Здесь только одно уточнение</p>
<p>На четвертом уровне команда нужна была, чтобы вернуть себе время</p>
<p>На шестом она нужна, чтобы масштаб вообще стал возможен</p>
<p>Своими руками вы упретесь в потолок: сутки не растягиваются</p>
<p>Кто нужен по порядку</p>
<p><strong>Монтажер.</strong> Первый, кого стоит взять</p>
<p>Монтаж одного ролика у меня занимал от часа до двух, а рилс я делаю каждый день</p>
<p>Даже посчитав по минимальной стоимости, я себе сохраняю 7 часов в неделю</p>
<p>Это целый рабочий день</p>
<p>Средняя цена на рынке за один короткий ролик - от 20 до 40 долларов, за пакет обычно дают скидку</p>
<p>С Максом мы работаем больше полутора лет, и первые два-три месяца ушли на то, чтобы выстроить процесс и объяснить, что мне нужно на выходе</p>
<p>Это нормально, сразу не бывает</p>
<p><strong>Ассистент.</strong> Второй</p>
<p>Я не могу купить себе новое время, но я могу купить время другого человека</p>
<p>Что делает мой: загружает рилсы в инстаграм, выкладывает посты в телеграм, выдает материалы клиентам, заливает контент в платное сообщество, ищет подрядчиков на точечные задачи и общается с ними</p>
<p>Давайте посчитаем математику</p>
<p>Загрузка рилса - 10 минут, пост в телеграм - 5 минут, выдача материалов - 10 минут, загрузка в сообщество - 10 минут</p>
<p>30 минут в день превращаются в 3 часа на неделе</p>
<p>Сюда добавляем поиск подрядчиков и коммуникацию с ними - и выходит 6 часов</p>
<p>Снова целый рабочий день</p>
<p>Первого ассистента я уволил, и это тоже нормально: был шорт-лист, взял следующего</p>
<p><strong>Технический специалист.</strong> Третий, точечно</p>
<p>Собрать воронку, лендинг, бота, подключить оплату</p>
<p>Это не человек на постоянку, это задачи под конкретный запуск</p>
<p>Итого два дня в неделю, которые вы себе возвращаете</p>
<p>Да, придется платить деньги, и это хорошо: появляются дополнительные обязательства</p>
<p>Когда вы поймете, что можете на единицу времени делать больше действий, мозг уже не сможет работать по-старому</p>
</section>
<section>
<h2>9. Платный трафик</h2>
<p>Скажу сразу и честно: я не эксперт по платному трафику и закупу рекламы</p>
<p>Я разбираюсь в контенте, а контент - это и есть бесплатный трафик</p>
<p>Но рамку дам, потому что вопрос возникает у всех</p>
<p>Платный трафик подключается тогда, когда <strong>у вас уже настроена монетизация</strong></p>
<p>То есть вы понимаете, откуда приходят люди, что вы им продаете и сколько с этого получаете</p>
<p>Если этого нет, платный трафик просто быстрее покажет вам, что система не работает</p>
<p>Дороже и обиднее</p>
<p>И еще одна мысль, которая мне важна</p>
<p>Трафик - это базовая задача, которая должна делаться постоянно, вне зависимости от переменных</p>
<p>Платный или бесплатный - не так важно</p>
<p>Без притока новой аудитории проект начинает сохнуть</p>
<p>Болезни, боковой ветер, любые обстоятельства - система должна работать</p>
</section>
<section>
<h2>Антипаттерны этого уровня</h2>
<ul><li><strong>«Надо просто больше выкладывать»</strong> - прямая дорога обратно на третий уровень, где контент бесит</li><li><strong>Лить сразу на все площадки</strong> - вы не раскачаете ни одной, зато устанете от всех</li><li><strong>Мыслить масштабом вместо действий</strong> - самое коварное. Если контент перестал создаваться, вы не масштабируетесь, а фантазируете. Снизьте планку: возьмите одну площадку, а если нет времени и денег на продакшн - используйте записи созвонов</li><li><strong>Ждать, что масштаб отменит откаты</strong> - не отменит. Это навык, а не разовая акция</li></ul>
<blockquote><p>мне написал Макс, крутейший монтажер</p><p>если бы он пытался выбить страйк в рилсах и сразу строить воронку - вряд ли вышел бы из найма</p><p>но даже ролик на восемь тысяч просмотров, когда у тебя есть оффер, приводит клиента</p><p>образуется нейронная связь: контент - это деньги</p><p>правда есть и обратная сторона: после этого часто ничего не делается</p><p>а любое действие - это поход в спортзал</p><p>как минимум вы поддерживаете форму</p></blockquote>
</section>
<section>
<span class="slabel">коротко</span><h2>Саммари</h2>
<ul><li>Масштаб - это не больше усилий, а больше результата с тех же усилий</li><li>Подключаем его, только когда хотя бы один канал стабильно работает</li><li>Есть два пути роста: через охваты и шоу или через эффективность и точечные касания. Второй лучше, если нет активов</li><li>Сначала смотрим, что уже сработало, и только потом создаем новое</li><li>Одна начинка - разные формы: пост, сторис, рилс, нарезка, статья</li><li>Расширяемся только туда, где есть органика на новую аудиторию. Одна площадка за раз</li><li>Дальше своими руками не вытянуть: нужны люди, а людям надо платить. Поэтому монетизация - следующий этап, и здесь вы переходите в статус небольшого предпринимателя</li><li>Команда по порядку: монтажер (7 часов в неделю), ассистент (6 часов), технический специалист точечно под запуски</li><li>Платный трафик подключается последним, когда монетизация уже работает</li></ul>
</section>
<section>
<span class="slabel">делаем руками</span><h2>Задача</h2><div class="taskbox"><div class="tt">задача уровня</div>
<ul><li>1. Соберите файл со ссылками на свои лучшие единицы за все время. Минимум десять штук</li></ul>
<ul><li>2. Возьмите три из них и переупакуйте в другую форму: пост в сторис, рилс в пост, длинное видео в нарезку. Ничего нового не придумывайте</li></ul>
<ul><li>3. Выберите ОДНУ новую площадку с органикой на новую аудиторию. Не две</li></ul>
<ul><li>4. Ответьте себе, какой из двух путей роста ваш, и что это меняет в ближайшем месяце</li></ul>
<ul><li>5. Подключите монетизацию и начните зарабатывать с блога. Без этого вы не сможете заниматься контентом долго: я делаю этот курс и весь свой контент только потому, что зарабатываю с этого деньги. Иначе на что жить и чем закрывать обязательства</li></ul>
</div></section>
<section>
<span class="slabel">проверка</span><h2>Маркер, что вы закрепились на уровне</h2><div class="markerbox"><div class="tt">как понять, что уровень закрыт</div>
<p>Вы перестали спрашивать «что бы еще создать» и начали спрашивать «что из того, что уже сработало, еще не отработало на полную»</p>
<p>Плюс два маркера рядом: из блога начали приходить деньги и вокруг вас начала образовываться небольшая команда</p>
</div></section>
<section>
<h2>Что дальше</h2>
<p>Дальше финальная часть, где мы соберем все шесть уровней вместе и я добавлю несколько ключевых тейков</p>
<p>Вы почти на финишной прямой</p>
<p>И просьба: если по курсу останутся вопросы или обратная связь - чего не хватило, где я рассказал лишнего, где перегрузил - напишите мне</p>
<p>Со временем я сделаю апгрейд этого продукта, и доступ к нему у вас, скорее всего, тоже будет</p>
</section>

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
