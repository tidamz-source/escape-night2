'use strict';
// ---------- zones de jeu ----------
class Area {
  constructor(id, grid, theme) {
    this.id = id; this.g = grid; this.theme = theme;
    this.cols = grid[0].length; this.rows = grid.length;
    this.w = this.cols * TS; this.h = this.rows * TS;
    this.layer = renderLayer(grid, theme);
    this.props = []; this.ents = [];
  }
  tile(tx, ty) { if (tx < 0 || ty < 0 || tx >= this.cols || ty >= this.rows) return this.theme === 'forest' ? 'W' : '#'; return this.g[ty][tx]; }
  tileAt(x, y) { return this.tile(Math.floor(x / TS), Math.floor(y / TS)); }
  addProp(k, x, y, o = {}) {
    const im = IMG[k], iw = im ? im.width / 2 : 16, ih = im ? im.height / 2 : 16;
    const fw = o.fw != null ? o.fw : iw * 0.6, fh = o.fh != null ? o.fh : 6;
    const p = { k, x, y, iw, ih, fw, fh, solid: o.solid !== false, light: o.light, interact: o.interact, isProp: true };
    this.props.push(p); return p;
  }
}
const boxOf = e => ({ x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h });

function blocked(area, b, self, opts = {}) {
  const x0 = Math.floor(b.x / TS), x1 = Math.floor((b.x + b.w - 0.01) / TS), y0 = Math.floor(b.y / TS), y1 = Math.floor((b.y + b.h - 0.01) / TS);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const t = area.tile(tx, ty);
    if (SOLID.has(t)) return true;
    if (opts.noExit && (t === 'F' || t === 'E')) return true;
  }
  for (const p of area.props) if (p.solid && rectHit(b, { x: p.x - p.fw / 2, y: p.y - p.fh, w: p.fw, h: p.fh })) return true;
  for (const e of area.ents) if (e !== self && e.solid && !e.dead && rectHit(b, boxOf(e))) return true;
  return false;
}
// déplacement par axe avec "glissement" dans les coins (comme ALttP)
function moveEnt(area, e, dx, dy, opts = {}) {
  let hit = false;
  if (dx) {
    e.x += dx;
    if (blocked(area, boxOf(e), e, opts)) {
      e.x -= dx; hit = true;
      if (opts.slide && !dy) for (const o of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]) {
        const t = { x: e.x + dx - e.w / 2, y: e.y + o - e.h, w: e.w, h: e.h };
        if (!blocked(area, t, e, opts)) { e.y += Math.sign(o) * Math.min(Math.abs(dx), 1); break; }
      }
    }
  }
  if (dy) {
    e.y += dy;
    if (blocked(area, boxOf(e), e, opts)) {
      e.y -= dy; hit = true;
      if (opts.slide && !dx) for (const o of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]) {
        const t = { x: e.x + o - e.w / 2, y: e.y + dy - e.h, w: e.w, h: e.h };
        if (!blocked(area, t, e, opts)) { e.x += Math.sign(o) * Math.min(Math.abs(dy), 1); break; }
      }
    }
  }
  return hit;
}

// ---------- particules ----------
class Parts {
  constructor() { this.a = []; }
  add(p) { this.a.push(Object.assign({ vx: 0, vy: 0, g: 0, life: 0.6, t: 0, r: 1, c: '#fff', drag: 0 }, p)); }
  burst(x, y, n, o) { for (let i = 0; i < n; i++) { const a = rand(0, 6.28), s = rand(o.smin || 20, o.smax || 70); this.add(Object.assign({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (o.up || 0) }, o, { c: Array.isArray(o.c) ? pick(o.c) : o.c, life: rand(o.life * 0.6, o.life) })); } }
  update(dt) { for (const p of this.a) { p.t += dt; p.vy += p.g * dt; p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt; p.x += p.vx * dt; p.y += p.vy * dt; } this.a = this.a.filter(p => p.t < p.life); }
  draw() { for (const p of this.a) { const k = 1 - p.t / p.life; ctx.globalAlpha = p.fade === false ? 1 : clamp(k * 1.5, 0, 1); const s = p.r * (p.shrink ? k : 1); R(half(p.x - s / 2), half(p.y - s / 2), Math.max(0.5, half(s)), Math.max(0.5, half(s)), p.c); } ctx.globalAlpha = 1; }
}

// ---------- Sacha ----------
const DIRS = ['down', 'up', 'left', 'right'];
const DV = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
function drawSacha(x, y, dir, col, alpha = 1) {
  const im = IMG.sacha; if (!im) { R(x - 6, y - 20, 12, 20, '#eee'); return; }
  const row = DIRS.indexOf(dir), fw = 38, fh = 79;
  ctx.globalAlpha = alpha;
  ctx.drawImage(im, col * fw, row * fh, fw, fh, half(x - fw / 4), half(y - fh / 2 + 1), fw / 2, fh / 2);
  ctx.globalAlpha = 1;
}

const ATK_TIME = 0.24;
class Player {
  constructor(x, y, dir = 'down') {
    this.x = x; this.y = y; this.w = 10; this.h = 6; this.dir = dir;
    this.anim = 0; this.moving = false; this.atk = 0; this.atkHit = new Set();
    this.inv = 0; this.kb = { x: 0, y: 0, t: 0 }; this.hp = SAVE.maxHp; this.bump = 0;
  }
  body() { return { x: this.x - 6, y: this.y - 18, w: 12, h: 18 }; }
  atkBox() {
    const x = this.x, y = this.y;
    switch (this.dir) {
      case 'down': return { x: x - 13, y: y - 4, w: 26, h: 20 };
      case 'up': return { x: x - 13, y: y - 38, w: 26, h: 22 };
      case 'left': return { x: x - 28, y: y - 24, w: 24, h: 26 };
      default: return { x: x + 4, y: y - 24, w: 24, h: 26 };
    }
  }
  frontBox() { const [vx, vy] = DV[this.dir]; return { x: this.x - 5 + vx * 10, y: this.y - 8 + vy * 10, w: 10, h: 10 }; }
  hurt(dmg, fx, fy, G) {
    if (this.inv > 0 || G.state !== 'play') return;
    this.hp -= dmg; this.inv = 1.1; SFX.hurt(); G.shake = 0.25; G.hitstop = 0.06;
    const a = Math.atan2(this.y - 8 - fy, this.x - fx); this.kb = { x: Math.cos(a) * 170, y: Math.sin(a) * 170, t: 0.16 };
    this.atk = 0;
    if (this.hp <= 0) { this.hp = 0; G.gameOver(); }
  }
  update(dt, G) {
    const area = G.area;
    if (this.inv > 0) this.inv -= dt;
    if (this.bump > 0) this.bump -= dt;
    if (this.kb.t > 0) { this.kb.t -= dt; moveEnt(area, this, this.kb.x * dt, 0, { noExit: true }); moveEnt(area, this, 0, this.kb.y * dt, { noExit: true }); return; }
    if (this.atk > 0) {
      this.atk -= dt;
      if (this.atk < ATK_TIME - 0.04) G.attackHits(this);
      return;
    }
    // interaction ou attaque
    if (Input.pressed('a')) {
      const target = G.interactTarget(this);
      if (target) { target.interact(G, this); return; }
      this.atk = ATK_TIME; this.atkHit.clear(); SFX.swing(); return;
    }
    let dx = Input.dx, dy = Input.dy;
    this.moving = Math.hypot(dx, dy) > 0.2;
    if (this.moving) {
      // direction : on garde l'orientation courante en diagonale (comme ALttP)
      const want = Math.abs(dx) > Math.abs(dy) + 0.01 ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
      const cur = DV[this.dir], keep = (cur[0] && Math.sign(dx) === cur[0] && Math.abs(dx) > 0.3) || (cur[1] && Math.sign(dy) === cur[1] && Math.abs(dy) > 0.3);
      if (!keep) this.dir = want;
      const sp = 76;
      const hx = moveEnt(area, this, dx * sp * dt, 0, { slide: !dy || Math.abs(dy) < 0.2 });
      const hy = moveEnt(area, this, 0, dy * sp * dt, { slide: !dx || Math.abs(dx) < 0.2 });
      this.anim += dt;
      if ((hx || hy) && this.bump <= 0) G.bumped(this);
    } else this.anim = 0;
  }
  draw() {
    if (this.inv > 0 && Math.floor(this.inv * 20) % 2) return;
    ell(this.x, this.y, 6, 2.5, 'rgba(0,0,0,.35)');
    const attacking = this.atk > 0;
    const col = attacking ? 0 : (this.moving ? 1 + Math.floor(this.anim * 14) % 8 : 0);
    const [vx, vy] = DV[this.dir], lunge = attacking ? 1.5 : 0;
    const p = attacking ? 1 - this.atk / ATK_TIME : 0;
    if (attacking && this.dir === 'up') this.drawBranch(p);
    drawSacha(this.x + vx * lunge, this.y + vy * lunge, this.dir, col);
    if (attacking && this.dir !== 'up') this.drawBranch(p);
  }
  drawBranch(p) {
    // la branche balaie un arc de 130° devant Sacha
    const base = { down: Math.PI / 2, up: -Math.PI / 2, left: Math.PI, right: 0 }[this.dir];
    const sweep = this.dir === 'left' ? -1 : 1;
    const ang = base + sweep * lerp(-1.15, 1.15, Math.min(1, p * 1.6));
    const hx = this.x + (this.dir === 'left' ? -4 : this.dir === 'right' ? 4 : 0), hy = this.y - (this.dir === 'up' ? 18 : 13);
    const L = 17, ex = hx + Math.cos(ang) * L, ey = hy + Math.sin(ang) * L;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#3a2214'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.strokeStyle = '#8a5a34'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.strokeStyle = '#b07a48'; ctx.lineWidth = 0.75; ctx.beginPath(); ctx.moveTo(hx, hy - 0.5); ctx.lineTo(ex, ey - 0.5); ctx.stroke();
    // feuilles au bout
    const lx = hx + Math.cos(ang) * (L - 3), ly = hy + Math.sin(ang) * (L - 3);
    R(half(lx - 1), half(ly - 2), 2.5, 2, '#4f9a5a'); R(half(ex - 1), half(ey - 1), 2, 2, '#6fc070');
    // trainée
    if (p < 0.75) { ctx.globalAlpha = 0.35 * (1 - p); ctx.strokeStyle = PAL.glow; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(hx, hy, L, ang - sweep * 0.9, ang, sweep < 0); ctx.stroke(); ctx.globalAlpha = 1; }
  }
}

// ---------- ennemis ----------
class Enemy {
  constructor(x, y, o) { this.x = this.sx = x; this.y = this.sy = y; this.w = 12; this.h = 8; this.hp = this.maxHp = o.hp; this.dmg = o.dmg; this.kb = { x: 0, y: 0, t: 0 }; this.flash = 0; this.t = rand(0, 5); this.room = o.room; this.dead = false; this.vx = 0; this.vy = 0; this.face = 1; }
  body() { return { x: this.x - this.w / 2, y: this.y - this.h - 6, w: this.w, h: this.h + 6 }; }
  reset() { this.x = this.sx; this.y = this.sy; this.hp = this.maxHp; this.kb.t = 0; this.flash = 0; }
  hit(dmg, fx, fy, G) {
    this.hp -= dmg; this.flash = 0.18; SFX.hit(); G.hitstop = 0.05; G.shake = 0.08;
    const a = Math.atan2(this.y - fy, this.x - fx); this.kb = { x: Math.cos(a) * 190, y: Math.sin(a) * 190, t: 0.14 };
    G.parts.burst(this.x, this.y - 8, 5, { c: ['#fff', PAL.glow], life: 0.25, smin: 30, smax: 90, r: 1 });
    if (this.hp <= 0) this.die(G);
  }
  die(G) {
    this.dead = true; SFX.kill();
    G.parts.burst(this.x, this.y - 6, 16, { c: this.poof || ['#c3b3ff', '#8ff3ea', '#fff'], life: 0.5, smin: 15, smax: 60, r: 2, shrink: true, drag: 3 });
    if (Math.random() < 0.35) G.area.ents.push(new HeartPickup(this.x, this.y));
  }
  physics(dt, G, fly) {
    if (this.flash > 0) this.flash -= dt;
    if (this.kb.t > 0) { this.kb.t -= dt; if (fly) { this.x += this.kb.x * dt; this.y += this.kb.y * dt; this.clampArea(G); } else { moveEnt(G.area, this, this.kb.x * dt, 0, { noExit: true }); moveEnt(G.area, this, 0, this.kb.y * dt, { noExit: true }); } return true; }
    return false;
  }
  clampArea(G) { const r = G.roomRect(); this.x = clamp(this.x, r.x + 20, r.x + r.w - 20); this.y = clamp(this.y, r.y + 24, r.y + r.h - 16); }
  touch(G) { const P = G.player; if (rectHit(this.body(), P.body())) P.hurt(this.dmg, this.x, this.y - 6, G); }
}

class Raccoon extends Enemy {
  constructor(x, y, room) { super(x, y, { hp: 2, dmg: 1, room }); this.state = 'wander'; this.st = rand(0.5, 2); this.poof = ['#7a7f8c', '#c8ccd6', '#3a3d48']; }
  update(dt, G) {
    if (this.physics(dt, G)) return;
    this.t += dt; this.st -= dt; const P = G.player, d = dist(this.x, this.y, P.x, P.y);
    if (this.state === 'wander') {
      if (this.st <= 0) { const a = rand(0, 6.28), s = Math.random() < 0.3 ? 0 : 28; this.vx = Math.cos(a) * s; this.vy = Math.sin(a) * s; this.st = rand(0.8, 2); }
      if (d < 80) { this.state = 'warn'; this.st = 0.45; this.vx = this.vy = 0; }
    } else if (this.state === 'warn') {
      if (this.st <= 0) { const a = Math.atan2(P.y - this.y, P.x - this.x); this.vx = Math.cos(a) * 110; this.vy = Math.sin(a) * 110; this.state = 'charge'; this.st = 0.7; }
    } else if (this.state === 'charge') {
      if (this.st <= 0) { this.state = 'rest'; this.st = 1.1; this.vx = this.vy = 0; }
    } else if (this.st <= 0) { this.state = 'wander'; this.st = 0; }
    if (this.vx) this.face = Math.sign(this.vx);
    const h1 = moveEnt(G.area, this, this.vx * dt, 0, { noExit: true }), h2 = moveEnt(G.area, this, 0, this.vy * dt, { noExit: true });
    if ((h1 || h2) && this.state === 'wander') this.st = 0;
    if ((h1 || h2) && this.state === 'charge') { this.state = 'rest'; this.st = 0.9; this.vx = this.vy = 0; }
    this.touch(G);
  }
  draw() {
    ell(this.x, this.y, 8, 2.5, 'rgba(0,0,0,.35)');
    const moving = this.vx || this.vy, f = moving ? Math.floor(this.t * (this.state === 'charge' ? 16 : 8)) % 2 : 0, wb = this.state === 'warn' ? Math.sin(this.t * 60) * 0.5 : 0;
    const fl = this.flash > 0;
    hi(this.x + wb, this.y, this.face < 0, () => {
      const g = fl ? '#fff' : '#7a7f8c', gd = fl ? '#fff' : '#5a5e6a', gl = fl ? '#fff' : '#b8bcc8';
      // queue rayée
      D(10, -16, 6, 5, g); D(14, -18, 6, 5, '#2a2c34'); D(18, -20, 5, 5, g); D(21, -22, 4, 4, '#2a2c34');
      // corps
      D(-12, -18, 24, 12, g); D(-10, -20, 18, 3, gd); D(-10, -8, 18, 3, gl);
      // pattes
      D(-10, -6, 4, 6 - f * 2, '#2a2c34'); D(6, -6, 4, 4 + f * 2, '#2a2c34'); D(-4, -6, 3, 4 + f * 2, '#3a3d48'); D(2, -6, 3, 6 - f * 2, '#3a3d48');
      // tête
      D(-22, -24, 14, 13, g); D(-24, -16, 5, 5, gl); D(-26, -14, 3, 3, '#1a1a1a');
      D(-21, -28, 4, 5, gd); D(-12, -28, 4, 5, gd); D(-20, -27, 2, 2, '#e8a0a0');
      D(-23, -20, 15, 4, '#1a1a22'); // masque
      D(-20, -19, 3, 2, this.state === 'warn' || this.state === 'charge' ? '#ff5a5a' : '#fff');
      D(-13, -19, 3, 2, this.state === 'warn' || this.state === 'charge' ? '#ff5a5a' : '#fff');
      D(-22, -23, 13, 2, gl);
    });
    if (this.state === 'warn') text('!', this.x, this.y - 30, { size: 10, align: 'center', color: PAL.warm, bold: true });
  }
}

class Bat extends Enemy {
  constructor(x, y, room) { super(x, y, { hp: 1, dmg: 1, room }); this.w = 10; this.h = 6; this.state = 'idle'; this.st = rand(0, 1); this.alt = 14; this.poof = ['#3a2a4a', '#8a6aaa', '#fff']; }
  body() { return { x: this.x - 6, y: this.y - this.alt - 6, w: 12, h: 10 }; }
  update(dt, G) {
    if (this.physics(dt, G, true)) return;
    this.t += dt; this.st -= dt; const P = G.player, d = dist(this.x, this.y, P.x, P.y);
    if (this.state === 'idle') {
      this.x = this.sx + Math.sin(this.t * 1.3) * 18; this.y = this.sy + Math.sin(this.t * 2.1) * 8;
      if (d < 95 && this.st <= 0) { this.state = 'swoop'; this.st = 1.5; }
    } else if (this.state === 'swoop') {
      const a = Math.atan2(P.y - this.y, P.x - this.x); this.vx = lerp(this.vx, Math.cos(a) * 85, dt * 3); this.vy = lerp(this.vy, Math.sin(a) * 85, dt * 3);
      this.x += (this.vx + Math.cos(this.t * 9) * 30) * dt; this.y += (this.vy + Math.sin(this.t * 7) * 30) * dt;
      if (this.st <= 0) { this.state = 'back'; this.st = 1.6; }
    } else {
      const a = Math.atan2(this.sy - this.y, this.sx - this.x); this.x += Math.cos(a) * 55 * dt; this.y += Math.sin(a) * 55 * dt;
      if (this.st <= 0 || dist(this.x, this.y, this.sx, this.sy) < 6) { this.state = 'idle'; this.st = 1.2; this.t = 0; this.sx = this.x; this.sy = this.y; }
    }
    this.face = (this.vx || 1) < 0 ? -1 : 1;
    this.clampArea(G); this.touch(G);
  }
  draw() {
    ell(this.x, this.y, 5, 1.8, 'rgba(0,0,0,.3)');
    const f = Math.floor(this.t * 14) % 2, fl = this.flash > 0, b = fl ? '#fff' : '#3a2a4a', wc = fl ? '#fff' : '#2a1d38', wl = fl ? '#fff' : '#4a3a5e';
    hi(this.x, this.y - this.alt + Math.sin(this.t * 10), false, () => {
      if (f) { D(-22, -6, 14, 4, wc); D(-24, -4, 4, 6, wc); D(8, -6, 14, 4, wc); D(20, -4, 4, 6, wc); D(-18, -2, 3, 3, wl); D(15, -2, 3, 3, wl); }
      else { D(-20, -14, 12, 4, wc); D(-24, -18, 6, 6, wc); D(8, -14, 12, 4, wc); D(18, -18, 6, 6, wc); D(-16, -10, 8, 3, wl); D(8, -10, 8, 3, wl); }
      D(-8, -10, 16, 12, b); D(-6, -14, 4, 5, b); D(2, -14, 4, 5, b);
      D(-5, -6, 3, 2, '#ff5a6a'); D(2, -6, 3, 2, '#ff5a6a'); D(-2, -1, 1, 2, '#fff'); D(1, -1, 1, 2, '#fff');
    });
  }
}

class Shadow extends Enemy {
  constructor(x, y, room) { super(x, y, { hp: 3, dmg: 2, room }); this.w = 14; this.h = 8; this.st = 0; this.poof = ['#1a1030', '#4a2a7a', '#c3b3ff', '#000']; }
  update(dt, G) {
    if (this.physics(dt, G)) return;
    this.t += dt; this.st -= dt; const P = G.player, d = dist(this.x, this.y, P.x, P.y);
    let sp = 0;
    if (d < 130) { const a = Math.atan2(P.y - this.y, P.x - this.x); this.vx = Math.cos(a); this.vy = Math.sin(a); sp = 34 + 18 * Math.max(0, Math.sin(this.t * 5)); }
    else { if (this.st <= 0) { const a = rand(0, 6.28); this.vx = Math.cos(a); this.vy = Math.sin(a); this.st = rand(1, 2); } sp = 16; }
    moveEnt(G.area, this, this.vx * sp * dt, 0, { noExit: true }); moveEnt(G.area, this, 0, this.vy * sp * dt, { noExit: true });
    this.touch(G);
  }
  draw() {
    const sq = Math.sin(this.t * 5), fl = this.flash > 0;
    ell(this.x, this.y, 9, 3, 'rgba(0,0,0,.45)');
    hi(this.x, this.y, this.vx < 0, () => {
      const w = 26 + Math.round(sq * 3), h = 24 - Math.round(sq * 3), c1 = fl ? '#fff' : '#120a22', c2 = fl ? '#fff' : '#2a1a48', c3 = fl ? '#fff' : '#3d2866';
      D(-w / 2, -h, w, h, c1); D(-w / 2 + 2, -h - 3, w - 4, 3, c1); D(-w / 2 + 5, -h - 5, w - 10, 2, c1);
      D(-w / 2 + 2, -h + 2, 4, h - 6, c2); D(-w / 2 + 4, -h - 2, 8, 2, c3);
      for (let i = 0; i < 4; i++) D(-w / 2 + i * (w / 4), -3 + ((Math.floor(this.t * 8) + i) % 2) * 2, w / 4 - 1, 3, c1);
      if (!fl) { D(-7, -h + 6, 5, 6, '#f4f7ff'); D(3, -h + 6, 5, 6, '#f4f7ff'); D(-5, -h + 8, 2, 3, '#ff3a6a'); D(5, -h + 8, 2, 3, '#ff3a6a'); D(-4, -h + 15, 9, 2, '#000'); D(-3, -h + 15, 2, 3, '#f4f7ff'); D(2, -h + 15, 2, 3, '#f4f7ff'); }
    });
  }
}

class Wisp extends Enemy {
  constructor(x, y, room) { super(x, y, { hp: 2, dmg: 1, room }); this.w = 10; this.h = 6; this.cd = rand(1.5, 2.5); this.alt = 12; this.light = { r: 46, c: 'rgba(120,220,255,' }; this.poof = ['#dff8ff', '#6fd3ff', '#2a8aff']; }
  body() { return { x: this.x - 6, y: this.y - this.alt - 8, w: 12, h: 12 }; }
  update(dt, G) {
    if (this.physics(dt, G, true)) return;
    this.t += dt; this.cd -= dt; const P = G.player, d = dist(this.x, this.y, P.x, P.y);
    const a = Math.atan2(P.y - this.y, P.x - this.x);
    let want = 0; if (d < 70) want = -40; else if (d > 110) want = 30;
    this.x += (Math.cos(a) * want + Math.cos(this.t * 1.7) * 22) * dt; this.y += (Math.sin(a) * want + Math.sin(this.t * 2.3) * 16) * dt;
    this.clampArea(G);
    if (this.cd <= 0 && d < 180) { this.cd = 2.3; SFX.shoot(); G.area.ents.push(new Orb(this.x, this.y - this.alt, a)); }
    this.touch(G);
  }
  draw() {
    ell(this.x, this.y, 4, 1.5, 'rgba(0,0,0,.3)');
    const y = this.y - this.alt + Math.sin(this.t * 3) * 2, fl = this.flash > 0, charge = this.cd < 0.5;
    ctx.globalAlpha = 0.35; ell(this.x, y - 2, 9 + Math.sin(this.t * 8), 9 + Math.sin(this.t * 8), '#6fd3ff'); ctx.globalAlpha = 1;
    hi(this.x, y, false, () => {
      const fx = Math.round(Math.sin(this.t * 12) * 2);
      D(-4 + fx, -22, 8, 6, fl ? '#fff' : '#6fd3ff'); D(-2 - fx, -26, 4, 5, fl ? '#fff' : '#9fe8ff'); D(-1 + fx, -29, 2, 3, '#dff8ff');
      D(-8, -16, 16, 14, fl ? '#fff' : '#6fd3ff'); D(-6, -14, 12, 10, charge ? '#ffffff' : '#bff0ff'); D(-4, -12, 8, 6, '#ffffff');
      D(-4, -11, 2, 3, '#14244c'); D(2, -11, 2, 3, '#14244c'); D(-1, -7, 3, 1, '#14244c');
    });
  }
}

class Orb {
  constructor(x, y, a) { this.x = x; this.y = y + 12; this.alt = 12; this.vx = Math.cos(a) * 88; this.vy = Math.sin(a) * 88; this.w = 6; this.h = 4; this.t = 0; this.light = { r: 22, c: 'rgba(120,220,255,' }; this.isOrb = true; }
  body() { return { x: this.x - 3, y: this.y - this.alt - 3, w: 6, h: 6 }; }
  update(dt, G) {
    this.t += dt; this.x += this.vx * dt; this.y += this.vy * dt;
    if (SOLID.has(G.area.tileAt(this.x, this.y - 2)) || this.t > 3) { this.dead = true; G.parts.burst(this.x, this.y - this.alt, 5, { c: ['#9fe8ff', '#fff'], life: 0.25, r: 1 }); return; }
    const P = G.player; if (rectHit(this.body(), P.body())) { P.hurt(1, this.x, this.y, G); this.dead = true; }
  }
  hit(d, fx, fy, G) { this.dead = true; G.parts.burst(this.x, this.y - this.alt, 6, { c: ['#9fe8ff', '#fff'], life: 0.3, r: 1 }); SFX.hit(); }
  draw() { const y = this.y - this.alt; ell(this.x, this.y, 2.5, 1, 'rgba(0,0,0,.3)'); ell(this.x, y, 3.5, 3.5, '#6fd3ff'); ell(this.x, y, 2, 2, '#fff'); }
}

// ---------- objets ----------
function drawHeartShape(x, y, s, c, dark) {
  hi(x, y, false, () => {
    const u = s; D(-4 * u, -3 * u, 3 * u, 2 * u, c); D(1 * u, -3 * u, 3 * u, 2 * u, c); D(-5 * u, -2 * u, 10 * u, 3 * u, c); D(-4 * u, 1 * u, 8 * u, 1 * u, c); D(-3 * u, 2 * u, 6 * u, 1 * u, c); D(-2 * u, 3 * u, 4 * u, 1 * u, c); D(-1 * u, 4 * u, 2 * u, 1 * u, c);
    D(-4 * u, -2 * u, 2 * u, 1 * u, '#ffd0d8'); if (dark) D(1 * u, 1 * u, 3 * u, 1 * u, dark);
  });
}
class HeartPickup {
  constructor(x, y) { this.x = x; this.y = y; this.t = 0; this.w = 8; this.h = 6; this.vy = -60; this.z = 0; }
  update(dt, G) {
    this.t += dt; if (this.z < 0 || this.vy < 0) { this.vy += 300 * dt; this.z += this.vy * dt; if (this.z > 0) { this.z = 0; this.vy = 0; } }
    if (this.t > 9) this.dead = true;
    const P = G.player; if (rectHit({ x: this.x - 5, y: this.y - 8, w: 10, h: 10 }, P.body())) { this.dead = true; P.hp = Math.min(SAVE.maxHp, P.hp + 2); SFX.pickup(); G.parts.burst(this.x, this.y - 4, 6, { c: ['#ff8ab0', '#fff'], life: 0.3, r: 1 }); }
  }
  draw() { if (this.t > 6.5 && Math.floor(this.t * 10) % 2) return; ell(this.x, this.y, 3, 1, 'rgba(0,0,0,.3)'); drawHeartShape(this.x, this.y - 5 + this.z + Math.sin(this.t * 4) * 0.8, 2, PAL.heart, '#c02848'); }
}

class Bush {
  constructor(x, y) { this.x = x; this.y = y; this.w = 16; this.h = 8; this.solid = true; }
  hit(d, fx, fy, G) {
    this.dead = true; SFX.cut();
    G.parts.burst(this.x, this.y - 6, 14, { c: ['#3a7a50', '#5aa060', '#2a5a3a', '#8ad080'], life: 0.6, smin: 20, smax: 70, up: 30, g: 120, r: 2, drag: 2 });
    if (Math.random() < 0.25) G.area.ents.push(new HeartPickup(this.x, this.y));
  }
  draw() { const im = IMG.bush; if (im) ctx.drawImage(im, half(this.x - im.width / 4), half(this.y - im.height / 2 + 2), im.width / 2, im.height / 2); }
}

class Chest {
  constructor(x, y) { this.x = x; this.y = y; this.w = 16; this.h = 8; this.solid = true; this.t = 0; this.light = { r: 26, c: 'rgba(255,207,122,' }; }
  get open() { return SAVE.chest; }
  canInteract() { return !this.open; }
  interact(G, P) {
    SAVE.chest = true; SAVE.keys += 1; persist(); SFX.chest(); this.light = null;
    G.raise('key', this.x, this.y - 14);
    G.say([{ text: 'Tu as trouvé une petite clé ! Elle doit ouvrir une porte de cette forêt.' }]);
  }
  update(dt) { this.t += dt; }
  draw() {
    ell(this.x, this.y, 10, 3, 'rgba(0,0,0,.4)');
    hi(this.x, this.y, false, () => {
      D(-15, -18, 30, 18, '#7a4a24'); D(-15, -18, 30, 2, '#a06a34'); D(-15, -2, 30, 2, '#4a2a14');
      D(-15, -18, 3, 18, '#c8a040'); D(12, -18, 3, 18, '#c8a040');
      if (!this.open) {
        D(-16, -30, 32, 13, '#8a5a2c'); D(-16, -30, 32, 3, '#b07a3c'); D(-16, -30, 3, 13, '#e0b850'); D(13, -30, 3, 13, '#e0b850'); D(-16, -19, 32, 2, '#5a3418');
        D(-4, -22, 8, 8, '#e0b850'); D(-2, -20, 4, 4, '#3a2410'); D(-1, -19, 2, 3, '#e0b850');
        if (Math.floor(this.t * 2) % 3 === 0) D(8, -28, 2, 2, '#fff');
      } else {
        D(-16, -34, 32, 10, '#5a3418'); D(-16, -34, 32, 2, '#8a5a2c'); D(-13, -24, 26, 6, '#1a0e08');
      }
    });
  }
}

class Door {
  constructor(x, y) { this.x = x; this.y = y; this.w = 32; this.h = 32; this.solid = true; this.t = 0; this.light = { r: 30, c: 'rgba(255,207,122,' }; }
  get dead() { return SAVE.door; }
  canInteract() { return true; }
  interact(G) { if (SAVE.keys > 0) this.unlock(G); else { SFX.locked(); G.say([{ text: 'Une grille en bois, fermée par un gros cadenas. Il faut une clé.' }]); } }
  unlock(G) {
    SAVE.keys -= 1; SAVE.door = true; persist(); SFX.door(); G.shake = 0.3;
    G.parts.burst(this.x, this.y - 16, 22, { c: ['#8a5a2c', '#5a3418', '#e0b850', '#fff'], life: 0.7, smin: 20, smax: 80, r: 2, g: 80 });
  }
  update(dt) { this.t += dt; }
  draw() {
    hi(this.x, this.y, false, () => {
      D(-32, -64, 64, 64, '#2a1810');
      for (let i = 0; i < 4; i++) { D(-30 + i * 15, -62, 13, 62, '#6a4224'); D(-30 + i * 15, -62, 2, 62, '#8a5a34'); D(-19 + i * 15, -62, 2, 62, '#3a2414'); }
      D(-32, -50, 64, 5, '#3a3d48'); D(-32, -18, 64, 5, '#3a3d48'); D(-32, -50, 64, 1, '#6a6e7a'); D(-32, -18, 64, 1, '#6a6e7a');
      const g = Math.sin(this.t * 3) > 0.6 ? '#ffe9a0' : '#e0b850';
      D(-8, -40, 16, 4, '#9a9aa8'); D(-8, -40, 4, 10, '#9a9aa8'); D(4, -40, 4, 10, '#9a9aa8');
      D(-11, -32, 22, 18, g); D(-11, -32, 22, 2, '#fff2c0'); D(-11, -16, 22, 2, '#a07a20'); D(-2, -27, 4, 5, '#3a2410'); D(-1, -23, 2, 4, '#3a2410');
    });
  }
}

class Sign {
  constructor(x, y, lines) { this.x = x; this.y = y; this.w = 12; this.h = 5; this.solid = true; this.lines = lines; }
  canInteract() { return true; }
  interact(G) { G.say(this.lines); }
  draw() { const im = IMG.sign; if (im) ctx.drawImage(im, half(this.x - im.width / 4), half(this.y - im.height / 2 + 1), im.width / 2, im.height / 2); }
}

class FireflyHeart {
  constructor(x, y) { this.x = x; this.y = y; this.w = 20; this.h = 10; this.solid = true; this.t = 0; this.light = { r: 60, c: 'rgba(255,230,140,' }; }
  get taken() { return SAVE.firefly; }
  canInteract() { return !this.taken; }
  interact(G, P) {
    SAVE.firefly = true; SAVE.maxHp += 2; P.hp = SAVE.maxHp; persist(); SFX.bigheart(); this.light = { r: 24, c: 'rgba(255,230,140,' };
    G.raise('heart', this.x, this.y - 22);
    G.say([{ text: 'Un cœur de luciole ! Ta vie maximale augmente d\'un cœur.' }, { who: 'Sacha', text: 'Alors c\'était ça, la lumière qu\'on voyait depuis le camping…' }], () => G.ending());
  }
  update(dt, G) { this.t += dt; if (!this.taken && Math.random() < dt * 6) G.parts.add({ x: this.x + rand(-10, 10), y: this.y - rand(10, 30), vy: -12, life: 1.2, c: pick(['#ffe27a', '#fff', '#8ff3ea']), r: 1 }); }
  draw() {
    ell(this.x, this.y, 13, 4, 'rgba(0,0,0,.4)');
    hi(this.x, this.y, false, () => {
      D(-20, -14, 40, 14, '#4a4e5a'); D(-20, -14, 40, 3, '#7a7e8a'); D(-16, -20, 32, 7, '#5a5e6a'); D(-16, -20, 32, 2, '#8a8e9a'); D(-20, -3, 40, 3, '#33363f');
      D(-14, -10, 3, 3, '#2f5a46'); D(10, -8, 4, 3, '#2f5a46');
    });
    if (!this.taken) { const b = Math.sin(this.t * 3) * 1.5; ctx.globalAlpha = 0.4; ell(this.x, this.y - 22 + b, 10, 10, '#ffe27a'); ctx.globalAlpha = 1; drawHeartShape(this.x, this.y - 22 + b, 2, '#ffcf3a', '#e09a20'); }
  }
}
