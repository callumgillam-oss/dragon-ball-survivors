/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — OPTIONS & READABILITY PASS (2026-11-14)
   1) Settings → Targeting: beam / aimed attacks can target the strongest enemy or fire the way you face.
   2) Reduced flashing now also tames additive light (Solar Flare rays, Spirit Bomb glow, big explosions).
   3) Off-screen pointers (Dragon Balls, Time Chamber, chests) stand out over crowds, plus a compass round the hero.
   4) Potara earrings show which attacks fuse together (power-up cards and HUD slots).
   This is the LAST script: it sets DBS_READY, which lets the game loop start (see index.html).
   ===================================================================== */
'use strict';

/* ---------- 1) targeting ---------- */
// Attacks that fire at one aimed target. Homing / area / random attacks are left alone.
const TGT8 = [
  ['kame', 'nearest enemy'], ['galick', 'thickest crowd'], ['masenko', 'nearest enemy'], ['sbc', 'nearest enemy'],
  ['tri', 'thickest crowd'], ['sword', 'nearest enemy'], ['fkame', 'nearest enemy'], ['fskame', 'nearest enemy']];
const TGTN8 = { def: 'Normal', hp: 'Strongest', face: 'Facing' };
const tgtMode = k => (SET.tgt && SET.tgt[k]) || 'def';
function tgtHP(r) {   // the enemy with the most health within reach (bosses included)
  const p = S.p; let b = null;
  for (const e of S.en) { if (e.dead || !onScr(e) || Math.hypot(e.x - p.x, e.y - p.y) > r + e.r) continue; if (!b || e.hp > b.hp) b = e; }
  return b;
}
function faceVec() { const x = S.fx8 || 0, y = S.fy8 || 0; return x || y ? [x, y] : [S.p.face || 1, 0]; }
// near()-style list → list; angle → angle; spot → spot. Facing still needs an enemy in reach, so nothing fires at empty air.
function aimT(k, ts, r) {
  const m = tgtMode(k); if (m == 'def' || !ts || !ts.length) return ts;
  if (m == 'hp') { const b = tgtHP(r); return b ? [b] : ts; }
  const [x, y] = faceVec(); return [{ x: S.p.x + x * 100, y: S.p.y + y * 100, hp: 1, max: 1, r: 0, fake: 1 }];
}
function aimA(k, a, r) {
  if (a === null || a === undefined) return a; const m = tgtMode(k);
  if (m == 'hp') { const b = tgtHP(r); return b ? Math.atan2(b.y - S.p.y, b.x - S.p.x) : a; }
  if (m == 'face') { const [x, y] = faceVec(); return Math.atan2(y, x); }
  return a;
}
function aimP(k, c, r) {
  if (!c) return c; const m = tgtMode(k);
  if (m == 'hp') return tgtHP(r) || c;
  if (m == 'face') { const [x, y] = faceVec(); return { x: S.p.x + x * 200, y: S.p.y + y * 200, fake: 1 }; }
  return c;
}
// remember the last direction you moved in (standing still keeps it)
{ const _u = update; update = function (dt) { const r = _u(dt); const x = S.mvx || 0, y = S.mvy || 0, l = Math.hypot(x, y); if (l > .2) { S.fx8 = x / l; S.fy8 = y / l; } return r; }; }

const tgtHas = k => { const H_ = typeof HAS == 'function' ? HAS : RU; return FUSE[k] ? H_(FUSE[k].u) : (k == 'kame' || H_('w:' + k)); };
const tgtName = k => FUSE[k] ? FUSE[k].n : (BASE && BASE[k]) || (INFO[k] && INFO[k][0]) || k;
function tgt8() {
  if (!SET.tgtW) {
    show(`<div class="card dbz"><h2>Targeting</h2><p>These settings change how some attacks pick their target.</p>
      <p><b>Heads up:</b> the game is balanced around the normal targeting, so changing it isn't the intended way to play.
      But it's your game, so play how you want!</p>
      <button class="go" onclick="SET.tgtW=1;saveSet();tgt8()">Got it</button><button onclick="settings()">Back</button></div>`);
    return;
  }
  const rows = TGT8.filter(([k]) => tgtHas(k)).map(([k, d]) => { const m = tgtMode(k);
    return `<button class="srow${m != 'def' ? ' tg8c' : ''}" onclick="tgt8c('${k}')"><span>${tgtName(k)}</span><b>${TGTN8[m]}</b><small>${m == 'def' ? 'Aims at the ' + d : m == 'hp' ? 'Aims at the enemy with the most health' : 'Fires the way you are facing'}</small></button>`; }).join('');
  show(`<div class="card dbz tgt8"><h2>Targeting</h2><p><small>Tap an attack to switch between <b>Normal</b>, <b>Strongest</b> and <b>Facing</b>.</small></p>
    <div class="sgrid">${rows}</div>
    <button onclick="tgt8d()">↺ Default (reset all)</button><button class="go" onclick="settings()">Done</button></div>`);
}
function tgt8c(k) { const o = ['def', 'hp', 'face'], m = tgtMode(k); SET.tgt = SET.tgt || {}; SET.tgt[k] = o[(o.indexOf(m) + 1) % 3]; if (SET.tgt[k] == 'def') delete SET.tgt[k]; saveSet(); tgt8(); }
function tgt8d() { SET.tgt = {}; saveSet(); tgt8(); }
{ const _st = settings; settings = function (back) {
    _st(back); const c = ov.querySelector('.card'); if (!c) return; const g = c.querySelector('.sgrid') || c;
    const n = SET.tgt ? Object.keys(SET.tgt).length : 0, row = `<button class="srow" onclick="tgt8()"><span>Targeting</span><b>${n ? 'Custom' : 'Default'}</b><small>How beam attacks pick targets</small></button>`;
    const rst = g.querySelector('.rst7'); if (rst) rst.insertAdjacentHTML('beforebegin', row); else g.insertAdjacentHTML('beforeend', row);
  }; }

/* ---------- 2) reduced flashing: additive light ---------- */
// Additive ('lighter') glows stack: a few overlapping Spirit Bomb or explosion glows add up to a white/blue wash,
// and Solar Flare's sunburst covered the screen. With Flashing set to Reduced, light blends normally (no stacking)
// at about half strength, and Solar Flare shows a soft ring instead of rays.
{ const D = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'globalCompositeOperation');
  if (D && D.set) Object.defineProperty(ctx, 'globalCompositeOperation', { configurable: true,
    get() { return D.get.call(this); },
    set(v) { D.set.call(this, v === 'lighter' && SET.flash == 'reduced' ? 'source-over' : v); } }); }
{ const _g = gl; gl = function (k, x, y, r, a = 1) { return _g(k, x, y, r, SET.flash == 'reduced' ? a * .45 : a); }; }
if (typeof softGlow == 'function') { const _s = softGlow; softGlow = function (rgb, x, y, r, a) { return _s(rgb, x, y, r, SET.flash == 'reduced' ? a * .45 : a); }; }
{ const _f = drawFlashFx; drawFlashFx = function (cx, cy, t) {
    if (SET.flash != 'reduced' || !V2.ff) return _f(cx, cy, t);
    const rays = V2.ff.filter(f => f.k == 'rays'); if (!rays.length) return _f(cx, cy, t);
    V2.ff = V2.ff.filter(f => f.k != 'rays'); try { _f(cx, cy, t); } finally { V2.ff.push(...rays); }
    for (const f of rays) { const k = f.t / f.T; ctx.strokeStyle = 'rgba(255,250,220,' + .45 * (1 - k) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W / 2, H / 2, 40 + Math.max(W, H) * .35 * k, 0, 7); ctx.stroke(); }
  }; }

/* ---------- 3) pointers that stand out over a crowd ---------- */
// A dark badge with a coloured rim, a bigger arrow, the icon, and the distance in a pill, plus a slow pulse ring.
edgePointer = function (wx, wy, label, glow, fill, icon) {
  const p = S.p, x = wx - p.x + W / 2, y = wy - p.y + H / 2;
  if (x > -40 && y > -40 && x < W + 40 && y < H + 40) return;
  const a = Math.atan2(y - H / 2, x - W / 2), ex = Math.max(70, Math.min(W - 70, W / 2 + Math.cos(a) * 1000)), btnSide = SET.hand == 'left' ? ex < 140 : ex > W - 140,
    slotSide = SET.hand == 'left' ? ex > W * .45 : ex < W * .55,   // keep clear of the attack slots along the bottom
    ey = Math.max(ST + 120, Math.min(btnSide ? H - 250 - SB : slotSide ? H - 120 - SB : H - 70, H / 2 + Math.sin(a) * 1000)), d = Math.round(Math.hypot(wx - p.x, wy - p.y) / 10), u = (S.t * .8) % 1;
  ctx.save(); ctx.translate(ex, ey);
  ctx.strokeStyle = fill; ctx.globalAlpha = .7 * (1 - u); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 21 + 14 * u, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(14,7,2,.86)'; ctx.beginPath(); ctx.arc(0, 0, 21, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
  ctx.save(); ctx.rotate(a); ctx.fillStyle = fill; ctx.strokeStyle = 'rgba(14,7,2,.95)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(24, -11); ctx.lineTo(24, 11); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
  if (icon) ctx.drawImage(icon, -13, -13, 26, 26); else { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.fill(); }
  const tx = label + ' ' + d + 'm'; ctx.font = 'bold 11px "Trebuchet MS",sans-serif'; const tw = ctx.measureText(tx).width + 14;
  ctx.fillStyle = 'rgba(14,7,2,.86)'; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(-tw / 2, 25, tw, 17, 8.5); else ctx.rect(-tw / 2, 25, tw, 17); ctx.fill(); ctx.strokeStyle = fill; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = fill; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(tx, 0, 34); ctx.textBaseline = 'alphabetic';
  ctx.restore();
};
drawChamberPointer = function () {
  const s = S.shr; if (!s || S.mode != 'play') return;
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); edgePointer(s.x, s.y, 'TIME CHAMBER', 'cy', '#9fe8ff', null); ctx.restore();
};
// compass: small coloured chevrons circling the hero, pointing at each off-screen Dragon Ball / Time Chamber
function compass8() {
  if (S.mode != 'play') return; const p = S.p, T = [];
  if (S.balls) for (const b of S.balls) T.push([b.x, b.y, '#ffc040']);
  if (S.shr) T.push([S.shr.x, S.shr.y, '#9fe8ff']);
  if (!T.length) return;
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (const [wx, wy, c] of T) { const x = wx - p.x + W / 2, y = wy - p.y + H / 2; if (x > -40 && y > -40 && x < W + 40 && y < H + 40) continue;
    const a = Math.atan2(wy - p.y, wx - p.x), R = 46 + 3 * Math.sin(S.t * 6);
    ctx.save(); ctx.translate(W / 2 + Math.cos(a) * R, H / 2 + Math.sin(a) * R); ctx.rotate(a);
    ctx.fillStyle = c; ctx.strokeStyle = 'rgba(14,7,2,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-5, -7); ctx.lineTo(-2, 0); ctx.lineTo(-5, 7); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore(); }
  ctx.restore();
}
{ const _d = draw; draw = function () { _d(); try { compass8(); } catch (e) { } }; }

/* ---------- 4) Potara earrings: which attacks fuse ---------- */
// Every fusion has its own earring colour. Two attacks wearing the same colour fuse together once both are evolved.
const POT8 = { fkame: '#ffc400', fskame: '#47c8ff', mlight: '#6fe04a', tks: '#e8eef6', dsb: '#a77bff', kwf: '#ff4b3a', sgp: '#ff8ad8', htc: '#2fe0c0' };
const fusOf8 = k => Object.keys(FUSE).filter(id => (FUSE[id].a == k || FUSE[id].b == k) && RU(FUSE[id].u));
const potSVG = c => `<svg class="pot8" viewBox="0 0 12 18" width="11" height="16" aria-hidden="true"><circle cx="6" cy="4" r="2.8" fill="none" stroke="#ffd34a" stroke-width="1.6"/><circle cx="6" cy="12.3" r="4.6" fill="${c}" stroke="#2a1404" stroke-width=".9"/><circle cx="4.6" cy="10.8" r="1.3" fill="rgba(255,255,255,.7)"/></svg>`;
{ const _eh = evoHint; evoHint = function (g, k) {
    let h = _eh(g, k); if (g != 'w') return h;
    for (const id of fusOf8(k)) { const f = FUSE[id], o = f.a == k ? f.b : f.a; if (!unl7('w', o)) continue;
      h += `<br><small class="fus8">${potSVG(POT8[id])} Fuses with ${nm7(o)} → ${f.n} <i>(both evolved)</i></small>${S.w[o] > 0 ? ' <small class="own7b">✓ You have it</small>' : ''}`; }
    return h;
  }; }
// HUD: an earring on each slot whose fusion partner you also hold; it glows when the pair is ready to fuse
function pot8Slot(k, x0, y0) {
  const ids = fusOf8(k).filter(id => { const f = FUSE[id], o = f.a == k ? f.b : f.a; return S.w[o] > 0 && !(S.w[id] > 0); }); if (!ids.length) return;
  const ready = typeof fuseReady == 'function' ? fuseReady() : [];
  ids.slice(0, 2).forEach((id, i) => { const ex = x0 + 13 - i * 13, ey = y0 - 17, c = POT8[id], on = ready.includes(id), br = on ? 6 + .8 * Math.sin(S.t * 8) : 5.2;
    if (on) { LT(); gl('wh', ex, ey + 4, 15 + 3 * Math.sin(S.t * 6), .8); NM(); }
    ctx.strokeStyle = '#2a1404'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.arc(ex, ey - 4, 3.2, 0, 7); ctx.stroke();
    ctx.strokeStyle = '#ffd34a'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(ex, ey - 4, 3.2, 0, 7); ctx.stroke();
    ctx.fillStyle = c; ctx.strokeStyle = '#2a1404'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(ex, ey + 4.5, br, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(ex - 1.8, ey + 2.8, 1.5, 0, 7); ctx.fill(); });
}
document.head.insertAdjacentHTML('beforeend', `<style>
.fus8{color:#ffe7a8}.fus8 i{opacity:.7;font-style:normal}.pot8{vertical-align:-3px;margin-right:1px}
.tgt8 .sgrid{max-height:52vh;overflow:auto}.srow.tg8c b{color:#7fe0ff}
</style>`);

/* ---------- 5) no flicker when a screen redraws itself ---------- */
// Settings toggles (and Targeting rows) rebuild the whole card, and the card's pop-in animation restarted from
// opacity 0 on every click: a quick black flash. When the new card has the same title as the one on screen, it
// replaces it in place with no entrance animation. Moving to a different screen still animates.
{ const _sh = show; show = function (h) {
    const old = ov.style.display != 'none' && ov.querySelector('.card'), t0 = old && old.querySelector('h2') ? old.querySelector('h2').textContent : null;
    const r = _sh(h);
    const c = ov.querySelector('.card'), t1 = c && c.querySelector('h2') ? c.querySelector('h2').textContent : null;
    if (c && t0 !== null && t0 === t1) { c.style.animation = 'none'; for (const u of c.querySelectorAll('button.up')) u.style.animation = 'none'; }
    return r;
  }; }

// every script has loaded: the built-in game loop may start (see the boot watchdog in index.html)
window.DBS_READY = 1;
