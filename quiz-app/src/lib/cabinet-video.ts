// ─────────────────────────────────────────────────────────────
// Досмотр видео Kinescope внутри материалов кабинета.
//
// Плеер встроен обычным iframe, а сам материал кабинет показывает в СВОЁМ
// iframe (у статей своя вёрстка). Получается два уровня вложенности:
//
//   страница раздела  →  iframe материала  →  iframe плеера
//
// Kinescope IFrame Player API отдаёт события в окно материала, поэтому там
// живёт мост: слушает TimeUpdate и стучится наверх postMessage-ом, а страница
// раздела уже пишет веху на сервер (она знает telegram id).
//
// Параметр enableIframeApi обязателен — без него плеер API не поднимает.
// Документация: https://docs.kinescope.com/player-docs/embedding/iframe-api-auto-connect/
// ─────────────────────────────────────────────────────────────

/** Вехи досмотра. Между ними ничего не шлём: нужен максимум, а не тики плеера. */
const MILESTONES = [5, 10, 25, 50, 75, 90, 95, 100];

/** src плеера с включённым IFrame API. `extra` — уже готовая строка вида `watermark=…`. */
export function playerSrc(kinescopeId: string, extra = ''): string {
  const q = extra ? `enableIframeApi&${extra}` : 'enableIframeApi';
  return `https://kinescope.io/embed/${encodeURIComponent(kinescopeId)}?${q}`;
}

/**
 * Мост «плеер → страница раздела». Вставляется в <head> материала.
 * kind/slug опознают видео на той стороне.
 */
export function videoBridge(kind: string, slug: string): string {
  return `<script defer src="https://player.kinescope.io/latest/iframe.player.js?auto"></script>
<script>
(function(){
  var KIND = ${JSON.stringify(kind)}, SLUG = ${JSON.stringify(slug)};
  var MARKS = ${JSON.stringify(MILESTONES)};
  var sent = {}, duration = 0;

  function post(percent, seconds){
    try {
      parent.postMessage({ kvideo: { kind: KIND, slug: SLUG, percent: percent, seconds: seconds } }, '*');
    } catch (e) {}
  }

  // Шлём только пройденные вехи, каждую по одному разу за сессию просмотра.
  function mark(percent, seconds){
    for (var i = 0; i < MARKS.length; i++) {
      var m = MARKS[i];
      if (percent >= m && !sent[m]) { sent[m] = 1; post(m, seconds); }
    }
  }

  function attach(player){
    if (!player || !player.on || !player.Events) return;

    player.on(player.Events.Loaded, function(e){
      var d = e && e.data ? e.data.duration : 0;
      if (d > 0) duration = d;
    });

    // Длительность иногда доезжает уже после Loaded.
    if (player.Events.DurationChange) {
      player.on(player.Events.DurationChange, function(e){
        var d = e && e.data ? e.data.duration : 0;
        if (d > 0) duration = d;
      });
    }

    player.on(player.Events.TimeUpdate, function(e){
      var d = (e && e.data) || {};
      var t = d.currentTime || 0;
      var p;
      if (duration > 0) {
        p = (t / duration) * 100;
      } else if (typeof d.percent === 'number') {
        // percent приходит долей в одних версиях плеера и процентами в других.
        p = d.percent <= 1 ? d.percent * 100 : d.percent;
      } else {
        return;
      }
      mark(p, t);
    });

    player.on(player.Events.Ended, function(){
      mark(100, duration);
    });
  }

  // Режим ?auto: фабрика сама подхватывает iframe с enableIframeApi и зовёт
  // Created на каждый поднятый плеер.
  window.onKinescopeIframeAPIReady = function(factory){
    if (!factory || !factory.on) return;
    var created = factory.Events && factory.Events.Created;
    if (!created) return;
    factory.on(created, function(ev){ attach(ev && ev.data); });
  };
})();
</script>`;
}
