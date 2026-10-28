'use strict';
// ---------- donjon 5 : la Tour des artificiers (pétards, mèches, murs fissurés, Chevalier de fer, Goyave) ----------

// ---------- ennemis ----------
class SkeletonKnight extends Enemy { // chevalier squelette : son bouclier pare tout ce qui vient de face
  constructor(x, y, room) { super(x, y, { hp: 3, dmg: 1, room }); this.face = 1; this.fa = Math.PI / 2; this.st = 0; this.w = 12; this.h = 6; this.loot = 'skeleton'; this.poof = ['#e8e0d0', '#a8a090', '#5a5468']; }
  hit(dmg, fx, fy, G, src) {
    const a = Math.atan2(fy - this.y, fx - this.x), front = Math.cos(a - this.fa) > 0.35 && !(this.stunT > 0);
    if (front && src !== 'blast') { SFX.tink(); this.flash = 0.05; G.parts.burst(lerp(fx, this.x, 0.6), lerp(fy, this.y - 10, 0.6), 4, { c: ['#fff', '#c8ccd8'], life: 0.2, r: 1 }); if (src === 'branch') { const P = G.player; P.kb = { x: -Math.cos(a) * -120, y: -Math.sin(a) * -120, t: 0.1 }; } return; }
    super.hit(dmg, fx, fy, G, src);
  }
  update(dt, G) {
    if (this.physics(dt, G)) return;
    this.t += dt; const P = G.player, want = Math.atan2(P.y - this.y, P.x - this.x);
    let da = want - this.fa; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; this.fa += clamp(da, -dt * 1.8, dt * 1.8);
    const d = dist(P.x, P.y, this.x, this.y), sp = d < 150 ? 30 : 0;
    moveEnt(G.area, this, Math.cos(this.fa) * sp * dt, 0, { noExit: true }); moveEnt(G.area, this, 0, Math.sin(this.fa) * sp * dt, { noExit: true });
    this.face = Math.cos(this.fa) < 0 ? -1 : 1;
    this.touch(G);
  }
  draw() {
    ell(this.x, this.y, 7, 2.5, 'rgba(0,0,0,.35)');
    const fl = this.flash > 0, f = Math.floor(this.t * 6) % 2, b = fl ? '#fff' : '#e8e0d0', d = fl ? '#fff' : '#a8a090';
    const back = Math.sin(this.fa) < -0.5;
    hi(this.x, this.y, this.face < 0, () => {
      D(-6, -12, 4, 12 - f * 2, d); D(2, -12, 4, 10 + f * 2, d);
      D(-8, -30, 16, 18, '#4a4458'); D(-6, -28, 12, 3, b); D(-6, -23, 12, 2, b); D(-6, -18, 12, 2, b);
      D(-8, -44, 16, 14, b); D(-5, -40, 4, 4, '#1a1428'); D(2, -40, 4, 4, '#1a1428'); D(-4, -33, 8, 2, '#1a1428');
      D(-10, -48, 20, 6, '#6a6478'); D(-2, -54, 4, 6, '#c83a3a'); // casque à plumet
      if (!back) { D(6, -34, 12, 22, '#7a7e8a'); D(6, -34, 12, 3, '#c8ccd8'); D(10, -28, 4, 10, '#c8a040'); } // bouclier devant
      D(-14, -36, 3, 22, '#c8ccd8'); D(-16, -18, 7, 2, '#6a4224'); // épée
    });
    if (this.stunT > 0) return;
  }
}
class Gargoyle extends Bat { // gargouille : une statue qui s'éveille quand on s'approche
  constructor(x, y, room) { super(x, y, room); this.hp = this.maxHp = 2; this.awake = false; this.loot = 'gargoyle'; this.poof = ['#5a5468', '#8a8498', '#2a2438']; }
  get solid() { return !this.awake; }
  hit(d, fx, fy, G, src) { if (!this.awake) { SFX.tink(); return; } super.hit(d, fx, fy, G, src); }
  update(dt, G) {
    if (!this.awake) { this.t += dt; if (dist(G.player.x, G.player.y, this.x, this.y) < 80) { this.awake = true; SFX.roar(); G.parts.burst(this.x, this.y - 10, 10, { c: this.poof, life: 0.5, r: 2 }); } return; }
    super.update(dt, G);
  }
  draw() {
    if (!this.awake) {
      ell(this.x, this.y, 8, 3, 'rgba(0,0,0,.4)');
      hi(this.x, this.y, false, () => { D(-12, -8, 24, 8, '#3a3448'); D(-10, -24, 20, 16, '#5a5468'); D(-16, -22, 6, 10, '#4a4458'); D(10, -22, 6, 10, '#4a4458'); D(-6, -32, 12, 10, '#6a6478'); D(-4, -28, 2, 2, '#1a1428'); D(2, -28, 2, 2, '#1a1428'); D(-6, -36, 3, 4, '#6a6478'); D(3, -36, 3, 4, '#6a6478'); });
      return;
    }
    ell(this.x, this.y, 5, 1.8, 'rgba(0,0,0,.3)');
    const f = Math.floor(this.t * 12) % 2, fl = this.flash > 0, c = fl ? '#fff' : '#5a5468', w = fl ? '#fff' : '#3a3448';
    hi(this.x, this.y - this.alt + Math.sin(this.t * 10), false, () => {
      if (f) { D(-24, -12, 16, 6, w); D(8, -12, 16, 6, w); } else { D(-22, -20, 14, 6, w); D(8, -20, 14, 6, w); }
      D(-8, -14, 16, 14, c); D(-6, -22, 12, 9, '#6a6478'); D(-4, -18, 2, 2, '#ff7a1a'); D(2, -18, 2, 2, '#ff7a1a'); D(-6, -26, 3, 4, c); D(3, -26, 3, 4, c);
    });
  }
}
class Barrel { // tonneau de poudre : explose avec un pétard (et casse tout autour)
  constructor(x, y) { this.x = x; this.y = y; this.w = 12; this.h = 6; this.solid = true; this.blastR = 14; }
  onBlast(G) { if (this.dead) return; this.dead = true; setTimeout(() => explode(G, this.x, this.y - 4, 32), 120); }
  draw() { ell(this.x, this.y, 7, 2, 'rgba(0,0,0,.35)'); hi(this.x, this.y, false, () => { D(-10, -22, 20, 22, '#7a4a24'); D(-10, -22, 20, 3, '#a06a34'); D(-10, -16, 20, 2, '#3a3d48'); D(-10, -7, 20, 2, '#3a3d48'); D(-4, -18, 8, 6, '#d83a3a'); D(-2, -17, 4, 2, '#fff'); }); }
}

// ---------- boss : le Chevalier de fer ----------
// Une armure géante. Chaque explosion de pétard près de lui fait tomber une pièce d'armure (4 en tout) ;
// une fois déshabillé, on le frappe à l'arme. Son épée balaie tout ce qui est devant lui.
class IronKnight extends Enemy {
  constructor(x, y, room) {
    super(x, y, { hp: 8, dmg: 2, room });
    this.isBoss = true; this.name = 'Le Chevalier de fer'; this.state = 'sleep'; this.st = 0; this.armor = 4; this.phase = 1; this.w = 30; this.h = 12; this.face = 1; this.blastR = 30; this.loot = null;
    this.poof = ['#9a9eaa', '#c8ccd8', '#5a5e6a', '#ffb02e'];
  }
  body() { return { x: this.x - 18, y: this.y - 60, w: 36, h: 60 }; }
  wake(G) { if (this.state !== 'sleep') return; this.state = 'walk'; this.st = 2; SFX.roar(); G.shake = 0.4; }
  onBlast(G, x, y) {
    if (this.state === 'sleep' || this.state === 'dying') return;
    if (this.armor > 0) {
      this.armor--; this.flash = 0.25; this.state = 'stagger'; this.st = 1.1; SFX.clank(); G.shake = 0.35; G.hitstop = 0.08;
      G.parts.burst(this.x, this.y - 40, 18, { c: ['#9a9eaa', '#fff', '#5a5e6a'], life: 0.8, smin: 50, smax: 140, r: 3, g: 240 });
      if (this.armor === 0) Input.toast = { msg: 'Son armure est tombée !', t: 1.6 };
    } else this.hurtBy(1, x, y, G);
  }
  hurtBy(dmg, fx, fy, G) {
    this.hp -= dmg; this.flash = 0.2; SFX.bossHit(); G.hitstop = 0.08; G.shake = 0.15;
    G.parts.burst(this.x, this.y - 30, 10, { c: this.poof, life: 0.4, smin: 30, smax: 90, r: 2 });
    if (this.hp <= 4 && this.phase === 1) { this.phase = 2; this.armor = 2; this.state = 'stagger'; this.st = 1.2; Input.toast = { msg: 'Il se rhabille avec les morceaux !', t: 1.8 }; }
    if (this.hp <= 0) { this.state = 'dying'; this.st = 2.2; SFX.bossDie(); G.shake = 0.5; for (const e of G.area.ents) { if (e !== this && e.isEnemy && !e.dead && e.room === this.room) e.die(G); if (e.isOrb) e.dead = true; } }
  }
  hit(dmg, fx, fy, G, src) {
    if (this.state === 'sleep' || this.state === 'dying') return;
    if (this.armor === 0 && src !== 'stone' && src !== 'frisbee') { this.hurtBy(dmg || 1, fx, fy, G); return; }
    SFX.tink(); G.parts.burst(lerp(fx, this.x, 0.5), lerp(fy, this.y - 30, 0.5), 4, { c: ['#fff', '#c8ccd8'], life: 0.2, r: 1 });
  }
  update(dt, G) {
    this.t += dt; this.st -= dt; if (this.flash > 0) this.flash -= dt;
    const P = G.player, d = dist(P.x, P.y, this.x, this.y), rr = G.roomRect();
    // il y a toujours des pétards à ramasser
    this.pCd = (this.pCd || 0) - dt;
    if (this.state !== 'sleep' && Inventory.ammo('petards') < 2 && this.pCd <= 0 && !G.area.ents.some(e => e.isPickup && e.kind === 'petards')) { this.pCd = 5; G.area.ents.push(Object.assign(new Pickup(rr.x + rand(80, 400), rr.y + rand(100, 220), 'petards'), { room: this.room })); }
    switch (this.state) {
      case 'sleep': return;
      case 'walk': {
        const a = Math.atan2(P.y - this.y, P.x - this.x), sp = this.phase === 1 ? 24 : 36;
        this.face = Math.cos(a) < 0 ? -1 : 1;
        moveEnt(G.area, this, Math.cos(a) * sp * dt, 0, { noExit: true }); moveEnt(G.area, this, 0, Math.sin(a) * sp * dt, { noExit: true });
        this.x = clamp(this.x, rr.x + 50, rr.x + rr.w - 50); this.y = clamp(this.y, rr.y + 90, rr.y + rr.h - 36);
        if (d < 46 && this.st <= 0) { this.state = 'wind'; this.st = 0.6; }
        if (this.phase === 2 && this.st <= -3) { this.state = 'stomp'; this.st = 0.8; }
        this.touch(G); return;
      }
      case 'wind': if (this.st <= 0) { this.state = 'slash'; this.st = 0.3; SFX.swing(); const box = { x: this.face > 0 ? this.x : this.x - 56, y: this.y - 40, w: 56, h: 50 }; if (rectHit(box, P.body())) P.hurt(2, this.x, this.y, G); } return;
      case 'slash': if (this.st <= 0) { this.state = 'walk'; this.st = 1.2; } return;
      case 'stomp': if (this.st <= 0) { this.state = 'walk'; this.st = 1.5; G.shake = 0.4; SFX.boom(); const w = new Shock(this.x, this.y, this.room); G.area.ents.push(w); } return;
      case 'stagger': if (this.st <= 0) { this.state = 'walk'; this.st = 1; } return;
      case 'dying':
        if (Math.random() < dt * 20) G.parts.burst(this.x + rand(-20, 20), this.y - rand(0, 50), 5, { c: this.poof, life: 0.5, r: 2, g: 60 });
        if (this.st <= 0) { this.dead = true; G.shake = 0.5; G.parts.burst(this.x, this.y - 30, 46, { c: ['#ffe27a', '#fff', '#c8ccd8'], life: 1.4, smin: 20, smax: 150, r: 2, drag: 1.5 }); }
        return;
    }
  }
  draw() {
    if (this.state === 'dying' && Math.floor(this.t * 20) % 2) return;
    ell(this.x, this.y, 22, 6, 'rgba(0,0,0,.45)');
    const fl = this.flash > 0, f = this.state === 'walk' ? Math.floor(this.t * 4) % 2 : 0, wob = this.state === 'stagger' ? Math.sin(this.t * 40) * 2 : 0, A = this.armor + (this.phase === 2 ? 2 : 0);
    hi(this.x + wob, this.y, this.face < 0, () => {
      const steel = fl ? '#fff' : '#9a9eaa', dark = fl ? '#fff' : '#5a5e6a', light = fl ? '#fff' : '#c8ccd8', under = fl ? '#fff' : '#3a2a4a';
      D(-16, -36, 12, 36 - f * 4, dark); D(4, -36, 12, 32 + f * 4, dark); D(-18, -4, 16, 4, '#2a2c34'); D(2, -4, 16, 4, '#2a2c34');
      D(-24, -90, 48, 56, under); // sous l'armure : un corps d'ombre
      if (this.armor >= 1 || A >= 1) { D(-26, -92, 52, 58, steel); D(-26, -92, 52, 5, light); D(-4, -88, 8, 50, dark); }        // plastron
      if (this.armor >= 2) { D(-38, -96, 18, 16, steel); D(-38, -96, 18, 3, light); }                                           // épaulière
      if (this.armor >= 3) { D(20, -96, 18, 16, steel); D(20, -96, 18, 3, light); }                                             // épaulière
      if (this.armor >= 4) { D(-16, -124, 32, 32, steel); D(-16, -124, 32, 4, light); D(-12, -110, 24, 4, '#1a1428'); D(-2, -132, 4, 10, '#c83a3a'); } // heaume
      else { D(-12, -118, 24, 26, under); D(-8, -108, 5, 5, '#ff5a3a'); D(4, -108, 5, 5, '#ff5a3a'); }                          // tête d'ombre
      // épée
      const up = this.state === 'wind', sl = this.state === 'slash';
      if (sl) { D(26, -60, 70, 8, light); D(26, -60, 70, 2, '#fff'); D(20, -64, 8, 16, '#c8a040'); }
      else if (up) { D(30, -150, 8, 70, light); D(26, -84, 16, 6, '#c8a040'); }
      else { D(30, -80, 8, 70, light); D(26, -84, 16, 6, '#c8a040'); }
      D(-44, -78, 14, 34, dark); // bras gauche
    });
    if (this.state === 'stagger') for (let i = 0; i < 3; i++) { const a = this.t * 5 + i * 2.1; R(half(this.x + Math.cos(a) * 14), half(this.y - 66 + Math.sin(a) * 3), 2, 2, i % 2 ? '#ffe27a' : '#fff'); }
  }
}
class Shock { // onde de choc au sol (Chevalier de fer, phase 2) : on la saute en roulant ou on s'en éloigne
  constructor(x, y, room) { this.x = x; this.y = y; this.room = room; this.r = 8; this.w = 4; this.h = 4; this.ground = true; this.isOrb = true; }
  update(dt, G) { this.r += 110 * dt; if (this.r > 150) { this.dead = true; return; } const P = G.player, d = dist(P.x, P.y, this.x, this.y); if (Math.abs(d - this.r) < 5) P.hurt(1, this.x, this.y, G); }
  draw() { ctx.globalAlpha = clamp(1 - this.r / 150, 0, 1); ctx.strokeStyle = '#ffb02e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(this.x, this.y, this.r, this.r * 0.55, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
}

// ---------- la zone ----------
//              [ ]         [BOSS]          [ ]
//          [TORCHES]   [MÈCHE (carrefour)] [BOULETS]
//          [ARÈNE]        [ENTRÉE]        [PÉTARDS]
const TOWER_ROOMS = { boss: 1, torches: 3, hub: 4, balls: 5, arena: 6, entry: 7, petards: 8 };
function buildTower() {
  return buildDungeon({
    cols: 3, rows: 3, seed: 83, rough: 0.18, moss: 60,
    rooms: [[1, 2], [0, 2], [2, 2], [1, 1], [0, 1], [2, 1], [1, 0]],
    links: [[0, 2, 'E'], [1, 2, 'E'], [1, 2, 'N'], [0, 1, 'E'], [1, 1, 'E'], [1, 1, 'N']],
    exit: [1, 2],
    decorate(room) {
      const b = room(2, 1); for (let x = 5; x < 26; x++) { b.set(x, 5, 'W'); b.set(x, 10, 'W'); } b.rect(23, 5, 2, 1, '_'); b.rect(5, 10, 2, 1, '_'); // couloirs des boulets
      for (const [x, y] of [[6, 4], [23, 4], [6, 12], [23, 12]]) room(1, 2).set(x, y, 'k');
      for (const [x, y] of [[5, 5], [24, 5], [5, 11], [24, 11]]) room(1, 0).set(x, y, 'k');
      const t = room(0, 1); t.rect(9, 3, 12, 1, 'W'); t.rect(9, 3, 1, 4, 'W'); t.rect(20, 3, 1, 4, 'W');
    },
  });
}
function buildTowerArea() {
  const A = new Area('tower', buildTower(), 'tower'), R = TOWER_ROOMS;
  A.rooms = { cols: 3, rows: 3, list: [R.entry, R.arena, R.petards, R.hub, R.torches, R.balls, R.boss] };
  A.map = { title: 'La Tour des artificiers', links: [[R.entry, R.arena], [R.entry, R.petards], [R.entry, R.hub], [R.hub, R.torches], [R.hub, R.balls], [R.hub, R.boss]], boss: R.boss, bossFlag: 'boss5' };
  const rxy = i => [i % 3, Math.floor(i / 3)];
  const at = (room, tx, ty) => { const [rx, ry] = rxy(room); return T(rx, ry, tx, ty); };
  const pos = (room, x, y) => { const [rx, ry] = rxy(room); return { x: rx * ROOM_W + x, y: ry * ROOM_H + y }; };
  const mk = (C, room, tx, ty, ...args) => { const p = at(room, tx, ty); return new C(p.x, p.y, ...args); };
  const pot = (room, tx, ty) => Object.assign(mk(Pot, room, tx, ty), { loot: 'potTower' });
  A.arenas = {
    [R.arena]: { flag: 'arenaR' },
    [R.boss]: {
      flag: 'boss5',
      onStart(G) { const b = G.area.ents.find(e => e.isBoss); if (b) b.wake(G); G.banner = { text: 'Le Chevalier de fer', t: 2.2 }; },
      onClear(G) { const p = pos(R.boss, 240, 170); const h = Object.assign(new HeartContainer(p.x, p.y), { flag: 'heart6' }); h.room = R.boss; G.area.ents.push(h); },
    },
  };
  A.roomDark = room => room === R.boss && SAVE.boss5 ? 0.12 : null;
  A.makeRoom = function (room) {
    const L = [];
    if (room === R.entry) L.push(pot(room, 4, 13), pot(room, 25, 13), mk(SkeletonKnight, room, 20, 9), mk(Gargoyle, room, 9, 6));
    if (room === R.arena) { L.push(pot(room, 4, 3), pot(room, 25, 13)); if (!SAVE.arenaR) L.push(mk(SkeletonKnight, room, 8, 6), mk(SkeletonKnight, room, 21, 6), mk(Gargoyle, room, 6, 11), mk(Gargoyle, room, 23, 11)); }
    if (room === R.petards) L.push(mk(Gargoyle, room, 8, 5), mk(Gargoyle, room, 21, 5), pot(room, 4, 13), pot(room, 25, 13), pot(room, 25, 3));
    if (room === R.hub) L.push(mk(SkeletonKnight, room, 20, 6), pot(room, 25, 13), pot(room, 25, 3), mk(Barrel, room, 22, 10), mk(Barrel, room, 12, 4));
    if (room === R.torches) L.push(mk(SkeletonKnight, room, 6, 11), mk(Gargoyle, room, 24, 10), pot(room, 4, 13), pot(room, 25, 13));
    if (room === R.balls) L.push(pot(room, 26, 3), pot(room, 26, 13), mk(Gargoyle, room, 4, 13));
    if (room === R.boss) { if (!SAVE.boss5) { const p = pos(R.boss, 240, 150); L.push(new IronKnight(p.x, p.y, R.boss)); } L.push(pot(room, 3, 12), pot(room, 26, 12), pot(room, 3, 4), pot(room, 26, 4)); }
    return L;
  };
  A.spawn = function () {
    this.ents = [];
    const door = (room, side) => side === 'N' ? pos(room, 240, 32) : side === 'S' ? pos(room, 240, 272) : side === 'E' ? pos(room, 464, 144) : pos(room, 16, 144);
    const arenaShut = room => () => G.area.arenaOn === room;
    const dN = door(R.entry, 'N'), dE = door(R.entry, 'E'), dA = door(R.arena, 'E'), dW = door(R.torches, 'E'), dB = door(R.hub, 'N'), dS = door(R.boss, 'S');
    const ac = pos(R.arena, 240, 150), pc = pos(R.petards, 240, 150), cg = pos(R.boss, 240, 66), tc = pos(R.torches, 240, 100);
    const hp = (tx, ty) => { const p = at(R.hub, tx, ty); return [p.x, p.y - 4]; };
    placeFixed(this, [
      [R.entry, new CrackedWall(dN.x, dN.y, 'towerWall1')],
      [R.entry, new KeyDoor(dE.x, dE.y, 'towerDoor1')],
      [R.entry, mk(Sign, R.entry, 11, 10, [{ text: '« Tour des artificiers. Nos murs sont solides… sauf ceux qui sont fendus. »' }])],
      [R.arena, new Shutter(dA.x, dA.y, 'h', arenaShut(R.arena))],
      [R.arena, new Chest(ac.x, ac.y, { flag: 'towerKeyChest', reveal: 'arenaR', msg: [{ text: 'Une petite clé ! Elle ouvre une porte de cette tour.' }] })],
      [R.petards, new Chest(pc.x, pc.y, { flag: 'petardsChest', give: 'petards', big: true, msg: [{ text: 'Tu as trouvé les pétards ! Et 10 pétards pour commencer.' }, { text: 'Bouton B : en marchant, tu le lances ; à l\'arrêt, tu le poses. Boum après un instant : éloigne-toi !' }, { text: 'Les murs fendus, les rochers et les mèches n\'attendent que ça.' }] })],
      [R.hub, new Fuse([hp(18, 13), hp(10, 13), hp(10, 9), hp(5, 9), hp(5, 8), hp(3, 8)], 'fuseT')],
      [R.hub, new Shutter(pos(R.hub, 16, 144).x, pos(R.hub, 16, 144).y, 'h', () => !SAVE.fuseT)],
      [R.hub, mk(Sign, R.hub, 19, 13, [{ text: '« Mèche de la porte ouest. Allumer, puis reculer. »' }])],
      [R.hub, new KeyDoor(dB.x, dB.y, 'towerDoor2')],
      [R.torches, new Torch(tc.x - 16, tc.y, 'torchesT')], [R.torches, new Torch(tc.x + 16, tc.y, 'torchesT')], [R.torches, new Torch(tc.x, tc.y - 16, 'torchesT')],
      [R.torches, new Chest(pos(R.torches, 240, 210).x, pos(R.torches, 240, 210).y, { flag: 'towerBossKey', reveal: 'torchesT', msg: [{ text: 'Une petite clé ! Celle de la porte du haut, sûrement.' }] })],
      [R.torches, mk(Sign, R.torches, 8, 12, [{ text: '« Trois torches, une seule étincelle. »' }])],
      [R.balls, new Blade(pos(R.balls, 80, 112).x, pos(R.balls, 80, 112).y, 1, 0, 320, 90, 'ball')],
      [R.balls, new Blade(pos(R.balls, 400, 208).x, pos(R.balls, 400, 208).y, -1, 0, 320, 110, 'ball')],
      [R.balls, mk(Chest, R.balls, 14, 3, { flag: 'towerCoins', give: 'quart_coeur', big: true, msg: [{ text: 'Un cœur de cristal ! Ta vie maximale augmente d\'un cœur.' }] })],
      [R.boss, new Shutter(dS.x, dS.y, 'v', arenaShut(R.boss))],
      [R.boss, new Cage(cg.x, cg.y, { n: 5, boss: 'boss5', drawCaptive: (x, y) => { const im = IMG.npc_dog_down; if (im) ctx.drawImage(im, half(x - im.width / 5.2), half(y - im.height / 2.6), im.width / 2.6, im.height / 2.6); } })],
      ...[[R.entry, 3, 3], [R.entry, 26, 3], [R.arena, 14, 3], [R.petards, 3, 3], [R.petards, 26, 8], [R.hub, 26, 3], [R.torches, 3, 3], [R.balls, 3, 3], [R.boss, 4, 3], [R.boss, 25, 3]].map(([r, x, y]) => [r, mk(Brazier, r, x, y)]),
    ]);
    if (SAVE.boss5 && !SAVE.heart6) { const p = pos(R.boss, 240, 170); placeFixed(this, [[R.boss, Object.assign(new HeartContainer(p.x, p.y), { flag: 'heart6' })]]); }
    for (const r of this.rooms.list) spawnRoom(this, r);
  };
  const st = T(1, 2, 14, 12);
  A.start = { x: st.x + 8, y: st.y, dir: 'up' };
  A.exits = { E: G => G.enter('lac', G.areas.lac.fromTower) };
  A.name = 'La Tour des artificiers';
  A.dark = 0.34;
  return A;
}
