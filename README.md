# Dragon Ball Survivors

Browser survivors-style game. Play it on phone (portrait or landscape) or desktop.

The playable site lives in `docs/` and is served by GitHub Pages.

Run locally:

    python -m http.server 8123 --directory docs

## 3.0

Four levels (Wasteland, Namek, Androids & Cell, Majin Buu), Endless Mode, 7 heroes with alternate outfits, 20 attacks,
10 passives, evolutions, 8 Fusion Dance attacks with wish tiers, two sets of Dragon Balls (Shenron and Porunga),
achievements and unlocks. `EXPANSION_PLAN.md` is the full design and build log.

Code is layered: `index.html` is the original game; each later file wraps or extends it, loaded in this order:
`v2.js art2.js ui2.js fix.js patch21.js prog.js w3.js w4.js heroes3.js sys3.js cut3.js lv3.js w5.js lv4.js
endless.js dball5.js bal5.js cut4.js ui4.js rw5.js fx6.js ui6.js cut6.js snd6.js`. The last four are
presentation only (effects, UI, cutscenes, sound). `sw.js` caches every file for offline play; bump its `CACHE`
name whenever you ship.

## Balance testing

`tools/balance-bot.js` plays full runs headlessly at high speed. Serve `docs/`, copy the bot next to `index.html` as
`_bot.js`, load it in the page, then:

- `await simRun({stage: 3, hero: 'goku', maxT: 900, meta: {...}, profile: 'all'})` plays one run
  (`meta`: shop levels, starting from an empty shop; `profile`: unlock set).
- `campaign(40)` then `campSumm()` plays a brand-new account like a player (highest level, rotating heroes, buying the
  cheapest upgrade between runs). **It overwrites the page's save, so back it up first.**

The bot plays like a strong player, so a human lands a little later on every milestone.

3.0 targets (Hard), checked with fresh-account campaigns (see `EXPANSION_PLAN.md` §10.0):
- Vegeta falls after a few runs of upgrades; Frieza takes several more.
- Levels 3 and 4 each take several attempts; the shop isn't finished until a player has had a few Level 4 runs.
- Level 3-4 grinds keep paying out (survival marks, lifetime counters, outfits).
