// ===== Les Dunes, en pixel art natif (pxl) =====
// La mise en page (sols, positions des arbres, rochers, palmiers, roseaux, nénuphars, fleurs) vient du peintre
// (tools/peintre/paint.py) : const L = { w, h, ground: [lignes], place: [...] } est injecté au-dessus de ce fichier.

pal({
  k: "#2a2410",                                                     // contour
  E: "#5e6620", V: "#6a6e22", v: "#80822e", g: "#909226", h: "#9c9a2a", H: "#aaa838", j: "#bab648", // herbe (olive Bourg-Luciole)
  W: "#d0ae6e", S: "#e0c07c", s: "#ecce88", l: "#f6dc9e",           // sable
  z: "#9a7c4e", D: "#b8965c", d: "#c8a868",                         // chemin de terre
  c: "#567c80", b: "#68908a", a: "#80a292", r: "#cfe4dc",           // eau
  N: "#584628", n: "#715e37", m: "#8c7446",                         // berge
  F: "#4a4212",                                                     // sous-bois
  o: "#3a4414", O: "#54601c", p: "#727e28", P: "#909a30", i: "#b0b048", // feuillage
  y: "#6a3412", Y: "#9a5018", u: "#c47628", U: "#e0a246",           // feuillage d'automne
  t: "#46290f", T: "#6a4022", x: "#8c5c34",                         // tronc
  R: "#4a4642", w: "#6c665e", X: "#928c82", Z: "#b8b0a4",           // rocher
  "2": "#46622a", "3": "#678a36", "4": "#8eac4c", "5": "#76562e", "6": "#9e7846", // palmier
  "7": "#f6f2e4", "8": "#f0a8be", "9": "#fad65a", "0": "#96bae8", A: "#e8785e", // fleurs
  B: "#5c6c20", C: "#7a4620", K: "#667f28", Q: "#8aa63a",           // roseaux, nénuphars
})
ramps("EVvghHj", "WSsl", "zDd", "cbar", "Nnm", "koOpPi", "kyYuU", "ktTx", "kRwXZ", "k234", "k56", "kF")

// ---------- petites fonctions ----------
const hash = (x, y, s = 0) => { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }
const vnoise = (x, y, sc, s = 0) => {
  const X = Math.floor(x / sc), Y = Math.floor(y / sc), fx = x / sc - X, fy = y / sc - Y
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy)
  const a = hash(X, Y, s), b = hash(X + 1, Y, s), c = hash(X, Y + 1, s), d = hash(X + 1, Y + 1, s)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
const G = (x, y) => (y >= 0 && y < L.h && x >= 0 && x < L.w) ? L.ground[y][x] : 'F'

// ---------- arbres : couronne en grappes de feuilles (chaque grappe : ombre en bas à droite, lumière en haut à gauche) ----------
function makeTree(name, W, H) {
  sprite(name, { w: W, h: H, outline: "k" }, (c) => {
    const rnd = c.rng(1), cx = Math.round(W / 2), cr = Math.round(W * 0.46), cy = 2 + Math.round(cr * 0.95)
    // tronc court et racines (le haut est caché par la couronne)
    const tb = H - 2, tw = Math.max(2, Math.round(W * 0.07))
    c.poly([cx - tw, cy, cx + tw + 1, cy, cx + tw + 1, tb - 3, cx + tw + 4, tb, cx + 1, tb - 2, cx - tw - 3, tb, cx - tw, tb - 3], "T")
    c.vline(cx + tw, cy, tb - cy - 2, "t"); c.vline(cx - tw + 1, cy + 2, tb - cy - 6, "x")
    // grappes, de l'arrière (haut) vers l'avant (bas)
    const blobs = []
    for (let i = 0; i < 8; i++) {
      const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * cr * 0.5
      blobs.push([Math.round(cx + Math.cos(a) * d), Math.round(cy + Math.sin(a) * d * 0.8 - 2), Math.round(cr * (0.4 + rnd() * 0.16))])
    }
    blobs.push([cx - Math.round(cr * 0.3), cy + Math.round(cr * 0.25), Math.round(cr * 0.45)], [cx + Math.round(cr * 0.3), cy + Math.round(cr * 0.28), Math.round(cr * 0.45)])
    blobs.sort((p, q) => p[1] - q[1])
    for (const [x, y, r] of blobs) {
      c.circ(x + 1, y + 1, r, "o")                                   // liseré sombre entre les grappes
      c.circ(x, y, r, "p")
      c.clip([x, y, r], () => { const q = c
        q.shade([x + Math.round(r * 0.45), y + Math.round(r * 0.55), Math.round(r * 0.95)], 1, 1)
        q.light([x - Math.round(r * 0.3), y - Math.round(r * 0.35), Math.round(r * 0.5)], 1, 1)
        q.light([x - Math.round(r * 0.4), y - Math.round(r * 0.5), Math.max(1, Math.round(r * 0.18))], 1, 1)
      })
    }
    // le dessous de la couronne, dans l'ombre
    c.shade((x, y) => y > cy + cr * 0.62 && c.is(x, y, "pP"), 1, 1)
    // feuilles : petites touches
    for (let i = 0; i < W * 1.5; i++) {
      const x = Math.round(cx + (rnd() - 0.5) * cr * 1.9), y = Math.round(cy + (rnd() - 0.5) * cr * 1.7)
      if (c.is(x, y, "p")) c.px(x, y, rnd() < 0.5 ? "O" : "P")
      else if (c.is(x, y, "P")) c.px(x, y, "i")
    }
  })
}
makeTree("tree", 48, 54)
makeTree("tree_s", 40, 45)

// ---------- palmier ----------
sprite("palm", { w: 60, h: 74, outline: "k" }, (c) => {
  const rnd = c.rng(3)
  let x = 26, y = 73
  for (let i = 0; i < 22; i++) { const nx = 26 + Math.round(Math.sin(i / 22 * 1.5) * 8), ny = 73 - i * 2; c.line(x, y, nx, ny, i % 3 ? "5" : "6", 4); x = nx; y = ny }
  const hx = x, hy = y + 2
  const angs = [-3.0, -2.45, -1.95, -1.5, -1.05, -0.55, -0.1, 0.45, 2.7]
  for (const a0 of angs) {
    const a = a0 + (rnd() - 0.5) * 0.15, len = 18 + rnd() * 7
    let px = hx, py = hy
    for (let s = 1; s <= len; s++) {
      const qx = Math.round(hx + Math.cos(a) * s), qy = Math.round(hy + Math.sin(a) * s * 0.75 + (s * s) / (len * 2.2))
      c.line(px, py, qx, qy, "3", 2)
      const nx = -Math.sin(a), ny = Math.cos(a)
      if (s % 2 === 0 && s > 2) { const L2 = s < len * 0.7 ? 4 : 3; c.line(qx, qy, Math.round(qx + nx * L2), Math.round(qy + ny * L2 + 1), "2"); c.line(qx, qy, Math.round(qx - nx * L2), Math.round(qy - ny * L2 + 1), "4") }
      px = qx; py = qy
    }
  }
  c.circ(hx, hy, 3, "5"); c.px(hx - 1, hy - 1, "6"); c.px(hx + 1, hy + 1, "6")
})

// ---------- rochers ----------
for (const [n, rx, ry] of [["rock_a", 7, 5], ["rock_b", 9, 6], ["rock_c", 6, 4]]) {
  sprite(n, { w: rx * 2 + 2, h: ry * 2 + 3, outline: "k" }, (c) => {
    c.ellipse(rx + 1, ry + 1, rx, ry, "X")
    c.shade((x, y) => y > ry + 1 || x > rx + rx * 0.5, 1)
    c.shade((x, y) => y > ry + ry * 0.7, 1)
    c.light([rx - 1, ry - 1, Math.max(2, ry - 2)], 1, 1)
  })
}
group("rock", ["rock_a", "rock_b", "rock_c"])

// ---------- roseaux, nénuphars, fleurs ----------
sprite("reed", { w: 18, h: 22, outline: "k" }, (c) => {
  const rnd = c.rng(5)
  for (let i = 0; i < 9; i++) { const x = 2 + Math.round(rnd() * 13), h = 7 + Math.round(rnd() * 9), lean = Math.round((rnd() - 0.5) * 6); c.line(x, 21, x + lean, 21 - h, i % 3 ? "K" : "B") }
  for (const x of [6, 11]) { c.line(x, 21, x, 6, "B"); c.rect(x - 1, 3 + (x % 3), 2, 5, "C") }
})
sprite("lily", { w: 12, h: 8, outline: "k" }, ellipse(5, 3, 5, 3, "Q"), shade([5, 4, 4], 1, 0.6), line(5, 3, 9, 1, "K"))
sprite("_flower", { w: 3, h: 4 }, "QFQ\n.K.\n.K.")   // F = pétale (recoloré au placement)

// ---------- la scène ----------
const FL = ["7", "8", "9", "0", "A"]
const PL = L.place
const byY = (a, b) => a.y - b.y
scene("dunes", { w: L.w, h: L.h, bg: "h" },
  layer("sol", (c) => {
    for (let y = 0; y < L.h; y++) {
      const row = L.ground[y]
      for (let x = 0; x < L.w; x++) {
        const t = row[x]
        let k = "h"
        if (t === "g" || t === "e") {
          const n = vnoise(x, y, 46, 1) * 0.65 + vnoise(x, y, 13, 2) * 0.35       // grandes zones plus claires / plus sombres de la prairie
          k = n < 0.24 ? "g" : n > 0.8 ? "H" : "h"
          if (t === "e") k = "v"
        } else if (t === "G") k = (x + y) % 2 && vnoise(x, y, 9, 3) > 0.4 ? "V" : "v"   // ombre de la forêt
        else if (t === "s") {
          const rid = Math.sin(y * 0.64 + (vnoise(x, y, 40, 4) - 0.5) * 20 + x * 0.08)   // rides de dune
          k = rid > 0.93 ? "S" : rid < -0.95 ? "l" : "s"
        } else if (t === "d") k = "d"
        else if (t === "a" || t === "b" || t === "c" || t === "n" || t === "N" || t === "m" || t === "F") k = t
        c.px(x, y, k)
      }
    }
    // chemin : terre tassée sur les bords
    for (let y = 1; y < L.h - 1; y++) for (let x = 1; x < L.w - 1; x++) if (G(x, y) === "d") {
      let near = 9
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (G(x + dx, y + dy) !== "d" && G(x + dx, y + dy) !== "s") near = Math.min(near, Math.max(Math.abs(dx), Math.abs(dy)))
      if (near === 1) c.px(x, y, "z"); else if (near === 2) c.px(x, y, "D")
    }
    // ornières : deux traces de roues le long du chemin (il est horizontal)
    for (let x = 0; x < L.w; x++) {
      let y0 = -1, y1 = -1
      for (let y = 0; y < L.h; y++) if (G(x, y) === "d") { if (y0 < 0) y0 = y; y1 = y }
      if (y0 < 0 || y1 - y0 < 14) continue
      const mid = (y0 + y1) / 2
      for (const yy of [Math.round(mid - 5), Math.round(mid + 4)]) if (hash(x >> 2, yy, 16) > 0.18 && G(x, yy) === "d") c.px(x, yy, "D")
    }
    // franges de touffes : l'herbe déborde sur le sable et le chemin
    for (let y = 2; y < L.h - 2; y++) for (let x = 2; x < L.w - 2; x++) {
      const t = G(x, y); if (t !== "s" && t !== "d") continue
      const up = G(x, y - 1), dn = G(x, y + 1), lf = G(x - 1, y), rt = G(x + 1, y)
      const gr = (q) => q === "e" || q === "g"
      if ((gr(up) || gr(dn) || gr(lf) || gr(rt)) && hash(x, y, 7) < 0.45) {
        const dx = gr(lf) ? 1 : gr(rt) ? -1 : 0, dy = gr(up) ? 1 : gr(dn) ? -1 : 0, len = 1 + Math.floor(hash(x, y, 8) * 3)
        for (let i = 0; i < len; i++) c.px(x + dx * i, y + dy * i, "E")
      }
    }
    // touffes d'herbe dans la prairie (petits « v » sombres), clairsemées
    for (let i = 0; i < 520; i++) {
      const x = 2 + Math.floor(hash(i, 1, 11) * (L.w - 4)), y = 2 + Math.floor(hash(i, 2, 11) * (L.h - 4))
      if (G(x, y) !== "g") continue
      c.px(x - 1, y - 1, "v"); c.px(x + 1, y - 1, "v"); c.px(x, y, "V")
    }
    // reflets dans l'eau : petits traits clairs horizontaux
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(hash(i, 3, 12) * L.w), y = Math.floor(hash(i, 4, 12) * L.h)
      if (G(x, y) === "b" && G(x + 4, y) === "b") c.hline(x, y, 3 + Math.floor(hash(i, 5, 12) * 3), "r")
    }
    // berge : petite écume claire contre l'eau
    for (let y = 1; y < L.h - 1; y++) for (let x = 1; x < L.w - 1; x++) if (G(x, y) === "a" && "nmN".includes(G(x, y - 1)) && hash(x, y, 13) < 0.5) c.px(x, y, "r")
  }),
  // ombres portées (douces) sous les arbres, palmiers et rochers
  layer("ombres", { shade: true, density: 0.6 }, (c) => {
    for (const p of PL) {
      if (p.t === "tree" && p.s >= 0.75) c.ellipse(p.x, p.y - 2, 13, 4, "k")
      if (p.t === "palm") c.ellipse(p.x, p.y - 1, 9, 3, "k")
      if (p.t === "rock") c.ellipse(p.x, p.y, 7, 2, "k")
    }
  }),
  layer("decor", (c) => {
    for (const p of PL.filter(p => p.t === "lily")) c.stamp("lily", p.x - 6, p.y - 4, { rflip: "x" })
    for (const p of PL.filter(p => p.t === "flower")) {
      const k = FL[p.c] || "7"
      for (let i = 0; i < 4; i++) c.stamp("_flower", p.x - 4 + Math.floor(hash(p.x, i, 14) * 8), p.y - 3 + Math.floor(hash(p.y, i, 15) * 5), { swap: { F: k } })
    }
    const items = PL.filter(p => ["tree", "palm", "rock", "reed"].includes(p.t)).sort(byY)
    for (const p of items) {
      if (p.t === "tree") {
        const big = p.s >= 0.75, nm = big ? "tree" : "tree_s", w = big ? 50 : 42, h = big ? 56 : 47
        const sw = p.aut ? { p: "Y", P: "u", i: "U", O: "y", o: "k" } : p.dark >= 0.2 ? { p: "O", P: "p", i: "P", O: "o" } : {}
        c.stamp(nm, p.x - w / 2, p.y - h + 3, { reseed: true, rflip: "x", swap: sw })
      } else if (p.t === "palm") c.stamp("palm", p.x - 27, p.y - 75, { rflip: "x" })
      else if (p.t === "rock") c.stamp("rock", p.x - 8, p.y - 11)
      else if (p.t === "reed") c.stamp("reed", p.x - 9, p.y - 22, { reseed: true })
    }
  }),
)

// découpes « dessus » : uniquement les arbres de lisière et les palmiers (ce qui passe devant le héros)
scene("dunes_dessus", { w: L.w, h: L.h },
  layer("decor", (c) => {
    const items = PL.filter(p => (p.t === "tree" && p.over) || p.t === "palm").sort(byY)
    for (const p of items) {
      if (p.t === "tree") {
        const big = p.s >= 0.75, nm = big ? "tree" : "tree_s", w = big ? 50 : 42, h = big ? 56 : 47
        const sw = p.aut ? { p: "Y", P: "u", i: "U", O: "y", o: "k" } : p.dark >= 0.2 ? { p: "O", P: "p", i: "P", O: "o" } : {}
        c.stamp(nm, p.x - w / 2, p.y - h + 3, { reseed: true, rflip: "x", swap: sw })
      } else c.stamp("palm", p.x - 27, p.y - 75, { rflip: "x" })
    }
  }),
)
