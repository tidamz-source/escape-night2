'use strict';
// Entrées unifiées : clavier + manette (Gamepad API) + pad virtuel tactile.
// Le jeu ne lit que Input.dx / Input.dy (-1..1) et Input.pressed('a'|'b'|'start'|'up'|'down').
const PAD = { x: 70, y: 196, r: 34 };
const BTN = {
  a: { x: 440, y: 212, r: 22, label: 'A' },
  b: { x: 394, y: 236, r: 16, label: 'B' },
  start: { x: 458, y: 20, r: 12, label: 'II' },
  r: { x: 452, y: 168, r: 13, label: 'R' }, // roulade (Rox)
};
const hasRoll = () => typeof SAVE !== 'undefined' && DATA.heroes && Heroes.def() && Heroes.def().roll && G.view === 'world';

const Input = {
  dx: 0, dy: 0,
  held: { a: false, b: false, r: false, cycle: false, start: false, up: false, down: false, left: false, right: false },
  prev: {},
  padVisible: false,
  gamepadName: '',
  toast: { msg: '', t: 0 },
  keys: new Set(),
  taps: new Set(), // touches appuyées puis relâchées entre deux images : on ne les perd pas
  touches: new Map(), // id -> { role, x, y }
  tapRoles: new Set(),
  lastTap: null,
  stick: { x: 0, y: 0, active: false, bx: PAD.x, by: PAD.y, kx: PAD.x, ky: PAD.y },

  pressed(k) { return this.held[k] && !this.prev[k]; },

  update() {
    this.prev = Object.assign({}, this.held);
    let dx = 0, dy = 0, a = false, b = false, r = false, cycle = false, start = false;
    const k = new Set([...this.keys, ...this.taps]); this.taps.clear();
    // clavier (e.code = touches physiques : marche en AZERTY comme en QWERTY)
    if (k.has('ArrowLeft') || k.has('KeyA')) dx -= 1;
    if (k.has('ArrowRight') || k.has('KeyD')) dx += 1;
    if (k.has('ArrowUp') || k.has('KeyW')) dy -= 1;
    if (k.has('ArrowDown') || k.has('KeyS')) dy += 1;
    if (k.has('Space') || k.has('KeyJ') || k.has('KeyX') || k.has('Enter')) a = true;
    if (k.has('KeyK') || k.has('KeyC') || k.has('ShiftLeft')) b = true;
    if (k.has('KeyL') || k.has('ShiftRight')) r = true;
    if (k.has('KeyE') || k.has('Tab')) cycle = true;
    if (k.has('Escape') || k.has('KeyP')) start = true;

    // manette
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of pads) {
      if (!gp || !gp.connected) continue;
      const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      if (Math.hypot(ax, ay) > 0.3) { dx += ax; dy += ay; }
      const bt = i => gp.buttons[i] && gp.buttons[i].pressed;
      if (bt(14)) dx -= 1; if (bt(15)) dx += 1; if (bt(12)) dy -= 1; if (bt(13)) dy += 1;
      if (bt(0)) a = true;               // A / Croix
      if (bt(1) || bt(3)) b = true;      // B / Rond (et Y / Triangle)
      if (bt(2)) r = true;               // X / Carré : roulade
      if (bt(4) || bt(5)) cycle = true;  // LB / RB : changer d'outil
      if (bt(9) || bt(8)) start = true;  // Start / Options
      if (bt(0) || bt(1) || bt(9) || Math.hypot(ax, ay) > 0.5) this.padVisible = false;
    }

    // pad virtuel
    if (this.stick.active) { dx += this.stick.x; dy += this.stick.y; }
    for (const t of this.touches.values()) { if (t.role === 'a') a = true; if (t.role === 'b') b = true; if (t.role === 'r') r = true; if (t.role === 'start') start = true; }
    for (const q of this.tapRoles) { if (q === 'a') a = true; if (q === 'b') b = true; if (q === 'r') r = true; if (q === 'cycle') cycle = true; if (q === 'start') start = true; }
    this.tapRoles.clear();

    const m = Math.hypot(dx, dy);
    if (m > 1) { dx /= m; dy /= m; }
    this.dx = dx; this.dy = dy;
    Object.assign(this.held, { a, b, r, cycle, start, up: dy < -0.5, down: dy > 0.5, left: dx < -0.5, right: dx > 0.5 });
    if (this.toast.t > 0) this.toast.t -= 1 / 60;
  },

  anyPressed() { return this.pressed('a') || this.pressed('start'); },
};

// ---------- clavier ----------
window.addEventListener('keydown', e => {
  audioUnlock();
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(e.code)) e.preventDefault();
  Input.keys.add(e.code); Input.taps.add(e.code); Input.padVisible = false;
});
window.addEventListener('keyup', e => Input.keys.delete(e.code));
window.addEventListener('blur', () => { Input.keys.clear(); Input.touches.clear(); stickEnd(); });

// ---------- manette ----------
window.addEventListener('gamepadconnected', e => {
  Input.gamepadName = e.gamepad.id; Input.padVisible = false;
  Input.toast = { msg: 'Manette connectée', t: 2.5 };
});
window.addEventListener('gamepaddisconnected', () => { Input.toast = { msg: 'Manette déconnectée', t: 2.5 }; });

// ---------- tactile ----------
function toInternal(cx, cy) {
  const r = cv.getBoundingClientRect();
  return { x: (cx - r.left) / r.width * W, y: (cy - r.top) / r.height * H };
}
// stick analogique flottant : sa base se pose sous le pouce, le bouton suit le doigt
function stickStart(p) {
  const S = Input.stick;
  S.bx = clamp(p.x, PAD.r + 6, W * 0.45 - PAD.r * 0.5); S.by = clamp(p.y, PAD.r + 20, H - PAD.r - 6);
  S.active = true; stickFrom(p);
}
function stickFrom(p) {
  const S = Input.stick, vx = p.x - S.bx, vy = p.y - S.by, len = Math.hypot(vx, vy), R = PAD.r;
  const k = len > R ? R / len : 1;
  S.kx = S.bx + vx * k; S.ky = S.by + vy * k;
  const m = Math.min(1, len / R), dead = 0.18;
  if (m < dead) { S.x = 0; S.y = 0; return; }
  const out = (m - dead) / (1 - dead) * 0.65 + 0.35; // petite poussée = marche lente, à fond = vitesse max
  S.x = vx / len * out; S.y = vy / len * out;
}
function stickEnd() { const S = Input.stick; S.active = false; S.x = 0; S.y = 0; S.bx = S.kx = PAD.x; S.by = S.ky = PAD.y; }
function roleFor(p) {
  if (dist(p.x, p.y, BTN.start.x, BTN.start.y) < BTN.start.r + 8) return 'start';
  if (p.x < 30 && p.y > 16 && p.y < 44 && G.view === 'world') return 'cycle'; // toucher la case B : outil suivant
  if (hasRoll() && dist(p.x, p.y, BTN.r.x, BTN.r.y) < BTN.r.r + 6) return 'r';
  if (p.x < W * 0.45) return 'pad';
  const da = dist(p.x, p.y, BTN.a.x, BTN.a.y), db = dist(p.x, p.y, BTN.b.x, BTN.b.y);
  if (db < BTN.b.r * 1.6 && db < da) return 'b';
  return 'a';
}
cv.addEventListener('touchstart', e => {
  e.preventDefault(); audioUnlock(); Input.padVisible = true;
  for (const t of e.changedTouches) {
    const p = toInternal(t.clientX, t.clientY), role = roleFor(p);
    Input.touches.set(t.identifier, { role, x: p.x, y: p.y }); Input.lastTap = { x: p.x, y: p.y, time: performance.now() };
    const closeX = G.state === 'pause' && p.x > W - 34 && p.y < 32; // croix de fermeture du menu
    if (role !== 'pad' && !closeX && !['title', 'slots', 'heroes'].includes(G.state)) Input.tapRoles.add(role);
    if (role === 'pad') stickStart(p);
  }
}, { passive: false });
cv.addEventListener('touchmove', e => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    const s = Input.touches.get(t.identifier); if (!s) continue;
    const p = toInternal(t.clientX, t.clientY); s.x = p.x; s.y = p.y;
    if (s.role === 'pad') stickFrom(p);
  }
}, { passive: false });
function endTouch(e) {
  e.preventDefault();
  for (const t of e.changedTouches) {
    const s = Input.touches.get(t.identifier);
    if (s && s.role === 'pad') stickEnd();
    Input.touches.delete(t.identifier);
  }
}
cv.addEventListener('touchend', endTouch, { passive: false });
cv.addEventListener('touchcancel', endTouch, { passive: false });
// souris (ordinateur) : un clic = A, utile pour les menus
cv.addEventListener('mousedown', e => {
  audioUnlock();
  const p = toInternal(e.clientX, e.clientY);
  if (G.state === 'pause') { Input.lastTap = { x: p.x, y: p.y, time: performance.now() }; if (p.x > W - 34 && p.y < 32) return; } // croix de fermeture
  Input.keys.add('Enter'); Input.taps.add('Enter');
});
window.addEventListener('mouseup', () => Input.keys.delete('Enter'));

// ---------- rendu du pad virtuel ----------
function drawVirtualPad() {
  if (!Input.padVisible) return;
  const S = Input.stick;
  ctx.save();
  // stick rond : socle + bouton qui suit le doigt
  ctx.globalAlpha = S.active ? 0.6 : 0.4;
  ell(S.bx, S.by, PAD.r + 4, PAD.r + 4, 'rgba(7,13,31,.55)');
  ctx.strokeStyle = S.active ? PAL.glow : '#c8d2f0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(S.bx, S.by, PAD.r, 0, 7); ctx.stroke();
  ctx.globalAlpha = S.active ? 0.25 : 0.12; ctx.strokeStyle = '#c8d2f0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(S.bx, S.by, PAD.r * 0.55, 0, 7); ctx.stroke();
  ctx.globalAlpha = S.active ? 0.85 : 0.55;
  ell(S.kx, S.ky + 2, 17, 17, 'rgba(7,13,31,.6)');
  ell(S.kx, S.ky, 17, 17, S.active ? '#d8f8f4' : '#c8d2f0');
  ell(S.kx - 3, S.ky - 3, 10, 10, S.active ? '#ffffff' : '#e2e8f8');
  ctx.globalAlpha = 1;
  // boutons
  for (const key of hasRoll() ? ['a', 'b', 'r'] : ['a', 'b']) {
    const bt = BTN[key], on = Input.held[key];
    ctx.globalAlpha = 0.55; ell(bt.x, bt.y + 2, bt.r, bt.r, 'rgba(7,13,31,.6)');
    ell(bt.x, bt.y + (on ? 1 : 0), bt.r, bt.r, on ? PAL.glow : (key === 'a' ? '#ff8a9a' : key === 'b' ? '#c3b3ff' : '#ffcf7a'));
    ctx.globalAlpha = 0.9; text(bt.label, bt.x, bt.y - (key === 'a' ? 6 : 5) + (on ? 1 : 0), { size: key === 'a' ? 12 : 10, align: 'center', color: PAL.ink, shadow: false, bold: true });
  }
  // pause
  ctx.globalAlpha = 0.6; ell(BTN.start.x, BTN.start.y, BTN.start.r, BTN.start.r, 'rgba(7,13,31,.6)');
  R(BTN.start.x - 4, BTN.start.y - 5, 3, 10, PAL.white); R(BTN.start.x + 1, BTN.start.y - 5, 3, 10, PAL.white);
  ctx.restore();
}
