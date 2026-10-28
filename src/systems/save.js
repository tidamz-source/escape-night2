'use strict';
// Sauvegarde : 3 emplacements. Chaque système range ses données dans sa propre partie de SAVE.
const SLOTS = 3;
const slotKey = i => `escape-night2-v1-slot${i}`;
function defaultSave(hero) {
  return {
    v: 1, hero: hero || 'sacha', started: false, playTime: 0, lastArea: 'camp',
    maxHp: 6, keys: 0, fragments: 0, visited: {},
    money: 0, walletCap: 99,                                       // porte-monnaie
    inv: { weapon: 'branche', owned: {}, tool: null, ammo: { cailloux: 0 }, ammoMax: { cailloux: 30 }, bottles: [], ingredients: {} }, // inventaire
    stock: {},                                                     // boutiques : articles déjà vendus
  };
}
let SAVE = defaultSave(), SLOT = -1;
function readSlot(i) { try { const s = JSON.parse(localStorage.getItem(slotKey(i))); return s && s.v === 1 ? s : null; } catch (_) { return null; } }
function loadSlot(i) {
  const s = readSlot(i), d = defaultSave(s && s.hero);
  SLOT = i; SAVE = s ? Object.assign(d, s, { inv: Object.assign(d.inv, s.inv || {}) }) : d;
  Bus.emit('save:loaded', { slot: i });
}
function newSlot(i, hero) { SLOT = i; SAVE = defaultSave(hero); SAVE.started = true; persist(); Bus.emit('save:loaded', { slot: i }); }
function persist() { if (SLOT < 0) return; try { localStorage.setItem(slotKey(SLOT), JSON.stringify(SAVE)); } catch (_) {} }
function eraseSlot(i) { try { localStorage.removeItem(slotKey(i)); } catch (_) {} }
