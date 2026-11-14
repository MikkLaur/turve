#!/usr/bin/env python3
"""Upscale one image 2x with Real-ESRGAN, tiling by hand, writing a lossless PNG.

usage: ~/.local/opt/realesrgan/venv/bin/python -I upscale_png.py <input.png> <output.png>

Adapted from reklaamikampaania/market-research/.claude/skills/upscale-photos/upscale.py (same hand
tiling, because realesrgan-ncnn-vulkan's own tiling scrambles tiles on this GPU); the only change is
that the result is a PNG, not a lossy WebP, so the grade and export steps start from lossless data.
Runs fully on this machine; nothing is uploaded.
"""
import os, shutil, subprocess, sys, tempfile
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
R = os.path.expanduser('~/.local/opt/realesrgan')
CORE, PAD, S = 384, 32, 4          # core tile, overlap padding (px, source), model scale
W = tempfile.mkdtemp(prefix='upscale-')
try:
    im = Image.open(src).convert('RGB')
    w, h = im.size
    os.makedirs(W + '/in'); os.makedirs(W + '/out')
    boxes = []
    for y in range(0, h, CORE):
        for x in range(0, w, CORE):
            cx1, cy1 = min(x + CORE, w), min(y + CORE, h)
            b = (max(x - PAD, 0), max(y - PAD, 0), min(cx1 + PAD, w), min(cy1 + PAD, h))
            im.crop(b).save(f'{W}/in/{len(boxes):04d}.png')
            boxes.append((x, y, cx1, cy1, b))
    subprocess.run([R + '/realesrgan-ncnn-vulkan', '-i', W + '/in', '-o', W + '/out',
                    '-n', 'realesrgan-x4plus', '-s', str(S), '-t', '512', '-m', R + '/models', '-f', 'png'],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    canvas = Image.new('RGB', (w * S, h * S))
    for n, (x, y, cx1, cy1, b) in enumerate(boxes):
        t = Image.open(f'{W}/out/{n:04d}.png')
        l, u = (x - b[0]) * S, (y - b[1]) * S
        canvas.paste(t.crop((l, u, l + (cx1 - x) * S, u + (cy1 - y) * S)), (x * S, y * S))
    canvas = canvas.resize((w * 2, h * 2), Image.LANCZOS)   # 4x -> 2x: sharper than a native 2x pass
    canvas.save(out, 'PNG')
    print(out, canvas.size)
finally:
    shutil.rmtree(W, ignore_errors=True)
