import { useCallback } from 'react';

type EventType = 'quiz_complete' | 'payment_click' | 'payment_success' | 'result_view';

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
  result_stage?: string;
  result_title?: string;
  amount?: number;
  metadata?: Record<string, unknown>;
}

export function useTracking(user?: TelegramUser | null) {
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
          ...options,
        }),
      });
    } catch (error) {
      console.error('Track event failed:', error);
    }
  }, [user]);

  const trackQuizComplete = useCallback((resultTitle: string, resultStage?: string) => {
    trackEvent('quiz_complete', { result_title: resultTitle, result_stage: resultStage });
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
    trackQuizComplete,
    trackResultView,
    trackPaymentClick,
    trackPaymentSuccess,
  };
}
