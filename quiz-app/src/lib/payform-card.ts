import type { NextRequest } from 'next/server';

// Какой картой платит человек: ?card=world на ссылке оплаты.
//
// Российская карта — форма Продамуса как есть. Фильтровать её нельзя: список
// способов срезает рассрочки (Т-Банк, Сбер, Сплит и ещё шесть), а их обещает
// лендинг курса.
//
// Зарубежная — та же форма, но сразу с одними зарубежными способами, чтобы
// человек не искал вкладку. Коды из справки Продамуса; какие из них включены
// на аккаунте, форма решает сама и лишние молча отбрасывает (проверено 24.09:
// остаются Visa/Mastercard USD, EUR и Белкарт BYN).
//
// ⚠️ Только для разовых товаров: Продамус не ставит зарубежную карту
// на подписку, поэтому тарифы с карточкой подписки фильтр не получают.
const WORLD_METHODS = [
  'ACUSDGTL', 'ACEURGTL', 'ACBYNGTL', 'ACUSDKB', 'ACEURKB', 'monetaworld', 'ACf', 'ACkz',
].join('|');

export type Card = 'ru' | 'world';

export function readCard(request: NextRequest): Card {
  return request.nextUrl.searchParams.get('card') === 'world' ? 'world' : 'ru';
}

/** Поля формы под выбранную карту: пусто для российской. */
export function cardFields(card: Card): Record<string, string> {
  return card === 'world' ? { available_payment_methods: WORLD_METHODS } : {};
}
