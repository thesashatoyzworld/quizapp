import Anthropic from '@anthropic-ai/sdk';
import { SALES_KB } from '@/content/sales-kb';
import { findThread, renderThread, type SalesThread } from './lead';

// Помощник в продажах: смотрит живую переписку и предлагает, что написать
// дальше. Не отправляет сам — решение и отправка остаются за человеком.

const anthropic = new Anthropic();

export type SalesVariant = { text: string; why: string };
export type SalesAnswer = {
  found: boolean;
  who: string;
  waiting: string | null;
  variants: SalesVariant[];
  callSasha: string | null;
  thread: SalesThread | null;
};

const SYSTEM = `Ты помогаешь вести переписки в инстаграм-директе за Сашу.

С тобой разговаривает ассистент. Всё, что ты пишешь, он прочитает, при желании
поправит и отправит человеку от лица Саши. Поэтому давай готовый текст
сообщения, а не советы о том, что стоило бы написать.

Ниже вся база: как Саша говорит, что продаёт, по каким ценам, какие приёмы
использует и что кому отправляет. Отвечай только по ней.

ГЛАВНОЕ ПРАВИЛО: не выдумывай. Цифры, схемы оплаты, ссылки и обещания бери
только из базы. Не нашёл — так и скажи и позови Сашу.

Отдельно про то, как устроена работа. Не описывай формат своими словами:
ни «мы вместе двигаемся на созвонах», ни «нет фиксированной цены», ни
«всё зависит от ситуации». Цены и состав тарифов в базе есть и они
фиксированные, поэтому такая отписка — прямая неправда. Если называть цену
рано, задай вопрос про его ситуацию или отправь материал, а про устройство
работы промолчи.

Назвал кейс — дай ссылку на него, целиком, с метками из документа «Материалы».
Без ссылки человеку некуда идти, а ассистенту придётся искать её руками.

Дай ДВА-ТРИ разных варианта следующего сообщения, а не один. Варианты должны
отличаться ходом, а не словами: например, один бьёт в противоречие, другой
отправляет кейс, третий задаёт вопрос про ситуацию. К каждому одной строкой
объясни, почему он и на какой похожий случай опирается.

Как писать сами сообщения:
- строчные буквы, короткие строки, мысль на строку, точки в конце не ставятся
- ровно один вопрос в сообщении. Два вопроса подряд («сколько подписчиков и
  сколько клиентов?») считаются нарушением: выбери тот, что важнее
- вопрос всегда про то, что человек сам написал
- никакого канцелярита и «доброго времени суток»
- мат допустим, но редко и по делу

Чего не делать:
- называть цену тому, кто ничего не смотрел
- дожимать: если человек упёрся, правильный ход это короткая фраза без обиды
- первым заговаривать про возврат денег
- предлагать схему оплаты, которой нет в базе
- придумывать за Сашу голосовые

Как читать переписку. Строки, помеченные «кодовое слово в комментарии под
постом», — это не разговор: человек написал слово под постом, чтобы бот прислал
материалы. Отвечать на них как на реплику нельзя, приписывать человеку смысл
кодового слова тоже: «хочукаквася» не значит «я узнал себя в Васе».

Если последним писали МЫ, а человек не ответил, то и предлагать надо
напоминание, а не ответ на несказанное.

Если разговор дошёл до цены менторства, до созвона, до страха «наставник
пропадёт», до «я не смогу как в кейсе», до бесплатного разбора, до возврата
денег или до дохода от 500 тысяч — заполни callSasha и объясни, почему здесь
нужен Саша. Варианты всё равно дай: ассистенту есть что написать до передачи.`;

const SCHEMA = {
  type: 'object',
  properties: {
    // Количество вариантов задано в системном промпте: схема принимает
    // minItems только 0 или 1, ограничение «два-три» через неё не выразить.
    variants: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'готовое сообщение целиком' },
          why: { type: 'string', description: 'одной строкой: почему так и на какой случай опирается' },
        },
        required: ['text', 'why'],
        additionalProperties: false,
      },
    },
    callSasha: {
      type: ['string', 'null'],
      description: 'если нужен Саша — почему; иначе null',
    },
  },
  required: ['variants', 'callSasha'],
  additionalProperties: false,
} as const;

function waitingFor(thread: SalesThread): string | null {
  const last = thread.messages[thread.messages.length - 1];
  if (!last || last.side !== 'client') return null;
  const hours = Math.round((Date.now() - last.createdAt * 1000) / 3_600_000);
  if (hours < 1) return 'меньше часа';
  if (hours < 24) return `${hours} ч`;
  return `${Math.round(hours / 24)} дн`;
}

/**
 * Что написать дальше по готовой переписке. Источник неважен: инста-директ
 * приходит из ChatPlace, личка рабочего аккаунта — из телеграма, база
 * и промпт для обоих одни.
 */
export async function suggestFromThread(params: {
  /** Что известно о человеке: ник, анкета, воронка. */
  about: string;
  /** Переписка строками «[время] ЧЕЛОВЕК/МЫ: текст». */
  rendered: string;
}): Promise<{ variants: SalesVariant[]; callSasha: string | null }> {
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 6000,
    system: [
      { type: 'text' as const, text: SYSTEM },
      { type: 'text' as const, text: SALES_KB, cache_control: { type: 'ephemeral' as const } },
    ],
    messages: [
      {
        role: 'user',
        content: `Человек:
${params.about || 'ничего не известно'}

Переписка:
${params.rendered}

Что написать дальше?`,
      },
    ],
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
  });

  if (process.env.SALES_DEBUG) {
    console.error('[sales] stop_reason:', res.stop_reason, '· output:', res.usage.output_tokens);
  }

  const block = res.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') return { variants: [], callSasha: null };
  try {
    return JSON.parse(block.text) as { variants: SalesVariant[]; callSasha: string | null };
  } catch {
    console.error('[sales] ответ модели не разобрался как json');
    return { variants: [], callSasha: null };
  }
}

/** Ник человека → что ему написать дальше. Инста-директ. */
export async function suggestReply(handle: string): Promise<SalesAnswer> {
  const thread = await findThread(handle);
  if (!thread) {
    return {
      found: false,
      who: handle,
      waiting: null,
      variants: [],
      callSasha: null,
      thread: null,
    };
  }

  const { lead, messages } = thread;
  const about = [
    lead.handle ? `ник: @${lead.handle}` : null,
    lead.name ? `имя в инстаграме: ${lead.name}` : null,
    lead.keyword ? `пришёл по кодовому слову: ${lead.keyword}` : null,
    lead.automationName ? `воронка: ${lead.automationName}` : null,
    lead.formKind ? `ВНИМАНИЕ: уже оставил анкету (${lead.formKind}), из холодной ему не пишем` : null,
    lead.note ? `заметка ассистента: ${lead.note}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const parsed = await suggestFromThread({ about, rendered: renderThread(messages) });

  return {
    found: true,
    who: lead.handle ? `@${lead.handle}` : lead.name || handle,
    waiting: waitingFor(thread),
    variants: parsed.variants,
    callSasha: parsed.callSasha,
    thread,
  };
}
