/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — NAMEKIAN DRAGON BALLS + PORUNGA (EXPANSION_PLAN.md §9.5)
   Unlocked by beating Frieza (Level 2). Once Shenron's wish is used in a run, a second set of seven
   Namekian Dragon Balls starts appearing, and Porunga grants a second wish. Two wishes per run at most.
   ===================================================================== */
'use strict';

Object.assign(UNL_NAME, { nballs: 'Namekian Dragon Balls: a second wish each run, from Porunga' });
UNL_ICON.nballs = '🟠';
// players who beat Frieza before this existed get it too
{ const _in = init; init = function () { _in(); if (typeof P != 'undefined' && P.ach && P.ach.s10 && P.unl && !P.unl.nballs) { P.unl.nballs = 1; try { saveProg(); } catch (e) { } } }; }

/* ---------- pixel filters that work everywhere ----------
   ctx.filter is ignored by iPhone Safari, so one-off images (ball tints, the Beerus Earth) are filtered by hand.
   Both run once into cached canvases, never per frame. Also used by beerus8.js. */
// CSS hue-rotate(deg) saturate(s) brightness(b), applied in that order like the CSS filter chain
function pxTint(c, deg, sat, bri) {
  const x = c.getContext('2d'), im = x.getImageData(0, 0, c.width, c.height), d = im.data;
  const co = Math.cos(deg * Math.PI / 180), si = Math.sin(deg * Math.PI / 180), cl = v => v < 0 ? 0 : v > 255 ? 255 : v;
  const H = [.213 + co * .787 - si * .213, .715 - co * .715 - si * .715, .072 - co * .072 + si * .928,
    .213 - co * .213 + si * .143, .715 + co * .285 + si * .140, .072 - co * .072 - si * .283,
    .213 - co * .213 - si * .787, .715 - co * .715 + si * .715, .072 + co * .928 + si * .072];
  const s = sat, T = [.213 + .787 * s, .715 - .715 * s, .072 - .072 * s, .213 - .213 * s, .715 + .285 * s, .072 - .072 * s, .213 - .213 * s, .715 - .715 * s, .072 + .928 * s];
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const r = d[i], g = d[i + 1], b = d[i + 2];
    const r1 = cl(H[0] * r + H[1] * g + H[2] * b), g1 = cl(H[3] * r + H[4] * g + H[5] * b), b1 = cl(H[6] * r + H[7] * g + H[8] * b);
    d[i] = cl((T[0] * r1 + T[1] * g1 + T[2] * b1) * bri); d[i + 1] = cl((T[3] * r1 + T[4] * g1 + T[5] * b1) * bri); d[i + 2] = cl((T[6] * r1 + T[7] * g1 + T[8] * b1) * bri); }
  x.putImageData(im, 0, 0); return c;
}
// CSS blur(sigma px): three box passes each way, on premultiplied alpha so soft edges don't go dark
function pxBlur(c, sigma) {
  const w = c.width, h = c.height, n = w * h; if (!n || sigma < .4) return c;
  const x = c.getContext('2d'), im = x.getImageData(0, 0, w, h), d = im.data, r = Math.max(1, Math.round((Math.sqrt(4 * sigma * sigma + 1) - 1) / 2)), k = 1 / (2 * r + 1);
  const ch = [0, 1, 2, 3].map(() => new Float32Array(n)), tmp = new Float32Array(n);
  for (let i = 0; i < n; i++) { const a = d[i * 4 + 3], m = a / 255; ch[0][i] = d[i * 4] * m; ch[1][i] = d[i * 4 + 1] * m; ch[2][i] = d[i * 4 + 2] * m; ch[3][i] = a; }
  const hb = (s, t) => { for (let y = 0; y < h; y++) { const o = y * w; let acc = 0; for (let i = 0; i <= r && i < w; i++) acc += s[o + i];
      for (let i = 0; i < w; i++) { t[o + i] = acc * k; if (i + r + 1 < w) acc += s[o + i + r + 1]; if (i - r >= 0) acc -= s[o + i - r]; } } };
  const vb = (s, t) => { for (let xx = 0; xx < w; xx++) { let acc = 0; for (let i = 0; i <= r && i < h; i++) acc += s[i * w + xx];
      for (let i = 0; i < h; i++) { t[i * w + xx] = acc * k; if (i + r + 1 < h) acc += s[(i + r + 1) * w + xx]; if (i - r >= 0) acc -= s[(i - r) * w + xx]; } } };
  for (const a of ch) for (let p = 0; p < 3; p++) { hb(a, tmp); vb(tmp, a); }
  for (let i = 0; i < n; i++) { const a = ch[3][i]; if (a < .5) { d[i * 4 + 3] = 0; continue; } const u = 255 / a;
    d[i * 4] = ch[0][i] * u; d[i * 4 + 1] = ch[1][i] * u; d[i * 4 + 2] = ch[2][i] * u; d[i * 4 + 3] = a; }
  x.putImageData(im, 0, 0); return c;
}

// Namekian balls: bigger-feeling, deeper amber-red with a dark stone ring
const OBALLS = BALLS.slice();
const NBALLS = OBALLS.map(b => { const c = mk(b.width, b.height), x = c.getContext('2d'), w = b.width;
  x.drawImage(b, 0, 0); pxTint(c, -22, 1.45, .92);
  x.strokeStyle = 'rgba(60,30,10,.85)'; x.lineWidth = w * .05; x.beginPath(); x.arc(w / 2, w / 2, w * .44, 0, 7); x.stroke();
  x.strokeStyle = 'rgba(140,255,170,.55)'; x.lineWidth = w * .02; x.beginPath(); x.arc(w / 2, w / 2, w * .47, 0, 7); x.stroke(); return c; });
const ballSet = n => { for (let i = 0; i < 7; i++) BALLS[i] = n ? NBALLS[i] : OBALLS[i]; };
{ const _in = init; init = function () { _in(); ballSet(0); S.set2 = 0; S.dbPrev = 0; }; }

// after Shenron's wish: the Namekian set awakens
{ const _m = mythic; mythic = function (g, k) {
    const r = _m(g, k);
    if (!S.set2 && RU('nballs')) { S.set2 = 1; S.dbPrev = S.dbGot; S.dbN = 0; S.dbGot = 0; S.dbHave = 0; S.dbT = 22; ballSet(1); setTimeout(() => { if (S.mode == 'play') ban('THE NAMEKIAN DRAGON BALLS AWAKEN!'); }, 1600); }
    else if (S.set2 == 1) { S.set2 = 2; S.wish2 = 1; P.wish2 = (P.wish2 || 0) + 1; try { saveProg(); } catch (e) { } }
    return r; }; }
{ const _b = ban; ban = function (t) {
    if (S && S.set2 == 1 && typeof t == 'string') {
      if (t == 'A DRAGON BALL APPEARS!') t = 'A NAMEKIAN DRAGON BALL APPEARS!';
      else if (t == 'ALL SEVEN DRAGON BALLS!') t = 'ALL SEVEN NAMEKIAN DRAGON BALLS!';
      else if (/^DRAGON BALL \d/.test(t)) t = 'NAMEKIAN ' + t;
      else if (/^\d-STAR DRAGON BALL/.test(t)) t = t.replace('DRAGON BALL', 'NAMEKIAN DRAGON BALL');
    }
    return _b(t); }; }
{ const _a = awardZeni; awardZeni = function (win) { const z = _a(win), x = (S.dbPrev || 0) * 12; if (!x) return z; META.zeni += x; P.zeni += x; saveMeta(); return z + x; }; }

// Porunga's wish card
{ const _sw = startWish; startWish = function () {
    _sw(); if (S.mode != 'wish' || S.set2 != 1) return;
    const h = ov.querySelector('.card h2'); if (h) h.textContent = 'Porunga ascends an attack!';
    const p = ov.querySelector('.card p small'); if (p) p.insertAdjacentHTML('beforeend', ' <b class="fw">The second wish of this run.</b>');
  }; }
{ const _d = drawShenron; drawShenron = function () { if (S.set2 == 1) return drawPorunga(); return _d(); }; }
function drawPorunga() {
  const T = performance.now() / 1000, k = Math.min(1, (T - (S.shT || T)) / 1.4), e = k * k * (3 - 2 * k), c = ctx;
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  // Namek's sky goes dark; green storm clouds and lightning
  c.fillStyle = 'rgba(2,14,10,' + (.74 * e) + ')'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 8; i++) { const cx = ((i * 197 + T * (6 + i * 1.7)) % (W + 400)) - 200, cy = H * (.05 + ((i * 41) % 10) / 10 * .7), r = 120 + (i % 3) * 50, g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(40,96,62,' + (.34 * e) + ')'); g.addColorStop(1, 'rgba(40,96,62,0)'); c.fillStyle = g; c.fillRect(cx - r, cy - r, r * 2, r * 2); }
  { const lk = Math.floor(T * 1.3), lf = ((Math.sin(lk * 77.3) * .5 + .5) > .55) ? Math.max(0, 1 - ((T * 1.3) % 1) * 5) : 0;
    if (lf > 0 && e > .9) { c.strokeStyle = 'rgba(190,255,214,' + lf + ')'; c.lineWidth = 2.4; c.beginPath(); let lx = ((Math.sin(lk * 31.3) * .5 + .5) * W), ly = 0; c.moveTo(lx, ly); for (let j = 0; j < 9; j++) { lx += Math.sin(lk * 13 + j * 7) * 38; ly += H * .1; c.lineTo(lx, ly); } c.stroke(); c.fillStyle = 'rgba(170,255,200,' + lf * .1 + ')'; c.fillRect(0, 0, W, H); } }
  const s = Math.min(1.12, Math.max(.52, Math.min(W / 620, H / 640))), cx = W / 2 + Math.sin(T * .6) * W * .01, cy = Math.max(H * .3, 298 * s) + (1 - e) * H * .75, br = Math.sin(T * 1.6) * 2.5;
  { const g = c.createRadialGradient(cx, cy, 10, cx, cy, 380 * s); g.addColorStop(0, 'rgba(120,255,170,' + (.36 * e) + ')'); g.addColorStop(1, 'rgba(120,255,170,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  c.translate(cx, cy); c.scale(s, s);
  const OLP = '#082010', GRAD = (x0, y0, x1, y1, a, b, d) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(.5, b); g.addColorStop(1, d); return g; };
  const GH = '#8fe89a', GM = '#35a655', GD = '#0e5226', IV = ['#fff8dc', '#e6d29a', '#a08448'];
  const fs = (f, lw) => { c.fillStyle = f; c.fill(); c.strokeStyle = OLP; c.lineWidth = lw || 3; c.stroke(); };
  // a thick limb: outline, flesh, a lit ridge and a shaded underside
  const limb = (pts, w) => { const pth = (ox, oy) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x + ox, y + oy) : c.moveTo(x + ox, y + oy)); };
    pth(0, 0); c.strokeStyle = OLP; c.lineWidth = w + 6; c.stroke(); pth(0, 0); c.strokeStyle = GM; c.lineWidth = w; c.stroke();
    pth(-w * .08, -w * .24); c.strokeStyle = 'rgba(170,246,178,.5)'; c.lineWidth = w * .26; c.stroke(); pth(w * .06, w * .28); c.strokeStyle = 'rgba(6,54,24,.5)'; c.lineWidth = w * .26; c.stroke(); };
  const spike = (pts) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); fs(GRAD(pts[0][0], pts[1][1], pts[2][0], pts[2][1], IV[0], IV[1], IV[2]), 2.6); };
  // the serpent body he rises on
  { const tail = off => { c.beginPath(); for (let i = 0; i <= 22; i++) { const u = i / 22, x = Math.sin(u * 3.4 + T * .8) * 86 * u + off, y = 236 + u * 760; i ? c.lineTo(x, y) : c.moveTo(x, y); } };
    tail(0); c.strokeStyle = OLP; c.lineWidth = 176; c.stroke(); tail(0); c.strokeStyle = GRAD(-90, 0, 90, 0, GM, '#2a9148', GD); c.lineWidth = 168; c.stroke();
    tail(-46); c.strokeStyle = 'rgba(160,240,170,.28)'; c.lineWidth = 22; c.stroke();
    tail(0); c.strokeStyle = '#e8cc80'; c.lineWidth = 84; c.stroke(); tail(-14); c.strokeStyle = 'rgba(255,246,206,.55)'; c.lineWidth = 30; c.stroke();
    c.strokeStyle = 'rgba(120,90,30,.6)'; c.lineWidth = 2; c.beginPath(); for (let i = 1; i <= 26; i++) { const u = i / 26, x = Math.sin(u * 3.4 + T * .8) * 86 * u, y = 236 + u * 760; c.moveTo(x - 41, y); c.quadraticCurveTo(x, y + 9, x + 41, y); } c.stroke(); }
  // spines fanning off the shoulders
  for (const q of [-1, 1]) { spike([[q * 96, 14], [q * 132, -92 + br], [q * 148, 12]]); spike([[q * 142, 20], [q * 214, -66 + br], [q * 190, 34]]); spike([[q * 182, 48], [q * 270, 2 + br], [q * 208, 84]]); }
  // torso: a wide V of muscle
  c.beginPath(); c.moveTo(-152, 30 + br); c.bezierCurveTo(-112, -8 + br, -50, -6 + br, 0, 4 + br); c.bezierCurveTo(50, -6 + br, 112, -8 + br, 152, 30 + br); c.bezierCurveTo(152, 124, 112, 192, 86, 264); c.lineTo(-86, 264); c.bezierCurveTo(-112, 192, -152, 124, -152, 30 + br); c.closePath();
  fs(GRAD(-130, 0, 120, 260, GH, GM, GD));
  c.save(); c.clip(); { const g = c.createLinearGradient(-152, 0, 152, 0); g.addColorStop(0, 'rgba(0,34,12,.5)'); g.addColorStop(.3, 'rgba(0,34,12,0)'); g.addColorStop(.72, 'rgba(0,34,12,0)'); g.addColorStop(1, 'rgba(0,34,12,.6)'); c.fillStyle = g; c.fillRect(-160, -20, 320, 300); } c.restore();
  // segmented cream belly
  c.beginPath(); c.moveTo(-54, 98); c.quadraticCurveTo(0, 84, 54, 98); c.lineTo(46, 264); c.lineTo(-46, 264); c.closePath(); fs(GRAD(-50, 90, 50, 264, IV[0], '#e8cc80', '#a8853e'), 2.6);
  c.strokeStyle = 'rgba(120,90,30,.65)'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 6; i++) { const y = 122 + i * 26; c.moveTo(-52 + i * 1.2, y); c.quadraticCurveTo(0, y + 9, 52 - i * 1.2, y); } c.moveTo(0, 96); c.lineTo(0, 262); c.stroke();
  // chest
  for (const q of [-1, 1]) { c.beginPath(); c.moveTo(q * 5, 30 + br); c.bezierCurveTo(q * 44, 20 + br, q * 122, 30 + br, q * 128, 72 + br); c.bezierCurveTo(q * 122, 108, q * 50, 116, q * 5, 98); c.closePath(); fs(GRAD(q * 10 - 60, 20, q * 70 + 40, 120, GH, '#3fb260', '#17703a'), 2.8);
    c.fillStyle = 'rgba(210,255,214,.22)'; c.beginPath(); c.ellipse(q * 62 - 14, 50 + br, 34, 14, -.2 * q, 0, 7); c.fill(); }
  // neck and throat
  c.beginPath(); c.moveTo(-40, 14 + br); c.lineTo(-30, -44 + br); c.lineTo(30, -44 + br); c.lineTo(40, 14 + br); c.quadraticCurveTo(0, 26 + br, -40, 14 + br); c.closePath(); fs(GRAD(-40, -40, 40, 20, GM, '#2a9148', GD));
  c.beginPath(); c.moveTo(-15, 16 + br); c.lineTo(-12, -40 + br); c.lineTo(12, -40 + br); c.lineTo(15, 16 + br); c.closePath(); c.fillStyle = '#e8cc80'; c.fill(); c.strokeStyle = 'rgba(120,90,30,.6)'; c.lineWidth = 1.6; c.beginPath(); for (let i = 0; i < 4; i++) { c.moveTo(-13, -26 + i * 12 + br); c.lineTo(13, -26 + i * 12 + br); } c.stroke();
  // shoulders
  for (const q of [-1, 1]) { c.beginPath(); c.arc(q * 150, 50 + br, 60, 0, 7); const g = c.createRadialGradient(q * 150 - 22, 26 + br, 6, q * 150, 50 + br, 62); g.addColorStop(0, '#b4f6b8'); g.addColorStop(.5, GM); g.addColorStop(1, GD); fs(g);
    c.strokeStyle = 'rgba(6,54,24,.5)'; c.lineWidth = 2.4; c.beginPath(); c.arc(q * 150, 50 + br, 44, q > 0 ? .3 : 1.6, q > 0 ? 1.5 : 2.85); c.stroke(); }
  // arms folded across the chest
  limb([[-158, 74 + br], [-176, 172], [34, 190]], 60);
  limb([[158, 74 + br], [176, 164], [-52, 152]], 60);
  for (const [x, y, a] of [[150, 196, .2], [112, 190, .1], [-140, 204, -.3]]) { c.save(); c.translate(x, y); c.rotate(a); spike([[-12, -4], [2, 34], [14, -2]]); c.restore(); }   // forearm fins
  c.beginPath(); c.ellipse(-62, 152, 30, 25, -.15, 0, 7); fs(GRAD(-90, 130, -34, 178, GH, GM, GD));   // the hand gripping his arm
  for (let j = 0; j < 4; j++) { c.beginPath(); c.moveTo(-84 + j * 13, 166); c.lineTo(-94 + j * 13, 196); c.lineTo(-74 + j * 13, 172); c.closePath(); fs(IV[0], 1.8); }
  // head
  c.save(); c.translate(0, -84 + br * .6);
  for (const q of [-1, 1]) {
    c.beginPath(); c.moveTo(q * 26, -54); c.bezierCurveTo(q * 92, -70, q * 118, -150, q * 70, -204); c.bezierCurveTo(q * 92, -146, q * 62, -92, q * 8, -70); c.closePath(); fs(GRAD(q * 20, -60, q * 90, -220, IV[1], IV[0], IV[2]), 2.8);   // great curved horns
    c.strokeStyle = 'rgba(120,90,30,.55)'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 5; i++) { const u = .16 + i * .15, x = q * (30 + 66 * Math.sin(u * 2.2)), y = -60 - u * 146; c.moveTo(x - q * 12, y + 6); c.lineTo(x + q * 10, y - 4); } c.stroke();
    c.strokeStyle = OLP; c.lineWidth = 5; c.beginPath(); c.moveTo(q * 12, -62); c.bezierCurveTo(q * 24, -120, q * 40, -150, q * 26 + Math.sin(T * 2 + q) * 7, -186); c.stroke(); c.strokeStyle = GH; c.lineWidth = 2.4; c.stroke();   // antennae
    c.fillStyle = GH; c.strokeStyle = OLP; c.lineWidth = 2; c.beginPath(); c.arc(q * 26 + Math.sin(T * 2 + q) * 7, -186, 5, 0, 7); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(q * 46, -36); c.lineTo(q * 104, -72); c.lineTo(q * 90, -34); c.lineTo(q * 108, -12); c.lineTo(q * 50, 2); c.closePath(); fs(GRAD(q * 46, -60, q * 100, 0, GM, '#2a9148', GD), 2.6);   // fin ears
    c.beginPath(); c.moveTo(q * 56, -34); c.lineTo(q * 90, -54); c.lineTo(q * 80, -30); c.lineTo(q * 58, -16); c.closePath(); c.fillStyle = 'rgba(232,204,128,.75)'; c.fill(); }
  c.beginPath(); c.ellipse(0, -32, 54, 52, 0, 0, 7); { const g = c.createRadialGradient(-20, -58, 6, 0, -32, 58); g.addColorStop(0, '#b4f6b8'); g.addColorStop(.5, GM); g.addColorStop(1, GD); fs(g); }   // skull
  c.fillStyle = 'rgba(0,44,14,.4)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(-16 + i * 16, -70 + Math.abs(i - 1) * 4, 6, 3.6, 0, 0, 7); c.fill(); }
  c.beginPath(); c.moveTo(-42, -16); c.bezierCurveTo(-48, 30, -28, 58, 0, 60); c.bezierCurveTo(28, 58, 48, 30, 42, -16); c.quadraticCurveTo(0, -30, -42, -16); c.closePath(); fs(GRAD(-40, -20, 40, 60, '#7fdc8c', '#3fb260', '#17703a'), 2.8);   // muzzle
  c.fillStyle = '#062a12'; for (const q of [-1, 1]) { c.beginPath(); c.ellipse(q * 9, 12, 3.4, 5, q * .4, 0, 7); c.fill(); }
  { const op = 6 + Math.sin(T * 1.3) * 3; c.beginPath(); c.moveTo(-30, 30); c.quadraticCurveTo(0, 38, 30, 30); c.quadraticCurveTo(0, 44 + op * 1.6, -30, 30); c.closePath(); fs('#4a0a16', 2.4);
    c.fillStyle = '#fff8e0'; c.strokeStyle = OLP; c.lineWidth = 1.4; for (const [x, w, h] of [[-21, 5, 13], [-11, 3.4, 7], [-3, 3.2, 6], [5, 3.2, 6], [12.6, 3.4, 7], [16, 5, 13]]) { c.beginPath(); c.moveTo(x, 31 + Math.abs(x + (x < 0 ? 0 : -5)) * .06); c.lineTo(x + w / 2, 31 + h); c.lineTo(x + w, 31 + Math.abs(x) * .06); c.closePath(); c.fill(); c.stroke(); } }
  for (const q of [-1, 1]) { c.beginPath(); c.moveTo(q * 7, -24); c.quadraticCurveTo(q * 24, -42, q * 44, -28); c.quadraticCurveTo(q * 24, -10, q * 7, -24); c.closePath();   // burning eyes under heavy brows
    const g = c.createRadialGradient(q * 24, -26, 1, q * 24, -26, 18); g.addColorStop(0, '#fff6b0'); g.addColorStop(.4, '#ff5a30'); g.addColorStop(1, '#8a0a0a'); fs(g, 2.2);
    c.beginPath(); c.moveTo(q * 2, -30); c.lineTo(q * 48, -52); c.lineTo(q * 54, -40); c.lineTo(q * 6, -19); c.closePath(); fs(GRAD(0, -52, 0, -20, '#2a9148', GD, '#0a3a18'), 2.4); }
  c.strokeStyle = 'rgba(6,54,24,.55)'; c.lineWidth = 2; c.beginPath(); for (const q of [-1, 1]) { c.moveTo(q * 40, 0); c.quadraticCurveTo(q * 44, 20, q * 30, 40); } c.stroke();
  c.restore();
  c.restore();
  LT(); gl('rd', cx - 24 * s, cy - 110 * s, 34 * s, .55 * e); gl('rd', cx + 24 * s, cy - 110 * s, 34 * s, .55 * e); NM();
  c.save(); for (let i = 0; i < 26; i++) { const px = (Math.sin(i * 11.7) * .5 + .5) * W, py = H - ((T * (28 + (i % 5) * 9) + i * 61) % (H + 40)); c.fillStyle = 'rgba(255,214,130,' + (.25 + .4 * ((i * 7) % 3) / 3) * e + ')'; c.beginPath(); c.arc(px, py, 1.2 + (i % 3) * .7, 0, 7); c.fill(); }
  if (k < 1) { c.fillStyle = 'rgba(255,255,255,' + (.7 * (1 - k)) + ')'; c.fillRect(0, 0, W, H); } c.restore();
}

/* ---------- achievements: wishes and fusion tiers ---------- */
for (const a of [
  { id: 'm21', c: 'mile', n: "Porunga's Gift", d: 'Make a second wish with the Namekian Dragon Balls', r: ['z:800'], pg: () => [Math.min(1, P.wish2 || 0), 1] },
  { id: 'm22', c: 'mile', n: 'Wish Upon a Fusion', d: 'Create a one-wish fusion', r: ['z:1000'], pg: () => [Object.values(P.fusR || {}).some(v => v >= 2) ? 1 : 0, 1] },
  { id: 'm23', c: 'mile', n: 'Ultimate Fusion', d: 'Create a two-wish fusion', r: ['z:2000'], pg: () => [Object.values(P.fusR || {}).some(v => v >= 3) ? 1 : 0, 1] },
  { id: 'm24', c: 'mile', n: 'Fusion Collector', d: 'Create all 8 Fusion Dance attacks', r: ['z:3000'], pg: () => [Object.keys(P.fusR || {}).length, 8] }
]) { ACH.push(a); ACH_BY[a.id] = a; }
