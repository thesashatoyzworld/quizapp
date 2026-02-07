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

interface ResultProps {
  onPaymentClick?: () => void;
  userId?: number | null;
  resultId?: string;
  scores?: Record<Category, number> | null;
}

export default function UnstableResult({ onPaymentClick, userId, resultId, scores }: ResultProps) {
  return (
    <div className="result-page">
      <ResultHeader
        title="НЕСТАБИЛЬНЫЕ РЕЗУЛЬТАТЫ"
        subtitle="После прохождения теста вы получили результат &quot;Нестабильные результаты&quot;."
        pdfUrl="/results/4-unstable.pdf"
        pdfFilename="Диагностика-Нестабильные-результаты.pdf"
      />

      {/* Intro */}
      <ResultSection title="Вот что происходит с вашим контентом прямо сейчас:">
        <div className="mb-lg">
          <h3 className="label mb-sm">Что вы делаете:</h3>
          <ul className="result-list">
            <li>Контент работает — но непредсказуемо</li>
            <li>В ударе — отличные результаты</li>
            <li>Расслабились — всё падает</li>
            <li>Полагаетесь на интуицию, а не на систему</li>
            <li>Не знаете, что именно приносит результат</li>
            <li>"Когда в настроении — получается" — самая частая мысль</li>
          </ul>
        </div>

        <div className="mb-lg">
          <h3 className="label mb-sm">Что получаете:</h3>
          <ul className="result-list">
            <li>Хорошие месяцы: 8-15 обращений</li>
            <li>Плохие месяцы: 2-4 обращения</li>
            <li>Американские горки дохода</li>
            <li>Невозможность планировать</li>
          </ul>
        </div>

        <div className="mb-lg">
          <h3 className="label mb-sm">Что чувствуете:</h3>
          <ul className="result-list result-list-quotes">
            <li>"То густо, то пусто — не понимаю почему"</li>
            <li>"В хорошие месяцы думаю — наконец разобрался"</li>
            <li>"В плохие — что делаю не так?"</li>
            <li>"Не могу расслабиться — боюсь что опять упадёт"</li>
            <li>"Хочу стабильности, но не знаю как"</li>
          </ul>
        </div>

        <p className="text-highlight">
          Вы нашли работающую механику. Но <strong>не оцифровали её в систему</strong>.
        </p>
        <p className="text-cyan text-center mt-md" style={{ fontSize: '1.2rem' }}>Это про вас?</p>
      </ResultSection>

      {/* What's really happening */}
      <ResultSection title="ЧТО НА САМОМ ДЕЛЕ ПРОИСХОДИТ?">
        <h3 className="text-cyan mb-md">Вы работаете на интуиции вместо системы</h3>

        <div className="mb-lg">
          <h4 className="label mb-sm">Проблема простая:</h4>
          <p className="text-secondary mb-md">
            Вы умеете делать результат. Но не знаете точно, ЧТО приносит этот результат. Попадаете интуитивно — не системно.
          </p>
          <p className="text-secondary mb-sm">Типичная картина:</p>
          <ul className="result-list">
            <li>Хороший месяц: "Круто, наконец всё работает!"</li>
            <li>Следующий: "Делаю то же самое — не работает. Почему?"</li>
            <li>Ещё один: "О, снова пошло! Но что я изменил?"</li>
            <li>И так по кругу</li>
          </ul>
        </div>

        <div className="highlight-box highlight-box-danger mb-lg">
          <h4 className="label mb-sm">Итог:</h4>
          <p className="text-secondary mb-md">
            <strong>Нестабильность = стресс + недополученные деньги.</strong>
          </p>
          <p className="text-secondary mb-md">
            В хорошие месяцы вы зарабатываете. В плохие — стрессуете и пытаетесь понять, что пошло не так.
          </p>
          <p className="text-danger">
            За год это 80 000 - 200 000₽ недополученного дохода ежемесячно. Плюс постоянный стресс от непредсказуемости.
          </p>
        </div>
      </ResultSection>

      {/* Why it happens */}
      <ResultSection title="Почему это происходит (без осуждения)">
        <ReasonBlock number={1} title="Интуиция вместо аналитики" quote="Думаете: &quot;Я чувствую, когда получается&quot;">
          <p className="text-secondary mb-md">
            Но чувства — не система.<br/>
            <strong>Без цифр невозможно понять, что работает.</strong>
          </p>
          <div className="highlight-box">
            <h4 className="label mb-sm">Важно понимать:</h4>
            <p className="text-secondary">
              Когда нет данных — вы не можете повторить успех. Вы не знаете, какой пост привёл клиента, какая тема сработала, какой формат дал охват.
            </p>
            <p className="text-secondary mt-sm">
              Интуиция — это неосознанный анализ. Оцифровка делает его осознанным и повторяемым.
            </p>
          </div>
        </ReasonBlock>

        <ReasonBlock number={2} title="Зависимость от настроения" quote="&quot;Когда в ресурсе — контент огонь. Когда устал — не получается&quot;">
          <p className="text-secondary mb-md">
            <strong>Правда в том,</strong> что настроение не должно влиять на результат.
          </p>
          <p className="text-cyan mb-md">
            Система работает даже когда вы не в ресурсе.
          </p>
          <p className="text-secondary">
            Если результат зависит от вашего состояния — это не бизнес, это рулетка.
          </p>
        </ReasonBlock>

        <ReasonBlock number={3} title="&quot;Работает — не трогай&quot;" quote="&quot;В хорошие месяцы не до анализа, в плохие — паника&quot;">
          <p className="text-secondary mb-md">
            В хорошие месяцы кажется, что анализировать не нужно — и так работает.<br/>
            <strong className="text-cyan">Но именно в хорошие месяцы нужно фиксировать, ЧТО сработало.</strong>
          </p>
          <p className="text-secondary">
            Иначе в плохой месяц вы не знаете, к чему возвращаться.
          </p>
        </ReasonBlock>

        <ReasonBlock number={4} title="Страх &quot;сглазить&quot;" quote="&quot;Начну анализировать — и магия пропадёт&quot;">
          <p className="text-secondary mb-md">
            <strong>Правда:</strong> Анализ не убивает творчество. Он делает его управляемым.
          </p>
          <p className="text-highlight">
            Лучшие художники знают теорию цвета. Лучшие музыканты — теорию музыки. Знание не мешает — помогает.
          </p>
        </ReasonBlock>
      </ResultSection>

      {/* What happens if you don't change */}
      <ResultSection title="ЧТО БУДЕТ ДАЛЬШЕ (ЕСЛИ ПРОДОЛЖИТЬ ТАК ЖЕ)">
        <CaseStudyCard type="negative" title="История Сергея: 2 года американских горок">
          <p className="text-secondary mb-md">Сергей — бизнес-консультант. Пришёл ко мне в 2024.</p>

          <div className="mb-md">
            <h4 className="label mb-sm">Ситуация:</h4>
            <ul className="result-list">
              <li>Контент вёл 2 года</li>
              <li>Хорошие месяцы: 300 000₽</li>
              <li>Плохие месяцы: 80 000₽</li>
              <li>Не мог понять закономерность</li>
              <li>Постоянный стресс от непредсказуемости</li>
            </ul>
          </div>

          <p className="text-secondary mb-sm">
            Я спросил: "Какой контент приносит больше заявок?"
          </p>
          <p className="text-secondary mb-md">
            Сергей: "Не знаю. Иногда кейсы работают, иногда нет. Иногда рилсы, иногда посты..."
          </p>

          <div className="timeline">
            <div className="timeline-item">
              <span className="timeline-year">Проблема:</span>
              <span className="text-secondary">Ноль аналитики. Ноль понимания, что работает.</span>
            </div>
            <div className="timeline-item">
              <span className="timeline-year">Результат:</span>
              <span className="text-secondary">2 года на эмоциональных качелях. Выгорание на подходе.</span>
            </div>
          </div>

          <div className="highlight-box highlight-box-danger mt-md">
            <h4 className="label mb-sm">Итог:</h4>
            <p className="text-danger">
              2 года нестабильности. Средний доход 190 000₽ вместо возможных 300 000₽. Потеря 1.3 млн/год.
            </p>
          </div>
        </CaseStudyCard>

        <CaseStudyCard type="positive" title="Контрпример: Игорь, тоже консультант">
          <p className="text-secondary mb-md">
            Игорь пришёл с той же проблемой. Доход от 100 до 350 тыс — непредсказуемо.
          </p>
          <p className="text-secondary mb-md">
            Мы внедрили простую систему: отслеживание источника каждой заявки, анализ контента по неделям, фиксация "что сработало".
          </p>
          <p className="text-secondary mb-md">
            Через 6 недель Игорь точно знал: кейсы в формате "до/после" + сторис с процессом = стабильные заявки. Всё остальное — шум.
          </p>

          <StatsGrid
            stats={[
              { number: '100-350', label: 'было: разброс тыс₽' },
              { number: '280-320', label: 'стало: разброс тыс₽' },
              { number: 'x3', label: 'меньше разброс' },
              { number: '0', label: 'стресса' },
            ]}
          />
        </CaseStudyCard>

        <ComparisonBox
          items={[
            {
              type: 'negative',
              name: 'Сергей:',
              result: '2 года на интуиции, разброс 80-300 тыс, постоянный стресс',
            },
            {
              type: 'positive',
              name: 'Игорь:',
              result: '6 недель на построение системы, разброс 280-320 тыс, спокойствие',
            },
          ]}
        />

        <p className="text-highlight text-center mt-lg">
          Разница не в таланте. Разница в том, оцифровали вы свою интуицию или нет.
        </p>
      </ResultSection>

      {/* Solution exists */}
      <ResultSection title="РЕШЕНИЕ СУЩЕСТВУЕТ">
        <p className="text-secondary mb-md">
          Я работаю с "нестабильными результатами" с 2023 года.
        </p>
        <p className="text-cyan mb-lg">
          Помог <strong>300+ экспертам</strong> превратить интуицию в систему.
        </p>

        <CaseStudyCard type="positive" title="Реальный кейс: Анна, стилист">
          <div className="mb-md">
            <h4 className="label mb-sm">Ситуация:</h4>
            <ul className="result-list">
              <li>Доход: от 70 до 200 тыс/месяц</li>
              <li>Никакой закономерности</li>
              <li>"В хорошие месяцы — эйфория, в плохие — паника"</li>
              <li>Не могла планировать отпуск — "а вдруг именно тогда попрёт"</li>
            </ul>
          </div>

          <p className="text-secondary mb-md">
            <strong>Что изменили:</strong> Внедрили простой трекинг + выявили работающие паттерны.
          </p>

          <div className="highlight-box highlight-box-success">
            <h4 className="label mb-sm">Результат через 2 месяца:</h4>
            <ul className="result-list">
              <li>Доход: стабильно 180-220 тыс/месяц</li>
              <li className="text-success">Разброс: <strong>с 130 тыс до 40 тыс</strong></li>
              <li className="text-success">Средний доход: <strong>+50 000₽/месяц</strong></li>
              <li className="text-success">Впервые за 2 года: <strong>спланированный отпуск</strong></li>
            </ul>
          </div>

          <p className="text-highlight mt-md">
            Анна не стала работать больше. Она стала <strong>работать предсказуемо</strong>.
          </p>
        </CaseStudyCard>
      </ResultSection>

      {/* What needs to change */}
      <ResultSection title="ЧТО НУЖНО ИЗМЕНИТЬ">
        <p className="text-secondary mb-md">
          Вам не нужно менять подход. Вам нужно <strong>оцифровать то, что уже работает</strong>.
        </p>
        <p className="text-cyan mb-lg">
          Превратить интуицию в повторяемую систему.
        </p>

        <p className="text-secondary mb-md">
          Алгоритм стабилизации:
        </p>

        <StepsList
          steps={[
            {
              title: 'Отслеживать источник каждой заявки',
              description: 'какой контент привёл — пост, рилс, сторис? Какая тема? Какой формат?',
            },
            {
              title: 'Фиксировать "что сработало"',
              description: 'в хорошие недели записывать: что делал, как делал, что было по-другому',
            },
            {
              title: 'Выстроить воронку на основе данных',
              description: 'не "делать что чувствуется" — а повторять то, что доказанно работает',
            },
          ]}
        />

        <p className="text-secondary mt-lg mb-md">Звучит просто. Но на практике возникают вопросы:</p>
        <ul className="result-list result-list-questions">
          <li>Как отслеживать, не тратя часы на аналитику?</li>
          <li>Какие метрики реально важны?</li>
          <li>Как понять, что именно сработало — а что совпадение?</li>
          <li>Как выстроить систему без потери "творческого огня"?</li>
        </ul>
        <p className="text-highlight mt-md">На это нужен взгляд со стороны.</p>
      </ResultSection>

      {/* Masterclass CTA */}
      <CTASection
        subtitle="Как превратить нестабильные результаты в предсказуемую систему"
        features={[
          <><strong>Схема сборки Продающего Контента</strong> — система, которая работает независимо от вашего настроения</>,
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
        resultTitle="Нестабильные результаты"
        userId={userId}
        resultId={resultId}
        onPaymentClick={onPaymentClick}
        psLines={[
          'Вы на этапе "Нестабильные результаты" — мастер-класс покажет как превратить вашу интуицию в предсказуемую систему.',
          'Можете продолжить кататься на американских горках как Сергей. А можете за 6 недель получить стабильность как Игорь. Решать вам.',
        ]}
      />
    </div>
  );
}
