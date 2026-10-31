'use strict';
// ---------- objets, mécanismes et boss ----------

function drawHeartShape(x, y, s, c, dark) {
  hi(x, y, false, () => {
    const u = s; D(-4 * u, -3 * u, 3 * u, 2 * u, c); D(1 * u, -3 * u, 3 * u, 2 * u, c); D(-5 * u, -2 * u, 10 * u, 3 * u, c); D(-4 * u, 1 * u, 8 * u, 1 * u, c); D(-3 * u, 2 * u, 6 * u, 1 * u, c); D(-2 * u, 3 * u, 4 * u, 1 * u, c); D(-1 * u, 4 * u, 2 * u, 1 * u, c);
    D(-4 * u, -2 * u, 2 * u, 1 * u, '#ffd0d8'); if (dark) D(1 * u, 1 * u, 3 * u, 1 * u, dark);
  });
}
function drawSlingIcon(x, y, s = 1, flip = false) {
  // fronde en Y, dessinée pixel par pixel (1 case = 1 pixel monde à l'échelle 1)
  const P = ['X.....X', 'X.....X', '.X...X.', '..X.X..', '...X...', '...X...', '...X...'];
  hi(x, y, flip, () => {
    const u = 2 * s;
    P.forEach((row, j) => [...row].forEach((c, i) => { if (c === 'X') D((i - 3.5) * u, (j - 4) * u, u, u, j < 4 ? '#b07a48' : '#6a4224'); }));
    D(-2.5 * u, -3.5 * u, 5 * u, 0.5 * u, '#e8dcc0'); D(-0.5 * u, -3.5 * u, u, u, '#5a5e6a'); // élastique et caillou
  });
}
// ---------- caillou du lance-pierre ----------
class Pebble {
  constructor(x, y, vx, vy, room) {
    const n = Math.hypot(vx, vy) || 1; vx /= n; vy /= n;
    this.x = x + vx * 6; this.y = y + vy * 4 + (vy < 0 ? -2 : 1); this.alt = 9;
    this.vx = vx * 240; this.vy = vy * 240; this.t = 0; this.w = 4; this.h = 3; this.room = room; this.isShot = true;
  }
  poof(G) { this.dead = true; G.parts.burst(this.x, this.y - this.alt, 5, { c: ['#b8b4c8', '#fff', '#6a6480'], life: 0.25, smin: 20, smax: 60, r: 1 }); }
  update(dt, G) {
    this.t += dt;
    for (let i = 0; i < 3; i++) {
      this.x += this.vx * dt / 3; this.y += this.vy * dt / 3;
      if (WALLS.has(G.area.tileAt(this.x, this.y - 2))) { SFX.tink(); return this.poof(G); }
      const b = { x: this.x - 3, y: this.y - this.alt - 3, w: 6, h: 6 }, foot = { x: this.x - 2, y: this.y - 3, w: 4, h: 3 };
      for (const e of G.area.ents) {
        if (e === this || e.dead || e.isShot || e instanceof HeartPickup) continue;
        if (e.room != null && e.room !== G.room) continue;
        if (e.hit) { if (rectHit(b, e.body ? e.body() : boxOf(e))) { e.hit(1, this.x - this.vx * 0.05, this.y - this.vy * 0.05, G, 'stone'); return this.poof(G); } }
        else if (e.solid && rectHit(foot, boxOf(e))) { SFX.tink(); return this.poof(G); }
      }
    }
    if (this.t > 1.1) this.poof(G);
  }
  draw() { ell(this.x, this.y, 2, 0.8, 'rgba(0,0,0,.35)'); const y = this.y - this.alt; R(half(this.x - 1.5), half(y - 1.5), 3, 3, '#8a8698'); R(half(this.x - 1.5), half(y - 1.5), 1.5, 1.5, '#d8d4e8'); }
}

// ---------- rayures au sol : indiquent qu'une stèle peut être poussée ----------
class Scratches {
  constructor(x, y, len) { this.x = x; this.y = y; this.len = len; this.ground = true; this.w = 16; this.h = 16; }
  draw() {
    hi(this.x, this.y, true, () => { // en miroir : les sillons partent vers la gauche
      const L = this.len * 32, end = L - 20;
      // 3 sillons continus laissés par la stèle, qui s'effilent vers la droite
      [[-24, 3], [-15, 0], [-6, 5]].forEach(([oy, ph]) => {
        for (let x = -12; x < end; x += 2) {
          if (((x + ph * 7) % 23) > 20) continue;              // petites interruptions irrégulières
          const wob = ((x + ph) >> 4) & 1, thin = x > end - 14;
          D(x, oy + wob, 2, thin ? 1 : 2, '#0b0c15');
          D(x, oy + wob + (thin ? 1 : 2), 2, 1, '#4c5174');
        }
      });
      for (const [ex, ey] of [[20, -28], [44, -8], [70, -22], [-10, -2]]) if (ex < L - 18) D(ex, ey, 2, 2, '#4a4e6a');
    });
  }
}

// ---------- ramassables ----------
// cœurs, pièces et cailloux : rebondissent puis clignotent avant de disparaître
const PICKUPS = {
  heart:  { draw: (x, y) => drawHeartShape(x, y - 5, 2, PAL.heart, '#c02848'), take: G => { G.healBy(2); SFX.pickup(); } },
  coin1:  { draw: (x, y, t) => drawCoin(x, y - 4, '#c8a060', '#8a6a3a', t), take: () => { Wallet.add(1); SFX.coin(); } },
  coin5:  { draw: (x, y, t) => drawCoin(x, y - 4, '#d8dce8', '#8a90a8', t), take: () => { Wallet.add(5); SFX.coin(); } },
  coin20: { draw: (x, y, t) => drawCoin(x, y - 4, '#ffd23a', '#c08a10', t), take: () => { Wallet.add(20); SFX.coin(); } },
  mushroom: { draw: (x, y) => { R(x - 1, y - 4, 2, 4, '#e8dcc8'); R(x - 4, y - 7, 8, 3, '#d8504a'); R(x - 3, y - 8, 6, 1, '#e86a5a'); R(x - 2, y - 7, 1, 1, '#fff'); R(x + 1, y - 6, 1, 1, '#fff'); }, take: () => { Inventory.addIngredient('champignons', 1); SFX.pickup(); } },
  petards: { draw: (x, y) => drawPetardIcon(x, y - 4, 0.7), take: () => { Inventory.addAmmo('petards', 3); SFX.pickup(); } },
  stones: { draw: (x, y) => { R(x - 4, y - 4, 3, 3, '#8a8698'); R(x - 1, y - 5, 3, 3, '#a8a4b8'); R(x + 1, y - 3, 3, 3, '#7a7688'); R(x - 1, y - 5, 1, 1, '#e0dcf0'); }, take: () => { Inventory.addAmmo('cailloux', 5); SFX.pickup(); } },
};
function drawCoin(x, y, c, d, t) {
  const w = Math.max(1, Math.round(Math.abs(Math.cos(t * 4)) * 3));
  R(half(x - w), half(y - 3), w * 2, 6, d); R(half(x - w + 0.5), half(y - 3), Math.max(1, w * 2 - 1), 5, c); R(half(x - 0.5), half(y - 2), 1, 1, '#fff');
}
class Pickup {
  constructor(x, y, kind) { this.x = x; this.y = y; this.kind = kind; this.t = 0; this.w = 8; this.h = 6; this.vy = -60; this.z = 0; this.isPickup = true; this.fetchable = true; }
  update(dt, G) {
    this.t += dt; if (this.z < 0 || this.vy < 0) { this.vy += 300 * dt; this.z += this.vy * dt; if (this.z > 0) { this.z = 0; this.vy = 0; } }
    if (this.t > 10 && !this.carried) this.dead = true;
    const P = G.player;
    if (rectHit({ x: this.x - 5, y: this.y - 8, w: 10, h: 10 }, P.body())) {
      this.dead = true; PICKUPS[this.kind].take(G);
      G.parts.burst(this.x, this.y - 4, 6, { c: this.kind === 'heart' ? ['#ff8ab0', '#fff'] : ['#ffe27a', '#fff'], life: 0.3, r: 1 });
    }
  }
  draw() { if (this.t > 7 && Math.floor(this.t * 10) % 2) return; ell(this.x, this.y, 3, 1, 'rgba(0,0,0,.3)'); PICKUPS[this.kind].draw(this.x, this.y + this.z + Math.sin(this.t * 4) * 0.6, this.t); }
}
const HeartPickup = Pickup; // ancien nom

class Bush {
  constructor(x, y) { this.x = x; this.y = y; this.w = 16; this.h = 8; this.solid = true; }
  hit(d, fx, fy, G) {
    this.dead = true; SFX.cut();
    G.parts.burst(this.x, this.y - 6, 14, { c: ['#3a7a50', '#5aa060', '#2a5a3a', '#8ad080'], life: 0.6, smin: 20, smax: 70, up: 30, g: 120, r: 2, drag: 2 });
    dropLoot(G, this.loot || 'bush', this.x, this.y);
  }
  draw() { const im = IMG.bush; if (im) ctx.drawImage(im, half(this.x - im.width / 4), half(this.y - im.height / 2 + 2), im.width / 2, im.height / 2); }
}

class Pot extends Bush {
  constructor(x, y) { super(x, y); this.w = 12; this.h = 7; }
  hit(d, fx, fy, G) {
    this.dead = true; noise(0.12, { freq: 2200, vol: 0.2 }); tone(700, 0.05, { vol: 0.08 });
    G.parts.burst(this.x, this.y - 6, 12, { c: ['#9a5a32', '#c08050', '#6a3a20', '#b06a3a'], life: 0.5, smin: 30, smax: 80, up: 40, g: 200, r: 2, drag: 1 });
    dropLoot(G, this.loot || 'pot', this.x, this.y);
  }
  draw() {
    ell(this.x, this.y, 6, 2, 'rgba(0,0,0,.4)');
    hi(this.x, this.y, false, () => {
      D(-9, -16, 18, 14, '#9a5a32'); D(-11, -13, 22, 9, '#9a5a32'); D(-7, -3, 14, 3, '#7a4024');
      D(-6, -20, 12, 4, '#6a3a20'); D(-8, -22, 16, 3, '#b07a4a'); D(-8, -22, 16, 1, '#d09a6a');
      D(-9, -13, 3, 8, '#c08050'); D(-11, -9, 22, 2, '#6a3a20'); D(6, -14, 3, 10, '#7a4024');
    });
  }
}

// ---------- coffres et portes ----------
class Chest {
  constructor(x, y, o = {}) {
    this.x = x; this.y = y; this.flag = o.flag || 'chest'; this.give = o.give || 'key'; this.big = !!o.big;
    this.reveal = o.reveal || null; this.msg = o.msg; this.w = this.big ? 22 : 16; this.h = 8; this.t = 0; this.shown = !this.hidden;
  }
  get open() { return !!SAVE[this.flag]; }
  get hidden() { return !!this.reveal && !SAVE[this.reveal]; }
  get solid() { return !this.hidden; }
  get light() { if (this.beam) return { r: this.big ? 80 : 64, c: 'rgba(255,230,150,', warm: true }; return !this.hidden && !this.open ? { r: this.big ? 44 : 26, c: 'rgba(255,207,122,' } : null; }
  canInteract() { return !this.hidden && !this.open && !this.busy; }
  // ouverture : le coffre tremble, le couvercle saute, un faisceau de lumière jaillit et l'objet s'élève au-dessus du coffre
  interact(G) {
    this.busy = true; let creak = 0; const P = G.player; P.vx = P.vy = 0;
    const kind = this.give.startsWith('money') ? 'money' : this.give.startsWith('bigkey') ? 'bigkey' : this.give;
    G.cut = { t: 0,
      update: dt => {
        const c = G.cut; c.t += dt; this.t += dt; G.parts.update(dt);
        if (c.t < 0.75) { const k = Math.min(1, c.t * 2); this.jx = (Math.random() - 0.5) * 2.2 * k; this.jy = -Math.random() * k; if ((creak -= dt) <= 0) { creak = 0.18; SFX.push(); } }
        else if (!c.opened) {
          c.opened = true; this.jx = this.jy = 0; SAVE[this.flag] = true;
          if (this.give === 'key') Keys.add(1);
          else if (this.give.startsWith('money:')) Wallet.add(Number(this.give.slice(6)));
          else if (this.give.startsWith('bigkey:')) SAVE['bigkey_' + this.give.slice(7)] = true;
          else Inventory.give(this.give);
          persist(); SFX.chest(); G.shake = 0.2; this.beam = 1;
          G.parts.burst(this.x, this.y - 14, 26, { c: ['#fff', '#ffe27a', '#ffcf3a'], life: 0.9, smin: 20, smax: 90, r: 2, drag: 2, up: 30 });
          G.raised = { kind, t: 1.6, at: { x: this.x, y: this.y - (this.big ? 20 : 14) }, rise: 0 };
        } else if (G.raised) G.raised.rise = Math.min(1, (c.t - 0.75) / 0.7);
        if (c.opened && Math.random() < dt * 14) G.parts.add({ x: this.x + rand(-8, 8), y: this.y - 16, vy: -rand(20, 50), vx: rand(-6, 6), life: 0.9, c: pick(['#fff6c0', '#ffe27a', '#fff']), r: 1 });
        if (c.t > 1.6) { G.cut = null; G.state = 'play'; G.say(this.msg || [{ text: 'Tu as trouvé une petite clé !' }], () => { this.beam = 0; this.busy = false; }); }
      },
      draw: () => {} };
    G.state = 'cut';
  }
  update(dt, G) {
    this.t += dt;
    if (!this.shown && !this.hidden) { this.shown = true; G.parts.burst(this.x, this.y - 8, 24, { c: ['#fff', '#ffe27a', '#8ff3ea'], life: 0.7, smin: 20, smax: 90, r: 2, drag: 2 }); }
  }
  draw() {
    if (this.hidden) return;
    ell(this.x, this.y, this.big ? 14 : 10, this.big ? 4 : 3, 'rgba(0,0,0,.4)');
    if (this.beam) { // faisceau de lumière qui sort du coffre
      const s = this.big ? 1.4 : 1, top = this.y - 90, base = this.y - 12 * s, hw = 9 * s, a = 0.55 + Math.sin(G.t * 9) * 0.08;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(0, base, 0, top); g.addColorStop(0, `rgba(255,236,160,${a})`); g.addColorStop(1, 'rgba(255,236,160,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(this.x - hw, base); ctx.lineTo(this.x + hw, base); ctx.lineTo(this.x + hw * 2.2, top); ctx.lineTo(this.x - hw * 2.2, top); ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${a * 0.6})`; ctx.fillRect(this.x - hw * 0.35, top + 20, hw * 0.7, base - top - 20);
      ctx.restore();
    }
    hi(this.x + (this.jx || 0), this.y + (this.jy || 0), false, () => {
      const gold = this.give.startsWith('bigkey'), g1 = gold ? '#c08a10' : this.big ? '#4a6ab0' : '#7a4a24', g2 = gold ? '#ffd23a' : this.big ? '#6a8ad0' : '#a06a34', g3 = gold ? '#8a5a10' : this.big ? '#2a3a70' : '#4a2a14', l1 = gold ? '#e0a820' : this.big ? '#5a7ac0' : '#8a5a2c', l2 = gold ? '#fff2a0' : this.big ? '#8aaae0' : '#b07a3c', l3 = gold ? '#6a4a10' : this.big ? '#1a2a5a' : '#5a3418';
      D(-15, -18, 30, 18, g1); D(-15, -18, 30, 2, g2); D(-15, -2, 30, 2, g3);
      D(-15, -18, 3, 18, '#c8a040'); D(12, -18, 3, 18, '#c8a040');
      if (!this.open) {
        D(-16, -30, 32, 13, l1); D(-16, -30, 32, 3, l2); D(-16, -30, 3, 13, '#e0b850'); D(13, -30, 3, 13, '#e0b850'); D(-16, -19, 32, 2, l3);
        D(-4, -22, 8, 8, '#e0b850'); D(-2, -20, 4, 4, '#3a2410'); D(-1, -19, 2, 3, '#e0b850');
        if (Math.floor(this.t * 2) % 3 === 0) D(8, -28, 2, 2, '#fff');
      } else {
        D(-16, -34, 32, 10, l3); D(-16, -34, 32, 2, l1); D(-13, -24, 26, 6, '#1a0e08');
      }
    }, this.big ? 1.4 : 1);
  }
}

function drawLockedDoor(x, y, t) {
  hi(x, y, false, () => {
    D(-32, -64, 64, 64, '#2a1810');
    for (let i = 0; i < 4; i++) { D(-30 + i * 15, -62, 13, 62, '#6a4224'); D(-30 + i * 15, -62, 2, 62, '#8a5a34'); D(-19 + i * 15, -62, 2, 62, '#3a2414'); }
    D(-32, -50, 64, 5, '#3a3d48'); D(-32, -18, 64, 5, '#3a3d48'); D(-32, -50, 64, 1, '#6a6e7a'); D(-32, -18, 64, 1, '#6a6e7a');
    const g = Math.sin(t * 3) > 0.6 ? '#ffe9a0' : '#e0b850';
    D(-8, -40, 16, 4, '#9a9aa8'); D(-8, -40, 4, 10, '#9a9aa8'); D(4, -40, 4, 10, '#9a9aa8');
    D(-11, -32, 22, 18, g); D(-11, -32, 22, 2, '#fff2c0'); D(-11, -16, 22, 2, '#a07a20'); D(-2, -27, 4, 5, '#3a2410'); D(-1, -23, 2, 4, '#3a2410');
  });
}
class KeyDoor {
  constructor(x, y, flag) { this.x = x; this.y = y; this.flag = flag; this.w = 32; this.h = 32; this.solid = true; this.t = 0; this.light = { r: 30, c: 'rgba(255,207,122,' }; }
  get dead() { return !!SAVE[this.flag]; }
  canInteract() { return true; }
  interact(G) { if (Keys.get() > 0) this.unlock(G); else { SFX.locked(); G.say([{ text: 'Une porte fermée par un gros cadenas. Il faut une petite clé.' }]); } }
  unlock(G) {
    Keys.add(-1); SAVE[this.flag] = true; persist(); SFX.door(); G.shake = 0.3;
    G.parts.burst(this.x, this.y - 16, 22, { c: ['#8a5a2c', '#5a3418', '#e0b850', '#fff'], life: 0.7, smin: 20, smax: 80, r: 2, g: 80 });
  }
  update(dt) { this.t += dt; }
  draw() { drawLockedDoor(this.x, this.y, this.t); }
}

// volet à barreaux : se ferme / s'ouvre selon une condition
class Shutter {
  constructor(x, y, orient, closedFn) { this.x = x; this.y = y; this.w = 32; this.h = 32; this.orient = orient; this.closedFn = closedFn; this.want = closedFn() ? 1 : 0; this.k = this.want; }
  get solid() { return this.k > 0.3 && this.closedFn(); }
  update(dt) {
    const want = this.closedFn() ? 1 : 0;
    if (want !== this.want) { this.want = want; SFX.shutter(); }
    this.k = clamp(this.k + (want ? 1 : -1) * dt * 5, 0, 1);
  }
  draw() {
    if (this.k <= 0) return;
    const k = this.k;
    hi(this.x, this.y, false, () => {
      if (this.orient === 'v') {
        const hh = Math.max(2, Math.round(64 * k));
        for (let i = 0; i < 5; i++) { const bx = -29 + i * 13; D(bx, -64, 6, hh, '#5a5e6a'); D(bx, -64, 2, hh, '#9a9eaa'); D(bx - 1, -64 + hh - 5, 8, 5, '#3a3d48'); }
        D(-32, -64 + Math.round(hh * 0.4), 64, 4, '#4a4e5a'); D(-32, -64 + Math.round(hh * 0.4), 64, 1, '#7a7e8a');
      } else {
        const ww = Math.max(2, Math.round(64 * k));
        for (let i = 0; i < 5; i++) { const by = -62 + i * 13; D(-32, by, ww, 6, '#5a5e6a'); D(-32, by, ww, 2, '#9a9eaa'); }
        D(-32 + Math.round(ww * 0.45), -64, 4, 64, '#4a4e5a');
      }
    });
  }
}

class Sign {
  constructor(x, y, lines, style) { this.x = x; this.y = y; this.w = 12; this.h = 5; this.solid = true; this.lines = lines; this.style = style; }
  canInteract() { return true; }
  interact(G) { G.say(this.lines); }
  draw() {
    if (this.style === 'stone') {
      ell(this.x, this.y, 8, 2.5, 'rgba(0,0,0,.4)');
      hi(this.x, this.y, false, () => {
        D(-12, -30, 24, 30, '#3a3354'); D(-14, -34, 28, 6, '#4a4266'); D(-14, -34, 28, 1, '#6a6290');
        D(-12, -30, 3, 30, '#4a4266'); D(9, -28, 3, 28, '#262036');
        for (let i = 0; i < 3; i++) D(-7, -24 + i * 6, 14, 2, '#8ff3ea');
      });
      return;
    }
    const im = IMG.sign; if (im) ctx.drawImage(im, half(this.x - im.width / 4), half(this.y - im.height / 2 + 1), im.width / 2, im.height / 2);
  }
}

class Brazier {
  constructor(x, y) { this.x = x; this.y = y; this.w = 12; this.h = 6; this.solid = true; this.t = rand(0, 5); this.light = { r: 80, c: 'rgba(255,160,70,', flick: true, warm: true }; }
  update(dt, G) { this.t += dt; if (Math.random() < dt * 4) G.parts.add({ x: this.x + rand(-3, 3), y: this.y - 20, vy: -18, vx: rand(-4, 4), life: 0.7, c: pick(['#ffb02e', '#ff7a1a', '#ffe9a0']), r: 1 }); }
  draw() {
    ell(this.x, this.y, 8, 2.5, 'rgba(0,0,0,.45)');
    const f = Math.floor(this.t * 9) % 3;
    hi(this.x, this.y, false, () => {
      D(-6, -16, 12, 16, '#3a3354'); D(-6, -16, 3, 16, '#4a4266'); D(-10, -4, 20, 4, '#2b2540');
      D(-13, -24, 26, 8, '#4a4266'); D(-13, -24, 26, 2, '#6a6290'); D(-11, -18, 22, 2, '#2b2540');
      D(-9, -30 - f, 18, 8 + f, '#ff7a1a'); D(-6, -36 - f * 2, 12, 10, '#ffb02e'); D(-3, -42 + f, 6, 8, '#ffe9a0'); D(-1, -45 + f, 2, 3, '#fff');
      if (f === 1) D(5, -38, 3, 4, '#ff7a1a'); if (f === 2) D(-8, -36, 3, 4, '#ffb02e');
    });
  }
}

// ---------- énigmes ----------
class Block {
  constructor(x, y) { this.x = x; this.y = y; this.w = 16; this.h = 16; this.solid = true; this.mv = null; }
  // pousser en marchant dedans, ou agripper (rester appuyé sur A) pour tirer et pousser
  push(dir, G) {
    if (this.mv) return;
    const [vx, vy] = DV[dir], tb = { x: this.x - 8 + vx * 16, y: this.y - 16 + vy * 16, w: 16, h: 16 }, rr = G.roomRect();
    const inside = tb.x >= rr.x + 32 && tb.x + 16 <= rr.x + rr.w - 32 && tb.y >= rr.y + 32 && tb.y + 16 <= rr.y + rr.h - 32;
    if (!inside || blocked(G.area, tb, this)) return;
    this.mv = { vx, vy, d: 0 }; SFX.push();
  }
  update(dt, G) {
    if (!this.mv) return;
    const s = Math.min(64 * dt, 16 - this.mv.d);
    this.x += this.mv.vx * s; this.y += this.mv.vy * s; this.mv.d += s;
    if (this.mv.d >= 16) { this.x = Math.round(this.x); this.y = Math.round(this.y); this.mv = null; G.blockMoved(this); }
  }
  draw() {
    hi(this.x, this.y, false, () => {
      D(-16, -32, 32, 32, '#3a3354'); D(-16, -32, 32, 11, '#5a5280'); D(-16, -32, 32, 2, '#6a6290'); D(-16, -21, 32, 2, '#2b2540');
      D(-16, -32, 2, 32, '#4a4266'); D(14, -21, 2, 21, '#262036'); D(-16, -2, 32, 2, '#1a1528');
      D(-7, -16, 14, 10, '#2b2540'); D(-5, -14, 10, 6, '#4a4266'); D(-1, -13, 2, 4, '#8ff3ea');
    });
  }
}
class Plate {
  constructor(x, y, flag) { this.x = x; this.y = y; this.flag = flag; this.w = 16; this.h = 16; this.ground = true; }
  get on() { return !!SAVE[this.flag]; }
  draw() {
    hi(this.x, this.y, false, () => {
      D(-15, -31, 30, 30, '#111019');
      const d = this.on ? 4 : 0;
      D(-13, -29 + d, 26, 26 - d, this.on ? '#3a3354' : '#5a4a7a'); D(-13, -29 + d, 26, 3, this.on ? '#4a4266' : '#7a6aa0');
      D(-5, -21 + d, 10, 10, this.on ? '#8ff3ea' : '#2b2540');
    });
  }
}
class Crystal {
  constructor(x, y, flag, onLit) { this.x = x; this.y = y; this.flag = flag; this.onLit = onLit; this.w = 16; this.h = 8; this.solid = true; this.t = 0; }
  get lit() { return !!SAVE[this.flag]; }
  get light() { return this.lit ? { r: 70, c: 'rgba(120,240,255,' } : { r: 26, c: 'rgba(150,120,255,' }; }
  body() { return { x: this.x - 8, y: this.y - 30, w: 16, h: 30 }; }
  hit(d, fx, fy, G) {
    if (this.lit) { SFX.tink(); return; }
    SAVE[this.flag] = true; persist(); SFX.crystal(); G.shake = 0.25;
    G.parts.burst(this.x, this.y - 20, 22, { c: ['#8ff3ea', '#fff', '#6fd3ff'], life: 0.8, smin: 20, smax: 90, r: 2, drag: 1.5 });
    if (this.onLit) this.onLit(G);
  }
  update(dt, G) { this.t += dt; if (this.lit && Math.random() < dt * 3) G.parts.add({ x: this.x + rand(-6, 6), y: this.y - rand(14, 30), vy: -10, life: 1, c: pick(['#8ff3ea', '#fff']), r: 1 }); }
  draw() {
    ell(this.x, this.y, 9, 3, 'rgba(0,0,0,.45)');
    hi(this.x, this.y, false, () => {
      D(-14, -12, 28, 12, '#3a3354'); D(-14, -12, 28, 3, '#4a4266'); D(-10, -16, 20, 5, '#2b2540');
      const lit = this.lit, pulse = Math.sin(this.t * 3) > 0;
      const c1 = lit ? '#8ff3ea' : '#4a3a7a', c2 = lit ? '#dffcff' : (pulse ? '#6a5aa0' : '#5a4a8a'), c3 = lit ? '#3ab0c0' : '#2a2050';
      const b = lit ? Math.round(Math.sin(this.t * 2) * 2) : 0;
      D(-7, -46 + b, 14, 28, c1); D(-5, -52 + b, 10, 6, c1); D(-2, -57 + b, 4, 5, c1); D(-4, -18 + b, 8, 3, c1);
      D(-7, -46 + b, 4, 26, c2); D(-5, -52 + b, 3, 6, c2); D(3, -44 + b, 4, 24, c3);
    });
  }
}

// ---------- cœurs de luciole ----------
class FireflyHeart {
  constructor(x, y) { this.x = x; this.y = y; this.w = 20; this.h = 10; this.solid = true; this.t = 0; }
  get taken() { return SAVE.firefly; }
  get light() { return { r: this.taken ? 24 : 60, c: 'rgba(255,230,140,' }; }
  canInteract() { return !this.taken; }
  interact(G, P) {
    SAVE.firefly = true; SAVE.maxHp += 2; G.healFull(); persist(); SFX.bigheart();
    G.raise('heart');
    G.say([{ text: 'Un cœur de luciole ! Ta vie maximale augmente d\'un cœur.' }, { who: 'Sacha', text: 'Alors c\'était ça, la lumière qu\'on voyait depuis le camping…' }, { who: 'Sacha', text: 'Mais d\'autres lueurs brillent plus au nord. On dirait l\'entrée d\'une grotte !' }]);
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

class HeartContainer {
  constructor(x, y) { this.x = x; this.y = y; this.w = 12; this.h = 8; this.t = 0; this.light = { r: 80, c: 'rgba(255,230,140,' }; }
  update(dt, G) {
    this.t += dt;
    if (Math.random() < dt * 10) G.parts.add({ x: this.x + rand(-12, 12), y: this.y - rand(6, 34), vy: -14, life: 1.2, c: pick(['#ffe27a', '#fff', '#8ff3ea']), r: 1 });
    const P = G.player;
    if (rectHit({ x: this.x - 8, y: this.y - 14, w: 16, h: 16 }, P.body())) {
      this.dead = true; SAVE[this.flag || 'heart2'] = true; SAVE.maxHp += 2; G.healFull(); persist(); SFX.bigheart(); G.raise('heart');
      G.say([{ text: 'Un grand cœur de luciole ! Ta vie maximale augmente d\'un cœur.' }]);
    }
  }
  draw() {
    const b = Math.sin(this.t * 3) * 2;
    ell(this.x, this.y, 6, 2, 'rgba(0,0,0,.35)');
    ctx.globalAlpha = 0.35; ell(this.x, this.y - 14 + b, 13, 13, '#ffe27a'); ctx.globalAlpha = 1;
    drawHeartShape(this.x, this.y - 14 + b, 3, '#ffcf3a', '#e09a20');
  }
}

// ---------- boss : la Grande Ombre ----------
// Elle est invulnérable tant que son œil est fermé. Quand l'œil s'ouvre, un caillou de lance-pierre l'étourdit :
// on a alors quelques secondes pour la frapper à la branche (3 coups maximum par étourdissement).
class GreatShadow extends Enemy {
  constructor(x, y, room) {
    super(x, y, { hp: 8, dmg: 2, room });
    this.w = 30; this.h = 12; this.state = 'sleep'; this.st = 0; this.isBoss = true; this.eye = 0; this.phase = 1;
    this.cd = 2.5; this.hits = 0; this.spawned = false; this.rise = 0;
    this.poof = ['#1a1030', '#4a2a7a', '#c3b3ff', '#000', '#ff3a6a'];
  }
  size() { return this.state === 'stun' ? 0.8 : this.state === 'intro' ? Math.max(0.1, this.rise) : this.state === 'sleep' ? 0.1 : 1; }
  body() { const s = this.size(); return { x: this.x - 17 * s, y: this.y - 34 * s, w: 34 * s, h: 34 * s }; }
  get light() { return this.eye > 0.3 ? { r: 64, c: 'rgba(255,70,120,' } : this.state === 'stun' ? { r: 44, c: 'rgba(195,179,255,' } : null; }
  clampArea(G) { const r = G.roomRect(); this.x = clamp(this.x, r.x + 64, r.x + r.w - 64); this.y = clamp(this.y, r.y + 80, r.y + r.h - 44); }
  wake(G) { if (this.state !== 'sleep') return; this.state = 'intro'; this.st = 1.8; SFX.roar(); G.shake = 0.6; }
  hit(dmg, fx, fy, G, src) {
    if (this.state === 'sleep' || this.state === 'intro' || this.state === 'dying') return;
    if (this.state === 'eye' && this.eye > 0.5 && src === 'stone') {
      this.state = 'stun'; this.st = 3.4; this.hits = 0; this.eye = 0; this.flash = 0.2;
      SFX.stun(); G.shake = 0.3; G.hitstop = 0.1;
      G.parts.burst(this.x, this.y - 20, 18, { c: ['#ff3a6a', '#fff', '#ffd23a'], life: 0.5, smin: 30, smax: 100, r: 2 });
      return;
    }
    if (this.state === 'stun' && src !== 'stone') {
      this.hp -= dmg || 1; this.hits += 1; this.flash = 0.2; SFX.bossHit(); G.hitstop = 0.08; G.shake = 0.15;
      const a = Math.atan2(this.y - fy, this.x - fx); this.kb = { x: Math.cos(a) * 110, y: Math.sin(a) * 110, t: 0.12 };
      G.parts.burst(this.x, this.y - 14, 10, { c: this.poof, life: 0.4, smin: 30, smax: 90, r: 2 });
      if (this.hp <= 4 && this.phase === 1) this.phase = 2;
      if (this.hp <= 0) {
        this.state = 'dying'; this.st = 2.2; SFX.bossDie(); G.shake = 0.5;
        for (const e of G.area.ents) { if (e !== this && e.isEnemy && !e.dead && e.room === this.room) e.die(G); if (e.isOrb) e.dead = true; }
      } else if (this.hits >= 3) { this.state = 'recover'; this.st = 0.5; }
      return;
    }
    // invulnérable : le coup rebondit
    SFX.tink();
    G.parts.burst(lerp(fx, this.x, 0.5), lerp(fy, this.y - 16, 0.5), 5, { c: ['#fff', '#c3b3ff'], life: 0.2, smin: 40, smax: 90, r: 1 });
    if (src !== 'stone') { const P = G.player, a = Math.atan2(P.y - this.y, P.x - this.x); P.kb = { x: Math.cos(a) * 140, y: Math.sin(a) * 140, t: 0.12 }; }
  }
  volley(G) {
    const n = this.phase === 1 ? 8 : 12, off = rand(0, 6.28); SFX.shoot();
    for (let i = 0; i < n; i++) { const o = new Orb(this.x, this.y - 30, off + i / n * Math.PI * 2); o.room = this.room; G.area.ents.push(o); }
  }
  update(dt, G) {
    this.t += dt; this.st -= dt; if (this.flash > 0) this.flash -= dt;
    if (this.kb.t > 0) { this.kb.t -= dt; this.x += this.kb.x * dt; this.y += this.kb.y * dt; this.clampArea(G); }
    const P = G.player, a = Math.atan2(P.y - this.y, P.x - this.x);
    if (this.state !== 'eye') this.eye = Math.max(0, this.eye - dt * 4);
    switch (this.state) {
      case 'sleep': return;
      case 'intro':
        this.rise = clamp(1 - this.st / 1.8, 0, 1);
        if (Math.random() < dt * 30) G.parts.add({ x: this.x + rand(-20, 20), y: this.y - rand(0, 10), vy: -30, life: 0.8, c: pick(['#1a1030', '#4a2a7a', '#000']), r: 2 });
        if (this.st <= 0) { this.state = 'float'; this.st = 2.5; this.rise = 1; }
        return;
      case 'float': {
        // jamais bloqué : s'il n'y a plus de cailloux, l'arène en fournit
        this.stoneCd = (this.stoneCd || 0) - dt;
        if (Inventory.ammo('cailloux') === 0 && this.stoneCd <= 0 && !G.area.ents.some(e => e.isPickup && e.kind === 'stones')) {
          this.stoneCd = 4; const rr = G.roomRect(); G.area.ents.push(Object.assign(new Pickup(rr.x + rand(80, 400), rr.y + rand(170, 220), 'stones'), { room: this.room }));
        }
        const sp = this.phase === 1 ? 30 : 46;
        this.vx = lerp(this.vx, Math.cos(a) * sp, dt * 2); this.vy = lerp(this.vy, Math.sin(a) * sp, dt * 2);
        this.x += (this.vx + Math.cos(this.t * 1.3) * 14) * dt; this.y += (this.vy + Math.sin(this.t * 1.9) * 8) * dt; this.clampArea(G);
        this.cd -= dt; if (this.cd <= 0) { this.cd = this.phase === 1 ? 4 : 2.8; this.volley(G); }
        if (this.st <= 0) { this.state = 'eye'; this.st = this.phase === 1 ? 2.2 : 1.6; }
        this.touch(G); return;
      }
      case 'eye':
        this.vx *= 0.9; this.vy *= 0.9; this.x += this.vx * dt; this.y += this.vy * dt; this.clampArea(G);
        this.eye = Math.min(1, this.eye + dt * 3);
        if (this.st <= 0) { this.state = 'float'; this.st = rand(2.4, 3.4); }
        this.touch(G); return;
      case 'stun':
        if (this.st <= 0) { this.state = 'recover'; this.st = 0.5; }
        return;
      case 'recover':
        if (this.st <= 0) {
          this.state = 'float'; this.st = 2.2; SFX.roar(); G.shake = 0.2;
          if (this.phase === 2 && !this.spawned) {
            this.spawned = true; const rr = G.roomRect();
            for (const dx of [-60, 60]) { const s = new Shadow(clamp(this.x + dx, rr.x + 60, rr.x + rr.w - 60), clamp(this.y + 20, rr.y + 70, rr.y + rr.h - 60), this.room); s.respawn = true; G.area.ents.push(s); G.parts.burst(s.x, s.y - 8, 12, { c: this.poof, life: 0.5, r: 2 }); }
          }
        }
        return;
      case 'dying':
        if (Math.random() < dt * 20) G.parts.burst(this.x + rand(-22, 22), this.y - rand(0, 34), 6, { c: ['#c3b3ff', '#fff', '#4a2a7a', '#ffe27a'], life: 0.5, smin: 20, smax: 60, r: 2 });
        if (this.st <= 0) {
          this.dead = true; G.shake = 0.5;
          G.parts.burst(this.x, this.y - 16, 46, { c: ['#ffe27a', '#fff', '#8ff3ea', '#c3b3ff'], life: 1.4, smin: 20, smax: 150, r: 2, drag: 1.5 });
        }
        return;
    }
  }
  draw() {
    if (this.state === 'sleep') {
      const p = 1 + Math.sin(this.t * 2) * 0.1;
      ell(this.x, this.y, 24 * p, 7 * p, 'rgba(8,3,16,.9)'); ell(this.x, this.y, 15 * p, 4 * p, 'rgba(45,22,80,.75)');
      if (Math.sin(this.t * 0.9) > 0.85) { R(this.x - 5, this.y - 1, 2, 1, '#ff3a6a'); R(this.x + 3, this.y - 1, 2, 1, '#ff3a6a'); }
      return;
    }
    const s = this.size(), fl = this.flash > 0, stun = this.state === 'stun', bob = Math.sin(this.t * 2.2) * 2 * s;
    ell(this.x, this.y, 22 * s, 6 * s, 'rgba(0,0,0,.5)');
    if (this.state === 'dying' && Math.floor(this.t * 20) % 2) return;
    hi(this.x, this.y - 4 + bob, false, () => {
      const wob = Math.round(Math.sin(this.t * 4) * 3), W2 = 70 + wob, H2 = 62 - wob;
      const c1 = fl ? '#fff' : stun ? '#3a2d5a' : '#0d0718', c2 = fl ? '#fff' : stun ? '#5a4a7a' : '#24123e', c3 = fl ? '#fff' : stun ? '#7a6a9a' : '#3d2466';
      for (const sd of [-1, 1]) { // bras
        const wv = Math.round(Math.sin(this.t * 3 + sd) * 6), ax = sd < 0 ? -W2 / 2 - 14 : W2 / 2;
        D(ax, -H2 * 0.55 + wv, 14, 8, c1); D(sd < 0 ? ax - 6 : ax + 12, -H2 * 0.55 + wv + 6, 8, 12, c1);
      }
      D(-W2 / 2, -H2, W2, H2, c1); D(-W2 / 2 + 6, -H2 - 8, W2 - 12, 8, c1); D(-W2 / 2 + 16, -H2 - 13, W2 - 32, 5, c1);
      D(-W2 / 2 + 4, -H2 + 4, 6, H2 - 14, c2); D(-W2 / 2 + 10, -H2 - 6, 14, 3, c3); D(-W2 / 2 + 8, -H2 - 2, 6, 4, c2);
      for (let i = 0; i < 7; i++) { const fx = -W2 / 2 + i * (W2 / 7), o = (Math.floor(this.t * 7) + i) % 2; D(fx, -4 + o * 3, W2 / 7 - 1, 6, c1); }
      const ey = Math.round(-H2 * 0.58);
      if (this.eye > 0.08) {
        const eh = Math.max(2, Math.round(20 * this.eye)), ew = 32;
        D(-ew / 2, ey - eh / 2, ew, eh, '#f4f7ff'); D(-ew / 2 + 3, ey - eh / 2 - 2, ew - 6, 2, '#f4f7ff'); D(-ew / 2 + 3, ey + eh / 2, ew - 6, 2, '#f4f7ff');
        if (eh > 8) { const P = G.player, ang = Math.atan2(P.y - this.y, P.x - this.x), ox = Math.round(Math.cos(ang) * 7), oy = Math.round(Math.sin(ang) * 3); D(-7 + ox, ey - 7 + oy, 14, 14, '#ff3a6a'); D(-3 + ox, ey - 4 + oy, 6, 8, '#1a0010'); D(-6 + ox, ey - 6 + oy, 3, 3, '#ffd0d8'); }
      } else if (stun) {
        D(-16, ey - 2, 10, 3, '#c3b3ff'); D(6, ey - 2, 10, 3, '#c3b3ff'); D(-6, -H2 * 0.25, 12, 6, '#1a1030');
      } else {
        D(-16, ey, 32, 3, '#6a4a9a'); D(-12, ey + 3, 24, 2, '#3d2466');
        D(-27, ey - 14, 6, 6, '#ff3a6a'); D(21, ey - 14, 6, 6, '#ff3a6a');
      }
      if (!stun) { const my = Math.round(-H2 * 0.24); D(-13, my, 26, 5, '#000'); for (let i = 0; i < 4; i++) D(-12 + i * 7, my, 3, 4, '#f4f7ff'); }
    }, s);
    if (stun) for (let i = 0; i < 4; i++) { const a = this.t * 4 + i * Math.PI / 2; R(half(this.x + Math.cos(a) * 15), half(this.y - 42 * s + Math.sin(a) * 4), 2, 2, i % 2 ? '#ffe27a' : '#fff'); }
  }
}
