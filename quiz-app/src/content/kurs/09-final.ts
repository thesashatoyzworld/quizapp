// Статья урока «09-final» курса «Новый Уровень Контента».
// СГЕНЕРИРОВАНО: GSD-BRAND/scripts/kurs-to-ts.mjs 09 — руками не править,
// править исходник kurs/09-final.html и перегенерировать.

export const FINAL_09 = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Что у вас теперь есть · Новый уровень контента</title>
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
  <div class="lvlbadge">Финал</div>
  <h1>Что у вас теперь есть</h1>
  <p class="dek">Курс пройден. Что вы унесли, три принципа и что делать дальше.</p>
  <div class="taskline"><b>Задача:</b> Жить по своей карте: сверка раз в месяц, чинить сломавшееся, масштабировать работающее.</div>
</div></header>

<!--VIDEO_SLOT-->


<main class="wrap">
<section>
<p>Идет после шестого уровня. Закрывает курс и отправляет человека в работу.</p>
<p>Вот и все</p>
<p>Мы прошли шесть уровней, и я хочу закончить тем же, с чего начинал</p>
</section>
<section>
<h2>Контент - это навык, а не лотерея</h2>
<p>Именно поэтому мы шли по уровням, а не по чек-листу «как сделать вирусный ролик»</p>
<p>Чек-лист выдает результат один раз и то, если повезет</p>
<p>Навык накапливается</p>
<p>Каждое действие, которое вы сделали за это время, осталось с вами</p>
<p>Вы не можете здесь проиграть - можете только остановиться</p>
<p>И даже если остановитесь, вы вернетесь не в ноль, а туда, где сломалось. Мы это разбирали</p>
</section>
<section>
<h2>Что у вас теперь есть</h2>
<div class="ix" data-ix="path"></div>
<p>Пройдитесь глазами по списку, это ваш реальный результат:</p>
<ul><li>вы понимаете, <strong>зачем</strong> вам этот блог, и у вас есть цепочка, которая держит его в приоритетах</li><li>вы <strong>начали</strong> и знаете, как обходить свою систему безопасности, а не бороться с ней</li><li>вы знаете, <strong>почему бросили</strong> в прошлый раз и что делать, если это повторится</li><li>вы собрали <strong>комфортную среду</strong>: свою форму, свою правду и свою ставку</li><li>вы <strong>сжали время</strong> и больше не отдаете контенту полдня</li><li>вы знаете, откуда берется <strong>отклик</strong>: поток спроса плюс ваша правда, упакованные так, чтобы человек узнал себя</li><li>вы умеете <strong>масштабировать</strong> то, что работает, вместо того чтобы просто пахать больше</li></ul>
<p>Это и есть та карта, которой нет у 99% людей, делающих контент</p>
<p>Не потому что она секретная</p>
<p>А потому что почти никто не разбирает свой контент по уровням: все пытаются решить шесть задач одновременно и не решают ни одной</p>
</section>
<section>
<h2>Три принципа, на которых все держится</h2>
<p>Если забудете все остальное, оставьте эти три</p>
<p class="punch">Первый: создавайте вокруг правды и вокруг того, во что верите</p>
<p>Это единственное, что нельзя делегировать ни человеку, ни нейронке</p>
<p>И единственное, что люди по ту сторону экрана считывают безошибочно</p>
<p class="punch">Второй: оптимизируйте процесс создания, а не результат</p>
<p>На результат вы не влияете, это барабан</p>
<p>На процесс влияете полностью</p>
<p>Именно поэтому весь курс был про процесс, а цифры пришли как следствие</p>
<p class="punch">Третий: давайте своему контенту много шансов</p>
<p>Одна идея - несколько заходов</p>
<p>Не сработало с первого раза не значит плохо</p>
<p>Вы не проигрываете, пока продолжаете делать ставки</p>
</section>
<section>
<h2>Что дальше</h2>
<p>Дальше вы просто живете по своей карте</p>
<p>Раз в месяц - сверка: где я, что изменилось, не откатило ли</p>
<p>Когда откатывает - возвращаетесь на сломавшийся уровень и чините</p>
<p>Когда все работает - масштабируете</p>
<p>Никакой новой системы вам не нужно</p>
</section>
<section>
<h2>Если курс вам помог</h2>
<p>И вы считаете, что о нем должно знать больше людей - поделитесь в сторис, расскажите друзьям</p>
<p>И это не в одну сторону</p>
<p>Я сделаю вам отдельную ссылку - вашу личную, по ней видно, кто пришел от вас</p>
<p>С каждой покупки по этой ссылке отдам вам 20% как благодарность за то, что рассказали обо мне</p>
<p>Напишите мне - выдам ссылку</p>
</section>
<section>
<h2>Последнее</h2>
<p>Я не смогу сделать так, чтобы у вас все получилось</p>
<p>Никто не сможет</p>
<p>Я могу показать, где висят замки и какие ключи их открывают, - это я и сделал</p>
<p>Дверь открываете вы</p>
<p>И знаете что, самое приятное во всей этой истории?</p>
<p>Вам не нужно быть особенным, талантливым или интересным</p>
<p>Вам нужно продолжать</p>
<p>Все остальное - вопрос времени</p>
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
