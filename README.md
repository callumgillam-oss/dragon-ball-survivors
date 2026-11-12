# Dragon Ball Survivors

Browser survivors-style game. Play it on phone (portrait or landscape) or desktop.

The playable site lives in `docs/` and is served by GitHub Pages.

Run locally:

    python -m http.server 8123 --directory docs

## Balance testing

`tools/balance-bot.js` plays full runs headlessly at high speed. To use it, serve `docs/`, copy the
bot next to `index.html` as `_bot.js`, load it in the page, then run e.g.
`batch(6, {stage: 1, dlv: 1, meta: {hp: 4, dmg: 4}})` and read `summ()`.

2.0 targets (Hard, good player):
- Level 1, no shop upgrades: Nappa ~25%, Vegeta very rare.
- Level 1, ~4-6 runs of upgrades: Vegeta becomes winnable.
- Level 2, ~4 runs of upgrades: early Ginyu Force beatable, Frieza out of reach.
- Level 2, ~10-12 runs of upgrades: Ginyu usually, Frieza ~1 in 3. Max shop is NOT required (room for future levels).
