'use strict';
// ---------- donjon 4 : le Temple englouti (palmes et tuba, niveau de l'eau, Reine des remous, enfant n°2) ----------

// ---------- ennemis ----------
class Crab extends Enemy { // crabe : file de côté vers le héros, pince quand il est près
  constructor(x, y, room) { super(x, y, { hp: 2, dmg: 1, room }); this.st = rand(0.5, 1.5); this.w = 14; this.h = 6; this.loot = 'crab'; this.poof = ['#d8503a', '#ff8a6a', '#fff']; }
  update(dt, G) {
    if (this.physics(dt, G)) return;
    this.t += dt; this.st -= dt; const P = G.player, d = dist(P.x, P.y, this.x, this.y);
    if (this.st <= 0) { this.st = rand(0.6, 1.2); if (d < 130) { const a = Math.atan2(P.y - this.y, P.x - this.x); this.vx = Math.cos(a) * 60; this.vy = Math.sin(a) * 40; } else { this.vx = rand(-1, 1) * 40; this.vy = 0; } }
    const h1 = moveEnt(G.area, this, this.vx * dt, 0, { noExit: true }), h2 = moveEnt(G.area, this, 0, this.vy * dt, { noExit: true }); if (h1 || h2) this.st = 0;
    this.touch(G);
  }
  draw() {
    ell(this.x, this.y, 8, 2.5, 'rgba(0,0,0,.35)');
    const fl = this.flash > 0, f = Math.floor(this.t * 12) % 2, c1 = fl ? '#fff' : '#d8503a', c2 = fl ? '#fff' : '#ff8a6a';
    hi(this.x, this.y, false, () => {
      for (let i = 0; i < 3; i++) { D(-16 + i * 3, -6 + (f ^ (i & 1)) * 2, 3, 6, '#a83a2a'); D(13 - i * 3, -6 + (f ^ (i & 1)) * 2, 3, 6, '#a83a2a'); }
      D(-12, -14, 24, 10, c1); D(-10, -16, 20, 4, c2);
      D(-22, -22, 8, 8, c1); D(14, -22, 8, 8, c1); D(-22, -24, 4, 4, c2); D(18, -24, 4, 4, c2); // pinces
      D(-5, -22, 2, 6, '#3a2a2a'); D(3, -22, 2, 6, '#3a2a2a'); D(-6, -24, 4, 3, '#fff'); D(2, -24, 4, 3, '#fff'); D(-5, -23, 2, 2, '#000'); D(3, -23, 2, 2, '#000');
    });
  }
}
class Eel extends Enemy { // anguille : sort de l'eau, crache une bulle, replonge (vulnérable quand elle est sortie)
  constructor(x, y, room) { super(x, y, { hp: 2, dmg: 1, room }); this.st = rand(1, 3); this.state = 'under'; this.up = 0; this.w = 12; this.h = 6; this.loot = 'eel'; this.poof = ['#3a8a6a', '#7fffd0', '#fff']; this.noKb = true; }
  get wet() { return G.area.tileAt(this.x, this.y - 2) === '~'; }
  body() { return { x: this.x - 7, y: this.y - 28 * this.up, w: 14, h: 28 * this.up + 2 }; }
  hit(d, fx, fy, G, src) { if (this.up < 0.5) return; super.hit(d, fx, fy, G, src); this.kb.t = 0; }
  update(dt, G) {
    if (this.flash > 0) this.flash -= dt; if (this.stunT > 0) { this.stunT -= dt; return; }
    this.t += dt; this.st -= dt; const P = G.player;
    if (!this.wet) { this.up = Math.max(0, this.up - dt * 3); return; }
    if (this.state === 'under') { this.up = Math.max(0, this.up - dt * 3); if (this.st <= 0 && dist(P.x, P.y, this.x, this.y) < 170) { this.state = 'rise'; this.st = 0.5; } }
    else if (this.state === 'rise') { this.up = Math.min(1, this.up + dt * 3); if (this.st <= 0) { this.state = 'spit'; this.st = 1.4; SFX.shoot(); const o = new Bubble(this.x, this.y - 22, Math.atan2(P.y - this.y, P.x - this.x)); o.room = this.room; G.area.ents.push(o); } }
    else if (this.st <= 0) { this.state = 'under'; this.st = rand(1.5, 3); }
    if (this.up > 0.5) this.touch(G);
  }
  draw() {
    if (this.up < 0.05) { if (this.wet && Math.sin(this.t * 4) > 0.5) R(half(this.x - 2), half(this.y - 3), 4, 1, '#cfe0ff'); return; }
    const fl = this.flash > 0, k = this.up, wv = Math.sin(this.t * 6) * 2;
    ctx.save(); ctx.beginPath(); ctx.rect(this.x - 20, this.y - 60, 40, 58); ctx.clip();
    hi(this.x + wv * 0.3, this.y + (1 - k) * 30, false, () => {
      const c1 = fl ? '#fff' : '#2a7a5a', c2 = fl ? '#fff' : '#4aaa7a';
      D(-5, -40, 10, 40, c1); D(-5, -40, 3, 40, c2); D(-8, -52, 16, 14, c1); D(-8, -52, 16, 3, c2);
      D(-6, -48, 3, 3, '#ffe27a'); D(3, -48, 3, 3, '#ffe27a'); D(-4, -42, 8, 2, '#1a3a2a');
      D(4, -38, 6, 3, '#7fffd0'); D(4, -28, 6, 3, '#7fffd0');
    });
    ctx.restore();
    ctx.globalAlpha = 0.5; ell(this.x, this.y - 1, 8, 2.5, '#cfe0ff'); ctx.globalAlpha = 1;
  }
}
class Bubble extends Orb {
  constructor(x, y, a) { super(x, y, a); this.light = { r: 18, c: 'rgba(160,220,255,' }; this.vx *= 0.9; this.vy *= 0.9; }
  draw() { const y = this.y - this.alt; ell(this.x, this.y, 2.5, 1, 'rgba(0,0,0,.25)'); ell(this.x, y, 4, 4, 'rgba(180,220,255,.6)'); ell(this.x - 1, y - 1, 1.5, 1.5, '#fff'); }
}

// ---------- boss : la Reine des remous ----------
// Elle tourne dans le bassin et crache des bulles. Quand elle a faim, elle bondit vers le héros et retombe sur la margelle :
// elle se débat quelques secondes, c'est le moment de frapper. Si l'on nage près d'elle, ses remous font mal (plonger pour les esquiver).
class WhirlQueen extends Enemy {
  constructor(x, y, room, pool) {
    super(x, y, { hp: 9, dmg: 2, room });
    this.isBoss = true; this.name = 'La Reine des remous'; this.state = 'sleep'; this.st = 0; this.pool = pool; this.ang = 0; this.alt = 0; this.hits = 0; this.phase = 1; this.loot = null; this.w = 30; this.h = 10; this.noFreeze = true;
    this.poof = ['#2a8ad0', '#6ac0ff', '#ffcf3a', '#fff'];
  }
  body() { const out = this.state === 'flop' || this.state === 'leap' || this.state === 'back'; return out ? { x: this.x - 20, y: this.y - this.alt - 26, w: 40, h: 26 } : { x: this.x - 16, y: this.y - 10, w: 32, h: 12 }; }
  get light() { return { r: 50, c: 'rgba(120,200,255,' }; }
  wake(G) { if (this.state !== 'sleep') return; this.state = 'swim'; this.st = 3; SFX.roar(); G.shake = 0.4; }
  hit(dmg, fx, fy, G, src) {
    if (this.state === 'flop' && src !== 'stone' && src !== 'frisbee') {
      this.hp -= dmg || 1; this.hits++; this.flash = 0.2; SFX.bossHit(); G.hitstop = 0.08; G.shake = 0.15;
      G.parts.burst(this.x, this.y - 16, 10, { c: this.poof, life: 0.4, smin: 30, smax: 90, r: 2 });
      if (this.hp <= 4 && this.phase === 1) this.phase = 2;
      if (this.hp <= 0) { this.state = 'dying'; this.st = 2.2; SFX.bossDie(); G.shake = 0.5; for (const e of G.area.ents) { if (e !== this && e.isEnemy && !e.dead && e.room === this.room) e.die(G); if (e.isOrb) e.dead = true; } }
      else if (this.hits >= 3) this.startBack();
      return;
    }
    if (this.state !== 'sleep' && this.state !== 'dying') SFX.tink();
  }
  startBack() { this.state = 'back'; this.st = 0.8; this.fx = this.x; this.fy = this.y; const a = rand(0, 6.28); this.tx = this.pool.cx + Math.cos(a) * this.pool.rx * 0.5; this.ty = this.pool.cy + Math.sin(a) * this.pool.ry * 0.5; this.hits = 0; }
  update(dt, G) {
    this.t += dt; this.st -= dt; if (this.flash > 0) this.flash -= dt;
    const P = G.player, pl = this.pool;
    switch (this.state) {
      case 'sleep': return;
      case 'swim': {
        this.ang += dt * (this.phase === 1 ? 1.1 : 1.6);
        this.x = lerp(this.x, pl.cx + Math.cos(this.ang) * pl.rx * 0.7, Math.min(1, dt * 3)); this.y = lerp(this.y, pl.cy + Math.sin(this.ang) * pl.ry * 0.7, Math.min(1, dt * 3));
        if (P.swimming && P.dive <= 0 && dist(P.x, P.y, this.x, this.y) < 22) P.hurt(2, this.x, this.y, G);
        this.cd = (this.cd || 1.5) - dt;
        if (this.cd <= 0) { this.cd = this.phase === 1 ? 2 : 1.3; SFX.shoot(); const a = Math.atan2(P.y - this.y, P.x - this.x); for (const o of this.phase === 1 ? [0] : [-0.25, 0.25]) { const b = new Bubble(this.x, this.y - 6, a + o); b.room = this.room; G.area.ents.push(b); } }
        if (this.st <= 0) { // bondit vers le héros (ou vers la margelle la plus proche)
          let tx = P.x, ty = P.y;
          if (P.swimming || G.area.tileAt(tx, ty - 2) === '~') { const a = Math.atan2(ty - pl.cy, tx - pl.cx); tx = pl.cx + Math.cos(a) * (pl.rx + 22); ty = pl.cy + Math.sin(a) * (pl.ry + 22); }
          const rr = G.roomRect(); tx = clamp(tx, rr.x + 44, rr.x + rr.w - 44); ty = clamp(ty, rr.y + 56, rr.y + rr.h - 40);
          this.state = 'leap'; this.st = 0.9; this.fx = this.x; this.fy = this.y; this.tx = tx; this.ty = ty; SFX.splash(); G.parts.burst(this.x, this.y, 16, { c: ['#cfe0ff', '#fff', '#6ac0ff'], life: 0.6, r: 2, up: 60, g: 200 });
        }
        return;
      }
      case 'leap': case 'back': {
        const k = clamp(1 - this.st / (this.state === 'leap' ? 0.9 : 0.8), 0, 1);
        this.x = lerp(this.fx, this.tx, k); this.y = lerp(this.fy, this.ty, k); this.alt = Math.sin(k * Math.PI) * 50;
        if (k >= 1) {
          this.alt = 0;
          if (this.state === 'leap') { this.state = 'flop'; this.st = this.phase === 1 ? 3 : 2.4; G.shake = 0.35; SFX.push(); if (dist(P.x, P.y, this.x, this.y) < 26) P.hurt(2, this.x, this.y, G); }
          else { this.state = 'swim'; this.st = rand(2.5, 4); SFX.splash(); G.parts.burst(this.x, this.y, 20, { c: ['#cfe0ff', '#fff'], life: 0.6, r: 2, up: 60, g: 200 }); const w = new Wave(this.x, this.y, this.room); G.area.ents.push(w); }
        }
        return;
      }
      case 'flop': if (this.st <= 0) this.startBack(); return;
      case 'dying':
        if (Math.random() < dt * 20) G.parts.burst(this.x + rand(-20, 20), this.y - rand(0, 30), 5, { c: this.poof, life: 0.5, r: 2, g: 60 });
        if (this.st <= 0) { this.dead = true; G.shake = 0.5; G.parts.burst(this.x, this.y - 16, 46, { c: ['#ffe27a', '#fff', '#6ac0ff'], life: 1.4, smin: 20, smax: 150, r: 2, drag: 1.5 }); }
        return;
    }
  }
  draw() {
    if (this.state === 'dying' && Math.floor(this.t * 20) % 2) return;
    const out = this.state !== 'swim' && this.state !== 'sleep', fl = this.flash > 0;
    if (!out) { // sous l'eau : une ombre et une nageoire
      ctx.globalAlpha = 0.45; ell(this.x, this.y, 22, 8, '#0a1a4a'); ctx.globalAlpha = 1;
      if (this.state !== 'sleep') hi(this.x, this.y, Math.cos(this.ang) > 0, () => { D(-4, -18, 8, 14, '#2a6ab0'); D(-2, -22, 4, 6, '#6ac0ff'); D(-4, -4, 8, 2, '#cfe0ff'); });
      return;
    }
    ell(this.x, this.y, 20, 5, 'rgba(0,0,0,.4)');
    const flop = this.state === 'flop', wig = flop ? Math.sin(this.t * 18) * 3 : 0;
    hi(this.x, this.y - this.alt, this.tx < this.fx, () => {
      const c1 = fl ? '#fff' : '#2a6ab0', c2 = fl ? '#fff' : '#4a9ae0', c3 = fl ? '#fff' : '#ffcf3a';
      D(-34, -40 + wig, 60, 34, c1); D(-30, -46 + wig, 50, 8, c2); D(-34, -14 + wig, 60, 6, '#cfe0ff');
      D(24, -44 - wig, 18, 14, c1); D(24, -16 + wig, 18, 14, c1); // queue
      D(-44, -34 + wig, 12, 22, c1); D(-48, -28 + wig, 6, 10, '#1a3a6a'); // tête
      D(-36, -34 + wig, 6, 6, '#fff'); D(-34, -32 + wig, 3, 3, flop ? '#c83a3a' : '#000');
      D(-22, -56 + wig, 6, 10, c3); D(-12, -60 + wig, 6, 14, c3); D(-2, -56 + wig, 6, 10, c3); // couronne
      for (let i = 0; i < 4; i++) D(-26 + i * 12, -32 + wig, 6, 4, '#1a4a8a');
    });
    if (flop) for (let i = 0; i < 3; i++) { const a = this.t * 5 + i * 2.1; R(half(this.x + Math.cos(a) * 12), half(this.y - 40 + Math.sin(a) * 3), 2, 2, i % 2 ? '#ffe27a' : '#fff'); }
  }
}
class Wave { // anneau de remous : fait mal à qui nage sans plonger
  constructor(x, y, room) { this.x = x; this.y = y; this.room = room; this.r = 6; this.w = 4; this.h = 4; this.ground = true; this.isOrb = true; }
  update(dt, G) {
    this.r += 70 * dt; if (this.r > 110) { this.dead = true; return; }
    const P = G.player, d = dist(P.x, P.y, this.x, this.y);
    if (P.swimming && P.dive <= 0 && Math.abs(d - this.r) < 6) P.hurt(1, this.x, this.y, G);
  }
  draw() { ctx.globalAlpha = clamp(1 - this.r / 110, 0, 1) * 0.7; ctx.strokeStyle = '#cfe0ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(this.x, this.y, this.r, this.r * 0.55, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
}


// ---------- la zone : le Temple englouti (Lac) — 11 salles ----------
// 'w' : bassin peu profond (eau haute → eau, eau basse → sol) ; 'y' : grand bassin (eau haute → eau, eau basse → gouffre)
//            .          .        [BOSS]          .
//            .     [GALERIE]   [GRANDE CLÉ]   [CASCADE]
//            .     [PLONGÉE]   [GRAND BASSIN] [BASSIN EST]
//       [FONTAINE]  [ARÈNE]    [ENTRÉE]      [PALMES]
class HealSpring { // source de soin : on boit, toute la vie revient
  constructor(x, y) { this.x = x; this.y = y; this.w = 26; this.h = 10; this.solid = true; this.t = 0; this.light = { r: 70, c: 'rgba(160,240,255,' }; }
  canInteract() { return true; }
  interact(G) { G.player.hp = SAVE.maxHp; SFX.drink(); G.parts.burst(this.x, this.y - 14, 20, { c: ['#cfe0ff', '#fff', '#8ff3ea'], life: 0.8, r: 2, up: 40 }); G.say([{ text: 'Tu bois l\'eau fraîche de la source. Toute ta vie revient !' }]); }
  update(dt, G) { this.t += dt; if (Math.random() < dt * 6) G.parts.add({ x: this.x + rand(-10, 10), y: this.y - 10, vy: -20, life: 0.8, c: '#cfe0ff', r: 1 }); }
  draw() { ell(this.x, this.y, 16, 5, 'rgba(0,0,0,.35)'); hi(this.x, this.y, false, () => { D(-26, -16, 52, 16, '#4e8a90'); D(-26, -16, 52, 3, '#7ab8be'); D(-22, -14, 44, 10, '#2a8ad0'); for (let i = 0; i < 4; i++) D(-18 + ((i * 11 + Math.floor(this.t * 8)) % 36), -12 + (i % 2) * 3, 5, 1, '#cfe0ff'); D(-4, -40, 8, 26, '#4e8a90'); D(-8, -44, 16, 6, '#7ab8be'); }); }
}
function buildTempleArea() {
  return makeDungeon({
    id: 'temple', zone: 'lac', name: 'Le Temple englouti', theme: 'temple', seed: 67, rough: 0.2, moss: 140, dark: 0.32,
    bossFlag: 'boss4', heartFlag: 'heart5', heartY: 236,
    rooms: { entry: [2, 3], arena: [1, 3], fountain: [0, 3], palmes: [3, 3], hub: [2, 2], dive: [1, 2], east: [3, 2], bigkey: [2, 1], gallery: [1, 1], cascade: [3, 1], boss: [2, 0] },
    entry: 'entry', boss: 'boss',
    links: [['entry', 'arena', { arena: true, at: 'b' }], ['arena', 'fountain'], ['entry', 'palmes', { key: 'templeDoor1' }], ['entry', 'hub'], ['hub', 'dive'], ['hub', 'east'], ['hub', 'bigkey', { key: 'templeDoor2' }], ['bigkey', 'gallery'], ['bigkey', 'cascade'], ['bigkey', 'boss', { big: true }]],
    tiles(room) {
      room('entry').rect(9, 3, 12, 4, 'w');
      const p = room('palmes'); p.rect(5, 3, 20, 11, 'w'); p.rect(13, 7, 4, 3, '_');
      const h = room('hub'); h.rect(3, 2, 24, 2, '_'); h.rect(3, 13, 24, 2, '_'); h.rect(3, 4, 24, 9, 'y');
      const d = room('dive'); d.rect(3, 3, 23, 11, 'y'); d.rect(26, 6, 1, 4, '_');
      const s = room('east'); s.rect(6, 3, 20, 11, 'w'); s.rect(3, 6, 3, 4, '_');
      const b = room('bigkey'); b.rect(5, 4, 20, 7, 'w'); b.rect(13, 6, 4, 3, '_');
      const a = room('arena'); a.rect(3, 3, 3, 3, '~'); a.rect(24, 11, 3, 3, '~');
      const g = room('gallery'); g.rect(3, 5, 24, 2, '~'); g.rect(3, 10, 24, 2, '~');
      const c = room('cascade'); c.rect(20, 3, 7, 11, '~');
      const f = room('fountain'); f.rect(3, 3, 4, 3, '~'); f.rect(23, 3, 4, 3, '~');
      const bo = room('boss'); bo.rect(8, 5, 14, 8, '~'); for (const [x, y] of [[4, 4], [25, 4], [4, 12], [25, 12]]) bo.set(x, y, 'k');
    },
    after(A, h) {
      A.basins = [];
      for (let y = 0; y < A.rows; y++) for (let x = 0; x < A.cols; x++) { const c = A.g[y][x]; if (c === 'w' || c === 'y') A.basins.push([x, y, c]); }
      A.syncTiles = function () {
        const low = !!SAVE.waterLow; let changed = false;
        for (const [x, y, c] of this.basins) { const want = low ? (c === 'w' ? '_' : 'v') : '~'; if (this.g[y][x] !== want) { this.g[y][x] = want; changed = true; } }
        if (changed) this.rerender();
      };
      A.syncTiles();
    },
    arenas: { arena: arenaStd('arenaT'), boss: bossArena('boss4', 'La Reine des remous') },
    make(n, L, h) {
      const { mk } = h, pot = (x, y) => h.pot(n, x, y);
      if (n === 'entry') L.push(pot(4, 13), pot(25, 13), mk(Crab, n, 6, 10), mk(Crab, n, 23, 10), mk(Eel, n, 12, 4), mk(Eel, n, 18, 5));
      if (n === 'arena') { L.push(pot(25, 3), pot(4, 13)); if (!SAVE.arenaT) L.push(mk(Crab, n, 8, 6), mk(Crab, n, 21, 6), mk(Crab, n, 14, 11), mk(Eel, n, 4, 4), mk(Eel, n, 25, 12)); }
      if (n === 'fountain') L.push(mk(Eel, n, 4, 4), mk(Eel, n, 25, 4), pot(4, 13), pot(25, 13));
      if (n === 'palmes') L.push(mk(Eel, n, 8, 5), mk(Eel, n, 21, 11), mk(Crab, n, 4, 12), pot(26, 13));
      if (n === 'hub') L.push(mk(Eel, n, 8, 7), mk(Eel, n, 21, 9), mk(Eel, n, 14, 11), pot(4, 13), pot(25, 13));
      if (n === 'dive') L.push(mk(Eel, n, 8, 5), mk(Eel, n, 16, 11), mk(Eel, n, 20, 4));
      if (n === 'east') L.push(mk(Eel, n, 12, 6), mk(Eel, n, 20, 10), mk(Crab, n, 4, 12));
      if (n === 'bigkey') L.push(mk(Eel, n, 7, 5), mk(Eel, n, 22, 9), mk(Crab, n, 4, 12), mk(Crab, n, 25, 12));
      if (n === 'gallery') L.push(mk(Eel, n, 6, 6), mk(Eel, n, 14, 11), mk(Eel, n, 22, 6), mk(Crab, n, 14, 8), pot(3, 13), pot(26, 13));
      if (n === 'cascade') L.push(mk(Crab, n, 8, 6), mk(Crab, n, 10, 11), mk(Eel, n, 23, 6), mk(Eel, n, 23, 11), pot(3, 3), pot(3, 13));
      if (n === 'boss') { const bp = h.pos(n, 15 * TS, 9 * TS), pool = { cx: bp.x, cy: bp.y, rx: 7 * TS - 8, ry: 4 * TS - 6 }; if (!SAVE.boss4) L.push(new WhirlQueen(pool.cx, pool.cy, h.R.boss, pool)); L.push(pot(3, 13), pot(26, 13)); }
    },
    fixed(h) {
      const { mk, pos } = h, br = (n, pts) => pts.map(([x, y]) => [n, mk(Brazier, n, x, y)]);
      const ac = pos('arena', 240, 150), pc = pos('palmes', 240, 150), cg = pos('boss', 240, 66), bk = pos('bigkey', 240, 140);
      return [
        ['entry', mk(Valve, 'entry', 5, 9)],
        ['entry', mk(Sign, 'entry', 24, 9, [{ text: '« Temple englouti. Chaque vanne règle toutes les eaux du temple. »' }])],
        ['arena', new Chest(ac.x, ac.y, { flag: 'templeKeyChest', reveal: 'arenaT', msg: [{ text: 'Une petite clé ! Elle ouvre une porte de ce temple.' }] })],
        ['fountain', mk(HealSpring, 'fountain', 14, 8)],
        ['palmes', new Chest(pc.x, pc.y, { flag: 'palmesChest', give: 'palmes', big: true, msg: [{ text: 'Tu as trouvé les palmes et le tuba !' }, { text: 'Tu peux nager en eau profonde. Dans l\'eau, A ou B : plonger. On esquive tout et on ramasse ce qui brille au fond.' }] })],
        ['hub', mk(Valve, 'hub', 5, 13)],
        ['hub', mk(Sign, 'hub', 24, 13, [{ text: '« Grand bassin. Eau basse : gouffre. Eau haute : on nage. »' }])],
        ['dive', new DiveSpot(pos('dive', 120, 200).x, pos('dive', 120, 200).y, 'templeDiveKey', 'key', [{ text: 'Au fond de l\'eau, une petite clé !' }])],
        ['dive', new DiveSpot(pos('dive', 300, 90).x, pos('dive', 300, 90).y, 'templeDiveCoins', 'money:40', [{ text: 'Une bourse engloutie : 40 écus !' }])],
        ['east', mk(Valve, 'east', 4, 6)],
        ['east', mk(Chest, 'east', 16, 9, { flag: 'templeHeart', give: 'quart_coeur', big: true, reveal: 'waterLow', msg: [{ text: 'Un cœur de cristal, resté au fond du bassin ! Ta vie maximale augmente d\'un cœur.' }] })],
        ['bigkey', mk(Valve, 'bigkey', 4, 13)],
        ['bigkey', new Chest(bk.x, bk.y, { flag: 'templeBigKey', give: 'bigkey:temple', big: true, msg: [{ text: 'La grande clé du temple ! Elle ouvre le bassin de la Reine.' }] })],
        ['bigkey', mk(Sign, 'bigkey', 24, 13, [{ text: '« Le trésor du temple dort sur l\'îlot. »' }])],
        ['gallery', new DiveSpot(pos('gallery', 360, 104).x, pos('gallery', 360, 104).y, 'templeGallery', 'money:50', [{ text: 'Un coffret englouti : 50 écus !' }])],
        ['boss', new Cage(cg.x, cg.y, { n: 4, boss: 'boss4', drawCaptive: (x, y, t) => drawHero(Heroes.captive(2), x, y, 'down', false, t) })],
        ...br('boss', [[4, 3], [25, 3]]), ...br('entry', [[3, 3], [26, 3]]), ...br('hub', [[3, 2], [26, 2]]), ...br('palmes', [[3, 3], [26, 3]]), ...br('arena', [[14, 3]]), ...br('dive', [[26, 4]]),
        ...br('east', [[3, 4]]), ...br('bigkey', [[3, 3], [26, 3]]), ...br('gallery', [[3, 3], [26, 3]]), ...br('cascade', [[3, 8]]), ...br('fountain', [[10, 3], [19, 3]]),
      ];
    },
  });
}
