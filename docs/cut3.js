/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — KING KAI'S TRAINING (EXPANSION_PLAN.md §7)
   Replaces Zenkai Revival. Once per run, on death: a halo, a sprint down
   Snake Way, a training montage on King Kai's tiny planet, then you're back
   with full HP, a level-up and the nearby enemies blown away.
   Tap / Space to skip once you've seen it.
   ===================================================================== */
'use strict';

const KK_T = 8.2;          // total length (s)
const KK = { fall: .9, road: 3.4, planet: 7.0 };   // phase end times
let KKc = null;           // { t, last }

{ const _e = endCard; endCard = function (win) {
    if (!win && (META.revive || 0) > 0 && !S.revived && S.p.hp <= 0) { kkStart(); return; }
    return _e(win);
  }; }
function kkStart() {
  S.revived = 1; S.p.hp = 0; S.mode = 'kk'; show(''); S.ban = null; S.flash = 0;
  KKc = { t: 0, last: performance.now() };
  if (V2.kkFast) { kkEnd(); return; }   // balance bot: no cutscene
  try { sfxPlay('kkhalo'); } catch (e) { }
}
function kkSkip() { if (S.mode == 'kk' && KKc && P.kkSeen && KKc.t < KK.planet) { KKc.t = KK.planet; try { sfxPlay('lvl'); } catch (e) { } } }
cv.addEventListener('pointerdown', kkSkip);
addEventListener('keydown', e => { if (S.mode == 'kk' && (e.key == ' ' || e.key == 'Enter' || e.key == 'Escape')) { e.preventDefault(); kkSkip(); } });
function kkEnd() {
  KKc = null; P.kkSeen = 1; saveProg();
  const p = S.p; S.mode = 'play'; p.hp = p.max; S.pend += 1; S.inv = 3; S.hurt = 0;
  for (const e of S.en) { if (e.dead || e.boss) continue; const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (d < 240) hitE(e, e.hp + 1); else if (d < 520) shove(e, p.x, p.y, 220); }
  boom(p.x, p.y, 200, '#ffe27a'); impact(p.x, p.y, 260, 'or', .6); aFlash(1);
  ban('REVIVED!');
}
{ const _d = draw; draw = function () {
    _d(); if (S.mode != 'kk' || !KKc) return;
    const now = performance.now(); KKc.t += Math.min(.05, Math.max(0, (now - KKc.last) / 1000)); KKc.last = now;
    if (KKc.t >= KK_T) { kkEnd(); return; }
    const ph = KKc.t < KK.fall ? 0 : KKc.t < KK.road ? 1 : KKc.t < KK.planet ? 2 : 3;
    // one cue per beat of the scene: the run, each training shot, the return
    const D3 = (KK.planet - KK.road) / 3, beat = ph < 2 ? ph : ph == 3 ? 5 : 2 + Math.min(2, Math.floor((KKc.t - KK.road) / D3));
    if (beat != KKc.ph) { KKc.ph = beat; if (beat) try { sfxPlay(['', 'kkrun', 'kkgrav', 'kkchase', 'kkpower', 'revive'][beat]); } catch (e) { } }
    ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); drawKK(KKc.t); ctx.restore();
  }; }

/* ---------- drawing ---------- */
// one frame of the hero's sprite sheet. row: 0 attack, 1 idle, 2 run, 3 walk. (x,y) = feet.
function kkHero(x, y, row, u, s, flip, halo, al) {
  const sh = sheetOf(S.hero, 0), n = FRN[row], f = Math.floor((u % 1 + 1) % 1 * n) % n;
  ctx.save(); if (al != null) ctx.globalAlpha = al; ctx.translate(x, y - 21 * s); ctx.scale(flip ? -s : s, s);
  ctx.drawImage(sh, f * HC, row * HC, HC, HC, -HOX / HC * HD, HDY, HD, HD); ctx.restore();
  if (halo) { const hx = x + (flip ? -3 : 3) * s, hy = y - 78 * s + Math.sin(KKc.t * 4) * 2 * s;   // a halo: glow, gold ring, bright top edge
    LT(); gl('or', hx, hy, 17 * s, .5); NM(); ctx.save(); ctx.lineWidth = 3.4 * s; ctx.strokeStyle = '#c98a14'; ctx.beginPath(); ctx.ellipse(hx, hy, 11 * s, 3.6 * s, 0, 0, 7); ctx.stroke();
    ctx.lineWidth = 2 * s; ctx.strokeStyle = '#fff3a0'; ctx.beginPath(); ctx.ellipse(hx, hy - .5 * s, 11 * s, 3.6 * s, 0, 0, 7); ctx.stroke(); ctx.restore(); }
}
function kkTitle(txt, sub, a, y) {
  const fs = Math.min(44, W * .085); ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, a)); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.font = '900 ' + fs + 'px Impact,Haettenschweiler,"HelveticaNeue-CondensedBlack","Avenir Next Condensed","Roboto Condensed",sans-serif-condensed,"Arial Narrow","Arial Black",sans-serif'; ctx.lineWidth = fs * .2; ctx.strokeStyle = '#4a1a00'; ctx.strokeText(txt, W / 2, y);
  const g = ctx.createLinearGradient(0, y - fs, 0, y); g.addColorStop(0, '#fffbd0'); g.addColorStop(1, '#ffb21f'); ctx.fillStyle = g; ctx.fillText(txt, W / 2, y);
  if (sub) { ctx.font = 'bold ' + Math.round(fs * .38) + 'px "Trebuchet MS",sans-serif'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(60,20,0,.8)'; ctx.strokeText(sub, W / 2, y + fs * .6); ctx.fillStyle = '#fff'; ctx.fillText(sub, W / 2, y + fs * .6); }
  ctx.restore();
}
// a puffy Other World cloud: shaded underside first, lit top over it
function kkCloud(x, y, sz, top, under) {
  const P = [[0, 0, 1], [.95, -.28, .8], [-.95, .08, .72], [1.75, .12, .56], [-1.7, .26, .5]];
  ctx.fillStyle = under; ctx.beginPath(); for (const [dx, dy, r] of P) { ctx.moveTo(x + dx * sz + r * sz, y + dy * sz + sz * .2); ctx.arc(x + dx * sz, y + dy * sz + sz * .2, r * sz, 0, 7); } ctx.fill();
  ctx.fillStyle = top; ctx.beginPath(); for (const [dx, dy, r] of P) { ctx.moveTo(x + dx * sz + r * sz, y + dy * sz); ctx.arc(x + dx * sz, y + dy * sz, r * sz, 0, 7); } ctx.fill();
}
// Other World sky: peach to gold, sun haze, three drifting cloud layers
function kkSky(t, scroll) {
  let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f39a5e'); g.addColorStop(.4, '#fbc878'); g.addColorStop(.75, '#ffe6a8'); g.addColorStop(1, '#f6c066'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  g = ctx.createRadialGradient(W * .25, H * .22, 0, W * .25, H * .22, Math.max(W, H) * .5); g.addColorStop(0, 'rgba(255,255,230,.75)'); g.addColorStop(.3, 'rgba(255,240,190,.3)'); g.addColorStop(1, 'rgba(255,230,170,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let L = 0; L < 3; L++) { const sp = (L + 1) * .22, yb = H * (.2 + L * .17), sz = 20 + L * 13, gap = sz * 6, P = W + gap * 2;
    for (let i = 0; i < Math.ceil(P / gap) + 1; i++) { const x = (((i * gap + ihash(i + L * 7) * gap * .6 - scroll * sp) % P) + P) % P - gap, y = yb + (ihash(i * 3 + L) - .5) * H * .1;
      kkCloud(x, y, sz * (.8 + ihash(i + L) * .5), L == 2 ? 'rgba(255,246,214,.95)' : L == 1 ? 'rgba(255,238,196,.8)' : 'rgba(255,232,190,.6)', L == 2 ? 'rgba(240,176,104,.75)' : 'rgba(242,186,120,.5)'); } }
}
// the sea of clouds Snake Way hangs over; `front` draws the nearer, faster band
function kkSea(scroll, y0, front) {
  const sz = (front ? 46 : 34) * Math.max(.8, Math.min(1.4, W / 600)), gap = sz * 1.5, off = (scroll * (front ? 1.25 : .6)) % gap;
  ctx.fillStyle = front ? 'rgba(244,188,112,.95)' : 'rgba(246,200,130,.9)'; ctx.beginPath(); for (let x = -gap - off; x < W + gap; x += gap) { const y = y0 + Math.sin((x + scroll * (front ? 1.25 : .6)) * .013) * sz * .25 + sz * .22; ctx.moveTo(x + sz, y); ctx.arc(x, y, sz, 0, 7); } ctx.fill();
  ctx.fillStyle = front ? '#fff0c4' : 'rgba(255,240,204,.95)'; ctx.beginPath(); for (let x = -gap - off; x < W + gap; x += gap) { const y = y0 + Math.sin((x + scroll * (front ? 1.25 : .6)) * .013) * sz * .25; ctx.moveTo(x + sz, y); ctx.arc(x, y, sz, 0, 7); } ctx.rect(0, y0 + sz * .5, W, H); ctx.fill();
}
// King Kai's planet: grass ball with a ring road, his house, car and tree. Drawn round (0,0); the caller rotates it.
function kkPlanet(R, s, detail) {
  let g = ctx.createRadialGradient(-R * .38, -R * .45, R * .08, 0, 0, R * 1.02); g.addColorStop(0, '#a6ee84'); g.addColorStop(.55, '#58b84e'); g.addColorStop(1, '#236e34');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.clip();
  ctx.strokeStyle = '#e8d49a'; ctx.lineWidth = R * .13; ctx.beginPath(); ctx.ellipse(0, R * .04, R * 1.02, R * .3, -.12, 0, 7); ctx.stroke();   // the ring road
  ctx.strokeStyle = 'rgba(120,96,50,.5)'; ctx.lineWidth = 1.2; ctx.setLineDash([R * .06, R * .06]); ctx.beginPath(); ctx.ellipse(0, R * .04, R * 1.02, R * .3, -.12, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(16,60,30,.3)'; ctx.beginPath(); ctx.arc(R * .3, R * .42, R * 1.02, 0, 7); ctx.arc(0, 0, R * 1.05, 0, 7, true); ctx.fill('evenodd');
  ctx.restore();
  ctx.strokeStyle = '#17451f'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.stroke();
  ctx.strokeStyle = '#2f8a3a'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i < 46; i++) { const a = i / 46 * 6.283 + (i % 3) * .03, l = (3 + (i * 7 % 5)) * s; ctx.moveTo(Math.cos(a) * R, Math.sin(a) * R); ctx.lineTo(Math.cos(a + .03) * (R + l), Math.sin(a + .03) * (R + l)); } ctx.stroke();
  if (!detail) return;
  ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 1.8; ctx.lineJoin = 'round';
  // house: white dome, red roof cap, chimney, door and window
  ctx.save(); ctx.rotate(-.84); ctx.translate(0, -R + 1);
  ctx.fillStyle = '#b84a34'; ctx.fillRect(9 * s, -34 * s, 6 * s, 12 * s); ctx.strokeRect(9 * s, -34 * s, 6 * s, 12 * s);
  ctx.fillStyle = '#f7f0de'; ctx.beginPath(); ctx.arc(0, 0, 24 * s, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#d8402a'; ctx.beginPath(); ctx.arc(0, -13 * s, 15 * s, Math.PI * 1.08, -Math.PI * .08); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#6a4020'; ctx.beginPath(); ctx.moveTo(-5 * s, 0); ctx.lineTo(-5 * s, -9 * s); ctx.arc(0, -9 * s, 5 * s, Math.PI, 0); ctx.lineTo(5 * s, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#9adcf0'; ctx.beginPath(); ctx.arc(13 * s, -7 * s, 4 * s, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-9 * s, -14 * s, 6 * s, 3 * s, -.6, 0, 7); ctx.fill();
  ctx.restore();
  // King Kai's red car
  ctx.save(); ctx.rotate(-1.36); ctx.translate(0, -R);
  ctx.fillStyle = '#d83a2a'; ctx.beginPath(); ctx.moveTo(-13 * s, -3 * s); ctx.lineTo(-12 * s, -8 * s); ctx.lineTo(-6 * s, -9 * s); ctx.lineTo(-3 * s, -14 * s); ctx.lineTo(6 * s, -14 * s); ctx.lineTo(9 * s, -9 * s); ctx.lineTo(13 * s, -8 * s); ctx.lineTo(13 * s, -3 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#bfe6f4'; ctx.fillRect(-2 * s, -12.5 * s, 7 * s, 4 * s); ctx.fillStyle = '#222'; for (const q of [-7, 7]) { ctx.beginPath(); ctx.arc(q * s, -2.5 * s, 3.2 * s, 0, 7); ctx.fill(); }
  ctx.restore();
  // tree
  ctx.save(); ctx.rotate(.8); ctx.translate(0, -R); ctx.fillStyle = '#7a4a22'; ctx.fillRect(-3 * s, -28 * s, 6 * s, 29 * s); ctx.strokeRect(-3 * s, -28 * s, 6 * s, 29 * s);
  ctx.fillStyle = '#2f9a3a'; ctx.beginPath(); ctx.arc(0, -36 * s, 15 * s, 0, 7); ctx.arc(-11 * s, -29 * s, 10 * s, 0, 7); ctx.arc(11 * s, -30 * s, 10 * s, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -36 * s, 15 * s, 3.6, 5.9); ctx.stroke(); ctx.fillStyle = 'rgba(190,255,160,.4)'; ctx.beginPath(); ctx.arc(-5 * s, -41 * s, 6 * s, 0, 7); ctx.fill(); ctx.restore();
}
function kkLetterbox(a) { const b = Math.round(H * .09 * a); if (b <= 0) return; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, b); ctx.fillRect(0, H - b, W, b); }
function kkPips(n, i, y) { for (let q = 0; q < n; q++) { const x = W / 2 + (q - (n - 1) / 2) * 16; ctx.fillStyle = q <= i ? '#ffd23a' : 'rgba(74,26,0,.45)'; ctx.strokeStyle = '#4a1a00'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 4.2, 0, 7); ctx.fill(); ctx.stroke(); } }
function drawKK(t) {
  const cxm = W / 2, cym = H / 2, s = Math.max(.75, Math.min(1.5, Math.min(W, H) / 420));
  // 0) defeat: the world dims, a light opens above, the hero rises under a halo
  if (t < KK.fall) { const k = t / KK.fall, rise = ieo(Math.max(0, (k - .3) / .7)) * 46 * s;
    ctx.fillStyle = 'rgba(10,6,20,' + Math.min(.66, k * 1.4) + ')'; ctx.fillRect(0, 0, W, H);
    LT(); const g = ctx.createLinearGradient(0, 0, 0, cym + 40); g.addColorStop(0, 'rgba(255,240,180,' + .55 * k + ')'); g.addColorStop(1, 'rgba(255,240,180,0)'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(cxm - 26 * s, 0); ctx.lineTo(cxm + 26 * s, 0); ctx.lineTo(cxm + 74 * s, cym + 40); ctx.lineTo(cxm - 74 * s, cym + 40); ctx.fill();
    for (let i = 0; i < 12; i++) { const u = (t * .9 + i / 12) % 1; gl('or', cxm + Math.sin(i * 2.4) * 46 * s * (1 - u * .4), cym + 30 - u * 200 * s, 5 * s, k * (1 - u)); } NM();
    kkHero(cxm, cym + 20 - rise, 1, t * .9, 1.15, S.p.face < 0, k > .25);
    if (k > .55) { ctx.fillStyle = 'rgba(255,230,168,' + ((k - .55) / .45) + ')'; ctx.fillRect(0, 0, W, H); }
    return; }
  // 1) Snake Way: the great serpent road over a sea of clouds, King Kai's planet far ahead
  if (t < KK.road) { const u = t - KK.fall, D = KK.road - KK.fall, scroll = u * 560, lb = Math.min(1, u * 4);
    kkSky(t, scroll);
    // King Kai's planet, small and far, growing as we close in
    { const pk = u / D, pr = (9 + 30 * pk * pk) * s, ppx = W * .82, ppy = H * .22; LT(); gl('wh', ppx, ppy, pr * 2.6, .35); NM(); ctx.save(); ctx.translate(ppx, ppy); kkPlanet(pr, pr / 90, false);
      ctx.fillStyle = '#f7f0de'; ctx.beginPath(); ctx.arc(-pr * .5, -pr * .82, pr * .22, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#2f9a3a'; ctx.beginPath(); ctx.arc(pr * .6, -pr * .98, pr * .2, 0, 7); ctx.fill(); ctx.restore(); }
    const base = H * .6, roadY = x => base + Math.sin((x + scroll) * .0058) * H * .085 + Math.sin((x + scroll) * .0163) * H * .022, dY = x => (roadY(x + 4) - roadY(x - 4)) / 8;
    kkSea(scroll, base + H * .09, false);
    // the serpent's body: outline, back, lit ridge, pale belly with plates, fins along the spine, scales
    ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
    const path = off => { ctx.beginPath(); for (let x = -30; x <= W + 30; x += 10) { const y = roadY(x) + off; x < -25 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } };
    ctx.fillStyle = '#c2551a'; ctx.strokeStyle = '#5a2408'; ctx.lineWidth = 1.6;
    for (let i = -1; i < W / 44 + 2; i++) { const x = i * 44 - scroll % 44, y = roadY(x) - 21 * s, a = Math.atan(dY(x)); ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-9 * s, 2); ctx.lineTo(3 * s, -15 * s); ctx.lineTo(10 * s, 2); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
    path(0); ctx.strokeStyle = '#5a2408'; ctx.lineWidth = 50 * s; ctx.stroke();
    path(0); ctx.strokeStyle = '#e88a2a'; ctx.lineWidth = 44 * s; ctx.stroke();
    path(13 * s); ctx.strokeStyle = '#f7d896'; ctx.lineWidth = 16 * s; ctx.stroke();
    path(-12 * s); ctx.strokeStyle = '#f9b656'; ctx.lineWidth = 9 * s; ctx.stroke();
    path(-17 * s); ctx.strokeStyle = 'rgba(255,240,200,.55)'; ctx.lineWidth = 2.5 * s; ctx.stroke();
    ctx.strokeStyle = 'rgba(150,96,40,.6)'; ctx.lineWidth = 1.4; ctx.beginPath(); for (let i = -1; i < W / 17 + 2; i++) { const x = i * 17 - scroll % 17, y = roadY(x); ctx.moveTo(x, y + 6 * s); ctx.lineTo(x - 2, y + 20 * s); } ctx.stroke();   // belly plates
    ctx.strokeStyle = 'rgba(122,58,16,.5)'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = -1; i < W / 26 + 2; i++) { const x = i * 26 - scroll % 26, y = roadY(x) - 3 * s; ctx.moveTo(x - 6, y - 7 * s); ctx.quadraticCurveTo(x + 4, y, x - 6, y + 7 * s); } ctx.stroke();   // scales
    // the serpent's head at the start of the road slides away behind us
    { const hx0 = Math.min(W * .36, 300 * s) - scroll; if (hx0 > -150 * s) { const hy0 = roadY(Math.max(-20, hx0)) - 4 * s, r = 46 * s; ctx.save(); ctx.translate(hx0, hy0); ctx.strokeStyle = '#5a2408'; ctx.lineWidth = 3;
        ctx.fillStyle = '#e88a2a'; ctx.beginPath(); ctx.moveTo(r * .9, -r * .55); ctx.quadraticCurveTo(-r * .2, -r * 1.25, -r * 1.5, -r * .35); ctx.lineTo(-r * 1.75, r * .05); ctx.lineTo(-r * 1.2, r * .12); ctx.lineTo(-r * 1.5, r * .5); ctx.quadraticCurveTo(-r * .3, r * 1.0, r * .9, r * .55); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#f7d896'; ctx.beginPath(); ctx.moveTo(-r * 1.45, r * .46); ctx.quadraticCurveTo(-r * .3, r * .92, r * .85, r * .52); ctx.lineTo(r * .85, r * .22); ctx.quadraticCurveTo(-r * .3, r * .5, -r * 1.2, r * .14); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff'; for (const q of [-1.5, -1.25, -1.0]) { ctx.beginPath(); ctx.moveTo(q * r, r * .02); ctx.lineTo((q + .08) * r, r * .26); ctx.lineTo((q + .17) * r, r * .04); ctx.fill(); }
        ctx.fillStyle = '#fff6b0'; ctx.beginPath(); ctx.ellipse(-r * .55, -r * .5, r * .22, r * .16, -.3, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#2a0a00'; ctx.beginPath(); ctx.ellipse(-r * .6, -r * .5, r * .06, r * .14, -.3, 0, 7); ctx.fill();
        ctx.fillStyle = '#c2551a'; for (const q of [.1, .5]) { ctx.beginPath(); ctx.moveTo(q * r - r * .16, -r * .82); ctx.lineTo(q * r + r * .1, -r * 1.35); ctx.lineTo(q * r + r * .22, -r * .74); ctx.closePath(); ctx.fill(); ctx.stroke(); }
        ctx.restore(); } }
    // the hero, sprinting: afterimages, kicked-up puffs, speed lines
    const hx = W * .36, hy = roadY(hx) - 19 * s, bob = Math.abs(Math.sin(u * 15)) * 3 * s;
    for (let i = 3; i >= 1; i--) kkHero(hx - i * 17 * s, roadY(hx - i * 17 * s) - 19 * s, 2, u * 2.6 - i * .06, 1.05 * s, false, false, .2 - i * .05);
    for (let i = 0; i < 5; i++) { const d = ((u * 3.2 + i / 5) % 1); ctx.fillStyle = 'rgba(255,246,220,' + .6 * (1 - d) + ')'; ctx.beginPath(); ctx.arc(hx - 22 * s - d * 70 * s, roadY(hx - 22 * s - d * 70 * s) - 22 * s - d * 12 * s, (4 + d * 11) * s, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(90,36,8,.3)'; ctx.beginPath(); ctx.ellipse(hx, hy + 1, 20 * s, 5 * s, Math.atan(dY(hx)), 0, 7); ctx.fill();
    kkHero(hx, hy - bob, 2, u * 2.6, 1.05 * s, false, true);
    ctx.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 9; i++) { const y = H * .14 + ((i * 97) % 100) / 100 * H * .7, x = W - ((u * 1500 + i * 211) % (W + 240)); ctx.fillRect(x, y, 60 + (i % 3) * 40, 1.8); }
    kkSea(scroll, base + H * .2, true);
    kkLetterbox(lb);
    kkTitle('SNAKE WAY', 'A million kilometres to King Kai...', Math.min(1, u * 3) * Math.min(1, (KK.road - t) * 3), H * .2);
    if (u < .3) { ctx.fillStyle = 'rgba(255,230,168,' + (1 - u / .3) + ')'; ctx.fillRect(0, 0, W, H); }
    if (D - u < .2) { ctx.fillStyle = 'rgba(255,246,214,' + (1 - (D - u) / .2) + ')'; ctx.fillRect(0, 0, W, H); }
    return; }
  // 2) King Kai's planet: three training shots
  if (t < KK.planet) { const u = t - KK.road, D = KK.planet - KK.road, pi = Math.min(2, Math.floor(u / (D / 3))), pu = u - pi * D / 3, PD = D / 3;
    kkSky(t, t * 50);
    const R = Math.min(W * .36, H * .28), px = cxm, py = H * .64 + R * .62, last = pi == 2, ch = last ? Math.min(1, pu / (PD * .85)) : 0;
    const shk = last ? ch * 3 * s : pi == 0 && Math.sin(pu * 7) < -.9 ? 2 * s : 0, spin = pi == 1 ? -pu * 1.7 : 0;
    ctx.save(); ctx.translate((Math.random() - .5) * shk, (Math.random() - .5) * shk);
    ctx.fillStyle = 'rgba(190,120,50,.25)'; ctx.beginPath(); ctx.ellipse(px, py + R * 1.12, R * 1.1, R * .14, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(px, py); ctx.rotate(spin); kkPlanet(R, s, true); ctx.restore();
    const top = py - R, at = (a, h) => [px + Math.cos(a) * (R + h), py + Math.sin(a) * (R + h)];
    // King Kai watches from the left of the hilltop
    { const a = -2.0 + spin, [kx, ky] = at(a, 0); ctx.save(); ctx.translate(kx, ky); ctx.rotate(a + 1.571); kkKai(0, 0, s * 1.15, t, last ? ch : 0); ctx.restore(); }
    if (pi == 0) {   // push-ups under a ten-tonne weight
      const hx = px + R * .16, b = Math.abs(Math.sin(pu * 7)), dn = 1 - b;
      ctx.fillStyle = 'rgba(16,60,30,.35)'; ctx.beginPath(); ctx.ellipse(hx, top + 4 * s, 34 * s, 6 * s, 0, 0, 7); ctx.fill();
      ctx.save(); ctx.translate(hx, top + 2 * s); ctx.scale(1 + .1 * dn, .78 + .22 * b); kkHero(0, 0, 0, .5, .95 * s, false, true); ctx.restore();
      { const wy = top - 62 * s * (.78 + .22 * b) - 4 * s; ctx.save(); ctx.translate(hx - 4 * s, wy); ctx.rotate(-.08 + dn * .05); ctx.lineJoin = 'round'; ctx.strokeStyle = '#1a1a22'; ctx.lineWidth = 2;   // the weight
        const g = ctx.createLinearGradient(0, -30 * s, 0, 4 * s); g.addColorStop(0, '#9aa0ae'); g.addColorStop(1, '#4a4e5c'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-26 * s, 2 * s); ctx.lineTo(-19 * s, -26 * s); ctx.lineTo(19 * s, -26 * s); ctx.lineTo(26 * s, 2 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(0, -27 * s, 7 * s, Math.PI, 0); ctx.stroke(); ctx.fillStyle = '#f4f4f8'; ctx.font = '900 ' + Math.round(15 * s) + 'px Impact,"Arial Black",sans-serif'; ctx.textAlign = 'center'; ctx.fillText('10t', 0, -7 * s); ctx.restore(); }
      ctx.fillStyle = '#9ad8ff'; ctx.strokeStyle = '#3a78b0'; ctx.lineWidth = 1; for (let i = 0; i < 5; i++) { const q = (pu * 1.6 + i / 5) % 1, a = -1.57 + (i - 2) * .5; ctx.beginPath(); ctx.ellipse(hx + Math.cos(a) * (20 + q * 34) * s, top - 46 * s + Math.sin(a) * (10 + q * 30) * s + q * q * 30 * s, 2.4 * s, 3.4 * s, 0, 0, 7); ctx.fill(); ctx.stroke(); }
      if (dn > .85) { ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2; ctx.beginPath(); for (const q of [-1, 1]) { ctx.moveTo(hx + q * 40 * s, top + 2 * s); ctx.lineTo(hx + q * 58 * s, top - 6 * s); ctx.moveTo(hx + q * 42 * s, top + 6 * s); ctx.lineTo(hx + q * 62 * s, top + 6 * s); } ctx.stroke(); }
      kkTag('x10 GRAVITY!', hx, top - 136 * s, s);
    } else if (pi == 1) {   // catch Bubbles: round and round the little planet
      const a0 = -1.78 + Math.sin(pu * 2.4) * .3, am = a0 + .5 + Math.sin(pu * 5) * .08, [mx, my] = at(am, Math.abs(Math.sin(pu * 9)) * 7 * s), [hx, hy] = at(a0, 0);
      for (let i = 0; i < 4; i++) { const d = ((pu * 4 + i / 4) % 1), [dx, dy] = at(a0 - .12 - d * .3, 4 * s + d * 10 * s); ctx.fillStyle = 'rgba(255,250,230,' + .6 * (1 - d) + ')'; ctx.beginPath(); ctx.arc(dx, dy, (3 + d * 8) * s, 0, 7); ctx.fill(); }
      ctx.save(); ctx.translate(mx, my); ctx.rotate(am + 1.571); kkMonkey(0, 0, s * 1.5, t); ctx.restore();
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(a0 + 1.571); kkHero(0, 0, 2, pu * 2.8, .9 * s, false, true); ctx.restore();
      kkTag('CATCH BUBBLES!', cxm, top - 118 * s, s);
    } else {   // the lesson lands: power floods out
      const hx = px + R * .1, fl = 26 + 60 * ch;
      LT(); gl('rd', hx, top - 30 * s, (40 + 70 * ch) * s, .5 + .3 * ch); gl('or', hx, top - 34 * s, (22 + 34 * ch) * s, .6); NM();
      ctx.fillStyle = 'rgba(255,90,40,' + (.55 + .25 * ch) + ')'; ctx.beginPath(); for (let i = 0; i < 11; i++) { const q = (i - 5) / 5, bx = hx + q * 26 * s, h = fl * s * (1 - Math.abs(q) * .55) * (.7 + .3 * Math.sin(t * 22 + i * 2.1)); ctx.moveTo(bx - 8 * s, top + 2 * s); ctx.quadraticCurveTo(bx - 3 * s + Math.sin(t * 15 + i) * 4 * s, top - h * .6, bx + Math.sin(t * 11 + i * 3) * 5 * s, top - h - 30 * s); ctx.quadraticCurveTo(bx + 6 * s, top - h * .5, bx + 8 * s, top + 2 * s); } ctx.fill();
      ctx.fillStyle = '#5a7a4a'; ctx.strokeStyle = '#17451f'; ctx.lineWidth = 1.4; for (let i = 0; i < 8; i++) { const q = ((pu * .9 + i / 8) % 1), a = (i - 3.5) * .16, sz = (3 + (i * 5 % 4)) * s; ctx.save(); ctx.translate(hx + Math.sin(a) * (60 + i * 6) * s, top - q * 120 * s * ch - 4 * s); ctx.rotate(q * 5 + i); ctx.globalAlpha = (1 - q) * ch; ctx.fillRect(-sz, -sz * .7, sz * 2, sz * 1.4); ctx.strokeRect(-sz, -sz * .7, sz * 2, sz * 1.4); ctx.restore(); }
      ctx.fillStyle = 'rgba(16,60,30,.35)'; ctx.beginPath(); ctx.ellipse(hx, top + 4 * s, 26 * s, 6 * s, 0, 0, 7); ctx.fill();
      kkHero(hx, top + 2 * s, 1, pu * 1.4, (1 + .06 * ch) * s, false, true);
      if (ch > .5) { ctx.strokeStyle = 'rgba(255,240,200,' + (ch - .5) * 1.6 + ')'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283 + t * 2, r0 = (70 + 20 * Math.sin(t * 30 + i)) * s; ctx.moveTo(hx + Math.cos(a) * r0, top - 30 * s + Math.sin(a) * r0); ctx.lineTo(hx + Math.cos(a) * (r0 + 26 * s), top - 30 * s + Math.sin(a) * (r0 + 26 * s)); } ctx.stroke(); }
      kkTag(S.hero == 'goku' ? 'KAIO-KEN!' : 'POWER UNLOCKED!', hx, top - (128 + 30 * ch) * s, s);
    }
    ctx.restore();
    // a slash of light between shots
    if (pi > 0 && pu < .16) { const w = 1 - pu / .16; ctx.fillStyle = 'rgba(255,250,230,' + w + ')'; ctx.beginPath(); const xx = W * 1.4 * (1 - w) - W * .2; ctx.moveTo(xx, 0); ctx.lineTo(xx + W * .7, 0); ctx.lineTo(xx + W * .5, H); ctx.lineTo(xx - W * .2, H); ctx.fill(); ctx.fillStyle = 'rgba(255,250,230,' + w * .5 + ')'; ctx.fillRect(0, 0, W, H); }
    kkLetterbox(Math.min(1, (D - u) * 4));
    kkTitle("KING KAI'S TRAINING", '', Math.min(1, u * 3) * Math.min(1, (D - u) * 4), H * .19); ctx.globalAlpha = Math.min(1, u * 3) * Math.min(1, (D - u) * 4); kkPips(3, pi, H * .19 + 16); ctx.globalAlpha = 1;
    if (u < .25) { ctx.fillStyle = 'rgba(255,246,214,' + (1 - u / .25) + ')'; ctx.fillRect(0, 0, W, H); }
    return; }
  // 3) back to the fight: a burst of light with turning rays, REVIVED!
  const u = t - KK.planet, D = KK_T - KK.planet, k = u / D;
  const wa = u < .25 ? u / .25 : Math.max(0, 1 - (u - .25) / (D - .25)); ctx.fillStyle = 'rgba(255,248,220,' + wa + ')'; ctx.fillRect(0, 0, W, H);
  LT(); ctx.save(); ctx.translate(cxm, cym); ctx.rotate(u * .8); const L = Math.hypot(W, H) * (.25 + .75 * ieo(k * 1.5));
  for (let i = 0; i < 16; i++) { ctx.rotate(6.283 / 16); ctx.fillStyle = 'rgba(255,220,130,' + .32 * (1 - k) + ')'; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(L, -L * .05); ctx.lineTo(L, L * .05); ctx.lineTo(0, 5); ctx.fill(); } ctx.restore();
  gl('or', cxm, cym, Math.min(W, H) * .5 * (.4 + u), .6 * (1 - k)); NM();
  ctx.strokeStyle = 'rgba(255,240,190,' + (1 - k) + ')'; ctx.lineWidth = 6 * (1 - k) + 1; ctx.beginPath(); ctx.arc(cxm, cym, Math.min(W, H) * .6 * ieo(k * 1.4), 0, 7); ctx.stroke();
  kkTitle('REVIVED!', 'Full HP · +1 Level', Math.min(1, u * 5), H * .3);
}
function kkTag(txt, x, y, s) {   // a comic caption: slanted gold plate with a dark edge
  ctx.save(); ctx.font = '900 ' + Math.round(17 * s) + 'px Impact,Haettenschweiler,"HelveticaNeue-CondensedBlack","Avenir Next Condensed","Roboto Condensed",sans-serif-condensed,"Arial Narrow","Arial Black",sans-serif'; ctx.textAlign = 'center';
  const w = ctx.measureText(txt).width + 26 * s, h = 26 * s; x = Math.max(w / 2 + 8, Math.min(W - w / 2 - 8, x)); y = Math.max(H * .3, y);
  ctx.translate(x, y); ctx.rotate(-.045); ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(30,10,0,.35)'; ctx.beginPath(); ctx.moveTo(-w / 2 + 9, -h / 2 + 4); ctx.lineTo(w / 2 + 7, -h / 2 + 4); ctx.lineTo(w / 2 - 1, h / 2 + 4); ctx.lineTo(-w / 2 + 1, h / 2 + 4); ctx.fill();
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#fff3b0'); g.addColorStop(1, '#ffb21f'); ctx.fillStyle = g; ctx.strokeStyle = '#4a1a00'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(-w / 2 + 6, -h / 2); ctx.lineTo(w / 2 + 4, -h / 2); ctx.lineTo(w / 2 - 4, h / 2); ctx.lineTo(-w / 2 - 2, h / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4a1a00'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 1, 1); ctx.restore();
}
// King Kai: blue catfish face, round shades, whiskers, antennae, dark robe with his crest. (0,0) = feet. wow 0..1 = jaw drops.
function kkKai(x, y, s, t, wow) {
  const lg = wow ? 0 : Math.abs(Math.sin(t * 6)) * 2;
  ctx.save(); ctx.translate(x, y - lg); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = '#141420'; ctx.lineWidth = 1.7;
  ctx.fillStyle = '#20202c'; ctx.beginPath(); ctx.ellipse(-5, 0, 5, 2.6, 0, 0, 7); ctx.ellipse(5, 0, 5, 2.6, 0, 0, 7); ctx.fill();   // shoes
  ctx.fillStyle = '#2c3350'; ctx.beginPath(); ctx.moveTo(-13, -1); ctx.quadraticCurveTo(-17, -20, -10, -30); ctx.lineTo(10, -30); ctx.quadraticCurveTo(17, -20, 13, -1); ctx.closePath(); ctx.fill(); ctx.stroke();   // robe
  ctx.fillStyle = '#f2ead8'; ctx.beginPath(); ctx.arc(0, -16, 8, 0, 7); ctx.fill(); ctx.stroke();   // crest
  ctx.strokeStyle = '#b02a22'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-4, -19); ctx.lineTo(4, -19); ctx.moveTo(-4.5, -15.5); ctx.lineTo(4.5, -15.5); ctx.moveTo(0, -20); ctx.lineTo(0, -12); ctx.moveTo(-4, -12); ctx.lineTo(4, -12); ctx.stroke();
  ctx.strokeStyle = '#141420'; ctx.lineWidth = 1.7;
  ctx.fillStyle = '#2c3350'; for (const q of [-1, 1]) { ctx.beginPath(); ctx.moveTo(q * 11, -28); ctx.quadraticCurveTo(q * (wow ? 21 : 18), -22 - (wow ? 10 * wow : 0), q * (wow ? 19 : 15), -14 - (wow ? 16 * wow : 0)); ctx.lineTo(q * (wow ? 15 : 11), -16 - (wow ? 14 * wow : 0)); ctx.closePath(); ctx.fill(); ctx.stroke(); }   // arms (thrown up when amazed)
  ctx.fillStyle = '#5aaef0'; ctx.beginPath(); ctx.ellipse(0, -41, 12.5, 11.5, 0, 0, 7); ctx.fill(); ctx.stroke();   // head
  ctx.fillStyle = '#8ccaf8'; ctx.beginPath(); ctx.ellipse(-4, -46, 5, 3, -.4, 0, 7); ctx.fill();
  ctx.fillStyle = '#20202c'; ctx.beginPath(); ctx.moveTo(-10, -50); ctx.quadraticCurveTo(0, -57, 10, -50); ctx.lineTo(9, -47); ctx.quadraticCurveTo(0, -51, -9, -47); ctx.closePath(); ctx.fill(); ctx.stroke();   // cap
  ctx.lineWidth = 1.5; for (const q of [-1, 1]) { ctx.beginPath(); ctx.moveTo(q * 4, -53); ctx.quadraticCurveTo(q * 9, -61, q * 6 + Math.sin(t * 7 + q) * 1.2, -68); ctx.stroke(); ctx.fillStyle = '#20202c'; ctx.beginPath(); ctx.arc(q * 6 + Math.sin(t * 7 + q) * 1.2, -68, 2, 0, 7); ctx.fill(); }   // antennae
  ctx.fillStyle = '#0e0e16'; for (const q of [-1, 1]) { ctx.beginPath(); ctx.arc(q * 5, -42, 4.3, 0, 7); ctx.fill(); } ctx.beginPath(); ctx.moveTo(-1, -42.5); ctx.lineTo(1, -42.5); ctx.stroke();   // shades
  ctx.fillStyle = 'rgba(255,255,255,.55)'; for (const q of [-1, 1]) { ctx.beginPath(); ctx.arc(q * 5 - 1.4, -43.5, 1.2, 0, 7); ctx.fill(); }
  ctx.lineWidth = 1.1; ctx.beginPath(); for (const q of [-1, 1]) { ctx.moveTo(q * 9, -37); ctx.lineTo(q * 19, -39); ctx.moveTo(q * 9, -35.5); ctx.lineTo(q * 18, -34); } ctx.stroke();   // whiskers
  if (wow) { ctx.fillStyle = '#3a0a10'; ctx.beginPath(); ctx.ellipse(0, -34, 3.4, 2 + 3.4 * wow, 0, 0, 7); ctx.fill(); ctx.stroke(); }
  else { ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-4.5, -35); ctx.quadraticCurveTo(0, -31 - lg * .6, 4.5, -35); ctx.stroke(); }
  ctx.restore();
}
// Bubbles the monkey, scampering. (0,0) = feet.
function kkMonkey(x, y, s, t) {
  const b = Math.sin(t * 22);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 4.2; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.quadraticCurveTo(-17, -12, -15, -23 + b); ctx.stroke(); ctx.strokeStyle = '#a06a32'; ctx.lineWidth = 2.6; ctx.stroke();   // tail
  ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 1.5; ctx.fillStyle = '#8a5626';
  for (const q of [-1, 1]) { ctx.beginPath(); ctx.ellipse(q * 3 + q * b * 3, -1.5, 3.6, 2.2, 0, 0, 7); ctx.fill(); ctx.stroke(); }   // feet
  ctx.fillStyle = '#a06a32'; ctx.beginPath(); ctx.ellipse(0, -9 + b * .4, 8, 7.2, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f0c890'; ctx.beginPath(); ctx.ellipse(1.5, -8 + b * .4, 4.6, 4.6, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#a06a32'; ctx.beginPath(); ctx.ellipse(8 - b * 2.5, -10, 2.4, 4.4, -.9, 0, 7); ctx.fill(); ctx.stroke();   // arm
  ctx.beginPath(); ctx.arc(-1.5, -21 + b * .4, 2.6, 0, 7); ctx.arc(10.5, -21 + b * .4, 2.6, 0, 7); ctx.fill(); ctx.stroke();   // ears
  ctx.beginPath(); ctx.arc(4.5, -19 + b * .4, 6.6, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f0c890'; ctx.beginPath(); ctx.ellipse(6, -17.6 + b * .4, 4.4, 3.8, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(4.6, -19.6 + b * .4, 1, 0, 7); ctx.arc(8, -19.6 + b * .4, 1, 0, 7); ctx.fill();
  ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(6.4, -16.6 + b * .4, 1.8, .3, 2.8); ctx.stroke();
  ctx.restore();
}
