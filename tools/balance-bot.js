// Headless balance bot: plays a run at accelerated speed and reports milestones.
// Usage in page: await simRun({stage:1, dlv:1, hero:'goku', skill:1, maxT:600})
//   meta: shop levels to use (default: none).  keepMeta: use and keep the real shop/Zeni (campaigns).
//   budget: instead of meta, spend this much Zeni cheapest-first on the shop items the profile has unlocked.
//   profile: unlock set for the run: 'fresh' | 'l1' | 'l2' | 'l3' | 'l4' | 'all' (default = the page's own).
//   build: what to chase, like a player going for a combo: attack / passive / fusion keys, most important first,
//          e.g. ['kame', 'area', 'galick', 'arm', 'fkame']. The bot takes, evolves and fuses those, keeps slots free for
//          them, seals and rerolls other cards, and wishes on the first attack of the build.
//   balls: chase Dragon Balls like a player (default true; false = only grab ones close by).
// Unlock-cadence test from a fresh account: await campaign(15) then campSumm().  Combo sweeps: tools/sweep.mjs.
const BOT_PROFILES = {
  fresh: [],
  l1: ['s1', 's2', 's3', 'm1', 'm2', 'm3', 'm4', 'm5'],                       // a player attempting Vegeta
  l2: ['s1', 's2', 's3', 's4', 's5', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9'],   // early Namek
  // first arrival at Level 3 (Frieza beaten) / Level 4 (Perfect Cell beaten), plus the milestones and the two easy
  // secrets (Yamcha'd, Bald Destiny) a player has usually picked up by then
  l3: ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm13', 'x1', 'x3'],
  l4: ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 's14', 's15', 's16',
    'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12', 'm13', 'm17', 'm18', 'x1', 'x3'],
  all: null
};
// Zeni a player has spent by the time they reach each level (EXPANSION_PLAN.md §10 targets)
const BOT_BUDGET = { 1: 0, 2: 3800, 3: 6500, 4: 9500 };
function botShop(budget) {   // cheapest-first, like the campaign: only items the current unlocks allow
  for (const k in META) if (k !== 'zeni' && typeof META[k] === 'number') META[k] = 0;
  for (let left = budget; ;) {
    const ks = Object.keys(UPG).filter(k => HAS('s:' + k) && META[k] < UPG[k][2]).sort((a, b) => ucost(a, META[a]) - ucost(b, META[b]));
    if (!ks.length || ucost(ks[0], META[ks[0]]) > left) break; left -= ucost(ks[0], META[ks[0]]); META[ks[0]]++;
  }
}
// what a power-up / wish / Limit Break button offers
function botCard(b) {
  const oc = b.getAttribute('onclick') || ''; let m;
  if ((m = /lbPick\((\d)\)/.exec(oc))) return { lb: +m[1] };
  if ((m = /pickFuse\('(\w+)'\)/.exec(oc))) return { g: 'f', k: m[1] };
  if ((m = /mythic\('(\w+)','(\w+)'\)/.exec(oc))) return { g: 'wish', k: m[2] };
  if ((m = /pick\('(\w+)','(\w+)'(?:,(\d))?/.exec(oc))) return { g: m[1], k: m[2], r: +(m[3] || 0) };
  return null;
}
// the original generic pick (no build): evolve > grow what you own > fill slots
function botScoreGeneric(c) {
  if (c.lb !== undefined) return c.lb === 3 ? (S.p.hp < S.p.max * .7 ? 50 : 1) : c.lb === 0 ? 10 : 5;   // Limit Break: heal when hurt
  if (c.g === 'f') return 120;
  if (c.g === 'wish') return (S.w[c.k] || 0) + (S.evo[c.k] ? 3 : 0);
  const { g, k, r } = c;
  if (g === 'e') return 100;
  if (g === 'w') { const l = S.w[k] || 0; return (l ? 20 + l * 2 : (Object.values(S.w).filter(v => v > 0).length < 4 ? 12 : 0)) + r * 3 + (k === 'kame' || k === 'aura' || k === 'bomb' ? 2 : 0); }
  const need = Object.keys(EVO).some(w => S.w[w] > 0 && EVO[w][2] === k && !S.evo[w]);
  if (k === 'mm' && !(S.ps.mm > 0)) return 2;   // Majin Mark is a curse: only take it when nothing else is useful
  return (need && !(S.ps[k] > 0) ? 18 : need ? 6 : 5) + (k === 'sen' || k === 'zen' ? 3 : 0) + r * 3;
}
// a player chasing a build: the usual good picks, but build cards win ties and evolutions/fusions come first;
// never fill a slot the build still needs (those cards score -100 and get sealed)
function botScoreBuild(c, B) {
  if (c.lb !== undefined || c.g === 'wish' && !B.includes(c.k)) return botScoreGeneric(c);
  const ix = B.indexOf(c.k), rank = ix < 0 ? 0 : B.length - ix;
  if (c.g === 'wish') return 100 + rank;
  if (c.g === 'f') return ix >= 0 ? 500 : 60;   // fuse only when the build asks for that fusion
  if (c.g === 'e') return ix >= 0 ? 300 : 100;
  if (ix >= 0) return botScoreGeneric(c) + 40 + rank * 5;
  if (S[c.g][c.k] > 0) return botScoreGeneric(c) * .8;
  const need = B.filter(k => S[c.g] && k in S[c.g] && !FUSE[k] && !(S[c.g][k] > 0) && !(S.fz && S.fz[k])).length;
  return LIM[c.g] - own(c.g) <= need ? -100 : botScoreGeneric(c);
}
function botPick(o) {
  const btns = [...ov.querySelectorAll('button')].filter(b => !/reroll\(\)/.test(b.getAttribute('onclick') || ''));
  const cards = btns.map(b => [b, botCard(b)]).filter(x => x[1]);
  const sc = c => o.build ? botScoreBuild(c, o.build) : botScoreGeneric(c);
  cards.sort((x, y) => sc(y[1]) - sc(x[1]));
  const best = cards[0];
  if (S.mode === 'lvl' && o.skill >= 1 && best && best[1].g !== 'f' && best[1].lb === undefined) {
    // seal a card that would take a slot the build still needs (it would keep coming back)
    const sealB = o.build && S.seal > 0 && [...ov.querySelectorAll('button.sealb')].find(b => { const m = /sealPick\('(\w+)'\)/.exec(b.getAttribute('onclick') || ''); const c = m && cards.find(x => x[1].k === m[1]); return c && sc(c[1]) < 0; });
    if (sealB) { sealB.click(); return; }
    if (sc(best[1]) < 8) {   // a player rerolls a weak hand
      const rrB = [...ov.querySelectorAll('button')].find(b => /reroll\(\)/.test(b.getAttribute('onclick') || ''));
      if (rrB) { rrB.click(); return; }
    }
  }
  let pickB = best && best[0];
  if (o.skill < 1 && Math.random() > o.skill && cards.length) pickB = cards[(Math.random() * cards.length) | 0][0];
  if (pickB) pickB.click(); else { const nb = btns.find(b => /Not now/.test(b.textContent)); if (nb) nb.click(); else { S.mode = 'play'; show(''); } }
}
function botProfile(name) {
  const ids = BOT_PROFILES[name], u = {};
  for (const a of ACH) if (ids === null || ids.includes(a.id)) for (const r of a.r) if (!r.startsWith('z:')) u[r] = 1;
  return u;
}
// attacks, passives and fusions a profile has unlocked (for building combo lists)
window.botAvail = function (profile) {
  const keep = P.unl; P.unl = botProfile(profile);
  try {
    return { w: Object.keys(INFO).filter(k => HAS('w:' + k) && !FUSE[k]), ps: Object.keys(PCAP).filter(k => HAS('p:' + k)),
      evo: Object.keys(EVO).filter(k => HAS('w:' + k) && HAS('p:' + EVO[k][2])).map(k => [k, EVO[k][2]]),
      fuse: Object.keys(FUSE).filter(id => HAS(FUSE[id].u) && HAS('w:' + FUSE[id].a) && HAS('w:' + FUSE[id].b)).map(id => [id, FUSE[id].a, EVO[FUSE[id].a][2], FUSE[id].b, EVO[FUSE[id].b][2]]),
      heroes: ['goku', 'pic', 'gohan', 'vegeta', 'kri', 'trunks', 'gotenks'].filter(h => HAS(heroKey(h))) };
  } finally { P.unl = keep; }
};
window.simRun = async function (o) {
  o = Object.assign({ stage: 1, dlv: 1, hero: 'goku', skill: 1, maxT: 600, meta: null, balls: true }, o || {});
  const saveMeta = JSON.stringify(META), saveP = typeof P != 'undefined' ? JSON.stringify(P) : null;
  if (!o.keepMeta) { for (const k in META) if (k !== 'zeni' && typeof META[k] === 'number') META[k] = 0; if (o.meta) Object.assign(META, o.meta); }   // presets start from an empty shop
  if (o.profile && saveP) P.unl = botProfile(o.profile);
  if (!o.keepMeta && o.budget != null) botShop(o.budget);
  DLV = o.dlv; HERO = o.hero; V2.noCut = true; V2.kkFast = true;
  start(o.stage); introEnd(); window.DMG = {};
  const log = { ev: [], lv: [], hpLow: 1 };
  const seen = {};
  const dt = 1 / 60;
  let steps = 0;
  const rnd = Math.random;
  let MX = 0, MY = 0;
  while (S.t < o.maxT && S.mode !== 'over' && S.mode !== 'win' && S.mode !== 'bcut') {   // bcut: Beerus at 20:00 ends the run
    if (S.mode === 'lvl' || S.mode === 'wish') { botPick(o); continue; }
    if (S.mode !== 'play') { S.mode = 'play'; show(''); }
    if (steps % 3 === 0) {
    // --- steering: score 16 directions by predicted danger at several look-ahead times ---
    var p = S.p; const sp = 135 * (1 + .13 * S.pe.spd) * (S.ssj ? 1.3 : 1) * (S.slow > 0 ? .45 : 1);
    let bestS = -1e18; var mx = 0, my = 0;
    let tgt = null, tb = 1e9;
    const hpF = p.hp / p.max;
    for (const g of S.gem.concat(S.beans || [], S.chests || [], S.balls || [], S.cdy || [], S.ch4 || [])) {
      const ball = (S.balls || []).includes(g), d = Math.hypot(g.x - p.x, g.y - p.y), w = ball ? d * .25 : g.n ? d * .4 : (S.cdy || []).includes(g) ? d * .3 : d;   // grab Fat Buu's candy before he eats it
      if (w < tb && (d < 420 || ball && hpF > (o.balls ? .55 : 2) || ball && hpF > .5 && !S.en.some(e => e.boss))) { tb = w; tgt = g; }   // a player travels for Dragon Balls
    }
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
          if (d < z.r + 14 && z.t < T + .35 + (z.r > 150 ? z.r / sp : 0)) danger += (z.d || 20) * 2;   // big blasts: leave early
        }
        for (const z of S.gz || []) if (Math.hypot(px - z.x, py - z.y) < z.r + 10) danger += 6;            // Level 4 hazards
        for (const z of S.spit || []) if (Math.hypot(px - z.x, py - z.y) < 64 && z.t < T + .35) danger += 30;
        for (const z of S.stn || []) if (Math.hypot(px - z.x, py - z.y) < z.r + 14) danger += 25;
        for (const z of S.cpd || []) if (Math.hypot(px - z.x, py - z.y) < z.r + 8) danger += 4;
        if (S.pb && T == .4) { let sd = 1e9, sr = 60; for (const q of S.pb.safe) { const d = Math.hypot(px - q.x, py - q.y); if (d < sd) { sd = d; sr = q.r; } } danger += sd < sr * .6 ? 0 : 20 + sd / 6; }
        if (!window.BOT_NOLANE) for (const l of S.lns || []) {   // telegraphed beam lanes (Frieza's Death Beams, etc.): step out of the stripe
          if (l.on > 0 || l.t > T + .35) continue; const c = Math.cos(l.a), sn = Math.sin(l.a), dx = px - l.x, dy = py - l.y, al = dx * c + dy * sn, pp = Math.abs(-dx * sn + dy * c);
          if (al > -20 && al < l.len && pp < l.w / 2 + 16) danger += (l.d || 20) * 2;
        }
      }
      let score = -danger;
      // sweep up experience like a player: pull toward where the most gem value lies (not just the nearest gem)
      if (o.gems !== false) { let pull = 0; for (const g of S.gem) { const gx = g.x - p.x, gy = g.y - p.y, gd = Math.hypot(gx, gy) || 1; if (gd < 650) { const c = (dx0 * gx + dy0 * gy) / gd; if (c > 0) pull += (g.v || 1) * c / (1 + gd / 120); } }
        score += Math.log1p(pull) * (hpF < .3 ? .25 : .7); }
      if (tgt) { const tx = tgt.x - p.x, ty = tgt.y - p.y, tl = Math.hypot(tx, ty) || 1; score += (dx0 * tx + dy0 * ty) / tl * (hpF < .35 && (S.beans || []).includes(tgt) ? 3 : (S.balls || []).includes(tgt) ? 2 : 0.6); }
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
    if (++steps % 3600 === 0) { log.lv.push([+S.t.toFixed(0), p.lv, S.kills, S.en.length]); await new Promise(r => { const c = new MessageChannel(); c.port1.onmessage = () => r(); c.port2.postMessage(0); }); /* MessageChannel: not throttled in hidden tabs */ }
  }
  GP.x = GP.y = 0;
  const res = { stage: o.stage, dlv: o.dlv, hero: o.hero, skill: o.skill, build: o.build, result: S.mode, hpLow: +log.hpLow.toFixed(2), wishes: Object.keys(S.myth || {}).filter(k => S.myth[k]).join(','), db: S.dbGot || 0, dbSp: S.dbN || 0, revived: !!S.revived, t: +S.t.toFixed(0), lv: S.p.lv, kills: S.kills, ev: log.ev, prog: log.lv, w: JSON.stringify(S.w), evo: Object.keys(S.evo).join(',') };
  res.dmg = Object.fromEntries(Object.entries(DMG).map(([k, v]) => [k, Math.round(v)]).sort((a, b) => b[1] - a[1]).slice(0, 6));
  if (!o.keepMeta) Object.assign(META, JSON.parse(saveMeta));
  if (o.profile && saveP) { P = JSON.parse(saveP); saveProg(); }
  if (!o.keepMeta) S.mode = 'menu';
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

// ---- 3.0 unlock cadence: play N runs from a fresh account like a player would ----
// Plays the highest unlocked level, rotates heroes, spends Zeni on the cheapest unlocked upgrade between runs.
const botWait = ms => new Promise(r => { const t0 = performance.now(), c = new MessageChannel(); c.port1.onmessage = () => performance.now() - t0 > ms ? r() : c.port2.postMessage(0); c.port2.postMessage(0); });
window.campaign = async function (n, o) {
  o = Object.assign({ skill: 1, dlv: 1, maxT: 900 }, o || {});
  P = PROG_NEW(); for (const k in META) META[k] = 0; saveMeta(); saveProg();
  // the win end card is scheduled 1.9 s after the final boss dies; run it at once (hidden tabs throttle timers)
  const st0 = window.setTimeout; window.setTimeout = (f, ms, ...a) => ms === 1900 ? (queueMicrotask(() => f(...a)), 0) : st0(f, ms, ...a);
  try {
  window._camp = [];
  for (let i = 0; i < n; i++) {
    const before = new Set(Object.keys(P.ach)), stage = HAS('lvl4') ? 4 : HAS('lvl3') ? 3 : HAS('lvl2') ? 2 : 1;
    const heroes = ['goku', 'pic', 'gohan', 'vegeta', 'kri', 'trunks', 'gotenks'].filter(h => HAS(heroKey(h)));
    const r = await simRun({ stage, dlv: o.dlv, hero: heroes[i % heroes.length], skill: o.skill, maxT: o.maxT, keepMeta: true });
    for (let g = 0; g < 3 && S.mode == 'play'; g++) { S.revived = 1; S.p.hp = -1; update(1 / 60); }   // hit maxT: end the run so it counts (no revive)
    while (RV) revealNext();
    let spent = 0;
    for (;;) { const ks = Object.keys(UPG).filter(k => HAS('s:' + k) && META[k] < UPG[k][2]).sort((a, b) => ucost(a, META[a]) - ucost(b, META[b]));
      if (!ks.length || ucost(ks[0], META[ks[0]]) > META.zeni) break; const c = ucost(ks[0], META[ks[0]]); buyU(ks[0]); spent += c; }
    const got = Object.keys(P.ach).filter(id => !before.has(id));
    _camp.push({ run: i + 1, hero: r.hero, stage, result: r.result, t: r.t, kills: r.kills, bosses: r.ev.filter(e => e[0] == 'kill').map(e => e[1]).join(','), got: got.map(id => ACH_BY[id].n), spent, zeni: META.zeni });
  }
  } finally { window.setTimeout = st0; }
  S.mode = 'menu'; menu();
};
window.campSumm = () => _camp.map(c => `#${c.run} L${c.stage} ${c.hero} ${c.result} ${fmt(c.t)} k=${c.kills} [${c.bosses}] +${c.got.length}: ${c.got.join(', ')} | spent ${c.spent}`);
