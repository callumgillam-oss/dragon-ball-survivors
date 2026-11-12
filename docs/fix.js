/* =====================================================================
   DRAGON BALL SURVIVORS 2.0 — RESILIENCE
   1) A single bad frame can never freeze the game: the loop always reschedules itself.
   2) Saved runs are repaired on resume (non-finite positions, Sets that JSON turned into {}).
   3) Re-measure the screen whenever the app comes back to the foreground.
   ===================================================================== */
'use strict';

const fin = v => typeof v == 'number' && isFinite(v);
function sanitizeRun() {
  if (!S || !S.p) return;
  const p = S.p;
  if (!fin(p.x)) p.x = 0; if (!fin(p.y)) p.y = 0;
  if (!fin(p.max) || p.max <= 0) p.max = 100; if (!fin(p.hp)) p.hp = p.max;
  if (!fin(S.t)) S.t = 0;
  for (const k of Object.keys(S)) {
    const a = S[k]; if (!Array.isArray(a)) continue;
    S[k] = a.filter(o => {
      if (!o || typeof o != 'object' || Array.isArray(o)) return true;
      if ('x' in o && !fin(o.x)) return false; if ('y' in o && !fin(o.y)) return false;
      if (k == 'en' && (!fin(o.hp) || !fin(o.max))) return false;
      // JSON turns Sets into {}: give hit-lists back their Set (arrays stay arrays)
      if (o.h && typeof o.h == 'object' && !(o.h instanceof Set) && !Array.isArray(o.h)) o.h = new Set();
      return true;
    });
  }
  if (S.shr && (!fin(S.shr.x) || !fin(S.shr.y))) S.shr = null;
  if (S.bi) S.bi = null;
  joy = null;
}
{ const _w = svWelcome; svWelcome = function () { const r = _w(); if (r) sanitizeRun(); return r; }; }
{ const _r = svResume; svResume = function () { sanitizeRun(); rs(); V2.hs = 0; return _r(); }; }

// crash-proof game loop
{ const _l = loop; loop = function (ts) {
    try { _l(ts); }
    catch (e) {
      V2.errN = (V2.errN || 0) + 1; if (V2.errN < 5) console.error('[recovered]', e);
      try { sanitizeRun(); if (!(W > 0 && H > 0)) rs(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } catch (_) { }
      requestAnimationFrame(loop);
    }
  }; }

// coming back from the background (iOS app switcher, lock screen): re-measure the screen
addEventListener('pageshow', () => rs());
document.addEventListener('visibilitychange', () => { if (!document.hidden) { rs(); setTimeout(rs, 250); joy = null; } });
