import cv2, numpy as np, sys
from PIL import Image
def grab(src, box, out, iters=6, pad=10, strip_grass=False):
    """box en px de l'image source (x0,y0,x1,y1) : l'objet est dedans, le bord est du sol"""
    im = cv2.imread(src)
    x0, y0, x1, y1 = box
    X0, Y0, X1, Y1 = max(0, x0 - pad), max(0, y0 - pad), min(im.shape[1], x1 + pad), min(im.shape[0], y1 + pad)
    crop = im[Y0:Y1, X0:X1].copy()
    mask = np.zeros(crop.shape[:2], np.uint8)
    rect = (x0 - X0, y0 - Y0, x1 - x0, y1 - y0)
    bg, fg = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(crop, mask, rect, bg, fg, iters, cv2.GC_INIT_WITH_RECT)
    m = np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)
    # garder la plus grande composante
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    if n > 1:
        k = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); m = np.where(lab == k, 255, 0).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    if strip_grass:   # retire la touffe d'herbe restée au pied : pixels verdâtres dans le bas du sprite
        ys_, xs_ = np.nonzero(m); top, bot = ys_.min(), ys_.max(); lim = bot - int((bot - top) * 0.16)
        sub = crop[lim:].astype(int); b_, g_, r_ = sub[..., 0], sub[..., 1], sub[..., 2]
        m[lim:][~(((r_ - g_) > 18) | ((r_ + g_ + b_) < 170))] = 0
        n2, lab2, st2, _ = cv2.connectedComponentsWithStats(m)
        k2 = 1 + np.argmax(st2[1:, cv2.CC_STAT_AREA]); m = np.where(lab2 == k2, 255, 0).astype(np.uint8)
    rgba = cv2.cvtColor(crop, cv2.COLOR_BGR2RGBA); rgba[..., 3] = m
    ys, xs = np.nonzero(m); rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    Image.fromarray(rgba).save(out)
    return out
if __name__ == '__main__':
    src = sys.argv[1]; box = tuple(map(int, sys.argv[2:6])); grab(src, box, sys.argv[6])
