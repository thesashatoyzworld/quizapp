/**
 * Строка tg_business_msg для сообщения, ушедшего от имени рабочего аккаунта.
 *
 * Без Prisma, чтобы правило «наша отправка пишется стороной us» проверялось
 * тестом. Ключ тот же, что у апдейта business_message: апдейт, пришедший
 * следом, отвалится на дубле, а не ляжет вторым таким же сообщением.
 */
export function outgoingRow(
  chatId: string,
  sent: { message_id: number; date: number },
  text: string,
  known: { username: string | null; name: string | null; leadId: number | null } | null,
) {
  return {
    id: `${chatId}:${sent.message_id}`,
    chatId,
    side: 'us' as const,
    username: known?.username ?? null,
    name: known?.name ?? null,
    text,
    leadId: known?.leadId ?? null,
    createdAt: new Date(sent.date * 1000),
  };
}
