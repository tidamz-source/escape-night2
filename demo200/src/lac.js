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
