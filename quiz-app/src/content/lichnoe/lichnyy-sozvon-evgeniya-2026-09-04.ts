// Конспект личного созвона 2026-09-04. Сгенерирован из
// GSD-BRAND/clients/evgenia-sokolchik/lichnoe/2026-09-04/KONSPEKT.html — править там, не здесь.

export const LICHNOE_LICHNYY_SOZVON_EVGENIYA_2026_09_04 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Личный созвон 4 сентября 2026</title>
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
  <p class="kicker">Личный созвон · 4 сентября 2026</p>
  <h1>Ты реабилитолог, который сам себя собрал. Это и есть отстройка</h1>
  <p class="sub">За неделю первая продажа на новом чеке, а на созвоне вылезло то, о чём ты нигде
  не говоришь: диплом реабилитолога, своя травма и своя же спина, собранная обратно. Отсюда
  и пойдём: сегмент, контент и кейсы вокруг травм.</p>
  <div class="meta">
    <span>72 минуты</span>
    <span>36 000 за неделю</span>
    <span>Конверсия 50%: два созвона, одна продажа</span>
    <span>Следующий созвон: пятница, 11:00 МСК</span>
  </div>
</header>

<!--VIDEO_SLOT-->

<nav class="toc">
  <h3>О чём говорили</h3>
  <ol>
    <li><a href="#s1">Первая неделя: 36 000 и что за ними стоит</a></li>
    <li><a href="#s2">Почему база это деньги в долг</a></li>
    <li><a href="#s3">Смена подрядчика дорога для психики</a></li>
    <li><a href="#s4">Диалог, контент, диалог</a></li>
    <li><a href="#s5">Козырь, о котором ты молчишь</a></li>
    <li><a href="#s6">Ты результат своего продукта</a></li>
    <li><a href="#s7">Тяжёлые случаи как хирургия</a></li>
    <li><a href="#s8">Три созвона под запись</a></li>
    <li><a href="#s9">Контент недели: травмы и тренеры</a></li>
    <li><a href="#s10">Лайки как план Х</a></li>
    <li><a href="#s11">Сторис: перестань халтурить</a></li>
    <li><a href="#s12">Задачи на неделю</a></li>
  </ol>
</nav>

<div class="call">
  <h2>Часть 1. Что дала первая неделя</h2>
  <p>Деньги, которые лежали на столе и которых ты не видела</p>
</div>

<section id="s1">
  <div class="sec-head">
    <span class="sec-num">01</span>
    <h3 class="t">Первая неделя: 36 000 и что за ними стоит</h3>
    <span class="ts">00:00:00</span>
  </div>
  <p>За неделю ты заработала 36 000, оплата пятьдесят на пятьдесят. Формально это два созвона
  и одна продажа, то есть конверсия 50%. Радоваться этому нужно и обесценивать это не нужно:
  деньги были на столе всё это время, просто ты их не замечала.</p>
  <div class="facts">
    <div class="fact"><div class="n">36 000</div><div class="l">за три месяца работы, 12 000 за месяц вместо 7 500</div></div>
    <div class="fact"><div class="n">37</div><div class="l">человек из базы, которым ты написала</div></div>
    <div class="fact"><div class="n">2 → 1</div><div class="l">созвона и продажа, конверсия 50%</div></div>
  </div>
  <p class="note">Пиши это в раздел «Победы» в группе. Пусть у людей, которые сидят и ноют,
  жопа взрывается, так и должно быть.</p>
</section>

<section id="s2">
  <div class="sec-head">
    <span class="sec-num">02</span>
    <h3 class="t">Почему база это деньги в долг</h3>
    <span class="ts">00:01:22</span>
  </div>
  <p>Написала многим, а денег пришло меньше, чем ожидала. Это нормально и это не провал:
  ты напомнила людям, что с тобой можно работать. Многие даже не думали, что за тобой
  можно было уйти из проекта.</p>
  <p>Проблема у человека актуализируется четырьмя путями: сама по себе, через чужие слова
  (подруга скажет, что растолстела), через твои соцсети, на которые он подписан, и через
  твой контент, который ты можешь принести ему в личку сама.</p>
  <blockquote><p>Эхо этих действий будет тебе зарабатывать деньги ещё месяц, два, три,
  может, полгода. Люди созревают по-разному.</p></blockquote>
</section>

<section id="s3">
  <div class="sec-head">
    <span class="sec-num">03</span>
    <h3 class="t">Смена подрядчика дорога для психики</h3>
    <span class="ts">00:03:00</span>
  </div>
  <p>Фитнес стоит на стыке услуги и коучинга. Человек, который однажды к тебе пришёл,
  вряд ли уйдёт совсем: сменить подрядчика психика воспринимает как дорогую операцию.
  Он может пропасть, попробовать сам, а потом вернуться под новую задачу.</p>
  <p>Отсюда вывод про твои деньги: они в длину. Поэтому и развиваться как тренеру
  интересно не в сторону сцены, а в сторону того, что нужно широкому сегменту.</p>
</section>

<section id="s4">
  <div class="sec-head">
    <span class="sec-num">04</span>
    <h3 class="t">Диалог, контент, диалог</h3>
    <span class="ts">00:07:24</span>
  </div>
  <p>Схема, по которой работаем с базой дальше. Сделала длинную контентную единицу под
  сегмент, вспомнила, кому из написанных она попадёт в ситуацию, и отправила лично:</p>
  <blockquote><p>Привет, Лена. Мы тут созвонились с Катей, она тоже мама в декрете и вечно
  откладывала себя. Посмотри, тебе будет полезно.</p></blockquote>
  <p>Никуда не тащим, не давим, ничего не продаём. Человек должен сам прийти к мысли, что пора.</p>
</section>

<div class="call">
  <h2>Часть 2. Главное, что вылезло на созвоне</h2>
  <p>Реабилитация: сегмент, отстройка и прожитый опыт</p>
</div>

<section id="s5">
  <div class="sec-head">
    <span class="sec-num">05</span>
    <h3 class="t">Козырь, о котором ты молчишь</h3>
    <span class="ts">00:16:44</span>
  </div>
  <p>Ты дипломированный реабилитолог, и я узнаю об этом через неделю работы. Нигде в блоге
  этого нет. Люди с травмами это уже сформировавшаяся острая боль: они аккуратны к телу,
  понимают ценность и готовы платить.</p>
  <p>Выбирая между тобой и обычным тренером, человек с травмой всегда выберет тебя. Наша
  задача дифференцироваться: в описании должно стоять не просто «фитнес-тренер», а
  <span class="q">тренер и реабилитолог, ко мне приходят, когда никто не смог помочь</span>.</p>
  <div class="box">
    <p class="lbl">В оффер добавить</p>
    <ul>
      <li>Диплом реабилитолога и квалификацию, а не только тренерский опыт</li>
      <li>Наставника, у которого ты консультируешься: у психологов это называется супервизия, и это отстройка</li>
      <li>Свою историю: травма поясницы, хроническая боль, кинезиофобия, собранная обратно спина</li>
    </ul>
  </div>
</section>

<section id="s6">
  <div class="sec-head">
    <span class="sec-num">06</span>
    <h3 class="t">Ты результат своего продукта</h3>
    <span class="ts">00:19:14</span>
  </div>
  <p>Тяжелоатлетка, травма поясницы, хроническая боль, мысль «я больше никогда не смогу
  тренироваться так». Пошла учиться на реабилитолога, за четыре месяца собрала спину
  и снова тягаешь большие веса. Сорок пять килограммов, машешь девятками, не все мужики машут.</p>
  <p>Ты рассказываешь мне это в конце, а начинаешь с того, что практики по реабилитации
  мало и берёшь ты не всех. Послушай разницу: про фитнес ты говоришь так, что тебе веришь
  сразу, а про своё главное скромничаешь.</p>
  <blockquote><p>Я махала гантелями через стороны двушками, два килограмма в моих руках было.
  И мне было плевать, что обо мне подумают, потому что я знала, куда это меня приведёт.</p></blockquote>
  <p>Это прожитый опыт, и в контенте он звучит в десять раз увереннее любого чужого сегмента.
  В мамах в декрете у тебя такого опыта нет, а здесь есть.</p>
</section>

<section id="s7">
  <div class="sec-head">
    <span class="sec-num">07</span>
    <h3 class="t">Тяжёлые случаи как хирургия</h3>
    <span class="ts">00:27:00</span>
  </div>
  <p>Страшно брать сложных, потому что ответственность. Ответственность снимается дистанцией:
  тяжёлому случаю нужен тщательный период диагностики, полный анамнез, и за него берутся
  промежуточные деньги. Чем тяжелее случай, тем дороже работа, как у хирургов.</p>
  <p>Здесь мы ловим тех, на кого все уже забили: люди с острой болью готовы платить и по 150,
  и по 200 тысяч. Спортсмены, которых списали, отдельная история: у них спорт это работа,
  и ты точно знаешь, что они делают вне тренировок.</p>
</section>

<div class="call">
  <h2>Часть 3. Что делаем на этой неделе</h2>
  <p>Три созвона, контент вокруг травм, лайки и сторис</p>
</div>

<section id="s8">
  <div class="sec-head">
    <span class="sec-num">08</span>
    <h3 class="t">Три созвона под запись</h3>
    <span class="ts">00:40:16</span>
  </div>
  <p>Проводим в первой половине недели, каждый под запись. Три разные ситуации:</p>
  <ul class="b">
    <li><b>Лиля, травмы.</b> Сбила машина, титановая пластина, голеностоп, поясница, бедро, колено.
    Год работы, вернулась в зал. Отзыв «ты меня спасла, когда я уже отчаялась» у тебя есть.</li>
    <li><b>Мама в декрете.</b> Договорённость уже есть.</li>
    <li><b>Аня, вечная суета.</b> Риелтор на ногах, два месяца без результата, потом призналась,
    что ела втихую. Разобрали, что её триггерит, убрали контроль по мелочам, и всё пошло.</li>
  </ul>
  <p>Андрея (колорист, шестнадцать часов на ногах, залечили травму) ждём: у него родился
  ребёнок, оформим текстом позже.</p>
  <p class="note">Записи прогоним через нейронку: расшифровка, статья, видео. Сама сидеть
  и писать не будешь, покажу как.</p>
</section>

<section id="s9">
  <div class="sec-head">
    <span class="sec-num">09</span>
    <h3 class="t">Контент недели: травмы и тренеры</h3>
    <span class="ts">00:46:38</span>
  </div>
  <p>До следующей пятницы жонглируем вокруг одной темы: травмы, реабилитация, некомпетентные
  коллеги, своя история.</p>
  <ul class="b">
    <li><b>«Эволюция тренеров в долбоёбов».</b> Твой же заголовок, который ты не выпустила.
    Полушёпотом, по стадиям, как обезьяна превращается в человека, только наоборот. И делаем
    это не для тренеров, а для людей: на какой стадии бежать.</li>
    <li><b>«В зале надо ебашить».</b> Рилс, который начинается прямо с этой фразы.</li>
    <li><b>Кортизол и кот.</b> Нарезка чужих «кортизоловых щёк», потом твой кот: у него кортизол
    или всё-таки дофаминовый живот?</li>
    <li><b>Позы для секса при травмах.</b> Уже записан, выкладывай.</li>
  </ul>
  <p>Личности коллег не трогаем, ты этого не хочешь, и это нормально. Атакуем подход
  и категорию, а не человека.</p>
</section>

<section id="s10">
  <div class="sec-head">
    <span class="sec-num">10</span>
    <h3 class="t">Лайки как план Х</h3>
    <span class="ts">00:54:30</span>
  </div>
  <p>На рилсе про эскортниц 45 лайков и 13 комментариев. Пройдись по всем, кто лайкнул:</p>
  <blockquote><p>Привет, видел лайк на этом рилсике. Ты эскортница или онлифанщица? Ладно,
  шучу. Это лайк поддержки или ты сейчас с телом работаешь?</p></blockquote>
  <p>Это инструмент на плохие дни, когда контент не летит и заявок нет. Я так закрывал сделку
  на 500 тысяч с одного лайка. Важно не то, что сработает сегодня, а то, что ты знаешь:
  тебе всегда есть куда пойти за деньгами.</p>
</section>

<section id="s11">
  <div class="sec-head">
    <span class="sec-num">11</span>
    <h3 class="t">Сторис: перестань халтурить</h3>
    <span class="ts">00:57:00</span>
  </div>
  <p>Ты закидываешь репосты чужих рилсов и ждёшь, когда кто-то среагирует. Заканчивай.
  У тебя навык стендапа, разворачивай его: сторис как выступление, но с прицелом на работу
  и с призывом в конце.</p>
  <blockquote><p>Посмотрите, какая мразь сделала мне фотку на паспорт со вторым подбородком.
  Так вот, если вам не нужны вторые подбородки...</p></blockquote>
  <div class="box fix">
    <p class="lbl">Механика охватов</p>
    <ul>
      <li>Проси ставить огоньки <b>ответами на сторис</b>, а не стикером: инстаграм считает это иначе, охваты растут кратно</li>
      <li>Ставь этот призыв в середине серии, а не в конце</li>
    </ul>
  </div>
</section>

<section id="s12">
  <div class="sec-head">
    <span class="sec-num">12</span>
    <h3 class="t">Задачи на неделю</h3>
    <span class="ts">01:01:10</span>
  </div>
  <ul class="chk">
    <li>Провести три созвона-кейса под запись в первой половине недели: Лиля с травмами, мама в декрете, Аня</li>
    <li>Поставить в описание профиля реабилитолога, а не только тренера</li>
    <li>Снять и выложить рилс «Эволюция тренеров в долбоёбов»</li>
    <li>Снять рилс, который начинается с «в зале надо ебашить»</li>
    <li>Снять рилс про кортизол с котом и нарезкой чужих роликов</li>
    <li>Выложить записанный рилс про позы для секса при травмах</li>
    <li>Написать всем, кто поставил лайк на рилсе про эскортниц</li>
    <li>Каждый день сторис в своей манере, с просьбой отвечать огоньками</li>
    <li>Начать смотреть курс «Новый уровень контента», можно с блока «Делаю, но...»</li>
    <li>Написать в группу в раздел «Победы»: 36 000 за первую неделю, конверсия 50%</li>
  </ul>
  <div class="box">
    <p class="lbl">За мной</p>
    <ul>
      <li>Разобрать твой продающий созвон и прислать правки</li>
      <li>Показать разбор чужого созвона: 28 тысяч подписчиков, пятнадцать созвонов, ноль продаж</li>
      <li>Скинуть, как прогнать записи созвонов через нейронку в статьи</li>
      <li>Добавить тебя в общую группу</li>
    </ul>
  </div>
  <p class="note">Воркшоп «Заявки каждый день» смотреть не надо: мы разобрали его на практике,
  пока ты шла по базе.</p>
</section>

<div class="foot">
  Личный созвон 4 сентября 2026, 72 минуты. Следующий: пятница, 11:00 по Москве.
</div>

</div>
</body>
</html>
`;
