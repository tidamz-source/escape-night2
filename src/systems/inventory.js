'use strict';
// Inventaire : armes, outils (bouton B), équipement, bouteilles, munitions
const Inventory = {
  item(id) { return DATA.items[id]; },
  has(id) { return !!SAVE.inv.owned[id]; },
  give(id) {
    const it = this.item(id), inv = SAVE.inv; if (!it) return;
    if (it.kind === 'ammo') { this.addAmmo(it.ammo, it.qty); return; }
    if (it.kind === 'heartpiece') { SAVE.maxHp += 2; G.healFull(); persist(); return; }
    if (it.kind === 'bottle') { inv.bottles.push('vide'); }
    else if (it.kind === 'drink') { const i = inv.bottles.indexOf('vide'); if (i >= 0) inv.bottles[i] = id; }
    else inv.owned[id] = true;
    if (it.kind === 'weapon' && it.dmg > this.item(inv.weapon).dmg) inv.weapon = id;
    if (it.kind === 'tool') inv.tool = id; // un nouvel outil est équipé tout de suite
    if (id === 'lance_pierre') this.addAmmo('cailloux', 15);
    if (id === 'petards') { inv.ammoMax.petards = Math.max(inv.ammoMax.petards || 0, 10); this.addAmmo('petards', 10); }
    if (it.kind === 'upgrade') { if (it.wallet) SAVE.walletCap = Math.max(SAVE.walletCap, it.wallet); if (it.ammoMax) for (const [k, n] of Object.entries(it.ammoMax)) inv.ammoMax[k] = Math.max(inv.ammoMax[k] || 0, n); }
    persist(); Bus.emit('item:obtained', { id });
  },
  weapon() { return this.item(SAVE.inv.weapon); },
  dmg() { return this.weapon().dmg; },
  tools() { return Object.keys(SAVE.inv.owned).filter(id => this.item(id) && this.item(id).kind === 'tool'); },
  tool() { return SAVE.inv.tool; },
  equip(id) { if (this.has(id)) { SAVE.inv.tool = id; persist(); Bus.emit('tool:equipped', { id }); } },
  cycle(d) { const t = this.tools(); if (t.length < 2) return; const i = t.indexOf(SAVE.inv.tool); this.equip(t.at((i + d + t.length) % t.length)); },
  ammo(type) { return SAVE.inv.ammo[type] || 0; },
  ammoMax(type) { return SAVE.inv.ammoMax[type] || 0; },
  addAmmo(type, n) { const before = this.ammo(type); SAVE.inv.ammo[type] = clamp(before + n, 0, this.ammoMax(type)); persist(); Bus.emit('ammo:changed', { type }); return SAVE.inv.ammo[type] - before; },
  useAmmo(type) { if (this.ammo(type) <= 0) return false; SAVE.inv.ammo[type]--; Bus.emit('ammo:changed', { type }); return true; },
  ingredient(k) { return (SAVE.inv.ingredients || {})[k] || 0; },
  addIngredient(k, n) { SAVE.inv.ingredients = SAVE.inv.ingredients || {}; SAVE.inv.ingredients[k] = this.ingredient(k) + n; persist(); Bus.emit('ingredient:changed', { k }); },
  useIngredient(k, n) { if (this.ingredient(k) < n) return false; SAVE.inv.ingredients[k] -= n; persist(); return true; },
  hasEmptyBottle() { return SAVE.inv.bottles.includes('vide'); },
  drink(i, P) {
    const b = SAVE.inv.bottles[i], it = b && this.item(b); if (!it || it.kind !== 'drink') return false;
    SAVE.inv.bottles[i] = 'vide'; G.healBy(it.heal); persist(); Bus.emit('item:used', { id: b }); return true;
  },
};
