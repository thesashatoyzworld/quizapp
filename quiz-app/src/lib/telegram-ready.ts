// Ожидание Telegram WebApp SDK.
//
// telegram-web-app.js подключён в <head> с defer: синхронный тег там блокировал
// парсер, и если telegram.org тормозил или резался провайдером (в РФ сам сайт
// блокируют, хотя мессенджер работает), пользователь видел белый экран без
// единого элемента. С defer страница рисуется сразу, но SDK может появиться
// чуть позже, чем смонтируется React. Поэтому все, кто читает window.Telegram
// при монтировании, ждут его через эту функцию.

export interface TelegramWebAppLike {
  ready: () => void;
  expand: () => void;
  initDataUnsafe?: { user?: { id: number; username?: string; first_name?: string } };
  openLink?: (url: string) => void;
  [key: string]: unknown;
}

/**
 * Возвращает Telegram.WebApp, как только тот появится, или null по таймауту
 * (обычный браузер, недоступный telegram.org). Никогда не бросает.
 */
export function waitForTelegramWebApp(timeoutMs = 3000): Promise<TelegramWebAppLike | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);

  const get = () =>
    (window as unknown as { Telegram?: { WebApp?: TelegramWebAppLike } }).Telegram?.WebApp ?? null;

  const immediate = get();
  if (immediate) return Promise.resolve(immediate);

  return new Promise((resolve) => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      const tg = get();
      if (tg || Date.now() - started >= timeoutMs) {
        window.clearInterval(timer);
        resolve(tg);
      }
    }, 60);
  });
}
