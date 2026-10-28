'use strict';
// ---------- le jeu : états, transitions, scènes, rendu du monde ----------
const G = {
  state: 'boot', t: 0, areas: {}, area: null, player: null, parts: new Parts(),
  cam: { x: 0, y: 0 }, shake: 0, hitstop: 0, dialog: null, fade: null, slide: null, room: 0,
  raised: null, menu: 0, banner: null, flies: [], view: 'title', pending: null,
  ptab: 0, psel: 0, shop: null, slotSel: 0, heroSel: 0, erasing: false, moneyFlash: 0,

  init() {
    this.areas.camp = buildCamp(); this.areas.royaume = buildRoyaumeArea(); this.areas.cave = buildCaveArea(); this.areas.bois = buildBoisArea();
    for (let i = 0; i < 26; i++) this.flies.push({ x: rand(0, 768), y: rand(0, 900), p: rand(0, 6), s: rand(0.4, 1) });
    this.light = document.createElement('canvas'); this.light.width = W * SC; this.light.height = H * SC; this.lctx = this.light.getContext('2d');
    Bus.on('money:changed', () => { this.moneyFlash = 0.4; });
    Bus.on('tool:equipped', ({ id }) => { if (this.view === 'world') Input.toast = { msg: 'B : ' + Inventory.item(id).name, t: 1.2 }; });
    this.state = 'title'; this.view = 'title'; this.menu = 0;
  },

  // ---------- parties ----------
  newGame(slot, hero) {
    newSlot(slot, hero);
    this.fadeTo(() => { this.enter('camp', this.areas.camp.start, true); this.pending = 'prologue'; });
  },
  continueGame() { const id = this.areas[SAVE.lastArea] ? SAVE.lastArea : 'camp'; this.enter(id, this.areas[id].start, true); },

  enter(id, pos, fresh) {
    this.area = this.areas[id]; this.area.arenaOn = null;
    this.room = this.area.rooms ? this.roomOf(pos.x, pos.y) : 0;
    this.area.spawn();
    const hp = this.player && !fresh ? this.player.hp : SAVE.maxHp;
    this.player = new Player(pos.x, pos.y, pos.dir); this.player.hp = Math.max(1, hp);
    Lumi.reset(this.player);
    this.parts.a = []; this.raised = null; this.slide = null;
    SAVE.lastArea = id; this.visit(); persist();
    this.banner = { text: this.area.name, t: 2.2 };
    this.state = 'play'; this.view = 'world'; this.updateCam(true);
    if (id === 'cave' && !SAVE.caveIntro) { SAVE.caveIntro = true; persist(); this.pending = 'caveIntro'; }
    if (id === 'bois' && !SAVE.boisIntro) { SAVE.boisIntro = true; persist(); this.pending = 'boisIntro'; }
    this.wind = null; this.windT = 0;
  },
  visit() { if (this.area.rooms) { SAVE.visited = SAVE.visited || {}; SAVE.visited[this.area.id + this.room] = 1; } },
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
    const P = this.player, A = this.area;
    if (A.rooms) { const rr = this.roomRect(); this.cam.x = rr.x; this.cam.y = rr.y + 1; return; }
    this.cam.x = clamp(P.x - W / 2, 0, A.w - W); this.cam.y = clamp(P.y - 12 - H / 2, 0, A.h - H);
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
    if (door) { P.bump = 1.5; if (SAVE.keys > 0) door.unlock(this); else { SFX.locked(); this.say([{ text: 'C\'est fermé à clé.' }]); } return; }
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
    } else if (!alive) {
      A.arenaOn = null; SAVE[ar.flag] = true; persist(); SFX.secret();
      if (ar.onClear) ar.onClear(this);
    }
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
    if (!sheltered) moveEnt(A, P, 0, 70 * dt, { noExit: true });
  },
  // répliques : brutes ou déjà mises en forme par Story
  say(lines, done) { this.dialog = { lines: lines.map(l => l.who !== undefined && 'mood' in l ? l : Story.lines([l])[0]), i: 0, c: 0, done }; this.state = 'dialog'; },
  raise(kind) { this.raised = { kind, t: 1.6 }; },
  gameOver() { this.state = 'over'; this.overT = 0; this.menu = 0; },

  // ---------- scènes ----------
  freeCaptive(n = 1) {
    this.say(Story.script(n === 1 ? 'freed' : 'freed' + n), () => {
      Story.set('freed' + n); SAVE.fragments = Math.max(SAVE.fragments || 0, n); persist(); SFX.bigheart();
      this.fadeTo(() => { this.enter('royaume', this.areas.royaume.start, false); this.pending = n === 1 ? 'reunion' : 'reunion' + n; }, '#fff2c0');
    });
  },
  showEnd(n) { Story.set('v' + n + 'done'); this.endN = n; this.fadeTo(() => { this.state = 'end'; this.view = 'end'; this.endT = 0; }); },
  playPending() {
    const p = this.pending; this.pending = null;
    if (p === 'reunion') return this.say(Story.script('reunion'), () => this.showEnd(1));
    if (p === 'reunion2') return this.say(Story.script('reunion2'), () => this.showEnd(2));
    if (p === 'caveIntro') return this.say([{ who: '{hero}', text: 'Une grotte… et des braseros allumés. Qui a bien pu les allumer ?', face: 'o' }, { who: 'Lumi', text: 'Les lucioles d\'ici sont prisonnières, elles aussi. Et je sens la présence de {enfant1}… tout au fond.' }]);
    this.say(Story.script(p));
  },

  // ---------- boucle ----------
  update(dt) {
    this.t += dt;
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
      case 'over': this.overT += dt; return this.updateOver();
      case 'end': this.endT += dt; if (this.endT > 1 && Input.anyPressed()) { SFX.menu(); this.state = 'play'; this.view = 'world'; } return;
      case 'slide': return this.updateSlide(dt);
      case 'play': return this.updatePlay(dt);
    }
  },
  updatePlay(dt) {
    if (this.pending) { this.playPending(); return; }
    if (Input.pressed('start')) { SFX.menu(); this.state = 'pause'; this.ptab = 0; this.psel = 0; this.menu = 0; return; }
    if (this.hitstop > 0) { this.hitstop -= dt; return; }
    if (this.shake > 0) this.shake -= dt;
    if (this.raised) { this.raised.t -= dt; if (this.raised.t <= 0) this.raised = null; }
    SAVE.playTime = (SAVE.playTime || 0) + dt;
    const P = this.player, A = this.area;
    P.update(dt, this);
    this.updateWind(dt);
    if (SAVE.met_lumi) Lumi.update(dt, P);
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
    if (A.id === 'royaume' && t === 'G') this.fadeTo(() => this.enter('cave', this.areas.cave.start));
    if (A.id === 'cave' && t === 'E') this.fadeTo(() => this.enter('royaume', this.areas.royaume.fromCave));
    if (A.id === 'royaume' && t === 'H') this.fadeTo(() => this.enter('bois', this.areas.bois.start));
    if (A.id === 'bois' && t === 'E') this.fadeTo(() => this.enter('royaume', this.areas.royaume.fromBois));
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
    this.drawWorld();
    this.drawHUD();
    if (this.state === 'dialog') this.drawDialog();
    if (this.state === 'pause') this.drawPause();
    if (this.state === 'shop') this.drawShop();
    if (this.state === 'over') this.drawOver();
    this.drawFade();
    if (this.state !== 'pause' && this.state !== 'shop') drawVirtualPad();
    if (Input.toast.t > 0) { const w = textW(Input.toast.msg, 8) + 16; R(W / 2 - w / 2, H - 30, w, 16, 'rgba(7,13,31,.85)'); text(Input.toast.msg, W / 2, H - 26, { align: 'center', color: PAL.glow }); }
  },
  drawWorld() {
    const A = this.area, P = this.player;
    const sx = this.shake > 0 ? rand(-2, 2) : 0, sy = this.shake > 0 ? rand(-2, 2) : 0;
    const cx = Math.round(this.cam.x + sx), cy = Math.round(this.cam.y + sy);
    ctx.save(); ctx.translate(-cx, -cy);
    const sxp = clamp(cx * 2, 0, A.layer.width - W * 2), syp = clamp(cy * 2, 0, A.layer.height - H * 2);
    ctx.drawImage(A.layer, sxp, syp, W * 2, H * 2, sxp / 2, syp / 2, W, H);
    if (A.theme === 'camp') for (let ty = Math.floor(cy / TS); ty <= Math.floor((cy + H) / TS); ty++) for (let tx = Math.floor(cx / TS); tx <= Math.floor((cx + W) / TS); tx++) {
      if (A.tile(tx, ty) !== '~') continue;
      const ph = Math.sin(this.t * 2 + tx * 1.7 + ty * 2.3);
      if (ph > 0.75) R(tx * TS + 4 + ((tx * 7 + ty * 3) % 8), ty * TS + 6 + ((tx * 5) % 6), 3, 0.5, '#9ab8ff');
    }
    if (A.id === 'royaume' && Math.sin(this.t * 0.7) > 0.6) { const ex = 22 * TS + 22 + Math.sin(this.t * 0.3) * 14; R(ex, 12, 1.5, 1, '#ffe27a'); R(ex + 5, 12, 1.5, 1, '#ffe27a'); }
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
      } else {
        it.e.draw();
        if (it.e.stunT > 0 && !it.e.dead) for (let i = 0; i < 3; i++) { const a = this.t * 5 + i * 2.1; R(half(it.e.x + Math.cos(a) * 7), half(it.e.y - (it.e.alt || 0) - 22 + Math.sin(a) * 2), 1.5, 1.5, i % 2 ? '#ffe27a' : '#fff'); }
      }
    }
    if (this.raised) {
      const x = P.x, y = P.y - 44 + Math.sin(this.t * 4), k = this.raised.kind;
      ctx.globalAlpha = 0.35; ell(x, y, 12, 12, '#ffe27a'); ctx.globalAlpha = 1;
      if (k === 'key') drawKey(x, y, 2); else if (k === 'heart') drawHeartShape(x, y, 2, '#ffcf3a', '#e09a20'); else drawItemIcon(k, x, y, 1.5);
    }
    if (SAVE.met_lumi) Lumi.draw();
    this.parts.draw();
    ctx.restore();
    this.drawLight(cx, cy);
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
    L.push({ x: P.x, y: P.y - 12, r: A.id === 'cave' ? 100 : 92, c: 'rgba(200,220,255,' });
    if (SAVE.met_lumi) L.push(Lumi.light);
    for (const p of A.props) if (p.light) L.push({ x: p.x, y: p.y + (p.light.oy || -8), r: p.light.r, c: p.light.c, flick: p.light.flick, warm: p.light.warm });
    for (const e of A.ents) {
      if (e.dead || (!this.slide && !this.inRoom(e))) continue;
      const li = e.light; if (li) L.push({ x: e.x, y: e.y - (e.alt || 6) - 6, r: li.r, c: li.c, flick: li.flick, warm: li.warm });
      if (e.lights) for (const l of e.lights) L.push({ x: e.x + l.dx, y: e.y + l.dy, r: l.r, c: l.c });
    }
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
