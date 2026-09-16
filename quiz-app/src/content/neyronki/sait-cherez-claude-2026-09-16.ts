// Сгенерировано из GSD-BRAND/clients/sasha/neyronki/2026-09-16-sait-cherez-claude/ARTICLE.html.
// Правь исходник в GSD-BRAND и перегенерируй скриптом neyronki-to-ts.mjs, руками не трогай.
// Маркер <!--VIDEO_SLOT--> заменяется на плеер в API-роуте /api/cabinet/neyronki.

export const SAIT_CHEREZ_CLAUDE_2026_09_16 = String.raw`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Лендинг: от оффера до своего домена</title>
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

  section.good-b{border-left:4px solid var(--good)}
  section.good-b .sec-num{color:var(--good)}
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
  .box.warn{border-color:var(--bad); background:var(--bad-bg)}
  .box.warn .lbl{color:var(--bad)}

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
    <p class="kicker">Нейронки · практика</p>
    <h1>Лендинг: от оффера до своего домена</h1>
    <p class="sub">Один заход: берём готовый текст оффера, получаем страницу в интернете и заявки, которые падают прямо в телеграм. Без программиста, без дизайнера, без терминала. Всё показано на живом примере, сайт для Дани, ведущего мероприятий.</p>
    <div class="meta">
      <span>запись 16.09.2026</span><span>60 мин</span><span>Claude плюс GitHub плюс Vercel</span><span>всё бесплатно</span><span>с телефона тоже работает</span>
    </div>
  </header>

  <!--VIDEO_SLOT-->

  <nav class="toc">
    <h3>Содержание</h3>
    <ol>
      <li><a href="#itog">Что получится на выходе</a></li>
      <li><a href="#nabor">Что понадобится</a></li>
      <li><a href="#dva">Два Клода: дизайнер и технарь</a></li>
      <li><a href="#lending">Шаг 1. Оффер превращаем в лендинг</a></li>
      <li><a href="#pravki">Шаг 2. Правки, но без запоя</a></li>
      <li><a href="#github">Шаг 3. GitHub</a></li>
      <li><a href="#vercel">Шаг 4. Vercel</a></li>
      <li><a href="#svyazka">Шаг 5. Связываем Claude с GitHub</a></li>
      <li><a href="#zalivka">Шаг 6. Заливаем свою страницу</a></li>
      <li><a href="#bot">Шаг 7. Бот и токен</a></li>
      <li><a href="#sekrety">Шаг 8. Секреты в окружение, не в чат</a></li>
      <li><a href="#proverka">Шаг 9. Проверка</a></li>
      <li><a href="#priemy">Приёмы, ради которых это и записывалось</a></li>
      <li><a href="#avarii">Где вы встанете</a></li>
      <li><a href="#dalshe">Что осталось на следующий раз</a></li>
    </ol>
  </nav>

  <div class="call"><h2>Расстановка</h2><p>зачем это всё и сколько стоит не делать</p></div>

  <section id="itog">
    <div class="sec-head"><span class="sec-num">01</span><h3 class="t">Что получится на выходе</h3><span class="ts">01:10</span></div>
    <p>Страница на своём домене, куда можно грузить что угодно: оффер, кейсы, отзывы, фотки, видеовизитку. Внизу форма. Человек заполняет форму, и заявка прилетает вам в телеграм отдельным сообщением, с именем, телефоном и ответами.</p>
    <p>У Саши это уже стоит и работает: сайт с кейсами и блогом, страница тарифов, запись в лист ожидания. Всё собрано в Claude, тексты свои, вёрстка машинная.</p>
    <blockquote><p>«Конечно, нужно всё лучше сделать, но оно даже когда вот так, оно уже всё равно работает.»</p></blockquote>
    <div class="facts">
      <div class="fact"><div class="n">60-100к</div><div class="l">столько просят подрядчики за такой же сайт</div></div>
      <div class="fact"><div class="n">0 ₽</div><div class="l">GitHub и Vercel бесплатные, карту привязывать не надо</div></div>
      <div class="fact"><div class="n">40 сек</div><div class="l">столько идёт обновление сайта после правки</div></div>
      <div class="fact"><div class="n">1 раз</div><div class="l">путь проходится один раз, дальше правки за минуты</div></div>
    </div>
  </section>

  <section id="nabor">
    <div class="sec-head"><span class="sec-num">02</span><h3 class="t">Что понадобится</h3><span class="ts">02:37</span></div>
    <div class="scroll">
    <table>
      <thead><tr><th>Что</th><th>Зачем</th></tr></thead>
      <tbody>
        <tr><td><b>Готовый оффер</b></td><td>Текст: кто клиент, какой результат, цена, целевое действие. Из него собирается вся структура страницы</td></tr>
        <tr><td><b>Claude</b></td><td>Два режима в одном приложении: чат рисует страницу, Claude Code работает с файлами и хостингом</td></tr>
        <tr><td><b>GitHub</b></td><td>Бесплатное облако для кода. То же самое, что гугл-диск, только для сайта</td></tr>
        <tr><td><b>Vercel</b></td><td>Робот, который смотрит в эту папку и выкладывает сайт в интернет сам</td></tr>
        <tr><td><b>Telegram-бот</b></td><td>Создаётся в BotFather за пару минут, в него падают заявки</td></tr>
        <tr><td><b>Свой домен</b></td><td>Покупается отдельно, Саша брал на reg.ru. Всё остальное работает и без него, на адресе от Vercel</td></tr>
      </tbody>
    </table>
    </div>
    <p class="note">Компьютер не обязателен. В приложении Claude на телефоне есть та же вкладка Code, а сессия поднимается в облаке. Там, где на компе локальная папка, на телефоне облачное окружение.</p>
  </section>

  <section id="dva">
    <div class="sec-head"><span class="sec-num">03</span><h3 class="t">Два Клода: дизайнер и технарь</h3><span class="ts">08:01</span></div>
    <p>Это единственное место, где стоит один раз разобраться, дальше всё станет понятно.</p>
    <ul class="b">
      <li><b>Обычный чат.</b> Думает и рисует. Не видит ваши файлы, не лезет в хостинг. Ему отдаём оффер, он выдаёт готовую страницу, которую можно посмотреть тут же в превью</li>
      <li><b>Claude Code.</b> Работает с файлами и с вашими аккаунтами. Ему отдаём готовый файл и просим выложить в интернет, подключить бота, поменять настройки</li>
    </ul>
    <blockquote><p>«Это как два сотрудника. Это ваш программист-технарь, а это ваш дизайнер.»</p></blockquote>
    <p>Работают параллельно. Пока технарь возится с аккаунтами, дизайнер докручивает страницу. Ждать одного, уставившись в экран, не надо.</p>
  </section>

  <div class="call"><h2>Маршрут</h2><p>девять шагов по порядку, как в записи</p></div>

  <section id="lending">
    <div class="sec-head"><span class="sec-num">04</span><h3 class="t">Шаг 1. Оффер превращаем в лендинг</h3><span class="ts">04:34</span></div>
    <p>Открываем новый чат, вставляем текст оффера целиком и пишем задачу. Вот та самая формулировка из записи, можно брать как есть и менять только нишу:</p>
    <div class="box">
      <p class="lbl">Промпт</p>
      <p>«Собери мне HTML-лендинг для этого оффера, который мы потом поставим на сайт и хостинг. Потом добавятся скриншоты отзывов, фотки, видеовизитка, какие-то визуальные артефакты. Это будет сайт ведущего мероприятий. Я хочу, чтобы сайт выглядел дорого, насколько это возможно. Можешь использовать разные приёмы, фишки, техники.»</p>
    </div>
    <p>Дальше он рисует, а вы идёте собирать материалы: фотки, отзывы, видео. Всё это добавляется потом, по одному сообщению, и страница не переделывается заново.</p>
    <p>Через несколько минут появляется первый вариант: первый экран, блок про подход, интерактив с выбором гостя, программа по актам, таблица сравнения, блок с фотками, отзывы, форма. Смотреть его можно прямо в чате, кнопкой превью.</p>
  </section>

  <section id="pravki">
    <div class="sec-head"><span class="sec-num">05</span><h3 class="t">Шаг 2. Правки, но без запоя</h3><span class="ts">13:50</span></div>
    <p>Правки даются обычным текстом или голосовым: цены в рублях, добавь смыслы из старого оффера, сделай анимацию помедленнее, вот это убери. Он переписывает нужный кусок, остальное не трогает.</p>
    <p>Есть отдельная вкладка «Дизайн», где правится каждый блок по отдельности. Туда лучше не заходить.</p>
    <blockquote><p>«Наша задача сделать оффер, поставить его на лендинг, дать минимальные правки, чтобы дальше переходить к другим задачам. Этим дизайном можно заниматься бесконечно.»</p></blockquote>
    <p>Отдельный приём из записи: попросить собрать <b>шоукейс анимаций</b> отдельным документом. Он выдаёт десяток вариантов, вы отмечаете те, что нравятся, копируете выбор и отдаёте обратно. Выбирать из готового быстрее, чем описывать словами.</p>
  </section>

  <section id="github">
    <div class="sec-head"><span class="sec-num">06</span><h3 class="t">Шаг 3. GitHub</h3><span class="ts">20:35</span></div>
    <p>Заходим на github.com, регистрируемся. Почта, пароль, имя пользователя латиницей, страна любая. Галочку про рассылку не ставим. На почту придёт код, вводим.</p>
    <p>Если английский не ваш, в браузере включается перевод страницы, и всё становится читаемым.</p>
    <p class="note">Ничего в интерфейсе понимать не нужно. Клод на каждом экране говорит, куда нажать, а вы пишете ему «готово», когда сделали.</p>
  </section>

  <section id="vercel">
    <div class="sec-head"><span class="sec-num">07</span><h3 class="t">Шаг 4. Vercel</h3><span class="ts">23:32</span></div>
    <ul class="b">
      <li>Регистрируемся на vercel.com <b>через GitHub</b>, не через гугл и не через почту. Их всё равно придётся связывать, а так свяжется само</li>
      <li>Тип аккаунта: персональный, тариф Hobby, он бесплатный</li>
      <li>На главной жмём Add New Project, в правой колонке находим карточку Next.js Boilerplate и Deploy</li>
      <li><b>Имя репозитория станет адресом сайта.</b> Пишем осмысленное латиницей, а не test-123</li>
    </ul>
    <p>Через минуту сайт живой и отдаёт стандартную стартовую страницу. Это правильно: связка собралась и задеплоилась, свою страницу зальём следующим шагом.</p>
    <div class="box warn">
      <p class="lbl">Если делаете с телефона</p>
      <p>Мобильное приложение GitHub лучше не ставить, оно перехватывает ссылки и ломает авторизацию. Авторизуйте Vercel в браузере.</p>
    </div>
  </section>

  <section id="svyazka">
    <div class="sec-head"><span class="sec-num">08</span><h3 class="t">Шаг 5. Связываем Claude с GitHub</h3><span class="ts">33:20</span></div>
    <p>Теперь технарь должен получить доступ к той самой облачной папке. Подключение живёт не в приложении на компе, а в браузерной версии Claude Code. Там снизу выбирается репозиторий, а если его нет в списке, в том же списке есть Install the Claude GitHub app.</p>
    <p>Ставим приложение на All repositories, подтверждаем, возвращаемся. В списке появляется ваш репозиторий, выбираем его.</p>
    <div class="box warn">
      <p class="lbl">Самая частая засада</p>
      <p>Если у вас два аккаунта GitHub, приложение Claude встанет в старый, и нового репозитория он просто не увидит. Лечится выходом из старого аккаунта и повторной установкой под нужным. В записи на это ушло минут десять.</p>
    </div>
  </section>

  <section id="zalivka">
    <div class="sec-head"><span class="sec-num">09</span><h3 class="t">Шаг 6. Заливаем свою страницу</h3><span class="ts">40:10</span></div>
    <ol class="steps">
      <li>В чате с дизайнером скачиваем готовый файл страницы и называем его по-человечески</li>
      <li>Перетаскиваем файл в Claude Code</li>
      <li>Пишем: «надо этот сайт загрузить на мой хостинг Vercel»</li>
      <li>Ждём. Он сам кладёт файл в репозиторий, Vercel видит изменение и публикует</li>
      <li>Просим прислать ссылку и открываем</li>
    </ol>
    <p>Дальше всё то же самое. Захотели видео, кинули ссылку. Захотели кейсы, сказали «сделай отдельную вкладку с кейсами». Нашли чужой сайт, который нравится, отправили ссылку и сказали, какую именно часть повторить.</p>
  </section>

  <section id="bot">
    <div class="sec-head"><span class="sec-num">10</span><h3 class="t">Шаг 7. Бот и токен</h3><span class="ts">31:28</span></div>
    <ol class="steps">
      <li>В телеграме находим BotFather и жмём Start</li>
      <li>Create new bot, придумываем имя, потом адрес, который обязан заканчиваться на bot</li>
      <li>Он выдаёт токен. Копируем</li>
      <li>Отдаём токен Claude Code и пишем, что это токен бота для заявок</li>
      <li>Он просит написать боту, заходим и отправляем ему любое сообщение, чтобы он узнал, в какой чат слать</li>
    </ol>
    <div class="box warn">
      <p class="lbl">Про токен</p>
      <p>Токен это персональный адрес бота. Кто его получил, тот управляет ботом. В записи он показан только потому, что бот тестовый. Свой не показывайте никому и никуда не выкладывайте.</p>
    </div>
  </section>

  <section id="sekrety">
    <div class="sec-head"><span class="sec-num">11</span><h3 class="t">Шаг 8. Секреты в окружение, не в чат</h3><span class="ts">52:12</span></div>
    <p>Это место, которое стоит понять, иначе потом всё придётся вбивать заново.</p>
    <ul class="b">
      <li><b>Код</b> лежит в GitHub, он никуда не девается</li>
      <li><b>Секреты для сайта</b> (токен бота, номер чата) живут в Vercel: Settings, Environment Variables</li>
      <li><b>Секреты для Клода</b> живут в настройках облачного окружения Claude Code, а не в переписке</li>
    </ul>
    <p>Почему не в чат. Когда вы долго сидите в одном чате, нейронка начинает тупить. А если завтра вы откроете новый чат, он про ваш проект не будет знать ничего. Настройки окружения знают все будущие сессии, включая ту, которую вы откроете с телефона.</p>
    <p>Отдельный приём: чтобы Клод сам менял настройки на Vercel и вы не бегали руками, в Vercel создаётся API-токен. Account, Settings, Tokens, Create Token, Full Account, срок можно не ставить. После этого один робот управляет другим.</p>
  </section>

  <section id="proverka">
    <div class="sec-head"><span class="sec-num">12</span><h3 class="t">Шаг 9. Проверка</h3><span class="ts">58:35</span></div>
    <p>Открываем сайт, заполняем форму как обычный человек, жмём кнопку и смотрим в телеграм. Должно прилететь сообщение с ответами. В записи первая проверка прошла со стороны Клода, вторая с самого сайта.</p>
    <p class="note">Проверять надо именно с сайта и именно как посетитель. Проверка изнутри инструмента показывает только, что бот жив, а не что форма связана с ботом.</p>
  </section>

  <div class="call"><h2>Главное</h2><p>то, что важнее порядка кнопок</p></div>

  <section class="good-b" id="priemy">
    <div class="sec-head"><span class="sec-num">13</span><h3 class="t">Приёмы, ради которых это и записывалось</h3><span class="verdict good">забирать себе</span></div>
    <p>Кнопки в интерфейсах поменяются через месяц. Это останется.</p>
    <div class="scroll">
    <table>
      <thead><tr><th>Тайм</th><th>Приём</th><th>Почему работает</th></tr></thead>
      <tbody>
        <tr><td class="tc">15:48</td><td>«Объясни мне как тупому и сразу дай инструкцию, что делать»</td><td>Снимает стену из терминов. Вместо описания технологии получаете список действий</td></tr>
        <tr><td class="tc">09:32</td><td>«Проведи меня с нуля, будто у меня ничего нет и мы заводим все аккаунты заново»</td><td>Он перестаёт додумывать за вас и ведёт по шагам, не пропуская регистрации</td></tr>
        <tr><td class="tc">24:25</td><td>Скриншот вместо вопроса</td><td>Не понимаете, куда нажать, просто снимаете экран и отправляете. Часто можно вообще ничего не писать</td></tr>
        <tr><td class="tc">45:33</td><td>Два чата как два сотрудника</td><td>Пока технарь ковыряет аккаунты, дизайнер докручивает страницу. Ожидание перестаёт быть простоем</td></tr>
        <tr><td class="tc">50:54</td><td>Ставить «я не могу» под сомнение</td><td>На отказ отвечаем «иди разбирайся, как это сделать». В записи так решились и деплой, и настройки Vercel</td></tr>
        <tr><td class="tc">48:28</td><td>Переносить контекст между чатами</td><td>Новая сессия ничего не помнит. Просим записать факты проекта в файл, и следующая сессия стартует уже в курсе</td></tr>
        <tr><td class="tc">13:50</td><td>Голосовые вместо печати</td><td>Правки диктуются быстрее, чем пишутся. Формат для него без разницы</td></tr>
      </tbody>
    </table>
    </div>
    <blockquote><p>«Все эти кнопочки, названия, сложные термины, английский язык больше не являются барьером.»</p></blockquote>
  </section>

  <section id="avarii">
    <div class="sec-head"><span class="sec-num">14</span><h3 class="t">Где вы встанете</h3><span class="verdict bad">проверено на себе</span></div>
    <p>Всё это случилось прямо в записи и ничего страшного собой не представляет.</p>
    <div class="scroll">
    <table>
      <thead><tr><th>Симптом</th><th>Что делать</th></tr></thead>
      <tbody>
        <tr><td>Не пускает в аккаунт, гоняет по кругу с кодом подтверждения</td><td>Закрыть лишние вкладки, залогиниться заново. Пара попыток решает</td></tr>
        <tr><td>Ответ висит очень долго, минут двадцать</td><td>Предыдущая задача не завершилась. Остановить и отправить запрос заново</td></tr>
        <tr><td>Просит импортировать проект руками, хотя всё уже подключено</td><td>Он сидит в облаке и не видит ваш Vercel. Скажите ему, что связка уже готова, и он перепроверит</td></tr>
        <tr><td>Начинает делать артефакт вместо реального деплоя</td><td>Отменить и сказать прямо: не артефакт, дай ссылку на Vercel</td></tr>
        <tr><td>Репозитория нет в списке при подключении</td><td>Приложение Claude встало в другой GitHub-аккаунт, переустановить под нужным</td></tr>
        <tr><td>Кнопка на сайте ведёт не туда</td><td>Скриншот и одна фраза, что кнопка должна делать. Правится за минуту</td></tr>
      </tbody>
    </table>
    </div>
  </section>

  <section id="dalshe">
    <div class="sec-head"><span class="sec-num">15</span><h3 class="t">Что осталось на следующий раз</h3><span class="ts">58:57</span></div>
    <p>В самом конце вылезла авария: кнопка «Получить анкету» уводила в WhatsApp, а заявка нужна в телеграме. Чинится теми же скриншотами, но тянет за собой отдельную тему.</p>
    <ul class="b">
      <li><b>Сбор анкет и база.</b> Чтобы заявки не только падали в чат, но и складывались в одно место. Это отдельным видео</li>
      <li><b>Свой домен.</b> Покупается на reg.ru или где привычнее, дальше данные отдаются Claude Code и он подключает</li>
      <li><b>Кейсы и артефакты.</b> Отдельная вкладка, куда грузятся отзывы, фото и видео с мероприятий</li>
    </ul>
    <blockquote><p>«Вы теперь способны делать что угодно, и это будет на вашем сайте.»</p></blockquote>
  </section>

  <p class="foot">Запись от 16.09.2026. Конспект собран по расшифровке, таймкоды ведут в места записи. Раздел «Нейронки» открыт на тарифах 2 и 3.</p>

</div>
</body>
</html>
`;
