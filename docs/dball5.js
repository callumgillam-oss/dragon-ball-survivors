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

// Namekian balls: bigger-feeling, deeper amber-red with a dark stone ring
const OBALLS = BALLS.slice();
const NBALLS = OBALLS.map(b => { const c = mk(b.width, b.height), x = c.getContext('2d'), w = b.width;
  x.filter = 'hue-rotate(-22deg) saturate(1.45) brightness(.92)'; x.drawImage(b, 0, 0); x.filter = 'none';
  x.strokeStyle = 'rgba(60,30,10,.85)'; x.lineWidth = w * .05; x.beginPath(); x.arc(w / 2, w / 2, w * .44, 0, 7); x.stroke();
  x.strokeStyle = 'rgba(140,255,170,.55)'; x.lineWidth = w * .02; x.beginPath(); x.arc(w / 2, w / 2, w * .47, 0, 7); x.stroke(); return c; });
const ballSet = n => { for (let i = 0; i < 7; i++) BALLS[i] = n ? NBALLS[i] : OBALLS[i]; };
{ const _in = init; init = function () { _in(); ballSet(0); S.set2 = 0; S.dbPrev = 0; }; }

// after Shenron's wish: the Namekian set awakens
{ const _m = mythic; mythic = function (g, k) {
    const r = _m(g, k);
    if (!S.set2 && RU('nballs')) { S.set2 = 1; S.dbPrev = S.dbGot; S.dbN = 0; S.dbGot = 0; S.dbT = 22; ballSet(1); setTimeout(() => { if (S.mode == 'play') ban('THE NAMEKIAN DRAGON BALLS AWAKEN!'); }, 1600); }
    else if (S.set2 == 1) { S.set2 = 2; S.wish2 = 1; P.wish2 = (P.wish2 || 0) + 1; try { saveProg(); } catch (e) { } }
    return r; }; }
{ const _b = ban; ban = function (t) {
    if (S && S.set2 == 1 && typeof t == 'string') {
      if (t == 'A DRAGON BALL APPEARS!') t = 'A NAMEKIAN DRAGON BALL APPEARS!';
      else if (t == 'ALL SEVEN DRAGON BALLS!') t = 'ALL SEVEN NAMEKIAN DRAGON BALLS!';
      else if (/^DRAGON BALL \d/.test(t)) t = 'NAMEKIAN ' + t;
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
  c.fillStyle = 'rgba(2,14,10,' + (.72 * e) + ')'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 7; i++) { const cx = ((i * 197 + T * (6 + i * 1.7)) % (W + 400)) - 200, cy = H * (.05 + ((i * 41) % 10) / 10 * .7), r = 120 + (i % 3) * 50, g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(40,90,60,' + (.32 * e) + ')'); g.addColorStop(1, 'rgba(40,90,60,0)'); c.fillStyle = g; c.fillRect(cx - r, cy - r, r * 2, r * 2); }
  const s = Math.min(1, Math.max(.5, Math.min(W, H) / 640)), cx = W / 2, cy = H * .3 + (1 - e) * H * .6, br = Math.sin(T * 1.6) * 2;
  { const g = c.createRadialGradient(cx, cy, 10, cx, cy, 340 * s); g.addColorStop(0, 'rgba(120,255,170,' + (.35 * e) + ')'); g.addColorStop(1, 'rgba(120,255,170,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  c.translate(cx, cy); c.scale(s, s); c.strokeStyle = OL; c.lineWidth = 3;
  const GR = ['#7ad88a', '#2e9a4e', '#0f5a28'], CR = ['#fff4c8', '#e8cc80', '#9a7a3a'], RD = ['#ff8a6a', '#d0302a', '#5a0a0a'];
  // wings (folded behind) and shoulders
  for (const q of [-1, 1]) hpoly(c, [[q * 60, 20], [q * 190, -60 + br], [q * 230, 40 + br], [q * 180, 30], [q * 200, 110], [q * 120, 90]], ['#4aa060', '#1e6a34', '#0a3a18'], { lw: 3 });
  // torso
  hpoly(c, [[-80, 40], [80, 40], [100, 120], [70, 260], [-70, 260], [-100, 120]], GR, { lw: 3 });
  hpoly(c, [[-40, 70], [40, 70], [44, 250], [-44, 250]], CR, { lw: 2.4 });
  c.strokeStyle = 'rgba(120,90,30,.6)'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-40, 100 + i * 26); c.lineTo(40, 100 + i * 26); c.stroke(); } c.strokeStyle = OL;
  for (const q of [-1, 1]) { hell(c, q * 52, 92, 34, 24, GR); }   // pecs
  // crossed arms
  for (const q of [-1, 1]) { hlimb(c, [[q * 92, 60], [q * 120, 140], [q * -20, 160]], 34, GR); hell(c, q * -30, 160, 22, 18, GR);
    for (let j = 0; j < 3; j++) { c.fillStyle = '#f0e6c8'; c.beginPath(); c.moveTo(q * (-44 - j * 6), 150 + j * 6); c.lineTo(q * (-58 - j * 6), 146 + j * 6); c.lineTo(q * (-46 - j * 6), 160 + j * 6); c.closePath(); c.fill(); c.lineWidth = 1.4; c.stroke(); } }
  c.lineWidth = 3;
  // head
  c.save(); c.translate(0, -10 + br * .5);
  for (const q of [-1, 1]) {   // big curved horns + antennae
    for (const [w, col] of [[14, OL], [10, '#e8dcb0']]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(q * 26, -40); c.bezierCurveTo(q * 60, -70, q * 70, -110, q * 40, -150); c.stroke(); }
    c.strokeStyle = OL; c.lineWidth = 4; c.beginPath(); c.moveTo(q * 10, -52); c.bezierCurveTo(q * 20, -100, q * 30, -130, q * 18 + Math.sin(T * 2 + q) * 6, -170); c.stroke();
    c.strokeStyle = '#7ad88a'; c.lineWidth = 2; c.stroke();
    hpoly(c, [[q * 40, -14], [q * 74, -34], [q * 52, 0]], GR, { lw: 2.4 }); }   // pointed ears
  c.strokeStyle = OL; c.lineWidth = 3;
  hell(c, 0, -10, 44, 48, GR);
  c.fillStyle = 'rgba(0,40,10,.35)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(-14 + i * 14, -44, 5, 3, 0, 0, 7); c.fill(); }
  for (const q of [-1, 1]) { c.beginPath(); c.moveTo(q * 6, -14); c.quadraticCurveTo(q * 20, -30, q * 34, -18); c.quadraticCurveTo(q * 20, -4, q * 6, -14); c.closePath();
    const g = c.createRadialGradient(q * 20, -16, 1, q * 20, -16, 14); g.addColorStop(0, '#fff2a0'); g.addColorStop(.4, '#ff5a30'); g.addColorStop(1, '#8a0a0a'); c.fillStyle = g; c.fill(); c.lineWidth = 2.2; c.stroke();
    c.lineWidth = 4; c.beginPath(); c.moveTo(q * 38, -30); c.lineTo(q * 6, -22); c.stroke(); }
  c.fillStyle = '#4a0a16'; c.beginPath(); c.ellipse(0, 22, 22, 9 + Math.sin(T * 1.3) * 3, 0, 0, 7); c.fill(); c.lineWidth = 2.4; c.stroke();
  c.fillStyle = '#f6f0d2'; for (const q of [-1, 1]) { c.beginPath(); c.moveTo(q * 14, 14); c.lineTo(q * 10, 28); c.lineTo(q * 6, 14); c.closePath(); c.fill(); c.lineWidth = 1.4; c.stroke(); }
  c.restore();
  c.restore();
  LT(); gl('rd', cx - 20 * s, cy - 26 * s, 26 * s, .5 * e); gl('rd', cx + 20 * s, cy - 26 * s, 26 * s, .5 * e); NM();
  for (let i = 0; i < 24; i++) { const px = (Math.sin(i * 11.7) * .5 + .5) * W, py = H - ((T * (28 + (i % 5) * 9) + i * 61) % (H + 40)); c.fillStyle = 'rgba(255,200,120,' + (.25 + .4 * ((i * 7) % 3) / 3) * e + ')'; c.beginPath(); c.arc(px, py, 1.2 + (i % 3) * .7, 0, 7); c.fill(); }
  if (k < 1) { c.fillStyle = 'rgba(255,255,255,' + (.7 * (1 - k)) + ')'; c.fillRect(0, 0, W, H); }
}

/* ---------- achievements: wishes and fusion tiers ---------- */
for (const a of [
  { id: 'm21', c: 'mile', n: "Porunga's Gift", d: 'Make a second wish with the Namekian Dragon Balls', r: ['z:800'], pg: () => [Math.min(1, P.wish2 || 0), 1] },
  { id: 'm22', c: 'mile', n: 'Wish Upon a Fusion', d: 'Create a one-wish fusion', r: ['z:1000'], pg: () => [Object.values(P.fusR || {}).some(v => v >= 2) ? 1 : 0, 1] },
  { id: 'm23', c: 'mile', n: 'Ultimate Fusion', d: 'Create a two-wish fusion', r: ['z:2000'], pg: () => [Object.values(P.fusR || {}).some(v => v >= 3) ? 1 : 0, 1] },
  { id: 'm24', c: 'mile', n: 'Fusion Collector', d: 'Create all 8 Fusion Dance attacks', r: ['z:3000'], pg: () => [Object.keys(P.fusR || {}).length, 8] }
]) { ACH.push(a); ACH_BY[a.id] = a; }
