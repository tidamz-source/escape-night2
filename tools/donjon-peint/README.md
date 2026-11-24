# Donjons peints

Décors peints des salles de donjon, en pixel art généré par code avec [pxl](https://github.com/crsolver/claude-pxl).

1. `node extract.js [bois.js buildBoisArea bois.json]` : recalcule les grilles des salles (la Grotte par défaut) depuis `src/cave.js` (mêmes collisions que le jeu) et écrit `rooms.json`.
2. `node <pxl>/bin/pxl.js build grotte.px.js` (ou `bois.px.js`, `mines.px.js`) : peint chaque salle en 480 × 272 dans `out/scenes/`.
3. Agrandir ×2 (plus proche voisin) en 960 × 544 et copier dans `assets/maps/grotte_<salle>.png`.

Le jeu les branche via `paintRooms` dans `makeDungeon` (voir `src/cave.js`).
