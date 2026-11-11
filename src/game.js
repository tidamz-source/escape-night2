'use strict';
// ---------- le jeu : états, transitions, scènes, rendu du monde ----------
const DARK_K = 0.62; // < 1 : nuit moins sombre partout (1 = l'obscurité d'origine)
const G = {
  state: 'boot', t: 0, areas: {}, area: null, player: null, parts: new Parts(),
  cam: { x: 0, y: 0 }, shake: 0, hitstop: 0, dialog: null, fade: null, slide: null, room: 0,
  raised: null, menu: 0, banner: null, flies: [], view: 'title', pending: null,
  ptab: 0, psel: 0, shop: null, slotSel: 0, heroSel: 0, erasing: false, moneyFlash: 0,

  init() {
    this.areas.camp = buildCamp(); this.areas.royaume = buildVillageArea();
    this.areas.collines = buildCollinesArea(); this.areas.foret = buildForetArea(); this.areas.montagne = buildMontagneArea();
    this.areas.lac = buildLacArea(); this.areas.cote = buildCoteArea(); this.areas.terres = buildTerresArea();
    this.areas.cave = buildCaveArea(); this.areas.bois = buildBoisArea(); this.areas.mines = buildMinesArea();
    this.areas.temple = buildTempleArea(); this.areas.tower = buildTowerArea(); this.areas.castle = buildCastleArea();
    buildMonde(this.areas); // chemins entre les régions, sanctuaire des lucioles, grottes secrètes
    for (let i = 0; i < 26; i++) this.flies.push({ x: rand(0, 768), y: rand(0, 900), p: rand(0, 6), s: rand(0.4, 1) });
    this.light = document.createElement('canvas'); this.light.width = W * SC; this.light.height = H * SC; this.lctx = this.light.getContext('2d');
    Bus.on('money:changed', () => { this.moneyFlash = 0.4; });
    Bus.on('tool:equipped', ({ id }) => { if (this.view === 'world') Input.toast = { msg: 'B : ' + Inventory.item(id).name, t: 1.2 }; });
    this.state = 'title'; this.view = 'title'; this.menu = 0;
  },

  // ---------- parties ----------
  newGame(slot, hero) {
    newSlot(slot, hero);
    const camp = this.areas.camp; delete this.areas.in_bungalow; this.player = null; Effects.reset();
    this.fadeTo(() => { this.enterHouseNow(camp.home, camp); this.player.dir = 'down'; this.pending = 'prologue'; });
  },
  continueGame() { Effects.reset(); Market.roll(); let id = SAVE.lastArea; if (!this.areas[id] || (id || '').startsWith('in_')) id = SAVE.crossed_rift ? 'royaume' : 'camp'; this.enter(id, id === 'royaume' ? Object.assign({ dir: 'down' }, this.areas.royaume.plaza) : this.areas[id].start, true); },
  // entrer dans une maison : son intérieur est construit à la première visite
  enterHouse(h) { if (!INTERIORS[h.o.interior]) return; const from = this.area; this.fadeTo(() => this.enterHouseNow(h, from)); },
  enterHouseNow(h, from) {
    const id = h.o.interior, key = 'in_' + id;
    if (!this.areas[key]) this.areas[key] = interiorArea(id, h, from.id);
    const A = this.areas[key];
    this.enter(key, id === 'bungalow' && !SAVE.got_branche && !SAVE.left_bungalow ? A.wake : A.start, !this.player);
  },
  healBy(n) { const P = this.player; if (P) { P.healQ = Math.min((P.healQ || 0) + n, SAVE.maxHp); P.healT = Math.min(P.healT || 0, 0.05); } },
  healFull() { const P = this.player; if (P) this.healBy(SAVE.maxHp - P.hp); },
  // question à choix : la dernière réplique propose des réponses
  ask(lines, choices, cb) { this.say(lines, null); const d = this.dialog; d.choices = choices; d.pick = 0; d.onPick = cb; },

  enter(id, pos, fresh) {
    if (id === 'royaume' && this.area && this.area.id !== 'royaume' && !(this.area.id || '').startsWith('in_')) Market.roll();
    if (this.area && this.area.id !== id) Gerard.leave(this.area.id); // Gérard change de région quand on quitte la sienne
    this.area = this.areas[id]; this.area.arenaOn = null;
    this.room = this.area.rooms ? this.roomOf(pos.x, pos.y) : 0;
    this.area.spawn(); worldSpawn(this.area);
    if (this.area.zone) { spawnResources(this.area); peddlerSpawn(this.area); } // cueillette, minerai, colporteur
    const hp = this.player && !fresh ? this.player.hp : SAVE.maxHp;
    this.player = new Player(pos.x, pos.y, pos.dir); this.player.hp = Math.max(1, hp);
    Lumi.reset(this.player);
    this.parts.a = []; this.raised = null; this.slide = null;
    SAVE.lastArea = id; this.visit(); persist();
    this.banner = { text: this.area.name, t: 2.2 };
    this.state = 'play'; this.view = 'world'; this.updateCam(true);
    for (const k of ['cave', 'bois', 'mines', 'lac', 'temple', 'tower', 'castle']) if (id === k && !SAVE[k + 'Intro']) { SAVE[k + 'Intro'] = true; persist(); this.pending = k + 'Intro'; }
    this.wind = null; this.windT = 0; this.freezeT = 0; this.flashT = 0;
    this.camFocus = null; this.darkFrom = null;
  },
  visit() { if (this.area.zone) { SAVE.visitedZ = SAVE.visitedZ || {}; SAVE.visitedZ[this.area.id] = 1; } if (this.area.rooms) { SAVE.visited = SAVE.visited || {}; SAVE.visited[this.area.id + this.room] = 1; } },
  fadeTo(fn, color) { if (this.fade) return; this.fade = { t: 0, dir: 1, fn, color }; this.state = 'fade'; },

  // ---------- salles ----------
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
  updateCam() {
    const P = this.player, A = this.area, f = this.camFocus || { x: P.x, y: P.y - 12 };
    if (A.rooms) { const rr = this.roomRect(); this.cam.x = rr.x; this.cam.y = rr.y + 1; return; }
    this.cam.x = A.w <= W ? (A.w - W) / 2 : clamp(f.x - W / 2, 0, A.w - W);
    this.cam.y = A.h <= H ? (A.h - H) / 2 - 8 : clamp(f.y - H / 2, 0, A.h - H);
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
    if (door) { P.bump = 1.5; if (Keys.get() > 0) Input.toast = { msg: 'Fermé à clé. Appuie sur A pour utiliser une petite clé.', t: 2.2 }; else { SFX.locked(); this.say([{ text: 'C\'est fermé à clé.' }]); } return; }
    const ig = this.frontEnt(P, e => e instanceof IronGate && e.solid);
    if (ig) { P.bump = 1.5; ig.interact(this); return; }
    const gate = this.frontEnt(P, e => e instanceof GateBlock && e.solid);
    if (gate) { P.bump = 2; gate.interact(this); }
  },
  attackHits(P) {
    const b = P.atkBox(), dmg = Inventory.dmg();
    for (const e of this.area.ents) {
      if (e.dead || !e.hit || P.atkHit.has(e) || e.isShot || !this.inRoom(e)) continue;
      if (rectHit(b, e.body ? e.body() : boxOf(e))) { P.atkHit.add(e); e.hit(dmg, P.x, P.y - 10, this, 'branch'); }
    }
  },
  blockMoved(b) {
    for (const p of this.area.ents) {
      if (!(p instanceof Plate)) continue;
      const onIt = this.area.ents.some(k => k instanceof Block && !k.mv && Math.abs(k.x - p.x) < 1 && Math.abs(k.y - p.y) < 1);
      if (p.hold) { if (!!SAVE[p.flag] !== onIt) { SAVE[p.flag] = onIt; persist(); if (onIt) this.shake = 0.2; } continue; }
      if (SAVE[p.flag]) continue;
      if (onIt) { SAVE[p.flag] = true; persist(); SFX.secret(); this.shake = 0.2; }
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
      if (P.x > rr.x + 64 && P.x < rr.x + rr.w - 64 && P.y > rr.y + 60 && P.y < rr.y + rr.h - 52) { A.arenaOn = this.room; if (ar.onStart) ar.onStart(this); }
    } else if (!alive) {
      A.arenaOn = null; SAVE[ar.flag] = true; persist(); SFX.secret();
      if (ar.onClear) ar.onClear(this);
    }
  },
  checkTorches(group) {
    const t = this.area.ents.filter(e => e instanceof Torch && e.group === group);
    if (t.length && t.every(e => e.on > 0) && !SAVE[group]) { SAVE[group] = true; persist(); setTimeout(() => SFX.secret(), 250); this.shake = 0.25; Input.toast = { msg: 'Quelque chose s\'ouvre…', t: 2.5 }; }
  },
  checkSwitches(group) {
    const sw = this.area.ents.filter(e => e instanceof FrisbeeSwitch && e.group === group);
    if (sw.length && sw.every(e => e.on > 0) && !SAVE[group]) { SAVE[group] = true; persist(); setTimeout(() => SFX.secret(), 250); this.shake = 0.25; Input.toast = { msg: 'Une grille s\'ouvre quelque part…', t: 2.5 }; }
  },
  // rafales du moulin : 2,5 s de vent, 2 s de calme ; les souches juste au nord abritent du vent
  updateWind(dt) {
    const A = this.area, P = this.player;
    if (A.windRoom == null || this.room !== A.windRoom) { this.wind = null; return; }
    this.windT += dt; const ph = this.windT % 4.5, gust = ph > 2, warn = ph > 1.4 && !gust;
    const rr = this.roomRect();
    if (gust || warn) { const n = gust ? 40 : 8; if (Math.random() < dt * n) this.parts.add({ x: rr.x + rand(30, 450), y: rr.y + rand(20, 60), vx: rand(-15, 15), vy: rand(150, 220), life: 1.2, c: pick(['#6a8a3a', '#8aa04a', '#a07a3a', '#c8d0b0']), r: 1.5 }); }
    if (gust && ph < 2.05) SFX.wind();
    this.wind = gust ? { x: 0, y: 70 } : null;
    if (!gust || P.roll > 0) return;
    const sheltered = ['s', 'W'].includes(A.tileAt(P.x, P.y - 14)) || ['s', 'W'].includes(A.tileAt(P.x, P.y - 28));
    if (!sheltered && P.y + 70 * dt < rr.y + rr.h - 40) moveEnt(A, P, 0, 70 * dt, { noExit: true }); // le vent ne pousse jamais hors de la salle
  },
  // répliques : brutes ou déjà mises en forme par Story
  say(lines, done) { this.dialog = { lines: lines.map(l => l.who !== undefined && 'mood' in l ? l : Story.lines([l])[0]), i: 0, c: 0, done }; this.state = 'dialog'; },
  raise(kind) { this.raised = { kind, t: 1.6 }; },
  gameOver() { this.state = 'over'; this.overT = 0; this.menu = 0; },

  // ---------- scènes ----------
  freeCaptive(n = 1) {
    this.say(Story.script(n === 1 ? 'freed' : 'freed' + n), () => {
      Story.set('freed' + n); this.prevFragments = SAVE.fragments || 0; SAVE.fragments = Math.max(SAVE.fragments || 0, n); persist(); SFX.bigheart();
      this.fadeTo(() => { this.enter('royaume', Object.assign({ dir: 'up' }, this.areas.royaume.plaza), false); this.pending = 'ceremony' + n; }, '#fff2c0');
    });
  },
  // ---------- cinématiques ----------
  // la cérémonie du fragment : il descend du ciel jusqu'à la tour-horloge, les aiguilles avancent, une lanterne s'allume
  ceremony(n) {
    const tower = this.area.ents.find(e => e instanceof ClockTower), from = this.prevFragments != null ? this.prevFragments : n - 1;
    if (!tower) return this.playReunion(n);
    tower.shown = from; tower.hand = from; this.camFocus = { x: tower.x, y: tower.y - 70 }; this.updateCam();
    const darkA = Math.max(0.12, 0.5 - 0.055 * from), darkB = Math.max(0.12, 0.5 - 0.055 * n);
    let chimed = false, lit = false;
    this.cut = {
      t: 0,
      update: dt => {
        const c = this.cut; c.t += dt; this.parts.update(dt); tower.t += dt; this.t;
        if (c.t < 1.6) { const k = c.t / 1.6; c.ox = tower.x + Math.sin(k * 9) * 30 * (1 - k); c.oy = lerp(tower.y - 300, tower.y - 160, k * k); if (Math.random() < dt * 40) this.parts.add({ x: c.ox, y: c.oy, vy: -10, vx: rand(-20, 20), life: 0.6, c: pick(['#ffe27a', '#fff', '#ffcf3a']), r: 1.5 }); }
        else if (c.t < 3.4) { if (!chimed) { chimed = true; SFX.chime(); tower.glow = 1.2; this.shake = 0.3; this.parts.burst(tower.x, tower.y - 160, 40, { c: ['#ffe27a', '#fff', '#ffcf3a'], life: 1.2, smin: 30, smax: 150, r: 2, drag: 1.5 }); } tower.hand = lerp(from, n, clamp((c.t - 1.6) / 1.4, 0, 1)); this.darkFrom = lerp(darkA, darkB, clamp((c.t - 1.6) / 1.8, 0, 1)); }
        else if (!lit) { lit = true; tower.shown = n; tower.hand = n; SFX.bigheart(); this.flashT = 0.2; }
        if (c.t > 4.6) { this.cut = null; this.camFocus = null; this.darkFrom = null; this.state = 'play'; this.playReunion(n); }
      },
      draw: () => {
        const c = this.cut; if (!c || c.t >= 1.6) { if (c && c.t > 1.6 && c.t < 3.4) { const a = Math.min(1, 3.4 - c.t); ctx.globalAlpha = a; text(`${n} h du matin`, W / 2, 30, { size: 14, align: 'center', bold: true, color: PAL.warm }); text(`Fragment d'aube ${n} / 6`, W / 2, 48, { size: 9, align: 'center', color: '#fff6c0' }); ctx.globalAlpha = 1; } return; }
        const x = c.ox - this.cam.x, y = c.oy - this.cam.y;
        ctx.globalAlpha = 0.4; ell(x, y, 12, 12, '#ffe27a'); ctx.globalAlpha = 1; drawItemIcon('fragment', x, y, 1.4);
      },
    };
    this.state = 'cut';
  },
  playReunion(n) { this.pending = n === 1 ? 'reunion' : 'reunion' + n; },
  // la porte aux cinq sceaux : chaque sceau vole jusqu'à sa serrure, la porte tremble puis s'ouvre dans un flot de lumière
  sealCeremony() {
    const gate = this.area.ents.find(e => e instanceof SealGate && e.room === this.room); if (!gate) return;
    const P = this.player; let step = 0;
    this.cut = {
      t: 0,
      update: dt => {
        const c = this.cut; c.t += dt; this.parts.update(dt); gate.t += dt;
        const k = Math.floor(c.t / 0.55);
        if (k > step && step < 5) { step++; gate.lit = step; SFX.crystal(); this.shake = 0.15; this.parts.burst(gate.x - 13 + (step - 1) * 6, gate.y - 23, 14, { c: [SEALS[step - 1][1], '#fff'], life: 0.6, r: 2 }); }
        if (c.t > 3 && c.t < 4.5) { this.shake = 0.3; if (Math.random() < dt * 6) SFX.push(); }
        if (c.t > 3.2 && !c.boom) { c.boom = true; SFX.gate(); }
        if (c.t > 3.2) gate.k = clamp((c.t - 3.2) / 1.6, 0, 1);
        if (c.t > 3.6 && Math.random() < dt * 30) this.parts.add({ x: gate.x + rand(-16, 16), y: gate.y - rand(0, 32), vy: rand(20, 60), vx: rand(-30, 30), life: 1, c: pick(['#fff2c0', '#ffe27a', '#fff']), r: 1.5 });
        if (c.t > 5.4) { SAVE.sealGateOpen = true; SAVE.sealGateSeen = true; persist(); this.cut = null; this.state = 'play'; SFX.secret(); this.say([{ who: 'Lumi', text: 'La grande porte est ouverte ! Papa est juste derrière. Je sens sa lumière… mais elle est toute violette.' }]); }
      },
      draw: () => {
        const c = this.cut; if (!c) return;
        for (let i = step; i < 5; i++) { const t = clamp((c.t - i * 0.55) / 0.55, 0, 1); if (t <= 0) { const x = P.x - this.cam.x - 12 + i * 6, y = P.y - 40 - this.cam.y; drawSealIcon(x, y, 0.8, SEALS[i][1]); continue; } const sx = P.x + (i - 2) * 8, sy = P.y - 40, tx = gate.x - 13 + i * 6, ty = gate.y - 23; const x = lerp(sx, tx, t) - this.cam.x, y = lerp(sy, ty, t) - this.cam.y - Math.sin(t * Math.PI) * 24; drawSealIcon(x, y, 0.8, SEALS[i][1]); }
        if (c.t > 3.2) { const a = clamp((c.t - 3.2) / 1.2, 0, 1) * 0.5; const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(255,240,190,${a})`); g.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = g; const gx = gate.x - this.cam.x; ctx.beginPath(); ctx.moveTo(gx - 16, gate.y - 32 - this.cam.y); ctx.lineTo(gx + 16, gate.y - 32 - this.cam.y); ctx.lineTo(gx + 70, H); ctx.lineTo(gx - 70, H); ctx.fill(); }
      },
    };
    this.state = 'cut';
  },
  finale() {
    this.say(Story.script('kingDown'), () => {
      Story.set('boss6'); SAVE.fragments = 6; persist(); SFX.bigheart();
      this.fadeTo(() => { this.enter('royaume', Object.assign({ dir: 'up' }, this.areas.royaume.plaza), false); this.darkFrom = 0.2; this.pending = 'sunrise'; }, '#fff2c0');
    });
  },
  // la pierre du soleil rejoint le cadran de la tour-horloge : les aiguilles filent jusqu'à midi
  sunrise() {
    const tower = this.area.ents.find(e => e instanceof ClockTower); if (!tower) return this.montage();
    tower.shown = 6; tower.hand = 6; this.camFocus = { x: tower.x, y: tower.y - 60 }; this.updateCam(); this.darkFrom = 0.2;
    const face = { x: tower.x, y: tower.y - 81 }; let hit = false, chimes = 0;
    this.cut = {
      t: 0,
      update: dt => {
        const c = this.cut; c.t += dt; this.parts.update(dt); tower.t += dt; if (this.flashT > 0) this.flashT -= dt; if (this.shake > 0) this.shake -= dt; if (tower.glow > 0) tower.glow -= dt * 0.5;
        if (c.t < 2.2) { const k = c.t / 2.2; c.sx = face.x + Math.sin(k * 7) * 40 * (1 - k); c.sy = lerp(face.y - 260, face.y, k * k); if (Math.random() < dt * 50) this.parts.add({ x: c.sx, y: c.sy, vy: -12, vx: rand(-25, 25), life: 0.8, c: pick(['#ffe27a', '#fff', '#ffcf3a']), r: 1.5 }); }
        else if (!hit) { hit = true; SFX.crystal(); SFX.bigheart(); this.flashT = 0.35; this.shake = 0.5; tower.glow = 1.2; this.parts.burst(face.x, face.y, 60, { c: ['#ffe27a', '#fff', '#ffcf3a'], life: 1.4, smin: 30, smax: 180, r: 2, drag: 1.3 }); }
        if (c.t > 2.4 && c.t < 5.6) { const k = clamp((c.t - 2.4) / 3, 0, 1); tower.hand = lerp(6, 12, k * k * (3 - 2 * k)); this.darkFrom = lerp(0.2, 0, k); if (Math.floor(k * 6) > chimes) { chimes++; SFX.chime(); tower.glow = 1.2; } }
        if (c.t > 5.6 && !c.noon) { c.noon = true; tower.hand = 12; SFX.bigheart(); this.flashT = 0.3; }
        if (c.t > 8) { this.cut = null; this.state = 'play'; this.say(Story.script('sunrise'), () => this.fadeTo(() => this.montage(), '#fff6e0')); }
      },
      draw: () => {
        const c = this.cut; if (!c) return;
        if (c.t < 2.2) { const x = c.sx - this.cam.x, y = c.sy - this.cam.y; ctx.globalAlpha = 0.35; ell(x, y, 16, 16, '#ffe27a'); ctx.globalAlpha = 1; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + c.t * 3; R(x + Math.cos(a) * 9 - 1, y + Math.sin(a) * 9 - 1, 2, 2, '#fff6c0'); } ell(x, y, 6, 6, '#ffcf3a'); ell(x - 1, y - 1, 3, 3, '#fff6c0'); }
        else { const x = face.x - this.cam.x, y = face.y - this.cam.y; ctx.globalAlpha = 0.25 + 0.1 * Math.sin(c.t * 4); ell(x, y, 22, 22, '#fff2c0'); ctx.globalAlpha = 1; ell(x, y, 4, 4, '#ffcf3a'); }
        if (c.t > 5.8) { ctx.globalAlpha = Math.min(1, (c.t - 5.8) * 2); text('Midi', W / 2, 26, { size: 18, align: 'center', bold: true, color: PAL.warm }); text('Le temps reprend son cours', W / 2, 50, { size: 9, align: 'center', color: '#fff6c0' }); ctx.globalAlpha = 1; }
      },
    };
    this.state = 'cut';
  },
  // le soleil se lève sur chaque région, l'une après l'autre
  montage() {
    const zones = ['collines', 'foret', 'montagne', 'lac', 'cote', 'terres', 'royaume'].filter(id => this.areas[id]), D = 3.4;
    const go = i => { const A = this.areas[zones[i]]; this.area = A; this.room = 0; A.arenaOn = null; A.spawn(); this.parts = new Parts(); };
    this.isMontage = true; go(0); let cur = 0;
    const pan = A => { const r = (cur * 0.37) % 1; return { x0: A.w * (0.25 + r * 0.2), y0: A.h * 0.35, x1: A.w * (0.6 + r * 0.15), y1: A.h * 0.55 }; };
    let p = pan(this.area);
    this.cut = {
      t: 0,
      update: dt => {
        const c = this.cut; c.t += dt; const lt = c.t - cur * D, k = clamp(lt / D, 0, 1); if (this.flashT > 0) this.flashT -= dt;
        this.camFocus = { x: lerp(p.x0, p.x1, k), y: lerp(p.y0, p.y1, k) }; this.darkFrom = lerp(0.6, 0.02, clamp(lt / 2, 0, 1));
        if (Math.random() < dt * 20) this.parts.add({ x: this.cam.x + rand(0, W), y: this.cam.y + rand(0, H), vy: -8, vx: rand(-4, 4), life: 1.6, c: pick(['#fff6c0', '#ffe27a']), r: 1 });
        this.parts.update(dt);
        if (lt >= D) { cur++; if (cur >= zones.length) { this.cut = null; this.isMontage = false; this.camFocus = null; this.darkFrom = null; this.fadeTo(() => { this.enter('camp', this.areas.camp.dawn, false); this.pending = 'campDawn'; }, '#fff2c0'); return; } go(cur); p = pan(this.area); SFX.chime(); }
      },
      draw: () => {
        const c = this.cut; if (!c) return; const lt = c.t - cur * D;
        ctx.globalAlpha = clamp(lt / 1.2, 0, 1) * 0.18; R(0, 0, W, H, '#ffc070'); ctx.globalAlpha = 1; // lumière dorée du matin
        const a = clamp(Math.min(lt - 0.4, D - 0.3 - lt) * 2, 0, 1); ctx.globalAlpha = a;
        text(this.area.name, W / 2, H - 46, { size: 14, align: 'center', bold: true, color: PAL.warm }); text('baigné' + (this.area.name.startsWith('Les ') ? 'es' : this.area.name.startsWith('La ') ? 'e' : '') + ' de lumière', W / 2, H - 26, { size: 9, align: 'center', color: '#fff6c0' });
        ctx.globalAlpha = 1;
        const f = Math.max(clamp(1 - lt / 0.35, 0, 1), clamp((lt - (D - 0.35)) / 0.35, 0, 1)); if (f > 0) { ctx.globalAlpha = f; R(0, 0, W, H, '#fff6e0'); ctx.globalAlpha = 1; } // fondu entre les régions
      },
    };
    this.state = 'cut';
  },
  // fin d'un donjon : plus d'écran de bilan, on note l'étape et on reste dans le jeu (l'objectif suivant est dans la pause)
  showEnd(n) { Story.set('v' + n + 'done'); persist(); Input.toast = { msg: 'Partie sauvegardée', t: 1.6 }; },
  playPending() {
    const p = this.pending; this.pending = null;
    if (/^ceremony\d$/.test(p || '')) return this.ceremony(Number(p.slice(8)));
    if (p === 'reunion') return this.say(Story.script('reunion'), () => this.showEnd(1));
    if (p === 'sunrise') return this.sunrise();
    if (p === 'campDawn') return this.say(Story.script('campDawn'), () => this.fadeTo(() => { this.creditsPage = 0; this.endT = 0; this.state = 'credits'; this.view = 'credits'; }, '#fff2c0'));
    const m = /^reunion(\d)$/.exec(p || ''); if (m) return this.say(Story.script(p), () => this.showEnd(Number(m[1])));
    if (p === 'caveIntro') return this.say([{ who: '{hero}', text: 'Une grotte… et des braseros allumés. Qui a bien pu les allumer ?', face: 'o' }, { who: 'Lumi', text: 'Les lucioles d\'ici sont prisonnières, elles aussi. Et je sens la présence de {enfant1}… tout au fond.' }]);
    this.say(Story.script(p));
  },

  // ---------- boucle ----------
  update(dt) {
    this.t += dt;
    if (this.state === 'play' || this.state === 'fish') Effects.update(dt);
    // boss vaincus : bestiaire + matériau rare pour la forge (deux)
    if (this.area && this.state === 'play') for (const e of this.area.ents) {
      if (e.isBoss && e.state === 'dying' && !e.rewarded) { e.rewarded = true; Bestiary.kill(e); const m = { GreatShadow: 'pierre_lune', GreatOwl: 'plume_duc', IronMole: 'acier_gnome', WhirlQueen: 'ecaille_reine', IronKnight: 'poudre', MidnightKnight: 'eclat_ombre' }[e.constructor.name]; if (m) { const cls = e.constructor.name; if (!SAVE['bossMat_' + cls]) { SAVE.bossLoot = SAVE.bossLoot || {}; SAVE.bossLoot[cls] = { area: this.area.id, room: e.room, x: Math.round(e.x), y: Math.round(e.y), mat: m }; persist(); this.area.ents.push(new BossLoot(e.x, e.y, m, cls, e.room)); } } }
      if (e.isEnemy && !e.dead && (this.seenT = (this.seenT || 0) + 0) >= 0 && this.inRoom(e) && dist(e.x, e.y, this.player.x, this.player.y) < 160) Bestiary.seen(e);
    }
    // soin progressif : les cœurs se remplissent un par un
    const PL = this.player; if (PL && PL.healQ > 0 && this.view === 'world') { PL.healT = (PL.healT || 0) - dt; if (PL.healT <= 0) { PL.healT = 0.16; const add = Math.min(2, PL.healQ, SAVE.maxHp - PL.hp); if (add <= 0) PL.healQ = 0; else { PL.hp += add; PL.healQ -= add; SFX.heartTick(); } } }
    if (this.banner) { this.banner.t -= dt; if (this.banner.t <= 0) this.banner = null; }
    if (this.moneyFlash > 0) this.moneyFlash -= dt;
    switch (this.state) {
      case 'title': return this.updateTitle();
      case 'slots': return this.updateSlots();
      case 'heroes': return this.updateHeroes();
      case 'fade': return this.updateFade(dt);
      case 'dialog': this.parts.update(dt); if (SAVE.met_lumi) Lumi.update(dt, this.player); return this.updateDialog(dt);
      case 'pause': return this.updatePause();
      case 'shop': return this.updateShop(dt);
      case 'travel': return this.updateTravel();
      case 'cut': if (this.cut) this.cut.update(dt); this.updateCam(); if (this.shake > 0) this.shake -= dt; return;
      case 'fish': if (this.fish) Fishing.update(dt, this); else this.state = 'play'; this.player.anim = 0; return;
      case 'credits': this.endT += dt; return this.updateCredits(dt);
      case 'over': this.overT += dt; return this.updateOver();
      case 'end': this.endT += dt; if (this.endT > 1 && Input.anyPressed()) { SFX.menu(); this.state = 'play'; this.view = 'world'; } return;
      case 'slide': return this.updateSlide(dt);
      case 'play': return this.updatePlay(dt);
    }
  },
  updatePlay(dt) {
    if (this.pending) { this.playPending(); return; }
    if (Input.pressed('start')) { SFX.menu(); this.state = 'pause'; this.pauseAt = performance.now(); Input.lastTap = null; this.ptab = 0; this.psel = 0; this.menu = 0; return; }
    if (this.hitstop > 0) { this.hitstop -= dt; return; }
    if (this.shake > 0) this.shake -= dt;
    if (this.raised) { this.raised.t -= dt; if (this.raised.t <= 0) this.raised = null; }
    SAVE.playTime = (SAVE.playTime || 0) + dt;
    const P = this.player, A = this.area;
    P.update(dt, this);
    this.updateWind(dt);
    LumiFx.update(dt, this); Soupe.update(dt, this); Peche.update(dt, this);
    if (SAVE.met_lumi) Lumi.update(dt, P);
    if (this.freezeT > 0) this.freezeT -= dt;
    if (this.flashT > 0) this.flashT -= dt;
    if (A.id === 'castle' && !SAVE.sealGateOpen && SEALS.every(q => SAVE[q[0]]) && this.room === A.h.R.hall && P.y < this.roomRect().y + 200) { this.sealCeremony(); return; }
    for (const e of A.ents) {
      if (e.dead || !e.update || !this.inRoom(e)) continue;
      if (this.freezeT > 0 && ((e.isEnemy && !e.noFreeze) || e.isTrap || e.isOrb)) continue;
      e.update(dt, this);
    }
    A.ents = A.ents.filter(e => !e.dead);
    this.checkArena();
    if (A.update) A.update(this, dt);
    this.parts.update(dt);
    if (this.state !== 'play') return;
    // transitions entre zones
    const t = A.tileAt(P.x, P.y - 1);
    if (A.exits && A.exits[t] && !this.fade) { const go = A.exits[t]; this.fadeTo(() => go(this)); }
    if (this.fade) return;
    if (A.rooms) { const r = this.roomOf(P.x, P.y); if (r !== this.room) this.startSlide(r); }
    this.updateCam();
  },
  startSlide(to) {
    const from = this.room, r0 = this.roomRect(from), r1 = this.roomRect(to), P = this.player;
    const dx = Math.sign(r1.x - r0.x), dy = Math.sign(r1.y - r0.y);
    this.slide = { from, to, t: 0, cx0: this.cam.x, cy0: this.cam.y, cx1: r1.x, cy1: r1.y + 1, px: P.x, py: P.y, dx, dy };
    P.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up'; P.vx = P.vy = 0; P.atk = 0; P.roll = 0;
    this.room = to; this.state = 'slide'; this.area.arenaOn = null;
    this.area.ents = this.area.ents.filter(e => !e.isOrb && !e.isShot);
    spawnRoom(this.area, to);
  },
  updateSlide(dt) {
    const s = this.slide; s.t += dt; const k = clamp(s.t / 0.6, 0, 1), e = k * k * (3 - 2 * k);
    this.cam.x = lerp(s.cx0, s.cx1, e); this.cam.y = lerp(s.cy0, s.cy1, e);
    const P = this.player; P.x = s.px + s.dx * 44 * e; P.y = s.py + s.dy * 44 * e; P.moving = true; P.anim += dt;
    if (SAVE.met_lumi) Lumi.update(dt, P);
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
    if (d.choices && d.i === d.lines.length - 1 && d.c >= full) {
      if (Input.pressed('down') || Input.pressed('right')) { d.pick = (d.pick + 1) % d.choices.length; SFX.menu(); }
      if (Input.pressed('up') || Input.pressed('left')) { d.pick = (d.pick + d.choices.length - 1) % d.choices.length; SFX.menu(); }
      const tap = Input.lastTap; if (tap && performance.now() - tap.time < 250) { Input.lastTap = null; const i = d.choices.findIndex((c, k) => tap.y > d.cy + k * 14 - 2 && tap.y < d.cy + k * 14 + 12 && tap.x > d.cx - 10); if (i >= 0) { d.pick = i; Input.held.a = true; Input.prev.a = false; } }
      if (Input.pressed('a') || Input.pressed('b')) { const pick = Input.pressed('b') ? d.choices.length - 1 : d.pick; this.dialog = null; this.state = 'play'; this.player.atk = 0; Input.prev.a = true; Input.prev.b = true; SFX.menu(); d.onPick(pick); }
      return;
    }
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
    if (this.view === 'title') {
      if (this.state === 'slots') this.drawSlots(); else if (this.state === 'heroes') this.drawHeroes(); else this.drawTitle();
      this.drawFade(); drawVirtualPad(); return;
    }
    if (this.view === 'end') { this.drawEnd(); this.drawFade(); return; }
    if (this.view === 'credits') { this.drawCredits(); this.drawFade(); return; }
    this.drawWorld();
    if (!this.isMontage && !(this.state === 'cut' && this.cut && this.cut.noHud)) this.drawHUD();
    if (this.state === 'fish') Fishing.draw(this);
    if (this.state === 'dialog') this.drawDialog();
    if (this.state === 'pause') this.drawPause();
    if (this.state === 'shop') this.drawShop();
    if (this.state === 'travel') this.drawTravel();
    if (this.state === 'cut' && this.cut) this.cut.draw();
    if (this.state === 'over') this.drawOver();
    this.drawFade();
    if (this.state !== 'cut') drawVirtualPad();
    if (Input.toast.t > 0) { const w = textW(Input.toast.msg, 8) + 16; R(W / 2 - w / 2, H - 30, w, 16, 'rgba(7,13,31,.85)'); text(Input.toast.msg, W / 2, H - 26, { align: 'center', color: PAL.glow }); }
  },
  drawWorld() {
    const A = this.area, P = this.player;
    const sx = this.shake > 0 ? rand(-2, 2) : 0, sy = this.shake > 0 ? rand(-2, 2) : 0;
    const cx = Math.round(this.cam.x + sx), cy = Math.round(this.cam.y + sy);
    ctx.save(); ctx.translate(-cx, -cy);
    const LY = (A.paint && IMG[A.paint]) || A.layer; // carte peinte (image) ou tuiles dessinées
    if (A.w <= W || A.h <= H) ctx.drawImage(LY, 0, 0, A.w, A.h);
    else { const sxp = clamp(cx * 2, 0, LY.width - W * 2), syp = clamp(cy * 2, 0, LY.height - H * 2); ctx.drawImage(LY, sxp, syp, W * 2, H * 2, sxp / 2, syp / 2, W, H); }
    if (A.theme === 'camp') for (let ty = Math.floor(cy / TS); ty <= Math.floor((cy + H) / TS); ty++) for (let tx = Math.floor(cx / TS); tx <= Math.floor((cx + W) / TS); tx++) {
      if (A.tile(tx, ty) !== '~') continue;
      const ph = Math.sin(this.t * 2 + tx * 1.7 + ty * 2.3);
      if (ph > 0.75) R(tx * TS + 4 + ((tx * 7 + ty * 3) % 8), ty * TS + 6 + ((tx * 5) % 6), 3, 0.5, '#9ab8ff');
    }
    if (A.id === 'royaume' && Math.sin(this.t * 0.7) > 0.6) { const ex = 22 * TS + 22 + Math.sin(this.t * 0.3) * 14; R(ex, 12, 1.5, 1, '#ffe27a'); R(ex + 5, 12, 1.5, 1, '#ffe27a'); }
    const list = [];
    for (const p of A.props) list.push({ y: p.y, p });
    for (const e of A.ents) if (!e.dead) { if (!this.slide && !this.inRoom(e)) continue; if (this.isMontage && (e.isEnemy || e.isOrb)) continue; list.push({ y: e.ground ? -1e9 : e.y, e }); }
    if (!this.isMontage) list.push({ y: P.y, e: P });
    list.sort((a, b) => a.y - b.y);
    for (const it of list) {
      if (it.p) {
        const p = it.p; let im = IMG[p.k];
        if (p.k === 'campfire' && Math.floor(this.t * 7) % 2) im = IMG.campfire2 || im;
        if (im) ctx.drawImage(im, half(p.x - p.iw / 2), half(p.y - p.ih + 1), p.iw, p.ih);
      } else {
        if (!it.e.ghost) it.e.draw(); // ghost : déjà peint sur la carte
        if (SAVE.loupe && it.e.isEnemy && !it.e.isBoss && !it.e.dead && it.e.hp < it.e.maxHp) { const e = it.e, w = 14; R(half(e.x - w / 2), half(e.y - (e.alt || 0) - 26), w, 2, 'rgba(7,13,31,.8)'); R(half(e.x - w / 2), half(e.y - (e.alt || 0) - 26), w * Math.max(0, e.hp) / e.maxHp, 2, '#ff6a7a'); } // loupe du sage
        if (it.e.stunT > 0 && !it.e.dead) for (let i = 0; i < 3; i++) { const a = this.t * 5 + i * 2.1; R(half(it.e.x + Math.cos(a) * 7), half(it.e.y - (it.e.alt || 0) - 22 + Math.sin(a) * 2), 1.5, 1.5, i % 2 ? '#ffe27a' : '#fff'); }
      }
    }
    if (this.raised) {
      const at = this.raised.at, x = at ? at.x : P.x, y = at ? at.y - 30 * (this.raised.rise || 0) + Math.sin(this.t * 4) : P.y - 44 + Math.sin(this.t * 4), k = this.raised.kind;
      ctx.globalAlpha = 0.35; ell(x, y, 12, 12, '#ffe27a'); ctx.globalAlpha = 1;
      if (k === 'key') drawKey(x, y, 2); else if (k === 'heart') drawHeartShape(x, y, 2, '#ffcf3a', '#e09a20'); else drawItemIcon(k, x, y, 1.5);
    }
    if (SAVE.met_lumi && !this.isMontage) { Lumi.draw(); LumiFx.draw(this); }
    this.parts.draw();
    ctx.restore();
    this.drawLight(cx, cy);
    if (this.freezeT > 0) { ctx.globalAlpha = Math.min(0.22, this.freezeT * 0.2); R(0, 0, W, H, '#8fb8ff'); ctx.globalAlpha = 1; }
    if (this.flashT > 0) { ctx.globalAlpha = this.flashT * 3; R(0, 0, W, H, '#fff6e0'); ctx.globalAlpha = 1; }
    if (A.sky) A.sky(this);
    if (A.theme === 'camp') { // lucioles au-dessus de la nuit
      ctx.save(); ctx.translate(-cx, -cy);
      for (const f of this.flies) {
        const fx = (f.x + cx * 0.3) % A.w, x = fx + Math.sin(this.t * f.s + f.p) * 20, y = (f.y + cy * 0.6) % A.h + Math.cos(this.t * f.s * 0.7 + f.p) * 14, a = 0.5 + 0.5 * Math.sin(this.t * 3 * f.s + f.p);
        if (x < cx - 4 || x > cx + W + 4 || y < cy - 4 || y > cy + H + 4) continue;
        ctx.globalAlpha = a * 0.35; ell(x, y, 3, 3, '#ffe27a'); ctx.globalAlpha = a; R(half(x), half(y), 1, 1, '#fff6c0');
      }
      ctx.globalAlpha = 1; ctx.restore();
    }
  },
  lightsList(cx, cy) {
    const A = this.area, P = this.player, L = [];
    L.push({ x: P.x, y: P.y - 12, r: (A.rooms ? 120 : 112) * (Effects.on('light') ? 1.7 : 1) * (Flies.pow() >= 1 ? 1.35 : 1), c: 'rgba(200,220,255,' });
    if (SAVE.met_lumi) L.push(Lumi.light);
    for (const p of A.props) if (p.light) L.push({ x: p.x, y: p.y + (p.light.oy || -8), r: p.light.r, c: p.light.c, flick: p.light.flick, warm: p.light.warm });
    for (const e of A.ents) {
      if (e.dead || (!this.slide && !this.inRoom(e))) continue;
      const li = e.light; if (li) { const lp = e.lightPos; L.push({ x: lp ? lp[0] : e.x, y: lp ? lp[1] - 6 : e.y - (e.alt || 6) - 6, r: li.r, c: li.c, flick: li.flick, warm: li.warm }); }
      if (e.lights) for (const l of e.lights) L.push({ x: e.x + l.dx, y: e.y + l.dy, r: l.r, c: l.c });
      if (e.isEnemy && !li && !e.isBoss) L.push({ x: e.x, y: e.y - (e.alt || 0) - 8, r: 30, c: 'rgba(255,150,170,' }); // halo : on repère les ennemis dans le noir
    }
    return L.filter(l => l.x + l.r > cx && l.x - l.r < cx + W && l.y + l.r > cy && l.y - l.r < cy + H);
  },
  drawLight(cx, cy) {
    const A = this.area, l = this.lctx, L = this.lightsList(cx, cy);
    l.setTransform(1, 0, 0, 1, 0, 0); l.globalCompositeOperation = 'source-over';
    l.clearRect(0, 0, W * SC, H * SC);
    const rd = this.darkFrom != null ? this.darkFrom : A.roomDark ? A.roomDark(this.room) : null;
    // DARK_K : luminosité globale (le voile de nuit est atténué partout)
    l.fillStyle = `rgba(4,8,26,${((rd != null ? rd : A.dark) * DARK_K).toFixed(3)})`;
    l.fillRect(0, 0, W * SC, H * SC);
    l.globalCompositeOperation = 'destination-out';
    for (const o of L) {
      const r = (o.r + (o.flick ? Math.sin(this.t * 13) * 3 + Math.sin(this.t * 7.3) * 2 : 0)) * SC, x = (o.x - cx) * SC, y = (o.y - cy) * SC;
      const g = l.createRadialGradient(x, y, 0, x, y, r);
      for (let i = 0; i <= 10; i++) { const t = i / 10, a = Math.pow(1 - t * t, 2); g.addColorStop(t, `rgba(0,0,0,${a.toFixed(3)})`); }
      l.fillStyle = g; l.beginPath(); l.arc(x, y, r, 0, 7); l.fill();
    }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(this.light, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    for (const o of L) {
      if (o.c.startsWith('rgba(200,220,255')) continue;
      const r = o.r * SC * (o.warm ? 0.8 : 0.6), x = (o.x - cx) * SC, y = (o.y - cy) * SC, k = o.flick ? 0.16 + Math.sin(this.t * 11) * 0.03 : 0.12;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); for (let i = 0; i <= 8; i++) { const t = i / 8; g.addColorStop(t, o.c + (k * 1.3 * Math.pow(1 - t * t, 2)).toFixed(3) + ')'); }
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
    ctx.restore(); resetT();
  },
};
Object.assign(G, UIMixin);

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
