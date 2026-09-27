// Письмо после оплаты картой с сайта: «оплата дошла, зайди в бота».
//
// Зачем: 25–26.09 трое из пяти покупателей с сайта не вернулись со страницы
// Продамуса (СБП в приложении банка, Яндекс Сплит, закрытая вкладка) и не
// привязали оплату к Telegram. Бот им написать не может, почта — единственный
// канал. Первое письмо уходит сразу из вебхука, напоминание через час, если
// оплата так и не привязана (/api/paid-reminder).

import { sendMail } from './mail';

const BOT = 'https://t.me/testtoyzbot';
// «Поток Спроса» продаётся предзаказом, материалы открываются 30.09.
const POTOK_OPENS = new Date('2026-09-30T00:00:00+03:00');

export type PaidEmailKind = 'first' | 'reminder';

export async function sendPaidEmail(opts: {
  kind: PaidEmailKind;
  to: string;
  token: string;
  productSlug: string;
  productName: string;
}): Promise<boolean> {
  const { kind, to, token, productSlug, productName } = opts;
  const link = `${BOT}?start=paid_${token}`;
  const isPotok = productSlug === 'potok-sprosa';

  const subject =
    kind === 'first'
      ? `${productName}: оплата прошла, остался один шаг`
      : `${productName}: доступ ещё не привязан`;

  const lines: string[] =
    kind === 'first'
      ? [
          'Привет! Это Саша. Оплата прошла, спасибо.',
          'Остался один шаг: открой бота по ссылке ниже. Он привяжет оплату к твоему Telegram, и доступ придёт туда.',
        ]
      : [
          'Привет! Это Саша. Оплата у меня есть, а в бота ты пока не зашёл, поэтому доступ в Telegram не открыт.',
          'Это займёт полминуты: нажми на ссылку ниже, бот сам привяжет оплату.',
        ];

  if (isPotok) {
    if (Date.now() < POTOK_OPENS.getTime()) {
      lines.push('Материалы открываются 30 сентября, бот пришлёт, как только всё будет готово.');
    }
    lines.push('Сразу учти: для метода нужен компьютер, с телефона он не работает.');
  }
  lines.push('Если ссылка не открывается, просто ответь на это письмо.');

  const text = [lines[0], lines[1], link, ...lines.slice(2)].join('\n\n');

  const p = (s: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#111">${s}</p>`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:520px">
${p(lines[0])}
${p(lines[1])}
<p style="margin:24px 0"><a href="${link}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 22px;border-radius:8px;font-size:16px;font-weight:600">Открыть доступ в Telegram</a></p>
${lines.slice(2).map(p).join('\n')}
<p style="margin:24px 0 0;font-size:13px;color:#777">Ссылка на бота: <a href="${link}" style="color:#777">${link}</a></p>
</div>`;

  return sendMail({ to, subject, html, text });
}
