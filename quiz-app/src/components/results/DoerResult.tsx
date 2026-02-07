'use client';

import React from 'react';
import {
  ResultHeader,
  ResultSection,
  CaseStudyCard,
  ComparisonBox,
  StatsGrid,
  ReasonBlock,
  StepsList,
  CTASection,
} from './shared';

interface ResultProps {
  onPaymentClick?: () => void;
  userId?: number | null;
  resultId?: string;
}

export default function DoerResult({ onPaymentClick, userId, resultId }: ResultProps) {
  return (
    <div className="result-page">
      <ResultHeader
        title="ДЕЛАТЕЛЬ БЕЗ СИСТЕМЫ"
        subtitle="После прохождения теста вы получили результат &quot;Делатель без системы&quot;."
        pdfUrl="/results/2-doer.pdf"
        pdfFilename="Диагностика-Делатель-без-системы.pdf"
      />

      {/* Intro */}
      <ResultSection title="Вот что происходит с вашим контентом прямо сейчас:">
        <div className="mb-lg">
          <h3 className="label mb-sm">Что вы делаете:</h3>
          <ul className="result-list">
            <li>Много контента — но без системы</li>
            <li>Пробуете разные форматы: рилсы, сторис, посты</li>
            <li>Копируете шаблоны, которые "работают у других"</li>
            <li>Ходите по обучениям в поисках "волшебной таблетки"</li>
            <li>Постоянно меняете стратегию — не даёте ни одной сработать</li>
            <li>"Вот это точно сработает" — самая частая мысль перед очередным провалом</li>
          </ul>
        </div>

        <div className="mb-lg">
          <h3 className="label mb-sm">Что получаете:</h3>
          <ul className="result-list">
            <li>Контент не приносит клиентов</li>
            <li>Много усилий — ноль результата</li>
            <li>Выгорание от бесконечных попыток</li>
            <li>Разочарование в соцсетях как канале продаж</li>
          </ul>
        </div>

        <div className="mb-lg">
          <h3 className="label mb-sm">Что чувствуете:</h3>
          <ul className="result-list result-list-quotes">
            <li>"Я делаю ВСЁ, но ничего не работает"</li>
            <li>"Может, это просто не моё?"</li>
            <li>"Наверное, нужно ещё одно обучение"</li>
            <li>"У других работает, а у меня нет"</li>
            <li>"Может, алгоритмы меня не любят?"</li>
          </ul>
        </div>

        <p className="text-highlight">
          Проблема не в вас. Проблема в <strong>отсутствии системы</strong>.
        </p>
        <p className="text-cyan text-center mt-md" style={{ fontSize: '1.2rem' }}>Это про вас?</p>
      </ResultSection>

      {/* What's really happening */}
      <ResultSection title="ЧТО НА САМОМ ДЕЛЕ ПРОИСХОДИТ?">
        <h3 className="text-cyan mb-md">У вас нет фокуса</h3>

        <div className="mb-lg">
          <h4 className="label mb-sm">Проблема простая:</h4>
          <p className="text-secondary mb-md">
            Вы делаете много. Но это "много" — хаотичное. Пробуете кусочки разных систем, не собирая их в целое.
          </p>
          <p className="text-secondary mb-sm">Типичная картина:</p>
          <ul className="result-list">
            <li>Понедельник — рилс по шаблону из одного курса</li>
            <li>Вторник — сторис по методике из другого</li>
            <li>Среда — пост по схеме из третьего</li>
            <li>Четверг — "надо что-то новое попробовать"</li>
            <li>Пятница — выгорание</li>
          </ul>
        </div>

        <div className="highlight-box highlight-box-danger mb-lg">
          <h4 className="label mb-sm">Итог:</h4>
          <p className="text-secondary mb-md">
            <strong>Шаблоны не работают без понимания механики.</strong>
          </p>
          <p className="text-secondary mb-md">
            Это как пытаться собрать машину из деталей от разных производителей. Каждая деталь может быть качественной, но вместе они не работают.
          </p>
          <p className="text-danger">
            Вы тратите время, деньги и энергию — но движетесь по кругу, а не вперёд.
          </p>
        </div>
      </ResultSection>

      {/* Why it happens */}
      <ResultSection title="Почему это происходит (без осуждения)">
        <ReasonBlock number={1} title="Охота за &quot;волшебной таблеткой&quot;" quote="Думаете: &quot;Вот ЭТО обучение/шаблон/метод точно сработает&quot;">
          <p className="text-secondary mb-md">
            Но волшебных таблеток не существует.<br/>
            <strong>Работает только система.</strong>
          </p>
          <div className="highlight-box">
            <h4 className="label mb-sm">Важно понимать:</h4>
            <p className="text-secondary">
              Каждый успешный эксперт использует ОДНУ систему. Не десять. Одну. Он её оттачивает, а не меняет каждую неделю.
            </p>
          </div>
        </ReasonBlock>

        <ReasonBlock number={2} title="Нетерпение" quote="&quot;Попробовал неделю — не работает — значит, метод плохой&quot;">
          <p className="text-secondary mb-md">
            <strong>Правда в том,</strong> что любой системе нужно время, чтобы дать результат. Минимум 2-4 недели на тест.
          </p>
          <p className="text-cyan mb-md">
            Но вы бросаете раньше, чем система успевает сработать.
          </p>
        </ReasonBlock>

        <ReasonBlock number={3} title="Копирование без понимания" quote="&quot;Возьму шаблон, который работает у Маши — и у меня сработает&quot;">
          <p className="text-secondary mb-md">
            Но шаблон — это форма. А работает — механика под ней.<br/>
            <strong className="text-cyan">Без понимания механики шаблон бесполезен.</strong>
          </p>
          <p className="text-secondary">
            Это как скопировать слова песни, но не знать мелодию. Слова те же — но песни нет.
          </p>
        </ReasonBlock>

        <ReasonBlock number={4} title="Слишком много информации" quote="&quot;Прошёл 10 курсов — теперь знаю всё, но ничего не работает&quot;">
          <p className="text-secondary mb-md">
            <strong>Правда:</strong> Избыток информации парализует. Вы знаете 50 способов сделать контент — и не делаете ничего толком.
          </p>
          <p className="text-highlight">
            Знания без системы применения = потраченные деньги и время.
          </p>
        </ReasonBlock>
      </ResultSection>

      {/* What happens if you don't change */}
      <ResultSection title="ЧТО БУДЕТ ДАЛЬШЕ (ЕСЛИ ПРОДОЛЖИТЬ ТАК ЖЕ)">
        <CaseStudyCard type="negative" title="История Димы: 500 000₽ на обучения, 0 результата">
          <p className="text-secondary mb-md">Дима — таргетолог. Пришёл ко мне в 2024 году.</p>

          <div className="mb-md">
            <h4 className="label mb-sm">Ситуация:</h4>
            <ul className="result-list">
              <li>Прошёл 12 курсов по контенту за 2 года</li>
              <li>Потратил 500 000₽ на обучения</li>
              <li>Делал контент по 3-4 часа в день</li>
              <li>Клиентов из соцсетей: 0</li>
            </ul>
          </div>

          <p className="text-secondary mb-sm">
            Я спросил: "Какую систему ты используешь?"
          </p>
          <p className="text-secondary mb-md">
            Дима начал перечислять: "Ну, вот из этого курса беру хуки, из этого — структуру, из этого — визуал..."
          </p>

          <div className="timeline">
            <div className="timeline-item">
              <span className="timeline-year">Проблема:</span>
              <span className="text-secondary">Франкенштейн из 12 разных методик. Ни одна не работала целиком.</span>
            </div>
            <div className="timeline-item">
              <span className="timeline-year">Результат:</span>
              <span className="text-secondary">Выгорание, разочарование, мысли "контент не для меня".</span>
            </div>
          </div>

          <div className="highlight-box highlight-box-danger mt-md">
            <h4 className="label mb-sm">Итог:</h4>
            <p className="text-danger">
              2 года усилий. 500 000₽. 0 клиентов. И полное выгорание.
            </p>
          </div>
        </CaseStudyCard>

        <CaseStudyCard type="positive" title="Контрпример: Катя, нутрициолог">
          <p className="text-secondary mb-md">
            Катя тоже прошла 8 обучений до того, как пришла ко мне. Та же ситуация — много знаний, ноль результата.
          </p>
          <p className="text-secondary mb-md">
            Но Катя сделала одну вещь по-другому: она выбрала ОДНУ систему и дала ей шанс.
          </p>
          <p className="text-secondary mb-md">
            Первые 2 недели — ничего. Третья неделя — 2 заявки. Четвёртая — 5 заявок. Второй месяц — 12 заявок.
          </p>

          <StatsGrid
            stats={[
              { number: '0 → 12', label: 'заявок в месяц' },
              { number: '8 недель', label: 'до результата' },
              { number: '1', label: 'система вместо 8' },
              { number: '180 000₽', label: 'доход с контента' },
            ]}
          />
        </CaseStudyCard>

        <ComparisonBox
          items={[
            {
              type: 'negative',
              name: 'Дима:',
              result: '12 систем одновременно, 500 000₽ потрачено, 0 результата',
            },
            {
              type: 'positive',
              name: 'Катя:',
              result: '1 система, 8 недель терпения, 180 000₽/месяц с контента',
            },
          ]}
        />

        <p className="text-highlight text-center mt-lg">
          Разница не в количестве знаний. Разница в фокусе на ОДНОЙ системе.
        </p>
      </ResultSection>

      {/* Solution exists */}
      <ResultSection title="РЕШЕНИЕ СУЩЕСТВУЕТ">
        <p className="text-secondary mb-md">
          Я работаю с "делателями без системы" с 2023 года.
        </p>
        <p className="text-cyan mb-lg">
          Помог <strong>300+ экспертам</strong> перестать метаться и найти свою систему.
        </p>

        <CaseStudyCard type="positive" title="Реальный кейс: Артём, маркетолог">
          <div className="mb-md">
            <h4 className="label mb-sm">Ситуация:</h4>
            <ul className="result-list">
              <li>3 года хаотичного контента</li>
              <li>7 пройденных курсов</li>
              <li>Доход: 80 тыс/месяц (весь от сарафана)</li>
              <li>Выгорание и мысли бросить контент</li>
            </ul>
          </div>

          <p className="text-secondary mb-md">
            <strong>Что изменили:</strong> Выкинули всё лишнее. Взяли одну систему. Дали ей 6 недель.
          </p>

          <div className="highlight-box highlight-box-success">
            <h4 className="label mb-sm">Результат через 2 месяца:</h4>
            <ul className="result-list">
              <li>Контент занимает 30 минут в день вместо 3 часов</li>
              <li className="text-success">Заявки: <strong>8-10 в месяц</strong></li>
              <li className="text-success">Доход: <strong>250 тыс/месяц</strong></li>
              <li className="text-success">Рост в <strong>3 раза</strong></li>
            </ul>
          </div>

          <p className="text-highlight mt-md">
            Артём не стал делать больше. Он стал делать <strong>правильно</strong>.
          </p>
        </CaseStudyCard>
      </ResultSection>

      {/* What needs to change */}
      <ResultSection title="ЧТО НУЖНО ИЗМЕНИТЬ">
        <p className="text-secondary mb-md">
          Вам не нужно ещё одно обучение. Вам нужна <strong>одна работающая система</strong>.
        </p>
        <p className="text-cyan mb-lg">
          И терпение дать ей сработать.
        </p>

        <p className="text-secondary mb-md">
          Это не про "делать больше". Это про <strong>делать правильно</strong>:
        </p>

        <StepsList
          steps={[
            {
              title: 'Выбрать ОДНУ систему',
              description: 'не 5, не 10 — одну. И дать ей минимум 4-6 недель на результат',
            },
            {
              title: 'Понять механику, а не копировать форму',
              description: 'почему это работает, а не просто "как это выглядит"',
            },
            {
              title: 'Перестать гнаться за новым',
              description: 'лучше глубоко освоить одно, чем поверхностно — десять',
            },
          ]}
        />

        <p className="text-secondary mt-lg mb-md">Звучит просто. Но на практике — сложно:</p>
        <ul className="result-list result-list-questions">
          <li>Как понять, какая система подходит именно мне?</li>
          <li>Как перестать прыгать между методиками?</li>
          <li>Как отличить "не работает" от "ещё не успело сработать"?</li>
          <li>Как не выгореть пока жду результат?</li>
        </ul>
        <p className="text-highlight mt-md">На это нужен взгляд со стороны.</p>
      </ResultSection>

      {/* Masterclass CTA */}
      <CTASection
        subtitle="Как перестать метаться между методиками и собрать работающую систему контента"
        features={[
          <><strong>Схема сборки Продающего Контента</strong> — одна система вместо десяти обрывков из разных курсов</>,
          <><strong>3 промпта для нейросетей</strong> — вставляете в нейронку, получаете готовый продающий контент за минуты</>,
          <><strong>Готовая воронка</strong>, которая принесла 8 000 подписчиков и 300+ продаж с 4 рилсов</>,
          <><strong>Методика создания лид-магнитов</strong>, за которыми люди приходят сами толпами</>,
          <><strong>«Фирменный рецепт»</strong> — секретный ингредиент, который выделит вас среди тысяч других экспертов</>,
        ]}
        bonuses={[
          <>5 структур-шаблонов продающих постов</>,
          <>Чек-лист сборки воронки (от оффера до лид-магнитов)</>,
          <>&quot;Копипаст&quot; файл с лучшими продающими постами</>,
        ]}
        resultTitle="Делатель без системы"
        userId={userId}
        resultId={resultId}
        onPaymentClick={onPaymentClick}
        psLines={[
          'Вы на этапе "Делатель без системы" — мастер-класс покажет вам одну работающую систему вместо десятка неработающих.',
          'Можете продолжить метаться как Дима. А можете за 8 недель получить результат как Катя. Решать вам.',
        ]}
      />
    </div>
  );
}
