/* =====================================================================
   DRAGON BALL SURVIVORS — BALANCE PASS (2026-11-14, from a full Level 4 playtest on iPhone)
   Multipliers on top of each attack's own tuning, so the originals stay readable.
   (Edits made in place elsewhere: Senzu Bean / Weighted Training / gems / gravity well / Dragon Balls in index.html,
   Galick Gun + Explosive Wave in w3.js, the fusions + Candy Beam in w5.js, Capsule Vacuum in sys3.js.)
   ===================================================================== */
'use strict';

// Kamehameha and Super Kamehameha: -10%
{ const _k = kameBeams; kameBeams = function (a, L) { const n0 = S.beams.length, r = _k(a, L); for (let i = n0; i < S.beams.length; i++) S.beams[i].d *= .9; return r; }; }
// Hellzone Storm (evolved Hellzone Grenade): -30%
WB.hellE *= .7;
// Android Barrier (and Perfect Barrier): -20% on both the rim drain and the blast
W4B.barrier = .8;

// Senzu Bean drops (2026-11-14): Levels 3-4 drop a bean on ~2% of ordinary kills, so a strong build killing 30+ enemies a
// second ate ~34 beans (30% heal each) a minute and was effectively unkillable. Ordinary kills can now drop at most one bean
// every 12 s. Elites and bosses still always drop one, and the low-HP safety bean still comes.
{ const _bd = beanDrop; beanDrop = function (e) {
    if (!e.boss && !e.elite && S.t - (S.beanRT ?? -99) < 12) return false;
    const r = _bd(e); if (r && !e.boss && !e.elite) S.beanRT = S.t; return r; }; }
