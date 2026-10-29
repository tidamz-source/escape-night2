'use strict';
// ---------- le royaume d'Aube-Figée : 7 zones reliées par leurs bords ----------
//
//                 [COLLINES] ─ [MONTAGNE]
//                     │
//   [FORÊT] ── [BOURG-LUCIOLE]
//                     │
//   [TERRES] ──── [LAC] ─────── [CÔTE]
//
// Chaque zone : sa palette (world.js → OVER), ses maisons, son relais luciole, sa quête, un donjon au plus (entrée par le bas).

const ZW = 64, ZH = 48;
const VIL = { bridge: { x: 8, y: 23, w: 3, h: 2 } };
function zoneGrid(seed, o = {}) {
  const g = makeGrid(ZW, ZH, '.'), T2 = gridTools(g), r = seeded(seed);
  T2.rect(0, 0, ZW, 2, '#'); T2.rect(0, ZH - 2, ZW, 2, '#'); T2.rect(0, 0, 2, ZH, '#'); T2.rect(ZW - 2, 0, 2, ZH, '#');
  for (let x = 2; x < ZW - 2; x++) { if (r() < 0.45) T2.set(x, 2, '#'); if (r() < 0.4) T2.set(x, ZH - 3, '#'); }
  for (let y = 2; y < ZH - 2; y++) { if (r() < 0.45) T2.set(2, y, '#'); if (r() < 0.45) T2.set(ZW - 3, y, '#'); }
  const ell2 = (cx, cy, rx, ry, c, jit = 0) => { for (let y = 0; y < ZH; y++) for (let x = 0; x < ZW; x++) { const v = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2; if (v < 1 + (r() - 0.5) * jit) T2.set(x, y, c); } };
  const flowers = (n, ch = ',') => { for (let i = 0; i < n; i++) { const x = Math.floor(r() * ZW), y = Math.floor(r() * ZH); if (g[y][x] === '.') g[y][x] = ch; } };
  return Object.assign(T2, { g, r, ell: ell2, flowers });
}
// une zone de plein air : maisons, relais, sorties sur les bords
function zoneArea(id, grid, theme, o) {
  const A = new Area(id, grid, theme);
  A.name = o.name; A.dark = o.dark != null ? o.dark : 0.45; A.zone = true;
  A.roomDark = () => SAVE.boss6 ? 0.05 : Math.max(0.12, (o.dark != null ? o.dark : 0.45) - 0.055 * (SAVE.fragments || 0));
  A.sky = G => skyTint(G);
  return A;
}
// teinte du ciel selon les fragments d'aube : bleu nuit → violet → rose → or
function skyTint() {
  const n = SAVE.boss6 ? 7 : (SAVE.fragments || 0);
  const cols = ['#0a1440', '#1a1450', '#3a1a5a', '#5a2a6a', '#8a3a6a', '#c86a5a', '#ffb070', '#ffd890'];
  ctx.globalAlpha = 0.06 + n * 0.012; R(0, 0, W, H, cols[n]); ctx.globalAlpha = 1;
}
const t2p = (x, y) => ({ x: x * TS + 8, y: (y + 1) * TS });

// ---------- décors ----------
class Decor {
  constructor(x, y, kind, o = {}) { this.x = x; this.y = y; this.kind = kind; this.o = o; this.t = rand(0, 9); const S = DECOR[kind]; this.w = S.w; this.h = S.h; this.solid = S.solid !== false; this.ground = !!S.ground; if (S.light) this.light = S.light; }
  update(dt) { this.t += dt; }
  canInteract() { return !!this.o.say; }
  interact(G) { G.say(this.o.say); }
  draw() { if (!this.ground) ell(this.x, this.y, this.w / 2 + 2, 2.5, 'rgba(0,0,0,.35)'); hi(this.x, this.y, !!this.o.flip, () => DECOR[this.kind].draw(this.t, this.o)); }
}
const DECOR = {
  dead: { w: 10, h: 6, draw: () => { D(-4, -60, 8, 60, '#2a1e2a'); D(-4, -60, 3, 60, '#3a2a3a'); D(-22, -50, 20, 4, '#2a1e2a'); D(-22, -62, 4, 14, '#2a1e2a'); D(4, -40, 18, 4, '#2a1e2a'); D(18, -52, 4, 14, '#2a1e2a'); D(-12, -74, 4, 16, '#2a1e2a'); D(6, -70, 4, 12, '#2a1e2a'); } },
  grave: { w: 12, h: 5, draw: (t, o) => { D(-10, -26, 20, 26, '#5a5468'); D(-8, -30, 16, 6, '#5a5468'); D(-10, -26, 3, 26, '#6a6478'); D(-1, -22, 2, 10, '#3a3448'); D(-4, -18, 8, 2, '#3a3448'); D(-12, -2, 24, 2, '#2a1e2a'); } },
  windmill: { w: 30, h: 10, draw: (t) => {
    D(-22, -90, 44, 90, '#c8b898'); D(-22, -90, 8, 90, '#d8c8a8'); D(-26, -100, 52, 14, '#8a3a3a'); D(-18, -110, 36, 12, '#8a3a3a'); D(-8, -30, 16, 30, '#5a3a22'); D(-8, -70, 10, 10, '#3a5a8a');
    ctx.save(); ctx.translate(0, -84); ctx.rotate(t * 0.8); for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); D(-3, -70, 6, 70, '#6a4a2a'); D(3, -66, 14, 56, 'rgba(240,232,216,.9)'); } ctx.restore(); D(-4, -88, 8, 8, '#4a2a14');
  } },
  sheep: { w: 14, h: 6, solid: false, draw: (t) => { const b = Math.abs(Math.sin(t * 2)) > 0.9 ? -1 : 0; D(-14, -18 + b, 28, 14, '#f0ece4'); D(-12, -22 + b, 22, 6, '#ffffff'); D(-20, -18, 8, 10, '#3a3434'); D(-18, -16, 2, 2, '#fff'); D(-10, -4, 3, 4, '#3a3434'); D(6, -4, 3, 4, '#3a3434'); } },
  lighthouse: { w: 22, h: 8, light: { r: 120, c: 'rgba(255,230,150,', flick: true, warm: true }, draw: (t) => {
    for (let i = 0; i < 6; i++) D(-20 + i * 2, -40 - i * 30, 40 - i * 4, 32, i % 2 ? '#e8e0d8' : '#c83a3a');
    D(-14, -230, 28, 24, '#3a3d48'); D(-10, -226, 20, 16, Math.sin(t * 3) > 0 ? '#ffe27a' : '#fff6c0'); D(-16, -238, 32, 8, '#3a3d48'); D(-4, -246, 8, 8, '#3a3d48');
    D(-8, -24, 16, 24, '#3a2414');
  } },
  rocks: { w: 24, h: 8, draw: () => { D(-24, -16, 22, 16, '#6a6870'); D(-24, -16, 22, 4, '#8a8890'); D(-4, -24, 26, 24, '#5a5860'); D(-4, -24, 26, 5, '#7a7880'); } },
  pine: { w: 10, h: 6, draw: (t, o) => { const c = o.snow ? '#3a5a50' : '#1e4a3a'; D(-3, -12, 6, 12, '#4a3020'); for (let i = 0; i < 4; i++) { D(-22 + i * 5, -26 - i * 14, 44 - i * 10, 16, c); if (o.snow) D(-18 + i * 5, -26 - i * 14, 36 - i * 10, 4, '#e8eef8'); } } },
  palm: { w: 10, h: 6, draw: (t) => { const s = Math.sin(t) * 2; D(-3, -60, 6, 60, '#8a6a4a'); for (let i = 0; i < 6; i++) D(-3 + i, -60 + i * 10, 6, 2, '#6a4a2a'); for (const [dx, dy, w] of [[-30, -66, 30], [0, -66, 30], [-24, -74, 22], [2, -74, 22]]) D(dx + s, dy, w, 6, '#3a8a4a'); D(-6, -62, 6, 6, '#6a4a2a'); } },
  boat: { w: 30, h: 8, solid: false, ground: true, draw: () => { D(-30, -10, 60, 10, '#7a4a24'); D(-26, -14, 52, 4, '#a06a34'); D(-34, -12, 6, 6, '#7a4a24'); D(28, -12, 6, 6, '#7a4a24'); } },
  jetty: { w: 20, h: 4, solid: false, ground: true, draw: (t, o) => { const L = (o.len || 4) * 32; for (let i = 0; i < L; i += 8) { D(-14, -i - 6, 28, 6, '#8a5a34'); D(-14, -i - 6, 28, 1, '#a8784a'); } D(-16, -L, 4, L, '#5a3418'); D(12, -L, 4, L, '#5a3418'); } },
  fence: { w: 32, h: 4, draw: () => { D(-32, -16, 64, 3, '#8a6a4a'); D(-32, -8, 64, 3, '#8a6a4a'); for (let x = -30; x < 32; x += 14) D(x, -20, 4, 20, '#6a4a2a'); } },
  well: { w: 18, h: 8, draw: () => { D(-16, -18, 32, 18, '#6a6478'); D(-16, -18, 32, 4, '#8a8498'); D(-12, -16, 24, 6, '#1a2a4a'); D(-16, -44, 4, 26, '#5a3418'); D(12, -44, 4, 26, '#5a3418'); D(-18, -48, 36, 6, '#8a3a3a'); } },
  stall: { w: 24, h: 6, draw: () => { D(-24, -26, 48, 26, '#8a5a34'); D(-26, -30, 52, 6, '#6a4224'); for (let i = 0; i < 6; i++) D(-28 + i * 10, -46, 10, 16, i % 2 ? '#f0e8d8' : '#d84a4a'); D(-28, -48, 56, 3, '#a83a3a'); } },
};
// facades d'entrées de donjon : on entre toujours par le bas, en marchant vers le haut
class Entrance {
  constructor(x, y, kind) { this.x = x; this.y = y; this.kind = kind; this.w = 8; this.h = 4; this.t = 0; }
  get light() { return { r: 50, c: this.kind === 'castle' ? 'rgba(160,120,255,' : this.kind === 'mine' ? 'rgba(255,190,90,' : 'rgba(140,255,200,' }; }
  update(dt) { this.t += dt; }
  draw() {
    hi(this.x, this.y, false, () => {
      const k = this.kind;
      if (k === 'cave') { // bouche de la grotte dans la falaise
        D(-72, -96, 144, 64, '#3a3448'); D(-60, -110, 120, 20, '#4a4458'); D(-72, -96, 144, 6, '#5a5468');
        D(-30, -80, 60, 48, '#05080f'); D(-24, -88, 48, 10, '#05080f'); D(-34, -72, 6, 40, '#2a2438'); D(28, -72, 6, 40, '#2a2438');
        for (let i = 0; i < 5; i++) D(-26 + i * 12, -84, 4, 6 + (i % 2) * 4, '#4a4458');
        const g = Math.sin(this.t * 3) > 0; D(-12, -60, 3, 3, g ? '#ffe27a' : '#8ff3ea'); D(10, -50, 3, 3, g ? '#8ff3ea' : '#ffe27a');
      } else if (k === 'tree') { // porte du Bois des murmures : un arbre immense, creux
        D(-50, -150, 100, 118, '#3a2418'); D(-50, -150, 16, 118, '#4a3020'); D(36, -150, 14, 118, '#2a1810');
        for (const [dx, dy, rr] of [[-60, -170, 40], [10, -180, 46], [-20, -200, 36], [50, -160, 30]]) { ctx.fillStyle = '#163a30'; ctx.beginPath(); ctx.arc(dx, dy, rr, 0, 7); ctx.fill(); ctx.fillStyle = '#1d4a3c'; ctx.beginPath(); ctx.arc(dx - 6, dy - 8, rr * 0.6, 0, 7); ctx.fill(); }
        D(-22, -80, 44, 48, '#05080f'); D(-16, -90, 32, 10, '#05080f'); D(-60, -40, 20, 8, '#3a2418'); D(40, -40, 22, 8, '#3a2418');
        const g = Math.sin(this.t * 2) > 0; D(-30, -110, 4, 4, g ? '#8ff3ea' : '#4a8a7a'); D(24, -120, 4, 4, g ? '#4a8a7a' : '#8ff3ea');
      } else if (k === 'mine') { // entrée de mine boisée
        D(-64, -96, 128, 64, '#5a5048'); D(-64, -96, 128, 6, '#7a7068');
        D(-30, -80, 60, 48, '#05080f'); D(-36, -84, 10, 52, '#6a4224'); D(26, -84, 10, 52, '#6a4224'); D(-40, -92, 80, 10, '#8a5a34'); D(-40, -92, 80, 3, '#a8784a');
        D(-6, -100, 12, 8, '#3a3d48'); D(-4, -98, 8, 5, Math.sin(this.t * 6) > 0 ? '#ffe27a' : '#ffcf3a');
        D(-20, -40, 40, 8, '#4a3a2a'); D(-18, -38, 4, 6, '#9a9eaa'); D(14, -38, 4, 6, '#9a9eaa');
      } else if (k === 'castle') { // le Château de Minuit
        D(-120, -230, 240, 198, '#2a1d4a'); D(-120, -230, 240, 8, '#4a3a7a');
        for (const tx of [-140, 100]) { D(tx, -270, 40, 238, '#2e2252'); D(tx - 4, -280, 48, 12, '#4a3a7a'); D(tx + 4, -320, 32, 40, '#3a2c66'); D(tx + 14, -340, 12, 20, '#c3b3ff'); }
        for (let x = -116; x < 120; x += 24) D(x, -248, 16, 20, '#2e2252');
        D(-36, -90, 72, 58, '#05080f'); D(-28, -104, 56, 14, '#05080f'); D(-40, -100, 8, 68, '#4a3a7a'); D(32, -100, 8, 68, '#4a3a7a');
        D(-16, -180, 32, 32, '#e8e0f0'); D(-1, -176, 2, 14, '#2a1d38'); D(-1, -164, 10, 2, '#2a1d38'); // horloge arrêtée sur minuit
        for (let i = 0; i < 5; i++) D(-100 + i * 50, -150, 10, 16, Math.sin(this.t * 2 + i) > 0 ? '#c3b3ff' : '#6a5aa0');
      }
    });
  }
}

// ---------- la tour-horloge de Bourg-Luciole ----------
// L'heure suit les fragments d'aube ; six lanternes s'allument autour du cadran. À chaque fragment rapporté, une cérémonie.
class ClockTower {
  constructor(x, y) { this.x = x; this.y = y; this.w = 64; this.h = 22; this.solid = true; this.t = 0; this.shown = SAVE.fragments || 0; this.hand = this.shown; this.glow = 0; }
  get light() { return { r: 50 + this.shown * 10 + this.glow * 40, c: 'rgba(255,220,140,' }; }
  canInteract() { return true; }
  interact(G) {
    const n = SAVE.fragments || 0; persist(); SFX.pickup();
    G.say([{ text: n >= 6 ? 'La tour-horloge sonne midi : le soleil brille sur Aube-Figée. Partie sauvegardée.' : n ? `La tour-horloge indique ${n} h du matin. ${n} lanterne${n > 1 ? 's' : ''} d'aube sur 6 brille${n > 1 ? 'nt' : ''}. Partie sauvegardée.` : 'La tour-horloge est arrêtée sur minuit. Six lanternes éteintes entourent le cadran. Partie sauvegardée.' }]);
  }
  update(dt, G) {
    this.t += dt; if (this.glow > 0) this.glow -= dt * 0.5;
    if (!G.cut) { this.shown = SAVE.fragments || 0; this.hand = this.shown; }
    if (Math.random() < dt * (2 + this.shown * 2)) G.parts.add({ x: this.x + rand(-30, 30), y: this.y - rand(40, 130), vy: -8, life: 1.4, c: pick(['#ffe27a', '#fff6c0']), r: 1 });
  }
  draw() {
    ell(this.x, this.y, 36, 8, 'rgba(0,0,0,.4)');
    const n = this.shown, sun = SAVE.boss6;
    hi(this.x, this.y, false, () => {
      // socle et fût
      D(-64, -26, 128, 26, '#5a5468'); D(-64, -26, 128, 5, '#7a7488'); D(-56, -8, 112, 8, '#4a4458');
      D(-36, -210, 72, 186, '#6a6478'); D(-36, -210, 10, 186, '#8a8498'); D(26, -210, 10, 186, '#4a4458');
      for (let y = -200; y < -30; y += 14) D(-36, y, 72, 2, '#5a5468');
      D(-12, -60, 24, 34, '#2a1d38'); D(-10, -58, 20, 32, '#3a2a48'); // porte
      // toit
      D(-44, -226, 88, 18, '#3a2c66'); D(-34, -250, 68, 26, '#3a2c66'); D(-22, -270, 44, 22, '#4a3a7a'); D(-8, -292, 16, 24, '#4a3a7a'); D(-2, -306, 4, 16, '#c8a040');
      // grand cadran
      const cx = 0, cy = -160;
      ctx.fillStyle = '#c8a040'; ctx.beginPath(); ctx.arc(cx, cy, 34, 0, 7); ctx.fill();
      ctx.fillStyle = sun ? '#fff6d8' : '#e8e0d0'; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, 7); ctx.fill();
      for (let i = 0; i < 12; i++) { const b = i / 12 * Math.PI * 2; D(Math.round(cx + Math.sin(b) * 25) - 2, Math.round(cy - Math.cos(b) * 25) - 2, 4, 4, '#5a4a6a'); }
      // les six lanternes d'aube autour du cadran
      for (let i = 0; i < 6; i++) {
        const b = -Math.PI * 0.85 + i * (Math.PI * 1.7 / 5), lx = Math.round(cx + Math.cos(b) * 50), ly = Math.round(cy + Math.sin(b) * 50) + 18, on = i < n;
        D(lx - 6, ly - 8, 12, 14, '#3a3d48'); D(lx - 4, ly - 6, 8, 10, on ? (Math.sin(this.t * 4 + i) > 0 ? '#ffe27a' : '#ffcf3a') : '#1a1428'); D(lx - 2, ly - 12, 4, 4, '#3a3d48');
      }
      const a1 = (this.hand / 12) * Math.PI * 2;
      ctx.strokeStyle = '#2a1d38'; ctx.lineCap = 'round'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(a1) * 17, cy - Math.cos(a1) * 17); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 25); ctx.stroke();
      D(-4, cy - 4, 8, 8, '#c8a040');
    });
    if (this.glow > 0) { // onde de lumière qui part du cadran, et rayons
      const k = 1.2 - this.glow, cy = this.y - 80;
      ctx.globalAlpha = Math.min(0.25, this.glow * 0.3); ell(this.x, cy, 30, 30, '#fff2c0');
      ctx.globalAlpha = Math.min(0.8, this.glow); ctx.strokeStyle = '#ffe27a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(this.x, cy, 20 + k * 160, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 1; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + this.t * 0.4, r0 = 26, r1 = 26 + this.glow * 60; ctx.beginPath(); ctx.moveTo(this.x + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(this.x + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
  }
}

// ---------- les zones ----------
function relayPos(area, x, y) { return () => ({ x: x * TS + 8, y: (y + 2) * TS + 4, dir: 'down', area }); }
const ZONE_ARRIVE = {
  village_from_collines: { x: 32 * TS, y: 4 * TS, dir: 'down' }, village_from_foret: { x: 3 * TS, y: 24 * TS + 4, dir: 'right' }, village_from_lac: { x: 32 * TS, y: 44 * TS, dir: 'up' },
  collines_from_village: { x: 32 * TS, y: 44 * TS, dir: 'up' }, collines_from_montagne: { x: 60 * TS, y: 22 * TS, dir: 'left' },
  foret_from_village: { x: 60 * TS, y: 24 * TS + 4, dir: 'left' },
  montagne_from_collines: { x: 3 * TS, y: 22 * TS, dir: 'right' },
  lac_from_village: { x: 32 * TS, y: 4 * TS, dir: 'down' }, lac_from_cote: { x: 60 * TS, y: 32 * TS, dir: 'left' }, lac_from_terres: { x: 3 * TS, y: 38 * TS, dir: 'right' },
  cote_from_lac: { x: 3 * TS, y: 32 * TS, dir: 'right' },
  terres_from_lac: { x: 60 * TS, y: 38 * TS, dir: 'left' },
};
const goZone = (area, key) => G => G.enter(area, ZONE_ARRIVE[key]);

// ----- Bourg-Luciole (le village, au centre) -----
function buildVillageArea() {
  const Z = zoneGrid(77), { rect } = Z;
  rect(30, 0, 4, 2, '1'); rect(30, ZH - 2, 4, 2, '3'); rect(0, 23, 2, 2, '2');
  rect(2, 3, 6, 42, '.'); rect(8, 2, 3, 44, '~'); rect(2, 23, 6, 2, '=');                   // la rivière de l'ouest et son pont-levis
  rect(30, 2, 4, 44, 'c'); rect(11, 23, 48, 2, 'c'); rect(11, 39, 48, 2, 'c'); rect(24, 18, 16, 12, 'c'); // rues et place
  rect(17, 21, 2, 2, '='); rect(45, 21, 2, 2, '='); rect(19, 12, 11, 2, '='); rect(34, 12, 13, 2, '=');
  rect(17, 38, 2, 1, '='); rect(45, 38, 2, 1, '='); rect(53, 38, 2, 1, '='); rect(24, 38, 2, 1, '='); rect(39, 38, 2, 1, '=');
  rect(12, 25, 2, 14, '='); rect(56, 25, 2, 14, '=');
  Z.flowers(90);
  const A = zoneArea('royaume', Z.g, 'royaume', { name: 'Bourg-Luciole', dark: 0.5 });
  const H = (id, x, y, o) => ({ id, x: x * TS + 8, y: (y + 1) * TS, o });
  A.houses = [
    H('auberge', 17, 20, { w: 6, d: 4, sign: 'inn', roof: '#8a3a3a', chimney: true }),
    H('bibliotheque', 45, 20, { w: 6, d: 4, sign: 'library', roof: '#3a4a8a', wall: '#b8b0c8', chimney: true }),
    H('pierrette', 17, 11, { w: 5, d: 3, roof: '#6a5a8a' }),
    H('gaspard', 45, 11, { w: 5, d: 3, roof: '#3a6a4a' }),
    H('forge', 17, 37, { w: 6, d: 4, sign: 'forge', roof: '#4a4450', wall: '#a8a0a8', chimney: true }),
    H('epicerie', 45, 37, { w: 6, d: 4, sign: 'shop', roof: '#a85a2a' }),
    H('mamie', 53, 37, { w: 5, d: 3, sign: 'kitchen', roof: '#6a5a3a', chimney: true, locked: () => !SAVE.freed2 && 'Une maison au toit de chaume, avec un vieux chaudron dans la cheminée. Personne ne répond.' }),
    H('comptoir', 24, 37, { w: 5, d: 3, sign: 'trade', roof: '#8a6a2a', locked: () => !SAVE.freed3 && '« Maison à louer. » La porte est fermée.' }),
    H('mahaut', 39, 37, { w: 5, d: 3, roof: '#5a3a6a' }),
  ];
  const keep = A.houses.map(h => ({ x: h.x - 64, y: h.y - 96, w: 128, h: 120 }));
  keep.push({ x: 0, y: 0, w: 12 * TS, h: ZH * TS }, { x: 22 * TS, y: 16 * TS, w: 20 * TS, h: 16 * TS }, { x: 50 * TS, y: 24 * TS, w: 12 * TS, h: 10 * TS });
  scatter(A, 41, keep, { trees: 34, rocks: 10, flowers: 20, bushes: 26 });
  const lamp = { r: 46, c: 'rgba(255,220,150,' };
  for (const [x, y] of [[23, 17], [40, 17], [23, 30], [40, 30], [29, 8], [34, 8], [29, 42], [34, 42], [14, 22], [52, 22], [14, 41], [52, 41]]) A.addProp('lamp', x * TS, y * TS, { fw: 4, fh: 3, light: Object.assign({ oy: -26 }, lamp) });
  A.spawn = function () {
    this.ents = [];
    for (const [x, y] of this.bushSpots) this.ents.push(new Bush(x, y));
    for (const h of this.houses) this.ents.push(Object.assign(new House(h.x, h.y, Object.assign({ interior: h.id }, h.o)), { hid: h.id }));
    this.ents.push(new ClockTower(32 * TS, 26 * TS));
    this.ents.push(new GateBlock(32 * TS, 4 * TS, 64));
    this.ents.push(new NPC(28 * TS, 5 * TS, { look: 'garde', talk: 'garde' }));
    this.ents.push(new Relay(26 * TS, 29 * TS, 'village'));
    this.ents.push(new Rift(55 * TS, 30 * TS, { active: () => !!SAVE.boss6, closed: 'La faille par laquelle tu es arrivé{e} s\'est refermée. Lumi dit qu\'elle se rouvrira quand le jour se lèvera.', enter: G => G.fadeTo(() => G.enter('camp', G.areas.camp.dawn, false), '#c8a8ff') }));
    this.ents.push(new Decor(36 * TS, 28 * TS, 'well'), new Decor(27 * TS, 20 * TS, 'stall'));
    // la rivière de l'ouest : cible et pont-levis vers la Forêt
    const bx = VIL.bridge.x * TS, by = VIL.bridge.y * TS;
    this.ents.push(new Target(4 * TS + 8, by - 14, 'drawbridge', G => { G.area.syncTiles(); G.say(Story.script('bridge_down')); }));
    this.ents.push(new DrawbridgeDeco(bx - 4, by + 18));
    this.ents.push(new Sign(13 * TS, 22 * TS, [{ text: '« Pont-levis de la Forêt. Fermé par ordre du Roi Minuit. »' }, { who: '{hero}', text: 'Il y a une cible sur l\'autre rive… Si seulement je pouvais l\'atteindre.', face: 'o' }]));
    this.ents.push(new Sign(35 * TS, 4 * TS, [{ text: '« Au nord : les Collines. Au sud : le Lac. À l\'ouest : la Forêt. »' }]));
    if (SAVE.q && SAVE.q.poules === 1) for (const [i, x, y] of [[0, 8 * TS, 8 * TS], [1, 58 * TS, 15 * TS], [2, 20 * TS, 44 * TS]]) if (!SAVE['poule' + i]) this.ents.push(new Chicken(x, y, i));
    questSpawns(this);
  };
  A.syncTiles = function () {
    const want = SAVE.drawbridge ? 'b' : '~', B = VIL.bridge; let changed = false;
    for (let y = B.y; y < B.y + B.h; y++) for (let x = B.x; x < B.x + B.w; x++) if (this.g[y][x] !== want) { this.g[y][x] = want; changed = true; }
    if (changed) this.rerender();
  };
  const sp0 = A.spawn; A.spawn = function () { this.syncTiles(); sp0.call(this); };
  A.arrival = { x: 55 * TS, y: 32 * TS, dir: 'up' };
  A.start = { x: 32 * TS, y: 31 * TS, dir: 'down' };
  A.plaza = { x: 32 * TS, y: 31 * TS };
  A.exits = { 1: goZone('collines', 'collines_from_village'), 2: goZone('foret', 'foret_from_village'), 3: goZone('lac', 'lac_from_village') };
  return A;
}

// ----- Les Collines (nord) : prairies, moulin, moutons, la grotte des lucioles -----
function buildCollinesArea() {
  const Z = zoneGrid(13), { rect, set } = Z;
  rect(30, ZH - 2, 4, 2, '1'); rect(ZW - 2, 20, 2, 4, '2');
  rect(2, 2, 60, 6, '#'); rect(28, 6, 8, 2, '.'); rect(31, 6, 2, 2, 'G');                   // la falaise et la grotte
  rect(31, 8, 2, 38, '='); rect(33, 21, 29, 2, '='); rect(16, 35, 15, 2, '=');
  Z.ell(14, 17, 7, 4.5, '~', 0.15);
  for (const [cx, cy, w, h] of [[44, 10, 4, 3], [50, 30, 3, 3], [8, 26, 3, 4], [22, 42, 4, 2], [40, 40, 3, 2], [56, 12, 3, 4]]) rect(cx, cy, w, h, '#');
  Z.flowers(160);
  const A = zoneArea('collines', Z.g, 'collines', { name: 'Les Collines', dark: 0.42 });
  A.houses = [{ id: 'berger', x: 14 * TS + 8, y: 35 * TS, o: { w: 5, d: 3, style: 'cabin', roof: '#5a4a3a' } }];
  scatter(A, 17, [{ x: 26 * TS, y: 0, w: 12 * TS, h: ZH * TS }, { x: 8 * TS, y: 28 * TS, w: 14 * TS, h: 10 * TS }, { x: 42 * TS, y: 26 * TS, w: 14 * TS, h: 12 * TS }], { trees: 26, rocks: 12, flowers: 30, bushes: 24, kinds: ['oak1', 'oak2', 'pine1'] });
  A.spawn = function () {
    this.ents = [];
    for (const [x, y] of this.bushSpots) this.ents.push(new Bush(x, y));
    for (const h of this.houses) this.ents.push(new House(h.x, h.y, Object.assign({ interior: h.id }, h.o)));
    this.ents.push(new Entrance(32 * TS, 8 * TS, 'cave'));
    this.ents.push(new Decor(48 * TS, 36 * TS, 'windmill', { say: [{ text: 'Un vieux moulin. Ses ailes tournent toutes seules, même sans vent.' }] }));
    for (const [x, y] of [[10, 30], [20, 26], [24, 32], [44, 16], [52, 18]]) this.ents.push(new Sheep(x * TS, y * TS));
    this.ents.push(new Decor(12 * TS, 38 * TS, 'fence'), new Decor(18 * TS, 38 * TS, 'fence'));
    this.ents.push(new Relay(36 * TS, 40 * TS, 'collines'));
    this.ents.push(new Sign(34 * TS, 10 * TS, [{ text: '« Grotte des lucioles. Ce qui dort au fond craint les cailloux bien lancés. »' }]));
    this.ents.push(new Sign(58 * TS, 20 * TS, [{ text: '« À l\'est : la Montagne et les Mines des gnomes. »' }]));
    for (const [x, y] of [[20, 14], [40, 14], [46, 26], [12, 22], [24, 38], [54, 40]]) this.ents.push(new Raccoon(x * TS, y * TS));
    this.ents.push(new Bat(26 * TS, 12 * TS), new Bat(40 * TS, 30 * TS), new Shadow(52 * TS, 8 * TS + 8));
  };
  A.start = ZONE_ARRIVE.collines_from_village;
  A.fromDungeon = { x: 32 * TS, y: 9 * TS + 8, dir: 'down' };
  A.exits = { 1: goZone('royaume', 'village_from_collines'), 2: goZone('montagne', 'montagne_from_collines'), G: G => G.enter('cave', G.areas.cave.start) };
  return A;
}

// ----- La Forêt (ouest) : sous-bois sombres, champignons, l'arbre creux du Bois des murmures -----
function buildForetArea() {
  const Z = zoneGrid(29), { rect } = Z, r = Z.r;
  rect(ZW - 2, 23, 2, 2, '1');
  rect(2, 2, 60, 6, '#'); rect(28, 6, 8, 2, '.'); rect(31, 6, 2, 2, 'H');
  rect(20, 23, 42, 2, '='); rect(31, 8, 2, 16, '='); rect(12, 25, 2, 12, '='); rect(46, 14, 2, 9, '=');
  for (let i = 0; i < 26; i++) { const x = 4 + Math.floor(r() * 54), y = 9 + Math.floor(r() * 34); if (Math.abs(x - 32) < 4 || Math.abs(y - 23.5) < 3) continue; rect(x, y, 2 + Math.floor(r() * 3), 2 + Math.floor(r() * 2), '#'); }
  Z.ell(50, 38, 6, 4, '~', 0.2);
  const A = zoneArea('foret', Z.g, 'foret', { name: 'La Forêt', dark: 0.55 });
  A.houses = [
    { id: 'bucheron', x: 12 * TS + 8, y: 37 * TS, o: { w: 5, d: 3, style: 'cabin', roof: '#3a3a2a', chimney: true } },
    { id: 'herboriste', x: 46 * TS + 8, y: 14 * TS, o: { w: 5, d: 3, style: 'shack', roof: '#4a6a3a', sign: 'herbs' } },
  ];
  scatter(A, 31, [{ x: 26 * TS, y: 0, w: 12 * TS, h: 26 * TS }, { x: 8 * TS, y: 30 * TS, w: 10 * TS, h: 10 * TS }, { x: 42 * TS, y: 8 * TS, w: 10 * TS, h: 8 * TS }], { trees: 46, rocks: 8, flowers: 6, bushes: 30, kinds: ['pine1', 'pine2', 'pine2'] });
  A.spawn = function () {
    this.ents = [];
    for (const [x, y] of this.bushSpots) this.ents.push(Object.assign(new Bush(x, y), { loot: 'bushBois' }));
    for (const h of this.houses) this.ents.push(new House(h.x, h.y, Object.assign({ interior: h.id }, h.o)));
    this.ents.push(new Entrance(32 * TS, 8 * TS, 'tree'));
    this.ents.push(new Relay(54 * TS, 27 * TS, 'foret'));
    this.ents.push(new Sign(35 * TS, 10 * TS, [{ text: '« Bois des murmures. N\'écoutez pas ce que disent les arbres. »' }]));
    for (const [x, y] of [[8, 12], [22, 30], [40, 34], [56, 12], [18, 18], [28, 40], [44, 30], [6, 40]]) this.ents.push(new Glowshroom(x * TS, y * TS));
    this.ents.push(new Boar(24 * TS, 16 * TS), new Boar(40 * TS, 40 * TS), new Squirrel(16 * TS, 28 * TS), new Squirrel(52 * TS, 32 * TS), new Crow(36 * TS, 30 * TS), new Crow(20 * TS, 42 * TS));
    questSpawns(this);
  };
  A.start = ZONE_ARRIVE.foret_from_village;
  A.fromDungeon = { x: 32 * TS, y: 9 * TS + 8, dir: 'down' };
  A.exits = { 1: goZone('royaume', 'village_from_foret'), H: G => G.enter('bois', G.areas.bois.start) };
  return A;
}

// ----- La Montagne (nord-est) : rochers, neige, la mine des gnomes -----
function buildMontagneArea() {
  const Z = zoneGrid(37), { rect } = Z, r = Z.r;
  rect(0, 20, 2, 4, '1');
  rect(2, 2, 60, 5, '#'); rect(38, 5, 6, 2, '.'); rect(40, 5, 2, 2, 'J');
  rect(36, 7, 4, 3, '#'); rect(42, 7, 4, 3, '#');
  rect(2, 21, 40, 2, '='); rect(40, 7, 2, 16, '='); rect(14, 23, 2, 12, '=');
  rect(48, 12, 9, 7, 'v'); rect(50, 14, 3, 2, '.');                                          // le ravin de la clé
  for (let i = 0; i < 18; i++) { const x = 4 + Math.floor(r() * 54), y = 9 + Math.floor(r() * 34); if (Math.abs(x - 40.5) < 4 || Math.abs(y - 21.5) < 3 || (x > 44 && y < 22)) continue; rect(x, y, 2 + Math.floor(r() * 3), 2 + Math.floor(r() * 3), '#'); }
  Z.flowers(40);
  const A = zoneArea('montagne', Z.g, 'montagne', { name: 'La Montagne', dark: 0.45 });
  A.houses = [{ id: 'gnome', x: 14 * TS + 8, y: 35 * TS, o: { w: 4, d: 3, style: 'hut', roof: '#8a5a3a', wall: '#8a8490' } }];
  A.decor = [];
  scatter(A, 39, [{ x: 34 * TS, y: 0, w: 14 * TS, h: 24 * TS }, { x: 8 * TS, y: 30 * TS, w: 12 * TS, h: 8 * TS }, { x: 46 * TS, y: 10 * TS, w: 14 * TS, h: 12 * TS }], { trees: 26, rocks: 22, flowers: 0, bushes: 10, kinds: ['pine1', 'pine2'] });
  A.spawn = function () {
    this.ents = [];
    for (const [x, y] of this.bushSpots) this.ents.push(new Bush(x, y));
    for (const h of this.houses) this.ents.push(new House(h.x, h.y, Object.assign({ interior: h.id }, h.o)));
    this.ents.push(new Entrance(41 * TS, 7 * TS, 'mine'));
    this.ents.push(new IronGate(41 * TS, 10 * TS, { flag: 'minesOpen', key: 'minesKey', w: 32, closedMsg: [{ text: '« Mines des gnomes. Fermé jusqu\'à nouvel ordre. »' }, { who: '{hero}', text: 'Une grille fermée à clé… La clé ne doit pas être loin.', face: 'o' }], openMsg: [{ text: 'La clé tourne dans la serrure. La grille des Mines s\'ouvre !' }] }));
    this.ents.push(new SpecialKey(51 * TS + 8, 15 * TS + 12, 'minesKey', [{ text: 'Tu as récupéré la clé de la grille des Mines !' }, { who: 'Lumi', text: 'La grille est juste au nord. Les gnomes vont être surpris !' }]));
    this.ents.push(new Sign(47 * TS, 21 * TS, [{ text: '« Corniche du vieux gardien. Il y a perdu sa clé il y a cent ans. Personne n\'a jamais pu la rattraper. »' }, { who: '{hero}', text: 'Une clé, sur la corniche… Il faudrait quelque chose qui aille la chercher et qui revienne.', face: 'o' }]));
    this.ents.push(new Relay(8 * TS, 25 * TS, 'montagne'));
    for (const [x, y] of [[20, 12], [28, 30], [50, 34], [8, 40]]) this.ents.push(new Decor(x * TS, y * TS, 'rocks'));
    this.ents.push(new Raccoon(24 * TS, 14 * TS), new Raccoon(50 * TS, 28 * TS), new Bat(30 * TS, 34 * TS), new Bat(18 * TS, 12 * TS), new CrystalSpider(56 * TS, 40 * TS), new CrystalSpider(34 * TS, 42 * TS));
  };
  A.start = ZONE_ARRIVE.montagne_from_collines;
  A.fromDungeon = { x: 41 * TS, y: 12 * TS, dir: 'down' };
  A.exits = { 1: goZone('collines', 'collines_from_montagne'), J: G => G.enter('mines', G.areas.mines.start) };
  return A;
}

// ----- Le Lac (sud) : ravin, plages, cabane du pêcheur, le temple englouti -----
function buildLacArea() {
  const Z = zoneGrid(91), { rect } = Z;
  rect(30, 0, 4, 2, '1'); rect(ZW - 2, 30, 2, 4, '2'); rect(0, 37, 2, 2, '3');
  rect(2, 2, 22, 4, '#'); rect(40, 2, 22, 4, '#'); rect(24, 2, 16, 4, '.'); rect(31, 2, 2, 4, '=');
  rect(2, 6, 60, 3, 'v');                                                                      // le ravin
  Z.ell(31, 28, 22, 11.5, 'S', 0.1); Z.ell(31, 28, 19.5, 9.5, '~', 0.12);                       // plage et lac
  rect(28, 22, 8, 7, '='); rect(29, 20, 6, 2, '#'); rect(31, 21, 2, 1, 'M');                  // îlot du temple
  rect(9, 25, 19, 2, '=');                                                                     // la chaussée
  rect(56, 9, 3, 37, '~'); rect(59, 30, 3, 4, '=');                                            // le chenal de l'est (à la nage)
  rect(2, 33, 10, 4, '#'); rect(2, 39, 10, 7, '#'); rect(2, 37, 10, 2, '=');                   // le défilé de l'ouest
  rect(31, 9, 2, 6, '='); rect(12, 12, 44, 2, '='); rect(12, 14, 2, 11, '='); rect(10, 25, 2, 12, '=');
  Z.flowers(50);
  const A = zoneArea('lac', Z.g, 'lac', { name: 'Le Lac', dark: 0.45 });
  A.houses = [{ id: 'pecheur', x: 46 * TS + 8, y: 15 * TS, o: { w: 5, d: 3, style: 'cabin', roof: '#3a5a6a', sign: 'fish' } }];
  scatter(A, 63, [{ x: 0, y: 0, w: ZW * TS, h: 16 * TS }, { x: 0, y: 30 * TS, w: 14 * TS, h: 18 * TS }, { x: 52 * TS, y: 0, w: 12 * TS, h: ZH * TS }], { trees: 24, rocks: 10, flowers: 16, bushes: 18 });
  A.spawn = function () {
    this.ents = [];
    for (const [x, y] of this.bushSpots) this.ents.push(new Bush(x, y));
    for (const h of this.houses) this.ents.push(new House(h.x, h.y, Object.assign({ interior: h.id }, h.o)));
    this.ents.push(new Post(28 * TS + 8, 5 * TS), new Post(36 * TS + 8, 11 * TS));
    this.ents.push(new Sign(26 * TS, 5 * TS, [{ text: '« Ravin du lac. Le pont a été emporté. Les gnomes y passaient au grappin. »' }]));
    this.ents.push(new Facade(32 * TS, 22 * TS, 'temple'));
    this.ents.push(new Sign(15 * TS, 27 * TS, [{ text: '« Temple englouti. Entrée par la chaussée. »' }]));
    this.ents.push(new Rubble(6 * TS + 8, 37 * TS + 12, 'rubble1'), new Rubble(6 * TS + 8, 38 * TS + 12, 'rubble2'));
    this.ents.push(new Sign(10 * TS, 36 * TS, [{ text: '« Défilé des Terres de Minuit. Éboulement : passage impossible. »' }, { who: '{hero}', text: 'Des rochers énormes… Il faudrait les faire sauter.', face: 'o' }]));
    this.ents.push(new Sign(54 * TS, 14 * TS, [{ text: '« À l\'est, de l\'autre côté du chenal : la Côte. Il faut savoir nager. »' }]));
    this.ents.push(new Relay(38 * TS, 11 * TS, 'lac'));
    this.ents.push(new Decor(44 * TS, 18 * TS, 'boat'), new Decor(16 * TS, 40 * TS, 'boat'));
    this.ents.push(new Crab(14 * TS, 20 * TS), new Crab(46 * TS, 38 * TS), new Crab(24 * TS, 40 * TS), new Raccoon(40 * TS, 13 * TS), new Crow(20 * TS, 16 * TS), new Crow(50 * TS, 26 * TS));
    questSpawns(this);
  };
  A.update = function (G) {
    const P = G.player;
    if (!SAVE.lacCrossed && P.y > 10 * TS) { SAVE.lacCrossed = true; persist(); }
    if (!SAVE.lacHint && P.y < 6 * TS && !Inventory.has('grappin')) { SAVE.lacHint = true; G.say(Story.script('lacNoHook')); }
  };
  A.start = ZONE_ARRIVE.lac_from_village;
  A.fromDungeon = { x: 32 * TS, y: 23 * TS + 6, dir: 'down' };
  A.exits = { 1: goZone('royaume', 'village_from_lac'), 2: goZone('cote', 'cote_from_lac'), 3: goZone('terres', 'terres_from_lac'), M: G => G.enter('temple', G.areas.temple.start) };
  return A;
}

// ----- La Côte (est du lac) : plages, mer, phare, village d'artificiers, l'île de la tour -----
function buildCoteArea() {
  const Z = zoneGrid(53), { rect, set } = Z, r = Z.r;
  rect(0, 30, 2, 4, '1');
  for (let y = 2; y < ZH - 2; y++) { const sx = 38 + Math.round(Math.sin(y * 0.35) * 2 + r() * 1.5); rect(sx, y, ZW - 2 - sx, 1, '~'); rect(sx - 4, y, 4, 1, 'S'); }
  Z.ell(51, 21, 6, 5, '.', 0.1); rect(46, 15, 11, 1, '~');
  rect(49, 16, 6, 2, '#'); rect(51, 17, 2, 1, 'N');
  rect(2, 31, 30, 2, '='); rect(16, 16, 2, 15, '='); rect(16, 16, 10, 2, '=');
  Z.flowers(60);
  const A = zoneArea('cote', Z.g, 'cote', { name: 'La Côte', dark: 0.42 });
  A.houses = [
    { id: 'artificiere', x: 22 * TS + 8, y: 15 * TS, o: { w: 6, d: 4, roof: '#c83a3a', sign: 'fire', chimney: true } },
    { id: 'phare', x: 12 * TS + 8, y: 41 * TS, o: { w: 4, d: 3, style: 'hut', roof: '#3a5a8a', wall: '#d8d0c8' } },
  ];
  scatter(A, 57, [{ x: 30 * TS, y: 0, w: 34 * TS, h: ZH * TS }, { x: 14 * TS, y: 8 * TS, w: 16 * TS, h: 12 * TS }, { x: 6 * TS, y: 36 * TS, w: 12 * TS, h: 10 * TS }], { trees: 20, rocks: 10, flowers: 20, bushes: 18, kinds: ['oak1', 'oak2'] });
  A.spawn = function () {
    this.ents = [];
    for (const [x, y] of this.bushSpots) this.ents.push(new Bush(x, y));
    for (const h of this.houses) this.ents.push(new House(h.x, h.y, Object.assign({ interior: h.id }, h.o)));
    this.ents.push(new Facade(52 * TS, 18 * TS, 'tower'));
    this.ents.push(new Decor(30 * TS, 44 * TS, 'lighthouse'));
    for (const [x, y] of [[34, 10], [33, 26], [34, 38], [28, 20]]) this.ents.push(new Decor(x * TS, y * TS, 'palm'));
    this.ents.push(new Relay(10 * TS, 27 * TS, 'cote'));
    this.ents.push(new Sign(35 * TS, 31 * TS, [{ text: '« Tour des artificiers, sur l\'île. Danger : poudre ! »' }]));
    this.ents.push(new Crab(30 * TS, 14 * TS), new Crab(32 * TS, 34 * TS), new Crab(26 * TS, 40 * TS), new Crow(20 * TS, 24 * TS), new Crow(10 * TS, 12 * TS), new Eel(44 * TS, 34 * TS));
    questSpawns(this);
  };
  A.start = ZONE_ARRIVE.cote_from_lac;
  A.fromDungeon = { x: 52 * TS, y: 19 * TS + 4, dir: 'down' };
  A.exits = { 1: goZone('lac', 'lac_from_cote'), N: G => G.enter('tower', G.areas.tower.start) };
  return A;
}

// ----- Les Terres de Minuit (ouest du lac) : landes violettes, tombes, le château -----
function buildTerresArea() {
  const Z = zoneGrid(71), { rect } = Z, r = Z.r;
  rect(ZW - 2, 37, 2, 2, '1');
  rect(2, 2, 60, 6, '#'); rect(26, 7, 12, 2, '.'); rect(31, 7, 2, 2, 'O');
  rect(31, 9, 2, 29, '='); rect(33, 37, 29, 2, '='); rect(14, 30, 17, 2, '=');
  for (let i = 0; i < 18; i++) { const x = 4 + Math.floor(r() * 54), y = 10 + Math.floor(r() * 32); if (Math.abs(x - 32) < 5 || Math.abs(y - 37.5) < 3) continue; rect(x, y, 2 + Math.floor(r() * 2), 2 + Math.floor(r() * 2), '#'); }
  Z.ell(48, 20, 5, 3, '~', 0.2);
  Z.flowers(40);
  const A = zoneArea('terres', Z.g, 'terres', { name: 'Les Terres de Minuit', dark: 0.58 });
  A.houses = [{ id: 'ermite', x: 14 * TS + 8, y: 30 * TS, o: { w: 4, d: 3, style: 'shack', roof: '#3a2a4a', wall: '#5a4a5a' } }];
  A.decor = [];
  scatter(A, 73, [{ x: 24 * TS, y: 0, w: 16 * TS, h: ZH * TS }, { x: 8 * TS, y: 24 * TS, w: 14 * TS, h: 10 * TS }], { trees: 28, rocks: 10, flowers: 0, bushes: 10, kinds: ['dead', 'dead', 'pine2'] });
  A.spawn = function () {
    this.ents = [];
    for (const [x, y] of this.bushSpots) this.ents.push(new Bush(x, y));
    for (const [, x, y] of this.decor || []) this.ents.push(new Decor(x, y, 'dead'));
    for (const h of this.houses) this.ents.push(new House(h.x, h.y, Object.assign({ interior: h.id }, h.o)));
    this.ents.push(new Entrance(32 * TS, 9 * TS, 'castle'));
    for (const [x, y] of [[20, 14], [22, 16], [24, 14], [42, 28], [44, 30], [10, 40], [54, 44]]) this.ents.push(new Decor(x * TS, y * TS, 'grave'));
    this.ents.push(new Relay(50 * TS, 40 * TS, 'terres'));
    this.ents.push(new Sign(35 * TS, 11 * TS, [{ text: '« Château de Minuit. Ici, il est toujours minuit. »' }]));
    this.ents.push(new Shadow(20 * TS, 20 * TS), new Shadow(44 * TS, 16 * TS), new Shadow(16 * TS, 40 * TS), new Shadow(50 * TS, 30 * TS), new Shadow(40 * TS, 44 * TS), new Shadow(8 * TS, 14 * TS), new Wisp(26 * TS, 26 * TS), new Wisp(54 * TS, 12 * TS));
  };
  A.start = ZONE_ARRIVE.terres_from_lac;
  A.fromDungeon = { x: 32 * TS, y: 10 * TS + 8, dir: 'down' };
  A.exits = { 1: goZone('lac', 'lac_from_terres'), O: G => G.enter('castle', G.areas.castle.start) };
  return A;
}

// ---------- petites bêtes inoffensives ----------
class Sheep {
  constructor(x, y) { this.x = x; this.y = y; this.w = 14; this.h = 6; this.t = rand(0, 9); this.vx = 0; this.vy = 0; this.st = 0; this.face = 1; }
  update(dt, G) {
    this.t += dt; this.st -= dt;
    if (this.st <= 0) { this.st = rand(1, 3); const a = rand(0, 6.28), s = Math.random() < 0.5 ? 0 : 14; this.vx = Math.cos(a) * s; this.vy = Math.sin(a) * s; if (this.vx) this.face = Math.sign(this.vx); if (Math.random() < 0.15) SFX.baa(); }
    moveEnt(G.area, this, this.vx * dt, 0, { noExit: true }); moveEnt(G.area, this, 0, this.vy * dt, { noExit: true });
  }
  draw() { ell(this.x, this.y, 8, 2.5, 'rgba(0,0,0,.3)'); hi(this.x, this.y, this.face > 0, () => DECOR.sheep.draw(this.t)); }
}
