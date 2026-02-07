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
import { Category } from '@/data/quiz';
import { RadarChart, LevelBadge, LevelPath, FinancialGauge, AudienceDonut } from '../charts';
import { getChartData } from '@/data/chart-data';

interface ResultProps {
  onPaymentClick?: () => void;
  userId?: number | null;
  resultId?: string;
  scores?: Record<Category, number> | null;
}

export default function InvisibleResult({ onPaymentClick, userId, resultId, scores }: ResultProps) {
  const ACCENT_COLOR = '#ff00aa'; // magenta
  const chartData = resultId ? getChartData(resultId as Category) : null;

  return (
    <div className="result-page">
      <ResultHeader
        title="ЭКСПЕРТ-НЕВИДИМКА"
        subtitle="После прохождения теста вы получили результат &quot;Эксперт-невидимка&quot;."
        pdfUrl="/results/1-invisible.pdf"
        pdfFilename="Диагностика-Эксперт-невидимка.pdf"
        accentColor={ACCENT_COLOR}
      />

      {/* Intro */}
      <ResultSection
        title="Вот что происходит с вашим контентом прямо сейчас:"
        slot={chartData ? (
          <div className="result-chart-slot">
            <LevelBadge levelData={chartData.levelData} accentColor={ACCENT_COLOR} />
            <RadarChart data={chartData.radar} accentColor={ACCENT_COLOR} />
            <LevelPath levelData={chartData.levelData} accentColor={ACCENT_COLOR} />
          </div>
        ) : undefined}
      >
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
      </ResultSection>

      {/* What's really happening */}
      <ResultSection
        title="ЧТО НА САМОМ ДЕЛЕ ПРОИСХОДИТ?"
        slot={chartData ? (
          <div className="result-chart-slot">
            <FinancialGauge data={chartData.financial} accentColor={ACCENT_COLOR} />
          </div>
        ) : undefined}
      >
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
      </ResultSection>

      {/* Why it happens */}
      <ResultSection
        title="Почему это происходит (без осуждения)"
        slot={chartData ? (
          <div className="result-chart-slot">
            <AudienceDonut data={chartData.audience} accentColor={ACCENT_COLOR} />
          </div>
        ) : undefined}
      >
        <ReasonBlock number={1} title="Вы боитесь выглядеть хвастуном" quote="Думаете: &quot;Если покажу результаты – решат что хвастаюсь&quot;">
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
        </ReasonBlock>

        <ReasonBlock number={2} title="Не знаете что писать про работу" quote="&quot;Моя работа скучная&quot;, &quot;Кому это интересно&quot;, &quot;Все и так это знают&quot;">
          <p className="text-secondary mb-md">
            <strong>Правда в том,</strong> что силу того, что мы все фанаты своего дела и мы все любим то, что мы делаем, мы привыкаем к этому.
          </p>
          <p className="text-cyan mb-md">
            Но мы уже живём жизнь, которую хотят жить сотни тысяч других людей.
          </p>
          <p className="text-secondary">
            Порой нам достаточно просто показывать то, что мы делаем. Достаточно просто "коллекционировать" контент.
          </p>
        </ReasonBlock>

        <ReasonBlock number={3} title="Перфекционизм" quote="&quot;Сначала придумаю идеальную стратегию, потом начну&quot;">
          <p className="text-secondary mb-md">
            Но идеальной стратегии не существует.<br/>
            <strong className="text-cyan">Начать = важнее чем идеально.</strong>
          </p>
          <p className="text-secondary">
            Многие люди безостановочно ходят по повышениям квалификации. Им кажется, что если они получат больше дипломов — вот тогда им можно будет продавать. Но чаще всего это лишь <strong>имитация бурной деятельности</strong>.
          </p>
        </ReasonBlock>

        <ReasonBlock number={4} title="Боитесь критики" quote="&quot;А вдруг кто-то раскритикует&quot;, &quot;А если скажут что я некомпетентен&quot;">
          <p className="text-secondary mb-md">
            <strong>Правда:</strong> Есть те, кто создает. Есть те, кто критикует. И есть те, кто наблюдает за всем этим.
          </p>
          <p className="text-highlight">
            Страшнее так и не быть услышанным, нежели чем получить парочку-тройку негативных комментариев от непонятно кого.
          </p>
        </ReasonBlock>
      </ResultSection>

      {/* What happens if you don't start */}
      <ResultSection title="ЧТО БУДЕТ ДАЛЬШЕ (ЕСЛИ НЕ НАЧАТЬ)">
        <CaseStudyCard type="negative" title="История Алины: 5 лет повышений квалификации, 0 действий">
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
        </CaseStudyCard>

        <CaseStudyCard type="positive" title="Контрпример: Маша, коммерческий сценарист">
          <p className="text-secondary mb-md">
            Маша проходила мое самое первое обучение по созданию креативных рилс в 2023 году. С того момента она не трогала свой блог.
          </p>
          <p className="text-secondary mb-md">
            Но при этом развивала чужие проекты, создавала ролики на миллионы просмотров и генерировала тысячи лидов для других экспертов.
          </p>
          <p className="text-secondary mb-md">
            В конце 2025 она поняла, что готова. Подготовив все материалы и сделав Продающий Контент — за месяц Маша получила вот такие результаты выложив всего 4 рилса:
          </p>

          <StatsGrid
            stats={[
              { number: '10 000+', label: 'подписчиков в Инсте' },
              { number: '8 500+', label: 'подписчиков в телеграм' },
              { number: '350+', label: 'продаж мастер-класса' },
              { number: '15+', label: 'продаж наставничества' },
            ]}
          />
        </CaseStudyCard>

        <ComparisonBox
          items={[
            {
              type: 'negative',
              name: 'Алина:',
              result: '5 лет повышений квалификации, 0 действий, 0 результата',
            },
            {
              type: 'positive',
              name: 'Маша:',
              result: '4 рилса с Продающим Контентом — 600 000+ за неделю (за месяц пробила потолок самозанятости в 2 000 000)',
            },
          ]}
        />

        <p className="text-highlight text-center mt-lg">
          Разница не в количестве дипломов. Разница в видимости и в том, чтобы начать сразу с манимейкинговых действий.
        </p>
      </ResultSection>

      {/* Solution exists */}
      <ResultSection title="РЕШЕНИЕ СУЩЕСТВУЕТ">
        <p className="text-secondary mb-md">
          Я работаю с экспертами-невидимками с 2023 года.
        </p>
        <p className="text-cyan mb-lg">
          Помог <strong>300+ экспертам</strong> стать видимыми и получить крутые результаты.
        </p>

        <CaseStudyCard type="positive" title="Реальный кейс: Вася, фитнес-тренер">
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
        </CaseStudyCard>
      </ResultSection>

      {/* What needs to change */}
      <ResultSection title="ЧТО НУЖНО ИЗМЕНИТЬ">
        <p className="text-secondary mb-md">
          Есть <strong>простая система</strong> стать видимым.
        </p>
        <p className="text-cyan mb-lg">
          Но всё начинается с внедрения простой привычки создавать контент.
        </p>

        <p className="text-secondary mb-md">
          Это не про "постить 5 раз в день". Это про <strong>15-20 минут в день системно</strong>:
        </p>

        <StepsList
          steps={[
            {
              title: 'Показывать то, что происходит',
              description: 'процессы работы с клиентами, победы, поражения, какие проблемы вы решаете и почему',
            },
            {
              title: 'Показывать реальные результаты',
              description: 'кейсы, до/после, отзывы',
            },
            {
              title: 'Объяснять свой подход',
              description: 'как вы работаете, чем отличаетесь, в чем ваша уникальная методика и против чего вы выступаете',
            },
          ]}
        />

        <p className="text-secondary mt-lg mb-md">Звучит просто. Но на практике — куча нюансов:</p>
        <ul className="result-list result-list-questions">
          <li>Как начать если синдром самозванца?</li>
          <li>Как показывать результаты без хвастовства?</li>
          <li>Как преодолеть страх критики?</li>
          <li>Как делать это системно без выгорания?</li>
        </ul>
        <p className="text-highlight mt-md">На это нужен взгляд со стороны.</p>
      </ResultSection>

      {/* Masterclass CTA */}
      <CTASection
        subtitle="Как трансформировать &quot;эксперта-невидимку&quot; в зарабатывающего эксперта через соц. сети"
        features={[
          <><strong>Схема сборки Продающего Контента</strong> — пошаговый алгоритм, который превращает "обучающие" посты в "продающие"</>,
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
        resultTitle="Эксперт-невидимка"
        userId={userId}
        resultId={resultId}
        onPaymentClick={onPaymentClick}
        psLines={[
          'Вы на этапе "Эксперт-невидимка" — мастер-класс заточен именно под вас.',
          'Можете потратить 5 лет как Алина. А можете за 1 месяц как Маша. Решать вам.',
        ]}
      />
    </div>
  );
}
