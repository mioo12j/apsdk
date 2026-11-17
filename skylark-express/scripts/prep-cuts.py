#!/usr/bin/env python3
"""Trims transparent cut-out masters in media-src/cut/png and writes them to src/assets/cut.
Usage: python3 scripts/prep-cuts.py [name ...]"""
import sys, os, glob
from PIL import Image
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
names = sys.argv[1:] or [os.path.basename(f)[:-4] for f in glob.glob(f'{ROOT}/media-src/cut/png/*.png')]
for n in names:
    im = Image.open(f'{ROOT}/media-src/cut/png/{n}.png').convert('RGBA')
    a = np.array(im); a[:, :, 3][a[:, :, 3] < 24] = 0; im = Image.fromarray(a)  # drop faint halo pixels
    im = im.crop(im.getbbox()); pad = int(max(im.size) * 0.02)
    c = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0)); c.alpha_composite(im, (pad, pad))
    c.save(f'{ROOT}/src/assets/cut/{n}.png', optimize=True); print(n, c.size)
