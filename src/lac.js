'use strict';
// ---------- le lac : au sud-est du village (ravin, temple englouti, île de la tour, défilé du château) ----------
class Rubble extends Boulder { // éboulement du défilé : les deux rochers sautés ouvrent la route du château
  onBlast(G) { super.onBlast(G); if (SAVE.rubble1 && SAVE.rubble2 && !SAVE.castleOpen) { SAVE.castleOpen = true; persist(); G.say([{ who: 'Lumi', text: 'La route du Château de Minuit est ouverte ! Papa est tout au bout.' }]); } }
}
// façades : le temple à moitié englouti, la tour des artificiers (la porte reste ouverte sur la tuile de sortie)
class Facade {
  constructor(x, y, kind) { this.x = x; this.y = y; this.kind = kind; this.w = 8; this.h = 4; this.t = 0; }
  update(dt) { this.t += dt; }
  draw() {
    hi(this.x, this.y, false, () => {
      if (this.kind === 'temple') {
        D(-120, -110, 240, 78, '#2e5860'); D(-120, -110, 240, 4, '#4e8a90'); D(-136, -126, 272, 18, '#3a6a72'); D(-112, -150, 224, 26, '#2e5860'); D(-80, -168, 160, 20, '#3a6a72'); D(-40, -180, 80, 14, '#4e8a90');
        for (const cx of [-104, -72, 56, 88]) { D(cx, -108, 16, 76, '#4e8a90'); D(cx, -108, 5, 76, '#7ab8be'); D(cx - 4, -112, 24, 6, '#3a6a72'); }
        D(-44, -98, 88, 66, '#05080f'); D(-52, -108, 104, 10, '#244a52'); D(-48, -98, 4, 66, '#244a52'); D(44, -98, 4, 66, '#244a52'); // encadrement de la porte
        for (let i = 0; i < 6; i++) D(-118 + i * 44, -40 + (i % 2) * 4, 20, 8, '#1f5a4a'); // algues
        D(-6, -170, 12, 12, '#ffe27a');
      } else if (this.kind === 'tower') {
        D(-60, -230, 120, 198, '#5a302a'); D(-60, -230, 18, 198, '#7a463a'); D(42, -230, 18, 198, '#3a1e1a');
        for (let y = -226; y < -34; y += 10) for (let x = -60 + ((y / 10) & 1) * 10; x < 60; x += 20) D(x, y, 1, 9, '#46241e');
        for (let x = -68; x < 68; x += 20) D(x, -250, 14, 22, '#6a3a32'); D(-68, -232, 136, 6, '#8a5040');
        D(-14, -190, 28, 30, '#1a0c0a'); D(-12, -188, 24, 26, Math.sin(this.t * 3) > 0 ? '#ffb050' : '#ff8a30');
        D(-20, -84, 40, 52, '#3a1e1a'); D(-16, -80, 32, 48, '#05080f'); D(-12, -84, 24, 4, '#05080f');
        D(-38, -40, 76, 8, '#3a1e1a'); D(-34, -36, 4, 6, '#3a1e1a'); D(30, -36, 4, 6, '#3a1e1a');
        D(28, -150, 30, 6, '#2a1d38'); D(44, -170, 4, 24, '#c83a3a'); // fusée
      }
    });
  }
}
function buildLacArea() {
  const A = new Area('lac', buildLac(), 'camp'), t = (x, y) => ({ x: x * TS + 8, y: (y + 1) * TS });
  A.addProp('lamp', 49 * TS, 12 * TS, { fw: 4, fh: 3, light: { oy: -26, r: 46, c: 'rgba(255,220,150,' } });
  A.addProp('lamp', 9 * TS, 24 * TS, { fw: 4, fh: 3, light: { oy: -26, r: 46, c: 'rgba(255,220,150,' } });
  const keep = [{ x: 40 * TS, y: 0, w: 20 * TS, h: 14 * TS }, { x: 0, y: 22 * TS, w: 24 * TS, h: 8 * TS }, { x: 0, y: 32 * TS, w: 16 * TS, h: 14 * TS }, { x: 0, y: 8 * TS, w: 60 * TS, h: 5 * TS }];
  scatter(A, 63, keep, { trees: 40, rocks: 14, flowers: 20, bushes: 26 });
  A.spawn = function () {
    this.ents = [];
    for (const [x, y] of this.bushSpots) this.ents.push(new Bush(x, y));
    const p = (C, x, y, ...a) => { const q = t(x, y); return new C(q.x, q.y, ...a); };
    // le ravin : un poteau de chaque côté
    this.ents.push(p(Post, 47, 4), p(Post, 53, 10));
    this.ents.push(p(Sign, 45, 4, [{ text: '« Ravin du lac. Le pont a été emporté. Les gnomes y passaient au grappin. »' }]));
    this.ents.push(p(Sign, 51, 11, [{ text: '« Au milieu du lac : le temple englouti. À l\'est : l\'île de la tour. Au sud-ouest : le défilé du château. »' }]));
    this.ents.push(p(Relay, 45, 11, 'lac'), p(Relay, 10, 34, 'defile'));
    // le temple et la tour
    this.ents.push(new Facade(22 * TS + 8, 21 * TS, 'temple'), new Facade(42 * TS, 23 * TS, 'tower'));
    this.ents.push(p(Sign, 18, 24, [{ text: '« Temple englouti. Entrée par la chaussée. »' }]));
    this.ents.push(p(Sign, 44, 30, [{ text: '« Tour des artificiers. Danger : poudre ! »' }]));
    // le défilé : un éboulement
    this.ents.push(new Rubble(6 * TS + 4, 40 * TS, 'rubble1'), new Rubble(8 * TS + 4, 40 * TS, 'rubble2'));
    this.ents.push(p(Sign, 10, 37, [{ text: '« Défilé du Château de Minuit. Éboulement : passage impossible. »' }, { who: '{hero}', text: 'Des rochers énormes… Il faudrait les faire sauter.', face: 'o' }]));
    // bestioles
    this.ents.push(p(Crab, 8, 16), p(Crab, 12, 33), p(Crab, 50, 33), p(Raccoon, 30, 11), p(Raccoon, 22, 42), p(Crow, 36, 10), p(Crow, 54, 22), p(Crow, 16, 40));
  };
  A.update = function (G) {
    const P = G.player;
    if (!SAVE.lacCrossed && P.y > (LAC.ravine + 3) * TS) { SAVE.lacCrossed = true; persist(); }
    if (!SAVE.lacHint && P.y < 6 * TS && P.x > 44 * TS && !Inventory.has('grappin')) { SAVE.lacHint = true; G.say(Story.script('lacNoHook')); }
  };
  A.enemyBounds = { x: 24, y: (LAC.ravine + 3) * TS, w: A.w - 48, h: A.h - (LAC.ravine + 3) * TS - 24 };
  A.roomDark = () => Math.max(0.16, 0.5 - 0.05 * (SAVE.fragments || 0));
  A.start = { x: 51 * TS, y: 4 * TS + 8, dir: 'down' };
  A.fromTemple = { x: 22 * TS + 8, y: 22 * TS + 6, dir: 'down' };
  A.fromTower = { x: 42 * TS, y: 24 * TS + 4, dir: 'down' };
  A.fromCastle = { x: 7 * TS, y: 37 * TS, dir: 'up' };
  A.exits = {
    K: G => G.enter('royaume', G.areas.royaume.fromLac),
    M: G => G.enter('temple', G.areas.temple.start),
    N: G => { if (G.areas.tower) G.enter('tower', G.areas.tower.start); else { G.player.y += 16; G.say([{ text: 'La porte de la tour est encore fermée.' }]); } },
    O: G => { if (G.areas.castle) G.enter('castle', G.areas.castle.start); else { G.player.y -= 16; G.say([{ text: 'Le chemin du château est encore fermé.' }]); } },
  };
  A.name = 'Le lac';
  A.dark = 0.5;
  return A;
}
