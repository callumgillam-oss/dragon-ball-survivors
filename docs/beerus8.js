/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — TIME LIMIT: BEERUS (2026-11-14)
   Story runs can't go on forever. At 19:00 a banner warns you and a one-minute countdown appears near the top.
   At 20:00 the sky goes black, a purple light flickers and grows, and Beerus, bored, looks down at the Earth,
   says "You ants bore me." and flicks a ki orb into the planet. The run ends: out of time.
   Not in Endless. Every level's final boss arrives by about 8:00, so only a stalled run gets here.
   Secret achievement: "Hakai".
   ===================================================================== */
'use strict';

const BTO = { warn: 1140, end: 1200, T: 9.8 };

{ const _u = update; update = function (dt) {
    const r = _u(dt);
    if (S.mode == 'play' && !S.endless) {
      if (S.t >= BTO.warn && !S.btw) { S.btw = 1; ban('HURRY! YOU ARE RUNNING OUT OF TIME!'); try { sfxPlay('i6menace'); } catch (e) { } }
      if (S.t >= BTO.end && !S.bto) { S.bto = 1; S.mode = 'bcut'; S.ban = null; show(''); joy = null; V2.bc = { t0: performance.now() / 1000, q: {} }; }
    }
    return r;
  }; }

/* ---------- countdown pill: top right, under the run clock and the Dragon Ball tracker (boss bars stack across the top centre) ---------- */
function btoTimer() {
  if (!S.btw || S.bto || S.endless || !(S.mode == 'play' || S.mode == 'pause' || S.mode == 'lvl')) return;
  const left = Math.max(0, BTO.end - S.t), s = Math.ceil(left), urgent = left < 10, txt = 'TIME LEFT  ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.font = 'bold 13px "Trebuchet MS",sans-serif'; const w = ctx.measureText(txt).width + 24, sc = urgent ? 1 + .06 * Math.max(0, Math.sin(S.t * 12)) : 1;
  ctx.translate(W - 12 - w / 2, ST + 96); ctx.scale(sc, sc);
  ctx.fillStyle = 'rgba(20,6,26,.86)'; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(-w / 2, -13, w, 26, 13); else ctx.rect(-w / 2, -13, w, 26); ctx.fill();
  ctx.strokeStyle = urgent ? '#ff5a7a' : '#b77bff'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = urgent ? '#ffd0da' : '#e8d4ff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 1);
  ctx.restore();
}

/* ---------- Beerus, drawn in the game's chunky outlined style ---------- */
// x, y: centre of the head; s: scale (head is about 100 units wide); look: 0..1 eyes drift down
function drawBeerus(c, x, y, s, t, look) {
  const OL = '#24102e', SK = '#9a68b4', SKD = '#7a4c96', IN = '#5e3474', GOLD = '#f0c040';
  c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round'; c.lineCap = 'round';
  // robe and shoulders
  c.fillStyle = '#16101c'; c.strokeStyle = OL; c.lineWidth = 3;
  c.beginPath(); c.moveTo(-150, 300); c.lineTo(-134, 130); c.quadraticCurveTo(-120, 70, -40, 62); c.lineTo(40, 62); c.quadraticCurveTo(120, 70, 134, 130); c.lineTo(150, 300); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = GOLD; c.lineWidth = 4; c.beginPath(); c.moveTo(-112, 96); c.quadraticCurveTo(-70, 76, -40, 74); c.moveTo(112, 96); c.quadraticCurveTo(70, 76, 40, 74); c.stroke();
  // neck and gold collar
  c.fillStyle = SKD; c.strokeStyle = OL; c.lineWidth = 3; c.beginPath(); c.rect(-13, 34, 26, 32); c.fill(); c.stroke();
  c.fillStyle = GOLD; c.beginPath(); c.ellipse(0, 62, 50, 13, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#ffe28a'; c.beginPath(); c.ellipse(0, 58, 36, 5, 0, 3.4, 6); c.fill();
  // ears: tall and pointed, gold bands near the base
  for (const m of [-1, 1]) {
    c.fillStyle = SK; c.strokeStyle = OL; c.lineWidth = 3; c.beginPath(); c.moveTo(m * 40, -30); c.quadraticCurveTo(m * 80, -90, m * 86, -162); c.quadraticCurveTo(m * 44, -126, m * 12, -72); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = IN; c.beginPath(); c.moveTo(m * 38, -42); c.quadraticCurveTo(m * 70, -96, m * 78, -144); c.quadraticCurveTo(m * 46, -118, m * 20, -72); c.closePath(); c.fill();
    c.strokeStyle = GOLD; c.lineWidth = 5; for (const [ax, ay, bx, by] of [[46, -50, 18, -80], [54, -68, 28, -94]]) { c.beginPath(); c.moveTo(m * ax, ay); c.lineTo(m * bx, by); c.stroke(); }
  }
  // head: long and gaunt. High domed skull, sharp cheekbones, hollow cheeks, a narrow pointed chin
  c.fillStyle = SK; c.strokeStyle = OL; c.lineWidth = 3.5;
  c.beginPath(); c.moveTo(0, -78);
  c.bezierCurveTo(30, -78, 42, -58, 42, -30);   // right temple
  c.quadraticCurveTo(44, -10, 40, 0);           // right cheekbone (widest)
  c.quadraticCurveTo(30, 12, 26, 26);           // hollow under the cheekbone
  c.quadraticCurveTo(18, 48, 0, 58);            // long jaw to a narrow chin
  c.quadraticCurveTo(-18, 48, -26, 26);
  c.quadraticCurveTo(-30, 12, -40, 0);
  c.quadraticCurveTo(-44, -10, -42, -30);
  c.bezierCurveTo(-42, -58, -30, -78, 0, -78); c.closePath(); c.fill(); c.stroke();
  // shading: sunken cheeks, cheekbone ridges, temples, the hollow above the chin
  c.fillStyle = 'rgba(60,24,80,.38)';
  for (const m of [-1, 1]) {
    c.beginPath(); c.moveTo(m * 38, 2); c.quadraticCurveTo(m * 22, 10, m * 14, 30); c.quadraticCurveTo(m * 22, 30, m * 26, 26); c.quadraticCurveTo(m * 30, 12, m * 38, 2); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(m * 40, -44); c.quadraticCurveTo(m * 32, -40, m * 33, -26); c.quadraticCurveTo(m * 40, -30, m * 42, -30); c.closePath(); c.fill();
  }
  c.strokeStyle = 'rgba(40,14,56,.7)'; c.lineWidth = 1.8;
  for (const m of [-1, 1]) { c.beginPath(); c.moveTo(m * 36, -2); c.quadraticCurveTo(m * 26, 6, m * 18, 22); c.stroke(); }   // cheekbone creases
  c.beginPath(); c.moveTo(-6, 44); c.quadraticCurveTo(0, 47, 6, 44); c.stroke();   // chin
  // deep-set eyes: dark sockets, a furrowed brow ridge, half-closed lids, bored and looking down
  for (const m of [-1, 1]) {
    const ex = m * 19, ey = -16;
    c.fillStyle = 'rgba(46,16,62,.55)'; c.beginPath(); c.ellipse(ex, ey - 1, 18, 11, m * .2, 0, 7); c.fill();   // socket
    c.strokeStyle = OL; c.lineWidth = 2.6; c.beginPath(); c.moveTo(m * 4, -30); c.quadraticCurveTo(m * 18, -34, m * 34, -26); c.stroke();   // brow ridge, angled down to the nose
    c.save(); c.translate(ex, ey); c.rotate(m * .2);
    c.fillStyle = '#e4ec58'; c.beginPath(); c.ellipse(0, 1, 12, 6, 0, 0, 7); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.ellipse(m * -1, 2 + 2.5 * look, 2, 4.4, 0, 0, 7); c.fill();
    c.fillStyle = '#5e3276'; c.beginPath(); c.moveTo(-14, 2); c.quadraticCurveTo(0, -7, 14, 2); c.lineTo(14, -9); c.lineTo(-14, -9); c.closePath(); c.fill();   // heavy upper lid
    c.strokeStyle = '#120818'; c.lineWidth = 3.2; c.beginPath(); c.moveTo(-13, 2); c.quadraticCurveTo(0, -4, 13, 2); c.lineTo(m * 20, -2); c.stroke();   // liner with a flick
    c.lineWidth = 1.5; c.beginPath(); c.ellipse(0, 1, 12, 6, 0, .25, 2.9); c.stroke();
    c.restore();
    c.strokeStyle = 'rgba(240,192,64,.85)'; c.lineWidth = 2; c.beginPath(); c.moveTo(ex + m * 8, ey + 9); c.lineTo(ex + m * 13, ey + 19); c.stroke();
  }
  // a small cat nose, a long upper lip, a thin downturned mouth
  c.strokeStyle = OL; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-4, 8); c.lineTo(0, 12); c.lineTo(4, 8); c.stroke();
  c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, 12); c.lineTo(0, 22); c.stroke();
  c.lineWidth = 2.6; c.beginPath(); c.moveTo(-11, 30); c.quadraticCurveTo(0, 25, 11, 30); c.stroke();
  c.restore();
}
// his hand, one finger raised, a gold band at the wrist
function drawBeerusHand(c, x, y, s, flick) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-.25 + flick * .55); c.lineJoin = 'round';
  c.fillStyle = '#9a68b4'; c.strokeStyle = '#24102e'; c.lineWidth = 3;
  c.beginPath(); c.ellipse(0, 18, 16, 19, 0, 0, 7); c.fill(); c.stroke();
  c.beginPath(); if (c.roundRect) c.roundRect(-5, -26, 10, 34, 5); else c.rect(-5, -26, 10, 34); c.fill(); c.stroke();
  c.strokeStyle = '#f0c040'; c.lineWidth = 6; c.beginPath(); c.moveTo(-15, 36); c.lineTo(15, 36); c.stroke();
  c.restore();
}
function drawEarth(c, x, y, R, crack) {
  c.save();
  const g = c.createRadialGradient(x - R * .3, y - R * .4, R * .1, x, y, R); g.addColorStop(0, '#5fb4ff'); g.addColorStop(.7, '#1f5fb8'); g.addColorStop(1, '#0a2a66');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, 7); c.fill();
  c.save(); c.beginPath(); c.arc(x, y, R, 0, 7); c.clip(); c.fillStyle = '#3e9a4a';
  for (const [u, v, a, b] of [[-.35, -.6, .28, .16], [.2, -.75, .22, .12], [.45, -.45, .18, .2], [-.6, -.25, .2, .14], [.05, -.35, .14, .09]]) { c.beginPath(); c.ellipse(x + u * R, y + v * R, a * R, b * R, u, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.55)'; for (const [u, v, a] of [[-.1, -.85, .3], [.4, -.6, .2], [-.5, -.45, .22]]) { c.beginPath(); c.ellipse(x + u * R, y + v * R, a * R, a * R * .12, -.2, 0, 7); c.fill(); }
  if (crack > 0) { c.strokeStyle = 'rgba(255,170,255,' + Math.min(1, crack * 1.4) + ')'; c.lineWidth = 3 + 5 * crack; c.lineCap = 'round';
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * .32; let px = x, py = y - R; c.beginPath(); c.moveTo(px, py);
      for (let j = 1; j <= 5; j++) { const d = R * .32 * j * crack; px = x + Math.cos(a + Math.sin(i * 7 + j) * .25) * d * 1.1; py = y - R + Math.abs(Math.sin(a)) * 0 + d * .9 * Math.abs(Math.cos((i - 4) * .2)); c.lineTo(px, py); } c.stroke(); } }
  c.restore();
  c.strokeStyle = 'rgba(140,200,255,.55)'; c.lineWidth = R * .03; c.beginPath(); c.arc(x, y, R * 1.01, 0, 7); c.stroke();
  c.restore();
}

/* ---------- the cutscene ---------- */
function btoCue(t, tt, k) { const q = V2.bc.q; if (t >= tt && !q[k + tt]) { q[k + tt] = 1; try { sfxPlay(k); } catch (e) { } } }
function drawBerusCut() {
  if (S.mode != 'bcut' || !V2.bc) return;
  const t = V2.bc.fix != null ? V2.bc.fix : performance.now() / 1000 - V2.bc.t0, FL = FLM(), c = ctx;
  if (t >= BTO.T) { btoEnd(); return; }
  c.save(); c.setTransform(DPR, 0, 0, DPR, 0, 0);
  // 1) the sky turns black over the frozen battle
  if (t < 3.4) {
    c.fillStyle = 'rgba(0,0,0,' + Math.min(1, t / 1.3) + ')'; c.fillRect(0, 0, W, H);
    // 2) a purple light flickers in the dark and grows
    if (t > 1.1) { const u = Math.min(1, (t - 1.1) / 2.2), on = u > .55 || Math.sin(t * 47) + Math.sin(t * 23) > -.4;
      if (on) { const r = (10 + 120 * u * u) * Math.min(W, H) / 600 * (.85 + .15 * Math.sin(t * 31)), cx = W / 2, cy = H * .34;
        const g = c.createRadialGradient(cx, cy, 0, cx, cy, r * 2.4); g.addColorStop(0, 'rgba(255,235,255,' + .95 * FL + ')'); g.addColorStop(.2, 'rgba(200,110,255,' + .8 * FL + ')'); g.addColorStop(.55, 'rgba(110,40,190,' + .35 * FL + ')'); g.addColorStop(1, 'rgba(60,0,120,0)');
        c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r * 2.4, 0, 7); c.fill(); } }
    btoCue(t, 1.2, 'i6menace');
    c.restore(); return;
  }
  // 3) close-up: Beerus above the Earth
  const S_ = Math.min(W, H) / 430, hx = W / 2, hy = H * .33, ER = Math.max(W, H) * .62, ex = W / 2, ey = Math.max(hy + 110 * S_ + ER, H + ER * .36), top = ey - ER;
  let sh = 0; if (t > 6.55 && t < 7.6) sh = (1 - (t - 6.55) / 1.05) * (SET.shake ? 1 : 0);
  c.translate((Math.random() - .5) * 20 * sh, (Math.random() - .5) * 20 * sh);
  c.fillStyle = '#05030a'; c.fillRect(-30, -30, W + 60, H + 60);
  for (let i = 0; i < 90; i++) { const sx = (i * 137.5 % 1) * W + ((i * 53) % W), sy = ((i * 89) % H); c.fillStyle = 'rgba(255,255,255,' + (.25 + .5 * ((i * 7) % 10) / 10) + ')'; c.fillRect(sx % W, sy, 1.6, 1.6); }
  const boom = t > 6.55, bu = boom ? Math.min(1, (t - 6.55) / 1.4) : 0;
  const fin = Math.min(1, (t - 3.4) / .35);
  c.globalAlpha = fin; drawBeerus(c, hx, hy, S_, t, Math.min(1, (t - 3.4) / .8)); c.globalAlpha = 1;
  if (bu < .75) { c.globalAlpha = 1 - Math.max(0, bu - .45) / .3; drawEarth(c, ex, ey, ER, boom ? Math.min(1, bu * 1.8) : 0); c.globalAlpha = 1; }
  // "You ants bore me."
  if (t > 3.8 && t < 6.4) { const msg = 'You ants bore me.', n = Math.min(msg.length, Math.floor((t - 3.8) * 16)), txt = msg.slice(0, n);
    c.font = 'bold ' + Math.round(17 * Math.max(1, S_ * .85)) + 'px "Trebuchet MS",sans-serif'; const bw = c.measureText(msg).width + 28, bh = 38 * Math.max(1, S_ * .85), bx = Math.max(10, Math.min(W - bw - 10, hx + 62 * S_)), by = Math.max(12, hy - 104 * S_);
    c.fillStyle = 'rgba(255,255,255,.95)'; c.strokeStyle = '#24102e'; c.lineWidth = 3; c.beginPath(); if (c.roundRect) c.roundRect(bx, by, bw, bh, 14); else c.rect(bx, by, bw, bh); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(bx + 22, by + bh - 1); c.lineTo(bx + 4, by + bh + 18); c.lineTo(bx + 40, by + bh - 1); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.fillRect(bx + 22, by + bh - 3, 18, 4);
    c.fillStyle = '#24102e'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(txt, bx + 14, by + bh / 2 + 1); c.textBaseline = 'alphabetic'; }
  // 4) the finger, the orb, the flick
  const hpx = hx + 78 * S_, hpy = hy + 78 * S_;
  if (t > 5.0 && t < 6.2) { const up = Math.min(1, (t - 5.0) / .35), fl = t > 5.85 ? Math.min(1, (t - 5.85) / .12) : 0;
    drawBeerusHand(c, hpx, hpy + (1 - up) * 80 * S_, S_, fl);
    if (t < 5.95) { const or = (5 + 2 * Math.sin(t * 30)) * S_, ox = hpx - 10 * S_, oy = hpy - 32 * S_ + (1 - up) * 80 * S_;
      const g = c.createRadialGradient(ox, oy, 0, ox, oy, or * 4); g.addColorStop(0, 'rgba(255,240,255,1)'); g.addColorStop(.3, 'rgba(200,110,255,.9)'); g.addColorStop(1, 'rgba(110,30,190,0)'); c.fillStyle = g; c.beginPath(); c.arc(ox, oy, or * 4, 0, 7); c.fill(); } }
  if (t >= 5.95 && t < 6.55) { const u = (t - 5.95) / .6, ox = hpx - 10 * S_ + (ex - (hpx - 10 * S_)) * u, oy = hpy - 32 * S_ + (top + 6 - (hpy - 32 * S_)) * u * u, or = (6 + 6 * u) * S_;
    const g = c.createRadialGradient(ox, oy, 0, ox, oy, or * 4); g.addColorStop(0, 'rgba(255,240,255,1)'); g.addColorStop(.3, 'rgba(200,110,255,.9)'); g.addColorStop(1, 'rgba(110,30,190,0)'); c.fillStyle = g; c.beginPath(); c.arc(ox, oy, or * 4, 0, 7); c.fill(); }
  btoCue(t, 5.95, 'galick'); btoCue(t, 6.55, 'boom'); btoCue(t, 7.0, 'boom');
  // 5) the planet goes
  if (boom) { const R = ER * (.15 + 1.6 * bu), g = c.createRadialGradient(ex, top, 0, ex, top, R);
    g.addColorStop(0, 'rgba(255,245,255,' + (1 - bu * .6) * FL + ')'); g.addColorStop(.35, 'rgba(210,120,255,' + .85 * (1 - bu * .5) * FL + ')'); g.addColorStop(1, 'rgba(90,20,160,0)');
    c.fillStyle = g; c.beginPath(); c.arc(ex, top, R, 0, 7); c.fill();
    c.strokeStyle = 'rgba(240,200,255,' + (1 - bu) + ')'; c.lineWidth = 6 + 10 * (1 - bu); c.beginPath(); c.ellipse(ex, top, R * 1.1, R * .35, 0, 0, 7); c.stroke();
    if (bu > .35) { for (let i = 0; i < 26; i++) { const a = (i / 26) * 6.283 + i, d = ER * (bu - .3) * (1.1 + (i % 5) * .25), r = (6 + (i % 4) * 5) * S_, fx = ex + Math.cos(a) * d, fy = top + ER * .5 + Math.sin(a) * d * .8;
      if (fy < top + 30 * S_) continue;   // fragments fly outwards and down, never across his face
      c.fillStyle = i % 3 ? '#5a4232' : '#3f6a3a'; c.beginPath(); c.moveTo(fx - r, fy); c.lineTo(fx - r * .3, fy - r); c.lineTo(fx + r, fy - r * .4); c.lineTo(fx + r * .6, fy + r * .8); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,170,90,.8)'; c.lineWidth = 2; c.stroke(); } } }
  if (t > 6.55 && t < 7.05) { const u = (t - 6.55) / .5; c.fillStyle = 'rgba(245,215,255,' + .75 * (1 - u) * FL + ')'; c.fillRect(-30, -30, W + 60, H + 60); }   // impact flash
  // 6) fade out: out of time
  if (t > 8.1) { const u = Math.min(1, (t - 8.1) / .7); c.fillStyle = 'rgba(0,0,0,' + u + ')'; c.fillRect(-30, -30, W + 60, H + 60);
    c.globalAlpha = Math.min(1, (t - 8.4) / .5); if (c.globalAlpha > 0) { c.textAlign = 'center'; c.font = Math.round(34 * Math.max(1, S_ * .8)) + 'px Impact,Haettenschweiler,"Arial Black",sans-serif'; c.lineWidth = 6; c.strokeStyle = '#2a0a3a'; c.strokeText('YOU RAN OUT OF TIME', W / 2, H / 2); c.fillStyle = '#e6c8ff'; c.fillText('YOU RAN OUT OF TIME', W / 2, H / 2); } c.globalAlpha = 1; }
  c.restore();
}
function btoEnd() {
  V2.bc = null; S.btoDone = 1; S.mode = 'over'; endCard(false);
  const c = ov.querySelector('.card.end'); if (!c) return;
  const h = c.querySelector('h2'); if (h) h.textContent = 'OUT OF TIME';
  const p = c.querySelector('h2 + p'); if (p) p.textContent = 'Beerus got bored and destroyed the Earth. Defeat the final boss before 20:00.';
}
{ const _d = draw; draw = function () { _d(); try { btoTimer(); drawBerusCut(); } catch (e) { if (S.mode == 'bcut') btoEnd(); } }; }

/* ---------- secret achievement ---------- */
{ const a = { id: 'xbeerus', c: 'secret', n: 'Hakai', h: 'Some gods hate waiting.', d: 'Keep a run going until Beerus loses his patience (20:00)', r: ['z:500'], t: () => !!(S && S.btoDone) };
  ACH.push(a); ACH_BY[a.id] = a; }
