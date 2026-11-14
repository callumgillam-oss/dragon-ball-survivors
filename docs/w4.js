/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — LEVEL 3 ATTACKS (EXPANSION_PLAN.md §8)
   Passive: Infinite Energy · Attacks: Shining Sword Attack, Android Barrier
   ===================================================================== */
'use strict';

const W4 = ['sword', 'barrier'];
const W4B = { sword: 1, barrier: 1 };   // per-attack damage multipliers for balancing
// Android Barrier: charge to fill, max hold time, rim drain (base dmg, seconds between ticks), burst (base dmg, reach × dome radius, evolved ×), downtime (base, min, evolved)
const BAR = { cap: 30, hold: 2, tick: 4, tickT: .3, dmg: 18, reach: 2.3, evo: 1.5, dn: 2.6, dnMin: 2, dnE: 1.6 };

Object.assign(INFO, {
  sword: ['Shining Sword Attack', 'Fast sword slashes in front of you, finished with a ki blast.'],
  barrier: ['Android Barrier', 'A dome that holds enemies back and drains them, then detonates. The more it absorbs, the bigger the blast.'],
  inf: ['Infinite Energy', 'Android power: +6% damage and +12% Ki Burst charge. At max level your Ki Burst refills by itself.']
});
Object.assign(EVO, {
  sword: ['Burning Sword Rush', 'Five slashes, then a Burning Attack fireball.', 'inf'],
  barrier: ['Perfect Barrier', 'Bigger blasts, reforms faster, and fires every blocked shot back at enemies.', 'inf']
});
Object.assign(MYTH, {
  sword: 'Mythic: slashes reach 40% farther and the finisher stuns',
  barrier: 'Mythic: every blast heals you 4 HP'
});
for (const k of W4) BASE[k] = INFO[k][0];
PCAP.inf = 6;
{ const _bt = bonusText; bonusText = function (g, k, r) { if (g == 'ps' && k == 'inf') return `+${Math.round(6 * RAR[r].m)}% damage, +${Math.round(12 * RAR[r].m)}% Ki Burst charge`; return _bt(g, k, r); }; }
COL_W.push('sword', 'barrier'); COL_P.push('inf');

/* ---------- state ---------- */
{ const _in = init; init = function () {
    _in();
    for (const k of W4) { if (S.w[k] === undefined) S.w[k] = 0; if (S.cd[k] === undefined) S.cd[k] = 1; }
    if (S.ps.inf === undefined) { S.ps.inf = 0; S.pe.inf = 0; }
    Object.assign(S, { sws: [], swf: [], bar: { r: 0, pulse: 0, blk: 0 } });
  }; }

/* ---------- Infinite Energy ---------- */
const INF = () => (S.pe && S.pe.inf) || 0;
{ const _h = hitE; hitE = function (e, d) { const n = INF(); return _h(e, n ? d * (1 + .06 * n) : d); }; }
{ const _a = addUlt; addUlt = function (e) { const u0 = S.ult || 0; _a(e); const n = INF(); if (n) S.ult = Math.min(100, u0 + (S.ult - u0) * (1 + .12 * n)); }; }
{ const _u = update; update = function (dt) { const r = _u(dt); if (S.mode == 'play' && S.ps && S.ps.inf >= 5 && RU('kiburst')) S.ult = Math.min(100, (S.ult || 0) + 1.25 * dt); return r; }; }

/* ---------- per-frame ---------- */
function updW4(dt) {
  const p = S.p, W_ = S.w, ev = S.evo;
  // Shining Sword Attack: a quick flurry of slashes toward the nearest enemy, then a ki blast
  if (W_.sword) { DSRC = 'sword'; S.cd.sword -= dt; if (S.cd.sword <= 0) { const L = W_.sword, E = ev.sword, M = MY('sword'), R = (78 + 6 * L) * AR() * (M ? 1.4 : 1), ts = aimT('sword', near(1, R * 2.2), R * 2.2);
    if (!ts.length) S.cd.sword = .2;
    else { S.cd.sword = (E ? 1 : Math.max(1.05, 1.7 - .12 * L)) * cm() * (S.hero == 'trunks' ? .85 : 1);
      const a = Math.atan2(ts[0].y - p.y, ts[0].x - p.x), d = (10 + 4.5 * WL('sword')) * dm() * W4B.sword, n = (E ? 5 : 3) + (PX() >> 1);
      p.atk = p.ad = .35; p.face = Math.cos(a) > 0 ? 1 : -1;
      for (let i = 0; i < n; i++) arr('sws').push({ a: a + (i % 2 ? .35 : -.35) * (i ? 1 : 0), R, d, t: i * .07, T: .16, h: null });
      arr('sws').push({ fin: 1, a, R, d: d * (E ? 3 : 1.6), t: n * .07 + .05, T: .3, E, st: M }); sfx('slash'); } } }
  for (const s of arr('sws')) { DSRC = 'sword';
    if (s.t > 0) { s.t -= dt; continue; }
    if (!s.h) { s.h = 1; s.x = p.x; s.y = p.y;
      if (s.fin) { const bx = p.x + Math.cos(s.a) * s.R * .9, by = p.y + Math.sin(s.a) * s.R * .9, BR = (s.E ? 95 : 55) * AR2();
        s.x = bx; s.y = by; s.BR = BR;
        for (const e of S.en) if (!e.dead && Math.hypot(e.x - bx, e.y - by) < BR + e.r) { hitE(e, s.d); if (s.E) shove(e, bx, by, 50); if (s.st && !e.boss) e.st = Math.max(e.st || 0, .8); }
        boom(bx, by, BR, s.E ? '#ffb040' : '#ffe27a'); }
      else for (const e of S.en) { if (e.dead) continue; const dx = e.x - p.x, dy = e.y - p.y, dd = Math.hypot(dx, dy); if (dd > s.R + e.r) continue;
        let da = Math.atan2(dy, dx) - s.a; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < 1) hitE(e, s.d); } }
    s.T -= dt; if (s.T <= 0) s.done = 1;
  }
  S.sws = arr('sws').filter(s => !s.done);
  // Android Barrier (reworked 2026-11-13): ABSORB, then RELEASE.
  // While up, the dome holds ordinary enemies back at its rim and drains them; every enemy pressing on it and every
  // shot it blocks charges it. When it is full (or after BAR.hold seconds) it detonates in a shockwave that hits harder
  // the more it absorbed, then reforms after a short gap. The more you are swarmed, the bigger and more frequent the
  // blasts, and the less time it spends holding the crowd back (so it can't make you untouchable).
  const B = S.bar || (S.bar = { r: 0, pulse: 0, blk: 0 });
  if (W_.barrier) { DSRC = 'barrier'; const L = W_.barrier, E = ev.barrier, M = MY('barrier'), R = (70 + 6 * L) * AR2(), cap = BAR.cap;
    if (B.up === undefined) { B.up = 1; B.en = 0; B.ht = 0; B.dn = 0; B.dnT = 1; }
    B.r = R; B.pulse = Math.max(0, B.pulse - dt); if (B.boom) { B.boom.t -= dt; if (B.boom.t <= 0) B.boom = null; }
    if (!B.up) { B.dn -= dt; if (B.dn <= 0) { B.up = 1; B.en = 0; B.ht = 0; } }
    else {
      B.ht += dt; const tick = (BAR.tick + 1.5 * WL('barrier')) * dm() * W4B.barrier;
      for (const e of S.en) { if (e.dead || e.boss || e.line) continue; const dx = e.x - p.x, dy = e.y - p.y, dd = Math.hypot(dx, dy) || 1, rr = R + e.r;
        if (dd < rr) { e.x = p.x + dx / dd * rr; e.y = p.y + dy / dd * rr;   // held at the rim
          if (S.t >= (e.bt7 || 0)) { e.bt7 = S.t + BAR.tickT; hitE(e, tick); B.en += 1; } } }
      for (const q of S.eb) { if (q.l <= 0 || Math.hypot(q.x - p.x, q.y - p.y) > R) continue; q.l = 0; B.en += 2;
        if (E) { let tg = null, bd = 360; for (const e of S.en) { if (e.dead) continue; const dd = Math.hypot(e.x - q.x, e.y - q.y); if (dd < bd) { bd = dd; tg = e; } }
          if (tg) { hitE(tg, (8 + 4 * WL('barrier')) * dm() * .8); arr('swf').push({ x0: q.x, y0: q.y, x1: tg.x, y1: tg.y, l: .2 }); } }
        else arr('swf').push({ x0: q.x, y0: q.y, l: .2 }); }
      if (B.en >= cap || B.ht >= BAR.hold) {   // RELEASE
        const fill = Math.min(1, B.en / cap), BR = R * BAR.reach, d = (BAR.dmg + 6 * WL('barrier')) * dm() * W4B.barrier * (E ? BAR.evo : 1) * (.5 + fill);
        for (const e of S.en) if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < BR + e.r) { hitE(e, bossCap(d, e, .6)); shove(e, p.x, p.y, 60 + 50 * fill); }
        B.boom = { t: .5, T: .5, R0: R, R1: BR, f: fill }; B.pulse = .35; kick && kick(4 + 6 * fill);
        if (M) p.hp = Math.min(p.max, p.hp + 4);
        B.up = 0; B.dnT = B.dn = (E ? BAR.dnE : Math.max(BAR.dnMin, BAR.dn - .1 * L)) * cm(); B.en = 0; B.ht = 0; }
    }
  } else { B.r = 0; B.up = undefined; B.boom = null; }
  for (const f of arr('swf')) f.l -= dt; S.swf = arr('swf').filter(f => f.l > 0);
}

/* ---------- drawing ---------- */
function drawW4(cx, cy, t) {
  const p = S.p, px = p.x - cx, py = p.y - cy, B = S.bar;
  if (B && B.r) { const k = B.pulse / .35, R = B.r * (1 + .35 * k), E = S.evo.barrier;
    const g = ctx.createRadialGradient(px, py, R * .55, px, py, R); g.addColorStop(0, 'rgba(140,200,255,0)'); g.addColorStop(.85, `rgba(${E ? '255,220,140' : '140,200,255'},${.12 + .25 * k})`); g.addColorStop(1, `rgba(${E ? '255,240,200' : '200,235,255'},${.35 + .4 * k})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, R, 0, 7); ctx.fill();
    ctx.strokeStyle = `rgba(${E ? '255,236,180' : '210,240,255'},${.45 + .4 * k})`; ctx.lineWidth = 1.5 + 2 * k; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + t * .4; ctx.moveTo(px + Math.cos(a) * R, py + Math.sin(a) * R); ctx.lineTo(px + Math.cos(a + 1.047) * R, py + Math.sin(a + 1.047) * R); } ctx.stroke(); }
  for (const f of arr('swf')) { const k = f.l / .2; LT(); gl('cy', f.x0 - cx, f.y0 - cy, 12, k); NM();
    if (f.x1 !== undefined) { ctx.strokeStyle = `rgba(255,230,150,${k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(f.x0 - cx, f.y0 - cy); ctx.lineTo(f.x1 - cx, f.y1 - cy); ctx.stroke(); } }
  for (const s of arr('sws')) { DSRC = 'sword'; if (s.t > 0 || !s.h) continue;
    if (s.fin) { const k = s.T / .3; LT(); gl(s.E ? 'or' : 'cy', s.x - cx, s.y - cy, s.BR * (1.3 - .3 * k), .7 * k); NM(); continue; }
    const k = s.T / .16, x = s.x - cx, y = s.y - cy;
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(150,220,255,${.35 * k})`; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(x, y, s.R * .85, s.a - 1, s.a + 1); ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${.9 * k})`; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(x, y, s.R * .85, s.a - 1 + (1 - k) * .4, s.a + 1 - (1 - k) * .4); ctx.stroke();
    ctx.restore(); }
}
{ const _u = updNew; updNew = function (dt) { _u(dt); updW4(dt); }; }
{ const _d = drawNew; drawNew = function (cx, cy, t) { drawW4(cx, cy, t); _d(cx, cy, t); }; }

/* ---------- icons ---------- */
function drawIcon4(c, k) {
  c.save(); c.lineWidth = 2; c.strokeStyle = OL; c.lineJoin = 'round'; c.lineCap = 'round';
  const g = (x, y, r, a, b) => { const q = c.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, a); q.addColorStop(1, b); return q; };
  if (k == 'sword') { c.strokeStyle = 'rgba(150,220,255,.9)'; c.lineWidth = 4; c.beginPath(); c.arc(24, 30, 18, -2.6, -.6); c.stroke(); c.strokeStyle = OL; c.lineWidth = 2;
    poly(c, [[10, 40], [36, 8], [40, 10], [14, 42]], g(25, 25, 22, '#ffffff', '#9ab8d8')); poly(c, [[8, 36], [18, 44], [16, 46], [6, 38]], '#5a3a20'); poly(c, [[5, 42], [10, 47], [7, 48], [3, 44]], '#e8c040'); }
  else if (k == 'barrier') { c.fillStyle = g(24, 26, 20, 'rgba(220,240,255,.9)', 'rgba(90,160,255,.7)'); c.beginPath(); c.arc(24, 26, 19, 0, 7); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.6; c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; c.moveTo(24 + Math.cos(a) * 18, 26 + Math.sin(a) * 18); c.lineTo(24 + Math.cos(a + 1.047) * 18, 26 + Math.sin(a + 1.047) * 18); } c.stroke();
    c.fillStyle = '#d83030'; c.beginPath(); c.arc(24, 26, 5, 0, 7); c.fill(); c.strokeStyle = OL; c.stroke(); }
  else if (k == 'inf') { c.strokeStyle = OL; c.lineWidth = 7; c.beginPath(); c.moveTo(24, 24); c.bezierCurveTo(34, 10, 46, 24, 34, 34); c.bezierCurveTo(28, 38, 24, 28, 24, 24); c.bezierCurveTo(14, 10, 2, 24, 14, 34); c.bezierCurveTo(20, 38, 24, 28, 24, 24); c.stroke();
    c.strokeStyle = '#5ae0ff'; c.lineWidth = 4; c.stroke(); c.fillStyle = '#d83030'; c.beginPath(); c.arc(24, 42, 4, 0, 7); c.fill(); c.lineWidth = 1.5; c.strokeStyle = OL; c.stroke(); }
  c.restore();
}
{ const _i = icn; icn = function (k) {
    if (!W4.includes(k) && k != 'inf') return _i(k);
    if (!ICN[k]) { const c = mk(96, 96), x = c.getContext('2d'); x.scale(2, 2); drawIcon4(x, k); ICN[k] = c; }
    return ICN[k]; }; }
