// Escape Night 2 — Donjon 2 « Le Bois des murmures » : forêt magique, ambiance mystérieuse.
// Grilles = collisions du jeu (bois.js, seed 33). 30 × 17 tuiles de 16 px. Les objets du jeu (buissons, champignons lumineux, coffres, stèles…) se dessinent par-dessus.
pal({
  k: "#08100e", x: "#0e1d18", w: "#15291f", t: "#1f3a2b", T: "#2d5238", v: "#477a4e",            // canopée
  F: "#231c1c", f: "#382c28", h: "#4e3e34", H: "#6a5444",                                         // écorce
  a: "#2f4a3c", b: "#3b5a48", c: "#466a52", d: "#527a5c", l: "#6f9a6a",                           // sol moussu (sous la lune tamisée)
  p: "#6a6650", P: "#807a60", j: "#55523f",                                                       // sentier battu
  m: "#2a6a5a", M: "#3a8a72", g: "#8ff3ea",                                                       // mousse et champignons luisants
  z: "#d4c2ff", Z: "#7a62c8", o: "#ffd27a", O: "#c08a3a",                                         // magie violette, lanternes
  q: "#0d262c", Q: "#123c46", u: "#1d5862", U: "#6ab4b0",                                         // étang
  G: "#2f6a3e", n: "#55a060", r: "#f09ac8", R: "#a8507a",                                         // nénuphars, fleurs
  B: "#4a3424", N: "#a8865e", s: "#8a6a44",                                                       // souches (cernes)
  i: "#24242e", I: "#4a4a5a", e: "#cfc6ae", E: "#8e866e", y: "#b08a50", Y: "#7a5a30",              // plumes, os, noisettes
  S: "#6e7270", A: "#9aa09a",                                                                     // pierres levées
})
ramps("kxwtTv", "kFfhH", "kabcdl", "jpP", "kmMg", "kZz", "kOo", "qQuU", "kGn", "kRr", "kBsN", "kiI", "kEe", "kYy", "kSA")
const TS = 16, CW = 30, CH = 17
const hash = (x, y, s = 0) => { let n = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967296 }
// bruit doux (taches de lune à travers la canopée)
const vnoise = (x, y, sc, s) => { const X = x / sc, Y = y / sc, x0 = Math.floor(X), y0 = Math.floor(Y), fx = X - x0, fy = Y - y0, sm = t => t * t * (3 - 2 * t)
  const a = hash(x0, y0, s), b = hash(x0 + 1, y0, s), c = hash(x0, y0 + 1, s), d = hash(x0 + 1, y0 + 1, s), u = sm(fx), v = sm(fy)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v }
const segDist = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))); return Math.hypot(px - ax - t * dx, py - ay - t * dy) }

function room(name, MAP, decorFloor, decorTop) {
  const at = (x, y) => (y < 0 || y >= CH || x < 0 || x >= CW) ? "W" : MAP[y][x]
  const isWall = (x, y) => at(x, y) === "W", isWater = (x, y) => at(x, y) === "~"
  const isFloor = (x, y) => !isWall(x, y) && !isWater(x, y)
  const S = { at, isWall, isWater, isFloor }
  const each = fn => { for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CW; tx++) fn(tx, ty) }
  // sentiers : de chaque sortie vers le cœur de la clairière
  const exits = []
  if (!isWall(14, 0)) exits.push([240, 0]); if (!isWall(14, 16)) exits.push([240, 272])
  if (!isWall(0, 7)) exits.push([0, 128]); if (!isWall(29, 7)) exits.push([480, 128])
  const C = [240, 140], onPath = (X, Y) => exits.reduce((m, [ex, ey]) => Math.min(m, segDist(X, Y, ex, ey, C[0], C[1])), 1e9) + (vnoise(X, Y, 30, 41) - 0.5) * 8 + (vnoise(X, Y, 6, 42) - 0.5) * 3
  scene(name, { w: CW * TS, h: CH * TS, bg: "k" },
    layer("sol", c => each((tx, ty) => {
      if (!isFloor(tx, ty)) return
      for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
        const X = tx * TS + x, Y = ty * TS + y, n = vnoise(X, Y, 44, 5) * 0.8 + vnoise(X, Y, 14, 6) * 0.2
        let k = n < 0.3 ? "a" : n < 0.6 ? "b" : n < 0.8 ? "c" : "d"
        const pd = onPath(X, Y)
        if (pd < 8) k = pd < 5.5 ? (hash(X >> 1, Y >> 1, 7) < 0.12 ? "P" : "p") : "j"
        c.px(X, Y, k)
      }
    })),
    layer("etang", c => each((tx, ty) => {
      if (!isWater(tx, ty)) return
      for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
        const X = tx * TS + x, Y = ty * TS + y
        let k = vnoise(X, Y, 20, 8) < 0.45 ? "q" : "Q"
        if ((Y + Math.floor(X / 11)) % 9 === 0 && hash(X >> 3, Y, 9) < 0.5) k = "u"
        c.px(X, Y, k)
      }
      if (!isWater(tx, ty - 1)) { c.hline(tx * TS, ty * TS, TS, "a"); c.hline(tx * TS, ty * TS + 1, TS, "x") }
      if (!isWater(tx, ty + 1)) c.hline(tx * TS, ty * TS + 15, TS, "u")
      if (!isWater(tx - 1, ty)) c.vline(tx * TS, ty * TS, TS, "a")
      if (!isWater(tx + 1, ty)) c.vline(tx * TS + 15, ty * TS, TS, "a")
    })),
    layer("decor_sol", c => decorFloor && decorFloor(c, S)),
    // touffes d'herbe haute là où l'on ne marche pas : au pied des arbres et des souches
    layer("herbes", c => each((tx, ty) => {
      if (!isFloor(tx, ty)) return
      const nearWall = isWall(tx, ty - 1) || isWall(tx - 1, ty) || isWall(tx + 1, ty) || isWall(tx, ty + 1) || at(tx, ty - 1) === "s" || at(tx - 1, ty) === "s" || at(tx + 1, ty) === "s"
      const n = nearWall ? 3 : (hash(tx, ty, 50) < 0.2 ? 1 : 0)
      for (let i = 0; i < n; i++) {
        const X = tx * TS + 2 + Math.floor(hash(tx, ty, 51 + i) * 12), Y = ty * TS + 4 + Math.floor(hash(ty, tx, 52 + i) * 10)
        if (onPath(X, Y) < 10) continue
        c.vline(X, Y - 3, 3, "l"); c.px(X - 1, Y - 2, "d"); c.px(X + 1, Y - 2, "d"); c.px(X - 2, Y - 1, "c"); c.px(X + 2, Y - 1, "c")
      }
    })),
    // mousse luisante et petits champignons (cases 'm' du jeu)
    layer("mousse", c => each((tx, ty) => {
      if (at(tx, ty) !== "m") return
      const X0 = tx * TS, Y0 = ty * TS
      for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) { const d = Math.hypot(x - 8, (y - 9) * 1.4) + hash(X0 + x, Y0 + y, 7) * 4; if (d < 8) c.px(X0 + x, Y0 + y, d < 5 ? "M" : "m") }
      for (let i = 0; i < (hash(tx, ty, 9) < 0.35 ? 1 : 0); i++) { const X = X0 + 4 + Math.floor(hash(tx, ty, i) * 8), Y = Y0 + 6 + Math.floor(hash(ty, tx, i) * 6); c.vline(X, Y, 2, "e"); c.hline(X - 1, Y - 1, 3, "g"); c.px(X, Y - 2, "g") }
    })),
    // souches (cases 's' du jeu)
    layer("souches", c => each((tx, ty) => {
      if (at(tx, ty) !== "s") return
      const X = tx * TS, Y = ty * TS
      c.ellipse(X + 8, Y + 14, 9, 3, "x")
      c.rect(X + 2, Y + 3, 12, 11, "f"); c.vline(X + 3, Y + 3, 11, "h"); c.vline(X + 12, Y + 3, 11, "F"); c.vline(X + 7, Y + 5, 8, "F")
      c.line(X + 2, Y + 13, X - 1, Y + 15, "f"); c.line(X + 13, Y + 13, X + 16, Y + 15, "f"); c.line(X + 8, Y + 14, X + 8, Y + 16, "f")  // racines
      c.ellipse(X + 8, Y + 3, 6, 3, "s"); c.ring(X + 8, Y + 3, 0, "N"); c.ellipse(X + 8, Y + 3, 4, 2, "N", true); c.ellipse(X + 8, Y + 3, 6, 3, "B", true)
      c.px(X + 3, Y + 9, "M"); c.px(X + 4, Y + 10, "m"); c.px(X + 3, Y + 7, "g")                                     // mousse sur l'écorce
    })),
    // forêt : canopée vue de dessus, troncs et racines là où le bois borde la clairière
    layer("arbres", c => {
      each((tx, ty) => { if (isWall(tx, ty)) c.rect(tx * TS, ty * TS, TS, TS, "x") })
      // troncs sur les faces (bois avec de la clairière juste en dessous)
      each((tx, ty) => {
        if (!isWall(tx, ty) || !(isFloor(tx, ty + 1) || isWater(tx, ty + 1))) return
        const X0 = tx * TS, Y0 = ty * TS, n = hash(tx, ty, 60) < 0.55 ? 1 : 2
        for (let i = 0; i < n; i++) {
          const w = 4 + Math.floor(hash(tx, ty, 61 + i) * 3), x = X0 + (n === 1 ? 6 : 2 + i * 8) + Math.floor(hash(tx, i, 62) * 2)
          c.rect(x, Y0 + 4, w, 12, "f"); c.vline(x, Y0 + 4, 12, "h"); c.vline(x + w - 1, Y0 + 4, 12, "F")
          for (let yy = Y0 + 6; yy < Y0 + 15; yy += 3) c.px(x + 1 + ((yy >> 1) % Math.max(1, w - 2)), yy, "F")  // stries de l'écorce
          c.line(x, Y0 + 15, x - 3, Y0 + 18, "f"); c.line(x + w - 1, Y0 + 15, x + w + 2, Y0 + 18, "f")         // racines sur le sol
        }
      })
      // grappes de feuillage sur tous les bois
      each((tx, ty) => {
        if (!isWall(tx, ty)) return
        const face = isFloor(tx, ty + 1) || isWater(tx, ty + 1)
        const cx = tx * TS + 8 + Math.floor((hash(tx, ty, 70) - 0.5) * 6), cy = ty * TS + (face ? 4 : 8) + Math.floor((hash(ty, tx, 71) - 0.5) * 6)
        const r = face ? 8 : 10 + Math.floor(hash(tx, ty, 72) * 3), base = hash(tx, ty, 73) < 0.5 ? "w" : "t"
        c.circ(cx, cy, r, base)
        c.circ(cx - 2, cy - 2, r - 3, base === "w" ? "t" : "T")
        for (let k = 0; k < 6; k++) { const a = -2.4 + k * 0.35, rr = r - 2; c.px(Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr), "v") }
        c.px(cx - 3, cy - 4, "v"); c.px(cx - 4, cy - 3, "T")
      })
    }),
    layer("ombre_bois", { shade: true }, c => each((tx, ty) => {
      if (isWall(tx, ty)) return
      if (isWall(tx, ty - 1)) c.rect(tx * TS, ty * TS + 2, TS, 4, "k")
      if (isWall(tx - 1, ty)) c.rect(tx * TS, ty * TS, 3, TS, "k")
      if (isWall(tx + 1, ty)) c.rect(tx * TS + TS - 3, ty * TS, 3, TS, "k")
    })),
    layer("ombre_douce", { shade: true, density: 0.5 }, c => each((tx, ty) => {
      if (isWall(tx, ty)) return
      if (isWall(tx, ty - 1)) c.rect(tx * TS, ty * TS + 6, TS, 5, "k")
      if (isWall(tx - 1, ty)) c.rect(tx * TS + 3, ty * TS, 4, TS, "k")
      if (isWall(tx + 1, ty)) c.rect(tx * TS + TS - 7, ty * TS, 4, TS, "k")
      if (isWall(tx, ty + 1)) c.rect(tx * TS, ty * TS + 12, TS, 4, "k")
    })),
    layer("passages", { shade: true, density: 0.5 }, c => each((tx, ty) => { if (!isWall(tx, ty) && (ty <= 1 || ty >= 15 || tx <= 1 || tx >= 28)) c.rect(tx * TS, ty * TS, TS, TS, "k") })),
    layer("passages2", { shade: true }, c => each((tx, ty) => { if (!isWall(tx, ty) && (ty === 0 || ty === 16 || tx === 0 || tx === 29)) c.rect(tx * TS, ty * TS, TS, TS, "k") })),
    // seuils : deux pierres levées gravées d'une rune luisante, de part et d'autre de chaque passage
    layer("seuils", c => {
      const menhir = (x, y) => { c.ellipse(x + 5, y + 20, 7, 2, "x"); c.poly([x, y + 20, x + 1, y + 4, x + 4, y, x + 8, y + 2, x + 10, y + 20], "S"); c.line(x + 1, y + 19, x + 1, y + 5, "A"); c.line(x + 4, y + 1, x + 7, y + 3, "A"); c.vline(x + 9, y + 6, 14, "E")
        c.vline(x + 5, y + 7, 6, "g"); c.px(x + 4, y + 8, "g"); c.px(x + 6, y + 10, "g"); c.px(x + 4, y + 12, "g") }
      const steps = pts => { for (const [x, y] of pts) { c.ellipse(x, y, 5, 3, "j"); c.ellipse(x, y - 1, 4, 2, "P") } }
      if (!isWall(14, 0)) { menhir(206, 12); menhir(264, 12); steps([[240, 40], [234, 52]]) }
      if (!isWall(14, 16)) { menhir(206, 228); menhir(264, 228); steps([[240, 236], [246, 224]]) }
      if (!isWall(29, 7)) { menhir(450, 86); menhir(450, 146); steps([[440, 128], [428, 122]]) }
      if (!isWall(0, 7)) { menhir(20, 86); menhir(20, 146); steps([[40, 128], [52, 122]]) }
    }),
    layer("decor_haut", c => decorTop && decorTop(c, S)),
    glow("g", { r: 3, strength: 0.25, bands: 2 }),
    glow("o", { r: 12, strength: 0.4, bands: 3 }),
    glow("z", { r: 10, strength: 0.4, bands: 3 }),
  )
}
// lanternes suspendues aux branches, toujours par paires symétriques autour de l'axe (x = 240)
function lanterns(c, x, y = 16, len = 10) {
  for (const X of [x, 480 - x]) { c.vline(X, y, len, "F"); c.rect(X - 2, y + len, 5, 6, "O"); c.rect(X - 1, y + len + 1, 3, 4, "o"); c.hline(X - 2, y + len, 5, "F"); c.px(X, y + len + 6, "F") }
}
const wisp = (c, x, y) => { c.px(x, y, "z"); c.px(x + 1, y, "Z"); c.px(x, y + 1, "Z") }   // feux follets violets

const twigs = (c, cx, cy, rx, ry, n, seed) => { for (let i = 0; i < n; i++) { const a = hash(i, seed, 1) * 6.283, r = 1 - hash(i, seed, 2) * 0.25, x = Math.round(cx + Math.cos(a) * rx * r), y = Math.round(cy + Math.sin(a) * ry * r), t = a + 1.57 + (hash(i, seed, 3) - 0.5); c.line(x, y, Math.round(x + Math.cos(t) * 7), Math.round(y + Math.sin(t) * 4), i % 3 ? "h" : "f") } }
const feather = (c, x, y, k1, k2) => { c.line(x, y, x + 5, y - 2, k1); c.line(x + 1, y + 1, x + 5, y - 1, k2); c.px(x - 1, y + 1, k2) }
const leaf = (c, x, y, k) => { c.px(x, y, k); c.px(x + 1, y, k); c.px(x + 2, y + 1, k) }
const shroomRing = (c, cx, cy, r, ry) => { for (let i = 0; i < 28; i++) { const a = i / 28 * 6.283 + hash(i, 9, 1) * 0.1, x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * ry); c.vline(x, y, 2, "e"); c.hline(x - 1, y - 1, 3, i % 2 ? "Z" : "R"); c.px(x, y - 2, i % 2 ? "z" : "r") } }

const DECOR = {
  // Entrée : le sentier s'enfonce dans le bois, deux feux follets montent la garde
  entry: [c => { for (const [x, y] of [[120, 100], [360, 100], [90, 200], [390, 200]]) wisp(c, x, y) },
    c => lanterns(c, 96)],
  // Arène : un cercle de fées, champignons violets et roses autour de la clairière
  arena: [c => shroomRing(c, 240, 144, 74, 50), c => lanterns(c, 120)],
  // Étang : nénuphars, roseaux sur les berges, fleurs sur l'îlot
  pond: [(c, S) => {
      for (const [x, y, r] of [[150, 96, 5], [176, 118, 4], [320, 102, 5], [300, 168, 4], [196, 176, 5], [338, 140, 4], [130, 140, 4]]) { c.ellipse(x, y, r, r - 2, "G"); c.ellipse(x - 1, y - 1, r - 2, r - 3, "n"); c.line(x, y, x + r, y - 1, "Q") }
      for (const [x, y] of [[168, 98], [304, 170]]) { c.rect(x, y, 2, 2, "r"); c.px(x, y, "R") }
      for (const [x, y] of [[230, 132], [250, 134], [240, 140]]) { c.px(x, y, "r"); c.px(x + 1, y + 1, "z") }
      for (let ty = 0; ty < 17; ty++) for (let tx = 0; tx < 30; tx++) { if (!S.isFloor(tx, ty) || (tx === 14 || tx === 15) && ty === 8) continue; const wet = S.isWater(tx, ty - 1) || S.isWater(tx, ty + 1) || S.isWater(tx - 1, ty) || S.isWater(tx + 1, ty); if (!wet) continue
        for (let i = 0; i < 2; i++) { const x = tx * 16 + 3 + Math.floor(hash(tx, ty, 90 + i) * 10), y = ty * 16 + 6 + Math.floor(hash(ty, tx, 92 + i) * 8); c.vline(x, y - 6, 6, "G"); c.vline(x + 2, y - 4, 4, "n"); c.px(x, y - 7, "Y") } }  // roseaux sur la berge
      c.rect(226, 130, 28, 12, "c"); for (const [x, y] of [[230, 134], [248, 136], [238, 132]]) { c.px(x, y, "r"); c.px(x + 1, y + 1, "G") }  // l'îlot, herbu et fleuri
    }, c => lanterns(c, 80)],
  // Moulin : le vent du vieux moulin a couché les feuilles en traînées ; une meule fendue gît au sol
  wind: [c => {
      c.ellipse(240, 196, 20, 9, "j"); c.ellipse(240, 194, 18, 8, "A"); c.ellipse(240, 194, 18, 8, "S", true); c.ellipse(240, 194, 4, 2, "j"); c.line(232, 188, 246, 201, "E")
      for (let s = 0; s < 14; s++) { const x0 = 40 + hash(s, 1, 80) * 380, y0 = 50 + hash(s, 2, 81) * 180; for (let i = 0; i < 6; i++) leaf(c, Math.round(x0 + i * 9), Math.round(y0 + i * 2 + hash(s, i, 82) * 3), ["v", "T", "y", "Y"][(s + i) % 4]) }
    }, c => lanterns(c, 72)],
  // Salle du frisbee : un cercle de dalles runiques autour du grand coffre
  frisbee: [c => {
      for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, x = Math.round(240 + Math.cos(a) * 60), y = Math.round(140 + Math.sin(a) * 36); c.ellipse(x, y, 7, 4, "S"); c.ellipse(x, y - 1, 6, 3, "A"); if (i % 4 === 0) c.px(x, y - 1, "z") }
      c.ellipse(240, 140, 44, 26, "Z", true)
    }, c => lanterns(c, 104)],
  // Lanternes : des racines luisantes relient les deux lanternes-interrupteurs au centre
  switches: [c => { for (const [x0, y0] of [[136, 72], [344, 72]]) { let x = x0, y = y0; for (let k = 0; k < 8; k++) { const nx = x + (240 - x) / (8 - k) + (hash(k, x0, 3) - 0.5) * 8, ny = y + (150 - y) / (8 - k); c.line(Math.round(x), Math.round(y), Math.round(nx), Math.round(ny), "m"); if (k % 2) c.px(Math.round(nx), Math.round(ny), "g"); x = nx; y = ny } } },
    c => lanterns(c, 64)],
  // Grande clé : le nid du Corbeau géant, plumes noires éparpillées
  bigkey: [c => {
      c.ellipse(240, 152, 46, 24, "a"); twigs(c, 240, 152, 48, 26, 90, 3); c.ellipse(240, 152, 34, 16, "j")
      for (let i = 0; i < 22; i++) feather(c, 50 + Math.floor(hash(i, 1, 30) * 380), 50 + Math.floor(hash(i, 2, 31) * 180), "i", "I")
    }, c => lanterns(c, 88)],
  // Hauteurs : un réseau de racines court entre les souches
  upper: [(c, S) => {
      const st = []; for (let ty = 0; ty < 17; ty++) for (let tx = 0; tx < 30; tx++) if (S.at(tx, ty) === "s") st.push([tx * 16 + 8, ty * 16 + 14])
      for (let i = 0; i < st.length; i++) { let best = null, bd = 1e9; for (let j = 0; j < st.length; j++) { if (i === j) continue; const d = Math.hypot(st[i][0] - st[j][0], st[i][1] - st[j][1]); if (d < bd) { bd = d; best = st[j] } } if (best && bd < 90) { const mx = (st[i][0] + best[0]) / 2, my = (st[i][1] + best[1]) / 2 + 6; c.line(st[i][0], st[i][1], Math.round(mx), Math.round(my), "f"); c.line(Math.round(mx), Math.round(my), best[0], best[1], "f"); c.px(Math.round(mx), Math.round(my) - 1, "h") } }
    }, c => lanterns(c, 112)],
  // Trésor des écureuils : tas de noisettes et coquilles, une traînée mène au coffre
  treasure: [c => {
      const nut = (x, y) => { c.rect(x, y, 3, 3, "y"); c.hline(x, y, 3, "Y"); c.px(x + 1, y + 2, "Y") }
      for (const [cx, cy, n] of [[60, 66, 10], [420, 66, 10], [60, 214, 8], [420, 214, 8]]) for (let i = 0; i < n; i++) nut(c, cx + Math.floor((hash(cx, i, 1) - 0.5) * 30), cy + Math.floor((hash(i, cy, 2) - 0.5) * 16))
      for (let i = 0; i < 9; i++) nut(c, 70 + i * 18 + Math.floor(hash(i, 0, 5) * 4), 210 - i * 9)
    }, c => lanterns(c, 96)],
  // Nid du Grand-Duc : couronne de branchages, plumes rousses, pelotes et os
  boss: [c => {
      c.ellipse(240, 132, 84, 46, "a"); twigs(c, 240, 132, 88, 50, 170, 7); twigs(c, 240, 132, 74, 40, 80, 8)
      for (let i = 0; i < 18; i++) { const a = hash(i, 3, 40) * 6.283, r = 30 + hash(i, 4, 41) * 110; feather(c, Math.round(240 + Math.cos(a) * r), Math.round(132 + Math.sin(a) * r * 0.55), "y", "Y") }
      for (const [x, y] of [[96, 70], [384, 70], [110, 214], [370, 214]]) { c.ellipse(x, y, 3, 2, "E"); c.px(x - 1, y, "e"); c.line(x + 4, y + 2, x + 9, y + 2, "e") }
      for (const [x, y] of [[70, 110], [410, 110], [70, 180], [410, 180]]) wisp(c, x, y)
    }, c => lanterns(c, 64)],
  // Creux de la prison : racines, fleurs autour de la cage, feux follets
  prison: [c => {
      for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, x = Math.round(240 + Math.cos(a) * 52), y = Math.round(116 + Math.sin(a) * 30); c.px(x, y, i % 2 ? "r" : "z"); c.px(x, y + 1, "G") }
      for (const [x, y] of [[150, 90], [330, 90]]) wisp(c, x, y)
    }, c => lanterns(c, 120)],
}

const ROOMS = {"entry": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW_____m____________________WW", "WW__________________________WW", "WW____m_m_____m_____________WW", "WWm_m_s________________s____WW", "WW_________________m________WW", "______________________________", "______________________________", "WW_______m__________________WW", "WW__________________________WW", "WW____s________________s____WW", "WW__________________________WW", "WW__________________m_______WW", "WW_____________________m____WW", "WWWWWWWWWWWWWWEEWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWEEWWWWWWWWWWWWWW"], "arena": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW________________m_________WW", "WW________________m_________WW", "WW___________________m______WW", "WW______s_m__________s______WW", "WW________________________m_WW", "____________________________WW", "______________m_____________WW", "WW___m__m_m_________________WW", "WW________________m_________WW", "WW_m__________s_____________WW", "WW__________________________WW", "WW_________________m________WW", "WW___________m______________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "pond": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW______m___________________WW", "WW____m_____________________WW", "WW________m__~~~~___m_____m_WW", "WW_______~~~~~~~~~~~~_______WW", "WW__m___~~~~~~~~~~~~~~______WW", "WW_____~~~~~~~~~~~~~~~~_______", "WW_m___~~~~~~~__~~~~~~~_______", "WW_____~~~~~~~~~~~~~~~~_____WW", "WW_m____~~~~~~~~~~~~~~______WW", "WW_______~~~~~~~~~~~~_______WW", "WW___________~~~~_____m_____WW", "WW__________________________WW", "WW_m____________________m___WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "wind": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW____________________m_m___WW", "WW__________s_______________WW", "WW__m__________ms___________WW", "WW___s___________m_s_m__m___WW", "WW____________m____m________WW", "__________s____m_____m______m_", "___________________m____s_m___", "WW____________s__m__________WW", "WWm_________________________WW", "WW______s_________m__s_____mWW", "WW________________m_________WW", "WW_________________________mWW", "WW___m________m________m____WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "frisbee": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW________________m_________WW", "WW______m__________m________WW", "WW____s________________s____WW", "WW_____________mm___________WW", "WW__________________________WW", "WW___________m________________", "WW____________________________", "WW____________m_____________WW", "WW__________________________WW", "WW_________m____________m___WW", "WW____s________________s____WW", "WW_____m_______________m____WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "switches": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW_mWWWWWWWWWWWWWW", "WW__________________________WW", "WW___s_____s__m___s_____s___WW", "WW__ms_____s______s_____s___WW", "WW___s_____s______s_____s___WW", "WW____sssss________sssss____WW", "____________________________WW", "____________________________WW", "WW__________________________WW", "WW__________________________WW", "WW_________________________mWW", "WW__m_______________m_______WW", "WW______________________m___WW", "WW_______________________m__WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "bigkey": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________m_______WW", "WW_______m__________________WW", "WW_____s_m__________m_s_____WW", "WW__________________________WW", "WW___________m______________WW", "WW____________m_____________WW", "WW______________________m___WW", "WW__________________________WW", "WW__________m_______________WW", "WW_______________________m__WW", "WWm____sm_____________s_____WW", "WW___m______________________WW", "WW_____________m____________WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "upper": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW_____________________m__m_WW", "WW________________m_________WW", "WW_________________________mWW", "WW__s_____s_____s__m__s_____sW", "WW__________________________WW", "____________m_________m_____WW", "________s____________s______WW", "WW__________m_______________WW", "WW_m___s_____s_m___s___m_s__WW", "WW__________________________WW", "WW____m____s______s_________WW", "WW________m_________________WW", "WWm________________m________WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "treasure": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW_________________m________WW", "WW__________________________WW", "WW______m___________________WW", "WW______s____________s______WW", "WWm_________________________WW", "WW______________m__________m__", "WW___m________________________", "WW_________m__________m____mWW", "WW__________________________WW", "WW______s____________s______WW", "WW_______________________mm_WW", "WW_____mm_________m__m_m____WW", "WW__m_______________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "boss": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW_m____________________m___WW", "WW______m_____________m_____WW", "WWm_________________________WW", "WWm______m__________________WW", "WW_m_______________m________WW", "WW_m__________________m_____WW", "WW__________________________WW", "WW__________________________WW", "WW_m________________________WW", "WW___m_m____________________WW", "WW________________m_________WW", "WW__________________________WW", "WW_____m_______________m____WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "prison": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW__________m_______________WW", "WW_______________m_________mWW", "WW__________________m_____m_WW", "WW__________________________WW", "WW__________m_______________WW", "WW__________________________WW", "WW__________m_______________WW", "WW_____________m____________WW", "WW_m________________m_______WW", "WW___________m______________WW", "WW_____m_m______m____m__m___WW", "WW________m_________m___m_m_WW", "WWWWWWWWWWWWWW_mWWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"]};
for (const [n, grid] of Object.entries(ROOMS)) room('bois_' + n, grid, DECOR[n][0], DECOR[n][1])
