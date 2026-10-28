'use strict';
// ---------- acteurs du monde : villageois, maisons, fontaine, faille, Lumi, cage, branche ----------

// villageois dessiné au pixel (densité ×2, comme les décors)
const LOOKS = {
  sage:       { skin: '#e8c4a0', hair: '#e8e8f0', top: '#4a3a8a', legs: '#2a2050', beard: true, hat: '#3a2a6a', robe: true },
  forgeron:   { skin: '#c98a5e', hair: '#2a1a12', top: '#6a4a3a', legs: '#3a2a20', beard: true, apron: '#3a3a42' },
  epiciere:   { skin: '#f0c8a8', hair: '#c8c8d0', top: '#a83a4a', legs: '#5a2a30', apron: '#f0e8d8', long: true, bun: true },
  aubergiste: { skin: '#e0b48e', hair: '#8a4a2a', top: '#3a6a4a', legs: '#2a3a2a', apron: '#d8c8a8' },
  garde:      { skin: '#d8a880', hair: '#3a2a1a', top: '#7a7e8a', legs: '#3a3d48', helmet: '#9a9eaa' },
  pierrette:  { skin: '#f0c8a8', hair: '#d8a040', top: '#5a8ad0', legs: '#3a4a7a', long: true },
  gaspard:    { skin: '#a8704a', hair: '#1a1a1a', top: '#c08a3a', legs: '#4a3a2a' },
  mahaut:     { skin: '#e8b890', hair: '#6a2a1a', top: '#8a5aa8', legs: '#3a2a4a', long: true },
  forain:     { skin: '#e0b48e', hair: '#2a2a2a', top: '#d84a4a', legs: '#2a2a3a', hat: '#2a2a3a' },
};
function shade(c, k) { const n = parseInt(c.slice(1), 16), f = v => clamp(Math.round(v * k), 0, 255); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); }
function drawPerson(x, y, L, t) {
  const bob = Math.round(Math.sin(t * 2.2) * 0.6 * 2) / 2;
  ell(x, y, 6, 2.5, 'rgba(0,0,0,.35)');
  hi(x, y + bob, false, () => {
    if (L.robe) { D(-11, -30, 22, 30, L.top); D(-11, -30, 22, 3, shade(L.top, 1.25)); D(-11, -3, 22, 3, shade(L.top, 0.7)); }
    else { D(-7, -12, 5, 12, L.legs); D(2, -12, 5, 12, L.legs); D(-8, -2, 6, 2, '#2a1d18'); D(2, -2, 6, 2, '#2a1d18'); D(-10, -32, 20, 21, L.top); D(-10, -32, 20, 3, shade(L.top, 1.25)); D(-10, -14, 20, 2, '#3a2414'); }
    if (L.apron) { D(-7, -26, 14, 18, L.apron); D(-7, -26, 14, 2, shade(L.apron, 1.1)); }
    D(-14, -30, 4, 15, L.top); D(10, -30, 4, 15, L.top); D(-14, -16, 4, 3, L.skin); D(10, -16, 4, 3, L.skin);
    D(-8, -48, 16, 16, L.skin); D(-8, -48, 16, 2, shade(L.skin, 1.08));
    D(-9, -50, 18, 6, L.hair); D(-9, -46, 3, 6, L.hair); D(6, -46, 3, 6, L.hair);
    if (L.long) { D(-10, -46, 3, 16, L.hair); D(7, -46, 3, 16, L.hair); }
    if (L.bun) D(-4, -55, 8, 6, L.hair);
    D(-4, -42, 2, 3, '#1a1a22'); D(2, -42, 2, 3, '#1a1a22'); D(-5, -38, 2, 1, shade(L.skin, 0.85)); D(3, -38, 2, 1, shade(L.skin, 0.85));
    if (L.beard) { D(-7, -38, 14, 8, L.hair); D(-5, -30, 10, 3, L.hair); D(-2, -37, 4, 1, '#3a2014'); }
    else D(-2, -36, 4, 1, '#8a3a2a');
    if (L.hat) { D(-11, -52, 22, 4, L.hat); D(-7, -60, 14, 9, L.hat); if (L.robe) D(-3, -66, 6, 7, L.hat); }
    if (L.helmet) { D(-10, -54, 20, 9, L.helmet); D(-10, -54, 20, 2, '#c8ccd8'); D(-1, -46, 2, 6, L.helmet); }
  });
}

// personnage dessiné depuis un sprite d'Escape Night (densité ×2)
function drawSprite(key, x, y) { const im = IMG['npc_' + key]; if (im) ctx.drawImage(im, half(x - im.width / 4), half(y - im.height / 2), im.width / 2, im.height / 2); }

class NPC {
  // o : { look, talk (id dans dialogues.json) | shop (id dans shops.json), when (condition d'apparition), hero (fonction → id d'un enfant) }
  constructor(x, y, o) { this.x = x; this.y = y; this.o = o; this.w = 12; this.h = 6; this.solid = true; this.t = rand(0, 5); this.isNPC = true; }
  get dead() { return this.o.when ? !Story.cond(this.o.when) : false; }
  canInteract() { return true; }
  interact(G) {
    if (this.o.shop) { const sh = Shop.def(this.o.shop); G.say([{ who: sh.keeper, text: sh.hello }], () => G.openShop(this.o.shop)); }
    else G.say(Story.talk(this.o.talk));
  }
  update(dt) { this.t += dt; }
  draw() {
    if (this.o.hero) { ell(this.x, this.y, 6, 2.5, 'rgba(0,0,0,.35)'); drawHero(this.o.hero(), this.x, this.y, 'down', false, this.t); }
    else if (this.o.sprite === 'papa_down') { ell(this.x, this.y, 8, 3, 'rgba(0,0,0,.35)'); drawPapa(this.x, this.y, 'down', false, this.t); }
    else if (this.o.sprite) { ell(this.x, this.y, 7, 2.5, 'rgba(0,0,0,.35)'); drawSprite(this.o.sprite, this.x, this.y); }
    else drawPerson(this.x, this.y, LOOKS[this.o.look], this.t);
    if (G.player && dist(G.player.x, G.player.y, this.x, this.y) < 34 && G.state === 'play') { // bulle « parler »
      const b = Math.round(Math.sin(this.t * 5)); R(this.x - 4, this.y - 42 + b, 8, 7, '#f4f7ff'); R(this.x - 2, this.y - 35 + b, 2, 2, '#f4f7ff'); R(this.x - 3, this.y - 40 + b, 1, 1, '#14244c'); R(this.x, this.y - 40 + b, 1, 1, '#14244c'); R(this.x + 2, this.y - 40 + b, 1, 1, '#14244c');
    }
  }
}

// maison vue de face en 3/4 : toit, façade, porte, fenêtres éclairées, enseigne
const SIGNS = {
  forge: (x, y) => { D(x - 7, y - 3, 14, 4, '#3a3d48'); D(x - 4, y + 1, 8, 4, '#3a3d48'); D(x - 9, y - 3, 3, 2, '#3a3d48'); },
  kitchen: (x, y) => { D(x - 7, y - 2, 14, 7, '#3a3d48'); D(x - 8, y - 4, 16, 3, '#5a5e6a'); D(x - 3, y - 8, 2, 4, '#c8c8d0'); D(x + 1, y - 9, 2, 5, '#c8c8d0'); },
  shop: (x, y) => { D(x - 3, y - 6, 6, 3, '#f0e8d8'); D(x - 5, y - 3, 10, 9, '#c83a4a'); D(x - 3, y - 1, 3, 3, '#ff8a9a'); },
  inn: (x, y) => { D(x - 7, y - 1, 14, 5, '#8a5a34'); D(x - 7, y - 4, 4, 4, '#f0e8d8'); D(x - 8, y + 4, 2, 3, '#5a3418'); D(x + 6, y + 4, 2, 3, '#5a3418'); },
  library: (x, y) => { D(x - 7, y - 5, 14, 10, '#3a6ab0'); D(x - 1, y - 5, 2, 10, '#f0e8d8'); D(x - 6, y - 4, 4, 1, '#f0e8d8'); D(x + 2, y - 4, 4, 1, '#f0e8d8'); },
};
class House {
  constructor(x, y, o) {
    this.x = x; this.y = y; this.o = o; this.w = o.w * TS; this.h = o.d * TS; this.solid = true; this.t = rand(0, 5);
    const hw = this.w / 2 - 14;
    this.lights = [{ dx: -hw, dy: -12, r: 34, c: 'rgba(255,200,120,' }, { dx: hw, dy: -12, r: 34, c: 'rgba(255,200,120,' }];
  }
  update(dt) { this.t += dt; }
  draw() {
    const o = this.o, W2 = this.w * 2, D2 = this.h * 2, fh = 44, wall = o.wall || '#cbb898', timber = '#5a3a22', roof = o.roof || '#8a3a3a';
    ell(this.x, this.y + 2, this.w / 2 + 4, 5, 'rgba(0,0,0,.4)');
    hi(this.x, this.y, false, () => {
      const L = -W2 / 2;
      // toit (vu de dessus, en pente vers l'avant)
      const ry = -D2 - 26, rh = D2 + 26 - fh + 6;
      D(L - 6, ry, W2 + 12, rh, roof);
      for (let yy = ry + 6; yy < ry + rh; yy += 8) D(L - 6, yy, W2 + 12, 2, shade(roof, 0.75));
      for (let yy = ry + 2; yy < ry + rh; yy += 16) for (let xx = L - 6 + ((yy / 8) & 1) * 8; xx < L + W2 + 6; xx += 16) D(xx, yy, 2, 6, shade(roof, 0.8));
      D(L - 6, ry, W2 + 12, 4, shade(roof, 1.3)); D(L - 6, ry + rh - 4, W2 + 12, 4, shade(roof, 0.55));
      if (o.chimney) { D(L + W2 - 40, ry - 18, 16, 26, '#6a6070'); D(L + W2 - 42, ry - 22, 20, 6, '#4a4450'); }
      // façade
      D(L, -fh, W2, fh, wall); D(L, -fh, W2, 3, shade(wall, 1.12));
      D(L, -fh, 6, fh, timber); D(L + W2 - 6, -fh, 6, fh, timber); D(L, -fh + 2, W2, 4, timber);
      // porte
      D(-12, -34, 24, 34, '#3a2414'); D(-10, -32, 20, 32, '#6a4224'); D(-1, -32, 2, 32, '#4a2a14'); D(5, -18, 3, 3, '#c8a040');
      D(-14, -38, 28, 5, timber);
      // fenêtres éclairées
      const g = 0.85 + 0.15 * Math.sin(this.t * 2);
      for (const sx of [-1, 1]) {
        const wx = sx * (W2 / 2 - 28) - 9;
        D(wx - 2, -34, 22, 20, timber); D(wx, -32, 18, 16, `rgba(255,207,122,${g})`); D(wx + 8, -32, 2, 16, timber); D(wx, -25, 18, 2, timber);
      }
      // enseigne
      if (o.sign && SIGNS[o.sign]) { D(18, -50, 2, 8, '#3a2414'); D(18, -50, 26, 2, '#3a2414'); D(22, -46, 24, 18, '#d8c8a8'); D(22, -46, 24, 2, '#f0e8d8'); SIGNS[o.sign](34, -37); }
    });
  }
}

// fontaine-horloge : l'heure avance d'une heure par fragment d'aube
class Fountain {
  constructor(x, y) { this.x = x; this.y = y; this.w = 48; this.h = 18; this.solid = true; this.t = 0; this.light = { r: 50, c: 'rgba(140,200,255,' }; }
  canInteract() { return true; }
  interact(G) {
    const n = SAVE.fragments || 0; persist(); SFX.pickup();
    G.say([{ text: n ? `L'horloge de la fontaine indique ${n} h du matin. L'aube approche. Partie sauvegardée.` : 'L\'horloge de la fontaine est arrêtée sur minuit. Partie sauvegardée.' }]);
  }
  update(dt, G) { this.t += dt; if (Math.random() < dt * 5) G.parts.add({ x: this.x + rand(-14, 14), y: this.y - 8, vy: -16, life: 0.6, c: '#bfe8ff', r: 1, g: 40 }); }
  draw() {
    ell(this.x, this.y, 28, 8, 'rgba(0,0,0,.35)');
    hi(this.x, this.y, false, () => {
      D(-52, -28, 104, 28, '#6a6478'); D(-48, -32, 96, 6, '#8a8498'); D(-52, -4, 104, 4, '#4a4458');
      D(-44, -28, 88, 16, '#2a5ab0'); for (let i = 0; i < 5; i++) { const xx = -40 + ((i * 19 + Math.floor(this.t * 8)) % 80); D(xx, -24 + (i % 3) * 4, 6, 1, '#8ab8ff'); }
      D(-8, -74, 16, 48, '#8a8498'); D(-8, -74, 4, 48, '#a8a2b8'); D(-14, -80, 28, 8, '#6a6478');
      // cadran
      D(-14, -112, 28, 32, '#8a8498'); D(-11, -109, 22, 26, '#f0e8d8');
      const n = SAVE.fragments || 0, a = n / 12 * Math.PI * 2 - Math.PI / 2, cx = 0, cy = -96;
      for (let i = 0; i < 12; i++) { const b = i / 12 * Math.PI * 2; D(Math.round(cx + Math.cos(b) * 9) - 1, Math.round(cy + Math.sin(b) * 9) - 1, 2, 2, '#5a5468'); }
      ctx.strokeStyle = '#2a2438'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 9); ctx.stroke();
      D(-2, -98, 4, 4, '#c8a040');
    });
  }
}

// la faille temporelle
class Rift {
  constructor(x, y, o) { this.x = x; this.y = y; this.o = o; this.w = 30; this.h = 10; this.t = 0; }
  get active() { return this.o.active(); }
  get light() { return { r: this.active ? 90 : 40, c: 'rgba(190,120,255,' }; }
  canInteract() { return !this.active && !!this.o.closed; }
  interact(G) { G.say([{ text: this.o.closed }]); }
  update(dt, G) {
    this.t += dt; const P = G.player, d = dist(P.x, P.y, this.x, this.y);
    if (this.active && Math.random() < dt * 14) { const a = rand(0, 6.28), r = rand(20, 34); G.parts.add({ x: this.x + Math.cos(a) * r, y: this.y - 18 + Math.sin(a) * r * 0.6, vx: -Math.cos(a) * 30, vy: -Math.sin(a) * 18, life: 0.7, c: pick(['#c3b3ff', '#8a5aff', '#fff']), r: 1 }); }
    if (this.o.near && d < 90) this.o.near(G);
    if (this.active && d < 14 && G.state === 'play') this.o.enter(G);
  }
  draw() {
    const k = this.active ? 1 : 0.35;
    ell(this.x, this.y, 18 * k + 4, 4, 'rgba(60,20,120,.35)');
    for (let i = 0; i < 5; i++) {
      const r = (22 - i * 4) * k, a = this.t * (1.5 + i * 0.4) * (i % 2 ? -1 : 1);
      ctx.save(); ctx.translate(this.x, this.y - 18); ctx.rotate(a); ctx.globalAlpha = 0.25 + i * 0.12;
      ell(0, 0, r + 2, r * 1.25, ['#2a0a5a', '#4a1a8a', '#7a3acf', '#b07aff', '#f0e0ff'].at(i));
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (this.o.lumi && !SAVE.met_lumi) drawLumi(this.x + 22, this.y - 42 + Math.sin(this.t * 3) * 2, this.t);
  }
}

// Lumi : la luciole qui accompagne le héros (lumière + indices)
const Lumi = {
  x: 0, y: 0, t: 0,
  reset(P) { this.x = P.x + 12; this.y = P.y - 26; },
  update(dt, P) {
    this.t += dt;
    const tx = P.x - DV[P.dir][0] * 14 + 10, ty = P.y - 26 - DV[P.dir][1] * 6;
    this.x = lerp(this.x, tx, Math.min(1, dt * 3)); this.y = lerp(this.y, ty, Math.min(1, dt * 3));
  },
  get light() { return { x: this.x, y: this.y, r: 46, c: 'rgba(255,230,140,' }; },
  draw() { drawLumi(this.x, this.y + Math.sin(this.t * 3) * 2, this.t); },
};
function drawLumi(x, y, t) {
  ctx.globalAlpha = 0.35; ell(x, y, 6, 6, '#ffe27a'); ctx.globalAlpha = 0.7;
  const w = Math.abs(Math.sin(t * 18)) * 3 + 1; ell(x - 3, y - 2, w, 2, '#f4f7ff'); ell(x + 3, y - 2, w, 2, '#f4f7ff');
  ctx.globalAlpha = 1; ell(x, y, 2.2, 2.2, '#fff6c0'); R(half(x - 0.5), half(y - 0.5), 1, 1, '#ffffff');
}

// la branche du prologue
class BranchPickup {
  constructor(x, y) { this.x = x; this.y = y; this.w = 16; this.h = 6; this.t = 0; }
  get dead() { return !!SAVE.got_branche; }
  get light() { return { r: 22, c: 'rgba(255,230,140,' }; }
  canInteract() { return true; }
  interact(G) { this.take(G); }
  take(G) {
    if (SAVE.got_branche) return;
    Story.set('got_branche'); Inventory.give('branche'); SFX.chest(); G.raise('branche');
    G.say(Story.script('got_branche'));
  }
  update(dt, G) { this.t += dt; if (rectHit(boxOf(this), G.player.body())) this.take(G); }
  draw() {
    ell(this.x, this.y, 9, 2, 'rgba(0,0,0,.3)');
    hi(this.x, this.y - 2, false, () => { D(-14, -2, 28, 4, '#6a4224'); D(-14, -2, 28, 1, '#8a5a34'); D(6, -6, 4, 4, '#6a4224'); D(10, -9, 5, 4, '#4f9a5a'); D(-16, -1, 4, 3, '#5a3418'); });
    if (Math.floor(this.t * 2) % 2) R(this.x + 6, this.y - 8, 1.5, 1.5, '#fff');
  }
}

// la cage d'un captif (salle du boss) — o : { n (numéro du donjon), boss (drapeau du boss), drawCaptive(x, y, t) }
class Cage {
  constructor(x, y, o) { this.x = x; this.y = y; this.o = o; this.w = 30; this.h = 10; this.solid = true; this.t = 0; }
  get open() { return !!SAVE['freed' + this.o.n]; }
  get light() { return this.open ? null : { r: 30, c: 'rgba(255,230,140,' }; }
  canInteract() { return !this.open; }
  interact(G) { if (!SAVE[this.o.boss]) G.say(Story.script('captive_cage' + (this.o.n > 1 ? this.o.n : ''))); else G.freeCaptive(this.o.n); }
  update(dt) { this.t += dt; }
  draw() {
    ell(this.x, this.y, 18, 4, 'rgba(0,0,0,.45)');
    if (!this.open) this.o.drawCaptive(this.x, this.y - 3, this.t);
    hi(this.x, this.y, false, () => {
      D(-34, -6, 68, 6, '#3a3d48'); D(-34, -6, 68, 2, '#6a6e7a');
      if (!this.open) { for (let i = 0; i < 7; i++) D(-32 + i * 10, -76, 4, 72, '#5a5e6a'); D(-34, -80, 68, 6, '#3a3d48'); D(-34, -80, 68, 2, '#6a6e7a'); D(-6, -42, 12, 10, '#c8a040'); D(-2, -38, 4, 4, '#3a2410'); }
      else { for (let i = 0; i < 7; i++) D(-32 + i * 10, -14 - (i % 3) * 3, 4, 10, '#5a5e6a'); }
    });
  }
}

// la porte de la palissade : fermée tant que le sage n'a pas parlé
class GateBlock {
  constructor(x, y, w) { this.x = x; this.y = y; this.w = w; this.h = 14; this.t = 0; }
  get solid() { return !SAVE.quest1; }
  get dead() { return !!SAVE.quest1; }
  canInteract() { return true; }
  interact(G) { G.say(Story.talk('garde')); }
  draw() {
    hi(this.x, this.y, false, () => { const W2 = this.w * 2; D(-W2 / 2, -40, W2, 6, '#6a4224'); D(-W2 / 2, -20, W2, 6, '#6a4224'); for (let x = -W2 / 2; x < W2 / 2; x += 14) { D(x, -46, 8, 46, '#8a5a34'); D(x, -46, 2, 46, '#a06a3a'); } });
  }
}

// petits décors pleins
class Prop {
  constructor(x, y, kind) { this.x = x; this.y = y; this.kind = kind; this.w = kind === 'anvil' ? 14 : 12; this.h = 6; this.solid = true; }
  draw() {
    ell(this.x, this.y, 7, 2, 'rgba(0,0,0,.35)');
    hi(this.x, this.y, false, () => {
      if (this.kind === 'anvil') { D(-6, -10, 12, 10, '#3a3d48'); D(-14, -18, 26, 8, '#5a5e6a'); D(-18, -16, 6, 4, '#5a5e6a'); D(-14, -18, 26, 2, '#8a8e9a'); }
      if (this.kind === 'barrel') { D(-10, -22, 20, 22, '#7a4a24'); D(-10, -22, 20, 3, '#a06a34'); D(-10, -16, 20, 2, '#3a3d48'); D(-10, -7, 20, 2, '#3a3d48'); D(-8, -20, 3, 18, '#8a5a34'); }
      if (this.kind === 'crate') { D(-11, -20, 22, 20, '#a07a3a'); D(-11, -20, 22, 3, '#c09a5a'); D(-11, -11, 22, 2, '#6a4a1a'); D(-1, -20, 2, 20, '#6a4a1a'); }
      if (this.kind === 'stall') { D(-24, -26, 48, 26, '#8a5a34'); D(-26, -30, 52, 6, '#6a4224'); for (let i = 0; i < 6; i++) D(-28 + i * 10, -46, 10, 16, i % 2 ? '#f0e8d8' : '#d84a4a'); D(-28, -48, 56, 3, '#a83a3a'); }
    });
  }
}
