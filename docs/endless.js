/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — ENDLESS MODE (EXPANSION_PLAN.md §9.2)
   One continuous run that cycles through all four maps every 5 minutes.
   Bosses from every saga return; each full loop (20 min) makes everything 1.5x tougher.
   Limit Break is always on; Zeni is paid per minute survived.
   ===================================================================== */
'use strict';

const END_SEG = 300;   // seconds per map
const END_WAVES = {
  1: [[45, 'rad'], [140, 'nap'], [230, 'veg']],
  2: [[45, 'rec'], [120, 'gin'], [200, 'fr1']],
  3: [[45, 'a19'], [120, 'a17'], [120, 'a18'], [200, 'ce1']],
  4: [[40, 'pui'], [100, 'dab'], [160, 'mveg'], [220, 'bu1']]
};
const END_NAME = { 1: 'THE WASTELAND', 2: 'PLANET NAMEK', 3: 'THE RUINED CITY', 4: 'THE MAJIN BUU SAGA' };
const endLoop = () => Math.floor(S.t / (END_SEG * 4));
const endTough = () => Math.pow(1.5, S.t / (END_SEG * 4));   // smooth x1.5 per loop

function startEndless() { if (!HAS('endless')) return; start(1); S.endless = 1; S.sch = []; S.eSeg = 0; S.eDone = {}; S.eBan = 1; }

// mobs: hold the usual 9-minute curve, then grow 1.5x per loop instead of exploding
{ const _h = DIFF.hp; DIFF.hp = t => S.endless ? _h(Math.min(t, 540)) * endTough() : _h(t); }
{ const _d = DIFF.dmg; DIFF.dmg = t => S.endless ? _d(Math.min(t, 540)) * Math.pow(1.25, t / (END_SEG * 4)) : _d(t); }
{ const _s = spawnE; spawnE = function (k) { const n0 = S.en.length, r = _s(k);
    if (S.endless && S.en.length > n0) { const e = S.en[S.en.length - 1]; if (e.boss) { const m = Math.pow(1.5, endLoop()); e.hp *= m; e.max *= m; } }
    return r; }; }

{ const _u = update; update = function (dt) {
    if (!S.endless || S.mode != 'play') return _u(dt);
    if (S.eBan) { S.eBan = 0; ban('ENDLESS MODE: SURVIVE AS LONG AS YOU CAN!'); }
    // which map are we on?
    const seg = Math.floor(S.t / END_SEG), st = seg % 4 + 1;
    if (seg != S.eSeg) { S.eSeg = seg; S.stage = st; S.cgr = null; S.rp = []; S.gz = []; S.stn = []; S.spit = []; S.cpd = []; S.pb = null;
      S.flash = 1; ban('ROUND ' + (seg + 1) + ': ' + END_NAME[st] + (seg % 4 == 0 ? ' · LOOP ' + (endLoop() + 1) + ' (x' + endTough().toFixed(1) + ')' : '')); sfxPlay('ban'); }
    // boss waves for this map
    const lt = S.t - seg * END_SEG;
    for (const [at, k] of END_WAVES[st]) { const id = seg + ':' + k; if (lt >= at && !S.eDone[id]) { S.eDone[id] = 1; spawnE(k); const nm = BOSSCARD[k]; if (nm) ban(nm[0] + ' RETURNS!'); } }
    return _u(dt);
  }; }
// a final boss never ends an Endless run
{ const _k = killE; killE = function (e) {
    if (!S.endless) return _k(e);
    const st = STAGES[S.stage], f = st.final; st.final = '__endless'; try { return _k(e); } finally { st.final = f; }
  }; }
// Limit Break is always on in Endless
{ const _lb = lbReady; lbReady = function () { if (!S.endless) return _lb(); const s = SET.lb; SET.lb = true; try { return _lb(); } finally { SET.lb = s; } }; }
// Zeni per minute survived; best time and kills
{ const _a = awardZeni; awardZeni = function (win) { const z = _a(win); if (!S.endless) return z; const x = Math.floor(S.t / 60) * 40; META.zeni += x; P.zeni += x; saveMeta(); return z + x; }; }
{ const _e = endCard; endCard = function (win) {
    if (S.endless && !win && S.p.hp <= 0) { const nb = S.t > (P.endT || 0); P.endT = Math.max(P.endT || 0, S.t); P.endK = Math.max(P.endK || 0, S.kills); try { saveProg(); } catch (e) { } S.endNew = nb; }
    const r = _e(win);
    if (S.endless && S.mode != 'play' && S.mode != 'kk') {
      const line = `<p class="endl">♾️ Endless: survived <b>${fmt(S.t)}</b>${S.endNew ? ' · <b>NEW BEST!</b>' : ' · best ' + fmt(P.endT || 0)} · ${S.kills} defeated</p>`;
      if (typeof RV != 'undefined' && RV) RV.back = RV.back.replace('</h2>', '</h2>' + line);
      else { const h = ov.querySelector('.card h2'); if (h) h.insertAdjacentHTML('afterend', line); }
      // "play again" restarts Endless, not Level 1
      const fix = s => s.replace(/onclick="start\(\)"/g, 'onclick="startEndless()"');
      if (typeof RV != 'undefined' && RV) RV.back = fix(RV.back); else for (const b of ov.querySelectorAll('button')) if (b.getAttribute('onclick') == 'start()') b.setAttribute('onclick', 'startEndless()');
    }
    return r;
  }; }
// menu button under the level list
{ const _m = menu; menu = function () {
    _m(); if (!PROG_READY || V2.welcome3 || !HAS('endless')) return;
    const c = ov.querySelector('.in') || ov.querySelector('.card'); if (!c) return;
    const l4 = c.querySelector('button.l4b'); if (!l4) return;
    l4.insertAdjacentHTML('afterend', `<button class="go endb" onclick="startEndless()">♾️ Endless Mode<small>All four sagas, forever${P.endT ? ' · best ' + fmt(P.endT) : ''}</small></button>`);
  }; }

/* ---------- achievements ---------- */
for (const [m, z] of [[20, 2000], [30, 3000], [45, 5000], [60, 8000]])
  { const a = { id: 'e' + m, c: 'mile', n: m == 60 ? 'Eternal Warrior' : 'Endless ' + m, d: `Survive ${m}:00 in Endless Mode`, r: ['z:' + z], pg: () => [Math.floor(Math.max(P.endT || 0, S && S.endless ? S.t : 0)), m * 60], fmt: 1 }; ACH.push(a); ACH_BY[a.id] = a; }

document.head.insertAdjacentHTML('beforeend', `<style>
.go.endb{background:linear-gradient(135deg,#6a2a9a,#2a1a5a);border-color:#ffd23a}
.endl{margin:.3em 0;color:#ffe6b0}
</style>`);
