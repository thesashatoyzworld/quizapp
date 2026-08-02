// Сгенерировано из GSD-BRAND/clients/sasha/razbory/*/RAZBOR.html.
// Правь исходник в GSD-BRAND и перегенерируй скриптом html2ts, руками не трогай.
// Маркер <!--VIDEO_SLOT--> заменяется на плеер в API-роуте /api/cabinet/razbory.

export const PRODAYUSHCHIY_SOZVON_2026_08_02 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Разбор продающего созвона 02.08.2026</title>
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
    <p class="kicker">Разбор продающего созвона · ученик Азамат</p>
    <h1>Что сработало и где посыпалось</h1>
    <p class="sub">Саша разбирает бесплатную диагностику, которую провёл Азамат, фитнес-тренер. Клиент: женщина 36 лет, 2,5 месяца после родов. Итог созвона: «надо подумать, обсудить с мужем». Ниже весь разбор по таймкодам записи.</p>
    <div class="meta">
      <span>02.08.2026</span><span>63 мин 15 сек</span><span>фитнес-сопровождение</span><span>чек 72 000 ₽ / 4 мес</span><span>прогноз 70 на 30</span>
    </div>
  </header>

  <!--VIDEO_SLOT-->

  <nav class="toc">
    <h3>Содержание</h3>
    <ol>
      <li><a href="#kto">Кто на созвоне</a></li>
      <li><a href="#glavnoe">Главный вывод</a></li>
      <li><a href="#horosho">Что сделано правильно</a></li>
      <li><a href="#e1">Авария на старте</a></li>
      <li><a href="#e2">Термины скрипта вслух</a></li>
      <li><a href="#e3">Нет прогрева до созвона</a></li>
      <li><a href="#e4">Не докопал до мотивации</a></li>
      <li><a href="#e5">Брошенный якорь</a></li>
      <li><a href="#e6">Выводы за клиента</a></li>
      <li><a href="#e7">Оффер из действий</a></li>
      <li><a href="#e8">Не выяснил время и быт</a></li>
      <li><a href="#e9">Не спросил про опыт с тренерами</a></li>
      <li><a href="#e10">Калории: не проверил отношение</a></li>
      <li><a href="#e11">Самодискредитация</a></li>
      <li><a href="#e12">«Дорого» отработано наполовину</a></li>
      <li><a href="#e13">«Надо подумать»</a></li>
      <li><a href="#e14">MAX вместо Zoom</a></li>
      <li><a href="#e15">Деликатные темы</a></li>
      <li><a href="#vozrazheniya">Два возражения-убийцы</a></li>
      <li><a href="#karkas">Каркас созвона</a></li>
      <li><a href="#citaty">Цитаты под контент</a></li>
    </ol>
  </nav>

  <div class="call"><h2>Расстановка</h2><p>кто, что продаёт, чем закончилось</p></div>

  <section id="kto">
    <div class="sec-head"><span class="sec-num">01</span><h3 class="t">Кто на созвоне</h3></div>
    <p><b>Продавец:</b> Азамат, фитнес-тренер, продаёт персональное сопровождение.</p>
    <p><b>Клиент:</b> женщина 36 лет, первый ребёнок, 2,5 месяца после родов, кормит грудью. Рост 178, вес 72-74 кг. Бывший муж был фитнес-тренером, калории считала под его руководством. С тренером как с наставником никогда не работала и цен на рынке не знает.</p>
    <p><b>Её запрос своими словами:</b> качество тела, ягодицы <span class="q">стоячие, выпуклые</span>, целлюлит, бока, внутренняя часть бёдер, минус 2 кг до 70. Срок: к Новому году, в щадящем режиме. Мотив: нравиться себе в отражении, на пляже в купальнике дискомфортно.</p>
    <blockquote><p>Про здоровье и самочувствие она не сказала ни слова за весь созвон. Только внешний вид. Саша фиксирует это трижды.</p></blockquote>
    <div class="facts">
      <div class="fact"><div class="n">72 000 ₽</div><div class="l">за 4 месяца, то есть 18 000 в месяц</div></div>
      <div class="fact"><div class="n">20 000 ₽</div><div class="l">если платить помесячно</div></div>
      <div class="fact"><div class="n">10 000 ₽</div><div class="l">на что рассчитывала она</div></div>
      <div class="fact"><div class="n">70 / 30</div><div class="l">прогноз Саши, что сделка состоится</div></div>
    </div>
    <p><b>Чем закончилось:</b> после цены она сказала, что дорого и надо обсудить с мужем. Азамат дал даун-селл: 10 000 ₽ за формат «2 недели работаем вместе, 2 недели сама». Ответ обещала завтра.</p>
  </section>

  <section id="glavnoe">
    <div class="sec-head"><span class="sec-num">02</span><h3 class="t">Главный вывод разбора</h3><span class="ts">36:53 · 39:43</span></div>
    <blockquote>
      <p>«Наша задача не помочь человеку, а продать.»</p>
      <p>«Не пытаться быть умным экспертом, а быть человеком, который задаёт правильный вопрос. Это делает огромную разницу.»</p>
    </blockquote>
    <p>Азамат весь созвон <b>делает выводы за клиента</b> вместо того, чтобы вопросами привести её к этим выводам самой. Из-за этого она слушает оффер с внутренним убеждением «я и сама могу». На 40:55 она это прямым текстом и говорит.</p>
    <div class="box fix">
      <p class="lbl">Вопрос-мост, которого не хватило · 41:09</p>
      <p style="margin:0">«Согласись, я тебе ничего нового не рассказал, ты это всё и так знала. Но за 2,5 месяца не начала, при этом записалась на консультацию. Зачем тебе я?»</p>
    </div>
    <p>Здесь человек сам приходит к тому, что без внешней поддержки результата не будет. Это и есть мост к продаже. Дело не в том, что у неё нет информации. Дело в том, что самостоятельно она эту проблему не решает.</p>
  </section>

  <div class="call"><h2>Что сработало</h2><p>14 моментов, которые надо повторять</p></div>

  <section id="horosho">
    <div class="sec-head"><span class="sec-num">03</span><h3 class="t">Сделано правильно</h3><span class="verdict good">оставить как есть</span></div>
    <div class="scroll">
    <table>
      <thead><tr><th>Тайм</th><th>Что сделал</th><th>Почему работает</th></tr></thead>
      <tbody>
        <tr><td class="tc">01:07</td><td>Предупредил, что записывает</td><td>Настраивает на честность</td></tr>
        <tr><td class="tc">02:13</td><td>Открыл вопросом «почему решила записаться»</td><td>Человек сам называет проблему. Это якоря, из которых растут вилки диалога и оффер</td></tr>
        <tr><td class="tc">10:54</td><td>Уточнил, когда всё уже понятно: «задача не похудеть, а перегнать жир в мышцы?»</td><td>Клиент вслух ещё раз проговаривает то, что для него важно</td></tr>
        <tr><td class="tc">13:43</td><td>Усилил боль: «какая разница, как в одежде, если мы себя видим каждый день без одежды»</td><td>Повторное подтверждение проблемы</td></tr>
        <tr><td class="tc">22:55</td><td>«Что уже пробовала самостоятельно»</td><td>Понять, где обожглась, во что не верит, что считает рабочим</td></tr>
        <tr><td class="tc">24:36</td><td>«Что мешает следить за питанием»</td><td>Выводит на то, почему сама не решает проблему</td></tr>
        <tr><td class="tc">26:27</td><td>Зафиксировал «2,5 месяца не могу взять себя в руки»</td><td>Якорь под будущие возражения</td></tr>
        <tr><td class="tc">29:52</td><td>Резюме точки А и Б, клиент подтверждает</td><td>Синхронизация и согласие до оффера</td></tr>
        <tr><td class="tc">40:45</td><td>«Это реальные достижения в твоём случае или есть сомнения?»</td><td>Проверка веры в результат до цены</td></tr>
        <tr><td class="tc">51:01</td><td>Поэтапное внедрение питания, «привычки закрепляются надолго»</td><td>Единственное место, где продаётся результат, а не действие</td></tr>
        <tr><td class="tc">56:16</td><td>Вилка цены: 4 месяца выгоднее, помесячно дороже</td><td>Нормальная структура</td></tr>
        <tr><td class="tc">57:31</td><td>Даун-селл 10 000 при возражении по цене</td><td>Не потерял клиента совсем</td></tr>
        <tr><td class="tc">60:44</td><td>Зафиксировал дату ответа</td><td>Не отпустил бессрочно</td></tr>
        <tr><td class="tc">61:10</td><td>Под конец зацепился за внешний вид и мужа</td><td>Поздно, но направление верное</td></tr>
      </tbody>
    </table>
    </div>
  </section>

  <div class="call"><h2>Где посыпалось</h2><p>15 ошибок по ходу созвона</p></div>

  <section class="err" id="e1">
    <div class="sec-head"><span class="sec-num">Ошибка 1</span><h3 class="t">Авария на старте: оправдание вместо рамки</h3><span class="ts">04:08</span></div>
    <p>Азамат начал созвон со снижения ожиданий: до созвона обещал одно, а на созвоне говорит, что бесплатно это только разбор.</p>
    <blockquote><p>«Завысив ожидание человека до созвона, вы потом в начале созвона начинаете снижать его ожидание. Это не очень хорошо.»</p></blockquote>
    <div class="box fix">
      <p class="lbl">Как надо</p>
      <p style="margin:0">«Смотри, как будет проходить созвон. Мы разберём твою ситуацию и то, что ты хочешь. Поймём, в чём проблема, и я предложу тебе определённые решения. Если пойму, что могу помочь, предложу поработать вместе. А ты уже сама примешь решение. В любом случае уйдёшь с готовым планом действий.»</p>
    </div>
    <ul class="b">
      <li>Предупредили о предложении, значит в конце не будет сюрприза и стресс идёт вниз</li>
      <li>Обозначили ценность самого созвона</li>
      <li>Задали вектор разговора</li>
    </ul>
  </section>

  <section class="err" id="e2">
    <div class="sec-head"><span class="sec-num">Ошибка 2</span><h3 class="t">Термины скрипта вслух: «точка А», «точка Б»</h3><span class="ts">07:47 · 16:17</span></div>
    <blockquote><p>«Разговор становится очень структурированным. Человек начинает чувствовать, что его ведут по скрипту. Никому это не нравится. Люди так не разговаривают. А человеку хочется, чтобы вы в его ситуацию проникали.»</p></blockquote>
    <p><b>Как надо:</b> «Как у тебя сейчас с телом, со здоровьем? Расскажи подробнее.» «Что ты хочешь? Что уже пробовала?» Вести диалог от ответов человека, а не по списку пунктов.</p>
  </section>

  <section class="err" id="e3">
    <div class="sec-head"><span class="sec-num">Ошибка 3</span><h3 class="t">Нет прогрева до созвона</h3><span class="ts">11:49</span></div>
    <p>Не выяснил, давно ли она подписана, что читала и смотрела. Ничего не отправил заранее. Кейс начал рассказывать прямо на созвоне.</p>
    <blockquote><p>«Экспертность мы должны продавать до созвона. Человек уже должен приходить, не сомневаясь в нашей экспертности. Тогда у нас появляется пространство задавать больше вопросов, а не пытаться поднять свой авторитет.»</p></blockquote>
    <div class="box fix">
      <p class="lbl">Как надо</p>
      <p style="margin:0">После договорённости о созвоне написать: «слушай, мне кажется, вот эти материалы тебе полезно почитать до созвона, чтобы ты была в контексте». Кейсы, статьи, посты в ТГ, карусели.</p>
    </div>
  </section>

  <section class="err" id="e4">
    <div class="sec-head"><span class="sec-num">Ошибка 4</span><h3 class="t">Не докопал до настоящей мотивации</h3><span class="ts">20:31</span></div>
    <p>Она много раз говорит про накачанную попу. Азамат берёт это как есть.</p>
    <blockquote><p>«Накачанная попа, зачем она нужна-то? Какую потребность она закрывает этой фразой? Скорее всего, потребность в любви к себе. Здесь важно наводящие вопросы задавать, идти в глубину. А зачем на самом деле ты этого хочешь?»</p></blockquote>
    <p>Без глубины мотивации на этапе оффера не за что цепляться. «Красивая попа» как якорь слишком мелкий.</p>
  </section>

  <section class="err" id="e5">
    <div class="sec-head"><span class="sec-num">Ошибка 5</span><h3 class="t">Бросил самый сильный якорь</h3><span class="ts">26:53</span></div>
    <p>Она сказала: 2,5 месяца не может себя взять в руки. Вместо того чтобы копать, Азамат ушёл в «а чем именно переедаешь».</p>
    <div class="box">
      <p class="lbl">Что надо было спросить</p>
      <p style="margin:0">«Получается, единственное, что тебе нужно, это просто начать. Но 2,5 месяца уже идёт, и ты ещё не начала. Почему?»</p>
    </div>
    <p class="note">Диалог из-за этого стал рваным: сначала про сложности, потом про питание, потом снова назад к сложностям.</p>
  </section>

  <section class="err" id="e6">
    <div class="sec-head"><span class="sec-num">Ошибка 6</span><h3 class="t">Системная: выводы за клиента</h3><span class="ts">36:35 · 39:25</span><span class="verdict bad">корень проблемы</span></div>
    <p>Про силу воли и про нужный «пинок» вывод озвучил Азамат, а она просто согласилась.</p>
    <blockquote><p>«Это не изнутри неё пришло. Она вот это всё слушает с убеждением, что она сама всё может. И это авария.»</p></blockquote>
    <p>Она должна думать: «сама я, скорее всего, сольюсь, снова отложу, снова что-то пойдёт не так». А думает: «я и сама могу, если возьмусь».</p>
    <blockquote><p>«Чаще всего мы делаем выводы за человека, чтобы показать свою экспертность. Но это не ключевое с точки зрения продажи.»</p></blockquote>
  </section>

  <section class="err" id="e7">
    <div class="sec-head"><span class="sec-num">Ошибка 7</span><h3 class="t">Оффер собран из действий, а не из результатов</h3><span class="ts">44:02 · 49:56</span></div>
    <p>Азамат перечисляет: диагностическая неделя, план тренировок, приложение, видео техники, замеры, фото, БЖУ. Плюс говорит про травмы, костную структуру и связки, о которых она не спрашивала.</p>
    <blockquote><p>«Фокус внимания на куче действий, а не на результатах. Она не видит в этом ценности, будет воспринимать как что-то лишнее. Ценность оффера не поднимается.»</p></blockquote>
    <div class="box fix">
      <p class="lbl">Как надо звучать офферу · 51:01</p>
      <p style="margin:0">«Мы выстроим тебе питание так, чтобы ты могла есть сладкое, чтобы не нужно было подключать силу воли, чтобы ты не издевалась над собой. Считать ничего не нужно будет, я буду считать это всё за тебя.»</p>
    </div>
  </section>

  <section class="err" id="e8">
    <div class="sec-head"><span class="sec-num">Ошибка 8</span><h3 class="t">Не выяснил время и быт</h3><span class="ts">53:00</span></div>
    <p>Не спросил, сколько у неё времени при грудном ребёнке. Поэтому вопрос «тренировки по сколько, 40 минут или два часа?» всплыл уже на этапе оффера.</p>
    <blockquote><p>«На этапе оффера, когда она должна думать о выгодах, она думает о проблемах.»</p></blockquote>
    <p><b>Как надо:</b> узнать заранее и вшить в предложение. Собрать план так, чтобы ребёнок был задействован, подобрать время под расписание, две полноценных тренировки по 45 минут и две по 15 на случай, когда времени нет.</p>
  </section>

  <section class="err" id="e9">
    <div class="sec-head"><span class="sec-num">Ошибка 9</span><h3 class="t">Не спросил про опыт работы с тренерами</h3><span class="ts">55:26</span></div>
    <p>Работала ли раньше с тренером, что нравилось в процессе, что нет. Это были бы прямые якоря для оффера. Выяснилось только на этапе цены, что она вообще ни с кем никогда не занималась.</p>
  </section>

  <section class="err" id="e10">
    <div class="sec-head"><span class="sec-num">Ошибка 10</span><h3 class="t">Не проверил отношение к подсчёту калорий</h3><span class="ts">49:43</span></div>
    <blockquote><p>«Люди ненавидят считать калории, их это жёстко бесит. Даже несмотря на то, что она говорила, что она это делала. Она скорее всего делала это через силу воли, это не стало привычкой, она откатилась.»</p></blockquote>
    <p>Знай он это, продал бы сильную выгоду: тебе вообще не нужно считать, я считаю за тебя, ты просто фоткаешь еду.</p>
  </section>

  <section class="err" id="e11">
    <div class="sec-head"><span class="sec-num">Ошибка 11</span><h3 class="t">Самодискредитация</h3><span class="ts">38:00</span></div>
    <p>Сказал, что не может обещать минус 2 кг.</p>
    <blockquote><p>«Нельзя себя ни в коем случае дискредитировать. Если не можешь сказать, не говори об этом. Зачем?»</p></blockquote>
  </section>

  <section class="err" id="e12">
    <div class="sec-head"><span class="sec-num">Ошибка 12</span><h3 class="t">«Дорого» отработано наполовину</h3><span class="ts">56:33</span></div>
    <p>Спросил, на какую сумму она рассчитывала, и услышал 10 000. Это хорошо. Но не спросил, <b>почему</b> дорого, и сразу выдал даун-селл.</p>
    <p>Здесь же вскрылось, что она никогда ни с кем не занималась, не знает цен и не понимает, как устроен процесс. Это надо было выяснять в начале и заранее объяснять, из чего складывается работа.</p>
  </section>

  <section class="err" id="e13">
    <div class="sec-head"><span class="sec-num">Ошибка 13</span><h3 class="t">«Надо подумать, обсудить с мужем»</h3><span class="ts">59:24</span></div>
    <p>Азамат просто согласился. Варианты, которые даёт Саша:</p>
    <ol class="steps">
      <li>«Остались какие-то вопросы? А что тебя смущает? Может, я смогу прояснить ситуацию?»</li>
      <li>Рамка с дедлайном: «я набираю людей до такого-то числа. Давай выберем дату, когда я вернусь за окончательным решением.»</li>
      <li>По-хорошему брать предоплату. Здесь зацепиться было не за что.</li>
      <li>Резкий, но рабочий вопрос: «а мужу нравится твоя фигура сейчас?» Она может делать это и для мужа, и тогда сама ещё раз подтверждает себе ценность.</li>
    </ol>
  </section>

  <section class="err" id="e14">
    <div class="sec-head"><span class="sec-num">Ошибка 14</span><h3 class="t">Созвон в MAX</h3><span class="ts">55:40 · 58:14</span></div>
    <p>Три обрыва связи, один прямо на моменте объявления цены.</p>
    <blockquote><p>«Сразу предупреждаю человека, что мы будем созваниваться в Zoom, и отправляю ссылку. Либо как минимум Яндекс.Телемост. Макс супер нестабильный в этом плане.»</p></blockquote>
  </section>

  <section class="err" id="e15">
    <div class="sec-head"><span class="sec-num">Ошибка 15</span><h3 class="t">Деликатность в чувствительных темах</h3><span class="ts">18:29</span></div>
    <p>Тело, вес, внешность. Этой клиентке было легко говорить об этом с мужчиной, но это исключение.</p>
    <blockquote><p>«Когда мы под кожу человеку залазим, здесь важно быть аккуратными. Я думаю, 80 процентов женщин об этом достаточно тяжело будет разговаривать. Нужно аккуратнее, чуть больше уточняющих вопросов.»</p></blockquote>
    <p class="note">То же самое относится к помогающим практикам и психологам.</p>
  </section>

  <div class="call"><h2>Итог и каркас</h2><p>что может убить сделку и как строить следующий созвон</p></div>

  <section id="vozrazheniya">
    <div class="sec-head"><span class="sec-num">04</span><h3 class="t">Два возражения, которые могут сорвать сделку</h3><span class="ts">61:53</span></div>
    <ul class="b">
      <li><b>«Зачем мне ты, если я могу сама?»</b> Не закрыто. Она к этому выводу не пришла, потому что выводы за неё делал Азамат.</li>
      <li><b>«Мы с мужем решили, что справимся сами.»</b> Не выяснили, как они занимались вместе, не ругались ли, комфортно ли ей было. Плюс её бывший муж был фитнес-тренером, то есть у неё есть опыт «мне это уже делали бесплатно».</li>
    </ul>
    <p>Оба закрываются вопросами в первой половине созвона, а не аргументами в конце.</p>
  </section>

  <section id="karkas">
    <div class="sec-head"><span class="sec-num">05</span><h3 class="t">Каркас продающего созвона</h3><span class="verdict good">чеклист</span></div>
    <ul class="chk">
      <li><b>Рамка</b> без оправданий: как пройдёт созвон, что человек получит, что в конце будет предложение, решение за ним</li>
      <li><b>«Почему решила записаться»:</b> проблема её словами, ловим якоря</li>
      <li><b>Точка А бытовым языком</b> плюс углубление: зачем тебе это на самом деле, какую потребность закрывает</li>
      <li><b>Точка Б</b> и конкретный срок</li>
      <li><b>«Что уже пробовала»:</b> где обожглась, во что не верит</li>
      <li><b>«Что мешает, почему сама не можешь»:</b> добить вопросами до самостоятельного вывода, не отвечать за неё</li>
      <li><b>Быт и ограничения:</b> сколько времени, какие условия, опыт работы с экспертами, отношение к рутине вроде подсчёта калорий</li>
      <li><b>Резюме</b> точки А, точки Б и сложностей, получить подтверждение</li>
      <li><b>Мост:</b> «я не сказал ничего нового, ты всё знала. Почему тогда не начала? Зачем тебе я?»</li>
      <li><b>План решения</b> через её ценности, а не через свою экспертность</li>
      <li><b>Оффер результатами</b>, не действиями</li>
      <li><b>Цена</b> с вилкой</li>
      <li><b>Возражения:</b> «что смущает», «почему дорого», отработка через собранные в начале якоря</li>
      <li><b>Фиксация:</b> предоплата либо конкретная дата возврата за ответом</li>
    </ul>
  </section>

  <section id="citaty">
    <div class="sec-head"><span class="sec-num">06</span><h3 class="t">Цитаты под контент</h3></div>
    <blockquote><p>«Когда вы поймёте принцип того, как двигается продажа, это перестанет вызывать огромную боль. И сразу станет проще продавать что угодно. И станет понятнее, как это делать через чат без созвона, как через контент.»</p></blockquote>
    <blockquote><p>«Наша задача не помочь человеку, а продать.»</p></blockquote>
    <blockquote><p>«Не пытаться быть умным экспертом, а быть человеком, который задаёт правильный вопрос. Это делает огромную разницу.»</p></blockquote>
    <blockquote><p>«Человеку важно самому делать выводы. А нам не делать за человека выводы, а задавать вопрос.»</p></blockquote>
    <blockquote><p>«Дело не в том, что у неё информации нет. А в том, что самостоятельно она не может решить эту проблему.»</p></blockquote>
    <blockquote><p>«Денег она ещё не заплатила. Нам важно сделать всё для того, чтобы человек принял решение, помочь ему принять решение.»</p></blockquote>
  </section>

  <p class="foot">Собрано из полной расшифровки записи от 02.08.2026, 63 мин 15 сек. Таймкоды соответствуют файлу <code>transcript.txt</code> в этой же папке.</p>

</div>
</body>
</html>
`;
