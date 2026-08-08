// Статья урока «07-obshaya-formula» курса «Новый Уровень Контента».
// СГЕНЕРИРОВАНО: GSD-BRAND/scripts/kurs-to-ts.mjs 07 — руками не править,
// править исходник kurs/07-obshaya-formula.html и перегенерировать.

export const OBSHAYA_FORMULA_07 = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Общая формула: смысл, пруф, упаковка · Новый уровень контента</title>
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
  <div class="lvlbadge">Инструмент</div>
  <h1>Общая формула: смысл, пруф, упаковка</h1>
  <p class="dek">Из чего состоит контентная единица со смысловой стороны и как проверить свою перед публикацией.</p>
  <div class="taskline"><b>Задача:</b> Разложить три свои последние единицы по трём строчкам.</div>
</div></header>

<!--VIDEO_SLOT-->


<main class="wrap">
<section>
<p>Итак, давайте разберемся из чего состоит контентная единица</p>
<p>Я сейчас не про техническую составляющую в виде: хуков / заголовков и призывов к действию (об этом вы можете посмотреть в Формуле Вирусного Контента, я там максимально подробно рассказываю и показываю это)</p>
<p>Я именно о смысловых составляющих</p>
<p>В моем понимании качественный рилс или любая другая контентная единица состоит из 3 составляющих:</p>
<ul><li>смысл (ключевая идея и ваш посыл)</li><li>пруф (доказательство)</li><li>упаковка (сладкая оболочка)</li></ul>
<p>Смысл - это ключевая идея, которую мы продаем</p>
<p>Пруф - нужен для того, чтобы доказать человеку, что наш смысл рабочий / верный / правильный</p>
<p>Упаковка - нужна для того, чтобы человек "скушал" наш смысл и пруф</p>
<p>Вот как это выглядит на живом примере - моя карусель про алгоритм:</p>
<ul><li><strong>смысл</strong>: можно не тратить кучу времени на контент, который сдохнет за час</li><li><strong>пруф</strong>: я проверил это на себе и показываю цифры</li><li><strong>упаковка</strong>: алгоритм инстаграма - долбоёб</li></ul>
</section>
<section>
<h2>Почему именно такой набор</h2>
<div class="ix" data-ix="unit"></div>
<p>Проще всего это понять через три вопроса, которые возникают у человека по ту сторону экрана</p>
<p>Он их не проговаривает, но задает их всегда, в таком порядке:</p>
<ul><li>1. <strong>«Почему я вообще должен это смотреть»</strong> - на это отвечает упаковка</li><li>2. <strong>«Почему я должен тебе верить»</strong> - на это отвечает пруф</li><li>3. <strong>«Что ты мне говоришь»</strong> - и вот это уже смысл</li></ul>
<p>Обратите внимание на порядок</p>
<p>Собираем мы единицу от смысла, а получает ее человек с конца - сначала упаковку, потом пруф, и только потом до него доходит сама идея</p>
<p>Поэтому уберите любую из трех - и конструкция не работает:</p>
<ul><li>нет смысла - можно набрать просмотры, но вы вряд ли привлечете целевую аудиторию или клиентов</li><li>нет пруфа - ваш смысл остается просто мнением, таких мнений в ленте тысяча</li><li>нет упаковки - до смысла и пруфа никто не доберется, потому что смотреть не начнут</li></ul>
<p>Из этих трех смысл и упаковка - главные</p>
<p>Пруф вспомогательный и заменяемый, иногда можно и без него</p>
</section>
<section>
<h2>Смысл</h2>
<p>Это то, что вы утверждаете</p>
<p>Одно предложение, которое можно записать и за которое вы готовы биться</p>
<p>Не тема, не идея для рилса, а именно утверждение</p>
<p>Как собрать свои 3-5 смыслов - в блоке <i>Карта смыслов</i></p>
<h3>Карта смыслов</h3>
<blockquote><p>*Хороший маркетинг это не о том, чтобы рассказать про тысячу идей одним способом*</p><p>*Хороший маркетинг это о том, чтобы рассказать про одну идею - тысячей способов*</p></blockquote>
<p>Огромная проблема людей создающих контент заключается в том, что они постоянно транслируют разные идеи</p>
<p>Во-первых - людям может быть непонятно, когда вы скачете между темами</p>
<p>Во-вторых - людям нужно несколько раз повторить одно и тоже, чтобы они это запомнили</p>
<p>В-третьих - дурацкие алгоритмы все таки могут из-за этого не понимать, кому вас показывать</p>
<p>И в этом плане карта смыслов - решает все эти проблемы</p>
<p>К тому же она решает важную задачу</p>
<p>Она продает ваши идеи</p>
<p>Потому что перед покупкой чего-либо: продукта, услуги, товара - важно сначала продать идею</p>
<p>Поэтому реклама и коммерческие видеоролики работают</p>
<p>Они продают идею статуса, крутости, правильности и т.д.</p>
<p>Все знают девиз авиасейлс не потому что они делают разное</p>
<p>Они продают одну идею - тысячей способов</p>
<p>Давайте на примере</p>
<p>Вот моя карта смыслов и она достаточно простая:</p>
<ul><li>алгоритмы - это казино, только навык может дать стабильные результаты</li><li>для заработка в онлайне не нужно много подписчиков</li><li>продающий контент привлекает клиентов, полезный контент привлекает любителей халявы</li><li>ты = ниша</li><li>личные бренд - это про доверие между автором и аудиторией</li></ul>
<p>То есть это не идеи для рилсов или темы поста</p>
<p>Это ключевые смысловые ядра, которые я закладываю в каждую контентную единицу</p>
<p>Они могут меняться со временем, потому что какие-то идеи продаются хорошо, какие-то плохо</p>
<p>Но сам факт того, что мы должны начинать именно с этого не оспорим.</p>
<p>Таким образом и контент становится делать гораздо проще.</p>
<p>Лучше меня об этом вам расскажет Ди Каприо и фильм "Начало"</p>
<video src="/kurs/assets/samyy-zhivuchiy-parazit---kino_mem-1080p-h264-.mp4" controls playsinline style="width:100%;margin:20px 0;border:1px solid #ddd"></video>
<p>Идея</p>
<p>И стоит человеку купить вашу идею - избавиться от неё он не сможет.</p>
<p>Дальше я расскажу как её собрать и как ей пользоваться</p>
<h3>Как собрать</h3>
<p>Здесь несколько вариантов:</p>
<ul><li>1. Взять ту идею, что уже покупают люди</li></ul>
<p>Посмотрите на своих коллег и конкурентов, у которых есть аудитория и деньги</p>
<p>Если свести весь их контент к 3 смыслам - что это будет?</p>
<p>Вот вам несколько популярных примеров</p>
<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Ниша</th><th>Смысл</th><th>Пример</th><th>Комментарий</th></tr></thead><tbody><tr><td>Фитнес</td><td>Единственное, почему вы худеете - дефицит калорий</td><td><a href="https://www.instagram.com/reel/DHuT9l8oOgw/?igsh=MWl2aHJ6OHozNXBwcg==" target="_blank" rel="noopener">https://www.instagram.com/reel/DHuT9l8oOgw/?igsh=MWl2aHJ6OHozNXBwcg==</a></td><td>Если вы посмотрите все ролики Макса - они будут сводиться всегда к одному тезису: жри чо хочешь, главное дефицит калорий<br><br>Там вообще у него один смысл, даже не карта</td></tr><tr><td>Психология</td><td>Ваша жизнь - это ваша ответственность</td><td><a href="https://www.instagram.com/reel/DN3ri5HQL89/?igsh=MTF1cXBxNXlxbm56Zw==" target="_blank" rel="noopener">https://www.instagram.com/reel/DN3ri5HQL89/?igsh=MTF1cXBxNXlxbm56Zw==</a></td><td>Если вы посмотрите все ролики Петра - они будут сводиться к тому, что человек перекладывает ответственность на других<br><br>Да это формат публичного выступления, но сути это не меняет</td></tr><tr><td>Маркетинг</td><td>Формат - это то, благодаря чему вы набираете подписчиков</td><td><a href="https://www.instagram.com/reel/DZBZRibsyZn/?igsh=MWVtZWJrazVjdDA1dA==" target="_blank" rel="noopener">https://www.instagram.com/reel/DZBZRibsyZn/?igsh=MWVtZWJrazVjdDA1dA==</a></td><td>Если вы посмотрите ролики Егора - он транслирует одну истину: найди свой формат и все начнет работать</td></tr></tbody></table></div>
<p>Почему это работает?</p>
<p>Потому что это то, что нужно людям</p>
<p>На это есть спрос</p>
<p>Их смысл - сработал и если у вас пока не "кристаллизовались" свои уникальные смыслы или в целом вам откликаются какие-то идеи других и вы в них верите, берите.</p>
<p>Эго может начать капризничать и говорить: "нам надо СВОЕ! мы хотим быть ОСОБЕННЫМИ! мы хотим быть УНИКАЛЬНЫМИ!"</p>
<p>Идеи и смыслы - это ноты</p>
<p>Ещё ни один человек не написал симфонию используя какие-то другие ноты</p>
<p>Со временем просто эти чужие смыслы трансформируются и обретут тот вид, который подходит вам</p>
<p><strong>Что делать руками:</strong> сядьте и найдите 3-5 своих коллег, а затем посмотрите 10 их рилсов. Выпишите 1-3 ключевые идеи, которые тянутся из раза в раз. Вы либо возьмете их себе, либо просто поймете, как это делать</p>
<ul><li>2. Взять то, во что вы сами верите всем сердцем</li></ul>
<p>Садитесь и выписываете тезисы в которые вы верите и готовы за них биться до последнего</p>
<p>Я смотрел на многих своих коллег и не понимал, как они могут это говорить</p>
<p>Некоторые вообще откровенную чушь несут на мой взгляд</p>
<p>Но они в это верят и я не думаю, что специально обманывают людей (хотя есть конечно исключения)</p>
<p>Большинство маркетологов скажет - "надо брать то, что покупают" и это будет правдой, но только от части</p>
<p>Потому что если вы не верите в то, что "через чатджпт можно набрать подписчиков" там два варианта:</p>
<ul><li>либо вас не будут смотреть и покупать, потому что люди чувствуют, когда их пытаются наколоть</li><li>либо это сработает и вы станете заложником чуши, которую теперь вам придется нести постоянно</li></ul>
<p>Вот пример: мои посты и контент про алгоритм, инсту и казино</p>
<p>С одной стороны я сам себе стреляю в ноги</p>
<p>С другой стороны - я не могу НЕ ГОВОРИТЬ об этом</p>
<p>Потому что я знаю это наверняка, я это протестировал и доказал</p>
<p>Я верю в навык и то, что только благодаря навыку можно получать результаты</p>
<p>Свой навык или навыки других людей</p>
<p>Когда я к этому пришел, я уже просто не способен был говорить другие вещи</p>
<p>Потому что я тогда бы обманывал себя</p>
<p>Может быть это видоизмениться со временем, но пока это основной мой смысл.</p>
<p><strong>Что делать руками:</strong> сядьте и запишите в тетрадь или заметки то, во что вы верите - не обязательно тезисами, можно просто потоком писать, вытащите ключевое после</p>
<p>Второй вариант: включите камеру и начните рассказывать на неё, а после этого можете закинуть расшифровку в нейронку</p>
<p>Третий вариант: сразу расскажите нейронке, используя промпт <i>Промпт — карта смыслов</i></p>
<p class="punch">На выходе</p>
<p>У вас должно быть 3-5 основных смыслов, вокруг которые мы дальше будем танцевать и тестировать то, как они работают</p>
<p>Эта задача на один час - не надо усложнять, пытаться найти что-то уникальное и т.д.</p>
<h3>Как из одного смысла получается много единиц</h3>
<p>Один и тот же смысл можно разложить по сетке и получить готовые темы</p>
<img src="/kurs/assets/shema-chto-pochemu-gde.jpg" alt="">
<p>Слева три входа: <strong>проблема</strong>, <strong>результат</strong>, <strong>идея</strong></p>
<p>Дальше по каждому - два вопроса: <strong>почему</strong> это произошло и <strong>где</strong> искать решение</p>
<ul><li>проблема → почему эта проблема случилась у вас или у клиентов → где найти ее решение</li><li>результат → почему вы получили именно такой результат → где искать, чтобы получить такой же</li><li>идея → какие выгоды дает эта идея → где искать такие же выгоды</li></ul>
<p>Шесть клеток - шесть разных единиц из одного смысла</p>
<p>А справа то, чем каждая из них заканчивается</p>
<p>Для соцсетей: шейр, директ, подписка, сохранение или вообще ничего</p>
<p>Для телеграма, сторис и почты: сайт, купить, написать в личку</p>
<p>И да, «вообще ничего» - тоже полноценный вариант</p>
<p>Это первый шаг в процессе сборки вашей контентной единицы</p>
<p>Дальше идут две другие составляющие - пруф и упаковка</p>
<p>Обе разобраны в блоке <i>Общая формула</i>: чем доказывать свой смысл, где брать пруфы, если своих результатов еще нет, и как упаковать так, чтобы человек это взял</p>
</section>
<section>
<h2>Пруф</h2>
<p>Это то, чем вы держите свой смысл</p>
<p>Здесь у людей чаще всего каша, потому что пруф путают с упаковкой</p>
<p>Разделить их помогает простой тест</p>
<p class="punch">Выкиньте элемент и посмотрите, что сломается:</p>
<ul><li>выкинули, и утверждение превратилось в мнение, верить стало нечему - это был пруф</li><li>выкинули, и стало скучно, никто не досмотрит - это была упаковка</li></ul>
<p>Возьмем мою карусель про то, что можно не тратить кучу времени на контент</p>
<p>Выкиньте оттуда статистику двух единиц - останется «не тратьте много времени», то есть чужое мнение, которое человек пролистнет</p>
<p>Выкиньте формат эксперимента - цифры останутся, но их никто не увидит</p>
<h3>Что может быть пруфом</h3>
<ul><li>1. <strong>Ваш результат.</strong> Мой эксперимент: рилс за 3 минуты и карусель за 15 минут со скриншотом статистики. Или 40 тысяч подписчиков за пять месяцев на озвучке. Результат не обязан быть огромным: сегодня я разобрался, как засинхронить камеру с экраном - это тоже результат, и про него тоже можно сделать единицу</li><li>2. <strong>Результат клиента.</strong> Наташа с 44 подписчиками, Женя с 470, Вася с 1 500</li><li>3. <strong>Замер, который вы провели специально.</strong> Я загнал два аккаунта в свое приложение и показал, как один и тот же файл дает 5 879 и 360 576 просмотров</li><li>4. <strong>Чужие публичные данные.</strong> 80 роликов главы Инстаграма, которые я отсмотрел за год, официальные документы площадок, отраслевая статистика</li><li>5. <strong>Показ процесса.</strong> Скриншот доски с этапами, таблица с расписанием, запись экрана. Вы пилите доску на виду, и это само по себе доказательство</li><li>6. <strong>Ваш провал.</strong> Мои семь роликов ниже 5 000 просмотров, снятые с профессиональным оператором и краской. Это пруф не слабее победы, а иногда сильнее</li></ul>
<p>Вот как выглядел мой:</p>
<img src="/kurs/assets/proval-reels-operator.jpg" alt="">
<p>1 981, 2 316, 1 930 просмотров</p>
<p>Профессиональная съемка, свет, монтаж, все по правилам</p>
<p>И именно эти цифры доказывают мой смысл лучше, чем любой мой успешный ролик: картинка не решает</p>
<p>Заметьте, что здесь произошло</p>
<p>Провал перестал быть провалом ровно в тот момент, когда стал доказательством</p>
<h3>А если у меня своих результатов еще нет</h3>
<p>Это нормальная ситуация, и она у большинства на старте</p>
<p>Пруфом может быть не результат, а <strong>процесс и честность</strong></p>
<p>Показывайте, как вы делаете, что пробуете и что из этого выходит, включая то, что не вышло</p>
<p>Промежуточные результаты - это тоже пруф: было 200 просмотров, стало 1 500</p>
<p>Вот [мой ролик 2023 года](<a href="https://www.instagram.com/reel/CsGkfbcv5oq/" target="_blank" rel="noopener">https://www.instagram.com/reel/CsGkfbcv5oq/</a>) - первый, который набрал тридцать тысяч</p>
<p>Никаких результатов у меня тогда не было, я просто показал свою систему создания контента</p>
<p>37 262 проигрывания, 28 126 просмотров, 1 661 лайк</p>
<p>Доверие строится из честности, прозрачности и искренности, а не из красивых цифр</p>
<p>Человек верит не тому, у кого больше, а тому, кто не врет</p>
</section>
<section>
<h2>Упаковка</h2>
<p>Это то, <strong>как смысл заходит в человека</strong></p>
<p>Не как он выглядит, а как заходит - это разные вещи, и дальше я объясню, почему это важно</p>
<p>Проверить просто: вы поменяли упаковку, смысл остался тем же, а реакция стала другой</p>
<ul><li>«делайте полезный контент» → «делайте продающий контент»</li><li>«снимайте рилсы каждый день» → «можно не снимать каждый день»</li><li>«у женщины должен быть плоский живот» → «у женщины по природе должен быть живот»</li></ul>
<p>Ядро одно и то же, вход разный</p>
<h3>Из чего собирается упаковка</h3>
<p><strong>1. Заход</strong> - первые три секунды или первый слайд</p>
<p>Самая сильная часть упаковки и единственная, которую можно честно взять у другого автора</p>
<p>Именно это мы и делаем, когда работаем с потоком спроса: берем рабочий заход, а тезисы внутри даем свои</p>
<p><strong>2. Угол</strong> - старая проблема под новым углом</p>
<p>Берете то, что говорят все, и находите противоположное</p>
<p><strong>3. Позиция по отношению к зрителю</strong> - снимаете вину или тыкаете в проблему</p>
<p>Смысл при этом может быть один и тот же, а снятие вины работает в шесть раз лучше критики</p>
<p>И здесь вспоминаем про ручку громкости: полумеры не работают</p>
<p>Снимаете вину - снимайте нежностью, лаской и добротой</p>
<p>Тыкаете лицом в проблему - тыкайте сильно</p>
<p><strong>4. Язык</strong> - на языке человека, а не на языке вашей методологии</p>
<p>Не «нужно выстроить систему контента, которая учитывает поток спроса», а «делаю ролики, и их никто не смотрит»</p>
<p>Не разговаривайте с орками на эльфийском</p>
<p class="punch">Если совсем коротко, упаковка бывает двух видов</p>
<p>Либо это рабочий или свежий формат: то, что уже заходит у других, или то, чего в вашей нише еще никто не делал</p>
<p>Либо это что-то интересное само по себе: инфоповод, событие, исследование, эксперимент, неожиданный факт, новость</p>
<p><strong>Как искать углы руками:</strong> соберите список того, что сейчас в тренде и что говорит большинство</p>
<p>Напротив каждого пункта напишите противоположное мнение - там, где оно у вас правда есть</p>
<p>Это даст вам огромный пласт идей</p>
<h3>Поток спроса</h3>
<p>Смотрите, идея которую я предлагаю в целом не нова и вы наверняка её уже видели / слышали</p>
<p>Но мало кто из вас реально это делал</p>
<p>Я не говорю копировать один в один чужой контент</p>
<p>Так как у нас уже собрана карта смыслов - мы можем использовать её, но заходы и упаковку брать ту, которая сработала</p>
<p>Вот вам пример: карусель моей коллеги "публикуйте все подряд" на которой 27к лайков</p>
<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Оригинал коллеги</th><th>Мой первый заход</th><th>Второй заход</th></tr></thead><tbody><tr><td><img src="/kurs/assets/photo_2026-07-17_17-48-45.jpg" alt=""></td><td><img src="/kurs/assets/photo_2026-07-17_17-48-46.jpg" alt=""></td><td><img src="/kurs/assets/photo_2026-07-17_17-48-45-2-1.jpg" alt=""></td></tr></tbody></table></div>
<p>Кто-то скажет "фу, копировать чужое стремно"</p>
<p>Я отвечу так - я не копировал, а взял рабочий заход</p>
<p>Тезисы в каждой карусели я давал свои</p>
<p>От её карусели там только первая страница</p>
<p>Кто-то скажет "так и че, ты ж не набрал 27к лайков"</p>
<p>Я отвечу так - а нахрена мне столько?</p>
<p>Да, я собрал меньше, но я ж собрал и получил результаты в виде - охватов, подписчиков, клиентов</p>
<p>Задача выполнена</p>
<p>Кто-то скажет "я пробовал копировать чужое и это не работает"</p>
<p>Я отвечу так - хреново пробовали</p>
<p>Почему?</p>
<p>Вот вам пример не мой, а клиента в рилсах</p>
<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Первый заход</th><th>Второй заход</th></tr></thead><tbody><tr><td><img src="/kurs/assets/photo_2026-07-17_18-31-14.jpg" alt=""></td><td><img src="/kurs/assets/photo_2026-07-17_18-31-16.jpg" alt=""></td></tr></tbody></table></div>
<p>Это два одинаковых ролика, выложенные в разное время - оба дали результаты</p>
<p>Оригинал я нашел на ютубе, начало мы взяли оттуда и подставили тезисы / смыслы / позицию Жени</p>
<p>Для небольшого аккаунта в 470 подписчиков - это отличные промежуточные результаты</p>
<p>Именно "промежуточные"</p>
<p>Потому что, чтобы выбить "джекпот" нужно выкладывать этот контент постоянно</p>
<p>Мы не влияем на то, будет это "джекпот" или нет</p>
<p>Мы можем влиять только на то, что мы выкладываем и как часто это делаем</p>
<p>Цифры на выходе в виде охватов, лайков и подписчиков - уже на стороне алгоритма</p>
<p>Мы это не контролируем</p>
<img src="/kurs/assets/rezultaty-rils-natasha.jpg" alt="">
<p>Вот результаты Наташи на аккаунте с 44 подписчиками</p>
<p>Мы двигались с ней ровно по моей методологии и как только начали подключать "поток спроса" - с первого видео же получили такие результаты</p>
<p>Ролик набрал 168 тысяч просмотров, сейчас там уже около 380 тысяч, а на аккаунте вместо 44 подписчиков почти 400</p>
<p>Соответственно, это работает и наша задача теперь - найти этот "поток спроса"</p>
<h3>Способы поиска</h3>
<p>Итак, наша задача - найти то, что уже работает</p>
<p>В вашей нише или смежной</p>
<p>На русском или английском языке (это для продвинутых)</p>
<p>На уровне идей или на уровне форматов</p>
<p>Сейчас я покажу как это сделать руками и дальше покажу, как это сделать через нейронку</p>
<p>Можно делать сразу через нейронку, но чтобы вы поняли принцип - я бы предложил выделить часик и потыкать руками, чтобы закрепить это все</p>
<h3>Поиск на ютубе</h3>
<p>Ютуб прекрасен тем, что на нем существует нормальный поиск по запросам</p>
<p>Наша цель - найти какие-то короткие видео из нашей ниши</p>
<p>Возьмем на примере Жени, как я искал темы для него</p>
<img src="/kurs/assets/pasted-image-20260722072608.png" alt="">
<img src="/kurs/assets/pasted-image-20260722072709.png" alt="">
<ul><li>1. Мы набираем в поиске свое "ключевое" слово из нашей ниши и всё, что связано с нашей деятельностью</li><li>2. Дальше мы включаем "фильтр"</li><li>3. В "фильтре" мы выбираем: шортс, по релевантности / популярности, за год / месяц</li><li>4. Смотрим ролики и берем для себя заходы (начало роликов)</li></ul>
<p>Таким образом я нашел вот этот ролик</p>
<img src="/kurs/assets/pasted-image-20260722072827.png" alt="">
<p>Показательно что тут чувак просто в тачке сидит и говорит в камеру - ничего особенного</p>
<p>А значит - тема горячая и имеет спрос</p>
<p>Мы взяли его заход, переложили просто Женины тезисы / смыслы и это тоже дало результаты (помним - нам насрать на джекпот, мы на это не влияем)</p>
<p>То есть эти цифры для нас показательны в контексте того, что огромному количеству людей отзывается тема, люди смотрят это и взаимодействуют</p>
<p>Таким образом же мы можем находить телеграм каналы и инстаграм аккаунты своих коллег (на ютуб каналах у них часто это все указано)</p>
<p>Тут же мы можем искать рабочие заголовки для рилсов и каруселей</p>
<p>Потому что то, что набирает просмотры - работает</p>
<h3>Инстаграмы коллег</h3>
<p>Я уже выше приводил пример с каруселью, которую нашел у своей коллеги и переделал по своему, оставив только первый слайд</p>
<p>Вы можете подписаться на коллег и следить за тем контентом, который у них хорошо набирает</p>
<p>Второй вариант - это ваша лента рекомендаций, в которой вам может попадаться похожий контент</p>
<p>Третий вариант - это лента дискавери</p>
<p>Вы нажимаете поиск внизу и вам открывается раздел того, что инстаграм вам рекомендует самостоятельно (посты, рилсы, карусели) исходя из ваших интересов</p>
<img src="/kurs/assets/photo_2026-07-22_08-11-46.jpg" alt="">
<p>Таким образом можно находить интересный контент, который попадает в эту ленту и таким образом - попасть в эту ленту самим</p>
<h3>Английский</h3>
<p>Мы можем делать все тоже самое, только искать заходы на английском языке</p>
<p>Да, тут чуть сложнее, если вы не знаете языка, но здесь вам могут помогать нейронки</p>
<p>Тот же поиск на ютубе + инстаграм лента может давать вам очень много</p>
<p>Потому что чаще всего 95% контента копируется на наш рынок оттуда</p>
<p>От форматов до смыслов</p>
<p class="punch">Смыслы (идеи, тезисы)</p>
<p>Таким образом я однажды нашел тему с Продающим Контентом</p>
<p>В ленте мне попался ролик одного товарища - вот он</p>
<img src="/kurs/assets/photo_2026-07-22_08-20-36.jpg" alt="">
<p><a href="https://www.instagram.com/reel/DDt6nqviy9J/" target="_blank" rel="noopener">https://www.instagram.com/reel/DDt6nqviy9J/</a></p>
<p>У него это называлось whale bait - "ловим китов", и на русском я это название никак повторить не мог</p>
<p>Я уже видел подобное, но не мог найти подходящего слова, которое бы описывало контент, который направлен именно на привлечение клиентов</p>
<p>Он начал с "хватит делать полезный контент", и я подумал: а что если развернуть в другую сторону</p>
<p>В итоге после этого видео название пришло само - "Продающий Контент"</p>
<p>И после этого я сделал несколько роликов вокруг этой темы и каждый раз они набирали и давали результат</p>
<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Мои ролики на этом смысле</th><th></th><th></th><th></th></tr></thead><tbody><tr><td><img src="/kurs/assets/photo_2026-06-28_15-31-23.jpg" alt=""></td><td><img src="/kurs/assets/photo_2026-06-28_15-31-13.jpg" alt=""></td><td><img src="/kurs/assets/photo_2026-06-28_15-30-55.jpg" alt=""></td><td><img src="/kurs/assets/photo_2026-06-28_14-46-57.jpg" alt=""></td></tr></tbody></table></div>
<p class="punch">Формат</p>
<p>Это рабочая тема, которой пользуются многие ребята, на которых вы подписаны</p>
<p>Я не буду тут перечислять все примеры, просто прикреплю один из последних, что находил</p>
<div class="tbl-scroll"><table class="tbl"><thead><tr><th>Оригинал</th><th>Копия</th></tr></thead><tbody><tr><td><img src="/kurs/assets/photo_2026-07-22_08-41-03.jpg" alt=""></td><td><img src="/kurs/assets/photo_2026-07-22_08-42-04.jpg" alt=""></td></tr><tr><td><a href="https://www.instagram.com/reel/DTYexzyii5n/" target="_blank" rel="noopener">https://www.instagram.com/reel/DTYexzyii5n/</a></td><td><a href="https://www.instagram.com/reel/DW6fUV2DLoW/" target="_blank" rel="noopener">https://www.instagram.com/reel/DW6fUV2DLoW/</a></td></tr><tr><td>оригинал @andrea.rendl - 1,87 млн просмотров</td><td>копия на русском @coachmatiunin - 3,24 млн</td></tr></tbody></table></div>
<p>Формат "кафе у Вселенной", где человек разговаривает со Вселенной, взят один в один</p>
<p>И обратите внимание: копия обогнала оригинал почти вдвое</p>
<p>Вы можете даже не подставлять свои тезисы, если находите какой-то формат, который вам отзывается и подходит - просто хотя бы автора отмечайте, у которого вы это взяли</p>
<p>Людям будет плевать, вам спокойно на душе, а автор (даже если не понимает по русски) не будет возбухать</p>
<p>Если у вас проблемы с английским - вы это можете делать на ютубе (через яндекс браузер - там есть переводчик от ИИ)</p>
<p>Потому что это то, что делает уже много людей</p>
<p>Почему?</p>
<p>Это работает</p>
<p>Наша цель и моя - сделать так, чтоб вы максимально быстро получили результаты</p>
<p>Уникальность и удовлетворение своего эго давайте отложим на следующий шаг</p>
<p>Наберете просмотры и аудиторию - там и будете экспериментировать и самовыражаться</p>
<p>Сейчас вы работаете на зачетку</p>
<p>Затем зачетка работает на вас</p>
<h3>Нейронка</h3>
<p>Я собрал методичку и все необходимые файлы, чтобы вы могли искать рабочие заходы (на русском) не самостоятельно, а через нейронку</p>
<p>Для этого вам нужен будет компьютер</p>
<p>Через браузер телефона или приложение работать не будет</p>
<p>Потому что по сути вы даете доступ нейронке к браузеру, она открывает странички и сама листает ленту, делая скриншоты</p>
<p>Находит то, какой запрос вы дали и собирает это все в один файл, который выглядит вот так</p>
<img src="/kurs/assets/pasted-image-20260725162728.png" alt="">
<p>То, что заняло бы у вас 2-3 часа - нейронка сделает самостоятельно за 15-20 минут</p>
<p>Промпт и инструкцию я выложу отдельным блоком, плюс сниму отдельное видео, где покажу, как это делается</p>
<p class="punch">На выходе</p>
<p>У вас должно быть 10 рабочих заходов по вашей теме</p>
<p>Не текст целиком, не чужие тезисы - только заход: первые три секунды ролика или первый слайд карусели</p>
<p>Дальше вы берете свои смыслы из <i>Карта смыслов</i> и раскрываете их через эти заходы</p>
<p>Это и есть весь фокус: заход берем тот, который уже сработал, а начинку даем свою</p>
<p>Если не идет - вернитесь и проверьте два места: заход был реально рабочий (цифры выше среднего у автора) или вы подставили не смысл, а тему</p>
<h3>Чего упаковка НЕ значит</h3>
<p>Упаковка - это не красота</p>
<p>Монтаж, шрифты, свет, переходы, вылизанная картинка - это оформление, и оно почти ничего не решает</p>
<p>Мой рилс за три минуты без монтажа собрал 12 297 просмотров и 55 подписок</p>
<p>Карусель за пятнадцать минут - 89 140 просмотров и 221 подписку</p>
<p>А семь роликов, снятых с профессиональным оператором и краской на лице, не добрали и пяти тысяч</p>
<p>Люди путают упаковку с оформлением и потом четыре часа вылизывают то, что вообще ни на что не влияет</p>
<h3>Форма и упаковка - это не одно и то же</h3>
<p>Слова похожие, поэтому проговорю отдельно</p>
<p><strong>Форма</strong> - это про вас</p>
<p>В чем вам комфортно создавать: писать, говорить на камеру, дизайнить карусели</p>
<p>Она отвечает на вопрос «как бы это было, если бы это было легко», и мы разбирали ее на третьем уровне</p>
<p><strong>Упаковка</strong> - это про зрителя</p>
<p>Как ему это заходит</p>
<p>Она отвечает на вопрос «почему он вообще это возьмет»</p>
<p>Можно быть в правильной форме и в мертвой упаковке: комфортно писать посты, которые никто не читает</p>
<p>Собственно, это и есть переход с третьего уровня на пятый</p>
</section>
<section>
<h2>Умножение: одна идея - двенадцать единиц</h2>
<p>Вот вы придумали идею, сценарий, текст</p>
<p>Как понять, какой заголовок верный?</p>
<p>Какая длительность правильная?</p>
<p>Какой призыв к действию воткнуть?</p>
<p>Ответ: никак</p>
<p>И что делать?</p>
<p>Сделайте все</p>
<p>Снимите 3 разных начала - три хука</p>
<p>Снимите 4 разных призыва к действию: вообще без него, рассказали в описании, ключевое слово в комментарии, отправили в хайлайт или карусель</p>
<p>Таким образом одна ваша идея превращается в 12 контентных единиц</p>
<p>Вы скажете "ну не, Саш, это чересчур"</p>
<p>А я скажу: с хуяле?</p>
<p>Вам самим невпадлу так относиться к своим идеям, времени и энергии?</p>
<p>Мы опять приходим к тому, насколько вы верите в то, что транслируете</p>
<p>Я пиздец как верю в то, что говорю</p>
<p>Поэтому хочу, чтобы как можно больше людей это увидело</p>
<p>Поэтому хочу, чтобы мои усилия и время оправдали себя</p>
<p>Поэтому я так и делаю</p>
<p>И еще одно, что здесь работает: <strong>наглость</strong></p>
<p>Мы знаем, что инста это казино - значит можно немного считерить</p>
<p>Один и тот же ролик грузить подряд опасно, крупье может запалить</p>
<p>Но у крупье короткая память</p>
<p>Я на нескольких аккаунтах пробовал выкладывать ролики, которые загружал две недели, месяц и два месяца назад</p>
<p>Они показываются на новую аудиторию и работают</p>
<p>Иногда лучше, иногда хуже</p>
<p>Но какая разница, если у вас уже все готово и лежит в телефоне?</p>
<p>Выложить 3-4 раза то, что дало результаты - это две минуты</p>
</section>
<section>
<h2>Метод гипотез</h2>
<p>Теперь как это все собирается в работу</p>
<ul><li>берем тему из потока спроса (как её найти - четыре способа в блоке <i>Поток спроса</i>)</li><li>делаем 7-14 единиц в своем голосе, со своими смыслами</li><li>через две недели смотрим данные</li><li>удваиваем на том, что сработало, или разворачиваемся</li></ul>
<p>Если 7-14 много - сократите до 5-7, но тестировать надо серией, а не одной единицей</p>
<p>Одной единице даем 2-3 шанса</p>
<p>Не сработала с первого раза - не значит плохая, причин может быть восемь, и шесть из них вообще не про вас (полный разбор в статье про казино)</p>
<p>Отсутствие результатов - тоже результат</p>
<p>Это информация, благодаря которой можно сделать маневр</p>
<p>Я видел кучу ребят, которые тратили десятки тысяч долларов, делая одно и то же, и не получали результата</p>
<p>Если у вас ничего не работает, а вы делаете то же самое - странно ждать других результатов</p>
</section>
<section>
<h2>Докрутка: куда смотреть, если не идет</h2>
<p>Здесь мы работаем как в траблшутинге - по причинам, а не наугад</p>
<p><strong>Мало просмотров</strong> - вы не цепляете внимание, то есть неинтересные первые 3-4 секунды</p>
<p>Что делать:</p>
<ul><li>подумать над отличительной фишкой, создать якорь</li><li>сделать заголовок интереснее (люди преследуют свою выгоду - покажите, что у вас есть ответы)</li><li>выбрать другую, более интересную идею</li></ul>
<p><strong>Мало сохранений</strong> - нет ценности, нечего сохранять</p>
<p>Что делать:</p>
<ul><li>покажите визуально решение их проблемы: на доске, в тетрадке, на компьютере, графикой в монтаже</li><li>поменяйте идею на такую, которую можно показать визуально</li></ul>
<p><strong>Мало репостов</strong> - люди не узнают в этом свою ситуацию</p>
<p>Что делать:</p>
<ul><li>найти идеи, которые актуальны для зрителя (ютуб, форумы, гугл-запросы)</li><li>показывать ситуации, с которыми ваша аудитория реально сталкивается</li></ul>
<p><strong>Мало лайков</strong> - слабая идея</p>
<p><strong>Мало комментариев</strong> - нет эмоции, это никого не задевает</p>
<p>Докрутите хотя бы один пункт - увидите промежуточные результаты</p>
<p>Докрутите все три первых - полетите в космос</p>
<h3>В каком порядке смотреть метрики</h3>
<ul><li>1. <strong>Доля пропусков</strong> - самая важная. Условно больше 45% - ролик не поедет, его скипают. Значит работаем над началом</li><li>2. <strong>Досматриваемость</strong> - влиять сложнее. Досматривают, когда интересное начало плюс ответ, формула или инсайт в конце, и вы держите интригу до финала</li><li>3. <strong>Сохранения</strong> - самое податливое. Рецепты, методички, списки, формулы, инструкции</li><li>4. <strong>Шейры</strong> - делятся, когда узнают себя, через знакомые ситуации</li><li>5. <strong>Лайки и комментарии</strong> - в самом низу приоритета. Комментарии сейчас вообще не котируются: все начали гонять ключевые слова, и площадка понизила их в рейтинге</li></ul>
<p>И сразу предупрежу: не залипайте в проценты взаимодействий</p>
<p>Там нет логики, и попытка попасть в эти цифры - пустая трата времени</p>
<p>Мы в это поиграли и проиграли</p>
<p>Я вообще рассказываю вам про метрики только чтобы сказать: если вы делаете контент постоянно и работаете с потоком спроса, вы в эти цифры даже смотреть не будете</p>
</section>
<section>
<h2>Как этим пользоваться руками</h2>
<p>Перед публикацией проверьте единицу по трем строчкам:</p>
<ul><li>1. <strong>Что я утверждаю</strong> - одним предложением</li><li>2. <strong>Чем я это держу</strong> - какой у меня здесь пруф и из какого он списка</li><li>3. <strong>Как это заходит</strong> - какой заход, какой угол, на чьем языке</li></ul>
<p>Если на второй строчке пусто - вы выкладываете мнение</p>
<p>Если на третьей пусто - вы выкладываете мнение, которое никто не увидит</p>
<p>Если делать это руками лень или непонятно, с чего начать - под разбор собран промпт</p>
<p>Скармливаете ему свой пост, сценарий или карусель, он раскладывает единицу по трем составляющим, показывает пустые места и дает три альтернативных захода под тот же смысл</p>
<p>→ <i>Промпт — разобрать единицу по формуле</i></p>
<p>Отдельно полезно прогнать пачкой пять-десять своих последних единиц: дырка почти всегда системная</p>
</section>
<section>
<span class="slabel">делаем руками</span><h2>Задача</h2><div class="taskbox"><div class="tt">задача уровня</div>
<p>Возьмите три свои последние контентные единицы и разложите каждую по трем строчкам</p>
<p>Не переделывайте, просто разложите</p>
<p>Вы почти наверняка увидите одно из двух: либо везде есть смысл и упаковка, но нет пруфа, либо есть смысл и пруф, но упаковка случайная</p>
<p>Это и будет ваша точка роста на ближайший месяц</p>
</div></section>
<section>
<h2>Что дальше</h2>
<p>Отдельным видео я пройду весь путь целиком - от смыслов до сбора пруфов и упаковки, и соберу это на нескольких разных нишах</p>
<p>Посмотрите на моем примере, как вся история работает вживую</p>
<p>Если что-то показалось тяжелым - это нормально, особенно если вы раньше с контентом не сталкивались</p>
<p>Возвращайтесь сюда, доступ у вас навсегда</p>
<p>Самое главное - пробовать и действовать: правильно, неправильно - плевать, просто делать</p>
<p>Когда вы поняли, что у вас работает, появляется соблазн начать делать этого больше</p>
<p>И вот здесь большинство ломает себе все, что собирало пять уровней</p>
<p>Потому что "больше" почти всегда читается как "больше пахать"</p>
<p>На шестом уровне мы разбираем, как получить больше результата с тех же усилий, а не удвоить нагрузку и откатиться обратно</p>
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
