// Escape Night 2 — Donjon 3 « Les Mines des gnomes » : galeries creusées dans la roche, étais de bois, rails, rochers.
// Grilles = collisions du jeu (mines.js, seed 51). 30 × 17 tuiles de 16 px. Objets du jeu (wagonnets, leviers, poteaux, coffres…) dessinés par-dessus.
pal({
  k: "#0a0808", x: "#1c1614", w: "#2a221e", t: "#382e28",                                         // roche du dessus
  F: "#3a302a", f: "#54463c", h: "#6c5a4c", H: "#88725e",                                         // pierres des parois
  a: "#5a4a3a", b: "#6e5c48", c: "#7e6a52", d: "#90785c",                                         // terre battue
  p: "#4a3e32", P: "#a08a6a",                                                                     // gravier
  B: "#3e2814", n: "#6a4626", N: "#8e6236", L: "#b0804a",                                         // bois des étais
  i: "#2e3038", I: "#6a707e", J: "#9aa2b0",                                                       // fer (rails, ferrures)
  o: "#ffcf6a", O: "#c08a3a",                                                                     // lanternes
  z: "#a8f0ff", Z: "#4ab0d0",                                                                     // cristaux
  e: "#e8e0d0", E: "#9a9280", y: "#c8a040",                                                       // toiles, os, minerai d'or
  q: "#060404",                                                                                   // vide
})
ramps("kxwt", "kFfhH", "kabcd", "kpP", "kBnNL", "kiIJ", "kOo", "kZz", "kEe")
const TS = 16, CW = 30, CH = 17
const vnoise = (x, y, sc, s) => { const X = x / sc, Y = y / sc, x0 = Math.floor(X), y0 = Math.floor(Y), fx = X - x0, fy = Y - y0, sm = t => t * t * (3 - 2 * t)
  const a = hash(x0, y0, s), b = hash(x0 + 1, y0, s), c = hash(x0, y0 + 1, s), d = hash(x0 + 1, y0 + 1, s), u = sm(fx), v = sm(fy)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v }
const hash = (x, y, s = 0) => { let n = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967296 }
// pierres irrégulières : cellules de Voronoï sur une grille de germes décalés
function stone(X, Y, size, seed) {
  const gx = Math.floor(X / size), gy = Math.floor(Y / size); let d1 = 1e9, d2 = 1e9, id = 0
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const cx = gx + i, cy = gy + j, px = (cx + 0.15 + hash(cx, cy, seed) * 0.7) * size, py = (cy + 0.15 + hash(cy, cx, seed + 1) * 0.7) * size * 0.8
    const d = Math.hypot(X - px, (Y - py) * 1.25); if (d < d1) { d2 = d1; d1 = d; id = cx * 131 + cy } else if (d < d2) d2 = d
  }
  return { edge: d2 - d1 < 1.4, id, rim: d2 - d1 < 2.6 }
}
function room(name, MAP, decorFloor, decorTop, opts = {}) {
  const at = (x, y) => (y < 0 || y >= CH || x < 0 || x >= CW) ? "W" : MAP[y][x]
  const isWall = (x, y) => at(x, y) === "W", isVoid = (x, y) => at(x, y) === "v"
  const isRail = (x, y) => at(x, y) === "r" || at(x, y) === "T"
  const isFloor = (x, y) => !isWall(x, y) && !isVoid(x, y)
  const S = { at, isWall, isVoid, isFloor }
  const each = fn => { for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CW; tx++) fn(tx, ty) }
  scene(name, { w: CW * TS, h: CH * TS, bg: "k" },
    // terre battue, gravier tassé là où l'on passe peu
    layer("sol", c => each((tx, ty) => {
      if (!isFloor(tx, ty) || at(tx, ty) === "T") return
      for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
        const X = tx * TS + x, Y = ty * TS + y, n = vnoise(X, Y, 40, 3) * 0.8 + vnoise(X, Y, 12, 4) * 0.2
        let k = n < 0.32 ? "a" : n < 0.62 ? "b" : "c"
        const g = hash(X, Y, 5); if (g < 0.02) k = "p"; else if (g < 0.032) k = "P"     // gravier
        c.px(X, Y, k)
      }
    })),
    // gouffres : bord rocheux qui tombe dans le noir
    layer("vide", c => each((tx, ty) => {
      if (!isVoid(tx, ty) && at(tx, ty) !== "T") return
      const X0 = tx * TS, Y0 = ty * TS
      c.rect(X0, Y0, TS, TS, "q")
      const top = !isVoid(tx, ty - 1) && at(tx, ty - 1) !== "T"
      if (top) for (let y = 0; y < 12; y++) for (let x = 0; x < TS; x++) { const X = X0 + x, Y = Y0 + y, s = stone(X, Y, 9, 11); c.px(X, Y, s.edge ? "k" : y < 4 ? (hash(s.id, 2, 3) < 0.5 ? "h" : "f") : y < 8 ? "F" : "x") }
      if (!isVoid(tx, ty + 1) && at(tx, ty + 1) !== "T") { c.hline(X0, Y0 + 15, TS, "a"); c.hline(X0, Y0 + 14, TS, "x") }
      if (!isVoid(tx - 1, ty) && at(tx - 1, ty) !== "T") c.vline(X0, Y0, TS, "F")
      if (!isVoid(tx + 1, ty) && at(tx + 1, ty) !== "T") c.vline(X0 + 15, Y0, TS, "x")
    })),
    // rails : traverses en bois et deux lignes de fer ; tréteaux au-dessus du vide
    layer("rails", c => each((tx, ty) => {
      if (!isRail(tx, ty)) return
      const X0 = tx * TS, Y0 = ty * TS, hor = isRail(tx - 1, ty) || isRail(tx + 1, ty), ver = isRail(tx, ty - 1) || isRail(tx, ty + 1), tr = at(tx, ty) === "T"
      const H = hor && (!ver || isRail(tx - 1, ty) && isRail(tx + 1, ty)), V = ver && !H
      if (tr) { if (H) { c.rect(X0, Y0 + 2, TS, 12, "n"); c.hline(X0, Y0 + 2, TS, "N"); c.hline(X0, Y0 + 13, TS, "B"); c.vline(X0 + 2, Y0 + 14, 2, "B"); c.vline(X0 + 13, Y0 + 14, 2, "B") } else { c.rect(X0 + 2, Y0, 12, TS, "n"); c.vline(X0 + 2, Y0, TS, "N"); c.vline(X0 + 13, Y0, TS, "B") } }
      if (H || (!V && !hor)) { for (let x = 1; x < TS; x += 5) { c.rect(X0 + x, Y0 + 3, 3, 10, "B"); c.vline(X0 + x, Y0 + 3, 10, "n") } c.hline(X0, Y0 + 5, TS, "I"); c.hline(X0, Y0 + 6, TS, "i"); c.hline(X0, Y0 + 10, TS, "I"); c.hline(X0, Y0 + 11, TS, "i") }
      if (V || ver && hor && !H) { for (let y = 1; y < TS; y += 5) { c.rect(X0 + 3, Y0 + y, 10, 3, "B"); c.hline(X0 + 3, Y0 + y, 10, "n") } c.vline(X0 + 5, Y0, TS, "I"); c.vline(X0 + 6, Y0, TS, "i"); c.vline(X0 + 10, Y0, TS, "I"); c.vline(X0 + 11, Y0, TS, "i") }
    })),
    layer("decor_sol", c => decorFloor && decorFloor(c, S)),
    // éclats de cristal (cases 'm' du jeu)
    layer("cristaux", c => each((tx, ty) => {
      if (at(tx, ty) !== "m" || !isFloor(tx, ty)) return
      const X = tx * TS + 4 + Math.floor(hash(tx, ty, 1) * 6), Y = ty * TS + 12
      c.ellipse(X + 3, Y + 1, 5, 2, "a")
      c.poly([X, Y, X + 1, Y - 6, X + 3, Y], "Z"); c.poly([X + 2, Y, X + 4, Y - 9, X + 6, Y], "Z"); c.line(X + 4, Y - 8, X + 3, Y - 1, "z"); c.poly([X + 5, Y, X + 7, Y - 4, X + 8, Y], "Z")
    })),
    // parois : pierres irrégulières, faces vues de devant et dessus de roche
    layer("parois", c => each((tx, ty) => {
      if (!isWall(tx, ty)) return
      const X0 = tx * TS, Y0 = ty * TS
      const tallTop = ty === 0 && isWall(tx, 1) && isFloor(tx, 2)
      const face = (isFloor(tx, ty + 1) || isVoid(tx, ty + 1)) && at(tx, ty + 1) !== "E" || tallTop
      for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
        const X = X0 + x, Y = Y0 + y
        if (face) { const s = stone(X, Y, 11, 7), v = hash(s.id, 3, 8); c.px(X, Y, s.edge ? "F" : s.rim && (Y - s.id) % 2 ? (v < 0.5 ? "f" : "h") : v < 0.3 ? "f" : v < 0.75 ? "h" : "H") }
        else { const s = stone(X, Y, 15, 9); c.px(X, Y, s.edge ? "x" : hash(s.id, 4, 9) < 0.4 ? "t" : "w") }
      }
      if (face && !(ty === 1 && isWall(tx, 0) && isFloor(tx, 2))) { c.hline(X0, Y0, TS, "t"); c.hline(X0, Y0 + 1, TS, "x") }
      if (face && !tallTop) c.hline(X0, Y0 + TS - 1, TS, "k")
      if (!face) {
        if (isFloor(tx, ty - 1)) { c.hline(X0, Y0, TS, "h"); c.hline(X0, Y0 + 1, TS, "f"); c.hline(X0, Y0 + 2, TS, "t") }
        if (isFloor(tx + 1, ty)) { c.vline(X0 + 15, Y0, TS, "h"); c.vline(X0 + 14, Y0, TS, "f") }
        if (isFloor(tx - 1, ty)) { c.vline(X0, Y0, TS, "f"); c.vline(X0 + 1, Y0, TS, "t") }
      }
    })),
    layer("ombre_parois", { shade: true }, c => each((tx, ty) => {
      if (isWall(tx, ty) || isVoid(tx, ty)) return
      if (isWall(tx, ty - 1)) c.rect(tx * TS, ty * TS, TS, 4, "k")
      if (isWall(tx - 1, ty)) c.rect(tx * TS, ty * TS, 3, TS, "k")
      if (isWall(tx + 1, ty)) c.rect(tx * TS + TS - 2, ty * TS, 2, TS, "k")
    })),
    layer("ombre_douce", { shade: true, density: 0.5 }, c => each((tx, ty) => {
      if (isWall(tx, ty) || isVoid(tx, ty)) return
      if (isWall(tx, ty - 1)) c.rect(tx * TS, ty * TS + 4, TS, 4, "k")
      if (isWall(tx - 1, ty)) c.rect(tx * TS + 3, ty * TS, 3, TS, "k")
    })),
    layer("passages", { shade: true, density: 0.5 }, c => each((tx, ty) => { if (isFloor(tx, ty) && at(tx, ty) !== "E" && (ty <= 1 || ty >= 15 || tx <= 1 || tx >= 28)) c.rect(tx * TS, ty * TS, TS, TS, "k") })),
    layer("passages2", { shade: true }, c => each((tx, ty) => { if (isFloor(tx, ty) && at(tx, ty) !== "E" && (ty === 0 || ty === 16 || tx === 0 || tx === 29)) c.rect(tx * TS, ty * TS, TS, TS, "k") })),
    // sortie vers la montagne : rampe en planches
    layer("rampe", c => { if (at(14, 15) !== "E") return; c.rect(224, 240, 32, 32, "k"); for (let i = 0; i < 6; i++) { const y = 240 + i * 5, k = ["N", "n", "n", "B", "B", "x"][i]; c.rect(225, y, 30, 4, k); c.hline(225, y, 30, i < 2 ? "L" : "N") } c.vline(224, 240, 32, "B"); c.vline(255, 240, 32, "B") }),
    // étais des passages : deux montants, un chapeau et des cales, comme dans une galerie
    layer("etais", c => {
      const post = (x, y, h) => { c.rect(x, y, 6, h, "n"); c.vline(x, y, h, "N"); c.vline(x + 5, y, h, "B"); c.hline(x, y + h - 1, 6, "B"); for (let yy = y + 4; yy < y + h - 2; yy += 7) c.px(x + 2, yy, "B") }
      const beam = (x, y, w) => { c.rect(x, y, w, 6, "n"); c.hline(x, y, w, "L"); c.hline(x, y + 5, w, "B"); for (let xx = x + 3; xx < x + w; xx += 9) c.px(xx, y + 2, "B"); c.px(x + 3, y + 3, "J"); c.px(x + w - 4, y + 3, "J") }
      const beamV = (x, y, h) => { c.rect(x, y, 6, h, "n"); c.vline(x, y, h, "L"); c.vline(x + 5, y, h, "B"); c.px(x + 3, y + 3, "J"); c.px(x + 3, y + h - 4, "J") }
      if (!isWall(14, 0)) { post(216, 0, 34); post(258, 0, 34); beam(212, 0, 56); c.line(222, 8, 230, 0, "N"); c.line(257, 8, 249, 0, "N") }
      if (!isWall(14, 16) || at(14, 16) === "E") { post(216, 236, 36); post(258, 236, 36); beam(212, 236, 56) }
      if (!isWall(29, 7)) { beamV(452, 100, 56); post(444, 102, 6); post(444, 148, 6); c.rect(448, 104, 12, 4, "n"); c.rect(448, 148, 12, 4, "n") }
      if (!isWall(0, 7)) { beamV(22, 100, 56); post(30, 102, 6); post(30, 148, 6); c.rect(20, 104, 12, 4, "n"); c.rect(20, 148, 12, 4, "n") }
      // étais réguliers le long du grand mur nord, en miroir autour de l'axe
      for (const x of opts.props || [56, 152]) for (const X of [x, 480 - x - 6]) if (isWall(Math.floor(X / 16), 1) && isFloor(Math.floor(X / 16), 2)) { post(X, 4, 28); c.rect(X - 3, 2, 12, 4, "n"); c.hline(X - 3, 2, 12, "L") }
    }),
    // rochers (cases 'k' du jeu)
    layer("rochers", c => each((tx, ty) => {
      if (at(tx, ty) !== "k") return
      const X = tx * TS, Y = ty * TS
      if (opts.timber) { c.ellipse(X + 8, Y + 14, 8, 3, "x"); c.rect(X + 4, Y - 14, 8, 28, "n"); c.vline(X + 4, Y - 14, 28, "N"); c.vline(X + 11, Y - 14, 28, "B"); c.rect(X + 1, Y - 18, 14, 5, "n"); c.hline(X + 1, Y - 18, 14, "L"); c.line(X + 4, Y - 6, X - 1, Y - 13, "n"); c.line(X + 11, Y - 6, X + 16, Y - 13, "n"); c.px(X + 7, Y - 16, "J"); return }
      boulder(c, X, Y); return
      c.poly([X - 1, Y + 14, X + 1, Y + 4, X + 5, Y - 1, X + 11, Y - 1, X + 16, Y + 5, X + 17, Y + 14], "f")
      c.poly([X + 1, Y + 4, X + 5, Y - 1, X + 11, Y - 1, X + 13, Y + 3, X + 6, Y + 6], "h"); c.line(X + 5, Y - 1, X + 10, Y - 1, "H"); c.line(X + 2, Y + 4, X + 5, Y + 1, "H")
      c.line(X + 8, Y + 6, X + 11, Y + 13, "F"); c.line(X + 13, Y + 6, X + 16, Y + 12, "F"); c.hline(X, Y + 14, 17, "F")
      c.px(X - 2, Y + 14, "f"); c.px(X + 18, Y + 13, "h"); c.px(X + 19, Y + 14, "f")
    })),
    layer("rochers_paroi", c => each((tx, ty) => {
      if (!isWall(tx, ty) || hash(tx, ty, 77) > 0.22) return
      if (isFloor(tx + 1, ty) && tx === 1) boulder(c, tx * TS - 4, ty * TS, 0.8)
      else if (isFloor(tx - 1, ty) && tx === 28) boulder(c, tx * TS + 2, ty * TS, 0.8)
      else if (ty === 15 && isFloor(tx, 14) && at(tx, 16) !== "E") boulder(c, tx * TS, ty * TS - 2, 0.8)
    })),
    layer("decor_haut", c => decorTop && decorTop(c, S)),
    glow("o", { r: 14, strength: 0.45, bands: 3 }),
    glow("z", { r: 6, strength: 0.4, bands: 2 }),
  )
}
function boulder(c, X, Y, s = 1) {
  const P = (dx, dy) => [X + Math.round(dx * s), Y + Math.round(dy * s)]
  c.ellipse(X + Math.round(8 * s), Y + 15, Math.round(11 * s), 3, "x")
  c.poly([...P(-3, 15), ...P(-2, 4), ...P(3, -3), ...P(11, -4), ...P(18, 2), ...P(19, 15)], "f")
  c.poly([...P(-2, 4), ...P(3, -3), ...P(11, -4), ...P(15, 0), ...P(7, 5)], "h"); c.poly([...P(3, -3), ...P(11, -4), ...P(9, -1)], "H")
  c.line(...P(7, 5), ...P(10, 14), "F"); c.line(...P(15, 0), ...P(17, 12), "F"); c.line(...P(-2, 4), ...P(1, 9), "F"); c.hline(X - Math.round(3 * s), Y + 15, Math.round(22 * s), "F")
  c.poly([...P(14, 15), ...P(15, 8), ...P(20, 7), ...P(23, 11), ...P(23, 15)], "f"); c.line(...P(15, 8), ...P(20, 7), "H")
}
// lanternes de mineur accrochées aux étais, par paires symétriques
function lanterns(c, x, y = 12) { for (const X of [x, 480 - x]) { c.vline(X, y, 4, "i"); c.rect(X - 2, y + 4, 5, 7, "i"); c.rect(X - 1, y + 5, 3, 5, "o"); c.hline(X - 3, y + 11, 7, "i") } }
const rubble = (c, cx, cy, n, s) => { for (let i = 0; i < n; i++) { const x = cx + Math.floor((hash(i, s, 1) - 0.5) * 26), y = cy + Math.floor((hash(s, i, 2) - 0.5) * 12), w = 2 + Math.floor(hash(i, s, 3) * 3); c.rect(x, y, w, 2, "f"); c.hline(x, y, w, "H"); c.px(x + w, y + 1, "F") } }

const web = (c, x, y, sx, sy) => { for (let i = 0; i < 5; i++) c.line(x, y, x + sx * (4 + i * 4), y + sy * (16 - i * 3), "E"); for (const r of [5, 9, 13]) for (let i = 0; i < 4; i++) { const a = i / 4, b = (i + 1) / 4; c.line(x + Math.round(sx * r * a), y + Math.round(sy * r * (1 - a)), x + Math.round(sx * r * b), y + Math.round(sy * r * (1 - b)), "e") } }
const pick = (c, x, y) => { c.line(x, y, x + 10, y - 6, "n"); c.line(x + 7, y - 8, x + 13, y - 3, "I"); c.px(x + 10, y - 6, "i") }
const nugget = (c, x, y) => { c.rect(x, y, 2, 2, "y"); c.px(x, y, "P") }
const plank = (c, x, y, w) => { c.rect(x, y, w, 3, "n"); c.hline(x, y, w, "N"); c.px(x + 2, y + 1, "B"); c.px(x + w - 3, y + 1, "B") }
const DECOR = {
  // Entrée : éboulis près des rochers, pioche oubliée, traces de wagonnet vers le nord
  entry: [c => { rubble(c, 120, 100, 10, 1); rubble(c, 360, 190, 10, 2); pick(c, 330, 120); plank(c, 150, 200, 20); for (const y of [230, 220, 210]) { c.px(236, y, "a"); c.px(244, y, "a") } }, c => lanterns(c, 104)],
  // Arène : sol remué, planches cassées et éclats de minerai d'or
  arena: [c => { for (let i = 0; i < 14; i++) nugget(c, 60 + Math.floor(hash(i, 1, 7) * 360), 50 + Math.floor(hash(i, 2, 7) * 180)); plank(c, 90, 90, 18); plank(c, 360, 200, 22); rubble(c, 240, 140, 14, 3) }, c => lanterns(c, 88)],
  // Caisse : la niche est une alcôve étayée de bois (le jeu y coince la caisse)
  crate: [c => { rubble(c, 120, 180, 12, 4); pick(c, 380, 200) }, c => {
      c.rect(288, 32, 16, 80, "x"); c.rect(290, 34, 12, 76, "w")
      for (const X of [288, 320]) { c.rect(X, 32, 16, 80, "n"); c.vline(X, 32, 80, "N"); c.vline(X + 15, 32, 80, "B"); for (let y = 40; y < 108; y += 12) c.hline(X + 1, y, 14, "B") }
      c.rect(286, 28, 52, 8, "n"); c.hline(286, 28, 52, "L"); c.hline(286, 35, 52, "B"); c.px(290, 31, "J"); c.px(333, 31, "J")
    }],
  // Puits : grande trappe de planches cerclée de fer au milieu de la salle obscure
  shaft: [c => { c.rect(208, 116, 64, 48, "B"); for (let x = 210; x < 270; x += 8) { c.rect(x, 118, 7, 44, "n"); c.vline(x, 118, 44, "N") } c.box(208, 116, 64, 48, "i"); c.hline(208, 116, 64, "I"); c.rect(236, 136, 8, 4, "i"); c.px(238, 137, "J"); rubble(c, 120, 220, 8, 5); rubble(c, 360, 70, 8, 6) }, c => lanterns(c, 120)],
  // Carrefour : planches qui bordent les gouffres
  hub: [c => { plank(c, 40, 50, 20); plank(c, 420, 220, 20); rubble(c, 400, 60, 8, 7) }, c => lanterns(c, 96)],
  // Grappin : rouleau de corde et crochet près du vide
  grappin: [c => { for (const r of [6, 5, 4, 3]) c.ring(220, 150, r, r % 2 ? "N" : "n"); c.line(226, 150, 240, 158, "N"); c.line(240, 158, 244, 156, "I"); rubble(c, 100, 90, 10, 8) }, c => lanterns(c, 72)],
  // Araignées : toiles dans les coins et cocons
  spider: [c => { web(c, 34, 50, 1, 1); web(c, 446, 50, -1, 1); web(c, 34, 226, 1, -1); web(c, 446, 226, -1, -1); for (const [x, y] of [[150, 80], [330, 80], [240, 190]]) { c.ellipse(x, y, 3, 5, "E"); c.line(x - 2, y - 2, x + 2, y + 2, "e") } }, c => lanterns(c, 136)],
  // Poteaux (Chauve-souris de cristal) : veines de cristal dans la roche
  posts: [c => rubble(c, 60, 200, 8, 9), c => { for (const x of [80, 400]) { c.line(x, 6, x + 10, 30, "Z"); c.line(x + 1, 6, x + 11, 30, "z"); c.poly([x + 6, 18, x + 9, 8, x + 12, 18], "Z") } }],
  // Grande salle : étais de soutènement (cases 'k'), traces de wagonnets
  hall: [c => { for (const y of [64, 208]) { for (let x = 48; x < 432; x += 6) c.px(x, y, "a") } rubble(c, 90, 150, 10, 10); rubble(c, 390, 150, 10, 11) }, c => lanterns(c, 104)],
  // Taupe de fer : terre retournée, galeries effondrées et griffures
  boss: [c => { for (const [x, y, r] of [[150, 100, 14], [330, 100, 14], [240, 190, 18], [110, 200, 10], [370, 200, 10]]) { c.ellipse(x, y + 2, r + 4, r / 2 + 3, "c"); c.ellipse(x, y, r, r / 2, "x"); c.ellipse(x, y - 1, r - 3, r / 2 - 2, "k") } for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) c.line(200 + i * 18 + j * 3, 132, 206 + i * 18 + j * 3, 146, "a") }, c => lanterns(c, 88)],
  // Captif : paillasse et lanterne posée
  prison: [c => { for (let i = 0; i < 120; i++) { const a = hash(i, 0, 20) * 6.28, r = Math.sqrt(hash(i, 1, 21)), x = Math.round(110 + Math.cos(a) * r * 30), y = Math.round(200 + Math.sin(a) * r * 14); c.line(x, y, x + 3, y + 1, i % 3 ? "P" : "N") } rubble(c, 380, 200, 10, 12) }, c => lanterns(c, 120)],
}

const ROOMS = {"entry": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW____k________________km___WW", "WW______mm__________________WW", "________________m_____________", "______________________________", "WW__________________________WW", "WW__________________________WW", "WW____k____m___________k____WW", "WW_______________m_m________WW", "WW__m_______________________WW", "WW__________________________WW", "WWWWWWWWWWWWWWEEWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWEEWWWWWWWWWWWWWW"], "arena": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW_______________________m__WW", "WW______________m___________WW", "WW__________________________WW", "WW_________________________mWW", "WW__________________________WW", "WW____________________________", "WW____________________________", "WW__________________________WW", "WW______________________mm__WW", "WW__________________________WW", "WW________________________m_WW", "WW__________________________WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "crate": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW________________WWW_______WW", "WW________________W_W_______WW", "WW________________W_W_______WW", "WW________________W_W_______WW", "WW________________W_W_______WW", "______________________________", "________m_____________________", "WW_________________________mWW", "WW___________m______________WW", "WW__________________________WW", "WW__________________________WW", "WW___m______________________WW", "WW_________m________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "shaft": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__m__________________m____WW", "WW__________________m_______WW", "WW__________________________WW", "WW__________________________WW", "WW________k________k________WW", "____________________________WW", "__________________m_________WW", "WW__________________________WW", "WW______________m___________WW", "WW_____m__k________k_m______WW", "WW______m___________________WW", "WW_______________m__________WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "hub": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW_________________r________WW", "WW_vvvvvvvvvvvvvvvvTvvvvvvv_WW", "WW_vvvvvvvvvvvvvvvvTvvvvvvv_WW", "WW______vvvvvvvvvvvTvv______WW", "________vvvvvvvvvvvTvv________", "______rrTTTTTTTTTTTTTTrr______", "WWm_____vvvTvvvvvvvvvv______WW", "WW______vvvTvvvvvvvvvv______WW", "WW_vvvvvvvvTvvvvvvvvvvvvvvv_WW", "WW_vvvvvvvvTvvvvvvvvvvvvvvv_WW", "WW_________r________________WW", "WW__________________________WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "grappin": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW______m___________________WW", "WW______________vvvvv_____m_WW", "WW______________vvvvv_______WW", "WW______________vvvvv_______WW", "WW______________vvvvvvvvvvv_WW", "WW____________________________", "WW____________________________", "WW__________________________WW", "WW__________________________WW", "WW______m___________________WW", "WW__________________________WW", "WW__________________________WW", "WW___________________m______WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "spider": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW_____________m____________WW", "WW__________________________WW", "WW________m_________________WW", "WW_______________m__________WW", "WW__________________________WW", "WW_m________________________WW", "WW_________m________________WW", "WW__________________________WW", "WW____________m___m_________WW", "WW__________________________WW", "WW_________________________mWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "posts": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "___________________m________WW", "________________m___________WW", "WW__________________________WW", "WW__________m_______________WW", "WW__________________________WW", "WW__________________m_______WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "hall": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW____m_____________________WW", "WW______k____________k______WW", "WW__________________________WW", "WW_________m________________WW", "WW____________k_____________WW", "WW__________________________WW", "WW_____________________m____WW", "WW______k____________k______WW", "WW________________m_________WW", "WW__________________________WW", "WW__________________m_______WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "boss": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW________________________m_WW", "WW_____________mm___________WW", "WW___k__________________k___WW", "WW__________________________WW", "WW__________________________WW", "WW___________________m______WW", "WW__m_______________________WW", "WW__________m_______________WW", "WW__________________________WW", "WW__________________________WW", "WW___k__________________k__mWW", "WW___m_m____________________WW", "WW_________m________________WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWWm_WWWWWWWWWWWWWW"], "prison": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW__________m_______________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW_______________________m__WW", "WW__________________________WW", "WW_____m____________________WW", "WW__________________________WW", "WWm_________________________WW", "WW______________________m___WW", "WW__________________________WW", "WW_____________m___m____m___WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"]};
for (const [n, grid] of Object.entries(ROOMS)) room('mines_' + n, grid, DECOR[n][0], DECOR[n][1], { timber: n === 'hall' })
