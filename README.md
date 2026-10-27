# Escape Night 2 — La forêt des ombres (prototype)

RPG d'action en vue de dessus, dans l'esprit des Zelda 16-bit, avec Sacha dans l'univers d'Escape Night.
PWA jouable en paysage sur mobile, ordinateur et manette.

## Chapitre 1
1. **Le camping** (zone ouverte) → au nord, **la forêt des ombres** (2 salles, clé, porte, cœur de luciole).
2. Au nord de la forêt, **la grotte des lucioles** (donjon de 6 salles) :
   - arène à l'ouest : les volets se ferment, il faut vaincre tous les ennemis → petite clé ;
   - salle à l'est : pousser le bloc sur la plaque → la grille s'ouvre → grand coffre : **le lance-pierre** ;
   - porte à clé au nord de l'entrée → gouffre : tirer sur le cristal au lance-pierre → un pont apparaît ;
   - **boss : la Grande Ombre**. Un caillou dans son œil ouvert l'étourdit, puis 3 coups de branche. 2 phases.
3. Réceptacle de cœur → fin du chapitre.

## Contrôles
| | Clavier | Manette | Tactile |
|---|---|---|---|
| Se déplacer | Flèches / ZQSD | Stick gauche / croix | Stick rond flottant (moitié gauche) |
| A : branche, parler, ouvrir | Espace / J / Entrée | A (Croix) | Bouton A |
| B : lance-pierre (8 directions) | K / C | B (Rond) | Bouton B |
| Pause | Échap / P | Start | Bouton II |

## Structure
- `src/core.js` : constantes, rendu, sauvegarde, sons
- `src/input.js` : clavier + manette + pad virtuel
- `src/world.js` : cartes (camping, forêt, grotte) et rendu des tuiles
- `src/entities.js` : collisions, Sacha, ennemis
- `src/objects.js` : objets, coffres, portes, volets, bloc, cristal, braseros, boss
- `src/game.js` : zones, caméra, lumière, interface, boucle
- `assets/src/*.ase` : sources Aseprite de Sacha (idle face, marche face, marche dos)
- `assets/sacha.png` + `sacha.json` : spritesheet générée par `python3 tools/ase2sheet.py`
- `assets/props/` : décors du camping

Règles des assets :
- Sacha : vrai pixel art 1:1 (cases de 32×32, pieds sur la dernière ligne, centré). Pour mettre à jour : remplacer les .ase dans `assets/src/` puis lancer `python3 tools/ase2sheet.py`. Les durées de frames viennent d'Aseprite.
- Décors du camping : 1 pixel monde = 2 pixels dans les PNG (repris d'Escape Night).

## Déploiement
À chaque mise à jour : changer `VERSION` dans `src/core.js` et `sw.js`, et les `?v=` dans `index.html` et `sw.js`.
