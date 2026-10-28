'use strict';
// Histoire : drapeaux de progression, objectif du moment, dialogues (variantes selon le héros)
const Story = {
  flag(k) { if (k === 'slingshot') return Inventory.has('lance_pierre'); if (['frisbee', 'grappin', 'palmes', 'petards'].includes(k)) return Inventory.has(k); return !!SAVE[k]; },
  set(k) { SAVE[k] = true; persist(); Bus.emit('story:advanced', { flag: k }); },
  cond(c) { if (!c) return true; return c.split('&').every(t => { t = t.trim(); const neg = t[0] === '!'; const v = this.flag(neg ? t.slice(1) : t); return neg ? !v : v; }); },
  names() { return { hero: Heroes.name(SAVE.hero), enfant1: Heroes.name(Heroes.captive(1)), enfant2: Heroes.name(Heroes.captive(2)), e: Heroes.def().he === 'elle' ? 'e' : '' }; },
  fmt(s) { const n = this.names(); return s.replace(/\{(\w+)\}/g, (m, k) => n[k] != null ? n[k] : m); },
  // normalise des répliques : textes formatés, portrait de qui parle
  lines(arr) {
    return arr.map(l => {
      const raw = l[SAVE.hero] || l.text, who = l.who ? this.fmt(l.who) : null;
      let face = null;
      if (l.who === '{hero}') face = SAVE.hero;
      else if (l.faceOf) face = l.faceOf === 'enfant1' ? Heroes.captive(1) : l.faceOf === 'enfant2' ? Heroes.captive(2) : l.faceOf;
      return { who, text: this.fmt(raw), face, mood: l.face || 'smile' };
    });
  },
  script(id) { return this.lines(DATA.dialogues[id]); },
  // dialogue d'un PNJ : première entrée dont la condition est vraie ; applique ses effets
  talk(id) {
    const e = DATA.dialogues[id].find(x => this.cond(x.if)); if (!e) return [];
    if (e.set) this.set(e.set);
    if (e.give && e.give.money) Wallet.add(e.give.money);
    if (e.heal && G.player) { G.player.hp = SAVE.maxHp; SFX.drink(); }
    return this.lines(e.lines);
  },
  objective() { const o = DATA.dialogues.objectives.find(x => this.cond(x.if)); return o ? this.fmt(o.text) : ''; },
};
