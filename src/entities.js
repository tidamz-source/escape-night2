'use strict';
// ---------- zones de jeu ----------
class Area {
  constructor(id, grid, theme) {
    this.id = id; this.g = grid; this.theme = theme;
    this.cols = grid[0].length; this.rows = grid.length;
    this.w = this.cols * TS; this.h = this.rows * TS;
    this.layer = renderLayer(grid, theme);
    this.props = []; this.ents = [];
    this.rooms = null; // { cols, rows } pour les zones découpées en salles
  }
  rerender() { this.layer = renderLayer(this.g, this.theme); }
  tile(tx, ty) { if (tx < 0 || ty < 0 || tx >= this.cols || ty >= this.rows) return this.theme === 'camp' ? '#' : 'W'; return this.g[ty][tx]; }
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
    if (SOLID.has(t) && !(opts.swim && t === '~')) return true;
    if (opts.noExit && (EXITS.has(t) || t === 'g')) return true;
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
      if (opts.slide && !dy) for (const o of [1, -1, 2, -2, 3, -3, 4, -4]) {
        const t = { x: e.x + dx - e.w / 2, y: e.y + o - e.h, w: e.w, h: e.h };
        if (!blocked(area, t, e, opts)) { e.y += Math.sign(o) * Math.min(Math.abs(dx), 1); break; }
      }
    }
  }
  if (dy) {
    e.y += dy;
    if (blocked(area, boxOf(e), e, opts)) {
      e.y -= dy; hit = true;
      if (opts.slide && !dx) for (const o of [1, -1, 2, -2, 3, -3, 4, -4]) {
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

// ---------- le héros ----------
const DIRS = ['down', 'up', 'left', 'right'];
const DV = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
const ATK_TIME = 0.24;
class Player {
  constructor(x, y, dir = 'down') {
    this.x = x; this.y = y; this.w = 10; this.h = 6; this.dir = dir;
    this.anim = 0; this.moving = false; this.atk = 0; this.atkHit = new Set();
    this.inv = 0; this.kb = { x: 0, y: 0, t: 0 }; this.hp = SAVE.maxHp; this.bump = 0;
    this.vx = 0; this.vy = 0; // vitesse lissée (accélération / freinage)
    this.shootCd = 0; this.shootT = 0; this.pushT = 0; this.aim = DV[dir].slice();
    this.roll = 0; this.rollCd = 0; this.rollV = [0, 0];
    this.dive = 0; this.diveCd = 0; this.pull = null; this.hooking = null; this.riding = null; this.safe = { x, y };
  }
  // déplacement à la nage : plus lent, pas d'attaque ni d'outil
  swimMove(dt, G) {
    const dx = Input.dx, dy = Input.dy, input = Math.hypot(dx, dy) > 0.2, SP = 52 * this.perk.speed;
    if (input) { const want = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down'); this.dir = want; }
    if (G.area.current) { const c = G.area.current(this); if (c) { this.vx += c.x * dt * 3; this.vy += c.y * dt * 3; } }
    this.glide(dt, G, input ? dx * SP : 0, input ? dy * SP : 0, input ? 8 : 4, input ? { x: dx, y: dy } : null);
    this.moving = input; this.anim += dt * (input ? 1 : 0.4);
    if (Math.random() < dt * 4) G.parts.add({ x: this.x + rand(-6, 6), y: this.y - 2, vy: -6, life: 0.5, c: '#9ab8ff', r: 1 });
  }
  // fin d'un vol au grappin : si on atterrit dans le vide, retour au dernier sol sûr
  land(G) {
    const t = G.area.tileAt(this.x, this.y - 2);
    if (t === 'v' || t === 'T' || (t === '~' && !this.canSwim) || blocked(G.area, boxOf(this), this, { swim: this.canSwim })) {
      // cherche une place libre tout près
      for (const r of [4, 8, 12, 16, 20]) for (let k = 0; k < 8; k++) {
        const a = k / 8 * Math.PI * 2, x = this.x + Math.cos(a) * r, y = this.y + Math.sin(a) * r, tt = G.area.tileAt(x, y - 2);
        if (tt !== 'v' && tt !== 'T' && (tt !== '~' || this.canSwim) && !blocked(G.area, { x: x - this.w / 2, y: y - this.h, w: this.w, h: this.h }, this, { swim: this.canSwim })) { this.x = x; this.y = y; return; }
      }
      this.x = this.safe.x; this.y = this.safe.y;
    }
  }
  get perk() { return Heroes.def(); }
  body() { return { x: this.x - 6, y: this.y - 16, w: 12, h: 16 }; }
  atkBox() {
    const x = this.x, y = this.y, k = this.perk.reach, e = Math.round(22 * (k - 1)); // Cam : portée +20 %
    switch (this.dir) {
      case 'down': return { x: x - 13, y: y - 4, w: 26, h: 20 + e };
      case 'up': return { x: x - 13, y: y - 38 - e, w: 26, h: 22 + e };
      case 'left': return { x: x - 28 - e, y: y - 24, w: 24 + e, h: 26 };
      default: return { x: x + 4, y: y - 24, w: 24 + e, h: 26 };
    }
  }
  frontBox() { const [vx, vy] = DV[this.dir]; return { x: this.x - 5 + vx * 10, y: this.y - 8 + vy * 10, w: 10, h: 10 }; }
  hurt(dmg, fx, fy, G) {
    if (this.inv > 0 || this.roll > 0 || this.dive > 0 || this.riding || G.state !== 'play') return;
    this.hp -= dmg; this.inv = 1.1; SFX.hurt(); G.shake = 0.25; G.hitstop = 0.06;
    const a = Math.atan2(this.y - 8 - fy, this.x - fx); this.kb = { x: Math.cos(a) * 170, y: Math.sin(a) * 170, t: 0.16 };
    this.atk = 0;
    if (this.hp <= 0) { this.hp = 0; G.gameOver(); }
  }
  get canSwim() { return Inventory.has('palmes'); }
  get swimming() { return this.canSwim && G.area.tileAt(this.x, this.y - 2) === '~'; }
  update(dt, G) {
    const area = G.area;
    // minuteurs : toujours décomptés, quoi que fasse le héros (sinon il peut rester invincible)
    if (this.inv > 0) this.inv -= dt;
    if (this.dive > 0) { this.dive -= dt; if (this.dive <= 0 && this.swimming) SFX.splash(); }
    if (this.hooking && (this.hooking.dead || !area.ents.includes(this.hooking))) this.hooking = null;
    if (this.riding) { this.x = this.riding.x; this.y = this.riding.y + 2; this.vx = this.vy = 0; this.moving = false; return; }
    if (this.pull) { // grappin : on file vers le point d'accroche, au-dessus du vide et de l'eau
      const pl = this.pull, a = Math.atan2(pl.y - this.y, pl.x - this.x), d = dist(this.x, this.y, pl.x, pl.y), step = Math.min(d, 260 * dt);
      const nx = this.x + Math.cos(a) * step, ny = this.y + Math.sin(a) * step;
      if (d < 2 || WALLS.has(area.tileAt(nx, ny - 2)) || (pl.t = (pl.t || 0) + dt) > 1.2) { this.pull = null; this.land(G); return; }
      this.x = nx; this.y = ny; this.anim += dt; return;
    }
    if (this.hooking) { this.glide(dt, G, 0, 0, 14); return; }
    if (this.bump > 0) this.bump -= dt;
    if (this.shootCd > 0) this.shootCd -= dt;
    if (this.shootT > 0) this.shootT -= dt;
    if (this.rollCd > 0) this.rollCd -= dt;
    if (this.roll > 0) { // roulade : rapide, intouchable
      this.roll -= dt; this.anim += dt * 2;
      moveEnt(area, this, this.rollV[0] * dt, 0, { slide: true }); moveEnt(area, this, 0, this.rollV[1] * dt, { slide: true });
      if (Math.random() < dt * 30) G.parts.add({ x: this.x + rand(-4, 4), y: this.y - 1, vy: -10, life: 0.3, c: '#9a8a7a', r: 1 });
      return;
    }
    if (this.kb.t > 0) { this.kb.t -= dt; this.vx = this.vy = 0; moveEnt(area, this, this.kb.x * dt, 0, { noExit: true, swim: this.canSwim }); moveEnt(area, this, 0, this.kb.y * dt, { noExit: true, swim: this.canSwim }); return; }
    if (this.atk > 0) {
      this.atk -= dt; this.glide(dt, G, 0, 0, 14);
      if (this.atk < ATK_TIME - 0.04) G.attackHits(this);
      return;
    }
    // changer d'outil
    if (Input.pressed('cycle')) Inventory.cycle(1);
    const swim = this.swimming;
    if (swim) { // à la nage : A ou B pour plonger (on esquive tout, on ramasse ce qui brille au fond)
      if ((Input.pressed('a') || Input.pressed('b')) && this.dive <= 0 && this.diveCd <= 0) { this.dive = 0.9; this.diveCd = 1.3; SFX.dive(); G.parts.burst(this.x, this.y - 4, 10, { c: ['#9ab8ff', '#fff'], life: 0.4, r: 1, up: 30, g: 120 }); }
    }
    if (this.diveCd > 0) this.diveCd -= dt;
    if (swim) { this.swimMove(dt, G); return; }
    // B : outil équipé
    if (Input.pressed('b') && this.shootCd <= 0) this.useTool(G);
    // roulade (Rox)
    if (Input.pressed('r') && this.perk.roll && this.rollCd <= 0) {
      const m = Math.hypot(Input.dx, Input.dy), v = m > 0.2 ? [Input.dx / m, Input.dy / m] : DV[this.dir];
      this.roll = 0.3; this.rollCd = 0.7; this.rollV = [v[0] * 190, v[1] * 190]; SFX.roll(); return;
    }
    // A : interaction ou attaque
    if (Input.pressed('a')) {
      const target = G.interactTarget(this);
      if (target) { target.interact(G, this); return; }
      if (!SAVE.got_branche) return; // pas encore d'arme
      this.atk = ATK_TIME; this.atkHit.clear(); SFX.swing(); return;
    }
    let dx = Input.dx, dy = Input.dy;
    const input = Math.hypot(dx, dy) > 0.2;
    if (input) {
      // visée en 8 directions pour le lance-pierre
      const ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
      this.aim = [Math.round(Math.cos(ang) * 1000) / 1000, Math.round(Math.sin(ang) * 1000) / 1000];
      // direction : on garde l'orientation courante en diagonale (comme ALttP)
      const want = Math.abs(dx) > Math.abs(dy) + 0.01 ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
      const cur = DV[this.dir], keep = (cur[0] && Math.sign(dx) === cur[0] && Math.abs(dx) > 0.3) || (cur[1] && Math.sign(dy) === cur[1] && Math.abs(dy) > 0.3);
      if (!keep) this.dir = want;
      // vue en 8 directions (affichage seulement : l'épée et les interactions restent en 4 directions)
      if (this.aim[0] && this.aim[1]) { this.look = (this.aim[1] > 0 ? 'down' : 'up') + '_' + (this.aim[0] > 0 ? 'right' : 'left'); this.diagT = 0.12; }
      else if ((this.diagT -= dt) <= 0 || !(this.look || '').includes('_')) this.look = this.dir; // petit délai : relâcher deux touches n'est jamais simultané
    }
    const SPEED = 76 * this.perk.speed; // Rox : +10 %
    // accélération vive au démarrage, freinage plus doux à l'arrêt
    const hit = this.glide(dt, G, input ? dx * SPEED : 0, input ? dy * SPEED : 0, input ? 20 : 9, input ? { x: dx, y: dy } : null);
    const speed = Math.hypot(this.vx, this.vy);
    this.moving = input || speed > 18;
    if (this.moving) this.anim += dt * (input ? 1 : clamp(speed / SPEED, 0.4, 1)); else this.anim = 0;
    if (hit && input && this.bump <= 0) G.bumped(this);
    // pousser un bloc : rester appuyé contre lui un court instant
    let pushing = false;
    if (hit && input) {
      const [vx, vy] = DV[this.dir];
      const aligned = vx ? Math.sign(dx) === vx && Math.abs(dy) < 0.5 : Math.sign(dy) === vy && Math.abs(dx) < 0.5;
      const blk = aligned && G.frontEnt(this, e => e instanceof Block);
      if (blk) { pushing = true; this.pushT += dt; if (this.pushT > 0.3) { blk.push(this.dir, G); this.pushT = 0; } }
    }
    if (!pushing) this.pushT = 0;
  }
  useTool(G) {
    const tool = Inventory.tool(); if (!tool) return;
    if (tool === 'lance_pierre') {
      if (!Inventory.useAmmo('cailloux')) { SFX.nope(); Input.toast = { msg: 'Plus de cailloux !', t: 1.5 }; this.shootCd = 0.4; return; }
      this.shootCd = 0.3; this.shootT = 0.18; SFX.sling();
      G.area.ents.push(new Pebble(this.x, this.y, this.aim[0], this.aim[1], G.room));
    }
    if (tool === 'frisbee') {
      if (G.area.ents.some(e => e.isFrisbee && !e.dead)) return; // un seul frisbee à la fois
      this.shootCd = 0.25; this.shootT = 0.18; SFX.throw();
      G.area.ents.push(new Frisbee(this, this.aim[0], this.aim[1], G.room));
    }
    if (tool === 'grappin') {
      if (this.hooking) return;
      this.shootCd = 0.3; this.vx = this.vy = 0; SFX.hook();
      this.hooking = new Hook(this, this.aim[0], this.aim[1], G.room); G.area.ents.push(this.hooking);
    }
    if (tool === 'petards') {
      if (G.area.ents.filter(e => e.isPetard && !e.dead).length >= 2) return;
      if (!Inventory.useAmmo('petards')) { SFX.nope(); Input.toast = { msg: 'Plus de pétards !', t: 1.5 }; this.shootCd = 0.4; return; }
      this.shootCd = 0.35; this.shootT = 0.18; SFX.throw();
      const moving = Math.hypot(this.vx, this.vy) > 20;
      G.area.ents.push(new Petard(this.x, this.y, this.aim[0], this.aim[1], moving ? 1 : 0.45, G.room));
    }
  }
  // fait tendre la vitesse vers (tx, ty) puis déplace Sacha ; renvoie true en cas de collision
  glide(dt, G, tx, ty, k, inp) {
    const f = 1 - Math.exp(-k * dt);
    this.vx += (tx - this.vx) * f; this.vy += (ty - this.vy) * f;
    if (!inp && Math.hypot(this.vx, this.vy) < 4) { this.vx = 0; this.vy = 0; return false; }
    // pas d'aide dans les coins contre un bloc : on veut pouvoir le pousser
    const nearBlock = inp && G.frontEnt(this, e => e instanceof Block);
    const sx = inp && !nearBlock ? (!inp.y || Math.abs(inp.y) < 0.2) : false, sy = inp && !nearBlock ? (!inp.x || Math.abs(inp.x) < 0.2) : false;
    const sw = this.canSwim;
    const hx = moveEnt(G.area, this, this.vx * dt, 0, { slide: sx, swim: sw }), hy = moveEnt(G.area, this, 0, this.vy * dt, { slide: sy, swim: sw });
    if (hx) this.vx = 0; if (hy) this.vy = 0;
    const tt = G.area.tileAt(this.x, this.y - 2); if (tt !== '~' && tt !== 'v' && tt !== 'T') { this.safe.x = this.x; this.safe.y = this.y; }
    return hx || hy;
  }
  draw() {
    if (this.inv > 0 && Math.floor(this.inv * 20) % 2) return;
    if (this.swimming && !this.pull) { drawSwimmer(SAVE.hero, this.x, this.y, this.dir, this.anim, this.dive > 0); return; }
    if (this.riding) { drawHero(SAVE.hero, this.x, this.y - 6, 'down', false, G.t); return; }
    ell(this.x, this.y, 6, 2.5, 'rgba(0,0,0,.35)');
    const attacking = this.atk > 0;
    const [vx, vy] = DV[this.dir], lunge = attacking ? 1.5 : 0;
    const p = attacking ? 1 - this.atk / ATK_TIME : 0;
    if (attacking && this.dir === 'up') this.drawBranch(p);
    if ((this.shootT > 0 || this.hooking) && this.dir === 'up') this.drawSling();
    if (this.roll > 0) { const k = 1 - this.roll / 0.3; ctx.save(); ctx.translate(this.x, this.y - 8); ctx.rotate(Math.sign(this.rollV[0] || 1) * k * Math.PI * 2); ctx.translate(-this.x, -this.y + 8); }
    const look = !attacking && this.look && this.look.split('_').includes(this.dir) && heroHasDir(SAVE.hero, this.look) ? this.look : this.dir;
    drawHero(SAVE.hero, this.x + vx * lunge, this.y + vy * lunge, look, (this.moving && !attacking) || this.roll > 0, this.moving ? this.anim : G.t);
    if (this.roll > 0) ctx.restore();
    if (Inventory.has('bouclier') && !attacking && this.roll <= 0 && this.dir !== 'up') this.drawShield();
    if (attacking && this.dir !== 'up') this.drawBranch(p);
    if ((this.shootT > 0 || this.hooking) && this.dir !== 'up') this.drawSling();
  }
  drawShield() {
    const [vx] = DV[this.dir], x = this.x + (this.dir === 'down' ? 6 : vx * 6), y = this.y - 8;
    hi(x, y, vx < 0, () => { D(-4, -8, 8, 12, '#7a4a24'); D(-4, -8, 8, 2, '#a06a34'); D(-4, -8, 2, 12, '#9a6a3a'); D(-1, -4, 2, 4, '#c8a040'); D(-4, 3, 8, 1, '#4a2a14'); });
  }
  drawSling() {
    const [vx, vy] = this.aim, k = Math.max(0, this.shootT) / 0.18;
    const x = this.x + vx * (7 + k * 2), y = this.y - 10 + vy * 4;
    if (Inventory.tool() === 'frisbee') { if (!G.area.ents.some(e => e.isFrisbee)) drawFrisbeeIcon(x, y, 0.8); }
    else if (Inventory.tool() === 'grappin') drawHookIcon(x, y, 0.8);
    else if (Inventory.tool() === 'petards') drawPetardIcon(x, y, 0.8);
    else drawSlingIcon(x, y, 1, vx < 0);
  }
  drawBranch(p) {
    // la branche balaie un arc de 130° devant Sacha
    const base = { down: Math.PI / 2, up: -Math.PI / 2, left: Math.PI, right: 0 }[this.dir];
    const sweep = this.dir === 'left' ? -1 : 1;
    const ang = base + sweep * lerp(-1.15, 1.15, Math.min(1, p * 1.6));
    const hx = this.x + (this.dir === 'left' ? -4 : this.dir === 'right' ? 4 : 0), hy = this.y - (this.dir === 'up' ? 13 : 9);
    const L = Math.round(17 * this.perk.reach), ex = hx + Math.cos(ang) * L, ey = hy + Math.sin(ang) * L, sword = SAVE.inv.weapon === 'epee_bois' || SAVE.inv.weapon === 'epee_fer', iron = SAVE.inv.weapon === 'epee_fer';
    ctx.lineCap = 'round';
    if (sword) { // épée de bois : lame claire, garde
      ctx.strokeStyle = '#3a2214'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.strokeStyle = iron ? '#c8ccd8' : '#d8b07a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(hx + Math.cos(ang) * 4, hy + Math.sin(ang) * 4); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.strokeStyle = iron ? '#ffffff' : '#f0d8a8'; ctx.lineWidth = 0.75; ctx.beginPath(); ctx.moveTo(hx + Math.cos(ang) * 5, hy + Math.sin(ang) * 5 - 0.5); ctx.lineTo(ex, ey - 0.5); ctx.stroke();
      const gx = hx + Math.cos(ang) * 4, gy = hy + Math.sin(ang) * 4, px = -Math.sin(ang) * 3, py = Math.cos(ang) * 3;
      ctx.strokeStyle = '#6a4224'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx - px, gy - py); ctx.lineTo(gx + px, gy + py); ctx.stroke();
    } else {
      ctx.strokeStyle = '#3a2214'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.strokeStyle = '#8a5a34'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.strokeStyle = '#b07a48'; ctx.lineWidth = 0.75; ctx.beginPath(); ctx.moveTo(hx, hy - 0.5); ctx.lineTo(ex, ey - 0.5); ctx.stroke();
      const lx = hx + Math.cos(ang) * (L - 3), ly = hy + Math.sin(ang) * (L - 3);
      R(half(lx - 1), half(ly - 2), 2.5, 2, '#4f9a5a'); R(half(ex - 1), half(ey - 1), 2, 2, '#6fc070');
    }
    // trainée
    if (p < 0.75) { ctx.globalAlpha = 0.35 * (1 - p); ctx.strokeStyle = PAL.glow; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(hx, hy, L, ang - sweep * 0.9, ang, sweep < 0); ctx.stroke(); ctx.globalAlpha = 1; }
  }
}

// ---------- ennemis ----------
class Enemy {
  constructor(x, y, o) { this.x = this.sx = x; this.y = this.sy = y; this.w = 12; this.h = 8; this.hp = this.maxHp = o.hp; this.dmg = o.dmg; this.kb = { x: 0, y: 0, t: 0 }; this.flash = 0; this.t = rand(0, 5); this.room = o.room; this.dead = false; this.vx = 0; this.vy = 0; this.face = 1; this.isEnemy = true; }
  body() { return { x: this.x - this.w / 2, y: this.y - this.h - 6, w: this.w, h: this.h + 6 }; }
  reset() { this.x = this.sx; this.y = this.sy; this.hp = this.maxHp; this.kb.t = 0; this.flash = 0; }
  hit(dmg, fx, fy, G, src) {
    this.hp -= dmg || 1; this.flash = 0.18; SFX.hit(); G.hitstop = 0.05; G.shake = 0.08;
    const a = Math.atan2(this.y - fy, this.x - fx); this.kb = { x: Math.cos(a) * 190, y: Math.sin(a) * 190, t: 0.14 };
    G.parts.burst(this.x, this.y - 8, 5, { c: ['#fff', PAL.glow], life: 0.25, smin: 30, smax: 90, r: 1 });
    if (this.hp <= 0) this.die(G);
  }
  die(G) {
    this.dead = true; SFX.kill();
    G.parts.burst(this.x, this.y - 6, 16, { c: this.poof || ['#c3b3ff', '#8ff3ea', '#fff'], life: 0.5, smin: 15, smax: 60, r: 2, shrink: true, drag: 3 });
    dropLoot(G, this.loot, this.x, this.y);
    Quests.onKill(G, this);
  }
  physics(dt, G, fly) {
    if (this.flash > 0) this.flash -= dt;
    if (this.hookT > 0) { this.hookT -= dt; const P = G.player, a = Math.atan2(P.y - this.y, P.x - this.x); if (dist(P.x, P.y, this.x, this.y) > 18) { if (fly) { this.x += Math.cos(a) * 200 * dt; this.y += Math.sin(a) * 200 * dt; } else { moveEnt(G.area, this, Math.cos(a) * 200 * dt, 0, { noExit: true }); moveEnt(G.area, this, 0, Math.sin(a) * 200 * dt, { noExit: true }); } } return true; }
    if (this.kb.t > 0) { this.kb.t -= dt; if (fly) { this.x += this.kb.x * dt; this.y += this.kb.y * dt; this.clampArea(G); } else { moveEnt(G.area, this, this.kb.x * dt, 0, { noExit: true }); moveEnt(G.area, this, 0, this.kb.y * dt, { noExit: true }); } return true; }
    if (this.stunT > 0) { this.stunT -= dt; this.touchStunned = true; return true; } // étourdi (frisbee)
    return false;
  }
  clampArea(G) { const r = G.area.enemyBounds || G.roomRect(); this.x = clamp(this.x, r.x + 20, r.x + r.w - 20); this.y = clamp(this.y, r.y + 24, r.y + r.h - 16); }
  touch(G) { const P = G.player; if (rectHit(this.body(), P.body())) P.hurt(this.dmg, this.x, this.y - 6, G); }
}

class Raccoon extends Enemy {
  constructor(x, y, room) { super(x, y, { hp: 2, dmg: 1, room }); this.state = 'wander'; this.st = rand(0.5, 2); this.poof = ['#7a7f8c', '#c8ccd6', '#3a3d48']; this.loot = 'raccoon'; }
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
  constructor(x, y, room) { super(x, y, { hp: 1, dmg: 1, room }); this.w = 10; this.h = 6; this.state = 'idle'; this.st = rand(0, 1); this.alt = 14; this.poof = ['#3a2a4a', '#8a6aaa', '#fff']; this.loot = 'bat'; }
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
    const f = Math.floor(this.t * 14) % 2, fl = this.flash > 0, b = fl ? '#fff' : '#6a4a86', wc = fl ? '#fff' : '#4a3266', wl = fl ? '#fff' : '#8a6ab0';
    hi(this.x, this.y - this.alt + Math.sin(this.t * 10), false, () => {
      if (f) { D(-22, -6, 14, 4, wc); D(-24, -4, 4, 6, wc); D(8, -6, 14, 4, wc); D(20, -4, 4, 6, wc); D(-18, -2, 3, 3, wl); D(15, -2, 3, 3, wl); }
      else { D(-20, -14, 12, 4, wc); D(-24, -18, 6, 6, wc); D(8, -14, 12, 4, wc); D(18, -18, 6, 6, wc); D(-16, -10, 8, 3, wl); D(8, -10, 8, 3, wl); }
      D(-8, -10, 16, 12, b); D(-6, -14, 4, 5, b); D(2, -14, 4, 5, b);
      D(-5, -6, 3, 2, '#ff5a6a'); D(2, -6, 3, 2, '#ff5a6a'); D(-2, -1, 1, 2, '#fff'); D(1, -1, 1, 2, '#fff');
    });
  }
}

class Shadow extends Enemy {
  constructor(x, y, room) { super(x, y, { hp: 3, dmg: 2, room }); this.w = 14; this.h = 8; this.st = 0; this.poof = ['#1a1030', '#4a2a7a', '#c3b3ff', '#000']; this.loot = 'shadow'; }
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
  constructor(x, y, room) { super(x, y, { hp: 2, dmg: 1, room }); this.w = 10; this.h = 6; this.cd = rand(1.5, 2.5); this.alt = 12; this.light = { r: 46, c: 'rgba(120,220,255,' }; this.poof = ['#dff8ff', '#6fd3ff', '#2a8aff']; this.loot = 'wisp'; }
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
    if (WALLS.has(G.area.tileAt(this.x, this.y - 2)) || this.t > 3) { this.dead = true; G.parts.burst(this.x, this.y - this.alt, 5, { c: ['#9fe8ff', '#fff'], life: 0.25, r: 1 }); return; }
    const P = G.player;
    if (rectHit(this.body(), P.body())) {
      const [fx, fy] = DV[P.dir], n = Math.hypot(this.vx, this.vy) || 1;
      if (Inventory.has('bouclier') && P.atk <= 0 && (fx * this.vx + fy * this.vy) / n < -0.5) { SFX.tink(); G.parts.burst(this.x, this.y - this.alt, 6, { c: ['#fff', '#c8a040'], life: 0.25, r: 1 }); }
      else P.hurt(1, this.x, this.y, G);
      this.dead = true;
    }
  }
  hit(d, fx, fy, G) { this.dead = true; G.parts.burst(this.x, this.y - this.alt, 6, { c: ['#9fe8ff', '#fff'], life: 0.3, r: 1 }); SFX.hit(); }
  draw() { const y = this.y - this.alt; ell(this.x, this.y, 2.5, 1, 'rgba(0,0,0,.3)'); ell(this.x, y, 3.5, 3.5, '#6fd3ff'); ell(this.x, y, 2, 2, '#fff'); }
}

