// Один вызов модели, два транспорта: API и Claude CLI по подписке.
//
// Зачем: в проде карта собирается сама, на Vercel, где CLI нет и быть не может
// (авторизация CLI привязана к устройству). Локально всё наоборот: Саша за
// компом, подписка уже оплачена, и жечь кредиты API на ручную пересборку
// незачем.
//
// Зеркальность держится на том, что различается ТОЛЬКО транспорт. Системный
// промпт, пользовательский промпт, схема ответа и разбор результата общие:
// схема одна и та же константа, она же уходит в strict tool use у API и она же
// печатается в промпт для CLI. Дальше и там и там работает один assemble.
//
// Выбор транспорта: ROADMAP_BACKEND=cli|api. Если не задан, берём api при
// живом ключе и cli, если ключа нет, а CLI на машине есть.

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';

export type Backend = 'api' | 'cli';

export const MODEL = process.env.ROADMAP_MODEL || 'claude-opus-5';

/** Ответ модели плюс то, чем и почём он получен. */
export interface ModelReply<T> {
  data: T;
  backend: Backend;
  usage: { input: number; output: number };
}

// ── где лежит CLI ────────────────────────────────────────────────────────────

/**
 * Путь к бинарю CLI.
 *
 * На Windows нельзя спавнить `claude`: это .cmd-шим, а Node с 20-й версии
 * отказывается запускать .cmd без shell. Через shell же аргументы склеиваются
 * в одну строку кодовой страницы консоли, и кириллица в промпте превращается
 * в кашу. Поэтому ищем сам claude.exe и запускаем его напрямую.
 */
export function cliPath(): string | null {
  const fromEnv = (process.env.CLAUDE_CLI_PATH || '').trim();
  if (fromEnv) return fs.existsSync(fromEnv) ? fromEnv : null;

  if (process.platform !== 'win32') return 'claude';

  const appData = process.env.APPDATA;
  if (!appData) return null;
  const guess = path.join(appData, 'npm', 'node_modules', '@anthropic-ai', 'claude-code', 'bin', 'claude.exe');
  return fs.existsSync(guess) ? guess : null;
}

export function resolveBackend(): Backend {
  const forced = (process.env.ROADMAP_BACKEND || '').trim().toLowerCase();
  if (forced === 'cli' || forced === 'api') return forced;

  const hasKey = Boolean((process.env.ANTHROPIC_API_KEY || '').trim());
  if (hasKey) return 'api';
  return cliPath() ? 'cli' : 'api';
}

// ── API ──────────────────────────────────────────────────────────────────────

let client: Anthropic | null = null;

function anthropic(): Anthropic {
  if (!client) {
    const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
    client = new Anthropic({ apiKey });
  }
  return client;
}

async function callApi<T>(params: {
  system: string;
  user: string;
  schema: object;
  toolName: string;
  toolDescription: string;
}): Promise<ModelReply<T>> {
  // Карта длинная, поэтому стрим: без него большой max_tokens упирается в таймаут.
  const message = await anthropic()
    .messages.stream({
      model: MODEL,
      max_tokens: 32000,
      system: params.system,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high' },
      tools: [
        {
          name: params.toolName,
          description: params.toolDescription,
          input_schema: params.schema as unknown as Anthropic.Tool['input_schema'],
          strict: true,
        },
      ],
      tool_choice: { type: 'tool', name: params.toolName },
      messages: [{ role: 'user', content: params.user }],
    })
    .finalMessage();

  await recordAnthropicUsage(MODEL, message.usage, 'roadmap');

  const block = message.content.find((b) => b.type === 'tool_use' && b.name === params.toolName);
  if (!block || block.type !== 'tool_use') {
    throw new Error(`модель не вернула ответ инструментом (stop_reason: ${message.stop_reason})`);
  }

  return {
    data: block.input as T,
    backend: 'api',
    usage: { input: message.usage.input_tokens, output: message.usage.output_tokens },
  };
}

// ── CLI ──────────────────────────────────────────────────────────────────────

/** Что печатается в конец промпта вместо strict tool use. Схема та же. */
function schemaInstruction(schema: object): string {
  return [
    '# Формат ответа',
    '',
    'Верни ТОЛЬКО валидный JSON-объект по схеме ниже. Без markdown-обёртки, без пояснений до и после, без комментариев внутри.',
    'Все поля обязательны. Никаких лишних полей.',
    '',
    '```json',
    JSON.stringify(schema, null, 2),
    '```',
  ].join('\n');
}

/** Достаёт JSON из ответа: модель иногда всё же заворачивает его в ```json. */
function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : trimmed;

  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('в ответе CLI нет JSON-объекта');

  return JSON.parse(body.slice(start, end + 1));
}

/**
 * Окружение для CLI: без ключей API.
 *
 * Ровно в этом весь смысл транспорта. Если ANTHROPIC_API_KEY виден дочернему
 * процессу (а он виден: dotenv кладёт его в process.env), CLI считает ключ
 * приоритетнее логина и уходит платить в API. При пустом балансе это ещё и
 * падение с кодом 1, что и вскрылось на первом прогоне.
 */
function subscriptionEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  delete env.ANTHROPIC_AUTH_TOKEN;
  delete env.ANTHROPIC_BASE_URL;
  return env;
}

interface CliResult {
  is_error?: boolean;
  result?: string;
  total_cost_usd?: number;
  usage?: { input_tokens?: number; output_tokens?: number };
}

function runCli(system: string, user: string, timeoutMs: number): Promise<CliResult> {
  const bin = cliPath();
  if (!bin) throw new Error('Claude CLI не найден: поставь CLAUDE_CLI_PATH или используй ROADMAP_BACKEND=api');

  return new Promise((resolve, reject) => {
    const child = spawn(
      bin,
      [
        '-p',
        '--output-format',
        'json',
        '--model',
        MODEL,
        // Свой системный промпт вместо дефолтного промпта Claude Code, иначе
        // модель приходит в задачу с чужими инструкциями про работу с кодом.
        '--system-prompt',
        system,
        // Инструменты в этой задаче не нужны: ей нечего читать и запускать.
        '--restricted',
      ],
      { windowsHide: true, env: subscriptionEnv() },
    );

    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`CLI не ответил за ${Math.round(timeoutMs / 1000)} c`));
    }, timeoutMs);

    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(`CLI вышел с кодом ${code}: ${err.slice(0, 400)}`));
      try {
        resolve(JSON.parse(out) as CliResult);
      } catch {
        reject(new Error(`CLI вернул не JSON: ${out.slice(0, 400)}`));
      }
    });

    child.stdin.end(user, 'utf8');
  });
}

async function callCli<T>(params: {
  system: string;
  user: string;
  schema: object;
  validate: (data: unknown) => string[];
  timeoutMs: number;
}): Promise<ModelReply<T>> {
  const system = `${params.system}\n\n${schemaInstruction(params.schema)}`;

  let lastProblem = '';
  // Две попытки: strict tool use здесь не работает, поэтому схему держим
  // проверкой, а промах возвращаем модели текстом ошибки.
  for (let attempt = 1; attempt <= 2; attempt++) {
    const user = lastProblem
      ? `${params.user}\n\n# Предыдущая попытка не прошла проверку\n\n${lastProblem}\n\nСобери ответ заново, целиком, с учётом этого.`
      : params.user;

    const res = await runCli(system, user, params.timeoutMs);
    if (res.is_error) throw new Error(`CLI вернул ошибку: ${String(res.result).slice(0, 400)}`);

    let data: unknown;
    try {
      data = extractJson(res.result || '');
    } catch (e) {
      lastProblem = `Ответ не разобрался как JSON: ${(e as Error).message}`;
      continue;
    }

    const problems = params.validate(data);
    if (problems.length === 0) {
      return {
        data: data as T,
        backend: 'cli',
        // Через подписку это не деньги, поэтому в расходы кабинета не пишем.
        usage: { input: res.usage?.input_tokens ?? 0, output: res.usage?.output_tokens ?? 0 },
      };
    }

    lastProblem = problems.map((p) => `- ${p}`).join('\n');
  }

  throw new Error(`CLI дважды вернул ответ не по схеме:\n${lastProblem}`);
}

// ── общий вход ───────────────────────────────────────────────────────────────

export async function callModel<T>(params: {
  system: string;
  user: string;
  schema: object;
  toolName: string;
  toolDescription: string;
  /** Проверка формы ответа: нужна CLI, а API её проходит бесплатно. */
  validate: (data: unknown) => string[];
  timeoutMs?: number;
}): Promise<ModelReply<T>> {
  const backend = resolveBackend();

  if (backend === 'cli') {
    return callCli<T>({
      system: params.system,
      user: params.user,
      schema: params.schema,
      validate: params.validate,
      timeoutMs: params.timeoutMs ?? 10 * 60 * 1000,
    });
  }

  return callApi<T>({
    system: params.system,
    user: params.user,
    schema: params.schema,
    toolName: params.toolName,
    toolDescription: params.toolDescription,
  });
}
