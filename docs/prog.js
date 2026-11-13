/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — PROGRESSION (EXPANSION_PLAN.md §3-4)
   Achievements, unlocks, lifetime stats, the one-time 3.0 save wipe,
   and the gates that keep locked content out of runs.
   Unlocks earned during a run take effect from the NEXT run.
   ===================================================================== */
'use strict';
V2.ver = '3.0';

/* ---------- unlock keys ---------- */
// w:<attack>  p:<passive>  s:<shop item>  h:<hero>  plus feature flags
const BASE_UNL = new Set(['w:blast', 'w:sbc', 'w:masenko', 'w:kame', 'p:amt', 'p:zen', 'p:area',
  's:hp', 's:dmg', 's:spd', 's:xp', 'h:goku', 'h:pic', 'h:gohan', 'lvl1']);
const UNL_NAME = {
  kiburst: 'Ki Burst ultimate', dragonballs: 'Dragon Balls', chambers: 'Hyperbolic Time Chambers',
  lvl2: 'Level 2: Planet Namek', lvl3: 'Level 3: Androids & Cell',
  'h:vegeta': 'Vegeta (playable hero)', 'h:krillin': 'Krillin (playable hero)',
  timefreeze: 'Time Freeze pickup', vacuum: 'Capsule Vacuum pickup', ginyu: 'Ginyu Force Challenges',
  limitbreak: 'Limit Break', scouter: 'Scouter power-level readout', wish4: 'A 4th wish choice from Shenron',
  'alt:vegeta': 'Vegeta alt colours: Saiyan-saga armour',
  's:seal': 'Shop: Mafuba Seal (banish)', 's:slot': 'Shop: Potential Unleashed (5th attack slot)',
  'w:galick': 'Galick Gun', 'w:wave': 'Explosive Wave', 'w:tri': 'Tri-Beam', 'w:wolf': 'Wolf Fang Fist',
  'w:after': 'Afterimage Strike', 'w:scatter': 'Scattering Bullet'
};
const UNL_ICON = { kiburst: '⚡', dragonballs: '🐉', chambers: '⏳', lvl2: '🪐', lvl3: '🏙️', 'h:vegeta': '👑', 'h:krillin': '🥋',
  timefreeze: '⏱️', vacuum: '💊', ginyu: '💪', limitbreak: '♾️', scouter: '📟', wish4: '🌟', 'alt:vegeta': '🎨', 's:seal': '🏺', 's:slot': '➕' };
function unlName(u) {
  if (u.startsWith('z:')) return '+' + (+u.slice(2)).toLocaleString() + ' Zeni';
  if (UNL_NAME[u]) return UNL_NAME[u];
  const [t, k] = u.split(':');
  if ((t == 'w' || t == 'p') && INFO[k]) return (t == 'p' ? 'Passive: ' : '') + (BASE[k] || INFO[k][0]).replace(/^★ /, '');
  if (t == 's' && UPG[k]) return 'Shop: ' + UPG[k][0];
  return u;
}
function unlIcon(u) {
  const [t, k] = u.split(':');
  if ((t == 'w' || t == 'p') && INFO[k]) { try { return `<img class="ic" src="${iurl(k)}" alt="">`; } catch (e) { } }
  return `<span class="ic em">${u.startsWith('z:') ? '💰' : UNL_ICON[u] || (t == 's' ? '🛒' : t == 'w' ? '💥' : '🔓')}</span>`;
}

/* ---------- lifetime progress (dbs_prog) ---------- */
const PROG_NEW = () => ({ unl: {}, ach: {}, kills: 0, discK: 0, zeni: 0, bestLv: 0, bestT: 0, bk: {}, wishes: 0, runs: 0, deaths: 0, clr: {}, evo: {}, balls: 0, elites: 0 });
let P = PROG_NEW(), PROG_READY = false;
function loadProg() { P = PROG_NEW(); try { Object.assign(P, JSON.parse(store.getItem('dbs_prog') || '{}')); } catch (e) { } U2 = HAS('lvl2'); }
function saveProg() { if (PROG_READY) try { store.setItem('dbs_prog', JSON.stringify(P)); } catch (e) { } }
const HAS = u => BASE_UNL.has(u) || !!P.unl[u];
const heroKey = h => h == 'kri' ? 'h:krillin' : 'h:' + h;
// unlocks are snapshotted at run start: what you earn mid-run arrives next run
const RU = u => S && S.U ? !!S.U[u] : HAS(u);
function snapUnl() { const o = {}; for (const u of BASE_UNL) o[u] = 1; for (const u in P.unl) if (P.unl[u]) o[u] = 1; return o; }

/* ---------- achievements ---------- */
// c: story | mile | secret.  t(): condition checked live.  pg(): [current, goal] for progress bars.
// ev: only checked on that event ('death' | 'win').  r: rewards (unlock keys, or z:<zeni>).
const kills = () => P.kills, bestLv = () => Math.max(P.bestLv, S && S.p ? S.p.lv : 0);
const ACH = [
  { id: 's1', c: 'story', n: 'Saiyan Arrival', d: 'Survive 1:00 on Level 1', r: ['p:sen', 'w:aura'], t: () => S.stage == 1 && S.t >= 60 },
  { id: 's2', c: 'story', n: "Brother's Keeper", d: 'Defeat Raditz', r: ['kiburst', 's:ult'], t: () => P.bk.rad },
  { id: 's3', c: 'story', n: 'Bald Brute', d: 'Defeat Nappa', r: ['dragonballs', 'p:rad', 'w:hell'], t: () => P.bk.nap },
  { id: 's4', c: 'story', n: 'Prince of All Saiyans', d: 'Defeat Vegeta and clear Level 1', r: ['lvl2', 'h:vegeta', 'w:galick'], t: () => P.bk.veg },
  { id: 's5', c: 'story', n: 'Planet Namek', d: 'Survive 10:00 on Level 2', r: ['s:magnet'], t: () => S.stage == 2 && !S.endless && S.t >= 600 },
  { id: 's6', c: 'story', n: 'Ultra Fighting Bomber', d: 'Defeat Recoome', r: ['w:wave'], t: () => P.bk.rec },
  { id: 's7', c: 'story', n: 'Fastest in the Universe', d: 'Defeat Burter and Jeice', r: ['w:after'], t: () => P.bk.bur && P.bk.jei },
  { id: 's8', c: 'story', n: 'Time Stands Still', d: 'Defeat Guldo', r: ['timefreeze'], t: () => P.bk.gul },
  { id: 's9', c: 'story', n: 'Special Fighting Pose', d: 'Defeat Captain Ginyu', r: ['ginyu'], t: () => P.bk.gin },
  { id: 's9a', c: 'story', n: 'Emperor of the Universe', d: 'Defeat Frieza (first form)', r: ['z:600'], t: () => P.bk.fr1 },
  { id: 's9b', c: 'story', n: 'Fearsome Transformation', d: "Defeat Frieza's second form", r: ['z:900'], t: () => P.bk.fr2 },
  { id: 's10', c: 'story', n: 'Namek is Free', d: "Defeat Frieza's Final Form", r: ['lvl3', 'limitbreak', 's:slot'], t: () => P.bk.fr3 },

  { id: 'm1', c: 'mile', n: 'Snake Way', d: 'Fall in battle for the first time', r: ['s:revive', 'chambers'], ev: 'death' },
  { id: 'm2', c: 'mile', n: 'Warrior', d: 'Defeat 2,000 enemies in total', r: ['p:spd', 'w:disc'], pg: () => [kills(), 2000] },
  { id: 'm3', c: 'mile', n: 'Hardened', d: 'Survive 5:00 in a single run', r: ['p:arm', 'w:flare'], pg: () => [Math.floor(Math.max(P.bestT, S && S.mode != 'menu' ? S.t : 0)), 300], fmt: 1 },
  { id: 'm4', c: 'mile', n: 'Power Within', d: 'Evolve any attack', r: ['p:cdr', 'w:bomb', 's:area'], t: () => Object.keys(P.evo).length >= 1 },
  { id: 'm5', c: 'mile', n: 'Level Up!', d: 'Reach level 20 in a single run', r: ['s:rr'], pg: () => [bestLv(), 20] },
  { id: 'm6', c: 'mile', n: 'Veteran', d: 'Defeat 15,000 enemies in total', r: ['w:tri'], pg: () => [kills(), 15000] },
  { id: 'm7', c: 'mile', n: 'Legendary', d: 'Transform: evolve 3 attacks in one run', r: ['w:thunder'], t: () => S.ssj },
  { id: 'm8', c: 'mile', n: 'Eternal Dragon', d: 'Gather all 7 Dragon Balls and make a wish', r: ['wish4', 'z:500'], t: () => P.wishes >= 1 },
  { id: 'm9', c: 'mile', n: 'Full Arsenal', d: 'Hold 4 attacks and 5 passives at once', r: ['s:seal'], t: () => own('w') >= LIM.w && own('ps') >= LIM.ps },
  { id: 'm10', c: 'mile', n: 'Capsule Corp Investor', d: 'Earn 5,000 Zeni in total', r: ['s:greed'], pg: () => [P.zeni, 5000] },
  { id: 'm17', c: 'mile', n: 'Dragon Hunter', d: 'Collect 10 Dragon Balls in total', r: ['s:armor'], pg: () => [P.balls || 0, 10] },
  { id: 'm18', c: 'mile', n: 'Elite Hunter', d: 'Defeat 25 elite enemies in total', r: ['z:500'], pg: () => [P.elites || 0, 25] },
  { id: 'm11', c: 'mile', n: 'Over the Limit', d: 'Reach level 25 in a single run', r: ['vacuum'], pg: () => [bestLv(), 25] },
  { id: 'm12', c: 'mile', n: 'Saiyan Army', d: 'Defeat 40,000 enemies in total', r: ['z:1000'], pg: () => [kills(), 40000] },
  { id: 'm13', c: 'mile', n: 'Hero of Earth', d: 'Clear Level 1 with Goku, Piccolo and Gohan', r: ['z:1000'], pg: () => [['goku', 'pic', 'gohan'].filter(h => P.clr[1] && P.clr[1][h]).length, 3] },
  { id: 'm14', c: 'mile', n: 'Slayer I', d: 'Defeat 75,000 enemies in total', r: ['z:1500'], pg: () => [kills(), 75000] },
  { id: 'm15', c: 'mile', n: 'Slayer II', d: 'Defeat 150,000 enemies in total', r: ['z:2500'], pg: () => [kills(), 150000] },
  { id: 'm16', c: 'mile', n: 'Slayer III', d: 'Defeat 300,000 enemies in total', r: ['z:4000'], pg: () => [kills(), 300000] },

  { id: 'x1', c: 'secret', n: "Yamcha'd", h: 'Even the best fall early.', d: 'Fall within the first 1:30 of a run', r: ['w:wolf'], ev: 'death', t: () => S.t < 90 },
  { id: 'x2', c: 'secret', n: "It's Over 9000!", h: 'What does the scouter say?', d: 'Deal over 9,000 damage to a single boss within 10 seconds', r: ['scouter', 'z:900'], t: () => (S.pk || 0) > 9000 },
  { id: 'x3', c: 'secret', n: 'Bald Destiny', h: 'A disc for a friend.', d: 'Defeat 5,000 enemies with Destructo Disc in total', r: ['h:krillin', 'w:scatter'], pg: () => [P.discK, 5000] },
  { id: 'x4', c: 'secret', n: 'Untouchable', h: 'Not a scratch.', d: 'Defeat Nappa without taking damage during the fight', r: ['z:500'], t: () => S.bkr && S.bkr.nap && !S.napHurt },
  { id: 'x5', c: 'secret', n: 'Kakarot!', h: 'Never give up.', d: 'Defeat Vegeta as Goku while below 10% HP', r: ['z:500'], t: () => S.kak },
  { id: 'x6', c: 'secret', n: 'Senzu Addict', h: 'Korin is worried.', d: 'Eat 50 Senzu Beans in one run', r: ['z:300'], t: () => (S.beanN || 0) >= 50 },
  { id: 'x7', c: 'secret', n: 'Instant Transmission', h: 'Two in a blink.', d: 'Grab 2 Dragon Balls within 10 seconds', r: ['z:300'], t: () => S.db2 },
  { id: 'x8', c: 'secret', n: "Prince's Pride", h: 'A rematch.', d: 'Defeat Vegeta as Vegeta', r: ['alt:vegeta'], t: () => S.vegVeg },
  { id: 'x9', c: 'secret', n: 'Body Change!', h: 'Strike a pose.', d: 'Defeat all 5 Ginyu Force members in one run without dropping below 50% HP', r: ['z:800'],
    t: () => S.bkr && ['rec', 'bur', 'jei', 'gul', 'gin'].every(k => S.bkr[k]) && (S.minHpF ?? 1) >= .5 },
  { id: 'x10', c: 'secret', n: 'Final Flash', h: 'Overkill.', d: 'Defeat 150 enemies with a single Ki Burst', r: ['z:500'], t: () => (S.ultKmax || 0) >= 150 }
];
const ACH_BY = Object.fromEntries(ACH.map(a => [a.id, a]));
const achFor = u => ACH.find(a => a.r.includes(u));
const achDone = a => !!P.ach[a.id];

function achMet(a, ev) {
  if (a.ev && a.ev !== ev) return false;
  try {
    if (a.pg) { const [c, g] = a.pg(); return c >= g; }
    return a.t ? !!a.t() : !!a.ev;
  } catch (e) { return false; }
}
function progCheck(ev) {
  if (!PROG_READY) return;
  for (const a of ACH) if (!achDone(a) && achMet(a, ev)) grantAch(a);
}
function grantAch(a) {
  P.ach[a.id] = Date.now();
  for (const r of a.r) {
    if (r.startsWith('z:')) { META.zeni += +r.slice(2); saveMeta(); }
    else P.unl[r] = 1;
  }
  U2 = HAS('lvl2'); saveProg();
  if (S && S.mode != 'menu') { (S.newA || (S.newA = [])).push(a.id); if (S.mode == 'play') achToast(a); }
}

/* ---------- toast (non-blocking, top of screen) ---------- */
const TQ = [];
function achToast(a) { TQ.push(a); if (TQ.length == 1) toastNext(); }
function toastNext() {
  const a = TQ[0]; if (!a) return;
  let d = document.getElementById('achT'); if (!d) { d = document.createElement('div'); d.id = 'achT'; document.body.append(d); }
  const rw = a.r.map(unlName).join(' · ');
  d.innerHTML = `<div class="at1">🏆 ${a.c == 'secret' ? 'SECRET ' : ''}ACHIEVEMENT</div><div class="at2">${a.n}</div><div class="at3">${rw}${a.r.some(r => !r.startsWith('z:')) ? ' <i>(next run)</i>' : ''}</div>`;
  d.className = 'on'; try { sfxPlay('chest'); } catch (e) { }
  setTimeout(() => { d.className = ''; setTimeout(() => { TQ.shift(); toastNext(); }, 350); }, 3200);
}

/* ---------- stat tracking hooks ---------- */
let HSRC = '';
{ const _d = discTick; discTick = function (dt) { HSRC = 'disc'; try { return _d(dt); } finally { HSRC = ''; } }; }
// damage dealt to one boss in the last 10 seconds (for "It's Over 9000!"): running sum over a 10 s window
{ const _h = hitE; hitE = function (e, d) {
    if (e.boss && S.mode == 'play' && !e.dead && d > 0) { const t = S.t, w = e._pw || (e._pw = { q: [], s: 0 }); w.q.push(t, d); w.s += d;
      while (w.q.length && t - w.q[0] > 10) { w.s -= w.q[1]; w.q.splice(0, 2); }
      if (w.s > (S.pk || 0)) S.pk = w.s; }
    return _h(e, d); }; }
{ const _k = killE; killE = function (e) {
    const was = e.dead; _k(e); if (was || !e.dead) return;
    P.kills++; if (HSRC == 'disc') P.discK++; if (e.elite) P.elites = (P.elites || 0) + 1;
    if (e.boss) { P.bk[e.k] = 1; (S.bkr || (S.bkr = {}))[e.k] = 1;
      if (e.k == 'veg') { if (S.hero == 'goku' && S.p.hp < S.p.max * .1) S.kak = 1; if (S.hero == 'vegeta') S.vegVeg = 1; } }
  }; }
{ const _bg = ballGot; ballGot = function (b) { P.balls = (P.balls || 0) + 1; (S.dbTs || (S.dbTs = [])).push(S.t); const n = S.dbTs.length; if (n > 1 && S.dbTs[n - 1] - S.dbTs[n - 2] <= 10) S.db2 = 1; return _bg(b); }; }
{ const _my = mythic; mythic = function (g, k) { P.wishes++; saveProg(); return _my(g, k); }; }
{ const _pk = pick; pick = function (g, k, r) { if (g == 'e') P.evo[k] = 1; return _pk(g, k, r); }; }
{ const _uf = ultFire; ultFire = function () {
    if (!RU('kiburst')) return; const ready = (S.ult || 0) >= 100 && S.mode == 'play';
    if (ready) { S.ultK0 = P.kills; S.ultT = S.t; } return _uf(); }; }
{ const _az = awardZeni; awardZeni = function (win) { const z = _az(win); P.zeni += z; return z; }; }

/* ---------- per-frame: gates + live checks ---------- */
{ const _u = update; update = function (dt) {
    if (!RU('chambers')) { S.shr = null; S.shT2 = 60; }
    const hp0 = S.p.hp, beans0 = S.beans.slice();
    _u(dt);
    if (!RU('kiburst')) { S.ult = 0; S.ultHint = 1; }
    // stats for secrets
    if (S.p.hp < hp0 - .01 && S.en.some(e => e.k == 'nap' && !e.dead)) S.napHurt = 1;
    if (S.beans.length < beans0.length || beans0.some(b => b.got)) { let n = 0; for (const b of beans0) if (b.got) n++; S.beanN = (S.beanN || 0) + n; }
    S.minHpF = Math.min(S.minHpF ?? 1, S.p.hp / S.p.max);
    if (S.ultT !== undefined && S.t - S.ultT < 1) S.ultKmax = Math.max(S.ultKmax || 0, P.kills - S.ultK0);
    S._pc = (S._pc || 0) - dt; if (S._pc <= 0) { S._pc = .5; P.bestLv = Math.max(P.bestLv, S.p.lv); progCheck('tick'); }
  }; }
{ const _ub = updBalls; updBalls = function (dt) { if (!RU('dragonballs')) { S.balls.length = 0; S.dbT = 45; return; } return _ub(dt); }; }
{ const _op = offerPool; offerPool = function () { return _op().filter(([g, k]) => RU((g == 'w' ? 'w:' : 'p:') + k)); }; }
{ const _in = init; init = function () { _in(); S.U = snapUnl(); S.newA = []; }; }
ub.onclick = () => ultFire();   // was bound to the original function, bypassing wrappers
unlock = function () { };   // level unlocks now come from achievements
setInterval(() => { document.body.classList.toggle('noult', !!(S && S.mode == 'play' && !RU('kiburst'))); }, 150);
setInterval(() => { if (S && (S.mode == 'play' || S.mode == 'pause')) saveProg(); }, 8000);

/* ---------- run end: death/win events, then the unlock reveal ---------- */
{ const _ec = endCard; endCard = function (win) {
    const reviving = !win && (META.revive || 0) > 0 && !S.revived && S.p.hp <= 0;
    if (!reviving) {
      P.runs++; P.bestT = Math.max(P.bestT, Math.floor(S.t)); P.bestLv = Math.max(P.bestLv, S.p.lv);
      if (win) { const st = S.stage || 1; (P.clr[st] || (P.clr[st] = {}))[S.hero] = 1; progCheck('win'); }
      else { P.deaths++; progCheck('death'); }
      progCheck('tick'); saveProg();
    }
    const r = _ec(win);
    if (!reviving && S.newA && S.newA.length) revealStart(S.newA.slice());
    return r;
  }; }
let RV = null;
function revealStart(ids) { RV = { ids, i: 0, back: ov.innerHTML }; revealShow(); }
function revealShow() {
  const a = ACH_BY[RV.ids[RV.i]], n = RV.ids.length;
  show(`<div class="card dbz reveal"><div class="rvh">${a.c == 'secret' ? 'SECRET ACHIEVEMENT' : 'ACHIEVEMENT UNLOCKED'}${n > 1 ? ` <small>${RV.i + 1} / ${n}</small>` : ''}</div>
    <div class="rvt">🏆</div><h2>${a.n}</h2><p class="rvd">${a.d}</p>
    <div class="rvl">${a.r.map(u => `<div class="rvi">${unlIcon(u)}<span>${unlName(u)}</span></div>`).join('')}</div>
    ${a.r.some(r => !r.startsWith('z:')) ? '<p class="rvn">Unlocked for your next run!</p>' : ''}
    <button class="go" onclick="revealNext()">${RV.i + 1 < n ? 'Next' : 'Continue'}</button></div>`);
  try { sfxPlay('lvl'); } catch (e) { }
}
function revealNext() { RV.i++; if (RV.i < RV.ids.length) revealShow(); else { const b = RV.back; RV = null; show(b); } }

/* ---------- menus: Achievements + Collection ---------- */
function achScreen() {
  const done = ACH.filter(achDone).length;
  const sec = (c, title) => `<h3 class="ach-h">${title}</h3><div class="ach-g">` + ACH.filter(a => a.c == c).map(a => {
    const ok = achDone(a), hid = a.c == 'secret' && !ok;
    let bar = '';
    if (a.pg && !ok && !hid) { const [c0, g] = a.pg(), f = Math.max(0, Math.min(1, c0 / g));
      bar = `<span class="sbar"><i style="width:${Math.round(f * 100)}%"></i></span><span class="apg">${a.fmt ? fmt(Math.min(c0, g)) + ' / ' + fmt(g) : Math.min(c0, g).toLocaleString() + ' / ' + g.toLocaleString()}</span>`; }
    return `<div class="ach${ok ? ' ok' : ''}${hid ? ' hid' : ''}"><div class="at">${ok ? '🏆' : hid ? '❔' : '🔒'}</div><div class="ab">
      <b>${hid ? '??? Secret' : a.n}</b><small>${hid ? '“' + a.h + '”' : a.d}</small>${bar}
      ${hid ? '' : `<div class="arw">${a.r.map(u => `<span>${unlIcon(u)}${unlName(u)}</span>`).join('')}</div>`}</div></div>`;
  }).join('') + '</div>';
  show(`<div class="card dbz achs"><div class="dhead"><span class="db4"></span><h2>Achievements</h2><div class="zeni">${done} / ${ACH.length}</div></div>
    <div class="achsc">${sec('story', 'Story')}${sec('mile', 'Milestones')}${sec('secret', 'Secrets')}${ACH.some(a => a.c == 'chal') ? sec('chal', 'Ginyu Force Challenges') : ''}</div><button class="go" onclick="menu()">Back</button></div>`);
}
// every attack and passive, with its evolution partner; future attacks listed as locked
const COL_W = ['blast', 'kame', 'sbc', 'masenko', 'aura', 'disc', 'flare', 'bomb', 'hell', 'thunder', 'galick', 'wave', 'tri', 'wolf', 'after', 'scatter'];
const COL_P = ['zen', 'amt', 'area', 'sen', 'spd', 'arm', 'cdr', 'rad'];
const lockText = u => { const a = achFor(u); if (!a) return 'Coming soon'; return a.c == 'secret' && !achDone(a) ? 'Secret achievement' : a.n + ': ' + a.d; };
function colScreen() {
  const cell = (g, k) => {
    const u = g + ':' + k, ok = HAS(u), built = !!INFO[k];
    const nm = built ? (BASE[k] || INFO[k][0]).replace(/^★ /, '') : (UNL_NAME[u] || k);
    let ev = '';
    if (g == 'w' && EVO[k]) { const pa = EVO[k][2], seen = P.evo[k]; ev = `<small class="cev">${seen ? '★ ' + EVO[k][0] : '★ ???'} · with ${HAS('p:' + pa) ? (INFO[pa] ? INFO[pa][0] : pa) : '???'}</small>`; }
    if (g == 'p') { const ws = Object.keys(EVO).filter(w => EVO[w][2] == k).map(w => HAS('w:' + w) ? (BASE[w] || INFO[w][0]) : '???');
      ev = `<small class="cev">Evolves ${ws.join(', ') || '—'}</small>`; }
    return `<div class="col${ok ? '' : ' lk'}">${ok && built ? unlIcon(u) : '<span class="ic em">' + (ok ? '✨' : '🔒') + '</span>'}<div><b>${ok ? nm : achFor(u) && achFor(u).c == 'secret' && !achDone(achFor(u)) ? '???' : nm}</b>
      ${ok ? (built ? ev : '<small class="cev">Arrives in a later build</small>') : `<small class="cev">🔒 ${lockText(u)}</small>`}</div></div>`;
  };
  const nW = COL_W.filter(k => HAS('w:' + k)).length, nP = COL_P.filter(k => HAS('p:' + k)).length;
  show(`<div class="card dbz achs"><div class="dhead"><span class="db4"></span><h2>Collection</h2><div class="zeni">${nW + nP} / ${COL_W.length + COL_P.length}</div></div>
    <div class="achsc"><h3 class="ach-h">Attacks <small>${nW} / ${COL_W.length}</small></h3><div class="col-g">${COL_W.map(k => cell('w', k)).join('')}</div>
    <h3 class="ach-h">Passives <small>${nP} / ${COL_P.length}</small></h3><div class="col-g">${COL_P.map(k => cell('p', k)).join('')}</div></div>
    <button class="go" onclick="menu()">Back</button></div>`);
}

/* ---------- menu: buttons, locked heroes, locked level ---------- */
const LOCKED_HEROES = [['h:vegeta', 'Vegeta', 'Defeat Vegeta', 'vegeta'], ['h:krillin', 'Krillin', 'Secret', 'kri']];
{ const _m = menu; menu = function () {
    _m(); if (!PROG_READY) return;
    if (V2.welcome3) { welcome3(); return; }
    const c = ov.querySelector('.in') || ov.querySelector('.card'); if (!c) return;
    const sb = [...c.querySelectorAll('button')].find(b => /shop\(\)/.test(b.getAttribute('onclick') || ''));
    const done = ACH.filter(achDone).length;
    const html = `<div class="mrow"><button onclick="achScreen()">🏆 Achievements <small>${done}/${ACH.length}</small></button><button onclick="colScreen()">📖 Collection</button></div>`;
    if (sb) sb.insertAdjacentHTML('afterend', html); else c.insertAdjacentHTML('beforeend', html);
    const hs = c.querySelector('.heroes');
    if (hs) for (const [u, n, req, h] of LOCKED_HEROES) {
      const a = achFor(u), sec = a && a.c == 'secret' && !achDone(a), H3 = typeof HERO3 != 'undefined' && HERO3[h];
      if (HAS(u) && H3) hs.insertAdjacentHTML('beforeend', `<button class="hb${HERO == h ? ' sel' : ''}" onclick="setHero('${h}')"><canvas class="hc" data-h="${h}" width="128" height="128"></canvas><b>${n}</b><small>${H3.d}</small></button>`);
      else hs.insertAdjacentHTML('beforeend', `<button class="hb lk" disabled><span class="hq">?</span><b>${sec ? '???' : n}</b><small>${HAS(u) ? 'Coming in a later build' : '🔒 ' + req}</small></button>`);
    }
    if (hs) { const sel = hs.querySelector('.hb.sel'); hs.classList.add('cmp');
      if (sel) hs.insertAdjacentHTML('afterend', `<p class="hdesc"><b>${sel.querySelector('b').textContent}</b> · ${sel.querySelector('small').textContent}</p>`); }
    const vb = c.querySelector('.ver'); if (vb) vb.textContent = V2.ver;
    const how = c.querySelector('.how'); if (how && !HAS('kiburst')) how.textContent = 'Drag anywhere or use WASD to move. Attacks fire automatically.';
    const lk = c.querySelector('.lock'); if (lk && !HAS('lvl2')) lk.textContent = 'Level 2: Planet Namek (defeat Vegeta to unlock)';
  }; }
function welcome3() {
  show(`<div class="card dbz reveal"><div class="rvh">DRAGON BALL SURVIVORS 3.0</div><div class="rvt">🐉</div><h2>Your journey starts over!</h2>
    <p class="rvd">3.0 is a fresh start for everyone: your Zeni, upgrades and unlocks have been reset.</p>
    <p class="rvd">You begin with Ki Blast, Kamehameha, Special Beam Cannon and Masenko. Defeat bosses and hit milestones to unlock new attacks, passives, heroes, levels and more. Check <b>🏆 Achievements</b> to see what's next.</p>
    <button class="go" onclick="V2.welcome3=0;menu()">Let's go!</button></div>`);
}

/* ---------- shop: locked items show what unlocks them ---------- */
shop = function () {
  const cells = Object.keys(UPG).map(k => {
    const [n, d, mx] = UPG[k], l = META[k], c = ucost(k, l), mxd = l >= mx, poor = !mxd && META.zeni < c;
    if (!HAS('s:' + k) && !l) { const a = achFor('s:' + k), sec = a && a.c == 'secret' && !achDone(a);
      return `<div class="supw"><button class="sup lk" disabled><span class="sn">🔒 ${n}</span><span class="sd">${sec ? 'Unlocked by a secret achievement' : a ? a.n + ': ' + a.d : 'Coming soon'}</span></button></div>`; }
    return `<div class="supw"><button class="sup${mxd ? ' max' : ''}${poor ? ' poor' : ''}" ${mxd ? 'disabled' : `onclick="buyU('${k}')"`}>
      <span class="sn">${n}</span><span class="sd">${d}</span>
      <span class="sbar"><i style="width:${Math.round(l / mx * 100)}%"></i></span>
      <span class="sf"><span>Lv ${l}/${mx}</span><b>${mxd ? 'MAX' : 'Ƶ ' + c}</b></span></button>${l > 0 ? `<button class="sref" onclick="refundU('${k}')" aria-label="Refund one level of ${n}" title="Refund one level (Ƶ ${ucost(k, l - 1)})">−</button>` : ''}</div>`;
  }).join('');
  const sp = spentAll();
  show(`<div class="card dbz shop"><div class="dhead"><span class="db4"></span><h2>Capsule Corp</h2><div class="zeni">Ƶ ${META.zeni}</div></div>
    <div class="sgrid">${cells}</div><div class="sfoot">${sp ? `<button class="sra${V2.raConf ? ' conf' : ''}" onclick="refundAll()">${V2.raConf ? 'Tap again to refund everything' : 'Refund all'} <small>(Ƶ ${sp})</small></button>` : ''}<button class="go" onclick="menu()">Back</button></div></div>`);
};
{ const _b = buyU; buyU = function (k) { if (!HAS('s:' + k)) return; return _b(k); }; }

/* ---------- save wipe for 3.0 + backup codes ---------- */
// Keeps preferences only. Runs after the IndexedDB copy has been read, so a phone that only
// keeps IndexedDB can't be wiped twice.
const PROG_KEEP = /^dbs_(set|gfx|diff|hero|probe|ts|v)$/;
function wipeIfOld() {
  if (store.getItem('dbs_v') === '3') return false;
  for (const k of store.keys()) if (/^dbs_/.test(k) && !PROG_KEEP.test(k)) store.removeItem(k);
  for (const k in META) META[k] = 0;
  store.setItem('dbs_v', '3'); saveMeta(); V2.welcome3 = 1; svLast = '';
  return true;
}
function progBoot() {
  const wiped = wipeIfOld();
  loadProg(); PROG_READY = true;
  if (!HAS(heroKey(HERO))) HERO = 'goku';
  if (wiped && svWelcomeOn) { svWelcomeOn = false; menu(); }   // a 2.x saved run was on screen
  else if (S.mode == 'menu') menu();
}
{ const _rp = reloadPersisted; reloadPersisted = function () { _rp(); if (PROG_READY) { wipeIfOld(); loadProg(); if (!HAS(heroKey(HERO))) HERO = 'goku'; } }; }
// a 2.x backup code only restores settings in 3.0
{ const _bp = bkParse; bkParse = function (s) { const d = _bp(s); if (d && d.dbs_v !== '3') for (const k of Object.keys(d)) if (!PROG_KEEP.test(k)) delete d[k]; return d; }; }
store.hydrate(() => progBoot());

// developer helpers (console only): PROGDEV.grantAll(), PROGDEV.reset(), PROGDEV.grant('s3')
window.PROGDEV = {
  grant: id => { const a = ACH_BY[id]; if (a && !achDone(a)) grantAch(a); },
  grantAll: () => { for (const a of ACH) if (!achDone(a)) grantAch(a); menu(); },
  reset: () => { P = PROG_NEW(); saveProg(); U2 = false; menu(); }
};

/* ---------- styles ---------- */
{ const st = document.createElement('style'); st.textContent = `
body.noult #ub{display:none!important}
#achT{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 62px);transform:translate(-50%,-20px);opacity:0;transition:transform .3s,opacity .3s;z-index:60;pointer-events:none;
 background:linear-gradient(180deg,#6a3a08,#3a1e04);border:2px solid #ffd27a;border-radius:12px;padding:7px 14px;text-align:center;box-shadow:0 4px 18px rgba(0,0,0,.5),0 0 14px rgba(255,180,40,.45);max-width:min(90vw,420px);font-family:system-ui,sans-serif}
#achT.on{opacity:1;transform:translate(-50%,0)}
#achT .at1{font:800 10px system-ui,sans-serif;letter-spacing:.12em;color:#ffd27a}#achT .at2{font:800 16px system-ui,sans-serif;color:#fff}#achT .at3{font-size:12px;color:#ffe9b8}#achT i{opacity:.7}
.mrow{display:flex;gap:6px}.mrow button{flex:1;text-align:center}
.hb.lk{opacity:.6}.hb .hq{display:block;width:64px;height:64px;margin:0 auto 2px;border-radius:50%;background:radial-gradient(circle,#2a1a0a,#0e0804);color:#ffd27a;font:800 34px/64px system-ui,sans-serif}
.heroes .hb{flex:1 1 0}.hb.lk small{opacity:.85}.heroes.cmp .hb:not(.lk) small{display:none}.hdesc{margin:2px 0 8px;font-size:13px;text-align:center;opacity:.9}.hdesc b{color:#ffd27a}
@media (max-width:600px){.hb .hq{width:46px;height:46px;font-size:26px;line-height:46px}}
.card .sup.lk{opacity:.55;filter:grayscale(.6)}
.reveal{text-align:center;max-width:420px}.reveal .rvh{font:800 12px system-ui,sans-serif;letter-spacing:.14em;color:#ffd27a}.reveal .rvh small{opacity:.7;margin-left:6px}
.reveal .rvt{font-size:52px;margin:6px 0 0;filter:drop-shadow(0 0 12px rgba(255,190,40,.7));animation:rvp .6s ease-out}
@keyframes rvp{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
.reveal h2{margin:4px 0}.reveal .rvd{opacity:.85;margin:4px 0 8px}.reveal .rvn{color:#7dff8a;font-size:13px;margin:6px 0}
.rvl{display:flex;flex-direction:column;gap:6px;margin:6px 0}.rvi{display:flex;align-items:center;gap:10px;background:rgba(0,0,0,.3);border:1px solid rgba(255,210,122,.35);border-radius:10px;padding:6px 10px;text-align:left;font-weight:700}
.ic{width:34px;height:34px;flex:0 0 34px;border-radius:8px}.ic.em{display:inline-flex;align-items:center;justify-content:center;font-size:22px;background:rgba(0,0,0,.35)}
.achs{max-width:640px}.achsc{max-height:62vh;overflow:auto;margin:0 -4px 8px;padding:0 4px}
.ach-h{margin:10px 0 6px;font-size:14px;color:#ffd27a;letter-spacing:.06em;text-transform:uppercase}.ach-h small{opacity:.7}
.ach-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:6px}
.ach{text-align:left;display:flex;gap:8px;align-items:flex-start;background:rgba(0,0,0,.3);border:1px solid rgba(255,210,122,.25);border-radius:10px;padding:7px 8px}
.ach.ok{border-color:#ffd27a;background:linear-gradient(180deg,rgba(106,74,12,.55),rgba(58,38,6,.55))}.ach.hid{opacity:.75}
.ach .at{font-size:24px;line-height:1}.ach .ab{flex:1;min-width:0}.ach b{display:block;color:#fff4e0}.ach small{display:block;opacity:.8;font-size:11.5px}
.ach .sbar{display:block;height:5px;border-radius:3px;background:rgba(0,0,0,.45);overflow:hidden;margin-top:4px}.ach .sbar i{display:block;height:100%;background:linear-gradient(90deg,#ffe27a,#ff9a1f)}
.ach .apg{font-size:10.5px;color:#ffd27a}
.arw{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.arw span{display:inline-flex;align-items:center;gap:4px;font-size:11px;background:rgba(0,0,0,.35);border-radius:6px;padding:2px 6px 2px 2px;color:#ffe9b8}
.arw .ic{width:20px;height:20px;flex:0 0 20px;border-radius:5px}.arw .ic.em{font-size:13px}
.col-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px}
.col{text-align:left;display:flex;gap:8px;align-items:center;background:rgba(0,0,0,.3);border:1px solid rgba(255,210,122,.3);border-radius:10px;padding:6px 8px}.col.lk{opacity:.6}
.col b{display:block;color:#fff4e0;font-size:13px}.col .cev{display:block;font-size:11px;opacity:.8}
@media (max-width:420px){.ach-g,.col-g{grid-template-columns:1fr}}
`; document.head.appendChild(st); }
