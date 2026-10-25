'use strict';
// Entrées unifiées : clavier + manette (Gamepad API) + pad virtuel tactile.
// Le jeu ne lit que Input.dx / Input.dy (-1..1) et Input.pressed('a'|'b'|'start'|'up'|'down').
const PAD = { x: 64, y: 204, r: 40 };
const BTN = {
  a: { x: 440, y: 212, r: 22, label: 'A' },
  b: { x: 394, y: 236, r: 16, label: 'B' },
  start: { x: 458, y: 20, r: 12, label: 'II' },
};

const Input = {
  dx: 0, dy: 0,
  held: { a: false, b: false, start: false, up: false, down: false, left: false, right: false },
  prev: {},
  padVisible: false,
  gamepadName: '',
  toast: { msg: '', t: 0 },
  keys: new Set(),
  taps: new Set(), // touches appuyées puis relâchées entre deux images : on ne les perd pas
  touches: new Map(), // id -> { role, x, y }
  tapRoles: new Set(),
  lastTap: null,
  stick: { x: 0, y: 0, active: false },

  pressed(k) { return this.held[k] && !this.prev[k]; },

  update() {
    this.prev = Object.assign({}, this.held);
    let dx = 0, dy = 0, a = false, b = false, start = false;
    const k = new Set([...this.keys, ...this.taps]); this.taps.clear();
    // clavier (e.code = touches physiques : marche en AZERTY comme en QWERTY)
    if (k.has('ArrowLeft') || k.has('KeyA')) dx -= 1;
    if (k.has('ArrowRight') || k.has('KeyD')) dx += 1;
    if (k.has('ArrowUp') || k.has('KeyW')) dy -= 1;
    if (k.has('ArrowDown') || k.has('KeyS')) dy += 1;
    if (k.has('Space') || k.has('KeyJ') || k.has('KeyX') || k.has('Enter')) a = true;
    if (k.has('KeyK') || k.has('KeyC') || k.has('ShiftLeft')) b = true;
    if (k.has('Escape') || k.has('KeyP')) start = true;

    // manette
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of pads) {
      if (!gp || !gp.connected) continue;
      const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      if (Math.hypot(ax, ay) > 0.3) { dx += ax; dy += ay; }
      const bt = i => gp.buttons[i] && gp.buttons[i].pressed;
      if (bt(14)) dx -= 1; if (bt(15)) dx += 1; if (bt(12)) dy -= 1; if (bt(13)) dy += 1;
      if (bt(0) || bt(2)) a = true;      // A / Croix (et X / Carré)
      if (bt(1) || bt(3)) b = true;      // B / Rond (et Y / Triangle)
      if (bt(9) || bt(8)) start = true;  // Start / Options
      if (bt(0) || bt(1) || bt(9) || Math.hypot(ax, ay) > 0.5) this.padVisible = false;
    }

    // pad virtuel
    if (this.stick.active) { dx += this.stick.x; dy += this.stick.y; }
    for (const t of this.touches.values()) { if (t.role === 'a') a = true; if (t.role === 'b') b = true; if (t.role === 'start') start = true; }
    for (const r of this.tapRoles) { if (r === 'a') a = true; if (r === 'b') b = true; if (r === 'start') start = true; }
    this.tapRoles.clear();

    const m = Math.hypot(dx, dy);
    if (m > 1) { dx /= m; dy /= m; }
    this.dx = dx; this.dy = dy;
    Object.assign(this.held, { a, b, start, up: dy < -0.5, down: dy > 0.5, left: dx < -0.5, right: dx > 0.5 });
    if (this.toast.t > 0) this.toast.t -= 1 / 60;
  },

  anyPressed() { return this.pressed('a') || this.pressed('start'); },
};

// ---------- clavier ----------
window.addEventListener('keydown', e => {
  audioUnlock();
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  Input.keys.add(e.code); Input.taps.add(e.code); Input.padVisible = false;
});
window.addEventListener('keyup', e => Input.keys.delete(e.code));
window.addEventListener('blur', () => { Input.keys.clear(); Input.touches.clear(); Input.stick.active = false; });

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
function stickFrom(p) {
  const vx = p.x - PAD.x, vy = p.y - PAD.y, len = Math.hypot(vx, vy);
  if (len < 7) { Input.stick.x = 0; Input.stick.y = 0; return; }
  // 8 directions, comme une vraie croix directionnelle
  const ang = Math.round(Math.atan2(vy, vx) / (Math.PI / 4)) * (Math.PI / 4);
  Input.stick.x = Math.round(Math.cos(ang) * 100) / 100; Input.stick.y = Math.round(Math.sin(ang) * 100) / 100;
}
function roleFor(p) {
  if (dist(p.x, p.y, BTN.start.x, BTN.start.y) < BTN.start.r + 8) return 'start';
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
    if (role !== 'pad' && G.state !== 'title') Input.tapRoles.add(role);
    if (role === 'pad') { Input.stick.active = true; stickFrom(p); }
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
    if (s && s.role === 'pad') { Input.stick.active = false; Input.stick.x = 0; Input.stick.y = 0; }
    Input.touches.delete(t.identifier);
  }
}
cv.addEventListener('touchend', endTouch, { passive: false });
cv.addEventListener('touchcancel', endTouch, { passive: false });
// souris (ordinateur) : un clic = A, utile pour les menus
cv.addEventListener('mousedown', () => { audioUnlock(); Input.keys.add('Enter'); Input.taps.add('Enter'); });
window.addEventListener('mouseup', () => Input.keys.delete('Enter'));

// ---------- rendu du pad virtuel ----------
function drawVirtualPad() {
  if (!Input.padVisible) return;
  const sx = Input.stick.x, sy = Input.stick.y;
  ctx.save(); ctx.globalAlpha = 0.55;
  // croix directionnelle
  const arm = 13, len = 36;
  const arms = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  ell(PAD.x, PAD.y, PAD.r + 4, PAD.r + 4, 'rgba(7,13,31,.45)');
  for (const [ax, ay] of arms) {
    const on = (ax && Math.sign(sx) === ax) || (ay && Math.sign(sy) === ay);
    const x = ax ? (ax < 0 ? PAD.x - len : PAD.x) : PAD.x - arm / 2, y = ay ? (ay < 0 ? PAD.y - len : PAD.y) : PAD.y - arm / 2;
    const w = ax ? len : arm, h = ay ? len : arm;
    R(x, y, w, h, on ? PAL.glow : '#c8d2f0');
    R(x, y + h - 2, w, 2, 'rgba(0,0,0,.25)');
  }
  R(PAD.x - arm / 2, PAD.y - arm / 2, arm, arm, '#c8d2f0');
  // petits triangles
  ctx.globalAlpha = 0.8; ctx.fillStyle = PAL.deep;
  const tri = (x, y, r) => { ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(3, 2); ctx.lineTo(-3, 2); ctx.fill(); ctx.restore(); };
  tri(PAD.x, PAD.y - 26, 0); tri(PAD.x, PAD.y + 26, Math.PI); tri(PAD.x - 26, PAD.y, -Math.PI / 2); tri(PAD.x + 26, PAD.y, Math.PI / 2);
  // boutons
  for (const key of ['a', 'b']) {
    const bt = BTN[key], on = Input.held[key];
    ctx.globalAlpha = 0.55; ell(bt.x, bt.y + 2, bt.r, bt.r, 'rgba(7,13,31,.6)');
    ell(bt.x, bt.y + (on ? 1 : 0), bt.r, bt.r, on ? PAL.glow : (key === 'a' ? '#ff8a9a' : '#c3b3ff'));
    ctx.globalAlpha = 0.9; text(bt.label, bt.x, bt.y - 6 + (on ? 1 : 0), { size: key === 'a' ? 12 : 10, align: 'center', color: PAL.ink, shadow: false, bold: true });
  }
  // pause
  ctx.globalAlpha = 0.6; ell(BTN.start.x, BTN.start.y, BTN.start.r, BTN.start.r, 'rgba(7,13,31,.6)');
  R(BTN.start.x - 4, BTN.start.y - 5, 3, 10, PAL.white); R(BTN.start.x + 1, BTN.start.y - 5, 3, 10, PAL.white);
  ctx.restore();
}
