# Архив: квиз «Эксперт-архетип»

**Заархивирован:** 2026-07-08
**Причина:** квиз больше не используется. Сохраняем целиком, чтобы в будущем можно было восстановить или собрать похожий квиз по этой же логике.
**Статус в живом коде:** к моменту архивации квиз уже был **отвязан от бота**. Дефолтный `/start` в `@testtoyzbot` давно переключён на quiz-money (см. `src/app/api/telegram-webhook/route.ts:759` — комментарий «старый квиз „Диагностика контента" убран»). Этот архив — снапшот квиз-части приложения, не тронутой при переключении.

> Эта папка исключена из сборки (`tsconfig.json` → `exclude: ["archive"]`), поэтому `.tsx`/`.ts` тут не компилируются и ничего не ломают.

---

## Что это было

Telegram Mini App внутри `@testtoyzbot`: бот слал кнопку `web_app`, открывался веб-квиз, человек отвечал на вопросы, получал один из 5 архетипов-результатов. Архетип писался в `users.quiz_result` (Supabase `dprrznvwumvockukdbvw`) и дальше использовался для персонализации follow-up и ленты кабинета.

### 5 архетипов (`Category` в `src/data/quiz.ts:2`)

| id | Заголовок | Реальных результатов в БД |
|----|-----------|---------------------------|
| `invisible` | Эксперт-невидимка | 12 |
| `doer` | Делатель без системы | 9 |
| `generous` | Щедрый эксперт | 0 |
| `unstable` | Нестабильные результаты | 2 |
| `scale` | Готовы к масштабированию | 0 |

Всего людей прошло квиз: **23** (из 949 в боте — квиз был слабым звеном воронки, отсюда и решение убрать).

### Поток (`src/app/page.tsx`)

`QuizState`: `welcome → quiz → result-preview → analyzing → result → payment-success`

1. **welcome** — стартовый экран.
2. **quiz** — вопросы (`questions` в `quiz.ts`), прогресс сохраняется в localStorage (`useQuizPersistence.ts`), чтобы можно было вернуться.
3. По последнему ответу: `calculateScores(answers)` → `determineResult(...)` → архетип.
4. **result-preview** → гейт подписки на канал (`/api/check-subscription`) → **analyzing** (лоадер) → **result**.
5. **result** — экран архетипа (`components/results/<Archetype>Result.tsx`) с визуализациями (`components/charts/*`: радар, гейдж, донат, путь уровней).
6. Трекинг: `trackQuizComplete` (`useTracking.ts`) шлёт `event_type: 'quiz_complete'` с `result_id` на `/api/track-event`.

### Скоринг (`src/data/quiz.ts`)

- `scoringRules: Record<number, number[][]>` — по каждому вопросу баллы в разные категории.
- `calculateScores(answers)` — суммирует баллы по категориям.
- `determineResult(answers, scores)` — берёт топ-категорию. **Спец-правило для `scale`:** нужно 40+ баллов И ответ 4 (index 3) на вопросы 1, 2 и 8 (`quiz.ts:266-267`), иначе не выдаётся.

---

## Что лежит в архиве

Пути сохранены относительно корня проекта (`src/...`), чтобы восстановление было копированием обратно.

**Ядро квиза:**
- `src/app/page.tsx` — корневая страница = сам квиз (welcome → quiz → result).
- `src/data/quiz.ts` — вопросы, `scoringRules`, `calculateScores`, `determineResult`, 5 архетипов.
- `src/hooks/useQuizPersistence.ts` — сохранение прогресса в localStorage.
- `src/hooks/useTracking.ts` — трекинг (⚠️ **общий** с quiz-money; в живом коде НЕ удалять, тут копия для контекста).

**Экраны результатов:**
- `src/components/results/{Invisible,Doer,Generous,Unstable,Scale}Result.tsx`
- `src/components/results/shared/*` — переиспользуемые блоки результата (Hero, CTA, StatsGrid, BeforeAfter, CaseStudy и т.д.).

**Визуализации:**
- `src/components/charts/*` — RadarChart, FinancialGauge, AudienceDonut, LevelPath, LevelBadge.

**Follow-up по архетипу:**
- `src/data/followup-messages.ts` — тексты под каждый архетип.
- `src/app/api/send-followup/route.ts` — отправка.

**Гейт результата:**
- `src/app/api/check-subscription/route.ts` — проверка подписки на канал перед показом результата.

---

## Зависимости в живом коде (НЕ в архиве — они общие/живые, смотри git-историю)

Эти места **связаны** с квизом, но их трогать при архивации не стали, потому что они общие или в проде:

- `src/lib/notion.ts` (~строки 86-98) — единственная **запись** `quiz_result`: `prisma.user.update({ data: { quizResult: payload.result_id } })` при `event_type === 'quiz_complete'`.
- `src/app/api/track-event/route.ts` — принимает событие `quiz_complete` с `result_id`.
- `prisma/schema.prisma` — `quizResult String? @map("quiz_result")` в модели `User` (колонка в БД, оставлена на месте).
- `src/app/api/telegram-webhook/route.ts` — раньше слал кнопку квиза на `/start`; сейчас default → quiz-money.
- Кабинет (`src/app/cabinet/*`) — читал архетип для персонализации ленты; работает и без него (fallback на дефолт, у 926/949 архетипа нет).

---

## Как восстановить квиз

1. Скопировать файлы из этого архива обратно по их путям (`archive/quiz-archetype/src/...` → `src/...`).
2. Вернуть кнопку-вход в `telegram-webhook/route.ts` (web_app на корень `WEBAPP_URL` или отдельный deep-link).
3. Колонка `users.quiz_result` и запись в `notion.ts` на месте — трогать не нужно.
4. Проверить `useTracking.ts` / `track-event` — если менялись, свериться с архивной копией.
5. `npm run build` → проверить, что все импорты (`@/components/results/*`, `@/components/charts/*`, `@/data/quiz`) резолвятся.

## Как переиспользовать логику для нового квиза

Скелет универсальный: `quiz.ts` (данные + скоринг) → `page.tsx` (машина состояний) → `results/*` (экраны) → `charts/*` (виз). Для нового квиза меняются `scoringRules`/`questions`/`results` и компоненты результатов; каркас состояний и персистентность остаются.

---

## Что НЕ входит (соседние квизы — живые, не путать)

- **quiz-money** (`src/app/quiz-money/`, `src/data/quiz-money.ts`) — квиз МК «Разрешение быстрых денег». Пишет в `money_mk_waitlist`, `result_id` в `users.quiz_result` НЕ шлёт. **Живой.**
- `Projects/brand-quiz`, `Projects/car-quiz-bot`, катин квиз — отдельные проекты.
