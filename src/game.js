'use strict';
// position (pixels) du bas-centre d'une tuile dans une salle : tuile (tx, ty) de la salle (rx, ry)
const T = (rx, ry, tx, ty) => ({ x: rx * ROOM_W + tx * TS + 8, y: ry * ROOM_H + (ty + 1) * TS });

// ---------- construction des zones ----------
function buildCamp() {
  const A = new Area('camp', buildOverworld(), 'camp');
  const fire = { r: 100, c: 'rgba(255,170,80,', flick: true, warm: true };
  A.addProp('campfire', 208, 150, { fw: 16, fh: 6, light: fire });
  A.addProp('log', 176, 156, { fw: 22, fh: 6 }); A.addProp('log', 240, 156, { fw: 22, fh: 6 });
  A.addProp('tent_r', 140, 118, { fw: 30, fh: 10 }); A.addProp('tent_b', 274, 112, { fw: 30, fh: 10 }); A.addProp('tent_y', 120, 200, { fw: 30, fh: 10 });
  A.addProp('table', 300, 190, { fw: 26, fh: 8 });
  const lamp = { r: 46, c: 'rgba(255,220,150,' };
  for (const [x, y] of [[356, 120], [412, 200], [120, 302], [280, 302], [520, 302], [652, 302]]) A.addProp('lamp', x, y, { fw: 4, fh: 3, light: Object.assign({ oy: -26 }, lamp) });
  // arbres et rochers placés au hasard (graine fixe), hors chemins / campement / lac
  const r = seeded(3), keep = [{ x: 90, y: 70, w: 260, h: 180 }, { x: 330, y: 0, w: 110, h: 110 }, { x: 96, y: 200, w: 80, h: 60 }];
  const okAt = (x, y, pad) => {
    for (let dy = -pad; dy <= pad; dy += 8) for (let dx = -pad; dx <= pad; dx += 8) { const t = A.tileAt(x + dx, y + dy); if (t !== '.' && t !== ',') return false; }
    if (keep.some(k => x > k.x && x < k.x + k.w && y > k.y && y < k.y + k.h)) return false;
    return A.props.every(p => dist(p.x, p.y, x, y) > 30);
  };
  const place = (n, pad, fn) => { let tries = 0; while (n > 0 && tries++ < 4000) { const x = 40 + r() * (A.w - 80), y = 70 + r() * (A.h - 120); if (okAt(x, y, pad)) { fn(x, y); n--; } } };
  place(26, 12, (x, y) => { const k = pick2(['pine1', 'pine2', 'pine1', 'oak1', 'oak2']); A.addProp(k, Math.round(x), Math.round(y), k.startsWith('pine') ? { fw: 8, fh: 5 } : { fw: 12, fh: 6 }); });
  place(9, 6, (x, y) => A.addProp('rock', Math.round(x), Math.round(y), { fw: 10, fh: 4 }));
  place(12, 4, (x, y) => A.addProp('flowers', Math.round(x), Math.round(y), { solid: false }));
  function pick2(a) { return a[Math.floor(r() * a.length)]; }
  // positions des buissons (recalculées une fois, recréés à chaque entrée)
  A.bushSpots = []; const rb = seeded(8);
  let tries = 0;
  while (A.bushSpots.length < 18 && tries++ < 4000) {
    const x = 40 + rb() * (A.w - 80), y = 70 + rb() * (A.h - 120);
    if (okAt(x, y, 8) && A.bushSpots.every(b => dist(b[0], b[1], x, y) > 22)) A.bushSpots.push([Math.round(x), Math.round(y)]);
  }
  A.spawn = function () {
    this.ents = [];
    for (const [x, y] of this.bushSpots) this.ents.push(new Bush(x, y));
    this.ents.push(new Sign(346, 74, [{ text: '« FORÊT DES OMBRES — Interdit aux enfants après 22 h. »' }, { who: 'Sacha', text: 'Il est quelle heure, déjà ?' }]));
    this.ents.push(new Raccoon(470, 330), new Raccoon(640, 360), new Raccoon(300, 430));
    this.ents.push(new Bat(530, 120), new Bat(180, 380));
  };
  A.start = { x: 150, y: 224, dir: 'down' };
  A.fromForest = { x: 384, y: 54, dir: 'down' };
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

function buildForestArea() {
  const A = new Area('forest', buildForest(), 'forest');
  A.rooms = { cols: 1, rows: 2, list: [0, 1] };
  A.makeRoom = function (room) {
    if (room === 0) return [new Shadow(100, 80), new Shadow(380, 80), new Shadow(100, 200), new Shadow(380, 200), new Wisp(240, 64), new Bush(60, 230), new Bush(420, 230), new Bush(60, 50), new Bush(420, 50)];
    return [new Shadow(100, 340), new Shadow(380, 450), new Wisp(380, 340), new Bush(56, 480), new Bush(424, 480), new Bush(56, 330), new Bush(160, 500), new Bush(320, 500)];
  };
  A.spawn = function () {
    this.ents = [];
    placeFixed(this, [
      [1, new Chest(240, 414, { flag: 'chest', msg: [{ text: 'Tu as trouvé une petite clé ! Elle doit ouvrir une porte de cette forêt.' }] })],
      [1, new KeyDoor(240, 304, 'door')],
      [0, new FireflyHeart(240, 134)],
    ]);
    for (const r of this.rooms.list) spawnRoom(this, r);
  };
  A.start = { x: 240, y: 500, dir: 'up' };
  A.fromCave = { x: 240, y: 60, dir: 'down' };
  A.name = 'La forêt des ombres';
  A.dark = 0.72;
  return A;
}

function buildCaveArea() {
  const A = new Area('cave', buildCave(), 'cave'), R = CAVE_ROOMS;
  A.rooms = { cols: 3, rows: 3, list: [R.entry, R.arena, R.block, R.sling, R.chasm, R.boss] };
  const rxy = i => [i % 3, Math.floor(i / 3)];
  const at = (room, tx, ty) => { const [rx, ry] = rxy(room), p = T(rx, ry, tx, ty); return p; };
  const pos = (room, x, y) => { const [rx, ry] = rxy(room); return { x: rx * ROOM_W + x, y: ry * ROOM_H + y }; };
  const mk = (C, room, tx, ty, ...args) => { const p = at(room, tx, ty); return new C(p.x, p.y, ...args); };
  // arènes : les volets se ferment tant qu'il reste des ennemis
  A.arenas = {
    [R.arena]: { flag: 'arenaW' },
    [R.boss]: {
      flag: 'boss',
      onStart(G) { const b = G.area.ents.find(e => e.isBoss); if (b) b.wake(G); G.banner = { text: 'La Grande Ombre', t: 2.2 }; },
      onClear(G) { const p = pos(R.boss, 240, 150); const h = new HeartContainer(p.x, p.y); h.room = R.boss; G.area.ents.push(h); },
    },
  };
  A.roomDark = room => room === R.boss && SAVE.boss ? 0.45 : room === R.sling && SAVE.slingshot ? 0.74 : null;
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
    if (room === R.chasm) L.push(mk(Wisp, room, 10, 3), mk(Shadow, room, 9, 12), mk(Bat, room, 20, 12), mk(Pot, room, 25, 13), mk(Pot, room, 26, 13));
    if (room === R.boss && !SAVE.boss) { const p = pos(R.boss, 240, 110); L.push(new GreatShadow(p.x, p.y, R.boss)); }
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
    const door = (room, side) => { // position (bas-centre) d'un passage de 2 tuiles dans le mur d'une salle
      if (side === 'N') return pos(room, 240, 32);
      if (side === 'S') return pos(room, 240, 272);
      if (side === 'E') return pos(room, 464, 144);
      return pos(room, 16, 144);
    };
    const arenaShut = room => () => G.area.arenaOn === room;
    const d1 = door(R.entry, 'N'), d2 = door(R.arena, 'E'), d3 = door(R.block, 'N'), d4 = door(R.boss, 'S');
    placeFixed(this, [
      [R.entry, new KeyDoor(d1.x, d1.y, 'caveDoor')],
      [R.entry, mk(Sign, R.entry, 14, 10, [{ text: '« Grotte des lucioles. Ce qui dort au fond craint la lumière… et les cailloux bien lancés. »' }, { who: 'Sacha', text: 'Des cailloux ? Il me faudrait de quoi les lancer.' }], 'stone')],
      [R.entry, mk(Brazier, R.entry, 11, 3)], [R.entry, mk(Brazier, R.entry, 18, 3)],
      [R.arena, new Shutter(d2.x, d2.y, 'h', arenaShut(R.arena))],
      [R.arena, new Chest(pos(R.arena, 240, 150).x, pos(R.arena, 240, 150).y, { flag: 'caveKeyChest', reveal: 'arenaW', msg: [{ text: 'Une petite clé ! Elle ouvre une porte de cette grotte.' }] })],
      [R.arena, mk(Brazier, R.arena, 4, 7)], [R.arena, mk(Brazier, R.arena, 25, 9)],
      [R.block, new Shutter(d3.x, d3.y, 'v', () => !SAVE.plateE)],
      [R.block, mk(Plate, R.block, 19, 6, 'plateE')],
      [R.block, mk(Brazier, R.block, 11, 3)], [R.block, mk(Brazier, R.block, 18, 3)],
      [R.sling, new Chest(pos(R.sling, 240, 140).x, pos(R.sling, 240, 140).y, { flag: 'slingChest', give: 'sling', big: true, msg: [{ text: 'Tu as trouvé le lance-pierre !' }, { text: 'Appuie sur B pour tirer un caillou. Parfait pour toucher ce qui est hors de portée.' }] })],
      [R.sling, mk(Brazier, R.sling, 10, 7)], [R.sling, mk(Brazier, R.sling, 19, 7)],
      [R.chasm, mk(Crystal, R.chasm, 21, 3, 'bridge', G => G.buildBridge())],
      [R.chasm, mk(Sign, R.chasm, 11, 12, [{ text: '« Le pont dort tant que le cristal dort. »' }, { who: 'Sacha', text: 'Le cristal est de l\'autre côté du gouffre… Impossible de l\'atteindre à la branche.' }], 'stone')],
      [R.chasm, mk(Brazier, R.chasm, 4, 11)], [R.chasm, mk(Brazier, R.chasm, 25, 11)], [R.chasm, mk(Brazier, R.chasm, 5, 3)],
      [R.boss, new Shutter(d4.x, d4.y, 'v', arenaShut(R.boss))],
      [R.boss, mk(Brazier, R.boss, 4, 3)], [R.boss, mk(Brazier, R.boss, 25, 3)], [R.boss, mk(Brazier, R.boss, 4, 13)], [R.boss, mk(Brazier, R.boss, 25, 13)],
    ]);
    if (SAVE.boss && !SAVE.heart2) { const p = pos(R.boss, 240, 150); placeFixed(this, [[R.boss, new HeartContainer(p.x, p.y)]]); }
    for (const r of this.rooms.list) spawnRoom(this, r);
  };
  const st = T(1, 2, 14, 12);
  A.start = { x: st.x + 8, y: st.y, dir: 'up' };
  A.name = 'La grotte des lucioles';
  A.dark = 0.74;
  return A;
}

// ---------- le jeu ----------
const G = {
  state: 'boot', t: 0, areas: {}, area: null, player: null, parts: new Parts(),
  cam: { x: 0, y: 0 }, shake: 0, hitstop: 0, dialog: null, fade: null, slide: null, room: 1,
  raised: null, menu: 0, banner: null, flies: [], view: 'title',

  init() {
    this.areas.camp = buildCamp(); this.areas.forest = buildForestArea(); this.areas.cave = buildCaveArea();
    for (let i = 0; i < 26; i++) this.flies.push({ x: rand(0, this.areas.camp.w), y: rand(0, this.areas.camp.h), p: rand(0, 6), s: rand(0.4, 1) });
    this.light = document.createElement('canvas'); this.light.width = W * SC; this.light.height = H * SC; this.lctx = this.light.getContext('2d');
    this.state = 'title'; this.view = 'title'; this.menu = 0;
  },

  newGame() { const muted = SAVE.muted; SAVE = defaultSave(); SAVE.muted = muted; SAVE.started = true; persist(); this.enter('camp', this.areas.camp.start, true); this.intro = true; },
  continueGame() { const id = this.areas[SAVE.lastArea] ? SAVE.lastArea : 'camp'; this.enter(id, this.areas[id].start, true); },

  enter(id, pos, fresh) {
    this.area = this.areas[id]; this.area.arenaOn = null;
    this.room = this.area.rooms ? this.roomOf(pos.x, pos.y) : 0;
    this.area.spawn();
    const hp = this.player && !fresh ? this.player.hp : SAVE.maxHp;
    this.player = new Player(pos.x, pos.y, pos.dir); this.player.hp = hp;
    this.parts.a = []; this.raised = null; this.slide = null;
    SAVE.lastArea = id; this.visit(); persist();
    this.banner = { text: this.area.name, t: 2.2 };
    this.state = 'play'; this.view = 'world'; this.updateCam(true);
    if (id === 'cave' && !SAVE.caveIntro) { SAVE.caveIntro = true; persist(); this.say([{ who: 'Sacha', text: 'Une grotte… et des braseros allumés. Qui a bien pu les allumer ?' }, { who: 'Sacha', text: 'Les lucioles s\'enfoncent tout au fond. Je les suis.' }]); }
  },
  visit() { if (this.area.rooms) { SAVE.visited = SAVE.visited || {}; SAVE.visited[this.area.id + this.room] = 1; } },
  fadeTo(fn) { if (this.fade) return; this.fade = { t: 0, dir: 1, fn }; this.state = 'fade'; },

  roomOf(x, y) {
    const A = this.area, rx = Math.floor(x / ROOM_W), ry = Math.floor((y - 3) / ROOM_H);
    if (rx < 0 || ry < 0 || rx >= A.rooms.cols || ry >= A.rooms.rows) return this.room;
    return ry * A.rooms.cols + rx;
  },
  roomRect(room = this.room) {
    const A = this.area;
    if (!A.rooms) return { x: 0, y: 0, w: A.w, h: A.h };
    return { x: (room % A.rooms.cols) * ROOM_W, y: Math.floor(room / A.rooms.cols) * ROOM_H, w: ROOM_W, h: ROOM_H };
  },
  inRoom(e) { return e.room == null || !this.area.rooms || e.room === this.room; },
  updateCam(snap) {
    const P = this.player, A = this.area;
    if (A.rooms) { const rr = this.roomRect(); this.cam.x = rr.x; this.cam.y = rr.y + 1; return; }
    const tx = clamp(P.x - W / 2, 0, A.w - W), ty = clamp(P.y - 12 - H / 2, 0, A.h - H);
    this.cam.x = tx; this.cam.y = ty;
  },

  // ---------- interactions ----------
  interactTarget(P) {
    const fb = P.frontBox();
    for (const e of this.area.ents) if (!e.dead && e.canInteract && e.canInteract(P) && rectHit(fb, boxOf(e))) return e;
    return null;
  },
  frontEnt(P, pred) { const fb = P.frontBox(); return this.area.ents.find(e => !e.dead && pred(e) && rectHit(fb, boxOf(e))) || null; },
  bumped(P) {
    const door = this.frontEnt(P, e => e instanceof KeyDoor);
    if (door) {
      P.bump = 1.5;
      if (SAVE.keys > 0) door.unlock(this); else { SFX.locked(); this.say([{ text: 'C\'est fermé à clé.' }]); }
    }
  },
  attackHits(P) {
    const b = P.atkBox();
    for (const e of this.area.ents) {
      if (e.dead || !e.hit || P.atkHit.has(e) || e.isShot || !this.inRoom(e)) continue;
      if (rectHit(b, e.body ? e.body() : boxOf(e))) { P.atkHit.add(e); e.hit(1, P.x, P.y - 10, this, 'branch'); }
    }
  },
  blockMoved(b) {
    for (const p of this.area.ents) {
      if (!(p instanceof Plate) || SAVE[p.flag]) continue;
      if (Math.abs(b.x - p.x) < 1 && Math.abs(b.y - p.y) < 1) { SAVE[p.flag] = true; persist(); SFX.secret(); this.shake = 0.2; }
    }
  },
  buildBridge() {
    SAVE.bridge = true; persist(); this.area.syncTiles(); this.shake = 0.4;
    setTimeout(() => SFX.secret(), 300);
    const bx = CAVE_BRIDGE.x * TS, by = CAVE_BRIDGE.y * TS;
    for (let i = 0; i < 4; i++) this.parts.burst(bx + 16, by + i * 16 + 8, 8, { c: ['#8a5a34', '#b07a48', '#8ff3ea', '#fff'], life: 0.7, smin: 10, smax: 50, r: 2 });
  },
  checkArena() {
    const A = this.area; if (!A.arenas) return;
    const ar = A.arenas[this.room]; if (!ar || SAVE[ar.flag]) return;
    const alive = A.ents.some(e => e.isEnemy && !e.dead && e.room === this.room);
    if (alive && A.arenaOn !== this.room) {
      const rr = this.roomRect(), P = this.player;
      if (P.x > rr.x + 34 && P.x < rr.x + rr.w - 34 && P.y > rr.y + 40 && P.y < rr.y + rr.h - 40) { A.arenaOn = this.room; if (ar.onStart) ar.onStart(this); }
    } else if (!alive) { // tous vaincus (même depuis l'embrasure de la porte)
      A.arenaOn = null; SAVE[ar.flag] = true; persist(); SFX.secret();
      if (ar.onClear) ar.onClear(this);
    }
  },
  say(lines, done) { this.dialog = { lines, i: 0, c: 0, done }; this.state = 'dialog'; },
  raise(kind, x, y) { this.raised = { kind, t: 1.6 }; },
  gameOver() { this.state = 'over'; this.overT = 0; this.menu = 0; },
  ending() { SAVE.chapterDone = true; persist(); this.fadeTo(() => { this.state = 'end'; this.view = 'end'; this.endT = 0; }); },

  // ---------- boucle ----------
  update(dt) {
    this.t += dt;
    if (this.banner) { this.banner.t -= dt; if (this.banner.t <= 0) this.banner = null; }
    switch (this.state) {
      case 'title': return this.updateTitle();
      case 'fade': return this.updateFade(dt);
      case 'dialog': this.parts.update(dt); return this.updateDialog(dt);
      case 'pause': return this.updatePause();
      case 'over': this.overT += dt; return this.updateOver();
      case 'end': this.endT += dt; if (this.endT > 1 && Input.anyPressed()) { SFX.menu(); this.state = 'title'; this.view = 'title'; this.menu = 0; } return;
      case 'slide': return this.updateSlide(dt);
      case 'play': return this.updatePlay(dt);
    }
  },
  updatePlay(dt) {
    if (this.intro) { this.intro = false; this.say([{ who: 'Sacha', text: 'Encore ce bruit… Ça vient de la forêt, au nord du camping.' }, { who: 'Sacha', text: 'Je prends une branche. Juste au cas où.' }, { text: 'A : coup de branche / parler. Avance vers le nord !' }]); return; }
    if (Input.pressed('start')) { SFX.menu(); this.state = 'pause'; this.menu = 0; return; }
    if (this.hitstop > 0) { this.hitstop -= dt; return; }
    if (this.shake > 0) this.shake -= dt;
    if (this.raised) { this.raised.t -= dt; if (this.raised.t <= 0) this.raised = null; }
    const P = this.player, A = this.area;
    P.update(dt, this);
    for (const e of A.ents) {
      if (e.dead || !e.update || !this.inRoom(e)) continue;
      e.update(dt, this);
    }
    A.ents = A.ents.filter(e => !e.dead);
    this.checkArena();
    this.parts.update(dt);
    if (this.state !== 'play') return;
    // transitions entre zones
    const t = A.tileAt(P.x, P.y - 1);
    if (A.id === 'camp' && t === 'F') this.fadeTo(() => this.enter('forest', this.areas.forest.start));
    if (A.id === 'forest' && t === 'E') this.fadeTo(() => this.enter('camp', this.areas.camp.fromForest));
    if (A.id === 'forest' && t === 'G') this.fadeTo(() => this.enter('cave', this.areas.cave.start));
    if (A.id === 'cave' && t === 'E') this.fadeTo(() => this.enter('forest', this.areas.forest.fromCave));
    if (this.fade) return;
    // passage d'une salle à l'autre (scrolling façon ALttP)
    if (A.rooms) { const r = this.roomOf(P.x, P.y); if (r !== this.room) this.startSlide(r); }
    this.updateCam();
  },
  startSlide(to) {
    const from = this.room, r0 = this.roomRect(from), r1 = this.roomRect(to), P = this.player;
    const dx = Math.sign(r1.x - r0.x), dy = Math.sign(r1.y - r0.y);
    this.slide = { from, to, t: 0, cx0: this.cam.x, cy0: this.cam.y, cx1: r1.x, cy1: r1.y + 1, px: P.x, py: P.y, dx, dy };
    P.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up'; P.vx = P.vy = 0; P.atk = 0;
    this.room = to; this.state = 'slide'; this.area.arenaOn = null;
    this.area.ents = this.area.ents.filter(e => !e.isOrb && !e.isShot);
    spawnRoom(this.area, to);
  },
  updateSlide(dt) {
    const s = this.slide; s.t += dt; const k = clamp(s.t / 0.6, 0, 1), e = k * k * (3 - 2 * k);
    this.cam.x = lerp(s.cx0, s.cx1, e); this.cam.y = lerp(s.cy0, s.cy1, e);
    const P = this.player; P.x = s.px + s.dx * 44 * e; P.y = s.py + s.dy * 44 * e; P.moving = true; P.anim += dt;
    if (k >= 1) { this.slide = null; this.state = 'play'; spawnRoom(this.area, s.from); this.visit(); persist(); }
  },
  updateFade(dt) {
    const f = this.fade; f.t += dt * 3;
    if (f.dir === 1 && f.t >= 1) { f.fn(); this.afterFade = this.state === 'fade' ? 'play' : this.state; this.state = 'fade'; f.dir = -1; f.t = 0; }
    else if (f.dir === -1 && f.t >= 1) { this.fade = null; this.state = this.afterFade; }
  },
  updateDialog(dt) {
    const d = this.dialog, line = d.lines[d.i], full = line.text.length;
    if (d.c < full) { const before = Math.floor(d.c); d.c += dt * 45; if (Math.floor(d.c) !== before && Math.floor(d.c) % 2 === 0) SFX.blip(); }
    if (this.raised) { this.raised.t -= dt; if (this.raised.t <= 0.3) this.raised.t = 0.3; }
    if (Input.pressed('a') || Input.pressed('b')) {
      if (d.c < full) d.c = full;
      else if (d.i < d.lines.length - 1) { d.i++; d.c = 0; SFX.menu(); }
      else { this.dialog = null; this.state = 'play'; this.raised = null; this.player.atk = 0; Input.prev.a = true; Input.prev.b = true; if (d.done) d.done(); }
    }
  },
  menuNav(n) {
    if (Input.pressed('down')) { this.menu = (this.menu + 1) % n; SFX.menu(); }
    if (Input.pressed('up')) { this.menu = (this.menu + n - 1) % n; SFX.menu(); }
  },
  titleItems() {
    const items = SAVE.started && !SAVE.chapterDone ? ['Continuer', 'Nouvelle partie'] : ['Nouvelle partie'];
    if (!PWA.installed()) items.push('Installer l\'appli');
    return items;
  },
  updateTitle() {
    const items = this.titleItems(); if (this.menu >= items.length) this.menu = 0;
    if (this.installHelp) { if (Input.anyPressed() || Input.pressed('b')) { this.installHelp = false; SFX.menu(); } return; }
    this.menuNav(items.length);
    // sur mobile : toucher directement une ligne du menu
    const tap = Input.lastTap; Input.lastTap = null;
    let go = Input.anyPressed();
    if (tap && performance.now() - tap.time < 250) { const i = Math.floor((tap.y - 102) / 16); if (i >= 0 && i < items.length && Math.abs(tap.x - W / 2) < 90) { this.menu = i; go = true; } }
    if (go) {
      audioUnlock(); SFX.menu();
      const it = items[this.menu];
      if (it.startsWith('Installer')) { PWA.install().then(ok => { if (!ok) this.installHelp = true; }); return; }
      this.fadeTo(() => it === 'Continuer' ? this.continueGame() : this.newGame());
    }
  },
  drawInstallHelp() {
    R(0, 0, W, H, 'rgba(4,8,26,.88)');
    const bw = 360, bx = (W - bw) / 2, by = 60, bh = 140;
    R(bx - 2, by - 2, bw + 4, bh + 4, PAL.ink); R(bx, by, bw, bh, '#14244c'); R(bx + 1, by + 1, bw - 2, 1, PAL.lav);
    text('Installer Escape Night 2', W / 2, by + 12, { size: 12, align: 'center', bold: true, color: PAL.glow });
    const lines = PWA.ios()
      ? ['Sur iPhone / iPad (Safari) :', '1. Touche le bouton Partager (carré avec une flèche).', '2. Choisis « Sur l\'écran d\'accueil ».', '3. Lance le jeu depuis la nouvelle icône.']
      : ['Ouvre le menu du navigateur (⋮ en haut à droite),', 'puis choisis « Installer l\'application »', 'ou « Ajouter à l\'écran d\'accueil ».', 'Le jeu marchera ensuite en plein écran, même hors ligne.'];
    lines.forEach((l, i) => text(l, bx + 20, by + 38 + i * 16, { size: 8, color: i === 0 && PWA.ios() ? PAL.warm : PAL.white }));
    if (Math.floor(this.t * 2) % 2) text('A : fermer', W / 2, by + bh - 16, { size: 8, align: 'center', color: PAL.glow });
  },
  updatePause() {
    this.menuNav(3);
    if (Input.pressed('start')) { this.state = 'play'; return; }
    if (Input.pressed('a')) {
      SFX.menu();
      if (this.menu === 0) this.state = 'play';
      else if (this.menu === 1) { SAVE.muted = !SAVE.muted; persist(); }
      else { this.state = 'title'; this.view = 'title'; this.menu = 0; }
    }
  },
  updateOver() {
    if (this.overT < 1.2) return;
    this.menuNav(2);
    if (Input.pressed('a')) {
      SFX.menu();
      if (this.menu === 0) this.fadeTo(() => this.enter(this.area.id, this.area.start, true));
      else { this.state = 'title'; this.view = 'title'; this.menu = 0; }
    }
  },

  // ---------- rendu ----------
  draw() {
    resetT(); R(0, 0, W, H, '#000');
    if (this.view === 'title') { this.drawTitle(); this.drawFade(); drawVirtualPad(); return; }
    if (this.view === 'end') { this.drawEnd(); this.drawFade(); return; }
    this.drawWorld();
    this.drawHUD();
    if (this.state === 'dialog') this.drawDialog();
    if (this.state === 'pause') this.drawPause();
    if (this.state === 'over') this.drawOver();
    this.drawFade();
    drawVirtualPad();
    if (Input.toast.t > 0) { const w = textW(Input.toast.msg, 8) + 16; R(W / 2 - w / 2, H - 30, w, 16, 'rgba(7,13,31,.85)'); text(Input.toast.msg, W / 2, H - 26, { align: 'center', color: PAL.glow }); }
  },
  drawWorld() {
    const A = this.area, P = this.player;
    const sx = this.shake > 0 ? rand(-2, 2) : 0, sy = this.shake > 0 ? rand(-2, 2) : 0;
    const cx = Math.round(this.cam.x + sx), cy = Math.round(this.cam.y + sy);
    ctx.save(); ctx.translate(-cx, -cy);
    // sol pré-rendu (on ne copie que la partie visible)
    const sxp = clamp(cx * 2, 0, A.layer.width - W * 2), syp = clamp(cy * 2, 0, A.layer.height - H * 2);
    ctx.drawImage(A.layer, sxp, syp, W * 2, H * 2, sxp / 2, syp / 2, W, H);
    // reflets sur l'eau
    if (A.id === 'camp') for (let ty = Math.floor(cy / TS); ty <= Math.floor((cy + H) / TS); ty++) for (let tx = Math.floor(cx / TS); tx <= Math.floor((cx + W) / TS); tx++) {
      if (A.tile(tx, ty) !== '~') continue;
      const ph = Math.sin(this.t * 2 + tx * 1.7 + ty * 2.3);
      if (ph > 0.75) R(tx * TS + 4 + ((tx * 7 + ty * 3) % 8), ty * TS + 6 + ((tx * 5) % 6), 3, 0.5, '#9ab8ff');
    }
    // entrée de la forêt : des yeux dans le noir
    if (A.id === 'camp' && Math.sin(this.t * 0.7) > 0.6) { const ex = 22 * TS + 22 + Math.sin(this.t * 0.3) * 14; R(ex, 10, 1.5, 1, '#ffe27a'); R(ex + 5, 10, 1.5, 1, '#ffe27a'); }
    // tri par profondeur
    const list = [];
    for (const p of A.props) list.push({ y: p.y, p });
    for (const e of A.ents) if (!e.dead) { if (!this.slide && !this.inRoom(e)) continue; list.push({ y: e.ground ? -1e9 : e.y, e }); }
    list.push({ y: P.y, e: P });
    list.sort((a, b) => a.y - b.y);
    for (const it of list) {
      if (it.p) {
        const p = it.p; let im = IMG[p.k];
        if (p.k === 'campfire' && Math.floor(this.t * 7) % 2) im = IMG.campfire2 || im;
        if (im) ctx.drawImage(im, half(p.x - p.iw / 2), half(p.y - p.ih + 1), p.iw, p.ih);
      } else it.e.draw();
    }
    // objet brandi au-dessus de la tête (coffre, cœur)
    if (this.raised) {
      const x = P.x, y = P.y - 40 + Math.sin(this.t * 4);
      ctx.globalAlpha = 0.35; ell(x, y, 12, 12, '#ffe27a'); ctx.globalAlpha = 1;
      if (this.raised.kind === 'key') drawKey(x, y, 2); else if (this.raised.kind === 'sling') drawSlingIcon(x, y + 2, 1.5); else drawHeartShape(x, y, 2, '#ffcf3a', '#e09a20');
    }
    this.parts.draw();
    ctx.restore();
    this.drawLight(cx, cy);
    // lucioles (au-dessus de la nuit)
    if (A.id === 'camp') {
      ctx.save(); ctx.translate(-cx, -cy);
      for (const f of this.flies) {
        const x = f.x + Math.sin(this.t * f.s + f.p) * 20, y = f.y + Math.cos(this.t * f.s * 0.7 + f.p) * 14, a = 0.5 + 0.5 * Math.sin(this.t * 3 * f.s + f.p);
        if (x < cx - 4 || x > cx + W + 4 || y < cy - 4 || y > cy + H + 4) continue;
        ctx.globalAlpha = a * 0.35; ell(x, y, 3, 3, '#ffe27a'); ctx.globalAlpha = a; R(half(x), half(y), 1, 1, '#fff6c0');
      }
      ctx.globalAlpha = 1; ctx.restore();
    }
  },
  lightsList(cx, cy) {
    const A = this.area, P = this.player, L = [];
    L.push({ x: P.x, y: P.y - 12, r: A.id === 'camp' ? 84 : 72, c: 'rgba(200,220,255,' });
    for (const p of A.props) if (p.light) L.push({ x: p.x, y: p.y + (p.light.oy || -8), r: p.light.r, c: p.light.c, flick: p.light.flick, warm: p.light.warm });
    for (const e of A.ents) { if (e.dead || (!this.slide && !this.inRoom(e))) continue; const li = e.light; if (li) L.push({ x: e.x, y: e.y - (e.alt || 6) - 6, r: li.r, c: li.c, flick: li.flick, warm: li.warm }); }
    return L.filter(l => l.x + l.r > cx && l.x - l.r < cx + W && l.y + l.r > cy && l.y - l.r < cy + H);
  },
  drawLight(cx, cy) {
    const A = this.area, l = this.lctx, L = this.lightsList(cx, cy);
    l.setTransform(1, 0, 0, 1, 0, 0); l.globalCompositeOperation = 'source-over';
    l.clearRect(0, 0, W * SC, H * SC);
    const rd = A.roomDark ? A.roomDark(this.room) : null;
    l.fillStyle = `rgba(4,8,26,${rd != null ? rd : A.dark})`; l.fillRect(0, 0, W * SC, H * SC);
    l.globalCompositeOperation = 'destination-out';
    for (const o of L) {
      const r = (o.r + (o.flick ? Math.sin(this.t * 13) * 3 + Math.sin(this.t * 7.3) * 2 : 0)) * SC, x = (o.x - cx) * SC, y = (o.y - cy) * SC;
      const g = l.createRadialGradient(x, y, 0, x, y, r);
      // anneaux "pixel" plutôt qu'un dégradé lisse
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.45, 'rgba(0,0,0,1)'); g.addColorStop(0.46, 'rgba(0,0,0,.72)'); g.addColorStop(0.7, 'rgba(0,0,0,.72)'); g.addColorStop(0.71, 'rgba(0,0,0,.38)'); g.addColorStop(0.92, 'rgba(0,0,0,.38)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      l.fillStyle = g; l.beginPath(); l.arc(x, y, r, 0, 7); l.fill();
    }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(this.light, 0, 0);
    // halo coloré additif
    ctx.globalCompositeOperation = 'lighter';
    for (const o of L) {
      if (o.c.startsWith('rgba(200,220,255')) continue;
      const r = o.r * SC * (o.warm ? 0.8 : 0.6), x = (o.x - cx) * SC, y = (o.y - cy) * SC, k = o.flick ? 0.16 + Math.sin(this.t * 11) * 0.03 : 0.12;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, o.c + k + ')'); g.addColorStop(1, o.c + '0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
    ctx.restore(); resetT();
  },
  drawHUD() {
    const P = this.player, n = SAVE.maxHp / 2;
    R(4, 4, n * 11 + 6, 14, 'rgba(7,13,31,.55)');
    for (let i = 0; i < n; i++) {
      const x = 12 + i * 11, y = 11, v = clamp(P.hp - i * 2, 0, 2);
      drawHeartShape(x, y, 2, '#3a2a48', '#2a1d38');
      if (v > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x - 6, y - 6, v === 2 ? 12 : 6, 12); ctx.clip(); drawHeartShape(x, y, 2, PAL.heart, '#c02848'); ctx.restore(); }
    }
    // case de l'objet B
    if (SAVE.slingshot) {
      R(4, 20, 20, 20, 'rgba(7,13,31,.6)'); R(4, 20, 20, 1, PAL.lav); R(4, 39, 20, 1, PAL.lav); R(4, 20, 1, 20, PAL.lav); R(23, 20, 1, 20, PAL.lav);
      drawSlingIcon(14, 31, 1); text('B', 6, 21, { size: 6, color: PAL.lav, bold: true });
    }
    if (SAVE.keys > 0) { const kx = SAVE.slingshot ? 28 : 4; R(kx, 24, 30, 12, 'rgba(7,13,31,.55)'); drawKey(kx + 8, 30, 1); text('×' + SAVE.keys, kx + 15, 25.5, { size: 8, color: PAL.warm }); }
    // barre de vie du boss
    const boss = this.area.ents.find(e => e.isBoss && !e.dead && e.room === this.room && e.state !== 'sleep');
    if (boss && this.state !== 'slide') {
      const bw = 160, bx = (W - bw) / 2, by = H - 16;
      R(bx - 2, by - 12, bw + 4, 18, 'rgba(7,13,31,.75)');
      text('La Grande Ombre', W / 2, by - 11, { size: 7, align: 'center', color: PAL.lav });
      R(bx, by, bw, 4, '#2a1d38'); R(bx, by, Math.round(bw * Math.max(0, boss.hp) / boss.maxHp), 4, boss.state === 'stun' ? PAL.warm : PAL.red); R(bx, by, bw, 1, 'rgba(255,255,255,.2)');
    }
    if (this.banner && this.state !== 'pause') {
      const a = clamp(Math.min(this.banner.t, 2.2 - this.banner.t) * 3, 0, 1); ctx.globalAlpha = a;
      const w = textW(this.banner.text, 12) + 30; R(W / 2 - w / 2, 34, w, 20, 'rgba(7,13,31,.75)'); R(W / 2 - w / 2, 34, w, 1, PAL.glow); R(W / 2 - w / 2, 53, w, 1, PAL.glow);
      text(this.banner.text, W / 2, 37, { size: 12, align: 'center', color: PAL.white }); ctx.globalAlpha = 1;
    }
  },
  drawDialog() {
    const d = this.dialog, line = d.lines[d.i], bw = 340, bx = (W - bw) / 2, by = Input.padVisible ? 30 : 196, bh = 60;
    R(bx - 2, by - 2, bw + 4, bh + 4, PAL.ink); R(bx, by, bw, bh, '#14244c'); R(bx + 1, by + 1, bw - 2, 1, PAL.lav); R(bx + 1, by + bh - 2, bw - 2, 1, '#0c1530');
    let ty = by + 8;
    if (line.who) { R(bx + 8, by - 8, textW(line.who, 8) + 10, 12, PAL.warm); text(line.who, bx + 13, by - 7, { color: PAL.ink, shadow: false, bold: true }); ty += 2; }
    const shown = line.text.slice(0, Math.floor(d.c)), lines = wrap(line.text, bw - 24, 8);
    let count = 0;
    for (const ln of lines) { const part = shown.slice(count, count + ln.length); text(part, bx + 12, ty, { size: 8 }); count += ln.length + 1; ty += 12; }
    if (d.c >= line.text.length && Math.floor(this.t * 3) % 2) { ctx.fillStyle = PAL.glow; ctx.beginPath(); ctx.moveTo(bx + bw - 16, by + bh - 12); ctx.lineTo(bx + bw - 10, by + bh - 12); ctx.lineTo(bx + bw - 13, by + bh - 8); ctx.fill(); }
  },
  drawMenu(items, x, y) {
    items.forEach((it, i) => {
      const on = i === this.menu;
      text(it, x, y + i * 16, { size: 10, align: 'center', color: on ? PAL.glow : '#9aa4c8' });
      if (on) { const w = textW(it, 10); text('▸', x - w / 2 - 10, y + i * 16, { size: 10, color: PAL.glow }); }
    });
  },
  drawPause() {
    R(0, 0, W, H, 'rgba(4,8,26,.78)');
    const cave = this.area.id === 'cave', mx = cave ? 150 : W / 2;
    text('PAUSE', mx, 56, { size: 18, align: 'center', bold: true, color: PAL.white });
    this.drawMenu(['Reprendre', 'Son : ' + (SAVE.muted ? 'non' : 'oui'), 'Écran titre'], mx, 96);
    // objets
    text('A : branche' + (SAVE.slingshot ? '   ·   B : lance-pierre' : ''), mx, 158, { size: 8, align: 'center', color: PAL.warm });
    if (cave) this.drawMap(300, 52);
    text('Clavier : flèches/ZQSD · Espace = A · K = B · Échap = pause   ·   Manette : stick/croix · A · B · Start', W / 2, 236, { size: 7, align: 'center', color: '#7a84a8' });
  },
  drawMap(x0, y0) {
    const A = this.area, cw = 48, ch = 28, R0 = CAVE_ROOMS;
    text('La grotte des lucioles', x0 + 72, y0, { size: 8, align: 'center', color: PAL.lav });
    const links = [[R0.entry, R0.arena], [R0.entry, R0.block], [R0.entry, R0.chasm], [R0.block, R0.sling], [R0.chasm, R0.boss]];
    const cell = i => ({ x: x0 + (i % 3) * cw, y: y0 + 16 + Math.floor(i / 3) * ch });
    const seen = i => SAVE.visited && SAVE.visited['cave' + i];
    for (const [a, b] of links) { if (!seen(a) && !seen(b)) continue; const p = cell(a), q = cell(b); R(Math.min(p.x, q.x) + cw / 2 - 2, Math.min(p.y, q.y) + ch / 2 - 2, Math.abs(p.x - q.x) + 4, Math.abs(p.y - q.y) + 4, '#3a3354'); }
    for (const i of A.rooms.list) {
      if (!seen(i)) continue;
      const p = cell(i), cur = i === this.room;
      R(p.x + 4, p.y + 3, cw - 8, ch - 6, cur ? '#2a5a66' : '#2b2540'); R(p.x + 4, p.y + 3, cw - 8, 1, cur ? PAL.glow : '#4a4266');
      if (cur && Math.floor(this.t * 3) % 2) R(p.x + cw / 2 - 2, p.y + ch / 2 - 2, 4, 4, PAL.glow);
      if (i === R0.boss) text(SAVE.boss ? '✓' : '☠', p.x + cw / 2, p.y + 7, { size: 9, align: 'center', color: SAVE.boss ? PAL.green : PAL.red });
    }
  },
  drawOver() {
    const a = clamp(this.overT, 0, 1); R(0, 0, W, H, `rgba(4,4,12,${0.85 * a})`);
    if (this.overT < 0.6) return;
    text('Sacha a eu trop peur…', W / 2, 80, { size: 16, align: 'center', color: PAL.red, bold: true });
    if (this.overT >= 1.2) this.drawMenu(['Réessayer', 'Écran titre'], W / 2, 130);
  },
  drawFade() { if (!this.fade) return; const a = this.fade.dir === 1 ? this.fade.t : 1 - this.fade.t; R(0, 0, W, H, `rgba(0,0,0,${clamp(a, 0, 1)})`); },
  drawEnd() {
    R(0, 0, W, H, PAL.ink); this.drawStars(1);
    text('Fin du chapitre 1', W / 2, 62, { size: 20, align: 'center', bold: true, color: PAL.warm });
    text('Sacha a vaincu la Grande Ombre et libéré les lucioles de la grotte.', W / 2, 98, { size: 8, align: 'center' });
    text('Merci d\'avoir joué à ce prototype !', W / 2, 114, { size: 8, align: 'center', color: '#9aa4c8' });
    for (let i = 0; i < 24; i++) { const a = this.t * 0.6 + i * 0.7, x = W / 2 + Math.cos(a) * (60 + (i % 5) * 18), y = 170 + Math.sin(a * 1.3) * 26, k = 0.5 + 0.5 * Math.sin(this.t * 3 + i); ctx.globalAlpha = k * 0.4; ell(x, y, 3, 3, '#ffe27a'); ctx.globalAlpha = k; R(half(x), half(y), 1, 1, '#fff6c0'); }
    ctx.globalAlpha = 1;
    drawSacha(W / 2, 210, 'down', false, this.t, 2);
    if (this.endT > 1 && Math.floor(this.t * 2) % 2) text('Appuie sur A', W / 2, 226, { size: 8, align: 'center', color: PAL.glow });
  },
  drawStars(seed) {
    const r = seeded(seed * 77 + 1);
    for (let i = 0; i < 90; i++) { const x = r() * W, y = r() * H * 0.75, tw = Math.sin(this.t * (1 + r() * 2) + i) > 0.3; R(Math.round(x), Math.round(y), 1, 1, tw ? '#f4f7ff' : '#5a6a9a'); }
  },
  drawTitle() {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#070d1f'); g.addColorStop(1, '#14244c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    this.drawStars(3);
    ell(392, 52, 16, 16, '#f4f0d8'); ell(398, 48, 14, 14, '#070d1f'); // lune
    // forêt en silhouette
    const pines = IMG.pine1, r = seeded(9);
    if (pines) for (let row = 0; row < 3; row++) {
      ctx.globalAlpha = 1;
      for (let i = -1; i < 18; i++) { const x = i * 30 + r() * 14 + row * 11, y = 170 + row * 22 + r() * 8, s = 0.55 + row * 0.15; ctx.drawImage(pines, x, y - 108 * s, 60 * s, 108 * s); }
      R(0, 0, W, H, `rgba(7,13,31,${0.45 - row * 0.12})`);
    }
    R(0, 240, W, 30, '#0a1420');
    ctx.globalAlpha = 0.25 + 0.1 * Math.sin(this.t * 2); ell(W / 2, 236, 40, 10, '#ffcf7a'); ctx.globalAlpha = 1;
    drawSacha(W / 2, 246, 'up', false, this.t, 2);
    // titre
    ctx.globalAlpha = 0.5; text('ESCAPE NIGHT 2', W / 2 + 1, 37, { size: 30, align: 'center', bold: true, color: PAL.teal, shadow: false }); ctx.globalAlpha = 1;
    text('ESCAPE NIGHT 2', W / 2, 36, { size: 30, align: 'center', bold: true, color: PAL.glow, shadowColor: PAL.ink });
    text('La forêt des ombres', W / 2, 72, { size: 11, align: 'center', color: PAL.lav });
    this.drawMenu(this.titleItems(), W / 2, 104);
    if (this.installHelp) this.drawInstallHelp();
    text(VERSION + ' · prototype', W - 6, H - 11, { size: 7, align: 'right', color: '#5a6a9a' });
    text(Input.gamepadName ? 'Manette prête' : 'Manette · clavier · tactile', 6, H - 11, { size: 7, color: '#5a6a9a' });
  },
};

function drawKey(x, y, s = 1) {
  hi(x, y, false, () => {
    const u = s; D(-6 * u, -5 * u, 6 * u, 6 * u, '#e0b850'); D(-4 * u, -3 * u, 2 * u, 2 * u, '#14244c'); D(0, -3 * u, 8 * u, 2 * u, '#e0b850'); D(5 * u, -1 * u, 2 * u, 3 * u, '#e0b850'); D(2 * u, -1 * u, 2 * u, 2 * u, '#e0b850'); D(-6 * u, -5 * u, 6 * u, 1 * u, '#fff2c0');
  });
}

// ---------- démarrage ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  Input.update();
  if (G.state !== 'boot') { G.update(dt); G.draw(); }
  requestAnimationFrame(frame);
}
(async function boot() {
  resetT(); R(0, 0, W, H, PAL.ink); text('Chargement…', W / 2, H / 2 - 4, { align: 'center', color: PAL.glow });
  try { await document.fonts.load(`10px ${FONT}`); } catch (_) {}
  await loadAssets();
  G.init();
  requestAnimationFrame(frame);
})();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  // dès qu'une nouvelle version prend la main, on recharge la page une fois
  const hadController = !!navigator.serviceWorker.controller; let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController && !reloaded) { reloaded = true; location.reload(); } });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
    reg.update().catch(() => {});
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
  }).catch(() => {});
}
