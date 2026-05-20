import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Александр Трифонов · 20.05.2026',
  description: 'Саммари созвона + предложение по работе на 3 месяца',
  robots: { index: false, follow: false },
};

const aboutYou: Array<{ time: string; title: string; body: string }> = [
  {
    time: '00:05',
    title: 'Фриланс по видео',
    body: 'Заработал ~650 000 ₽ за полгода с коммерческих заказов. Первый коммерческий заказ — ноябрь 2025. Среднего чека нет, разлёт большой: минимум 25 000 ₽ за базовый видос, максимум 300 000 ₽ — редизайн карточек на мебельном сайте.',
  },
  {
    time: '00:07',
    title: 'Откуда заказы',
    body: 'Сарафанное радио. Подписчиков в Instagram — около тысячи, аккаунт «мёртвый». Через знакомую продакт-менеджера выходишь на компанию с полумиллионом подписчиков. Они отдают тебе на аутсорс заказы для брендов с 1–2 млн подписчиков.',
  },
  {
    time: '00:54',
    title: 'Основная работа',
    body: '13 лет в одной компании по клиентскому сервису. Зарплата с учётом квартальной премии — около 340 000 ₽/мес.',
  },
  {
    time: '00:02',
    title: 'Что пробовал в контенте',
    body: 'Год назад выкладывал рилс каждый день — продержался 186 дней (фитнес-тематика, после того как пошёл в качалку). Набрал 200 подписчиков, из них 100 — друзья. Канал бросил, «превратилось в работу».',
  },
  {
    time: '00:04',
    title: 'Форматы',
    body: 'Пробовал «как все»: озвучку с накладкой, наряженные кадры на бэкстейдже, повторял шутки. Не загорается, чувствуется как фальшь.',
  },
  {
    time: '00:08',
    title: 'Что мешает',
    body: 'Перфекционизм + дисонанс «как я в неидеальной обстановке (балкон / переговорка) буду рассказывать как делать крутые видосы». Подкреплено страхом: «дашь нормальную картинку не можешь, а нам рассказываешь».',
  },
  {
    time: '00:25',
    title: 'Как это выглядит на практике',
    body: 'Две недели взял «отдохнуть и собрать кейсы» — собрал ноль кейсов, в один из дней взял новый платный заказ. Энергия и силы есть. В контент не идёт.',
  },
  {
    time: '00:21',
    title: 'Где загораешься',
    body: 'Был период «дни и ночи могу фигачить» — на старте, когда ишка только начала приносить деньги. До этого — столярка: учился по YouTube, инкрустация дуба, шпон под 45°, тумбочки обшивал кожей сзади, где никто не увидит.',
  },
  {
    time: '00:31',
    title: 'О чём хочется рассказывать',
    body: '1) Технически сложные кейсы с нейронками в монтаже (прогнал через одну нейронку, в монтажке reverse, удалил кусок, склеил обратно). 2) Клиентский сервис: 13 лет в найме научили согласовывать ТЗ на старте, не проёбывать сроки, оговаривать водные — «никто про это не рассказывает». 3) Продуктивность через декомпозицию: когда запускал бизнес на маркетплейсах, разбивал «выйти на маркетплейс» до «5 минут посидеть на алиэкспрессе сегодня». Идея — книга про это.',
  },
  {
    time: '00:46',
    title: 'Главная цель',
    body: 'Уйти с работы. Деньги нужны не ради денег, а ради свободы.',
  },
  {
    time: '00:49',
    title: 'Цифра',
    body: 'Текущий уровень жизни — ~340к/мес. Чтобы уйти без падения уровня — стабильные 300–400к/мес онлайн. И освободившиеся 8 часов в день можно вкладывать в блог.',
  },
  {
    time: '00:57',
    title: 'На что нужны деньги',
    body: 'Wakesurf 3 раза в неделю по часу (это ~200к/мес только сам Wakesurf), путешествия (Турция на 2 месяца), новые хобби — их у тебя постоянно много.',
  },
  {
    time: '01:07',
    title: 'Долгосрок',
    body: 'Хочешь продакшн: посадить пару ребят, давать им 70%, себе оставлять 30%. «30% лучше чем ноль, плюс ещё одна тема про что рассказывать».',
  },
  {
    time: '01:06',
    title: 'Идея про мопед',
    body: 'Заказал мопед. Появилась идея встроить покупки в контент: «зарабатываю на мопед через [заказ X]», «зарабатываю на часы через [заказ Y]». Геймификация по-человечески.',
  },
];

const plan: Array<{ time: string; month: string; body: string }> = [
  {
    time: '01:00',
    month: 'Месяц 1 — контент начинает выходить',
    body: 'Разобраться какая форма тебе подходит — текст, голосовые расшифровки, карусели, что угодно кроме того что ломает. Запустить процесс: сначала чтобы вообще выходил, потом чтобы не бесил, потом оптимизировать по времени. Контент = опилки от твоей работы. Не отдельная задача, а артефакты процесса: скриншоты как ты прогоняешь через нейронку, голосовые «вот сейчас согласовываю ТЗ с французским режиссёром», твои 20 кейсов в упаковке. Параллельно: пришлю свою статью про 4 уровня контент-навыка — прочитаешь, разберём.',
  },
  {
    time: '01:07',
    month: 'Месяц 2 — первая инфраструктура и первая продажа',
    body: 'Небольшой гайд или мини-воронка под твою связку (видео + нейронки + клиентский сервис). Не «гайд про нейронки», который у каждого утюга — что-то реально экономящее часы. Например: наговариваешь голосом что хочешь сделать в видео — получаешь чек-лист как это собрать через нейронки + монтажку, в каком порядке, какой промпт. Цена 5–10к ₽. Главная задача — чтобы ты сам пощупал, что бабки в онлайне могут приходить. Как ты сам мне рассказал про друга-предпринимателя — пока не увидел своими глазами, казалось невозможным.',
  },
  {
    time: '01:07',
    month: 'Месяц 3 — масштаб',
    body: 'Разворачиваем услуги в большем объёме. Поднимаем чек на твоих текущих коммерческих заказах через позиционирование — пример Севы, который продавал 10 роликов за 60к, после переупаковки в «продаю заявки и очереди в заведениях» сразу 100к, через неделю уже 120к. Та же работа, другая упаковка. Решаем — идёшь ли в продакшн-модель с командой или остаёшься соло.',
  },
];

export default function AleksandrPage() {
  return (
    <>
      <div className="grid-bg" />
      <div className="scanlines" />
      <div className="glow-sphere glow-sphere-1" />
      <div className="glow-sphere glow-sphere-2" />

      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <main className="quiz-container">
        <div className="quiz-content" style={{ maxWidth: '780px' }}>
          {/* HERO */}
          <div className="animate-1">
            <div className="cta-badge" style={{ marginBottom: 'var(--space-md)' }}>
              САММАРИ + ПРЕДЛОЖЕНИЕ
            </div>
            <h1 className="title-xl text-cyan" style={{ marginBottom: 'var(--space-sm)' }}>
              АЛЕКСАНДР
            </h1>
            <div className="title-line" style={{ marginBottom: 'var(--space-lg)' }} />
            <div className="cta-details" style={{ marginBottom: 'var(--space-xl)' }}>
              <span>20 мая 2026</span>
              <span>1 ч 24 мин</span>
              <span>созвон</span>
            </div>
          </div>

          <div className="card animate-2" style={{ marginBottom: 'var(--space-xl)' }}>
            <p className="text-secondary" style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>
              Это конспект того, что мы наговорили в Zoom — со ссылками на минуты записи. Снизу — что я предлагаю на ближайшие три месяца, цена и формат. Решение до пятницы 22.05.
            </p>
          </div>

          {/* SECTION 1: ABOUT YOU */}
          <div className="animate-3" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 className="title-lg text-magenta" style={{ marginBottom: 'var(--space-md)' }}>
              Что ты рассказал о себе
            </h2>
          </div>

          {aboutYou.map((item, idx) => (
            <div
              key={idx}
              className="card animate-3"
              style={{ marginBottom: 'var(--space-md)' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 'var(--space-md)',
                  marginBottom: 'var(--space-sm)',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Orbitron, monospace',
                    fontSize: '0.8rem',
                    color: 'var(--color-cyan, #00f0ff)',
                    letterSpacing: '0.1em',
                  }}
                >
                  {item.time}
                </span>
                <strong className="text-cyan" style={{ fontSize: '1rem' }}>
                  {item.title}
                </strong>
              </div>
              <p
                className="text-secondary"
                style={{ fontSize: '0.95rem', lineHeight: '1.65', margin: 0 }}
              >
                {item.body}
              </p>
            </div>
          ))}

          {/* IMPORTANT NOTE — ПОПРАВКА */}
          <div
            className="card animate-4"
            style={{
              marginBottom: 'var(--space-xl)',
              marginTop: 'var(--space-lg)',
              background: 'rgba(157, 78, 221, 0.1)',
              border: '1px solid rgba(157, 78, 221, 0.3)',
            }}
          >
            <p className="text-magenta mb-sm">
              <strong>01:00–01:01 · твоя поправка по плану</strong>
            </p>
            <p
              className="text-secondary"
              style={{ fontSize: '0.95rem', lineHeight: '1.65', margin: 0 }}
            >
              Сначала я предложил начать с самоценности и подъёма чека на услугах. Ты сказал, что с этим проблем меньше — последнему клиенту через ChatGPT быстро собрал презу и поднял средний чек с 15–20к до 35к, рост &gt;50%. Главная боль — контент. Я согласился, поменял очерёдность.
            </p>
          </div>

          {/* SECTION 2: PLAN */}
          <div className="animate-5" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 className="title-lg text-magenta" style={{ marginBottom: 'var(--space-md)' }}>
              Что я предложил — план на 3 месяца
            </h2>
          </div>

          {plan.map((item, idx) => (
            <div
              key={idx}
              className="card animate-5"
              style={{ marginBottom: 'var(--space-md)' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 'var(--space-md)',
                  marginBottom: 'var(--space-sm)',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Orbitron, monospace',
                    fontSize: '0.8rem',
                    color: 'var(--color-cyan, #00f0ff)',
                    letterSpacing: '0.1em',
                  }}
                >
                  {item.time}
                </span>
                <strong className="text-cyan" style={{ fontSize: '1.05rem' }}>
                  {item.month}
                </strong>
              </div>
              <p
                className="text-secondary"
                style={{ fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}
              >
                {item.body}
              </p>
            </div>
          ))}

          {/* FORMAT */}
          <div className="card animate-6" style={{ marginBottom: 'var(--space-xl)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-sm)',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: 'Orbitron, monospace',
                  fontSize: '0.8rem',
                  color: 'var(--color-cyan, #00f0ff)',
                  letterSpacing: '0.1em',
                }}
              >
                01:11
              </span>
              <strong className="text-cyan" style={{ fontSize: '1.05rem' }}>
                Формат работы
              </strong>
            </div>
            <p
              className="text-secondary"
              style={{ fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}
            >
              Раз в неделю созваниваемся, садимся, смотрим что сделано, что застряло, что переписать. Я с картой — руки на руле и педали у тебя. Это <strong>не</strong> «я беру всё на себя» (так я работаю с одним клиентом за 3 пакета, где сам делаю воронку, лид-магнит, продукты, контент). Тебе это не нужно — у тебя свои навыки. В неделю плюс ответы в чате по ходу.
            </p>
          </div>

          {/* PRICE */}
          <div
            className="card animate-7"
            style={{
              marginBottom: 'var(--space-xl)',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
            }}
          >
            <h3 className="label text-cyan mb-md" style={{ letterSpacing: '0.05em' }}>
              ЦЕНА И ФОРМАТ
            </h3>
            <p
              className="text-cyan"
              style={{
                fontSize: '2rem',
                fontFamily: 'Orbitron, monospace',
                fontWeight: 700,
                marginBottom: 'var(--space-md)',
              }}
            >
              300 000 ₽ <span style={{ fontSize: '1rem', opacity: 0.7 }}>за 3 месяца</span>
            </p>
            <p
              className="text-secondary"
              style={{ fontSize: '0.95rem', lineHeight: '1.7', marginBottom: 'var(--space-md)' }}
            >
              <strong>01:13.</strong> Если по сумме давит — разбиваем 50/50: 50% сейчас + 50% через 45 дней. Внутренний договор, не банковская рассрочка.
            </p>
            <p
              className="text-secondary"
              style={{ fontSize: '0.95rem', lineHeight: '1.7', marginBottom: 'var(--space-md)' }}
            >
              Можно первые две недели выделить на добор заказов через партнёрство (твой большой заказ за 300к, который ты передаёшь — мог быть «партнёр продаёт за 300к, ты получаешь 20% кэшбэка»), чтобы ко второму платежу сумма не давила.
            </p>
            <p
              className="text-secondary"
              style={{ fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}
            >
              <strong>01:12.</strong> Минимум, на который подписываюсь: через 3 месяца ты можешь стабильно зарабатывать 300–400к/мес онлайн. Уйдёшь с работы или нет — отдельный разговор, зависит от того как мы выход соберём. На сроки увольнения я не подписываюсь.
            </p>
          </div>

          {/* DEADLINE */}
          <div
            className="card animate-8"
            style={{
              marginBottom: 'var(--space-xl)',
              background: 'rgba(157, 78, 221, 0.1)',
              border: '1px solid rgba(157, 78, 221, 0.3)',
            }}
          >
            <h3 className="label text-magenta mb-sm" style={{ letterSpacing: '0.05em' }}>
              ОТВЕТ ДО ПЯТНИЦЫ 22.05
            </h3>
            <p
              className="text-secondary"
              style={{ fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}
            >
              <strong>01:23.</strong> Да или нет. Если нужно проговорить детали — пиши, добежим.
            </p>
          </div>

          <p
            className="text-secondary text-center"
            style={{ fontSize: '0.9rem', opacity: 0.6, marginTop: 'var(--space-xl)' }}
          >
            — Саня
          </p>
        </div>
      </main>
    </>
  );
}
