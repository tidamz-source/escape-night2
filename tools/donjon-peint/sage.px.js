// Escape Night 2 — maison du sage (bibliothèque), repeinte en pixel art.
// Même disposition que l'ancienne image : 640 × 358 (2 px par pixel de jeu), grille de collision `biblio` (maps.js) inchangée.
pal({
  k: "#1d0c16", K: "#2a1420",                                                       // noirs violacés de l'original
  B: "#431e22", b: "#603532", n: "#824f42", N: "#9b5a45", L: "#b8785a",          // bois brun-rouge
  q: "#533133", Q: "#73443d",                                                       // ombre du plancher
  s: "#463034", S: "#6a5458", t: "#7e6155", T: "#957b68",                         // pierre gris-mauve
  p: "#7c6458", P: "#a58569", c: "#deb883",                                         // plâtre, parchemin
  u: "#353957", U: "#3b4165", v: "#61678a",                                         // tapis bleu nuit
  r: "#8a2a2a", R: "#b84a3a", g: "#2e5a3a", G: "#4a7a4a", y: "#c88a3a", Y: "#ecc65a",
  o: "#ff8020", O: "#fdcd58", w: "#fff2c0",
  m: "#6a2a5a", M: "#9a4a8a", e: "#c8b8a0", E: "#ead8b8",
  W: "#feec95",
})
ramps("kKBbnNL", "kqQ", "kstT", "kpPc", "kuUv", "krR", "kgG", "kyY", "koOw", "kmM", "keE")
const H = (x, y, w, k) => [hline(x, y, w, k)]
// ---------- pièces ----------
function plank(c, x0, y0, x1, y1) {                       // plancher : lames horizontales, joints décalés, nœuds
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const row = Math.floor((y - y0) / 12), off = (row * 37) % 60, seam = (x + off) % 60
    let k = row % 3 === 0 ? "n" : row % 3 === 1 ? "b" : "n"
    if ((y - y0) % 12 === 0) k = "N"; if ((y - y0) % 12 === 11 || seam === 0) k = "B"
    c.px(x, y, k)
  }
}
function shelf(c, x, y, w, h) {                           // bibliothèque pleine de livres
  c.rect(x - 2, y - 2, w + 4, h + 4, "k"); c.rect(x, y - 6, w, 6, "N"); c.hline(x, y - 6, w, "L"); c.rect(x, y, w, h, "B"); c.rect(x + 3, y + 3, w - 6, h - 6, "K"); c.vline(x, y, h, "n"); c.vline(x + w - 1, y, h, "k"); c.hline(x, y, w, "N")
  const cols = "rgUyRmGv"
  for (let sy = y + 6; sy < y + h - 12; sy += 24) {
    c.rect(x + 3, sy + 18, w - 6, 3, "n"); c.hline(x + 3, sy + 18, w - 6, "L")
    let bx = x + 5; let i = (sy + x) % 7
    while (bx < x + w - 8) { const bw = 4 + (i * 3) % 3, bh = 13 + (i * 5) % 5, k = cols[i % cols.length]; c.rect(bx, sy + 18 - bh, bw, bh, k); c.vline(bx, sy + 18 - bh, bh, "k"); c.hline(bx + 1, sy + 18 - bh + 3, bw - 1, "Y"); bx += bw + 1; i++ }
  }
}
function table(c, x, y, w, h, top = 16) {
  const fr = Math.max(6, top / 3 | 0), tp = top - fr                                     // dessus vu en plongée + bandeau avant
  c.rect(x - 1, y - 1, w + 2, top + 2, "k")
  c.rect(x, y, w, tp, "N"); for (let yy = y + 3; yy < y + tp; yy += 4) c.hline(x + 2, yy, w - 4, "n"); c.hline(x, y, w, "L"); c.vline(x, y, tp, "L")
  for (let i = 0; i < w / 18; i++) c.hline(x + 4 + (i * 37) % (w - 12), y + 2 + (i * 5) % Math.max(1, tp - 3), 6, "b")   // veinage du plateau
  c.rect(x, y + tp, w, fr, "b"); c.hline(x, y + tp, w, "n"); c.hline(x, y + top - 1, w, "B")
  for (const lx of [x + 3, x + w - 9]) { c.rect(lx, y + top, 6, h - top, "b"); c.vline(lx, y + top, h - top, "n"); c.vline(lx + 5, y + top, h - top, "B"); c.hline(lx, y + h - 1, 6, "k") }
  c.rect(x + 9, y + top, w - 18, 3, "B")
}
function candle(c, x, y) { c.rect(x - 4, y + 8, 9, 3, "y"); c.rect(x - 2, y, 5, 8, "E"); c.vline(x - 2, y, 8, "e"); c.vline(x, y - 2, 2, "k"); c.px(x, y - 5, "w"); c.rect(x - 1, y - 4, 3, 2, "O"); c.px(x, y - 6, "O") }
function barrel(c, x, y, w, h) {
  c.ellipse(x + w / 2, y + h - 3, w / 2 - 1, 3, "B")
  for (let yy = y + 4; yy < y + h - 3; yy++) { const t = (yy - y) / h, bulge = Math.round(Math.sin(t * Math.PI) * 3); for (let xx = x - bulge; xx < x + w + bulge; xx++) { const u = (xx - x + bulge) / (w + 2 * bulge); c.px(xx, yy, u < 0.15 ? "B" : u < 0.35 ? "b" : u < 0.7 ? "n" : u < 0.85 ? "N" : "b"); if (((xx - x) % 6) === 0 && u > 0.1 && u < 0.9) c.px(xx, yy, "b") } }
  for (const yy of [y + 9, y + h - 10]) { const bulge = Math.round(Math.sin(((yy - y) / h) * Math.PI) * 3); c.hline(x - bulge, yy, w + 2 * bulge, "s"); c.hline(x - bulge, yy + 1, w + 2 * bulge, "S") }
  c.ellipse(x + w / 2, y + 4, w / 2, 4, "N"); c.ellipse(x + w / 2, y + 4, w / 2 - 3, 2, "n"); c.ellipse(x + w / 2, y + 4, w / 2, 4, "B", true)
}
function crate(c, x, y, w, h) {
  const tp = Math.round(h * 0.3)
  c.rect(x - 1, y - 1, w + 2, h + 2, "k")
  c.rect(x, y, w, tp, "N"); c.hline(x, y, w, "L"); for (let yy = y + 3; yy < y + tp; yy += 4) c.hline(x + 2, yy, w - 4, "n")
  c.rect(x, y + tp, w, h - tp, "n"); c.box(x, y + tp, w, h - tp, "B"); c.box(x + 2, y + tp + 2, w - 4, h - tp - 4, "b"); c.line(x + 3, y + tp + 3, x + w - 4, y + h - 4, "N"); c.line(x + 3, y + tp + 4, x + w - 4, y + h - 3, "b")
}
function scroll(c, x, y, len, dir = 1) { c.rect(x, y, len, 5, "c"); c.hline(x, y, len, "E"); c.rect(x - 2, y - 1, 3, 7, "P"); c.rect(x + len - 1, y - 1, 3, 7, "P") }
function paper(c, x, y) { c.poly([x, y, x + 14, y - 3, x + 17, y + 6, x + 3, y + 9], "c"); c.line(x + 3, y + 2, x + 12, y, "P"); c.line(x + 4, y + 5, x + 13, y + 3, "P") }
function book(c, x, y, k) { c.rect(x, y, 16, 11, k); c.hline(x, y, 16, "Y"); c.rect(x + 2, y + 8, 14, 3, "E") }
function windowW(c, x, y, w, h) { c.rect(x - 6, y - 6, w + 12, h + 12, "b"); c.box(x - 6, y - 6, w + 12, h + 12, "B"); c.hline(x - 6, y - 6, w + 12, "N"); c.rect(x, y, w, h, "W"); for (let i = 1; i < 4; i++) { c.rect(x + (w * i / 4 | 0) - 1, y, 3, h, "b"); c.rect(x, y + (h * i / 4 | 0) - 1, w, 3, "b") } c.rect(x - 8, y + h + 4, w + 16, 5, "n"); c.hline(x - 8, y + h + 4, w + 16, "L") }
function lantern(c, x, y) { c.vline(x, y - 12, 12, "k"); c.rect(x - 6, y, 13, 3, "k"); c.rect(x - 5, y + 3, 11, 12, "K"); c.rect(x - 3, y + 5, 7, 8, "O"); c.px(x, y + 8, "w"); c.rect(x - 6, y + 15, 13, 3, "k") }

scene("biblio", { w: 640, h: 358, bg: "k" },
  layer("pièce", c => {
    // mur du fond : plâtre clair uni en haut, soubassement de pierre en bas, entre les poteaux
    for (let y = 22; y < 106; y++) for (let x = 78; x < 562; x++) { const row = (y - 22) / 9 | 0, sx = (x + (row % 2) * 13) % 26; c.px(x, y, (y - 22) % 9 === 8 || sx === 25 ? "t" : ((x / 26 | 0) + row) % 5 === 0 ? "P" : "T") }   // pierre claire appareillée
    for (let y = 106; y < 155; y++) for (let x = 78; x < 562; x++) { const row = (y - 106) >> 3, sx = (x + (row % 2) * 12) % 24; c.px(x, y, (y - 106) % 8 === 7 || sx === 23 ? "s" : ((x >> 3) + row) % 4 ? "T" : "t") }
    for (const x of [78, 168, 250, 380, 462, 552]) { c.rect(x, 22, 10, 133, "b"); c.vline(x, 22, 133, "N"); c.vline(x + 9, 22, 133, "B") }
    c.rect(78, 18, 484, 10, "b"); c.hline(78, 18, 484, "N"); c.rect(78, 100, 484, 6, "b"); c.hline(78, 100, 484, "N")
    c.line(92, 30, 162, 96, "b"); c.line(93, 30, 163, 96, "B"); c.line(474, 96, 546, 30, "b"); c.line(475, 96, 547, 30, "B")
    // pans de mur latéraux en biais (plâtre dans l'ombre, soubassement de pierre)
    c.poly([22, 70, 78, 22, 78, 155, 22, 178], "t"); for (let y = 40; y < 150; y += 10) c.line(22, y + 40 - (y - 40) * 0, 78, y, "s"); c.poly([22, 128, 78, 112, 78, 155, 22, 178], "t"); c.line(22, 128, 78, 112, "s")
    c.poly([562, 22, 618, 70, 618, 178, 562, 155], "t"); for (let y = 40; y < 150; y += 10) c.line(562, y, 618, y + 40, "s"); c.poly([562, 112, 618, 128, 618, 178, 562, 155], "t"); c.line(562, 112, 618, 128, "s")
    // plancher : chaque lame a sa teinte, son veinage, ses fissures et ses nœuds
    const hsh = (x, y, z = 0) => { let n = (x * 374761393 + y * 668265263 + z * 974711) | 0; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967296 }
    for (let y = 155; y < 335; y++) for (let x = 22; x < 618; x++) {
      const row = Math.floor((y - 155) / 14), ly = (y - 155) % 14, off = (row * 53) % 140, board = Math.floor((x + off) / 140), bx = (x + off) % 140
      const tone = hsh(board, row, 1), base = tone < 0.33 ? "Q" : tone < 0.75 ? "n" : "N"
      let k = base
      const grain = Math.sin((bx + hsh(board, row, 2) * 60) * 0.09 + ly * 0.7) > 0.93                       // veinage le long de la lame
      if (grain) k = base === "N" ? "n" : "q"
      if (ly === 0) k = base === "Q" ? "n" : "L"                                                           // arête éclairée
      if (ly === 13 || bx === 0) k = "B"                                                                   // joint sombre
      if (ly === 12) k = "q"
      c.px(x, y, k)
    }
    for (let i = 0; i < 70; i++) {                                                                         // fissures du bois, dans le sens des lames
      const row = Math.floor(hsh(i, 1, 3) * 12), y = 155 + row * 14 + 3 + Math.floor(hsh(i, 2, 3) * 8), x = 30 + Math.floor(hsh(i, 3, 3) * 570), len = 8 + Math.floor(hsh(i, 4, 3) * 22)
      let yy = y; for (let d = 0; d < len; d++) { c.px(x + d, yy, "B"); if (hsh(i, d, 5) < 0.18) yy += hsh(i, d, 6) < 0.5 ? -1 : 1; if (yy < 155 + row * 14 + 2 || yy > 155 + row * 14 + 10) yy = y }
    }
    for (let i = 0; i < 26; i++) { const x = 30 + Math.floor(hsh(i, 9, 7) * 570), row = Math.floor(hsh(i, 8, 7) * 12), y = 155 + row * 14 + 6; c.ellipse(x, y, 3, 2, "q"); c.px(x, y, "B"); c.hline(x - 6, y - 1, 4, "q"); c.hline(x + 4, y + 1, 4, "q") }  // nœuds
    c.rect(22, 155, 596, 3, "q")
    // bord avant, sortie au milieu
    c.rect(22, 335, 264, 22, "B"); c.hline(22, 335, 264, "b"); c.rect(354, 335, 264, 22, "B"); c.hline(354, 335, 264, "b")
    for (let y = 335; y < 358; y++) for (let x = 286; x < 354; x++) c.px(x, y, (y - 335) % 14 === 13 ? "q" : "n")
    // épais contour sombre de la pièce, comme dans l'original
    for (const [x0, y0, x1, y1] of [[22, 70, 78, 22], [78, 22, 562, 22], [562, 22, 618, 70]]) for (let d = 0; d < 4; d++) c.line(x0, y0 - d, x1, y1 - d, d < 2 ? "B" : "K")
    c.rect(18, 70, 5, 287, "B"); c.rect(617, 70, 5, 287, "B"); c.vline(18, 70, 287, "K"); c.vline(621, 70, 287, "K")
    c.rect(282, 335, 4, 23, "B"); c.rect(354, 335, 4, 23, "B")
  }),
  layer("fond", c => {
    // cheminée de pierre et âtre
    for (let y = 2; y < 92; y++) for (let x = 298; x < 344; x++) { const row = y >> 3, sx = (x + (row % 2) * 8) % 16; c.px(x, y, y % 8 === 7 || sx === 15 ? "s" : (x >> 4) % 2 ? "t" : "T") }
    c.rect(272, 80, 96, 12, "b"); c.hline(272, 80, 96, "L"); c.hline(272, 91, 96, "B")
    for (let y = 92; y < 160; y++) for (let x = 278; x < 362; x++) { const row = (y - 92) >> 3, sx = (x + (row % 2) * 10) % 20; c.px(x, y, (y - 92) % 8 === 7 || sx === 19 ? "s" : "t") }
    c.rect(296, 112, 48, 44, "k"); c.poly([296, 112, 320, 102, 344, 112], "k")
    c.poly([304, 156, 310, 132, 316, 144, 322, 122, 328, 142, 334, 130, 338, 156], "o"); c.poly([310, 156, 316, 140, 322, 132, 328, 146, 332, 156], "O"); c.poly([316, 156, 322, 142, 327, 156], "w")
    c.rect(300, 152, 40, 4, "B"); c.hline(300, 152, 40, "n")
    candle(c, 288, 68); c.rect(346, 66, 10, 14, "y"); c.rect(348, 64, 6, 3, "Y")                                                          // bougie et pot sur le manteau
    c.rect(364, 118, 3, 38, "k"); c.rect(370, 122, 3, 34, "k"); c.rect(360, 152, 16, 4, "k")                                               // pique-feu
    // fenêtres, lanternes
    windowW(c, 189, 48, 48, 44); windowW(c, 403, 48, 48, 44)
    lantern(c, 255, 62); lantern(c, 385, 62)
    // bibliothèques
    shelf(c, 92, 56, 68, 98); shelf(c, 466, 60, 66, 94)
    c.ellipse(108, 50, 10, 8, "n"); c.ellipse(108, 47, 7, 3, "N"); c.rect(124, 38, 8, 14, "y"); c.rect(126, 34, 4, 5, "B"); c.ellipse(145, 48, 8, 7, "m"); c.rect(143, 36, 4, 6, "m"); c.ellipse(143, 45, 3, 2, "M")
    book(c, 470, 50, "r"); book(c, 472, 42, "g"); scroll(c, 504, 46, 22)
    // guéridons à bougie, boîte à parchemins, pot à rouleaux
    table(c, 226, 118, 36, 38, 10); candle(c, 244, 108); table(c, 388, 118, 34, 38, 10); candle(c, 405, 108)
    crate(c, 168, 120, 38, 34); for (let i = 0; i < 4; i++) scroll(c, 172 + i * 7, 110 - (i % 2) * 4, 6)
    c.ellipse(446, 140, 14, 12, "n"); c.rect(434, 128, 25, 6, "N"); for (let i = 0; i < 4; i++) c.rect(436 + i * 6, 106 + (i % 2) * 6, 5, 24, "c")
    // étagère murale à gauche : plante et bougie ; petite fenêtre du mur de gauche et du mur de droite
    c.rect(30, 112, 40, 4, "N"); c.ellipse(44, 104, 7, 6, "G"); c.px(42, 100, "Y"); c.px(46, 103, "Y"); c.rect(40, 106, 9, 6, "n"); candle(c, 60, 98)
    c.poly([40, 62, 56, 50, 56, 80, 40, 92], "B"); c.poly([43, 64, 53, 56, 53, 78, 43, 86], "W"); c.rect(584, 98, 16, 28, "B"); c.rect(587, 101, 10, 22, "W")
    // porte du mur de droite
    c.rect(560, 112, 26, 78, "b"); c.box(560, 112, 26, 78, "B"); for (const x of [566, 573, 580]) c.vline(x, 114, 74, "B"); c.px(565, 150, "Y")
  }),
  layer("meubles", c => {
    barrel(c, 52, 130, 36, 44); barrel(c, 33, 238, 32, 40)
    c.rect(30, 172, 40, 56, "b"); c.hline(30, 172, 40, "L"); c.rect(33, 192, 34, 3, "B"); c.ellipse(48, 165, 11, 9, "n"); c.ellipse(48, 160, 7, 3, "N"); c.rect(37, 178, 6, 12, "y"); c.rect(39, 175, 2, 3, "B"); scroll(c, 52, 184, 10)
    c.rect(83, 194, 4, 20, "b"); c.rect(95, 194, 4, 20, "b"); c.ellipse(91, 191, 12, 6, "k"); c.ellipse(91, 190, 11, 5, "N"); c.ellipse(91, 189, 8, 3, "L")          // tabouret
    crate(c, 488, 156, 50, 38); c.rect(492, 160, 42, 8, "c")
    // escalier vers l'étage, jarre
    for (let i = 0; i < 6; i++) { const x = 566 + i * 7, y = 236 - i * 12; c.rect(x, y, 48 - i * 7, 12, i % 2 ? "b" : "n"); c.hline(x, y, 48 - i * 7, "L"); c.vline(x, y, 12, "B") }
    c.line(562, 240, 604, 172, "B"); c.line(563, 240, 605, 172, "N"); c.vline(562, 230, 14, "B")
    c.ellipse(595, 254, 10, 11, "y"); c.rect(591, 240, 8, 5, "Y")
    // tapis bleu à frange
    c.rect(230, 186, 184, 100, "U"); c.box(230, 186, 184, 100, "u"); c.box(236, 192, 172, 88, "v"); c.box(240, 196, 164, 80, "u")
    for (let x = 244; x < 400; x += 8) { c.px(x, 193, "u"); c.px(x + 4, 193, "v"); c.px(x, 278, "u"); c.px(x + 4, 278, "v") }
    for (const [x, y] of [[246, 202], [398, 202], [246, 270], [398, 270]]) { c.rect(x - 3, y - 1, 7, 3, "v"); c.rect(x - 1, y - 3, 3, 7, "v") }
    for (let x = 230; x < 414; x += 4) { c.vline(x, 182, 4, "v"); c.vline(x, 286, 4, "v") }
    // bureau du sage
    c.rect(262, 214, 114, 8, "B"); table(c, 262, 186, 114, 56, 28)
    c.rect(292, 188, 30, 20, "c"); c.hline(292, 188, 30, "E"); for (const yy of [193, 197, 201]) c.hline(296, yy, 22, "P")
    c.rect(270, 176, 22, 16, "b"); c.hline(270, 176, 22, "N"); c.rect(271, 180, 20, 3, "c"); book(c, 272, 168, "r")
    c.ellipse(348, 198, 6, 5, "k"); c.line(348, 192, 356, 170, "E"); c.line(350, 190, 358, 172, "e"); c.rect(360, 194, 12, 16, "m"); c.hline(360, 194, 12, "M")
    c.rect(376, 208, 14, 30, "b"); c.rect(378, 210, 10, 26, "N"); c.hline(376, 214, 14, "B"); c.hline(376, 222, 14, "B"); c.hline(376, 230, 14, "B")
    // table basse gauche (livre ouvert, pain, chope) et ses voisins
    table(c, 76, 252, 90, 68, 38)
    c.rect(82, 258, 30, 20, "E"); c.vline(97, 258, 20, "e"); for (const yy of [262, 266, 270]) { c.hline(85, yy, 10, "P"); c.hline(100, yy, 10, "P") }
    c.ellipse(140, 262, 16, 7, "E"); c.ellipse(140, 258, 12, 7, "N"); c.ellipse(138, 256, 7, 3, "L")
    c.rect(130, 276, 14, 16, "t"); c.rect(132, 278, 10, 12, "y"); c.rect(144, 280, 4, 8, "t"); c.rect(104, 284, 8, 8, "y")
    crate(c, 34, 286, 34, 34); paper(c, 40, 282); paper(c, 50, 290)
    crate(c, 168, 288, 38, 32); c.rect(174, 292, 26, 14, "E"); c.vline(187, 292, 14, "e")
    for (let i = 0; i < 4; i++) c.rect(212 + (i % 2), 296 + i * 7, 22, 7, "rgUy"[i]); paper(c, 236, 304)
    // table basse droite (assiettes, pain, boule de cristal), tabourets
    table(c, 482, 254, 88, 66, 36)
    c.ellipse(506, 270, 12, 5, "E"); c.ellipse(548, 262, 12, 5, "E"); c.ellipse(548, 259, 8, 4, "N"); c.ellipse(522, 280, 9, 4, "E"); c.rect(548, 274, 14, 14, "y"); c.rect(550, 276, 10, 8, "B")
    c.circ(500, 252, 6, "v"); c.px(498, 249, "E"); c.rect(495, 258, 10, 3, "y")
    for (const [x, y] of [[452, 268], [452, 296], [574, 268], [574, 296]]) { c.rect(x + 3, y + 8, 4, 16, "b"); c.rect(x + 19, y + 8, 4, 16, "b"); c.vline(x + 22, y + 8, 16, "B"); c.ellipse(x + 13, y + 7, 13, 6, "k"); c.ellipse(x + 13, y + 6, 12, 5, "N"); c.ellipse(x + 13, y + 5, 9, 3, "L"); c.ellipse(x + 13, y + 9, 12, 2, "b") }
    // papiers tombés (on lit beaucoup ici)
    paper(c, 146, 160); paper(c, 80, 222); paper(c, 436, 154); paper(c, 236, 306)
  }),
  layer("lumiere_feu", { light: true }, c => { c.ellipse(320, 172, 80, 14, "k") }),
  // ombres portées douces sous les meubles, côté opposé au feu
  layer("ombres", { shade: true }, c => {
    c.ellipse(320, 245, 56, 5, "k"); c.ellipse(122, 322, 46, 4, "k"); c.ellipse(526, 322, 44, 4, "k"); c.rect(26, 156, 588, 6, "k"); c.rect(26, 330, 588, 5, "k")
  }),
)
