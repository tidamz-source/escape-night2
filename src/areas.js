'use strict';
// ---------- les zones du jeu : camping (prologue), royaume d'Aube-Figée, grotte des lucioles ----------
// position (pixels) du bas-centre d'une tuile dans une salle : tuile (tx, ty) de la salle (rx, ry)
const T = (rx, ry, tx, ty) => ({ x: rx * ROOM_W + tx * TS + 8, y: ry * ROOM_H + (ty + 1) * TS });

// arbres, rochers, fleurs et buissons placés au hasard (graine fixe) sur l'herbe, hors zones réservées
function scatter(A, seed, keep, n) {
  const r = seeded(seed), pick2 = a => a[Math.floor(r() * a.length)];
  const okAt = (x, y, pad) => {
    for (let dy = -pad; dy <= pad; dy += 8) for (let dx = -pad; dx <= pad; dx += 8) { const t = A.tileAt(x + dx, y + dy); if (t !== '.' && t !== ',') return false; }
    if (keep.some(k => x > k.x && x < k.x + k.w && y > k.y && y < k.y + k.h)) return false;
    return A.props.every(p => dist(p.x, p.y, x, y) > 30);
  };
  const place = (count, pad, fn) => { let tries = 0; while (count > 0 && tries++ < 6000) { const x = 40 + r() * (A.w - 80), y = 50 + r() * (A.h - 90); if (okAt(x, y, pad)) { fn(x, y); count--; } } };
  place(n.trees, 12, (x, y) => { const k = pick2(['pine1', 'pine2', 'pine1', 'oak1', 'oak2']); A.addProp(k, Math.round(x), Math.round(y), k.startsWith('pine') ? { fw: 8, fh: 5 } : { fw: 12, fh: 6 }); });
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
  A.addProp('tent_r', 140, 118, { fw: 30, fh: 10 }); A.addProp('tent_b', 274, 112, { fw: 30, fh: 10 }); A.addProp('tent_y', 120, 200, { fw: 30, fh: 10 });
  A.addProp('table', 300, 190, { fw: 26, fh: 8 });
  const lamp = { r: 46, c: 'rgba(255,220,150,' };
  for (const [x, y] of [[356, 120], [412, 200], [120, 302], [280, 302], [520, 302], [652, 302]]) A.addProp('lamp', x, y, { fw: 4, fh: 3, light: Object.assign({ oy: -26 }, lamp) });
  scatter(A, 3, [{ x: 90, y: 70, w: 260, h: 180 }, { x: 330, y: 0, w: 110, h: 110 }, { x: 96, y: 200, w: 80, h: 60 }, { x: 540, y: 280, w: 90, h: 70 }], { trees: 26, rocks: 9, flowers: 12, bushes: 18 });
  A.spawn = function () {
    this.ents = [];
    for (const [x, y] of this.bushSpots) this.ents.push(new Bush(x, y));
    this.ents.push(new BranchPickup(100, 152));
    this.ents.push(new Sign(346, 74, [{ text: '« Camping des Lucioles — Baignade interdite la nuit. »' }, { who: '{hero}', text: 'Personne ne se baigne, de toute façon. Il n\'y a plus personne.', face: 'o' }]));
    this.ents.push(new Raccoon(640, 380), new Raccoon(300, 430), new Bat(180, 380));
    this.ents.push(new Rift(CAMP_RIFT.x, CAMP_RIFT.y, {
      lumi: true,
      active: () => true,
      near: G => { if (!SAVE.met_lumi && G.state === 'play') { Story.set('met_lumi'); Lumi.x = CAMP_RIFT.x + 20; Lumi.y = CAMP_RIFT.y - 40; G.say(Story.script('rift_see')); } },
      enter: G => {
        if (!SAVE.got_branche) { G.player.y += 18; G.say([{ who: 'Lumi', text: 'Attends ! Prends au moins la branche près de ta tente. Il y a des bêtes de l\'autre côté.' }]); return; }
        Story.set('crossed_rift'); SFX.rift();
        G.fadeTo(() => { G.enter('royaume', G.areas.royaume.arrival, false); G.pending = 'arrival'; }, '#c8a8ff');
      },
    }));
  };
  A.start = { x: 150, y: 142, dir: 'down' };
  A.name = 'Le camping';
  A.dark = 0.58;
  return A;
}

// ---------- le royaume : collines au nord, Bourg-Luciole au sud ----------
function buildRoyaumeArea() {
  const A = new Area('royaume', buildRoyaume(), 'camp');
  const gy = ROY.gateY * TS, P = ROY.plaza, px = (P.x + P.w / 2) * TS, py = (P.y + P.h / 2) * TS;
  const lamp = { r: 46, c: 'rgba(255,220,150,' };
  for (const [x, y] of [[px - 136, py - 56], [px + 136, py - 56], [px - 136, py + 72], [px + 136, py + 72], [px - 40, gy + 40], [px + 40, gy + 40], [px - 40, 860], [px + 40, 860]]) A.addProp('lamp', x, y, { fw: 4, fh: 3, light: Object.assign({ oy: -26 }, lamp) });
  // les maisons sont réservées avant de semer les arbres
  A.houses = [
    { x: 544, y: 592, o: { w: 6, d: 4, sign: 'library', roof: '#3a4a8a', wall: '#b8b0c8', chimney: true } },
    { x: 208, y: 592, o: { w: 6, d: 4, sign: 'inn', roof: '#8a3a3a', chimney: true } },
    { x: 128, y: 720, o: { w: 6, d: 4, sign: 'forge', roof: '#4a4450', wall: '#a8a0a8', chimney: true } },
    { x: 640, y: 720, o: { w: 6, d: 4, sign: 'shop', roof: '#a85a2a' } },
    { x: 144, y: 864, o: { w: 6, d: 4, roof: '#6a5a3a', sign: 'kitchen', chimney: true } },
    { x: 624, y: 864, o: { w: 6, d: 4, roof: '#3a6a4a' } },
  ];
  const keep = A.houses.map(h => ({ x: h.x - 60, y: h.y - 90, w: 120, h: 120 }));
  keep.push({ x: px - 180, y: py - 110, w: 360, h: 220 }, { x: 330, y: gy - 30, w: 110, h: 60 }, { x: 330, y: 820, w: 110, h: 140 }, { x: 0, y: 260, w: 140, h: 140 });
  scatter(A, 41, keep, { trees: 48, rocks: 14, flowers: 22, bushes: 34 });
  A.spawn = function () {
    this.ents = [];
    for (const [x, y] of this.bushSpots) if (y < gy - 8) this.ents.push(new Bush(x, y));
    for (const h of this.houses) this.ents.push(new House(h.x, h.y, h.o));
    this.ents.push(new Fountain(px, py + 8));
    this.ents.push(new GateBlock(px, gy + TS, 64));
    // habitants
    this.ents.push(new NPC(544, 612, { look: 'sage', talk: 'sage' }));
    this.ents.push(new NPC(208, 612, { look: 'aubergiste', talk: 'aubergiste' }));
    this.ents.push(new NPC(128, 742, { look: 'forgeron', shop: 'forge' }));
    this.ents.push(new NPC(640, 742, { look: 'epiciere', shop: 'epicerie' }));
    this.ents.push(new NPC(px - 52, gy + 30, { look: 'garde', talk: 'garde' }));
    this.ents.push(new NPC(px + 70, py - 20, { look: 'pierrette', talk: 'villageois1' }));
    this.ents.push(new NPC(250, 700, { look: 'gaspard', talk: 'villageois2' }));
    this.ents.push(new NPC(560, 770, { look: 'mahaut', talk: 'villageois3' }));
    this.ents.push(new NPC(270, 818, { look: 'forain', talk: 'forain' }), new Prop(270, 792, 'stall'));
    this.ents.push(new NPC(px + 30, py + 40, { hero: () => Heroes.captive(1), talk: 'enfant1', when: 'freed1' }));
    this.ents.push(new NPC(144, 886, { sprite: 'claudine', shop: 'cuisine', when: 'freed2' }));
    // la rivière de l'ouest : cible et pont-levis vers le Bois des murmures
    const bx = ROY.bridge.x * TS, by = ROY.bridge.y * TS;
    this.ents.push(new Target(56, by - 14, 'drawbridge', G => { G.area.syncTiles(); G.say(Story.script('bridge_down')); }));
    this.ents.push(new DrawbridgeDeco(bx - 4, by + 18));
    this.ents.push(new Sign(140, by - 6, [{ text: '« Pont-levis du Bois des murmures. Fermé par ordre du Roi Minuit. »' }, { who: '{hero}', text: 'Il y a une cible sur l\'autre rive… Si seulement je pouvais l\'atteindre.', face: 'o' }]));
    this.ents.push(new Prop(168, 734, 'anvil'), new Prop(680, 732, 'barrel'), new Prop(694, 742, 'crate'), new Prop(250, 600, 'barrel'));
    this.ents.push(new Sign(px + 36, gy - 4, [{ text: '« Collines du Nord. Au bout du sentier : la grotte des lucioles. »' }]));
    this.ents.push(new Rift(px, 928, { active: () => false, closed: 'La faille par laquelle tu es arrivé{e} s\'est refermée. Lumi dit qu\'elle se rouvrira quand le jour se lèvera.' }));
    // bestioles des collines
    this.ents.push(new Raccoon(170, 300), new Raccoon(620, 250), new Raccoon(300, 150), new Raccoon(660, 420), new Raccoon(120, 420));
    this.ents.push(new Bat(220, 110), new Bat(560, 90), new Bat(470, 300), new Shadow(430, 70));
  };
  A.syncTiles = function () {
    const want = SAVE.drawbridge ? 'b' : '~', B = ROY.bridge; let changed = false;
    for (let y = B.y; y < B.y + B.h; y++) for (let x = B.x; x < B.x + B.w; x++) if (this.g[y][x] !== want) { this.g[y][x] = want; changed = true; }
    if (changed) this.rerender();
  };
  const spawn0 = A.spawn; A.spawn = function () { this.syncTiles(); spawn0.call(this); };
  A.enemyBounds = { x: 24, y: 24, w: A.w - 48, h: gy - 40 };
  A.roomDark = () => Math.max(0.2, 0.52 - 0.05 * (SAVE.fragments || 0));
  A.arrival = { x: px, y: 892, dir: 'up' };
  A.fromCave = { x: px, y: 56, dir: 'down' };
  A.fromBois = { x: 48, y: ROY.bridge.y * TS + 24, dir: 'right' };
  A.start = { x: px, y: py + 50, dir: 'down' };
  A.name = 'Bourg-Luciole';
  A.dark = 0.52;
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

// ---------- donjon 1 : la grotte des lucioles ----------
function buildCaveArea() {
  const A = new Area('cave', buildCave(), 'cave'), R = CAVE_ROOMS;
  A.rooms = { cols: 3, rows: 3, list: [R.entry, R.arena, R.block, R.sling, R.chasm, R.boss] };
  A.map = { title: 'La grotte des lucioles', links: [[R.entry, R.arena], [R.entry, R.block], [R.entry, R.chasm], [R.block, R.sling], [R.chasm, R.boss]], boss: R.boss, bossFlag: 'boss' };
  const rxy = i => [i % 3, Math.floor(i / 3)];
  const at = (room, tx, ty) => { const [rx, ry] = rxy(room); return T(rx, ry, tx, ty); };
  const pos = (room, x, y) => { const [rx, ry] = rxy(room); return { x: rx * ROOM_W + x, y: ry * ROOM_H + y }; };
  const mk = (C, room, tx, ty, ...args) => { const p = at(room, tx, ty); return new C(p.x, p.y, ...args); };
  A.arenas = {
    [R.arena]: { flag: 'arenaW' },
    [R.boss]: {
      flag: 'boss',
      onStart(G) { const b = G.area.ents.find(e => e.isBoss); if (b) b.wake(G); G.banner = { text: 'La Grande Ombre', t: 2.2 }; },
      onClear(G) { const p = pos(R.boss, 240, 170); const h = new HeartContainer(p.x, p.y); h.room = R.boss; G.area.ents.push(h); },
    },
  };
  A.roomDark = room => room === R.boss && SAVE.boss ? 0.12 : null;
  A.makeRoom = function (room) {
    const L = [];
    if (room === R.entry) L.push(mk(Pot, room, 4, 13), mk(Pot, room, 5, 13), mk(Pot, room, 24, 13), mk(Pot, room, 25, 13), mk(Bat, room, 9, 8), mk(Bat, room, 21, 9));
    if (room === R.arena) {
      L.push(mk(Pot, room, 4, 3), mk(Pot, room, 25, 3), mk(Pot, room, 4, 13));
      if (!SAVE.arenaW) L.push(mk(Shadow, room, 8, 5), mk(Shadow, room, 21, 5), mk(Shadow, room, 14, 11), mk(Bat, room, 6, 10), mk(Bat, room, 23, 10));
    }
    if (room === R.block) {
      const b = SAVE.plateE ? mk(Block, room, 19, 6) : mk(Block, room, 8, 9);
      L.push(b, mk(Bat, room, 12, 4), mk(Bat, room, 17, 12), mk(Pot, room, 3, 13), mk(Pot, room, 26, 13));
    }
    if (room === R.sling) L.push(mk(Wisp, room, 8, 5), mk(Wisp, room, 22, 5), mk(Bat, room, 14, 12), mk(Pot, room, 3, 13), mk(Pot, room, 26, 13));
    if (room === R.chasm) L.push(mk(Wisp, room, 10, 3), mk(Shadow, room, 9, 12), mk(Bat, room, 20, 12), mk(Pot, room, 25, 13), mk(Pot, room, 26, 13), mk(Pot, room, 3, 13));
    if (room === R.boss) {
      if (!SAVE.boss) { const p = pos(R.boss, 240, 120); L.push(new GreatShadow(p.x, p.y, R.boss)); }
      L.push(mk(Pot, room, 3, 12), mk(Pot, room, 26, 12));
    }
    return L;
  };
  A.syncTiles = function () {
    const want = SAVE.bridge ? 'b' : 'v'; let changed = false;
    for (let y = CAVE_BRIDGE.y; y < CAVE_BRIDGE.y + CAVE_BRIDGE.h; y++) for (let x = CAVE_BRIDGE.x; x < CAVE_BRIDGE.x + CAVE_BRIDGE.w; x++) if (this.g[y][x] !== want) { this.g[y][x] = want; changed = true; }
    if (changed) this.rerender();
  };
  A.spawn = function () {
    this.syncTiles();
    this.ents = [];
    const door = (room, side) => {
      if (side === 'N') return pos(room, 240, 32);
      if (side === 'S') return pos(room, 240, 272);
      if (side === 'E') return pos(room, 464, 144);
      return pos(room, 16, 144);
    };
    const arenaShut = room => () => G.area.arenaOn === room;
    const d1 = door(R.entry, 'N'), d2 = door(R.arena, 'E'), d3 = door(R.block, 'N'), d4 = door(R.boss, 'S');
    const ac = pos(R.arena, 240, 150), sc = pos(R.sling, 240, 140), cg = pos(R.boss, 240, 66);
    placeFixed(this, [
      [R.entry, new KeyDoor(d1.x, d1.y, 'caveDoor')],
      [R.entry, mk(Sign, R.entry, 14, 10, [{ text: '« Grotte des lucioles. Ce qui dort au fond craint la lumière… et les cailloux bien lancés. »' }, { who: '{hero}', text: 'Des cailloux ? Il me faudrait de quoi les lancer.', face: 'o' }], 'stone')],
      [R.entry, mk(Brazier, R.entry, 11, 3)], [R.entry, mk(Brazier, R.entry, 18, 3)],
      [R.entry, mk(Chest, R.entry, 4, 3, { flag: 'caveCoins', give: 'money:20', msg: [{ text: 'Tu as trouvé 20 écus !' }] })],
      [R.arena, new Shutter(d2.x, d2.y, 'h', arenaShut(R.arena))],
      [R.arena, new Chest(ac.x, ac.y, { flag: 'caveKeyChest', reveal: 'arenaW', msg: [{ text: 'Une petite clé ! Elle ouvre une porte de cette grotte.' }] })],
      [R.arena, mk(Brazier, R.arena, 4, 7)], [R.arena, mk(Brazier, R.arena, 25, 9)],
      [R.block, new Shutter(d3.x, d3.y, 'v', () => !SAVE.plateE)],
      [R.block, mk(Scratches, R.block, 8, 9, 3)],
      [R.block, mk(Plate, R.block, 19, 6, 'plateE')],
      [R.block, mk(Brazier, R.block, 11, 3)], [R.block, mk(Brazier, R.block, 18, 3)],
      [R.sling, new Chest(sc.x, sc.y, { flag: 'slingChest', give: 'lance_pierre', big: true, msg: [{ text: 'Tu as trouvé le lance-pierre ! Et 15 cailloux pour aller avec.' }, { text: 'Bouton B : tirer, dans 8 directions. Les jarres et les buissons cachent d\'autres cailloux.' }] })],
      [R.sling, mk(Brazier, R.sling, 10, 7)], [R.sling, mk(Brazier, R.sling, 19, 7)],
      [R.chasm, mk(Crystal, R.chasm, 21, 3, 'bridge', G => G.buildBridge())],
      [R.chasm, mk(Sign, R.chasm, 11, 12, [{ text: '« Le pont dort tant que le cristal dort. »' }, { who: '{hero}', text: 'Le cristal est de l\'autre côté du gouffre… Impossible de l\'atteindre à la main.', face: 'o' }], 'stone')],
      [R.chasm, mk(Brazier, R.chasm, 4, 11)], [R.chasm, mk(Brazier, R.chasm, 25, 11)], [R.chasm, mk(Brazier, R.chasm, 5, 3)],
      [R.boss, new Shutter(d4.x, d4.y, 'v', arenaShut(R.boss))],
      [R.boss, new Cage(cg.x, cg.y, { n: 1, boss: 'boss', drawCaptive: (x, y, t) => drawHero(Heroes.captive(1), x, y, 'down', false, t) })],
      [R.boss, mk(Brazier, R.boss, 4, 3)], [R.boss, mk(Brazier, R.boss, 25, 3)], [R.boss, mk(Brazier, R.boss, 4, 13)], [R.boss, mk(Brazier, R.boss, 25, 13)],
    ]);
    if (SAVE.boss && !SAVE.heart2) { const p = pos(R.boss, 240, 170); placeFixed(this, [[R.boss, new HeartContainer(p.x, p.y)]]); }
    for (const r of this.rooms.list) spawnRoom(this, r);
  };
  const st = T(1, 2, 14, 12);
  A.start = { x: st.x + 8, y: st.y, dir: 'up' };
  A.name = 'La grotte des lucioles';
  A.dark = 0.26;
  return A;
}

// ---------- donjon 2 : le Bois des murmures ----------
function buildBoisArea() {
  const A = new Area('bois', buildBois(), 'forest'), R = BOIS_ROOMS;
  A.rooms = { cols: 3, rows: 3, list: [R.entry, R.arena, R.pond, R.mill, R.frisbee, R.switches, R.boss] };
  A.map = { title: 'Le Bois des murmures', links: [[R.entry, R.arena], [R.entry, R.pond], [R.entry, R.mill], [R.mill, R.frisbee], [R.mill, R.switches], [R.mill, R.boss]], boss: R.boss, bossFlag: 'boss2' };
  const rxy = i => [i % 3, Math.floor(i / 3)];
  const at = (room, tx, ty) => { const [rx, ry] = rxy(room); return T(rx, ry, tx, ty); };
  const pos = (room, x, y) => { const [rx, ry] = rxy(room); return { x: rx * ROOM_W + x, y: ry * ROOM_H + y }; };
  const mk = (C, room, tx, ty, ...args) => { const p = at(room, tx, ty); return new C(p.x, p.y, ...args); };
  const bush = (room, tx, ty) => Object.assign(mk(Bush, room, tx, ty), { loot: 'bushBois' });
  const pot = (room, tx, ty) => Object.assign(mk(Pot, room, tx, ty), { loot: 'potBois' });
  A.windRoom = R.mill; // le vent du moulin souffle vers le sud, par rafales
  A.arenas = {
    [R.arena]: { flag: 'arenaB' },
    [R.boss]: {
      flag: 'boss2',
      onStart(G) { const b = G.area.ents.find(e => e.isBoss); if (b) b.wake(G); G.banner = { text: 'Le Grand-Duc', t: 2.2 }; },
      onClear(G) { const p = pos(R.boss, 240, 170); const h = Object.assign(new HeartContainer(p.x, p.y), { flag: 'heart3' }); h.room = R.boss; G.area.ents.push(h); },
    },
  };
  A.roomDark = room => room === R.boss && SAVE.boss2 ? 0.12 : null;
  A.makeRoom = function (room) {
    const L = [];
    if (room === R.entry) L.push(bush(room, 4, 4), bush(room, 25, 4), bush(room, 4, 12), bush(room, 25, 12), mk(Boar, room, 20, 8), mk(Crow, room, 9, 6), mk(Crow, room, 20, 5));
    if (room === R.arena) { L.push(pot(room, 4, 3), pot(room, 25, 3), pot(room, 4, 13)); if (!SAVE.arenaB) L.push(mk(Boar, room, 6, 8), mk(Boar, room, 23, 8), mk(Squirrel, room, 14, 4), mk(Squirrel, room, 10, 12)); }
    if (room === R.pond) L.push(mk(Crow, room, 6, 4), mk(Crow, room, 24, 4), mk(Squirrel, room, 25, 12), bush(room, 4, 13), bush(room, 25, 13), bush(room, 4, 3));
    if (room === R.mill) L.push(mk(Boar, room, 15, 5), mk(Squirrel, room, 4, 3), mk(Squirrel, room, 25, 12), bush(room, 3, 13), bush(room, 26, 3), pot(room, 26, 13));
    if (room === R.frisbee) L.push(mk(Crow, room, 8, 7), mk(Crow, room, 21, 7), mk(Boar, room, 14, 12), pot(room, 3, 3), pot(room, 26, 3));
    if (room === R.switches) L.push(mk(Squirrel, room, 14, 4), mk(Squirrel, room, 14, 11), mk(Boar, room, 6, 11), bush(room, 3, 13), bush(room, 26, 13));
    if (room === R.boss) { if (!SAVE.boss2) { const p = pos(R.boss, 240, 130); L.push(new GreatOwl(p.x, p.y, R.boss)); } L.push(pot(room, 3, 12), pot(room, 26, 12)); }
    return L;
  };
  A.spawn = function () {
    this.ents = [];
    const door = (room, side) => side === 'N' ? pos(room, 240, 32) : side === 'S' ? pos(room, 240, 272) : side === 'E' ? pos(room, 464, 144) : pos(room, 16, 144);
    const arenaShut = room => () => G.area.arenaOn === room;
    const dN = door(R.entry, 'N'), dA = door(R.arena, 'E'), dE = door(R.mill, 'E'), dB = door(R.mill, 'N'), dS = door(R.boss, 'S');
    const ac = pos(R.arena, 240, 150), fc = pos(R.frisbee, 240, 140), cg = pos(R.boss, 240, 66), isl = pos(R.pond, 240, 144);
    const shrooms = (room, pts) => pts.map(([x, y]) => [room, mk(Glowshroom, room, x, y)]);
    placeFixed(this, [
      [R.entry, new KeyDoor(dN.x, dN.y, 'boisDoor1')],
      [R.entry, mk(Sign, R.entry, 14, 10, [{ text: '« Bois des murmures. Le vent du vieux moulin ne souffle jamais longtemps. »' }])],
      [R.arena, new Shutter(dA.x, dA.y, 'h', arenaShut(R.arena))],
      [R.arena, new Chest(ac.x, ac.y, { flag: 'boisKeyChest', reveal: 'arenaB', msg: [{ text: 'Une petite clé ! Elle ouvre une porte de ce bois.' }] })],
      [R.pond, new KeyPickup(isl.x, isl.y, 'boisKey2')],
      [R.pond, mk(Sign, R.pond, 14, 13, [{ text: '« Ce qui brille sur l\'îlot ne se rapporte qu\'en volant. »' }, { who: '{hero}', text: 'Une clé, là-bas… Trop loin pour nager.', face: 'o' }])],
      [R.mill, new KeyDoor(dE.x, dE.y, 'boisDoor2')],
      [R.mill, new Shutter(dB.x, dB.y, 'v', () => !SAVE.switchesB)],
      [R.mill, mk(Sign, R.mill, 14, 13, [{ text: '« Au nord, le nid du Grand-Duc. La grille ne s\'ouvre que lorsque brillent les deux lanternes de l\'est. »' }])],
      [R.frisbee, new Chest(fc.x, fc.y, { flag: 'frisbeeChest', give: 'frisbee', big: true, msg: [{ text: 'Tu as trouvé le frisbee !' }, { text: 'Bouton B : il part en arc et revient. Il étourdit les ennemis, rapporte les objets et passe au-dessus des souches et de l\'eau.' }, { text: 'Change d\'outil avec E, les gâchettes LB/RB, ou en touchant la case B.' }] })],
      [R.switches, mk(FrisbeeSwitch, R.switches, 8, 4, 'switchesB')], [R.switches, mk(FrisbeeSwitch, R.switches, 21, 4, 'switchesB')],
      [R.switches, mk(Sign, R.switches, 14, 9, [{ text: '« Deux lanternes, un seul souffle. Elles ne brillent ensemble que quelques secondes. »' }])],
      [R.boss, new Shutter(dS.x, dS.y, 'v', arenaShut(R.boss))],
      [R.boss, new Cage(cg.x, cg.y, { n: 2, boss: 'boss2', drawCaptive: (x, y) => drawSprite('claudine', x, y) })],
      ...shrooms(R.entry, [[3, 7], [26, 9]]), ...shrooms(R.arena, [[3, 8], [26, 6]]), ...shrooms(R.pond, [[3, 6], [26, 8]]),
      ...shrooms(R.mill, [[3, 8], [26, 6]]), ...shrooms(R.frisbee, [[9, 9], [20, 9]]), ...shrooms(R.switches, [[3, 8], [26, 8]]),
      ...shrooms(R.boss, [[3, 3], [26, 3], [3, 13], [26, 13]]),
    ]);
    if (SAVE.boss2 && !SAVE.heart3) { const p = pos(R.boss, 240, 170); placeFixed(this, [[R.boss, Object.assign(new HeartContainer(p.x, p.y), { flag: 'heart3' })]]); }
    for (const r of this.rooms.list) spawnRoom(this, r);
  };
  const st = T(1, 2, 14, 12);
  A.start = { x: st.x + 8, y: st.y, dir: 'up' };
  A.name = 'Le Bois des murmures';
  A.dark = 0.36;
  return A;
}
