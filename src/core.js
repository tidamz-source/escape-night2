'use strict';
// ---------- constantes ----------
const VERSION = 'v8.12.6';
const W = 480, H = 270, SC = 2, TS = 16;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
cv.width = W * SC; cv.height = H * SC;
function resetT() { ctx.setTransform(SC, 0, 0, SC, 0, 0); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
resetT();

const FONT = '"Pixelify Sans", "Courier New", monospace';
const FONT_T = '"Silkscreen", "Pixelify Sans", "Courier New", monospace'; // titres et étiquettes des menus (bois et parchemin)
const PAL = { ink: '#070d1f', night: '#0c1530', deep: '#14244c', teal: '#1d5c66', glow: '#8ff3ea', lav: '#c3b3ff', warm: '#ffcf7a', white: '#f4f7ff', red: '#ff6b7a', green: '#7be38f', heart: '#ff4d6a' };

// ---------- utilitaires ----------
const rand = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const pick = a => a[Math.floor(Math.random() * a.length)];
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const rectHit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function seeded(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
const half = v => Math.round(v * 2) / 2;

function R(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
function ell(x, y, rx, ry, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fill(); }
// Dessin en "haute densité" : à l'intérieur de fn, 1 unité = 1 pixel écran (2 px par pixel monde), comme les sprites d'Escape Night.
function hi(x, y, flip, fn, s = 1) { ctx.save(); ctx.translate(half(x), half(y)); ctx.scale((flip ? -0.5 : 0.5) * s, 0.5 * s); fn(); ctx.restore(); }
const D = R;

function text(str, x, y, o = {}) {
  const size = o.size || 8;
  ctx.font = o.font === 't' ? `${o.bold ? 700 : 400} ${size}px ${FONT_T}` : `${o.bold ? 700 : 500} ${size}px ${FONT}`;
  if (o.font === 't') str = String(str).toUpperCase();
  ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'top';
  if (o.shadow !== false) { ctx.fillStyle = o.shadowColor || 'rgba(0,0,0,.75)'; ctx.fillText(str, x + 0.5, y + 0.5); }
  ctx.fillStyle = o.color || PAL.white; ctx.fillText(str, x, y);
}
function textW(str, size = 8, font) { ctx.font = font === 't' ? `400 ${size}px ${FONT_T}` : `500 ${size}px ${FONT}`; return ctx.measureText(font === 't' ? String(str).toUpperCase() : str).width; }
function wrap(str, maxW, size = 8) {
  const words = str.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (textW(t, size) > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}

// ---------- images ----------
const IMG = {};
const SHEETS = {}; // planches des héros (format Aseprite JSON)
const HERO_SHEETS = ['sacha', 'cam', 'rox'];
const FACES = ['sacha', 'cam', 'rox', 'papa', 'amandine', 'claudine'].flatMap(w => ['smile', 'o', 'angry', 'wink'].map(m => `${w}_${m}`)).filter(k => k !== 'amandine_o' && k !== 'amandine_angry' && k !== 'amandine_wink' && k !== 'claudine_o' && k !== 'claudine_angry' && k !== 'claudine_wink');
// PNJ PixelLab (assets/npc/pl/<clé>.png : 8 directions sur une ligne, l'animation d'attente de face en dessous)
const PL_KEYS = ['garde', 'arthur', 'jules', 'lila', 'fantome', 'epiciere', 'sage', 'pierrette', 'fossoyeur', 'coquillages', 'hugo', 'herboriste', 'bucheron', 'gnome', 'firmin', 'gaelle', 'artificiere', 'gardien', 'ermite', 'vagabond', 'pauline', 'odette', 'lavandiere', 'crieur', 'forgeron', 'bastien', 'pervenche', 'margot', 'pecheur', 'berger', 'mahaut', 'gaspard', 'amandine', 'claudine', 'papa', 'aubergiste', 'lampions'];
// boss et monstres PixelLab (planches : 8 directions sur une ligne, animations en dessous)
const BOSS_IMGS = [['boss_shadow', 'boss/shadow'], ['boss_queen', 'boss/queen'], ['boss_mole', 'boss/mole'], ['mob_boar', 'mobs/boar'], ['mob_raccoon', 'mobs/raccoon'], ['mob_bat', 'mobs/bat'], ['mob_shadow', 'mobs/shadow'], ['mob_wisp', 'mobs/wisp'], ['mob_squirrel', 'mobs/squirrel'], ['mob_crow', 'mobs/crow'], ['mob_gnome', 'mobs/gnome'], ['mob_spider', 'mobs/spider'], ['mob_crab', 'mobs/crab'], ['mob_eel', 'mobs/eel'], ['mob_skeleton', 'mobs/skeleton'], ['mob_gargoyle', 'mobs/gargoyle'], ['mob_dog', 'mobs/dog'], ['mob_sheep', 'mobs/sheep'], ['mob_ram', 'mobs/ram'], ['mob_chicken', 'mobs/chicken'], ['boss_king', 'boss/king'], ['boss_mknight', 'boss/mknight'], ['boss_iknight', 'boss/iknight'], ['boss_owl', 'boss/owl']];
// icônes d'objets PixelLab (assets/items/<id>.png, recadrées)
const ITEM_ICONS = ['appat', 'bigkey', 'bottes', 'bouclier', 'bourse', 'bourse_geante', 'bouteille', 'branche', 'canne', 'carquois', 'cle', 'epee_bois', 'epee_fer', 'frisbee', 'grande_bourse', 'grappin', 'harpe', 'lance_pierre', 'palmes', 'petards', 'sacoche_voyage', 'cailloux', 'cle_tour', 'coeur', 'coupe', 'ecu1', 'ecu20', 'ecu5', 'feuille', 'fragment', 'grimoire', 'huile', 'lettre', 'petards5', 'seal', 'troc_boussole', 'troc_carte_marine', 'troc_laine', 'troc_longue_vue', 'troc_manche', 'troc_oeuf', 'troc_pioche', 'acier_gnome', 'cristal', 'ecaille', 'ecaille_reine', 'eclat_ombre', 'minerai', 'pierre_lune', 'plume', 'plume_duc', 'poisson_dore', 'poisson_grand', 'poisson_petit', 'poudre', 'quart_coeur', 'champignons', 'elixir', 'herbe_rare', 'herbe', 'sirop', 'soupe', 'soupe_jardin', 'soupe_pecheur', 'bouillon', 'soupe_doree', 'veloute', 'soupe_berger', 'grand_coffre', 'grand_coffre_open'];
// cueillettes : 8 vues PixelLab, une tirée au hasard par plant pour varier
const ITEM_VARIANTS = ['champignons', 'herbe', 'herbe_rare'];
// décor PixelLab (assets/deco/<k>.png, recadré)
const DECO_IMGS = ['block', 'bush', 'cracked', 'dead', 'fswitch_off', 'fswitch_on', 'glowshroom', 'grave', 'lamp', 'lighthouse', 'plate_off', 'plate_on', 'relay_off', 'relay_on', 'secretrock', 'shrine', 'target', 'windmill'];
const NPC_SPRITES = ['claudine', 'dog_down', 'dog_up', 'dog_left', 'dog_right', 'amandine', 'papa_down', 'papa_up', 'papa_left', 'papa_right'];
const SWIMMERS = ['sacha', 'cam', 'rox', 'papa'];
const PROPS = ['pine1', 'pine2', 'oak1', 'oak2', 'tent_r', 'tent_b', 'tent_y', 'campfire', 'campfire2', 'bush', 'log', 'rock', 'lamp', 'sign', 'fence', 'flowers', 'table'];
// tilesets Wang par coins (32 × 32, 2 matières) : thème de zone → fichier dans assets/tiles
const WANG_FILES = { royaume: 'royaume_paves' };
function loadImage(key, src) {
  return new Promise(r => { const i = new Image(); i.onload = () => { IMG[key] = i; r(); }; i.onerror = () => { console.warn('image manquante', src); r(); }; i.src = src; });
}
function loadAssets() {
  const jobs = PROPS.map(k => loadImage(k, `assets/props/${k}.png?v=${VERSION}`));
  for (const h of HERO_SHEETS) {
    jobs.push(loadImage('hero_' + h, `assets/${h}.png?v=${VERSION}`));
    jobs.push(fetch(`assets/${h}.json?v=${VERSION}`).then(r => r.json()).then(j => { SHEETS[h] = j; }).catch(() => {}));
  }
  for (const f of FACES) jobs.push(loadImage('face_' + f, `assets/faces/${f}.png?v=${VERSION}`));
  for (const [k, p] of BOSS_IMGS) jobs.push(loadImage(k, `assets/${p}.png?v=${VERSION}`));
  for (const k of DECO_IMGS) jobs.push(loadImage('deco_' + k, `assets/deco/${k}.png?v=${VERSION}`));
  for (const k of ITEM_ICONS) jobs.push(loadImage('item_' + k, `assets/items/${k}.png?v=${VERSION}`));
  for (const k of ITEM_VARIANTS) for (let v = 0; v < 8; v++) jobs.push(loadImage(`item_${k}_v${v}`, `assets/items/${k}_v${v}.png?v=${VERSION}`));
  for (const k of PL_KEYS) jobs.push(loadImage('pl_' + k, `assets/npc/pl/${k}.png?v=${VERSION}`));
  for (const k of NPC_SPRITES) jobs.push(loadImage('npc_' + k, `assets/npc/${k}.png?v=${VERSION}`));
  for (const k of SWIMMERS) for (const i of [0, 1]) jobs.push(loadImage('swim_' + k + i, `assets/swim/${k}${i}.png?v=${VERSION}`));
  for (const k of ['royaume', 'biblio', 'collines', 'camping', 'route_nord', 'mobil_home']) { jobs.push(loadImage('map_' + k, `assets/maps/${k}.png?v=${VERSION}`)); jobs.push(loadImage('map_' + k + '_dessus', `assets/maps/${k}_dessus.png?v=${VERSION}`)); }
  for (const [k, f] of Object.entries(WANG_FILES)) jobs.push(loadImage('wang_' + k, `assets/tiles/${f}.png?v=${VERSION}`));
  jobs.push(loadData());
  return Promise.all(jobs).then(() => { if (IMG.deco_lamp) IMG.lamp = IMG.deco_lamp; }); // réverbère PixelLab du camping
}

// ---------- mise à l'échelle de l'écran ----------
function fit() {
  const vw = window.innerWidth, vh = window.innerHeight, s = Math.min(vw / W, vh / H);
  cv.style.width = Math.floor(W * s) + 'px'; cv.style.height = Math.floor(H * s) + 'px';
}
window.addEventListener('resize', fit); fit();

// ---------- préférences (communes à toutes les sauvegardes) ----------
const PREFS = { muted: false };
try { Object.assign(PREFS, JSON.parse(localStorage.getItem('escape-night2-prefs')) || {}); } catch (_) {}
function savePrefs() { try { localStorage.setItem('escape-night2-prefs', JSON.stringify(PREFS)); } catch (_) {} }

// ---------- installation PWA ----------
const PWA = {
  deferred: null,
  installed() { return window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true || localStorage.getItem('escape-night2-installed') === '1'; },
  ios() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); },
  async install() {
    if (!this.deferred) return false;
    this.deferred.prompt();
    const r = await this.deferred.userChoice.catch(() => null); this.deferred = null;
    return !!r;
  },
};
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); PWA.deferred = e; });
window.addEventListener('appinstalled', () => { try { localStorage.setItem('escape-night2-installed', '1'); } catch (_) {} PWA.deferred = null; if (typeof Input !== 'undefined') Input.toast = { msg: 'Appli installée !', t: 2.5 }; });

// ---------- audio (synthé) ----------
let AC = null, MASTER = null;
function audioUnlock() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); MASTER = AC.createGain(); MASTER.gain.value = 0.5; MASTER.connect(AC.destination); } catch (_) { return; } }
  if (AC.state === 'suspended') AC.resume();
}
function tone(f, dur, o = {}) {
  if (!AC || PREFS.muted) return;
  const t = AC.currentTime + (o.delay || 0), osc = AC.createOscillator(), g = AC.createGain();
  osc.type = o.type || 'square'; osc.frequency.setValueAtTime(f, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  g.gain.setValueAtTime(o.vol || 0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g); g.connect(MASTER); osc.start(t); osc.stop(t + dur + 0.02);
}
function noise(dur, o = {}) {
  if (!AC || PREFS.muted) return;
  const t = AC.currentTime + (o.delay || 0), n = Math.floor(AC.sampleRate * dur), buf = AC.createBuffer(1, n, AC.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  src.buffer = buf; f.type = o.filter || 'lowpass'; f.frequency.value = o.freq || 1200;
  g.gain.setValueAtTime(o.vol || 0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f); f.connect(g); g.connect(MASTER); src.start(t);
}
const SFX = {
  swing() { noise(0.12, { filter: 'bandpass', freq: 1800, vol: 0.18 }); },
  hit() { tone(220, 0.08, { to: 90, vol: 0.2 }); noise(0.06, { freq: 3000, vol: 0.15 }); },
  kill() { tone(500, 0.18, { to: 60, type: 'sawtooth', vol: 0.12 }); noise(0.25, { freq: 900, vol: 0.18 }); },
  hurt() { tone(330, 0.2, { to: 110, type: 'sawtooth', vol: 0.18 }); },
  cut() { noise(0.15, { filter: 'highpass', freq: 2500, vol: 0.2 }); },
  pickup() { tone(880, 0.07, { vol: 0.12 }); tone(1320, 0.1, { vol: 0.12, delay: 0.07 }); },
  chest() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, { vol: 0.12, delay: i * 0.1, type: 'triangle' })); },
  door() { noise(0.4, { freq: 400, vol: 0.3 }); tone(110, 0.3, { to: 70, vol: 0.15 }); },
  locked() { tone(160, 0.08, { vol: 0.15 }); tone(130, 0.12, { vol: 0.15, delay: 0.09 }); },
  blip() { tone(1200, 0.025, { vol: 0.04 }); },
  menu() { tone(660, 0.05, { vol: 0.1 }); },
  heartTick() { tone(880, 0.04, { vol: 0.07 }); },
  shoot() { tone(900, 0.15, { to: 400, type: 'sine', vol: 0.12 }); },
  sling() { tone(520, 0.06, { to: 1200, type: 'triangle', vol: 0.1 }); noise(0.05, { filter: 'highpass', freq: 3000, vol: 0.08 }); },
  tink() { tone(1800, 0.05, { vol: 0.08, type: 'triangle' }); tone(2400, 0.08, { vol: 0.06, type: 'triangle', delay: 0.03 }); },
  push() { noise(0.18, { freq: 300, vol: 0.18 }); },
  secret() { [784, 740, 622, 440, 415, 659, 831, 1047].forEach((f, i) => tone(f, 0.14, { vol: 0.09, delay: i * 0.09, type: 'square' })); },
  crystal() { [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.3, { vol: 0.08, delay: i * 0.06, type: 'sine' })); },
  shutter() { noise(0.25, { freq: 700, vol: 0.22 }); tone(90, 0.2, { vol: 0.12 }); },
  roar() { tone(110, 0.9, { to: 55, type: 'sawtooth', vol: 0.18 }); noise(0.9, { freq: 500, vol: 0.2 }); },
  stun() { tone(880, 0.12, { to: 220, type: 'square', vol: 0.14 }); tone(660, 0.3, { to: 1320, type: 'triangle', vol: 0.1, delay: 0.1 }); },
  bossHit() { tone(160, 0.2, { to: 60, type: 'sawtooth', vol: 0.2 }); noise(0.15, { freq: 1500, vol: 0.2 }); },
  bossDie() { for (let i = 0; i < 6; i++) { noise(0.3, { freq: 600 + i * 200, vol: 0.2, delay: i * 0.22 }); tone(300 - i * 30, 0.3, { to: 50, type: 'sawtooth', vol: 0.1, delay: i * 0.22 }); } },
  coin() { tone(1568, 0.05, { vol: 0.08, type: 'square' }); tone(2093, 0.09, { vol: 0.08, type: 'square', delay: 0.05 }); },
  buy() { [659, 880, 1175].forEach((f, i) => tone(f, 0.1, { vol: 0.1, delay: i * 0.07, type: 'triangle' })); },
  nope() { tone(220, 0.08, { vol: 0.12 }); tone(180, 0.12, { vol: 0.12, delay: 0.08 }); },
  rift() { tone(220, 1.2, { to: 880, type: 'sine', vol: 0.12 }); tone(330, 1.2, { to: 1320, type: 'triangle', vol: 0.08 }); noise(1.2, { freq: 1500, vol: 0.1 }); },
  roll() { noise(0.15, { freq: 700, vol: 0.15 }); },
  drink() { [523, 659, 784].forEach((f, i) => tone(f, 0.12, { vol: 0.1, delay: i * 0.08, type: 'sine' })); },
  throw() { noise(0.25, { filter: 'bandpass', freq: 1400, vol: 0.12 }); tone(600, 0.2, { to: 900, type: 'sine', vol: 0.06 }); },
  catch() { tone(980, 0.05, { vol: 0.08, type: 'triangle' }); },
  hoot() { tone(330, 0.25, { to: 300, type: 'sine', vol: 0.18 }); tone(330, 0.35, { to: 280, type: 'sine', vol: 0.18, delay: 0.32 }); },
  wind() { noise(1.6, { filter: 'bandpass', freq: 500, vol: 0.12 }); },
  splash() { noise(0.3, { freq: 900, vol: 0.18 }); tone(300, 0.15, { to: 120, type: 'sine', vol: 0.08 }); },
  dive() { noise(0.25, { freq: 600, vol: 0.18 }); tone(500, 0.3, { to: 150, type: 'sine', vol: 0.1 }); },
  hook() { tone(300, 0.15, { to: 900, type: 'square', vol: 0.08 }); noise(0.15, { filter: 'highpass', freq: 3000, vol: 0.08 }); },
  clank() { tone(1400, 0.06, { vol: 0.12, type: 'square' }); tone(900, 0.1, { vol: 0.1, type: 'triangle', delay: 0.04 }); },
  boom() { noise(0.6, { freq: 400, vol: 0.4 }); tone(120, 0.5, { to: 40, type: 'sawtooth', vol: 0.2 }); },
  fuse() { noise(0.3, { filter: 'highpass', freq: 4000, vol: 0.1 }); },
  cart() { tone(200, 0.3, { to: 300, type: 'square', vol: 0.08 }); noise(0.3, { freq: 2500, vol: 0.1 }); },
  rail() { noise(0.04, { filter: 'highpass', freq: 3500, vol: 0.05 }); },
  lever() { tone(600, 0.05, { vol: 0.12 }); noise(0.1, { freq: 1500, vol: 0.12, delay: 0.04 }); },
  valve() { noise(1.2, { freq: 500, vol: 0.2 }); tone(140, 1, { to: 90, type: 'sine', vol: 0.12 }); },
  clock() { [1568, 1175, 1568, 1175].forEach((f, i) => tone(f, 0.12, { vol: 0.08, delay: i * 0.12, type: 'triangle' })); tone(110, 0.8, { type: 'sine', vol: 0.12 }); },
  bark() { tone(700, 0.06, { to: 500, vol: 0.12 }); tone(750, 0.08, { to: 520, vol: 0.12, delay: 0.12 }); },
  dig() { noise(0.15, { freq: 900, vol: 0.15 }); noise(0.15, { freq: 900, vol: 0.15, delay: 0.2 }); },
  baa() { tone(420, 0.25, { to: 380, type: 'sawtooth', vol: 0.05 }); },
  cluck() { tone(900, 0.05, { to: 600, vol: 0.08 }); tone(800, 0.06, { to: 500, vol: 0.08, delay: 0.08 }); },
  chime() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.5, { vol: 0.09, delay: i * 0.18, type: 'triangle' })); tone(130, 1.6, { type: 'sine', vol: 0.12 }); },
  gate() { noise(1.6, { freq: 300, vol: 0.3 }); tone(80, 1.6, { to: 50, type: 'sawtooth', vol: 0.15 }); },
  fall() { tone(700, 0.6, { to: 70, vol: 0.16 }); },
  bigheart() { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.25, { vol: 0.1, delay: i * 0.09, type: 'triangle' })); },
};
