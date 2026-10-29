'use strict';
// ---------- interface : HUD, dialogues, menus, boutique, écrans ----------

// icônes d'objets (centrées sur x, y)
function drawItemIcon(id, x, y, s = 1) {
  if (id === 'lance_pierre') return drawSlingIcon(x, y + 1, s);
  if (id === 'frisbee') return drawFrisbeeIcon(x, y, s);
  if (id === 'champignons') return PICKUPS.mushroom.draw(x, y + 5 * s);
  if (id === 'soupe') return drawItemIcon('sirop', x, y, s);
  if (id === 'cle' || id === 'key') return drawKey(x, y, s);
  if (id === 'grappin') return drawHookIcon(x, y, s);
  if (id === 'petards' || id === 'petards5') return drawPetardIcon(x, y, s);
  if (id === 'palmes') return drawPalmesIcon(x, y, s);
  if (id === 'seal') return drawSealIcon(x, y, s);
  if (id === 'bigkey') { hi(x, y, false, () => { const u = 2 * s; D(-7 * u, -6 * u, 7 * u, 7 * u, '#ffd23a'); D(-5 * u, -4 * u, 3 * u, 3 * u, '#7a4a10'); D(0, -4 * u, 9 * u, 3 * u, '#ffd23a'); D(5 * u, -1 * u, 2 * u, 4 * u, '#ffd23a'); D(2 * u, -1 * u, 2 * u, 3 * u, '#ffd23a'); D(-7 * u, -6 * u, 7 * u, 1 * u, '#fff2c0'); }, 1); return; }
  if (String(id).startsWith('souv_')) return drawSouvenir(id.slice(5), x, y, s);
  if (id === 'quart_coeur') return drawHeartShape(x, y, 2 * s, '#ff8ab0', '#c84a7a');
  if (id === 'grande_bourse') return drawItemIcon('money', x, y, s * 1.3);
  if (id === 'carquois') { drawItemIcon('cailloux', x - 3, y, s * 0.8); return drawPetardIcon(x + 4, y, s * 0.7); }
  hi(x, y, false, () => {
    const u = 2;
    if (id === 'branche') { for (let i = 0; i < 6; i++) D(-6 * u + i * 2 * u, 5 * u - i * 2 * u, 3 * u, 2 * u, '#8a5a34'); D(4 * u, -7 * u, 3 * u, 3 * u, '#4f9a5a'); }
    if (id === 'epee_fer') { for (let i = 0; i < 6; i++) D(-4 * u + i * 2 * u, 3 * u - i * 2 * u, 2 * u, 2 * u, '#c8ccd8'); D(-7 * u, 2 * u, 5 * u, 1 * u, '#c8a040'); D(-6 * u, 4 * u, 2 * u, 2 * u, '#6a4224'); }
    if (id === 'bourse') { D(-4 * u, -2 * u, 8 * u, 7 * u, '#8a5a34'); D(-2 * u, -4 * u, 4 * u, 2 * u, '#6a4224'); D(-1 * u, 0, 2 * u, 2 * u, '#ffd23a'); }
    if (id === 'epee_bois') { for (let i = 0; i < 6; i++) D(-4 * u + i * 2 * u, 3 * u - i * 2 * u, 2 * u, 2 * u, '#d8b07a'); D(-7 * u, 2 * u, 5 * u, 1 * u, '#6a4224'); D(-6 * u, 4 * u, 2 * u, 2 * u, '#6a4224'); }
    if (id === 'bouclier') { D(-5 * u, -6 * u, 10 * u, 9 * u, '#7a4a24'); D(-4 * u, 3 * u, 8 * u, 2 * u, '#7a4a24'); D(-2 * u, 5 * u, 4 * u, 1 * u, '#7a4a24'); D(-1 * u, -4 * u, 2 * u, 6 * u, '#c8a040'); D(-5 * u, -6 * u, 10 * u, 1 * u, '#a06a34'); }
    if (id === 'bouteille' || id === 'vide' || id === 'sirop') { D(-1 * u, -7 * u, 2 * u, 2 * u, '#c8b090'); D(-2 * u, -5 * u, 4 * u, 2 * u, '#c8e0f0'); D(-4 * u, -3 * u, 8 * u, 9 * u, '#c8e0f0'); if (id === 'sirop') D(-3 * u, -1 * u, 6 * u, 6 * u, '#e0304a'); D(-3 * u, -2 * u, 1 * u, 5 * u, '#ffffff'); }
    if (id === 'cailloux') { D(-5 * u, -1 * u, 4 * u, 4 * u, '#8a8698'); D(-1 * u, -4 * u, 4 * u, 4 * u, '#a8a4b8'); D(1 * u, 0, 4 * u, 4 * u, '#7a7688'); }
    if (id === 'fragment') { D(-1 * u, -6 * u, 2 * u, 12 * u, '#ffcf3a'); D(-6 * u, -1 * u, 12 * u, 2 * u, '#ffcf3a'); D(-3 * u, -3 * u, 6 * u, 6 * u, '#ffe27a'); D(-1 * u, -1 * u, 2 * u, 2 * u, '#fff'); }
    if (id === 'money') { D(-3 * u, -4 * u, 6 * u, 8 * u, '#ffd23a'); D(-2 * u, -3 * u, 4 * u, 6 * u, '#ffe27a'); D(-1 * u, -2 * u, 1 * u, 1 * u, '#fff'); }
  }, s);
}
function box(x, y, w, h, o = {}) {
  R(x - 2, y - 2, w + 4, h + 4, PAL.ink); R(x, y, w, h, o.fill || '#14244c');
  R(x + 1, y + 1, w - 2, 1, o.edge || PAL.lav); R(x + 1, y + h - 2, w - 2, 1, '#0c1530');
}
function heroHeight(id) { const sh = SHEETS[DATA.heroes[id].sheet]; return sh.meta.scale === '2' ? 37 : 31; }

const UIMixin = {
  // ---------- HUD ----------
  drawHUD() {
    const P = this.player, n = SAVE.maxHp / 2;
    R(4, 4, n * 11 + 6, 14, 'rgba(7,13,31,.55)');
    for (let i = 0; i < n; i++) {
      const x = 12 + i * 11, y = 11, v = clamp(P.hp - i * 2, 0, 2);
      drawHeartShape(x, y, 2, '#3a2a48', '#2a1d38');
      if (v > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x - 6, y - 6, v === 2 ? 12 : 6, 12); ctx.clip(); drawHeartShape(x, y, 2, PAL.heart, '#c02848'); ctx.restore(); }
    }
    let x = 4;
    const tool = Inventory.tool();
    if (tool) { // case B : outil équipé + munitions
      R(4, 21, 22, 22, 'rgba(7,13,31,.6)'); R(4, 21, 22, 1, PAL.lav); R(4, 42, 22, 1, PAL.lav); R(4, 21, 1, 22, PAL.lav); R(25, 21, 1, 22, PAL.lav);
      drawItemIcon(tool, 15, 31, 1); text('B', 6, 22, { size: 6, color: PAL.lav, bold: true });
      const it = Inventory.item(tool); if (it.ammo) text(String(Inventory.ammo(it.ammo)), 24, 35, { size: 6, align: 'right', color: Inventory.ammo(it.ammo) ? PAL.white : PAL.red, bold: true });
      x = 30;
    }
    // écus (+ clignote quand ça change)
    const fl = this.moneyFlash > 0;
    R(x, 24, 40, 14, 'rgba(7,13,31,.55)'); drawItemIcon('money', x + 8, 31, 0.8);
    text(String(Wallet.get()).padStart(2, '0'), x + 15, 26, { size: 8, color: fl ? '#fff6c0' : PAL.warm, bold: fl });
    if (this.area.rooms && this.area.dungeon && SAVE['bigkey_' + this.area.dungeon]) { R(x + 76, 24, 18, 14, 'rgba(7,13,31,.55)'); drawItemIcon('bigkey', x + 85, 31, 0.8); }
    if (Keys.get() > 0 && this.area.rooms) { R(x + 44, 24, 28, 14, 'rgba(7,13,31,.55)'); drawKey(x + 52, 31, 1); text('×' + Keys.get(), x + 58, 26, { size: 8, color: PAL.warm }); }
    // barre de vie du boss
    const boss = this.area.ents.find(e => e.isBoss && !e.dead && e.room === this.room && e.state !== 'sleep');
    if (boss && this.state !== 'slide') {
      const bw = 160, bx = (W - bw) / 2, by = H - 16;
      R(bx - 2, by - 12, bw + 4, 18, 'rgba(7,13,31,.75)');
      text(boss.name || 'La Grande Ombre', W / 2, by - 11, { size: 7, align: 'center', color: PAL.lav });
      R(bx, by, bw, 4, '#2a1d38'); R(bx, by, Math.round(bw * Math.max(0, boss.hp) / boss.maxHp), 4, boss.state === 'stun' ? PAL.warm : PAL.red); R(bx, by, bw, 1, 'rgba(255,255,255,.2)');
    }
    if (this.banner && this.state !== 'pause') {
      const a = clamp(Math.min(this.banner.t, 2.2 - this.banner.t) * 3, 0, 1); ctx.globalAlpha = a;
      const w = textW(this.banner.text, 12) + 30; R(W / 2 - w / 2, 34, w, 20, 'rgba(7,13,31,.75)'); R(W / 2 - w / 2, 34, w, 1, PAL.glow); R(W / 2 - w / 2, 53, w, 1, PAL.glow);
      text(this.banner.text, W / 2, 37, { size: 12, align: 'center', color: PAL.white }); ctx.globalAlpha = 1;
    }
  },

  // ---------- dialogues (avec portrait) ----------
  drawDialog() {
    const d = this.dialog, line = d.lines[d.i], bw = 360, bx = (W - bw) / 2, by = Input.padVisible ? 28 : 192, bh = 64;
    box(bx, by, bw, bh);
    const lumi = line.who === 'Lumi', face = line.face && IMG[`face_${line.face}_${line.mood}`] ? line.face : null;
    let tx = bx + 12;
    if (face || lumi) {
      R(bx + 8, by + 9, 46, 46, '#0c1530'); R(bx + 8, by + 9, 46, 1, '#2a3a6a');
      if (face) drawFace(face, line.mood, bx + 12, by + 12, 1.5);
      else { ctx.globalAlpha = 0.5; ell(bx + 31, by + 32, 14, 14, '#ffe27a'); ctx.globalAlpha = 1; drawLumi(bx + 31, by + 32 + Math.sin(this.t * 3), this.t); }
      tx = bx + 64;
    }
    if (line.who) { R(bx + 8, by - 8, textW(line.who, 8) + 10, 12, lumi ? '#ffe27a' : PAL.warm); text(line.who, bx + 13, by - 7, { color: PAL.ink, shadow: false, bold: true }); }
    const maxW = bx + bw - 14 - tx, shown = line.text.slice(0, Math.floor(d.c)), lines = wrap(line.text, maxW, 8);
    let count = 0, ty = by + 12;
    for (const ln of lines) { text(shown.slice(count, count + ln.length), tx, ty, { size: 8 }); count += ln.length + 1; ty += 12; }
    if (d.choices && d.i === d.lines.length - 1 && d.c >= line.text.length) {
      const cw = Math.max(...d.choices.map(c => textW(c, 8))) + 30, cx = bx + bw - cw - 6, cy = by - d.choices.length * 14 - 10;
      box(cx, cy, cw, d.choices.length * 14 + 6); d.cx = cx; d.cy = cy + 4;
      d.choices.forEach((c, k) => { const on = k === d.pick; text((on ? '▸ ' : '  ') + c, cx + 8, cy + 4 + k * 14, { size: 8, color: on ? PAL.glow : '#c8d0f0', bold: on }); });
    } else if (d.c >= line.text.length && Math.floor(this.t * 3) % 2) { ctx.fillStyle = PAL.glow; ctx.beginPath(); ctx.moveTo(bx + bw - 16, by + bh - 12); ctx.lineTo(bx + bw - 10, by + bh - 12); ctx.lineTo(bx + bw - 13, by + bh - 8); ctx.fill(); }
  },

  drawMenu(items, x, y, sel = this.menu) {
    items.forEach((it, i) => {
      const on = i === sel;
      text(it, x, y + i * 16, { size: 10, align: 'center', color: on ? PAL.glow : '#9aa4c8' });
      if (on) { const w = textW(it, 10); text('▸', x - w / 2 - 10, y + i * 16, { size: 10, color: PAL.glow }); }
    });
  },

  // ---------- pause : objets (grille), souvenirs, carte, options ----------
  pauseItems() {
    const L = [];
    if (SAVE.got_branche) L.push({ kind: 'weapon', id: SAVE.inv.weapon });
    for (const id of Inventory.tools()) L.push({ kind: 'tool', id });
    for (const id of ['bouclier', 'palmes']) if (Inventory.has(id)) L.push({ kind: 'gear', id });
    SAVE.inv.bottles.forEach((b, i) => L.push({ kind: 'bottle', i, id: b }));
    if (this.area.dungeon && SAVE['bigkey_' + this.area.dungeon]) L.push({ kind: 'key', id: 'bigkey' });
    return L;
  },
  pauseTabs: ['Objets', 'Souvenirs', 'Carte', 'Options'],
  updatePause() {
    if (Input.pressed('start') || Input.pressed('b')) { this.state = 'play'; SFX.menu(); return; }
    const tx = Input.lastTap; if (tx && tx.time > (this.pauseAt || 0) && performance.now() - tx.time < 250 && tx.x > W - 34 && tx.y < 32) { Input.lastTap = null; this.state = 'play'; SFX.menu(); return; }
    const nT = this.pauseTabs.length, grid = this.ptab === 0 || this.ptab === 1;
    if (Input.pressed('cycle')) { this.ptab = (this.ptab + 1) % nT; this.psel = 0; this.menu = 0; SFX.menu(); }
    const tap = Input.lastTap; Input.lastTap = null;
    if (tap && performance.now() - tap.time < 250 && tap.y < 30) { const t = Math.floor((tap.x - (W / 2 - 180)) / 90); if (t >= 0 && t < nT) { this.ptab = t; this.psel = 0; SFX.menu(); } return; }
    if (!grid) {
      if (Input.pressed('right')) { this.ptab = (this.ptab + 1) % nT; this.psel = 0; this.menu = 0; SFX.menu(); }
      if (Input.pressed('left')) { this.ptab = (this.ptab + nT - 1) % nT; this.psel = 0; this.menu = 0; SFX.menu(); }
    }
    if (grid) {
      const n = this.ptab === 0 ? this.pauseItems().length : Object.keys(SOUVENIRS).length, C = this.ptab === 0 ? 5 : 4;
      if (!n) { if (Input.pressed('right') || Input.pressed('left')) { this.ptab = (this.ptab + (Input.pressed('right') ? 1 : nT - 1)) % nT; SFX.menu(); } return; }
      const mv = d => { const v = this.psel + d; if (v >= 0 && v < n) { this.psel = v; SFX.menu(); } };
      if (Input.pressed('right')) { if (this.psel % C === C - 1 || this.psel === n - 1) { this.ptab = (this.ptab + 1) % nT; this.psel = 0; SFX.menu(); } else mv(1); }
      if (Input.pressed('left')) { if (this.psel % C === 0) { this.ptab = (this.ptab + nT - 1) % nT; this.psel = 0; SFX.menu(); } else mv(-1); }
      if (Input.pressed('down')) mv(C); if (Input.pressed('up')) mv(-C);
      // toucher une case
      if (tap && performance.now() - tap.time < 250) { const g = this.gridGeom(C), i = Math.floor((tap.x - g.x0) / g.cw), j = Math.floor((tap.y - g.y0) / g.ch); if (i >= 0 && i < C && j >= 0) { const k = j * C + i; if (k < n) { if (k === this.psel) Input.held.a = true, Input.prev.a = false; this.psel = k; SFX.menu(); } } }
      if (this.ptab === 0 && Input.pressed('a')) {
        const e = this.pauseItems()[this.psel]; if (!e) return;
        if (e.kind === 'tool') { Inventory.equip(e.id); SFX.menu(); }
        if (e.kind === 'bottle') { if (Inventory.drink(e.i, this.player)) SFX.drink(); else SFX.nope(); }
      }
    } else if (this.ptab === 3) {
      this.menuNav(2);
      if (Input.pressed('a')) {
        SFX.menu();
        if (this.menu === 0) { PREFS.muted = !PREFS.muted; savePrefs(); }
        else { persist(); this.state = 'title'; this.view = 'title'; this.menu = 0; }
      }
    }
  },
  gridGeom(C) { return C === 5 ? { x0: 30, y0: 74, cw: 40, ch: 40 } : { x0: 40, y0: 74, cw: 48, ch: 48 }; },
  drawPause() {
    R(0, 0, W, H, 'rgba(4,8,26,.88)');
    this.pauseTabs.forEach((t, i) => {
      const x = W / 2 - 180 + i * 90, on = i === this.ptab;
      R(x + 3, 8, 84, 18, on ? '#2a5a66' : 'rgba(20,36,76,.8)'); if (on) R(x + 3, 25, 84, 1, PAL.glow);
      text(t, x + 45, 11, { size: 9.5, align: 'center', color: on ? PAL.white : '#7a84a8', bold: on });
    });
    R(W - 28, 6, 22, 22, 'rgba(20,36,76,.9)'); R(W - 28, 6, 22, 1, PAL.lav); R(W - 28, 27, 22, 1, PAL.lav); R(W - 28, 6, 1, 22, PAL.lav); R(W - 7, 6, 1, 22, PAL.lav);
    ctx.strokeStyle = PAL.white; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(W - 22, 12); ctx.lineTo(W - 12, 22); ctx.moveTo(W - 12, 12); ctx.lineTo(W - 22, 22); ctx.stroke();
    const obj = Story.objective();
    if (obj) { R(24, 32, W - 48, 18, 'rgba(255,207,122,.12)'); text('Objectif : ' + obj, W / 2, 36, { size: 7.5, align: 'center', color: PAL.warm }); }
    if (this.ptab === 0) this.drawInventory();
    if (this.ptab === 1) this.drawSouvenirs();
    if (this.ptab === 2) this.drawMapTab();
    if (this.ptab === 3) { text('Options', W / 2, 82, { size: 14, align: 'center', bold: true }); this.drawMenu(['Son : ' + (PREFS.muted ? 'non' : 'oui'), 'Sauvegarder et quitter'], W / 2, 116); }
    if (!Input.padVisible) {
      const roll = Heroes.def().roll;
      text('Flèches : choisir · Espace : utiliser · E : onglet suivant · Échap : fermer' + (roll ? ' · L = roulade' : ''), W / 2, H - 12, { size: 6.5, align: 'center', color: '#6a74a0' });
    }
  },
  drawCell(x, y, w, h, on, has) { R(x, y, w - 4, h - 4, on ? 'rgba(143,243,234,.18)' : 'rgba(20,36,76,.7)'); R(x, y, w - 4, 1, on ? PAL.glow : '#2a3a6a'); R(x, y + h - 5, w - 4, 1, '#0c1530'); if (on) { R(x, y, 1, h - 4, PAL.glow); R(x + w - 5, y, 1, h - 4, PAL.glow); R(x, y + h - 5, w - 4, 1, PAL.glow); } },
  drawInventory() {
    const L = this.pauseItems(), C = 5, g = this.gridGeom(C);
    text('Objets', g.x0, g.y0 - 14, { size: 9, color: PAL.lav, bold: true });
    for (let k = 0; k < Math.max(15, Math.ceil(L.length / C) * C); k++) {
      const i = k % C, j = Math.floor(k / C), x = g.x0 + i * g.cw, y = g.y0 + j * g.ch, e = L[k], on = k === this.psel;
      this.drawCell(x, y, g.cw, g.ch, on && !!e, !!e);
      if (!e) continue;
      drawItemIcon(e.kind === 'bottle' ? e.id : e.id, x + g.cw / 2 - 2, y + g.ch / 2 - 4, 1.1);
      if (e.kind === 'tool' && Inventory.tool() === e.id) { R(x + 2, y + 2, 9, 8, PAL.lav); text('B', x + 6.5, y + 2.5, { size: 6, align: 'center', color: PAL.ink, shadow: false, bold: true }); }
      if (e.kind === 'weapon') { R(x + 2, y + 2, 9, 8, '#ff8a9a'); text('A', x + 6.5, y + 2.5, { size: 6, align: 'center', color: PAL.ink, shadow: false, bold: true }); }
      const it = Inventory.item(e.id); if (it && it.ammo) text(String(Inventory.ammo(it.ammo)), x + g.cw - 7, y + g.ch - 14, { size: 6.5, align: 'right', bold: true });
    }
    // la sacoche
    const rx = 250, y0 = 60; text('Sacoche', rx, y0, { size: 9, color: PAL.lav, bold: true });
    const rows = [['money', `${Wallet.get()} / ${Wallet.cap()} écus`], ['fragment', `${SAVE.fragments || 0} / 6 fragments d'aube`]];
    if (Inventory.has('lance_pierre')) rows.push(['cailloux', `${Inventory.ammo('cailloux')} / ${Inventory.ammoMax('cailloux')} cailloux`]);
    if (Inventory.has('petards')) rows.push(['petards', `${Inventory.ammo('petards')} / ${Inventory.ammoMax('petards')} pétards`]);
    if (Inventory.ingredient('champignons') || SAVE.freed2) rows.push(['champignons', `${Inventory.ingredient('champignons')} champignon${Inventory.ingredient('champignons') > 1 ? 's' : ''}`]);
    if (this.area.rooms) rows.push(['cle', `${Keys.get()} petite${Keys.get() > 1 ? 's' : ''} clé${Keys.get() > 1 ? 's' : ''}` + (this.area.dungeon && SAVE['bigkey_' + this.area.dungeon] ? ' · grande clé' : '')]);
    if (this.area.id === 'castle') rows.push(['seal', `${SEALS.filter(q => SAVE[q[0]]).length} / 5 sceaux de l'aube`]);
    rows.forEach(([ic, t], i) => { drawItemIcon(ic, rx + 10, y0 + 22 + i * 20, 0.9); text(t, rx + 24, y0 + 17 + i * 20, { size: 8 }); });
    const sel = L[this.psel], it = sel && (sel.id === 'bigkey' ? { name: 'Grande clé', desc: 'Ouvre la porte du boss de ce donjon.' } : Inventory.item(sel.id === 'vide' ? 'bouteille' : sel.id));
    if (it) { R(24, H - 54, W - 48, 30, 'rgba(20,36,76,.7)'); text(it.name, W / 2, H - 50, { size: 8.5, align: 'center', bold: true, color: PAL.white }); text(it.desc + (sel.kind === 'bottle' && sel.id !== 'vide' ? '  A : boire.' : sel.kind === 'tool' ? '  A : équiper sur B.' : ''), W / 2, H - 38, { size: 7, align: 'center', color: '#c8d0f0' }); }
  },
  drawSouvenirs() {
    const ids = Object.keys(SOUVENIRS), C = 4, g = this.gridGeom(C), n = ids.filter(k => SAVE.souv && SAVE.souv[k]).length;
    text(`Souvenirs du monde réel : ${n} / 7`, g.x0, g.y0 - 14, { size: 9, color: PAL.lav, bold: true });
    ids.forEach((id, k) => {
      const i = k % C, j = Math.floor(k / C), x = g.x0 + i * g.cw, y = g.y0 + j * g.ch, has = SAVE.souv && SAVE.souv[id];
      this.drawCell(x, y, g.cw, g.ch, k === this.psel, true);
      if (has) drawSouvenir(id, x + g.cw / 2 - 2, y + g.ch / 2 - 2, 1.2); else text('?', x + g.cw / 2 - 2, y + g.ch / 2 - 10, { size: 14, align: 'center', color: '#3a4a7a', bold: true });
    });
    const id = ids[this.psel], S = SOUVENIRS[id], has = SAVE.souv && SAVE.souv[id];
    const rx = 250; R(rx - 6, 64, W - rx - 18, 120, 'rgba(20,36,76,.6)');
    if (has) { text(S.name, rx, 72, { size: 10, bold: true, color: PAL.warm }); wrap(S.desc, W - rx - 30, 8).forEach((l, i) => text(l, rx, 92 + i * 12, { size: 8, color: '#c8d0f0' })); }
    else { text('???', rx, 72, { size: 10, bold: true, color: '#7a84a8' }); wrap('Un objet de ton monde, perdu quelque part dans le royaume. Les habitants qui ont besoin d\'aide le savent peut-être.', W - rx - 30, 8).forEach((l, i) => text(l, rx, 92 + i * 12, { size: 8, color: '#7a84a8' })); }
    if (n === 7) text('Collection complète ! Une surprise t\'attend à la fin.', W / 2, H - 40, { size: 8, align: 'center', color: PAL.glow });
  },
  drawMapTab() {
    const A = this.area;
    if (A.map) { this.drawMap(W / 2 - 72, 64); return; }
    const bw = A.zone ? 260 : 360, bh = 160, s = Math.min(bw / A.w, bh / A.h), w = A.w * s, h = A.h * s, x0 = A.zone ? 40 : (W - w) / 2, y0 = 60;
    R(x0 - 3, y0 - 3, w + 6, h + 6, PAL.ink); ctx.drawImage(A.layer, x0, y0, w, h); R(x0, y0, w, h, 'rgba(4,8,26,.35)');
    for (const e of A.ents) if (e.isHouse) R(x0 + (e.x - e.w / 2) * s, y0 + (e.y - e.h) * s, e.w * s, e.h * s, '#a85a3a');
    if (Math.floor(this.t * 3) % 2) { R(x0 + this.player.x * s - 2, y0 + this.player.y * s - 2, 4, 4, PAL.glow); }
    text(A.name, x0 + w / 2, y0 + 4, { size: 7, align: 'center', color: PAL.warm });
    if (A.zone) this.drawWorldMini(x0 + w + 8, y0);
  },
  // petite carte du royaume : où l'on est
  drawWorldMini(x, y) {
    const Z = [['collines', 1, 0, 'Collines'], ['montagne', 2, 0, 'Montagne'], ['foret', 0, 1, 'Forêt'], ['royaume', 1, 1, 'Village'], ['terres', 0, 2, 'Terres'], ['lac', 1, 2, 'Lac'], ['cote', 2, 2, 'Côte']];
    for (const [id, cx, cy, name] of Z) { const on = this.area.id === id, seen = SAVE.visitedZ && SAVE.visitedZ[id]; R(x + cx * 30, y + cy * 22, 28, 20, on ? '#2a5a66' : seen ? '#2b2540' : '#141428'); if (on && Math.floor(this.t * 3) % 2) R(x + cx * 30 + 12, y + cy * 22 + 8, 4, 4, PAL.glow); if (seen || on) text(name, x + cx * 30 + 14, y + cy * 22 + 13, { size: 5, align: 'center', color: '#c8d0f0', shadow: false }); }
  },
  drawMap(x0, y0) {
    const A = this.area, cw = 48, ch = 28, M = A.map, C = A.rooms.cols;
    x0 -= (C - 3) * cw / 2;
    text(M.title, x0 + C * cw / 2, y0, { size: 8, align: 'center', color: PAL.lav });
    const links = M.links;
    const cell = i => ({ x: x0 + (i % C) * cw, y: y0 + 16 + Math.floor(i / C) * ch });
    const seen = i => SAVE.visited && SAVE.visited[A.id + i];
    for (const [a, b] of links) { if (!seen(a) && !seen(b)) continue; const p = cell(a), q = cell(b); R(Math.min(p.x, q.x) + cw / 2 - 2, Math.min(p.y, q.y) + ch / 2 - 2, Math.abs(p.x - q.x) + 4, Math.abs(p.y - q.y) + 4, '#3a3354'); }
    for (const i of A.rooms.list) {
      if (!seen(i)) continue;
      const p = cell(i), cur = i === this.room;
      R(p.x + 4, p.y + 3, cw - 8, ch - 6, cur ? '#2a5a66' : '#2b2540'); R(p.x + 4, p.y + 3, cw - 8, 1, cur ? PAL.glow : '#4a4266');
      if (cur && Math.floor(this.t * 3) % 2) R(p.x + cw / 2 - 2, p.y + ch / 2 - 2, 4, 4, PAL.glow);
      if (i === M.boss) text(SAVE[M.bossFlag] ? '✓' : '☠', p.x + cw / 2, p.y + 7, { size: 9, align: 'center', color: SAVE[M.bossFlag] ? PAL.green : PAL.red });
    }
  },

  // ---------- boutique ----------
  openShop(id) { this.shop = { id, sel: 0, msg: '', msgT: 0 }; this.state = 'shop'; },
  updateShop(dt) {
    const sh = this.shop, items = Shop.def(sh.id).items;
    if (sh.msgT > 0) sh.msgT -= dt;
    if (Input.pressed('b') || Input.pressed('start')) { this.state = 'play'; this.shop = null; Input.prev.b = true; SFX.menu(); return; }
    if (Input.pressed('down')) { sh.sel = (sh.sel + 1) % items.length; SFX.menu(); }
    if (Input.pressed('up')) { sh.sel = (sh.sel + items.length - 1) % items.length; SFX.menu(); }
    if (Input.pressed('a')) {
      const e = items[sh.sel], res = Shop.buy(sh.id, e);
      if (res.ok) { SFX.buy(); sh.msg = 'Merci ! ' + Inventory.item(e.id).name + ' ajouté' + (Inventory.item(e.id).kind === 'drink' ? 'e dans ta bouteille.' : ' à ton inventaire.'); }
      else { SFX.nope(); sh.msg = res.why + '.'; }
      sh.msgT = 2.2;
    }
  },
  drawShop() {
    const sh = this.shop, def = Shop.def(sh.id), bw = 340, bh = 196, bx = (W - bw) / 2, by = 30;
    R(0, 0, W, H, 'rgba(4,8,26,.55)'); box(bx, by, bw, bh);
    text(def.name, bx + 14, by + 10, { size: 12, bold: true, color: PAL.warm });
    drawItemIcon('money', bx + bw - 62, by + 17, 0.9); text(`${Wallet.get()} écus`, bx + bw - 54, by + 12, { size: 8, color: PAL.warm });
    def.items.forEach((e, i) => {
      const it = Inventory.item(e.id), st = Shop.state(sh.id, e), on = i === sh.sel, y = by + 36 + i * 30;
      R(bx + 10, y, bw - 20, 26, on ? 'rgba(143,243,234,.14)' : 'rgba(7,13,31,.4)'); if (on) R(bx + 10, y, 2, 26, PAL.glow);
      drawItemIcon(e.id === 'cailloux10' ? 'cailloux' : e.id, bx + 28, y + 13);
      text(it.name, bx + 44, y + 4, { size: 9, color: st.ok ? PAL.white : '#7a84a8', bold: on });
      if (!st.ok) text(st.why, bx + 44, y + 15, { size: 6.5, color: '#c88a9a' });
      if (e.cost) { const [k, n] = Object.entries(e.cost)[0]; drawItemIcon(k, bx + bw - 54, y + 13, 1); text(String(n), bx + bw - 46, y + 8, { size: 9, color: st.ok ? PAL.warm : '#7a84a8', bold: true }); }
      else { drawItemIcon('money', bx + bw - 54, y + 13, 0.8); text(String(e.price), bx + bw - 46, y + 8, { size: 9, color: st.ok ? PAL.warm : '#7a84a8', bold: true }); }
    });
    const e = def.items[sh.sel], desc = sh.msgT > 0 ? sh.msg : Inventory.item(e.id).desc;
    R(bx + 10, by + bh - 40, bw - 20, 1, '#2a3a6a');
    wrap(desc, bw - 28, 8).slice(0, 2).forEach((l, i) => text(l, bx + 14, by + bh - 34 + i * 11, { size: 8, color: sh.msgT > 0 ? PAL.glow : '#c8d0f0' }));
    text('A : acheter   ·   B : sortir', W / 2, by + bh + 8, { size: 7, align: 'center', color: '#9aa4c8' });
  },

  // ---------- titre, parties, choix du héros ----------
  titleItems() { const items = ['Jouer']; if (!PWA.installed()) items.push('Installer l\'appli'); return items; },
  menuTap(items, y0, x0 = W / 2, half = 90) {
    const tap = Input.lastTap; Input.lastTap = null;
    if (!tap || performance.now() - tap.time > 250) return -1;
    const i = Math.floor((tap.y - y0 + 2) / 16); return i >= 0 && i < items.length && Math.abs(tap.x - x0) < half ? i : -1;
  },
  updateTitle() {
    const items = this.titleItems(); if (this.menu >= items.length) this.menu = 0;
    if (this.installHelp) { if (Input.anyPressed() || Input.pressed('b')) { this.installHelp = false; SFX.menu(); } return; }
    this.menuNav(items.length);
    const ti = this.menuTap(items, 112); let go = Input.anyPressed(); if (ti >= 0) { this.menu = ti; go = true; }
    if (go) {
      audioUnlock(); SFX.menu();
      if (items[this.menu].startsWith('Installer')) { PWA.install().then(ok => { if (!ok) this.installHelp = true; }); return; }
      this.state = 'slots'; this.slotSel = 0; this.erasing = false;
    }
  },
  drawTitle() {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#070d1f'); g.addColorStop(1, '#14244c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    this.drawStars(3);
    ell(392, 52, 16, 16, '#f4f0d8'); ell(398, 48, 14, 14, '#070d1f');
    const pines = IMG.pine1, r = seeded(9);
    if (pines) for (let row = 0; row < 3; row++) {
      for (let i = -1; i < 18; i++) { const x = i * 30 + r() * 14 + row * 11, y = 170 + row * 22 + r() * 8, s = 0.55 + row * 0.15; ctx.drawImage(pines, x, y - 108 * s, 60 * s, 108 * s); }
      R(0, 0, W, H, `rgba(7,13,31,${0.45 - row * 0.12})`);
    }
    R(0, 240, W, 30, '#0a1420');
    ctx.globalAlpha = 0.25 + 0.1 * Math.sin(this.t * 2); ell(W / 2, 238, 70, 10, '#c3b3ff'); ctx.globalAlpha = 1;
    // les trois enfants face à la forêt
    if (DATA.heroes) Heroes.order().forEach((id, i) => drawHero(id, W / 2 + (i - 1) * 34, 248, 'up', false, this.t, 48 / heroHeight(id)));
    ctx.globalAlpha = 0.5; text('ESCAPE NIGHT 2', W / 2 + 1, 33, { size: 30, align: 'center', bold: true, color: PAL.teal, shadow: false }); ctx.globalAlpha = 1;
    text('ESCAPE NIGHT 2', W / 2, 32, { size: 30, align: 'center', bold: true, color: PAL.glow, shadowColor: PAL.ink });
    text('Le royaume d\'Aube-Figée', W / 2, 68, { size: 11, align: 'center', color: PAL.lav });
    this.drawMenu(this.titleItems(), W / 2, 112);
    if (this.installHelp) this.drawInstallHelp();
    text(VERSION, W - 6, H - 11, { size: 7, align: 'right', color: '#5a6a9a' });
    text(Input.gamepadName ? 'Manette prête' : 'Manette · clavier · tactile', 6, H - 11, { size: 7, color: '#5a6a9a' });
  },
  slotInfo(i) {
    const s = readSlot(i); if (!s) return null;
    const keep = SAVE; SAVE = Object.assign(defaultSave(s.hero), s, { inv: Object.assign(defaultSave().inv, s.inv || {}) });
    const info = { hero: s.hero, name: Heroes.name(s.hero), hearts: s.maxHp / 2, money: s.money, frags: s.fragments || 0, obj: Story.objective(), time: Math.floor((s.playTime || 0) / 60) };
    SAVE = keep; return info;
  },
  updateSlots() {
    if (Input.pressed('b')) { if (this.erasing) this.erasing = false; else { this.state = 'title'; this.menu = 0; } SFX.menu(); return; }
    if (Input.pressed('down')) { this.slotSel = (this.slotSel + 1) % 4; SFX.menu(); }
    if (Input.pressed('up')) { this.slotSel = (this.slotSel + 3) % 4; SFX.menu(); }
    const tap = Input.lastTap; Input.lastTap = null; let go = Input.pressed('a');
    if (tap && performance.now() - tap.time < 250) { for (let i = 0; i < 4; i++) { const y = 46 + i * 52; if (tap.y > y && tap.y < y + (i < 3 ? 46 : 20) && Math.abs(tap.x - W / 2) < 160) { this.slotSel = i; go = true; } } }
    if (!go) return;
    SFX.menu(); const i = this.slotSel;
    if (i === 3) { this.erasing = !this.erasing; return; }
    const info = this.slotInfo(i);
    if (this.erasing) { if (info) { eraseSlot(i); SFX.door(); } this.erasing = false; return; }
    if (info) { loadSlot(i); this.fadeTo(() => this.continueGame()); }
    else { this.newSlotIndex = i; this.heroSel = 0; this.state = 'heroes'; }
  },
  drawSlots() {
    this.drawTitleBackdrop();
    text(this.erasing ? 'Quelle partie effacer ?' : 'Choisis une partie', W / 2, 18, { size: 14, align: 'center', bold: true, color: this.erasing ? PAL.red : PAL.white });
    for (let i = 0; i < 3; i++) {
      const y = 46 + i * 52, on = i === this.slotSel, info = this.slotInfo(i), bx = W / 2 - 160;
      box(bx, y, 320, 44, { fill: on ? '#1e3a6a' : '#14244c', edge: on ? (this.erasing ? PAL.red : PAL.glow) : '#3a4a7a' });
      text(`${i + 1}`, bx + 12, y + 15, { size: 12, bold: true, color: on ? PAL.glow : '#5a6a9a' });
      if (!info) { text('Nouvelle partie', bx + 44, y + 15, { size: 10, color: on ? PAL.white : '#9aa4c8' }); continue; }
      drawHero(info.hero, bx + 44, y + 40, 'down', false, this.t, 34 / heroHeight(info.hero));
      text(info.name, bx + 66, y + 6, { size: 10, bold: true });
      for (let h = 0; h < info.hearts; h++) drawHeartShape(bx + 70 + h * 9, y + 23, 1.5, PAL.heart, '#c02848');
      drawItemIcon('money', bx + 70 + info.hearts * 9 + 8, y + 23, 0.8); text(String(info.money), bx + 70 + info.hearts * 9 + 15, y + 18, { size: 8, color: PAL.warm });
      text(info.obj, bx + 66, y + 31, { size: 6.5, color: '#9aa4c8' });
      text(`${info.frags}/6`, bx + 306, y + 6, { size: 7, align: 'right', color: '#ffcf3a' }); text(`${info.time} min`, bx + 306, y + 18, { size: 7, align: 'right', color: '#7a84a8' });
    }
    const on = this.slotSel === 3; text(this.erasing ? 'Annuler' : 'Effacer une partie', W / 2, 46 + 3 * 52 + 4, { size: 9, align: 'center', color: on ? (this.erasing ? PAL.white : PAL.red) : '#7a84a8', bold: on });
    text('A : choisir   ·   B : retour', W / 2, H - 14, { size: 7, align: 'center', color: '#6a74a0' });
  },
  updateHeroes() {
    if (Input.pressed('b')) { this.state = 'slots'; SFX.menu(); return; }
    if (Input.pressed('right')) { this.heroSel = (this.heroSel + 1) % 3; SFX.menu(); }
    if (Input.pressed('left')) { this.heroSel = (this.heroSel + 2) % 3; SFX.menu(); }
    const tap = Input.lastTap; Input.lastTap = null; let go = Input.pressed('a');
    if (tap && performance.now() - tap.time < 250 && tap.y > 40 && tap.y < 230) { const i = clamp(Math.floor((tap.x - 30) / 140), 0, 2); if (i === this.heroSel) go = true; else { this.heroSel = i; SFX.menu(); } }
    if (go) { SFX.chest(); this.newGame(this.newSlotIndex, Heroes.order()[this.heroSel]); }
  },
  drawHeroes() {
    this.drawTitleBackdrop();
    text('Qui part à l\'aventure ?', W / 2, 14, { size: 14, align: 'center', bold: true });
    Heroes.order().forEach((id, i) => {
      const d = Heroes.def(id), x = 100 + i * 140, on = i === this.heroSel;
      box(x - 62, 40, 124, 190, { fill: on ? '#1e3a6a' : '#14244c', edge: on ? PAL.glow : '#3a4a7a' });
      ctx.globalAlpha = on ? 0.35 : 0.15; ell(x, 140, 34, 8, '#c3b3ff'); ctx.globalAlpha = 1;
      drawHero(id, x, 140, 'down', on, this.t, 74 / heroHeight(id));
      text(d.name, x, 152, { size: 13, align: 'center', bold: true, color: on ? PAL.glow : PAL.white });
      wrap(d.desc, 112, 7.5).forEach((l, k) => text(l, x, 172 + k * 10, { size: 7.5, align: 'center', color: '#c8d0f0' }));
      wrap(d.perk, 112, 7.5).forEach((l, k) => text(l, x, 198 + k * 10, { size: 7.5, align: 'center', color: PAL.warm }));
    });
    text('◂ ▸ : choisir   ·   A : partir   ·   B : retour', W / 2, H - 14, { size: 7, align: 'center', color: '#6a74a0' });
  },
  drawTitleBackdrop() {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#070d1f'); g.addColorStop(1, '#14244c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    this.drawStars(5);
  },
  drawInstallHelp() {
    R(0, 0, W, H, 'rgba(4,8,26,.88)');
    const bw = 360, bx = (W - bw) / 2, by = 60, bh = 140;
    box(bx, by, bw, bh);
    text('Installer Escape Night 2', W / 2, by + 12, { size: 12, align: 'center', bold: true, color: PAL.glow });
    const lines = PWA.ios()
      ? ['Sur iPhone / iPad (Safari) :', '1. Touche le bouton Partager (carré avec une flèche).', '2. Choisis « Sur l\'écran d\'accueil ».', '3. Lance le jeu depuis la nouvelle icône.']
      : ['Ouvre le menu du navigateur (⋮ en haut à droite),', 'puis choisis « Installer l\'application »', 'ou « Ajouter à l\'écran d\'accueil ».', 'Le jeu marchera ensuite en plein écran, même hors ligne.'];
    lines.forEach((l, i) => text(l, bx + 20, by + 38 + i * 16, { size: 8, color: i === 0 && PWA.ios() ? PAL.warm : PAL.white }));
    if (Math.floor(this.t * 2) % 2) text('A : fermer', W / 2, by + bh - 16, { size: 8, align: 'center', color: PAL.glow });
  },

  // ---------- fin de partie, fin de la version 1 ----------
  drawOver() {
    const a = clamp(this.overT, 0, 1); R(0, 0, W, H, `rgba(4,4,12,${0.85 * a})`);
    if (this.overT < 0.6) return;
    text(Story.fmt('{hero} a eu trop peur…'), W / 2, 80, { size: 16, align: 'center', color: PAL.red, bold: true });
    if (this.overT >= 1.2) this.drawMenu(['Réessayer', 'Écran titre'], W / 2, 130);
  },
  drawEnd() {
    R(0, 0, W, H, PAL.ink); this.drawStars(1);
    const g = ctx.createLinearGradient(0, 150, 0, H); g.addColorStop(0, 'rgba(255,140,120,0)'); g.addColorStop(1, 'rgba(255,140,120,.25)'); ctx.fillStyle = g; ctx.fillRect(0, 150, W, H - 150);
    const n = this.endN || 1, E = [null,
      { title: 'Donjon 1 terminé', line: '{hero} a libéré {enfant1} de la grotte des lucioles.', next: 'Prochaine étape : le Bois des murmures, dans la Forêt, à l\'ouest du village. Les lucioles-relais sont réveillées !' },
      { title: 'Donjon 2 terminé', line: '{hero} a libéré Mamie du Bois des murmures.', next: 'Prochaine étape : les Mines des gnomes, dans la Montagne, à l\'est des Collines.' },
      { title: 'Donjon 3 terminé', line: '{hero} a libéré Amandine des Mines des gnomes.', next: 'Prochaine étape : le lac, au sud du village, et son temple englouti.' },
      { title: 'Donjon 4 terminé', line: '{hero} a libéré {enfant2} du Temple englouti.', next: 'Prochaine étape : la Tour des artificiers, sur l\'île de la Côte, à l\'est du Lac.' },
      { title: 'Donjon 5 terminé', line: '{hero} a retrouvé Goyave dans la Tour des artificiers.', next: 'Dernière étape : le Château de Minuit, dans les Terres de Minuit, à l\'ouest du Lac.' },
    ][n] || { title: 'Bravo', line: '', next: '' };
    text(E.title, W / 2, 30, { size: 20, align: 'center', bold: true, color: PAL.warm });
    text(Story.fmt(E.line), W / 2, 64, { size: 9, align: 'center' });
    text(`${SAVE.maxHp / 2} cœurs  ·  ${Wallet.get()} écus  ·  ${Math.max(1, Math.floor((SAVE.playTime || 0) / 60))} min de jeu  ·  ${SAVE.fragments || 0} fragment${(SAVE.fragments || 0) > 1 ? 's' : ''} d'aube sur 6`, W / 2, 82, { size: 8, align: 'center', color: '#9aa4c8' });
    text(E.next, W / 2, 100, { size: 8, align: 'center', color: PAL.lav });
    const crew = [x => drawHero(SAVE.hero, x, 214, 'down', false, this.t, 60 / heroHeight(SAVE.hero))];
    if (SAVE.freed1) crew.push(x => drawHero(Heroes.captive(1), x, 214, 'down', false, this.t + 1, 60 / heroHeight(Heroes.captive(1))));
    const spr = (k, h) => x => { const im = IMG['npc_' + k]; if (!im) return; const w = im.width * h / im.height; ctx.drawImage(im, x - w / 2, 214 - h, w, h); };
    if (SAVE.freed2) crew.push(spr('claudine', 62));
    if (SAVE.freed3) crew.push(spr('amandine', 62));
    if (SAVE.freed4) crew.push(x => drawHero(Heroes.captive(2), x, 214, 'down', false, this.t + 2, 60 / heroHeight(Heroes.captive(2))));
    if (SAVE.freed5) crew.push(spr('dog_down', 28));
    crew.forEach((f, i) => f(W / 2 + (i - (crew.length - 1) / 2) * 50));
    for (let i = 0; i < 24; i++) { const a = this.t * 0.6 + i * 0.7, x = W / 2 + Math.cos(a) * (80 + (i % 5) * 18), y = 170 + Math.sin(a * 1.3) * 30, k = 0.5 + 0.5 * Math.sin(this.t * 3 + i); ctx.globalAlpha = k * 0.4; ell(x, y, 3, 3, '#ffe27a'); ctx.globalAlpha = k; R(half(x), half(y), 1, 1, '#fff6c0'); }
    ctx.globalAlpha = 1;
    if (this.endT > 1 && Math.floor(this.t * 2) % 2) text('A : continuer à explorer', W / 2, H - 22, { size: 8, align: 'center', color: PAL.glow });
  },
  // ---------- voyage rapide (lucioles-relais) ----------
  openTravel(from) { this.travel = { from, list: Object.keys(RELAYS).filter(k => SAVE.relays && SAVE.relays[k] && k !== from) }; this.menu = 0; this.state = 'travel'; if (!this.travel.list.length) { this.state = 'play'; this.say([{ who: 'Lumi', text: 'La luciole-relais est réveillée ! Active les autres relais du royaume : elles te transporteront de l\'une à l\'autre.' }]); } },
  updateTravel() {
    const L = this.travel.list, n = L.length + 1;
    if (Input.pressed('b') || Input.pressed('start')) { this.state = 'play'; SFX.menu(); Input.prev.b = true; return; }
    this.menuNav(n);
    const ti = this.menuTap([...L.map(k => RELAYS[k].name), 'Rester ici'], 96); let go = Input.pressed('a'); if (ti >= 0) { this.menu = ti; go = true; }
    if (!go) return;
    if (this.menu >= L.length) { this.state = 'play'; SFX.menu(); return; }
    const R0 = RELAYS[L[this.menu]]; SFX.rift(); this.state = 'play';
    this.fadeTo(() => this.enter(R0.area, R0.pos(), false), '#fff2c0');
  },
  drawTravel() {
    R(0, 0, W, H, 'rgba(4,8,26,.7)');
    const L = this.travel.list, items = [...L.map(k => RELAYS[k].name), 'Rester ici'], bh = 50 + items.length * 16;
    box(W / 2 - 110, 60, 220, bh);
    text('Où veux-tu aller ?', W / 2, 70, { size: 10, align: 'center', bold: true, color: PAL.warm });
    this.drawMenu(items, W / 2, 96);
  },
  // ---------- générique de fin ----------
  updateCredits(dt) { if (this.endT > 3 && Input.anyPressed()) { const last = Object.keys(SOUVENIRS).every(k => SAVE.souv && SAVE.souv[k]) ? 3 : 2; if (this.creditsPage < last) { this.creditsPage++; this.endT = 0; SFX.menu(); } else { SFX.menu(); Story.set('theEnd'); this.fadeTo(() => { this.state = 'play'; this.view = 'world'; }); } } },
  drawCredits() {
    const p = this.creditsPage || 0;
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, p === 3 ? '#2a1a4a' : p === 2 ? '#ffd8a8' : '#1a2a5a'); g.addColorStop(1, p === 3 ? '#6a3a8a' : p === 2 ? '#fff2d8' : '#ff9a7a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (p < 2) { ell(W / 2, H - 20 + Math.max(-60, -this.endT * 12), 40, 40, '#fff2c0'); }
    if (p === 0) {
      text('Le soleil se lève sur Aube-Figée', W / 2, 26, { size: 16, align: 'center', bold: true, color: '#fff' });
      wrap(Story.fmt('Les six fragments réunis, le Roi Minuit a pris cent ans d\'un coup. Il passe ses journées à nourrir les pigeons de Bourg-Luciole. {hero}, sa famille et ses amis ont repassé la faille au lever du jour.'), 380, 9).forEach((l, i) => text(l, W / 2, 60 + i * 13, { size: 9, align: 'center', color: '#fff6e0' }));
      const crew = [SAVE.hero, Heroes.captive(1), Heroes.captive(2)];
      crew.forEach((h, i) => drawHero(h, W / 2 - 110 + i * 40, 220, 'down', false, this.t + i, 56 / heroHeight(h)));
      [['papa_down', 76, 0], ['claudine', 62, 1], ['amandine', 62, 2], ['dog_down', 26, 3]].forEach(([k, h, i]) => { const im = IMG['npc_' + k]; if (!im) return; const fw = k === 'papa_down' ? im.width / 9 : im.width, w = fw * h / im.height; ctx.drawImage(im, 0, 0, fw, im.height, W / 2 + 20 + i * 38 - w / 2, 220 - h, w, h); });
    } else if (p === 1) {
      text('Escape Night 2', W / 2, 30, { size: 22, align: 'center', bold: true, color: '#fff' });
      text('Le royaume d\'Aube-Figée', W / 2, 58, { size: 10, align: 'center', color: '#fff6e0' });
      [['Une idée, un univers et des pixels de', 'Damien'], ['Personnages', 'Sacha, Cam, Rox, Papa, Mamie, Amandine et Goyave'], ['Code et énigmes', 'Damien et Claude'], ['Merci d\'avoir joué !', '']].forEach(([a, b], i) => { text(a, W / 2, 92 + i * 34, { size: 8, align: 'center', color: '#ffe8c8' }); text(b, W / 2, 104 + i * 34, { size: 10, align: 'center', bold: true, color: '#fff' }); });
    } else if (p === 3) { // fin bonus : les sept souvenirs du monde réel
      text('Fin bonus : la collection complète', W / 2, 24, { size: 13, align: 'center', bold: true, color: '#ffe27a' });
      wrap(Story.fmt('De retour au camping, {hero} vide son sac sur la table. Sept objets de notre monde, perdus par la faille depuis des années… Le sage avait raison : la faille ne s\'ouvre pas que dans un sens.'), 400, 9).forEach((l, i) => text(l, W / 2, 48 + i * 13, { size: 9, align: 'center', color: '#f0e0ff' }));
      R(70, 150, 340, 8, '#8a5a34'); R(70, 150, 340, 2, '#b07a4a');
      Object.keys(SOUVENIRS).forEach((k, i) => { const x = 98 + i * 47, y = 140 + Math.sin(this.t * 2 + i) * 2; ell(x, 150, 12, 3, 'rgba(0,0,0,.3)'); drawSouvenir(k, x, y, 1.4); text(SOUVENIRS[k].name, x, 166 + (i % 2) * 10, { size: 6, align: 'center', color: '#fff' }); });
      wrap('Et au fond du sac, un dernier mot du sage : « À l\'année prochaine, voyageur. La nuit sera longue. »', 400, 9).forEach((l, i) => text(l, W / 2, 210 + i * 13, { size: 9, align: 'center', color: '#ffe27a' }));
    } else {
      text('Le lendemain matin, au camping…', W / 2, 24, { size: 12, align: 'center', bold: true, color: '#6a3a2a' });
      R(120, 150, 240, 50, '#a8703a'); R(120, 150, 240, 6, '#c8905a'); R(130, 200, 8, 30, '#6a4224'); R(342, 200, 8, 30, '#6a4224');
      for (let i = 0; i < 4; i++) { ell(160 + i * 50, 160, 12, 4, '#f4f0e8'); R(154 + i * 50, 156, 12, 4, i % 2 ? '#c84a2a' : '#e8c060'); }
      const im = IMG.npc_dog_down; if (im) { const h = 34, w = im.width * h / im.height; ctx.drawImage(im, 300 - w / 2, 236 - h, w, h); }
      hi(316, 230, false, () => { D(-2, -6, 18, 4, '#9a9eaa'); D(14, -10, 6, 12, '#c8a040'); D(15, -9, 4, 2, '#fff2c0'); }); // un bout d'épée médiévale
      wrap('Goyave mâchonne un drôle d\'objet en fer, gravé d\'un soleil… Ce n\'était peut-être pas un rêve.', 380, 9).forEach((l, i) => text(l, W / 2, 50 + i * 13, { size: 9, align: 'center', color: '#5a2a1a', shadow: false }));
      text('FIN', W / 2, 96, { size: 20, align: 'center', bold: true, color: '#8a3a2a', shadow: false });
    }
    if (this.endT > 3 && Math.floor(this.t * 2) % 2) text(p < 2 ? 'A : suite' : 'A : continuer à explorer', W / 2, H - 14, { size: 8, align: 'center', color: p === 2 ? '#6a3a2a' : '#fff' });
  },
  drawStars(seed) {
    const r = seeded(seed * 77 + 1);
    for (let i = 0; i < 90; i++) { const x = r() * W, y = r() * H * 0.75, tw = Math.sin(this.t * (1 + r() * 2) + i) > 0.3; R(Math.round(x), Math.round(y), 1, 1, tw ? '#f4f7ff' : '#5a6a9a'); }
  },
  drawFade() { if (!this.fade) return; const a = clamp(this.fade.dir === 1 ? this.fade.t : 1 - this.fade.t, 0, 1); ctx.globalAlpha = a; R(0, 0, W, H, this.fade.color || '#000'); ctx.globalAlpha = 1; },
};
