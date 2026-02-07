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

export default function GenerousResult({ onPaymentClick, userId, resultId, scores }: ResultProps) {
  const ACCENT_COLOR = '#9d4edd'; // purple
  const chartData = scores ? getChartData(resultId as Category, scores) : null;

  return (
    <div className="result-page">
      <ResultHeader
        title="ЩЕДРЫЙ ЭКСПЕРТ"
        subtitle="После прохождения теста вы получили результат &quot;Щедрый эксперт&quot;."
        pdfUrl="/results/3-generous.pdf"
        pdfFilename="Диагностика-Щедрый-эксперт.pdf"
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
            <li>Даёте много полезного контента</li>
            <li>Учите аудиторию делать самостоятельно</li>
            <li>Делитесь пошаговыми инструкциями бесплатно</li>
            <li>Боитесь продавать — "не хочу быть инфоцыганом"</li>
            <li>Верите, что если давать много пользы — люди сами придут платить</li>
            <li>"Я просто хочу помогать людям" — самая частая фраза</li>
          </ul>
        </div>

        <div className="mb-lg">
          <h3 className="label mb-sm">Что получаете:</h3>
          <ul className="result-list">
            <li>Много лайков и сохранений</li>
            <li>Комментарии "спасибо, очень полезно!"</li>
            <li>Но в директ не пишут</li>
            <li>~85% аудитории — "студенты", которые хотят научиться сами</li>
            <li>~15% — потенциальные клиенты</li>
          </ul>
        </div>

        <div className="mb-lg">
          <h3 className="label mb-sm">Что чувствуете:</h3>
          <ul className="result-list result-list-quotes">
            <li>"Даю столько пользы, а не покупают"</li>
            <li>"Наверное, нужно ещё больше давать"</li>
            <li>"Не хочу быть навязчивым продавцом"</li>
            <li>"Почему они говорят 'дорого' или 'попробую сам'?"</li>
            <li>"Может, я недостаточно экспертен?"</li>
          </ul>
        </div>

        <p className="text-highlight">
          Вы нашли систему. Но <strong>не ту систему</strong>.
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
        <h3 className="text-cyan mb-md">Вы привлекаете не тех людей</h3>

        <div className="mb-lg">
          <h4 className="label mb-sm">Проблема простая:</h4>
          <p className="text-secondary mb-md">
            Ваш контент обучает. А обучающий контент привлекает тех, кто хочет учиться — не тех, кто хочет делегировать.
          </p>
          <p className="text-secondary mb-sm">Типичная ситуация:</p>
          <ul className="result-list">
            <li>Вы: "Вот 10 шагов как сделать X"</li>
            <li>Аудитория: "Круто! Пойду сделаю сам"</li>
            <li>Вы: "А у меня есть услуга..."</li>
            <li>Аудитория: "Спасибо, но я попробую сам по вашим материалам"</li>
          </ul>
        </div>

        <div className="highlight-box highlight-box-danger mb-lg">
          <h4 className="label mb-sm">Итог:</h4>
          <p className="text-secondary mb-md">
            <strong>Контент создаёт студентов, а не клиентов.</strong>
          </p>
          <p className="text-secondary mb-md">
            Из 1000 человек охвата обращаются 3-8 человек. Готовы платить — 1-3.
          </p>
          <p className="text-danger">
            Вы недополучаете 180 000 - 450 000₽ в месяц. При том же объёме работы.
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
        <ReasonBlock number={1} title="&quot;Фу, инфоцыган&quot;" quote="Думаете: &quot;Если буду продавать — стану как те противные блогеры&quot;">
          <p className="text-secondary mb-md">
            Но продажа — это не манипуляция.<br/>
            <strong>Продажа — это помощь человеку принять решение.</strong>
          </p>
          <div className="highlight-box">
            <h4 className="label mb-sm">Важно понимать:</h4>
            <p className="text-secondary">
              Когда человек пытается решить проблему сам по бесплатным материалам — он тратит месяцы. Когда покупает вашу услугу — решает за недели.
            </p>
            <p className="text-secondary mt-sm">
              Не продавая — вы лишаете его возможности решить проблему быстро.
            </p>
          </div>
        </ReasonBlock>

        <ReasonBlock number={2} title="Путаница: польза vs ценность" quote="&quot;Чем больше даю пользы — тем больше заплатят&quot;">
          <p className="text-secondary mb-md">
            <strong>Правда в том,</strong> что бесплатная польза и платная услуга — разные вещи.
          </p>
          <p className="text-cyan mb-md">
            Польза показывает КАК делать. Ценность — делает ЗА человека или С человеком.
          </p>
          <p className="text-secondary">
            Чем больше вы показываете "как" — тем меньше людям нужна ваша услуга.
          </p>
        </ReasonBlock>

        <ReasonBlock number={3} title="Страх отказа" quote="&quot;Если предложу и откажут — значит, я недостаточно хорош&quot;">
          <p className="text-secondary mb-md">
            Отказ — это не про вашу компетентность.<br/>
            <strong className="text-cyan">Это про то, что человеку сейчас не нужно или не подходит.</strong>
          </p>
          <p className="text-secondary">
            Вы можете быть лучшим в мире — и всё равно получать отказы. Это нормально.
          </p>
        </ReasonBlock>

        <ReasonBlock number={4} title="&quot;Быть хорошим&quot;" quote="&quot;Буду хорошим экспертом — и деньги придут сами&quot;">
          <p className="text-secondary mb-md">
            <strong>Правда:</strong> Мир полон гениальных экспертов без клиентов. И посредственных — с очередью.
          </p>
          <p className="text-highlight">
            Разница — не в экспертности. Разница — в умении продавать свою экспертность.
          </p>
        </ReasonBlock>
      </ResultSection>

      {/* What happens if you don't change */}
      <ResultSection title="ЧТО БУДЕТ ДАЛЬШЕ (ЕСЛИ ПРОДОЛЖИТЬ ТАК ЖЕ)">
        <CaseStudyCard type="negative" title="История Оли: 3 года &quot;щедрости&quot;, выгорание">
          <p className="text-secondary mb-md">Оля — дизайнер интерьеров. Пришла ко мне в 2024 году.</p>

          <div className="mb-md">
            <h4 className="label mb-sm">Ситуация:</h4>
            <ul className="result-list">
              <li>Вела блог 3 года</li>
              <li>Выкладывала туториалы, разборы, советы</li>
              <li>15 000 подписчиков</li>
              <li>Клиентов из блога: 2-3 в месяц</li>
              <li>Доход: 60 000₽/месяц</li>
            </ul>
          </div>

          <p className="text-secondary mb-sm">
            Я спросил: "Какой контент ты делаешь?"
          </p>
          <p className="text-secondary mb-md">
            Оля: "Показываю как самим сделать дизайн-проект, даю шаблоны, объясняю принципы..."
          </p>

          <div className="timeline">
            <div className="timeline-item">
              <span className="timeline-year">Проблема:</span>
              <span className="text-secondary">Её подписчики научились делать сами. Зачем им платить?</span>
            </div>
            <div className="timeline-item">
              <span className="timeline-year">Результат:</span>
              <span className="text-secondary">15 000 подписчиков-студентов. 0.02% конверсия в клиентов.</span>
            </div>
          </div>

          <div className="highlight-box highlight-box-danger mt-md">
            <h4 className="label mb-sm">Итог:</h4>
            <p className="text-danger">
              3 года работы. 15 000 подписчиков. 60 000₽/месяц. Полное выгорание от "неблагодарной" аудитории.
            </p>
          </div>
        </CaseStudyCard>

        <CaseStudyCard type="positive" title="Контрпример: Лена, тоже дизайнер">
          <p className="text-secondary mb-md">
            Лена пришла с той же проблемой. 8 000 подписчиков, 1-2 клиента в месяц.
          </p>
          <p className="text-secondary mb-md">
            Мы изменили стратегию контента: вместо "как сделать самому" — "почему самому делать долго и дорого". Вместо туториалов — кейсы с результатами.
          </p>
          <p className="text-secondary mb-md">
            За 2 месяца — 7 000 подписчиков (часть "студентов" отписалась). Но заявок стало 8-10 в месяц.
          </p>

          <StatsGrid
            stats={[
              { number: '1-2 → 10', label: 'заявок в месяц' },
              { number: '8 000 → 7 000', label: 'подписчиков' },
              { number: 'x5', label: 'рост конверсии' },
              { number: '280 000₽', label: 'доход в месяц' },
            ]}
          />
        </CaseStudyCard>

        <ComparisonBox
          items={[
            {
              type: 'negative',
              name: 'Оля:',
              result: '15 000 подписчиков-студентов, 60 000₽/месяц, выгорание',
            },
            {
              type: 'positive',
              name: 'Лена:',
              result: '7 000 целевых подписчиков, 280 000₽/месяц, кайф от работы',
            },
          ]}
        />

        <p className="text-highlight text-center mt-lg">
          Разница не в количестве подписчиков. Разница в том, КОГО вы привлекаете контентом.
        </p>
      </ResultSection>

      {/* Solution exists */}
      <ResultSection title="РЕШЕНИЕ СУЩЕСТВУЕТ">
        <p className="text-secondary mb-md">
          Я работаю с "щедрыми экспертами" с 2023 года.
        </p>
        <p className="text-cyan mb-lg">
          Помог <strong>300+ экспертам</strong> перестать создавать студентов и начать привлекать клиентов.
        </p>

        <CaseStudyCard type="positive" title="Реальный кейс: Наташа, психолог">
          <div className="mb-md">
            <h4 className="label mb-sm">Ситуация:</h4>
            <ul className="result-list">
              <li>12 000 подписчиков</li>
              <li>Тонны полезного контента про психологию</li>
              <li>Доход: 90 тыс/месяц (3 клиента)</li>
              <li>"Спасибо, попробую сама" — самый частый ответ</li>
            </ul>
          </div>

          <p className="text-secondary mb-md">
            <strong>Что изменили:</strong> Перешли от "как справиться самому" к "почему самому не получится и сколько это стоит".
          </p>

          <div className="highlight-box highlight-box-success">
            <h4 className="label mb-sm">Результат через 6 недель:</h4>
            <ul className="result-list">
              <li>11 000 подписчиков (1000 "студентов" ушли)</li>
              <li className="text-success">Заявки: <strong>12-15 в месяц</strong></li>
              <li className="text-success">Доход: <strong>350 тыс/месяц</strong></li>
              <li className="text-success">Рост в <strong>4 раза</strong></li>
            </ul>
          </div>

          <p className="text-highlight mt-md">
            Наташа не стала менее щедрой. Она стала <strong>щедрой к тем, кому реально нужна помощь</strong>.
          </p>
        </CaseStudyCard>
      </ResultSection>

      {/* What needs to change */}
      <ResultSection title="ЧТО НУЖНО ИЗМЕНИТЬ">
        <p className="text-secondary mb-md">
          Вам не нужно перестать быть щедрым. Вам нужно <strong>изменить ЧТО вы даёте</strong>.
        </p>
        <p className="text-cyan mb-lg">
          И принять, что продажа = помощь.
        </p>

        <p className="text-secondary mb-md">
          3 стратегических сдвига:
        </p>

        <StepsList
          steps={[
            {
              title: 'От "как сделать" к "почему сам не сделаешь"',
              description: 'показывать сложность, подводные камни, цену ошибок — а не пошаговые инструкции',
            },
            {
              title: 'От экспертизы к диагностике',
              description: 'не учить решать проблему — а помогать понять, что проблема есть и какая она',
            },
            {
              title: 'Принять что продажа = помощь',
              description: 'когда человек покупает вашу услугу — он решает проблему быстрее. Не продавая — вы лишаете его этой возможности',
            },
          ]}
        />

        <p className="text-secondary mt-lg mb-md">Звучит просто. Но на практике возникают вопросы:</p>
        <ul className="result-list result-list-questions">
          <li>Как показывать сложность, не отпугивая?</li>
          <li>Как продавать, не становясь "инфоцыганом"?</li>
          <li>Что делать с текущей аудиторией "студентов"?</li>
          <li>Как перестроить контент без потери вовлечённости?</li>
        </ul>
        <p className="text-highlight mt-md">На это нужен взгляд со стороны.</p>
      </ResultSection>

      {/* Masterclass CTA */}
      <CTASection
        subtitle="Как перестать создавать &quot;студентов&quot; и начать привлекать платящих клиентов"
        features={[
          <><strong>Схема сборки Продающего Контента</strong> — как давать ценность без создания "студентов"</>,
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
        resultTitle="Щедрый эксперт"
        userId={userId}
        resultId={resultId}
        onPaymentClick={onPaymentClick}
        psLines={[
          'Вы на этапе "Щедрый эксперт" — мастер-класс покажет как давать ценность и получать за это деньги.',
          'Можете продолжить создавать "студентов" как Оля. А можете за 6 недель получить x4 к доходу как Лена. Решать вам.',
        ]}
      />
    </div>
  );
}
