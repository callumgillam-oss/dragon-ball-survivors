/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — SOUND PASS
     · a little room reverb on the whole mix so sounds sit in a space instead of beeping dry
     · every attack gets its own voice (most of the newer ones shared one generic "charge" sound)
     · menus click, level-up picks confirm, evolutions and fusions fanfare, a heartbeat warns at low health
     · cutscenes have their own cues (the new intros, King Kai's training)
     · new music: Namek, the city (Level 3), Babidi's ship (Level 4) and a heavier boss theme
   Everything is still synthesised in the browser: no audio files.
   ===================================================================== */
'use strict';

/* ---------- room reverb ---------- */
function verb6() {
  if (!BUS || BUS.rv) return;
  try {
    const len = Math.floor(AC.sampleRate * 1.3), ir = AC.createBuffer(2, len, AC.sampleRate);
    const sc = 1 / Math.sqrt(len * .05);   // scaled by hand so a held note comes back at about its own level (the browser's own normalising makes it far too quiet)
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8) * sc; }
    const cv = AC.createConvolver(); cv.normalize = false; cv.buffer = ir; const wet = AC.createGain(); wet.gain.value = .22; const ms = AC.createGain(); ms.gain.value = .4;
    BUS.sfx.connect(cv); BUS.mus.connect(ms); ms.connect(cv); cv.connect(wet); wet.connect(BUS.comp); BUS.rv = wet;
  } catch (e) { BUS.rv = 1; }
}

/* ---------- sound library ---------- */
const T6 = (ty, f0, f1, d, v, w) => tone(ty, f0, f1, d, v, w), N6 = (d, v, ty, f0, f1, w, q) => noise(d, v, ty, f0, f1, w, 0, q);
const GAP6 = { hit: .045, pop: .03, boom: .06, ui: .03, uiback: .03, swish: .05, wolf: .1, slash: .09, aura: .5, lowhp: .7, masenko: .1, barrier: .25, after: .2, ghost: .15, candy: .12, scatpop: .08, bean: .08, galfire: .2, beam: .2, wave: .12 };
const SND6 = {
  // --- sharper versions of the everyday sounds ---
  hit: (n, r) => { T6('square', 300 * r, 120, .05, .03); T6('sine', 190 * r, 70, .07, .06); N6(.035, .05, 'highpass', 2600); },
  pop: (n, r) => { T6('sine', 430 * r, 110, .09, .07); N6(.07, .05, 'bandpass', 1800, 500); T6('triangle', 920 * r, 600, .04, .02); },
  boom: (n, r) => { N6(.5, .22, 'lowpass', 1600, 70); T6('sine', 112 * r, 32, .42, .24); N6(.12, .11, 'highpass', 3000, 800); T6('triangle', 62, 40, .5, .1); },
  beam: (n) => { N6(.12, .13, 'highpass', 2000); N6(1, .11, 'bandpass', 500, 2600, n, 2); T6('sawtooth', 140, 300, .9, .045); T6('sawtooth', 141.5, 303, .9, .03); T6('sine', 70, 55, .9, .13); T6('sine', 880, 1760, .25, .03); },
  lvl: (n) => { [523, 659, 784, 1047].forEach((f, i) => { T6('square', f, f, .13, .04, n + i * .065); T6('sine', f * 2, f * 2, .16, .025, n + i * .065); }); T6('triangle', 1568, 1568, .4, .04, n + .26); T6('sine', 2093, 2093, .5, .02, n + .3); },
  // --- menus ---
  ui: () => { T6('sine', 880, 660, .05, .035); T6('triangle', 1760, 1320, .03, .012); },
  uiback: () => { T6('sine', 520, 390, .06, .035); },
  uigo: (n) => { T6('sawtooth', 220, 880, .22, .04); N6(.25, .05, 'bandpass', 800, 4000, n, 2); [784, 1047, 1319].forEach((f, i) => T6('triangle', f, f, .18, .045, n + .12 + i * .05)); },
  swish: (n) => { N6(.14, .05, 'bandpass', 1200, 3600, n, 3); },
  pick: (n) => { T6('square', 784, 784, .07, .04); T6('square', 1175, 1175, .14, .04, n + .07); T6('sine', 2349, 2349, .2, .02, n + .07); },
  evo: (n) => { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => { T6('sawtooth', f, f, .2, .035, n + i * .06); T6('triangle', f * 2, f * 2, .22, .03, n + i * .06); }); N6(.9, .07, 'highpass', 5000, 9000, n + .3); T6('sine', 1568, 1568, .8, .04, n + .36); },
  fuse: (n) => { T6('sine', 330, 660, .5, .06); T6('sine', 990, 660, .5, .06); N6(.5, .05, 'bandpass', 600, 3000, n, 3); N6(.7, .22, 'lowpass', 2600, 90, n + .5); T6('sine', 130, 40, .6, .2, n + .5); [523, 659, 784, 1047].forEach(f => { T6('triangle', f, f, .7, .04, n + .5); T6('sawtooth', f, f, .5, .02, n + .5); }); },
  reroll: (n) => { [660, 550, 740].forEach((f, i) => T6('triangle', f, f, .06, .04, n + i * .05)); N6(.12, .03, 'bandpass', 2500, 1200); },
  seal: (n) => { T6('sine', 300, 90, .3, .07); N6(.3, .06, 'bandpass', 900, 200, n, 4); T6('triangle', 1200, 1200, .15, .03, n + .25); },
  bean: (n) => { [659, 880, 1319].forEach((f, i) => T6('sine', f, f * 1.01, .16, .05, n + i * .05)); T6('triangle', 2637, 2637, .25, .015, n + .12); },
  elite: (n) => { T6('square', 880, 880, .08, .03); T6('square', 1175, 1175, .08, .03, n + .1); T6('square', 880, 880, .14, .03, n + .2); },
  lowhp: (n) => { T6('sine', 72, 48, .13, .2); T6('sine', 66, 44, .16, .16, n + .2); },
  // --- attacks ---
  galick: (n) => { T6('sawtooth', 90, 420, .45, .05); T6('square', 45, 210, .45, .03); N6(.45, .05, 'bandpass', 300, 2400, n, 5); },
  galfire: (n) => { N6(.1, .13, 'highpass', 1500); N6(.9, .12, 'bandpass', 400, 1800, n, 2); T6('sawtooth', 110, 220, .8, .05); T6('sawtooth', 112.5, 226, .8, .035); T6('sine', 55, 48, .8, .14); },
  wave: (n) => { N6(.5, .2, 'lowpass', 2400, 120); T6('sine', 160, 40, .45, .2); N6(.35, .08, 'bandpass', 600, 3000, n + .02, 1.5); T6('sawtooth', 300, 90, .3, .04); },
  tri: (n) => { [392, 494, 587].forEach((f, i) => T6('sawtooth', f, f, .5 - i * .08, .03, n + i * .07)); T6('sine', 98, 60, .6, .12, n + .1); N6(.5, .06, 'bandpass', 900, 2000, n + .1, 4); },
  wolf: (n, r) => { N6(.12, .05, 'bandpass', 900, 2600, n, 2); for (let i = 0; i < 3; i++) { T6('square', 260 * r * (1 + i * .12), 110, .045, .04, n + i * .055); N6(.03, .07, 'highpass', 2500, 0, n + i * .055); } },
  slash: (n, r) => { N6(.16, .1, 'bandpass', 5200, 1800, n, 3); T6('sine', 2400 * r, 1300, .14, .03); T6('triangle', 3600, 2000, .08, .015); },
  barrier: (n) => { T6('sine', 660, 440, .25, .04); T6('sine', 990, 660, .25, .025); N6(.2, .03, 'bandpass', 3000, 1500, n, 6); },
  ghost: (n, r) => { for (let i = 0; i < 4; i++) T6('sine', (620 + (i % 2 ? 80 : 0)) * r, 520 + (i % 2 ? 0 : 80), .09, .035, n + i * .08); T6('triangle', 1240, 930, .3, .012); },
  candy: (n) => { T6('sine', 1400, 2400, .12, .04); T6('triangle', 2100, 3200, .1, .02, n + .04); N6(.1, .03, 'highpass', 6000); T6('sine', 880, 1320, .1, .03, n + .1); },
  scatter: (n) => { T6('sine', 300, 900, .3, .05); N6(.3, .04, 'bandpass', 800, 3000, n, 4); },
  scatpop: (n, r) => { for (let i = 0; i < 4; i++) T6('triangle', (900 + i * 140) * r, 400, .06, .03, n + i * .03); N6(.15, .07, 'bandpass', 2500, 800); },
  after: (n) => { N6(.2, .06, 'bandpass', 3000, 600, n, 2); T6('sine', 1300, 400, .16, .03); },
  masenko: (n) => { T6('sawtooth', 500, 1100, .14, .035); N6(.3, .1, 'bandpass', 900, 3000, n + .1, 1.5); T6('sine', 220, 90, .3, .09, n + .1); },
  aura: () => { T6('sine', 140, 90, .22, .06); N6(.2, .035, 'lowpass', 700, 200); },
  sbc: (n) => { T6('sawtooth', 700, 1400, .5, .03); T6('square', 350, 700, .5, .02); N6(.5, .07, 'bandpass', 2500, 5000, n, 6); T6('sine', 90, 60, .5, .1); },
  spirit: (n) => { [523, 659, 784, 988, 1175].forEach((f, i) => T6('sine', f, f * 1.02, .5, .03, n + i * .09)); N6(1, .05, 'bandpass', 1500, 5000, n, 3); T6('sine', 110, 220, 1, .06); },
  // --- bosses ---
  bosscharge: (n) => { T6('sawtooth', 70, 210, .8, .07); T6('square', 52, 156, .8, .04); N6(.8, .07, 'bandpass', 200, 1600, n, 4); for (let i = 0; i < 3; i++) T6('square', 1100, 1100, .05, .028, n + i * .2); },
  absorb: (n) => { T6('sine', 900, 120, .9, .06); T6('sine', 600, 80, .9, .04, n + .1); N6(.9, .06, 'bandpass', 3000, 300, n, 5); },
  gravity: () => { T6('sine', 220, 36, .9, .2); N6(.8, .1, 'lowpass', 500, 80); T6('square', 55, 30, .9, .05); },
  // --- cutscenes ---
  i6shot: (n) => { T6('sawtooth', 1400, 300, .42, .04); N6(.42, .08, 'bandpass', 3000, 800, n, 2); },
  i6fly: (n) => { N6(1.3, .09, 'bandpass', 500, 2400, n, 1.5); T6('sine', 200, 520, 1.2, .035); T6('sine', 203, 528, 1.2, .025); },
  i6land: (n) => { T6('sine', 130, 42, .3, .22); N6(.25, .14, 'lowpass', 900, 150); N6(.4, .05, 'bandpass', 1500, 500, n + .03); },
  i6menace: (n) => { for (const d of [1, 1.5, 1.01]) T6('sawtooth', 73.4 * d, 69.3 * d, 1.6, .055); T6('sine', 36.7, 34, 1.6, .2); N6(.06, .1, 'highpass', 6000); T6('triangle', 1865, 1865, .5, .03); },
  i6wisp: (n) => { T6('sine', 220, 330, 2.2, .03); T6('sine', 277, 415, 2.2, .025); T6('sine', 440, 660, 2.2, .012); N6(2.2, .03, 'bandpass', 1200, 3000, n, 6); },
  i6hatch: (n) => { N6(.2, .1, 'highpass', 3000); N6(1.1, .16, 'lowpass', 300, 90); T6('sawtooth', 48, 40, 1.1, .1); T6('sine', 110, 440, .9, .05, n + .2); T6('sine', 165, 660, .9, .035, n + .2); },
  kkhalo: (n) => { [784, 988, 1175, 1568].forEach((f, i) => { T6('sine', f, f, .9, .04, n + i * .12); T6('sine', f * 2.01, f * 2.01, .6, .012, n + i * .12); }); T6('triangle', 196, 196, 1.4, .05); },
  kkrun: (n) => { N6(1.3, .04, 'bandpass', 600, 2200, n, 1.2); for (let i = 0; i < 12; i++) { N6(.04, .05, 'bandpass', 900 + (i % 2) * 300, 0, n + i * .11, 2); T6('sine', 160, 90, .04, .04, n + i * .11); } },
  kkgrav: (n) => { for (let i = 0; i < 3; i++) { T6('sine', 120, 40, .22, .18, n + i * .42); N6(.16, .09, 'lowpass', 700, 150, n + i * .42); } },
  kkchase: (n) => { for (let i = 0; i < 6; i++) T6('triangle', 700 + (i % 2) * 260, 1000 + (i % 2) * 200, .07, .035, n + i * .16); for (let i = 0; i < 8; i++) N6(.035, .04, 'bandpass', 1100, 0, n + i * .13, 2); },
  kkpower: (n) => { T6('sawtooth', 80, 400, 1.1, .07); T6('square', 60, 300, 1.1, .035); N6(1.1, .09, 'bandpass', 300, 3200, n, 2); T6('sine', 55, 45, 1.1, .14); },
  revive: (n) => { N6(1, .24, 'lowpass', 3200, 100); T6('sine', 130, 36, .9, .22); [523, 659, 784, 1047, 1319].forEach((f, i) => { T6('square', f, f, .3, .04, n + .12 + i * .07); T6('triangle', f * 2, f * 2, .34, .03, n + .12 + i * .07); }); N6(.8, .06, 'highpass', 6000, 9000, n + .2); }
};
const L6 = {};
{ const _sp = sfxPlay; sfxPlay = function (k) {
    const f = SND6[k]; if (!f) return _sp(k);
    if (muted || !SET.sfx || !AC || AC.state != 'running' || !bus()) return; verb6();
    const n = AC.currentTime; if (L6[k] && n - L6[k] < (GAP6[k] || .04)) return; L6[k] = n;
    f(n, 1 + (Math.random() - .5) * .08);
  }; }

/* ---------- hooks: things that made no sound, or the wrong one ---------- */
// menus: every button answers a press
addEventListener('pointerdown', e => { const b = e.target && e.target.closest && e.target.closest('#ov button'); if (!b || b.disabled) return; const oc = b.getAttribute('onclick') || '';
  if (/^(pick|pickFuse|mythic|lbPick|buyU|reroll|sealPick)\(/.test(oc)) return;   // these have their own sounds
  try { sfx(/^start(Endless)?\(|^svResume\(|^resume\(/.test(oc) ? 'uigo' : /^menu\(|^settingsBack\(|^svAbandon\(/.test(oc) ? 'uiback' : 'ui'); } catch (x) { } }, true);
if (typeof carGo == 'function') { const _c = carGo; carGo = function (d) { try { sfx('swish'); } catch (e) { } return _c(d); }; }
{ const _p = pick; pick = function (g, k) { try { sfxPlay(g == 'e' ? 'evo' : 'pick'); } catch (e) { } return _p.apply(this, arguments); }; }
if (typeof mythic == 'function') { const _m = mythic; mythic = function () { try { sfxPlay('evo'); } catch (e) { } return _m.apply(this, arguments); }; }
if (typeof lbPick == 'function') { const _l = lbPick; lbPick = function () { try { sfxPlay('pick'); } catch (e) { } return _l.apply(this, arguments); }; }
{ const _se = spawnElite; spawnElite = function () { const r = _se.apply(this, arguments); try { sfxPlay('elite'); } catch (e) { } return r; }; }
{ const _s = sbcFire; sbcFire = function () { try { sfxPlay('sbc'); } catch (e) { } return _s.apply(this, arguments); }; }
// attacks that fired silently, and the low-health heartbeat
{ const _u = update; update = function (dt) {
    const on = S.mode == 'play', b = on ? [S.mas.length, (S.aims || []).length, S.bar ? S.bar.pulse || 0 : 0, S.cd.aura || 0] : null;
    const r = _u(dt); if (!on || S.mode != 'play') return r;
    if (S.mas.length > b[0]) sfxPlay('masenko');
    if ((S.aims || []).length > b[1]) sfxPlay('after');
    if (S.bar && (S.bar.pulse || 0) > b[2] + .1) sfxPlay('barrier');
    if (S.w.aura && (S.cd.aura || 0) > b[3] + .1) sfxPlay('aura');
    const p = S.p; if (p.hp > 0 && p.hp < p.max * .3) sfxPlay('lowhp');
    return r;
  }; }
// Spirit Bomb's charge gets its own shimmer instead of the shared charge sound
fireSounds = function (before) {
  if (S.sh.length > before.sh) sfxPlay('shot');
  if (S.orbs && S.orbs.length > before.orbs) sfxPlay('orbfire');
  if (S.str && S.str.length > before.str) sfxPlay('thunder');
  if (S.zones && S.zones.some(z => z.f && !z._s)) { for (const z of S.zones) if (z.f && !z._s) z._s = 1; sfxPlay('spirit'); }
  if (S.discs && S.discs.length > before.discs) sfxPlay('disc');
};

/* ---------- music ---------- */
// A second song engine with styles, so the maps don't all sound like the same band:
//   pat[section] = { k, s, h: drum patterns · b: bass style · c: chord style (+cp pattern) · lo: lead octave }
//   lead: 'brass' | 'square' | 'bell'
function gen6(sg, i, t, st, D) {
  const nb = sg.bars.length, bi = Math.floor(i / 16) % nb, c = i % 16, bar = sg.bars[bi], sec = sg.sec[bi], k = sg.root + (sg.tr ? sg.tr[bi] : 0), r = bar[0], third = bar[1] ? 3 : 4, P = sg.pat[sec] || sg.pat.v;
  const on = p => p && p[c % p.length] == 'x';
  if (on(P.k)) tone('sine', 160, 40, .2, .55, t, D);
  if (on(P.s)) { noise(.16, .24, 'bandpass', 2000, 800, t, D, .7); tone('triangle', 200, 120, .08, .1, t, D); }
  if (on(P.h)) noise(.035, c % 4 == 2 ? .065 : .04, 'highpass', 7500, 0, t, D);
  if (c == 0 && (bi == 0 || sg.sec[bi - 1] != sec)) noise(1.1, .14, 'highpass', 4000, 2500, t, D);
  const bass = (n, d) => { const f = NOTE(k - 24 + r + n); tone('sawtooth', f, 0, st * d, .06, t, D); tone('triangle', f, 0, st * (d + .1), .2, t, D); };
  if (P.b == '8') { if (c % 2 == 0) bass(c % 4 == 2 ? 12 : 0, 1.7); }
  else if (P.b == 'oct') { if (c % 2 == 0) bass(c % 4 == 2 ? 12 : 0, 1.2); else if (c % 8 == 7) bass(7, .9); }
  else if (P.b == '4') { if (c % 4 == 0) bass(c == 8 ? 7 : 0, 3.4); }
  else if (P.b == 'long') { if (c == 0) bass(0, 14); }
  if (P.c == 'stab') { if (on(P.cp)) for (const n of [0, 7, 12]) { const f = NOTE(k - 12 + r + n); tone('sawtooth', f, 0, st * 1.6, .042, t, D); tone('sawtooth', f * 1.006, 0, st * 1.6, .028, t, D); } }
  else if (P.c == 'arp') { if (on(P.cp || 'x')) { const f = NOTE(k + r + [0, third, 7, 12][c % 4]); tone('square', f, 0, st * .9, .02, t, D); tone('triangle', f * 2, 0, st * .7, .012, t, D); } }
  else if (P.c == 'pad') { if (c == 0) for (const n of [0, third, 7]) { tone('triangle', NOTE(k + r + n), 0, st * 15.5, .03, t, D); tone('sine', NOTE(k + 12 + r + n), 0, st * 15.5, .012, t, D); } }
  else if (P.c == 'off') { if (c % 4 == 2) for (const n of [0, third, 7]) { const f = NOTE(k + r + n); tone('triangle', f, 0, st * 1.1, .034, t, D); tone('square', f, 0, st * .8, .012, t, D); } }
  const L = bar[2][c];
  if (L >= 0) { let h = 1; while (c + h < 16 && bar[2][c + h] == -2) h++; const f = NOTE(k + L + 12 * (P.lo || 0)), d = st * (h + .35);
    if (sg.lead == 'bell') { const dd = Math.max(d, .28); tone('sine', f, 0, dd, .07, t, D); tone('sine', f * 2, 0, dd * .6, .024, t, D); tone('sine', f * 3.01, 0, .12, .012, t, D); tone('triangle', f, 0, .08, .03, t, D); }
    else if (sg.lead == 'square') { tone('square', f, 0, d, .042, t, D); tone('triangle', f * 2, 0, Math.min(d, st * 2), .02, t, D); tone('square', f * 1.005, 0, d, .016, t, D); }
    else { tone('sawtooth', f, 0, d, .055, t, D); tone('sawtooth', f * 1.005, 0, d, .04, t, D); tone('square', f * .5, 0, d, .018, t, D); if (P.dbl) tone('square', f * 2, 0, d, .02, t, D); } }
}
{ const _g = genStep; genStep = function (sg, i, t, st, D) { if (sg.g6) return gen6(sg, i, t, st, D); return _g(sg, i, t, st, D); }; }
{
  const H = -2, R = -1, E = Array(16).fill(R);
  const song = (o, parts) => { const bars = [], sec = []; for (const [L, s] of parts) for (const b of L) { bars.push(b); sec.push(s); } return Object.assign({ gen: 1, g6: 1, bars, sec }, o); };
  // Namek: bells over slow arpeggios, D minor
  SONGS.namek = song({ bpm: 126, root: 50, vol: .56, lead: 'bell', pat: {
      i: { k: 'x.......x.......', h: '....x.......x...', b: 'long', c: 'pad' },
      v: { k: 'x.....x.x.......', s: '....x.......x...', h: 'x.x.x.x.', b: '4', c: 'arp', cp: 'x.x.x.x.' },
      c: { k: 'x...x.x.x...x...', s: '....x.......x...', h: 'x.xx', b: 'oct', c: 'arp' } } }, [
    [[[0, 1, E], [0, 1, E], [8, 0, E], [10, 0, [R, R, R, R, R, R, R, R, 12, H, 14, H, 15, H, 17, H]]], 'i'],
    [[[0, 1, [19, H, H, H, 17, H, 15, H, 14, H, H, H, 12, H, H, H]], [0, 1, [14, H, 15, H, 17, H, H, H, 19, H, H, H, R, R, R, R]],
      [8, 0, [20, H, H, H, 19, H, 17, H, 15, H, H, H, 17, H, H, H]], [10, 0, [22, H, H, H, 19, H, 17, H, 14, H, H, H, R, R, R, R]],
      [0, 1, [19, H, H, H, 17, H, 15, H, 14, H, H, H, 12, H, H, H]], [3, 0, [15, H, 17, H, 19, H, H, H, 22, H, H, H, 24, H, H, H]],
      [8, 0, [20, H, H, H, 22, H, 20, H, 19, H, H, H, 17, H, H, H]], [7, 0, [19, H, H, H, H, H, H, H, 13, H, 14, H, 19, H, 25, H]]], 'v'],
    [[[0, 1, [24, H, H, R, 24, H, 22, H, 24, H, 27, H, H, H, R, R]], [8, 0, [27, H, H, R, 27, H, 24, H, 22, H, 20, H, H, H, R, R]],
      [3, 0, [24, H, H, R, 24, H, 27, H, 29, H, 27, H, 24, H, 22, H]], [10, 0, [26, H, H, H, H, H, 22, H, R, R, 19, H, 22, H, 24, H]],
      [0, 1, [27, H, H, R, 27, H, 24, H, 27, H, 31, H, H, H, R, R]], [8, 0, [32, H, H, R, 31, H, 29, H, 27, H, H, H, 24, H, H, H]],
      [10, 0, [26, H, H, H, 29, H, H, H, 34, H, H, H, 31, H, 29, H]], [0, 1, [36, H, H, H, H, H, H, H, H, H, H, H, R, R, R, R]]], 'c']]);
  // The city: square-wave lead over a racing arpeggio, E minor
  SONGS.city = song({ bpm: 148, root: 52, vol: .5, lead: 'square', pat: {
      i: { k: 'x...x...x...x...', h: '..x.', b: '8', c: 'arp' },
      v: { k: 'x...x...x...x...', s: '....x.......x...', h: '..x.', b: '8', c: 'arp' },
      c: { k: 'x...x...x...x.x.', s: '....x.......x..x', h: 'x', b: 'oct', c: 'stab', cp: 'x..x..x...x...x.' } } }, [
    [[[0, 1, E], [0, 1, E], [8, 0, E], [10, 0, [R, R, R, R, R, R, R, R, 12, H, 15, H, 19, H, 22, H]]], 'i'],
    [[[0, 1, [12, H, R, 12, 15, H, 12, H, 19, H, H, H, 17, H, 15, H]], [0, 1, [14, H, R, 14, 15, H, 14, H, 12, H, H, H, R, R, R, R]],
      [8, 0, [20, H, R, 20, 19, H, 15, H, 12, H, H, H, 15, H, 19, H]], [10, 0, [22, H, R, 22, 19, H, 17, H, 14, H, H, H, R, R, R, R]],
      [0, 1, [12, H, R, 12, 15, H, 12, H, 19, H, H, H, 22, H, 24, H]], [3, 0, [27, H, H, H, 26, H, 22, H, 19, H, H, H, 22, H, H, H]],
      [8, 0, [24, H, H, H, 20, H, 19, H, 15, H, H, H, 19, H, H, H]], [7, 0, [23, H, H, H, H, H, 19, H, 23, H, 26, H, H, H, R, R]]], 'v'],
    [[[8, 0, [27, H, H, R, 27, H, 24, H, 20, H, 24, H, 27, H, H, H]], [10, 0, [26, H, H, R, 26, H, 22, H, 29, H, H, H, 26, H, H, H]],
      [0, 1, [31, H, H, H, 27, H, 24, H, 31, H, H, H, 27, H, 24, H]], [0, 1, [24, H, H, H, H, H, H, H, R, R, 19, H, 22, H, 24, H]],
      [8, 0, [27, H, H, R, 27, H, 31, H, 32, H, 31, H, 27, H, H, H]], [10, 0, [29, H, H, R, 29, H, 26, H, 34, H, H, H, 29, H, H, H]],
      [7, 0, [35, H, H, H, 31, H, H, H, 26, H, H, H, 23, H, H, H]], [0, 1, [24, H, H, H, H, H, H, H, H, H, H, H, R, R, R, R]]], 'c']]);
  // Babidi's ship: a bouncing, off-kilter tune with "wrong" notes, C# minor with a flat second
  SONGS.buu = song({ bpm: 138, root: 49, vol: .54, lead: 'bell', pat: {
      i: { k: 'x.......x.......', h: '..x.', b: '4', c: 'off' },
      v: { k: 'x.....x.x.....x.', s: '....x.......x...', h: '..x.', b: 'oct', c: 'off' },
      c: { k: 'x...x...x...x...', s: '....x.......x.x.', h: 'x.xx', b: 'oct', c: 'off', lo: 0 } } }, [
    [[[0, 1, E], [0, 1, [R, R, R, R, R, R, R, R, 12, R, 13, R, 12, R, 7, R]]], 'i'],
    [[[0, 1, [12, R, 12, R, 15, R, 12, R, 19, H, H, R, 15, R, 12, R]], [0, 1, [13, R, 12, R, 10, R, 12, R, 7, H, H, H, R, R, R, R]],
      [1, 0, [13, R, 13, R, 17, R, 13, R, 20, H, H, R, 17, R, 13, R]], [0, 1, [12, R, 15, R, 18, R, 15, R, 12, H, H, H, R, R, R, R]],
      [5, 1, [17, R, 17, R, 20, R, 17, R, 24, H, H, R, 20, R, 17, R]], [5, 1, [18, R, 17, R, 15, R, 17, R, 12, H, H, H, R, R, R, R]],
      [1, 0, [13, R, 17, R, 20, R, 25, R, 20, R, 17, R, 13, H, H, H]], [7, 0, [19, H, H, H, 23, H, H, H, 26, H, 23, H, 19, H, H, H]]], 'v'],
    [[[0, 1, [24, H, R, 24, 27, H, 24, H, 31, H, H, H, 27, H, 24, H]], [8, 0, [27, H, R, 27, 24, H, 20, H, 24, H, H, H, R, R, R, R]],
      [10, 0, [26, H, R, 26, 29, H, 26, H, 34, H, H, H, 29, H, 26, H]], [0, 1, [24, H, H, H, H, H, H, H, R, R, 19, R, 22, R, 24, R]],
      [0, 1, [24, H, R, 24, 27, H, 24, H, 31, H, H, H, 36, H, H, H]], [8, 0, [32, H, H, H, 27, H, 24, H, 20, H, H, H, 24, H, H, H]],
      [1, 0, [25, H, R, 25, 29, H, 25, H, 32, H, 29, H, 25, H, H, H]], [7, 0, [31, H, H, H, 26, H, H, H, 23, H, H, H, 19, H, H, H]]], 'c']]);
  // Boss: fast, low brass over hammering chords, E minor with a flat second for menace
  SONGS.boss = song({ bpm: 164, root: 52, vol: .46, lead: 'brass', pat: {
      v: { k: 'x.x.x...x.x.x..x', s: '....x.......x...', h: 'x.x.', b: '8', c: 'stab', cp: 'x..x..x...x.....', lo: -1 },
      c: { k: 'x.x.x.x.x.x.x.xx', s: '....x.......x.x.', h: 'x', b: '8', c: 'stab', cp: 'x..x..x..x..x.x.', lo: -1, dbl: 1 } } }, [
    [[[0, 1, [12, H, 12, 12, R, 12, 15, H, 12, H, 10, H, 12, H, H, R]], [0, 1, [12, H, 12, 12, R, 12, 15, H, 17, H, 15, H, 12, H, H, R]],
      [8, 0, [20, H, 20, 20, R, 20, 19, H, 15, H, 12, H, 15, H, H, R]], [10, 0, [22, H, 22, 22, R, 22, 19, H, 17, H, 14, H, 17, H, H, R]],
      [0, 1, [24, H, 24, 24, R, 24, 27, H, 24, H, 22, H, 24, H, H, R]], [0, 1, [24, H, 24, 24, R, 24, 27, H, 29, H, 27, H, 24, H, H, R]],
      [1, 0, [25, H, H, H, 24, H, 20, H, 17, H, H, H, 13, H, H, H]], [7, 0, [23, H, H, H, H, H, 26, H, 31, H, H, H, 35, H, H, H]]], 'v'],
    [[[8, 0, [32, H, H, H, 31, H, 27, H, 24, H, H, H, 27, H, H, H]], [10, 0, [34, H, H, H, 29, H, 26, H, 22, H, H, H, 26, H, H, H]],
      [0, 1, [36, H, H, H, H, H, 31, H, 27, H, 31, H, 36, H, H, H]], [0, 1, [36, H, H, H, H, H, H, H, R, R, R, R, 31, H, 34, H]],
      [8, 0, [36, H, H, H, 32, H, 31, H, 27, H, H, H, 24, H, H, H]], [10, 0, [34, H, H, H, 29, H, 26, H, 29, H, H, H, 34, H, H, H]],
      [7, 0, [35, H, H, H, H, H, H, H, 31, H, H, H, 35, H, H, H]], [7, 0, [38, H, H, H, H, H, H, H, H, H, H, H, R, R, R, R]]], 'c']]);
}
// each map plays its own song
{ const _w = MUS.want; MUS.want = function (k) { if (k == 'stage' && S) k = S.stage == 3 ? 'city' : S.stage == 4 ? 'buu' : k; return _w.call(this, k); }; }
