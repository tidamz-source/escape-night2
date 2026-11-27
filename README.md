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

## Version 8 : la grande mise à jour
- **8.19.1** : pont-levis en 3 images (levé, tablier baissé, piliers baissés) ; Atelier Carte : bouton Fond… en haut, image glissée sur la carte utilisable comme fond.
- **8.19.0** : Atelier Carte : module Pont-levis (tablier sous le héros, piliers devant, zone praticable, descente animée depuis la charnière, ouvert par un drapeau comme drawbridge) ; retrait d’éléments de la bibliothèque.
- **8.18.1** : Atelier Carte : la ligne de pied peut avoir autant de points que voulu (ligne brisée), le jeu trie le héros à la hauteur de la ligne sous ses pieds.
- **8.18.0** : Atelier Carte (tools/carte) : fond vide + bâtiments, arbres et rochers en PNG, collisions en polygone, portes, sorties, arrivées, coffres ; le jeu charge les cartes de assets/cartes (passage derrière avec transparence).
- **8.17.2** : nouveaux sons choisis par Damien pour blip, menu, pickup, catch, shoot, hit et door.
- **8.17.1** : page sons.html pour écouter chaque bruitage et le remplacer en direct (le jeu utilise le remplacement sur le même appareil).
- **8.17.0** : 50 vrais bruitages générés avec ElevenLabs (assets/sfx), le synthé reste en secours si un fichier manque.
- **8.16.18** : nouvelle Pierrette (la cinquantaine, planche PixelLab 8 directions avec sa marche).
- **8.16.17** : bestiaire : chaque case montre la tête de l'animal (silhouette tant qu'il n'est pas vaincu) ; la fiche montre l'animal figé, posé au sol, même ceux qui volent.
- **8.16.16** : Filou a sa propre planche PixelLab (raton noir et blanc, 8 directions) et se promène dans les Collines ; nouvelle planche de Bastien avec sa marche en 8 directions.
- **8.16.15** : écran de choix des héros : retour à la grande taille, toujours sans lissage.
- **8.16.14** : écran de choix des héros : personnages à 100 % et sans lissage ; Camille et Roxane n'ont plus de pouvoir particulier (portée, vitesse et roulade identiques pour les trois héros).
- **8.16.13** : le nid du corbeau est un sprite en pixel art (assets/deco/nid.png) : brindilles, plumes noires et la cloche d'argent.
- **8.16.12** : procès du raton laveur : un nid de corbeau est visible en haut du grand arbre au nord des Collines ; le grappin le fait tomber (3e preuve : la cloche d'argent et des plumes noires).
- **8.16.11** : procès du raton laveur : la plume est sur la porte de la bergerie, les traces et la confiture de mûres en haut près du gros rocher, plus d'indice dans l'arbre (2 preuves au lieu de 3).
- **8.16.10** : le Roi Minuit flotte sans animation de marche (il garde son coup de sceptre) ; son ombre reste au sol sous lui, plus petite et plus pâle quand il monte.
- **8.16.9** : l'ombre du Roi Minuit reste sous ses pieds (plus petite et plus pâle quand il vole haut) ; la Chauve-souris de cristal n'a plus les trois cristaux dessinés par-dessus sa planche.
- **8.16.8** : le Roi Minuit a une animation de déplacement en 8 directions et frappe de son sceptre à chaque sort (orbes, taches d'ombre).
- **8.16.7** : les personnages (héros, PNJ, monstres, boss) sont lissés à l'affichage pour se fondre dans le décor peint ; zoom inchangé. Version de test test100 retirée.
- **8.16.6** : marche en 8 directions pour Arthur, Jules, le crieur, le fossoyeur, Margot, Odette et le ramasseur de coquillages ; le Chevalier de fer marche vraiment et a un vrai coup d'épée (planches PixelLab).
- **8.16.5** : animations de marche des PNJ recalées (les images de marche PixelLab font 68 px, pas 48 : elles étaient coupées et décalées).
- **8.16.4** : Pauline, Rosalie la lavandière et le vagabond ont une vraie animation de marche en 8 directions (planches PixelLab) quand ils se promènent.
- **8.16.3** : six nouveaux intérieurs peints : la bergerie, la cabane du bûcheron, l'herboristerie (l'herboriste derrière son comptoir), la hutte du gnome, la cabane du pêcheur et l'atelier de l'artificière (derrière son comptoir) ; collisions, lumières et objets à regarder.
- **8.16.2** : le gardien du phare n'a plus de maison à côté du phare : il vit au rez-de-chaussée du phare (fermé jusqu'à l'huile, on traverse son logis pour monter) et se promène sur la plage au pied du phare pour ses quêtes.
- **8.16.1** : six nouveaux intérieurs peints : l'atelier d'Anselme (tour-horloge, coffre peint), le comptoir d'Amandine (comptoir qui passe devant elle), chez Mahaut, chez Gaspard, chez Pierrette et la cuisine de Mamie ; collisions, lumières et objets à regarder.
- **8.16.0** : toute l'interface passe en héroïque fantasy, même disposition partout : cadres de fer bleuté liserés d'or sur parchemin aux bords roussis, coins en losange d'or serti d'un rubis (saphir quand le cadre est choisi), boutons et onglets en plaques de fer rivetées (rubis cerclé d'or pour la sélection), petite épée-curseur dans les menus, fond des menus en pierre de nuit ; HUD : cœurs en pixel art (plein, demi, vide, doré) en rangées de 10, objet B dans un médaillon d'or, écus et clés sur plaques, boussole en cadran de laiton ; jauge de boss sertie d'or avec crâne ; titres gothiques dorés (police Jacquard 24) pour le logo, les noms de lieux, les options et la fin de partie ; cartouche du nom et rubis « suite » dans les dialogues ; château lointain éclairé sur l'écran titre ; pad tactile en gemmes serties (A rubis, B saphir, R topaze), stick en anneau de fer clouté ; pièces dessinées avec pxl (`tools/ui/ui.px.js` → `assets/ui`) ; polices embarquées dans `assets/fonts` et mises en cache (plus de Google Fonts, le jeu marche hors ligne).
- **8.15.1** : la forge, l'épicerie de Mère Grenadine et l'auberge du Lampion deviennent des intérieurs peints (collisions, lumières, comptoir et bar qui passent devant l'épicière et l'aubergiste, étals de l'épicerie sur deux rangées).
- **8.15.0** : le Château de Minuit (donjon 6) devient un château gothique peint, lisières droites (option `clean`) : grandes dalles de marbre veiné à bordure de marbre sombre et liseré d'or, tapis cramoisis à bordure dorée entre les portes (une seule forme en croix quand ils se croisent, bordure continue), grand mur nord tendu de damas au-dessus d'un lambris, fenêtres gothiques à vitraux, portraits au cadre doré aux yeux qui luisent, enluminures, tout par paires symétriques ; arcs brisés aux passages avec une petite horloge à la clé, colonnes de marbre à chapiteau doré portant des chandelles, pétales de roses fanées ; horloge du trône arrêtée sur minuit au-dessus du dossier ; anges voilés sur socle de marbre dans la salle du frisbee ; galerie couverte de tableaux, armurerie aux épées croisées sur écus, bassin de nuit, gouffres au rebord de marbre brisé et pont doré (variante selon `SAVE.castleBridge`) ; pas de motifs au sol ni d'effets de lumière en points ; l'extracteur de grilles respecte `prison: false`.
- **8.14.9** : la Tour des artificiers (donjon 5) devient une tour en fête peinte, lisières droites (option `clean`) : briques violet nuit, carrelage en losanges de terre cuite, guirlandes de fanions et lanternes de papier par paires sur le grand mur nord (avec la suie au-dessus), arches rouge et or à étoile aux passages, colonnes rayées coiffées d'étincelles, brûlures en étoile de fusées éclatées entourées de confettis, douilles de pétards ; chaque salle a son détail (étoile d'or à l'entrée, cible de tir dans l'arène, pochoirs de danger à la réserve de pétards, rose des vents au carrefour, mèches brûlées qui convergent dans la salle des torches, rayures des boulets, épées croisées du Chevalier de fer, gamelle et os de Goyave) ; pas de fausses fissures dans le décor, pour ne pas les confondre avec les murs cassables du jeu ; Goyave est tenue par une chaîne entre deux poteaux (option `bind: 'chains'`).
- **8.14.8** : le Temple englouti (donjon 4) devient un temple aquatique peint, lisières droites (option `clean`) : grès bleu-vert, grand mur nord à frise de vagues sculptée, ligne de crue et algues au pied, reliefs de poissons par paires, dallage détrempé, colonnes cannelées couvertes d'anatifes, passages sculptés (colonnes et linteau à coquille), coulures d'humidité avec une flaque légère au pied ; chaque salle à bassin a deux décors qui suivent le niveau de l'eau (`paintRooms` avec `SAVE.waterLow`) : bassin plein, ou vidé avec son rebord, ses marches et de petites flaques irrégulières au fond ; cascade qui tombe du mur dans le chenal profond, médaillons de mosaïque, coquillages ; le captif est lié par des algues à deux stèles moussues (option `bind: 'kelp'`).
- **8.14.7** : les Mines des gnomes (donjon 3) deviennent une mine peinte, lisières droites (option `clean` ; dans la salle des poteaux, les bandes de mur au bord du gouffre vont désormais d'un mur à l'autre) : parois en pierres irrégulières, sol de terre battue et de gravier, gros rochers (et d'autres encastrés au pied des parois), étais de bois réguliers le long du mur nord, chaque passage encadré de deux montants et d'un chapeau comme une galerie, gouffres à bord rocheux, rails sur traverses et tréteaux en bois au-dessus du vide, éclats de cristal, lanternes de mineur par paires ; la niche de la caisse devient une alcôve étayée ; chaque salle a son détail (éboulis et pioche à l'entrée, minerai d'or dans l'arène, trappe du puits, rouleau de corde du grappin, toiles et cocons des araignées, veines de cristal, étais de soutènement de la grande salle, terre retournée par la Taupe de fer, paillasse du captif) ; le captif est attaché par des cordes à deux étais (option `bind: 'ropes'`).
- **8.14.6** : le Bois des murmures (donjon 2) devient une forêt magique peinte, lisières droites (option `clean`, sans bois qui dépassent) : canopée vue de dessus, troncs et racines en lisière, sol moussu sous la lune tamisée, sentiers battus entre les sorties, pierres levées à rune luisante de part et d'autre de chaque passage, lanternes suspendues par paires, souches à cernes, mousse et champignons luisants ; chaque salle a son identité (feux follets à l'entrée, cercle de fées dans l'arène, nénuphars, roseaux et îlot fleuri à l'étang, feuilles couchées par le vent et meule fendue au moulin, cercle de dalles runiques autour du frisbee, racines luisantes entre les lanternes, nid du Corbeau géant, réseau de racines dans les hauteurs, noisettes des écureuils au trésor, nid du Grand-Duc) ; l'extracteur de grilles accepte n'importe quel donjon ; les captifs ne sont plus en cage dans ces deux donjons : Amandine est enchaînée entre deux poteaux de pierre dans la Grotte, Claudine attachée par des lianes entre deux pieux dans le Bois (option `bind` de `Cage`, liens rompus une fois libérés).
- **8.14.5** : retouches de la Grotte des lucioles : murs droits (plus de blocs qui dépassent, option `clean` du générateur de donjons), grand mur nord, pierre calcaire plus claire et donjon moins sombre pour que la Grande Ombre et les spectres ressortent, seuils de porte marqués (piédroits, linteau, dalle à liseré de bronze), bannières toujours par paires symétriques ; stèles en tablettes gravées qu'on lit ; piédestaux des gros coffres en trois marches rondes empilées ; flammes et lueurs des feux désynchronisées ; dans tout le jeu, les objets tombés au sol ne disparaissent plus.
- **8.14.4** : toute la Grotte des lucioles est repeinte façon donjon médiéval, collisions inchangées : maçonnerie, dalles, contreforts, colonnes brisées, mousse luminescente dans les joints ; chaque salle a son identité (bannières de l'ordre des lucioles à l'entrée, piste de gravier cerclée dans l'arène, rosace dorée et chevrons vers les sorties au carrefour, sillons laissés par le bloc et runes gravées, estrade et tapis royal du lance-pierre, canal noir et chaînes du gouffre avec son pont de bois, bassins à margelle des deux yeux, cercle runique et socles de cristal de la grande clé, liseré doré et pièces renversées du trésor, cratère fendu par la Grande Ombre, paille et jours comptés dans la cellule d'Amandine) ; `paintRooms` accepte une variante selon la sauvegarde (le gouffre avec son pont abaissé).
- **8.14.3** : les Dunes deviennent une carte peinte, dessinée en pixel art natif avec pxl (`tools/peintre/pxl/`) sur la mise en page du peintre : prairie olive, plaques de sable ridées, chemin de terre avec ornières, étang à trois profondeurs avec berge, roseaux et nénuphars, arbres en grappes, palmiers, forêt en lisière ; collisions identiques à la version en tuiles, découpes « dessus » pour les arbres de lisière et les palmiers.
- **8.14.2** : la salle d'entrée de la Grotte des lucioles devient une salle peinte façon donjon médiéval (maçonnerie, dalles, contreforts, colonnes brisées, bannières à la luciole, mousse luminescente dans les joints), collisions inchangées ; les donjons acceptent désormais des salles peintes (`paintRooms`, image 960 × 544 dans `assets/maps`).
- **8.14.1** : un seul vert pour tout le jeu : l'herbe et la végétation des Collines, du Camping et de la Route des Bergers (cartes et découpes « dessus ») passent au vert olive de Bourg-Luciole et de la Côte ; le buisson aussi (outil `tools/peintre/recolor.py`, kit et pièces candidates recolorés de la même façon).
- **8.14.0** : la Côte devient une carte peinte (64×48 cases) : plage, mer, atelier de l'artificière, cabane du gardien, phare sur ses rochers et île de la Tour des artificiers ; l'île ne s'aborde plus qu'à la nage par sa grande plage sud (falaises tout autour ailleurs) ; nouvelle entrée par le chemin de l'ouest ; feux de la côte, pierre-relais, porte du phare et ennemis replacés ; découpes (toits, arbres, palmiers, phare, tour) derrière lesquelles le héros passe.
- **8.13.8** : les PNJ d'extérieur se promènent (pauses et petites marches, tournés dans le sens de la marche grâce à leurs 8 directions, ils s'arrêtent et se tournent vers le joueur quand il approche) ; le garde et le marchand de lampions restent à leur poste ; nouveau dialogue du vagabond une fois le cœur de la mare récupéré.
- **8.13.7** : tous les personnages (héros, PNJ, monstres, boss) passent à 150 % (au lieu de 143 %) ; plus aucun halo lumineux sur les monstres.
- **8.13.6** : le filet du pêcheur a sa propre icône ; concours de pêche refait (une manche de 30 s au bassin des Prés du Lac, Firmin et Gaëlle pêchent pour de vrai, le pêcheur arbitre) ; menu debug : accès direct à chaque donjon et au concours de pêche.
- **8.13.5** : Temple englouti : quand l'eau est basse, les bassins se vident vraiment (fond mouillé, margelle, petits escaliers au milieu de chaque côté pour descendre et remonter) au lieu de devenir des gouffres.
- **8.13.4** : Temple englouti : deux chemins de bord dans la salle du grand bassin, pour contourner le gouffre à pied quand l'eau est basse.
- **8.13.3** : la hache du bûcheron est plantée dans une souche de la Forêt (PixelLab, deux états) ; il ne la reprend qu'une fois rapportée.
- **8.13.2** : la console portable rejoint les souvenirs en pixel art : les 7 souvenirs du présent sont dessinés.
- **8.13.1** : faisceau du grand coffre plus bas et de toute sa largeur ; six souvenirs du présent en PixelLab ; le bûcheron n'a sa hache qu'une fois retrouvée.
- **8.13.0** : textes plus grands dans les dialogues et les menus ; le bestiaire montre la bête ; les faisceaux sortent bien de l'ouverture des coffres ; Amandine situe correctement son comptoir.
- **8.12.9** : petit coffre (fermé et ouvert) et pot en PixelLab ; la pièce qui sort d'un coffre est plus petite.
- **8.12.8** : collisions fines (demi-cases de 8 px) pour les petites pièces peintes ; le mobile-home utilise la grille 16 px faite dans l'atelier.
- **8.12.7** : le mobile-home réduit à 70 % (Sacha à la bonne taille), collisions, réveil, lumières et objets recalés.
- **8.12.6** : le bouton pause tactile disparaît quand le menu pause est ouvert (la croix suffit).
- **8.12.5** : l'intérieur du mobile-home de la famille est peint (cuisine, salon, coin repas) ; on s'y réveille au début du jeu ; le sac de Papa et le panier à linge s'examinent.
- **8.12.4** : bibliothèque : seules les deux tables passent devant le héros (plus de découpe sur le bureau du sage).
- **8.12.3** : nouvelles collisions de la bibliothèque, ramenées à la taille validée (20×12 cases), et trois découpes (bureau du sage, deux tables).
- **8.12.2** : le camping et la Route des Bergers réduits à 50 % (38×28 cases) : images, collisions, découpes et positions recalculées.
- **8.12.1** : la Route des Bergers devient une carte peinte (ruisseau et pont, étang et son îlot au quart de cœur) ; les coins de forêt hors d'atteinte sont fermés.
- **8.12.0** : le camping devient une carte peinte (75×56 cases) : quatre mobile-homes (celui de la famille s'ouvre), feu de camp entre les bûches, réverbères, étang ; la faille, la branche et la famille de l'épilogue sont replacées.
- **8.11.1** : Collines repeintes : vraie sortie à l'ouest vers le Sanctuaire, et 11 découpes (bergerie, moulin, arbres, lanternes) derrière lesquelles Sacha passe.
- **8.11.0** : les Collines deviennent une carte peinte (75×56 cases) : grotte des lucioles au nord, bergerie, moulin, étang ; tout ce qui s'y trouvait (moutons, ratons, relais, quêtes, luciole perdue, rocher secret) est replacé.
- **8.10.2** : plus aucune ombre sous le sanctuaire.
- **8.10.1** : le sanctuaire est posé au sol (plus de grande ombre portée sous l'arche).
- **8.10.0** : nouveau Sanctuaire des lucioles (arche PixelLab) : la Mère des lucioles flotte au milieu, les 6 alvéoles s'allument une à une à chaque don de Lumi.
- **8.9.9** : la cible du pont-levis en PixelLab.
- **8.9.8** : décor PixelLab : buisson, bloc, plaque de pression, lanterne à frisbee, pierre-relais, rocher fendu, mur fissuré, champignons lumineux, tombe, arbre mort, moulin, phare, sanctuaire des lucioles et réverbères du camping.
- **8.9.7** : les moutons des collines et Gérard revenu au bercail utilisent enfin leurs sprites PixelLab (ils étaient restés dessinés en code).
- **8.9.6** : le grand coffre ouvert en PixelLab.
- **8.9.5** : champignons, herbes et herbes d'aube prennent une des 8 vues PixelLab au hasard quand ils apparaissent.
- **8.9.4** : icônes PixelLab des soupes, du sirop, de l'élixir, du champignon et des herbes ; grand coffre violet et or dans les donjons.
- **8.9.3** : icônes PixelLab des ingrédients (poissons, minerai, cristal, plumes, écailles et les six matériaux rares) et du cœur de cristal.
- **8.9.2** : 21 icônes PixelLab de plus : écus, cœur, cailloux et pétards au sol, fragment, sceau, objets de quête (grimoire et ses feuilles, clé de la tour, huile, lettre, coupe) et toute la chaîne de troc.
- **8.9.1** : 21 icônes d'objets PixelLab (armes, outils, bourses, sacoches, bouteille, appât, clés).
- **8.9.0** : tous les menus passent en bois et parchemin (cadres en bois, coins en laiton, banderoles rouges, boutons biseautés) ; nouvel onglet Objets (équipé A/B, objets, bouteilles, fiche détaillée, jauges de la sacoche).
- **8.8.1** : le marchand de lampions et le Grand-Duc en PixelLab.
- **8.8.0** : 18 nouveaux sprites PixelLab : PNJ (aubergiste qui essuie un verre, Gaspard, Mahaut, berger, pêcheur, Margot, Bastien, Mme Pervenche), la famille (Amandine, Mamie Claudine, Papa, Goyave le chien), les animaux (moutons, Gérard, poules) et trois boss (Chevalier de fer, Chevalier Minuit, Roi Minuit).
- **8.7.9** : les lucioles ont chacune leur couleur (cyan, rose, menthe, lilas, orange, bleu ciel, corail, turquoise) ; Lumi reste jaune pâle. La Mère des lucioles du sanctuaire devient lilas.
- **8.7.8** : PNJ PixelLab du forgeron.
- **8.7.7** : les monstres au sol ont les pieds posés sur leur ombre (le bas de chaque image est calculé au chargement).
- **8.7.6** : l'ombre et le chevalier squelette reprennent leur pleine taille (100 %).
- **8.7.5** : la Taupe de fer a un sprite par état d'armure (3, 2, 1 puis aucune plaque) ; les plaques dessinées par-dessus disparaissent.
- **8.7.4** : menu debug « Combats » (écran titre ; s'ouvre avec ?debug ou 5 tapes sur le numéro de version) : accès direct aux 13 combats de boss et mini-boss, Sacha invincible, rien n'est sauvegardé.
- **8.7.3** : les monstres ordinaires passent à 75 % de leur taille (les mini-boss et les boss ne changent pas) ; la gargouille endormie s'affiche entière.
- **8.7.2** : animations PixelLab entières (elles étaient rognées à droite : chauves-souris, crieur, sage, monstres, taupe, sanglier) ; les corbeaux restent de face.
- **8.7.1** : les 12 monstres en PixelLab (raton laveur, chauve-souris, ombre, feu follet, écureuil, corbeau, gnome mineur, araignée de cristal, crabe, anguille, chevalier squelette, gargouille) : 8 directions, animations de marche ou de vol, pose d'attaque pour le gnome, l'anguille et le chevalier ; leurs versions géantes suivent. Le crieur agite sa cloche.
- **8.7.0** : un mini-boss garde la grande clé dans chaque donjon : Crabe géant (Temple, bassin de la cascade), Grande Gargouille (Tour), Garde noir (Château) ; le coffre n'apparaît qu'après leur défaite.
- **8.6.9** : Mines : un mini-boss, la Chauve-souris de cristal, garde la grande clé dans la salle des poteaux (avec deux chauves-souris ; le coffre apparaît quand elle tombe).
- **8.6.8** : les PNJ ne se tournent plus : ils regardent toujours vers le sud.
- **8.6.7** : la Taupe de fer file sous terre nettement moins vite que le héros (42 puis 54 au lieu de 70 puis 95).
- **8.6.6** : le sage est bien derrière son bureau (le bureau passe devant lui) ; les PNJ suivent le héros du regard de plus loin et plus longtemps ; au bord du vide, on s'arrête comme contre un muret : on ne tombe qu'en forçant vers le vide (plus de point d'exclamation).
- **8.6.5** : collisions de la bibliothèque retouchées par Damien.
- **8.6.4** : Gérard le bélier : il faut l'assommer (épée, caillou…) avant de le pousser ou le tirer, toujours bien en face (plus de poussée en biais) ; réveillé, il s'écarte quand on s'approche. Au bord d'un précipice, le héros vacille un instant avant de tomber : on peut se rattraper.
- **8.6.3** : PNJ PixelLab de Rosalie la lavandière et du crieur.
- **8.6.2** : la bibliothèque encore réduite : 640 × 357, grille 20 × 12, centrée à l'écran.
- **8.6.1** : la bibliothèque du sage tient dans un écran (image ramenée à 960 × 536, grille 30 × 17) ; les intérieurs peints se font en 960 × 540 (cases de 32 px).
- **8.6.0** : premiers boss et monstres PixelLab : la Grande Ombre (œil fermé / ouvert), la Taupe de fer (8 directions, vapeur de face, plaques d'armure toujours visibles), la Reine des remous (8 directions, se tortille sur la terre ferme) et le sanglier (8 directions, course). Planches dans `assets/boss/` et `assets/mobs/` ; chaque boss garde son ancien dessin si l'image manque.
- **8.5.10** : PNJ PixelLab du bûcheron, du gnome, de Firmin et Gaëlle (les rivaux du concours de pêche, qui ont maintenant leur propre tête), de l'artificière, du gardien du phare, de l'ermite, du vagabond, de Pauline et d'Odette.
- **8.5.9** : nouveaux PNJ PixelLab : le fossoyeur, le ramasseur de coquillages, Hugo le passeur, l'herboriste et un nouveau Jules.
- **8.5.8** : premiers PNJ PixelLab (48 × 48, 8 directions, à l'échelle des héros) : le garde, Arthur, Jules, Lila, le fantôme de 3 h, Mère Grenadine, le sage (avec son animation) et Pierrette ; ils se tournent vers le héros. Fichiers : `assets/npc/pl/<clé>.png`.
- **8.5.7** : la maison du sage devient un intérieur peint (image + collisions de l'Atelier) ; on parle au sage par-dessus son bureau, les rayonnages peints se lisent toujours ; moteur : tout intérieur avec `paint:` utilise sa carte peinte.
- **8.5.6** : nouvelle carte de Bourg-Luciole (graphismes et collisions refaits par Damien) ; le comptoir d'Amandine passe en haut, au-dessus de l'horloge ; découpes « dessus » recalculées (toits, tour, puits, réverbères, panneaux) ; portes, réverbères, Jules, Lila, l'allumeur de lampions et le thé de l'ermite replacés.
- **8.5.5** : un seul niveau de nuit partout et tout le temps (plus d'éclaircissement par fragment, par région ou par salle) ; seules les lumières locales varient ; plein jour dehors après la victoire finale.
- **8.5.4** : bandes noires et interface masquée pendant toutes les cinématiques, levier des Mines avec travelling jusqu'à la grille, feuilles du grimoire jamais dans l'eau.
- **8.5.3** : le sage parle de 7 feuilles perdues (sans dire où), plus de tremblement pendant les dialogues, épée tenue dans la main droite.
- **8.5.2** : plus d'image parasite au changement de salle, plus de saut de caméra au retour au village, Grand feu follet adouci.
- **8.5.1** : le pont de la Grotte se déclenche à nouveau (décalage dû à la nouvelle cellule), et c'est désormais une cible, comme au village.
- **8.5** : Amandine est la captive de la Grotte (le comptoir et la revente s'ouvrent dès le 1er donjon) et {enfant1} celle des Mines ; chaque salle de boss ne contient que le boss, avec une grille au nord : à sa défaite, il lâche son matériau, les portes s'ouvrent et la cellule du dessus révèle le captif et le cœur de cristal (le Château garde sa fin) ; Corbeau géant et ses écureuils dans la salle de la grande clé du Bois (coffre invisible au centre) ; l'épée reste tendue pendant la charge ; la cible du pont-levis est atteignable par-dessus le pont relevé ; Jules et Lila sur la place.
- **8.4.3** : écran de choix du héros sans pad virtuel (bouton Retour), travelling de la tour-horloge plus lent et sans aller-retour, faisceau des coffres qui s'efface vers le haut, feux follets désynchronisés, mini-boss de la Grotte avec 2 petits feux follets.
- **8.4.2** : sur les îlots au grappin (Prés du Lac, Dunes), un coffre contient le quart de cœur.
- **8.4.1 · cœurs** : seuls les boss donnent un cœur entier (5) ; tout le reste donne des quarts de cœur (16 : 4 coffres de donjon, 4 souvenirs, 8 cachés dans le monde), soit 12 cœurs au maximum. Amandine vend une bourse géante (999 écus), le colporteur une sacoche de voyageur.
- **8.0 · commerce, PNJ, interface** : achats confirmés partout (colporteur compris), on parle au sage par-dessus sa table, la tour-horloge se dévoile dans un travelling, les pièces tombées dans un mur restent attrapables, le sac n'affiche plus de prix, l'herboriste rachète les herbes, « Tu veux vendre autre chose ? » après chaque vente, les marchands refusent de payer une bourse pleine, Mamie appelle les enfants par leur prénom, ne fait que des soupes et offre une bouteille (une seule par partie), Amandine cherche des objets à échanger, les bibliothèques donnent astuces et secrets, Arthur (enfant du village) tient le bestiaire et ses récompenses, mini-boss au bestiaire, progression en % (sauvegardes et pause), le moulin passe dans la Forêt.
- **8.1 · donjons** : dalle qui ne tient que sous un poids, gros coffres sur piédestal à marches (visible avant que le coffre apparaisse), salles-arènes qui se referment (grande clé de la Grotte avec le Grand feu follet, frisbee et clé du Bois avec le Corbeau géant), salles de boss verrouillées pendant le combat, matériau magique du boss posé là où il tombe (avec explication), petites clés utilisées avec A, vent du Bois qui ne pousse plus hors de la salle, chute dans le vide des Mines (un demi-cœur, retour au bord), anguilles qui ressortent ailleurs, énigme de manivelle et de montée des eaux pour la grande clé du Temple, nouvelle Reine des remous (bonds écrasants avec ombre, assommée au grappin ou au frisbee, anguilles à mi-vie).
- **8.2 · la fin** : le Roi Minuit s'élève et éclate dans des rayons de lumière, la pierre du soleil rejoint la tour-horloge et les aiguilles filent jusqu'à midi, puis le soleil se lève sur chaque région l'une après l'autre avant le retour au camping ; après la fin, la famille n'est plus dans les maisons du village (Amandine rachète toujours au camping, Mamie y cuisine).
- **8.3 · un monde plus grand** : six chemins sans monstres entre les régions (Route des Bergers, Col des Sapins, Orée du bois, Prés du Lac, Dunes, Lande grise) avec fondu entre les palettes et habitants, le Sanctuaire des lucioles à l'ouest des Collines, 30 lucioles perdues (monde, chemins, donjons, grottes) qui donnent à Lumi six pouvoirs au sanctuaire (grande lueur, œil de luciole, souffle de vie, flair des sœurs, aimant doré, éclat d'aube), quatre grottes secrètes derrière des rochers fendus, îlots au grappin, quarts de cœur, cinq habitants de plus au village, petite carte du royaume agrandie.
- **8.4 · dix quêtes secondaires** (elles s'ouvrent au fil des fragments, un « ! » signale qui a besoin d'aide, onglet Quêtes dans la pause) : la soupe chaude (course contre la montre jusqu'au berger), le concert de Mahaut (4 cordes, fête au village, harpe qui ramène au village), le livre perdu du sage (7 pages au frisbee ou au grappin, l'histoire du Roi), le mouton fugueur Gérard (à pousser jusqu'à l'enclos, pelotes à revendre), le concours de pêche (3 manches, coupe qui double le prix des poissons), le phare éteint (huile de Mamie, 5 étages, passage sous-marin et trésor), le colporteur endetté (raton laveur géant déguisé, -30 % à vie), la lettre d'amour (Pierrette et l'ermite, bottes plus rapides, thé au village), le fantôme de 3 h (énigmes, clé de la tour-horloge, quart de cœur), le procès du raton laveur (témoins, preuves, accusation ; les ratons des Collines deviennent amicaux).

## Version 7.5 : RPG et commerce
- **Forge** : Bertrand améliore l'épée (coup chargé, onde), le lance-pierre (tir double, cailloux perçants), le frisbee (portée et trois cibles, frisbee de feu), le grappin (portée, coup) et le bouclier (parade large, renvoi), contre des écus et les matériaux rares laissés par les boss.
- **Bestiaire** : onglet de la pause, 20 créatures, fiches complètes à 10 victoires (boss : 1), récompenses chez le sage (écus, loupe qui montre la vie des ennemis, encyclopédie).
- **Marché vivant** : le stock des boutiques grandit avec les fragments, une promotion de 30 % change à chaque retour au village (fanion, ragots de Gaspard), un colporteur voyage de région en région.
- **Revente et troc** : Amandine rachète matériaux et ingrédients (un article recherché par semaine) ; une chaîne d'échanges en 7 étapes mène à la boussole des secrets.
- **Petits métiers** : cueillette (Collines, Forêt), minerai (Montagne, Terres), pêche avec la canne du pêcheur (mini-jeu de jauge, records), cuisine de Mamie (5 soupes aux effets temporaires).

## Version 7 : un monde plus grand et plus vivant
- **Sept régions** de 64 × 48 tuiles, une direction artistique chacune, un donjon au maximum par région : Bourg-Luciole (centre), les Collines (nord, Grotte des lucioles), la Forêt (ouest, Bois des murmures), la Montagne (nord-est, Mines des gnomes), le Lac (sud, Temple englouti), la Côte (est du lac, Tour des artificiers), les Terres de Minuit (ouest du lac, Château de Minuit). On arrive toujours du bon côté de l'écran suivant.
- **Des maisons où l'on entre** : les habitants vivent à l'intérieur, les boutiques posent leurs articles au sol avec leur prix (achat par Oui / Non). Tout le monde se moque gentiment des habits du héros, sauf le sage.
- **Donjons refaits** (10 à 12 salles chacun, plans tous différents, entrées par le bas) : petites clés propres à chaque donjon et **grande clé** pour la salle du boss.
- **Sept quêtes secondaires**, une par région ; chacune rapporte un objet de notre monde (Rubik's Cube, smartphone, console…). Les sept réunis débloquent une **fin bonus**.
- **Le prologue** commence dans un bungalow du camping, à côté des lits vides. Les lucioles-relais (voyage rapide) arrivent dès le premier donjon.
- **Cinématiques** : chaque fragment descend sur la tour-horloge du village (aiguilles, lanternes, lumière) ; les cinq sceaux ouvrent la grande porte du château sous les yeux du joueur.
- Menus : grille d'objets, onglet Souvenirs, carte du monde ; le stick et les boutons restent visibles. Corrections : invincibilité, grille qui enfermait le joueur, épée de fer à la forge ; Goyave ne suit plus le héros.

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
- `src/actors.js` : villageois, faille, Lumi, cage
- `src/interiors.js` : maisons, meubles, articles de boutique, construction des intérieurs ; `src/houses.js` : l'intérieur de chaque maison
- `src/overworld.js` : les sept régions, décors, entrées de donjon, tour-horloge
- `src/dungeon.js` : construction générique d'un donjon (salles, portes, petites et grande clés) ; `src/cave.js` : donjon 1
- `src/quests.js` : quêtes secondaires et souvenirs du monde réel
- `src/rpg.js` : matériaux, forge, bestiaire, marché, revente, troc, cueillette, minerai, pêche, cuisine
- `src/maps.js` : cartes peintes (collisions, toits et feuillages)
- `src/bois.js` : donjon 2 (frisbee, ennemis du bois, Grand-Duc, interrupteurs, cible du pont-levis)
- `src/tools.js` : grappin, pétards, nage, poteaux, murs fissurés, mèches, torches, vannes, horloges, wagonnets, relais, sceaux
- `src/mines.js`, `src/lac.js`, `src/temple.js`, `src/tower.js`, `src/castle.js` : les zones 3 à 6 (ennemis, boss, salles)
- `src/areas.js` : le camping et les aides communes
- `src/ui.js` : HUD, dialogues, menus, boutique, écrans
- `src/game.js` : états du jeu, transitions, scènes, rendu du monde
- `data/heroes.json`, `items.json`, `shops.json`, `dialogues.json` : héros, objets, catalogues, répliques et objectifs

## Assets
- `assets/npc/` : Mamie (Claudine), Amandine, Papa (4 directions × 9 images) et Goyave, repris d'Escape Night
- `assets/swim/` : nageurs vus de dessus (piscine d'Escape Night)
- `tools/collisions/` : **Atelier Collisions**, éditeur en ligne des collisions, portes et découpes « dessus » des cartes peintes (https://tidamz-source.github.io/escape-night2/tools/collisions/), export en pack .zip
- `assets/src/*.ase` + `tools/ase2sheet.py` : Sacha (Aseprite, 1:1, cases 32 × 32)
- `assets/cam.*`, `assets/rox.*` : placeholders repris d'Escape Night (`tools/en2sheet.py`, densité ×2), à remplacer par des .ase
- `assets/faces/` : portraits des dialogues (Escape Night)
- `assets/props/` : décors (Escape Night, densité ×2)

## Déploiement
À chaque mise à jour : changer `VERSION` dans `src/core.js` et `sw.js`, et les `?v=` dans `index.html` et `sw.js`.
