'use client';

import { useEffect, useState } from 'react';
import { waitForTelegramWebApp } from '@/lib/telegram-ready';

/**
 * «Открыть в браузере» — кнопка для тех, кому неудобно читать внутри Телеграма.
 *
 * Внутри мини-аппа человек уже опознан, а в браузере его встретил бы экран входа.
 * Поэтому кнопка не просто открывает адрес: она берёт у сервера ссылку с коротким
 * билетом, и браузер меняет билет на обычную сессию. Логиниться заново не нужно.
 *
 * Показывается ТОЛЬКО внутри Телеграма: в обычном браузере она бессмысленна.
 */
export default function OpenInBrowser({ path, className }: { path: string; className?: string }) {
  const [inTelegram, setInTelegram] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stop = false;
    (async () => {
      // SDK подключён с defer, поэтому ждём его: без ожидания кнопка иногда
      // не появлялась бы даже внутри Телеграма.
      const tg = await waitForTelegramWebApp();
      if (stop) return;
      // initData пустая, если страницу открыли не из мини-аппа.
      if (tg?.initData) setInTelegram(true);
    })();
    return () => { stop = true; };
  }, []);

  if (!inTelegram) return null;

  async function open() {
    setBusy(true);
    setFailed(false);
    try {
      const tg = (window as unknown as {
        Telegram?: { WebApp?: { initData?: string; openLink?: (u: string) => void } };
      }).Telegram?.WebApp;

      const res = await fetch('/api/cabinet/browser-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg?.initData || '', path }),
      });
      const data = await res.json();

      if (!data?.url) { setFailed(true); setBusy(false); return; }

      // openLink уводит во внешний браузер. Без него ссылка открылась бы
      // в том же вебвью Телеграма, то есть ничего бы не изменилось.
      if (tg?.openLink) tg.openLink(data.url);
      else window.open(data.url, '_blank', 'noopener');
    } catch {
      setFailed(true);
    }
    setBusy(false);
  }

  return (
    <button className={className} onClick={open} disabled={busy}>
      {busy ? 'открываю…' : failed ? 'не вышло, попробуй ещё раз' : 'Открыть в браузере ↗'}
    </button>
  );
}
