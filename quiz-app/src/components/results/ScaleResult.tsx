'use client';

import React from 'react';
import {
  ResultHeader,
  ResultSection,
  CaseStudyCard,
  StatsGrid,
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

export default function ScaleResult({ onPaymentClick, userId, resultId, scores }: ResultProps) {
  const ACCENT_COLOR = '#00ff88'; // green
  const chartData = resultId ? getChartData(resultId as Category) : null;

  return (
    <div className="result-page">
      <ResultHeader
        title="ГОТОВЫ К МАСШТАБИРОВАНИЮ"
        subtitle="После прохождения теста вы получили результат &quot;Готовы к масштабированию&quot;."
        pdfUrl="/results/5-scale.pdf"
        pdfFilename="Диагностика-Готовы-к-масштабированию.pdf"
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
            <li>Контент работает стабильно</li>
            <li>Система выстроена и приносит результат</li>
            <li>~75% аудитории — целевые клиенты</li>
            <li>Конверсия из охвата в заявки — высокая</li>
            <li>Продаёте спокойно и системно</li>
            <li>Понимаете, что работает и почему</li>
          </ul>
        </div>

        <div className="mb-lg">
          <h3 className="label mb-sm">Что получаете:</h3>
          <ul className="result-list">
            <li>15-25 обращений с каждой 1000 охвата</li>
            <li>Конверсия 60-80%</li>
            <li>Стабильный доход</li>
            <li>НО: упёрлись в потолок личного времени</li>
          </ul>
        </div>

        <div className="mb-lg">
          <h3 className="label mb-sm">Что чувствуете:</h3>
          <ul className="result-list result-list-quotes">
            <li>"Всё работает, но хочу больше"</li>
            <li>"Не хватает времени на всех клиентов"</li>
            <li>"Как вырасти, не работая 24/7?"</li>
            <li>"Доход растёт линейно — а хочется экспоненциально"</li>
            <li>"Чувствую, что могу больше, но не знаю как"</li>
          </ul>
        </div>

        <p className="text-highlight">
          Поздравляю! Вы в <strong>топ-15% экспертов</strong>. Следующий шаг — масштабирование.
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
        <h3 className="text-cyan mb-md">Вы выжали максимум из сольной модели</h3>

        <div className="mb-lg">
          <h4 className="label mb-sm">Ситуация простая:</h4>
          <p className="text-secondary mb-md">
            Ваша система работает. Контент приводит клиентов. Вы продаёте. Всё хорошо.
          </p>
          <p className="text-secondary mb-sm">Но есть ограничение:</p>
          <ul className="result-list">
            <li>Один эксперт = один поток работы</li>
            <li>Больше клиентов = больше вашего времени</li>
            <li>Выручка растёт линейно, не экспоненциально</li>
            <li>Потолок: ваше личное время</li>
          </ul>
        </div>

        <div className="highlight-box highlight-box-warning mb-lg">
          <h4 className="label mb-sm">Текущее ограничение:</h4>
          <p className="text-secondary mb-md">
            <strong>Вы продаёте своё время. А время конечно.</strong>
          </p>
          <p className="text-secondary mb-md">
            Можно повысить чек. Можно оптимизировать процессы. Но потолок всё равно есть.
          </p>
          <p className="text-warning">
            Упущенный потенциал при текущей модели: 300 000 - 800 000₽++ в месяц.
          </p>
        </div>
      </ResultSection>

      {/* What's next */}
      <ResultSection
        title="ЧТО ДАЛЬШЕ?"
        slot={chartData ? (
          <div className="result-chart-slot">
            <AudienceDonut data={chartData.audience} accentColor={ACCENT_COLOR} />
          </div>
        ) : undefined}
      >
        <div className="reason-block mb-lg">
          <h3 className="reason-title">1. Масштабирование без роста времени</h3>
          <p className="text-secondary mb-md">
            Следующий этап — отвязать доход от личного времени.
          </p>
          <div className="highlight-box">
            <h4 className="label mb-sm">Варианты:</h4>
            <ul className="result-list">
              <li>Групповые форматы вместо индивидуальных</li>
              <li>Записанные продукты (курсы, воркшопы)</li>
              <li>Команда и делегирование</li>
              <li>Автоматизация части работы</li>
            </ul>
          </div>
        </div>

        <div className="reason-block mb-lg">
          <h3 className="reason-title">2. Умножение контента</h3>
          <p className="text-secondary mb-md">
            Один контент = много касаний.
          </p>
          <p className="text-cyan mb-md">
            Рилс → пост → сторис → рассылка → карусель
          </p>
          <p className="text-secondary">
            Не создавать больше — переупаковывать то, что уже работает.
          </p>
        </div>

        <div className="reason-block mb-lg">
          <h3 className="reason-title">3. Продуктовая линейка</h3>
          <p className="text-secondary mb-md">
            Сейчас у вас скорее всего 1-2 продукта.
          </p>
          <p className="text-secondary mb-md">
            Следующий шаг — линейка от дешёвых до дорогих:
          </p>
          <ul className="result-list">
            <li>Трипваер (недорогой вход)</li>
            <li>Основной продукт (текущий)</li>
            <li>Премиум (VIP, индивидуальная работа)</li>
          </ul>
        </div>

        <div className="reason-block">
          <h3 className="reason-title">4. Автоматизация воронки</h3>
          <p className="text-secondary mb-md">
            Часть продаж можно автоматизировать:
          </p>
          <ul className="result-list">
            <li>Автовебинары</li>
            <li>Email-цепочки</li>
            <li>Чат-боты для квалификации</li>
            <li>Автопрогревы в сторис</li>
          </ul>
        </div>
      </ResultSection>

      {/* Case studies */}
      <ResultSection title="ПРИМЕРЫ МАСШТАБИРОВАНИЯ">
        <CaseStudyCard type="positive" title="Кейс: Михаил, бизнес-трекер">
          <div className="mb-md">
            <h4 className="label mb-sm">Было:</h4>
            <ul className="result-list">
              <li>Индивидуальный трекинг</li>
              <li>Максимум 8 клиентов в месяц</li>
              <li>Доход: 400 000₽/месяц</li>
              <li>Работа 10-12 часов в день</li>
            </ul>
          </div>

          <p className="text-secondary mb-md">
            <strong>Что изменили:</strong> Запустили групповой формат + записанный курс для "холодных".
          </p>

          <StatsGrid
            stats={[
              { number: '400K → 1.2M', label: 'рост дохода' },
              { number: '12 → 6', label: 'часов работы' },
              { number: 'x3', label: 'рост выручки' },
              { number: '50%', label: 'меньше работы' },
            ]}
          />
        </CaseStudyCard>

        <CaseStudyCard type="positive" title="Кейс: Елена, нутрициолог">
          <div className="mb-md">
            <h4 className="label mb-sm">Было:</h4>
            <ul className="result-list">
              <li>Индивидуальные консультации</li>
              <li>12-15 клиентов в месяц</li>
              <li>Доход: 250 000₽/месяц</li>
              <li>Выгорание от однотипной работы</li>
            </ul>
          </div>

          <p className="text-secondary mb-md">
            <strong>Что изменили:</strong> Создали продуктовую линейку + автоворонку для трипваера.
          </p>

          <div className="highlight-box highlight-box-success">
            <h4 className="label mb-sm">Результат через 4 месяца:</h4>
            <ul className="result-list">
              <li>Трипваер: 50-70 продаж/месяц (автоматически)</li>
              <li className="text-success">Основной продукт: 20-25 клиентов/месяц</li>
              <li className="text-success">Доход: <strong>650 000₽/месяц</strong></li>
              <li className="text-success">Работа: <strong>6 часов в день</strong></li>
            </ul>
          </div>
        </CaseStudyCard>
      </ResultSection>

      {/* What you need */}
      <ResultSection title="ЧТО ВАМ НУЖНО СЕЙЧАС">
        <p className="text-secondary mb-md">
          Вы уже прошли путь от нуля до работающей системы.
        </p>
        <p className="text-cyan mb-lg">
          Следующий шаг — масштабирование без потери качества и выгорания.
        </p>

        <p className="text-secondary mb-md">
          3 ключевых направления:
        </p>

        <StepsList
          steps={[
            {
              title: 'Продуктовая линейка',
              description: 'от трипваера до премиума — чтобы монетизировать всю аудиторию, а не только "готовых купить сейчас"',
            },
            {
              title: 'Автоматизация',
              description: 'автоворонки, автовебинары, цепочки — чтобы продавать без вашего участия',
            },
            {
              title: 'Умножение контента',
              description: 'системы переупаковки — чтобы один контент работал в 5-10 местах',
            },
          ]}
        />

        <p className="text-secondary mt-lg mb-md">Вопросы, которые возникают на этом этапе:</p>
        <ul className="result-list result-list-questions">
          <li>С чего начать масштабирование?</li>
          <li>Как не потерять качество при росте?</li>
          <li>Какой продукт запускать первым?</li>
          <li>Как автоматизировать без потери "живости"?</li>
        </ul>
        <p className="text-highlight mt-md">На этом этапе особенно важен взгляд со стороны.</p>
      </ResultSection>

      {/* Masterclass CTA */}
      <CTASection
        subtitle="Как масштабировать работающую систему и вырасти в 2-3 раза без выгорания"
        features={[
          <><strong>Схема сборки Продающего Контента</strong> — как системно умножать охват и заявки</>,
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
        resultTitle="Готовы к масштабированию"
        userId={userId}
        resultId={resultId}
        onPaymentClick={onPaymentClick}
        psLines={[
          'Вы в топ-15% экспертов. Мастер-класс покажет, как перейти на следующий уровень — масштабирование.',
          'Можете продолжить упираться в потолок времени. А можете за 4 месяца вырасти в 2-3 раза как Михаил и Елена. Решать вам.',
        ]}
      />
    </div>
  );
}
