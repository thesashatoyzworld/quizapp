// Конспект личного созвона 2026-09-18. Сгенерирован из
// GSD-BRAND/clients/evgenia-sokolchik/lichnoe/2026-09-18/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_EVGENIYA_2026_09_18 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон · 18 сентября 2026</title>
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
  <p class="kicker">Личный созвон · 18 сентября 2026</p>
  <h1>Чеснок, завёрнутый в ветчину</h1>
  <p class="sub">Созвоны уже превращаются в продажи, поэтому на этой неделе собираем то, чего
  пока нет: коридор между контентом и оффером. Это статья про «ноги кентавра», контент,
  который цепляет тех, кто о проблеме ещё не думает, и расписание, чтобы ролики перестали
  выходить в панике.</p>
  <div class="meta">
    <span>65 минут</span>
    <span>3 человека ждут оплаты</span>
    <span>Главная задача: статья-конвертер</span>
    <span>Следующий созвон: пятница, 11:00 МСК</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Трое сказали да и пропали</a></li>
    <li><a href="#s2">Дверь, коридор и комната</a></li>
    <li><a href="#s3">Тема статьи: ноги кентавра</a></li>
    <li><a href="#s4">Не характер держит диету, а диета делает характер</a></li>
    <li><a href="#s5">Как писать и почему не торопиться</a></li>
    <li><a href="#s6">Слишком узко и слишком широко</a></li>
    <li><a href="#s7">Пять ступеней: кто вообще смотрит твой ролик</a></li>
    <li><a href="#s8">Как расширяться</a></li>
    <li><a href="#s9">Чеснок, завёрнутый в ветчину</a></li>
    <li><a href="#s10">Контент в панике: неделя готовит следующую</a></li>
    <li><a href="#s11">Миша</a></li>
    <li><a href="#s12">Задачи на неделю</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Деньги, которые висят</h2>
  <p>Что делаем с теми, кто согласился, но не заплатил</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Трое сказали да и пропали</h3>
    <span class="ts">00:01:38</span>
  </div>
  <p>На оплате висят трое. Первая уезжает в отпуск и начинает с 25 сентября: на предложение
  забронировать место она даже не открыла сообщение. Вторая обещала оплатить на выходных.
  Третьей, «деловой», ты сама напишешь на выходных: она говорила, что всё в силе и что сообщит,
  если что-то поменяется, а после этого тишина.</p>
  <div class="facts">
    <div class="fact"><div class="n">54 000</div><div class="l">продажа 11 сентября: человек из базы, которую ты подняла</div></div>
    <div class="fact"><div class="n">3</div><div class="l">сказали да на созвонах 14–15 сентября и ждут оплаты</div></div>
    <div class="fact"><div class="n">1 000</div><div class="l">предоплата прямо на созвоне с этой недели</div></div>
  </div>
  <p>Отсюда правило на следующие созвоны: на созвоне берём косарь. Когда человек переводит
  деньги, он берёт на себя обязательство. Ты под него бронируешь место и перестаёшь искать
  других, поэтому объяснять тут нечего: так ты работаешь.</p>
  <p>То, что ты сейчас не можешь это отпустить, нормально: деньги потрачены, их надо вернуть,
  а потока пока нет. Я в апреле сидел с двумя тысячами на карте после трёх месяцев без продаж,
  неделю успокаивался, потом сделал одну продажу, вторую, третью. После этого появляется
  спокойствие: ты знаешь, что в любой ситуации сможешь заработать, и зайдёт человек или нет,
  уже неважно.</p>
  <blockquote><p>Ну, зашёл другой чел, причём сразу же зашёл.</p></blockquote>
  <p>Это коллега, который сам попросился к тебе на ведение на три месяца, тренинг и питание.</p>
</section>

<div class="call">
  <h2>Часть 2. Статья-конвертер</h2>
  <p>Главная задача недели</p>
</div>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Дверь, коридор и комната</h3>
    <span class="ts">00:06:09</span>
  </div>
  <p>Почему я доёбывался до заголовков, которые ты присылала. Проверка простая: надеваешь
  башмаки своей аудитории. Вспоминаешь Женю, которая не следила за телом, листает ленту и видит
  у девчонки в конце рилса «я написала статью, почему ты воняешь слабостью, химические сигналы
  стресса через запах». Пойдёшь читать?</p>
  <blockquote><p>Нет, скорее всего, нет.</p></blockquote>
  <p>Вот поэтому. Такие заголовки подходят для контента, а для статьи нужен другой уровень.</p>
  <div class="box fix">
    <p class="lbl">Как это устроено</p>
    <ul>
      <li><b>Комната.</b> Твой оффер, работа с тобой</li>
      <li><b>Коридор.</b> Статья-конвертер с дипломами и медальками. Человек проходит его и на выходе хочет зайти в комнату</li>
      <li><b>Двери.</b> Контент. Дверей может быть очень много, а коридоров всего несколько</li>
    </ul>
  </div>
  <p>Сейчас коридора нет. Мы делаем контент и сразу сажаем людей на оффер, а они на оффер
  не хотят. Сначала их надо провести по галерее с охуенными десертами, чтобы они дошли
  до чеснока.</p>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Тема статьи: ноги кентавра</h3>
    <span class="ts">00:09:58</span>
  </div>
  <p>Я спросил, зачем ты вообще начинала заниматься фитнесом.</p>
  <blockquote><p>Я хотела похудеть и нормально выглядеть. Мне мой бывший муж говорил, что у меня
  ноги кентавра.</p></blockquote>
  <p>А до него ты чувствовала себя охуенно и красивой, поклонников было много. Потом начались
  «волосы не те, брови не те, длина не та». Ты всё поменяла, а уверенней себя так и не
  почувствовала.</p>
  <p>Это и есть наша аудитория и её боль. Ты тогда хотела не для себя, ты хотела для него.
  На «малышка, выбирай себя» ты бы тогда не подкинулась, ещё не доросла. Подкинулась бы на то,
  как превратить себя в женщину, которую наконец полюбит её мужчина.</p>
  <div class="box">
    <p class="lbl">Как строится статья</p>
    <ul>
      <li>Заходим через то, чего она хочет: стать той, кого полюбит её мужчина</li>
      <li>Показываем, почему не работает: ботокс, издевательства над собой, и если даже мужик скажет «ты превратилась в красавицу», чувствовать себя она будет так же</li>
      <li>Разворачиваем: делаем это для себя. Как выбирать себя и перестать чувствовать вину</li>
      <li>Пруф: твоя история и девочки, которым ты уже помогла</li>
    </ul>
  </div>
  <p>Эта тема лучше той, что про тело и деньги: здесь у тебя своя боль и история, которую
  лучше тебя никто не расскажет. Про деньги сделаем потом. Одна статья откроет нам контент
  про отношения и про то, как мужики к этому относятся, вторая откроет карьеру и бабки.</p>
  <p class="note">Пост «почему красивые и стройные всегда богатые» выкладывай: призыва на статью
  в нём нет, просто протестим тему.</p>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Не характер держит диету, а диета делает характер</h3>
    <span class="ts">00:17:14</span>
  </div>
  <p>Тебе часто говорят: у тебя такой характер, поэтому ты держишь диету и тяжело тренируешься.
  Ты убеждена, что наоборот.</p>
  <blockquote><p>Это было первое дело, которое довела до конца. И вот с тех пор всё доводится
  до конца.</p></blockquote>
  <p>Люди перепутали причину и следствие. Тренировки и диета закаляют характер и превращают
  всё в рутину. Это наш смысл. Но сам по себе он слишком сложный, на него не подкинутся,
  поэтому его надо завернуть в пилюлю того, чего они хотят.</p>
</section>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Как писать и почему не торопиться</h3>
    <span class="ts">00:21:03</span>
  </div>
  <p>С заголовком пока не заморачиваемся. Тему определили, дальше идёшь по структуре
  из воркшопа «Кэш-магниты»: в чём корень проблемы, чем это отличается от всего, что человек
  видел. Можно и в обратную сторону: я сам часто сначала пишу, а потом думаю, как это назвать.</p>
  <div class="box fix">
    <p class="lbl">Порядок</p>
    <ul>
      <li>Наговариваешь голосовыми в нейронку по структуре и присылаешь мне готовым текстом</li>
      <li>Можно блоками: пишешь блок, присылаешь, правим</li>
      <li>Ты приносишь камень, мы отсекаем лишнее. Коротко: либо видео на пять-десять минут, либо короткая статья, за один заход, иначе не дочитают</li>
    </ul>
  </div>
  <p>Главное не торопиться. Люди пытаются наебать систему так же, как у вас в фитнесе: «ем,
  что ты сказала, но иногда ещё две шоколадки». У меня была девочка, которая за два дня
  перевела деньги и гнала: быстрее, быстрее. Дошли до конвертера, она дважды принесла
  одно и то же с тремя изменёнными предложениями, и в итоге выгорела и всё бросила.</p>
  <p class="note">Если вижу халтуру, разверну. Это моя ответственность: пропущу слабый текст,
  через месяц ты придёшь с вопросом, почему не продаёт.</p>
</section>

<div class="call">
  <h2>Часть 3. Контент: лестница Ханта</h2>
  <p>Почему ролики не приводят новых людей и что с этим делать</p>
</div>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Слишком узко и слишком широко</h3>
    <span class="ts">00:27:19</span>
  </div>
  <p>Контент должен сидеть между широкой и узкой аудиторией.</p>
  <div class="box bad">
    <p class="lbl">Два перекоса</p>
    <ul>
      <li><b>Слишком узко.</b> «Два самых высокоэффективных упражнения для спортзала». У тебя были ролики про разницу в целевых мышцах и про дом против зала, и они не сработали. Их смотрят коллеги и твои же клиенты, новая аудитория проходит мимо, алгоритму не хватает взаимодействия</li>
      <li><b>Слишком широко.</b> Мемы и приколы. Либо не набирают, либо набирают и никого не приводят. Тренер Артём сделал ролик с мемом на два миллиона просмотров: сто подписок и одна продажа</li>
    </ul>
  </div>
  <p>Твой максимум был 14–15 тысяч, и оттуда пришла клиентка, которой понравилось,
  как ты выглядишь. Это мы выиграли в рулетку, управлять этим нельзя.</p>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Пять ступеней: кто вообще смотрит твой ролик</h3>
    <span class="ts">00:31:25</span>
  </div>
  <p>Про лестницу ты знала. Штука в том, что на каждой ступени человек думает о своём.
  Пример: человек переехал в другую страну, занят, лишний вес, в зале стрёмно, перепробовал
  кучу программ.</p>
  <ol class="steps">
    <li><b>Не думает о проблеме.</b> Работа, переезд, некогда. Широкий заход: «почему после переезда все набирают вес»</li>
    <li><b>Что-то не так.</b> Одышка, живот, нет энергии. Твоя точка старта: пришёл мужик и сказал про ноги кентавра. Здесь можно пугать, люди шевелятся, когда видят цену бездействия</li>
    <li><b>Ищет варианты.</b> Зал, диета, программы, бег. «Гайд по похудению для занятых», уже продающий контент</li>
    <li><b>Выбирает решение.</b> «Как худеть дома, если в зале стрёмно»</li>
    <li><b>Выбирает, у кого купить.</b> Кейсы до и после, отзывы, философия и позиция</li>
  </ol>
  <blockquote><p>Ой, я набрала после переезда вес.</p></blockquote>
  <p>Вот, откликнется огромному количеству людей. Большинство тренеров делают контент под
  четвёртую-пятую ступень: упражнения, питание, как похудеть. Он продаёт, но новую аудиторию
  не приводит.</p>
  <div class="box fix">
    <p class="lbl">Чем ниже ступень, тем шире охват и дольше путь до покупки</p>
    <ul>
      <li><b>Ступени 1–2.</b> Двери. Широкий контент, задача обратить на себя внимание</li>
      <li><b>Ступень 3.</b> Коридор. Статьи, кейсы, карусели, продаём философию</li>
      <li><b>Ступени 4–5.</b> Комната. Результаты и твой оффер</li>
    </ul>
  </div>
  <blockquote><p>То есть мы из первой и второй ступени вот этим широким охватом делаем так,
  чтобы они стали на ступень три.</p></blockquote>
  <p>Да, ты правильно поняла. Без коридора они посмотрят, поржут, признают, что проблема есть,
  и пойдут дальше, потому что никто не сказал, что делать.</p>
</section>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Как расширяться</h3>
    <span class="ts">00:40:26</span>
  </div>
  <p>Расширение значит спуститься на ступеньку ниже: аудитория шире, но человек идёт к тебе
  дольше. Твоя версия: на стыке с психологией. Одни хотят похудеть, это про результат, другие
  хотят стать каким-то человеком, это про процесс и идентичность. Пока это не стало образом
  жизни, кидать в человека диетой и тренировками бесполезно.</p>
  <p>Два направления, куда можно выйти из «как девушке похудеть»:</p>
  <ul>
    <li><b>Жизнь женщины.</b> Зачем вообще худеть: чтобы быть красивой, успешной. «Пять признаков успешной женщины», про маркеры жизни, а не про фитнес</li>
    <li><b>Здоровье.</b> Страшные последствия того, что его игнорируют</li>
  </ul>
  <p class="note">Расширяемся в одну сторону за раз. В обе одновременно сложно.</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Чеснок, завёрнутый в ветчину</h3>
    <span class="ts">00:43:55</span>
  </div>
  <p>Люди не приходят в соцсети учиться худеть. Ты зачем открываешь Инсту?</p>
  <blockquote><p>Расслабиться. Я лежу на диване такая: «Ой, иди на хуй». Причём вслух
  это говорю.</p></blockquote>
  <p>Вот что происходит с теми, кто объясняет, как жить. Мы становимся вечным напоминанием,
  что с человеком что-то не так. Мы даём ему чеснок: питание, сон, режим. А он хочет ветчину:
  Оземпик, кетодиету, минус десять за неделю. Наша задача завернуть чеснок в ветчину.
  Упаковка меняется, результат тот же.</p>
  <div class="box">
    <p class="lbl">Карусель или рилс: «Пять способов реально быстро похудеть»</p>
    <ul>
      <li>Сутки просидеть в бане без еды</li>
      <li>Пробежать сто километров</li>
      <li>Съесть всю пачку Оземпика за раз</li>
      <li>Откачать весь жир у врача</li>
      <li>Сходить на гипноз, где тебе внушат, что ты худая</li>
      <li>Шестым твоё: отрезать ногу</li>
    </ul>
  </div>
  <p>Дальше позиция: каждый быстрый способ вредит здоровью, чем быстрее, тем больше вреда.
  Потом смысл и пруф, твой кейс. Упаковка цепляет людей с нижних ступеней, смысл двигает
  их выше, пруф доводит до конца. Одна единица контента может провести человека по всем
  ступеням, к этому и стремимся.</p>
  <p class="note">Твой рилс «как похудеть на десять килограмм за неделю» тоже про это, но там
  через цифры и калории. Когда начинается математика, пролистывают. Здесь заходим с юмора,
  и девчонки начнут пересылать друг другу.</p>
</section>

<div class="call">
  <h2>Часть 4. Производство</h2>
  <p>Как перестать делать контент в панике</p>
</div>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Контент в панике: неделя готовит следующую</h3>
    <span class="ts">00:52:27</span>
  </div>
  <blockquote><p>Подошло время, мне надо сделать, а я не успела подумать, что мне надо сделать.
  И я делаю лишь бы что-то сделать.</p></blockquote>
  <p>Это похоже на панику: сесть и подумать некогда, ебашишь всё подряд, тратишь кучу ресурса,
  лишь бы сегодня что-то вышло. Лечится так: неделя один готовит контент для недели два.</p>
  <div class="box fix">
    <p class="lbl">Неделя по дням</p>
    <ul>
      <li><b>Понедельник, вторник.</b> Идеи. Два часа по таймеру, накидываешь потоком</li>
      <li><b>Среда, четверг.</b> Тексты для роликов и каруселей. Сколько успела за отведённое время, столько и берём в работу</li>
      <li><b>Пятница.</b> Съёмка</li>
      <li><b>Воскресенье или понедельник.</b> Монтаж и загрузка</li>
    </ul>
  </div>
  <p>Если по ходу непонятно, правильно или нет, не останавливайся: выписывай вопросы списком
  и после таймера присылай разом, быстро разберём. Первое время будешь не успевать, это будет
  напрягать, но это сильно лучше безостановочного фристайла. За две недели поставим на колёса.</p>
  <blockquote><p>Я вообще человек рутины. Утром кофе, книжка, гулять, работать, обед, сиеста,
  работать, спать.</p></blockquote>
  <p>Поэтому тебе будет проще многих: принцип тот же. Идеи это питание, тексты это тренировки,
  съёмка это ходьба. Просто встраиваешь в график, который уже есть. И хорошо, что ты пришла
  к этому сама, когда реальность показала, что без расписания хуже.</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Миша</h3>
    <span class="ts">01:02:49</span>
  </div>
  <p>Миша хотел, чтобы я зашёл полноценным партнёром и забрал на себя контент. Я отказался:
  мой проект в приоритете, и в такой схеме проиграли бы все. Нового я вам не скажу: механизм
  тот же, что у тебя, можно брать то, что делаешь ты, и делать у себя. Без лица продвигать
  продукт сейчас бессмысленно. Пока мы работаем с тобой, я на связи и отвечаю на вопросы.</p>
</section>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Задачи на неделю</h3>
    <span class="ts">00:56:53</span>
  </div>
  <ul class="chk">
    <li>Расписать следующую неделю в планере с блоками под контент: идеи, тексты, съёмка, монтаж. Скинуть мне скриншот, можно сегодня</li>
    <li>Идеи накидывать по таймеру, вопросы по ходу выписывать списком и присылать разом</li>
    <li>Написать статью-конвертер про «ноги кентавра» по структуре из воркшопа «Кэш-магниты». Голосовыми в нейронку, мне готовым текстом, можно блоками. Заголовок потом</li>
    <li>Выложить карусель «почему красивые и стройные всегда богатые», без призыва, как тест</li>
    <li>Сделать «Пять способов реально быстро похудеть» каруселью или рилсом</li>
    <li>Полистать свой контент глазами человека на диване и понять, на какую ступень он бьёт</li>
    <li>С этой недели брать на созвоне предоплату тысячу рублей за бронь места</li>
    <li>Дожать троих на оплате: «деловой» и той, что обещала на выходных, написать на выходных, третьей 25 сентября</li>
  </ul>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Переслать пост про то, как я собираю себе календарь</li>
      <li>Посмотреть твоё расписание и ответить</li>
      <li>Править статью по блокам, пока не станет заебись</li>
    </ul>
  </div>
</section>

<div class="foot">
  Личный созвон 18 сентября 2026, 65 минут. Следующий: пятница, 11:00 по Москве.
</div>

</div>
</body>
</html>
`;
