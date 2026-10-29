'use strict';
// ---------- les zones du jeu : camping (prologue), royaume d'Aube-Figée, grotte des lucioles ----------
// position (pixels) du bas-centre d'une tuile dans une salle : tuile (tx, ty) de la salle (rx, ry)
const T = (rx, ry, tx, ty) => ({ x: rx * ROOM_W + tx * TS + 8, y: ry * ROOM_H + (ty + 1) * TS });

// arbres, rochers, fleurs et buissons placés au hasard (graine fixe) sur l'herbe, hors zones réservées
function scatter(A, seed, keep, n) {
  // terrain des maisons : on dégage les rochers et la végétation autour et devant la porte
  if (A.houses) {
    let changed = false; keep = keep.slice();
    for (const h of A.houses) {
      const tx = Math.floor(h.x / TS), ty = Math.floor(h.y / TS), half = Math.ceil(h.o.w / 2) + 1;
      for (let y = ty - h.o.d - 2; y <= ty + 4; y++) for (let x = tx - half; x <= tx + half; x++) if (A.g[y] && A.g[y][x] === '#') { A.g[y][x] = '.'; changed = true; }
      keep.push({ x: h.x - (half + 1) * TS, y: h.y - (h.o.d + 3) * TS, w: (half * 2 + 2) * TS, h: (h.o.d + 8) * TS });
    }
    if (changed && A.rerender) A.rerender();
  }
  const r = seeded(seed), pick2 = a => a[Math.floor(r() * a.length)];
  const okAt = (x, y, pad) => {
    for (let dy = -pad; dy <= pad; dy += 8) for (let dx = -pad; dx <= pad; dx += 8) { const t = A.tileAt(x + dx, y + dy); if (t !== '.' && t !== ',') return false; }
    if (keep.some(k => x > k.x && x < k.x + k.w && y > k.y && y < k.y + k.h)) return false;
    return A.props.every(p => dist(p.x, p.y, x, y) > 30);
  };
  const place = (count, pad, fn) => { let tries = 0; while (count > 0 && tries++ < 6000) { const x = 40 + r() * (A.w - 80), y = 50 + r() * (A.h - 90); if (okAt(x, y, pad)) { fn(x, y); count--; } } };
  place(n.trees, 12, (x, y) => { const k = pick2(n.kinds || ['pine1', 'pine2', 'pine1', 'oak1', 'oak2']); if (k === 'dead') { A.decor = A.decor || []; A.decor.push(['dead', Math.round(x), Math.round(y)]); return; } A.addProp(k, Math.round(x), Math.round(y), k.startsWith('pine') ? { fw: 8, fh: 5 } : { fw: 12, fh: 6 }); });
  place(n.rocks, 6, (x, y) => A.addProp('rock', Math.round(x), Math.round(y), { fw: 10, fh: 4 }));
  place(n.flowers, 4, (x, y) => A.addProp('flowers', Math.round(x), Math.round(y), { solid: false }));
  A.bushSpots = []; const rb = seeded(seed + 5); let tries = 0;
  while (A.bushSpots.length < n.bushes && tries++ < 6000) {
    const x = 40 + rb() * (A.w - 80), y = 50 + rb() * (A.h - 90);
    if (okAt(x, y, 8) && A.bushSpots.every(b => dist(b[0], b[1], x, y) > 22)) A.bushSpots.push([Math.round(x), Math.round(y)]);
  }
}

// ---------- le camping : le prologue ----------
const CAMP_RIFT = { x: 584, y: 330 };
function buildCamp() {
  const A = new Area('camp', buildOverworld(), 'camp');
  const fire = { r: 100, c: 'rgba(255,170,80,', flick: true, warm: true };
  A.addProp('campfire', 208, 150, { fw: 16, fh: 6, light: fire });
  A.addProp('log', 176, 156, { fw: 22, fh: 6 }); A.addProp('log', 240, 156, { fw: 22, fh: 6 });
  // les bungalows : celui de la famille s'ouvre, les autres sont fermés (vides depuis la faille)
  const shut = [{ text: 'Fermé à clé. Les vacanciers sont partis… ou ont disparu.' }];
  A.home = new House(132, 118, { w: 5, d: 3, style: 'bungalow', interior: 'bungalow', roof: '#3a7a8a' });
  A.bungalows = [A.home, new House(292, 112, { w: 5, d: 3, style: 'bungalow', roof: '#8a4a3a', wall: '#e8d8c0', locked: () => shut }), new House(112, 236, { w: 5, d: 3, style: 'bungalow', roof: '#4a6a3a', wall: '#dde0d0', locked: () => shut })];
  A.addProp('table', 300, 190, { fw: 26, fh: 8 });
  const lamp = { r: 46, c: 'rgba(255,220,150,' };
  for (const [x, y] of [[356, 120], [412, 200], [120, 302], [280, 302], [520, 302], [652, 302]]) A.addProp('lamp', x, y, { fw: 4, fh: 3, light: Object.assign({ oy: -26 }, lamp) });
  scatter(A, 3, [{ x: 80, y: 50, w: 280, h: 200 }, { x: 330, y: 0, w: 110, h: 140 }, { x: 50, y: 170, w: 140, h: 130 }, { x: 540, y: 280, w: 90, h: 70 }], { trees: 26, rocks: 9, flowers: 12, bushes: 18 });
  A.spawn = function () {
    this.ents = [];
    for (const [x, y] of this.bushSpots) this.ents.push(new Bush(x, y));
    this.ents.push(...this.bungalows);
    this.ents.push(new BranchPickup(172, 176));
    this.ents.push(new Sign(346, 74, [{ text: '« Camping des Lucioles — Baignade interdite la nuit. »' }, { who: '{hero}', text: 'Personne ne se baigne, de toute façon. Il n\'y a plus personne.', face: 'o' }]));
    if (SAVE.boss6) { // au lever du soleil : toute la famille autour du feu
      this.ents.push(new NPC(176, 186, { hero: () => Heroes.captive(1), talk: 'enfant1' }), new NPC(244, 186, { hero: () => Heroes.captive(2), talk: 'enfant2' }));
      this.ents.push(new NPC(150, 166, { sprite: 'claudine', talk: 'mamie' }), new NPC(270, 168, { sprite: 'amandine', talk: 'amandineCamp' }), Object.assign(new PapaNPC(208, 120), { talkId: 'papa' }));
    } else this.ents.push(new Raccoon(640, 380), new Raccoon(300, 430), new Bat(180, 380));
    this.ents.push(new Rift(CAMP_RIFT.x, CAMP_RIFT.y, {
      lumi: true,
      active: () => true,
      near: G => { if (!SAVE.met_lumi && G.state === 'play') { Story.set('met_lumi'); Lumi.x = CAMP_RIFT.x + 20; Lumi.y = CAMP_RIFT.y - 40; G.say(Story.script('rift_see')); } },
      enter: G => {
        if (!SAVE.got_branche) { G.player.y += 18; G.say([{ who: 'Lumi', text: 'Attends ! Prends au moins la branche près du feu de camp. Il y a des bêtes de l\'autre côté.' }]); return; }
        SFX.rift();
        if (SAVE.boss6) { G.fadeTo(() => G.enter('royaume', G.areas.royaume.arrival, false), '#c8a8ff'); return; }
        Story.set('crossed_rift');
        G.fadeTo(() => { G.enter('royaume', G.areas.royaume.arrival, false); G.pending = 'arrival'; }, '#c8a8ff');
      },
    }));
  };
  A.start = { x: 132, y: 132, dir: 'down' };
  A.dawn = { x: 208, y: 200, dir: 'up' };
  A.roomDark = () => SAVE.boss6 ? 0.04 : null;
  A.sky = G => { if (SAVE.boss6) { ctx.globalAlpha = 0.16; R(0, 0, W, H, '#ffb070'); ctx.globalAlpha = 1; } };
  A.name = 'Le camping';
  A.dark = 0.58;
  return A;
}

// ---------- salles : entités qui réapparaissent quand on revient ----------
function spawnRoom(A, room) {
  A.ents = A.ents.filter(e => e.room !== room || !e.respawn);
  for (const e of A.makeRoom(room)) {
    if (e instanceof Bush && SOLID.has(A.tileAt(e.x, e.y - 2))) continue;
    e.room = room; e.respawn = true; A.ents.push(e);
  }
}
function placeFixed(A, list) { for (const [room, e] of list) { e.room = room; A.ents.push(e); } }

