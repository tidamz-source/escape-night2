'use strict';
// ---------- construction générique d'un donjon ----------
// spec : {
//   id, name, theme, cols, rows, seed, rough, moss, dark,
//   rooms: { nom: [rx, ry] },  entry: 'nom' (sortie au sud), boss: 'nom', bossFlag,
//   links: [[a, b, porte?]] — porte : { key: 'drapeau' } | { big: true } | { shut: G => fermé? } | { crack: 'drapeau' } | { arena: true } ; at: 'a' | 'b' (côté où se trouve la porte, 'a' par défaut)
//   tiles(room, g) : décor de tuiles, salle par salle (room('nom') → set / rect / get en coordonnées locales)
//   arenas: { nom: { flag, onStart, onClear } }, make(nom, L, h) : entités qui réapparaissent, fixed(h) : entités fixes,
// }
// h : aides (at(nom, tx, ty), pos(nom, x, y), mk(Classe, nom, tx, ty, ...), pot(nom, tx, ty), R (index des salles))
class BigKeyDoor { // porte de la salle du boss : grande clé
  constructor(x, y, dungeon) { this.x = x; this.y = y; this.d = dungeon; this.flag = 'bigdoor_' + dungeon; this.w = 32; this.h = 32; this.solid = true; this.t = 0; this.light = { r: 40, c: 'rgba(255,180,90,' }; }
  get dead() { return !!SAVE[this.flag]; }
  canInteract() { return true; }
  interact(G) {
    if (SAVE['bigkey_' + this.d]) { SAVE[this.flag] = true; persist(); SFX.door(); setTimeout(() => SFX.secret(), 200); G.shake = 0.4; G.parts.burst(this.x, this.y - 16, 30, { c: ['#c8a040', '#ffe27a', '#fff', '#8a5a2c'], life: 0.9, smin: 20, smax: 100, r: 2, g: 80 }); }
    else { SFX.locked(); G.say([{ text: 'Une porte immense, fermée par une grosse serrure dorée. Il faut la grande clé de ce donjon.' }]); }
  }
  update(dt) { this.t += dt; }
  draw() {
    hi(this.x, this.y, false, () => {
      D(-32, -64, 64, 64, '#3a1a10'); for (let i = 0; i < 4; i++) { D(-30 + i * 15, -62, 13, 62, '#7a3a24'); D(-30 + i * 15, -62, 2, 62, '#9a5a34'); }
      D(-32, -54, 64, 6, '#c8a040'); D(-32, -16, 64, 6, '#c8a040'); D(-32, -54, 64, 2, '#ffe27a');
      const g = Math.sin(this.t * 3) > 0.5 ? '#fff2c0' : '#ffd23a';
      D(-14, -44, 28, 26, g); D(-14, -44, 28, 3, '#fff'); D(-10, -40, 20, 18, '#c08a10'); D(-3, -36, 6, 6, '#3a2410'); D(-2, -31, 4, 8, '#3a2410');
      D(-20, -70, 40, 8, '#c8a040'); D(-6, -78, 12, 8, '#ffd23a');
    });
  }
}
function makeDungeon(spec) {
  const C = spec.cols || 4, Rw = spec.rows || 4, names = Object.keys(spec.rooms);
  const idx = n => { const [rx, ry] = spec.rooms[n]; return ry * C + rx; };
  const R = {}; for (const n of names) R[n] = idx(n);
  // passages entre salles
  const links = [], doors = [];
  for (const L of spec.links) {
    const [a, b, door] = L, [ax, ay] = spec.rooms[a], [bx, by] = spec.rooms[b];
    if (ax === bx && ay === by + 1) { links.push([ax, ay, 'N']); doors.push({ a, b, dir: 'N', door }); }
    else if (ax === bx && ay === by - 1) { links.push([bx, by, 'N']); doors.push({ a: b, b: a, dir: 'N', door, flip: true }); }
    else if (ay === by && ax === bx - 1) { links.push([ax, ay, 'E']); doors.push({ a, b, dir: 'E', door }); }
    else if (ay === by && ax === bx + 1) { links.push([bx, by, 'E']); doors.push({ a: b, b: a, dir: 'E', door, flip: true }); }
    else throw new Error('salles non voisines : ' + a + ' / ' + b);
  }
  const grid = buildDungeon({
    cols: C, rows: Rw, seed: spec.seed, rough: spec.rough, moss: spec.moss,
    rooms: names.map(n => spec.rooms[n]), links, exit: spec.rooms[spec.entry],
    decorate(room, g) { if (spec.tiles) spec.tiles(n => { const [rx, ry] = spec.rooms[n]; return room(rx, ry); }, g); },
  });
  const A = new Area(spec.id, grid, spec.theme);
  A.dungeon = spec.id;
  A.rooms = { cols: C, rows: Rw, list: names.map(idx) };
  A.map = { title: spec.name, links: spec.links.map(([a, b]) => [idx(a), idx(b)]), boss: idx(spec.boss), bossFlag: spec.bossFlag };
  const rxy = i => [i % C, Math.floor(i / C)];
  const h = {
    R,
    at: (n, tx, ty) => { const [rx, ry] = spec.rooms[n]; return T(rx, ry, tx, ty); },
    pos: (n, x, y) => { const [rx, ry] = spec.rooms[n]; return { x: rx * ROOM_W + x, y: ry * ROOM_H + y }; },
  };
  h.mk = (Cl, n, tx, ty, ...args) => { const p = h.at(n, tx, ty); return new Cl(p.x, p.y, ...args); };
  h.pot = (n, tx, ty) => Object.assign(h.mk(Pot, n, tx, ty), { loot: spec.potLoot || 'pot' });
  h.door = (n, side) => side === 'N' ? h.pos(n, 240, 32) : side === 'S' ? h.pos(n, 240, 272) : side === 'E' ? h.pos(n, 464, 144) : h.pos(n, 16, 144);
  // arènes
  A.arenas = {};
  for (const [n, ar] of Object.entries(spec.arenas || {})) A.arenas[idx(n)] = ar;
  A.roomDark = room => room === idx(spec.boss) && SAVE[spec.bossFlag] ? 0.12 : (spec.roomDark ? spec.roomDark(room, R) : null);
  A.makeRoom = function (room) { const n = names.find(k => idx(k) === room), L = []; if (spec.make) spec.make(n, L, h); for (const e of L) if (!e.loot && e instanceof Pot) e.loot = spec.potLoot || 'pot'; return L; };
  if (spec.syncTiles) A.syncTiles = spec.syncTiles;
  A.spawn = function () {
    if (this.syncTiles) this.syncTiles();
    this.ents = [];
    const list = [];
    // portes des passages
    for (const d of doors) {
      if (!d.door) continue;
      const host = d.door.at === 'b' ? (d.flip ? d.a : d.b) : (d.flip ? d.b : d.a);
      // côté de la porte dans la salle hôte
      const side = d.dir === 'N' ? (host === d.a ? 'N' : 'S') : (host === d.a ? 'E' : 'W');
      const p = h.door(host, side), vert = d.dir === 'N';
      let e = null;
      if (d.door.key) e = new KeyDoor(p.x, p.y, d.door.key);
      else if (d.door.big) e = new BigKeyDoor(p.x, p.y, spec.id);
      else if (d.door.crack) e = new CrackedWall(p.x, p.y, d.door.crack);
      else if (d.door.seal) e = new SealGate(p.x, p.y);
      else if (d.door.shut) e = new Shutter(p.x, p.y, vert ? 'v' : 'h', d.door.shut);
      else if (d.door.arena) { const room = idx(host); e = new Shutter(p.x, p.y, vert ? 'v' : 'h', () => G.area.arenaOn === room); }
      if (e) list.push([idx(host), e]);
    }
    if (spec.fixed) for (const [n, e] of spec.fixed(h)) list.push([idx(n), e]);
    placeFixed(this, list);
    if (SAVE[spec.bossFlag] && !SAVE[spec.heartFlag]) { const p = h.pos(spec.boss, 240, spec.heartY || 170); placeFixed(this, [[idx(spec.boss), Object.assign(new HeartContainer(p.x, p.y), { flag: spec.heartFlag })]]); }
    for (const r of this.rooms.list) spawnRoom(this, r);
  };
  // le cœur de fin de boss
  const bossAr = A.arenas[idx(spec.boss)];
  if (bossAr && !bossAr.onClear) bossAr.onClear = G => { const p = h.pos(spec.boss, 240, spec.heartY || 170); const hc = Object.assign(new HeartContainer(p.x, p.y), { flag: spec.heartFlag }); hc.room = idx(spec.boss); G.area.ents.push(hc); };
  const st = h.at(spec.entry, 14, 12);
  A.start = { x: st.x + 8, y: st.y, dir: 'up' };
  A.exits = { E: G => { const z = G.areas[spec.zone]; G.enter(spec.zone, z.fromDungeon); } };
  A.name = spec.name; A.dark = spec.dark != null ? spec.dark : 0.3;
  A.h = h;
  if (spec.after) spec.after(A, h);
  return A;
}
// arène standard : les ennemis de la salle, puis un coffre apparaît
const arenaStd = (flag) => ({ flag });
const bossArena = (flag, label) => ({ flag, onStart(G) { const b = G.area.ents.find(e => e.isBoss && e.room === G.room); if (b) b.wake(G); G.banner = { text: label, t: 2.2 }; } });
