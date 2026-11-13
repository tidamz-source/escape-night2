'use strict';
// ---------- le monde élargi : chemins entre les régions, sanctuaire des lucioles, lucioles perdues, pouvoirs de Lumi,
//            grottes secrètes, îlots, quarts de cœur, habitants ----------
//
//   [SANCTUAIRE] ─ [COLLINES] ─ [COL] ─ [MONTAGNE]
//                       │
//                 [ROUTE DES BERGERS]
//                       │
//   [FORÊT] ─ [ORÉE] ─ [BOURG-LUCIOLE]
//                       │
//                 [PRÉS DU LAC]
//                       │
//   [TERRES] ─ [LANDE] ─ [LAC] ─ [DUNES] ─ [CÔTE]

// ===== deux palettes fondues l'une dans l'autre : la transition graphique entre deux régions =====
function blendLayer(g, ta, tb, axis) {
  const a = renderLayer(g, ta), b = renderLayer(g, tb), c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
  const x = c.getContext('2d'); x.drawImage(a, 0, 0);
  const m = document.createElement('canvas'); m.width = a.width; m.height = a.height; const mx = m.getContext('2d');
  mx.drawImage(b, 0, 0); mx.globalCompositeOperation = 'destination-in';
  const gr = axis === 'x' ? mx.createLinearGradient(0, 0, m.width, 0) : mx.createLinearGradient(0, 0, 0, m.height);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.3, 'rgba(0,0,0,0)'); gr.addColorStop(0.7, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
  mx.fillStyle = gr; mx.fillRect(0, 0, m.width, m.height); x.drawImage(m, 0, 0);
  return c;
}

// ===== habitants : quelques répliques selon l'avancée =====
Object.assign(LOOKS, {
  crieur:     { skin: '#e0b48e', hair: '#5a3a1a', top: '#c8a040', legs: '#3a2a20', hat: '#7a2a2a' },
  lavandiere: { skin: '#f0c8a8', hair: '#8a5a2a', top: '#6a9ac8', legs: '#3a4a6a', long: true, apron: '#f0e8d8' },
  jules:      { skin: '#c8906a', hair: '#2a1a12', top: '#c84a4a', legs: '#3a3a5a', child: true },
  lila:       { skin: '#f0c8a8', hair: '#e8c060', top: '#8ac85a', legs: '#4a6a3a', child: true, long: true },
  lampions:   { skin: '#d8a880', hair: '#3a3a3a', top: '#a83a6a', legs: '#2a2a3a', beard: true },
  vagabond:   { skin: '#c8906a', hair: '#6a5a4a', top: '#6a5a3a', legs: '#3a3a2a', beard: true, hat: '#4a3a2a' },
  pauline:    { skin: '#f0c8a8', hair: '#3a2a1a', top: '#e87a3a', legs: '#4a3a5a', child: true },
  odette:     { skin: '#e8b890', hair: '#c8c8d0', top: '#3a6ab0', legs: '#2a3a5a', long: true, hat: '#c83a3a' },
  margot:     { skin: '#f0c8a8', hair: '#a85a2a', top: '#5a8a3a', legs: '#3a4a2a', long: true, apron: '#c8b888' },
  hugo:       { skin: '#d8a880', hair: '#2a2a2a', top: '#3a7a8a', legs: '#2a3a3a', hat: '#c8a040' },
  coquillages:{ skin: '#c8906a', hair: '#e8e8f0', top: '#e8d8b0', legs: '#6a8ab0', beard: true },
  fossoyeur:  { skin: '#c8b8b0', hair: '#3a3a3a', top: '#2a2a3a', legs: '#1a1a2a', hat: '#1a1a2a' },
});
const frag = () => SAVE.fragments || 0;
const VILLAGERS = {
  crieur: { name: 'Le crieur', lines: () => [SAVE.boss6 ? 'Oyez, oyez ! Le soleil est revenu ! Je n\'ai plus rien à crier… Oyez quand même !' : frag() >= 4 ? 'Oyez ! Les lanternes de la tour-horloge s\'allument une à une. On parle de vous jusqu\'à la Côte !' : frag() >= 1 ? 'Oyez, oyez ! Une lanterne brille sur la tour-horloge ! Le temps se remet en marche, doucement.' : 'Oyez, oyez ! Il est minuit… depuis cent ans. Rien d\'autre à signaler.'] },
  lavandiere: { name: 'Rosalie', lines: () => ['Je lave le linge au puits du village. Depuis que la nuit est tombée, rien ne sèche ! Heureusement qu\'il ne pleut jamais.', 'Au nord-ouest, après les Collines, il y a un vieux sanctuaire plein de lucioles. Ma grand-mère y allait faire des vœux.'] },
  jules: { name: 'Jules', lines: () => [pick(['Tu veux jouer à chat ? Non ? Tant pis, Lila est trop rapide de toute façon.', 'Arthur a une carte de chauve-souris en double. Il ne veut pas me l\'échanger.', 'Moi plus tard, je serai forgeron, comme Bertrand. Ou chevalier. Ou pêcheur.'])] },
  lila: { name: 'Lila', lines: () => [pick(['Chat ! C\'est toi le chat !', 'Tu as vu ? Il y a de petites lumières perdues partout dans le royaume. Ce sont des lucioles égarées !', 'Ma maman dit que derrière certains rochers fendus, il y a des grottes pleines de trésors.'])] },
  lampions: { name: 'Le marchand de lampions', lines: () => [SAVE.boss6 ? 'Des lampions en plein jour ? Bon… je vais me mettre aux ombrelles.' : 'Un lampion ? Non ? Il fait pourtant nuit noire. Vous les jeunes, vous avez de bons yeux.'] },
  vagabond: { name: 'Le vagabond', lines: () => ['La Route des Bergers… je la parcours depuis tant de nuits que je connais chaque caillou.', 'Tu vois ce cœur qui brille au milieu de la mare ? Impossible à atteindre à pied. Il faudrait un objet qui vole… et qui revient.'] },
  pauline: { name: 'Pauline', lines: () => ['Je cherche le vent pour faire voler mon cerf-volant. Le vent du moulin souffle dans la Forêt, mais ici, rien !'] },
  odette: { name: 'Odette', lines: () => ['Je grimpe ce col depuis quarante ans. Plus haut, c\'est la Montagne et ses gnomes. Gentils, mais bavards.', 'La paroi, là-haut, sonne creux. Les gnomes y cachaient leurs économies, paraît-il. Il faudrait la faire sauter.'] },
  margot: { name: 'Margot', lines: () => ['Je cueille des herbes à l\'orée du bois. L\'herboriste me les rachète un bon prix, tu devrais essayer !', 'Fais attention dans la Forêt : les sangliers foncent d\'abord, et réfléchissent jamais.'] },
  hugo: { name: 'Hugo, le passeur', lines: () => ['Il y avait un bac sur ce bassin, avant. Maintenant, il y a moi, et pas de bac.', 'Sur l\'îlot, il y a un vieux coffre et un poteau d\'amarrage. Avec un grappin, ça doit se faire en un saut.'] },
  coquillages: { name: 'Le ramasseur de coquillages', lines: () => ['Les dunes avancent un peu chaque nuit. Un jour, elles mangeront la Côte.', 'Le phare est éteint depuis que le temps s\'est arrêté. Le gardien n\'a plus de mèche, le pauvre.'] },
  fossoyeur: { name: 'Le fossoyeur', lines: () => ['Ici reposent ceux qui ont essayé de réveiller le Roi Minuit. Enfin… ils dorment, surtout. Profondément.', 'Le rocher fendu, au nord de la lande ? N\'y touche pas. Ou alors avec un gros pétard.'] },
};
function villager(id, x, y) { const v = VILLAGERS[id]; return new NPC(x, y, { look: id, fn: G => G.say(v.lines().map(text => ({ who: v.name, text }))) }); }

// ===== les quarts de cœur =====
// item 'piece_coeur' : quatre quarts font un cœur entier
function giveHeartPiece(G) {
  SAVE.hpieces = (SAVE.hpieces || 0) + 1; const full = SAVE.hpieces % 4 === 0;
  if (full) { SAVE.maxHp += 2; G.healFull(); }
  persist();
  return full ? 'Quatre quarts de cœur ! Ta vie maximale augmente d\'un cœur.' : `Un quart de cœur ! (${SAVE.hpieces % 4} / 4) Encore ${4 - SAVE.hpieces % 4} et ta vie maximale augmente d'un cœur.`;
}
function drawHeartPiece(x, y, s = 1, n = 1) {
  drawHeartShape(x, y, 1.6 * s, '#3a2a3a', '#2a1a2a');
  ctx.save(); ctx.beginPath(); ctx.rect(x - 8 * s, y - 8 * s, 8 * s, 8 * s); ctx.clip(); drawHeartShape(x, y, 1.6 * s, PAL.heart, '#c02848'); ctx.restore();
}
// quart de cœur posé au sol (on peut aussi le rapporter au frisbee ou au grappin)
class HeartPiece {
  constructor(x, y, flag) { this.x = x; this.y = y; this.flag = flag; this.t = rand(0, 5); this.w = 10; this.h = 8; this.isPickup = true; this.fetchable = true; this.kind = 'heartpiece'; this.light = { r: 34, c: 'rgba(255,140,170,' }; }
  get dead() { return !!SAVE[this.flag] || this.gone; }
  update(dt, G) {
    this.t += dt; if (this.carried) return;
    if (rectHit({ x: this.x - 6, y: this.y - 10, w: 12, h: 12 }, G.player.body()) && G.state === 'play') {
      SAVE[this.flag] = true; this.gone = true; SFX.bigheart(); G.raise('piece_coeur'); G.say([{ text: giveHeartPiece(G) }]);
    }
  }
  draw() { ell(this.x, this.y, 5, 2, 'rgba(0,0,0,.3)'); drawHeartPiece(this.x, this.y - 8 + Math.sin(this.t * 3), 1); if (Math.floor(this.t * 3) % 3 === 0) R(half(this.x + 4), half(this.y - 14), 1, 1, '#fff'); }
}

// ===== lucioles perdues : les sœurs de Lumi =====
// [id, zone, x (tuiles), y (tuiles)] ; pour un donjon : [id, zone, salle, x px, y px]
const FIREFLIES = [
  ['f_vil', 'royaume', 13, 32], ['f_col', 'collines', 67, 8], ['f_for', 'foret', 6, 10], ['f_mon', 'montagne', 58, 44], ['f_lac', 'lac', 4, 30], ['f_cot', 'cote', 6, 6], ['f_ter', 'terres', 58, 8],
  ['f_d1', 'cave', 'treasure', 400, 200], ['f_d2', 'bois', 'treasure', 80, 200], ['f_d3', 'mines', 'shaft', 400, 80], ['f_d4', 'temple', 'gallery', 240, 130], ['f_d5', 'tower', 'secret', 240, 200], ['f_d6', 'castle', 'armory', 400, 200],
  ['f_rn1', 'route_nord', 6, 6], ['f_rn2', 'route_nord', 34, 24], ['f_col1', 'col', 6, 24], ['f_col2', 'col', 34, 6], ['f_or1', 'oree', 6, 6], ['f_or2', 'oree', 34, 26],
  ['f_pr1', 'pres', 6, 24], ['f_du1', 'dunes', 20, 6], ['f_la1', 'lande', 34, 24], ['f_la2', 'lande', 6, 24],
  ['f_g1', 'grotte_collines', 6, 8], ['f_g2', 'grotte_montagne', 6, 8], ['f_g3', 'grotte_col', 6, 8], ['f_g4', 'grotte_lande', 6, 8],
  ['f_i1', 'pres', 31, 11, 'exact'], ['f_i2', 'dunes', 31, 21, 'exact'], ['f_i3', 'lac', 50, 40],
];
// les sœurs de Lumi : chacune a sa couleur (Lumi, elle, reste jaune pâle) ; [halo, cœur, lumière]
const FLY_COLORS = [['#6fe8ff', '#d8faff', '111,232,255'], ['#ff8ad0', '#ffe0f2', '255,138,208'], ['#7dffb0', '#dcffea', '125,255,176'], ['#c39bff', '#efe4ff', '195,155,255'],
  ['#ffa35c', '#ffe6d0', '255,163,92'], ['#7ab8ff', '#e0eeff', '122,184,255'], ['#ff7a7a', '#ffe0e0', '255,122,122'], ['#5effe0', '#d6fff8', '94,255,224']];
const flyColor = id => { let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return FLY_COLORS[h % FLY_COLORS.length]; };
const Flies = {
  n: () => Object.keys(SAVE.flies || {}).length,
  has: id => !!(SAVE.flies || {})[id],
  pow: () => SAVE.lumiPow || 0,
};
class LostFirefly {
  constructor(x, y, id, exact) { this.x = x; this.y = y; this.id = id; this.t = rand(0, 9); this.w = 8; this.h = 6; this.exact = exact; this.col = flyColor(id); this.light = { r: 40, c: 'rgba(' + this.col[2] + ',' }; this.isPickup = true; }
  get dead() { return Flies.has(this.id); }
  update(dt, G) {
    if (!this.exact && !this.settled) Pickup.prototype.settle.call(this, G.area);
    this.t += dt; const P = G.player;
    if (G.state === 'play' && dist(P.x, P.y - 10, this.x, this.y - 14) < 14) this.take(G);
    if (Math.random() < dt * 3) G.parts.add({ x: this.x + rand(-4, 4), y: this.y - 14 + rand(-4, 4), vy: -6, life: 0.6, c: this.col[1], r: 0.8 });
  }
  take(G) {
    SAVE.flies = SAVE.flies || {}; SAVE.flies[this.id] = 1; persist(); const n = Flies.n();
    SFX.chime(); G.parts.burst(this.x, this.y - 14, 18, { c: [this.col[0], this.col[1], '#fff'], life: 0.8, r: 1.5, up: 20 });
    Input.toast = { msg: `Luciole perdue : ${n} / 30`, t: 2.4 };
    if (!SAVE.fliesIntro) { SAVE.fliesIntro = true; persist(); G.say([{ who: 'Lumi', text: 'Une de mes sœurs ! On s\'était perdues quand la nuit est tombée. Il y en a trente, éparpillées dans tout le royaume, jusque dans les donjons.' }, { who: 'Lumi', text: 'Elle reste avec moi. Si tu m\'en ramènes, emmène-moi au Sanctuaire des lucioles, à l\'ouest des Collines : toutes les cinq sœurs, je deviendrai plus forte !' }]); }
    else if (n % 5 === 0 && Flies.pow() < n / 5) G.say([{ who: 'Lumi', text: `${n} sœurs ! Allons au Sanctuaire des lucioles : je sens un nouveau pouvoir qui m'attend.` }]);
  }
  draw() {
    const y = this.y - 14 + Math.sin(this.t * 2.5) * 3, x = this.x + Math.sin(this.t * 1.3) * 3;
    ctx.globalAlpha = 0.3 + 0.15 * Math.sin(this.t * 6); ell(x, y, 7, 7, this.col[0]); ctx.globalAlpha = 1;
    const w = Math.abs(Math.sin(this.t * 18)) * 2.5 + 0.5; ell(x - 2.5, y - 1.5, w, 1.6, 'rgba(244,247,255,.8)'); ell(x + 2.5, y - 1.5, w, 1.6, 'rgba(244,247,255,.8)');
    ell(x, y, 1.8, 1.8, this.col[1]); ell(this.x, this.y, 3, 1, 'rgba(0,0,0,.2)');
  }
}

// ===== les six pouvoirs de Lumi =====
const LUMI_POWERS = [
  { name: 'Grande lueur', desc: 'Lumi éclaire beaucoup plus loin dans le noir.' },
  { name: 'Œil de luciole', desc: 'Lumi fait scintiller les rochers fendus qui cachent une grotte.' },
  { name: 'Souffle de vie', desc: 'Quand il ne te reste qu\'un cœur, Lumi t\'en rend un (une fois par minute).' },
  { name: 'Flair des sœurs', desc: 'Lumi montre la direction de la luciole perdue la plus proche.' },
  { name: 'Aimant doré', desc: 'Les pièces et les cœurs viennent tout seuls jusqu\'à toi.' },
  { name: 'Éclat d\'aube', desc: 'Quand on te frappe, Lumi lance un éclair de lumière qui étourdit les ennemis autour.' },
];
const LumiFx = {
  healCd: 0, burstCd: 0,
  update(dt, G) {
    const pw = Flies.pow(), P = G.player; if (!P || G.state !== 'play') return;
    if (this.healCd > 0) this.healCd -= dt; if (this.burstCd > 0) this.burstCd -= dt;
    if (pw >= 3 && P.hp > 0 && P.hp <= 2 && this.healCd <= 0 && SAVE.maxHp > 2) { this.healCd = 60; G.healBy(2); SFX.bigheart(); G.parts.burst(Lumi.x, Lumi.y, 14, { c: ['#ff8ab0', '#fff'], life: 0.6, r: 1.5 }); Input.toast = { msg: 'Lumi te rend un cœur !', t: 2 }; }
    if (pw >= 5) for (const e of G.area.ents) {
      if (!(e instanceof Pickup) || e.dead || e.carried || !G.inRoom(e)) continue; const d = dist(e.x, e.y, P.x, P.y); if (d > 80 || d < 2) continue;
      const a = Math.atan2(P.y - e.y, P.x - e.x), s = Math.min(d, 140 * dt); e.x += Math.cos(a) * s; e.y += Math.sin(a) * s;
    }
  },
  // pouvoir 6 : éclair qui étourdit
  onHurt(G) {
    if (Flies.pow() < 6 || this.burstCd > 0) return; this.burstCd = 10; const P = G.player;
    SFX.crystal(); G.flashT = Math.max(G.flashT, 0.12); G.parts.burst(Lumi.x, Lumi.y, 30, { c: ['#fff6c0', '#ffe27a', '#fff'], life: 0.6, smin: 40, smax: 160, r: 1.5 });
    for (const e of G.area.ents) if (e.isEnemy && !e.dead && !e.isBoss && G.inRoom(e) && dist(e.x, e.y, P.x, P.y) < 100) { e.stunT = 2.5; e.flash = 0.2; }
  },
  // pouvoir 4 : une flèche vers la sœur la plus proche
  draw(G) {
    if (Flies.pow() < 4 || G.state !== 'play') return; const P = G.player; let best = null, bd = 1e9;
    for (const e of G.area.ents) if (e instanceof LostFirefly && !e.dead && G.inRoom(e)) { const d = dist(e.x, e.y, P.x, P.y); if (d < bd) { bd = d; best = e; } }
    if (!best || bd < 30) return; const a = Math.atan2(best.y - Lumi.y, best.x - Lumi.x), x = Lumi.x + Math.cos(a) * 10, y = Lumi.y + Math.sin(a) * 10;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.globalAlpha = 0.6 + 0.3 * Math.sin(G.t * 6); ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-2, -3); ctx.lineTo(-2, 3); ctx.fill(); ctx.restore();
  },
};

// ===== le Sanctuaire des lucioles : l'autel où Lumi reçoit ses pouvoirs =====
const SHRINE_K = 0.6; // taille de l'arche PixelLab (px logiques par px d'image)
const SHRINE_SLOTS = [[23, 49.5], [29.5, 31.5], [47.5, 20.5], [68.5, 20.5], [87.5, 32.5], [94.5, 49.5]]; // les 6 alvéoles, dans l'ordre où elles s'allument
class FireflyShrine {
  constructor(x, y) { this.x = x; this.y = y; this.w = 60; this.h = 16; this.solid = true; this.t = 0; }
  get light() { return { r: 90 + Flies.pow() * 8, c: 'rgba(255,230,150,' }; }
  canInteract() { return true; }
  interact(G) {
    const n = Flies.n(), pw = Flies.pow(), can = Math.min(6, Math.floor(n / 5));
    if (can > pw) return this.ceremony(G, pw + 1);
    const lines = [{ who: 'La Mère des lucioles', text: pw >= 6 ? 'Toutes mes filles sont rentrées, et Lumi brille comme l\'aube. Merci, enfant de l\'autre monde.' : `Tu m'as ramené ${n} de mes filles. Il en manque ${30 - n}. Toutes les cinq, Lumi grandira encore.` }];
    if (pw) lines.push({ who: 'La Mère des lucioles', text: 'Les dons de Lumi : ' + LUMI_POWERS.slice(0, pw).map(p => p.name).join(', ') + '.' });
    G.say(lines);
  }
  ceremony(G, k) {
    const P = G.player; let t = 0; SFX.chime();
    G.cut = { t: 0,
      update: dt => { const c = G.cut; c.t += dt; this.t += dt; G.parts.update(dt); if (Math.random() < dt * 30) G.parts.add({ x: this.x + rand(-60, 60), y: this.y - rand(0, 60), vy: -rand(10, 30), vx: (Lumi.x - this.x) * 0.3, life: 1.2, c: pick(FLY_COLORS)[0], r: 1.2 });
        Lumi.x = lerp(Lumi.x, this.x, dt * 2); Lumi.y = lerp(Lumi.y, this.y - 50 - Math.sin(c.t * 2) * 6, dt * 2);
        if (c.t > 2.2 && !c.done) { c.done = true; SAVE.lumiPow = k; persist(); SFX.bigheart(); G.flashT = 0.25; G.parts.burst(Lumi.x, Lumi.y, 50, { c: ['#ffe27a', '#fff', '#fff6c0'], life: 1.2, smin: 30, smax: 140, r: 2 }); }
        if (c.t > 3.2) { G.cut = null; G.state = 'play'; const p = LUMI_POWERS[k - 1]; G.say([{ who: 'La Mère des lucioles', text: `Mes filles te rendent ta lumière, Lumi. Voici le don « ${p.name} ».` }, { text: `Lumi grandit ! ${p.name} : ${p.desc}` }, { who: 'Lumi', text: pick(['Je me sens toute neuve ! Merci, {hero} !', 'Waouh… je brille jusqu\'au bout des ailes !', 'On fait une équipe du tonnerre, toi et moi.']) }], () => { if (Math.min(6, Math.floor(Flies.n() / 5)) > Flies.pow()) this.ceremony(G, Flies.pow() + 1); }); } },
      draw: () => {} };
    G.state = 'cut';
  }
  update(dt, G) { this.t += dt; if (Math.random() < dt * 8) G.parts.add({ x: this.x + rand(-40, 40), y: this.y - rand(10, 70), vy: -8, vx: rand(-6, 6), life: 1.5, c: pick(FLY_COLORS)[0], r: 1 }); }
  draw() {
    if (!IMG.deco_shrine) ell(this.x, this.y + 2, 40, 7, 'rgba(0,0,0,.4)');; // l'arche PixelLab a son propre socle : pas d'ombre
    if (decoImg('shrine', this.x, this.y, SHRINE_K, 2)) { // l'arche PixelLab : la Mère des lucioles flotte au milieu, les 6 alvéoles s'allument une à une
      const im = IMG.deco_shrine, k = SHRINE_K, ox = this.x - im.width * k / 2, oy = this.y + 2 - im.height * k, P = (u, v) => [ox + u * k, oy + v * k];
      SHRINE_SLOTS.forEach(([u, v], i) => {
        if (i >= Flies.pow()) return; const [x, y] = P(u, v), c = FLY_COLORS[i % FLY_COLORS.length], g = 0.5 + 0.3 * Math.sin(this.t * 3 + i);
        ctx.globalAlpha = g; ell(x, y, 5, 5, c[0]); ctx.globalAlpha = 1; ell(x, y, 2.6, 2.6, c[0]); ell(x - 0.6, y - 0.6, 1.2, 1.2, c[1]);
      });
      const [mx, my0] = P(57.5, 72), my = my0 + Math.sin(this.t * 1.6) * 2.5, g = 0.55 + 0.25 * Math.sin(this.t * 2.4);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = g * 0.5; ell(mx, my, 13, 13, '#c9a8ff'); ctx.globalAlpha = g; ell(mx, my, 6, 6, '#e6c8ff'); ctx.restore();
      ell(mx, my, 2.6, 2.6, '#fbf4ff'); const w = Math.sin(this.t * 22) > 0 ? 2.5 : 1.5; ctx.globalAlpha = 0.7; ell(mx - 3, my - 2, w, 1.5, '#ffffff'); ell(mx + 3, my - 2, w, 1.5, '#ffffff'); ctx.globalAlpha = 1;
      if (Math.random() < 0.08) G.parts.add({ x: mx + rand(-4, 4), y: my + rand(-3, 3), vy: -rand(6, 14), vx: rand(-4, 4), life: 1, c: pick(['#e6c8ff', '#fbf4ff']), r: 1 });
      return;
    }
    hi(this.x, this.y, false, () => {
      D(-70, -16, 140, 16, '#5a6a72'); D(-70, -16, 140, 3, '#8aa0a8'); D(-60, -24, 120, 8, '#6a7a82'); // le socle
      for (const sx of [-56, 40]) { D(sx, -120, 16, 104, '#7a8a92'); D(sx, -120, 4, 104, '#9aaab2'); D(sx - 4, -128, 24, 8, '#5a6a72'); } // colonnes
      D(-64, -140, 128, 14, '#4a5a62'); D(-64, -140, 128, 3, '#7a8a92'); D(-40, -158, 80, 18, '#4a5a62'); D(-16, -170, 32, 12, '#5a6a72'); // fronton
      D(-14, -60, 28, 36, '#3a4a52'); D(-10, -56, 20, 28, '#2a3a42'); // l'autel
      const g = 0.6 + 0.4 * Math.sin(this.t * 2); ctx.globalAlpha = g; ell(0, -78, 14, 14, '#e6c8ff'); ctx.globalAlpha = 1; ell(0, -78, 6, 6, '#fbf4ff'); // la Mère des lucioles
      for (let i = 0; i < 6; i++) { const on = i < Flies.pow(), a = -Math.PI + (i + 0.5) * Math.PI / 6; D(Math.round(Math.cos(a) * 46) - 3, Math.round(-100 + Math.sin(a) * 26) - 3, 6, 6, on ? FLY_COLORS[i][0] : '#2a3a42'); } // six lumières
    });
  }
}

// ===== grottes secrètes : un rocher fendu, un pétard, et une petite grotte derrière =====
class SecretRock {
  constructor(x, y, cave) { this.x = x; this.y = y; this.cave = cave; this.flag = 'open_' + cave; this.w = 30; this.h = 14; this.t = rand(0, 5); this.blastR = 30; }
  get open() { return !!SAVE[this.flag]; }
  get solid() { return !this.open; }
  get secret() { return !this.open; }
  canInteract() { return !this.open; }
  interact(G) { G.say([{ text: Flies.pow() >= 2 ? 'Lumi fait scintiller la fissure : il y a du vide derrière ! Un pétard en viendrait à bout.' : 'Un gros rocher. Il sonne… un peu creux ?' }]); }
  onBlast(G) { if (this.open) return; SAVE[this.flag] = true; persist(); SFX.boom(); setTimeout(() => SFX.secret(), 300); G.shake = 0.4; G.parts.burst(this.x, this.y - 14, 34, { c: ['#6a6478', '#8a8498', '#4a4458'], life: 0.9, smin: 30, smax: 130, r: 3, g: 160, up: 40 }); }
  update(dt, G) {
    this.t += dt; if (!this.open) return; const P = G.player;
    if (G.state === 'play' && P.dir === 'up' && Input.dy < -0.3 && Math.abs(P.x - this.x) < 9 && P.y > this.y - 4 && P.y < this.y + 10) { SFX.door(); const from = G.area.id, back = { x: this.x, y: this.y + 12, dir: 'down' }; G.areas[this.cave].back = { area: from, pos: back }; G.fadeTo(() => G.enter(this.cave, G.areas[this.cave].start)); }
  }
  draw() {
    if (!this.open && decoImg('secretrock', this.x, this.y, 1.3, 2)) { if (Flies.pow() >= 2 && Math.floor(this.t * 2) % 2) R(half(this.x - 2), half(this.y - 18), 2, 2, '#ffe27a'); return; }
    hi(this.x, this.y, false, () => {
      D(-34, -40, 68, 40, '#5a5468'); D(-30, -46, 60, 8, '#6a6478'); D(-34, -40, 68, 4, '#7a7488'); D(-34, -4, 68, 4, '#3a3448');
      for (const [x, y, w] of [[-26, -30, 10], [10, -24, 14], [-8, -14, 12]]) D(x, y, w, 3, '#4a4458');
      if (this.open) { D(-14, -34, 28, 34, '#05080f'); D(-10, -38, 20, 6, '#05080f'); return; }
      const sh = Flies.pow() >= 2, cr = sh ? '#ffe27a' : '#4e485c';
      [[-2, -36], [1, -28], [-3, -20], [2, -12], [0, -6]].forEach(([cx, cy]) => D(cx, cy, 2, 8, cr));
    });
    if (!this.open && Flies.pow() >= 2 && Math.floor(this.t * 4) % 2) R(half(this.x + rand(-6, 6)), half(this.y - rand(4, 18)), 1, 1, '#fff6c0');
  }
}
function buildSecretCave(id, name, fill) {
  const w = 26, h = 12, g = makeGrid(w, h, '.'), T = gridTools(g);
  T.rect(0, 0, w, 2, '#'); T.rect(0, h - 1, w, 1, '#'); T.rect(0, 0, 1, h, '#'); T.rect(w - 1, 0, 1, h, '#'); T.rect(12, h - 1, 2, 1, 'D');
  for (const [x, y] of [[3, 3], [22, 3], [4, 8], [21, 8]]) T.set(x, y, '#');
  const A = new Area(id, g, 'cave'); A.name = name; A.dark = 0.5; A.secret = true;
  A.start = { x: 13 * TS, y: (h - 2) * TS + 8, dir: 'up' };
  A.exits = { D: G => { const b = A.back || { area: 'royaume', pos: G.areas.royaume.plaza }; G.enter(b.area, b.pos); } };
  A.spawn = function () {
    this.ents = [new Brazier(6 * TS, 4 * TS), new Brazier(20 * TS, 4 * TS)];
    for (const [x, y] of [[2, 9], [23, 9]]) this.ents.push(Object.assign(new Pot(x * TS + 8, y * TS + 12), { loot: 'pot' }));
    fill(this);
  };
  return A;
}

// ===== les chemins entre les régions =====
// def : { id, name, w, h, seed, themes: [a, b], axis, sides: { N|S|E|W: [chiffre, zone, clé d'arrivée] }, build(T, r, A?), npcs: [[id, x, y]], spawn(A) }
const PASSAGE_ARRIVE = {};
function buildPassage(def) {
  const w = def.w || 40, h = def.h || 30, cx = Math.floor(w / 2), cy = Math.floor(h / 2), g = makeGrid(w, h, '.'), T = gridTools(g), r = seeded(def.seed);
  T.rect(0, 0, w, 2, '#'); T.rect(0, h - 2, w, 2, '#'); T.rect(0, 0, 2, h, '#'); T.rect(w - 2, 0, 2, h, '#');
  for (let x = 2; x < w - 2; x++) { if (r() < 0.5) T.set(x, 2, '#'); if (r() < 0.45) T.set(x, h - 3, '#'); }
  for (let y = 2; y < h - 2; y++) { if (r() < 0.5) T.set(2, y, '#'); if (r() < 0.5) T.set(w - 3, y, '#'); }
  const ell = (ex, ey, rx, ry, c) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (((x + 0.5 - ex) / rx) ** 2 + ((y + 0.5 - ey) / ry) ** 2 < 1) T.set(x, y, c); };
  if (def.build) def.build(T, r, ell, w, h);
  const keep = [];
  for (const [side, [d]] of Object.entries(def.sides)) {
    if (side === 'N') { T.rect(cx - 2, 0, 4, 2, d); T.rect(cx - 1, 2, 2, cy - 1, '='); T.rect(cx - 2, 2, 4, 1, '.'); keep.push({ x: (cx - 3) * TS, y: 0, w: 6 * TS, h: cy * TS + 16 }); }
    if (side === 'S') { T.rect(cx - 2, h - 2, 4, 2, d); T.rect(cx - 1, cy, 2, h - 2 - cy, '='); T.rect(cx - 2, h - 3, 4, 1, '.'); keep.push({ x: (cx - 3) * TS, y: cy * TS - 16, w: 6 * TS, h: (h - cy) * TS + 16 }); }
    if (side === 'E') { T.rect(w - 2, cy - 2, 2, 4, d); T.rect(cx, cy - 1, w - 2 - cx, 2, '='); T.rect(w - 3, cy - 2, 1, 4, '.'); keep.push({ x: cx * TS - 16, y: (cy - 3) * TS, w: (w - cx) * TS + 16, h: 6 * TS }); }
    if (side === 'W') { T.rect(0, cy - 2, 2, 4, d); T.rect(2, cy - 1, cx - 1, 2, '='); T.rect(2, cy - 2, 1, 4, '.'); keep.push({ x: 0, y: (cy - 3) * TS, w: cx * TS + 16, h: 6 * TS }); }
  }
  if (def.after) def.after(T, w, h);
  for (let i = 0; i < 40; i++) { const x = Math.floor(r() * w), y = Math.floor(r() * h); if (g[y][x] === '.') g[y][x] = ','; }
  const A = zoneArea(def.id, g, def.themes[0], { name: def.name, dark: def.dark != null ? def.dark : 0.4 });
  A.passage = true;
  if (def.themes[1]) { A.rerender = function () { this.layer = blendLayer(this.g, def.themes[0], def.themes[1], def.axis || 'y'); }; A.rerender(); }
  scatter(A, def.seed + 1, keep.concat(def.keep || []), Object.assign({ trees: 16, rocks: 8, flowers: 14, bushes: 12 }, def.decor || {}));
  // arrivées : on entre par le bord qui mène à la région d'où l'on vient
  const arrive = {};
  for (const [side, [d, to, key]] of Object.entries(def.sides)) {
    arrive[side] = side === 'N' ? { x: cx * TS, y: 4 * TS, dir: 'down' } : side === 'S' ? { x: cx * TS, y: (h - 4) * TS, dir: 'up' } : side === 'E' ? { x: (w - 3) * TS, y: cy * TS + 4, dir: 'left' } : { x: 3 * TS, y: cy * TS + 4, dir: 'right' };
    PASSAGE_ARRIVE[def.id + '_from_' + to] = arrive[side];
  }
  A.exits = {}; A.exitTo = {}; for (const [, [d, to, key]] of Object.entries(def.sides)) { A.exits[d] = goZone(to, key); A.exitTo[d] = [to, key]; }
  A.start = Object.values(arrive)[0];
  A.spawn = function () {
    this.ents = [];
    for (const [x, y] of this.bushSpots) this.ents.push(new Bush(x, y));
    for (const [id, x, y] of def.npcs || []) this.ents.push(villager(id, x * TS + 8, y * TS));
    if (def.spawn) def.spawn(this);
    questSpawns(this);
  };
  return A;
}
// les chemins
const PASSAGES = [
  { id: 'route_nord', name: 'La Route des Bergers', seed: 101, themes: ['collines', 'camp'], axis: 'y',
    sides: { S: ['1', 'royaume', 'village_from_collines'], N: ['2', 'collines', 'collines_from_village'] },
    build(T, r, ell) { T.rect(2, 9, 36, 2, '~'); ell(30, 20, 4, 3, '~'); T.set(30, 20, '.'); },          // le ruisseau, et la mare au cœur
    after(T) { T.rect(19, 9, 2, 2, 'b'); },                                                             // le petit pont
    npcs: [['vagabond', 16, 19], ['pauline', 25, 22]],
    spawn(A) { A.ents.push(new HeartPiece(30 * TS + 8, 20 * TS + 12, 'hp_ruisseau')); A.ents.push(new Sign(22 * TS, 13 * TS, [{ text: '« Route des Bergers. Au nord : les Collines. Au sud : Bourg-Luciole. »' }])); } },
  { id: 'col', name: 'Le Col des Sapins', seed: 131, themes: ['collines', 'montagne'], axis: 'x', dark: 0.45,
    sides: { W: ['1', 'collines', 'collines_from_montagne'], E: ['2', 'montagne', 'montagne_from_collines'] },
    build(T) { T.rect(2, 2, 36, 5, '#'); },
    keep: [{ x: 22 * TS, y: 5 * TS, w: 9 * TS, h: 6 * TS }],
    decor: { kinds: ['pine1', 'pine2'], trees: 20 },
    npcs: [['odette', 14, 18]],
    spawn(A) { A.ents.push(new SecretRock(26 * TS + 8, 8 * TS, 'grotte_col')); } },
  { id: 'oree', name: 'L\'Orée du bois', seed: 151, themes: ['foret', 'camp'], axis: 'x', dark: 0.48,
    sides: { E: ['1', 'royaume', 'village_from_foret'], W: ['2', 'foret', 'foret_from_village'] },
    decor: { kinds: ['pine1', 'pine2', 'oak1'], trees: 22 },
    npcs: [['margot', 24, 10]],
    spawn(A) { for (const [x, y] of [[8, 8], [30, 22], [12, 24]]) A.ents.push(new Forage(x * TS + 8, y * TS + 12, 'champignons')); } },
  { id: 'pres', name: 'Les Prés du Lac', seed: 171, themes: ['camp', 'lac'], axis: 'y',
    sides: { N: ['1', 'royaume', 'village_from_lac'], S: ['2', 'lac', 'lac_from_village'] },
    build(T, r, ell) { ell(30, 11, 7, 5, '~'); ell(30, 11, 2.4, 1.9, '.'); },                                // le bassin et son îlot
    npcs: [['hugo', 24, 17]],
    spawn(A) { A.ents.push(new Post(30 * TS + 8, 12 * TS + 12), new Post(22 * TS + 8, 12 * TS)); A.ents.push(new Chest(30 * TS, 11 * TS, { flag: 'hp_ilot_pres', give: 'piece_coeur', msg: null })); } }, // le coffre de l'îlot
  { id: 'dunes', name: 'Les Dunes', seed: 191, themes: ['lac', 'cote'], axis: 'x', dark: 0.42,
    sides: { W: ['1', 'lac', 'lac_from_cote'], E: ['2', 'cote', 'cote_from_lac'] },
    build(T, r, ell) { ell(30, 21, 6, 4, '~'); ell(30, 21, 2.4, 1.9, '.'); },
    decor: { kinds: ['oak1', 'oak2'], trees: 10 },
    npcs: [['coquillages', 14, 10]],
    spawn(A) { A.ents.push(new Post(30 * TS + 8, 22 * TS + 12), new Post(22 * TS + 8, 22 * TS)); A.ents.push(new Chest(30 * TS, 21 * TS, { flag: 'hp_ilot_dunes', give: 'piece_coeur', msg: null })); for (const [x, y] of [[8, 8], [33, 8]]) A.ents.push(new Decor(x * TS, y * TS, 'palm')); } },
  { id: 'lande', name: 'La Lande grise', seed: 211, themes: ['terres', 'lac'], axis: 'x', dark: 0.52,
    sides: { E: ['1', 'lac', 'lac_from_terres'], W: ['2', 'terres', 'terres_from_lac'] },
    build(T) { T.rect(2, 2, 36, 5, '#'); },
    keep: [{ x: 8 * TS, y: 5 * TS, w: 9 * TS, h: 6 * TS }],
    decor: { kinds: ['dead', 'pine2'], trees: 14 },
    npcs: [['fossoyeur', 24, 20]],
    spawn(A) { A.ents.push(new SecretRock(12 * TS + 8, 8 * TS, 'grotte_lande')); for (const [, x, y] of A.decor || []) A.ents.push(new Decor(x, y, 'dead')); for (const [x, y] of [[8, 12], [30, 20], [34, 12]]) A.ents.push(new Decor(x * TS, y * TS, 'grave')); } },
];
// le sanctuaire des lucioles (à l'ouest des Collines)
function buildSanctuaire() {
  const A = buildPassage({ id: 'sanctuaire', name: 'Le Sanctuaire des lucioles', seed: 233, themes: ['camp', 'collines'], axis: 'x', dark: 0.5,
    sides: { E: ['1', 'collines', 'collines_from_sanct'] },
    build(T, r, ell) { ell(10, 22, 4, 3, '~'); ell(30, 22, 4, 3, '~'); },
    after(T) { T.rect(14, 6, 12, 9, '.'); T.rect(19, 9, 2, 6, '='); },
    keep: [{ x: 10 * TS, y: 2 * TS, w: 20 * TS, h: 14 * TS }],
    decor: { trees: 18, kinds: ['oak1', 'oak2', 'pine1'] },
    spawn(A) { A.ents.push(new FireflyShrine(20 * TS, 9 * TS)); A.ents.push(new Sign(24 * TS, 16 * TS, [{ text: '« Sanctuaire des lucioles. Rapportez-y les lucioles égarées. »' }])); } });
  return A;
}
ZONE_ARRIVE.collines_from_sanct = { x: 5 * TS, y: 28 * TS + 4, dir: 'right' };

// ===== où vont les lucioles, les quarts de cœur et les habitants, à chaque visite =====
function worldSpawn(A) {
  for (const f of FIREFLIES) {
    if (f[1] !== A.id || Flies.has(f[0])) continue;
    if (A.rooms) { const p = A.h.pos(f[2], f[3], f[4]); const e = new LostFirefly(p.x, p.y, f[0]); e.room = A.h.R[f[2]]; A.ents.push(e); }
    else A.ents.push(new LostFirefly(f[2] * TS + 8, f[3] * TS + 8, f[0], f[4] === 'exact'));
  }
  if (A.id === 'royaume') A.ents.push(villager('crieur', 30 * TS + 8, 33 * TS), villager('lavandiere', 50 * TS + 8, 27 * TS), villager('jules', 45 * TS + 8, 28 * TS), villager('lila', 47 * TS + 8, 29 * TS), villager('lampions', 15 * TS + 8, 13 * TS));
  if (A.id === 'collines') A.ents.push(new SecretRock(17 * TS + 8, 10 * TS, 'grotte_collines'));
  if (A.id === 'montagne') A.ents.push(new SecretRock(22 * TS + 8, 8 * TS, 'grotte_montagne'));
  sqSpawn(A); // les quêtes secondaires
}

// ===== construction =====
function buildMonde(areas) {
  for (const def of PASSAGES) areas[def.id] = buildPassage(def);
  areas.sanctuaire = buildSanctuaire();
  Object.assign(ZONE_ARRIVE, PASSAGE_ARRIVE);
  const cave = (id, name, fill) => { areas[id] = buildSecretCave(id, name, fill); };
  const chest = (A, flag, give, msg) => A.ents.push(Object.assign(new Chest(13 * TS, 6 * TS, { flag, give, msg }), {}));
  cave('grotte_collines', 'Une grotte secrète', A => { chest(A, 'gc_heart', 'piece_coeur', null); A.ents.push(new Sign(8 * TS, 9 * TS, [{ text: '« Ici dormait la plus vieille luciole du royaume. Elle est partie voir le monde. »' }], 'stone')); });
  cave('grotte_montagne', 'La cache des gnomes', A => { chest(A, 'gm_heart', 'piece_coeur', null); A.ents.push(new Chest(19 * TS, 9 * TS, { flag: 'gm_money', give: 'money:80', msg: [{ text: 'Les économies d\'un gnome : 80 écus !' }] })); });
  cave('grotte_col', 'Une grotte secrète', A => { chest(A, 'gl_heart', 'piece_coeur', null); });
  cave('grotte_lande', 'Le caveau oublié', A => { chest(A, 'gd_heart', 'piece_coeur', null); A.ents.push(new Sign(8 * TS, 9 * TS, [{ text: '« Le Roi Minuit avait un frère, qui aimait le soleil. Son nom a été effacé de toutes les pierres. »' }], 'stone')); });
  // les régions existantes passent maintenant par les chemins
  const ex = (id, d, to, key) => { areas[id].exits[d] = goZone(to, key); (areas[id].exitTo = areas[id].exitTo || {})[d] = [to, key]; };
  ex('royaume', 1, 'route_nord', 'route_nord_from_royaume'); ex('royaume', 2, 'oree', 'oree_from_royaume'); ex('royaume', 3, 'pres', 'pres_from_royaume');
  ex('collines', 1, 'route_nord', 'route_nord_from_collines'); ex('collines', 2, 'col', 'col_from_collines'); ex('collines', 3, 'sanctuaire', 'sanctuaire_from_collines');
  ex('foret', 1, 'oree', 'oree_from_foret'); ex('montagne', 1, 'col', 'col_from_montagne');
  ex('lac', 1, 'pres', 'pres_from_lac'); ex('lac', 2, 'dunes', 'dunes_from_lac'); ex('lac', 3, 'lande', 'lande_from_lac');
  ex('cote', 1, 'dunes', 'dunes_from_cote'); ex('terres', 1, 'lande', 'lande_from_terres');
  sqBuild(areas); // les lieux des quêtes : le phare, la grotte sous la mer
}

// ===== icônes =====
const EXTRA_ICONS = {
  piece_coeur: (x, y, s) => drawHeartPiece(x, y, s),
  luciole: (x, y, s) => { ctx.globalAlpha = 0.4; ell(x, y, 5 * s, 5 * s, '#ffe27a'); ctx.globalAlpha = 1; ell(x, y, 2 * s, 2 * s, '#fff6c0'); },
};
