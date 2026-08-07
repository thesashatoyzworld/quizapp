// Статья урока «04-uroven-3» курса «Новый Уровень Контента».
// СГЕНЕРИРОВАНО: GSD-BRAND/scripts/kurs-to-ts.mjs 04 — руками не править,
// править исходник kurs/04-uroven-3.html и перегенерировать.

export const UROVEN_3_04 = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Делаю, но бесит · Новый уровень контента</title>
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
  <div class="lvlbadge">Уровень 3</div>
  <h1>Делаю, но бесит</h1>
  <p class="dek">Вы продолжаете ходить в спортзал, но это всё ещё вызывает напряжение и сопротивление.</p>
  <div class="taskline"><b>Задача:</b> Выстроить процесс комфортным для себя способом, чтобы ушло раздражение.</div>
</div></header>

<!--VIDEO_SLOT-->


<main class="wrap">
<section>
<p>Поздравляю, вы уже дальше 95% населения планеты</p>
<p>Вы продолжаете "ходить в спортзал", но это все еще вызывает напряжение и трудности</p>
<p>И это нормально</p>
<p>Не надо думать, что должно быть как-то по-другому</p>
<p>Вы идете в новое, а наш мозг ненавидит новое. Для него это сложно, даже когда это несложно</p>
<p>Попробуйте нарисовать детский рисунок, если вы никогда не рисовали. Сложное ли это занятие? Нет. Но если вы делаете это первый раз - оно будет вас раздражать</p>
<p>Вот что здесь важно понять</p>
<p>Как это выглядит</p>
<p>Нужно придумать идею</p>
<p>Что-то написать</p>
<p>Снять</p>
<p>Смонтировать</p>
<p>А времени на это нет</p>
<p>В итоге весь процесс создания контента вызывает дикое раздражение</p>
<p>И даже когда вы жестко преодолели себя и выложили контентную единицу - на этом не заканчивается</p>
<p>Дальше вы каждые три минуты обновляете ленту и проверяете, сколько просмотров набрало</p>
<p>Залетело, не залетело, залетело, не залетело</p>
<p>А у кого-то еще и уведомления включены, и телефон дергает его весь день. У меня уведомления выключены всю жизнь</p>
<p>Дело здесь не в цифрах, а в том, что планка ожиданий улетела в космос</p>
<img src="/kurs/assets/ohrannik-8.png" alt="">
<p>Вот как это выглядит со стороны</p>
<p>Помните того же охранника? Замки он снял еще на первом уровне, они так и валяются на полу, дверь открыта, он стоит руки в карманах и вообще вам не мешает</p>
<p>А вы все равно еле стоите: камера на шее, штатив под мышкой, свет в одной руке, ноутбук с монтажом в другой, сценарии сыплются на пол, и в зубах телефон, где вы каждые три минуты проверяете просмотры</p>
<p>Держит вас уже не страх. Держит вес того, что вы сами на себя навесили</p>
<p>Что здесь бесит:</p>
<ul><li>что не набирает просмотров и результатов, которых хочется</li><li>что отнимает кучу времени</li><li>что сам процесс придумывания и создания идет через сопротивление, вы буквально выжимаете это из себя</li></ul>
<p>И если вы издеваетесь над собой в процессе создания - с чего вы взяли, что люди этого не почувствуют?</p>
<p>Чаще всего это видно и заметно</p>
<p>Задача этого уровня - выстроить процесс комфортным для себя способом, чтобы ушло раздражение и сопротивление</p>
<p>Вспомните долину отчаяния со второго уровня. Этот уровень чаще всего и есть ваша долина, тот самый участок, где сложно</p>
<p>Поэтому здесь важно сделать все, чтобы себе помочь</p>
<p>Результатом является то, что процесс создания контента перестает вызывать напряжение</p>
<p>Вы проходите этот уровень в тот момент, когда контент выкладывается и вы не напрягаетесь</p>
<p>Все очень просто</p>
<p>Наша задача здесь - сократить напряжение и сопротивление к минимуму</p>
<p>Мы создаем комфортные условия и комфортную среду для создания</p>
</section>
<section>
<h2>Чем опасно застрять здесь</h2>
<p>Сразу оговорюсь: я не предлагаю ничего бросать</p>
<p>Многие из нас достигаторы и герои, нам надо выстрадать. И первая реакция на этот блок будет такая: Саня, ты что, предлагаешь мне сдаться?</p>
<p>Нет. Я предлагаю себя послушать и разобраться, в чем проблема. А не включать в сотый раз любимый метод "соберись, тряпка, ты должен это сделать"</p>
<p>Если продолжать двигаться через сопротивление и раздражение - в какой-то момент человек либо выгорит, либо психика пошлет эту задачу нахрен</p>
<p>Она просто опустит ее в системе приоритетов, придумав какое-нибудь оправдание. Потому что больно и сложно, а долго в этом находиться мы не умеем</p>
<p>А если вы и выгорание закинете в игнор - потому что вам же срочно надо все успеть - тогда вам начнет сообщать тело. Медленно и болезнями</p>
<p>Потому что вы вкладываете сюда 10 единиц энергии, а возвращается вам 0 или 1</p>
<p>А значит, чтобы этим заниматься, вам нужно себя еще больше заставлять</p>
<p>И так по кругу. А планка ожиданий тем временем улетает в космос, и когда эти ожидания не сбываются - снова разочарование</p>
</section>
<section>
<h2>Почему бесит</h2>
<p>Причин несколько:</p>
<ul><li><strong>форма</strong> - вам комфортнее писать, а вы снимаете. Или комфортнее говорить, а вы садитесь писать. И если вы только начали снимать - вы вообще еще на первом уровне, вы просто не привыкли к камере</li><li><strong>чужие тезисы</strong> - вы говорите и выкладываете не то, что хотите сказать, а то, что якобы должно сработать. То, что другие называют правильным. И вот это "правильно" выключает ваш собственный интерес. Копировать чужое просто скучно</li><li><strong>не свои сильные стороны</strong> - вы делаете контент, не используя то, в чем вы и так хороши</li><li><strong>только "надо"</strong> - мне надо набрать подписчиков, надо просмотры, надо клиентов, надо денег. Фокус на результатах, а желания в этом нету. Это тоже создает сопротивление</li></ul>
<p>Вспомните себя маленьким. Я ненавидел копировать чужое, я не видел в этом никакого интереса</p>
<p>А когда мы подходим к делу с любопытством, когда делаем так, как хочется нам самим и нам от этого прикольно - вот тогда и включается желание</p>
<p>Дальше разберем три вещи, из которых собирается комфортная среда: форма, ваша правда и ваша ставка</p>
</section>
<section>
<h2>1. Форма</h2>
<h3>Разбираемся в вопросе</h3>
<p>Мы все пришли из разных точек, с разными программами и настройками</p>
<img src="/kurs/assets/l3-formy.png" alt="">
<p>Кто-то сильнее стесняется камеры</p>
<p>Кто-то уже много писал</p>
<p>Кто-то дизайнил презентации - ему будет проще делать карусели, чем снимать видео</p>
<p>Кому-то нравится готовить все заранее, а кому-то фристайл, в свободной форме</p>
<p>Поэтому важно начать с комфортной для себя формы</p>
<p>Потому что дальше именно она станет фундаментом, на котором мы будем выстраивать все остальное</p>
<blockquote><p>Пример - Женя, онлайн-тренер по бегу</p><p>мы работали с ним примерно полгода и вывели на рекорд - 8 тысяч долларов за месяц</p><p>но когда мы говорили про контент, у него было огромное сопротивление</p><p>он себя заставлял, потом откатывался, переставал делать контент вообще</p><p>клиенты переставали идти, доходы падали</p><p>мы долго крутили эту мысль, и в итоге я предложил ему сменить вектор: не готовить заранее, а делать в свободной форме</p><p>он же тренер по бегу - значит записываем видео прямо на пробежке</p><p>бежит, включает камеру, потом садится, за пять минут монтирует и выкладывает</p><p>контент начал выходить постоянно</p><p>а вместе с ним вернулись заявки и стабильный доход</p><p></p><p>то есть ему не нужен был контент-план, ему от него становилось плохо</p><p>ему нужно было разрешение себе фристайлить</p></blockquote>
<p>Кому-то подходит первое, кому-то второе</p>
<h3>Как найти свою форму</h3>
<p>Задайте себе вопрос:</p>
<p class="punch">"а как бы это было, если бы это было легко?"</p>
<p>Это важный вопрос</p>
<p>Мы сейчас не думаем про клиентов и охваты</p>
<p>Просто - как бы это было, если бы это было легко</p>
<p>В ответе на этот вопрос и лежит та форма, которая вам подходит</p>
<p>Мой ответ, например, выглядит так: честно и прозрачно, быстро, и чтобы ничто не мешало идеям и смыслам. Отсюда и формат - видео и статьи, собранные быстро</p>
<p>Сигнал простой: это должно происходить легко</p>
<p>Сам процесс не должен вызывать сопротивления или же вызывать его минимально</p>
<p>И сразу честно: собрать это так, чтобы вы прям жестко кайфовали, как показывают в инстаграме, сейчас не выйдет. Кайфовать вы начнете позже. Сейчас задача в том, чтобы не было сопротивления и боли</p>
<h3>Куда это грузить</h3>
<p>Если вам нравится писать - Telegram, там же можно и Threads</p>
<p>Если видео - Reels, TikTok, YouTube</p>
<p>Если вам нравятся более сложные и длинные форматы - никто не запрещает снимать по 3 минуты, такая возможность сейчас есть</p>
<p>Если нравится дизайнить и визуализировать - карусели</p>
</section>
<section>
<h2>2. Во что веришь</h2>
<h3>Разбираемся в вопросе</h3>
<p>Если вы говорите то, во что не верите и что вам не нравится - вы будете делать это неестественно</p>
<p>По сути, вы врете, и сами это знаете. Если вы не профессиональный актер и не диктор - отыгрывать то, что вам неорганично, у вас не получится</p>
<p>Люди это чувствуют</p>
<p>Вспомните, как вам звонит кент, которого вы полгода не видели. Вы еще трубку не взяли, а по первым трем секундам уже понимаете: он звонит зачем-то</p>
<p>Ему самому от этого звонка некомфортно, а вы просто чувствуете, что что-то не так</p>
<p>С контентом ровно то же самое. Люди не будут разбираться, они просто перестанут с вами взаимодействовать</p>
<p>И у вас самого это будет вызывать сопротивление</p>
<p>Но самое страшное, что здесь может произойти - это если оно начнет работать</p>
<p>Потому что теперь вы становитесь заложником</p>
<p>Заложником чужих идей, чужих смыслов и образа, который вам не нравится</p>
<p>И каждый раз вам придется надевать тот костюм, в котором вам максимально некомфортно</p>
<img src="/kurs/assets/l3-kostyum.png" alt="">
<p>Удушающий галстук, вы весь такой важный и крутой. А на самом деле оно жмет, душит, вы в этом потеете</p>
<p>Хотя сниматься вам хочется в пижаме</p>
<p>Мы все прекрасно чувствуем, когда человек пытается манипулировать</p>
<p>Когда он что-то от нас хочет</p>
<p>Когда он хочет оторвать от нас кусок</p>
<p>Так почему же мы думаем, что зритель по ту сторону экрана чувствует это как-то иначе</p>
<h3>Как проверить, что вы верите в то, что говорите</h3>
<p>Здесь все на уровне ощущений</p>
<p>Когда вы сказали то, во что действительно верите - сам факт того, что вы это сделали публично, будет чувствоваться как вознаграждение</p>
<p>Услышьте это: вознаграждением становится само действие</p>
<p>Смотрите, как это работает. Вы заебались, денег нет, вам плохо - а вы выходите и рассказываете про успешный успех и красивую жизнь. Вам будет дерьмово, потому что вы знаете, что обманываете людей</p>
<p>А если выйдете и скажете, как вы заебались и что денег нет - вам станет легче от одного факта, что вы это сказали</p>
<p>"я это сделал"</p>
<p>И плевать на цифры</p>
<h3>Актуальный контекст</h3>
<p>Тезисы не нужно откуда-то вытаскивать</p>
<p>Нужно смотреть на свой актуальный контекст - на то, что с вами происходит сегодня</p>
<img src="/kurs/assets/l3-kontekst.png" alt="">
<p>Я сегодня записываю курс. И если бы я захотел сделать сегодня контентную единицу - я бы рассказал, что записываю курс. Не про то, как классно путешествовать по Таиланду, а про то, что у меня происходит прямо сейчас</p>
<p>Поеду завтра к бабушке в деревню - сниму, как приехал к бабушке</p>
<p>Посмотрите вокруг себя: разговор с клиентом, ваш результат, задача, которую вы решили, ваша победа, чей-то чужой успех, переезд, отдых</p>
<p>Про это несложно рассказывать, потому что оно с вами происходит</p>
<p>Если у вас переезд - вам не актуально рассказывать про карьерный рост</p>
<p>Если вы недавно стали мамой - странно рассказывать про то, как набрать аудиторию</p>
<p>Я использую здесь прием, на котором у меня начали работать карусели:</p>
<ul><li>садишься</li><li>ставишь таймер на час</li><li>задаешь себе вопрос: <strong>"что сегодня я хочу сказать этому миру?"</strong></li></ul>
<p>И за этот час собираете карусель или снимаете рилс. Посидите пять минут - ответ придет</p>
<p>А если хочется не одну мысль на сегодня, а вытащить свои тезисы целиком - я собрал под это промпт</p>
<p>Он задает вопросы по одному, не дает вам говорить общими словами и ищет те места, где вы злитесь или спорите. Самые сильные тезисы прячутся именно там</p>
<p>На выходе - 5-7 ваших утверждений с проверкой, какие из них будут работать, а какие человек пролистнет</p>
<p>→ <i>Промпт — во что я верю</i></p>
<p>Этот же материал пригодится вам на пятом уровне, когда будем собирать карту смыслов</p>
<p>Только не опирайтесь на нейронку сильно. Она нужна, когда совсем тяжело и сами вы не вытаскиваете</p>
<p>Лучше один раз пройти это самому и понять принцип. Дальше нейронки вам будут не нужны</p>
<p>Как бы волшебно и странно это ни звучало - в какой-то момент вам приходит ответ</p>
<p>И дальше важно разрешить себе про это рассказать</p>
<p>Мы здесь не подключаем аудиторию, целевая она или нет, продажи или не продажи</p>
<p>Только то, что вам актуально сегодня</p>
</section>
<section>
<h2>3. Ставка на то, что вы уже умеете</h2>
<h3>Разбираемся в вопросе</h3>
<blockquote><p>когда я познакомился с Виталием Говорухиным, он подсветил мне одну вещь</p><p>я 10 лет занимался музыкой и смотрел на это как на пустую трату времени - ведь я не заработал на этом миллионы</p><p>просрал десять лет, ни машины, ни квартиры, какой я балбес - я постоянно себя за это говнил</p><p>а он повторял мне, что это время потрачено не впустую и что именно этот опыт позволит мне заработать мои миллионы</p><p>через пять месяцев я набрал свои 40 тысяч подписчиков - и именно благодаря этому</p><p>потому что я подключил свои навыки озвучки к созданию контента в рилсах</p><p>на тот момент это был уникальный формат</p><p></p><p>я не создал озвучку</p><p>я нашел ее в своей жизни и применил в контенте</p><p>мы угорали с этого еще в 2019 и в 2021, просто никуда не выкладывали</p><p>плюс я у микрофона больше 12 лет, для меня это вообще несложно</p><p></p><p>и если бы я продолжал это обесценивать - вряд ли бы у меня сработало</p><p>другой человек подсветил мне мою сильную сторону, я перестал ее обесценивать и начал использовать</p><p></p><p>подробно я разбирал эту историю вот тут: <a href="https://t.me/sashatoyz/1289" target="_blank" rel="noopener">https://t.me/sashatoyz/1289</a></p></blockquote>
<img src="/kurs/assets/insta-40k.jpg" alt="">
<p>Мы порой не видим того, в чем хороши</p>
<p>Ваша суперсила для вас - норма. Как для Супермена норма, что он Супермен, а для Человека-паука норма, что он летает по небоскребам</p>
<p>Для остальных это не норма</p>
<img src="/kurs/assets/l3-supersila.png" alt="">
<p>Со стороны это выглядит так: вы делаете крутые замки, люди стоят вокруг в шоке, а вы смотрите на работу другого мастера и думаете - вот он-то круто делает, а я кусок говна, что во мне такого</p>
<p>А для сотни тысяч других людей то, в чем вы хороши, может быть очень интересным</p>
<p>Потому что для нас это норма</p>
<p>Либо мы это обесцениваем</p>
<p>А значит - не используем</p>
<p>Для кого-то это креатив</p>
<p>Для кого-то исследования и духота, копание в деталях</p>
<p>Для кого-то аналитика и цифры</p>
<p>Кто-то классно рисует и визуализирует</p>
<p>Кто-то очень искренне и эмоционально высказывает свои идеи</p>
<p>Кто-то клево монтирует</p>
<p>Кто-то клево рассказывает истории</p>
<h3>Как найти свою</h3>
<p>Подумайте, что у вас уже получается легко, но другие люди каждый раз, когда это видят, говорят: "блин, как ты это делаешь?"</p>
<p>Мне так постоянно говорили, когда я фристайлил или озвучивал</p>
<p>Хотя для меня это была норма</p>
<p>А чтобы это было проще сделать - я собрал промпт, который вытащит вашу суперсилу за один разговор с нейронкой</p>
<p>Он задает вам вопросы по одному, не дает вам обесценивать свой опыт и в конце выдает три версии вашей сильной стороны и то, как ее применить в контенте</p>
<p>→ <i>Промпт — вытащить суперсилу</i></p>
<p>И мы здесь не оцениваем свою суперсилу</p>
<p>Потому что если начать оценивать, ни разу это не применив, вы никогда не поймете, насколько сильным оно может быть</p>
<p>Мы просто используем то, что у нас легко получается и в чем мы хороши</p>
<p>Вот и все</p>
</section>
<section>
<h2>Из чего собирается комфортная среда</h2>
<p>Три вещи:</p>
<ul><li>комфортная форма, в которой вы создаете контент</li><li>идеи и смыслы, в которые вы верите: ваша правда плюс актуальный контекст</li><li>ваши естественные способности, которые вы практиковали в других сферах</li></ul>
<p>Вместе они и создают ту среду, в которой контент перестает бесить</p>
<p>И их не надо выдумывать, они есть у каждого</p>
<p>Я не верю, что я какой-то особенный или что особенные другие люди. Неважно, сколько у кого подписчиков - у каждого есть свои приколы и фишки. Кто-то умеет крякать, кто-то двигать бровями невероятным образом</p>
<p>Главное их не обесценивать</p>
</section>
<section>
<h2>Хочу и надо</h2>
<div class="ix" data-ix="scale"></div>
<p>Даже если вы говорите, что вам НАДО, и при этом ЗАСТАВЛЯЕТЕ себя это делать - это означает, что вам не надо</p>
<p>Смотрите, как это работает:</p>
<ul><li>мне надо к зубному - вы идете (вы же не хотите туда идти?)</li><li>мне надо сделать документы - вы делаете (хотеть их вы точно не хотите)</li><li>мне надо отвезти ребенка в школу - вы везете</li></ul>
<p>Когда вам действительно надо - вы действуете</p>
<p>Надо - это кочерга у жопы</p>
<p>И в руках у жизни таких железяк много: здоровье, быт, личная жизнь, работа</p>
<p>А тут вы со своими рилсами, подносите себе еще одну</p>
<img src="/kurs/assets/rilsofak-kocherga.png" alt="">
<p>И вспомните первый модуль: если это "надо" не подвязано к вашей большой цели, оно звучит дерьмово и мотивировать вас не будет</p>
<p>Откуда вообще взялось это "надо" в контенте:</p>
<ul><li>вы увидели, как кто-то через рилсы зарабатывает миллионы, и <strong>захотели</strong> так же</li><li>вы увидели, сколько внимания получает тот, кто снимает, и <strong>захотели</strong> так же</li><li>вы начали снимать, пошли первые деньги, и вы <strong>захотели</strong> больше</li></ul>
<p>То есть вы хотите результат, как у других, но не хотите идти по своей дороге</p>
<p>А двигаясь по чужим дорогам, вы приходите не к тем результатам, которых хотели</p>
<p>Или просто оказывается, что вам не подходит чужой маршрут</p>
<p>И путь, которым вы идете, вызывает у вас боль</p>
</section>
<section>
<h2>Когда будет X - тогда и кайф</h2>
<p>Знаменитая фраза: когда будут деньги, подписчики, миллион просмотров - вот тогда я буду кайфовать</p>
<p>Это самая большая ловушка, об которую ломаются люди</p>
<p>Во-первых, планка ожиданий каждый раз выше</p>
<p>Во-вторых, вы становитесь заложником. Процесс-то повторяемый. Он не работает так, что вы один раз прошли - и дальше делать ничего не надо</p>
<p>У меня есть результаты. У меня есть ролики-миллионники, ролики на сотни тысяч просмотров, я зарабатываю на этом деньги</p>
<p>И я продолжаю это делать</p>
<p>Это становится рутиной, это становится работой</p>
<p>И если вы выстроили процесс так, что издеваетесь над собой - вам теперь придется издеваться над собой каждый день. Чтобы получать результаты, деньги, просмотры, подписчиков, без разницы</p>
<p>Я себе такой жизни не хочу и вам такой не желаю. Поэтому и выстраиваю процесс по-другому</p>
<p>Когда <strong>НАДО</strong> заходит в комнату - <strong>ХОЧУ</strong> из нее выходит</p>
<p>Необходимость наливает стресс в вашу емкость</p>
<img src="/kurs/assets/rilsofak-emkost-1.png" alt="">
<p>Объем и крепкость у всех разная, но принцип один: чем больше вы делаете через силу, тем больше давления внутри</p>
<p>А что мы чаще всего делаем, когда емкость уже полная?</p>
<p>Правильно, начинаем доливать туда еще</p>
<img src="/kurs/assets/rilsofak-emkost-doliv.png" alt="">
<p>При этом исполнение своих <strong>ХОЧУ</strong> эту емкость разгружает</p>
<p>Отдохнуть, поспать, поиграть, посерфить - каждый раз, когда вы это себе разрешаете, вы протыкаете емкость и сбрасываете давление</p>
<img src="/kurs/assets/rilsofak-emkost-3.png" alt="">
<p>А на освободившемся месте появляется то, чего вам все время не хватает</p>
<p>Энергия, желание и силы - на ваши <strong>ХОЧУ</strong> и на ваши <strong>НАДО</strong></p>
<img src="/kurs/assets/rilsofak-emkost-5.png" alt="">
<p>Узнали себя? У 99% людей вот этого свободного места нет вообще</p>
<p>Многие идут дальше и берут энергетический кредит: живут и работают в долг у самих себя</p>
<p>А там накапливаются проценты. И когда приходят коллекторы в виде болезней, долгих разговоров они не ведут - просто забирают свое</p>
<p>Тело говорит: я больше не могу. И вы идете восстанавливаться, потому что для жизни нужно вот это свободное место</p>
<p>И если работать долгое время через сопротивление - результат будет один, выгорание</p>
<p>А еще хуже будет, если вам повезет и при таком раскладе что-то залетит и сработает</p>
<p>Потому что дальше у вас будет "рабочая" схема, которая дала результат, но пользоваться ей вам тяжело</p>
<p>И теперь вы будете заставлять себя еще больше</p>
<p>Вы будете получать результаты ценой страдания</p>
<p>Поэтому люди и не масштабируются: единственный способ получать результат, которому они научились, - это бесконечная боль</p>
<p>Есть много людей, которые скажут вам, что так и надо, что характер закаляется, а вы слабый</p>
<p>Я в это говно не верю ни разу. Я не верю, что можно жить счастливую жизнь и получать результаты, если в тебе нет желания жить и что-то делать</p>
<p>Поэтому здесь важно ответить себе на другой вопрос: а почему я не <strong>хочу</strong>?</p>
<p>Ответов может быть несколько:</p>
<ul><li>вам не нравится тот контент, который вы делаете (попытка угодить, впечатлить, получить результат)</li><li>вы сравниваете себя с другими, и ваши результаты кажутся вам незначительными</li><li>вы не верите, что вы можете привлечь аудиторию</li><li>у вас слишком много стресса в жизни, из-за которого блокируется любое желание</li></ul>
<p>Вспомните картинку с емкостью. Если она переполнена - месту для желания там просто неоткуда взяться</p>
<p>Тогда единственное, чего хочется, - чтобы все выключилось и оставили в покое. Это ведь и есть радикальная форма желания выспаться: человек настолько заебался, что хочет отдыхать бесконечно</p>
<p>И дальше все сводится к балансу:</p>
<ul><li>если у вас много <strong>ХОЧУ</strong> и мало <strong>НАДО</strong> - энергия есть, а необходимости действовать не хватает. Значит создаем условия: органичные дедлайны, обещание другому человеку, расписание. Подносим кочергу к жепке</li><li>если у вас много <strong>НАДО</strong> и мало <strong>ХОЧУ</strong> - протыкаем емкость, снижаем уровень стресса, отпускаем ситуацию, разрешаем себе свое <strong>ХОЧУ</strong>. Давление сбрасывается, а на освободившемся месте появляется батарейка</li></ul>
<blockquote><p>возьмите тетрадку и ручку, заметки тоже сойдут</p><p>разбейте на две колонки: "НАДО" и "ХОЧУ"</p><p>так вы увидите противоречия и поймете, где сами себе врете</p><p>и в каком состоянии сейчас ваша емкость</p><p></p><p>голову даю на отсечение: у большинства из вас в колонке "НАДО" будет просто дохуище всего</p></blockquote>
<p>Закрепляем:</p>
<p class="punch">когда вы чего-то действительно хотите - вы действуете</p>
<p class="punch">когда вам действительно надо и есть необходимость - вы действуете</p>
<p>Если у вас не так - значит где-то есть дырка и противоречие</p>
<p>А это значит, вы себя обманули</p>
</section>
<section>
<h2>Личное</h2>
<blockquote><p>в какой-то момент я делал креативный контент</p><p>и понял, что мне надоело: он отнимал очень много времени</p><p>свою ценность я видел в идеях, в своем видении, в позиции, в своем опыте</p><p>а мне нужно было еще упаковывать это в сложные креативы и вылизывать</p><p>у меня просто изменился контекст</p><p>когда я начинал, мне было актуально использовать этот креатив</p><p>в процессе работы контекст поменялся, и удовольствия это больше не приносило</p><p>процесс стал сложным, а я продолжал себя заставлять - ради сохранения образа и потому что держался за результаты</p><p>бесило, что куча времени уходит на креатив и упаковку, а не на смыслы, которые я транслирую</p><p></p><p>что переключило</p><p>принятие того, что у меня изменился контекст</p><p>и разрешение себе не держаться за результат</p><p></p><p>я задал себе вопрос: а как я хочу это делать?</p><p>первое - я хочу говорить честно, прозрачно и открыто</p><p>второе - я хочу, чтобы это было быстро</p><p>третье - чтобы ничего не мешало идеям и смыслам, которые я транслирую</p><p>форма стала второстепенной, приоритеты поменялись</p><p>и создавать контент стало сильно проще</p><p>карусели я начал собирать за час, а иногда за 30 минут</p><p>потому что больше не сижу над формой - моя суперсила в смыслах</p></blockquote>
</section>
<section>
<span class="slabel">коротко</span><h2>Саммари</h2>
<p>Наша задача на этом уровне - создать себе комфортные условия для создания контента, чтобы это вызывало минимум сопротивления</p>
<p>Сопротивление создает давление, а долго под давлением мы находиться не можем</p>
<p>Потому что если контент вызывает огромное сопротивление - это лишь вопрос времени, когда вы его бросите</p>
<p>А если вы бросите - результатов точно не будет</p>
<p>Представьте, что вам некомфортно жить в собственной квартире. Долго вы там не протянете</p>
<p>Со средой для контента то же самое. Мы выстраиваем ее комфортной, чтобы вы могли двигаться на дистанции</p>
<p>Все</p>
</section>
<section>
<span class="slabel">делаем руками</span><h2>Задача</h2><div class="taskbox"><div class="tt">задача уровня</div>
<p>Сделать так, чтобы процесс создания перестал вас напрягать</p>
<p>И для этого важно сделать все возможное</p>
<p>Мы не думаем о результатах</p>
<p>Не думаем о форме, красоте, экспрессии</p>
<p>Мы здесь вообще не оцениваем то, что делаем</p>
<p>Единственный критерий оценки - ваше состояние</p>
<p>Ваш комфорт и то, как вы себя чувствуете, когда это делаете</p>
<p>И если что-то мешает - задайте себе простой вопрос:</p>
<p class="punch">"что мне не нравится в процессе?"</p>
<p>А дальше ищите решение, как это изменить</p>
<p>Вы получите первый ответ, второй, третий. И как только вы их найдете, мозг сам начнет генерировать, как это поменять</p>
<p>Потому что проблема, которая озвучена и зафиксирована - это уже 50% ее решения</p>
</div></section>
<section>
<h2>Сколько это занимает</h2>
<p>И здесь важно проговорить одну вещь честно</p>
<p>Когда я говорю, что это должно происходить легко - это не значит, что вы сегодня наведете порядок в процессе, а завтра все полетит само</p>
<p>Порядок вы наводите сегодня, а легкость приходит со временем</p>
<p>Привычка и навык формируются временем</p>
<img src="/kurs/assets/potok.png" alt="">
<p>Вспомните картинку с первого уровня</p>
<p>Поток появляется там, где сложность задачи совпадает с вашим навыком</p>
<p>Выше навыка - тревога, ниже - скука</p>
<p>И здесь работает то же самое правило</p>
<p class="punch">Навык двигается вправо месяцами, а планка опускается сегодня</p>
<p>Поэтому мы и работаем с планкой, а не с навыком. Навык подтянется сам</p>
<p>Первое время "комфортно" означает не "в кайф", а "без насилия над собой"</p>
<p>Кайф приходит позже, когда навык дорастет до того, что вы делаете</p>
<p>И помните: результатом привычки является ее повторение</p>
<p>Если вы продолжаете выкладывать и не бросили - привычка формируется, даже если процесс пока не радует</p>
</section>
<section>
<span class="slabel">проверка</span><h2>Маркер, что вы закрепились на уровне</h2><div class="markerbox"><div class="tt">как понять, что уровень закрыт</div>
<p>Сам процесс создания контента начинает вызывать ощущение победы</p>
<p>Если на первом уровне победой было просто выложить, то теперь победа - это собрать и выложить</p>
<p>"блин, классно, я про это сказал, я выразил то, что хотел сказать, и я не издевался над собой в процессе"</p>
<p>И сам процесс становится интересным</p>
</div></section>
<section>
<h2>Что дальше</h2>
<p>Как только процесс перестает бесить, происходит закономерная вещь</p>
<p>Вам хочется делать больше</p>
<p>И вот тут вы упираетесь в следующую стену: контент начинает отжирать время</p>
<p>Один ролик - и полдня нет</p>
<p>Это четвертый уровень, туда и идем</p>
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
