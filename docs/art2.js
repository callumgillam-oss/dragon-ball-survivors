/* =====================================================================
   DRAGON BALL SURVIVORS 2.0 — ART PACK
   Character likeness tweaks, new terrain, Super Saiyan cutscene.
   Settings > Character art switches between this ("2.0") and the original ("Classic").
   ===================================================================== */
'use strict';

/* ---------- character likeness (spec overrides; originals kept for Classic) ---------- */
const ART_CLASSIC = { B2: JSON.parse(JSON.stringify(B2)), B3: JSON.parse(JSON.stringify(B3)) };
const ART_V2 = {
  B2: {
    // Nappa: the biggest of the Saiyans, broad and heavy
    nap: { sc: 1.12, w: 1.42, hs: 1.04 },
    // Raditz: dark armour with tan shoulder guards, very long mane (hair shape unchanged)
    rad: { ar: '#5a4a36', a2: '#d8c9a0' },
    // Vegeta: short and compact next to Nappa, classic white/yellow armour
    veg: { sc: .96, w: .96 }
  },
  B3: {
    // Recoome: a hulking wall of muscle
    rec: { sc: 1.26, w: 1.58, hs: .98 },
    // Burter: very tall and lean, blue
    bur: { tall: 1.34, w: .96, sc: 1.1 },
    // Jeice: red skin, white hair
    jei: { sk: '#c95a48' },
    // Guldo: short, round, green, four eyes
    gul: { sc: .96, w: 1.46, hs: 1.24 },
    // Ginyu: a little taller and broader than his squad
    gin: { sc: 1.06, w: 1.18 },
    // Frieza 2nd form: towering
    fr2: { sc: 1.2, tall: 1.16 }
  }
};
function applyArt(v) {
  for (const T of ['B2', 'B3']) { const live = T == 'B2' ? B2 : B3;
    for (const k in ART_CLASSIC[T]) { const base = JSON.parse(JSON.stringify(ART_CLASSIC[T][k]));
      for (const key of Object.keys(live[k])) delete live[k][key];
      Object.assign(live[k], base, v == 'v2' ? (ART_V2[T][k] || {}) : {}); } }
}
if (SET.art === undefined) SET.art = 'v2';
applyArt(SET.art);

/* ---------- terrain: pre-rendered decor sprites ---------- */
const DK = 2;   // render decor at 2x for crisp scaling
function decor(w, h, fn) { const c = mk(Math.ceil(w * DK), Math.ceil(h * DK)), x = c.getContext('2d'); x.scale(DK, DK); x.lineJoin = 'round'; x.lineCap = 'round'; fn(x, w, h); return c; }
const rnd = (i, j) => hash(i * 7 + 3, j * 13 + 5);
function shadeGrad(x, x0, y0, x1, y1, a, b) { const g = x.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }

// sandstone butte: flat top, layered strata on the face
function mkButte(v, pal) {
  const w = 70 + v * 14, h = 54 + (v % 3) * 8;
  return decor(w + 30, h + 30, (x) => {
    const L = 8, R = L + w, T = 10, B = T + h, top = T + 14;
    x.fillStyle = 'rgba(50,25,8,.3)'; x.beginPath(); x.ellipse(L + w * .6, B, w * .62, 9, 0, 0, 7); x.fill();
    const face = [[L, top], [L + 3, B - 2], [L + w * .3, B], [R - w * .25, B + 1], [R - 2, B - 3], [R, top]];
    x.fillStyle = shadeGrad(x, L, 0, R, 0, pal.f0, pal.f1); x.beginPath(); face.forEach((p, i) => i ? x.lineTo(...p) : x.moveTo(...p)); x.closePath(); x.fill();
    // strata bands
    x.save(); x.clip();
    for (let i = 0; i < 4; i++) { const y = top + 8 + i * (h - 14) / 4 + rnd(v, i) * 3; x.fillStyle = i % 2 ? pal.s0 : pal.s1; x.fillRect(L - 2, y, w + 4, 3 + rnd(i, v) * 4); }
    x.fillStyle = 'rgba(40,18,6,.28)'; x.fillRect(R - w * .32, top, w * .32, h);
    x.strokeStyle = 'rgba(40,18,6,.45)'; x.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) { const cx = L + w * (.2 + .3 * i) + rnd(v, i + 9) * 8; x.beginPath(); x.moveTo(cx, top + 2); x.lineTo(cx + 3, top + h * .4); x.lineTo(cx - 1, top + h * .7); x.stroke(); }
    x.restore();
    x.strokeStyle = OL; x.lineWidth = 1.8; x.beginPath(); face.forEach((p, i) => i ? x.lineTo(...p) : x.moveTo(...p)); x.closePath(); x.stroke();
    // top surface
    const tp = [[L - 2, top], [L + 6, T + 4], [L + w * .45, T], [R - 6, T + 3], [R + 2, top], [R - w * .4, top + 5], [L + w * .3, top + 4]];
    x.fillStyle = shadeGrad(x, 0, T, 0, top + 5, pal.t0, pal.t1); x.beginPath(); tp.forEach((p, i) => i ? x.lineTo(...p) : x.moveTo(...p)); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = 'rgba(255,240,200,.55)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(L + 6, T + 5); x.lineTo(L + w * .45, T + 1.5); x.lineTo(R - 7, T + 4); x.stroke();
  });
}
// boulder lit from the top-left
function mkBoulder(v, pal) {
  const s = 12 + v * 4;
  return decor(s * 3 + 10, s * 2.4 + 10, (x) => {
    const cx = s * 1.4 + 4, cy = s + 6, pts = [];
    for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283, q = s * (.82 + rnd(v, i) * .3); pts.push([cx + Math.cos(a) * q * 1.12, cy + Math.sin(a) * q * .82]); }
    x.fillStyle = 'rgba(50,25,8,.32)'; x.beginPath(); x.ellipse(cx + s * .45, cy + s * .62, s * 1.25, s * .38, 0, 0, 7); x.fill();
    const g = x.createRadialGradient(cx - s * .45, cy - s * .5, s * .1, cx, cy, s * 1.25); g.addColorStop(0, pal.hi); g.addColorStop(.55, pal.mid); g.addColorStop(1, pal.lo);
    x.fillStyle = g; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(...p) : x.moveTo(...p)); x.closePath(); x.fill();
    x.strokeStyle = OL; x.lineWidth = 1.7; x.stroke();
    x.strokeStyle = 'rgba(30,14,6,.4)'; x.lineWidth = 1.1; x.beginPath(); x.moveTo(cx - s * .2, cy - s * .7); x.lineTo(cx + s * .1, cy - s * .05); x.lineTo(cx + s * .7, cy + s * .2); x.stroke();
    x.fillStyle = 'rgba(255,255,255,.28)'; x.beginPath(); x.ellipse(cx - s * .4, cy - s * .45, s * .35, s * .16, -.5, 0, 7); x.fill();
  });
}
// impact crater with a sun-lit lower rim
function mkCrater(v, pal) {
  const rx = 22 + v * 6, ry = rx * .42;
  return decor(rx * 2 + 16, ry * 2 + 16, (x) => {
    const cx = rx + 8, cy = ry + 8;
    x.fillStyle = pal.dust; x.beginPath(); x.ellipse(cx, cy + 1, rx * 1.18, ry * 1.25, 0, 0, 7); x.fill();
    const g = x.createRadialGradient(cx - rx * .2, cy - ry * .4, 1, cx, cy, rx); g.addColorStop(0, pal.in0); g.addColorStop(1, pal.in1);
    x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 7); x.fill();
    x.strokeStyle = pal.rim; x.lineWidth = 2.4; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, .15, Math.PI - .15); x.stroke();
    x.strokeStyle = 'rgba(30,12,4,.45)'; x.lineWidth = 1.6; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, Math.PI + .1, -.1); x.stroke();
  });
}
// dry (or lush) grass tuft
function mkTuft(v, pal) {
  return decor(30, 22, (x) => {
    x.lineWidth = 1.4;
    for (let i = 0; i < 7; i++) { const bx = 8 + i * 2.2 + rnd(v, i) * 3, a = -1.9 + i * .22 + (rnd(i, v) - .5) * .3, l = 9 + rnd(v + 1, i) * 8;
      x.strokeStyle = i % 2 ? pal.g0 : pal.g1; x.beginPath(); x.moveTo(bx, 19); x.quadraticCurveTo(bx + Math.cos(a) * l * .4, 19 + Math.sin(a) * l * .6, bx + Math.cos(a) * l, 19 + Math.sin(a) * l); x.stroke(); }
  });
}
const PAL1 = {
  butte: { f0: '#b07642', f1: '#7c4a24', s0: '#c58a52', s1: '#94592c', t0: '#e2b47a', t1: '#c48a52' },
  rock: { hi: '#c8b49a', mid: '#94806a', lo: '#5e4c3c' },
  crater: { dust: 'rgba(120,80,40,.18)', in0: '#8a6036', in1: '#6a4424', rim: 'rgba(255,226,170,.6)' },
  tuft: { g0: '#b89a48', g1: '#8a6e2e' }
};
const PAL2 = {
  rock: { hi: '#c8e4dc', mid: '#86aea4', lo: '#4c6e68' },
  crater: { dust: 'rgba(20,80,60,.18)', in0: '#2f7a5c', in1: '#1c5a44', rim: 'rgba(220,255,230,.55)' },
  tuft: { g0: '#2f9a64', g1: '#1f7a50' }
};
const DEC = { butte: [], rock: [], crater: [], tuft: [], rock2: [], crater2: [], tuft2: [] };
for (let v = 0; v < 4; v++) { DEC.butte.push(mkButte(v, PAL1.butte)); DEC.crater.push(mkCrater(v, PAL1.crater)); DEC.crater2.push(mkCrater(v, PAL2.crater)); }
for (let v = 0; v < 6; v++) { DEC.rock.push(mkBoulder(v, PAL1.rock)); DEC.rock2.push(mkBoulder(v, PAL2.rock)); DEC.tuft.push(mkTuft(v, PAL1.tuft)); DEC.tuft2.push(mkTuft(v, PAL2.tuft)); }
const dImg = (c, x, y, flip) => { const w = c.width / DK, h = c.height / DK; if (flip) { ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1); ctx.drawImage(c, -w / 2, -h / 2, w, h); ctx.restore(); } else ctx.drawImage(c, x - w / 2, y - h / 2, w, h); };

// new Wasteland ground tile: base sand + broad tone patches + wind ripples + grain
const TILE3 = (() => { const c = mk(512, 512), x = c.getContext('2d'); x.scale(2, 2); x.fillStyle = '#c8975a'; x.fillRect(0, 0, 256, 256);
  const wrap = f => { for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) f(ox, oy); };
  for (let i = 0; i < 12; i++) { const px = rnd(i, 1) * 256, py = rnd(i, 2) * 256, r = 50 + rnd(i, 3) * 70;
    wrap((ox, oy) => { const q = x.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, r); q.addColorStop(0, i % 2 ? 'rgba(110,64,26,.14)' : 'rgba(255,226,165,.16)'); q.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = q; x.fillRect(0, 0, 256, 256); }); }
  x.lineWidth = 1.1;
  for (let i = 0; i < 26; i++) { const px = rnd(i, 4) * 256, py = rnd(i, 5) * 256, l = 30 + rnd(i, 6) * 50;
    wrap((ox, oy) => { x.strokeStyle = 'rgba(255,236,190,.22)'; x.beginPath(); x.moveTo(px + ox, py + oy); x.quadraticCurveTo(px + ox + l / 2, py + oy - 5, px + ox + l, py + oy); x.stroke();
      x.strokeStyle = 'rgba(120,72,30,.16)'; x.beginPath(); x.moveTo(px + ox, py + oy + 2); x.quadraticCurveTo(px + ox + l / 2, py + oy - 3, px + ox + l, py + oy + 2); x.stroke(); }); }
  for (let i = 0; i < 1100; i++) { x.fillStyle = i % 2 ? 'rgba(100,60,25,.2)' : 'rgba(255,238,190,.2)'; x.fillRect(rnd(i, 7) * 256, rnd(i, 8) * 256, 1 + rnd(i, 9) * 1.6, 1 + rnd(i, 10) * 1.4); }
  for (let i = 0; i < 40; i++) { const px = rnd(i, 11) * 256, py = rnd(i, 12) * 256, s = 1.2 + rnd(i, 13) * 2; x.fillStyle = '#8a6e52'; x.beginPath(); x.ellipse(px, py, s, s * .7, 0, 0, 7); x.fill(); x.fillStyle = 'rgba(255,240,210,.5)'; x.beginPath(); x.ellipse(px - s * .3, py - s * .3, s * .4, s * .25, 0, 0, 7); x.fill(); }
  return c; })();
const PAT3 = ctx.createPattern(TILE3, 'repeat'); PAT3.setTransform(new DOMMatrix().scale(.5));

function bgNew(cx, cy) {
  ctx.save(); ctx.translate(-(((cx % 256) + 256) % 256), -(((cy % 256) + 256) % 256)); ctx.fillStyle = PAT3; ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
  const G = 110;
  for (let gx = Math.floor(cx / G) - 2; gx <= (cx + W) / G; gx++) for (let gy = Math.floor(cy / G) - 2; gy <= (cy + H) / G; gy++) {
    const h = hash(gx, gy), x = gx * G + hash(gy, gx) * G - cx, y = gy * G + hash(gx + 7, gy + 3) * G - cy, v = (hash(gx + 5, gy + 11) * 1000) | 0, fl = v & 1;
    if (h < .05) dImg(DEC.butte[v % 4], x + 8, y - 6, fl);
    else if (h < .17) dImg(DEC.rock[v % 6], x, y, fl);
    else if (h < .25) dImg(DEC.crater[v % 4], x, y);
    else if (h < .37) { ctx.strokeStyle = 'rgba(90,52,20,.75)'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 18, y + 8); ctx.lineTo(x + 30, y - 4); ctx.lineTo(x + 52, y + 6); ctx.moveTo(x + 18, y + 8); ctx.lineTo(x + 24, y + 22); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,232,180,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y + 2.5); ctx.lineTo(x + 18, y + 10.5); ctx.lineTo(x + 30, y - 1.5); ctx.lineTo(x + 52, y + 8.5); ctx.stroke(); }
    else if (h < .55) dImg(DEC.tuft[v % 6], x, y, fl);
  }
}
// Namek: extra grass and stones layered over the original ground
function namekExtras(cx, cy) {
  const G = 95;
  for (let gx = Math.floor(cx / G) - 1; gx <= (cx + W) / G + 1; gx++) for (let gy = Math.floor(cy / G) - 1; gy <= (cy + H) / G + 1; gy++) {
    const h = hash(gx + 40, gy + 77), x = gx * G + hash(gy + 2, gx + 9) * G - cx, y = gy * G + hash(gx + 13, gy + 1) * G - cy, v = (hash(gx + 9, gy + 3) * 1000) | 0;
    if (h < .06) dImg(DEC.rock2[v % 6], x, y, v & 1);
    else if (h < .1) dImg(DEC.crater2[v % 4], x, y);
    else if (h < .42) dImg(DEC.tuft2[v % 6], x, y, v & 1);
  }
}
{ const _bg = bg; bg = function (cx, cy) {
    if (SET.art == 'classic') return _bg(cx, cy);
    if (S.stage == 2) { _bg(cx, cy); namekExtras(cx, cy); return; }
    bgNew(cx, cy);
  }; }

/* ---------- Settings: character art toggle ---------- */
{ const _st = settings; settings = function (back) {
    _st(back); const c = ov.querySelector('.card'); if (!c) return;
    const b = document.createElement('button'); b.style.textAlign = 'center';
    b.innerHTML = 'Character &amp; terrain art: <b>' + (SET.art == 'classic' ? 'Classic' : '2.0') + '</b>';
    b.onclick = () => { SET.art = SET.art == 'classic' ? 'v2' : 'classic'; saveSet(); applyArt(SET.art); settings(); };
    const back_ = c.querySelector('button.go'); c.insertBefore(b, back_);
  }; }

/* ---------- Super Saiyan transformation cutscene ---------- */
// Triggers the moment the original game grants the transformation (3 evolutions). Gameplay pauses for ~3.2s:
// crouch + charging aura, lightning, ground cracks, hair flash, a white-out, then the power-up shockwave.
V2.ssjT = -1;
{ const _u = update; update = function (dt) {
    if (V2.ssjT >= 0) { V2.ssjT += dt; if (V2.ssjT >= SSJ_T) { V2.ssjT = -1; S.inv = Math.max(S.inv || 0, 1.5); } else return; }
    const was = S.ssj; _u(dt);
    if (!was && S.ssj && S.mode == 'play' && !V2.noCut) { V2.ssjT = 0; S.ban = null; sfxPlay('ssj'); MUS.want('boss'); }
  }; }
const SSJ_T = 3.2;
function drawSSJCut() {
  const t = V2.ssjT; if (t < 0) return;
  const hero = S.hero, XF = typeof XFORM != 'undefined' && XFORM[hero], col = XF ? XF[1] : hero == 'pic' ? '255,150,60' : '255,220,70', name = XF ? XF[0] : hero == 'pic' ? 'ORANGE PICCOLO' : hero == 'gohan' ? 'SUPER SAIYAN 2' : 'SUPER SAIYAN';
  const px = W / 2, py = H / 2, k = Math.min(1, t / 2.2);
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  // darken the world and letterbox
  ctx.fillStyle = 'rgba(8,4,16,' + Math.min(.7, t * 1.2) * (t > 2.6 ? Math.max(0, 1 - (t - 2.6) / .6) : 1) + ')'; ctx.fillRect(0, 0, W, H);
  const bh = H * .11 * Math.min(1, t * 3) * (t > 2.8 ? Math.max(0, 1 - (t - 2.8) / .4) : 1); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
  // camera pushes in for a close-up, then eases back out after the flash
  const Z = 1 + 1.1 * Math.min(1, t / 1.3) * (t > 2.6 ? Math.max(0, 1 - (t - 2.6) / .6) : 1); ctx.save(); ctx.translate(px, py); ctx.scale(Z, Z); ctx.translate(-px, -py);
  // ground cracks spreading
  ctx.strokeStyle = 'rgba(' + col + ',' + (.5 + .4 * k) + ')'; ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) { const a = i * .785 + .3, L = 40 + 160 * k; ctx.beginPath(); ctx.moveTo(px, py + 20); let x = px, y = py + 20; for (let j = 1; j <= 5; j++) { x = px + Math.cos(a) * L * j / 5 + Math.sin(j * 9 + i) * 8; y = py + 20 + Math.sin(a) * L * j / 5 * .45 + Math.cos(j * 7 + i) * 4; ctx.lineTo(x, y); } ctx.stroke(); }
  // rising debris
  ctx.fillStyle = 'rgba(160,120,80,.9)'; for (let i = 0; i < 18; i++) { const a = i * 2.4, r = 30 + (i * 37) % 120, u = ((t * .7 + i * .11) % 1); ctx.fillRect(px + Math.cos(a) * r, py + 30 - u * 140 * k, 3 + i % 3, 3 + i % 3); }
  // aura column
  LT();
  const ar = 40 + 60 * k + 6 * Math.sin(t * 30); gl('or', px, py, ar * 2.2, .6 * k); gl('wh', px, py, ar, .5 + .3 * Math.sin(t * 25));
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, fl = .6 + .4 * Math.sin(t * 20 + i * 1.7), len = (30 + 50 * k) * fl;
    ctx.save(); ctx.translate(px + Math.cos(a) * 22, py + Math.sin(a) * 14 + 10); const g = ctx.createLinearGradient(0, 0, 0, -len); g.addColorStop(0, 'rgba(' + col + ',.9)'); g.addColorStop(1, 'rgba(' + col + ',0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-4, -len * .6, Math.sin(t * 15 + i) * 4, -len); ctx.quadraticCurveTo(4, -len * .6, 6, 0); ctx.fill(); ctx.restore(); }
  // lightning crackles
  if ((t * 12 | 0) % 3 == 0) { ctx.strokeStyle = 'rgba(200,240,255,.95)'; ctx.lineWidth = 2; for (let n = 0; n < 2; n++) { const a = Math.random() * 6.283; let x = px, y = py; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 5; j++) { x += Math.cos(a) * 14 + (Math.random() - .5) * 18; y += Math.sin(a) * 14 + (Math.random() - .5) * 18; ctx.lineTo(x, y); } ctx.stroke(); } }
  NM();
  // hero, crouched and shaking (pulls the existing sprite)
  { const ss = S.ssj; if (t < 2.35) S.ssj = 0; ctx.save(); ctx.translate(px + (Math.random() - .5) * 3 * k, py + 4 * k); ctx.scale(1 + .08 * k, 1 - .06 * k); gokuSprite(ctx, 0, 0, S.p.face, S.t); ctx.restore(); S.ssj = ss; }
  ctx.restore();
  // hair flash / white-out at the moment of transformation
  if (t > 2.1 && t < 2.9) { const f = 1 - Math.abs(t - 2.35) / .55; ctx.fillStyle = 'rgba(255,250,225,' + Math.max(0, f) + ')'; ctx.fillRect(0, 0, W, H); }
  // title
  if (t > 2.3) { const a = Math.min(1, (t - 2.3) / .2) * (t > 2.95 ? Math.max(0, 1 - (t - 2.95) / .25) : 1), fs = Math.min(60, W * .12);
    ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.font = '900 ' + fs + 'px Impact,"Arial Black",sans-serif'; ctx.lineWidth = fs * .2; ctx.strokeStyle = '#5a2a00';
    const y = H * .27; ctx.strokeText(name, px, y); const g = ctx.createLinearGradient(0, y - fs, 0, y); g.addColorStop(0, '#fffbd0'); g.addColorStop(1, '#ffc21f'); ctx.fillStyle = g; ctx.fillText(name, px, y); ctx.globalAlpha = 1; }
  ctx.restore();
}
{ const _d = draw; draw = function () { _d(); if (V2.ssjT >= 0) drawSSJCut(); }; }
{ const _s = start; start = function (a) { V2.ssjT = -1; return _s(a); }; }

/* ---------- level-up grace period (phones: time to get your thumb back on the stick) ---------- */
{ const _p = pick; pick = function (...a) { const r = _p(...a); if (S.mode == 'play') S.inv = Math.max(S.inv || 0, .9); return r; }; }
if (typeof reroll === 'function') { /* reroll keeps you in the menu; grace applies when you finally pick */ }

// transformation sound: rising roar, crackle, then the power-up boom on the flash
{ const _sp = sfxPlay; sfxPlay = function (k) {
    if (k != 'ssj') return _sp(k);
    if (muted || !SET.sfx || !AC || AC.state != 'running' || !bus()) return; const n = AC.currentTime;
    tone('sawtooth', 80, 320, 2.2, .09); tone('square', 60, 240, 2.2, .04); noise(2.2, .1, 'bandpass', 300, 3000, 0, 0, 2);
    for (let i = 0; i < 6; i++) noise(.12, .12, 'highpass', 4000, 1500, n + .3 + i * .3);
    noise(1.2, .3, 'lowpass', 3000, 80, n + 2.3); tone('sine', 110, 30, 1, .3, n + 2.3); [523, 659, 784, 1047].forEach((f, i) => tone('square', f, f, .3, .05, n + 2.4 + i * .08));
  }; }
