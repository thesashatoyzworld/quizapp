// Статья урока «05-uroven-4» курса «Новый Уровень Контента».
// СГЕНЕРИРОВАНО: GSD-BRAND/scripts/kurs-to-ts.mjs 05 — руками не править,
// править исходник kurs/05-uroven-4.html и перегенерировать.

export const UROVEN_4_05 = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Не бесит, но жрёт время · Новый уровень контента</title>
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
  <div class="lvlbadge">Уровень 4</div>
  <h1>Не бесит, но жрёт время</h1>
  <p class="dek">Процесс собран, сопротивления почти нет. Но один ролик — и половина дня прошла.</p>
  <div class="taskline"><b>Задача:</b> Сжать время на создание контента. Не найти больше, а сжать.</div>
</div></header>

<!--VIDEO_SLOT-->


<main class="wrap">
<section>
<p>Вы уже делаете контент и он вас не бесит</p>
<p>Процесс выстроен, сопротивления почти нет</p>
<p>Но есть другая беда - он забирает слишком много времени</p>
<p>Один ролик - и половина дня прошла</p>
<p>Неделя заканчивается, а вы сделали две единицы вместо пяти</p>
<p>И в какой-то момент вы снова ставите паузу - просто чтобы выдохнуть</p>
<p>Задача этого уровня - сжать время на создание контента</p>
<p>Обратите внимание: не найти больше времени, а сжать</p>
<p>Потому что больше времени не будет</p>
<p>У всех нас 24 часа в сутках - и у бомжа на улице, и у миллиардера в самолете</p>
<p>Можно, конечно, отрезать от сна</p>
<p>Но это не мой подход - здоровье и свое состояние я считаю самым дорогим, что у меня есть</p>
<p>Поэтому вопрос звучит иначе:</p>
<p class="punch">"как мне освободить свое время, чтобы заниматься более важными вещами?"</p>
<p>Вы проходите этот уровень в тот момент, когда контентная единица занимает столько времени, сколько вы ей отвели</p>
<p>А не столько, сколько она захочет забрать</p>
</section>
<section>
<h2>Чем опасно застрять здесь</h2>
<p>Тем, что вы откатитесь на уровень назад</p>
<p>Когда на одну единицу уходит полдня, а результат приходит не сразу - контент снова начинает раздражать</p>
<p>Вы вкладываете все больше времени, а взамен получаете столько же</p>
<p>И вот здесь важное: что будет дальше с этим раздражением, зависит уже не от вас</p>
<p>Потому что дальше решает не качество вашего ролика, а розыгрыш</p>
<p>Если ролик выстрелил - раздражение как рукой сняло. Только вы ничего не изменили, просто выпал джекпот</p>
<p>Если не выстрелил - оно никуда не делось и копится дальше, потому что вы целитесь в результат</p>
<p>А самый тяжелый вариант - когда сначала выстрелил, а потом перестало</p>
<p>Теперь вы знаете, что бывает по-другому, и начинаете гнаться за повтором того раза</p>
<p>А он не повторяется, потому что это была не ваша заслуга, а розыгрыш</p>
<p>Вот здесь психику ломает по-настоящему</p>
<p>Дальше пауза, потом еще одна, а потом вы снова стоите там, откуда пришли</p>
<p>Сжатие времени - это не про эффективность</p>
<p>Это про то, чтобы защитить то, чего вы уже добились на прошлом уровне</p>
</section>
<section>
<h2>1. Сначала снимаем оценку, потом механику</h2>
<p>Ко мне все чаще приходят люди, которые откладывают работу с контентом по одной причине</p>
<p>Слишком сложно</p>
<p>Парни заморачиваются над монтажом и пытаются выдавать сумасшедший креатив</p>
<p>Дамы задалбываются три часа наводить марафет, снимать это все так, чтоб "красиво" было, а потом расстраиваются, что это набирает 400 просмотров</p>
<p>И что все делают в итоге?</p>
<p>Бросают</p>
<p>Потому что количество вложенных усилий и времени вообще не пропорционально результату</p>
<blockquote><p>Сева</p><p>Сева делает очереди для бизнесов с помощью органического контента, мы работаем вместе три месяца и уже зашли в партнерство</p><p>он делает ролики на сотни тысяч просмотров для других</p><p>на вопрос "почему ты до сих пор не сделал для себя то, что делаешь для других?" ответ был такой:</p><p>"каждый раз это сложно и больно, потому что идеи, которые я придумываю - очень крутые"</p><p>а раз крутые - значит требуют кучу времени на реализацию</p><p>в итоге процесс встает</p><p>у него на идеи и сценарий уходило по четыре часа</p><p>четыре часа - и это при том, что у него есть еще клиенты и своя работа</p><p>я предложил ему простую вещь: давай примем, что ты уже крутой и то, что ты делаешь и говоришь, по умолчанию заебись. И перестань это оценивать</p><p>сейчас он собирает две единицы контента за пятнадцать минут - по дороге на съемку, в машине, без единой заготовленной идеи</p><p>причем механику мы не меняли</p><p>он просто перестал оценивать то, что делает</p></blockquote>
<p>Тем, кто работает с контентом профессионально, здесь даже сложнее</p>
<p>Есть такая вещь, как творческая мана. Мы ее отдаем клиентам</p>
<p>Психолог или фитнес-тренер поработал с клиентом и сел за контент - у него хотя бы задача меняется. А у нас она не меняется</p>
<p>Вот что он сам говорит про то, как это выглядело изнутри:</p>
<video src="/kurs/assets/seva-otzyv.mp4" controls playsinline style="width:100%;margin:20px 0;border:1px solid #ddd"></video>
<blockquote><p>«когда мы первый раз с тобой созванивались, ощущалось напряжение от того, что ты ни хрена не успеваешь, от непонимания того, как это всё успеть, где брать вообще силы на это»</p><p></p><p>«ты сказал, что я смогу взять больше проектов - я поверил, особо не думал об этом, просто сделал и взял их»</p><p></p><p>«и я не чувствую себя в этом так, как мне казалось - что я буду сходить с ума, что мне будет плохо и больно»</p><p></p><p>«это про то, что <strong>не нужно себя оценивать</strong>. вот это, наверное, ключевое»</p><p></p><p>«и цену я сейчас очень спокойно называю. когда я её называл три недели назад, это было очень странно, а сейчас как будто уже пора повысить»</p></blockquote>
<p>Обратите внимание, чего в этом отзыве нет</p>
<p>Там нет ни одного нового приема, ни одной новой программы для монтажа и ни одного лайфхака</p>
<p>Человек просто перестал оценивать свою работу в процессе - и у него освободилось время, а вместе со временем и силы взять больше проектов</p>
<p>И это поголовно у всех</p>
<p>Я специально провел эксперимент, чтобы показать: картинка второстепенна</p>
<p>Взял и сделал две единицы контента максимально быстро</p>
<p>Рилс за 3 минуты - вообще без монтажа, на две с половиной минуты, то есть по всем правилам сделанный "неправильно"</p>
<p>И карусель за 15 минут</p>
<p>Вот статистика по обеим</p>
<img src="/kurs/assets/sasha-15min-experiment.jpg" alt="">
<p>Рилс за 3 минуты: 12 297 просмотров, 470 лайков, 174 пересылки и 55 подписок</p>
<p>Карусель за 15 минут: 89 140 просмотров, 1 432 посещения профиля и 221 подписка</p>
<p>Я просто включил камеру, сказал что хотел, и выложил</p>
<p>И моя психика после такого в принципе не может тратить на такой контент больше времени</p>
<p>Вот в чем фокус этого уровня</p>
<p>Люди думают, что они медленные, потому что не знают приемов</p>
<p>А они медленные, потому что оценивают каждую свою единицу, пока делают ее</p>
<p>Дело не в том, что я быстрый</p>
<p>Я просто не оцениваю то, что делаю</p>
<p>И это вообще не моя задача. Оценивать - работа зрителей, аудитории и клиентов. Моя работа - действовать</p>
<p>Ориентир простой: делайте, пока идет. Как только начали сидеть и злиться, что задолбало, - все, выкладываем. Не надо доводить себя до этой точки</p>
<img src="/kurs/assets/l4-do-posle.png" alt="">
<p>Вот вся разница</p>
<p>Слева четыре часа, гора дублей, ночь, и человек вцепился в телефон - на стене у него висит счетчик просмотров, и там двадцать три</p>
<p>Справа на стене висит уже не счетчик, а таймер: полчаса и стрелка на следующую задачу</p>
<p>Телефон лежит экраном вниз, он на него даже не смотрит. Выложил и пошел дальше</p>
<p>Беру и делаю так, будто я уже звезда голливудская</p>
<p>Чтобы перестать оценивать, придется принять, что:</p>
<ul><li>вы уже заебись</li><li>вам уже можно делать так, как хочется вам</li><li>количество времени не влияет на качество</li><li>качество это вещь субъективная</li></ul>
<p>Вы не станете заебись, когда сделаете сто роликов. Вы уже</p>
<p>Здесь подключается эго, и его надо развести: ваш продукт - это одно, а контент - другое</p>
<p>На работу с клиентом и на свою услугу вы тратите время сколько нужно. Контент - это просто инструмент, и он не обязан быть того же качества, что ваш продукт</p>
<p>Я собираю контент за 15 минут, и меня это никак не дискредитирует как эксперта. Вы же заплатили мне не потому, что у меня красиво, а потому что я говорю вещи, которые у вас отзываются</p>
<p>Разрешение делать так, как хочется, вам никто снаружи не выдаст</p>
<p>Карусель за 15 минут собрала 89 тысяч просмотров, а вылизанный ролик лежит на 23. Время тут ни при чем</p>
<p>И то, что вы считаете сырым, для человека по ту сторону экрана может быть лучшим, что он сегодня видел</p>
<p class="punch">А как это принять?</p>
<p>Возвращайтесь на первый уровень, в блок про самоценность. Скорее всего, авария где-то там</p>
<p>Это не про скорость и не про приемы. Это про то, что вы себе так и не засчитали</p>
<p>Помните вопрос с прошлого уровня?</p>
<p class="punch">"а как бы это было, если бы это было легко?"</p>
<p>Я всегда хотел снимать за 3 минуты и выкладывать</p>
<p>И единственное, что меня останавливало - это "так неправильно"</p>
<p>Плевать на это правильно</p>
<p>Главное, что я делаю и выкладываю</p>
</section>
<section>
<h2>2. Списки задач не работают - работает расписание</h2>
<p>Знакомая картина?</p>
<p>Работаешь всю неделю</p>
<p>Вычеркиваешь задачки</p>
<p>Сидишь в пятницу и понимаешь, что как будто бы ничего не сделал</p>
<p>Ведь список задач не закончился, а неделя прошла</p>
<p>Я так жил - мне не понравилось</p>
<p>Списки задач никогда не заканчиваются</p>
<p>Но выматывает не это</p>
<p>Выматывает то, что вы ни разу не доходите до конца</p>
<p>Вы вычеркнули одну задачу - и тут же прилетело две. Вычеркнули еще - и снова две</p>
<p>Счетчик растет, а ощущения "я закончил" не наступает ни разу за неделю</p>
<p>Это замкнутый круг, в котором нет точки завершения</p>
<p>И вот откуда он берется</p>
<p>Когда вы идете от ЦЕЛИ, цель закреплена: ролик должен быть таким-то, и точка</p>
<p>А раз она закреплена - подстраивается все остальное. Время растет, силы уходят в ноль, а если не хватает - вы доплачиваете деньгами</p>
<p>Цель держим любой ценой, а значит переплачиваем ресурсом</p>
<p>А когда вы отталкиваетесь от РЕСУРСА - у меня есть один час - подстраивается уже объем</p>
<p>И это перестает быть подвигом. Это просто работа</p>
<p>И самая частая ошибка - формулировать задачу как конечный результат ("сделать вебсайт") и ставить дедлайн в неделю</p>
<p>Скорее всего не успеете, потратите нервы и получите саботаж</p>
<p>Наш мозг не умеет адекватно оценивать объем работы</p>
<p>Поэтому я начал с другого конца - со своего времени</p>
<p>Сначала собрал черновик расписания</p>
<p>Завтрак, обед, ужин - очевидные таймблоки</p>
<p>Дальше тренировки и прогулки по часу в день</p>
<p>Потом еженедельные созвоны</p>
<p>Утром - четыре часа на работу</p>
<p>И только когда черновик собран - вы вписываете туда задачи</p>
<p>Тогда у задачи появляется <strong>органичный дедлайн</strong></p>
<p>Не выдуманный вашим амбициозным умом, который плохо оценивает собственные силы, а честный: нельзя потратить на задачу больше времени, чем есть в расписании</p>
<p>Все, что не успели за неделю - досвидания</p>
<p>Значит не сильно было важно. Либо вы неадекватно оценили объем: решили собрать сайт за неделю, а сайт за неделю не собирается</p>
<p>И ничего страшного. Сделали 30% - красавчик, на следующей неделе еще двадцать. Большие штуки только так и собираются</p>
<p>И тут важная оговорка: чтобы понимать, что для вас важно, а что нет, нужна цель. Про это - в блоке <i>Цель и мотивация блога</i></p>
<p>Боитесь не успеть?</p>
<p>В этом и смысл - создать условия, в которых ваш ум начнет работать</p>
<p>Я тоже порой не успеваю, но зато:</p>
<ul><li>чувствую себя спокойнее</li><li>делаю необходимое</li><li>не делаю лишнее</li><li>не трачу больше времени и сил, чем нужно</li><li>не занимаюсь дрочней с полировкой своей работы</li></ul>
<p>Помните схему с прошлого уровня, где сложность задачи встречается с вашим навыком?</p>
<p>Здесь то же самое</p>
<p>Слишком высокая планка - зона стресса, психика долго там не живет и найдет способ бросить</p>
<p>Слишком низкая - скука, и вы тоже бросите</p>
<p>Поэтому я за таймблоки: лучше тратить на задачу по часу в день и двигаться, чем убиться об одну задачу и сыграть в лотерею</p>
<p>Как это выглядит у меня: обычная гугл-таблица на неделю</p>
<p>Я не люблю календари и однодневные списки - мне важно видеть всю неделю и пространство времени</p>
<p>Перепробовал кучу подходов к тайм-менеджменту, для меня этот оказался самым эффективным</p>
<img src="/kurs/assets/raspisanie-nedeli.png" alt="">
<p>Зеленые - сон</p>
<p>Голубые - повторяющиеся личные блоки: подъем, завтрак, прогулка, тренировка, обед, ужин</p>
<p>Бежевые - приоритетный проект, то есть задачи, которые двигают меня вперед</p>
<p>Оранжевые - контент: идеи, сценарии, съемка</p>
<p>Синие и белые - созвоны с сообществом и клиентами</p>
<p>Розовые - свободное пространство</p>
<p>Обратите внимание на две вещи</p>
<p>Первая: свободного пространства в этой таблице очень много, и выходные там полностью свободны</p>
<p>Я поражаюсь, когда люди собирают расписание и не оставляют себе места, чтобы ничего не делать</p>
<p>Представьте комнату, заставленную коробками. В ней не пройти и нечем дышать</p>
<p class="punch">Комфорт создают не объекты, а пространство между ними</p>
<p>Оставьте себе хотя бы час в день, когда вы ничего не планируете и просто бездельничаете. Это чит-код, и я не преувеличиваю: за одну эту мысль я готов брать деньги отдельно</p>
<p>Вторая: контент занимает несколько блоков в неделю, а не размазан по всем дням</p>
<p>Утро - самое продуктивное время, там стоят рычаги</p>
<p>У меня это писательство: каждое утро минимум час я пишу, и от этого выстраивается все остальное - идеи, сценарии, воркшопы, контент</p>
<p>Утро я держу под глобальные задачи, потому что только они вытаскивают из замкнутых циклов и двигают проект вперед</p>
<p>Срочное подождет. Оно всегда будет ломиться в ваш день: вам будут писать, звонить и требовать</p>
<p>И если вы сами не поставите свои глобальные задачи, ваши приоритеты расставят другие люди</p>
<p>Не можете выделить четыре часа - выделите сколько можете</p>
<p>Один час в день, но каждый день - уже быстрее, чем ничего</p>
</section>
<section>
<h2>3. Задача занимает ровно столько, сколько вы на нее отвели</h2>
<div class="ix" data-ix="calc"></div>
<p>Это закон Паркинсона</p>
<p>Отвели час - сделаете за час</p>
<p>Отвели день - будете делать день, и результат при этом не станет лучше в шесть раз</p>
<p>Поэтому дедлайн ставится не под результат, а под кусок времени</p>
<p>Несколько живых замеров, чтобы вы понимали масштаб:</p>
<ul><li>пост в телеграм и сценарий рилса по нему - 6 минут, без нейросетей</li><li>пост, который вы сейчас читаете кусками - 9 минут</li><li>полтора часа: пост в телеграм, 6 тредсов, карусель, смонтированный рилс и сторис</li></ul>
<p>Полтора часа, ребята</p>
<p>Не поверю, что у вас их нет</p>
<p>Один час - контент на неделю</p>
<p>Стоит попробовать один раз, и вы удивитесь, сколько свободного времени появится в графике</p>
</section>
<section>
<h2>Посчитайте, сколько вы сливаете</h2>
<p>У нас есть три ресурса: деньги, время и энергия</p>
<p>Они друг с другом обмениваются, и это работает так:</p>
<ul><li>нет денег - вы не туда тратите время и энергию</li><li>нет времени - вы не туда тратите деньги и энергию</li><li>нет энергии - вы не туда тратите время и деньги</li></ul>
<p>Время из них самое ценное, потому что купить его нельзя. Можно купить чужое, но для этого нужны деньги</p>
<p>Спросите про ценность времени у человека, которому восемьдесят. Сколько он отдал бы за то, чтобы снова оказаться в вашем возрасте</p>
<p>Теперь посчитайте свою неделю</p>
<p>Допустим, вы делаете пять каруселей в неделю и на каждую тратите три часа</p>
<p>Это 15 часов в неделю и 65 часов в месяц</p>
<p>А теперь сожмите единицу до тридцати минут: остается 11 часов в месяц</p>
<p>Пусть не тридцать минут, пусть час. Все равно вы выигрываете десятки часов - и это часы вашей жизни, а не абстрактная эффективность</p>
</section>
<section>
<h2>4. Коллекционируй, а не создавай</h2>
<p>Однажды я услышал фразу от своего ментора:</p>
<p class="punch">"контент не надо создавать - его надо коллекционировать"</p>
<p>Так как раньше я тратил на контент огромное количество времени и энергии - она не давала мне покоя</p>
<p>Но наблюдая, как искусно он ее использует, я влюбился в эту фразу и добавил в свою Библию Контента</p>
<p>Смысл простой</p>
<p>Пилить доску - это работа</p>
<p>Опилки от работы - это контент</p>
<p>Заполнить календарь заявками сложно, а сделать скриншот календаря с заявками - просто. Две минуты, и он уже в сторис</p>
<p>Пример прямо сейчас: я записываю этот курс. Из любого куска можно достать рилс, а любой урок целиком уехать длинным видео на ютуб. Работа уже сделана, контент из нее просто нарезается</p>
<p>Контент происходит вокруг вас каждый день: дома, на отдыхе, на работе</p>
<p>Наша задача - порой просто включать камеру</p>
<blockquote><p>я ленивый и это хорошо</p><p>я ненавижу делать двойную работу</p><p>я посмотрел на количество записанных Zoom с клиентами и решил, что надо их использовать</p><p>эти видео лежали без дела - больше 100 штук накопилось за год</p><p>взял одно, отправил монтажеру, он прислал хронометраж, мы утвердили, он сделал нарезку</p><p>полное видео на YouTube набрало 2 200 просмотров и привело 30+ человек в телеграм</p><p>а одна из нарезок пошла в разгон</p><p>все, что я сделал - отправил файл, который лежал на жестком диске</p><p>пять минут моего времени</p><p>[разбор целиком](<a href="https://t.me/sashatoyz/1352" target="_blank" rel="noopener">https://t.me/sashatoyz/1352</a>) · [и вот тут](<a href="https://t.me/sashatoyz/1446" target="_blank" rel="noopener">https://t.me/sashatoyz/1446</a>)</p></blockquote>
<p>Вот тот самый ролик, нарезанный из рабочего созвона</p>
<p>Слева - статистика через пять дней после публикации</p>
<p>Справа - тот же ролик спустя три месяца</p>
<p><img src="/kurs/assets/kazahskiy-marketing-189k.jpg" alt=""> <img src="/kurs/assets/kazahskiy-marketing-406k.jpg" alt=""></p>
<p>189 401 просмотр превратились в 406 564</p>
<p>14 тысяч лайков, 6,6 тысяч пересылок, 2,4 тысячи сохранений и 1 507 действий в профиле</p>
<p>А вот он же сегодня</p>
<img src="/kurs/assets/kazahskiy-marketing-491k.jpg" alt="">
<p>491 609 просмотров, 17 тысяч лайков, 7,5 тысяч пересылок и 3,1 тысячи сохранений</p>
<p>Ролик на 31 секунду, который я не придумывал, не писал и не снимал специально</p>
<p>Помимо просмотров это видео запустило переговоры о съемке на Алматинской телебашне, куда никого не пускают, и организовало пару рабочих встреч</p>
<p>Как это выглядит технически:</p>
<ul><li>ставите телефон сбоку на рабочей встрече и записываете</li><li>скидываете файл монтажеру</li><li>он присылает тайм-коды - какие куски можно взять</li><li>вы отмечаете, что берете</li><li>он режет</li></ul>
<p>Если у вас айфон - не скачивайте и не заливайте файлы никуда, есть функция "поделиться ссылкой на iCloud"</p>
<p>Минута вашего времени вместо сорока</p>
<h3>Где искать контент, который у вас уже есть</h3>
<p>Идеи уже у вас под носом</p>
<p>Вот по каким углам смотреть:</p>
<ul><li><strong>что уже сделано</strong> - какая работа сделана, о которой можно рассказать</li><li><strong>что можно записать</strong> - какую работу, которую вы и так делаете, можно снять</li><li><strong>переписки</strong> - скриншоты диалогов (собеседника замазать), вокруг которых можно собрать контент</li><li><strong>что вы видите</strong> - чужой ролик, новость, методика, острая тема: посмотрели и высказали мнение</li><li><strong>цифры</strong> - скриншоты вокруг метрик, трансформаций, результатов</li><li><strong>вопросы</strong> - то, что спрашивают клиенты, подписчики и комментаторы</li><li><strong>переупаковка</strong> - готовый контент в другом формате: длинное в короткое, короткое в текст</li><li><strong>повтор</strong> - то, что уже хорошо сработало, можно выложить снова: люди забывают, приходят новые, охваты всегда разные</li><li><strong>победы</strong> - результаты клиентов, отзывы</li><li><strong>рабочие материалы</strong> - то, что вы делаете для работы, подается кусочками, а потом собирается в лид-магнит</li></ul>
<p>Про повтор отдельно, потому что его боятся: "а если скажут, что я повторяюсь и они это уже видели?"</p>
<p>Прекрасно. Если люди говорят, что вы повторяетесь, значит ваш маркетинг работает - задача ровно в том, чтобы вас запомнили</p>
<p>Все знают слоганы больших брендов. Их годами повторяют, просто заходят каждый раз с другого ракурса. Один и тот же смысл, разные подачи</p>
<p>Это подходит художнику, который включает запись экрана и камеру сбоку и просто комментирует, пока рисует</p>
<p>Работает у англоговорящего вайбкодера, который стримит свою работу и собирает 40 тысяч зрителей - он просто показывает, как делает</p>
<p>И работает у вас, потому что у вас уже идет жизнь и работа</p>
<h3>Музей идей</h3>
<p>Чтобы это работало, нужно одно место, куда всё падает</p>
<p>Я называю его музеем идей</p>
<p>Не в голову, не в пять разных заметок, не в скриншоты, которые вы потом не найдете. Одно место</p>
<p>Проще всего завести отдельный телеграм-канал, куда пишете только вы, и кидать туда всё подряд:</p>
<ul><li><strong>голосовое</strong> - пока мысль горячая, расшифруете потом</li><li><strong>видео с телефона</strong> - как вы что-то делаете прямо сейчас</li><li><strong>текст</strong> - формулировка, заголовок, фраза клиента</li><li><strong>скриншоты</strong> - переписки, метрики, результаты</li><li><strong>чужие ролики и посты</strong> - то, что вас зацепило</li></ul>
<p>Идея, которую вы не записали, стоит ноль. Вы ее не вспомните, как бы вам сейчас ни казалось</p>
<p>Зато когда вы садитесь делать контент, вы уже ничего не придумываете с нуля</p>
<p>Вы приходите в музей и выбираете</p>
<blockquote><p>вот бы жизнь была как в голливуде</p><p>сегодня загораешь на яхте, завтра прыгаешь с парашютом, послезавтра вытаскиваешь людей из горящего автобуса</p><p>а как вы думаете, тот герой сам смотрит на свою жизнь так же?</p><p>у меня из окна видно горы</p><p>я каждый день гуляю и смотрю на огромные горы</p><p>я стараюсь это замечать, но природа берет свое - горы стали фоном и нормой</p><p>а для человека, который приехал первый раз, это отвал башки и бесконечный восторг</p><p>что если ваша жизнь уже голливуд?</p><p>не для вас - для тех, кто на пару шагов позади</p></blockquote>
<img src="/kurs/assets/gory-iz-okna.jpg" alt="">
<p>Ждать момента "вот теперь можно делать контент" - это просто сливать время</p>
<p>Вам уже есть что рассказать и показать</p>
<p>Просто для вас это фон</p>
<p class="punch">Возражение "получится некрасиво и неорганично"</p>
<p>Ответ здесь такой же, как везде в этом курсе: выберите, что вам сейчас дороже</p>
<p>Если красота дороже - начинайте с нее и закладывайте время</p>
<p>Если время дороже - сначала оптимизируйтесь, красоту докрутите потом</p>
<p>Оба варианта нормальные, ненормально хотеть сразу оба и не двигаться вообще</p>
</section>
<section>
<h2>5. Одна идея - несколько заходов</h2>
<p>Еще один способ уплотнить: не придумывать новое там, где можно дать шанс старому</p>
<p>Когда пишете сценарий, сделайте к нему сразу 2-3 заголовка - это пять минут</p>
<p>На съемке снимаете под каждый заголовок - еще пять минут</p>
<p>Один сценарий превращается в 2-3 контентные единицы</p>
<p>То есть 15 роликов превращаются в 45, и вы не потратили на это ни дополнительного дня, ни денег</p>
<p>Плюс вы даете своей идее несколько шансов вместо одного</p>
<p>Про этот прием я в свое время снял отдельный ролик - он собрал 679 тысяч просмотров и 30 тысяч сохранений</p>
<img src="/kurs/assets/reel-1ideya-5zagolovkov.jpg" alt="">
</section>
<section>
<h2>6. Свое время купить нельзя, чужое - можно</h2>
<p>Я не могу купить себе новые сутки</p>
<p>Но я могу купить время другого человека</p>
<p>Здесь два персонажа: монтажер и ассистент</p>
<p class="punch">Монтажер - хранитель времени</p>
<p>Посчитаем</p>
<p>15 роликов по 3 000₽ - это 45 000₽</p>
<p>Просим пакетную скидку процентов 15 - выходит 38 250₽</p>
<p>Монтаж одного ролика примерно час</p>
<p>Значит вы покупаете себе минимум 15 часов в месяц</p>
<p>А если применить прием с заголовками, те же 15 роликов превращаются в 45 - и это уже 45 часов, целая рабочая неделя</p>
<p>Монтажера можно найти и за тысячу рублей за ролик - тогда те же 15 роликов стоят 15 000₽. Вдумайтесь, как дешево вы покупаете себе время</p>
<p>Скажете "Саш, это очень много"</p>
<p>И будете правы - но только если этот контент не приносит вам ничего</p>
<p>Если ваш прайс на дорогую услугу выше 40 000₽, достаточно одного клиента с контента, чтобы это окупить</p>
<p>Работает это так: я пишу сценарии, снимаю, создаю карточку в таблице, прикрепляю файлы и дату</p>
<p>Монтажер отсматривает, режет, переносит карточку в "готово" и отмечает ассистента</p>
<p>Ассистент ставит на загрузку</p>
<img src="/kurs/assets/pul-idey-board.jpg" alt="">
<p>Табы сверху - это этапы: не начато, в процессе, съемка, монтаж, готово, релиз</p>
<p>Внутри карточки - статус, файл, дата постинга, исходники и формат</p>
<p>Никакой магии, просто идея не висит у вас в голове, а физически двигается по этапам</p>
<p>Короткий контент я сейчас почти не правлю - доверяю монтажеру</p>
<p class="punch">Ассистент</p>
<p>Смотрите, из чего складывается ваш день:</p>
<ul><li>загрузка рилса - 10 минут (обложка, описание, скачать файл)</li><li>загрузка поста в телеграм - 5 минут</li><li>выдача материалов клиентам - 10 минут</li><li>поиск подрядчиков - 2-3 часа в неделю</li></ul>
<p>30 минут в день превращаются в 3 часа на неделе</p>
<p>Добавьте подрядчиков - и вот у вас 6 часов</p>
<p>Снова целый рабочий день</p>
<p class="punch">Если денег на подрядчиков пока нет</p>
<ul><li>бартер: фитнес-тренер помогает монтажеру с фигурой, тот монтирует ему ролики</li><li>новички: берете начинающего, рекомендуете его знакомым, он экспериментирует на вас, а с ростом дохода вы начинаете платить</li><li>знакомые: просто просите друзей помочь, пока не вышли на доход. Мы с другом так двигались долго - я помогал ему, он мне</li></ul>
<p><strong>Где искать:</strong> инстаграм, знакомые, соцсети. Этих трех каналов достаточно, хедхантер и биржи оставьте как запасной ход</p>
<p><strong>Как отбирать:</strong> сразу давайте тестовое - смонтировать один ролик по вашему ТЗ с референсами. Не согласны на бесплатное - оплатите один ролик. Две-три оплаты разным монтажерам, чтобы найти своего, это небольшая цена</p>
<p>Первого ассистента я уволил</p>
<p>Это нормально - был шорт-лист, я взял следующего человека</p>
</section>
<section>
<h2>7. Нейросети</h2>
<p>Когда я впервые начал внедрять ИИ в работу - я понял, что не все так просто</p>
<p>Результаты, которые он выдавал, были на уровне новичка, только получившего диплом маркетолога</p>
<p>Как и многие, я забил: решил, что самому быстрее</p>
<p>Поменялось это, когда я увидел, как с ним работают люди, которые вложились в настройку</p>
<p>Вот рамка, в которой это имеет смысл:</p>
<p>Нейронка снимает с вас рутину вокруг <strong>уже готового</strong> материала</p>
<p>Расшифровать созвон, вытащить тезисы, собрать описание к ролику, найти куски по теме, переложить длинное в короткое</p>
<p>Чего от нее ждать не надо - что она придумает за вас смысл</p>
<p>Думание не делегируется. Смысл и ваша правда - это то, что мы разбирали на прошлом уровне, и это единственное, что нельзя отдать ни человеку, ни машине</p>
<p>Сейчас нейронками пользуются все, поэтому все и выглядят одинаково и несут одно и то же</p>
<p>Обратите внимание на закономерность: у тех, кто рассказывает, как делать рилсы через нейронки, все работает. А у тех, кто к ним приходит, не работает ни хрена</p>
<p>И еще одно</p>
<p>Толку от экономии времени нет, если это не дает результат</p>
<p>Поэтому нейронку мы подключаем не потому что модно, а туда, где вы точно знаете, сколько времени она у вас забирает сейчас</p>
</section>
<section>
<h2>8. Регулярность против вдохновения</h2>
<p>Здесь надо разобрать главное заблуждение</p>
<p>Постоянно - не значит каждый день</p>
<p>Постоянно - значит полгода или год, с ошибками, паузами и косяками</p>
<p>Это не рилс каждый день, это постоянство и усиление сильного:</p>
<ul><li>если не работает - пробовать другое</li><li>если сработало слегка - давить на эту педаль сильнее</li></ul>
<p>Теперь про дисциплину, потому что ее сильно переоценивают</p>
<p>Нам говорят: будь дисциплинирован и станешь успешным</p>
<p>Люди внедряют тайм-менеджмент, сжатые дедлайны, систему вознаграждений</p>
<p>Живут так пару месяцев, выгорают и решают, что они недостаточно дисциплинированы</p>
<p>И что делают дальше? Становятся еще дисциплинированнее</p>
<p>На мой взгляд, дисциплина - это следствие, а не причина</p>
<blockquote><p>я не пример дисциплинированности, это точно не моя сильная сторона</p><p>но когда я подростком занимался футболом - мне не нужно было себя пинать</p><p>я вставал в 7 утра каждый день</p><p>приезжал первым на тренировку и открывал раздевалки</p><p>тренировался сам, потом с командой, оставался на вторую тренировку со второй командой</p><p>ехал в школу, приходил домой, делал домашку и ложился спать</p><p>сложно?</p><p>да, только если для вас это "не легко"</p><p>для меня это было естественно - я находился в синхроне с самим собой</p><p>и мне не нужны были расписания, тайм-менеджмент и прочие костыли</p></blockquote>
<p>Поэтому когда вам кажется, что вам не хватает дисциплины - чаще всего вам не хватает не дисциплины</p>
<p>Вам не хватает синхрона: вы делаете не в своей форме, не свои смыслы, не на своей сильной стороне</p>
<p>Мы это разбирали на третьем уровне, и если там дырка - никакое расписание ее не закроет</p>
<h3>Режим фристайла</h3>
<p>И тут важная оговорка</p>
<p>Бывают люди, которым расписание не подходит вообще</p>
<p>Это не лень и не отсутствие дисциплины, им просто не подходит форма</p>
<p>Для таких есть режим фристайла: вы ничего не готовите заранее, а снимаете свои мысли по ходу того, что и так делаете</p>
<blockquote><p>Женя, онлайн-тренер для бегунов</p><p>сколько мы ни пытались внедрить ему подходы с расписанием - его от этого выворачивало наизнанку</p><p>он бросал делать контент - клиентов становилось меньше - он снова заставлял себя его делать</p><p>и так по кругу</p><p>все поменялось, когда я предложил ему просто снимать свои мысли, пока он бегает</p><p>контент начал выходить постоянно, и клиенты пошли</p><p>причем даже не выбивая джекпоты</p></blockquote>
<p>[Полный разбор Жени](<a href="https://youtu.be/bwf60pNhSxE" target="_blank" rel="noopener">https://youtu.be/bwf60pNhSxE</a>) лежит у меня на YouTube: что было до, что поменяли и что из этого вышло</p>
<p>Расписание - это костыль под то, что вам тяжело</p>
<p>Если вы делаете в своей форме, вам легко, и костыль просто не нужен</p>
<p>Что делать, когда нет вдохновения</p>
<p>Снижать планку, а не пропускать</p>
<p>Сделать на отъебись и выложить - это лучше, чем не сделать</p>
<p>Что делать, когда вдохновение прет</p>
<p>Пользоваться: писать и снимать про запас, складывать в папку</p>
<p>Что делать, если пропустили неделю или две</p>
<p>Вернуться</p>
<p>Мы двигаемся волнообразно, и вы это уже знаете со второго уровня</p>
</section>
<section>
<h2>Антипаттерны этого уровня</h2>
<ul><li><strong>"качество важнее скорости"</strong> - на этом уровне нет, потому что качество вы все равно оцениваете глазами, которые не умеют оценивать свою работу</li><li><strong>вылизывание одной единицы</strong> - вы вложили день, планка ожиданий улетела, а барабан крутится как крутился</li><li><strong>ждать подходящего момента</strong> - его не будет</li><li><strong>резать сон</strong> - это не сжатие времени, это кредит под конские проценты</li></ul>
</section>
<section>
<span class="slabel">коротко</span><h2>Саммари</h2>
<p>Времени больше не станет</p>
<p>Значит вопрос не в том, где его взять, а в том, как перестать его сливать</p>
<p>Сливается оно в трех местах: на оценке того, что вы делаете, на отсутствии рамок и на том, что вы каждый раз создаете с нуля вместо того, чтобы использовать уже готовое</p>
<p>Сначала снимаем оценку</p>
<p>Потом ставим рамки времени</p>
<p>Потом начинаем коллекционировать</p>
<p>И только потом покупаем чужое время, если оно есть на что покупать</p>
</section>
<section>
<span class="slabel">делаем руками</span><h2>Задача</h2><div class="taskbox"><div class="tt">задача уровня</div>
<ul><li>1. Соберите черновик расписания на неделю: сон, еда, тренировки, созвоны, работа. И только потом впишите туда контент отдельными блоками</li></ul>
<ul><li>2. Возьмите одну контентную единицу из того, что у вас уже есть - записанный созвон, рабочий процесс, переписка, скриншот результата. Ничего специально не создавайте</li></ul>
<ul><li>3. Поставьте таймер и выложите то, что получилось за отведенное время. Не докручивайте после сигнала. Если вы все-таки создаете, а не берете готовое - ставьте час</li></ul>
</div></section>
<section>
<span class="slabel">проверка</span><h2>Маркер, что вы закрепились на уровне</h2><div class="markerbox"><div class="tt">как понять, что уровень закрыт</div>
<p>Контентная единица занимает у вас столько времени, сколько вы ей отвели</p>
<p>Вы спокойно выкладываете то, что сделали быстро, и вас не тянет это переделать</p>
<p>И у вас в неделе появляется свободное место, которого раньше не было</p>
</div></section>
<section>
<h2>Что дальше</h2>
<p>И вот здесь всплывает вопрос, которого раньше просто не было слышно</p>
<p>Пока вы боролись с собой, потом с раздражением, потом со временем - вам было не до цифр</p>
<p>А теперь процесс идет спокойно, контент выходит регулярно, время не горит</p>
<p>И становится очень заметно, что в ответ тишина</p>
<p>Это пятый уровень, и он самый большой в курсе</p>
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
