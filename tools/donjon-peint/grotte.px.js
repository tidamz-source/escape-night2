// Escape Night 2 — Donjon 1 « La Grotte des lucioles » en donjon médiéval. Grilles = collisions du jeu (cave.js, seed 21).
pal({
  k: "#0b0a14", w: "#191526", x: "#141022", t: "#201a32", T: "#2b2540",
  F: "#1c1830", f: "#2b2540", h: "#3a3354", H: "#4a4266",
  a: "#22253a", b: "#2c3048", c: "#343956", d: "#3e4466",
  m: "#1f4a4a", M: "#2f6a62", g: "#6fe0d0",
  R: "#4a1626", r: "#7a2434", e: "#9a3a40", Y: "#9a7a34", y: "#e0c068", o: "#c89a48",
  i: "#34344a", I: "#62627e",
  q: "#0c1424", Q: "#14223e", u: "#1f3a62", U: "#4a78a8",
  B: "#3a261a", n: "#5e4028", N: "#86603a",
  s: "#5a4c2a", S: "#86703e", p: "#3e3a40", P: "#4c4650", j: "#2c2a34", z: "#9ff6ff", Z: "#4ab8d0", v: "#c8c0a8", V: "#8a8270",
})
ramps("kxwtT", "kFfhH", "kabcd", "kmMg", "kRre", "kYoy", "kiI", "qQuU", "kBnN", "ksS", "jpP", "kZz", "kVv")
const TS = 16, CW = 30, CH = 17
const hash = (x, y, s = 0) => { let n = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967296 }
const SOLIDISH = new Set(["W"])

function room(name, MAP, decorFloor, decorTop, opts = {}) {
  const at = (x, y) => (y < 0 || y >= CH || x < 0 || x >= CW) ? "W" : MAP[y][x]
  const isWall = (x, y) => at(x, y) === "W"
  const isWater = (x, y) => at(x, y) === "~"
  const isFloor = (x, y) => !isWall(x, y) && !isWater(x, y)
  const S = { at, isWall, isWater, isFloor }
  const each = (fn) => { for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CW; tx++) fn(tx, ty) }
  scene(name, { w: CW * TS, h: CH * TS, bg: "k" },
    layer("sol", (c) => each((tx, ty) => {
      if (!isFloor(tx, ty)) return
      const slabW = opts.slab || 32
      for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
        const X = tx * TS + x, Y = ty * TS + y, row = Math.floor(Y / 16), off = (row % 2) * (slabW / 2)
        const sx = (X + off) % slabW, slab = Math.floor((X + off) / slabW) * 97 + row
        let k = hash(slab, row, 3) < 0.1 ? "c" : "b"
        if (Y % 16 === 0 || (sx === 0 && hash(slab, row, 4) < 0.5)) k = "c"
        if (sx === slabW - 1 || Y % 16 === 15) k = "a"
        c.px(X, Y, k)
      }
    })),
    layer("eau", (c) => each((tx, ty) => {
      if (!isWater(tx, ty)) return
      for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
        const X = tx * TS + x, Y = ty * TS + y
        let k = "Q"
        if (!isWater(tx, ty - 1) && y < 5) k = y < 4 ? (y === 0 ? "h" : "f") : "F"       // margelle vue de face
        else if ((Y + Math.floor(X / 9)) % 7 === 0 && hash(Math.floor(X / 6), Y, 5) < 0.5) k = "u"  // vaguelettes
        else if (hash(X >> 2, Y >> 2, 6) < 0.15) k = "q"
        c.px(X, Y, k)
      }
      if (!isWater(tx, ty + 1)) c.hline(tx * TS, ty * TS + TS - 1, TS, "q")
      if (!isWater(tx - 1, ty)) c.vline(tx * TS, ty * TS, TS, "F")
      if (!isWater(tx + 1, ty)) c.vline(tx * TS + TS - 1, ty * TS, TS, "F")
    })),
    layer("decor_sol", (c) => decorFloor && decorFloor(c, S)),
    layer("mousse", (c) => each((tx, ty) => {
      if (at(tx, ty) !== "m") return
      for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
        const X = tx * TS + x, Y = ty * TS + y, row = Math.floor(Y / 16), sx = (X + (row % 2) * 16) % 32, sy = Y % 16
        const seam = sx === 31 || sy === 15 || ((sx === 30 || sy === 14) && hash(X, Y, 2) < 0.5)
        const d = Math.hypot(x - 8, y - 8) + hash(X, Y, 7) * 6
        if (seam && d < 14) c.px(X, Y, d < 8 && hash(X, Y, 8) < 0.6 ? "M" : "m")
      }
      for (let i = 0; i < 2; i++) c.px(tx * TS + 3 + Math.floor(hash(tx, ty, i) * 10), ty * TS + 3 + Math.floor(hash(ty, tx, i) * 10), "g")
    })),
    layer("murs", (c) => each((tx, ty) => {
      if (!isWall(tx, ty)) return
      const X0 = tx * TS, Y0 = ty * TS
      if (isFloor(tx, ty + 1) && at(tx, ty + 1) !== "E" || isWater(tx, ty + 1)) {
        for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
          const X = X0 + x, Y = Y0 + y, course = Math.floor(Y / 4), bx = (X + (course % 2) * 4) % 8
          let k = hash(Math.floor((X + (course % 2) * 4) / 8), course, 5) < 0.25 ? "h" : "f"
          if (Y % 4 === 0) k = k === "h" ? "H" : "h"
          if (Y % 4 === 3 || bx === 7) k = "F"
          c.px(X, Y, k)
        }
        if (!isFloor(tx, ty - 1)) { c.hline(X0, Y0, TS, "H"); c.hline(X0, Y0 + 1, TS, "T") }
        c.hline(X0, Y0 + TS - 1, TS, "k")
        if (isFloor(tx - 1, ty)) c.vline(X0, Y0, TS, "H")
        if (isFloor(tx + 1, ty)) c.vline(X0 + TS - 1, Y0, TS, "F")
      } else {
        for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
          const X = X0 + x, Y = Y0 + y, row = Math.floor(Y / 16), sx = (X + (row % 2) * 8) % 16
          c.px(X, Y, sx === 15 || Y % 16 === 15 ? "x" : (hash(Math.floor((X + (row % 2) * 8) / 16), row, 9) < 0.3 ? "t" : "w"))
        }
        if (!isWall(tx, ty - 1)) { c.hline(X0, Y0, TS, "H"); c.hline(X0, Y0 + 1, TS, "T"); c.hline(X0, Y0 + 2, TS, "t") }
        if (!isWall(tx + 1, ty)) { c.vline(X0 + TS - 1, Y0, TS, "H"); c.vline(X0 + TS - 2, Y0, TS, "T") }
        if (!isWall(tx - 1, ty)) { c.vline(X0, Y0, TS, "T"); c.vline(X0 + 1, Y0, TS, "t") }
      }
    })),
    layer("ombre_murs", { shade: true }, (c) => each((tx, ty) => {
      if (isWall(tx, ty)) return
      if (isWall(tx, ty - 1)) c.rect(tx * TS, ty * TS, TS, 4, "k")
      if (isWall(tx - 1, ty)) c.rect(tx * TS, ty * TS, 3, TS, "k")
      if (isWall(tx + 1, ty)) c.rect(tx * TS + TS - 2, ty * TS, 2, TS, "k")
    })),
    layer("ombre_douce", { shade: true, density: 0.5 }, (c) => each((tx, ty) => {
      if (isWall(tx, ty)) return
      if (isWall(tx, ty - 1)) c.rect(tx * TS, ty * TS + 4, TS, 4, "k")
      if (isWall(tx - 1, ty)) c.rect(tx * TS + 3, ty * TS, 3, TS, "k")
    })),
    // passages vers les salles voisines : ils s'enfoncent dans le noir
    layer("passages", { shade: true, density: 0.5 }, (c) => each((tx, ty) => {
      if (isWall(tx, ty) || at(tx, ty) === "E") return
      if (ty <= 1 || ty >= 15 || tx <= 1 || tx >= 28) c.rect(tx * TS, ty * TS, TS, TS, "k")
    })),
    layer("passages2", { shade: true }, (c) => each((tx, ty) => {
      if (isWall(tx, ty) || at(tx, ty) === "E") return
      if (ty === 0 || ty === 16 || tx === 0 || tx === 29) c.rect(tx * TS, ty * TS, TS, TS, "k")
    })),
    layer("escalier", (c) => {
      if (at(14, 15) !== "E") return
      const x0 = 224, y0 = 240
      c.rect(x0, y0, 32, 32, "k")
      ;[["d", "c"], ["c", "b"], ["b", "a"], ["a", "x"], ["x", "k"]].forEach(([top, body], i) => { const y = y0 + i * 6; c.rect(x0 + 1, y, 30, 6, body); c.hline(x0 + 1, y, 30, top) })
      c.vline(x0, y0, 32, "H"); c.vline(x0 + 31, y0, 32, "F")
    }),
    layer("piliers", (c) => each((tx, ty) => {
      if (at(tx, ty) !== "k") return
      ;(opts.pillar || pillarBroken)(c, tx * TS, ty * TS)
    })),
    layer("decor_haut", (c) => decorTop && decorTop(c, S)),
    glow("g", { r: 3, strength: 0.3, bands: 2 }),
    glow("z", { r: 10, strength: 0.4, bands: 3 }),
  )
}

// ---------- éléments partagés ----------
function pillarBroken(c, X, Y) {
  c.ellipse(X + 8, Y + 14, 8, 3, "k")
  c.rect(X + 1, Y + 9, 14, 5, "f"); c.hline(X + 1, Y + 9, 14, "H"); c.hline(X + 1, Y + 13, 14, "F")
  c.rect(X + 3, Y - 6, 10, 15, "f")
  c.vline(X + 4, Y - 6, 15, "H"); c.vline(X + 5, Y - 6, 15, "h"); c.vline(X + 11, Y - 6, 15, "F"); c.vline(X + 12, Y - 6, 15, "F"); c.vline(X + 8, Y - 6, 15, "h")
  c.poly([X + 3, Y - 6, X + 13, Y - 9, X + 13, Y - 6], "f"); c.line(X + 3, Y - 6, X + 13, Y - 9, "H")
  c.px(X + 2, Y + 8, "h"); c.px(X + 14, Y + 12, "h")
}
function pillarCrystal(c, X, Y) {     // socle portant un cristal de luciole
  c.ellipse(X + 8, Y + 14, 8, 3, "k")
  c.rect(X + 2, Y + 6, 12, 8, "f"); c.hline(X + 2, Y + 6, 12, "H"); c.vline(X + 2, Y + 6, 8, "h"); c.hline(X + 2, Y + 13, 12, "F")
  c.poly([X + 5, Y + 6, X + 8, Y - 8, X + 11, Y + 6], "Z"); c.line(X + 8, Y - 7, X + 6, Y + 5, "z"); c.px(X + 8, Y - 6, "z")
}
function pillarGilded(c, X, Y) {
  pillarBroken(c, X, Y); c.hline(X + 3, Y + 1, 10, "Y"); c.hline(X + 3, Y + 2, 10, "o"); c.hline(X + 1, Y + 9, 14, "o")
}
function banner(c, bx, by, emblem = "luciole", torn = false) {
  c.hline(bx - 1, by, 18, "i"); c.px(bx - 2, by, "I"); c.px(bx + 17, by, "I")
  c.rect(bx, by + 1, 16, 24, "r"); c.vline(bx, by + 1, 24, "R"); c.vline(bx + 15, by + 1, 24, "R")
  c.vline(bx + 1, by + 1, 24, "Y"); c.vline(bx + 14, by + 1, 24, "Y")
  c.poly([bx, by + 25, bx + 8, by + 31, bx + 16, by + 25], "r"); c.line(bx, by + 25, bx + 8, by + 31, "R"); c.line(bx + 8, by + 31, bx + 15, by + 25, "R")
  if (emblem === "luciole") { c.ellipse(bx + 5, by + 9, 3, 2, "e"); c.ellipse(bx + 10, by + 9, 3, 2, "e"); c.rect(bx + 7, by + 6, 2, 8, "Y"); c.px(bx + 7, by + 5, "y"); c.px(bx + 8, by + 5, "y"); c.rect(bx + 6, by + 13, 4, 4, "y"); c.px(bx + 5, by + 18, "y"); c.px(bx + 10, by + 18, "y"); c.px(bx + 7, by + 19, "y") }
  if (emblem === "oeil") { c.ellipse(bx + 8, by + 12, 5, 3, "y"); c.circ(bx + 8, by + 12, 2, "R"); c.px(bx + 8, by + 12, "y") }
  if (emblem === "cle") { c.ring(bx + 8, by + 8, 2, "y"); c.vline(bx + 8, by + 11, 9, "y"); c.hline(bx + 8, by + 17, 3, "y"); c.hline(bx + 8, by + 19, 2, "y") }
  if (emblem === "couronne") { c.rect(bx + 4, by + 12, 8, 3, "y"); c.px(bx + 4, by + 10, "y"); c.px(bx + 8, by + 9, "y"); c.px(bx + 11, by + 10, "y"); c.vline(bx + 4, by + 11, 1, "y"); c.vline(bx + 11, by + 11, 1, "y") }
  if (torn) { c.poly([bx + 9, by + 18, bx + 16, by + 14, bx + 16, by + 32, bx + 6, by + 32], "_"); c.line(bx + 9, by + 18, bx + 15, by + 15, "R") }
  c.hline(bx + 2, by + 21, 12, "R")
}
function ringIron(c, x, y) { c.ring(x, y + 3, 2, "i"); c.px(x, y, "I"); c.vline(x, y + 6, 3, "R") }
function streaks(c, list) { for (const [x, y, len] of list) c.vline(x, y, len, "F") }
function cracks(c, list) { for (const pts of list) for (let i = 1; i < pts.length; i++) c.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], "a") }
function inlayRing(c, cx, cy, r, k1, k2) { c.ring(cx, cy, r, k1); c.ring(cx, cy, r - 1, k2); c.ring(cx, cy, r - 3, k1) }

// ---------- outils de placement ----------
const faceY = (S, tx) => { for (let ty = 0; ty < 6; ty++) if (S.isWall(tx, ty) && S.isFloor(tx, ty + 1)) return ty * 16; return null }
const bannerOn = (c, S, tx, emblem, torn) => { const y = Math.max(faceY(S, tx) ?? 0, faceY(S, tx + 1) ?? 0); if (y !== null) banner(c, tx * 16, y + 2, emblem, torn) }
const coin = (c, x, y) => { c.hline(x, y, 3, "y"); c.hline(x, y + 1, 3, "Y") }
const bone = (c, x, y, flip) => { if (flip) { c.vline(x, y, 6, "v"); c.px(x - 1, y, "v"); c.px(x + 1, y, "v"); c.px(x - 1, y + 5, "v"); c.px(x + 1, y + 5, "v"); c.vline(x + 1, y + 1, 4, "V") } else { c.hline(x, y, 6, "v"); c.px(x, y - 1, "v"); c.px(x, y + 1, "v"); c.px(x + 5, y - 1, "v"); c.px(x + 5, y + 1, "v"); c.hline(x + 1, y + 1, 4, "V") } }
const star = (c, cx, cy, r1, r2, n, k) => { const p = []; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? r2 : r1; p.push(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r)) } c.poly(p, k) }
const chevron = (c, x, y, dir, k) => { for (let i = 0; i < 4; i++) { if (dir === "N") { c.px(x - i, y + i, k); c.px(x + i, y + i, k) } if (dir === "S") { c.px(x - i, y - i, k); c.px(x + i, y - i, k) } if (dir === "W") { c.px(x + i, y - i, k); c.px(x + i, y + i, k) } if (dir === "E") { c.px(x - i, y - i, k); c.px(x - i, y + i, k) } } }

const DECOR = {
  // Entrée : bannières de l'ordre des lucioles, anneaux de l'ancienne geôle
  entry: [(c) => cracks(c, [[[104, 196], [108, 200], [107, 205], [112, 209]], [[370, 70], [374, 74], [373, 79]], [[300, 172], [305, 176], [304, 181], [309, 186]], [[60, 120], [64, 125], [63, 130]]]),
    (c, S) => { bannerOn(c, S, 6, "luciole"); bannerOn(c, S, 21, "luciole"); for (const [x, y] of [[40, 40], [424, 40]]) ringIron(c, x, y); streaks(c, [[73, 18, 9], [262, 18, 11], [392, 18, 7]]) }],

  // Arène : piste de sable cerclée de pierre, griffures, bannières déchirées
  arena: [(c) => {
      for (let y = 78; y <= 222; y++) for (let x = 168; x <= 312; x++) { const d = Math.hypot(x - 240, (y - 150) * 1.0); if (d <= 66) c.px(x, y, hash(x >> 1, y >> 1, 2) < 0.08 ? "P" : (hash(x, y, 3) < 0.05 ? "j" : "p")) }
      inlayRing(c, 240, 150, 70, "a", "d")
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.line(Math.round(240 + Math.cos(a) * 70), Math.round(150 + Math.sin(a) * 70), Math.round(240 + Math.cos(a) * 82), Math.round(150 + Math.sin(a) * 82), "a") }
      for (const [x, y] of [[200, 120], [266, 176], [214, 182], [280, 118]]) for (let j = 0; j < 3; j++) c.line(x + j * 3, y, x + j * 3 + 6, y + 8, "j")
    },
    (c, S) => { bannerOn(c, S, 9, null, true); bannerOn(c, S, 17, null, true); streaks(c, [[120, 18, 10], [360, 18, 8]]) }],

  // Carrefour : rosace de luciole au centre, chevrons vers les quatre sorties
  hub: [(c) => {
      c.circ(240, 136, 44, "a"); c.circ(240, 136, 42, "c"); inlayRing(c, 240, 136, 42, "a", "d")
      star(c, 240, 136, 38, 14, 8, "Y"); star(c, 240, 136, 34, 12, 8, "o"); star(c, 240, 136, 18, 8, 4, "M"); c.circ(240, 136, 5, "Y"); c.circ(240, 136, 3, "y")
      chevron(c, 240, 64, "N", "Y"); chevron(c, 240, 222, "S", "Y"); chevron(c, 52, 128, "W", "Y"); chevron(c, 428, 128, "E", "Y")
    },
    (c, S) => { bannerOn(c, S, 12, "luciole"); bannerOn(c, S, 16, "luciole"); ringIron(c, 56, 24); ringIron(c, 424, 24) }],

  // Salle du bloc : sillons creusés par le bloc qu'on pousse, runes gravées
  block: [(c) => {
      for (const y of [146, 158]) { c.hline(130, y, 184, "a"); c.hline(130, y + 1, 184, "F") }
      for (const x of [306, 318]) { c.vline(x, 98, 61, "a"); c.vline(x + 1, 98, 61, "F") }
      cracks(c, [[[90, 200], [96, 204], [95, 210]], [[380, 180], [386, 186]]])
    },
    (c, S) => {
      const glyph = (x, y) => { c.vline(x, y, 7, "M"); c.line(x, y, x + 3, y + 3, "M"); c.line(x + 3, y + 3, x, y + 6, "m"); c.px(x + 4, y + 1, "g") }
      for (let tx = 3; tx < 27; tx += 3) { const fy = faceY(S, tx); if (fy !== null) glyph(tx * 16 + 6, fy + 5) }
    }],

  // Salle du lance-pierre : estrade circulaire et tapis royal jusqu'au grand coffre
  sling: [(c) => {
      c.rect(222, 150, 36, 90, "r"); c.vline(222, 150, 90, "R"); c.vline(257, 150, 90, "R"); c.vline(224, 150, 90, "Y"); c.vline(255, 150, 90, "Y")
      c.ellipse(240, 144, 40, 22, "a"); c.ellipse(240, 142, 38, 20, "c"); c.ellipse(240, 140, 32, 16, "d"); c.ellipse(240, 140, 32, 16, "a", true)
      c.ellipse(240, 140, 26, 12, "c"); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.px(Math.round(240 + Math.cos(a) * 29), Math.round(140 + Math.sin(a) * 14), "Y") }
    },
    (c, S) => { bannerOn(c, S, 10, "couronne"); bannerOn(c, S, 18, "couronne"); streaks(c, [[150, 18, 9], [330, 18, 12]]) }],

  // Gouffre : canal noir, berges couvertes de mousse, chaînes rouillées au-dessus de l'eau
  chasm: [(c, S) => {
      for (let tx = 3; tx < 27; tx++) for (const ty of [3, 6]) if (S.isFloor(tx, ty) && hash(tx, ty, 11) < 0.45) { const y = ty === 3 ? 60 : 96; for (let i = 0; i < 6; i++) c.px(tx * 16 + Math.floor(hash(tx, i, 12) * 16), y + Math.floor(hash(i, tx, 13) * 3), i % 3 ? "m" : "M") }
      for (const x of [76, 140, 380]) c.px(x, 62, "g")
    },
    (c, S) => { for (const x of [64, 168, 312, 410]) { for (let y = 34; y < 70; y += 3) { c.px(x, y, "i"); c.px(x, y + 1, "I") } c.ring(x, 72, 2, "I") } bannerOn(c, S, 12, "oeil") }],

  // Deux yeux : bassins à margelle sculptée, yeux peints au-dessus
  twin: [(c) => {
      for (const x0 of [96, 320]) { c.box(x0 - 2, 62, 68, 52, "d"); c.box(x0 - 1, 63, 66, 50, "a"); c.px(x0 - 2, 62, "Y"); c.px(x0 + 65, 62, "Y"); c.px(x0 - 2, 113, "Y"); c.px(x0 + 65, 113, "Y") }
      c.line(162, 88, 318, 88, "a"); for (let x = 166; x < 316; x += 10) c.px(x, 87, "M")
    },
    (c, S) => { bannerOn(c, S, 6, "oeil"); bannerOn(c, S, 22, "oeil") }],

  // Grande clé : cercle runique luisant, socles de cristal
  bigkey: [(c) => {
      inlayRing(c, 240, 150, 64, "m", "M"); c.ring(240, 150, 46, "m")
      const pts = []; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * Math.PI / 3; pts.push([Math.round(240 + Math.cos(a) * 60), Math.round(150 + Math.sin(a) * 60)]) }
      for (let i = 0; i < 6; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 2) % 6]; c.line(x0, y0, x1, y1, "m") }
      for (const [x, y] of pts) { c.circ(x, y, 3, "M"); c.px(x, y, "g") }
      for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; c.px(Math.round(240 + Math.cos(a) * 55), Math.round(150 + Math.sin(a) * 55), "g") }
    },
    (c, S) => { bannerOn(c, S, 9, "cle"); bannerOn(c, S, 14, "cle") }],

  // Trésor oublié : liseré doré, pièces renversées, caisses éventrées
  treasure: [(c) => {
      c.box(40, 56, 400, 178, "Y"); c.box(41, 57, 398, 176, "s")
      for (const [cx, cy, n] of [[64, 70, 9], [412, 70, 7], [70, 214, 10], [404, 216, 6], [240, 112, 4]]) for (let i = 0; i < n; i++) coin(c, cx + Math.floor((hash(cx, i, 1) - 0.5) * 28), cy + Math.floor((hash(i, cy, 2) - 0.5) * 14))
      for (const [x, y, w] of [[54, 196, 14], [58, 202, 10], [418, 192, 12]]) { c.rect(x, y, w, 3, "n"); c.hline(x, y, w, "N"); c.px(x + 2, y + 1, "B") }
    },
    (c, S) => { bannerOn(c, S, 11, "couronne"); bannerOn(c, S, 15, "couronne") }],

  // Salle du gardien : dalles fendues par les coups de la Grande Ombre, traînées sombres, ossements
  boss: [(c) => {
      c.ellipse(240, 142, 46, 30, "a"); c.ellipse(240, 140, 44, 28, "x"); c.ellipse(240, 144, 40, 24, "a"); c.ellipse(240, 146, 34, 18, "b")
      c.ellipse(240, 140, 44, 28, "d", true); for (let i = 0; i < 14; i++) { const a = hash(i, 0, 31) * 6.28, r = 46 + hash(i, 1, 32) * 10; c.rect(Math.round(240 + Math.cos(a) * r), Math.round(142 + Math.sin(a) * r * 0.66), 3, 2, i % 2 ? "c" : "d") }
      for (let i = 0; i < 9; i++) { let x = 240, y = 140, a = i * 0.7 + 0.3; const pts = [[x, y]]; for (let s = 0; s < 6; s++) { a += (hash(i, s, 4) - 0.5) * 0.8; x += Math.cos(a) * 14; y += Math.sin(a) * 10; pts.push([Math.round(x), Math.round(y)]) } cracks(c, [pts]) }
      for (const [x, y, f] of [[60, 70, 0], [70, 74, 1], [400, 210, 0], [56, 214, 1], [410, 66, 0]]) bone(c, x, y, f)
    },
    (c, S) => { bannerOn(c, S, 5, null, true); bannerOn(c, S, 23, null, true); for (const [x, y] of [[40, 40], [424, 40]]) ringIron(c, x, y) }],

  // Cellule du captif : paille, chaînes et marques des jours comptés
  prison: [(c) => {
      for (let i = 0; i < 160; i++) { const a = hash(i, 0, 20) * 6.28, r = Math.sqrt(hash(i, 1, 21)), x = Math.round(80 + Math.cos(a) * r * 34), y = Math.round(200 + Math.sin(a) * r * 18), dx = hash(i, 3, 23) < 0.5 ? 1 : -1; c.line(x, y, x + 3 * dx, y + 1, r > 0.8 ? "s" : (i % 3 ? "S" : "s")) }
    },
    (c, S) => {
      for (const x of [72, 120, 360, 408]) { const fy = faceY(S, Math.floor(x / 16)); if (fy === null) continue; for (let y = fy + 3; y < fy + 22; y += 3) { c.px(x, y, "i"); c.px(x, y + 1, "I") } c.ring(x, fy + 24, 2, "I") }
      const fy = faceY(S, 20); if (fy !== null) for (let g = 0; g < 3; g++) { for (let j = 0; j < 4; j++) c.vline(322 + g * 9 + j * 2, fy + 5, 6, "H"); c.line(321 + g * 9, fy + 10, 329 + g * 9, fy + 5, "H") }
    }],
}

const ROOMS = {"entry": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWW_W__W_WW______W_____W__WWW", "WW__________________________WW", "WW__m______m________________WW", "WWW__mk________________k____WW", "WW_______________________m__WW", "WW___________________m________", "WW___m________________________", "WW__________________________WW", "WWWm___m______m_____________WW", "WW____k________________k____WW", "WW__________________________WW", "WW_____________m_m_________WWW", "WWW_______WW________mW__W__WWW", "WWWWWWWWWWWWWWEEWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWEEWWWWWWWWWWWWWW"], "arena": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWm__W_____________W_____WWW", "WW_____________________m____WW", "WW_m________________________WW", "WW______________m__m_m___m__WW", "WW_______________________m__WW", "_____m______________________WW", "_________k__________k____m__WW", "WW____m_____________________WW", "WW__________________________WW", "WW______________________m___WW", "WW______________________m___WW", "WW________m_________________WW", "WWWW_______________WW_WW___WWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "hub": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWW_W_m_W_W_______W_W____WWWWW", "WW_________________________WWW", "WW_________m________________WW", "WW___________m_____________WWW", "WW_m________________________WW", "_______m______________________", "_____m________________________", "WW__________________________WW", "WW____m___m___________m____WWW", "WW______k____________k______WW", "WW_____________m____________WW", "WW__________________________WW", "WWW__W________________W___WWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "block": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWW____W_W_________________WWW", "WW_______________m__m______WWW", "WW_m________m_m____________WWW", "WWm_________________________WW", "WW___m_m____________________WW", "WW___________________m_______m", "WW_______________m____________", "WW__________________________WW", "WW___________m_____________WWW", "WW__m_____m_________________WW", "WW__________________________WW", "WW_______m__________________WW", "WWWWW___W__________________WWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "sling": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWW____WW________m____WWW__WWW", "WW__m_______________________WW", "WW________________________m_WW", "WW__________________________WW", "WW___m______________________WW", "WW____m____m_____________m____", "WW____________________________", "WW___________m______________WW", "WW___m____m__________m__m___WW", "WW______________________m___WW", "WW____m_________m____m__m___WW", "WW__________________________WW", "WWW_WW____W________W_______WWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "chasm": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWW______W_________W___WWWWWW", "WWW_____________m__________WWW", "WWW~~~~~~~~~~~~~~~~~~~~~~~~WWW", "WWW~~~~~~~~~~~~~~~~~~~~~~~~WWW", "WW__________________________WW", "__________________m______m__WW", "__________m___m_m___________WW", "WW_________m________________WW", "WW_________m________________WW", "WW______m________________m_WWW", "WW____________________m_____WW", "WW_______m__________m_______WW", "WWWW______________W_m______WWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "twin": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWW_WW__W__W______WW_______WWW", "WW________________m_________WW", "WW____~~~~__________~~~~m___WW", "WWW___~~~~__________~~~~____WW", "WW____~~~~________m_~~~~____WW", "______________________________", "________m_____________________", "WW__________________________WW", "WW_________m________________WW", "WWW________________________mWW", "WW__________________________WW", "WW__________________________WW", "WWW_____W_________W__W_W__WWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "bigkey": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWW___W___________W_W______WWW", "WW__________________________WW", "WW___k_m_______m___m____k___WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW_________________________mWW", "WW_____________________m____WW", "WWW________________________WWW", "WW_________________________mWW", "WW___k________________m_k___WW", "WWW_________________________WW", "WWW__Wm_______________W___WWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "treasure": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWW__W_W_________WW__W____WWW", "WW_m________________________WW", "WW___k__________________k___WW", "WWW_________________________WW", "WW__________________________WW", "____________________________WW", "________________m___________WW", "WW_____________m____________WW", "WW__________________________WW", "WW__________________________WW", "WW___k__________________k___WW", "WW________________________m_WW", "WWWW____W_W________W_W_W__WWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "boss": ["WWWWWWWWWWWWWWm_WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWW_____WWm_________W______WWW", "WW_____m____________________WW", "WW_________________________WWW", "WW___________m___________mm_WW", "WW__________________________WW", "WW__________________________WW", "WW_____m__m___m_____________WW", "WW__________________________WW", "WWW____________________m____WW", "WW_______________m__________WW", "WW________________m_________WW", "WW__________________________WW", "WWW_W___________m____W____WWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "prison": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWW____W_WW___m____________WWW", "WW________________________m_WW", "WWW___________________m_____WW", "WW____m_m___________________WW", "WW__________________________WW", "WW__________m_______________WW", "WW____________m_____________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW_________________________WWW", "WW___________m_________m__m_WW", "WWW______W_W______W________WWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"]};
const PILLARS = { bigkey: pillarCrystal, treasure: pillarGilded }
for (const [n, grid] of Object.entries(ROOMS)) room('grotte_' + n, grid, DECOR[n][0], DECOR[n][1], { pillar: PILLARS[n] })
// gouffre avec le pont abaissé (le jeu change les cases 14-15 × 4-5 en 'b' quand la cible est touchée)
const pont = ROOMS.chasm.map((r, y) => (y === 4 || y === 5) ? r.slice(0, 14) + 'bb' + r.slice(16) : r)
room('grotte_chasm_pont', pont, DECOR.chasm[0], (c, S) => { DECOR.chasm[1](c, S)
  c.rect(222, 58, 36, 40, 'n'); for (let y = 58; y < 98; y += 5) { c.hline(222, y, 36, 'N'); c.hline(222, y + 4, 36, 'B') }
  c.vline(222, 54, 46, 'B'); c.vline(257, 54, 46, 'B'); for (const x of [222, 257]) for (const y of [54, 98]) c.rect(x - 1, y - 2, 3, 4, 'i')
  c.hline(223, 98, 34, 'k') })
