// Escape Night 2 — habillage héroïque fantasy de l'interface (cadres, cœurs, boutons du pad, curseur épée…)
// Construire : node ~/pxl/bin/pxl.js build tools/ui/ui.px.js   puis copier out/sprites/*.png dans assets/ui/
// Lumière unique venant d'en haut à gauche, comme le reste du jeu.
pal({
  k: "#120c1a",                                            // contour
  i: "#24223a", I: "#3c3a5a", j: "#5e5f86", J: "#9a9cc2",  // fer bleuté
  Y: "#6a3e10", o: "#b8801e", y: "#eab84a", z: "#fff2a8",  // or
  R: "#4a0c1c", r: "#9a1c30", e: "#d8384a", E: "#ff9a98",  // rubis
  q: "#0e1a46", Q: "#1e3a96", u: "#3a6ae0", U: "#a8c8ff",  // saphir
  T: "#5a3a06", t: "#c88a12", O: "#ffd24a", P: "#fff4c0",  // topaze
  G: "#0c3a2c", g: "#1e8a5a", h: "#5ee0a0", H: "#c8ffe4",  // émeraude
  n: "#3a2016", N: "#6a3a22",                              // cuir de la poignée
  w: "#f4ecd8", v: "#c8bca0", V: "#8a7e66",                // os (crâne du boss)
  s: "#0d1430", S: "#18224a", d: "#24305e", D: "#34407a", // pierre de nuit (fond des menus, château)
  l: "#ffcf6a", L: "#fff0b0",                              // fenêtres éclairées
})
ramps("kiIjJ", "kYoyz", "kRreE", "kqQuU", "kTtOP", "kGghH", "knN", "kVvw", "ksSdD")

// ---- sphère / anneau ombrés (lumière en haut à gauche), en bandes nettes ----
const L3 = (() => { const v = [-0.55, -0.65, 0.55], m = Math.hypot(...v); return v.map(a => a / m) })()
const band = (ramp, l) => ramp[Math.max(0, Math.min(ramp.length - 1, Math.floor(l * ramp.length)))]
function dome(c, cx, cy, r, ramp, flat = 0.35) {
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) {
    const dx = (x + 0.5 - cx) / r, dy = (y + 0.5 - cy) / r, d2 = dx * dx + dy * dy
    if (d2 > 1) continue
    const nz = Math.sqrt(1 - d2) * (1 - flat) + flat, m = Math.hypot(dx, dy, nz)
    const l = (dx * L3[0] + dy * L3[1] + nz * L3[2]) / m
    c.px(x, y, band(ramp, (l + 0.15) / 1.15))
  }
}
function torus(c, cx, cy, r0, r1, ramp) { // anneau bombé entre r0 et r1
  const mid = (r0 + r1) / 2, half = (r1 - r0) / 2
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy)
    if (d < r0 || d > r1) continue
    const t = (d - mid) / half, nz = Math.sqrt(Math.max(0, 1 - t * t)), nx = dx / d * t, ny = dy / d * t
    const l = nx * L3[0] + ny * L3[1] + nz * L3[2]
    c.px(x, y, band(ramp, (l + 0.2) / 1.2))
  }
}
function rim(c, cx, cy, r) { for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) { const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy); if (d <= r && d > r - 1) c.px(x, y, "k") } }

// ---- coin de cadre : losange d'or serti d'un rubis ----
sprite("corner", { w: 13, h: 13 }, (c) => {
  for (let y = 0; y < 13; y++) for (let x = 0; x < 13; x++) {
    const m = Math.abs(x - 6) + Math.abs(y - 6)
    if (m > 6) continue
    if (m === 6) { c.px(x, y, "k"); continue }
    if (m >= 3) { const up = (x - 6) + (y - 6) < 0; c.px(x, y, m === 5 ? (up ? "z" : "Y") : up ? "y" : "o"); continue }
    if (m === 2) { c.px(x, y, "k"); continue }
    c.px(x, y, (x - 6) + (y - 6) < 0 ? "E" : (x === 6 && y === 6) ? "e" : "r")
  }
})
sprite("corner_s", { base: "corner", swap: { E: "U", e: "u", r: "Q" } }) // serti de saphir (cadre sélectionné)

// ---- petit fleuron d'or pour les séparateurs et les onglets ----
sprite("gem", { w: 7, h: 7 }, (c) => {
  for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) { const m = Math.abs(x - 3) + Math.abs(y - 3); if (m > 3) continue; c.px(x, y, m === 3 ? "k" : (x - 3) + (y - 3) < 0 ? "E" : m === 0 ? "e" : "r") }
})
sprite("gem_gold", { base: "gem", swap: { E: "z", e: "y", r: "o" } })

// ---- curseur : petite épée pointée vers la droite ----
sprite("cursor", { w: 15, h: 7, outline: "k" },
  rect(0, 2, 2, 3, "o"), px(0, 2, "y"),                 // pommeau
  rect(2, 3, 3, 1, "N"), px(2, 3, "n"),                 // poignée
  rect(5, 0, 2, 7, "o"), vline(5, 0, 7, "y"),           // garde
  rect(7, 2, 7, 3, "j"), hline(7, 2, 7, "J"), hline(7, 4, 7, "I"), hline(8, 3, 5, "J"), // lame
  px(14, 3, "J"))

// ---- cœurs (9 × 7 + contour) ----
sprite("_heart", { mx: "c" }, `
  .eee.
  eeeee
  eeeee
  .eeee
  ..eee
  ...ee
  ....e`)
sprite("heart", { base: "_heart", outline: "k" }, px(1, 1, "E"), px(2, 1, "E"), px(1, 2, "E"), px(8, 2, "r"), px(7, 3, "r"), px(6, 4, "r"), px(5, 5, "r"))
sprite("heart_empty", { base: "heart", swap: { e: "i", E: "I", r: "i" } })
sprite("heart_gold", { base: "heart", swap: { e: "y", E: "z", r: "o" } })

// ---- crâne de la jauge de boss ----
sprite("skull", { outline: "k", mx: "c" }, `
  .vww
  vwww
  vkkw
  vkkw
  .vvw
  ..vv
  ..kv`)

// ---- médaillon de l'objet sur B (HUD) : anneau d'or, fond de nuit ----
sprite("medal", { w: 26, h: 26 }, (c) => { dome(c, 13, 13, 12.5, "kYoyz", 0.9); torus(c, 13, 13, 9, 12.5, "YoyzZ".replace("Z", "z")); dome(c, 13, 13, 9, "sSS", 1); rim(c, 13, 13, 13); rim(c, 13, 13, 9.4) })

// ---- pad tactile : gemmes serties d'or ----
function gemButton(name, d, ramp) {
  const r = d / 2
  sprite(name, { w: d, h: d }, (c) => {
    torus(c, r, r, r - 4, r, "Yoyz")
    dome(c, r, r, r - 4, ramp, 0.25)
    rim(c, r, r, r); rim(c, r, r, r - 3.6)
    // éclat de lumière
    const hx = Math.round(r - r * 0.38), hy = Math.round(r - r * 0.42)
    c.px(hx, hy, "w"); c.px(hx + 1, hy, "w"); c.px(hx, hy + 1, "w")
  })
}
gemButton("btn_a", 44, "RreeE")
gemButton("btn_b", 32, "qQuuU")
gemButton("btn_r", 26, "TttOP")
sprite("btn_a_on", { base: "btn_a", swap: { R: "r", r: "e", e: "E" } })
sprite("btn_b_on", { base: "btn_b", swap: { q: "Q", Q: "u", u: "U" } })
sprite("btn_r_on", { base: "btn_r", swap: { T: "t", t: "O", O: "P" } })
// bouton pause : bouclier de fer rond
sprite("btn_start", { w: 24, h: 24 }, (c) => { torus(c, 12, 12, 8, 12, "Yoyz"); dome(c, 12, 12, 8, "iIIj", 0.5); rim(c, 12, 12, 12); rim(c, 12, 12, 7.6) })
// stick : anneau de fer clouté d'or, et pommeau d'or
sprite("stick_ring", { w: 72, h: 72 }, (c) => {
  torus(c, 36, 36, 30, 36, "iIjJ"); rim(c, 36, 36, 36); rim(c, 36, 36, 29.6)
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, x = Math.round(36 + Math.cos(a) * 33 - 1.5), y = Math.round(36 + Math.sin(a) * 33 - 1.5); c.rect(x, y, 3, 3, "o"); c.px(x, y, "z"); c.px(x + 2, y + 2, "Y") }
})
sprite("stick_knob", { w: 34, h: 34 }, (c) => {
  torus(c, 17, 17, 11, 17, "Yoyz"); dome(c, 17, 17, 11, "iIjJ", 0.4); rim(c, 17, 17, 17); rim(c, 17, 17, 10.6)
  // rose des vents gravée
  for (let k = -6; k <= 6; k++) { c.px(17 + k, 17, Math.abs(k) < 2 ? "y" : "o"); c.px(17, 17 + k, Math.abs(k) < 2 ? "y" : "o") }
})
sprite("stick_knob_on", { base: "stick_knob", swap: { i: "I", I: "j", j: "J" } })

// ---- pierre de nuit des écrans de menu (motif qui se répète) ----
sprite("stone", { w: 48, h: 32 }, (c) => {
  c.rect(0, 0, 48, 32, "S")
  const rows = [[0, [0, 20, 34]], [16, [10, 28, 40]]]
  for (const [y0, cuts] of rows) {
    c.hline(0, y0 + 15, 48, "s")
    for (let k = 0; k < cuts.length; k++) {
      const x0 = cuts[k], x1 = (cuts[k + 1] ?? cuts[0] + 48)
      c.vline(x0 % 48, y0, 15, "s")
      for (let x = x0 + 1; x < x1; x++) c.px(x % 48, y0, "d")      // arête haute éclairée
      c.vline((x0 + 1) % 48, y0, 15, "d")
    }
  }
  // quelques éclats aux angles des pierres, là où elles s'usent
  for (const [x, y] of [[19, 14], [33, 1], [9, 30], [27, 17], [46, 13]]) c.px(x, y, "s")
})

// ---- château lointain de l'écran titre ----
sprite("castle", { w: 150, h: 78 }, (c) => {
  const S = "s"
  // colline
  for (let x = 0; x < 150; x++) { const h = Math.round(14 + 10 * Math.sin((x / 150) * Math.PI)); c.vline(x, 78 - h, h, S) }
  // remparts
  c.rect(28, 44, 94, 22, S)
  for (let x = 28; x < 122; x += 6) c.rect(x, 41, 3, 3, S)
  // tours latérales
  const tower = (x, w, top, roof) => {
    c.rect(x, top, w, 66 - top, S)
    for (let k = 0; k < w; k += 4) c.rect(x + k, top - 3, 2, 3, S)
    if (roof) { c.poly([x - 1, top - 2, x + w / 2, top - 2 - roof, x + w + 1, top - 2], S); c.vline(Math.round(x + w / 2), top - 2 - roof - 6, 6, S); c.rect(Math.round(x + w / 2) + 1, top - 2 - roof - 6, 5, 3, "r") }
  }
  tower(20, 12, 30, 12); tower(118, 12, 30, 12); tower(44, 10, 24, 10); tower(96, 10, 24, 10)
  // donjon central
  c.rect(62, 16, 26, 50, S); c.poly([60, 17, 75, 0, 90, 17], S); c.vline(75, -4, 4, S)
  c.rect(70, 46, 10, 20, "k"); c.rect(71, 45, 8, 1, "k")              // porte
  // fenêtres éclairées (quelques-unes seulement)
  for (const [x, y] of [[68, 24], [80, 24], [74, 32], [24, 40], [122, 40], [47, 32], [99, 32], [25, 52], [123, 52]]) { c.rect(x, y, 2, 4, "l"); c.px(x, y, "L") }
  // liseré de lune à droite (la lune est en haut à droite)
  for (let y = 0; y < 78; y++) for (let x = 149; x > 0; x--) if (c.is(x, y, "s") && !c.is(x + 1, y, "*")) { c.px(x, y, "d"); break }
  for (let x = 0; x < 150; x++) for (let y = 0; y < 78; y++) if (c.is(x, y, "sd")) { if (!c.is(x, y - 1, "*")) c.px(x, y, "D"); break }
})
