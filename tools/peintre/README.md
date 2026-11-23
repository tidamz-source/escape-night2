# Peintre de cartes

Transforme une zone en tuiles (grille + décor) en carte peinte dans la direction artistique des cartes peintes (Collines, Côte, Bourg-Luciole). Pas d'IA générative, pas de crédits : tout est calculé à partir du kit.

## Fichiers

- `paint.py` : le moteur. Il produit :
  - la carte (2× le monde, 32 px par case) ;
  - les découpes « dessus » et leur JSON ;
  - la grille de collisions.
- `grab.py` : détourage d'un objet dans une carte peinte (GrabCut).
- `detect.py` : repère automatiquement les petits objets isolés (fleurs, feuilles, rochers) dans une carte peinte.
- `sources.py` + `extract_all.py` : cadres relevés à la main des pièces à détourer, carte par carte.
- `sheet.py` : planche-contact numérotée.
- `kit/sprites/` : les pièces validées, utilisées par le moteur.
- `kit/candidats/` + `candidats.json` : les pièces à valider (numérotées), avec leur source, leur catégorie et un drapeau « signature ».
- `PIXELLAB.md` : les pièces qui manquent, avec leurs prompts.

## Règles de DA (le moteur les applique)

- **Lumière :** neutre et uniforme, sans ombre portée forte. C'est le jeu qui pose la nuit.
- **Pixel art :** 32 px par case, contours sombres. Passe finale à la résolution du monde, sur une palette de 112 couleurs de la carte + 16 couleurs des sprites fins, puis remontée ×2.
- **Transitions organiques :**
  - lisière d'herbe sombre avec touffes qui débordent sur le sable et le chemin ;
  - berge de terre, plus haute côté nord (vue 3/4) ;
  - reflet clair au bord de l'eau, fond plus sombre au centre.
- **Forêt :** arbres serrés, plus sombres vers l'intérieur, la rangée de lisière passe devant le héros.
- **Collisions :** identiques à la zone en tuiles. Troncs, rochers et palmiers en `#` sur leur case.
- **Pièces signature** (maisons, moulin, phare…) : jamais posées au hasard, seulement à la main.

## Utilisation

```
python3 paint.py zone.json sortie/ [graine]
```

`zone.json` contient :
- `id` : l'identifiant de la zone ;
- `g` : la grille ;
- `props` : les arbres, rochers et fleurs du jeu, avec leurs positions ;
- `decor` : les palmiers ;
- `ents` : les entités à laisser dégagées.

Il s'obtient en lisant la zone dans le jeu (Playwright, voir l'historique des Dunes).
