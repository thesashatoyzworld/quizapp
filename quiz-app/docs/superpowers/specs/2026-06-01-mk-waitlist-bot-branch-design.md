# Ветка листа ожидания МК «Разрешение быстрых денег» в @testtoyzbot

**Дата:** 2026-06-01
**Бот:** @testtoyzbot (`quiz-app`, `src/app/api/telegram-webhook/route.ts`)
**Образец:** существующая ветка `masterclasssync` / модель `MasterclassSyncWaitlist`

## Цель

Дать Саше рабочий deep-link, чтобы уже с контента приглашать людей в лист ожидания
МК «Разрешение быстрых денег», пока программа и квиз-лидмагнит дособираются.
Пред-запуск: дат и продаж пока нет — собираем тёплую базу, чтобы написать первым при открытии.

## Точка входа

Deep-link: `https://t.me/testtoyzbot?start=razreshenie_deneg`

Один источник входа (никакой кнопки в квизе пока). Ставится в посты/закреп/лендинг.

## Данные

Новая Prisma-модель (отдельная таблица — консистентно с паттерном «один лист = одна модель»):

```prisma
model MoneyMkWaitlist {
  id         Int      @id @default(autoincrement())
  telegramId BigInt   @unique @map("telegram_id")
  username   String?
  firstName  String?  @map("first_name")
  lastName   String?  @map("last_name")
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("money_mk_waitlist")
}
```

Дедуп по `telegramId` (unique) — повторное нажатие не плодит записи.

## Логика (изменения в `telegram-webhook/route.ts`)

Три вставки по образцу `masterclasssync` (строки ~176–235 и ~347–379):

1. **Ветка `/start`** — `startParam === 'razreshenie_deneg'`:
   - `sendMessage` с текстом-приглашением + inline-кнопка `callback_data: 'rdmk_join'`
   - `trackEvent({ event_type: 'bot_start', utm_source: 'razreshenie_deneg' })`

2. **Callback `rdmk_join`**:
   - `findUnique` по `telegramId` → если есть: `answerCallbackQuery('Ты уже в списке ✓')` + `editMessageText` (текст «уже в списке»)
   - если нет: `prisma.moneyMkWaitlist.create({...})` → `answerCallbackQuery('Ты в списке ✓')` + `editMessageText` (текст подтверждения) → `notifyAdmin(...)` → `trackEvent({ event_type: 'moneymk_waitlist_join', utm_source: 'razreshenie_deneg' })`
   - `try/catch` → при ошибке `answerCallbackQuery('Что-то пошло не так, попробуй ещё раз')`

## Тексты (голосом Саши — собраны из его поста, утверждены 2026-06-01)

**Приглашение (по диплинку):**
```
{firstName}, ты почти в списке ⚡

«Разрешение быстрых денег» — 7 дней, на которых я прокачу тебя на своей энергии на новый уровень.

цель простая: помочь тебе перейти на ту сторону берега. где тебе можно проявляться и сиять. где можно получать любые деньги. где можно делать то, что ты хочешь.

это не курс и не информация — это экшн. стык коучинга и маркетинга, который сразу закрепляем на практике. три этапа: голова, инструменты, действие.

кто хочет быть в числе первых — жми 👇
```
Кнопка: `📌 Я в числе первых`

**После нажатия (новый):**
```
готово ⚡

ты в листе ожидания «Разрешение быстрых денег».

сейчас добиваю инфраструктуру и программу — как открою даты, напишу тебе одному из первых.
```

**Если уже в списке:**
```
ты уже в списке ✓

как открою даты — напишу одному из первых.
```

**Уведомление админу:**
```
📌 Новая запись в waitlist «Разрешение денег»

👤 {firstName lastName}
💬 @username
🆔 telegramId
```

## Деплой / миграция

- `prisma migrate` или `prisma db push` на Supabase `dprrznvwumvockukdbvw` (создать таблицу `money_mk_waitlist`)
- `vercel --prod` для quiz-app (Vercel-проект quizapp, webhook уже на `/api/telegram-webhook`)
- Проверка: открыть `t.me/testtoyzbot?start=razreshenie_deneg` → нажать кнопку → запись в БД + уведомление в админку

## Вне скоупа

- Кнопка в финале квиза (квиз ещё не написан)
- Рассылка по листу при открытии продаж (отдельная задача, как broadcast.js)
- Оплата/чекаут (пред-запуск, продаж пока нет)
