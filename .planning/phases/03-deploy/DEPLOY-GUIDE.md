# Deploy Guide: TheSasha Quiz

## 1. Vercel Deploy

### Option A: через GitHub (рекомендуется)

1. Запушить репозиторий на GitHub
2. Зайти на [vercel.com](https://vercel.com)
3. "Add New Project" → Import из GitHub
4. Выбрать репозиторий TheSasha
5. **Root Directory**: `quiz-app`
6. Vercel автоматически определит Next.js
7. Deploy

### Option B: через CLI

```bash
cd quiz-app
npm i -g vercel
vercel login
vercel --prod
```

## 2. Настройка домена thesasha.com

### В Vercel:
1. Project Settings → Domains
2. Add Domain: `thesasha.com`
3. Vercel покажет DNS записи

### В Reg.ru (DNS):
Добавить записи:
```
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

Подождать 5-30 минут для пропагации DNS.

## 3. Telegram Mini App

### Создать бота:
1. Открыть @BotFather в Telegram
2. `/newbot` → назвать бота
3. Сохранить токен

### Создать Mini App:
1. @BotFather → `/newapp`
2. Выбрать бота
3. Title: "Диагностика контента"
4. Description: "Узнайте ваш этап и получите персональный разбор"
5. Photo: загрузить 640x360 картинку
6. Web App URL: `https://thesasha.com`

### Добавить кнопку в боте:
1. @BotFather → `/mybots` → выбрать бота
2. Bot Settings → Menu Button
3. Или настроить inline кнопку в коде бота

## 4. Проверка

После деплоя проверить:

- [ ] https://thesasha.com открывается
- [ ] Квиз проходится от начала до конца
- [ ] В Telegram Mini App квиз работает
- [ ] user_id получается (проверить в console/логах)
- [ ] Callback отправляется после ключевого слова

## Environment Variables

Если нужен callback на внешний endpoint (не через Telegram sendData):

В Vercel → Project Settings → Environment Variables:
```
NEXT_PUBLIC_BOT_CALLBACK_URL=https://your-bot-api.com/quiz-callback
```

## Troubleshooting

### Mini App не открывается
- Проверить что URL в BotFather точно `https://thesasha.com`
- SSL должен работать (Vercel даёт автоматически)

### Шрифты не грузятся
- Google Fonts может быть заблокирован в некоторых регионах
- Fallback шрифты настроены в CSS

### sendData не работает
- sendData работает только в Telegram контексте
- Для веб-версии используется NEXT_PUBLIC_BOT_CALLBACK_URL
