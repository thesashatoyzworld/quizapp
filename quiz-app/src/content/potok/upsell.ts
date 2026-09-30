// ─────────────────────────────────────────────────────────────
// Апсейл с «Потока Спроса» на курс «Новый Уровень Контента».
//
// Покупателю трипвайра 1 490 засчитываются в курс (/pay/dop, доплата разницы),
// но только семь дней. Отсчёт идёт от открытия доступа (30.09.2026) или от
// покупки, если она позже. После срока кнопки ведут на полный тариф 1.
//
// Срок проверяет сервер: /pay/dop с ?u=<tgId> после дедлайна отправляет на
// /pay/t1, так что таймер на странице не декорация.
// ─────────────────────────────────────────────────────────────

import { POTOK_PRICE } from '@/lib/catalog';
import { prices } from '@/content/prices';

/** День, когда покупателям открыли ветку: у всех, кто купил раньше, отсчёт отсюда. */
export const POTOK_OPEN_AT = new Date('2026-09-30T00:00:00+03:00');
export const DISCOUNT_DAYS = 7;

const PAY = 'https://world.thesashatoyz.com/pay';

export function discountDeadline(grantedAt: Date): Date {
  const from = grantedAt > POTOK_OPEN_AT ? grantedAt : POTOK_OPEN_AT;
  return new Date(from.getTime() + DISCOUNT_DAYS * 24 * 60 * 60 * 1000);
}

export interface PotokOffer {
  /** ISO; пусто — скидка сгорела, предлагаем курс по полной цене */
  deadline: string;
  /** сколько платить сейчас */
  price: number;
  /** полная цена курса, для зачёркивания */
  full: number;
  /** куда ведёт кнопка */
  href: string;
}

/**
 * Предложение для покупателя «Потока». null — предлагать нечего: у человека
 * нет роли potok или курс у него уже есть.
 */
export function potokOffer(
  rows: { role: string; productSlug: string; grantedAt: Date }[],
  telegramId: number | null,
  now = new Date(),
): PotokOffer | null {
  if (rows.some((r) => r.role === 'uroven')) return null;
  const potok = rows.filter((r) => r.role === 'potok').sort((a, b) => a.grantedAt.getTime() - b.grantedAt.getTime())[0];
  if (!potok) return null;

  const full = prices(now).t1;
  const u = telegramId ? `u=${telegramId}&` : '';
  const deadline = discountDeadline(potok.grantedAt);
  if (now < deadline) {
    return { deadline: deadline.toISOString(), price: full - POTOK_PRICE, full, href: `${PAY}/dop?${u}src=potok-cab` };
  }
  return { deadline: '', price: full, full, href: `${PAY}/t1?${u}src=potok-cab` };
}

const rub = (n: number) => n.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

/**
 * Где в ветке встаёт призыв и что он говорит. Текст привязан к шагу: человек
 * только что прочитал про это и видит, чего в методе нет, а в курсе есть.
 */
export const STEP_CTA: Record<string, string> = {
  kriteriy:
    '<p>Если вы хотите, чтобы ваш контент не просто набирал просмотры, а приводил к вам клиентов - как это сделать, я показываю в «Новом Уровне Контента»</p>',
  neyronka:
    '<p>Если вы хотите делать это с телефона и вообще поставить на автопилот, чтобы каждое утро вам приходили рабочие заходы - как это сделать, я показываю в «Новом Уровне Контента»</p>',
  dokrutka:
    '<p>Если вы сделали все, что я тут говорю, и чувствуете:</p>' +
    '<ul><li>сопротивление</li><li>нехватку времени</li><li>отсутствие клиентов</li></ul>' +
    '<p>и в целом работа с контентом вас раздражает - как это исправить, я показываю в курсе «Новый Уровень Контента»</p>',
};

/** Блок призыва для статьи шага (iframe). Таймер считает на клиенте до deadline. */
export function stepCtaHtml(stepKey: string, offer: PotokOffer): string {
  const t = STEP_CTA[stepKey];
  if (!t) return '';
  const live = !!offer.deadline;
  const price = live
    ? `<div class="pcta-price"><s>${rub(offer.full)}</s> <b>${rub(offer.price)}</b></div>` +
      `<div class="pcta-note">1 490 ₽ за «Поток» уже зачтены</div>`
    : `<div class="pcta-price"><b>${rub(offer.full)}</b></div>`;
  const timer = live
    ? `<div class="pcta-timer" data-deadline="${esc(offer.deadline)}">скидка сгорит через <span>…</span></div>`
    : '';
  return `<section class="pcta">
<div class="pcta-k">Новый Уровень Контента</div>
${t}
${price}
<a class="pcta-btn" href="${esc(offer.href)}" target="_blank" rel="noopener" data-cta="${esc(stepKey)}">Забрать курс за ${rub(offer.price)}</a>
${timer}
</section>`;
}

export const STEP_CTA_CSS = `<style>
.pcta{margin:44px 0 10px;padding:24px 22px 22px;border:2px solid #000;background:#fff;box-shadow:6px 6px 0 #e8590c;}
.pcta-k{font-family:"Courier New",Courier,monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#c94f0a;font-weight:bold;margin-bottom:8px;}
.pcta h2{margin:0 0 10px;font-size:1.35em;line-height:1.2;}
.pcta p{margin:0 0 12px;}
.pcta ul{margin:0 0 12px;}
.pcta p:last-of-type{margin-bottom:16px;}
.pcta-price{font-size:1.5em;font-weight:bold;line-height:1.1;}
.pcta-price s{color:#999;font-weight:normal;font-size:.7em;margin-right:6px;}
.pcta-note{font-size:14px;color:#666;margin:4px 0 16px;}
.pcta-btn{display:block;text-align:center;background:#c94f0a;color:#fff !important;text-decoration:none;font-weight:bold;padding:15px 18px;border:2px solid #000;margin-top:14px;}
.pcta-btn:hover{background:#000;}
.pcta-timer{margin-top:12px;font-family:"Courier New",Courier,monospace;font-size:14px;text-align:center;color:#c94f0a;}
.pcta-timer span{font-weight:bold;}
@media(max-width:600px){.pcta{padding:20px 16px 18px;box-shadow:4px 4px 0 #e8590c;}}
</style>`;

/** Тикер для всех .pcta-timer на странице; по нулю прячет таймер и зачёркнутую цену не трогает. */
export const STEP_CTA_JS = `<script>(function(){
var els=[].slice.call(document.querySelectorAll('.pcta-timer'));if(!els.length)return;
function p(n){return n<10?'0'+n:''+n}
function tick(){els.forEach(function(el){var d=new Date(el.getAttribute('data-deadline')).getTime()-Date.now();
if(d<=0){el.textContent='скидка сгорела';return;}
var s=Math.floor(d/1000),dd=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),ss=s%60;
el.querySelector('span').textContent=(dd?dd+' д ':'')+p(h)+':'+p(m)+':'+p(ss);});}
tick();setInterval(tick,1000);})();</script>`;
