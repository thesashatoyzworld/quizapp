// ─────────────────────────────────────────────────────────────
// Сводка расходов за прошлый месяц — первого числа в личку.
//
// Смысл раздела не в том, чтобы было куда зайти, а в том, чтобы не заходить:
// цифра приходит сама и сравнивается с предыдущим месяцем.
//
// Крон в vercel.json, 1-го числа в 6:00 UTC — после ночного сбора, чтобы
// последний день месяца успел попасть в сводку.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { getCostsReport } from '@/lib/costs/report';
import { notifyAdmin } from '@/lib/telegram';

const CRON_SECRET = process.env.CRON_SECRET;

/** Месяц строкой YYYY-MM со сдвигом назад от сегодняшнего. */
function monthBack(delta: number): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function rub(value: number): string {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

/** «на 640 ₽ больше» — или пусто, если сравнивать не с чем. */
function delta(now: number, before: number): string {
  if (!before) return '';
  const diff = Math.round(now - before);
  if (Math.abs(diff) < 1) return ', столько же';
  return diff > 0 ? `, на ${rub(diff)} больше` : `, на ${rub(-diff)} меньше`;
}

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const month = request.nextUrl.searchParams.get('month') ?? monthBack(1);
  const [report, previous] = await Promise.all([
    getCostsReport(month),
    getCostsReport(monthBack(2)),
  ]);

  const lines = [`💸 <b>Расходы за ${report.monthLabel}</b>`, ''];
  lines.push(`Всего <b>${rub(report.totalRub)}</b>${delta(report.totalRub, previous.totalRub)}`);
  lines.push('');

  // Молчим о сервисах, которые в этом месяце ничего не стоили: строка «Zoom 0 ₽»
  // не сообщает ничего, а сводку удлиняет.
  const paid = report.services.filter((s) => s.total > 0);
  for (const s of paid) {
    const before = previous.services.find((p) => p.service === s.service);
    const inRub = s.currency === 'RUB' ? s.total : s.total * (report.usdRub ?? 0);
    const beforeRub = before
      ? before.currency === 'RUB'
        ? before.total
        : before.total * (previous.usdRub ?? 0)
      : 0;
    lines.push(`• ${s.title} — ${rub(inRub)}${delta(inRub, beforeRub)}`);
  }

  const idle = report.services.filter((s) => s.total === 0).map((s) => s.title);
  if (idle.length) {
    lines.push('');
    lines.push(`<i>Без суммы: ${idle.join(', ')}</i>`);
  }

  lines.push('');
  lines.push('<a href="https://world.thesashatoyz.com/admin/rashody">Раздел «Расходы»</a>');

  const sent = await notifyAdmin(lines.join('\n'), { parseMode: 'HTML', disableLinkPreview: true });
  return NextResponse.json({ month, sent, totalRub: Math.round(report.totalRub) });
}
