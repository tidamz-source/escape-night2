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
  berger:     { skin: '#d8a880', hair: '#8a8a8a', top: '#7a6a3a', legs: '#4a3a2a', beard: true, hat: '#5a4a2a' },
  bucheron:   { skin: '#c98a5e', hair: '#8a3a1a', top: '#a83a3a', legs: '#3a3a5a', beard: true },
  herboriste: { skin: '#f0c8a8', hair: '#3a2a1a', top: '#3a7a4a', legs: '#2a4a2a', long: true, apron: '#c8b888' },
  pecheur:    { skin: '#c8906a', hair: '#e8e8f0', top: '#3a5a8a', legs: '#2a3a4a', beard: true, hat: '#c8a040' },
  artificiere:{ skin: '#e8b890', hair: '#2a2a2a', top: '#c83a3a', legs: '#3a2a2a', long: true, apron: '#3a3a42' },
  gardien:    { skin: '#d8a880', hair: '#5a5a5a', top: '#2a3a6a', legs: '#2a2a3a', beard: true, hat: '#2a2a3a' },
  ermite:     { skin: '#c8a8a0', hair: '#c8c8d0', top: '#4a3a5a', legs: '#2a2030', robe: true, beard: true },
  arthur:     { skin: '#f0c8a0', hair: '#c8742a', top: '#3a8ac8', legs: '#3a3a5a', child: true },
  firmin:     { skin: '#c8906a', hair: '#5a4a3a', top: '#6a4a2a', legs: '#2a3a4a', hat: '#c8b888' },
  gaelle:     { skin: '#9a6a4a', hair: '#1a1a1a', top: '#3a8a4a', legs: '#4a3a2a' },
  forain:     { skin: '#e0b48e', hair: '#2a2a2a', top: '#d84a4a', legs: '#2a2a3a', hat: '#2a2a3a' },
};
function shade(c, k) { const n = parseInt(c.slice(1), 16), f = v => clamp(Math.round(v * k), 0, 255); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); }
function drawPerson(x, y, L, t) {
  const bob = Math.round(Math.sin(t * (L.child ? 3 : 2.2)) * 0.6 * 2) / 2;
  if (!L.shadowless) ell(x, y, 6, 2.5, 'rgba(0,0,0,.35)');
  if (L.child) { ctx.save(); ctx.translate(x, y); ctx.scale(0.74, 0.74); ctx.translate(-x, -y); drawPerson(x, y, Object.assign({}, L, { child: false, shadowless: true }), t * 1.3); ctx.restore(); return; }
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

// PNJ PixelLab : 48 × 48, 8 directions, même échelle que les héros (÷ 1,4) ; les enfants un peu plus petits
const PL_NPCS = { garde: { foot: 1 }, arthur: { foot: 0, child: 0.84 }, jules: { foot: 1, child: 0.84 }, lila: { foot: 3, child: 0.84 }, fantome: { foot: 2 }, epiciere: { foot: 2 }, sage: { foot: 10, anim: 8, c: 64 }, pierrette: { foot: 1 }, fossoyeur: { foot: 1 }, coquillages: { foot: 1 }, hugo: { foot: 2 }, herboriste: { foot: 3 }, bucheron: { foot: 1 }, gnome: { foot: 2, child: 0.6 }, firmin: { foot: 1 }, gaelle: { foot: 1 }, artificiere: { foot: 1 }, gardien: { foot: 2 }, ermite: { foot: 1 }, vagabond: { foot: 0 }, pauline: { foot: 1, child: 0.78 }, odette: { foot: 2 }, lavandiere: { foot: 1 }, crieur: { foot: 11, anim: 9, c: 68 }, forgeron: { foot: 1, c: 56, child: 0.9 }, bastien: { foot: 1, child: 0.84 }, pervenche: { foot: 1 }, margot: { foot: 1 }, pecheur: { foot: 2 }, berger: { foot: 1 }, mahaut: { foot: 1 }, gaspard: { foot: 3 }, amandine: { foot: 2 }, claudine: { foot: 2 }, papa: { foot: 2 }, aubergiste: { foot: 2, anim: 2, fps: 0.4 }, lampions: { foot: 2 } };
const plDir = (dx, dy) => (Math.round(Math.atan2(dx, dy) / (Math.PI / 4)) + 8) % 8; // 0 face, 2 droite, 4 dos, 6 gauche
function drawPL(key, x, y, di, t, alpha = 1, scale = 1) {
  const im = IMG['pl_' + key], m = PL_NPCS[key]; if (!im || !m) return false;
  const c = m.c || 48, k = scale * (m.child || 1) / 1.4, s = c * k; let sx = di * c, sy = 0;
  if (m.anim && di === 0) { sx = (Math.floor(t * (m.fps || 6)) % m.anim) * c; sy = c; }
  ctx.globalAlpha = alpha; ctx.drawImage(im, sx, sy, c, c, half(x - s / 2), half(y - s + m.foot * k), s, s); ctx.globalAlpha = 1; return true;
}
// une case d'une planche (boss, monstres) posée par les pieds en (x, y) ; k : échelle (0,5 = 1 pixel d'image par pixel d'écran)
// o : { flip, rot, alpha, foot (marge sous les pieds, en px d'image), flash (silhouette blanche quand il est touché) }
const WHITE = {};
function whiteOf(key) { if (WHITE[key]) return WHITE[key]; const im = IMG[key], c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); return (WHITE[key] = c); }
// marge transparente sous chaque case (calculée une fois) : pour poser les pieds pile sur l'ombre
const FOOT = {};
function cellFoot(key, col, row, cw, ch) {
  const id = key + ':' + col + ':' + row; if (FOOT[id] != null) return FOOT[id];
  const im = IMG[key], c = document.createElement('canvas'); c.width = cw; c.height = ch; const x = c.getContext('2d'); x.drawImage(im, col * cw, row * ch, cw, ch, 0, 0, cw, ch);
  let d; try { d = x.getImageData(0, 0, cw, ch).data; } catch (_) { return (FOOT[id] = 0); }
  for (let yy = ch - 1; yy >= 0; yy--) for (let xx = 0; xx < cw; xx++) if (d[(yy * cw + xx) * 4 + 3] > 40) return (FOOT[id] = ch - 1 - yy);
  return (FOOT[id] = 0);
}
function drawCell(key, col, row, cw, ch, x, y, k, o = {}) {
  const im = IMG[key]; if (!im) return false; const foot = o.foot === 'auto' ? cellFoot(key, col, row, cw, ch) : (o.foot || 0), w = cw * k, h = ch * k, dy = -h + foot * k;
  ctx.save(); ctx.translate(half(x), half(y)); if (o.flip) ctx.scale(-1, 1); if (o.rot) ctx.rotate(o.rot);
  ctx.globalAlpha = o.alpha != null ? o.alpha : 1; ctx.drawImage(im, col * cw, row * ch, cw, ch, -w / 2, dy, w, h);
  if (o.flash) { ctx.globalAlpha = 0.85; ctx.drawImage(whiteOf(key), col * cw, row * ch, cw, ch, -w / 2, dy, w, h); }
  ctx.restore(); return true;
}
// monstres PixelLab (assets/mobs/<clé>.png) : ligne 0 = 8 directions au repos, lignes 1-8 = animation par direction, ligne 9 = pose spéciale
const MOB_K = 0.75; // les monstres ordinaires à 75 % (les mini-boss gardent leur taille) ; k : taille propre à un monstre (ombre, squelette : 100 %)
const MOB_SPR = { raccoon: { c: 64, n: 8, foot: 11 }, bat: { c: 68, n: 9, foot: 16 }, shadow: { k: 1, c: 48, n: 0, foot: 5 }, wisp: { c: 52, n: 9, foot: 8 }, squirrel: { c: 64, n: 8, foot: 12 }, crow: { c: 64, n: 9, foot: 13 }, gnome: { c: 60, n: 8, foot: 9, pose: 1 }, spider: { c: 64, n: 8, foot: 11 }, crab: { c: 60, n: 8, foot: 12 }, eel: { c: 48, n: 0, foot: 4, pose: 1 }, skeleton: { k: 1, c: 68, n: 8, foot: 11, pose: 1 }, gargoyle: { c: 60, n: 9, foot: 11 }, dog: { c: 60, n: 8, foot: 11 }, sheep: { c: 64, n: 6, foot: 12 }, ram: { k: 0.9, c: 60, n: 8, foot: 10 }, chicken: { k: 0.6, c: 52, n: 8, foot: 7 } };
// o : { dir (sinon : sens du déplacement, ou vers le héros), anim (animer même immobile), pose, fps, alt (hauteur de vol), scale, alpha, sh (ombre) }
function drawMob(e, key, o = {}) {
  const m = MOB_SPR[key]; if (!m || !IMG['mob_' + key]) return false;
  const dx = e.x - (e._px != null ? e._px : e.x), dy = e.y - (e._py != null ? e._py : e.y); e._px = e.x; e._py = e.y;
  const mv = Math.hypot(dx, dy) > 0.12;
  if (o.dir != null) e._di = o.dir; else if (mv) e._di = plDir(dx, dy); else if (e._di == null || !(e._diT > 0)) { const P = G.player; e._di = plDir(P.x - e.x, P.y - e.y); }
  if (mv) e._diT = 0.4; else if (e._diT > 0) e._diT -= 1 / 60;
  let col = e._di, row = 0;
  if (o.pose && m.pose) row = 9; else if (m.n && (mv || o.anim)) { row = 1 + e._di; col = Math.floor((e.t || 0) * (o.fps || 10)) % m.n; }
  if (o.sh !== 0) ell(e.x, e.y, o.sh || 6, 2, 'rgba(0,0,0,.3)');
  drawCell('mob_' + key, col, row, m.c, m.c, e.x, e.y - (o.alt || 0), (o.scale || 1) * (e.isMini ? 1 : m.k || MOB_K) / 1.4, { foot: o.alt ? m.foot : 'auto', flash: e.flash > 0, alpha: o.alpha }); // au sol : les pieds pile sur l'ombre
  if (e.stunT > 0) for (let i = 0; i < 3; i++) { const a = (e.t || 0) * 5 + i * 2.1; R(half(e.x + Math.cos(a) * 7), half(e.y - (o.alt || 0) - (e.isMini ? 34 : 26) + Math.sin(a) * 2), 2, 2, i % 2 ? '#ffe27a' : '#fff'); }
  return true;
}
// les PNJ regardent toujours vers le sud (face à l'écran)
function plFace(e) { return e.o && e.o.face != null ? e.o.face : 0; }

// personnage dessiné depuis un sprite d'Escape Night (densité ×2)
function drawSprite(key, x, y) { if (IMG['pl_' + key] && PL_NPCS[key]) { drawPL(key, x, y, 0, G.t || 0); return; } const im = IMG['npc_' + key]; if (im) ctx.drawImage(im, half(x - im.width / 4), half(y - im.height / 2), im.width / 2, im.height / 2); }

class NPC {
  // o : { look, talk (id dans dialogues.json) | shop (id dans shops.json), when (condition d'apparition), hero (fonction → id d'un enfant) }
  constructor(x, y, o) { this.x = x; this.y = y; this.o = o; this.w = 12; this.h = 6; this.solid = true; this.t = rand(0, 5); this.isNPC = true; }
  get dead() { return this.o.when ? !Story.cond(this.o.when) : false; }
  canInteract() { return true; }
  interact(G) {
    if (Troc.talk(this, G)) return; // chaîne d'échanges
    if (sideTalk(this, G)) return; // quêtes secondaires
    if (this.o.quest) return Quests.talk(this.o.quest, G);
    if (this.o.fn) return this.o.fn(G);
    if (this.o.shop) { const sh = Shop.def(this.o.shop); G.say([{ who: sh.keeper, text: sh.hello }], () => G.openShop(this.o.shop)); }
    else G.say(Story.talk(this.o.talk));
  }
  update(dt) { this.t += dt; }
  draw() {
    if (this.o.hero) { ell(this.x, this.y, 6, 2.5, 'rgba(0,0,0,.35)'); drawHero(this.o.hero(), this.x, this.y, 'down', false, this.t); }
    else if (this.o.gnome) { if (IMG.pl_gnome) { ell(this.x, this.y, 5, 2, 'rgba(0,0,0,.35)'); drawPL('gnome', this.x, this.y, plFace(this), this.t); } else drawGnomeNPC(this.x, this.y, this.t); }
    else if (this.o.sprite === 'dog' && IMG.mob_dog) drawMob(this, 'dog', { sh: 6 }); // Goyave
    else if (this.o.sprite === 'dog') { const im = IMG.npc_dog_down; ell(this.x, this.y, 7, 2.5, 'rgba(0,0,0,.35)'); if (im) { const w = im.width / 2.6, h = im.height / 2.6; ctx.drawImage(im, half(this.x - w / 2), half(this.y - h + Math.abs(Math.sin(this.t * 3))), w, h); } }
    else if (this.o.sprite === 'papa_down') { ell(this.x, this.y, 8, 3, 'rgba(0,0,0,.35)'); drawPapa(this.x, this.y, 'down', false, this.t); }
    else if (this.o.sprite) { ell(this.x, this.y, 7, 2.5, 'rgba(0,0,0,.35)'); drawSprite(this.o.sprite, this.x, this.y); }
    else if (this.o.draw) this.o.draw(this);
    else if (IMG['pl_' + this.o.look] && PL_NPCS[this.o.look]) { ell(this.x, this.y, 7, 2.5, 'rgba(0,0,0,.35)'); drawPL(this.o.look, this.x, this.y, plFace(this), this.t); }
    else drawPerson(this.x, this.y, LOOKS[this.o.look], this.t);
    if (G.state === 'play' && sideOffer(this)) { const b = Math.round(Math.sin(this.t * 5)); R(this.x - 3, this.y - 46 + b, 6, 9, '#ffd23a'); text('!', this.x, this.y - 46 + b, { size: 8, align: 'center', bold: true, color: '#3a2410', shadow: false }); return; } // une quête à proposer
    if (G.player && dist(G.player.x, G.player.y, this.x, this.y) < 34 && G.state === 'play') { // bulle « parler »
      const b = Math.round(Math.sin(this.t * 5)); R(this.x - 4, this.y - 42 + b, 8, 7, '#f4f7ff'); R(this.x - 2, this.y - 35 + b, 2, 2, '#f4f7ff'); R(this.x - 3, this.y - 40 + b, 1, 1, '#14244c'); R(this.x, this.y - 40 + b, 1, 1, '#14244c'); R(this.x + 2, this.y - 40 + b, 1, 1, '#14244c');
    }
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
  get light() { const p = typeof Flies !== 'undefined' ? Flies.pow() : 0; return { x: this.x, y: this.y, r: (p >= 1 ? 80 : 46) + p * 4, c: 'rgba(255,230,140,' }; },
  draw() { drawLumi(this.x, this.y + Math.sin(this.t * 3) * 2, this.t, 1 + (typeof Flies !== 'undefined' ? Flies.pow() : 0) * 0.12); },
};
function drawLumi(x, y, t, s = 1) { // s : Lumi grandit avec ses pouvoirs
  ctx.globalAlpha = 0.35; ell(x, y, 6 * s, 6 * s, '#ffe27a'); ctx.globalAlpha = 0.7;
  const w = (Math.abs(Math.sin(t * 18)) * 3 + 1) * s; ell(x - 3 * s, y - 2 * s, w, 2 * s, '#f4f7ff'); ell(x + 3 * s, y - 2 * s, w, 2 * s, '#f4f7ff');
  ctx.globalAlpha = 1; ell(x, y, 2.2 * s, 2.2 * s, '#fff6c0'); R(half(x - 0.5), half(y - 0.5), 1, 1, '#ffffff');
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

// petit gnome (PNJ) : barbe, casque à lampe
function drawGnomeNPC(x, y, t) {
  ell(x, y, 6, 2, 'rgba(0,0,0,.35)');
  hi(x, y + Math.round(Math.sin(t * 2.2)), false, () => {
    D(-6, -6, 4, 6, '#3a2a20'); D(2, -6, 4, 6, '#3a2a20'); D(-9, -22, 18, 16, '#4a6a9a'); D(-9, -10, 18, 2, '#3a2414');
    D(-8, -30, 16, 9, '#e8b890'); D(-10, -24, 20, 10, '#e8e8f0'); D(-4, -14, 8, 4, '#e8e8f0');
    D(-5, -28, 2, 2, '#1a1a22'); D(3, -28, 2, 2, '#1a1a22'); D(-2, -26, 4, 3, '#d88a7a');
    D(-10, -38, 20, 9, '#c8a040'); D(-11, -31, 22, 3, '#a07a20'); D(-3, -40, 6, 5, '#fff6c0');
  });
}
