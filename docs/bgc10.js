/* =====================================================================
   DRAGON BALL SURVIVORS: CACHED GROUND TILES (2026-11-14)
   The ground (sand/Namek/city/ship tiles, rocks, craters, plants, colour blots) was redrawn from vector art every frame:
   190-430 canvas calls, 30-80 new gradients and dozens of clip() shading passes, on every level, all run long. It never
   changes, so it is now painted once into 128 px world tiles and each frame just stamps the visible ones (25-45). Only the
   two animated glows (Wasteland craters, Namek spore plants) are drawn live on top. The Cell Games ring (it appears and
   disappears) switches the cache off while it is up. Settings → "Ground cache" can turn it off.
   ===================================================================== */
'use strict';

// Point every drawing call made on the main canvas context at another context while fn runs. The ground code draws on
// the global `ctx`, so this lets it paint into a tile without being rewritten. Only used while painting a tile.
const CTXP = CanvasRenderingContext2D.prototype;
const CTXK = Object.getOwnPropertyNames(CTXP).filter(k => k != 'constructor' && k != 'canvas');
function withCtx(t, fn) {
  const own = new Map();
  for (const k of CTXK) {
    const o = Object.getOwnPropertyDescriptor(ctx, k); if (o) { if (!o.configurable) continue; own.set(k, o); }   // e.g. perf9's drawImage wrapper
    const d = Object.getOwnPropertyDescriptor(CTXP, k);
    if (typeof d.value == 'function') Object.defineProperty(ctx, k, { value: function () { return t[k].apply(t, arguments); }, configurable: true, writable: true });
    else if (d.get) Object.defineProperty(ctx, k, { get() { return t[k]; }, set(v) { t[k] = v; }, configurable: true });
  }
  try { fn(); }
  finally { for (const k of CTXK) { const o = Object.getOwnPropertyDescriptor(ctx, k); if (o && o.configurable) delete ctx[k]; } for (const [k, o] of own) Object.defineProperty(ctx, k, o); }
}

const BGC = { m: new Map(), key: '', T: 128, f: 0, painted: 0 };   // 128 px tiles: ~18 MB of tiles on a phone (256 px needed ~37 MB)
function bgcKey(q) { return [S.stage, SET.art || '', S.stage == 4 && typeof mph4 == 'function' ? mph4() : 0, GFX, q].join('|'); }
function bgcPaint(tx, ty, q) {
  const T = BGC.T, N = Math.ceil(T * q) + 2, c = mk(N, N), x = c.getContext('2d');
  // the ground code only draws scenery anchored inside the area it is asked for, and a big piece (a ruined building, a
  // butte) can hang 100+ px over its neighbours; so each tile is painted as part of a wider area and keeps only its square
  const M = 128, wx = tx * T - 1 / q, wy = ty * T - 1 / q, sw = W, sh = H;   // one device pixel of overlap on every side hides seams
  x.setTransform(q, 0, 0, q, -M * q, -M * q);
  W = N / q + 2 * M; H = N / q + 2 * M; BGM = 1;
  try { withCtx(x, () => { bg(wx - M, wy - M); bgDecor(wx - M, wy - M, S.t); }); }
  finally { W = sw; H = sh; BGM = 0; }
  c._x = wx; c._y = wy; c._s = N / q; BGC.painted++;
  return c;
}
{ const _dg = drawGround; drawGround = function (cx, cy, t) {
    if (SET.bgCache === false || S.cgr) return _dg(cx, cy, t);
    const q = Math.max(1, Math.min(2, DPR)), key = bgcKey(q);
    if (key !== BGC.key) { BGC.m.clear(); BGC.key = key; }
    const T = BGC.T, f = ++BGC.f, x0 = Math.floor(cx / T), x1 = Math.floor((cx + W) / T), y0 = Math.floor(cy / T), y1 = Math.floor((cy + H) / T);
    const m = ctx.getTransform(), sx = m.a, sy = m.d;   // snap tiles to whole device pixels (no blur, no seams)
    for (let tx = x0; tx <= x1; tx++) for (let ty = y0; ty <= y1; ty++) {
      const k = tx + ',' + ty; let c = BGC.m.get(k);
      if (!c) { c = bgcPaint(tx, ty, q); BGC.m.set(k, c); }
      c._u = f;
      const dx = Math.round((c._x - cx) * sx + m.e) , dy = Math.round((c._y - cy) * sy + m.f);
      ctx.drawImage(c, (dx - m.e) / sx, (dy - m.f) / sy, c._s, c._s);
    }
    // paint one tile of the ring just outside the view per frame, so walking rarely has to paint several at once
    let done = false;
    for (let tx = x0 - 1; tx <= x1 + 1 && !done; tx++) for (let ty = y0 - 1; ty <= y1 + 1 && !done; ty++) {
      if (tx >= x0 && tx <= x1 && ty >= y0 && ty <= y1) continue;
      const k = tx + ',' + ty; if (!BGC.m.has(k)) { const c = bgcPaint(tx, ty, q); c._u = f; BGC.m.set(k, c); done = true; }
    }
    // keep the view plus that ring; forget tiles not used for a while
    const keep = (x1 - x0 + 3) * (y1 - y0 + 3);
    if (BGC.m.size > keep) { const L = [...BGC.m].sort((a, b) => a[1]._u - b[1]._u); for (let i = 0; i < L.length - keep; i++) BGC.m.delete(L[i][0]); }
    BGM = 2; try { bgDecor(cx, cy, t); } finally { BGM = 0; }   // the animated glows, live
  }; }
// the canvas size / resolution changed: tiles are repainted at the new resolution through the key (q); free the old ones now
{ const _r = rsApply; rsApply = function () { const r = _r.apply(this, arguments); BGC.m.clear(); return r; }; }

/* ---------- Settings toggle ---------- */
{ const _st = settings; settings = function (back) {
    _st(back); const c = ov.querySelector('.card'); if (!c) return; const g = c.querySelector('.sgrid'); if (!g) return;
    const on = SET.bgCache !== false;
    g.insertAdjacentHTML('beforeend', `<button class="srow" onclick="SET.bgCache=${on ? 'false' : 'true'};saveSet();BGC.m.clear();settings()"><span>Ground cache</span><b>${on ? 'On' : 'Off'}</b><small>${on ? 'Faster: the ground is painted once and reused' : 'Redraws the ground every frame (slower)'}</small></button>`);
  }; }
