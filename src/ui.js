'use strict';
// ---------- interface : HUD, dialogues, menus, boutique, écrans ----------

// icônes d'objets (centrées sur x, y)
function drawItemIcon(id, x, y, s = 1) {
  id = id || '';
  const im = IMG['item_' + ({ vide: 'bouteille', key: 'cle', money: 'ecu1', cailloux10: 'cailloux', pelote: 'troc_laine', heart: 'coeur' }[id] || id)];
  if (im) { const k = Math.min(0.6, 16 / Math.max(im.width, im.height)) * s, w = im.width * k, h = im.height * k; ctx.drawImage(im, Math.round((x - w / 2) * 2) / 2, Math.round((y - h / 2) * 2) / 2, w, h); return; }
  if (typeof EXTRA_ICONS !== 'undefined' && EXTRA_ICONS[id]) return EXTRA_ICONS[id](x, y, s);
  if (MATS[id]) return drawMatIcon(id, x, y, s);
  if (id.startsWith('mat_')) return drawMatIcon(id.slice(4), x, y, s);
  if (id.startsWith('troc_')) return drawTrocIcon(id.slice(5), x, y, s);
  if (['soupe_jardin', 'soupe_pecheur', 'bouillon', 'veloute', 'soupe_doree', 'elixir'].includes(id)) { const c = { soupe_jardin: '#8ac85a', soupe_pecheur: '#7ab0d8', bouillon: '#9a9aa8', veloute: '#ffe27a', soupe_doree: '#ffb02e', elixir: '#5ac8e8' }[id]; const u = s; R(x - 3 * u, y - 7 * u, 6 * u, 2 * u, '#c8a070'); R(x - 4 * u, y - 5 * u, 8 * u, 10 * u, '#dfe8f0'); R(x - 3 * u, y - 2 * u, 6 * u, 6 * u, c); R(x - 2 * u, y - 4 * u, 1 * u, 6 * u, '#fff'); return; }
  if (id === 'canne') { const u = s; ctx.save(); ctx.translate(x, y); ctx.rotate(-0.7); R(-1 * u, -9 * u, 2 * u, 18 * u, '#8a5a34'); R(-2 * u, 6 * u, 4 * u, 3 * u, '#5a3418'); ctx.restore(); ctx.strokeStyle = '#e8e8f0'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(x + 6 * u, y - 7 * u); ctx.lineTo(x + 7 * u, y + 5 * u); ctx.stroke(); R(x + 6 * u, y + 5 * u, 2 * u, 2 * u, '#e84a5a'); return; }
  if (id === 'loupe') { ell(x - 1, y - 2, 5 * s, 5 * s, '#c8a040'); ell(x - 1, y - 2, 3.6 * s, 3.6 * s, '#bfe8ff'); R(x + 2 * s, y + 2 * s, 2 * s, 6 * s, '#5a3418'); return; }
  if (id === 'encyclo') { R(x - 6 * s, y - 7 * s, 12 * s, 14 * s, '#3a6ab0'); R(x - 5 * s, y - 6 * s, 10 * s, 12 * s, '#4a8ad8'); R(x - 3 * s, y - 3 * s, 6 * s, 4 * s, '#ffe27a'); R(x - 6 * s, y + 6 * s, 12 * s, 1 * s, '#fff'); return; }
  if (id === 'appat') { ell(x, y, 3 * s, 3 * s, '#ffd23a'); R(x - 0.5 * s, y - 7 * s, 1 * s, 5 * s, '#c8ccd8'); R(x + 1 * s, y + 2 * s, 2 * s, 1 * s, '#c8ccd8'); return; }
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
  if (id === 'bourse_geante') return drawItemIcon('money', x, y, s * 1.6);
  if (id === 'sacoche_voyage') return drawItemIcon('carquois', x, y, s * 1.15);
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
// portrait d'une bête du bestiaire : on dessine une vraie instance, figée, dans la fiche
const PORTRAITS = {}, PORTRAIT_FIX = { Eel: { state: 'rise', up: 1, pk: 1.3 }, IronMole: { state: 'walk', rise: 1 }, WhirlQueen: { state: 'flop' } }; // ceux qui vivent sous l'eau ou sous terre : on les montre sortis
function beastPortrait(b, x, y, t) {
  let e = PORTRAITS[b.k];
  if (e === undefined) {
    try { const C = Function('return ' + b.k)(); e = new C(0, 0); e.room = -1; e.state = e.state === 'sleep' ? 'idle' : e.state; e.flash = 0; e.hp = e.maxHp || e.hp; Object.assign(e, PORTRAIT_FIX[b.k] || {}); } catch (_) { e = null; }
    PORTRAITS[b.k] = e;
  }
  if (!e) return;
  const k = e.pk || (b.boss ? 0.6 : b.mini ? 0.9 : 1.6);
  ctx.save(); ctx.beginPath(); ctx.rect(x - 90, y - 48, 180, 54); ctx.clip();
  ctx.globalAlpha = 0.25; ell(x, y + 1, 22, 5, UIC.woodD); ctx.globalAlpha = 1;
  ctx.translate(x, y); ctx.scale(k, k);
  try { e.x = 0; e.y = 0; e.t = t; e._px = 0; e._py = 0; e._di = 0; e._diT = 1; e.draw(); } catch (_) {}
  ctx.restore();
}
// ---------- habillage des menus : bois, parchemin, laiton ----------
const UIC = { ink: '#4a2c17', soft: '#7a5a3a', mute: '#a08462', title: '#7a3a1e', red: '#b8282a', redL: '#d33a36', gold: '#e0a743', goldL: '#f6d27a', rivet: '#5a3410',
  parch: '#f4e4c1', parchL: '#fff3d8', parchD: '#e3c996', cell: '#e7d0a2', cellE: '#ecdcb8', sel: '#fff1cf', edge: '#6b4325',
  wood: '#9a6638', woodD: '#7a4a26', woodL: '#c08850', plank: '#5b3920', plankD: '#4a2e19', dark: '#24130a', cream: '#f6e7c8' };
// texte sur parchemin (brun, sans ombre) ; o.font = 't' pour les titres en capitales pixel
const UI_TXT = 1.2; // agrandit tous les textes des menus
function ptext(str, x, y, o = {}) { text(str, x, y, Object.assign({ color: UIC.ink, shadow: false }, o, { size: (o.size || 8) * UI_TXT })); }
// texte crème sur le bois (avec ombre portée brune)
function wtext(str, x, y, o = {}) { text(str, x, y, Object.assign({ color: UIC.cream, shadowColor: UIC.dark }, o, { size: (o.size || 8) * UI_TXT })); }
// fond de planches (écrans de menu plein écran)
function woodBg() {
  R(0, 0, W, H, UIC.plank);
  for (let y = 0, k = 0; y < H; y += 18, k++) { R(0, y + 16, W, 1, UIC.plankD); R(0, y + 17, W, 1, '#2e1a0d'); const j = (k * 157) % 360 + 40; R(j, y, 1, 16, '#3d2414'); R(j + 1, y, 1, 16, '#6b4628'); }
}
// coin de laiton riveté
function brass(x, y) { R(x, y, 6, 6, UIC.gold); R(x, y, 6, 1, UIC.goldL); R(x + 2, y + 2, 2, 2, UIC.rivet); }
// cadre de bois + parchemin ; o.on : liseré doré (sélection)
function panel(x, y, w, h, o = {}) {
  if (o.on) R(x - 6, y - 6, w + 12, h + 12, UIC.goldL);
  R(x - 5, y - 5, w + 10, h + 10, UIC.dark); R(x - 4, y - 4, w + 8, h + 8, UIC.woodL); R(x - 3, y - 3, w + 6, h + 6, UIC.wood); R(x - 3, y + h / 2, w + 6, h / 2 + 3, UIC.woodD);
  R(x - 1, y - 1, w + 2, h + 2, UIC.edge); R(x, y, w, h, o.fill || UIC.parch); R(x + 1, y + 1, w - 2, 1, o.fill ? 'rgba(255,255,255,.25)' : UIC.parchL); R(x + 1, y + h - 2, w - 2, 1, UIC.parchD);
  brass(x - 5, y - 5); brass(x + w - 1, y - 5); brass(x - 5, y + h - 1); brass(x + w - 1, y + h - 1);
}
function box(x, y, w, h, o = {}) { panel(x, y, w, h, o); }
// case d'objet : creusée dans le parchemin ; on = sélection dorée ; empty = case vide
function cellBox(x, y, w, h, on, empty, tint) {
  if (on) { R(x - 2, y - 2, w + 4, h + 4, UIC.goldL); R(x - 1, y - 1, w + 2, h + 2, UIC.rivet); }
  R(x, y, w, h, on ? UIC.gold : UIC.woodD); R(x + 1, y + 1, w - 2, h - 2, on ? UIC.sel : empty ? UIC.cellE : (tint || UIC.cell));
  if (!empty && !on) R(x + 1, y + 1, w - 2, 1, '#c9a46c');
}
// bouton de bois biseauté ; on = rouge cerclé d'or
function woodBtn(x, y, w, h, label, on, size = 6.5) {
  if (on) R(x - 2, y - 2, w + 4, h + 4, UIC.gold);
  R(x - 1, y - 1, w + 2, h + 3, UIC.dark); R(x, y, w, h, on ? '#f08060' : UIC.woodL); R(x + 1, y + 1, w - 2, h - 2, on ? UIC.redL : UIC.wood); R(x + 1, y + (h >> 1), w - 2, h - 2 - (h >> 1), on ? '#a8232a' : UIC.woodD);
  if (label) wtext(label, x + w / 2, y + (h - size) / 2 + 0.5, { size, align: 'center', font: 't', shadowColor: on ? '#5a0f12' : UIC.dark });
}
// banderole rouge à queues découpées, centrée sur cx
function ribbon(cx, y, txt, size = 7.5, font) {
  size *= UI_TXT; const w = textW(txt, size, font) + 24, x = Math.round(cx - w / 2), h = Math.round(size + 8);
  for (const s of [-1, 1]) { const tx = s < 0 ? x - 9 : x + w + 1; R(tx - 1, y + 3, 9, 13, UIC.dark); R(tx, y + 4, 8, 11, '#8a1a20'); R(s < 0 ? tx : tx + 5, y + 8, 3, 3, UIC.plank); }
  R(x - 1, y - 1, w + 2, h + 2, UIC.dark); R(x, y, w, h, '#f08060'); R(x + 1, y + 1, w - 2, h - 2, UIC.redL); R(x + 1, y + 8, w - 2, h - 9, '#a8232a');
  text(txt, cx, y + (h - size) / 2, { size, align: 'center', color: '#fff6e0', shadowColor: '#5a0f12', font });
}
// jauge brune remplie
function gauge(x, y, w, v, c) { R(x, y, w, 6, UIC.edge); R(x + 1, y + 1, w - 2, 4, '#d9bf8c'); const f = Math.round((w - 2) * clamp(v, 0, 1)); if (f) { R(x + 1, y + 1, f, 4, c); R(x + 1, y + 4, f, 1, 'rgba(0,0,0,.2)'); } }
// touche A / B
function keyCap(x, y, k, c) { R(x - 1, y - 1, 10, 9, UIC.dark); R(x, y, 8, 7, c); text(k, x + 4, y + 0.5, { size: 5.5, align: 'center', color: '#fff6e0', shadow: false, font: 't', bold: true }); }
function heroHeight(id) { const sh = SHEETS[DATA.heroes[id].sheet]; return sh.meta.scale === '2' ? 37 : sh.meta.scale === '1.4' ? 32 : 31; }

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
    // cœur doré (soupe dorée)
    if (P.bonusHp > 0) drawHeartShape(12 + n * 11, 11, 2, '#ffd23a', '#c89010');
    // effets des soupes, avec leur temps restant
    let ex = W - 40; for (const [k, ic] of [['def', 'bouillon'], ['light', 'veloute'], ['swim', 'elixir']]) if (Effects.on(k)) { R(ex - 2, 34, 28, 14, 'rgba(7,13,31,.55)'); drawItemIcon(ic, ex + 5, 41, 0.6); text(String(Math.ceil(Effects.t[k])), ex + 24, 37, { size: 6, align: 'right', color: PAL.white }); ex -= 32; }
    // boussole des secrets
    Soupe.draw(); Peche.draw(); // jauge de la soupe chaude, chrono du concours de pêche
    const sec = compassTarget(this); if (sec) { const cx = W - 52, cy = 18, a = Math.atan2(sec.y - P.y, sec.x - P.x) + Math.sin(this.t * 20) * 0.08; ell(cx, cy, 8, 8, 'rgba(7,13,31,.7)'); ell(cx, cy, 6.5, 6.5, '#e8dcc8'); ctx.strokeStyle = '#d84a5a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 5.5, cy + Math.sin(a) * 5.5); ctx.stroke(); }
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
    const d = this.dialog, line = d.lines[d.i], pad = Input.padVisible; // toujours en bas ; sur écran tactile, entre le stick et les boutons
    const bw = pad ? 262 : 360, bx = pad ? 110 : (W - bw) / 2, bh = pad ? 72 : 64, by = pad ? H - bh - 4 : 192;
    box(bx, by, bw, bh);
    const lumi = line.who === 'Lumi', face = line.face && IMG[`face_${line.face}_${line.mood}`] ? line.face : null;
    let tx = bx + 12;
    if (face || lumi) {
      cellBox(bx + 8, by + 9, 46, 46, false, false, '#e9d3a6');
      if (face) drawFace(face, line.mood, bx + 12, by + 12, 1.5);
      else { ctx.globalAlpha = 0.5; ell(bx + 31, by + 32, 14, 14, '#ffe27a'); ctx.globalAlpha = 1; drawLumi(bx + 31, by + 32 + Math.sin(this.t * 3), this.t); }
      tx = bx + 64;
    }
    if (line.who) { const nw = textW(line.who, 8) + 12; R(bx + 6, by - 11, nw + 2, 15, UIC.dark); R(bx + 7, by - 10, nw, 13, lumi ? UIC.goldL : UIC.woodL); R(bx + 8, by - 9, nw - 2, 11, lumi ? UIC.gold : UIC.wood); R(bx + 8, by - 3, nw - 2, 5, lumi ? '#c88a20' : UIC.woodD); text(line.who, bx + 13, by - 9, { color: lumi ? UIC.ink : UIC.cream, shadow: !lumi, shadowColor: UIC.dark, bold: true }); }
    const maxW = bx + bw - 14 - tx, shown = line.text.slice(0, Math.floor(d.c));
    let fs = 10, lh = 13, lines = wrap(line.text, maxW, fs);
    for (const [f2, l2] of [[9, 12], [8, 11], [7, 10]]) if (lines.length * lh > bh - 10) { fs = f2; lh = l2; lines = wrap(line.text, maxW, fs); } // texte long : un cran plus petit, tant qu'il le faut
    let count = 0, ty = by + (lines.length * lh > bh - 16 ? 6 : 12);
    for (const ln of lines) { text(shown.slice(count, count + ln.length), tx, ty, { size: fs, color: UIC.ink, shadow: false }); count += ln.length + 1; ty += lh; }
    if (d.choices && d.i === d.lines.length - 1 && d.c >= line.text.length) {
      const cw = Math.max(...d.choices.map(c => textW(c, 8 * UI_TXT))) + 30, cx = clamp(bx + bw - cw - 6, 4, W - cw - 4), cy = by - d.choices.length * 14 - 10;
      box(cx, cy, cw, d.choices.length * 14 + 6); d.cx = cx; d.cy = cy + 4;
      d.choices.forEach((c, k) => { const on = k === d.pick; if (on) R(cx + 2, cy + 3 + k * 14, cw - 4, 12, UIC.sel); ptext((on ? '▸ ' : '  ') + c, cx + 8, cy + 4 + k * 14, { size: 8, color: on ? UIC.red : UIC.soft, bold: on }); });
    } else if (d.c >= line.text.length && Math.floor(this.t * 3) % 2) { ctx.fillStyle = UIC.red; ctx.beginPath(); ctx.moveTo(bx + bw - 16, by + bh - 12); ctx.lineTo(bx + bw - 10, by + bh - 12); ctx.lineTo(bx + bw - 13, by + bh - 8); ctx.fill(); }
  },

  drawMenu(items, x, y, sel = this.menu) {
    const bw = Math.max(110, ...items.map(it => textW(it, 6.5 * UI_TXT, 't') + 24));
    items.forEach((it, i) => woodBtn(Math.round(x - bw / 2), y + i * 16 - 2, bw, 13, it, i === sel));
  },

  // ---------- pause : objets (grille), souvenirs, carte, options ----------
  pauseItems() {
    const L = [];
    if (SAVE.got_branche) L.push({ kind: 'weapon', id: SAVE.inv.weapon });
    for (const id of Inventory.tools()) L.push({ kind: 'tool', id });
    for (const id of ['bouclier', 'palmes', 'bottes', 'coupe', 'grimoire']) if (Inventory.has(id)) L.push({ kind: 'gear', id });
    SAVE.inv.bottles.forEach((b, i) => L.push({ kind: 'bottle', i, id: b }));
    if (this.area.dungeon && SAVE['bigkey_' + this.area.dungeon]) L.push({ kind: 'key', id: 'bigkey' });
    return L;
  },
  // onglet Objets : l'arme et l'outil équipés en haut, puis la grille des objets, puis la rangée des bouteilles
  invLayout() {
    const all = this.pauseItems(), O = all.filter(e => e.kind !== 'weapon' && e.kind !== 'bottle'), B = all.filter(e => e.kind === 'bottle');
    const nr = Math.max(2, Math.ceil(O.length / 5)), st = nr > 2 ? 30 : 36, cs = st - 6, by = 118 + nr * st + 10;
    const pos = [...O.map((e, k) => ({ x: 30 + (k % 5) * st, y: 118 + Math.floor(k / 5) * st, r: Math.floor(k / 5), c: k % 5 })), ...B.map((e, k) => ({ x: 30 + k * st, y: by, r: nr, c: k }))];
    return { items: [...O, ...B], pos, nr, st, cs, by, weapon: all.find(e => e.kind === 'weapon') };
  },
  pauseTabs: ['Objets', 'Sac', 'Souvenirs', 'Bestiaire', 'Quêtes', 'Carte', 'Options'],
  tabX(i) { return 12 + i * 62; },
  // le sac : matériaux, ingrédients, objet d'échange
  sacItems() { const L = Mats.owned().map(id => ({ id, n: Mats.n(id) })); const t = Troc.held(); if (t) L.push({ id: 'troc_' + t, troc: t }); return L; },
  tabLen(t) { return t === 0 ? this.invLayout().items.length : t === 1 ? this.sacItems().length : t === 2 ? Object.keys(SOUVENIRS).length : t === 3 ? BEASTS.length : 0; },
  tabCols(t) { return t === 2 ? 4 : 5; },
  updatePause() {
    if (Input.pressed('start') || Input.pressed('b')) { this.state = 'play'; SFX.menu(); return; }
    const tx = Input.lastTap; if (tx && tx.time > (this.pauseAt || 0) && performance.now() - tx.time < 250 && tx.x > W - 34 && tx.y < 32) { Input.lastTap = null; this.state = 'play'; SFX.menu(); return; }
    const nT = this.pauseTabs.length, grid = this.ptab <= 3;
    if (Input.pressed('cycle')) { this.ptab = (this.ptab + 1) % nT; this.psel = 0; this.menu = 0; SFX.menu(); }
    const tap = Input.lastTap; Input.lastTap = null;
    if (tap && performance.now() - tap.time < 250 && tap.y < 26) { const t = Math.floor((tap.x - this.tabX(0)) / 62); if (t >= 0 && t < nT) { this.ptab = t; this.psel = 0; SFX.menu(); } return; }
    const tabBy = d => { this.ptab = (this.ptab + d + nT) % nT; this.psel = 0; this.menu = 0; SFX.menu(); };
    if (!grid) {
      if (Input.pressed('right')) tabBy(1);
      if (Input.pressed('left')) tabBy(-1);
    }
    if (this.ptab === 0) { // objets : rangées de longueurs différentes
      const g = this.invLayout(), n = g.items.length;
      if (!n) { if (Input.pressed('right')) tabBy(1); if (Input.pressed('left')) tabBy(-1); return; }
      this.psel = clamp(this.psel, 0, n - 1); const p = g.pos[this.psel];
      const at = (r, c) => g.pos.findIndex(q => q.r === r && q.c === c);
      if (Input.pressed('right')) { const k = at(p.r, p.c + 1); if (k >= 0) { this.psel = k; SFX.menu(); } else tabBy(1); }
      if (Input.pressed('left')) { if (p.c === 0) tabBy(-1); else { this.psel = at(p.r, p.c - 1); SFX.menu(); } }
      for (const [b, d] of [['down', 1], ['up', -1]]) if (Input.pressed(b)) {
        for (let r = p.r + d; r >= 0 && r <= g.nr; r += d) { const row = g.pos.map((q, k) => [q, k]).filter(([q]) => q.r === r); if (!row.length) continue; row.sort((a, b2) => Math.abs(a[0].c - p.c) - Math.abs(b2[0].c - p.c)); this.psel = row[0][1]; SFX.menu(); break; }
      }
      if (tap && performance.now() - tap.time < 250) { const k = g.pos.findIndex(q => tap.x >= q.x && tap.x < q.x + g.cs && tap.y >= q.y && tap.y < q.y + g.cs); if (k >= 0) { if (k === this.psel) Input.held.a = true, Input.prev.a = false; this.psel = k; SFX.menu(); } }
      if (Input.pressed('a')) {
        const e = g.items[this.psel]; if (!e) return;
        if (e.kind === 'tool') { Inventory.equip(e.id); SFX.menu(); this.state = 'play'; return; }
        if (e.kind === 'bottle') { if (Inventory.drink(e.i, this.player)) SFX.drink(); else SFX.nope(); }
      }
    } else if (grid) {
      const n = this.tabLen(this.ptab), C = this.tabCols(this.ptab);
      if (!n) { if (Input.pressed('right') || Input.pressed('left')) tabBy(Input.pressed('right') ? 1 : -1); return; }
      const mv = d => { const v = this.psel + d; if (v >= 0 && v < n) { this.psel = v; SFX.menu(); } };
      if (Input.pressed('right')) { if (this.psel % C === C - 1 || this.psel === n - 1) tabBy(1); else mv(1); }
      if (Input.pressed('left')) { if (this.psel % C === 0) tabBy(-1); else mv(-1); }
      if (Input.pressed('down')) mv(C); if (Input.pressed('up')) mv(-C);
      // toucher une case
      if (tap && performance.now() - tap.time < 250) { const g = this.ptab === 3 ? this.beastGeom() : this.gridGeom(C), i = Math.floor((tap.x - g.x0) / g.cw), j = Math.floor((tap.y - g.y0) / g.ch); if (i >= 0 && i < C && j >= 0) { const k = j * C + i; if (k < n) { this.psel = k; SFX.menu(); } } }
    } else if (this.ptab === 4) {
      const n = questLog().length; if (Input.pressed('down') && this.psel < n - 1) { this.psel++; SFX.menu(); } if (Input.pressed('up') && this.psel > 0) { this.psel--; SFX.menu(); }
    } else if (this.ptab === 6) {
      this.menuNav(2);
      const ti = this.menuTap([0, 1], 118); let go = Input.pressed('a'); if (ti >= 0) { this.menu = ti; go = true; }
      if (go) {
        SFX.menu();
        if (this.menu === 0) { PREFS.muted = !PREFS.muted; savePrefs(); }
        else { persist(); this.state = 'title'; this.view = 'title'; this.menu = 0; }
      }
    }
  },
  gridGeom(C) { return C === 5 ? { x0: 30, y0: 74, cw: 40, ch: 40 } : { x0: 34, y0: 74, cw: 48, ch: 48 }; },
  beastGeom() { const rows = Math.ceil(BEASTS.length / 5); return { x0: 30, y0: 74, cw: 40, ch: Math.min(34, Math.floor(166 / rows)) }; },
  // cadres communs des onglets : panneau gauche (liste) et panneau droit (fiche)
  pauseFrames(lh = 186, rh = 186) { panel(22, 54, 208, lh); if (rh) panel(250, 54, 206, rh); },
  label(t, x, y) { ptext(t, x, y, { size: 6, font: 't', bold: true, color: UIC.title }); },
  drawPause() {
    woodBg();
    this.pauseTabs.forEach((t, i) => woodBtn(this.tabX(i), 7, 58, 15, t, i === this.ptab, 5.5));
    woodBtn(W - 26, 6, 20, 17, '', false);
    ctx.strokeStyle = UIC.cream; ctx.lineWidth = 2; ctx.lineCap = 'square'; ctx.beginPath(); ctx.moveTo(W - 20, 10); ctx.lineTo(W - 12, 18); ctx.moveTo(W - 12, 10); ctx.lineTo(W - 20, 18); ctx.stroke();
    const obj = Story.objective();
    if (obj) { const t = 'Objectif : ' + obj, fs = textW(t, 6.5 * UI_TXT) > W - 50 ? (textW(t, 5.5 * UI_TXT) > W - 50 ? 4.8 : 5.5) : 6.5; ribbon(W / 2, 30, t, fs); }
    if (this.ptab === 0) this.drawInventory();
    if (this.ptab === 1) this.drawSac();
    if (this.ptab === 2) this.drawSouvenirs();
    if (this.ptab === 3) this.drawBestiary();
    if (this.ptab === 4) this.drawQuests();
    if (this.ptab === 5) this.drawMapTab();
    if (this.ptab === 6) {
      panel(150, 62, 180, 96);
      ptext('Options', W / 2, 70, { size: 10, align: 'center', font: 't', bold: true, color: UIC.title });
      ptext(`Progression du jeu : ${Progress.pct()} %`, W / 2, 90, { size: 8, align: 'center', color: UIC.soft });
      this.drawMenu(['Son : ' + (PREFS.muted ? 'non' : 'oui'), 'Sauvegarder et quitter'], W / 2, 118);
    }
    if (!Input.padVisible) {
      const roll = Heroes.def().roll;
      wtext('Flèches : choisir · Espace : utiliser · E : onglet suivant · Échap : fermer' + (roll ? ' · L = roulade' : ''), W / 2, H - 10, { size: 6, align: 'center', color: '#d9bf8c' });
    }
  },
  drawCell(x, y, w, h, on, has) { cellBox(x, y, w - 4, h - 4, on, !has); },
  drawInventory() {
    const g = this.invLayout(), L = g.items, sel = L[this.psel], tool = Inventory.tool();
    panel(22, 54, 196, g.by + g.cs + 6 - 54);
    // équipé : arme sur A, outil sur B
    this.label('Équipé', 30, 59);
    const eq = (x, k, c, tint, id, extra) => { cellBox(x, 68, 30, 30, false, !id, tint); if (id) drawItemIcon(id, x + 15, 81, 1.1); keyCap(x + 35, 71, k, c); if (id) { ptext(Inventory.item(id).name, x + 35, 83, { size: 6.5 }); if (extra) ptext(extra, x + 35 + textW(Inventory.item(id).name, 6.5 * UI_TXT) + 3, 83, { size: 6.5, color: UIC.mute }); } };
    eq(30, 'A', UIC.red, '#f3d6c4', g.weapon && g.weapon.id);
    const ti = tool && Inventory.item(tool); eq(118, 'B', '#6a4fb0', '#e2d6ee', tool, ti && ti.ammo ? String(Inventory.ammo(ti.ammo)) : '');
    R(30, 104, 180, 1, UIC.parchD);
    this.label('Objets', 30, 108);
    for (let k = 0; k < g.nr * 5; k++) { const x = 30 + (k % 5) * g.st, y = 118 + Math.floor(k / 5) * g.st; if (!g.pos.some((q, i) => q.r < g.nr && q.x === x && q.y === y)) cellBox(x, y, g.cs, g.cs, false, true); }
    this.label('Bouteilles', 30, g.by - 10);
    for (let k = 0; k < 5; k++) if (!g.pos.some(q => q.r === g.nr && q.c === k)) cellBox(30 + k * g.st, g.by, g.cs, g.cs, false, true);
    L.forEach((e, k) => {
      const p = g.pos[k], on = k === this.psel;
      cellBox(p.x, p.y, g.cs, g.cs, on, false);
      drawItemIcon(e.id, p.x + g.cs / 2, p.y + g.cs / 2 - 1, g.cs > 26 ? 1.1 : 1);
      if (e.kind === 'tool' && tool === e.id) keyCap(p.x + 1, p.y + 1, 'B', '#6a4fb0');
      const it = Inventory.item(e.id); if (it && it.ammo) text(String(Inventory.ammo(it.ammo)), p.x + g.cs - 2, p.y + g.cs - 8, { size: 6, align: 'right', bold: true, color: '#fff6e0', shadowColor: UIC.dark });
    });
    // fiche de l'objet choisi
    const rx = 236, rw = 222; panel(rx, 54, rw, 84);
    const it = sel && (sel.id === 'bigkey' ? { name: 'Grande clé', desc: 'Ouvre la porte du boss de ce donjon.' } : Inventory.item(sel.id === 'vide' ? 'bouteille' : sel.id));
    if (it) {
      cellBox(rx + 6, 60, 46, 46, false, false, '#fbeccb'); drawItemIcon(sel.id, rx + 29, 82, 2);
      ptext(it.name, rx + 58, 60, { size: 7.5, font: 't', bold: true });
      const tags = [{ tool: 'Outil', gear: 'Équipement', bottle: sel.id === 'vide' ? 'Bouteille' : 'Boisson', key: 'Clé' }[sel.kind] || 'Objet'];
      if (sel.kind === 'tool' && tool === sel.id) tags.push('Sur B');
      let tx = rx + 58; tags.forEach((t, i) => { const w = textW(t, 5, 't') + 8; R(tx, 71, w, 8, i ? UIC.gold : UIC.woodD); text(t, tx + 4, 72.5, { size: 5, font: 't', color: i ? UIC.ink : UIC.cream, shadow: false }); tx += w + 4; });
      wrap(it.desc, rw - 66, 6.5 * UI_TXT).slice(0, 4).forEach((l, i) => ptext(l, rx + 58, 82 + i * 8.5, { size: 6.5, color: UIC.soft }));
      const act = sel.kind === 'tool' ? 'Équiper sur B' : sel.kind === 'bottle' && sel.id !== 'vide' ? 'Boire' : '';
      let ax = rx + 8; if (act) { keyCap(ax, 125, 'A', UIC.red); ptext(act, ax + 12, 125, { size: 6.5 }); ax += 22 + textW(act, 6.5 * UI_TXT); }
      keyCap(ax, 125, 'B', '#9a7a5a'); ptext('Fermer', ax + 12, 125, { size: 6.5, color: UIC.mute });
    } else ptext('Aucun objet pour l\'instant.', rx + 10, 64, { size: 7, color: UIC.mute });
    // la sacoche : écus, munitions, compteurs
    const sy = 152; panel(rx, sy, rw, 88); this.label('Sacoche', rx + 8, sy + 4);
    const best = (ids, def) => { for (const id of ids) if (Inventory.has(id)) return Inventory.item(id).name; return def; };
    const rows = [['money', `${Wallet.get()} / ${Wallet.cap()} écus`, Wallet.get() / Wallet.cap(), '#e0a743', best(['bourse_geante', 'grande_bourse', 'bourse'], 'Petite bourse')]];
    const bag = best(['sacoche_voyage', 'carquois'], 'Sacoche');
    if (Inventory.has('lance_pierre')) rows.push(['cailloux', `${Inventory.ammo('cailloux')} / ${Inventory.ammoMax('cailloux')} cailloux`, Inventory.ammo('cailloux') / Inventory.ammoMax('cailloux'), '#8c8a94', bag]);
    if (Inventory.has('petards')) rows.push(['petards', `${Inventory.ammo('petards')} / ${Inventory.ammoMax('petards')} pétards`, Inventory.ammo('petards') / Math.max(1, Inventory.ammoMax('petards')), '#c8302e', bag]);
    rows.forEach(([ic, t, v, c, up], i) => { const y = sy + 15 + i * 13; drawItemIcon(ic, rx + 14, y + 4, 0.8); ptext(t, rx + 24, y, { size: 6.5 }); gauge(rx + 116, y + 1, 44, v, c); ptext(up, rx + rw - 8, y + 2, { size: 3.8, font: 't', align: 'right', color: UIC.mute }); });
    const C = [['fragment', `${SAVE.fragments || 0} / 6`], ['star', `${Progress.pct()} %`]];
    if (SAVE.hpieces) C.splice(1, 0, ['piece_coeur', `${SAVE.hpieces % 4} / 4`]);
    if (SAVE.fliesIntro) C.splice(C.length - 1, 0, ['luciole', `${Flies.n()} / 30` + (Flies.pow() ? ` ★${Flies.pow()}` : '')]);
    if (Inventory.ingredient('champignons')) C.splice(C.length - 1, 0, ['champignons', `${Inventory.ingredient('champignons')}`]);
    if (this.area.rooms) C.splice(C.length - 1, 0, ['cle', `${Keys.get()}`]);
    if (this.area.id === 'castle') C.splice(C.length - 1, 0, ['seal', `${SEALS.filter(q => SAVE[q[0]]).length} / 5`]);
    R(rx + 8, sy + 56, rw - 16, 1, UIC.parchD);
    C.forEach(([ic, t], i) => { const x = rx + 10 + (i % 4) * 52, y = sy + 61 + Math.floor(i / 4) * 12; if (ic === 'star') ptext('★', x + 4, y, { size: 7, align: 'center', color: UIC.title }); else drawItemIcon(ic, x + 4, y + 4, 0.75); ptext(t, x + 12, y, { size: 6.5, color: ic === 'star' ? UIC.title : UIC.ink }); });
  },
  drawSac() {
    const L = this.sacItems(), C = 5, g = this.gridGeom(C);
    this.pauseFrames();
    this.label('Sac : matériaux et ingrédients', g.x0, g.y0 - 14);
    for (let k = 0; k < Math.max(15, Math.ceil(L.length / C) * C); k++) {
      const i = k % C, j = Math.floor(k / C), x = g.x0 + i * g.cw, y = g.y0 + j * g.ch, e = L[k], on = k === this.psel;
      this.drawCell(x, y, g.cw, g.ch, on && !!e, !!e); if (!e) continue;
      drawItemIcon(e.id, x + g.cw / 2 - 2, y + g.ch / 2 - 4, 1.1);
      if (e.n) text('×' + e.n, x + g.cw - 7, y + g.ch - 13, { size: 6, align: 'right', bold: true, color: '#fff6e0', shadowColor: UIC.dark });
    }
    const e = L[this.psel], rx = 258;
    if (e) {
      const name = e.troc ? TROC_ITEMS[e.troc] : MATS[e.id].name, desc = e.troc ? 'Un objet à échanger. Quelqu\'un, quelque part, en a sûrement besoin.' : MATS[e.id].desc + (MATS[e.id].rare ? ' Matériau rare : Bertrand s\'en sert à la forge.' : ' Ça pourrait intéresser un marchand.');
      ptext(name, rx, 62, { size: 8, bold: true, font: 't', color: UIC.title }); wrap(desc, 190, 7.5 * UI_TXT).forEach((l, i) => ptext(l, rx, 80 + i * 11, { size: 7.5, color: UIC.soft }));
    } else wrap('Ton sac est vide. Cueille, pêche, casse des rochers : tout se revend chez Amandine ou se cuisine chez Mamie.', 190, 7.5 * UI_TXT).forEach((l, i) => ptext(l, rx, 64 + i * 11, { size: 7.5, color: UIC.mute }));
    const up = Object.keys(UPGRADES).filter(id => Upg.lv(id)); if (up.length) wrap('Forge : ' + up.map(id => UPGRADES[id].name + ' ' + '★'.repeat(Upg.lv(id))).join(' · '), 190, 6.5).forEach((l, i, a) => ptext(l, rx, 232 - (a.length - i) * 9, { size: 6.5, color: UIC.title }));
  },
  drawBestiary() {
    const C = 5, g = this.beastGeom(), n = Bestiary.nFull();
    this.pauseFrames();
    this.label(`Bestiaire : ${n} / ${BEASTS.length}` + (SAVE.encyclo ? '  ★' : ''), g.x0, g.y0 - 14);
    BEASTS.forEach((b, k) => {
      const i = k % C, j = Math.floor(k / C), x = g.x0 + i * g.cw, y = g.y0 + j * g.ch, kills = Bestiary.kills(b.k), seen = kills || (SAVE.seen || {})[b.k];
      this.drawCell(x, y, g.cw, g.ch, k === this.psel, !!seen);
      ptext(kills ? (Bestiary.full(b) ? '★' : String(kills)) : seen ? '?' : '', x + g.cw / 2 - 2, y + g.ch / 2 - 8, { size: kills ? 8 : 10, align: 'center', color: Bestiary.full(b) ? UIC.red : kills ? UIC.ink : UIC.mute, bold: true });
      if (b.boss) R(x + 2, y + 2, 4, 4, UIC.gold); else if (b.mini) R(x + 2, y + 2, 4, 4, '#8a7a6a');
    });
    const b = BEASTS[this.psel], kills = Bestiary.kills(b.k), seen = kills || (SAVE.seen || {})[b.k], rx = 258;
    wrap('Récompenses chez Arthur, au village : 5, 12 et ' + BEASTS.length + ' fiches complètes.', 190, 6.5 * UI_TXT).forEach((l, i, a) => ptext(l, rx, 232 - (a.length - i) * 9, { size: 6.5, color: UIC.mute }));
    if (!seen) { ptext('???', rx, 62, { size: 9, bold: true, font: 't', color: UIC.mute }); wrap('Une créature que tu n\'as pas encore croisée.', 190, 7.5 * UI_TXT).forEach((l, i) => ptext(l, rx, 80 + i * 11, { size: 7.5, color: UIC.mute })); return; }
    if (!kills) { ptext('???', rx, 62, { size: 9, bold: true, font: 't', color: UIC.mute }); wrap('Tu l\'as croisée. Bats-la pour en savoir plus.', 190, 7.5 * UI_TXT).forEach((l, i) => ptext(l, rx, 80 + i * 11, { size: 7.5, color: UIC.mute })); return; }
    beastPortrait(b, 353, 204, this.t);
    ptext(b.name, rx, 62, { size: 8, bold: true, font: 't', color: UIC.title });
    ptext((b.boss ? 'Gardien · ' : b.mini ? 'Mini-boss · ' : '') + b.zone, rx, 76, { size: 7, color: UIC.mute });
    ptext(`Vaincu${b.boss || b.mini ? '' : 's'} : ${kills}` + (b.boss || b.mini ? '' : ` / 10`), rx, 90, { size: 7.5 });
    if (Bestiary.full(b)) { const wl = wrap('Points faibles : ' + b.weak, 190, 7.5 * UI_TXT); wl.forEach((l, i) => ptext(l, rx, 104 + i * 11, { size: 7.5, color: UIC.red })); wrap('« ' + b.note + ' »', 190, 7.5 * UI_TXT).forEach((l, i) => ptext(l, rx, 110 + wl.length * 11 + i * 11, { size: 7.5, color: UIC.soft })); }
    else ptext('Fiche complète à 10 victoires.', rx, 104, { size: 7.5, color: UIC.mute });
  },
  // le journal des quêtes : principales (souvenirs) et secondaires
  drawQuests() {
    const L = questLog(); this.psel = clamp(this.psel, 0, Math.max(0, L.length - 1));
    const done = L.filter(q => q.st === 'done').length;
    this.pauseFrames(186, L.length ? 186 : 0);
    this.label(`Quêtes : ${done} terminée${done > 1 ? 's' : ''}`, 30, 60);
    if (!L.length) { wrap('Aucune quête pour l\'instant. Les « ! » montrent qui a besoin d\'aide.', 190, 7.5 * UI_TXT).forEach((l, i) => ptext(l, 30, 78 + i * 11, { size: 7.5, color: UIC.mute })); return; }
    const per = 10, top = clamp(this.psel - 4, 0, Math.max(0, L.length - per));
    L.slice(top, top + per).forEach((q, k) => {
      const i = top + k, y = 74 + k * 15, on = i === this.psel;
      if (on) { R(27, y - 3, 198, 14, UIC.goldL); R(28, y - 2, 196, 12, UIC.sel); } else R(28, y + 11, 196, 1, UIC.parchD);
      const ic = q.st === 'done' ? ['✓', '#3a8a4a'] : q.st === 'new' ? ['!', UIC.red] : ['•', UIC.gold];
      ptext(ic[0], 35, y, { size: 8, align: 'center', bold: true, color: ic[1] }); ptext(q.name, 43, y, { size: 7, color: q.st === 'done' ? UIC.mute : UIC.ink, bold: on });
    });
    if (L.length > per) ptext(`${this.psel + 1} / ${L.length}`, 126, 226, { size: 6.5, align: 'center', color: UIC.mute });
    const q = L[this.psel], rx = 258;
    wrap(q.name, 190, 8 * UI_TXT).slice(0, 2).forEach((l, i) => ptext(l, rx, 62 + i * 11, { size: 8, bold: true, color: UIC.title }));
    ptext(q.giver, rx, 86, { size: 7, color: UIC.mute });
    wrap(q.hint, 190, 7.5 * UI_TXT).forEach((l, i) => ptext(l, rx, 102 + i * 11, { size: 7.5, color: q.st === 'done' ? UIC.mute : UIC.soft }));
    ptext(q.main ? 'Quête de souvenir' : 'Quête secondaire', rx, 226, { size: 5, font: 't', color: UIC.mute });
  },
  drawSouvenirs() {
    const ids = Object.keys(SOUVENIRS), C = 4, g = this.gridGeom(C), n = ids.filter(k => SAVE.souv && SAVE.souv[k]).length;
    this.pauseFrames();
    this.label(`Souvenirs : ${n} / 7`, 30, g.y0 - 14);
    ids.forEach((id, k) => {
      const i = k % C, j = Math.floor(k / C), x = g.x0 + i * g.cw, y = g.y0 + j * g.ch, has = SAVE.souv && SAVE.souv[id];
      this.drawCell(x, y, g.cw, g.ch, k === this.psel, !!has);
      if (has) drawSouvenir(id, x + g.cw / 2 - 2, y + g.ch / 2 - 2, 1.2); else ptext('?', x + g.cw / 2 - 2, y + g.ch / 2 - 9, { size: 12, align: 'center', color: UIC.mute, bold: true });
    });
    const id = ids[this.psel], S = SOUVENIRS[id], has = SAVE.souv && SAVE.souv[id], rx = 258;
    if (has) { ptext(S.name, rx, 62, { size: 8, bold: true, font: 't', color: UIC.title }); wrap(S.desc, 190, 7.5 * UI_TXT).forEach((l, i) => ptext(l, rx, 80 + i * 11, { size: 7.5, color: UIC.soft })); }
    else { ptext('???', rx, 62, { size: 9, bold: true, font: 't', color: UIC.mute }); wrap('Un objet de ton monde, perdu quelque part dans le royaume. Les habitants qui ont besoin d\'aide le savent peut-être.', 190, 7.5 * UI_TXT).forEach((l, i) => ptext(l, rx, 80 + i * 11, { size: 7.5, color: UIC.mute })); }
    if (n === 7) wrap('Collection complète ! Une surprise t\'attend à la fin.', 190, 7.5 * UI_TXT).forEach((l, i) => ptext(l, rx, 214 + i * 11, { size: 7.5, color: UIC.red }));
  },
  drawMapTab() {
    const A = this.area;
    if (A.map) { this.drawMap(W / 2 - 72, 64); return; }
    const bw = A.zone ? 260 : 360, bh = 160, s = Math.min(bw / A.w, bh / A.h), w = A.w * s, h = A.h * s, x0 = A.zone ? 40 : (W - w) / 2, y0 = 62;
    panel(x0, y0, w, h); ctx.drawImage((A.paint && IMG[A.paint]) || A.layer, x0, y0, w, h); R(x0, y0, w, h, 'rgba(60,30,10,.18)');
    for (const e of A.ents) if (e.isHouse && !e.ghost) R(x0 + (e.x - e.w / 2) * s, y0 + (e.y - e.h) * s, e.w * s, e.h * s, '#a85a3a');
    if (Math.floor(this.t * 3) % 2) { R(x0 + this.player.x * s - 3, y0 + this.player.y * s - 3, 6, 6, UIC.dark); R(x0 + this.player.x * s - 2, y0 + this.player.y * s - 2, 4, 4, UIC.redL); }
    ribbon(x0 + w / 2, y0 + h - 4, A.name, 6.5);
    if (A.zone) this.drawWorldMini(x0 + w + 14, y0);
  },
  // petite carte du royaume : où l'on est
  drawWorldMini(x, y) {
    const Z = [['sanctuaire', 1, 0, 'Sanct.'], ['collines', 2, 0, 'Collines'], ['col', 3, 0, 'Col'], ['montagne', 4, 0, 'Mont.'], ['route_nord', 2, 1, 'Route'], ['foret', 0, 2, 'Forêt'], ['oree', 1, 2, 'Orée'], ['royaume', 2, 2, 'Village'], ['pres', 2, 3, 'Prés'], ['terres', 0, 4, 'Terres'], ['lande', 1, 4, 'Lande'], ['lac', 2, 4, 'Lac'], ['dunes', 3, 4, 'Dunes'], ['cote', 4, 4, 'Côte']];
    panel(x, y, 148, 108);
    for (const [id, cx, cy, name] of Z) { const on = this.area.id === id, seen = SAVE.visitedZ && SAVE.visitedZ[id], X = x + 2 + cx * 29, Y = y + 2 + cy * 21; cellBox(X, Y, 27, 19, on, !seen && !on); if (on && Math.floor(this.t * 3) % 2) R(X + 11, Y + 2, 4, 4, UIC.redL); if (seen || on) ptext(name, X + 13.5, Y + 11, { size: 5, align: 'center', color: on ? UIC.red : UIC.soft }); }
  },
  drawMap(x0, y0) {
    const A = this.area, cw = 48, ch = 28, M = A.map, C = A.rooms.cols;
    x0 -= (C - 3) * cw / 2;
    const nr = A.rooms.rows; panel(x0 - 8, y0 - 6, C * cw + 16, 22 + nr * ch + 8);
    ptext(M.title, x0 + C * cw / 2, y0, { size: 7, align: 'center', font: 't', bold: true, color: UIC.title });
    const links = M.links;
    const cell = i => ({ x: x0 + (i % C) * cw, y: y0 + 16 + Math.floor(i / C) * ch });
    const seen = i => SAVE.visited && SAVE.visited[A.id + i];
    for (const [a, b] of links) { if (!seen(a) && !seen(b)) continue; const p = cell(a), q = cell(b); R(Math.min(p.x, q.x) + cw / 2 - 2, Math.min(p.y, q.y) + ch / 2 - 2, Math.abs(p.x - q.x) + 4, Math.abs(p.y - q.y) + 4, UIC.woodD); }
    for (const i of A.rooms.list) {
      if (!seen(i)) continue;
      const p = cell(i), cur = i === this.room;
      cellBox(p.x + 4, p.y + 3, cw - 8, ch - 6, cur, false);
      if (cur && Math.floor(this.t * 3) % 2) R(p.x + cw / 2 - 2, p.y + ch / 2 - 2, 4, 4, UIC.redL);
      if (i === M.boss) ptext(SAVE[M.bossFlag] ? '✓' : '☠', p.x + cw / 2, p.y + 7, { size: 9, align: 'center', color: SAVE[M.bossFlag] ? '#3a8a4a' : UIC.red });
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
    const sh = this.shop, def = Shop.def(sh.id), bw = 340, bh = 204, bx = (W - bw) / 2, by = 30;
    R(0, 0, W, H, 'rgba(20,10,4,.55)'); panel(bx, by, bw, bh);
    ribbon(W / 2, by - 12, def.name, 8, 't');
    drawItemIcon('money', bx + bw - 62, by + 11, 0.9); ptext(`${Wallet.get()} écus`, bx + bw - 54, by + 6, { size: 7.5, bold: true, color: UIC.title });
    def.items.forEach((e, i) => {
      const it = Inventory.item(e.id), st = Shop.state(sh.id, e), on = i === sh.sel, y = by + 18 + i * 24;
      if (on) { R(bx + 9, y - 1, bw - 18, 24, UIC.goldL); R(bx + 10, y, bw - 20, 22, UIC.sel); } else R(bx + 10, y + 22, bw - 20, 1, UIC.parchD);
      cellBox(bx + 14, y + 2, 18, 18, false, false); drawItemIcon(e.id === 'cailloux10' ? 'cailloux' : e.id, bx + 23, y + 11, 0.85);
      ptext(it.name, bx + 40, y + 2, { size: 8.5, color: st.ok ? UIC.ink : UIC.mute, bold: on });
      if (!st.ok) ptext(st.why, bx + 40, y + 12, { size: 6.5, color: UIC.red });
      if (e.cost) { const [k, n] = Object.entries(e.cost)[0]; drawItemIcon(k, bx + bw - 54, y + 12, 1); ptext(String(n), bx + bw - 46, y + 7, { size: 8.5, color: st.ok ? UIC.title : UIC.mute, bold: true }); }
      else { drawItemIcon('money', bx + bw - 54, y + 12, 0.8); ptext(String(e.price), bx + bw - 46, y + 7, { size: 8.5, color: st.ok ? UIC.title : UIC.mute, bold: true }); }
    });
    const e = def.items[sh.sel], desc = sh.msgT > 0 ? sh.msg : Inventory.item(e.id).desc;
    R(bx + 10, by + bh - 38, bw - 20, 1, UIC.parchD);
    wrap(desc, bw - 28, 7.5 * UI_TXT).slice(0, 2).forEach((l, i) => ptext(l, bx + 14, by + bh - 32 + i * 11, { size: 7.5, color: sh.msgT > 0 ? UIC.red : UIC.soft, bold: sh.msgT > 0 }));
    wtext('A : acheter   ·   B : sortir', W / 2, by + bh + 9, { size: 7, align: 'center' });
  },

  // ---------- titre, parties, choix du héros ----------
  titleItems() { const items = ['Jouer']; if (Debug.on()) items.push('Combats (debug)'); if (!PWA.installed()) items.push('Installer l\'appli'); return items; },
  menuTap(items, y0, x0 = W / 2, half = 90) {
    const tap = Input.lastTap; Input.lastTap = null;
    if (!tap || performance.now() - tap.time > 250) return -1;
    const i = Math.floor((tap.y - y0 + 2) / 16); return i >= 0 && i < items.length && Math.abs(tap.x - x0) < half ? i : -1;
  },
  updateTitle() {
    const items = this.titleItems(); if (this.menu >= items.length) this.menu = 0;
    if (this.installHelp) { if (Input.anyPressed() || Input.pressed('b')) { this.installHelp = false; SFX.menu(); } return; }
    this.menuNav(items.length);
    const tp = Input.lastTap; if (tp && performance.now() - tp.time < 250 && tp.x > W - 70 && tp.y > H - 24) { Input.lastTap = null; Debug.tapVersion(); return; } // 5 tapes sur le numéro de version : menu debug
    const ti = this.menuTap(items, 112); let go = Input.anyPressed(); if (ti >= 0) { this.menu = ti; go = true; }
    if (go) {
      audioUnlock(); SFX.menu();
      if (items[this.menu].startsWith('Installer')) { PWA.install().then(ok => { if (!ok) this.installHelp = true; }); return; }
      if (items[this.menu].startsWith('Combats')) { this.state = 'debug'; this.menu = 0; return; }
      this.state = 'slots'; this.slotSel = 0; this.erasing = false;
    }
  },
  updateDebug() {
    const items = Debug.items(); this.menuNav(items.length);
    const ti = this.menuTap(items, 44); let go = Input.pressed('a') || Input.pressed('start'); if (ti >= 0) { this.menu = ti; go = true; }
    if (Input.pressed('b')) { SFX.menu(); this.state = 'title'; this.menu = 0; return; }
    if (go) { SFX.menu(); if (this.menu === items.length - 1) { this.state = 'title'; this.menu = 0; return; } const f = Debug.FIGHTS[this.menu]; this.fadeTo(() => Debug.start(f)); }
  },
  drawDebug() {
    woodBg();
    ribbon(W / 2, 8, 'Combats · debug', 8, 't');
    wtext('Sacha, invincible · rien n\'est sauvegardé', W / 2, 29, { size: 7, align: 'center', color: '#d9bf8c' });
    this.drawMenu(Debug.items(), W / 2, 44);
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
    const info = { hero: s.hero, name: Heroes.name(s.hero), hearts: s.maxHp / 2, money: s.money, frags: s.fragments || 0, obj: Story.objective(), pct: Progress.pct(), time: Math.floor((s.playTime || 0) / 60) };
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
    ribbon(W / 2, 12, this.erasing ? 'Quelle partie effacer ?' : 'Choisis une partie', 8, 't');
    for (let i = 0; i < 3; i++) {
      const y = 46 + i * 52, on = i === this.slotSel, info = this.slotInfo(i), bx = W / 2 - 160;
      panel(bx, y, 320, 44, { on, fill: on && this.erasing ? '#f3cdbf' : on ? UIC.sel : undefined });
      ptext(`${i + 1}`, bx + 12, y + 15, { size: 12, bold: true, font: 't', color: on ? UIC.red : UIC.mute });
      if (!info) { ptext('Nouvelle partie', bx + 44, y + 15, { size: 10, color: on ? UIC.ink : UIC.soft }); continue; }
      drawHero(info.hero, bx + 44, y + 40, 'down', false, this.t, 34 / heroHeight(info.hero));
      ptext(info.name, bx + 66, y + 5, { size: 8, bold: true, font: 't' });
      for (let h = 0; h < info.hearts; h++) drawHeartShape(bx + 70 + h * 9, y + 23, 1.5, PAL.heart, '#c02848');
      drawItemIcon('money', bx + 70 + info.hearts * 9 + 8, y + 23, 0.8); ptext(String(info.money), bx + 70 + info.hearts * 9 + 15, y + 18, { size: 8, bold: true, color: UIC.title });
      ptext(info.obj.length > 56 ? info.obj.slice(0, 54) + '…' : info.obj, bx + 66, y + 31, { size: 5.5, color: UIC.soft });
      ptext(`${info.pct} %`, bx + 306, y + 4, { size: 10, align: 'right', bold: true, color: UIC.red }); ptext(`${info.frags}/6 · ${info.time} min`, bx + 306, y + 19, { size: 7, align: 'right', color: UIC.mute });
    }
    const on = this.slotSel === 3; woodBtn(W / 2 - 60, 46 + 3 * 52 + 1, 120, 15, this.erasing ? 'Annuler' : 'Effacer une partie', on, 6);
    text('A : choisir   ·   B : retour', W / 2, H - 14, { size: 7, align: 'center', color: '#8a94c0' });
  },
  updateHeroes() {
    if (Input.pressed('b')) { this.state = 'slots'; SFX.menu(); return; }
    if (Input.pressed('right')) { this.heroSel = (this.heroSel + 1) % 3; SFX.menu(); }
    if (Input.pressed('left')) { this.heroSel = (this.heroSel + 2) % 3; SFX.menu(); }
    const tap = Input.lastTap; Input.lastTap = null; let go = Input.pressed('a');
    if (tap && performance.now() - tap.time < 250 && tap.x < 70 && tap.y < 32) { this.state = 'slots'; SFX.menu(); return; } // bouton « Retour »
    if (tap && performance.now() - tap.time < 250 && tap.y > 40 && tap.y < 230) { const i = clamp(Math.floor((tap.x - 30) / 140), 0, 2); if (i === this.heroSel) go = true; else { this.heroSel = i; SFX.menu(); } }
    if (go) { SFX.chest(); this.newGame(this.newSlotIndex, Heroes.order()[this.heroSel]); }
  },
  drawHeroes() {
    this.drawTitleBackdrop();
    ribbon(W / 2, 10, 'Qui part à l\'aventure ?', 8, 't');
    Heroes.order().forEach((id, i) => {
      const d = Heroes.def(id), x = 100 + i * 140, on = i === this.heroSel;
      panel(x - 62, 40, 124, 190, { on, fill: on ? UIC.sel : undefined });
      ctx.globalAlpha = on ? 0.35 : 0.2; ell(x, 140, 34, 8, UIC.woodD); ctx.globalAlpha = 1;
      drawHero(id, x, 140, 'down', on, this.t, 74 / heroHeight(id));
      ptext(d.name, x, 152, { size: 10, align: 'center', bold: true, font: 't', color: on ? UIC.red : UIC.ink });
      const dl = wrap(d.desc, 112, 7.5 * UI_TXT); dl.forEach((l, k) => ptext(l, x, 170 + k * 10, { size: 7.5, align: 'center', color: UIC.soft }));
      wrap(d.perk, 112, 7.5 * UI_TXT).forEach((l, k) => ptext(l, x, 174 + dl.length * 10 + k * 10, { size: 7.5, align: 'center', color: UIC.title, bold: true }));
    });
    if (Input.padVisible) woodBtn(8, 8, 58, 16, '◂ Retour', false, 6);
    text(Input.padVisible ? 'Touche un personnage pour le choisir, puis touche-le encore pour partir' : '◂ ▸ : choisir   ·   A : partir   ·   B : retour', W / 2, H - 14, { size: 7, align: 'center', color: '#8a94c0' });
  },
  drawTitleBackdrop() {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#070d1f'); g.addColorStop(1, '#14244c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    this.drawStars(5);
  },
  drawInstallHelp() {
    R(0, 0, W, H, 'rgba(4,8,26,.88)');
    const bw = 360, bx = (W - bw) / 2, by = 60, bh = 140;
    box(bx, by, bw, bh);
    ptext('Installer Escape Night 2', W / 2, by + 12, { size: 9, align: 'center', bold: true, font: 't', color: UIC.title });
    const lines = PWA.ios()
      ? ['Sur iPhone / iPad (Safari) :', '1. Touche le bouton Partager (carré avec une flèche).', '2. Choisis « Sur l\'écran d\'accueil ».', '3. Lance le jeu depuis la nouvelle icône.']
      : ['Ouvre le menu du navigateur (⋮ en haut à droite),', 'puis choisis « Installer l\'application »', 'ou « Ajouter à l\'écran d\'accueil ».', 'Le jeu marchera ensuite en plein écran, même hors ligne.'];
    lines.forEach((l, i) => ptext(l, bx + 20, by + 38 + i * 16, { size: 8, color: i === 0 && PWA.ios() ? UIC.title : UIC.ink, bold: i === 0 && PWA.ios() }));
    if (Math.floor(this.t * 2) % 2) ptext('A : fermer', W / 2, by + bh - 16, { size: 8, align: 'center', color: UIC.red });
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
    if (SAVE.freed3) crew.push(x => drawHero(Heroes.captive(1), x, 214, 'down', false, this.t + 1, 60 / heroHeight(Heroes.captive(1))));
    const spr = (k, h) => x => { const im = IMG['npc_' + k]; if (!im) return; const w = im.width * h / im.height; ctx.drawImage(im, x - w / 2, 214 - h, w, h); };
    if (SAVE.freed2) crew.push(spr('claudine', 62));
    if (SAVE.freed1) crew.push(spr('amandine', 62));
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
    R(0, 0, W, H, 'rgba(20,10,4,.6)');
    const L = this.travel.list, items = [...L.map(k => RELAYS[k].name), 'Rester ici'], bh = 44 + items.length * 16;
    panel(W / 2 - 110, 64, 220, bh);
    ribbon(W / 2, 54, 'Où veux-tu aller ?', 7.5, 't');
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

// objets de la chaîne d'échanges
function drawTrocIcon(id, x, y, s = 1) {
  const u = s, B = (dx, dy, w, h, c) => R(x + dx * u, y + dy * u, w * u, h * u, c);
  if (id === 'oeuf') { ell(x, y, 5 * s, 6.5 * s, '#f4ead8'); ell(x - 1.5 * s, y - 2 * s, 1.5 * s, 2 * s, '#fff'); B(2, 1, 2, 2, '#c8a070'); }
  else if (id === 'laine') { ell(x, y, 6 * s, 5 * s, '#e8e0f0'); ctx.strokeStyle = '#b8a8d8'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(x, y, 3.5 * s, 0, 5); ctx.stroke(); }
  else if (id === 'manche') { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.8); R(-1.5 * u, -8 * u, 3 * u, 16 * u, '#a06a34'); R(-1.5 * u, -4 * u, 3 * u, 1 * u, '#5a3418'); R(-1.5 * u, 1 * u, 3 * u, 1 * u, '#5a3418'); ctx.restore(); }
  else if (id === 'pioche') { B(-1, -4, 2, 11, '#8a5a34'); B(-6, -6, 12, 3, '#9aa0b0'); B(-7, -5, 2, 3, '#9aa0b0'); B(5, -5, 2, 3, '#9aa0b0'); }
  else if (id === 'carte_marine') { B(-7, -5, 14, 10, '#e8d8b0'); B(-5, -3, 4, 3, '#7ab0d8'); B(1, -1, 5, 4, '#7ab0d8'); B(-1, 1, 2, 2, '#d84a5a'); }
  else if (id === 'longue_vue') { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.5); R(-8 * u, -2 * u, 6 * u, 4 * u, '#c8a040'); R(-2 * u, -2.5 * u, 6 * u, 5 * u, '#8a5a34'); R(4 * u, -3 * u, 4 * u, 6 * u, '#c8a040'); ctx.restore(); }
  else if (id === 'boussole') { ell(x, y, 6 * s, 6 * s, '#c8a040'); ell(x, y, 4.5 * s, 4.5 * s, '#e8dcc8'); B(-0.5, -4, 1, 4, '#d84a5a'); B(-0.5, 0, 1, 4, '#3a3448'); }
}

// ---------- menu debug : accès direct à chaque combat de boss et de mini-boss ----------
// Il s'ouvre avec ?debug dans l'adresse, ou en touchant 5 fois le numéro de version sur l'écran titre (mémorisé).
// La partie lancée n'est jamais sauvegardée et Sacha est invincible.
const Debug = {
  taps: 0, tapT: 0,
  on() { try { return /[?&]debug/.test(location.search) || localStorage.getItem('en2-debug') === '1'; } catch (_) { return false; } },
  tapVersion() {
    const now = performance.now(); this.taps = now - this.tapT < 800 ? this.taps + 1 : 1; this.tapT = now;
    if (this.taps >= 5) { this.taps = 0; const v = !this.on(); try { localStorage.setItem('en2-debug', v ? '1' : '0'); } catch (_) {} SFX.secret(); Input.toast = { msg: v ? 'Menu debug activé' : 'Menu debug désactivé', t: 1.6 }; }
  },
  // area : donjon, room : salle, at : case où poser Sacha, off : drapeaux à effacer pour que le combat ait lieu, set : drapeaux à poser
  FIGHTS: [
    { name: 'Grand feu follet', area: 'cave', room: 'bigkey', at: [15, 12], off: ['caveBigArena', 'caveBigKey'] },
    { name: 'La Grande Ombre', area: 'cave', room: 'boss', at: [15, 12], off: ['boss'] },
    { name: 'Corbeau géant', area: 'bois', room: 'bigkey', at: [15, 12], off: ['arenaBK', 'boisBigKey'] },
    { name: 'Le Grand-Duc', area: 'bois', room: 'boss', at: [15, 12], off: ['boss2'] },
    { name: 'Chauve-souris de cristal', area: 'mines', room: 'posts', at: [20, 12], off: ['arenaMBK', 'minesBigKey'] },
    { name: 'La Taupe de fer', area: 'mines', room: 'boss', at: [15, 12], off: ['boss3'] },
    { name: 'Crabe géant', area: 'temple', room: 'cascade', at: [14, 12], off: ['arenaTBK', 'templeBigKey'] },
    { name: 'La Reine des remous', area: 'temple', room: 'boss', at: [5, 10], off: ['boss4'] },
    { name: 'Grande Gargouille', area: 'tower', room: 'bigkey', at: [15, 12], off: ['arenaRBK', 'towerBigKey'] },
    { name: 'Le Chevalier de fer', area: 'tower', room: 'boss', at: [15, 12], off: ['boss5'] },
    { name: 'Garde noir', area: 'castle', room: 'bigkey', at: [10, 12], off: ['arenaCBK', 'castleBigKey'], set: { papaFight: true, papaFreed: true } },
    { name: 'Le Chevalier Minuit', area: 'castle', room: 'papa', at: [15, 12], off: ['papaFight', 'papaFreed'] },
    { name: 'Le Roi Minuit', area: 'castle', room: 'king', at: [15, 12], off: ['boss6'], set: { papaFight: true, papaFreed: true } },
  ],
  items() { return [...this.FIGHTS.map(f => f.name), 'Retour']; },
  start(f) {
    SLOT = -1; SAVE = defaultSave('sacha'); SAVE.started = true; // pas d'emplacement : rien n'est écrit
    Object.assign(SAVE, { got_branche: true, met_lumi: true, crossed_rift: true, quest1: true, caveIntro: true, boisIntro: true, minesIntro: true, minesOpen: true, minesKey: true, drawbridge: true,
      lacCrossed: true, lacIntro: true, templeIntro: true, towerIntro: true, castleIntro: true, castleOpen: true, rubble1: true, rubble2: true,
      boss: true, boss2: true, boss3: true, boss4: true, boss5: true, freed1: true, freed2: true, freed3: true, freed4: true, freed5: true,
      v1done: true, v2done: true, v3done: true, v4done: true, v5done: true, maxHp: 16, fragments: 5, money: 99 });
    for (const k of ['epee_bois', 'lance_pierre', 'frisbee', 'grappin', 'palmes', 'petards']) Inventory.give(k);
    Inventory.addAmmo('cailloux', 30); Inventory.addAmmo('petards', 10);
    for (const k of f.off) delete SAVE[k]; Object.assign(SAVE, f.set || {});
    G.debug = true; G.view = 'world';
    G.enter(f.area, G.areas[f.area].start, true);
    const A = G.area, i = A.h.R[f.room]; G.room = i; const rr = G.roomRect(i), P = G.player;
    P.x = rr.x + f.at[0] * TS + 8; P.y = rr.y + f.at[1] * TS + 14; P.hp = SAVE.maxHp; P.dir = 'up'; G.updateCam(true);
    G.banner = { text: f.name + ' · debug', t: 1.6 };
  },
};
Bus.on('save:loaded', () => { G.debug = false; }); // une vraie partie : plus d'invincibilité
