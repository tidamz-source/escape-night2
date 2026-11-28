// ---------- cartes composées (outil tools/carte) ----------
// assets/cartes/index.json liste les cartes ; chaque carte : assets/cartes/<id>/carte.json + son fond (image ×2).
// Une carte composée remplace le décor d'une zone (fond, collisions, portes, sorties, objets posés) ;
// si la zone existe déjà dans le code, ses PNJ, monstres et quêtes restent.
const CARTES = {};
const CARTE_FTS = 4; // collisions fines : un carré de 4 px
function loadCartes() {
  return fetch(`assets/cartes/index.json?v=${VERSION}`).then(r => r.ok ? r.json() : []).catch(() => [])
    .then(ids => Promise.all(ids.map(id => fetch(`assets/cartes/${id}/carte.json?v=${VERSION}`).then(r => r.json()).then(C => {
      CARTES[id] = C;
      const jobs = [loadImage('carte_' + id, `assets/cartes/${id}/${C.fond}?v=${VERSION}`)], seen = new Set();
      for (const src of [...(C.objets || []).map(o => o.src), ...(C.ponts || []).flatMap(p => [p.bg, p.fg, p.leve])]) if (src && !seen.has(src)) { seen.add(src); jobs.push(loadImage('cobj_' + src, `${src}?v=${VERSION}`)); }
      return Promise.all(jobs);
    }).catch(e => console.warn('carte illisible', id, e)))));
}

// un objet posé (bâtiment, arbre, rocher) : trié à sa ligne de pied, transparent quand on passe derrière
// la ligne de pied peut être brisée (o.pied) : le tri se fait à la hauteur de la ligne sous le héros
function carteFootY(o, x) {
  const P = o.pied && o.pied.length >= 2 ? o.pied : null; if (!P) return o.base;
  let best = -Infinity, near = null, nd = Infinity;
  for (let i = 0; i < P.length - 1; i++) {
    const [x0, y0] = P[i], [x1, y1] = P[i + 1];
    if (x >= Math.min(x0, x1) && x <= Math.max(x0, x1)) best = Math.max(best, x1 === x0 ? Math.max(y0, y1) : y0 + (y1 - y0) * (x - x0) / (x1 - x0));
  }
  if (best > -Infinity) return best;
  for (const [px, py] of P) { const d = Math.abs(px - x); if (d < nd) { nd = d; near = py; } }
  return near;
}
const hexRgba = h => { const c = (h || '#ffd27a').replace('#', ''); return `rgba(${parseInt(c.slice(0, 2), 16)},${parseInt(c.slice(2, 4), 16)},${parseInt(c.slice(4, 6), 16)},`; };
class CarteObj {
  constructor(o) {
    this.o = o; this.x = o.x + o.w * o.s / 2; this.y = o.base; this.a = 1;
    if (o.lumiere) { const L = o.lumiere; this.light = { r: L.r || 48, c: hexRgba(L.c), flick: L.flick ? 2 : 0, warm: true }; this.lightPos = [L.x, L.y + 6]; } // lanterne posée dans l'atelier
  }
  update(dt, G) {
    const o = this.o, P = G.player; if (!P) return;
    const fy = carteFootY(o, P.x); this.y = fy; if (!o.fade) return;
    const w = o.w * o.s, behind = P.y < fy && P.x > o.x && P.x < o.x + w && P.y > o.y + 6 && P.y - 26 < fy;
    this.a = lerp(this.a, behind ? 0.45 : 1, Math.min(1, dt * 10));
  }
  draw() {
    const o = this.o, im = IMG['cobj_' + o.src]; if (!im) return;
    const w = o.w * o.s, h = o.h * o.s;
    ctx.globalAlpha = this.a;
    if (o.flip) { ctx.save(); ctx.translate(o.x + w, o.y); ctx.scale(-1, 1); ctx.drawImage(im, 0, 0, w, h); ctx.restore(); }
    else ctx.drawImage(im, o.x, o.y, w, h);
    ctx.globalAlpha = 1;
  }
}

// ---------- fumée de cheminée procédurale (cartoon) : jamais deux bouffées pareilles ----------
// chaque bouffée = un nuage de 2 à 4 boules, blanc ombré lavande, contour doux ; elle naît petite,
// gonfle en montant en se balançant, puis rétrécit et disparaît. o.taille (1 = normal), o.vent (-1 gauche … 1 droite)
const FUMEE_PAL = { w: '#fbf8ff', l: '#dcd6ea', m: '#b9b2cc', o: '#7f7896' };
class Fumee {
  constructor(x, y, o = {}) { this.x = this.fx = x; this.y = this.fy = y; this.k = o.taille || 1; this.vent = o.vent || 0; this.puffs = []; this.next = Math.random() * 1.2; this.ghost = false; this.warm = 0; for (let i = 0; i < 3; i++) this.update(0.6); }
  spawn() {
    const k = this.k, n = 2 + Math.floor(Math.random() * 3), lobes = [{ dx: 0, dy: 0, r: 1 }];
    for (let i = 1; i < n; i++) { const a = (i / n) * Math.PI * 2 + Math.random() * 0.8; lobes.push({ dx: Math.cos(a) * (0.45 + Math.random() * 0.25), dy: Math.sin(a) * 0.3 + 0.15, r: 0.55 + Math.random() * 0.2 }); }
    this.puffs.push({ age: 0, life: 2.8 + Math.random() * 1.2, r: (4.2 + Math.random() * 2) * k, rise: (28 + Math.random() * 10) * k, sway: (1 + Math.random() * 2) * k, ph: Math.random() * 6.28, lobes });
  }
  update(dt) {
    this.next -= dt; if (this.next <= 0) { this.spawn(); this.next = 1.3 + Math.random() * 0.9; }
    for (const p of this.puffs) p.age += dt;
    this.puffs = this.puffs.filter(p => p.age < p.life);
  }
  draw(g = ctx) { for (const p of this.puffs) fumeePuff(g, this, p); }
}
function fumeePuff(g, F, p) {
  const t = p.age / p.life, sz = t < 0.7 ? Math.sin(t / 0.7 * Math.PI / 2) : Math.cos((t - 0.7) / 0.3 * Math.PI / 2), r = 0.9 + sz * p.r; if (r < 1) return;
  const cx = F.fx + Math.sin(t * Math.PI * 1.5 + p.ph) * p.sway + F.vent * t * t * 16 * F.k, cy = F.fy - t * p.rise; // fx/fy : la cheminée (y sert au tri)
  const L = p.lobes.map(l => ({ x: cx + l.dx * r, y: cy + l.dy * r, r: r * l.r })), R = Math.ceil(r * 1.9) + 2, x0 = Math.round(cx) - R, y0 = Math.round(cy) - R, N = R * 2 + 1;
  const m = new Array(N * N).fill(null);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const px = x0 + i + 0.5, py = y0 + j + 0.5; let best = null, bd = 0;
    for (const l of L) { const d = Math.hypot(px - l.x, py - l.y) / l.r; if (d <= 1 && (!best || l.y + l.r * 0.3 > best.y + best.r * 0.3)) { best = l; bd = d; } }
    if (!best) continue;
    const sh = ((px - best.x) + (py - best.y)) / (best.r * 1.414);
    m[j * N + i] = sh > 0.35 && bd > 0.45 ? 'm' : sh > 0.05 && bd > 0.55 ? 'l' : 'w';
  }
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    let c = m[j * N + i];
    if (!c) { if ((i > 0 && m[j * N + i - 1]) || (i < N - 1 && m[j * N + i + 1]) || (j > 0 && m[(j - 1) * N + i]) || (j < N - 1 && m[(j + 1) * N + i])) c = 'o'; else continue; }
    g.fillStyle = FUMEE_PAL[c]; g.fillRect(x0 + i, y0 + j, 1, 1);
  }
}

// ---------- pont-levis ----------
// fermé : l'image du pont levé (leve), la zone reste de l'eau.
// ouvert (SAVE[drapeau]) : le tablier (bg) passe sous le héros, les piliers (fg) par-dessus ; la zone devient praticable.
// À l'ouverture sur place, le tablier s'abaisse depuis sa charnière.
const pontOpen = p => !p.drapeau || !!SAVE[p.drapeau];
class PontBg {
  constructor(p) { this.p = p; this.ground = true; this.x = p.x + p.w * p.s / 2; this.y = p.y; this.k = pontOpen(p) ? 1 : 0; this.anim = false; }
  update(dt, G) {
    const p = this.p, P = G.player, A = G.area;
    // à la nage, on passe sous le pont ouvert : le tablier se dessine par-dessus le héros
    // et ses cases restent de l'eau pour qui y entre en nageant (on ne grimpe pas sur le tablier depuis l'eau)
    if (P && p.zone && A.ponts) {
      const z = p.zone, tx = Math.floor(P.x / TS), ty = Math.floor((P.y - 2) / TS), inZ = pontOpen(p) && tx >= z.tx && tx < z.tx + z.tw && ty >= z.ty && ty < z.ty + z.th;
      if (inZ && !this.inZ) A.pontUnder = !!this.wasSwim; else if (!inZ && this.inZ) A.pontUnder = false;
      this.inZ = inZ; if (!inZ) this.wasSwim = P.swimming;
      const under = pontOpen(p) && (P.swimming || (inZ && A.pontUnder));
      this.ground = !under; this.y = under ? 1e9 - 1 : p.y;
    }
    if (pontOpen(p) && this.k < 1) {
      if (!this.anim) { this.anim = true; SFX.gate(); }
      this.k = Math.min(1, this.k + dt / 1.6); G.shake = Math.max(G.shake || 0, 0.06);
      if (this.k >= 1) { this.anim = false; SFX.door(); G.shake = 0.3; G.parts.burst(this.x, p.y + p.h * p.s / 2, 18, { c: ['#cfe0ff', '#fff', '#8a6a4a'], life: 0.6, r: 2, up: 30 }); }
    }
  }
  draw() {
    const p = this.p, im = p.leve && IMG['cobj_' + p.leve];
    if (im && this.k < 1) { ctx.globalAlpha = 1 - this.k; ctx.drawImage(im, p.x, p.y, p.w * p.s, p.h * p.s); ctx.globalAlpha = 1; }
    pontDraw(p, p.bg, this.k);
  }
}
class PontFg {
  constructor(bg) { this.bg = bg; this.p = bg.p; this.x = bg.x; this.y = 1e9; } // devant le héros, ou selon sa ligne de pied
  update(dt, G) { const P = G.player; this.y = this.p.pied && P && !P.swimming ? carteFootY(this.p, P.x) : 1e9; } // à la nage, tout le pont passe par-dessus
  draw() { if (this.bg.k > 0.85) { ctx.globalAlpha = (this.bg.k - 0.85) / 0.15; pontDraw(this.p, this.p.fg, 1); ctx.globalAlpha = 1; } }
}
function pontDraw(p, src, k) {
  const im = src && IMG['cobj_' + src]; if (!im || k <= 0) return;
  const w = p.w * p.s, h = p.h * p.s, side = p.charniere || 'droite', e = k * k * (3 - 2 * k);
  ctx.save();
  if (side === 'droite' || side === 'gauche') { const ww = w * e, x = side === 'droite' ? p.x + w - ww : p.x; ctx.drawImage(im, side === 'droite' ? im.width * (1 - e) : 0, 0, im.width * e, im.height, x, p.y, ww, h); }
  else { const hh = h * e, y = side === 'bas' ? p.y + h - hh : p.y; ctx.drawImage(im, 0, side === 'bas' ? im.height * (1 - e) : 0, im.width, im.height * e, p.x, y, w, hh); }
  ctx.restore();
}
function pontSync(A, C) { // les cases du pont : praticables quand il est ouvert
  const g = A.g;
  for (const p of C.ponts || []) { const z = p.zone; if (!z) continue; for (let ty = z.ty; ty < z.ty + z.th; ty++) for (let tx = z.tx; tx < z.tx + z.tw; tx++) if (g[ty] && g[ty][tx] != null) g[ty][tx] = pontOpen(p) ? 'b' : C.grille[ty][tx]; }
  A.fine = carteFine(C, g);
}

function inPoly(px, py, P) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) c = !c; }
  return c;
}
// grille fine : le sol peint du fond (cases de 16) puis les polygones des objets
function carteFine(C, g) {
  const k = TS / CARTE_FTS, F = [];
  for (let y = 0; y < g.length * k; y++) { let row = ''; for (let x = 0; x < g[0].length * k; x++) { const t = g[Math.floor(y / k)][Math.floor(x / k)]; row += SOLID.has(t) ? t : '.'; } F.push(row.split('')); }
  for (const o of C.objets || []) {
    if (!o.poly || o.poly.length < 3) continue;
    const xs = o.poly.map(p => p[0]), ys = o.poly.map(p => p[1]);
    for (let cy = Math.max(0, Math.floor(Math.min(...ys) / CARTE_FTS)); cy <= Math.min(F.length - 1, Math.floor(Math.max(...ys) / CARTE_FTS)); cy++)
      for (let cx = Math.max(0, Math.floor(Math.min(...xs) / CARTE_FTS)); cx <= Math.min(F[0].length - 1, Math.floor(Math.max(...xs) / CARTE_FTS)); cx++)
        if (inPoly((cx + 0.5) * CARTE_FTS, (cy + 0.5) * CARTE_FTS, o.poly)) F[cy][cx] = '#';
  }
  // le seuil des portes reste toujours accessible, même si une collision d'objet le recouvre
  for (const d of C.portes || []) for (let cy = Math.floor((d.y - 6) / CARTE_FTS); cy <= Math.floor((d.y + 10) / CARTE_FTS); cy++) for (let cx = Math.floor((d.x - 8) / CARTE_FTS); cx < Math.ceil((d.x + 8) / CARTE_FTS); cx++) if (F[cy] && F[cy][cx] === '#') F[cy][cx] = '.';
  return F.map(r => r.join(''));
}

function carteArea(C, old) {
  const g = C.grille.map(r => r.split(''));
  (C.sorties || []).forEach((s, i) => { const ch = String(i + 1); for (let ty = s.ty; ty < s.ty + s.th; ty++) for (let tx = s.tx; tx < s.tx + s.tw; tx++) if (g[ty] && g[ty][tx] != null) g[ty][tx] = ch; });
  let A;
  if (old) { A = old; A.g = g; A.cols = g[0].length; A.rows = g.length; A.w = A.cols * TS; A.h = A.rows * TS; }
  else A = zoneArea(C.id, g, 'collines', { name: C.name || C.id, dark: C.dark });
  if (C.name) A.name = C.name;
  if (C.dark != null) A.carteDark = C.dark; // niveau de nuit réglé dans l'atelier
  if (C.id === 'camp' && typeof CAMP_FIRE !== 'undefined') { const f = (C.objets || []).find(o => /fire|feu/i.test(o.src)); if (f) { CAMP_FIRE.x = f.x + f.w * f.s / 2; CAMP_FIRE.y = f.base - 8; if (old) old.dawn = { x: CAMP_FIRE.x, y: CAMP_FIRE.y + 40, dir: 'up' }; } } // le feu de camp posé dans l'atelier
  A.paint = 'carte_' + C.id; A.bushSpots = []; A.props = [];
  A.fine = carteFine(C, g); A.fineTS = CARTE_FTS;
  A.syncTiles = () => pontSync(A, C); // appelé par la cible du pont-levis
  A.ponts = C.ponts || []; A.pontUnder = false;
  if (A.ponts.length) { const base = Area.prototype.tile; A.tile = function (tx, ty) { const t = base.call(this, tx, ty); if (t === 'b' && this.pontUnder && this.ponts.some(p => p.zone && tx >= p.zone.tx && tx < p.zone.tx + p.zone.tw && ty >= p.zone.ty && ty < p.zone.ty + p.zone.th)) return '~'; return t; }; } // sous le pont, c'est de l'eau
  pontSync(A, C);
  for (const a of C.arrivees || []) ZONE_ARRIVE[a.nom] = { x: a.x, y: a.y, dir: a.dir || 'down' };
  const dep = (C.arrivees || []).find(a => a.nom === C.depart) || (C.arrivees || [])[0];
  if (dep) A.start = { x: dep.x, y: dep.y, dir: dep.dir || 'down' };
  A.exits = {};
  (C.sorties || []).forEach((s, i) => { A.exits[String(i + 1)] = G => G.enter(s.vers, ZONE_ARRIVE[s.arrivee] || (G.areas[s.vers] && G.areas[s.vers].start)); });
  // une porte vers une maison que la zone avait déjà garde ses conditions (maison à louer, partie au camping…)
  const oldH = (old && old.houses) || [], lockOf = id => { const h = oldH.find(h => h.id === id); return h && h.o && h.o.locked; };
  if ((C.portes || []).length || !old) A.houses = (C.portes || []).map(p => ({ id: p.vers, x: p.x, y: p.y, o: { w: p.w || 3, d: 1, painted: true, locked: p.ferme ? () => p.ferme : lockOf(p.vers) || null } }));
  const sp0 = old && old.spawn;
  if (old) A.afterSpawn = () => carteRecale(A, C); // après les apparitions du monde et des quêtes (game.js)
  A.spawn = function () {
    if (sp0) sp0.call(this); else this.ents = [];
    const ownDoors = (C.portes || []).length || !old; // sans portes dans la carte, la zone garde les siennes (mobile-homes du camping)
    this.ents = this.ents.filter(e => !(e instanceof Overhead) && !(ownDoors && e.isHouse) && !(typeof PaintedBridge !== 'undefined' && e instanceof PaintedBridge));
    pontSync(this, C);
    for (const p of C.ponts || []) { const bg = new PontBg(p); this.ents.push(bg, new PontFg(bg)); }
    if (ownDoors) for (const h of this.houses) this.ents.push(Object.assign(new House(h.x, h.y, Object.assign({ interior: h.id }, h.o)), { hid: h.id }));
    for (const o of C.objets || []) this.ents.push(new CarteObj(o));
    for (const o of C.objets || []) if (o.texte) this.ents.push(Object.assign(new Sign(o.x + o.w * o.s / 2, o.base, o.texte.split(/\n\s*\n/).map(t => ({ text: t.trim() })).filter(l => l.text)), { ghost: true, carteSign: true })); // pancarte de l'atelier : on lit son texte

    for (const it of C.items || []) {
      if (it.type === 'coffre') this.ents.push(new Chest(it.x, it.y, { flag: it.id || ('c_' + C.id + '_' + it.x + '_' + it.y), give: it.contenu || 'money' }));
      else if (it.type === 'pot') this.ents.push(new Pot(it.x, it.y));
      else if (it.type === 'buisson') this.ents.push(new Bush(it.x, it.y));
      else if (it.type === 'fumee') this.ents.push(Object.assign(new Fumee(it.x, it.y, it), { y: 1e9 - 5 })); // au-dessus des toits
      else if (it.type === 'panneau') this.ents.push(new Sign(it.x, it.y, [{ text: it.texte || '…' }], it.style));
    }
  };
  return A;
}
// les éléments que la zone posait pour l'ancienne carte peinte : on les accorde au nouveau décor
function carteRecale(A, C) {
  const signs = (C.objets || []).filter(o => /pancarte|panneau|sign/i.test(o.src) && !o.texte), told = (C.objets || []).filter(o => o.texte);
  if ((C.objets || []).some(o => o.lumiere)) A.ents = A.ents.filter(e => !(typeof LightSpot !== 'undefined' && e instanceof LightSpot)); // les lanternes posées remplacent les lumières invisibles de l'ancienne carte
  for (const e of A.ents) {
    if ((typeof Target !== 'undefined' && e instanceof Target) || (typeof Relay !== 'undefined' && e instanceof Relay)) e.ghost = false; // plus peints sur le fond : on les dessine
    if (e instanceof Sign && !e.carteSign && told.some(o => Math.hypot(o.x + o.w * o.s / 2 - e.x, o.base - e.y) < 48)) { e.dead = true; continue; } // la pancarte a son propre texte
    if (e instanceof Sign && e.ghost && !e.carteSign) { let best = null, bd = 48; for (const o of signs) { const d = Math.hypot(o.x + o.w * o.s / 2 - e.x, o.base - e.y); if (d < bd) { bd = d; best = o; } } if (best) { e.x = best.x + best.w * best.s / 2; e.y = best.base; } else e.dead = true; } // panneau peint sur l'ancien fond sans pancarte posée : il disparaît
    if (typeof ClockTower !== 'undefined' && e instanceof ClockTower) { const t = (C.objets || []).find(o => o.cadran); if (t) { const ix = t.flip ? t.w - t.cadran[0] : t.cadran[0]; e.dial = [Math.round((t.x + ix * t.s - e.x) * 2), Math.round((t.y + t.cadran[1] * t.s - e.y) * 2)]; } } // le cadran animé sur celui de la tour posée
    if (typeof CrowNest !== 'undefined' && e instanceof CrowNest) { let best = null, bd = 64; for (const o of C.objets || []) { if (!/arbre|tree|oak|pine|chene|sapin/i.test(o.src)) continue; const d = Math.abs(o.x + o.w * o.s / 2 - e.x) + Math.abs(o.base - e.gy) * 0.5; if (d < bd) { bd = d; best = o; } } if (best) { const dx = best.x + best.w * best.s / 2 - e.x, dy = best.base - 3 - e.gy; e.x += dx; e.gy += dy; e.y += dy; } } // le nid suit son arbre
    if (typeof PromoFlag !== 'undefined' && e instanceof PromoFlag) { const d = (C.portes || []).find(p => p.vers === e.shop); if (d) { e.x = d.x + 16; e.y = d.y + 6; } }
  }
}
function applyCartes(areas) { for (const id in CARTES) { try { areas[id] = carteArea(CARTES[id], areas[id]); } catch (e) { console.warn('carte', id, e); } } }
