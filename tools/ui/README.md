# Habillage de l'interface (héroïque fantasy)

`ui.px.js` dessine avec pxl toutes les pièces de l'interface : coins de cadre en losange serti, gemmes, curseur épée,
cœurs (plein, vide, doré), crâne de la jauge de boss, médaillon de l'objet B, boutons du pad tactile (rubis, saphir, topaze),
anneau et pommeau du stick, pierre de nuit des menus, château lointain de l'écran titre.

```bash
node ~/pxl/bin/pxl.js build tools/ui/ui.px.js
cp tools/ui/out/sprites/*.png assets/ui/
```

Le reste (cadres de fer liserés d'or, parchemin, bannières, plaques) est tracé dans `src/ui.js` (`panel`, `woodBtn`, `ribbon`…).
Les polices (Pixelify Sans, Silkscreen, Jacquard 24 pour les titres gothiques) sont embarquées dans `assets/fonts`.
