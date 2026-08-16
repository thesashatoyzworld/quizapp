'use client';

// ─────────────────────────────────────────────────────────────
// Трекер кабинета: кто какой раздел открыл, какой материал читал
// и сколько видео посмотрел.
//
// Раньше трекинг стоял только на страницах старого кабинета
// (/cabinet/materials, /feed, /metodichki) и в базе по ним ноль строк —
// новые разделы курса живут отдельными роутами (/kurs, /razbory, …)
// и мимо трекера. Здесь одна точка на все разделы.
//
// Всё уходит в общую таблицу events — отдельной таблицы не заводим,
// миграции на общей базе опасны (см. lessons_prisma-db-push-shared-database).
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react';

/** Раздел кабинета — он же значение metadata.section. */
export type Section =
  | 'kurs' | 'razbory' | 'sozvony' | 'lichnoe' | 'prompty' | 'potok' | 'formula' | 'workshops';

/** Вид материала внутри раздела — он же metadata.kind. */
export type MaterialKind = Section;

const ENDPOINT = '/api/cabinet/track';

/** Открытие раздела пишем не чаще раза в 30 минут: это визит, а не клик. */
const SECTION_TTL_MS = 30 * 60 * 1000;

function post(body: Record<string, unknown>): void {
  try {
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => { /* трекинг никогда не ломает страницу */ });
  } catch { /* noop */ }
}

/** Заход в кабинет как таковой. Тот же получасовой шаг, что и у разделов. */
export function trackCabinetOpen(telegramId: number | null): void {
  if (typeof window === 'undefined') return;
  try {
    const last = Number(sessionStorage.getItem('ct:open') || 0);
    if (last && Date.now() - last < SECTION_TTL_MS) return;
    sessionStorage.setItem('ct:open', String(Date.now()));
  } catch { /* приватный режим — просто пишем каждый раз */ }
  post({ event_type: 'cabinet_open', telegram_id: telegramId });
}

/** Заход в раздел. Повторные заходы в течение получаса не пишем. */
export function trackSection(section: Section, telegramId: number | null): void {
  if (typeof window === 'undefined') return;
  const key = `ct:sec:${section}`;
  try {
    const last = Number(sessionStorage.getItem(key) || 0);
    if (last && Date.now() - last < SECTION_TTL_MS) return;
    sessionStorage.setItem(key, String(Date.now()));
  } catch { /* приватный режим — просто пишем каждый раз */ }
  post({ event_type: 'section_view', telegram_id: telegramId, metadata: { section } });
}

/** Открытие конкретного материала: урока, разбора, созвона, промпта. */
export function trackMaterial(
  kind: MaterialKind,
  slug: string,
  title: string,
  telegramId: number | null,
): void {
  post({ event_type: 'material_view', telegram_id: telegramId, metadata: { kind, slug, title } });
}

/**
 * Веха просмотра видео. Сервер держит одну строку на человека и видео
 * и двигает percent только вверх — история кликов нам не нужна, нужен
 * максимум досмотра.
 */
export function trackVideo(
  kind: MaterialKind,
  slug: string,
  percent: number,
  seconds: number,
  telegramId: number | null,
): void {
  post({
    event_type: 'video_progress',
    telegram_id: telegramId,
    metadata: { kind, slug, percent: Math.round(percent), seconds: Math.round(seconds) },
  });
}

/**
 * Слушает вехи досмотра, которые мост шлёт из iframe материала.
 * Разделу остаётся только позвать хук: telegram id знает страница, не статья.
 */
export function useVideoProgress(kind: MaterialKind, telegramId: number | null): void {
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = e.data as { kvideo?: { slug?: string; percent?: number; seconds?: number } };
      if (!d || typeof d !== 'object' || !d.kvideo || !d.kvideo.slug) return;
      trackVideo(kind, d.kvideo.slug, d.kvideo.percent ?? 0, d.kvideo.seconds ?? 0, telegramId);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [kind, telegramId]);
}
