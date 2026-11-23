import os, json, sys
from grab import grab
from sources import SOURCES
import os
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'maps') + '/'
out = sys.argv[1]; os.makedirs(out, exist_ok=True); cat = []
for mp, items in SOURCES.items():
    for it in items:
        name, c, box = it[0], it[1], it[2]; sig = len(it) > 3
        try: grab(M + mp + '.png', box, os.path.join(out, f'{mp}__{name}.png'), pad=10)
        except Exception as e: print('échec', mp, name, e); continue
        cat.append({'file': f'{mp}__{name}.png', 'name': name, 'cat': c, 'src': mp, 'signature': sig})
json.dump(cat, open(os.path.join(out, 'manual.json'), 'w'), indent=0, ensure_ascii=False)
print(len(cat))
