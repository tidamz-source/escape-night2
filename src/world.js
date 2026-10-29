'use strict';
// ---------- cartes ----------
// Tuiles : '.' herbe  ',' herbe fleurie  '=' chemin  '~' eau  '#' forêt dense (mur)  'F' entrée de la forêt
//          '_' sol  'm' mousse  'W' mur (racines / roche)  's' souche  'k' stalagmite
//          'v' gouffre  'b' pont  'E' sortie  'G' entrée de la grotte
//          'c' pavés  'P' palissade  'g' porte de la palissade (les ennemis ne la franchissent pas)
//          'r' rails (au sol)  'T' tréteau de rails au-dessus du gouffre  'J' 'K' 'M' 'N' 'O' sorties (mines, lac, temple, tour, château)
const SOLID = new Set(['#', '~', 'W', 's', 'k', 'v', 'P', 'T']); // bloque la marche
const WALLS = new Set(['#', 'W', 's', 'k', 'P']);           // bloque les projectiles (ils passent au-dessus de l'eau et du gouffre)
const EXITS = new Set(['F', 'E', 'G', 'H', 'J', 'K', 'M', 'N', 'O', 'D', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
const DOORWAYS = new Set(['F', 'E', 'G', 'H', 'J', 'K', 'M', 'N', 'O', 'D']); // sorties dessinées comme des passages sombres
const RW = 30, RH = 17;                                 // une salle = 30 × 17 tuiles = 480 × 272 px
const ROOM_W = RW * TS, ROOM_H = RH * TS;

function makeGrid(w, h, ch) { return Array.from({ length: h }, () => Array(w).fill(ch)); }
function gridTools(g) {
  const h = g.length, w = g[0].length;
  const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = c; };
  const rect = (x, y, ww, hh, c) => { for (let j = y; j < y + hh; j++) for (let i = x; i < x + ww; i++) set(i, j, c); };
  return { w, h, set, rect };
}

function buildOverworld() {
  const g = makeGrid(48, 34, '.'), { w, h, set, rect } = gridTools(g), r = seeded(11);
  rect(0, 0, w, 4, '#'); rect(0, 0, 2, h, '#'); rect(w - 2, 0, 2, h, '#'); rect(0, h - 3, w, 3, '#');
  for (let x = 2; x < w - 2; x++) { if (r() < 0.55) set(x, 4, '#'); if (r() < 0.45) set(x, h - 4, '#'); }
  for (let y = 4; y < h - 3; y++) { if (r() < 0.5) set(2, y, '#'); if (r() < 0.5) set(w - 3, y, '#'); }
  rect(2, 4, 4, 3, '#'); rect(39, 4, 7, 3, '#'); rect(2, 24, 4, 6, '#'); rect(43, 26, 3, 5, '#');
  // trouée vers la forêt
  rect(20, 1, 8, 6, '.'); rect(20, 0, 8, 2, '#'); rect(23, 3, 2, 16, '='); // la forêt du nord est fermée
  // chemins
  rect(5, 19, 37, 2, '='); rect(12, 11, 2, 8, '='); rect(40, 21, 2, 3, '=');
  // lac
  for (let y = 21; y < 32; y++) for (let x = 26; x < 44; x++) {
    const v = ((x + 0.5 - 35) / 6.8) ** 2 + ((y + 0.5 - 26.8) / 3.7) ** 2;
    if (v < 1 + (r() - 0.5) * 0.25) set(x, y, '~');
  }
  for (let i = 0; i < 70; i++) { const x = Math.floor(r() * w), y = Math.floor(r() * h); if (g[y][x] === '.') g[y][x] = ','; }
  return g;
}

function buildForest() {
  const g = makeGrid(30, 34, 'W'), { set, rect } = gridTools(g), r = seeded(5);
  rect(2, 2, 26, 13, '_');   // salle 2 (haut)
  rect(2, 19, 26, 13, '_');  // salle 1 (bas)
  for (const [y0, y1] of [[2, 14], [19, 31]]) {
    for (let x = 2; x < 28; x++) { if (Math.abs(x - 14.5) > 2 && r() < 0.35) set(x, y0, 'W'); if (Math.abs(x - 14.5) > 2 && r() < 0.35) set(x, y1, 'W'); }
    for (let y = y0; y <= y1; y++) { if (r() < 0.35) set(2, y, 'W'); if (r() < 0.35) set(27, y, 'W'); }
  }
  rect(14, 14, 2, 6, '_');   // passage de la porte
  rect(14, 31, 2, 1, '_'); rect(14, 32, 2, 2, 'E'); // sortie vers le camping
  rect(14, 0, 2, 2, 'G');    // entrée de la grotte, au nord
  for (const [x, y] of [[6, 22], [23, 22], [6, 28], [23, 28], [7, 5], [22, 5], [7, 11], [22, 11]]) set(x, y, 's');
  for (let i = 0; i < 90; i++) { const x = 2 + Math.floor(r() * 26), y = 2 + Math.floor(r() * 30); if (g[y][x] === '_') g[y][x] = 'm'; }
  return g;
}

// ---------- générateur de donjon : salles 30 × 17 sur une grille, passages de 2 tuiles ----------
// def : { cols, rows, rooms: [[rx, ry]], links: [[rx, ry, 'N'|'E']], exit: [rx, ry], seed, rough }
function buildDungeon(def) {
  const g = makeGrid(RW * def.cols, RH * def.rows, 'W'), { set, rect } = gridTools(g), r = seeded(def.seed || 1), rough = def.rough == null ? 0.25 : def.rough;
  for (const [rx, ry] of def.rooms) {
    const ox = rx * RW, oy = ry * RH;
    rect(ox + 2, oy + 2, 26, 13, '_');
    for (const [cx, cy] of [[2, 2], [27, 2], [2, 14], [27, 14]]) set(ox + cx, oy + cy, 'W');
    for (let x = 3; x < 27; x++) { if (Math.abs(x - 14.5) > 2.5 && r() < rough) set(ox + x, oy + 2, 'W'); if (Math.abs(x - 14.5) > 2.5 && r() < rough) set(ox + x, oy + 14, 'W'); }
    for (let y = 3; y < 14; y++) { if (Math.abs(y - 7.5) > 2 && r() < rough) set(ox + 2, oy + y, 'W'); if (Math.abs(y - 7.5) > 2 && r() < rough) set(ox + 27, oy + y, 'W'); }
  }
  for (const [rx, ry, side] of def.links) {
    const ox = rx * RW, oy = ry * RH;
    if (side === 'N') { rect(ox + 14, oy, 2, 3, '_'); rect(ox + 14, oy - 3, 2, 3, '_'); }
    if (side === 'E') { rect(ox + 27, oy + 7, 3, 2, '_'); rect(ox + 30, oy + 7, 3, 2, '_'); }
  }
  if (def.exit) { const [rx, ry] = def.exit; rect(rx * RW + 14, ry * RH + 14, 2, 1, '_'); rect(rx * RW + 14, ry * RH + 15, 2, 2, 'E'); }
  // outils pour décorer une salle en coordonnées locales
  const room = (rx, ry) => ({
    set: (x, y, c) => set(rx * RW + x, ry * RH + y, c),
    rect: (x, y, w, h, c) => rect(rx * RW + x, ry * RH + y, w, h, c),
    get: (x, y) => g[ry * RH + y][rx * RW + x],
  });
  if (def.decorate) def.decorate(room, g);
  if (def.moss) for (let i = 0; i < def.moss; i++) { const x = Math.floor(r() * RW * def.cols), y = Math.floor(r() * RH * def.rows); if (g[y][x] === '_') g[y][x] = 'm'; }
  return g;
}
// trace des rails entre deux tuiles (même ligne ou même colonne) : 'r' sur le sol, 'T' au-dessus du gouffre
function railLine(room, x0, y0, x1, y1) {
  const dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0); let x = x0, y = y0;
  for (;;) { const t = room.get(x, y); room.set(x, y, t === 'v' || t === 'T' ? 'T' : 'r'); if (x === x1 && y === y1) break; x += dx; y += dy; }
}

// ---------- rendu des tuiles (2 px écran par pixel monde, pré-rendu dans un canvas) ----------
const TP = TS * 2; // taille d'une tuile en pixels "haute densité"
// palettes des donjons en pierre : sol, détails, mousse, parois
const STONE = {
  cave:   { fl: '#2c3048', ln: '#22253a', sp: ['#343956', '#262a40', '#383d5a', '#30344e'], cr: '#111320', pa: '#262a3e', m1: '#1f4a4a', m2: '#6fe0d0', wall: '#191526', wsp: ['#18142a', '#1c1830', '#141022', '#201a32'], top: '#3a3354', s1: '#2a2440', s2: '#1c1830', sr: '#1a1528', face: '#2b2540', fl2: '#221d33', fsp: ['#3a3354', '#342e4c', '#262036'], ft: '#4a4266' },
  mine:   { fl: '#3a2e2a', ln: '#2c221e', sp: ['#463830', '#30261f', '#4a3a2e', '#3e3028'], cr: '#150f0c', pa: '#2e2420', m1: '#4a3a5a', m2: '#c88aff', wall: '#1a120e', wsp: ['#1e1510', '#22180f', '#160f0b', '#261b14'], top: '#5a4434', s1: '#3a2a20', s2: '#24180f', sr: '#1e140e', face: '#4a3628', fl2: '#382818', fsp: ['#5a4434', '#4e3a2c', '#3a2a1e'], ft: '#6a5240' },
  temple: { fl: '#24424a', ln: '#1a343c', sp: ['#2c4e56', '#1e3a42', '#30565e', '#284850'], cr: '#0e1e24', pa: '#1e3a40', m1: '#1f5a4a', m2: '#7fffd0', wall: '#0c1a20', wsp: ['#0e1e26', '#10222a', '#0a161c', '#12262e'], top: '#3a6a72', s1: '#244a52', s2: '#16323a', sr: '#12282e', face: '#2e5860', fl2: '#244a50', fsp: ['#3a6a72', '#346068', '#24484e'], ft: '#4e8a90' },
  tower:  { fl: '#3a3438', ln: '#2a2428', sp: ['#443e42', '#322c30', '#4a4246', '#3e383c'], cr: '#141012', pa: '#302a2e', m1: '#5a3a2a', m2: '#ffb050', wall: '#160f10', wsp: ['#1c1214', '#201618', '#140c0e', '#24181a'], top: '#6a3a32', s1: '#3a2422', s2: '#241614', sr: '#1e1212', face: '#5a302a', fl2: '#46241e', fsp: ['#6a3a32', '#7a463a', '#4a2a24'], ft: '#8a5040' },
  castle: { fl: '#2a2440', ln: '#1e1a30', sp: ['#322a4c', '#241e38', '#383052', '#2e2846'], cr: '#0e0a18', pa: '#221c36', m1: '#3a2a6a', m2: '#c3b3ff', wall: '#100c1c', wsp: ['#140e22', '#181028', '#0e0a18', '#1c142e'], top: '#4a3a7a', s1: '#2e2450', s2: '#1e1836', sr: '#181230', face: '#3a2c66', fl2: '#2e2252', fsp: ['#4a3a7a', '#42346e', '#2e2452'], ft: '#5e4c96' },
};
STONE.house = { fl: '#6a4a30', ln: '#4a3220', sp: ['#7a5638', '#5e4028', '#82603e', '#6e4c32'], cr: '#3a2414', pa: '#5a3e28', m1: '#8a3a3a', m2: '#c86a5a', wall: '#1a100a', wsp: ['#22140c', '#1e120a', '#160c06', '#26180e'], top: '#8a6a4a', s1: '#4a3020', s2: '#2a1a10', sr: '#24160c', face: '#b89a70', fl2: '#9a7a54', fsp: ['#c8aa80', '#a88a60', '#8a6a48'], ft: '#d8c098' };
// palettes des zones du royaume (herbe, chemins, arbres, eau, sable)
const OVER = {
  camp:     { g: '#355c57', gs: ['#39625a', '#2f5250', '#26494b', '#3d6a60'], gd: ['#8ff3ea', '#c3b3ff', '#ffcf7a'], blade: '#46786c', path: '#6a545e', ps: ['#7b6673', '#634f5c'], pl: '#897a92', wall: '#0f2228', foot: '#13282a', trunk: ['#3a2a28', '#4a3634', '#2e2020'], blob: ['#16332f', '#1c3d3e', '#24504c', '#2f6560'], water: ['#1b3f8f', '#2a5bc0', '#22489f'], sand: ['#9a8a64', '#a89870', '#8a7a58'] },
  collines: { g: '#3e6a4c', gs: ['#447452', '#38604a', '#2f5644', '#4a7a58'], gd: ['#ffe27a', '#ff8ab0', '#f4f7ff'], blade: '#5a8a60', path: '#7a6650', ps: ['#8a765e', '#6a5644'], pl: '#9a8a72', wall: '#132a20', foot: '#1a3424', trunk: ['#4a3424', '#5a4430', '#3a2818'], blob: ['#1e4030', '#28503a', '#346448', '#427858'], water: ['#1b4a8f', '#2a64c0', '#225a9f'], sand: ['#9a8a64', '#a89870', '#8a7a58'] },
  foret:    { g: '#24443a', gs: ['#284a3e', '#1e3a32', '#1a342c', '#2c5244'], gd: ['#8ff3ea', '#7be38f'], blade: '#356050', path: '#4a3e36', ps: ['#56483e', '#3e342c'], pl: '#665a4e', wall: '#06100c', foot: '#0a1612', trunk: ['#2e1e18', '#3e2a20', '#24170f'], blob: ['#0c1e18', '#12301f', '#1a3e2a', '#245034'], water: ['#163a6a', '#22508f', '#1c4478'], sand: ['#6a5a44', '#7a6a50', '#5a4a3a'] },
  montagne: { g: '#4c4e4a', gs: ['#55574f', '#3f413d', '#5c5a52', '#474843'], gd: ['#e8eef8', '#c8d0e0'], blade: '#62665a', path: '#6a6052', ps: ['#7a705e', '#5a5244'], pl: '#8a806e', wall: '#22222a', foot: '#2a2a32', trunk: null, blob: ['#3a3a42', '#4a4a54', '#5e5e6a', '#7a7a86'], water: ['#2a4a7a', '#3a64a0', '#30588a'], sand: ['#8a8278', '#9a9288', '#7a7268'], snow: true },
  lac:      { g: '#336058', gs: ['#38685e', '#2c5450', '#264a48', '#3e7066'], gd: ['#8ff3ea', '#ffcf7a'], blade: '#467e70', path: '#7a6a58', ps: ['#8a7a66', '#6a5a4a'], pl: '#9a8a76', wall: '#0f2228', foot: '#13282a', trunk: ['#3a2a28', '#4a3634', '#2e2020'], blob: ['#16332f', '#1c3d3e', '#24504c', '#2f6560'], water: ['#1b3f8f', '#2a5bc0', '#22489f'], sand: ['#b8a478', '#c8b488', '#a89468'] },
  cote:     { g: '#4a6a48', gs: ['#527250', '#42603f', '#3a5838', '#5a7a56'], gd: ['#ffe27a', '#f4f7ff'], blade: '#6a8a5a', path: '#a89470', ps: ['#b8a480', '#988460'], pl: '#c8b490', wall: '#1a2a20', foot: '#22342a', trunk: ['#5a4430', '#6a5440', '#4a3424'], blob: ['#2a4a30', '#34583a', '#40684a', '#4e7a58'], water: ['#123a7a', '#1e52a8', '#184690'], sand: ['#d8c490', '#e8d4a0', '#c8b480'] },
  terres:   { g: '#3a2a48', gs: ['#42304e', '#321f40', '#2a1a38', '#4a3658'], gd: ['#c3b3ff', '#8a6aaa'], blade: '#5a4470', path: '#4a3a48', ps: ['#56465a', '#3a2e3a'], pl: '#6a5a70', wall: '#0e0814', foot: '#140c1c', trunk: ['#2a1e2a', '#3a2a3a', '#1a121a'], blob: ['#1a1024', '#24163a', '#30204a', '#3e2c5c'], water: ['#2a1a4a', '#3a2a6a', '#2a2050'], sand: ['#5a4a5a', '#6a5a6a', '#4a3a4a'] },
};
OVER.royaume = OVER.camp;
function renderLayer(g, theme) {
  const SP = STONE[theme] || STONE.cave, O = OVER[theme] || OVER.camp;
  const h = g.length, w = g[0].length, c = document.createElement('canvas');
  c.width = w * TP; c.height = h * TP;
  const x2 = c.getContext('2d');
  // hasard déterministe propre à chaque case : modifier une tuile ne change pas le reste de la carte
  let r = Math.random;
  const seedAt = (tx, ty, k) => { const s = ((((tx + 7) * 73856093) ^ ((ty + 13) * 19349663) ^ ((k + 3) * 83492791)) >>> 0) % 2147483645 + 1; r = seeded(s); r(); };
  const F = (x, y, ww, hh, col) => { x2.fillStyle = col; x2.fillRect(x, y, ww, hh); };
  const edge = theme === 'camp' ? '#' : 'W';
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? edge : g[y][x];
  const isWall = t => t === '#' || t === 'W';
  const each = (k, fn) => { for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) { seedAt(tx, ty, k); fn(g[ty][tx], tx, ty, tx * TP, ty * TP); } };

  // passe 1 : sols
  each(1, (t, tx, ty, px, py) => {
    if (STONE[theme]) { floorCave(px, py, t === 'm' || t === 'r'); return; }
    if (t === 'S') { F(px, py, TP, TP, O.sand[0]); for (let i = 0; i < 22; i++) F(px + Math.floor(r() * TP), py + Math.floor(r() * TP), 1 + (r() < 0.4), 1, pick2(O.sand)); if (r() < 0.15) F(px + Math.floor(r() * 28), py + Math.floor(r() * 28), 3, 2, '#f0e8d8'); return; }
    if (t === '.' || t === ',' || isWall(t) || t === 'F' || t === '~') {
      if (theme === 'forest') { floorForest(px, py); return; }
      floorGrass(px, py, t);
    } else if (t === 'c') { // pavés
      F(px, py, TP, TP, '#3a3448');
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
        const sx = px + i * 8 + ((j & 1) ? 4 : 0) - 2, sy = py + j * 8;
        F(sx + 1, sy + 1, 6, 6, pick2(['#6a6478', '#5e5870', '#726c80', '#645e74'])); F(sx + 1, sy + 1, 6, 1, '#807a90');
      }
    } else if (t === 'P') {
      floorGrass(px, py);
    } else if (t === '=' || t === 'g' || (t >= '1' && t <= '9')) {
      F(px, py, TP, TP, O.path);
      for (let i = 0; i < 18; i++) { const sx = px + Math.floor(r() * 30), sy = py + Math.floor(r() * 30); F(sx, sy, 2, 1, O.ps[0]); F(sx + 1, sy + 1, 2, 1, O.ps[1]); }
      for (let i = 0; i < 3; i++) F(px + Math.floor(r() * 30), py + Math.floor(r() * 30), 2, 2, O.pl);
      const grass = n => n === '.' || n === ',';
      for (let i = 0; i < TP; i += 2) {
        if (grass(at(tx, ty - 1))) F(px + i, py, 2, 1 + Math.floor(r() * 3), O.g);
        if (grass(at(tx, ty + 1))) { const d = 1 + Math.floor(r() * 3); F(px + i, py + TP - d, 2, d, O.g); }
        if (grass(at(tx - 1, ty))) F(px, py + i, 1 + Math.floor(r() * 3), 2, O.g);
        if (grass(at(tx + 1, ty))) { const d = 1 + Math.floor(r() * 3); F(px + TP - d, py + i, d, 2, O.g); }
      }
    } else floorForest(px, py, t === 'm');
  });
  function floorGrass(px, py, t) {
    F(px, py, TP, TP, O.g);
    for (let i = 0; i < 26; i++) F(px + Math.floor(r() * TP), py + Math.floor(r() * TP), 1 + (r() < 0.3), 1, pick2(O.gs));
    if (r() < 0.5) F(px + Math.floor(r() * TP), py + Math.floor(r() * TP), 1, 1, pick2(O.gd));
    if (O.snow && r() < 0.3) { const sx = px + Math.floor(r() * 24), sy = py + Math.floor(r() * 26); F(sx, sy, 6, 3, '#d8e0ec'); F(sx + 1, sy - 1, 4, 1, '#e8eef8'); }
    if (!O.snow) for (let i = 0; i < 3; i++) { const gx = px + Math.floor(r() * 28), gy = py + Math.floor(r() * 28); F(gx, gy, 1, 3, O.blade); F(gx + 2, gy + 1, 1, 2, O.blade); }
    else for (let i = 0; i < 2; i++) F(px + Math.floor(r() * 26), py + Math.floor(r() * 26), 4, 3, pick2(['#5a5c58', '#3a3c38', '#6a6a64']));
    if (t === ',') for (let i = 0; i < 3; i++) { const fx = px + 4 + Math.floor(r() * 22), fy = py + 4 + Math.floor(r() * 22), col = pick2(['#ff8ab0', '#ffe27a', '#c3b3ff', '#f4f7ff']); F(fx, fy, 2, 2, col); F(fx - 1, fy + 1, 1, 1, col); F(fx + 2, fy + 1, 1, 1, col); F(fx, fy + 3, 1, 2, '#2a5a40'); }
  }
  function floorForest(px, py, moss) {
    F(px, py, TP, TP, '#22332f');
    for (let i = 0; i < 20; i++) F(px + Math.floor(r() * TP), py + Math.floor(r() * TP), 2, 1, pick2(['#2a3d38', '#1c2b28', '#33302c', '#2b2a35']));
    for (let i = 0; i < 2; i++) { const lx = px + Math.floor(r() * 28), ly = py + Math.floor(r() * 28); F(lx, ly, 3, 2, pick2(['#5a3a2a', '#6a4a2a', '#4a3a40'])); }
    if (moss) for (let i = 0; i < 10; i++) F(px + Math.floor(r() * 28), py + Math.floor(r() * 28), 3, 2, pick2(['#2f5a46', '#386a50', '#2a4d3d']));
  }
  function floorCave(px, py, moss) {
    const p = SP;
    F(px, py, TP, TP, p.fl);
    if (theme === 'house') { // parquet
      for (let j = 0; j < 4; j++) { F(px, py + j * 8, TP, 1, p.ln); const o = ((py / 8 + j) * 13) % 24; F(px + o, py + j * 8, 1, 8, p.ln); for (let i = 0; i < 4; i++) F(px + Math.floor(r() * 30), py + j * 8 + 2 + Math.floor(r() * 5), 3, 1, pick2(p.sp)); }
      return;
    }
    if (theme === 'tower' || theme === 'castle' || theme === 'temple') { // dalles
      F(px, py, TP, 1, p.ln); F(px, py, 1, TP, p.ln); F(px + 16, py, 1, TP, theme === 'castle' ? p.ln : p.fl);
      if (theme === 'castle' && ((px / TP + py / TP) & 1)) F(px + 1, py + 1, TP - 1, TP - 1, p.sp[1]);
    } else {
      if (r() < 0.55) F(px, py, TP, 1, p.ln);
      if (r() < 0.55) F(px, py, 1, TP, p.ln);
    }
    for (let i = 0; i < 16; i++) F(px + Math.floor(r() * TP), py + Math.floor(r() * TP), 2, 1, pick2(p.sp));
    if (r() < 0.3) { const cx = px + 4 + Math.floor(r() * 20), cy = py + 4 + Math.floor(r() * 20); F(cx, cy, 5, 1, p.cr); F(cx + 4, cy + 1, 3, 1, p.cr); }
    if (r() < 0.25) F(px + Math.floor(r() * 26), py + Math.floor(r() * 26), 4, 3, p.pa);
    if (moss) for (let i = 0; i < 6; i++) { const mx = px + Math.floor(r() * 28), my = py + Math.floor(r() * 28); F(mx, my, 2, 2, p.m1); if (r() < 0.5) F(mx, my, 1, 1, p.m2); }
  }

  // passe 2 : eau
  each(2, (t, tx, ty, px, py) => {
    if (t !== '~') return;
    F(px, py, TP, TP, O.water[0]);
    for (let i = 0; i < 5; i++) { const wx = px + Math.floor(r() * 24), wy = py + Math.floor(r() * 28); F(wx, wy, 6, 1, O.water[1]); F(wx + 2, wy + 1, 4, 1, O.water[2]); }
    const nw = n => n !== '~', sandy = n => n === 'S', bank = STONE[theme] ? SP.face : (sandy(at(tx, ty - 1)) ? O.sand[2] : O.path), bank2 = STONE[theme] ? SP.s2 : '#3a3038';
    if (nw(at(tx, ty - 1))) { F(px, py, TP, 4, bank); F(px, py + 4, TP, 2, '#6b94ff'); }
    if (nw(at(tx, ty + 1))) { F(px, py + TP - 3, TP, 3, bank2); }
    if (nw(at(tx - 1, ty))) { F(px, py, 3, TP, bank); F(px + 3, py, 1, TP, '#6b94ff'); }
    if (nw(at(tx + 1, ty))) { F(px + TP - 3, py, 3, TP, bank); F(px + TP - 4, py, 1, TP, '#6b94ff'); }
  });

  // passe 3 : gouffre et pont
  const pit = t => t === 'v' || t === 'b' || t === 'T';
  each(3, (t, tx, ty, px, py) => {
    if (!pit(t)) return;
    F(px, py, TP, TP, '#03040a');
    for (let i = 0; i < 3; i++) F(px + Math.floor(r() * 30), py + Math.floor(r() * 30), 1, 1, '#0c0d1a');
    if (!pit(at(tx, ty - 1))) { F(px, py, TP, 5, '#2b2540'); F(px, py + 5, TP, 4, '#1c1830'); F(px, py + 9, TP, 4, '#0e0c16'); F(px, py, TP, 1, '#463e64'); for (let i = 0; i < 3; i++) F(px + Math.floor(r() * 28), py + 2 + Math.floor(r() * 3), 3, 1, '#3a3354'); }
    if (!pit(at(tx, ty + 1))) { F(px, py + TP - 3, TP, 3, '#2b2540'); F(px, py + TP - 3, TP, 1, '#3a3354'); }
    if (t === 'b') {
      for (let yy = py; yy < py + TP; yy += 5) { F(px, yy, TP, 4, '#6a4224'); F(px, yy, TP, 1, '#8a5a34'); F(px + Math.floor(r() * 24), yy + 2, 6, 1, '#4a2a14'); }
      if (at(tx - 1, ty) !== 'b') { F(px, py, 3, TP, '#8a5a34'); F(px, py, 1, TP, '#b07a48'); }
      if (at(tx + 1, ty) !== 'b') { F(px + TP - 3, py, 3, TP, '#4a2a14'); }
    }
  });

  // passe 3b : rails (au sol 'r', sur tréteaux 'T')
  const rail = t => t === 'r' || t === 'T';
  each(8, (t, tx, ty, px, py) => {
    if (!rail(t)) return;
    const h = rail(at(tx - 1, ty)) || rail(at(tx + 1, ty)), v = rail(at(tx, ty - 1)) || rail(at(tx, ty + 1));
    if (t === 'T') { // poutres du tréteau
      if (v && !h) { F(px + 4, py, 4, TP, '#4a2a14'); F(px + 24, py, 4, TP, '#4a2a14'); for (let k = 0; k < TP; k += 10) F(px + 4, py + k, 24, 2, '#3a2010'); }
      else { F(px, py + 4, TP, 4, '#4a2a14'); F(px, py + 24, TP, 4, '#4a2a14'); for (let k = 0; k < TP; k += 10) F(px + k, py + 4, 2, 24, '#3a2010'); }
    }
    const sleeper = '#6a4224', steel = '#9a9eaa', steelD = '#5a5e6a';
    if (v) { for (let k = 2; k < TP; k += 8) { F(px + 6, py + k, 20, 4, sleeper); F(px + 6, py + k, 20, 1, '#8a5a34'); } F(px + 9, py, 2, TP, steel); F(px + 21, py, 2, TP, steel); F(px + 10, py, 1, TP, steelD); F(px + 22, py, 1, TP, steelD); }
    if (h) { for (let k = 2; k < TP; k += 8) { F(px + k, py + 6, 4, 20, sleeper); F(px + k, py + 6, 1, 20, '#8a5a34'); } F(px, py + 9, TP, 2, steel); F(px, py + 21, TP, 2, steel); F(px, py + 11, TP, 1, steelD); F(px, py + 23, TP, 1, steelD); }
    if (!h && !v) { F(px + 6, py + 12, 20, 8, sleeper); }
  });

  // passe 4 : sorties sombres
  each(4, (t, tx, ty, px, py) => {
    if (!DOORWAYS.has(t)) return;
    F(px, py, TP, TP, '#05080f');
    const next = at(tx, ty + 1);
    if (!DOORWAYS.has(next)) for (let i = 0; i < TP; i += 2) F(px + i, py + TP - 6 + Math.floor(r() * 4), 2, 8, STONE[theme] ? SP.wall : '#0b1420');
    if ((t === 'E' || t === 'D') && STONE[theme] && !DOORWAYS.has(at(tx, ty - 1))) for (let i = 0; i < TP; i += 2) F(px + i, py, 2, 4 + Math.floor(r() * 4), SP.wall);
  });

  // passe 5 : souches (forêt) et stalagmites (grotte)
  each(5, (t, tx, ty, px, py) => {
    if (t === 's') {
      x2.fillStyle = 'rgba(0,0,0,.35)'; x2.beginPath(); x2.ellipse(px + 16, py + 26, 15, 5, 0, 0, 7); x2.fill();
      F(px + 4, py + 10, 24, 16, '#4a3020'); F(px + 4, py + 10, 3, 16, '#5a3a26'); F(px + 22, py + 12, 4, 14, '#3a2418');
      F(px + 2, py + 22, 6, 4, '#4a3020'); F(px + 24, py + 22, 6, 4, '#3a2418');
      F(px + 4, py + 4, 24, 9, '#8a6a4a'); F(px + 6, py + 5, 20, 7, '#a07a50'); F(px + 10, py + 7, 12, 3, '#8a6a4a'); F(px + 14, py + 8, 4, 1, '#6a4a30');
    } else if (t === 'P') { // pieux de la palissade
      x2.fillStyle = 'rgba(0,0,0,.35)'; x2.fillRect(px, py + 26, TP, 6);
      F(px, py + 10, TP, 4, '#5a3418'); F(px, py + 20, TP, 4, '#5a3418');
      for (let i = 0; i < 4; i++) { const sx = px + i * 8; F(sx + 1, py - 6, 6, 34, '#7a4a24'); F(sx + 1, py - 6, 2, 34, '#9a6a3a'); F(sx + 2, py - 9, 4, 3, '#7a4a24'); F(sx + 3, py - 11, 2, 2, '#7a4a24'); }
    } else if (t === 'k') {
      x2.fillStyle = 'rgba(0,0,0,.45)'; x2.beginPath(); x2.ellipse(px + 16, py + 28, 14, 4, 0, 0, 7); x2.fill();
      F(px + 6, py + 20, 20, 8, '#2b2540'); F(px + 6, py + 20, 20, 2, '#3a3354');
      F(px + 9, py + 8, 14, 14, '#3a3354'); F(px + 12, py + 2, 8, 8, '#3a3354'); F(px + 14, py - 3, 4, 6, '#4a4266');
      F(px + 9, py + 8, 3, 14, '#4f4770'); F(px + 12, py + 2, 2, 8, '#4f4770'); F(px + 20, py + 9, 3, 13, '#241f33');
      F(px + 15, py + 12, 2, 2, '#5a5280');
    }
  });

  // passe 6 : murs
  if (STONE[theme]) {
    const p = SP;
    each(6, (t, tx, ty, px, py) => {
      if (!isWall(t)) return;
      const open = n => !isWall(n);
      F(px, py, TP, TP, p.wall);
      for (let i = 0; i < 4; i++) F(px + Math.floor(r() * 26), py + Math.floor(r() * 26), 4 + Math.floor(r() * 5), 3, pick2(p.wsp));
      if (open(at(tx, ty - 1))) { F(px, py, TP, 2, p.top); for (let i = 0; i < TP; i += 4) if (r() < 0.5) F(px + i, py + 2, 4, 1, p.face); }
      if (open(at(tx - 1, ty))) { F(px, py, 2, TP, p.s1); F(px + 2, py, 1, TP, p.s2); }
      if (open(at(tx + 1, ty))) { F(px + TP - 2, py, 2, TP, p.sr); }
      if (open(at(tx, ty + 1))) { // face de la paroi, vue de face
        const fh = 16, fy = py + TP - fh;
        F(px, fy, TP, fh, p.face);
        if (theme === 'tower' || theme === 'castle') { for (let yy = fy + 4; yy < py + TP; yy += 5) { F(px, yy, TP, 1, p.fl2); for (let xx = px + ((yy / 5) & 1) * 4; xx < px + TP; xx += 8) F(xx, yy - 4, 1, 4, p.fl2); } }
        else for (let yy = fy + 4; yy < py + TP; yy += 4) F(px, yy, TP, 1, p.fl2);
        for (let i = 0; i < 4; i++) F(px + Math.floor(r() * 28), fy + 2 + Math.floor(r() * 12), 3 + Math.floor(r() * 4), 2, pick2(p.fsp));
        F(px, fy, TP, 2, p.ft); F(px, fy + 2, TP, 1, p.top);
        F(px, py + TP, TP, 3, 'rgba(0,0,0,.45)');
        if (theme === 'cave' && r() < 0.3) { const sx = px + 6 + Math.floor(r() * 18); F(sx, py + TP, 3, 3, p.top); F(sx + 1, py + TP + 3, 1, 2, p.top); } // petite stalactite
        if (theme === 'mine' && r() < 0.18) { const sx = px + 4 + Math.floor(r() * 22); F(sx, fy - 2, 3, 16, '#6a4224'); F(sx, fy - 2, 1, 16, '#8a5a34'); } // étai
        if (theme === 'mine' && r() < 0.12) { const sx = px + 6 + Math.floor(r() * 18), sy = fy + 4 + Math.floor(r() * 6); F(sx, sy, 3, 3, pick2(['#c88aff', '#8ff3ea', '#ffcf7a'])); F(sx, sy, 1, 1, '#fff'); } // cristal
        if (theme === 'temple' && r() < 0.2) { const sx = px + 6 + Math.floor(r() * 18); F(sx, fy + 2, 2, 12, '#1f5a4a'); F(sx + 2, fy + 6, 2, 8, '#2a7a5a'); } // algues
      }
    });
    return c;
  }
  each(6, (t, tx, ty, px, py) => {
    if (!isWall(t)) return;
    const dark = theme === 'forest';
    F(px, py, TP, TP, dark ? '#08120f' : O.wall);
    const below = at(tx, ty + 1);
    if (!isWall(below) && !EXITS.has(below)) { // pied des arbres (ou des rochers)
      F(px, py + TP - 10, TP, 10, dark ? '#0c1714' : O.foot);
      if (dark || O.trunk) for (let i = 0; i < 2; i++) { const tr = dark ? ['#2e1e18', '#3e2a20', '#24170f'] : O.trunk, bx = px + 4 + Math.floor(r() * 20); F(bx, py + 14, 6, TP - 12, tr[0]); F(bx, py + 14, 2, TP - 12, tr[1]); F(bx - 2, py + TP - 3, 10, 3, tr[2]); }
      F(px, py + TP, TP, 3, 'rgba(0,0,0,.35)');
    }
  });
  const blobCols = theme === 'forest' ? ['#0f2420', '#163a30', '#1d4a3c', '#26584a'] : O.blob;
  each(7, (t, tx, ty, px, py) => {
    if (!isWall(t)) return;
    const below = at(tx, ty + 1), open = !isWall(below) && !EXITS.has(below);
    for (let i = 0; i < 3; i++) { const cx = px + 6 + r() * 20, cy = py + 4 + r() * (open ? 10 : 22), rr = 9 + r() * 7; blob(cx, cy, rr); }
  });
  function blob(cx, cy, rr) {
    x2.fillStyle = blobCols[0]; circ(cx, cy + 2, rr);
    x2.fillStyle = blobCols[1]; circ(cx, cy, rr - 1);
    x2.fillStyle = blobCols[2]; circ(cx - rr * 0.25, cy - rr * 0.3, rr * 0.6);
    x2.fillStyle = blobCols[3]; circ(cx - rr * 0.4, cy - rr * 0.45, rr * 0.25);
    for (let i = 0; i < 4; i++) { const a = r() * 6.28, d = r() * rr * 0.8; F(Math.round(cx + Math.cos(a) * d), Math.round(cy + Math.sin(a) * d), 2, 1, blobCols[0]); }
  }
  function circ(x, y, rr) { // cercle "pixel" (sans anti-aliasing)
    for (let j = -Math.ceil(rr); j <= rr; j++) { const hw = Math.floor(Math.sqrt(Math.max(0, rr * rr - j * j))); x2.fillRect(Math.round(x - hw), Math.round(y + j), hw * 2, 1); }
  }
  function pick2(a) { return a[Math.floor(r() * a.length)]; }
  return c;
}
