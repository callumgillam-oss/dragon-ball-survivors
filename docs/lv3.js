/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — LEVEL 3: ANDROID & CELL SAGA (EXPANSION_PLAN.md §8)
   Ruined city · Red Ribbon drones, bio-larvae, Cell Juniors ·
   Android 19, Dr. Gero, Androids 17 & 18, Android 16, Cell (Imperfect → Semi-Perfect → Perfect)
   with the Cell Games ring and his self-destruct countdown.
   ===================================================================== */
'use strict';

/* ---------- enemies + bosses ---------- */
Object.assign(TYPES, {
  dr: { n: 'Battle Drone', hp: 20, spd: 66, r: 12, xp: 2 },
  drg: { n: 'Gunner Drone', hp: 18, spd: 58, r: 12, xp: 3 },
  lv: { n: 'Bio-Larva', hp: 7, spd: 88, r: 9, xp: 1 },
  a19: { n: 'Android 19', hp: 3200, spd: 70, r: 26, boss: 1, xp: 80 },
  a20: { n: 'Dr. Gero', hp: 2800, spd: 82, r: 22, boss: 1, xp: 80 },
  a17: { n: 'Android 17', hp: 2600, spd: 108, r: 20, boss: 1, xp: 70 },
  a18: { n: 'Android 18', hp: 2400, spd: 112, r: 19, boss: 1, xp: 70 },
  a16: { n: 'Android 16', hp: 6400, spd: 52, r: 32, boss: 1, xp: 120 },
  ce1: { n: 'Imperfect Cell', hp: 7000, spd: 78, r: 26, boss: 1, xp: 120 },
  ce2: { n: 'Semi-Perfect Cell', hp: 12000, spd: 72, r: 31, boss: 1, xp: 150 },
  ce3: { n: 'Perfect Cell', hp: 20000, spd: 110, r: 24, boss: 1, xp: 250 }
});
const L3BOSS = { a19: 2.0, a20: 1.9, a17: 2.0, a18: 1.9, a16: 1.55, ce1: 1.7, ce2: 1.45, ce3: 1.9 };
{ const _b = DIFF.boss; DIFF.boss = k => L3BOSS[k] ? L3BOSS[k] * (.6 + .4 * DF[DLV]) : _b(k); }
// Level 3 mobs are tougher than Namek's (players arrive with a stronger shop)
const L3HP = 1.05, L3THIN = .3;   // mob HP multiplier; share of regular spawns skipped (the city is less crowded than the Wasteland)
{ const _h = DIFF.hp; DIFF.hp = t => _h(t) * (S.stage == 3 ? L3HP * (.7 + .3 * Math.min(1, t / 240)) : 1); }   // gentler first four minutes

STAGES[3] = { open: 'THE ANDROIDS HAVE ARRIVED!', final: 'ce3', win: 'Cell is defeated. The Earth is safe, thanks to you!',
  sched: [[60, 'swarm', 'DRONE SQUADRON!'], [90, 'a19', 'ANDROID 19!'], [180, 'a20', 'DR. GERO!'], [225, 'swarm', 'THE LARVAE ARE HATCHING!'],
    [270, 'a17', 'ANDROIDS 17 AND 18!'], [270, 'a18', ''], [360, 'a16', 'ANDROID 16!'], [400, 'swarm', 'A WALL OF LARVAE!'], [450, 'ce1', 'CELL!']] };
INTRO_T[2] = 4.4;
Object.assign(BOSSCARD, {
  a19: ['ANDROID 19', 'Red Ribbon energy absorber'], a20: ['DR. GERO', 'Android 20, creator of the androids'],
  a17: ['ANDROIDS 17 & 18', 'The real androids'], a16: ['ANDROID 16', 'The gentle giant'],
  ce1: ['CELL', 'Imperfect form'], ce2: ['CELL', 'Semi-Perfect form'], ce3: ['PERFECT CELL', 'The ultimate android']
});
Object.assign(BAURA, { a19: '200,200,230', a20: '255,120,90', a17: '120,200,255', a18: '150,190,255', a16: '255,140,60', ce1: '120,230,90', ce2: '150,230,90', ce3: '200,255,120' });

// Level 1/2 mob kinds that older code still asks for (swarms, walls, elites, guards) become their city equivalents
const L3MAP = { sai: 'dr', blue: 'dr', fs: 'dr', rap: 'lv', tnk: 'drg', snp: 'drg' };
{ const _s = spawnE; spawnE = function (k) {
    if (S.stage == 3) { if (S._pk) { S._pk = 0; if (Math.random() < L3THIN + .2 * Math.max(0, 1 - S.t / 300)) return; } if (L3MAP[k]) k = L3MAP[k]; }
    return _s(k); }; }
{ const _p = pickE; pickE = function () {
    if (S.stage != 3) return _p(); const t = S.t, r = Math.random(); S._pk = 1;
    let x = r;   // shares: Cell Jr 10% (after 4:00), larvae 20% (after 2:00), gunners 10% (after 0:40), the rest battle drones
    if (t > 240) { if (x < .1) return 'cj'; x -= .1; }
    if (t > 120) { if (x < .2) return 'lv'; x -= .2; }
    if (t > 40 && x < .1) return 'drg';
    return 'dr';
  }; }
{ const _sw = swarm; swarm = function () {   // bio-larvae ring with one gap
    if (S.stage != 3) return _sw();
    const R = Math.hypot(W, H) / 2 + 40, n = Math.round(R * 6.283 / 30), g = Math.random() * 6.283;
    for (let i = 0; i < n; i++) { const a = i / n * 6.283; if (Math.abs(Math.atan2(Math.sin(a - g), Math.cos(a - g))) < .3) continue;   // same gap as the Level 1 swarm (0.6 rad)
      spawnE(S.t > 150 ? 'lv' : 'dr'); const e = S.en[S.en.length - 1]; e.x = S.p.x + Math.cos(a) * R; e.y = S.p.y + Math.sin(a) * R; }
  }; }
{ const _st = start; start = function (st) { const r = _st(st); if (S.stage == 3) { S.eliteT = 50; S.cgr = null; S.rp = []; } return r; }; }
{ const _bd = beanDrop; beanDrop = function (e) { if (S.stage == 3 && !e.boss && !e.elite && Math.random() < .02) { S.lastBean = S.t; return true; } return _bd(e); }; }
{ const _a = awardZeni; awardZeni = function (win) { const z = _a(win); if (S.stage != 3) return z; const x = Math.floor((win ? 350 : 0) + (S.bossK || 0) * 15); META.zeni += x; P.zeni += x; saveMeta(); return z + x; }; }

/* ---------- mob AI ---------- */
// Every mob needs an AI entry: the original game's fallback branch makes AI-less enemies fire bullet rings.
AI.dr = AI.lv = function (e, dt) { chase(e, dt, 0); if (near_(e)) hitP(e, DIFF.contact); };
AI.drg = function (e, dt) {   // gunner drone: hovers at range and fires slow orange shots while on screen
  const p = S.p, dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1; e.tm -= dt;
  if (d > 230) chase(e, dt, 0); else if (d < 150) { e.x -= dx / d * e.spd * .7 * dt; e.y -= dy / d * e.spd * .7 * dt; }
  if (e.tm <= 0) { if (Math.abs(dx) > W / 2 + 10 || Math.abs(dy) > H / 2 + 10 || S.eb.length >= 26) e.tm = .6 + Math.random() * .6;
    else { e.tm = 5.5 + Math.random() * 2; S.eb.push({ x: e.x, y: e.y, vx: dx / d * 170, vy: dy / d * 170, l: 2.8, g: 'or', dm: e.elite ? 12 : 6 }); } }
  if (near_(e)) hitP(e, DIFF.contact * .8);
};

/* ---------- boss AI ---------- */
const ang = (e, x, y) => Math.atan2(y - e.y, x - e.x);
// Android 19: every few seconds he plants his feet and opens his palms. Hits from in front are absorbed as healing;
// get behind him for bonus damage.
AI.a19 = function (e, dt) {
  const p = S.p, h2 = e.hp < e.max * .5; e.t3 = (e.t3 ?? 3) - dt; e.t4 = (e.t4 ?? 5) - dt;
  if (e.abs > 0) { e.abs -= dt; if (e.abs <= 0) e.t4 = h2 ? 7.5 : 9; }
  else { chase(e, dt, 60); if (e.t4 <= 0) { e.abs = 1.8; e.fa = ang(e, p.x, p.y); ban('ANDROID 19 IS ABSORBING ENERGY! GET BEHIND HIM!'); sfxPlay('absorb'); }
    if (e.t3 <= 0) { e.t3 = h2 ? 2.6 : 3.2; fan(e, h2 ? 4 : 3, 220, 'or', 8); } }
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(16); }
};
{ const _h = hitE; hitE = function (e, d) {
    if (e.k == 'a19' && e.abs > 0 && !e.dead) {
      let a = ang(e, S.p.x, S.p.y) - e.fa; a = Math.atan2(Math.sin(a), Math.cos(a));
      if (Math.abs(a) < 1.4) { e.hp = Math.min(e.max, e.hp + d * .1); S.a19abs = 1; e.fl = .05;
        if (S.nums.length < 40 && Math.random() < .3) S.nums.push({ x: e.x, y: e.y - e.r, v: 'ABSORB', l: .5, c: '#c8a0ff' }); return; }
      d *= 1.3;
    }
    return _h(e, d);
  }; }
// Dr. Gero: keeps his distance, fires eye-laser lanes and calls in drones
AI.a20 = function (e, dt) {
  const p = S.p, dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1, h2 = e.hp < e.max * .5;
  e.t3 = (e.t3 ?? 2.5) - dt; e.t4 = (e.t4 ?? 6) - dt;
  if (d > 230) chase(e, dt, 0); else if (d < 160) { e.x -= dx / d * e.spd * .8 * dt; e.y -= dy / d * e.spd * .8 * dt; }
  if (e.t3 <= 0) { e.t3 = h2 ? 2.6 : 3.4; const a = Math.atan2(dy, dx), n = h2 ? 3 : 2;
    for (let i = 0; i < n; i++) lane(e.x, e.y, a + (i - (n - 1) / 2) * .22, 900, 26, .85, 28, 'or'); sfxPlay('bosscharge'); }
  if (e.t4 <= 0) { e.t4 = 9; summon(e, 'dr', 3); summon(e, 'drg', 1); }
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(14); }
};
// Androids 17 & 18: a tag team. 17 drops barrier domes and dashes in, 18 rapid-fires from range.
// When one falls the other gets angrier.
const mate = e => S.en.some(o => !o.dead && o !== e && (o.k == 'a17' || o.k == 'a18'));
AI.a17 = function (e, dt) {
  const p = S.p, mad = !mate(e); e.t3 = (e.t3 ?? 3) - dt; e.t5 = (e.t5 ?? 4) - dt;
  if (!dashy(e, dt, mad ? 2.6 : 3.6, 380, .5)) chase(e, dt, 70);
  if (e.t3 <= 0) { e.t3 = mad ? 3.6 : 5; zone(p.x, p.y, 115, 1.3, 30); }
  if (e.t5 <= 0) { e.t5 = mad ? 3 : 4.5; ring(e, mad ? 14 : 10, 200, 'pu', 9); }
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(18); }
};
AI.a18 = function (e, dt) {
  const p = S.p, dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1, mad = !mate(e);
  if (d > 220) chase(e, dt, 0); else if (d < 150) { e.x -= dx / d * e.spd * .8 * dt; e.y -= dy / d * e.spd * .8 * dt; }
  e.t3 = (e.t3 ?? 2) - dt;
  if (e.bst > 0) { e.bst -= dt; e.bt = (e.bt || 0) - dt; if (e.bt <= 0) { e.bt = mad ? .2 : .28; fan(e, mad ? 2 : 1, 320, 'pu', 8, .12); } }
  else if (e.t3 <= 0) { e.t3 = mad ? 2 : 2.8; e.bst = 1.4; sfxPlay('zap'); }
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(16); }
};
// Android 16: slow and heavy. Rocket Punch (a homing fist), Hell's Flash (wide beam lanes), and a grab-slam up close.
AI.a16 = function (e, dt) {
  const p = S.p, d = Math.hypot(p.x - e.x, p.y - e.y), h2 = e.hp < e.max * .5;
  e.t3 = (e.t3 ?? 4) - dt; e.t4 = (e.t4 ?? 8) - dt; e.t5 = (e.t5 ?? 3) - dt;
  if (!(e.gw > 0)) chase(e, dt, 40);
  if (e.t3 <= 0) { e.t3 = h2 ? 4.5 : 6; const a = ang(e, p.x, p.y); (S.rp || (S.rp = [])).push({ x: e.x, y: e.y, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, t: 3.2, e }); e.arm = 3.2; ban('ROCKET PUNCH!'); sfxPlay('dash'); }
  if (e.t4 <= 0) { e.t4 = h2 ? 8 : 10; const a = ang(e, p.x, p.y); for (let i = -1; i <= 1; i++) lane(e.x, e.y, a + i * .4, 1000, 70, 1.2, 40, 'or'); ban("HELL'S FLASH!"); sfxPlay('bosscharge'); }
  if (e.gw > 0) { e.gw -= dt; if (e.gw <= 0) { if (d < 110) { bossHurt(36); kick(14); } boom(e.x, e.y, 110, '#ffb070'); } }
  else if (d < 90 && e.t5 <= 0) { e.t5 = 4; e.gw = .7; S.zones.push({ x: e.x, y: e.y, r: 110, t: .7, T: .7, d: 0 }); }
  if (e.arm > 0) e.arm -= dt;
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(22); }
};
// Imperfect Cell: drains nearby enemies through his tail to heal himself
AI.ce1 = function (e, dt) {
  const p = S.p; chase(e, dt, 80); e.t3 = (e.t3 ?? 2.5) - dt; e.t4 = (e.t4 ?? 5) - dt;
  if (e.t3 <= 0) { e.t3 = 2.6; fan(e, 4, 240, 'pu', 11); }
  if (e.t4 <= 0) { e.t4 = 7; let n = 0; e.drn = [];
    for (const o of S.en) { if (o.dead || o.boss || n >= 5 || Math.hypot(o.x - e.x, o.y - e.y) > 320) continue; n++; o.dead = 1; e.drn.push([o.x, o.y]); }
    if (n) { e.hp = Math.min(e.max, e.hp + e.max * .006 * n); e.drT = .5; ban('CELL ABSORBS HIS PREY!'); sfxPlay('absorb'); } }
  if (e.drT > 0) e.drT -= dt;
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(18); }
};
// Semi-Perfect Cell: telegraphed charges and ground stomps
AI.ce2 = function (e, dt) {
  const p = S.p, dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
  e.t4 = (e.t4 ?? 4) - dt; e.t5 = (e.t5 ?? 3) - dt;
  if (e.cw > 0) { e.cw -= dt; if (e.cw <= 0) { e.dash = .8; sfxPlay('dash'); } return; }
  if (e.dash > 0) { e.dash -= dt; e.x += e.dx * 480 * dt; e.y += e.dy * 480 * dt; if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .6; bossHurt(28); kick(12); } return; }
  chase(e, dt, 0);
  if (e.t4 <= 0) { e.t4 = 5; e.cw = .8; e.dx = dx / d; e.dy = dy / d; lane(e.x, e.y, Math.atan2(dy, dx), 430, e.r * 2 + 16, .8, 0, 'or'); }
  if (e.t5 <= 0 && d < 170) { e.t5 = 3.4; zone(e.x, e.y, 150, .8, 32); }
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(20); }
};
// Perfect Cell: Solar Kamehameha lanes, Cell Jr. broods, and a self-destruct countdown at 10% HP
AI.ce3 = function (e, dt) {
  const p = S.p, h2 = e.hp < e.max * .5 || e.sup;
  if (e.boomT > 0) { e.boomT -= dt; e.fl = (e.boomT * 4 | 0) % 2 ? .05 : 0;
    if (e.boomT <= 0) { ban('CELL EXPLODES!'); bossHurt(p.max * .5); boom(e.x, e.y, 300, '#fff'); impact(e.x, e.y, 600, 'wh', .8); aFlash(1); kick(30);
      e.hp = e.max * .3; e.sup = 1; ban('CELL IS BACK, EVEN STRONGER!'); } return; }
  if (!e.sdDone && e.hp < e.max * .1) { e.sdDone = 1; e.boomT = 10; ban('CELL WILL SELF-DESTRUCT! FINISH HIM!'); sfxPlay('roar'); return; }
  chase(e, dt, 90); e.t3 = (e.t3 ?? 2) - dt; e.t4 = (e.t4 ?? 6) - dt; e.t6 = (e.t6 ?? 10) - dt;
  if (e.t3 <= 0) { e.t3 = h2 ? 1.5 : 2; fan(e, h2 ? 7 : 5, 270, 'pu', 12); }
  if (e.t4 <= 0) { e.t4 = h2 ? 4.5 : 6; const a = ang(e, p.x, p.y), n = h2 ? 3 : 2;
    for (let i = 0; i < n; i++) lane(e.x, e.y, a + (i - (n - 1) / 2) * .3, 1000, 46, .8, 42, 'bl'); ban('SOLAR KAMEHAMEHA!'); sfxPlay('bosscharge'); }
  if (e.t6 <= 0) { e.t6 = 15; summon(e, 'cj', 3); }
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(22); }
};
// Cell evolves when each form falls
{ const _k = killE; killE = function (e) {
    const was = e.dead; _k(e); if (was || !e.dead || (S.stage != 3 && !S.endless)) return;
    if (e.k == 'ce1' || e.k == 'ce2') { const nk = e.k == 'ce1' ? 'ce2' : 'ce3'; spawnE(nk); const n = S.en[S.en.length - 1]; n.x = e.x; n.y = e.y;
      S.flash = 1; boom(e.x, e.y, 120, '#9f6'); ban(nk == 'ce2' ? 'CELL EVOLVES: SEMI-PERFECT FORM!' : 'PERFECT CELL!'); }
    if (e.k == 'ce3' && e.boomT > 0) S.cellSD = 1;
    if ((e.k == 'a17' || e.k == 'a18')) { (S.a78 || (S.a78 = {}))[e.k] = S.t; }
  }; }

/* ---------- per-frame: rocket punches, boss hand-offs, the Cell Games ring ---------- */
const L3WAIT = { a20: ['a19'], a17: ['a20'], a18: ['a20'], a16: ['a17', 'a18'], ce1: ['a16'] };
{ const _u = update; update = function (dt) {
    const r = _u(dt); if (S.stage != 3 || S.mode != 'play') return r;
    const p = S.p;
    for (const f of S.rp || []) { f.t -= dt; const a = ang(f, p.x, p.y), sp = Math.hypot(f.vx, f.vy), cur = Math.atan2(f.vy, f.vx);
      let da = Math.atan2(Math.sin(a - cur), Math.cos(a - cur)); da = Math.max(-2.2 * dt, Math.min(2.2 * dt, da));
      f.vx = Math.cos(cur + da) * sp; f.vy = Math.sin(cur + da) * sp; f.x += f.vx * dt; f.y += f.vy * dt;
      if (Math.hypot(f.x - p.x, f.y - p.y) < 24) { f.t = 0; bossHurt(28); kick(10); boom(f.x, f.y, 40, '#ffb070'); } }
    if (S.rp) S.rp = S.rp.filter(f => f.t > 0);
    // each boss waits until the one before it is down (+15 s), but never arrives more than 75 s late
    if (S.sch) for (const q of S.sch) { const need = L3WAIT[q.k]; if (!need || q.d) continue; if (q.t0 === undefined) q.t0 = q.t;
      const alive = S.en.some(e => need.includes(e.k) && !e.dead), seen = need.every(k => S.sch.some(s => s.k == k && s.d));
      if (alive || (seen && !q.gd)) { if (!alive) q.gd = 1; q.t = Math.min(q.t0 + 75, Math.max(q.t0, S.t + 15)); } }
    if (!S.cgr && S.en.some(e => e.k == 'ce3' && !e.dead)) { S.cgr = { x: p.x, y: p.y, R0: 700, R: 700, t: 0 }; ban('THE CELL GAMES BEGIN!'); }
    if (S.cgr) { const g = S.cgr; g.t += dt; g.R = g.R0 - (g.R0 - 430) * Math.min(1, g.t / 25);
      p.x = Math.max(g.x - g.R + 14, Math.min(g.x + g.R - 14, p.x)); p.y = Math.max(g.y - g.R + 14, Math.min(g.y + g.R - 14, p.y)); }
    return r;
  }; }

/* ---------- art: bosses ---------- */
// Same building blocks as the Ginyu Force / Frieza painter (bossArt3), with android and Cell parts.
const B4 = {
  a19: { sc: 1.08, w: 1.55, hs: 1.12, sk: '#f2eee8', su: '#34343c', ar: '#cdb98a', a2: '#8a2a2a', bt: '#34343c', bt2: '#cdb98a', belt: '#202026', head: 'cap', eye: ['#3a3a44', '#16161c', '#000'] },
  a20: { sc: 1, w: 1, hs: 1.04, sk: '#f0d2b2', su: '#4a3e34', ar: '#cfbb8c', a2: '#8a2a2a', bt: '#3a3028', bt2: '#5a4a3a', belt: '#3a3028', head: 'brain', eye: ['#8a8a98', '#3a3a48', '#0a0a10'] },
  a17: { sc: 1, w: .94, hs: 1, sk: '#f6dcc4', su: '#2e3446', ar: '#1c1c24', a2: '#e8672a', bt: '#5a4430', bt2: '#3a2a1a', belt: '#5a4430', head: 'long', hc: '#16161e', scarf: 1, eye: ['#8ac8ff', '#2a6ad0', '#081a40'] },
  a18: { sc: .96, w: .88, hs: 1, sk: '#f8e2ce', su: '#3d5ea8', ar: '#1c1c24', a2: '#4a6cb8', bt: '#5a4430', bt2: '#3a2a1a', belt: '#3d5ea8', head: 'bob', hc: '#f2d878', skirt: 1, stripes: 1, eye: ['#8ac8ff', '#2a6ad0', '#081a40'] },
  a16: { sc: 1.18, w: 1.45, hs: .98, tall: 1.1, sk: '#f2c8a0', su: '#4a3a6a', ar: '#3f8a3a', a2: '#2c6a2a', bt: '#3a2a4a', bt2: '#3f8a3a', belt: '#3a2a4a', head: 'mohawk', hc: '#e8501a', pads: 1, eye: ['#9ad0ff', '#2a5ab0', '#081a40'] },
  ce1: { sc: 1.04, w: 1.08, hs: 1.06, sk: '#7cc254', su: '#5a9a3e', ar: '#7cc254', a2: '#d88a3a', bt: '#3a6a2a', bt2: '#2a4a1e', belt: '#3a6a2a', head: 'cell1', cell: 1, tail: 1, wings: '#d88a3a', beak: 1, eye: ['#ff7aa0', '#c81860', '#3a0418'] },
  ce2: { sc: 1.14, w: 1.42, hs: 1, sk: '#7cc254', su: '#5a9a3e', ar: '#7cc254', a2: '#2a2a2a', bt: '#3a6a2a', bt2: '#2a4a1e', belt: '#2a2a2a', head: 'cell2', cell: 1, tail: 1, face: '#e6d8f2', wings: '#2a2a2a', eye: ['#ff7aa0', '#c81860', '#3a0418'] },
  ce3: { sc: 1, w: 1, hs: 1, sk: '#86cc5c', su: '#1e1e22', ar: '#86cc5c', a2: '#1e1e22', bt: '#f4f2ee', bt2: '#1e1e22', belt: '#1e1e22', head: 'cell3', cell: 1, face: '#ece0f6', wings: '#1e1e22', eye: ['#ff8ab0', '#c81860', '#3a0418'], rage: 'pu', thr: .25 }
};
for (const k in B4) B3[k] = { l3: 1, sc: 1 };
{ const _b = bossArt3; bossArt3 = function (c, x, y, r, t, e) { return B3[e.k] && B3[e.k].l3 ? bossArt4(c, x, y, r, t, e) : _b(c, x, y, r, t, e); }; }
const SPOTS = [[-6, -4, 1.6], [5, -1, 1.2], [-2, 4, 1.1], [7, 6, 1.4], [-8, 8, 1], [2, -6, .9]];
function spots(c, sx, sy, s) { c.fillStyle = 'rgba(20,40,14,.85)'; for (const [x, y, r] of SPOTS) { c.beginPath(); c.ellipse(sx + x * s, sy + y * s, r * s, r * .8 * s, 0, 0, 7); c.fill(); } }
function bossArt4(c, x, y, r, t, e) {
  const o = B4[e.k], boom = e.boomT > 0 ? 1 + (10 - e.boomT) * .045 : 1, k = r / 20 * o.sc * boom, w = o.w, hs = o.hs, tall = o.tall || 1, sd = e.sd || 0;
  // Walk cycle (2026-11-14): the androids used to only bob in place. The stride now follows how far they actually moved
  // (so feet don't skate), blending into a slow breathing idle when they stop: alternate knee lifts, arms swinging
  // against the legs, a dip on each step and a lean into the direction of travel.
  const mvd = e._wx === undefined ? 0 : Math.min(12, Math.hypot(e.x - e._wx, e.y - e._wy)), mdx = e._wx === undefined ? 0 : e.x - e._wx; e._wx = e.x; e._wy = e.y;
  e._wm = (e._wm || 0) + ((mvd > .25 ? 1 : 0) - (e._wm || 0)) * .15; e._wp = (e._wp || 0) + mvd * .15; e._wl = (e._wl || 0) + (Math.max(-1, Math.min(1, mdx / 2)) - (e._wl || 0)) * .12;
  const wm = e._wm, ph = e._wp, idle = Math.sin(t * 2.2 + sd);
  const bob = -Math.abs(Math.sin(ph)) * 1.8 * wm + idle * .5 * (1 - wm), sw = Math.sin(ph) * wm + idle * .15 * (1 - wm), hy = -16 + idle * .3 * (1 - wm);
  const SK = tones(o.sk, o.cell ? '#14300c' : '#4a1a10'), SU = tones(o.su), AR = tones(o.ar, o.cell ? '#14300c' : '#241a40'), A2 = tones(o.a2, '#200a08'), BT = tones(o.bt), BT2 = tones(o.bt2), BL = tones(o.belt), HC = o.hc ? tones(o.hc, '#2a1004') : null;
  if (o.rage && e.hp < e.max * o.thr) { LT(); gl(o.rage, x, y, r * 2.4, .5 + .1 * Math.sin(t * 10)); NM(); }
  if (e.sup) { LT(); gl('cy', x, y, r * 2.6, .45 + .2 * Math.sin(t * 20)); NM(); }
  if (e.k == 'a19' && e.abs > 0) {   // absorb cone in front of him
    ctx.save(); ctx.fillStyle = 'rgba(190,150,255,' + (.16 + .08 * Math.sin(t * 12)) + ')'; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r * 5, e.fa - 1.4, e.fa + 1.4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(220,200,255,.6)'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
  c.save(); c.translate(x, y + bob); c.rotate(e._wl * .07 * wm + sw * .03); c.scale(k, k * tall); c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 1.5; c.strokeStyle = OL;
  // back layer: wings, tail, long hair
  if (o.wings) { const fl = Math.sin(t * 8 + sd) * .12; for (const q of [-1, 1]) { c.save(); c.rotate(q * (.25 + fl));
      hpoly(c, [[q * 4, -6], [q * 16, -22], [q * 24, -18], [q * 20, -4], [q * 12, 4]], tones(o.wings, '#0a0a0a'), { lw: 1.3 });
      if (o.cell) { c.fillStyle = 'rgba(120,200,90,.55)'; c.beginPath(); c.moveTo(q * 9, -8); c.lineTo(q * 17, -18); c.lineTo(q * 18, -8); c.closePath(); c.fill(); } c.restore(); } }
  if (o.tail) { const tw = Math.sin(t * 3 + sd) * 3; hlimb(c, [[-4, 10], [-14, 18 + tw * .4], [-24, 16 + tw], [-30, 4 + tw * 1.3]], 4.6, SK);
    hpoly(c, [[-30, 4 + tw * 1.3], [-36, -6 + tw], [-27, -1 + tw * 1.3]], tones('#e8d070', '#5a4010'), { lw: 1.2 }); }
  if (o.head == 'long') hpoly(c, [[-11, -26], [11, -26], [12.6, -10], [10.4, -2], [-10.4, -2], [-12.6, -10]], HC);
  if (o.head == 'bob') hpoly(c, [[-11.4, -27], [11.4, -27], [12.4, -14], [11, -7], [-11, -7], [-12.4, -14]], HC);
  // legs + boots: hip → knee → ankle limbs; the lifted leg bends its knee out and up
  c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(0, 26.5, 15 * w, 3.4, 0, 0, 7); c.fill();
  for (const q of [-1, 1]) { const lift = Math.max(0, q * sw) * (wm > .05 ? 1 : 0), hx = q * 4.4 * w, ax = hx + q * lift * .8, ay = 20.6 - lift * 4.6, kx = hx + q * lift * 2, ky = 14.6 - lift * 2.4, by = ay + 3.4;
    hlimb(c, [[hx, 8.4], [kx, ky], [ax, ay]], 7.4 * w, o.skirt ? tones('#2a2a34') : o.cell ? AR : SU);
    if (o.cell) spots(c, kx, ky, .5);
    hpoly(c, [[ax - 4.6 * w, by - 5.6], [ax + 4.6 * w, by - 5.6], [ax + 5.6 * w, by + 1.6 - lift * .6], [ax - 5.6 * w, by + 1.6 - lift * .6]], BT);
    hpoly(c, [[ax - 4.6 * w, by - 5.6], [ax + 4.6 * w, by - 5.6], [ax + 4.6 * w, by - 3.6], [ax - 4.6 * w, by - 3.6]], BT2, { lw: 1, ns: 0 });
    c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.ellipse(ax - 2 * w, by - 1.4, 1.8 * w, .9, 0, 0, 7); c.fill(); }   // boot shine
  if (o.skirt) { hpoly(c, [[-9.2, 7.6], [9.2, 7.6], [11.6 + sw * .6, 17.4], [-11.6 + sw * .6, 17.4]], SU, { lw: 1.3 });   // 18's skirt over the legs, with a hem line
    c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-10.6 + sw * .6, 15.6); c.lineTo(10.6 + sw * .6, 15.6); c.stroke(); c.strokeStyle = OL; }
  // torso
  hpoly(c, [[-9.4 * w, -7], [9.4 * w, -7], [10 * w, 13], [-10 * w, 13]], o.cell && e.k != 'ce3' ? AR : SU);
  if (o.cell) { if (e.k == 'ce3') { hpoly(c, [[-6 * w, -7], [6 * w, -7], [5 * w, 9], [-5 * w, 9]], AR, { lw: 1.2 }); spots(c, 0, 0, .8); for (const q of [-1, 1]) hpoly(c, [[q * 9.4 * w, -7], [q * 6.4 * w, -7], [q * 5.6 * w, 4], [q * 9 * w, 6]], tones('#86cc5c', '#14300c'), { lw: 1 }); }
    else spots(c, 0, 1, 1); }
  else { hpoly(c, [[-9.2 * w, -7], [9.2 * w, -7], [8.4 * w, 6.4], [-8.4 * w, 6.4]], AR);
    if (o.stripes) { c.fillStyle = 'rgba(245,245,245,.85)'; for (let i = 0; i < 4; i++) c.fillRect(-8.6 * w, -5 + i * 3.2, 17.2 * w, 1.1); }
    if (e.k == 'a18' || e.k == 'a20') for (const q of [-1, 1]) hpoly(c, [[q * 9.2 * w, -7], [q * 4.4 * w, -7], [q * 4.8 * w, 8], [q * 9 * w, 8]], A2, { lw: 1.1 });
    if (e.k == 'a19' || e.k == 'a20' || e.k == 'a16') { hell(c, -4 * w, -2, 2.6, 2.6, tones('#d83030', '#400808')); c.fillStyle = '#fff'; c.font = 'bold 3px sans-serif'; c.textAlign = 'center'; c.fillText('RR', -4 * w, -1); }
    if (e.k == 'a16') { c.strokeStyle = 'rgba(10,40,10,.55)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -7); c.lineTo(0, 6); c.moveTo(-8 * w, 0); c.lineTo(8 * w, 0); c.stroke(); c.strokeStyle = OL; }
    hpoly(c, [[-9.6 * w, 6.4], [9.6 * w, 6.4], [9.6 * w, 9.6], [-9.6 * w, 9.6]], BL, { lw: 1.3 }); }
  if (!o.cell) { c.save(); c.beginPath(); c.rect(-10 * w, -7, 20 * w, 20); c.clip(); c.fillStyle = 'rgba(10,10,30,.2)'; c.beginPath(); c.moveTo(3 * w, -7); c.quadraticCurveTo(7 * w, 3, 4 * w, 13); c.lineTo(10 * w, 13); c.lineTo(10 * w, -7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.13)'; c.beginPath(); c.ellipse(-5 * w, -2, 2.6 * w, 5, -.2, 0, 7); c.fill(); c.restore();
    if (e.k == 'a17') { c.strokeStyle = 'rgba(240,240,240,.85)'; c.lineWidth = 1.6; for (const q of [-1, 1]) { c.beginPath(); c.moveTo(q * 3.4, -7); c.lineTo(q * 5.6, 6); c.stroke(); } c.strokeStyle = OL; }   // 17's open overshirt edges
    if (e.k == 'a16') { c.fillStyle = 'rgba(200,255,190,.25)'; for (const q of [-1, 1]) { c.beginPath(); c.ellipse(q * 4.6 * w, -3.4, 2.6 * w, 1.6, 0, 0, 7); c.fill(); } } }   // 16's armour plate shine
  // arms (Android 16's right arm is missing while his Rocket Punch is out)
  for (const q of [-1, 1]) { const sx = q * 10.4 * w, swing = -q * sw * 3.2, hx = q * (14 * w + .6) - q * Math.max(0, swing) * .5, hy2 = 7 + swing, mx = q * 13.8 * w, my = 1 + swing * .4;
    if (e.k == 'a16' && q == 1 && e.arm > 0) { hell(c, sx + q * 2, -3, 3.4, 3.4, tones('#8a8a98', '#20202a')); continue; }
    const absorbing = e.k == 'a19' && e.abs > 0;
    hlimb(c, [[sx, -5], [mx, my], [hx, hy2]], e.k == 'a16' || e.k == 'ce2' ? 7.4 : 5.8, o.cell ? SK : e.k == 'a18' || e.k == 'a17' ? AR : SK);
    if (o.cell) spots(c, mx, my + 2, .4);
    fist(c, hx, hy2 + 2.4, 1.5708, e.k == 'a16' || e.k == 'ce2' ? 4 : 3.2, e.k == 'ce3' ? tones('#f4f2ee') : SK);
    if (absorbing) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(hx, hy2 + 2, 0, hx, hy2 + 2, 7); g.addColorStop(0, 'rgba(230,200,255,.95)'); g.addColorStop(1, 'rgba(160,90,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(hx, hy2 + 2, 7, 0, 7); c.fill(); c.restore(); } }
  if (o.pads) for (const q of [-1, 1]) { const px = q * 11.4 * w; hell(c, px, -7.2, 6.4 * w * .9, 4.4, AR); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(px - q, -8.6, 3 * w * .8, 1.2, 0, 0, 7); c.fill(); }
  if (o.scarf) { hpoly(c, [[-6, -9.4], [6, -9.4], [7, -5.6], [-7, -5.6]], A2, { lw: 1.2 }); hpoly(c, [[3, -6], [7, -5.6], [9 + sw, 4], [5 + sw, 3]], A2, { lw: 1.1 }); }
  else hpoly(c, [[-3.2, -9], [3.2, -9], [3.6, -4.4], [-3.6, -4.4]], SK, { ns: 1 });
  // head
  c.save(); c.translate(0, hy);
  const FC = o.face ? tones(o.face, '#3a2a50') : SK;
  if (o.head == 'cell1') { hpoly(c, [[-9, -4], [-4, -16], [0, -22], [4, -16], [9, -4]], tones('#3a6a2a', '#0a1a06'), { lw: 1.3 }); hpoly(c, [[-9, -6], [-15, -14], [-8, -10]], SK); hpoly(c, [[9, -6], [15, -14], [8, -10]], SK); }
  if (o.head == 'cell2') { for (const q of [-1, 1]) hpoly(c, [[q * 5, -8], [q * 12, -20], [q * 14, -12], [q * 9, -3]], tones('#2a2a2a', '#000000'), { lw: 1.3 }); }
  if (o.head == 'cell3') { for (const q of [-1, 1]) hpoly(c, [[q * 3, -8], [q * 9, -22], [q * 13, -18], [q * 10, -4]], tones('#1e1e22', '#000000'), { lw: 1.3 }); hpoly(c, [[-3, -8], [0, -16], [3, -8]], SK, { lw: 1.1 }); }
  if (o.head == 'mohawk') hpoly(c, [[-3, -8], [-4, -20], [0, -24], [4, -20], [3, -8]], HC);
  hell(c, 0, 0, 9.8 * hs, 9.4 * hs, o.head == 'cell2' || o.head == 'cell3' ? FC : SK);
  c.save(); c.beginPath(); c.ellipse(0, 0, 9.8 * hs, 9.4 * hs, 0, 0, 7); c.clip(); c.fillStyle = 'rgba(100,40,60,.18)'; c.beginPath(); c.ellipse(0, 9, 9, 3.4, 0, 0, 7); c.fill();
  if (o.head == 'cap') { const g = c.createLinearGradient(0, -10, 0, -2); g.addColorStop(0, '#f4f6fa'); g.addColorStop(1, '#8a90a0'); c.fillStyle = g; c.beginPath(); c.ellipse(0, -4, 10.6 * hs, 7.4 * hs, 0, 3.1416, 6.2832); c.fill(); c.strokeStyle = OL; c.lineWidth = 1.2; c.stroke(); }
  if (o.head == 'cell1') spots(c, 0, -3, .7);
  if (o.head == 'cell2' || o.head == 'cell3') { c.fillStyle = tones('#1e1e22', '#000000')[1]; for (const q of [-1, 1]) { c.beginPath(); c.ellipse(q * 9.4, -1, 3.6, 9, 0, 0, 7); c.fill(); } }
  c.fillStyle = 'rgba(255,255,255,.16)'; c.beginPath(); c.ellipse(-4, -5, 3, 1.6, -.4, 0, 7); c.fill(); c.restore();
  if (o.head == 'brain') {   // Dr. Gero: glass dome over his brain, white hair at the sides, long moustache
    for (const q of [-1, 1]) hpoly(c, [[q * 8.4, -6], [q * 12.6, -2], [q * 11.4, 5], [q * 9, 2]], tones('#f6f6f6', '#7a7a8a'), { lw: 1.1 });
    c.save(); c.fillStyle = 'rgba(255,170,190,.85)'; c.beginPath(); c.ellipse(0, -9, 7.6, 5, 0, 3.1416, 6.2832); c.fill();
    c.strokeStyle = 'rgba(160,60,90,.7)'; c.lineWidth = .8; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 2.6, -9); c.quadraticCurveTo(i * 2.6 + 1.4, -12, i * 2.6, -13); c.stroke(); }
    c.fillStyle = 'rgba(200,240,255,.28)'; c.strokeStyle = 'rgba(40,60,80,.9)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, -7, 9, 8.6, 0, 3.1416, 6.2832); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(-4, -12, 2, 1, -.4, 0, 7); c.fill(); c.restore(); }
  if (o.head == 'long' || o.head == 'bob') {   // fringe
    hpoly(c, o.head == 'long' ? [[-10.4, -2], [-11, -10], [-6, -12.4], [0, -10.6], [6, -12.4], [11, -10], [10.4, -2], [6.6, -6.4], [2, -7.4], [0, -5], [-2, -7.4], [-6.6, -6.4]]
      : [[-10.8, 0], [-11.4, -10], [-5, -12.8], [3, -12], [11.4, -9], [10.8, 0], [8, -5], [3, -7], [-2, -5.6], [-7, -6]], HC);
    hairShine(c, [[-6, -10], [-2, -11.6], [-4, -8]], o.head == 'bob' ? '#fff6c8' : '#5a5e80', .6); }
  // eyes
  const ey = 1.6, ir = o.eye, rob = e.k == 'a19' || e.k == 'a20';
  for (const q of [-1, 1]) { const ex = q * 4.4 * hs, a = 2.9, bb = o.cell ? 2 : 2.4;
    c.save(); c.beginPath(); c.ellipse(ex, ey, a, bb, q * .14, 0, 7); c.fillStyle = rob ? '#1a1a22' : '#fffdf4'; c.fill(); c.lineWidth = .9; c.stroke(); c.clip();
    if (!rob) { const g = c.createRadialGradient(ex + .4, ey - .3, .2, ex + .5, ey + .2, a); g.addColorStop(0, ir[0]); g.addColorStop(.55, ir[1]); g.addColorStop(1, ir[2]); c.fillStyle = g; c.beginPath(); c.ellipse(ex + .5, ey + .2, a * .6, bb, 0, 0, 7); c.fill();
      c.fillStyle = '#050508'; c.beginPath(); c.ellipse(ex + .55, ey + .25, a * .26, bb * .55, 0, 0, 7); c.fill(); }
    glint(c, ex - .1, ey - bb * .3, .6); c.restore();
    c.strokeStyle = OL; c.lineWidth = 2.2; c.beginPath(); c.moveTo(q * 8.8 * hs, ey - 4.2); c.lineTo(q * 1.2, ey - (o.cell || e.k == 'a17' ? 2 : 1.2)); c.stroke(); }
  if (o.cell && o.face) { c.strokeStyle = 'rgba(150,60,140,.8)'; c.lineWidth = 1.1; for (const q of [-1, 1]) { c.beginPath(); c.moveTo(q * 5.4, 4.4); c.lineTo(q * 5, 8); c.stroke(); } }
  c.strokeStyle = OL; c.lineWidth = 1.3;
  if (o.beak) { hpoly(c, [[-3, 4.6], [3, 4.6], [0, 11]], tones('#e8c060', '#5a3a08'), { lw: 1.1 }); }
  else if (e.k == 'a20') { hpoly(c, [[-1, 4.4], [-7, 7], [-8.4, 13], [-4, 9], [0, 7.4], [4, 9], [8.4, 13], [7, 7], [1, 4.4]], tones('#f6f6f6', '#7a7a8a'), { lw: 1 }); }
  else if (e.k == 'a19') { c.fillStyle = '#7a1414'; c.beginPath(); c.ellipse(0, 7.4, 3, 1.6, 0, 0, 7); c.fill(); c.stroke(); }
  else if (e.k == 'ce3' || e.k == 'a17') { c.beginPath(); c.moveTo(-3.2, 7.6); c.quadraticCurveTo(.4, 8.8, 3.6, 6.8); c.stroke(); }
  else { c.beginPath(); c.moveTo(-3, 8); c.quadraticCurveTo(0, 7.2, 3, 8); c.stroke(); }
  c.restore(); c.restore();
  // self-destruct countdown over Perfect Cell
  if (e.boomT > 0) { ctx.save(); ctx.font = '900 ' + Math.round(r * 1.6) + 'px Impact,Haettenschweiler,"HelveticaNeue-CondensedBlack","Avenir Next Condensed","Roboto Condensed",sans-serif-condensed,"Arial Narrow","Arial Black",sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 6; ctx.strokeStyle = '#3a0000';
    const s = String(Math.ceil(e.boomT)); ctx.strokeText(s, x, y - r * 2.6); ctx.fillStyle = e.boomT < 3 ? '#ff4030' : '#ffe27a'; ctx.fillText(s, x, y - r * 2.6); ctx.restore(); }
  // Imperfect Cell's tail drain
  if (e.drT > 0 && e.drn) { ctx.save(); ctx.strokeStyle = 'rgba(160,255,120,' + e.drT * 1.6 + ')'; ctx.lineWidth = 3; const cx = S.p.x - W / 2, cy = S.p.y - H / 2;
    for (const [qx, qy] of e.drn) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(qx - cx, qy - cy); ctx.stroke(); } ctx.restore(); }
}

/* ---------- art: mobs ---------- */
const MCTX = ctx;   // the main canvas context, for art functions that can also draw into an offscreen one
function drawL3Mob(e, x, y, f, C) {
  const ctx = C || MCTX, LT = () => ctx.globalCompositeOperation = 'lighter', NM = () => ctx.globalCompositeOperation = 'source-over', gl = (k, x, y, r, a = 1) => { ctx.globalAlpha = a; ctx.drawImage(GL[k], x - r, y - r, r * 2, r * 2); ctx.globalAlpha = 1; };   // C: draw somewhere else (perf9.js caches these as images)
  const r = e.r, t = S.t, sd = e.sd ?? (e.sd = Math.random() * 6), bob = Math.sin(t * 6 + sd) * 2, sc = r / 12;
  ctx.save(); ctx.translate(x, y); ctx.lineJoin = 'round'; ctx.lineWidth = 1.6; ctx.strokeStyle = OL;
  if (e.k == 'dr' || e.k == 'drg') {
    ctx.translate(0, bob - 4); ctx.scale(sc, sc);
    LT(); gl(e.k == 'drg' ? 'or' : 'rd', 0, 12, 8, .6); NM();
    const g = ctx.createRadialGradient(-4, -5, 1, 0, 0, 12); g.addColorStop(0, f ? '#fff' : '#e4e8ee'); g.addColorStop(.6, f ? '#fff' : '#9aa2ae'); g.addColorStop(1, '#4a5260');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = e.k == 'drg' ? '#e8b030' : '#c8302a'; ctx.fillRect(-11, -2, 22, 3.2); ctx.strokeRect(-11, -2, 22, 3.2);
    for (const q of [-1, 1]) { ctx.fillStyle = '#5a6270'; ctx.beginPath(); ctx.moveTo(q * 10, -4); ctx.lineTo(q * 17, -9); ctx.lineTo(q * 16, 2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    const a = Math.atan2(S.p.y - e.y, S.p.x - e.x);
    if (e.k == 'drg') { ctx.save(); ctx.rotate(a); ctx.fillStyle = '#3a404c'; ctx.fillRect(6, -2, 9, 4); ctx.strokeRect(6, -2, 9, 4); ctx.restore(); }
    ctx.fillStyle = '#ff3a2a'; ctx.beginPath(); ctx.arc(Math.cos(a) * 4, Math.sin(a) * 3 - 3, 3, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(Math.cos(a) * 4 - 1, Math.sin(a) * 3 - 4, 1, 0, 7); ctx.fill();
  } else if (e.k == 'lv') {
    const a = Math.atan2(S.p.y - e.y, S.p.x - e.x), wig = Math.sin(t * 22 + sd);
    ctx.rotate(a); ctx.scale(sc, sc);
    ctx.strokeStyle = '#2a3a1a'; ctx.lineWidth = 1.4; for (let i = -1; i <= 1; i++) for (const q of [-1, 1]) { ctx.beginPath(); ctx.moveTo(i * 4, q * 4); ctx.lineTo(i * 4 + wig * q * 2, q * 9); ctx.stroke(); }
    ctx.strokeStyle = OL; ctx.lineWidth = 1.5;
    for (let i = 2; i >= 0; i--) { ctx.fillStyle = f ? '#fff' : i ? '#6a8a4a' : '#88a860'; ctx.beginPath(); ctx.ellipse(-i * 6 + (i ? wig : 0), 0, 6 - i, 5 - i * .6, 0, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = '#1a2a10'; for (const [px, py] of [[-6, -2], [-11, 1], [-3, 2]]) { ctx.beginPath(); ctx.arc(px, py, 1, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#e8d070'; ctx.beginPath(); ctx.moveTo(-15, -2); ctx.lineTo(-21, 0); ctx.lineTo(-15, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff5a5a'; ctx.beginPath(); ctx.arc(3, -2, 1.2, 0, 7); ctx.arc(3, 2, 1.2, 0, 7); ctx.fill();
  }
  ctx.restore();
}
{ const _en = enemy; enemy = function (e, x, y) {
    if (e.k != 'dr' && e.k != 'drg' && e.k != 'lv') return _en(e, x, y);
    const f = e.fl > 0, r = e.r;
    if (GFX != 'low') { ctx.fillStyle = 'rgba(20,20,30,.3)'; el(x, y + 13, 9, 3.2); }
    if (e.elite) { LT(); gl('or', x, y, r * 2.4, .55 + .15 * Math.sin(S.t * 8)); NM(); }
    drawL3Mob(e, x, y, f);
    if (e.elite) { const w = 34; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - w / 2, y - r * 2.1, w, 5); ctx.fillStyle = '#ffd23a'; ctx.fillRect(x - w / 2 + 1, y - r * 2.1 + 1, (w - 2) * Math.max(0, e.hp / e.max), 3); }
    if (e.st > 0) { ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y - r * 1.6, 5, 0, 7); ctx.stroke(); }
  }; }
// rocket punches
{ const _d = drawNew; drawNew = function (cx, cy, t) { _d(cx, cy, t);
    for (const f of S.rp || []) { const x = f.x - cx, y = f.y - cy, a = Math.atan2(f.vy, f.vx);
      LT(); gl('or', x - Math.cos(a) * 12, y - Math.sin(a) * 12, 16, .7); NM();
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.lineWidth = 1.6; ctx.strokeStyle = OL; ctx.fillStyle = '#f2c8a0'; ctx.beginPath(); ctx.ellipse(2, 0, 8, 7, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4a3a6a'; ctx.fillRect(-12, -5, 9, 10); ctx.strokeRect(-12, -5, 9, 10); ctx.restore(); } }; }
LPAL.bl = LPAL.bl || ['80,160,255', '220,240,255'];

/* ---------- map: ruined city ---------- */
const PAL4 = { rock: { hi: '#c8c8cc', mid: '#8a8a92', lo: '#55555e' }, crater: { dust: 'rgba(40,40,50,.2)', in0: '#5a5a62', in1: '#3a3a44', rim: 'rgba(230,230,240,.5)' } };
const TILE4 = (() => { const c = mk(512, 512), x = c.getContext('2d'); x.scale(2, 2); x.fillStyle = '#7c7e86'; x.fillRect(0, 0, 256, 256);
  const wrap = f => { for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) f(ox, oy); };
  for (let i = 0; i < 12; i++) { const px = rnd(i, 21) * 256, py = rnd(i, 22) * 256, r = 40 + rnd(i, 23) * 70;
    wrap((ox, oy) => { const q = x.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, r); q.addColorStop(0, i % 2 ? 'rgba(40,40,50,.16)' : 'rgba(200,200,210,.14)'); q.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = q; x.fillRect(0, 0, 256, 256); }); }
  x.lineWidth = 1.1;   // cracks
  for (let i = 0; i < 18; i++) { let px = rnd(i, 24) * 256, py = rnd(i, 25) * 256; x.strokeStyle = 'rgba(30,30,36,.55)'; x.beginPath(); x.moveTo(px, py);
    for (let j = 0; j < 5; j++) { px += (rnd(i, j + 30) - .5) * 30; py += (rnd(j, i + 30) - .5) * 30; x.lineTo(px, py); } x.stroke(); }
  // paving slabs: each one a slightly different tone, with dark joints and a lit top-left edge
  for (let gx = 0; gx < 4; gx++) for (let gy = 0; gy < 4; gy++) { const q = rnd(gx + 60, gy + 61); x.fillStyle = q < .5 ? 'rgba(30,32,44,' + (.05 + q * .12) + ')' : 'rgba(225,220,205,' + ((q - .5) * .14) + ')'; x.fillRect(gx * 64, gy * 64, 64, 64); }
  x.fillStyle = 'rgba(30,30,38,.32)'; for (let g = 0; g < 4; g++) { x.fillRect(g * 64, 0, 1.5, 256); x.fillRect(0, g * 64, 256, 1.5); }
  x.fillStyle = 'rgba(235,235,240,.13)'; for (let g = 0; g < 4; g++) { x.fillRect(g * 64 + 1.5, 0, 1, 256); x.fillRect(0, g * 64 + 1.5, 256, 1); }
  for (let i = 0; i < 7; i++) { const px = rnd(i, 62) * 256, py = rnd(i, 63) * 256, r = 10 + rnd(i, 64) * 18;   // oil and scorch stains
    wrap((ox, oy) => { const q = x.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, r); q.addColorStop(0, 'rgba(20,18,24,.3)'); q.addColorStop(1, 'rgba(20,18,24,0)'); x.fillStyle = q; x.fillRect(px + ox - r, py + oy - r, r * 2, r * 2); }); }
  for (let i = 0; i < 1200; i++) { x.fillStyle = i % 2 ? 'rgba(40,40,46,.22)' : 'rgba(220,220,228,.16)'; x.fillRect(rnd(i, 26) * 256, rnd(i, 27) * 256, 1 + rnd(i, 28) * 1.6, 1 + rnd(i, 29) * 1.4); }
  return c; })();
const PAT4 = ctx.createPattern(TILE4, 'repeat'); PAT4.setTransform(new DOMMatrix().scale(.5));
function mkRuin(v) {   // a broken building stump: facade with a window grid and a jagged top
  const w = 70 + v * 8, h = 60 + (v % 3) * 16, c = mk((w + 20) * DK, (h + 30) * DK), x = c.getContext('2d'); x.scale(DK, DK); x.translate(10, 10);
  x.fillStyle = 'rgba(20,20,30,.3)'; x.beginPath(); x.ellipse(w / 2 + 6, h + 6, w * .62, 10, 0, 0, 7); x.fill();
  const top = []; for (let i = 0; i <= 6; i++) top.push([i / 6 * w, (rnd(v, i + 40) * .45) * h * (i % 2 ? 1 : .5)]);
  const pts = [[0, h], ...top, [w, h]], col = ['#b8b2a6', '#a8a4a0', '#c2b6a0', '#9ea4ac'][v % 4];
  x.lineJoin = 'round'; x.strokeStyle = OL; x.lineWidth = 1.8; x.fillStyle = col; x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); x.fill(); x.stroke();
  x.save(); x.clip(); x.fillStyle = 'rgba(0,0,0,.16)'; x.fillRect(w * .62, 0, w, h);
  for (let r = 0; r < 6; r++) for (let q = 0; q < 5; q++) { const wx = 6 + q * (w - 12) / 5, wy = h - 12 - r * 13; if (rnd(v + r, q) < .15) continue; x.fillStyle = rnd(q, v + r) < .2 ? '#e8c060' : '#2a2e3a'; x.fillRect(wx, wy, (w - 12) / 5 - 5, 8); }
  x.restore(); for (let i = 0; i < 7; i++) { const rx = rnd(i, v) * w, ry = h + 1 + rnd(v, i) * 7, rs = 2.5 + rnd(i + 3, v) * 4.5; x.fillStyle = i % 2 ? '#8a847a' : '#a39c90';
    x.beginPath(); x.moveTo(rx - rs, ry + rs * .4); x.lineTo(rx - rs * .4, ry - rs * .7); x.lineTo(rx + rs * .8, ry - rs * .4); x.lineTo(rx + rs, ry + rs * .5); x.closePath(); x.fill(); x.lineWidth = 1.2; x.stroke(); }
  return c; }
function mkCar(v) { const c = mk(64 * DK, 40 * DK), x = c.getContext('2d'); x.scale(DK, DK); x.translate(32, 22); x.rotate((rnd(v, 50) - .5) * .5);
  x.lineJoin = 'round'; x.strokeStyle = OL; x.lineWidth = 1.6; x.fillStyle = 'rgba(20,20,30,.3)'; x.beginPath(); x.ellipse(2, 9, 26, 6, 0, 0, 7); x.fill();
  x.fillStyle = ['#a84a3a', '#4a6a9a', '#c8a040', '#6a7a6a'][v % 4]; x.beginPath(); x.moveTo(-24, 6); x.lineTo(-22, -2); x.lineTo(-12, -4); x.lineTo(-6, -12); x.lineTo(10, -12); x.lineTo(16, -4); x.lineTo(24, -2); x.lineTo(24, 6); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#3a4250'; x.fillRect(-4, -10, 7, 6); x.fillRect(5, -10, 7, 6); x.fillStyle = '#222'; for (const q of [-14, 14]) { x.beginPath(); x.arc(q, 7, 4.4, 0, 7); x.fill(); x.stroke(); }
  x.fillStyle = 'rgba(40,20,10,.35)'; x.beginPath(); x.ellipse(-6, 0, 8, 3, 0, 0, 7); x.fill(); return c; }
const DEC4 = { ruin: [], rock: [], crater: [], car: [] };
for (let v = 0; v < 4; v++) { DEC4.ruin.push(mkRuin(v)); DEC4.crater.push(mkCrater(v, PAL4.crater)); DEC4.car.push(mkCar(v)); }
for (let v = 0; v < 6; v++) DEC4.rock.push(mkBoulder(v, PAL4.rock));
function bg3(cx, cy) {
  ctx.save(); ctx.translate(-(((cx % 256) + 256) % 256), -(((cy % 256) + 256) % 256)); ctx.fillStyle = PAT4; ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
  // roads every 660 px: asphalt, pavement kerbs, dashed centre lines, zebra crossings at the junctions
  const RG = 660, RW = 84, hw = RW / 2, onX = v => { const m = ((v % RG) + RG) % RG; return m < hw + 26 || m > RG - hw - 26; };
  const ys = [], xs = [];
  for (let gy = Math.floor(cy / RG); gy <= (cy + H) / RG + 1; gy++) ys.push([gy, gy * RG - cy]);
  for (let gx = Math.floor(cx / RG); gx <= (cx + W) / RG + 1; gx++) xs.push([gx, gx * RG - cx]);
  ctx.fillStyle = 'rgba(206,202,190,.34)';   // pavement strips
  for (const [, y] of ys) ctx.fillRect(0, y - hw - 12, W, RW + 24);
  for (const [, x] of xs) ctx.fillRect(x - hw - 12, 0, RW + 24, H);
  ctx.fillStyle = '#3c3e48';   // asphalt
  for (const [, y] of ys) ctx.fillRect(0, y - hw, W, RW);
  for (const [, x] of xs) ctx.fillRect(x - hw, 0, RW, H);
  ctx.fillStyle = 'rgba(20,20,28,.5)';   // kerb shadow (bottom/right) and lit kerb (top/left)
  for (const [, y] of ys) ctx.fillRect(0, y + hw - 3, W, 3);
  for (const [, x] of xs) ctx.fillRect(x + hw - 3, 0, 3, H);
  ctx.fillStyle = 'rgba(236,234,226,.6)';
  for (const [, y] of ys) ctx.fillRect(0, y - hw, W, 2);
  for (const [, x] of xs) ctx.fillRect(x - hw, 0, 2, H);
  ctx.fillStyle = '#3c3e48'; for (const [, y] of ys) for (const [, x] of xs) ctx.fillRect(x - hw, y - hw, RW, RW);   // junction boxes
  ctx.fillStyle = 'rgba(240,200,80,.7)';
  // dashes are indexed by whole 60 px cells (2026-11-14: floor((x + cx) / 60) on a float camera sometimes landed one cell low,
  // so dashes blinked on and off as you moved; iPhone's fractional positions hit it constantly)
  { const i0 = Math.floor(cx / 60), j0 = Math.floor(cy / 60);
    for (const [gy, y] of ys) for (let i = i0; i * 60 - cx < W; i++) { const x = i * 60 - cx; if (!onX(i * 60 + 15) && hash(i, gy) > .2) ctx.fillRect(x, y - 2, 30, 4); }
    for (const [gx, x] of xs) for (let j = j0; j * 60 - cy < H; j++) { const y = j * 60 - cy; if (!onX(j * 60 + 15) && hash(gx, j) > .2) ctx.fillRect(x - 2, y, 4, 30); } }
  ctx.fillStyle = 'rgba(236,236,230,.62)';   // zebra crossings on all four sides of each junction
  for (const [gy, y] of ys) for (const [gx, x] of xs) for (let i = 0; i < 5; i++) { const o = -hw + 8 + i * 15.5, w = hash(gx * 7 + i, gy) > .12;
    if (w) { ctx.fillRect(x - hw - 24, y + o, 18, 7); ctx.fillRect(x + hw + 6, y + o, 18, 7); ctx.fillRect(x + o, y - hw - 24, 7, 18); ctx.fillRect(x + o, y + hw + 6, 7, 18); } }
  const G = 120;
  for (let gx = Math.floor(cx / G) - 2; gx <= (cx + W) / G; gx++) for (let gy = Math.floor(cy / G) - 2; gy <= (cy + H) / G; gy++) {
    const wx = gx * G + hash(gy + 3, gx + 1) * G, wy = gy * G + hash(gx + 9, gy + 5) * G;
    const onRoad = Math.abs(((wx % RG) + RG) % RG - 0) < RW || Math.abs(((wx % RG) + RG) % RG - RG) < RW || Math.abs(((wy % RG) + RG) % RG) < RW || Math.abs(((wy % RG) + RG) % RG - RG) < RW;
    const h = hash(gx + 31, gy + 17), x = wx - cx, y = wy - cy, v = (hash(gx + 2, gy + 23) * 1000) | 0;
    if (onRoad) { if (h < .05) dImg(DEC4.car[v % 4], x, y, v & 1); else if (h < .1) dImg(DEC4.crater[v % 4], x, y); continue; }
    if (h < .1) dImg(DEC4.ruin[v % 4], x, y - 20, v & 1);
    else if (h < .24) dImg(DEC4.rock[v % 6], x, y, v & 1);
    else if (h < .31) dImg(DEC4.crater[v % 4], x, y);
  }
}
// Cell Games ring: a square stone arena with corner posts
function drawRing(cx, cy) {
  const g = S.cgr; if (!g) return; const x0 = g.x - g.R - cx, y0 = g.y - g.R - cy, s = g.R * 2;
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x0 + 10, y0 + 14, s, s);
  ctx.fillStyle = '#d8d2c2'; ctx.fillRect(x0, y0, s, s);
  ctx.strokeStyle = 'rgba(120,110,95,.55)'; ctx.lineWidth = 1.5; const tl = 64;
  ctx.beginPath(); for (let a = 0; a <= s; a += tl) { ctx.moveTo(x0 + a, y0); ctx.lineTo(x0 + a, y0 + s); ctx.moveTo(x0, y0 + a); ctx.lineTo(x0 + s, y0 + a); } ctx.stroke();
  ctx.strokeStyle = OL; ctx.lineWidth = 4; ctx.strokeRect(x0, y0, s, s);
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.strokeRect(x0 + 6, y0 + 6, s - 12, s - 12);
  for (const [px, py] of [[x0, y0], [x0 + s, y0], [x0, y0 + s], [x0 + s, y0 + s]]) { ctx.fillStyle = '#b8b0a0'; ctx.fillRect(px - 9, py - 26, 18, 30); ctx.strokeStyle = OL; ctx.lineWidth = 1.6; ctx.strokeRect(px - 9, py - 26, 18, 30); ctx.fillStyle = '#e8e2d4'; ctx.fillRect(px - 11, py - 30, 22, 6); ctx.strokeRect(px - 11, py - 30, 22, 6); }
  ctx.restore();
}
{ const _bg = bg; bg = function (cx, cy) { if (S.stage != 3) return _bg(cx, cy); bg3(cx, cy); drawRing(cx, cy); }; }
// (the city's colour grade now lives in fx6.js drawAtmos, under the HUD instead of over it)

/* ---------- intro: the hero drops into the ruined city ---------- */
{ const _ip = introPod; introPod = function (c, t, T) { if (S.stage != 3) return _ip(c, t, T); introCity(c, t, T); }; }
function introCity(c, t, T) { }   // the scene itself is drawn in cut6.js

/* ---------- menu, end card, saved runs ---------- */
{ const _m = menu; menu = function () {
    _m(); if (!PROG_READY || V2.welcome3 || !HAS('lvl2')) return;
    const c = ov.querySelector('.in') || ov.querySelector('.card'); if (!c) return;
    const l2 = [...c.querySelectorAll('button.go')].find(b => /start\(2\)/.test(b.getAttribute('onclick') || '')); if (!l2) return;
    l2.insertAdjacentHTML('afterend', HAS('lvl3') ? '<button class="go l3b" onclick="start(3)">Level 3: Androids &amp; Cell<small>Android 16 · 17 · 18 · Cell</small></button>'
      : '<div class="lock">Level 3: Androids &amp; Cell (defeat Frieza to unlock)</div>');
  }; }
{ const _e = endCard; endCard = function (win) {
    const r = _e(win); if (!(win && S.stage == 2 && HAS('lvl3'))) return r;
    const add = '<button class="go" onclick="start(3)">Next: Androids &amp; Cell</button>';
    if (RV) RV.back = RV.back.replace('<button class="go" onclick="start()">', add + '<button class="go" onclick="start()">');
    else { const b = [...ov.querySelectorAll('button')].find(b => b.getAttribute('onclick') == 'start()'); if (b) b.insertAdjacentHTML('beforebegin', add); }
    return r;
  }; }
svPeek = function () { try { const r = JSON.parse(store.getItem(RUNK) || 'null'); if (r && r.v == 1 && r.S && r.S.p && r.stage >= 1 && r.stage <= 3 && r.S.t > 1 && r.S.p.hp > 0) return r; } catch (e) { } return null; };
{ const _w = svWelcome; svWelcome = function () { const r = _w(); if (r && S.stage == 3) { const b = ov.querySelector('.stats b'); if (b) b.textContent = 'City'; } return r; }; }
// Dragon Ball guards in the city are drones
{ const _g = guardBall; guardBall = function (b) { if (S.stage != 3) return _g(b);
    const n = b.n >= 7 ? 4 : 3; for (let i = 0; i < n; i++) { spawnE(i % 2 ? 'drg' : 'dr'); const q = S.en[S.en.length - 1], a = i / n * 6.283;
      q.x = b.x + Math.cos(a) * 70; q.y = b.y + Math.sin(a) * 70; q.elite = 1; q.hp = q.max = q.max * 6; q.r *= 1.4; q.spd *= 1.05; }
    ban('THE DRAGON BALL IS GUARDED!'); }; }

/* ---------- achievements + unlocks ---------- */
Object.assign(UNL_NAME, { 'h:trunks': 'Future Trunks (playable hero)', wish5: 'A 5th wish choice from Shenron', vac2: 'Capsule Vacuum drops more often',
  lvl4: 'Level 4: Majin Buu Saga', fusion: 'Fusion Dance (coming in Level 4)', 'w:sword': 'Shining Sword Attack', 'w:barrier': 'Android Barrier' });
Object.assign(UNL_ICON, { 'h:trunks': '⚔️', wish5: '🌟', vac2: '💊', lvl4: '🍬', fusion: '🤝' });
const L3ACH = [
  { id: 's11', c: 'story', n: 'Infinite Energy', d: 'Defeat Android 19', r: ['p:inf'], t: () => P.bk.a19 },
  { id: 's12', c: 'story', n: 'Hope of the Future', d: 'Defeat Dr. Gero', r: ['h:trunks', 'w:sword'], t: () => P.bk.a20 },
  { id: 's13', c: 'story', n: 'The Real Androids', d: 'Defeat Androids 17 and 18', r: ['w:barrier'], t: () => P.bk.a17 && P.bk.a18 },
  { id: 's14', c: 'story', n: 'Gentle Giant', d: 'Defeat Android 16', r: ['wish5'], t: () => P.bk.a16 },
  { id: 's15', c: 'story', n: 'Bio-Android', d: 'Defeat Imperfect Cell', r: ['vac2'], t: () => P.bk.ce1 },
  { id: 's15b', c: 'story', n: 'Semi-Perfect', d: 'Defeat Semi-Perfect Cell', r: ['z:1500'], t: () => P.bk.ce2 },
  { id: 's16', c: 'story', n: 'The Cell Games', d: 'Defeat Perfect Cell', r: ['lvl4', 'fusion'], t: () => P.bk.ce3 },
  { id: 's16b', c: 'story', n: 'City in Ruins', d: 'Survive 10:00 on Level 3', r: ['z:800'], t: () => S.stage == 3 && !S.endless && S.t >= 600 },
  { id: 'x11', c: 'secret', n: 'Perfect Timing', h: 'Ten seconds is plenty.', d: 'Defeat Perfect Cell during his self-destruct countdown', r: ['z:1200'], t: () => S.cellSD },
  { id: 'x12', c: 'secret', n: 'Behind You!', h: 'Energy cannot be stolen from the back.', d: 'Defeat Android 19 without him absorbing any of your energy', r: ['z:700'], t: () => S.bkr && S.bkr.a19 && !S.a19abs },
  { id: 'x13', c: 'secret', n: 'Twin Takedown', h: 'Two at once.', d: 'Defeat Androids 17 and 18 within 10 seconds of each other', r: ['z:900'], t: () => S.a78 && S.a78.a17 && S.a78.a18 && Math.abs(S.a78.a17 - S.a78.a18) <= 10 }
];
for (const [k, c] of Object.entries(GC)) L3ACH.push({ id: 'c' + k + '3', c: 'chal', n: c.n + ' III', d: `Clear Level 3 with ${c.n} on`, r: ['z:1200'], ev: 'win', t: () => S.stage == 3 && S.gc && S.gc[k] });
for (const a of L3ACH) { ACH.push(a); ACH_BY[a.id] = a; }
