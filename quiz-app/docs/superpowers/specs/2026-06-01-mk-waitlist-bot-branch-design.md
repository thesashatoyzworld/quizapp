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

## Тексты (черновик голосом Саши — финал правит Саша в одном месте)

**Приглашение (по диплинку):**
```
привет, {firstName} ⚡

я собираю мастеркласс «Разрешение быстрых денег».

про то, почему деньги застревают не в стратегии и не в нише — а в тебе. в блоке, который ты обычно не замечаешь: пашешь до выгорания за копейки или не можешь взять деньги за своё.

на мастерклассе разбираем, как этот блок снять — чтобы деньги шли легко, а не через боль.

дат пока нет, добиваю программу. запишись в лист ожидания — напишу первым, как только открою места 👇
```
Кнопка: `📌 В лист ожидания`

**После нажатия (новый):**
```
готово ⚡

ты в листе ожидания «Разрешение быстрых денег». как открою даты и места — напишу первым, раньше остальных.
```

**Если уже в списке:**
```
ты уже в списке ✓

как появятся новости — напишу первым.
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
