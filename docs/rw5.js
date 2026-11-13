/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — LEVEL 3-4 REWARDS + HERO OUTFITS (EXPANSION_PLAN.md §4.5, Phase H)
   Goals that pay out during the Level 3-4 grind (survival marks, lifetime kill counts, bosses beaten with
   several heroes, clears with several heroes), and an alternate outfit for every hero, like Vegeta's.
   ===================================================================== */
'use strict';

/* ---------- outfits ---------- */
// Palette overrides on top of each hero's normal colours (Vegeta keeps his own Saiyan-saga armour toggle).
const SKINS = {
  goku: { id: 'kaio', n: 'Kaioken Gi', pal: { or: '#d8302a', od: '#a01c18', ub: '#1e1e26', bl: '#2a2a34', bd: '#16161c', sl: '#1e1e26' } },
  pic: { id: 'demon', n: 'Demon King Robes', pal: { or: '#2e2a3a', od: '#1a1824', bl: '#8a1a1a', bd: '#5a0a0a', sl: '#2e2a3a' } },
  gohan: { id: 'saiya', n: 'Great Saiyaman', pal: { or: '#2f7a3a', od: '#1c5226', hi: '#58b866', bl: '#1e1e26', bd: '#0e0e14', sl: '#2f7a3a' } },
  kri: { id: 'kame', n: 'Kame House Blue', pal: { or: '#3a6ad0', od: '#24489a', ub: '#f48a1c', bl: '#f48a1c', bd: '#c4601a', sl: '#3a6ad0' } },
  trunks: { id: 'cc', n: 'Capsule Corp Black', pal: { jk: '#2a2a34', tk: '#4a6a9a' } },
  gotenks: { id: 'pur', n: 'Super Gotenks Purple', pal: { vs: '#7a3aa8', sa: '#e8c040' } }
};
const skinOn = h => SKINS[h] && typeof P != 'undefined' && P.skin && P.skin[h] == SKINS[h].id && HAS('skin:' + h);
function skinTog() { const h = HERO, k = SKINS[h]; if (!k || !HAS('skin:' + h)) return; P.skin = P.skin || {}; P.skin[h] = P.skin[h] == k.id ? '' : k.id; saveProg(); menu(); }
const XS6 = {};
for (const h of Object.keys(SKINS)) { const prev = XSH[h];
  XSH[h] = ssj => {
    if (!skinOn(h)) return prev(ssj);
    const mm = !!(S && S.mode != 'menu' && S.ps && S.ps.mm > 0), s3 = h == 'goku' && ssj && RU('ss3'), key = h + (ssj ? 1 : 0) + (mm ? 'm' : '') + (s3 ? 'x' : '');
    if (!XS6[key]) { XS6[key] = mk(2048, 1024); paintSheet(XS6[key], Object.assign({}, basePal(h, ssj), SKINS[h].pal, { mm: mm ? 1 : 0, ss3: s3 ? 1 : 0 }), ssj ? 1 : 0); }
    return XS6[key];
  }; }
{ const _m = menu; menu = function () {
    _m(); if (!PROG_READY || V2.welcome3) return; const k = SKINS[HERO]; if (!k || !HAS('skin:' + HERO)) return;
    const d = ov.querySelector('.hdesc'); if (!d) return;
    d.insertAdjacentHTML('afterend', `<button class="vskin" onclick="skinTog()">🎨 Outfit: <b>${skinOn(HERO) ? k.n : 'Classic'}</b></button>`);
  }; }

/* ---------- lifetime counters ---------- */
{ const _k = killE; killE = function (e) { const was = e.dead; _k(e); if (was || !e.dead || typeof P == 'undefined') return;
    if (e.k == 'dr' || e.k == 'drg') P.k3d = (P.k3d || 0) + 1;
    else if (e.k == 'bb' || e.k == 'bs') P.k4b = (P.k4b || 0) + 1;
    if (e.boss) ((P.bh || (P.bh = {}))[e.k] || (P.bh[e.k] = {}))[S.hero] = 1;
  }; }
const nH = k => Object.keys((P.bh && P.bh[k]) || {}).length, nC = st => Object.keys((P.clr && P.clr[st]) || {}).length;
const surv = (st, t) => () => S.stage == st && !S.endless && S.t >= t;

/* ---------- achievements ---------- */
Object.assign(UNL_NAME, { 'skin:goku': 'Goku outfit: Kaioken Gi', 'skin:pic': 'Piccolo outfit: Demon King Robes', 'skin:gohan': 'Gohan outfit: Great Saiyaman',
  'skin:kri': 'Krillin outfit: Kame House Blue', 'skin:trunks': 'Trunks outfit: Capsule Corp Black', 'skin:gotenks': 'Gotenks outfit: Super Gotenks Purple' });
for (const h of Object.keys(SKINS)) UNL_ICON['skin:' + h] = '🎨';
for (const a of [
  // Level 3
  { id: 'r31', c: 'mile', n: 'Holding the City', d: 'Survive 5:00 on Level 3', r: ['z:400'], t: surv(3, 300) },
  { id: 'r32', c: 'mile', n: 'Deep in the Ruins', d: 'Survive 7:30 on Level 3', r: ['skin:kri'], t: surv(3, 450) },
  { id: 'r33', c: 'mile', n: 'Scrap Metal', d: 'Destroy 2,000 Red Ribbon drones in total', r: ['z:600'], pg: () => [P.k3d || 0, 2000] },
  { id: 'r34', c: 'mile', n: 'Android Hunter', d: 'Defeat Android 19 with 3 different heroes', r: ['skin:goku'], pg: () => [nH('a19'), 3] },
  { id: 'r35', c: 'mile', n: "Gero's Nightmare", d: 'Defeat Dr. Gero with 3 different heroes', r: ['z:800'], pg: () => [nH('a20'), 3] },
  { id: 'r36', c: 'mile', n: 'Android Veterans', d: 'Clear Level 3 with 2 different heroes', r: ['skin:trunks'], pg: () => [nC(3), 2] },
  { id: 'r37', c: 'mile', n: 'Cell Games Champions', d: 'Clear Level 3 with 4 different heroes', r: ['z:2000'], pg: () => [nC(3), 4] },
  // Level 4
  { id: 'r41', c: 'mile', n: 'Escape the Ship', d: "Survive 3:20 on Level 4 (out of Babidi's ship)", r: ['z:500'], t: surv(4, 200) },
  { id: 'r42', c: 'mile', n: 'Candy Crusher', d: 'Survive 7:30 on Level 4', r: ['skin:gohan'], t: surv(4, 450) },
  { id: 'r43', c: 'mile', n: 'Blob Popper', d: 'Pop 2,000 Buu blobs in total', r: ['z:700'], pg: () => [P.k4b || 0, 2000] },
  { id: 'r44', c: 'mile', n: 'Majin Hunter', d: 'Defeat Dabura with 3 different heroes', r: ['skin:pic'], pg: () => [nH('dab'), 3] },
  { id: 'r45', c: 'mile', n: 'Prince Tamer', d: 'Defeat Majin Vegeta with 3 different heroes', r: ['z:1200'], pg: () => [nH('mveg'), 3] },
  { id: 'r46', c: 'mile', n: 'Majin Busters', d: 'Clear Level 4 with 2 different heroes', r: ['skin:gotenks'], pg: () => [nC(4), 2] },
  { id: 'r47', c: 'mile', n: 'Universe Savers', d: 'Clear Level 4 with 4 different heroes', r: ['z:3000'], pg: () => [nC(4), 4] },
  { id: 'r48', c: 'mile', n: 'Saiyan Legends', d: 'Clear Level 4 with all 7 heroes', r: ['z:5000'], pg: () => [nC(4), 7] }
]) { ACH.push(a); ACH_BY[a.id] = a; }

// the save can finish loading before this (last) script runs; redraw the menu so the outfit button appears
if (PROG_READY && S && S.mode == 'menu' && !svWelcomeOn) menu();
