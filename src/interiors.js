'use strict';
// ---------- maisons (vues de dehors), intérieurs, meubles, étals des boutiques ----------

// ---------- la maison vue de dehors : on entre en marchant vers sa porte ----------
// o : { w, d, style ('house' | 'cabin' | 'hut' | 'bungalow' | 'shack'), roof, wall, sign, chimney, interior (id), locked () => message | null }
class House {
  constructor(x, y, o) {
    this.x = x; this.y = y; this.o = o; this.w = o.w * TS; this.h = o.d * TS; this.solid = true; this.t = rand(0, 5); this.isHouse = true;
    const hw = this.w / 2 - 14;
    this.lights = o.style === 'bungalow' ? [{ dx: -hw + 4, dy: -14, r: 28, c: 'rgba(255,220,150,' }] : [{ dx: -hw, dy: -12, r: 34, c: 'rgba(255,200,120,' }, { dx: hw, dy: -12, r: 34, c: 'rgba(255,200,120,' }];
  }
  // le bloc solide laisse libre le seuil de la porte
  get door() { return { x: this.x - 9, y: this.y - 4, w: 18, h: 8 }; }
  update(dt, G) {
    this.t += dt; const P = G.player;
    if (G.state !== 'play' || P.bump > 0) return;
    const fb = { x: P.x - 4, y: P.y - 10, w: 8, h: 8 };
    if (P.dir === 'up' && Input.dy < -0.3 && rectHit(fb, this.door)) {
      const lock = this.o.locked && this.o.locked();
      if (lock) { P.bump = 1.2; SFX.locked(); G.say(typeof lock === 'string' ? [{ text: lock }] : lock); return; }
      SFX.door(); G.enterHouse(this);
    }
  }
  draw() {
    const o = this.o, st = o.style || 'house';
    ell(this.x, this.y + 2, this.w / 2 + 4, 5, 'rgba(0,0,0,.4)');
    if (st === 'bungalow') return this.drawBungalow();
    if (st === 'hut') return this.drawHut();
    const W2 = this.w * 2, D2 = this.h * 2, fh = 44;
    const wall = o.wall || (st === 'cabin' || st === 'shack' ? '#7a5434' : '#cbb898'), timber = st === 'cabin' || st === 'shack' ? '#4a3020' : '#5a3a22', roof = o.roof || (st === 'cabin' ? '#4a3a2a' : '#8a3a3a');
    hi(this.x, this.y, false, () => {
      const L = -W2 / 2;
      const ry = -D2 - 26, rh = D2 + 26 - fh + 6;
      D(L - 6, ry, W2 + 12, rh, roof);
      if (st === 'shack') { for (let xx = L - 6; xx < L + W2 + 6; xx += 10) D(xx, ry, 2, rh, shade(roof, 0.75)); }
      else { for (let yy = ry + 6; yy < ry + rh; yy += 8) D(L - 6, yy, W2 + 12, 2, shade(roof, 0.75)); for (let yy = ry + 2; yy < ry + rh; yy += 16) for (let xx = L - 6 + ((yy / 8) & 1) * 8; xx < L + W2 + 6; xx += 16) D(xx, yy, 2, 6, shade(roof, 0.8)); }
      D(L - 6, ry, W2 + 12, 4, shade(roof, 1.3)); D(L - 6, ry + rh - 4, W2 + 12, 4, shade(roof, 0.55));
      if (o.chimney) { D(L + W2 - 40, ry - 18, 16, 26, '#6a6070'); D(L + W2 - 42, ry - 22, 20, 6, '#4a4450'); }
      D(L, -fh, W2, fh, wall);
      if (st === 'cabin' || st === 'shack') for (let yy = -fh + 4; yy < 0; yy += 7) { D(L, yy, W2, 2, shade(wall, 0.7)); D(L, yy - 2, W2, 1, shade(wall, 1.15)); }
      else { D(L, -fh, W2, 3, shade(wall, 1.12)); D(L, -fh, 6, fh, timber); D(L + W2 - 6, -fh, 6, fh, timber); D(L, -fh + 2, W2, 4, timber); }
      // porte
      D(-12, -34, 24, 34, '#3a2414'); D(-10, -32, 20, 32, '#6a4224'); D(-1, -32, 2, 32, '#4a2a14'); D(5, -18, 3, 3, '#c8a040'); D(-14, -38, 28, 5, timber);
      D(-14, -2, 28, 2, '#8a8478');
      const g = 0.85 + 0.15 * Math.sin(this.t * 2);
      for (const sx of [-1, 1]) { const wx = sx * (W2 / 2 - 28) - 9; D(wx - 2, -34, 22, 20, timber); D(wx, -32, 18, 16, `rgba(255,207,122,${g})`); D(wx + 8, -32, 2, 16, timber); D(wx, -25, 18, 2, timber); }
      if (o.sign && SIGNS[o.sign]) { D(18, -50, 2, 8, '#3a2414'); D(18, -50, 26, 2, '#3a2414'); D(22, -46, 24, 18, '#d8c8a8'); D(22, -46, 24, 2, '#f0e8d8'); SIGNS[o.sign](34, -37); }
    });
  }
  drawBungalow() { // mobile-home du camping
    const W2 = this.w * 2, L = -W2 / 2, o = this.o, c = o.wall || '#e8e0d0', trim = o.roof || '#3a7a8a';
    hi(this.x, this.y, false, () => {
      D(L - 4, -84, W2 + 8, 30, '#6a6a72'); D(L - 4, -84, W2 + 8, 4, '#8a8a92'); for (let xx = L; xx < L + W2; xx += 12) D(xx, -80, 2, 26, '#5a5a62');
      D(L, -56, W2, 52, c); D(L, -56, W2, 3, '#fff'); D(L, -10, W2, 6, trim); for (let xx = L + 8; xx < L + W2; xx += 8) D(xx, -50, 1, 40, shade(c, 0.9));
      D(-12, -46, 24, 42, '#5a6a7a'); D(-10, -44, 20, 40, '#7a8a9a'); D(6, -26, 3, 3, '#c8c8d0'); // porte
      D(-16, -4, 32, 4, '#8a6a4a'); D(-18, 0, 36, 3, '#6a4a2a'); // marche
      const g = 0.8 + 0.2 * Math.sin(this.t * 2);
      D(L + 12, -46, 26, 18, '#3a4a5a'); D(L + 14, -44, 22, 14, `rgba(255,220,150,${g})`); D(L + 24, -44, 2, 14, '#3a4a5a');
      D(L + W2 - 38, -46, 26, 18, '#3a4a5a'); D(L + W2 - 36, -44, 22, 14, 'rgba(140,170,200,.8)');
      if (o.number) text(o.number, this.x - this.w / 2 + 6, this.y - 26, { size: 6, color: '#3a4a5a', shadow: false, bold: true });
    });
  }
  drawHut() { // hutte ronde en pierre (gnome) ou cabane d'ermite
    const W2 = this.w * 2, o = this.o, stone = o.wall || '#7a7480', roof = o.roof || '#6a4a3a';
    hi(this.x, this.y, false, () => {
      D(-W2 / 2, -46, W2, 46, stone); for (let yy = -42; yy < 0; yy += 8) for (let xx = -W2 / 2 + ((yy / 8) & 1) * 6; xx < W2 / 2; xx += 12) D(xx, yy, 10, 6, shade(stone, 1.1));
      for (let i = 0; i < 6; i++) D(-W2 / 2 - 6 + i * 4, -60 - i * 10, W2 + 12 - i * 8, 12, shade(roof, 1 - i * 0.05));
      D(-3, -126, 6, 12, shade(roof, 0.7));
      D(-11, -34, 22, 34, '#2a1a10'); D(-9, -32, 18, 32, '#5a3a22'); D(3, -18, 3, 3, '#c8a040');
      D(W2 / 2 - 22, -36, 12, 10, '#3a2414'); D(W2 / 2 - 20, -34, 8, 6, 'rgba(255,207,122,.9)');
    });
  }
}
const SIGNS = {
  forge: (x, y) => { D(x - 7, y - 3, 14, 4, '#3a3d48'); D(x - 4, y + 1, 8, 4, '#3a3d48'); D(x - 9, y - 3, 3, 2, '#3a3d48'); },
  kitchen: (x, y) => { D(x - 7, y - 2, 14, 7, '#3a3d48'); D(x - 8, y - 4, 16, 3, '#5a5e6a'); D(x - 3, y - 8, 2, 4, '#c8c8d0'); D(x + 1, y - 9, 2, 5, '#c8c8d0'); },
  shop: (x, y) => { D(x - 3, y - 6, 6, 3, '#f0e8d8'); D(x - 5, y - 3, 10, 9, '#c83a4a'); D(x - 3, y - 1, 3, 3, '#ff8a9a'); },
  inn: (x, y) => { D(x - 7, y - 1, 14, 5, '#8a5a34'); D(x - 7, y - 4, 4, 4, '#f0e8d8'); D(x - 8, y + 4, 2, 3, '#5a3418'); D(x + 6, y + 4, 2, 3, '#5a3418'); },
  library: (x, y) => { D(x - 7, y - 5, 14, 10, '#3a6ab0'); D(x - 1, y - 5, 2, 10, '#f0e8d8'); D(x - 6, y - 4, 4, 1, '#f0e8d8'); D(x + 2, y - 4, 4, 1, '#f0e8d8'); },
  trade: (x, y) => { D(x - 6, y - 5, 12, 10, '#ffd23a'); D(x - 4, y - 3, 8, 6, '#ffe27a'); D(x - 1, y - 2, 2, 4, '#c08a10'); },
  herbs: (x, y) => { D(x - 1, y - 6, 2, 12, '#3a7a40'); D(x - 6, y - 4, 5, 3, '#5aa060'); D(x + 1, y - 1, 5, 3, '#5aa060'); D(x - 5, y + 2, 4, 3, '#5aa060'); },
  fish: (x, y) => { D(x - 7, y - 2, 11, 5, '#6a8ab0'); D(x + 4, y - 4, 4, 9, '#6a8ab0'); D(x - 5, y - 1, 2, 2, '#fff'); },
  fire: (x, y) => { D(x - 2, y - 6, 4, 10, '#d83a3a'); D(x - 1, y - 9, 2, 3, '#ffcf3a'); D(x - 6, y + 2, 12, 3, '#3a2414'); },
};

// ---------- meubles ----------
class Furniture {
  constructor(x, y, kind, o = {}) { this.x = x; this.y = y; this.kind = kind; this.o = o; this.t = rand(0, 5); const S = FURN[kind]; this.w = S.w; this.h = S.h; this.solid = S.solid !== false; this.ground = !!S.ground; if (S.light) this.light = S.light; }
  update(dt) { this.t += dt; }
  canInteract() { return !!this.o.say; }
  interact(G) { G.say(this.o.say); }
  draw() { if (!this.ground) ell(this.x, this.y, this.w / 2 + 1, 2, 'rgba(0,0,0,.3)'); hi(this.x, this.y, !!this.o.flip, () => FURN[this.kind].draw(this.o, this.t)); }
}
const FURN = {
  bed: { w: 18, h: 10, draw: (o) => { D(-18, -40, 36, 40, '#6a4224'); D(-16, -38, 32, 34, o.sheet || '#e8e0f0'); D(-16, -38, 32, 10, '#f8f4ff'); D(-12, -36, 24, 7, '#fff'); if (!o.empty) { D(-16, -24, 32, 20, o.blanket || '#4a6ab0'); } else { D(-16, -18, 32, 14, o.blanket || '#4a6ab0'); D(-14, -24, 28, 4, shade(o.blanket || '#4a6ab0', 1.3)); } D(-18, -4, 4, 4, '#4a2a14'); D(14, -4, 4, 4, '#4a2a14'); } },
  table: { w: 28, h: 10, draw: (o) => { D(-28, -24, 56, 18, '#8a5a34'); D(-28, -24, 56, 3, '#a8784a'); D(-26, -6, 4, 6, '#5a3418'); D(22, -6, 4, 6, '#5a3418'); if (o.food) { ell(-12, -18, 6, 3, '#f0e8e0'); D(-15, -20, 6, 3, '#d8803a'); ell(10, -18, 5, 3, '#f0e8e0'); } if (o.candle) { D(-2, -34, 4, 10, '#f0e8d8'); D(-1, -38, 2, 4, '#ffcf3a'); } } , light: null },
  stool: { w: 8, h: 4, solid: false, draw: () => { D(-6, -10, 12, 4, '#8a5a34'); D(-5, -6, 2, 6, '#5a3418'); D(3, -6, 2, 6, '#5a3418'); } },
  shelf: { w: 28, h: 8, draw: (o) => { D(-28, -56, 56, 56, '#5a3418'); D(-26, -54, 52, 52, '#3a2010'); for (let j = 0; j < 4; j++) { D(-26, -42 + j * 13, 52, 2, '#6a4224'); for (let i = 0; i < 9; i++) D(-24 + i * 5 + (j % 2), -52 + j * 13, 4, 10, ['#a83a3a', '#3a6ab0', '#c8a040', '#3a8a5a', '#8a5aa8'][(i + j * 3) % 5]); } } },
  counter: { w: 52, h: 10, draw: () => { D(-52, -26, 104, 26, '#7a4a24'); D(-52, -26, 104, 4, '#a8784a'); for (let x = -48; x < 52; x += 16) D(x, -20, 2, 18, '#5a3418'); } },
  fireplace: { w: 30, h: 8, light: { r: 80, c: 'rgba(255,150,60,', flick: true, warm: true }, draw: (o, t) => { const f = Math.floor(t * 8) % 3; D(-30, -60, 60, 60, '#6a6070'); D(-30, -60, 60, 6, '#8a8090'); D(-18, -36, 36, 36, '#1a1014'); D(-12, -18 - f, 24, 14 + f, '#ff7a1a'); D(-8, -26 - f, 16, 10, '#ffb02e'); D(-4, -30 + f, 8, 8, '#ffe9a0'); D(-14, -6, 28, 4, '#4a2a14'); } },
  rug: { w: 40, h: 24, solid: false, ground: true, draw: (o) => { const c = o.color || '#8a3a4a'; D(-40, -40, 80, 44, c); D(-36, -36, 72, 36, shade(c, 1.2)); D(-32, -32, 64, 28, c); for (let i = -28; i < 28; i += 8) D(i, -20, 4, 4, '#e8c860'); } },
  window: { w: 16, h: 4, solid: false, light: { r: 40, c: 'rgba(150,180,255,' }, draw: () => { D(-14, -44, 28, 22, '#5a3418'); D(-12, -42, 24, 18, '#3a5a8a'); D(-12, -42, 24, 18, 'rgba(140,180,255,.4)'); D(-1, -42, 2, 18, '#5a3418'); D(-12, -34, 24, 2, '#5a3418'); D(-8, -40, 4, 2, '#e8f0ff'); } },
  plant: { w: 10, h: 6, draw: () => { D(-8, -14, 16, 14, '#a85a3a'); D(-8, -14, 16, 3, '#c87a5a'); D(-10, -30, 8, 16, '#3a8a5a'); D(-2, -34, 8, 20, '#4aa060'); D(4, -26, 7, 12, '#3a8a5a'); } },
  barrel: { w: 12, h: 6, draw: () => { D(-10, -22, 20, 22, '#7a4a24'); D(-10, -22, 20, 3, '#a06a34'); D(-10, -16, 20, 2, '#3a3d48'); D(-10, -7, 20, 2, '#3a3d48'); } },
  crate: { w: 12, h: 6, draw: () => { D(-11, -20, 22, 20, '#a07a3a'); D(-11, -20, 22, 3, '#c09a5a'); D(-11, -11, 22, 2, '#6a4a1a'); D(-1, -20, 2, 20, '#6a4a1a'); } },
  anvil: { w: 14, h: 6, draw: () => { D(-6, -10, 12, 10, '#3a3d48'); D(-14, -18, 26, 8, '#5a5e6a'); D(-18, -16, 6, 4, '#5a5e6a'); D(-14, -18, 26, 2, '#8a8e9a'); } },
  forge: { w: 30, h: 8, light: { r: 90, c: 'rgba(255,120,40,', flick: true, warm: true }, draw: (o, t) => { const f = Math.floor(t * 9) % 3; D(-30, -40, 60, 40, '#4a4450'); D(-30, -40, 60, 5, '#6a6470'); D(-20, -30, 40, 20, '#1a1014'); D(-16, -22 - f, 32, 12 + f, '#ff5a1a'); D(-10, -26, 20, 8, '#ffb02e'); D(-4, -70, 8, 30, '#4a4450'); } },
  cauldron: { w: 18, h: 8, light: { r: 50, c: 'rgba(120,255,140,', flick: true }, draw: (o, t) => { D(-16, -22, 32, 20, '#2a2a32'); D(-18, -24, 36, 4, '#4a4a52'); D(-14, -22, 28, 4, '#5ac060'); for (let i = 0; i < 3; i++) { const b = (t * 2 + i) % 1; D(-8 + i * 7, -26 - b * 14, 3, 3, '#a8ffb0'); } D(-14, -2, 6, 4, '#ff7a1a'); D(6, -2, 6, 4, '#ff7a1a'); } },
  bench: { w: 26, h: 6, draw: () => { D(-26, -12, 52, 6, '#8a5a34'); D(-26, -12, 52, 2, '#a8784a'); D(-24, -6, 4, 6, '#5a3418'); D(20, -6, 4, 6, '#5a3418'); } },
  lamp: { w: 6, h: 4, light: { r: 60, c: 'rgba(255,210,140,' }, draw: () => { D(-2, -40, 4, 40, '#3a2414'); D(-8, -48, 16, 10, '#c8a040'); D(-6, -46, 12, 6, '#ffe27a'); } },
  nets: { w: 20, h: 4, draw: () => { for (let i = 0; i < 5; i++) D(-20 + i * 9, -50, 1, 40, '#c8b888'); for (let j = 0; j < 5; j++) D(-20, -50 + j * 9, 38, 1, '#c8b888'); D(6, -26, 10, 6, '#e87a3a'); } },
  rockets: { w: 16, h: 6, draw: () => { for (let i = 0; i < 4; i++) { const c = ['#d83a3a', '#3a8ad0', '#e8c040', '#7a3ad0'][i]; D(-14 + i * 8, -30 - (i % 2) * 6, 5, 24, c); D(-13 + i * 8, -36 - (i % 2) * 6, 3, 6, '#f0e8d8'); } D(-16, -6, 32, 6, '#5a3418'); } },
  books: { w: 12, h: 4, solid: false, draw: () => { D(-10, -8, 20, 8, '#a83a3a'); D(-8, -12, 18, 4, '#3a6ab0'); D(-9, -15, 16, 3, '#c8a040'); } },
  wheel: { w: 18, h: 6, draw: () => { ell(0, -18, 14, 14, '#6a4224'); ell(0, -18, 10, 10, '#3a2010'); for (let i = 0; i < 4; i++) D(-1, -30 + i * 0, 2, 24, '#8a5a34'); D(-12, -19, 24, 2, '#8a5a34'); } },
};

// ---------- étal de boutique : l'objet posé au sol, son prix en dessous ----------
class ShopItem {
  constructor(x, y, shop, e) { this.x = x; this.y = y; this.shop = shop; this.e = e; this.w = 18; this.h = 10; this.solid = true; this.t = rand(0, 5); }
  get dead() { const st = Shop.state(this.shop, this.e); return !!st.gone; }
  get light() { return { r: 22, c: 'rgba(255,230,160,' }; }
  canInteract() { return true; }
  interact(G) {
    const it = Inventory.item(this.e.id), st = Shop.state(this.shop, this.e);
    const price = this.e.cost ? Object.entries(this.e.cost).map(([k, n]) => `${n} ${Inventory.item(k).name.toLowerCase()}`).join(', ') : `${this.e.price} écus`;
    const keeper = Shop.def(this.shop).keeper;
    if (!st.ok) { SFX.nope(); G.say([{ text: `${it.name} (${price}). ${it.desc}` }, Object.assign({ text: st.why + '.' }, this.e.needs === 'petards' && !Inventory.has('petards') ? { who: keeper } : {})]); return; }
    if (this.e.needs === 'petards' && !SAVE.petardsPro) { SAVE.petardsPro = true; persist(); G.say([{ who: keeper, text: 'Ok, je vois que t\'es un pro des feux d\'artifice. Je veux bien t\'en vendre.' }], () => this.interact(G)); return; }
    G.ask([{ text: `${it.name} : ${price}. ${it.desc}` }], ['L\'acheter', 'Non merci'], i => {
      if (i !== 0) return;
      const res = Shop.buy(this.shop, this.e);
      if (res.ok) { SFX.buy(); G.raise(this.e.id === 'cailloux10' ? 'cailloux' : this.e.id); G.say([{ text: 'Merci ! ' + it.name + (it.kind === 'drink' ? ', versé dans ta bouteille.' : ', c\'est à toi.') }]); }
      else { SFX.nope(); G.say([{ text: res.why + '.' }]); }
    });
  }
  update(dt) { this.t += dt; }
  draw() {
    const st = Shop.state(this.shop, this.e);
    ell(this.x, this.y, 10, 3, 'rgba(0,0,0,.3)');
    hi(this.x, this.y, false, () => { D(-20, -10, 40, 10, '#5a3418'); D(-20, -10, 40, 2, '#8a5a34'); D(-18, -8, 36, 6, '#a83a4a'); });
    drawItemIcon(this.e.id === 'cailloux10' ? 'cailloux' : this.e.id, this.x, this.y - 12 + Math.sin(this.t * 2), 1);
    const label = this.e.cost ? Object.entries(this.e.cost).map(([, n]) => n).join('') : String(this.e.price);
    const w = textW(label, 7) + (this.e.cost ? 12 : 10);
    R(this.x - w / 2, this.y + 2, w, 9, 'rgba(7,13,31,.8)');
    if (this.e.cost) drawItemIcon(Object.keys(this.e.cost)[0], this.x - w / 2 + 5, this.y + 7, 0.6); else drawItemIcon('money', this.x - w / 2 + 4, this.y + 6.5, 0.55);
    text(label, this.x + (this.e.cost ? 3 : 2), this.y + 3, { size: 7, align: 'center', color: st.ok ? PAL.warm : '#8a90a8', bold: true });
  }
}

// ---------- intérieurs ----------
// chaque maison a un intérieur : { name, w, h, floor?, build(put, A) }
// put(kind, tx, ty, o) pose un meuble ; on peut aussi pousser des entités dans A.ents (PNJ, étals…)
const INTERIORS = {};
function interiorArea(id, house, fromArea) {
  const def = INTERIORS[id], w = def.w || 18, h = def.h || 11;
  const g = makeGrid(w, h, '_'), { rect } = gridTools(g);
  rect(0, 0, w, 2, 'W'); rect(0, 0, 1, h, 'W'); rect(w - 1, 0, 1, h, 'W'); rect(0, h - 1, w, 1, 'W');
  rect(Math.floor(w / 2) - 1, h - 1, 2, 1, 'D');
  const A = new Area('in_' + id, g, 'house');
  A.interior = true; A.name = def.name; A.dark = def.dark != null ? def.dark : 0.22;
  const cx = (Math.floor(w / 2)) * TS;
  A.start = { x: cx, y: (h - 2) * TS + 12, dir: 'up' };
  A.wake = def.wake ? { x: def.wake[0] * TS, y: def.wake[1] * TS, dir: 'down' } : A.start;
  A.exits = { D: G => { G.enter(fromArea, { x: house.x, y: house.y + 12, dir: 'down' }); } };
  A.spawn = function () {
    this.ents = [];
    const put = (kind, tx, ty, o) => { const f = new Furniture(tx * TS, ty * TS, kind, o); this.ents.push(f); return f; };
    const at = (tx, ty) => ({ x: tx * TS, y: ty * TS });
    def.build.call(this, put, at, this);
  };
  return A;
}
// étals d'une boutique alignés sur une rangée
function shopRow(A, shop, tx, ty, gap = 3) {
  const def = Shop.def(shop); let i = 0;
  for (const e of def.items) { if (e.when && !Story.cond(e.when)) continue; A.ents.push(new ShopItem((tx + i * gap) * TS, ty * TS, shop, e)); i++; }
}
