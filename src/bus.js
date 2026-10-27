'use strict';
// Bus d'événements : les modules annoncent ce qui se passe, d'autres écoutent, sans se connaître.
const Bus = {
  h: {},
  on(ev, fn) { (this.h[ev] = this.h[ev] || []).push(fn); },
  emit(ev, d) { for (const fn of this.h[ev] || []) { try { fn(d); } catch (e) { console.error('[bus]', ev, e); } } },
};
// Données du jeu (JSON) : héros, objets, boutiques, dialogues
const DATA = {};
function loadData() {
  return Promise.all(['heroes', 'items', 'shops', 'dialogues'].map(k => fetch(`data/${k}.json?v=${VERSION}`).then(r => r.json()).then(j => { DATA[k] = j; })));
}
