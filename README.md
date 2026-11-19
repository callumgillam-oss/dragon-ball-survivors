# Dragon Ball Survivors

Browser survivors-style game. Play it on phone (portrait or landscape) or desktop.

The playable site lives in `docs/` and is served by GitHub Pages.

Run locally:

    python -m http.server 8123 --directory docs

## 3.0

Four levels (Wasteland, Namek, Androids & Cell, Majin Buu), Endless Mode, 7 heroes with alternate outfits, 20 attacks,
10 passives, evolutions, 8 Fusion Dance attacks with wish tiers, two sets of Dragon Balls (Shenron and Porunga),
achievements and unlocks. `EXPANSION_PLAN.md` is the full design and build log.

Code is layered: `index.html` is the original game; each later file in `docs/` wraps or extends it, in the order
listed in index.html's `<script src="game.js" data-files="...">` tag (add new files there).

**Shipping:** players download all those files as one `docs/game.js`. After editing any `docs/*.js` file, run
`node tools/build.mjs` before committing (`--check` tells you if you forgot). It also updates `sw.js`: the offline
cache name is a hash of the game, so it changes by itself whenever the game does. On localhost the page loads the
separate files directly, so edits show without a rebuild; add `?bundle` to the URL to test the packed game.js.

## Balance testing

`tools/balance-bot.js` plays full runs headlessly at high speed. Serve `docs/`, copy the bot next to `index.html` as
`_bot.js`, load it in the page, then:

- `await simRun({stage: 3, hero: 'goku', maxT: 900, meta: {...}, profile: 'all'})` plays one run
  (`meta`: shop levels, starting from an empty shop; `profile`: unlock set).
- `campaign(40)` then `campSumm()` plays a brand-new account like a player (highest level, rotating heroes, buying the
  cheapest upgrade between runs). **It overwrites the page's save, so back it up first.**

The bot plays like a strong player, so a human lands a little later on every milestone.

`tools/sweep.mjs` finds builds that break progression: with the game served on port 8123, `node tools/sweep.mjs` plays
every evolution and fusion each level allows (plus a no-build baseline) in parallel headless Chrome windows, with the
unlocks and shop Zeni a player has on first reaching that level, and ranks them by win rate. `--pairs 5` also tries
pairs of the strongest; `--eval tweak.js` tries a change in the test windows only. Each window has its own empty save.

## Performance testing

`tools/perf-audit.js` counts what each frame draws (canvas calls, additive glow sprites, glow area, new gradients, text)
for one thing at a time. Copy it next to `index.html` as `_pa.js` and load it in the page, then:
`PA.attack('blast')` (maxed: level 8, evolved, wished; fusions at tier 2), `PA.mobs(3, 'dr')` (120 of one mob),
`PA.bg(2)` (ground only) or `PA.boss(2, 'fr3')` (one boss using its attacks). The counts are reliable even in a hidden
tab; the millisecond figures are only a rough guide. For reference (2026-11-14), the ground is about 95 calls a frame,
a crowd of 120 mobs about 900 in total, and the heaviest maxed attacks add 250-450 more.

3.0 targets (Hard), checked with fresh-account campaigns (see `EXPANSION_PLAN.md` §10.0):
- Vegeta falls after a few runs of upgrades; Frieza takes several more.
- Levels 3 and 4 each take several attempts; the shop isn't finished until a player has had a few Level 4 runs.
- Level 3-4 grinds keep paying out (survival marks, lifetime counters, outfits).
