# Escape Night 2 — Le royaume d'Aube-Figée

RPG d'action en vue de dessus, dans l'esprit des Zelda 16-bit, dans l'univers d'Escape Night.
PWA jouable en paysage sur mobile, ordinateur et manette.

## Version 1 : la première boucle
1. **Choix du héros** (Sacha, Cam ou Rox) sur 3 emplacements de sauvegarde. Les deux autres enfants deviennent des captifs.
2. **Prologue au camping** : les tentes sont vides. Prendre la branche, suivre les lucioles jusqu'au lac, rencontrer Lumi, traverser la faille.
3. **Bourg-Luciole** : le sage, la forge (épée de bois, bouclier), l'épicerie (bouteille, sirop de grenadine, cailloux), l'auberge (soin), la fontaine-horloge (sauvegarde, progression de l'aube).
4. **Collines du Nord** : bestioles, buissons à écus, sentier vers la grotte.
5. **Donjon 1 : la grotte des lucioles** : arène, clé, bloc à pousser, lance-pierre, cristal et pont, boss (la Grande Ombre), puis libération du premier enfant.
6. Retour au village, premier fragment d'aube, fin de la version 1 (on peut continuer à explorer).

## Version 2 : le Bois des murmures
1. **Le pont-levis** : à l'ouest des collines, tirer au lance-pierre dans la cible de l'autre rive abaisse le pont.
2. **Donjon 2 : le Bois des murmures** (7 salles) : arène de sangliers et d'écureuils, clé, salle du moulin et son vent par rafales (s'abriter derrière les souches), coffre du **frisbee**.
3. **Le frisbee** (outil B) : part en arc et revient, étourdit les ennemis, rapporte les objets (la clé de l'îlot), allume les lanternes (deux en même temps pour ouvrir la grille).
4. **Boss : le Grand-Duc** : on l'abat au frisbee quand il vole, puis on le frappe au sol. Nouveau grand cœur, libération de **Mamie**.
5. **La cuisine de Mamie** au village : soupe (soin complet) contre 3 champignons et une bouteille vide.
6. Menu pause : croix de fermeture en haut à droite.

## Versions 3 à 6 : la suite et la fin de l'aventure
- **Donjon 3, les Mines des gnomes** (nord-est des collines) : la clé de la grille est sur une corniche, à rapporter au frisbee. Wagonnet et aiguillages, **grappin** (poteaux, caisses, petits ennemis), boss la Taupe de fer, Amandine et son comptoir.
- **Le lac** (sud-est du village) : ravin à franchir au grappin, lucioles-relais, temple et tour.
- **Donjon 4, le Temple englouti** : des vannes font monter ou baisser l'eau de tout le temple. **Palmes et tuba** (nager, plonger), boss la Reine des remous, le deuxième enfant et le voyage rapide.
- **Donjon 5, la Tour des artificiers** (île du lac, à la nage) : **pétards**, murs fissurés, mèche, trois torches, boss le Chevalier de fer, Goyave (il suit le héros et déterre des trésors).
- **Donjon 6, le Château de Minuit** (défilé au sud-ouest du lac, éboulement à faire sauter) : 4 × 3 salles, horloges qui figent la salle, une aile par outil pour les cinq sceaux, le Chevalier Minuit (Papa ensorcelé), le Roi Minuit en 3 phases, le lever du soleil, le retour au camping et le générique.

## Contrôles
| | Clavier | Manette | Tactile |
|---|---|---|---|
| Se déplacer | Flèches / ZQSD | Stick gauche / croix | Stick rond flottant (moitié gauche) |
| A : arme, parler, ouvrir (plonger à la nage) | Espace / J / Entrée | A (Croix) | Bouton A |
| B : outil équipé | K / C | B (Rond) | Bouton B |
| Outil suivant | E / Tab | LB / RB | Toucher la case B |
| Roulade (Rox) | L | X (Carré) | Bouton R |
| Pause (objets, carte, options) | Échap / P | Start | Bouton II |

## Architecture
Modules indépendants qui communiquent par un bus d'événements (`Bus.emit` / `Bus.on`) et par la sauvegarde ; le contenu est dans `data/`.

- `src/core.js` : rendu, chargement des images, préférences, sons
- `src/bus.js` : bus d'événements et chargement des données JSON
- `src/input.js` : clavier, manette, écran tactile
- `src/systems/` : un fichier par système
  - `save.js` (3 emplacements) · `heroes.js` (choix, bonus, dessin des héros) · `inventory.js` · `wallet.js` (écus) · `shop.js` · `story.js` (drapeaux, objectifs, dialogues) · `loot.js` (butin)
- `src/world.js` : cartes, générateur de donjons (`buildDungeon`), thèmes de pierre et rendu des tuiles
- `src/entities.js` : collisions, héros, ennemis
- `src/objects.js` : ramassables, coffres, portes, volets, énigmes, boss
- `src/actors.js` : villageois, maisons, fontaine, faille, Lumi, cage
- `src/bois.js` : donjon 2 (frisbee, ennemis du bois, Grand-Duc, interrupteurs, cible du pont-levis)
- `src/tools.js` : grappin, pétards, nage, poteaux, murs fissurés, mèches, torches, vannes, horloges, wagonnets, relais, sceaux, Goyave
- `src/mines.js`, `src/lac.js`, `src/temple.js`, `src/tower.js`, `src/castle.js` : les zones 3 à 6 (ennemis, boss, salles)
- `src/areas.js` : les zones (camping, royaume, grotte, bois)
- `src/ui.js` : HUD, dialogues, menus, boutique, écrans
- `src/game.js` : états du jeu, transitions, scènes, rendu du monde
- `data/heroes.json`, `items.json`, `shops.json`, `dialogues.json` : héros, objets, catalogues, répliques et objectifs

## Assets
- `assets/npc/` : Mamie (Claudine), Amandine, Papa (4 directions × 9 images) et Goyave, repris d'Escape Night
- `assets/swim/` : nageurs vus de dessus (piscine d'Escape Night)
- `assets/src/*.ase` + `tools/ase2sheet.py` : Sacha (Aseprite, 1:1, cases 32 × 32)
- `assets/cam.*`, `assets/rox.*` : placeholders repris d'Escape Night (`tools/en2sheet.py`, densité ×2), à remplacer par des .ase
- `assets/faces/` : portraits des dialogues (Escape Night)
- `assets/props/` : décors (Escape Night, densité ×2)

## Déploiement
À chaque mise à jour : changer `VERSION` dans `src/core.js` et `sw.js`, et les `?v=` dans `index.html` et `sw.js`.
