/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — LEVEL 4: MAJIN BUU SAGA (EXPANSION_PLAN.md §9)
   Babidi's ship → rocky wasteland → ruined candy city ·
   Majin fighters, Buu blobs that split, demon imps ·
   Pui Pui, Yakon, Dabura, Majin Vegeta, Majin Buu (Fat → Super → Kid).
   ===================================================================== */
'use strict';

/* ---------- enemies + bosses ---------- */
Object.assign(TYPES, {
  mj: { n: 'Majin Fighter', hp: 22, spd: 64, r: 12, xp: 2 },
  imp: { n: 'Demon Imp', hp: 16, spd: 60, r: 11, xp: 3 },
  bb: { n: 'Buu Blob', hp: 22, spd: 56, r: 14, xp: 3 },
  bs: { n: 'Blob Bit', hp: 8, spd: 84, r: 8, xp: 1 },
  pui: { n: 'Pui Pui', hp: 3600, spd: 96, r: 21, boss: 1, xp: 80 },
  yak: { n: 'Yakon', hp: 5200, spd: 74, r: 30, boss: 1, xp: 90 },
  dab: { n: 'Dabura', hp: 6000, spd: 90, r: 24, boss: 1, xp: 100 },
  mveg: { n: 'Majin Vegeta', hp: 8000, spd: 104, r: 22, boss: 1, xp: 120 },
  bu1: { n: 'Majin Buu', hp: 9000, spd: 66, r: 34, boss: 1, xp: 130 },
  bu2: { n: 'Super Buu', hp: 13000, spd: 104, r: 26, boss: 1, xp: 160 },
  bu3: { n: 'Kid Buu', hp: 20000, spd: 122, r: 20, boss: 1, xp: 260 }
});
const L4BOSS = { pui: 1.8, yak: 1.4, dab: 1.6, mveg: 1.5, bu1: 1.4, bu2: 1.5, bu3: 1.9 };
{ const _b = DIFF.boss; DIFF.boss = k => L4BOSS[k] ? L4BOSS[k] * (.6 + .4 * DF[DLV]) : _b(k); }
const L4HP = 1.05, L4THIN = .5;   // mob HP multiplier; share of regular spawns skipped
{ const _h = DIFF.hp; DIFF.hp = t => _h(t) * (S.stage == 4 ? L4HP * (.7 + .3 * Math.min(1, t / 240)) : 1); }

STAGES[4] = { open: 'BABIDI HAS AWAKENED HIS MAJIN!', final: 'bu3', win: 'Kid Buu is gone. The universe is safe, thanks to you!',
  sched: [[60, 'swarm', 'BUU BLOBS!'], [90, 'pui', 'PUI PUI!'], [180, 'yak', 'YAKON!'], [225, 'swarm', 'A RING OF MAJIN!'],
    [270, 'dab', 'DABURA, KING OF THE DEMON REALM!'], [360, 'mveg', 'MAJIN VEGETA!'], [410, 'swarm', 'THE BLOBS ARE EVERYWHERE!'], [450, 'bu1', 'MAJIN BUU!']] };
INTRO_T[3] = 4.4;
Object.assign(BOSSCARD, {
  pui: ['PUI PUI', 'Majin warrior from planet Zoon'], yak: ['YAKON', 'Majin beast who devours light'], dab: ['DABURA', 'King of the Demon Realm'],
  mveg: ['MAJIN VEGETA', "Babidi's mark, Vegeta's pride"], bu1: ['MAJIN BUU', 'The pink terror'], bu2: ['SUPER BUU', 'Pure evil'], bu3: ['KID BUU', 'The original Majin']
});
Object.assign(BAURA, { pui: '170,140,255', yak: '230,210,90', dab: '255,90,70', mveg: '255,220,70', bu1: '255,130,200', bu2: '255,110,190', bu3: '255,90,180' });
LPAL.pk = ['255,110,190', '255,225,245'];
ESHOT.pk = mkShot('#ff8ad8', '#c0307a'); ESHOT.cy = ESHOT.cy || mkShot('#9ad8ff', '#2a6ad0');

// Older code still asks for Level 1-3 mob kinds (walls, swarms, elites, guards): these become Majin equivalents
const L4MAP = { sai: 'mj', blue: 'mj', fs: 'mj', rap: 'bs', tnk: 'imp', snp: 'imp', dr: 'mj', drg: 'imp', lv: 'bs', cj: 'bb' };
{ const _s = spawnE; spawnE = function (k) {
    if (S.stage == 4) { if (S._pk4) { S._pk4 = 0; if (Math.random() < L4THIN + .2 * Math.max(0, 1 - S.t / 300)) return; } if (L4MAP[k]) k = L4MAP[k]; }
    return _s(k); }; }
{ const _p = pickE; pickE = function () {
    if (S.stage != 4) return _p(); const t = S.t; S._pk4 = 1; let x = Math.random();
    if (t > 150) { if (x < .15) return 'bb'; x -= .15; }   // blobs from 2:30
    if (t > 40 && x < .1) return 'imp';
    return 'mj';
  }; }
{ const _sw = swarm; swarm = function () {   // a ring with one gap: Majin fighters early, Buu blobs later
    if (S.stage != 4) return _sw();
    const R = Math.hypot(W, H) / 2 + 40, n = Math.round(R * 6.283 / 32), g = Math.random() * 6.283;
    for (let i = 0; i < n; i++) { const a = i / n * 6.283; if (Math.abs(Math.atan2(Math.sin(a - g), Math.cos(a - g))) < .3) continue;
      spawnE(S.t > 200 ? 'bs' : 'mj'); const e = S.en[S.en.length - 1]; e.x = S.p.x + Math.cos(a) * R; e.y = S.p.y + Math.sin(a) * R; }
  }; }
{ const _st = start; start = function (st) { const r = _st(st); if (S.stage == 4) Object.assign(S, { eliteT: 50, gz: [], stn: [], spit: [], cdy: [], cpd: [], pb: null, absW: null, root: 0, mph: 0, cpdT: 6 }); return r; }; }
{ const _bd = beanDrop; beanDrop = function (e) { if (S.stage == 4 && !e.boss && !e.elite && Math.random() < .022) { S.lastBean = S.t; return true; } return _bd(e); }; }
{ const _a = awardZeni; awardZeni = function (win) { const z = _a(win); if (S.stage != 4 || S.endless) return z; const x = Math.floor((win ? 500 : 0) + (S.bossK || 0) * 20); META.zeni += x; P.zeni += x; saveMeta(); return z + x; }; }
const arr4 = k => S[k] || (S[k] = []);

/* ---------- mob AI ---------- */
// Majin fighters go berserk below half health
AI.mj = function (e, dt) { if (!e.frz && e.hp < e.max * .5) { e.frz = 1; e.spd *= 1.3; } chase(e, dt, 0); if (near_(e)) hitP(e, DIFF.contact * (e.frz ? 1.1 : 1)); };
AI.bb = AI.bs = function (e, dt) { chase(e, dt, 0); if (near_(e)) hitP(e, DIFF.contact * (e.k == 'bs' ? .7 : 1)); };
AI.imp = function (e, dt) {   // demon imps hover at range and lob pink orbs
  const p = S.p, dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1; e.tm -= dt;
  if (d > 240) chase(e, dt, 0); else if (d < 160) { e.x -= dx / d * e.spd * .7 * dt; e.y -= dy / d * e.spd * .7 * dt; }
  if (e.tm <= 0) { if (Math.abs(dx) > W / 2 + 10 || Math.abs(dy) > H / 2 + 10 || S.eb.length >= 26) e.tm = .6 + Math.random() * .6;
    else { e.tm = 5 + Math.random() * 2.5; S.eb.push({ x: e.x, y: e.y, vx: dx / d * 160, vy: dy / d * 160, l: 3, g: 'pk', dm: e.elite ? 12 : 6 }); } }
  if (near_(e)) hitP(e, DIFF.contact * .8);
};
// Buu blobs split in two when they die
{ const _k = killE; killE = function (e) {
    const was = e.dead; _k(e); if (was || !e.dead || (S.stage != 4 && !S.endless)) return;
    if (e.k == 'bb' && S.stage == 4 && S.en.length < 250) for (const q of [-1, 1]) { spawnE('bs'); const n = S.en[S.en.length - 1]; n.x = e.x + q * 10; n.y = e.y + q * 6; if (e.elite) { n.hp = n.max = n.max * 4; n.r *= 1.3; } }
    if (e.k == 'bu1' || e.k == 'bu2') { const nk = e.k == 'bu1' ? 'bu2' : 'bu3'; spawnE(nk); const n = S.en[S.en.length - 1]; n.x = e.x; n.y = e.y;
      S.flash = 1; boom(e.x, e.y, 130, '#ff9ad8'); ban(nk == 'bu2' ? 'BUU TRANSFORMS: SUPER BUU!' : 'KID BUU, THE ORIGINAL MAJIN!'); S.cdy = []; }
    if (e.k == 'bu2' && S.absW) { ban(INFO[S.absW.k][0].toUpperCase() + ' IS FREE!'); S.absW = null; }
    if (e.k == 'mveg' && e.fx > 0) S.mvegSD = 1;
    if (e.k == 'bu1' && !S.buAte) S.bu1Clean = 1;
  }; }

/* ---------- boss AI ---------- */
const ang4 = (e, x, y) => Math.atan2(y - e.y, x - e.x);
// Pui Pui: x10 gravity zones that slow you, plus quick fans of shots
AI.pui = function (e, dt) {
  const p = S.p, h2 = e.hp < e.max * .5; e.t3 = (e.t3 ?? 2) - dt; e.t4 = (e.t4 ?? 3) - dt;
  if (!dashy(e, dt, h2 ? 3 : 4, 360, .45)) chase(e, dt, 70);
  if (e.t3 <= 0) { e.t3 = h2 ? 2 : 2.6; fan(e, h2 ? 5 : 4, 230, 'pu', 9); }
  if (e.t4 <= 0) { e.t4 = h2 ? 5 : 6.5; const n = h2 ? 4 : 3, a0 = Math.random() * 6.283;
    for (let i = 0; i < n; i++) { const a = a0 + i / n * 6.283, d = i ? 120 : 0; arr4('gz').push({ x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, r: 95, t: 6.5, T: 6.5, w: .8 }); }
    ban('x10 GRAVITY!'); sfxPlay('gravity'); }
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(15); }
};
// Yakon: plunges the world into darkness. Light-based attacks (Solar Flare) feed him, and he shrugs off hits from outside your light.
AI.yak = function (e, dt) {
  const p = S.p, h2 = e.hp < e.max * .5; e.t3 = (e.t3 ?? 3) - dt; e.t4 = (e.t4 ?? 5) - dt;
  if (!dashy(e, dt, h2 ? 3.4 : 4.6, 330, .5)) chase(e, dt, 50);
  if (e.t3 <= 0) { e.t3 = h2 ? 3.2 : 4.2; ring(e, h2 ? 14 : 10, 190, 'or', 10); }
  if (e.t4 <= 0) { e.t4 = h2 ? 5.5 : 7; zone(p.x, p.y, 90, 1, 26); }
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(20); }
};
const YAK_LR = 210;   // radius of your light while Yakon is alive
{ const _af = aFlash; aFlash = function (v) { if (v >= 1) S.lit = S.t; return _af(v); }; }
{ const _h = hitE; hitE = function (e, d) {
    if (e.k == 'yak' && !e.dead) {
      if (S.lit === S.t) { e.hp = Math.min(e.max, e.hp + d * .5); S.yakFed = 1; if (S.nums.length < 40) S.nums.push({ x: e.x, y: e.y - e.r, v: 'FED', l: .6, c: '#fff27a' }); return; }
      if (Math.hypot(e.x - S.p.x, e.y - S.p.y) > YAK_LR + 20) d *= .6;
    }
    return _h(e, d);
  }; }
// Dabura: sword slashes, fire breath, and stone spit that leaves petrifying puddles (they root you)
AI.dab = function (e, dt) {
  const p = S.p, d = Math.hypot(p.x - e.x, p.y - e.y), h2 = e.hp < e.max * .5;
  e.t3 = (e.t3 ?? 2) - dt; e.t4 = (e.t4 ?? 4) - dt; e.t5 = (e.t5 ?? 3) - dt;
  chase(e, dt, 60);
  if (e.t5 <= 0 && d < 170) { e.t5 = h2 ? 1.8 : 2.4; const a = ang4(e, p.x, p.y); lane(e.x, e.y, a, 190, 80, .5, 24, 'or'); e.sl = .5; sfxPlay('dash'); }
  if (e.t3 <= 0) { e.t3 = h2 ? 2.6 : 3.2; fan(e, h2 ? 7 : 5, 240, 'or', 10, .16); }
  if (e.t4 <= 0) { e.t4 = h2 ? 4 : 5; const n = h2 ? 4 : 3;
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, r = i ? 70 + Math.random() * 90 : 0; arr4('spit').push({ x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r, t: .9, T: .9 }); }
    ban('STONE SPIT!'); sfxPlay('orb'); }
  if (e.sl > 0) e.sl -= dt;
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(18); }
};
// Majin Vegeta: Big Bang blasts, Galick lanes, and at low health the Final Explosion (a huge telegraphed blast; run!)
AI.mveg = function (e, dt) {
  const p = S.p, h2 = e.hp < e.max * .5;
  if (e.fx > 0) { e.fx -= dt; e.fl = (e.fx * 5 | 0) % 2 ? .05 : 0;
    if (e.fx <= 0) { boom(e.x, e.y, 360, '#fff6c0'); impact(e.x, e.y, 520, 'wh', .9); aFlash(1); kick(30); e.exh = 7; ban('VEGETA IS EXHAUSTED! FINISH HIM!'); } return; }
  if (e.exh > 0) { e.exh -= dt; return; }
  if (!e.fxd && e.hp < e.max * .2) { e.fxd = 1; e.fx = 4; zone(e.x, e.y, 360, 4, 60); ban('FINAL EXPLOSION! GET AWAY!'); sfxPlay('roar'); return; }
  e.t3 = (e.t3 ?? 2) - dt; e.t4 = (e.t4 ?? 4) - dt; e.t5 = (e.t5 ?? 6) - dt; e.at = Math.max(0, (e.at || 0) - dt);
  if (!dashy(e, dt, h2 ? 3 : 4, 400, .45)) chase(e, dt, 90);
  if (e.t3 <= 0) { e.t3 = h2 ? 1.6 : 2.1; fan(e, h2 ? 5 : 3, 300, 'cy', 10, .14); e.at = .4; }
  if (e.t4 <= 0) { e.t4 = h2 ? 3.4 : 4.4; zone(p.x, p.y, 95, 1, 30); ban('BIG BANG ATTACK!'); e.at = .5; }
  if (e.t5 <= 0) { e.t5 = h2 ? 6 : 8; const a = ang4(e, p.x, p.y); for (let i = -1; i <= 1; i += 2) lane(e.x, e.y, a + i * .14, 1000, 40, .9, 34, 'pu'); ban('GALICK GUN!'); sfxPlay('bosscharge'); e.at = 1; }
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(20); }
};
{ const _h = hitE; hitE = function (e, d) { if (e.k == 'mveg' && e.exh > 0) d *= 1.5; return _h(e, d); }; }
// Fat Buu: turns nearby mobs into candy that floats to him and heals him, regenerates unless you keep hitting him, belly slams
AI.bu1 = function (e, dt) {
  const p = S.p; chase(e, dt, 60); e.t3 = (e.t3 ?? 3) - dt; e.t4 = (e.t4 ?? 5) - dt; e.t5 = (e.t5 ?? 4) - dt;
  if (S.t - (e.lh || 0) > 4) { e.hp = Math.min(e.max, e.hp + e.max * .002 * dt); e.rg = 1; } else e.rg = 0;
  if (e.t3 <= 0) { e.t3 = 3; fan(e, 4, 210, 'pk', 11); }
  if (e.t5 <= 0) { e.t5 = 6; zone(e.x, e.y, 150, .9, 28); }
  if (e.t4 <= 0) { e.t4 = 8; let n = 0; e.cb = [];
    for (const o of S.en) { if (o.dead || o.boss || n >= 4 || Math.hypot(o.x - e.x, o.y - e.y) > 380) continue; n++; o.dead = 1; e.cb.push([o.x, o.y]); arr4('cdy').push({ x: o.x, y: o.y, s: Math.random() * 6 }); }
    if (n) { e.cbT = .5; ban('BUU TURNS THEM INTO CANDY!'); sfxPlay('candy'); } }
  if (e.cbT > 0) e.cbT -= dt;
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(22); }
};
// Super Buu: absorbs one of your attacks for 15 s (it stops firing), fans of shots, a rain of blasts
AI.bu2 = function (e, dt) {
  const p = S.p, h2 = e.hp < e.max * .5; e.t3 = (e.t3 ?? 2) - dt; e.t4 = (e.t4 ?? 6) - dt; e.t5 = (e.t5 ?? 8) - dt;
  if (!dashy(e, dt, h2 ? 2.8 : 3.8, 420, .45)) chase(e, dt, 80);
  if (e.t3 <= 0) { e.t3 = h2 ? 1.7 : 2.2; fan(e, h2 ? 7 : 5, 260, 'pk', 12, .17); }
  if (e.t5 <= 0) { e.t5 = h2 ? 7 : 9; for (let i = 0; i < 7; i++) { const a = Math.random() * 6.283, r = i ? 60 + Math.random() * 200 : 0; zone(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, 62, 1 + i * .08, 26); } ban('HUMAN EXTINCTION ATTACK!'); }
  if (e.t4 <= 0 && !S.absW) { e.t4 = 22; const ks = Object.keys(S.w).filter(k => S.w[k] > 0 && !['disc', 'barrier', 'after', 'tks'].includes(k) && INFO[k]);
    if (ks.length) { const k = ks[Math.random() * ks.length | 0]; S.absW = { k, t: 15 }; ban('SUPER BUU ABSORBED YOUR ' + INFO[k][0].replace('★ ', '').toUpperCase() + '!'); sfxPlay('tele'); boom(e.x, e.y, 70, '#ff9ad8'); } }
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(22); }
};
// Kid Buu: teleports all over the place, and Planet Burst: the whole screen explodes except a few safe spots
AI.bu3 = function (e, dt) {
  const p = S.p, h2 = e.hp < e.max * .5; e.t3 = (e.t3 ?? 1.5) - dt; e.t4 = (e.t4 ?? 9) - dt; e.t5 = (e.t5 ?? 3) - dt;
  if (!S.pb) chase(e, dt, 70);
  if (e.t5 <= 0 && !S.pb) { e.t5 = h2 ? 2.2 : 3; const a = Math.random() * 6.283, r = 140 + Math.random() * 90; boom(e.x, e.y, 40, '#ff9ad8');
    e.x = p.x + Math.cos(a) * r; e.y = p.y + Math.sin(a) * r; sfxPlay('tele'); ring(e, h2 ? 12 : 8, 210, 'pk', 11); }
  if (e.t3 <= 0 && !S.pb) { e.t3 = h2 ? 1.4 : 1.9; fan(e, 3, 320, 'pk', 12, .12); }
  if (e.t4 <= 0 && !S.pb) { e.t4 = h2 ? 13 : 16; const a0 = Math.random() * 6.283, safe = [];
    for (let i = 0; i < 3; i++) { const a = a0 + i * 2.094 + (Math.random() - .5) * .5, r = 150 + Math.random() * 90; safe.push({ x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r, r: 62 }); }
    S.pb = { t: 0, T: 2.8, safe }; ban('PLANET BURST! FIND A SAFE SPOT!'); sfxPlay('roar'); }
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(22); }
};
{ const _h = hitE; hitE = function (e, d) { if (e.k == 'bu1') e.lh = S.t; return _h(e, d); }; }

/* ---------- per-frame: zones, puddles, candy, darkness, Planet Burst, map phases, boss hand-offs ---------- */
const L4WAIT = { yak: ['pui'], dab: ['yak'], mveg: ['dab'], bu1: ['mveg'] };
const mph4 = () => { const t = S.endless ? (S.t % 300) * 1.5 : S.t; return t < 200 ? 0 : t < 380 ? 1 : 2; };   // 0 Babidi's ship, 1 wasteland, 2 candy city
{ const _u = update; update = function (dt) {
    if (S.stage != 4 || S.mode != 'play') return _u(dt);
    const p = S.p, x0 = p.x, y0 = p.y, r = _u(dt);
    if (S.mode != 'play') return r;
    if (S.root > 0) { S.root -= dt; p.x = x0; p.y = y0; }
    // map phases
    const ph = mph4(); if (ph != S.mph) { S.mph = ph; if (ph) S.flash = Math.max(S.flash, .6); if (ph) ban(ph == 1 ? "THE BATTLE SPILLS OUT OF BABIDI'S SHIP!" : 'BUU IS LOOSE IN THE CITY!'); }
    // Pui Pui's gravity zones
    for (const z of arr4('gz')) { z.t -= dt; if (z.T - z.t > z.w && Math.hypot(p.x - z.x, p.y - z.y) < z.r) S.slow = Math.max(S.slow || 0, .12); }
    S.gz = arr4('gz').filter(z => z.t > 0);
    // Dabura's stone spit and puddles
    for (const s of arr4('spit')) { s.t -= dt; if (s.t <= 0) { arr4('stn').push({ x: s.x, y: s.y, r: 52, t: 7 }); if (Math.hypot(p.x - s.x, p.y - s.y) < 52) bossHurt(10); } }
    S.spit = arr4('spit').filter(s => s.t > 0);
    for (const z of arr4('stn')) { z.t -= dt; if (!z.hit && !(S.inv > 0) && Math.hypot(p.x - z.x, p.y - z.y) < z.r) { z.hit = 1; z.t = Math.min(z.t, .5); S.root = 1.1; S.stoned = 1; ban('PETRIFIED!'); sfxPlay('hurt'); } }
    S.stn = arr4('stn').filter(z => z.t > 0);
    // Fat Buu's candy floats to him; grab it first
    const bu = S.en.find(e => e.k == 'bu1' && !e.dead);
    for (const c of arr4('cdy')) { if (Math.hypot(p.x - c.x, p.y - c.y) < 26) { c.got = 1; p.hp = Math.min(p.max, p.hp + 3); sfx('gem'); continue; }
      if (!bu) { c.got = 1; continue; } const dx = bu.x - c.x, dy = bu.y - c.y, d = Math.hypot(dx, dy) || 1;
      if (d < bu.r) { c.got = 1; bu.hp = Math.min(bu.max, bu.hp + bu.max * .004); S.buAte = 1; if (S.nums.length < 40) S.nums.push({ x: bu.x, y: bu.y - bu.r, v: 'YUM!', l: .6, c: '#ff9ad8' }); continue; }
      c.x += dx / d * 70 * dt; c.y += dy / d * 70 * dt; }
    S.cdy = arr4('cdy').filter(c => !c.got);
    // Super Buu's absorbed attack can't fire
    if (S.absW) { S.absW.t -= dt; if (S.absW.t <= 0) { ban(INFO[S.absW.k][0].replace('★ ', '').toUpperCase() + ' IS BACK!'); S.absW = null; } else if (S.cd[S.absW.k] !== undefined) S.cd[S.absW.k] = Math.max(S.cd[S.absW.k], .5); }
    // Kid Buu's Planet Burst
    if (S.pb) { S.pb.t += dt; if (S.pb.t >= S.pb.T) { const safe = S.pb.safe.some(s => Math.hypot(p.x - s.x, p.y - s.y) < s.r + 6);
        if (!safe) { bossHurt(p.max * .45); kick(26); } else { S.pbOk = (S.pbOk || 0) + 1; ban('SAFE!'); }
        aFlash(1); impact(p.x, p.y, 700, 'pu', .8); S.pb = null; } }
    // candy puddles in the city slow you down
    if (ph == 2 && !S.endless) { S.cpdT = (S.cpdT ?? 6) - dt; if (S.cpdT <= 0 && arr4('cpd').length < 6) { S.cpdT = 8; const a = Math.atan2(S.mvy || Math.random() - .5, S.mvx || Math.random() - .5) + (Math.random() - .5) * 1.2, d = 160 + Math.random() * 120;
        arr4('cpd').push({ x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, r: 46 + Math.random() * 20, t: 14, s: Math.random() * 6 }); } }
    for (const c of arr4('cpd')) { c.t -= dt; if (Math.hypot(p.x - c.x, p.y - c.y) < c.r) S.slow = Math.max(S.slow || 0, .12); }
    S.cpd = arr4('cpd').filter(c => c.t > 0);
    // each boss waits until the one before is down (+15 s), never more than 75 s late
    if (S.sch && !S.endless) for (const q of S.sch) { const need = L4WAIT[q.k]; if (!need || q.d) continue; if (q.t0 === undefined) q.t0 = q.t;
      const alive = S.en.some(e => need.includes(e.k) && !e.dead), seen = need.every(k => S.sch.some(s => s.k == k && s.d));
      if (alive || (seen && !q.gd)) { if (!alive) q.gd = 1; q.t = Math.min(q.t0 + 75, Math.max(q.t0, S.t + 15)); } }
    return r;
  }; }

/* ---------- art: bosses ---------- */
const B5 = {
  pui: { sc: 1, w: .96, sk: '#a8c0e0', pn: '#5a3a8a', top: '#6a3a9a', ar: '#e8c040', bt: '#3a2a5a', bt2: '#e8c040', belt: '#e8c040', gl: '#f0f0f4', head: 'helm', arm: '#a8c0e0', eye: ['#ffe27a', '#c89010', '#3a2004'] },
  yak: { sc: 1.06, w: 1.5, sk: '#d8c43a', pn: '#4a2a5a', top: '#d8c43a', bt: '#4a2a5a', bt2: '#2a1a34', belt: '#4a2a5a', arm: '#d8c43a', head: 'yak', spots: 1, eye: ['#fffbe0', '#f0e080', '#c0a020'] },
  dab: { sc: 1, w: 1.08, sk: '#d04a3a', pn: '#24242e', top: '#24242e', ar: '#f0eef4', bt: '#24242e', bt2: '#e8c040', belt: '#e8c040', gl: '#d04a3a', arm: '#24242e', head: 'dab', cape: ['#f0eef4', '#8a1a1a'], eye: ['#fff07a', '#e0b020', '#5a3a04'] },
  bu1: { sc: 1, w: 1, sk: '#f8a8cc', pn: '#f6f4f0', top: '#f8a8cc', ar: '#3a2a5a', bt: '#e8c040', bt2: '#c08a10', belt: '#24242e', gl: '#f6f4f0', arm: '#f8a8cc', head: 'fbuu', fat: 1, cape: ['#6a3a9a', '#3a1a5a'], m: 1 },
  bu2: { sc: 1, w: 1.08, sk: '#f69ac4', pn: '#f6f4f0', top: '#f69ac4', ar: '#1e1e26', bt: '#1e1e26', bt2: '#e8c040', belt: '#1e1e26', gl: '#f69ac4', arm: '#f69ac4', head: 'sbuu', m: 1, rage: 'pu', thr: .4 },
  bu3: { sc: 1, w: .92, sk: '#f69ac4', pn: '#f6f4f0', top: '#f69ac4', bt: '#1e1e26', bt2: '#e8c040', belt: '#1e1e26', gl: '#f69ac4', arm: '#f69ac4', head: 'kbuu', m: 1, rage: 'pu', thr: .3 }
};
for (const k in B5) B3[k] = { l4: 1, sc: 1 };
B3.mveg = { l4: 1, sc: 1 };
{ const _b = bossArt3; bossArt3 = function (c, x, y, r, t, e) { return B3[e.k] && B3[e.k].l4 ? (e.k == 'mveg' ? drawMVeg(c, x, y, r, t, e) : bossArt5(c, x, y, r, t, e)) : _b(c, x, y, r, t, e); }; }
function mMark(c, x, y, s, col) {   // Babidi's "M"
  c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col || '#c81818'; c.lineWidth = 1.1; c.lineJoin = 'miter'; c.lineCap = 'butt';
  c.beginPath(); c.moveTo(-2.2, 1.6); c.lineTo(-1.6, -1.6); c.lineTo(0, .4); c.lineTo(1.6, -1.6); c.lineTo(2.2, 1.6); c.stroke(); c.restore();
}
function buuEyes(c, kind, ey) {
  for (const q of [-1, 1]) { const ex = q * 4.2;
    if (kind == 'fbuu') { c.strokeStyle = OL; c.lineWidth = 1.6; c.beginPath(); c.arc(ex, ey + 1, 2.2, 3.4, 6.0); c.stroke(); continue; }
    c.save(); c.beginPath(); c.ellipse(ex, ey, 2.8, kind == 'kbuu' ? 2.2 : 1.8, q * .2, 0, 7); c.fillStyle = '#0c0c10'; c.fill(); c.lineWidth = .9; c.strokeStyle = OL; c.stroke(); c.clip();
    c.fillStyle = '#e8202a'; c.beginPath(); c.arc(ex + q * .3, ey + .2, 1.1, 0, 7); c.fill(); c.restore();
    c.strokeStyle = OL; c.lineWidth = 1.8; c.beginPath(); c.moveTo(q * 7.6, ey - 3.4); c.lineTo(q * 1.4, ey - 1.6); c.stroke(); }
}
function bossArt5(c, x, y, r, t, e) {
  const o = B5[e.k], k = r / 20 * o.sc, w = o.w, sd = e.sd || (e.sd = Math.random() * 6);
  const bob = Math.sin(t * 5 + sd) * (o.fat ? 1.8 : 1.1), sw = Math.sin(t * 5 + sd);
  const SK = tones(o.sk, '#5a1a30'), PN = tones(o.pn, '#5a5a70'), TOP = tones(o.top, '#2a1430'), BT = tones(o.bt), BT2 = tones(o.bt2, '#5a3a08'), BL = tones(o.belt, '#000000'), ARM = tones(o.arm, '#2a1430'), GL = o.gl ? tones(o.gl, '#5a5a70') : SK;
  if (o.rage && e.hp < e.max * o.thr) { LT(); gl(o.rage, x, y, r * 2.4, .5 + .1 * Math.sin(t * 10)); NM(); }
  if (e.k == 'bu1' && e.rg) { LT(); gl('wh', x, y, r * 1.8, .18 + .08 * Math.sin(t * 6)); NM(); }
  c.save(); c.translate(x, y + bob); c.scale(k, k); c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 1.5; c.strokeStyle = OL;
  // cape (Dabura, Fat Buu)
  if (o.cape) { const fl = Math.sin(t * 4 + sd) * 1.5; hpoly(c, [[-10 * w, -8], [10 * w, -8], [15 * w + fl, 25], [-15 * w + fl, 25]], tones(o.cape[1], '#100010'), { lw: 1.3 });
    if (e.k == 'dab') hpoly(c, [[-10 * w, -8], [-6 * w, -8], [-11 * w + fl, 25], [-15 * w + fl, 25]], tones(o.cape[0], '#6a6a80'), { lw: 1.1 }); }
  if (o.fat) {   // Fat Buu: puffy pants, round belly, little arms
    for (const q of [-1, 1]) { const lx = q * 7, st = q * sw * 1.2; hell(c, lx, 15 + st * .3, 7.4, 7, PN); hpoly(c, [[lx - 5.6, 21 + st], [lx + 5.6, 21 + st], [lx + 6.4, 27 + st], [lx - 6.4, 27 + st]], BT); }
    hell(c, 0, 0, 17, 15.5, SK); c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(-6, -5, 6, 4, -.5, 0, 7); c.fill();
    for (const q of [-1, 1]) hpoly(c, [[q * 6, -13], [q * 13, -10], [q * 16.6, -2], [q * 12, 2], [q * 7, -6]], tones(o.ar, '#100a1a'), { lw: 1.2 });
    for (const q of [-1, 1]) { c.strokeStyle = '#e8c040'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(q * 6, -13); c.lineTo(q * 7, -6); c.lineTo(q * 12, 2); c.stroke(); c.strokeStyle = OL; }
    hpoly(c, [[-15, 8], [15, 8], [14, 12], [-14, 12]], BL, { lw: 1.2 }); hpoly(c, [[-3, 7.4], [3, 7.4], [3, 12.6], [-3, 12.6]], tones('#e8c040', '#6a4a08'), { lw: 1 }); mMark(c, 0, 10, .9, '#3a2a10');
    for (const q of [-1, 1]) { const hx = q * 20, hy = 2 + q * sw * 1.6; hlimb(c, [[q * 14, -6], [q * 18, -2], [hx, hy]], 6, ARM); fist(c, hx, hy + 1.6, 1.5708, 3.6, GL); }
  } else {
    // legs: baggy pants for the Buus, regular trousers otherwise
    for (const q of [-1, 1]) { const lx = q * 4.4 * w, st = q * sw * .9, by = 24 + st, bag = o.head == 'sbuu' || o.head == 'kbuu';
      if (bag) { hell(c, lx, 15 + st * .3, 5.4 * w, 7, PN); } else hpoly(c, [[lx - 3.8 * w, 9], [lx + 3.8 * w, 9], [lx + 3.4 * w, 21 + st], [lx - 3.4 * w, 21 + st]], PN);
      hpoly(c, [[lx - 4.6 * w, by - 5.4], [lx + 4.6 * w, by - 5.4], [lx + 5.6 * w, by + 1.6], [lx - 5.6 * w, by + 1.6]], BT);
      hpoly(c, [[lx - 4.6 * w, by - 5.4], [lx + 4.6 * w, by - 5.4], [lx + 4.6 * w, by - 3.6], [lx - 4.6 * w, by - 3.6]], BT2, { lw: 1, ns: 0 }); }
    hpoly(c, [[-9.4 * w, -7], [9.4 * w, -7], [10 * w, 12], [-10 * w, 12]], TOP);
    if (o.spots) { c.fillStyle = 'rgba(90,50,10,.45)'; for (const [sx, sy, sr] of [[-5, -3, 1.6], [4, 1, 1.3], [-2, 6, 1.1], [6, -4, 1]]) { c.beginPath(); c.arc(sx * w, sy, sr * 1.4, 0, 7); c.fill(); } }
    if (o.head == 'sbuu' || o.head == 'kbuu') { c.strokeStyle = 'rgba(160,40,90,.5)'; c.lineWidth = .9; c.beginPath(); c.moveTo(0, -5); c.lineTo(0, 4); c.moveTo(-6 * w, -1); c.quadraticCurveTo(-3 * w, 1, 0, -1); c.quadraticCurveTo(3 * w, 1, 6 * w, -1); c.stroke(); c.strokeStyle = OL; }
    if (o.ar && o.head == 'sbuu') for (const q of [-1, 1]) hpoly(c, [[q * 9.4 * w, -7], [q * 4.6 * w, -7], [q * 5.4 * w, 7], [q * 9.4 * w, 7]], tones(o.ar, '#000000'), { lw: 1.1 });
    if (o.head == 'helm') { hpoly(c, [[-9.2 * w, -7], [9.2 * w, -7], [8.4 * w, 5], [-8.4 * w, 5]], tones('#7a4aaa', '#2a1440')); for (const q of [-1, 1]) hell(c, q * 10.6 * w, -6.6, 4.4, 3.2, tones('#e8c040', '#5a3a08')); }
    if (e.k == 'dab') { hpoly(c, [[-4.4, -8], [4.4, -8], [0, 3]], tones(o.ar, '#6a6a80'), { lw: 1.1 }); hell(c, 0, -6.4, 2.2, 2.2, tones('#e8c040', '#5a3a08')); }
    hpoly(c, [[-9.6 * w, 7.6], [9.6 * w, 7.6], [9.6 * w, 11], [-9.6 * w, 11]], BL, { lw: 1.3 });
    if (o.m) { hpoly(c, [[-2.6, 7], [2.6, 7], [2.6, 11.6], [-2.6, 11.6]], tones('#e8c040', '#6a4a08'), { lw: 1 }); mMark(c, 0, 9.3, .8, '#3a2a10'); }
    for (const q of [-1, 1]) { const sx = q * 10.4 * w, hx = q * (14 * w + .6), hy2 = 7 + q * sw * 1.3, mx = q * 13.8 * w;
      let px = hx, py = hy2; if (e.k == 'dab' && q == 1 && e.sl > 0) { px = hx + 6; py = -2; }
      hlimb(c, [[sx, -5], [mx, 1], [px, py]], o.head == 'yak' ? 7.6 : 5.8, ARM); fist(c, px, py + 2.4, 1.5708, o.head == 'yak' ? 4.2 : 3.2, GL);
      if (e.k == 'dab' && q == 1) { c.save(); c.translate(px, py + 2); c.rotate(e.sl > 0 ? -.4 : .9); hpoly(c, [[-1.2, 0], [1.2, 0], [1, 20], [0, 23], [-1, 20]], tones('#d8dce8', '#4a4e60'), { lw: 1 }); hpoly(c, [[-3, -.6], [3, -.6], [3, 1], [-3, 1]], tones('#e8c040', '#5a3a08'), { lw: .9 }); c.restore(); } }
    hpoly(c, [[-3.2, -9], [3.2, -9], [3.6, -4.4], [-3.6, -4.4]], SK, { ns: 1 });
  }
  // head
  c.save(); c.translate(0, o.fat ? -17 : -16); const hs = o.head == 'yak' ? 1.2 : o.head == 'kbuu' ? .95 : 1;
  if (o.head == 'sbuu' || o.head == 'kbuu' || o.head == 'fbuu') {   // the antenna
    const wv = Math.sin(t * 3 + sd) * 2, L = o.head == 'fbuu' ? .55 : o.head == 'kbuu' ? 1.1 : 1.4;
    hlimb(c, [[0, -8], [-4 + wv * .3, -16 * L], [-10 + wv, -20 * L], [-16 + wv * 1.3, -14 * L - (o.head == 'fbuu' ? -4 : 0)]], 3.6, SK); }
  if (o.head == 'yak') for (const q of [-1, 1]) hpoly(c, [[q * 8, -6], [q * 19, -16], [q * 12, 0]], SK, { lw: 1.3 });
  if (o.head == 'dab') { for (const q of [-1, 1]) { hpoly(c, [[q * 9, -1], [q * 15, -5], [q * 10, 4]], SK, { lw: 1.2 }); hpoly(c, [[q * 4, -8], [q * 6.4, -15], [q * 7.4, -7]], tones('#f0eef4', '#6a6a80'), { lw: 1 }); } }
  hell(c, 0, 0, 9.8 * hs, 9.4 * hs, SK);
  c.save(); c.beginPath(); c.ellipse(0, 0, 9.8 * hs, 9.4 * hs, 0, 0, 7); c.clip(); c.fillStyle = 'rgba(120,30,60,.16)'; c.beginPath(); c.ellipse(0, 9, 9, 3.4, 0, 0, 7); c.fill();
  if (o.head == 'helm') { const g = c.createLinearGradient(0, -10, 0, -1); g.addColorStop(0, '#7a9ae0'); g.addColorStop(1, '#3a4a90'); c.fillStyle = g; c.beginPath(); c.ellipse(0, -2, 11 * hs, 8.6 * hs, 0, 3.1416, 6.2832); c.fill(); c.strokeStyle = OL; c.lineWidth = 1.2; c.stroke(); }
  if (o.head == 'dab') { c.fillStyle = '#f0eef4'; c.beginPath(); c.ellipse(0, -7, 10, 5, 0, 3.1416, 6.2832); c.fill(); }
  if (o.spots) { c.fillStyle = 'rgba(90,50,10,.45)'; for (const [sx, sy] of [[-5, -5], [5, -6], [0, -8]]) { c.beginPath(); c.arc(sx, sy, 1.5, 0, 7); c.fill(); } }
  if (o.head == 'sbuu' || o.head == 'kbuu' || o.head == 'fbuu') { c.fillStyle = 'rgba(150,40,90,.6)'; for (const q of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(q * 8.4, -4 + i * 2.6, .7, 0, 7); c.fill(); } }
  c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(-4, -5, 3, 1.6, -.4, 0, 7); c.fill(); c.restore();
  if (o.head == 'helm') { hpoly(c, [[-1.4, -10], [0, -20], [1.4, -10]], tones('#f6f6fa', '#7a7a8a'), { lw: 1.1 }); mMark(c, 0, -5.4, .9, '#e8202a'); }
  if (o.head == 'dab') { hpoly(c, [[-9, -4], [-7, -10], [-3, -7], [0, -11], [3, -7], [7, -10], [9, -4], [6, -6], [0, -6.6], [-6, -6]], tones('#f6f6fa', '#8a8a9a'), { lw: 1.1 }); mMark(c, 0, -2.2, .85, '#1a1a1a'); }
  if (o.head == 'yak') mMark(c, 0, -5, 1, '#3a1a4a');
  // eyes + mouth
  const ey = 1.6;
  if (o.head == 'sbuu' || o.head == 'kbuu' || o.head == 'fbuu') buuEyes(c, o.head, ey);
  else for (const q of [-1, 1]) { const ex = q * 4.4 * hs, ir = o.eye, glow = o.head == 'yak';
    c.save(); c.beginPath(); c.ellipse(ex, ey, 2.9, 2.2, q * .14, 0, 7); c.fillStyle = glow ? ir[0] : '#fffdf4'; c.fill(); c.lineWidth = .9; c.stroke(); c.clip();
    if (!glow) { const g = c.createRadialGradient(ex, ey, .2, ex, ey, 2.4); g.addColorStop(0, ir[0]); g.addColorStop(.55, ir[1]); g.addColorStop(1, ir[2]); c.fillStyle = g; c.beginPath(); c.ellipse(ex + .4, ey + .2, 1.8, 2.2, 0, 0, 7); c.fill();
      c.fillStyle = '#050508'; c.beginPath(); c.ellipse(ex + .5, ey + .25, .7, 1.2, 0, 0, 7); c.fill(); }
    glint(c, ex - .1, ey - .6, .5); c.restore();
    c.strokeStyle = OL; c.lineWidth = 2.1; c.beginPath(); c.moveTo(q * 8.8 * hs, ey - 4.2); c.lineTo(q * 1.2, ey - 1.6); c.stroke(); }
  c.strokeStyle = OL; c.lineWidth = 1.3;
  if (o.head == 'fbuu') { c.beginPath(); c.moveTo(-5, 6); c.quadraticCurveTo(0, 11.6, 5, 6); c.closePath(); c.fillStyle = '#7a1414'; c.fill(); c.stroke(); }
  else if (o.head == 'yak' || o.head == 'kbuu') { c.beginPath(); c.moveTo(-5.6, 6); c.quadraticCurveTo(0, 10.6, 5.6, 6); c.closePath(); c.fillStyle = '#5a0a14'; c.fill(); c.stroke();
    c.fillStyle = '#fff'; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 2 - .9, 6.4); c.lineTo(i * 2 + .9, 6.4); c.lineTo(i * 2, 8); c.closePath(); c.fill(); } }
  else if (o.head == 'sbuu') { c.beginPath(); c.moveTo(-3.4, 7.8); c.quadraticCurveTo(0, 6.4, 3.4, 7.8); c.stroke(); }
  else { c.beginPath(); c.moveTo(-3, 8); c.quadraticCurveTo(.4, 9, 3.2, 7.4); c.stroke(); }
  c.restore(); c.restore();
  // Fat Buu's candy beam lines
  if (e.cbT > 0 && e.cb) { ctx.save(); ctx.strokeStyle = 'rgba(255,140,210,' + e.cbT * 1.6 + ')'; ctx.lineWidth = 4; const cx = S.p.x - W / 2, cy = S.p.y - H / 2;
    for (const [qx, qy] of e.cb) { ctx.beginPath(); ctx.moveTo(x, y - r * .8); ctx.lineTo(qx - cx, qy - cy); ctx.stroke(); } ctx.restore(); }
}
// Majin Vegeta reuses the playable Vegeta's Super Saiyan sprite, with Babidi's mark
let MVSHEET = null;
function drawMVeg(c, x, y, r, t, e) {
  if (!MVSHEET) { MVSHEET = mk(2048, 1024); paintSheet(MVSHEET, Object.assign({}, PALS.veg, { mm: 1 }), 1); }
  const face = S.p.x < e.x ? -1 : 1, sc = r / 15, mv = !(e.fx > 0 || e.exh > 0);
  let row = 1, f = Math.floor(t * 6) % FRN[1];
  if (e.at > 0) { row = 0; f = Math.min(FRN[0] - 1, Math.floor((1 - e.at) * FRN[0])); } else if (mv) { row = 2; f = Math.floor(t * 12) % FRN[2]; }
  LT(); gl('or', x, y, r * 2.6, (e.fx > 0 ? .9 : .5) + .15 * Math.sin(t * 14)); NM();
  if (e.exh > 0) { LT(); gl('wh', x, y, r * 1.6, .25); NM(); }
  c.save(); c.translate(x + (e.fx > 0 ? (Math.random() - .5) * 3 : 0), y); c.scale(face * sc, sc);
  c.drawImage(MVSHEET, f * HC, row * HC, HC, HC, -HOX / HC * HD, HDY, HD, HD); c.restore();
  if (e.fx > 0) { ctx.save(); ctx.font = '900 ' + Math.round(r * 1.5) + 'px Impact,Haettenschweiler,"HelveticaNeue-CondensedBlack","Avenir Next Condensed","Roboto Condensed",sans-serif-condensed,"Arial Narrow","Arial Black",sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 6; ctx.strokeStyle = '#3a0000';
    const s = String(Math.ceil(e.fx)); ctx.strokeText(s, x, y - r * 2.8); ctx.fillStyle = e.fx < 1.5 ? '#ff4030' : '#ffe27a'; ctx.fillText(s, x, y - r * 2.8); ctx.restore(); }
}

/* ---------- art: mobs ---------- */
function drawL4Mob(e, x, y, f, C) {
  const ctx = C || MCTX, LT = () => ctx.globalCompositeOperation = 'lighter', NM = () => ctx.globalCompositeOperation = 'source-over', gl = (k, x, y, r, a = 1) => { ctx.globalAlpha = a; ctx.drawImage(GL[k], x - r, y - r, r * 2, r * 2); ctx.globalAlpha = 1; };   // C: draw somewhere else (perf9.js caches these as images)
  const r = e.r, t = S.t, sd = e.sd ?? (e.sd = Math.random() * 6), sc = r / 12;
  ctx.save(); ctx.translate(x, y); ctx.lineJoin = 'round'; ctx.lineWidth = 1.6; ctx.strokeStyle = OL;
  if (e.k == 'bb' || e.k == 'bs') {   // pink goo with a little antenna
    const wb = Math.sin(t * 7 + sd), sx = 1 + .08 * wb, sy = 1 - .08 * wb; ctx.scale(sc * sx, sc * sy);
    const g = ctx.createRadialGradient(-4, -5, 1, 0, 0, 13); g.addColorStop(0, f ? '#fff' : '#ffd0e6'); g.addColorStop(.6, f ? '#fff' : '#f890c0'); g.addColorStop(1, '#c04a84');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-12, 6); ctx.quadraticCurveTo(-13, -10, 0, -11); ctx.quadraticCurveTo(13, -10, 12, 6); ctx.quadraticCurveTo(0, 11, -12, 6); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#c04a84'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(0, -11); ctx.quadraticCurveTo(-3, -17, -7 + wb, -16); ctx.stroke(); ctx.strokeStyle = OL;
    ctx.fillStyle = '#16060e'; for (const q of [-1, 1]) { ctx.beginPath(); ctx.ellipse(q * 4, -2, 1.6, 2.4, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(-5, -6, 3, 1.6, -.5, 0, 7); ctx.fill();
  } else if (e.k == 'mj') {   // Babidi's soldier: grey-violet brute with the M
    const a = Math.atan2(S.p.y - e.y, S.p.x - e.x), stp = Math.sin(t * 12 + sd) * 2; ctx.scale(sc * (Math.cos(a) < 0 ? -1 : 1), sc);
    if (e.frz) { LT(); gl('rd', 0, 0, 16, .5); NM(); }
    ctx.fillStyle = '#2a2a3a'; for (const q of [-1, 1]) { ctx.beginPath(); ctx.rect(q * 3 - 2, 4 + (q * stp > 0 ? 0 : 1), 4, 8); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = f ? '#fff' : '#5a4a7a'; ctx.beginPath(); ctx.moveTo(-7, -4); ctx.lineTo(7, -4); ctx.lineTo(6, 6); ctx.lineTo(-6, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = f ? '#fff' : '#9a8aa8'; for (const q of [-1, 1]) { ctx.beginPath(); ctx.ellipse(q * 8, 1 + q * stp * .3, 2.6, 4.4, 0, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = f ? '#fff' : '#a898b4'; ctx.beginPath(); ctx.arc(0, -9, 6, 0, 7); ctx.fill(); ctx.stroke();
    mMark(ctx, 0, -12, .9, '#c81818');
    ctx.fillStyle = e.frz ? '#ff2a2a' : '#1a1a22'; for (const q of [-1, 1]) { ctx.beginPath(); ctx.ellipse(1 + q * 2.4, -8.4, 1.3, 1, 0, 0, 7); ctx.fill(); }
  } else if (e.k == 'imp') {   // demon imp holding a pink orb
    ctx.translate(0, Math.sin(t * 5 + sd) * 2 - 3); ctx.scale(sc, sc);
    for (const q of [-1, 1]) { ctx.fillStyle = '#3a2a4a'; ctx.beginPath(); ctx.moveTo(q * 5, -2); ctx.lineTo(q * 15, -8 + Math.sin(t * 16 + sd) * 2); ctx.lineTo(q * 12, 2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    const g = ctx.createRadialGradient(-2, -3, 1, 0, 0, 9); g.addColorStop(0, f ? '#fff' : '#a8e08a'); g.addColorStop(1, '#3a7a2a'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 7, 8, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f0e0c0'; for (const q of [-1, 1]) { ctx.beginPath(); ctx.moveTo(q * 3, -6); ctx.lineTo(q * 5, -12); ctx.lineTo(q * 5.6, -5); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = '#ffe23a'; for (const q of [-1, 1]) { ctx.beginPath(); ctx.ellipse(q * 2.6, -1.4, 1.5, 1.1, q * .3, 0, 7); ctx.fill(); }
    LT(); gl('rd', 6, 5, 7, .6); NM(); ctx.fillStyle = '#ff7ac8'; ctx.beginPath(); ctx.arc(6, 5, 3, 0, 7); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}
const L4MOB = { mj: 1, imp: 1, bb: 1, bs: 1 };
{ const _en = enemy; enemy = function (e, x, y) {
    if (!L4MOB[e.k]) return _en(e, x, y);
    const f = e.fl > 0, r = e.r;
    if (GFX != 'low') { ctx.fillStyle = 'rgba(20,10,30,.3)'; el(x, y + r + 1, r * .75, 3.2); }
    if (e.elite) { LT(); gl('rd', x, y, r * 2.4, .55 + .15 * Math.sin(S.t * 8)); NM(); }
    drawL4Mob(e, x, y, f);
    if (e.elite) { const w = 34; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - w / 2, y - r * 2.1, w, 5); ctx.fillStyle = '#ffd23a'; ctx.fillRect(x - w / 2 + 1, y - r * 2.1 + 1, (w - 2) * Math.max(0, e.hp / e.max), 3); }
    if (e.st > 0) { ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y - r * 1.6, 5, 0, 7); ctx.stroke(); }
  }; }

/* ---------- art: hazards (gravity zones, stone puddles, candy, darkness, Planet Burst) ---------- */
function drawHaz4(cx, cy, t) {
  for (const z of S.gz || []) { const x = z.x - cx, y = z.y - cy, on = z.T - z.t > z.w, a = Math.min(1, (z.T - z.t) / z.w) * Math.min(1, z.t / .4);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = on ? 'rgba(120,70,220,.22)' : 'rgba(120,70,220,.1)'; ctx.beginPath(); ctx.arc(x, y, z.r, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(190,150,255,.8)'; ctx.lineWidth = 2; ctx.setLineDash(on ? [] : [8, 6]); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 3; i++) { const u = ((t * .8 + i / 3) % 1), rr = z.r * (1 - u); ctx.strokeStyle = 'rgba(200,170,255,' + (.5 * u) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.stroke(); }
    ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(230,215,255,.85)'; ctx.fillText('x10', x, y + 4); ctx.restore(); }
  for (const s of S.spit || []) { const x = s.x - cx, y = s.y - cy, k = 1 - s.t / s.T;
    ctx.save(); ctx.strokeStyle = 'rgba(200,200,190,.8)'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.arc(x, y, 52, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(160,160,150,' + .25 * k + ')'; ctx.beginPath(); ctx.arc(x, y, 52 * k, 0, 7); ctx.fill();
    ctx.fillStyle = '#a8a89a'; ctx.beginPath(); ctx.arc(x, y - (1 - k) * 160, 7, 0, 7); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 1.4; ctx.stroke(); ctx.restore(); }
  for (const z of S.stn || []) { const x = z.x - cx, y = z.y - cy, a = Math.min(1, z.t / .5);
    ctx.save(); ctx.globalAlpha = a; const g = ctx.createRadialGradient(x - 10, y - 6, 4, x, y, z.r); g.addColorStop(0, '#c8c8bc'); g.addColorStop(1, '#6a6a60');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, z.r, z.r * .7, 0, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(40,40,36,.8)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = 'rgba(40,40,36,.5)'; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i < 5; i++) { const q = i * 1.26 + z.r; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(q) * z.r * .8, y + Math.sin(q) * z.r * .55); } ctx.stroke(); ctx.restore(); }
  for (const c of S.cpd || []) { const x = c.x - cx, y = c.y - cy, a = Math.min(1, c.t / 1, (14 - c.t) / .6); if (x < -90 || y < -90 || x > W + 90 || y > H + 90) continue;
    ctx.save(); ctx.globalAlpha = a; const g = ctx.createRadialGradient(x - c.r * .3, y - c.r * .25, 2, x, y, c.r); g.addColorStop(0, '#ffe0f0'); g.addColorStop(.5, '#ff9ad0'); g.addColorStop(1, '#e05aa0');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, c.r, c.r * .62, 0, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(150,30,90,.7)'; ctx.lineWidth = 2; ctx.stroke();
    for (let i = 0; i < 7; i++) { ctx.fillStyle = ['#fff6a0', '#8ae0ff', '#ffffff', '#a0ff9a'][i % 4]; ctx.fillRect(x + Math.cos(i * 2.2 + c.s) * c.r * .6, y + Math.sin(i * 2.2 + c.s) * c.r * .35, 4, 1.6); } ctx.restore(); }
  for (const c of S.cdy || []) { const x = c.x - cx, y = c.y - cy, s = 1 + .1 * Math.sin(t * 8 + c.s);
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 3 + c.s) * .4); ctx.scale(s, s); LT(); gl('rd', 0, 0, 12, .35); NM();
    ctx.lineWidth = 1.4; ctx.strokeStyle = OL; ctx.fillStyle = c.s > 3 ? '#ff7ac8' : '#ffd23a';
    for (const q of [-1, 1]) { ctx.beginPath(); ctx.moveTo(q * 6, 0); ctx.lineTo(q * 11, -4); ctx.lineTo(q * 11, 4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(0, 0, 7, 5, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(-4, -3, 4, 1.4); ctx.restore(); }
}
function drawDark4(cx, cy, t) {
  const yk = S.en.find(e => e.k == 'yak' && !e.dead); if (!yk) return;
  const R = YAK_LR, g = ctx.createRadialGradient(W / 2, H / 2, R * .55, W / 2, H / 2, R);
  g.addColorStop(0, 'rgba(4,0,10,0)'); g.addColorStop(1, 'rgba(4,0,10,.94)'); ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  const x = yk.x - cx, y = yk.y - cy;   // his glowing eyes give him away in the dark
  LT(); for (const q of [-1, 1]) gl('or', x + q * 6 * yk.r / 20, y - yk.r * .9, 10, .8 + .2 * Math.sin(t * 9)); NM();
}
function drawPB(cx, cy, t) {
  const b = S.pb; if (!b) return; const k = b.t / b.T, pul = .5 + .5 * Math.sin(t * (10 + 14 * k));
  ctx.save(); ctx.fillStyle = 'rgba(255,40,120,' + (.12 + .2 * k + .08 * pul) * FLM() + ')'; ctx.fillRect(0, 0, W, H);
  for (const s of b.safe) { const x = s.x - cx, y = s.y - cy;
    ctx.fillStyle = 'rgba(120,255,170,.18)'; ctx.beginPath(); ctx.arc(x, y, s.r, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(160,255,190,' + (.7 + .3 * pul) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, s.r, 0, 7); ctx.stroke();
    ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#d8ffe4'; ctx.fillText('SAFE', x, y + 4);
    // arrow toward off-screen safe spots
    if (x < 0 || y < 0 || x > W || y > H) { const a = Math.atan2(y - H / 2, x - W / 2), ax = W / 2 + Math.cos(a) * Math.min(W, H) * .4, ay = H / 2 + Math.sin(a) * Math.min(W, H) * .4;
      ctx.save(); ctx.translate(ax, ay); ctx.rotate(a); ctx.fillStyle = '#a0ffc0'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-6, -9); ctx.lineTo(-6, 9); ctx.closePath(); ctx.fill(); ctx.restore(); } }
  ctx.font = '900 ' + Math.round(Math.min(40, W * .08)) + 'px Impact,Haettenschweiler,"HelveticaNeue-CondensedBlack","Avenir Next Condensed","Roboto Condensed",sans-serif-condensed,"Arial Narrow","Arial Black",sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#3a0010';
  const s = (b.T - b.t).toFixed(1); ctx.strokeText(s, W / 2, H * .2); ctx.fillStyle = '#ffd0e4'; ctx.fillText(s, W / 2, H * .2); ctx.restore();
}
{ const _d = drawNewB; drawNewB = function (cx, cy, t) { if (S.stage == 4) drawHaz4(cx, cy, t); _d(cx, cy, t); if (S.stage == 4) { drawDark4(cx, cy, t); drawPB(cx, cy, t); } }; }
// absorbed-attack readout under the HUD
{ const _h = hudNew; hudNew = function () { _h(); const a = S.absW; if (!a || S.mode == 'menu') return;
    ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.font = 'bold 13px "Trebuchet MS",sans-serif'; ctx.textAlign = 'center';
    const s = '⛔ ' + INFO[a.k][0].replace('★ ', '') + ' absorbed · ' + Math.ceil(a.t) + 's', y = H - 30;
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(40,0,20,.8)'; ctx.strokeText(s, W / 2, y); ctx.fillStyle = '#ffb0d8'; ctx.fillText(s, W / 2, y); ctx.restore(); }; }

/* ---------- map: Babidi's ship → wasteland → candy city ---------- */
const TILE5 = (() => { const c = mk(512, 512), x = c.getContext('2d'); x.scale(2, 2); x.fillStyle = '#3e3648'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const px = i * 64, py = j * 64, v = rnd(i, j + 60);
    x.fillStyle = v < .33 ? '#463e52' : v < .66 ? '#3a3244' : '#423a4e'; x.fillRect(px + 1, py + 1, 62, 62);
    x.fillStyle = 'rgba(255,255,255,.06)'; x.fillRect(px + 1, py + 1, 62, 2); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(px + 1, py + 61, 62, 2);
    x.fillStyle = '#28222f'; for (const [a, b] of [[5, 5], [57, 5], [5, 57], [57, 57]]) { x.beginPath(); x.arc(px + a, py + b, 1.6, 0, 7); x.fill(); } }
  x.fillStyle = 'rgba(255,90,190,.35)'; x.fillRect(0, 127, 256, 2); x.fillRect(127, 0, 2, 256);   // glowing conduits
  for (let i = 0; i < 700; i++) { x.fillStyle = i % 2 ? 'rgba(20,10,30,.2)' : 'rgba(220,200,240,.08)'; x.fillRect(rnd(i, 61) * 256, rnd(i, 62) * 256, 1 + rnd(i, 63) * 2, 1); }
  return c; })();
const PAT5 = ctx.createPattern(TILE5, 'repeat'); PAT5.setTransform(new DOMMatrix().scale(.5));
function mkPillar(v) { const c = mk(60 * DK, 110 * DK), x = c.getContext('2d'); x.scale(DK, DK); x.translate(30, 0); x.lineJoin = 'round'; x.strokeStyle = OL; x.lineWidth = 1.8;
  x.fillStyle = 'rgba(10,0,20,.35)'; x.beginPath(); x.ellipse(4, 100, 26, 8, 0, 0, 7); x.fill();
  const g = x.createLinearGradient(-16, 0, 16, 0); g.addColorStop(0, '#5a4a6a'); g.addColorStop(.5, '#8a7a9a'); g.addColorStop(1, '#3a2e48'); x.fillStyle = g;
  x.beginPath(); x.moveTo(-14, 100); x.bezierCurveTo(-20, 70, -8, 50, -12, 14); x.quadraticCurveTo(0, 2 + v * 3, 12, 14); x.bezierCurveTo(8, 50, 20, 70, 14, 100); x.closePath(); x.fill(); x.stroke();
  x.strokeStyle = 'rgba(255,100,200,.75)'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 20); x.bezierCurveTo(-6, 45, 6, 65, 0, 92); x.stroke();
  x.fillStyle = 'rgba(255,140,220,.9)'; x.beginPath(); x.arc(0, 30 + v * 8, 4, 0, 7); x.fill(); return c; }
function mkPod(v) { const c = mk(56 * DK, 56 * DK), x = c.getContext('2d'); x.scale(DK, DK); x.translate(28, 30); x.lineJoin = 'round'; x.strokeStyle = OL; x.lineWidth = 1.6;
  x.fillStyle = 'rgba(10,0,20,.3)'; x.beginPath(); x.ellipse(2, 16, 22, 6, 0, 0, 7); x.fill();
  x.fillStyle = '#5a5068'; x.beginPath(); x.ellipse(0, 12, 20, 7, 0, 0, 7); x.fill(); x.stroke();
  const g = x.createRadialGradient(-5, -6, 2, 0, 0, 18); g.addColorStop(0, v % 2 ? '#d8ffe8' : '#ffe0f4'); g.addColorStop(1, v % 2 ? 'rgba(80,220,150,.6)' : 'rgba(230,80,180,.6)');
  x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, 15, 16, 0, Math.PI, 0); x.lineTo(15, 10); x.lineTo(-15, 10); x.closePath(); x.fill(); x.stroke(); return c; }
function mkCandy(v) { const c = mk(48 * DK, 64 * DK), x = c.getContext('2d'); x.scale(DK, DK); x.translate(24, 24); x.lineJoin = 'round'; x.strokeStyle = OL; x.lineWidth = 1.6;
  x.fillStyle = 'rgba(40,10,30,.3)'; x.beginPath(); x.ellipse(3, 34, 14, 5, 0, 0, 7); x.fill();
  if (v % 2) { x.fillStyle = '#f4f0ea'; x.fillRect(-1.6, 6, 3.2, 28); x.strokeRect(-1.6, 6, 3.2, 28);   // lollipop
    x.fillStyle = ['#ff7ac8', '#7ad8ff', '#ffd23a'][v % 3]; x.beginPath(); x.arc(0, 0, 13, 0, 7); x.fill(); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 2.4; x.beginPath(); for (let a = 0; a < 12; a += .2) { const r = a * 1; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.stroke(); }
  else { x.fillStyle = ['#ff8ad0', '#9ae07a', '#ffb050'][v % 3]; x.beginPath(); x.ellipse(0, 22, 14, 10, 0, 0, 7); x.fill(); x.stroke();   // gumdrop
    x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(-4, 17, 4, 2.4, -.4, 0, 7); x.fill();
    x.fillStyle = '#fff'; for (let i = 0; i < 6; i++) x.fillRect(-9 + rnd(i, v) * 18, 16 + rnd(v, i) * 10, 2, 2); }
  return c; }
const DEC5 = { pillar: [], pod: [], candy: [] };
for (let v = 0; v < 4; v++) { DEC5.pillar.push(mkPillar(v)); DEC5.pod.push(mkPod(v)); }
for (let v = 0; v < 6; v++) DEC5.candy.push(mkCandy(v));
function bgShip(cx, cy) {
  ctx.save(); ctx.translate(-(((cx % 256) + 256) % 256), -(((cy % 256) + 256) % 256)); ctx.fillStyle = PAT5; ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
  const G = 130;
  for (let gx = Math.floor(cx / G) - 1; gx <= (cx + W) / G + 1; gx++) for (let gy = Math.floor(cy / G) - 1; gy <= (cy + H) / G + 1; gy++) {
    const h = hash(gx + 51, gy + 13), x = gx * G + hash(gy + 4, gx + 7) * G - cx, y = gy * G + hash(gx + 3, gy + 11) * G - cy, v = (hash(gx + 6, gy + 29) * 1000) | 0;
    if (h < .07) dImg(DEC5.pillar[v % 4], x, y - 40, v & 1); else if (h < .13) dImg(DEC5.pod[v % 4], x, y);
  }
}
function candyDecor(cx, cy) {
  const G = 150;
  for (let gx = Math.floor(cx / G) - 1; gx <= (cx + W) / G + 1; gx++) for (let gy = Math.floor(cy / G) - 1; gy <= (cy + H) / G + 1; gy++) {
    const h = hash(gx + 71, gy + 37); if (h > .1) continue; const x = gx * G + hash(gy + 8, gx + 2) * G - cx, y = gy * G + hash(gx + 5, gy + 19) * G - cy, v = (hash(gx + 1, gy + 41) * 1000) | 0;
    dImg(DEC5.candy[v % 6], x, y - 10, v & 1);
  }
}
{ const _bg = bg; bg = function (cx, cy) {
    if (S.stage != 4) return _bg(cx, cy);
    const ph = mph4(); if (ph == 0) bgShip(cx, cy); else if (ph == 1) bgNew(cx, cy); else { bg3(cx, cy); candyDecor(cx, cy); }
  }; }
// (the per-phase colour grade now lives in fx6.js drawAtmos, under the HUD instead of over it)

/* ---------- intro: the hero lands beside Babidi's ship ---------- */
{ const _ip = introPod; introPod = function (c, t, T) { if (S.stage != 4) return _ip(c, t, T); introBuu(c, t, T); }; }
function introBuu(c, t, T) { }   // the scene itself is drawn in cut6.js

/* ---------- menu, end card, saved runs, guards ---------- */
{ const _m = menu; menu = function () {
    _m(); if (!PROG_READY || V2.welcome3 || !HAS('lvl3')) return;
    const c = ov.querySelector('.in') || ov.querySelector('.card'); if (!c) return;
    const l3 = c.querySelector('button.l3b'); if (!l3) return;
    l3.insertAdjacentHTML('afterend', HAS('lvl4') ? '<button class="go l4b" onclick="start(4)">Level 4: Majin Buu<small>Pui Pui · Dabura · Majin Vegeta · Buu</small></button>'
      : '<div class="lock">Level 4: Majin Buu (defeat Perfect Cell to unlock)</div>');
  }; }
{ const _e = endCard; endCard = function (win) {
    const r = _e(win); if (!(win && S.stage == 3 && HAS('lvl4'))) return r;
    const add = '<button class="go" onclick="start(4)">Next: Majin Buu</button>';
    if (RV) RV.back = RV.back.replace('<button class="go" onclick="start()">', add + '<button class="go" onclick="start()">');
    else { const b = [...ov.querySelectorAll('button')].find(b => b.getAttribute('onclick') == 'start()'); if (b) b.insertAdjacentHTML('beforebegin', add); }
    return r;
  }; }
svPeek = function () { try { const r = JSON.parse(store.getItem(RUNK) || 'null'); if (r && r.v == 1 && r.S && r.S.p && r.stage >= 1 && r.stage <= 4 && r.S.t > 1 && r.S.p.hp > 0) return r; } catch (e) { } return null; };
{ const _w = svWelcome; svWelcome = function () { const r = _w(); if (r && S.stage == 4) { const b = ov.querySelector('.stats b'); if (b) b.textContent = S.endless ? 'Endless' : 'Buu Saga'; } return r; }; }
{ const _g = guardBall; guardBall = function (b) { if (S.stage != 4) return _g(b);
    const n = b.n >= 7 ? 4 : 3; for (let i = 0; i < n; i++) { spawnE(i % 2 ? 'imp' : 'mj'); const q = S.en[S.en.length - 1], a = i / n * 6.283;
      q.x = b.x + Math.cos(a) * 70; q.y = b.y + Math.sin(a) * 70; q.elite = 1; q.hp = q.max = q.max * 6; q.r *= 1.4; q.spd *= 1.05; }
    ban('THE DRAGON BALL IS GUARDED!'); }; }

/* ---------- achievements + unlocks ---------- */
Object.assign(UNL_NAME, { 'p:mm': 'Majin Mark (passive)', 'w:candy': 'Candy Beam', 'w:ghost': 'Ghost Kamikaze', 'h:gotenks': 'Gotenks (playable hero)',
  wishh: "Shenron's blessing: wishes also fully heal you (+10 max HP)", mveg: "Vegeta's transformation becomes Majin Vegeta", fusion2: 'More Fusion Dance recipes',
  endless: 'Endless Mode', ss3: 'Goku can reach Super Saiyan 3' });
Object.assign(UNL_ICON, { 'p:mm': 'Ⓜ️', 'w:candy': '🍬', 'w:ghost': '👻', 'h:gotenks': '👦', wishh: '💚', mveg: '😈', fusion2: '🤝', endless: '♾️', ss3: '💛' });
const L4ACH = [
  { id: 's17', c: 'story', n: 'Majin Mark', d: 'Defeat Pui Pui', r: ['p:mm'], t: () => P.bk.pui },
  { id: 's18', c: 'story', n: 'Let There Be Light', d: 'Defeat Yakon', r: ['wishh'], t: () => P.bk.yak },
  { id: 's19', c: 'story', n: 'Demon King', d: 'Defeat Dabura', r: ['w:candy'], t: () => P.bk.dab },
  { id: 's20', c: 'story', n: 'Pride of a Saiyan', d: 'Defeat Majin Vegeta', r: ['mveg'], t: () => P.bk.mveg },
  { id: 's21', c: 'story', n: 'Pink Terror', d: 'Defeat Majin Buu', r: ['fusion2'], t: () => P.bk.bu1 },
  { id: 's22', c: 'story', n: 'Fusion HA!', d: 'Defeat Super Buu', r: ['h:gotenks', 'w:ghost'], t: () => P.bk.bu2 },
  { id: 's23', c: 'story', n: 'The Original Majin', d: 'Defeat Kid Buu', r: ['endless', 'ss3'], t: () => P.bk.bu3 },
  { id: 's23b', c: 'story', n: 'Candy Land', d: 'Survive 10:00 on Level 4', r: ['z:1000'], t: () => S.stage == 4 && !S.endless && S.t >= 600 },
  { id: 'x14', c: 'secret', n: 'Lights Out', h: 'Some enemies eat the light.', d: 'Defeat Yakon without feeding him any light', r: ['z:900'], t: () => S.bkr && S.bkr.yak && !S.yakFed },
  { id: 'x15', c: 'secret', n: 'Not Today, Vegeta', h: 'Stop the sacrifice.', d: 'Defeat Majin Vegeta during his Final Explosion countdown', r: ['z:1000'], t: () => S.mvegSD },
  { id: 'x16', c: 'secret', n: 'Sweet Tooth', h: 'No snacks for Buu.', d: "Defeat Majin Buu without letting him eat any candy", r: ['z:1000'], t: () => S.bu1Clean },
  { id: 'x17', c: 'secret', n: 'Planet Survivor', h: 'The planet will not survive. You will.', d: 'Survive 3 Planet Bursts in one run', r: ['z:1200'], t: () => (S.pbOk || 0) >= 3 },
  { id: 'x18', c: 'secret', n: 'Rock Solid', h: 'Watch your step.', d: 'Defeat Dabura without ever being petrified', r: ['z:800'], t: () => S.bkr && S.bkr.dab && !S.stoned }
];
for (const [k, c] of Object.entries(GC)) L4ACH.push({ id: 'c' + k + '4', c: 'chal', n: c.n + ' IV', d: `Clear Level 4 with ${c.n} on`, r: ['z:1600'], ev: 'win', t: () => S.stage == 4 && !S.endless && S.gc && S.gc[k] });
for (const a of L4ACH) { ACH.push(a); ACH_BY[a.id] = a; }
