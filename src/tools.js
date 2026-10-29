'use strict';
// ---------- outils des donjons 3 à 6 (grappin, pétards, palmes) et mécanismes partagés ----------

// ---------- icônes ----------
function drawHookIcon(x, y, s = 1) {
  hi(x, y, false, () => {
    const u = 2 * s;
    D(-6 * u, 1 * u, 7 * u, 3 * u, '#6a4224'); D(-6 * u, 1 * u, 7 * u, 1 * u, '#8a5a34');            // poignée
    for (let i = 0; i < 3; i++) D((-1 + i * 2) * u, (-1 - i * 2) * u, 2 * u, 2 * u, '#9a9eaa');      // chaîne
    D(4 * u, -7 * u, 3 * u, 3 * u, '#c8ccd8'); D(2 * u, -8 * u, 2 * u, 2 * u, '#c8ccd8'); D(6 * u, -5 * u, 2 * u, 2 * u, '#c8ccd8'); D(5 * u, -6 * u, 1 * u, 1 * u, '#fff');
  }, 1);
}
function drawPetardIcon(x, y, s = 1) {
  hi(x, y, false, () => {
    const u = 2 * s;
    D(-3 * u, -3 * u, 6 * u, 9 * u, '#d83a3a'); D(-3 * u, -3 * u, 2 * u, 9 * u, '#ff6a5a'); D(-3 * u, 0, 6 * u, 1 * u, '#ffe27a'); D(-3 * u, 3 * u, 6 * u, 1 * u, '#ffe27a');
    D(0, -6 * u, 1 * u, 3 * u, '#3a2414'); D(1 * u, -8 * u, 2 * u, 2 * u, '#ffcf3a'); D(1 * u, -8 * u, 1 * u, 1 * u, '#fff');
  }, 1);
}
function drawPalmesIcon(x, y, s = 1) {
  hi(x, y, false, () => {
    const u = 2 * s;
    D(-6 * u, -2 * u, 5 * u, 8 * u, '#2a8ad0'); D(-7 * u, 4 * u, 7 * u, 2 * u, '#2a8ad0'); D(1 * u, -2 * u, 5 * u, 8 * u, '#2a8ad0'); D(0, 4 * u, 7 * u, 2 * u, '#2a8ad0');
    D(-6 * u, -2 * u, 5 * u, 1 * u, '#6ac0ff'); D(1 * u, -2 * u, 5 * u, 1 * u, '#6ac0ff');
    D(-2 * u, -8 * u, 4 * u, 4 * u, '#ffcf3a'); D(1 * u, -10 * u, 1 * u, 3 * u, '#ffcf3a'); // tuba
  }, 1);
}
function drawSealIcon(x, y, s = 1, c = '#c3b3ff') {
  hi(x, y, false, () => { const u = 2 * s; D(-4 * u, -4 * u, 8 * u, 8 * u, '#3a2a6a'); D(-3 * u, -3 * u, 6 * u, 6 * u, c); D(-1 * u, -5 * u, 2 * u, 10 * u, c); D(-5 * u, -1 * u, 10 * u, 2 * u, c); D(-1 * u, -1 * u, 2 * u, 2 * u, '#fff'); }, 1);
}

// nageur vu de dessus (sprites de la piscine d'Escape Night)
function drawSwimmer(id, x, y, dir, t, diving, moving) {
  if (diving) { ctx.globalAlpha = 0.35; ell(x, y - 2, 8, 3, '#0a1a4a'); ctx.globalAlpha = 1; if (Math.floor(t * 8) % 2) R(half(x + 2), half(y - 6), 1.5, 1.5, '#cfe0ff'); return; }
  // le héros normal, enfoncé dans l'eau jusqu'à la poitrine, qui monte et descend doucement
  const wl = y - 3, bob = Math.sin(G.t * (moving ? 7 : 3)) * (moving ? 1.2 : 0.8), sink = 15 + bob;
  ctx.globalAlpha = 0.35; ell(x, wl + 1, 10, 3, '#0a2050'); ctx.globalAlpha = 1;          // silhouette sous l'eau
  ctx.save(); ctx.beginPath(); ctx.rect(x - 30, wl - 70, 60, 70); ctx.clip();
  drawHero(id, x, y + sink, dir, false, t); ctx.restore();
  // onde : un anneau d'écume autour du corps et des cercles qui s'élargissent
  ctx.save(); ctx.lineWidth = 0.8;
  ctx.strokeStyle = 'rgba(225,240,255,.7)'; ctx.beginPath(); ctx.ellipse(x, wl, 8.5, 2.2, 0, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 2; i++) { const k = (G.t * (moving ? 1.4 : 0.7) + i * 0.5) % 1; ctx.strokeStyle = `rgba(210,230,255,${(0.45 * (1 - k)).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(x, wl + 0.5, 9 + k * 10, 2.5 + k * 3, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
  R(half(x - 9), half(wl - 0.5), 2, 1, '#eaf4ff'); R(half(x + 7), half(wl - 0.5), 2, 1, '#eaf4ff');
}

// ---------- le grappin ----------
const HOOK_RANGE = 136;
class Hook {
  constructor(P, ax, ay, room) {
    const n = Math.hypot(ax, ay) || 1; this.dx = ax / n; this.dy = ay / n; this.P = P; this.d = 0; this.phase = 'out';
    this.room = room; this.isShot = true; this.isHook = true; this.w = 6; this.h = 4; this.alt = 10; this.carry = null; this.x = P.x; this.y = P.y;
  }
  get ox() { return this.P.x + this.dx * 4; }
  get oy() { return this.P.y + this.dy * 2; }
  back() { if (this.phase === 'out') { this.phase = 'back'; } }
  update(dt, G) {
    const P = this.P;
    if (this.phase === 'pull') { if (!P.pull) { this.dead = true; P.hooking = null; } else { this.x = this.ax; this.y = this.ay; } return; }
    if (this.phase === 'out') {
      for (let i = 0; i < 3; i++) {
        this.d += 360 * dt / 3; this.x = this.ox + this.dx * this.d; this.y = this.oy + this.dy * this.d;
        if (this.d >= HOOK_RANGE) { this.back(); break; }
        if (WALLS.has(G.area.tileAt(this.x, this.y - 2))) { SFX.tink(); G.parts.burst(this.x, this.y - this.alt, 5, { c: ['#fff', '#c8ccd8'], life: 0.25, r: 1 }); this.back(); break; }
        if (this.check(G)) break;
      }
    } else {
      this.d -= 420 * dt; this.x = this.ox + this.dx * Math.max(0, this.d); this.y = this.oy + this.dy * Math.max(0, this.d);
      if (this.carry) { this.carry.x = this.x; this.carry.y = this.y + 4; }
      if (this.d <= 0) { this.dead = true; P.hooking = null; if (this.carry) { this.carry.carried = false; this.carry.x = P.x; this.carry.y = P.y; } }
    }
  }
  check(G) {
    const b = { x: this.x - 6, y: this.y - this.alt - 6, w: 12, h: 12 };
    for (const e of G.area.ents) {
      if (e === this || e.dead || e.isShot || (e.room != null && G.area.rooms && e.room !== G.room)) continue;
      if (e.hookable) {
        const a = e.anchor ? e.anchor() : { x: e.x, y: e.y - 10 };
        if (dist(this.P.x, this.P.y - 12, a.x, a.y) < 30) continue; // le poteau d'où l'on vient
        if (dist(this.x, this.y - this.alt, a.x, a.y) < 15) {
          this.phase = 'pull'; this.ax = a.x; this.ay = a.y + this.alt; SFX.clank();
          const stop = e.stop || 12; this.P.pull = { x: e.x - this.dx * stop, y: e.y - this.dy * stop };
          return true;
        }
        continue;
      }
      const box = e.body ? e.body() : boxOf(e);
      if (e.onHook && rectHit(b, box)) { if (e.onHook(G, this) !== false) { this.back(); return true; } continue; }
      if (e.fetchable && !this.carry && !e.carried && rectHit(b, { x: e.x - 9, y: e.y - 14, w: 18, h: 18 })) { this.carry = e; e.carried = true; this.back(); SFX.catch(); return true; }
      if (e.isEnemy && !e.isBoss && rectHit(b, box)) { e.hookT = 0.35; e.stunT = 1.8; e.flash = 0.15; SFX.stun(); this.back(); return true; }
      if (e.solid && !e.hit && rectHit({ x: this.x - 2, y: this.y - 3, w: 4, h: 3 }, boxOf(e))) { SFX.tink(); this.back(); return true; }
    }
    return false;
  }
  draw() {
    const hx = this.x, hy = this.y - this.alt, sx = this.P.x + this.dx * 6, sy = this.P.y - 10 + this.dy * 4, n = Math.max(2, Math.floor(dist(sx, sy, hx, hy) / 4));
    for (let i = 1; i < n; i++) { const k = i / n; R(half(lerp(sx, hx, k) - 1), half(lerp(sy, hy, k) - 1), 2, 2, i % 2 ? '#9a9eaa' : '#c8ccd8'); }
    ell(this.x, this.y, 2.5, 1, 'rgba(0,0,0,.3)');
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(Math.atan2(this.dy, this.dx));
    R(-2, -1.5, 4, 3, '#c8ccd8'); R(1, -3.5, 3, 2, '#e8ecf8'); R(1, 1.5, 3, 2, '#e8ecf8'); R(-2, -1.5, 4, 1, '#fff');
    ctx.restore();
  }
}
// poteau d'accroche (au-dessus des gouffres)
class Post {
  constructor(x, y) { this.x = x; this.y = y; this.w = 10; this.h = 6; this.solid = true; this.hookable = true; this.t = rand(0, 5); }
  anchor() { return { x: this.x, y: this.y - 16 }; }
  update(dt) { this.t += dt; }
  draw() {
    ell(this.x, this.y, 7, 2.5, 'rgba(0,0,0,.4)');
    hi(this.x, this.y, false, () => {
      D(-5, -40, 10, 40, '#6a4224'); D(-5, -40, 3, 40, '#8a5a34'); D(3, -38, 2, 38, '#4a2a14');
      D(-8, -4, 16, 4, '#4a2a14');
      D(-9, -42, 18, 5, '#5a5e6a'); D(-9, -42, 18, 1, '#9a9eaa');
      const g = Math.sin(this.t * 3) > 0.7 ? '#fff' : '#c8ccd8';
      D(-6, -36, 12, 3, '#3a3d48'); D(-5, -35, 10, 1, g);   // anneau
    });
  }
}

// ---------- les pétards ----------
class Petard {
  constructor(x, y, ax, ay, power, room) {
    const n = Math.hypot(ax, ay) || 1; this.x = x + ax / n * 6; this.y = y + ay / n * 4; this.room = room;
    this.vx = ax / n * 150 * power; this.vy = ay / n * 150 * power; this.z = -10; this.vz = -90; this.fuse = 1.6; this.t = 0;
    this.w = 6; this.h = 4; this.isPetard = true;
  }
  update(dt, G) {
    this.t += dt; this.fuse -= dt;
    if (this.z < 0 || this.vz < 0) {
      this.vz += 420 * dt; this.z += this.vz * dt;
      const nx = this.x + this.vx * dt, ny = this.y + this.vy * dt;
      if (!WALLS.has(G.area.tileAt(nx, ny - 2))) { this.x = nx; this.y = ny; } else { this.vx *= -0.3; this.vy *= -0.3; }
      if (this.z >= 0) { this.z = 0; this.vz = 0; this.vx = this.vy = 0; const t = G.area.tileAt(this.x, this.y - 1); if (t === '~' || t === 'v' || t === 'T') { this.dead = true; SFX.splash(); G.parts.burst(this.x, this.y, 8, { c: ['#9ab8ff', '#fff'], life: 0.4, r: 1, up: 30, g: 120 }); return; } }
    }
    if (Math.random() < dt * 30) G.parts.add({ x: this.x + 1, y: this.y + this.z - 10, vy: -20, vx: rand(-10, 10), life: 0.3, c: pick(['#ffcf3a', '#fff', '#ff7a1a']), r: 1 });
    if (this.fuse <= 0) { this.dead = true; explode(G, this.x, this.y - 2, 30); }
  }
  draw() {
    ell(this.x, this.y, 3.5, 1.2, 'rgba(0,0,0,.35)');
    const blink = this.fuse < 0.6 && Math.floor(this.t * 16) % 2;
    hi(this.x, this.y + this.z, false, () => { D(-4, -12, 8, 12, blink ? '#fff' : '#d83a3a'); D(-4, -12, 3, 12, blink ? '#fff' : '#ff6a5a'); D(-4, -8, 8, 1, '#ffe27a'); D(-4, -4, 8, 1, '#ffe27a'); D(0, -16, 1, 4, '#3a2414'); });
  }
}
// explosion : abîme ennemis et héros, ouvre murs fissurés, rochers, mèches, torches
function explode(G, x, y, r = 30) {
  SFX.boom(); G.shake = 0.35; G.hitstop = 0.05;
  G.parts.burst(x, y - 6, 26, { c: ['#fff', '#ffe27a', '#ffb02e', '#ff7a1a', '#8a8698'], life: 0.55, smin: 40, smax: 160, r: 2, drag: 3 });
  G.parts.burst(x, y - 6, 14, { c: ['#4a4458', '#6a6478', '#2a2438'], life: 1, smin: 10, smax: 50, r: 3, up: 20, drag: 2 });
  G.flashT = 0.12;
  for (const e of G.area.ents.slice()) {
    if (e.dead || (e.room != null && G.area.rooms && e.room !== G.room)) continue;
    const d = dist(x, y, e.x, e.y - 6);
    if (e.onBlast) { if (d < r + (e.blastR || 16)) e.onBlast(G, x, y); continue; }
    if (d > r + 10) continue;
    if (e instanceof Bush) { e.hit(1, x, y, G); continue; }
    if (e.isEnemy && e.hit) e.hit(2, x, y, G, 'blast');
  }
  const P = G.player; if (dist(x, y, P.x, P.y - 6) < r - 4) P.hurt(1, x, y, G);
}
// mur fissuré (bloque un passage entre deux salles) : un pétard l'ouvre
class CrackedWall {
  constructor(x, y, flag) { this.x = x; this.y = y; this.flag = flag; this.w = 32; this.h = 32; this.solid = true; this.blastR = 26; }
  get dead() { return !!SAVE[this.flag]; }
  canInteract() { return true; }
  interact(G) { G.say([{ text: 'Le mur est fendu de haut en bas. Il sonne creux…' }]); }
  onBlast(G) {
    SAVE[this.flag] = true; persist(); setTimeout(() => SFX.secret(), 250);
    G.parts.burst(this.x, this.y - 16, 30, { c: ['#6a6478', '#8a8498', '#4a4458', '#2a2438'], life: 0.9, smin: 30, smax: 120, r: 3, g: 160, up: 40 });
  }
  draw() {
    const p = STONE[G.area.theme] || STONE.cave;
    hi(this.x, this.y, false, () => {
      D(-32, -64, 64, 64, p.face); for (let yy = -60; yy < 0; yy += 10) { D(-32, yy, 64, 2, p.fl2); for (let xx = -32 + ((yy / 10) & 1) * 10; xx < 32; xx += 20) D(xx, yy - 8, 2, 8, p.fl2); }
      D(-32, -64, 64, 3, p.ft);
      const cr = '#0a0810'; [[-4, -60], [-1, -52], [-6, -44], [-2, -36], [3, -28], [0, -20], [5, -12], [2, -4]].forEach(([cx, cy], i) => { D(cx, cy, 3, 9, cr); if (i % 2) D(cx + 3, cy + 3, 6, 2, cr); else D(cx - 6, cy + 4, 6, 2, cr); });
    });
  }
}
// rocher (éboulement) : un pétard le pulvérise
class Boulder {
  constructor(x, y, flag) { this.x = x; this.y = y; this.flag = flag; this.w = 26; this.h = 12; this.solid = true; this.blastR = 20; }
  get dead() { return !!SAVE[this.flag]; }
  canInteract() { return true; }
  interact(G) { G.say([{ text: 'Un gros rocher bloque le passage. Il faudrait le faire sauter.' }]); }
  onBlast(G) { SAVE[this.flag] = true; persist(); setTimeout(() => SFX.secret(), 250); G.parts.burst(this.x, this.y - 12, 30, { c: ['#6a6478', '#8a8498', '#4a4458'], life: 0.9, smin: 30, smax: 120, r: 3, g: 160, up: 40 }); }
  draw() {
    ell(this.x, this.y, 16, 4, 'rgba(0,0,0,.45)');
    hi(this.x, this.y, false, () => {
      D(-26, -30, 52, 30, '#5a5468'); D(-22, -38, 44, 10, '#6a6478'); D(-14, -44, 28, 8, '#7a7488'); D(-22, -38, 14, 6, '#8a8498'); D(-26, -4, 52, 4, '#3a3448');
      D(4, -30, 3, 14, '#3a3448'); D(7, -18, 8, 2, '#3a3448'); D(-12, -24, 6, 2, '#3a3448');
    });
  }
}
// mèche : s'allume au départ avec une explosion, brûle jusqu'au bout et déclenche un effet
class Fuse {
  constructor(pts, flag, onEnd) { this.pts = pts; this.flag = flag; this.onEnd = onEnd; this.x = pts[0][0]; this.y = pts[0][1]; this.w = 8; this.h = 4; this.ground = true; this.burn = -1; this.blastR = 22; this.len = 0; for (let i = 1; i < pts.length; i++) this.len += dist(...pts[i - 1], ...pts[i]); }
  onBlast(G) { if (SAVE[this.flag] || this.burn >= 0) return; this.burn = 0; SFX.fuse(); }
  at(d) { let acc = 0; for (let i = 1; i < this.pts.length; i++) { const a = this.pts[i - 1], b = this.pts[i], L = dist(...a, ...b); if (acc + L >= d) { const k = (d - acc) / L; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; } acc += L; } return this.pts.at(-1); }
  get light() { return this.burn >= 0 ? { r: 34, c: 'rgba(255,170,60,' } : null; }
  update(dt, G) {
    if (this.burn < 0) return;
    this.burn += 70 * dt; const [x, y] = this.at(this.burn);
    if (Math.random() < dt * 40) G.parts.add({ x, y: y - 2, vx: rand(-20, 20), vy: rand(-40, -10), life: 0.3, c: pick(['#ffcf3a', '#fff', '#ff7a1a']), r: 1 });
    if (Math.random() < dt * 8) SFX.blip();
    if (this.burn >= this.len) { this.burn = -1; SAVE[this.flag] = true; persist(); const [ex, ey] = this.pts.at(-1); explode(G, ex, ey, 26); if (this.onEnd) this.onEnd(G); }
  }
  get lightPos() { return this.at(Math.max(0, this.burn)); }
  draw() {
    const done = SAVE[this.flag], from = this.burn >= 0 ? this.burn : 0;
    ctx.lineCap = 'round';
    ctx.strokeStyle = done ? '#2a2020' : '#5a3a22'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(...this.pts[0]); for (const p of this.pts.slice(1)) ctx.lineTo(...p); ctx.stroke();
    if (!done && this.burn < 0) { ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(...this.pts[0]); for (const p of this.pts.slice(1)) ctx.lineTo(...p); ctx.stroke(); }
    if (this.burn >= 0) { const [x, y] = this.at(from); ell(x, y - 1, 2, 2, '#ffe27a'); }
    if (!done) { const [x, y] = this.pts[0]; hi(x, y, false, () => { D(-6, -8, 12, 8, '#6a4224'); D(-6, -8, 12, 2, '#8a5a34'); }); const [ex, ey] = this.pts.at(-1); hi(ex, ey, false, () => { D(-10, -22, 20, 22, '#7a4a24'); D(-10, -22, 20, 3, '#a06a34'); D(-10, -14, 20, 2, '#3a3d48'); D(-10, -6, 20, 2, '#3a3d48'); D(-4, -18, 8, 6, '#d83a3a'); D(-2, -17, 4, 2, '#fff'); }); }
  }
}
// torche à allumer par une explosion ; reste allumée quelques secondes
class Torch {
  constructor(x, y, group) { this.x = x; this.y = y; this.group = group; this.w = 10; this.h = 6; this.solid = true; this.on = 0; this.t = rand(0, 5); this.blastR = 28; }
  get lit() { return SAVE[this.group] || this.on > 0; }
  get light() { return this.lit ? { r: 64, c: 'rgba(255,160,70,', flick: true, warm: true } : null; }
  onBlast(G) { if (SAVE[this.group]) return; this.on = 6; SFX.fuse(); G.checkTorches(this.group); }
  canInteract() { return !this.lit; }
  interact(G) { G.say([{ text: 'Une torche éteinte. La mèche est trop haute pour une simple allumette.' }]); }
  update(dt, G) { this.t += dt; if (this.on > 0) this.on -= dt; if (this.lit && Math.random() < dt * 5) G.parts.add({ x: this.x + rand(-2, 2), y: this.y - 30, vy: -16, life: 0.6, c: pick(['#ffb02e', '#ff7a1a', '#ffe9a0']), r: 1 }); }
  draw() {
    ell(this.x, this.y, 6, 2, 'rgba(0,0,0,.4)');
    const f = Math.floor(this.t * 9) % 3, lit = this.lit;
    hi(this.x, this.y, false, () => {
      D(-4, -44, 8, 44, '#3a3448'); D(-4, -44, 3, 44, '#5a5468'); D(-8, -4, 16, 4, '#2a2438');
      D(-9, -52, 18, 8, '#5a5e6a'); D(-9, -52, 18, 2, '#8a8e9a');
      if (lit) { D(-7, -60 - f, 14, 8 + f, '#ff7a1a'); D(-4, -66 - f, 8, 8, '#ffb02e'); D(-2, -70 + f, 4, 6, '#ffe9a0'); }
      else D(-5, -54, 10, 2, '#1a1418');
    });
    if (this.on > 0 && !SAVE[this.group]) { const k = this.on / 6; ctx.strokeStyle = '#ffb02e'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(this.x, this.y - 40, 7, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke(); }
  }
}

// ---------- palmes : trésors au fond de l'eau ----------
class DiveSpot {
  constructor(x, y, flag, give, msg) { this.x = x; this.y = y; this.flag = flag; this.give = give; this.msg = msg; this.w = 8; this.h = 4; this.t = rand(0, 5); this.ground = true; }
  get dead() { return !!SAVE[this.flag]; }
  get light() { return { r: 20, c: 'rgba(160,220,255,' }; }
  update(dt, G) {
    this.t += dt; const P = G.player;
    if (Math.random() < dt * 3) G.parts.add({ x: this.x + rand(-4, 4), y: this.y - 2, vy: -12, life: 0.7, c: '#cfe0ff', r: 1 });
    if (P.dive > 0 && dist(P.x, P.y, this.x, this.y) < 16) {
      SAVE[this.flag] = true;
      if (this.give === 'key') Keys.add(1); else if (this.give.startsWith('money:')) Wallet.add(Number(this.give.slice(6))); else if (this.give.startsWith('flag:')) SAVE[this.give.slice(5)] = true; else Inventory.give(this.give);
      persist(); if (this.onGet) this.onGet(); SFX.chest(); P.dive = 0; G.raise(this.give.startsWith('flag:') ? 'seal' : this.give.startsWith('money') ? 'money' : this.give);
      G.say(this.msg || [{ text: 'Au fond de l\'eau, une petite clé !' }]);
    }
  }
  draw() { const k = 0.5 + 0.5 * Math.sin(this.t * 3); ctx.globalAlpha = 0.25 + 0.2 * k; ell(this.x, this.y - 1, 7, 3, '#cfe0ff'); ctx.globalAlpha = 1; R(half(this.x - 1), half(this.y - 2 - k * 2), 1.5, 1.5, '#fff'); R(half(this.x + 3), half(this.y - 1 - k), 1, 1, '#fff'); }
}
// vanne du temple : fait monter ou baisser l'eau de tout le donjon
class Valve {
  constructor(x, y) { this.x = x; this.y = y; this.w = 14; this.h = 8; this.solid = true; this.t = 0; this.spin = 0; }
  canInteract() { return true; }
  interact(G) {
    SAVE.waterLow = !SAVE.waterLow; persist(); this.spin = 1; SFX.valve(); G.shake = 0.4;
    G.area.syncTiles(); G.say([{ text: SAVE.waterLow ? 'Tu tournes la vanne… Le niveau de l\'eau baisse dans tout le temple !' : 'Tu tournes la vanne… L\'eau remonte et envahit le temple !' }]);
  }
  update(dt) { this.t += dt; if (this.spin > 0) this.spin -= dt; }
  draw() {
    ell(this.x, this.y, 9, 3, 'rgba(0,0,0,.4)');
    const a = this.spin * 8 + (SAVE.waterLow ? 0.8 : 0);
    hi(this.x, this.y, false, () => { D(-4, -20, 8, 20, '#3a5a62'); D(-4, -20, 3, 20, '#4e8a90'); D(-10, -4, 20, 4, '#244a52'); D(-12, -26, 24, 6, '#2e5860'); });
    ctx.save(); ctx.translate(this.x, this.y - 16); ctx.rotate(a); ctx.strokeStyle = '#c8a040'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 6, 0, 7); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.moveTo(0, -6); ctx.lineTo(0, 6); ctx.stroke(); ctx.restore();
    R(half(this.x - 1), half(this.y - 17), 2, 2, '#ffe27a');
  }
}

// ---------- horloges du château : figent la salle 5 secondes ----------
class ClockPost {
  constructor(x, y) { this.x = x; this.y = y; this.w = 14; this.h = 8; this.solid = true; this.t = 0; }
  get light() { return { r: G.freezeT > 0 ? 70 : 30, c: G.freezeT > 0 ? 'rgba(140,200,255,' : 'rgba(195,179,255,' }; }
  body() { return { x: this.x - 9, y: this.y - 40, w: 18, h: 40 }; }
  hit(d, fx, fy, G) { if (G.freezeT > 0.3) { SFX.tink(); return; } G.freezeT = 5; SFX.clock(); G.shake = 0.2; G.parts.burst(this.x, this.y - 30, 18, { c: ['#cfe0ff', '#fff', '#c3b3ff'], life: 0.8, smin: 20, smax: 90, r: 2 }); }
  update(dt) { this.t += dt; }
  draw() {
    ell(this.x, this.y, 9, 3, 'rgba(0,0,0,.45)');
    hi(this.x, this.y, false, () => {
      D(-6, -50, 12, 50, '#3a2c66'); D(-6, -50, 3, 50, '#5e4c96'); D(-12, -4, 24, 4, '#1e1836');
      D(-16, -84, 32, 34, '#4a3a7a'); D(-13, -81, 26, 28, '#e8e0f0'); D(-16, -84, 32, 2, '#7a6aaa');
      for (let i = 0; i < 12; i++) { const b = i / 12 * Math.PI * 2; D(Math.round(Math.cos(b) * 10) - 1, -67 + Math.round(Math.sin(b) * 10) - 1, 2, 2, '#4a3a7a'); }
    });
    const frozen = G.freezeT > 0, a = frozen ? -Math.PI / 2 : this.t * 2;
    ctx.strokeStyle = '#2a1d38'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(this.x, this.y - 33.5); ctx.lineTo(this.x + Math.cos(a) * 6, this.y - 33.5 + Math.sin(a) * 6); ctx.moveTo(this.x, this.y - 33.5); ctx.lineTo(this.x, this.y - 37.5); ctx.stroke();
    if (frozen) { ctx.strokeStyle = '#8ff3ea'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(this.x, this.y - 33.5, 10, -Math.PI / 2, -Math.PI / 2 + (G.freezeT / 5) * Math.PI * 2); ctx.stroke(); }
  }
}
// lame qui va et vient (piège) : invulnérable, se fige avec les horloges
class Blade {
  constructor(x, y, dx, dy, len, speed = 70, kind = 'blade') { this.x = this.x0 = x; this.y = this.y0 = y; this.dx = dx; this.dy = dy; this.len = len; this.sp = speed; this.p = 0; this.dir = 1; this.w = 14; this.h = 8; this.t = 0; this.isTrap = true; this.kind = kind; }
  body() { return { x: this.x - 7, y: this.y - 14, w: 14, h: 14 }; }
  update(dt, G) {
    this.t += dt; this.p += this.dir * this.sp * dt;
    if (this.p > this.len) { this.p = this.len; this.dir = -1; } if (this.p < 0) { this.p = 0; this.dir = 1; }
    this.x = this.x0 + this.dx * this.p; this.y = this.y0 + this.dy * this.p;
    const P = G.player; if (rectHit(this.body(), P.body())) P.hurt(1, this.x, this.y - 6, G);
  }
  draw() {
    ell(this.x, this.y, 7, 2.5, 'rgba(0,0,0,.4)');
    if (this.kind === 'ball') { const a = this.p / 8; hi(this.x, this.y, false, () => { D(-14, -28, 28, 28, '#3a3448'); D(-14, -28, 28, 6, '#5a5468'); D(-10, -24, 6, 6, '#7a7488'); D(-14, -4, 28, 4, '#1a1428'); D(Math.round(Math.cos(a) * 8) - 2, -16 + Math.round(Math.sin(a) * 8), 4, 4, '#1a1428'); }); return; }
    const a = G.freezeT > 0 ? 0.3 : this.t * 14;
    ctx.save(); ctx.translate(this.x, this.y - 7); ctx.rotate(a);
    for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); R(0, -1.5, 8, 3, '#c8ccd8'); R(5, -2.5, 3, 2, '#fff'); }
    R(-2.5, -2.5, 5, 5, '#5a5e6a'); ctx.restore();
  }
}

// ---------- wagonnets et aiguillages (Mines des gnomes) ----------
// stations : { id: { x, y, off: [dx, dy] (où l'on descend) } } ; routes : { id: G => ({ pts: [[x, y]...], to: id }) }
class Cart {
  constructor(stations, routes, start) { this.stations = stations; this.routes = routes; this.station = start; const s = stations[start]; this.x = s.x; this.y = s.y; this.w = 16; this.h = 8; this.t = 0; this.path = null; this.ang = 0; }
  get solid() { return !this.path; }
  canInteract() { return !this.path; }
  interact(G, P) {
    const r = this.routes[this.station] && this.routes[this.station](G); if (!r) { G.say([{ text: 'Le wagonnet est au bout de la voie.' }]); return; }
    this.path = r.pts.slice(); this.to = r.to; this.seg = 0; this.k = 0; P.riding = this; P.dir = 'down'; SFX.cart();
  }
  update(dt, G) {
    this.t += dt; if (!this.path) return;
    let step = 125 * dt;
    while (step > 0 && this.path) {
      const a = this.path[this.seg], b = this.path[this.seg + 1]; if (!b) { this.arrive(G); break; }
      const L = dist(...a, ...b), left = L * (1 - this.k);
      if (step < left) { this.k += step / L; step = 0; } else { step -= left; this.seg++; this.k = 0; }
      const p = this.path[this.seg], q = this.path[this.seg + 1] || p;
      this.x = lerp(p[0], q[0], this.k); this.y = lerp(p[1], q[1], this.k); this.ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
    }
    if (this.path && Math.random() < dt * 20) G.parts.add({ x: this.x + rand(-6, 6), y: this.y, vx: rand(-30, 30), vy: rand(-30, -5), life: 0.25, c: pick(['#ffe27a', '#fff']), r: 1 });
    if (this.path) for (const e of G.area.ents) if (e.isEnemy && !e.dead && !e.isBoss && e.room === G.room && dist(e.x, e.y, this.x, this.y) < 16) e.die(G);
    if (this.path && Math.floor(this.t * 6) !== Math.floor((this.t - dt) * 6)) SFX.rail();
  }
  arrive(G) {
    const s = this.stations[this.to]; this.station = this.to; this.path = null; this.x = s.x; this.y = s.y;
    const P = G.player; P.riding = null; P.x = s.x + s.off[0]; P.y = s.y + s.off[1]; P.inv = Math.max(P.inv, 0.3); SFX.push(); G.shake = 0.15;
  }
  draw() {
    ell(this.x, this.y, 10, 3, 'rgba(0,0,0,.45)');
    hi(this.x, this.y - 2, false, () => {
      D(-16, -20, 32, 18, '#5a5e6a'); D(-16, -20, 32, 3, '#8a8e9a'); D(-16, -12, 32, 2, '#3a3d48'); D(-18, -22, 36, 3, '#3a3d48');
      D(-14, -4, 6, 6, '#2a2c34'); D(8, -4, 6, 6, '#2a2c34'); D(-13, -3, 2, 2, '#8a8e9a'); D(9, -3, 2, 2, '#8a8e9a');
      D(-10, -18, 2, 14, '#6a6e7a'); D(8, -18, 2, 14, '#6a6e7a');
    });
  }
}
class RailLever {
  constructor(x, y, flag, labels) { this.x = x; this.y = y; this.flag = flag; this.labels = labels; this.w = 12; this.h = 6; this.solid = true; this.t = 0; this.k = SAVE[flag] ? 1 : 0; }
  canInteract() { return true; }
  interact(G) { SAVE[this.flag] = !SAVE[this.flag]; persist(); SFX.lever(); G.say([{ text: 'Clac ! L\'aiguillage bascule : ' + this.labels[SAVE[this.flag] ? 1 : 0] + '.' }]); }
  update(dt) { this.t += dt; this.k = lerp(this.k, SAVE[this.flag] ? 1 : 0, Math.min(1, dt * 10)); }
  draw() {
    ell(this.x, this.y, 7, 2, 'rgba(0,0,0,.4)');
    hi(this.x, this.y, false, () => { D(-10, -8, 20, 8, '#3a3d48'); D(-10, -8, 20, 2, '#6a6e7a'); });
    const a = -Math.PI / 2 + (this.k - 0.5) * 1.4;
    ctx.strokeStyle = '#6a4224'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(this.x, this.y - 3); ctx.lineTo(this.x + Math.cos(a) * 12, this.y - 3 + Math.sin(a) * 12); ctx.stroke();
    ell(this.x + Math.cos(a) * 12, this.y - 3 + Math.sin(a) * 12, 2, 2, SAVE[this.flag] ? '#7be38f' : '#ff6b7a');
  }
}

// ---------- clés spéciales, grilles, sceaux ----------
class SpecialKey { // clé unique (grille des Mines…) : on la ramasse ou on la rapporte au frisbee
  constructor(x, y, flag, msg) { this.x = x; this.y = y; this.flag = flag; this.msg = msg; this.w = 10; this.h = 6; this.fetchable = true; this.t = 0; }
  get dead() { return !!SAVE[this.flag]; }
  get light() { return { r: 30, c: 'rgba(255,207,122,' }; }
  update(dt, G) {
    this.t += dt;
    if (rectHit({ x: this.x - 6, y: this.y - 10, w: 12, h: 12 }, G.player.body())) { SAVE[this.flag] = true; persist(); SFX.chest(); G.raise('key'); G.say(this.msg); }
  }
  draw() { if (!this.carried) ell(this.x, this.y, 5, 1.5, 'rgba(0,0,0,.3)'); drawKey(this.x, this.y - 6 + Math.sin(this.t * 3), 2); }
}
class IronGate { // grille fermée par une clé unique ou une condition
  constructor(x, y, o) { this.x = x; this.y = y; this.o = o; this.w = o.w || 64; this.h = 10; this.t = 0; }
  get open() { return !!SAVE[this.o.flag]; }
  get solid() { return !this.open; }
  get dead() { return this.open; }
  canInteract() { return true; }
  interact(G) {
    if (this.o.key && SAVE[this.o.key]) { SAVE[this.o.flag] = true; persist(); SFX.door(); G.shake = 0.3; G.say(this.o.openMsg || [{ text: 'La grille s\'ouvre !' }]); return; }
    G.say(this.o.closedMsg || [{ text: 'Une lourde grille, fermée à clé.' }]);
  }
  draw() {
    hi(this.x, this.y, false, () => {
      const W2 = this.w * 2;
      for (let x = -W2 / 2; x < W2 / 2; x += 12) { D(x, -60, 5, 60, '#5a5e6a'); D(x, -60, 2, 60, '#9a9eaa'); }
      D(-W2 / 2, -62, W2, 5, '#3a3d48'); D(-W2 / 2, -32, W2, 4, '#3a3d48'); D(-W2 / 2, -62, W2, 1, '#7a7e8a');
      D(-8, -40, 16, 14, '#c8a040'); D(-2, -36, 4, 5, '#3a2410');
    });
  }
}

// ---------- luciole-relais : voyage rapide (après la libération du deuxième enfant) ----------
const RELAYS = {
  village: { name: 'Bourg-Luciole', area: 'royaume', pos: () => ({ x: 26 * TS, y: 31 * TS + 4, dir: 'down' }) },
  collines: { name: 'Les Collines', area: 'collines', pos: () => ({ x: 36 * TS, y: 42 * TS + 4, dir: 'down' }) },
  foret: { name: 'La Forêt', area: 'foret', pos: () => ({ x: 54 * TS, y: 29 * TS + 4, dir: 'down' }) },
  montagne: { name: 'La Montagne', area: 'montagne', pos: () => ({ x: 8 * TS, y: 27 * TS + 4, dir: 'down' }) },
  lac: { name: 'Le Lac', area: 'lac', pos: () => ({ x: 38 * TS, y: 13 * TS + 4, dir: 'down' }) },
  cote: { name: 'La Côte', area: 'cote', pos: () => ({ x: 10 * TS, y: 29 * TS + 4, dir: 'down' }) },
  terres: { name: 'Les Terres de Minuit', area: 'terres', pos: () => ({ x: 50 * TS, y: 42 * TS + 4, dir: 'down' }) },
};
class Relay {
  constructor(x, y, id) { this.x = x; this.y = y; this.id = id; this.w = 12; this.h = 6; this.solid = true; this.t = rand(0, 5); }
  get on() { return !!SAVE.freed1; }
  get light() { return { r: this.on ? 56 : 18, c: 'rgba(255,230,140,' }; }
  canInteract() { return true; }
  interact(G) {
    if (!this.on) { G.say([{ text: 'Une lanterne de pierre, éteinte. Une luciole y dort, roulée en boule.' }]); return; }
    SAVE.relays = SAVE.relays || {}; SAVE.relays[this.id] = true; persist();
    G.openTravel(this.id);
  }
  update(dt, G) { this.t += dt; if (this.on && dist(G.player.x, G.player.y, this.x, this.y) < 30) { SAVE.relays = SAVE.relays || {}; if (!SAVE.relays[this.id]) { SAVE.relays[this.id] = true; persist(); Input.toast = { msg: 'Luciole-relais activée !', t: 2 }; SFX.crystal(); } } }
  draw() {
    ell(this.x, this.y, 8, 2.5, 'rgba(0,0,0,.4)');
    hi(this.x, this.y, false, () => { D(-6, -34, 12, 34, '#6a6478'); D(-6, -34, 3, 34, '#8a8498'); D(-10, -4, 20, 4, '#4a4458'); D(-12, -50, 24, 16, '#8a8498'); D(-10, -48, 20, 12, this.on ? '#2a1d38' : '#1a1428'); D(-14, -54, 28, 4, '#6a6478'); });
    if (this.on) drawLumi(this.x, this.y - 42 + Math.sin(this.t * 3), this.t);
  }
}

// ---------- autel d'un sceau (château) et porte aux sceaux ----------
const SEALS = [['sealP', '#ff7a5a', 'pétards'], ['sealS', '#8ff3ea', 'lance-pierre'], ['sealG', '#c8ccd8', 'grappin'], ['sealW', '#6ac0ff', 'palmes'], ['sealF', '#ffcf3a', 'frisbee']];
class SealAltar {
  constructor(x, y, flag) { this.x = x; this.y = y; this.flag = flag; this.w = 20; this.h = 8; this.solid = true; this.t = 0; this.c = SEALS.find(s => s[0] === flag)[1]; }
  get light() { return SAVE[this.flag] ? null : { r: 50, c: 'rgba(195,179,255,' }; }
  canInteract() { return !SAVE[this.flag]; }
  interact(G) { SAVE[this.flag] = true; persist(); SFX.chest(); G.raise('seal'); const n = SEALS.filter(s => SAVE[s[0]]).length; G.say([{ text: `Tu as obtenu un sceau de l'aube ! (${n} sur 5)` }, { who: 'Lumi', text: n < 5 ? 'Encore ' + (5 - n) + '. La grande porte du hall ne s\'ouvrira qu\'avec les cinq.' : 'Les cinq sceaux ! Vite, au grand hall !' }]); }
  update(dt) { this.t += dt; }
  draw() {
    ell(this.x, this.y, 14, 4, 'rgba(0,0,0,.45)');
    hi(this.x, this.y, false, () => { D(-18, -16, 36, 16, '#3a2c66'); D(-18, -16, 36, 3, '#5e4c96'); D(-22, -20, 44, 6, '#4a3a7a'); D(-22, -20, 44, 1, '#7a6aaa'); });
    if (!SAVE[this.flag]) drawSealIcon(this.x, this.y - 22 + Math.sin(this.t * 3) * 1.5, 1.2, this.c);
  }
}
class SealGate { // la grande porte du hall : cinq serrures-soleil ; s'ouvre en cinématique quand on a les cinq sceaux
  constructor(x, y) { this.x = x; this.y = y; this.w = 32; this.h = 32; this.t = 0; this.k = SAVE.sealGateOpen ? 1 : 0; this.lit = SAVE.sealGateOpen ? 5 : 0; }
  get open() { return !!SAVE.sealGateOpen; }
  get solid() { return this.k < 0.9; }
  get light() { return { r: 40 + this.lit * 12 + (this.k > 0 && this.k < 1 ? 80 : 0), c: 'rgba(255,220,140,' }; }
  canInteract() { return !this.open; }
  interact(G) { const n = SEALS.filter(s => SAVE[s[0]]).length; G.say([{ text: `Une porte immense, gravée de cinq serrures en forme de soleil. ${n} sceau${n > 1 ? 'x' : ''} sur 5.` }, { who: 'Lumi', text: n < 5 ? 'Chaque aile du château cache un sceau. Il t\'en manque ' + (5 - n) + '.' : 'Tu as les cinq ! Approche-toi…' }]); }
  update(dt) { this.t += dt; }
  draw() {
    const k = this.k;
    hi(this.x, this.y, false, () => {
      D(-40, -76, 80, 76, '#1a1030'); D(-40, -76, 80, 6, '#4a3a7a'); D(-46, -84, 92, 10, '#3a2c66'); D(-10, -96, 20, 14, '#c8a040');
      const off = Math.round(k * 30);
      D(-32 - off, -66, 32, 66, '#3a2c66'); D(0 + off, -66, 32, 66, '#3a2c66'); D(-2 - off, -66, 2, 66, '#1a1030'); D(0 + off, -66, 2, 66, '#1a1030');
      if (k > 0) { ctx.globalAlpha = Math.min(1, k * 2) * (k < 1 ? 1 : 0.5); D(-off + 0, -66, off * 2, 66, '#fff2c0'); ctx.globalAlpha = 1; }
      SEALS.forEach((sx, i) => { const x = -26 + i * 12, on = i < this.lit; D(x - off * (x < 0 ? 1 : 0) + off * (x > 0 ? 1 : 0), -46, 8, 8, on ? sx[1] : '#1a1030'); });
    });
  }
}

