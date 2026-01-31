# Requirements: TheSasha Quiz MVP

**Defined:** 2026-01-31
**Core Value:** Человек проходит квиз → видим его в Telegram → можем запустить персональную коммуникацию

## v1 Requirements

### Quiz Core

- [ ] **QUIZ-01**: Веб-страница с квизом на thesasha.com
- [ ] **QUIZ-02**: 8 вопросов с 4 вариантами ответа каждый
- [ ] **QUIZ-03**: Система подсчёта баллов по 5 категориям
- [ ] **QUIZ-04**: 5 результатов (этапов) с текстами и финансовыми расчётами
- [ ] **QUIZ-05**: Форма ввода ключевого слова после результата

### Telegram Integration

- [ ] **TG-01**: Telegram Mini App с тем же квизом
- [ ] **TG-02**: Получение user_id из Telegram WebApp API
- [ ] **TG-03**: Callback в бота: user_id + результат + ключевое слово

### Design

- [ ] **DESIGN-01**: Cyberpunk визуальный стиль (neon, тёмный фон, HUD-элементы)

### Deployment

- [ ] **DEPLOY-01**: Деплой на Vercel
- [ ] **DEPLOY-02**: Подключение домена thesasha.com

## v2 Requirements

### Analytics
- **ANLT-01**: Яндекс.Метрика
- **ANLT-02**: Пиксели соцсетей

### Bot Integration
- **BOT-01**: Цепочки сообщений по результату квиза
- **BOT-02**: AI-ассистент для обработки заявок

### Content
- **CONT-01**: Notion интеграция для статей
- **CONT-02**: Автопубликация статей на сайт

## Out of Scope

| Feature | Reason |
|---------|--------|
| БД для результатов | MVP — только callback |
| Админка | Редактируем в коде |
| Мультиязычность | Только русский |
| Страницы сайта (услуги, кейсы) | Это для полной версии |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| QUIZ-01 | Phase 1 | Pending |
| QUIZ-02 | Phase 1 | Pending |
| QUIZ-03 | Phase 1 | Pending |
| QUIZ-04 | Phase 1 | Pending |
| QUIZ-05 | Phase 1 | Pending |
| DESIGN-01 | Phase 1 | Pending |
| TG-01 | Phase 2 | Pending |
| TG-02 | Phase 2 | Pending |
| TG-03 | Phase 2 | Pending |
| DEPLOY-01 | Phase 3 | Pending |
| DEPLOY-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-31*
