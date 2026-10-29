'use strict';
// ---------- donjon 1 : la Grotte des lucioles (Collines) — 10 salles, lance-pierre, la Grande Ombre ----------
//            .        [BOSS]        .          .
//        [LANCE-P.]  [GOUFFRE]   [GRANDE CLÉ]   .
//        [STÈLE]     [CARREFOUR]  [YEUX]     [TRÉSOR]
//            .       [ENTRÉE]    [ARÈNE]       .
function buildCaveArea() {
  const brA = { x: 1 * RW + 14, y: 1 * RH + 4 };
  return makeDungeon({
    id: 'cave', zone: 'collines', name: 'La Grotte des lucioles', theme: 'cave', seed: 21, rough: 0.2, moss: 360, dark: 0.26,
    bossFlag: 'boss', heartFlag: 'heart2', potLoot: 'pot',
    rooms: { entry: [1, 3], arena: [2, 3], hub: [1, 2], block: [0, 2], sling: [0, 1], chasm: [1, 1], twin: [2, 2], bigkey: [2, 1], treasure: [3, 2], boss: [1, 0] },
    entry: 'entry', boss: 'boss',
    links: [['entry', 'arena', { arena: true, at: 'b' }], ['entry', 'hub', { key: 'caveK1' }], ['hub', 'block'], ['block', 'sling', { shut: () => !SAVE.plateE }], ['sling', 'chasm'], ['hub', 'chasm'], ['hub', 'twin'], ['twin', 'bigkey', { key: 'caveK2' }], ['twin', 'treasure'], ['chasm', 'boss', { big: true }]],
    tiles(room) {
      const c = room('chasm'); c.rect(2, 4, 26, 2, '~'); c.rect(2, 2, 1, 4, 'W'); c.rect(27, 2, 1, 4, 'W');
      const t = room('twin'); t.rect(6, 4, 4, 3, '~'); t.rect(20, 4, 4, 3, '~');
      for (const [x, y] of [[6, 5], [23, 5], [6, 11], [23, 11]]) room('entry').set(x, y, 'k');
      for (const [x, y] of [[9, 8], [20, 8]]) room('arena').set(x, y, 'k');
      for (const [x, y] of [[5, 4], [24, 4], [5, 12], [24, 12]]) { room('treasure').set(x, y, 'k'); room('bigkey').set(x, y, 'k'); }
      for (const [x, y] of [[8, 11], [21, 11]]) room('hub').set(x, y, 'k');
    },
    syncTiles() { const want = SAVE.bridge ? 'b' : '~'; let ch = false; for (let y = brA.y; y < brA.y + 2; y++) for (let x = brA.x; x < brA.x + 2; x++) if (this.g[y][x] !== want) { this.g[y][x] = want; ch = true; } if (ch) this.rerender(); },
    roomDark: (room, R) => room === R.bigkey ? 0.55 : null,
    arenas: { arena: arenaStd('arenaW'), boss: bossArena('boss', 'La Grande Ombre') },
    make(n, L, h) {
      const { mk, pot } = h;
      if (n === 'entry') L.push(pot(n, 4, 13), pot(n, 25, 13), mk(Bat, n, 10, 8), mk(Bat, n, 20, 9));
      if (n === 'arena' && !SAVE.arenaW) L.push(mk(Shadow, n, 8, 5), mk(Shadow, n, 21, 5), mk(Shadow, n, 14, 11), mk(Bat, n, 6, 10), mk(Bat, n, 23, 10));
      if (n === 'arena') L.push(pot(n, 4, 3), pot(n, 25, 3));
      if (n === 'hub') L.push(mk(Wisp, n, 9, 4), mk(Bat, n, 20, 6), pot(n, 4, 13), pot(n, 25, 13));
      if (n === 'block') L.push(SAVE.plateE ? mk(Block, n, 19, 6) : mk(Block, n, 8, 9), mk(Bat, n, 12, 4), mk(Bat, n, 17, 12), pot(n, 3, 13), pot(n, 26, 13));
      if (n === 'sling') L.push(mk(Shadow, n, 8, 5), mk(Bat, n, 22, 11), pot(n, 3, 13), pot(n, 26, 13));
      if (n === 'chasm') L.push(mk(Wisp, n, 10, 2), mk(Shadow, n, 9, 11), mk(Bat, n, 20, 12), pot(n, 25, 13), pot(n, 3, 13));
      if (n === 'twin') L.push(mk(Wisp, n, 14, 10), mk(Bat, n, 6, 12), mk(Bat, n, 23, 12), pot(n, 3, 13), pot(n, 26, 13));
      if (n === 'bigkey') L.push(mk(Shadow, n, 9, 6), mk(Shadow, n, 20, 6), mk(Shadow, n, 14, 11), pot(n, 3, 13), pot(n, 26, 13));
      if (n === 'treasure') L.push(mk(Bat, n, 9, 6), mk(Bat, n, 20, 6), mk(Bat, n, 14, 10), pot(n, 3, 3), pot(n, 26, 3), pot(n, 3, 13), pot(n, 26, 13));
      if (n === 'boss') { if (!SAVE.boss) { const p = h.pos(n, 240, 120); L.push(new GreatShadow(p.x, p.y, h.R.boss)); } L.push(pot(n, 3, 12), pot(n, 26, 12)); }
    },
    fixed(h) {
      const { mk, pos } = h, br = (n, pts) => pts.map(([x, y]) => [n, mk(Brazier, n, x, y)]);
      const cg = pos('boss', 240, 66), ac = pos('arena', 240, 150), sc = pos('sling', 240, 140), tc = pos('twin', 240, 170), bc = pos('bigkey', 240, 150);
      return [
        ['entry', mk(Sign, 'entry', 11, 10, [{ text: '« Grotte des lucioles. Ce qui dort au fond craint la lumière… et les cailloux bien lancés. »' }, { who: '{hero}', text: 'Des cailloux ? Il me faudrait de quoi les lancer.', face: 'o' }], 'stone')],
        ['entry', mk(Chest, 'entry', 4, 3, { flag: 'caveCoins', give: 'money:20', msg: [{ text: 'Tu as trouvé 20 écus !' }] })],
        ['arena', new Chest(ac.x, ac.y, { flag: 'caveKeyChest', reveal: 'arenaW', msg: [{ text: 'Une petite clé ! Elle ouvre une porte de cette grotte.' }] })],
        ['block', mk(Scratches, 'block', 8, 9, 3)], ['block', mk(Plate, 'block', 19, 6, 'plateE')],
        ['block', mk(Sign, 'block', 22, 12, [{ text: '« La porte du nord s\'ouvre quand la dalle est pressée. »' }], 'stone')],
        ['sling', new Chest(sc.x, sc.y, { flag: 'slingChest', give: 'lance_pierre', big: true, msg: [{ text: 'Tu as trouvé le lance-pierre ! Et 15 cailloux pour aller avec.' }, { text: 'Bouton B : tirer, dans 8 directions. Les jarres et les buissons cachent d\'autres cailloux.' }] })],
        ['chasm', mk(Crystal, 'chasm', 21, 3, 'bridge', G => { SAVE.bridge = true; persist(); G.area.syncTiles(); G.shake = 0.4; setTimeout(() => SFX.secret(), 300); })],
        ['chasm', mk(Sign, 'chasm', 11, 12, [{ text: '« Le pont dort tant que le cristal dort. »' }], 'stone')],
        ['twin', mk(FrisbeeSwitch, 'twin', 8, 5, 'caveTwin')], ['twin', mk(FrisbeeSwitch, 'twin', 22, 5, 'caveTwin')],
        ['twin', mk(Sign, 'twin', 14, 8, [{ text: '« Deux yeux à réveiller ensemble. Ils dorment au-dessus de l\'eau. »' }], 'stone')],
        ['twin', new Chest(tc.x, tc.y, { flag: 'caveKeyChest2', reveal: 'caveTwin', msg: [{ text: 'Une petite clé !' }] })],
        ['bigkey', new Chest(bc.x, bc.y, { flag: 'caveBigKey', give: 'bigkey:cave', big: true, msg: [{ text: 'La grande clé de la grotte ! Elle ouvre la porte du gardien.' }] })],
        ['treasure', mk(Chest, 'treasure', 14, 7, { flag: 'caveTreasure', give: 'money:50', msg: [{ text: 'Un trésor oublié : 50 écus !' }] })],
        ['boss', new Cage(cg.x, cg.y, { n: 1, boss: 'boss', drawCaptive: (x, y, t) => drawHero(Heroes.captive(1), x, y, 'down', false, t) })],
        ...br('entry', [[11, 3], [18, 3]]), ...br('arena', [[4, 7], [25, 9]]), ...br('hub', [[4, 3], [25, 3]]), ...br('block', [[11, 3], [18, 3]]), ...br('sling', [[10, 7], [19, 7]]),
        ...br('chasm', [[4, 11], [25, 11], [5, 2]]), ...br('twin', [[3, 3], [26, 3]]), ...br('treasure', [[14, 3]]), ...br('boss', [[4, 3], [25, 3], [4, 13], [25, 13]]),
      ];
    },
  });
}
