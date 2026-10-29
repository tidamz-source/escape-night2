'use strict';
// ---------- l'intérieur de chaque maison : meubles, habitants, étals ----------
// put(meuble, x, y, options) : x, y en tuiles (y = le pied du meuble). Les PNJ sont poussés dans this.ents.
const npc = (A, x, y, o) => { const n = new NPC(x * TS, y * TS, o); A.ents.push(n); return n; };
const shopNPC = (shop) => G => { const sh = Shop.def(shop); G.say([{ who: sh.keeper, text: sh.hello }, { who: sh.keeper, text: 'Approche-toi d\'un article et appuie sur A pour l\'acheter.' }]); };

Object.assign(INTERIORS, {
  // ----- le camping -----
  bungalow: { name: 'Le bungalow', w: 16, h: 10, dark: 0.32, wake: [8.5, 7.2], build(put, at, A) {
    put('window', 4, 2); put('window', 12, 2);
    put('bed', 3, 4.6, { empty: true, blanket: '#c83a4a' }); put('bed', 6, 4.6, { empty: true, blanket: '#3a8a5a' }); put('bed', 10, 4.6, { empty: true, blanket: '#4a6ab0' }); put('bed', 13, 4.6, { empty: true, blanket: '#c8a040' });
    put('rug', 8, 8.2, { color: '#3a5a8a' }); put('table', 12.5, 7.6, { food: true }); put('stool', 11, 8.6); put('stool', 14, 8.6);
    put('crate', 2, 8.6, { say: [{ text: 'La valise de Papa. Elle est ouverte, et vide.' }] }); put('plant', 2, 6.2);
  } },
  bungalow_b: { name: 'Bungalow', w: 14, h: 9, build(put) { put('bed', 4, 4.6, { empty: true }); put('table', 10, 6.6); } },
  // ----- Bourg-Luciole -----
  auberge: { name: 'L\'auberge du Lampion', w: 20, h: 11, build(put, at, A) {
    put('window', 4, 2); put('window', 16, 2); put('fireplace', 10, 3.2);
    put('counter', 5, 5.4); npc(A, 5, 4.4, { look: 'aubergiste', talk: 'aubergiste' });
    put('table', 14, 6.6, { candle: true }); put('stool', 12.2, 7.4); put('stool', 15.8, 7.4);
    put('table', 14, 9.2, { food: true }); put('barrel', 2, 9.4); put('barrel', 3.2, 9.6); put('rug', 9.5, 9.4, { color: '#8a3a2a' });
    npc(A, 12, 8.6, { hero: () => Heroes.captive(1), talk: 'enfant1', when: 'freed1' });
    npc(A, 16.4, 8.6, { sprite: 'papa_down', talk: 'papa', when: 'boss6' });
  } },
  bibliotheque: { name: 'La bibliothèque', w: 20, h: 11, build(put, at, A) {
    for (const x of [3, 7, 13, 17]) put('shelf', x, 3.2);
    put('rug', 10, 8.6, { color: '#3a4a8a' }); put('table', 10, 6.2, { candle: true }); put('books', 6, 7.4); put('lamp', 2, 8.6); put('plant', 18, 9.4);
    npc(A, 10, 5.2, { look: 'sage', talk: 'sage' });
    npc(A, 15, 8, { hero: () => Heroes.captive(2), talk: 'enfant2', when: 'freed4' });
  } },
  forge: { name: 'La forge', w: 18, h: 11, dark: 0.18, build(put, at, A) {
    put('forge', 4, 3.6); put('anvil', 8, 5.6); put('barrel', 15, 4); put('crate', 16.2, 4.4); put('window', 12, 2);
    npc(A, 11, 4.6, { look: 'forgeron', fn: shopNPC('forge') });
    shopRow(A, 'forge', 5, 8, 4);
  } },
  epicerie: { name: 'Chez Mère Grenadine', w: 18, h: 11, build(put, at, A) {
    put('shelf', 4, 3.2); put('shelf', 14, 3.2); put('counter', 9, 5.4); put('barrel', 2, 9.4); put('crate', 16, 9.4); put('window', 9, 2);
    npc(A, 9, 4.4, { look: 'epiciere', fn: shopNPC('epicerie') });
    shopRow(A, 'epicerie', 5, 8, 3);
  } },
  mamie: { name: 'La cuisine de Mamie', w: 16, h: 10, build(put, at, A) {
    put('fireplace', 4, 3.2); put('cauldron', 8, 4.8); put('table', 12, 6.6, { food: true }); put('stool', 10.2, 7.4); put('window', 12, 2); put('rug', 6, 8.2, { color: '#a85a3a' });
    npc(A, 10, 4.6, { sprite: 'claudine', fn: shopNPC('cuisine'), when: 'freed2' });
    npc(A, 3.5, 7.6, { sprite: 'dog', talk: 'goyave', when: 'freed5' });
    shopRow(A, 'cuisine', 6, 8.4, 4);
  } },
  comptoir: { name: 'Le comptoir d\'Amandine', w: 18, h: 11, build(put, at, A) {
    put('counter', 9, 5.4); put('shelf', 3, 3.2); put('shelf', 15, 3.2); put('plant', 2, 9.4); put('crate', 16, 9.4);
    npc(A, 9, 4.4, { sprite: 'amandine', fn: shopNPC('comptoir') });
    shopRow(A, 'comptoir', 4.5, 8, 3);
  } },
  pierrette: { name: 'Chez Pierrette', w: 14, h: 9, build(put, at, A) { put('bed', 3, 4.6, { blanket: '#c86aa0' }); put('table', 9, 5.6); put('window', 10, 2); put('crate', 12, 7.4, { say: [{ text: 'Un panier plein de plumes. Pas une seule poule dedans.' }] }); npc(A, 7, 6.6, { look: 'pierrette', quest: 'poules' }); } },
  gaspard: { name: 'Chez Gaspard', w: 14, h: 9, build(put, at, A) { put('bed', 11, 4.6, { blanket: '#3a8a5a' }); put('table', 5, 5.6, { candle: true }); put('barrel', 2, 7.4); npc(A, 7.5, 6.8, { look: 'gaspard', talk: 'villageois2' }); } },
  mahaut: { name: 'Chez Mahaut', w: 14, h: 9, build(put, at, A) { put('shelf', 4, 3.2); put('wheel', 10, 5); put('plant', 12, 7.4); npc(A, 7, 6.6, { look: 'mahaut', talk: 'villageois3' }); } },
  // ----- les autres zones -----
  berger: { name: 'La bergerie', w: 14, h: 9, build(put, at, A) { put('fireplace', 4, 3.2); put('bed', 11, 4.6, { blanket: '#c8b898' }); put('bench', 7, 7.2); npc(A, 8, 5.6, { look: 'berger', quest: 'cloche' }); } },
  bucheron: { name: 'La cabane du bûcheron', w: 14, h: 9, build(put, at, A) { put('fireplace', 10, 3.2); put('crate', 3, 5, { say: [{ text: 'Une pile de bûches bien rangées.' }] }); put('table', 5, 7.2); npc(A, 9, 6.4, { look: 'bucheron', quest: 'hache' }); } },
  herboriste: { name: 'L\'herboristerie', w: 16, h: 10, build(put, at, A) { put('cauldron', 4, 4.6); put('shelf', 12, 3.2); put('plant', 2, 8.4); put('plant', 14, 8.4); npc(A, 8, 4.6, { look: 'herboriste', fn: shopNPC('herboriste') }); shopRow(A, 'herboriste', 5, 7.6, 3); } },
  gnome: { name: 'La hutte du gnome', w: 12, h: 9, build(put, at, A) { put('table', 6, 5, { candle: true }); put('crate', 2, 7.4); put('barrel', 10, 7.4); npc(A, 6, 6.8, { gnome: true, quest: 'lettre' }); } },
  pecheur: { name: 'La cabane du pêcheur', w: 14, h: 9, build(put, at, A) { put('nets', 4, 4); put('barrel', 11, 4.4); put('table', 9, 6.4, { food: true }); npc(A, 6, 6.6, { look: 'pecheur', fn: pecheurTalk }); } },
  artificiere: { name: 'L\'atelier de l\'artificière', w: 18, h: 11, build(put, at, A) { put('rockets', 4, 4); put('rockets', 14, 4); put('barrel', 2, 8); put('table', 9, 5.6); npc(A, 9, 7, { look: 'artificiere', quest: 'feux' }); shopRow(A, 'artifices', 13, 8.4, 3); } },
  phare: { name: 'La maison du gardien du phare', w: 12, h: 9, build(put, at, A) { put('bed', 3, 4.6); put('lamp', 9, 4); put('table', 7, 6.6); npc(A, 9, 7, { look: 'gardien', talk: 'gardien' }); } },
  ermite: { name: 'La cabane de l\'ermite', w: 12, h: 9, dark: 0.35, build(put, at, A) { put('cauldron', 3, 4.6); put('books', 9, 4); put('bed', 9.5, 7.6, { blanket: '#4a3a5a' }); npc(A, 6, 6, { look: 'ermite', quest: 'ombres' }); } },
});
// le pêcheur reçoit aussi la lettre du gnome
function pecheurTalk(G) {
  if (Quests.st('lettre') === 1) { SAVE.qc.lettre = 1; Quests.reward('lettre', G, [L2('Le pêcheur', 'Une lettre de mon cousin le gnome ? « Donne une récompense à ce grand échalas habillé en clown. »'), L2('Le pêcheur', 'Bon, d\'accord. Prends cette tablette qui ne sert à rien : elle affiche « pas de réseau » toute la journée.')]); return; }
  Quests.talk('filet', G);
}
