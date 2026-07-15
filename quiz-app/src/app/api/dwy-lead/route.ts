import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { verifyTelegramLogin } from '@/lib/telegram-login';
import { prisma } from '@/lib/prisma';
import { buildDwyMessage, type DwyLeadInput } from '@/lib/dwy-message';

export const runtime = 'nodejs';
export const maxDuration = 30;

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

const REQUIRED = ['who', 'hasProduct', 'level', 'tried', 'want', 'income', 'hours'] as const;

export async function POST(req: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      console.error('[dwy-lead] BOT_TOKEN не задан');
      return NextResponse.json({ error: 'server misconfigured' }, { status: 500 });
    }

    const body = await req.json();
    const { auth, answers, source } = body ?? {};

    if (!auth || typeof auth !== 'object' || !answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'bad payload' }, { status: 400 });
    }

    // Виджет отдаёт числа (id, auth_date) — приводим к строкам, иначе
    // data-check-string не сойдётся с тем, что подписал Telegram.
    const authData: Record<string, string> = {};
    for (const [k, v] of Object.entries(auth as Record<string, unknown>)) {
      if (v !== null && v !== undefined) authData[k] = String(v);
    }

    const check = verifyTelegramLogin(authData, BOT_TOKEN);
    if (!check.ok || !check.telegramId) {
      return NextResponse.json({ error: 'auth failed' }, { status: 401 });
    }

    for (const field of REQUIRED) {
      if (answers[field] === undefined || answers[field] === null || answers[field] === '') {
        return NextResponse.json({ error: `missing field: ${field}` }, { status: 400 });
      }
    }

    const level = Number(answers.level);
    if (!Number.isInteger(level) || level < 1 || level > 6) {
      return NextResponse.json({ error: 'bad level' }, { status: 400 });
    }

    const username = authData.username || null;
    const contact = typeof answers.contact === 'string' ? answers.contact.trim() : '';

    // Без юзернейма написать человеку невозможно — запасной контакт обязателен.
    if (!username && !contact) {
      return NextResponse.json({ error: 'contact required' }, { status: 400 });
    }

    const lead: DwyLeadInput = {
      telegramId: String(check.telegramId),
      username,
      firstName: authData.first_name || null,
      who: String(answers.who),
      hasProduct: String(answers.hasProduct),
      product: answers.product ? String(answers.product) : null,
      level,
      tried: String(answers.tried),
      want: String(answers.want),
      income: String(answers.income),
      hours: String(answers.hours),
      contact: contact || null,
      source: typeof source === 'string' && source ? source.slice(0, 64) : 'direct',
    };

    // Лид пишем первым. Он не должен теряться, что бы ни случилось с Telegram.
    await prisma.dwyLead.create({
      data: {
        telegramId: lead.telegramId,
        username: lead.username,
        firstName: lead.firstName,
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
      if (!ADMIN_CHAT_ID) {
        console.error('[dwy-lead] ADMIN_CHAT_ID не задан — уведомление не ушло');
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
