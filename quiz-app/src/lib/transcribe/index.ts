// Один вход для расшифровки: и голосовые анкеты в боте, и зум-пайплайн зовут
// отсюда. Провайдер меняется переменной, чтобы переезд не требовал правок
// вызывающих: за год их накопилось больше, чем хочется трогать разом.

import { transcribeElevenLabs } from './elevenlabs';
import { transcribeOpenAI } from './openai';

import type { Audio } from './audio';

export type { Audio } from './audio';
export type TranscribeProvider = 'elevenlabs' | 'openai';

export function currentProvider(): TranscribeProvider {
  const raw = (process.env.TRANSCRIBE_PROVIDER || 'elevenlabs').trim().toLowerCase();
  return raw === 'openai' ? 'openai' : 'elevenlabs';
}

/** Бросает исключение: вызывающий решает, что показать человеку. */
export async function transcribeAudio(audio: Audio, fileName: string): Promise<string> {
  return currentProvider() === 'openai'
    ? transcribeOpenAI(audio, fileName)
    : transcribeElevenLabs(audio, fileName);
}
