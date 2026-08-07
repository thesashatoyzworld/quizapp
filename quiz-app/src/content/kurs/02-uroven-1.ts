// Статья урока «02-uroven-1» курса «Новый Уровень Контента».
// СГЕНЕРИРОВАНО: GSD-BRAND/scripts/kurs-to-ts.mjs 02 — руками не править,
// править исходник kurs/02-uroven-1.html и перегенерировать.

export const UROVEN_1_02 = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Хочу, но не делаю · Новый уровень контента</title>
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
  <div class="lvlbadge">Уровень 1</div>
  <h1>Хочу, но не делаю</h1>
  <p class="dek">Вы давно смотрите на других и хотите начать. Но не начинаете — или начали и разочаровались.</p>
  <div class="taskline"><b>Задача:</b> Просто начать выкладывать. Плевать какой контент, плевать какие цифры.</div>
</div></header>

<!--VIDEO_SLOT-->


<main class="wrap">
<section>
<p>Итак, вы давно смотрите за другими людьми, которые создают контент и хотите начать</p>
<p>Может даже покупали обучения какие-то</p>
<p>Но вы либо:</p>
<ul><li>ничего не делали и не делаете</li><li>попробовали, не получили результатов и разочаровались</li><li>поняли, что это сложнее, чем казалось на первый взгляд</li></ul>
<p>Я не буду рассказывать о преимуществах того, что дает вам контент и какие возможности открывает (для этого можете посмотреть мою бесплатную карусель в Инсте - вот тут: ссылка)</p>
<p>Здесь мы разберем одну простую вещь: что вам мешает просто начать</p>
<p>Задача этого уровня - просто начать выкладывать</p>
<p>Результатом является то, что вы на протяжении какого-то времени выкладываете контент в соц. сети: плевать какой, плевать какие результаты</p>
<p>Вы проходите этот уровень в тот момент, когда нажать на кнопку "опубликовать" перестает быть страшным и сложным</p>
<p>Когда вы перестаете оценивать себя сквозь призму цифр и результатов, а начинаете воспринимать выложенную контентную единицу, как победу</p>
<p>Поэтому давайте разберемся с тем, что может вам помешать это сделать и как с этими демонами работать</p>
<div class="kcar" data-i="0" data-n="6">
      <div class="kcfrs"><figure class="kcfr on"><img src="/kurs/assets/ohrannik-1.png" alt="">
         <figcaption><b>дверь «соц. сети»</b><span>между вами и кнопкой стоит охрана. связка ключей у неё на поясе, не у вас</span></figcaption></figure><figure class="kcfr"><img src="/kurs/assets/ohrannik-2.png" alt="">
         <figcaption><b>шесть замков</b><span>страх осуждения, страх неудачи, перфекционизм, синдром самозванца, эго и отсутствие мотивации</span></figcaption></figure><figure class="kcfr"><img src="/kurs/assets/ohrannik-3.png" alt="">
         <figcaption><b>новый аккаунт</b><span>дверь не ломаем. идём туда, где на вас никто не смотрит</span></figcaption></figure><figure class="kcfr"><img src="/kurs/assets/ohrannik-4.png" alt="">
         <figcaption><b>лаборатория нового контента</b><span>выкладываете единицу за единицей, а охрана стоит рядом и записывает</span></figcaption></figure><figure class="kcfr"><img src="/kurs/assets/ohrannik-5.png" alt="">
         <figcaption><b>блокнот охраны</b><span>не больно. не страшно. всем похуй</span></figcaption></figure><figure class="kcfr"><img src="/kurs/assets/ohrannik-6.png" alt="">
         <figcaption><b>открыто</b><span>замки снимает он сам, потому что собрал доказательства. и остаётся рядом, просто больше не мешает</span></figcaption></figure></div>
      <div class="kcbar"><button class="kcarrow" data-d="-1">‹</button><div class="kcdots"><button class="kcdot on" data-i="0"></button><button class="kcdot" data-i="1"></button><button class="kcdot" data-i="2"></button><button class="kcdot" data-i="3"></button><button class="kcdot" data-i="4"></button><button class="kcdot" data-i="5"></button></div>
        <button class="kcarrow" data-d="1">›</button><span class="kccnt">1 / 6</span></div>
    </div>
</section>
<section>
<h2>1. Страх осуждения</h2>
<img src="/kurs/assets/zamok-1.png" alt="">
<p>*тени показывают пальцами только в вашей голове. живые люди рядом идут мимо, уткнувшись в свои экраны*</p>
<div class="ix" data-ix="locks"></div>
<p>Самый страшный демон</p>
<p>"Что подумают мои друзья / родственники / коллеги"?</p>
<p>Это зажимает и сковывает настолько, что мозг придумывает миллион оправданий лишь бы этого не делать</p>
<p>Оно и понятно, наша психика защищает нас</p>
<p>Поэтому, заставлять себя и подключать "силу воли" нету смысла</p>
<img src="/kurs/assets/potok.png" alt="">
<p>Вот как это устроено</p>
<p>По горизонтали ваш навык, по вертикали сложность задачи, которую вы себе поставили</p>
<p>Когда задача сильно выше вашего навыка - вы не работаете, вы тревожитесь</p>
<p>Когда сильно ниже - вам скучно</p>
<p>А между ними узкая полоса, в которой все получается: задача чуть выше того, что вы уже умеете</p>
<p>Поэтому сила воли тут и не работает</p>
<p>Она тащит вас вверх, в тревогу, вместо того чтобы опустить сложность до вашего уровня</p>
<p>Смотрите, чем вы управляете прямо сейчас</p>
<p>Снять ролик со сценарием, светом и монтажом при вашем навыке - это тревога, поэтому вы за него и не беретесь</p>
<p>Снять то же самое на телефон одним дублем и выложить - уже поток</p>
<p>Тот же вы, та же камера, поменялась только высота планки</p>
<p>Дальше проходит пара месяцев, вы делаете это на автомате, и та же задача становится скучной</p>
<p>Вот тогда планку и поднимаете</p>
<p>Так и идете по диагонали, из уровня в уровень</p>
<p class="punch">Навык двигается вправо месяцами, а планка опускается сегодня</p>
<p>Поэтому на первом уровне мы работаем не с навыком, а с планкой</p>
<p>У нас здесь два варианта: мы либо разбираемся в этом вопросе, либо создаем комфортные себе условия</p>
<p>Либо все вместе</p>
<h3>Разбираемся в вопросе</h3>
<p>Мы, люди, как вид выжили потому что научились собираться в группы и объединятся ради одной цели</p>
<p>Раньше, если вы не принадлежали к стае / группе - шансов на выживание было минимум</p>
<p>То есть наша психика сформирована таким образом, чтобы НЕ выделяться</p>
<p>Нас это пугает до жути, потому что включает режим безопасности, который формировался сотнями лет</p>
<p>Теперь представьте, что вы делаете, когда пытаетесь заставить себя?</p>
<p>Вы боретесь со своей природой, а это всегда заканчивается плохо</p>
<p>Я не сторонник издевательства над собой, я не верю в такие методы</p>
<p>Потому что если начать с этого - у вас сформируется негативное отношение к контенту</p>
<p>Ведь каждый раз выкладывая что-то - это будет вызывать у вас боль, чуть ли не на физическом уровне</p>
<p>Поэтому, предлагаю обойти эту систему безопасности</p>
<h3>Два варианта обойти систему безопасности</h3>
<p>Если наша задача просто публиковать любой контент, то я в своей работе с клиентами делаю это в два шага:</p>
<ul><li><strong>включай камеру и снимай себя</strong></li></ul>
<p>не надо никуда выкладывать</p>
<p>просто снимаешь в галерею</p>
<p>можешь молчать и снимать как ты куда-то идешь или просто говорить, что в голове - вообще плевать</p>
<p>мы здесь упрощаем и режем задачу на минимально выполнимую в целом</p>
<p>когда ты привыкнешь к себе в кадре, перестанешь смущаться (а это произойдет и ты это почувствуешь) - мы переходим к следующему шагу</p>
<blockquote><p>я сам постоянно разговариваю на камеру: когда мне грустно, страшно, я устал, хочу поныть, высказаться</p><p>я это делаю, потому что это офигенная практика, которая помогает многие состояния просто проживать, когда тебе не с кем поделиться</p><p>что-то из этого я потом могу при желании выложить, а могу нет</p></blockquote>
<ul><li><strong>новый аккаунт и публикация</strong></li></ul>
<p>если страшно, что там подумают те, кто на тебя подписан - сделай новый аккаунт</p>
<p>все</p>
<p>проблема решена</p>
<p>туда можно публиковать любую дичь, которая есть в твоей галерее и это никто не увидит</p>
<p>задача в том, чтобы начать выкладывать</p>
<p>только через действие можно снять блок смущения</p>
<p>так как ты уже попрактивался с записью себя на камеру - тебе останется выложить парочку видосов и показать своему мозгу: ничего страшного не произошло после публикации</p>
<p>как только ты это сделаешь - страх начнет рассасываться сам по себе</p>
</section>
<section>
<h2>2. Страх неудачи</h2>
<img src="/kurs/assets/zamok-2.png" alt="">
<p>*одно отжимание - и сразу в зеркало: почему я ещё не такой*</p>
<p>когда мы начинаем заниматься контентом - все мы хотим видеть "крутые" цифры</p>
<p>подписчиков, лайки, комменты и просмотры - это нормально</p>
<p>но если привычка и навык не сформированы, это является завышенными ожиданиями</p>
<p>когда мы воспринимаем результат своей деятельности на данном этапе через призму цифр - тогда давление слишком большое и начинается саботаж</p>
<p>"что если я выложу рилс и он не наберет просмотров?" - звучит голос в голове</p>
<p>идем по той же самой схеме</p>
<h3>Разбираемся в вопросе</h3>
<p>да, тебе важны цифры</p>
<p>и мне они важны</p>
<p>но представьте, что вы пришли в спортзал и после первого упражнения, пошли и встали на весы</p>
<p>что вы там увидите?</p>
<p>разочарование</p>
<p>потому что ничего не поменялось</p>
<p>окей, вы думаете: "ну сделаю все упражнения и потом подойду"</p>
<p>закончили тренировку и встаете на весы</p>
<p>разочарование</p>
<p>походили неделю</p>
<p>опять тоже самое</p>
<p>в итоге любой человек, который сосредоточен на том, чтобы получить результаты - бросит</p>
<p>потому что не понимает своего уровня и что для него является победой</p>
<p>вы смотрите на накачанных буйволов и попастых девчонок и думаете: "блин, ну вот они же круто выглядят"</p>
<p>и в контенте вы также смотрите на других, у кого есть эти цифры</p>
<p>но важно принять свой уровень</p>
<p>приняв свой уровень - вы перестанете себя сравнивать</p>
<p>а значит - перестанете закидывать планку ожиданий</p>
<p>а значит - перестанете разочаровываться</p>
<p>а значит - будете продолжать двигаться и "приходить в спортзал"</p>
<h3>Обход системы безопасности</h3>
<p>наша цель - сменить критерии оценки</p>
<p>вы выложили контентную единицу (пришли в спортзал) - она не набрала цифр (вес не изменился) - вы разочаровались</p>
<p>давайте заменим это на:</p>
<p>вы выложили контентную единицу  (пришли в спортзал) - победа</p>
<p>то есть</p>
<p>выложить контент уже является прогрессом и результатом само по себе</p>
<p>вы практикуетесь и закрепляете навык в своей нервной системе</p>
<p>вы привыкаете делать это</p>
<p>а что может являться результатом привычки?</p>
<p>правильно - её повторение</p>
<h3>И чтобы вы понимали масштаб страха</h3>
<blockquote><p>Наташа, 44 подписчика</p><p>у Наташи на аккаунте было 44 подписчика</p><p>не 44 тысячи, а сорок четыре человека</p><p>ровно та ситуация, в которой страшнее всего выкладывать: кажется, что тебя никто не смотрит, а любая цифра будет позорной</p><p>мы двигались с ней по этой же методологии, и когда дошли до потока спроса (это пятый уровень, туда мы еще придем) - вот что дал один ролик</p></blockquote>
<img src="/kurs/assets/rezultaty-rils-natasha.jpg" alt="">
<p>168 127 просмотров, 121 498 охваченных аккаунтов, 122 подписки</p>
<p>2 700 лайков, 3 300 пересылок, 237 сохранений</p>
<p>С аккаунта, где было 44 человека</p>
<p>Я показываю это не для того, чтобы вы сейчас ждали таких цифр</p>
<p>Наоборот</p>
<p>Я показываю это, чтобы снять вопрос "а есть ли вообще смысл начинать с нуля"</p>
<p>Смысл есть, но добираются туда те, кто сначала прошел вот этот уровень: просто начал выкладывать и не бросил</p>
</section>
<section>
<h2>3. Перфекционизм</h2>
<img src="/kurs/assets/zamok-3.png" alt="">
<p>*время, силы, нервы, деньги. дверь рядом, только ролик уже не сдвинуть. и заметьте, кто навешивает очередную гирю*</p>
<p>многие люди пытаются собрать всю информацию и только потом начать действовать</p>
<p>собрать систему, подобрать форматы, разобраться в хуках и т.д.</p>
<p>смотрят кучу информации и собирают обучения</p>
<p>но чаще всего перфекционизм - это скрытая форма страха (любого)</p>
<h3>Разбираемся в вопросе</h3>
<p>Давайте разберемся с тем, что такое перфекционизм и что за ним прячется</p>
<p>если на простом: перфекционизм - это попытка сделать "идеально"</p>
<p>планка требований настолько высокая, что она вызывает стресс и огромное давление</p>
<p>чем выше требования и сложность - тем выше сопротивление</p>
<p>чем выше сопротивление - тем больше энергии и времени нужно прикладывать для решения задачи</p>
<p>а ни энергии, ни времени в современном мире у человека нету</p>
<p>и получается удобная картина</p>
<p>"да я хочу делать контент, но у меня нету времени и энергии"</p>
<p>то есть, я не плохой, я ведь хочу</p>
<p>но в силу обстоятельств и того, что я хочу делать "очень круто" или максимально "правильно" - я не делаю этого</p>
<p>система безопасности решает простую задачу - не столкнуться с реальностью</p>
<p>с какой?</p>
<p>с реальностью, где ты не "идеальный"</p>
<p>где твои идеи, даже доведенные до макимума, могут не откликнутся в сердцах людей</p>
<p>а это больно</p>
<p>представьте картину, когда вы стараетесь и делаете какую-то контентную единицу</p>
<p>вкладываете время, силы, энергию, нервы, деньги</p>
<p>конечно, планка ожиданий будет большая - ведь вложено было много</p>
<p>и если фокус на результатах и цифрах - человека ждет боль и разочарование (только если он не выбьет джекпот, но как мы обсуждали выше - такой подход не эффективен)</p>
<p>поэтому, удобно сидеть в своей голове с "идеальным" контентом, но который так и не вышел в свет</p>
<p>к тому же здесь очень многое завязано на самоценности и синдроме самозванца (этот синдром - лучший друг перфекционизма)</p>
<p>про него мы погорим дальше</p>
<h3>Обход системы безопасности</h3>
<p>закрепляем еще раз - пытаться победить эту систему не выгодно</p>
<p>она сформировалась у вас не просто так и защищает вас</p>
<p>эта система строилась годами</p>
<p>единственный выход - начать показывать самому себе неэффективность этой системы и действовать в обход</p>
<p>любая программа у которой выходят новые функции - требует обновления</p>
<p>здесь также, просто нужно делать это постепенно</p>
<p>а руками это делается двумя приемами</p>
<p class="punch">прием первый: один дубль</p>
<p>снимаете один раз и не пересниматesь</p>
<p>вообще</p>
<p>запнулись, оговорились, забыли слово - оставляем как есть</p>
<p>перфекционизм живет в пересъемке: именно там вы восемь раз повторяете одно и то же и в итоге не выкладываете ничего</p>
<p>я свой рилс за три минуты снял именно так: включил камеру, сказал что хотел, выложил</p>
<p class="punch">прием второй: потолок времени вместо потолка качества</p>
<p>до того как начать, назовите вслух, сколько времени вы на это даете</p>
<p>пятнадцать минут, полчаса, час - неважно</p>
<p>важно, что вы выкладываете то, что получилось к моменту, когда время вышло</p>
<p>не то, что доделали, а то, что получилось</p>
<p>и вот здесь происходит подмена, ради которой все затевалось</p>
<p>раньше критерий был "достаточно ли это хорошо" - на этот вопрос вы никогда не ответите "да"</p>
<p>теперь критерий "уложился ли я в свое время" - и на него всегда есть честный ответ</p>
<p>подробно про рамки времени мы будем говорить на четвертом уровне, но начинать пользоваться этим можно прямо сейчас</p>
<p>сначала рассмотрим синдром самозванца</p>
</section>
<section>
<h2>4. Синдром самозванца</h2>
<img src="/kurs/assets/zamok-4.png" alt="">
<p>*стоите на пятой ступени, а в отражении - на первой и ростом меньше*</p>
<p>эта бадяга просто сводит с ума десятки тысяч людей и крутых спецов</p>
<p>про неё я писал отдельную статью и повторяться не буду</p>
<p>эту статью можно прочитать вот тут: <a href="https://thesashatoyz.com/blog/ne-obnulyay-svoy-opyt" target="_blank" rel="noopener">https://thesashatoyz.com/blog/ne-obnulyay-svoy-opyt</a></p>
<p>как работает эта связка</p>
<p>"я недостаточно хорош / компетентен / квалифицирован" (синдром самозванца) - поэтому мне надо стараться / работать / делать лучше (перфекционизм) - это слишком сложно и тяжело (саботаж) - мне это не подходит / у меня нету времени и энергии / мне это не надо / у меня не получается (оправдание) - я ничего не делаю (действие) - "я недостаточно хорош / компетентен / квалифицирован" (замыкание цикла от бездействия)</p>
<p>то есть перфекционизм - это прикрытие для синдрома самозванца</p>
<p>и ноги у всего этого растут из простого слова - "самоценность"</p>
<h3>Разбираемся в вопросе</h3>
<p>если вы обесцениваете свой опыт - вы всегда будете позади той точки в которой вы находитесь на самом деле</p>
<p>а значит - вам нужно прикладывать сверхусилия для решения какой-либо задачи</p>
<p>представьте шкалу уровней</p>
<p>на самом деле вы стоите на пятнадцатом - за плечами годы, решенные задачи, люди, которым вы уже помогли. игра это засчитала, хотите вы того или нет</p>
<p>а видите вы себя на первом - опыт обесценен, победы не присвоены, и каждое утро вы просыпаетесь новичком</p>
<p>и дальше самое интересное - из этой точки вы прыгаете сразу на двадцатый. берете объем, к которому еще не готовы. не потому что наглый, а потому что не видите, где стоите</p>
<p>вот этот кусок между реальной точкой и той, где вы себя ощущаете - вы себе просто не засчитали</p>
<p>и вот к чему это приводит - с первого уровня на двадцатый не допрыгнуть, и вы это чувствуете. поэтому вы не беретесь вообще</p>
<p>со стороны это выглядит как лень или прокрастинация, а внутри это трезвый расчет. вот так и работает саботаж</p>
<p>потому что, когда у вас все хорошо с "самоценностью"- вам не нужен Х</p>
<p>никакой внешний фактор не будет определяющим для того, чтобы говорить о чем вы хотите или делать так, как хотите вы</p>
<p>как это выглядит?</p>
<p>у меня все гуд с самоценностью - любой контент который я выпускаю "крутой"</p>
<p>и цифры не являются определяющим фактором</p>
<p>потому что, как уже говорилось ранее - эти цифры просто рандом (они появляются у тех, кто продолжает делать контент)</p>
<p>я не буду погружаться сильно глубоко, но надеюсь суть вы уловили</p>
<p>наша задача - вернуть вас на свой уровень и заполнить его</p>
<p>для этого есть несколько приемов</p>
<h3>Обход системы безопасности</h3>
<ul><li>1. принять текущий уровень и ситуацию</li></ul>
<p>что это значит?</p>
<p>это значит отказаться от каких-то там сверхцелей и прочей ерунды</p>
<p>потому что они создают "иллюзию" важности, которая говорит:</p>
<p>"когда я достигну Х - тогда я буду крутым"</p>
<p>но вы уже крутой</p>
<p>на текущем уровне</p>
<img src="/kurs/assets/ty-nisha.png" alt="">
<p>и позади вас есть сотни тысяч людей, которые бы хотели оказаться в той точке, в которой вы находитесь сейчас</p>
<p>давайте делать контент для них</p>
<ul><li>2. инвентаризация опыта</li></ul>
<p>достаточно простая техника, которую мы постоянно используем в работе</p>
<p>вы садитесь и начинаете описывать свои кейсы и результаты работы</p>
<p>не надо начинать со всех - начните с одного</p>
<p>если нету кейсов - просто начните с момента старта своей карьеры / жизни</p>
<p>вы уже решали огромное количество проблем, сталкивались со сложностями и преодолевали препятствия</p>
<p>вам 100% есть чем поделиться</p>
<p>просто пока вы не присвоили себе этот опыт (что и решает данная техника) - вы не можете его использовать</p>
<blockquote><p>чем чаще вы будете это делать - тем больше вы будете присваивать себе свой опыт</p><p>если писать лень - делайте это через аудиосообщения и нейронку</p><p>можно записывать видео</p><p>со временем, когда вы начнете делиться этим опытом публично - это закрепит этот опыт внутри вас и он станет опорой в будущем</p><p>вы начнете смотреть и воспринимать себя иначе</p></blockquote>
<p>и сразу скажу, зачем это нужно дальше</p>
<p>этот список - не разовое упражнение для самооценки</p>
<p>на пятом уровне мы будем собирать вашу карту смыслов: то, во что вы верите и чем крыть карты аудитории</p>
<p>и собирается она ровно из этого материала - из вашего опыта, который вы себе присвоили</p>
<p>поэтому не выбрасывайте файл, он вам понадобится</p>
<ul><li>3. признание другим человеком</li></ul>
<p>этот прием требует смелости или денег</p>
<p>вам нужно найти 2-3 человека, с которыми вы сможете откровенно поговорить и попросить их сказать, как они вас воспринимают</p>
<p>либо же заплатить деньги психологу / коучу / наставнику, чтобы с ним пересобрать эту картину</p>
<p>почему нужны другие люди?</p>
<p>потому что только когда мы получаем признание от других людей и проговариваем вслух - у нас включаются отделы мозга, отвечающие за изменения</p>
<p>потому что другой человек будет воспринимать ваш опыт иначе, не сквозь призму ваших травм</p>
<p>а значит он будет способен подсветить вам то, что вы не замечаете или обесцениваете</p>
<p>в целом, данную практику лучше повторять на постоянной основе (что я делаю сам со своими коллегами и что делаю постоянно с клиентами в групповой работе)</p>
</section>
<section>
<h2>5. Эго</h2>
<img src="/kurs/assets/zamok-5.png" alt="">
<p>*рядом ровная дорога к тому же флагу. но по ней победа не считается*</p>
<p>Очень часто в своей практике я встречал людей, которые знали что делать, но не делали</p>
<p>при этом они могли делать результаты для своих клиентов - в подписчиках, деньгах или просмотрах</p>
<p>на вопрос: "почему бы теперь не сделать такие же результаты для себя?" ответ был следующим:</p>
<p>"потому что это слишком просто"</p>
<p>это слишком просто</p>
<p>а эго хочет быть "особенным"</p>
<h3>Разбираемся в вопросе</h3>
<p>эго - это очень хитрая штука, которая "под шумок" решает свои задачи</p>
<p>оно говорит вам, что вы хотите "славы и признания", но по факту оно просто может хотеть чувствовать себя "особенными"</p>
<p>с этой проблемой чаще всего сталкиваются творцы</p>
<p>им недостаточно получить результаты - им нужно, чтобы путь который они прошли до этих результатов и способ были уникальными</p>
<p>иначе результаты не будут настолько ценными</p>
<p>их надо выстрадать</p>
<p>эго не хочет делать что-то для привлечения внимания</p>
<p>оно хочет, чтобы люди сами пришли и обратили это внимание</p>
<p>какую задачу оно решает?</p>
<p>чувство собственной важности</p>
<p>"если я буду страдать и получу результаты - я герой"</p>
<p>"если я получу результаты легко - это ничего не стоит"</p>
<p>то есть ваша "система безопасности" здесь пытается за счет "сложностей" придать ценности результатам</p>
<p>иначе они не будут иметь значения</p>
<blockquote><p>*В какой-то момент, я обнаружил себя в состоянии страшной гонки.*</p></blockquote>
<p>*Гонки, в которой мое внутреннее состояние, выжигается напалмом.*</p>
<p>*Я начал разбираться с этим и понял одну вещь - я постоянно закидываю планку.*</p>
<p>*Даже в играх - я постоянно ставлю самую высокую сложность.*</p>
<p>*Ведь если я пройду игру легко - ценность победы будет небольшой.*</p>
<p>*А если я, как герой, с простреленной ногой, обцарапанным ветками ебальником и дерьмом скрипящим на зубах, доберусь до цели - уфф, вот это я крутой.*</p>
<p>*И вот я так жил всю жизнь.*</p>
<p>*Путь героя.*</p>
<p>*Включал самую высокую сложность в своей жизни и страдал.*</p>
<p>*Доходил до цели, 5 минут оргазма, апатия и потом по новой.*</p>
<p>*Однажды, работая с психологом, Лена задала вопрос:*</p>
<p>*"Ты хочешь пройти игру или с кайфом поиграть?"*</p>
<p>*Я задумался.*</p>
<p>*Я хочу и первое, и второе.*</p>
<p>*Но тут я подумал:*</p>
<p>*"Если я буду с кайфом играть - я буду играть постоянно. А если я буду играть постоянно - я 100% пройду игру, это неизбежно".*</p>
<p>*И тут меня перещелкнуло.*</p>
<p>*Я понял, что моя цель - играть в свою игру с кайфом, а результаты - неизбежность.*</p>
<p>*И нахуй ваш тяжелый труд.*</p>
<p>*Я не ишак, а человек.*</p>
<p>*Наваль Равикант на недавнем подкасте сказал: "Делай то, что для тебя игра, а для других тяжелый труд".*</p>
<p>*И это супер правда.*</p>
<h3>Обход системы безопасности</h3>
<p>смотрите, здесь достаточно простой чит код</p>
<p>важно разделить контент и закрытие своей потребности</p>
<p>то есть</p>
<p>у вас есть потребность:  быть уникальным</p>
<p>окей, делайте это в своих продуктах или своем творчестве</p>
<p>контент - используйте как инструмент привлечения внимания к вашему уникальному "продукту" (творчество по сути тоже ваш продукт)</p>
<p>или ваша потребность: быть героем и преодолевать трудности</p>
<p>окей, делайте это со своими клиентами или в процессе создания своего творения</p>
<p>контент - используйте как инструмент привлечения внимания к вашему уникальному "продукту" (творчество по сути тоже ваш продукт)</p>
<p>то есть здесь важно изменить ракурс, с которого вы смотрите на контент</p>
<p>ваш контент не равно ваши: продукт, услуга, творение</p>
<p>это просто инструмент</p>
<p>когда вы начнете это разделять - к контенту станет сильно проще относится</p>
</section>
<section>
<h2>6. Отсутствие мотивации</h2>
<img src="/kurs/assets/zamok-6.png" alt="">
<p>*телегу «надо» вы тащите в гору сами. а велосипед «хочу» стоит рядом, и на нём никто не едет*</p>
<p>многие люди хотят - подписчиков, просмотров и денег</p>
<p>но ничего для этого не делают</p>
<p>"у меня недостаточно мотивации" - говорят они</p>
<p>они хотят быстро и ничего не делая получить результаты</p>
<p>к счастью, мир устроен другим образом</p>
<p>у всего есть цена</p>
<p>и данная позиция является очень инфантильной</p>
<p>какую бы цель вы себе не поставили и какие способы мотивации не пробовали - врядли это будет давать долгосрочные результаты</p>
<p>насколько вы будете быстро загораться, настолько же вы будете быстро "тухнуть"</p>
<p>потому что по факту - вы не хотите этого</p>
<p>внутри вас говорит "невроз" или какая-то "травма", которую вы пока еще не понимаете</p>
<p>здесь у вас два пути</p>
<p>первый - вернуться в блок <i>Цель и мотивация блога</i> и собрать свою цепочку "зачем" до самого ядра, а если будущее представить не получается - собрать антивидение</p>
<p>очень часто "нет мотивации" означает ровно одно: работа с контентом никак не связана с вашим будущим, и мозг совершенно справедливо отказывается тратить на нее ресурс</p>
<p>второй - пойти к психотерапевту и разобраться с этим</p>
<p>и я говорю это без иронии</p>
<p>я не смогу разобрать все ваши тараканы в формате, где вы помогаете себе сами</p>
<p>часть вещей решается только в работе с человеком, и это нормально</p>
</section>
<section>
<span class="slabel">коротко</span><h2>Саммари</h2>
<p>Мы разобрали несколько блоков, которые могут вам мешать создавать контент и делиться им публично</p>
<p>Чаще всего это проблема "не технического" характера</p>
<p>За годы практики и работы больше чем с 500+ людьми я могу это говорить уверенно</p>
<p>Главное понять одну вещь - решить проблему можно только через действие и на уровне мышления</p>
<p>Данным разделом я лишь подсветил вам ракурсы и углы, с которых вы можете посмотреть на ситуацию</p>
<p>В рамках данного курса и данного формата работы, я конечно же, врядли смогу решить каждую из этих проблем</p>
<p>Но я считаю, что подсветив вам где висят замки на дверях и какие ключи могут эти замки открыть - я уже сильно помог и дал больше, чем 99% людей, рассказывающих о контенте</p>
</section>
<section>
<h2>А про что снимать</h2>
<p>Этот вопрос всегда возникает следующим, поэтому закрою его сразу</p>
<p>Нормальный сбор идей будет дальше: на четвертом уровне мы разберем, как коллекционировать контент вместо того, чтобы его создавать, а на пятом - как находить то, что уже хотят смотреть люди</p>
<p>Сейчас вам это не нужно</p>
<p>Сейчас задача - набить руку, а не попасть в аудиторию</p>
<p>Поэтому три угла, которых на этом уровне хватит с головой:</p>
<p class="punch">1. Что у вас сегодня произошло</p>
<p>Рабочая задача, разговор с клиентом, ошибка, находка, вывод</p>
<p>Включили камеру и рассказали, как есть</p>
<p class="punch">2. Что вас зацепило</p>
<p>Чужой ролик, новость, чей-то совет, с которым вы не согласны</p>
<p>Посмотрели и высказали свое мнение</p>
<p class="punch">3. Что вы объясняете людям по десять раз</p>
<p>То, что вам кажется очевидным, а вас все равно об этом спрашивают</p>
<p>Вот это и есть ваши первые темы</p>
<p>Заметьте: ни в одном из трех пунктов вам не нужно ничего придумывать</p>
<p>Все три - это то, что уже есть в вашем дне</p>
<p>Если ничего не приходит в голову, ставьте вопрос иначе</p>
<p>Не «что бы такого снять», а «что я сегодня делал, о чем можно рассказать за минуту»</p>
</section>
<section>
<span class="slabel">делаем руками</span><h2>Задача</h2><div class="taskbox"><div class="tt">задача уровня</div>
<p>снять 10-12 роликов и выложить на новый или прежний аккаунт</p>
<p>если в процессе ты почувствуешь опору и силу - можешь выложить часть из них на основной</p>
<p>представь, что новый аккаунт - это полигон для тренировок о котором знаешь только ты</p>
<p>со временем, ты сможешь либо рассказать про этот аккаунт и перевести туда людей из своего основного, либо начнешь уже публиковать в основной</p>
</div></section>
<section>
<span class="slabel">проверка</span><h2>Закрепление на уровне</h2><div class="markerbox"><div class="tt">как понять, что уровень закрыт</div>
<p>наша цель - продолжать это делать легко</p>
<p>баловаться, хулиганить и экспериментировать</p>
<p>твой контент будет показываться только тем, кто тебя не знает</p>
</div></section>
<section>
<h2>Что дальше</h2>
<p>Дальше у вас две дороги, и обе нормальные</p>
<p>Если вы продолжаете выкладывать и кнопка "опубликовать" перестала быть страшной - вам на третий уровень, где мы разбираем, почему сам процесс начинает раздражать</p>
<p>А если вы в какой-то момент остановились и перестали - вам на второй</p>
<p>Там нет ничего страшного, это самая предсказуемая точка выхода, и я объясню, почему вы из нее вышли</p>
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
