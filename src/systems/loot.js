'use strict';
// Butin : ce que lâchent ennemis, buissons et jarres (une seule chose au plus par tirage)
const LOOT = {
  bush:    [[0.22, 'coin1'], [0.04, 'coin5'], [0.10, 'heart'], [0.12, 'stones']],
  pot:     [[0.30, 'coin1'], [0.12, 'coin5'], [0.14, 'heart'], [0.22, 'stones']],
  bat:     [[0.45, 'coin1'], [0.10, 'heart']],
  raccoon: [[0.45, 'coin1'], [0.20, 'coin5'], [0.15, 'heart']],
  shadow:  [[0.35, 'coin5'], [0.20, 'heart'], [0.20, 'stones']],
  wisp:    [[0.45, 'coin1'], [0.25, 'stones']],
  boar:     [[0.35, 'coin5'], [0.20, 'heart'], [0.25, 'mushroom']],
  squirrel: [[0.40, 'coin1'], [0.15, 'stones'], [0.25, 'mushroom']],
  bushBois: [[0.18, 'coin1'], [0.10, 'heart'], [0.10, 'stones'], [0.22, 'mushroom']],
  gnome:    [[0.40, 'coin5'], [0.20, 'heart'], [0.15, 'stones']],
  spider:   [[0.40, 'coin1'], [0.15, 'heart']],
  potMine:  [[0.30, 'coin1'], [0.15, 'coin5'], [0.14, 'heart'], [0.20, 'stones']],
  crab:     [[0.40, 'coin5'], [0.20, 'heart']],
  eel:      [[0.40, 'coin1'], [0.20, 'heart']],
  skeleton: [[0.35, 'coin5'], [0.20, 'heart'], [0.20, 'petards']],
  gargoyle: [[0.40, 'coin5'], [0.15, 'heart']],
  potTower: [[0.25, 'coin1'], [0.15, 'coin5'], [0.14, 'heart'], [0.25, 'petards']],
  potCastle:[[0.25, 'coin5'], [0.15, 'heart'], [0.15, 'stones'], [0.15, 'petards']],
  potBois:  [[0.25, 'coin1'], [0.10, 'coin5'], [0.12, 'heart'], [0.18, 'stones'], [0.15, 'mushroom']],
};
function dropLoot(G, kind, x, y) {
  const table = LOOT[kind]; if (!table) return;
  let r = Math.random();
  for (const [p, what] of table) {
    if (r < p) { let w = what; if (w === 'stones' && !Inventory.has('lance_pierre')) w = 'coin1'; if (w === 'petards' && !Inventory.has('petards')) w = 'coin1'; G.area.ents.push(new Pickup(x, y, w)); return; }
    r -= p;
  }
}
