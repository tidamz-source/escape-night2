// Escape Night 2 — Donjon 4 « Le Temple englouti » : temple aquatique, humide, passages sculptés.
// Grilles = collisions du jeu (temple.js, seed 67). Bassins : niveau haut (tout en eau) ou bas (fond 'Y', rebord 'q', marches 'Z').
pal({
  k: "#060c12", x: "#12202a", w: "#1a2c38", t: "#243a48",                                        // dessus des murs
  F: "#25404c", f: "#3a5a66", h: "#4e7480", H: "#68909a", l: "#94b8bc",                           // grès bleu-vert sculpté
  a: "#3c5658", b: "#4a6a6a", c: "#577878", d: "#678a86",                                         // dallage
  j: "#2a4a50", J: "#35585e",                                                                     // fond des bassins vidés
  o: "#c8a860", O: "#8a7040", s: "#3a9aa2", S: "#7accd0",                                         // incrustations or et turquoise
  q: "#0c2a44", Q: "#143e62", u: "#235e88", U: "#7ac0e0",                                         // eau
  e: "#58808a", E: "#86b4bc",                                                                     // flaques légères (reflet)
  g: "#2c5636", G: "#4a8a50",                                                                     // algues
  n: "#e2d4c2", N: "#a88a74",                                                                     // coquillages
  z: "#a8f4ff",                                                                                   // reflets lumineux
})
ramps("kxwt", "kFfhHl", "kabcd", "kjJ", "kOo", "ksS", "kqQuU", "keE", "kgG", "kNn")
const TS = 16, CW = 30, CH = 17
const hash = (x, y, s = 0) => { let n = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967296 }
const vnoise = (x, y, sc, s) => { const X = x / sc, Y = y / sc, x0 = Math.floor(X), y0 = Math.floor(Y), fx = X - x0, fy = Y - y0, sm = t => t * t * (3 - 2 * t)
  const a = hash(x0, y0, s), b = hash(x0 + 1, y0, s), c = hash(x0, y0 + 1, s), d = hash(x0 + 1, y0 + 1, s), u = sm(fx), v = sm(fy)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v }

function room(name, MAP, ORIG, decorFloor, decorTop) {
  const at = (x, y) => (y < 0 || y >= CH || x < 0 || x >= CW) ? "W" : MAP[y][x]
  const orig = (x, y) => (y < 0 || y >= CH || x < 0 || x >= CW) ? "W" : ORIG[y][x]
  const isWall = (x, y) => at(x, y) === "W"
  const isWater = (x, y) => { const t = at(x, y); return t === "~" || t === "w" || t === "y" }
  const isBasin = (x, y) => "YqZ".includes(at(x, y))
  const isFloor = (x, y) => !isWall(x, y) && !isWater(x, y) && !isBasin(x, y)
  const S = { at, isWall, isWater, isFloor, isBasin }
  const each = fn => { for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CW; tx++) fn(tx, ty) }
  scene(name, { w: CW * TS, h: CH * TS, bg: "k" },
    // dallage carré du temple, une dalle sur deux légèrement plus claire
    layer("sol", c => each((tx, ty) => {
      if (!isFloor(tx, ty)) return
      for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
        const X = tx * TS + x, Y = ty * TS + y
        const wet = vnoise(X, Y, 36, 13) > 0.62                     // pierre détrempée, plus sombre
        let k = (tx + ty) % 2 ? (wet ? "a" : "b") : (wet ? "b" : "c")
        if (y === 0 || x === 0) k = wet ? "b" : k === "c" ? "d" : "c"
        if (y === 15 || x === 15) k = "a"
        c.px(X, Y, k)
      }
    })),
    // eau (bassins fixes, et bassins quand le niveau est haut) : plus sombre là où c'est profond
    layer("eau", c => each((tx, ty) => {
      if (!isWater(tx, ty)) return
      const deep = orig(tx, ty) === "y"
      for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
        const X = tx * TS + x, Y = ty * TS + y, n = vnoise(X, Y, 18, 8)
        let k = deep ? (n < 0.55 ? "q" : "Q") : (n < 0.4 ? "Q" : "u")
        if ((Y * 3 + Math.floor(X / 7) * 5) % 23 === 0 && hash(X >> 2, Y, 9) < 0.6) k = deep ? "u" : "U"   // reflets
        c.px(X, Y, k)
      }
      const X0 = tx * TS, Y0 = ty * TS
      if (!isWater(tx, ty - 1)) { c.rect(X0, Y0, TS, 4, "f"); c.hline(X0, Y0, TS, "H"); c.hline(X0, Y0 + 3, TS, "F"); c.hline(X0, Y0 + 4, TS, "q") }   // margelle vue de face
      if (!isWater(tx, ty + 1)) { c.hline(X0, Y0 + 15, TS, "h"); c.hline(X0, Y0 + 14, TS, "u") }
      if (!isWater(tx - 1, ty)) { c.vline(X0, Y0, TS, "h"); c.vline(X0 + 1, Y0, TS, "F") }
      if (!isWater(tx + 1, ty)) { c.vline(X0 + 15, Y0, TS, "f"); c.vline(X0 + 14, Y0, TS, "F") }
    })),
    // bassin vidé : fond en mosaïque délavée, petites flaques irrégulières restées au fond
    layer("bassin_vide", c => each((tx, ty) => {
      const t = at(tx, ty); if (!isBasin(tx, ty)) return
      const X0 = tx * TS, Y0 = ty * TS, deep = orig(tx, ty) === "y"
      if (t === "Y") for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
        const X = X0 + x, Y = Y0 + y; let k = ((X >> 3) + (Y >> 3)) % 2 ? "j" : "J"
        if (X % 8 === 7 || Y % 8 === 7) k = deep ? "x" : "j"
        const p = vnoise(X, Y, 11, 21) * 0.7 + vnoise(X, Y, 4, 22) * 0.3
        if (p > (deep ? 0.6 : 0.66)) k = p > (deep ? 0.68 : 0.73) ? "Q" : "u"               // flaques au fond
        c.px(X, Y, k)
      }
      if (t === "q") {                                                                       // rebord : dalle de margelle, ombre vers le fond
        c.rect(X0, Y0, TS, TS, "f")
        const up = isFloor(tx, ty - 1) || isWall(tx, ty - 1), dn = isFloor(tx, ty + 1) || isWall(tx, ty + 1), lf = isFloor(tx - 1, ty) || isWall(tx - 1, ty), rt = isFloor(tx + 1, ty) || isWall(tx + 1, ty)
        if (up) { c.hline(X0, Y0, TS, "l"); c.hline(X0, Y0 + 1, TS, "H"); c.rect(X0, Y0 + 10, TS, 6, "F") }
        if (dn) { c.hline(X0, Y0 + 15, TS, "x"); c.rect(X0, Y0, TS, 4, "J") }
        if (lf) { c.vline(X0, Y0, TS, "H"); c.rect(X0 + 11, Y0, 5, TS, "F") }
        if (rt) { c.vline(X0 + 15, Y0, TS, "x"); c.rect(X0, Y0, 4, TS, "F") }
        for (let i = 0; i < TS; i += 5) c.px(X0 + i, Y0 + 7, "h")
      }
      if (t === "Z") {                                                                       // marches qui descendent vers le fond
        const vert = isBasin(tx - 1, ty) && isBasin(tx + 1, ty) || isFloor(tx, ty - 1) || isFloor(tx, ty + 1)
        const fromTop = isFloor(tx, ty - 1), fromLeft = isFloor(tx - 1, ty)
        for (let i = 0; i < 4; i++) {
          const k = ["H", "h", "f", "F"][i]
          if (vert) { const y = fromTop ? Y0 + i * 4 : Y0 + 12 - i * 4; c.rect(X0, y, TS, 4, k); c.hline(X0, fromTop ? y : y + 3, TS, i === 0 ? "l" : "H") }
          else { const x = fromLeft ? X0 + i * 4 : X0 + 12 - i * 4; c.rect(x, Y0, 4, TS, k); c.vline(fromLeft ? x : x + 3, Y0, TS, i === 0 ? "l" : "H") }
        }
      }
    })),
    layer("decor_sol", c => decorFloor && decorFloor(c, S)),
    // algues et coquillages dans les joints humides (cases 'm' du jeu)
    layer("algues", c => each((tx, ty) => {
      if (at(tx, ty) !== "m" || !isFloor(tx, ty)) return
      const X0 = tx * TS, Y0 = ty * TS
      for (let i = 0; i < 3; i++) { const x = X0 + 3 + i * 4 + Math.floor(hash(tx, i, 2) * 2), h = 4 + Math.floor(hash(ty, i, 3) * 5); for (let y = 0; y < h; y++) c.px(x + ((y >> 1) % 2), Y0 + 15 - y, y > h - 3 ? "G" : "g") }
      c.hline(X0, Y0 + 15, TS, "g")
      if (hash(tx, ty, 4) < 0.5) { const x = X0 + 10, y = Y0 + 4; c.rect(x, y, 3, 2, "n"); c.px(x + 1, y + 2, "N") }
    })),
    // parois : blocs de grès ; grand mur nord avec frise de vagues, ligne de crue et algues au pied
    layer("murs", c => each((tx, ty) => {
      if (!isWall(tx, ty)) return
      const X0 = tx * TS, Y0 = ty * TS
      const tallTop = ty === 0 && isWall(tx, 1) && !isWall(tx, 2)
      const face = !isWall(tx, ty + 1) || tallTop
      if (face) {
        for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
          const X = X0 + x, Y = Y0 + y, course = Y >> 3, bx = (X + (course % 2) * 8) % 16
          let k = hash((X + (course % 2) * 8) >> 4, course, 5) < 0.3 ? "h" : "f"
          if (Y % 8 === 0) k = "H"; if (Y % 8 === 7 || bx === 15) k = "F"
          c.px(X, Y, k)
        }
        const upper = ty === 1 && isWall(tx, 0) && !isWall(tx, 2)
        if (tallTop || (!upper && isWall(tx, ty - 1))) { c.hline(X0, Y0, TS, "l"); c.hline(X0, Y0 + 1, TS, "H") }
        if (!tallTop) {
          c.rect(X0, Y0 + 3, TS, 6, "f"); c.hline(X0, Y0 + 3, TS, "H"); c.hline(X0, Y0 + 8, TS, "F")           // frise sculptée
          for (let x = 0; x < TS; x++) { const ph = ((X0 + x) % 8); c.px(X0 + x, Y0 + 5 + (ph < 4 ? (ph === 1 || ph === 2 ? -1 : 0) : (ph === 5 || ph === 6 ? 1 : 0)), "l") }
          c.hline(X0, Y0 + 11, TS, "F")                                                                     // ligne de crue
          for (let x = 0; x < TS; x += 2) if (hash(X0 + x, ty, 6) < 0.6) c.vline(X0 + x, Y0 + 13, 1 + Math.floor(hash(x, X0, 7) * 3), "g") // algues au pied
          c.hline(X0, Y0 + 15, TS, "k")
        }
        if (!isWall(tx - 1, ty)) c.vline(X0, Y0, TS, "H")
        if (!isWall(tx + 1, ty)) c.vline(X0 + 15, Y0, TS, "F")
      } else {
        for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) { const X = X0 + x, Y = Y0 + y, r = Y >> 4, sx = (X + (r % 2) * 8) % 16; c.px(X, Y, sx === 15 || Y % 16 === 15 ? "x" : hash((X + (r % 2) * 8) >> 4, r, 9) < 0.3 ? "t" : "w") }
        if (!isWall(tx, ty - 1)) { c.hline(X0, Y0, TS, "H"); c.hline(X0, Y0 + 1, TS, "f"); c.hline(X0, Y0 + 2, TS, "t") }
        if (!isWall(tx + 1, ty)) { c.vline(X0 + 15, Y0, TS, "H"); c.vline(X0 + 14, Y0, TS, "f") }
        if (!isWall(tx - 1, ty)) { c.vline(X0, Y0, TS, "f"); c.vline(X0 + 1, Y0, TS, "t") }
      }
    })),
    layer("ombre_murs", { shade: true }, c => each((tx, ty) => {
      if (!isFloor(tx, ty)) return
      if (isWall(tx, ty - 1)) c.rect(tx * TS, ty * TS, TS, 4, "k")
      if (isWall(tx - 1, ty)) c.rect(tx * TS, ty * TS, 3, TS, "k")
      if (isWall(tx + 1, ty)) c.rect(tx * TS + TS - 2, ty * TS, 2, TS, "k")
    })),
    layer("ombre_douce", { shade: true, density: 0.5 }, c => each((tx, ty) => {
      if (!isFloor(tx, ty)) return
      if (isWall(tx, ty - 1)) c.rect(tx * TS, ty * TS + 4, TS, 4, "k")
      if (isWall(tx - 1, ty)) c.rect(tx * TS + 3, ty * TS, 3, TS, "k")
    })),
    layer("passages", { shade: true, density: 0.5 }, c => each((tx, ty) => { if (isFloor(tx, ty) && (ty <= 1 || ty >= 15 || tx <= 1 || tx >= 28)) c.rect(tx * TS, ty * TS, TS, TS, "k") })),
    layer("passages2", { shade: true }, c => each((tx, ty) => { if (isFloor(tx, ty) && (ty === 0 || ty === 16 || tx === 0 || tx === 29)) c.rect(tx * TS, ty * TS, TS, TS, "k") })),
    // coulures d'humidité sur le grand mur, et une flaque légère au pied de chacune (mêmes positions en miroir)
    layer("humidite", c => {
      for (const x of [40, 120, 184]) for (const X of [x, 480 - x]) {
        const tx = X >> 4; if (!isWall(tx, 1) || isWall(tx, 2) || !isFloor(tx, 2)) continue
        c.vline(X, 2, 8, "F"); c.vline(X + 1, 4, 5, "F"); c.vline(X, 13, 3, "g")
        for (let y = 0; y < 6; y++) for (let x2 = -10; x2 <= 10; x2++) { const d = Math.hypot(x2 / 10, (y - 2.5) / 2.6) + (vnoise(X + x2, y, 3, 31 + X) - 0.5) * 0.9; if (d < 0.9) c.px(X + x2, 37 + y, "e") }
        c.px(X - 2, 38, "E")
      }
    }),
    // passages sculptés : deux colonnes cannelées et un linteau à coquille
    layer("portes", c => {
      const col = (x, y, h) => { c.rect(x, y, 8, h, "h"); c.vline(x, y, h, "l"); c.vline(x + 7, y, h, "F"); c.vline(x + 3, y + 3, h - 6, "f"); c.vline(x + 5, y + 3, h - 6, "f"); c.rect(x - 1, y, 10, 3, "H"); c.hline(x - 1, y, 10, "l"); c.rect(x - 1, y + h - 3, 10, 3, "f"); c.hline(x - 1, y + h - 1, 10, "F") }
      const shell = (cx, cy) => { for (let i = -3; i <= 3; i++) c.line(cx, cy + 3, cx + i * 2, cy - 2, "l"); c.hline(cx - 6, cy - 2, 13, "H"); c.rect(cx - 1, cy + 2, 3, 2, "o") }
      if (!isWall(14, 0)) { col(212, 0, 34); col(260, 0, 34); c.rect(208, 0, 64, 6, "h"); c.hline(208, 0, 64, "l"); c.hline(208, 5, 64, "F"); shell(240, 3) }
      if (!isWall(14, 16)) { col(212, 238, 34); col(260, 238, 34); c.rect(208, 238, 64, 5, "h"); c.hline(208, 238, 64, "l"); shell(240, 241) }
      if (!isWall(29, 7)) { col(452, 98, 12); col(452, 146, 12) }
      if (!isWall(0, 7)) { col(20, 98, 12); col(20, 146, 12) }
    }),
    // colonnes du temple (cases 'k' du jeu), couvertes d'anatifes
    layer("colonnes", c => each((tx, ty) => {
      if (at(tx, ty) !== "k") return
      const X = tx * TS, Y = ty * TS
      c.ellipse(X + 8, Y + 14, 9, 3, "x"); c.rect(X, Y + 9, 16, 5, "f"); c.hline(X, Y + 9, 16, "H"); c.hline(X, Y + 13, 16, "F")
      c.rect(X + 3, Y - 14, 10, 23, "h"); c.vline(X + 3, Y - 14, 23, "l"); c.vline(X + 12, Y - 14, 23, "F"); c.vline(X + 6, Y - 12, 20, "f"); c.vline(X + 9, Y - 12, 20, "f")
      c.rect(X + 1, Y - 18, 14, 4, "H"); c.hline(X + 1, Y - 18, 14, "l"); c.px(X + 4, Y + 4, "n"); c.px(X + 11, Y + 1, "N"); c.px(X + 5, Y - 2, "n"); c.vline(X + 3, Y + 4, 5, "g")
    })),
    layer("decor_haut", c => decorTop && decorTop(c, S)),
    glow("z", { r: 6, strength: 0.4, bands: 2 }),
  )
}
// reliefs de poissons sculptés sur le grand mur, par paires symétriques
function fishPair(c, x, y = 18) { for (const [X, f] of [[x, 1], [480 - x, -1]]) { c.ellipse(X, y, 6, 3, "H"); c.ellipse(X, y, 5, 2, "h"); c.poly([X - 6 * f, y, X - 10 * f, y - 3, X - 10 * f, y + 3], "H"); c.px(X + 3 * f, y - 1, "F"); c.line(X - 1, y - 2, X + 1, y + 2, "f") } }
const medallion = (c, cx, cy, r) => { c.circ(cx, cy, r, "s"); c.ring(cx, cy, r, "o"); c.ring(cx, cy, r - 3, "O"); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.line(cx, cy, Math.round(cx + Math.cos(a) * (r - 4)), Math.round(cy + Math.sin(a) * (r - 4)), "S") } c.circ(cx, cy, 3, "o") }
const waveBand = (c, x0, x1, y) => { for (let x = x0; x <= x1; x++) { const ph = x % 10; c.px(x, y + (ph < 5 ? (ph === 2 ? -2 : ph === 1 || ph === 3 ? -1 : 0) : 0), "s") } }
const shellAt = (c, x, y) => { c.rect(x, y, 3, 2, "n"); c.px(x + 1, y + 2, "N"); c.px(x, y, "N") }

const DECOR = {
  entry: [c => { for (const [x, y] of [[90, 220], [380, 216]]) shellAt(c, x, y) }, c => fishPair(c, 96)],
  arena: [c => { medallion(c, 240, 144, 26); for (const [x, y] of [[150, 100], [330, 190], [200, 210]]) shellAt(c, x, y) }, c => fishPair(c, 104)],
  fountain: [c => { c.rect(220, 160, 40, 60, "c"); c.box(220, 160, 40, 60, "s"); c.box(222, 162, 36, 56, "o"); }, c => fishPair(c, 88)],
  palmes: [c => { c.box(210, 110, 60, 46, "o") }, c => fishPair(c, 64)],
  hub: [c => { }, c => fishPair(c, 120)],
  dive: [c => {}, c => fishPair(c, 72)],
  east: [c => { medallion(c, 56, 136, 10) }, c => fishPair(c, 136)],
  bigkey: [c => { medallion(c, 240, 126, 14) }, c => fishPair(c, 64)],
  gallery: [c => { for (let x = 56; x < 440; x += 48) medallion(c, x, 136, 6) }, c => fishPair(c, 88)],
  // cascade : l'eau tombe du grand mur dans le chenal profond
  cascade: [c => { for (let i = 0; i < 10; i++) c.px(130 + Math.floor(hash(i, 1, 3) * 40), 34 + Math.floor(hash(i, 2, 3) * 8), "U") },
    c => { for (let x = 128; x < 176; x++) for (let y = 0; y < 34; y++) { const k = (x * 7 + y * 3 + (x >> 2)) % 9; c.px(x, y, k < 2 ? "U" : k < 5 ? "u" : "Q") } c.hline(128, 33, 48, "z"); for (const x of [132, 150, 168]) c.px(x, 34, "z") }],
  boss: [c => { for (const [x, y] of [[80, 90], [400, 90], [80, 200], [400, 200]]) shellAt(c, x, y) }, c => fishPair(c, 104)],
  prison: [c => { for (const [x, y] of [[180, 150], [300, 150], [220, 170], [260, 172]]) shellAt(c, x, y); medallion(c, 240, 200, 8) }, c => fishPair(c, 120)],
}

const HIGH = {"entry": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW_______wwwwwwwwwwww_______WW", "WW_______wwwwwwwwwwww____m__WW", "WW_m_____wwwwwwwwwwww_______WW", "WW_______wwwwwwwwwwww_______WW", "______________________________", "_________m____________________", "WW__________________________WW", "WW___________m______________WW", "WW__________________________WW", "WW___m______________________WW", "WW______________________m___WW", "WW_________________m________WW", "WWWWWWWWWWWWWWEEWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWEEWWWWWWWWWWWWWW"], "arena": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW_~~~______________________WW", "WW_~~~______________________WW", "WW_~~~______________________WW", "WW__________________________WW", "______________________________", "______________________________", "WW__________________________WW", "WW__________________________WW", "WW______________________~~~_WW", "WW______________________~~~mWW", "WW______________________~~~_WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "fountain": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW_~~~~________________~~~~_WW", "WW_~~~~__________m_____~~~~_WW", "WW_~~~~________________~~~~_WW", "WW__________________________WW", "WW____________________________", "WW____________________________", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW________________________m_WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "palmes": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW___wwwwwwwwwwwwwwwwwwww___WW", "WW___wwwwwwwwwwwwwwwwwwww___WW", "WW___wwwwwwwwwwwwwwwwwwww___WW", "WW___wwwwwwwwwwwwwwwwwwww___WW", "_____wwwwwwww____wwwwwwww___WW", "_____wwwwwwww____wwwwwwww___WW", "WW___wwwwwwww____wwwwwwww___WW", "WW__mwwwwwwwwwwwwwwwwwwww___WW", "WW___wwwwwwwwwwwwwwwwwwww___WW", "WW___wwwwwwwwwwwwwwwwwwww___WW", "WW___wwwwwwwwwwwwwwwwwwww___WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "hub": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW____________m_____________WW", "WW_yyyyyyyyyyyyyyyyyyyyyyyy_WW", "WW_yyyyyyyyyyyyyyyyyyyyyyyy_WW", "WW_yyyyyyyyyyyyyyyyyyyyyyyy_WW", "___yyyyyyyyyyyyyyyyyyyyyyyy___", "___yyyyyyyyyyyyyyyyyyyyyyyy___", "WW_yyyyyyyyyyyyyyyyyyyyyyyy_WW", "WW_yyyyyyyyyyyyyyyyyyyyyyyy_WW", "WW_yyyyyyyyyyyyyyyyyyyyyyyy_WW", "WW_yyyyyyyyyyyyyyyyyyyyyyyy_WW", "WW__________________________WW", "WW_m____m___________________WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "dive": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW_m________________________WW", "WW_yyyyyyyyyyyyyyyyyyyyyyy__WW", "WW_yyyyyyyyyyyyyyyyyyyyyyy__WW", "WW_yyyyyyyyyyyyyyyyyyyyyyy__WW", "WW_yyyyyyyyyyyyyyyyyyyyyyy__WW", "WW_yyyyyyyyyyyyyyyyyyyyyyy____", "WW_yyyyyyyyyyyyyyyyyyyyyyy____", "WW_yyyyyyyyyyyyyyyyyyyyyyy__WW", "WW_yyyyyyyyyyyyyyyyyyyyyyy__WW", "WW_yyyyyyyyyyyyyyyyyyyyyyy__WW", "WW_yyyyyyyyyyyyyyyyyyyyyyy__WW", "WW_yyyyyyyyyyyyyyyyyyyyyyy__WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "east": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW____wwwwwwwwwwwwwwwwwwww__WW", "WW____wwwwwwwwwwwwwwwwwwww__WW", "WW____wwwwwwwwwwwwwwwwwwww__WW", "WW____wwwwwwwwwwwwwwwwwwww__WW", "______wwwwwwwwwwwwwwwwwwww__WW", "______wwwwwwwwwwwwwwwwwwww__WW", "WW____wwwwwwwwwwwwwwwwwwww__WW", "WW____wwwwwwwwwwwwwwwwwwww__WW", "WW____wwwwwwwwwwwwwwwwwwww__WW", "WW____wwwwwwwwwwwwwwwwwwww__WW", "WW____wwwwwwwwwwwwwwwwwwww__WW", "WW___________m______________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "bigkey": ["WWWWWWWWWWWWWWm_WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW_________m________________WW", "WW___wwwwwwwwwwwwwwwwwwww___WW", "WW___wwwwwwwwwwwwwwwwwwww___WW", "WW___wwwwwwww____wwwwwwww___WW", "_____wwwwwwww____wwwwwwww_____", "_____wwwwwwww__m_wwwwwwww_____", "WW___wwwwwwwwwwwwwwwwwwww___WW", "WW___wwwwwwwwwwwwwwwwwwww___WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW________________________mmWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "gallery": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW________m___________m_____WW", "WW___________m______________WW", "WW__________________________WW", "WW_~~~~~~~~~~~~~~~~~~~~~~~~_WW", "WW_~~~~~~~~~~~~~~~~~~~~~~~~_WW", "WW____________________________", "WW___________m________________", "WW__________________________WW", "WW_~~~~~~~~~~~~~~~~~~~~~~~~_WW", "WW_~~~~~~~~~~~~~~~~~~~~~~~~_WW", "WW__________________________WW", "WW__________________________WW", "WW______________________m___WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "cascade": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW______yyy_________________WW", "WW______yyy_______wwwwwwwww_WW", "WW______yyy_______wwwwwwwww_WW", "WW______yyy_______wwwwwwwww_WW", "WW______yyy_______wwwwwwwww_WW", "________yyy_______wwwwwwwww_WW", "m_______yyy_______wwwwwwwww_WW", "WW______yyy_______wwwwwwwww_WW", "WW______yyy_______wwwwwwwww_WW", "WW__m___yyy_______wwwwwwwww_WW", "WW______yyy_______wwwwwwwww_WW", "WW______yyy_______wwwwwwwww_WW", "WW______yyy_________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "boss": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW__k____________________k__WW", "WW______~~~~~~~~~~~~~~______WW", "WW______~~~~~~~~~~~~~~______WW", "WW______~~~~~~~~~~~~~~______WW", "WW______~~~~~~~~~~~~~~______WW", "WW______~~~~~~~~~~~~~~______WW", "WW______~~~~~~~~~~~~~~______WW", "WW______~~~~~~~~~~~~~~______WW", "WW__k___~~~~~~~~~~~~~~___k__WW", "WW__________________________WW", "WW__________________________WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "prison": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW________________m_____m___WW", "WW__________________________WW", "WW__________________________WW", "WW_____m________m___________WW", "WW__________________________WW", "WW_____m____________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW_____m_____________m______WW", "WW___________________m______WW", "WW__________________________WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW_mWWWWWWWWWWWWWW"]};
const LOW = {"entry": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW_______qqqqqZZqqqqq_______WW", "WW_______ZYYYYYYYYYYZ____m__WW", "WW_m_____ZYYYYYYYYYYZ_______WW", "WW_______qqqqqZZqqqqq_______WW", "______________________________", "_________m____________________", "WW__________________________WW", "WW___________m______________WW", "WW__________________________WW", "WW___m______________________WW", "WW______________________m___WW", "WW_________________m________WW", "WWWWWWWWWWWWWWEEWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWEEWWWWWWWWWWWWWW"], "palmes": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW___qqqqqqqqqZZqqqqqqqqq___WW", "WW___qYYYYYYYYYYYYYYYYYYq___WW", "WW___qYYYYYYYYYYYYYYYYYYq___WW", "WW___qYYYYYYYYYYYYYYYYYYq___WW", "_____qYYYYYYY____YYYYYYYq___WW", "_____ZYYYYYYY____YYYYYYYZ___WW", "WW___ZYYYYYYY____YYYYYYYZ___WW", "WW__mqYYYYYYYYYYYYYYYYYYq___WW", "WW___qYYYYYYYYYYYYYYYYYYq___WW", "WW___qYYYYYYYYYYYYYYYYYYq___WW", "WW___qqqqqqqqqZZqqqqqqqqq___WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "hub": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW____________m_____________WW", "WW_qqqqqqqqqqqqZqqqqqqqqqqq_WW", "WW_qYYYYYYYYYYYYYYYYYYYYYYq_WW", "WW_qYYYYYYYYYYYYYYYYYYYYYYq_WW", "___qYYYYYYYYYYYYYYYYYYYYYYq___", "___ZYYYYYYYYYYYYYYYYYYYYYYZ___", "WW_ZYYYYYYYYYYYYYYYYYYYYYYZ_WW", "WW_qYYYYYYYYYYYYYYYYYYYYYYq_WW", "WW_qYYYYYYYYYYYYYYYYYYYYYYq_WW", "WW_qqqqqqqqqqqZZqqqqqqqqqqq_WW", "WW__________________________WW", "WW_m____m___________________WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "dive": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW_m________________________WW", "WW_qqqqqqqqqqqZZqqqqqqqqqq__WW", "WW_qYYYYYYYYYYYYYYYYYYYYYq__WW", "WW_qYYYYYYYYYYYYYYYYYYYYYq__WW", "WW_qYYYYYYYYYYYYYYYYYYYYYq__WW", "WW_qYYYYYYYYYYYYYYYYYYYYYq____", "WW_ZYYYYYYYYYYYYYYYYYYYYYZ____", "WW_ZYYYYYYYYYYYYYYYYYYYYYZ__WW", "WW_qYYYYYYYYYYYYYYYYYYYYYq__WW", "WW_qYYYYYYYYYYYYYYYYYYYYYq__WW", "WW_qYYYYYYYYYYYYYYYYYYYYYq__WW", "WW_qqqqqqqqqqqZZqqqqqqqqqq__WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "east": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW____qqqqqqqqqZZqqqqqqqqq__WW", "WW____qYYYYYYYYYYYYYYYYYYq__WW", "WW____qYYYYYYYYYYYYYYYYYYq__WW", "WW____qYYYYYYYYYYYYYYYYYYq__WW", "______qYYYYYYYYYYYYYYYYYYq__WW", "______ZYYYYYYYYYYYYYYYYYYZ__WW", "WW____ZYYYYYYYYYYYYYYYYYYZ__WW", "WW____qYYYYYYYYYYYYYYYYYYq__WW", "WW____qYYYYYYYYYYYYYYYYYYq__WW", "WW____qYYYYYYYYYYYYYYYYYYq__WW", "WW____qqqqqqqqqZZqqqqqqqqq__WW", "WW___________m______________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "bigkey": ["WWWWWWWWWWWWWWm_WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW_________m________________WW", "WW___qqqqqqqqqZZqqqqqqqqq___WW", "WW___qYYYYYYYYYYYYYYYYYYq___WW", "WW___qYYYYYYY____YYYYYYYq___WW", "_____ZYYYYYYY____YYYYYYYZ_____", "_____ZYYYYYYY__m_YYYYYYYZ_____", "WW___qYYYYYYYYYYYYYYYYYYq___WW", "WW___qqqqqqqqqZZqqqqqqqqq___WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW________________________mmWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "cascade": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW______qqq_________________WW", "WW______qYq_______qqqqZZqqq_WW", "WW______qYq_______qYYYYYYYq_WW", "WW______qYq_______qYYYYYYYq_WW", "WW______qYq_______qYYYYYYYq_WW", "________qYq_______qYYYYYYYq_WW", "m_______ZYZ_______ZYYYYYYYZ_WW", "WW______ZYZ_______ZYYYYYYYZ_WW", "WW______qYq_______qYYYYYYYq_WW", "WW__m___qYq_______qYYYYYYYq_WW", "WW______qYq_______qYYYYYYYq_WW", "WW______qYq_______qqqqZZqqq_WW", "WW______qqq_________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"]};
for (const [n, grid] of Object.entries(HIGH)) { room('temple_' + n, grid, grid, DECOR[n][0], DECOR[n][1]); if (LOW[n]) room('temple_' + n + '_bas', LOW[n], grid, DECOR[n][0], DECOR[n][1]) }
