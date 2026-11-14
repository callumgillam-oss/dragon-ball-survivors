/* =====================================================================
   DRAGON BALL SURVIVORS — HERO DEATH ANIMATIONS
   When HP hits 0 the fight freezes and the hero goes down in their own
   way, then the end card (or King Kai's Training) follows. Tap / Space
   skips once it has started.
     Goku    — knocked flat on his back, a halo floats up
     Vegeta  — too proud to fall: one last self-destruct blast
     Piccolo — drops to a knee and dissolves into green light
     Gohan   — a last flare of hidden rage that fizzles out
     Krillin — spun head over heels, seeing stars
     Trunks  — loses his sword, falls, and fades out in a time shimmer
     Gotenks — the fusion pops and two little fighters tumble apart
   ===================================================================== */
'use strict';

const DTH_T = { goku: 2.4, vegeta: 2.6, pic: 2.4, gohan: 2.5, kri: 2.4, trunks: 2.5, gotenks: 2.5 };
const DTH_FOOT = 21, DTH_TALL = 50;   // sprite feet below its centre, and head height above the feet
let DTH = null;                       // { t, last, hero, face, fin, cue, pt }
const dCl = x => Math.max(0, Math.min(1, x));
const dOut = x => { x = dCl(x); return 1 - (1 - x) * (1 - x) * (1 - x); };
const dIn = x => { x = dCl(x); return x * x; };
const dSh = k => (Math.random() - .5) * k;

// The sprite sets its own globalAlpha, so it is drawn onto a scratch canvas first; that also lets it be tinted and faded
const DTH_C = mk(192, 192), DTH_X = DTH_C.getContext('2d'), DTH_O = { x: 96, y: 120 };
let dthRaw = null;   // the original sprite function

{ const _e = endCard; endCard = function (win) {
    if (!win && S.mode == 'over' && S.p && S.p.hp <= 0 && !DTH && !V2.kkFast) { dthStart(_e); return; }
    return _e(win);
  }; }

function dthStart(fin) {
  const p = S.p; p.hp = 0; S.mode = 'dying'; S.ban = null; S.hurt = 0; S.flash = .7; joy = null;
  p.mag = 0; p.atk = 0;
  try { store.removeItem(RUNK); } catch (e) { }   // never resume a run from just before the KO
  const hero = DTH_T[S.hero] ? S.hero : 'goku';
  DTH = { t: 0, last: performance.now(), hero, face: p.face || 1, fin, cue: {}, pt: [] };
  try { sfxPlay('hurt'); } catch (e) { }
}
function dthFinish() {
  if (!DTH) return; const fin = DTH.fin; DTH = null; S.mode = 'over'; S.flash = 0; fin(false);
}
function dthSkip() { if (S.mode == 'dying' && DTH && DTH.t > .5) dthFinish(); }
cv.addEventListener('pointerdown', dthSkip);
addEventListener('keydown', e => { if (S.mode == 'dying' && (e.key == ' ' || e.key == 'Enter' || e.key == 'Escape')) { e.preventDefault(); dthSkip(); } });

// once per cue name
function dCue(k, at, fn) { if (DTH.t >= at && !DTH.cue[k]) { DTH.cue[k] = 1; fn(); } }
function dSfx(k) { try { sfxPlay(k); } catch (e) { } }
// particles, in screen offsets from the hero's centre
function dPart(x, y, vx, vy, L, r, c, o) { DTH.pt.push(Object.assign({ x, y, vx, vy, l: L, L, r, c, g: 0 }, o || {})); }
function dDust(x, y, n) { for (let i = 0; i < n; i++) { const s = (i % 2 ? 1 : -1) * (20 + Math.random() * 60); dPart(x + dSh(16), y - 2, s, -10 - Math.random() * 25, .5 + Math.random() * .35, 5 + Math.random() * 6, 'rgba(170,135,95,', { dust: 1 }); } }

// draws the hero rotated about the feet; (dx,dy) moves the feet
function dHero(c, x, y, o) {
  o = o || {}; const X = DTH_X;
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1; X.clearRect(0, 0, 192, 192);
  dthRaw(X, DTH_O.x, DTH_O.y, DTH.face, S.t);
  if (o.tint) { X.globalCompositeOperation = 'source-atop'; X.globalAlpha = o.tintA == null ? .6 : o.tintA; X.fillStyle = o.tint; X.fillRect(0, 0, 192, 192); X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1; }
  c.save(); c.translate(x + (o.dx || 0), y + DTH_FOOT + (o.dy || 0)); c.rotate(o.rot || 0); c.scale(o.sx || 1, o.sy || 1);
  c.globalAlpha = o.a == null ? 1 : dCl(o.a);
  c.drawImage(DTH_C, -DTH_O.x, -DTH_O.y - DTH_FOOT);
  c.restore();
}
// where the head ends up for a body standing on (fx,fy) and rotated by rot
const dHead = (fx, fy, rot, s) => ({ x: fx + Math.sin(rot) * DTH_TALL * (s || 1), y: fy - Math.cos(rot) * DTH_TALL * (s || 1) });

// ---------------- each hero's fall, drawn in place of the sprite ----------------
const DTH_POSE = {
  goku(c, x, y, t, f) {
    const back = -f, k = dIn((t - .35) / .5), bounce = t > .85 && t < 1.12 ? -7 * Math.sin(Math.PI * (t - .85) / .27) : 0;
    const rot = t < .35 ? back * .18 * dOut(t / .35) : back * (.18 + (Math.PI / 2 - .18) * k), dx = back * (16 * dOut(t / .35) + 12 * k);
    dCue('land', .85, () => { dDust(dx, DTH_FOOT, 12); dSfx('pop'); });
    dHero(c, x, y, { dx: dx + (t < .35 ? dSh(4) : 0), dy: bounce, rot });
    DTH.head = dHead(dx, DTH_FOOT, rot);
  },
  vegeta(c, x, y, t, f) {
    if (t > 1.42) return;
    const kneel = dOut((t - .25) / .35), shake = 1 + 5 * dCl((t - .4) / 1);
    dCue('charge', .35, () => dSfx('charge'));
    dHero(c, x, y, { dx: -f * 14 * dOut(t / .25) + dSh(shake), dy: 5 * kneel, sy: 1 - .16 * kneel, sx: 1 + .05 * kneel, rot: f * .12 * kneel,
      tint: '#fff6c0', tintA: .7 * dIn((t - .7) / .7) });
  },
  pic(c, x, y, t, f) {
    const kneel = dOut((t - .3) / .35), fade = dCl((t - .85) / 1.05);
    if (t > .85 && Math.random() < .9) for (let i = 0; i < 3; i++) dPart(dSh(30), DTH_FOOT - Math.random() * 46 * (1 - .15 * kneel), dSh(14), -30 - Math.random() * 50, .7 + Math.random() * .5, 2 + Math.random() * 3, Math.random() < .5 ? 'rgba(150,255,140,' : 'rgba(235,255,225,', { lit: 1 });
    dCue('dis', .85, () => dSfx('zap'));
    if (fade >= 1) return;
    dHero(c, x, y, { dx: -f * 12 * dOut(t / .3) + (t < .3 ? dSh(3) : 0), dy: 5 * kneel, sy: 1 - .15 * kneel, rot: f * .16 * kneel, a: 1 - fade, tint: '#c8ffc0', tintA: .75 * fade });
  },
  gohan(c, x, y, t, f) {
    const rage = dCl((t - .25) / .2) * (1 - dCl((t - .95) / .25)), k = dIn((t - 1.15) / .45);
    const bounce = t > 1.6 && t < 1.85 ? -6 * Math.sin(Math.PI * (t - 1.6) / .25) : 0;
    dCue('rage', .25, () => dSfx('zap'));
    dCue('land', 1.6, () => { dDust(f * 30, DTH_FOOT, 12); dSfx('pop'); });
    const rot = f * (Math.PI / 2) * k;
    dHero(c, x, y, { dx: -f * 12 * dOut(t / .25) + dSh(4 * rage), dy: bounce, rot, sx: 1 + .06 * rage, sy: 1 + .06 * rage, tint: '#ffffff', tintA: .35 * rage * (.6 + .4 * Math.sin(t * 40)) });
    DTH.rage = rage;
  },
  kri(c, x, y, t, f) {
    const back = -f, k = dOut(t / .9), air = t < .9 ? -46 * Math.sin(Math.PI * dCl(t / .9)) : t < 1.12 ? -6 * Math.sin(Math.PI * (t - .9) / .22) : 0;
    const rot = back * (Math.PI * 4 + Math.PI / 2) * k, dx = back * 76 * k;
    dCue('spin', .05, () => dSfx('swish'));
    dCue('land', .9, () => { dDust(dx, DTH_FOOT, 14); dSfx('pop'); });
    dHero(c, x, y, { dx, dy: air, rot });
    DTH.head = dHead(dx, DTH_FOOT, rot);
  },
  trunks(c, x, y, t, f) {
    const kneel = dOut((t - .3) / .3), k = dIn((t - .75) / .45), fade = dCl((t - 1.45) / .85);
    const bounce = t > 1.2 && t < 1.42 ? -5 * Math.sin(Math.PI * (t - 1.2) / .22) : 0;
    dCue('drop', .12, () => dSfx('disc'));
    dCue('land', 1.2, () => { dDust(f * 30, DTH_FOOT, 12); dSfx('pop'); });
    dCue('fade', 1.45, () => dSfx('tele'));
    if (fade < 1) dHero(c, x, y, { dx: -f * 12 * dOut(t / .3) + (t < .3 ? dSh(3) : 0), dy: 5 * kneel * (1 - k) + bounce, sy: 1 - .14 * kneel * (1 - k), rot: f * Math.PI / 2 * k, a: 1 - fade, tint: '#bfe6ff', tintA: .8 * fade });
    if (t > 1.45 && t < 2.3 && Math.random() < .7) dPart(f * 25 + dSh(50), DTH_FOOT - 4 - Math.random() * 10, 0, -40 - Math.random() * 40, .6, 2.5, 'rgba(170,225,255,', { lit: 1 });
  },
  gotenks(c, x, y, t, f) {
    if (t < .6) {
      const glow = dCl((t - .2) / .4);
      dHero(c, x, y, { dx: -f * 12 * dOut(t / .3) + dSh(3 + 4 * glow), tint: '#ffffff', tintA: .85 * glow });
      return;
    }
    dCue('pop', .6, () => { S.flash = .9; dSfx('flare'); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; dPart(0, -10, Math.cos(a) * 140, Math.sin(a) * 100, .45, 4, 'rgba(255,240,170,', { lit: 1 }); } });
    const k = dOut((t - .6) / .6), air = t < 1.2 ? -34 * Math.sin(Math.PI * dCl((t - .6) / .6)) : 0, fade = dCl((t - 1.55) / .45);
    dCue('land', 1.2, () => { dDust(-48, DTH_FOOT, 7); dDust(48, DTH_FOOT, 7); dSfx('pop'); });
    dCue('poof', 1.55, () => { for (const s of [-1, 1]) for (let i = 0; i < 9; i++) dPart(s * 48 + dSh(30), DTH_FOOT - 10 + dSh(16), dSh(40), -20 - Math.random() * 30, .7, 9 + Math.random() * 6, 'rgba(235,235,240,', { dust: 1 }); dSfx('pop'); });
    if (fade >= 1) return;
    for (const s of [-1, 1]) dHero(c, x, y, { dx: s * 48 * k, dy: air, sx: .64, sy: .64, rot: s * (Math.PI * 1.5 + Math.PI / 2) * k * (t < 1.2 ? 1 : 1), a: 1 - fade, tint: s < 0 ? '#ffb46a' : '#a6c8ff', tintA: .25 + .5 * fade });
  },
};

// effects that sit on top of everything (screen space, hero at W/2,H/2)
function dthOverlay(dt) {
  const c = ctx, t = DTH.t, x = W / 2, y = H / 2, f = DTH.face, h = DTH.hero;
  // the world dims down to the hero
  { const v = .55 * dOut(t / 1.2), g = c.createRadialGradient(x, y, 40, x, y, Math.hypot(W, H) * .6); g.addColorStop(0, 'rgba(10,4,0,' + v * .25 + ')'); g.addColorStop(1, 'rgba(10,4,0,' + v + ')'); c.fillStyle = g; c.fillRect(0, 0, W, H); }

  if (h == 'goku' && t > 1.15 && DTH.head) {   // a halo rises off his head
    const a = dCl((t - 1.15) / .4), hx = x + DTH.head.x, hy = y + DTH.head.y - 14 - 8 * dOut((t - 1.15) / .6) + 2 * Math.sin(t * 4);
    dCue('halo', 1.15, () => dSfx('kkhalo'));
    c.save(); c.globalAlpha = a; LT(); gl('or', hx, hy, 26, .5); NM();
    c.lineWidth = 3.5; c.strokeStyle = '#ffe27a'; c.beginPath(); c.ellipse(hx, hy, 13, 4.2, 0, 0, 7); c.stroke();
    c.lineWidth = 1.2; c.strokeStyle = '#fffbe0'; c.beginPath(); c.ellipse(hx, hy - .8, 13, 4.2, 0, Math.PI, 7); c.stroke(); c.restore();
  }
  if (h == 'vegeta') {
    const ch = dCl((t - .35) / 1.05);
    if (t < 1.42) { LT(); gl('or', x, y, 20 + 70 * ch + 6 * Math.sin(t * 50), .35 + .5 * ch); gl('wh', x, y, 12 + 40 * ch, .3 + .6 * ch); NM(); }
    dCue('blast', 1.4, () => { S.flash = 1; dSfx('boom'); dSfx('bossdie');
      for (let i = 0; i < 40; i++) { const a = Math.random() * 6.283, s = 90 + Math.random() * 260; dPart(0, 0, Math.cos(a) * s, Math.sin(a) * s * .7, .5 + Math.random() * .6, 3 + Math.random() * 4, Math.random() < .5 ? 'rgba(255,230,140,' : 'rgba(255,255,255,', { lit: 1 }); }
      for (let i = 0; i < 14; i++) dPart(dSh(60), dSh(30), dSh(80), -30 - Math.random() * 60, 1 + Math.random() * .8, 10 + Math.random() * 10, 'rgba(120,105,95,', { dust: 1 }); });
    if (t > 1.4) {
      const u = (t - 1.4) / 1.1, R = 40 + 340 * dOut(u);
      c.fillStyle = 'rgba(40,25,15,' + .55 * dOut(u * 3) + ')'; c.beginPath(); c.ellipse(x, y + DTH_FOOT, 46, 15, 0, 0, 7); c.fill();   // crater
      LT(); gl('wh', x, y, 160 * (1 - dCl(u * 1.6)) + 20, Math.max(0, 1 - u * 1.3)); gl('or', x, y, 240 * (1 - dCl(u * 1.2)) + 30, Math.max(0, .8 - u)); NM();
      c.save(); c.globalAlpha = Math.max(0, 1 - u); c.lineWidth = 10 * (1 - u) + 2; c.strokeStyle = '#fff4c0'; c.beginPath(); c.ellipse(x, y + 6, R, R * .62, 0, 0, 7); c.stroke(); c.restore();
    }
  }
  if (h == 'gohan' && DTH.rage > 0) {   // hidden power flares, crackles, then fizzles
    const r = DTH.rage; LT(); gl('pu', x, y - 8, 70 * r + 6 * Math.sin(t * 50), .6 * r); gl('wh', x, y - 10, 30 * r, .4 * r); NM();
    if ((t * 30 | 0) % 2) { c.save(); c.strokeStyle = 'rgba(210,235,255,' + r + ')'; c.lineWidth = 1.6; for (let n = 0; n < 2; n++) { const a = Math.random() * 6.283; let px = x + Math.cos(a) * 14, py = y - 10 + Math.sin(a) * 24; c.beginPath(); c.moveTo(px, py); for (let j = 0; j < 4; j++) { px += Math.cos(a) * 9 + dSh(12); py += Math.sin(a) * 9 + dSh(12); c.lineTo(px, py); } c.stroke(); } c.restore(); }
  }
  if (h == 'kri' && t > 1.1 && DTH.head) {   // seeing stars
    const a = dCl((t - 1.1) / .3), hx = x + DTH.head.x, hy = y + DTH.head.y - 12;
    c.save(); c.globalAlpha = a; for (let i = 0; i < 3; i++) { const an = t * 5 + i * 2.094, sx = hx + Math.cos(an) * 16, sy = hy + Math.sin(an) * 5;
      c.fillStyle = '#ffe27a'; c.strokeStyle = OL; c.lineWidth = 1.2; c.beginPath(); for (let j = 0; j < 10; j++) { const rr = j % 2 ? 2.4 : 6, aa = j * Math.PI / 5 - Math.PI / 2 + t * 3; c.lineTo(sx + Math.cos(aa) * rr, sy + Math.sin(aa) * rr); } c.closePath(); c.fill(); c.stroke(); }
    c.restore();
  }
  if (h == 'trunks' && t > .12) {   // the sword spins out of his hand and sticks in the ground
    const u = dCl((t - .12) / .6), sx = x - f * 10 + f * 74 * u, sy = y - 26 - 50 * Math.sin(Math.PI * u) + 50 * u, ang = u < 1 ? f * u * Math.PI * 3 : f * (Math.PI * 3 + .5);
    dCue('stick', .72, () => { dDust(f * 64, DTH_FOOT + 4, 5); dSfx('hit'); });
    c.save(); c.translate(sx, sy); c.rotate(ang + Math.PI); c.lineCap = 'round';
    c.strokeStyle = OL; c.lineWidth = 5.5; c.beginPath(); c.moveTo(0, -6); c.lineTo(0, 26); c.stroke();
    c.strokeStyle = '#e8f0ff'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 26); c.stroke();
    c.strokeStyle = '#5a3a20'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -9); c.lineTo(0, -2); c.stroke();
    c.strokeStyle = '#c9a23a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-5, -1.5); c.lineTo(5, -1.5); c.stroke();
    c.restore();
    if (t < .5) { LT(); gl('wh', sx, sy, 10, .7); NM(); }
  }
  if (h == 'trunks' && t > 1.45) {   // a shimmer of rings carries him away
    const u = dCl((t - 1.45) / .9); c.save(); for (let i = 0; i < 3; i++) { const v = (u * 1.6 + i * .33) % 1; c.globalAlpha = (1 - v) * (1 - dCl((u - .7) / .3)); c.strokeStyle = '#bfe6ff'; c.lineWidth = 2; c.beginPath(); c.ellipse(x + f * 26, y + DTH_FOOT - 4 - v * 34, 34 - v * 8, 9, 0, 0, 7); c.stroke(); } c.restore();
  }

  // particles
  for (const p of DTH.pt) { p.l -= dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.dust) { p.vx *= .92; p.vy *= .94; p.r += dt * 14; } }
  DTH.pt = DTH.pt.filter(p => p.l > 0);
  for (const p of DTH.pt) { const a = p.l / p.L; if (p.lit) LT(); c.fillStyle = p.c + (p.dust ? .55 * a : a) + ')'; c.beginPath(); c.arc(x + p.x, y + p.y, p.r * (p.dust ? 1 : .6 + .4 * a), 0, 7); c.fill(); if (p.lit) NM(); }

  // K.O.
  if (t > 1.05) {
    const u = dCl((t - 1.05) / .22), s = 1 + 1.4 * (1 - dOut(u)), fs = Math.min(84, W * .17);
    c.save(); c.globalAlpha = u; c.translate(W / 2, H * .3); c.scale(s, s); c.textAlign = 'center'; c.lineJoin = 'round';
    c.font = fs + 'px Impact,Haettenschweiler,"Arial Black",sans-serif'; c.lineWidth = fs * .16; c.strokeStyle = '#3a0804'; c.strokeText('K.O.', 0, 0);
    const g = c.createLinearGradient(0, -fs * .8, 0, 0); g.addColorStop(0, '#ffd0a0'); g.addColorStop(1, '#e8301c'); c.fillStyle = g; c.fillText('K.O.', 0, 0); c.restore();
  }
  // white hit flash fades
  if (S.flash > 0) S.flash -= dt * 2.4;   // the main draw paints it
}

{ dthRaw = gokuSprite; gokuSprite = function (c, x, y, face, t) {
    if (S.mode != 'dying' || !DTH || c !== ctx) return dthRaw(c, x, y, face, t);
    (DTH_POSE[DTH.hero] || DTH_POSE.goku)(c, x, y, DTH.t, DTH.face);
  }; }
{ const _d = draw; draw = function () {
    if (S.mode == 'dying' && DTH) { const now = performance.now(); DTH.dt = Math.min(.05, Math.max(0, (now - DTH.last) / 1000)); DTH.t += DTH.dt; DTH.last = now; }
    _d();
    if (S.mode != 'dying' || !DTH) return;
    ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); dthOverlay(DTH.dt); ctx.restore();
    if (DTH.t >= DTH_T[DTH.hero] + .35) dthFinish();
  }; }
