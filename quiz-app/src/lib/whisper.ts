import { getTelegramFilePath, downloadTelegramFile } from './telegram';

// Перенос из agent-hub/src/lib/whisper.ts: там этот код уже год расшифровывает
// голосовые в клиентских группах.
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').trim();

/** Bot API не отдаёт файлы больше 20 МБ. Голосовое на 5 минут в OGG весит 1-2 МБ. */
export const TG_FILE_LIMIT_BYTES = 20 * 1024 * 1024;

/**
 * Скачивает голосовое из Telegram и расшифровывает через OpenAI Whisper (ru).
 * Бросает исключение: вызывающий решает, что показать человеку.
 */
export async function transcribeTgVoice(fileId: string): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set');

  const filePath = await getTelegramFilePath(fileId);
  const buffer = await downloadTelegramFile(filePath);
  const fileName = filePath.split('/').pop() || 'voice.ogg';

  const form = new FormData();
  form.append('file', new Blob([buffer], { type: 'audio/ogg' }), fileName);
  form.append('model', 'whisper-1');
  form.append('language', 'ru');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Whisper error: ${err?.error?.message || res.status}`);
  }

  const data = await res.json();
  return (data.text as string) || '';
}
