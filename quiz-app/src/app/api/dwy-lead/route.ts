import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  buildDwyMessage, normalizeTelegramUsername, normalizePhone,
  normalizeInstagram, type DwyLeadInput, type DwyPrior,
} from '@/lib/dwy-message';
import { isDwyKind, DWY_MODES } from '@/content/dwy';
import { matchFormFilled } from '@/lib/ig-leads';

export const runtime = 'nodejs';
export const maxDuration = 30;

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Telegram-логина здесь нет намеренно: виджет в мобильном браузере не видит
// сессию из приложения и гонит человека на oauth.telegram.org вводить номер.
// С холодного трафика из шапки профиля на этом отваливалось большинство.
// Личность не верифицируем — Саша всё равно читает каждую анкету глазами.

/** Метка проверочного скрипта: такие анкеты пишем, но Саше не показываем. */
const VERIFY_SOURCE = 'verify-script';

/** Режем длину: поля свободные, а таблица не должна пухнуть от вставленной простыни. */
const CAP = 2000;
function cap(v: unknown): string {
  return String(v ?? '').trim().slice(0, CAP);
}

/** Пустое поле — это null, а не пустая строка: в базе их потом не различить. */
function optional(v: unknown): string | null {
  const s = cap(v);
  return s || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers, source, kind: rawKind } = body ?? {};

    // Неизвестный режим не роняем в 400: анкета всё равно ценна, просто
    // считаем её менторством — как было до листов ожидания.
    const kind = isDwyKind(rawKind) ? rawKind : 'mentor';
    const mode = DWY_MODES[kind];

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'bad payload' }, { status: 400 });
    }

    // Что обязательно — решает режим. У менторства это девять вопросов,
    // у листа ожидания только имя и контакт: человек просит напомнить
    // о наборе, а не проходит отбор.
    for (const field of mode.required) {
      if (!cap(answers[field])) {
        return NextResponse.json({ error: `missing field: ${field}` }, { status: 400 });
      }
    }

    const contact = cap(answers.contact);
    if (contact.length < 3) {
      return NextResponse.json({ error: 'bad contact' }, { status: 400 });
    }

    // Уровень проверяем, только если он вообще пришёл: в листе ожидания
    // его могли не трогать.
    const rawLevel = cap(answers.level);
    let level: number | null = null;
    if (rawLevel) {
      const n = Number(rawLevel);
      if (!Number.isInteger(n) || n < 1 || n > 6) {
        return NextResponse.json({ error: 'bad level' }, { status: 400 });
      }
      level = n;
    }

    // Телефон и инстаграм необязательны нигде. Кривой ввод не отбиваем:
    // потерять лид из-за формата хуже, чем показать Саше строку как есть.
    const phone = optional(answers.phone);
    const instagram = optional(answers.instagram);

    const lead: DwyLeadInput = {
      name: cap(answers.name),
      contact,
      username: normalizeTelegramUsername(contact),
      phone: phone ? normalizePhone(phone) : null,
      instagram,
      instagramHandle: instagram ? normalizeInstagram(instagram) : null,
      kind,
      who: optional(answers.who),
      hasProduct: optional(answers.hasProduct),
      product: optional(answers.product),
      level,
      tried: optional(answers.tried),
      want: optional(answers.want),
      income: optional(answers.income),
      hours: optional(answers.hours),
      source: typeof source === 'string' && source ? source.slice(0, 64) : 'direct',
    };

    // Потоки сходятся в одну таблицу, поэтому один и тот же человек может
    // прийти дважды — сначала в лист ожидания, потом на менторство. Ищем
    // прошлую анкету, чтобы Саша видел это сразу, а не встречал знакомого
    // как незнакомца. Ошибка поиска не должна мешать приёму лида.
    const prior = await findPrior(lead).catch((e) => {
      console.error('[dwy-lead] prior lookup failed', e);
      return null;
    });

    // Лид пишем первым. Он не должен теряться, что бы ни случилось с Telegram.
    await prisma.dwyLead.create({
      data: {
        telegramId: null,
        username: lead.username,
        firstName: lead.name,
        who: lead.who,
        hasProduct: lead.hasProduct,
        product: lead.product,
        level: lead.level,
        tried: lead.tried,
        want: lead.want,
        income: lead.income,
        hours: lead.hours,
        contact: lead.contact,
        phone: lead.phone,
        instagram: lead.instagramHandle ? `@${lead.instagramHandle}` : lead.instagram,
        kind: lead.kind,
        source: lead.source,
      },
    });

    // Человек мог прийти из инстаграмной воронки — там ему сразу проставится
    // «анкета, не писать», чтобы ассистент не пошёл писать тому, кто уже
    // оставил заявку. Молча: на приём анкеты это влиять не должно.
    after(async () => {
      try {
        await matchFormFilled();
      } catch (e) {
        console.error('[dwy-lead] отметка в разделе Инстаграм не прошла', e);
      }
    });

    // Уведомление уходит ПОСЛЕ ответа клиенту: на мобилке в Instagram WebView
    // ожидание Telegram роняло форму по таймауту.
    after(async () => {
      // Прогон verify-dwy.mjs бьёт по живому эндпоинту (в том числе на превью,
      // где токен боевой) — Саше от него прилетал десяток тестовых анкет.
      if (lead.source === VERIFY_SOURCE) return;
      if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
        console.error('[dwy-lead] BOT_TOKEN / ADMIN_CHAT_ID не заданы — уведомление не ушло');
        return;
      }
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 10000);
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            text: buildDwyMessage(lead, prior),
            parse_mode: 'HTML',
            link_preview_options: { is_disabled: true },
          }),
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (!res.ok) {
          console.error('[dwy-lead] sendMessage failed', res.status, await res.text().catch(() => ''));
        }
      } catch (e) {
        console.error('[dwy-lead] sendMessage threw', e);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[dwy-lead] handler error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}

/**
 * Прошлая анкета того же человека. Узнаём по юзернейму, телефону или
 * по контакту слово-в-слово — этого хватает, точную склейку личностей
 * тут не строим.
 */
async function findPrior(lead: DwyLeadInput): Promise<DwyPrior | null> {
  const or = [
    lead.username ? { username: lead.username } : null,
    lead.phone ? { phone: lead.phone } : null,
    { contact: lead.contact },
  ].filter((v): v is NonNullable<typeof v> => v !== null);

  const found = await prisma.dwyLead.findFirst({
    where: { OR: or },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true, kind: true },
  });
  if (!found) return null;

  const days = Math.max(0, Math.floor((Date.now() - found.createdAt.getTime()) / 86_400_000));
  return { days, kind: found.kind };
}
