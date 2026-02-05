'use client';

import { useEffect, useState, useCallback } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  sendData: (data: string) => void;
  openTelegramLink: (url: string) => void;
  openLink: (url: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export interface CallbackData {
  user_id: number | null;
  result_id: string;
  stage: number;
  keyword: string;
  timestamp: number;
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isTelegramContext, setIsTelegramContext] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user || null);
      setIsTelegramContext(true);

      // Сообщаем Telegram что приложение готово
      tg.ready();

      // Расширяем на весь экран
      tg.expand();

      setIsReady(true);
    } else {
      // Не в Telegram — работаем как обычный веб
      setIsReady(true);
      setIsTelegramContext(false);
    }
  }, []);

  const sendCallback = useCallback(async (data: CallbackData): Promise<boolean> => {
    // Если в Telegram — используем sendData
    if (webApp && isTelegramContext) {
      try {
        webApp.sendData(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Telegram sendData error:', error);
        return false;
      }
    }

    // Если не в Telegram — отправляем на API endpoint (для тестирования)
    const botCallbackUrl = process.env.NEXT_PUBLIC_BOT_CALLBACK_URL;

    if (botCallbackUrl) {
      try {
        const response = await fetch(botCallbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        return response.ok;
      } catch (error) {
        console.error('Bot callback error:', error);
        return false;
      }
    }

    // Если нет callback URL — просто логируем
    console.log('Quiz callback data:', data);
    return true;
  }, [webApp, isTelegramContext]);

  const closeApp = useCallback(() => {
    if (webApp) {
      webApp.close();
    }
  }, [webApp]);

  return {
    webApp,
    user,
    userId: user?.id || null,
    isReady,
    isTelegramContext,
    sendCallback,
    closeApp,
  };
}
