// Headless balance bot: plays a first run (no shop upgrades) at accelerated speed and reports milestones.
// Usage in page: await simRun({stage:1, dlv:1, hero:'goku', skill:1, maxT:600})
window.simRun = async function (o) {
  o = Object.assign({ stage: 1, dlv: 1, hero: 'goku', skill: 1, maxT: 600, meta: null }, o || {});
  const saveMeta = JSON.stringify(META);
  if (o.meta) Object.assign(META, o.meta); else for (const k in META) if (k !== 'zeni' && typeof META[k] === 'number') META[k] = 0;
  DLV = o.dlv; HERO = o.hero;
  start(o.stage); introEnd();
  const log = { ev: [], lv: [], hpLow: 1 };
  const seen = {};
  const dt = 1 / 60;
  let steps = 0;
  const rnd = Math.random;
  let MX = 0, MY = 0;
  while (S.t < o.maxT && S.mode !== 'over' && S.mode !== 'win') {
    if (S.mode === 'lvl' || S.mode === 'wish') {
      const bs = [...ov.querySelectorAll('button')].filter(b => !/Reroll|reroll/.test(b.textContent));
      const sc = b => {
        const m = /pick\('(\w+)','(\w+)'(?:,(\d))?/.exec(b.getAttribute('onclick') || ''); if (!m) return 0;
        const [, g, k, r] = m, rr = +(r || 0);
        if (g === 'e') return 100;
        if (g === 'w') { const l = S.w[k] || 0; return (l ? 20 + l * 2 : (Object.values(S.w).filter(v => v > 0).length < 4 ? 12 : 0)) + rr * 3 + (k === 'kame' || k === 'aura' || k === 'bomb' ? 2 : 0); }
        const need = Object.keys(EVO).some(w => S.w[w] > 0 && EVO[w][2] === k && !S.evo[w]);
        return (need && !(S.ps[k] > 0) ? 18 : need ? 6 : 5) + (k === 'sen' || k === 'zen' ? 3 : 0) + rr * 3;
      };
      let pickB = bs.slice().sort((x, y) => sc(y) - sc(x))[0];
      if (o.skill < 1 && rnd() > o.skill) pickB = bs[(rnd() * bs.length) | 0];
      if (pickB) pickB.click(); else { S.mode = 'play'; show(''); }
      continue;
    }
    if (S.mode !== 'play') { S.mode = 'play'; show(''); }
    if (steps % 3 === 0) {
    // --- steering: score 16 directions by predicted danger at several look-ahead times ---
    var p = S.p; const sp = 135 * (1 + .13 * S.pe.spd) * (S.ssj ? 1.3 : 1) * (S.slow > 0 ? .45 : 1);
    let bestS = -1e18; var mx = 0, my = 0;
    let tgt = null, tb = 1e9;
    for (const g of S.gem.concat(S.beans || [], S.chests || [], S.balls || [])) {
      const d = Math.hypot(g.x - p.x, g.y - p.y); const w = g.n ? d * .4 : d; if (w < tb && d < 420) { tb = w; tgt = g; }
    }
    const hpF = p.hp / p.max;
    for (let k = 0; k < 17; k++) {
      const dx0 = k < 16 ? Math.cos(k / 16 * 6.283) : 0, dy0 = k < 16 ? Math.sin(k / 16 * 6.283) : 0;
      let danger = 0;
      for (const T of [0.15, 0.4, 0.8]) {
        const px = p.x + dx0 * sp * T, py = p.y + dy0 * sp * T;
        for (const e of S.en) {
          const vx = p.x - e.x, vy = p.y - e.y, vd = Math.hypot(vx, vy) || 1;
          const ex = e.x + vx / vd * e.spd * T * (e.st > 0 ? 0 : 1), ey = e.y + vy / vd * e.spd * T * (e.st > 0 ? 0 : 1);
          const d = Math.hypot(px - ex, py - ey) - e.r - 10;
          if (d < 140) danger += (e.boss ? 6 : e.elite ? 3 : 1) / Math.max(4, d + 12) ** 2 * 400;
        }
        for (const q of S.eb) {
          const bx = q.x + q.vx * T, by = q.y + q.vy * T, d = Math.hypot(px - bx, py - by);
          if (d < 60) danger += (q.dm || 10) / Math.max(4, d) ** 2 * 120;
        }
        for (const z of S.zones) {
          if (z.f) continue; const d = Math.hypot(px - z.x, py - z.y);
          if (d < z.r + 14 && z.t < T + .35) danger += (z.d || 20) * 2;
        }
      }
      let score = -danger;
      if (tgt) { const tx = tgt.x - p.x, ty = tgt.y - p.y, tl = Math.hypot(tx, ty) || 1; score += (dx0 * tx + dy0 * ty) / tl * (hpF < .35 && (S.beans || []).includes(tgt) ? 3 : 0.6); }
      // stay in fighting range of the nearest boss (a human engages bosses; outrunning them forever isn't playing)
      { let bo = null, bd = 1e9; for (const e of S.en) if (e.boss) { const d = Math.hypot(e.x - p.x, e.y - p.y); if (d < bd) { bd = d; bo = e; } }
        if (bo) { const nx = p.x + dx0 * sp * .5, ny = p.y + dy0 * sp * .5, nd = Math.hypot(bo.x - nx, bo.y - ny); score -= Math.max(0, nd - 260) / 60 + Math.max(0, 130 - nd) / 40; } }
      // prefer keeping momentum so we don't jitter
      score += (dx0 * (S.mvx || 0) + dy0 * (S.mvy || 0)) * 0.15;
      if (k === 16) score -= 0.4;
      if (score > bestS) { bestS = score; mx = dx0; my = dy0; }
    }
    MX = mx; MY = my;
    }
    mx = MX; my = MY; p = S.p;
    // imperfect human: reaction noise
    if (o.skill < 1) { mx += (rnd() - .5) * (1 - o.skill) * 1.2; my += (rnd() - .5) * (1 - o.skill) * 1.2; }
    const ml = Math.hypot(mx, my); GP.x = ml ? mx / ml : 0; GP.y = ml ? my / ml : 0;
    if (typeof ub !== 'undefined' && ub.classList.contains('rdy')) { try { ultFire(); } catch (e) { } }
    update(dt);
    log.hpLow = Math.min(log.hpLow, p.hp / p.max);
    for (const e of S.en) if (e.boss && !seen[e.k]) { seen[e.k] = 1; log.ev.push(['spawn', e.k, +S.t.toFixed(0), +(p.hp / p.max).toFixed(2), p.lv]); }
    for (const k in seen) if (seen[k] === 1 && !S.en.some(e => e.k === k)) { seen[k] = 2; log.ev.push(['kill', k, +S.t.toFixed(0), +(p.hp / p.max).toFixed(2), p.lv]); }
    if (++steps % 3600 === 0) { log.lv.push([+S.t.toFixed(0), p.lv, S.kills, S.en.length]); await new Promise(r => setTimeout(r, 0)); }
  }
  GP.x = GP.y = 0;
  const res = { stage: o.stage, dlv: o.dlv, hero: o.hero, skill: o.skill, result: S.mode, t: +S.t.toFixed(0), lv: S.p.lv, kills: S.kills, ev: log.ev, prog: log.lv, w: JSON.stringify(S.w), evo: Object.keys(S.evo).join(',') };
  Object.assign(META, JSON.parse(saveMeta));
  S.mode = 'menu';
  return res;
};
window.DMG = {};
{ const _hp = hitP, _hu = hurtP;
  hitP = function (e, d) { const b = S.p.hp; _hp(e, d); DMG['contact:' + e.k] = (DMG['contact:' + e.k] || 0) + (b - S.p.hp) };
  hurtP = function (d) { const b = S.p.hp; _hu(d); const st = new Error().stack.split('\n')[2] || ''; const k = 'hurt:' + ((st.match(/at (\S+)/) || [])[1]); DMG[k] = (DMG[k] || 0) + (b - S.p.hp) }; }
window.batch = async function (n, o) {
  window._res = []; window._done = 0; const t0 = performance.now();
  for (let i = 0; i < n; i++) { DMG = {}; const r = await simRun(o); r.dmg = Object.fromEntries(Object.entries(DMG).map(([k, v]) => [k, Math.round(v)]).sort((a, b) => b[1] - a[1]).slice(0, 5)); _res.push(r) }
  window._done = performance.now() - t0;
};
window.summ = () => ({ done: _done, res: _res.map(r => r.result + ' t=' + r.t + ' lv=' + r.lv + ' ' + JSON.stringify(r.ev) + ' evo=' + r.evo + ' dmg=' + JSON.stringify(r.dmg)) });
