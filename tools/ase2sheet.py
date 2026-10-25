"""Assemble les .ase de Sacha en une spritesheet + JSON (format Aseprite) lue par le jeu.
Usage : python3 tools/ase2sheet.py   (depuis la racine du dépôt)
Chaque fichier = une animation (une ligne de la sheet). Les durées de frames viennent d'Aseprite."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from ase import read_ase
from PIL import Image

ANIMS = [  # (nom de l'animation dans le jeu, fichier source)
    ('idle_down', 'assets/src/sacha_iddle.ase'),
    ('walk_down', 'assets/src/sacha_walk_front.ase'),
    ('walk_up', 'assets/src/sacha_walk_back.ase'),
]
rows = [(name, read_ase(p)) for name, p in ANIMS]
fw, fh = rows[0][1]['w'], rows[0][1]['h']
cols = max(len(a['frames']) for _, a in rows)
sheet = Image.new('RGBA', (fw * cols, fh * len(rows)))
frames, tags, n = {}, [], 0
for r, (name, a) in enumerate(rows):
    start = n
    for i, (im, dur) in enumerate(a['frames']):
        sheet.paste(im, (i * fw, r * fh))
        frames[f'{name}{i}'] = {'frame': {'x': i * fw, 'y': r * fh, 'w': fw, 'h': fh}, 'duration': dur}
        n += 1
    tags.append({'name': name, 'from': start, 'to': n - 1, 'direction': 'forward'})
sheet.save('assets/sacha.png')
json.dump({'frames': frames, 'meta': {'image': 'sacha.png', 'size': {'w': sheet.width, 'h': sheet.height}, 'scale': '1', 'frameTags': tags}}, open('assets/sacha.json', 'w'), indent=1)
print('sacha.png', sheet.size, [t['name'] for t in tags])
