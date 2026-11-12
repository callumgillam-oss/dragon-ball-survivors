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
- **Limit Break** boosts apply to your whole build, not a single chosen attack: +4% damage, +3% area (cap +60%), −2% cooldowns (cap −20%), or +5 max HP with a full heal. It replaces the old "full heal when everything is maxed". It can be toggled off in Settings.
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

### 9.0 Boss transformation cutscenes (Frieza, Cell, Buu) + Super Saiyan upgrade
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

### 9.1 Fusion Dance (unlocked by Perfect Cell)
Two **evolved** attacks fuse into one super-attack and **free a slot** (like Unions in Vampire Survivors):
- Super Kamehameha + Final Flash → **Final Kamehameha**
- Super Kamehameha + Hyper Masenko → **Father-Son Kamehameha**
- Makankosappo + Hyper Masenko → **Mentor's Light** (Piccolo and Gohan)
- (more recipes from Fat Buu: Kienzan + Scattering Barrage → **Twin Kienzan Storm**, etc.)

### 9.2 Endless Mode (unlocked by Kid Buu)
- One continuous run that **cycles through all 4 maps** every ~5 min.
- Bosses from every arc return in escalating waves (×1.5 toughness each cycle).
- Limit Break on, Zeni paid per minute survived. Best time and kills saved.
- Achievements at 20 / 30 / 45 / 60 minutes.

---

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
| **H** | Full test, balance and feel pass across everything, then ship 3.0 | |

---

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
