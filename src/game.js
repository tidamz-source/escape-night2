'use strict';
const ROOM_H = 17 * TS; // hauteur d'une salle de la forêt (272 px)

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

function buildForestArea() {
  const A = new Area('forest', buildForest(), 'forest');
  A.roomSpawns = {
    0: [['shadow', 100, 80], ['shadow', 380, 80], ['shadow', 100, 200], ['shadow', 380, 200], ['wisp', 240, 64], ['bush', 60, 230], ['bush', 420, 230], ['bush', 60, 50], ['bush', 420, 50]],
    1: [['shadow', 100, 340], ['shadow', 380, 450], ['wisp', 380, 340], ['bush', 56, 480], ['bush', 424, 480], ['bush', 56, 330], ['bush', 160, 500], ['bush', 320, 500]],
  };
  A.spawnRoom = function (room) {
    this.ents = this.ents.filter(e => e.room !== room || !e.respawn);
    for (const [k, x, y] of this.roomSpawns[room]) {
      if (k === 'bush' && SOLID.has(this.tileAt(x, y - 2))) continue;
      const e = k === 'shadow' ? new Shadow(x, y, room) : k === 'wisp' ? new Wisp(x, y, room) : new Bush(x, y);
      e.room = room; e.respawn = true; this.ents.push(e);
    }
  };
  A.spawn = function () {
    this.ents = [new Chest(240, 414), new Door(240, 304), new FireflyHeart(240, 134)];
    this.ents[0].room = 1; this.ents[1].room = 1; this.ents[2].room = 0;
    this.spawnRoom(0); this.spawnRoom(1);
  };
  A.start = { x: 240, y: 500, dir: 'up' };
  A.name = 'La forêt des ombres';
  A.dark = 0.72;
  return A;
}

// ---------- le jeu ----------
const G = {
  state: 'boot', t: 0, areas: {}, area: null, player: null, parts: new Parts(),
  cam: { x: 0, y: 0 }, shake: 0, hitstop: 0, dialog: null, fade: null, slide: null, room: 1,
  raised: null, menu: 0, banner: null, flies: [], view: 'title',

  init() {
    this.areas.camp = buildCamp(); this.areas.forest = buildForestArea();
    for (let i = 0; i < 26; i++) this.flies.push({ x: rand(0, this.areas.camp.w), y: rand(0, this.areas.camp.h), p: rand(0, 6), s: rand(0.4, 1) });
    this.light = document.createElement('canvas'); this.light.width = W * SC; this.light.height = H * SC; this.lctx = this.light.getContext('2d');
    this.state = 'title'; this.view = 'title'; this.menu = 0;
  },

  newGame() { const muted = SAVE.muted; SAVE = defaultSave(); SAVE.muted = muted; SAVE.started = true; persist(); this.enter('camp', this.areas.camp.start, true); this.intro = true; },
  continueGame() { this.enter(SAVE.lastArea === 'forest' && !SAVE.done ? 'forest' : 'camp', SAVE.lastArea === 'forest' ? this.areas.forest.start : this.areas.camp.start, true); },

  enter(id, pos, fresh) {
    this.area = this.areas[id]; this.area.spawn();
    const hp = this.player && !fresh ? this.player.hp : SAVE.maxHp;
    this.player = new Player(pos.x, pos.y, pos.dir); this.player.hp = hp;
    this.room = id === 'forest' ? Math.floor(pos.y / ROOM_H) : 0;
    this.parts.a = []; this.raised = null; this.slide = null;
    SAVE.lastArea = id; persist();
    this.banner = { text: this.area.name, t: 2.2 };
    this.state = 'play'; this.view = 'world'; this.updateCam(true);
  },
  fadeTo(fn) { if (this.fade) return; this.fade = { t: 0, dir: 1, fn }; this.state = 'fade'; },

  roomRect() {
    if (this.area.id === 'forest') return { x: 0, y: this.room * ROOM_H, w: this.area.w, h: ROOM_H };
    return { x: 0, y: 0, w: this.area.w, h: this.area.h };
  },
  updateCam(snap) {
    const P = this.player, A = this.area;
    if (A.id === 'forest') { this.cam.x = 0; this.cam.y = this.room * ROOM_H + 1; return; }
    const tx = clamp(P.x - W / 2, 0, A.w - W), ty = clamp(P.y - 12 - H / 2, 0, A.h - H);
    this.cam.x = tx; this.cam.y = ty;
  },

  // ---------- interactions ----------
  interactTarget(P) {
    const fb = P.frontBox();
    for (const e of this.area.ents) if (!e.dead && e.canInteract && e.canInteract(P) && rectHit(fb, boxOf(e))) return e;
    return null;
  },
  bumped(P) {
    const door = this.area.ents.find(e => e instanceof Door && !e.dead);
    if (door && P.dir === 'up' && rectHit(P.frontBox(), boxOf(door))) {
      P.bump = 1.5;
      if (SAVE.keys > 0) door.unlock(this); else { SFX.locked(); this.say([{ text: 'C\'est fermé à clé.' }]); }
    }
  },
  attackHits(P) {
    const b = P.atkBox();
    for (const e of this.area.ents) {
      if (e.dead || !e.hit || P.atkHit.has(e)) continue;
      if (e.room != null && e.room !== this.room && this.area.id === 'forest') continue;
      if (rectHit(b, e.body ? e.body() : boxOf(e))) { P.atkHit.add(e); e.hit(1, P.x, P.y - 10, this); }
    }
  },
  say(lines, done) { this.dialog = { lines, i: 0, c: 0, done }; this.state = 'dialog'; },
  raise(kind, x, y) { this.raised = { kind, t: 1.6 }; },
  gameOver() { this.state = 'over'; this.overT = 0; this.menu = 0; },
  ending() { SAVE.done = true; persist(); this.fadeTo(() => { this.state = 'end'; this.view = 'end'; this.endT = 0; }); },

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
      if (e.dead || !e.update) continue;
      if (A.id === 'forest' && e.room != null && e.room !== this.room) continue;
      e.update(dt, this);
    }
    A.ents = A.ents.filter(e => !e.dead);
    this.parts.update(dt);
    // transitions
    const t = A.tileAt(P.x, P.y - 1);
    if (A.id === 'camp' && t === 'F') this.fadeTo(() => this.enter('forest', this.areas.forest.start));
    if (A.id === 'forest' && t === 'E') this.fadeTo(() => this.enter('camp', this.areas.camp.fromForest));
    if (A.id === 'forest') { const r = Math.floor((P.y - 3) / ROOM_H); if (r !== this.room) this.startSlide(r); }
    this.updateCam();
  },
  startSlide(to) {
    this.slide = { from: this.room, to, t: 0, cy0: this.cam.y, cy1: to * ROOM_H + 1, py: this.player.y };
    this.room = to; this.state = 'slide'; this.area.ents = this.area.ents.filter(e => !e.isOrb);
    this.area.spawnRoom(to);
  },
  updateSlide(dt) {
    const s = this.slide; s.t += dt; const k = clamp(s.t / 0.55, 0, 1), e = k * k * (3 - 2 * k);
    this.cam.y = lerp(s.cy0, s.cy1, e);
    const P = this.player; P.y = s.py + (s.to < s.from ? -1 : 1) * 22 * e; P.moving = true; P.anim += dt;
    if (k >= 1) { this.slide = null; this.state = 'play'; this.area.spawnRoom(s.from); }
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
      else { this.dialog = null; this.state = 'play'; this.raised = null; this.player.atk = 0; Input.prev.a = true; if (d.done) d.done(); }
    }
  },
  menuNav(n) {
    if (Input.pressed('down')) { this.menu = (this.menu + 1) % n; SFX.menu(); }
    if (Input.pressed('up')) { this.menu = (this.menu + n - 1) % n; SFX.menu(); }
  },
  titleItems() {
    const items = SAVE.started && !SAVE.done ? ['Continuer', 'Nouvelle partie'] : ['Nouvelle partie'];
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
    for (const e of A.ents) if (!e.dead) { if (A.id === 'forest' && e.room != null && Math.abs(e.room - this.room) > 0 && !this.slide) continue; list.push({ y: e.y, e }); }
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
      if (this.raised.kind === 'key') drawKey(x, y, 2); else drawHeartShape(x, y, 2, '#ffcf3a', '#e09a20');
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
    L.push({ x: P.x, y: P.y - 12, r: A.id === 'forest' ? 72 : 84, c: 'rgba(200,220,255,' });
    for (const p of A.props) if (p.light) L.push({ x: p.x, y: p.y + (p.light.oy || -8), r: p.light.r, c: p.light.c, flick: p.light.flick, warm: p.light.warm });
    for (const e of A.ents) if (!e.dead && e.light && !(A.id === 'forest' && e.room != null && e.room !== this.room && !this.slide)) L.push({ x: e.x, y: e.y - (e.alt || 6) - 6, r: e.light.r, c: e.light.c });
    return L.filter(l => l.x + l.r > cx && l.x - l.r < cx + W && l.y + l.r > cy && l.y - l.r < cy + H);
  },
  drawLight(cx, cy) {
    const A = this.area, l = this.lctx, L = this.lightsList(cx, cy);
    l.setTransform(1, 0, 0, 1, 0, 0); l.globalCompositeOperation = 'source-over';
    l.clearRect(0, 0, W * SC, H * SC);
    l.fillStyle = `rgba(4,8,26,${A.dark})`; l.fillRect(0, 0, W * SC, H * SC);
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
    if (SAVE.keys > 0) { R(4, 19, 30, 12, 'rgba(7,13,31,.55)'); drawKey(12, 25, 1); text('×' + SAVE.keys, 19, 20.5, { size: 8, color: PAL.warm }); }
    if (this.banner) {
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
    R(0, 0, W, H, 'rgba(4,8,26,.7)');
    text('PAUSE', W / 2, 70, { size: 18, align: 'center', bold: true, color: PAL.white });
    this.drawMenu(['Reprendre', 'Son : ' + (SAVE.muted ? 'non' : 'oui'), 'Écran titre'], W / 2, 110);
    text('Clavier : flèches/ZQSD · Espace = A · Échap = pause   ·   Manette : stick/croix · A · Start', W / 2, 236, { size: 7, align: 'center', color: '#7a84a8' });
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
    text('Fin du prototype', W / 2, 70, { size: 20, align: 'center', bold: true, color: PAL.warm });
    text('Sacha a trouvé le cœur de luciole de la forêt des ombres.', W / 2, 106, { size: 8, align: 'center' });
    text('Merci d\'avoir joué ! La suite : un vrai donjon, un objet-clé et un boss.', W / 2, 122, { size: 8, align: 'center', color: '#9aa4c8' });
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
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js?v=' + VERSION).catch(() => {});
