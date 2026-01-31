# Phase 1 Plan: Quiz Web App

## Goal
Рабочий квиз на локалхосте с Cyberpunk дизайном

## Tasks

### 1. Project Setup
- [ ] Initialize Next.js with TypeScript
- [ ] Configure Tailwind with Cyberpunk colors from visual-dna
- [ ] Add Google Fonts (Orbitron, Exo 2)

### 2. Quiz Data
- [ ] Create quiz questions data (8 questions, 4 options each)
- [ ] Create scoring logic (5 categories)
- [ ] Create results data (5 stages with texts)

### 3. Quiz Components
- [ ] Welcome screen with "Готовы?" prompt
- [ ] Question component (shows question + 4 options)
- [ ] Progress indicator (Question X of 8)
- [ ] Result screen with stage info
- [ ] Keyword input form

### 4. Quiz Logic
- [ ] State management for answers
- [ ] Score calculation per category
- [ ] Result determination (max score category)
- [ ] Special rule for "Масштаб" (40+ AND answers 4 on Q1,2,8)

### 5. Cyberpunk Styling
- [ ] Dark purple background (#0a0612)
- [ ] Neon accents (cyan, magenta)
- [ ] HUD corners
- [ ] Scanlines overlay
- [ ] Neon glow on buttons
- [ ] Orbitron for headings

## Success Criteria
1. ✓ Можно пройти квиз от начала до результата
2. ✓ Баллы считаются правильно по всем 5 категориям
3. ✓ Показывается правильный результат
4. ✓ Cyberpunk дизайн
5. ✓ Ключевое слово можно ввести

## Artifacts
- `package.json` — dependencies
- `tailwind.config.ts` — custom theme
- `src/app/page.tsx` — main quiz page
- `src/data/quiz.ts` — questions, scoring, results
- `src/components/` — Quiz components
