import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  buildDwyMessage, normalizeTelegramUsername, normalizePhone,
  normalizeInstagram, type DwyLeadInput, type DwyPrior,
} from '@/lib/dwy-message';
import { isDwyKind } from '@/content/dwy';
import { notifyAdminDetailed } from '@/lib/telegram';
import { leadKeyboard } from '@/lib/lead-keyboard';
import { matchFormFilled } from '@/lib/ig-leads';

export const runtime = 'nodejs';
export const maxDuration = 30;

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

/** Подписчики из анкеты: целое от нуля до десяти миллионов, иначе null. */
function followersOf(raw: unknown): number | null {
  const n = Number(raw);
  if (raw === null || raw === undefined || raw === '' || !Number.isFinite(n)) return null;
  return Math.min(10_000_000, Math.max(0, Math.round(n)));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers, source, kind: rawKind } = body ?? {};

    // Неизвестный режим не роняем в 400: анкета всё равно ценна, просто
    // считаем её менторством — как было до листов ожидания.
    const kind = isDwyKind(rawKind) ? rawKind : 'mentor';

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'bad payload' }, { status: 400 });
    }

    // Здесь обязательны только имя и контакт — то, без чего заявка бесполезна.
    // Остальное спрашивает форма и она же не пускает дальше, пока не ответят.
    //
    // ⚠️ Раньше сервер проверял весь mode.required, и это стоило живых заявок:
    // 04.09 в анкету добавились три вопроса, а у всех, у кого страница была
    // открыта до деплоя, отправка стала возвращать 400 «missing field». Со
    // стороны человека это «анкета не отправляется», и повторные попытки не
    // помогают — старый код в его вкладке новых полей не знает. Заявку нельзя
    // терять из-за неотвеченного вопроса: недозаполненная лучше, чем никакой.
    for (const field of ['name', 'contact'] as const) {
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
      following: optional(answers.following),
      readiness: optional(answers.readiness),
      // Ползунок ходит по своей шкале, но верить фронту нельзя: берём число,
      // отсекаем мусор и потолок. null — вопрос пропустили.
      followers: followersOf(answers.followers),
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
    const saved = await prisma.dwyLead.create({
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
        following: lead.following,
        readiness: lead.readiness,
        followers: lead.followers,
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

      // Кнопки статуса прямо под уведомлением: написал человеку — тапнул
      // «написал», и это же состояние встало в разделе «Заявки».
      const refs = await notifyAdminDetailed(buildDwyMessage(lead, prior), {
        alsoWork: true,
        disableLinkPreview: true,
        replyMarkup: leadKeyboard(saved.id, 'new'),
      });

      if (refs.length === 0) {
        console.error('[dwy-lead] уведомление не ушло ни одному получателю');
        return;
      }

      // Запоминаем, куда легло сообщение: нажатие на одном аккаунте должно
      // перерисовать кнопки и на втором.
      await prisma.dwyLead
        .update({ where: { id: saved.id }, data: { notifyRefs: refs } })
        .catch((e) => console.error('[dwy-lead] не записал notifyRefs', e));
    });

    // Номер анкеты отдаём клиенту: он уходит в текст сообщения, которым
    // человек начинает переписку, и по нему бот находит, кто пришёл.
    return NextResponse.json({ ok: true, id: saved.id });
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
