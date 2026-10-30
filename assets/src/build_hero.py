# Construit assets/<héros>.png + .json à partir d'un export PixelLab rangé dans assets/src/<héros>/
#   (Idle/rotations/<direction>.png en 48 × 48, Idle/animations/<marche>/<direction>/frame_XXX.png en 64 × 64)
# Les directions absentes de la marche sont faites en miroir (ouest ← est, sud-ouest ← sud-est, nord-est ← nord-ouest…).
# Usage : python3 assets/src/build_hero.py sacha cam
import sys, os, glob, json
from PIL import Image, ImageOps
os.chdir(os.path.join(os.path.dirname(__file__), '..', '..'))
DIRS = {'south': 'down', 'north': 'up', 'west': 'left', 'east': 'right', 'south-east': 'down_right', 'south-west': 'down_left', 'north-east': 'up_right', 'north-west': 'up_left'}
MIRROR = {'west': 'east', 'east': 'west', 'south-west': 'south-east', 'south-east': 'south-west', 'north-east': 'north-west', 'north-west': 'north-east', 'south': None, 'north': None}
W = H = 48
def build(hero):
    src = f'assets/src/{hero}/Idle'
    rot = {}
    for d in DIRS:
        p = f'{src}/rotations/{d}.png'
        if os.path.exists(p): rot[d] = Image.open(p).convert('RGBA').crop((0, 0, 48, 46))
    for d in DIRS:
        if d not in rot and MIRROR[d] in rot: rot[d] = ImageOps.mirror(rot[MIRROR[d]])
    walkdir = next(iter(glob.glob(f'{src}/animations/*')), None)
    walks = {}
    for d in DIRS:
        fs = sorted(glob.glob(f'{walkdir}/{d}/*.png')) if walkdir else []
        if not fs: continue
        im = [Image.open(f).convert('RGBA') for f in fs]
        bb = [i.getbbox() for i in im]
        cx = round(sum((b[0] + b[2]) / 2 for b in bb) / len(bb)); bottom = max(b[3] for b in bb)
        walks[d] = [i.crop((cx - 24, bottom - 46, cx + 24, bottom + 2)) for i in im]  # pieds à 2 px du bas, comme la pose
    for d in DIRS:
        if d not in walks and MIRROR[d] in walks: walks[d] = [ImageOps.mirror(f) for f in walks[MIRROR[d]]]
    rows = []
    for d, name in DIRS.items():
        if d not in rot: continue
        pose = Image.new('RGBA', (W, H)); pose.paste(rot[d], (0, 0))
        bob = Image.new('RGBA', (W, H)); bob.paste(rot[d], (0, -1))
        rows.append((name, pose, walks.get(d, [pose, bob])))
    cols = max(1 + len(w) for _, _, w in rows)
    sheet = Image.new('RGBA', (W * cols, H * len(rows))); fr = {}; tags = []; n = 0
    for r, (name, pose, walk) in enumerate(rows):
        sheet.paste(pose, (0, r * H)); fr[f'idle_{name}0'] = {'frame': {'x': 0, 'y': r * H, 'w': W, 'h': H}, 'duration': 400}
        tags.append({'name': f'idle_{name}', 'from': n, 'to': n, 'direction': 'forward'}); n += 1
        for j, f in enumerate(walk):
            sheet.paste(f, ((j + 1) * W, r * H)); fr[f'walk_{name}{j}'] = {'frame': {'x': (j + 1) * W, 'y': r * H, 'w': W, 'h': H}, 'duration': 110 if len(walk) > 2 else 140}
        tags.append({'name': f'walk_{name}', 'from': n, 'to': n + len(walk) - 1, 'direction': 'forward'}); n += len(walk)
    sheet.save(f'assets/{hero}.png')
    json.dump({'frames': fr, 'meta': {'image': f'{hero}.png', 'size': {'w': sheet.width, 'h': sheet.height}, 'scale': '1.4', 'foot': 2, 'frameTags': tags}}, open(f'assets/{hero}.json', 'w'), indent=1)
    print(hero, 'poses', len(rot), 'marches', {DIRS[d]: len(v) for d, v in walks.items()})
for h in sys.argv[1:] or ['sacha']: build(h)
