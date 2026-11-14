/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — TRANSFORMATION CUTSCENES (EXPANSION_PLAN.md §9.0)
   · Middle forms (Frieza 2nd, Semi-Perfect Cell, Super Buu): the screen dims, the aura flares,
     the camera pushes in, a roar and a title card.
   · Final forms (Frieza Final, Perfect Cell, Kid Buu): a foreboding sting, the sky darkens, lightning,
     rubble rises and hangs, a silhouette, then the reveal with a shockwave.
   · Super Saiyan (every hero): the same quality but heart-thumping: heartbeat drums into a major-key
     brass hit, golden lightning, rising rubble and a golden burst. Each hero gets a variation.
   Tap / Space / Enter / Esc skips a cutscene you've already seen. Reduced flashing softens the lightning.
   ===================================================================== */
'use strict';

const CUTF = {   // [title, subtitle, final form?]
  fr2: ['FRIEZA TRANSFORMS!', 'Second form', 0], fr3: ['FRIEZA', 'FINAL FORM', 1],
  ce2: ['CELL EVOLVES!', 'Semi-Perfect form', 0], ce3: ['PERFECT CELL', 'THE ULTIMATE ANDROID', 1],
  bu2: ['BUU TRANSFORMS!', 'Super Buu', 0], bu3: ['KID BUU', 'THE ORIGINAL MAJIN', 1]
};
V2.bc = null; V2.sc = null;
const cSeen = k => !!(P && P.cutSeen && P.cutSeen[k]);
function cMark(k) { (P.cutSeen || (P.cutSeen = {}))[k] = 1; try { saveProg(); } catch (e) { } }
const ez = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
function mkRubble(n, R, seed) { const a = []; for (let i = 0; i < n; i++) { const q = rnd(i, seed); a.push({ a: q * 6.283, r: R * (.35 + rnd(seed, i) * .9), s: 3 + rnd(i + 7, seed) * 7, h: 40 + rnd(i, seed + 3) * 110, d: rnd(i + 2, seed) * .9, rot: rnd(seed + 5, i) * 6, w: (rnd(i, seed + 9) - .5) * 2, v: rnd(i + 4, seed + 1) }); } return a; }
function drawRubble(L, x, y, t, t0, T1, blast, Z) {
  ctx.save(); ctx.lineJoin = 'round'; ctx.strokeStyle = OL; ctx.lineWidth = 1.2;
  for (const q of L) { const u = ez((t - t0 - q.d) / 1.4), bx = blast > 0 ? blast * 260 : 0;
    const px = x + Math.cos(q.a) * (q.r + bx) * Z, py = y + Math.sin(q.a) * (q.r + bx) * .45 * Z - (q.h * u + Math.sin(t * 2 + q.a) * 3 * u) * Z - (blast > 0 ? blast * 80 : 0);
    if (u <= 0) continue; ctx.save(); ctx.translate(px, py); ctx.rotate(q.rot + t * q.w * .6); ctx.globalAlpha = blast > 0 ? Math.max(0, 1 - blast * 1.4) : 1;
    ctx.fillStyle = q.v < .5 ? '#8a7a6a' : '#6a5e52'; const s = q.s * Z; ctx.beginPath(); ctx.moveTo(-s, -s * .4); ctx.lineTo(-s * .2, -s); ctx.lineTo(s, -s * .3); ctx.lineTo(s * .6, s * .7); ctx.lineTo(-s * .7, s * .6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
function bolt(x0, y0, x1, y1, col, w, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'miter'; ctx.shadowColor = col; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.moveTo(x0, y0); const n = 9; for (let i = 1; i <= n; i++) { const u = i / n; ctx.lineTo(x0 + (x1 - x0) * u + (i < n ? (Math.random() - .5) * 46 : 0), y0 + (y1 - y0) * u); } ctx.stroke();
  ctx.lineWidth = w * .35; ctx.strokeStyle = '#ffffff'; ctx.stroke(); ctx.restore();
}
function cracks(x, y, k, col, Z) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; for (let i = 0; i < 9; i++) { const a = i * .698 + .2, L = (30 + 150 * k) * Z; ctx.beginPath(); ctx.moveTo(x, y);
    for (let j = 1; j <= 5; j++) ctx.lineTo(x + Math.cos(a) * L * j / 5 + Math.sin(j * 9 + i) * 7 * Z, y + Math.sin(a) * L * j / 5 * .42 + Math.cos(j * 7 + i) * 3 * Z); ctx.stroke(); } ctx.restore(); }
function title(name, sub, a, col) {
  if (a <= 0) return; const fs = Math.min(62, W * .12), y = H * .26; ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.font = '900 ' + fs + 'px Impact,Haettenschweiler,"HelveticaNeue-CondensedBlack","Avenir Next Condensed","Roboto Condensed",sans-serif-condensed,"Arial Narrow","Arial Black",sans-serif'; ctx.lineWidth = fs * .2; ctx.strokeStyle = col[2]; ctx.strokeText(name, W / 2, y);
  const g = ctx.createLinearGradient(0, y - fs, 0, y); g.addColorStop(0, col[0]); g.addColorStop(1, col[1]); ctx.fillStyle = g; ctx.fillText(name, W / 2, y);
  if (sub) { ctx.font = 'bold ' + Math.round(fs * .3) + 'px "Trebuchet MS",sans-serif'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.strokeText(sub, W / 2, y + fs * .5); ctx.fillStyle = '#fff3d8'; ctx.fillText(sub, W / 2, y + fs * .5); }
  ctx.restore();
}
function letterbox(k) { const bh = H * .11 * k; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh); }

/* ---------- audio ---------- */
{ const _sp = sfxPlay; sfxPlay = function (k) {
    if (k != 'omen' && k != 'morph' && k != 'ssj' && k != 'ssjhit') return _sp(k);
    if (muted || !SET.sfx || !AC || AC.state != 'running' || !bus()) return; const n = AC.currentTime, NT = s => 440 * Math.pow(2, (s - 69) / 12);
    if (k == 'omen') {   // low drones, slow timpani, minor key, then the reveal stab
      for (const d of [1, 1.007, .5]) tone('sawtooth', 55 * d, 52 * d, 4.4, .05);
      for (const s of [45, 48, 52]) tone('triangle', NT(s), NT(s), 3.2, .07, n + .2);
      [0, 1, 1.8, 2.4, 2.75].forEach(t => { tone('sine', 95, 38, .7, .32, n + t); noise(.5, .1, 'lowpass', 500, 80, n + t); });
      noise(1.6, .32, 'lowpass', 2600, 60, n + 3); tone('sine', 120, 28, 1.4, .3, n + 3);
      for (const s of [45, 48, 52, 57]) { tone('sawtooth', NT(s), NT(s), 1.1, .05, n + 3); tone('sawtooth', NT(s) * 1.006, NT(s), 1.1, .035, n + 3); }
    } else if (k == 'morph') {   // middle forms: roar, a rising whine, a boom
      tone('sawtooth', 90, 55, 1, .1); tone('square', 60, 45, 1, .05); noise(1, .1, 'lowpass', 900, 150);
      tone('sawtooth', 140, 520, 1.3, .05, n + .1); noise(1.3, .06, 'bandpass', 300, 2600, n + .1, 0, 3);
      noise(.9, .26, 'lowpass', 2200, 70, n + 1.4); tone('sine', 120, 32, .9, .26, n + 1.4);
    } else if (k == 'ssj') {   // a heartbeat that speeds up, a rising roar
      const beats = [0, .72, 1.3, 1.78, 2.16, 2.46, 2.68, 2.84];
      for (const b of beats) { tone('sine', 120, 42, .2, .55, n + b); tone('sine', 105, 40, .16, .35, n + b + .16); noise(.12, .05, 'lowpass', 400, 80, n + b); }
      tone('sawtooth', 70, 300, 2.9, .05); noise(2.9, .06, 'bandpass', 200, 2500, n, 0, 2);
      for (let i = 0; i < 5; i++) noise(.12, .1, 'highpass', 4000, 1500, n + .6 + i * .45);
    } else if (k == 'ssjhit') {   // major-key brass hit + cymbal
      noise(1.4, .28, 'lowpass', 3200, 80); tone('sine', 110, 30, 1.1, .3); noise(1.6, .12, 'highpass', 6000, 3000);
      for (const s of [48, 52, 55, 60, 64]) { tone('sawtooth', NT(s), NT(s), 1.2, .05); tone('sawtooth', NT(s) * 1.005, NT(s), 1.2, .035); tone('square', NT(s) * 2, NT(s) * 2, .6, .012); }
    }
  }; }
SONGS.quiet = { bpm: 60, root: 40, bass: [], lead: [], dr: '', sn: '', hat: '', vol: 0 };
SONGS.quiet.bass = [-99]; // never sounds (tick only plays bass on even steps; a giant negative note is inaudible)

/* ---------- boss transformations ---------- */
{ const _s = spawnE; spawnE = function (k) { const n0 = S.en.length, r = _s(k);
    if (CUTF[k] && S.en.length > n0 && S.mode == 'play' && !V2.noCut && S.t > 1) { const e = S.en[S.en.length - 1]; e._in = 1;
      const fin = CUTF[k][2], strikes = [];
      if (fin) for (let i = 0, t = .35; i < 9; i++, t += .28 + Math.random() * .2) strikes.push({ t, a: (Math.random() - .5) * 2.4, d: 40 + Math.random() * 90, done: 0 });
      V2.bc = { k, e, t: 0, T: fin ? 4.6 : 2.8, fin, rub: mkRubble(fin ? 28 : 10, 120, (Math.random() * 100) | 0), strikes };
      S.ban = null; MUS.want('quiet'); sfxPlay(fin ? 'omen' : 'morph'); }
    return r; }; }

/* ---------- Super Saiyan (every hero) ---------- */
const SSV = {   // hero variations: [title, line, aura rgb, burst colour key]
  goku: () => RU('ss3') ? ['SUPER SAIYAN 3', 'This... is Super Saiyan 3!'] : ['SUPER SAIYAN', 'I am the hope of the universe!'],
  gohan: () => ['SUPER SAIYAN 2', 'Static crackles through the air...'], pic: () => ['ORANGE PICCOLO', 'A Namekian giant awakens!'],
  vegeta: () => RU('mveg') ? ['MAJIN VEGETA', "Babidi's mark... but my pride is my own!"] : ['SUPER SAIYAN', 'I am the prince of all Saiyans!'],
  kri: () => ['POTENTIAL UNLOCKED', 'The Elder Kai brings out his hidden power!'], trunks: () => ['SUPER SAIYAN', 'For the future!'],
  gotenks: () => ['SUPER SAIYAN 3', 'Super Gotenks is here!']
};
const SS_T = 3.8, SS_HIT = 2.95;
{ const _u = update; update = function (dt) {
    if (V2.bc) { const b = V2.bc; b.t += dt; S.ban = null; S.bi = null; S.flash = Math.max(0, S.flash - dt * 3);
      for (const s of b.strikes) if (!s.done && b.t >= s.t) { s.done = 1; sfxPlay('thunder'); }
      if (b.fin && !b.boomd && b.t >= 3) { b.boomd = 1; kick(20); }
      if (b.t >= b.T) { cMark(b.k); V2.bc = null; S.inv = Math.max(S.inv || 0, 1.5); MUS.want('boss'); } return; }
    if (V2.sc) { const c = V2.sc; c.t += dt; S.ban = null; S.flash = Math.max(0, S.flash - dt * 3);
      for (const s of c.strikes) if (!s.done && c.t >= s.t) { s.done = 1; sfxPlay('thunder'); }
      if (!c.hit && c.t >= SS_HIT) { c.hit = 1; sfxPlay('ssjhit'); kick(18); MUS.want('boss'); }
      if (c.t >= SS_T) { cMark('ssj'); V2.sc = null; S.inv = Math.max(S.inv || 0, 1.5); } return; }
    const r = _u(dt);
    if (V2.ssjT >= 0) {   // the original cutscene just triggered: take it over
      V2.ssjT = -1; const beats = [0, .72, 1.3, 1.78, 2.16, 2.46, 2.68, 2.84];
      V2.sc = { t: 0, hit: 0, rub: mkRubble(22, 90, (Math.random() * 100) | 0), strikes: beats.slice(1).map((t, i) => ({ t: t + .02, a: (i % 2 ? 1 : -1) * (.5 + Math.random() * .9), d: 30 + Math.random() * 60, done: 0 })) };
      MUS.want('quiet');
    }
    return r;
  }; }
{ const _st = start; start = function (a) { V2.bc = null; V2.sc = null; return _st(a); }; }

/* ---------- drawing ---------- */
function drawBossCut() {
  const b = V2.bc, e = b.e, t = b.t, T = b.T, fin = b.fin, col = (BAURA[b.k] || '255,200,255'), nm = CUTF[b.k];
  const cx = S.p.x - W / 2, cy = S.p.y - H / 2, inK = ez(t / .5), outK = 1 - ez((t - (T - .4)) / .4), k = Math.min(inK, outK);
  const push = ez(t / (fin ? 2.6 : 1.6)) * outK, Z = 1 + (fin ? .8 : .5) * push, tx = W / 2, ty = H * .56;
  const bx = (e.x - cx) + (tx - (e.x - cx)) * push, by = (e.y - cy) + (ty - (e.y - cy)) * push, rev = fin ? t >= 3 : t >= 1.4;
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  // the sky darkens
  ctx.fillStyle = `rgba(${fin ? '6,2,14' : '14,4,20'},${(fin ? .82 : .72) * k})`; ctx.fillRect(0, 0, W, H);
  if (fin) { const vg = ctx.createRadialGradient(bx, by, Math.min(W, H) * (.5 - .25 * push), bx, by, Math.hypot(W, H) * .6); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${.75 * k})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); }
  // ground cracks + aura
  cracks(bx, by + e.r * Z * .9, ez(t / (fin ? 2.8 : 1.4)), `rgba(${col},${.6 * k})`, Z);
  LT(); const ar = e.r * Z * (2 + 1.4 * ez(t / 2) + .2 * Math.sin(t * 24)); gl('rd', bx, by, ar * 1.3, .35 * k); ctx.globalAlpha = k; ctx.fillStyle = `rgba(${col},.25)`; ctx.beginPath(); ctx.arc(bx, by, ar, 0, 7); ctx.fill(); ctx.globalAlpha = 1; NM();
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283, fl = .6 + .4 * Math.sin(t * 20 + i * 1.7), len = e.r * Z * (1.2 + 1.6 * ez(t / 1.5)) * fl;
    ctx.save(); ctx.translate(bx + Math.cos(a) * e.r * .7 * Z, by + Math.sin(a) * e.r * .4 * Z + e.r * .5 * Z); const g = ctx.createLinearGradient(0, 0, 0, -len); g.addColorStop(0, `rgba(${col},${.8 * k})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-5 * Z, 0); ctx.quadraticCurveTo(-3 * Z, -len * .6, Math.sin(t * 15 + i) * 4, -len); ctx.quadraticCurveTo(3 * Z, -len * .6, 5 * Z, 0); ctx.fill(); ctx.restore(); }
  // rubble rises (final forms) and blasts away on the reveal
  drawRubble(b.rub, bx, by + e.r * Z * .8, t, .5, T, fin && t > 3 ? (t - 3) / .8 : 0, Z);
  // lightning around the boss
  for (const s of b.strikes) { const age = t - s.t; if (age < 0 || age > .18) continue; const x1 = bx + Math.sin(s.a) * s.d * Z, y1 = by + e.r * Z * .6;
    bolt(x1 + (Math.random() - .5) * 60, -10, x1, y1, 'rgba(210,190,255,1)', 4, (1 - age / .18) * FLM());
    if (age < .06) { ctx.fillStyle = `rgba(230,220,255,${.25 * FLM()})`; ctx.fillRect(0, 0, W, H); } }
  // the boss: a silhouette until the reveal
  ctx.save(); ctx.translate(bx + (rev ? 0 : (Math.random() - .5) * 2.5), by); ctx.scale(Z, Z);
  if (fin && !rev) silhouette(() => enemy(e, 0, 0)); else enemy(e, 0, 0);
  ctx.restore();
  if (fin && !rev) { LT(); gl('wh', bx, by - e.r * Z * .9, 6 * Z, .9); NM(); }   // glowing eyes in the dark
  // reveal: shockwave + flash
  const rt = fin ? 3 : 1.4, ra = t - rt;
  if (ra >= 0 && ra < .7) { const u = ra / .7; ctx.strokeStyle = `rgba(255,255,255,${1 - u})`; ctx.lineWidth = 10 * (1 - u) + 2; ctx.beginPath(); ctx.ellipse(bx, by + e.r * Z * .5, (40 + 520 * u) * Z * .7, (16 + 200 * u) * Z * .7, 0, 0, 7); ctx.stroke();
    if (ra < .35) { ctx.fillStyle = `rgba(255,250,240,${(1 - ra / .35) * .85 * FLM()})`; ctx.fillRect(0, 0, W, H); } }
  letterbox(k);
  title(nm[0], nm[1], (rev ? ez((t - rt - .1) / .25) : 0) * outK, fin ? ['#ffd8f0', '#c040ff', '#200030'] : ['#fff3b0', '#ff8a1f', '#5a0e08']);
  if (cSeen(b.k)) { ctx.font = 'bold 12px "Trebuchet MS",sans-serif'; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillText('tap to skip', W - 14, H * .11 * k + 18); }
  ctx.restore();
}
function drawSSCut() {
  const c = V2.sc, t = c.t, hero = S.hero, v = (SSV[hero] || SSV.goku)(), XF = typeof XFORM != 'undefined' && XFORM[hero];
  const col = hero == 'kri' ? '235,245,255' : hero == 'pic' ? '255,150,60' : XF ? XF[1] : '255,220,70', name = v[0];
  const px = W / 2, py = H / 2, outK = 1 - ez((t - (SS_T - .45)) / .45), k = Math.min(ez(t / .4), outK);
  const Z = 1 + 1.05 * ez(t / 2.6) * (t > SS_HIT ? Math.max(0, 1 - (t - SS_HIT) / .8) : 1), beat = Math.max(0, ...c.strikes.map(s => t >= s.t - .02 ? Math.max(0, 1 - (t - s.t + .02) / .25) : 0), t < .25 ? 1 - t / .25 : 0);
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = `rgba(10,6,4,${.72 * k})`; ctx.fillRect(0, 0, W, H);
  // the heartbeat pulses the edges of the screen
  const vg = ctx.createRadialGradient(px, py, Math.min(W, H) * (.32 - .06 * beat), px, py, Math.hypot(W, H) * .6); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(${t < SS_HIT ? '120,30,10' : col},${(.45 + .4 * beat) * k})`);
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(px, py); ctx.scale(Z, Z); ctx.translate(-px, -py);
  cracks(px, py + 20, ez(t / 2.6), `rgba(${col},${.5 + .4 * ez(t / 2.6)})`, 1);
  drawRubble(c.rub, px, py + 22, t, .3, SS_T, t > SS_HIT ? (t - SS_HIT) / .7 : 0, 1);
  LT(); const kk = ez(t / 2.4), ar = 40 + 60 * kk + 8 * beat + 6 * Math.sin(t * 30); gl(hero == 'kri' ? 'wh' : 'or', px, py, ar * 2.2, .6 * kk); gl('wh', px, py, ar, .45 + .3 * Math.sin(t * 25));
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, fl = .6 + .4 * Math.sin(t * 20 + i * 1.7), len = (30 + 55 * kk + 18 * beat) * fl;
    ctx.save(); ctx.translate(px + Math.cos(a) * 22, py + Math.sin(a) * 14 + 10); const g = ctx.createLinearGradient(0, 0, 0, -len); g.addColorStop(0, `rgba(${col},.9)`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-4, -len * .6, Math.sin(t * 15 + i) * 4, -len); ctx.quadraticCurveTo(4, -len * .6, 6, 0); ctx.fill(); ctx.restore(); }
  NM();
  // Gohan: Super Saiyan 2 static sparks
  if (hero == 'gohan' && t > 1) { ctx.save(); ctx.strokeStyle = 'rgba(190,230,255,.95)'; ctx.lineWidth = 1.6; for (let n = 0; n < 3; n++) { const a = Math.random() * 6.283; let x = px + Math.cos(a) * 18, y = py + Math.sin(a) * 26 - 6; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 4; j++) { x += (Math.random() - .5) * 14; y += (Math.random() - .5) * 14; ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore(); }
  // the hero, crouched and shaking until the burst
  { const ss = S.ssj; if (t < SS_HIT) S.ssj = 0; ctx.save(); ctx.translate(px + (t < SS_HIT ? (Math.random() - .5) * 3 * kk : 0), py + (t < SS_HIT ? 4 * kk : 0)); if (t < SS_HIT) ctx.scale(1 + .08 * kk, 1 - .06 * kk); gokuSprite(ctx, 0, 0, S.p.face, S.t); ctx.restore(); S.ssj = ss; }
  ctx.restore();
  // golden lightning on the beats
  for (const s of c.strikes) { const age = t - s.t; if (age < 0 || age > .16) continue; const x1 = px + Math.sin(s.a) * s.d * Z;
    bolt(x1 + (Math.random() - .5) * 50, -10, x1, py + 10 * Z, hero == 'kri' ? 'rgba(235,245,255,1)' : 'rgba(255,220,90,1)', 4, (1 - age / .16) * FLM()); }
  // golden burst
  if (t > SS_HIT - .15 && t < SS_HIT + .7) { const u = (t - SS_HIT + .15) / .85; ctx.fillStyle = `rgba(${hero == 'kri' ? '255,255,255' : '255,246,200'},${Math.max(0, 1 - Math.abs(u - .2) / .8) * .9 * FLM()})`; ctx.fillRect(0, 0, W, H);
    if (t > SS_HIT) { const w = (t - SS_HIT) / .7; ctx.strokeStyle = `rgba(${col},${1 - w})`; ctx.lineWidth = 12 * (1 - w) + 2; ctx.beginPath(); ctx.ellipse(px, py + 16, 40 + 480 * w, 16 + 190 * w, 0, 0, 7); ctx.stroke(); } }
  letterbox(Math.min(1, t * 3) * outK);
  const ta = (t > SS_HIT + .05 ? ez((t - SS_HIT - .05) / .2) : 0) * outK;
  title(name, '', ta, hero == 'kri' ? ['#ffffff', '#c8e0ff', '#203050'] : ['#fffbd0', '#ffc21f', '#5a2a00']);
  if (ta > 0) { ctx.save(); ctx.globalAlpha = ta; ctx.font = 'italic bold ' + Math.round(Math.min(20, W * .045)) + 'px "Trebuchet MS",sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.75)';
    ctx.strokeText('"' + v[1] + '"', W / 2, H * .72); ctx.fillStyle = '#fff3d8'; ctx.fillText('"' + v[1] + '"', W / 2, H * .72); ctx.restore(); }
  if (cSeen('ssj')) { ctx.font = 'bold 12px "Trebuchet MS",sans-serif'; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillText('tap to skip', W - 14, H * .11 + 18); }
  ctx.restore();
}
{ const _d = draw; draw = function () { _d(); if (S.mode != 'play' && S.mode != 'pause') return; if (V2.bc) drawBossCut(); else if (V2.sc) drawSSCut(); }; }

/* ---------- skipping ---------- */
function cutSkip() {
  if (V2.bc && cSeen(V2.bc.k) && V2.bc.t < V2.bc.T - .5) { V2.bc.t = V2.bc.T - .5; for (const s of V2.bc.strikes) s.done = 1; V2.bc.boomd = 1; return true; }
  if (V2.sc && cSeen('ssj') && V2.sc.t < SS_T - .5) { if (!V2.sc.hit) { V2.sc.hit = 1; sfxPlay('ssjhit'); MUS.want('boss'); } V2.sc.t = SS_T - .5; for (const s of V2.sc.strikes) s.done = 1; return true; }
  return false;
}
cv.addEventListener('pointerdown', () => { if (S.mode == 'play' && (V2.bc || V2.sc)) cutSkip(); });
// capture phase: while a cutscene plays, Space/Enter/Esc skip it and never reach the Ki Burst / pause handlers
addEventListener('keydown', e => { if (S.mode != 'play' || !(V2.bc || V2.sc)) return; if (e.key == ' ' || e.key == 'Enter' || e.key == 'Escape' || e.key == 'e' || e.key == 'E' || e.key == 'p' || e.key == 'P') { e.preventDefault(); e.stopImmediatePropagation(); cutSkip(); } }, true);
{ const _uf = ultFire; ultFire = function () { if (V2.bc || V2.sc) return; return _uf(); }; }

// Draws whatever fn paints as a solid black silhouette. ctx.filter does nothing on iPhone Safari, so instead:
// park the frame so far, paint fn onto a clear canvas, black out its pixels, then put the frame back behind it.
const SIL_B = mk(1, 1);
function silhouette(fn) {
  if (SIL_B.width != cv.width || SIL_B.height != cv.height) { SIL_B.width = cv.width; SIL_B.height = cv.height; }
  const b = SIL_B.getContext('2d'); b.clearRect(0, 0, SIL_B.width, SIL_B.height); b.drawImage(cv, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.restore();
  fn();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.globalCompositeOperation = 'destination-over'; ctx.drawImage(SIL_B, 0, 0); ctx.restore();
}
