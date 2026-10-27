"""Convertit les sprites d'Escape Night (densité ×2) en planches au format Aseprite JSON pour Escape Night 2.
Usage : python3 tools/en2sheet.py <dossier des PNG extraits d'Escape Night> <id> [<id> ...]"""
import json, sys, os
from PIL import Image
src, ids = sys.argv[1], sys.argv[2:]
DIRS = ['down', 'up', 'left', 'right']
for cid in ids:
    frames = {d: [Image.open(os.path.join(src, f'{cid}_{d}{i}.png')).convert('RGBA') for i in range(9)] for d in DIRS}
    cw = max(im.width for fs in frames.values() for im in fs); ch = max(im.height for fs in frames.values() for im in fs)
    sheet = Image.new('RGBA', (cw * 9, ch * 4)); meta = {}; tags = []; n = 0
    for r, d in enumerate(DIRS):
        for i, im in enumerate(frames[d]):
            x, y = i * cw + (cw - im.width) // 2, r * ch + (ch - im.height)
            sheet.paste(im, (x, y))
            name = f'idle_{d}0' if i == 0 else f'walk_{d}{i - 1}'
            meta[name] = {'frame': {'x': i * cw, 'y': r * ch, 'w': cw, 'h': ch}, 'duration': 70}
        tags.append({'name': f'idle_{d}', 'from': n, 'to': n, 'direction': 'forward'})
        tags.append({'name': f'walk_{d}', 'from': n + 1, 'to': n + 8, 'direction': 'forward'}); n += 9
    sheet.save(f'assets/{cid}.png')
    json.dump({'frames': meta, 'meta': {'image': f'{cid}.png', 'size': {'w': sheet.width, 'h': sheet.height}, 'scale': '2', 'frameTags': tags,
               'note': "Placeholder repris d'Escape Night (densité ×2). À remplacer par les .ase."}}, open(f'assets/{cid}.json', 'w'), indent=1)
    print(cid, sheet.size, (cw, ch))
