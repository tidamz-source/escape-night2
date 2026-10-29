'use strict';
// ---------- donjon 2 : le Bois des murmures (frisbee, ennemis du bois, Grand-Duc, mécanismes) ----------

// ---------- le frisbee : part en arc, revient, étourdit, rapporte les objets, survole souches et eau ----------
const FRISBEE_RANGE = 124;
class Frisbee {
  constructor(P, ax, ay, room) {
    const n = Math.hypot(ax, ay) || 1;
    this.ax = ax / n; this.ay = ay / n; this.ox = P.x; this.oy = P.y; this.d = 0; this.phase = 'out';
    this.x = P.x + this.ax * 6; this.y = P.y + this.ay * 4; this.alt = 10; this.room = room;
    this.isShot = true; this.isFrisbee = true; this.hitSet = new Set(); this.carry = null; this.t = 0; this.w = 8; this.h = 4;
  }
  back(G) { if (this.phase === 'out') { this.phase = 'back'; } }
  update(dt, G) {
    this.t += dt; const P = G.player;
    let nx, ny;
    if (this.phase === 'out') {
      this.d += 240 * dt;
      const k = this.d / FRISBEE_RANGE, lat = Math.sin(Math.PI * k) * 12;
      if (G.wind) { this.ox += G.wind.x * dt * 0.7; this.oy += G.wind.y * dt * 0.7; }
      nx = this.ox + this.ax * this.d - this.ay * lat; ny = this.oy + this.ay * this.d + this.ax * lat;
      if (this.d >= FRISBEE_RANGE) this.phase = 'back';
    } else {
      const a = Math.atan2(P.y - this.y, P.x - this.x), sp = 270;
      nx = this.x + Math.cos(a) * sp * dt; ny = this.y + Math.sin(a) * sp * dt;
      if (dist(nx, ny, P.x, P.y) < 10 || this.t > 4) { this.dead = true; if (this.carry) { this.carry.carried = false; this.carry.x = P.x; this.carry.y = P.y; } SFX.catch(); return; }
    }
    // seuls les vrais murs l'arrêtent (pas les souches, ni l'eau, ni le gouffre)
    const t = G.area.tileAt(nx, ny - 2);
    if (this.phase === 'out' && (t === 'W' || t === '#' || t === 'P')) { this.phase = 'back'; SFX.tink(); G.parts.burst(this.x, this.y - this.alt, 5, { c: ['#ffd08a', '#fff'], life: 0.25, r: 1 }); return; }
    this.x = nx; this.y = ny;
    if (Math.random() < dt * 30) G.parts.add({ x: this.x, y: this.y - this.alt, life: 0.25, c: '#ffd08a', r: 1 });
    const b = { x: this.x - 6, y: this.y - this.alt - 5, w: 12, h: 10 };
    for (const e of G.area.ents) {
      if (e === this || e.dead || e.isShot || this.hitSet.has(e)) continue;
      if (e.room != null && G.area.rooms && e.room !== G.room) continue;
      if (e.fetchable && !this.carry && !e.carried && rectHit(b, { x: e.x - 10, y: e.y - 14, w: 20, h: 18 })) { this.carry = e; e.carried = true; this.back(G); SFX.catch(); continue; }
      if (!e.hit && !e.onFrisbee) continue;
      if (!rectHit(b, e.body ? e.body() : boxOf(e))) continue;
      this.hitSet.add(e);
      if (e.onFrisbee) e.onFrisbee(G, this);
      else if (e.isEnemy) { e.hit(1, this.x, this.y, G, 'frisbee'); if (!e.dead) e.stunT = 2.2; }
      else e.hit(1, this.x, this.y, G, 'frisbee');
      this.back(G);
    }
    if (this.carry) { this.carry.x = this.x; this.carry.y = this.y + 4; }
  }
  draw() {
    ell(this.x, this.y, 4, 1.5, 'rgba(0,0,0,.35)');
    const y = this.y - this.alt, w = 5 + Math.abs(Math.sin(this.t * 25)) * 1.5;
    ell(this.x, y, w, 2.6, '#c86a10'); ell(this.x, y - 0.5, w - 1, 2, '#ff9f1c'); ell(this.x, y - 1, w - 3, 1, '#ffd08a');
  }
}
function drawFrisbeeIcon(x, y, s = 1) { ell(x, y + 1 * s, 6 * s, 3 * s, '#c86a10'); ell(x, y, 6 * s, 3 * s, '#ff9f1c'); ell(x, y - 0.5 * s, 3.5 * s, 1.5 * s, '#ffd08a'); }

// ---------- ennemis du bois ----------
class Boar extends Raccoon { // sanglier : charge plus fort, encaisse plus
  constructor(x, y, room) { super(x, y, room); this.hp = this.maxHp = 3; this.dmg = 1; this.loot = 'boar'; this.poof = ['#5a3a2a', '#8a6a4a', '#2a1a12']; this.w = 14; }
  update(dt, G) {
    super.update(dt, G);
    if (this.state === 'charge' && !this.boosted) { this.vx *= 1.25; this.vy *= 1.25; this.boosted = true; }
    if (this.state !== 'charge') this.boosted = false;
  }
  draw() {
    ell(this.x, this.y, 9, 2.5, 'rgba(0,0,0,.35)');
    const moving = this.vx || this.vy, f = moving ? Math.floor(this.t * (this.state === 'charge' ? 16 : 8)) % 2 : 0, wb = this.state === 'warn' ? Math.sin(this.t * 60) * 0.5 : 0, fl = this.flash > 0;
    hi(this.x + wb, this.y, this.face < 0, () => {
      const c = fl ? '#fff' : '#5a3a2a', d = fl ? '#fff' : '#3a2418', l = fl ? '#fff' : '#7a5a3a';
      D(-14, -22, 30, 16, c); D(-12, -24, 24, 4, d); for (let i = 0; i < 5; i++) D(-8 + i * 5, -27, 2, 4, d); // crête
      D(-12, -8, 26, 2, l);
      D(-12, -6, 4, 6 - f * 2, d); D(8, -6, 4, 4 + f * 2, d); D(-5, -6, 4, 4 + f * 2, d); D(2, -6, 4, 6 - f * 2, d);
      D(-24, -20, 12, 12, c); D(-28, -14, 6, 6, '#c89a8a'); D(-28, -12, 2, 2, '#3a1a1a'); D(-25, -12, 2, 2, '#3a1a1a');
      D(-24, -10, 3, 5, '#f0e8d8'); D(-18, -10, 3, 4, '#f0e8d8'); // défenses
      D(-20, -20, 3, 3, this.state === 'warn' || this.state === 'charge' ? '#ff5a5a' : '#1a1a1a'); D(-16, -24, 4, 4, d);
      D(15, -20, 4, 3, d);
    });
    if (this.state === 'warn') text('!', this.x, this.y - 30, { size: 10, align: 'center', color: PAL.warm, bold: true });
  }
}
class Acorn extends Orb {
  constructor(x, y, a) { super(x, y - 12, a); this.alt = 8; this.y = y; this.vx = Math.cos(a) * 115; this.vy = Math.sin(a) * 115; this.light = null; }
  update(dt, G) { super.update(dt, G); if (!this.dead && WALLS.has(G.area.tileAt(this.x, this.y - 2))) this.dead = true; }
  draw() { const y = this.y - this.alt; ell(this.x, this.y, 2, 0.8, 'rgba(0,0,0,.3)'); hi(this.x, y, false, () => { D(-3, -2, 6, 6, '#8a5a2a'); D(-4, -4, 8, 3, '#5a3a1a'); D(-2, 1, 2, 2, '#b07a3a'); }); }
}
class Squirrel extends Enemy { // écureuil : garde ses distances et lance des glands
  constructor(x, y, room) { super(x, y, { hp: 1, dmg: 1, room }); this.loot = 'squirrel'; this.cd = rand(1, 2); this.st = 0; this.hop = 0; this.poof = ['#c86a2a', '#f0a050', '#fff']; this.w = 10; this.h = 6; }
  update(dt, G) {
    if (this.physics(dt, G)) return;
    this.t += dt; this.cd -= dt; this.st -= dt; if (this.hop > 0) this.hop -= dt;
    const P = G.player, d = dist(this.x, this.y, P.x, P.y), a = Math.atan2(P.y - this.y, P.x - this.x);
    if (this.st <= 0) {
      const away = d < 70, ang = away ? a + Math.PI + rand(-0.6, 0.6) : rand(0, 6.28);
      this.vx = Math.cos(ang) * 70; this.vy = Math.sin(ang) * 70; this.st = rand(0.8, 1.6); this.hop = 0.35;
    }
    if (this.hop > 0) { moveEnt(G.area, this, this.vx * dt, 0, { noExit: true }); moveEnt(G.area, this, 0, this.vy * dt, { noExit: true }); }
    this.face = Math.cos(a) < 0 ? -1 : 1;
    if (this.cd <= 0 && d < 170 && this.hop <= 0) { this.cd = rand(1.8, 2.6); SFX.shoot(); const o = new Acorn(this.x, this.y, a); o.room = this.room; G.area.ents.push(o); }
    this.touch(G);
  }
  draw() {
    const fl = this.flash > 0, j = this.hop > 0 ? Math.sin(this.hop / 0.35 * Math.PI) * 4 : 0;
    ell(this.x, this.y, 5, 1.8, 'rgba(0,0,0,.35)');
    hi(this.x, this.y - j, this.face < 0, () => {
      const c = fl ? '#fff' : '#c86a2a', l = fl ? '#fff' : '#f0a050';
      D(-14, -26, 10, 22, c); D(-16, -30, 8, 8, c); D(-12, -24, 4, 16, l); // queue
      D(-6, -16, 14, 14, c); D(-2, -12, 6, 8, '#f0e0c8');
      D(2, -24, 10, 10, c); D(4, -28, 3, 5, c); D(9, -28, 3, 5, c); D(8, -21, 2, 2, '#1a1a1a'); D(11, -18, 2, 2, '#3a1a1a');
      D(-4, -2, 4, 2, '#5a3a1a'); D(4, -2, 4, 2, '#5a3a1a');
    });
  }
}
class Crow extends Bat { // corbeau
  constructor(x, y, room) { super(x, y, room); this.loot = 'bat'; this.poof = ['#1a1a22', '#3a3a4a', '#fff']; }
  draw() {
    ell(this.x, this.y, 5, 1.8, 'rgba(0,0,0,.3)');
    const f = Math.floor(this.t * 12) % 2, fl = this.flash > 0, b = fl ? '#fff' : '#1a1a22', wc = fl ? '#fff' : '#2a2a36';
    hi(this.x, this.y - this.alt + Math.sin(this.t * 8), this.face < 0, () => {
      if (f) { D(-22, -8, 14, 5, wc); D(8, -8, 14, 5, wc); } else { D(-20, -16, 12, 5, wc); D(-24, -20, 6, 5, wc); D(8, -16, 12, 5, wc); D(18, -20, 6, 5, wc); }
      D(-8, -12, 16, 10, b); D(6, -14, 8, 8, b); D(13, -12, 5, 3, '#c8a040'); D(9, -12, 2, 2, '#ff3a3a'); D(-12, -10, 5, 4, b);
    });
  }
}

// ---------- boss : le Grand-Duc ----------
// Il tourne en l'air, pique ou lance des plumes. Un coup de frisbee le fait tomber : il est alors à terre, à la merci de la branche.
class Feather extends Orb {
  constructor(x, y, alt, a) { super(x, y - 12, a); this.y = y; this.alt = alt; this.vx = Math.cos(a) * 120; this.vy = Math.sin(a) * 120; this.light = null; this.a = a; }
  update(dt, G) { this.alt = lerp(this.alt, 10, Math.min(1, dt * 4)); super.update(dt, G); }
  draw() { const y = this.y - this.alt; ell(this.x, this.y, 2, 0.8, 'rgba(0,0,0,.3)'); ctx.save(); ctx.translate(this.x, y); ctx.rotate(this.a); R(-5, -1, 10, 2, '#e8e0d0'); R(-5, -1, 3, 2, '#8a6a4a'); ctx.restore(); }
}
class GreatOwl extends Enemy {
  constructor(x, y, room) {
    super(x, y, { hp: 8, dmg: 2, room });
    this.isBoss = true; this.name = 'Le Grand-Duc'; this.state = 'sleep'; this.alt = 0; this.st = 0; this.ang = Math.PI / 2;
    this.cx = x; this.cy = y; this.phase = 1; this.w = 28; this.h = 12; this.hits = 0; this.cd = 2; this.spawned = false; this.loot = null;
    this.poof = ['#8a6a4a', '#c8a880', '#f0e8d8', '#3a2418'];
  }
  body() { return { x: this.x - 16, y: this.y - this.alt - 30, w: 32, h: 28 }; }
  clampArea(G) { const r = G.roomRect(); this.x = clamp(this.x, r.x + 48, r.x + r.w - 48); this.y = clamp(this.y, r.y + 70, r.y + r.h - 40); }
  get airborne() { return ['fly', 'swoop', 'climb', 'feathers'].includes(this.state); }
  wake(G) { if (this.state !== 'sleep') return; this.state = 'rise'; this.st = 1.2; SFX.hoot(); G.shake = 0.4; }
  onFrisbee(G) {
    if (this.airborne) { this.state = 'fall'; this.st = 0.45; this.flash = 0.2; SFX.stun(); G.shake = 0.3; G.hitstop = 0.08; G.parts.burst(this.x, this.y - this.alt - 14, 16, { c: this.poof, life: 0.6, smin: 20, smax: 80, r: 2, g: 60 }); }
    else SFX.tink();
  }
  hit(dmg, fx, fy, G, src) {
    if (this.state === 'down' && src !== 'stone' && src !== 'frisbee') {
      this.hp -= dmg || 1; this.hits++; this.flash = 0.2; SFX.bossHit(); G.hitstop = 0.08; G.shake = 0.15;
      G.parts.burst(this.x, this.y - 14, 10, { c: this.poof, life: 0.5, smin: 30, smax: 90, r: 2, g: 80 });
      if (this.hp <= 4 && this.phase === 1) this.phase = 2;
      if (this.hp <= 0) { this.state = 'dying'; this.st = 2.2; SFX.bossDie(); G.shake = 0.5; for (const e of G.area.ents) { if (e !== this && e.isEnemy && !e.dead && e.room === this.room) e.die(G); if (e.isOrb) e.dead = true; } }
      else if (this.hits >= 3) { this.state = 'rise'; this.st = 1; SFX.hoot(); }
      return;
    }
    if (this.state !== 'sleep' && this.state !== 'dying') { SFX.tink(); G.parts.burst(lerp(fx, this.x, 0.5), lerp(fy, this.y - this.alt - 14, 0.5), 4, { c: ['#fff', '#c8a880'], life: 0.2, r: 1 }); }
  }
  update(dt, G) {
    this.t += dt; this.st -= dt; if (this.flash > 0) this.flash -= dt;
    const P = G.player, rr = G.roomRect();
    switch (this.state) {
      case 'sleep': return;
      case 'rise':
        this.alt = lerp(this.alt, 34, Math.min(1, dt * 4));
        if (this.st <= 0) {
          this.state = 'fly'; this.st = rand(2.5, 3.5); this.hits = 0;
          if (this.phase === 2 && !this.spawned) { this.spawned = true; for (const dx of [-80, 80]) { const c = new Crow(clamp(this.x + dx, rr.x + 60, rr.x + rr.w - 60), this.y, this.room); c.respawn = true; G.area.ents.push(c); } }
        }
        return;
      case 'fly': {
        this.ang += dt * (this.phase === 1 ? 0.9 : 1.3);
        const tx = rr.x + 240 + Math.cos(this.ang) * 150, ty = rr.y + 140 + Math.sin(this.ang) * 50;
        this.x = lerp(this.x, tx, Math.min(1, dt * 2)); this.y = lerp(this.y, ty, Math.min(1, dt * 2)); this.alt = lerp(this.alt, 34, dt * 3);
        if (this.st <= 0) {
          if (Math.random() < 0.45) { this.state = 'swoop'; this.st = 1.1; this.tx = P.x; this.ty = P.y; SFX.hoot(); }
          else { this.state = 'feathers'; this.st = 0.6; this.thrown = false; }
        }
        return;
      }
      case 'swoop': {
        const a = Math.atan2(this.ty - this.y, this.tx - this.x), sp = this.phase === 1 ? 150 : 190;
        this.x += Math.cos(a) * sp * dt; this.y += Math.sin(a) * sp * dt; this.alt = lerp(this.alt, 6, Math.min(1, dt * 5));
        if (this.alt < 16) this.touch(G);
        if (this.st <= 0 || dist(this.x, this.y, this.tx, this.ty) < 10) { this.state = 'climb'; this.st = 0.8; }
        this.clampArea(G); return;
      }
      case 'climb': this.alt = lerp(this.alt, 34, Math.min(1, dt * 3)); if (this.st <= 0) { this.state = 'fly'; this.st = rand(2.2, 3.2); } return;
      case 'feathers':
        if (!this.thrown && this.st < 0.3) {
          this.thrown = true; SFX.shoot();
          const n = this.phase === 1 ? 3 : 5, a0 = Math.atan2(P.y - this.y, P.x - this.x);
          for (let i = 0; i < n; i++) { const f = new Feather(this.x, this.y, this.alt, a0 + (i - (n - 1) / 2) * 0.28); f.room = this.room; G.area.ents.push(f); }
        }
        if (this.st <= 0) { this.state = 'fly'; this.st = rand(2.2, 3.2); }
        return;
      case 'fall': this.alt = lerp(this.alt, 0, Math.min(1, dt * 10)); if (this.st <= 0) { this.alt = 0; this.state = 'down'; this.st = 3.4; G.shake = 0.2; } return;
      case 'down':
        if (Math.random() < dt * 6) G.parts.add({ x: this.x + rand(-10, 10), y: this.y - 34, vy: -8, life: 0.6, c: '#ffe27a', r: 1 });
        if (this.st <= 0) { this.state = 'rise'; this.st = 1; SFX.hoot(); }
        return;
      case 'dying':
        if (Math.random() < dt * 20) G.parts.burst(this.x + rand(-20, 20), this.y - this.alt - rand(0, 30), 5, { c: this.poof, life: 0.5, r: 2, g: 60 });
        if (this.st <= 0) { this.dead = true; G.shake = 0.5; G.parts.burst(this.x, this.y - 16, 46, { c: ['#ffe27a', '#fff', '#8ff3ea', '#c8a880'], life: 1.4, smin: 20, smax: 150, r: 2, drag: 1.5 }); }
        return;
    }
  }
  draw() {
    if (this.state === 'dying' && Math.floor(this.t * 20) % 2) return;
    const sh = clamp(1 - this.alt / 60, 0.4, 1);
    ell(this.x, this.y, 20 * sh, 5 * sh, 'rgba(0,0,0,.45)');
    const fl = this.flash > 0, air = this.alt > 4, flap = air ? Math.sin(this.t * (this.state === 'swoop' ? 8 : 12)) : 0, down = this.state === 'down';
    hi(this.x, this.y - this.alt, false, () => {
      const c1 = fl ? '#fff' : '#7a5a3a', c2 = fl ? '#fff' : '#a07a4a', c3 = fl ? '#fff' : '#f0e0c0', c4 = fl ? '#fff' : '#4a3424';
      if (air) for (const s of [-1, 1]) { // ailes déployées
        const wy = -40 + Math.round(flap * 10);
        D(s < 0 ? -64 : 20, wy, 44, 16, c1); D(s < 0 ? -74 : 54, wy + 6, 20, 12, c4); D(s < 0 ? -60 : 24, wy + 12, 36, 6, c2);
        for (let i = 0; i < 4; i++) D(s < 0 ? -72 + i * 10 : 26 + i * 10, wy + 16, 6, 8, c4);
      } else { D(-30, -44, 10, 34, c4); D(20, -44, 10, 34, c4); } // ailes repliées
      D(-22, -54, 44, 52, c1); D(-16, -40, 32, 36, c2); for (let i = 0; i < 4; i++) D(-12 + (i % 2) * 6, -34 + i * 7, 18, 2, c4); // ventre
      D(-20, -76, 40, 26, c1); D(-24, -84, 10, 12, c4); D(14, -84, 10, 12, c4); // tête, aigrettes
      if (down) { D(-14, -68, 10, 3, '#3a2418'); D(4, -68, 10, 3, '#3a2418'); }
      else { D(-16, -72, 12, 12, '#ffcf3a'); D(4, -72, 12, 12, '#ffcf3a'); D(-12, -68, 5, 5, '#1a1008'); D(8, -68, 5, 5, '#1a1008'); D(-14, -71, 3, 2, '#fff'); D(6, -71, 3, 2, '#fff'); }
      D(-3, -60, 6, 6, '#c8a040'); D(-2, -55, 4, 3, '#8a6a20');
      D(-14, -4, 8, 4, '#c8a040'); D(6, -4, 8, 4, '#c8a040'); // pattes
    });
    if (down) for (let i = 0; i < 4; i++) { const a = this.t * 4 + i * Math.PI / 2; R(half(this.x + Math.cos(a) * 16), half(this.y - 42 + Math.sin(a) * 4), 2, 2, i % 2 ? '#ffe27a' : '#fff'); }
  }
}

// ---------- mécanismes et décors du bois ----------
class FrisbeeSwitch { // lanterne à allumer ; reste allumée 4 s
  constructor(x, y, group) { this.x = x; this.y = y; this.group = group; this.w = 12; this.h = 8; this.solid = true; this.on = 0; this.t = 0; }
  get lit() { return SAVE[this.group] || this.on > 0; }
  get light() { return this.lit ? { r: 54, c: 'rgba(255,200,90,', flick: true, warm: true } : { r: 16, c: 'rgba(255,200,90,' }; }
  body() { return { x: this.x - 8, y: this.y - 30, w: 16, h: 30 }; }
  hit(d, fx, fy, G) { if (SAVE[this.group]) return; this.on = 4; SFX.crystal(); G.parts.burst(this.x, this.y - 22, 10, { c: ['#ffe27a', '#fff'], life: 0.5, r: 1 }); G.checkSwitches(this.group); }
  update(dt) { this.t += dt; if (this.on > 0) this.on -= dt; }
  draw() {
    ell(this.x, this.y, 6, 2, 'rgba(0,0,0,.4)');
    const lit = this.lit, f = Math.floor(this.t * 8) % 2;
    hi(this.x, this.y, false, () => {
      D(-3, -36, 6, 36, '#4a3424'); D(-3, -36, 2, 36, '#6a4a34'); D(-8, -4, 16, 4, '#3a2418');
      D(-9, -54, 18, 18, '#3a3d48'); D(-7, -52, 14, 14, lit ? (f ? '#ffe27a' : '#ffcf3a') : '#2a2438'); D(-10, -58, 20, 4, '#5a5e6a'); D(-2, -62, 4, 4, '#5a5e6a');
    });
    if (this.on > 0 && !SAVE[this.group]) { const k = this.on / 4; ctx.strokeStyle = '#ffe27a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(this.x, this.y - 35, 8, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke(); }
  }
}
class KeyPickup { // clé posée au sol (l'îlot de l'étang) : à ramasser, ou à rapporter avec le frisbee
  constructor(x, y, flag) { this.x = x; this.y = y; this.flag = flag; this.w = 10; this.h = 6; this.fetchable = true; this.t = 0; }
  get dead() { return !!SAVE[this.flag]; }
  get light() { return { r: 26, c: 'rgba(255,207,122,' }; }
  update(dt, G) {
    this.t += dt;
    if (rectHit({ x: this.x - 6, y: this.y - 10, w: 12, h: 12 }, G.player.body())) {
      SAVE[this.flag] = true; Keys.add(1); persist(); SFX.chest(); G.raise('key');
      G.say([{ text: 'Tu as récupéré une petite clé !' }]);
    }
  }
  draw() { if (!this.carried) ell(this.x, this.y, 5, 1.5, 'rgba(0,0,0,.3)'); drawKey(this.x, this.y - 6 + Math.sin(this.t * 3), 1.5); }
}
class Glowshroom { // champignons lumineux (décor)
  constructor(x, y) { this.x = x; this.y = y; this.w = 8; this.h = 4; this.t = rand(0, 6); this.ground = false; }
  get light() { return { r: 34, c: 'rgba(120,240,220,' }; }
  update(dt) { this.t += dt; }
  draw() {
    const g = Math.sin(this.t * 2) > 0 ? '#8ff3ea' : '#6fe0d0';
    hi(this.x, this.y, false, () => { D(-8, -6, 3, 6, '#d8e8e0'); D(-11, -10, 9, 5, g); D(2, -8, 3, 8, '#d8e8e0'); D(-1, -13, 9, 6, g); D(-5, -4, 2, 4, '#d8e8e0'); D(-7, -7, 6, 4, g); });
  }
}
class Target { // cible du pont-levis : à toucher de loin
  constructor(x, y, flag, onHit) { this.x = x; this.y = y; this.flag = flag; this.onHit = onHit; this.w = 12; this.h = 6; this.solid = true; this.t = 0; }
  body() { return { x: this.x - 9, y: this.y - 28, w: 18, h: 52 }; } // touche aussi un tir rasant depuis le chemin
  hit(d, fx, fy, G, src) {
    if (SAVE[this.flag]) return;
    if (src !== 'stone' && src !== 'frisbee') { SFX.tink(); return; }
    SAVE[this.flag] = true; persist(); SFX.crystal(); G.shake = 0.3;
    G.parts.burst(this.x, this.y - 18, 16, { c: ['#ff4a4a', '#fff', '#ffe27a'], life: 0.6, r: 2 });
    if (this.onHit) this.onHit(G);
  }
  update(dt) { this.t += dt; }
  draw() {
    ell(this.x, this.y, 7, 2, 'rgba(0,0,0,.35)');
    const done = SAVE[this.flag];
    hi(this.x, this.y, false, () => {
      D(-3, -30, 6, 30, '#5a3a22'); D(-16, -58, 32, 32, '#5a3a22');
      D(-14, -56, 28, 28, '#f0e8d8'); D(-10, -52, 20, 20, '#d83a3a'); D(-6, -48, 12, 12, '#f0e8d8'); D(-3, -45, 6, 6, done ? '#ffe27a' : '#d83a3a');
      if (done) { D(-1, -44, 3, 3, '#8a8698'); }
    });
  }
}
class DrawbridgeDeco { // poteaux du pont-levis, et le tablier relevé tant qu'il n'est pas abaissé
  constructor(x, y) { this.x = x; this.y = y; this.w = 4; this.h = 4; }
  draw() {
    const up = !SAVE.drawbridge;
    hi(this.x, this.y, false, () => {
      for (const sy of [-72, 6]) { D(-6, sy - 26, 10, 30, '#4a2a14'); D(-6, sy - 26, 3, 30, '#6a4224'); }
      if (up) { D(-8, -70, 14, 72, '#6a4224'); for (let y = -66; y < 0; y += 8) D(-8, y, 14, 2, '#4a2a14'); D(-2, -76, 2, 10, '#9a9eaa'); }
    });
  }
}

// ---------- la zone : le Bois des murmures (Forêt) — 10 salles ----------
//            .          [BOSS]          .           .
//            .      [TRÉSOR] [HAUTEURS] [GRANDE CLÉ]
//            .      [FRISBEE] [MOULIN]  [LANTERNES]
//            .      [ÉTANG]   [ENTRÉE]   [ARÈNE]
function buildBoisArea() {
  return makeDungeon({
    id: 'bois', zone: 'foret', name: 'Le Bois des murmures', theme: 'forest', seed: 33, rough: 0.3, moss: 420, dark: 0.36,
    bossFlag: 'boss2', heartFlag: 'heart3', potLoot: 'potBois',
    rooms: { entry: [2, 3], arena: [3, 3], pond: [1, 3], wind: [2, 2], frisbee: [1, 2], switches: [3, 2], bigkey: [3, 1], upper: [2, 1], treasure: [1, 1], boss: [2, 0] },
    entry: 'entry', boss: 'boss',
    links: [['entry', 'arena', { arena: true, at: 'b' }], ['entry', 'pond'], ['entry', 'wind'], ['wind', 'frisbee', { key: 'boisK1' }], ['wind', 'switches'], ['switches', 'bigkey', { shut: () => !SAVE.switchesB }], ['wind', 'upper', { key: 'boisK2' }], ['upper', 'treasure'], ['upper', 'boss', { big: true }]],
    tiles(room) {
      const st = (n, pts) => pts.forEach(([x, y]) => room(n).set(x, y, 's'));
      st('entry', [[6, 5], [23, 5], [6, 11], [23, 11]]);
      st('arena', [[8, 5], [21, 5], [14, 11]]);
      const p = room('pond'); for (let y = 4; y < 13; y++) for (let x = 6; x < 24; x++) { const v = ((x + 0.5 - 15) / 8) ** 2 + ((y + 0.5 - 8.5) / 4.2) ** 2; if (v < 1) p.set(x, y, '~'); } p.rect(14, 8, 2, 1, '_');
      st('wind', [[5, 5], [10, 7], [19, 5], [24, 8], [8, 11], [21, 11], [14, 9], [16, 4], [12, 3]]);
      st('switches', [[5, 3], [5, 4], [5, 5], [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 5], [11, 4], [11, 3], [18, 3], [18, 4], [18, 5], [19, 6], [20, 6], [21, 6], [22, 6], [23, 6], [24, 5], [24, 4], [24, 3]]);
      st('frisbee', [[6, 4], [23, 4], [6, 12], [23, 12]]);
      for (let i = 0; i < 9; i++) room('upper').set(4 + i * 3, 5 + (i % 2) * 5, 's');
      st('upper', [[8, 8], [21, 8], [11, 12], [18, 12]]);
      st('treasure', [[8, 5], [21, 5], [8, 11], [21, 11]]);
      st('bigkey', [[7, 4], [22, 4], [7, 12], [22, 12], [14, 8]]);
    },
    arenas: { arena: arenaStd('arenaB'), boss: bossArena('boss2', 'Le Grand-Duc') },
    after(A, h) { A.windRoom = h.R.wind; A.roomDark = room => room === h.R.boss && SAVE.boss2 ? 0.12 : null; },
    make(n, L, h) {
      const { mk } = h, bush = (tx, ty) => Object.assign(mk(Bush, n, tx, ty), { loot: 'bushBois' }), pot = (tx, ty) => h.pot(n, tx, ty);
      if (n === 'entry') L.push(bush(4, 4), bush(25, 4), bush(4, 12), bush(25, 12), mk(Boar, n, 20, 8), mk(Crow, n, 9, 6));
      if (n === 'arena') { L.push(pot(4, 3), pot(25, 3), pot(4, 13)); if (!SAVE.arenaB) L.push(mk(Boar, n, 6, 8), mk(Boar, n, 23, 8), mk(Squirrel, n, 14, 4), mk(Squirrel, n, 10, 12)); }
      if (n === 'pond') L.push(mk(Crow, n, 6, 3), mk(Crow, n, 24, 3), mk(Squirrel, n, 25, 12), bush(4, 13), bush(25, 13));
      if (n === 'wind') L.push(mk(Boar, n, 15, 6), mk(Squirrel, n, 4, 3), bush(3, 13), bush(26, 3), pot(26, 13));
      if (n === 'frisbee') L.push(mk(Crow, n, 8, 7), mk(Crow, n, 21, 7), mk(Boar, n, 14, 12), pot(3, 3), pot(26, 3));
      if (n === 'switches') L.push(mk(Squirrel, n, 14, 4), mk(Squirrel, n, 14, 11), mk(Boar, n, 6, 11), bush(3, 13), bush(26, 13));
      if (n === 'bigkey') L.push(mk(Boar, n, 8, 8), mk(Boar, n, 21, 8), mk(Crow, n, 14, 4), pot(3, 13), pot(26, 13));
      if (n === 'upper') L.push(mk(Squirrel, n, 6, 3), mk(Squirrel, n, 23, 3), mk(Crow, n, 14, 9), pot(3, 13), pot(26, 13));
      if (n === 'treasure') L.push(mk(Crow, n, 10, 8), mk(Crow, n, 19, 8), pot(3, 3), pot(26, 3), bush(3, 13), bush(26, 13));
      if (n === 'boss') { if (!SAVE.boss2) { const p = h.pos(n, 240, 130); L.push(new GreatOwl(p.x, p.y, h.R.boss)); } L.push(pot(3, 12), pot(26, 12)); }
    },
    fixed(h) {
      const { mk, pos } = h, sh = (n, pts) => pts.map(([x, y]) => [n, mk(Glowshroom, n, x, y)]);
      const ac = pos('arena', 240, 150), fc = pos('frisbee', 240, 140), cg = pos('boss', 240, 66), isl = pos('pond', 240, 144), bc = pos('bigkey', 240, 210);
      return [
        ['entry', mk(Sign, 'entry', 14, 10, [{ text: '« Bois des murmures. Le vent du vieux moulin ne souffle jamais longtemps. »' }])],
        ['arena', new Chest(ac.x, ac.y, { flag: 'boisKeyChest', reveal: 'arenaB', msg: [{ text: 'Une petite clé ! Elle ouvre une porte de ce bois.' }] })],
        ['pond', new KeyPickup(isl.x, isl.y, 'boisKey2')],
        ['pond', mk(Sign, 'pond', 14, 13, [{ text: '« Ce qui brille sur l\'îlot ne se rapporte qu\'en volant. »' }])],
        ['wind', mk(Sign, 'wind', 14, 13, [{ text: '« Au nord, le nid du Grand-Duc. Abritez-vous derrière les souches quand le vent souffle. »' }])],
        ['frisbee', new Chest(fc.x, fc.y, { flag: 'frisbeeChest', give: 'frisbee', big: true, msg: [{ text: 'Tu as trouvé le frisbee !' }, { text: 'Bouton B : il part en arc et revient. Il étourdit les ennemis, rapporte les objets et passe au-dessus des souches et de l\'eau.' }, { text: 'Change d\'outil avec E, les gâchettes LB/RB, ou en touchant la case B.' }] })],
        ['switches', mk(FrisbeeSwitch, 'switches', 8, 4, 'switchesB')], ['switches', mk(FrisbeeSwitch, 'switches', 21, 4, 'switchesB')],
        ['switches', mk(Sign, 'switches', 14, 9, [{ text: '« Deux lanternes, un seul souffle. Elles ne brillent ensemble que quelques secondes. »' }])],
        ['bigkey', new Chest(bc.x, bc.y, { flag: 'boisBigKey', give: 'bigkey:bois', big: true, msg: [{ text: 'La grande clé du bois ! Elle ouvre le nid du Grand-Duc.' }] })],
        ['treasure', mk(Chest, 'treasure', 14, 8, { flag: 'boisTreasure', give: 'money:50', msg: [{ text: 'Un trésor d\'écureuil : 50 écus !' }] })],
        ['boss', new Cage(cg.x, cg.y, { n: 2, boss: 'boss2', drawCaptive: (x, y) => drawSprite('claudine', x, y) })],
        ...sh('entry', [[3, 7], [26, 9]]), ...sh('arena', [[3, 8], [26, 6]]), ...sh('pond', [[3, 6], [26, 8]]), ...sh('wind', [[3, 8], [26, 6]]), ...sh('frisbee', [[9, 9], [20, 9]]),
        ...sh('switches', [[3, 8], [26, 8]]), ...sh('upper', [[3, 8], [26, 8]]), ...sh('treasure', [[14, 4]]), ...sh('bigkey', [[3, 8], [26, 8]]), ...sh('boss', [[3, 3], [26, 3], [3, 13], [26, 13]]),
      ];
    },
  });
}
