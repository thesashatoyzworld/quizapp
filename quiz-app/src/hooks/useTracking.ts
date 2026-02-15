import { useCallback } from 'react';

type EventType = 'webapp_open' | 'quiz_start' | 'quiz_complete' | 'subscribe_click' | 'payment_click' | 'payment_success' | 'result_view';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TrackEventOptions {
  user_id?: number;
  username?: string;
  first_name?: string;
  result_id?: string;
  result_stage?: string;
  result_title?: string;
  amount?: number;
  utm_source?: string;
  metadata?: Record<string, unknown>;
}

export function useTracking(user?: TelegramUser | null, utmSource?: string | null) {
  const trackEvent = useCallback(async (
    eventType: EventType,
    options?: TrackEventOptions
  ) => {
    try {
      await fetch('/api/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          user_id: user?.id ?? options?.user_id,
          username: user?.username ?? options?.username,
          first_name: user?.first_name ?? options?.first_name,
          utm_source: utmSource || options?.utm_source || undefined,
          ...options,
        }),
      });
    } catch (error) {
      console.error('Track event failed:', error);
    }
  }, [user, utmSource]);

  const trackWebappOpen = useCallback(() => {
    trackEvent('webapp_open');
  }, [trackEvent]);

  const trackQuizStart = useCallback(() => {
    trackEvent('quiz_start');
  }, [trackEvent]);

  const trackQuizComplete = useCallback((resultTitle: string, resultStage?: string, resultId?: string) => {
    trackEvent('quiz_complete', { result_title: resultTitle, result_stage: resultStage, result_id: resultId });
  }, [trackEvent]);

  const trackResultView = useCallback((resultTitle: string) => {
    trackEvent('result_view', { result_title: resultTitle });
  }, [trackEvent]);

  const trackPaymentClick = useCallback((resultTitle: string) => {
    trackEvent('payment_click', { result_title: resultTitle });
  }, [trackEvent]);

  const trackPaymentSuccess = useCallback((resultTitle: string, amount?: number) => {
    trackEvent('payment_success', { result_title: resultTitle, amount });
  }, [trackEvent]);

  return {
    trackEvent,
    trackWebappOpen,
    trackQuizStart,
    trackQuizComplete,
    trackResultView,
    trackPaymentClick,
    trackPaymentSuccess,
  };
}
