'use strict';
// ---------- quêtes secondaires : une par zone, chacune rapporte un objet du monde réel (anachronique) ----------

// les souvenirs : objets du monde normal, perdus dans le royaume (et une petite récompense en plus)
const SOUVENIRS = {
  rubik:      { name: 'Rubik\'s Cube', desc: 'Les poules couvaient ce drôle de dé à six couleurs.', bonus: 'money:40' },
  casque:     { name: 'Casque audio', desc: 'Le berger l\'appelait « le serre-tête qui chante ». La batterie est morte.', bonus: 'quart_coeur' },
  lampe:      { name: 'Lampe de poche', desc: 'Le bûcheron la prenait pour une luciole en bouteille.', bonus: 'money:50' },
  smartphone: { name: 'Smartphone', desc: '« Pas de réseau. » Évidemment : on est au Moyen Âge.', bonus: 'quart_coeur' },
  photo:      { name: 'Appareil photo instantané', desc: 'Pris dans le filet du pêcheur. Il reste une photo… floue.', bonus: 'money:50' },
  switch:     { name: 'Console de jeu portable', desc: 'L\'artificière croyait que c\'était une fusée en panne.', bonus: 'quart_coeur' },
  ballon:     { name: 'Ballon de foot', desc: 'L\'ermite l\'appelait « la lune qui rebondit ».', bonus: 'quart_coeur' },
};
function drawSouvenir(id, x, y, s = 1) {
  hi(x, y, false, () => {
    const u = 2 * s;
    if (id === 'rubik') { const c = ['#e83a3a', '#3a8ae8', '#e8c83a', '#3ac85a', '#f4f4f4', '#ff8a2a']; for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) D((-5 + i * 3.4) * u, (-5 + j * 3.4) * u, 3 * u, 3 * u, c[(i + j * 2) % 6]); }
    if (id === 'casque') { D(-6 * u, -6 * u, 12 * u, 2 * u, '#3a3a42'); D(-7 * u, -5 * u, 2 * u, 6 * u, '#3a3a42'); D(5 * u, -5 * u, 2 * u, 6 * u, '#3a3a42'); D(-8 * u, 0, 4 * u, 5 * u, '#e83a5a'); D(4 * u, 0, 4 * u, 5 * u, '#e83a5a'); }
    if (id === 'lampe') { D(-2 * u, -2 * u, 4 * u, 8 * u, '#3a3a42'); D(-3 * u, -5 * u, 6 * u, 3 * u, '#c8c8d0'); D(-2 * u, -6 * u, 4 * u, 1 * u, '#fff6c0'); D(-1 * u, 1 * u, 2 * u, 2 * u, '#e83a3a'); }
    if (id === 'smartphone') { D(-3.5 * u, -6 * u, 7 * u, 12 * u, '#1a1a22'); D(-3 * u, -5 * u, 6 * u, 9 * u, '#3a6ab0'); D(-2 * u, -4 * u, 2 * u, 2 * u, '#8ff3ea'); D(1 * u, -4 * u, 2 * u, 2 * u, '#ffcf3a'); D(-1 * u, 4.5 * u, 2 * u, 1 * u, '#5a5a62'); }
    if (id === 'photo') { D(-6 * u, -4 * u, 12 * u, 9 * u, '#f0ece4'); D(-6 * u, -4 * u, 12 * u, 2 * u, '#e83a3a'); ell(0, 1 * u, 3 * u, 3 * u, '#2a2a32'); ell(0, 1 * u, 1.6 * u, 1.6 * u, '#5a8ac8'); D(3 * u, -3 * u, 2 * u, 1 * u, '#3a3a42'); }
    if (id === 'switch') { D(-7 * u, -3.5 * u, 3 * u, 7 * u, '#3ab8e8'); D(4 * u, -3.5 * u, 3 * u, 7 * u, '#e84a4a'); D(-4 * u, -3.5 * u, 8 * u, 7 * u, '#2a2a32'); D(-3.5 * u, -3 * u, 7 * u, 6 * u, '#5a7ab0'); }
    if (id === 'ballon') { ell(0, 0, 6 * u, 6 * u, '#f4f4f4'); D(-1.5 * u, -1.5 * u, 3 * u, 3 * u, '#1a1a22'); D(-5 * u, -1 * u, 2 * u, 2 * u, '#1a1a22'); D(3 * u, -1 * u, 2 * u, 2 * u, '#1a1a22'); D(-1 * u, -5.5 * u, 2 * u, 2 * u, '#1a1a22'); D(-1 * u, 3.5 * u, 2 * u, 2 * u, '#1a1a22'); }
  }, 1);
}
const L2 = (who, text, face, faceOf) => Object.assign({ who, text }, face ? { face } : {}, faceOf ? { faceOf } : {});
const QUESTS = {
  poules: { zone: 'royaume', souv: 'rubik', need: 3, unit: 'poules',
    start: [L2('Pierrette', 'Tu tombes bien, toi, avec ton drôle de pyjama ! Mes trois poules se sont échappées dans le village.'), L2('Pierrette', 'Attrape-les et ramène-les-moi. Elles détestent qu\'on leur coure après… mais elles adorent les gens habillés bizarrement.')],
    wait: [L2('Pierrette', 'Il me manque encore des poules. Fouille bien le village !')],
    done: [L2('Pierrette', 'Mes cocottes ! Toutes les trois !'), L2('Pierrette', 'En nettoyant le poulailler, j\'ai trouvé ce dé à six couleurs. Les poules le couvaient. Prends-le, il te ressemble.')],
    after: [L2('Pierrette', 'Les poules pondent de nouveau. Merci, l\'étranger{e} aux habits étranges !')] },
  cloche: { zone: 'collines', souv: 'casque', need: 5, unit: 'ratons laveurs',
    start: [L2('Le berger', 'Ces ratons laveurs embêtent mes moutons toute la nuit. Et la nuit dure depuis cent ans…'), L2('Le berger', 'Chasse-m\'en cinq dans les collines, et je te donnerai un trésor tombé du ciel.')],
    wait: [L2('Le berger', 'Ils sont encore là, je les entends ricaner. Courage !')],
    done: [L2('Le berger', 'Mes moutons dorment enfin ! Tiens, mon trésor tombé du ciel.'), L2('Le berger', 'C\'est un serre-tête qui chante… enfin, qui chantait. Toi qui t\'habilles comme un saltimbanque, tu sauras peut-être le réparer.')],
    after: [L2('Le berger', 'Bêêê. Pardon, l\'habitude.')] },
  hache: { zone: 'foret', souv: 'lampe', need: 1,
    start: [L2('Le bûcheron', 'J\'ai perdu ma hache dans les fourrés au nord-ouest de la forêt. Une hache de bûcheron, ça ne se remplace pas !'), L2('Le bûcheron', 'Et pourquoi tu portes des chaussures en caoutchouc ? Il pleut chez toi ?')],
    wait: [L2('Le bûcheron', 'Ma hache est quelque part au nord-ouest, près des gros arbres.')],
    done: [L2('Le bûcheron', 'Ma hache ! Ma belle hache !'), L2('Le bûcheron', 'Prends cette luciole en bouteille. Elle s\'allume quand on appuie dessus, c\'est magique.')],
    after: [L2('Le bûcheron', 'Je coupe, je coupe… Mais les arbres repoussent toujours la nuit.')] },
  lettre: { zone: 'montagne', souv: 'smartphone', need: 1,
    start: [L2('Le gnome', 'Hé, grand échalas ! Oui toi, avec tes vêtements de clown.'), L2('Le gnome', 'Porte cette lettre à mon cousin le pêcheur, au bord du lac. Il te donnera une récompense, foi de gnome.')],
    wait: [L2('Le gnome', 'La lettre ! Au pêcheur ! Au bord du lac ! Il faut tout répéter aux grands.')],
    done: [], after: [L2('Le gnome', 'Mon cousin a répondu ? Il est toujours aussi bavard que ses poissons.')] },
  filet: { zone: 'lac', souv: 'photo', need: 1,
    start: [L2('Le pêcheur', 'Mon filet est tombé au fond du lac, près de la plage du sud-ouest. Sans palmes, impossible de plonger…'), L2('Le pêcheur', 'Et toi, avec ta drôle de tenue, tu sais nager ?')],
    wait: [L2('Le pêcheur', 'Mon filet est au fond, côté sud-ouest. Il faut plonger.')],
    done: [L2('Le pêcheur', 'Mon filet ! Et regarde ce qu\'il y avait dedans : une boîte qui crache des images !'), L2('Le pêcheur', 'Garde-la. Moi, les images, ça me fait peur.')],
    after: [L2('Le pêcheur', 'Les poissons mordent mieux depuis que tu es là. Ou alors c\'est tes habits qui les attirent.')] },
  feux: { zone: 'cote', souv: 'switch', need: 3, unit: 'feux',
    start: [L2('L\'artificière', 'Les trois feux de la côte sont éteints depuis cent ans. Sans eux, les bateaux se perdent.'), L2('L\'artificière', 'Il faudrait une bonne explosion pour les rallumer. Tu as des pétards, toi, sous ce costume de carnaval ?')],
    wait: [L2('L\'artificière', 'Il reste des feux éteints sur la côte. Un pétard bien placé, et boum !')],
    done: [L2('L\'artificière', 'Les trois feux brillent ! Quel spectacle !'), L2('L\'artificière', 'Tiens, ma plus belle fusée ratée. Elle a deux boutons de couleur et elle ne décolle pas.')],
    after: [L2('L\'artificière', 'Un jour, je ferai un feu d\'artifice qui fera lever le soleil.')] },
  ombres: { zone: 'terres', souv: 'ballon', need: 5, unit: 'ombres',
    start: [L2('L\'ermite', 'Les ombres rôdent autour de ma cabane. Elles me volent mes chaussettes.'), L2('L\'ermite', 'Chasses-en cinq, et tu auras ma lune qui rebondit. Au fait, tes habits viennent de quelle planète ?')],
    wait: [L2('L\'ermite', 'Encore des ombres dehors. Et encore des chaussettes en moins.')],
    done: [L2('L\'ermite', 'Plus une ombre ! Mes chaussettes sont sauvées.'), L2('L\'ermite', 'Prends ma lune qui rebondit. Elle rebondit vraiment, regarde !')],
    after: [L2('L\'ermite', 'Je vais enfin pouvoir dormir. Enfin… s\'il fait jour un jour.')] },
};
const Quests = {
  st(id) { return (SAVE.q || {})[id] || 0; },
  count(id) { return (SAVE.qc || {})[id] || 0; },
  add(id, n = 1) { SAVE.qc[id] = this.count(id) + n; persist(); const q = QUESTS[id]; if (q.unit && this.count(id) <= q.need) Input.toast = { msg: `${Math.min(this.count(id), q.need)} / ${q.need} ${q.unit}`, t: 1.8 }; },
  complete(id) { return this.count(id) >= QUESTS[id].need; },
  // dialogue du donneur de quête
  talk(id, G) {
    const q = QUESTS[id], s = this.st(id);
    if (s === 0) { SAVE.q[id] = 1; persist(); G.say(Story.lines(q.start), () => { Input.toast = { msg: 'Nouvelle quête !', t: 2 }; SFX.secret(); if (G.area.respawnQuest) G.area.respawnQuest(); }); return; }
    if (s === 1 && this.complete(id) && q.done.length) { this.reward(id, G, q.done); return; }
    G.say(Story.lines(s === 2 ? q.after : q.wait));
  },
  reward(id, G, lines) {
    const q = QUESTS[id], S = SOUVENIRS[q.souv];
    SAVE.q[id] = 2; SAVE.souv[q.souv] = true;
    if (S.bonus.startsWith('money:')) Wallet.add(Number(S.bonus.slice(6))); else Inventory.give(S.bonus);
    persist(); SFX.chest(); G.raise('souv_' + q.souv);
    const n = Object.keys(SAVE.souv).length;
    G.say(Story.lines(lines).concat(Story.lines([{ text: `Tu as obtenu : ${S.name} ! ${S.desc}` }, { text: S.bonus.startsWith('money:') ? `Et ${S.bonus.slice(6)} écus en plus.` : 'Et un cœur de cristal : ta vie maximale augmente !' }, { text: `Souvenirs du monde réel : ${n} sur 7.` + (n === 7 ? ' La collection est complète !' : '') }])));
  },
  onKill(G, e) {
    const z = G.area.id;
    if (z === 'collines' && e instanceof Raccoon && !(e instanceof Gnome) && !(e instanceof Boar) && this.st('cloche') === 1) this.add('cloche');
    if (z === 'terres' && e instanceof Shadow && this.st('ombres') === 1) this.add('ombres');
  },
};
// objets de quête qui n'apparaissent que pendant la quête
function questSpawns(A) {
  if (A.id === 'foret' && Quests.st('hache') === 1 && !Quests.complete('hache')) A.ents.push(new QuestItem(6 * TS, 11 * TS, 'hache', 'Tu as retrouvé la hache du bûcheron !'));
  if (A.id === 'lac' && Quests.st('filet') === 1 && !Quests.complete('filet')) A.ents.push(Object.assign(new DiveSpot(17 * TS, 34 * TS, 'qfilet', 'flag:qfiletOk', [{ text: 'Au fond de l\'eau, le filet du pêcheur ! Il y a quelque chose dedans…' }]), { onGet: () => Quests.add('filet') }));
  if (A.id === 'cote') for (const [i, x, y] of [[0, 8, 8], [1, 30, 6], [2, 24, 44]]) A.ents.push(new Beacon(x * TS, y * TS, i));
  A.respawnQuest = () => { if (A.id === 'royaume' || A.id === G.area.id) { const keep = A.ents.filter(e => !(e instanceof QuestItem) && !(e instanceof Chicken) && !(e instanceof Beacon)); A.ents = keep; if (A.id === 'royaume') { if (SAVE.q.poules === 1) for (const [i, x, y] of [[0, 8 * TS, 8 * TS], [1, 58 * TS, 15 * TS], [2, 20 * TS, 44 * TS]]) if (!SAVE['poule' + i]) A.ents.push(new Chicken(x, y, i)); } else questSpawns(A); } };
}
class QuestItem {
  constructor(x, y, id, msg) { this.x = x; this.y = y; this.id = id; this.msg = msg; this.w = 10; this.h = 6; this.t = 0; this.fetchable = true; }
  get light() { return { r: 30, c: 'rgba(255,230,140,' }; }
  update(dt, G) { this.t += dt; if (rectHit({ x: this.x - 7, y: this.y - 10, w: 14, h: 12 }, G.player.body())) { this.dead = true; Quests.add(this.id); SFX.chest(); G.say([{ text: this.msg }]); } }
  draw() { ell(this.x, this.y, 6, 2, 'rgba(0,0,0,.3)'); hi(this.x, this.y - 4 + Math.sin(this.t * 3), false, () => { D(-2, -16, 4, 18, '#8a5a34'); D(-8, -18, 12, 8, '#9a9eaa'); D(-8, -18, 12, 2, '#d8dce8'); }); if (Math.floor(this.t * 2) % 2) R(this.x + 5, this.y - 18, 1.5, 1.5, '#fff'); }
}
class Chicken { // une poule échappée : elle file quand on approche ; on l'attrape en la touchant
  constructor(x, y, i) { this.x = x; this.y = y; this.i = i; this.w = 8; this.h = 5; this.t = rand(0, 5); this.vx = 0; this.vy = 0; this.st = 0; this.face = 1; }
  update(dt, G) {
    this.t += dt; this.st -= dt; const P = G.player, d = dist(P.x, P.y, this.x, this.y);
    if (d < 70) { const a = Math.atan2(this.y - P.y, this.x - P.x) + rand(-0.6, 0.6); this.vx = Math.cos(a) * 62; this.vy = Math.sin(a) * 62; if (Math.random() < dt * 3) SFX.cluck(); }
    else if (this.st <= 0) { this.st = rand(0.6, 1.6); const a = rand(0, 6.28), s = Math.random() < 0.4 ? 0 : 20; this.vx = Math.cos(a) * s; this.vy = Math.sin(a) * s; }
    if (this.vx) this.face = Math.sign(this.vx);
    const h1 = moveEnt(G.area, this, this.vx * dt, 0, { noExit: true }), h2 = moveEnt(G.area, this, 0, this.vy * dt, { noExit: true }); if (h1 || h2) this.st = 0;
    if (rectHit({ x: this.x - 6, y: this.y - 9, w: 12, h: 11 }, P.body())) { this.dead = true; SAVE['poule' + this.i] = true; Quests.add('poules'); SFX.cluck(); G.parts.burst(this.x, this.y - 6, 10, { c: ['#fff', '#f0e8d8', '#ffcf3a'], life: 0.5, r: 1.5, up: 30, g: 120 }); }
  }
  draw() {
    ell(this.x, this.y, 5, 1.8, 'rgba(0,0,0,.3)');
    const f = Math.floor(this.t * 10) % 2 && (this.vx || this.vy);
    hi(this.x, this.y, this.face < 0, () => { D(-8, -16, 14, 12, '#f8f4ec'); D(4, -22, 8, 10, '#f8f4ec'); D(12, -18, 4, 3, '#ffb02e'); D(6, -26, 4, 4, '#e83a3a'); D(8, -20, 2, 2, '#1a1a1a'); D(-12, -14, 6, 6, '#e8e0d4'); D(-4, -4, 2, 4 - f * 2, '#ffb02e'); D(2, -4, 2, 2 + f * 2, '#ffb02e'); });
  }
}
class Beacon { // feu de la côte : un pétard le rallume pour de bon
  constructor(x, y, i) { this.x = x; this.y = y; this.i = i; this.w = 16; this.h = 8; this.solid = true; this.t = rand(0, 5); this.blastR = 26; }
  get lit() { return !!SAVE['beacon' + this.i]; }
  get light() { return this.lit ? { r: 90, c: 'rgba(255,170,70,', flick: true, warm: true } : null; }
  canInteract() { return !this.lit; }
  interact(G) { G.say([{ text: 'Un feu de signal éteint, plein de vieux bois sec. Il faudrait une bonne étincelle.' }]); }
  onBlast(G) { if (this.lit) return; SAVE['beacon' + this.i] = true; persist(); SFX.fuse(); G.shake = 0.2; if (Quests.st('feux') === 1) Quests.add('feux'); else Input.toast = { msg: 'Un feu de la côte se rallume !', t: 2 }; }
  update(dt, G) { this.t += dt; if (this.lit && Math.random() < dt * 8) G.parts.add({ x: this.x + rand(-6, 6), y: this.y - 24, vy: -30, life: 0.8, c: pick(['#ffb02e', '#ff7a1a', '#ffe9a0']), r: 1.5 }); }
  draw() {
    ell(this.x, this.y, 10, 3, 'rgba(0,0,0,.4)');
    const f = Math.floor(this.t * 9) % 3;
    hi(this.x, this.y, false, () => {
      D(-16, -12, 32, 12, '#6a6478'); D(-16, -12, 32, 3, '#8a8498'); D(-12, -20, 24, 8, '#5a3418'); D(-8, -26, 6, 10, '#6a4224'); D(2, -24, 6, 8, '#6a4224');
      if (this.lit) { D(-12, -40 - f * 2, 24, 22 + f, '#ff7a1a'); D(-8, -48 - f, 16, 16, '#ffb02e'); D(-4, -54 + f, 8, 10, '#ffe9a0'); }
    });
  }
}
