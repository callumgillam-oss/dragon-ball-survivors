/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — CUTSCENE POLISH
     · Level 3 intro: the androids strike a city at dusk, the hero flies in, 19 and 20 are waiting on a rooftop
     · Level 4 intro: Babidi's buried ship drinks in energy, its guards pour out, the hero dives down the hatch
     · King Kai's training (Snake Way) redrawn: see the second half of this file
   Drawing and sound cues only: nothing here changes a run.
   ===================================================================== */
'use strict';

INTRO_T[2] = 6.0; INTRO_T[3] = 6.2;
const i6s = () => Math.min(1.5, Math.max(.8, Math.min(W, H) / 390));
const i6K = () => iclamp(Math.min(H * .0016, W * .0021), .55, 1.7) * .8;   // hero size: fits a narrow portrait screen as well as a wide one
// play a sound once when the scene clock passes tt
function i6cue(t, tt, k) { const I = S.intro; if (!I) return; const id = 'q' + k + tt; if (t >= tt && !I[id]) { I[id] = 1; if (t < tt + .4) try { sfx(k); } catch (e) { } } }
function i6Hero(c, x, feet, k, f, row, flip, al) { const im = sheetOf(S.hero, 0); if (!im) return; c.save(); c.globalAlpha = al == null ? 1 : al; c.translate(x, feet); if (flip) c.scale(-1, 1); c.drawImage(im, f * 256, row * 256, 256, 256, -128 * k, -241 * k, 256 * k, 256 * k); c.restore(); }
// the hero in flight: body tipped forward inside a streaming ki aura. dir 1 = flying right, -1 = left
function i6Fly(c, x, y, k, dir, t, lean, al) {
  c.save(); c.translate(x, y); if (dir < 0) c.scale(-1, 1); c.globalAlpha = al == null ? 1 : al;
  c.globalCompositeOperation = 'lighter';
  for (let i = 8; i >= 0; i--) { const d = i * 26 * k, r = (58 - i * 5) * k, ox = -d * Math.sin(lean) + Math.sin(t * 34 + i * 1.7) * 3 * k, oy = d * Math.cos(lean) * .55;
    const g = c.createRadialGradient(ox, oy, 0, ox, oy, r); g.addColorStop(0, 'rgba(255,255,255,' + (.42 - i * .04) + ')'); g.addColorStop(.42, 'rgba(120,200,255,' + (.3 - i * .03) + ')'); g.addColorStop(1, 'rgba(60,140,255,0)');
    c.fillStyle = g; c.beginPath(); c.arc(ox, oy, r, 0, 7); c.fill(); }
  c.globalCompositeOperation = 'source-over';
  c.rotate(lean); const im = sheetOf(S.hero, 0); if (im) c.drawImage(im, 0, 256, 256, 256, -128 * k, -178 * k, 256 * k, 256 * k);
  c.restore();
}
function i6Dust(c, x, gy, u, s, col) { if (u < 0 || u >= 1) return; c.fillStyle = 'rgba(' + col + ',' + (.55 * (1 - u)) + ')'; for (let i = 0; i < 10; i++) { const a = Math.PI + i / 9 * Math.PI; c.beginPath(); c.arc(x + Math.cos(a) * 95 * s * u, gy + Math.sin(a) * 18 * s * u - u * 8 * s, (9 + 15 * u) * s, 0, 7); c.fill(); } }
// a game boss or mob standing in the scene, drawn with its own art
function i6Foe(k, x, y, sc, t) { const T = TYPES[k]; if (!T) return; const keep = S.t; S.t = t; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  try { enemy({ k, x: 0, y: 0, r: T.r, hp: 1, max: 1, boss: T.boss ? 1 : 0, t: 0, a: 0, vx: 0, vy: 0, sd: 1, _in: 1 }, 0, 0); } catch (e) { }
  ctx.restore(); S.t = keep; NM(); ctx.globalAlpha = 1; }

/* ---------- Level 3: the androids strike ---------- */
introCity = function (c, t, T) {
  const s = i6s(), gy = H * .72, K = i6K(), tS = .5, tB = .95, tF = 1.45, tL = 3.0, tA = 3.25;
  i6cue(t, tS, 'i6shot'); i6cue(t, tB, 'boom'); i6cue(t, tF, 'i6fly'); i6cue(t, tL, 'i6land'); i6cue(t, tA + .45, 'i6menace');
  let sh = 0; if (t > tB && t < tB + .8) sh = 1 - (t - tB) / .8; else if (t > tL && t < tL + .3) sh = .35 * (1 - (t - tL) / .3);
  c.save(); if (sh > 0) c.translate((Math.random() - .5) * 18 * sh * s * (SET.shake ? 1 : 0), (Math.random() - .5) * 18 * sh * s * (SET.shake ? 1 : 0));
  // dusk sky, low sun haze, cloud bands
  let g = c.createLinearGradient(0, 0, 0, gy); g.addColorStop(0, '#231d44'); g.addColorStop(.45, '#6a3f6e'); g.addColorStop(.8, '#d8785a'); g.addColorStop(1, '#f6b878'); c.fillStyle = g; c.fillRect(-40, -40, W + 80, H + 80);
  g = c.createRadialGradient(W * .22, gy - 10 * s, 0, W * .22, gy - 10 * s, 220 * s); g.addColorStop(0, 'rgba(255,236,170,.95)'); g.addColorStop(.25, 'rgba(255,180,110,.5)'); g.addColorStop(1, 'rgba(255,140,90,0)'); c.fillStyle = g; c.fillRect(-40, -40, W + 80, H + 80);
  for (let i = 0; i < 6; i++) { const P = W + 400, x = (((ihash(i * 3 + 2) * P - t * (6 + i * 3) * s) % P) + P) % P - 200; iCloud(c, x, gy * (.12 + ihash(i + 9) * .42), (90 + ihash(i) * 90) * s, .16 + ihash(i + 4) * .14, i % 2 ? '255,170,140' : '70,40,90'); }
  // the tower the androids hit (far-middle), and where it burns
  const tx = W * .52, tw = 58 * s, th = Math.min(gy * .78, 230 * s), ttop = gy - th, hit = t >= tB, bx = tx, by = ttop + 26 * s;
  // far skyline
  for (let L = 0; L < 2; L++) { const bw = (34 + L * 12) * s, pan = t * (3 + L * 5) * s; c.fillStyle = L ? '#3c2f52' : '#5a4468';
    for (let i = -1; i < W / bw + 2; i++) { const x = i * bw - (pan % bw), id = i + Math.floor(pan / bw), hh = (46 + ihash(id * 3 + L * 11) * 96) * s * (1 - L * .12);
      c.fillRect(x, gy - hh, bw - 2 * s, hh); if (ihash(id + L * 5) < .3) c.fillRect(x + bw * .3, gy - hh - 10 * s, bw * .25, 10 * s);
      if (L) { c.fillStyle = 'rgba(255,214,130,.55)'; for (let q = 0; q < 5; q++) if (ihash(id * 7 + q) < .4) c.fillRect(x + 5 * s + (q % 3) * 9 * s, gy - hh + 10 * s + ihash(id + q) * hh * .6, 3.2 * s, 4.2 * s); c.fillStyle = '#3c2f52'; } } }
  // the tower
  c.fillStyle = '#2c2440'; c.beginPath(); c.moveTo(tx - tw / 2, gy);
  if (hit) { c.lineTo(tx - tw / 2, ttop + 46 * s); c.lineTo(tx - tw * .28, ttop + 30 * s); c.lineTo(tx - tw * .12, ttop + 52 * s); c.lineTo(tx + tw * .08, ttop + 22 * s); c.lineTo(tx + tw * .26, ttop + 44 * s); c.lineTo(tx + tw / 2, ttop + 34 * s); }
  else { c.lineTo(tx - tw / 2, ttop); c.lineTo(tx - tw * .2, ttop); c.lineTo(tx - tw * .2, ttop - 16 * s); c.lineTo(tx + tw * .2, ttop - 16 * s); c.lineTo(tx + tw * .2, ttop); c.lineTo(tx + tw / 2, ttop); }
  c.lineTo(tx + tw / 2, gy); c.closePath(); c.fill();
  if (!hit) { c.fillStyle = '#2c2440'; c.fillRect(tx - 1.5 * s, ttop - 44 * s, 3 * s, 30 * s); c.fillStyle = 'rgba(255,80,80,' + (.5 + .5 * Math.sin(t * 9)) + ')'; c.beginPath(); c.arc(tx, ttop - 44 * s, 2.6 * s, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(255,220,140,.7)'; for (let r = 0; r < 12; r++) for (let q = 0; q < 4; q++) { const wy = gy - 16 * s - r * 17 * s; if (wy < ttop + (hit ? 60 : 8) * s || ihash(r * 5 + q) < .35) continue; c.fillRect(tx - tw / 2 + 7 * s + q * 12 * s, wy, 6 * s, 8 * s); }
  // the blast that starts it all
  if (t >= tS && t < tB) { const u = (t - tS) / (tB - tS), sx = ilerp(W * 1.1, bx, u), sy = ilerp(-40 * s, by, u), ax = ilerp(W * 1.1, bx, Math.max(0, u - .22)), ay = ilerp(-40 * s, by, Math.max(0, u - .22));
    c.lineCap = 'round'; c.strokeStyle = 'rgba(255,120,60,.55)'; c.lineWidth = 16 * s; c.beginPath(); c.moveTo(ax, ay); c.lineTo(sx, sy); c.stroke(); c.strokeStyle = '#fff3c8'; c.lineWidth = 5 * s; c.stroke();
    LT(); gl('or', sx, sy, 34 * s, .95); gl('wh', sx, sy, 13 * s, 1); NM(); }
  if (hit) { const u = t - tB;
    // fireball, debris, then a fire that keeps burning under a smoke column
    if (u < .7) { const k = u / .7, r = (30 + 120 * ieo(k)) * s; g = c.createRadialGradient(bx, by, 0, bx, by, r); g.addColorStop(0, 'rgba(255,255,230,' + (1 - k) + ')'); g.addColorStop(.35, 'rgba(255,196,80,' + (.95 * (1 - k)) + ')'); g.addColorStop(.7, 'rgba(255,96,30,' + (.6 * (1 - k)) + ')'); g.addColorStop(1, 'rgba(120,30,10,0)'); c.fillStyle = g; c.beginPath(); c.arc(bx, by, r, 0, 7); c.fill();
      c.strokeStyle = 'rgba(255,240,200,' + (1 - k) + ')'; c.lineWidth = (8 * (1 - k) + 1) * s; c.beginPath(); c.arc(bx, by, r * 1.15, 0, 7); c.stroke(); }
    if (u < 1.6) for (let i = 0; i < 16; i++) { const a = -Math.PI * (.05 + ihash(i + 3) * .9), v = (120 + ihash(i) * 260) * s, x = bx + Math.cos(a) * v * u, y = by + Math.sin(a) * v * u + 420 * s * u * u, sz = (4 + ihash(i + 7) * 9) * s; if (y > gy) continue;
      c.save(); c.translate(x, y); c.rotate(u * (3 + i % 5)); c.fillStyle = i % 3 ? '#2c2440' : '#ff9a4a'; c.fillRect(-sz / 2, -sz / 2, sz, sz * .7); c.restore(); }
    for (let i = 0; i < 14; i++) { const rise = ((u * 46 + i * 34) % 470), al = Math.max(0, .78 - rise / 470 * .78) * Math.min(1, u * 3); c.fillStyle = 'rgba(' + (i % 2 ? '52,44,62' : '74,62,80') + ',' + al + ')'; c.beginPath(); c.arc(bx + Math.sin(i * 1.3 + u * .8) * (10 + rise * .12) * s + rise * .16 * s, by - rise * s * .9, (16 + rise * .13) * s, 0, 7); c.fill(); }
    LT(); const fl = .6 + .4 * Math.sin(t * 23) * Math.sin(t * 7.3); gl('or', bx, by + 6 * s, (58 + 14 * fl) * s, .8 * Math.min(1, u * 4)); gl('wh', bx, by + 10 * s, 16 * s, .55 * fl);
    for (let i = 0; i < 8; i++) { const r2 = ((u * 60 + i * 40) % 180); gl('or', bx + Math.sin(i * 2.1 + u * 2) * 22 * s, by - r2 * s, 4 * s, Math.max(0, .9 - r2 / 180)); } NM();
    if (u < .22) { c.fillStyle = 'rgba(255,244,220,' + (.75 * (1 - u / .22)) + ')'; c.fillRect(-40, -40, W + 80, H + 80); } }
  // near skyline, with the rooftop the androids land on
  const rx0 = W * .6, rx1 = W + 30, rTop = gy - 96 * s;
  c.fillStyle = '#1c1628'; for (let i = 0; i < 4; i++) { const x = W * (-.06 + i * .17), w = W * .13, hh = (40 + ihash(i * 13 + 5) * 60) * s; if (x + w > rx0 - 8) continue; c.fillRect(x, gy - hh, w, hh); c.fillStyle = 'rgba(255,196,110,.5)'; for (let q = 0; q < 6; q++) if (ihash(i * 9 + q) < .45) c.fillRect(x + 6 * s + (q % 3) * (w - 12 * s) / 3, gy - hh + 8 * s + Math.floor(q / 3) * 16 * s, 4 * s, 6 * s); c.fillStyle = '#1c1628'; }
  c.fillRect(rx0, rTop, rx1 - rx0, gy - rTop); c.fillRect(rx0 - 5 * s, rTop - 5 * s, rx1 - rx0 + 5 * s, 6 * s); c.fillRect(rx0 + (rx1 - rx0) * .7, rTop - 26 * s, 14 * s, 22 * s);
  c.fillStyle = 'rgba(255,170,110,.3)'; c.fillRect(rx0 - 5 * s, rTop - 5 * s, rx1 - rx0 + 5 * s, 1.6 * s);
  c.fillStyle = 'rgba(255,196,110,.55)'; for (let r = 0; r < 4; r++) for (let q = 0; q < 7; q++) { if (ihash(r * 11 + q + 3) < .5) continue; c.fillRect(rx0 + 9 * s + q * (rx1 - rx0 - 30 * s) / 7, rTop + 14 * s + r * 20 * s, 6 * s, 9 * s); }
  // Android 20 and 19 drop onto the roof and wait
  for (const [k, ox, dl, sc] of [['a20', .22, 0, 1.3], ['a19', .58, .16, 1.3]]) { const u = (t - tA - dl) / .26; if (u < 0) continue; const ax = rx0 + (W - rx0) * ox + 12 * s, ay = u < 1 ? ilerp(-80 * s, rTop, u * u) : rTop, r = TYPES[k].r * sc * Math.min(1.15, s);
    i6Foe(k, ax, ay - r * 1.05, sc * Math.min(1.15, s), t); if (u >= 1) i6Dust(c, ax, rTop, (u - 1) / 2.2, s * .5, '90,80,100'); }
  if (t > tA + .45 && t < tA + 1.3) { const u = (t - tA - .45) / .85, q = Math.sin(u * Math.PI); LT(); c.fillStyle = 'rgba(255,90,70,' + q + ')';
    for (const ox of [.22, .58]) { const ax = rx0 + (W - rx0) * ox + 12 * s, r = TYPES.a19.r * 1.3 * Math.min(1.15, s); if (typeof star4 == 'function') star4(ax + 4 * s, rTop - r * 1.72, 26 * s * q, 2.2 * s, 0); gl('rd', ax + 4 * s, rTop - r * 1.72, 22 * s, q * .8); } NM(); }
  // street
  g = c.createLinearGradient(0, gy, 0, H); g.addColorStop(0, '#5e606a'); g.addColorStop(1, '#2e3038'); c.fillStyle = g; c.fillRect(-40, gy, W + 80, H - gy + 40);
  c.fillStyle = 'rgba(236,234,226,.5)'; c.fillRect(-40, gy, W + 80, 2.5 * s); c.fillStyle = 'rgba(20,20,28,.35)'; c.fillRect(-40, gy + 2.5 * s, W + 80, 5 * s);
  c.fillStyle = 'rgba(240,200,80,.6)'; for (let x = -((t * 14 * s) % (70 * s)); x < W; x += 70 * s) c.fillRect(x, gy + (H - gy) * .46, 34 * s, 4 * s);
  if (hit) { LT(); g = c.createRadialGradient(bx, gy, 0, bx, gy, 260 * s); g.addColorStop(0, 'rgba(255,150,70,' + (.22 + .06 * Math.sin(t * 19)) + ')'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; c.fillRect(-40, gy, W + 80, H - gy + 40); NM(); }
  // a street lamp and a wrecked car in front
  { const lx = W * .1; c.fillStyle = '#14101c'; c.fillRect(lx - 2 * s, gy - 120 * s, 4 * s, 120 * s); c.fillRect(lx - 2 * s, gy - 122 * s, 26 * s, 4 * s); LT(); gl('or', lx + 24 * s, gy - 114 * s, 26 * s, .5 + .2 * Math.sin(t * 31) * (hit ? 1 : 0)); NM(); }
  // the hero: streaks in across the sky, drops to the road
  const hx = W * .3;
  if (t >= tF && t < tL) { const u = (t - tF) / (tL - tF), fx = ilerp(-.3 * W, hx, ieo(Math.min(1, u / .7))), fy = u < .7 ? gy * (.34 + .05 * Math.sin(u * 9)) : ilerp(gy * .34, gy - 60 * K, iease((u - .7) / .3)), lean = u < .7 ? 1.05 : ilerp(1.05, .1, iease((u - .7) / .3));
    if (u < .75) { c.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 9; i++) { const y = fy - 40 * s + i * 11 * s, x = fx - 90 * s - ((t * 900 + i * 71) % 220) * s; c.fillRect(x, y, (40 + (i % 3) * 30) * s, 1.6 * s); } }
    i6Fly(c, fx, fy, K, 1, t, lean); }
  if (t >= tL) { c.fillStyle = 'rgba(16,14,24,.4)'; c.beginPath(); c.ellipse(hx, gy + 3 * s, 34 * s, 8 * s, 0, 0, 7); c.fill(); i6Dust(c, hx, gy, (t - tL) / .9, s, '196,196,206'); i6Hero(c, hx, gy, K, Math.floor(t * 9) % FRN[1], 1); }
  c.restore();
  iBanner(c, 'ANDROID SAGA', STAGES[3].open, iease((t - 3.9) / .5) * (1 - iease((t - T + .4) / .3)), H * .2);
};

/* ---------- Level 4: Babidi's ship ---------- */
introBuu = function (c, t, T) {
  const s = i6s(), gy = H * .72, K = i6K(), tF = 1.0, tL = 2.5, tH = 2.9, tG = 3.2, tR = 4.5, tJ = 5.25;
  i6cue(t, .15, 'i6wisp'); i6cue(t, tF, 'i6fly'); i6cue(t, tL, 'i6land'); i6cue(t, tH, 'i6hatch'); i6cue(t, tR, 'dash'); i6cue(t, tJ + .3, 'tele');
  let sh = 0; if (t > tH && t < tH + 1.1) sh = .5 * (1 - (t - tH) / 1.1); else if (t > tL && t < tL + .3) sh = .35 * (1 - (t - tL) / .3);
  c.save(); if (sh > 0) c.translate((Math.random() - .5) * 14 * sh * s * (SET.shake ? 1 : 0), (Math.random() - .5) * 14 * sh * s * (SET.shake ? 1 : 0));
  const open = iease((t - tH) / .7), bx = W * .3, br = 84 * s, hy = gy - br * .2;
  // a bruised sky with a dark vortex gathering over the ship
  let g = c.createLinearGradient(0, 0, 0, gy); g.addColorStop(0, '#1a1030'); g.addColorStop(.5, '#5c2a66'); g.addColorStop(.85, '#c0607a'); g.addColorStop(1, '#f0a070'); c.fillStyle = g; c.fillRect(-40, -40, W + 80, H + 80);
  for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(255,230,255,' + (.2 + ihash(i) * .4) * (.5 + .5 * Math.sin(t * 2 + i * 2.3)) + ')'; c.fillRect(ihash(i * 2 + 1) * W, ihash(i * 2 + 2) * gy * .5, 1.5 * s, 1.5 * s); }
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + t * .25, rr = (70 + (i % 3) * 46) * s; iCloud(c, bx + Math.cos(a) * rr * 1.5, gy * .2 + Math.sin(a) * rr * .3, (80 + (i % 4) * 26) * s, .2 + (i % 3) * .06, i % 2 ? '40,16,60' : '110,50,120'); }
  if (Math.sin(t * 5.3) > .93 || (t > tH && t < tH + .12)) { c.strokeStyle = 'rgba(255,170,240,.9)'; c.lineWidth = 2 * s; c.lineJoin = 'round'; c.beginPath(); let lx = bx + (ihash(Math.floor(t * 9)) - .5) * 160 * s, ly = gy * .14; c.moveTo(lx, ly); for (let i = 0; i < 6; i++) { lx += (ihash(i + Math.floor(t * 9) * 7) - .5) * 44 * s; ly += gy * .09; c.lineTo(lx, ly); } c.stroke(); }
  // rock spires, far then near
  for (let L = 0; L < 2; L++) { c.fillStyle = ['#553258', '#38203e'][L]; c.beginPath(); c.moveTo(-40, gy);
    for (let i = 0; i <= 14; i++) { const x = i / 14 * (W + 80) - 40 - (t * (3 + L * 5) * s) % ((W + 80) / 14), hh = (36 + ihash(i * 5 + L * 13) * 96) * s * (1 - L * .25); c.lineTo(x, gy - hh * .3); c.lineTo(x + W / 44, gy - hh); c.lineTo(x + W / 22, gy - hh * .42); } c.lineTo(W + 40, gy); c.fill(); }
  // energy being drawn down into the ship
  LT(); for (let i = 0; i < 7; i++) { const ph = (t * .5 + i / 7) % 1, y0 = gy * .08, y1 = hy - br * .5; c.strokeStyle = 'rgba(255,120,220,' + (.35 * Math.sin(ph * Math.PI)) + ')'; c.lineWidth = (2 + 2 * ph) * s; c.beginPath();
    for (let q = 0; q <= 12; q++) { const u = q / 12, y = ilerp(y0, y1, u), x = bx + Math.sin(u * 5 + t * 2.2 + i * .9) * (130 * (1 - u) + 8) * s; q ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    const yy = ilerp(y0, y1, ph), xx = bx + Math.sin(ph * 5 + t * 2.2 + i * .9) * (130 * (1 - ph) + 8) * s; gl('pu', xx, yy, 9 * s, .8); } NM();
  // Babidi's ship: a half-buried spiked dome
  g = c.createRadialGradient(bx - br * .4, gy - br * .55, br * .1, bx, gy, br * 1.1); g.addColorStop(0, '#b8a6c8'); g.addColorStop(.5, '#7a6890'); g.addColorStop(1, '#3a2c4c');
  c.strokeStyle = '#160c1e'; c.lineWidth = 2.4 * s; c.lineJoin = 'round';
  c.fillStyle = '#4c3c60'; for (let i = 0; i < 7; i++) { const a = Math.PI + (i + .5) / 7 * Math.PI, x = bx + Math.cos(a) * br, y = gy + Math.sin(a) * br * .72; c.beginPath(); c.moveTo(x - Math.sin(a) * 8 * s, y + Math.cos(a) * 8 * s); c.lineTo(x + Math.cos(a) * 26 * s, y + Math.sin(a) * 26 * s); c.lineTo(x + Math.sin(a) * 8 * s, y - Math.cos(a) * 8 * s); c.closePath(); c.fill(); c.stroke(); }
  c.fillStyle = g; c.beginPath(); c.ellipse(bx, gy, br, br * .72, 0, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(22,12,30,.55)'; c.lineWidth = 1.4 * s; for (const q of [.36, .68]) { c.beginPath(); c.ellipse(bx, gy, br * q, br * .72, 0, Math.PI, 0); c.stroke(); } c.beginPath(); c.ellipse(bx, gy, br, br * .4, 0, Math.PI, 0); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.ellipse(bx - br * .36, gy - br * .5, br * .26, br * .09, -.5, 0, 7); c.fill();
  // the Majin "M" over the hatch, and the hatch itself
  { const mx = bx, my = gy - br * .52, m = 9 * s, pulse = .6 + .4 * Math.sin(t * 6); LT(); gl('pu', mx, my, 20 * s, .5 * pulse + .4 * open); NM(); c.strokeStyle = 'rgba(255,' + Math.round(130 + 90 * open) + ',220,' + (.7 + .3 * open) + ')'; c.lineWidth = 2.6 * s; c.beginPath(); c.moveTo(mx - m, my + m * .7); c.lineTo(mx - m, my - m * .7); c.lineTo(mx, my + m * .1); c.lineTo(mx + m, my - m * .7); c.lineTo(mx + m, my + m * .7); c.stroke(); }
  const hw = 20 * s, hh = 30 * s; c.fillStyle = '#120a1a'; c.strokeStyle = '#160c1e'; c.lineWidth = 2.4 * s; c.beginPath(); c.ellipse(bx, hy, hw, hh, 0, 0, 7); c.fill(); c.stroke();
  if (open > 0) { LT(); g = c.createRadialGradient(bx, hy, 0, bx, hy, hh * 1.1); g.addColorStop(0, 'rgba(255,240,255,' + open + ')'); g.addColorStop(.5, 'rgba(255,120,220,' + .85 * open + ')'); g.addColorStop(1, 'rgba(255,60,200,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(bx, hy, hw * open, hh, 0, 0, 7); c.fill();
    // light pouring out across the ground and up into the sky
    g = c.createLinearGradient(bx, hy, bx + 320 * s, hy); g.addColorStop(0, 'rgba(255,130,225,' + .45 * open + ')'); g.addColorStop(1, 'rgba(255,130,225,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(bx, hy - hh * .7); c.lineTo(bx + 340 * s, gy - 70 * s); c.lineTo(bx + 340 * s, gy + 60 * s); c.lineTo(bx, hy + hh * .7); c.fill();
    gl('pu', bx, hy, (70 + 20 * Math.sin(t * 9)) * s * open, .7 * open); NM(); }
  if (open < 1) { c.fillStyle = '#6a5a82'; c.strokeStyle = '#160c1e'; c.lineWidth = 2 * s; for (const q of [-1, 1]) { c.save(); c.beginPath(); c.ellipse(bx, hy, hw, hh, 0, 0, 7); c.clip(); c.fillRect(bx + (q < 0 ? -hw - open * hw : open * hw), hy - hh, hw, hh * 2); c.strokeRect(bx + (q < 0 ? -hw - open * hw : open * hw), hy - hh, hw, hh * 2); c.restore(); } c.beginPath(); c.ellipse(bx, hy, hw, hh, 0, 0, 7); c.stroke(); }
  // ground
  g = c.createLinearGradient(0, gy, 0, H); g.addColorStop(0, '#8e6a62'); g.addColorStop(1, '#3e2a30'); c.fillStyle = g; c.fillRect(-40, gy, W + 80, H - gy + 40);
  c.fillStyle = 'rgba(40,16,30,.35)'; c.beginPath(); c.ellipse(bx, gy + 4 * s, br * 1.15, 12 * s, 0, 0, 7); c.fill();
  for (let i = 0; i < 16; i++) { const x = ihash(i * 2 + 40) * W, y = gy + 8 * s + ihash(i * 2 + 41) * (H - gy) * .8, l = (16 + ihash(i) * 30) * s; c.strokeStyle = 'rgba(50,24,36,.5)'; c.lineWidth = 1.4 * s; c.beginPath(); c.moveTo(x, y); c.lineTo(x + l * .5, y + 4 * s); c.lineTo(x + l, y - 2 * s); c.stroke(); }
  if (open > 0) { LT(); g = c.createRadialGradient(bx + 60 * s, gy + 10 * s, 0, bx + 60 * s, gy + 10 * s, 300 * s); g.addColorStop(0, 'rgba(255,110,210,' + .3 * open + ')'); g.addColorStop(1, 'rgba(255,110,210,0)'); c.fillStyle = g; c.fillRect(-40, gy, W + 80, H - gy + 40); NM(); }
  // Babidi's fighters hop out of the hatch to stand guard
  [[.0, 58, 6], [.22, 96, 22], [.44, 132, 4]].forEach(([dl, dx, dy], i) => { const u = (t - tG - dl) / .42; if (u < 0) return; const x = bx + (u < 1 ? ilerp(8, dx, u) : dx) * s, y = gy + dy * s * .5 - (u < 1 ? Math.sin(u * Math.PI) * 46 * s : 0) - 22 * s;
    i6Foe('mj', x, y + Math.sin(t * 7 + i) * 1.5 * s, 1.6 * Math.min(1.15, s) * (u < 1 ? .6 + .4 * u : 1), t); });
  // the hero: flies in from the right, lands, then charges down the hatch
  const hx = Math.min(W * .72, bx + 250 * s), fk = K;
  if (t >= tF && t < tL) { const u = (t - tF) / (tL - tF), fx = ilerp(1.3 * W, hx, ieo(Math.min(1, u / .7))), fy = u < .7 ? gy * (.36 + .05 * Math.sin(u * 9)) : ilerp(gy * .36, gy - 60 * fk, iease((u - .7) / .3)), lean = u < .7 ? 1.05 : ilerp(1.05, .1, iease((u - .7) / .3));
    if (u < .75) { c.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 9; i++) { const y = fy - 40 * s + i * 11 * s, x = fx + 90 * s + ((t * 900 + i * 71) % 220) * s; c.fillRect(x, y, (40 + (i % 3) * 30) * s, 1.6 * s); } }
    i6Fly(c, fx, fy, fk, -1, t, lean); }
  else if (t >= tL && t < tR) { c.fillStyle = 'rgba(30,12,24,.4)'; c.beginPath(); c.ellipse(hx, gy + 3 * s, 34 * s, 8 * s, 0, 0, 7); c.fill(); i6Dust(c, hx, gy, (t - tL) / .9, s, '206,176,170'); i6Hero(c, hx, gy, fk, Math.floor(t * 9) % FRN[1], 1, true); }
  else if (t >= tR) { const run = iclamp((t - tR) / (tJ - tR), 0, 1), jmp = iclamp((t - tJ) / .5, 0, 1), jx0 = bx + 62 * s, x = jmp > 0 ? ilerp(jx0, bx, jmp) : ilerp(hx, jx0, run * run * .6 + run * .4), feet = jmp > 0 ? ilerp(gy, hy + hh * .5, jmp) - Math.sin(jmp * Math.PI) * 54 * s : gy, sc = jmp > 0 ? 1 - .7 * jmp * jmp : 1;
    if (jmp <= 0) { c.fillStyle = 'rgba(30,12,24,.4)'; c.beginPath(); c.ellipse(x, gy + 3 * s, 34 * s, 8 * s, 0, 0, 7); c.fill();
      for (let i = 1; i <= 3; i++) i6Hero(c, x + i * 16 * s, feet, fk, Math.floor(t * 16 - i) % FRN[2], 2, true, .16 - i * .04);
      for (let i = 0; i < 4; i++) { const d = ((t * 3 + i * .25) % 1); c.fillStyle = 'rgba(206,176,170,' + .4 * (1 - d) + ')'; c.beginPath(); c.arc(x + 24 * s + d * 46 * s, gy - 4 * s - d * 10 * s, (5 + d * 9) * s, 0, 7); c.fill(); } }
    if (jmp < 1) i6Hero(c, x, feet, fk * sc, Math.floor(t * 16) % FRN[2], 2, true, 1 - jmp * jmp * .6); }
  c.restore();
  if (t > tJ + .3) { c.fillStyle = 'rgba(255,170,235,' + iclamp((t - tJ - .3) / .35, 0, 1) * .9 + ')'; c.fillRect(0, 0, W, H); }
  iBanner(c, 'MAJIN BUU SAGA', STAGES[4].open, iease((t - 3.9) / .5) * (1 - iease((t - tJ) / .3)), H * .2);
};
