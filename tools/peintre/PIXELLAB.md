# Pièces à générer dans PixelLab

Ces pièces manquent au kit pour peindre les zones encore en tuiles : Forêt, Orée, Col, Montagne, Lac, Prés, Lande grise, Terres de Minuit et Sanctuaire.

Les tailles sont données en px du monde. Le kit les double (32 px par case dans les cartes peintes).

Mêmes réglages pour toutes les pièces :
- fond transparent ;
- vue de dessus 3/4 ;
- lumière de jour neutre (c'est le jeu qui pose la nuit) ;
- palette olive et sourde, comme les Collines.

| # | Pièce | Zones | Canvas |
|---|-------|-------|--------|
| 1 | Sapin (3 variantes) | Forêt, Orée, Col | 48×64 |
| 2 | Sapin enneigé (2 variantes) | Montagne, Col | 48×64 |
| 3 | Arbre mort tordu (3 variantes) | Lande, Terres | 48×64 |
| 4 | Rocher gris moussu, gros / moyen / petit | Montagne, Lande, Forêt | 48×48 · 32×32 · 16×16 |
| 5 | Rocher enneigé (2 tailles) | Montagne | 48×48 · 32×32 |
| 6 | Buisson épineux sec (2 variantes) | Lande, Terres | 32×32 |
| 7 | Touffe de roseaux (3 variantes) | Lac, Prés | 32×32 |
| 8 | Nénuphars en groupe | Lac, Prés | 32×32 |
| 9 | Champignons des bois (rouges et bruns) | Forêt, Orée | 16×16 |
| 10 | Fleurs lumineuses du sanctuaire (2 variantes) | Sanctuaire | 32×32 |
| 11 | Souche moussue (sans hache) | Forêt, Orée, Lande | 32×32 |
| 12 | Clôture cassée (segment droit) | Lande, Terres | 48×32 |
| 13 | Ponton en bois (pièce signature) | Lac | 64×64 |
| 14 | Barque échouée (pièce signature) | Lac, Côte | 64×48 |

## Prompts

```
1 — Canvas 48x64, transparent background. Top-down 3/4 view pixel art tree for a 16-bit RPG, Zelda A Link to the Past inspired, soft hand-painted pixel shading, dark brown outline, muted olive-green palette, neutral daylight. A tall fir tree with layered drooping branches, dark green needles with olive highlights, short brown trunk visible at the bottom, small soft shadow at the base. Make 3 variations of shape and height.
```
```
2 — Canvas 48x64, transparent background. Top-down 3/4 view pixel art tree for a 16-bit RPG, Zelda A Link to the Past inspired, soft hand-painted pixel shading, dark brown outline, muted palette, neutral daylight. A snow-covered fir tree, white snow caps resting on dark green layered branches, short brown trunk, small bluish shadow at the base. Make 2 variations.
```
```
3 — Canvas 48x64, transparent background. Top-down 3/4 view pixel art for a 16-bit RPG, Zelda A Link to the Past inspired, soft hand-painted pixel shading, dark outline, muted grey-brown palette, neutral daylight. A dead twisted tree without leaves, gnarled grey-brown bark, crooked bare branches, exposed roots, small shadow at the base. Make 3 variations.
```
```
4 — Canvas 48x48 (then 32x32 and 16x16), transparent background. Top-down 3/4 view pixel art for a 16-bit RPG, Zelda A Link to the Past inspired, soft hand-painted pixel shading, dark outline, muted palette, neutral daylight. A grey boulder with rounded facets and patches of olive moss on top, soft shadow at the base.
```
```
5 — Canvas 48x48 (then 32x32), transparent background. Top-down 3/4 view pixel art for a 16-bit RPG, Zelda A Link to the Past inspired, soft hand-painted pixel shading, dark outline, muted palette, neutral daylight. A grey mountain rock with a thick cap of snow on top and small snow drifts at its base.
```
```
6 — Canvas 32x32, transparent background. Top-down 3/4 view pixel art for a 16-bit RPG, Zelda A Link to the Past inspired, soft hand-painted pixel shading, dark outline, muted ochre and grey-green palette, neutral daylight. A dry thorny bramble bush with tangled brown stems and a few dull leaves. Make 2 variations.
```
```
7 — Canvas 32x32, transparent background. Top-down 3/4 view pixel art for a 16-bit RPG, Zelda A Link to the Past inspired, soft hand-painted pixel shading, dark outline, muted olive palette, neutral daylight. A clump of cattail reeds growing at a pond edge, tall green blades and brown cattail heads. Make 3 variations.
```
```
8 — Canvas 32x32, transparent background. Top-down pixel art for a 16-bit RPG, Zelda A Link to the Past inspired, soft hand-painted pixel shading, dark outline, muted olive palette, neutral daylight. A small group of three round lily pads with a notch, one with a small white and pink water lily flower, no water drawn.
```
```
9 — Canvas 16x16, transparent background. Top-down 3/4 view pixel art for a 16-bit RPG, Zelda A Link to the Past inspired, dark outline, muted palette, neutral daylight. A tiny cluster of forest mushrooms, two red caps with white dots and one brown cap.
```
```
10 — Canvas 32x32, transparent background. Top-down 3/4 view pixel art for a 16-bit RPG, Zelda A Link to the Past inspired, soft hand-painted pixel shading, dark outline, neutral daylight. A clump of magical flowers with pale yellow glowing bulb petals and thin green stems, a faint warm glow around the petals. Make 2 variations.
```
```
11 — Canvas 32x32, transparent background. Top-down 3/4 view pixel art for a 16-bit RPG, Zelda A Link to the Past inspired, soft hand-painted pixel shading, dark outline, muted palette, neutral daylight. An old tree stump with visible rings on top, roots spreading on the ground, patches of olive moss on the side.
```
```
12 — Canvas 48x32, transparent background. Top-down 3/4 view pixel art for a 16-bit RPG, Zelda A Link to the Past inspired, soft hand-painted pixel shading, dark outline, muted grey-brown palette, neutral daylight. A straight segment of old broken wooden fence, weathered grey planks, one plank fallen and one post leaning.
```
```
13 — Canvas 64x64, transparent background. Top-down 3/4 view pixel art for a 16-bit RPG, Zelda A Link to the Past inspired, soft hand-painted pixel shading, dark outline, warm brown wood palette, neutral daylight. A small wooden fishing pier made of planks on posts, seen from above, extending forward, a rope coiled at the end, no water drawn.
```
```
14 — Canvas 64x48, transparent background. Top-down 3/4 view pixel art for a 16-bit RPG, Zelda A Link to the Past inspired, soft hand-painted pixel shading, dark outline, warm muted palette, neutral daylight. A small wooden rowing boat stranded on its side, two oars lying next to it, slightly worn paint.
```
