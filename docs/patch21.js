/* =====================================================================
   DRAGON BALL SURVIVORS 2.1 — quick fixes (see EXPANSION_PLAN.md §1)
   1) Spirit Bomb / Taiyoken no longer white out the screen.
   2) Dragon Balls 5-7 are guarded by an elite pack.
   3) Capsule Corp upgrades are refundable.
   (Gohan's numbers and Dragon Ball spawn distance/timer are edited in index.html.)
   ===================================================================== */
'use strict';
V2.ver = '2.1';

/* ---------- 1) screen-flash limiter for abilities ---------- */
// Spirit Bomb detonations and Solar Flare used to set a full-screen white flash every time they fired.
// With fast cooldowns that meant a near-permanent whiteout. Now: at most one ability flash per 3 s, and a soft peak.
function aFlash(v) {
  const now = S.t || 0;
  if (S._afT !== undefined && now - S._afT < 3 && now >= S._afT) return;
  S._afT = now; S.flash = Math.max(S.flash, Math.min(v * .4, .2));
}

// Spirit Bomb: the damage radius can grow wider than the screen, and the sphere's glow (drawn additively)
// was 2.6x that again. Several at once summed to pure white. Draw size is now capped to the view, glows are
// dimmer when several bombs overlap, and the sphere turns see-through while it passes over you.
drawSpiritBomb = function (z, x, y, k, t) {
  const R = z.r, cap = Math.min(W, H) * .3, Rv = Math.min(R, cap), sr = Rv * (.32 + .18 * k), sy = y - (1 - k) * Math.min(260, H * .3);
  let n = 0; for (const q of S.zones) if (q.f && !q.done) n++;
  const over = Math.hypot(x - W / 2, sy - H / 2) < sr * 1.7, A = (over ? .35 : 1) / Math.sqrt(Math.max(1, n));
  // real damage area: dashed ring + faint ground fill (kept at true size so it stays readable)
  ctx.save(); ctx.strokeStyle = 'rgba(150,220,255,' + (.3 + .4 * k) + ')'; ctx.lineWidth = 2 + 2 * k;
  ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 60; ctx.beginPath(); ctx.arc(x, y, R * (1.25 - .25 * k), 0, 7); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(120,200,255,' + ((.03 + .05 * k) / Math.max(1, n)) + ')'; ctx.beginPath(); ctx.ellipse(x, y, R, R * .55, 0, 0, 7); ctx.fill(); ctx.restore();
  // the falling sphere (capped size)
  LT(); gl('cy', x, sy, sr * 1.9, .4 * A); gl('cy', x, sy, sr * 1.3, .7 * A); gl('wh', x, sy, sr * .8, .75 * A);
  ctx.strokeStyle = 'rgba(200,240,255,' + (.5 * A) + ')'; ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) { const a = t * 3 + i * 1.047, r1 = sr * 1.8, r0 = sr * 1.05; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r1, sy + Math.sin(a) * r1); ctx.quadraticCurveTo(x + Math.cos(a + .8) * r1 * .8, sy + Math.sin(a + .8) * r1 * .8, x + Math.cos(a + 1.4) * r0, sy + Math.sin(a + 1.4) * r0); ctx.stroke(); }
  NM();
  ctx.strokeStyle = 'rgba(230,250,255,' + (.9 * A) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, sy, sr, 0, 7); ctx.stroke();
};

// Impact shockwaves (big explosions) are also additive: cap their drawn size to the view.
{ const _imp = impact; impact = function (x, y, r, c, T) { return _imp(x, y, Math.min(r, Math.min(W, H) * .4), c, T); }; }

/* ---------- 2) guarded Dragon Balls ---------- */
// Dragon Balls now spawn 2.5-3.5 screens away (index.html). The last three are guarded: an elite pack
// forms around the ball when you close in, so going for them is a real decision.
function guardBall(b) {
  const k = S.stage == 2 ? 'fs' : S.t > 100 ? 'blue' : 'sai', n = b.n >= 7 ? 4 : 3;
  for (let i = 0; i < n; i++) {
    spawnE(k); const q = S.en[S.en.length - 1], a = i / n * 6.283 + Math.random() * .5;
    q.x = b.x + Math.cos(a) * 70; q.y = b.y + Math.sin(a) * 70; q.elite = 1; q.hp = q.max = q.max * 6; q.r *= 1.4; q.spd *= 1.05;
  }
  ban('THE DRAGON BALL IS GUARDED!');
}
{ const _ub = updBalls; updBalls = function (dt) {
    _ub(dt);
    if (S.mode != 'play' || !S.balls) return;
    for (const b of S.balls) if (b.n >= (S.set2 == 1 ? 5 : 6) && !b.gd && Math.hypot(b.x - S.p.x, b.y - S.p.y) < 560) { b.gd = 1; guardBall(b); }
  }; }

/* ---------- 3) refundable Capsule Corp upgrades ---------- */
const spentOn = k => { let z = 0; for (let l = 0; l < (META[k] || 0); l++) z += ucost(k, l); return z; };
const spentAll = () => Object.keys(UPG).reduce((a, k) => a + spentOn(k), 0);
function refundU(k) {
  if (!((META[k] || 0) > 0)) return;
  META[k]--; META.zeni += ucost(k, META[k]); saveMeta(); sfxPlay('buy'); V2.raConf = 0; shop();
}
function refundAll() {
  if (!V2.raConf) { V2.raConf = 1; clearTimeout(V2.raT); V2.raT = setTimeout(() => { V2.raConf = 0; if (ov.querySelector('.shop')) shop(); }, 3500); shop(); return; }
  V2.raConf = 0; clearTimeout(V2.raT);
  for (const k of Object.keys(UPG)) { META.zeni += spentOn(k); META[k] = 0; }
  saveMeta(); sfxPlay('buy'); shop();
}
{ const _b = buyU; buyU = function (k) { V2.raConf = 0; return _b(k); }; }
shop = function () {
  const cells = Object.keys(UPG).map(k => {
    const [n, d, mx] = UPG[k], l = META[k], c = ucost(k, l), mxd = l >= mx, poor = !mxd && META.zeni < c;
    return `<div class="supw"><button class="sup${mxd ? ' max' : ''}${poor ? ' poor' : ''}" ${mxd ? 'disabled' : `onclick="buyU('${k}')"`}>
      <span class="sn">${n}</span><span class="sd">${d}</span>
      <span class="sbar"><i style="width:${Math.round(l / mx * 100)}%"></i></span>
      <span class="sf"><span>Lv ${l}/${mx}</span><b>${mxd ? 'MAX' : 'Ƶ ' + c}</b></span></button>${l > 0 ? `<button class="sref" onclick="refundU('${k}')" aria-label="Refund one level of ${n}" title="Refund one level (Ƶ ${ucost(k, l - 1)})">−</button>` : ''}</div>`;
  }).join('');
  const sp = spentAll();
  show(`<div class="card dbz shop"><div class="dhead"><span class="db4"></span><h2>Capsule Corp</h2><div class="zeni">Ƶ ${META.zeni}</div></div>
    <div class="sgrid">${cells}</div><div class="sfoot">${sp ? `<button class="sra${V2.raConf ? ' conf' : ''}" onclick="refundAll()">${V2.raConf ? 'Tap again to refund everything' : 'Refund all'} <small>(Ƶ ${sp})</small></button>` : ''}<button class="go" onclick="menu()">Back</button></div></div>`);
};
{ const st = document.createElement('style'); st.textContent = `
.supw{position:relative;display:flex;min-width:0}.supw>.sup{flex:1;min-width:0}.supw .sn{padding-right:24px}
.card .sref{position:absolute;top:5px;right:5px;width:24px;height:24px;min-height:0;margin:0;padding:0;border-radius:50%;font:bold 17px/22px sans-serif;text-align:center;color:#ffd27a;background:rgba(0,0,0,.5);border:1px solid rgba(255,210,122,.6);box-shadow:none}
.card .sref:active{background:rgba(255,120,40,.6)}
.sfoot{display:flex;gap:6px;align-items:stretch}.sfoot .go{flex:1 1 auto;width:auto;margin:0}
.card .sra{flex:0 0 auto;width:auto;margin:0;padding:6px 10px;font-size:12px;text-align:center;background:rgba(0,0,0,.4);border:1px solid rgba(255,150,120,.55);color:#ffc9b8}
.card .sra.conf{background:#a3261a;color:#fff;border-color:#ff8a6a}
`; document.head.appendChild(st); }
