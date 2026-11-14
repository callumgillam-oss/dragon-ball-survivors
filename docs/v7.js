/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — PLAYTEST FEEDBACK PASS (2026-11-13)
   Loaded last. Everything here is a wrapper or a small replacement; the matching direct edits
   (damage-source tags, Final Flash sweep, Explosive Wave, Senzu regen, Spirit Bomb area, Dragon Ball pacing,
   Kaioken gravity well, multi-boss bars, difficulty lock) live in the files they belong to.
   ===================================================================== */
'use strict';

const esc7 = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nm7 = k => (S.evo && S.evo[k] && EVO[k] ? EVO[k][0] : (BASE[k] || (INFO[k] ? INFO[k][0] : k))).replace(/^🤝 /, '');
const icon7 = k => { try { return iurl(k); } catch (e) { return ''; } };

/* ---------- every hero can find every unlocked attack (Special Beam Cannon was Piccolo-only) ---------- */
{ const _in = init; init = function () { _in(); if (S.w.sbc === undefined) { S.w.sbc = 0; S.cd.sbc = 1; } }; }

/* ---------- difficulty is fixed at Hard ---------- */
DLV = 1;
{ const _w = svWelcome; svWelcome = function () { const r = _w(); DLV = 1; return r; }; }

/* ---------- shop: +20% on every price ---------- */
for (const k in UPG) UPG[k][4] *= 1.2;

/* ---------- balance (no bot testing: shipped for the player to judge) ---------- */
// Level 2: Recoome a little softer; Jeice, Burter, Guldo and Ginyu a little tougher. Android 19 has more to do now, so less HP.
{ const _b = DIFF.boss; DIFF.boss = k => _b(k) * ({ rec: .88, jei: 1.15, bur: 1.15, gul: 1.15, gin: 1.15, a19: .85 }[k] || 1); }
// Level 2 opens harder: tougher mobs and extra spawns, both fading out by 3:00.
{ const _h = DIFF.hp; DIFF.hp = t => _h(t) * (S.stage == 2 && !S.endless ? 1 + .25 * Math.max(0, 1 - t / 180) : 1); }
// Playtest pass 3: Level 2 mobs are 10% tougher and hit 10% harder
{ const _h = DIFF.hp; DIFF.hp = t => _h(t) * (S.stage == 2 && !S.endless ? 1.1 : 1); }
{ const _d = DIFF.dmg; DIFF.dmg = t => _d(t) * (S.stage == 2 && !S.endless ? 1.1 : 1); }
{ const _u = update; update = function (dt) {
    const r = _u(dt);
    if (S.mode == 'play' && S.stage == 2 && !S.endless && S.t < 180 && !S.en.some(e => e.boss)) {
      S.x7 = (S.x7 ?? 1.5) - dt;
      if (S.x7 <= 0) { S.x7 = .45 + .8 * S.t / 180; if (S.en.length < 170) spawnE(pickE()); }
    }
    return r;
  }; }

/* ---------- Android 19: more than a big health bar ---------- */
// Absorb (get behind him) now has a payoff: whatever he soaks up comes back out as a ring of shots.
// Between absorbs he winds up and charges along a warning line; if he catches you he drains you (slow + heals him a little).
// Below 55% he overcharges once: calls drones, moves faster, fires wider.
AI.a19 = function (e, dt) {
  const p = S.p, h2 = e.hp < e.max * .55;
  if (h2 && !e.p2) { e.p2 = 1; e.spd *= 1.15; summon(e, 'drg', 2); summon(e, 'dr', 3); ban('ANDROID 19 OVERCHARGES!'); kick(8); sfxPlay('bosscharge'); }
  e.t3 = (e.t3 ?? 3) - dt; e.t4 = (e.t4 ?? 6) - dt; e.t6 = (e.t6 ?? 4) - dt;
  if (e.abs > 0) {
    e.abs -= dt;
    if (e.abs <= 0) { e.t4 = h2 ? 7 : 9; e.t6 = Math.max(e.t6, 1.5);
      const n = Math.min(22, (h2 ? 8 : 6) + Math.round((e.sto || 0) / 25)); ring(e, n, 190, 'pu', 8);
      if ((e.sto || 0) > 0) { ban('HE RELEASES THE STOLEN ENERGY!'); kick(6); } e.sto = 0; sfxPlay('zap'); }
  } else if (e.ln) {   // winding up: stands still while the warning line shows
    e.ln.t -= dt; if (e.ln.t <= 0) { const L = e.ln; e.ln = null; e.dsh = .32; e.dvx = Math.cos(L.a) * L.len / .32; e.dvy = Math.sin(L.a) * L.len / .32; sfxPlay('dash'); }
  } else if (e.dsh > 0) {   // the charge
    e.dsh -= dt; e.x += e.dvx * dt; e.y += e.dvy * dt;
    if (Math.hypot(p.x - e.x, p.y - e.y) < e.r + 22 && !(e.grab > S.t)) { e.grab = S.t + 1.2; bossHurt(16); S.slow = Math.max(S.slow || 0, 1);
      e.hp = Math.min(e.max, e.hp + e.max * .015); if (S.nums.length < 40) S.nums.push({ x: p.x, y: p.y - 30, v: 'DRAINED!', l: .9, c: '#c8a0ff' }); }
  } else {
    chase(e, dt, 60);
    if (e.t4 <= 0) { e.abs = h2 ? 2.2 : 1.8; e.sto = 0; e.fa = ang(e, p.x, p.y); ban('ANDROID 19 IS ABSORBING ENERGY! GET BEHIND HIM!'); sfxPlay('absorb'); }
    else if (e.t6 <= 0) { e.t6 = h2 ? 5 : 6.5; const a = ang(e, p.x, p.y), len = Math.min(560, Math.hypot(p.x - e.x, p.y - e.y) + 160);
      e.ln = { a, t: .75, len }; lane(e.x, e.y, a, len, 48, .75, 0, 'pu'); sfxPlay('bosscharge'); }
    if (e.t3 <= 0) { e.t3 = h2 ? 2.4 : 3.2; fan(e, h2 ? 5 : 3, 220, 'or', 8); }
  }
  if (near_(e) && !(e.hc2 > S.t)) { e.hc2 = S.t + .5; bossHurt(16); }
};

/* ---------- damage tally (per attack, including Ki Burst) ---------- */
{ const _h = hitE; hitE = function (e, d) {
    const h0 = e.dead ? 0 : e.hp, r = _h(e, d);
    if (h0 > 0) { const dd = h0 - Math.max(0, e.hp);
      if (dd > 0) { const k = DSRC || 'other', T = S.dmg7 || (S.dmg7 = {}); T[k] = (T[k] || 0) + dd; }
      else if (dd < 0 && e.k == 'a19' && e.abs > 0) e.sto = (e.sto || 0) + d;   // Android 19 soaked it up
    }
    return r;
  }; }
const N7 = { ult: ['Ki Burst', '⚡'], ssj: ['Transformation burst', '💥'], db: ['Dragon Ball pickups', '🐉'], other: ['Other', '✦'] };
const fmtN7 = v => v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e4 ? Math.round(v / 1e3) + 'k' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'k' : Math.round(v) + '';
function dmgTally7() {
  const rows = Object.entries(S.dmg7 || {}).filter(r => r[1] >= 1).sort((a, b) => b[1] - a[1]); if (!rows.length) return '';
  const tot = rows.reduce((a, r) => a + r[1], 0), mx = rows[0][1];
  return `<div class="dmg7"><div class="d7h">Damage dealt <small>${fmtN7(tot)} total</small></div>` + rows.slice(0, 14).map(([k, v]) => {
    const n = N7[k], ic = n ? `<span class="d7e">${n[1]}</span>` : `<img src="${icon7(k)}" alt="">`;
    return `<div class="d7r${k == 'ult' ? ' u' : ''}">${ic}<span class="d7n">${esc7(n ? n[0] : nm7(k))}</span><span class="d7b"><i style="width:${(v / mx * 100).toFixed(1)}%"></i></span><b>${fmtN7(v)}</b><small>${Math.round(v / tot * 100)}%</small></div>`;
  }).join('') + '</div>';
}
{ const _e = endCard; endCard = function (win) {
    const r = _e(win), html = dmgTally7(); if (!html) return r;
    const put = root => { const c = root.querySelector('.card.end'); if (!c || c.querySelector('.dmg7')) return !!c; const st = c.querySelector('.stats');
      if (st) st.insertAdjacentHTML('afterend', html); else c.insertAdjacentHTML('beforeend', html); return true; };
    if (!put(ov) && typeof RV != 'undefined' && RV && RV.back) { const d = document.createElement('div'); d.innerHTML = RV.back; if (put(d)) RV.back = d.innerHTML; }
    return r;
  }; }

/* ---------- power-up screen: show counterparts you already own ---------- */
// Partners not unlocked yet stay hidden (they can't be offered this run, so naming them only teases).
const unl7 = (g, k) => (g == 'w' ? S.w[k] > 0 : S.ps[k] > 0) || RU((g == 'w' ? 'w:' : 'p:') + k);
evoHint = function (g, k) {
  if (g == 'w' && EVO[k] && INFO[EVO[k][2]]) { const ps = EVO[k][2], own = S.ps[ps] > 0; if (!unl7('ps', ps)) return '';
    return `<br><small class="new">Evolves with ${INFO[ps][0]}</small>${own ? ` <small class="own7b">✓ You have ${INFO[ps][0]}</small>` : ''}`; }
  if (g == 'ps') { const w = Object.keys(EVO).filter(x => EVO[x][2] == k && INFO[x] && unl7('w', x)); if (!w.length) return '';
    const owned = w.filter(x => S.w[x] > 0);
    return `<br><small class="new">Evolves: ${w.map(x => (S.evo[x] ? '★ ' : '') + (BASE[x] || INFO[x][0])).join(', ')}</small>` +
      (owned.length ? ` <small class="own7b">✓ You have ${owned.map(x => nm7(x)).join(', ')}</small>` : ''); }
  return '';
};
function pairOwned7(g, k) {
  if (g == 'w') return !!(EVO[k] && S.ps[EVO[k][2]] > 0);
  if (g == 'ps') return Object.keys(EVO).some(x => EVO[x][2] == k && S.w[x] > 0);
  return false;
}

/* ---------- owned attacks & passives strip (power-up and pause screens) ---------- */
function ownStrip7(title) {
  const it = []; let i = 0;
  for (const g of ['w', 'ps']) for (const k in S[g]) { const l = S[g][k]; if (!l || !INFO[k]) continue;
    const ev = S.evo[k], lv = ev ? '★ Evolved' : 'Level ' + l + (S.myth && S.myth[k] ? ' · Wished' : '');
    it.push(`<span class="o7i ${g}${ev ? ' ev' : ''}" style="animation-delay:${(i++ * .045).toFixed(3)}s" data-n="${esc7(nm7(k))}" data-l="${esc7(lv)}"><img src="${icon7(k)}" alt=""></span>`); }
  if (!it.length) return '';
  return `<div class="own7"><div class="o7h">${title} <small>· touch and slide for names</small></div><div class="o7r">${it.join('')}</div><div class="o7tip"></div></div>`;
}
{ const _lv = lvlUp; lvlUp = function () {
    _lv(); if (S.mode != 'lvl') return;
    const c = ov.querySelector('.card'); if (!c || c.classList.contains('lbc')) return;
    for (const b of c.querySelectorAll('button.up')) { const m = /pick\('(\w+)','(\w+)'/.exec(b.getAttribute('onclick') || ''); if (m && pairOwned7(m[1], m[2])) b.classList.add('pair7'); }
    if (!c.querySelector('.own7')) c.insertAdjacentHTML('beforeend', ownStrip7('Your build'));
  }; }
{ const _p = pz.onclick; pz.onclick = function () {
    const r = _p.apply(this, arguments); if (S.mode != 'pause') return r;
    const c = ov.querySelector('.card'); if (c && !c.querySelector('.own7')) c.insertAdjacentHTML('beforeend', ownStrip7('Your attacks & passives'));
    return r;
  }; }
// touch-and-slide name pop-out
const O7 = { on: false };
function o7show(x, y) {
  const el = document.elementFromPoint(x, y), it = el && el.closest && el.closest('.o7i'), box = it && it.closest('.own7');
  for (const q of document.querySelectorAll('.o7i.hot')) if (q !== it) q.classList.remove('hot');
  if (!it || !box) return; const tip = box.querySelector('.o7tip'); if (!tip) return;
  it.classList.add('hot'); tip.innerHTML = `<b>${it.dataset.n}</b><small>${it.dataset.l}</small>`; tip.classList.add('on');
  const br = box.getBoundingClientRect(), ir = it.getBoundingClientRect();
  tip.style.left = Math.max(4, Math.min(br.width - tip.offsetWidth - 4, ir.left - br.left + ir.width / 2 - tip.offsetWidth / 2)) + 'px';
  tip.style.top = (ir.top - br.top - tip.offsetHeight - 6) + 'px';
}
function o7hide() { O7.on = false; for (const t of document.querySelectorAll('.o7tip.on')) t.classList.remove('on'); for (const q of document.querySelectorAll('.o7i.hot')) q.classList.remove('hot'); }
addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('.o7r')) { O7.on = true; o7show(e.clientX, e.clientY); } });
addEventListener('pointermove', e => { if (O7.on || (e.pointerType == 'mouse' && e.target.closest && e.target.closest('.o7r'))) o7show(e.clientX, e.clientY); else if (e.pointerType == 'mouse') o7hide(); });
addEventListener('pointerup', () => { if (O7.on) setTimeout(o7hide, 900); O7.on = false; });
addEventListener('pointercancel', o7hide);

/* ---------- Ki Burst (and pause) work while another finger is walking ---------- */
// iOS doesn't send a click for a second finger while the first is held down, so fire on touch-down instead.
{ const quick = (b, fn) => { b.style.touchAction = 'none';
    b.addEventListener('pointerdown', e => { if (e.pointerType == 'mouse') return; e.preventDefault(); e.stopPropagation(); b._t7 = performance.now(); fn(); });
    addEventListener('click', e => { if (e.target === b && performance.now() - (b._t7 || 0) < 700) { e.stopImmediatePropagation(); e.preventDefault(); } }, true); };
  quick(ub, () => ultFire());
  quick(pz, () => pz.onclick()); }

/* ---------- Level 2 shooters (and other sprite mobs) idle instead of walking on the spot ---------- */
drawSpr = function (e, x, y, f) {
  const st = (S.stage || 1) - 1, g = SPRG[e.k], m = SPRM[e.k], left = S.p.x < e.x, sc = m[0] * (e.elite ? 1.5 : 1);
  const mv = Math.hypot(e.x - (e._lx ?? e.x), e.y - (e._ly ?? e.y)); e._lx = e.x; e._ly = e.y;
  if (S.mode == 'play') e._mv = (e._mv ?? 1) * .8 + (mv > .25 ? .2 : 0);
  const moving = (e._mv ?? 1) > .3, still = e.st > 0;
  const fr = still || !moving ? 0 : ((S.t * g.n * 2.25 + (e.sd = e.sd ?? Math.random() * 4) * (g.n / 4)) | 0) % g.n;
  ctx.save(); ctx.translate(x, y + m[1]); if (left) ctx.scale(-1, 1); ctx.scale(sc, sc);
  if (!moving && !still) { const b = Math.sin(S.t * 3.2 + (e.sd || 0) * 2), fy = g.h - g.oy; ctx.translate(0, fy); ctx.scale(1 - .012 * b, 1 + .03 * b); ctx.translate(0, -fy); }
  if (e.k == 'rap' && e.dash > 0) ctx.rotate(.18);
  ctx.drawImage((e.k == 'fs' && e.tm < .5 ? SPR.fsA : SPR[e.k])[st][f ? 1 : 0][fr], -g.ox, -g.oy, g.w, g.h); ctx.restore();
};

/* ---------- treasure chests get an off-screen arrow like Dragon Balls and Time Chambers ---------- */
const CHEST7 = (() => { const c = mk(36, 36), x = c.getContext('2d'); x.lineJoin = 'round';
  x.fillStyle = '#8a4a1a'; x.strokeStyle = '#3a1a06'; x.lineWidth = 2; x.fillRect(5, 14, 26, 16); x.strokeRect(5, 14, 26, 16);
  x.beginPath(); x.moveTo(5, 14); x.quadraticCurveTo(18, 3, 31, 14); x.closePath(); x.fillStyle = '#a85a22'; x.fill(); x.stroke();
  x.fillStyle = '#ffd23a'; x.fillRect(16, 12, 4, 18); x.fillRect(5, 19, 26, 3); x.strokeRect(15.5, 17, 5, 6); return c; })();
{ const _d = draw; draw = function () { _d();
    if (S.mode != 'play' || !S.chests || !S.chests.length) return;
    ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); for (const c of S.chests) if (!c.got) edgePointer(c.x, c.y, 'CHEST', 'or', '#ffcf6a', CHEST7); ctx.restore(); }; }

/* ---------- a better-looking Hyperbolic Time Chamber ---------- */
// The white-tiled floor of the real room, four glowing pillars, a turning ring of time marks and an hourglass in the middle.
function drawChamber7(s, x, y, k, t) {
  const R = s.r, ins = s.in;
  ctx.save();
  // floor: pale tiles fading out to the edge
  const fg = ctx.createRadialGradient(x, y, R * .1, x, y, R * 1.05); fg.addColorStop(0, 'rgba(250,250,255,.55)'); fg.addColorStop(.75, 'rgba(225,240,255,.3)'); fg.addColorStop(1, 'rgba(200,230,255,0)');
  ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(x, y, R * 1.05, 0, 7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R * .96, 0, 7); ctx.clip(); ctx.strokeStyle = 'rgba(150,190,230,.28)'; ctx.lineWidth = 1;
  const G = 22; ctx.beginPath(); for (let i = -5; i <= 5; i++) { ctx.moveTo(x + i * G, y - R); ctx.lineTo(x + i * G, y + R); ctx.moveTo(x - R, y + i * G); ctx.lineTo(x + R, y + i * G); } ctx.stroke(); ctx.restore();
  LT(); gl('cy', x, y, R * 1.45, .12 + .12 * k + (ins ? .08 : 0)); NM();
  // outer rim and turning ring of time marks
  ctx.strokeStyle = ins ? 'rgba(255,232,150,.95)' : 'rgba(170,225,255,.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.stroke();
  ctx.strokeStyle = 'rgba(120,180,230,.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, R - 16, 0, 7); ctx.stroke();
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * .25); ctx.strokeStyle = 'rgba(90,150,210,.75)'; ctx.lineWidth = 2;
  for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283, r0 = R - 14, r1 = R - (i % 6 ? 6 : 2); ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke(); }
  ctx.restore();
  // progress: a gold arc that fills the inner ring
  if (k > 0) { ctx.strokeStyle = 'rgba(255,190,60,.35)'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, R - 8, -1.5708, -1.5708 + k * 6.2832); ctx.stroke();
    ctx.strokeStyle = '#ffd86a'; ctx.lineWidth = 5; ctx.stroke(); }
  // four pillars of light
  for (let i = 0; i < 4; i++) { const a = i * 1.5708 + .7854, px = x + Math.cos(a) * R, py = y + Math.sin(a) * R, h = 26 + 6 * Math.sin(t * 3 + i);
    const pg = ctx.createLinearGradient(px, py - h, px, py); pg.addColorStop(0, 'rgba(200,240,255,0)'); pg.addColorStop(1, 'rgba(220,245,255,.85)');
    ctx.fillStyle = pg; ctx.fillRect(px - 4, py - h, 8, h); ctx.fillStyle = '#f4fbff'; ctx.strokeStyle = 'rgba(40,90,140,.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(px, py, 7, 3.5, 0, 0, 7); ctx.fill(); ctx.stroke();
    LT(); gl('cy', px, py - h * .6, 14, .45); NM(); }
  // hourglass in the middle, sand running while you stand inside
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2) * 2); const hw = 11, hh = 16, sand = ins ? (t * .5) % 1 : k;
  LT(); gl('wh', 0, 0, 30, .35 + .15 * Math.sin(t * 4)); NM();
  ctx.fillStyle = 'rgba(230,245,255,.75)'; ctx.strokeStyle = '#2a4a6a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-hw, -hh); ctx.lineTo(hw, -hh); ctx.lineTo(2, 0); ctx.lineTo(hw, hh); ctx.lineTo(-hw, hh); ctx.lineTo(-2, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffcf5a'; const top = (1 - sand) * (hh - 3);
  if (top > .5) { ctx.beginPath(); ctx.moveTo(-hw + 3 + (hh - 3 - top) * .5, -top); ctx.lineTo(hw - 3 - (hh - 3 - top) * .5, -top); ctx.lineTo(1, -1); ctx.lineTo(-1, -1); ctx.closePath(); ctx.fill(); }
  const bot = sand * (hh - 3); if (bot > .5) { ctx.beginPath(); ctx.moveTo(-hw + 2, hh - 1); ctx.lineTo(hw - 2, hh - 1); ctx.lineTo(hw - 2 - bot * .55, hh - 1 - bot); ctx.lineTo(-hw + 2 + bot * .55, hh - 1 - bot); ctx.closePath(); ctx.fill(); }
  if (ins) { ctx.fillRect(-.8, 0, 1.6, hh - 1 - bot); }
  ctx.fillStyle = '#8a5a2a'; ctx.fillRect(-hw - 2, -hh - 3, hw * 2 + 4, 3); ctx.fillRect(-hw - 2, hh, hw * 2 + 4, 3);
  ctx.restore();
  // rising motes while you train inside
  if (ins) { ctx.fillStyle = 'rgba(255,240,180,.8)'; for (let i = 0; i < 10; i++) { const a = hash(i, 71) * 6.283, rr = R * (.2 + hash(i, 72) * .7), ph = (t * .6 + hash(i, 73)) % 1;
      ctx.globalAlpha = 1 - ph; ctx.fillRect(x + Math.cos(a) * rr, y + Math.sin(a) * rr - ph * 40, 2, 2); } ctx.globalAlpha = 1; }
  // label
  ctx.font = 'bold 13px "Trebuchet MS",sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(10,30,50,.85)'; ctx.lineJoin = 'round';
  ctx.strokeText('TIME CHAMBER', x, y - R - 12); ctx.fillStyle = ins ? '#ffe9a0' : '#dff4ff'; ctx.fillText('TIME CHAMBER', x, y - R - 12);
  ctx.restore();
}

/* ---------- reduced flashing: dim every full-screen light flash, wherever it comes from ---------- */
{ const _fr = ctx.fillRect, lightRGB = st => { let m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(st); if (m) return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
    m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(st); return m ? [+m[1], +m[2], +m[3]] : null; };
  ctx.fillRect = function (x, y, w, h) {
    if (SET.flash == 'reduced' && typeof this.fillStyle == 'string' && x <= 0 && y <= 0 && x + w >= W - 1 && y + h >= H - 1) {
      const c = lightRGB(this.fillStyle);
      if (c && Math.min(c[0], c[1], c[2]) >= 190) { const ga = this.globalAlpha; this.globalAlpha = ga * .35; _fr.call(this, x, y, w, h); this.globalAlpha = ga; return; }
    }
    return _fr.call(this, x, y, w, h);
  }; }

/* ---------- settings: Character art removed, Flashing row fits, Reset all progress ---------- */
if (SET.art == 'classic') { SET.art = 'v2'; saveSet(); try { applyArt('v2'); } catch (e) { } }
{ const _st = settings; settings = function (back) {
    _st(back); const c = ov.querySelector('.card'); if (!c) return; const g = c.querySelector('.sgrid') || c;
    for (const b of g.querySelectorAll('button.srow')) { const oc = b.getAttribute('onclick') || '';
      if (oc == 'togArt()') b.remove();
      if (/'flash'/.test(oc)) { const sp = b.querySelector('span'), sm = b.querySelector('small'); if (sp) sp.textContent = 'Flashing'; if (sm) sm.textContent = 'Reduced softens screen flashes'; } }
    g.insertAdjacentHTML('beforeend', `<button class="srow rst7" onclick="reset7a()"><span>Reset all progress</span><b>⚠</b><small>Start over from nothing</small></button>`);
  }; }
function reset7a() {
  show(`<div class="card dbz"><h2>Reset all progress?</h2><p>This erases your Zeni, Capsule Corp upgrades, unlocked heroes, attacks, achievements, best times and any saved run. Your settings are kept.</p>
  <button class="go rst7" onclick="reset7b()">Yes, reset everything</button><button onclick="settings()">Cancel</button></div>`);
}
function reset7b() {
  show(`<div class="card dbz"><h2>Are you absolutely sure?</h2><p><b>This cannot be undone.</b> All of your progress will be gone for good.</p>
  <button onclick="settings()">No, keep my progress</button><button class="rst7" onclick="reset7go()">Erase all progress</button></div>`);
}
function reset7go() {
  const keep = /^dbs_(set|gfx|probe|ts|v)$/;
  for (const k of store.keys()) if (/^dbs_/.test(k) && !keep.test(k)) store.removeItem(k);
  store.setItem('dbs_v', '3');
  try { localStorage.removeItem('dbs_run'); } catch (e) { }
  show('<div class="card dbz"><h2>Progress reset</h2><p>Starting fresh…</p></div>');
  store.flush(); setTimeout(() => location.reload(), 700);
}

/* ---------- locked hero: a clear lock, and the levels are greyed out ---------- */
{ const _cd = carDesc; carDesc = function (e) {
    _cd(e); const d = ov.querySelector('.hdesc'), card = ov.querySelector('.card');
    if (card) card.classList.toggle('hlk7', !e.ok);
    if (d && !e.ok) d.innerHTML = `<b>${e.n}</b> <span class="lk7">🔒 LOCKED</span><br><small>${e.d}</small>`;
  }; }

/* ---------- styles ---------- */
document.head.insertAdjacentHTML('beforeend', `<style>
.card>.own7,.card>.dmg7{flex-basis:100%}
.own7{position:relative;margin:8px 0 2px;padding:6px 6px 4px;border-top:1px solid rgba(255,190,90,.25)}
.o7h{font-size:11px;color:#ffd27a;text-align:center;margin-bottom:5px;letter-spacing:.3px}.o7h small{opacity:.6;color:#ffe9c8}
.o7r{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;touch-action:none;user-select:none;-webkit-user-select:none}
.o7i{position:relative;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 35% 30%,#5a3214,#1a0a02);border:2px solid #ff9a1f;
  animation:o7in .38s cubic-bezier(.2,1.4,.4,1) both;transition:transform .12s}
.o7i.ps{background:radial-gradient(circle at 35% 30%,#1c3a5a,#06101c);border-color:#6ac8ff}
.o7i.ev{border-color:#ffe27a;box-shadow:0 0 10px rgba(255,210,80,.7)}
.o7i img{width:28px;height:28px;pointer-events:none}
.o7i.hot{transform:scale(1.25);z-index:2;box-shadow:0 0 12px #ffd27a}
@keyframes o7in{from{opacity:0;transform:translateY(14px) scale(.55)}to{opacity:1;transform:none}}
.o7tip{position:absolute;left:0;top:0;padding:4px 9px;border-radius:9px;background:#2b1a0d;border:2px solid #ffb458;color:#fff4e0;font-size:12px;white-space:nowrap;
  pointer-events:none;opacity:0;transform:translateY(4px);transition:opacity .12s,transform .12s;z-index:5;text-align:center;line-height:1.25}
.o7tip.on{opacity:1;transform:none}.o7tip small{display:block;font-size:10px;color:#ffd27a}
.own7b{color:#9fe8a0;font-weight:700}
.card .up.pair7{position:relative;overflow:hidden}.card .up.pair7::after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.08) 40%,rgba(255,250,220,.38) 50%,rgba(255,255,255,.08) 60%,transparent 70%);background-size:250% 100%;background-repeat:no-repeat;animation:pair7s 2.4s ease-in-out infinite}@keyframes pair7s{0%{background-position:150% 0}60%,100%{background-position:-50% 0}}@media (prefers-reduced-motion:reduce){.card .up.pair7::after{animation:none;background:linear-gradient(105deg,transparent 35%,rgba(255,250,220,.18) 50%,transparent 65%)}}
.dmg7{margin:6px 0 4px;padding:6px 8px;border-radius:10px;background:rgba(20,8,2,.45);border:1px solid rgba(255,170,60,.3)}
.d7h{font-size:13px;color:#ffd27a;text-align:center;margin-bottom:5px;font-weight:700}.d7h small{color:#ffe9c8;opacity:.7;font-weight:400}
.d7r{display:flex;align-items:center;gap:6px;font-size:11.5px;line-height:1;margin:3px 0}
.d7r img,.d7e{width:18px;height:18px;flex:none;text-align:center;font-size:14px}
.d7n{flex:0 1 42%;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:left}
.d7b{flex:1;height:8px;border-radius:4px;background:rgba(255,255,255,.08);overflow:hidden}.d7b i{display:block;height:100%;background:linear-gradient(90deg,#ff9a1f,#ffd27a)}
.d7r.u .d7b i{background:linear-gradient(90deg,#3aa0ff,#bfe8ff)}
.d7r b{flex:none;width:42px;text-align:right;color:#fff4e0}.d7r small{flex:none;width:30px;text-align:right;opacity:.6}
.srow span,.srow b{white-space:nowrap}
.card .srow.rst7,.card button.rst7{border-color:#ff7a5a;color:#ffd0c4;background:rgba(90,16,10,.55)}
.card button.rst7:hover{background:rgba(130,24,14,.75)}
.card button.gch:hover,.card button.gch:focus-visible,.card button.gch:active{background:rgba(40,20,60,.55);box-shadow:none}
.card button.gch.on:hover,.card button.gch.on:focus-visible,.card button.gch.on:active{background:linear-gradient(#8a3cd8,#5a1ea0);box-shadow:0 0 10px rgba(180,110,255,.55)}
@media (hover:hover){.card button.gch:hover{background:rgba(70,36,100,.65)}}
.lk7{display:inline-block;margin-left:4px;padding:1px 7px;border-radius:8px;background:#3a2a14;border:1px solid #8a6a3a;color:#ffd27a;font-size:11px;font-weight:800;letter-spacing:.5px}
.hlk7 .lvc,.hlk7 button[onclick^="start"],.hlk7 .gcw{filter:grayscale(1) brightness(.6);opacity:.55;pointer-events:none}
.hlk7 .vskin{display:none}
.hcd.lk::after{content:'🔒';position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);font-size:26px;filter:drop-shadow(0 2px 3px #000)}
</style>`);
if (typeof PROG_READY != 'undefined' && PROG_READY && S && S.mode == 'menu' && !svWelcomeOn) menu();

/* ---------- hit flash without strobing (feedback 2026-11-13) ----------
   Every hit turned an enemy fully white for 0.1 s. A big evolved Kaioken aura hits the whole pack every 0.22 s,
   so the crowd strobed white in sync 4-5 times a second. Now an enemy can only start a new white flash after a
   short, randomised gap (longer for damage-over-time like the aura), so a pack never blinks in unison.
   With Flashing effects set to Reduced, hits don't flash enemies at all (damage numbers still show). */
const HF7 = { gap: .45, jit: .3, dotGap: 1.4, dot: { aura: 1, bomb: 1 } };
{ const _h = hitE; hitE = function (e, d) {
    const pf = e ? e.fl : 0, r = _h(e, d);
    if (e && pf > 0 && e.fl > pf) e.fl = pf;   // a hit never extends a flash already showing (steady damage would hold it white)
    else if (e && e.fl > 0 && !(pf > 0)) {
      const ok = SET.flash != 'reduced' && S.t >= (e.fn7 || 0);
      if (ok) e.fn7 = S.t + (HF7.dot[DSRC] ? HF7.dotGap : HF7.gap) + Math.random() * HF7.jit;
      else e.fl = pf || 0;
    }
    return r;
  }; }

/* ---------- the game loop can never silently stop (Edge "resume, then frozen" report) ----------
   1) A watchdog restarts the loop if it hasn't run for 1.5 s while the page is visible.
   2) Duplicate loop chains (a restart racing a late frame) are dropped, so the game never runs double speed.
   3) If drawing fails every frame (the picture would just freeze), the error is shown on screen to report. */
const LP7 = { t: performance.now(), ts: -1, streak: 0, errN: 0, shown: '' };
{ const _l = loop; loop = function (ts) {
    if (ts === LP7.ts) return;   // a second chain in the same frame: let it die
    LP7.ts = ts; LP7.t = performance.now();
    const n0 = V2.errN || 0; _l(ts);
    LP7.streak = (V2.errN || 0) > n0 ? LP7.streak + 1 : 0;
    if (LP7.streak > 90 && V2.lastErr) {
      const e = V2.lastErr, msg = String(e && e.message || e).slice(0, 120);
      if (LP7.shown != msg) { LP7.shown = msg;
        let d = document.getElementById('err7');
        if (!d) { d = document.createElement('div'); d.id = 'err7'; d.style.cssText = 'position:fixed;left:8px;right:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);background:#3a0d0d;color:#ffd9d0;border:2px solid #ff7a5a;border-radius:10px;padding:8px 10px;font:12px/1.35 system-ui,sans-serif;z-index:60;white-space:pre-wrap;word-break:break-word'; d.onclick = () => d.remove(); document.body.append(d); }
        d.textContent = 'The game hit an error and is stuck. Please screenshot this and report it (tap to hide):\n' + msg + '\n' + String(e && e.stack || '').split('\n').slice(1, 3).join('\n').trim().slice(0, 200);
      }
    }
  }; }
setInterval(() => { if (!document.hidden && performance.now() - LP7.t > 1500) { LP7.t = performance.now(); requestAnimationFrame(loop); } }, 1000);

