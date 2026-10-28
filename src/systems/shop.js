'use strict';
// Boutiques : lisent leur catalogue (data/shops.json), vérifient les conditions, passent par le porte-monnaie et l'inventaire
const Shop = {
  def(id) { return DATA.shops[id]; },
  state(shopId, e) {
    const it = Inventory.item(e.id), key = shopId + ':' + e.id, sold = SAVE.stock[key] || 0;
    if (e.once && Inventory.has(e.id)) return { ok: false, why: 'Déjà acheté' };
    if (e.stock && sold >= e.stock) return { ok: false, why: 'Épuisé' };
    if (e.needs === 'emptyBottle' && !Inventory.hasEmptyBottle()) return { ok: false, why: 'Il te faut une bouteille vide' };
    if (e.needs && e.needs !== 'emptyBottle' && !Inventory.has(e.needs)) return { ok: false, why: 'Il te faut un ' + Inventory.item(e.needs).name.toLowerCase() };
    if (it.kind === 'ammo' && Inventory.ammo(it.ammo) >= Inventory.ammoMax(it.ammo)) return { ok: false, why: 'Sacoche pleine' };
    if (e.cost) { for (const [k, n] of Object.entries(e.cost)) if (Inventory.ingredient(k) < n) return { ok: false, why: `Il faut ${n} ${k}` }; }
    else if (Wallet.get() < e.price) return { ok: false, why: 'Pas assez d\'écus' };
    return { ok: true };
  },
  buy(shopId, e) {
    const st = this.state(shopId, e); if (!st.ok) return st;
    if (e.cost) for (const [k, n] of Object.entries(e.cost)) Inventory.useIngredient(k, n); else Wallet.spend(e.price);
    Inventory.give(e.id);
    const key = shopId + ':' + e.id; SAVE.stock[key] = (SAVE.stock[key] || 0) + 1; persist();
    Bus.emit('shop:bought', { shop: shopId, id: e.id });
    return { ok: true };
  },
};
