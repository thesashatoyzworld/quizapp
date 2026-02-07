# Requirements: TheSasha Quiz Funnel

**Defined:** 2026-01-31
**Updated:** 2026-02-07 (milestone v1.1 roadmap complete)
**Core Value:** Человек проходит квиз → получает персонализированный результат → покупает мастер-класс

## v1.0 Requirements (Complete)

### Quiz Core

- [x] **QUIZ-01**: Веб-страница с квизом
- [x] **QUIZ-02**: 8 вопросов с 4 вариантами ответа каждый
- [x] **QUIZ-03**: Система подсчёта баллов по 5 категориям
- [x] **QUIZ-04**: 5 результатов (этапов) с текстами и финансовыми расчётами
- [x] **QUIZ-05**: Форма ввода ключевого слова после результата

### Telegram Integration

- [x] **TG-01**: Telegram Mini App с тем же квизом
- [x] **TG-02**: Получение user_id из Telegram WebApp API
- [x] **TG-03**: Callback в бота: user_id + результат + ключевое слово

### Design

- [x] **DESIGN-01**: Cyberpunk визуальный стиль (neon, тёмный фон, HUD-элементы)

### Deployment

- [x] **DEPLOY-01**: Деплой на Vercel
- [x] **DEPLOY-02**: Подключение домена

### Post-MVP (done manually)

- [x] **PAY-01**: Prodamus оплата + webhook верификация + доставка материалов
- [x] **TRACK-01**: Event tracking → Notion API
- [x] **FOLLOW-01**: Follow-up сообщения (5 результатов × 4 сообщения)
- [x] **FOLLOW-02**: Cron endpoint для рассылки
- [x] **SUB-01**: Проверка подписки на канал перед результатом

---

## v1.1 Requirements — Polish & Conversion

### Result Page Refactoring (LAYOUT)

- [x] **LAYOUT-01**: Извлечь общие компоненты из 5 страниц результатов (единая система секций, карточек, заголовков)
- [x] **LAYOUT-02**: Единая типографика — консистентные шрифты, размеры, отступы для всех результатов
- [x] **LAYOUT-03**: Исправить адаптивность — результаты не разъезжаются на мобильных устройствах (Telegram WebApp viewport)
- [x] **LAYOUT-04**: Единая система стилей для повторяющихся блоков (кейсы, CTA, списки)

### Visual Analytics (VIZ)

- [ ] **VIZ-01**: Radar chart — паутинка по 5 категориям на основе баллов квиза, показывает профиль эксперта
- [ ] **VIZ-02**: Level/progress bar — уровень 1-5 с геймификацией (Solo Leveling стиль), визуальный ранг эксперта
- [ ] **VIZ-03**: Финансовый gauge — визуализация потерь/потенциала в рублях (данные из контента результата)
- [ ] **VIZ-04**: Donut chart — состав аудитории (клиенты vs ученики vs случайные, данные из контента результата)
- [ ] **VIZ-05**: Интеграция визуальных блоков в лонгрид — чарты между текстовыми секциями, не нарушая поток чтения и CTA

### Follow-up Messaging (MSG)

- [ ] **MSG-01**: Проверить end-to-end работу follow-up цепочки (cron → Notion → бот → пользователь)
- [ ] **MSG-02**: Проверить/доделать сообщение после успешной оплаты (webhook → бот → пользователь с материалами)
- [ ] **MSG-03**: Настроить ADMIN_CHAT_ID для получения уведомлений о событиях

### End-to-End Testing (TEST)

- [ ] **TEST-01**: AI проходит полный путь покупателя (квиз → подписка → результат → оплата)
- [ ] **TEST-02**: AI проходит путь НЕпокупателя (квиз → результат → follow-up сообщения)
- [ ] **TEST-03**: AI-аудит UX — подсветить слабые места, проблемы навигации, неочевидные элементы
- [ ] **TEST-04**: Раунд итераций по найденным проблемам

---

## Future Requirements

### Analytics
- **ANLT-01**: Яндекс.Метрика
- **ANLT-02**: Пиксели соцсетей

### Bot Integration
- **BOT-02**: AI-ассистент для обработки заявок

### Content
- **CONT-01**: Notion интеграция для статей
- **CONT-02**: Автопубликация статей на сайт

## Out of Scope

| Feature | Reason |
|---------|--------|
| A/B тестирование результатов | Недостаточно трафика для статистической значимости |
| Реальная аналитика бизнеса пользователя | Нет данных — визуализируем ответы квиза |
| Анимированные переходы между секциями | Избыточно для мобильного, тормозит |
| Админка | Редактируем в коде |
| Мультиязычность | Только русский |
| Настройка расписания follow-up | Захардкожено в коде |

## Traceability

### v1.0 (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| QUIZ-01..05 | Phase 1 | ✅ Complete |
| DESIGN-01 | Phase 1 | ✅ Complete |
| TG-01..03 | Phase 2 | ✅ Complete |
| DEPLOY-01..02 | Phase 3 | ✅ Complete |
| PAY-01, TRACK-01, FOLLOW-01..02, SUB-01 | Post-MVP | ✅ Complete |

### v1.1 (In Progress)

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAYOUT-01 | Phase 4 | Complete |
| LAYOUT-02 | Phase 4 | Complete |
| LAYOUT-03 | Phase 4 | Complete |
| LAYOUT-04 | Phase 4 | Complete |
| VIZ-01 | Phase 5 | Pending |
| VIZ-02 | Phase 5 | Pending |
| VIZ-03 | Phase 5 | Pending |
| VIZ-04 | Phase 5 | Pending |
| VIZ-05 | Phase 5 | Pending |
| MSG-01 | Phase 6 | Pending |
| MSG-02 | Phase 6 | Pending |
| MSG-03 | Phase 6 | Pending |
| TEST-01 | Phase 7 | Pending |
| TEST-02 | Phase 7 | Pending |
| TEST-03 | Phase 7 | Pending |
| TEST-04 | Phase 7 | Pending |

**Coverage:**
- v1.1 requirements: 16 total
- Categories: Layout (4), Visualization (5), Messaging (3), Testing (4)
- Mapped to phases: 16/16 ✓
- No orphaned requirements

---
*Requirements defined: 2026-01-31*
*Last updated: 2026-02-07 (v1.1 traceability complete)*
