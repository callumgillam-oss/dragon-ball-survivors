# Dragon Ball Survivors 3.0: Expansion Plan

Status: **DRAFT, waiting for your confirmation/edits.** Nothing below is built yet.
Edit anything directly in this file (strike it, change numbers, add notes). I'll treat this file as the
source of truth and tick items off as they land.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done · **(?)** = needs your call

---

## 0. Where the game is today (what I found in the code)

- **Weapons (10):** Ki Blast, Kamehameha, Kaioken Aura, Solar Flare, Destructo Disc, Spirit Bomb,
  Special Beam Cannon, Masenko, Hellzone Grenade, Dragon Thunder.
- **Passives (8):** Zenkai Boost (dmg), Weighted Training (speed), Senzu Bean (HP), Hyperbolic Chamber
  (cooldown), Saiyan Armor (armor), Dragon Radar (pickup/XP), Ki Control (area), Multi-Form (amount).
- **Current evolution pairs:** only Zenkai and Hyperbolic Chamber have 2 attacks. Six passives have 1:

  | Passive | Attacks today |
  |---|---|
  | Zenkai Boost | Special Beam Cannon, Masenko |
  | Hyperbolic Chamber | Spirit Bomb, Dragon Thunder |
  | Ki Control | Kamehameha |
  | Multi-Form | Ki Blast |
  | Senzu Bean | Kaioken Aura |
  | Weighted Training | Destructo Disc |
  | Saiyan Armor | Solar Flare |
  | Dragon Radar | Hellzone Grenade |

- **Slots:** 4 attacks, 5 passives per run.
- **Heroes:** Goku, Piccolo, Gohan. Vegeta only exists as the Level 1 boss.
- **Shop:** 11 items, full shop ≈ 13,500 Zeni. Already has a 1,200 Zeni "Zenkai Revival" (get up at 50% HP).
- **Code layout:** `docs/index.html` (core, ~228 KB) plus patch layers `v2.js`, `ui2.js`, `art2.js`, `fix.js`.
  New work will go in new layer files (see §11) so the core stays stable.

---

## 1. Quick fixes (Phase A)

### 1.1 Spirit Bomb covering the whole screen  `[x]` (2.1)
**Cause (found):** it isn't really a Gohan bug, but Gohan's kit is the worst case. All of these stack:
- Spirit Bomb's blast radius grows with level, rarity, Ki Control and the shop's area upgrade, and the
  falling sphere is drawn with a glow **2.6× its own size** plus a near-opaque white core. At high
  area that glow is ~700 px across, wider than the whole view.
- Evolved Super Spirit Bomb drops **2 at once** (+1 more per 2 Multi-Form levels), each falling for 1 s.
- Cooldown 4.5 s × Hyperbolic Chamber × **SS2 (×0.85)** × **Gohan below 35% HP (×0.75)**, which gets you a
  new volley about every 1.5 s. Mid-Frieza you're usually low on HP, so the low-HP speed-up kicks in.
- Every detonation also fires a **0.5 full-screen white flash**.
- Result: several overlapping screen-sized white/cyan glows and flashes running nonstop.

**Fix:**
- Cap the *drawn* sphere and glow to about 35% of the view, whatever the damage radius is. Damage is unchanged.
- Fade the sphere to about 30% opacity while it's over the player so you can always see yourself.
- Ability screen-flashes get a shared limit: at most one every 3 s, at a soft peak (0.2). Big explosion shockwaves are capped to 40% of the view.
- **Result (bot stress test, maxed Gohan SS2 on Namek):** worst frame 63% white → 12%. Average screen brightness is now about the same as the same build without Spirit Bomb/Taiyoken (old visuals added +13 brightness, new +3).
- Same audit for the other full-screen whiteouts: **Taiyoken Burst (evolved Solar Flare) sets a 100% flash
  every ~2.5 s** at high cooldown reduction, so it gets the same cap.
- Add a stress test to the balance bot that measures the share of frames with >50% of the screen
  washed out, in a maxed Gohan SS2 + Spirit Bomb + Taiyoken build.

### 1.2 Gohan's passive is too strong  `[x]` (2.1)
Today "Hidden Potential" is actually **three** buffs, one of them not shown in its description:
1. +20% XP (shown). More levels means faster evolutions, so SS2 comes sooner, which speeds up attacks again. It snowballs.
2. Attacks 25% faster below 35% HP (shown).
3. **His starting Masenko fires 35% faster at all times (hidden).**

**Proposal:**
- XP bonus **+20% → +8%** (keeps his identity as the fast learner without the snowball).
- Hidden Masenko speed-up **×0.65 → ×0.85**, and say so in the description.
- Keep the low-HP 25% haste. It's his theme, and the Spirit Bomb fix handles the visual side.
- **Target:** with the same shop setup, all heroes' clear rates within ~5 points of each other (bot-tested,
  Hard, Level 1 and 2). If Gohan then falls behind, add +5% damage below 50% HP rather than giving the XP back.

### 1.3 Dragon Balls are too easy  `[x]` (2.1)
Today: they spawn **420-660 units** away (just off-screen), the first at 30 s and then every 36 s, with 2
on the field at once. Dragon Radar shortens the timer by up to 40%. All 7 can come by **~2:40-4:00**.

**Proposal:**
- Spawn distance **1,100-1,500** units (about 2.5-3.5 screens away), plus 60 units more per ball already found.
- First ball at **45 s**, then every **42 s**. Still up to 2 on the field.
- Dragon Radar now shortens the timer by up to 25% (not 40%).
- **Balls 5-7 are guarded:** an elite pack spawns around them when you get close, so going for them is a real decision.
- Pointer and notice unchanged.
- **Target:** fastest possible wish around **5:30** with max Radar, typical **6:30-8:00** (so on Level 1 it's
  usually a pre-Vegeta or mid-Vegeta decision, and on Level 2 a mid-run power spike).

### 1.4 Refundable Zeni upgrades  `[x]` (2.1)
- Each shop item gets a **−** button that refunds that level's exact cost. A **Refund All** button sits
  at the bottom with a confirmation step.
- Full refund, no penalty (same as Vampire Survivors). Lets players re-spec freely.
- The refund math uses the existing cost formula, so no save change is needed.

---

## 2. Research: what we borrow from other survivors games

| Game | Mechanic | How we use it |
|---|---|---|
| Vampire Survivors | Almost everything is locked at first. Unlocks come from achievements (survive X min, reach level X, evolve a weapon, find an item), and many are secret. | Core unlock framework (§3-4) |
| Vampire Survivors | Achievement screen shows requirements; secrets show "???" | Achievements menu |
| Vampire Survivors | Full-refund PowerUp shop | §1.4 |
| Vampire Survivors | Characters unlock with their signature weapon | Vegeta + Galick Gun, Krillin, Trunks, Gotenks |
| Vampire Survivors | Floor pickups (Orologion freeze, Vacuum) | Guldo's Time Freeze, Capsule Vacuum |
| Vampire Survivors | Hyper / Hurry / Limit Break / Arcanas run modifiers | Ginyu Force Challenges, Limit Break |
| Vampire Survivors | Unions (two weapons fuse into one) | Fusion Dance unions (Buu arc reward) |
| Vampire Survivors | Banish / Skip | Mafuba Seal (Piccolo's sealing wave) |
| Halls of Torment | Visible quests per character that unlock gear | Hero-specific achievements |
| Brotato / HoloCure | Each character starts with a signature kit and a passive that changes how you play | Vegeta/Krillin/Trunks/Gotenks passives |
| All of them | **The first run unlocks several things at once.** Players get hooked in run 1, then the gaps grow. | Unlock cadence (§4.4) |

---

## 3. Achievements & unlock system (Phase B)

### 3.0 Status
`[x]` Phase B core built on branch `v3-dev` (`docs/prog.js`): achievements, unlock gates, menus, toasts, reveal, 3.0 wipe. Kill milestones were rescaled after the first bot test (a good run kills ~5,000 enemies). Unlocks earned mid-run apply from the **next** run, as in Vampire Survivors.

### 3.1 Fresh account (new save)
- **Heroes:** Goku, Piccolo, Gohan.
- **Attacks:** Ki Blast, Special Beam Cannon, Masenko, Kamehameha.
- **Passives:** their pairs: Multi-Form, Zenkai Boost, Ki Control.
- **No** Ki Burst, **no** Dragon Balls, **no** Time Chamber chests (they unlock on first death, see M1 in §4.2).
- **Shop:** Saiyan Vitality, Battle Power, Gravity Chamber, Scouter Data. Everything else unlocks.
- Level-up choices only ever offer unlocked items. A locked item never shows up.

### 3.2 Achievement types
- **Story (visible):** boss kills and level clears.
- **Milestones (visible, with progress bars):** lifetime kills, run level, evolutions, wishes, Zeni earned.
- **Secret (hidden):** shown as "??? Secret" with a one-line riddle hint until you get it.
- Every achievement gives *something*: an unlock, a shop item, or a Zeni bonus.

### 3.3 UI
- Main menu: new **Achievements** button. A trophy grid shows the requirement, the reward and a progress bar.
- In-run toast: "**ACHIEVEMENT: Bald Brute** · Dragon Balls unlocked!" (non-blocking).
- End-of-run screen: a **NEW UNLOCKS** reveal, one card at a time, with a sound sting (Vampire Survivors style).
  This is where the satisfaction lands.
- Character select: locked heroes show as dark silhouettes with "Defeat Vegeta to unlock".
- **Collection** page: every attack and passive, its evolution partner, and a ✓ once you've evolved it.
  Undiscovered evolutions show "???".

### 3.4 Existing players: full wipe (decided)
- When 3.0 ships, **all save data is wiped** and everyone starts fresh (Zeni, shop, level unlocks, best times,
  saved run). No migration code.
- Settings (sound, graphics, joystick, flashing) are kept. They're preferences, not progress.
- First launch of 3.0 shows a one-time "Welcome to 3.0: your journey starts over" card so the wipe isn't a surprise.

---

## 4. The unlock table

### 4.1 Story (visible)
| # | Achievement | Requirement | Unlocks |
|---|---|---|---|
| S1 | Saiyan Arrival | Survive 1:00 on Level 1 | **Senzu Bean** passive + **Kaioken Aura** |
| S2 | Brother's Keeper | Defeat Raditz | **Ki Burst** ultimate + shop: Ki Reserves |
| S3 | Bald Brute | Defeat Nappa | **Dragon Balls** + **Dragon Radar** passive + **Hellzone Grenade** **(?)** see Q1 |
| S4 | Prince of All Saiyans | Defeat Vegeta | **Level 2** + **Vegeta playable** + **Galick Gun** |
| S5 | Planet Namek | Survive 10:00 on Level 2 | Shop: Capsule Magnet |
| S6 | Ultra Fighting Bomber | Defeat Recoome | **Explosive Wave** (new) |
| S7 | Fastest in the Universe | Defeat Burter and Jeice | **Afterimage Strike** (new) |
| S8 | Time Stands Still | Defeat Guldo | **Time Freeze** floor pickup (new mechanic) |
| S9 | Special Fighting Pose | Defeat Captain Ginyu | **Ginyu Force Challenges** (run modifiers, §6.3) |
| S9a | Emperor of the Universe | Defeat Frieza (first form) | +600 Zeni |
| S9b | Fearsome Transformation | Defeat Frieza's second form | +900 Zeni |
| S10 | Namek is Free | Defeat Frieza (Final Form) | **Level 3** + **Limit Break** + shop: Potential Unleashed (5th attack slot) |
| S11-S16 | (Level 3) | See §8 | |
| S17-S23 | (Level 4) | See §9 | Ends with **Endless Mode** |

### 4.2 Milestones (visible)
| # | Achievement | Requirement | Unlocks |
|---|---|---|---|
| M1 | Snake Way | Die for the first time | Shop: **King Kai's Training** (new revive, §7) + Time Chamber events |
| M2 | Warrior | 2,000 lifetime kills | **Weighted Training** + **Destructo Disc** |
| M3 | Hardened | Survive 5:00 in any run | **Saiyan Armor** + **Solar Flare** |
| M4 | Power Within | Evolve any attack | **Hyperbolic Chamber** + **Spirit Bomb** + shop: Ki Mastery |
| M5 | Level Up! | Reach level 20 in a run | Shop: Senzu Stock (rerolls) |
| M6 | Veteran | 15,000 lifetime kills | **Tri-Beam** (new) |
| M7 | Legendary | Transform (3 evolutions in one run) | **Dragon Thunder** |
| M8 | Eternal Dragon | Make your first wish | Shenron offers a **4th wish choice** + 500 Zeni |
| M9 | Full Arsenal | Have 4 attacks and 5 passives at once | Shop: **Mafuba Seal** (banish, §6.4) |
| M10 | Capsule Corp Investor | Earn 5,000 lifetime Zeni | Shop: Hercule Sponsorship |
| M11 | Over the Limit | Reach level 25 in a run | **Capsule Vacuum** floor pickup (collects all XP gems) |
| M12 | Saiyan Army | 40,000 lifetime kills | +1,000 Zeni |
| M13 | Hero of Earth | Clear Level 1 with all 3 starter heroes | +1,000 Zeni |
| M14-16 | Slayer tiers | 75k / 150k / 300k kills | Zeni (late-game sink) |
| M17 | Dragon Hunter | Collect 10 Dragon Balls in total | Shop: Battle Armor |
| M18 | Elite Hunter | Defeat 25 elite enemies in total | +500 Zeni |

### 4.3 Secret (hidden until earned)
| # | Name | Hint shown | Requirement | Unlocks |
|---|---|---|---|---|
| X1 | Yamcha'd | "Even the best fall early." | Die within the first 1:30 | **Wolf Fang Fist** (new) |
| X2 | It's Over 9000! | "What does the scouter say?" | Deal over 9,000 damage to one boss within 10 seconds | **Scouter** HUD toggle (boss power level readout) + 900 Zeni |
| X3 | Bald Destiny | "A disc for a friend." | 5,000 lifetime Destructo Disc kills | **Krillin playable** + **Scattering Bullet** (new) |
| X4 | Untouchable | "Not a scratch." | Defeat Nappa without taking damage during the fight | +500 Zeni |
| X5 | Kakarot! | "Never give up." | Defeat Vegeta as Goku while below 10% HP | +500 Zeni |
| X6 | Senzu Addict | "Korin is worried." | Eat 50 Senzu Beans in one run | +300 Zeni |
| X7 | Instant Transmission | "Two in a blink." | Grab 2 Dragon Balls within 10 s | +300 Zeni |
| X8 | Prince's Pride | "A rematch." | Defeat Vegeta as Vegeta | Vegeta alt colours (Saiyan-saga armour) |
| X9 | Body Change! | "Strike a pose." | Beat all 5 Ginyu Force members in one run without dropping below 50% HP | +800 Zeni |
| X10 | Final Flash | "Overkill." | Kill 150 enemies with one Ki Burst | +500 Zeni |

### 4.4 Expected cadence (target, verified with the bot in Phase E)
| Runs | What a typical player unlocks |
|---|---|
| Run 1 | Saiyan Arrival, Snake Way, probably Raditz, maybe Warrior. **3-4 unlocks right away** |
| Runs 2-4 | Hardened, Power Within, Level 20, Nappa (Dragon Balls) |
| Runs 5-8 | Veteran, Legendary, Vegeta → **Vegeta + Level 2** |
| Runs 8-15 | Namek bosses one by one, first wish, maybe Krillin |
| Runs 15-22 | Frieza → **Level 3** |
| Runs 22-35 | Level 3 bosses, Trunks |
| Runs 35-50 | Level 4, Gotenks, Kid Buu → **Endless** |

### 4.5 Keeping Levels 3-4 from feeling sparse
You asked that the late game not feel sparse. On top of the story unlocks in §8-9, each of Levels 3 and 4 gets:
- **Every boss and every form gives something.** Small rewards fill the gaps: shop items, wish options,
  pickups, alt colours and Zeni bundles.
- **4-5 level-specific secrets** (e.g. "Kill Cell during his self-destruct countdown", "Beat Android 19
  without using a beam attack", "Dodge every Planet Burst").
- **Hero mastery:** clear each level with each hero to unlock that hero's alternate colours and a small
  mastery perk (+5% to their signature stat). 7 heroes × 4 levels = 28 goals that pay out steadily.
- **Challenge clears:** clear each level with each Ginyu Challenge on (Zeni and titles).
- **Lifetime milestones that scale into the late game:** 100 evolutions, 50 wishes, 25 fusions, Endless 20/30/45/60 min.
- Target: **at least one new unlock every 2 runs** in Levels 3-4, checked with the bot cadence report in
  Phase E and again in Phase H. If it's sparse, we move rewards earlier or add more.

### 4.6 Phase E results (Levels 1-2 balance pass, bot-tested on Hard)
`[x]` Done on `v3-dev`. The bot plays like a strong player, so a human will land a bit later on every row.
- **Bot fixes first:** the bot now dodges telegraphed beam lanes (it walked through Frieza's Death Beams before),
  picks the heal on Limit Break when hurt, ends capped runs properly, and its shop presets start from an empty shop.
  Earlier Frieza numbers were too pessimistic because of the lane bug.
- **Level 1 (unchanged):** brand-new account, no shop: Nappa 6/9, Vegeta 0/9. Light shop (~1,500 Zeni, 3-4 runs):
  Vegeta about 1 in 6 (7/40), Nappa about 40%. On target ("Vegeta becomes winnable after a few runs of upgrades").
- **Level 2:** Frieza fights ran 6-10 minutes and stacked with Captain Ginyu. Changes:
  Frieza now waits until Ginyu is down (+25 s, never more than 90 s late); boss HP multipliers
  Recoome 3.6→3.0, Ginyu 4.2→3.6, Frieza 3.2/3.2/4.2 → 2.4/2.0/2.7; Piccolo +20% damage (slowest boss-killer).
  Solid shop (~3,500 Zeni): Frieza won 3/12 with Frieza at 2.4/2.2/3.0 and 6/12 at 2.4/1.9/2.5; the final 2.4/2.0/2.7
  sits between (about 1 in 3, not re-measured). Maxed shop: 4/4.
  Winning Frieza fights now take 3-6 minutes for all three forms.
- **Cadence (30-run campaigns from a fresh account):** run 1 gives 6-9 unlocks, Vegeta falls around run 3-8,
  Frieza around run 11-13. Changes: Planet Namek now needs 10:00 on Level 2, Veteran 15k kills, Saiyan Army 40k,
  Level 30 → Level 25 for the Vacuum (Level 30 never happened), and two new milestones for the
  Level 1 grind (Dragon Hunter: 10 Dragon Balls → Battle Armor; Elite Hunter: 25 elites → +500 Zeni).
- **Still open (for you):**
  1. **Shop is fully bought by about run 13** (17,780 Zeni). Fine for Levels 1-2, but Levels 3-4 will have nothing to
     buy. Price pass planned for after Levels 3-4 exist (your decision 6).
  2. **Wishes (loosened, your call):** up to 3 Dragon Balls can now wait on the map (was 2) and a new one spawns
     every 34 s (was 42 s); distance and guards are unchanged. A bot that fetches balls mid-fight (`BOT_BALLS = 1`)
     collects 4-7 per Namek run and made its first wish; Level 1 runs are short, so wishes there stay rare.
  3. Gohan is the strongest hero on Namek, Piccolo the weakest even after the buff.
- Shop now fits on a small phone without scrolling (compact rows on screens 420 px wide or less).

---

## 5. New attacks & characters (Phase C)

Goal: **every passive pairs with exactly 2 attacks.** That's 6 new attacks for the current 8 passives,
plus 2 new passives with 2 attacks each for Levels 3-4. **Total: 20 attacks, 10 passives.**

### 5.1 Final pairing table
| Passive | Attack A | Attack B (NEW in bold) |
|---|---|---|
| Zenkai Boost | Special Beam Cannon | Masenko |
| Hyperbolic Chamber | Spirit Bomb | Dragon Thunder |
| Ki Control | Kamehameha | **Explosive Wave** |
| Multi-Form | Ki Blast | **Tri-Beam** |
| Senzu Bean | Kaioken Aura | **Wolf Fang Fist** |
| Weighted Training | Destructo Disc | **Afterimage Strike** |
| Saiyan Armor | Solar Flare | **Galick Gun** |
| Dragon Radar | Hellzone Grenade | **Scattering Bullet** |
| **Infinite Energy** (L3) | **Shining Sword Attack** | **Android Barrier** |
| **Majin Mark** (L4) | **Ghost Kamikaze** | **Candy Beam** |

### 5.0 Status
`[x]` Phase C built on `v3-dev`: `docs/w3.js` (six attacks, evolutions, Mythic effects, icons) and `docs/heroes3.js` (Vegeta, Krillin).
Level-5 crowd damage per second was bot-measured against the old attacks and tuned into the same band (Kamehameha ~1,650, Hellzone ~950):
Galick ~1,860, Tri-Beam ~1,720, Afterimage ~1,170, Scattering ~1,020, Explosive Wave ~930 (plus knockback), Wolf Fang ~880 (also strong on bosses).
Vegeta's Saiyan-saga alt colours (secret X8 reward) landed in Phase D: shoulder pads, scouter, darker suit; toggled from the menu under his card.

### 5.2 New attacks (Levels 1-2)
Each one gets a distinct shape on screen so it doesn't overlap an existing attack.

| Attack | Behaviour | Scales with level | Evolution (with passive) |
|---|---|---|---|
| **Galick Gun** (Vegeta) | Charges 0.6 s, then a purple beam *sweeps* a 70° arc toward the densest crowd | Damage, sweep arc, width | **Final Flash** (Saiyan Armor): huge, screen-length beam with brief knockback |
| **Explosive Wave** | Expanding shockwave ring centred on you that **pushes enemies back** (the first crowd-control knockback) | Ring radius, push, damage | **Super Explosive Wave** (Ki Control): double ring, stuns non-bosses |
| **Tri-Beam** | Fires at the biggest cluster. Damage **ramps the longer it stays on the same group** | Ramp speed, triangle size | **Neo Tri-Beam** (Multi-Form): three triangles at once |
| **Wolf Fang Fist** | Afterimage fists dash out to the nearest 2-6 enemies, hitting several times each. Short range, fast | Targets, hits | **Neo Wolf Fang Fist** (Senzu Bean): each combo heals 1 HP |
| **Afterimage Strike** | While moving you leave afterimages that explode after 1 s. **Rewards kiting** | Images per second, blast size | **Instant Transmission Strike** (Weighted Training): afterimages also teleport-strike the nearest enemy |
| **Scattering Bullet** (Krillin) | A ki orb rises, then bursts into shards that rain over a wide area | Shards, burst area | **Scattering Barrage** (Dragon Radar): shards pull XP gems toward you |

### 5.3 Playable Vegeta  `[x]`
- **Unlock:** defeat Vegeta. He's offered as the next hero on the end card.
- **Starter:** Galick Gun.
- **Passive "Saiyan Pride":** +20% damage to bosses and elites. Each boss you defeat heals 20% HP.
  (Rewards aggressive boss play. Goku = low-HP clutch, Piccolo = sustain, Gohan = growth, Vegeta = boss killer.)
- **Ki Burst:** "Big Bang Attack": a single huge detonation at the strongest enemy on screen.
- **Transformation (3 evolutions):** Super Saiyan Vegeta with his own cutscene line ("I am the prince of all Saiyans!").
- **Model:** the playable version wears the **Namek-era outfit**: white chest armour *without* shoulder pads,
  dark blue suit, white gloves and boots, **no scouter**, different stance/idle. The Level 1 boss keeps
  the Saiyan-saga look (shoulder pads, scouter, brown/olive armour). The Prince's Pride secret (X8) unlocks
  the Saiyan-saga look as an alternate colour scheme.

### 5.4 Krillin (secret)  `[x]`
- **Unlock:** Bald Destiny (1,500 Destructo Disc kills).
- **Starter:** Destructo Disc.
- **Passive "Lucky Monk":** +1 reroll per run, treasure chests give +1 choice, a bit more rarity luck.
- **Ki Burst:** "Solar Flare Burst" (stuns the whole screen).
- **Transformation:** none canonically, so 3 evolutions trigger **"Potential Unlocked"** (Elder Kai glow, same buffs as the others).

---

## 6. New systems tied to bosses (Phase D)

### 6.0 Status
`[x]` Phase D built on `v3-dev`: `docs/sys3.js` (§6 systems, Scouter readout, Vegeta's outfit toggle) and `docs/cut3.js` (§7 King Kai cutscene).
Decisions made while building (easy to change in Phase E):
- **Ginyu Pose** is a 1.25× game-speed multiplier (everything, including you and your attacks, moves faster).
- **Limit Break** boosts apply to your whole build, not a single chosen attack: +4% damage, +3% area (cap +60%), +2% movement speed (cap +20%), or +5 max HP with a full heal. (Phase G2: the −2% cooldown option was removed; see the cooldown cap in §9.5.) It replaces the old "full heal when everything is maxed". It can be toggled off in Settings.
- **Pickups:** elites drop one 25% of the time, other enemies 1 in 3,000; at most 3 on the map. Bot: about 2 per short run.
- **Scouter:** a green power-level tag above each boss on screen (turns gold over 9,000). Toggle in Settings.
- **Challenge achievements:** each challenge has "clear Level 1" (+400) and "clear Level 2" (+800), plus all three on Level 2 (+2,500). Levels 3-4 add theirs later.
- The shop now has 13 rows and needs a short scroll on phones; look at that in the Phase E shop pass.

### 6.1 Time Freeze pickup (Guldo)  `[x]`
A rare floor item (from elites or chests): freezes every non-boss enemy for 5 s and slows bosses by 50%.

### 6.2 Capsule Vacuum pickup (Level 30)  `[x]`
A rare floor item: pulls every XP gem on the map to you.

### 6.3 Ginyu Force Challenges (Ginyu)  `[x]`
Optional toggles on the level select. Stack them for bigger Zeni payouts:
- **Ginyu Pose (Hyper):** everything moves 25% faster, including you. +40% Zeni.
- **Recoome's Time Limit (Hurry):** bosses arrive 30% sooner. +30% Zeni.
- **100x Gravity (Curse):** enemies +40% HP and +15% speed. +60% Zeni.
- Each challenge gets its own "clear Level X with this on" achievements, giving longer-term goals.

### 6.4 Mafuba Seal (banish)  `[x]`
Shop item, 3 levels: +1 seal per run per level. On a level-up card, **Seal** removes that choice from the pool
for the rest of the run. Lets players aim for a build without hoping for luck.

### 6.5 Limit Break (Frieza)  `[x]`
When everything you own is maxed and your slots are full, level-ups offer small permanent stacking
boosts (+4% damage, +3% area, −2% cooldown, +5 HP) to a chosen attack. Required for Endless. Toggle in settings.

### 6.6 Potential Unleashed (Frieza → shop)  `[x]`
An expensive shop item (~3,000 Zeni): **5th attack slot.** A big Zeni sink that makes Levels 3-4 feel different.

---

## 7. King Kai's Training: revive cutscene  `[x]`
- **Replaces** Zenkai Revival in the shop (anyone who owns it keeps it as King Kai's Training).
- **Unlock:** Snake Way achievement (first death). **Price:** 1,200 Zeni (unchanged). **(?)**
- **Effect:** once per run, on death:
  1. The game freezes, your character gets a halo, and the screen fades to the Other World.
  2. **Snake Way run** (~2.5 s): side-scrolling winding orange road through clouds, your hero sprinting.
  3. **King Kai's planet** (~3 s): tiny planet with heavy gravity, a quick 3-panel training montage
     (weighted push-ups, chasing a monkey around the planet, a gravity sprint). Original drawn art in the
     game's style.
  4. "**REVIVED!**" flash. You're back where you fell with **full HP, +1 level-up** (and its choice screen),
     3 s of invulnerability, and nearby non-boss enemies blown away.
- Tap to skip after you've seen it once.
- Built as an ~8 s cutscene: halo, Snake Way sprint, three montage panels (x10 gravity push-ups, catch the monkey, gravity sprint) with King Kai watching, then REVIVED!. Revive kills non-bosses within 240 and pushes back the rest.
- Rebalance check: full HP plus a level is much stronger than 50% HP. If the bot shows it trivialises
  Level 1, the price goes up to ~1,800.

---

## 8. Level 3: Android & Cell Saga (Phase F)

### 8.0 Status
`[x]` Built on `v3-dev`: `docs/lv3.js` (stage, mobs, bosses, art, map, intro, ring, achievements), `docs/w4.js`
(Infinite Energy, Shining Sword Attack, Android Barrier), Future Trunks in `docs/heroes3.js`.
Changes from the plan while building (easy to revisit):
- **Infinite Energy** is +6% damage and +12% Ki Burst charge per level, and at level 5 the Ki Burst refills by itself.
  "Attack duration and projectile speed" can't be applied to every attack without rewriting each one.
- **Mobs:** battle drones (melee), gunner drones (about 1 in 10, ranged), bio-larvae from 2:00, Cell Juniors from 4:00.
  Swarm events are a drone ring at 1:00, then larvae rings. The city is a little less crowded than the Wasteland.
- **Boss hand-offs:** each boss waits until the one before is down (+15 s, never more than 75 s late), like Frieza.
- **Perfect Cell's self-destruct:** at 10% HP he stops for 10 s. Kill him (secret achievement) or take a blast for half
  your max HP, after which he comes back at 30% HP and powered up.
- **Extra achievements:** City in Ruins (survive 10:00, +800), three secrets (Perfect Timing, Behind You!, Twin
  Takedown), and Ginyu Challenge clears for Level 3. S16 grants the Fusion Dance flag; the system itself is Phase G.
- **Balance (bot, Hard, fully bought shop):** Perfect Cell beaten in 6 of 8 runs, finishing at 8:45-11:27. Not yet
  tested with a partial shop; that waits for the shop price pass. Notes: a bot never walks behind Android 19, so his
  absorb is harder for it than for a player; Trunks is the slowest boss-killer for the bot because his sword is short-range.
- **Map:** ruined city and highlands (grey rubble, broken roads, cliff islands). For the finale the
  **Cell Games ring** appears around you. The ring has edges you can't cross, so the arena tightens.
- **Length:** ~9:00 to the final boss.
- **Mobs:** Red Ribbon battle drones (ranged), Cell Juniors (exist already), later "bio-larvae" that rush in swarms.
- **New passive: Infinite Energy.** +10% attack duration and projectile speed per level. At max level,
  Ki Burst charges slowly by itself.

| Time | Boss | Signature mechanic | First-kill unlock |
|---|---|---|---|
| 1:30 | Android 19 ("fake" android) | **Energy absorb**: grabs your beams to heal unless you hit him from behind | S11: **Infinite Energy** passive |
| 3:00 | Dr. Gero (Android 20) | Eye-laser lanes, flees and spawns drones | S12: **Future Trunks playable** + **Shining Sword Attack** |
| 4:30 | Android 17 & 18 ("real" androids) | Tag team: 17 throws barrier domes, 18 rapid-fires | S13: **Android Barrier** |
| 6:00 | Android 16 | Slow heavy tank: Rocket Punch (homing fist), **Hell's Flash** wide beam lanes, grabs and slams | S14: Wish pool +1 option |
| 7:30 | **Cell: Imperfect → Semi-Perfect → Perfect** (one boss with forms, like Frieza) | Imperfect absorbs nearby mobs to heal. Semi-Perfect charges and stomps. Perfect: Cell Games ring, Cell Jr summons, Solar Kamehameha lanes, **self-destruct countdown** at 10% (kill him or survive the blast) | S15 (Imperfect): Capsule Vacuum drops more often · S15b (Semi-Perfect): Zeni bundle · S16 (Perfect): **Level 4** + **Fusion Dance** |

- **Future Trunks:** passive "Hope of the Future" (attacks deal +30% to enemies at full HP, so great for
  opening hits), starter **Shining Sword Attack** (fast sword-slash arcs in front of you that finish with a ki blast).
- **Android Barrier:** a pulsing dome that blocks enemy projectiles and knocks back mobs every few seconds.
  Evolves (Infinite Energy) into **Perfect Barrier**: reflects projectiles.
- **Shining Sword Attack** evolves (Infinite Energy) into **Burning Sword Rush.**

---

## 9. Level 4: Majin Buu Saga (Phase G)

### 9.00 Status
`[x]` Built on `v3-dev`: `docs/lv4.js` (stage, mobs, bosses, hazards, art, map, intro, achievements), `docs/w5.js`
(Majin Mark, Ghost Kamikaze, Candy Beam, Fusion Dance, Gotenks, Super Saiyan 3 Goku, Majin Vegeta form),
`docs/endless.js` (§9.2) and `docs/cut4.js` (§9.0 cutscenes).
Changes from the plan while building (easy to revisit):
- **Map** changes with time: Babidi's ship (to 3:20), the rocky wasteland (to 6:20), then the ruined city with candy.
  Candy puddles in the city slow you down.
- **Mobs:** Majin Fighters (go berserk below half health), demon imps (ranged), Buu blobs from 2:30 that split into two
  bits when they die. Swarm rings at 1:00, 3:45 and 6:50.
- **Bosses:** Pui Pui (x10 gravity zones that slow you), Yakon (darkness: you only see a circle around you; Solar Flare
  heals him and he takes half damage from outside your light), Dabura (sword lanes, fire fans, stone spit that
  leaves puddles which root you for 1 s), Majin Vegeta (uses the playable Vegeta's Super Saiyan sprite with the M;
  Big Bang zones, Galick lanes, and at 20% HP a 4-second Final Explosion you must run from, after which he is
  exhausted and takes +50%), Fat Buu (turns up to 4 nearby mobs into candy that floats to him and heals him; grab it
  first for +3 HP; regenerates if you stop hitting him for 2.5 s), Super Buu (absorbs one of your attacks for 15 s),
  Kid Buu (teleports, Planet Burst every ~15 s: the whole screen blows up except three safe circles).
  Each boss waits for the one before (+15 s, never more than 75 s late), like Level 3.
- **S18 (Yakon)** gives **Shenron's blessing** (each wish also fully heals you and adds 10 max HP) instead of a 6th wish
  choice: wishes offer your attacks, and a 6th choice almost never mattered.
- **S20 (Majin Vegeta):** Vegeta's transformation becomes Majin Vegeta (the M, a new title and line) and gives +10% damage.
- **Majin Mark:** +10% damage and +5% XP per level, enemies spawned afterwards move 5% faster per level. Every hero shows the M.
- **Gotenks:** Show-Off (+15% damage above 70% HP), starts with Ghost Kamikaze (fires 15% faster), Ki Burst
  **Galactic Donut** (a ring traps a crowd, squeezes it and explodes), transforms to Super Saiyan 3.
- **Extra achievements:** Candy Land (survive 10:00, +1,000), five secrets (Lights Out, Not Today Vegeta, Sweet Tooth,
  Planet Survivor, Rock Solid), Ginyu Challenge clears for Level 4 (+1,600 each), Dance Partners (first fusion, +600),
  Fusion Master (10 fusions, +1,500), Endless 20/30/45/60 minutes (+2,000/3,000/5,000/8,000).
- **Balance (bot, Hard, fully bought shop, every unlock including Level 4's):** Level 4 won 2-3 of 10 across heroes
  (wins finish at 8:30-13:00). Tuning done: Fat Buu's healing cut (it made him unkillable for weaker builds),
  Majin Fighters' berserk speed 1.6x → 1.3x, swarm rings and walls use small blob bits, boss health about 15% above
  the Level 3 equivalents.
- **Important for Phase H:** under the same conditions **Level 3 also only won 1 of 10** (it won 6 of 8 in Phase F,
  before the Level 4 unlocks existed). With 20 attacks and 10 passives in the pool the bot rarely completes evolution
  pairs (many runs end with 0-1 evolutions at level 20+). It also never uses Mafuba Seals or rerolls, and it takes
  Majin Mark (faster enemies) like any passive. Phase H should look at evolution reliability with a full pool
  (and teach the bot to seal and reroll) before judging Level 3-4 difficulty.

- **Map:** Babidi's spaceship interior → rocky wasteland → ruined city. Pink candy-themed hazards late on.
- **Length:** ~10:30 to the final boss.
- **Mobs:** Majin-marked fighters (frenzied when low), Buu blobs that **split in two** when killed.
- **New passive: Majin Mark** (a risk/reward "curse"): +10% damage and +5% XP per level, but enemies
  get +5% speed per level. Your character gets the Majin "M" visual.

| Time | Boss | Signature mechanic | First-kill unlock |
|---|---|---|---|
| 1:30 | Pui Pui | Heavy-gravity zones (slow you) | S17: **Majin Mark** passive |
| 3:00 | Yakon | **Darkness**: screen goes dark except around you, and light-based attacks feed him | S18: Wish pool +1 option |
| 4:30 | Dabura | Stone spit: petrify puddles that root you | S19: **Candy Beam** |
| 6:00 | Majin Vegeta | Big Bang and **Final Explosion** phase (huge telegraphed blast) | S20: Vegeta's 3-evolution form becomes **Majin Vegeta** |
| 7:30 | **Majin Buu: Fat → Super → Kid** (one boss with forms, like Frieza) | **Fat:** candy beam turns mobs into healing candy for *him*, regenerates unless you burst him. **Super:** absorbs one of your attacks for 15 s (it greys out). **Kid (final):** teleport chaos, Planet Burst (whole-screen telegraph with safe spots) | S21 (Fat): more fusion recipes · S22 (Super): **Gotenks playable** + **Ghost Kamikaze** · S23 (Kid): **ENDLESS MODE** + Super Saiyan 3 Goku (Goku's transformation upgrade) |

- **Gotenks:** passive "Show-Off" (+15% damage while you have more than 70% HP), starter **Ghost Kamikaze**
  (wandering ghosts that latch onto enemies and explode). Evolves (Majin Mark) into **Super Ghost Kamikaze Attack.**
- **Candy Beam:** random non-boss enemies get turned into candy (instant kill, 4% chance to drop a heal).
  Bosses take a damage-over-time instead. Evolves (Majin Mark) into **Candy Storm.**

### 9.0 Boss transformation cutscenes (Frieza, Cell, Buu) + Super Saiyan upgrade  `[x]`
Built in `docs/cut4.js`: middle forms ~2.8 s, final forms ~4.6 s (silhouette until a shockwave reveal), Super Saiyan
~3.8 s with a speeding heartbeat into a major-key brass hit. Each hero has its own title and line (Goku's becomes
Super Saiyan 3 after Kid Buu, Gohan gets static sparks, Krillin's is white). Gameplay pauses during them; the bot skips them.

Each boss form change gets a short cutscene (~3 s, tap to skip after the first viewing), built like the existing SSJ one:
- **Middle forms** (Frieza 2nd, Semi-Perfect Cell, Super Buu): screen dims, the boss's aura flares, a camera
  push-in, a short roar and a title card ("FRIEZA TRANSFORMS!").
- **Final forms** (Frieza Final, Perfect Cell, Kid Buu): the full treatment.
  - **Foreboding music sting** (low drones, slow timpani, minor key) that carries into the boss theme.
  - **Sky darkens** (map tinted dark, vignette closes in).
  - **Lightning strikes** around the boss with thunder cracks.
  - **Rubble rises** from the ground in slow motion and hangs in the air, plus a ground-crack ring.
  - The boss is silhouetted, then revealed in the new form with a shockwave.
- **Super Saiyan transformation (all heroes) gets upgraded** to the same quality, but **heart-thumping, not
  foreboding**: rising heartbeat drums into a major-key brass hit, sky darkens with *golden* lightning,
  rubble rises around the hero, then a golden burst. (Vegeta's line, Krillin's "Potential Unlocked",
  Gohan's SS2 static sparks and Goku's SS3 (Kid Buu unlock) each get their own variation.)
- Reduced-flashing setting softens the lightning.

### 9.1 Fusion Dance (unlocked by Perfect Cell)  `[x]`
Built: when both attacks of a recipe are evolved, a gold **Fusion Dance** card appears on level-up (also on Limit
Break cards). The two attacks become one fused attack and the slot is freed. Recipes: Final Kamehameha
(Kamehameha + Galick Gun), Father-Son Kamehameha (Kamehameha + Masenko), Mentor's Light (Special Beam Cannon +
Masenko); after Fat Buu also Twin Kienzan Storm (Destructo Disc + Scattering Bullet) and Dragon Spirit Bomb
(Spirit Bomb + Dragon Thunder). Fused beams hit several times but are capped against bosses, like Super Kamehameha.

Two **evolved** attacks fuse into one super-attack and **free a slot** (like Unions in Vampire Survivors):
- Super Kamehameha + Final Flash → **Final Kamehameha**
- Super Kamehameha + Hyper Masenko → **Father-Son Kamehameha**
- Makankosappo + Hyper Masenko → **Mentor's Light** (Piccolo and Gohan)
- (more recipes from Fat Buu: Kienzan + Scattering Barrage → **Twin Kienzan Storm**, etc.)

### 9.2 Endless Mode (unlocked by Kid Buu)  `[x]`
Built as planned: maps change every 5:00 (Wasteland → Namek → City → Buu Saga → repeat), 3-4 bosses of that saga
return on each map, each 20-minute loop makes bosses 1.5x tougher, mob health holds the 9-minute curve and then grows
1.5x per loop, Limit Break is forced on, +40 Zeni per minute, and the best time shows on the menu button.

- One continuous run that **cycles through all 4 maps** every ~5 min.
- Bosses from every arc return in escalating waves (×1.5 toughness each cycle).
- Limit Break on, Zeni paid per minute survived. Best time and kills saved.
- Achievements at 20 / 30 / 45 / 60 minutes.

---

## 9.5 Phase G2: Wish-powered fusions, Namekian Dragon Balls, hero carousel (your 2026-11-13 ideas)
`[x]` Built on `v3-dev`: `docs/ui4.js` (carousel), `docs/dball5.js` (Namekian balls, Porunga, wish/fusion
achievements), fusion tiers and the three new recipes in `docs/w5.js`. Notes from building:
- Wish power carries into a fusion too: the fused attack keeps both parents' +5 wish power levels (capped at +10).
- Tier damage is x1 / x1.35 / x1.8 on top of that, plus each tier's extra trick. Fused hits on bosses stay capped
  per hit (the cap rises with the tier), so a two-wish fusion is a crowd-wiper and a strong, not instant, boss-killer.
- The first Fusion Dance (Dance Partners) unlocks the last three recipes. New milestones: Porunga's Gift, Wish Upon a
  Fusion, Ultimate Fusion, Fusion Collector (all 8).
- **Cooldown cap (your call):** all cooldown reduction combined (Hyperbolic Chamber, Super Saiyan, Gohan's passive)
  can never make cooldowns shorter than 55% of normal. Hyperbolic Chamber itself tops out at −40% and its card says so.
  Limit Break no longer offers cooldowns; it offers +2% movement speed instead.
- **Updates no longer mix old and new files:** the service worker now always checks with the server (a cheap
  "not modified" when nothing changed). Before, the browser's own cache could serve an old file next to new ones.
  This is how the old summoning titles ("Arise, eternal dragon!") showed up for Porunga.
- One pointer per off-screen Dragon Ball (the old small arrow was removed); it reads "Namekian ball" for the second set.
- First set: the first ball appears at 0:30 (was 0:45), then every 26 s (was 34 s), about 20% closer, and only balls
  6-7 are guarded (was 5-7). Namekian balls are slower, farther, and balls 5-7 are guarded.
- **Hero carousel:** the hero row becomes a swipeable carousel. The selected hero is large and plays their idle
  animation, neighbours are smaller on either side, and locked heroes appear as silhouettes with what unlocks them.
  Arrows, swipe, tap on a neighbour, and the left/right keys all work.
- **Wishes carry into fusions.** A fusion only appears once both attacks are evolved (already true). Each fused attack
  has three tiers:
  1. **Fusion:** the base fused attack.
  2. **One wish:** one parent had Shenron's/Porunga's wish, or you wish on the fused attack. Bigger and stronger,
     plus one new trick.
  3. **Two wishes:** both parents were wished on, or you wish on a one-wish fusion. The showpiece version with its
     own look and a signature effect.
  Wishing on an attack shows what it does to its fusion ("Final Kamehameha becomes the one-wish version"). Each tier
  is the same attack escalating, not a separate attack, so every recipe stays on one balance curve.
- **More recipes (8):** Final Kamehameha, Father-Son Kamehameha, Mentor's Light (Perfect Cell); Twin Kienzan Storm,
  Dragon Spirit Bomb (Fat Buu); Kaioken Wolf Fang Barrage, Sweet Ghost Parade, Hellzone Tri-Cage (first Fusion Dance).
- **Namekian Dragon Balls** (unlocked by beating Level 2): once you've used Shenron's wish in a run, a second set of
  seven stone-carved Namekian balls starts appearing, and **Porunga** grants a second wish. Two wishes per run at most.
- **The first set is easier to collect** (sooner, more often, closer, guards only on the last two). Boss tuning in
  Phase H assumes a good run gets one wish on Levels 1-2 and two on Levels 3-4.
- **Pacing (Phase H):** the shop shouldn't be finished until a player has had at least a couple of Level 4 runs.
  New achievements (fusion tiers, Porunga, wish combos) are spread across the four levels.

## 10. Shop after the expansion (balance target)
| Item | Status | Unlocked by |
|---|---|---|
| Saiyan Vitality, Battle Power, Gravity Chamber, Scouter Data | existing | start |
| Ki Reserves | existing | Raditz |
| Senzu Stock (rerolls) | existing | Level 20 |
| Capsule Magnet | existing | Survive 2:00 on Namek |
| Battle Armor, Hercule Sponsorship | existing | 5,000 lifetime Zeni |
| Ki Mastery (area) | existing | Evolve any attack |
| King Kai's Training | replaces Zenkai Revival | First death |
| Mafuba Seal (3 levels) | **new** | Full Arsenal |
| Potential Unleashed (5th attack slot) | **new** | Frieza |

- **Zeni targets:** Level 2 needs ~3,800 Zeni spent (existing target). **Level 3 about 6,500. Level 4 about
  9,500. Endless and Insane want a near-full shop (~17,000).**
- Level payouts scale up for Levels 3-4 so the climb takes about the same number of runs per level.

### 10.0 Phase H balance pass  `[x]`
- **Level-up offers are weighted** (`docs/bal5.js`): upgrades to what you own ×1.8, a passive that evolves an attack you
  own ×2.2, an attack whose passive you own ×1.3, Majin Mark ×0.7. With 20 attacks and 10 passives a purely random
  pick rarely completed an evolution pair. A first try at ×2.5/×3/×1.8 made every level far too easy.
- **The bot rerolls weak cards** and treats Majin Mark as a curse, like a player would.
- **Levels 3-4:** spawns thinned 40% → 50% (the screen used to flood at 4-5 minutes); bosses +25% health; mobs
  1.05× → 1.2× health; Android 19 absorbs for 1.8 s every 9 s (was 2.2 s / 8 s); Fat Buu regenerates only after 4 s
  unhit and candy heals 0.4%.
- **Dragon Balls** spawn 20% more often on Levels 3-4.
- **Gohan** was winning every first clear: XP bonus 8% → 5%, Masenko speed-up 15% → 10%.
- **Current Level 3-4 settings:** Level 3 bosses +50% health, mobs 1.15×; Level 4 bosses +80% health, mobs 1.4×.
  Judged with the unlock pool a player really has at each point (my "every unlock, maxed shop" tests made both look
  far harder than they are in real progression).
- **Fresh-account campaigns** (bot, Hard, no Dragon Ball chasing):

| Milestone | Target (§4.4) | Campaign 1 (before tuning) | Campaign 2 |
|---|---|---|---|
| Vegeta | runs 5-8 | 3 | 3 |
| Frieza | runs 15-22 | 7 | 7 |
| Perfect Cell | runs 22-35 | 14 | 13 |
| Kid Buu | runs 35-50 | 15 | 20 |
| Shop finished | after a couple of Level 4 runs | 19 (38,600 shop) | 26 (49,800 shop; 12 Level 4 runs in) |

| Milestone | Target (§4.4) | Campaign 3 (Gohan trimmed) | Campaign 4 (L3-4 +50% / 1.3×) | Campaign 5 (current) |
|---|---|---|---|---|
| Vegeta | runs 5-8 | 6 | 3 | 2 |
| Frieza | runs 15-22 | 12 | 7 | 3 |
| Perfect Cell | runs 22-35 | 15 | 26 (19 attempts) | 16 (13 attempts) |
| Kid Buu | runs 35-50 | 16 | 27 (first try) | 20 (4th attempt; then about 1 in 5) |
| Shop finished | after a couple of Level 4 runs | 22 | ~29 | 32 (16 Level 4 runs in) |

  Levels 1-2 swing a lot between campaigns (a lucky early Piccolo or Gohan run clears them fast).
- **Level 3-4 grind rewards + hero outfits** (`docs/rw5.js`, your call): 15 new goals that pay out while you're stuck,
  and an alternate outfit for every hero (Vegeta already had one):
  - Level 3: survive 5:00 (+400) and 7:30 (**Krillin: Kame House Blue**); destroy 2,000 drones (+600); beat Android 19
    with 3 heroes (**Goku: Kaioken Gi**) and Dr. Gero with 3 heroes (+800); clear it with 2 heroes (**Trunks: Capsule
    Corp Black**) and 4 heroes (+2,000).
  - Level 4: escape Babidi's ship, survive 3:20 (+500); survive 7:30 (**Gohan: Great Saiyaman**); pop 2,000 Buu blobs
    (+700); beat Dabura with 3 heroes (**Piccolo: Demon King Robes**) and Majin Vegeta with 3 heroes (+1,200); clear it
    with 2 heroes (**Gotenks: Super Gotenks Purple**), 4 heroes (+3,000) and all 7 (+5,000).
  - Outfits switch with the "🎨 Outfit" button under the hero carousel and show everywhere (menu, banner, in game).
- **Was open:** Level 3 was sparse during the grind: in campaign 5, runs 7-14 each earned **no** unlocks (fixed above).
- **Early mob surge softened:** Level 3-4 mob health now starts lower and ramps up between 4:00 and 8:00 (Level 3
  1.0× → 1.15×, Level 4 1.1× → 1.4×). Fat Buu gets +40% instead of Level 4's +80% boss health, and regenerates
  0.2%/s (he could heal back from 27% to 53% against a build that couldn't reach him).
- **Campaign 6 (current settings):** Vegeta run 5, Frieza run 7 (Level 2 swings a lot between campaigns), Perfect Cell
  run 17 (10 attempts), Kid Buu run 22 (5 attempts; then about 1 win in 5), shop finished around run 25 (8 Level 4 runs
  in). During the Level 3 grind, 7 of 10 runs earned an unlock (campaign 5: 0 of 8).
- **Seen once, not reproduced:** in campaign 6 three Gohan Level 4 runs survived to 15:00 with very few kills and never
  beat Dabura. Direct Gohan Level 4 runs behaved normally; worth watching in human play.
- **Ship check:** a simulated 2.1 save is wiped on first load (welcome card, Zeni, upgrades and unlocks cleared,
  settings and hero choice kept), and the fresh menu shows only the starter heroes and Level 1. `sw.js` cache name is
  bumped to `dbs-v3.0`, so returning players fetch every 3.0 file. Many Level 3-4
  losses are deaths at 3:40-4:50 to the mob surge before the second boss, which may feel worse to a human than losing
  to a boss.

### 10.1 Phase H: shop price pass  `[x]`
Your goal: the shop shouldn't be finished until a player has had a couple of Level 4 runs, and it's fine for Levels 1-2
to get easy by then. The first few levels of every item cost about what they did, so early runs feel the same; the top
levels cost far more, and the core stats got extra levels. Total cost **17,780 → 49,825 Zeni** (a first try at 38,600 was
fully bought by run 19).

| Item | Levels | Cost per level | Total |
|---|---|---|---|
| Saiyan Vitality (+12 HP) | 10 → **15** | 35 … 2,105 | 8,205 |
| Battle Power (+5% damage) | 10 → **15** | 60 … 3,610 | 14,055 |
| Gravity Chamber (+2% speed) | 5 | 55 … 280 | 730 |
| Scouter Data (+5% XP) | 8 | 45 … 525 | 1,670 |
| Ki Mastery (+3% area) | 8 → **10** | 60 … 1,410 | 4,615 |
| Ki Reserves | 8 | 45 … 430 | 1,440 |
| Senzu Stock | 3 | 200 / 500 / 1,250 | 1,950 |
| Capsule Magnet | 5 | 40 … 205 | 530 |
| Battle Armor (−3% damage taken) | 6 → **8** | 70 … 1,090 | 3,210 |
| Hercule Sponsorship | 5 | 80 … 670 | 1,510 |
| King Kai's Training | 1 | 1,500 | 1,500 |
| Mafuba Seal | 3 | 300 / 660 / 1,450 | 2,410 |
| Potential Unleashed | 1 | 8,000 | 8,000 |

---

## 11. How it gets built (engineering notes)
- New layer files, loaded after the existing ones:
  - `prog.js`: stats tracking, achievements, unlock gates, save migration, Achievements/Collection menus,
    unlock toasts and end-of-run reveal.
  - `w3.js`: the new attacks and passives.
  - `heroes3.js`: Vegeta, Krillin, Trunks, Gotenks.
  - `cut3.js`: the King Kai cutscene.
  - `lv3.js`, `lv4.js`: maps, mobs, bosses.
  - `endless.js`
  - `fx6.js`: effects polish (explosions, beams, attack restyles, per-map atmosphere). See §12.1.
  - `ui6.js`: UI polish (icon set, level cards, two-column menu, living title banner, motion). See §12.1.
  - `cut6.js`: the Level 3 and Level 4 intro scenes. See §12.2.
  - `snd6.js`: sound pass (reverb, per-attack sounds, menu and cutscene cues, new music). See §12.2.
- **Kill attribution:** each attack's update function sets a "current source" tag before it deals damage,
  so per-attack kill counts (Krillin's unlock) work without touching every damage call.
- **Unlock gating points:** the level-up offer pool, Ki Burst, Dragon Ball spawns, Time Chamber events,
  character select, shop rows, level select.
- **Saves:** one new key `dbs_prog` (achievements, counters, unlocks). Uses the same storage (localStorage + IndexedDB mirror).
- **Balance bot** (`tools/balance-bot.js`) upgrades: unlock profiles (fresh / L1-cleared / L2-veteran / full),
  every hero, per-hero clear-rate report, and the Spirit Bomb/flash visual stress test.

---

## 12. Build phases
| Phase | Contents | Notes |
|---|---|---|
| **A** | §1 fixes: Spirit Bomb, Gohan, Dragon Balls, refunds | Ships early as 2.1 |
| **B** | §3-4 achievements, unlocks, menus, migration | Foundation for everything else |
| **C** | §5 six new attacks, Vegeta, Krillin | |
| **D** | §6-7 Time Freeze, Vacuum, Ginyu Challenges, Mafuba, Limit Break, 5th slot, King Kai cutscene | |
| **E** | **Balance pass, Levels 1-2**: bot runs with unlock profiles, cadence check, fun pass | Checkpoint with you |
| **F** | §8 Level 3, Infinite Energy, Trunks, 2 attacks | |
| **G** | §9 Level 4, Majin Mark, Gotenks, 2 attacks, Fusion, Endless, transformation cutscenes (§9.0) | Frieza's and SS cutscene upgrades can land in Phase D |
| **G2** | §9.5 wish-powered fusion tiers, Namekian Dragon Balls + Porunga, hero carousel | Your 2026-11-13 ideas |
| **H** | Full test, balance and feel pass across everything, then ship 3.0 | |
| **I** | §12.1 art, UI and effects polish pass; §12.2 cutscenes and sound | Your requests before shipping |

### 12.1 Phase I: art, UI and effects polish pass  `[x]`
Presentation only: no damage, health, timing or drop numbers changed. Checked on a portrait phone (375x812),
a landscape phone (812x375) and desktop.

**What I found.** Sprites, heroes, bosses and the transformation cutscenes were already consistent and held up
close-up. The weak spots were shared: almost every effect was built from one soft white-centred glow, so
explosions and beams read as blurry blobs; menus used emoji, which look different on every phone; the level
buttons were four identical red bars; desktop showed a phone-width column; Levels 3-4 shared Level 1's colour
grade; and the title font (Impact) does not exist on phones.

**Effects (`fx6.js`, plus small edits in `index.html`, `w5.js`).**
- **Explosions** (every enemy death, bomb, grenade, ghost): core flash, a thick coloured shock ring, tapered
  spikes and a second ring on big ones. Drawn solid so they keep their colour over bright ground.
- **Sparks** streak along their direction of travel. **Dust** is a real puff, tinted to the map's ground.
- **Hit sparks:** a four-point anime star plus a ring.
- **Beams** (Kamehameha, Special Beam Cannon, the fused beams, and now Galick Gun / Final Flash): rippling
  edges, a white-hot core, streaks flowing down the beam, a charge bulb at the hands. The body is drawn solid,
  so a blue beam is blue instead of washing out to white.
- **Restyled attacks:** Destructo Disc and Twin Kienzan (flat serrated spinning blades), Explosive Wave (a rim
  of flame tongues), Tri-Beam (burning outline, lit corners), Wolf Fang Fist (claw rakes), Scattering Bullet
  (outlined orbs with tails), Shining Sword Attack (blade-shaped crescents), Energy Barrier (glass highlight,
  lit corners), Candy Beam (pink ribbon with a sparkle), Dragon Spirit Bomb (a solid sphere, thicker lightning).
- **Atmosphere per map:** cloud shadows drift across the ground; each map has its own floating particles
  (wind-blown sand, glowing Namek spores, ash and embers in the city, magic motes in Babidi's ship, twinkles in
  the candy city) and its own colour grade and vignette. Level 4's old tint was drawn over the HUD; it is now
  under it.
- **Running dust** under the hero.
- "Low" graphics skips the cloud shadows, spikes and streaks.

**Maps.** The ruined city (Level 3 and the candy city) has paving slabs, pavements with kerbs, darker asphalt,
zebra crossings at junctions and oil stains instead of flat grey.

**UI (`ui6.js`).**
- **Icon set:** 47 hand-drawn icons in the game's gold-and-outline style replace emoji in every menu, toast and
  HUD button. A watcher swaps them wherever text appears, so older screens needed no edits.
- **Level cards:** each level button shows a picture of its map and boss (painted once with the game's own art),
  the level number, and a star badge counting the heroes who have cleared it.
- **Two-column main menu** on desktop and landscape phones: hero pick on the left, everything you can press on
  the right. Portrait keeps one column.
- **Living title banner:** twinkling stars, turning sun rays, drifting clouds, bobbing Dragon Balls, the chosen
  hero idling.
- **Motion:** panels rise in, level-up choices arrive one after another, buttons give when pressed. Respects the
  phone's "reduce motion" setting.
- **Title font:** phones have no Impact, so titles fell back to a plain wide font. The font list now includes the
  condensed heavy fonts phones do have, so titles look alike everywhere.

**Performance.** A frame with 230-280 enemies and five attacks draws in about 2-3 ms on desktop; turning the
atmosphere pass off made no measurable difference.

**Not changed.** Hero and enemy sprites, boss art, and the boss-transformation and Super Saiyan cutscenes: they
already matched the target quality. The intros, King Kai's training and Porunga were redone next (§12.2).

### 12.2 Phase I, part 2: cutscenes and sound  `[x]`
Still presentation only. Checked at the same three screen sizes.

**Level 3 intro (`cut6.js`, 6.0 s).** A city at dusk. An energy blast streaks in and blows the top off a tower,
which burns under a smoke column for the rest of the scene. The hero flies in across the sky inside a ki aura and
drops onto the road. Android 20 and Android 19 land on a rooftop above, their eyes flash red, and the title comes
up.

**Level 4 intro (`cut6.js`, 6.2 s).** Babidi's spiked ship, half buried in a wasteland, drawing ribbons of energy
down from a dark vortex. The hero flies in and lands, the hatch grinds open and floods the ground with pink
light, three Majin fighters hop out to stand guard, and the hero charges through them and dives down the hatch.
The run then starts inside the ship, as before.

**King Kai's training (`cut3.js`, same 8.2 s).** Redrawn:
- **Defeat:** a shaft of light opens above and the hero rises under a proper gold halo.
- **Snake Way:** a real serpent (head at the start, fins along the spine, pale belly plates, scales) over a sea
  of clouds, with the hero sprinting past afterimages and kicked-up puffs, and King Kai's planet growing ahead.
- **The planet:** grass ball with a ring road, his house, red car and tree. King Kai has his catfish face, round
  shades, whiskers, antennae and crested robe; Bubbles is a proper little monkey.
- **Three shots:** push-ups under a "10t" weight, chasing Bubbles round the turning planet, then the power
  flooding out (Kaio-ken for Goku) while King Kai throws his arms up.
- The "Panel 1 / 3" label became three progress dots; captions are slanted gold plates; cinema bars match the
  other cutscenes.

**Shenron and Porunga.** Shenron's summoning and art already held up, so they are unchanged. **Porunga was
redrawn** (`dball5.js`): he was a small figure with a boxy chest and tube arms; he is now a hulking dragon with
great curved horns, fin ears, burning eyes under heavy brows, spines fanning off the shoulders, arms folded
across a muscled chest, and a serpent body rising from below. He scales to fit portrait and landscape with his
horns on screen. The Namekian balls are drawn larger in his summoning.

**Sound (`snd6.js`).** Everything is still synthesised in the browser: no audio files.
- **Room reverb** on the whole mix, so sounds sit in a space.
- **Every attack has its own sound.** Before, several attacks and most boss moves shared one "charge" sound.
  New: Galick Gun (charge and fire), Explosive Wave, Tri-Beam, Wolf Fang Fist, Scattering Bullet (launch and
  burst), Shining Sword slash, Energy Barrier, Afterimage, Masenko, Kaioken Aura pulse, Special Beam Cannon,
  Spirit Bomb, Ghost Kamikaze, Candy Beam, Fusion. Hit, enemy pop, explosion, Kamehameha and level-up were
  re-voiced.
- **Bosses:** a warning charge for their beams, absorbing, and Pui Pui's gravity.
- **Menus:** every button clicks; starting a level, going back, the hero carousel, picking a level-up, evolving,
  rerolling and sealing each have their own sound.
- **Feedback:** a heartbeat below 30% health, an alarm when an elite appears, a chime for Senzu Beans.
- **Cutscene cues** for both new intros and each beat of King Kai's training.
- **Music:** four new pieces on a second song engine with different instruments per map: Namek (bells over slow
  arpeggios), the city for Level 3 (square-wave lead over a racing arpeggio), Babidi's ship for Level 4 (a
  bouncing, off-kilter tune), and a faster, heavier boss theme. Level 1 and the menu keep their songs.

**How the sound was checked.** I cannot listen, so I rendered every new sound and song offline in the browser and
measured them: all 48 sounds play without errors, none clip, and the new songs sit within about 2 dB of the
existing ones. Whether the tunes are pleasant is something only your ears can judge; each song is one block of
note numbers in `snd6.js` and easy to retune or swap.

---

### 12.3 Post-launch playtest pass (2026-11-13)  `[x]`
Your first iPhone playtest notes. New layer `docs/v7.js` (loaded last) plus direct edits where the code lives.
Shipped without bot balance runs, at your request: you judge the numbers.
- **UI:** every boss on the field gets a name and bar (2-column grid when there are several); owned attacks/passives
  strip on the power-up and pause screens (touch and slide for names); power-up offers show "✓ You have X" and a green
  ring when you own the evolution partner; end screen damage tally per attack (Ki Burst, transformation burst and
  Dragon Ball pickups included); locked hero shows a LOCKED tag and greys out the levels; chest edge arrows; redrawn
  Time Chamber (tiled floor, pillars, time ring, hourglass); Ginyu challenge buttons no longer flash brown.
- **Damage tags:** a global `DSRC` is set inside each attack's update block (and carried on shared projectiles as `src`),
  and `hitE` adds the HP actually removed to `S.dmg7`.
- **Attacks:** Special Beam Cannon is in every hero's pool. Final Flash keeps a narrower sweep (x2.0 dmg, was x2.4) and its
  wish back-sweep now survives evolving. Explosive Wave evolved/wished: knockback x0.2, damage x0.87 / x0.9.
  Kaioken gravity well pulls to the aura's edge, then slows inside (was pulling enemies onto you).
- **Balance:** Level 2 mobs +25% HP and extra spawns at the start, fading out by 3:00; Recoome x0.88 HP; Jeice, Burter,
  Guldo, Ginyu x1.15. Android 19 reworked (released energy ring after absorbing, telegraphed charge that drains,
  overcharge at 55%) with x0.85 HP. Senzu regen 0.9 → 0.5 per level. Spirit Bomb (and Dragon Spirit Bomb) radius uses
  60% of the Area bonus. Dragon Balls spawn up to 35% slower early, back to normal by 5:00. Shop +20%.
- **Settings:** difficulty fixed at Hard (toggle removed); Character art removed; Reduced flashing now dims every
  full-screen light flash (cutscenes, intros, wishes); cutscene shakes respect Screen shake; Reset all progress
  (two confirmations, settings kept).
- **Feel:** Level 2 shooters idle when standing still; Ki Burst and pause fire on touch-down so they work while
  another finger is walking.

### Playtest pass 2 (2026-11-13)
- **Progression:** XP gems give 50% XP (halved at pickup; Dragon Ball XP unchanged).
- **Explosive Wave:** now a slow pulse (230 px/s, was ~0.45 s to full size) that loses 10% power per enemy it passes
  through (a boss soaks 40%) and fizzles below 12%. Radius uses 60% of the Area bonus. Wave draws fade with its power.
- **Big-AoE audit:** Kaioken aura (and its slow/gravity well), Dragon Thunder, Tri-Beam zones, Kaioken Wolf Fang aura,
  and the fused beams (Final / Final Shine Kamehameha, Makankosappo Light, Final Shine bomb) use 60% of the Area bonus.
  Evolved Solar Flare (whole screen) 34+8/lv → 18+5/lv. Makankosappo Light (all-round sweeping beams) 40+7/lv → 28+5/lv.
- **UI:** "Evolves with" on power-ups hides partners not unlocked yet (owned ones always show).
- **Attack audit (headless):** each attack alone at Lv5 on a fixed screen of 100 enemies (Level 3, full shop), measuring
  damage/s, how many of the 100 it reaches, and kills/s against 500-HP mobs that keep refilling. Outliers fixed:
  evolved Spirit Bomb (10.2 kills/s, next best 5.7): radius x1.5 → x1.2, damage x1.6 → x1.35 (now 5.5).
  At 2 wishes, Makankosappo Light (35 kills/s), Final Kamehameha (28.5) and the Kaioken/Spirit disc fusion (27.7) emptied the screen
  every few seconds: Makankosappo Light 5 beams (was 6), 22+4/lv, sweep 1.0 rad/s → 19.7; Final Kamehameha side beams
  x0.4 (was x0.6) and end shockwave x1 (was x1.5) → 14.8; disc fusion 17+4/lv, 10 discs + 4 outer (was 12 + 6) → 17.5.
  Buffs: Explosive Wave loses 7% per enemy (was 10%); Kaioken Wolf Fang Barrage 30+7/lv, aura radius 100, 8/10 dash
  targets (was 6/9). Afterimage Strike explodes after 1.4 s (was 1 s).
  Kaioken Wolf Fang Barrage boosted again: dashes every 1 s (was 1.5) for x3 damage (was x2), each dash bursts on nearby
  enemies at every tier, aura x0.35 (was x0.25). Kills/s 1.9 / ? / 8.7 → 5.5 / 9.7 / 15.5 (no wish / 1 / 2).
- **Fusions compensate for the slot they cost:** with no wish they now clear clearly faster than any single evolved attack.
  Tuning tables at the top of w5.js (FB5 damage per tier, SGP5, DSB5, HTC5). Kills/s in the audit, no wish / 1 / 2:
  Final Kamehameha 9.5/13.2/18.3, Final Shine 10.2/11.6/13.9, Makankosappo Light 9.3/14.6/18.4, disc fusion 10/12.4/16.3,
  Dragon Spirit Bomb 7.8/13/17.1 (bombs every 1.8/3/3.2 s), Kaioken Wolf Fang Barrage 8.7/13.2/17.2, Sweet Ghost Parade
  8.4/11.4/14.3 (faster ghosts, each candy pop takes 3-4 neighbours, never bosses), Tri-Cage 8.3/10.3/19.5 (3/4/2 cages).
  Evolved attacks are 4-6. Boss damage checked: every fusion at or under ~2% boss HP/s (Tri-Cage boss caps split across cages).

### Playtest pass 3 (2026-11-13)
- Taiyoken Burst (evolved Solar Flare) no longer stun-locks: blinded enemies move at 10% speed (bosses 50%) for the old stun duration (`e.bl`, handled in `updNew`'s speed multiplier). Base Solar Flare still stuns.
- Dragon Ball timer runs 20% slower on Levels 1 and 2, so the 7th ball (and Namek's second set) arrives 20% later.
- Level 2: regular spawns cap 125 → 170, early spawn-rate ramp .5 → .8, group size ×.6 → ×.85, extra early spawner twice as fast; mobs +10% HP and +10% damage (non-endless).
- Level 3: share of regular spawns skipped `L3THIN` .5 → .3 (about 40% more mobs).
- Floor crystal XP ×.8 on Levels 2-4 (non-endless).
- Galick Gun and Final Flash damage −20% (`W3B.galick` .85 → .68).
- Saiyan Armor 10% → 7% per (rarity-weighted) level, cap 60% → 42%. Battle Armor (shop) 3% → 2% per level.
- Senzu Bean regen .5 → .35 HP/s per level. Tank check (raw damage taken by a mid build standing in the crowd: L3 4:00 ≈190/min, L3 7:00 ≈470/min, L4 5:00 ≈500/min, L4 8:00 ≈930/min): with capped Saiyan Armor + capped Senzu + Battle Armor 8, the old numbers out-healed everything until mid Level 4; now the maxed build loses ≈55/min at L3 7:00 and ≈75/min at L4 5:00 (430 max HP), and a mid build still dies in about a minute at L3 7:00 if it stands still.
- Instant Transmission Strike (evolved Afterimage) was the weakest evolved attack (≈1,600 dps, 0.8 kills/s in the stationary-crowd test): afterimages now hit 1.5× harder and the teleport-strike is a 55px blast reaching 320px (≈4,500 dps, 2.2 kills/s; evolved Galick ≈3,500, Wolf Fang ≈4,300, Kamehameha ≈6,000).
- Unlocks: Krillin's "Bald Destiny" needs 1,500 Destructo Disc kills (was 5,000), and disc-fusion kills count. "Yamcha'd" is now "fall within 3:00" (was 1:30). Death achievements (Snake Way, Yamcha'd, deaths count) only fire on a real death (HP 0), never on quitting a run.
- Hyperbolic Time Chamber hold time 7 s → 5.5 s.

## 13. Decisions (answered 2026-11-12)
1. "Dragon scouter" = the **Dragon Radar** passive. ✓
2. **Phase A ships now** as a 2.1 patch, before the big update. ✓
3. **3.0 wipes all save data**; everyone starts fresh (§3.4). ✓
4. Krillin, Future Trunks and Gotenks: **yes**. ✓
5. **Android 16 is in.** Cell and Buu are **single bosses with forms** like Frieza, each with transformation
   cutscenes (§9.0). Final forms get foreboding music, darkening skies, lightning and rising rubble. The SS
   transformation gets the same treatment, but heart-thumping. ✓
6. Shop prices and power: **balance pass after everything is in** (Phase H). ✓
7. Unlock density can't be judged until it's played. Levels 3-4 must not feel sparse, so add more or spread
   them out as needed (§4.5). ✓
