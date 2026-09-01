// Запасной провайдер. Работал год, пока на аккаунте были кредиты: 26.08.2026
// ключ живой, а квота нулевая (credit_balance_exhausted), и из-за этого у
// Михаила Коробицына все девять голосовых анкеты пришли без расшифровки.

import { toBlobPart, type Audio } from './audio';

const API = 'https://api.openai.com/v1/audio/transcriptions';

export async function transcribeOpenAI(audio: Audio, fileName: string): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY is not set');

  const form = new FormData();
  form.append('file', new Blob([toBlobPart(audio)], { type: 'audio/ogg' }), fileName);
  form.append('model', 'whisper-1');
  form.append('language', 'ru');

  const res = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(`Whisper error: ${err?.error?.message || res.status}`);
  }

  const data = (await res.json()) as { text?: string };
  return (data.text || '').trim();
}
