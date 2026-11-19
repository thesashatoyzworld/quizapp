import { createHmac } from 'crypto';

/**
 * Подтверждение листа ожидания в боте. Бот не может написать человеку первым,
 * поэтому после анкеты сайт сам открывает бота по ссылке ?start=wl_<id>_<подпись>.
 * Человек жмёт «Старт», бот привязывает его Телеграм к записи и пишет «анкета принята».
 * Подпись не даёт привязать к чужой записи, подобрав номер.
 */
const BOT = process.env.BOT_USERNAME || 'testtoyzbot';
const PREFIX = 'wl_';

function sig(id: number): string {
  return createHmac('sha256', process.env.BOT_TOKEN || '')
    .update(`wl:${id}`)
    .digest('hex')
    .slice(0, 10);
}

export function waitlistBotUrl(leadId: number): string {
  return `https://t.me/${BOT}?start=${PREFIX}${leadId}_${sig(leadId)}`;
}

/** Номер записи из start-параметра или null, если ссылка не наша или подпись не сошлась. */
export function parseWaitlistStart(param: string): number | null {
  const m = /^wl_(\d{1,9})_([0-9a-f]{10})$/.exec(param);
  if (!m) return null;
  const id = Number(m[1]);
  return sig(id) === m[2] ? id : null;
}

/** Что бот отвечает после «Старт» по ссылке из анкеты. */
export const WAITLIST_CONFIRM_TEXT: Record<string, string> = {
  '360':
    'анкета принята ✅\n\nты в листе ожидания «Личный бренд на 360». когда открою набор, напишу сюда первым, до того как это увидит канал',
};
