/* ============================================================
   Рисовалка поверх презентации (iPad + Apple Pencil).
   Подключается одной строкой в конце <body>:
       <script src="_doodle.js"></script>

   Ничего не требует от разметки деки. Сам создаёт свои холсты,
   панель и стили. Держится за #stage, поэтому рисовать можно
   только внутри кадра 16:9, который попадёт в монтаж.

   Клавиши: D рисование · C очистить · Z отменить · M маркер
            A автозатухание · O тёмная обводка · H панель
            P источник ввода · I отладка
            1-5 цвет (красный/зелёный/голубой/белый/чёрный)
            [ и ] толщина линии
   Палец: тап листает, свайп листает, тап по кнопке слайда остаётся кнопке.
   Занятые декой F, V, N, T, R, стрелки, пробел, Home, End не трогаем.

   Внутри вклеен perfect-freehand v1.2.2 (MIT),
   https://github.com/steveruizok/perfect-freehand
   ============================================================ */
var DoodlePF = (function(){
function $(e,t,s,x=h=>h){return e*x(.5-t*(.5-s))}function ce(e){return[-e[0],-e[1]]}function l(e,t){return[e[0]+t[0],e[1]+t[1]]}function a(e,t){return[e[0]-t[0],e[1]-t[1]]}function b(e,t){return[e[0]*t,e[1]*t]}function xe(e,t){return[e[0]/t,e[1]/t]}function R(e){return[e[1],-e[0]]}function B(e,t){return e[0]*t[0]+e[1]*t[1]}function me(e,t){return e[0]===t[0]&&e[1]===t[1]}function Se(e){return Math.hypot(e[0],e[1])}function Pe(e){return e[0]*e[0]+e[1]*e[1]}function A(e,t){return Pe(a(e,t))}function G(e){return xe(e,Se(e))}function ae(e,t){return Math.hypot(e[1]-t[1],e[0]-t[0])}function L(e,t,s){let x=Math.sin(s),h=Math.cos(s),y=e[0]-t[0],n=e[1]-t[1],f=y*h-n*x,d=y*x+n*h;return[f+t[0],d+t[1]]}function K(e,t,s){return l(e,b(a(t,e),s))}function ee(e,t,s){return l(e,b(t,s))}var{min:C,PI:ke}=Math,le=.275,V=ke+1e-4;function te(e,t={}){let{size:s=16,smoothing:x=.5,thinning:h=.5,simulatePressure:y=!0,easing:n=r=>r,start:f={},end:d={},last:D=!1}=t,{cap:S=!0,easing:j=r=>r*(2-r)}=f,{cap:q=!0,easing:c=r=>--r*r*r+1}=d;if(e.length===0||s<=0)return[];let p=e[e.length-1].runningLength,g=f.taper===!1?0:f.taper===!0?Math.max(s,p):f.taper,T=d.taper===!1?0:d.taper===!0?Math.max(s,p):d.taper,oe=Math.pow(s*x,2),_=[],M=[],H=e.slice(0,10).reduce((r,i)=>{let o=i.pressure;if(y){let u=C(1,i.distance/s),W=C(1,1-u);o=C(1,r+(W-r)*(u*le))}return(r+o)/2},e[0].pressure),m=$(s,h,e[e.length-1].pressure,n),U,X=e[0].vector,z=e[0].point,F=z,O=z,E=F,J=!1;for(let r=0;r<e.length;r++){let{pressure:i}=e[r],{point:o,vector:u,distance:W,runningLength:I}=e[r];if(r<e.length-1&&p-I<3)continue;if(h){if(y){let v=C(1,W/s),Z=C(1,1-v);i=C(1,H+(Z-H)*(v*le))}m=$(s,h,i,n)}else m=s/2;U===void 0&&(U=m);let fe=I<g?j(I/g):1,be=p-I<T?c((p-I)/T):1;m=Math.max(.01,m*Math.min(fe,be));let se=(r<e.length-1?e[r+1]:e[r]).vector,Y=r<e.length-1?B(u,se):1,he=B(u,X)<0&&!J,ue=Y!==null&&Y<0;if(he||ue){let v=b(R(X),m);for(let Z=1/13,w=0;w<=1;w+=Z)O=L(a(o,v),o,V*w),_.push(O),E=L(l(o,v),o,V*-w),M.push(E);z=O,F=E,ue&&(J=!0);continue}if(J=!1,r===e.length-1){let v=b(R(u),m);_.push(a(o,v)),M.push(l(o,v));continue}let ie=b(R(K(se,u,Y)),m);O=a(o,ie),(r<=1||A(z,O)>oe)&&(_.push(O),z=O),E=l(o,ie),(r<=1||A(F,E)>oe)&&(M.push(E),F=E),H=i,X=u}let P=e[0].point.slice(0,2),k=e.length>1?e[e.length-1].point.slice(0,2):l(e[0].point,[1,1]),Q=[],N=[];if(e.length===1){if(!(g||T)||D){let r=ee(P,G(R(a(P,k))),-(U||m)),i=[];for(let o=1/13,u=o;u<=1;u+=o)i.push(L(r,P,V*2*u));return i}}else{if(!(g||T&&e.length===1))if(S)for(let i=1/13,o=i;o<=1;o+=i){let u=L(M[0],P,V*o);Q.push(u)}else{let i=a(_[0],M[0]),o=b(i,.5),u=b(i,.51);Q.push(a(P,o),a(P,u),l(P,u),l(P,o))}let r=R(ce(e[e.length-1].vector));if(T||g&&e.length===1)N.push(k);else if(q){let i=ee(k,r,m);for(let o=1/29,u=o;u<1;u+=o)N.push(L(i,k,V*3*u))}else N.push(l(k,b(r,m)),l(k,b(r,m*.99)),a(k,b(r,m*.99)),a(k,b(r,m)))}return _.concat(N,M.reverse(),Q)}function re(e,t={}){var q;let{streamline:s=.5,size:x=16,last:h=!1}=t;if(e.length===0)return[];let y=.15+(1-s)*.85,n=Array.isArray(e[0])?e:e.map(({x:c,y:p,pressure:g=.5})=>[c,p,g]);if(n.length===2){let c=n[1];n=n.slice(0,-1);for(let p=1;p<5;p++)n.push(K(n[0],c,p/4))}n.length===1&&(n=[...n,[...l(n[0],[1,1]),...n[0].slice(2)]]);let f=[{point:[n[0][0],n[0][1]],pressure:n[0][2]>=0?n[0][2]:.25,vector:[1,1],distance:0,runningLength:0}],d=!1,D=0,S=f[0],j=n.length-1;for(let c=1;c<n.length;c++){let p=h&&c===j?n[c].slice(0,2):K(S.point,n[c],y);if(me(S.point,p))continue;let g=ae(p,S.point);if(D+=g,c<j&&!d){if(D<x)continue;d=!0}S={point:p,pressure:n[c][2]>=0?n[c][2]:.5,vector:G(a(S.point,p)),distance:g,runningLength:D},f.push(S)}return f[0].vector=((q=f[1])==null?void 0:q.vector)||[0,0],f}function ne(e,t={}){return te(re(e,t),t)}var ve=ne;
return { getStroke: ne };
})();

(function(){
'use strict';

var getStroke = DoodlePF.getStroke;

/* ---------- настройки ---------- */
var HOLD = 3200, FADE = 700;          // держим штрих / растворяем, мс
var OUTLINE = '#07070B', OUTLINE_W = 3;
var MARK_A = 0.40;
/* красный, зелёный, голубой, белый, чёрный — клавиши 1-5 */
var PALETTE = ['#FF2D2D', '#00C853', '#00B8FF', '#FFFFFF', '#12121A'];
var NAMES   = ['Красный (1)', 'Зелёный (2)', 'Голубой (3)', 'Белый (4)', 'Чёрный (5)'];
/* четыре толщины, клавиши [ и ] */
var SIZES      = [7, 11, 16, 24];
var MARK_SIZES = [18, 26, 36, 50];
var DOTS       = [5, 8, 11, 15];      // размер точки на кнопке панели
var CLEAR_ON_SLIDE = true;            // чистим холст при смене слайда
var TAP = true;                       // тап листает
var SWIPE = true;                     // свайп листает
var SWIPE_MIN = 70;
var TAP_MAX = 14;                     // смещение, до которого жест считается тапом

/* ---------- стили ---------- */
var CSS =
'#fit{touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}' +
'#dl-ink,#dl-live{position:fixed;pointer-events:none;display:block;z-index:9000}' +
'#dl-live{z-index:9001}' +
'.doodle-panel{position:fixed;z-index:9500;display:flex;align-items:center;gap:3px;' +
  'padding:4px 6px;border-radius:999px;background:rgba(18,18,24,.86);' +
  'border:1px solid rgba(255,255,255,.10);box-shadow:0 4px 16px rgba(0,0,0,.45);' +
  '-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);' +
  'opacity:.35;transition:opacity .18s ease;touch-action:manipulation;' +
  '-webkit-user-select:none;user-select:none}' +
'.doodle-panel.outside{opacity:.9}' +          /* панель в чёрной полосе, вне кадра */
'.doodle-panel.live,.doodle-panel:hover{opacity:1}' +
'.doodle-panel.hidden{display:none}' +
'.doodle-panel button{-webkit-appearance:none;appearance:none;border:0;background:transparent;' +
  'color:#9A9AA8;width:30px;height:30px;border-radius:999px;font:15px/1 inherit;' +
  'display:flex;align-items:center;justify-content:center;cursor:pointer;' +
  'touch-action:manipulation;padding:0}' +
'.doodle-panel button:active{background:rgba(255,255,255,.12)}' +
'.doodle-panel button.act{background:rgba(255,255,255,.18);color:#fff}' +
'.doodle-panel .sep{width:1px;height:18px;background:rgba(255,255,255,.14);margin:0 2px}' +
'.doodle-panel .sw{width:23px;height:23px;border-radius:50%;border:2px solid transparent;' +
  'box-shadow:inset 0 0 0 1px rgba(255,255,255,.28)}' +
'.doodle-panel .sw.act{border-color:#fff}' +
'.doodle-panel .szdot{display:block;border-radius:50%;background:#C9C9D4}' +
'.doodle-panel button:hover .szdot{background:#fff}' +
'#dl-peek{position:fixed;z-index:9500;width:24px;height:24px;border-radius:50%;border:0;' +
  'background:rgba(255,255,255,.12);display:none;cursor:pointer;touch-action:manipulation}' +
'#dl-peek.on{display:block}' +
'#dl-hud{position:fixed;left:10px;top:10px;z-index:9600;display:none;padding:8px 11px;' +
  'border-radius:10px;background:rgba(10,10,16,.90);border:1px solid rgba(255,255,255,.12);' +
  'font:11px/1.55 ui-monospace,Menlo,Consolas,monospace;color:#9BE8C8;white-space:pre;' +
  'pointer-events:none}' +
'#dl-hud.on{display:block}';

/* ---------- разметка ---------- */
var style = document.createElement('style');
style.textContent = CSS;
document.head.appendChild(style);

function el(tag, id, html){
  var n = document.createElement(tag);
  if(id) n.id = id;
  if(html) n.innerHTML = html;
  return n;
}
var cInk  = el('canvas', 'dl-ink');
var cLive = el('canvas', 'dl-live');
var panel = el('div', 'dl-panel',
  PALETTE.map(function(c, i){
    return '<button class="sw" data-color="' + c + '" title="' + NAMES[i] +
           '" style="background:' + c + '"></button>';
  }).join('') +
  '<div class="sep"></div>' +
  '<button data-a="size" title="Толщина ([ и ])"><span class="szdot"></span></button>' +
  '<button data-a="mark" title="Маркер (M)">▬</button>' +
  '<button data-a="draw" title="Рисование (D)">✎</button>' +
  '<button data-a="fade" title="Автозатухание (A)">◔</button>' +
  '<button data-a="outline" title="Тёмная обводка (O)">◐</button>' +
  '<div class="sep"></div>' +
  '<button data-a="undo" title="Отменить (Z)">↶</button>' +
  '<button data-a="clear" title="Очистить (C)">✕</button>' +
  '<button data-a="hide" title="Спрятать панель (H)">›</button>');
panel.className = 'doodle-panel';
var peek  = el('button', 'dl-peek');
var hudEl = el('div', 'dl-hud');
[cInk, cLive, panel, peek, hudEl].forEach(function(n){ document.body.appendChild(n); });

var xInk  = cInk.getContext('2d');
var xLive = cLive.getContext('2d');

/* ---------- состояние ---------- */
var strokes = [], cur = null;
var color = PALETTE[0], marker = false, drawOn = true, fadeOn = true;
var sizeIdx = 1;          // индекс в SIZES
var outlineOn = false;   // тёмная обводка под цветом, клавиша O
var rafId = 0, dpr = 1;
var box = { x:0, y:0, w:0, h:0 };      // кадр 16:9 в CSS-пикселях

var IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
             (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
var penViaTouch = IS_IOS;

/* ---------- геометрия кадра ---------- */
function frame(){
  var st = document.getElementById('stage');
  if(!st) return { x:0, y:0, w:window.innerWidth, h:window.innerHeight };
  var r = st.getBoundingClientRect();
  if(r.width < 8 || r.height < 8) return { x:0, y:0, w:window.innerWidth, h:window.innerHeight };
  return { x:r.left, y:r.top, w:r.width, h:r.height };
}
function place(c, x){
  c.style.left = box.x + 'px';
  c.style.top  = box.y + 'px';
  c.style.width  = box.w + 'px';
  c.style.height = box.h + 'px';
  c.width  = Math.round(box.w * dpr);
  c.height = Math.round(box.h * dpr);
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  x.lineJoin = 'round'; x.lineCap = 'round';
}
function layout(){
  var f = frame();
  var same = (f.x === box.x && f.y === box.y && f.w === box.w && f.h === box.h);
  box = f;
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  place(cInk, xInk); place(cLive, xLive);
  if(!same){ strokes.length = 0; cur = null; }   // кадр переехал, старые штрихи не пересчитываем
  repaintInk(); clearLive();
  placePanel();
  updHud();
}
function placePanel(){
  var bar = Math.round(window.innerHeight - (box.y + box.h));   // нижняя чёрная полоса
  var outside = bar >= 44;
  panel.classList.toggle('outside', outside);
  panel.style.bottom = outside ? Math.max(2, Math.round((bar - 40) / 2)) + 'px' : (box.y + 12) + 'px';
  panel.style.right  = '10px';
  peek.style.bottom  = panel.style.bottom;
  peek.style.right   = '14px';
}

/* ---------- геометрия штриха ---------- */
function optsFor(s, done){
  if(s.marker) return { size:s.msize || MARK_SIZES[1], thinning:0, smoothing:.62, streamline:.52,
                        simulatePressure:false, last:done, start:{cap:true}, end:{cap:true} };
  return { size:s.size || SIZES[1], thinning:s.simulated ? .32 : .55, smoothing:.55, streamline:.38,
           simulatePressure:s.simulated, last:done, easing:function(t){ return t; },
           start:{cap:true, taper:0}, end:{cap:true, taper:0} };
}
function toPath(pts){
  var p = new Path2D();
  if(!pts.length) return p;
  p.moveTo(pts[0][0], pts[0][1]);
  for(var i = 0; i < pts.length; i++){
    var a = pts[i], b = pts[(i + 1) % pts.length];
    p.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  }
  p.closePath();
  return p;
}
function pathOf(s){
  var done = s.end !== null;
  if(s.path && done) return s.path;
  var path = toPath(getStroke(s.pts, optsFor(s, done)));
  if(done) s.path = path;
  return path;
}
function paint(x, s, alpha){
  if(alpha <= 0 || !s.pts.length) return;
  var path = pathOf(s);
  if(s.marker){
    x.globalAlpha = MARK_A * alpha; x.fillStyle = s.color; x.fill(path);
  } else {
    x.globalAlpha = alpha;
    if(outlineOn){ x.lineWidth = OUTLINE_W; x.strokeStyle = OUTLINE; x.stroke(path); }
    x.fillStyle = s.color; x.fill(path);
  }
  x.globalAlpha = 1;
}
function alphaOf(s, now){
  if(!fadeOn || s.end === null) return 1;
  var dt = now - s.end;
  return dt <= HOLD ? 1 : Math.max(0, 1 - (dt - HOLD) / FADE);
}
function repaintInk(){
  xInk.setTransform(dpr,0,0,dpr,0,0);
  xInk.clearRect(0, 0, box.w, box.h);
  if(fadeOn) return;
  for(var i = 0; i < strokes.length; i++) if(strokes[i] !== cur) paint(xInk, strokes[i], 1);
}
function clearLive(){
  xLive.setTransform(dpr,0,0,dpr,0,0);
  xLive.clearRect(0, 0, box.w, box.h);
}
function paintLive(now){
  clearLive();
  if(fadeOn){ for(var i = 0; i < strokes.length; i++) paint(xLive, strokes[i], alphaOf(strokes[i], now)); }
  else if(cur){ paint(xLive, cur, 1); }
}
function needLoop(){ return !!cur || (fadeOn && strokes.length > 0); }
function tick(){
  rafId = 0;
  var now = performance.now();
  if(fadeOn) for(var i = strokes.length - 1; i >= 0; i--) if(alphaOf(strokes[i], now) <= 0) strokes.splice(i, 1);
  paintLive(now);
  if(needLoop()) rafId = requestAnimationFrame(tick);
}
function kick(){ if(!rafId && needLoop()) rafId = requestAnimationFrame(tick); }
function stopLoop(){ if(rafId){ cancelAnimationFrame(rafId); rafId = 0; } }

/* ---------- ввод ---------- */
var stat = { src:'—', pts:0, t0:0, hz:0, coal:0, pmin:1, pmax:0 };

function inFrame(x, y){ return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h; }
function inPanel(t){ return !!(t && t.closest && (t.closest('.doodle-panel') || t.closest('#dl-peek'))); }

function begin(cx, cy, p, simulated, src){
  cur = { pts:[[cx - box.x, cy - box.y, p]], color:color, marker:marker,
          size:SIZES[sizeIdx], msize:MARK_SIZES[sizeIdx],
          end:null, path:null, simulated:simulated };
  strokes.push(cur);
  stat.src = src; stat.pts = 1; stat.t0 = performance.now(); stat.pmin = p; stat.pmax = p;
  kick();
}
function extend(cx, cy, p){
  if(!cur) return;
  cur.pts.push([cx - box.x, cy - box.y, p]);
  stat.pts++;
  if(p < stat.pmin) stat.pmin = p;
  if(p > stat.pmax) stat.pmax = p;
  var dt = performance.now() - stat.t0;
  if(dt > 250) stat.hz = Math.round(stat.pts / dt * 1000);
}
function finish(){
  if(!cur) return;
  var s = cur; s.end = performance.now(); s.path = null; cur = null;
  if(fadeOn) kick();
  else { paint(xInk, s, 1); clearLive(); stopLoop(); }
}
function lastP(){ return cur && cur.pts.length ? cur.pts[cur.pts.length - 1][2] : 0.5; }

/* Pointer: мышь всегда, перо только вне iOS */
var activeId = null;
function penOK(e){
  if(e.pointerType === 'mouse') return true;
  if(e.pointerType === 'pen')   return !penViaTouch;
  return false;
}
window.addEventListener('pointerdown', function(e){
  if(inPanel(e.target) || !drawOn || !penOK(e) || !inFrame(e.clientX, e.clientY)) return;
  e.preventDefault(); e.stopPropagation();
  activeId = e.pointerId;
  var pr = e.pointerType === 'mouse' ? 0.5 : (e.pressure > 0 ? e.pressure : 0.5);
  begin(e.clientX, e.clientY, pr, e.pointerType === 'mouse', e.pointerType);
}, { capture:true, passive:false });

window.addEventListener('pointermove', function(e){
  if(!cur || e.pointerId !== activeId) return;
  e.preventDefault(); e.stopPropagation();
  var list = null;
  if(typeof e.getCoalescedEvents === 'function'){
    try { list = e.getCoalescedEvents(); } catch(err){ list = null; }
  }
  if(!list || !list.length) list = [e];
  stat.coal = list.length;
  for(var i = 0; i < list.length; i++){
    var q = list[i];
    extend(q.clientX, q.clientY, e.pointerType === 'mouse' ? 0.5 : (q.pressure > 0 ? q.pressure : lastP()));
  }
}, { capture:true, passive:false });

function upPointer(e){
  if(!cur || e.pointerId !== activeId) return;
  e.preventDefault(); e.stopPropagation();
  activeId = null; finish();
}
window.addEventListener('pointerup',     upPointer, { capture:true, passive:false });
window.addEventListener('pointercancel', upPointer, { capture:true, passive:false });

/* Touch: перо на айпаде, у touchmove частота опроса выше чем у pointermove */
var touchId = null;
function stylusIn(list){
  for(var i = 0; i < list.length; i++) if(list[i].touchType === 'stylus') return list[i];
  return null;
}
function forceOf(t){
  var f = typeof t.force === 'number' ? t.force : 0;
  return f > 0 ? Math.min(1, f) : 0.5;
}
window.addEventListener('touchstart', function(e){
  if(!penViaTouch || !drawOn || inPanel(e.target)) return;
  var t = stylusIn(e.changedTouches);
  if(!t || !inFrame(t.clientX, t.clientY)) return;
  e.preventDefault(); e.stopPropagation();
  touchId = t.identifier;
  begin(t.clientX, t.clientY, forceOf(t), false, 'touch-stylus');
}, { capture:true, passive:false });

window.addEventListener('touchmove', function(e){
  if(touchId === null) return;
  var moved = false;
  for(var i = 0; i < e.changedTouches.length; i++){
    var t = e.changedTouches[i];
    if(t.identifier !== touchId) continue;
    moved = true; stat.coal = 1;
    extend(t.clientX, t.clientY, forceOf(t));
  }
  if(moved){ e.preventDefault(); e.stopPropagation(); }
}, { capture:true, passive:false });

function endTouch(e){
  if(touchId === null) return;
  for(var i = 0; i < e.changedTouches.length; i++){
    if(e.changedTouches[i].identifier === touchId){
      e.preventDefault(); e.stopPropagation();
      touchId = null; finish(); return;
    }
  }
}
window.addEventListener('touchend',    endTouch, { capture:true, passive:false });
window.addEventListener('touchcancel', endTouch, { capture:true, passive:false });

/* Тап и свайп пальцем листают деку.
   Кликабельные элементы слайда (кнопки, строки диагностики, карусели)
   определяем по computed cursor:pointer и тап отдаём им. */
function clickChain(t){
  for(var n = t, i = 0; n && n !== document.body && i < 6; n = n.parentElement, i++){
    var tag = (n.tagName || '').toLowerCase();
    if(tag === 'button' || tag === 'a' || tag === 'input' || tag === 'select' || tag === 'textarea') return true;
    try { if(getComputedStyle(n).cursor === 'pointer') return true; } catch(err){}
  }
  return false;
}
/* Палец толще мишени. У мелких SVG-кнопок (маркеры на графиках) между кружком и
   подписью есть зазор: точное попадание в него отдаёт событие фону, и тап уходит
   в перелистывание. Поэтому промах добираем кольцом точек радиусом с полпальца.
   Возвращает true при точном попадании и сам промазанный элемент, когда его
   нашло кольцо: по нему потом кликаем руками, синтетического клика там не будет. */
var TAP_R = 16;
function clickable(t, x, y){
  if(clickChain(t)) return true;
  if(typeof x !== 'number' || typeof y !== 'number') return false;
  var d = TAP_R * 0.7, ring = [[TAP_R,0],[-TAP_R,0],[0,TAP_R],[0,-TAP_R],[d,d],[-d,d],[d,-d],[-d,-d]];
  for(var i = 0; i < ring.length; i++){
    var el = document.elementFromPoint(x + ring[i][0], y + ring[i][1]);
    if(el && clickChain(el)) return el;
  }
  return false;
}
var swX = 0, swY = 0, swOn = false, swSkipTap = false, swSnap = null;
window.addEventListener('pointerdown', function(e){
  swOn = false;
  if(e.pointerType !== 'touch' || inPanel(e.target)) return;
  swOn = true;
  var hit = clickable(e.target, e.clientX, e.clientY);
  swSkipTap = !!hit; swSnap = hit === true ? null : hit;
  swX = e.clientX; swY = e.clientY;
}, false);
window.addEventListener('pointerup', function(e){
  if(!swOn || e.pointerType !== 'touch') return;
  swOn = false;
  var dx = e.clientX - swX, dy = e.clientY - swY;
  if(SWIPE && Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy)){ nav(dx < 0 ? 1 : -1); return; }
  if(swSkipTap){                              /* тап по кнопке слайда: не листаем */
    /* попали рядом с мишенью — клика от браузера не будет, зовём сами */
    if(swSnap && Math.abs(dx) < TAP_MAX && Math.abs(dy) < TAP_MAX){
      try { swSnap.dispatchEvent(new MouseEvent('click', { bubbles:true, cancelable:true })); } catch(err){}
    }
    return;
  }
  if(TAP && Math.abs(dx) < TAP_MAX && Math.abs(dy) < TAP_MAX)
    nav(e.clientX < window.innerWidth * 0.25 ? -1 : 1);
}, false);
window.addEventListener('pointercancel', function(){ swOn = false; }, false);
function nav(dir){
  /* Deck объявлен через const, в window его нет: берём лексическую глобаль */
  var D = null;
  try { if(typeof Deck !== 'undefined') D = Deck; } catch(err){}
  if(!D && window.Deck) D = window.Deck;
  /* nav деки сначала листает кадры внутри карусели и только потом слайд */
  if(D && typeof D.nav === 'function'){ D.nav(dir); return; }
  if(D && typeof D.show === 'function' && typeof D.index === 'number'){ D.show(D.index + dir); return; }
  var btn = document.querySelector('.ab[data-dir="' + dir + '"]');   /* запасной путь */
  if(btn) btn.click();
}

/* смена слайда чистит холст */
if(CLEAR_ON_SLIDE) window.addEventListener('hashchange', function(){ clearAll(); }, false);

/* ---------- действия ---------- */
function syncUI(){
  panel.querySelectorAll('button[data-a]').forEach(function(b){
    var a = b.dataset.a;
    b.classList.toggle('act', (a === 'mark' && marker) || (a === 'draw' && drawOn) ||
                             (a === 'fade' && fadeOn) || (a === 'outline' && outlineOn));
  });
  panel.querySelectorAll('.sw').forEach(function(b){
    b.classList.toggle('act', b.dataset.color.toLowerCase() === color.toLowerCase());
  });
  var dot = panel.querySelector('.szdot');
  if(dot){ dot.style.width = DOTS[sizeIdx] + 'px'; dot.style.height = DOTS[sizeIdx] + 'px'; }
}
function clearAll(){
  strokes.length = 0; cur = null; touchId = null; activeId = null;
  stopLoop(); repaintInk(); clearLive();
}
function undo(){
  var s = strokes.pop();
  if(s === cur){ cur = null; touchId = null; activeId = null; }
  repaintInk(); paintLive(performance.now());
  if(needLoop()) kick(); else stopLoop();
}
function toggleFade(){
  fadeOn = !fadeOn;
  var now = performance.now();
  if(fadeOn){ strokes.forEach(function(s){ if(s.end !== null) s.end = now; }); repaintInk(); kick(); }
  else { stopLoop(); repaintInk(); clearLive(); }
  syncUI(); updHud();
}
function setSize(i){
  sizeIdx = Math.max(0, Math.min(SIZES.length - 1, i));
  syncUI();
}
function toggleOutline(){
  outlineOn = !outlineOn;
  repaintInk(); paintLive(performance.now());
  syncUI();
}
function togglePanel(){
  var hidden = panel.classList.toggle('hidden');
  peek.classList.toggle('on', hidden);
}

var hudOn = false, hudTimer = 0;
function updHud(){
  if(!hudOn) return;
  var d = window.devicePixelRatio || 1;
  var px = function(v){ return Math.round(v * d); };
  var prompt = document.body.classList.contains('prompt');
  hudEl.textContent =
    'КРОП для монтажа (пиксели записи)\n' +
    '  x,y,w,h : ' + px(box.x) + ',' + px(box.y) + ',' + px(box.w) + ',' + px(box.h) + '\n' +
    '  полосы  : сверху ' + px(box.y) + '  снизу ' +
        px(window.innerHeight - box.y - box.h) + '\n' +
    '  запас   : ' + (px(box.w) / 1920).toFixed(2) + 'x к 1080p\n' +
    (prompt ? '  ВНИМАНИЕ: суфлёр открыт, кроп не тот\n' : '') +
    '\nВВОД\n' +
    '  источник : ' + (penViaTouch ? 'touch (перо)' : 'pointer') + '\n' +
    '  последний: ' + stat.src + '\n' +
    '  частота  : ' + stat.hz + ' точек/с\n' +
    '  coalesced: ' + stat.coal + ' на событие\n' +
    '  нажим    : ' + stat.pmin.toFixed(2) + ' .. ' + stat.pmax.toFixed(2) + '\n' +
    '  API      : ' + (window.PointerEvent && PointerEvent.prototype.getCoalescedEvents ? 'есть' : 'НЕТ') +
        ' · https ' + (window.isSecureContext ? 'да' : 'НЕТ') + ' · dpr ' + d;
}
function toggleHud(){
  hudOn = !hudOn;
  hudEl.classList.toggle('on', hudOn);
  clearInterval(hudTimer);
  if(hudOn){ updHud(); hudTimer = setInterval(updHud, 200); }
}

panel.addEventListener('pointerdown', function(e){ e.stopPropagation(); }, false);
panel.addEventListener('touchstart',  function(e){ e.stopPropagation(); }, false);
panel.addEventListener('click', function(e){
  var b = e.target.closest('button');
  if(!b) return;
  e.stopPropagation();
  if(b.classList.contains('sw')){ color = b.dataset.color; syncUI(); return; }
  var a = b.dataset.a;
  if(a === 'mark'){ marker = !marker; syncUI(); }
  else if(a === 'draw'){ drawOn = !drawOn; syncUI(); }
  else if(a === 'fade') toggleFade();
  else if(a === 'outline') toggleOutline();
  else if(a === 'size') setSize((sizeIdx + 1) % SIZES.length);
  else if(a === 'undo') undo();
  else if(a === 'clear') clearAll();
  else if(a === 'hide') togglePanel();
}, false);
peek.addEventListener('click', function(e){ e.stopPropagation(); togglePanel(); }, false);
peek.addEventListener('pointerdown', function(e){ e.stopPropagation(); }, false);

var liveT = 0;
panel.addEventListener('pointerdown', function(){
  panel.classList.add('live');
  clearTimeout(liveT);
  liveT = setTimeout(function(){ panel.classList.remove('live'); }, 2200);
}, false);

/* ---------- хоткеи (не конфликтуют с декой) ---------- */
window.addEventListener('keydown', function(e){
  var a = document.activeElement, tg = a ? (a.tagName || '').toLowerCase() : '';
  if(tg === 'input' || tg === 'textarea' || tg === 'select' || (a && a.isContentEditable)) return;
  if(e.metaKey || e.ctrlKey || e.altKey) return;
  var code = e.code || '', k = (e.key || '').toLowerCase();
  var is = function(c, letter){ return code ? code === c : k === letter; };
  var digit = code.indexOf('Digit') === 0 ? +code.slice(5) : (k >= '1' && k <= '9' ? +k : 0);
  if(is('KeyD', 'd')){ drawOn = !drawOn; syncUI(); }
  else if(is('KeyC', 'c')) clearAll();
  else if(is('KeyZ', 'z')) undo();
  else if(is('KeyM', 'm')){ marker = !marker; syncUI(); }
  else if(is('KeyA', 'a')) toggleFade();
  else if(is('KeyO', 'o')) toggleOutline();
  else if(is('KeyH', 'h')) togglePanel();
  else if(is('KeyP', 'p')){ penViaTouch = !penViaTouch; cur = null; touchId = null; activeId = null; updHud(); }
  else if(is('KeyI', 'i')) toggleHud();
  else if(code === 'BracketLeft'  || e.key === '[') setSize(sizeIdx - 1);
  else if(code === 'BracketRight' || e.key === ']') setSize(sizeIdx + 1);
  else if(digit >= 1 && digit <= PALETTE.length){ color = PALETTE[digit - 1]; syncUI(); }
  else return;                       /* F, V, N, T, R, стрелки и пробел остаются деке */
  e.preventDefault();
}, false);

/* ---------- слежение за кадром ---------- */
window.addEventListener('resize', layout, false);
window.addEventListener('orientationchange', function(){ setTimeout(layout, 200); }, false);
if(window.ResizeObserver){
  var fitEl = document.getElementById('fit');
  if(fitEl) new ResizeObserver(function(){ layout(); }).observe(fitEl);
}
/* суфлёр едет с transition .2s, ловим конец */
document.addEventListener('transitionend', function(e){
  if(e.target && e.target.id === 'fit') layout();
}, false);
/* дека пересчитывает масштаб через style.transform у #stage.
   ResizeObserver трансформ не ловит, поэтому смотрим за атрибутом. */
if(window.MutationObserver){
  var stEl = document.getElementById('stage');
  if(stEl) new MutationObserver(function(){ layout(); })
    .observe(stEl, { attributes:true, attributeFilter:['style'] });
}

syncUI();
layout();
setTimeout(layout, 300);              /* дека доскейливается после шрифтов */

})();
