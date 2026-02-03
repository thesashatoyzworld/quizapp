# Quiz Design Lessons Learned

**Создан:** 2026-02-01
**Проект:** TheSasha Quiz MVP
**Цель:** Не повторять ошибки в будущих проектах

---

## Главное правило

> **ВСЕГДА смотри референс (SlideForge презентации) ПЕРЕД началом работы, а не после.**

Путь к референсам: `C:\Users\OTVAJE\Documents\ClaudeCode\Projects\SlideForge\output\`

---

## Ошибки и исправления

### 1. Порядок импортов CSS

**❌ НЕПРАВИЛЬНО:**
```css
@import url('https://fonts.googleapis.com/...');
@import "tailwindcss";
```

**✅ ПРАВИЛЬНО:**
Google Fonts загружать через HTML `<link>` в layout.tsx:
```tsx
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet" />
</head>
```

**Причина:** В Tailwind v4 @import для шрифтов после @import "tailwindcss" вызывает предупреждение.

---

### 2. @theme inline не работает в Tailwind v4

**❌ НЕПРАВИЛЬНО:**
```css
@theme inline {
  --color-neon-cyan: var(--neon-cyan);
  --font-display: 'Orbitron', sans-serif;
}
```

**✅ ПРАВИЛЬНО:**
Определять переменные в `:root` и использовать напрямую:
```css
:root {
  --neon-cyan: #00f0ff;
  --font-display: 'Orbitron', sans-serif;
}

.title {
  font-family: var(--font-display);
  color: var(--neon-cyan);
}
```

---

### 3. Scanlines opacity

**❌ НЕПРАВИЛЬНО:** opacity 0.25-0.3 — слишком заметно
**✅ ПРАВИЛЬНО:** opacity 0.15 — как в SlideForge

```css
.scanlines {
  opacity: 0.15; /* НЕ 0.25 или 0.3 */
}
```

---

### 4. Grid-фон opacity

**❌ НЕПРАВИЛЬНО:** opacity 0.08 — слишком яркий
**✅ ПРАВИЛЬНО:** opacity 0.03 — еле заметный, как в SlideForge

```css
.grid-bg {
  background-image:
    linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
}
```

---

### 5. HUD corners glow

**❌ НЕПРАВИЛЬНО:** box-shadow 20-40px — слишком яркий
**✅ ПРАВИЛЬНО:** box-shadow 8px — тонкий glow

```css
.hud-corner::before,
.hud-corner::after {
  box-shadow: 0 0 8px var(--neon-cyan); /* НЕ 20px или 40px */
}
```

---

### 6. text-secondary opacity

**❌ НЕПРАВИЛЬНО:** rgba(255, 255, 255, 0.6)
**✅ ПРАВИЛЬНО:** rgba(255, 255, 255, 0.7)

```css
:root {
  --text-secondary: rgba(255, 255, 255, 0.7); /* НЕ 0.6 */
}
```

---

### 7. 8pt Grid Spacing System

**❌ НЕПРАВИЛЬНО:** Произвольные значения (10px, 15px, 20px)
**✅ ПРАВИЛЬНО:** Использовать 8pt grid

```css
:root {
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 32px;
  --space-xl: 48px;
  --space-2xl: 64px;
}

.element {
  padding: var(--space-md);  /* НЕ padding: 20px */
  margin-bottom: var(--space-lg);  /* НЕ margin-bottom: 30px */
}
```

---

### 8. Glow Spheres для атмосферы

**❌ НЕПРАВИЛЬНО:** Только grid + scanlines
**✅ ПРАВИЛЬНО:** Добавить размытые сферы

```css
.glow-sphere {
  position: fixed;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  z-index: 0;
}

.glow-sphere-1 {
  background: var(--neon-cyan);
  width: 400px;
  height: 400px;
  top: -150px;
  right: -100px;
  opacity: 0.1;
}

.glow-sphere-2 {
  background: var(--neon-magenta);
  width: 300px;
  height: 300px;
  bottom: -100px;
  left: 20%;
  opacity: 0.08;
}
```

---

### 9. Центрирование контента

**❌ НЕПРАВИЛЬНО:** Контент прижат к углу, "скукожен"
```css
.container {
  padding: 20px;
}
```

**✅ ПРАВИЛЬНО:** Flex center как в SlideForge
```css
.quiz-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--space-xl);
}

.quiz-content {
  width: 100%;
  max-width: 950px;
  text-align: center;
}
```

---

### 10. Кнопки — градиент + shine

**❌ НЕПРАВИЛЬНО:** Просто border с glow
```css
.btn-neon {
  background: transparent;
  border: 2px solid var(--neon-cyan);
}
```

**✅ ПРАВИЛЬНО:** Градиентный фон + shine анимация
```css
.btn-neon {
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-magenta));
  color: var(--bg-primary);
  border: none;
}

.btn-neon::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: btnShine 2s infinite;
}
```

---

### 11. Анимация появления — с blur

**❌ НЕПРАВИЛЬНО:** Просто opacity + translateY
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**✅ ПРАВИЛЬНО:** Добавить blur для cyberpunk эффекта
```css
@keyframes cyberFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
    filter: blur(8px);  /* ВАЖНО */
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}
```

---

### 12. Staggered анимации

**❌ НЕПРАВИЛЬНО:** Один класс для всех элементов
**✅ ПРАВИЛЬНО:** Классы с задержкой

```css
.animate-1 { animation: cyberFadeIn 0.5s ease 0.1s both; }
.animate-2 { animation: cyberFadeIn 0.5s ease 0.2s both; }
.animate-3 { animation: cyberFadeIn 0.5s ease 0.3s both; }
.animate-4 { animation: cyberFadeIn 0.5s ease 0.4s both; }
.animate-5 { animation: cyberFadeIn 0.5s ease 0.5s both; }
```

---

### 13. Title с градиентом

**❌ НЕПРАВИЛЬНО:** Просто цвет
```css
.title { color: var(--neon-cyan); }
```

**✅ ПРАВИЛЬНО:** Градиент + drop-shadow
```css
.title-xl {
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--neon-cyan) 50%, var(--neon-magenta) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 30px var(--glow-cyan));
}
```

---

### 14. Title-line разделитель

SlideForge использует линию-разделитель после заголовка:

```css
.title-line {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-magenta));
  margin: var(--space-md) auto;
  box-shadow: 0 0 15px var(--glow-cyan);
}
```

---

### 15. Option buttons — левый border

**❌ НЕПРАВИЛЬНО:** Полный border вокруг
**✅ ПРАВИЛЬНО:** Только левый border 3px как accent

```css
.btn-option {
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-left: 3px solid var(--neon-cyan);
}

.btn-option:hover {
  border-left-color: var(--neon-magenta);
}
```

---

### 16. Card с левым gradient border

```css
.card {
  position: relative;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--neon-cyan), var(--neon-magenta));
}
```

---

## Чеклист перед началом работы над Cyberpunk UI

- [ ] Посмотрел SlideForge презентации как референс
- [ ] Использую 8pt grid spacing
- [ ] Шрифты через HTML `<link>`, не CSS @import
- [ ] Scanlines opacity 0.15
- [ ] Grid-фон opacity 0.03
- [ ] HUD glow 8px
- [ ] Glow spheres добавлены
- [ ] Центрирование через flex
- [ ] Анимации с blur(8px)
- [ ] Titles с градиентом
- [ ] Кнопки с shine эффектом

---

## Референсы

| Файл | Что посмотреть |
|------|----------------|
| `SlideForge/output/expert-nevidimka.html` | Полный пример Cyberpunk UI |
| `SlideForge/.knowledge/visual-dna.md` | Спецификация дизайн-системы |
| `TheSasha/.knowledge/visual-dna.md` | Копия для этого проекта |

---

*Обновлено: 2026-02-01*
