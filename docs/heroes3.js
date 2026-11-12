/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — NEW HEROES (EXPANSION_PLAN.md §5.3-5.4)
   Vegeta: Galick Gun, Saiyan Pride, Big Bang Attack, Super Saiyan.
   Krillin: Destructo Disc, Lucky Monk, Solar Flare burst, Potential Unlocked.
   ===================================================================== */
'use strict';

const HERO3 = {
  vegeta: { n: 'Vegeta', u: 'h:vegeta', w: 'galick', d: 'Saiyan Pride: +20% damage to bosses and elites, heals 20% HP per boss defeated. Galick Gun fires 20% faster.' },
  kri: { n: 'Krillin', u: 'h:krillin', w: 'disc', d: 'Lucky Monk: +1 reroll per run, treasure chests give an extra level, better luck on rarities.' }
};
// transformation name + aura colour (used by FORM(), the SSJ cutscene and the aura)
const XFORM = { vegeta: ['SUPER SAIYAN', '255,220,70'], kri: ['POTENTIAL UNLOCKED', '235,245,255'] };

/* ---------- art: heads ---------- */
function head3(c, x, y, s, mood, ssj, rot, P, kind) {
  P = P || {}; const V = kind == 'veg', K = kind == 'kri', yl = mood == 'yell', sm = mood == 'smile' && !V, fi = mood == 'fight' || yl || V, hs = P.hs || 0;
  const HT = ssj && V ? ['#fffbc8', '#ffd93c', '#d8960c'] : ['#646ba0', '#2a2c3a', '#111118'], SKt = ['#fff0dc', '#fcd6ae', '#e3a07a'];
  c.save(); c.translate(x, y); c.rotate(rot || 0); c.scale(s, s); c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = OL; c.lineWidth = 1.5;
  if (V) { // tall flame of hair swept straight up
    c.save(); c.transform(1, 0, hs * .012, 1, 0, 0); c.translate(0, 4); c.scale(.93, 1.13); c.translate(0, -4);
    hpoly(c, [[-11, 4], [-13.5, -2], [-15.5, -10], [-18.5, -15], [-14.5, -18], [-16, -25], [-11, -25.5], [-10.5, -32], [-5.5, -30], [-2.5, -38], [1.5, -31], [5.5, -37], [7, -29.5], [12, -31], [11.2, -24], [16.5, -23.5], [14.2, -16.5], [18.5, -14], [15.2, -8.5], [13.5, -2], [11, 4]], HT);
    hairShine(c, [[-2, -26], [-1.5, -35], [1, -27]], HT[0], .65); hairShine(c, [[-11, -18], [-12.5, -24], [-8, -20]], HT[0], .5); hairShine(c, [[8, -22], [10.5, -28], [11, -20]], HT[0], .4);
    strand(c, [[-5, -10], [-7, -22]], 'rgba(0,0,0,.45)'); strand(c, [[4, -10], [6, -21]], 'rgba(0,0,0,.45)'); strand(c, [[-11, -6], [-15, -13]], 'rgba(0,0,0,.4)'); strand(c, [[11, -6], [15, -13]], 'rgba(0,0,0,.4)');
    c.restore();
  }
  for (const q of [-1, 1]) { hell(c, q * 11.6, 4.6, 2.4, 3.1, ['#fde0c2', '#f6c49c', '#d8946e']); c.strokeStyle = 'rgba(150,70,50,.6)'; c.lineWidth = .8; c.beginPath(); c.arc(q * 11.8, 4.6, 1, -1.2, 1.2); c.stroke(); c.strokeStyle = OL; }
  c.beginPath(); c.moveTo(-11.3, -1); c.bezierCurveTo(-12, 6, -8.4, 12.4, 0, 12.8); c.bezierCurveTo(8.4, 12.4, 12, 6, 11.3, -1);
  if (K) c.bezierCurveTo(11.8, -17.5, -11.8, -17.5, -11.3, -1); else c.bezierCurveTo(10, -9.4, -10, -9.4, -11.3, -1);
  c.closePath();
  { const g = c.createLinearGradient(-8, -10, 9, 12); g.addColorStop(0, SKt[0]); g.addColorStop(.5, SKt[1]); g.addColorStop(1, SKt[2]); c.fillStyle = g; c.fill(); c.lineWidth = 1.5; c.stroke(); }
  c.fillStyle = 'rgba(236,110,100,.26)'; c.beginPath(); c.ellipse(-7.2, 8.8, 2.5, 1.5, 0, 0, 7); c.ellipse(7.2, 8.8, 2.5, 1.5, 0, 0, 7); c.fill();
  if (K) { // bald shine + six dots
    c.save(); c.globalAlpha = .55; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(-4.6, -8.4, 3.6, 1.8, -.5, 0, 7); c.fill(); c.restore();
    c.fillStyle = '#b8603a'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc((i % 3 - 1) * 2.6, -8 + (i > 2 ? 2.4 : 0), .8, 0, 7); c.fill(); }
  }
  if (V) { // widow's peak hairline
    hpoly(c, [[-12, 2], [-12.6, -7], [-8, -12.5], [0, -14], [8, -12.5], [12.6, -7], [12, 2], [10.4, -2.5], [7.6, -7.6], [3.6, -8.4], [0, -3], [-3.6, -8.4], [-7.6, -7.6], [-10.4, -2.5]], HT);
    hairShine(c, [[-8, -10.5], [-3.6, -12.4], [-6.4, -8.4]], HT[0], .5);
  }
  if (!K) { c.fillStyle = 'rgba(70,30,20,.22)'; c.beginPath(); c.ellipse(0, -.4, 9.6, 1.6, 0, 0, 3.1416); c.fill(); }
  // eyes (Vegeta: narrower, always scowling)
  const eyeH = V ? 2.2 : sm ? 2.3 : fi ? 2.55 : 3, IR = ssj && V ? ['#8cf2e8', '#13a4a6', '#08555e'] : ['#5a6285', '#1a1a26', '#06060a'];
  for (const q of [-1, 1]) { const ex = q * 5, ey = 4.7 + (fi ? .2 : 0);
    c.save(); c.beginPath(); c.ellipse(ex, ey, 3.15, eyeH, q * (fi ? .14 : .05), 0, 7); c.fillStyle = '#fffdf4'; c.fill(); c.lineWidth = .9; c.stroke(); c.clip();
    const ig = c.createRadialGradient(ex + .6, ey - .7, .3, ex + .8, ey + .2, 3.1); ig.addColorStop(0, IR[0]); ig.addColorStop(.5, IR[1]); ig.addColorStop(1, IR[2]);
    c.fillStyle = ig; c.beginPath(); c.ellipse(ex + .5, ey + .2, 2.05, 2.8, 0, 0, 7); c.fill(); c.fillStyle = '#050508'; c.beginPath(); c.ellipse(ex + .7, ey + .25, 1, 1.45, 0, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(ex + .05, ey - .95, .9, 0, 7); c.fill(); c.fillStyle = 'rgba(60,20,10,.28)'; c.fillRect(ex - 4, ey - 4, 8, 2.2); c.restore();
    c.strokeStyle = OL; c.lineWidth = 2; c.beginPath(); c.ellipse(ex, ey, 3.25, eyeH + .1, q * (fi ? .14 : .05), 3.3, 6.12); c.stroke();
    const by = V ? [-1.6, 2.6] : fi ? [-.7, 1.8] : sm ? [-.4, -.3] : [.2, .9];
    c.fillStyle = K ? '#3a2a20' : HT[2]; c.lineWidth = .8; c.beginPath(); c.moveTo(q * 9.4, by[0] - .6); c.lineTo(q * 9.4, by[0] + .9); c.quadraticCurveTo(q * 5.8, by[1] + 1.4, q * 2, by[1] + .9); c.lineTo(q * 2.2, by[1] - .9); c.quadraticCurveTo(q * 5.8, by[0] - .8, q * 9.4, by[0] - .6); c.closePath(); c.fill(); c.stroke(); }
  if (V && PAL.sv) { // scouter: ear piece + green lens
    c.fillStyle = '#d8d8e0'; c.beginPath(); c.ellipse(-12.2, 3.6, 2.6, 3.6, 0, 0, 7); c.fill(); c.lineWidth = 1.1; c.stroke();
    c.beginPath(); c.moveTo(-12.4, .2); c.lineTo(-8.6, -.6); c.lineWidth = 1.4; c.stroke();
    c.fillStyle = 'rgba(70,230,110,.6)'; c.beginPath(); c.moveTo(-8.8, -.8); c.lineTo(-1.6, .4); c.lineTo(-1.8, 7.2); c.lineTo(-9.2, 6.2); c.closePath(); c.fill(); c.lineWidth = 1; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(-7.4, .6, 2.2, 1); c.strokeStyle = OL; }
  if (!K) { c.strokeStyle = 'rgba(150,80,55,.85)'; c.lineWidth = .9; c.beginPath(); c.moveTo(-.4, 7.6); c.lineTo(.8, 8.3); c.stroke(); }
  c.strokeStyle = OL; c.lineWidth = 1.3;
  if (yl) { c.beginPath(); c.ellipse(0, 10.9, 3.3, 2.5, 0, 0, 7); c.fillStyle = '#7a1414'; c.fill(); c.stroke(); c.save(); c.clip(); c.fillStyle = '#fff'; c.fillRect(-3.3, 8.3, 6.6, 1.5); c.restore(); }
  else if (V) { c.beginPath(); c.moveTo(-3.2, 10.6); c.quadraticCurveTo(.2, 11, 3.4, 9.1); c.stroke(); }   // smirk
  else if (sm) { c.beginPath(); c.moveTo(-4, 9.6); c.quadraticCurveTo(0, 14.2, 4, 9.6); c.closePath(); c.fillStyle = '#7a1414'; c.fill(); c.stroke(); c.fillStyle = '#fff'; c.fillRect(-3, 9.8, 6, 1.2); }
  else { c.beginPath(); c.moveTo(-2.9, 10.4); c.quadraticCurveTo(.6, 12.2, 3.2, 9.8); c.stroke(); }
  c.restore();
}

/* ---------- art: Vegeta's body (Namek-era armour: no shoulder pads, no scouter) ---------- */
function vegBody(c, P, ssj) {
  const o = P.l || 0, b = P.b || 0, tw = P.t || 0, sq = P.sq || 1;
  const SV = !!PAL.sv, SU = tones(SV ? '#1f2c66' : '#2c3f9c'), AR = tones('#f8f8f4', '#6a6a8a'), GD = SV ? tones('#c99a52', '#5a3a14') : tones('#e8c24a', '#6a4a10'), WH = tones('#ffffff', '#7a7a9a'), SK = ['#fff0dc', '#fcd6ae', '#e0a078'];
  const sx = y => o * (1 - .45 * Math.max(0, Math.min(1, (y + 5) / 14)));
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = OL; c.lineWidth = 1.5;
  c.translate(0, 24); c.scale(.96 * (1 + (1 - sq) * .55), .96 * sq); c.translate(0, -24);
  const arm = i => { const sh = [(i ? 9.4 : -9.4) + o, -3.2 + b], h = P.h[i], el = ik(sh[0], sh[1], h[0], h[1], 5.8, 5.8, P.ed ? P.ed[i] : 1), ang = Math.atan2(h[1] - el[1], h[0] - el[0]);
    hlimb(c, [sh, el], 6.2, SU); hlimb(c, [el, h], 5.8, WH); fist(c, h[0] + Math.cos(ang) * .6, h[1] + Math.sin(ang) * .6, ang, 3.1, WH); };
  arm(0);
  for (let i = 0; i < 2; i++) { const f = P.ft[i], ax = f[0], ay = f[1], fa = f[2] || 0, hip = [(i ? 4 : -4) + o * .45, 9 + b], kn = ik(hip[0], hip[1], ax, ay - 2.4, 6.9, 6.9, -1);
    hlimb(c, [hip, kn, [ax, ay - 2.4]], 8.6, SU);
    c.save(); c.translate(ax, ay); c.rotate(fa); c.lineWidth = 1.6; c.strokeStyle = OL;
    hpoly(c, [[-4.4, -7.4], [4.2, -7.4], [4.7, -1], [6.8, 2.1], [-6, 2.5], [-4.9, -1]], WH);
    hpoly(c, [[3, -1.2], [4.7, -1], [6.8, 2.1], [2.4, 2.4]], GD, { lw: 1 });
    c.fillStyle = '#4a4a62'; c.beginPath(); c.moveTo(-6.6, 2); c.lineTo(7.4, 1.6); c.lineTo(7.4, 2.6); c.lineTo(-6.6, 3.1); c.fill();
    c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(-3.4, -5.4, 1.6, 5.4); c.restore(); }
  // suit, then chest armour with the gold abdominal guard
  hpoly(c, [[-9.4 + sx(-5), -5 + b], [9.4 + sx(-5), -5 + b], [8.6 + sx(3), 3 + b], [9.4 + sx(9), 9.8 + b], [-9.4 + sx(9), 9.8 + b], [-8.6 + sx(3), 3 + b]], SU);
  hpoly(c, [[-10 + sx(-5), -5.8 + b], [10 + sx(-5), -5.8 + b], [9.4 + sx(2), 2.4 + b], [-9.4 + sx(2), 2.4 + b]], AR);
  hpoly(c, [[-9.4 + sx(2), 2.4 + b], [9.4 + sx(2), 2.4 + b], [9 + sx(6), 7 + b], [-9 + sx(6), 7 + b]], GD);
  c.strokeStyle = 'rgba(90,70,20,.6)'; c.lineWidth = .9; c.beginPath(); c.moveTo(-8.8 + sx(4), 4.7 + b); c.lineTo(8.8 + sx(4), 4.7 + b); c.moveTo(sx(3), 2.4 + b); c.lineTo(sx(6), 7 + b); c.stroke();
  c.strokeStyle = 'rgba(90,90,130,.45)'; c.beginPath(); c.moveTo(-5 + sx(-3), -2 + b); c.quadraticCurveTo(sx(-1), .4 + b, 5 + sx(-3), -2 + b); c.stroke(); c.strokeStyle = OL;
  for (const q of [-1, 1]) hpoly(c, [[q * 5.6 + sx(-5), -6.6 + b], [q * 10.4 + sx(-5), -6.4 + b], [q * 11.2 + sx(-4), -3.2 + b], [q * 6.4 + sx(-4), -3.6 + b]], GD, { lw: 1.1 });
  hpoly(c, [[-3 + sx(-5), -9 + b], [3 + sx(-5), -9 + b], [3.4 + sx(-5), -4.4 + b], [-3.4 + sx(-5), -4.4 + b]], SK, { ns: 1 });
  arm(1);
  if (SV) for (const q of [-1, 1]) { // Saiyan-saga armour: big flared shoulder pads
    hpoly(c, [[q * 5.6 + sx(-6), -8.2 + b], [q * 12.4 + sx(-7), -10.6 + b], [q * 18.2 + sx(-6), -7.4 + b], [q * 18.4 + sx(-3), -1.2 + b], [q * 13.6 + sx(-2), .6 + b], [q * 8.6 + sx(-3), -2.8 + b]], GD, { lw: 1.2 });
    c.strokeStyle = 'rgba(70,40,10,.55)'; c.lineWidth = .9; c.beginPath(); c.moveTo(q * 8.4 + sx(-6), -6.6 + b); c.lineTo(q * 16.6 + sx(-4), -3.2 + b); c.stroke(); c.strokeStyle = OL; }
  head3(c, o * .85 + (P.hx || 0), -13.2 + b + (P.hy || 0), .86, P.mo ? 'yell' : P.fi ? 'fight' : 'idle', ssj, P.hd || 0, P, 'veg');
  c.restore();
}

// route the shared hero painter to the new heroes
{ const _gh = gokuHead; gokuHead = function (c, x, y, s, mood, ssj, rot, P) {
    if (PAL.kri) return head3(c, x, y, s, mood, 0, rot, P, 'kri');
    if (PAL.veg) return head3(c, x, y, s, mood, ssj, rot, P, 'veg');
    return _gh(c, x, y, s, mood, ssj, rot, P); }; }
{ const _gb = gokuBody; gokuBody = function (c, P, ssj) {
    if (PAL.veg) return vegBody(c, P, ssj);
    if (PAL.kri) { c.save(); c.translate(0, 24); c.scale(.9, .9); c.translate(0, -24); _gb(c, P, 0); c.restore(); return; }   // shorter than Goku
    return _gb(c, P, ssj); }; }
PALS.veg = { or: '#2c3f9c', od: '#1c2a70', bl: '#ffffff', bd: '#c8c8d8', sk: '#fbdcb8', sl: '#2c3f9c', veg: 1 };
PALS.kri = Object.assign({}, PALS.goku, { kri: 1 });
PALS.vegS = Object.assign({}, PALS.veg, { sv: 1 });   // Saiyan-saga armour (secret X8 "Prince's Pride")
const vegAlt = () => typeof P != 'undefined' && P.skin && P.skin.vegeta == 'saiyan' && HAS('alt:vegeta');
// sheets are painted the first time they are needed (each is a 2048x1024 canvas)
const XS = {};
const XSH = {
  vegeta: ssj => { const sv = vegAlt(), k = 'v' + (sv ? 's' : '') + (ssj ? 1 : 0); if (!XS[k]) { XS[k] = mk(2048, 1024); paintSheet(XS[k], sv ? PALS.vegS : PALS.veg, ssj ? 1 : 0); } return XS[k]; },
  kri: () => { if (!XS.k) { XS.k = mk(2048, 1024); paintSheet(XS.k, PALS.kri, 0); } return XS.k; }
};

/* ---------- gameplay ---------- */
{ const _in = init; init = function () {
    _in(); const h = HERO3[S.hero]; if (!h) return;
    S.w.blast = 0; S.w[h.w] = 1; S.cd[h.w] = .8; if (S.U) S.U['w:' + h.w] = 1;   // a hero's signature attack is always in their pool
    if (S.hero == 'kri') S.rr += 1;
  }; }
// Vegeta: Saiyan Pride
{ const _h = hitE; hitE = function (e, d) { if (S.hero == 'vegeta' && (e.boss || e.elite)) d *= 1.2; return _h(e, d); }; }
{ const _k = killE; killE = function (e) { const was = e.dead; _k(e);
    if (!was && e.dead && e.boss && S.hero == 'vegeta' && S.p.hp > 0) { S.p.hp = Math.min(S.p.max, S.p.hp + S.p.max * .2); if (S.nums.length < 40) S.nums.push({ x: S.p.x, y: S.p.y - 26, v: '+HP', l: .9, c: '#7dff8a' }); } }; }
// Krillin: Lucky Monk
{ const _r = rollRar; rollRar = function (luck, minR) { return _r(luck || (S.hero == 'kri' && Math.random() < .3), minR); }; }
{ const _ue = updExtra; updExtra = function (dt) { const open = S.hero == 'kri' ? S.chests.filter(c => !c.got) : null; _ue(dt);
    if (open) { const n = open.filter(c => c.got).length; if (n) S.pend += n; } }; }
{ const _b = ban; ban = function (t) { if (S.hero == 'kri' && t == 'SUPER SAIYAN!') t = 'POTENTIAL UNLOCKED!'; return _b(t); }; }
{ const _ds = drawSSJ; drawSSJ = function (t) { if (S.hero == 'kri') return auraFlames(W / 2, H / 2, t, 1.35, 13, '235,245,255', '255,255,255', 'wh'); return _ds(t); }; }

// Ki Burst: Vegeta's Big Bang Attack (one huge blast on the strongest enemy), Krillin's Solar Flare (blind everything)
{ const _uf = ultFire; ultFire = function () {
    const h = S.hero; if (h != 'vegeta' && h != 'kri') return _uf();
    if (!RU('kiburst') || S.mode != 'play' || (S.ult || 0) < 100) return;
    S.ultK0 = P.kills; S.ultT = S.t; S.ult = 0; S.inv = 1.4; sfx('ban'); sfxPlay('ult'); kick(16);
    const p = S.p, d = (90 + 8 * p.lv) * dm();
    if (h == 'vegeta') {
      let tg = null, best = -1; for (const e of S.en) if (!e.dead && onScr(e)) { const sc = (e.boss ? 1e9 : 0) + e.hp; if (sc > best) { best = sc; tg = e; } }
      S.bb = { x: p.x, y: p.y, sx: p.x, sy: p.y, tx: tg ? tg.x : p.x + (p.face || 1) * 200, ty: tg ? tg.y : p.y, e: tg, t: 0, T: .4, d };
      p.atk = p.ad = .6; if (tg) p.face = tg.x > p.x ? 1 : -1; ban('BIG BANG ATTACK!');
    } else {
      S.flash = Math.max(S.flash, .35);
      for (const e of S.en) if (!e.dead && onScr(e)) { hitE(e, d * .8); e.st = Math.max(e.st || 0, e.boss ? .8 : 2.5); e.mk = 5; }
      for (const q of S.eb) q.l = 0;
      boom(p.x, p.y, 160, '#fff6d0'); S.ultR.push({ x: p.x, y: p.y, t: 0, T: .9 }); ban('SOLAR FLARE!');
    }
  }; }
{ const _u = update; update = function (dt) { _u(dt); const b = S.bb; if (!b || S.mode != 'play') return;
    b.t += dt; if (b.e && !b.e.dead) { b.tx = b.e.x; b.ty = b.e.y; }
    const k = Math.min(1, b.t / b.T); b.x = b.sx + (b.tx - b.sx) * k; b.y = b.sy + (b.ty - b.sy) * k;
    if (k >= 1) { const R = 170 * AR();
      if (b.e && !b.e.dead) hitE(b.e, b.d * 3.5);
      for (const e of S.en) if (!e.dead && e !== b.e && Math.hypot(e.x - b.x, e.y - b.y) < R + e.r) { hitE(e, b.d * 1.2); shove(e, b.x, b.y, 50); }
      boom(b.x, b.y, R, '#bfe0ff'); S.bb = null; } }; }
{ const _d = drawNew; drawNew = function (cx, cy, t) { _d(cx, cy, t); const b = S.bb; if (!b) return;
    const x = b.x - cx, y = b.y - cy; LT(); gl('cy', x, y, 46, .8); gl('cy', x, y, 26, 1); gl('wh', x, y, 14, 1);
    for (let i = 1; i <= 5; i++) gl('cy', x - (b.tx - b.sx) * .04 * i, y - (b.ty - b.sy) * .04 * i, 20 - i * 3, .4 - i * .06); NM(); }; }

/* ---------- menu: unlocked heroes become selectable ---------- */
{ const _sh = setHero; setHero = function (h) { if (HERO3[h] && !HAS(HERO3[h].u)) return; return _sh(h); }; }
