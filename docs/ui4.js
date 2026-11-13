/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — HERO CAROUSEL (EXPANSION_PLAN.md §9.5)
   The hero row becomes a swipeable carousel: the selected hero is large and animated,
   neighbours sit smaller on either side, locked heroes are silhouettes with their unlock.
   ===================================================================== */
'use strict';

const BASE_HEROES = [['goku', 'Goku', 'Saiyan Spirit: +25% damage below 40% HP.'], ['pic', 'Piccolo', 'Namekian Regeneration: heals steadily, faster when hurt.'],
  ['gohan', 'Gohan', 'Hidden Potential: +8% XP, Masenko fires 15% faster, attacks speed up below 35% HP.']];
function heroList() {
  const L = BASE_HEROES.map(([h, n, d]) => ({ h, n, d, ok: 1 }));
  for (const [u, n, req, h] of LOCKED_HEROES) { const a = achFor(u), sec = a && a.c == 'secret' && !achDone(a), ok = HAS(u) && HERO3[h];
    L.push({ h, n: ok || !sec ? n : '???', d: ok ? HERO3[h].d : (sec ? 'Secret' : req), ok: !!ok, sec }); }
  return L;
}
const CAR = { i: 0, raf: 0, busy: 0 };
function carDraw() {
  cancelAnimationFrame(CAR.raf);
  const step = () => {
    const cs = document.querySelectorAll('.hcar canvas'); if (!cs.length) return;
    const T = performance.now() / 1000;
    cs.forEach(c => { const h = c.dataset.h, lk = c.dataset.lk == '1', sel = c.closest('.hcd').classList.contains('on'), x = c.getContext('2d');
      if (!sel && c._d) return; c._d = 1;
      x.clearRect(0, 0, c.width, c.height); const im = sheetOf(h, 0); if (!im) return;
      const row = 1, f = sel && !lk ? Math.floor(T * 8) % FRN[row] : 0;
      x.save(); if (lk) x.filter = 'brightness(0)'; x.globalAlpha = lk ? .75 : 1;
      x.drawImage(im, f * HC + 19, row * HC + 8, 170, 170, 0, 0, c.width, c.height); x.restore();
      if (lk) { x.fillStyle = 'rgba(255,210,122,.9)'; x.font = '800 ' + (c.width * .3 | 0) + 'px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText('?', c.width / 2, c.height * .62); } });
    CAR.raf = requestAnimationFrame(step);
  };
  step();
}
function carGo(d) {
  const L = heroList(), n = L.length; if (CAR.busy) return; let i = (CAR.i + d + n) % n;
  CAR.i = i; carLayout(true);
  const e = L[i]; carDesc(e);
  if (e.ok && e.h != HERO) { CAR.busy = 1; setTimeout(() => { CAR.busy = 0; setHero(e.h); }, 300); }
}
function carLayout(anim) {
  const tr = document.querySelector('.hcar .htrack'); if (!tr) return;
  const cards = [...tr.children], n = cards.length;
  cards.forEach((c, j) => { let o = j - CAR.i; if (o > n / 2) o -= n; if (o < -n / 2) o += n;
    c.style.transition = anim ? 'transform .3s ease, opacity .3s' : 'none';
    const a = Math.abs(o); c.style.transform = `translateX(${o * 62}%) scale(${a == 0 ? 1 : a == 1 ? .66 : .45})`; c.style.opacity = a == 0 ? 1 : a == 1 ? .75 : a == 2 ? .35 : 0;
    c.style.zIndex = 10 - a; c.style.pointerEvents = a > 1 ? 'none' : 'auto'; c.classList.toggle('on', a == 0); if (a == 0) { const cv = c.querySelector('canvas'); if (cv) cv._d = 0; } });
  document.querySelectorAll('.hcar .hdt').forEach((d, j) => d.classList.toggle('on', j == CAR.i));
}
function carDesc(e) {
  const d = ov.querySelector('.hdesc'); if (!d) return;
  d.innerHTML = e.ok ? `<b>${e.n}</b> · ${e.d}` : `<b>${e.n}</b> · 🔒 ${e.d}<br><small>You'll play as ${(heroList().find(q => q.h == HERO) || {}).n || 'Goku'}</small>`;
}
{ const _m = menu; menu = function () {
    _m(); const hs = ov.querySelector('.heroes'); if (!hs || !PROG_READY) return;
    const L = heroList(); CAR.i = Math.max(0, L.findIndex(e => e.h == HERO));
    const car = document.createElement('div'); car.className = 'hcar';
    car.innerHTML = `<button class="ha" aria-label="Previous hero" onclick="carGo(-1)">‹</button><div class="hview"><div class="htrack">` +
      L.map((e, j) => `<div class="hcd${e.ok ? '' : ' lk'}" data-j="${j}"><canvas width="160" height="160" data-h="${e.h}" data-lk="${e.ok ? 0 : 1}"></canvas><b>${e.n}</b></div>`).join('') +
      `</div></div><button class="ha" aria-label="Next hero" onclick="carGo(1)">›</button><div class="hdots">${L.map((e, j) => `<span class="hdt${e.ok ? '' : ' lk'}"></span>`).join('')}</div>`;
    hs.replaceWith(car);
    if (!ov.querySelector('.hdesc')) car.insertAdjacentHTML('afterend', '<p class="hdesc"></p>');
    carDesc(L[CAR.i]); carLayout(false); carDraw();
    // tap a neighbour to move to it; swipe the strip
    for (const c of car.querySelectorAll('.hcd')) c.onclick = () => { const j = +c.dataset.j, n = L.length; let o = j - CAR.i; if (o > n / 2) o -= n; if (o < -n / 2) o += n; if (o) carGo(o); };
    const v = car.querySelector('.hview'); let x0 = null;
    v.addEventListener('pointerdown', e => { x0 = e.clientX; });
    v.addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 35) carGo(dx < 0 ? 1 : -1); });
  }; }
addEventListener('keydown', e => { if (S && S.mode == 'menu' && document.querySelector('.hcar') && (e.key == 'ArrowLeft' || e.key == 'ArrowRight')) { e.preventDefault(); carGo(e.key == 'ArrowLeft' ? -1 : 1); } });

document.head.insertAdjacentHTML('beforeend', `<style>
.hcar{position:relative;display:flex;align-items:center;gap:4px;margin:8px 0 0}
.hcar .ha{flex:none;width:34px;height:52px;padding:0;font:800 30px/1 system-ui,sans-serif;border-radius:10px;z-index:20}
.hview{position:relative;flex:1;height:150px;overflow:hidden;touch-action:pan-y;user-select:none}
.htrack{position:absolute;inset:0}
.hcd{position:absolute;left:50%;top:0;width:120px;margin-left:-60px;text-align:center;cursor:pointer;transform-origin:50% 60%}
.hcd canvas{position:static;inset:auto;display:block;width:120px;height:120px;margin:0 auto;border-radius:50%;background:radial-gradient(circle,#5a3a10 0,#2a1606 65%,rgba(0,0,0,0) 70%)}
.hcd.on canvas{background:radial-gradient(circle,#8a5a10 0,#3a2006 62%,rgba(0,0,0,0) 70%);filter:drop-shadow(0 0 10px #ffb300)}
.hcd b{display:block;font-size:15px;margin-top:-4px}.hcd.lk b{opacity:.75}
.hdots{position:absolute;left:0;right:0;bottom:-10px;display:flex;justify-content:center;gap:5px}
.hdt{width:7px;height:7px;border-radius:50%;background:#6a4a20}.hdt.lk{background:#3a2a14}.hdt.on{background:#ffd27a;box-shadow:0 0 6px #ffb300}
.hcar+.hdesc,.hdesc{margin:14px 0 8px}
@media (max-width:600px){.hview{height:132px}.hcd{width:104px;margin-left:-52px}.hcd canvas{width:104px;height:104px}}
@media (orientation:landscape) and (max-height:360px){.hview{height:96px}.hcd{width:72px;margin-left:-36px}.hcd canvas{width:72px;height:72px}}
</style>`);
// the save can finish loading before this (last) script runs; redraw the menu so every layer's additions appear
if (PROG_READY && S && S.mode == 'menu' && !svWelcomeOn) menu();
