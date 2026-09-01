import { getTelegramFilePath, downloadTelegramFile } from './telegram';
import { transcribeAudio } from './transcribe';

/** Bot API не отдаёт файлы больше 20 МБ. Голосовое на 5 минут в OGG весит 1-2 МБ. */
export const TG_FILE_LIMIT_BYTES = 20 * 1024 * 1024;

/**
 * Скачивает голосовое из Telegram и отдаёт расшифровку.
 *
 * Каким движком расшифровывать, решает lib/transcribe: здесь только телеграмная
 * часть. Бросает исключение, вызывающий решает, что показать человеку.
 */
export async function transcribeTgVoice(fileId: string): Promise<string> {
  const filePath = await getTelegramFilePath(fileId);
  const buffer = await downloadTelegramFile(filePath);
  const fileName = filePath.split('/').pop() || 'voice.ogg';

  return transcribeAudio(buffer, fileName);
}
