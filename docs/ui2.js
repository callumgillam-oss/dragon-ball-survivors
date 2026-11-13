/* =====================================================================
   DRAGON BALL SURVIVORS 2.0 — UI PACK
   Joystick lock + quality-of-life settings, DBZ-styled panels/HUD/icons,
   compact shop, Time Chamber notices, and a longer Level 1 soundtrack.
   ===================================================================== */
'use strict';

/* ---------- settings defaults ---------- */
for (const [k, v] of Object.entries({ joy: 'fixed', nums: true, flash: 'full', hand: 'right', autoUlt: false })) if (SET[k] === undefined) SET[k] = v;
const FLM = () => SET.flash == 'reduced' ? .35 : 1;
function applyHand() { document.documentElement.classList.toggle('lefty', SET.hand == 'left'); }
applyHand();

/* ---------- joystick: lock the base where your thumb first lands ---------- */
// The original stick drags its base along when your thumb passes the edge. In "Fixed" mode the base stays put,
// so sliding your thumb back always reverses direction exactly like a physical stick.
cv.addEventListener('pointerdown', () => { if (joy) { joy.ax = joy.ox; joy.ay = joy.oy; } });
addEventListener('pointermove', e => { if (SET.joy == 'fixed' && joy && e.pointerId == joy.id && joy.ax !== undefined) { joy.ox = joy.ax; joy.oy = joy.ay; } });

/* ---------- settings screen (two-column, fits without scrolling) ---------- */
settings = function (back) {
  V2.back = back || V2.back || 'menu';
  const row = (lbl, val, fn, hint) => `<button class="srow" onclick="${fn}"><span>${lbl}</span><b>${val}</b>${hint ? `<small>${hint}</small>` : ''}</button>`;
  show(`<div class="card dbz sett"><div class="dhead"><span class="db4"></span><h2>Settings</h2></div>
  <div class="sgrid">
  ${row('Graphics', GFX_NAMES[GFX], 'cycleGfx()', GFX == 'auto' ? 'Sharp, lowers itself only if needed' : GFX == 'low' ? 'Fastest, for older devices' : '')}
  ${row('Joystick', SET.joy == 'fixed' ? 'Fixed' : 'Follow', "togOpt('joy','fixed','follow')", SET.joy == 'fixed' ? 'Base stays where you touch' : 'Base follows your thumb')}
  ${row('Ki Burst', SET.autoUlt ? 'Auto' : 'Manual', "togSet('autoUlt')", SET.autoUlt ? 'Fires as soon as it is ready' : 'Tap ⚡ to fire')}
  ${row('Buttons', SET.hand == 'left' ? 'Left side' : 'Right side', "togOpt('hand','right','left')", 'For left-handed play')}
  ${row('Music', SET.music ? 'On' : 'Off', "togSet('music')")}
  ${row('Sound effects', SET.sfx ? 'On' : 'Off', "togSet('sfx')")}
  ${row('Damage numbers', SET.nums ? 'On' : 'Off', "togSet('nums')")}
  ${row('Screen shake', SET.shake ? 'On' : 'Off', "togSet('shake')")}
  ${row('Flashing effects', SET.flash == 'full' ? 'Full' : 'Reduced', "togOpt('flash','full','reduced')", 'Reduced is easier on the eyes')}
  ${row('Character art', SET.art == 'classic' ? 'Classic' : '2.0', 'togArt()')}
  </div>
  <button class="go" onclick="settingsBack()">Back</button>
  <p class="how">Dragon Ball Survivors ${V2.ver}</p></div>`);
};
function togOpt(k, a, b) { SET[k] = SET[k] == a ? b : a; saveSet(); applyHand(); settings(); }
function togArt() { SET.art = SET.art == 'classic' ? 'v2' : 'classic'; saveSet(); applyArt(SET.art); settings(); }

/* ---------- gameplay QoL hooks ---------- */
{ const _dn = drawNums; drawNums = function (cx, cy) { if (SET.nums) _dn(cx, cy); }; }
{ const _u = update; update = function (dt) {
    const had = !!S.shr; _u(dt);
    if (!had && S.shr && S.mode == 'play') { ban('A TIME CHAMBER HAS APPEARED!'); sfxPlay('chest'); }
    if (SET.autoUlt && S.mode == 'play' && (S.ult || 0) >= 100) ultFire();
    if (SET.flash == 'reduced') S.flash = Math.min(S.flash, .3);
  }; }

/* ---------- compact shop (grid, no scrolling on phones) ---------- */
shop = function () {
  const cells = Object.keys(UPG).map(k => {
    const [n, d, mx] = UPG[k], l = META[k], c = ucost(k, l), mxd = l >= mx, poor = !mxd && META.zeni < c;
    return `<button class="sup${mxd ? ' max' : ''}${poor ? ' poor' : ''}" ${mxd ? 'disabled' : `onclick="buyU('${k}')"`}>
      <span class="sn">${n}</span><span class="sd">${d}</span>
      <span class="sbar"><i style="width:${Math.round(l / mx * 100)}%"></i></span>
      <span class="sf"><span>Lv ${l}/${mx}</span><b>${mxd ? 'MAX' : 'Ƶ ' + c}</b></span></button>`;
  }).join('');
  show(`<div class="card dbz shop"><div class="dhead"><span class="db4"></span><h2>Capsule Corp</h2><div class="zeni">Ƶ ${META.zeni}</div></div>
    <div class="sgrid">${cells}</div><button class="go" onclick="menu()">Back</button></div>`);
};

/* ---------- HUD: scouter-style bars, framed portrait, capsule ability slots ---------- */
function hexPath(x, y, w, h, s) { ctx.beginPath(); ctx.moveTo(x + s, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - s, y + h); ctx.lineTo(x, y + h); ctx.closePath(); }
function scouterBar(x, y, w, h, k, c1, c2, segs) {
  k = Math.max(0, Math.min(1, k)); const s = h * .6;
  hexPath(x, y, w, h, s); ctx.fillStyle = 'rgba(12,6,2,.78)'; ctx.fill();
  if (k > 0) { ctx.save(); hexPath(x, y, w, h, s); ctx.clip(); const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(x, y, w * k, h);
    ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(x, y + 1, w * k, h * .32); ctx.restore(); }
  if (segs) { ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 1; i < segs; i++) { const sx = x + w * i / segs; ctx.moveTo(sx + s * .5, y + 1); ctx.lineTo(sx - s * .2, y + h - 1); } ctx.stroke(); }
  hexPath(x, y, w, h, s); ctx.strokeStyle = '#ffcf6a'; ctx.lineWidth = 1.6; ctx.stroke();
}
function starBall(x, y, r, n) { const g = ctx.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r); g.addColorStop(0, '#fff2b0'); g.addColorStop(.5, '#ffad1f'); g.addColorStop(1, '#d9640a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.strokeStyle = '#7a2a05'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = '#e8261a'; ctx.font = 'bold ' + Math.round(r * 1.1) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('★', x, y + r * .05); ctx.textBaseline = 'alphabetic'; }
hud = function () {
  const p = S.p, m = 12 + SI, y = ST + 10, F = '"Trebuchet MS",sans-serif', IM = 'Impact,Haettenschweiler,"HelveticaNeue-CondensedBlack","Avenir Next Condensed","Roboto Condensed",sans-serif-condensed,"Arial Narrow","Arial Black",sans-serif';
  const pw = Math.min(330, W * .58), hpK = p.hp / p.max;
  // left panel: portrait in a Dragon Ball ring + HP / power bars
  ctx.save();
  ctx.beginPath(); ctx.moveTo(m, y); ctx.lineTo(m + pw + 18, y); ctx.lineTo(m + pw, y + 58); ctx.lineTo(m, y + 58); ctx.closePath();
  const pg = ctx.createLinearGradient(0, y, 0, y + 58); pg.addColorStop(0, 'rgba(48,22,6,.82)'); pg.addColorStop(1, 'rgba(20,8,2,.82)'); ctx.fillStyle = pg; ctx.fill();
  ctx.strokeStyle = '#ff9a1f'; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = 'rgba(255,220,140,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(m + 3, y + 3); ctx.lineTo(m + pw + 10, y + 3); ctx.stroke();
  const cx = m + 29, cy = y + 29, R = 24;
  const rg = ctx.createRadialGradient(cx - 6, cy - 8, 2, cx, cy, R + 4); rg.addColorStop(0, '#ffe08a'); rg.addColorStop(1, '#d9640a'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, cy, R + 4, 0, 7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = S.ssj ? '#a6791a' : S.hero == 'pic' ? '#3e6e30' : S.hero == 'gohan' ? '#5a3290' : '#2f5fc4'; ctx.fill(); ctx.clip();
  ctx.drawImage(SHEET(), 19, HC + 8, 170, 170, cx - R + 2, cy - R + 2, R * 2, R * 2); ctx.restore();
  ctx.strokeStyle = '#7a2a05'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R + 4, 0, 7); ctx.stroke();
  // level badge (four-star ball)
  starBall(cx + R - 2, cy + R - 2, 10, 4); ctx.fillStyle = '#fff'; ctx.font = 'bold 9px ' + F; ctx.textAlign = 'center'; ctx.lineWidth = 2.5; ctx.strokeStyle = '#5a1a02'; ctx.strokeText(p.lv, cx + R - 2, cy + R + 1); ctx.fillText(p.lv, cx + R - 2, cy + R + 1);
  const bx = m + 62, bw = pw - 62;
  const hc = hpK > .5 ? ['#7dff8a', '#1fa83a'] : hpK > .25 ? ['#ffe27a', '#e09a12'] : ['#ff7a5a', '#c61f14'];
  scouterBar(bx, y + 9, bw, 15, hpK, hc[0], hc[1], 10);
  scouterBar(bx, y + 30, bw - 8, 8, p.xp / p.nx, '#9fe8ff', '#2a8cff', 0);
  ctx.textAlign = 'left'; ctx.font = 'bold 11px ' + F; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.75)';
  const hpT = Math.ceil(p.hp) + ' / ' + p.max; ctx.strokeText(hpT, bx + 12, y + 21); ctx.fillStyle = '#fff'; ctx.fillText(hpT, bx + 12, y + 21);
  ctx.font = 'bold 10px ' + F; const lt = (S.ssj ? FORM().trim() : 'POWER') + ' · LV ' + p.lv; ctx.fillStyle = '#ffd27a'; ctx.fillText(lt, bx + 2, y + 52);
  // right panel: timer + KO, dragon ball tracker underneath
  const rw = 126, rx = W - m - rw;
  ctx.beginPath(); ctx.moveTo(rx - 14, y); ctx.lineTo(rx + rw, y); ctx.lineTo(rx + rw, y + 40); ctx.lineTo(rx, y + 40); ctx.closePath(); ctx.fillStyle = 'rgba(20,8,2,.8)'; ctx.fill(); ctx.strokeStyle = '#ff9a1f'; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = 'right'; ctx.font = '20px ' + IM; ctx.fillStyle = '#fff4e0'; ctx.fillText(fmt(S.t), rx + rw - 8, y + 22);
  ctx.font = 'bold 10px ' + F; ctx.fillStyle = '#ffd27a'; ctx.fillText('KO ' + S.kills, rx + rw - 8, y + 35);
  ctx.textAlign = 'left'; ctx.font = 'bold 9px ' + F; ctx.fillStyle = 'rgba(255,210,122,.8)'; ctx.fillText('STAGE ' + (S.stage || 1), rx + 2, y + 15);
  ctx.restore();
  // boss bar
  const bs = S.en.find(e => e.boss);
  if (bs) { const bw2 = Math.min(W * .7, 460), bx2 = (W - bw2) / 2, by2 = y + 76;
    ctx.textAlign = 'center'; ctx.font = '17px ' + IM; ctx.lineWidth = 4; ctx.strokeStyle = '#3a0a02'; ctx.lineJoin = 'round'; const nm = TYPES[bs.k].n.toUpperCase();
    ctx.strokeText(nm, W / 2, by2 - 4); ctx.fillStyle = '#ffd27a'; ctx.fillText(nm, W / 2, by2 - 4);
    scouterBar(bx2, by2, bw2, 13, bs.hp / bs.max, '#e9a8ff', '#7a2bd0', 0);
    const marks = bs.k == 'veg' ? [.6, .25] : bs.k == 'nap' ? [.5] : [];
    ctx.strokeStyle = '#fff4e0'; ctx.lineWidth = 2; for (const mk of marks) { const mx2 = bx2 + bw2 * mk; ctx.beginPath(); ctx.moveTo(mx2, by2 - 2); ctx.lineTo(mx2 - 3, by2 + 15); ctx.stroke(); } }
  // ability slots: capsule orbs with level pips
  let ix = m, iy = H - 48 - SB;
  for (const g of ['w', 'ps']) for (const k in S[g]) { const l = S[g][k]; if (!l) continue; const ev = S.evo[k], x0 = ix + 17, y0 = iy + 17;
    const og = ctx.createRadialGradient(x0 - 5, y0 - 6, 2, x0, y0, 18); og.addColorStop(0, g == 'w' ? '#5a3214' : '#1c3a5a'); og.addColorStop(1, 'rgba(14,6,2,.9)');
    ctx.fillStyle = og; ctx.beginPath(); ctx.arc(x0, y0, 16, 0, 7); ctx.fill();
    if (ev) { LT(); gl('or', x0, y0, 24, .55 + .2 * Math.sin(S.t * 5)); NM(); }
    ctx.strokeStyle = ev ? '#ffe27a' : g == 'w' ? '#ff9a1f' : '#6ac8ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x0, y0, 16, 0, 7); ctx.stroke();
    ctx.drawImage(icn(k), x0 - 12, y0 - 12, 24, 24);
    if (ev) { ctx.fillStyle = '#ffe27a'; ctx.font = 'bold 11px ' + F; ctx.textAlign = 'center'; ctx.fillText('★', x0, y0 + 26); }
    else for (let i = 0; i < 5; i++) { ctx.fillStyle = i < l ? '#ffd27a' : 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.arc(x0 - 8 + i * 4, y0 + 21, 1.5, 0, 7); ctx.fill(); }
    ix += 38; if (ix > W - 100 - SI) { ix = m; iy -= 46; } }
  // first-seconds tip
  if (S.t < 9 && S.mode == 'play') { ctx.textAlign = 'center'; ctx.font = 'bold 15px ' + F; ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(30,10,0,.8)'; const t1 = 'Drag anywhere to move. Attacks are automatic.'; ctx.strokeText(t1, W / 2, H * .78); ctx.fillStyle = 'rgba(255,244,224,.95)'; ctx.fillText(t1, W / 2, H * .78); }
  // banner
  if (S.ban && S.ban.txt) { ctx.textAlign = 'center'; let fs = 30; const FF = ' Impact,Haettenschweiler,"HelveticaNeue-CondensedBlack","Avenir Next Condensed","Roboto Condensed",sans-serif-condensed,"Arial Narrow","Arial Black",sans-serif'; ctx.font = fs + 'px' + FF; const mw = ctx.measureText(S.ban.txt).width; if (mw > W - 28) { fs = Math.max(14, Math.floor(fs * (W - 28) / mw)); ctx.font = fs + 'px' + FF; }
    const by = H * .3, al = Math.min(1, S.ban.t * 1.5); ctx.globalAlpha = al;
    const bgg = ctx.createLinearGradient(0, by - fs - 14, 0, by + 18); bgg.addColorStop(0, 'rgba(20,6,0,0)'); bgg.addColorStop(.28, 'rgba(20,6,0,.7)'); bgg.addColorStop(.72, 'rgba(20,6,0,.7)'); bgg.addColorStop(1, 'rgba(20,6,0,0)'); ctx.fillStyle = bgg; ctx.fillRect(0, by - fs - 14, W, fs + 32);
    ctx.fillStyle = '#ff9a1f'; ctx.fillRect(W * .15, by + 9, W * .7, 2);
    const g = ctx.createLinearGradient(0, by - fs, 0, by + 4); g.addColorStop(0, '#fff6b8'); g.addColorStop(.55, '#ffc23a'); g.addColorStop(1, '#ff7a1a');
    ctx.strokeStyle = '#5a0e08'; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.strokeText(S.ban.txt, W / 2, by); ctx.strokeStyle = '#d83a14'; ctx.lineWidth = 3; ctx.strokeText(S.ban.txt, W / 2, by); ctx.fillStyle = g; ctx.fillText(S.ban.txt, W / 2, by); ctx.globalAlpha = 1; }
};
// Dragon Ball tracker sits under the timer panel
hud2 = function () { const m = 12 + SI, x0 = W - m - 7 * 17, y = ST + 10 + 46; for (let i = 0; i < 7; i++) { ctx.globalAlpha = i < S.dbGot ? 1 : .3; ctx.drawImage(BALLS[i], x0 + i * 17, y, 16, 16); } ctx.globalAlpha = 1; };
// Bigger off-screen pointer for the Time Chamber, with distance
function drawChamberPointer() {
  const s = S.shr; if (!s || S.mode != 'play') return; const p = S.p, x = s.x - p.x + W / 2, y = s.y - p.y + H / 2;
  if (x > -40 && y > -40 && x < W + 40 && y < H + 40) return;
  const a = Math.atan2(y - H / 2, x - W / 2), ex = Math.max(78, Math.min(W - 78, W / 2 + Math.cos(a) * 1000)), ey = Math.max(ST + 130, Math.min(H - 70, H / 2 + Math.sin(a) * 1000)), d = Math.round(Math.hypot(s.x - p.x, s.y - p.y) / 10);
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); LT(); gl('cy', ex, ey, 26, .5 + .2 * Math.sin(S.t * 6)); NM();
  ctx.translate(ex, ey); ctx.save(); ctx.rotate(a); ctx.fillStyle = '#bff0ff'; ctx.strokeStyle = '#0a3a5a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-8, -12); ctx.lineTo(-3, 0); ctx.lineTo(-8, 12); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.font = 'bold 10px "Trebuchet MS",sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.strokeText('TIME CHAMBER ' + d + 'm', 0, 26); ctx.fillStyle = '#bff0ff'; ctx.fillText('TIME CHAMBER ' + d + 'm', 0, 26);
  ctx.restore();
}
{ const _d = draw; draw = function () { _d(); drawChamberPointer(); }; }

/* ---------- Dragon Balls: notice + pointer (same treatment as Time Chambers) ---------- */
{ const _sb = spawnBall; spawnBall = function () { const n0 = S.dbN; _sb(); if (S.dbN > n0 && S.mode == 'play') { ban(S.dbN == 1 ? 'A DRAGON BALL APPEARS!' : 'DRAGON BALL ' + S.dbN + ' HAS APPEARED!'); sfxPlay('ball'); } }; }
function edgePointer(wx, wy, label, glow, fill, icon) {
  const p = S.p, x = wx - p.x + W / 2, y = wy - p.y + H / 2;
  if (x > -40 && y > -40 && x < W + 40 && y < H + 40) return;
  const a = Math.atan2(y - H / 2, x - W / 2), ex = Math.max(78, Math.min(W - 78, W / 2 + Math.cos(a) * 1000)), ey = Math.max(ST + 130, Math.min(H - 70, H / 2 + Math.sin(a) * 1000)), d = Math.round(Math.hypot(wx - p.x, wy - p.y) / 10);
  LT(); gl(glow, ex, ey, 26, .5 + .2 * Math.sin(S.t * 6)); NM();
  ctx.save(); ctx.translate(ex, ey); ctx.save(); ctx.rotate(a); ctx.fillStyle = fill; ctx.strokeStyle = 'rgba(30,10,0,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-8, -12); ctx.lineTo(-3, 0); ctx.lineTo(-8, 12); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  if (icon) ctx.drawImage(icon, -9, -9, 18, 18);
  ctx.font = 'bold 10px "Trebuchet MS",sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.strokeText(label + ' ' + d + 'm', 0, 26); ctx.fillStyle = fill; ctx.fillText(label + ' ' + d + 'm', 0, 26);
  ctx.restore();
}
function drawBallPointers() {
  if (S.mode != 'play' || !S.balls) return; ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (const b of S.balls) edgePointer(b.x, b.y, S.set2 == 1 ? 'NAMEKIAN BALL' : 'DRAGON BALL', 'or', '#ffd27a', BALLS[b.n - 1]);
  ctx.restore();
}
{ const _d = draw; draw = function () { _d(); drawBallPointers(); }; }

/* ---------- Shenron summoning cutscene ---------- */
// Plays when the 7th Dragon Ball is collected, before the wish choices:
// storm rolls in -> the seven balls circle you and pulse -> a pillar of light tears into the sky -> flash -> Shenron rises.
const SHC_T = 5.2, SHC_RISE = 3.0;
{ const _sw = startWish; startWish = function () {
    if (V2.noCut || V2.shc) return _sw();
    S.wishPend = 0; S.mode = 'shcut'; S.ban = null; V2.shc = { t0: performance.now() / 1000 }; show('');
    MUS.want('boss'); sfxPlay('summon');
  }; }
function shcEnd() { const t0 = V2.shc.t0; V2.shc = { done: 1 }; S.mode = 'play'; S.wishPend = 1; startWish(); S.shT = t0 + SHC_RISE; V2.shc = null; }
function drawShenronCut() {
  if (S.mode != 'shcut' || !V2.shc || V2.shc.done) return;
  const now = performance.now() / 1000, t = now - V2.shc.t0, px = W / 2, py = H / 2, FL = FLM();
  if (t >= SHC_T) { shcEnd(); return; }
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  // storm sky darkening
  const dk = Math.min(1, t / 1.2); ctx.fillStyle = 'rgba(4,14,30,' + .78 * dk + ')'; ctx.fillRect(0, 0, W, H);
  const bh = H * .1 * Math.min(1, t * 2); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
  // the seven balls fly out and orbit, glowing harder as they spin faster
  const fly = Math.min(1, t / .9), ease = 1 - Math.pow(1 - fly, 3), spin = t * (1.2 + Math.max(0, t - 1) * 2.2), R = 78 * ease, lift = Math.min(1, Math.max(0, (t - 1.6) / 1)) * 26;
  const pulse = .55 + .45 * Math.sin(t * (6 + t * 4));
  LT(); gl('or', px, py - lift, 140 * ease, .35 + .3 * pulse * Math.min(1, t)); NM();
  for (let i = 0; i < 7; i++) { const a = spin + i / 7 * 6.283, bx = px + Math.cos(a) * R, by = py - lift + Math.sin(a) * R * .55;
    const bs = S.set2 == 1 ? 19 : 13; LT(); gl('or', bx, by, bs * 1.7 + 10 * pulse, .5 + .4 * pulse); NM(); ctx.drawImage(BALLS[i], bx - bs, by - bs, bs * 2, bs * 2); }
  // pillar of light into the sky
  if (t > 1.9) { const k = Math.min(1, (t - 1.9) / .35), w = (26 + 18 * Math.sin(now * 40)) * k;
    LT(); const g = ctx.createLinearGradient(px - w, 0, px + w, 0); g.addColorStop(0, 'rgba(255,220,120,0)'); g.addColorStop(.35, 'rgba(255,220,120,.7)'); g.addColorStop(.5, 'rgba(255,255,240,1)'); g.addColorStop(.65, 'rgba(255,220,120,.7)'); g.addColorStop(1, 'rgba(255,220,120,0)');
    ctx.fillStyle = g; ctx.fillRect(px - w, 0, w * 2, py - lift); gl('wh', px, py - lift, 60 * k, .9); NM();
    if (((now * 10) | 0) % 4 == 0) { ctx.strokeStyle = 'rgba(210,240,255,.9)'; ctx.lineWidth = 2.2; let lx = Math.random() * W, ly = 0; ctx.beginPath(); ctx.moveTo(lx, ly); for (let j = 0; j < 8; j++) { lx += (Math.random() - .5) * 60; ly += H * .08; ctx.lineTo(lx, ly); } ctx.stroke(); } }
  // white flash, then Shenron rises (reusing the game's own Shenron art)
  if (t > SHC_RISE) { S.shT = V2.shc.t0 + SHC_RISE; drawShenron(); }
  if (t > SHC_RISE - .35 && t < SHC_RISE + .5) { const f = 1 - Math.abs(t - SHC_RISE) / .5; ctx.fillStyle = 'rgba(255,255,240,' + Math.max(0, f) * FL + ')'; ctx.fillRect(0, 0, W, H); }
  // titles
  const title = (txt, y, fs, a, c1, c2) => { ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.font = '900 ' + fs + 'px Impact,Haettenschweiler,"HelveticaNeue-CondensedBlack","Avenir Next Condensed","Roboto Condensed",sans-serif-condensed,"Arial Narrow","Arial Black",sans-serif'; ctx.lineWidth = fs * .2; ctx.strokeStyle = '#0a2a14'; ctx.strokeText(txt, px, y); const g = ctx.createLinearGradient(0, y - fs, 0, y); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillText(txt, px, y); ctx.globalAlpha = 1; };
  if (t > .9 && t < 2.9) title(S.set2 == 1 ? 'ARISE, PORUNGA!' : 'ARISE, ETERNAL DRAGON!', H * .2, Math.min(34, W * .07), Math.min(1, (t - .9) / .3) * Math.min(1, (2.9 - t) / .3), '#fff6c0', '#ffb21f');
  if (t > 3.5) title(S.set2 == 1 ? 'PORUNGA' : 'SHENRON', H * .86, Math.min(64, W * .14), Math.min(1, (t - 3.5) / .4), '#d8ffe0', '#3ad06a');
  ctx.restore();
  if (t > 2 && t < 3.2) kick(6);
}
{ const _d = draw; draw = function () { _d(); drawShenronCut(); }; }
{ const _s = start; start = function (a) { V2.shc = null; return _s(a); }; }
// summoning sound: rumble that swells, chime arpeggio, thunder crack, dragon roar
{ const _sp = sfxPlay; sfxPlay = function (k) {
    if (k != 'summon') return _sp(k);
    if (muted || !SET.sfx || !AC || AC.state != 'running' || !bus()) return; const n = AC.currentTime;
    noise(3, .14, 'lowpass', 120, 400); tone('sine', 45, 70, 3, .25);
    [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone('triangle', f, f, .5, .04, n + .2 + i * .12));
    noise(.8, .35, 'highpass', 800, 200, n + 1.9); tone('sawtooth', 90, 40, .6, .1, n + 1.9);
    tone('sawtooth', 70, 45, 1.6, .12, n + 3.0); tone('square', 55, 40, 1.6, .06, n + 3.0); noise(1.6, .12, 'lowpass', 900, 150, n + 3.0);
  }; }

/* ---------- reduced flashing: soften the full-screen white-outs added in 2.0 ---------- */
{ const _dv = drawVictory; drawVictory = function () { if (FLM() < 1 && V2.inF > 0) V2.inF = Math.min(V2.inF, .15); _dv(); }; }

/* ---------- Level 1 soundtrack: a 44-bar, ~75s loop with verse, chorus, variation and a half-time bridge ---------- */
{
  const H = -2, R = -1, E = Array(16).fill(R);
  const intro = [[0, 1, E], [8, 0, E], [10, 0, E], [7, 0, [R, R, R, R, R, R, R, R, 12, H, 14, H, 15, H, 17, H]]];
  const A = [
    [0, 1, [12, H, 12, 15, 17, H, 15, H, 12, H, 10, H, 12, H, H, R]], [8, 0, [8, H, 12, H, 15, H, 12, H, 10, H, 8, H, 7, H, H, R]],
    [10, 0, [10, H, 14, H, 17, H, 14, H, 15, H, 14, H, 10, H, 7, H]], [7, 1, [7, H, H, H, 10, H, 12, H, 14, H, H, H, R, R, R, R]],
    [0, 1, [12, H, 12, 15, 17, H, 15, H, 19, H, 17, H, 15, H, H, R]], [8, 0, [17, H, 15, H, 12, H, 15, H, 17, H, 20, H, 19, H, H, R]],
    [10, 0, [17, H, 15, H, 14, H, 10, H, 14, H, 15, H, 17, H, 19, H]], [7, 0, [19, H, H, H, 14, H, 11, H, 14, H, H, H, R, R, R, R]]];
  const A2 = A.map((b, i) => i == 0 ? [0, 1, [12, 15, 17, 15, 12, H, 15, H, 17, H, 19, H, 17, H, 15, H]] : i == 4 ? [0, 1, [12, H, 15, H, 17, H, 19, H, 20, H, 19, H, 17, H, 15, H]] : b);
  const B = [
    [8, 0, [24, H, H, R, 24, H, 22, H, 24, H, 27, H, H, H, R, R]], [10, 0, [26, H, H, R, 26, H, 24, H, 22, H, 19, H, H, H, R, R]],
    [0, 1, [24, H, H, R, 24, H, 27, H, 29, H, 27, H, 24, H, 22, H]], [0, 1, [24, H, H, H, H, H, H, H, R, R, 19, H, 22, H, 24, H]],
    [8, 0, [29, H, H, R, 29, H, 27, H, 24, H, 27, H, H, H, R, R]], [10, 0, [26, H, H, R, 26, H, 29, H, 31, H, 29, H, H, H, R, R]],
    [7, 0, [31, H, H, H, 26, H, 23, H, 26, H, H, H, 23, H, 19, H]], [7, 0, [19, H, H, H, H, H, H, H, R, R, R, R, R, R, R, R]]];
  const BR = [
    [5, 1, [17, H, H, H, H, H, H, H, 15, H, H, H, H, H, H, H]], [5, 1, [12, H, H, H, H, H, H, H, R, R, R, R, R, R, R, R]],
    [0, 1, [12, H, H, H, H, H, H, H, 15, H, H, H, H, H, H, H]], [0, 1, [17, H, H, H, H, H, H, H, R, R, R, R, R, R, R, R]],
    [5, 1, [17, H, H, H, H, H, H, H, 20, H, H, H, H, H, H, H]], [5, 1, [22, H, H, H, H, H, H, H, 20, H, H, H, 17, H, H, H]],
    [7, 0, [19, H, H, H, H, H, H, H, 23, H, H, H, H, H, H, H]], [7, 0, [26, H, H, H, H, H, H, H, R, R, R, R, 23, H, 26, H]]];
  const bars = [], tr = [], sec = [];
  const add = (L, s, t) => { for (const b of L) { bars.push(b); sec.push(s); tr.push(t || 0); } };
  add(intro, 'i'); add(A, 'v'); add(B, 'c'); add(A2, 'v'); add(BR, 'b'); add(B, 'c', 2);
  SONGS.stage = { gen: 1, bpm: 142, root: 57, vol: .5, bars, tr, sec };
}
// half-time bridge support for the song engine: lighter drums, sustained chords
{ const _g = genStep; genStep = function (sg, i, t, st, D) {
    const nb = sg.bars.length, bi = Math.floor(i / 16) % nb;
    if (sg.sec[bi] != 'b') return _g(sg, i, t, st, D);
    const c = i % 16, bar = sg.bars[bi], k = sg.root + sg.tr[bi], r = bar[0], third = bar[1] ? 3 : 4;
    if (c == 0 || c == 10) tone('sine', 160, 40, .22, .55, t, D);
    if (c == 8) { noise(.2, .24, 'bandpass', 1800, 700, t, D, .7); tone('triangle', 190, 110, .1, .1, t, D); }
    if (c % 4 == 2) noise(.04, .05, 'highpass', 7500, 0, t, D);
    if (c == 0) { for (const n of [0, third, 7]) { tone('triangle', NOTE(k + r + n), 0, st * 15, .045, t, D); tone('sawtooth', NOTE(k - 12 + r + n), 0, st * 15, .018, t, D); }
      tone('triangle', NOTE(k - 24 + r), 0, st * 15, .25, t, D); }
    const L = bar[2][c]; if (L >= 0) { let h = 1; while (c + h < 16 && bar[2][c + h] == -2) h++; const f = NOTE(k + L); tone('sawtooth', f, 0, st * (h + .35), .05, t, D); tone('sine', f * 2, 0, st * (h + .35), .03, t, D); }
  }; }

/* ---------- DBZ-themed panel styling ---------- */
document.head.insertAdjacentHTML('beforeend', `<style>
:root{--db-or:#ff9a1f;--db-gold:#ffd27a;--db-red:#e8261a;--db-ink:#1a0a02}
.card{position:relative;background:radial-gradient(120% 80% at 50% 0%,#5a3010 0%,#3a1e0a 45%,#24120a 100%)!important;border:3px solid var(--db-or)!important;
 box-shadow:0 0 0 2px #3a0e02,0 0 0 5px #b8560c,0 0 24px rgba(255,140,30,.35),0 14px 40px rgba(0,0,0,.7)!important;border-radius:16px!important}
.card::before,.card::after{content:'★';position:absolute;top:-13px;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--db-red);
 background:radial-gradient(circle at 35% 30%,#fff2b0 0%,#ffad1f 45%,#d9640a 100%);border:1.5px solid #7a2a05;box-shadow:0 2px 6px rgba(0,0,0,.5);z-index:2;pointer-events:none}
.card::before{left:-10px}.card::after{right:-10px}
.card h2{font-family:Impact,Haettenschweiler,"HelveticaNeue-CondensedBlack","Avenir Next Condensed","Roboto Condensed",sans-serif-condensed,"Arial Narrow","Arial Black",sans-serif;letter-spacing:1.5px;font-size:24px;color:#ffd23a;background:linear-gradient(#fff6b8,#ffb21f 60%,#ff7a1a);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
 filter:drop-shadow(2px 2px 0 #5a0e08) drop-shadow(-1px -1px 0 #5a0e08);text-transform:uppercase}
.card button{background:linear-gradient(180deg,#4a2a12 0%,#2e1608 100%);border:2px solid #c86a14;border-radius:10px;box-shadow:inset 0 1px 0 rgba(255,220,150,.25),0 2px 0 rgba(0,0,0,.4);transition:transform .08s,box-shadow .15s}
.card button:hover,.card button:focus-visible{background:linear-gradient(180deg,#6a3a14,#3e1e0a);box-shadow:inset 0 1px 0 rgba(255,220,150,.35),0 0 12px rgba(255,150,40,.5)}
.card button:active{transform:translateY(1px)}
.card button.go{background:linear-gradient(180deg,#ff5a2a 0%,#d4260e 55%,#a8180a 100%);border:2px solid #ffe08a;font-family:Impact,Haettenschweiler,"HelveticaNeue-CondensedBlack","Avenir Next Condensed","Roboto Condensed",sans-serif-condensed,"Arial Narrow","Arial Black",sans-serif;letter-spacing:1px;text-shadow:2px 2px 0 #5a0e08;box-shadow:inset 0 2px 0 rgba(255,255,255,.3),0 3px 0 #5a0e08,0 0 14px rgba(255,90,30,.4)}
.card button.go small{font-family:"Trebuchet MS",sans-serif;letter-spacing:0;text-shadow:none}
.up .ic,.ic{border-radius:50%!important;border:2px solid var(--db-or)!important;background:radial-gradient(circle at 35% 30%,#5a3214,#1a0a02)!important;box-shadow:0 0 0 2px #3a1206,0 0 10px rgba(255,150,40,.35);padding:2px;box-sizing:border-box}
.dhead{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 0 8px}.dhead h2{margin:0}
.db4{width:22px;height:22px;border-radius:50%;flex:none;background:radial-gradient(circle at 35% 30%,#fff2b0,#ffad1f 45%,#d9640a);border:1.5px solid #7a2a05;position:relative}
.db4::after{content:'★';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#e8261a;font-size:11px}
.zeni{margin-left:auto;font:900 16px Impact,Haettenschweiler,"HelveticaNeue-CondensedBlack","Avenir Next Condensed","Roboto Condensed",sans-serif-condensed,"Arial Narrow","Arial Black",sans-serif;color:#ffe27a;background:rgba(0,0,0,.35);border:1.5px solid #c86a14;border-radius:20px;padding:3px 12px}
.shop,.sett{max-width:760px!important}
.sgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;margin:0 0 4px}
.card .sup{margin:0;padding:7px 8px;display:flex;flex-direction:column;gap:2px;text-align:left;min-height:0}
.sup .sn{font-weight:bold;font-size:13px;color:#fff4e0;line-height:1.15}.sup .sd{font-size:10.5px;opacity:.78;line-height:1.2}
.sup .sbar{height:5px;border-radius:3px;background:rgba(0,0,0,.45);overflow:hidden;margin-top:3px}.sup .sbar i{display:block;height:100%;background:linear-gradient(90deg,#ffe27a,#ff9a1f)}
.sup .sf{display:flex;justify-content:space-between;font-size:11px;color:#ffd27a}.sup .sf b{color:#7dff8a}
.sup.poor{opacity:.55}.sup.poor .sf b{color:#ff9a8a}.sup.max{border-color:#ffe27a!important;background:linear-gradient(180deg,#6a4a0c,#3a2606)!important}.sup.max .sf b{color:#ffe27a}
.card .srow{margin:0;padding:7px 9px;display:flex;flex-wrap:wrap;align-items:baseline;gap:0 6px;text-align:left}
.srow span{font-size:13px}.srow b{margin-left:auto;color:#ffd27a;font-size:13px}.srow small{flex-basis:100%;font-size:10px;opacity:.7}
.lefty #pz,.lefty #mu,.lefty #ub{left:calc(12px + env(safe-area-inset-left,0px))!important;right:auto!important}
@media (orientation:landscape) and (max-height:560px){
 .sgrid{grid-template-columns:repeat(auto-fill,minmax(165px,1fr))}
 .card .sup{padding:5px 7px}.sup .sd{font-size:10px}
 .card:not(.title)>.sgrid{flex-basis:100%}
 .card:not(.title)>.dhead{flex-basis:100%}
 .shop>button.go,.sett>button.go{flex:1 1 100%!important;margin-top:6px}
}
@media (max-width:420px){.sgrid{grid-template-columns:1fr 1fr}.card .sup{padding:6px}.sup .sn{font-size:12px}.sup .sd{font-size:10px}}
</style>`);
if (S && S.mode == 'menu' && !/Welcome back/.test(ov.textContent)) menu();
