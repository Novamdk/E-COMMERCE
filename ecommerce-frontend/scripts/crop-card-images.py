"""
Makes the close-up product photos used on shop tiles, in the bag and at checkout.

For each product's main packshot (PACKSHOTS in src/lib/productImage.js, else
its first gallery image) it trims the plain white border, then centres the
product in a 4:5 portrait frame so it fills about 88% of the frame. Output is
public/img/<name>-card-<width>.avif plus an entry in src/data/images.json.

Images with no plain border (lifestyle shots, collages) are skipped and keep
their original framing. When the new lightbox photos arrive, drop them in,
re-run `npm run images`, then this script:

    python3 scripts/crop-card-images.py
"""
import glob
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / 'public' / 'img'
META = ROOT / 'src' / 'data' / 'images.json'
PRODUCTS = ROOT / 'src' / 'data' / 'products.json'
PRODUCT_IMAGE_JS = ROOT / 'src' / 'lib' / 'productImage.js'

RATIO = 4 / 5          # width / height of the tile frame
FILL = 0.88            # share of the limiting side the product takes up
WHITE_CUTOFF = 238     # pixels lighter than this count as backdrop
WIDTHS = (400, 800, 1200)


def packshots():
    src = PRODUCT_IMAGE_JS.read_text()
    block = re.search(r'const PACKSHOTS = \{(.*?)\};', src, re.S).group(1)
    return dict(re.findall(r"'([^']+)':\s*'([^']+)'", block))


def largest(name):
    files = glob.glob(str(IMG / f'{name}-[0-9]*.avif'))
    return max(files, key=lambda f: int(f.rsplit('-', 1)[1].split('.')[0]))


def on_white(im):
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
        return Image.alpha_composite(bg, im).convert('RGB')
    return im.convert('RGB')


def close_up(im):
    mask = im.convert('L').point(lambda v: 255 if v < WHITE_CUTOFF else 0)
    box = mask.getbbox()
    if not box:
        return None
    w, h = im.size
    # A product touching two opposite edges has no white border to trim.
    if (box[0] <= 2 and box[2] >= w - 2) or (box[1] <= 2 and box[3] >= h - 2):
        return None
    product = im.crop(box)
    pw, ph = product.size
    frame_w = max(pw / FILL, ph / FILL * RATIO)
    frame_h = frame_w / RATIO
    frame = Image.new('RGB', (round(frame_w), round(frame_h)), (255, 255, 255))
    frame.paste(product, (round((frame_w - pw) / 2), round((frame_h - ph) / 2)))
    return frame


def main():
    meta = json.loads(META.read_text())
    shots = packshots()
    made = []
    for product in json.loads(PRODUCTS.read_text()):
        name = shots.get(product['slug'], product['images'][0])
        frame = close_up(on_white(Image.open(largest(name))))
        if frame is None:
            print(f'skip {name}: no plain border')
            continue
        out = f'{name}-card'
        # Tiny sources are lifted to 400px so tiles never get a blurrier file
        # than the old square ones did.
        widths = [w for w in WIDTHS if w <= frame.width] or [WIDTHS[0]]
        for old in glob.glob(str(IMG / f'{out}-*.avif')):
            Path(old).unlink()
        for w in widths:
            h = round(w / RATIO)
            frame.resize((w, h), Image.LANCZOS).save(IMG / f'{out}-{w}.avif', quality=70)
        meta[out] = {
            'width': widths[-1],
            'height': round(widths[-1] / RATIO),
            'aspect': round(RATIO, 4),
            'widths': widths,
        }
        made.append(out)
    META.write_text(json.dumps(meta, indent=2) + '\n')
    print('made', made)


if __name__ == '__main__':
    main()
