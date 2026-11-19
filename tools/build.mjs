// Packs the game's script files into one download, docs/game.js, and updates the offline cache (docs/sw.js).
//   node tools/build.mjs           rebuild (run this after editing any docs/*.js file, before committing)
//   node tools/build.mjs --check   exit 1 if game.js or sw.js is out of date (nothing is written)
//
// The file list and order live in index.html: <script src="game.js" data-files="v2.js art2.js ..."></script>.
// game.js runs each file as its own script element, exactly like separate <script> tags: one file's error can't stop the
// others, top-level names stay global, and '//# sourceURL' keeps the real file name and line in errors and DevTools.
// On localhost it loads the source files themselves instead, so edits show without a rebuild (?bundle forces the bundle).
// The cache name is a hash of index.html + game.js, so it changes exactly when the game does: no manual bump.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOCS = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const read = f => readFileSync(join(DOCS, f), 'utf8');
const html = read('index.html');
const tag = /<script src="game\.js" data-files="([^"]+)"><\/script>/.exec(html);
if (!tag) throw new Error('index.html has no <script src="game.js" data-files="..."> tag');
const files = tag[1].trim().split(/\s+/);

const loader = `(function (F) {
  var me = document.currentScript, files = me.getAttribute('data-files').trim().split(/\\s+/);
  if (/^(localhost|127\\.0\\.0\\.1|\\[::1\\])$/.test(location.hostname) && !/[?&]bundle\\b/.test(location.search)) {
    for (var i = 0; i < files.length; i++) document.write('<script src="' + files[i] + '"><\\/script>');   // local development: the sources
    return;
  }
  for (var j = 0; j < F.length; j++) { var s = document.createElement('script'); s.text = F[j][1] + '\\n//# sourceURL=' + F[j][0]; me.parentNode.insertBefore(s, me); }
})`;   // called with the file list, so no global name can clash with the game's own
const game = `// Built by tools/build.mjs from ${files.length} files in docs/ (listed in index.html). Do not edit: edit those files and rebuild.\n` +
  `${loader}([\n${files.map(f => JSON.stringify([f, read(f)])).join(',\n')}\n]);\n`;

const hash = createHash('sha256').update(html).update(game).digest('hex').slice(0, 12);
const swOld = read('sw.js');
const swNew = swOld
  .replace(/const CACHE = '[^']*';.*$/m, `const CACHE = 'dbs-${hash}';   // set by tools/build.mjs: a hash of index.html + game.js`)
  .replace(/const FILES = \[[^\]]*\];/, `const FILES = ['./', './index.html', './game.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];`);
if (!/const CACHE = 'dbs-/.test(swNew) || !swNew.includes("'./game.js'")) throw new Error('sw.js: CACHE / FILES lines not found');

let gameOld = ''; try { gameOld = read('game.js'); } catch { }
if (process.argv.includes('--check')) {
  const stale = [gameOld !== game && 'game.js', swOld !== swNew && 'sw.js'].filter(Boolean);
  if (stale.length) { console.error(`Out of date: ${stale.join(', ')}. Run: node tools/build.mjs`); process.exit(1); }
  console.log('game.js and sw.js are up to date');
} else {
  writeFileSync(join(DOCS, 'game.js'), game);
  writeFileSync(join(DOCS, 'sw.js'), swNew);
  console.log(`docs/game.js: ${files.length} files, ${(game.length / 1024) | 0} KB · cache dbs-${hash}`);
}
