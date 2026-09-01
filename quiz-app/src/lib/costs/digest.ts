// Сводка расходов за месяц одним сообщением в личку.
//
// Живёт отдельно от роута, потому что зовут её двое: ежедневный крон сбора
// (первого числа) и ручная ссылка, когда нужно посмотреть любой месяц.

import { getCostsReport } from './report';
import { notifyAdmin } from '@/lib/telegram';

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


/** Собрать и отправить сводку. Возвращает, что именно ушло. */
export async function sendMonthlyDigest(month?: string) {
  const target = month ?? monthBack(1);
  const [report, previous] = await Promise.all([
    getCostsReport(target),
    getCostsReport(monthBack(target === monthBack(1) ? 2 : 1)),
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

  const sent = await notifyAdmin(lines.join('
'), { parseMode: 'HTML', disableLinkPreview: true });
  return { month: target, sent, totalRub: Math.round(report.totalRub) };
}
