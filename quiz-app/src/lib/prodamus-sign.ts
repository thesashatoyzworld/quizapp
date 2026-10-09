// Разбор тела и проверка подписи уведомлений Продамуса. Тот же алгоритм, что
// в /api/prodamus-webhook, вынесен для вебхука подписок: у подписок свой адрес
// уведомлений в кабинете, но ключ общий (PRODAMUS_SECRET_KEY).

import crypto from 'crypto';

export function sortDeep(val: unknown): unknown {
  if (Array.isArray(val)) return val.map(sortDeep);
  if (val && typeof val === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(val as Record<string, unknown>).sort()) {
      sorted[key] = sortDeep((val as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return val;
}

/** products[0][name] → { products: [{ name }] } */
export function parseFormNested(text: string): Record<string, unknown> {
  const params = new URLSearchParams(text);
  const result: Record<string, unknown> = {};
  for (const [key, value] of params.entries()) {
    const parts = key.replace(/\[([^\]]*)\]/g, '.$1').split('.');
    let cur: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const next = parts[i + 1];
      if (cur[part] === undefined) {
        cur[part] = /^\d+$/.test(next) ? [] : {};
      }
      cur = cur[part] as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]] = value;
  }
  return result;
}

export function parseProdamusBody(text: string, contentType: string): Record<string, unknown> {
  return contentType.includes('application/x-www-form-urlencoded')
    ? parseFormNested(text)
    : JSON.parse(text);
}

export function prodamusSignature(headers: Headers): string {
  let s = headers.get('sign') || '';
  if (s.startsWith('Sign: ')) s = s.slice(6);
  return s;
}

function hmacHex(json: string): string {
  return crypto
    .createHmac('sha256', process.env.PRODAMUS_SECRET_KEY || '')
    .update(json)
    .digest('hex');
}

/** Продамус подписывает json_encode PHP: слэши экранированы, юникод нет. Принимаем оба. */
export function verifyProdamusSignature(body: Record<string, unknown>, signature: string): boolean {
  if (!process.env.PRODAMUS_SECRET_KEY || !signature) return false;
  const plain = JSON.stringify(sortDeep(body));
  return hmacHex(plain) === signature || hmacHex(plain.replace(/\//g, '\\/')) === signature;
}
