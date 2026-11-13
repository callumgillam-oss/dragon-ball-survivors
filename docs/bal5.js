/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — PHASE H BALANCE (EXPANSION_PLAN.md §12, Phase H)
   ===================================================================== */
'use strict';

// Level-up offers: with 20 attacks and 10 passives unlocked, a purely random pick rarely completes an evolution
// pair. Offers are now a weighted shuffle (like Vampire Survivors' luck towards owned items):
//   upgrades to things you own x1.8 · a passive that evolves an attack you own x2.2 · an attack whose passive you own x1.3
//   Majin Mark (a curse) x0.7 · everything else x1
function offerW(g, k) {
  if (S[g][k] > 0) return 1.8;
  if (g == 'ps') { if (k == 'mm') return .7; return Object.keys(EVO).some(w => S.w[w] > 0 && !S.evo[w] && EVO[w][2] == k) ? 2.2 : 1; }
  return EVO[k] && S.ps[EVO[k][2]] > 0 ? 1.3 : 1;
}
function wShuffle(a) {   // weighted random order (Efraimidis-Spirakis): higher weight tends to come first
  const keyed = a.map(x => [x, -Math.log(Math.random() || 1e-9) / offerW(x[0], x[1])]);
  keyed.sort((p, q) => p[1] - q[1]); for (let i = 0; i < a.length; i++) a[i] = keyed[i][0]; return a;
}

// Shop price pass (your goal: the shop shouldn't be finished until a couple of Level 4 runs).
// The first few levels of each item cost about the same as before, so early runs feel the same; the top levels cost far
// more, and the core stats get extra levels (more late-game power, which is fine: earlier levels get easier).
// Total: 17,780 → about 49,800 Zeni.   [max level, base cost, cost growth]
for (const [k, mx, base, gr] of [['hp', 15, 35, 1.34], ['dmg', 15, 60, 1.34], ['spd', 5, 55, 1.5], ['xp', 8, 45, 1.42], ['area', 10, 60, 1.42], ['ult', 8, 45, 1.38],
  ['rr', 3, 200, 2.5], ['magnet', 5, 40, 1.5], ['armor', 8, 70, 1.48], ['greed', 5, 80, 1.7], ['revive', 1, 1500, 1], ['seal', 3, 300, 2.2], ['slot', 1, 8000, 1]])
  if (UPG[k]) { UPG[k][2] = mx; UPG[k][4] = base; UPG[k][5] = gr; }
// Armor stacks multiplicatively with Saiyan Armor; 8 levels x 2% stays well below immunity.

// Levels 3-4 are judged with the unlock pool a player really has at that point (smaller than "everything"),
// where they proved too easy (beaten within 1-3 attempts). Level 3: bosses +50%, mobs 1.05x → 1.15x.
// Level 4 must stay a step up even with the shop nearly full: bosses +80%, mobs 1.05x → 1.4x.
{ const _b = DIFF.boss; DIFF.boss = k => _b(k) * (k == 'bu1' ? 1.4 : L4BOSS[k] ? 1.8 : L3BOSS[k] ? 1.5 : 1); }   // Fat Buu heals, so he gets less
// Mob health starts gentler and ramps up between 4:00 and 8:00, so runs aren't lost to a wall of mobs at 4 minutes
// (that felt worse than losing to a boss); the late game keeps its pressure.
const L34R = t => Math.max(0, Math.min(1, (t - 240) / 240));
{ const _h = DIFF.hp; DIFF.hp = t => _h(t) * (S.stage == 4 ? (1.1 + .3 * L34R(t)) / 1.05 : S.stage == 3 ? (1 + .15 * L34R(t)) / 1.05 : 1); }
