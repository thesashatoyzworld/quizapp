// Общая логика карты для кабинета и для предпросмотра в админке.

interface StepLike { position: number; status: string }

/**
 * Ступень, на которой человек стоит.
 *
 * Сначала ищем заблокированную: именно она и есть «мы здесь», даже если
 * предыдущая ступень пройдена наполовину. Если блокера нет, стоим на первой
 * незакрытой. Все закрыты — подсвечивать нечего.
 */
export function currentStepPosition(steps: StepLike[]): number | null {
  const blocked = steps.find((s) => s.status === 'blocked');
  if (blocked) return blocked.position;
  return steps.find((s) => s.status !== 'done')?.position ?? null;
}
