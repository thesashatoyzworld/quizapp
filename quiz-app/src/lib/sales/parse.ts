// Разбор обращения к помощнику. Отдельным модулем и без зависимостей:
// его дёргают и бот, и проверочный прогон, а тащить ради регулярки Prisma
// незачем.

/** «@nick», «/w nick», «что писать @nick» → ник. Иначе null. */
export function parseHandle(text: string): string | null {
  const t = text.trim();

  const slash = t.match(/^\/w(?:hat)?(?:@\w+)?\s+@?([A-Za-z0-9._]{2,64})\s*$/i);
  if (slash) return slash[1];

  // Одинокий ник: «@nedosek_coach» и ничего больше.
  const bare = t.match(/^@([A-Za-z0-9._]{2,64})$/);
  if (bare) return bare[1];

  // «что писать @nick», «@nick что дальше» — ник есть, вокруг пара слов.
  if (t.length <= 80) {
    const inline = t.match(/@([A-Za-z0-9._]{2,64})/);
    if (inline) return inline[1];
  }

  return null;
}
