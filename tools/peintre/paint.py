"""Peintre de cartes d'Escape Night 2 : transforme une zone en tuiles (grille + décor) en carte peinte
dans la direction artistique des cartes peintes (Côte, Collines, Bourg-Luciole).

Entrée  : un JSON { g: [lignes de la grille], props: [...], decor: [...], keep: [...] } (voir dump_zone.py)
Sortie  : <id>.png (2× la résolution monde), <id>_dessus.png + <id>_dessus.json (découpes au-dessus du héros),
          <id>_grid.txt (grille de collisions, identique à l'originale + troncs et rochers en '#')

Règles de DA (ne pas changer sans raison) :
- lumière neutre et uniforme, sans ombre portée forte : c'est le moteur qui pose la nuit ;
- 32 px par case dans l'image (2× le monde), contours sombres, passe pixel art finale sur la palette du jeu ;
- transitions organiques : lisière d'herbe sombre irrégulière, touffes, berges de terre, reflets clairs au bord de l'eau ;
- décor non bloquant ajouté (fleurs, touffes, cailloux, roseaux, nénuphars) mais jamais sur les cases de passage clés.
"""
import json, math, sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

KIT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kit', 'sprites')
TS = 16; S = 2; T = TS * S              # 32 px par case dans l'image

# palette de la DA (échantillonnée sur la Côte et les Collines)
GRASS = [(124, 126, 50), (144, 142, 40), (156, 154, 42), (166, 166, 48), (178, 176, 60)]
EDGE, EDGE2 = (98, 106, 34), (124, 132, 42)
SAND, SAND2, WETSAND = (237, 207, 136), (226, 194, 125), (211, 177, 112)
DIRT, DIRT2, DIRT_D = (204, 172, 108), (194, 162, 100), (164, 134, 82)
POND, POND_L, POND_D, RIPPLE = (105, 145, 138), (128, 162, 146), (86, 124, 128), (205, 228, 220)
BANK, BANK_D, BANK_L = (113, 94, 55), (88, 70, 40), (140, 116, 70)
FOREST = [(88, 75, 14), (108, 98, 17), (116, 105, 16), (123, 112, 14)]
FLOWERS = [(246, 242, 228), (240, 168, 190), (250, 214, 90), (150, 186, 232), (232, 120, 96)]

def fbm(h, w, scale, oct=4, seed=0):
    rng = np.random.RandomState(seed); out = np.zeros((h, w)); amp = 1; tot = 0
    for o in range(oct):
        s = max(1, int(scale / (2 ** o)))
        gh, gw = h // s + 3, w // s + 3
        z = ndi.zoom(rng.rand(gh, gw), s, order=3)[:h, :w]
        out += amp * z; tot += amp; amp *= 0.5
    out /= tot
    return (out - out.min()) / (out.max() - out.min() + 1e-9)

def lerpc(c0, c1, t):
    return np.array(c0)[None, None] * (1 - t[..., None]) + np.array(c1)[None, None] * t[..., None]

WARP = None
def soft_mask(tiles, sigma, noise, amp, thr=0.5, warp=0):
    m = ndi.zoom(tiles.astype(float), T, order=0)
    m = ndi.gaussian_filter(m, sigma)
    if warp and WARP is not None:   # déformation du contour : bords sinueux plutôt que droits
        yy, xx = np.mgrid[0:m.shape[0], 0:m.shape[1]].astype(float)
        m = ndi.map_coordinates(m, [yy + WARP[0] * warp, xx + WARP[1] * warp], order=1, mode='nearest')
    return (m + (noise - 0.5) * amp) > thr

def load(name, scale=1.0, flip=False, dark=0.0):
    im = Image.open(os.path.join(KIT, name + '.png')).convert('RGBA')
    if flip: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    if scale != 1.0: im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.NEAREST)
    if dark:
        a = np.array(im).astype(float); a[..., :3] *= (1 - dark); im = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    return im

def paint(zone, out_dir, seed=1, opts=None):
    o = dict(sand=0.30, sand_east=0.25, extra_flowers=60, extra_tufts=900, pebbles=40, forest_trees=True)
    o.update(opts or {})
    rng = np.random.RandomState(seed)
    g = [list(r) for r in zone['g']]; R, C = len(g), len(g[0]); H, W = R * T, C * T
    G = np.array(g)
    is_water = (G == '~'); is_forest = (G == '#')
    is_path = (G == '=')
    # les sorties prolongent le chemin quand elles sont dans son alignement
    for y in range(R):
        if '=' not in g[y]: continue
        xs = [x for x in range(C) if g[y][x] == '=']; a, b = min(xs), max(xs)
        for x in range(C):
            if (x < a and all(g[y][k] in '.,' or g[y][k].isdigit() for k in range(x, a))) or (x > b and all(g[y][k] in '.,' or g[y][k].isdigit() for k in range(b + 1, x + 1))):
                is_path[y, x] = True
    nz = fbm(H, W, 48, 4, seed); nz2 = fbm(H, W, 160, 3, seed + 1); nz3 = fbm(H, W, 14, 2, seed + 2)
    global WARP
    WARP = ((fbm(H, W, 90, 3, seed + 20) - 0.5) * 2, (fbm(H, W, 90, 3, seed + 21) - 0.5) * 2)
    forest = soft_mask(is_forest, 10, nz, 0.55, warp=10)
    water = soft_mask(is_water, 15, nz, 0.35, 0.5, warp=8)
    path = soft_mask(is_path, 9, fbm(H, W, 22, 3, seed + 7), 0.45, 0.5, warp=14) & ~water & ~forest
    yy, xx = np.mgrid[0:H, 0:W]
    # sable : plaques de dune, plus nombreuses vers l'est (la côte) et autour de l'eau
    near_w = ndi.gaussian_filter(water.astype(float), 26)
    sandf = nz2 + o['sand_east'] * (xx / W) + near_w * 0.9
    sandf = ndi.map_coordinates(sandf, [yy + WARP[0] * 18, xx + WARP[1] * 18], order=1, mode='nearest')
    sand = (sandf > np.quantile(sandf, 1 - o['sand'])) & ~water & ~forest & ~path
    sand = ndi.binary_opening(sand, iterations=3)

    img = np.zeros((H, W, 3))
    # --- herbe
    t = nz2 * 0.6 + nz * 0.4
    idx = np.clip((t * (len(GRASS) - 1)), 0, len(GRASS) - 1.001)
    i0 = idx.astype(int); fr = idx - i0
    GA = np.array(GRASS, float)
    img[:] = GA[i0] * (1 - fr[..., None]) + GA[np.minimum(i0 + 1, len(GRASS) - 1)] * fr[..., None]
    ao = ndi.gaussian_filter(forest.astype(float), 22)
    img *= (1 - 0.22 * np.clip(ao * 1.6, 0, 1))[..., None]
    worn = (fbm(H, W, 70, 3, seed + 5) > 0.68)
    img[worn] = img[worn] * 0.92 + np.array((150, 140, 60)) * 0.08
    # --- sable
    sc = lerpc(SAND, SAND2, np.clip((nz3 - 0.55) * 2.5, 0, 1) * 0.6)
    img[sand] = sc[sand]
    # rides de dune : fines lignes ondulées, plus claires et plus sombres
    rid = np.sin(yy * 0.32 + (nz2 - 0.5) * 40 + xx * 0.04)
    img[sand & (rid > 0.93) & (nz3 > 0.35)] = SAND2
    img[sand & (rid < -0.95) & (nz3 > 0.45)] = (244, 218, 152)
    # --- chemin de terre
    pc = lerpc(DIRT, DIRT2, np.clip(nz3 * 1.4 - 0.2, 0, 1))
    img[path] = pc[path]
    spk = path & (np.random.RandomState(seed + 3).rand(H, W) < 0.006); img[spk] = DIRT_D
    # lisières : herbe sombre côté herbe, autour du sable et du chemin
    grass_area = ~sand & ~path & ~water & ~forest
    for m in (sand, path):
        ring = ndi.binary_dilation(m, iterations=3) & grass_area
        jag = ring & (fbm(H, W, 6, 1, seed + 9) > 0.35)
        img[jag] = EDGE
        ring2 = ndi.binary_dilation(m, iterations=5) & grass_area & ~jag & (nz3 > 0.55)
        img[ring2] = EDGE2
    frng = np.random.RandomState(seed + 11)
    for m in (sand, path):
        dist = ndi.distance_transform_edt(m)
        gy, gx = np.gradient(ndi.gaussian_filter(dist, 2))
        by_, bx_ = np.nonzero(m & (dist <= 1.5))
        for i in range(0, len(by_), 1):
            if frng.rand() > 0.22: continue
            y0, x0 = by_[i], bx_[i]; ny, nx = gy[y0, x0], gx[y0, x0]; n = math.hypot(ny, nx) or 1
            L = frng.randint(2, 7)
            for k in range(L):
                yy_, xx_ = int(y0 + ny / n * k), int(x0 + nx / n * k)
                if 0 <= yy_ < H - 1 and 0 <= xx_ < W - 1:
                    img[yy_, xx_] = EDGE; img[yy_, xx_ + 1] = EDGE if k < L - 2 else img[yy_, xx_ + 1]
    # chemin : bord intérieur un peu plus sombre (terre tassée)
    pin = path & ~ndi.binary_erosion(path, iterations=4)
    img[pin] = img[pin] * 0.35 + np.array(DIRT_D) * 0.65
    pin2 = path & ~ndi.binary_erosion(path, iterations=8) & ~pin
    img[pin2] = img[pin2] * 0.7 + np.array(DIRT_D) * 0.3
    # --- l'eau et ses berges
    dist_in = ndi.distance_transform_edt(water)
    wc = lerpc(POND, POND_D, np.clip((dist_in - 26) / 30 + (nz - 0.5) * 0.8, 0, 1))
    img[water] = wc[water]
    rim = water & (dist_in <= 4); img[rim] = POND_L
    dist_out = ndi.distance_transform_edt(~water)
    bank = (~water) & (dist_out <= 6) & ~forest
    img[bank] = BANK
    # berge nord : on voit la paroi (vue 3/4), plus haute et plus sombre
    below_w = ndi.shift(water.astype(float), (-9, 0), order=0) > 0.5
    wall = (~water) & below_w & (dist_out <= 10) & ~forest
    img[wall] = BANK_D
    lip = bank & (dist_out <= 2) & ~wall; img[lip] = BANK_L
    # bordure herbe sombre autour de la berge
    gb = (~water) & (dist_out > 6) & (dist_out <= 8) & ~forest & ~sand & ~path & (nz3 > 0.3)
    img[gb] = EDGE
    # --- forêt : masse sombre (les arbres sont posés après)
    fc = lerpc(FOREST[0], FOREST[2], nz)
    img[forest] = fc[forest]

    canvas = Image.fromarray(img.clip(0, 255).astype(np.uint8)).convert('RGBA')
    FLOG = []
    if o.get('layout'):   # carte des sols à la résolution du monde, pour le rendu pxl
        lab = np.full((H, W), 'g', '<U1')
        lab[sand] = 's'; lab[path] = 'd'; lab[bank] = 'n'; lab[wall] = 'N'; lab[lip] = 'm'
        lab[water] = 'b'; lab[water & (dist_in <= 4)] = 'a'
        deep = water & ((dist_in - 26) / 30 + (nz - 0.5) * 0.8 > 0.5); lab[deep] = 'c'
        lab[forest] = 'F'
        edge_g = np.zeros((H, W), bool)
        for m in (sand, path): edge_g |= ndi.binary_dilation(m, iterations=3) & grass_area
        lab[edge_g & (lab == 'g')] = 'e'
        ao = ndi.gaussian_filter(forest.astype(float), 22)
        lab[(lab == 'g') & (ao > 0.12)] = 'G'
        LAYOUT = [''.join(r) for r in lab[::2, ::2]]
    draw = ImageDraw.Draw(canvas)

    def free_at(px, py, r=6):
        x0, x1, y0, y1 = max(0, px - r), min(W, px + r), max(0, py - r), min(H, py + r)
        return grass_area[y0:y1, x0:x1].all()
    keep = [(k['x'] * S, k['y'] * S, (k['x'] + k['w']) * S, (k['y'] + k['h']) * S) for k in zone.get('keep', [])]
    # espaces réservés aux entités du jeu (buissons, poteaux, coffre, PNJ...) : on n'y ajoute rien
    for e in zone.get('ents', []):
        keep.append(((e[1] - 14) * S, (e[2] - 18) * S, (e[1] + 14) * S, (e[2] + 6) * S))
    def kept(px, py): return any(a <= px <= c and b <= py <= d for a, b, c, d in keep)

    # --- petits détails non bloquants
    for _ in range(o['extra_tufts']):
        px, py = rng.randint(4, W - 4), rng.randint(4, H - 4)
        if not grass_area[py, px] or kept(px, py): continue
        c = EDGE if rng.rand() < 0.6 else (110, 118, 38)
        for dx, dy in ((0, 0), (-2, -2), (2, -2), (0, -3)):
            draw.rectangle((px + dx, py + dy, px + dx + 1, py + dy + 1), fill=c)
    for _ in range(o['pebbles']):
        px, py = rng.randint(4, W - 4), rng.randint(4, H - 4)
        if not (path[py, px] or sand[py, px]): continue
        draw.rectangle((px, py, px + 3, py + 1), fill=(150, 140, 120)); draw.rectangle((px, py + 2, px + 3, py + 3), fill=(120, 108, 84))
    def flower(px, py):
        col = FLOWERS[rng.randint(len(FLOWERS))]
        FLOG.append({'t': 'flower', 'x': int(px) // 2, 'y': int(py) // 2, 'c': FLOWERS.index(col)})
        for _ in range(rng.randint(3, 6)):
            dx, dy = rng.randint(-7, 8), rng.randint(-5, 6)
            draw.rectangle((px + dx, py + dy + 2, px + dx + 1, py + dy + 3), fill=(92, 110, 30))
            draw.rectangle((px + dx, py + dy, px + dx + 1, py + dy + 1), fill=col)
    for _ in range(o['extra_flowers']):
        px, py = rng.randint(10, W - 10), rng.randint(10, H - 10)
        if free_at(px, py, 9) and not kept(px, py): flower(px, py)

    # --- sprites (triés par y) ; on garde les découpes « dessus »
    sprites = []   # (base_y, im, x, y, overhead)
    LOG = []       # placements, pour l'export de la mise en page (pxl)
    TREES = ['tree_a', 'tree_b', 'tree_d', 'tree_e', 'tree_f', 'tree_h', 'tree_a', 'tree_e', 'tree_aut1']
    def tree_sprite(px, py, scale, dark=0.0, overhead=True, kinds=TREES):
        k = kinds[rng.randint(len(kinds))]
        im = load(k, scale, rng.rand() < 0.5, dark)
        sprites.append((py, im, px - im.width // 2, py - im.height + 4, overhead))
        LOG.append({'t': 'tree', 'x': px // 2, 'y': py // 2, 's': round(scale, 2), 'dark': dark, 'over': overhead, 'aut': k.startswith('tree_aut')})
        return im
    def shadow(px, py, w, h=14, a=60):
        sh = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).ellipse((px - w // 2, py - h // 2, px + w // 2, py + h // 2), fill=(30, 30, 10, a))
        return sh.filter(ImageFilter.GaussianBlur(3))
    shadows = Image.new('RGBA', canvas.size, (0, 0, 0, 0))

    # forêt : arbres serrés sur la masse, et une rangée sur la lisière (elle déborde un peu sur l'herbe)
    if o['forest_trees']:
        edge = forest & ~ndi.binary_erosion(forest, iterations=10)
        pts = []
        for y in range(0, H, 34):
            for x in range(0, W, 40):
                px, py = x + rng.randint(-10, 11) + (20 if (y // 34) % 2 else 0), y + rng.randint(-8, 9)
                if 0 <= px < W and 0 <= py < H and forest[py, px]: pts.append((px, py))
        for px, py in pts:
            near_edge = edge[py, px]
            im = tree_sprite(px, py + 26, rng.uniform(0.55, 0.72), dark=0.10 if near_edge else 0.22, overhead=near_edge)
    # props du jeu (arbres, rochers, fleurs) : mêmes positions que la version en tuiles
    solids = []
    for p in zone.get('props', []):
        px, py = int(p['x'] * S), int(p['y'] * S)
        k = p['k']
        if k.startswith('oak') or k.startswith('pine') or k == 'dead':
            im = tree_sprite(px, py, rng.uniform(0.78, 0.9))
            shadows.alpha_composite(shadow(px, py - 4, int(im.width * 0.55), 16))
        elif k == 'rock':
            im = load(['rock1', 'rock3', 'rock4'][rng.randint(3)], 1.0, rng.rand() < 0.5); LOG.append({'t': 'rock', 'x': px // 2, 'y': py // 2})
            ra = np.array(im).astype(float); gray = ra[..., :3].mean(2, keepdims=True); ra[..., :3] = ra[..., :3] * 0.15 + gray * 0.8 + np.array((14, 12, 2)) ; im = Image.fromarray(ra.clip(0, 255).astype(np.uint8))
            sprites.append((py, im, px - im.width // 2, py - im.height + 2, False))
            shadows.alpha_composite(shadow(px, py, im.width, 8, 50))
        elif k == 'flowers':
            flower(px, py)
        if p.get('solid'): solids.append((p['x'], p['y']))
    for d in zone.get('decor', []):
        px, py = int(d['x'] * S), int(d['y'] * S)
        if d['k'] == 'palm':
            im = load('palm2', 0.95, rng.rand() < 0.5); LOG.append({'t': 'palm', 'x': px // 2, 'y': py // 2})
            sprites.append((py, im, px - im.width // 2 + 6, py - im.height + 4, True))
            shadows.alpha_composite(shadow(px, py - 2, 34, 10))
            solids.append((d['x'], d['y']))
    # bord de l'eau : roseaux et nénuphars
    wy, wx = np.nonzero(water & (dist_in > 10) & (dist_in < 22))
    for _ in range(4):
        if not len(wy): break
        i = rng.randint(len(wy)); im = load(['lily1', 'lily2'][rng.randint(2)], 1.0, rng.rand() < 0.5); LOG.append({'t': 'lily', 'x': int(wx[i]) // 2, 'y': int(wy[i]) // 2})
        sprites.append((0, im, wx[i] - im.width // 2, wy[i] - im.height // 2, False))
    by, bx = np.nonzero(bank & ~wall & (dist_out >= 2) & (dist_out <= 5))
    placed = []
    for _ in range(40):
        if len(placed) >= 4 or not len(by): break
        i = rng.randint(len(by)); px, py = bx[i], by[i]
        if kept(px, py) or any(abs(px - a) < 120 and abs(py - b) < 90 for a, b in placed): continue
        placed.append((px, py)); im = load('cattail2', 1.0, rng.rand() < 0.5); LOG.append({'t': 'reed', 'x': int(px) // 2, 'y': int(py) // 2})
        sprites.append((py, im, px - im.width // 2, py - im.height + 6, False))

    canvas.alpha_composite(shadows)
    over = []
    for base, im, x, y, ov in sorted(sprites, key=lambda s: s[0]):
        canvas.alpha_composite(im, (int(x), int(y)))
        if ov: over.append((int(x), int(y), im, base))

    if o.get('layout'):
        json.dump({'w': W // 2, 'h': H // 2, 'ground': LAYOUT, 'place': LOG + FLOG}, open(o['layout'], 'w'), default=lambda v: v.item() if hasattr(v, 'item') else str(v))
    # --- passe pixel art : résolution monde, palette du jeu, remontée ×2
    rgb = canvas.convert('RGB')
    small = rgb.resize((W // S, H // S), Image.BOX)
    # palette : 112 couleurs de la carte + 16 couleurs des sprites fins (rochers, roseaux) qui sinon disparaissent
    base_pal = small.quantize(112, method=Image.MEDIANCUT).getpalette()[:112 * 3]
    kitm = Image.new('RGB', (200, 60), (0, 0, 0)); kx = 0
    for n in ('rock1', 'rock3', 'rock4', 'cattail2'):
        ki = load(n, 1.0); kitm.paste(ki.convert('RGB'), (kx, 0), ki); kx += ki.width + 2
    kp = kitm.crop((0, 0, kx, 60)).quantize(17, method=Image.MEDIANCUT).getpalette()[:17 * 3]
    kp = [c for i in range(17) for c in kp[i * 3:i * 3 + 3] if kp[i * 3:i * 3 + 3] != [0, 0, 0]][:48]
    pal = Image.new('P', (1, 1)); pal.putpalette(base_pal + kp + [0] * (768 - len(base_pal) - len(kp)))
    final = small.quantize(palette=pal, dither=Image.Dither.NONE).convert('RGB').resize((W, H), Image.NEAREST)
    os.makedirs(out_dir, exist_ok=True)
    zid = zone['id']
    final.save(os.path.join(out_dir, zid + '.png'))

    # --- découpes « dessus » prises dans l'image finale, au contour exact des sprites
    atlas, meta, sy = [], [], 0
    fa = final.convert('RGBA')
    for x, y, im, base in over:
        x0, y0 = max(0, x), max(0, y); x1, y1 = min(W, x + im.width), min(H, y + im.height)
        if x1 <= x0 or y1 <= y0: continue
        # on ne garde que la partie au-dessus de la base (le tronc reste au sol)
        cut_h = max(0, min(y1, base - 8) - y0)
        if cut_h < 8: continue
        x0, x1 = x0 & ~1, (x1 + 1) & ~1; y0 = y0 & ~1; cut_h &= ~1
        a = np.array(im.split()[3])[y0 - y:y0 - y + cut_h, x0 - x:x1 - x]
        if a.shape[1] < x1 - x0: a = np.pad(a, ((0, 0), (0, x1 - x0 - a.shape[1])))
        a = (ndi.zoom((ndi.zoom(a > 0, 0.5, order=0)).astype(np.uint8), 2, order=0) * 255).astype(np.uint8)[:cut_h, :x1 - x0]
        piece = fa.crop((x0, y0, x1, y0 + cut_h)); al = Image.fromarray(a).resize(piece.size, Image.NEAREST); piece.putalpha(al)
        atlas.append(piece); meta.append({'sy': sy, 'w': piece.width, 'h': piece.height, 'x': x0 // 2, 'y': y0 // 2, 'base': base // 2}); sy += piece.height
    AW = max([p.width for p in atlas] + [2])
    at = Image.new('RGBA', (AW, max(sy, 2)), (0, 0, 0, 0))
    for m, p in zip(meta, atlas): at.paste(p, (0, m['sy']))
    at.save(os.path.join(out_dir, zid + '_dessus.png'))
    json.dump(meta, open(os.path.join(out_dir, zid + '_dessus.json'), 'w'), separators=(',', ':'))

    # --- grille de collisions : l'originale, décor peint en '.', troncs/rochers/palmiers en '#'
    gg = [['.' if c in ',=' else c for c in r] for r in g]
    for x, y in solids:
        tx, ty = int(x // TS), int((y - 3) // TS)
        if gg[ty][tx] == '.': gg[ty][tx] = '#'
    open(os.path.join(out_dir, zid + '_grid.txt'), 'w').write('\n'.join(''.join(r) for r in gg))
    return final

if __name__ == '__main__':
    zone = json.load(open(sys.argv[1]))
    paint(zone, sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 1, {'layout': sys.argv[4]} if len(sys.argv) > 4 else None)
