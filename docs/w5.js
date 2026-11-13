/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — LEVEL 4 POWERS (EXPANSION_PLAN.md §9, §9.1)
   Passive: Majin Mark · Attacks: Ghost Kamikaze, Candy Beam · Fusion Dance ·
   Gotenks (hero) · Super Saiyan 3 Goku · Majin Vegeta form · Shenron's blessing
   ===================================================================== */
'use strict';

const W5 = ['ghost', 'candy'];
const W5B = { ghost: 1, candy: 1 };   // per-attack damage multipliers for balancing
Object.assign(INFO, {
  ghost: ['Ghost Kamikaze', 'Cheeky ghosts drift to enemies, latch on and explode.'],
  candy: ['Candy Beam', 'Zaps random enemies into candy. Bosses and elites take damage over time instead.'],
  mm: ['Majin Mark', 'A risky curse: +10% damage and +5% XP per level, but enemies move 5% faster per level.']
});
Object.assign(EVO, {
  ghost: ['Super Ghost Kamikaze Attack', 'Twice the ghosts and bigger blasts, and every ghost splits in two when it pops.', 'mm'],
  candy: ['Candy Storm', 'Far more beams, far more often, and candy heals you more.', 'mm']
});
Object.assign(MYTH, {
  ghost: 'Mythic: ghosts fly twice as fast and their blasts stun',
  candy: 'Mythic: each candy pops in a sugar blast that hurts nearby enemies'
});
for (const k of W5) BASE[k] = INFO[k][0];
PCAP.mm = 6;
{ const _bt = bonusText; bonusText = function (g, k, r) { if (g == 'ps' && k == 'mm') return `+${Math.round(10 * RAR[r].m)}% damage, +${Math.round(5 * RAR[r].m)}% XP · enemies +5% speed`; return _bt(g, k, r); }; }
COL_W.push('ghost', 'candy'); COL_P.push('mm');

/* ---------- state ---------- */
{ const _in = init; init = function () {
    _in();
    for (const k of W5) { if (S.w[k] === undefined) S.w[k] = 0; if (S.cd[k] === undefined) S.cd[k] = 1; }
    if (S.ps.mm === undefined) { S.ps.mm = 0; S.pe.mm = 0; }
    Object.assign(S, { gh: [], cbm: [], cpop: [], cdot: [], ch4: [], fz: {}, tkd: [], dsb: [], dsl: [], gdn: null });
    // transformation names unlocked by Level 4
    if (RU('ss3')) XFORM.goku = ['SUPER SAIYAN 3', '255,220,70']; else delete XFORM.goku;
    XFORM.vegeta = [RU('mveg') ? 'MAJIN VEGETA' : 'SUPER SAIYAN', '255,220,70'];
  }; }
const arr5 = k => S[k] || (S[k] = []);

/* ---------- Majin Mark ---------- */
const MMK = () => (S.pe && S.pe.mm) || 0;
{ const _h = hitE; hitE = function (e, d) { const n = MMK(); return _h(e, n ? d * (1 + .1 * n) : d); }; }
{ const _a = addXp; addXp = function (v) { const n = MMK(); return _a(n ? v * (1 + .05 * n) : v); }; }
{ const _s = spawnE; spawnE = function (k) { const n0 = S.en.length; const r = _s(k); const m = S.ps && S.ps.mm;
    if (m && S.en.length > n0) { const e = S.en[S.en.length - 1]; if (!e.boss) e.spd *= 1 + .05 * m; } return r; }; }

/* ---------- Fusion Dance (EXPANSION_PLAN.md §9.1, §9.5) ----------
   Two evolved attacks fuse into one and free a slot. Wishes carry over: each wish on a parent (or on the
   fused attack itself) raises the fusion a tier. Tier 0 = Fusion, 1 = one wish, 2 = two wishes. */
const FUSE = {
  fkame: { n: 'Final Kamehameha', d: "Goku and Vegeta's ultimate: a colossal gold-and-blue beam.", d1: 'The beam sweeps across the crowd and grows wider.', d2: 'Two extra beams fan out, and the blast ends in a shockwave around you.', a: 'kame', b: 'galick', u: 'fusion' },
  fskame: { n: 'Father-Son Kamehameha', d: 'Twin beams side by side, fired fast and hard.', d1: 'Three beams instead of two.', d2: 'The beams converge and detonate on your target.', a: 'kame', b: 'masenko', u: 'fusion' },
  mlight: { n: "Mentor's Light", d: 'Piccolo and Gohan together: four spiral beams sweep around you.', d1: 'Six spiral beams.', d2: 'Each volley also releases a stunning pulse around you.', a: 'sbc', b: 'masenko', u: 'fusion' },
  tks: { n: 'Twin Kienzan Storm', d: 'Eight giant discs spiral out and back, slicing everything.', d1: 'Twelve discs.', d2: 'A second, wider ring of discs spins the other way.', a: 'disc', b: 'scatter', u: 'fusion2' },
  dsb: { n: 'Dragon Spirit Bomb', d: 'A giant Spirit Bomb crashes down, then lightning rains around it.', d1: 'Two bombs on two crowds.', d2: 'One colossal bomb and a storm of chaining lightning.', a: 'bomb', b: 'thunder', u: 'fusion2' },
  kwf: { n: 'Kaioken Wolf Fang Barrage', d: 'Burning dash strikes rip through the nearest enemies, inside a Kaioken aura.', d1: 'More targets, and every combo heals you.', d2: 'Every strike explodes in flame.', a: 'aura', b: 'wolf', u: 'fusion3' },
  sgp: { n: 'Sweet Ghost Parade', d: 'Pink ghosts turn whatever they touch into candy. Bosses take damage over time.', d1: 'Twice the ghosts, and candy heals you more often.', d2: 'A giant candy ghost sweeps the screen every few seconds.', a: 'ghost', b: 'candy', u: 'fusion3' },
  htc: { n: 'Hellzone Tri-Cage', d: 'Three ki orbs form a cage over a crowd; damage ramps inside, then the orbs detonate.', d1: 'Two cages at once.', d2: 'Cages drag enemies to the centre and the detonation is far bigger.', a: 'hell', b: 'tri', u: 'fusion3' }
};
const FT = k => (S.ft && S.ft[k]) || 0, FTM = [1, 1.35, 1.8], FTN = ['', ' ★', ' ★★'], FTW = ['the base version', 'the one-wish version', 'the two-wish version'];
const fname = k => '🤝 ' + FUSE[k].n + FTN[FT(k)];
const fdesc = k => { const f = FUSE[k], t = FT(k); return f.d + (t >= 1 ? ' ' + f.d1 : '') + (t >= 2 ? ' ' + f.d2 : ''); };
for (const k in FUSE) { INFO[k] = ['🤝 ' + FUSE[k].n, FUSE[k].d]; MYTH[k] = 'raises this fusion a tier'; }
const fsync = k => { INFO[k][0] = fname(k); INFO[k][1] = fdesc(k); };
{ const _in = init; init = function () { _in(); for (const k in FUSE) INFO[k] = ['🤝 ' + FUSE[k].n, FUSE[k].d]; }; }
Object.assign(BP, { fin: ['rgba(40,130,255,', 'rgba(255,220,90,', 'or'], fin2: ['rgba(255,255,255,', 'rgba(255,236,150,', 'wh'], fs: ['rgba(30,120,255,', 'rgba(170,230,255,', 'cy'] });
const fuseReady = () => Object.keys(FUSE).filter(id => { const f = FUSE[id]; return RU(f.u) && !(S.w[id] > 0) && S.evo[f.a] && S.evo[f.b] && S.w[f.a] >= 5 && S.w[f.b] >= 5; });
const wishOn = k => !!(S.myth && S.myth[k]);
function pickFuse(id) {
  if (S.mode != 'lvl') return; const f = FUSE[id]; if (!f || !fuseReady().includes(id)) return;
  const tier = Math.min(2, (wishOn(f.a) ? 1 : 0) + (wishOn(f.b) ? 1 : 0));
  (S.ft || (S.ft = {}))[id] = tier;
  S.rm[id] = Math.min(MCAP, (S.rm[f.a] || 0) + (S.rm[f.b] || 0)); S.rn[id] = 0; S.rw[id] = S.rm[id];   // wish power carries over
  S.myth[id] = tier >= 2 ? 1 : 0;
  S.w[f.a] = 0; S.w[f.b] = 0; S.fz[f.a] = S.fz[f.b] = 1; S.w[id] = 5; S.cd[id] = .6; fsync(id);
  if (f.a == 'disc' || f.b == 'disc') S.discs = [];
  S.fuN = (S.fuN || 0) + 1; P.fus = (P.fus || 0) + 1; (P.fusR || (P.fusR = {}))[id] = Math.max(P.fusR[id] || 0, tier + 1); try { saveProg(); } catch (e) { }
  S.flash = Math.max(S.flash, .8); boom(S.p.x, S.p.y, 170, '#ffe27a'); ban('FUSION HA! ' + (f.n + FTN[tier]).toUpperCase() + '!'); sfxPlay('fuse');
  if (S.luckN > 0) S.luckN--; S.pend--; lvlUp();
}
{ const _op = offerPool; offerPool = function () { return _op().filter(([g, k]) => !(S.fz && S.fz[k]) && !FUSE[k]); }; }
{ const _lv = lvlUp; lvlUp = function () {
    _lv(); const fr = S.pend > 0 ? fuseReady() : []; if (!fr.length) return;
    const html = fr.slice(0, 2).map(id => { const f = FUSE[id], t = Math.min(2, (wishOn(f.a) ? 1 : 0) + (wishOn(f.b) ? 1 : 0));
      return `<button class="up evo fuse" onclick="pickFuse('${id}')"><img class="ic" src="${iurl(id)}"><div><b>🤝 FUSION: ${f.n}${FTN[t]}</b><br><small>${INFO[f.a][0].replace('★ ', '')} + ${INFO[f.b][0].replace('★ ', '')} → one attack (frees a slot). ${f.d}${t ? ` <b class="fw">${t == 2 ? 'Both wishes carry over: two-wish version!' : 'Your wish carries over: one-wish version!'}</b>` : ''}</small></div></button>`; }).join('');
    if (S.mode == 'lvl') { const h = ov.querySelector('.card h2'); if (h) h.insertAdjacentHTML('afterend', html); }
    else { S.mode = 'lvl'; show(`<div class="card"><h2>Power up! Level ${S.p.lv}</h2>${html}<button onclick="S.pend=0;S.mode='play';show('')">Not now</button></div>`); }
  }; }
{ const _b = beamDmg; beamDmg = function (b, e) { if (b.fz && e.boss) return Math.min(b.d * .6, e.max * .012 * (b.tm || 1)); return _b(b, e); }; }
// wishing on a fused attack raises its tier; wishing on a parent shows what it does to the fusion
{ const _m = mythic; mythic = function (g, k) {
    if (!FUSE[k]) return _m(g, k);
    const t = Math.min(2, FT(k) + 1); (S.ft || (S.ft = {}))[k] = t; const r = _m(g, k); S.myth[k] = t >= 2 ? 1 : 0; fsync(k);
    ban(FUSE[k].n.toUpperCase() + ': ' + (t == 2 ? 'TWO-WISH VERSION!' : 'ONE-WISH VERSION!')); (P.fusR || (P.fusR = {}))[k] = Math.max(P.fusR[k] || 0, t + 1); try { saveProg(); } catch (e) { }
    return r; }; }
{ const _sw = startWish; startWish = function () {
    _sw(); if (S.mode != 'wish') return;
    for (const b of ov.querySelectorAll('button.up')) { const m = /mythic\('w','(\w+)'\)/.exec(b.getAttribute('onclick') || ''); if (!m) continue; const k = m[1], tx = b.querySelector('div'); if (!tx) continue;
      let note = '';
      if (FUSE[k]) note = `🤝 Becomes ${FTW[Math.min(2, FT(k) + 1)]}: ${FT(k) ? FUSE[k].d2 : FUSE[k].d1}`;
      else for (const id in FUSE) { const f = FUSE[id]; if ((f.a != k && f.b != k) || !RU(f.u) || S.w[id] > 0) continue; const o = f.a == k ? f.b : f.a; if (!(S.w[o] > 0)) continue;
        const t = Math.min(2, 1 + (wishOn(o) ? 1 : 0)); note = `🤝 Fused with ${INFO[o][0].replace('★ ', '')} it becomes ${FUSE[id].n}${FTN[t]} (${FTW[t]})`; break; }
      if (note) tx.insertAdjacentHTML('beforeend', `<br><small class="fw">${note}</small>`); }
  }; }

/* ---------- Gotenks ---------- */
HERO3.gotenks = { n: 'Gotenks', u: 'h:gotenks', w: 'ghost', d: 'Show-Off: +15% damage while above 70% HP. Ghost Kamikaze fires 15% faster.' };
XFORM.gotenks = ['SUPER SAIYAN 3', '255,220,70'];
{ const _h = hitE; hitE = function (e, d) { if (S.hero == 'gotenks' && S.p.hp > S.p.max * .7) d *= 1.15; if (S.hero == 'vegeta' && S.ssj && RU('mveg')) d *= 1.1; return _h(e, d); }; }
{ const _b = ban; ban = function (t) {
    if (t == 'SUPER SAIYAN!' || t == 'SUPER SAIYA') { if (S.hero == 'gotenks' || (S.hero == 'goku' && RU('ss3'))) t = 'SUPER SAIYAN 3!'; else if (S.hero == 'vegeta' && RU('mveg')) t = 'MAJIN VEGETA!'; }
    return _b(t); }; }
LOCKED_HEROES.push(['h:gotenks', 'Gotenks', 'Defeat Super Buu', 'gotenks']);
// Ki Burst: Galactic Donut, a ring that traps a crowd, squeezes it and explodes
{ const _uf = ultFire; ultFire = function () {
    if (S.hero != 'gotenks') return _uf();
    if (!RU('kiburst') || S.mode != 'play' || (S.ult || 0) < 100) return;
    S.ultK0 = P.kills; S.ultT = S.t; S.ult = 0; S.inv = 1.4; sfx('ban'); sfxPlay('ult'); kick(16);
    const p = S.p; let tg = null, best = -1;
    for (const e of S.en) if (!e.dead && onScr(e)) { let n = 0; for (const o of S.en) if (!o.dead && Math.hypot(o.x - e.x, o.y - e.y) < 180) n++; const sc = (e.boss ? 1e6 : 0) + n; if (sc > best) { best = sc; tg = e; } }
    S.gdn = { x: tg ? tg.x : p.x, y: tg ? tg.y : p.y, t: 0, T: 1.3, R: 220 * AR2(), d: (90 + 8 * p.lv) * dm() };
    p.atk = p.ad = .6; ban('GALACTIC DONUT!');
  }; }

// Fusion tuning (2026-11-13): a fusion costs two attack slots, so with no wish it should clear faster than any single
// evolved attack (attack audit: ~8-10 kills/s vs 4-6), ~12-14 at one wish and 15-20 at two, without wiping the screen.
// Per fusion: damage multiplier for [no wish, one wish, two wishes], on top of FTM.
const FB5 = { fkame: [1.4, 1, 1.05], fskame: [1.6, 2.2, 1.4], mlight: [1.5, 1.12, 1], tks: [2, 1.55, 1.05], dsb: [2, 2.3, 1.1], kwf: [1.85, 2.5, 1.05], sgp: [1, 1, 1], htc: [1.3, 2.6, .8] };
const SGP5 = { cd: [.28, .2, .25], cap: [16, 22, 20], spd: [240, 260, 260], chain: [3, 4, 4] };   // Sweet Ghost Parade: seconds between ghosts, most out, speed
const DSB5 = { cd: [1.8, 3, 3.2] };                    // Dragon Spirit Bomb: seconds between bombs
const HTC5 = { cd: 2.2, groups: [3, 4, 2] };              // Hellzone Tri-Cage: seconds between casts, cages per cast
const KWF = { aura: .35, cd: 1, dash: 3, burst: .7 };
/* ---------- per-frame ---------- */
function updW5(dt) {
  const p = S.p, W_ = S.w, ev = S.evo;
  // Ghost Kamikaze: ghosts seek enemies, latch on and explode
  if (W_.ghost) { DSRC = 'ghost'; const L = W_.ghost, E = ev.ghost, cap = 3 + L + (E ? 4 : 0); S.cd.ghost -= dt;
    if (S.cd.ghost <= 0 && arr5('gh').length < cap) { S.cd.ghost = (E ? .75 : Math.max(1.1, 2.1 - .22 * L)) * cm() * (S.hero == 'gotenks' ? .85 : 1);
      const n = 1 + (PX() >> 1); for (let i = 0; i < n; i++) { const a = Math.random() * 6.283; S.gh.push({ x: p.x + Math.cos(a) * 18, y: p.y + Math.sin(a) * 18 - 10, t: 0, l: 6, s: Math.random() * 6, a }); } sfxPlay('ghost'); } }
  for (const g of arr5('gh')) { DSRC = 'ghost';
    g.t += dt; g.l -= dt; const M = MY('ghost'), sp = (g.mini ? 170 : 150) * (M ? 2 : 1);
    if (!g.e || g.e.dead) { let b = null, bd = 520; for (const e of S.en) { if (e.dead || !onScr(e)) continue; const d = Math.hypot(e.x - g.x, e.y - g.y); if (d < bd) { bd = d; b = e; } } g.e = b; }
    if (g.e) { const dx = g.e.x - g.x, dy = g.e.y - g.y, d = Math.hypot(dx, dy) || 1; g.a = Math.atan2(dy, dx); g.x += dx / d * sp * dt + Math.cos(g.t * 6 + g.s) * 20 * dt; g.y += dy / d * sp * dt + Math.sin(g.t * 5 + g.s) * 20 * dt;
      if (d < g.e.r + 8) g.l = 0; }
    else { g.x += Math.cos(g.t * 2 + g.s) * 40 * dt; g.y += Math.sin(g.t * 1.6 + g.s) * 40 * dt - 10 * dt; }
    if (g.l <= 0 && !g.done) { g.done = 1; const L = W_.ghost || 5, E = ev.ghost, R = (46 + 5 * L) * AR2() * (E ? 1.35 : 1) * (g.mini ? .65 : 1), d = (14 + 7 * WL('ghost')) * dm() * W5B.ghost * (E ? 1.6 : 1) * (g.mini ? .5 : 1);
      for (const e of S.en) if (!e.dead && Math.hypot(e.x - g.x, e.y - g.y) < R + e.r) { hitE(e, d); shove(e, g.x, g.y, 18); if (M && !e.boss) e.st = Math.max(e.st || 0, .6); }
      boom(g.x, g.y, R, '#e8e0ff');
      if (E && !g.mini) for (const q of [-1, 1]) S.gh.push({ x: g.x + q * 8, y: g.y, t: 0, l: 3, s: Math.random() * 6, mini: 1, a: 0 }); }
  }
  S.gh = arr5('gh').filter(g => !g.done);
  // Candy Beam: zap random enemies on screen into candy
  if (W_.candy) { DSRC = 'candy'; const L = W_.candy, E = ev.candy, M = MY('candy'); S.cd.candy -= dt;
    if (S.cd.candy <= 0) { const pool = S.en.filter(e => !e.dead && onScr(e) && Math.hypot(e.x - p.x, e.y - p.y) < 440);
      if (!pool.length) S.cd.candy = .25;
      else { S.cd.candy = (E ? 1.2 : Math.max(1.7, 3.3 - .3 * L)) * cm(); const n = Math.min(pool.length, 1 + (L >> 1) + PX() + (E ? 3 : 0)), dd = (6 + 3 * WL('candy')) * dm() * W5B.candy * (E ? 1.5 : 1);
        for (let i = 0; i < n; i++) { const j = Math.random() * pool.length | 0, e = pool.splice(j, 1)[0]; S.cbm.push({ x: e.x, y: e.y, l: .25 });
          if (e.boss || e.elite) { S.cdot.push({ e, t: 3, tk: 0, d: dd, src: DSRC }); continue; }
          e.hp = 0; killE(e); S.cpop.push({ x: e.x, y: e.y, l: .5, c: Math.random() < .5 ? '#ff7ac8' : '#ffd23a' });
          if (M) { for (const o of S.en) if (!o.dead && o !== e && Math.hypot(o.x - e.x, o.y - e.y) < 50 * AR2() + o.r) hitE(o, dd * 1.5); }
          if (Math.random() < (E ? .08 : .04)) S.ch4.push({ x: e.x, y: e.y, l: 12 }); }
        sfxPlay('candy'); } } }
  for (const c of arr5('cdot')) { DSRC = 'candy'; c.t -= dt; c.tk -= dt; if (c.tk <= 0 && !c.e.dead) { c.tk = .5; DSRC = c.src || 'candy'; hitE(c.e, c.d); } }
  S.cdot = arr5('cdot').filter(c => c.t > 0 && !c.e.dead);
  for (const c of arr5('ch4')) { c.l -= dt; if (Math.hypot(c.x - p.x, c.y - p.y) < 28) { c.l = 0; p.hp = Math.min(p.max, p.hp + 8); sfx('bean'); if (S.nums.length < 40) S.nums.push({ x: p.x, y: p.y - 24, v: '+8', l: .7, c: '#ff9ad8' }); } }
  S.ch4 = arr5('ch4').filter(c => c.l > 0);
  for (const b of arr5('cbm')) b.l -= dt; S.cbm = arr5('cbm').filter(b => b.l > 0);
  for (const b of arr5('cpop')) b.l -= dt; S.cpop = arr5('cpop').filter(b => b.l > 0);
  // ---- fused attacks (damage x1 / x1.35 / x1.8 by tier, plus each tier's extra trick) ----
  const fm = k => FTM[FT(k)] * ((FB5[k] || [])[FT(k)] ?? 1);
  const beam = o => S.beams.push(Object.assign({ h: new Set(), fz: 1, tk: .22, src: DSRC }, o));
  if (W_.fkame) { DSRC = 'fkame'; S.cd.fkame -= dt; if (S.cd.fkame <= 0) { const ts = near(1, 900); if (!ts.length) S.cd.fkame = .2; else { const T = FT('fkame'); S.cd.fkame = 2.8 * cm();
      const a = Math.atan2(ts[0].y - p.y, ts[0].x - p.x), d = (70 + 10 * WL('fkame')) * dm() * fm('fkame'); p.atk = p.ad = .9; p.face = Math.cos(a) > 0 ? 1 : -1;
      beam({ a: T ? a - .25 : a, t: 1.1, T: 1.1, w: 130 * AR2() * (T ? 1.2 : 1), len: 1200, d, pal: T == 2 ? 'fin2' : 'fin', kb: 30, clr: 1, rot: T ? .45 : 0, tm: fm('fkame') });
      if (T == 2) { for (const o of [-.5, .5]) beam({ a: a + o, t: .9, T: .9, w: 70 * AR2(), len: 1000, d: d * .4, pal: 'fin', kb: 20, tm: 1 }); S.fsw = { t: 1.1, d: d }; }
      sfxPlay('beam'); kick(6); } } }
  if (S.fsw) { DSRC = 'fkame'; S.fsw.t -= dt; if (S.fsw.t <= 0) { const R = 260 * AR2(); for (const e of S.en) if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < R + e.r) { hitE(e, e.boss ? Math.min(S.fsw.d, e.max * .02) : S.fsw.d); shove(e, p.x, p.y, 70); } boom(p.x, p.y, R, '#fff2b0'); kick(12); S.fsw = null; } }
  if (W_.fskame) { DSRC = 'fskame'; S.cd.fskame -= dt; if (S.cd.fskame <= 0) { const ts = near(1, 900); if (!ts.length) S.cd.fskame = .2; else { const T = FT('fskame'); S.cd.fskame = 2.2 * cm();
      const a = Math.atan2(ts[0].y - p.y, ts[0].x - p.x), d = (52 + 8 * WL('fskame')) * dm() * fm('fskame'); p.atk = p.ad = .7; p.face = Math.cos(a) > 0 ? 1 : -1;
      for (const o of T ? [-.16, 0, .16] : [-.11, .11]) beam({ a: a + o, t: .85, T: .85, w: 76 * AR2(), len: 1050, d, pal: 'fs', kb: 22, tm: fm('fskame'), rot: T == 2 ? -o * .25 : 0 });
      if (T == 2) arr5('dsb').push({ x: ts[0].x, y: ts[0].y, t: .35, T: .9, R: 130 * AR2(), d: d * 2.5, fs: 1 });
      sfxPlay('beam'); } } }
  if (W_.mlight) { DSRC = 'mlight'; S.cd.mlight -= dt; if (S.cd.mlight <= 0) { const T = FT('mlight'), n = T ? 5 : 4; S.cd.mlight = 2.4 * cm(); const a0 = Math.random() * 6.283, d = (22 + 4 * WL('mlight')) * dm() * fm('mlight'); p.atk = p.ad = .6;
      for (let i = 0; i < n; i++) beam({ a: a0 + i * 6.283 / n, t: 1.15, T: 1.15, w: 54 * AR2(), len: 900, d, pal: 'sbc', kb: 10, rot: 1, tm: fm('mlight') });
      if (T == 2) { const R = 170 * AR2(); for (const e of S.en) if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < R + e.r) { hitE(e, e.boss ? Math.min(d * 1.5, e.max * .006) : d * 1.5); if (!e.boss) e.st = Math.max(e.st || 0, .7); } S.fpl = { t: .45, R }; }
      sfxPlay('beam'); } }
  if (S.fpl) { S.fpl.t -= dt; if (S.fpl.t <= 0) S.fpl = null; }
  for (const b of S.beams) { if (!b.fz) continue; b.tk -= dt; if (b.tk <= 0) { b.tk = .22; b.h.clear(); } if (b.rot) b.a += b.rot * dt; }
  if (W_.tks) { DSRC = 'tks'; const T = FT('tks'), n = T ? 10 : 8, ph = (S.t % 2.4) / 2.4, R = (80 + 220 * Math.sin(ph * Math.PI)) * AR2(), d = (17 + 4 * WL('tks')) * dm() * fm('tks');
    S.tkd = []; const disc = (x, y, big) => { S.tkd.push({ x, y, big });
      for (const e of S.en) { if (e.dead || (e.tkc || 0) > S.t || Math.hypot(e.x - x, e.y - y) > 24 * AR2() * (big ? 1.4 : 1) + e.r) continue; e.tkc = S.t + .3; hitE(e, e.boss ? Math.min(d, e.max * .006) : d); } };
    for (let i = 0; i < n; i++) { const a = S.t * 2.2 * (i % 2 ? -1 : 1) + i / n * 6.283, rr = R * (i % 2 ? .78 : 1); disc(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr); }
    if (T == 2) for (let i = 0; i < 4; i++) { const a = -S.t * 1.4 + i / 4 * 6.283, rr = 340 * AR2(); disc(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr, 1); } }
  if (W_.dsb) { DSRC = 'dsb'; S.cd.dsb -= dt; if (S.cd.dsb <= 0) { const ts = near(12, 700); if (!ts.length) S.cd.dsb = .3; else { const T = FT('dsb'); S.cd.dsb = DSB5.cd[T] * cm();
      const d = (160 + 20 * WL('dsb')) * dm() * fm('dsb'), grp = T == 1 && ts.length > 6 ? [ts.slice(0, 6), ts.slice(6)] : [ts.slice(0, 6)];
      for (const g of grp) { let cx = 0, cy = 0; for (const e of g) { cx += e.x; cy += e.y; } cx /= g.length; cy /= g.length;
        S.dsb.push({ x: cx, y: cy, t: 0, T: .9, R: 150 * AR2() * (T == 2 ? 1.6 : 1), d: d * (T == 2 ? 1.4 : 1), ln: T == 2 ? 14 : 6 }); }
      sfxPlay('spirit'); } } }
  for (const b of arr5('dsb')) { DSRC = 'dsb'; b.t += dt; if (b.t >= b.T && !b.hit) { b.hit = 1;
      for (const e of S.en) if (!e.dead && Math.hypot(e.x - b.x, e.y - b.y) < b.R + e.r) { hitE(e, e.boss ? Math.min(b.d, e.max * .03) : b.d); shove(e, b.x, b.y, 40); }
      boom(b.x, b.y, b.R, b.fs ? '#d8f0ff' : '#bfe0ff'); aFlash(.5); kick(10);
      if (!b.fs) for (let i = 0; i < (b.ln || 6); i++) { const a = Math.random() * 6.283, r = b.R * (.4 + Math.random() * 1.1); S.dsl.push({ x: b.x + Math.cos(a) * r, y: b.y + Math.sin(a) * r, t: -.12 * i, d: b.d * .35 }); } } }
  S.dsb = arr5('dsb').filter(b => b.t < b.T + .5);
  for (const l of arr5('dsl')) { DSRC = 'dsb'; const was = l.t; l.t += dt; if (was < 0 && l.t >= 0) { for (const e of S.en) if (!e.dead && Math.hypot(e.x - l.x, e.y - l.y) < 55 + e.r) hitE(e, e.boss ? Math.min(l.d, e.max * .01) : l.d); sfxPlay('thunder'); } }
  S.dsl = arr5('dsl').filter(l => l.t < .3);
  // Kaioken Wolf Fang Barrage: a burning aura plus dash strikes on the nearest enemies
  // Kaioken Wolf Fang Barrage tuning (2026-11-13: lifted from ~2 to 4+ kills/s at one wish; every dash now bursts)
  if (W_.kwf) { DSRC = 'kwf'; const T = FT('kwf'), d = (30 + 7 * WL('kwf')) * dm() * fm('kwf'), R = 100 * AR2();
    S.cd.kwfa = (S.cd.kwfa || 0) - dt; if (S.cd.kwfa <= 0) { S.cd.kwfa = .3; for (const e of S.en) if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < R + e.r) hitE(e, d * KWF.aura); }
    S.cd.kwf = (S.cd.kwf ?? 1) - dt; if (S.cd.kwf <= 0) { const ts = near(T == 2 ? 12 : T ? 10 : 8, 380); if (!ts.length) S.cd.kwf = .2; else { S.cd.kwf = KWF.cd * cm(); p.atk = p.ad = .4;
        for (const [i, e] of ts.entries()) { arr5('kws').push({ x0: p.x, y0: p.y, x1: e.x, y1: e.y, t: -i * .04, l: .28 });
          hitE(e, e.boss ? Math.min(d * KWF.dash, e.max * .008) : d * KWF.dash);
          { const BR = (T == 2 ? 55 : 40) * AR2(), bd = d * (T == 2 ? 1.2 : KWF.burst); for (const o of S.en) if (!o.dead && o !== e && Math.hypot(o.x - e.x, o.y - e.y) < BR + o.r) hitE(o, o.boss ? Math.min(bd, o.max * .004) : bd); if (T == 2 || i < 4) boom(e.x, e.y, BR, '#ff8a3a'); } }
        if (T) p.hp = Math.min(p.max, p.hp + 1 + ts.length * .3); sfxPlay('dash'); } } }
  for (const s of arr5('kws')) s.t += dt; S.kws = arr5('kws').filter(s => s.t < s.l);
  // Sweet Ghost Parade: candy ghosts (and at two wishes, a giant one that sweeps the screen)
  const candyHit = (e, d, heal) => { if (e.boss || e.elite) { S.cdot.push({ e, t: 3, tk: 0, d: d * .5, src: DSRC }); hitE(e, e.boss ? Math.min(d, e.max * .006) : d); return; }
    e.hp = 0; killE(e); S.cpop.push({ x: e.x, y: e.y, l: .5, c: Math.random() < .5 ? '#ff7ac8' : '#ffd23a' }); if (Math.random() < heal) S.ch4.push({ x: e.x, y: e.y, l: 12 }); };
  if (W_.sgp) { DSRC = 'sgp'; const T = FT('sgp'), cap = SGP5.cap[T]; S.cd.sgp = (S.cd.sgp ?? .5) - dt;
    if (S.cd.sgp <= 0 && arr5('sg').length < cap) { S.cd.sgp = SGP5.cd[T] * cm(); const a = Math.random() * 6.283; S.sg.push({ x: p.x + Math.cos(a) * 18, y: p.y + Math.sin(a) * 18, t: 0, l: 5, s: Math.random() * 6, a }); }
    if (T == 2) { S.cd.sgb = (S.cd.sgb ?? 4) - dt; if (S.cd.sgb <= 0) { S.cd.sgb = 6 * cm(); const a = Math.random() * 6.283; S.sgb = { x: p.x - Math.cos(a) * 520, y: p.y - Math.sin(a) * 520, vx: Math.cos(a) * 420, vy: Math.sin(a) * 420, t: 2.5 }; } } }
  for (const g of arr5('sg')) { DSRC = 'sgp'; g.t += dt; g.l -= dt;
    if (!g.e || g.e.dead) { let b = null, bd = 520; for (const e of S.en) { if (e.dead || !onScr(e)) continue; const dd = Math.hypot(e.x - g.x, e.y - g.y); if (dd < bd) { bd = dd; b = e; } } g.e = b; }
    if (g.e) { const dx = g.e.x - g.x, dy = g.e.y - g.y, dd = Math.hypot(dx, dy) || 1; g.a = Math.atan2(dy, dx); g.x += dx / dd * SGP5.spd[FT('sgp')] * dt; g.y += dy / dd * SGP5.spd[FT('sgp')] * dt;
      if (dd < g.e.r + 8) { g.l = 0; const sd = (16 + 4 * WL('sgp')) * dm() * fm('sgp'), sh = FT('sgp') ? .08 : .04, gx = g.e.x, gy = g.e.y; candyHit(g.e, sd, sh);
        // the pop turns the closest few neighbours to candy too (bosses and elites just take the damage)
        const nb = S.en.filter(o => !o.dead && !o.boss && Math.hypot(o.x - gx, o.y - gy) < 55 * AR2() + o.r).sort((a, b) => Math.hypot(a.x - gx, a.y - gy) - Math.hypot(b.x - gx, b.y - gy)).slice(0, SGP5.chain[FT('sgp')]);
        for (const o of nb) candyHit(o, sd, sh); } }
    else { g.x += Math.cos(g.t * 2 + g.s) * 40 * dt; g.y += Math.sin(g.t * 1.6 + g.s) * 40 * dt; } }
  S.sg = arr5('sg').filter(g => g.l > 0);
  if (S.sgb) { DSRC = 'sgp'; const b = S.sgb; b.t -= dt; b.x += b.vx * dt; b.y += b.vy * dt; const d = (16 + 4 * WL('sgp')) * dm() * fm('sgp') * 2;
    for (const e of S.en) if (!e.dead && onScr(e) && Math.hypot(e.x - b.x, e.y - b.y) < 90 + e.r && !(e.sgbH > S.t)) { e.sgbH = S.t + 1; candyHit(e, d, .08); }
    if (b.t <= 0) S.sgb = null; }
  // Hellzone Tri-Cage: triangle cages on crowds, ramping damage, then detonation
  if (W_.htc) { DSRC = 'htc'; const T = FT('htc'), d = (12 + 3 * WL('htc')) * dm() * fm('htc'); S.cd.htc = (S.cd.htc ?? .5) - dt;
    if (S.cd.htc <= 0) { const ng = HTC5.groups[T], gs = ng == 1 ? 14 : 7, ts = near(gs * ng, 650); if (!ts.length) S.cd.htc = .3; else { S.cd.htc = HTC5.cd * cm();
        for (let gi = 0; gi < ng; gi++) { const g = ts.slice(gi * gs, (gi + 1) * gs); if (!g.length) continue; let cx = 0, cy = 0; for (const e of g) { cx += e.x; cy += e.y; } cx /= g.length; cy /= g.length;
          arr5('cage').push({ x: cx, y: cy, R: 120 * AR2() * (T == 2 ? 1.2 : 1), t: 0, T: 3, tk: 0, d, pull: T == 2, big: T == 2 ? 2.4 : 1.4, a0: Math.random() * 6.283 }); }
        sfxPlay('orb'); } } }
  for (const c of arr5('cage')) { DSRC = 'htc'; c.t += dt; c.tk -= dt;
    if (c.tk <= 0) { c.tk = .25; const ramp = 1 + c.t; for (const e of S.en) { if (e.dead) continue; const dx = c.x - e.x, dy = c.y - e.y, dd = Math.hypot(dx, dy) || 1; if (dd > c.R) continue;
        hitE(e, e.boss ? Math.min(c.d * ramp, e.max * .004 / Math.max(1, S.cage.length / 2)) : c.d * ramp); if (c.pull && !e.boss) { e.x += dx / dd * Math.min(dd, 18); e.y += dy / dd * Math.min(dd, 18); } } }
    if (c.t >= c.T && !c.done) { c.done = 1; const R = c.R * (c.pull ? 1.3 : 1); for (const e of S.en) if (!e.dead && Math.hypot(e.x - c.x, e.y - c.y) < R + e.r) hitE(e, e.boss ? Math.min(c.d * 6 * c.big, e.max * .02 / Math.max(1, S.cage.length / 2)) : c.d * 6 * c.big); boom(c.x, c.y, R, '#d8a0ff'); kick(6); } }
  S.cage = arr5('cage').filter(c => !c.done);
  // Galactic Donut (Gotenks' Ki Burst)
  const G = S.gdn; if (G) { DSRC = 'ult'; G.t += dt; const k = Math.min(1, G.t / G.T), R = G.R * (1 - .8 * k);
    for (const e of S.en) { if (e.dead) continue; const dx = G.x - e.x, dy = G.y - e.y, d = Math.hypot(dx, dy) || 1; if (d > G.R + e.r) continue;
      if (!e.boss) { e.st = Math.max(e.st || 0, .3); if (d > R) { e.x += dx / d * Math.min(d - R, 300 * dt); e.y += dy / d * Math.min(d - R, 300 * dt); } } }
    if (G.t >= G.T) { for (const e of S.en) if (!e.dead && Math.hypot(e.x - G.x, e.y - G.y) < G.R * .6 + e.r) hitE(e, G.d * (e.boss ? 3.5 : 2)); boom(G.x, G.y, G.R * .6, '#fff2b0'); kick(14); S.gdn = null; } }
}
{ const _u = updNew; updNew = function (dt) { _u(dt); updW5(dt); }; }

/* ---------- drawing ---------- */
function ghostShape(c, x, y, s, t, sd, a, mini, pk) {
  c.save(); c.translate(x, y); c.scale(s, s); const fl = Math.cos(a) < 0 ? -1 : 1; c.scale(fl, 1);
  LT(); gl('wh', 0, 0, 18, .45); NM();
  c.lineJoin = 'round'; c.lineWidth = 1.4; c.strokeStyle = 'rgba(70,60,110,.9)';
  const g = c.createRadialGradient(-3, -5, 1, 0, 0, 12); g.addColorStop(0, pk ? '#fff0f8' : '#ffffff'); g.addColorStop(1, pk ? '#ff8ad0' : '#c8c0ec'); c.fillStyle = g;
  c.beginPath(); c.arc(0, -2, 8, Math.PI, 0); c.lineTo(8, 4);
  for (let i = 0; i < 4; i++) { const xx = 8 - (i + 1) * 4, w = Math.sin(t * 9 + sd + i) * 2; c.quadraticCurveTo(xx + 2, 8 + w, xx, 4); }
  c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-8, 3); c.quadraticCurveTo(-16, 6 + Math.sin(t * 7 + sd) * 3, -20, 0); c.quadraticCurveTo(-14, 2, -8, -2); c.fill(); c.stroke();
  c.fillStyle = '#2a2240'; c.beginPath(); c.ellipse(2, -3, 1.4, 2, 0, 0, 7); c.ellipse(6, -3, 1.2, 1.8, 0, 0, 7); c.fill();
  c.strokeStyle = '#2a2240'; c.lineWidth = 1.1; c.beginPath(); c.arc(4, 0, 2.2, .3, 2.8); c.stroke();
  if (!mini) { c.fillStyle = 'rgba(255,140,170,.5)'; c.beginPath(); c.ellipse(-1, 0, 1.6, 1, 0, 0, 7); c.fill(); }
  c.restore();
}
function drawW5(cx, cy, t) {
  for (const g of S.gh || []) ghostShape(ctx, g.x - cx, g.y - cy, g.mini ? .9 : 1.3, t, g.s, g.a, g.mini);
  for (const b of S.cbm || []) { const k = b.l / .25, x1 = b.x - cx, y1 = b.y - cy, mx = (W / 2 + x1) / 2, my = (H / 2 + y1) / 2 - 30;   // Candy Beam: a pink ribbon with a sparkle where it lands
    ctx.save(); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(W / 2, H / 2 - 12); ctx.quadraticCurveTo(mx, my, x1, y1);
    ctx.strokeStyle = `rgba(255,90,190,${.35 * k})`; ctx.lineWidth = 12 * k + 2; ctx.stroke();
    ctx.strokeStyle = `rgba(255,130,210,${.95 * k})`; ctx.lineWidth = 5.5 * k + 1; ctx.stroke();
    ctx.strokeStyle = `rgba(255,244,252,${k})`; ctx.lineWidth = 1.8; ctx.stroke(); ctx.restore();
    LT(); gl('pu', x1, y1, 20 * k + 6, .7 * k); ctx.fillStyle = `rgba(255,240,250,${k})`; if (typeof star4 == 'function') star4(x1, y1, 16 * (1.3 - k * .5), 2.2 * k + .6, t * 3); NM(); }
  for (const b of S.cpop || []) { const k = b.l / .5, x = b.x - cx, y = b.y - cy; ctx.save(); ctx.globalAlpha = Math.min(1, k * 2); ctx.translate(x, y - (1 - k) * 10); ctx.rotate((1 - k) * 3);
    ctx.fillStyle = b.c; ctx.strokeStyle = OL; ctx.lineWidth = 1.2; for (const q of [-1, 1]) { ctx.beginPath(); ctx.moveTo(q * 5, 0); ctx.lineTo(q * 9, -3); ctx.lineTo(q * 9, 3); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(0, 0, 6, 4.4, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
  for (const c of S.ch4 || []) { const x = c.x - cx, y = c.y - cy + Math.sin(t * 4 + c.x) * 2; LT(); gl('rd', x, y, 12, .4); NM();
    ctx.save(); ctx.fillStyle = '#7dff9a'; ctx.strokeStyle = OL; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.ellipse(x, y, 6, 4.4, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(x - 1, y - 3, 2, 6); ctx.fillRect(x - 3, y - 1, 6, 2); ctx.restore(); }
  for (const c of S.cdot || []) { if (c.e.dead) continue; LT(); gl('rd', c.e.x - cx, c.e.y - cy, c.e.r * 1.4, .25 + .1 * Math.sin(t * 12)); NM(); }
  // Twin Kienzan Storm discs
  if (S.w.tks) for (const d of S.tkd || []) { const x = d.x - cx, y = d.y - cy, r = 22 * AR2() * (d.big ? 1.4 : 1), n = 14; LT(); gl('or', x, y, r * 1.3, .4); NM();
    ctx.save(); ctx.translate(x, y); ctx.scale(1, d.big ? .42 : .36); ctx.rotate(t * 20);   // flat serrated blades seen edge-on
    ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n, q = i & 1 ? r * .9 : r * 1.14; i ? ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q) : ctx.moveTo(Math.cos(a) * q, Math.sin(a) * q); } ctx.closePath();
    const g = ctx.createRadialGradient(0, 0, r * .15, 0, 0, r * 1.1); g.addColorStop(0, '#ffffff'); g.addColorStop(.5, '#fff3b0'); g.addColorStop(1, '#ff9a1f');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#b04a08'; ctx.lineWidth = 2.6; ctx.lineJoin = 'round'; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(0, 0, r * .55, 0, 7); ctx.stroke(); ctx.restore(); }
  // Dragon Spirit Bomb
  for (const b of S.dsb || []) { const x = b.x - cx, y = b.y - cy, k = Math.min(1, b.t / b.T);
    if (!b.hit) { const yy = y - (1 - k) * 340, r = b.R * (.55 + .2 * k); LT(); gl('cy', x, yy, r * 1.5, .45); NM();
      { const g = ctx.createRadialGradient(x - r * .22, yy - r * .25, r * .05, x, yy, r * .72); g.addColorStop(0, '#ffffff'); g.addColorStop(.35, '#d6f2ff'); g.addColorStop(.8, '#5ab8ff'); g.addColorStop(1, 'rgba(40,120,255,.85)');   // a solid sphere of spirit energy
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, yy, r * .72, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(230,248,255,.9)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x, yy, r * (.3 + i * .14), t * (3 + i) + i * 2, t * (3 + i) + i * 2 + 1.6); ctx.stroke(); } }
      ctx.save(); ctx.strokeStyle = 'rgba(160,220,255,.7)'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.arc(x, y, b.R, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
    else { const u = (b.t - b.T) / .5; LT(); gl('cy', x, y, b.R * (1 + u * .4), .7 * (1 - u)); NM(); } }
  for (const l of S.dsl || []) { if (l.t < 0) continue; const x = l.x - cx, y = l.y - cy, a = 1 - l.t / .3;
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); let px = x + (Math.random() - .5) * 30, py = y - 220; ctx.moveTo(px, py);
    for (let i = 0; i < 6; i++) { px = x + (Math.random() - .5) * 26 * (1 - i / 6); py += 220 / 6; ctx.lineTo(px, py); }
    ctx.strokeStyle = `rgba(90,170,255,${a * .5})`; ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = `rgba(235,250,255,${a})`; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); LT(); gl('cy', x, y, 40, a * .8); NM(); }
  // Kaioken Wolf Fang Barrage: burning aura + flaming dash streaks
  if (S.w.kwf) { const R = 100 * AR2(); LT(); gl('rd', W / 2, H / 2, R * 1.2, .35 + .08 * Math.sin(t * 14)); NM();
    ctx.save(); ctx.strokeStyle = `rgba(255,90,40,${.45 + .2 * Math.sin(t * 9)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, 7); ctx.stroke(); ctx.restore(); }
  for (const k of S.kws || []) { if (k.t < 0) continue; const a = 1 - k.t / k.l; ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(255,120,40,${.8 * a})`; ctx.lineWidth = 9 * a + 2; ctx.beginPath(); ctx.moveTo(k.x0 - cx, k.y0 - cy); ctx.lineTo(k.x1 - cx, k.y1 - cy); ctx.stroke();
    ctx.strokeStyle = `rgba(255,240,200,${a})`; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore(); LT(); gl('or', k.x1 - cx, k.y1 - cy, 22, a); NM(); }
  // Sweet Ghost Parade: pink ghosts, and the giant one
  for (const g of S.sg || []) ghostShape(ctx, g.x - cx, g.y - cy, 1.2, t, g.s, g.a, 0, 1);
  if (S.sgb) { const b = S.sgb; ctx.save(); ctx.globalAlpha = Math.min(1, b.t * 2); ghostShape(ctx, b.x - cx, b.y - cy, 5.5, t, 0, Math.atan2(b.vy, b.vx), 0, 1); ctx.restore(); }
  // Hellzone Tri-Cage: three orbs joined by crackling lines, glowing hotter as the damage ramps
  for (const c of S.cage || []) { const x = c.x - cx, y = c.y - cy, k = Math.min(1, c.t / c.T), rot = c.a0 + c.t * (c.pull ? 1.4 : .6), pts = [0, 1, 2].map(i => [x + Math.cos(rot + i * 2.094) * c.R, y + Math.sin(rot + i * 2.094) * c.R]);
    ctx.save(); ctx.fillStyle = `rgba(170,90,255,${.08 + .14 * k})`; ctx.beginPath(); pts.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = `rgba(220,170,255,${.6 + .3 * Math.sin(t * 30)})`; ctx.lineWidth = 2 + 2 * k; ctx.stroke(); ctx.restore();
    LT(); for (const [a, b] of pts) { gl('pu', a, b, 16 + 10 * k, .8); gl('wh', a, b, 6, .9); } NM(); }
  // Mentor's Light two-wish pulse
  if (S.fpl) { const u = 1 - S.fpl.t / .45; ctx.save(); ctx.strokeStyle = `rgba(255,220,120,${1 - u})`; ctx.lineWidth = 8 * (1 - u) + 2; ctx.beginPath(); ctx.arc(W / 2, H / 2, S.fpl.R * u, 0, 7); ctx.stroke(); ctx.restore(); }
  // Galactic Donut
  const G = S.gdn; if (G) { const k = Math.min(1, G.t / G.T), R = G.R * (1 - .8 * k), x = G.x - cx, y = G.y - cy;
    ctx.save(); ctx.lineWidth = 16 + 10 * k; ctx.strokeStyle = 'rgba(255,230,140,.55)'; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.stroke();
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,235,.95)'; ctx.stroke(); ctx.restore(); LT(); gl('or', x, y, R * 1.2, .25 + .3 * k); NM(); }
}
{ const _d = drawNew; drawNew = function (cx, cy, t) { drawW5(cx, cy, t); _d(cx, cy, t); }; }

/* ---------- icons ---------- */
function drawIcon5(c, k) {
  c.save(); c.lineWidth = 2; c.strokeStyle = OL; c.lineJoin = 'round'; c.lineCap = 'round';
  const g = (x, y, r, a, b) => { const q = c.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, a); q.addColorStop(1, b); return q; };
  if (k == 'mm') { c.fillStyle = g(24, 24, 22, '#ff6a6a', '#8a1010'); c.beginPath(); c.arc(24, 24, 19, 0, 7); c.fill(); c.stroke();
    c.strokeStyle = '#fff'; c.lineWidth = 5; c.lineJoin = 'miter'; c.beginPath(); c.moveTo(12, 34); c.lineTo(15, 14); c.lineTo(24, 27); c.lineTo(33, 14); c.lineTo(36, 34); c.stroke(); }
  else if (k == 'ghost') { c.fillStyle = g(20, 18, 22, '#ffffff', '#b8b0e8'); c.beginPath(); c.arc(24, 22, 14, Math.PI, 0); c.lineTo(38, 38); c.lineTo(33, 34); c.lineTo(28, 40); c.lineTo(24, 34); c.lineTo(19, 40); c.lineTo(14, 34); c.lineTo(10, 38); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#2a2240'; c.beginPath(); c.ellipse(19, 21, 2.4, 3.4, 0, 0, 7); c.ellipse(29, 21, 2.4, 3.4, 0, 0, 7); c.fill(); c.lineWidth = 1.8; c.strokeStyle = '#2a2240'; c.beginPath(); c.arc(24, 27, 4, .3, 2.8); c.stroke(); }
  else if (k == 'candy') { c.strokeStyle = 'rgba(255,120,200,.9)'; c.lineWidth = 4; c.beginPath(); c.moveTo(4, 44); c.quadraticCurveTo(10, 20, 22, 24); c.stroke(); c.strokeStyle = OL; c.lineWidth = 2;
    c.fillStyle = '#ff7ac8'; for (const q of [-1, 1]) { c.beginPath(); c.moveTo(30 + q * 8, 22); c.lineTo(30 + q * 16, 15); c.lineTo(30 + q * 16, 29); c.closePath(); c.fill(); c.stroke(); }
    c.fillStyle = g(27, 19, 12, '#ffd8ee', '#ff5ab8'); c.beginPath(); c.ellipse(30, 22, 10, 8, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(25, 17, 7, 2.4); }
  else if (FUSE[k]) {
    const col = { fkame: ['#ffd23a', '#2a80ff'], fskame: ['#8ad8ff', '#2a80ff'], mlight: ['#ffd23a', '#b04aff'], tks: ['#ffe27a', '#ff9a1f'], dsb: ['#d8f0ff', '#3a8aff'], kwf: ['#ffd23a', '#ff4a1a'], sgp: ['#ffd8ee', '#ff5ab8'], htc: ['#e8c8ff', '#9a4aff'] }[k];
    c.fillStyle = g(24, 24, 22, '#4a2a6a', '#1a0a2a'); c.beginPath(); c.arc(24, 24, 21, 0, 7); c.fill(); c.strokeStyle = '#ffd23a'; c.lineWidth = 2.4; c.stroke();
    if (k == 'tks') { for (const [x, y, r] of [[18, 20, -.4], [30, 30, .5]]) { c.save(); c.translate(x, y); c.rotate(r); c.fillStyle = col[0]; c.strokeStyle = OL; c.lineWidth = 1.6; c.beginPath(); c.ellipse(0, 0, 13, 4, 0, 0, 7); c.fill(); c.stroke(); c.restore(); } }
    else if (k == 'kwf') { c.strokeStyle = col[1]; c.lineWidth = 4; for (const o of [-8, 0, 8]) { c.beginPath(); c.moveTo(10, 30 + o); c.lineTo(36, 18 + o); c.stroke(); }
      c.strokeStyle = col[0]; c.lineWidth = 1.6; for (const o of [-8, 0, 8]) { c.beginPath(); c.moveTo(12, 29 + o); c.lineTo(34, 19 + o); c.stroke(); } }
    else if (k == 'sgp') { ghostShape(c, 24, 24, 1.3, 0, 0, 0, 0, 1); c.fillStyle = col[1]; c.beginPath(); c.ellipse(34, 34, 5, 3.6, 0, 0, 7); c.fill(); }
    else if (k == 'htc') { const pts = [0, 1, 2].map(i => [24 + Math.cos(-1.5708 + i * 2.094) * 14, 25 + Math.sin(-1.5708 + i * 2.094) * 14]);
      c.fillStyle = 'rgba(170,90,255,.35)'; c.strokeStyle = col[0]; c.lineWidth = 2; c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.fill(); c.stroke();
      for (const [a, b] of pts) { c.fillStyle = g(a, b, 6, '#ffffff', col[1]); c.beginPath(); c.arc(a, b, 5, 0, 7); c.fill(); } }
    else if (k == 'dsb') { c.fillStyle = g(22, 20, 15, '#ffffff', col[1]); c.beginPath(); c.arc(24, 22, 13, 0, 7); c.fill(); c.strokeStyle = OL; c.lineWidth = 1.6; c.stroke();
      c.strokeStyle = '#fff6a0'; c.lineWidth = 2; c.beginPath(); c.moveTo(10, 30); c.lineTo(14, 36); c.lineTo(11, 38); c.lineTo(15, 44); c.moveTo(38, 30); c.lineTo(34, 36); c.lineTo(37, 38); c.lineTo(33, 44); c.stroke(); }
    else { c.save(); c.translate(24, 24); c.rotate(-.6); const n = k == 'fskame' ? 2 : 1;
      for (let i = 0; i < n; i++) { const oy = n == 2 ? (i ? 5 : -5) : 0; c.fillStyle = col[1]; c.fillRect(-18, oy - 5, 36, 10); c.fillStyle = col[0]; c.fillRect(-18, oy - 2.6, 36, 5.2); }
      if (k == 'mlight') { c.strokeStyle = col[1]; c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= 24; i++) { const x = -18 + i * 1.5, y = Math.sin(i * .9) * 6; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
      c.restore(); c.fillStyle = g(14, 32, 9, '#ffffff', col[0]); c.beginPath(); c.arc(13, 33, 8, 0, 7); c.fill(); }
    c.fillStyle = '#ffd23a'; c.font = 'bold 11px sans-serif'; c.textAlign = 'center'; c.strokeStyle = OL; c.lineWidth = 2.5; c.strokeText('🤝', 38, 44); c.fillText('🤝', 38, 44);
  }
  c.restore();
}
{ const _i = icn; icn = function (k) {
    if (!W5.includes(k) && k != 'mm' && !FUSE[k]) return _i(k);
    if (!ICN[k]) { const c = mk(96, 96), x = c.getContext('2d'); x.scale(2, 2); drawIcon5(x, k); ICN[k] = c; }
    return ICN[k]; }; }

/* ---------- art: Gotenks, Super Saiyan 3, the Majin "M" ---------- */
const HT_B = ['#5e5480', '#262034', '#0e0a16'], HT_G = ['#fffbc8', '#ffd93c', '#d8960c'];
// long Super Saiyan 3 mane, drawn behind the body at the head's position
function ss3Mane(c, P, gotenks) {
  const o = P.l || 0, b = P.b || 0, sq = P.sq || 1, hx = o * .85 + (P.hx || 0), hy = -13.2 + b + (P.hy || 0);
  c.save(); c.translate(0, 24); c.scale(.96 * (1 + (1 - sq) * .55), .96 * sq); c.translate(0, -24);
  c.translate(hx, hy); c.rotate((P.hd || 0) * .5); c.scale(.86, .86); c.lineJoin = 'round'; c.strokeStyle = OL; c.lineWidth = 1.5;
  const sw = (P.l || 0) * .3;
  hpoly(c, [[-12, -8], [-16, 4], [-19 + sw, 18], [-15 + sw, 27], [-20 + sw * 1.5, 38], [-11 + sw, 35], [-9 + sw * 1.5, 47], [-3 + sw, 38], [1 + sw * 1.5, 50], [5 + sw, 38], [9 + sw * 1.4, 46], [12 + sw, 34], [18 + sw, 38], [15, 26], [18, 14], [15, 2], [12, -8]], HT_G);
  hairShine(c, [[-8, 6], [-6, 30], [-3, 8]], HT_G[0], .5); strand(c, [[-2, 10], [-4, 36]], 'rgba(120,70,0,.4)'); strand(c, [[6, 10], [7, 32]], 'rgba(120,70,0,.4)');
  c.restore();
}
function gtkHead(c, x, y, s, mood, ssj, rot, P) {
  const HT = ssj ? HT_G : HT_B;
  c.save(); c.translate(x, y); c.rotate(rot || 0); c.scale(s, s); c.lineJoin = 'round'; c.strokeStyle = OL; c.lineWidth = 1.5;
  hpoly(c, ssj ? [[-12, 4], [-17, -6], [-23, -9], [-16, -14], [-19, -24], [-9, -20], [-7, -31], [0, -22], [6, -32], [8, -21], [17, -25], [15, -14], [22, -10], [16, -4], [12, 4]]
    : [[-12, 6], [-15, -4], [-20, -8], [-14, -12], [-16, -20], [-8, -17], [-6, -26], [0, -19], [5, -27], [7, -18], [14, -21], [13, -12], [19, -8], [14, -3], [12, 6]], HT);
  hairShine(c, [[-3, -18], [-1, -26], [2, -18]], HT[0], .55);
  c.restore();
  head3(c, x, y, s, mood, 0, rot, P, 'gtk');
  c.save(); c.translate(x, y); c.rotate(rot || 0); c.scale(s, s); c.lineJoin = 'round'; c.strokeStyle = OL; c.lineWidth = 1.5;
  hpoly(c, ssj ? [[-11.6, 0], [-11, -10], [-4, -14], [4, -14], [11, -10], [11.6, 0], [9, -4], [6, -1], [4, -7], [0, -3], [-4, -7], [-6, -1], [-9, -4]]
    : [[-11, -1], [-10, -10], [-4, -13], [4, -13], [10, -10], [11, -1], [8, -5], [5, -1], [2, -6], [-1, -1], [-4, -6], [-7, -1]], HT);
  hairShine(c, [[-7, -10], [-2, -12], [-5, -8]], HT[0], .5);
  if (PAL.mm) mMark(c, 0, 0, 1.05, '#c81818');
  c.restore();
}
function gtkBody(c, P, ssj) {
  const o = P.l || 0, b = P.b || 0, sq = P.sq || 1;
  const VS = tones(PAL.vs || '#2f8f8a', '#0a2a2a'), GD = tones('#e8c040', '#6a4a10'), PN = tones('#f4f2ee', '#8a8aa0'), SA = tones(PAL.sa || '#2a5aa0', '#0a1a40'), SH = tones('#2a2a34'), SK = ['#fff0dc', '#fcd6ae', '#e0a078'];
  const sx = y => o * (1 - .45 * Math.max(0, Math.min(1, (y + 5) / 14)));
  if (ssj) ss3Mane(c, P, 1);
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = OL; c.lineWidth = 1.5;
  c.translate(0, 24); c.scale(.9 * (1 + (1 - sq) * .55), .9 * sq); c.translate(0, -24);   // a kid: shorter than the others
  const arm = i => { const sh = [(i ? 9.4 : -9.4) + o, -3.2 + b], h = P.h[i], el = ik(sh[0], sh[1], h[0], h[1], 5.8, 5.8, P.ed ? P.ed[i] : 1), ang = Math.atan2(h[1] - el[1], h[0] - el[0]);
    hlimb(c, [sh, el], 5.6, SK); hlimb(c, [el, h], 4.8, SK);
    const wb = [el[0] + (h[0] - el[0]) * .66, el[1] + (h[1] - el[1]) * .66], we = [el[0] + (h[0] - el[0]) * .86, el[1] + (h[1] - el[1]) * .86]; hlimb(c, [wb, we], 5.4, SH);
    fist(c, h[0] + Math.cos(ang) * .6, h[1] + Math.sin(ang) * .6, ang, 2.9, SK); };
  arm(0);
  for (let i = 0; i < 2; i++) { const f = P.ft[i], ax = f[0], ay = f[1], fa = f[2] || 0, hip = [(i ? 4 : -4) + o * .45, 9 + b], kn = ik(hip[0], hip[1], ax, ay - 2.4, 6.9, 6.9, -1);
    hlimb(c, [hip, kn, [ax, ay - 2.4]], 10.4, PN);
    c.save(); c.translate(ax, ay); c.rotate(fa); c.lineWidth = 1.6; c.strokeStyle = OL;
    hpoly(c, [[-4, -5], [4, -5], [4.6, -1], [6.6, 2.1], [-5.6, 2.5], [-4.6, -1]], SH);
    c.fillStyle = '#e8c040'; c.fillRect(-4.2, -5.2, 8.4, 1.6); c.restore(); }
  // bare chest under an open Metamoran vest, sash, gold shoulder trim
  hpoly(c, [[-9 + sx(-5), -5 + b], [9 + sx(-5), -5 + b], [8.4 + sx(3), 3 + b], [9 + sx(9), 9.8 + b], [-9 + sx(9), 9.8 + b], [-8.4 + sx(3), 3 + b]], SK);
  c.strokeStyle = 'rgba(160,80,50,.45)'; c.lineWidth = .9; c.beginPath(); c.moveTo(sx(-3), -3 + b); c.lineTo(sx(5), 5 + b); c.stroke(); c.strokeStyle = OL; c.lineWidth = 1.5;
  for (const q of [-1, 1]) { hpoly(c, [[q * 9.8 + sx(-5), -5.8 + b], [q * 4 + sx(-5), -5.8 + b], [q * 3.4 + sx(8), 8.4 + b], [q * 9.6 + sx(8), 8.4 + b], [q * 9 + sx(3), 3 + b]], VS, { lw: 1.3 });
    hpoly(c, [[q * 10 + sx(-6), -6.6 + b], [q * 5 + sx(-6), -6.4 + b], [q * 5.4 + sx(-3), -3.2 + b], [q * 10.6 + sx(-3), -3.6 + b]], GD, { lw: 1.1 }); }
  hpoly(c, [[-10 + sx(6), 6.6 + b], [10 + sx(6), 6.6 + b], [10.4 + sx(9), 10 + b], [-10.4 + sx(9), 10 + b]], SA, { lw: 1.1 });
  hpoly(c, [[-3 + sx(-5), -9 + b], [3 + sx(-5), -9 + b], [3.4 + sx(-5), -4.4 + b], [-3.4 + sx(-5), -4.4 + b]], SK, { ns: 1 });
  arm(1);
  gtkHead(c, o * .85 + (P.hx || 0), -13.2 + b + (P.hy || 0), .9, P.mo ? 'yell' : P.fi ? 'fight' : 'smile', ssj, P.hd || 0, P);
  c.restore();
}
{ const _gh = gokuHead; gokuHead = function (c, x, y, s, mood, ssj, rot, P) {
    const r = _gh(c, x, y, s, mood, ssj, rot, P);
    if (PAL.mm && !PAL.kri && !PAL.veg && !PAL.tru) mmHead(c, x, y, s, rot, -1.4);
    return r; }; }
function mmHead(c, x, y, s, rot, dy) { c.save(); c.translate(x, y); c.rotate(rot || 0); c.scale(s, s); mMark(c, 0, dy, 1.05, '#c81818'); c.restore(); }
{ const _h3 = head3; head3 = function (c, x, y, s, mood, ssj, rot, P, kind) { const r = _h3(c, x, y, s, mood, ssj, rot, P, kind); if (PAL.mm && kind != 'gtk') mmHead(c, x, y, s, rot, kind == 'veg' ? 1 : -1.4); return r; }; }
{ const _ph = piccHead; piccHead = function (c, x, y, s, mood, ssj, rot, P) { const r = _ph(c, x, y, s, mood, ssj, rot, P); if (PAL.mm) mmHead(c, x, y, s, rot, -2.4); return r; }; }
{ const _gb = gokuBody; gokuBody = function (c, P, ssj) {
    if (PAL.gtk) return gtkBody(c, P, ssj);
    if (PAL.ss3 && ssj) ss3Mane(c, P, 0);
    return _gb(c, P, ssj); }; }
PALS.gtk = Object.assign({}, PALS.goku, { gtk: 1 });
// sprite sheets: Gotenks, plus variants with the Majin mark and Goku's Super Saiyan 3 (painted on first use)
const XS5 = {};
const basePal = (h, ssj) => h == 'goku' ? PALS.goku : h == 'pic' ? (ssj ? PALS.pico : PALS.pic) : h == 'gohan' ? PALS.gohan : h == 'vegeta' ? (vegAlt() ? PALS.vegS : PALS.veg) : h == 'trunks' ? PALS.tru : h == 'kri' ? PALS.kri : h == 'gotenks' ? PALS.gtk : PALS.goku;
const baseSheet = (h, ssj, old) => old ? old(ssj) : h == 'pic' ? (ssj ? PSSJ : PSHEET) : h == 'gohan' ? (ssj ? HSSJ : HSHEET) : (ssj && GSSJ ? GSSJ : GSHEET);
XSH.gotenks = ssj => { const k = 'g' + (ssj ? 1 : 0); if (!XS5[k]) { XS5[k] = mk(2048, 1024); paintSheet(XS5[k], PALS.gtk, ssj ? 1 : 0); } return XS5[k]; };
for (const h of ['goku', 'pic', 'gohan', 'vegeta', 'trunks', 'kri', 'gotenks']) { const old = XSH[h];
  XSH[h] = ssj => {
    const mm = !!(S && S.mode != 'menu' && S.ps && S.ps.mm > 0), s3 = h == 'goku' && ssj && RU('ss3'), mv = h == 'vegeta' && ssj && RU('mveg');
    if (!mm && !s3 && !mv) return baseSheet(h, ssj, old);
    const key = h + (ssj ? 1 : 0) + (mm || mv ? 'm' : '') + (s3 ? 'x' : '') + (h == 'vegeta' && vegAlt() ? 's' : '');
    if (!XS5[key]) { XS5[key] = mk(2048, 1024); paintSheet(XS5[key], Object.assign({}, basePal(h, ssj), { mm: mm || mv ? 1 : 0, ss3: s3 ? 1 : 0 }), ssj ? 1 : 0); }
    return XS5[key];
  }; }

/* ---------- Shenron's blessing (Yakon): wishes also heal ---------- */
{ const _m = mythic; mythic = function (g, k) { const r = _m(g, k); if (RU('wishh')) { S.p.max += 10; S.p.hp = S.p.max; if (S.nums.length < 40) S.nums.push({ x: S.p.x, y: S.p.y - 30, v: 'FULL HEAL', l: 1, c: '#7dff8a' }); } return r; }; }

/* ---------- milestones for fusions ---------- */
Object.assign(UNL_NAME, { 'w:ghost': 'Ghost Kamikaze', fusion3: '3 more Fusion Dance recipes (Kaioken Wolf Fang, Sweet Ghost Parade, Hellzone Tri-Cage)' }); UNL_ICON.fusion3 = '🤝';
for (const a of [
  { id: 'm19', c: 'mile', n: 'Dance Partners', d: 'Perform a Fusion Dance', r: ['fusion3', 'z:600'], pg: () => [Math.min(1, P.fus || 0), 1] },
  { id: 'm20', c: 'mile', n: 'Fusion Master', d: 'Perform 10 Fusion Dances in total', r: ['z:1500'], pg: () => [P.fus || 0, 10] }
]) { a.t = a.t || (() => a.pg()[0] >= a.pg()[1]); ACH.push(a); ACH_BY[a.id] = a; }

document.head.insertAdjacentHTML('beforeend', `<style>
.up.fuse{background:linear-gradient(135deg,#4a2a7a,#2a1a4a);border-color:#ffd23a}
.up.fuse b{color:#ffe27a}
.fw{color:#9affc0}
</style>`);
