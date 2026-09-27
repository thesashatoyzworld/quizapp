// Отправка писем через Resend (REST, без SDK).
//
// Нужна там, где кроме почты у нас ничего нет: оплата картой с сайта приходит
// без Telegram, и если человек не вернулся со страницы Продамуса, бот ему
// написать не может. Без RESEND_API_KEY отправка молча пропускается — письмо
// не должно ронять вебхук оплаты.

const RESEND_URL = 'https://api.resend.com/emails';
const FROM = process.env.MAIL_FROM || 'Саша Тойз <sasha@thesashatoyz.com>';

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[Mail] RESEND_API_KEY not set, skip', opts.subject);
    return false;
  }
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html, text: opts.text }),
    });
    if (!res.ok) {
      console.error('[Mail] Resend failed', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (e) {
    console.error('[Mail] Resend error', e);
    return false;
  }
}

export function isEmail(s: string | null | undefined): s is string {
  return !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
