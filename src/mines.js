'use strict';
// ---------- donjon 3 : les Mines des gnomes (grappin, wagonnets, Taupe de fer, Amandine) ----------

// ---------- ennemis ----------
class Gnome extends Raccoon { // gnome mineur : casque à lampe, pioche, charge quand on approche
  constructor(x, y, room) { super(x, y, room); this.hp = this.maxHp = 2; this.loot = 'gnome'; this.poof = ['#c83a3a', '#e8dcc8', '#6a4a3a']; this.light = { r: 34, c: 'rgba(255,220,140,' }; }
  draw() {
    if (drawMob(this, 'gnome', { pose: this.state === 'warn' || this.state === 'charge', fps: 10, sh: 7 })) return;
    ell(this.x, this.y, 7, 2.5, 'rgba(0,0,0,.35)');
    const moving = this.vx || this.vy, f = moving ? Math.floor(this.t * (this.state === 'charge' ? 14 : 7)) % 2 : 0, fl = this.flash > 0, wb = this.state === 'warn' ? Math.sin(this.t * 60) * 0.5 : 0;
    hi(this.x + wb, this.y, this.face < 0, () => {
      const c = fl ? '#fff' : null;
      D(-6, -6, 4, 6 - f * 2, c || '#3a2a20'); D(2, -6, 4, 4 + f * 2, c || '#3a2a20');
      D(-9, -22, 18, 16, c || '#4a6a9a'); D(-9, -22, 18, 3, c || '#6a8aba'); D(-9, -10, 18, 2, c || '#3a2414');
      D(-8, -30, 16, 9, c || '#e8b890'); D(-10, -24, 20, 10, c || '#e8e8f0'); D(-4, -14, 8, 4, c || '#e8e8f0'); // barbe
      D(-5, -28, 2, 2, '#1a1a22'); D(3, -28, 2, 2, '#1a1a22'); D(-2, -26, 4, 3, c || '#d88a7a');
      D(-10, -38, 20, 9, c || '#c8a040'); D(-11, -31, 22, 3, c || '#a07a20'); D(-3, -40, 6, 5, '#fff6c0'); // casque et lampe
      // pioche
      const up = this.state === 'warn' || this.state === 'charge';
      if (up) { D(8, -40, 3, 26, c || '#6a4224'); D(2, -42, 16, 4, c || '#9a9eaa'); D(16, -40, 3, 4, c || '#9a9eaa'); }
      else { D(10, -24, 3, 22, c || '#6a4224'); D(6, -26, 14, 4, c || '#9a9eaa'); }
    });
    if (this.state === 'warn') text('!', this.x, this.y - 44, { size: 10, align: 'center', color: PAL.warm, bold: true });
  }
}
class CrystalSpider extends Enemy { // araignée de cristal : bondit vers le héros
  constructor(x, y, room) { super(x, y, { hp: 1, dmg: 1, room }); this.st = rand(0.5, 1.5); this.z = 0; this.vz = 0; this.w = 10; this.h = 6; this.loot = 'spider'; this.poof = ['#c88aff', '#8ff3ea', '#fff']; this.light = { r: 26, c: 'rgba(200,140,255,' }; }
  update(dt, G) {
    if (this.physics(dt, G)) return;
    this.t += dt; this.st -= dt; const P = G.player;
    if (this.z < 0 || this.vz < 0) { this.vz += 500 * dt; this.z += this.vz * dt; moveEnt(G.area, this, this.vx * dt, 0, { noExit: true }); moveEnt(G.area, this, 0, this.vy * dt, { noExit: true }); if (this.z >= 0) { this.z = 0; this.vz = 0; this.st = rand(0.5, 1.1); } }
    else if (this.st <= 0) { const a = Math.atan2(P.y - this.y, P.x - this.x) + rand(-0.4, 0.4), d = dist(P.x, P.y, this.x, this.y), s = d < 140 ? 110 : 50; this.vx = Math.cos(a) * s; this.vy = Math.sin(a) * s; this.vz = -150; this.face = this.vx < 0 ? -1 : 1; }
    this.touch(G);
  }
  draw() {
    if (drawMob(this, 'spider', { alt: -this.z, anim: true, fps: 12, sh: 7 })) return;
    ell(this.x, this.y, 6, 2, 'rgba(0,0,0,.35)');
    const fl = this.flash > 0, f = Math.floor(this.t * 10) % 2;
    hi(this.x, this.y + this.z, this.face < 0, () => {
      const c1 = fl ? '#fff' : '#8a4ac8', c2 = fl ? '#fff' : '#c88aff';
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) D(s * (8 + i * 2) - (s < 0 ? 4 : 0), -10 + i * 4 + (f && i === 1 ? -2 : 0), 4, 2, '#3a2a4a');
      D(-8, -14, 16, 10, c1); D(-6, -18, 12, 6, c2); D(-3, -22, 6, 5, '#e8d8ff'); D(-1, -24, 2, 3, '#fff');
      D(-5, -10, 2, 2, '#ff3a6a'); D(3, -10, 2, 2, '#ff3a6a');
    });
  }
}
class MineLamp { // lanterne de mineur sur un poteau
  constructor(x, y) { this.x = x; this.y = y; this.w = 6; this.h = 4; this.solid = true; this.t = rand(0, 5); this.light = { r: 70, c: 'rgba(255,190,90,', flick: true, warm: true }; }
  update(dt) { this.t += dt; }
  draw() {
    ell(this.x, this.y, 5, 2, 'rgba(0,0,0,.4)');
    const f = Math.floor(this.t * 8) % 2;
    hi(this.x, this.y, false, () => { D(-2, -40, 5, 40, '#6a4224'); D(-2, -40, 2, 40, '#8a5a34'); D(2, -40, 10, 3, '#6a4224'); D(8, -38, 2, 4, '#3a3d48'); D(4, -34, 10, 10, '#3a3d48'); D(6, -32, 6, 6, f ? '#ffe27a' : '#ffcf3a'); });
  }
}
class Rock extends Orb { // caillou projeté par la Taupe
  constructor(x, y, a) { super(x, y, a); this.light = null; this.vx *= 1.2; this.vy *= 1.2; }
  draw() { const y = this.y - this.alt; ell(this.x, this.y, 2.5, 1, 'rgba(0,0,0,.3)'); R(half(this.x - 3), half(y - 3), 6, 6, '#6a5040'); R(half(this.x - 3), half(y - 3), 3, 3, '#8a6a50'); }
}

// ---------- mini-boss : la Chauve-souris de cristal (salle des poteaux, grande clé) ----------
// Elle plane au-dessus du vide, pique sur le héros, lâche des éclats de cristal et appelle deux chauves-souris.
class CrystalShard extends Orb {
  constructor(x, y, a) { super(x, y, a); this.light = { r: 18, c: 'rgba(170,140,255,' }; }
  draw() { const y = this.y - this.alt; ell(this.x, this.y, 2.5, 1, 'rgba(0,0,0,.3)'); R(half(this.x - 2), half(y - 4), 4, 8, '#b49aff'); R(half(this.x - 1), half(y - 3), 2, 4, '#fff'); }
}
class BigBat extends Bat {
  constructor(x, y, room) { super(x, y, room); this.hp = this.maxHp = 7; this.dmg = 1; this.w = 18; this.h = 10; this.alt = 22; this.fcd = 2.4; this.ccd = 4; this.loot = 'pot'; this.isMini = true; this.poof = ['#8a6aaa', '#c8b0ff', '#fff']; this.light = { r: 40, c: 'rgba(170,140,255,' }; }
  body() { return { x: this.x - 13, y: this.y - this.alt - 13, w: 26, h: 20 }; }
  update(dt, G) {
    super.update(dt, G); if (this.dead || this.stunT > 0 || this.kb.t > 0 || this.hookT > 0) return;
    const P = G.player; this.fcd -= dt; this.ccd -= dt;
    if (this.fcd <= 0 && this.state !== 'swoop') { this.fcd = this.hp <= 3 ? 1.7 : 2.5; SFX.shoot(); const a = Math.atan2(P.y - this.y, P.x - this.x); for (const o of [-0.4, 0, 0.4]) { const s = new CrystalShard(this.x, this.y - 12, a + o); s.room = this.room; G.area.ents.push(s); } }
    if (this.ccd <= 0) { this.ccd = 8; const n = G.area.ents.filter(e => e instanceof Bat && !(e instanceof BigBat) && !e.dead && e.room === this.room).length;
      if (n < 2) { SFX.roar(); for (const dx of [-30, 30].slice(0, 2 - n)) { const b = new Bat(this.x + dx, this.y, this.room); b.sx = b.x; b.sy = b.y; G.area.ents.push(b); } } }
    if (this.state === 'swoop') { this.x += this.vx * dt * 0.4; this.y += this.vy * dt * 0.4; this.clampArea(G); }
  }
  draw() {
    ctx.save(); ctx.translate(this.x, this.y); ctx.scale(1.9, 1.9); ctx.translate(-this.x, -this.y);
    const al = this.alt; this.alt = al / 1.9; super.draw();
    const y = this.y - this.alt + Math.sin(this.t * 10), fl = this.flash > 0; // des cristaux lui poussent sur la tête et le dos
    hi(this.x, y, false, () => { for (const [x, h] of [[-5, 7], [-1, 10], [3, 7]]) { D(x, -14 - h, 3, h, fl ? '#fff' : '#b49aff'); D(x, -14 - h, 1, h, '#fff'); } });
    this.alt = al; ctx.restore();
    if (this.hp < this.maxHp) { R(half(this.x - 12), half(this.y - this.alt - 32), 24, 2, 'rgba(7,13,31,.8)'); R(half(this.x - 12), half(this.y - this.alt - 32), 24 * Math.max(0, this.hp) / this.maxHp, 2, '#b49aff'); }
  }
}

// ---------- boss : la Taupe de fer ----------
// Elle creuse sous le sol et surgit sous le héros. Une fois sortie, le grappin lui arrache ses 3 plaques d'armure ;
// quand son cœur mécanique est à nu, on le frappe à l'arme (2 coups par sortie).
class IronMole extends Enemy {
  constructor(x, y, room) {
    super(x, y, { hp: 10, dmg: 2, room });
    this.isBoss = true; this.name = 'La Taupe de fer'; this.state = 'sleep'; this.st = 0; this.plates = 3; this.hits = 0; this.phase = 1; this.rise = 0; this.loot = null; this.w = 30; this.h = 12;
    this.poof = ['#5a5e6a', '#9a9eaa', '#ffb02e', '#3a3d48'];
  }
  get up() { return this.state === 'up'; }
  body() { const k = this.rise; return { x: this.x - 18, y: this.y - 40 * k, w: 36, h: 40 * k + 2 }; }
  get light() { return this.plates === 0 && this.rise > 0.3 ? { r: 54, c: 'rgba(255,80,60,' } : null; }
  clampArea(G) { const r = G.roomRect(); this.x = clamp(this.x, r.x + 56, r.x + r.w - 56); this.y = clamp(this.y, r.y + 90, r.y + r.h - 70); }
  wake(G) { if (this.state !== 'sleep') return; this.state = 'down'; this.st = 1; SFX.roar(); G.shake = 0.5; }
  onHook(G) {
    if (!this.up || this.plates === 0) { SFX.tink(); return true; }
    this.plates--; this.flash = 0.2; SFX.clank(); G.shake = 0.25; G.hitstop = 0.08;
    G.parts.burst(this.x, this.y - 26, 14, { c: ['#9a9eaa', '#fff', '#5a5e6a'], life: 0.6, smin: 40, smax: 120, r: 2, g: 200 });
    if (this.plates === 0) { Input.toast = { msg: 'Son cœur est à nu !', t: 1.5 }; this.st = Math.max(this.st, 2.2); }
    return true;
  }
  hit(dmg, fx, fy, G, src) {
    if (this.up && this.plates === 0 && src !== 'stone' && src !== 'frisbee') {
      this.hp -= (src === 'blast' ? 1 : dmg || 1); this.hits++; this.flash = 0.2; SFX.bossHit(); G.hitstop = 0.08; G.shake = 0.15;
      G.parts.burst(this.x, this.y - 22, 10, { c: this.poof, life: 0.4, smin: 30, smax: 90, r: 2 });
      if (this.hp <= 5 && this.phase === 1) { this.phase = 2; }
      if (this.hp <= 0) { this.state = 'dying'; this.st = 2.2; SFX.bossDie(); G.shake = 0.5; for (const e of G.area.ents) { if (e !== this && e.isEnemy && !e.dead && e.room === this.room) e.die(G); if (e.isOrb) e.dead = true; } }
      else if (this.hits >= 2) { this.state = 'sink'; this.st = 0.6; this.hits = 0; this.plates = this.phase === 2 ? 1 : 0; }
      return;
    }
    if (this.rise > 0.3 && this.state !== 'dying') { SFX.tink(); G.parts.burst(lerp(fx, this.x, 0.5), lerp(fy, this.y - 20, 0.5), 4, { c: ['#fff', '#c8ccd8'], life: 0.2, r: 1 }); }
  }
  update(dt, G) {
    this.t += dt; this.st -= dt; if (this.flash > 0) this.flash -= dt;
    const P = G.player;
    switch (this.state) {
      case 'sleep': return;
      case 'down': // sous terre : un monticule file vers le héros
        this.rise = Math.max(0, this.rise - dt * 4);
        { const a = Math.atan2(P.y - this.y, P.x - this.x), sp = this.phase === 1 ? 42 : 54; /* nettement plus lente que le héros (76) : on peut la semer */ this.x += Math.cos(a) * sp * dt; this.y += Math.sin(a) * sp * dt; this.clampArea(G); }
        if (Math.random() < dt * 25) G.parts.add({ x: this.x + rand(-10, 10), y: this.y - 2, vx: rand(-30, 30), vy: rand(-50, -10), g: 200, life: 0.5, c: pick(['#5a4434', '#7a5a44', '#3a2a20']), r: 1.5 });
        if (this.st <= 0) { this.state = 'emerge'; this.st = 0.5; SFX.dig(); G.shake = 0.3; }
        return;
      case 'emerge':
        this.rise = Math.min(1, this.rise + dt * 2.2);
        if (this.rise > 0.5 && dist(P.x, P.y, this.x, this.y) < 24) P.hurt(2, this.x, this.y, G);
        if (this.st <= 0) {
          this.state = 'up'; this.st = this.phase === 1 ? 3.4 : 2.8; this.shots = 0; this.cd = 0.8;
          if (this.phase === 2 && Math.random() < 0.6) { const rr = G.roomRect(); for (const dx of [-70, 70]) { const s = new CrystalSpider(clamp(this.x + dx, rr.x + 50, rr.x + rr.w - 50), this.y, this.room); s.respawn = true; G.area.ents.push(s); } }
        }
        return;
      case 'up':
        this.rise = 1; this.cd -= dt;
        if (this.cd <= 0 && this.shots < (this.phase === 1 ? 2 : 3)) { this.cd = 0.7; this.shots++; SFX.shoot(); const a0 = Math.atan2(P.y - this.y, P.x - this.x); for (const o of [-0.35, 0, 0.35]) { const r = new Rock(this.x, this.y - 30, a0 + o); r.room = this.room; G.area.ents.push(r); } }
        this.touch(G);
        if (this.st <= 0) { this.state = 'sink'; this.st = 0.6; }
        return;
      case 'sink':
        this.rise = Math.max(0, this.rise - dt * 2); if (this.st <= 0) { this.state = 'down'; this.st = rand(1.6, 2.4); }
        return;
      case 'dying':
        if (Math.random() < dt * 20) G.parts.burst(this.x + rand(-20, 20), this.y - rand(0, 36), 5, { c: this.poof, life: 0.5, r: 2, g: 60 });
        if (this.st <= 0) { this.dead = true; G.shake = 0.5; G.parts.burst(this.x, this.y - 16, 46, { c: ['#ffe27a', '#fff', '#ffb02e', '#9a9eaa'], life: 1.4, smin: 20, smax: 150, r: 2, drag: 1.5 }); }
        return;
    }
  }
  draw() {
    if (this.state === 'dying' && Math.floor(this.t * 20) % 2) return;
    const k = this.rise;
    // monticule de terre
    ell(this.x, this.y, 22, 6, '#2a1e16'); ell(this.x, this.y - 1, 18, 4.5, '#4a3628');
    if (this.state === 'sleep' || (this.state === 'down' && k < 0.05)) { for (let i = 0; i < 3; i++) R(half(this.x - 10 + i * 8), half(this.y - 4 - (i % 2) * 2), 3, 2, '#6a5040'); return; }
    ctx.save(); ctx.beginPath(); ctx.rect(this.x - 60, this.y - 120, 120, 120); ctx.clip();
    const fl = this.flash > 0, oy = (1 - k) * (IMG.boss_mole ? 64 : 44);
    if (IMG.boss_mole) { // sprite PixelLab : tournée vers le héros, la vapeur fume quand elle est de face
      const P = G.player, di = P ? plDir(P.x - this.x, P.y - this.y) : 0, walk = di === 0;
      drawCell('boss_mole', walk ? Math.floor(this.t * 8) % 8 : di, walk ? 1 : 0, 128, 128, this.x, this.y + oy, 0.5, { foot: 5, flash: fl });
      // les plaques d'armure qu'il reste à arracher au grappin
      const pl = (x, y, w, h) => { R(half(this.x + x), half(this.y + oy + y), w, h, fl ? '#fff' : '#6a6e7a'); R(half(this.x + x), half(this.y + oy + y), w, 1, '#c8ccd8'); R(half(this.x + x + 1), half(this.y + oy + y + 2), 1, 1, '#ffb040'); R(half(this.x + x + w - 2), half(this.y + oy + y + 2), 1, 1, '#ffb040'); R(half(this.x + x + 1), half(this.y + oy + y + h - 2), 1, 1, '#ffb040'); R(half(this.x + x + w - 2), half(this.y + oy + y + h - 2), 1, 1, '#ffb040'); };
      if (this.plates >= 3) pl(-20, -34, 8, 13);
      if (this.plates >= 2) pl(12, -34, 8, 13);
      if (this.plates >= 1) pl(-6, -24, 12, 9);
      ctx.restore(); return;
    }
    hi(this.x, this.y + oy, false, () => {
      const c1 = fl ? '#fff' : '#5a5e6a', c2 = fl ? '#fff' : '#7a7e8a', c3 = fl ? '#fff' : '#3a3d48';
      D(-32, -70, 64, 70, c1); D(-28, -78, 56, 10, c1); D(-32, -70, 64, 4, c2);
      // foreuse (nez)
      const sp = Math.floor(this.t * 20) % 3;
      D(-10, -92, 20, 16, '#c8a040'); D(-6, -102, 12, 10, '#e0b850'); D(-2, -108, 4, 6, '#fff2c0'); D(-10 + sp * 6, -92, 3, 16, '#8a6a20');
      D(-20, -66, 10, 8, '#ffcf3a'); D(10, -66, 10, 8, '#ffcf3a'); D(-17, -64, 4, 4, '#1a1008'); D(13, -64, 4, 4, '#1a1008'); // yeux
      // griffes
      D(-44, -24, 14, 8, c3); D(30, -24, 14, 8, c3); for (let i = 0; i < 3; i++) { D(-46 + i * 5, -16, 3, 6, '#c8ccd8'); D(32 + i * 5, -16, 3, 6, '#c8ccd8'); }
      // cœur mécanique
      const pulse = Math.sin(this.t * 8) > 0;
      D(-10, -44, 20, 18, '#2a0a10'); D(-7, -41, 14, 12, pulse ? '#ff5a3a' : '#c83a2a'); D(-3, -38, 6, 6, '#ffd0a0');
      // plaques d'armure (gauche, droite, devant)
      const pl = (x, w) => { D(x, -52, w, 34, '#8a8e9a'); D(x, -52, w, 3, '#c8ccd8'); D(x + 2, -46, 3, 3, '#3a3d48'); D(x + w - 5, -46, 3, 3, '#3a3d48'); D(x + 2, -26, 3, 3, '#3a3d48'); D(x + w - 5, -26, 3, 3, '#3a3d48'); };
      if (this.plates >= 3) pl(-30, 18);
      if (this.plates >= 2) pl(12, 18);
      if (this.plates >= 1) pl(-14, 28);
    });
    ctx.restore();
  }
}


// ---------- la zone : les Mines des gnomes (Montagne) — 10 salles ----------
//            .          [BOSS]        .            .
//       [ARAIGNÉES]   [GRANDE SALLE]   .            .
//        [GRAPPIN]  [CARREFOUR des wagonnets] [POTEAUX]  .
//         [ARÈNE]      [ENTRÉE]     [CAISSE]     [PUITS]
function buildMinesArea() {
  return makeDungeon({
    id: 'mines', zone: 'montagne', name: 'Les Mines des gnomes', theme: 'mine', seed: 51, rough: 0.22, moss: 200, dark: 0.3,
    bossFlag: 'boss3', heartFlag: 'heart4', potLoot: 'potMine',
    rooms: { entry: [1, 3], arena: [0, 3], crate: [2, 3], shaft: [3, 3], hub: [1, 2], grappin: [0, 2], spider: [0, 1], posts: [2, 2], hall: [1, 1], boss: [1, 0] },
    entry: 'entry', boss: 'boss',
    after(A) { A.fallVoid = true; }, // on peut tomber dans le vide : un demi-cœur, retour au bord
    links: [['entry', 'arena', { arena: true, at: 'b' }], ['entry', 'crate'], ['crate', 'shaft'], ['entry', 'hub', { key: 'minesDoor1' }], ['hub', 'grappin'], ['grappin', 'spider'], ['hub', 'posts'], ['hub', 'hall', { key: 'minesDoor2' }], ['hall', 'boss', { big: true }]],
    tiles(room) {
      const h = room('hub');
      h.rect(3, 2, 24, 2, '_'); h.rect(3, 13, 24, 2, '_');
      h.rect(3, 4, 24, 9, 'v'); h.rect(3, 6, 5, 5, '_'); h.rect(22, 6, 5, 5, '_');
      railLine(h, 11, 13, 11, 8); railLine(h, 11, 8, 6, 8); railLine(h, 11, 8, 23, 8); railLine(h, 19, 8, 19, 3);
      const p = room('posts');
      p.rect(7, 2, 20, 1, 'W'); p.rect(7, 14, 20, 1, 'W'); p.rect(7, 3, 20, 11, 'v');
      p.rect(10, 7, 4, 3, '_'); p.rect(14, 3, 4, 3, '_'); p.rect(16, 9, 11, 5, '_');
      const g = room('grappin'); g.rect(16, 3, 11, 4, 'v'); g.rect(21, 3, 6, 3, '_');
      const c = room('crate'); c.rect(18, 2, 1, 5, 'W'); c.rect(20, 2, 1, 5, 'W'); c.set(19, 2, 'W');
      for (const [x, y] of [[5, 4], [24, 4], [5, 12], [24, 12]]) room('boss').set(x, y, 'k');
      for (const [x, y] of [[6, 5], [23, 5], [6, 11], [23, 11]]) room('entry').set(x, y, 'k');
      for (const [x, y] of [[8, 5], [21, 5], [8, 11], [21, 11], [14, 8]]) room('hall').set(x, y, 'k');
      for (const [x, y] of [[10, 6], [19, 6], [10, 11], [19, 11]]) room('shaft').set(x, y, 'k');
    },
    roomDark: (room, R) => room === R.shaft ? 0.6 : null,
    arenas: { arena: arenaStd('arenaM'), posts: { flag: 'arenaMBK', onStart(G) { G.banner = { text: 'La Chauve-souris de cristal', t: 2 }; } }, boss: bossArena('boss3', 'La Taupe de fer') },
    migrate() { if (SAVE.minesBigKey) SAVE.arenaMBK = true; }, // anciennes sauvegardes : grande clé déjà prise
    make(n, L, h) {
      const { mk } = h, pot = (x, y) => h.pot(n, x, y);
      if (n === 'entry') L.push(pot(4, 13), pot(25, 13), pot(4, 3), mk(Gnome, n, 20, 9), mk(Bat, n, 9, 6));
      if (n === 'arena') { L.push(pot(4, 3), pot(25, 3), pot(25, 13)); if (!SAVE.arenaM) L.push(mk(Gnome, n, 6, 6), mk(Gnome, n, 23, 6), mk(CrystalSpider, n, 10, 11), mk(CrystalSpider, n, 19, 11), mk(CrystalSpider, n, 14, 5)); }
      if (n === 'crate') L.push(SAVE.crateM ? mk(Block, n, 19, 11) : mk(Block, n, 19, 5), mk(CrystalSpider, n, 8, 6), mk(CrystalSpider, n, 9, 11), pot(25, 13), pot(4, 13));
      if (n === 'shaft') L.push(mk(Gnome, n, 8, 8), mk(Gnome, n, 21, 8), mk(Bat, n, 14, 4), pot(3, 3), pot(26, 3), pot(3, 13), pot(26, 13));
      if (n === 'hub') L.push(mk(Bat, n, 14, 6), mk(Bat, n, 18, 10), pot(24, 2), pot(4, 2));
      if (n === 'grappin') L.push(mk(Gnome, n, 8, 5), mk(Gnome, n, 8, 11), mk(CrystalSpider, n, 20, 11), pot(4, 13), pot(4, 3));
      if (n === 'spider') L.push(mk(CrystalSpider, n, 8, 5), mk(CrystalSpider, n, 21, 5), mk(CrystalSpider, n, 8, 11), mk(CrystalSpider, n, 21, 11), pot(3, 13), pot(26, 13));
      if (n === 'posts') { L.push(pot(4, 13)); if (!SAVE.arenaMBK) L.push(mk(Bat, n, 12, 5), mk(Bat, n, 22, 6), mk(BigBat, n, 20, 7)); } // la Chauve-souris de cristal et ses chauves-souris
      if (n === 'hall') L.push(mk(Gnome, n, 5, 8), mk(Gnome, n, 24, 8), mk(CrystalSpider, n, 14, 4), pot(3, 13), pot(26, 13));
      if (n === 'boss') { if (!SAVE.boss3) { const p = h.pos(n, 240, 160); L.push(new IronMole(p.x, p.y, h.R.boss)); } L.push(pot(3, 12), pot(26, 12)); }
    },
    fixed(h) {
      const { mk, pos, at } = h, lamps = (n, pts) => pts.map(([x, y]) => [n, mk(MineLamp, n, x, y)]);
      const hx = (tx, ty) => { const p = at('hub', tx, ty); return [p.x, p.y - 4]; };
      const ST = { S: hx(11, 13), J1: hx(11, 8), J2: hx(19, 8), W: hx(6, 8), E: hx(23, 8), N: hx(19, 3) };
      const stations = { S: { x: ST.S[0], y: ST.S[1], off: [18, 2] }, W: { x: ST.W[0], y: ST.W[1], off: [-18, 2] }, E: { x: ST.E[0], y: ST.E[1], off: [18, 2] }, N: { x: ST.N[0], y: ST.N[1], off: [-18, 2] } };
      const routes = {
        S: () => SAVE.switchA ? (SAVE.switchB ? { pts: [ST.S, ST.J1, ST.J2, ST.N], to: 'N' } : { pts: [ST.S, ST.J1, ST.J2, ST.E], to: 'E' }) : { pts: [ST.S, ST.J1, ST.W], to: 'W' },
        W: () => ({ pts: [ST.W, ST.J1, ST.S], to: 'S' }), E: () => ({ pts: [ST.E, ST.J2, ST.J1, ST.S], to: 'S' }), N: () => ({ pts: [ST.N, ST.J2, ST.J1, ST.S], to: 'S' }),
      };
      const ac = pos('arena', 240, 150), gc = pos('grappin', 200, 150), cg = pos('prison', 240, 110);
      return [
        ['entry', mk(Sign, 'entry', 11, 10, [{ text: '« Mines des gnomes. Prenez le wagonnet, pas le gouffre. »' }])],
        ['arena', new Chest(ac.x, ac.y, { flag: 'minesKeyChest', reveal: 'arenaM', msg: [{ text: 'Une petite clé ! Elle ouvre une porte de ces mines.' }] })],
        ['crate', mk(Plate, 'crate', 19, 11, 'crateM')],
        ['crate', mk(Chest, 'crate', 24, 8, { flag: 'crateChest', reveal: 'crateM', msg: [{ text: 'Une petite clé, cachée sous la caisse !' }] })],
        ['crate', mk(Sign, 'crate', 13, 13, [{ text: '« Caisse coincée dans la niche. Ne pas pousser : tirer. (Reste appuyé sur A pour agripper un objet lourd.) »' }])],
        ['shaft', mk(Chest, 'shaft', 14, 8, { flag: 'minesTreasure', give: 'money:60', msg: [{ text: 'Une bourse de gnome : 60 écus !' }] })],
        ['hub', new Cart(stations, routes, 'S')],
        ['hub', mk(RailLever, 'hub', 9, 13, 'switchA', ['vers l\'ouest', 'vers l\'est'])],
        ['hub', mk(RailLever, 'hub', 25, 10, 'switchB', ['vers l\'îlot de l\'est', 'vers le nord'])],
        ['hub', mk(Sign, 'hub', 7, 14, [{ text: '« Le levier du sud choisit ouest ou est. Celui de l\'îlot de l\'est choisit l\'îlot ou le nord. »' }])],
        ['grappin', new Chest(gc.x, gc.y, { flag: 'grappinChest', give: 'grappin', big: true, msg: [{ text: 'Tu as trouvé le grappin !' }, { text: 'Bouton B : la chaîne file droit devant. Accroche-toi aux poteaux pour survoler le vide.' }, { text: 'Il attire aussi les petits ennemis, les objets… et les caisses.' }] })],
        ['grappin', mk(Post, 'grappin', 23, 4)], ['grappin', mk(Post, 'grappin', 25, 10)], // le second poteau sert au retour
        ['grappin', mk(Chest, 'grappin', 25, 3, { flag: 'grappinCoins', give: 'money:30', msg: [{ text: 'Tu as trouvé 30 écus !' }] })],
        ['spider', mk(Chest, 'spider', 14, 8, { flag: 'minesHeart', give: 'piece_coeur', big: true, msg: null })],
        ['posts', mk(Post, 'posts', 5, 10)], ['posts', mk(Post, 'posts', 12, 8)], ['posts', mk(Post, 'posts', 15, 4)], ['posts', mk(Post, 'posts', 17, 3)], ['posts', mk(Post, 'posts', 20, 10)],
        ['posts', new Shutter(h.door('posts', 'W').x, h.door('posts', 'W').y, 'h', () => G.area.arenaOn === h.R.posts)],
        ['posts', mk(Chest, 'posts', 24, 11, { flag: 'minesBigKey', give: 'bigkey:mines', big: true, reveal: 'arenaMBK', msg: [{ text: 'La grande clé des Mines ! Elle ouvre la porte de la Taupe de fer.' }] })],
        ['prison', new Cage(cg.x, cg.y, { n: 3, boss: 'boss3', drawCaptive: (x, y, t) => drawHero(Heroes.captive(1), x, y, 'down', false, t) })],
        ...lamps('entry', [[9, 3], [20, 3]]), ...lamps('arena', [[3, 8], [26, 8]]), ...lamps('crate', [[6, 3], [12, 3]]), ...lamps('shaft', [[14, 3]]),
        ...lamps('hub', [[4, 13], [25, 13], [24, 2]]), ...lamps('grappin', [[3, 8], [14, 3]]), ...lamps('posts', [[3, 4], [26, 13]]), ...lamps('spider', [[3, 3], [26, 3]]),
        ...lamps('hall', [[3, 3], [26, 3], [3, 13], [26, 13]]), ...lamps('boss', [[3, 3], [26, 3], [3, 13], [26, 13]]),
      ];
    },
  });
}
