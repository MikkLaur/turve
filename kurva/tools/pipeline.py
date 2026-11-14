#!/usr/bin/env python3
"""Kurva Nokitseb photo pipeline: one stage of the processing for one photo id.

usage: python3 -I pipeline.py <stage> <id> [<id> ...]
stages: cut  straighten  retouch  upscale  grade  export  measure

Everything is local. Per-photo settings live in tools/crops.txt (one line per id, key=value tokens).
Files go to kurva/work/<id>-<n>name.png; measurements to kurva/work/<id>.json.

Stages
  cut        load the source, rotate in the pixels (rot=), cut a collage frame (cut=) -> 1cut.png
  straighten find long near-vertical lines (Canny + probabilistic Hough, > 15 % of the height), fit a
             rotation and a vertical keystone so they become vertical, warp, crop to exactly 3:4
             -> 2str.png (whole warped canvas, for checking) and 3crop.png
  retouch    clone-stamp / inpaint of things that are not Kristo's work (clone=, inpaint=) -> 4clean.png
  grade      colour recipe for A/K, warm monochrome for B/D/P -> 6graded.png
  measure    re-detect lines on the straightened image and print/store the angles
"""
import json, math, os, subprocess, sys
from pathlib import Path
import numpy as np
import cv2

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
WORK = ROOT / 'work'
SRC = Path(os.environ.get('KURVA_SRC') or
           ROOT.parent / 'reklaamikampaania/conversations-with-customers/kurvanokitseb.ee/previous-kurva-work')
PAGE = '#e4ded3'
PAGE_RGB = (0xe4, 0xde, 0xd3)


# ---------------------------------------------------------------- settings
def load_settings():
    cfg = {}
    for raw in (HERE / 'crops.txt').read_text().splitlines():
        line = raw.split('#', 1)[0].strip()
        if not line:
            continue
        toks = line.split()
        d = {}
        for t in toks[1:]:
            k, _, v = t.partition('=')
            d[k] = v
        cfg[toks[0]] = d
    return cfg


def ints(s):
    return [int(float(x)) for x in s.split(',')]


def floats(s):
    return [float(x) for x in s.split(',')]


def imread(p):
    im = cv2.imread(str(p), cv2.IMREAD_COLOR)
    if im is None:
        sys.exit(f'cannot read {p}')
    return im


def imwrite(p, im):
    cv2.imwrite(str(p), im)  # PNG, no metadata


# ---------------------------------------------------------------- stage: cut
def stage_cut(id, c):
    im = imread(SRC / c['src'])
    rot = int(c.get('rot', 0))
    if rot == 90:
        im = cv2.rotate(im, cv2.ROTATE_90_CLOCKWISE)
    elif rot == 270:
        im = cv2.rotate(im, cv2.ROTATE_90_COUNTERCLOCKWISE)
    elif rot == 180:
        im = cv2.rotate(im, cv2.ROTATE_180)
    if 'cut' in c:
        x, y, w, h = ints(c['cut'])
        im = im[y:y + h, x:x + w]
    imwrite(WORK / f'{id}-1cut.png', im)
    print(f'{id}: cut -> {im.shape[1]}x{im.shape[0]}')


# ---------------------------------------------------------------- lines
def detect_segments(gray, min_len):
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    hi, _ = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    hi = max(40, min(200, hi))
    edges = cv2.Canny(blur, 0.5 * hi, hi)
    segs = cv2.HoughLinesP(edges, 1, math.pi / 720, threshold=70, minLineLength=int(min_len), maxLineGap=14)
    if segs is None:
        return np.zeros((0, 4), np.float64)
    return segs.reshape(-1, 4).astype(np.float64)


def seg_angles(segs):
    """Angle in degrees of each segment from vertical (positive: leaning right going down) and length."""
    dx = segs[:, 2] - segs[:, 0]
    dy = segs[:, 3] - segs[:, 1]
    flip = dy < 0
    dx = np.where(flip, -dx, dx)
    dy = np.where(flip, -dy, dy)
    ang_v = np.degrees(np.arctan2(dx, dy))                 # 0 = vertical
    ang_h = np.degrees(np.arctan2(dy, np.abs(dx)))          # 0 = horizontal (positive: falls to the right)
    ang_h = np.where(dx < 0, -ang_h, ang_h)
    return ang_v, ang_h, np.hypot(dx, dy)


def verticals(segs, tol=12):
    ang_v, _, ln = seg_angles(segs)
    k = np.abs(ang_v) < tol
    return segs[k]


def horizontals(segs, tol=22):
    _, ang_h, ln = seg_angles(segs)
    k = np.abs(ang_h) < tol
    return segs[k]


def build_M(w, h, theta_deg, v, hh):
    """Pixel homography: rotate by theta about the centre, then a keystone (v: vertical, hh: horizontal).
    v and hh are in units of 1/(image height)."""
    f = float(h)
    cx, cy = w / 2.0, h / 2.0
    t = math.radians(theta_deg)
    R = np.array([[math.cos(t), -math.sin(t), 0], [math.sin(t), math.cos(t), 0], [0, 0, 1]])
    P = np.array([[1, 0, 0], [0, 1, 0], [hh, v, 1.0]])
    S = np.diag([f, f, 1.0])
    Tc = np.array([[1, 0, cx], [0, 1, cy], [0, 0, 1.0]])
    Tm = np.array([[1, 0, -cx], [0, 1, -cy], [0, 0, 1.0]])
    return Tc @ S @ P @ R @ np.linalg.inv(S) @ Tm


def map_pts(M, pts):
    p = np.hstack([pts, np.ones((len(pts), 1))]) @ M.T
    return p[:, :2] / p[:, 2:3]


def map_segs(M, segs):
    a = map_pts(M, segs[:, 0:2])
    b = map_pts(M, segs[:, 2:4])
    return np.hstack([a, b])


def loss(M, vs, hs, trunc=3.0):
    tot = 0.0
    if len(vs):
        av, _, ln = seg_angles(map_segs(M, vs))
        tot += float(np.sum(ln * np.minimum(av ** 2, trunc ** 2)))
    if hs is not None and len(hs):
        _, ah, ln = seg_angles(map_segs(M, hs))
        tot += float(np.sum(ln * np.minimum(ah ** 2, trunc ** 2)))
    return tot


def fit(w, h, vs, hs, vmax, hmax, fit_h, tmax=4.0):
    """Coarse-to-fine: the error of each line is truncated at 'trunc' degrees; start wide (so the 13-20 degree
    fans of a steep wide-angle shot pull the fit in) and tighten to 3 degrees (so stray lines stop counting)."""
    x = np.array([0.0, 0.0, 0.0])   # theta, v, hh
    lim = np.array([tmax, vmax, hmax if fit_h else 0.0])
    best = None
    for trunc in (25.0, 12.0, 6.0, 3.0):
        step = np.array([2.0, 0.05, 0.05])
        best = loss(build_M(w, h, *x), vs, hs if fit_h else None, trunc)
        while step[0] > 1e-3:
            improved = False
            for i in range(3):
                if lim[i] == 0:
                    continue
                for s in (+1, -1):
                    y = x.copy()
                    y[i] = np.clip(y[i] + s * step[i], -lim[i], lim[i])
                    l = loss(build_M(w, h, *y), vs, hs if fit_h else None, trunc)
                    if l < best - 1e-9:
                        best, x, improved = l, y, True
            if not improved:
                step *= 0.5
    return x, best


def line_stats(gray, want_h=False, tol=12):
    h, w = gray.shape
    segs = detect_segments(gray, 0.15 * h)
    vs = verticals(segs, tol)
    out = {'n_vertical': int(len(vs))}
    if len(vs):
        av, _, ln = seg_angles(vs)
        out['median_vertical_deg'] = round(float(np.median(av)), 3)
        out['p25_p75_deg'] = [round(float(np.percentile(av, 25)), 2), round(float(np.percentile(av, 75)), 2)]
    if want_h:
        hs = horizontals(detect_segments(gray, 0.15 * w))
        out['n_horizontal'] = int(len(hs))
        if len(hs):
            _, ah, _ = seg_angles(hs)
            out['median_horizontal_deg'] = round(float(np.median(ah)), 3)
    return out


# ---------------------------------------------------------------- 3:4 crop in the valid area
def largest_34(valid, fx, fy, min_w=0):
    H, W = valid.shape
    integ = cv2.integral(valid.astype(np.uint8))
    best = None
    step = 6
    for w in range(W - (W % 3), max(min_w, 300), -6):
        hh = w * 4 // 3
        if hh > H:
            continue
        xs = np.arange(0, W - w + 1, step)
        ys = np.arange(0, H - hh + 1, step)
        if len(xs) == 0 or len(ys) == 0:
            continue
        X, Y = np.meshgrid(xs, ys)
        s = integ[Y + hh, X + w] - integ[Y, X + w] - integ[Y + hh, X] + integ[Y, X]
        ok = s == w * hh
        if ok.any():
            cxs, cys = X + w / 2.0, Y + hh / 2.0
            d = (cxs - fx * W) ** 2 + (cys - fy * H) ** 2
            d = np.where(ok, d, np.inf)
            j = np.unravel_index(np.argmin(d), d.shape)
            return int(X[j]), int(Y[j]), w, hh
    return None


# ---------------------------------------------------------------- stage: straighten
def stage_straighten(id, c):
    im = imread(WORK / f'{id}-1cut.png')
    h, w = im.shape[:2]
    gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    vtol = float(c.get('vtol', 12))
    rec = {'before': line_stats(gray, 'horiz' in c, vtol)}
    mode = c.get('straighten', 'auto')
    fit_h = 'horiz' in c
    vmax = float(c.get('vmax', 0.08))
    hmax = float(c.get('hmax', 0.10))
    if mode == 'none':
        theta, v, hh = 0.0, 0.0, 0.0
    elif mode.startswith('manual:'):
        theta, v, hh = floats(mode[7:])
    else:
        segs = detect_segments(gray, 0.15 * h)
        vs = verticals(segs, vtol)
        hs = horizontals(detect_segments(gray, 0.15 * w)) if fit_h else None
        # optional: ignore a region (x0,y0,x1,y1 fractions) where lines are not meant to be vertical
        if 'ignore' in c and len(vs):
            x0, y0, x1, y1 = floats(c['ignore'])
            mx = (vs[:, 0] + vs[:, 2]) / 2 / w
            my = (vs[:, 1] + vs[:, 3]) / 2 / h
            vs = vs[~((mx >= x0) & (mx <= x1) & (my >= y0) & (my <= y1))]
        (theta, v, hh), _ = fit(w, h, vs, hs, vmax, hmax, fit_h, float(c.get('tmax', 4.0)))
        rec['lines_used'] = int(len(vs))
        if abs(v) >= vmax - 1e-6:
            rec['keystone_hit_limit'] = True
    rec['theta_deg'], rec['v'], rec['h'] = round(float(theta), 3), round(float(v), 4), round(float(hh), 4)
    M = build_M(w, h, theta, v, hh)
    warped = cv2.warpPerspective(im, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT,
                                 borderValue=(128, 128, 128))
    mask = cv2.warpPerspective(np.full((h, w), 255, np.uint8), M, (w, h), flags=cv2.INTER_NEAREST)
    valid = cv2.erode((mask == 255).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    imwrite(WORK / f'{id}-2str.png', warped)
    if 'box' in c:
        x, y, bw = ints(c['box'])
        bh = bw * 4 // 3
    else:
        fx, fy = floats(c.get('focus', '0.5,0.5'))
        r = largest_34(valid, fx, fy)
        if r is None:
            sys.exit(f'{id}: no 3:4 box fits the warped image')
        x, y, bw, bh = r
        shrink = float(c.get('fit', 1.0))     # fit<1: take a tighter crop than the biggest box, same centre
        if shrink < 1.0:
            nw = int(bw * shrink) // 3 * 3
            nh = nw * 4 // 3
            x += (bw - nw) // 2
            y += (bh - nh) // 2
            bw, bh = nw, nh
    if bh > h or x + bw > w or y + bh > h:
        sys.exit(f'{id}: crop box {x},{y},{bw},{bh} outside the {w}x{h} canvas')
    crop = warped[y:y + bh, x:x + bw]
    imwrite(WORK / f'{id}-3crop.png', crop)
    rec['crop_box'] = [x, y, bw, bh]
    rec['cut_size'] = [w, h]
    rec['after'] = line_stats(cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY), 'horiz' in c, vtol)
    (WORK / f'{id}.json').write_text(json.dumps(rec, indent=1))
    print(f'{id}: theta {theta:.2f} v {v:.3f} h {hh:.3f}  crop {bw}x{bh} at {x},{y}  '
          f'before {rec["before"].get("median_vertical_deg")} after {rec["after"].get("median_vertical_deg")}')


# ---------------------------------------------------------------- stage: retouch
def feather_mask(shape, x, y, w, h, f):
    m = np.zeros(shape[:2], np.float32)
    m[y:y + h, x:x + w] = 1.0
    if f > 0:
        k = int(f) * 2 + 1
        m = cv2.GaussianBlur(m, (k, k), f / 2.0)
        m[y + f:y + h - f, x + f:x + w - f] = 1.0
    return m[..., None]


def stage_retouch(id, c):
    im = imread(WORK / f'{id}-3crop.png')
    out = im.astype(np.float32)
    n = 0
    for op in filter(None, c.get('clone', '').split(';')):
        dst, src = op.split('<')
        dx, dy, w, h = ints(dst)
        sx, sy = ints(src)
        f = 6
        m = feather_mask(im.shape, dx, dy, w, h, f)
        shifted = np.zeros_like(out)
        shifted[dy:dy + h, dx:dx + w] = out[sy:sy + h, sx:sx + w]
        # match brightness of the patch to its surroundings (mean in a ring), so the seam is quiet
        ring = cv2.dilate((m[..., 0] > 0.5).astype(np.uint8), np.ones((15, 15), np.uint8)) - (m[..., 0] > 0.5)
        if ring.sum() > 0:
            tgt = out[ring > 0].mean(axis=0)
            cur = shifted[(m[..., 0] > 0.5)].mean(axis=0)
            shifted = shifted + (tgt - cur)
        out = out * (1 - m) + shifted * m
        n += 1
    ops = [o for o in c.get('inpaint', '').split(';') if o]
    if ops:
        mask = np.zeros(im.shape[:2], np.uint8)
        for op in ops:
            if op.startswith('e:'):           # e:cx,cy,rx,ry,angle  (ellipse, angle clockwise in image coords)
                cx, cy, rx, ry, ang = floats(op[2:])
                cv2.ellipse(mask, (int(cx), int(cy)), (int(rx), int(ry)), ang, 0, 360, 255, -1)
            else:                              # x,y,w,h
                x, y, w, h = ints(op)
                mask[y:y + h, x:x + w] = 255
            n += 1
        res = cv2.inpaint(np.clip(out, 0, 255).astype(np.uint8), mask, 7, cv2.INPAINT_TELEA)
        out = res.astype(np.float32)
    imwrite(WORK / f'{id}-4clean.png', np.clip(out, 0, 255).astype(np.uint8))
    print(f'{id}: retouch ops {n}')


# ---------------------------------------------------------------- grade
def srgb2lin(a):
    return np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)


def lin2srgb(a):
    a = np.clip(a, 0, 1)
    return np.where(a <= 0.0031308, a * 12.92, 1.055 * a ** (1 / 2.4) - 0.055)


def grade_color(rgb, c):
    """'A sunny summer morning': warm clean white balance, lifted shadows with deep blacks held, a little
    local contrast and vibrance on mid-chroma colour only (so white marble stays white)."""
    exp = float(c.get('exp', 0.0))
    lift = float(c.get('lift', 0.25))
    lc = float(c.get('lc', 0.18))
    vib = float(c.get('vib', 0.2))
    warm = float(c.get('warm', 0.025))
    lin = srgb2lin(rgb)
    lum = lin @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    gains = np.ones(3, np.float32)
    if c.get('wb', 'auto') == 'auto':
        mx = lin.max(axis=2)
        mn = lin.min(axis=2)
        sat = (mx - mn) / np.maximum(mx, 1e-4)
        sel = (lum > 0.30) & (lum < 0.92) & (sat < 0.18)
        if sel.mean() > 0.02:
            m = lin[sel].mean(axis=0)
            g = m.mean() / m
            gains = np.clip(g, 0.9, 1.1).astype(np.float32)
    # the warm 'morning' tint fades out in the shadows, so black floors and matte black stay neutral
    wl = np.clip((lum - 0.03) / 0.20, 0, 1)[..., None]
    warm_g = 1.0 + (np.array([1 + warm, 1.0, 1 - warm], np.float32) - 1.0) * wl
    lin = lin * gains * warm_g * (2.0 ** exp)
    rgb = lin2srgb(lin).astype(np.float32)
    # Lab work
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
    L = lab[..., 0] / 100.0
    # shadow lift, zero at pure black so matte black stays deep, strongest in the dark mids
    L = L + lift * 0.35 * np.sqrt(np.clip(L, 0, 1)) * (1 - L) ** 2.5
    # local contrast: CLAHE on L, blended
    if lc > 0:
        L8 = np.clip(L * 255, 0, 255).astype(np.uint8)
        cl = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(L8).astype(np.float32) / 255.0
        dark = np.clip((L - 0.15) / 0.30, 0, 1)         # no local contrast in the blacks: noise, and matte black stays deep
        L = L * (1 - lc * dark) + cl * (lc * dark)
    lab[..., 0] = np.clip(L, 0, 1) * 100.0
    # vibrance: boost only colour that already has some chroma, never near-neutral whites
    a, b = lab[..., 1], lab[..., 2]
    ch = np.hypot(a, b)
    wgt = np.clip((ch - 5.0) / 15.0, 0, 1) * np.clip(1.0 - ch / 70.0, 0, 1)
    k = 1.0 + vib * wgt * np.clip((L - 0.20) / 0.25, 0, 1)
    lab[..., 1], lab[..., 2] = a * k, b * k
    out = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
    return np.clip(out, 0, 1)


def stage_grade(id, c):
    src = WORK / f'{id}-5up.png'
    if not src.exists():
        src = WORK / f'{id}-4clean.png'
    im = imread(src)
    role = c['role']
    if role in ('A', 'K'):
        rgb = cv2.cvtColor(im, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        out = grade_color(rgb, c)
        imwrite(WORK / f'{id}-6graded.png', cv2.cvtColor((out * 255 + 0.5).astype(np.uint8), cv2.COLOR_RGB2BGR))
    else:
        tmp = WORK / f'{id}-bw.png'
        cs = c.get('stretch', '0.3%x0.3%')
        subprocess.run(['magick', str(src), '-contrast-stretch', cs, '-colorspace', 'LinearGray',
                        '-colorspace', 'sRGB', '-sigmoidal-contrast', c.get('s', '3x50%'), str(tmp)], check=True)
        subprocess.run(['magick', str(tmp), '(', '+clone', '-fill', PAGE, '-colorize', '100', ')',
                        '-compose', 'multiply', '-composite', '-strip', str(WORK / f'{id}-6graded.png')], check=True)
    print(f'{id}: graded ({role})')


def stage_upscale(id, c):
    """Real-ESRGAN 2x for up=2 (hand-tiled, see upscale_png.py); a stale result is removed otherwise."""
    out = WORK / f'{id}-5up.png'
    if c.get('up') != '2':
        out.unlink(missing_ok=True)
        print(f'{id}: no upscale')
        return
    py = os.path.expanduser('~/.local/opt/realesrgan/venv/bin/python')
    subprocess.run([py, '-I', str(HERE / 'upscale_png.py'), str(WORK / f'{id}-4clean.png'), str(out)], check=True)


WIDTHS = (1600, 1200, 800, 480)
IMG = ROOT / 'site' / 'img'


def stage_export(id, c):
    """AVIF + WebP at 1600/1200/800/480, never wider than the processed image, exactly 3:4, metadata stripped."""
    IMG.mkdir(parents=True, exist_ok=True)
    if 'alias' in c:
        for f in IMG.glob(f"{c['alias']}-*"):
            (IMG / f.name.replace(c['alias'], id, 1)).write_bytes(f.read_bytes())
        print(f'{id}: copied from {c["alias"]}')
        return
    src = WORK / f'{id}-6graded.png'
    w0 = cv2.imread(str(src)).shape[1]
    done = []
    for W in WIDTHS:
        if W > w0:
            continue
        H = round(W * 4 / 3)
        png = WORK / f'{id}-{W}.png'
        subprocess.run(['magick', str(src), '-filter', 'Lanczos', '-resize', f'{W}x{H}!', '-strip', str(png)], check=True)
        subprocess.run(['avifenc', '-q', '60', '-s', '4', '-y', '420', str(png), str(IMG / f'{id}-{W}.avif')],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(['magick', str(png), '-strip', '-quality', '80', '-define', 'webp:method=6',
                        str(IMG / f'{id}-{W}.webp')], check=True)
        done.append(W)
    print(f'{id}: exported {done} (processed width {w0})')


def stage_measure(id, c):
    im = imread(WORK / f'{id}-3crop.png')
    print(id, json.dumps(line_stats(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY), 'horiz' in c, float(c.get('vtol', 12)))))


def stage_export_aliases(id, c):
    if 'alias' in c:
        stage_export(id, c)


STAGES = {'export_aliases': stage_export_aliases, 'cut': stage_cut, 'straighten': stage_straighten, 'retouch': stage_retouch, 'upscale': stage_upscale,
          'grade': stage_grade, 'export': stage_export, 'measure': stage_measure}

if __name__ == '__main__':
    if len(sys.argv) < 3 or sys.argv[1] not in STAGES:
        sys.exit(__doc__)
    WORK.mkdir(exist_ok=True)
    cfg = load_settings()
    ids = sys.argv[2:] if sys.argv[2] != 'all' else list(cfg)
    for i in ids:
        if i not in cfg:
            sys.exit(f'unknown id {i}')
        if 'alias' in cfg[i] and sys.argv[1] not in ('export_aliases',):
            continue
        STAGES[sys.argv[1]](i, cfg[i])
    if sys.argv[1] == 'export':      # aliases last, they copy from the exported original
        pass
