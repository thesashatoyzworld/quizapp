const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
});

const notion = new Client({ auth: envVars.NOTION_API_KEY });
const dbId = envVars.NOTION_EVENTS_DB_ID;

(async () => {
  const response = await notion.dataSources.query({
    data_source_id: dbId,
    page_size: 100,
  });

  const events = response.results.map(p => ({
    type: p.properties.event_type?.title?.[0]?.plain_text,
    timestamp: p.properties.timestamp?.date?.start,
    user_id: p.properties.user_id?.number,
    utm_source: p.properties.utm_source?.rich_text?.[0]?.plain_text,
  })).filter(e => e.type);

  // Filter events after Feb 15, 2026
  const cutoffDate = new Date('2026-02-15T00:00:00Z');
  const recentEvents = events.filter(e => new Date(e.timestamp) >= cutoffDate);

  const recentByType = {};
  recentEvents.forEach(e => {
    if (!recentByType[e.type]) recentByType[e.type] = [];
    recentByType[e.type].push(e);
  });

  console.log('=== СВЕЖИЕ СОБЫТИЯ (с 15 февраля) ===\n');

  console.log('📱 BOT_START (зашли в бота):');
  (recentByType['bot_start'] || []).forEach(e => {
    const date = new Date(e.timestamp).toLocaleString('ru-RU', { timeZone: 'UTC' });
    console.log(`  ${date} | user: ${e.user_id} | utm: ${e.utm_source || 'нет'}`);
  });
  console.log(`ВСЕГО: ${(recentByType['bot_start'] || []).length}\n`);

  console.log('🌐 WEBAPP_OPEN (открыли квиз):');
  (recentByType['webapp_open'] || []).forEach(e => {
    const date = new Date(e.timestamp).toLocaleString('ru-RU', { timeZone: 'UTC' });
    console.log(`  ${date} | user: ${e.user_id} | utm: ${e.utm_source || 'нет'}`);
  });
  console.log(`ВСЕГО: ${(recentByType['webapp_open'] || []).length}\n`);

  console.log('▶️ QUIZ_START:');
  (recentByType['quiz_start'] || []).forEach(e => {
    const date = new Date(e.timestamp).toLocaleString('ru-RU', { timeZone: 'UTC' });
    console.log(`  ${date} | user: ${e.user_id}`);
  });
  console.log(`ВСЕГО: ${(recentByType['quiz_start'] || []).length}\n`);

  console.log('✅ QUIZ_COMPLETE:');
  (recentByType['quiz_complete'] || []).forEach(e => {
    const date = new Date(e.timestamp).toLocaleString('ru-RU', { timeZone: 'UTC' });
    console.log(`  ${date} | user: ${e.user_id}`);
  });
  console.log(`ВСЕГО: ${(recentByType['quiz_complete'] || []).length}\n`);

  console.log('👁️ RESULT_VIEW:');
  (recentByType['result_view'] || []).forEach(e => {
    const date = new Date(e.timestamp).toLocaleString('ru-RU', { timeZone: 'UTC' });
    console.log(`  ${date} | user: ${e.user_id}`);
  });
  console.log(`ВСЕГО: ${(recentByType['result_view'] || []).length}\n`);

  console.log('💳 PAYMENT_CLICK:');
  (recentByType['payment_click'] || []).forEach(e => {
    const date = new Date(e.timestamp).toLocaleString('ru-RU', { timeZone: 'UTC' });
    console.log(`  ${date} | user: ${e.user_id}`);
  });
  console.log(`ВСЕГО: ${(recentByType['payment_click'] || []).length}\n`);

  // Check which webapp_open users don't have bot_start
  const botStartUsers = new Set((recentByType['bot_start'] || []).map(e => e.user_id));
  const webappOpenUsers = (recentByType['webapp_open'] || []);
  const missingBotStart = webappOpenUsers.filter(e => !botStartUsers.has(e.user_id));

  if (missingBotStart.length > 0) {
    console.log('⚠️ WEBAPP_OPEN без BOT_START (открыли квиз, но bot_start не записан):');
    missingBotStart.forEach(e => {
      const date = new Date(e.timestamp).toLocaleString('ru-RU', { timeZone: 'UTC' });
      console.log(`  ${date} | user: ${e.user_id} | utm: ${e.utm_source || 'нет'}`);
    });
    console.log(`ВСЕГО: ${missingBotStart.length}`);
  }
})().catch(err => console.error('Error:', err.message));
