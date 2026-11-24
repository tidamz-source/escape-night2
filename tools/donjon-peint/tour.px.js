// Escape Night 2 — Donjon 5 « La Tour des artificiers » : joyeuse mais intrigante — briques de nuit, fanions, lanternes, traces de feux d'artifice.
// Grilles = collisions du jeu (tower.js, seed 83). Les murs fissurés cassables, mèches, barils, torches… sont dessinés par le jeu par-dessus.
pal({
  k: "#0a0714", x: "#160f26", w: "#201636", t: "#2c2046",                                        // dessus des murs
  F: "#2a1f40", f: "#3e2e5a", h: "#524078", H: "#6c5896", l: "#9a88c4",                           // briques violet nuit
  a: "#6a3a2e", b: "#86503c", c: "#9a6248", d: "#b07a58",                                         // carreaux de terre cuite
  r: "#e04848", R: "#962838", y: "#ffd24a", Y: "#c09030", s: "#4aa8ff", S: "#2a62b0", g: "#5ad06a", G: "#2e8a40", p: "#e872d8", // fête
  o: "#ffc864", O: "#e0703a",                                                                     // lanternes
  e: "#2a1c1a", E: "#4a3028",                                                                     // suie
  n: "#e8e0d0", N: "#a8a090",                                                                     // os, papier
  z: "#fff0b0",                                                                                   // étincelles
})
ramps("kxwt", "kFfhHl", "kabcd", "kRr", "kYy", "kSs", "kGg", "kOo", "keE", "kNn")
const TS = 16, CW = 30, CH = 17
const hash = (x, y, s = 0) => { let n = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967296 }
const FEST = ["r", "y", "s", "g", "p"]
function room(name, MAP, decorFloor, decorTop) {
  const at = (x, y) => (y < 0 || y >= CH || x < 0 || x >= CW) ? "W" : MAP[y][x]
  const isWall = (x, y) => at(x, y) === "W", isFloor = (x, y) => !isWall(x, y)
  const S = { at, isWall, isFloor }
  const each = fn => { for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CW; tx++) fn(tx, ty) }
  scene(name, { w: CW * TS, h: CH * TS, bg: "k" },
    // carreaux en losanges
    layer("sol", c => each((tx, ty) => {
      if (!isFloor(tx, ty)) return
      for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
        const X = tx * TS + x, Y = ty * TS + y, u = (X + Y) & 15, v = (X - Y + 1024) & 15
        let k = (((X + Y) >> 4) + ((X - Y + 1024) >> 4)) % 2 ? "b" : "c"
        if (u === 0 || v === 0) k = "a"; else if (u === 1 || v === 1) k = k === "c" ? "d" : "c"
        c.px(X, Y, k)
      }
    })),
    layer("decor_sol", c => decorFloor && decorFloor(c, S)),
    // cases 'm' du jeu : douilles de pétards éclatés et confettis
    layer("douilles", c => each((tx, ty) => {
      if (at(tx, ty) !== "m") return
      const X0 = tx * TS, Y0 = ty * TS
      for (let i = 0; i < 2; i++) { const x = X0 + 3 + Math.floor(hash(tx, ty, i) * 9), y = Y0 + 5 + i * 5; c.rect(x, y, 5, 2, "r"); c.px(x, y, "R"); c.px(x + 4, y, "e"); c.px(x + 5, y, "E") }
      for (let i = 0; i < 6; i++) c.px(X0 + Math.floor(hash(tx, i, 3) * 16), Y0 + Math.floor(hash(i, ty, 4) * 16), FEST[i % 5])
    })),
    // murs de briques ; le grand mur nord sur deux rangées
    layer("murs", c => each((tx, ty) => {
      if (!isWall(tx, ty)) return
      const X0 = tx * TS, Y0 = ty * TS
      const tallTop = ty === 0 && isWall(tx, 1) && isFloor(tx, 2)
      const face = isFloor(tx, ty + 1) && at(tx, ty + 1) !== "E" || tallTop
      if (face) {
        for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
          const X = X0 + x, Y = Y0 + y, course = Y >> 2, bx = (X + (course % 2) * 5) % 10
          let k = hash((X + (course % 2) * 5) / 10 | 0, course, 5) < 0.28 ? "h" : "f"
          if (Y % 4 === 0) k = k === "h" ? "H" : "h"; if (Y % 4 === 3 || bx === 9) k = "F"
          c.px(X, Y, k)
        }
        const upper = ty === 1 && isWall(tx, 0) && isFloor(tx, 2)
        if (!upper) { c.hline(X0, Y0, TS, "l"); c.hline(X0, Y0 + 1, TS, "H") }
        if (!tallTop) c.hline(X0, Y0 + TS - 1, TS, "k")
        if (isFloor(tx - 1, ty)) c.vline(X0, Y0, TS, "H")
        if (isFloor(tx + 1, ty)) c.vline(X0 + 15, Y0, TS, "F")
      } else {
        for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) { const X = X0 + x, Y = Y0 + y, r = Y >> 3, sx = (X + (r % 2) * 8) % 16; c.px(X, Y, sx === 15 || Y % 8 === 7 ? "x" : hash((X + (r % 2) * 8) >> 4, r, 9) < 0.3 ? "t" : "w") }
        if (isFloor(tx, ty - 1)) { c.hline(X0, Y0, TS, "l"); c.hline(X0, Y0 + 1, TS, "H"); c.hline(X0, Y0 + 2, TS, "f") }
        if (isFloor(tx + 1, ty)) { c.vline(X0 + 15, Y0, TS, "H"); c.vline(X0 + 14, Y0, TS, "f") }
        if (isFloor(tx - 1, ty)) { c.vline(X0, Y0, TS, "f"); c.vline(X0 + 1, Y0, TS, "t") }
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
    layer("passages", { shade: true, density: 0.5 }, c => each((tx, ty) => { if (isFloor(tx, ty) && at(tx, ty) !== "E" && (ty <= 1 || ty >= 15 || tx <= 1 || tx >= 28)) c.rect(tx * TS, ty * TS, TS, TS, "k") })),
    layer("passages2", { shade: true }, c => each((tx, ty) => { if (isFloor(tx, ty) && at(tx, ty) !== "E" && (ty === 0 || ty === 16 || tx === 0 || tx === 29)) c.rect(tx * TS, ty * TS, TS, TS, "k") })),
    // sortie vers la côte : escalier de briques
    layer("escalier", c => { if (at(14, 15) !== "E") return; c.rect(224, 240, 32, 32, "k"); ["d", "c", "b", "a", "e"].forEach((k, i) => { c.rect(225, 240 + i * 6, 30, 6, k); c.hline(225, 240 + i * 6, 30, i < 2 ? "d" : "c") }); c.vline(224, 240, 32, "H"); c.vline(255, 240, 32, "F") }),
    // arches des passages : claveaux rouge et or, étoile à la clé
    layer("arches", c => {
      const starK = (cx, cy) => { c.px(cx, cy - 2, "y"); c.hline(cx - 2, cy, 5, "y"); c.px(cx, cy - 1, "y"); c.px(cx, cy + 1, "y"); c.px(cx - 1, cy + 2, "Y"); c.px(cx + 1, cy + 2, "Y") }
      const jamb = (x, y, h) => { c.rect(x, y, 6, h, "h"); c.vline(x, y, h, "l"); c.vline(x + 5, y, h, "F"); for (let yy = y + 4; yy < y + h; yy += 8) c.hline(x, yy, 6, "F") }
      if (!isWall(14, 0)) { jamb(218, 0, 34); jamb(256, 0, 34); for (let i = 0; i < 8; i++) c.rect(218 + i * 6, 0, 6, 5, i % 2 ? "r" : "Y"); c.hline(218, 5, 44, "R"); starK(240, 2) }
      if (!isWall(14, 16) || at(14, 16) === "E") { jamb(218, 238, 34); jamb(256, 238, 34); for (let i = 0; i < 8; i++) c.rect(218 + i * 6, 238, 6, 4, i % 2 ? "r" : "Y") }
      if (!isWall(29, 7)) { jamb(452, 104, 8); jamb(452, 144, 8); c.rect(458, 104, 4, 48, "R"); c.vline(458, 104, 48, "r") }
      if (!isWall(0, 7)) { jamb(22, 104, 8); jamb(22, 144, 8); c.rect(18, 104, 4, 48, "R"); c.vline(21, 104, 48, "r") }
    }),
    // colonnes rayées rouge et or, coiffées d'une coupelle à étincelles (cases 'k' du jeu)
    layer("colonnes", c => each((tx, ty) => {
      if (at(tx, ty) !== "k") return
      const X = tx * TS, Y = ty * TS
      c.ellipse(X + 8, Y + 14, 9, 3, "k"); c.rect(X + 1, Y + 9, 14, 5, "f"); c.hline(X + 1, Y + 9, 14, "H"); c.hline(X + 1, Y + 13, 14, "F")
      for (let y = -14; y < 9; y++) for (let x = 3; x < 13; x++) c.px(X + x, Y + y, ((x + y + 40) >> 2) % 2 ? "r" : "y")
      c.vline(X + 3, Y - 14, 23, "R"); c.vline(X + 12, Y - 14, 23, "R")
      c.rect(X + 1, Y - 18, 14, 4, "Y"); c.hline(X + 1, Y - 18, 14, "y"); c.px(X + 6, Y - 20, "z"); c.px(X + 9, Y - 21, "z"); c.px(X + 8, Y - 19, "o")
    })),
    layer("decor_haut", c => decorTop && decorTop(c, S)),
    glow("o", { r: 12, strength: 0.4, bands: 3 }),
    glow("z", { r: 5, strength: 0.4, bands: 2 }),
  )
}
// fanions tendus sur le grand mur nord (symétriques), lanternes de papier, suie au-dessus
function bunting(c, S) {
  const flagRow = (x0, x1, y) => { for (let x = x0; x < x1; x += 8) { const k = FEST[((x - x0) / 8 | 0) % 5]; c.poly([x, y, x + 6, y, x + 3, y + 6], k) } c.line(x0, y, x1, y, "N") }
  const sag = (x0, x1) => { for (let x = x0; x < x1; x += 8) { const t = (x - x0) / (x1 - x0), y = 6 + Math.round(Math.sin(t * Math.PI) * 6); const k = FEST[((x - x0) / 8 | 0) % 5]; c.poly([x, y, x + 6, y, x + 3, y + 6], k); c.line(x, y, x + 8, 6 + Math.round(Math.sin(((x + 8 - x0) / (x1 - x0)) * Math.PI) * 6), "N") } }
  sag(40, 200); sag(280, 440)
}
function lanterns(c, x) { for (const X of [x, 480 - x]) { c.vline(X, 14, 4, "N"); c.ellipse(X, 22, 4, 5, "O"); c.ellipse(X, 22, 3, 4, "o"); c.hline(X - 2, 17, 5, "R"); c.hline(X - 2, 27, 5, "R"); c.vline(X, 2, 10, "e"); c.vline(X + 1, 4, 7, "e") } }
// brûlure en étoile d'une fusée éclatée, entourée de confettis
function scorch(c, cx, cy, r, s) {
  r = r * 1.8
  for (let y = -r; y <= r; y++) for (let x = -r * 1.4; x <= r * 1.4; x++) { const d = Math.hypot(x / 1.4, y) / r + (hash(cx + x | 0, cy + y | 0, s) - 0.5) * 0.25; if (d < 0.55) c.px(Math.round(cx + x), Math.round(cy + y * 0.6), d < 0.3 ? "e" : "E") }
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283 + hash(i, s, 1) * 0.25, L = r * (0.8 + hash(s, i, 2) * 0.6); c.line(cx, cy, Math.round(cx + Math.cos(a) * L * 1.3), Math.round(cy + Math.sin(a) * L * 0.6), "E") }
  for (let i = 0; i < 30; i++) { const a = hash(i, s, 3) * 6.283, L = r * (1.1 + hash(s, i, 4) * 0.9); const x = Math.round(cx + Math.cos(a) * L * 1.3), y = Math.round(cy + Math.sin(a) * L * 0.6); c.px(x, y, FEST[i % 5]); if (i % 3 === 0) c.px(x + 1, y, FEST[(i + 2) % 5]) }
}

const starInlay = (c, cx, cy, r) => { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; p.push(Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr * 0.7)) } c.poly(p, "Y"); const q = p.map((v, i) => i % 2 ? Math.round(cy + (v - cy) * 0.7) : Math.round(cx + (v - cx) * 0.7)); c.poly(q, "y") }
const target = (c, cx, cy) => { for (const [r, k] of [[40, "R"], [32, "N"], [24, "R"], [16, "N"], [8, "r"]]) c.ellipse(cx, cy, r, Math.round(r * 0.6), k) }
const fuseTrail = (c, pts) => { for (let i = 1; i < pts.length; i++) { c.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], "e"); c.line(pts[i - 1][0], pts[i - 1][1] + 1, pts[i][0], pts[i][1] + 1, "E") } }
const DECOR = {
  entry: [c => { starInlay(c, 240, 136, 30); scorch(c, 120, 200, 16, 1); scorch(c, 360, 80, 14, 2) }, (c, S) => { bunting(c, S); lanterns(c, 112) }],
  // arène : une cible peinte au sol, champ de tir des artificiers
  arena: [c => { target(c, 240, 140); scorch(c, 200, 120, 12, 3); scorch(c, 290, 165, 10, 4) }, (c, S) => { bunting(c, S); lanterns(c, 96) }],
  // pétards : pochoirs « danger » en damier jaune et noir autour de la réserve
  petards: [c => { for (let x = 64; x < 416; x += 8) { c.rect(x, 216, 8, 4, (x >> 3) % 2 ? "y" : "e"); c.rect(x, 56, 8, 4, (x >> 3) % 2 ? "y" : "e") } scorch(c, 240, 136, 20, 5) }, (c, S) => { bunting(c, S); lanterns(c, 72) }],
  // carrefour : rose des vents en carreaux colorés
  hub: [c => { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, k = FEST[i % 5]; c.line(240, 136, Math.round(240 + Math.cos(a) * 44), Math.round(136 + Math.sin(a) * 28), k) } c.ellipse(240, 136, 10, 6, "Y"); c.ellipse(240, 136, 6, 4, "y") }, (c, S) => { bunting(c, S); lanterns(c, 120) }],
  // torches : traînées de mèches brûlées qui convergent vers le muret
  torches: [c => { fuseTrail(c, [[60, 220], [120, 200], [180, 150], [240, 130]]); fuseTrail(c, [[420, 220], [360, 200], [300, 150], [240, 130]]); scorch(c, 240, 130, 10, 6) }, (c, S) => { bunting(c, S); lanterns(c, 88) }],
  // boulets : rayures laissées par les boulets dans chaque couloir
  balls: [c => { for (const y of [56, 120, 184, 216]) for (let x = 48; x < 432; x += 3) if (hash(x, y, 7) < 0.6) c.px(x, y + Math.floor(hash(y, x, 8) * 3), "a") }, (c, S) => { bunting(c, S); lanterns(c, 64) }],
  bigkey: [c => { starInlay(c, 240, 140, 40) }, (c, S) => { bunting(c, S); lanterns(c, 104) }],
  // gargouilles : éclats de pierre tombés
  gargoyle: [c => { for (let i = 0; i < 30; i++) { const x = 50 + Math.floor(hash(i, 1, 9) * 380), y = 50 + Math.floor(hash(i, 2, 9) * 180); c.rect(x, y, 2, 2, "h"); c.px(x, y, "H") } scorch(c, 240, 140, 18, 7) }, (c, S) => { bunting(c, S); lanterns(c, 80) }],
  // salle secrète : poussière et vieux confettis délavés, pas de fête ici depuis longtemps
  secret: [c => { for (let i = 0; i < 40; i++) c.px(40 + Math.floor(hash(i, 3, 10) * 400), 40 + Math.floor(hash(i, 4, 10) * 200), i % 3 ? "N" : "a") }, (c, S) => lanterns(c, 96)],
  // Chevalier de fer : épées croisées en mosaïque et grandes brûlures
  boss: [c => { c.line(200, 110, 280, 170, "N"); c.line(200, 111, 280, 171, "N"); c.line(280, 110, 200, 170, "N"); c.line(280, 111, 200, 171, "N"); c.rect(196, 106, 8, 4, "Y"); c.rect(276, 106, 8, 4, "Y"); scorch(c, 120, 90, 18, 8); scorch(c, 360, 200, 18, 9) }, (c, S) => { bunting(c, S); lanterns(c, 72) }],
  // Goyave : gamelle, os et paillasse
  prison: [c => { for (let i = 0; i < 120; i++) { const a = hash(i, 0, 20) * 6.28, r = Math.sqrt(hash(i, 1, 21)), x = Math.round(120 + Math.cos(a) * r * 30), y = Math.round(200 + Math.sin(a) * r * 14); c.line(x, y, x + 3, y + 1, i % 3 ? "Y" : "y") } c.ellipse(330, 196, 8, 4, "S"); c.ellipse(330, 195, 6, 2, "s"); c.hline(300, 212, 8, "n"); c.px(299, 211, "n"); c.px(299, 213, "n"); c.px(308, 211, "n"); c.px(308, 213, "n") }, (c, S) => lanterns(c, 120)],
}

const ROOMS = {"entry": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW___m______________________WW", "WW____k________________k____WW", "WW__________________________WW", "WW__________________________WW", "______________________________", "______________________________", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW____k________________k____WW", "WW________m_________________WW", "WW__________________________WW", "WWWWWWWWWWWWWWEEWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWEEWWWWWWWWWWWWWW"], "arena": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW____m_____________________WW", "WW__________________________WW", "WW____________________________", "WW__________________m_________", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW____________________mm____WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "petards": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "____________________________WW", "____________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW_______________________m__WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "hub": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW___m____________________m_WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW________m_________________WW", "______________________________", "______________________________", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "torches": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW______mWWWWWWWWWWWW_______WW", "WW_______W__________W_______WW", "WW_______W__________W_______WW", "WW_______W__________W_______WW", "WW____________________________", "WW____________________________", "WW__________________________WW", "WW____m_____________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "balls": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW___WWWWWWWWWWWWWWWWWW__W_mWW", "WW__________________________WW", "______________________________", "______________________________", "WW_____________________m____WW", "WW_____WWWWWWWWWWWWWWWWWWW__WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "bigkey": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW______k____________k______WW", "____________________________WW", "____________________________WW", "WW__________________________WW", "WW__________________________WW", "WW______k____________k______WW", "WW__________________________WW", "WW__________________________WW", "WW_m____________m___________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "gargoyle": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW___k__________________k___WW", "WW__________________________WW", "____________________________WW", "____________________________WW", "WW__m_______________________WW", "WW_________________m________WW", "WW___k__________________k___WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "secret": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW_______________________m__WW", "WW__________________________WW", "WW__________________________WW", "WW____________________________", "WW____________________________", "WW__________________________WW", "WW____m_____________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"], "boss": ["WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW___k__________________k___WW", "WW__________________________WW", "WW__________________________WW", "WWm_________________________WW", "WW__________________________WW", "WW__________________________WW", "WW___k__________________k___WW", "WW___m______________________WW", "WW___m______________________WW", "WW__________________________WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"], "prison": ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW____________________m_____WW", "WW__________________________WW", "WW_________________________mWW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WW__________________________WW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW", "WWWWWWWWWWWWWW__WWWWWWWWWWWWWW"]};
for (const [n, grid] of Object.entries(ROOMS)) room('tour_' + n, grid, DECOR[n][0], DECOR[n][1])
