import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildDwyMessage, normalizeTelegramUsername, type DwyLeadInput } from '@/lib/dwy-message';

export const runtime = 'nodejs';
export const maxDuration = 30;

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Telegram-логина здесь нет намеренно: виджет в мобильном браузере не видит
// сессию из приложения и гонит человека на oauth.telegram.org вводить номер.
// С холодного трафика из шапки профиля на этом отваливалось большинство.
// Личность не верифицируем — Саша всё равно читает каждую анкету глазами.
const REQUIRED = ['name', 'contact', 'who', 'hasProduct', 'level', 'tried', 'want', 'income', 'hours'] as const;

/** Режем длину: поля свободные, а таблица не должна пухнуть от вставленной простыни. */
const CAP = 2000;
function cap(v: unknown): string {
  return String(v).trim().slice(0, CAP);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers, source } = body ?? {};

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'bad payload' }, { status: 400 });
    }

    for (const field of REQUIRED) {
      if (answers[field] === undefined || answers[field] === null || String(answers[field]).trim() === '') {
        return NextResponse.json({ error: `missing field: ${field}` }, { status: 400 });
      }
    }

    const level = Number(answers.level);
    if (!Number.isInteger(level) || level < 1 || level > 6) {
      return NextResponse.json({ error: 'bad level' }, { status: 400 });
    }

    const contact = cap(answers.contact);
    if (contact.length < 3) {
      return NextResponse.json({ error: 'bad contact' }, { status: 400 });
    }

    const lead: DwyLeadInput = {
      name: cap(answers.name),
      contact,
      username: normalizeTelegramUsername(contact),
      who: cap(answers.who),
      hasProduct: cap(answers.hasProduct),
      product: answers.product ? cap(answers.product) : null,
      level,
      tried: cap(answers.tried),
      want: cap(answers.want),
      income: cap(answers.income),
      hours: cap(answers.hours),
      source: typeof source === 'string' && source ? source.slice(0, 64) : 'direct',
    };

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
        source: lead.source,
      },
    });

    // Уведомление уходит ПОСЛЕ ответа клиенту: на мобилке в Instagram WebView
    // ожидание Telegram роняло форму по таймауту.
    after(async () => {
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
            text: buildDwyMessage(lead),
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
