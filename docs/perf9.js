/* =====================================================================
   DRAGON BALL SURVIVORS — PERFORMANCE: cached Level 3/4 mobs, frame-rate cap, FPS counter
   Cell-saga drones/larvae and Buu-saga fighters/imps/blobs were redrawn from
   ~20 paths each, every frame: 230 of them cost ~15 ms on a desktop (far more
   on phones). Like Level 1's art, each mob is now painted once per animation
   frame into a small image and stamped with one drawImage. Whole-body motion
   (bob, facing, rotation) is applied when stamping, so nothing moves differently.
   ===================================================================== */
'use strict';

const MOBC = { m: new Map(), q: 0 };
const MOB_FR = 8, MOB_ANG = 16, MOB_SZ = 60;   // frames per cycle, aim directions, sprite box in art units
const MOB_TAU = 6.283185307179586;
// per kind: the cycle's speed (rad/s in the art code), and how the frame / angle / variant are chosen
const MOB_K = {
  dr: { w: 0, ang: 1 }, drg: { w: 0, ang: 1 },   // drones: bob applied when stamping; eye (and gun) follow the hero
  lv: { w: 22, rot: 1 },                         // larvae: legs/tail wiggle; whole body turns to face the hero
  bb: { w: 7 }, bs: { w: 7 },                    // Buu blobs: squash and stretch
  mj: { w: 12, flip: 1 },                        // Majin fighters: stepping; mirrored to face the hero
  imp: { w: 16 },                                // imps: wing flap; bob applied when stamping
};
// the art's own bob, reproduced when stamping
const mobBob = (e, t, sd) => e.k == 'dr' || e.k == 'drg' ? Math.sin(t * 6 + sd) * 2 : e.k == 'imp' ? Math.sin(t * 5 + sd) * 2 : 0;

function mobFrame(fn, e, f, fr, ai, Q) {
  const k = e.k, r = Math.round(e.r), key = k + '|' + (f ? 1 : 0) + '|' + (e.frz ? 1 : 0) + '|' + fr + '|' + ai + '|' + r + '|' + Q;
  let c = MOBC.m.get(key); if (c) return c;
  const sc = r / 12, B = Math.ceil(MOB_SZ * sc * Q);
  c = mk(B, B); const x = c.getContext('2d'); x.setTransform(Q, 0, 0, Q, B / 2, B / 2);
  const K = MOB_K[k], ph = fr / MOB_FR * MOB_TAU;
  // a stand-in mob: same kind and look, posed by choosing the time / seed / hero position the art reads
  const fe = { k, r, x: 0, y: 0, sd: 0, frz: e.frz, elite: e.elite };
  let t = 0;
  if (k == 'imp') { t = ph / 11; fe.sd = -5 * t; }         // wings at phase ph while the bob (5t + sd) stays at 0
  else if (K.w) t = ph / K.w;
  const a = K.ang ? ai / MOB_ANG * MOB_TAU : 0;
  const st = S.t, sp = S.p; S.t = t; S.p = { x: Math.cos(a) * 100, y: Math.sin(a) * 100 };
  try { fn(fe, 0, 0, f, x); } finally { S.t = st; S.p = sp; }
  if (MOBC.m.size > 900) MOBC.m.clear();   // safety valve: sizes/scales changed a lot
  MOBC.m.set(key, c); return c;
}
function mobStamp(fn, e, x, y, f) {
  const K = MOB_K[e.k]; if (!K) return fn(e, x, y, f);
  const Q = Math.min(2, Math.max(1, Math.round(DPR * 2) / 2));   // crisp at the canvas's own resolution, capped at 2x
  const t = S.t, sd = e.sd ?? (e.sd = Math.random() * 6);
  const fr = K.w ? (((Math.floor(((t * K.w + sd) % MOB_TAU + MOB_TAU) % MOB_TAU / MOB_TAU * MOB_FR)) % MOB_FR) + MOB_FR) % MOB_FR : 0;
  const pa = Math.atan2(S.p.y - e.y, S.p.x - e.x);
  const ai = K.ang ? ((Math.round(pa / MOB_TAU * MOB_ANG) % MOB_ANG) + MOB_ANG) % MOB_ANG : 0;
  const c = mobFrame(fn, e, f, fr, ai, Q), s = c.width / Q;
  ctx.save(); ctx.translate(x, y + mobBob(e, t, sd));   // the art bobs in screen units, before its own scale
  if (K.rot) ctx.rotate(pa);
  if (K.flip && Math.cos(pa) < 0) ctx.scale(-1, 1);
  ctx.drawImage(c, -s / 2, -s / 2, s, s);
  ctx.restore();
}
{ const _3 = drawL3Mob; drawL3Mob = function (e, x, y, f, C) { if (C || SET.mobCache === false) return _3(e, x, y, f, C); mobStamp(_3, e, x, y, f); }; }
{ const _4 = drawL4Mob; drawL4Mob = function (e, x, y, f, C) { if (C || SET.mobCache === false) return _4(e, x, y, f, C); mobStamp(_4, e, x, y, f); }; }


/* ---------- frame rate: 60 / 30 cap, and an FPS counter ----------
   The cap paces whole frames by time (so 120/144 Hz screens get 60, and 30 is 30 on any screen). The game
   itself always steps in 1/60 s slices: a 30 fps frame runs two of them, so movement, hits and balance are
   exactly the same at either setting — only drawing is halved. */
const FPS9 = { next: 0, n: 0, t0: 0, fps: 0, dms: 0, dsum: 0 };
{ const _l = loop; loop = function (ts) {
    if (window.DBS_READY) {
      const iv = 1000 / (SET.fps30 ? 30 : 60);
      if (ts < FPS9.next - 2) { requestAnimationFrame(loop); return; }   // too soon: wait for the next display frame
      FPS9.next = Math.max(FPS9.next + iv, ts);
    }
    _l(ts);
    // counter: frames actually drawn in the last second, and the average time spent drawing them
    FPS9.n++; if (!FPS9.t0) FPS9.t0 = ts;
    if (ts - FPS9.t0 >= 1000) { FPS9.fps = Math.round(FPS9.n * 1000 / (ts - FPS9.t0)); FPS9.dms = FPS9.dsum / FPS9.n; FPS9.n = 0; FPS9.dsum = 0; FPS9.t0 = ts; }
  }; }
{ const _u = update; update = function (dt) {   // long frames are simulated as several 1/60 s steps
    const n = dt > 1.25 / 60 ? Math.min(3, Math.round(dt * 60)) : 1;
    if (n == 1) return _u(dt);
    for (let i = 0; i < n; i++) { _u(dt / n); if (S.mode != 'play') break; }
  }; }
{ const _a = adapt; adapt = function (dt) { return _a(SET.fps30 ? dt / 2 : dt); }; }   // a capped 33 ms frame isn't a slow device
{ const _d = draw; draw = function () {
    const a = performance.now(); _d(); FPS9.dsum += performance.now() - a;
    if (!SET.fpsShow || !FPS9.fps) return;
    const tgt = SET.fps30 ? 30 : 60, ok = FPS9.fps >= tgt * .92, meh = FPS9.fps >= tgt * .75, s = FPS9.fps + ' FPS · ' + FPS9.dms.toFixed(1) + ' ms';
    ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.font = 'bold 12px "Trebuchet MS",sans-serif'; ctx.textAlign = 'center';
    const w = ctx.measureText(s).width + 14, y = H - SB - 8;
    ctx.fillStyle = 'rgba(10,4,0,.6)'; ctx.fillRect(W / 2 - w / 2, y - 14, w, 19);
    ctx.fillStyle = ok ? '#8ff08a' : meh ? '#ffd27a' : '#ff8a7a'; ctx.fillText(s, W / 2, y); ctx.restore();
  }; }
{ const _st = settings; settings = function (back) {
    _st(back); const c = ov.querySelector('.card'); if (!c) return; const g = c.querySelector('.sgrid'); if (!g) return;
    const gfx = [...g.querySelectorAll('button.srow')].find(b => (b.getAttribute('onclick') || '') == 'cycleGfx()');
    const rows = `<button class="srow" onclick="togSet('fps30')"><span>Frame rate</span><b>${SET.fps30 ? '30 FPS' : '60 FPS'}</b><small>${SET.fps30 ? 'Saves battery, steadier on older phones' : 'Smoothest'}</small></button>` +
      `<button class="srow" onclick="togSet('fpsShow')"><span>FPS counter</span><b>${SET.fpsShow ? 'On' : 'Off'}</b><small>Shows frame rate at the bottom</small></button>`;
    if (gfx) gfx.insertAdjacentHTML('afterend', rows); else g.insertAdjacentHTML('afterbegin', rows);
  }; }


/* ---------- 2026-11-14: frames that don't need redrawing ----------
   On iPhone the level-up screen dropped to the 40s while drawing took only ~2 ms: the cost was the phone compositing a
   full-resolution canvas (re-uploaded every frame) under the animated upgrade cards. The scene is frozen on that screen
   and on pause, so after a short settle the canvas is simply left as it is until play resumes (or the size changes). */
{ const _d = draw; draw = function () {
    const still = S && (S.mode == 'lvl' || S.mode == 'pause') && !V2.bc && !V2.sc;
    if (still) { const key = S.mode + '|' + cv.width + '|' + cv.height + '|' + (SET.fpsShow ? 1 : 0), now = performance.now();
      if (FPS9.sk !== key) { FPS9.sk = key; FPS9.st = now; }
      if (now - FPS9.st > 350) return; }
    else FPS9.sk = null;
    _d();
  }; }
// Legendary / Mythic upgrade cards slid their gradient with background-position (a full repaint every frame on iOS);
// the pair shine too. Both now move a layer with transform, which the GPU does for free.
{ const st = document.createElement('style'); st.textContent = `
.up.r4,.up.r5{isolation:isolate;overflow:hidden;position:relative;animation:u6in .26s ease-out both}
.up.r4::before,.up.r5::before{content:'';position:absolute;top:0;bottom:0;left:0;width:200%;z-index:-1;pointer-events:none;will-change:transform;animation:lg9 2.2s linear infinite}
.up.r4::before{background:linear-gradient(110deg,#5a3a08,#8a5a10,#5a3a08,#8a5a10,#5a3a08)}
.up.r5::before{background:linear-gradient(110deg,#5a0f08,#a8281a,#5a0f08,#a8281a,#5a0f08);animation-duration:1.6s}
@keyframes lg9{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.card .up.pair7::after{background-size:100% 100%!important;will-change:transform;animation:pair9 2.4s ease-in-out infinite!important}
@keyframes pair9{0%{transform:translateX(-100%)}60%,100%{transform:translateX(100%)}}
@media (prefers-reduced-motion:reduce){.up.r4::before,.up.r5::before,.card .up.pair7::after{animation:none!important;transform:none}}`;
  document.head.append(st); }
