import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const EVENTS_DB_ID = process.env.NOTION_EVENTS_DB_ID!;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const CRON_SECRET = process.env.CRON_SECRET;

interface FunnelMetrics {
  bot_start: number;
  webapp_open: number;
  webapp_open_with_null: number;
  quiz_start: number;
  quiz_complete: number;
  result_view: number;
  payment_click: number;
  payment_success: number;
  masterclass_view: number;
}

async function getFunnelMetrics(hoursAgo: number): Promise<FunnelMetrics> {
  const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  const response = await notion.dataSources.query({
    data_source_id: EVENTS_DB_ID,
    page_size: 100,
  });

  const events = response.results.map((p: any) => ({
    type: p.properties.event_type?.title?.[0]?.plain_text,
    timestamp: p.properties.timestamp?.date?.start,
    user_id: p.properties.user_id?.number,
  })).filter(e => e.type && new Date(e.timestamp) >= cutoffDate);

  const metrics: FunnelMetrics = {
    bot_start: 0,
    webapp_open: 0,
    webapp_open_with_null: 0,
    quiz_start: 0,
    quiz_complete: 0,
    result_view: 0,
    payment_click: 0,
    payment_success: 0,
    masterclass_view: 0,
  };

  events.forEach(e => {
    if (e.type === 'bot_start') metrics.bot_start++;
    if (e.type === 'webapp_open') {
      metrics.webapp_open++;
      if (!e.user_id) metrics.webapp_open_with_null++;
    }
    if (e.type === 'quiz_start') metrics.quiz_start++;
    if (e.type === 'quiz_complete') metrics.quiz_complete++;
    if (e.type === 'result_view') metrics.result_view++;
    if (e.type === 'payment_click') metrics.payment_click++;
    if (e.type === 'payment_success') metrics.payment_success++;
    if (e.type === 'masterclass_view') metrics.masterclass_view++;
  });

  return metrics;
}

function buildReport(metrics: FunnelMetrics, period: string): string {
  const webappWithUserId = metrics.webapp_open - metrics.webapp_open_with_null;

  // Calculate conversion rates
  const startToComplete = metrics.quiz_start > 0
    ? Math.round((metrics.quiz_complete / metrics.quiz_start) * 100)
    : 0;
  const completeToView = metrics.quiz_complete > 0
    ? Math.round((metrics.result_view / metrics.quiz_complete) * 100)
    : 0;
  const viewToPayment = metrics.result_view > 0
    ? Math.round((metrics.payment_click / metrics.result_view) * 100)
    : 0;

  // Health alerts
  const alerts: string[] = [];
  if (metrics.webapp_open_with_null > metrics.webapp_open * 0.3) {
    alerts.push('⚠️ Много null user_id в webapp_open (' + metrics.webapp_open_with_null + '/' + metrics.webapp_open + ')');
  }
  if (metrics.bot_start < webappWithUserId * 0.8 && webappWithUserId > 0) {
    alerts.push('⚠️ bot_start меньше чем webapp_open — теряем события');
  }
  if (completeToView < 95 && metrics.quiz_complete > 0) {
    alerts.push('⚠️ result_view не совпадает с quiz_complete (' + completeToView + '%)');
  }

  let report = `📊 <b>Отчёт по воронке</b> (${period})\n\n`;

  report += `<b>Трафик:</b>\n`;
  report += `├ 🤖 Bot Start: ${metrics.bot_start}\n`;
  report += `├ 🌐 WebApp Open: ${webappWithUserId}`;
  if (metrics.webapp_open_with_null > 0) {
    report += ` (+${metrics.webapp_open_with_null} null)`;
  }
  report += `\n`;
  report += `├ 🎯 МК напрямую: ${metrics.masterclass_view}\n`;
  report += `└─────\n\n`;

  report += `<b>Квиз:</b>\n`;
  report += `├ ▶️ Начали: ${metrics.quiz_start}\n`;
  report += `├ ✅ Завершили: ${metrics.quiz_complete}`;
  if (metrics.quiz_start > 0) {
    report += ` (${startToComplete}%)`;
  }
  report += `\n`;
  report += `├ 👁 Просмотрели: ${metrics.result_view}`;
  if (metrics.quiz_complete > 0) {
    report += ` (${completeToView}%)`;
  }
  report += `\n`;
  report += `└─────\n\n`;

  report += `<b>Конверсия:</b>\n`;
  report += `├ 💳 Кликнули оплату: ${metrics.payment_click}`;
  if (metrics.result_view > 0) {
    report += ` (${viewToPayment}%)`;
  }
  report += `\n`;
  report += `└ ✅ Оплатили: ${metrics.payment_success}\n\n`;

  if (alerts.length > 0) {
    report += `<b>Проблемы:</b>\n`;
    alerts.forEach(alert => {
      report += alert + '\n';
    });
  } else {
    report += `✅ <b>Всё работает штатно</b>`;
  }

  return report;
}

async function sendTelegramReport(text: string) {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.error('Missing BOT_TOKEN or ADMIN_CHAT_ID');
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: ADMIN_CHAT_ID,
      text,
      parse_mode: 'HTML',
    }),
  });
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get metrics for last 24 hours
    const metrics24h = await getFunnelMetrics(24);
    const report = buildReport(metrics24h, 'последние 24 часа');

    // Send to Telegram
    await sendTelegramReport(report);

    console.log('[Funnel Report] Sent successfully');

    return NextResponse.json({
      success: true,
      metrics: metrics24h,
      report,
    });
  } catch (error) {
    console.error('[Funnel Report] Error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
