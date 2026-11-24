// Escape Night 2 — maison du sage (bibliothèque), repeinte en pixel art.
// Même disposition que l'ancienne image : 640 × 358 (2 px par pixel de jeu), grille de collision `biblio` (maps.js) inchangée.
pal({
  k: "#120c0a", K: "#1e1410",
  B: "#3a2214", b: "#5a3620", n: "#7a4c2c", N: "#9a6a3e", L: "#b8884e",          // bois (sombre → clair)
  q: "#5e4a3a", Q: "#7e6a54",                                                       // ombre du plancher
  s: "#4e4a46", S: "#6e6862", t: "#8e877e", T: "#aaa294",                         // pierre
  p: "#8a7a62", P: "#b0a080", c: "#d8c8a4",                                         // plâtre, parchemin
  u: "#2a3462", U: "#3e4c8a", v: "#6a7ab8",                                         // tapis bleu
  r: "#8a2a2a", R: "#b84a3a", g: "#2e5a3a", G: "#4a7a4a", y: "#c89a3a", Y: "#ecc65a", // reliures, or
  o: "#ff9a2a", O: "#ffd46a", w: "#fff2c0",                                         // feu, lumière
  m: "#6a3a6a", M: "#9a5a9a", e: "#c8c0b0", E: "#e8e0d0",                           // flacons, porcelaine
  W: "#f0c860",                                                                     // fenêtres éclairées
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
  c.rect(x, y, w, h, "B"); c.rect(x + 3, y + 3, w - 6, h - 6, "K"); c.vline(x, y, h, "n"); c.vline(x + w - 1, y, h, "k"); c.hline(x, y, w, "N")
  const cols = "rgUyRmGv"
  for (let sy = y + 6; sy < y + h - 12; sy += 24) {
    c.rect(x + 3, sy + 18, w - 6, 3, "n"); c.hline(x + 3, sy + 18, w - 6, "L")
    let bx = x + 5; let i = (sy + x) % 7
    while (bx < x + w - 8) { const bw = 4 + (i * 3) % 3, bh = 13 + (i * 5) % 5, k = cols[i % cols.length]; c.rect(bx, sy + 18 - bh, bw, bh, k); c.vline(bx, sy + 18 - bh, bh, "k"); c.hline(bx + 1, sy + 18 - bh + 3, bw - 1, "Y"); bx += bw + 1; i++ }
  }
}
function table(c, x, y, w, h, top = 16) { c.rect(x, y, w, top, "n"); c.hline(x, y, w, "L"); c.hline(x, y + 1, w, "N"); c.rect(x, y + top, w, 4, "B"); c.rect(x + 3, y + top + 4, 5, h - top - 4, "B"); c.rect(x + w - 8, y + top + 4, 5, h - top - 4, "B"); c.vline(x + 3, y + top + 4, h - top - 4, "b") }
function candle(c, x, y) { c.rect(x - 4, y + 8, 9, 3, "y"); c.rect(x - 2, y, 5, 8, "E"); c.vline(x - 2, y, 8, "e"); c.vline(x, y - 2, 2, "k"); c.px(x, y - 5, "w"); c.rect(x - 1, y - 4, 3, 2, "O"); c.px(x, y - 6, "O") }
function barrel(c, x, y, w, h) { c.ellipse(x + w / 2, y + h - 3, w / 2 - 2, 3, "B"); c.rect(x, y + 4, w, h - 8, "n"); c.ellipse(x + w / 2, y + 4, w / 2, 4, "N"); c.ellipse(x + w / 2, y + 4, w / 2 - 3, 2, "b"); for (const yy of [y + 10, y + h - 10]) c.rect(x, yy, w, 3, "s"); c.vline(x + 3, y + 6, h - 10, "N"); c.vline(x + w - 3, y + 6, h - 10, "B") }
function crate(c, x, y, w, h) { c.rect(x, y, w, h, "n"); c.box(x, y, w, h, "B"); c.box(x + 2, y + 2, w - 4, h - 4, "N"); c.line(x + 3, y + 3, x + w - 4, y + h - 4, "b"); c.hline(x, y, w, "L") }
function scroll(c, x, y, len, dir = 1) { c.rect(x, y, len, 5, "c"); c.hline(x, y, len, "E"); c.rect(x - 2, y - 1, 3, 7, "P"); c.rect(x + len - 1, y - 1, 3, 7, "P") }
function paper(c, x, y) { c.poly([x, y, x + 14, y - 3, x + 17, y + 6, x + 3, y + 9], "c"); c.line(x + 3, y + 2, x + 12, y, "P"); c.line(x + 4, y + 5, x + 13, y + 3, "P") }
function book(c, x, y, k) { c.rect(x, y, 16, 11, k); c.hline(x, y, 16, "Y"); c.rect(x + 2, y + 8, 14, 3, "E") }
function windowW(c, x, y, w, h) { c.rect(x - 4, y - 4, w + 8, h + 8, "b"); c.box(x - 4, y - 4, w + 8, h + 8, "B"); c.rect(x, y, w, h, "W"); for (let i = 1; i < 4; i++) c.vline(x + (w * i / 4 | 0), y, h, "n"); c.hline(x, y + (h / 2 | 0), w, "n"); c.hline(x - 6, y + h + 4, w + 12, "N") }
function lantern(c, x, y) { c.vline(x, y - 12, 12, "k"); c.rect(x - 6, y, 13, 3, "k"); c.rect(x - 5, y + 3, 11, 12, "K"); c.rect(x - 3, y + 5, 7, 8, "O"); c.px(x, y + 8, "w"); c.rect(x - 6, y + 15, 13, 3, "k") }

scene("biblio", { w: 640, h: 358, bg: "k" },
  layer("pièce", c => {
    // mur du fond : soubassement de pierre, plâtre entre les colombages
    c.rect(40, 20, 560, 135, "p")
    for (let y = 105; y < 155; y++) for (let x = 40; x < 600; x++) { const row = (y - 105) >> 3, sx = (x + (row % 2) * 12) % 24; c.px(x, y, (y - 105) % 8 === 7 || sx === 23 ? "s" : ((x >> 3) + row) % 5 ? "S" : "t") }
    for (let y = 26; y < 105; y++) for (let x = 40; x < 600; x++) if (((x * 7 + y * 13) % 97) === 0) c.px(x, y, "P")
    for (const x of [80, 168, 250, 380, 462, 550]) { c.rect(x, 20, 10, 135, "b"); c.vline(x, 20, 135, "N"); c.vline(x + 9, 20, 135, "B") }   // poteaux
    c.rect(40, 18, 560, 10, "b"); c.hline(40, 18, 560, "N"); c.rect(40, 100, 560, 6, "b"); c.hline(40, 100, 560, "N")                    // sablières
    c.line(90, 30, 160, 95, "b"); c.line(91, 30, 161, 95, "B"); c.line(472, 95, 545, 30, "b"); c.line(473, 95, 546, 30, "B")             // écharpes
    // murs latéraux en biais
    c.poly([20, 70, 40, 20, 40, 155, 20, 175], "q"); c.poly([600, 20, 620, 70, 620, 175, 600, 155], "q")
    c.rect(20, 70, 6, 270, "B"); c.rect(614, 70, 6, 270, "B")
    // plancher
    plank(c, 26, 155, 614, 335)
    c.rect(26, 155, 588, 3, "B")
    // bord avant de la pièce (mur bas), sortie au milieu
    c.rect(20, 335, 266, 23, "B"); c.hline(20, 335, 266, "n"); c.rect(354, 335, 266, 23, "B"); c.hline(354, 335, 266, "n")
    plank(c, 286, 335, 354, 358)
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
    c.rect(40, 56, 14, 26, "B"); c.rect(43, 59, 8, 20, "W"); c.rect(584, 98, 14, 26, "B"); c.rect(587, 101, 8, 20, "W")
    // porte du mur de droite
    c.rect(560, 112, 26, 78, "b"); c.box(560, 112, 26, 78, "B"); for (const x of [566, 573, 580]) c.vline(x, 114, 74, "B"); c.px(565, 150, "Y")
  }),
  layer("meubles", c => {
    barrel(c, 52, 130, 36, 44); barrel(c, 33, 238, 32, 40)
    c.rect(30, 172, 40, 56, "b"); c.hline(30, 172, 40, "L"); c.rect(33, 192, 34, 3, "B"); c.ellipse(48, 165, 11, 9, "n"); c.ellipse(48, 160, 7, 3, "N"); c.rect(37, 178, 6, 12, "y"); c.rect(39, 175, 2, 3, "B"); scroll(c, 52, 184, 10)
    c.rect(80, 186, 22, 8, "n"); c.hline(80, 186, 22, "L"); c.rect(82, 194, 4, 20, "B"); c.rect(96, 194, 4, 20, "B")          // tabouret
    crate(c, 488, 156, 50, 38); c.rect(492, 160, 42, 8, "c")
    // escalier vers l'étage, jarre
    for (let i = 0; i < 6; i++) { c.rect(566 + i * 0, 174 + i * 12, 42, 12, i % 2 ? "b" : "n"); c.hline(566, 174 + i * 12, 42, "L") }
    c.vline(566, 174, 72, "B"); c.ellipse(595, 244, 10, 11, "y"); c.rect(591, 230, 8, 5, "Y")
    // tapis bleu à frange
    c.rect(230, 186, 184, 100, "U"); c.box(230, 186, 184, 100, "u"); c.box(236, 192, 172, 88, "v"); c.box(240, 196, 164, 80, "u")
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
    for (const [x, y] of [[452, 270], [452, 294], [574, 270], [574, 294]]) { c.rect(x, y, 26, 18, "n"); c.hline(x, y, 26, "L"); c.rect(x + 2, y + 18, 4, 8, "B"); c.rect(x + 20, y + 18, 4, 8, "B") }
    // papiers tombés (on lit beaucoup ici)
    paper(c, 146, 160); paper(c, 80, 222); paper(c, 436, 154); paper(c, 236, 306)
  }),
  // ombres portées douces sous les meubles, côté opposé au feu
  layer("ombres", { shade: true }, c => {
    c.ellipse(320, 245, 56, 5, "k"); c.ellipse(122, 322, 46, 4, "k"); c.ellipse(526, 322, 44, 4, "k"); c.rect(26, 156, 588, 6, "k"); c.rect(26, 330, 588, 5, "k")
  }),
)
