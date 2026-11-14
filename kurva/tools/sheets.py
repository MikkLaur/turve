#!/usr/bin/env python3
"""Contact sheets for the owner: source next to result (labelled with id and role), hero pair, and project rows
laid out on the page colour at 1440 and 390 px. Output: kurva/shots/contact-sheet-*.png. Local only."""
import os, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import pipeline as P

SHOTS = P.ROOT / 'shots'
SHOTS.mkdir(exist_ok=True)
cfg = P.load_settings()
IMG = P.ROOT / 'site' / 'img'


def run(*a):
    subprocess.run([str(x) for x in a], check=True)


def best(id, w):
    """the exported WebP closest to width w (WebP, because ImageMagick reads it everywhere)"""
    have = sorted(int(f.stem.rsplit('-', 1)[1]) for f in IMG.glob(f'{id}-*.webp'))
    pick = min(have, key=lambda x: abs(x - w))
    return IMG / f'{id}-{pick}.webp'


def pair_sheet(ids, out, tile, title):
    cells = []
    for id in ids:
        c = cfg[id]
        src = P.SRC / (cfg[c['alias']]['src'] if 'alias' in c else c['src'])
        label = f"{id}  [{c['role']}]"
        cells += ['-label', 'source', str(src), '-label', label, str(best(id, 800))]
    run('montage', '-pointsize', '16', *cells, '-geometry', '300x400+8+8', '-tile', tile,
        '-background', P.PAGE, '-fill', '#1e1a15', '-title', title, str(SHOTS / out))
    print('wrote', out)


def frame(id, w):
    out = P.WORK / f'sheet-{id}-{w}.png'
    run('magick', best(id, w * 2), '-filter', 'Lanczos', '-resize', f'{w}x{round(w * 4 / 3)}!', out)
    return out


def canvas(w, h, items, out):
    args = ['magick', '-size', f'{w}x{h}', f'xc:{P.PAGE}']
    for path, x, y in items:
        args += [str(path), '-geometry', f'+{x}+{y}', '-composite']
    run(*args, out)
    print('wrote', out.name)


after = [i for i, c in cfg.items() if c['role'] in ('A', 'K')]
mono = [i for i, c in cfg.items() if c['role'] in ('B', 'D', 'P') and 'alias' not in c]
pair_sheet(after, 'contact-sheet-after.png', '4x', 'Colour: after (A) and Kristo (K): source | result')
pair_sheet(mono, 'contact-sheet-monochrome.png', '4x', 'Warm monochrome: before (B), during (D), process (P): source | result')
pair_sheet(['hero-enne', 'hero-parast'], 'contact-sheet-hero.png', '2x', 'Hero pair: source | result')

projects = {
    'trepp': ['hero-enne', 'trepp-ajal', 'trepp-parast'],
    'vannituba': ['vannituba-ajal', 'vannituba-nis', 'vannituba-parast'],
    'kook': ['kook-enne', 'kook-ajal', 'kook-parast'],
    'korter': ['korter-enne', 'korter-ajal', 'korter-parast'],
    'rays': ['rays-ajal', 'rays-lett', 'rays-parast'],
}
# 1440: two small frames (310 px) and the large after frame (660 px), 32 px gaps, 60 px side margin
rows, y = [], 60
for name, ids in projects.items():
    x = 60
    for id, w in zip(ids, (310, 310, 660)):
        rows.append((frame(id, w), x, y))
        x += w + 40
    y += round(660 * 4 / 3) + 80
canvas(1440, y, rows, SHOTS / 'contact-sheet-page-1440.png')
# 390: one project per viewport, three frames stacked at 358 px (16 px gutters), viewports side by side
H = 3 * round(358 * 4 / 3) + 4 * 16
items = []
for n, ids in enumerate(projects.values()):
    for k, id in enumerate(ids):
        items.append((frame(id, 358), n * 410 + 16, 16 + k * (round(358 * 4 / 3) + 16)))
canvas(len(projects) * 410, H, items, SHOTS / 'contact-sheet-page-390.png')
