/**
 * Что делать с сообщением группы после записи в лог. Отдельно от вебхука,
 * чтобы правило «на что ставим черновик» читалось в одном месте.
 */
import { rowFromMessage, type GroupMessage } from '@/lib/group-log';
import { scheduleGroupDraft } from '@/lib/qstash';
import { batchKey } from './batch';
import { closeAnsweredDrafts } from './admin';
import { isOwner } from './draft';

/** Выключатель без деплоя: GROUP_DRAFTS=off. */
function enabled(): boolean {
  return (process.env.GROUP_DRAFTS || 'on').trim() !== 'off';
}

export async function onGroupMessage(msg: GroupMessage): Promise<void> {
  if (!enabled()) return;
  try {
    const row = rowFromMessage(msg);
    if (!row.userId || msg.text?.startsWith('/')) return;

    if (isOwner(row.userId)) {
      await closeAnsweredDrafts(row.chatId, row.replyToId, row.text);
      return;
    }

    // Голосовые и кружки пока не расшифровываются: черновик по ним был бы вслепую.
    if (row.mediaType === 'voice' || row.mediaType === 'video') return;

    await scheduleGroupDraft(batchKey(row.chatId, row.threadId, row.userId));
  } catch (e) {
    console.error('[group-draft] хук упал', e);
  }
}
