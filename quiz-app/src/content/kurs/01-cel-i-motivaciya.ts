// Статья урока «01-cel-i-motivaciya» курса «Новый Уровень Контента».
// СГЕНЕРИРОВАНО: GSD-BRAND/scripts/kurs-to-ts.mjs 01 — руками не править,
// править исходник kurs/01-cel-i-motivaciya.html и перегенерировать.

export const CEL_I_MOTIVACIYA_01 = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Цель и мотивация блога · Новый уровень контента</title>
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
  <div class="lvlbadge">Общий блок · обязательный</div>
  <h1>Цель и мотивация блога</h1>
  <p class="dek">Блок, без которого всё остальное развалится на второй неделе. Идёт до уровней и не пропускается.</p>
  <div class="taskline"><b>Задача:</b> Ответить, зачем вам этот блог, и собрать связь между контентом и вашим будущим.</div>
</div></header>

<!--VIDEO_SLOT-->


<main class="wrap">
<section>
<p class="punch">Место: в самом начале, до карты уровней. Обязательный для всех, пропускать нельзя.</p>
<p>Собран из голосовых 27.07 + Рилсофак (урок 1, «цепочка смыслов»), воркшопы «Продающий Контент 3» и «Контент План», статья «6 уровней навыка», посты <code>1492</code>, <code>1589</code>, <code>1610</code>, <code>1734</code>.</p>
<p>Прежде чем идти по уровням, нужно закрыть один вопрос</p>
<p>Иначе все, что будет дальше, развалится на второй неделе</p>
<p class="punch">Зачем вам этот блог</p>
<p>Вопрос звучит банально, знаю</p>
<p>Но если человек не понимает, зачем он этим занимается, он не сможет заниматься этим долго</p>
<p>Если работа с контентом не вписана в вашу глобальную систему координат, если нет понимания, какую задачу она решает в вашей жизни - вы бросите</p>
<p>Не потому что вы ленивый</p>
<p>А потому что у мозга нет причины тратить на это ресурс</p>
</section>
<section>
<h2>Сначала посмотрите вниз, а не вверх</h2>
<p>Есть пирамида потребностей, вы ее наверняка видели</p>
<p>Снизу вверх: физические потребности, безопасность, социализация, статус, самовыражение</p>
<p>Работа с контентом на дистанции - это верхние этажи</p>
<p>А теперь простая вещь, которую почти никто не учитывает</p>
<p class="punch">Если у вас не перекрыт нижний уровень - физические потребности и безопасность - вам будет тяжело заниматься творчеством и самовыражением</p>
<p>Мозг будет постоянно скатываться в тревогу и переживания</p>
<p>Потому что вам физически нужны деньги, и он про это знает</p>
<p>И в этом состоянии блог на дистанции почти не работает</p>
<p>Психика будет требовать быстрых результатов и закидывать планку ожиданий все выше</p>
<p>Вы выложили десять роликов, не увидели цифр или денег - и все, приехали</p>
<p>У меня есть друг</p>
<p>Каждый раз, когда мы встречаемся, он говорит: да надо делать контент</p>
<p>Два года он это говорит</p>
<p>Иногда начинает, не видит быстрых результатов и бросает</p>
<p>А по итогу это выглядит так</p>
<img src="/kurs/assets/krug-druga.png" alt="">
<p>Ему нужны деньги - он идет искать клиентов - находит их - появляется ощущение безопасности - контент делать не надо - он делает работу - деньги заканчиваются</p>
<p>И круг начинается заново</p>
<p>Здесь надо развести две вещи: локальные задачи и глобальные</p>
<p><strong>Локальные задачи</strong> - это бытовые расходы, питание, безопасность, здоровье</p>
<p><strong>Глобальные задачи</strong> - это действия, направленные на развитие проекта, сбор документов для переезда, изучение нового навыка, который откроет новые возможности</p>
<p>Если вы решаете только локальные задачи - как мой друг - вы будете топтаться на месте</p>
<p>Если вы решаете только глобальные - у вас всегда будет пожар, суета, и вы ничего не будете успевать</p>
<p>И тут важная оговорка</p>
<p>Когда у вас жопа в огне и надо закрывать кредиты, вкладываться в глобальное развитие невозможно</p>
<p>Биология выживания не позволит</p>
<p>На дистанции это выглядит вот так</p>
<img src="/kurs/assets/grafik-poluchaetsya.jpg" alt="">
<p>Когда хорошо - ничего не делаем, ведь и так все хорошо</p>
<p>Когда плохо - тушим локальные задачи, чтобы вернуться в хорошо</p>
<p>Так проходит неделя, месяц, год</p>
<p>Замкнутый круг, на беготню по которому человек тратит время и не растет</p>
<p>А задача в том, чтобы продолжать движение</p>
<img src="/kurs/assets/grafik-vyhod.jpg" alt="">
<p>Когда хорошо - решаем глобальные задачи</p>
<p>Когда плохо - решаем локальные</p>
<p>И через какое-то время наше плохо становится нашим хорошо трехлетней давности</p>
<p>Здесь два выхода, и оба рабочие</p>
<p class="punch">Первый: идти через монетизацию сразу</p>
<p>Не растить аудиторию годами, а искать клиентов и делать продажи с первого месяца</p>
<p>Для этого нужен оффер, то есть внятное предложение, за которое вам заплатят</p>
<p>Выглядит такой путь примерно так</p>
<img src="/kurs/assets/shema-voronka-reels.png" alt="">
<p>Короткое видео приводит новых людей, телеграм их удерживает, а дальше идет разговор и предложение</p>
<p>Обратите внимание: тут нет ни миллиона подписчиков, ни сложных автоворонок</p>
<p>Есть один канал, где вы каждый день делаете оффер, и запуск диалогов с теми, кто интересуется темой</p>
<p>Мы с Васей пошли ровно этим путем</p>
<p>У него было 500 подписчиков, и мы не стали ждать, пока их станет тридцать тысяч</p>
<video src="/kurs/assets/vasya-narezka.mp4" controls playsinline style="width:100%;margin:20px 0;border:1px solid #ddd"></video>
<p>А вот его сообщение спустя время</p>
<img src="/kurs/assets/vasya-890k.jpg" alt="">
<p>«Держу стабильность, 500 000 есть, в августе апнул рекорд, сделал 890 000»</p>
<p>И там же: «простимулировал себя тем, что взял еще одну квартиру»</p>
<p>Две квартиры при полутора тысячах подписчиков</p>
<p>Это к вопросу о том, что для денег не нужна большая аудитория. Нужна лояльная</p>
<div class="todo">[CTA → совместная работа / тариф с блоком монетизации. Формулировку и ссылку уточнить]</div>
<p class="punch">Второй: сначала разгрестись</p>
<p>Разобраться с долгами, закрыть дыры, выделить себе бюджет и время под работу с блогом</p>
<p>Чтобы эта работа происходила спокойно, а не из состояния «мне срочно нужны деньги»</p>
<p>Что из этого ваше - решать вам</p>
<p>Но выбрать надо честно, до того как начнете</p>
</section>
<section>
<h2>Чего вы хотите прямо сейчас: лайков или денег</h2>
<p>Есть два состояния, и они оба нормальные</p>
<p><strong>Приемник</strong> - когда мы хотим получать: лайки, просмотры, похвалу, одобрение</p>
<p>Это состояние творца, который творит ради самого творения</p>
<p>Деньги отсюда прийти могут, но это неконтролируемая история - она работает, когда мы отдаемся процессу на сто процентов</p>
<p><strong>Передатчик</strong> - когда мы хотим зарабатывать, привлекать клиентов, делать бизнес</p>
<p>Мы посылаем сигнал, что у нас есть то, что нужно людям</p>
<p>Раздаем смыслы налево и направо</p>
<p>И вот главное отличие между режимами</p>
<p>Приемник наполняет вас энергией, но кормится из вашего кармана</p>
<p>Передатчик наоборот - жжет вашу энергию, но приносит деньги</p>
<p>Проблема начинается, когда человек <strong>находится в первом состоянии и решает задачи второго</strong></p>
<p>Хочется лайков, а надо зарабатывать деньги</p>
<p>И наоборот: хочется денег, а надо удовлетворять свое эго</p>
<p>Собираетесь продавать - выкручиваете громкость на максимум и передаете</p>
<p>Собираетесь творить и проявляться - выкручиваете громкость на максимум и принимаете</p>
<p>Иначе среди всего шума вас будет не слышно</p>
<h3>Инструмент: ручка громкости</h3>
<p>Это не метафора для красоты, это рабочая ручка, которую вы крутите руками</p>
<p>Представьте обычный регулятор с делениями от нуля до пяти</p>
<p>На нуле вас не слышно вообще</p>
<p>На пятерке вас невозможно не заметить</p>
<p>Вот как это выглядит на практике в режиме <strong>передатчика</strong>:</p>
<ul><li><strong>0</strong> - вы вообще не говорите, что у вас можно что-то купить. Люди искренне не знают, чем вы занимаетесь</li><li><strong>1</strong> - есть где-то в шапке профиля, но вы про это молчите</li><li><strong>2</strong> - иногда упоминаете вскользь, в конце, извиняющимся тоном</li><li><strong>3</strong> - регулярно рассказываете, что делаете и с какими задачами к вам приходят</li><li><strong>4</strong> - есть прямые предложения с призывом к действию, вы запускаете диалоги первым</li><li><strong>5</strong> - активная промо-кампания: оффер каждый день, во всех форматах, пока не закроете задачу</li></ul>
<p>И то же самое в режиме <strong>приемника</strong>:</p>
<ul><li><strong>0</strong> - вы не проявляетесь, вас нет</li><li><strong>3</strong> - вы делитесь тем, что вам самому интересно, без оглядки на продажи</li><li><strong>5</strong> - вы отдаетесь процессу полностью и делаете только то, что хотите, вообще не думая про деньги</li></ul>
<p>И тут важный момент про пробитие</p>
<p>На единице, двойке и тройке вас просто не слышно - всем все равно</p>
<p>Замечать и покупать начинают на четверке и пятерке</p>
<p>Теперь главное</p>
<p class="punch">Проблема почти никогда не в том, что вы выбрали не тот режим. Проблема в том, что ручка стоит на двойке</p>
<p>Продать нельзя, потому что вас не слышно</p>
<p>И покайфовать нельзя, потому что вы все время себя одергиваете</p>
<blockquote><p>когда мне нужны клиенты, я не «немножко продаю»</p><p>я выкручиваю на максимум и продаю в открытую, пока задача не закрыта</p><p>а когда меня начинает тошнить от этого, я не «продаю чуть меньше»</p><p>я выкручиваю в другую сторону и делаю то, что хочется мне</p></blockquote>
<p class="punch">Как этим пользоваться:</p>
<ul><li>1. Ответьте, в каком вы режиме прямо сейчас: передатчик или приемник</li><li>2. Честно поставьте себе оценку от 0 до 5, насколько громко вы в нем работаете</li><li>3. Если получилось 2 или 3 - у вас есть месяц, чтобы выкрутить до 4-5. Не поменять режим, а именно добавить громкости</li><li>4. Через месяц посмотрите на результат. Если задача решена - можно крутить в другую сторону</li></ul>
<div class="todo">[визуал: ручка громкости - регулятор с делениями 0-5, две шкалы: приемник и передатчик. Интерактив в презентации: человек крутит ручку и видит, что меняется в его контенте на каждом делении]</div>
<h3>Как переключаться между ними</h3>
<p>Я эти состояния не «ловлю», я иду от задачи</p>
<p>Если моя задача - продажи и клиенты, я в режиме передатчика</p>
<p>Раздаю, ищу клиентов, делаю продающий контент</p>
<p>Пусть страшно, неудобно, некомфортно - просто постепенно начинаю продавать</p>
<p>Когда чувствую, что мне становится скучно, противно, я устал продавать и мне это надоело - переключаюсь в приемник</p>
<p>Делаю то, что хочется мне</p>
<p>А когда вижу, что клиентов маловато и надо решать технические задачи по монетизации - возвращаюсь в передатчик</p>
<p>Как долго длится каждый режим - зависит от ваших ритмов, целей и желаний</p>
<p>Здесь нет схемы, смотрите по внутренним ощущениям</p>
<p>Что при этом меняется в самом контенте, мы здесь подробно не разбираем - это тема продающего контента, под нее есть отдельный воркшоп</p>
<p>Если коротко: контент становится прицельным для клиентов, появляются продающие посты с призывами к действию, включается активная промо-кампания</p>
<h3>Почему нельзя и то, и другое одновременно</h3>
<p>Если вы хотите зарабатывать деньги, не ждите, что в этот же момент вы много соберете аудитории</p>
<p>Это возможно, но в редких случаях: когда люди выстраивают воронки, продают волшебные таблетки и формулы, зарабатывают и набирают аудиторию одновременно</p>
<p>Это исключения</p>
<p>Чаще всего вы либо работаете на продажи, либо работаете на сбор аудитории</p>
<p>Когда отдаете и привлекаете внимание - вы собираете аудиторию</p>
<p>Когда начинаете продавать, просить, пытаться взять - вы зарабатываете деньги</p>
</section>
<section>
<h2>Почему это напрямую про ваши метрики</h2>
<p>Смотрите на мои цифры за один период</p>
<p>Рилсы четыре месяца набирали в районе 1 000 просмотров</p>
<p>Охваты в телеграме - 250-350</p>
<p>А заработок: январь 800 000₽, февраль 450 000₽, март 250 000₽ (я отдыхал), апрель 450 000₽</p>
<p>Если бы моей целью были просмотры - я бы считал это провалом</p>
<p>Но моей целью были деньги, поэтому это нормальный результат</p>
<p>Тот же Вася с 500 подписчиками зарабатывал 500 000₽ в месяц</p>
<p>А сейчас у него 1 500 подписчиков и две купленные квартиры</p>
<p class="punch">Пока вы не выбрали цель, вы не знаете, какая метрика для вас плохая</p>
<p>И тогда любая цифра вас расстраивает, потому что вы сравниваете ее не со своей целью, а с чужой</p>
</section>
<section>
<h2>Одна задача за раз</h2>
<p>Отсюда же растет ответ на возражение «а я хочу и денег, и аудиторию»</p>
<p>Когда человек говорит «хочу делать контент», он думает, что сказал одно</p>
<p>На самом деле он сказал шесть вещей сразу: чтобы приносил деньги, собирал просмотры, не отнимал время, нравился мне, нравился другим и был «правильным»</p>
<p>Шесть задач в одну строку</p>
<p>Психика смотрит на это и не делает ничего</p>
<p>Та же мысль в столбик работает по-другому: сначала чтобы контент вообще выходил, потом чтобы не бесил, потом чтобы не жрал время, потом чтобы приносил отклик, и только потом масштаб</p>
<p>Берете одну, закрываете, идете к следующей</p>
<p>Через год оглядываетесь - а у вас собран весь стек</p>
<p>Именно из этой вертикали и выросли шесть уровней, по которым мы дальше пойдем</p>
</section>
<section>
<h2>На контент никогда не будет времени</h2>
<p>Теперь самое важное, и я хочу, чтобы вы это услышали до того, как начнете</p>
<p class="punch">На контент никогда не будет времени</p>
<p>У вас есть личная жизнь, семья, работа, хобби</p>
<p>Вы устаете</p>
<p>И в системе приоритетов ваш личный бренд, ваш проект, ваш контент всегда будут скатываться вниз</p>
<p>Сначала на третье место, потом на десятое, потом исчезнут</p>
<p>Дело не во времени</p>
<p>Дело в том, что у этой работы нет прямой связи с вашим будущим</p>
<p>Чтобы удерживать контент в системе приоритетов, эта связь должна быть</p>
<p>Причем связь, которую вы четко понимаете и осознаете</p>
<p>И к которой возвращаетесь два-три раза в неделю, напоминая себе, зачем вы это делаете</p>
<p>Какую глобальную задачу это решает</p>
<p>Краткосрочные понятны: быстро заработать, получить лайки</p>
<p>А вот глобальную надо собрать руками</p>
</section>
<section>
<h2>Полюбить свое будущее</h2>
<p>Работа простая по описанию и непростая по исполнению</p>
<p>Нужно зафиксировать для себя то будущее, которое произойдет, когда это все начнет работать</p>
<p>И полюбить его</p>
<p>Не «хочу 100К подписчиков», а что конкретно изменится в вашей жизни, когда это случится</p>
<p>Очень часто человеку сложно это сделать - будущее размытое, представить его не получается</p>
<p>Тогда заходим с другой стороны</p>
<p class="punch">Антивидение</p>
<p>Пропишите, что произойдет, если вы этого делать НЕ будете</p>
<p>Где вы окажетесь через год, через три, через пять, если контент так и останется на десятом месте</p>
<p>Это работает жестче, потому что тут представлять ничего не надо - вы там уже стоите</p>
<p>Под это я собрал отдельный промпт</p>
<p>Копируете его в нейронку, и она задает вам вопросы по одному. Не утешает, не подбадривает и не дает отделаться словами «ну будет примерно так же»</p>
<p>На выходе получите пять вещей:</p>
<ul><li>1. Где вы через год, через три и через пять - вашими же словами</li><li>2. Цену бездействия: что конкретно теряете</li><li>3. Ваши оправдания, выписанные прямой речью</li><li>4. Разворот: как выглядит та же жизнь, если вы этим все-таки занимаетесь</li><li>5. Одну фразу, которую можно повесить перед глазами</li></ul>
<div class="todo">[инструмент → <i>Промпт — антивидение</i>]</div>
</section>
<section>
<h2>Цепочка смыслов: как найти свое настоящее «зачем»</h2>
<p>Теперь инструмент, который собирает связь с будущим по шагам</p>
<p>Он нужен, чтобы ваше «хочу» и ваше «надо» перестали воевать</p>
<p class="punch">Мое хочу - это топливо. Мое надо - это двигатель</p>
<p>Без топлива двигатель не поедет, без двигателя топливо просто стоит в баке</p>
<blockquote><p>История первая: подъемы в 5 утра</p><p>однажды я захотел начать просыпаться в 5 утра</p><p>и нет, я не покупал книгу "магия утра" - просто понял, что хочу</p><p>первые два дня просыпаюсь, дальше заставляю себя, к концу недели мне уже плевать</p><p>задаю себе вопрос: почему я не могу проснуться?</p><p>ответ: у меня нет причины это делать</p><p>я хочу просыпаться в 5, потому что чувствую себя лучше</p><p>но история повторяется</p><p>зачем мне чувствовать себя лучше? чтобы выполнять работу качественно</p><p>зачем делать работу качественно? чтобы решения, которые я принимаю за день, приближали меня к цели</p><p>зачем мне деньги? чтобы был ресурс менять свою жизнь</p><p>зачем мне этот ресурс? чтобы максимально не зависеть от других людей</p><p>зачем мне не зависеть? потому что я хочу свободы</p><p>вот здесь я нашел свое ядро</p><p>просыпаясь в 5 утра, я иду к своей свободе - к тому, что для меня самая большая ценность в мире</p></blockquote>
<p>У этой истории было «хочу», но не было «надо» - и его пришлось собрать через цепочку «зачем»</p>
<blockquote><p>История вторая: младший брат</p><p>брату было 6 лет, через год в школу, нужно было выучить алфавит</p><p>а внимания у детей хватает минут на десять</p><p>я предложил: "а давай соберем костюм железного человека?"</p><p>он фанател от супергероев и был в восторге</p><p>"а ты знаешь, что у него за штука посередине?" - "да, ядерный реактор"</p><p>"тогда начинать надо с него, а для этого нужна физика"</p><p>"отлично, давай физику"</p><p>"погоди, в физике много цифр - сначала нужна математика"</p><p>"хорошо, что нужно?"</p><p>"в математике примеры написаны текстом, а ты не знаешь букв - значит нужна азбука"</p><p>в итоге мы полгода занимались физикой по азбуке</p><p>он сам приходил и говорил: "будем физикой сегодня заниматься?" - а в руках держал букварь</p></blockquote>
<p>Здесь наоборот: было «надо», а «хочу» пришлось собрать</p>
<p>Эти две истории - как две капли воды, разница только в том, с какой стороны собирали</p>
<h3>Два вопроса, которые все решают</h3>
<p><strong>«Зачем мне это?»</strong> - собирает поддержку для вашего ХОЧУ</p>
<p>Каждое слово здесь работает как резьба в ключе:</p>
<ul><li><strong>зачем</strong> - весомая ли причина</li><li><strong>мне</strong> - мое это или чужое</li><li><strong>это</strong> - та ли цель вообще</li></ul>
<p><strong>«Как я хочу?»</strong> - собирает поддержку для вашего НАДО</p>
<ul><li><strong>как</strong> - способ</li><li><strong>я</strong> - мой это способ или навязанный</li><li><strong>хочу</strong> - нравится ли мне так делать</li></ul>
<p>Первый вопрос дает смысл, второй - делает путь выносимым</p>
<h3>Как это выглядит на моем примере</h3>
<blockquote><p>я хочу 100К в инсте - чтобы у меня был актив в виде аудитории</p><p>зачем мне актив в виде аудитории - чтобы я мог запускать свои продукты в онлайне</p><p>зачем мне продукты в онлайне - чтобы зарабатывать удаленно и не зависеть от других людей</p><p>зачем мне не зависеть - чтобы быть свободным финансово и физически</p><p>зачем мне свобода - чтобы реализовывать свои идеи любого масштаба</p><p>зачем мне реализовывать идеи - чтобы менять мир</p><p>зачем мне менять мир - потому что я хочу влиять на свое будущее и мир, в котором живу</p><p>зачем мне это - потому что это ахуенно: быть частью чего-то большего и знать, что ты можешь изменить будущее</p></blockquote>
<p>У меня это не было прописано, пока я не начал писать методологию урока</p>
<p>Конструкция собралась в голове в тот момент, когда я отказался от чужих моделей поведения</p>
<p>Теперь, работая с контентом, у меня есть что-то большее, чем 100К подписчиков</p>
<p>И вот главный побочный эффект</p>
<p class="punch">Как победить такую цепочку? Никак, потому что она моя</p>
<p>Ни один пук в мою сторону, каким бы дорогим и глянцевым он ни был, не собьет меня с лошади, которую я собрал сам</p>
<p>Если я упаду с лошади - я не пойду гуглить, почему упал</p>
<p>Потому что никто лучше меня не ответит на этот вопрос</p>
<p>Один скажет, что седло не то, другой - что подковал неправильно, третий начнет ссылаться на генетику лошади</p>
<p>А что если я просто упал? Такое бывает</p>
</section>
<section>
<h2>Что делать, если вы не знаете, зачем вам блог</h2>
<p>Это нормальная ситуация, и она встречается чаще, чем кажется</p>
<blockquote><p>ко мне пришел Сева и говорит: "Саня, хочу больше денег зарабатывать"</p><p>начинаем разматывать путь к деньгам, а на первом созвоне выясняется, что у него куча задач висит</p><p>говорю: "если мы завтра еще 5 проектов возьмем за бабки - как ощущения?"</p><p>он: "хочу сдохнуть, вообще нет сил"</p><p>я: "а если завтра будет выходной, вообще без телефона?"</p><p>он: "ахуеть, хочу!"</p><p>в итоге задачи, которые сосали энергию всю неделю, закрылись в тот же день за вечер</p><p>потому что появилась близкая и доступная цель, которая капец как мотивирует</p><p>а на следующий день Сева хуярил в баскет и провел день как хотел</p><p>и дальше уже на волне этой энергии: взял больше проектов, выключил самокритика, поднял прайсы</p><p>и все это в разрезе одного месяца</p><p>но важно другое: он шел зарабатывать, не понимая, зачем зарабатывает</p><p>а это невозможно</p><p>поэтому довольно быстро мы нашли, нахрена ему деньги - поездка в Японию на горнолыжку осенью</p></blockquote>
<p>Вывод: цель не обязана быть великой</p>
<p>Она должна быть <strong>вашей</strong> и достаточно близкой, чтобы вы ее чувствовали</p>
<p>Япония осенью работает лучше, чем «хочу больше денег»</p>
</section>
<section>
<h2>И про дисциплину, чтобы закрыть эту тему сразу</h2>
<p>Нам говорят: будь дисциплинирован и станешь успешным</p>
<p>Люди внедряют тайм-менеджмент, сжатые дедлайны, систему вознаграждений</p>
<p>Живут так пару месяцев, выгорают и решают, что они недостаточно дисциплинированы</p>
<p>И что делают дальше? Становятся еще дисциплинированнее</p>
<p>На мой взгляд, дисциплина - это следствие, а не причина</p>
<blockquote><p>я не пример дисциплинированности, это точно не моя сильная сторона</p><p>но когда я подростком занимался футболом - мне не нужно было себя пинать</p><p>я вставал в 7 утра каждый день, приезжал первым на тренировку и открывал раздевалки</p><p>тренировался сам, потом с командой, оставался на вторую тренировку со второй командой</p><p>ехал в школу, приходил домой, делал домашку и ложился спать</p><p>сложно?</p><p>да, только если для вас это "не легко"</p><p>для меня это было естественно - я находился в синхроне с самим собой</p><p>у меня была моя цель, не навязанная кем-то извне</p><p>и мне не нужны были расписания и прочие костыли</p></blockquote>
<p>Так что если вам кажется, что вам не хватает дисциплины - скорее всего вам не хватает не дисциплины</p>
<p>Вам не хватает своей цели и своего способа к ней идти</p>
</section>
<section>
<span class="slabel">делаем руками</span><h2>Задача</h2><div class="taskbox"><div class="tt">задача уровня</div>
<ul><li>1. Честно посмотрите на нижний этаж: закрыты ли у вас деньги и безопасность. Если нет - решите, каким путем идете: сразу в монетизацию или сначала разгребаете и выделяете себе спокойный ресурс</li></ul>
<ul><li>2. Ответьте, чего вы хотите от блога прямо сейчас: денег и клиентов или аудитории и охватов. Одно, а не оба</li></ul>
<ul><li>3. Соберите свою цепочку «зачем» - от конкретного желания до ядра. Пишите, пока не дойдете до того, что вам самому станет очевидно</li></ul>
<ul><li>4. Соберите антивидение: что будет через год, три и пять, если вы этого делать не станете. Промпт - в <i>Промпт — антивидение</i></li></ul>
<ul><li>5. Ответьте на второй вопрос: «как я хочу это делать?» Три-четыре пункта, что для вас обязательно, а что вы делать не будете</li></ul>
<ul><li>6. Положите ответ туда, где будете видеть его два-три раза в неделю</li></ul>
</div></section>
<section>
<h2>Почему этот блок самый важный</h2>
<p>Теперь, когда мы это обсудили, можно идти по уровням</p>
<p>Я считаю этот блок самым важным во всем курсе</p>
<p>Потому что без него невозможно пробираться сквозь лес, в котором вылезают ваши демоны и по пути появляется куча препятствий</p>
<p>Когда у вас появится вот этот флажок - хотя бы первый, он не должен быть большим - ради которого вы готовы продолжать двигаться, все начнет происходить само</p>
<p>Потому что у вас будет накапливаться желание и энергия на его реализацию</p>
<div class="todo">[ждет Сашу: Саммари одной мыслью · нужен ли маркер закрытия блока · мостик к карте уровней · визуал (пирамида потребностей / шкала приемник-передатчик / цепочка «зачем» лесенкой) · кейсы: человек с целью «аудитория» + человек, взявший чужую цель]</div>
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
