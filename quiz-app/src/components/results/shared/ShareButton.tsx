'use client';

import React, { useState } from 'react';
import { toPng } from 'html-to-image';

export interface ShareButtonProps {
  heroRef: React.RefObject<HTMLDivElement | null>;
  resultTitle: string;
  resultId: string;
  accentColor: string;
}

export function ShareButton({ heroRef, resultTitle, resultId, accentColor }: ShareButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const generateScreenshot = async (): Promise<Blob | null> => {
    if (!heroRef.current) {
      console.error('Hero ref is not available');
      return null;
    }

    try {
      const dataUrl = await toPng(heroRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#0a0612',
      });

      // Convert data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error generating screenshot:', error);
      return null;
    }
  };

  const handleShare = async () => {
    setIsGenerating(true);
    setShareError(null);

    try {
      const blob = await generateScreenshot();

      if (!blob) {
        setShareError('Ошибка создания скриншота');
        setTimeout(() => setShareError(null), 3000);
        setIsGenerating(false);
        return;
      }

      const file = new File([blob], `quiz-result-${resultId}.png`, { type: 'image/png' });

      // Try Web Share API (works in Telegram WebView on mobile)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: resultTitle,
          text: 'Моя диагностика контент-маркетинга',
        });
      } else {
        // Fallback: download image
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quiz-result-${resultId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      // User cancelled share or other error
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share error:', error);
        setShareError('Ошибка при публикации');
        setTimeout(() => setShareError(null), 3000);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="share-btn-container">
      <button
        onClick={handleShare}
        disabled={isGenerating}
        className={`share-btn ${isGenerating ? 'share-btn-loading' : ''}`}
        style={{ borderColor: accentColor, color: accentColor }}
      >
        {isGenerating ? (
          <>
            <span className="share-btn-spinner" />
            <span>Создаю скриншот...</span>
          </>
        ) : (
          <>
            <svg
              className="share-btn-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12549 15.0077 5.24919 15.0227 5.37063L8.08261 9.40127C7.54305 8.54667 6.63214 8 5.5 8C3.84315 8 2.5 9.34315 2.5 11C2.5 12.6569 3.84315 14 5.5 14C6.63214 14 7.54305 13.4533 8.08261 12.5987L15.0227 16.6294C15.0077 16.7508 15 16.8745 15 17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17C21 15.3431 19.6569 14 18 14C16.8679 14 15.9569 14.5467 15.4174 15.4013L8.47726 11.3706C8.49227 11.2492 8.5 11.1255 8.5 11C8.5 10.8745 8.49227 10.7508 8.47726 10.6294L15.4174 6.59873C15.9569 7.45333 16.8679 8 18 8Z"
                fill="currentColor"
              />
            </svg>
            <span>Поделиться результатом</span>
          </>
        )}
      </button>
      {shareError && (
        <div className="share-error">{shareError}</div>
      )}
    </div>
  );
}
