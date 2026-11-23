"""Planche-contact numérotée des sprites d'un dossier."""
import sys, glob, os
from PIL import Image, ImageDraw
def sheet(files, out, cell=120, cols=10, start=1):
    rows = (len(files) + cols - 1) // cols
    s = Image.new('RGB', (cols * cell, rows * (cell + 14)), (255, 0, 255)); d = ImageDraw.Draw(s)
    for i, f in enumerate(files):
        im = Image.open(f).convert('RGBA'); k = min(1, (cell - 6) / max(im.size))
        if k < 1: im = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.NEAREST)
        elif max(im.size) < cell / 2.5: im = im.resize((im.width * 2, im.height * 2), Image.NEAREST)
        x, y = (i % cols) * cell, (i // cols) * (cell + 14)
        d.rectangle((x, y, x + cell - 1, y + 13), fill=(30, 30, 30)); d.text((x + 3, y + 1), str(start + i), fill=(255, 255, 255))
        s.paste(im, (x + (cell - im.width) // 2, y + 14 + (cell - im.height) // 2), im)
    s.save(out)
if __name__ == '__main__':
    files = sorted(glob.glob(sys.argv[1])); sheet(files, sys.argv[2])
    print(len(files))
