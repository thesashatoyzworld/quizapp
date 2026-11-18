// Одноразовая настройка PayPal: продукт, два тарифа (месяц/год) и вебхук.
// node scripts/paypal-setup.mjs  (env: PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_MODE)
// Печатает PAYPAL_PLAN_MONTH, PAYPAL_PLAN_YEAR, PAYPAL_WEBHOOK_ID для Vercel.
const API = process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
const WEBHOOK_URL = 'https://world.thesashatoyz.com/api/paypal-webhook';
const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
const tok = (await (await fetch(`${API}/v1/oauth2/token`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' })).json()).access_token;
if (!tok) throw new Error('auth failed');
async function call(method, path, body) {
  const r = await fetch(`${API}${path}`, { method, headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${path} ${r.status} ${JSON.stringify(j)}`);
  return j;
}
const product = await call('POST', '/v1/catalogs/products', { name: 'Личный бренд на 360', type: 'SERVICE', category: 'EDUCATIONAL_AND_TEXTBOOKS' });
const plan = (name, unit, usd) => call('POST', '/v1/billing/plans', {
  product_id: product.id, name, status: 'ACTIVE',
  billing_cycles: [{ frequency: { interval_unit: unit, interval_count: 1 }, tenure_type: 'REGULAR', sequence: 1, total_cycles: 0, pricing_scheme: { fixed_price: { value: String(usd), currency_code: 'USD' } } }],
  payment_preferences: { auto_bill_outstanding: true, payment_failure_threshold: 2, setup_fee_failure_action: 'CANCEL' },
});
const month = await plan('Личный бренд на 360, месяц', 'MONTH', 120);
const year = await plan('Личный бренд на 360, год', 'YEAR', 1200);
const existing = (await call('GET', '/v1/notifications/webhooks')).webhooks || [];
let hook = existing.find((w) => w.url === WEBHOOK_URL);
if (!hook) hook = await call('POST', '/v1/notifications/webhooks', { url: WEBHOOK_URL, event_types: ['PAYMENT.SALE.COMPLETED', 'BILLING.SUBSCRIPTION.CANCELLED', 'BILLING.SUBSCRIPTION.PAYMENT.FAILED'].map((name) => ({ name })) });
console.log(`PAYPAL_PLAN_MONTH=${month.id}\nPAYPAL_PLAN_YEAR=${year.id}\nPAYPAL_WEBHOOK_ID=${hook.id}`);
