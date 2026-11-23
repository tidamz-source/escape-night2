"""Repère les objets isolés posés sur un sol uni dans une carte peinte et les détoure (GrabCut).
usage: python3 detect.py carte.png prefixe dossier_sortie"""
import sys, os, json
import numpy as np, cv2
from scipy import ndimage as ndi
from grab import grab

def detect(src, prefix, out, min_side=16, max_side=320, thr=9.0):
    im = cv2.imread(src); H, W = im.shape[:2]
    lum = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(float)
    mu = ndi.uniform_filter(lum, 7); sd = np.sqrt(np.maximum(ndi.uniform_filter(lum * lum, 7) - mu * mu, 0))
    m = sd > thr
    m = ndi.binary_dilation(m, iterations=3); m = ndi.binary_fill_holes(m); m = ndi.binary_opening(m, iterations=2)
    lab, n = ndi.label(m)
    found = []
    for i, sl in enumerate(ndi.find_objects(lab)):
        if sl is None: continue
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        w, h = x1 - x0, y1 - y0
        if not (min_side <= w <= max_side and min_side <= h <= max_side): continue
        if x0 < 4 or y0 < 4 or x1 > W - 4 or y1 > H - 4: continue
        fill = (lab[sl] == i + 1).mean()
        if fill < 0.25: continue
        # le cadre élargi doit être surtout du sol (peu de détail) : objet isolé
        X0, Y0, X1, Y1 = max(0, x0 - 12), max(0, y0 - 12), min(W, x1 + 12), min(H, y1 + 12)
        ring = np.ones((Y1 - Y0, X1 - X0), bool); ring[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = False
        if (sd[Y0:Y1, X0:X1][ring] > thr).mean() > 0.18: continue
        name = f'{prefix}_{len(found):03d}'
        try:
            grab(src, (x0 - 2, y0 - 2, x1 + 2, y1 + 2), os.path.join(out, name + '.png'), pad=10)
        except Exception:
            continue
        found.append({'name': name, 'src': os.path.basename(src), 'box': [int(x0), int(y0), int(x1), int(y1)]})
    return found

if __name__ == '__main__':
    os.makedirs(sys.argv[3], exist_ok=True)
    f = detect(sys.argv[1], sys.argv[2], sys.argv[3])
    json.dump(f, open(os.path.join(sys.argv[3], sys.argv[2] + '.json'), 'w'), indent=0)
    print(sys.argv[2], len(f))
