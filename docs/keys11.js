/* keys11.js — keyboard play (2026-11-16)
   1) Level-up, Shenron and pause menus: Up/Down (or Left/Right, or your move keys) highlight a choice, Space or Enter picks it.
      Nothing is highlighted until you press a direction, so mashing Space for Ki Burst can't pick a choice by accident.
   2) Settings → Keybindings (shown with a mouse/keyboard or a controller): rebind move, Ki Burst, pause and menu select,
      and the controller's Ki Burst / pause / select buttons (stick and D-pad always move).
      The arrow keys always move too (unless bound to something else), Escape always pauses, Enter always selects.
   3) Settings → Graphics: quality, frame rate, ground cache, FPS counter, screen shake, flashing and damage numbers
      live on their own screen. Every toggle re-renders settings(), so V2.gfx picks which half of the rows stays. */

const KB_DEF = { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', ult: 'Space', pause: 'KeyP', pick: 'Space' };
const KB_NAME = { up: 'Move up', down: 'Move down', left: 'Move left', right: 'Move right', ult: 'Ki Burst', pause: 'Pause', pick: 'Menu select' };
const KB_MOVE = { up: 'w', down: 's', left: 'a', right: 'd' };   // the flags the movement code reads
SET.kb = Object.assign({}, KB_DEF, SET.kb);
const GP_DEF = { ult: [0, 2, 5, 7], pause: [9, 8, 1], pick: [0] };   // standard-mapping button indexes
const GP_NAME = ['A', 'B', 'X', 'Y', 'L1', 'R1', 'L2', 'R2', 'Select', 'Start', 'L3', 'R3', , , , , 'Home'];
SET.gp = Object.assign({}, GP_DEF, SET.gp);
const gpLabel = l => l.map(i => GP_NAME[i] || 'Button ' + i).join(' / ');
let kbWait = null;   // the action waiting for a key press ('ult') or controller button ('gp:ult') on the Keybindings screen
function gpBind(i) {   // called by gpPoll (index.html)
  const a = kbWait.slice(3); kbWait = null;
  if (a != 'pick') {   // Ki Burst and pause never share a button: the other one gives it up (or takes over the old ones)
    const o = a == 'ult' ? 'pause' : 'ult', f = SET.gp[o].filter(b => b != i);
    SET.gp[o] = f.length ? f : SET.gp[a].filter(b => b != i);
  }
  SET.gp[a] = [i]; saveSet(); kbMenu();
}
const kbIs = (e, a) => e.code == SET.kb[a];
const kbLabel = c => ({ Space: 'Space', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' })[c] || c.replace(/^(Key|Digit)/, '').replace(/([a-z])([A-Z])/g, '$1 $2');

function kbApply() {
  for (const c in KCODE) delete KCODE[c];
  Object.assign(KCODE, { ArrowUp: 'arrowup', ArrowDown: 'arrowdown', ArrowLeft: 'arrowleft', ArrowRight: 'arrowright' });
  delete KCODE[SET.kb.ult]; delete KCODE[SET.kb.pause];   // an arrow bound to Ki Burst / pause stops walking
  for (const a in KB_MOVE) KCODE[SET.kb[a]] = KB_MOVE[a];
  for (const k in keys) keys[k] = 0;
}
kbApply();

/* ---------- 1) choose upgrades with the keyboard ---------- */
addEventListener('keydown', e => {
  if (!S || (S.mode != 'lvl' && S.mode != 'wish' && S.mode != 'pause') || kbWait) return;
  const bs = [...ov.querySelectorAll('button:not(:disabled)')].filter(b => b.offsetParent); if (!bs.length) return;
  const cur = ov.querySelector('button.kb11'), i = bs.indexOf(cur);
  if (kbIs(e, 'pick') || e.key == 'Enter') {
    e.preventDefault(); if (e.repeat || !cur) return;   // shortcut: needs a direction press first, so held/mashed Space never picks
    cur.click(); return;
  }
  const back = e.key == 'ArrowUp' || e.key == 'ArrowLeft' || kbIs(e, 'up') || kbIs(e, 'left');
  const fwd = e.key == 'ArrowDown' || e.key == 'ArrowRight' || kbIs(e, 'down') || kbIs(e, 'right');
  if (!back && !fwd) return;
  e.preventDefault(); if (cur) cur.classList.remove('kb11');
  const b = bs[i < 0 ? (fwd ? 0 : bs.length - 1) : (i + (fwd ? 1 : -1) + bs.length) % bs.length];
  b.classList.add('kb11'); b.scrollIntoView({ block: 'nearest' });
  try { sfxPlay('ui'); } catch (x) { }
});

/* ---------- 2) Settings → Keybindings ---------- */
function kbMenu() {
  show(`<div class="card dbz sett"><div class="dhead"><span class="db4"></span><h2>Keybindings</h2></div>
  <div class="sgrid">${Object.keys(KB_DEF).map(a => `<button class="srow" onclick="kbWait='${a}';kbMenu()"><span>${KB_NAME[a]}</span><b>${kbWait == a ? 'Press a key…' : kbLabel(SET.kb[a])}</b></button>`).join('')}</div>
  <p class="how">${kbWait ? (kbWait.startsWith('gp:') ? 'Press the new controller button, or Esc to cancel.' : 'Press the new key, or Esc to cancel.') : 'Click an action, then press its new key. Arrow keys always move, Esc always pauses, Enter always selects.'}</p>
  ${GP.on ? `<h3>🎮 Controller</h3><div class="sgrid">${Object.keys(GP_DEF).map(a => `<button class="srow" onclick="kbWait='gp:${a}';kbMenu()"><span>${KB_NAME[a]}</span><b>${kbWait == 'gp:' + a ? 'Press a button…' : gpLabel(SET.gp[a])}</b></button>`).join('')}</div>
  <p class="how">The stick and D-pad always move. B always closes the pause menu.</p>` : '<p class="how">🎮 Connect a controller and press a button to rebind it here.</p>'}
  <button onclick="SET.kb=Object.assign({},KB_DEF);SET.gp=Object.assign({},GP_DEF);saveSet();kbApply();kbWait=null;kbMenu()">↺ Defaults</button>
  <button class="go" onclick="kbWait=null;settings()">Back</button></div>`);
}
// capture phase, so the key being bound never also pauses, fires Ki Burst or closes the menu
addEventListener('keydown', e => {
  if (!kbWait) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (kbWait.startsWith('gp:')) { if (e.key == 'Escape') { kbWait = null; kbMenu(); } return; }   // waiting for a controller button
  const a = kbWait; kbWait = null;
  if (e.code && e.key != 'Escape') {
    // a key already used by another play action swaps over (menu select can share, it only works in menus)
    const o = a == 'pick' ? null : Object.keys(KB_DEF).find(x => x != a && x != 'pick' && SET.kb[x] == e.code);
    if (o) SET.kb[o] = SET.kb[a];
    SET.kb[a] = e.code; saveSet(); kbApply();
  }
  kbMenu();
}, true);

{ const _st = settings; settings = function (back) {
    _st(back); if (!matchMedia('(any-pointer:fine)').matches && !GP.on) return;   // touch-only: nothing to bind
    const g = ov.querySelector('.card .sgrid'); if (!g) return;
    const rst = g.querySelector('.rst7');   // Reset all progress stays last
    (rst || g).insertAdjacentHTML(rst ? 'beforebegin' : 'beforeend', `<button class="srow" onclick="kbMenu()"><span>Keybindings</span><b>${kbLabel(SET.kb.up) + kbLabel(SET.kb.left) + kbLabel(SET.kb.down) + kbLabel(SET.kb.right)}</b><small>Keyboard keys and controller buttons</small></button>`);
  }; }

/* ---------- 3) Settings → Graphics ---------- */
const GFX_ROW = /^(cycleGfx\(\)|togSet\('(fps30|fpsShow|shake|nums)'\)|togOpt\('flash'|SET\.bgCache)/;
{ const _st = settings; settings = function (back) {
    if (back) V2.gfx = 0;   // opened fresh from the menu / pause screen: start on the main page
    _st(back); const g = ov.querySelector('.card .sgrid'); if (!g) return;
    const perf = b => GFX_ROW.test(b.getAttribute('onclick') || ''), rows = [...g.querySelectorAll('button.srow')];
    if (!V2.gfx) {
      rows.filter(perf).forEach(b => b.remove());
      g.insertAdjacentHTML('afterbegin', `<button class="srow" onclick="V2.gfx=1;settings()"><span>Graphics</span><b>›</b><small>Quality, frame rate, effects</small></button>`);
      return;
    }
    rows.filter(b => !perf(b)).forEach(b => b.remove());
    const q = rows.find(b => b.getAttribute('onclick') == 'cycleGfx()'); if (q) q.querySelector('span').textContent = 'Quality';
    ov.querySelector('.card h2').textContent = 'Graphics';
    ov.querySelector('.card button.go').setAttribute('onclick', 'V2.gfx=0;settings()');
  }; }

{ const st = document.createElement('style'); st.textContent = `
#ov button.kb11{outline:3px solid #ffd23a;outline-offset:2px;box-shadow:0 0 16px 3px rgba(255,210,58,.55);filter:brightness(1.12)}`; document.head.append(st); }
