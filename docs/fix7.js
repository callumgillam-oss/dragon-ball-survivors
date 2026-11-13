/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — iPHONE BACKGROUND / RESUME FIXES
   1) Audio stops properly when the game goes to the background (lock screen, swipe home).
      Before: the "playback" audio session + silent keep-alive track kept the page making sound,
      and the music ticker turned the volume straight back up after the hide handler muted it,
      so the music stuttered on and off in the background.
   2) A saved Level 3 / Level 4 / Endless run is offered on launch. The first check runs before
      those levels' scripts load, so it only recognised Levels 1-2.
   3) If a resumed run ever gets stuck on an error every frame, say so on screen (with the error)
      instead of sitting on a frozen picture, so the cause can be reported.
   ===================================================================== */
'use strict';

/* ---------- 1) background audio ---------- */
const BG7 = { hidden: false };
function audioSleep7() {
  BG7.hidden = true;
  try { if (window._sil) window._sil.pause(); } catch (e) { }
  try { if (AC && AC.state == 'running') AC.suspend(); } catch (e) { }
}
function audioWake7() {
  BG7.hidden = false;
  try { if (AC && AC.state != 'running') AC.resume(); } catch (e) { }
  try { if (window._sil && window._sil.paused) { const p = window._sil.play(); if (p && p.catch) p.catch(() => { }); } } catch (e) { }
  try { MUS.sync(); } catch (e) { }
}
document.addEventListener('visibilitychange', () => { if (document.hidden) audioSleep7(); else audioWake7(); });
addEventListener('pagehide', audioSleep7);
addEventListener('pageshow', () => { if (!document.hidden) audioWake7(); });
// the music ticker must never turn the volume back up while the game is in the background
{ const _s = MUS.sync; MUS.sync = function () {
    if (document.hidden || BG7.hidden) { try { if (AC && bus()) BUS.mus.gain.setTargetAtTime(0, AC.currentTime, .05); } catch (e) { } return; }
    return _s.apply(this, arguments);
  }; }
{ const _t = MUS.tick; MUS.tick = function () { if (document.hidden || BG7.hidden) return; return _t.apply(this, arguments); }; }
// sound effects only play when the page is visible (an audio unlock from a stray touch must not wake it in the background)
{ const _ua = unlockAudio; unlockAudio = function () { if (document.hidden) return; return _ua.apply(this, arguments); }; }

/* ---------- 2) offer every saved run, not just Levels 1-2 ---------- */
if (S && S.mode == 'menu' && !svWelcomeOn) { try { svWelcome(); } catch (e) { } }

/* ---------- 3) never sit on a frozen frame silently ---------- */
const ERR7 = { n: 0, shown: '' };
{ const _u = update; update = function (dt) {
    try { const r = _u(dt); ERR7.n = 0; return r; }
    catch (e) { ERR7.n++; ERR7.e = e; throw e; }
  }; }
{ const _l = loop; loop = function (ts) {
    _l(ts);
    if (S.mode == 'play' && ERR7.n > 90 && ERR7.e) {   // ~1.5 s of every frame failing
      const msg = String(ERR7.e && ERR7.e.message || ERR7.e).slice(0, 120), at = String(ERR7.e && ERR7.e.stack || '').split('\n')[1] || '';
      if (ERR7.shown != msg) {
        ERR7.shown = msg;
        let d = document.getElementById('err7');
        if (!d) { d = document.createElement('div'); d.id = 'err7'; d.style.cssText = 'position:fixed;left:8px;right:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);background:#3a0d0d;color:#ffd9d0;border:2px solid #ff7a5a;border-radius:10px;padding:8px 10px;font:12px/1.35 system-ui,sans-serif;z-index:60;white-space:pre-wrap;word-break:break-word'; d.onclick = () => d.remove(); document.body.append(d); }
        d.textContent = 'The game hit an error and is stuck. Please screenshot this and report it (tap to hide):\n' + msg + '\n' + at.trim().slice(0, 160);
      }
    }
  }; }
