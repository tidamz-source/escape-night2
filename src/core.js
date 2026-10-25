'use strict';
// ---------- constantes ----------
const VERSION = 'v0.1.0';
const W = 480, H = 270, SC = 2, TS = 16;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
cv.width = W * SC; cv.height = H * SC;
function resetT() { ctx.setTransform(SC, 0, 0, SC, 0, 0); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
resetT();

const FONT = '"Pixelify Sans", "Courier New", monospace';
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
function hi(x, y, flip, fn) { ctx.save(); ctx.translate(half(x), half(y)); ctx.scale(flip ? -0.5 : 0.5, 0.5); fn(); ctx.restore(); }
const D = R;

function text(str, x, y, o = {}) {
  const size = o.size || 8;
  ctx.font = `${o.bold ? 700 : 500} ${size}px ${FONT}`;
  ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'top';
  if (o.shadow !== false) { ctx.fillStyle = o.shadowColor || 'rgba(0,0,0,.75)'; ctx.fillText(str, x + 0.5, y + 0.5); }
  ctx.fillStyle = o.color || PAL.white; ctx.fillText(str, x, y);
}
function textW(str, size = 8) { ctx.font = `500 ${size}px ${FONT}`; return ctx.measureText(str).width; }
function wrap(str, maxW, size = 8) {
  const words = str.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (textW(t, size) > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}

// ---------- images ----------
const IMG = {};
let SACHA = null; // métadonnées de la spritesheet (format Aseprite JSON)
const PROPS = ['pine1', 'pine2', 'oak1', 'oak2', 'tent_r', 'tent_b', 'tent_y', 'campfire', 'campfire2', 'bush', 'log', 'rock', 'lamp', 'sign', 'fence', 'flowers', 'table'];
function loadImage(key, src) {
  return new Promise(r => { const i = new Image(); i.onload = () => { IMG[key] = i; r(); }; i.onerror = () => { console.warn('image manquante', src); r(); }; i.src = src; });
}
function loadAssets() {
  const jobs = PROPS.map(k => loadImage(k, `assets/props/${k}.png?v=${VERSION}`));
  jobs.push(loadImage('sacha', `assets/sacha.png?v=${VERSION}`));
  jobs.push(fetch(`assets/sacha.json?v=${VERSION}`).then(r => r.json()).then(j => { SACHA = j; }).catch(() => {}));
  return Promise.all(jobs);
}

// ---------- mise à l'échelle de l'écran ----------
function fit() {
  const vw = window.innerWidth, vh = window.innerHeight, s = Math.min(vw / W, vh / H);
  cv.style.width = Math.floor(W * s) + 'px'; cv.style.height = Math.floor(H * s) + 'px';
}
window.addEventListener('resize', fit); fit();

// ---------- sauvegarde ----------
const SAVE_KEY = 'escape-night2-save';
function defaultSave() { return { started: false, maxHp: 6, chest: false, keys: 0, door: false, firefly: false, done: false, muted: false }; }
let SAVE = defaultSave();
try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s) SAVE = Object.assign(defaultSave(), s); } catch (_) {}
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (_) {} }

// ---------- audio (synthé) ----------
let AC = null, MASTER = null;
function audioUnlock() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); MASTER = AC.createGain(); MASTER.gain.value = 0.5; MASTER.connect(AC.destination); } catch (_) { return; } }
  if (AC.state === 'suspended') AC.resume();
}
function tone(f, dur, o = {}) {
  if (!AC || SAVE.muted) return;
  const t = AC.currentTime + (o.delay || 0), osc = AC.createOscillator(), g = AC.createGain();
  osc.type = o.type || 'square'; osc.frequency.setValueAtTime(f, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  g.gain.setValueAtTime(o.vol || 0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g); g.connect(MASTER); osc.start(t); osc.stop(t + dur + 0.02);
}
function noise(dur, o = {}) {
  if (!AC || SAVE.muted) return;
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
  shoot() { tone(900, 0.15, { to: 400, type: 'sine', vol: 0.12 }); },
  bigheart() { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.25, { vol: 0.1, delay: i * 0.09, type: 'triangle' })); },
};
