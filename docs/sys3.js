/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — NEW SYSTEMS (EXPANSION_PLAN.md §6)
   Floor pickups (Time Freeze, Capsule Vacuum) · Ginyu Force Challenges ·
   Mafuba Seal (banish) · Limit Break · Potential Unleashed (5th slot) ·
   Scouter power-level readout · Vegeta's Saiyan-saga outfit toggle.
   ===================================================================== */
'use strict';

/* ---------- shop rows ---------- */
UPG.revive[0] = "King Kai's Training"; UPG.revive[1] = 'Once per run: train with King Kai, return at full HP with a level-up';
Object.assign(UPG, {
  seal: ['Mafuba Seal', '+1 seal per run: remove a level-up choice for good', 3, 1, 250, 1.6],
  slot: ['Potential Unleashed', 'A 5th attack slot', 1, 1, 3000, 1]
});
for (const k of ['seal', 'slot']) META[k] = Math.max(0, Math.min(UPG[k][2], META[k] | 0));
if (SET.lb === undefined) SET.lb = true;
if (SET.scouter === undefined) SET.scouter = true;

/* ---------- per-run state ---------- */
{ const _in = init; init = function () {
    _in();
    S.pk3 = []; S.tfT = 0; S.ban3 = {}; S.lb = { d: 0, a: 0, c: 0, h: 0 }; S.gc = {};
    S.seal = RU('s:seal') ? META.seal | 0 : 0;
    LIM.w = 4 + (RU('s:slot') && META.slot ? 1 : 0);
  }; }

/* ---------- 1) floor pickups ---------- */
// Elites drop one 25% of the time, ordinary enemies very rarely. At most 3 lie on the map at once.
const PK3 = {
  tf: { n: 'TIME FREEZE!', u: 'timefreeze' },
  vac: { n: 'CAPSULE VACUUM!', u: 'vacuum' }
};
function pk3Drop(e) {
  const opts = Object.keys(PK3).filter(k => RU(PK3[k].u));
  if (!opts.length || S.pk3.length >= 3 || e.boss) return;
  if (Math.random() < (e.elite ? .25 : 1 / 3000)) S.pk3.push({ x: e.x, y: e.y, k: opts[Math.random() * opts.length | 0], t: 0 });
}
{ const _k = killE; killE = function (e) { const was = e.dead; _k(e); if (!was && e.dead && S.mode == 'play' && S.pk3) pk3Drop(e); }; }
function pk3Get(q) {
  q.got = 1; ban(PK3[q.k].n); sfxPlay('chest');
  if (q.k == 'tf') { S.tfT = 5; aFlash(.6); }
  else { for (const g of S.gem) { g.vc = 1; g.vt = 0; } }
}
// Time Freeze: non-bosses stand still (and can't hurt you); bosses move at half speed.
// The enemy loop skips anything with e.st > 0, so each frame we top their stun up by exactly dt.
{ const _u = update; update = function (dt) {
    if (S.mode == 'play' && S.pk3) {
      const p = S.p;
      for (const q of S.pk3) { q.t += dt; if (!q.got && Math.hypot(q.x - p.x, q.y - p.y) < 30) pk3Get(q); }
      S.pk3 = S.pk3.filter(q => !q.got);
      if (S.tfT > 0) {
        S.tfT -= dt; const half = (S.t * 6 | 0) % 2 == 0;
        for (const e of S.en) if (!e.dead && (!e.boss || half)) e.st = (e.st || 0) + dt;
      }
      for (const g of S.gem) if (g.vc) {
        g.vt += dt; const dx = p.x - g.x, dy = p.y - g.y, d = Math.hypot(dx, dy) || 1, s = Math.min(d, (500 + 1800 * g.vt) * dt);
        g.x += dx / d * s; g.y += dy / d * s;
      }
    }
    return _u(dt);
  }; }
function drawPk3(cx, cy, t) {
  if (!S.pk3) return;
  for (const q of S.pk3) {
    const x = q.x - cx, y = q.y - cy + Math.sin(t * 3 + q.x) * 3; if (x < -40 || y < -40 || x > W + 40 || y > H + 40) continue;
    LT(); gl(q.k == 'tf' ? 'pu' : 'or', x, y, 34 + 4 * Math.sin(t * 5), .55); NM();
    ctx.save(); ctx.translate(x, y); ctx.lineWidth = 2; ctx.strokeStyle = '#1a1020';
    if (q.k == 'tf') { // Guldo-green stopwatch
      ctx.fillStyle = '#7fd26a'; ctx.fillRect(-3, -17, 6, 5); ctx.strokeRect(-3, -17, 6, 5);
      ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.fillStyle = '#7fd26a'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 9.5, 0, 7); ctx.fillStyle = '#f4fff0'; ctx.fill();
      ctx.strokeStyle = '#3a1a5a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -7); ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(t * 4) * 6, Math.sin(t * 4) * 6); ctx.stroke();
    } else { // Capsule Corp capsule
      ctx.rotate(-.5 + Math.sin(t * 2) * .15);
      ctx.beginPath(); ctx.moveTo(-14, -7); ctx.lineTo(14, -7); ctx.arc(14, 0, 7, -1.571, 1.571); ctx.lineTo(-14, 7); ctx.arc(-14, 0, 7, 1.571, 4.712); ctx.closePath();
      const g = ctx.createLinearGradient(0, -7, 0, 7); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#b8c4d4'); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e8402a'; ctx.fillRect(-2, -7, 4, 14); ctx.fillStyle = '#2a64c8'; ctx.beginPath(); ctx.arc(-10, 0, 2.6, 0, 7); ctx.fill();
    }
    ctx.restore();
  }
}
function drawFreeze() {
  if (!(S.tfT > 0) || S.mode != 'play' && S.mode != 'pause' && S.mode != 'lvl') return;
  const a = Math.min(1, S.tfT / .5);
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  // time stands still: drain the colour, then a faint violet wash
  if (GFX != 'low') { ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'rgba(128,128,128,' + (.75 * a) + ')'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  ctx.fillStyle = 'rgba(120,90,200,' + (.14 * a) + ')'; ctx.fillRect(0, 0, W, H);
  // countdown ring under the HUD and boss bar
  const x = W / 2, y = 128; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.arc(x, y, 16, 0, 7); ctx.stroke();
  ctx.strokeStyle = '#a8f08a'; ctx.beginPath(); ctx.arc(x, y, 16, -1.571, -1.571 + 6.283 * Math.max(0, S.tfT) / 5); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(Math.ceil(S.tfT), x, y + 1);
  ctx.restore();
}

/* ---------- 2) Ginyu Force Challenges ---------- */
// Optional toggles on the main menu. They stack, and each one pays extra Zeni.
const GC = {
  hyper: { n: 'Ginyu Pose', e: '💪', d: 'The whole fight runs 25% faster', z: .4 },
  hurry: { n: "Recoome's Time Limit", e: '⏱️', d: 'Bosses arrive 30% sooner', z: .3 },
  grav: { n: '100x Gravity', e: '🪨', d: 'Enemies have +40% HP and +15% speed', z: .6 }
};
const gcOn = () => Object.keys(GC).filter(k => S.gc && S.gc[k]);
const gcZ = () => gcOn().reduce((a, k) => a + GC[k].z, 0);
function gcTog(k) { P.gc = P.gc || {}; P.gc[k] = !P.gc[k]; saveProg(); menu(); }
{ const _s = start; start = function (st) {
    const r = _s(st);
    S.gc = {}; if (RU('ginyu') && P.gc) for (const k in GC) if (P.gc[k]) S.gc[k] = 1;
    return r;
  }; }
{ const _sp = spawnE; spawnE = function (k) {
    const r = _sp(k);
    if (S.gc && S.gc.grav) { const e = S.en[S.en.length - 1]; if (e) { e.hp *= 1.4; e.max *= 1.4; if (!e.boss) e.spd *= 1.15; } }
    return r;
  }; }
{ const _u = update; update = function (dt) {
    if (S.gc && S.gc.hyper) dt *= 1.25;
    const r = _u(dt);
    if (S.gc && S.gc.hurry && S.sch && !S.sch.h) { S.sch.h = 1; for (const q of S.sch) q.t *= .7; }
    return r;
  }; }
{ const _a = awardZeni; awardZeni = function (win) {
    const z = _a(win), m = gcZ(); if (!m) return z;
    const x = Math.floor(z * m); META.zeni += x; P.zeni += x; saveMeta(); V2.gcZ = x; return z + x;
  }; }
// "Clear Level X with this challenge on" achievements, plus one for all three at once
for (const [k, c] of Object.entries(GC)) for (const st of [1, 2]) {
  ACH.push({ id: 'c' + k + st, c: 'chal', n: c.n + (st == 1 ? ' I' : ' II'), d: `Clear Level ${st} with ${c.n} on`, r: ['z:' + (st == 1 ? 400 : 800)], ev: 'win', t: () => S.stage == st && S.gc && S.gc[k] });
}
ACH.push({ id: 'call', c: 'chal', n: 'Ginyu Force, Assemble!', d: 'Clear Level 2 with all three challenges on', r: ['z:2500'], ev: 'win', t: () => S.stage == 2 && gcOn().length == 3 });
for (const a of ACH) ACH_BY[a.id] = a;

/* ---------- 3) Mafuba Seal (banish) + 4) Limit Break ---------- */
{ const _op = offerPool; offerPool = function () { return _op().filter(([g, k]) => !(S.ban3 && S.ban3[k])); }; }
function sealPick(k) {
  if (S.mode != 'lvl' || !(S.seal > 0)) return;
  S.seal--; S.ban3[k] = 1; sfxPlay('hit'); lvlUp();
}
// Limit Break boosts. Area and cooldown live in S.pe so the existing formulas pick them up;
// addPow recalculates S.pe for a passive, so we add the bonus back on top.
const LB = [
  { k: 'd', n: 'Power', d: '+4% damage', ic: '💥', f: () => { S.wishDmg = (S.wishDmg || 0) + .04; } },
  { k: 'a', n: 'Reach', d: '+3% area', ic: '🌀', f: () => { S.pe.area += .25; S.lb.a += .25; }, cap: () => S.lb.a >= 5 },
  { k: 'c', n: 'Speed', d: '-2% cooldowns', ic: '⏩', f: () => { S.pe.cdr += 2 / 9; S.lb.c += 2 / 9; }, cap: () => S.lb.c >= 2.2 },
  { k: 'h', n: 'Vitality', d: '+5 max HP and a full heal', ic: '❤️', f: () => { S.p.max += 5; S.p.hp = S.p.max; } }
];
{ const _ap = addPow; addPow = function (g, k, r) { _ap(g, k, r); if (g == 'ps' && S.lb && (k == 'area' || k == 'cdr')) S.pe[k] += k == 'area' ? S.lb.a : S.lb.c; }; }
function lbReady() {
  if (!RU('limitbreak') || !SET.lb || S.pend <= 0) return false;
  if (Object.keys(EVO).some(k => S.w[k] >= 5 && !S.evo[k] && S.ps[EVO[k][2]] > 0)) return false;
  return offerPool().length == 0;
}
function lbPick(i) {
  if (S.mode != 'lvl' || !S.lbOn) return; const o = LB[i]; if (!o || (o.cap && o.cap())) return;
  o.f(); S.lb[o.k] = (S.lb[o.k] || 0) + (o.k == 'd' || o.k == 'h' ? 1 : 0); S.lbN = (S.lbN || 0) + 1;
  sfxPlay('lvl'); if (S.luckN > 0) S.luckN--; S.pend--; lvlUp();
}
{ const _lv = lvlUp; lvlUp = function () {
    S.lbOn = lbReady();
    if (S.lbOn) {
      S.mode = 'lvl';
      show(`<div class="card lbc"><h2>♾️ LIMIT BREAK <small>Level ${S.p.lv}</small></h2><p class="how">Everything is maxed. Push past your limits: pick a permanent boost for this run.</p>` +
        LB.map((o, i) => { const capd = o.cap && o.cap(); return `<button class="up lb" ${capd ? 'disabled' : `onclick="lbPick(${i})"`}><span class="lbi">${o.ic}</span><div><b>${o.n}</b> <small>${capd ? 'MAX' : ''}</small><br><small>${o.d}</small></div></button>`; }).join('') +
        `<div class="slots">Limit Breaks this run: ${S.lbN || 0}</div></div>`);
      return;
    }
    _lv();
    if (S.mode != 'lvl' || !(S.seal > 0)) return;
    // a small Seal button on each normal choice
    for (const b of ov.querySelectorAll('button.up:not(.evo)')) {
      const m = /pick\('(\w+)','(\w+)'/.exec(b.getAttribute('onclick') || ''); if (!m) continue;
      const w = document.createElement('div'); w.className = 'upw'; b.replaceWith(w); w.append(b);
      const tx = b.querySelector('div'); if (tx) tx.insertAdjacentHTML('afterbegin', '<span class="sealsp"></span>');   // title wraps around the button
      w.insertAdjacentHTML('beforeend', `<button class="sealb" onclick="sealPick('${m[2]}')" title="Seal: never offer this again this run">🏺 Seal</button>`);
    }
    const h = ov.querySelector('.card h2'); if (h) h.insertAdjacentHTML('afterend', `<div class="sealn">🏺 Mafuba Seals left: ${S.seal}</div>`);
  }; }

/* ---------- 5) Scouter power-level readout ---------- */
function drawScouter(cx, cy, t) {
  if (!RU('scouter') || !SET.scouter) return;
  for (const e of S.en) {
    if (!e.boss || e.dead) continue; const x = e.x - cx, y = e.y - cy - e.r * 1.6 - 26; if (x < -60 || x > W + 60 || y < -20 || y > H + 20) continue;
    const pl = Math.ceil(e.hp * 5), s = pl.toLocaleString(), wd = 16 + s.length * 7.4;
    ctx.save(); ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(10,40,20,.72)'; ctx.fillRect(x - wd / 2, y - 9, wd, 18);
    ctx.strokeStyle = 'rgba(90,255,140,' + (.6 + .3 * Math.sin(t * 8)) + ')'; ctx.lineWidth = 1.2; ctx.strokeRect(x - wd / 2, y - 9, wd, 18);
    ctx.fillStyle = pl > 9000 ? '#ffe36a' : '#7dff9a'; ctx.fillText(s, x, y + .5);
    ctx.fillStyle = 'rgba(125,255,154,.8)'; ctx.font = 'bold 8px sans-serif'; ctx.fillText('POWER LEVEL', x, y - 15);
    ctx.restore();
  }
}
{ const _d = drawNew; drawNew = function (cx, cy, t) { _d(cx, cy, t); drawPk3(cx, cy, t); drawScouter(cx, cy, t); }; }
{ const _d = draw; draw = function () { _d(); drawFreeze(); }; }

/* ---------- Level 2 pacing (Phase E) ---------- */
// Frieza waits until Captain Ginyu is down (+25 s), so the two big fights don't pile up.
// He never arrives more than 90 s after his scheduled time.
{ const _u = update; update = function (dt) {
    const r = _u(dt);
    if (S.mode == 'play' && S.stage == 2 && S.sch) { const q = S.sch.find(q => q.k == 'fr1');
      if (q && !q.d) { if (q.t0 === undefined) q.t0 = q.t;
        const gin = S.en.some(e => e.k == 'gin' && !e.dead), seen = S.sch.some(s => s.k == 'gin' && s.d);
        if (gin) { q.gd = 0; q.t = Math.min(q.t0 + 90, Math.max(q.t0, S.t + 25)); }
        else if (seen && !q.gd) { q.gd = 1; q.t = Math.min(q.t0 + 90, Math.max(q.t0, S.t + 25)); } } }
    return r;
  }; }

// Piccolo was the slowest boss-killer in bot tests: a little more punch.
{ const _h = hitE; hitE = function (e, d) { if (S.hero == 'pic') d *= 1.2; return _h(e, d); }; }

/* ---------- settings rows for the new toggles ---------- */
{ const _st = settings; settings = function (back) {
    _st(back); const c = ov.querySelector('.card'); if (!c) return; const g = c.querySelector('.sgrid') || c;
    const row = (lbl, val, fn) => `<button class="srow" onclick="${fn}"><span>${lbl}</span><b>${val}</b></button>`;
    let h = '';
    if (HAS('limitbreak')) h += row('Limit Break', SET.lb ? 'On' : 'Off', "togSet('lb')");
    if (HAS('scouter')) h += row('Scouter readout', SET.scouter ? 'On' : 'Off', "togSet('scouter')");
    if (h) g.insertAdjacentHTML('beforeend', h);
  }; }

/* ---------- main menu: challenges + Vegeta's outfit ---------- */
function vegSkin() { P.skin = P.skin || {}; P.skin.vegeta = P.skin.vegeta == 'saiyan' ? '' : 'saiyan'; saveProg(); menu(); }
{ const _m = menu; menu = function () {
    _m(); if (!PROG_READY || V2.welcome3) return;
    const c = ov.querySelector('.in') || ov.querySelector('.card'); if (!c) return;
    if (HERO == 'vegeta' && HAS('alt:vegeta')) { const d = c.querySelector('.hdesc');
      if (d) d.insertAdjacentHTML('afterend', `<button class="vskin" onclick="vegSkin()">🎨 Armour: <b>${vegAlt() ? 'Saiyan Saga' : 'Namek'}</b></button>`); }
    if (HAS('ginyu')) {
      const lv = [...c.querySelectorAll('button.go, .lock')].filter(b => /start\(/.test(b.getAttribute('onclick') || '') || b.classList.contains('lock')).pop();
      const z = Object.keys(GC).filter(k => P.gc && P.gc[k]).reduce((a, k) => a + GC[k].z, 0);
      const html = `<div class="gcw"><div class="gct">Ginyu Force Challenges${z ? ` <b>+${Math.round(z * 100)}% Zeni</b>` : ''}</div><div class="gcrow">` +
        Object.entries(GC).map(([k, g]) => `<button class="gch${P.gc && P.gc[k] ? ' on' : ''}" onclick="gcTog('${k}')" title="${g.d}">${g.e} ${g.n}<small>${g.d} · +${Math.round(g.z * 100)}%</small></button>`).join('') + '</div></div>';
      if (lv) lv.insertAdjacentHTML('afterend', html); else c.insertAdjacentHTML('beforeend', html);
    }
  }; }
// end card: show the challenge bonus
{ const _e = endCard; endCard = function (win) {
    V2.gcZ = 0; const r = _e(win);
    if (V2.gcZ && S.mode != 'play' && S.mode != 'kk') {
      const add = ` <small class="gcz">(challenges +${V2.gcZ})</small>`;
      if (RV) RV.back = RV.back.replace(/(\+\d+ Zeni <small>[^<]*<\/small>)/, '$1' + add);   // end card is parked behind the unlock reveal
      else { const z = [...ov.querySelectorAll('.card p')].find(p => /Zeni/.test(p.textContent)); if (z) z.insertAdjacentHTML('beforeend', add); }
    }
    return r;
  }; }

{ const st = document.createElement('style'); st.textContent = `
.upw{position:relative}.upw>.up{width:100%}.sealsp{float:right;width:58px;height:20px}
.card .sealb{position:absolute;top:6px;right:6px;width:auto;min-height:0;margin:0;padding:3px 8px;font-size:11px;border-radius:12px;background:rgba(20,10,30,.75);border:1px solid #c9a0ff;color:#e6d0ff;box-shadow:none}
.card .sealb:active{background:#6a2aa8}
.sealn{font-size:12px;color:#d9c2ff;text-align:center;margin:-4px 0 6px}
.lbc h2 small{font-size:14px;opacity:.75}
.card .up.lb{display:flex;align-items:center;gap:10px;border-color:#ff9be0}.lbi{font-size:28px;width:40px;text-align:center}
.gcw{margin:4px 0 2px}.gct{font-size:12px;text-align:center;color:#e9d4ff;margin-bottom:3px}.gct b{color:#ffd27a}
.gcrow{display:flex;gap:5px}.card .gch{flex:1 1 0;min-width:0;margin:0;padding:5px 4px;font-size:11.5px;line-height:1.2;text-align:center;background:rgba(40,20,60,.55);border:1px solid rgba(201,160,255,.45);color:#efe2ff}
.card .gch small{display:block;font-size:9.5px;opacity:.75;margin-top:2px}
.card .gch.on{background:linear-gradient(#8a3cd8,#5a1ea0);border-color:#e7c8ff;color:#fff;box-shadow:0 0 10px rgba(180,110,255,.55)}
.card .vskin{display:block;margin:0 auto 6px;width:auto;padding:4px 12px;font-size:12px;text-align:center}
.gcz{color:#d9b8ff}
/* phones: the 13-row shop fits without scrolling */
@media (max-width:420px){
 .shop .dhead{margin-bottom:4px}.shop .sgrid{gap:4px}
 .shop .sup{padding:4px 6px;gap:1px}.shop .sup .sn{font-size:11.5px;padding-right:20px}
 .shop .sup .sd{font-size:9.5px;line-height:1.15;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;padding-right:4px}
 .shop .sup .sbar{height:4px;margin-top:1px}.shop .sup .sf{font-size:10px}
 .shop .sref{width:19px;height:19px;font-size:14px;line-height:17px;top:3px;right:3px}
}
`; document.head.appendChild(st); }
