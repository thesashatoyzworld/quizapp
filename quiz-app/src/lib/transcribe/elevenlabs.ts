// Расшифровка через ElevenLabs Scribe. Тот же движок, на котором едет
// зум-пайплайн: держать два разных смысла нет.

import { toBlobPart, type Audio } from './audio';

const API = 'https://api.elevenlabs.io/v1/speech-to-text';
const MODEL = (process.env.ELEVENLABS_STT_MODEL || 'scribe_v2').trim();

export async function transcribeElevenLabs(audio: Audio, fileName: string): Promise<string> {
  const key = (process.env.ELEVENLABS_API_KEY || '').trim();
  if (!key) throw new Error('ELEVENLABS_API_KEY is not set');

  const form = new FormData();
  form.append('file', new Blob([toBlobPart(audio)], { type: 'audio/ogg' }), fileName);
  form.append('model_id', MODEL);
  // ISO 639-3, у них в оглавлении языков русский идёт как rus.
  form.append('language_code', 'rus');
  // Иначе в текст лезут «[вдох]» и «[прочищает горло]»: для анкеты это мусор,
  // модель потом читает их как содержание ответа.
  form.append('tag_audio_events', 'false');
  form.append('diarize', 'false');

  const res = await fetch(API, {
    method: 'POST',
    headers: { 'xi-api-key': key },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`ElevenLabs ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as { text?: string };
  return (data.text || '').trim();
}
