// Карта видео: Loom ID → YouTube ID (unlisted).
// Пока пусто — рендерер откатывается на Loom-эмбед, так что продукт работает
// сразу. Как Саша зальёт ролики на YouTube, вписываем сюда id из
// scripts/formula-migrate/video-upload-map.csv (колонка youtube_id) — и всё
// переключается на YouTube без других правок.
//
// Пример: '2c05ffb20e764272bd490fb776b44f22': 'dQw4w9WgXcQ',

export const VIDEO_MAP: Record<string, string> = {};
