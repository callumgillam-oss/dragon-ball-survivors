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
