/* =====================================================================
   DRAGON BALL SURVIVORS 2.0
   Loaded after the main game script; extends and overrides it in place.
   Sections: settings · balance · boss AI · hazards · boss intros · feel · shop · audio
   ===================================================================== */
'use strict';
const V2 = { ver: '2.0' };

/* ---------- settings (persisted) ---------- */
const SET = { music: true, sfx: true, shake: true };
try { Object.assign(SET, JSON.parse(store.getItem('dbs_set') || '{}')); } catch (e) { }
const saveSet = () => { try { store.setItem('dbs_set', JSON.stringify(SET)); } catch (e) { } };
function setGfx(g) {
  GFX = g; try { store.setItem('dbs_gfx', g); } catch (e) { }
  DPRCAP = g == 'auto' ? 2.5 : GFX_CAP[g]; rs();
}
const FXCAP = () => GFX == 'low' ? 90 : GFX == 'med' ? 160 : 260;

function settings(back) {
  V2.back = back || V2.back || 'menu';
  const row = (lbl, val, fn) => `<button onclick="${fn}" style="text-align:center">${lbl}: <b>${val}</b></button>`;
  show(`<div class="card"><h2>Settings</h2>
  ${row('Graphics', GFX_NAMES[GFX], 'cycleGfx()')}
  <p class="how">${GFX == 'auto' ? 'Auto: starts sharp, lowers resolution only if your device struggles.' : GFX == 'high' ? 'High: full sharpness on high-res screens. Best for newer phones and PCs.' : GFX == 'med' ? 'Medium: balanced sharpness and speed.' : 'Low: fastest. Lower resolution and fewer particles for older devices.'}</p>
  ${row('Music', SET.music ? 'On' : 'Off', "togSet('music')")}
  ${row('Sound effects', SET.sfx ? 'On' : 'Off', "togSet('sfx')")}
  ${row('Screen shake', SET.shake ? 'On' : 'Off', "togSet('shake')")}
  <button class="go" onclick="settingsBack()">Back</button>
  <p class="how">Dragon Ball Survivors ${V2.ver}</p></div>`);
}
function cycleGfx() { const o = ['auto', 'high', 'med', 'low']; setGfx(o[(o.indexOf(GFX) + 1) % o.length]); settings(); }
function togSet(k) { SET[k] = !SET[k]; saveSet(); if (k == 'music') MUS.sync(); settings(); }
function settingsBack() { if (V2.back == 'pause') pz.onclick(); else menu(); }

{ const _m = menu; menu = function () {
    _m(); MUS.want('menu');
    const c = ov.querySelector('.in') || ov.querySelector('.card'); if (!c) return;
    const b = document.createElement('button'); b.style.textAlign = 'center'; b.innerHTML = '⚙️ Settings <small>(graphics, sound)</small>';
    b.onclick = () => settings('menu'); c.appendChild(b);
    const h = c.querySelector('h1'); if (h && !c.querySelector('.ver')) h.insertAdjacentHTML('afterend', '<div class="ver">2.0</div>');
  }; }
{ const _p = pz.onclick; pz.onclick = function () {
    if (S.mode == 'play') { _p(); } else if (S.mode == 'pause') { S.mode = 'play'; _p(); }
    const c = ov.querySelector('.card'); if (!c || S.mode != 'pause') return;
    const b = document.createElement('button'); b.style.textAlign = 'center'; b.textContent = '⚙️ Settings';
    b.onclick = () => settings('pause'); c.appendChild(b);
  }; }

/* ---------- balance ---------- */
// Boss toughness (Hard is the default): Raditz is a warm-up, Nappa is a real wall, Vegeta is the final exam.
DIFF.boss = k => ({ rad: 2.4, nap: 4.2, veg: 11, rec: 3.0, bur: 3.4, jei: 3.4, gul: 3.2, gin: 3.6, fr1: 2.4, fr2: 2.0, fr3: 2.7 }[k] || 2.8) * (.6 + .4 * DF[DLV]);
// Namek mobs: the original eased them to 80%; level 2 should feel like a step up, not a step down.
{ const _h2 = DIFF.hp; DIFF.hp = t => _h2(t) * (S.stage == 2 ? 1.3 : 1); }
// The rest of the mob curve is a little steeper early so the first two minutes have teeth.
{ const _hp = DIFF.hp; DIFF.hp = t => _hp(t) * (1 + .15 * Math.min(1, t / 60) * (S.stage == 2 ? .5 : 1)); }
// Armor upgrade + per-difficulty boss damage
{ const _hu = hurtP, _hi = hitP;
  hurtP = function (d) { _hu(d * (1 - .02 * (META.armor || 0)) * (V2.bossHit ? (.75 + .25 * DF[DLV]) : 1)); };
  hitP = function (e, d) { _hi(e, d * (1 - .02 * (META.armor || 0))); }; }
const bossHurt = d => { V2.bossHit = 1; hurtP(d); V2.bossHit = 0; };

/* ---------- hazards: telegraphed beam lanes ---------- */
// lane(x,y,angle,len,width,windup,damage,palette): a warning stripe that fires a beam after `windup` seconds.
function lane(x, y, a, len, w, t, d, pal) { (S.lns || (S.lns = [])).push({ x, y, a, len, w, t, T: t, d, pal: pal || 'pu', on: 0 }); }
function updLanes(dt) {
  if (!S.lns) return; const p = S.p;
  for (const l of S.lns) {
    if (l.on <= 0) { l.t -= dt; if (l.t <= 0) { l.on = .35; sfxPlay('zap');
        const c = Math.cos(l.a), s = Math.sin(l.a), dx = p.x - l.x, dy = p.y - l.y, al = dx * c + dy * s, pp = Math.abs(-dx * s + dy * c);
        if (l.d > 0 && al > -10 && al < l.len && pp < l.w / 2 + 8) { bossHurt(l.d); kick(10); } } }
    else l.on -= dt;
  }
  S.lns = S.lns.filter(l => l.t > 0 || l.on > 0);
}
const LPAL = { pu: ['190,110,255', '235,215,255'], or: ['255,170,40', '255,245,200'], bl: ['80,160,255', '220,240,255'] };
function drawLanes(cx, cy) {
  if (!S.lns) return; const t = S.t;
  for (const l of S.lns) {
    const P = LPAL[l.pal] || LPAL.pu;
    ctx.save(); ctx.translate(l.x - cx, l.y - cy); ctx.rotate(l.a);
    if (l.on <= 0) {
      const k = 1 - l.t / l.T;
      ctx.fillStyle = 'rgba(255,40,30,' + (.1 + .1 * Math.sin(t * 30)) + ')'; ctx.fillRect(0, -l.w / 2, l.len, l.w);
      ctx.fillStyle = 'rgba(255,60,40,.28)'; ctx.fillRect(0, -l.w / 2 * k, l.len, l.w * k);
      ctx.strokeStyle = 'rgba(255,90,60,.85)'; ctx.lineWidth = 2; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 120;
      ctx.beginPath(); ctx.moveTo(0, -l.w / 2); ctx.lineTo(l.len, -l.w / 2); ctx.moveTo(0, l.w / 2); ctx.lineTo(l.len, l.w / 2); ctx.stroke(); ctx.setLineDash([]);
    } else {
      const k = l.on / .35, w = l.w * (0.6 + 0.4 * k) * (1 + .08 * Math.sin(t * 80));
      const g = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      g.addColorStop(0, 'rgba(' + P[0] + ',0)'); g.addColorStop(.3, 'rgba(' + P[0] + ',.85)'); g.addColorStop(.5, 'rgba(' + P[1] + ',1)'); g.addColorStop(.7, 'rgba(' + P[0] + ',.85)'); g.addColorStop(1, 'rgba(' + P[0] + ',0)');
      LT(); ctx.globalAlpha = Math.min(1, k * 1.6); ctx.fillStyle = g; ctx.fillRect(0, -w / 2, l.len, w); ctx.globalAlpha = 1;
      gl(l.pal == 'or' ? 'or' : l.pal == 'bl' ? 'cy' : 'pu', 0, 0, w * 1.2, .9); NM();
    }
    ctx.restore();
  }
}

/* ---------- boss AI ---------- */
// Stun resistance: bosses can be stunned briefly, then shrug off stuns for a while (no more stun-locking).
function bossStun() {
  for (const e of S.en) { if (!e.boss) continue;
    if (e.st > 0) { if ((e.sImm || 0) > S.t) e.st = 0; else if (!e._st) { e._st = 1; e.st = Math.min(e.st, .6); e.sImm = S.t + 6; } }
    else e._st = 0; }
}
const phase = e => e.hp > e.max * .6 ? 1 : e.hp > e.max * .25 ? 2 : 3;
function summon(e, k, n, elite) { for (let i = 0; i < n; i++) { spawnE(k); const q = S.en[S.en.length - 1]; const a = i / n * 6.283; q.x = e.x + Math.cos(a) * 50; q.y = e.y + Math.sin(a) * 50; if (elite) { q.elite = 1; q.hp *= 6; q.max *= 6; q.r *= 1.4; } } }

AI.nap = function (e, dt) {
  const p = S.p, dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1, ph2 = e.hp < e.max * .5;
  if (ph2 && !e.p2) { e.p2 = 1; ban('NAPPA IS FURIOUS!'); kick(14); ring(e, 18, 170, 'or', 12); hitStop(.08); }
  e.tm -= dt; e.t3 = (e.t3 ?? 3) - dt; e.t4 = (e.t4 ?? 6) - dt; e.t5 = (e.t5 ?? 8) - dt; e.t6 = (e.t6 ?? 10) - dt;
  // charge: wind up (lane warning), then barrel straight through
  if (e.cw > 0) { e.cw -= dt; if (e.cw <= 0) { e.dash = .85; sfxPlay('dash'); } return; }
  if (e.dash > 0) { e.dash -= dt; e.x += e.dx * 470 * dt; e.y += e.dy * 470 * dt; if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .6; bossHurt(26); kick(12); } return; }
  chase(e, dt, 0); e.x -= dx / d * e.spd * dt * (ph2 ? -.35 : 0); e.y -= dy / d * e.spd * dt * (ph2 ? -.35 : 0);
  if (e.tm <= 0) { e.tm = ph2 ? 2.4 : 3.2; ring(e, ph2 ? 16 : 12, 150, 'or', 12); }
  if (e.t3 <= 0 && d < 170) { e.t3 = ph2 ? 3 : 4; zone(e.x, e.y, 135, .85, 28); }
  if (e.t4 <= 0) { e.t4 = ph2 ? 5.5 : 7.5; e.cw = .8; e.dx = dx / d; e.dy = dy / d; lane(e.x, e.y, Math.atan2(dy, dx), 470 * .85 + 40, e.r * 2 + 16, .8, 0, 'or'); }
  if (ph2 && e.t5 <= 0) { e.t5 = 9; zone(p.x, p.y, 170, 1.6, 42); ban('BOMBER DX!'); }
  if (e.t6 <= 0) { e.t6 = ph2 ? 11 : 15; summon(e, 'sai', ph2 ? 6 : 4); }
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(18); }
};

AI.veg = function (e, dt) {
  const p = S.p, dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1, P = phase(e);
  if (P > (e.ph || 1)) { e.ph = P; e.inv = 1.4; kick(18); hitStop(.12); S.flash = 1; ring(e, 20, 190, 'pu', 12);
    ban(P == 2 ? 'VEGETA POWERS UP!' : "VEGETA: YOU'RE FINISHED!"); sfxPlay('roar'); }
  if (e.inv > 0) { e.inv -= dt; e.hp = Math.max(e.hp, e.max * (P == 2 ? .6 : .25) - 1); }
  const sp = P == 3 ? 1.45 : P == 2 ? 1.2 : 1;
  e.tm -= dt; e.t3 = (e.t3 ?? 4) - dt; e.t4 = (e.t4 ?? 5) - dt; e.t5 = (e.t5 ?? 6) - dt; e.t6 = (e.t6 ?? 14) - dt;
  if (d > 140) { e.x += dx / d * e.spd * sp * dt; e.y += dy / d * e.spd * sp * dt; }
  // ki barrage
  if (e.tm <= 0) { e.tm = P == 3 ? 1.05 : P == 2 ? 1.45 : 1.9; fan(e, P == 3 ? 9 : P == 2 ? 7 : 5, 250, 'or', 15, .17); }
  // Big Bang zones on and around you
  if (e.t3 <= 0) { e.t3 = P == 3 ? 3.4 : 4.6; for (let i = 0; i < P; i++) zone(p.x + (i ? (Math.random() - .5) * 260 : (S.mvx || 0) * 70), p.y + (i ? (Math.random() - .5) * 260 : (S.mvy || 0) * 70), 70 + 10 * P, 1.1, 30); }
  // Galick Gun: warning lanes, then a beam that hurts a lot
  if (P >= 2 && e.t4 <= 0) { e.t4 = P == 3 ? 4.2 : 5.8; const a = Math.atan2(dy, dx);
    const n = P == 3 ? 3 : 1; for (let i = 0; i < n; i++) lane(e.x, e.y, a + (i - (n - 1) / 2) * .38, 950, 64, P == 3 ? .8 : 1, 46, 'pu');
    if (P == 2) ban('GALICK GUN!'); sfxPlay('charge'); }
  // teleport behind you
  if (P >= 2 && e.t5 <= 0) { e.t5 = P == 3 ? 4.5 : 6.5; S.fx.push({ ring: 1, x: e.x, y: e.y, r: 30, l: .3, T: .3, c: '#c8f' });
    const a = Math.atan2(S.mvy || 0, S.mvx || 1) + Math.PI + (Math.random() - .5); e.x = p.x + Math.cos(a) * 200; e.y = p.y + Math.sin(a) * 200; sfxPlay('tele'); ring(e, 10, 160, 'pu', 10); }
  if (P == 3 && e.t6 <= 0) { e.t6 = 16; summon(e, 'cj', 3, 1); }
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(22); }
};
// Frieza: each form adds telegraphed Death Beams on top of his original kit, and the final form hunts you down.
for (const f of [1, 2, 3]) { const _f = AI['fr' + f]; AI['fr' + f] = function (e, dt) {
    _f(e, dt); const p = S.p; e.db = (e.db ?? (6 - f)) - dt;
    if (e.db <= 0) { e.db = f == 3 ? 3.6 : f == 2 ? 5 : 6.5; const a = Math.atan2(p.y - e.y, p.x - e.x), n = f;
      for (let i = 0; i < n; i++) lane(e.x, e.y, a + (i - (n - 1) / 2) * .3, 1000, 34, f == 3 ? .75 : .9, 30 + 6 * f, 'pu'); sfxPlay('charge'); }
    if (f == 3) { e.dbb = (e.dbb ?? 12) - dt; if (e.dbb <= 0) { e.dbb = 12; zone(p.x, p.y, 190, 1.8, 48); ban('DEATH BALL!'); } }
  }; }
// Raditz: a bit more bite (fan shots between dashes)
{ const R = (e, dt) => {
    const p = S.p, dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
    e.tm -= dt; e.t3 = (e.t3 ?? 2.5) - dt;
    if (e.dash > 0) { e.dash -= dt; e.x += e.dx * 340 * dt; e.y += e.dy * 340 * dt; }
    else { if (e.tm <= 0) { e.tm = 3; e.dash = .6; e.dx = dx / d; e.dy = dy / d; } e.x += dx / d * e.spd * dt; e.y += dy / d * e.spd * dt; }
    if (e.t3 <= 0) { e.t3 = 2.8; fan(e, 3, 210, 'or', 9); }
    if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(14); }
  }; AI.rad = R; }

/* ---------- ability feel: readable impacts + fire sounds ---------- */
// Impact bursts drawn in world space: a bright flash, an expanding ring and a few spikes, coloured per ability.
const IMPC = { pu: ['pu', '233,168,255'], cy: ['cy', '150,220,255'], or: ['or', '255,200,90'], wh: ['wh', '255,255,240'] };
function impact(x, y, r, c, T) { const L = (V2.imp || (V2.imp = [])); if (L.length < (GFX == 'low' ? 20 : 48)) L.push({ x, y, r, c: c || 'or', t: 0, T: T || .28, a: Math.random() * 6.28 }); }
// Hellzone orb hits (2026-11-14): Hellzone Storm throws dozens of these a second and their stacked white cores flashed the
// screen even on Reduced. Now they're soft (no white core) and only a handful show at once.
function orbHit(x, y, R) { const L = V2.imp || []; let n = 0; for (const q of L) if (q.soft) n++;
  if (n < (S.evo && S.evo.hell ? 5 : 8)) { impact(x, y, R * .95, 'pu', .26); const q = V2.imp && V2.imp[V2.imp.length - 1]; if (q && q.x == x && q.y == y) q.soft = 1; } sfxPlay('orb'); }
function updImpacts(dt) { if (V2.imp) { for (const q of V2.imp) q.t += dt; V2.imp = V2.imp.filter(q => q.t < q.T); } }
function drawImpacts(cx, cy) {
  if (!V2.imp || !V2.imp.length) return; LT();
  for (const q of V2.imp) { const k = q.t / q.T, x = q.x - cx, y = q.y - cy, C = IMPC[q.c] || IMPC.or, rr = q.r * (.35 + .85 * Math.sqrt(k));
    gl(C[0], x, y, q.r * 1.3 * (1 - k * .5), (1 - k) * (q.soft ? .45 : .9)); if (k < .35 && !q.soft) gl('wh', x, y, q.r * .55, (1 - k / .35));
    ctx.strokeStyle = 'rgba(' + C[1] + ',' + (1 - k) + ')'; ctx.lineWidth = 3 * (1 - k) + 1; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = q.a + i * 1.047, r0 = rr * .5, r1 = rr * (1.1 + .3 * (i & 1)); ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); } ctx.stroke(); }
  NM();
}
function fireSounds(before) {
  if (S.sh.length > before.sh) sfxPlay('shot');
  if (S.orbs && S.orbs.length > before.orbs) sfxPlay('orbfire');
  if (S.str && S.str.length > before.str) sfxPlay('thunder');
  if (S.zones && S.zones.some(z => z.f && !z._s)) { for (const z of S.zones) if (z.f && !z._s) z._s = 1; sfxPlay('charge'); }
  if (S.discs && S.discs.length > before.discs) sfxPlay('disc');
}
function impactPass() {
  if (S.str) for (const q of S.str) if (q.f && !q._i) { q._i = 1; impact(q.x, q.y, q.R || 50, 'cy', .35); kick(3); }
}
// Big explosions (Spirit Bomb, boss deaths) get a shockwave and a little camera kick.
{ const _b = boom; boom = function (x, y, r, c) { _b(x, y, r, c); if (r >= 60) { impact(x, y, r * .9, c == '#9df' ? 'cy' : 'or', .45); kick(Math.min(12, r / 12)); } }; }

/* ---------- ability feel pass (visual only; damage untouched) ---------- */
// Spirit Bomb: a huge blue sphere visibly falls onto its target during the countdown.
function drawSpiritBomb(z, x, y, k, t) {
  const R = z.r, sr = R * (.32 + .18 * k), sy = y - (1 - k) * 260;
  ctx.save(); ctx.strokeStyle = 'rgba(150,220,255,' + (.35 + .45 * k) + ')'; ctx.lineWidth = 2 + 2 * k;
  ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 60; ctx.beginPath(); ctx.arc(x, y, R * (1.25 - .25 * k), 0, 7); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(120,200,255,' + (.06 + .12 * k) + ')'; ctx.beginPath(); ctx.ellipse(x, y, R, R * .55, 0, 0, 7); ctx.fill(); ctx.restore();
  LT(); gl('cy', x, sy, sr * 2.6, .55); gl('cy', x, sy, sr * 1.5, .9); gl('wh', x, sy, sr * .9, .95);
  ctx.strokeStyle = 'rgba(200,240,255,.55)'; ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) { const a = t * 3 + i * 1.047, r1 = sr * 2.2, r0 = sr * 1.05; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r1, sy + Math.sin(a) * r1); ctx.quadraticCurveTo(x + Math.cos(a + .8) * r1 * .8, sy + Math.sin(a + .8) * r1 * .8, x + Math.cos(a + 1.4) * r0, sy + Math.sin(a + 1.4) * r0); ctx.stroke(); }
  NM();
  ctx.strokeStyle = 'rgba(230,250,255,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, sy, sr, 0, 7); ctx.stroke();
}
// Enemy attack zones: clear fill that grows to show exactly when it goes off.
function drawDangerZone(z, x, y, k, t) {
  const c = z.sl ? '190,100,255' : '255,70,40';
  ctx.fillStyle = 'rgba(' + c + ',' + (.08 + .05 * Math.sin(t * 24)) + ')'; ctx.beginPath(); ctx.arc(x, y, z.r, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(' + c + ',.26)'; ctx.beginPath(); ctx.arc(x, y, z.r * k, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(' + c + ',' + (.55 + .35 * Math.sin(t * 30)) + ')'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, z.r, 0, 7); ctx.stroke();
}
// Kaioken aura: a living ring of flame that flares on every damage tick.
function drawKaioken(t) {
  if (!S.w.aura) return; const E = S.evo.aura, R = (50 + 10 * WL('aura')) * (E ? 1.8 : 1) * AR2(), x = W / 2, y = H / 2 + 4;
  const pulse = Math.max(0, 1 - (V2.auT || 0) / .18), n = GFX == 'low' ? 14 : 26;
  LT();
  gl('rd', x, y, R * 1.15, .22 + .25 * pulse);
  for (let i = 0; i < n; i++) {
    const a = i / n * 6.283 + Math.sin(t * 2 + i) * .05, fl = .7 + .3 * Math.sin(t * 11 + i * 2.7) + .4 * pulse, px = x + Math.cos(a) * R, py = y + Math.sin(a) * R * .9;
    const len = (14 + 10 * fl) * (E ? 1.5 : 1);
    ctx.save(); ctx.translate(px, py); ctx.rotate(Math.cos(a) * .35);
    const g = ctx.createLinearGradient(0, 0, 0, -len); g.addColorStop(0, E ? 'rgba(255,240,220,.85)' : 'rgba(255,120,60,.8)'); g.addColorStop(.5, 'rgba(255,60,30,.55)'); g.addColorStop(1, 'rgba(200,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.quadraticCurveTo(-4, -len * .6, Math.sin(t * 9 + i) * 3, -len); ctx.quadraticCurveTo(4, -len * .6, 5, 0); ctx.fill(); ctx.restore();
  }
  ctx.strokeStyle = 'rgba(255,' + (E ? 200 : 90) + ',60,' + (.35 + .45 * pulse) + ')'; ctx.lineWidth = 2 + 3 * pulse; ctx.beginPath(); ctx.ellipse(x, y, R, R * .9, 0, 0, 7); ctx.stroke();
  if (GFX != 'low') for (let i = 0; i < 10; i++) { const a = i * 2.4 + t * .3, u = (t * .8 + i * .13) % 1, rr = R * (.4 + .6 * ((i * 37) % 10) / 10);
    gl('or', x + Math.cos(a) * rr, y + Math.sin(a) * rr * .9 - u * 40, 4, (1 - u) * .7); }
  NM();
}
// Destructo Disc: motion-blur arcs along the orbit plus a crisp saw edge on each disc.
function drawDiscFx(cx, cy, t) {
  if (!S.discs || !S.discs.length) return; const p = S.p; LT();
  for (const d of S.discs) { const dx = d.x - p.x, dy = d.y - p.y, R = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    let da = d.a - a; da = Math.atan2(Math.sin(da), Math.cos(da)); const dir = Math.abs(da) > 1.6 ? -1 : 1;
    for (let i = 1; i <= 5; i++) { const aa = a - dir * i * .09; gl('or', p.x - cx + Math.cos(aa) * R, p.y - cy + Math.sin(aa) * R, d.r * (1.2 - i * .12), .28 - i * .045); }
    const x = d.x - cx, y = d.y - cy; ctx.save(); ctx.translate(x, y); ctx.rotate(t * 30); ctx.strokeStyle = 'rgba(255,255,230,.95)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); for (let i = 0; i < 12; i++) { const q = i / 12 * 6.283, r = d.r * (i & 1 ? 1.08 : .86); i ? ctx.lineTo(Math.cos(q) * r, Math.sin(q) * r * .8) : ctx.moveTo(Math.cos(q) * r, Math.sin(q) * r * .8); } ctx.closePath(); ctx.stroke(); ctx.restore(); }
  NM();
}
// Short-lived ability flashes: Masenko cone, Solar Flare rays, Ki Blast muzzle.
function flashFx(o) { (V2.ff || (V2.ff = [])).push(Object.assign({ t: 0 }, o)); }
function drawFlashFx(cx, cy, t) {
  if (!V2.ff || !V2.ff.length) return; const px = W / 2, py = H / 2; LT();
  for (const f of V2.ff) { const k = f.t / f.T;
    if (f.k == 'cone') { ctx.save(); ctx.translate(px, py); ctx.rotate(f.a); const L = f.len * (.6 + .4 * Math.sqrt(k)), sp = f.sp / 2;
      const g = ctx.createRadialGradient(0, 0, 4, 0, 0, L); g.addColorStop(0, 'rgba(255,255,220,' + (1 - k) + ')'); g.addColorStop(.5, 'rgba(255,190,60,' + .55 * (1 - k) + ')'); g.addColorStop(1, 'rgba(255,120,20,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, L, -sp, sp); ctx.closePath(); ctx.fill(); ctx.restore(); }
    else if (f.k == 'rays') { const n = 16, L = Math.max(W, H) * (.3 + .7 * k); ctx.save(); ctx.translate(px, py); ctx.rotate(t * .8);
      for (let i = 0; i < n; i++) { ctx.rotate(6.283 / n); ctx.fillStyle = 'rgba(255,255,230,' + .5 * (1 - k) + ')'; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(L, -L * .045); ctx.lineTo(L, L * .045); ctx.lineTo(0, 6); ctx.fill(); }
      ctx.restore(); gl('wh', px, py, 90 * (1 - k) + 30, 1 - k); ctx.strokeStyle = 'rgba(255,255,220,' + (1 - k) + ')'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(px, py, L * .6, 0, 7); ctx.stroke(); }
    else if (f.k == 'muz') { gl('cy', px + Math.cos(f.a) * 16, py + Math.sin(f.a) * 16, 16 * (1 - k) + 4, 1 - k); }
  }
  NM();
}
function abilityFx(dt, before) {
  if (V2.ff) { for (const f of V2.ff) f.t += dt; V2.ff = V2.ff.filter(f => f.t < f.T); }
  V2.auT = (V2.auT || 0) + dt; if (S.w.aura && S.cd.aura > before.auCd + .1) V2.auT = 0;
  if (S.sh.length > before.sh) { const s = S.sh[S.sh.length - 1]; flashFx({ k: 'muz', a: Math.atan2(s.vy, s.vx), T: .1 }); }
  for (const s of S.sh) { const n = s.h.length; if (n > (s._n || 0)) { s._n = n; impact(s.x, s.y, 13, 'cy', .16); } }
  if (S.mas.length > before.mas) { const s = S.mas[S.mas.length - 1]; flashFx({ k: 'cone', a: Math.atan2(s.vy, s.vx), len: 250 * AR2(), sp: 1.0 * (1 + (AR() - 1) * .5), T: .2 }); }
  for (const s of S.mas) { const n = s.h.size; if (n > (s._n || 0)) { s._n = n; impact(s.x, s.y, 15, 'or', .16); } }
  for (const e of S.en) if (e.dd && e.dd !== e._dd) { e._dd = e.dd; impact(e.x, e.y, 16, 'or', .18); }
  if (S.w.flare && S.cd.flare > before.flCd + 1) { flashFx({ k: 'rays', T: .55 }); sfxPlay('flare'); }
}
/* ---------- art pass: boss auras, intro polish, victory beat ---------- */
// Each boss burns with its own colour; the aura grows as it takes damage (phases read at a glance).
const BAURA = { rad: '170,70,255', nap: '255,160,50', veg: '110,170,255', rec: '255,130,40', bur: '90,160,255', jei: '255,90,90', gul: '110,240,140', gin: '200,110,255', fr1: '215,120,255', fr2: '215,120,255', fr3: '235,150,255' };
function bossAura(e, x, y) {
  const c0 = BAURA[e.k]; if (!c0) return; const t = S.t, r = e.r, hpF = e.hp / e.max, inten = 1 + (1 - hpF) * 1.2 + (e.inv > 0 ? 1 : 0);
  const c = e.k == 'veg' && hpF < .25 ? '255,225,120' : c0, n = GFX == 'low' ? 8 : 14, R = r * 1.25;
  LT();
  const g = ctx.createRadialGradient(x, y - r * .3, r * .3, x, y - r * .3, r * 2.3 * Math.min(1.6, inten)); g.addColorStop(0, 'rgba(' + c + ',' + .28 * Math.min(1.5, inten) + ')'); g.addColorStop(1, 'rgba(' + c + ',0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - r * .3, r * 2.3 * Math.min(1.6, inten), 0, 7); ctx.fill(); NM();
  for (let i = 0; i < n; i++) {
    const a = i / n * 6.283, fl = .65 + .35 * Math.sin(t * 13 + i * 2.1), px = x + Math.cos(a) * R * .85, py = y + Math.sin(a) * R * .45 + r * .2, len = r * (.9 + .7 * fl) * Math.min(1.7, inten);
    const fg = ctx.createLinearGradient(px, py, px, py - len); fg.addColorStop(0, 'rgba(' + c + ',.75)'); fg.addColorStop(.6, 'rgba(' + c + ',.35)'); fg.addColorStop(1, 'rgba(' + c + ',0)');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(px - r * .22, py); ctx.quadraticCurveTo(px - r * .18, py - len * .6, px + Math.sin(t * 8 + i) * r * .15, py - len); ctx.quadraticCurveTo(px + r * .18, py - len * .6, px + r * .22, py); ctx.fill();
  }
  NM();
}
{ const _en = enemy; enemy = function (e, x, y) { if (e.boss) bossAura(e, x, y); _en(e, x, y); }; }

// Intro cutscenes: fade in from black, speed lines while flying, vignette, flash cut into gameplay.
{ const _di = drawIntro; drawIntro = function () {
    _di(); const I = S.intro; if (!I) return; const t = I.t, T = INTRO_T[S.stage - 1];
    ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (S.stage == 1 && t > .2 && t < 2.2) { const a = Math.min(1, (t - .2) / .3) * Math.min(1, (2.2 - t) / .4); ctx.strokeStyle = 'rgba(255,250,235,' + .35 * a + ')'; ctx.lineWidth = 2;
      for (let i = 0; i < 14; i++) { const y = H * (.12 + .76 * ((i * 53) % 100) / 100), sp = 900 + (i % 4) * 300, x = W - ((t * sp + i * 137) % (W + 300)); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 80 + (i % 3) * 40, y); ctx.stroke(); } }
    if (V2.ivW != W + H) { V2.ivW = W + H; V2.iv = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .4, W / 2, H / 2, Math.hypot(W, H) * .62); V2.iv.addColorStop(0, 'rgba(0,0,0,0)'); V2.iv.addColorStop(1, 'rgba(10,4,0,.5)'); }
    ctx.fillStyle = V2.iv; ctx.fillRect(0, 0, W, H);
    if (t < .5) { ctx.fillStyle = 'rgba(0,0,0,' + (1 - t / .5) + ')'; ctx.fillRect(0, 0, W, H); }
    if (t > T - .3) { ctx.fillStyle = 'rgba(255,250,235,' + Math.min(1, (t - (T - .3)) / .3) * .85 + ')'; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
  }; }
// Gameplay starts with a quick flash fade (pairs with the intro's flash cut).
{ const _ie = introEnd; introEnd = function () { const was = S.mode == 'intro'; _ie(); if (was) V2.inF = .45; }; }

// Victory beat when a level's final boss falls.
function drawVictory(dt) {
  if (V2.inF > 0) { V2.inF -= 1 / 60; ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = 'rgba(255,250,235,' + Math.max(0, V2.inF / .45) * .85 + ')'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  if (S.mode != 'win' || V2.winT === undefined) return; V2.winT += 1 / 60; const t = V2.winT;
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = 'rgba(255,250,230,' + Math.max(0, .9 - t * 1.6) + ')'; ctx.fillRect(0, 0, W, H);
  const a = Math.min(1, Math.max(0, (t - .15) / .25)), sc = 1 + Math.max(0, .35 - t) * 1.2, fs = Math.min(76, W * .16);
  ctx.globalAlpha = a; ctx.translate(W / 2, H * .38); ctx.scale(sc, sc); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.font = '900 ' + fs + 'px Impact,Haettenschweiler,"HelveticaNeue-CondensedBlack","Avenir Next Condensed","Roboto Condensed",sans-serif-condensed,"Arial Narrow","Arial Black",sans-serif'; ctx.lineWidth = fs * .22; ctx.strokeStyle = '#5a0e08'; ctx.strokeText('VICTORY!', 0, 0);
  const g = ctx.createLinearGradient(0, -fs * .8, 0, 0); g.addColorStop(0, '#fff6c0'); g.addColorStop(1, '#ff9a1f'); ctx.fillStyle = g; ctx.fillText('VICTORY!', 0, 0);
  ctx.restore();
}
/* ---------- boss intro cards + game feel ---------- */
const BOSSCARD = {
  rad: ["RADITZ", "Goku's long-lost brother"], nap: ['NAPPA', 'Elite Saiyan warrior'], veg: ['VEGETA', 'Prince of all Saiyans'],
  rec: ['RECOOME', 'Ginyu Force'], bur: ['BURTER & JEICE', 'Ginyu Force'], gul: ['GULDO', 'Ginyu Force'], gin: ['CAPTAIN GINYU', 'Leader of the Ginyu Force'],
  fr1: ['FRIEZA', 'Emperor of the universe'], fr2: ['FRIEZA', 'Second form'], fr3: ['FRIEZA', 'Final form']
};
V2.hs = 0; V2.shk = 0;
function hitStop(t) { V2.hs = Math.max(V2.hs, t); }
function kick(m) { if (SET.shake) V2.shk = Math.max(V2.shk, m); }
function bossIntroCheck() {
  for (const e of S.en) if (e.boss && !e._in) { e._in = 1; const c = BOSSCARD[e.k]; if (!c || S.t < 1) continue;
    S.bi = { k: e.k, t: 0, T: 2.4, n: c[0], s: c[1] }; S.ban = null; sfxPlay('roar'); kick(10); MUS.want('boss'); }
}
function drawBossIntro() {
  const b = S.bi; if (!b) return; const t = b.t, T = b.T, inn = Math.min(1, t / .25), out = Math.min(1, (T - t) / .35), a = Math.min(inn, out);
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const bh = H * .13 * a; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
  const y = H * .42, sl = (1 - inn) * W * .6;
  ctx.globalAlpha = a; ctx.fillStyle = 'rgba(20,4,0,.72)'; ctx.beginPath(); ctx.moveTo(-20 + sl, y - 46); ctx.lineTo(W + 20 + sl, y - 66); ctx.lineTo(W + 20 + sl, y + 24); ctx.lineTo(-20 + sl, y + 44); ctx.fill();
  ctx.fillStyle = '#ff9a1f'; ctx.fillRect(0, y + 40 - 4, W, 3);
  const fs = Math.min(64, W * .13); ctx.font = '900 ' + fs + 'px Impact,Haettenschweiler,"HelveticaNeue-CondensedBlack","Avenir Next Condensed","Roboto Condensed",sans-serif-condensed,"Arial Narrow","Arial Black",sans-serif'; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  const x = W / 2 - sl * .4; ctx.lineWidth = fs * .2; ctx.strokeStyle = '#5a0e08'; ctx.strokeText(b.n, x, y + fs * .25);
  const g = ctx.createLinearGradient(0, y - fs * .6, 0, y + fs * .3); g.addColorStop(0, '#fff3b0'); g.addColorStop(1, '#ff8a1f'); ctx.fillStyle = g; ctx.fillText(b.n, x, y + fs * .25);
  ctx.font = 'bold ' + Math.round(fs * .3) + 'px "Trebuchet MS",sans-serif'; ctx.fillStyle = '#ffe6b0'; ctx.fillText(b.s.toUpperCase(), x, y + fs * .25 + fs * .45);
  ctx.restore();
}
function drawLowHp() {
  const p = S.p, k = 1 - p.hp / p.max; if (S.mode != 'play' || k < .7) return;
  const a = (k - .7) / .3 * (.55 + .25 * Math.sin(S.t * 7));
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (V2.lhW != W + H) { V2.lhW = W + H; V2.lh = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.hypot(W, H) * .55); V2.lh.addColorStop(0, 'rgba(255,0,0,0)'); V2.lh.addColorStop(1, 'rgba(200,0,0,1)'); }
  ctx.globalAlpha = a; ctx.fillStyle = V2.lh; ctx.fillRect(0, 0, W, H); ctx.restore();
}

// Hooks into the main update / draw
{ const _u = update; update = function (dt) {
    if (V2.hs > 0) { V2.hs -= dt; return; }
    if (S.bi) { S.bi.t += dt; if (S.bi.t >= S.bi.T) S.bi = null; else dt *= S.bi.t < S.bi.T - .4 ? .25 : .6; }
    const hp0 = S.p.hp;
    const before = { sh: S.sh.length, orbs: (S.orbs || []).length, str: (S.str || []).length, discs: (S.discs || []).length, mas: S.mas.length, auCd: S.cd.aura || 0, flCd: S.cd.flare || 0 };
    bossStun(); _u(dt); updLanes(dt); updImpacts(dt); bossIntroCheck(); fireSounds(before); impactPass(); abilityFx(dt, before);
    if (hp0 - S.p.hp > 15) { kick(8); }
    if (S.fx.length > FXCAP()) S.fx.splice(0, S.fx.length - FXCAP());
    if (S.mode == 'play' && !S.en.some(e => e.boss)) MUS.want(S.stage == 2 ? 'namek' : 'stage');
  }; }
{ const _d = drawExtra; drawExtra = function (cx, cy, t) { drawLanes(cx, cy); drawKaioken(t); _d(cx, cy, t); drawDiscFx(cx, cy, t); drawFlashFx(cx, cy, t); drawImpacts(cx, cy); }; }
{ const _d = draw; draw = function () {
    _d();
    if (S.mode == 'play' || S.mode == 'pause' || S.mode == 'lvl') { drawLowHp(); drawBossIntro(); }
    drawVictory();
    // screen shake via a cheap CSS offset (moves the whole frame, HUD included)
    if (V2.shk > .3 && S.mode == 'play') { V2.shk *= .86; cv.style.transform = `translate(${((Math.random() - .5) * V2.shk).toFixed(1)}px,${((Math.random() - .5) * V2.shk).toFixed(1)}px)`; }
    else if (cv.style.transform) { V2.shk = 0; cv.style.transform = ''; }
  }; }
// Big moments get weight
{ const _k = killE; killE = function (e) { const was = e.dead; _k(e); if (!was && e.boss && S.mode == 'win') V2.winT = 0; if (!was && e.boss) { hitStop(.18); kick(22); sfxPlay('bossdie'); } else if (!was && e.elite) kick(5); }; }
{ const _s = start; start = function (a) { V2.hs = 0; V2.shk = 0; V2.winT = undefined; V2.inF = 0; const r = _s(a); MUS.want('intro'); return r; }; }
{ const _e = endCard; endCard = function (win) {
    if (!win && (META.revive || 0) > 0 && !S.revived && S.p.hp <= 0) { // Zenkai revival
      S.revived = 1; S.p.hp = S.p.max * .5; S.mode = 'play'; show(''); S.inv = 3; S.flash = 1; boom(S.p.x, S.p.y, 160, '#ffe27a');
      for (const en of S.en) if (!en.boss && Math.hypot(en.x - S.p.x, en.y - S.p.y) < 260) en.hp = 0; ban('ZENKAI REVIVAL!'); sfxPlay('ult'); return; }
    MUS.want(win ? 'win' : 'lose'); sfxPlay(win ? 'win' : 'lose'); return _e(win); }; }

/* ---------- shop / Zeni ---------- */
// Upgrades are meant to be felt: each level is a real step, and a full shop roughly doubles your power.
UPG.hp[1] = '+12 max HP per level'; UPG.hp[3] = 12;
UPG.dmg[1] = '+5% damage per level'; UPG.dmg[3] = .05;
UPG.xp[1] = '+5% XP per level'; UPG.xp[3] = .05;
UPG.area[1] = '+3% area per level'; UPG.area[3] = .03;
Object.assign(UPG, {
  magnet: ['Capsule Magnet', '+10% pickup range per level', 5, .1, 40, 1.4],
  armor: ['Battle Armor', '-2% damage taken per level', 6, .02, 70, 1.38],
  greed: ['Hercule Sponsorship', '+10% Zeni per run per level', 5, .1, 80, 1.45],
  revive: ['Zenkai Revival', 'Once per run, get back up at 50% HP', 1, 1, 1200, 1]
});
for (const k in UPG) META[k] = Math.max(0, Math.min(UPG[k][2], META[k] | 0));
{ const _a = awardZeni; awardZeni = function (win) { const z = _a(win), x = Math.floor(z * .1 * (META.greed || 0)); META.zeni += x; saveMeta(); V2.lastZ = z + x; return z + x; }; }
{ const _b = buyU; buyU = function (k) { const z = META.zeni; _b(k); if (META.zeni < z) sfxPlay('buy'); }; }

/* ---------- audio: synthesized SFX bus + procedural music ---------- */
let BUS = null, NOISE = null;
function bus() {
  if (!AC) return null; if (BUS) return BUS;
  const comp = AC.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = .003; comp.release.value = .2;
  const master = AC.createGain(); master.gain.value = .9; comp.connect(master); master.connect(AC.destination);
  const sfxG = AC.createGain(); sfxG.gain.value = .8; sfxG.connect(comp);
  const musG = AC.createGain(); musG.gain.value = .0; musG.connect(comp);
  const nb = AC.createBuffer(1, AC.sampleRate * .6, AC.sampleRate), ch = nb.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; NOISE = nb;
  BUS = { comp, master, sfx: sfxG, mus: musG }; return BUS;
}
function tone(type, f0, f1, dur, vol, when, dest) {
  const n = when || AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.type = type;
  o.frequency.setValueAtTime(f0, n); if (f1 && f1 != f0) o.frequency.exponentialRampToValueAtTime(f1, n + dur);
  g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(vol, n + .005); g.gain.exponentialRampToValueAtTime(.0008, n + dur);
  o.connect(g); g.connect(dest || BUS.sfx); o.start(n); o.stop(n + dur + .03);
}
function noise(dur, vol, fType, f0, f1, when, dest, q) {
  const n = when || AC.currentTime, s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = NOISE; f.type = fType || 'lowpass'; f.frequency.setValueAtTime(f0 || 2000, n); if (f1) f.frequency.exponentialRampToValueAtTime(f1, n + dur); f.Q.value = q || 1;
  g.gain.setValueAtTime(vol, n); g.gain.exponentialRampToValueAtTime(.0008, n + dur);
  s.connect(f); f.connect(g); g.connect(dest || BUS.sfx); s.start(n, Math.random() * .3); s.stop(n + dur + .02);
}
const lastP = {};
const GAP = { hit: .045, gem: .035, pop: .03, shot: .07, hurt: .12, boom: .06, orb: .06, orbfire: .2, thunder: .12, disc: .3, charge: .25 };
function sfxPlay(k) {
  if (muted || !SET.sfx || !AC || AC.state != 'running' || !bus()) return;
  const n = AC.currentTime; if (lastP[k] && n - lastP[k] < (GAP[k] || .03)) return; lastP[k] = n;
  const r = 1 + (Math.random() - .5) * .08;
  switch (k) {
    case 'hit': tone('square', 340 * r, 140, .05, .035); noise(.03, .05, 'highpass', 3000); break;
    case 'pop': tone('triangle', 300 * r, 80, .1, .07); noise(.08, .06, 'bandpass', 1500, 400); break;
    case 'gem': { const s = [880, 988, 1175, 1319][(lastP.gi = ((lastP.gi || 0) + 1) % 4)]; tone('sine', s, s * 1.01, .07, .045); tone('triangle', s * 2, 0, .05, .015); break; }
    case 'hurt': tone('sawtooth', 190, 60, .22, .12); noise(.18, .14, 'lowpass', 1200, 200); break;
    case 'lvl': [523, 659, 784, 1047].forEach((f, i) => tone('square', f, f, .14, .05, n + i * .07)); tone('triangle', 1568, 1568, .3, .04, n + .28); break;
    case 'ban': tone('sawtooth', 110, 70, .5, .07); noise(.4, .05, 'lowpass', 600, 120); break;
    case 'boom': noise(.45, .22, 'lowpass', 1800, 80); tone('sine', 120 * r, 35, .35, .2); break;
    case 'shot': tone('square', 900 * r, 320, .06, .02); noise(.04, .025, 'bandpass', 4000, 1500, 0, 0, 3); break;
    case 'beam': noise(.9, .12, 'bandpass', 600, 2400, 0, 0, 2); tone('sawtooth', 160, 320, .8, .05); tone('sine', 80, 60, .8, .12); break;
    case 'charge': tone('sawtooth', 120, 600, .9, .05); noise(.9, .06, 'bandpass', 300, 3000, 0, 0, 4); break;
    case 'zap': noise(.35, .2, 'bandpass', 2500, 500, 0, 0, 1.5); tone('sawtooth', 220, 90, .3, .08); break;
    case 'orb': tone('sine', 520 * r, 180, .16, .07); noise(.14, .09, 'bandpass', 2200, 600, 0, 0, 2); break;
    case 'orbfire': [660, 880].forEach((f, i) => tone('triangle', f * r, f * 1.4, .12, .03, n + i * .04)); break;
    case 'thunder': noise(.5, .22, 'highpass', 1200, 300); tone('sawtooth', 70, 40, .4, .08); break;
    case 'disc': tone('sawtooth', 600, 1200, .2, .025); break;
    case 'flare': tone('sine', 1800, 2600, .35, .05); noise(.4, .08, 'highpass', 6000, 9000); break;
    case 'dash': noise(.35, .1, 'bandpass', 800, 2500, 0, 0, 2); break;
    case 'tele': tone('sine', 1400, 300, .15, .06); noise(.12, .05, 'highpass', 5000); break;
    case 'roar': tone('sawtooth', 90, 55, .9, .1); tone('square', 60, 45, .9, .05); noise(.9, .1, 'lowpass', 900, 150); break;
    case 'bossdie': noise(1.4, .3, 'lowpass', 2400, 60); tone('sine', 140, 30, 1.2, .25); [392, 494, 587, 784].forEach((f, i) => tone('triangle', f, f, .35, .05, n + .3 + i * .09)); break;
    case 'ult': tone('sawtooth', 200, 1200, .6, .07); noise(1.2, .2, 'lowpass', 3000, 100, n + .4); tone('sine', 90, 30, 1.2, .2, n + .4); break;
    case 'chest': [659, 784, 988, 1319].forEach((f, i) => tone('triangle', f, f, .2, .06, n + i * .06)); break;
    case 'buy': tone('square', 988, 988, .06, .04); tone('square', 1319, 1319, .14, .04, n + .06); break;
    case 'win': [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone('square', f, f, .22, .05, n + i * .11)); break;
    case 'lose': [392, 349, 311, 262].forEach((f, i) => tone('triangle', f, f * .98, .35, .07, n + i * .22)); break;
    case 'ball': [1047, 1319, 1568].forEach((f, i) => tone('sine', f, f, .25, .06, n + i * .05)); break;
    default: tone('square', 440, 220, .1, .03);
  }
}
sfx = function (k) { if (AC && AC.state != 'running') { AC.resume(); return; } sfxPlay(k); };
// extra sound hooks on existing actions
{ const _k = kameBeams; kameBeams = function (a, L) { sfxPlay('beam'); return _k(a, L); }; }
{ const _u = ultFire; ultFire = function () { const r = (S.ult || 0) >= 100 && S.mode == 'play'; _u(); if (r) { sfxPlay('ult'); kick(16); } }; }

// ---- music: tiny step sequencer (bass, lead, drums) with per-scene patterns ----
const NOTE = s => 440 * Math.pow(2, (s - 69) / 12);
const SONGS = {
    menu: { gen: 1, bpm: 158, root: 62, vol: .62, bars: [[0,0,[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]],[5,0,[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]],[7,0,[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]],[7,0,[-1,-1,-1,-1,-1,-1,-1,-1,7,-2,9,-2,11,-2,12,14]],[0,0,[12,-2,-1,12,14,-2,16,-2,19,-2,-2,16,14,-2,12,-2]],[7,0,[11,-2,-1,11,12,-2,14,-2,16,-2,-2,-2,-1,-1,7,9]],[9,1,[11,-2,-1,11,12,-2,14,-2,16,-2,19,-2,21,-2,19,-2]],[5,0,[16,-2,-2,14,12,-2,14,-2,16,-2,-2,-2,-2,-2,-1,-1]],[5,0,[7,-2,9,-2,11,-2,12,-2,14,-2,12,-2,11,-2,9,-2]],[7,0,[9,-2,11,-2,12,-2,14,-2,16,-2,14,-2,12,-2,11,-2]],[4,1,[14,-2,16,-2,17,-2,-2,16,14,-2,16,-2,19,-2,-2,-2]],[7,0,[19,-2,21,-2,23,-2,-2,-2,-1,-1,-1,-1,19,-2,21,23]],[5,0,[24,-1,24,-1,26,-2,28,-2,-2,-2,-1,-1,26,-1,24,-1]],[7,0,[26,-2,-2,-1,24,-2,21,-2,23,-2,-2,-2,-1,-1,-1,-1]],[4,1,[21,-1,21,-1,23,-2,26,-2,-2,-2,-1,-1,28,-1,26,-1]],[9,1,[28,-2,-2,-1,26,-2,23,-2,26,-2,-2,-2,-1,-1,19,21]],[5,0,[24,-1,24,-1,26,-2,28,-2,-2,-2,-1,-1,26,-1,24,-1]],[7,0,[26,-2,-2,-1,28,-2,31,-2,33,-2,-2,-2,-1,-1,31,33]],[0,0,[36,-2,-2,-2,-2,-2,35,-2,33,-2,31,-2,33,-2,-2,-2]],[0,0,[36,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-1,-1,-1,-1]],[5,0,[24,-1,24,-1,26,-2,28,-2,-2,-2,-1,-1,26,-1,24,-1]],[7,0,[26,-2,-2,-1,24,-2,21,-2,23,-2,-2,-2,-1,-1,-1,-1]],[4,1,[21,-1,21,-1,23,-2,26,-2,-2,-2,-1,-1,28,-1,26,-1]],[9,1,[28,-2,-2,-1,26,-2,23,-2,26,-2,-2,-2,-1,-1,19,21]],[5,0,[24,-1,24,-1,26,-2,28,-2,-2,-2,-1,-1,26,-1,24,-1]],[7,0,[26,-2,-2,-1,28,-2,31,-2,33,-2,-2,-2,-1,-1,31,33]],[0,0,[36,-2,-2,-2,-2,-2,35,-2,33,-2,31,-2,33,-2,-2,-2]],[0,0,[36,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-1,-1,-1,-1]]], tr: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2], sec: ["i","i","i","i","v","v","v","v","v","v","v","v","c","c","c","c","c","c","c","c","c","c","c","c","c","c","c","c"] },
  intro: { bpm: 120, root: 57, bass: [0, 0, 0, 0, 3, 3, 5, 5], lead: [], dr: 'x.......x.......', sn: '........', hat: 'x.x.x.x.x.x.x.x.', vol: .45 },
  stage: { bpm: 138, root: 57, bass: [0, 0, 12, 0, 10, 0, 7, 8], lead: [12, -1, 15, 12, 19, -1, 17, 15, 12, -1, 10, -1, 7, 10, 12, -1], dr: 'x...x...x...x..x', sn: '....x.......x...', hat: '..x...x...x...x.', vol: .42 },
  namek: { bpm: 132, root: 54, bass: [0, 0, 7, 0, 5, 0, 3, 5], lead: [7, -1, 12, -1, 14, 12, 10, -1, 7, -1, 5, 7, 10, -1, -1, -1], dr: 'x.....x.x.......', sn: '....x.......x...', hat: 'x.xxx.xxx.xxx.xx', vol: .42 },
  boss: { bpm: 156, root: 52, bass: [0, 0, 0, 12, 0, 0, 13, 0], lead: [12, 13, 12, -1, 15, -1, 13, 12, 10, -1, 12, -1, 7, 8, 7, -1], dr: 'x.x.x...x.x.x..x', sn: '....x.......x.x.', hat: 'xxxxxxxxxxxxxxxx', vol: .5 },
  win: { bpm: 120, root: 60, bass: [0, 0, 5, 5, 7, 7, 0, 0], lead: [12, 16, 19, 24, -1, 19, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1], dr: 'x...x...', sn: '....', hat: '..x...x.', vol: .45, once: 1 },
  lose: { bpm: 80, root: 52, bass: [0, 0, -2, -2, -4, -4, -5, -5], lead: [], dr: 'x.......', sn: '', hat: '', vol: .35, once: 1 }
};

// ---- structured song engine: chord bars, power-chord stabs, brass lead, rock kit ----
function genStep(sg, i, t, st, D) {
  const nb = sg.bars.length, bi = Math.floor(i / 16) % nb, c = i % 16, bar = sg.bars[bi], sec = sg.sec[bi], k = sg.root + sg.tr[bi], r = bar[0], mi = bar[1];
  const third = mi ? 3 : 4, isC = sec == 'c', isI = sec == 'i';
  // drums: driving kick, big snare on 2 and 4, 8th hats (16ths in the chorus), crash on every section start
  if (c % 4 == 0 || (isC && c == 10) || (!isI && c == 6 && bi % 2)) tone('sine', 160, 40, .2, .6, t, D);
  if (c == 4 || c == 12 || (isI && bi == nb - 1 && c >= 8 && c % 2 == 0) || (isI && bi == 3 && c > 12)) { noise(.16, .26, 'bandpass', 2000, 800, t, D, .7); tone('triangle', 200, 120, .08, .12, t, D); }
  if (isC ? true : c % 2 == 0) noise(.035, c % 4 == 2 ? .07 : .045, 'highpass', 7500, 0, t, D);
  if (c == 0 && (sg.sec[(bi + nb - 1) % nb] != sec || bi == 0 || (sg.tr[bi] != sg.tr[(bi + nb - 1) % nb]))) noise(1.1, .16, 'highpass', 4000, 2500, t, D);
  // bass: chugging 8ths with an octave pop on the off-beat
  if (c % 2 == 0) { const f = NOTE(k - 24 + r + (c % 4 == 2 && !isI ? 12 : 0)); tone('sawtooth', f, 0, st * 1.7, .07, t, D); tone('triangle', f, 0, st * 1.8, .2, t, D); }
  // power-chord stabs (root + fifth + octave): syncopated hits, sustained in the intro
  const stab = isI ? (c == 0) : (c == 0 || c == 3 || c == 6 || c == 10 || (isC && c == 14));
  if (stab) { const d = isI ? st * 14 : st * 1.6; for (const n of [0, 7, 12]) { const f = NOTE(k - 12 + r + n); tone('sawtooth', f, 0, d, .045, t, D); tone('sawtooth', f * 1.006, 0, d, .03, t, D); } }
  // soft pad under the verse so it breathes before the chorus hits
  if (sec == 'v' && c == 0) for (const n of [0, third, 7]) tone('triangle', NOTE(k + r + n), 0, st * 15, .03, t, D);
  // lead: stacked detuned brass, doubled an octave up in the chorus
  const L = bar[2][c];
  if (L >= 0) { let h = 1; while (c + h < 16 && bar[2][c + h] == -2) h++;
    const d = st * (h + .35), f = NOTE(k + L - (isC ? 12 : 0));
    tone('sawtooth', f, 0, d, .06, t, D); tone('sawtooth', f * 1.005, 0, d, .045, t, D); tone('square', f * .5, 0, d, .02, t, D);
    if (isC) { tone('square', f * 2, 0, d, .025, t, D); tone('sawtooth', f * 2 * .997, 0, d, .02, t, D); } }
}
const MUS = {
  cur: null, wantK: null, step: 0, next: 0, timer: 0,
  want(k) { this.wantK = k; if (this.cur !== k) { this.cur = k; this.step = 0; if (AC) this.next = AC.currentTime + .05; this.sync(); } },
  sync() { if (!AC || !bus()) return; const on = SET.music && !muted && S && S.mode != 'pause';
    const v = on ? (SONGS[this.cur] || SONGS.menu).vol * .75 : 0; BUS.mus.gain.setTargetAtTime(v, AC.currentTime, .3); },
  tick() {
    if (!AC || AC.state != 'running' || !bus() || !this.cur) return; this.sync();
    const sg = SONGS[this.cur]; if (!sg) return; const st = 60 / sg.bpm / 4;
    if (this.next < AC.currentTime) this.next = AC.currentTime + .02;
    while (this.next < AC.currentTime + .12) {
      const i = this.step, t = this.next, D = BUS.mus;
      if (sg.gen) { genStep(sg, i, t, st, D); this.next += st; this.step++; continue; }
      if (sg.once && i >= 64) { this.next += st; this.step++; continue; }
      if (i % 2 == 0) { const b = sg.bass[(i >> 1) % sg.bass.length]; tone('triangle', NOTE(sg.root - 12 + b), 0, st * 1.8, .22, t, D); tone('square', NOTE(sg.root - 12 + b), 0, st * 1.2, .035, t, D); }
      const LL = sg.lead.length, L = LL ? sg.lead[i % LL] : -1;
      if (L >= 0 && (sg.brass || (i >> 4) % 4 != 3)) { let h = 1; while (h < 16 && sg.lead[(i + h) % LL] == -2) h++;
        const d = st * (h + .4), f = NOTE(sg.root + L);
        if (sg.brass) { tone('sawtooth', f, 0, d, .05, t, D); tone('sawtooth', f * 1.004, 0, d, .035, t, D); tone('square', f * 2, 0, Math.min(d, st * 1.2), .012, t, D); }
        else { tone('square', f, 0, st * 1.6, .045, t, D); tone('triangle', f * 2, 0, st, .02, t, D); } }
      if (sg.pad && i % 16 == 0) { const ch = sg.pad[(i >> 4) % sg.pad.length]; for (const n of ch) tone('triangle', NOTE(sg.root - 12 + n), 0, st * 15, .03, t, D); }
      const c = i % 16;
      if (sg.dr[c % sg.dr.length] == 'x') { tone('sine', 150, 42, .18, .5, t, D); }
      if (sg.sn && sg.sn[c % sg.sn.length] == 'x') noise(.12, .18, 'bandpass', 1800, 900, t, D, .8);
      if (sg.hat && sg.hat[c % sg.hat.length] == 'x') noise(.03, .05, 'highpass', 7000, 0, t, D);
      this.next += st; this.step++;
    }
  }
};
setInterval(() => { try { MUS.tick(); } catch (e) { } }, 50);
{ const _mu = mu.onclick; mu.onclick = function () { _mu(); MUS.sync(); }; }
document.addEventListener('visibilitychange', () => { if (BUS && AC) BUS.mus.gain.setTargetAtTime(document.hidden ? 0 : .3, AC.currentTime, .05); });
MUS.want('menu');

/* ---------- css bits for 2.0 ---------- */
document.head.insertAdjacentHTML('beforeend', `<style>
.ver{display:inline-block;margin:2px auto 6px;padding:1px 10px;border-radius:20px;background:linear-gradient(90deg,#ff5a3a,#ffd23a);color:#2a0600;font:900 13px Impact,Haettenschweiler,"HelveticaNeue-CondensedBlack","Avenir Next Condensed","Roboto Condensed",sans-serif-condensed,"Arial Narrow","Arial Black",sans-serif;letter-spacing:2px}
</style>`);
if (S && S.mode == 'menu' && !/Welcome back/.test(ov.textContent)) menu();
