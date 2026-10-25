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
- `assets/sacha.png` + `sacha.json` : spritesheet au format Aseprite (4 directions × 9 frames)
- `assets/props/` : décors du camping

Règle des assets : 1 pixel monde = 2 pixels dans les PNG (même densité qu'Escape Night).

## Déploiement
À chaque mise à jour : changer `VERSION` dans `src/core.js` et `sw.js`, et les `?v=` dans `index.html` et `sw.js`.
