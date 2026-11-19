// Combo sweep: plays many builds in parallel headless Chrome windows and ranks them, to find what breaks progression.
//   1. serve the game:   python -m http.server 8123 --directory docs
//   2. run:              node tools/sweep.mjs [--workers 10] [--reps 4] [--stages 1,2,3,4] [--heroes goku] [--out file.json]
//                        node tools/sweep.mjs --pairs 6   also tries every pair of the 6 strongest single builds per level
//                        --eval tweak.js runs a file in every window after load (to try a change); --budget 3:12000 overrides a level's shop Zeni; --only <regex> limits builds by name (e.g. --only baseline); --draw keeps painting on (slower)
// Each level is played the way a player first arrives there: that level's unlocks (balance-bot.js profiles l1-l4) and the
// Zeni they have spent by then (BOT_BUDGET, cheapest-first; Level 1 uses a light 1,500 shop, a few runs in).
// Every evolution pair and fusion the profile allows is played as a build (tools/balance-bot.js `build`), plus a baseline
// with no build. Each Chrome has its own empty profile, so nobody's save is touched. Needs Chrome or Edge and Node 22+.
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const URL_ = arg('url', 'http://localhost:8123/');
const WORKERS = +arg('workers', 10), REPS = +arg('reps', 4), PAIRS = +arg('pairs', 0), MAXT = +arg('maxT', 1250);
const STAGES = arg('stages', '1,2,3,4').split(',').map(Number), HEROES = arg('heroes', 'goku').split(',');
const OUT = arg('out', join(tmpdir(), 'dbs-sweep-' + Date.now() + '.json'));
const BUDGET = { 1: 1500, 2: 3800, 3: 6500, 4: 9500 };
for (const kv of (arg('budget') || '').split(',').filter(Boolean)) { const [st, z] = kv.split(':'); BUDGET[st] = +z; }   // --budget 3:12000,4:18000
const BOT = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'balance-bot.js'), 'utf8');
const CHROME = [arg('chrome'), 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => p && existsSync(p));
if (!CHROME) throw new Error('Chrome/Edge not found: pass --chrome <path>');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- one headless Chrome driven over the DevTools protocol ----------
async function openWorker(i) {
  const port = 9400 + i, dir = mkdtempSync(join(tmpdir(), 'dbs-w'));
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--no-first-run', '--no-default-browser-check',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--mute-audio', 'about:blank'], { stdio: 'ignore' });
  let tgt;
  for (let t = 0; t < 100 && !tgt; t++) { await sleep(150); try { tgt = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(x => x.type == 'page'); } catch { } }
  if (!tgt) throw new Error('Chrome did not start');
  const ws = new WebSocket(tgt.webSocketDebuggerUrl); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const wait = new Map();
  ws.onmessage = m => { const d = JSON.parse(m.data); if (wait.has(d.id)) { wait.get(d.id)(d); wait.delete(d.id); } };
  const send = (method, params) => new Promise(r => { const n = ++id; wait.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
  const ev = async expr => {
    const d = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (d.result && d.result.exceptionDetails) throw new Error((d.result.exceptionDetails.exception || {}).description || d.result.exceptionDetails.text);
    return d.result && d.result.result ? d.result.result.value : undefined;
  };
  // every script must have run (under load a request can fail and the game still flags itself ready): retry the page
  const ready = `!!window.DBS_READY && document.readyState == 'complete' && (() => { const src = [...document.scripts].filter(s => s.src).map(s => s.src),
    got = performance.getEntriesByType('resource').filter(e => src.includes(e.name) && e.responseStatus == 200); return got.length >= src.length; })()`;
  load: for (let a = 0; ; a++) {
    await send('Page.navigate', { url: URL_ });
    for (let t = 0; t < 60; t++) { await sleep(250); try { if (await ev(ready)) break load; } catch { } }
    if (a >= 4) throw new Error(`worker ${i}: the game did not load from ${URL_}`);
  }
  // headless: skip painting; the win end card is on a 1.9 s timer, so run it at once (as campaign() does)
  await ev(`${process.argv.includes('--draw') ? '' : 'draw = function () {};'} { const st0 = window.setTimeout; window.setTimeout = (f, ms, ...a) => ms === 1900 ? (queueMicrotask(() => f(...a)), 0) : st0(f, ms, ...a); } 1`);
  await ev(BOT + '\n1');
  if (arg('eval')) await ev(readFileSync(arg('eval'), 'utf8') + '\n;1');   // --eval <file.js>: try a tweak in the headless windows only (game files untouched)
  if (!(await ev(ready + ` && typeof simRun == 'function'`))) throw new Error(`worker ${i}: bot did not load`);
  return { ev, close: () => { try { ws.close(); proc.kill(); } catch { } setTimeout(() => { try { rmSync(dir, { recursive: true, force: true }); } catch { } }, 1500); } };
}

// ---------- jobs ----------
const results = [];
async function runAll(jobs, ws) {
  let next = 0, done = 0; const t0 = Date.now();
  await Promise.all(ws.map(async w => {
    for (; ;) {
      const j = jobs[next++]; if (!j) return;
      const o = { stage: j.stage, hero: j.hero, build: j.build, profile: 'l' + j.stage, budget: BUDGET[j.stage], maxT: MAXT };
      let r; try { r = await w.ev(`simRun(${JSON.stringify(o)})`); } catch (e) { r = { result: 'error', err: String(e).slice(0, 200) }; }
      results.push(Object.assign({ name: j.name, stage: j.stage, hero: j.hero }, r));
      if (++done % 10 == 0 || done == jobs.length) process.stdout.write(`  ${done}/${jobs.length} runs, ${((Date.now() - t0) / 1000) | 0}s\n`);
    }
  }));
}
const fmt = s => s == null ? '  -  ' : `${(s / 60) | 0}:${String(Math.round(s % 60)).padStart(2, '0')}`;
function table(stage) {
  const g = {};
  for (const r of results.filter(r => r.stage == stage)) (g[r.name + ' / ' + r.hero] ||= []).push(r);
  const rows = Object.entries(g).map(([k, rs]) => {
    const wins = rs.filter(r => r.result == 'win'), err = rs.filter(r => r.result == 'error').length;
    const kills = {}; for (const r of rs) for (const e of r.ev || []) if (e[0] == 'kill') (kills[e[1]] ||= []).push(e[2]);
    const lastBoss = Object.entries(kills).sort((a, b) => b[1].length - a[1].length || Math.max(...b[1]) - Math.max(...a[1]))[0];
    return { k, n: rs.length, win: wins.length / rs.length, clear: wins.length ? wins.reduce((a, r) => a + r.t, 0) / wins.length : null,
      surv: rs.reduce((a, r) => a + r.t, 0) / rs.length, hpLow: rs.reduce((a, r) => a + (r.hpLow ?? 1), 0) / rs.length, err,
      bosses: rs.reduce((a, r) => a + (r.ev || []).filter(e => e[0] == 'kill').length, 0) / rs.length };
  }).sort((a, b) => b.win - a.win || (a.clear ?? 1e9) - (b.clear ?? 1e9) || b.bosses - a.bosses || b.surv - a.surv);
  console.log(`\nLevel ${stage} (arrival unlocks l${stage}, ${BUDGET[stage]} Zeni shop) — ${rows.length} builds`);
  console.log('  win%  clear  survived  bosses  lowHP  build');
  for (const r of rows) console.log(`  ${String(Math.round(r.win * 100)).padStart(3)}%  ${fmt(r.clear)}  ${fmt(r.surv)}     ${r.bosses.toFixed(1).padStart(4)}   ${r.hpLow.toFixed(2)}  ${r.k}${r.err ? `  (${r.err} errors)` : ''}`);
  return rows;
}

// ---------- main ----------
const ws = [];
for (let i = 0; i < WORKERS; i++) ws.push(await openWorker(i));   // one at a time: the dev server stalls on many page loads at once
console.log(`${WORKERS} headless Chrome workers ready (${CHROME})`);
try {
  const jobs = [], avail = {};
  for (const st of STAGES) {
    const a = avail[st] = await ws[0].ev(`botAvail('l${st}')`);
    const builds = [['baseline (no build)', null], ...a.evo.map(([w, p]) => [`${w}+${p}`, [w, p]]),
      ...a.fuse.map(([id, x, px, y, py]) => [`FUSION ${id} (${x}+${y})`, [id, x, y, px, py]])];
    const only = arg('only') && new RegExp(arg('only'));   // --only <regex>: just the builds whose name matches
    for (const h of HEROES.filter(h => a.heroes.includes(h))) for (const [name, build] of builds.filter(([n]) => !only || only.test(n))) for (let i = 0; i < REPS; i++) jobs.push({ stage: st, hero: h, name, build });
  }
  jobs.sort(() => Math.random() - .5);   // mix long and short runs across workers
  console.log(`${jobs.length} runs queued`);
  await runAll(jobs, ws);
  const top = {};
  for (const st of STAGES) top[st] = table(st);
  if (PAIRS > 1) {   // two evolutions together: the strongest singles, every pair
    const pj = [];
    for (const st of STAGES) {
      const singles = top[st].filter(r => /^\w+\+\w+ \//.test(r.k)).slice(0, PAIRS).map(r => r.k.split(' / ')[0].split('+'));
      for (let i = 0; i < singles.length; i++) for (let j = i + 1; j < singles.length; j++)
        for (let k = 0; k < REPS; k++) pj.push({ stage: st, hero: HEROES[0], name: `${singles[i].join('+')} & ${singles[j].join('+')}`, build: [singles[i][0], singles[j][0], singles[i][1], singles[j][1]] });
    }
    pj.sort(() => Math.random() - .5); console.log(`\n${pj.length} pair runs queued`);
    await runAll(pj, ws);
    for (const st of STAGES) table(st);
  }
  writeFileSync(OUT, JSON.stringify({ args: process.argv.slice(2), budget: BUDGET, results }, null, 1));
  console.log(`\nRaw results: ${OUT}`);
} finally { ws.forEach(w => w.close()); }
