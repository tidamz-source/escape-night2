'use strict';
// Porte-monnaie : les écus. Ne connaît ni les boutiques ni le butin.
const Wallet = {
  get() { return SAVE.money; },
  cap() { return SAVE.walletCap; },
  add(n) { const before = SAVE.money; SAVE.money = clamp(before + n, 0, this.cap()); const d = SAVE.money - before; if (d) { persist(); Bus.emit('money:changed', { delta: d }); } return d; },
  spend(n) { if (SAVE.money < n) return false; SAVE.money -= n; persist(); Bus.emit('money:changed', { delta: -n }); return true; },
};
