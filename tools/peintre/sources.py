"""Cadres (px de l'image source) des pièces à détourer dans les cartes peintes.
cat = catégorie ; sig = pièce signature (jamais posée au hasard par le moteur)."""
K = 1216 / 1024   # camping et route_nord : cadres relevés sur un aperçu de 1024 px de large
def k(b): return tuple(round(v * K) for v in b)
SOURCES = {
 'royaume': [
  ('pin', 'arbre', (470, 20, 570, 185)), ('arbre_roux', 'arbre', (590, 70, 690, 215)), ('rondin', 'bois', (690, 140, 805, 215)),
  ('puits', 'objet', (1655, 875, 1735, 965)), ('lampadaire', 'objet', (700, 465, 740, 545)), ('panneau', 'objet', (395, 645, 435, 705)),
  ('bouleau', 'arbre', (1865, 795, 2005, 1005)), ('rondin2', 'bois', (1885, 1025, 1995, 1125)), ('arbre_rond', 'arbre', (715, 1255, 815, 1385)),
  ('rocher', 'rocher', (785, 1325, 875, 1395)), ('arbre_rouge', 'arbre', (1555, 45, 1665, 165)), ('arbre_rouge2', 'arbre', (1805, 25, 1915, 155)),
  ('cible', 'objet', (120, 640, 164, 688)),
  ('maison_a', 'batiment', (455, 245, 705, 405), 1), ('maison_b', 'batiment', (1125, 105, 1405, 345), 1), ('maison_c', 'batiment', (1555, 255, 1765, 415), 1),
  ('maison_d', 'batiment', (445, 435, 735, 695), 1), ('auberge', 'batiment', (1305, 455, 1615, 715), 1), ('beffroi', 'batiment', (875, 395, 1145, 855), 1),
  ('forge', 'batiment', (445, 955, 875, 1235), 1), ('maisons_rang', 'batiment', (1115, 985, 1615, 1235), 1), ('chaumiere', 'batiment', (1605, 1065, 1805, 1235), 1),
 ],
 'collines': [
  ('moulin', 'batiment', (1685, 1015, 1905, 1385), 1), ('ferme', 'batiment', (415, 1035, 725, 1325), 1),
  ('rondin3', 'bois', (815, 155, 965, 255)), ('rondin4', 'bois', (1985, 275, 2105, 375)),
  ('panneau2', 'objet', (1245, 295, 1295, 345)), ('lampadaire2', 'objet', (1235, 655, 1285, 765)), ('lanterne', 'objet', (1105, 1195, 1165, 1295)),
  ('rochers', 'rocher', (245, 95, 425, 225)), ('bouleau_jaune', 'arbre', (85, 15, 215, 215)), ('arbre_roux2', 'arbre', (675, 75, 805, 215)), ('pins', 'arbre', (555, 15, 665, 205)),
 ],
 'camping': [
  ('mobilhome_a', 'batiment', k((100, 95, 238, 185)), 1), ('mobilhome_b', 'batiment', k((325, 82, 448, 175)), 1),
  ('rondin5', 'bois', k((213, 198, 252, 220))), ('rondin6', 'bois', k((298, 196, 337, 220))), ('banc', 'objet', k((373, 235, 420, 267))),
  ('borne', 'objet', k((152, 384, 168, 422))), ('rocher2', 'rocher', k((428, 362, 452, 382))), ('bouleau2', 'arbre', k((868, 228, 942, 345))),
  ('bouleau3', 'arbre', k((686, 45, 740, 142))), ('rochers2', 'rocher', k((842, 186, 888, 222))), ('rochers3', 'rocher', k((718, 108, 768, 148))),
 ],
 'route_nord': [
  ('pont', 'batiment', k((468, 212, 542, 282)), 1), ('panneau3', 'objet', k((538, 282, 578, 332))),
  ('caisse', 'objet', k((202, 70, 235, 105))), ('caisse2', 'objet', k((783, 60, 812, 92))), ('tonneau', 'objet', k((798, 78, 824, 104))),
  ('foin', 'objet', k((252, 58, 288, 97))), ('bois_coupe', 'bois', k((52, 176, 97, 207))), ('bois_coupe2', 'bois', k((902, 362, 948, 398))),
  ('tronc_couche', 'bois', k((677, 72, 733, 108))), ('tronc_couche2', 'bois', k((137, 598, 198, 652))), ('tronc_couche3', 'bois', k((187, 657, 238, 698))),
  ('cloture', 'objet', k((138, 272, 187, 302))), ('cloture2', 'objet', k((798, 272, 882, 302))),
  ('rocher3', 'rocher', k((313, 181, 337, 198))), ('rocher4', 'rocher', k((888, 454, 910, 470))), ('arbuste', 'arbre', k((898, 506, 958, 565))),
  ('caisses', 'objet', k((842, 70, 885, 112))),
 ],
}
