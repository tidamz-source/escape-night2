'use strict';
// ---------- RPG et commerce : matériaux, forge, bestiaire, marché, revente, troc, métiers, cuisine ----------
// Les matériaux et ingrédients vivent dans SAVE.inv.ingredients (comme les champignons).

// ===== matériaux et ingrédients =====
// price : ce qu'Amandine en donne ; rare : matériau de forge (un boss en laisse deux)
const MATS = {
  champignons:   { name: 'Champignon', price: 3, desc: 'Pousse au pied des arbres de la Forêt. Mamie sait les cuisiner.' },
  herbe:         { name: 'Herbe des collines', price: 4, desc: 'Une herbe parfumée qui pousse dans les Collines.' },
  herbe_rare:    { name: 'Herbe d\'aube', price: 12, desc: 'Ne pousse que depuis que la lumière revient. Très recherchée.' },
  poisson_petit: { name: 'Petit poisson', price: 5, desc: 'Un poisson du Lac ou de la Côte.' },
  poisson_grand: { name: 'Gros poisson', price: 12, desc: 'Une belle prise !' },
  poisson_dore:  { name: 'Poisson doré', price: 40, desc: 'Une légende des pêcheurs. Il brille même la nuit.' },
  minerai:       { name: 'Minerai de fer', price: 8, desc: 'Arraché aux rochers brillants de la Montagne.' },
  cristal:       { name: 'Cristal', price: 15, desc: 'Un éclat de cristal des Mines.' },
  plume:         { name: 'Plume noire', price: 10, desc: 'Laissée par un corbeau.' },
  ecaille:       { name: 'Écaille', price: 10, desc: 'Une écaille irisée de crabe ou d\'anguille.' },
  pierre_lune:   { name: 'Pierre de lune', price: 50, rare: true, desc: 'Laissée par la Grande Ombre. Bertrand en fait des merveilles.' },
  plume_duc:     { name: 'Plume du Grand-Duc', price: 50, rare: true, desc: 'Une plume immense, légère comme l\'air.' },
  acier_gnome:   { name: 'Acier gnome', price: 50, rare: true, desc: 'Un lingot forgé par les gnomes, dur comme la roche.' },
  ecaille_reine: { name: 'Écaille de la Reine', price: 50, rare: true, desc: 'Une écaille nacrée de la Reine des remous.' },
  poudre:        { name: 'Poudre d\'artifice', price: 50, rare: true, desc: 'Une poudre qui crépite entre les doigts.' },
  eclat_ombre:   { name: 'Éclat d\'ombre', price: 50, rare: true, desc: 'Un morceau de l\'armure du Chevalier Minuit.' },
};
const Mats = {
  n: id => Inventory.ingredient(id),
  add(id, n = 1, G) { Inventory.addIngredient(id, n); if (G) Input.toast = { msg: `+${n} ${MATS[id].name.toLowerCase()}`, t: 1.6 }; },
  owned: () => Object.keys(MATS).filter(id => Inventory.ingredient(id) > 0),
};
function drawMatIcon(id, x, y, s = 1) {
  const u = s, B = (dx, dy, w, h, c) => R(x + dx * u, y + dy * u, w * u, h * u, c);
  switch (id) {
    case 'champignons': return PICKUPS.mushroom.draw(x, y + 5 * s);
    case 'herbe': case 'herbe_rare': { const c = id === 'herbe' ? '#5ab05a' : '#ffd86a'; B(-1, -5, 2, 9, '#3a7a3a'); B(-5, -4, 4, 3, c); B(1, -2, 4, 3, c); B(-3, -7, 3, 3, c); if (id === 'herbe_rare') { B(2, -6, 1, 1, '#fff'); B(-4, 1, 1, 1, '#fff'); } return; }
    case 'poisson_petit': case 'poisson_grand': case 'poisson_dore': {
      const k = id === 'poisson_petit' ? 0.8 : 1.1, c = id === 'poisson_dore' ? ['#ffd23a', '#c89010'] : ['#7ab0d8', '#4a7aa8'];
      ell(x, y, 6 * k * s, 3 * k * s, c[0]); ell(x, y + 1 * s, 6 * k * s, 1.5 * k * s, c[1]);
      B(5 * k, -3 * k, 3, 6 * k, c[1]); B(-4 * k, -1, 1, 1, '#14244c'); return;
    }
    case 'minerai': B(-5, -4, 10, 8, '#6a6478'); B(-4, -5, 8, 2, '#8a8498'); B(-2, -2, 2, 2, '#c8a0a0'); B(2, 0, 2, 2, '#d8b0a0'); return;
    case 'cristal': case 'pierre_lune': { const c = id === 'cristal' ? ['#8ff3ea', '#4ab0c8'] : ['#e8e8ff', '#9a9ad8']; B(-2, -6, 4, 12, c[0]); B(-4, -3, 2, 7, c[1]); B(2, -4, 2, 8, c[1]); B(-1, -5, 1, 3, '#fff'); return; }
    case 'plume': case 'plume_duc': { const c = id === 'plume' ? ['#3a3448', '#5a5470'] : ['#c8a070', '#8a6a4a']; ctx.save(); ctx.translate(x, y); ctx.rotate(-0.6); R(-1 * u, -7 * u, 2 * u, 14 * u, c[1]); R(-3 * u, -6 * u, 6 * u, 9 * u, c[0]); R(-0.5 * u, -6 * u, 1 * u, 12 * u, '#e8dcc8'); ctx.restore(); return; }
    case 'ecaille': case 'ecaille_reine': { const c = id === 'ecaille' ? ['#5ac8b0', '#2a8a7a'] : ['#f0d0ff', '#a07ac8']; ell(x, y, 5 * s, 6 * s, c[1]); ell(x, y - 1 * s, 4 * s, 4.5 * s, c[0]); B(-1, -4, 1, 3, '#fff'); return; }
    case 'acier_gnome': B(-6, -2, 12, 6, '#5a5e6a'); B(-5, -3, 10, 2, '#9aa0b0'); B(-4, -2, 8, 1, '#d8dce8'); return;
    case 'poudre': B(-4, -4, 8, 9, '#8a4a2a'); B(-3, -6, 6, 2, '#c8a070'); B(-1, -8, 2, 2, '#ffd23a'); B(1, -9, 1, 1, '#ff7a1a'); return;
    case 'eclat_ombre': B(-2, -6, 5, 12, '#2a1d48'); B(-4, -2, 3, 6, '#4a3a7a'); B(0, -5, 1, 4, '#c3b3ff'); return;
  }
}
for (const id of Object.keys(MATS)) PICKUPS['mat_' + id] = { draw: (x, y) => drawMatIcon(id, x, y - 5, 0.8), take: () => { Inventory.addIngredient(id, 1); SFX.pickup(); } };

// ===== effets temporaires (soupes) =====
const Effects = {
  t: {}, // nom → secondes restantes
  add(k, s) { this.t[k] = Math.max(this.t[k] || 0, s); },
  on(k) { return (this.t[k] || 0) > 0; },
  update(dt) { for (const k of Object.keys(this.t)) { this.t[k] -= dt; if (this.t[k] <= 0) delete this.t[k]; } },
  reset() { this.t = {}; },
};

// ===== 1. la forge : améliorations =====
const UPGRADES = {
  epee:         { name: 'Épée', has: () => Inventory.has('epee_bois') || Inventory.has('epee_fer'), lv: [
    { mat: 'pierre_lune', price: 60, what: 'Coup chargé : reste appuyé sur A, puis relâche pour une attaque tournoyante.' },
    { mat: 'acier_gnome', price: 150, what: 'Lame de lumière : le coup chargé lance aussi une onde.' }] },
  lance_pierre: { name: 'Lance-pierre', has: () => Inventory.has('lance_pierre'), lv: [
    { mat: 'plume_duc', price: 50, what: 'Tir double : deux cailloux pour le prix d\'un, et plus rapide.' },
    { mat: 'ecaille_reine', price: 120, what: 'Cailloux perçants : ils traversent deux ennemis.' }] },
  frisbee:      { name: 'Frisbee', has: () => Inventory.has('frisbee'), lv: [
    { mat: 'plume_duc', price: 60, what: 'Va plus loin et touche trois cibles avant de revenir.' },
    { mat: 'poudre', price: 130, what: 'Frisbee de feu : il allume les torches et brûle les ennemis.' }] },
  grappin:      { name: 'Grappin', has: () => Inventory.has('grappin'), lv: [
    { mat: 'acier_gnome', price: 80, what: 'Portée augmentée de moitié.' },
    { mat: 'ecaille_reine', price: 150, what: 'Les ennemis attrapés prennent un coup.' }] },
  bouclier:     { name: 'Bouclier', has: () => Inventory.has('bouclier'), lv: [
    { mat: 'acier_gnome', price: 70, what: 'Pare les tirs de face et de côté.' },
    { mat: 'eclat_ombre', price: 180, what: 'Renvoie les tirs vers les ennemis.' }] },
};
const Upg = {
  lv: id => (SAVE.upg || {})[id] || 0,
  next(id) { const u = UPGRADES[id]; return u.has() ? u.lv[this.lv(id)] : null; },
  can(id) { const n = this.next(id); return n && Mats.n(n.mat) >= 1 && Wallet.get() >= n.price; },
  buy(id, G) {
    const n = this.next(id); if (!n) return;
    if (Mats.n(n.mat) < 1) { SFX.nope(); G.say([{ who: 'Bertrand', text: `Il me faut un morceau de ${MATS[n.mat].name.toLowerCase()} pour ça. Ça ne se trouve pas au marché, crois-moi.` }]); return; }
    if (Wallet.get() < n.price) { SFX.nope(); G.say([{ who: 'Bertrand', text: `Ça fait ${n.price} écus. Reviens quand ta bourse sera plus ronde.` }]); return; }
    Wallet.spend(n.price); Inventory.useIngredient(n.mat, 1); SAVE.upg = SAVE.upg || {}; SAVE.upg[id] = this.lv(id) + 1; persist();
    // Bertrand frappe l'enclume
    let k = 0; const P = G.player;
    const strike = () => { SFX.clank(); G.shake = 0.15; G.parts.burst(P.x, P.y - 30, 14, { c: ['#fff', '#ffe27a', '#ff7a1a'], life: 0.5, smin: 30, smax: 110, r: 1.5, g: 200 }); if (++k < 3) setTimeout(strike, 260); else setTimeout(() => { SFX.secret(); G.raise(id === 'epee' ? SAVE.inv.weapon : id); G.say([{ who: 'Bertrand', text: `Et voilà ! ${UPGRADES[id].name} ★${this.lv(id)}. ${n.what}` }, { who: 'Bertrand', text: pick(['Ne la casse pas tout de suite, hein.', 'Ton bric-à-brac commence à ressembler à quelque chose.', 'Si on te demande, c\'est du Bertrand.']) }]); }, 300); };
    strike();
  },
};
function forgeTalk(G) {
  const sh = Shop.def('forge'), opts = Object.keys(UPGRADES).filter(id => Upg.next(id));
  G.ask([{ who: sh.keeper, text: sh.hello }], ['Acheter', 'Améliorer un objet', 'Rien'], i => {
    if (i === 0) return G.say([{ who: sh.keeper, text: 'Approche-toi d\'un article et appuie sur A pour l\'acheter.' }]);
    if (i !== 1) return;
    if (!opts.length) return G.say([{ who: sh.keeper, text: 'Tout ce que tu as est déjà au meilleur de ce que je sais faire. Ou alors ramène-moi des matériaux rares !' }]);
    const list = opts.slice(0, 4), label = id => { const n = Upg.next(id); return `${UPGRADES[id].name} ★${Upg.lv(id) + 1} : ${n.price} écus + ${MATS[n.mat].name.toLowerCase()}${Mats.n(n.mat) ? '' : ' (manque)'}`; };
    G.ask([{ who: sh.keeper, text: 'Qu\'est-ce que je t\'améliore ? Il me faut des écus et un matériau rare, de ceux que laissent les gardiens des donjons.' }], [...list.map(label), 'Rien'], k => { if (k < list.length) { const id = list.at(k); G.ask([{ who: sh.keeper, text: UPGRADES[id].lv[Upg.lv(id)].what }], ['C\'est parti', 'Non merci'], c => { if (c === 0) Upg.buy(id, G); }); } });
  });
}
// onde de l'épée de lumière
class SwordWave {
  constructor(P, room) { const [dx, dy] = DV[P.dir]; this.dx = dx; this.dy = dy; this.x = P.x + dx * 10; this.y = P.y + dy * 6; this.alt = 8; this.room = room; this.t = 0; this.isShot = true; this.hitSet = new Set(); this.w = 8; this.h = 4; this.light = { r: 26, c: 'rgba(200,240,255,' }; }
  update(dt, G) {
    this.t += dt; this.x += this.dx * 220 * dt; this.y += this.dy * 220 * dt;
    if (this.t > 0.7 || WALLS.has(G.area.tileAt(this.x, this.y - 2))) { this.dead = true; G.parts.burst(this.x, this.y - this.alt, 6, { c: ['#fff', '#bff0ff'], life: 0.3, r: 1 }); return; }
    const b = { x: this.x - 8, y: this.y - this.alt - 8, w: 16, h: 16 };
    for (const e of G.area.ents) { if (!e.isEnemy || e.dead || this.hitSet.has(e) || (e.room != null && G.area.rooms && e.room !== G.room)) continue; if (rectHit(b, e.body())) { this.hitSet.add(e); e.hit(Inventory.dmg(), this.x, this.y, G, 'sword'); } }
  }
  draw() { const y = this.y - this.alt, a = Math.atan2(this.dy, this.dx); ctx.save(); ctx.translate(this.x, y); ctx.rotate(a); ctx.globalAlpha = 0.85; ctx.fillStyle = '#e8f8ff'; ctx.beginPath(); ctx.ellipse(0, 0, 4, 9, 0, -Math.PI / 2, Math.PI / 2); ctx.fill(); ctx.fillStyle = '#9fe8ff'; ctx.beginPath(); ctx.ellipse(-1, 0, 2, 6, 0, -Math.PI / 2, Math.PI / 2); ctx.fill(); ctx.restore(); }
}
// attaque tournoyante (coup chargé)
function spinAttack(P, G) {
  SFX.swing(); setTimeout(() => SFX.swing(), 90); G.shake = 0.15;
  G.parts.burst(P.x, P.y - 10, 22, { c: ['#fff', '#bff0ff', PAL.glow], life: 0.35, smin: 60, smax: 140, r: 1.5, drag: 4 });
  P.spinT = 0.3;
  for (const e of G.area.ents.slice()) {
    if (e.dead || (e.room != null && G.area.rooms && e.room !== G.room)) continue;
    if (dist(P.x, P.y - 6, e.x, e.y - 6) > 30) continue;
    if (e.isEnemy) e.hit(Inventory.dmg() * 2, P.x, P.y, G, 'sword');
    else if (e instanceof Bush || e instanceof Pot) e.hit(1, P.x, P.y, G);
    else if (e.onSpin) e.onSpin(G);
  }
  if (Upg.lv('epee') >= 2) G.area.ents.push(new SwordWave(P, G.room));
}

// ===== 3. le bestiaire =====
const BEASTS = [
  { k: 'Raccoon', name: 'Raton laveur', zone: 'Collines, Lac', weak: 'épée, cailloux', note: 'Vole tout ce qui brille. Même les cuillères. Surtout les cuillères.' },
  { k: 'Bat', name: 'Chauve-souris', zone: 'Grotte, Collines', weak: 'cailloux, épée', note: 'Dort le jour, crie la nuit. Ici, il fait nuit depuis cent ans : elle n\'en peut plus.' },
  { k: 'Shadow', name: 'Ombre', zone: 'Grotte, Terres de Minuit', weak: 'épée, lumière', note: 'Un bout de nuit qui a pris la mauvaise habitude de mordre.' },
  { k: 'Wisp', name: 'Feu follet', zone: 'Grotte, Château', weak: 'épée', note: 'Il veut juste qu\'on le suive. Ne le suivez pas.' },
  { k: 'Squirrel', name: 'Écureuil', zone: 'Bois des murmures', weak: 'cailloux, frisbee', note: 'Lance des glands avec une précision inquiétante. Garde rancune.' },
  { k: 'Boar', name: 'Sanglier', zone: 'Forêt, Bois', weak: 'épée, frisbee', note: 'Fonce d\'abord, réfléchit jamais.' },
  { k: 'Crow', name: 'Corbeau', zone: 'Bois, Lac, Côte', weak: 'cailloux', note: 'Collectionne les plumes des autres. Et les siennes, qu\'il laisse partout.' },
  { k: 'Gnome', name: 'Gnome mineur', zone: 'Mines', weak: 'épée, grappin', note: 'Ne lui parle pas de son casque. Vraiment pas.' },
  { k: 'CrystalSpider', name: 'Araignée de cristal', zone: 'Mines', weak: 'épée, cailloux', note: 'Belle, brillante, et elle saute au visage.' },
  { k: 'Crab', name: 'Crabe', zone: 'Lac, Temple, Côte', weak: 'épée de côté', note: 'Marche de travers par principe.' },
  { k: 'Eel', name: 'Anguille', zone: 'Temple, Côte', weak: 'épée quand elle sort', note: 'Électrique de caractère.' },
  { k: 'SkeletonKnight', name: 'Chevalier squelette', zone: 'Tour, Château', weak: 'dans le dos', note: 'Son bouclier pare tout ce qui vient de face. Sa patience, beaucoup moins.' },
  { k: 'Gargoyle', name: 'Gargouille', zone: 'Tour', weak: 'cailloux, épée', note: 'Fait la statue. Très mal.' },
  { k: 'GreatShadow', name: 'La Grande Ombre', zone: 'Grotte des lucioles', weak: 'cailloux, puis épée', boss: true, note: 'Gardienne de la grotte. Elle a peur de la lumière, comme toutes les grandes ombres.' },
  { k: 'GreatOwl', name: 'Le Grand-Duc', zone: 'Bois des murmures', weak: 'frisbee, cailloux, épée au sol', boss: true, note: 'Ancien gardien du bois, ensorcelé. Il hulule en mineur.' },
  { k: 'IronMole', name: 'La Taupe de fer', zone: 'Mines des gnomes', weak: 'grappin, puis épée', boss: true, note: 'Les gnomes l\'avaient construite pour creuser. Elle a creusé un peu trop.' },
  { k: 'WhirlQueen', name: 'La Reine des remous', zone: 'Temple englouti', weak: 'épée quand elle émerge', boss: true, note: 'Elle tourne en rond depuis cent ans. Ça finit par donner le tournis.' },
  { k: 'IronKnight', name: 'Le Chevalier de fer', zone: 'Tour des artificiers', weak: 'pétards, épée', boss: true, note: 'Une armure vide qui marche toute seule. Bruyante.' },
  { k: 'MidnightKnight', name: 'Le Chevalier Minuit', zone: 'Château de Minuit', weak: 'épée', boss: true, note: 'Sous ce casque se cache quelqu\'un qui fait très bien les crêpes.' },
  { k: 'MidnightKing', name: 'Le Roi Minuit', zone: 'Château de Minuit', weak: 'cristaux, grappin, épée', boss: true, note: 'Il a arrêté le temps pour ne pas vieillir. Il nourrit aujourd\'hui les pigeons.' },
];
const Bestiary = {
  kills: k => (SAVE.kills || {})[k] || 0,
  full(b) { return this.kills(b.k) >= (b.boss ? 1 : 10); },
  nFull() { return BEASTS.filter(b => this.full(b)).length; },
  kill(e) {
    const k = e.constructor.name, b = BEASTS.find(x => x.k === k); if (!b) return;
    SAVE.kills = SAVE.kills || {}; const was = this.full(b); SAVE.kills[k] = this.kills(k) + 1;
    if (this.kills(k) === 1) Input.toast = { msg: `Bestiaire : ${b.name}`, t: 2 };
    else if (!was && this.full(b)) Input.toast = { msg: `Fiche complète : ${b.name}`, t: 2 };
  },
  seen(e) { const k = e.constructor.name; if (!BEASTS.some(b => b.k === k)) return; SAVE.seen = SAVE.seen || {}; SAVE.seen[k] = 1; },
  // récompenses du sage
  claim(G) {
    const n = this.nFull(), got = SAVE.bestRew || 0, steps = [[5, 'money'], [12, 'loupe'], [BEASTS.length, 'encyclo']];
    const next = steps.find(([need], i) => i >= got && n >= need); if (!next) return false;
    SAVE.bestRew = steps.indexOf(next) + 1;
    if (next[1] === 'money') { Wallet.add(50); G.say([{ who: 'Le sage', text: `Cinq fiches complètes dans ton bestiaire ! Tu observes bien. Prends ces 50 écus.` }]); }
    if (next[1] === 'loupe') { SAVE.loupe = true; G.raise('loupe'); G.say([{ who: 'Le sage', text: 'Douze fiches ! Tiens, ma vieille loupe : tu verras combien de forces il reste à tes adversaires.' }]); }
    if (next[1] === 'encyclo') { SAVE.encyclo = true; G.raise('encyclo'); G.say([{ who: 'Le sage', text: 'Le bestiaire complet ! Tiens, ce livre est tombé de la faille il y a longtemps. Une « encyclopédie illustrée pour enfants »… Il est à toi.' }]); }
    persist(); return true;
  },
};
function sageTalk(G) { if (Bestiary.claim(G)) return; G.say(Story.talk('sage')); }

// ===== 5. le marché qui vit =====
const Market = {
  promo: null,
  // tirée à chaque retour au village depuis une autre région
  roll() {
    const cands = [];
    for (const sid of ['forge', 'epicerie', 'comptoir', 'cuisine', 'herboriste']) { const sh = Shop.def(sid); if (!sh) continue; for (const e of sh.items) { const st = Shop.state(sid, e); if (!st.gone && !e.cost) cands.push({ shop: sid, id: e.id }); } }
    this.promo = cands.length ? cands.at(Math.floor(Math.random() * cands.length)) : null;
  },
  price(sid, e) { return this.promo && this.promo.shop === sid && this.promo.id === e.id ? Math.round(e.price * 0.7) : e.price; },
  isPromo(sid, e) { return !!(this.promo && this.promo.shop === sid && this.promo.id === e.id); },
  gossip() { if (!this.promo) return null; const it = Inventory.item(this.promo.id), sh = Shop.def(this.promo.shop); return `Il paraît que ${sh.keeper} fait une promo sur ${it.name.toLowerCase()} ! Trente pour cent de moins. Cours-y, ça ne durera pas.`; },
};
// fanion de promotion devant la boutique (carte peinte)
class PromoFlag {
  constructor(shop, x, y) { this.shop = shop; this.x = x; this.y = y; this.t = 0; }
  get dead() { return !Market.promo || Market.promo.shop !== this.shop; }
  update(dt) { this.t += dt; }
  draw() { hi(this.x, this.y, false, () => { D(-1, -40, 2, 40, '#5a3418'); const w = Math.sin(this.t * 4) * 2; D(1, -40, 16 + w, 10, '#e84a5a'); D(1, -36, 16 + w, 2, '#ffd23a'); }); text('-30%', this.x + 9, this.y - 21, { size: 4.5, align: 'center', color: '#fff', bold: true }); }
}
// le colporteur : une région différente selon l'heure de la tour-horloge
const PEDDLER_SPOTS = { 1: ['collines', 34, 30], 2: ['foret', 34, 26], 3: ['montagne', 20, 36], 4: ['lac', 30, 20], 5: ['cote', 20, 24], 6: ['terres', 30, 30] };
const PEDDLER_WARES = [
  { id: 'bouteille', price: 120, key: 'peddler_bottle', label: 'Bouteille vide' },
  { id: 'quart_coeur', price: 220, key: 'peddler_heart', label: 'Cœur de cristal' },
  { id: 'appat', price: 80, key: 'peddler_bait', label: 'Appât doré' },
];
class Peddler {
  constructor(x, y) { this.x = x; this.y = y; this.w = 40; this.h = 12; this.solid = true; this.t = 0; this.light = { r: 40, c: 'rgba(255,210,140,' }; }
  canInteract() { return true; }
  interact(G) {
    const wares = PEDDLER_WARES.filter(w => !SAVE[w.key]), pawn = Object.keys(SAVE.pawn || {}).filter(k => SAVE.pawn[k]);
    const opts = [...wares.map(w => `${w.label} : ${w.price} écus`), 'Vendre un souvenir', ...(pawn.length ? ['Racheter un souvenir'] : []), 'Rien'];
    G.ask([{ who: 'Le colporteur', text: 'Approche, approche ! Des merveilles de tout le royaume. Et dis donc, tes habits… tu les vends ?' }], opts, i => {
      const o = opts.at(i);
      if (i < wares.length) { const w = wares.at(i); if (Wallet.get() < w.price) { SFX.nope(); return G.say([{ who: 'Le colporteur', text: 'Pas assez d\'écus ! Reviens plus riche.' }]); } Wallet.spend(w.price); SAVE[w.key] = true; if (w.id === 'appat') SAVE.appat = true; else Inventory.give(w.id); persist(); SFX.buy(); G.raise(w.id); G.say([{ who: 'Le colporteur', text: w.id === 'appat' ? 'Un appât doré : les poissons dorés ne lui résistent pas. Enfin, un peu moins.' : 'Affaire conclue ! Une pièce unique.' }]); }
      else if (o === 'Vendre un souvenir') {
        const own = Object.keys(SOUVENIRS).filter(k => SAVE.souv && SAVE.souv[k]).slice(0, 4);
        if (!own.length) return G.say([{ who: 'Le colporteur', text: 'Tu n\'as rien de ton monde à me vendre ? Dommage.' }]);
        G.ask([{ who: 'Le colporteur', text: 'Ces objets étranges de ton monde… je t\'en donne 250 écus pièce ! (Sans eux, pas de collection complète.)' }], [...own.map(k => SOUVENIRS[k].name), 'Non, je les garde'], j => { if (j < own.length) { const k = own.at(j); SAVE.souv[k] = false; SAVE.pawn = SAVE.pawn || {}; SAVE.pawn[k] = true; Wallet.add(250); persist(); SFX.coin(); G.say([{ who: 'Le colporteur', text: 'Marché conclu ! Je te le garde un moment, au cas où tu le regretterais. Pour 300 écus.' }]); } });
      } else if (o === 'Racheter un souvenir') {
        const list = pawn.slice(0, 4);
        G.ask([{ who: 'Le colporteur', text: 'Tu le regrettes, hein ? 300 écus et il est à toi.' }], [...list.map(k => SOUVENIRS[k].name), 'Non'], j => { if (j < list.length) { if (Wallet.get() < 300) { SFX.nope(); return G.say([{ who: 'Le colporteur', text: 'Il manque des écus !' }]); } const k = list.at(j); Wallet.spend(300); SAVE.pawn[k] = false; SAVE.souv[k] = true; persist(); SFX.buy(); G.raise('souv_' + k); } });
      }
    });
  }
  update(dt) { this.t += dt; }
  draw() {
    ell(this.x, this.y, 24, 5, 'rgba(0,0,0,.35)');
    hi(this.x, this.y, false, () => {
      // l'âne
      D(-46, -22, 20, 12, '#8a7a6a'); D(-50, -30, 8, 12, '#8a7a6a'); D(-52, -36, 3, 7, '#6a5a4a'); D(-46, -36, 3, 7, '#6a5a4a'); D(-48, -26, 2, 2, '#14101a'); D(-44, -10, 3, 10, '#5a4a3a'); D(-32, -10, 3, 10, '#5a4a3a');
      // la charrette et sa bâche
      D(-20, -26, 52, 18, '#7a4a24'); D(-20, -26, 52, 3, '#a06a34'); D(-22, -46, 56, 22, '#e8d8b0'); D(-22, -46, 56, 4, '#c8a070'); for (let i = 0; i < 4; i++) D(-18 + i * 14, -42, 6, 16, '#d84a5a');
      D(-12, -10, 12, 10, '#3a2410'); D(18, -10, 12, 10, '#3a2410'); D(-8, -6, 4, 4, '#8a6a4a'); D(22, -6, 4, 4, '#8a6a4a');
      // le colporteur
      D(36, -28, 12, 18, '#4a6a3a'); D(37, -38, 10, 10, '#e8c8a0'); D(35, -42, 14, 5, '#8a4a2a'); D(38, -10, 4, 10, '#3a2a1a'); D(44, -10, 4, 10, '#3a2a1a'); D(40, -34, 2, 2, '#14101a'); D(44, -34, 2, 2, '#14101a');
    });
  }
}
function peddlerSpawn(A) {
  const f = SAVE.fragments || 0, s = PEDDLER_SPOTS[Math.min(6, f)]; if (!s || s[0] !== A.id || SAVE.boss6) return;
  A.ents.push(new Peddler(s[1] * TS, s[2] * TS));
}

// ===== 6. revendre et échanger =====
const WANTED = ['champignons', 'poisson_petit', 'minerai', 'herbe', 'cristal', 'plume', 'ecaille'];
const Sell = {
  wanted: () => WANTED.at((SAVE.fragments || 0) % WANTED.length),
  price(id) { return Math.round(MATS[id].price * (id === this.wanted() ? 1.5 : 1)); },
};
function amandineTalk(G) {
  const sh = Shop.def('comptoir');
  G.ask([{ who: sh.keeper, text: sh.hello }], ['Acheter', 'Vendre', 'Rien'], i => {
    if (i === 0) return G.say([{ who: sh.keeper, text: 'Approche-toi d\'un article et appuie sur A pour l\'acheter.' }]);
    if (i !== 1) return;
    const own = Mats.owned().filter(id => !MATS[id].rare || Mats.n(id) > 0).sort((a, b) => (MATS[a].rare ? 1 : 0) - (MATS[b].rare ? 1 : 0) || Sell.price(b) * Mats.n(b) - Sell.price(a) * Mats.n(a)).slice(0, 4); // les matériaux de forge en dernier
    const w = MATS[Sell.wanted()].name.toLowerCase();
    if (!own.length) return G.say([{ who: sh.keeper, text: `Tu n'as rien à vendre. Cette semaine, je cherche surtout : ${w}. Je paie bien !` }]);
    G.ask([{ who: sh.keeper, text: `Montre-moi ça. Cette semaine, je paie plus cher : ${w}.` }], [...own.map(id => `${MATS[id].name} ×${Mats.n(id)} : ${Sell.price(id) * Mats.n(id)} écus`), 'Rien'], k => {
      if (k >= own.length) return;
      const id = own.at(k), n = Mats.n(id), gain = Sell.price(id) * n;
      if (MATS[id].rare) return G.ask([{ who: sh.keeper, text: `${MATS[id].name} ? Bertrand en a besoin pour la forge, tu es sûr${Heroes.def().he === 'elle' ? 'e' : ''} ?` }], ['Vendre', 'Je le garde'], c => { if (c === 0) doSell(id, n, gain); });
      doSell(id, n, gain);
    });
    function doSell(id, n, gain) { Inventory.useIngredient(id, n); Wallet.add(gain); persist(); SFX.coin(); G.say([{ who: sh.keeper, text: pick([`${gain} écus, marché conclu !`, `Une ${MATS[id].name.toLowerCase()} ? Je connais quelqu'un qui va pleurer de joie. ${gain} écus.`, `Parfait. ${gain} écus, et pas un de plus. Enfin… si, un. Non. ${gain}.`]) }]); }
  });
}
// la chaîne d'échanges
const TROC = [
  { from: 'pierrette', give: 'oeuf', need: () => Quests.st('poules') === 2, text: ['Pierrette', 'Pour te remercier d\'avoir rattrapé mes poules : un œuf énorme ! Je ne sais pas laquelle l\'a pondu. Prends-le, il me fait peur.'] },
  { from: 'berger', take: 'oeuf', give: 'laine', text: ['Le berger', 'Un œuf pareil ? Mes moutons n\'en reviendraient pas. Je te l\'échange contre une pelote de laine de ma meilleure brebis.'] },
  { from: 'bucheron', take: 'laine', give: 'manche', text: ['Le bûcheron', 'De la laine ! Ma femme va enfin arrêter de se plaindre de mes chaussettes. Tiens, un manche d\'outil sculpté.'] },
  { from: 'gnome', take: 'manche', give: 'pioche', text: ['Le gnome', 'Un manche à taille humaine ? Parfait pour une pioche de gnome ! Voilà la mienne, elle est un peu petite pour toi.'] },
  { from: 'pecheur', take: 'pioche', give: 'carte_marine', text: ['Le pêcheur', 'Une pioche de gnome ! Je vais pouvoir creuser pour trouver des vers. Prends cette vieille carte marine.'] },
  { from: 'gardien', take: 'carte_marine', give: 'longue_vue', text: ['Le gardien du phare', 'La carte des récifs ! Je la cherchais depuis trente ans. Tiens, ma longue-vue : je n\'en ai plus besoin, j\'ai la carte.'] },
  { from: 'ermite', take: 'longue_vue', give: 'boussole', text: ['L\'ermite', 'Une longue-vue… pour voir venir les visiteurs et me cacher à temps. Merci. Voici ma boussole : elle n\'indique pas le nord, elle indique les secrets.'] },
];
const TROC_ITEMS = { oeuf: 'Œuf énorme', laine: 'Pelote de laine', manche: 'Manche sculpté', pioche: 'Pioche de gnome', carte_marine: 'Carte marine', longue_vue: 'Longue-vue', boussole: 'Boussole des secrets' };
const Troc = {
  step: () => SAVE.troc || 0,
  held() { const s = this.step(); return s > 0 ? TROC.at(s - 1).give : null; },
  key(npc) { return npc.o.gnome ? 'gnome' : npc.o.look || null; },
  talk(npc, G) {
    const s = this.step(); if (s >= TROC.length) return false;
    const T = TROC.at(s); if (this.key(npc) !== T.from) return false;
    if (T.need && !T.need()) return false;
    if (T.take && this.held() !== T.take) return false;
    SAVE.troc = s + 1; persist(); SFX.secret(); G.raise('troc_' + T.give);
    G.say([{ who: T.text[0], text: T.text[1] }, { text: `Tu as obtenu : ${TROC_ITEMS[T.give]}.` + (T.give === 'boussole' ? ' Quand un secret est proche, elle tremble.' : '') }]);
    return true;
  },
};

// ===== 7. les petits métiers =====
// cueillette : des plantes repoussent à chaque visite
class Forage {
  constructor(x, y, kind) { this.x = x; this.y = y; this.kind = kind; this.t = rand(0, 5); this.w = 8; this.h = 6; }
  update(dt, G) {
    this.t += dt; const P = G.player;
    if (rectHit({ x: this.x - 6, y: this.y - 8, w: 12, h: 10 }, P.body())) { this.dead = true; Mats.add(this.kind, 1, G); SFX.pickup(); G.parts.burst(this.x, this.y - 4, 6, { c: ['#9aff9a', '#fff'], life: 0.3, r: 1 }); }
  }
  draw() { ell(this.x, this.y, 4, 1.5, 'rgba(0,0,0,.3)'); drawMatIcon(this.kind, this.x, this.y - 5 + Math.sin(this.t * 2) * 0.5, 0.8); if (this.kind === 'herbe_rare' && Math.floor(this.t * 3) % 2) R(half(this.x + 3), half(this.y - 9), 1, 1, '#fff'); }
}
// minerai : rochers brillants, cassés par un pétard ou un coup chargé
class OreRock {
  constructor(x, y) { this.x = x; this.y = y; this.w = 16; this.h = 8; this.solid = true; this.t = rand(0, 5); this.blastR = 18; }
  onBlast(G) { this.smash(G); }
  onSpin(G) { if (Upg.lv('epee') >= 1) this.smash(G); }
  canInteract() { return true; }
  interact(G) { G.say([{ text: 'Un rocher qui brille. Il faudrait un pétard pour le casser… ou un sacré coup d\'épée.' }]); }
  smash(G) {
    if (this.dead) return; this.dead = true; SFX.boom(); G.shake = 0.2;
    G.parts.burst(this.x, this.y - 8, 18, { c: ['#6a6478', '#8a8498', '#c8a0a0'], life: 0.6, smin: 30, smax: 100, r: 2, g: 200 });
    G.area.ents.push(new Pickup(this.x - 4, this.y, 'mat_minerai')); if (Math.random() < 0.25) G.area.ents.push(new Pickup(this.x + 5, this.y, 'mat_cristal'));
  }
  update(dt) { this.t += dt; }
  draw() {
    ell(this.x, this.y, 9, 3, 'rgba(0,0,0,.4)');
    hi(this.x, this.y, false, () => { D(-14, -18, 28, 18, '#5a5468'); D(-12, -22, 22, 6, '#7a7488'); D(-14, -4, 28, 4, '#3a3448'); const g = Math.sin(this.t * 3) > 0.6; D(-6, -14, 4, 4, g ? '#fff' : '#d8b0a0'); D(4, -10, 4, 3, '#c8a0a0'); D(-2, -18, 3, 3, '#e8c0b0'); });
  }
}
// placement des ressources dans une zone (sur des cases libres, tirées au hasard à chaque visite)
function spawnResources(A) {
  const spec = { collines: [['herbe', 9]], foret: [['champignons', 9]], montagne: [['ore', 6]], terres: [['ore', 3]] }[A.id]; if (!spec) return;
  const free = [];
  for (let y = 4; y < A.g.length - 4; y++) for (let x = 4; x < A.g[0].length - 4; x++) if (A.g[y][x] === '.' && A.g[y + 1][x] === '.' && A.g[y][x + 1] === '.') free.push([x, y]);
  for (const [kind, n] of spec) for (let i = 0; i < n && free.length; i++) {
    const [x, y] = free.splice(Math.floor(Math.random() * free.length), 1)[0];
    if (kind === 'ore') A.ents.push(new OreRock(x * TS + 8, y * TS + 12));
    else A.ents.push(new Forage(x * TS + 8, y * TS + 12, kind === 'herbe' && (SAVE.fragments || 0) >= 3 && Math.random() < 0.25 ? 'herbe_rare' : kind));
  }
}
// pêche : la canne du pêcheur, face à l'eau
const FISH_TABLE = { lac: [0.62, 0.3], cote: [0.5, 0.36] }; // petit, gros, (le reste : doré)
const Fishing = {
  start(G) {
    const P = G.player, [dx, dy] = DV[P.dir], bx = P.x + dx * 28, by = P.y + dy * 22;
    if (G.area.tileAt(bx, by - 2) !== '~') { SFX.nope(); Input.toast = { msg: 'Il faut lancer la ligne dans l\'eau.', t: 1.5 }; return; }
    SFX.throw(); G.fish = { t: 0, phase: 'wait', bite: rand(1.5, 4), bx, by, cur: 0, dir: 1, zone: 0.25, size: 0 };
    G.state = 'fish';
  },
  update(dt, G) {
    const f = G.fish; f.t += dt; G.parts.update(dt);
    if (Input.pressed('b') && f.phase !== 'gauge') { G.fish = null; G.state = 'play'; return; }
    if (f.phase === 'wait' && f.t > f.bite) { f.phase = 'bite'; f.t = 0; SFX.splash(); }
    else if (f.phase === 'bite') { if (Input.pressed('a')) { f.phase = 'gauge'; f.t = 0; const r = Math.random(), T = FISH_TABLE[G.area.id] || FISH_TABLE.lac, gold = (1 - T[0] - T[1]) * (SAVE.appat ? 3 : 1); f.kind = r < gold ? 'poisson_dore' : r < gold + T[1] ? 'poisson_grand' : 'poisson_petit'; f.zone = { poisson_petit: 0.3, poisson_grand: 0.2, poisson_dore: 0.12 }[f.kind]; f.zc = rand(0.25, 0.75); } else if (f.t > 0.9) { G.fish = null; G.state = 'play'; Input.toast = { msg: 'Trop tard, il s\'est sauvé !', t: 1.5 }; } }
    else if (f.phase === 'gauge') {
      const sp = { poisson_petit: 1.1, poisson_grand: 1.5, poisson_dore: 2 }[f.kind];
      f.cur += f.dir * sp * dt; if (f.cur > 1) { f.cur = 1; f.dir = -1; } if (f.cur < 0) { f.cur = 0; f.dir = 1; }
      if (Input.pressed('a')) {
        G.fish = null; G.state = 'play';
        if (Math.abs(f.cur - f.zc) <= f.zone / 2) {
          const cm = Math.round({ poisson_petit: rand(12, 25), poisson_grand: rand(30, 60), poisson_dore: rand(40, 80) }[f.kind]);
          Mats.add(f.kind, 1); SAVE.fishRec = Math.max(SAVE.fishRec || 0, cm); persist(); SFX.secret(); G.raise('mat_' + f.kind);
          G.say([{ text: `${MATS[f.kind].name} : ${cm} cm !` + (cm >= (SAVE.fishRec || 0) ? ' Nouveau record !' : '') }]);
        } else { SFX.nope(); Input.toast = { msg: 'La ligne a cassé… raté !', t: 1.6 }; }
      }
    }
  },
  draw(G) {
    const f = G.fish; if (!f) return; const P = G.player, cx = G.cam.x, cy = G.cam.y;
    const bx = f.bx - cx, by = f.by - cy + (f.phase === 'bite' ? 2 + Math.sin(f.t * 30) : Math.sin(f.t * 3) * 0.6);
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(P.x - cx + DV[P.dir][0] * 8, P.y - cy - 16); ctx.lineTo(bx, by - 2); ctx.stroke();
    R(bx - 1.5, by - 3, 3, 3, '#e84a5a'); R(bx - 1.5, by - 3, 3, 1, '#fff');
    if (f.phase === 'bite') text('!', P.x - cx, P.y - cy - 46, { size: 14, align: 'center', color: PAL.warm, bold: true });
    if (f.phase === 'wait') text('… (B : ranger la canne)', W / 2, H - 20, { size: 7, align: 'center', color: '#c8d0f0' });
    if (f.phase === 'gauge') {
      const gx = W / 2 - 80, gy = H - 40; R(gx - 2, gy - 2, 164, 14, 'rgba(7,13,31,.85)'); R(gx, gy, 160, 10, '#2a3a6a');
      R(gx + (f.zc - f.zone / 2) * 160, gy, f.zone * 160, 10, '#5ac85a'); R(gx + f.cur * 160 - 1, gy - 3, 3, 16, '#fff');
      text('A : ferrer quand le curseur est dans le vert', W / 2, gy - 12, { size: 7, align: 'center', color: '#c8d0f0' });
    }
  },
};
// cuisine de Mamie
const RECIPES = [
  { id: 'soupe_jardin', need: { champignons: 2 } },
  { id: 'soupe_pecheur', need: { poisson_petit: 1, herbe: 1 } },
  { id: 'bouillon', need: { cristal: 1, champignons: 1 } },
  { id: 'veloute', need: { herbe_rare: 2 } },
  { id: 'soupe_doree', need: { poisson_dore: 1 } },
];
const recipeOk = r => Object.entries(r.need).every(([k, n]) => Mats.n(k) >= n);
const recipeTxt = r => Object.entries(r.need).map(([k, n]) => `${n} ${MATS[k].name.toLowerCase()}`).join(' + ');
function mamieTalk(G) {
  const sh = Shop.def('cuisine');
  G.ask([{ who: 'Mamie', text: 'Mon petit ! Tu as faim ? Tu m\'apportes des ingrédients et une bouteille vide, et je te fais une soupe.' }], ['Acheter', 'Cuisiner', 'Rien'], i => {
    if (i === 0) return G.say([{ who: sh.keeper, text: 'Approche-toi d\'un article et appuie sur A pour l\'acheter.' }]);
    if (i !== 1) return;
    if (!Inventory.hasEmptyBottle()) return G.say([{ who: 'Mamie', text: 'Il me faut une bouteille vide pour y verser la soupe. Je ne vais pas te la donner dans les mains !' }]);
    const list = RECIPES.filter(recipeOk).slice(0, 4);
    if (!list.length) return G.say([{ who: 'Mamie', text: 'Tu n\'as pas de quoi faire une soupe. Voilà mes recettes :' }, ...RECIPES.map(r => ({ who: 'Mamie', text: `${Inventory.item(r.id).name} : ${recipeTxt(r)}. ${Inventory.item(r.id).desc}` }))]);
    G.ask([{ who: 'Mamie', text: 'Qu\'est-ce que je te prépare ?' }], [...list.map(r => Inventory.item(r.id).name), 'Rien'], k => {
      if (k >= list.length) return; const r = list.at(k);
      for (const [m, n] of Object.entries(r.need)) Inventory.useIngredient(m, n);
      Inventory.give(r.id); SAVE.recipes = SAVE.recipes || {}; SAVE.recipes[r.id] = true; persist(); SFX.drink(); G.raise(r.id);
      G.say([{ who: 'Mamie', text: pick(['Et voilà, bien chaude ! Ne te brûle pas la langue.', 'Une recette de ta grand-mère, c\'est-à-dire de moi.', 'Bois-la quand tu en auras besoin, mon cœur.']) }, { text: `${Inventory.item(r.id).name} : ${Inventory.item(r.id).desc}` }]);
    });
  });
}
// effets des soupes au moment de les boire
function applyDrinkFx(it, P) {
  if (!it.fx) return;
  if (it.fx.inv) P.inv = Math.max(P.inv, it.fx.inv);
  if (it.fx.def) Effects.add('def', it.fx.def);
  if (it.fx.light) Effects.add('light', it.fx.light);
  if (it.fx.bonus) P.bonusHp = 2;
  if (it.fx.swim) Effects.add('swim', it.fx.swim);
}

// ===== boussole des secrets : indique le coffre ou le cœur caché le plus proche =====
function compassTarget(G) {
  if (!(SAVE.troc >= TROC.length)) return null; const P = G.player; let best = null, bd = 220;
  for (const e of G.area.ents) {
    if (e.dead || (e.room != null && G.area.rooms && e.room !== G.room)) continue;
    const secret = (e instanceof Chest && !e.open && !e.hidden) || e instanceof HeartContainer || (e.isPickup && e.kind === 'heartpiece');
    if (!secret) continue; const d = dist(P.x, P.y, e.x, e.y); if (d < bd) { bd = d; best = e; }
  }
  return best;
}
