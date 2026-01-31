# Roadmap: TheSasha Quiz MVP

**Created:** 2026-01-31
**Phases:** 3
**Requirements:** 11

## Phase Overview

| # | Phase | Goal | Requirements |
|---|-------|------|--------------|
| 1 | Quiz Web App | Рабочий квиз на локалхосте с Cyberpunk дизайном | QUIZ-01..05, DESIGN-01 |
| 2 | Telegram Mini App | Квиз работает в Telegram, callback в бота | TG-01..03 |
| 3 | Deploy | Сайт на thesasha.com, Mini App привязан | DEPLOY-01..02 |

---

## Phase 1: Quiz Web App

**Goal:** Рабочий квиз на локалхосте с Cyberpunk дизайном

**Requirements:**
- QUIZ-01: Веб-страница с квизом
- QUIZ-02: 8 вопросов с 4 вариантами
- QUIZ-03: Система подсчёта баллов
- QUIZ-04: 5 результатов с текстами
- QUIZ-05: Форма ключевого слова
- DESIGN-01: Cyberpunk стиль

**Success Criteria:**
1. Можно пройти квиз от начала до результата
2. Баллы считаются правильно по всем 5 категориям
3. Показывается правильный результат (этап)
4. Дизайн соответствует visual-dna (neon, тёмный фон, Orbitron)
5. Ключевое слово можно ввести после результата

**Depends on:** Nothing

---

## Phase 2: Telegram Mini App

**Goal:** Квиз работает в Telegram, callback отправляется в бота

**Requirements:**
- TG-01: Telegram Mini App
- TG-02: Получение user_id
- TG-03: Callback в бота

**Success Criteria:**
1. Квиз открывается как Mini App в Telegram
2. user_id получен из Telegram WebApp API
3. После ввода ключевого слова → callback с данными уходит в бота
4. Бот получает: user_id, результат (этап), ключевое слово

**Depends on:** Phase 1

---

## Phase 3: Deploy

**Goal:** Сайт на thesasha.com, Mini App привязан к production URL

**Requirements:**
- DEPLOY-01: Деплой на Vercel
- DEPLOY-02: Подключение домена

**Success Criteria:**
1. Сайт доступен по https://thesasha.com
2. Квиз работает в production
3. Mini App использует production URL
4. Callback работает в production

**Depends on:** Phase 2

---

## Milestone: v1.0 MVP

**Includes:** Phases 1-3
**Delivers:** Рабочий квиз на своём домене + Telegram Mini App с callback

---
*Roadmap created: 2026-01-31*
