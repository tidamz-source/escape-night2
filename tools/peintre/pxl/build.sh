#!/bin/bash
# Rend une zone en pixel art natif avec pxl (https://github.com/crsolver/claude-pxl).
# usage : bash build.sh dunes      (lit <zone>_layout.json + <zone>_art.js, écrit out/scenes/<zone>.png)
# La mise en page s'obtient avec : python3 ../paint.py zone.json /tmp/x 1 <zone>_layout.json
set -e
cd "$(dirname "$0")"; Z=${1:-dunes}
[ -d ~/pxl ] || git clone --depth 1 https://github.com/crsolver/claude-pxl.git ~/pxl
python3 -c "
import json; d=json.load(open('${Z}_layout.json'))
open('${Z}.px.js','w').write('const L = '+json.dumps(d,separators=(',',':'))+';\n'+open('${Z}_art.js').read())"
node ~/pxl/bin/pxl.js build ${Z}.px.js --no-preview
