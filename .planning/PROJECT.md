# TheSasha Quiz Funnel

## What This Is

Telegram Mini App с квизом "AI-диагност контента" для эксперта @sashatoyz. Квиз определяет этап развития эксперта (5 результатов), после чего ведёт к покупке мастер-класса "Продающий контент" за 3,450 RUB через Prodamus. Все события трекаются в Notion, неоплатившим отправляются follow-up сообщения через cron.

## Core Value

Человек проходит квиз → получает персонализированный результат → покупает мастер-класс. Полная воронка от первого касания до оплаты.

## Requirements

### Validated

- ✓ **QUIZ-01..05**: Квиз с 8 вопросами, 5 категориями, 5 результатами — existing (Phase 1)
- ✓ **TG-01..03**: Telegram Mini App, user_id, callback — existing (Phase 2)
- ✓ **DEPLOY-01..02**: Деплой на Vercel, quizapp-ivory-delta.vercel.app — existing (Phase 3)
- ✓ **PAY-01**: Prodamus интеграция (оплата, webhook верификация, материалы) — existing (post-MVP)
- ✓ **TRACK-01**: Event tracking через Notion API — existing (post-MVP)
- ✓ **FOLLOW-01**: Follow-up сообщения (4 персональных по результату квиза) — existing (post-MVP)
- ✓ **FOLLOW-02**: Cron endpoint для рассылки follow-up — existing (post-MVP)
- ✓ **SUB-01**: Проверка подписки на канал перед результатом — existing (post-MVP)

### Active — Milestone v1.1: Polish & Conversion

**Блок 1: Редизайн результатов**
- [ ] Исправить вёрстку 5 страниц результатов (разъезжается, шрифты, несогласованность)
- [ ] Визуальные блоки: графики, чарты, инфографика из данных квиза (radar chart, gauge, donut, before/after)
- [ ] Геймификация: уровень (1-5), прогресс-бар, ранжирование (Solo Leveling стиль)
- [ ] Ресёрч UI-паттернов для лонгридов с инфографикой в cyberpunk стилистике

**Блок 2: Догрев + сообщения**
- [ ] Follow-up цепочка для непокупателей — проверить/доделать end-to-end
- [ ] Сообщение после оплаты — проверить/доделать
- [ ] Cron расписание — настроить и проверить на Vercel

**Блок 3: Сквозное тестирование**
- [ ] AI проходит весь путь как покупатель (квиз → результат → оплата → follow-up)
- [ ] Подсветить слабые места и UX-проблемы
- [ ] Раунд итераций по найденным проблемам

### Out of Scope

- Домен thesasha.com — используем Vercel subdomain
- Админка для редактирования квиза — пока в коде
- Мультиязычность — только русский
- AI-ассистент для обработки заявок — будущее

## Context

### Стек
- Next.js 16 (App Router), TypeScript, Tailwind CSS
- Telegram WebApp SDK для Mini App
- Prodamus для оплаты (HMAC SHA256 webhook verification)
- Notion API (@notionhq/client v5.x) для трекинга и follow-up очереди
- Vercel для хостинга и cron jobs

### Квиз
- 8 вопросов, 4 варианта ответа
- 5 результатов: Эксперт-невидимка, Делатель без системы, Щедрый эксперт, Эксперт на качелях, Манимейкер
- Каждому результату — 4 персональных follow-up сообщения (включая видео-кейс)

### Инфраструктура
- Bot: @sashatoyz_bot
- Deploy: quizapp-ivory-delta.vercel.app
- GitHub: github.com/thesashatoyzworld/quizapp.git

## Constraints

- **Стек**: Next.js + TypeScript + Tailwind (established)
- **Оплата**: Только Prodamus
- **Трекинг**: Notion API (migrated from Google Sheets)
- **Деплой**: Vercel (free tier)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js для квиза | Vercel деплой, App Router | ✓ Good |
| Prodamus для оплаты | Российский рынок, простая интеграция | ✓ Good |
| Notion вместо Google Sheets | Удобнее, нет Apps Script, MCP доступ | — Pending verification |
| @notionhq/client v5 dataSources API | databases.query removed in v5, use dataSources.query | ✓ Good |
| Follow-up через cron | Vercel cron + Notion queue, не зависит от внешних сервисов | — Pending verification |

## Current Milestone: v1.1 Polish & Conversion

**Goal:** Превратить результаты квиза из текстового лонгрида в аналитическую карту с визуализациями, наладить полный цикл догрева, протестировать всю воронку.

**Target features:**
- Редизайн 5 страниц результатов: чистая вёрстка + визуальные блоки (графики, чарты, геймификация)
- Рабочая цепочка follow-up сообщений для непокупателей
- Корректное сообщение после оплаты
- Сквозное тестирование всей воронки с AI-аудитом

---
*Last updated: 2026-02-07 after milestone v1.1 initialization*
