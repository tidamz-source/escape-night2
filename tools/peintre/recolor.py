"""Ramène les verts (herbe + végétation) d'une image vers le vert olive de référence de Bourg-Luciole.
Transfert de couleur (moyenne / écart-type en Lab) restreint aux pixels « végétation » (teinte jaune-vert à vert,
assez saturés), avec un masque doux : bois, toits, sable, chemins, eau et feuillages d'automne ne bougent pas.

usage : python3 recolor.py stats   -> calcule les stats de référence (Bourg-Luciole) et celles des cartes
        python3 recolor.py image.png sortie.png carte_source   (les stats de la carte source s'appliquent aussi à son atlas « dessus » et à ses sprites)
"""
import sys, os, json
import numpy as np, cv2
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
MAPS = os.path.join(HERE, '..', '..', 'assets', 'maps')
STATS = os.path.join(HERE, 'kit', 'verts.json')

def veg_weight(rgb):
    hsv = cv2.cvtColor(rgb.astype(np.uint8), cv2.COLOR_RGB2HSV).astype(float)   # H 0-180
    h, s, v = hsv[..., 0] * 2, hsv[..., 1] / 255, hsv[..., 2] / 255
    wh = np.clip((h - 44) / 8, 0, 1) * np.clip((165 - h) / 15, 0, 1)            # teinte jaune-vert (48°) à vert (150°)
    ws = np.clip((s - 0.30) / 0.15, 0, 1)                                       # assez saturé (exclut sable, pierre)
    wv = np.clip((v - 0.10) / 0.08, 0, 1)                                       # pas les contours noirs
    return wh * ws * wv

def lab(rgb): return cv2.cvtColor(rgb.astype(np.uint8), cv2.COLOR_RGB2LAB).astype(float)

def stats(path):
    a = np.array(Image.open(path).convert('RGB'))
    w = veg_weight(a); L = lab(a); m = w > 0.9
    mu = L[m].mean(0); sd = L[m].std(0)
    return {'mu': mu.tolist(), 'sd': sd.tolist(), 'part': float(m.mean())}

def apply(img, src_stats, ref):
    im = img.convert('RGBA'); a = np.array(im); rgb = a[..., :3]
    w = veg_weight(rgb)[..., None]; L = lab(rgb)
    mu_s, sd_s = np.array(src_stats['mu']), np.array(src_stats['sd'])
    mu_r, sd_r = np.array(ref['mu']), np.array(ref['sd'])
    k = np.clip(sd_r / np.maximum(sd_s, 1e-3), 0.5, 1.6)
    T = (L - mu_s) * k + mu_r
    out = L * (1 - w) + T * w
    rgb2 = cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB)
    a[..., :3] = rgb2
    return Image.fromarray(a)

if __name__ == '__main__':
    if sys.argv[1] == 'stats':
        st = {n: stats(os.path.join(MAPS, n + '.png')) for n in ('royaume', 'cote', 'collines', 'camping', 'route_nord')}
        json.dump(st, open(STATS, 'w'), indent=1); print(json.dumps(st, indent=1))
    else:
        st = json.load(open(STATS))
        apply(Image.open(sys.argv[1]), st[sys.argv[3]], st['royaume']).save(sys.argv[2])
