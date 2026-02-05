'use client';

import React from 'react';

export default function InvisibleResult() {
  return (
    <div className="result-page">
      {/* Header */}
      <div className="result-header">
        <h1 className="title-xl text-magenta">ЭКСПЕРТ-НЕВИДИМКА</h1>
        <p className="subtitle">
          После прохождения теста вы получили результат "Эксперт-невидимка".
        </p>
      </div>

      {/* Intro */}
      <div className="card mb-lg">
        <h2 className="section-title">Вот что происходит с вашим контентом прямо сейчас:</h2>

        <div className="mb-lg">
          <h3 className="label mb-sm">Что вы делаете:</h3>
          <ul className="result-list">
            <li>Делаете мало контента или очень редко</li>
            <li>Контент не про ваш проект</li>
            <li>Испытываете синдром самозванца и достаточно скромно рассказываете о результатах своей деятельности</li>
            <li>Боитесь/стесняетесь показывать экспертность</li>
            <li>Не знаете что писать про свою работу</li>
            <li>"Да я ничего особенного не делаю" - самая частая фраза в вашей голове</li>
          </ul>
        </div>

        <div className="mb-lg">
          <h3 className="label mb-sm">Что получаете:</h3>
          <ul className="result-list">
            <li>Клиенты приходят только по рекомендациям</li>
            <li>Соцсети не работают как канал привлечения</li>
            <li>Заявки нестабильные: 0-3 в месяц</li>
            <li>О вас не знают, хотя вы крутой эксперт и знаете свое дело</li>
          </ul>
        </div>

        <div className="mb-lg">
          <h3 className="label mb-sm">Что чувствуете:</h3>
          <ul className="result-list result-list-quotes">
            <li>"У меня ничего такого не происходит, просто я делаю свою работу"</li>
            <li>"Не знаю что писать про себя"</li>
            <li>"Боюсь выглядеть хвастуном"</li>
            <li>"Стесняюсь показывать результаты"</li>
            <li>"Хочу в соцсети, но не получается"</li>
          </ul>
        </div>

        <p className="text-highlight">
          Люди очень часто в этой категории <strong>недооценивают себя</strong>.
        </p>
        <p className="text-cyan text-center mt-md" style={{ fontSize: '1.2rem' }}>Это про вас?</p>
      </div>

      {/* What's really happening */}
      <div className="card mb-lg">
        <h2 className="section-title">ЧТО НА САМОМ ДЕЛЕ ПРОИСХОДИТ?</h2>
        <h3 className="text-cyan mb-md">У вас нет видимости в соцсетях</h3>

        <div className="mb-lg">
          <h4 className="label mb-sm">Проблема простая:</h4>
          <p className="text-secondary mb-md">
            Вы крутой специалист с отличными результатами. Но никто об этом не знает.
          </p>
          <p className="text-secondary mb-sm">Потому что вы не показываете:</p>
          <ul className="result-list">
            <li>Свою экспертность</li>
            <li>Результаты своей работы</li>
            <li>Процесс и подход</li>
            <li>Кейсы клиентов</li>
          </ul>
        </div>

        <div className="highlight-box highlight-box-danger mb-lg">
          <h4 className="label mb-sm">Итог:</h4>
          <p className="text-secondary mb-md">
            <strong>Нет видимости = нет клиентов из соцсетей.</strong>
          </p>
          <p className="text-secondary mb-md">
            Все клиенты приходят только по сарафану. А это игра в рулетку.
          </p>
          <p className="text-secondary mb-md">
            Люди порекомендовали вас - деньги есть.<br/>
            Люди не рекомендуют вас - денег нет.
          </p>
          <p className="text-danger">
            По итогу доход не стабильный, а "американские" горки из стресса и переживаний стабильно запускаются раз в квартал.
          </p>
        </div>
      </div>

      {/* Why it happens */}
      <div className="card mb-lg">
        <h2 className="section-title">Почему это происходит (без осуждения)</h2>

        <div className="reason-block mb-lg">
          <h3 className="reason-title">1. Вы боитесь выглядеть хвастуном</h3>
          <p className="text-muted mb-md">Думаете: "Если покажу результаты – решат что хвастаюсь"</p>
          <p className="text-secondary mb-md">
            Но показывать результаты ≠ хвастовство.<br/>
            <strong>Это доказательство компетентности.</strong>
          </p>
          <div className="highlight-box">
            <h4 className="label mb-sm">Важно понимать:</h4>
            <p className="text-secondary">
              Люди ищут себе экспертов и услуги в соцсетях. Это создает огромное доверие, когда у человека есть какое-то присутствие и даже небольшая медийность внутри соцсетей.
            </p>
            <p className="text-secondary mt-sm">
              Негативные комментарии каких-либо людей абсолютно ничего не означают. Вы полностью заслуживаете того, чтобы о вас знали как можно больше людей.
            </p>
          </div>
        </div>

        <div className="reason-block mb-lg">
          <h3 className="reason-title">2. Не знаете что писать про работу</h3>
          <p className="text-muted mb-md">"Моя работа скучная", "Кому это интересно", "Все и так это знают"</p>
          <p className="text-secondary mb-md">
            <strong>Правда в том,</strong> что силу того, что мы все фанаты своего дела и мы все любим то, что мы делаем, мы привыкаем к этому.
          </p>
          <p className="text-cyan mb-md">
            Но мы уже живём жизнь, которую хотят жить сотни тысяч других людей.
          </p>
          <p className="text-secondary">
            Порой нам достаточно просто показывать то, что мы делаем. Достаточно просто "коллекционировать" контент.
          </p>
        </div>

        <div className="reason-block mb-lg">
          <h3 className="reason-title">3. Перфекционизм</h3>
          <p className="text-muted mb-md">"Сначала придумаю идеальную стратегию, потом начну"</p>
          <p className="text-secondary mb-md">
            Но идеальной стратегии не существует.<br/>
            <strong className="text-cyan">Начать = важнее чем идеально.</strong>
          </p>
          <p className="text-secondary">
            Многие люди безостановочно ходят по повышениям квалификации. Им кажется, что если они получат больше дипломов — вот тогда им можно будет продавать. Но чаще всего это лишь <strong>имитация бурной деятельности</strong>.
          </p>
        </div>

        <div className="reason-block">
          <h3 className="reason-title">4. Боитесь критики</h3>
          <p className="text-muted mb-md">"А вдруг кто-то раскритикует", "А если скажут что я некомпетентен"</p>
          <p className="text-secondary mb-md">
            <strong>Правда:</strong> Есть те, кто создает. Есть те, кто критикует. И есть те, кто наблюдает за всем этим.
          </p>
          <p className="text-highlight">
            Страшнее так и не быть услышанным, нежели чем получить парочку-тройку негативных комментариев от непонятно кого.
          </p>
        </div>
      </div>

      {/* What happens if you don't start */}
      <div className="card mb-lg">
        <h2 className="section-title">ЧТО БУДЕТ ДАЛЬШЕ (ЕСЛИ НЕ НАЧАТЬ)</h2>

        <div className="case-study case-study-negative mb-lg">
          <h3 className="case-title">История Алины: 5 лет повышений квалификации, 0 действий</h3>
          <p className="text-secondary mb-md">Алина пришла ко мне в 2023 году.</p>

          <div className="mb-md">
            <h4 className="label mb-sm">Ситуация:</h4>
            <ul className="result-list">
              <li>Коуч</li>
              <li>Отличные результаты у клиентов</li>
              <li>Собиралась заниматься личным брендом</li>
            </ul>
          </div>

          <p className="text-secondary mb-sm">
            Я дал ей рекомендации: "Начни показывать свою работу".
          </p>
          <p className="text-secondary mb-md">
            Алина сказала: "Вот сейчас пройду ещё одно повышение квалификации — и тогда возьмусь".
          </p>

          <div className="timeline">
            <div className="timeline-item">
              <span className="timeline-year">2024 год:</span>
              <span className="text-secondary">Алина снова пришла. Ничего не сделала. "Сейчас пройду курс и начну".</span>
            </div>
            <div className="timeline-item">
              <span className="timeline-year">2025 год:</span>
              <span className="text-secondary">Алина снова пришла. Ничего не сделала. "Получу ещё один сертификат и начну".</span>
            </div>
          </div>

          <div className="highlight-box highlight-box-danger mt-md">
            <h4 className="label mb-sm">Результат:</h4>
            <p className="text-danger">
              Прошло 5 лет. Ничего как не было сделано, так и не сделано. Куча дипломов. Ноль видимости. Ноль клиентов из соцсетей.
            </p>
          </div>
        </div>

        <div className="case-study case-study-positive mb-lg">
          <h3 className="case-title">Контрпример: Маша, коммерческий сценарист</h3>
          <p className="text-secondary mb-md">
            Маша проходила мое самое первое обучение по созданию креативных рилс в 2023 году. С того момента она не трогала свой блог.
          </p>
          <p className="text-secondary mb-md">
            Но при этом развивала чужие проекты, создавала ролики на миллионы просмотров и генерировала тысячи лидов для других экспертов.
          </p>
          <p className="text-secondary mb-md">
            В конце 2025 она поняла, что готова. Подготовив все материалы и сделав Продающий Контент — за месяц Маша получила вот такие результаты выложив всего 4 рилса:
          </p>

          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">10 000+</span>
              <span className="stat-label">подписчиков в Инсте</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">8 500+</span>
              <span className="stat-label">подписчиков в телеграм</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">350+</span>
              <span className="stat-label">продаж мастер-класса</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">продаж наставничества</span>
            </div>
          </div>
        </div>

        <div className="comparison-box">
          <h4 className="label mb-md text-center">Разница:</h4>
          <div className="comparison-grid">
            <div className="comparison-item comparison-item-negative">
              <span className="comparison-name">Алина:</span>
              <span className="comparison-result">5 лет повышений квалификации, 0 действий, 0 результата</span>
            </div>
            <div className="comparison-item comparison-item-positive">
              <span className="comparison-name">Маша:</span>
              <span className="comparison-result">4 рилса с Продающим Контентом — 600 000+ за неделю (за месяц пробила потолок самозанятости в 2 000 000)</span>
            </div>
          </div>
        </div>

        <p className="text-highlight text-center mt-lg">
          Разница не в количестве дипломов. Разница в видимости и в том, чтобы начать сразу с манимейкинговых действий.
        </p>
      </div>

      {/* Solution exists */}
      <div className="card mb-lg">
        <h2 className="section-title">РЕШЕНИЕ СУЩЕСТВУЕТ</h2>
        <p className="text-secondary mb-md">
          Я работаю с экспертами-невидимками с 2023 года.
        </p>
        <p className="text-cyan mb-lg">
          Помог <strong>300+ экспертам</strong> стать видимыми и получить крутые результаты.
        </p>

        <div className="case-study case-study-positive">
          <h3 className="case-title">Реальный кейс: Вася, фитнес-тренер</h3>

          <div className="mb-md">
            <h4 className="label mb-sm">Ситуация:</h4>
            <ul className="result-list">
              <li>300 подписчиков</li>
              <li>Доход: 100 тыс/месяц (только сарафан)</li>
              <li>Контент практически не делал</li>
            </ul>
          </div>

          <p className="text-secondary mb-md">
            <strong>Что изменили:</strong> Начали делать контент системно — показывать экспертность.
          </p>

          <div className="highlight-box highlight-box-success">
            <h4 className="label mb-sm">Результат через 3 месяца:</h4>
            <ul className="result-list">
              <li>500-600 подписчиков (рост небольшой)</li>
              <li className="text-success">Доход: <strong>500 тыс/месяц</strong></li>
              <li className="text-success">Рост в <strong>5 раз</strong></li>
            </ul>
          </div>

          <p className="text-highlight mt-md">
            Вася не набрал миллион подписчиков. Он просто стал <strong>видимым для правильной аудитории</strong>. И этого хватило, чтобы вырасти в 5 раз.
          </p>
        </div>
      </div>

      {/* What needs to change */}
      <div className="card mb-lg">
        <h2 className="section-title">ЧТО НУЖНО ИЗМЕНИТЬ</h2>
        <p className="text-secondary mb-md">
          Есть <strong>простая система</strong> стать видимым.
        </p>
        <p className="text-cyan mb-lg">
          Но всё начинается с внедрения простой привычки создавать контент.
        </p>

        <p className="text-secondary mb-md">
          Это не про "постить 5 раз в день". Это про <strong>15-20 минут в день системно</strong>:
        </p>

        <div className="steps-list">
          <div className="step-item">
            <span className="step-number">1</span>
            <div className="step-content">
              <h4 className="step-title">Показывать то, что происходит</h4>
              <p className="step-desc">процессы работы с клиентами, победы, поражения, какие проблемы вы решаете и почему</p>
            </div>
          </div>
          <div className="step-item">
            <span className="step-number">2</span>
            <div className="step-content">
              <h4 className="step-title">Показывать реальные результаты</h4>
              <p className="step-desc">кейсы, до/после, отзывы</p>
            </div>
          </div>
          <div className="step-item">
            <span className="step-number">3</span>
            <div className="step-content">
              <h4 className="step-title">Объяснять свой подход</h4>
              <p className="step-desc">как вы работаете, чем отличаетесь, в чем ваша уникальная методика и против чего вы выступаете</p>
            </div>
          </div>
        </div>

        <p className="text-secondary mt-lg mb-md">Звучит просто. Но на практике — куча нюансов:</p>
        <ul className="result-list result-list-questions">
          <li>Как начать если синдром самозванца?</li>
          <li>Как показывать результаты без хвастовства?</li>
          <li>Как преодолеть страх критики?</li>
          <li>Как делать это системно без выгорания?</li>
        </ul>
        <p className="text-highlight mt-md">На это нужен взгляд со стороны.</p>
      </div>

      {/* Masterclass CTA */}
      <div className="card card-cta">
        <div className="cta-badge">МАСТЕР-КЛАСС</div>
        <h2 className="cta-title">«ПРОДАЮЩИЙ КОНТЕНТ»</h2>
        <p className="cta-subtitle">
          Как трансформировать "эксперта-невидимку" в зарабатывающего эксперта через соц. сети
        </p>

        <div className="cta-details">
          <span>24 февраля</span>
          <span>17:00 мск</span>
          <span>2 часа</span>
        </div>

        <div className="cta-content">
          <h3 className="label mb-md">Что будет на мастер-классе:</h3>
          <ul className="cta-list">
            <li><strong>Схема сборки Продающего Контента</strong> — пошаговый алгоритм, который превращает "обучающие" посты в "продающие"</li>
            <li><strong>3 промпта для нейросетей</strong> — вставляете в нейронку, получаете готовый продающий контент за минуты</li>
            <li><strong>Готовая воронка</strong>, которая принесла 8 000 подписчиков и 300+ продаж с 4 рилсов</li>
            <li><strong>Методика создания лид-магнитов</strong>, за которыми люди приходят сами толпами</li>
            <li><strong>«Фирменный рецепт»</strong> — секретный ингредиент, который выделит вас среди тысяч других экспертов</li>
          </ul>

          <h3 className="label mb-md mt-lg">Что получите дополнительно:</h3>
          <ul className="cta-list cta-list-bonus">
            <li>5 структур-шаблонов продающих постов</li>
            <li>Чек-лист сборки воронки (от оффера до лид-магнитов)</li>
            <li>"Копипаст" файл с лучшими продающими постами</li>
          </ul>
        </div>

        <div className="cta-guarantee">
          <h4 className="label mb-sm">Гарантия:</h4>
          <p className="text-secondary">
            Если после мастер-класса поймёте, что система не подходит — верну деньги. Без вопросов. Весь риск на мне.
          </p>
        </div>

        <div className="cta-bonus">
          <h4 className="label mb-sm">Бонус сразу после оплаты:</h4>
          <p className="text-cyan"><strong>Шаблон «Богатая ЦА»</strong></p>
          <p className="text-secondary">
            2 промта скормленные нейронке и у вас за 20 минут на руках вся информация по вашей целевой аудитории и самым платежеспособным сегментам.
          </p>
        </div>

        <div className="cta-price">
          <span className="price-amount">3 450</span>
          <span className="price-currency">руб</span>
        </div>

        <p className="cta-note">
          Оплата в любой валюте, включая крипту.<br/>
          Живой эфир + запись навсегда.
        </p>

        <div className="cta-action">
          <p className="text-success mb-md">ПРИГЛАШЕНИЕ НА МАСТЕР-КЛАСС УЖЕ ЖДЕТ ТЕБЯ В БОТЕ</p>
        </div>

        <div className="cta-ps">
          <p className="text-muted">
            <strong>P.S.</strong> Вы на этапе "Эксперт-невидимка" — мастер-класс заточен именно под вас.
          </p>
          <p className="text-muted">
            <strong>P.P.S.</strong> Можете потратить 5 лет как Алина. А можете за 1 месяц как Маша. Решать вам.
          </p>
        </div>
      </div>
    </div>
  );
}
