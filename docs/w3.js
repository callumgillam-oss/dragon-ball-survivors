/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — NEW ATTACKS (EXPANSION_PLAN.md §5.2)
   Galick Gun · Explosive Wave · Tri-Beam · Wolf Fang Fist · Afterimage Strike · Scattering Bullet
   Each: base attack, evolution (with its paired passive) and a Mythic effect.
   ===================================================================== */
'use strict';

const W3 = ['galick', 'wave', 'tri', 'wolf', 'after', 'scatter'];
// per-attack damage multipliers (1 = as designed); tune these with the balance bot
const W3B = { galick: .85, wave: 1, tri: .9, wolf: 1, after: 1, scatter: 1 };

Object.assign(INFO, {
  galick: ['Galick Gun', "Vegeta's beam: charges, then sweeps across the thickest crowd."],
  wave: ['Explosive Wave', 'A shockwave bursts out from you and knocks enemies back.'],
  tri: ['Tri-Beam', 'A triangle of ki on a crowd. Damage ramps up the longer they stay in it.'],
  wolf: ['Wolf Fang Fist', 'Dash-strikes rain on nearby enemies. Short range, rapid hits.'],
  after: ['Afterimage Strike', 'Moving leaves afterimages that explode. Keep moving!'],
  scatter: ['Scattering Bullet', 'An orb rises and bursts into a rain of ki shards.']
});
Object.assign(EVO, {
  galick: ['Final Flash', 'A colossal straight beam that blasts enemies back.', 'arm'],
  wave: ['Super Explosive Wave', 'Twin shockwaves that stun everything they hit.', 'area'],
  tri: ['Neo Tri-Beam', 'Three triangles at once, lasting longer.', 'amt'],
  wolf: ['Neo Wolf Fang Fist', 'Longer combos on more targets, and each combo heals you.', 'sen'],
  after: ['Instant Transmission Strike', 'Afterimages teleport-strike the nearest enemy as they blow.', 'spd'],
  scatter: ['Scattering Barrage', 'Far more shards, and each one pulls XP gems to you.', 'rad']
});
Object.assign(MYTH, {
  galick: 'Mythic: the beam sweeps back again and is 20% wider',
  wave: 'Mythic: a third wave, and waves erase enemy shots',
  tri: 'Mythic: triangles chase the crowd and finish with a burst',
  wolf: 'Mythic: the last hit of each combo stuns, +1 target',
  after: 'Mythic: afterimages explode twice',
  scatter: 'Mythic: shards explode in a chain on impact'
});
for (const k of W3) BASE[k] = INFO[k][0];

/* ---------- state ---------- */
{ const _in = init; init = function () {
    _in();
    for (const k of W3) { if (S.w[k] === undefined) S.w[k] = 0; if (S.cd[k] === undefined) S.cd[k] = 1; }
    Object.assign(S, { gal: [], wav: [], tris: [], wfq: [], wfx: [], aims: [], sca: [], shd: [], aiT: .8 });
  }; }
const arr = k => S[k] || (S[k] = []);   // saved runs from before 3.0 lack these lists

/* ---------- helpers ---------- */
// direction with the most enemies inside a cone (r: reach, w: half-angle)
function denseDir(r, w) {
  const p = S.p, en = S.en.filter(e => !e.dead && onScr(e) && Math.hypot(e.x - p.x, e.y - p.y) < r);
  if (!en.length) return null;
  let best = 0, ba = 0;
  for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; let n = 0;
    for (const e of en) { let d = Math.atan2(e.y - p.y, e.x - p.x) - a; d = Math.atan2(Math.sin(d), Math.cos(d)); if (Math.abs(d) < w) n += e.boss ? 4 : 1; }
    if (n > best) { best = n; ba = a; } }
  return ba;
}
// centre of the densest cluster within reach
function denseSpot(r, R) {
  const p = S.p, en = S.en.filter(e => !e.dead && onScr(e) && Math.hypot(e.x - p.x, e.y - p.y) < r);
  if (!en.length) return null;
  let best = null, bs = -1;
  for (const e of en.slice(0, 40)) { let s = 0; for (const o of en) if (Math.hypot(o.x - e.x, o.y - e.y) < R) s += o.boss ? 5 : 1; if (s > bs) { bs = s; best = e; } }
  return best;
}
const bossCap = (d, e, k) => e.boss ? Math.min(d * k, e.max * .035) : d;
function lineHit(x, y, a, len, w, e) { const c = Math.cos(a), s = Math.sin(a), dx = e.x - x, dy = e.y - y, al = dx * c + dy * s, pp = Math.abs(-dx * s + dy * c); return al > -e.r && al < len + e.r && pp < w / 2 + e.r; }

/* ---------- per-frame ---------- */
function updW3(dt) {
  const p = S.p, W_ = S.w, ev = S.evo;

  // Galick Gun: charge, then a beam that sweeps through the crowd (Final Flash: one colossal straight beam)
  if (W_.galick) { S.cd.galick -= dt; if (S.cd.galick <= 0) { const L = W_.galick, E = ev.galick, M = MY('galick'), a = denseDir(E ? 700 : 520, .5);
    if (a === null) S.cd.galick = .3;
    else { S.cd.galick = (E ? 2.2 : Math.max(2, 3 - .25 * L)) * cm() * (S.hero == 'vegeta' ? .8 : 1); p.atk = p.ad = .5; p.face = Math.cos(a) > 0 ? 1 : -1;
      const arc = E ? 0 : (1.2 + .14 * L) * (M ? 1.15 : 1), extra = PX() >> 1;
      for (let i = 0; i <= extra; i++) { const off = (i - extra / 2) * .5;
        arr('gal').push({ a0: a + off - arc / 2, a1: a + off + arc / 2, ch: .45, t: 0, T: E ? .55 : .45, back: M && !E ? 1 : 0, fin: E ? 1 : 0,
          w: (E ? 62 + 5 * L : 24 + 4 * L) * AR() * (M ? 1.2 : 1), len: E ? 900 : 520, d: (30 + 11 * WL('galick')) * dm() * W3B.galick * (E ? 2.4 : 1), h: new Set() }); }
      sfxPlay('charge'); } } }
  for (const b of arr('gal')) {
    if (b.ch > 0) { b.ch -= dt; if (b.ch <= 0) sfx('boom'); continue; }
    b.t += dt; const k = Math.min(1, b.t / b.T), a = b.a0 + (b.a1 - b.a0) * (b.back == 2 ? 1 - k : k); b.a = a;
    for (const e of S.en) { if (e.dead || b.h.has(e) || !onScr(e)) continue;
      if (lineHit(p.x, p.y, a, b.len, b.w, e)) { b.h.add(e); hitE(e, b.fin ? bossCap(b.d, e, .5) : bossCap(b.d, e, .8)); if (b.fin) shove(e, p.x, p.y, 40); } }
    if (k >= 1) { if (b.back == 1) { b.back = 2; b.t = 0; b.h = new Set(); } else b.done = 1; }
  }
  S.gal = arr('gal').filter(b => !b.done);

  // Explosive Wave: expanding shockwave from you with knockback (evolved: twin waves that stun)
  if (W_.wave) { S.cd.wave -= dt; if (S.cd.wave <= 0) { const L = W_.wave, E = ev.wave, M = MY('wave');
    if (!near(1, 260).length) S.cd.wave = .3;
    else { S.cd.wave = (E ? 2.2 : Math.max(2.6, 4.2 - .3 * L)) * cm(); p.atk = p.ad = .35;
      const R = (110 + 12 * WL('wave')) * AR() * (E ? 1.25 : 1), d = (14 + 6 * WL('wave')) * dm() * W3B.wave * (E ? 1.5 : 1), n = (E ? 2 : 1) + (M ? 1 : 0);
      for (let i = 0; i < n; i++) arr('wav').push({ x: p.x, y: p.y, R: R * (1 + i * .18), d, dl: i * .22, t: 0, T: .45, h: new Set(), st: E ? .8 : 0, kb: E ? 80 : 60, clr: M });
      sfx('boom'); } } }
  for (const w of arr('wav')) {
    if (w.dl > 0) { w.dl -= dt; if (w.dl <= 0) { w.x = p.x; w.y = p.y; } continue; }
    w.t += dt; const k = Math.min(1, w.t / w.T), r = w.R * (1 - Math.pow(1 - k, 2)); w.r = r;
    for (const e of S.en) { if (e.dead || w.h.has(e)) continue; const dd = Math.hypot(e.x - w.x, e.y - w.y);
      if (dd < r + e.r && dd > r - 30 - e.r) { w.h.add(e); hitE(e, w.d); shove(e, w.x, w.y, w.kb); if (w.st && !e.boss) e.st = Math.max(e.st || 0, w.st); } }
    if (w.clr) for (const q of S.eb) if (Math.abs(Math.hypot(q.x - w.x, q.y - w.y) - r) < 20) q.l = 0;
    if (k >= 1) w.done = 1;
  }
  S.wav = arr('wav').filter(w => !w.done);

  // Tri-Beam: a triangle zone on the crowd; each tick hits harder than the last
  if (W_.tri) { S.cd.tri -= dt; if (S.cd.tri <= 0) { const L = W_.tri, E = ev.tri, M = MY('tri'), c = denseSpot(420, 90);
    if (!c) S.cd.tri = .3;
    else { S.cd.tri = (E ? 2.4 : Math.max(2, 3 - .2 * L)) * cm(); p.atk = p.ad = .4; p.face = c.x > p.x ? 1 : -1;
      const n = (E ? 3 : 1) + (PX() >> 1), s = (70 + 8 * WL('tri')) * AR(), d = (3 + 1.2 * WL('tri')) * dm() * W3B.tri;
      const spots = [c]; if (n > 1) { const others = S.en.filter(e => !e.dead && onScr(e) && Math.hypot(e.x - c.x, e.y - c.y) > s * 1.2).sort(() => Math.random() - .5); spots.push(...others.slice(0, n - 1)); }
      for (const q of spots) arr('tris').push({ x: q.x, y: q.y, s, d, t: 0, T: E ? 2.2 : 1.6, k: 0, n: 0, rot: Math.random() * 2, fol: M ? q : null, burst: M });
      sfx('charge'); } } }
  for (const z of arr('tris')) {
    z.t += dt; z.k -= dt; z.rot += dt * .8;
    if (z.fol && !z.fol.dead) { z.x += (z.fol.x - z.x) * Math.min(1, dt * 2); z.y += (z.fol.y - z.y) * Math.min(1, dt * 2); }
    if (z.k <= 0) { z.k = .2; const m = 1 + .15 * z.n++;
      for (const e of S.en) if (!e.dead && Math.hypot(e.x - z.x, e.y - z.y) < z.s * .62 + e.r) hitE(e, bossCap(z.d * m, e, .9)); }
    if (z.t >= z.T) { z.done = 1; if (z.burst) { for (const e of S.en) if (!e.dead && Math.hypot(e.x - z.x, e.y - z.y) < z.s + e.r) hitE(e, z.d * 6); boom(z.x, z.y, z.s, '#ffe27a'); } }
  }
  S.tris = arr('tris').filter(z => !z.done);

  // Wolf Fang Fist: rapid afterimage strikes on the closest enemies
  if (W_.wolf) { S.cd.wolf -= dt; if (S.cd.wolf <= 0) { const L = W_.wolf, E = ev.wolf, M = MY('wolf'), n = 3 + L + PX() + (E ? 2 : 0) + (M ? 1 : 0), ts = near(n, (210 + 6 * L) * AR2());
    if (!ts.length) S.cd.wolf = .2;
    else { S.cd.wolf = (E ? 1 : Math.max(1.1, 2 - .18 * L)) * cm(); p.atk = p.ad = .3; p.face = ts[0].x > p.x ? 1 : -1;
      const d = (12 + 5 * WL('wolf')) * dm() * W3B.wolf, hits = E ? 6 : 4;
      ts.forEach((e, i) => arr('wfq').push({ e, n: hits, t: i * .05, d, st: M, heal: E })); } } }
  for (const q of arr('wfq')) {
    q.t -= dt; if (q.t > 0) continue;
    if (q.e.dead || q.n <= 0) { q.done = 1; continue; }
    q.t = .07; q.n--; hitE(q.e, q.d); shove(q.e, p.x, p.y, 6);
    if (S.fx.length < 150) arr('wfx').push({ x: q.e.x, y: q.e.y, a: Math.random() * 6.283, l: .18 });
    if (q.n == 0) { if (q.st && !q.e.boss) q.e.st = Math.max(q.e.st || 0, .6); if (q.heal) p.hp = Math.min(p.max, p.hp + 1); sfx('hit'); }
  }
  S.wfq = arr('wfq').filter(q => !q.done);
  for (const f of arr('wfx')) f.l -= dt; S.wfx = arr('wfx').filter(f => f.l > 0);

  // Afterimage Strike: moving drops afterimages that explode a moment later
  if (W_.after) { const L = W_.after, E = ev.after, M = MY('after'), mov = (p.mag || 0) > .2;
    S.aiT = (S.aiT ?? .8) - dt * (mov ? 1 : .4);
    if (S.aiT <= 0) { S.aiT = (E ? .35 : Math.max(.5, .9 - .06 * L)) * cm();
      arr('aims').push({ x: p.x, y: p.y, f: p.face || 1, t: 1, R: (46 + 5 * WL('after')) * AR2(), d: (16 + 6 * WL('after')) * dm() * W3B.after, ev: E, n: M ? 2 : 1 }); } }
  for (const a of arr('aims')) {
    a.t -= dt; if (a.t > 0) continue;
    for (const e of S.en) if (!e.dead && onScr(e) && Math.hypot(e.x - a.x, e.y - a.y) < a.R + e.r) hitE(e, a.d);
    pop(a.x, a.y, a.R, '#bfe6ff'); impact(a.x, a.y, a.R, 'cy', .3);
    if (a.ev) { let b = null, bd = 260; for (const e of S.en) { if (e.dead || !onScr(e)) continue; const d = Math.hypot(e.x - a.x, e.y - a.y); if (d < bd) { bd = d; b = e; } }
      if (b) { hitE(b, a.d); arr('wfx').push({ x: b.x, y: b.y, a: Math.atan2(b.y - a.y, b.x - a.x), l: .25, tp: [a.x, a.y] }); } }
    if (--a.n > 0) a.t = .3; else a.done = 1;
  }
  S.aims = arr('aims').filter(a => !a.done);

  // Scattering Bullet: an orb rises, then bursts into shards that rain on enemies
  if (W_.scatter) { S.cd.scatter -= dt; if (S.cd.scatter <= 0) { const L = W_.scatter, E = ev.scatter, M = MY('scatter');
    if (!near(1, 380).length) S.cd.scatter = .3;
    else { S.cd.scatter = (E ? 2 : Math.max(2.4, 3.6 - .25 * L)) * cm(); p.atk = p.ad = .4;
      arr('sca').push({ x: p.x, y: p.y, t: .45, n: Math.round((8 + 2 * L + PX() * 2) * (E ? 1.6 : 1)), d: (8 + 3 * WL('scatter')) * dm() * W3B.scatter, R: 22 * AR2() * (M ? 1.3 : 1), ev: E, ch: M });
      sfxPlay('charge'); } } }
  for (const o of arr('sca')) {
    o.t -= dt; if (o.t > 0) continue; o.done = 1;
    const ox = o.x, oy = o.y - 70, ts = S.en.filter(e => !e.dead && onScr(e) && Math.hypot(e.x - o.x, e.y - o.y) < 380);
    for (let i = 0; i < o.n; i++) { const e = ts.length ? ts[(Math.random() * ts.length) | 0] : null, a = Math.random() * 6.283, r = 60 + Math.random() * 200;
      arr('shd').push({ x0: ox, y0: oy, tx: e ? e.x + (Math.random() - .5) * 20 : o.x + Math.cos(a) * r, ty: e ? e.y + (Math.random() - .5) * 20 : o.y + Math.sin(a) * r, t: 0, T: .3 + Math.random() * .25, d: o.d, R: o.R, ev: o.ev, ch: o.ch }); }
    sfx('boom');
  }
  S.sca = arr('sca').filter(o => !o.done);
  for (const s of arr('shd')) {
    s.t += dt; if (s.t < s.T) continue; s.done = 1;
    for (const e of S.en) if (!e.dead && Math.hypot(e.x - s.tx, e.y - s.ty) < s.R + e.r) hitE(e, s.d);
    if (s.ch) splash(s.tx, s.ty, s.R * 1.8, s.d * .4);
    if (s.ev) for (const g of S.gem) if (Math.hypot(g.x - s.tx, g.y - s.ty) < 80) { g.x = p.x; g.y = p.y; }
    if (S.fx.length < 150) S.fx.push({ ring: 1, x: s.tx, y: s.ty, r: s.R, l: .2, T: .2, c: '#ffe9a0' });
  }
  S.shd = arr('shd').filter(s => !s.done);
}

/* ---------- drawing (world space; cx,cy = camera) ---------- */
function drawW3(cx, cy, t) {
  const p = S.p, px = p.x - cx, py = p.y - cy;
  ctx.lineCap = 'round';
  // Galick Gun / Final Flash
  for (const b of arr('gal')) {
    if (b.ch > 0) { const k = 1 - b.ch / .45; LT(); gl(b.fin ? 'or' : 'pu', px, py, 18 + 26 * k, .5 + .4 * k); gl('wh', px, py, 8 + 10 * k, .7 * k); NM(); continue; }
    const a = b.a ?? b.a0, ex = px + Math.cos(a) * b.len, ey = py + Math.sin(a) * b.len, fade = Math.min(1, (b.T - b.t) / .15 + .3), C = b.fin ? ['255,210,90', '255,250,220'] : ['170,80,255', '240,220,255'];
    ctx.strokeStyle = 'rgba(' + C[0] + ',' + .35 * fade + ')'; ctx.lineWidth = b.w * 1.5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.strokeStyle = 'rgba(' + C[0] + ',' + .8 * fade + ')'; ctx.lineWidth = b.w; ctx.stroke();
    ctx.strokeStyle = 'rgba(' + C[1] + ',' + fade + ')'; ctx.lineWidth = b.w * .4; ctx.stroke();
    LT(); gl(b.fin ? 'or' : 'pu', px, py, b.w * 1.3, .8 * fade); gl('wh', px, py, b.w * .6, fade); NM();
  }
  // Explosive Wave
  for (const w of arr('wav')) { if (w.dl > 0 || !w.r) continue; const k = w.t / w.T, x = w.x - cx, y = w.y - cy;
    const g = ctx.createRadialGradient(x, y, Math.max(0, w.r - 34), x, y, w.r + 4); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(.7, 'rgba(255,220,150,' + (.35 * (1 - k)) + ')'); g.addColorStop(1, 'rgba(255,255,255,' + (.8 * (1 - k)) + ')');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, w.r + 4, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,250,230,' + (1 - k) + ')'; ctx.lineWidth = 3 * (1 - k) + 1; ctx.beginPath(); ctx.arc(x, y, w.r, 0, 7); ctx.stroke(); }
  // Tri-Beam
  for (const z of arr('tris')) { const x = z.x - cx, y = z.y - cy, k = z.t / z.T, pulse = .5 + .5 * Math.sin(t * 18), heat = Math.min(1, z.n / 8);
    ctx.beginPath(); for (let i = 0; i < 3; i++) { const a = z.rot + i * 2.094 - 1.5708; i ? ctx.lineTo(x + Math.cos(a) * z.s, y + Math.sin(a) * z.s) : ctx.moveTo(x + Math.cos(a) * z.s, y + Math.sin(a) * z.s); } ctx.closePath();
    ctx.fillStyle = 'rgba(255,' + Math.round(230 - 90 * heat) + ',90,' + (.12 + .14 * heat) * (1 - k * .5) + ')'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,250,200,' + (.6 + .4 * pulse) * (1 - k * .4) + ')'; ctx.lineWidth = 3 + 3 * heat; ctx.stroke();
    LT(); gl('or', x, y, z.s * .5, .25 + .35 * heat); NM(); }
  // Wolf Fang Fist slashes + Instant Transmission streaks
  for (const f of arr('wfx')) { const x = f.x - cx, y = f.y - cy, k = f.l / (f.tp ? .25 : .18);
    if (f.tp) { ctx.strokeStyle = 'rgba(160,220,255,' + k + ')'; ctx.lineWidth = 5 * k; ctx.beginPath(); ctx.moveTo(f.tp[0] - cx, f.tp[1] - cy); ctx.lineTo(x, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,190,90,' + k + ')'; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = -1; i <= 1; i++) { const o = i * 5, c = Math.cos(f.a), s = Math.sin(f.a); ctx.moveTo(x - c * 14 - s * o, y - s * 14 + c * o); ctx.lineTo(x + c * 14 - s * o, y + s * 14 + c * o); } ctx.stroke(); }
  // Afterimages: translucent copies of the hero
  for (const a of arr('aims')) { const x = a.x - cx, y = a.y - cy, k = Math.max(0, a.t);
    ctx.save(); ctx.translate(x, y); ctx.scale(a.f < 0 ? -1 : 1, 1); ctx.globalAlpha = .25 + .3 * k;
    ctx.drawImage(SHEET(), 0, 2 * HC, HC, HC, -HOX / HC * HD, HDY, HD, HD); ctx.restore();
    ctx.strokeStyle = 'rgba(170,220,255,' + (.25 + .5 * (1 - k)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, a.R * (1 - k * .5), 0, 7); ctx.stroke(); }
  // Scattering Bullet
  LT();
  for (const o of arr('sca')) { const k = 1 - o.t / .45, x = o.x - cx, y = o.y - cy - 70 * k; gl('or', x, y, 16 + 10 * k, .9); gl('wh', x, y, 7 + 4 * k, 1); }
  for (const s of arr('shd')) { const k = s.t / s.T, x = s.x0 + (s.tx - s.x0) * k - cx, y = s.y0 + (s.ty - s.y0) * k - cy - Math.sin(k * 3.1416) * 50; gl('or', x, y, 8, .9); gl('wh', x, y, 3.5, 1); }
  NM();
}
{ const _u = updNew; updNew = function (dt) { _u(dt); updW3(dt); }; }
{ const _d = drawNew; drawNew = function (cx, cy, t) { _d(cx, cy, t); drawW3(cx, cy, t); }; }

/* ---------- icons ---------- */
function drawIcon3(c, k) {
  c.save(); c.lineWidth = 2; c.strokeStyle = OL; c.lineJoin = 'round'; c.lineCap = 'round';
  const g = (x, y, r, a, b) => { const q = c.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, a); q.addColorStop(1, b); return q; },
    ci = (x, y, r, f) => { c.fillStyle = f; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke(); };
  if (k == 'galick') { ci(12, 34, 8, g(12, 34, 8, '#fff', '#a050ff')); poly(c, [[14, 28], [44, 6], [46, 14], [18, 40]], g(14, 34, 40, '#f0d8ff', '#8a2ae0')); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(17, 33); c.lineTo(44, 11); c.stroke(); }
  else if (k == 'wave') { ci(24, 24, 6, '#fff'); c.lineWidth = 3; for (const [r, a] of [[12, .9], [18, .6], [22, .35]]) { c.strokeStyle = 'rgba(255,220,140,' + a + ')'; c.beginPath(); c.arc(24, 24, r, 0, 7); c.stroke(); } c.strokeStyle = OL; c.lineWidth = 1; c.beginPath(); c.arc(24, 24, 22.5, 0, 7); c.stroke(); }
  else if (k == 'tri') { poly(c, [[24, 4], [44, 40], [4, 40]], g(24, 28, 26, '#fff6c8', '#ff9a2a')); c.fillStyle = '#7a2a0a'; c.beginPath(); c.moveTo(24, 16); c.lineTo(34, 34); c.lineTo(14, 34); c.closePath(); c.fill(); }
  else if (k == 'wolf') { ci(24, 26, 15, g(24, 26, 15, '#ffd9a0', '#c8601a')); c.strokeStyle = '#fff'; c.lineWidth = 3; for (const o of [-6, 0, 6]) { c.beginPath(); c.moveTo(14 + o, 10); c.lineTo(32 + o, 40); c.stroke(); } }
  else if (k == 'after') { for (const [x, a] of [[12, .3], [20, .55], [30, 1]]) { c.globalAlpha = a; ci(x, 16, 7, '#9ad8ff'); poly(c, [[x - 7, 24], [x + 7, 24], [x + 6, 42], [x - 6, 42]], '#5aa8e8'); } c.globalAlpha = 1; }
  else if (k == 'scatter') { ci(24, 14, 9, g(24, 14, 9, '#fff', '#ffb02a')); c.fillStyle = '#ffd06a'; for (const [x, y] of [[8, 30], [16, 40], [26, 34], [36, 42], [42, 28]]) { c.beginPath(); c.arc(x, y, 3.5, 0, 7); c.fill(); c.stroke(); } }
  c.restore();
}
{ const _i = icn; icn = function (k) {
    if (!W3.includes(k)) return _i(k);
    if (!ICN[k]) { const c = mk(96, 96), x = c.getContext('2d'); x.scale(2, 2); drawIcon3(x, k); ICN[k] = c; }
    return ICN[k]; }; }
