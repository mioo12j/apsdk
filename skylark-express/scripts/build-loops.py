#!/usr/bin/env python3
"""Seamless ambient background loops for the website, cut from the generated footage.
Each loop crossfades its tail into its head so it repeats without a jump.
Writes public/media/loops/{name}-720.mp4 and -480.mp4, and a poster to src/assets/img/loop-{name}.jpg.
Usage: python3 scripts/build-loops.py [name ...]"""
import subprocess, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = f'{ROOT}/media-src/clips'; OUT = f'{ROOT}/public/media/loops'; IMG = f'{ROOT}/src/assets/img'
os.makedirs(OUT, exist_ok=True)
# name: (source clip, start s, end s)
LOOPS = {
    'road': ('c06', 0.2, 6.0), 'rail': ('c07', 0.0, 5.0), 'air': ('c08', 0.0, 4.0), 'climb': ('c09', 0.0, 4.0),
    'hub': ('c05', 0.0, 4.0), 'crew': ('c04', 0.0, 4.0), 'scan': ('c01', 0.0, 4.0), 'van': ('c02', 0.0, 4.0),
    'dock': ('c03', 0.0, 4.0), 'delivery': ('c10', 0.0, 4.0), 'dusk': ('c12', 0.0, 5.0), 'project': ('c13', 0.0, 5.0),
}
F = 0.7  # crossfade seconds
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-1500:]); sys.exit(1)
names = sys.argv[1:] or list(LOOPS)
for n in names:
    clip, s0, s1 = LOOPS[n]; src = f'{C}/{clip}.mp4'
    if not os.path.exists(src): print('skip', n, '(no source)'); continue
    D = s1 - s0
    for tag, w, h, crf, rate in (('720', 1280, 720, 27, '1600k'), ('480', 854, 480, 29, '700k')):
        fc = (f"[0:v]trim=start={s0}:end={s1},setpts=PTS-STARTPTS,fps=24,scale={w}:{h}:flags=lanczos:force_original_aspect_ratio=increase,crop={w}:{h},split[s0][s1];"
              f"[s0]trim=start={F},setpts=PTS-STARTPTS[a];[s1]trim=end={F},setpts=PTS-STARTPTS[b];"
              f"[a][b]xfade=transition=fade:duration={F}:offset={D - 2 * F:.3f},format=yuv420p[v]")
        run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', fc, '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf),
             '-maxrate', rate, '-bufsize', '4M', '-g', '48', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', f'{OUT}/{n}-{tag}.mp4'])
    run(['ffmpeg', '-v', 'error', '-y', '-ss', str(s0 + F), '-i', src, '-frames:v', '1', '-q:v', '2', f'{IMG}/loop-{n}.jpg'])
    print(n, 'ok', round(D - F, 2), 's')
