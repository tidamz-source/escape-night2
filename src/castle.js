'use strict';
// ---------- donjon 6 : le Château de Minuit (horloges, 5 ailes, Chevalier Minuit = Papa, le Roi Minuit, la fin) ----------

// Papa, dessiné depuis les planches d'Escape Night (9 images par direction : 0 = immobile, 1 à 8 = marche)
function drawPapa(x, y, dir, moving, t, o = {}) {
  const im = IMG['npc_papa_' + dir]; if (!im) { R(x - 6, y - 40, 12, 40, '#4a6a9a'); return; }
  const fw = im.width / 9, fh = im.height, f = moving ? 1 + Math.floor(t * 10) % 8 : 0, s = o.s || 0.5, w = fw * s, h = fh * s;
  ctx.save(); if (o.alpha != null) ctx.globalAlpha = o.alpha;
  ctx.drawImage(im, f * fw, 0, fw, fh, half(x - w / 2), half(y - h), w, h);
  if (o.tint) { // envoûté : voile violet par-dessus le sprite
    const c = G.tintC || (G.tintC = document.createElement('canvas')); c.width = Math.ceil(fw); c.height = fh; const x2 = c.getContext('2d');
    x2.clearRect(0, 0, c.width, c.height); x2.drawImage(im, f * fw, 0, fw, fh, 0, 0, fw, fh); x2.globalCompositeOperation = 'source-atop'; x2.fillStyle = o.tint; x2.fillRect(0, 0, c.width, c.height); x2.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = (o.alpha != null ? o.alpha : 1) * 0.72; ctx.drawImage(c, 0, 0, fw, fh, half(x - w / 2), half(y - h), w, h);
  }
  ctx.restore();
}

// ---------- mini-boss : le Chevalier Minuit (Papa ensorcelé) ----------
// Comme dans Escape Night, Papa fonce sur les enfants. S'il percute un mur, il est sonné : c'est le moment de frapper son armure.
// Le frisbee ou le grappin le sonnent aussi un court instant.
class MidnightKnight extends Enemy {
  constructor(x, y, room) {
    super(x, y, { hp: 9, dmg: 2, room });
    this.isBoss = true; this.name = 'Le Chevalier Minuit'; this.state = 'sleep'; this.st = 0; this.dir = 'down'; this.phase = 1; this.hits = 0; this.w = 16; this.h = 8; this.loot = null; this.vx = 0; this.vy = 0;
    this.poof = ['#3a2a6a', '#c3b3ff', '#fff', '#1a1030'];
  }
  body() { return { x: this.x - 10, y: this.y - 46, w: 20, h: 46 }; }
  get light() { return this.state === 'dizzy' ? { r: 40, c: 'rgba(255,230,140,' } : { r: 36, c: 'rgba(160,120,255,' }; }
  wake(G) { if (this.state !== 'sleep') return; this.state = 'walk'; this.st = 1.5; SFX.roar(); }
  stunBy(G, t) { if (this.state === 'dying' || this.state === 'sleep') return; this.state = 'dizzy'; this.st = t; this.hits = 0; SFX.stun(); }
  onFrisbee(G) { if (this.state !== 'dizzy') this.stunBy(G, 1.6); }
  onHook(G) { if (this.state !== 'dizzy') this.stunBy(G, 1.6); return true; }
  hit(dmg, fx, fy, G, src) {
    if (this.state === 'dizzy' && src !== 'stone' && src !== 'frisbee') {
      this.hp -= dmg || 1; this.hits++; this.flash = 0.2; SFX.bossHit(); G.hitstop = 0.08; G.shake = 0.15;
      G.parts.burst(this.x, this.y - 24, 10, { c: this.poof, life: 0.4, smin: 30, smax: 90, r: 2 });
      if (this.hp <= 4 && this.phase === 1) this.phase = 2;
      if (this.hp <= 0) { this.state = 'dying'; this.st = 1.6; SFX.bossDie(); G.shake = 0.4; for (const e of G.area.ents) { if (e.isOrb) e.dead = true; } }
      else if (this.hits >= 3) { this.state = 'walk'; this.st = 1; }
      return;
    }
    if (this.state !== 'sleep' && this.state !== 'dying') { SFX.tink(); G.parts.burst(lerp(fx, this.x, 0.5), lerp(fy, this.y - 24, 0.5), 4, { c: ['#fff', '#c3b3ff'], life: 0.2, r: 1 }); }
  }
  update(dt, G) {
    this.t += dt; this.st -= dt; if (this.flash > 0) this.flash -= dt;
    const P = G.player, a = Math.atan2(P.y - this.y, P.x - this.x);
    const face = (vx, vy) => { this.dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 'left' : 'right') : (vy < 0 ? 'up' : 'down'); };
    switch (this.state) {
      case 'sleep': return;
      case 'walk': {
        const sp = this.phase === 1 ? 34 : 46; this.vx = Math.cos(a) * sp; this.vy = Math.sin(a) * sp; face(this.vx, this.vy);
        moveEnt(G.area, this, this.vx * dt, 0, { noExit: true }); moveEnt(G.area, this, 0, this.vy * dt, { noExit: true });
        if (this.phase === 2) { this.cd = (this.cd || 2) - dt; if (this.cd <= 0) { this.cd = 2.2; SFX.shoot(); for (const o of [-0.3, 0, 0.3]) { const b = new Orb(this.x, this.y - 30, a + o); b.room = this.room; G.area.ents.push(b); } } }
        if (this.st <= 0) { this.state = 'aim'; this.st = 0.55; this.ca = a; face(Math.cos(a), Math.sin(a)); SFX.roar(); }
        this.touch(G); return;
      }
      case 'aim': if (this.st <= 0) { this.state = 'charge'; this.st = 1.4; } return;
      case 'charge': {
        const sp = this.phase === 1 ? 210 : 250;
        const h1 = moveEnt(G.area, this, Math.cos(this.ca) * sp * dt, 0, { noExit: true }), h2 = moveEnt(G.area, this, 0, Math.sin(this.ca) * sp * dt, { noExit: true });
        if (Math.random() < dt * 30) G.parts.add({ x: this.x + rand(-6, 6), y: this.y - 2, vy: -10, life: 0.3, c: '#6a5aa0', r: 1.5 });
        this.touch(G);
        if (h1 || h2) { this.stunBy(G, this.phase === 1 ? 3 : 2.4); G.shake = 0.4; SFX.boom(); G.parts.burst(this.x, this.y - 20, 14, { c: ['#fff', '#c8ccd8', '#8a8498'], life: 0.5, r: 2 }); }
        else if (this.st <= 0) { this.state = 'walk'; this.st = rand(1.2, 2); }
        return;
      }
      case 'dizzy': if (this.st <= 0) { this.state = 'walk'; this.st = 1.4; } return;
      case 'dying': if (this.st <= 0) { this.dead = true; G.parts.burst(this.x, this.y - 24, 40, { c: ['#c3b3ff', '#fff', '#ffe27a'], life: 1.2, smin: 20, smax: 120, r: 2, drag: 1.5 }); const p = new PapaNPC(this.x, this.y); p.room = this.room; G.area.ents.push(p); } return;
    }
  }
  draw() {
    if (this.state === 'dying' && Math.floor(this.t * 16) % 2) return;
    ell(this.x, this.y, 9, 3, 'rgba(0,0,0,.4)');
    const moving = this.state === 'walk' || this.state === 'charge', wob = this.state === 'aim' ? Math.sin(this.t * 50) : 0;
    drawPapa(this.x + wob, this.y, this.dir, moving, this.t * (this.state === 'charge' ? 2 : 1), { tint: this.flash > 0 ? '#ffffff' : '#2a1a5a' });
    // heaume et cape de minuit
    hi(this.x + wob, this.y, false, () => { D(-14, -96, 28, 18, '#1a1030'); D(-14, -96, 28, 3, '#4a3a7a'); D(-10, -86, 20, 3, '#c3b3ff'); D(-2, -104, 4, 8, '#c3b3ff'); D(-18, -78, 36, 6, '#2a1d4a'); });
    if (this.state === 'dizzy') for (let i = 0; i < 4; i++) { const a = this.t * 5 + i * Math.PI / 2; R(half(this.x + Math.cos(a) * 12), half(this.y - 54 + Math.sin(a) * 3), 2, 2, i % 2 ? '#ffe27a' : '#fff'); }
    if (this.state === 'aim') text('!', this.x, this.y - 64, { size: 12, align: 'center', color: PAL.red, bold: true });
  }
}
class PapaNPC { // Papa, délivré (dans la salle du Chevalier Minuit)
  constructor(x, y) { this.x = x; this.y = y; this.w = 12; this.h = 6; this.solid = true; this.t = 0; }
  canInteract() { return true; }
  interact(G) { if (this.talkId) { G.say(Story.talk(this.talkId)); return; } G.say(Story.lines([{ who: 'Papa', text: SAVE.papaFreed ? 'Le Roi est dans la salle d\'à côté. Je te suis, {hero}.' : 'Ouh là… ma tête.', faceOf: 'papa' }])); }
  update(dt) { this.t += dt; }
  draw() { ell(this.x, this.y, 8, 3, 'rgba(0,0,0,.35)'); drawPapa(this.x, this.y, 'down', false, this.t); }
}

// ---------- le Roi Minuit ----------
class KingCrystal { // cristal d'ombre qui protège le Roi : à briser de loin
  constructor(king, i) { this.king = king; this.i = i; this.x = king.x; this.y = king.y; this.w = 10; this.h = 6; this.alt = 16; this.t = 0; this.room = king.room; }
  get light() { return { r: 30, c: 'rgba(160,120,255,' }; }
  body() { return { x: this.x - 7, y: this.y - this.alt - 16, w: 14, h: 18 }; }
  hit(d, fx, fy, G, src) {
    if (src !== 'stone' && src !== 'frisbee') { SFX.tink(); return; }
    this.dead = true; SFX.crystal(); G.parts.burst(this.x, this.y - this.alt - 8, 16, { c: ['#c3b3ff', '#fff', '#6a5aa0'], life: 0.6, smin: 30, smax: 90, r: 2 });
  }
  update(dt, G) {
    this.t += dt; const k = this.king; if (k.dead || k.state === 'dying') { this.dead = true; return; }
    const a = this.t * 1.4 + this.i * Math.PI / 2; this.x = k.x + Math.cos(a) * 46; this.y = k.y + Math.sin(a) * 22;
  }
  draw() {
    ell(this.x, this.y, 4, 1.5, 'rgba(0,0,0,.3)');
    hi(this.x, this.y - this.alt + Math.sin(this.t * 3) * 2, false, () => { D(-6, -24, 12, 20, '#6a5aa0'); D(-4, -30, 8, 6, '#6a5aa0'); D(-6, -24, 4, 18, '#c3b3ff'); D(2, -20, 4, 16, '#3a2a6a'); });
  }
}
class DarkBomb { // tache d'ombre au sol qui explose (Roi Minuit, phase 3)
  constructor(x, y, room) { this.x = x; this.y = y; this.room = room; this.t = 0; this.w = 4; this.h = 4; this.ground = true; this.isOrb = true; }
  update(dt, G) {
    this.t += dt;
    if (this.t > 1.3) { this.dead = true; G.parts.burst(this.x, this.y - 4, 16, { c: ['#1a1030', '#6a5aa0', '#c3b3ff'], life: 0.5, smin: 30, smax: 90, r: 2 }); SFX.hit(); const P = G.player; if (dist(P.x, P.y, this.x, this.y) < 20) P.hurt(1, this.x, this.y, G); }
  }
  draw() { const k = Math.min(1, this.t / 1.3); ctx.globalAlpha = 0.3 + 0.5 * k; ell(this.x, this.y, 18 * k + 4, 8 * k + 2, '#1a1030'); ctx.globalAlpha = 1; ctx.strokeStyle = '#c3b3ff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(this.x, this.y, 20, 9, 0, 0, 7); ctx.stroke(); }
}
// Phase 1 : quatre cristaux le protègent (lance-pierre ou frisbee) ; brisés, il tombe et on peut le frapper.
// Phase 2 : un bouclier d'ombre pare tout ; le grappin le lui arrache.
// Phase 3 : il s'envole et sème des taches d'ombre ; un frisbee le fait tomber, Papa l'attrape et le tient.
class MidnightKing extends Enemy {
  constructor(x, y, room) {
    super(x, y, { hp: 18, dmg: 2, room });
    this.isBoss = true; this.name = 'Le Roi Minuit'; this.state = 'sleep'; this.st = 0; this.phase = 1; this.alt = 18; this.w = 20; this.h = 10; this.hits = 0; this.shield = true; this.loot = null; this.noFreeze = true; this.cx = x; this.cy = y;
    this.poof = ['#1a1030', '#6a5aa0', '#c3b3ff', '#ffe27a'];
  }
  body() { return { x: this.x - 14, y: this.y - this.alt - 50, w: 28, h: 50 }; }
  get light() { return { r: 60, c: 'rgba(160,120,255,' }; }
  get vulnerable() { return this.state === 'down' || this.state === 'held' || (this.phase === 2 && !this.shield && this.state === 'float'); }
  wake(G) { if (this.state !== 'sleep') return; this.state = 'float'; this.st = 2; this.spawnCrystals(G); SFX.roar(); G.shake = 0.5; }
  spawnCrystals(G) { for (let i = 0; i < 4; i++) G.area.ents.push(new KingCrystal(this, i)); }
  onHook(G) {
    if (this.phase === 2 && this.shield && this.state === 'float') { this.shield = false; this.st = 3.6; SFX.clank(); G.shake = 0.3; G.parts.burst(this.x, this.y - 30, 18, { c: ['#1a1030', '#c3b3ff'], life: 0.6, r: 2 }); Input.toast = { msg: 'Bouclier arraché !', t: 1.4 }; }
    else SFX.tink();
    return true;
  }
  onFrisbee(G) { if (this.phase === 3 && this.state === 'fly') { this.state = 'fall'; this.st = 0.5; SFX.stun(); G.shake = 0.3; } else SFX.tink(); }
  hit(dmg, fx, fy, G, src) {
    if (this.vulnerable && src !== 'stone' && src !== 'frisbee') {
      this.hp -= dmg || 1; this.flash = 0.2; SFX.bossHit(); G.hitstop = 0.08; G.shake = 0.15; this.hits++;
      G.parts.burst(this.x, this.y - this.alt - 26, 10, { c: this.poof, life: 0.4, smin: 30, smax: 90, r: 2 });
      const want = this.hp <= 0 ? 4 : this.hp <= 6 ? 3 : this.hp <= 12 ? 2 : 1;
      if (this.hp <= 0) { this.state = 'dying'; this.st = 2.6; SFX.bossDie(); G.shake = 0.6; for (const e of G.area.ents) { if (e !== this && e.isEnemy && !e.dead && e.room === this.room) e.die(G); if (e.isOrb) e.dead = true; } return; }
      if (want !== this.phase) {
        this.phase = want; this.state = 'float'; this.st = 1.5; this.alt = 18; this.shield = true; this.hits = 0; SFX.roar(); G.shake = 0.4;
        G.say(Story.script(want === 2 ? 'king2' : 'king3'));
        if (want === 3) this.state = 'fly';
      }
      return;
    }
    if (this.state !== 'sleep' && this.state !== 'dying') { SFX.tink(); G.parts.burst(lerp(fx, this.x, 0.5), lerp(fy, this.y - 30, 0.5), 4, { c: ['#fff', '#c3b3ff'], life: 0.2, r: 1 }); }
  }
  update(dt, G) {
    this.t += dt; this.st -= dt; if (this.flash > 0) this.flash -= dt;
    const P = G.player, rr = G.roomRect(), a = Math.atan2(P.y - this.y, P.x - this.x);
    // munitions : il y a toujours de quoi tirer
    this.aCd = (this.aCd || 0) - dt;
    if (this.state !== 'sleep' && this.aCd <= 0 && Inventory.ammo('cailloux') < 3 && !G.area.ents.some(e => e.isPickup && e.kind === 'stones')) { this.aCd = 5; G.area.ents.push(Object.assign(new Pickup(rr.x + rand(80, 400), rr.y + rand(150, 220), 'stones'), { room: this.room })); }
    switch (this.state) {
      case 'sleep': return;
      case 'float': {
        if (this.phase === 1) {
          this.x = lerp(this.x, rr.x + 240 + Math.cos(this.t * 0.6) * 90, dt); this.y = lerp(this.y, rr.y + 120 + Math.sin(this.t * 0.9) * 20, dt);
          this.cd = (this.cd || 2) - dt; if (this.cd <= 0) { this.cd = 2.6; SFX.shoot(); for (let i = 0; i < 8; i++) { const o = new Orb(this.x, this.y - 40, i / 8 * Math.PI * 2 + this.t); o.room = this.room; G.area.ents.push(o); } }
          if (!G.area.ents.some(e => e instanceof KingCrystal && !e.dead)) { this.state = 'down'; this.st = 3.5; this.alt = 0; G.shake = 0.3; SFX.stun(); }
        } else if (this.phase === 2) {
          if (this.st <= 0) { // téléportation
            if (!this.shield) this.shield = true;
            this.x = rr.x + rand(80, 400); this.y = rr.y + rand(110, 200); this.st = 3; SFX.rift(); G.parts.burst(this.x, this.y - 30, 20, { c: this.poof, life: 0.6, r: 2 });
            if (Math.random() < 0.5) { const s = new Shadow(clamp(this.x + rand(-60, 60), rr.x + 60, rr.x + rr.w - 60), this.y, this.room); s.respawn = true; G.area.ents.push(s); }
          }
          this.cd = (this.cd || 1.5) - dt; if (this.cd <= 0 && this.shield) { this.cd = 1.6; SFX.shoot(); for (const o of [-0.2, 0.2]) { const b = new Orb(this.x, this.y - 40, a + o); b.room = this.room; G.area.ents.push(b); } }
        }
        this.touch(G); return;
      }
      case 'down': if (this.st <= 0) { this.state = 'float'; this.alt = 18; this.st = 2; if (this.phase === 1) this.spawnCrystals(G); } return;
      case 'fly': {
        this.alt = lerp(this.alt, 46, dt * 2);
        this.x = lerp(this.x, rr.x + 240 + Math.cos(this.t * 0.9) * 150, dt * 1.5); this.y = lerp(this.y, rr.y + 140 + Math.sin(this.t * 1.3) * 50, dt * 1.5);
        this.cd = (this.cd || 1) - dt; if (this.cd <= 0) { this.cd = 0.9; G.area.ents.push(Object.assign(new DarkBomb(P.x + rand(-20, 20), P.y + rand(-10, 10), this.room))); }
        return;
      }
      case 'fall': this.alt = lerp(this.alt, 0, Math.min(1, dt * 10)); if (this.st <= 0) { this.alt = 0; this.state = 'held'; this.st = 3.8; G.shake = 0.3; } return;
      case 'held': if (this.st <= 0) { this.state = 'fly'; this.st = 1; SFX.roar(); } return;
      case 'dying':
        if (Math.random() < dt * 25) G.parts.burst(this.x + rand(-20, 20), this.y - rand(0, 50), 6, { c: ['#ffe27a', '#fff', '#c3b3ff'], life: 0.6, r: 2, g: 40 });
        if (this.st <= 0) { this.dead = true; G.flashT = 0.4; }
        return;
    }
  }
  draw() {
    if (this.state === 'dying' && Math.floor(this.t * 20) % 2) return;
    ell(this.x, this.y, 16, 5, 'rgba(0,0,0,.45)');
    const fl = this.flash > 0, held = this.state === 'held' || this.state === 'down', bob = held ? 0 : Math.sin(this.t * 2) * 2;
    hi(this.x, this.y - this.alt + bob, false, () => {
      const robe = fl ? '#fff' : '#1a1030', robe2 = fl ? '#fff' : '#2a1d4a', trim = '#c3b3ff';
      D(-28, -70, 56, 70, robe); D(-34, -20, 68, 20, robe); D(-28, -70, 56, 4, robe2); D(-2, -66, 4, 64, trim);
      for (let i = 0; i < 6; i++) D(-34 + i * 12, -4 + (Math.floor(this.t * 6) + i) % 2 * 3, 10, 6, robe);
      D(-14, -96, 28, 28, '#d8d0e8'); D(-14, -96, 28, 4, '#f0e8f8'); // visage pâle
      D(-9, -86, 6, 4, held ? '#3a2a4a' : '#ff3a6a'); D(3, -86, 6, 4, held ? '#3a2a4a' : '#ff3a6a'); D(-10, -76, 20, 6, '#e8e8f0'); // barbe
      D(-18, -110, 36, 14, '#c8a040'); for (let i = 0; i < 5; i++) D(-18 + i * 8, -118, 4, 8, '#c8a040'); D(-4, -108, 8, 6, '#6a5aa0'); // couronne
      D(30, -100, 5, 96, '#3a2a4a'); D(26, -112, 14, 14, '#6a5aa0'); D(29, -109, 8, 8, '#c3b3ff'); // sceptre-horloge
      if (this.phase === 2 && this.shield && !held) { D(-46, -80, 26, 64, '#0a0614'); D(-46, -80, 26, 4, '#6a5aa0'); D(-38, -56, 10, 10, '#c3b3ff'); }
    });
    if (held) for (let i = 0; i < 4; i++) { const a = this.t * 5 + i * Math.PI / 2; R(half(this.x + Math.cos(a) * 14), half(this.y - 58 + Math.sin(a) * 3), 2, 2, i % 2 ? '#ffe27a' : '#fff'); }
  }
}
class PapaAlly { // Papa, dans la salle du Roi : il suit le héros et attrape le Roi quand il tombe
  constructor(x, y) { this.x = x; this.y = y; this.w = 12; this.h = 6; this.t = 0; this.dir = 'up'; this.moving = false; }
  get dead() { return !SAVE.papaFreed; }
  update(dt, G) {
    this.t += dt; const P = G.player, k = G.area.ents.find(e => e instanceof MidnightKing && !e.dead);
    let tx = P.x - 26, ty = P.y + 10;
    if (k && (k.state === 'fall' || k.state === 'held' || k.state === 'down')) { tx = k.x + 20; ty = k.y + 4; }
    const d = dist(this.x, this.y, tx, ty); this.moving = d > 4;
    if (this.moving) { const a = Math.atan2(ty - this.y, tx - this.x), s = Math.min(d, (k && k.state === 'fall' ? 220 : 90) * dt); moveEnt(G.area, this, Math.cos(a) * s, 0, { noExit: true }); moveEnt(G.area, this, 0, Math.sin(a) * s, { noExit: true }); this.dir = Math.abs(Math.cos(a)) > 0.6 ? (Math.cos(a) < 0 ? 'left' : 'right') : (Math.sin(a) < 0 ? 'up' : 'down'); }
    else if (k && k.state === 'held') this.dir = 'left';
  }
  draw() { ell(this.x, this.y, 8, 3, 'rgba(0,0,0,.35)'); drawPapa(this.x, this.y, this.dir, this.moving, this.t); }
}


// ---------- la zone : le Château de Minuit (Terres de Minuit) — 12 salles ----------
//            .          [ROI MINUIT]        .            .
//       [ARMURERIE]  [CHEVALIER MINUIT] [GRANDE CLÉ]     .
//        [GRAPPIN]      [HALL]           [PALMES]    [FRISBEE]
//        [PÉTARDS]     [ENTRÉE]       [LANCE-PIERRE] [GALERIE]
function buildCastleArea() {
  const br = { x: 2 * RW + 10, y: 3 * RH + 7 };
  return makeDungeon({
    id: 'castle', zone: 'terres', name: 'Le Château de Minuit', theme: 'castle', seed: 97, rough: 0.15, moss: 40, dark: 0.36,
    bossFlag: 'boss6', heartFlag: 'heart7', potLoot: 'potCastle',
    rooms: { blast: [0, 3], entry: [1, 3], sling: [2, 3], gallery: [3, 3], hook: [0, 2], hall: [1, 2], swim: [2, 2], frisbee: [3, 2], armory: [0, 1], papa: [1, 1], bigkey: [2, 1], king: [1, 0] },
    entry: 'entry', boss: 'king',
    links: [['entry', 'blast'], ['entry', 'sling'], ['sling', 'gallery'], ['entry', 'hall'], ['hall', 'hook'], ['hall', 'swim'], ['swim', 'frisbee'],
      ['hall', 'papa', { seal: true }], ['papa', 'armory', { key: 'castleDoor1' }], ['papa', 'bigkey', { shut: () => !SAVE.papaFreed || G.area.arenaOn === G.area.h.R.papa }], ['papa', 'king', { big: true }]],
    tiles(room) {
      const b = room('blast'); b.rect(14, 2, 2, 13, 'W'); b.rect(14, 7, 2, 2, '_');
      const s = room('sling'); s.rect(10, 2, 5, 13, 'v');
      const h = room('hook'); h.rect(3, 2, 20, 13, 'v'); h.rect(4, 6, 7, 5, '_'); h.rect(14, 7, 4, 3, '_');
      const w = room('swim'); w.rect(5, 3, 21, 11, '~'); w.rect(13, 7, 4, 3, '_');
      const f = room('frisbee');
      f.rect(11, 2, 1, 4, 'W'); f.rect(18, 2, 1, 4, 'W'); f.rect(11, 5, 3, 1, 'W'); f.rect(16, 5, 3, 1, 'W');
      for (const [cx, cy] of [[5, 4], [24, 4]]) for (const [dx, dy] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]) f.set(cx + dx, cy + dy, 'k');
      for (const n of ['hall', 'papa', 'king', 'armory']) for (const [x, y] of [[5, 4], [24, 4], [5, 12], [24, 12]]) room(n).set(x, y, 'k');
      const g = room('gallery'); g.rect(2, 5, 26, 1, 'W'); g.rect(24, 5, 2, 1, '_'); g.rect(2, 10, 26, 1, 'W'); g.rect(3, 10, 2, 1, '_');
    },
    syncTiles() { const want = SAVE.castleBridge ? 'b' : 'v'; let ch = false; for (let y = br.y; y < br.y + 2; y++) for (let x = br.x; x < br.x + 5; x++) if (this.g[y][x] !== want) { this.g[y][x] = want; ch = true; } if (ch) this.rerender(); },
    arenas: {
      papa: { flag: 'papaFight', onStart(G) { const b = G.area.ents.find(e => e.isBoss && e.room === G.room); if (b) G.say(Story.script('papaIntro'), () => b.wake(G)); G.banner = { text: 'Le Chevalier Minuit', t: 2.2 }; }, onClear(G) { G.say(Story.script('papaFreed'), () => { Story.set('papaFreed'); }); } },
      king: { flag: 'boss6', onStart(G) { const b = G.area.ents.find(e => e.isBoss && e.room === G.room); if (b) G.say(Story.script('kingIntro'), () => b.wake(G)); G.banner = { text: 'Le Roi Minuit', t: 2.2 }; }, onClear(G) { G.finale(); } },
    },
    after(A, h) { A.roomDark = room => room === h.R.king && SAVE.boss6 ? 0.05 : null; },
    make(n, L, h) {
      const { mk } = h, pot = (x, y) => h.pot(n, x, y);
      if (n === 'entry') L.push(pot(4, 13), pot(25, 13), mk(Shadow, n, 8, 5), mk(Wisp, n, 22, 5));
      if (n === 'blast') L.push(mk(SkeletonKnight, n, 22, 6), mk(SkeletonKnight, n, 22, 11), pot(4, 13), pot(4, 3), pot(25, 13));
      if (n === 'sling') L.push(mk(Wisp, n, 20, 4), mk(Wisp, n, 22, 12), pot(4, 13), pot(4, 3));
      if (n === 'gallery') L.push(mk(Shadow, n, 14, 6), mk(Shadow, n, 14, 10), pot(26, 13));
      if (n === 'hall') L.push(mk(Shadow, n, 9, 9), mk(Shadow, n, 20, 9), mk(Gargoyle, n, 4, 8), mk(Gargoyle, n, 25, 8), pot(3, 13), pot(26, 13));
      if (n === 'hook') L.push(mk(Bat, n, 12, 4), mk(Bat, n, 18, 12), pot(26, 3));
      if (n === 'swim') L.push(mk(Eel, n, 9, 5), mk(Eel, n, 21, 11), mk(Eel, n, 20, 5));
      if (n === 'frisbee') L.push(mk(Gargoyle, n, 8, 11), mk(Gargoyle, n, 21, 11), mk(SkeletonKnight, n, 14, 10), pot(4, 13), pot(25, 13));
      if (n === 'armory') L.push(mk(SkeletonKnight, n, 10, 8), mk(SkeletonKnight, n, 19, 8), pot(3, 3), pot(26, 3), pot(3, 13), pot(26, 13), pot(14, 13));
      if (n === 'bigkey') L.push(mk(Wisp, n, 6, 4), mk(Wisp, n, 23, 4), pot(3, 13), pot(26, 13));
      if (n === 'papa') { if (!SAVE.papaFight) { const p = h.pos(n, 240, 120); L.push(new MidnightKnight(p.x, p.y, h.R.papa)); } L.push(pot(3, 12), pot(26, 12)); }
      if (n === 'king') { if (!SAVE.boss6) { const p = h.pos(n, 240, 110); L.push(new MidnightKing(p.x, p.y, h.R.king)); } L.push(pot(3, 12), pot(26, 12), pot(3, 4), pot(26, 4)); }
    },
    fixed(h) {
      const { mk, pos, door, R } = h, P = (n, x, y) => pos(n, x, y);
      const clocks = (n, pts) => pts.map(([x, y]) => [n, mk(ClockPost, n, x, y)]);
      const blade = (n, x, y, dx, dy, len, sp) => [n, new Blade(P(n, x, y).x, P(n, x, y).y, dx, dy, len, sp)];
      const altar = (n, x, y, f) => [n, mk(SealAltar, n, x, y, f)];
      const L = [
        ...clocks('entry', [[8, 10], [21, 10]]), blade('entry', 160, 96, 1, 0, 160, 120), blade('entry', 320, 60, -1, 0, 160, 100),
        ['entry', mk(Sign, 'entry', 11, 13, [{ text: '« Ici, le temps s\'arrête quand on frappe l\'horloge. »' }])],
        ['blast', new CrackedWall(P('blast', 15 * TS, 9 * TS).x, P('blast', 15 * TS, 9 * TS).y, 'castleWall')], altar('blast', 8, 8, 'sealP'),
        ['sling', mk(Crystal, 'sling', 22, 3, 'castleBridge', G => { G.area.syncTiles(); G.shake = 0.3; SFX.secret(); })], altar('sling', 21, 6, 'sealS'),
        blade('sling', 288, 64, 0, 1, 150, 110), ...clocks('sling', [[5, 4]]),
        ['sling', mk(Sign, 'sling', 6, 12, [{ text: '« Aile du tir. Le pont dort tant que le cristal dort. »' }])],
        ...clocks('gallery', [[4, 9]]), blade('gallery', 110, 136, 1, 0, 300, 150), blade('gallery', 360, 72, -1, 0, 260, 140),
        ['gallery', mk(Chest, 'gallery', 25, 3, { flag: 'castleKeyChest', msg: [{ text: 'Une petite clé ! Elle ouvre l\'armurerie.' }] })],
        ...clocks('hall', [[14, 12]]), blade('hall', 96, 144, 1, 0, 288, 90),
        ['hook', mk(Post, 'hook', 16, 8)], ['hook', mk(Post, 'hook', 9, 8)], ['hook', mk(Post, 'hook', 24, 8)], altar('hook', 6, 8, 'sealG'),
        ['swim', new DiveSpot(P('swim', 120, 210).x, P('swim', 120, 210).y, 'sealW', 'flag:sealW', [{ text: 'Au fond de l\'eau, un sceau de l\'aube !' }])],
        ['swim', mk(Sign, 'swim', 15, 9, [{ text: '« Aile de l\'eau. Ce qui brille au fond se mérite. »' }])],
        ['frisbee', mk(FrisbeeSwitch, 'frisbee', 5, 4, 'castleSw')], ['frisbee', mk(FrisbeeSwitch, 'frisbee', 24, 4, 'castleSw')],
        ['frisbee', new Shutter(P('frisbee', 240, 96).x, P('frisbee', 240, 96).y, 'v', () => !SAVE.castleSw)], altar('frisbee', 14, 3, 'sealF'),
        ['frisbee', mk(Sign, 'frisbee', 14, 12, [{ text: '« Deux lanternes en même temps, et la grille se lève. »' }])],
        ['papa', new Shutter(door('papa', 'S').x, door('papa', 'S').y, 'v', () => G.area.arenaOn === R.papa)],
        ['armory', mk(Chest, 'armory', 14, 7, { flag: 'castleHeart', give: 'quart_coeur', big: true, msg: [{ text: 'Un cœur de cristal ! Ta vie maximale augmente d\'un cœur.' }] })],
        ...clocks('bigkey', [[4, 8]]), ...[[120, 90, 1, 1], [360, 90, -1, 1], [150, 200, 1, -1], [330, 200, -1, -1]].map(([x, y, sx, sy]) => ['bigkey', new BounceBlade(P('bigkey', x, y).x, P('bigkey', x, y).y, sx, sy, 95)]),
        ['bigkey', mk(Chest, 'bigkey', 24, 8, { flag: 'castleBigKey', give: 'bigkey:castle', big: true, msg: [{ text: 'La grande clé du château ! Elle ouvre la salle du trône.' }] })],
        ['king', new Shutter(door('king', 'S').x, door('king', 'S').y, 'v', () => G.area.arenaOn === R.king)],
        ['king', new PapaAlly(P('king', 120, 220).x, P('king', 120, 220).y)],
        ...clocks('king', [[5, 8], [24, 8]]),
        ...[['entry', 3, 3], ['entry', 26, 3], ['hall', 3, 3], ['hall', 26, 3], ['blast', 3, 8], ['sling', 26, 13], ['hook', 26, 13], ['swim', 3, 3], ['frisbee', 3, 8], ['frisbee', 26, 8], ['papa', 3, 3], ['papa', 26, 3], ['king', 4, 3], ['king', 25, 3], ['armory', 3, 8], ['bigkey', 26, 3], ['gallery', 26, 13]].map(([r, x, y]) => [r, mk(Brazier, r, x, y)]),
      ];
      if (SAVE.papaFight) { const p = P('papa', 240, 140); L.push(['papa', new PapaNPC(p.x, p.y)]); }
      return L;
    },
  });
}
