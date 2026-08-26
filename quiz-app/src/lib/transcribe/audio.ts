/** Чем отдают файл: Telegram даёт ArrayBuffer, чтение с диска даёт Buffer. */
export type Audio = ArrayBuffer | Uint8Array;

/**
 * Кусок для FormData. Buffer в типах Node это Uint8Array поверх ArrayBufferLike,
 * а Blob хочет именно ArrayBuffer, поэтому копию делаем здесь один раз, а не
 * в каждом провайдере.
 */
export function toBlobPart(audio: Audio): BlobPart {
  if (audio instanceof Uint8Array) {
    return audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength) as ArrayBuffer;
  }
  return audio;
}
