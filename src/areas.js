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
// carte peinte (assets/maps/camping.png) ; la grille PAINTED.camping ne sert qu'aux collisions
const CAMP_RIFT = { x: 58 * TS, y: 22 * TS };
const CAMP_FIRE = { x: 20.5 * TS, y: 15.6 * TS }; // entre les deux bûches peintes
function buildCamp() {
  const A = new Area('camp', PAINTED.camping.map(r => r.split('')), 'camp');
  A.paint = 'map_camping'; A.bushSpots = [];
  const fire = { r: 100, c: 'rgba(255,170,80,', flick: true, warm: true };
  A.addProp('campfire', CAMP_FIRE.x, CAMP_FIRE.y, { fw: 16, fh: 6, light: fire });
  // les mobile-homes peints : celui de la famille s'ouvre, les autres sont fermés (vides depuis la faille)
  const shut = [{ text: 'Fermé à clé. Les vacanciers sont partis… ou ont disparu.' }];
  const H = (tx, ty, o) => new House(tx * TS + 8, ty * TS, Object.assign({ w: 3, d: 1, painted: true }, o));
  A.home = H(12.5, 14, { interior: 'bungalow' });
  A.bungalows = [A.home, H(27.6, 13, { locked: () => shut }), H(10.56, 26, { locked: () => shut }), H(31.56, 45, { locked: () => shut })];
  const lamps = [[34.8, 10.5], [40.2, 19.1], [11.7, 29.7], [27.3, 29.7], [50.8, 29.7], [63.7, 29.7]]; // les réverbères peints
  A.spawn = function () {
    this.ents = [];
    this.ents.push(...this.bungalows);
    for (const o of OVERHEAD.camping) this.ents.push(new Overhead('map_camping_dessus', o));
    for (const [x, y] of lamps) this.ents.push(new LightSpot(x * TS, y * TS, { r: 46, c: 'rgba(255,220,150,', oy: -22 }));
    this.ents.push(new BranchPickup(CAMP_FIRE.x - 30, CAMP_FIRE.y + 22));
    this.ents.push(Object.assign(new Sign(33.8 * TS, 6.4 * TS, [{ text: '« Camping des Lucioles — Baignade interdite la nuit. »' }, { who: '{hero}', text: 'Personne ne se baigne, de toute façon. Il n\'y a plus personne.', face: 'o' }]), { ghost: true }));
    const F = CAMP_FIRE;
    if (SAVE.boss6) { // au lever du soleil : toute la famille autour du feu
      this.ents.push(new NPC(F.x - 32, F.y + 36, { hero: () => Heroes.captive(1), talk: 'enfant1' }), new NPC(F.x + 36, F.y + 36, { hero: () => Heroes.captive(2), talk: 'enfant2' }));
      this.ents.push(new NPC(F.x - 58, F.y + 16, { sprite: 'claudine', fn: mamieTalk }), new NPC(F.x + 62, F.y + 18, { sprite: 'amandine', fn: amandineCampTalk }), Object.assign(new PapaNPC(F.x, F.y - 30), { talkId: 'papa' }));
    } else this.ents.push(new Raccoon(52 * TS, 34 * TS), new Raccoon(20 * TS, 40 * TS), new Bat(14 * TS, 33 * TS));
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
  A.start = { x: 13 * TS, y: 14.6 * TS, dir: 'down' };
  A.dawn = { x: CAMP_FIRE.x, y: CAMP_FIRE.y + 50, dir: 'up' };
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

