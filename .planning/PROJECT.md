# TheSasha Quiz Funnel

## What This Is

Telegram Mini App с квизом "AI-диагност контента" для эксперта @sashatoyz. Квиз определяет этап развития эксперта (5 результатов), показывает персонализированную визуальную диагностику с чартами, инфографикой и анимациями, после чего ведёт к покупке мастер-класса "Продающий контент" за 3,450 RUB через Prodamus. Все события трекаются в Notion, неоплатившим отправляются follow-up сообщения через cron.

## Core Value

Человек проходит квиз → получает персонализированный результат → покупает мастер-класс. Полная воронка от первого касания до оплаты.

## Requirements

### Validated

- ✓ **QUIZ-01..05**: Квиз с 8 вопросами, 5 категориями, 5 результатами — v1.0
- ✓ **TG-01..03**: Telegram Mini App, user_id, callback — v1.0
- ✓ **DEPLOY-01..02**: Деплой на Vercel — v1.0
- ✓ **PAY-01**: Prodamus оплата + webhook + материалы — v1.0
- ✓ **TRACK-01**: Event tracking через Notion API — v1.0
- ✓ **FOLLOW-01..02**: Follow-up сообщения + cron — v1.0
- ✓ **SUB-01**: Проверка подписки на канал — v1.0
- ✓ **LAYOUT-01..04**: Shared components, типографика, адаптивность — v1.1
- ✓ **VIZ-01..04**: Radar chart, level badge, financial gauge, audience donut — v1.1
- ✓ **MSG-01..03**: Follow-up E2E, пост-оплата, admin notifications — v1.1
- ✓ **VIS-01..05**: Чарт интеграция, hero секция, scroll-анимации, лоадер, визуальные акценты — v2.0
- ✓ **EMO-01..03**: Финансовый impact, before/after, персонализация — v2.0
- ✓ **CONS-01**: Mobile/desktop responsive — v2.0
- ✓ **TEST-01..04**: E2E тестирование, UX-аудит (guides + checklist) — v2.0

### Active

(No active milestone — planning next)

### Out of Scope

- Домен thesasha.com — используем Vercel subdomain
- Админка для редактирования квиза — пока в коде
- Мультиязычность — только русский
- AI-ассистент для обработки заявок — будущее
- Тяжёлые анимации (Framer Motion) — React 19 несовместимость, bundle size
- Кнопка "Поделиться результатом" — отложена, доработаем позже
- Переписывание текстов результатов — отдельный milestone

## Context

### Стек
- Next.js 16 (App Router), TypeScript, Tailwind CSS
- Telegram WebApp SDK для Mini App
- Prodamus для оплаты (HMAC SHA256 webhook verification)
- Notion API (@notionhq/client v5.x) для трекинга и follow-up очереди
- Recharts (40KB) для визуализаций (SVG rendering)
- Pure CSS @keyframes + native IntersectionObserver для анимаций
- Vercel для хостинга и cron jobs

### Квиз
- 8 вопросов, 4 варианта ответа
- 5 результатов: Эксперт-невидимка, Делатель без системы, Щедрый эксперт, Эксперт на качелях, Манимейкер
- Каждому результату — персонализированная диагностика (hero, charts, before/after, CTA)
- 4 follow-up сообщения на результат (включая видео-кейс)

### Shipped features (v2.0)
- HeroSection с Telegram персонализацией (имя, аватар, level badge, финансовый impact)
- AnalyzingLoader (2.5s лоадинг перед показом результата)
- ScrollReveal (прогрессивное появление секций при скролле)
- BeforeAfterComparison (СЕЙЧАС vs ПОСЛЕ на основе данных квиза)
- Визуальные акценты (accent-quote, accent-number, accent-pain, accent-insight)
- WeakPointsHighlight (2 слабейших показателя из radar chart)
- GrowthMetric (Было/Стало с множителем)

### Инфраструктура
- Bot: @testtoyzbot
- Deploy: quiz.thesashatoyz.com (Vercel)
- GitHub: github.com/thesashatoyzworld/quizapp.git

### Known Issues (from UX audit)
- State lost on page refresh (no localStorage persistence)
- No back button during quiz
- Payment timeout not handled
- MASTERCLASS_CHANNEL_LINK not set

## Constraints

- **Стек**: Next.js + TypeScript + Tailwind (established)
- **Оплата**: Только Prodamus
- **Трекинг**: Notion API (migrated from Google Sheets)
- **Деплой**: Vercel (free tier)
- **Анимации**: Pure CSS + native APIs only (no Framer Motion)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js для квиза | Vercel деплой, App Router | ✓ Good |
| Prodamus для оплаты | Российский рынок, простая интеграция | ✓ Good |
| Notion вместо Google Sheets | Удобнее, нет Apps Script, MCP доступ | ✓ Good (verified E2E) |
| @notionhq/client v5 dataSources API | databases.query removed in v5, use dataSources.query | ✓ Good |
| Follow-up через cron | Vercel cron + Notion queue, не зависит от внешних сервисов | ✓ Good (verified E2E) |
| Recharts для визуализаций | 40KB bundle, mobile-optimized, SVG rendering | ✓ Good |
| Pure CSS вместо Framer Motion | React 19 issues, 0KB bundle impact | ✓ Good |
| IntersectionObserver для scroll | Native API, 0KB, Telegram WebView compatible | ✓ Good |
| ShareButton отложена | Не выглядит прикольно, доработаем позже | ⚠️ Deferred |
| Composition over modification | Обёртки вокруг существующих компонентов | ✓ Good |

---
*Last updated: 2026-02-10 after v2.0 milestone*
