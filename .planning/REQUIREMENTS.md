# Requirements: TheSasha Quiz Funnel

**Defined:** 2026-02-10
**Core Value:** Квиз → персонализированный результат → покупка мастер-класса → апселл на "Коннекторы"

## v3.0 Requirements

Requirements for milestone v3.0 "Коннекторы Upsell Funnel". Each maps to roadmap phases.

### Landing Page

- [x] **LAND-01**: Лендинг "Коннекторы" отображает все секции из PDF (hero 500K, 3 элемента, первые 14 дней, киты, недели 4-8, система, неделя 12, фазы 1-3, тарифы Базовый/Премиум, ВАЖНО, CTA)
- [x] **LAND-02**: Лендинг адаптирован под мобильные (Telegram Mini App WebView)
- [x] **LAND-03**: Контент лендинга персонализирован под типаж квиза (5 версий текста: заголовки, боли, акценты)
- [x] **LAND-04**: Лендинг доступен по URL с параметром типажа (e.g. /connectors?type=invisible)

### Landing Conversion Optimization

- [ ] **CONV-01**: Структура страницы переупорядочена по research-backed формуле (PAS → Solution → Value → Price → Close)
- [ ] **CONV-02**: Новые текстовые блоки: pre-qualifier, belief shift ("не курс — совместная работа"), "для вас если..."
- [ ] **CONV-03**: Копирайт обновлён: формат программы (еженедельные созвоны, индивидуальный подход, конкретные результаты за 12 недель)
- [ ] **CONV-04**: FAQ-аккордеон с 6-8 универсальными вопросами-возражениями
- [ ] **CONV-05**: Value Stack визуальный стек ценности перед ценой (ratio 10:1)
- [ ] **CONV-06**: Sticky CTA — плавающая кнопка после 25% скролла
- [ ] **CONV-07**: Scarcity banner + countdown timer (дедлайн набора)
- [ ] **CONV-08**: ROI калькулятор ("один клиент окупает X недель программы")
- [ ] **CONV-09**: Social proof в 4-5 точках страницы (отзывы, кейсы было/стало)

### Payment

- [ ] **PAY-02**: Кнопки оплаты Базового (10K ₽/нед, 120K за 12 нед) и Премиум (20K ₽/нед, 240K за 12 нед) через Prodamus
- [ ] **PAY-03**: Webhook обрабатывает оплату тарифов Коннекторов и определяет тариф

### Upsell Chain

- [ ] **UPSELL-01**: После оплаты воркшопа пользователь попадает в апселл-очередь
- [ ] **UPSELL-02**: Бот отправляет 2-3 сообщения за неделю (день 1, 3, 7) с ссылкой на персонализированный лендинг
- [ ] **UPSELL-03**: Текст сообщений персонализирован под типаж квиза (5 версий × 2-3 сообщения)
- [ ] **UPSELL-04**: Цепочка останавливается если пользователь оплатил Коннекторы

### Access

- [ ] **ACCESS-01**: После оплаты Коннекторов бот отправляет инвайт-ссылку в Telegram-группу
- [ ] **ACCESS-02**: Оплата и тариф записываются в Notion

### Tracking

- [ ] **TRACK-02**: Все события апселл-воронки трекаются в Notion (upsell_sent, upsell_opened, connectors_paid)
- [ ] **TRACK-03**: Админ получает уведомление в Telegram при оплате Коннекторов

## Future Requirements

### Subscription Management (v3.1+)

- **SUB-02**: Проверка рекуррентных платежей через Prodamus
- **SUB-03**: Предупреждение при неудачном платеже (24ч grace period)
- **SUB-04**: Автоматический кик из группы при неоплате

### Extended Pricing (v3.1+)

- **PRICE-01**: Страница с 4 тарифами вместо прямой оплаты воркшопа
- **PRICE-02**: Тариф 10K ₽/мес (подписка без программы)

### Visual Personalization (v3.1+)

- **VIS-06**: Разные цвета/акценты лендинга под типаж

## Out of Scope

| Feature | Reason |
|---------|--------|
| Замена текущего flow оплаты воркшопа | Текущий flow работает, добавляем upsell поверх |
| Автокик из группы | Требует subscription management, отдельный milestone |
| Тариф 10K/мес | Нет в текущем PDF оффера, добавим позже |
| Визуальная персонализация (цвета) | Сначала текстовая, визуал потом |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAND-01 | Phase 11 | Done |
| LAND-02 | Phase 11 | Done |
| LAND-03 | Phase 12 | Done |
| LAND-04 | Phase 11 | Done |
| CONV-01 | Phase 12.1 | Pending |
| CONV-02 | Phase 12.1 | Pending |
| CONV-03 | Phase 12.1 | Pending |
| CONV-04 | Phase 12.2 | Pending |
| CONV-05 | Phase 12.2 | Pending |
| CONV-06 | Phase 12.2 | Pending |
| CONV-07 | Phase 12.2 | Pending |
| CONV-08 | Phase 12.2 | Pending |
| CONV-09 | Phase 12.3 | Pending |
| PAY-02 | Phase 13 | Pending |
| PAY-03 | Phase 13 | Pending |
| UPSELL-01 | Phase 14 | Pending |
| UPSELL-02 | Phase 14 | Pending |
| UPSELL-03 | Phase 14 | Pending |
| UPSELL-04 | Phase 14 | Pending |
| ACCESS-01 | Phase 15 | Pending |
| ACCESS-02 | Phase 13 | Pending |
| TRACK-02 | Phase 14 | Pending |
| TRACK-03 | Phase 13 | Pending |

**Coverage:**
- v3.0 requirements: 23 total (14 original + 9 CONV)
- Mapped to phases: 23/23 ✓
- Unmapped: 0

---
*Requirements defined: 2026-02-10*
*Last updated: 2026-02-10 (traceability mapped to phases 11-15)*
