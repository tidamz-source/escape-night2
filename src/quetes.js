'use strict';
// ---------- les dix quêtes secondaires : elles s'ouvrent au fil des fragments d'aube ----------
// SAVE.sq[id] : 0 pas commencée, puis des étapes propres à chaque quête ; SIDE[id].done(s) dit si elle est finie.

const SQ = {
  st: id => (SAVE.sq || {})[id] || 0,
  set(id, v) { SAVE.sq = SAVE.sq || {}; SAVE.sq[id] = v; persist(); },
  start(id, G) { this.set(id, 1); Input.toast = { msg: 'Nouvelle quête : ' + SIDE[id].name, t: 2.4 }; SFX.secret(); },
  done: id => SIDE[id].done(SQ.st(id)),
  open: id => (SAVE.fragments || 0) >= SIDE[id].minFrag && (!SIDE[id].req || SIDE[id].req()),
};
const say = (who, text) => ({ who, text });
const SIDE = {
  soupe:   { name: 'La soupe chaude', giver: 'Mamie (Bourg-Luciole)', minFrag: 2, req: () => !!SAVE.freed2, done: s => s === 3,
             hint: s => s === 1 ? 'Porte la soupe au berger des Collines avant qu\'elle refroidisse !' : s === 2 ? 'La soupe a refroidi. Retourne voir Mamie.' : 'Livrée !' },
  concert: { name: 'Le concert de Mahaut', giver: 'Mahaut (Bourg-Luciole)', minFrag: 2, done: s => s === 2,
             hint: () => `Retrouve les 4 cordes du rouet-harpe dans les jarres et les buissons des Collines (${Concert.n()} / 4).` },
  livre:   { name: 'Le livre perdu du sage', giver: 'Le sage (bibliothèque)', minFrag: 1, done: s => s === 2,
             hint: () => `Retrouve les 7 feuilles perdues du grimoire (${Pages.n()} / 7). Le frisbee et le grappin rapportent ce qui est hors d'atteinte.` },
  gerard:  { name: 'Le mouton fugueur', giver: 'Le berger (Collines)', minFrag: 1, done: s => s === 2,
             hint: () => `Pousse Gérard jusqu'à l'enclos, à côté de la bergerie. On l'a vu vers ${GERARD_ZONES[(SAVE.gerard || {}).zone] || '?'}.` },
  peche:   { name: 'Le concours de pêche', giver: 'Le pêcheur (Lac)', minFrag: 3, req: () => Inventory.has('canne'), done: s => s === 2,
             hint: () => 'Ramène le plus gros poisson en 1 min 30, trois manches. Parle au pêcheur pour lancer le concours.' },
  phare:   { name: 'Le phare éteint', giver: 'Le gardien du phare (Côte)', minFrag: 4, done: s => s === 4,
             hint: s => s === 1 ? 'Fais préparer l\'huile du phare chez Mamie (un poisson doré et une herbe d\'aube).' : s === 2 ? 'Rapporte l\'huile au gardien du phare.' : s === 3 ? 'Monte en haut du phare et verse l\'huile dans la lanterne.' : 'Le phare brille.' },
  dette:   { name: 'Le colporteur endetté', giver: 'Le colporteur (partout)', minFrag: 2, done: s => s === 3,
             hint: s => s === 1 ? 'Le créancier rôde près de la carriole du colporteur. Approche-toi de lui…' : s === 2 ? 'Ce créancier a une drôle de queue rayée. Démasque-le !' : 'Dette réglée.' },
  lettre:  { name: 'La lettre d\'amour', giver: 'Pierrette (Bourg-Luciole)', minFrag: 5, done: s => s === 6,
             hint: s => [, 'Porte la lettre de Pierrette à l\'ermite (Terres de Minuit).', 'Rapporte la réponse de l\'ermite à Pierrette.', 'Porte la deuxième lettre à l\'ermite.', 'Rapporte la deuxième réponse à Pierrette.', 'Convaincs l\'ermite de venir au village.', 'Ils prennent le thé.'][s] || '' },
  fantome: { name: 'Le fantôme de 3 h', giver: 'Un fantôme (pont-levis)', minFrag: 3, req: () => !!SAVE.drawbridge, done: s => s === 2,
             hint: () => `Réponds aux énigmes du fantôme du pont-levis (${SAVE.ghostQ || 0} / 3).` },
  proces:  { name: 'Le procès du raton laveur', giver: 'Le berger (Collines)', minFrag: 3, req: () => Quests.st('cloche') === 2, done: s => s === 2,
             hint: () => `Interroge les 4 témoins (${Proces.nT()} / 4) et trouve les preuves (${Proces.nC()} / 3), puis désigne le coupable devant le berger.` },
};

// ===== dialogue avec les PNJ : les quêtes passent avant le reste =====
function sideKey(npc) { return npc.o.sq || npc.o.look || npc.o.sprite || (npc.o.gnome ? 'gnome' : null); }
function sideTalk(npc, G) {
  const k = sideKey(npc), f = SAVE.fragments || 0;
  if (k === 'claudine') return Phare.mamie(G) || Soupe.talk(G);
  if (k === 'mahaut') return Concert.talk(G);
  if (k === 'sage') return Pages.talk(G);
  if (k === 'berger') return Soupe.berger(G) || (SQ.st('gerard') === 0 && SQ.open('gerard') && Gerard.talk(G)) || Proces.berger(G) || Gerard.talk(G);
  if (k === 'pecheur') return Peche.talk(G);
  if (k === 'gardien') return Phare.talk(G);
  if (k === 'pierrette') return Lettre.pierrette(G);
  if (k === 'ermite') return Lettre.ermite(npc, G);
  if (Proces.witness(k, G)) return true;
  return false;
}
// un « ! » au-dessus de qui propose une quête
function sideOffer(npc) {
  const k = sideKey(npc), can = id => SQ.st(id) === 0 && SQ.open(id);
  return (k === 'claudine' && (can('soupe') || SQ.st('soupe') === 2)) || (k === 'mahaut' && can('concert')) || (k === 'sage' && can('livre')) || (k === 'berger' && (can('gerard') || can('proces')))
    || (k === 'pecheur' && can('peche')) || (k === 'gardien' && can('phare')) || (k === 'pierrette' && can('lettre'));
}

// ===== 1. la soupe chaude =====
const Soupe = {
  talk(G) {
    const s = SQ.st('soupe'), nm = Heroes.name(SAVE.hero);
    if ((s === 0 && SQ.open('soupe')) || s === 2) {
      G.ask([say('Mamie', s === 2 ? `Elle a refroidi ? Ce n'est rien, ${nm}, je t'en réchauffe une autre.` : `${nm}, le berger des Collines est malade. Je lui ai fait une soupe, mais il faut qu'elle arrive bien chaude !`), say('Mamie', 'Prends la Route des Bergers, au nord, et ne traîne pas. Et ne te fais pas bousculer : tu en renverserais !')], ['J\'y vais !', 'Pas maintenant'], i => {
        if (i !== 0) return; SAVE.soupT = 100; if (s === 0) SQ.start('soupe', G); else SQ.set('soupe', 1); SFX.drink();
      });
      return true;
    }
    if (s === 1) { G.say([say('Mamie', `Qu'est-ce que tu fais encore là, ${nm} ? La soupe refroidit !`)]); return true; }
    return false;
  },
  berger(G) {
    if (SQ.st('soupe') !== 1) return false;
    const t = Math.round(SAVE.soupT || 0); SQ.set('soupe', 3); SAVE.recipeBerger = true;
    const lines = [say('Le berger', 'Une soupe de Mamie ? Pour moi ? Atchoum ! Pardon.')];
    if (t >= 70) { SAVE.titleExpress = true; Wallet.add(60); lines.push(say('Le berger', `Elle est brûlante ! ${t} degrés de bonheur. Tu mérites le titre de « livreur express » ! Et 60 écus.`)); }
    else if (t >= 40) { Wallet.add(30); lines.push(say('Le berger', 'Encore bien chaude. Merci ! Voilà 30 écus.')); }
    else { Wallet.add(15); lines.push(say('Le berger', 'Un peu tiède… mais c\'est l\'intention qui compte. Tiens, 15 écus.')); }
    lines.push(say('Le berger', 'Et dis à Mamie la recette de ma grand-mère : deux herbes des collines et un petit poisson. La soupe du berger !'), { text: 'Mamie connaît une nouvelle recette : la soupe du berger.' });
    persist(); SFX.chest(); G.say(lines); return true;
  },
  update(dt, G) {
    if (SQ.st('soupe') !== 1 || G.state !== 'play') return;
    SAVE.soupT = (SAVE.soupT || 0) - dt * 1.1;
    if (SAVE.soupT <= 0) { SAVE.soupT = 0; SQ.set('soupe', 2); SFX.nope(); G.say([{ text: 'La soupe est froide… Il faut retourner voir Mamie.' }]); }
  },
  onHurt() { if (SQ.st('soupe') === 1) { SAVE.soupT = Math.max(0, (SAVE.soupT || 0) - 10); Input.toast = { msg: 'Tu renverses un peu de soupe !', t: 1.4 }; } },
  draw() {
    if (SQ.st('soupe') !== 1) return; const k = clamp((SAVE.soupT || 0) / 100, 0, 1), x = W - 74, y = 24;
    R(x - 2, y - 2, 70, 12, 'rgba(7,13,31,.75)'); R(x, y, 66, 8, '#2a3a6a'); R(x, y, 66 * k, 8, k > 0.7 ? '#ff6a3a' : k > 0.4 ? '#ffb02e' : '#6ac0ff');
    text('Soupe', x - 4, y - 0.5, { size: 7, align: 'right', color: '#fff6c0' });
  },
};

// ===== 2. le concert de Mahaut =====
const Concert = {
  n: () => [0, 1, 2, 3].filter(i => SAVE['corde' + i]).length,
  spots: [[6, 10], [46, 9], [54, 32], [8, 30]],
  talk(G) {
    const s = SQ.st('concert');
    if (s === 0 && SQ.open('concert')) { G.say([say('Mahaut', 'Mon rouet-harpe a perdu ses quatre cordes ! Le vent les a emportées jusque dans les Collines…'), say('Mahaut', 'Je crois qu\'elles se sont prises dans des jarres et des buissons. Si tu les retrouves, je donnerai un concert sur la place !')], () => SQ.start('concert', G)); return true; }
    if (s === 1 && this.n() < 4) { G.say([say('Mahaut', `Tu as trouvé ${this.n()} corde${this.n() > 1 ? 's' : ''} sur 4. Cherche dans les jarres et les buissons des Collines.`)]); return true; }
    if (s === 1) { G.say([say('Mahaut', 'Mes quatre cordes ! Ce soir… enfin, ce soir comme tous les soirs : concert sur la place !')], () => G.fadeTo(() => this.scene(G), '#000')); return true; }
    return false;
  },
  // la place du village : tout le monde danse
  scene(G) {
    G.enter('royaume', { x: 32 * TS, y: 33 * TS, dir: 'up' }, false); G.banner = null;
    const A = G.area, cx = 32 * TS, cy = 30 * TS;
    const crowd = [['crieur', -60, 26], ['lavandiere', 60, 24], ['jules', -36, 44], ['lila', 36, 44], ['lampions', -84, 40], ['pierrette', 84, 40], ['gaspard', 0, 54]].map(([lk, dx, dy]) => { const n = new NPC(cx + dx, cy + dy, { look: lk }); n.dance = true; A.ents.push(n); return n; });
    const harp = new NPC(cx, cy, { look: 'mahaut' }); A.ents.push(harp);
    G.camFocus = { x: cx, y: cy + 10 }; G.updateCam(); let nt = 0;
    const tune = [523, 659, 784, 659, 698, 880, 784, 659, 587, 659, 523, 392, 523, 659, 784, 1047];
    G.cut = { t: 0,
      update: dt => { const c = G.cut; c.t += dt; G.parts.update(dt); for (const n of crowd) { n.t += dt * 2.5; n.x += Math.sin(c.t * 3 + n.y) * 0.3; } harp.t += dt;
        if (c.t > nt * 0.35 && nt < tune.length * 2) { tone(tune[nt % tune.length], 0.3, { vol: 0.08, type: 'triangle' }); nt++; G.parts.add({ x: cx + rand(-10, 10), y: cy - 30, vy: -25, vx: rand(-15, 15), life: 1.6, c: pick(['#ffe27a', '#ff8ab0', '#8ff3ea']), r: 2 }); }
        if (c.t > 12) { G.cut = null; G.camFocus = null; for (const n of crowd.concat([harp])) n.gone = true; A.ents = A.ents.filter(e => !e.gone); SQ.set('concert', 2); Inventory.give('harpe'); SFX.chest(); G.raise('harpe');
          G.say([say('Mahaut', 'Quel triomphe ! Tout le village a dansé. Tiens, prends mon rouet-harpe : je m\'en ferai un autre.'), { text: 'Tu as obtenu la harpe de Mahaut ! Équipe-la sur B et joue-la : elle te ramène à Bourg-Luciole de n\'importe où (sauf dans la salle d\'un boss).' }]); } },
      draw: () => { const c = G.cut; if (!c) return; ctx.globalAlpha = Math.min(1, c.t) * 0.85; text('♪ Le concert de Mahaut ♪', W / 2, 20, { size: 12, align: 'center', bold: true, color: PAL.warm }); ctx.globalAlpha = 1; } };
    G.state = 'cut';
  },
};
// les jarres et buissons qui cachent les cordes
class StringPot extends Pot { constructor(x, y, i) { super(x, y); this.i = i; } hit(d, fx, fy, G) { super.hit(d, fx, fy, G); G.area.ents.push(new QuestThing(this.x, this.y, 'corde' + this.i, 'corde', 'Une corde du rouet-harpe de Mahaut !')); } }
class StringBush extends Bush { constructor(x, y, i) { super(x, y); this.i = i; } hit(d, fx, fy, G) { super.hit(d, fx, fy, G); G.area.ents.push(new QuestThing(this.x, this.y, 'corde' + this.i, 'corde', 'Une corde du rouet-harpe de Mahaut !')); } }
// objet de quête au sol (corde, page, plume…) : on le ramasse en marchant dessus, le frisbee et le grappin le rapportent
class QuestThing {
  constructor(x, y, flag, kind, msg, after) { this.x = x; this.y = y; this.flag = flag; this.kind = kind; this.msg = msg; this.after = after; this.t = rand(0, 5); this.w = 10; this.h = 6; this.fetchable = true; this.isPickup = true; this.light = { r: 26, c: 'rgba(255,230,160,' }; }
  get dead() { return !!SAVE[this.flag] || this.gone; }
  update(dt, G) {
    if (!this.settled) Pickup.prototype.settle.call(this, G.area, 220); // jamais dans l'eau ni dans un mur : sur la berge la plus proche
    this.t += dt; if (this.carried || G.state !== 'play') return;
    if (rectHit({ x: this.x - 7, y: this.y - 10, w: 14, h: 12 }, G.player.body())) { SAVE[this.flag] = true; this.gone = true; persist(); SFX.chest(); G.say(typeof this.msg === 'function' ? this.msg() : [{ text: this.msg }], this.after); }
  }
  draw() {
    ell(this.x, this.y, 5, 2, 'rgba(0,0,0,.3)'); const y = this.y - 6 + Math.sin(this.t * 3);
    if (this.kind === 'corde') { ctx.strokeStyle = '#e8d8b0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(this.x, y, 4, 0, 5.5); ctx.stroke(); R(half(this.x + 3), half(y - 4), 2, 2, '#c8a040'); }
    else if (this.kind === 'page') { R(this.x - 4, y - 5, 8, 10, '#f0e8d0'); R(this.x - 3, y - 3, 6, 1, '#8a7a5a'); R(this.x - 3, y - 1, 6, 1, '#8a7a5a'); R(this.x - 3, y + 1, 4, 1, '#8a7a5a'); }
    else if (this.kind === 'plume') drawMatIcon('plume', this.x, y, 0.8);
    else ell(this.x, y, 3, 3, '#ffe27a');
    if (Math.floor(this.t * 3) % 3 === 0) R(half(this.x + 4), half(y - 6), 1, 1, '#fff');
  }
}

// ===== 3. le livre perdu du sage : sept pages, l'histoire du Roi Minuit =====
const PAGES = [
  ['royaume', 12, 30, 'Une feuille du grimoire : « Il était une fois un roi qui aimait le soleil plus que tout. Chaque matin, il montait en haut de la tour-horloge pour le regarder se lever. »'],
  ['collines', 14, 17, 'Une feuille du grimoire : « Le roi avait un frère cadet, qui riait fort et ne craignait rien. Le peuple l\'aimait davantage. Le roi en fut jaloux. »'],
  ['foret', 50, 37, 'Une feuille du grimoire : « Un jour, le roi vit dans son miroir son premier cheveu blanc. Il ne dormit plus. Il avait peur de vieillir, et d\'être oublié. »'],
  ['montagne', 44, 22, 'Une feuille du grimoire : « Il demanda aux gnomes une machine pour arrêter le temps. Les gnomes refusèrent. Alors il alla trouver l\'horloger de la tour. »'],
  ['lac', 10, 40, 'Une feuille du grimoire : « L\'horloger refusa aussi. Furieux, le roi brisa la pierre du soleil, cœur de l\'horloge, et la cacha. Il était minuit. Il le resta. »'],
  ['cote', 34, 30, 'Une feuille du grimoire : « Le roi ne vieillit plus. Mais sans soleil, il dut voler la lumière des autres pour vivre. On l\'appela le Roi Minuit. »'],
  ['terres', 48, 20, 'Une feuille du grimoire : « Son frère partit vers l\'ouest chercher le soleil, et ne revint jamais. On dit que le roi l\'attend encore, chaque nuit, sur les remparts. »'],
];
const Pages = {
  n: () => PAGES.filter((p, i) => SAVE['page' + i]).length,
  talk(G) {
    const s = SQ.st('livre');
    if (s === 0 && SQ.open('livre')) { G.say([say('Le sage', 'Ah, te voilà. Un malheur : j\'ai perdu sept feuilles de mon grimoire. Le vent les a emportées par la fenêtre.'), say('Le sage', 'Elles racontent l\'histoire du Roi Minuit, avant qu\'il ne devienne… ce qu\'il est. Si tu les trouves, rapporte-les-moi.')], () => SQ.start('livre', G)); return true; }
    if (s === 1 && this.n() < 7) { G.say([say('Le sage', `${this.n()} feuille${this.n() > 1 ? 's' : ''} sur 7. Il en manque encore ${7 - this.n()}.`)]); return true; }
    if (s === 1) { G.say([say('Le sage', 'Les sept feuilles ! Mon grimoire est complet. Assieds-toi, je vais te lire l\'histoire du Roi, du début à la fin.')], () => this.scene(G)); return true; }
    return false;
  },
  scene(G) {
    const slides = ['Il y a cent ans, le roi d\'Aube-Figée aimait le soleil plus que tout.', 'Mais il avait peur de vieillir, et d\'être oublié de son peuple, qui lui préférait son frère.', 'Une nuit, il brisa la pierre du soleil, et l\'horloge s\'arrêta sur minuit.', 'Sans soleil, il vola la lumière des autres pour ne pas mourir. Il devint le Roi Minuit.', 'Son frère partit vers l\'ouest chercher un nouveau soleil… Peut-être l\'a-t-il trouvé, de l\'autre côté de la faille.'];
    G.cut = { t: 0, update: dt => { const c = G.cut; c.t += dt; if (c.t > slides.length * 3.4 + 0.5) { G.cut = null; SQ.set('livre', 2); Wallet.add(80); SFX.chest(); G.raise('grimoire'); Inventory.give('grimoire'); G.say([say('Le sage', 'Voilà toute l\'histoire. Garde le grimoire : il est à toi désormais. Et prends ces 80 écus pour ta peine.'), say('Le sage', 'Peut-être qu\'en connaissant son histoire, on comprend mieux pourquoi il a si peur du jour…')]); } },
      draw: () => { const c = G.cut; if (!c) return; R(0, 0, W, H, '#1a1208'); R(40, 30, W - 80, H - 60, '#e8d8b0'); R(44, 34, W - 88, H - 68, '#f0e4c4'); const i = Math.min(slides.length - 1, Math.floor(c.t / 3.4)), a = clamp(Math.min(c.t - i * 3.4, i * 3.4 + 3.4 - c.t) * 2, 0, 1);
        ctx.globalAlpha = a; text('Le grimoire du sage', W / 2, 46, { size: 11, align: 'center', bold: true, color: '#6a4a2a', shadow: false }); wrap(slides[i], W - 140, 10).forEach((l, k) => text(l, W / 2, 110 + k * 16, { size: 10, align: 'center', color: '#3a2a1a', shadow: false })); ctx.globalAlpha = 1; } };
    G.state = 'cut';
  },
};

// ===== 4. le mouton fugueur =====
const GERARD_ZONES = { collines: 'les Collines', route_nord: 'la Route des Bergers', col: 'le Col des Sapins', sanctuaire: 'le Sanctuaire des lucioles' };
const GERARD_SPOTS = { collines: [50, 25], route_nord: [24, 24], col: [30, 17], sanctuaire: [30, 17] };
const PEN = { x: 19, y: 38, w: 7, h: 4 }; // l'enclos, à côté de la bergerie (tuiles)
const Gerard = {
  talk(G) {
    const s = SQ.st('gerard');
    if (s === 0 && SQ.open('gerard')) { SAVE.gerard = { zone: pick(['route_nord', 'col', 'sanctuaire']) }; G.say([say('Le berger', 'Mon bélier Gérard a fugué ! Il ne tient pas en place : chaque fois qu\'on le cherche, il est ailleurs.'), say('Le berger', `On l'a vu vers ${GERARD_ZONES[SAVE.gerard.zone]}. Il ne suit personne : il faut le pousser devant toi jusqu'à l'enclos, à côté de ma cabane. Reste appuyé sur A pour l'agripper.`)], () => SQ.start('gerard', G)); return true; }
    if (s === 1) { G.say([say('Le berger', `Gérard ? La dernière fois, il broutait vers ${GERARD_ZONES[(SAVE.gerard || {}).zone] || 'je ne sais où'}. Pousse-le jusqu'à l'enclos !`)]); return true; }
    return false;
  },
  // apparition dans sa zone ; s'il n'a pas été poussé, il change de région à chaque fois qu'on quitte la sienne
  spawn(A) {
    const s = SQ.st('gerard'), g = SAVE.gerard;
    if (s === 2 && A.id === 'collines') { A.ents.push(Object.assign(new Sheep(22 * TS, 40 * TS), { gerard: true })); if ((SAVE.playTime || 0) - (SAVE.peloteT || 0) > 480) { SAVE.peloteT = SAVE.playTime || 0; A.ents.push(new Forage(23 * TS + 8, 39 * TS + 12, 'pelote')); } }
    if (s === 2 || s === 0 || !g) return;
    if (g.zone !== A.id) return;
    let x, y; if (g.key) { const a = ZONE_ARRIVE[g.key], [dx, dy] = DV[a.dir]; x = a.x + dx * 40; y = a.y + dy * 40; } else { const [tx, ty] = GERARD_SPOTS[A.id]; x = tx * TS + 8; y = ty * TS + 16; }
    let bx = Math.floor(x / TS) * TS + 8, by = Math.floor(y / TS) * TS + 16;
    const b = new GerardBlock(bx, by), free = (px, py) => !blocked(A, { x: px - 8, y: py - 16, w: 16, h: 16 }, b) && !EXITS.has(A.tileAt(px, py - 8));
    if (!free(bx, by)) search: for (let r = 1; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const px = bx + dx * TS, py = by + dy * TS; if (free(px, py)) { bx = px; by = py; break search; } }
    b.x = bx; b.y = by; A.ents.push(b);
  },
  leave(fromId) { const g = SAVE.gerard; if (SQ.st('gerard') !== 1 || !g || g.zone !== fromId || g.key) return; const z = Object.keys(GERARD_SPOTS).filter(k => k !== fromId); g.zone = pick(z); persist(); },
};
// Gérard se pousse et se tire comme un bloc ; poussé sur une sortie, il file dans la région voisine
class GerardBlock extends Block {
  constructor(x, y) { super(x, y); this.t = rand(0, 5); this.face = 1; this.st = 3; }
  push(dir, G) {
    if (this.mv) return; const [vx, vy] = DV[dir], tb = { x: this.x - 8 + vx * 16, y: this.y - 16 + vy * 16, w: 16, h: 16 };
    if (tb.x < 0 || tb.y < 0 || tb.x + 16 > G.area.w || tb.y + 16 > G.area.h || blocked(G.area, tb, this)) return;
    this.mv = { vx, vy, d: 0 }; if (vx) this.face = vx; SFX.baa(); SAVE.gerard.moved = true;
  }
  update(dt, G) {
    this.t += dt; const was = !!this.mv; super.update(dt, G);
    if (was && !this.mv) {
      const t = G.area.tileAt(this.x, this.y - 8), to = G.area.exitTo && G.area.exitTo[t];
      if (to) { SAVE.gerard = { zone: to[0], key: to[1], moved: true }; persist(); this.dead = true; Input.toast = { msg: 'Gérard file dans la région voisine…', t: 2 }; return; }
      const tx = Math.floor(this.x / TS), ty = Math.floor((this.y - 8) / TS);
      if (G.area.id === 'collines' && tx >= PEN.x && tx < PEN.x + PEN.w && ty >= PEN.y && ty < PEN.y + PEN.h) {
        this.dead = true; SQ.set('gerard', 2); SAVE.peloteT = (SAVE.playTime || 0) - 500; Wallet.add(40); SFX.baa(); SFX.secret();
        G.area.ents.push(Object.assign(new Sheep(this.x, this.y), { gerard: true }));
        G.say([say('Le berger', 'Gérard ! Mon brave Gérard ! Il est rentré au bercail.'), say('Le berger', 'Tiens, 40 écus. Et Gérard restera ici comme mascotte : il laissera une pelote de laine de temps en temps. Elle se revend bien chez Amandine !')]);
      }
    }
    if (!this.mv && G.player.grab !== this && (this.st -= dt) <= 0) { this.st = rand(3, 6); SFX.baa(); this.face = -this.face; } // il bêle, il regarde ailleurs
  }
  draw() {
    ell(this.x, this.y, 9, 3, 'rgba(0,0,0,.35)');
    hi(this.x, this.y + 1, this.face > 0, () => { DECOR.sheep.draw(this.t); D(-24, -30, 8, 4, '#e8d8b0'); D(-26, -28, 4, 6, '#e8d8b0'); }); // des cornes de bélier
    text('Gérard', this.x, this.y - 30, { size: 5.5, align: 'center', color: '#fff6c0' });
  }
}
class PenFence { // l'enclos de Gérard (décor)
  constructor() { this.x = (PEN.x + PEN.w / 2) * TS; this.y = (PEN.y + PEN.h) * TS; this.ground = true; }
  draw() { const x0 = PEN.x * TS, y0 = PEN.y * TS, w = PEN.w * TS, h = PEN.h * TS; for (const [x, y, ww, hh] of [[x0, y0, w, 2], [x0, y0 + h - 2, w, 2], [x0, y0, 2, h], [x0 + w - 2, y0, 2, h - 26]]) R(x, y, ww, hh, '#8a6a4a'); for (let x = x0; x <= x0 + w; x += 16) { R(x - 1, y0 - 6, 3, 8, '#6a4a2a'); R(x - 1, y0 + h - 6, 3, 8, '#6a4a2a'); } text('Enclos', x0 + w / 2, y0 - 12, { size: 5.5, align: 'center', color: '#e8d8b0' }); }
}

// ===== 5. le concours de pêche =====
const Peche = {
  talk(G) {
    const s = SQ.st('peche');
    if (s !== 0 && s !== 1) return false; if (!SQ.open('peche')) return false;
    if (G.contest) return false;
    G.ask([say('Le pêcheur', 'Grand concours de pêche ! Contre Firmin et Gaëlle, mes deux rivaux de toujours. Trois manches d\'une minute trente : le plus gros poisson gagne la manche.'), say('Le pêcheur', 'Gagne deux manches, et la coupe du champion est à toi. Prêt ?')], ['C\'est parti !', 'Plus tard'], i => {
      if (i !== 0) return; if (s === 0) SQ.start('peche', G);
      G.fadeTo(() => { G.contest = { round: 1, t: 90, best: 0, wins: 0 }; G.enter('lac', { x: 30 * TS + 8, y: 17 * TS + 8, dir: 'down' }, false); Inventory.equip('canne'); Input.toast = { msg: 'Manche 1 : lance ta ligne (B) !', t: 2.5 }; });
    });
    return true;
  },
  catch(cm) { if (G.contest) { G.contest.best = Math.max(G.contest.best, cm); Input.toast = { msg: `Meilleure prise : ${G.contest.best} cm`, t: 1.6 }; } },
  update(dt, G) {
    const c = G.contest; if (!c) return;
    if (G.area.id !== 'lac') { G.contest = null; Input.toast = { msg: 'Tu as quitté le lac : concours annulé.', t: 2.2 }; return; }
    if (G.state !== 'play') return; c.t -= dt; if (c.t > 0) return;
    const r1 = Math.round(rand(18, 40 + c.round * 6)), r2 = Math.round(rand(22, 44 + c.round * 6)), win = c.best > r1 && c.best > r2; if (win) c.wins++;
    const lines = [{ text: `Fin de la manche ${c.round} ! Firmin : ${r1} cm. Gaëlle : ${r2} cm. Toi : ${c.best} cm.` }, say('Le pêcheur', win ? 'Manche gagnée ! Bravo !' : 'Manche perdue… Courage !')];
    if (c.round >= 3 || c.wins >= 2 || (c.round - c.wins) >= 2) {
      G.contest = null;
      if (c.wins >= 2) { SQ.set('peche', 2); SAVE.coupe = true; Inventory.give('coupe'); persist(); SFX.bigheart(); G.raise('coupe'); lines.push(say('Le pêcheur', 'Tu as gagné le concours ! Voici la coupe du champion. Montre-la à Amandine : elle te paiera tes poissons le double !')); }
      else lines.push(say('Le pêcheur', 'Firmin et Gaëlle ont gagné cette fois. Reviens me voir pour une revanche !'));
      return G.say(lines);
    }
    c.round++; c.t = 90; c.best = 0; lines.push({ text: `Manche ${c.round} : c'est reparti !` }); G.say(lines);
  },
  spawn(A) { if (A.id === 'lac' && G.contest) A.ents.push(new NPC(26 * TS + 8, 17 * TS + 8, { look: 'firmin', sq: 'firmin' }), new NPC(35 * TS + 8, 17 * TS + 8, { look: 'gaelle', sq: 'gaelle' })); },
  draw() { const c = G.contest; if (!c) return; R(W - 158, 22, 154, 24, 'rgba(7,13,31,.8)'); text(`Manche ${c.round} / 3 · ${Math.ceil(Math.max(0, c.t))} s`, W - 81, 24, { size: 7.5, align: 'center', color: PAL.warm }); text(`Meilleure prise : ${c.best} cm · ${c.wins} manche${c.wins > 1 ? 's' : ''} gagnée${c.wins > 1 ? 's' : ''}`, W - 81, 35, { size: 6.5, align: 'center', color: '#c8d0f0' }); },
};

// ===== 6. le phare éteint =====
const Phare = {
  talk(G) {
    const s = SQ.st('phare');
    if (s === 0 && SQ.open('phare')) { G.say([say('Le gardien du phare', 'Mon phare est éteint depuis cent ans. Plus de mèche, plus d\'huile… Les bateaux se perdent.'), say('Le gardien du phare', 'Il faudrait une huile spéciale, qui brûle longtemps : du poisson doré et de l\'herbe d\'aube. Ta grand-mère, au village, saurait peut-être la préparer ?')], () => SQ.start('phare', G)); return true; }
    if (s === 1) { G.say([say('Le gardien du phare', 'Un poisson doré, une herbe d\'aube, et Mamie aux fourneaux. Je compte sur toi.')]); return true; }
    if (s === 2) { SQ.set('phare', 3); SFX.secret(); G.say([say('Le gardien du phare', 'L\'huile ! Elle sent la mer et le matin. Tiens, la clé du phare.'), say('Le gardien du phare', 'Monte tout en haut, cinq étages, et verse-la dans la lanterne. Attention : des crabes ont envahi les escaliers.')]); return true; }
    if (s === 3) { G.say([say('Le gardien du phare', 'La porte est au pied du phare, au sud de la plage. Cinq étages, courage !')]); return true; }
    if (s === 4) { G.say([say('Le gardien du phare', 'Mon phare brille de nouveau ! Et regarde la mer : on voit une ombre sous l\'eau, au large de la plage. Un passage ? Avec tes palmes, tu pourrais aller voir.')]); return true; }
    return false;
  },
  // chez Mamie
  mamie(G) {
    if (SQ.st('phare') !== 1) return false;
    if (Mats.n('poisson_dore') < 1 || Mats.n('herbe_rare') < 1) return false;
    G.ask([say('Mamie', 'Un poisson doré et de l\'herbe d\'aube ? Tu veux que je te fasse l\'huile du phare, c\'est ça ? Ma mère en faisait.')], ['Oui, l\'huile du phare !', 'Non, une soupe'], i => {
      if (i !== 0) return mamieTalk(G);
      Inventory.useIngredient('poisson_dore', 1); Inventory.useIngredient('herbe_rare', 1); SQ.set('phare', 2); SFX.drink(); G.raise('huile');
      G.say([say('Mamie', 'Et voilà : une huile qui brûlerait cent ans. Porte-la vite au gardien du phare !')]);
    });
    return true;
  },
};
// la porte du phare (Côte) et ses cinq étages
class LighthouseDoor {
  constructor(x, y) { this.x = x; this.y = y; this.ghost = true; }
  update(dt, G) {
    const P = G.player; if (G.state !== 'play' || P.bump > 0) return;
    if (P.dir === 'up' && Input.dy < -0.3 && Math.abs(P.x - this.x) < 12 && P.y > this.y && P.y < this.y + 16) {
      if (SQ.st('phare') < 3) { P.bump = 1.2; SFX.locked(); G.say([{ text: 'La porte du phare est fermée à clé. Le gardien doit l\'avoir.' }]); return; }
      SFX.door(); G.fadeTo(() => G.enter('phare1', G.areas.phare1.start));
    }
  }
}
function buildPhareFloor(n) {
  const w = 20, h = 12, g = makeGrid(w, h, '.'), T = gridTools(g);
  T.rect(0, 0, w, 2, '#'); T.rect(0, h - 1, w, 1, '#'); T.rect(0, 0, 1, h, '#'); T.rect(w - 1, 0, 1, h, '#');
  for (const [x, y] of [[1, 2], [18, 2], [1, 10], [18, 10]]) T.set(x, y, '#');
  const up = n % 2 ? 15 : 4, down = n % 2 ? 4 : 15; // l'escalier tourne d'un étage à l'autre
  if (n < 5) T.rect(up, 0, 2, 2, '2'); T.rect(down, h - 1, 2, 1, '1');
  if (n < 5) for (let i = 0; i < n; i++) T.set(6 + i * 2, 6 + (i % 2) * 2, '#'); // des caisses de plus en plus nombreuses
  const A = new Area('phare' + n, g, 'tower'); A.name = `Le phare · étage ${n}`; A.dark = 0.45;
  A.start = { x: (down + 1) * TS, y: (h - 2) * TS + 8, dir: 'up' }; A.top = { x: (up + 1) * TS, y: 3 * TS, dir: 'down' };
  A.exits = { 1: Gm => n === 1 ? Gm.enter('cote', { x: 30 * TS, y: 45 * TS + 8, dir: 'down' }) : Gm.enter('phare' + (n - 1), Gm.areas['phare' + (n - 1)].top), 2: Gm => Gm.enter('phare' + (n + 1), Gm.areas['phare' + (n + 1)].start) };
  A.spawn = function () {
    this.ents = [new Brazier(3 * TS, 3 * TS), new Brazier(17 * TS, 3 * TS)];
    if (SQ.st('phare') < 4) for (let i = 0; i < Math.min(4, n); i++) this.ents.push(new Crab((5 + i * 3.5) * TS, (6 + (i % 2) * 3) * TS));
    if (n === 5) this.ents.push(new PhareLamp(10 * TS, 5 * TS));
    this.ents.push(new Sign((down + 3) * TS, (h - 2) * TS, [{ text: `« Étage ${n} sur 5. »` }]));
  };
  return A;
}
class PhareLamp {
  constructor(x, y) { this.x = x; this.y = y; this.w = 30; this.h = 12; this.solid = true; this.t = 0; }
  get light() { return SQ.st('phare') >= 4 ? { r: 140, c: 'rgba(255,230,150,', warm: true } : { r: 20, c: 'rgba(255,230,150,' }; }
  canInteract() { return SQ.st('phare') === 3; }
  interact(G) {
    SFX.drink(); G.cut = { t: 0, update: dt => { const c = G.cut; c.t += dt; this.t += dt * 3; G.parts.update(dt); if (c.t > 0.8 && !c.lit) { c.lit = true; SQ.set('phare', 4); SAVE.phareOn = true; persist(); SFX.bigheart(); G.flashT = 0.3; } if (c.t > 2.4) { G.cut = null; G.state = 'play'; G.say([{ text: 'Tu verses l\'huile dans la lanterne. Le phare s\'embrase, et son faisceau balaie toute la Côte !' }, { who: 'Lumi', text: 'Regarde, au large ! Une ombre sous l\'eau… un passage ! Avec tes palmes, on pourrait aller voir.' }]); } }, draw: () => {} };
    G.state = 'cut';
  }
  update(dt) { this.t += dt; }
  draw() { ell(this.x, this.y, 16, 4, 'rgba(0,0,0,.4)'); const on = SQ.st('phare') >= 4; hi(this.x, this.y, false, () => { D(-30, -14, 60, 14, '#5a5e6a'); D(-20, -50, 40, 36, on ? '#fff6c0' : '#3a4a5a'); D(-20, -50, 40, 4, '#c8a040'); D(-24, -56, 48, 8, '#c8a040'); if (on) { D(-10, -44, 20, 24, '#ffe27a'); } }); if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25; const a = this.t; ctx.fillStyle = '#fff2c0'; ctx.beginPath(); ctx.moveTo(this.x, this.y - 18); ctx.lineTo(this.x + Math.cos(a - 0.2) * 300, this.y - 18 + Math.sin(a - 0.2) * 300); ctx.lineTo(this.x + Math.cos(a + 0.2) * 300, this.y - 18 + Math.sin(a + 0.2) * 300); ctx.fill(); ctx.restore(); } }
}
// le passage sous-marin révélé par le phare : on y plonge
class SeaPassage {
  constructor(x, y) { this.x = x; this.y = y; this.t = 0; this.ground = true; this.light = { r: 40, c: 'rgba(160,220,255,' }; this.secret = true; }
  get dead() { return !SAVE.phareOn; }
  update(dt, G) { this.t += dt; const P = G.player; if (P.dive > 0 && dist(P.x, P.y, this.x, this.y) < 18 && G.state === 'play') { G.areas.grotte_mer.back = { area: 'cote', pos: { x: this.x, y: this.y, dir: 'down' } }; G.fadeTo(() => G.enter('grotte_mer', G.areas.grotte_mer.start), '#0a2a5a'); } }
  draw() { for (let i = 0; i < 3; i++) { const r = ((this.t * 14 + i * 9) % 26); ctx.globalAlpha = (1 - r / 26) * 0.6; ctx.strokeStyle = '#cfe0ff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(this.x, this.y, r, r * 0.45, 0, 0, 7); ctx.stroke(); } ctx.globalAlpha = 1; }
}

// ===== 7. le colporteur endetté =====
const Dette = {
  // options ajoutées au menu du colporteur
  option() { const s = SQ.st('dette'); return SQ.open('dette') && s < 3 ? 'Tu as l\'air soucieux…' : null; },
  talk(G) {
    const s = SQ.st('dette');
    if (s === 0) SQ.start('dette', G);
    G.ask([say('Le colporteur', 'Soucieux, moi ? Bon… Je dois 300 écus à un créancier. Un grand type en manteau, qui me suit de région en région. Il ne parle presque pas, et il sent… le poisson.')], ['Payer 300 écus pour lui', 'Je vais enquêter', 'Bon courage'], i => {
      if (i === 0) { if (Wallet.get() < 300) { SFX.nope(); return G.say([say('Le colporteur', 'C\'est gentil, mais tu n\'as pas 300 écus. Moi non plus, d\'ailleurs.')]); } Wallet.spend(300); this.finish(G, [say('Le colporteur', 'Tu… tu paies ma dette ? Personne n\'a jamais fait ça pour moi. Désormais, tout est à moins trente pour cent pour toi. À vie !')]); }
      if (i === 1) G.say([say('Le colporteur', 'Il rôde toujours près de ma carriole. Fais attention à toi.')]);
    });
  },
  finish(G, lines) { SQ.set('dette', 3); SFX.secret(); G.say(lines); },
  price: p => SQ.st('dette') === 3 ? Math.round(p * 0.7) : p,
};
// le créancier : un manteau, un chapeau… et une queue rayée qui dépasse
class Creditor {
  constructor(x, y) { this.x = x; this.y = y; this.w = 14; this.h = 8; this.solid = true; this.t = 0; }
  get dead() { return SQ.st('dette') === 3 || this.gone; }
  canInteract() { return true; }
  interact(G) {
    if (SQ.st('dette') === 1) { SQ.set('dette', 2); return G.say([say('Le créancier', 'HMPF. Je suis le créancier. Où est. Mon. Argent.'), { text: 'Sa voix est bizarrement aiguë. Et sous son manteau dépasse… une queue rayée ?!' }, { who: 'Lumi', text: 'C\'est un déguisement ! Un bon coup d\'épée et on verra qui se cache là-dessous.' }]); }
    G.say([say('Le créancier', 'HMPF. Mon argent.')]);
  }
  hit(d, fx, fy, G) { if (SQ.st('dette') < 2) return; this.gone = true; SFX.roar(); G.shake = 0.3; G.parts.burst(this.x, this.y - 20, 24, { c: ['#3a2a4a', '#5a4a6a', '#c8a040'], life: 0.7, r: 2, up: 40 }); G.area.ents.push(new GiantRaccoon(this.x, this.y)); G.say([{ text: 'Le manteau tombe : c\'est un raton laveur géant, les poches pleines d\'écus volés !' }]); }
  update(dt) { this.t += dt; }
  draw() { ell(this.x, this.y, 8, 3, 'rgba(0,0,0,.35)'); hi(this.x, this.y, false, () => { D(-12, -46, 24, 46, '#3a2a4a'); D(-12, -46, 24, 4, '#5a4a6a'); D(-8, -58, 16, 12, '#7a7f8c'); D(-14, -62, 28, 6, '#2a1a2a'); D(-8, -70, 16, 9, '#2a1a2a'); D(-5, -54, 3, 2, '#14101a'); D(2, -54, 3, 2, '#14101a'); if (Math.sin(this.t * 2) > 0) { D(10, -10, 6, 5, '#7a7f8c'); D(14, -12, 6, 5, '#2a2c34'); } }); }
}
// le raton laveur géant (créature rare du bestiaire)
class GiantRaccoon extends Raccoon {
  constructor(x, y) { super(x, y); this.hp = this.maxHp = 10; this.dmg = 1; this.w = 22; this.h = 10; this.isMini = true; this.loot = null; }
  body() { return { x: this.x - 14, y: this.y - 26, w: 28, h: 26 }; }
  die(G) { super.die(G); Wallet.add(100); Dette.finish(G, [{ text: 'Le raton laveur géant s\'enfuit en lâchant 100 écus volés !' }, say('Le colporteur', 'Un raton laveur ?! Il me prenait mon argent depuis des mois ! Merci ! Désormais, tout est à moins trente pour cent pour toi. À vie !')]); }
  draw() { ctx.save(); ctx.translate(this.x, this.y); ctx.scale(1.8, 1.8); ctx.translate(-this.x, -this.y); super.draw(); ctx.restore(); if (this.hp < this.maxHp) { R(half(this.x - 12), half(this.y - 44), 24, 2, 'rgba(7,13,31,.8)'); R(half(this.x - 12), half(this.y - 44), 24 * Math.max(0, this.hp) / this.maxHp, 2, '#ff6a7a'); } }
}

// ===== 8. la lettre d'amour =====
const Lettre = {
  pierrette(G) {
    const s = SQ.st('lettre');
    if (s === 0 && SQ.open('lettre')) { G.say([say('Pierrette', 'Psst… Tu vas souvent dans les Terres de Minuit ? Il y a l\'ermite, là-bas… Je lui écris des lettres. Mais je n\'ose jamais les envoyer.'), say('Pierrette', 'Tu veux bien lui porter celle-ci ? Ne la lis pas, hein !')], () => { SQ.start('lettre', G); G.raise('lettre'); }); return true; }
    if (s === 1 || s === 3) { G.say([say('Pierrette', 'Alors ? Tu lui as donné ma lettre ? Il est dans sa cabane, au fond des Terres de Minuit.')]); return true; }
    if (s === 2) { SQ.set('lettre', 3); G.raise('lettre'); G.say([{ text: 'Tu donnes la réponse de l\'ermite à Pierrette. Elle la lit trois fois.' }, say('Pierrette', '« Chère Pierrette, merci pour la lettre. Le papier était très bon. Je l\'ai mangé. » … Il l\'a MANGÉE ?'), say('Pierrette', 'Bon. Il paraît qu\'il fabrique des bottes merveilleuses, avec lesquelles on marche deux fois plus vite. Je vais lui en parler. Tiens, porte-lui ma deuxième lettre.')]); return true; }
    if (s === 4) { SQ.set('lettre', 5); G.raise('lettre'); G.say([{ text: 'Pierrette lit la deuxième réponse en rougissant.' }, say('Pierrette', '« Chère Pierrette, oui, je fais des bottes. Je vous en ferais bien une paire, mais je ne connais pas votre pointure. Ni votre visage. »'), say('Pierrette', 'C\'est le moment ! Ma troisième lettre l\'invite au village. Mais il est si sauvage… Il faudra le convaincre.')]); return true; }
    if (s === 5) { G.say([say('Pierrette', 'Tu crois qu\'il viendra ? Convaincs-le, s\'il te plaît !')]); return true; }
    return false;
  },
  ermite(npc, G) {
    const s = SQ.st('lettre');
    if (SAVE.ermiteMoved) { G.ask([say('L\'ermite', 'Ah, mon messager ! Des bottes ? Elles font marcher bien plus vite. 120 écus, c\'est donné.')], [Inventory.has('bottes') ? 'Discuter' : 'Acheter des bottes (120 écus)', 'Parler'], i => {
      if (i === 0 && !Inventory.has('bottes')) { if (Wallet.get() < 120) { SFX.nope(); return G.say([say('L\'ermite', 'Il manque des écus. Je ne fais pas crédit, j\'ai vu ce qui est arrivé au colporteur.')]); } G.ask([{ text: 'Les bottes de l\'ermite : 120 écus. On marche bien plus vite.' }], ['Les acheter', 'Non merci'], c => { if (c !== 0) return; Wallet.spend(120); Inventory.give('bottes'); SFX.buy(); G.raise('bottes'); G.say([say('L\'ermite', 'Elles sont à toi. Ne cours pas trop vite, tu vas rater le paysage.')]); }); return; }
      Quests.talk('ombres', G); }); return true; }
    if (s === 1) { SQ.set('lettre', 2); G.raise('lettre'); G.say([{ text: 'Tu donnes la lettre de Pierrette à l\'ermite. Il la renifle.' }, say('L\'ermite', 'Une lettre ? Pour moi ? Personne ne m\'écrit. Même les ombres ne m\'écrivent pas.'), say('L\'ermite', 'Attends… je vais répondre. Voilà. Porte-lui ça. C\'est la première lettre que j\'écris depuis quarante ans, sois indulgent.')]); return true; }
    if (s === 2 || s === 4) { G.say([say('L\'ermite', 'Tu as porté ma réponse ? Elle a ri ? Elle n\'a pas ri ? Elle a ri, hein.')]); return true; }
    if (s === 3) { SQ.set('lettre', 4); G.raise('lettre'); G.say([say('L\'ermite', 'Une deuxième lettre ! Elle parle de… mes bottes ? Comment sait-elle ?'), say('L\'ermite', 'Je réponds. C\'est encore pire que la première fois. Tant pis, porte-la.')]); return true; }
    if (s === 5) {
      G.ask([say('L\'ermite', 'Elle m\'invite… au village ? Moi ? Je suis vieux, sauvage, et je parle aux ombres. Qu\'est-ce que je ferais au village ?')], ['Vous pourriez y vendre vos bottes !', 'Il y a une très bonne auberge.', 'Pierrette a besoin d\'aide pour ses poules.'], i => {
        if (i !== 0) return G.say([say('L\'ermite', 'Hmm. Non… je ne suis pas convaincu. Laisse-moi réfléchir.')]);
        G.say([say('L\'ermite', 'Vendre mes bottes… Avoir une boutique… Prendre le thé avec Pierrette… Oui. OUI ! J\'arrive !')], () => this.tea(G));
      });
      return true;
    }
    return false;
  },
  // le thé, devant chez Pierrette
  tea(G) {
    SQ.set('lettre', 6); SAVE.ermiteMoved = true; persist();
    G.fadeTo(() => {
      G.enter('royaume', { x: 25 * TS, y: 16 * TS, dir: 'up' }, false); G.banner = null; G.camFocus = { x: 21 * TS, y: 13 * TS }; G.updateCam();
      G.say([{ text: 'Quelques jours plus tard, devant chez Pierrette…' }, say('Pierrette', 'Encore un peu de thé ?'), say('L\'ermite', 'Volontiers. Il est meilleur que celui des ombres.'), say('Pierrette', 'Vous savez, votre deuxième lettre… je l\'ai gardée sous mon oreiller.'), say('L\'ermite', 'Et moi, j\'ai gardé la vôtre. Enfin, ce que je n\'en ai pas mangé.'), { text: 'L\'ermite s\'installe à Bourg-Luciole. Il vend des bottes qui font marcher plus vite.' }], () => { G.camFocus = null; });
    }, '#000');
  },
};

// ===== 9. le fantôme de 3 h =====
const RIDDLES = [
  ['Je dors sous l\'eau depuis cent ans. Mes portes s\'ouvrent quand l\'eau descend. Qui suis-je ?', ['La Tour des artificiers', 'Le Temple englouti', 'Les Mines des gnomes', 'La Grotte des lucioles'], 1],
  ['On m\'entre par un arbre creux, et le vent y souffle par moments. Qui suis-je ?', ['Le Bois des murmures', 'La Lande grise', 'Le Col des Sapins', 'L\'Orée du bois'], 0],
  ['Six lanternes m\'entourent, et mes aiguilles dorment depuis cent ans. Qui suis-je ?', ['Le phare', 'Le Château de Minuit', 'La tour-horloge', 'Le moulin'], 2],
];
class Ghost {
  constructor(x, y) { this.x = x; this.y = y; this.w = 14; this.h = 8; this.t = 0; this.light = { r: 50, c: 'rgba(170,200,255,' }; }
  get dead() { return SQ.st('fantome') === 2 || this.gone || !SQ.open('fantome') || (SAVE.fragments || 0) < 3; }
  canInteract() { return true; }
  interact(G) {
    if (SQ.st('fantome') === 0) { SQ.start('fantome', G); SAVE.ghostQ = 0; return G.say([say('Le fantôme', 'Ooooh… Trois heures… Il est trois heures, et je ne me souviens plus de mon nom.'), say('Le fantôme', 'Aide-moi, enfant. Je ne parle plus qu\'en énigmes… Leurs réponses sont des lieux de ce royaume.')], () => this.ask(G)); }
    this.ask(G);
  }
  ask(G) {
    const q = RIDDLES[SAVE.ghostQ || 0]; if (!q) return;
    G.ask([say('Le fantôme', q[0])], [...q[1], 'Je ne sais pas'], i => {
      if (i === q[2]) { SAVE.ghostQ = (SAVE.ghostQ || 0) + 1; persist(); SFX.chime(); if (SAVE.ghostQ >= RIDDLES.length) return this.finish(G); return G.say([say('Le fantôme', 'Oui… oui ! Je me souviens d\'un peu plus. Encore une…')], () => this.ask(G)); }
      SFX.nope(); G.say([say('Le fantôme', i === 4 ? 'Reviens quand tu sauras… Je serai là. Il est toujours trois heures, pour moi.' : 'Non… ce n\'est pas ça. Reviens quand tu sauras.')]);
    });
  }
  finish(G) {
    SQ.set('fantome', 2); SAVE.cleTour = true; const hp = giveHeartPiece(G); SFX.bigheart(); G.raise('cle_tour');
    G.say([say('Le fantôme', 'Anselme ! Je m\'appelais Anselme. J\'étais l\'horloger de la tour.'), say('Anselme', 'Le roi est venu, une nuit. Il voulait que j\'arrête l\'horloge pour toujours. J\'ai refusé. Alors il a brisé la pierre du soleil… et le temps s\'est figé, avec moi dedans.'), say('Anselme', 'Prends la clé de la tour-horloge. Mes outils sont encore là-haut. Et ceci, que je gardais pour un jour meilleur.'), { text: hp }, say('Anselme', 'Merci, enfant. Je peux enfin me reposer…')], () => { this.gone = true; G.parts.burst(this.x, this.y - 20, 30, { c: ['#cfe0ff', '#fff'], life: 1.2, r: 2, up: 30 }); });
  }
  update(dt) { this.t += dt; }
  draw() { const y = this.y - 6 + Math.sin(this.t * 2) * 3; if (IMG.pl_fantome) { drawPL('fantome', this.x, y, plFace(this), this.t, 0.62 + 0.14 * Math.sin(this.t * 3)); return; } ctx.globalAlpha = 0.55 + 0.15 * Math.sin(this.t * 3); hi(this.x, y, false, () => { D(-12, -44, 24, 36, '#cfe0ff'); D(-14, -10, 6, 8, '#cfe0ff'); D(-4, -10, 6, 10, '#cfe0ff'); D(8, -10, 6, 7, '#cfe0ff'); D(-10, -56, 20, 14, '#e8f0ff'); D(-6, -50, 3, 4, '#3a4a7a'); D(3, -50, 3, 4, '#3a4a7a'); D(-3, -44, 6, 3, '#3a4a7a'); D(-16, -36, 6, 4, '#c8a040'); }); ctx.globalAlpha = 1; }
}

// ===== 10. le procès du raton laveur =====
const WITNESSES = {
  bastien: ['Bastien', 'J\'ai vu Filou rôder près de la bergerie, cette nuit. Et j\'ai entendu la cloche tinter… mais au-dessus de ma tête. Bizarre, non ?'],
  pervenche: ['Mme Pervenche', 'Filou ? Il était avec moi toute la soirée, à manger des mûres près du gros rocher. Il en avait plein les moustaches !'],
  pauline: ['Pauline', 'Mon cerf-volant s\'est pris dans un grand arbre des Collines, à l\'est. Il y avait un nid, là-haut, plein de trucs qui brillent !'],
  vagabond: ['Le vagabond', 'Cette nuit, j\'ai vu une ombre voler au-dessus des Collines, avec quelque chose qui tintait. Trop haut pour un raton, si tu veux mon avis.'],
};
const CLUES = { plume: 'Une plume noire, coincée dans la porte de la bergerie. Un raton n\'a pas de plumes…', mures: 'Des traces de pattes de raton, et du jus de mûre partout. Filou était bien ici à manger des mûres.', nid: 'Avec le grappin, tu fais tomber le nid du grand arbre. Dedans : la cloche d\'argent du berger, et des plumes noires !' };
const Proces = {
  nT: () => Object.keys(WITNESSES).filter(k => (SAVE.procT || {})[k]).length,
  nC: () => Object.keys(CLUES).filter(k => (SAVE.procC || {})[k]).length,
  berger(G) {
    const s = SQ.st('proces');
    if (s === 0 && SQ.open('proces') && SQ.st('gerard') !== 1) { G.say([say('Le berger', 'Catastrophe ! Ma cloche d\'argent a disparu. Tout le monde accuse Filou, le raton laveur du coin… mais je veux être juste.'), say('Le berger', 'Interroge les témoins, cherche des preuves dans les Collines, puis reviens me dire qui est le coupable. Attention : on n\'accuse pas quelqu\'un à la légère.')], () => SQ.start('proces', G)); return true; }
    if (s !== 1) return false;
    if (this.nT() < 4 || this.nC() < 3) { G.say([say('Le berger', `Tu as interrogé ${this.nT()} témoin${this.nT() > 1 ? 's' : ''} sur 4 et trouvé ${this.nC()} preuve${this.nC() > 1 ? 's' : ''} sur 3. Continue ton enquête.`)]); return true; }
    G.ask([say('Le berger', 'Alors, enquêteur ? Devant tout le monde : qui a volé ma cloche ?')], ['Filou, le raton', 'Bastien', 'Le corbeau', 'Le vagabond'], i => {
      if (i !== 2) { SFX.nope(); return G.say([say('Le berger', i === 0 ? 'Filou ? Mais Mme Pervenche dit qu\'il mangeait des mûres… Tu n\'as pas de preuve. Réfléchis encore, et reviens.' : 'Quoi ? Mais enfin, il n\'a rien à voir là-dedans ! Réfléchis encore, et reviens.')]); }
      SQ.set('proces', 2); SAVE.ratonsAmis = true; SFX.bigheart();
      G.say([say('Le berger', 'Le corbeau ! Bien sûr ! La plume, le nid, la cloche qui tintait dans le ciel… Filou est innocent.'), say('Filou', 'Krrr ! (Filou te fait un câlin. Il sent la mûre.)'), { text: 'Les ratons laveurs des Collines te font confiance : ils ne t\'attaqueront plus.' }]);
    });
    return true;
  },
  witness(k, G) {
    if (SQ.st('proces') !== 1 || !WITNESSES[k]) return false;
    SAVE.procT = SAVE.procT || {}; const first = !SAVE.procT[k]; SAVE.procT[k] = 1; persist(); if (first) Input.toast = { msg: `Témoin interrogé : ${this.nT()} / 4`, t: 1.8 };
    G.say([say(WITNESSES[k][0], WITNESSES[k][1])]); return true;
  },
  spawn(A) {
    if (SQ.st('proces') !== 1 && !(SQ.st('proces') === 2 && A.id === 'collines')) return;
    if (A.id === 'collines') {
      A.ents.push(new NPC(35 * TS + 8, 38 * TS, { sq: 'filou', draw: n => Raccoon.prototype.draw.call({ x: n.x, y: n.y, t: n.t, vx: 0, vy: 0, state: 'wander', flash: 0, face: 1 }), fn: G => G.say([say('Filou', SQ.st('proces') === 2 ? 'Krrr ! (Filou est tout content.)' : 'Krrr… (Filou baisse les oreilles. Il a l\'air triste, et il sent la mûre.)')]) }));
      if (SQ.st('proces') === 1) {
        A.ents.push(villager2('bastien', 24 * TS + 8, 30 * TS), villager2('pervenche', 44 * TS + 8, 24 * TS));
        for (const [k, x, y] of [['plume', 10, 39], ['mures', 40, 30], ['nid', 38, 16]]) if (!(SAVE.procC || {})[k]) A.ents.push(new ClueSpot(x * TS + 8, y * TS, k));
      }
    }
  },
};
function villager2(k, x, y) { return new NPC(x, y, { sq: k, look: k }); }
Object.assign(LOOKS, { bastien: { skin: '#e0b48e', hair: '#c8742a', top: '#7a6a3a', legs: '#4a3a2a', hat: '#5a4a2a', child: true }, pervenche: { skin: '#f0c8a8', hair: '#c8c8d0', top: '#8a5aa8', legs: '#3a2a4a', long: true, bun: true } });
class ClueSpot { // un indice à examiner (le nid se décroche au grappin)
  constructor(x, y, k) { this.x = x; this.y = y; this.k = k; this.w = 12; this.h = 8; this.t = 0; }
  get dead() { return !!(SAVE.procC || {})[this.k]; }
  canInteract() { return true; }
  interact(G) {
    if (this.k === 'nid' && !Inventory.has('grappin')) return G.say([{ text: 'Un nid de corbeau, tout en haut d\'un grand arbre. Quelque chose brille dedans… Trop haut pour l\'attraper à la main.' }]);
    SAVE.procC = SAVE.procC || {}; SAVE.procC[this.k] = 1; persist(); SFX.secret(); Input.toast = { msg: `Preuve trouvée : ${Proces.nC()} / 3`, t: 1.8 }; G.say([{ text: CLUES[this.k] }]);
  }
  update(dt) { this.t += dt; }
  draw() { const y = this.y - (this.k === 'nid' ? 30 : 4); ctx.globalAlpha = 0.5 + 0.4 * Math.sin(this.t * 4); ell(this.x, y, 5, 5, '#ffe27a'); ctx.globalAlpha = 1; text('?', this.x, y - 5, { size: 8, align: 'center', bold: true, color: '#3a2a1a', shadow: false }); }
}

// ===== la harpe de Mahaut : retour au village =====
function playHarp(G) {
  const A = G.area;
  if (A.map && G.room === A.map.boss && !SAVE[A.map.bossFlag]) { SFX.nope(); Input.toast = { msg: 'La harpe refuse de jouer ici !', t: 1.8 }; return; }
  if (A.id === 'royaume') { Input.toast = { msg: 'Tu es déjà à Bourg-Luciole.', t: 1.5 }; return; }
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.4, { vol: 0.08, delay: i * 0.12, type: 'triangle' }));
  G.parts.burst(G.player.x, G.player.y - 20, 20, { c: ['#ffe27a', '#ff8ab0', '#8ff3ea'], life: 1, r: 2, up: 40 });
  setTimeout(() => G.fadeTo(() => G.enter('royaume', Object.assign({ dir: 'down' }, G.areas.royaume.plaza), false), '#fff6e0'), 500);
}

// ===== apparitions dans le monde =====
function sqSpawn(A) {
  if (A.id === 'collines') {
    if (SQ.st('concert') === 1) { const pts = Concert.spots; pts.forEach(([x, y], i) => { if (!SAVE['corde' + i]) A.ents.push(i % 2 ? new StringBush(x * TS + 8, y * TS + 8, i) : Object.assign(new StringPot(x * TS + 8, y * TS + 8, i), { loot: 'pot' })); }); }
    if (SQ.st('gerard') >= 1) A.ents.push(new PenFence());
  }
  Gerard.spawn(A); Proces.spawn(A); Peche.spawn(A);
  if (SQ.st('livre') === 1) PAGES.forEach(([z, x, y, txt], i) => { if (z === A.id && !SAVE['page' + i]) A.ents.push(new QuestThing(x * TS + 8, y * TS + 8, 'page' + i, 'page', () => [{ text: txt }, { text: `Feuille du grimoire : ${Pages.n()} / 7.` }])); });
  if (A.id === 'royaume') {
    A.ents.push(new Ghost(9 * TS, 24 * TS + 8));
    if (SAVE.ermiteMoved) { A.ents.push(new NPC(20 * TS + 8, 13 * TS, { look: 'ermite', quest: 'ombres' })); A.ents.push(new Furniture(23 * TS, 14 * TS, 'table', { candle: true }), new Furniture(21.4 * TS, 14.6 * TS, 'stool'), new Furniture(24.6 * TS, 14.6 * TS, 'stool')); }
  }
  if (A.id === 'cote') {
    A.ents.push(new LighthouseDoor(30 * TS, 44 * TS)); A.ents.push(new SeaPassage(44 * TS, 34 * TS));
    const lh = A.ents.find(e => e instanceof Decor && e.kind === 'lighthouse'); if (lh) lh.light = SAVE.phareOn ? { r: 160, c: 'rgba(255,230,150,', warm: true } : null;
  }
}
function sqBuild(areas) {
  for (let n = 1; n <= 5; n++) areas['phare' + n] = buildPhareFloor(n);
  areas.grotte_mer = buildSecretCave('grotte_mer', 'La grotte sous la mer', A => { A.ents.push(new Chest(13 * TS, 6 * TS, { flag: 'merTresor', give: 'money:250', big: true, msg: [{ text: 'Le trésor englouti : 250 écus !' }, { who: 'Lumi', text: 'Le phare nous a montré le chemin. Le gardien avait raison !' }] })); });
}
// l'intérieur de la tour-horloge (clé d'Anselme)
Object.assign(INTERIORS, {
  horloge: { name: 'Dans la tour-horloge', w: 16, h: 10, dark: 0.3, build(put, at, A) {
    put('window', 8, 2); put('table', 5, 5.6, { candle: true }); put('books', 4, 7); put('shelf', 12, 3.2);
    put('crate', 3, 8.4, { say: [{ text: 'Les outils d\'Anselme, bien rangés. Une étiquette : « Pour réparer le temps, il faut d\'abord le comprendre. »' }] });
    A.ents.push(Object.assign(new Chest(11 * TS, 7 * TS, { flag: 'horlogeCoffre', give: 'money:120', msg: [{ text: 'Les économies d\'Anselme : 120 écus. « Pour l\'enfant qui me rendra mon nom. »' }] })));
    A.ents.push(new Sign(8 * TS, 8 * TS, [{ text: 'Le journal d\'Anselme : « Le roi veut que j\'arrête l\'horloge. Je refuse. Le temps n\'appartient à personne. »' }]));
  } },
});
function enterClockTower(G, tower) { G.enterHouse({ o: { interior: 'horloge' }, x: tower.x, y: tower.y + 14 }); }

// ===== objets =====
Object.assign(EXTRA_ICONS, {
  harpe: (x, y, s) => { ctx.strokeStyle = '#c8a040'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.arc(x, y, 6 * s, Math.PI * 0.6, Math.PI * 1.9); ctx.stroke(); for (let i = -2; i <= 2; i++) R(x + i * 2 * s, y - 4 * s, 0.6 * s, 8 * s, '#f0e8d0'); },
  grimoire: (x, y, s) => { R(x - 6 * s, y - 7 * s, 12 * s, 14 * s, '#6a3a2a'); R(x - 5 * s, y - 6 * s, 10 * s, 12 * s, '#8a5a3a'); R(x - 2 * s, y - 3 * s, 4 * s, 4 * s, '#ffe27a'); },
  bottes: (x, y, s) => { R(x - 5 * s, y - 6 * s, 4 * s, 10 * s, '#6a4224'); R(x - 5 * s, y + 2 * s, 7 * s, 3 * s, '#4a2a14'); R(x + 1 * s, y - 6 * s, 4 * s, 10 * s, '#7a4a2a'); R(x + 1 * s, y + 2 * s, 7 * s, 3 * s, '#4a2a14'); R(x - 5 * s, y - 6 * s, 10 * s, 1 * s, '#ffe27a'); },
  coupe: (x, y, s) => { R(x - 5 * s, y - 6 * s, 10 * s, 6 * s, '#ffd23a'); R(x - 1 * s, y, 2 * s, 4 * s, '#c89010'); R(x - 4 * s, y + 4 * s, 8 * s, 2 * s, '#c89010'); R(x - 4 * s, y - 5 * s, 2 * s, 3 * s, '#fff6c0'); },
  cle_tour: (x, y, s) => { ell(x - 3 * s, y, 3 * s, 3 * s, '#c8a040'); R(x, y - 1 * s, 7 * s, 2 * s, '#c8a040'); R(x + 5 * s, y + 1 * s, 2 * s, 3 * s, '#c8a040'); },
  huile: (x, y, s) => { R(x - 3 * s, y - 4 * s, 6 * s, 9 * s, '#c89010'); R(x - 1 * s, y - 7 * s, 2 * s, 3 * s, '#8a6a4a'); R(x - 2 * s, y - 2 * s, 2 * s, 4 * s, '#ffe27a'); },
  lettre: (x, y, s) => { R(x - 6 * s, y - 4 * s, 12 * s, 8 * s, '#f0e8d0'); R(x - 1 * s, y - 1 * s, 2 * s, 2 * s, '#e84a5a'); },
});
// la pelote de Gérard
MATS.pelote = { name: 'Pelote de Gérard', price: 25, desc: 'Une pelote de laine de bélier, douce et chaude. Amandine la rachète bon prix.' };
PICKUPS.mat_pelote = { draw: (x, y) => drawMatIcon('pelote', x, y - 5, 0.8), take: () => { Inventory.addIngredient('pelote', 1); SFX.pickup(); } };

// ===== le journal (onglet Quêtes de la pause) =====
const MAIN_GIVERS = { poules: 'Pierrette (Bourg-Luciole)', cloche: 'Le berger (Collines)', hache: 'Le bûcheron (Forêt)', lettre: 'Le gnome (Montagne)', filet: 'Le pêcheur (Lac)', feux: 'L\'artificière (Côte)', ombres: 'L\'ermite (Terres de Minuit)' };
const MAIN_NAMES = { poules: 'Les poules de Pierrette', cloche: 'Les ratons du berger', hache: 'La hache du bûcheron', lettre: 'La lettre du gnome', filet: 'Le filet du pêcheur', feux: 'Les feux de la Côte', ombres: 'Les ombres de l\'ermite' };
function questLog() {
  const L = [];
  for (const id of Object.keys(QUESTS)) { const s = Quests.st(id); if (!s) continue; const q = QUESTS[id]; L.push({ name: MAIN_NAMES[id], giver: MAIN_GIVERS[id], main: true, st: s === 2 ? 'done' : 'on', hint: s === 2 ? 'Terminée. Un souvenir du monde réel en récompense !' : (Story.lines(q.wait)[0] || {}).text || '' }); }
  for (const id of Object.keys(SIDE)) { const s = SQ.st(id), d = SIDE[id]; if (!s && !SQ.open(id)) continue; L.push({ name: d.name, giver: d.giver, st: SQ.done(id) ? 'done' : s ? 'on' : 'new', hint: SQ.done(id) ? 'Terminée !' : s ? d.hint(s) : 'Quelqu\'un a besoin d\'aide… Va voir : ' + d.giver + '.' }); }
  return L.sort((a, b) => ({ new: 0, on: 1, done: 2 }[a.st] - { new: 0, on: 1, done: 2 }[b.st]));
}
