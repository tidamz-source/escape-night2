'use strict';
// ---------- cartes ----------
// Tuiles : '.' herbe  ',' herbe fleurie  '=' chemin  '~' eau  '#' forêt dense (mur)  'F' entrée de la forêt
//          '_' sol de forêt  'm' mousse  'W' mur de racines  's' souche  'E' sortie du donjon
const SOLID = new Set(['#', '~', 'W', 's']);

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
  rect(20, 1, 8, 6, '.'); rect(22, 0, 4, 2, 'F'); rect(23, 2, 2, 17, '=');
  // chemins
  rect(5, 19, 37, 2, '='); rect(12, 11, 2, 8, '='); rect(40, 21, 2, 3, '=');
  // lac
  for (let y = 21; y < 32; y++) for (let x = 26; x < 44; x++) {
    const v = ((x + 0.5 - 35) / 6.8) ** 2 + ((y + 0.5 - 26.8) / 3.7) ** 2;
    if (v < 1 + (r() - 0.5) * 0.25) set(x, y, '~');
  }
  // fleurs
  for (let i = 0; i < 70; i++) { const x = Math.floor(r() * w), y = Math.floor(r() * h); if (g[y][x] === '.') g[y][x] = ','; }
  return g;
}

function buildForest() {
  const g = makeGrid(30, 34, 'W'), { set, rect } = gridTools(g), r = seeded(5);
  rect(2, 2, 26, 13, '_');   // salle 2 (haut)
  rect(2, 19, 26, 13, '_');  // salle 1 (bas)
  // bords organiques
  for (const [y0, y1] of [[2, 14], [19, 31]]) {
    for (let x = 2; x < 28; x++) { if (Math.abs(x - 14.5) > 2 && r() < 0.35) set(x, y0, 'W'); if (Math.abs(x - 14.5) > 2 && r() < 0.35) set(x, y1, 'W'); }
    for (let y = y0; y <= y1; y++) { if (r() < 0.35) set(2, y, 'W'); if (r() < 0.35) set(27, y, 'W'); }
  }
  rect(14, 14, 2, 6, '_');   // passage de la porte
  rect(14, 31, 2, 1, '_'); rect(14, 32, 2, 2, 'E'); // sortie vers le camping
  // souches
  for (const [x, y] of [[6, 22], [23, 22], [6, 28], [23, 28], [7, 5], [22, 5], [7, 11], [22, 11]]) set(x, y, 's');
  for (let i = 0; i < 90; i++) { const x = 2 + Math.floor(r() * 26), y = 2 + Math.floor(r() * 30); if (g[y][x] === '_') g[y][x] = 'm'; }
  return g;
}

// ---------- rendu des tuiles (2 px écran par pixel monde, pré-rendu dans un canvas) ----------
const TP = TS * 2; // taille d'une tuile en pixels "haute densité"
function renderLayer(g, theme) {
  const h = g.length, w = g[0].length, c = document.createElement('canvas');
  c.width = w * TP; c.height = h * TP;
  const x2 = c.getContext('2d'), r = seeded(theme === 'forest' ? 99 : 42);
  const F = (x, y, ww, hh, col) => { x2.fillStyle = col; x2.fillRect(x, y, ww, hh); };
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? (theme === 'forest' ? 'W' : '#') : g[y][x];
  const isWall = t => t === '#' || t === 'W';

  // passe 1 : sols
  for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
    const t = g[ty][tx], px = tx * TP, py = ty * TP;
    if (t === '.' || t === ',' || isWall(t) || t === 'F' || t === '~') {
      if (theme === 'forest') { floorForest(px, py); continue; }
      F(px, py, TP, TP, '#355c57');
      for (let i = 0; i < 26; i++) F(px + Math.floor(r() * TP), py + Math.floor(r() * TP), 1 + (r() < 0.3), 1, pick2(['#39625a', '#2f5250', '#26494b', '#3d6a60']));
      if (r() < 0.5) F(px + Math.floor(r() * TP), py + Math.floor(r() * TP), 1, 1, pick2(['#8ff3ea', '#c3b3ff', '#ffcf7a']));
      for (let i = 0; i < 3; i++) { const gx = px + Math.floor(r() * 28), gy = py + Math.floor(r() * 28); F(gx, gy, 1, 3, '#46786c'); F(gx + 2, gy + 1, 1, 2, '#46786c'); }
      if (t === ',') for (let i = 0; i < 3; i++) { const fx = px + 4 + Math.floor(r() * 22), fy = py + 4 + Math.floor(r() * 22), col = pick2(['#ff8ab0', '#ffe27a', '#c3b3ff', '#f4f7ff']); F(fx, fy, 2, 2, col); F(fx - 1, fy + 1, 1, 1, col); F(fx + 2, fy + 1, 1, 1, col); F(fx, fy + 3, 1, 2, '#2a5a40'); }
    } else if (t === '=') {
      F(px, py, TP, TP, '#6a545e');
      for (let i = 0; i < 18; i++) { const sx = px + Math.floor(r() * 30), sy = py + Math.floor(r() * 30); F(sx, sy, 2, 1, '#7b6673'); F(sx + 1, sy + 1, 2, 1, '#634f5c'); }
      for (let i = 0; i < 3; i++) F(px + Math.floor(r() * 30), py + Math.floor(r() * 30), 2, 2, '#897a92');
      // bords grignotés par l'herbe
      const grass = n => n === '.' || n === ',';
      for (let i = 0; i < TP; i += 2) {
        if (grass(at(tx, ty - 1))) F(px + i, py, 2, 1 + Math.floor(r() * 3), '#355c57');
        if (grass(at(tx, ty + 1))) { const d = 1 + Math.floor(r() * 3); F(px + i, py + TP - d, 2, d, '#355c57'); }
        if (grass(at(tx - 1, ty))) F(px, py + i, 1 + Math.floor(r() * 3), 2, '#355c57');
        if (grass(at(tx + 1, ty))) { const d = 1 + Math.floor(r() * 3); F(px + TP - d, py + i, d, 2, '#355c57'); }
      }
    } else if (t === '_' || t === 'm' || t === 's' || t === 'E') {
      floorForest(px, py, t === 'm');
    }
  }
  function floorForest(px, py, moss) {
    F(px, py, TP, TP, '#22332f');
    for (let i = 0; i < 20; i++) F(px + Math.floor(r() * TP), py + Math.floor(r() * TP), 2, 1, pick2(['#2a3d38', '#1c2b28', '#33302c', '#2b2a35']));
    for (let i = 0; i < 2; i++) { const lx = px + Math.floor(r() * 28), ly = py + Math.floor(r() * 28); F(lx, ly, 3, 2, pick2(['#5a3a2a', '#6a4a2a', '#4a3a40'])); }
    if (moss) for (let i = 0; i < 10; i++) F(px + Math.floor(r() * 28), py + Math.floor(r() * 28), 3, 2, pick2(['#2f5a46', '#386a50', '#2a4d3d']));
  }

  // passe 2 : eau
  for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
    if (g[ty][tx] !== '~') continue;
    const px = tx * TP, py = ty * TP;
    F(px, py, TP, TP, '#1b3f8f');
    for (let i = 0; i < 5; i++) { const wx = px + Math.floor(r() * 24), wy = py + Math.floor(r() * 28); F(wx, wy, 6, 1, '#2a5bc0'); F(wx + 2, wy + 1, 4, 1, '#22489f'); }
    const nw = n => n !== '~';
    if (nw(at(tx, ty - 1))) { F(px, py, TP, 4, '#6a545e'); F(px, py + 4, TP, 2, '#6b94ff'); }
    if (nw(at(tx, ty + 1))) { F(px, py + TP - 3, TP, 3, '#4f3f48'); }
    if (nw(at(tx - 1, ty))) { F(px, py, 3, TP, '#6a545e'); F(px + 3, py, 1, TP, '#6b94ff'); }
    if (nw(at(tx + 1, ty))) { F(px + TP - 3, py, 3, TP, '#6a545e'); F(px + TP - 4, py, 1, TP, '#6b94ff'); }
  }

  // passe 3 : entrée de la forêt
  for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
    if (g[ty][tx] !== 'F') continue;
    const px = tx * TP, py = ty * TP;
    F(px, py, TP, TP, '#05080f');
    if (g[ty + 1] && g[ty + 1][tx] !== 'F') for (let i = 0; i < TP; i += 2) F(px + i, py + TP - 6 + Math.floor(r() * 4), 2, 8, '#0b1420');
  }

  // passe 4 : souches
  for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
    if (g[ty][tx] !== 's') continue;
    const px = tx * TP, py = ty * TP;
    x2.fillStyle = 'rgba(0,0,0,.35)'; x2.beginPath(); x2.ellipse(px + 16, py + 26, 15, 5, 0, 0, 7); x2.fill();
    F(px + 4, py + 10, 24, 16, '#4a3020'); F(px + 4, py + 10, 3, 16, '#5a3a26'); F(px + 22, py + 12, 4, 14, '#3a2418');
    F(px + 2, py + 22, 6, 4, '#4a3020'); F(px + 24, py + 22, 6, 4, '#3a2418');
    F(px + 4, py + 4, 24, 9, '#8a6a4a'); F(px + 6, py + 5, 20, 7, '#a07a50'); F(px + 10, py + 7, 12, 3, '#8a6a4a'); F(px + 14, py + 8, 4, 1, '#6a4a30');
  }

  // passe 5 : murs (canopée qui déborde sur les cases voisines)
  for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
    const t = g[ty][tx]; if (!isWall(t)) continue;
    const px = tx * TP, py = ty * TP, dark = theme === 'forest';
    F(px, py, TP, TP, dark ? '#08120f' : '#0f2228');
    const below = at(tx, ty + 1);
    if (!isWall(below) && below !== 'F') { // pied des arbres
      F(px, py + TP - 10, TP, 10, dark ? '#0c1714' : '#13282a');
      for (let i = 0; i < 2; i++) { const bx = px + 4 + Math.floor(r() * 20); F(bx, py + 14, 6, TP - 12, dark ? '#2e1e18' : '#3a2a28'); F(bx, py + 14, 2, TP - 12, dark ? '#3e2a20' : '#4a3634'); F(bx - 2, py + TP - 3, 10, 3, dark ? '#24170f' : '#2e2020'); }
      F(px, py + TP, TP, 3, 'rgba(0,0,0,.35)');
    }
  }
  const blobCols = theme === 'forest' ? ['#0f2420', '#163a30', '#1d4a3c', '#26584a'] : ['#16332f', '#1c3d3e', '#24504c', '#2f6560'];
  for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
    if (!isWall(g[ty][tx])) continue;
    const px = tx * TP, py = ty * TP, open = !isWall(at(tx, ty + 1)) && at(tx, ty + 1) !== 'F';
    const n = 3;
    for (let i = 0; i < n; i++) {
      const cx = px + 6 + r() * 20, cy = py + 4 + r() * (open ? 10 : 22), rr = 9 + r() * 7;
      blob(cx, cy, rr);
    }
  }
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
