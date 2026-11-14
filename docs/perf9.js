/* =====================================================================
   DRAGON BALL SURVIVORS — PERFORMANCE: Level 3/4 mobs as cached frames
   Cell-saga drones/larvae and Buu-saga fighters/imps/blobs were redrawn from
   ~20 paths each, every frame: 230 of them cost ~15 ms on a desktop (far more
   on phones). Like Level 1's art, each mob is now painted once per animation
   frame into a small image and stamped with one drawImage. Whole-body motion
   (bob, facing, rotation) is applied when stamping, so nothing moves differently.
   ===================================================================== */
'use strict';

const MOBC = { m: new Map(), q: 0 };
const MOB_FR = 8, MOB_ANG = 16, MOB_SZ = 60;   // frames per cycle, aim directions, sprite box in art units
const MOB_TAU = 6.283185307179586;
// per kind: the cycle's speed (rad/s in the art code), and how the frame / angle / variant are chosen
const MOB_K = {
  dr: { w: 0, ang: 1 }, drg: { w: 0, ang: 1 },   // drones: bob applied when stamping; eye (and gun) follow the hero
  lv: { w: 22, rot: 1 },                         // larvae: legs/tail wiggle; whole body turns to face the hero
  bb: { w: 7 }, bs: { w: 7 },                    // Buu blobs: squash and stretch
  mj: { w: 12, flip: 1 },                        // Majin fighters: stepping; mirrored to face the hero
  imp: { w: 16 },                                // imps: wing flap; bob applied when stamping
};
// the art's own bob, reproduced when stamping
const mobBob = (e, t, sd) => e.k == 'dr' || e.k == 'drg' ? Math.sin(t * 6 + sd) * 2 : e.k == 'imp' ? Math.sin(t * 5 + sd) * 2 : 0;

function mobFrame(fn, e, f, fr, ai, Q) {
  const k = e.k, r = Math.round(e.r), key = k + '|' + (f ? 1 : 0) + '|' + (e.frz ? 1 : 0) + '|' + fr + '|' + ai + '|' + r + '|' + Q;
  let c = MOBC.m.get(key); if (c) return c;
  const sc = r / 12, B = Math.ceil(MOB_SZ * sc * Q);
  c = mk(B, B); const x = c.getContext('2d'); x.setTransform(Q, 0, 0, Q, B / 2, B / 2);
  const K = MOB_K[k], ph = fr / MOB_FR * MOB_TAU;
  // a stand-in mob: same kind and look, posed by choosing the time / seed / hero position the art reads
  const fe = { k, r, x: 0, y: 0, sd: 0, frz: e.frz, elite: e.elite };
  let t = 0;
  if (k == 'imp') { t = ph / 11; fe.sd = -5 * t; }         // wings at phase ph while the bob (5t + sd) stays at 0
  else if (K.w) t = ph / K.w;
  const a = K.ang ? ai / MOB_ANG * MOB_TAU : 0;
  const st = S.t, sp = S.p; S.t = t; S.p = { x: Math.cos(a) * 100, y: Math.sin(a) * 100 };
  try { fn(fe, 0, 0, f, x); } finally { S.t = st; S.p = sp; }
  if (MOBC.m.size > 900) MOBC.m.clear();   // safety valve: sizes/scales changed a lot
  MOBC.m.set(key, c); return c;
}
function mobStamp(fn, e, x, y, f) {
  const K = MOB_K[e.k]; if (!K) return fn(e, x, y, f);
  const Q = Math.min(2, Math.max(1, Math.round(DPR * 2) / 2));   // crisp at the canvas's own resolution, capped at 2x
  const t = S.t, sd = e.sd ?? (e.sd = Math.random() * 6);
  const fr = K.w ? (((Math.floor(((t * K.w + sd) % MOB_TAU + MOB_TAU) % MOB_TAU / MOB_TAU * MOB_FR)) % MOB_FR) + MOB_FR) % MOB_FR : 0;
  const pa = Math.atan2(S.p.y - e.y, S.p.x - e.x);
  const ai = K.ang ? ((Math.round(pa / MOB_TAU * MOB_ANG) % MOB_ANG) + MOB_ANG) % MOB_ANG : 0;
  const c = mobFrame(fn, e, f, fr, ai, Q), s = c.width / Q;
  ctx.save(); ctx.translate(x, y + mobBob(e, t, sd));   // the art bobs in screen units, before its own scale
  if (K.rot) ctx.rotate(pa);
  if (K.flip && Math.cos(pa) < 0) ctx.scale(-1, 1);
  ctx.drawImage(c, -s / 2, -s / 2, s, s);
  ctx.restore();
}
{ const _3 = drawL3Mob; drawL3Mob = function (e, x, y, f, C) { if (C || SET.mobCache === false) return _3(e, x, y, f, C); mobStamp(_3, e, x, y, f); }; }
{ const _4 = drawL4Mob; drawL4Mob = function (e, x, y, f, C) { if (C || SET.mobCache === false) return _4(e, x, y, f, C); mobStamp(_4, e, x, y, f); }; }

