'use client';

import { useState, useEffect } from 'react';

interface BroadcastStat {
  broadcastId: string;
  clicks: number;
  uniqueClicks: number;
}

interface SendResult {
  success: boolean;
  total?: number;
  sent?: number;
  failed?: number;
  blocked?: number;
  dryRun?: boolean;
  users?: { uid: number; username: string }[];
  error?: string;
}

const DEFAULT_PHOTO_FILE_ID = 'AgACAgIAAx0CXEgzBwACBotplVlda0KhpstW4TczobYp3ee-eAACNRZrG50RqEgXrxtmwhUC4QEAAwIAA3kAAzoE';

export default function BroadcastsPage() {
  const [stats, setStats] = useState<BroadcastStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Form state
  const [broadcastId, setBroadcastId] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [photoFileId, setPhotoFileId] = useState(DEFAULT_PHOTO_FILE_ID);
  const [videoFileId, setVideoFileId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [caption, setCaption] = useState('');
  const [linkOffset, setLinkOffset] = useState('');
  const [linkLength, setLinkLength] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  useEffect(() => {
    fetch('/api/admin/broadcast-stats')
      .then(r => r.json())
      .then(d => setStats(d.stats || []))
      .finally(() => setLoadingStats(false));
  }, []);

  async function handleSend(dryRun: boolean) {
    if (!broadcastId.trim() || !caption.trim()) {
      alert('broadcastId и caption обязательны');
      return;
    }

    if (mediaType === 'video' && !videoFileId.trim()) {
      alert('Загрузи видео перед отправкой');
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const body: Record<string, unknown> = {
        broadcastId: broadcastId.trim(),
        mediaType,
        caption: caption.trim(),
        dryRun,
      };

      if (mediaType === 'photo') {
        body.photoFileId = photoFileId.trim() || DEFAULT_PHOTO_FILE_ID;
      } else {
        body.videoFileId = videoFileId.trim();
      }

      if (linkOffset && linkLength) {
        body.linkOffset = parseInt(linkOffset, 10);
        body.linkLength = parseInt(linkLength, 10);
      }

      const resp = await fetch('/api/admin/broadcast-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await resp.json() as SendResult;
      setResult(data);

      if (!dryRun && data.success) {
        // Refresh stats
        const statsResp = await fetch('/api/admin/broadcast-stats');
        const statsData = await statsResp.json() as { stats: BroadcastStat[] };
        setStats(statsData.stats || []);
      }
    } catch (e) {
      setResult({ success: false, error: String(e) });
    } finally {
      setSending(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaType === 'video' && file.size > 50 * 1024 * 1024) {
      setUploadError(`Видео слишком большое: ${(file.size / 1024 / 1024).toFixed(1)} MB. Bot API лимит 50 MB.`);
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('type', mediaType);

      const resp = await fetch('/api/admin/media-upload', {
        method: 'POST',
        body: form,
      });

      const data = (await resp.json()) as { success?: boolean; fileId?: string; error?: string };

      if (!data.success || !data.fileId) {
        setUploadError(data.error || 'Не удалось загрузить файл');
        return;
      }

      if (mediaType === 'photo') {
        setPhotoFileId(data.fileId);
      } else {
        setVideoFileId(data.fileId);
      }
    } catch (err) {
      setUploadError(String(err));
    } finally {
      setUploading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid rgba(0, 240, 255, 0.2)',
    borderRadius: '6px',
    padding: '10px 12px',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const btnStyle = (primary: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: sending ? 'not-allowed' : 'pointer',
    border: '1px solid',
    borderColor: primary ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.2)',
    background: primary ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
    color: primary ? 'var(--neon-cyan)' : 'var(--text-secondary)',
    opacity: sending ? 0.6 : 1,
    transition: 'all 0.15s',
  });

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Broadcasts</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Статистика и запуск рассылок</p>
      </div>

      {/* Stats table */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '10px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          История рассылок
        </h2>
        {loadingStats ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Загрузка...</p>
        ) : stats.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Нет данных</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Broadcast ID', 'Клики (всего)', 'Уникальных', 'CTR'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.broadcastId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)', fontSize: '0.75rem' }}>{s.broadcastId}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{s.clicks}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{s.uniqueClicks}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>
                      {s.clicks > 0 ? `${Math.round((s.uniqueClicks / s.clicks) * 100)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Send form */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '10px',
        padding: '24px',
      }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Новая рассылка
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Broadcast ID <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              style={inputStyle}
              placeholder="2026_02_20_promo"
              value={broadcastId}
              onChange={e => setBroadcastId(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Тип медиа
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['photo', 'video'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMediaType(t)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: mediaType === t ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.15)',
                    background: mediaType === t ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                    color: mediaType === t ? 'var(--neon-cyan)' : 'var(--text-muted)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {t === 'photo' ? '🖼  Photo' : '🎬  Video (до 50 MB)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              {mediaType === 'photo' ? 'Photo File ID' : 'Video File ID'}
            </label>
            <input
              style={inputStyle}
              placeholder={mediaType === 'photo' ? 'AgACAg... или загрузи файл ниже' : 'Загрузи видео ниже чтобы получить file_id'}
              value={mediaType === 'photo' ? photoFileId : videoFileId}
              onChange={e => (mediaType === 'photo' ? setPhotoFileId(e.target.value) : setVideoFileId(e.target.value))}
            />
            <div style={{ marginTop: '8px' }}>
              <label
                style={{
                  display: 'inline-block',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px dashed rgba(0, 240, 255, 0.3)',
                  background: 'rgba(0, 240, 255, 0.04)',
                  color: uploading ? 'var(--text-muted)' : 'var(--neon-cyan)',
                  fontSize: '0.8rem',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                }}
              >
                {uploading
                  ? 'Загрузка...'
                  : `↑ Загрузить ${mediaType === 'photo' ? 'фото' : 'видео'} (через @testtoyzbot)`}
                <input
                  type="file"
                  accept={mediaType === 'photo' ? 'image/*' : 'video/mp4,video/quicktime,video/*'}
                  onChange={handleFileUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
              {uploadError && (
                <div style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--danger)' }}>
                  {uploadError}
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Caption <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              style={{ ...inputStyle, minHeight: '140px', resize: 'vertical' }}
              placeholder="Текст сообщения..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {caption.length} символов
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Link offset (необязательно)
              </label>
              <input
                style={inputStyle}
                type="number"
                placeholder="884"
                value={linkOffset}
                onChange={e => setLinkOffset(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Link length
              </label>
              <input
                style={inputStyle}
                type="number"
                placeholder="69"
                value={linkLength}
                onChange={e => setLinkLength(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              style={btnStyle(false)}
              disabled={sending}
              onClick={() => handleSend(true)}
            >
              {sending ? 'Загрузка...' : 'Dry Run'}
            </button>
            <button
              style={btnStyle(true)}
              disabled={sending}
              onClick={() => {
                if (confirm(`Отправить рассылку "${broadcastId}" всем пользователям?`)) {
                  handleSend(false);
                }
              }}
            >
              {sending ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '8px',
            background: result.success ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 42, 109, 0.05)',
            border: `1px solid ${result.success ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 42, 109, 0.2)'}`,
          }}>
            {result.error ? (
              <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{result.error}</p>
            ) : result.dryRun ? (
              <div>
                <p style={{ color: 'var(--success)', fontSize: '0.875rem', marginBottom: '8px' }}>
                  Dry run: {result.total} получателей
                </p>
                {result.users && result.users.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxHeight: '120px', overflowY: 'auto' }}>
                    {result.users.map(u => (
                      <div key={u.uid}>@{u.username || u.uid}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '0.875rem' }}>
                <p style={{ color: 'var(--success)', marginBottom: '4px' }}>Отправлено: {result.sent}</p>
                {(result.blocked ?? 0) > 0 && <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Заблокировали бота: {result.blocked}</p>}
                {(result.failed ?? 0) > 0 && <p style={{ color: 'var(--danger)' }}>Ошибок: {result.failed}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
