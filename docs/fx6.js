/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — EFFECTS POLISH (visual only; no gameplay numbers change)
   Restyles the shared effect primitives every attack is built from, so the whole game lifts at once:
     · explosions: core flash + thick shock ring + tapered spikes (was a soft blurry blob)
     · sparks: streaks along their velocity; dust: real puffs tinted to the ground
     · hit sparks: a 4-point anime star + ring
     · beams: wavy-edged body, white core, flowing streaks, charge bulb at the hands
     · atmosphere per map: drifting cloud shadows, themed floating particles, colour grade, vignette
     · running dust under the hero, sparkle on XP gems
   ===================================================================== */
'use strict';

const V6 = { dT: 0, cols: {}, glows: {} };
// '#abc' / '#aabbcc' -> 'r,g,b'
function rgbOf(c) {
  let v = V6.cols[c]; if (v) return v;
  if (typeof c == 'string' && c[0] == '#') { const h = c.length == 4 ? c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c.slice(1, 7), n = parseInt(h, 16); v = isNaN(n) ? '255,214,120' : ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255); }
  else v = '255,214,120';
  return V6.cols[c] = v;
}
// a soft coloured glow without the white-hot centre the stock one has (that centre is what made explosions read as blobs)
function softGlow(rgb, x, y, r, a) {
  let g = V6.glows[rgb];
  if (!g) { g = mk(64, 64); const q = g.getContext('2d'), d = q.createRadialGradient(32, 32, 0, 32, 32, 32); d.addColorStop(0, 'rgba(' + rgb + ',.85)'); d.addColorStop(.45, 'rgba(' + rgb + ',.32)'); d.addColorStop(1, 'rgba(' + rgb + ',0)'); q.fillStyle = d; q.fillRect(0, 0, 64, 64); V6.glows[rgb] = g; }
  ctx.globalAlpha = Math.max(0, Math.min(1, a)); ctx.drawImage(g, x - r, y - r, r * 2, r * 2); ctx.globalAlpha = 1;
}
function star4(x, y, s, w, a) {   // 4-point star: two thin diamonds at right angles
  const c = Math.cos(a), n = Math.sin(a); ctx.beginPath();
  ctx.moveTo(x + c * s, y + n * s); ctx.lineTo(x - n * w, y + c * w); ctx.lineTo(x - c * s, y - n * s); ctx.lineTo(x + n * w, y - c * w); ctx.closePath();
  ctx.moveTo(x - n * s, y + c * s); ctx.lineTo(x - c * w, y - n * w); ctx.lineTo(x + n * s, y - c * s); ctx.lineTo(x + c * w, y + n * w); ctx.closePath(); ctx.fill();
}

/* ---------- which map are we on (drives dust colour, particles and grading) ---------- */
function theme6() {
  const st = S.stage;
  if (st == 2) return 'namek'; if (st == 3) return 'city';
  if (st == 4) { const ph = typeof mph4 == 'function' ? mph4() : 0; return ph == 0 ? 'ship' : ph == 1 ? 'waste4' : 'candy'; }
  return 'waste';
}
const ATM6 = {
  waste: { dust: '176,146,108', cloud: .13, top: '255,150,60,.10', bot: '70,20,80,.20', vig: '20,6,0' },
  namek: { dust: '190,230,205', cloud: .12, top: '120,255,170,.09', bot: '10,60,90,.22', vig: '0,14,12' },
  city: { dust: '150,150,160', cloud: .16, top: '255,170,120,.07', bot: '24,28,80,.24', vig: '6,6,16' },
  ship: { dust: '170,140,190', cloud: 0, top: '255,90,200,.06', bot: '40,10,70,.24', vig: '14,0,20' },
  waste4: { dust: '176,140,120', cloud: .13, top: '255,120,150,.10', bot: '80,20,80,.20', vig: '20,4,10' },
  candy: { dust: '210,170,200', cloud: .10, top: '255,170,220,.10', bot: '90,20,90,.20', vig: '20,4,18' }
};

/* ---------- explosions, sparks and dust ---------- */
const DUST6 = '#9a8468';
function ringFx(f, x, y, k) {   // glow is additive; the shapes are drawn solid so they keep their colour over bright ground
  const u = 1 - k, r = f.r, rgb = rgbOf(f.c || '#ffb'), e = 1 - k * k, R = r * (.32 + .98 * e), low = GFX == 'low';
  softGlow(rgb, x, y, r * (1.2 - u * .3), k * .5);
  NM();
  if (u < .22) { const a = 1 - u / .22; ctx.fillStyle = 'rgba(255,255,255,' + a * .85 + ')'; ctx.beginPath(); ctx.arc(x, y, r * (.16 + .3 * u / .22), 0, 7); ctx.fill(); }
  ctx.strokeStyle = 'rgba(' + rgb + ',' + k * .95 + ')'; ctx.lineWidth = Math.max(1.2, r * .13 * k); ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.stroke();
  if (r > 26) { ctx.strokeStyle = 'rgba(255,255,255,' + k * .7 + ')'; ctx.lineWidth = Math.max(.8, r * .035 * k); ctx.beginPath(); ctx.arc(x, y, R * .93, 0, 7); ctx.stroke(); }
  if (!low) {
    const n = r > 40 ? 8 : 5, a0 = (f.x * .37 + f.y * .61) % 6.283, wd = .07 * k + .015;
    ctx.fillStyle = 'rgba(' + rgb + ',' + k * .75 + ')'; ctx.beginPath();
    for (let i = 0; i < n; i++) { const a = a0 + i / n * 6.283, r0 = R * .78, r1 = R * (1.16 + .26 * (i & 1));
      ctx.moveTo(x + Math.cos(a - wd) * r0, y + Math.sin(a - wd) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); ctx.lineTo(x + Math.cos(a + wd) * r0, y + Math.sin(a + wd) * r0); }
    ctx.fill();
    if (r >= 60 && u > .18) { const k2 = Math.max(0, 1 - (u - .18) / .82), R2 = r * (.2 + .7 * (1 - k2 * k2)); ctx.strokeStyle = 'rgba(' + rgb + ',' + k2 * .5 + ')'; ctx.lineWidth = Math.max(1, r * .05 * k2); ctx.beginPath(); ctx.arc(x, y, R2, 0, 7); ctx.stroke(); }
  }
  LT();
}
drawFx = function (cx, cy) {   // called with the additive blend mode on; must leave it on
  let dust = 0; ctx.lineCap = 'round';
  for (const f of S.fx) {
    const x = f.x - cx, y = f.y - cy; if (x < -260 || y < -260 || x > W + 260 || y > H + 260) continue;
    const k = Math.max(0, f.l / f.T);
    if (f.ring) { ringFx(f, x, y, k); continue; }
    if (f.c == DUST6) { dust++; continue; }
    const vx = f.vx || 0, vy = f.vy || 0, v = Math.abs(vx) + Math.abs(vy);
    ctx.globalAlpha = k;
    if (v > 70) { ctx.strokeStyle = f.c; ctx.lineWidth = f.s * (.5 + .7 * k) + .6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - vx * .05, y - vy * .05); ctx.stroke(); }
    else { ctx.fillStyle = f.c; ctx.beginPath(); ctx.arc(x, y, f.s, 0, 7); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  if (dust) { NM(); const d = ATM6[theme6()].dust;
    for (const f of S.fx) { if (f.ring || f.c != DUST6) continue; const x = f.x - cx, y = f.y - cy, k = Math.max(0, f.l / f.T), r = f.s * (1 + (1 - k) * 1.3);
      ctx.fillStyle = 'rgba(' + d + ',' + k * .5 + ')'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,' + k * .16 + ')'; ctx.beginPath(); ctx.arc(x - r * .25, y - r * .3, r * .5, 0, 7); ctx.fill(); }
    LT(); }
};

/* ---------- hit sparks ---------- */
drawImpacts = function (cx, cy) {
  if (!V2.imp || !V2.imp.length) return; LT();
  for (const q of V2.imp) { const k = q.t / q.T, x = q.x - cx, y = q.y - cy; if (x < -200 || y < -200 || x > W + 200 || y > H + 200) continue;
    const C = IMPC[q.c] || IMPC.or, rgb = C[1], a = 1 - k, rr = q.r * (.3 + .9 * (1 - a * a));
    softGlow(rgb, x, y, q.r * 1.15, a * .4);
    if (k < .55) { const j = 1 - k / .55; ctx.fillStyle = 'rgba(255,255,255,' + j + ')'; star4(x, y, q.r * (.6 + .7 * k), q.r * .11 * j + .5, q.a); }
    ctx.strokeStyle = 'rgba(' + rgb + ',' + a + ')'; ctx.lineWidth = 1 + q.r * .06 * a * a; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.stroke();
    if (GFX != 'low') { ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i < 5; i++) { const g = q.a + .6 + i * 1.257, r0 = rr * .8, r1 = rr * (1.2 + .25 * (i & 1)); ctx.moveTo(x + Math.cos(g) * r0, y + Math.sin(g) * r0); ctx.lineTo(x + Math.cos(g) * r1, y + Math.sin(g) * r1); } ctx.stroke(); }
  }
  NM();
};

/* ---------- beams ---------- */
// drawn in the beam's own frame (origin at the hero, +x along the beam), additive
drawBeam = function (b, t) {
  const k = b.t / b.T;
  beam6(W / 2, H / 2, b.a, b.len || 650, b.w * Math.min(1, k * 3) * Math.min(1, (1 - k) * 9 + .3), BP[b.pal || 'kame'], k, t, b.sup ? 1 : 0, b.side, b.pal == 'sbc');
};
// x,y = where it leaves the hands; a = direction; Q = [halo 'rgba(r,g,b,', body 'rgba(r,g,b,', glow name]; k = 1 at birth -> 0 at the end
function beam6(bx, by, ang, len, w0, Q, k, t, sup, side, spiral) {
  const al = sup ? .6 : 1, w = w0 * (.95 + .05 * Math.sin(t * 55)), hw = w / 2, x0 = 12, N = GFX == 'low' ? 8 : 16;
  LT(); ctx.save(); ctx.translate(bx, by); ctx.rotate(ang);
  // halo (additive)
  let g = ctx.createLinearGradient(0, -w * .95, 0, w * .95); g.addColorStop(0, Q[0] + '0)'); g.addColorStop(.5, Q[0] + .34 * al + ')'); g.addColorStop(1, Q[0] + '0)');
  ctx.fillStyle = g; ctx.fillRect(x0, -w * .95, len - x0, w * 1.9);
  // solid body with rippling edges: drawn un-blended so it keeps its colour over bright ground
  NM(); ctx.globalAlpha = sup ? .72 : .92;
  const edge = (x, s) => s * hw * (1 + .09 * Math.sin(x * .034 - t * 30 + (s > 0 ? 0 : 1.7)) + .04 * Math.sin(x * .09 + t * 47)), tp = i => Math.min(1, i * 2.6 / N + .3);
  g = ctx.createLinearGradient(0, -hw, 0, hw); g.addColorStop(0, Q[0] + '.75)'); g.addColorStop(.2, Q[1] + '1)'); g.addColorStop(.4, 'rgba(235,248,255,1)'); g.addColorStop(.5, '#fff'); g.addColorStop(.6, 'rgba(235,248,255,1)'); g.addColorStop(.8, Q[1] + '1)'); g.addColorStop(1, Q[0] + '.75)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, 0);
  for (let i = 0; i <= N; i++) { const x = x0 + (len - x0) * i / N; ctx.lineTo(x, edge(x, -1) * tp(i)); }
  ctx.quadraticCurveTo(len + hw * 1.1, 0, len, edge(len, 1));
  for (let i = N; i >= 0; i--) { const x = x0 + (len - x0) * i / N; ctx.lineTo(x, edge(x, 1) * tp(i)); }
  ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  if (spiral) {   // Special Beam Cannon: twin spirals round the beam
    ctx.lineWidth = Math.max(2, w * .2);
    for (const ph of [0, 3.14]) { ctx.strokeStyle = 'rgba(190,70,255,' + (ph ? .45 : .9) + ')'; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const px = x0 + i * (len - x0) / 60, py = Math.sin(i * .55 - t * 40 + ph) * w * .46; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
  } else if (GFX != 'low') {   // energy streaks flowing down the beam
    ctx.fillStyle = 'rgba(255,255,255,' + .7 * al + ')';
    for (let i = 0; i < 9; i++) { const px = x0 + (((i * 97 - t * 620) % (len - x0)) + (len - x0)) % (len - x0), py = hw * (.62 * ((i * 53 % 7) / 3 - 1)); ctx.fillRect(px, py - 1, 34 + (i % 3) * 14, 2); }
  }
  LT();
  // charge bulb at the hands, flare at the tip
  if (!side) { const br = w * (sup ? .36 : .5) * (1 + .06 * Math.sin(t * 40));
    g = ctx.createRadialGradient(x0, 0, 0, x0, 0, br); g.addColorStop(0, 'rgba(255,255,255,' + (sup ? .6 : .95) + ')'); g.addColorStop(.3, 'rgba(255,255,255,' + (sup ? .3 : .6) + ')'); g.addColorStop(.6, Q[1] + .5 * al + ')'); g.addColorStop(1, Q[0] + '0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x0, 0, br, 0, 7); ctx.fill();
    if (!sup && GFX != 'low') { ctx.strokeStyle = Q[1] + .6 * k + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x0, 0, br * (1.1 + .6 * (1 - k)), -1.9, 1.9); ctx.stroke(); } }
  gl(Q[2], len, 0, w * .55, .5 * al);
  ctx.restore();
}

/* ---------- atmosphere: cloud shadows, floating particles, grade, vignette ---------- */
const CLOUD6 = (() => { const c = mk(320, 320), x = c.getContext('2d');
  for (let i = 0; i < 9; i++) { const px = hash(i, 91) * 320, py = hash(i, 92) * 320, r = 46 + hash(i, 93) * 64;
    for (const ox of [-320, 0, 320]) for (const oy of [-320, 0, 320]) { const q = x.createRadialGradient(px + ox, py + oy, r * .15, px + ox, py + oy, r); q.addColorStop(0, 'rgba(10,6,24,.85)'); q.addColorStop(1, 'rgba(10,6,24,0)'); x.fillStyle = q; x.fillRect(0, 0, 320, 320); } }
  return c; })();
const CLOUDP6 = ctx.createPattern(CLOUD6, 'repeat'); CLOUDP6.setTransform(new DOMMatrix().scale(2.5));
const CT6 = 800;   // cloud tile size on screen
function motes6(th, cx, cy, t) {
  const low = GFX == 'low', n = low ? 10 : 30;
  const wrapX = v => ((v % (W + 40)) + W + 40) % (W + 40) - 20, wrapY = v => ((v % (H + 40)) + H + 40) % (H + 40) - 20;
  if (th == 'waste' || th == 'waste4') {   // wind-blown sand streaks + a few grains
    for (let i = 0; i < n; i++) { const par = .7 + hash(i, 6) * .7, x = wrapX(hash(i, 5) * (W + 40) - cx * par + t * (60 + hash(i, 7) * 90)), y = wrapY(hash(i, 8) * (H + 40) - cy * par + Math.sin(t * 1.3 + i) * 12), l = 8 + hash(i, 9) * 22;
      ctx.fillStyle = 'rgba(255,232,186,' + (.12 + hash(i, 10) * .2) + ')'; ctx.fillRect(x, y, l, 1.4); }
  } else if (th == 'namek') {   // glowing spores drifting up
    LT(); for (let i = 0; i < n; i++) { const par = .8 + hash(i, 16) * .5, x = wrapX(hash(i, 15) * (W + 40) - cx * par + Math.sin(t * .7 + i * 1.7) * 18), y = wrapY(hash(i, 18) * (H + 40) - cy * par - t * (10 + hash(i, 17) * 16)), r = 5 + hash(i, 19) * 6;
      softGlow(i % 3 ? '170,255,220' : '255,255,200', x, y, r, .35 + .3 * Math.sin(t * 2.2 + i * 2.3)); } NM();
  } else if (th == 'city') {   // falling ash, rising embers
    for (let i = 0; i < n; i++) { const par = .8 + hash(i, 26) * .5, x = wrapX(hash(i, 25) * (W + 40) - cx * par - t * (14 + hash(i, 27) * 20) + Math.sin(t + i) * 10), y = wrapY(hash(i, 28) * (H + 40) - cy * par + t * (22 + hash(i, 29) * 26)), s = 1.4 + hash(i, 30) * 2;
      ctx.fillStyle = 'rgba(210,210,220,' + (.18 + hash(i, 31) * .22) + ')'; ctx.fillRect(x, y, s, s * (.5 + .5 * Math.abs(Math.sin(t * 3 + i)))); }
    if (!low) { LT(); for (let i = 0; i < 9; i++) { const x = wrapX(hash(i, 35) * (W + 40) - cx + Math.sin(t * 1.1 + i * 2) * 22), y = wrapY(hash(i, 38) * (H + 40) - cy - t * (26 + hash(i, 37) * 30));
      softGlow('255,150,60', x, y, 4 + hash(i, 39) * 3, .4 + .35 * Math.sin(t * 5 + i * 3)); } NM(); }
  } else if (th == 'ship') {   // slow motes of Babidi's magic
    LT(); for (let i = 0; i < n; i++) { const par = .8 + hash(i, 46) * .5, x = wrapX(hash(i, 45) * (W + 40) - cx * par + Math.sin(t * .5 + i * 1.3) * 26), y = wrapY(hash(i, 48) * (H + 40) - cy * par + Math.cos(t * .4 + i * 2.1) * 26), r = 5 + hash(i, 49) * 7;
      softGlow(i % 2 ? '255,110,220' : '170,120,255', x, y, r, .28 + .26 * Math.sin(t * 1.7 + i * 2.9)); } NM();
  } else {   // candy city: twinkles
    LT(); ctx.fillStyle = 'rgba(255,220,245,.9)'; for (let i = 0; i < n; i++) { const par = .8 + hash(i, 56) * .5, tw = Math.sin(t * 2.4 + i * 2.7); if (tw < .1) continue; const x = wrapX(hash(i, 55) * (W + 40) - cx * par), y = wrapY(hash(i, 58) * (H + 40) - cy * par - t * 6);
      ctx.globalAlpha = tw * .7; star4(x, y, 3 + tw * 5 + hash(i, 59) * 3, .9, .2); } ctx.globalAlpha = 1; NM();
  }
}
let vig6 = null, vig6k = '';
drawAtmos = function (cx, cy, t) {
  const th = theme6(), A = ATM6[th];
  if (A.cloud && GFX != 'low') {   // cloud shadows sliding across the ground (and everyone on it)
    const ox = (((cx + t * 16) % CT6) + CT6) % CT6, oy = (((cy + t * 6) % CT6) + CT6) % CT6;
    ctx.save(); ctx.translate(-ox, -oy); ctx.globalAlpha = A.cloud; ctx.fillStyle = CLOUDP6; ctx.fillRect(0, 0, W + CT6, H + CT6); ctx.restore(); ctx.globalAlpha = 1; }
  motes6(th, cx, cy, t);
  const tg = ctx.createLinearGradient(0, 0, 0, H); tg.addColorStop(0, 'rgba(' + A.top + ')'); tg.addColorStop(1, 'rgba(' + A.bot + ')'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W, H);
  const key = W + 'x' + H + th;
  if (vig6k != key) { vig6k = key; vig6 = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .36, W / 2, H / 2, Math.hypot(W, H) * .6); vig6.addColorStop(0, 'rgba(' + A.vig + ',0)'); vig6.addColorStop(.7, 'rgba(' + A.vig + ',.22)'); vig6.addColorStop(1, 'rgba(' + A.vig + ',.6)'); }
  ctx.fillStyle = vig6; ctx.fillRect(0, 0, W, H);
};

/* ---------- running dust under the hero ---------- */
{ const _u = update; update = function (dt) {
    _u(dt); const p = S.p; if (S.mode != 'play' || !p) return;
    V6.dT -= dt; if (p.run && V6.dT <= 0 && S.fx.length < FXCAP() - 30 && theme6() != 'ship') { V6.dT = .13;
      const mx = S.mvx || 0, my = S.mvy || 0; S.fx.push({ x: p.x - mx * 8 + (Math.random() - .5) * 8, y: p.y + 20 + (Math.random() - .5) * 4, vx: -mx * 24 + (Math.random() - .5) * 14, vy: -my * 24 - 10, l: .42, T: .42, c: DUST6, s: 2.6 + Math.random() * 2.2 }); }
  }; }

/* ---------- attack restyles (drawing only) ---------- */
// a blade-shaped crescent: thick in the middle, pointed at both ends
function crescent6(x, y, R, a, sp, wd) { ctx.beginPath(); ctx.arc(x, y, R, a - sp, a + sp); ctx.arc(x - Math.cos(a) * wd, y - Math.sin(a) * wd, R, a + sp * .9, a - sp * .9, true); ctx.closePath(); }
const GQ6 = { gal: ['rgba(140,50,255,', 'rgba(196,120,255,', 'pu'], fin: ['rgba(255,170,30,', 'rgba(255,222,110,', 'or'] };
drawW3 = function (cx, cy, t) {
  const p = S.p, px = p.x - cx, py = p.y - cy; ctx.lineCap = 'round';
  // Galick Gun / Final Flash: energy gathers at the hands, then a full beam
  for (const b of arr('gal')) { const Q = GQ6[b.fin ? 'fin' : 'gal'], rgb = b.fin ? '255,214,110' : '200,130,255';
    if (b.ch > 0) { const k = 1 - b.ch / .45; LT(); softGlow(rgb, px, py, 22 + 30 * k, .5 + .4 * k); gl('wh', px, py, 7 + 9 * k, .8 * k);
      ctx.strokeStyle = 'rgba(' + rgb + ',' + (.3 + .6 * k) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 46 * (1 - k) + 10, 0, 7); ctx.stroke();
      ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * .785 + t * 3, r1 = 52 * (1 - k) + 16, r0 = r1 + 14; ctx.moveTo(px + Math.cos(a) * r0, py + Math.sin(a) * r0); ctx.lineTo(px + Math.cos(a) * r1, py + Math.sin(a) * r1); } ctx.stroke(); NM(); continue; }
    const k = Math.max(0, 1 - b.t / b.T); beam6(px, py, b.a ?? b.a0, b.len, b.w * 1.12 * Math.min(1, (1 - k) * 10 + .35) * Math.min(1, k * 5 + .15), Q, k, t, 0, 0, 0); NM(); }
  // Explosive Wave: a dome of fire rolling outwards
  for (const w of arr('wav')) { if (w.dl > 0 || !w.r) continue; const k = w.t / w.T, a = 1 - k, x = w.x - cx, y = w.y - cy, R = w.r;
    LT(); const g = ctx.createRadialGradient(x, y, Math.max(0, R - 60), x, y, R + 6); g.addColorStop(0, 'rgba(255,170,60,0)'); g.addColorStop(.75, 'rgba(255,170,60,' + .3 * a + ')'); g.addColorStop(1, 'rgba(255,236,170,' + .5 * a + ')');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R + 6, 0, 7); ctx.fill(); NM();
    if (GFX != 'low') { const n = Math.max(14, Math.min(40, R / 7 | 0)); ctx.fillStyle = 'rgba(255,196,80,' + .85 * a + ')'; ctx.beginPath();   // flame tongues along the rim
      for (let i = 0; i < n; i++) { const q = i / n * 6.283 + t * .6, fl = 10 + 12 * Math.abs(Math.sin(t * 14 + i * 2.3)), wd = 2.6 / n;
        ctx.moveTo(x + Math.cos(q - wd) * R, y + Math.sin(q - wd) * R); ctx.lineTo(x + Math.cos(q + wd * .6) * (R + fl), y + Math.sin(q + wd * .6) * (R + fl)); ctx.lineTo(x + Math.cos(q + wd) * R, y + Math.sin(q + wd) * R); } ctx.fill(); }
    ctx.strokeStyle = 'rgba(255,150,40,' + a + ')'; ctx.lineWidth = 7 * a + 2; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,250,225,' + a + ')'; ctx.lineWidth = 2.5 * a + .8; ctx.beginPath(); ctx.arc(x, y, R - 1, 0, 7); ctx.stroke(); }
  // Tri-Beam: a burning triangle with glowing corners
  for (const z of arr('tris')) { const x = z.x - cx, y = z.y - cy, k = z.t / z.T, pulse = .5 + .5 * Math.sin(t * 18), heat = Math.min(1, z.n / 8), fd = 1 - k * .4, P3 = [];
    for (let i = 0; i < 3; i++) { const a = z.rot + i * 2.094 - 1.5708; P3.push([x + Math.cos(a) * z.s, y + Math.sin(a) * z.s]); }
    const tri = () => { ctx.beginPath(); P3.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.closePath(); };
    LT(); const g = ctx.createRadialGradient(x, y, 0, x, y, z.s); g.addColorStop(0, 'rgba(255,240,170,' + (.3 + .25 * heat) * fd + ')'); g.addColorStop(1, 'rgba(255,' + Math.round(170 - 70 * heat) + ',40,' + (.1 + .12 * heat) * fd + ')'); tri(); ctx.fillStyle = g; ctx.fill(); NM();
    ctx.lineJoin = 'round'; tri(); ctx.strokeStyle = 'rgba(255,140,30,' + .9 * fd + ')'; ctx.lineWidth = 7 + 3 * heat; ctx.stroke(); ctx.strokeStyle = 'rgba(255,252,220,' + (.7 + .3 * pulse) * fd + ')'; ctx.lineWidth = 2.5 + 1.5 * heat; ctx.stroke();
    LT(); for (const [a, b] of P3) { softGlow('255,200,90', a, b, 16 + 6 * pulse, .8 * fd); gl('wh', a, b, 6, .9 * fd); } NM(); }
  // Wolf Fang Fist: three claw rakes; Instant Transmission streaks
  for (const f of arr('wfx')) { const x = f.x - cx, y = f.y - cy, k = Math.max(0, f.l / (f.tp ? .25 : .18)), c = Math.cos(f.a), s = Math.sin(f.a);
    if (f.tp) { ctx.strokeStyle = 'rgba(160,220,255,' + k * .5 + ')'; ctx.lineWidth = 9 * k; ctx.beginPath(); ctx.moveTo(f.tp[0] - cx, f.tp[1] - cy); ctx.lineTo(x, y); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,' + k + ')'; ctx.lineWidth = 2.5 * k; ctx.stroke(); }
    for (let i = -1; i <= 1; i++) { const o = i * 7, L = 20 - Math.abs(i) * 4, wd = 3.6 * k + .6, ax = x - s * o, ay = y + c * o;
      ctx.fillStyle = 'rgba(255,150,50,' + k + ')'; ctx.beginPath(); ctx.moveTo(ax - c * L, ay - s * L); ctx.quadraticCurveTo(ax - s * wd * 1.6, ay + c * wd * 1.6, ax + c * L, ay + s * L); ctx.quadraticCurveTo(ax + s * wd * 1.6, ay - c * wd * 1.6, ax - c * L, ay - s * L); ctx.fill();
      ctx.fillStyle = 'rgba(255,250,225,' + k + ')'; ctx.beginPath(); ctx.moveTo(ax - c * L * .8, ay - s * L * .8); ctx.quadraticCurveTo(ax - s * wd * .7, ay + c * wd * .7, ax + c * L * .8, ay + s * L * .8); ctx.quadraticCurveTo(ax + s * wd * .7, ay - c * wd * .7, ax - c * L * .8, ay - s * L * .8); ctx.fill(); } }
  // Afterimages: translucent copies of the hero
  for (const a of arr('aims')) { const x = a.x - cx, y = a.y - cy, k = Math.max(0, a.t);
    ctx.save(); ctx.translate(x, y); ctx.scale(a.f < 0 ? -1 : 1, 1); ctx.globalAlpha = .25 + .3 * k;
    ctx.drawImage(SHEET(), 0, 2 * HC, HC, HC, -HOX / HC * HD, HDY, HD, HD); ctx.restore();
    ctx.strokeStyle = 'rgba(170,220,255,' + (.25 + .5 * (1 - k)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, a.R * (1 - k * .5), 0, 7); ctx.stroke(); }
  // Scattering Bullet: the mother orb rises, then the shards rain down with tails
  const orb = (x, y, r) => { LT(); softGlow('255,190,70', x, y, r * 2.6, .8); NM(); ctx.fillStyle = '#ffc23a'; ctx.strokeStyle = '#a04a08'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fffbe6'; ctx.beginPath(); ctx.arc(x - r * .15, y - r * .15, r * .55, 0, 7); ctx.fill(); };
  for (const o of arr('sca')) { const k = 1 - o.t / .45; orb(o.x - cx, o.y - cy - 70 * k, 8 + 4 * k); }
  for (const s of arr('shd')) { const at = q => [s.x0 + (s.tx - s.x0) * q - cx, s.y0 + (s.ty - s.y0) * q - cy - Math.sin(q * 3.1416) * 50], k = s.t / s.T, [x, y] = at(k), [x1, y1] = at(Math.max(0, k - .12));
    ctx.strokeStyle = 'rgba(255,180,60,.55)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y); ctx.stroke(); orb(x, y, 4.2); }
  NM();
};
// Shining Sword Attack: real blade arcs instead of stroked lines; the barrier gains a glass highlight and lit corners
drawW4 = function (cx, cy, t) {
  const p = S.p, px = p.x - cx, py = p.y - cy, B = S.bar;
  if (B && B.r) { const k = B.pulse / .35, R = B.r * (1 + .35 * k), E = S.evo.barrier, c0 = E ? '255,220,140' : '140,200,255', c1 = E ? '255,240,200' : '200,235,255';
    const g = ctx.createRadialGradient(px, py, R * .55, px, py, R); g.addColorStop(0, 'rgba(' + c0 + ',0)'); g.addColorStop(.85, 'rgba(' + c0 + ',' + (.12 + .25 * k) + ')'); g.addColorStop(1, 'rgba(' + c1 + ',' + (.35 + .4 * k) + ')');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, R, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(' + c1 + ',' + (.5 + .4 * k) + ')'; ctx.lineWidth = 1.5 + 2 * k; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + t * .4; ctx.moveTo(px + Math.cos(a) * R, py + Math.sin(a) * R); ctx.lineTo(px + Math.cos(a + 1.047) * R, py + Math.sin(a + 1.047) * R); } ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,' + (.35 + .3 * k) + ')'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(px, py, R * .88, -2.5, -1.7); ctx.stroke();
    LT(); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + t * .4; softGlow(c1, px + Math.cos(a) * R, py + Math.sin(a) * R, 7 + 5 * k, .7); } NM(); }
  for (const f of arr('swf')) { const k = f.l / .2; LT(); gl('cy', f.x0 - cx, f.y0 - cy, 12, k); NM();
    if (f.x1 !== undefined) { ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(120,200,255,' + k * .5 + ')'; ctx.lineWidth = 8 * k; ctx.beginPath(); ctx.moveTo(f.x0 - cx, f.y0 - cy); ctx.lineTo(f.x1 - cx, f.y1 - cy); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,' + k + ')'; ctx.lineWidth = 2.5; ctx.stroke(); } }
  for (const s of arr('sws')) { if (s.t > 0 || !s.h) continue;
    if (s.fin) { const k = s.T / .3, x = s.x - cx, y = s.y - cy; LT(); softGlow(s.E ? '255,200,90' : '120,200,255', x, y, s.BR * (1.3 - .3 * k), .7 * k); ctx.fillStyle = 'rgba(255,255,255,' + k + ')'; star4(x, y, s.BR * (1.5 - .5 * k), s.BR * .1 * k + 1, .785); NM(); continue; }
    const k = s.T / .16, x = s.x - cx, y = s.y - cy, R = s.R * .85, sp = 1.05 - (1 - k) * .25;
    LT(); ctx.fillStyle = 'rgba(110,190,255,' + .45 * k + ')'; crescent6(x, y, R * 1.06, s.a, sp * 1.05, R * .34); ctx.fill(); NM();
    ctx.fillStyle = 'rgba(190,232,255,' + .95 * k + ')'; crescent6(x, y, R, s.a, sp, R * .22); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,' + k + ')'; crescent6(x, y, R, s.a, sp * .9, R * .09); ctx.fill(); }
};
