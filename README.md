# Escape Night 2 — La forêt des ombres (prototype)

RPG d'action en vue de dessus, dans l'esprit des Zelda 16-bit, avec Sacha dans l'univers d'Escape Night.
PWA jouable en paysage sur mobile, ordinateur et manette.

## Contrôles
| | Clavier | Manette | Tactile |
|---|---|---|---|
| Se déplacer | Flèches / ZQSD | Stick gauche / croix | Croix virtuelle (gauche) |
| A : branche, parler, ouvrir | Espace / J / Entrée | A (Croix) | Bouton A |
| B : objet (à venir) | K / C | B (Rond) | Bouton B |
| Pause | Échap / P | Start | Bouton II |

## Structure
- `src/core.js` : constantes, rendu, sauvegarde, sons
- `src/input.js` : clavier + manette + pad virtuel
- `src/world.js` : cartes et rendu des tuiles
- `src/entities.js` : Sacha, ennemis, coffre, porte, objets
- `src/game.js` : zones, caméra, lumière, interface, boucle
- `assets/src/*.ase` : sources Aseprite de Sacha (idle face, marche face, marche dos)
- `assets/sacha.png` + `sacha.json` : spritesheet générée par `python3 tools/ase2sheet.py`
- `assets/props/` : décors du camping

Règles des assets :
- Sacha : vrai pixel art 1:1 (cases de 32×32, pieds sur la dernière ligne, centré). Pour mettre à jour : remplacer les .ase dans `assets/src/` puis lancer `python3 tools/ase2sheet.py`. Les durées de frames viennent d'Aseprite.
- Décors du camping : 1 pixel monde = 2 pixels dans les PNG (repris d'Escape Night).

## Déploiement
À chaque mise à jour : changer `VERSION` dans `src/core.js` et `sw.js`, et les `?v=` dans `index.html` et `sw.js`.
