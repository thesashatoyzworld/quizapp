/** Отбор слов вопроса для поиска похожих. Без базы, чтобы проверялось тестом. */

/** Слишком частое слово не отличает один ответ от другого. */
const COMMON_SHARE = 0.06;
const MAX_TERMS = 12;

/**
 * Запрос «любое из редких слов»: строгое «все слова сразу» почти никогда не
 * находит пару, а редкие слова и так задают тему. Чище всего работает с
 * основами, которые Postgres сам выделяет из текста вопроса.
 */
export function pickTerms(lexemes: string[], df: Map<string, number>, total: number): string[] {
  const limit = Math.max(3, total * COMMON_SHARE);
  return [...new Set(lexemes)]
    .filter((w) => /^[а-яёa-z]{3,}$/.test(w))
    .map((w) => [w, df.get(w) ?? 0] as const)
    .filter(([, n]) => n >= 1 && n <= limit)
    .sort((a, b) => a[1] - b[1])
    .slice(0, MAX_TERMS)
    .map(([w]) => w);
}
