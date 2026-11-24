// Escape Night 2 — Donjon 6 « Le Château de Minuit » : gothique, luxueux, le temps partout, mystérieux et inquiétant.
// Grilles = collisions du jeu (castle.js, seed 97). Le pont de la salle du lance-pierre a sa variante (SAVE.castleBridge).
pal({
  k: "#07060c", x: "#120f1c", w: "#1a1628", t: "#242036",                                        // pierre du dessus
  F: "#1c1630", f: "#2a2244", h: "#382e58", H: "#4a3e70",                                         // tenture damassée nuit
  B: "#2a1810", n: "#4a2c1a", N: "#6a4226",                                                       // lambris
  a: "#4a4456", b: "#6e6678", c: "#857c8e", d: "#9a92a2", v: "#5c5468",                           // marbre clair veiné
  s: "#2e2a3a", S: "#423c52",                                                                     // marbre sombre (bordures, colonnes)
  R: "#5a1420", r: "#8a2232", e: "#b23a44",                                                       // tapis cramoisi
  Y: "#8a6a2a", y: "#d4aa4a", o: "#ffe08a",                                                       // or, flamme
  U: "#2a4a8a", u: "#5a8ad0", l: "#b8d0ff",                                                       // vitraux, clair de lune
  q: "#050409", Q: "#0e1a30", j: "#1e3456",                                                       // vide, eau nocturne
  p: "#c8b48a", P: "#9a8660",                                                                     // parchemin
  m: "#7a1a2a", z: "#ffd0a0", Z: "#c84a4a",                                                       // pétales, lueurs des yeux
})
ramps("kxwt", "kFfhH", "kBnN", "kavbcd", "ksS", "kRre", "kYyo", "kUul", "qQj", "kPp")
const TS = 16, CW = 30, CH = 17
const hash = (x, y, s = 0) => { let n = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967296 }
const vnoise = (x, y, sc, s) => { const X = x / sc, Y = y / sc, x0 = Math.floor(X), y0 = Math.floor(Y), fx = X - x0, fy = Y - y0, sm = t => t * t * (3 - 2 * t)
  const a = hash(x0, y0, s), b = hash(x0 + 1, y0, s), c = hash(x0, y0 + 1, s), d = hash(x0 + 1, y0 + 1, s), u = sm(fx), v = sm(fy)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v }

function room(name, MAP, decorFloor, decorTop, opts = {}) {
  const at = (x, y) => (y < 0 || y >= CH || x < 0 || x >= CW) ? "W" : MAP[y][x]
  const isWall = (x, y) => at(x, y) === "W", isVoid = (x, y) => at(x, y) === "v", isWater = (x, y) => at(x, y) === "~"
  const isFloor = (x, y) => !isWall(x, y) && !isVoid(x, y) && !isWater(x, y)
  const S = { at, isWall, isFloor, isVoid }
  const each = fn => { for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CW; tx++) fn(tx, ty) }
  const nearWall = (tx, ty) => isWall(tx - 1, ty) || isWall(tx + 1, ty) || isWall(tx, ty - 1) || isWall(tx, ty + 1)
  scene(name, { w: CW * TS, h: CH * TS, bg: "k" },
    // marbre en damier, veiné ; bordure de marbre sombre et liseré d'or le long des murs
    layer("sol", c => each((tx, ty) => {
      if (!isFloor(tx, ty) || at(tx, ty) === "b") return
      const border = nearWall(tx, ty)
      for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
        const X = tx * TS + x, Y = ty * TS + y
        let k
        if (border) k = (x + y) % 11 === 0 ? "S" : "s"
        else {
          const light = ((X >> 5) + (Y >> 5)) % 2 === 0, vein = Math.abs(vnoise(X, Y, 14, 3 + ((X >> 5) * 7 + (Y >> 5)) % 5) - 0.5) < 0.02
          k = light ? (vein ? "v" : "c") : (vein ? "a" : "b")
          if (Y % 32 === 0 || X % 32 === 0) k = light ? "d" : "c"
          if (Y % 32 === 31 || X % 32 === 31) k = "a"
        }
        c.px(X, Y, k)
      }
      if (border) { if (!isWall(tx, ty + 1) && isWall(tx, ty - 1)) c.hline(tx * TS, ty * TS + 15, TS, "Y"); if (!isWall(tx, ty - 1) && isWall(tx, ty + 1)) c.hline(tx * TS, ty * TS, TS, "Y"); if (!isWall(tx + 1, ty) && isWall(tx - 1, ty)) c.vline(tx * TS + 15, ty * TS, TS, "Y"); if (!isWall(tx - 1, ty) && isWall(tx + 1, ty)) c.vline(tx * TS, ty * TS, TS, "Y") }
    })),
    // tapis cramoisi à bordure d'or entre les portes (calculé sur le sol uniquement)
    layer("tapis", c => {
      const rects = opts.carpets || []; if (!rects.length) return
      const inC = (x, y) => isFloor(x >> 4, y >> 4) && rects.some(([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1)
      const edge = (x, y) => { for (let d = 0; d < 6; d++) if (!inC(x + d + 1, y) || !inC(x - d - 1, y) || !inC(x, y + d + 1) || !inC(x, y - d - 1)) return d; return 6 }
      for (let y = 0; y < CH * TS; y++) for (let x = 0; x < CW * TS; x++) {
        if (!inC(x, y)) continue
        const e = edge(x, y), open = x <= 1 || x >= CW * TS - 2 || y <= 1 || y >= CH * TS - 2
        let k = e === 0 ? "R" : e === 1 ? "y" : e === 2 ? "R" : ((x + y) % 12 === 0 || (x - y + 1200) % 12 === 0) && e > 4 ? "e" : "r"
        if (open && e < 3) k = "r"
        c.px(x, y, k)
      }
    }),
    layer("decor_sol", c => decorFloor && decorFloor(c, S)),
    // gouffres : rebord de marbre brisé au-dessus du noir
    layer("vide", c => each((tx, ty) => {
      if (!isVoid(tx, ty)) return
      const X0 = tx * TS, Y0 = ty * TS; c.rect(X0, Y0, TS, TS, "q")
      if (!isVoid(tx, ty - 1)) { c.rect(X0, Y0, TS, 6, "s"); c.hline(X0, Y0, TS, "S"); for (let x = 0; x < TS; x += 4) c.vline(X0 + x + Math.floor(hash(tx, x, 1) * 3), Y0 + 6, 2 + Math.floor(hash(x, tx, 2) * 3), "s"); c.rect(X0, Y0 + 9, TS, 4, "x") }
      if (!isVoid(tx - 1, ty)) c.vline(X0, Y0, TS, "S"); if (!isVoid(tx + 1, ty)) c.vline(X0 + 15, Y0, TS, "x")
    })),
    // pont doré (variante pont abaissé)
    layer("pont", c => each((tx, ty) => {
      if (at(tx, ty) !== "b") return
      const X0 = tx * TS, Y0 = ty * TS; c.rect(X0, Y0, TS, TS, "s"); for (let x = 0; x < TS; x += 4) c.vline(X0 + x, Y0, TS, "S")
      if (at(tx, ty - 1) !== "b") { c.hline(X0, Y0, TS, "y"); c.hline(X0, Y0 + 1, TS, "Y") } if (at(tx, ty + 1) !== "b") { c.hline(X0, Y0 + 15, TS, "Y"); c.hline(X0, Y0 + 14, TS, "y") }
    })),
    // bassin de nuit à margelle de marbre, la lune s'y reflète
    layer("eau", c => each((tx, ty) => {
      if (!isWater(tx, ty)) return
      const X0 = tx * TS, Y0 = ty * TS
      for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) { const X = X0 + x, Y = Y0 + y; c.px(X, Y, vnoise(X, Y, 20, 9) < 0.5 ? "Q" : "j") }
      if (!isWater(tx, ty - 1)) { c.rect(X0, Y0, TS, 4, "b"); c.hline(X0, Y0, TS, "d"); c.hline(X0, Y0 + 3, TS, "a"); c.hline(X0, Y0 + 4, TS, "q") }
      if (!isWater(tx, ty + 1)) c.hline(X0, Y0 + 15, TS, "c"); if (!isWater(tx - 1, ty)) c.vline(X0, Y0, TS, "c"); if (!isWater(tx + 1, ty)) c.vline(X0 + 15, Y0, TS, "a")
    })),
    // pétales de roses fanées (cases 'm' du jeu)
    layer("petales", c => each((tx, ty) => { if (at(tx, ty) !== "m" || !isFloor(tx, ty)) return; for (let i = 0; i < 5; i++) { const x = tx * TS + 2 + Math.floor(hash(tx, i, 1) * 12), y = ty * TS + 2 + Math.floor(hash(i, ty, 2) * 12); c.px(x, y, i % 2 ? "m" : "Z"); c.px(x + 1, y, "m") } })),
    // murs : grand mur nord tendu de damas au-dessus d'un lambris, dessus de pierre à liseré d'or
    layer("murs", c => each((tx, ty) => {
      if (!isWall(tx, ty)) return
      const X0 = tx * TS, Y0 = ty * TS
      const tallTop = ty === 0 && isWall(tx, 1) && !isWall(tx, 2)
      const face = !isWall(tx, ty + 1) || tallTop
      if (face) {
        const lower = !tallTop
        for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
          const X = X0 + x, Y = Y0 + y; let k = "f"
          const mx = X % 8, my = Y % 10; if ((mx === 4 && (my === 3 || my === 5)) || (my === 4 && (mx === 3 || mx === 5))) k = "h"; if (mx === 4 && my === 4) k = "H"   // motif damassé
          if (lower && y >= 6) { k = (X % 12 === 0) ? "B" : (y === 6 ? "N" : y === 15 ? "B" : "n"); if (X % 12 === 1 && y > 6) k = "N" }                       // lambris
          if (lower && y === 5) k = "Y"
          c.px(X, Y, k)
        }
        const upper = ty === 1 && isWall(tx, 0) && !isWall(tx, 2)
        if (!upper) { c.hline(X0, Y0, TS, "y"); c.hline(X0, Y0 + 1, TS, "Y"); c.hline(X0, Y0 + 2, TS, "x") }
        if (!tallTop) c.hline(X0, Y0 + TS - 1, TS, "k")
        if (!isWall(tx - 1, ty)) c.vline(X0, Y0, TS, "Y"); if (!isWall(tx + 1, ty)) c.vline(X0 + 15, Y0, TS, "B")
      } else {
        for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) { const X = X0 + x, Y = Y0 + y, r = Y >> 3, sx = (X + (r % 2) * 8) % 16; c.px(X, Y, sx === 15 || Y % 8 === 7 ? "x" : hash((X + (r % 2) * 8) >> 4, r, 9) < 0.3 ? "t" : "w") }
        if (!isWall(tx, ty - 1)) { c.hline(X0, Y0, TS, "y"); c.hline(X0, Y0 + 1, TS, "Y"); c.hline(X0, Y0 + 2, TS, "t") }
        if (!isWall(tx + 1, ty)) { c.vline(X0 + 15, Y0, TS, "y"); c.vline(X0 + 14, Y0, TS, "Y") }
        if (!isWall(tx - 1, ty)) { c.vline(X0, Y0, TS, "Y"); c.vline(X0 + 1, Y0, TS, "t") }
      }
    })),
    layer("ombre_murs", { shade: true }, c => each((tx, ty) => {
      if (isWall(tx, ty) || isVoid(tx, ty)) return
      if (isWall(tx, ty - 1)) c.rect(tx * TS, ty * TS, TS, 4, "k")
      if (isWall(tx - 1, ty)) c.rect(tx * TS, ty * TS, 3, TS, "k")
      if (isWall(tx + 1, ty)) c.rect(tx * TS + TS - 2, ty * TS, 2, TS, "k")
    })),
    layer("ombre_douce", { shade: true, density: 0.5 }, c => each((tx, ty) => {
      if (isWall(tx, ty) || isVoid(tx, ty)) return
      if (isWall(tx, ty - 1)) c.rect(tx * TS, ty * TS + 4, TS, 6, "k")
      if (isWall(tx - 1, ty)) c.rect(tx * TS + 3, ty * TS, 4, TS, "k")
      if (isWall(tx + 1, ty)) c.rect(tx * TS + TS - 6, ty * TS, 4, TS, "k")
    })),
    layer("passages", { shade: true, density: 0.5 }, c => each((tx, ty) => { if (isFloor(tx, ty) && (ty <= 1 || ty >= 15 || tx <= 1 || tx >= 28)) c.rect(tx * TS, ty * TS, TS, TS, "k") })),
    layer("passages2", { shade: true }, c => each((tx, ty) => { if (isFloor(tx, ty) && (ty === 0 || ty === 16 || tx === 0 || tx === 29)) c.rect(tx * TS, ty * TS, TS, TS, "k") })),
    // arcs brisés des passages : piédroits de marbre sombre, archivolte dorée, petite horloge à la clé
    layer("portes", c => {
      const jamb = (x, y, h) => { c.rect(x, y, 6, h, "S"); c.vline(x, y, h, "y"); c.vline(x + 5, y, h, "x"); c.hline(x, y + h - 1, 6, "Y") }
      if (!isWall(14, 0)) { jamb(216, 0, 34); jamb(258, 0, 34); c.poly([216, 6, 240, -8, 264, 6, 264, 2, 240, -12, 216, 2], "Y"); c.line(216, 6, 240, -6, "y"); c.line(240, -6, 263, 6, "y"); clockFace(c, 240, 8, 5) }
      if (!isWall(14, 16)) { jamb(216, 238, 34); jamb(258, 238, 34); c.hline(216, 238, 48, "y") }
      if (!isWall(29, 7)) { jamb(450, 100, 10); jamb(450, 146, 10); c.rect(456, 100, 3, 56, "Y") }
      if (!isWall(0, 7)) { jamb(24, 100, 10); jamb(24, 146, 10); c.rect(21, 100, 3, 56, "Y") }
    }),
    // colonnes gothiques et chandelles (cases 'k' isolées) ; les grappes de 'k' deviennent de grandes horloges
    layer("colonnes", c => each((tx, ty) => {
      if (at(tx, ty) !== "k") return
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => at(tx + dx, ty + dy) === "k").length
      if (nb) return
      const X = tx * TS, Y = ty * TS
      c.ellipse(X + 8, Y + 14, 9, 3, "k"); c.rect(X + 1, Y + 9, 14, 5, "s"); c.hline(X + 1, Y + 9, 14, "y"); c.hline(X + 1, Y + 13, 14, "x")
      c.rect(X + 3, Y - 16, 10, 25, "s"); c.vline(X + 4, Y - 16, 25, "S"); c.vline(X + 7, Y - 16, 25, "x"); c.vline(X + 10, Y - 16, 25, "S"); c.vline(X + 12, Y - 16, 25, "x")
      c.rect(X + 1, Y - 20, 14, 4, "Y"); c.hline(X + 1, Y - 20, 14, "y")
      for (const dx of [3, 8, 13]) { c.vline(X + dx, Y - 25, 5, "d"); c.px(X + dx, Y - 27, "o"); c.px(X + dx, Y - 26, "y") }
    })),
    layer("horloges", c => {
      const seen = new Set()
      each((tx, ty) => {
        if (at(tx, ty) !== "k" || seen.has(tx + ',' + ty)) return
        if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => at(tx + dx, ty + dy) === "k")) return
        const cells = []; const st = [[tx, ty]]; seen.add(tx + ',' + ty)
        while (st.length) { const [x, y] = st.pop(); cells.push([x, y]); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + ',' + (y + dy); if (at(x + dx, y + dy) === "k" && !seen.has(k)) { seen.add(k); st.push([x + dx, y + dy]) } } }
        const x0 = Math.min(...cells.map(p => p[0])) * 16, x1 = (Math.max(...cells.map(p => p[0])) + 1) * 16, y0 = Math.min(...cells.map(p => p[1])) * 16, y1 = (Math.max(...cells.map(p => p[1])) + 1) * 16
        statue(c, (x0 + x1) / 2, y1, x1 - x0)
      })
    }),
    layer("decor_haut", c => decorTop && decorTop(c, S)),
  )
}
// ---------- éléments ----------
function clockFace(c, cx, cy, r, hour = 12) {
  c.circ(cx, cy, r + 1, "Y"); c.circ(cx, cy, r, "p"); c.ring(cx, cy, r, "y")
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 - 1.5708; c.px(Math.round(cx + Math.cos(a) * (r - 1)), Math.round(cy + Math.sin(a) * (r - 1)), i % 3 ? "P" : "k") }
  const ah = (hour % 12) / 12 * 6.283 - 1.5708; c.line(cx, cy, Math.round(cx + Math.cos(ah) * (r - 3)), Math.round(cy + Math.sin(ah) * (r - 3)), "k"); c.line(cx, cy, Math.round(cx + Math.cos(-1.5708) * (r - 1)), Math.round(cy + Math.sin(-1.5708) * (r - 1)), "k"); c.px(cx, cy, "y")
}
// statue d'ange voilé sur un socle de marbre, posée sur les cases solides
function statue(c, cx, base, w) {
  const x0 = cx - w / 2 + 2, x1 = cx + w / 2 - 2
  c.ellipse(cx, base - 2, w / 2, 5, "k")
  c.rect(x0, base - 20, x1 - x0, 18, "s"); c.hline(x0, base - 20, x1 - x0, "y"); c.hline(x0, base - 19, x1 - x0, "S"); c.hline(x0, base - 3, x1 - x0, "x"); c.vline(x0, base - 20, 18, "S")
  c.rect(x0 + 4, base - 14, x1 - x0 - 8, 8, "x"); c.box(x0 + 4, base - 14, x1 - x0 - 8, 8, "Y")
  c.poly([cx - 9, base - 20, cx - 6, base - 46, cx, base - 52, cx + 6, base - 46, cx + 9, base - 20], "b")          // robe
  c.line(cx - 6, base - 46, cx - 9, base - 20, "c"); c.line(cx, base - 50, cx - 2, base - 22, "a"); c.line(cx + 4, base - 44, cx + 6, base - 22, "a")
  c.poly([cx - 6, base - 44, cx - 18, base - 58, cx - 14, base - 36], "a"); c.poly([cx + 6, base - 44, cx + 18, base - 58, cx + 14, base - 36], "a")  // ailes
  c.line(cx - 6, base - 44, cx - 18, base - 58, "c"); c.line(cx + 6, base - 44, cx + 18, base - 58, "c")
  c.circ(cx, base - 55, 4, "b"); c.poly([cx - 5, base - 55, cx, base - 61, cx + 5, base - 55, cx + 4, base - 50, cx - 4, base - 50], "a")       // voile
  c.px(cx - 1, base - 54, "x"); c.px(cx + 1, base - 54, "x"); c.vline(cx - 1, base - 53, 3, "a")                                               // larmes de pierre
}
// (ancienne grande horloge, inutilisée)
function grandClock(c, cx, base, w) {
  const x0 = cx - w / 2 + 4, x1 = cx + w / 2 - 4, top = base - 72
  c.ellipse(cx, base - 2, w / 2, 5, "k")
  c.rect(x0, top + 18, x1 - x0, base - top - 20, "n"); c.vline(x0, top + 18, base - top - 20, "N"); c.vline(x1 - 1, top + 18, base - top - 20, "B")
  c.poly([x0 - 2, top + 20, cx, top, x1 + 2, top + 20], "n"); c.line(x0 - 2, top + 20, cx, top, "N"); c.line(cx, top, x1 + 2, top + 20, "B"); c.px(cx, top - 2, "y"); c.px(cx, top - 1, "y")
  clockFace(c, cx, top + 22, 11, 11)
  c.rect(cx - 6, top + 38, 12, base - top - 46, "x"); c.box(cx - 6, top + 38, 12, base - top - 46, "Y"); c.vline(cx, top + 39, 16, "y"); c.circ(cx, top + 56, 3, "y")   // balancier
  c.rect(x0 - 2, base - 8, x1 - x0 + 4, 6, "B"); c.hline(x0 - 2, base - 8, x1 - x0 + 4, "N")
}
// portrait au cadre doré ; les yeux luisent faiblement dans le noir
function portrait(c, x, y, w = 14, h = 20, hue = 0) {
  c.rect(x - 1, y - 1, w + 2, h + 2, "Y"); c.box(x - 1, y - 1, w + 2, h + 2, "y"); c.rect(x + 1, y + 1, w - 2, h - 2, hue ? "R" : "x")
  const cx = x + w / 2 | 0; c.ellipse(cx, y + h - 3, 5, 4, hue ? "k" : "w"); c.circ(cx, y + 7, 3, hue ? "k" : "t"); c.px(cx - 1, y + 7, "z"); c.px(cx + 1, y + 7, "z")
}
// fenêtre gothique à vitraux et clair de lune
function windowG(c, cx, y = 4) {
  c.rect(cx - 6, y + 6, 12, 22, "x"); c.poly([cx - 6, y + 7, cx, y, cx + 6, y + 7], "x")
  c.rect(cx - 5, y + 7, 10, 20, "U"); c.poly([cx - 5, y + 7, cx, y + 1, cx + 5, y + 7], "u")
  c.vline(cx, y + 2, 25, "x"); c.hline(cx - 5, y + 16, 10, "x"); c.px(cx - 3, y + 10, "l"); c.px(cx + 2, y + 12, "l"); c.px(cx - 2, y + 20, "u")
  c.hline(cx - 7, y + 27, 14, "y")
}
// enluminure : page de parchemin, lettrine dorée et marges peintes
function illumination(c, x, y) {
  c.rect(x, y, 12, 18, "p"); c.box(x, y, 12, 18, "P"); c.rect(x + 2, y + 2, 5, 5, "R"); c.vline(x + 3, y + 3, 3, "y"); c.vline(x + 5, y + 3, 3, "y"); c.px(x + 4, y + 4, "y")
  for (const yy of [y + 9, y + 11, y + 13, y + 15]) c.hline(x + 2, yy, 8, "P"); c.vline(x + 10, y + 2, 14, "U"); c.px(x + 10, y + 5, "y")
}
// tous les éléments du mur nord vont par paires symétriques autour de x = 240
const pair = (fn, x, ...a) => { fn(x, ...a); fn(480 - x, ...a) }
const hourglass = (c, cx, cy, r) => { c.poly([cx - r, cy - r, cx + r, cy - r, cx, cy], "Y"); c.poly([cx - r, cy + r, cx + r, cy + r, cx, cy], "Y"); c.poly([cx - r + 3, cy - r + 2, cx + r - 3, cy - r + 2, cx, cy - 1], "p"); c.poly([cx - r / 2, cy + r - 2, cx + r / 2, cy + r - 2, cx, cy + 3], "p"); c.hline(cx - r - 2, cy - r - 1, 2 * r + 5, "y"); c.hline(cx - r - 2, cy + r, 2 * r + 5, "y") }
const romanRing = (c, cx, cy, r) => { c.ellipse(cx, cy, r, r * 0.62, "s"); c.ellipse(cx, cy, r, r * 0.62, "y", true); c.ellipse(cx, cy, r - 4, (r - 4) * 0.62, "Y", true); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 - 1.5708, x = Math.round(cx + Math.cos(a) * (r - 8)), y = Math.round(cy + Math.sin(a) * (r - 8) * 0.62); c.vline(x, y - 2, 4, "y"); if (i % 3 === 0) c.vline(x + 2, y - 2, 4, "y") } c.line(cx, cy, cx, Math.round(cy - (r - 12) * 0.62), "y"); c.line(cx, cy, cx + 1, Math.round(cy - (r - 16) * 0.62), "y"); c.circ(cx, cy, 2, "y") }

// mur nord standard : fenêtres, portraits et enluminures en paires symétriques
const northWall = (c, S, { win = [56, 168], por = [112], ill = [], hue = 0 } = {}) => {
  for (const x of win) pair(X => windowG(c, X), x)
  for (const x of por) pair(X => portrait(c, X - 7, 3, 14, 18, hue), x)
  for (const x of ill) pair(X => illumination(c, X - 6, 3), x)
}
const swordsShield = (c, cx) => { c.line(cx - 9, 4, cx + 9, 22, "b"); c.line(cx + 9, 4, cx - 9, 22, "b"); c.hline(cx - 11, 18, 5, "y"); c.hline(cx + 7, 18, 5, "y"); c.poly([cx - 6, 6, cx + 6, 6, cx + 6, 14, cx, 21, cx - 6, 14], "R"); c.poly([cx - 4, 8, cx + 4, 8, cx + 4, 13, cx, 18, cx - 4, 13], "r"); c.vline(cx, 8, 10, "y"); c.hline(cx - 3, 11, 7, "y") }
const keyInlay = (c, cx, cy) => { c.ellipse(cx - 24, cy, 10, 7, "y"); c.ellipse(cx - 24, cy, 6, 4, "s"); c.rect(cx - 14, cy - 2, 40, 4, "y"); c.rect(cx + 14, cy + 2, 4, 6, "y"); c.rect(cx + 22, cy + 2, 4, 8, "y"); c.hline(cx - 14, cy - 2, 40, "o") }
const DECOR = {
  entry: [c => {}, (c, S) => northWall(c, S, { win: [56, 168], por: [112] })],
  blast: [c => {}, (c, S) => northWall(c, S, { win: [72], por: [168], ill: [120] })],
  sling: [c => {}, (c, S) => northWall(c, S, { win: [56, 152], ill: [104] })],
  // galerie des portraits : les cloisons des couloirs sont couvertes de tableaux
  gallery: [c => {}, (c, S) => { northWall(c, S, { win: [], por: [56, 104, 152, 200] }); for (const y of [80, 160]) for (let x = 56; x < 440; x += 40) if (S.isWall(x >> 4, y >> 4) && S.isWall((x + 12) >> 4, y >> 4)) portrait(c, x, y + 1, 12, 13, (x / 40 | 0) % 3 === 0 ? 1 : 0) }],
  hook: [c => {}, (c, S) => northWall(c, S, { win: [40, 104, 168] })],
  // grande salle : tapis croisés, enluminures entre les fenêtres
  hall: [c => {}, (c, S) => northWall(c, S, { win: [56, 152], por: [104], ill: [184] })],
  swim: [c => {}, (c, S) => northWall(c, S, { win: [40, 120, 184], por: [80] })],
  // frisbee : deux anges voilés sur leurs socles, vitrail au fond de l'alcôve
  frisbee: [c => {}, (c, S) => { northWall(c, S, { win: [136], ill: [72] }); windowG(c, 240) }],
  // armurerie : épées croisées sur écus, en paires
  armory: [c => {}, (c, S) => { northWall(c, S, { win: [184], por: [] }); pair(x => swordsShield(c, x), 64); pair(x => swordsShield(c, x), 128) }],
  // Chevalier Minuit : portraits rouges
  papa: [c => {}, (c, S) => northWall(c, S, { win: [56, 168], por: [112], hue: 1 })],
  bigkey: [c => {}, (c, S) => northWall(c, S, { win: [72, 168], ill: [120] })],
  // salle du trône : la grande horloge arrêtée sur minuit, le dossier du trône contre le mur, portraits rouges
  king: [c => {}, (c, S) => {
      northWall(c, S, { win: [48, 112], por: [80, 176], hue: 1 })
      c.rect(222, 6, 36, 26, "R"); c.box(222, 6, 36, 26, "y"); c.rect(226, 10, 28, 22, "r"); c.poly([222, 6, 240, -2, 258, 6], "y")
      clockFace(c, 240, 16, 9, 12); c.px(240, 2, "o")
    }],
}

const ROOMS = {"blast": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW____________WW____________WW", "WW____________WW____________WW", "WW____________WW____________WW", "WW____________WW____________WW", "WW____________WW____________WW", "WW____________________________", "WWm___________________________", "WW____________WW____________WW", "WW____________WW____________WW", "WW____________WW____________WW", "WW____________WW____________WW", "WW____________WW____________WW", "WW____________WW____________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "entry": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW___________________m______WW", "WW__________________________WW", "WW__________________________WW", "_______________________m______", "______________________________", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WWWWWWWWWWWWWWEEWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWEEWWWWWWWWWWWWWW"], "sling": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "__________vvvvv_______________", "__________vvvvv_______________", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "gallery": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW_________m________________WW", "WW__________________________WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWW__WWWW", "WW__________________________WW", "____________________________WW", "____________________________WW", "WW__________________________WW", "WWW__WWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "hook": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW_vvvvvvvvvvvvvvvvvvvv_____WW", "WW_vvvvvvvvvvvvvvvvvvvv_____WW", "WW_vvvvvvvvvvvvvvvvvvvv_____WW", "WW_vvvvvvvvvvvvvvvvvvvv_____WW", "WW_v_______vvvvvvvvvvvv_____WW", "WW_v_______vvv____vvvvv_______", "WW_v_______vvv____vvvvv____m__", "WW_v_______vvv____vvvvv_____WW", "WW_v_______vvvvvvvvvvvv_____WW", "WW_vvvvvvvvvvvvvvvvvvvv_____WW", "WW_vvvvvvvvvvvvvvvvvvvv_____WW", "WW_vvvvvvvvvvvvvvvvvvvv____mWW", "WW_vvvvvvvvvvvvvvvvvvvv_____WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "hall": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW___k__________________k___WW", "WW__________________________WW", "WW__________________________WW", "______________________________", "___________m__________________", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW___km_________________k___WW", "WW_______________________m__WW", "WW__________________________WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "swim": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW___~~~~~~~~~~~~~~~~~~~~~__WW", "WW___~~~~~~~~~~~~~~~~~~~~~__WW", "WW___~~~~~~~~~~~~~~~~~~~~~__WW", "WW___~~~~~~~~~~~~~~~~~~~~~__WW", "_____~~~~~~~~____~~~~~~~~~____", "_____~~~~~~~~____~~~~~~~~~____", "WW___~~~~~~~~____~~~~~~~~~__WW", "WW___~~~~~~~~~~~~~~~~~~~~~__WW", "WW___~~~~~~~~~~~~~~~~~~~~~__WW", "WW___~~~~~~~~~~~~~~~~~~~~~__WW", "WW_m_~~~~~~~~~~~~~~~~~~~~~__WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "frisbee": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW_________W______W_________WW", "WW__kkk____W______W____kkk__WW", "WW__k_k____W______W____k_k__WW", "WW__kkk____WWW__WWW____kkk__WW", "WW__________________________WW", "____________________________WW", "____________________________WW", "WW__________________________WW", "WW____________m_____________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "armory": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW___k__________________k___WW", "WW__________________________WW", "WW__________________________WW", "WW____________________________", "WW____________________________", "WW__________________________WW", "WW____________m_____________WW", "WW__________________________WW", "WW___k__________________k___WW", "WW__________________________WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "papa": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW___k__________________k___WW", "WW__________________________WW", "WW__________________________WW", "______________________________", "______________________________", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW___k__________________k___WW", "WW__________________________WW", "WW__________________________WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "bigkey": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "____________________________WW", "____________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________m_______WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "king": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW___k__________________k___WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW_______________________m__WW", "WW__________________________WW", "WW__________________________WW", "WW___k__________________k___WW", "WW__________________________WW", "WW______m___________________WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "sling_pont": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "__________bbbbb_______________", "__________bbbbb_______________", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WW________vvvvv_____________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"]};
function autoCarpets(M) { const op = (x, y) => M[y][x] !== 'W', out = []; const N = op(14, 0), S = op(14, 16), W = op(0, 7), E = op(29, 7)
  if (N || S) out.push([214, N ? 0 : 40, 266, S ? 272 : 232]); if (W || E) out.push([W ? 0 : 40, 102, E ? 480 : 440, 154]); return out }
for (const [n, grid] of Object.entries(ROOMS)) { const d = DECOR[n.replace('_pont', '')]; room('chateau_' + n, grid, d[0], d[1], { carpets: ['hook', 'swim', 'sling', 'sling_pont'].includes(n) ? [] : autoCarpets(grid), windows: [56, 168, 152, 40, 72] }) }
