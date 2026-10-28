'use strict';
// ---------- interface : HUD, dialogues, menus, boutique, écrans ----------

// icônes d'objets (centrées sur x, y)
function drawItemIcon(id, x, y, s = 1) {
  if (id === 'lance_pierre') return drawSlingIcon(x, y + 1, s);
  if (id === 'frisbee') return drawFrisbeeIcon(x, y, s);
  if (id === 'champignons') return PICKUPS.mushroom.draw(x, y + 5 * s);
  if (id === 'soupe') return drawItemIcon('sirop', x, y, s);
  if (id === 'cle') return drawKey(x, y, s);
  hi(x, y, false, () => {
    const u = 2;
    if (id === 'branche') { for (let i = 0; i < 6; i++) D(-6 * u + i * 2 * u, 5 * u - i * 2 * u, 3 * u, 2 * u, '#8a5a34'); D(4 * u, -7 * u, 3 * u, 3 * u, '#4f9a5a'); }
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
    if (SAVE.keys > 0 && this.area.id === 'cave') { R(x + 44, 24, 28, 14, 'rgba(7,13,31,.55)'); drawKey(x + 52, 31, 1); text('×' + SAVE.keys, x + 58, 26, { size: 8, color: PAL.warm }); }
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
    if (d.c >= line.text.length && Math.floor(this.t * 3) % 2) { ctx.fillStyle = PAL.glow; ctx.beginPath(); ctx.moveTo(bx + bw - 16, by + bh - 12); ctx.lineTo(bx + bw - 10, by + bh - 12); ctx.lineTo(bx + bw - 13, by + bh - 8); ctx.fill(); }
  },

  drawMenu(items, x, y, sel = this.menu) {
    items.forEach((it, i) => {
      const on = i === sel;
      text(it, x, y + i * 16, { size: 10, align: 'center', color: on ? PAL.glow : '#9aa4c8' });
      if (on) { const w = textW(it, 10); text('▸', x - w / 2 - 10, y + i * 16, { size: 10, color: PAL.glow }); }
    });
  },

  // ---------- pause : objets, carte, options ----------
  pauseItems() {
    const L = Inventory.tools().map(id => ({ kind: 'tool', id }));
    SAVE.inv.bottles.forEach((b, i) => L.push({ kind: 'bottle', i, id: b }));
    return L;
  },
  updatePause() {
    if (Input.pressed('start') || Input.pressed('b')) { this.state = 'play'; SFX.menu(); return; }
    const tx = Input.lastTap; if (tx && tx.time > (this.pauseAt || 0) && performance.now() - tx.time < 250 && tx.x > W - 34 && tx.y < 32) { Input.lastTap = null; this.state = 'play'; SFX.menu(); return; }
    if (Input.pressed('right')) { this.ptab = (this.ptab + 1) % 3; this.psel = 0; this.menu = 0; SFX.menu(); }
    if (Input.pressed('left')) { this.ptab = (this.ptab + 2) % 3; this.psel = 0; this.menu = 0; SFX.menu(); }
    const tap = Input.lastTap; Input.lastTap = null;
    if (tap && performance.now() - tap.time < 250 && tap.y < 30) { const t = Math.floor((tap.x - (W / 2 - 150)) / 100); if (t >= 0 && t < 3) { this.ptab = t; this.psel = 0; SFX.menu(); } return; }
    if (this.ptab === 0) {
      const L = this.pauseItems(); if (!L.length) return;
      if (Input.pressed('down')) { this.psel = (this.psel + 1) % L.length; SFX.menu(); }
      if (Input.pressed('up')) { this.psel = (this.psel + L.length - 1) % L.length; SFX.menu(); }
      if (Input.pressed('a')) {
        const e = L[this.psel];
        if (e.kind === 'tool') { Inventory.equip(e.id); SFX.menu(); }
        if (e.kind === 'bottle') { if (Inventory.drink(e.i, this.player)) SFX.drink(); else SFX.nope(); }
      }
    } else if (this.ptab === 2) {
      this.menuNav(2);
      if (Input.pressed('a')) {
        SFX.menu();
        if (this.menu === 0) { PREFS.muted = !PREFS.muted; savePrefs(); }
        else { persist(); this.state = 'title'; this.view = 'title'; this.menu = 0; }
      }
    }
  },
  drawPause() {
    R(0, 0, W, H, 'rgba(4,8,26,.86)');
    ['Objets', 'Carte', 'Options'].forEach((t, i) => {
      const x = W / 2 - 150 + i * 100, on = i === this.ptab;
      R(x + 4, 8, 92, 18, on ? '#2a5a66' : 'rgba(20,36,76,.8)'); if (on) R(x + 4, 25, 92, 1, PAL.glow);
      text(t, x + 50, 11, { size: 10, align: 'center', color: on ? PAL.white : '#7a84a8', bold: on });
    });
    text('◂ ▸', W / 2 + 165, 12, { size: 9, color: '#5a6a9a' });
    // croix pour fermer le menu
    R(W - 28, 6, 22, 22, 'rgba(20,36,76,.9)'); R(W - 28, 6, 22, 1, PAL.lav); R(W - 28, 27, 22, 1, PAL.lav); R(W - 28, 6, 1, 22, PAL.lav); R(W - 7, 6, 1, 22, PAL.lav);
    ctx.strokeStyle = PAL.white; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(W - 22, 12); ctx.lineTo(W - 12, 22); ctx.moveTo(W - 12, 12); ctx.lineTo(W - 22, 22); ctx.stroke();
    const obj = Story.objective();
    if (obj) { R(24, 32, W - 48, 18, 'rgba(255,207,122,.12)'); text('Objectif : ' + obj, W / 2, 36, { size: 8, align: 'center', color: PAL.warm }); }
    if (this.ptab === 0) this.drawInventory();
    if (this.ptab === 1) this.drawMapTab();
    if (this.ptab === 2) { text('Options', W / 2, 82, { size: 14, align: 'center', bold: true }); this.drawMenu(['Son : ' + (PREFS.muted ? 'non' : 'oui'), 'Sauvegarder et quitter'], W / 2, 116); }
    const roll = Heroes.def().roll;
    text('Clavier : ZQSD · Espace = A · K = B · E = outil suivant' + (roll ? ' · L = roulade' : '') + ' · Échap = pause', W / 2, H - 22, { size: 6.5, align: 'center', color: '#6a74a0' });
    text('Manette : A · B' + (roll ? ' · X = roulade' : '') + ' · LB/RB = outil suivant · Start = pause', W / 2, H - 13, { size: 6.5, align: 'center', color: '#6a74a0' });
  },
  drawInventory() {
    const L = this.pauseItems(), y0 = 60;
    // colonne gauche : équipement
    text('Équipement', 34, y0, { size: 9, color: PAL.lav, bold: true });
    if (SAVE.got_branche) { drawItemIcon(SAVE.inv.weapon, 44, y0 + 22); text('A  ' + Inventory.weapon().name, 58, y0 + 17, { size: 8 }); text('Dégâts ×' + Inventory.dmg(), 58, y0 + 27, { size: 7, color: '#9aa4c8' }); }
    else text('A  Pas encore d\'arme', 40, y0 + 17, { size: 8, color: '#7a84a8' });
    let y = y0 + 44;
    if (!L.length) text('Aucun outil pour l\'instant.', 34, y, { size: 8, color: '#7a84a8' });
    L.forEach((e, i) => {
      const on = i === this.psel, label = e.kind === 'tool' ? Inventory.item(e.id).name + (Inventory.tool() === e.id ? '  (B)' : '') : (e.id === 'sirop' ? 'Sirop de grenadine' : 'Bouteille vide');
      R(30, y - 4, 196, 20, on ? 'rgba(143,243,234,.14)' : 'rgba(20,36,76,.5)'); if (on) R(30, y - 4, 2, 20, PAL.glow);
      drawItemIcon(e.kind === 'tool' ? e.id : e.id, 46, y + 6); text(label, 60, y + 1, { size: 8, color: on ? PAL.white : '#b8c0e0' });
      y += 24;
    });
    if (Inventory.has('bouclier')) { drawItemIcon('bouclier', 46, y + 6); text('Bouclier en bois', 60, y + 1, { size: 8, color: '#b8c0e0' }); y += 24; }
    // colonne droite : sacoche
    const rx = 262; text('Sacoche', rx, y0, { size: 9, color: PAL.lav, bold: true });
    const rows = [['money', `${Wallet.get()} / ${Wallet.cap()} écus`], ['fragment', `${SAVE.fragments || 0} / 6 fragments d'aube`]];
    if (Inventory.has('lance_pierre')) rows.push(['cailloux', `${Inventory.ammo('cailloux')} / ${Inventory.ammoMax('cailloux')} cailloux`]);
    if (Inventory.ingredient('champignons') || SAVE.freed2) rows.push(['champignons', `${Inventory.ingredient('champignons')} champignon${Inventory.ingredient('champignons') > 1 ? 's' : ''}`]);
    if (this.area.rooms) rows.push(['cle', `${SAVE.keys} petite${SAVE.keys > 1 ? 's' : ''} clé${SAVE.keys > 1 ? 's' : ''}`]);
    rows.forEach(([ic, t], i) => { drawItemIcon(ic, rx + 10, y0 + 22 + i * 22); text(t, rx + 24, y0 + 17 + i * 22, { size: 8 }); });
    // description
    const sel = L[this.psel], it = sel && Inventory.item(sel.id);
    if (it) { R(24, H - 58, W - 48, 26, 'rgba(20,36,76,.7)'); text(it.desc + (sel.kind === 'bottle' && sel.id === 'sirop' ? '  A : boire.' : sel.kind === 'tool' ? '  A : équiper sur B.' : ''), W / 2, H - 50, { size: 7.5, align: 'center', color: '#c8d0f0' }); }
  },
  drawMapTab() {
    const A = this.area;
    if (A.map) { this.drawMap(W / 2 - 72, 64); return; }
    const bw = 360, bh = 160, s = Math.min(bw / A.w, bh / A.h), w = A.w * s, h = A.h * s, x0 = (W - w) / 2, y0 = 60;
    R(x0 - 3, y0 - 3, w + 6, h + 6, PAL.ink); ctx.drawImage(A.layer, x0, y0, w, h); R(x0, y0, w, h, 'rgba(4,8,26,.35)');
    for (const e of A.ents) if (e instanceof House) R(x0 + (e.x - e.w / 2) * s, y0 + (e.y - e.h) * s, e.w * s, e.h * s, '#a85a3a');
    if (Math.floor(this.t * 3) % 2) { R(x0 + this.player.x * s - 2, y0 + this.player.y * s - 2, 4, 4, PAL.glow); }
    if (A.id === 'royaume') {
      text('Grotte des lucioles', x0 + w / 2, y0 + 4, { size: 7, align: 'center', color: PAL.warm });
      text('Collines du Nord', x0 + w / 2, y0 + h * 0.3, { size: 7, align: 'center', color: '#c8d0f0' });
      text('Bourg-Luciole', x0 + w / 2, y0 + h * 0.8, { size: 7, align: 'center', color: '#c8d0f0' });
    } else text(A.name, x0 + w / 2, y0 + 4, { size: 7, align: 'center', color: PAL.warm });
  },
  drawMap(x0, y0) {
    const A = this.area, cw = 48, ch = 28, M = A.map;
    text(M.title, x0 + 72, y0, { size: 8, align: 'center', color: PAL.lav });
    const links = M.links;
    const cell = i => ({ x: x0 + (i % 3) * cw, y: y0 + 16 + Math.floor(i / 3) * ch });
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
    const n = this.endN || 1, E = n === 1
      ? { title: 'Donjon 1 terminé', line: '{hero} a libéré {enfant1} de la grotte des lucioles.', next: 'À suivre : le Bois des murmures, Mamie… et un frisbee magique.' }
      : { title: 'Donjon 2 terminé', line: '{hero} a libéré Mamie du Bois des murmures.', next: 'À suivre : les Mines des gnomes, Amandine… et un grappin.' };
    text(E.title, W / 2, 30, { size: 20, align: 'center', bold: true, color: PAL.warm });
    text(Story.fmt(E.line), W / 2, 64, { size: 9, align: 'center' });
    text(`${SAVE.maxHp / 2} cœurs  ·  ${Wallet.get()} écus  ·  ${Math.max(1, Math.floor((SAVE.playTime || 0) / 60))} min de jeu  ·  ${SAVE.fragments || 0} fragment${(SAVE.fragments || 0) > 1 ? 's' : ''} d'aube sur 6`, W / 2, 82, { size: 8, align: 'center', color: '#9aa4c8' });
    text(E.next, W / 2, 100, { size: 8, align: 'center', color: PAL.lav });
    const crew = [x => drawHero(SAVE.hero, x, 214, 'down', false, this.t, 60 / heroHeight(SAVE.hero))];
    if (SAVE.freed1) crew.push(x => drawHero(Heroes.captive(1), x, 214, 'down', false, this.t + 1, 60 / heroHeight(Heroes.captive(1))));
    if (SAVE.freed2 && IMG.npc_claudine) crew.push(x => { const im = IMG.npc_claudine, h = 62, w = im.width * h / im.height; ctx.drawImage(im, x - w / 2, 214 - h, w, h); });
    crew.forEach((f, i) => f(W / 2 + (i - (crew.length - 1) / 2) * 52));
    for (let i = 0; i < 24; i++) { const a = this.t * 0.6 + i * 0.7, x = W / 2 + Math.cos(a) * (80 + (i % 5) * 18), y = 170 + Math.sin(a * 1.3) * 30, k = 0.5 + 0.5 * Math.sin(this.t * 3 + i); ctx.globalAlpha = k * 0.4; ell(x, y, 3, 3, '#ffe27a'); ctx.globalAlpha = k; R(half(x), half(y), 1, 1, '#fff6c0'); }
    ctx.globalAlpha = 1;
    if (this.endT > 1 && Math.floor(this.t * 2) % 2) text('A : continuer à explorer', W / 2, H - 22, { size: 8, align: 'center', color: PAL.glow });
  },
  drawStars(seed) {
    const r = seeded(seed * 77 + 1);
    for (let i = 0; i < 90; i++) { const x = r() * W, y = r() * H * 0.75, tw = Math.sin(this.t * (1 + r() * 2) + i) > 0.3; R(Math.round(x), Math.round(y), 1, 1, tw ? '#f4f7ff' : '#5a6a9a'); }
  },
  drawFade() { if (!this.fade) return; const a = clamp(this.fade.dir === 1 ? this.fade.t : 1 - this.fade.t, 0, 1); ctx.globalAlpha = a; R(0, 0, W, H, this.fade.color || '#000'); ctx.globalAlpha = 1; },
};
