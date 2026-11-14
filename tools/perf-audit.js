// Draw-cost audit: runs one attack / mob / background / boss at a time and counts what each frame draws.
// Paste into the page console (or inject), then e.g.  PA.attack('blast')  PA.mobs(1,'sai')  PA.bg(3)  PA.boss(2,'fr3')
// Counts are reliable in a hidden or throttled tab; the millisecond figures are only a rough guide.
// Reported per frame: calls (fills + strokes + image/text draws), glow (additive glow sprites), imgPx (screen area covered by
// drawn images, in thousands of CSS px: a fill-rate proxy), grad (gradients created), text (text draws), plus avg / p90 / max.
(function () {
  const C = { on: false, k: {} }, CTX = ctx;
  const cnt = (k, n = 1) => { if (C.on) C.k[k] = (C.k[k] || 0) + n; };
  const ops = ['fill', 'stroke', 'fillRect', 'strokeRect', 'clearRect', 'fillText', 'strokeText', 'createLinearGradient', 'createRadialGradient', 'createPattern', 'save', 'getImageData', 'putImageData'];
  for (const m of ops) { const f = CTX[m]; CTX[m] = function () { if (this === CTX) cnt(m); return f.apply(this, arguments); }; }
  { const f = CTX.drawImage; CTX.drawImage = function (im, a, b, c, d, e, g, h, i) {
      if (this === CTX && C.on) { cnt('drawImage'); const n = arguments.length, w = n == 9 ? h : n == 5 ? c : im.width, hh = n == 9 ? i : n == 5 ? d : im.height;
        const m = this.getTransform(), s = Math.hypot(m.a, m.b) * Math.hypot(m.c, m.d) / (DPR * DPR); cnt('imgPx', Math.abs(w * hh) * s);
        if (this.globalCompositeOperation == 'lighter') cnt('addPx', Math.abs(w * hh) * s); }
      return f.apply(this, arguments); }; }
  { const g = window.gl; window.gl = function () { cnt('glow'); return g.apply(this, arguments); }; }
  const sd = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'shadowBlur');
  Object.defineProperty(CTX, 'shadowBlur', { get() { return sd.get.call(this); }, set(v) { if (v > 0) cnt('shadow'); sd.set.call(this, v); }, configurable: true });
  const fd = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'filter');
  Object.defineProperty(CTX, 'filter', { get() { return fd.get.call(this); }, set(v) { if (v && v != 'none') cnt('filter'); fd.set.call(this, v); }, configurable: true });

  const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))] || 0; };
  const R1 = v => Math.round(v * 10) / 10;
  function frame(rows) {
    S.pend = 0; if (S.mode == 'lvl') S.mode = 'play';
    let t = performance.now(); update(1 / 60); const u = performance.now() - t;
    C.k = {}; C.on = true; t = performance.now(); draw(); const d = performance.now() - t; C.on = false;
    const k = C.k, calls = (k.fill || 0) + (k.stroke || 0) + (k.fillRect || 0) + (k.strokeRect || 0) + (k.drawImage || 0) + (k.fillText || 0) + (k.strokeText || 0);
    rows.push({ calls, glow: k.glow || 0, imgPx: (k.imgPx || 0) / 1000, addPx: (k.addPx || 0) / 1000, grad: (k.createLinearGradient || 0) + (k.createRadialGradient || 0), text: (k.fillText || 0) + (k.strokeText || 0), shadow: k.shadow || 0, filter: k.filter || 0, read: k.getImageData || 0, u, d, en: S.en.length });
  }
  function summ(rows) {
    const o = {}; for (const f of ['calls', 'glow', 'imgPx', 'addPx', 'grad', 'text', 'shadow', 'filter', 'read', 'en']) { const a = rows.map(r => r[f]); o[f] = R1(a.reduce((x, y) => x + y, 0) / a.length); o[f + '90'] = R1(q(a, .9)); o[f + 'Max'] = R1(Math.max(...a)); }
    o.ms = R1(q(rows.map(r => r.u + r.d), .5)); o.ms90 = R1(q(rows.map(r => r.u + r.d), .9)); return o;
  }
  function fresh(stage, hero) {
    lvlUp = function () { S.pend = 0 };
    HERO = hero || 'goku'; V2.noCut = true; start(stage); introEnd(); show('');
    for (const k in S.w) S.w[k] = 0; S.p.max = 1e9; S.p.hp = 1e9; S.dbT = 1e9;
    S.en = []; S.eb = []; S.fx = []; S.zones = [];
  }
  const noBoss = () => { S.en = S.en.filter(e => !e.boss); };
  function crowd(k, n, rMin = 120, rMax = 420) {
    let alive = 0; for (const e of S.en) if (!e.dead && !e.boss) alive++;
    for (; alive < n; alive++) { spawnE(k); const e = S.en[S.en.length - 1], a = Math.random() * 6.283, d = rMin + Math.random() * (rMax - rMin); e.x = S.p.x + Math.cos(a) * d; e.y = S.p.y + Math.sin(a) * d * .9; }
  }
  const MOB1 = { 1: 'sai', 2: 'fs', 3: 'dr', 4: 'mj' };
  window.PA = {
    // one attack, maxed: level 8, evolved, wished (fusions: tier 2). Fights a steady crowd of 120 Level 1 mobs.
    attack(k, o = {}) {
      const stage = o.stage || 1; fresh(stage, o.hero); S.t = 60;
      if (typeof FUSE != 'undefined' && FUSE[k]) { S.w[k] = 5; S.cd[k] = .6; (S.ft || (S.ft = {}))[k] = 2; S.myth[k] = 1; S.rm[k] = 10; S.rw[k] = 10; fsync(k); }
      else { S.w[k] = 8; if (o.evo !== false) S.evo[k] = 1; if (o.wish !== false) { S.myth[k] = 1; S.rm[k] = 10; S.rw[k] = 10; } }
      const rows = [];
      for (let i = 0; i < (o.frames || 480); i++) { noBoss(); crowd(MOB1[stage], o.n || 120); if (i >= 120) frame(rows); else { S.pend = 0; if (S.mode == 'lvl') S.mode = 'play'; update(1 / 60); draw(); } }
      return summ(rows);
    },
    // n of one mob kind on screen, no attacks
    mobs(stage, k, o = {}) {
      fresh(stage, o.hero); S.t = o.t || 60; const rows = [];
      for (let i = 0; i < (o.frames || 360); i++) { noBoss(); crowd(k, o.n || 120, 60, 380); if (i >= 60) frame(rows); else { update(1 / 60); draw(); } }
      return summ(rows);
    },
    // background only: walk in a slow circle so the scenery scrolls
    bg(stage, o = {}) {
      fresh(stage, o.hero); S.t = 30; const rows = [];
      for (let i = 0; i < (o.frames || 300); i++) { S.en = []; S.p.x += Math.cos(i / 40) * 3; S.p.y += Math.sin(i / 40) * 3; if (i >= 30) frame(rows); else { update(1 / 60); draw(); } }
      return summ(rows);
    },
    // one boss using its attacks: full health for the first half, then 25% (late phases)
    boss(stage, k, o = {}) {
      fresh(stage, o.hero); S.t = 30; spawnE(k); const b = S.en[S.en.length - 1]; b.x = S.p.x + 220; b.y = S.p.y; const rows = [], N = o.frames || 1200;
      for (let i = 0; i < N; i++) {
        S.en = S.en.filter(e => e === b || !e.boss || e.hp > 0);
        if (i == N >> 1) for (const e of S.en) if (e.boss && !e.dead) { e.hp = e.max * .25; }
        for (const e of S.en) if (e.boss) e.inv = Math.max(e.inv || 0, 0);
        frame(rows);
        if (S.mode != 'play' && S.mode != 'lvl') { S.mode = 'play'; }
      }
      const o2 = summ(rows); o2.bossesSeen = [...new Set(S.en.filter(e => e.boss).map(e => e.k))].join(','); return o2;
    },
    summ, frame, fresh, crowd
  };
})();
