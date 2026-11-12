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
  try { sfxPlay('lose'); } catch (e) { }
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
  ban('REVIVED!'); try { sfxPlay('ssj'); } catch (e) { }
}
{ const _d = draw; draw = function () {
    _d(); if (S.mode != 'kk' || !KKc) return;
    const now = performance.now(); KKc.t += Math.min(.05, Math.max(0, (now - KKc.last) / 1000)); KKc.last = now;
    if (KKc.t >= KK_T) { kkEnd(); return; }
    const ph = KKc.t < KK.fall ? 0 : KKc.t < KK.road ? 1 : KKc.t < KK.planet ? 2 : 3;
    if (ph != KKc.ph) { KKc.ph = ph; if (ph) try { sfxPlay(ph == 3 ? 'ult' : 'lvl'); } catch (e) { } }
    ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); drawKK(KKc.t); ctx.restore();
  }; }

/* ---------- drawing ---------- */
// one frame of the hero's sprite sheet. row: 0 attack, 1 idle, 2 run, 3 walk. (x,y) = feet.
function kkHero(x, y, row, u, s, flip, halo) {
  const sh = sheetOf(S.hero, 0), n = FRN[row], f = Math.floor((u % 1 + 1) % 1 * n) % n;
  ctx.save(); ctx.translate(x, y - 21 * s); ctx.scale(flip ? -s : s, s);
  ctx.drawImage(sh, f * HC, row * HC, HC, HC, -HOX / HC * HD, HDY, HD, HD); ctx.restore();
  if (halo) { const hy = y - 78 * s; ctx.save(); ctx.strokeStyle = '#fff3a0'; ctx.lineWidth = 3 * s; ctx.shadowColor = '#ffe066'; ctx.shadowBlur = 10 * s;
    ctx.beginPath(); ctx.ellipse(x + (flip ? -3 : 3) * s, hy + Math.sin(KKc.t * 4) * 2 * s, 11 * s, 3.6 * s, 0, 0, 7); ctx.stroke(); ctx.restore(); }
}
function kkTitle(txt, sub, a, y) {
  const fs = Math.min(44, W * .085); ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.font = '900 ' + fs + 'px Impact,"Arial Black",sans-serif'; ctx.lineWidth = fs * .2; ctx.strokeStyle = '#4a1a00'; ctx.strokeText(txt, W / 2, y);
  const g = ctx.createLinearGradient(0, y - fs, 0, y); g.addColorStop(0, '#fffbd0'); g.addColorStop(1, '#ffb21f'); ctx.fillStyle = g; ctx.fillText(txt, W / 2, y);
  if (sub) { ctx.font = 'bold ' + Math.round(fs * .38) + 'px sans-serif'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(60,20,0,.8)'; ctx.strokeText(sub, W / 2, y + fs * .6); ctx.fillStyle = '#fff'; ctx.fillText(sub, W / 2, y + fs * .6); }
  ctx.restore();
}
// Other World sky: warm gradient with drifting yellow cloud banks
function kkSky(t, scroll) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f7b955'); g.addColorStop(.55, '#fbd88a'); g.addColorStop(1, '#f6c46a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let L = 0; L < 3; L++) { const sp = (L + 1) * .35, yb = H * (.2 + L * .3), sz = 30 + L * 18;
    ctx.fillStyle = L == 2 ? 'rgba(255,236,170,.95)' : L == 1 ? 'rgba(255,226,150,.8)' : 'rgba(255,240,200,.6)';
    for (let i = -1; i < W / (sz * 2.4) + 2; i++) { const x = ((i * sz * 2.4 - scroll * sp) % (W + sz * 4) + W + sz * 4) % (W + sz * 4) - sz * 2, y = yb + Math.sin(i * 1.7 + L) * 14;
      ctx.beginPath(); ctx.arc(x, y, sz, 0, 7); ctx.arc(x + sz * .9, y - sz * .3, sz * .8, 0, 7); ctx.arc(x - sz * .9, y + sz * .1, sz * .7, 0, 7); ctx.fill(); } }
}
function drawKK(t) {
  const cxm = W / 2, cym = H / 2, s = Math.max(.75, Math.min(1.5, Math.min(W, H) / 420));
  // 0) death: world dims, halo appears, fade to the Other World
  if (t < KK.fall) { const k = t / KK.fall;
    ctx.fillStyle = 'rgba(10,6,20,' + Math.min(.6, k * 1.2) + ')'; ctx.fillRect(0, 0, W, H);
    kkHero(cxm, cym + 20, 1, t * .9, 1.15, S.p.face < 0, k > .25);
    if (k > .5) { ctx.fillStyle = 'rgba(251,216,138,' + ((k - .5) * 2) + ')'; ctx.fillRect(0, 0, W, H); }
    return; }
  // 1) Snake Way: winding road, hero sprinting, King Kai's planet rising ahead
  if (t < KK.road) { const u = t - KK.fall, scroll = u * 520;
    kkSky(t, scroll);
    const roadY = x => H * .62 + Math.sin((x + scroll) * .006) * H * .1 + Math.sin((x + scroll) * .017) * H * .025;
    // planet ahead (top right), growing as we approach
    const pk = u / (KK.road - KK.fall), pr = 10 + 40 * pk * pk; ctx.fillStyle = '#4caf50'; ctx.beginPath(); ctx.arc(W * .82, H * .2, pr, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(W * .82 - pr * .3, H * .2 - pr * .3, pr * .5, 0, 7); ctx.fill();
    // the road: a long scaled serpent body
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const path = () => { ctx.beginPath(); for (let x = -20; x <= W + 20; x += 12) { const y = roadY(x); x < -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } };
    path(); ctx.strokeStyle = '#7a3a10'; ctx.lineWidth = 46 * s; ctx.stroke();
    path(); ctx.strokeStyle = '#e8902e'; ctx.lineWidth = 38 * s; ctx.stroke();
    path(); ctx.strokeStyle = '#f6b452'; ctx.lineWidth = 16 * s; ctx.stroke();
    ctx.strokeStyle = 'rgba(122,58,16,.55)'; ctx.lineWidth = 2;   // scale chevrons
    for (let i = -1; i < W / 34 + 2; i++) { const x = i * 34 - scroll % 34, y = roadY(x); ctx.beginPath(); ctx.moveTo(x - 7, y - 12 * s); ctx.lineTo(x + 3, y); ctx.lineTo(x - 7, y + 12 * s); ctx.stroke(); }
    const hx = W * .38; kkHero(hx, roadY(hx) + 6 * s, 2, u * 2.4, 1.05 * s, false, true);
    // speed lines
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; for (let i = 0; i < 7; i++) { const y = (i * 97 + 40) % H, x = W - ((u * 1400 + i * 211) % (W + 200)); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 70, y); ctx.stroke(); }
    kkTitle('SNAKE WAY', 'A million kilometres to King Kai...', Math.min(1, u * 3) * Math.min(1, (KK.road - t) * 3), H * .16);
    if (u < .3) { ctx.fillStyle = 'rgba(251,216,138,' + (1 - u / .3) + ')'; ctx.fillRect(0, 0, W, H); }
    return; }
  // 2) King Kai's planet: three quick training panels
  if (t < KK.planet) { const u = t - KK.road, D = KK.planet - KK.road, pi = Math.min(2, Math.floor(u / (D / 3))), pu = u - pi * D / 3;
    kkSky(t, t * 60);
    const R = Math.min(W, H) * .3, px = cxm, py = H * .66 + R * .55;
    const spin = pi == 2 ? -u * 2.2 : pi == 1 ? -u * .3 : 0;
    // planet
    ctx.save(); ctx.translate(px, py); ctx.rotate(spin);
    const g = ctx.createRadialGradient(-R * .35, -R * .4, R * .1, 0, 0, R); g.addColorStop(0, '#8ee07a'); g.addColorStop(1, '#2f8a3a'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill(); ctx.strokeStyle = '#1d5a24'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = 'rgba(30,90,36,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-R, -R * .02); ctx.quadraticCurveTo(-R * .4, -R * .18, R * .1, -R * .05); ctx.stroke();
    // house (round dome, red roof) and a tree, fixed to the surface
    ctx.save(); ctx.rotate(-.55); ctx.translate(0, -R);
    ctx.fillStyle = '#f4ecd8'; ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 2, 22 * s, 3.1416, 0); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d8402a'; ctx.beginPath(); ctx.arc(0, -12 * s, 13 * s, 3.1416, 0); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#3a2a1a'; ctx.fillRect(-4 * s, -8 * s, 8 * s, 10 * s);
    ctx.restore();
    ctx.save(); ctx.rotate(.75); ctx.translate(0, -R); ctx.fillStyle = '#6a4020'; ctx.fillRect(-3 * s, -26 * s, 6 * s, 26 * s);
    ctx.fillStyle = '#2f9a3a'; ctx.beginPath(); ctx.arc(0, -32 * s, 15 * s, 0, 7); ctx.fill(); ctx.restore();
    ctx.restore();
    // King Kai on the left of the planet top, watching
    kkKai(px - R * .45, py - R * .9 + 4, s, t);
    // the panels
    if (pi == 0) { // weighted push-ups: squash up and down, sweat, "x10 GRAVITY"
      const b = Math.abs(Math.sin(pu * 7)); ctx.save(); ctx.translate(px + R * .12, py - R); ctx.scale(1 + .08 * (1 - b), .82 + .18 * b); kkHero(0, 0, 0, .5, .95 * s, false, true); ctx.restore();
      ctx.fillStyle = '#9ad8ff'; for (let i = 0; i < 3; i++) { const a = pu * 5 + i * 2; ctx.beginPath(); ctx.arc(px + R * .12 + Math.cos(a) * 30 * s, py - R - 60 * s + ((pu * 60 + i * 20) % 40), 3, 0, 7); ctx.fill(); }
      kkTag('x10 GRAVITY!', px + R * .12, py - R - 96 * s, s);
    } else if (pi == 1) { // chase the monkey round the planet
      const a0 = -1.571 + pu * 2.6;
      const at = (a, h) => [px + Math.cos(a) * (R + h), py + Math.sin(a) * (R + h)];
      const [mx, my] = at(a0 + .5, 0); ctx.save(); ctx.translate(mx, my); ctx.rotate(a0 + .5 + 1.571); kkMonkey(0, 0, s * 1.35, t); ctx.restore();
      const [hx, hy] = at(a0, 0); ctx.save(); ctx.translate(hx, hy); ctx.rotate(a0 + 1.571); kkHero(0, 0, 2, pu * 2.6, .9 * s, false, true); ctx.restore();
      kkTag('CATCH THE MONKEY!', cxm, py - R - 110 * s, s);
    } else { // gravity sprint: the planet spins under you, speed lines
      kkHero(px, py - R + 2, 2, pu * 3.4, 1 * s, false, true);
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { const y = py - R - 20 * s - i * 11 * s, x = px - 40 * s - ((pu * 900 + i * 57) % 160); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 50, y); ctx.stroke(); }
      kkTag('GRAVITY SPRINT!', px, py - R - 110 * s, s);
    }
    // panel wipe between montage shots
    const w = pu < .12 && pi > 0 ? 1 - pu / .12 : 0; if (w) { ctx.fillStyle = 'rgba(255,250,230,' + w + ')'; ctx.fillRect(0, 0, W, H); }
    kkTitle("KING KAI'S TRAINING", 'Panel ' + (pi + 1) + ' / 3', Math.min(1, u * 3), H * .14);
    if (u < .25) { ctx.fillStyle = 'rgba(251,216,138,' + (1 - u / .25) + ')'; ctx.fillRect(0, 0, W, H); }
    return; }
  // 3) back to the fight: white burst, REVIVED!
  const u = t - KK.planet, D = KK_T - KK.planet;
  const wa = u < .25 ? u / .25 : Math.max(0, 1 - (u - .25) / (D - .25)); ctx.fillStyle = 'rgba(255,248,220,' + wa + ')'; ctx.fillRect(0, 0, W, H);
  LT(); gl('or', cxm, cym, Math.min(W, H) * .5 * (.4 + u), .6 * (1 - u / D)); NM();
  kkTitle('REVIVED!', 'Full HP · +1 Level', Math.min(1, u * 5), H * .3);
}
function kkTag(txt, x, y, s) {
  ctx.save(); ctx.font = 'bold ' + Math.round(15 * s) + 'px sans-serif'; ctx.textAlign = 'center'; const w = ctx.measureText(txt).width + 18;
  ctx.fillStyle = 'rgba(30,10,0,.7)'; ctx.fillRect(x - w / 2, y - 13 * s, w, 24 * s); ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 2; ctx.strokeRect(x - w / 2, y - 13 * s, w, 24 * s);
  ctx.fillStyle = '#ffe9a8'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x, y - 1 * s); ctx.restore();
}
// King Kai: round blue figure with antennae and dark glasses, bobbing as he laughs
function kkKai(x, y, s, t) {
  ctx.save(); ctx.translate(x, y + Math.abs(Math.sin(t * 6)) * -2); ctx.scale(s, s); ctx.strokeStyle = '#1a1a2a'; ctx.lineWidth = 1.6;
  ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-9, -2, 18, 6);   // feet/robe hem
  ctx.fillStyle = '#e8d8b0'; ctx.beginPath(); ctx.ellipse(0, -14, 14, 15, 0, 0, 7); ctx.fill(); ctx.stroke();   // robe
  ctx.fillStyle = '#2a2a2a'; ctx.beginPath(); ctx.moveTo(-14, -16); ctx.lineTo(14, -16); ctx.lineTo(10, -8); ctx.lineTo(-10, -8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4aa0e8'; ctx.beginPath(); ctx.arc(0, -36, 11, 0, 7); ctx.fill(); ctx.stroke();   // head
  ctx.fillStyle = '#111'; ctx.fillRect(-8, -39, 16, 4.5);   // glasses
  ctx.beginPath(); ctx.moveTo(-4, -30); ctx.quadraticCurveTo(0, -27, 4, -30); ctx.stroke();
  ctx.lineWidth = 1.4; for (const q of [-1, 1]) { ctx.beginPath(); ctx.moveTo(q * 4, -46); ctx.quadraticCurveTo(q * 8, -54, q * 5, -60); ctx.stroke(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(q * 5, -60, 1.8, 0, 7); ctx.fill(); }
  ctx.restore();
}
function kkMonkey(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 1.4; const b = Math.sin(t * 22) * 2;
  ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.quadraticCurveTo(-16, -14, -14, -24); ctx.stroke(); ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 1.4;
  ctx.fillStyle = '#a06a32'; ctx.beginPath(); ctx.ellipse(0, -9 + b * .3, 8, 7, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillRect(-6, -3, 3, 4 + b); ctx.fillRect(3, -3, 3, 4 - b);
  ctx.beginPath(); ctx.arc(5, -18 + b * .3, 6, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f0c890'; ctx.beginPath(); ctx.ellipse(7, -17 + b * .3, 3.6, 3, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(6.5, -19.5 + b * .3, 1, 0, 7); ctx.arc(9, -19.5 + b * .3, 1, 0, 7); ctx.fill();
  ctx.restore();
}
