# TheSasha Quiz MVP

AI-диагност контента — квиз для определения этапа развития эксперта.

## Features

- 8 вопросов с 4 вариантами ответа
- 5 результатов (этапов) с персональными текстами
- Cyberpunk дизайн (Orbitron, neon glow, HUD corners)
- Telegram Mini App интеграция
- Callback с user_id и результатом

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS v4
- Telegram WebApp SDK

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Telegram Mini App

Квиз автоматически определяет Telegram контекст:
- В Telegram: получает user_id, отправляет данные через `sendData()`
- В браузере: работает как обычный сайт

### Telegram Integration

Хук `useTelegram` (`src/hooks/useTelegram.ts`):
- `userId` — ID пользователя из Telegram
- `isTelegramContext` — запущено ли в Telegram
- `sendCallback(data)` — отправить результат квиза

### Callback Data

```typescript
{
  user_id: number | null,  // Telegram user ID
  result_id: string,       // "nevidimka", "delatel", etc.
  stage: number,           // 1-5
  keyword: string,         // "ВИДИМОСТЬ", "ФОКУС", etc.
  timestamp: number        // Unix timestamp
}
```

## Deploy

See: `.planning/phases/03-deploy/DEPLOY-GUIDE.md`

## Project Structure

```
quiz-app/
├── src/
│   ├── app/
│   │   ├── globals.css    # Cyberpunk styles
│   │   ├── layout.tsx     # Root layout with fonts
│   │   └── page.tsx       # Quiz component
│   ├── data/
│   │   └── quiz.ts        # Questions, scoring, results
│   └── hooks/
│       └── useTelegram.ts # Telegram WebApp hook
└── .env.example           # Environment variables
```
