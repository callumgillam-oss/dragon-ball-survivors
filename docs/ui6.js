/* =====================================================================
   DRAGON BALL SURVIVORS 3.0 — UI POLISH (presentation only)
     · one hand-drawn icon set replaces the emoji in every menu (emoji look different on every phone)
     · level buttons become cards with a picture of the map and its boss, and who has cleared it
     · wide screens (desktop, landscape phones) get a two-column main menu instead of one long column
     · panels and choices animate in; buttons react to a press
   ===================================================================== */
'use strict';

/* ---------- icon set ---------- */
const starPts = (n, R, r, cx = 12, cy = 12, a0 = -Math.PI / 2) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = a0 + i * Math.PI / n, q = i & 1 ? r : R; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * q).toFixed(1) + ' ' + (cy + Math.sin(a) * q).toFixed(1); } return d + 'z'; };
const HEART6 = 'M12 20.5C5 15.6 3 12 3 8.9A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 9 1.9c0 3.1-2 6.7-9 11.6z';
const LINE6 = (d, w = 2.6) => `<path d="${d}" fill="none" stroke="#3a1c06" stroke-width="${w + 2.6}"/><path d="${d}" fill="none" stroke="#ffc94a" stroke-width="${w}"/>`;
const BALL6 = `<circle cx="12" cy="12" r="8.6" fill="#ff9a1f"/><path d="M6.6 9.4a6.2 6.2 0 0 1 4.6-3.6" fill="none" stroke="#ffe2a8" stroke-width="1.6"/><path d="${starPts(5, 4.2, 1.8)}" fill="#e8312a" stroke-width="1"/>`;
const CAPS6 = c => `<g transform="rotate(-38 12 12)"><rect x="2.6" y="7.4" width="18.8" height="9.2" rx="4.6" fill="${c}"/><path d="M12 7.4H7.2a4.6 4.6 0 0 0 0 9.2H12z" fill="#fff4e0"/></g>`;
const ICO6 = {
  0x1F6D2: CAPS6('#4aa8ff'),                                                                                         // shop: a Capsule Corp capsule
  0x1F48A: CAPS6('#e8312a'),
  0x1F3C6: '<path d="M7 6H4.4a2.6 2.6 0 0 0 3 3.5M17 6h2.6a2.6 2.6 0 0 1-3 3.5" fill="none"/><path d="M7 3.8h10v5.4a5 5 0 0 1-10 0z"/><path d="M10.6 14h2.8v3.2h-2.8z"/><path d="M7.6 17.2h8.8v3H7.6z"/>',   // trophy
  0x1F4D6: '<path d="M3.2 5.6c3-1.3 6.2-1.2 8.8.6 2.6-1.8 5.8-1.9 8.8-.6v13c-3-1.3-6.2-1.2-8.8.6-2.6-1.8-5.8-1.9-8.8-.6z" fill="#fff4e0"/><path d="M12 6.2v13" fill="none"/><path d="M5.6 9.2c1.4-.3 2.8-.2 4 .4M5.6 12.4c1.4-.3 2.8-.2 4 .4M14.4 9.6c1.2-.6 2.6-.7 4-.4M14.4 12.8c1.2-.6 2.6-.7 4-.4" fill="none" stroke-width="1.1"/>',   // book
  0x1F4BE: '<path d="M4 4h12.6L20 7.4V20H4z"/><path d="M7.6 4h7.2v4.6H7.6z" fill="#7a4a12"/><path d="M7.2 12.6h9.6V20H7.2z" fill="#fff4e0"/>',   // save
  0x2699: '<path d="M18.7 10.1L21.8 10.3L21.8 13.7L18.7 13.9L18.1 15.5L20.1 17.7L17.7 20.1L15.5 18.1L13.9 18.7L13.7 21.8L10.3 21.8L10.1 18.7L8.5 18.1L6.3 20.1L3.9 17.7L5.9 15.5L5.3 13.9L2.2 13.7L2.2 10.3L5.3 10.1L5.9 8.5L3.9 6.3L6.3 3.9L8.5 5.9L10.1 5.3L10.3 2.2L13.7 2.2L13.9 5.3L15.5 5.9L17.7 3.9L20.1 6.3L18.1 8.5z"/><circle cx="12" cy="12" r="3" fill="#3a1c06" stroke="none"/>',   // gear
  0x1F4AA: '<path d="M8.2 10.6h7.6v2.8H8.200z"/><path d="M5 6.800h3.200v10.400H5zM15.800 6.800H19v10.400h-3.200z"/><path d="M2.400 9.400H5v5.200H2.400zM19 9.400h2.600v5.200H19z"/>',   // fist
  0x23F1: '<path d="M10 2.6h4v2.6h-4z"/><circle cx="12" cy="13.4" r="7.4" fill="#fff4e0"/><path d="M12 13.4V9M12 13.4l3 2" fill="none" stroke-width="1.8"/>',   // stopwatch
  0x1FAA8: '<path d="M9.400 9a2.600 2.600 0 1 1 5.200 0" fill="none" stroke-width="2"/><path d="M7.400 9h9.200l3.200 11.400H4.200z"/><text x="12" y="18.200" font-size="7.500" font-weight="900" font-family="system-ui,sans-serif" text-anchor="middle" fill="#3a1c06" stroke="none">G</text>',   // weight
  0x26A1: '<path d="M13.8 2.4L4.8 13.6h5.6L8.8 21.6l10-12.2h-5.6z"/>',   // bolt
  0x1F3A8: '<path d="M8.4 3.4L2.8 7l2.6 4.2 2.2-1.3V20.4h8.8V9.9l2.2 1.3L21.2 7l-5.6-3.6c-.6 1.6-2 2.5-3.6 2.5s-3-.9-3.6-2.5z" fill="#f48a1c"/><path d="M7.6 14.6h8.8" fill="none" stroke="#2a4aa0" stroke-width="2.4"/>',   // outfit
  0x1F94B: '<path d="M8.4 3.4L2.8 7l2.6 4.2 2.2-1.3V20.4h8.8V9.9l2.2 1.3L21.2 7l-5.6-3.6c-.6 1.6-2 2.5-3.6 2.5s-3-.9-3.6-2.5z" fill="#fff4e0"/><path d="M7.6 14.6h8.8" fill="none" stroke-width="2.4"/>',
  0x1F512: '<path d="M7.8 10.6V8a4.2 4.2 0 0 1 8.4 0v2.6" fill="none" stroke-width="2.2"/><rect x="5.2" y="10.4" width="13.6" height="10.2" rx="2"/><circle cx="12" cy="15" r="1.5" fill="#3a1c06"/>',   // lock
  0x1F513: '<path d="M7.8 10.6V8a4.2 4.2 0 0 1 8-1.8" fill="none" stroke-width="2.2"/><rect x="5.2" y="10.4" width="13.6" height="10.2" rx="2"/><circle cx="12" cy="15" r="1.5" fill="#3a1c06"/>',
  0x267E: LINE6('M12 12c-1.7-2.5-3.3-3.9-5.3-3.9a3.9 3.9 0 0 0 0 7.8c2 0 3.6-1.4 5.3-3.9 1.7 2.5 3.3 3.9 5.3 3.9a3.9 3.9 0 0 0 0-7.8c-2 0-3.6 1.4-5.3 3.9z'),   // endless
  0x1F504: LINE6('M18.6 9.2A7.4 7.4 0 0 0 5.4 8.4M19.4 4.6v4.8h-4.8M5.4 14.8a7.4 7.4 0 0 0 13.2.8M4.6 19.4v-4.8h4.8', 2.2),   // reroll
  0x1F3AE: '<path d="M7 7.6h10a4.6 4.6 0 0 1 4.5 5.5l-.7 3.5a2.4 2.4 0 0 1-4.3 1L15 15.8H9l-1.5 1.8a2.4 2.4 0 0 1-4.3-1l-.7-3.5A4.6 4.6 0 0 1 7 7.6z"/><path d="M7.6 10.4v3.2M6 12h3.2" fill="none" stroke-width="1.6"/><circle cx="15.4" cy="11" r="1" fill="#3a1c06"/><circle cx="17.6" cy="13" r="1" fill="#3a1c06"/>',   // gamepad
  0x1F4E4: LINE6('M5 13.4v6h14v-6M12 15V4.4M7.8 8.4L12 4.2l4.2 4.2', 2.2),   // share
  0x1F4E5: LINE6('M5 13.4v6h14v-6M12 4v10.6M7.8 10.6l4.2 4.2 4.2-4.2', 2.2),   // restore
  0x1F91D: `<path d="M2.4 6.6l7.4 5.4-7.4 5.4z" fill="#ff9a1f"/><path d="M21.6 6.6l-7.4 5.4 7.4 5.4z" fill="#4aa8ff"/><path d="${starPts(4, 5.4, 1.5)}" fill="#fff4e0"/>`,   // fusion
  0x1F3FA: '<path d="M8.6 3.2h6.8v2.6c2.4 1.6 3.6 4.1 3.6 7.2 0 4.200-2.6 7.6-7 7.6s-7-3.400-7-7.6c0-3.1 1.200-5.6 3.600-7.2z" fill="#c98a4a"/><path d="M5.400 10.800h13.200" fill="none"/><path d="M10.200 12.200h3.600v4.600h-3.600z" fill="#fff4e0" stroke-width="1.2"/>',   // sealing jar
  0x1F4B0: '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="6.200" fill="#ffe08a" stroke-width="1"/><path d="M9.400 9h5.200l-5.200 6h5.200" fill="none" stroke-width="1.800"/>',   // zeni
  0x1F4A5: `<path d="${starPts(8, 10, 5.4)}" fill="#ff9a1f"/><path d="${starPts(8, 5.6, 3)}" fill="#fff4e0" stroke-width="1"/>`,   // burst
  0x2728: '<path d="M10.400 2.800c.700 4.300 1.800 6 6.400 7.400-4.600 1.400-5.700 3.100-6.400 7.400-.700-4.300-1.800-6-6.400-7.400 4.600-1.400 5.700-3.100 6.400-7.400z"/><path d="M18.400 14c.300 1.900.800 2.600 2.800 3.200-2 .600-2.500 1.300-2.800 3.200-.300-1.900-.800-2.600-2.800-3.200 2-.600 2.500-1.300 2.800-3.200z" stroke-width="1.1"/>',   // sparkles
  0x2754: '<circle cx="12" cy="12" r="8.800" fill="#5a3a18"/><path d="M9.300 9.600a2.800 2.800 0 1 1 4.300 2.400c-1.100.700-1.600 1.300-1.600 2.400" fill="none" stroke="#ffc94a" stroke-width="2"/><circle cx="12" cy="17.300" r="1.100" fill="#ffc94a" stroke="none"/>',   // unknown
  0x1F409: BALL6, 0x1F7E0: BALL6,
  0x1FA90: '<circle cx="12" cy="12" r="6.200" fill="#4ec9a0"/><ellipse cx="12" cy="12" rx="10.400" ry="3.200" transform="rotate(-20 12 12)" fill="none" stroke="#3a1c06" stroke-width="3.400"/><ellipse cx="12" cy="12" rx="10.400" ry="3.200" transform="rotate(-20 12 12)" fill="none" stroke="#ffc94a" stroke-width="1.600"/><path d="M6.200 9.800a6.200 6.200 0 0 1 11.600 0z" fill="#4ec9a0" stroke="none"/>',   // planet
  0x1F3D9: '<path d="M3.200 20.600V11h5.200V4.600h7.200V9h5.200v11.600z" fill="#b8c4d4"/><path d="M10.800 8h2.400M10.800 11.400h2.400M10.800 14.800h2.400M5.400 14.400h1M5.400 17.400h1M17.800 12.600h1M17.800 16h1" fill="none" stroke-width="1.500"/>',   // city
  0x1F451: '<path d="M4.200 18.600L2.600 8.400l5.200 4L12 4.800l4.200 7.600 5.200-4-1.600 10.200z"/><path d="M4.600 18.600h14.800" fill="none"/>',   // crown
  0x1F4DF: '<circle cx="6" cy="12" r="3.600" fill="#b8c4d4"/><path d="M9 7.800h11.600v8.400H11.600L9 13.600z" fill="#5adf6a"/><path d="M13 11h5M13 13.400h3" fill="none" stroke-width="1.100"/>',   // scouter
  0x1F31F: `<path d="${starPts(5, 9.800, 4.200)}"/>`,   // star
  0x2795: '<path d="M9.800 3.800h4.400v6h6v4.400h-6v6H9.800v-6h-6V9.800h6z"/>',   // plus
  0x2694: '<path d="M20.200 3.800l-1.200 5.400-8.400 8.400-3.200-3.200 8.400-8.400z" fill="#dfe8f0"/><path d="M5 11.800l7.200 7.200M7.600 16.400l-3.800 3.800" fill="none" stroke-width="2.600"/>',   // sword
  0x1F36C: '<path d="M8 12L3 8.200v7.600zM16 12l5-3.800v7.600z" fill="#ffd0e8"/><circle cx="12" cy="12" r="5" fill="#ff7ac0"/><path d="M9.400 12a2.600 2.600 0 0 1 5.200 0" fill="none" stroke-width="1.200"/>',   // candy
  0x1F47B: '<path d="M5.800 20.400V11a6.200 6.200 0 0 1 12.400 0v9.400l-2.500-1.900-2.400 1.900-1.300-1.800-1.300 1.800-2.400-1.900z" fill="#f2f2ff"/><circle cx="9.800" cy="11.400" r="1.300" fill="#3a1c06" stroke="none"/><circle cx="14.200" cy="11.400" r="1.300" fill="#3a1c06" stroke="none"/>',   // ghost
  0x1F466: '<path d="M6.400 13.200a5.600 5.600 0 0 0 11.200 0c0-1-.200-2-.600-2.900l2.200-4.800-3.700 1.700L14 3l-2 3.300L10 3 8.500 7.200 4.800 5.500 7 10.300c-.400.900-.600 1.900-.600 2.900z"/><circle cx="10" cy="13.400" r="1" fill="#3a1c06" stroke="none"/><circle cx="14" cy="13.400" r="1" fill="#3a1c06" stroke="none"/>',   // hero face
  0x2764: `<path d="${HEART6}" fill="#ff4a4a"/>`, 0x1F49A: `<path d="${HEART6}" fill="#5adf6a"/>`, 0x1F49B: `<path d="${HEART6}" fill="#ffd23a"/>`,
  0x1F608: '<path d="M4.600 19V5.400l7.400 7.400 7.400-7.400V19h-3.800v-5.200L12 17.400l-3.600-3.600V19z" fill="#ff5a8a"/>',   // Majin mark
  0x1F300: LINE6('M12.200 12a1.600 1.600 0 1 0 1.600 1.600 4.200 4.200 0 1 0-4.200 4.200 7 7 0 1 0-4.800-12', 2),   // swirl
  0x1F4A8: LINE6('M3 8h7M2.400 12h6M4 16h6', 1.800) + '<path d="M12.400 5.400L21 12l-8.600 6.600v-3.800h-1.200V9.200h1.200z"/>',   // speed
  0x1F50A: '<path d="M3.600 9.400h3.800L12.200 5v14l-4.800-4.400H3.600z"/><path d="M15.400 9a4.300 4.300 0 0 1 0 6M17.900 6.600a7.700 7.700 0 0 1 0 10.800" fill="none" stroke="#ffc94a" stroke-width="2"/>',   // sound on
  0x1F507: '<path d="M3.600 9.400h3.800L12.200 5v14l-4.800-4.400H3.600z"/><path d="M15.800 9.400l5 5.200M20.800 9.400l-5 5.200" fill="none" stroke="#ff6a4a" stroke-width="2.200"/>',   // sound off
  0x23F8: '<path d="M6.600 4.800h3.800v14.400H6.600zM13.600 4.800h3.800v14.400h-3.800z"/>',   // pause
  0x26D4: '<circle cx="12" cy="12" r="8.800" fill="#e8312a"/><path d="M7 10.400h10v3.200H7z" fill="#fff4e0" stroke-width="1"/>'   // blocked
};
const EMO6 = /(?:[\u{1F300}-\u{1FAFF}]|[\u2600-\u27BF]|[\u23F1\u23F8])\uFE0F?/gu;
const icoSvg = cp => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICO6[cp]}</svg>`;
function icoText(n) {   // swap emoji in one text node for icons
  const s = n.nodeValue; EMO6.lastIndex = 0; if (!EMO6.test(s)) return; EMO6.lastIndex = 0;
  let out = '', last = 0, m, hit = 0; const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  while ((m = EMO6.exec(s))) { const cp = m[0].codePointAt(0); if (!ICO6[cp]) continue; out += esc(s.slice(last, m.index)) + icoSvg(cp); last = m.index + m[0].length; hit = 1; }
  if (!hit) return; out += esc(s.slice(last)); const sp = document.createElement('span'); sp.className = 'icw'; sp.innerHTML = out; n.replaceWith(sp);
}
function icoScan(root) {
  if (root.nodeType == 3) return icoText(root); if (root.nodeType != 1 || root.tagName == 'TEXTAREA' || root.tagName == 'CANVAS' || root.tagName == 'svg') return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), L = []; while (w.nextNode()) { const p = w.currentNode.parentNode; if (p && p.tagName != 'TEXTAREA' && p.tagName != 'SCRIPT' && p.tagName != 'STYLE') L.push(w.currentNode); }
  L.forEach(icoText);
}
new MutationObserver(ms => { for (const m of ms) { if (m.type == 'characterData') icoText(m.target); else m.addedNodes.forEach(icoScan); } }).observe(document.body, { childList: true, subtree: true, characterData: true });
icoScan(document.body);

/* ---------- styles ---------- */
{ const st = document.createElement('style'); st.textContent = `
.ico{width:1.2em;height:1.2em;vertical-align:-.24em;display:inline-block;fill:#ffc94a;stroke:#3a1c06;stroke-width:1.5;stroke-linejoin:round;stroke-linecap:round;overflow:visible;flex:none}
.ic.em .ico,.at .ico,.rvt .ico{width:1.5em;height:1.5em;vertical-align:-.36em}
/* motion: panels rise in, choices follow one after another, buttons give under the thumb */
@keyframes c6in{from{opacity:0;transform:translateY(14px) scale(.975)}to{opacity:1;transform:none}}
@keyframes u6in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes o6in{from{background:rgba(20,10,4,0)}}
#ov{animation:o6in .22s ease-out}
.card:not(.title){animation:c6in .24s cubic-bezier(.2,.8,.3,1.15) both}
.card>button.up{animation:u6in .26s ease-out both}
.card>button.up:nth-of-type(2){animation-delay:.05s}.card>button.up:nth-of-type(3){animation-delay:.1s}.card>button.up:nth-of-type(4){animation-delay:.15s}.card>button.up:nth-of-type(5){animation-delay:.2s}
button{transition:transform .08s ease-out,filter .12s,background-color .12s,box-shadow .12s}
button:not(:disabled):active{transform:scale(.97);filter:brightness(1.18)}
@media (hover:hover){button.go:not(:disabled):hover{filter:brightness(1.1)}}
button:focus-visible{box-shadow:0 0 0 3px rgba(255,226,122,.75)}
@media (prefers-reduced-motion:reduce){#ov,.card:not(.title),.card>button.up{animation:none}button{transition:none}}
#ov{scrollbar-width:thin;scrollbar-color:#a8581a transparent}
#ov::-webkit-scrollbar{width:8px}#ov::-webkit-scrollbar-thumb{background:#a8581a;border-radius:4px}#ov::-webkit-scrollbar-track{background:transparent}
/* level cards */
.lvg{display:grid;grid-template-columns:repeat(auto-fit,minmax(248px,1fr));gap:8px;margin-top:10px}
button.go.lvc{display:flex;align-items:center;gap:11px;text-align:left;margin:0;padding:7px 12px 7px 7px;width:auto;min-width:0;position:relative;overflow:hidden}
.lvt{position:static!important;inset:auto!important;width:94px!important;height:60px!important;flex:none;border-radius:8px;border:2px solid #3a1c06;box-shadow:0 0 0 1px rgba(255,226,170,.55);background:#2b1a0d;display:block}
.lvx{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.12}
.lvx em{font:800 10px/1.2 system-ui,sans-serif;font-style:normal;letter-spacing:1.6px;color:#ffe2a8;text-shadow:none;opacity:.95}
.lvx b{font-size:18px;line-height:1.02;margin:1px 0 2px}
.lvx small{display:block;font-size:11px;font-weight:normal;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:none}
.lvs{position:absolute;left:4px;top:4px;font:800 11px system-ui,sans-serif;color:#3a1c06;background:#ffd23a;border:1.5px solid #3a1c06;border-radius:9px;padding:1px 6px;text-shadow:none;letter-spacing:.3px}
.lvg>button.go.endb{margin:0;grid-column:1/-1}
/* two-column main menu on wide screens */
.m6r>*:first-child{margin-top:0}
@media (min-width:880px) and (min-height:561px){
 .card.title.m6{max-width:1040px;display:grid;grid-template-columns:minmax(340px,400px) minmax(0,1fr);align-items:start;padding:0;overflow:visible}
 .card.title.m6 .m6l{padding-bottom:14px;position:sticky;top:0}.card.title.m6 .m6l #ban{border-radius:11px 0 0 0}
 .card.title.m6 .m6r{padding:16px 18px 16px 6px}
 .m6r .m6row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.m6r .m6row>button{margin-top:8px}.m6r .m6row small{display:none}
}
@media (orientation:landscape) and (max-height:560px){
 .card.title.m6{display:flex;align-items:flex-start;max-width:min(980px,100%)}
 .card.title.m6 .m6l{width:40%;flex:none;position:sticky;top:0}.card.title.m6 .m6r{flex:1;min-width:0;padding:10px 14px 10px 4px}
 .card.title.m6 #ban{width:100%;height:auto;max-height:24vh;object-fit:cover;align-self:auto;flex:none}
 .card.title.m6 .m6l .in{padding:6px 12px}
 .lvg{gap:6px;margin-top:0;grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}.lvt{width:74px!important;height:48px!important}.lvx b{font-size:16px}button.go.lvc{padding:5px 9px 5px 5px}
 .m6r .m6row{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.m6r .m6row small{display:none}
}
@media (orientation:landscape) and (max-height:380px){.card.title.m6 #ban{display:none}}
`; document.head.appendChild(st); }

/* ---------- living title banner ---------- */
// The sunset banner was a still picture. Now the stars twinkle, clouds drift, the sun's rays turn,
// the Dragon Balls bob and glow, and the chosen hero stands there breathing.
let BAN6 = 0;
drawBanner = function () {
  cancelAnimationFrame(BAN6);
  const c = $('ban'); if (!c) return; const x = c.getContext('2d'), w = 360, h = 170, still = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const mesa = (pts, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, 170); pts.forEach(([a, b]) => x.lineTo(a, b)); x.lineTo(360, 170); x.fill(); };
  const frame = () => {
    if (!c.isConnected) return; const T = still ? 0 : performance.now() / 1000;
    x.setTransform(2, 0, 0, 2, 0, 0);
    let g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1e0c44'); g.addColorStop(.38, '#7a2a5a'); g.addColorStop(.62, '#e0582a'); g.addColorStop(1, '#ffb858'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 34; i++) { x.fillStyle = 'rgba(255,255,255,' + (.25 + hash(i, 1) * .5) * (.55 + .45 * Math.sin(T * (1.2 + hash(i, 4) * 2) + i * 2.1)) + ')'; const s = 1 + hash(i, 5) * .9; x.fillRect(hash(i, 2) * w, hash(i, 3) * 58, s, s); }
    // sun with slow-turning rays
    x.save(); x.globalCompositeOperation = 'lighter'; x.translate(250, 120);
    for (let i = 0; i < 12; i++) { const a = i * .5236 + T * .08; x.fillStyle = 'rgba(255,220,140,' + (.05 + .03 * (i & 1)) + ')'; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a - .1) * 190, Math.sin(a - .1) * 190); x.lineTo(Math.cos(a + .1) * 190, Math.sin(a + .1) * 190); x.fill(); }
    g = x.createRadialGradient(0, 0, 3, 0, 0, 86); g.addColorStop(0, 'rgba(255,250,210,1)'); g.addColorStop(.22, 'rgba(255,224,140,.85)'); g.addColorStop(1, 'rgba(255,160,60,0)'); x.fillStyle = g; x.fillRect(-90, -90, 180, 180); x.restore();
    // drifting cloud bands
    for (let i = 0; i < 6; i++) { const cw = 60 + hash(i, 21) * 70, cx = ((hash(i, 22) * (w + 160) + T * (4 + hash(i, 23) * 5)) % (w + 160)) - 80, cy = 40 + hash(i, 24) * 52;
      x.fillStyle = i % 2 ? 'rgba(255,170,120,.20)' : 'rgba(90,30,90,.28)'; x.beginPath(); x.ellipse(cx, cy, cw, 5 + hash(i, 25) * 5, 0, 0, 7); x.ellipse(cx + cw * .3, cy - 4, cw * .55, 5, 0, 0, 7); x.fill(); }
    // mesas: far, near, ground
    mesa([[0, 122], [40, 118], [58, 100], [96, 100], [112, 124], [190, 126], [204, 108], [236, 108], [250, 126], [320, 122], [332, 112], [360, 112]], '#7a3458');
    mesa([[0, 135], [20, 96], [70, 96], [90, 135], [140, 135], [165, 88], [215, 88], [240, 135], [290, 135], [305, 104], [345, 104], [360, 135]], '#4a1e3a');
    x.fillStyle = 'rgba(255,170,110,.22)'; for (const [a, b, l] of [[20, 96, 50], [165, 88, 50], [305, 104, 40]]) x.fillRect(a, b, l, 2);   // rim light on the mesa tops
    x.fillStyle = '#8a4a2a'; x.fillRect(0, 138, w, 32); x.fillStyle = 'rgba(60,20,10,.35)'; x.fillRect(0, 138, w, 6); x.fillStyle = 'rgba(255,200,130,.25)'; x.fillRect(0, 144, w, 1.5);
    // the seven Dragon Balls, bobbing
    for (let i = 0; i < 7; i++) { const bx = 34 + i * 49, by = 24 + Math.abs(i - 3) * 5 + Math.sin(T * 1.8 + i * .9) * 2.4;
      x.save(); x.globalCompositeOperation = 'lighter'; g = x.createRadialGradient(bx, by, 4, bx, by, 22); g.addColorStop(0, 'rgba(255,190,80,' + (.42 + .18 * Math.sin(T * 2.4 + i)) + ')'); g.addColorStop(1, 'rgba(255,150,40,0)'); x.fillStyle = g; x.fillRect(bx - 22, by - 22, 44, 44); x.restore();
      x.drawImage(BALLS[i], bx - 12, by - 12, 24, 24); }
    // the hero, idling
    try { const im = sheetOf(HERO, 0), f = still ? 0 : Math.floor(T * 8) % FRN[1]; x.fillStyle = 'rgba(40,14,10,.38)'; x.beginPath(); x.ellipse(195, 150, 38, 7, 0, 0, 7); x.fill(); x.drawImage(im, f * HC, HC, HC, HC, 115, -2, 160, 160); } catch (e) { }
    // dust on the wind
    x.fillStyle = 'rgba(255,226,180,.5)'; for (let i = 0; i < 10; i++) { const px = ((hash(i, 31) * w + T * (18 + hash(i, 32) * 26)) % (w + 20)) - 10, py = 132 + hash(i, 33) * 34 + Math.sin(T * 1.4 + i) * 2; x.fillRect(px, py, 5 + hash(i, 34) * 6, 1); }
    if (!still) BAN6 = requestAnimationFrame(frame);
  };
  frame();
};

/* ---------- level cards ---------- */
const LVB6 = { 1: 'veg', 2: 'fr1', 3: 'ce1', 4: 'bu1' }, TH6 = {};
function lvThumb(st) {   // a small picture of the map with its boss, painted once with the game's own art
  if (TH6[st]) return TH6[st];
  const w = 150, h = 96, c = mk(w * 2, h * 2), x = c.getContext('2d'), keep = { stage: S.stage, t: S.t, endless: S.endless, mph: S.mph, en: S.en };
  try {
    S.stage = st; S.t = st == 4 ? 420 : 30; S.endless = 0; S.en = [];
    ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
    const sw = W, sh = H; bg(st * 1370 + 60, st * 910 + 40);
    const k = LVB6[st], T = TYPES[k], e = { k, x: 0, y: 0, r: T.r, hp: 1, max: 1, boss: 1, t: 0, a: 0, vx: 0, vy: 0 };
    ctx.translate(w * .66, h * .62); const sc = Math.min(1, 26 / T.r); ctx.scale(sc, sc); enemy(e, 0, 0);
    ctx.restore(); x.drawImage(ctx.canvas, 0, 0, w * DPR, h * DPR, 0, 0, w * 2, h * 2);
    const g = x.createLinearGradient(0, 0, 0, h * 2); g.addColorStop(0, 'rgba(255,170,90,.12)'); g.addColorStop(1, 'rgba(40,10,60,.38)'); x.fillStyle = g; x.fillRect(0, 0, w * 2, h * 2);
  } catch (err) { try { ctx.restore(); } catch (e2) { } const g = x.createLinearGradient(0, 0, 0, h * 2); g.addColorStop(0, ['#c8975a', '#3f9a6a', '#7c7e86', '#8a4a8a'][st - 1] || '#c8975a'); g.addColorStop(1, '#2b1a0d'); x.fillStyle = g; x.fillRect(0, 0, w * 2, h * 2); }
  Object.assign(S, keep); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  return TH6[st] = c;
}
function menu6() {
  const card = ov.querySelector('.card.title'), inn = card && card.querySelector('.in'); if (!inn || !inn.querySelector('.hcar')) return;
  // level buttons -> picture cards in a grid
  const lv = [...inn.querySelectorAll('button.go')].filter(b => /^start(Endless)?\(/.test(b.getAttribute('onclick') || ''));
  if (lv.length) { const grid = document.createElement('div'); grid.className = 'lvg'; lv[0].before(grid);
    for (const b of lv) { grid.appendChild(b); const m = /^start\((\d)\)/.exec(b.getAttribute('onclick')); if (!m) continue; const st = +m[1], sm = b.querySelector('small'), sub = sm ? sm.textContent : '';
      if (sm) sm.remove(); const nm = b.textContent.replace(/^Level \d:\s*/, '').trim(), n = Object.keys((P.clr && P.clr[st]) || {}).length;
      b.classList.add('lvc'); b.innerHTML = `<canvas class="lvt" width="300" height="192"></canvas><span class="lvx"><em>LEVEL ${st}</em><b>${nm}</b><small>${sub}</small></span>${n ? `<span class="lvs" title="Heroes who have cleared this level">★ ${n}</span>` : ''}`;
      b.querySelector('canvas').getContext('2d').drawImage(lvThumb(st), 0, 0); } }
  // two columns: hero pick on the left, everything you can press on the right
  const L = document.createElement('div'), R = document.createElement('div'), kids = [...inn.children]; L.className = 'm6l'; R.className = 'in m6r';
  let cut = 0; kids.forEach((k, i) => { if (k.matches('.hcar,.hdesc,.vskin')) cut = i; });
  kids.slice(cut + 1).forEach(k => R.appendChild(k));
  const ban = card.querySelector('#ban'); card.insertBefore(L, card.firstChild); if (ban) L.appendChild(ban); L.appendChild(inn); card.appendChild(R); card.classList.add('m6');
  // the three housekeeping buttons share a row when there is room
  const tail = [...R.children].filter(k => k.tagName == 'BUTTON' && !k.getAttribute('onclick') && !k.classList.length);
  if (tail.length == 3 && tail[0].nextElementSibling == tail[1] && tail[1].nextElementSibling == tail[2]) { const row = document.createElement('div'); row.className = 'm6row'; tail[0].before(row); tail.forEach(b => row.appendChild(b)); }
}
{ const _m = menu; menu = function () { _m(); try { if (PROG_READY) menu6(); } catch (e) { console.warn('menu6', e); } }; }
if (PROG_READY && S && S.mode == 'menu' && !svWelcomeOn) menu();
