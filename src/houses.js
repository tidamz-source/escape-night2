'use strict';
// ---------- l'intérieur de chaque maison : meubles, habitants, étals ----------
// put(meuble, x, y, options) : x, y en tuiles (y = le pied du meuble). Les PNJ sont poussés dans this.ents.
const npc = (A, x, y, o) => { const n = new NPC(x * TS, y * TS, o); A.ents.push(n); return n; };
const shopNPC = (shop) => G => { const sh = Shop.def(shop); G.say([{ who: sh.keeper, text: sh.hello }, { who: sh.keeper, text: 'Approche-toi d\'un article et appuie sur A pour l\'acheter.' }]); };

Object.assign(INTERIORS, {
  // ----- le camping -----
  bungalow: { name: 'Le mobile-home', w: 16, h: 10, dark: 0.32, wake: [8.5, 7.2], paint: 'mobil_home', paintWake: [5.6, 6],
    lights: [[4.55, 2.4, 24], [11.7, 5.7, 18], [6, 2.8, 30]], // le lampadaire, la lampe de la table, la fenêtre
    spots: [[8.5, 6.95, 1.2, [{ text: 'Le sac à dos de Papa. Il est ouvert, et vide.' }]], [3.9, 6.6, 1.4, [{ text: 'Le panier à linge. Il sent encore la crème solaire.' }]]],
    build(put, at, A) {
    put('window', 4, 2); put('window', 12, 2);
    put('bed', 3, 4.6, { empty: true, blanket: '#c83a4a' }); put('bed', 6, 4.6, { empty: true, blanket: '#3a8a5a' }); put('bed', 10, 4.6, { empty: true, blanket: '#4a6ab0' }); put('bed', 13, 4.6, { empty: true, blanket: '#c8a040' });
    put('rug', 8, 8.2, { color: '#3a5a8a' }); put('table', 12.5, 7.6, { food: true }); put('stool', 11, 8.6); put('stool', 14, 8.6);
    put('crate', 2, 8.6, { say: [{ text: 'La valise de Papa. Elle est ouverte, et vide.' }] }); put('plant', 2, 6.2);
  } },
  bungalow_b: { name: 'Bungalow', w: 14, h: 9, build(put) { put('bed', 4, 4.6, { empty: true }); put('table', 10, 6.6); } },
  // ----- Bourg-Luciole -----
  auberge: { name: 'L\'auberge du Lampion', w: 20, h: 11, paint: 'auberge', // peinte (assets/maps/auberge.png) ; l'aubergiste derrière son bar
    lights: [[2.3, 5.9, 56], [8, 2.2, 24], [12, 2.2, 24], [11.2, 3.6, 18], [6.4, 8.1, 18], [14.5, 3.8, 18], [6.2, 2.6, 26], [14, 2.6, 26]],
    people(put, at, A) {
      const ab = npc(A, 9, 4.45, { look: 'aubergiste', talk: 'aubergiste' }); // le bar (OVERHEAD.auberge) lui cache les jambes
      A.ents.push(new TalkSpot(9 * TS, 7 * TS, 5 * TS, ab)); // on lui parle par-dessus le bar
      npc(A, 11, 8.6, { hero: () => Heroes.captive(1), talk: 'enfant1', when: 'freed3&!boss6' });
    },
    build(put, at, A) {
    put('window', 4, 2); put('window', 16, 2); put('fireplace', 10, 3.2);
    put('counter', 5, 5.4); npc(A, 5, 4.4, { look: 'aubergiste', talk: 'aubergiste' });
    put('table', 14, 6.6, { candle: true }); put('stool', 12.2, 7.4); put('stool', 15.8, 7.4);
    put('table', 14, 9.2, { food: true }); put('barrel', 2, 9.4); put('barrel', 3.2, 9.6); put('rug', 9.5, 9.4, { color: '#8a3a2a' });
    npc(A, 12, 8.6, { hero: () => Heroes.captive(1), talk: 'enfant1', when: 'freed3&!boss6' }); // après la fin, la famille est au camping
  } },
  // la maison du sage est peinte (assets/maps/biblio.png) : le bureau, les rayonnages et la cheminée sont dans l'image
  bibliotheque: { name: 'La bibliothèque', w: 20, h: 11, paint: 'biblio',
    lights: [[10.0, 4.47, 48], [7.91, 2.33, 24], [12.33, 2.33, 24], [7.63, 3.81, 18], [12.56, 3.81, 18], [1.86, 3.44, 16]],
    shelves: [[3.95, 5.1, 1.9], [15.35, 6.1, 1.4]],
    people(put, at, A) {
      const sage = npc(A, 10, 6.2, { look: 'sage', fn: sageTalk }); // derrière le bureau : le bureau (OVERHEAD.biblio) lui cache les jambes
      A.ents.push(new TalkSpot(10 * TS, 7.7 * TS, 4.2 * TS, sage)); // devant le bureau : on lui parle par-dessus
      npc(A, 5.35, 6.4, { hero: () => Heroes.captive(2), talk: 'enfant2', when: 'freed4&!boss6' });
    },
    build(put, at, A) {
    for (const x of [3, 7, 13, 17]) put('shelf', x, 3.2);
    put('rug', 10, 8.6, { color: '#3a4a8a' }); put('table', 10, 6.2, { candle: true }); put('books', 6, 7.4); put('lamp', 2, 8.6); put('plant', 18, 9.4);
    npc(A, 10, 5.2, { look: 'sage', fn: sageTalk });
    npc(A, 15, 8, { hero: () => Heroes.captive(2), talk: 'enfant2', when: 'freed4&!boss6' });
  } },
  forge: { name: 'La forge', w: 18, h: 11, dark: 0.18, paint: 'forge', // peinte (assets/maps/forge.png)
    lights: [[10.1, 4.6, 80], [6.8, 2.6, 26], [13.8, 2.6, 26], [18.5, 3.7, 18], [1.7, 3, 16]],
    people(put, at, A) {
      npc(A, 10.5, 6.7, { look: 'forgeron', fn: forgeTalk }); // devant le foyer
      shopRow(A, 'forge', 12.5, 7.7, 2);
    },
    build(put, at, A) {
    put('forge', 4, 3.6); put('anvil', 8, 5.6); put('barrel', 15, 4); put('crate', 16.2, 4.4); put('window', 12, 2);
    npc(A, 11, 4.6, { look: 'forgeron', fn: forgeTalk });
    shopRow(A, 'forge', 5, 8, 4);
  } },
  epicerie: { name: 'Chez Mère Grenadine', w: 18, h: 11, paint: 'epicerie', // peinte (assets/maps/epicerie.png) ; l'épicière derrière son comptoir
    lights: [[8, 2.3, 24], [12, 2.3, 24], [1.9, 3.3, 16], [6.6, 2.6, 30]],
    people(put, at, A) {
      const ep = npc(A, 5.5, 5.45, { look: 'epiciere', fn: shopNPC('epicerie') }); // le comptoir (OVERHEAD.epicerie) lui cache les jambes
      A.ents.push(new TalkSpot(5 * TS, 8.1 * TS, 6 * TS, ep)); // on lui parle par-dessus le comptoir
      shopRow(A, 'epicerie', 11.7, 6.7, 2, 3, 2); // deux rangées de trois, devant les étagères
    },
    build(put, at, A) {
    put('shelf', 4, 3.2); put('shelf', 14, 3.2); put('counter', 9, 5.4); put('barrel', 2, 9.4); put('crate', 16, 9.4); put('window', 9, 2);
    npc(A, 9, 4.4, { look: 'epiciere', fn: shopNPC('epicerie') });
    shopRow(A, 'epicerie', 5, 8, 3);
  } },
  mamie: { name: 'La cuisine de Mamie', w: 16, h: 10, paint: 'mamie', // peinte (assets/maps/mamie.png)
    lights: [[5.6, 5.2, 72], [8, 2.3, 24], [12, 2.3, 24], [1.9, 3.3, 16], [18.4, 5.8, 18], [18.3, 3, 26]],
    spots: [[5.6, 6.8, 2, [{ text: 'Le chaudron de Mamie. Ça sent la soupe de champignons.' }]]],
    people(put, at, A) {
      npc(A, 9.6, 6.6, { sprite: 'claudine', fn: mamieTalk, when: 'freed2&!boss6' });
      npc(A, 3.5, 7.6, { sprite: 'dog', talk: 'goyave', when: 'freed5&!boss6' });
    },
    build(put, at, A) {
    put('fireplace', 4, 3.2); put('cauldron', 8, 4.8); put('table', 12, 6.6, { food: true }); put('stool', 10.2, 7.4); put('window', 12, 2); put('rug', 6, 8.2, { color: '#a85a3a' });
    npc(A, 10, 4.6, { sprite: 'claudine', fn: mamieTalk, when: 'freed2&!boss6' });
    npc(A, 3.5, 7.6, { sprite: 'dog', talk: 'goyave', when: 'freed5&!boss6' });
  } },
  comptoir: { name: 'Le comptoir d\'Amandine', w: 18, h: 11, paint: 'comptoir', // peint (assets/maps/comptoir.png) ; Amandine derrière son comptoir
    lights: [[8, 2.3, 24], [12, 2.3, 24], [11.1, 3.2, 18], [1.9, 3.2, 16], [6.6, 2.6, 28], [13.4, 2.6, 28], [18.6, 3.6, 18]],
    people(put, at, A) {
      const am = npc(A, 16.4, 6.6, { sprite: 'amandine', fn: amandineTalk, when: '!boss6' }); // le comptoir (OVERHEAD.comptoir) lui cache les jambes
      if (am) A.ents.push(new TalkSpot(16 * TS, 8.7 * TS, 5 * TS, am)); // on lui parle par-dessus le comptoir
      shopRow(A, 'comptoir', 4.5, 7, 2.3);
    },
    build(put, at, A) {
    put('counter', 9, 5.4); put('shelf', 3, 3.2); put('shelf', 15, 3.2); put('plant', 2, 9.4); put('crate', 16, 9.4);
    npc(A, 9, 4.4, { sprite: 'amandine', fn: amandineTalk, when: '!boss6' });
    shopRow(A, 'comptoir', 4.5, 8, 3);
  } },
  pierrette: { name: 'Chez Pierrette', w: 14, h: 9, paint: 'pierrette', // peinte (assets/maps/pierrette.png)
    lights: [[6.6, 3.5, 18], [8, 2.3, 24], [12, 2.3, 24], [10.3, 2.6, 30], [2.6, 7.6, 30]],
    spots: [[14.4, 9.6, 1.4, [{ text: 'Un panier d\'œufs. Les poules pondent de nouveau.' }]], [15.8, 7.1, 3, [{ text: 'Le coin des poules. De la paille partout, et pas une seule poule dedans.' }]], [4.5, 6.2, 2, [{ text: 'Un coin de lettre dépasse de l\'oreiller. Mieux vaut ne pas la lire.' }]]],
    people(put, at, A) { npc(A, 10.5, 7.6, { look: 'pierrette', quest: 'poules' }); },
    build(put, at, A) { put('bed', 3, 4.6, { blanket: '#c86aa0' }); put('table', 9, 5.6); put('window', 10, 2); put('crate', 12, 7.4, { say: [{ text: 'Un panier plein de plumes. Pas une seule poule dedans.' }] }); npc(A, 7, 6.6, { look: 'pierrette', quest: 'poules' }); } },
  gaspard: { name: 'Chez Gaspard', w: 14, h: 9, paint: 'gaspard', dark: 0.2, // peinte (assets/maps/gaspard.png)
    lights: [[2, 5.2, 22]],
    spots: [[2.8, 6.8, 1.8, [{ text: 'Un dessin de chaussure avec des lacets. En dessous : « À fabriquer ! »' }]], [10.2, 4.6, 2.6, [{ text: 'Le mur des rumeurs de Gaspard : des papiers, des ficelles rouges, un gnome, et un grand point d\'interrogation.' }]]],
    people(put, at, A) { npc(A, 9.5, 7.2, { look: 'gaspard', fn: G => { const g = Market.gossip(); G.say(g ? [{ who: 'Gaspard', text: g }, ...Story.talk('villageois2')] : Story.talk('villageois2')); } }); },
    build(put, at, A) { put('bed', 11, 4.6, { blanket: '#3a8a5a' }); put('table', 5, 5.6, { candle: true }); put('barrel', 2, 7.4); npc(A, 7.5, 6.8, { look: 'gaspard', fn: G => { const g = Market.gossip(); G.say(g ? [{ who: 'Gaspard', text: g }, ...Story.talk('villageois2')] : Story.talk('villageois2')); } }); } },
  mahaut: { name: 'Chez Mahaut', w: 14, h: 9, paint: 'mahaut', // peinte (assets/maps/mahaut.png)
    lights: [[2, 5.4, 20], [1.7, 6.9, 18], [10.3, 2.6, 30]],
    spots: [[11.6, 6.6, 1.2, [{ text: 'Le rouet-harpe de Mahaut. Il ne lui reste plus une corde.' }]]],
    people(put, at, A) { npc(A, 7, 7.4, { look: 'mahaut', talk: 'villageois3' }); },
    build(put, at, A) { put('shelf', 4, 3.2); put('wheel', 10, 5); put('plant', 12, 7.4); npc(A, 7, 6.6, { look: 'mahaut', talk: 'villageois3' }); } },
  // ----- les autres zones -----
  berger: { name: 'La bergerie', w: 14, h: 9, paint: 'berger', // peinte (assets/maps/berger.png)
    lights: [[6.2, 4.6, 60], [18.6, 4, 22], [10, 2.5, 26]],
    spots: [[17.4, 7.4, 1.4, [{ text: 'Des cloches de moutons, de toutes les tailles. Un crochet est vide.' }]]],
    people(put, at, A) { npc(A, 9.5, 6.4, { look: 'berger', quest: 'cloche' }); },
    build(put, at, A) { put('fireplace', 4, 3.2); put('bed', 11, 4.6, { blanket: '#c8b898' }); put('bench', 7, 7.2); npc(A, 8, 5.6, { look: 'berger', quest: 'cloche' }); } },
  bucheron: { name: 'La cabane du bûcheron', w: 14, h: 9, paint: 'bucheron', // peinte (assets/maps/bucheron.png)
    lights: [[13.4, 4.8, 80], [16.5, 8.8, 20], [10, 2.5, 22]],
    spots: [[7, 5.2, 1.6, [{ text: 'Une pile de bûches bien rangées.' }]]],
    people(put, at, A) { npc(A, 10, 6.6, { look: 'bucheron', quest: 'hache' }); },
    build(put, at, A) { put('fireplace', 10, 3.2); put('crate', 3, 5, { say: [{ text: 'Une pile de bûches bien rangées.' }] }); put('table', 5, 7.2); npc(A, 9, 6.4, { look: 'bucheron', quest: 'hache' }); } },
  herboriste: { name: 'L\'herboristerie', w: 16, h: 10, paint: 'herboriste', // peinte (assets/maps/herboriste.png) ; l'herboriste derrière son comptoir
    lights: [[4.1, 4.4, 40], [8.4, 3.4, 18], [8.4, 4.8, 18], [1.9, 3.3, 16], [8, 2.3, 22], [12, 2.3, 22], [13.4, 2.5, 26], [3.6, 9.4, 22], [16.6, 9.4, 22]],
    spots: [[4.1, 5.6, 2, [{ text: 'Le chaudron bouillonne. Ça sent la menthe et le sous-bois.' }]]],
    people(put, at, A) {
      const hb = npc(A, 10.6, 4.45, { look: 'herboriste', fn: herboristeTalk }); // le comptoir (OVERHEAD.herboriste) lui cache les jambes
      A.ents.push(new TalkSpot(8.5 * TS, 7 * TS, 4.5 * TS, hb));
      shopRow(A, 'herboriste', 6.5, 8.2, 3);
    },
    build(put, at, A) { put('cauldron', 4, 4.6); put('shelf', 12, 3.2); put('plant', 2, 8.4); put('plant', 14, 8.4); npc(A, 8, 4.6, { look: 'herboriste', fn: herboristeTalk }); shopRow(A, 'herboriste', 5, 7.6, 3); } },
  gnome: { name: 'La hutte du gnome', w: 12, h: 9, paint: 'gnome', dark: 0.15, // peinte (assets/maps/gnome.png)
    lights: [[6.4, 5.8, 22], [11.4, 3, 26], [5.4, 3.5, 22], [16, 8.8, 30], [13.4, 4.8, 16], [2.4, 6, 12]],
    spots: [[15.6, 8.4, 2, [{ text: 'Des cristaux qui brillent tout seuls. Le gnome les appelle « ses veilleuses ».' }]]],
    people(put, at, A) { npc(A, 11, 7.2, { gnome: true, quest: 'lettre' }); },
    build(put, at, A) { put('table', 6, 5, { candle: true }); put('crate', 2, 7.4); put('barrel', 10, 7.4); npc(A, 6, 6.8, { gnome: true, quest: 'lettre' }); } },
  pecheur: { name: 'La cabane du pêcheur', w: 14, h: 9, paint: 'pecheur', dark: 0.12, // peinte (assets/maps/pecheur.png)
    lights: [[6.6, 5.3, 34], [10, 3.4, 30]],
    spots: [[4.5, 7.3, 2, [{ text: 'Des filets suspendus. Un crochet est vide : c\'est là qu\'allait le grand filet.' }]]],
    people(put, at, A) { npc(A, 10, 6.8, { look: 'pecheur', fn: pecheurTalk }); },
    build(put, at, A) { put('nets', 4, 4); put('barrel', 11, 4.4); put('table', 9, 6.4, { food: true }); npc(A, 6, 6.6, { look: 'pecheur', fn: pecheurTalk }); } },
  artificiere: { name: 'L\'atelier de l\'artificière', w: 18, h: 11, paint: 'artificiere', // peint (assets/maps/artificiere.png) ; l'artificière derrière son comptoir
    lights: [[8, 2.3, 22], [12, 2.3, 22], [12, 4.9, 18], [1.4, 3.6, 16], [1.4, 5.8, 16], [6.6, 2.4, 26], [16, 2, 30]],
    people(put, at, A) {
      const af = npc(A, 10.3, 4.45, { look: 'artificiere', quest: 'feux' }); // le comptoir (OVERHEAD.artificiere) lui cache les jambes
      A.ents.push(new TalkSpot(8.5 * TS, 7.2 * TS, 4.5 * TS, af));
      shopRow(A, 'artifices', 13.2, 7.6, 2);
    },
    build(put, at, A) { put('rockets', 4, 4); put('rockets', 14, 4); put('barrel', 2, 8); put('table', 9, 5.6); npc(A, 9, 7, { look: 'artificiere', quest: 'feux' }); shopRow(A, 'artifices', 13, 8.4, 3); } },
  // (le gardien du phare n'a plus de maison : il vit au rez-de-chaussée du phare, voir buildPhareFloor)
  ermite: { name: 'La cabane de l\'ermite', w: 12, h: 9, dark: 0.35, build(put, at, A) { put('cauldron', 3, 4.6); put('books', 9, 4); put('bed', 9.5, 7.6, { blanket: '#4a3a5a' }); npc(A, 6, 6, { look: 'ermite', quest: 'ombres' }); } },
});
// le pêcheur reçoit aussi la lettre du gnome
function pecheurTalk(G) {
  if (Quests.st('lettre') === 1) { SAVE.qc.lettre = 1; Quests.reward('lettre', G, [L2('Le pêcheur', 'Une lettre de mon cousin le gnome ? « Donne une récompense à ce grand échalas habillé en clown. »'), L2('Le pêcheur', 'Bon, d\'accord. Prends cette tablette qui ne sert à rien : elle affiche « pas de réseau » toute la journée.')]); return; }
  // la canne à pêche, une fois le filet rapporté ; puis le tableau des records
  if (Quests.st('filet') === 2 && !Inventory.has('canne')) { Inventory.give('canne'); SFX.chest(); G.raise('canne'); G.say([L2('Le pêcheur', 'Tiens, prends ma vieille canne. Face à l\'eau, tu lances avec B, et tu ferres avec A quand le curseur est dans le vert.'), L2('Le pêcheur', 'Les poissons dorés ? Une légende. Enfin… j\'en ai vu un, une fois.')]); return; }
  if (Inventory.has('canne') && Quests.st('filet') === 2) { G.say([L2('Le pêcheur', SAVE.fishRec ? `Ton record : ${SAVE.fishRec} cm. ` + (SAVE.fishRec >= 60 ? 'Chapeau, c\'est mieux que le mien !' : 'Le mien, c\'est 60 cm. Courage !') : 'Alors, ça mord ? Mon record, c\'est 60 cm. Bats-le si tu peux !')]); return; }
  Quests.talk('filet', G);
}
