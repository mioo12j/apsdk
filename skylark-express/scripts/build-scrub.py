#!/usr/bin/env python3
"""Builds the scroll-scrubbed journey clips for the pinned Home sequence (landscape + portrait)
and a manifest of chapter timings.  Usage: python3 scripts/build-scrub.py
Short GOP (every 2nd frame a keyframe) so scrolling can seek to any moment quickly."""
import subprocess, os, json, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = f'{ROOT}/media-src/clips'; W = f'{ROOT}/media-src/work'; OUT = f'{ROOT}/public/media'
os.makedirs(W, exist_ok=True)
FPS = 12
# chapter → shots (clip, in-point s, duration s, on-screen label)
CHAPTERS = [
  ('Pickup',   [('01', 0.3, 3.0, 'Scanned at the counter'), ('02', 0.2, 3.0, 'First mile')]),
  ('Hub',      [('03', 0.5, 2.0, 'Arrives at the hub'), ('04', 0.2, 2.8, 'Counted and scanned'), ('05', 0.3, 2.8, 'Staged for linehaul')]),
  ('Linehaul', [('06', 0.4, 4.2, 'Road'), ('07', 0.3, 3.0, 'Rail'), ('08', 0.5, 2.5, 'Air'), ('09', 0.5, 3.0, 'Air')]),
  ('Delivery', [('10', 0.2, 3.2, 'Scanned by the recipient')]),
]
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-2000:]); sys.exit(1)
manifest = {'fps': FPS, 'chapters': []}
for tag, prefix, w, h, crf in (('l', 'c', 1280, 720, 29), ('p', 'p', 540, 960, 29)):
    segs = []; t = 0.0; chs = []
    for name, shots in CHAPTERS:
        ch = {'name': name, 'start': round(t, 3), 'shots': []}
        for clip, ss, d, label in shots:
            o = f'{W}/s{tag}_{clip}.mp4'; n = round(d * FPS)
            run(['ffmpeg', '-v', 'error', '-y', '-ss', str(ss), '-i', f'{C}/{prefix}{clip}.mp4', '-vf', f'fps={FPS},scale={w}:{h}:flags=lanczos:force_original_aspect_ratio=increase,crop={w}:{h},format=yuv420p', '-frames:v', str(n), '-an', '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', o])
            segs.append(o); ch['shots'].append({'start': round(t, 3), 'dur': round(n / FPS, 3), 'label': label}); t += n / FPS
        ch['end'] = round(t, 3); chs.append(ch)
    with open(f'{W}/s{tag}.txt', 'w') as f: f.write(''.join(f"file '{s}'\n" for s in segs))
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{W}/s{tag}.txt', '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-g', '2', '-keyint_min', '2', '-bf', '0', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', '-an', f'{OUT}/journey-scrub-{"landscape" if tag == "l" else "portrait"}.mp4'])
    manifest['chapters'] = chs; manifest['duration'] = round(t, 3)
json.dump(manifest, open(f'{ROOT}/src/data/generated/scrub.json', 'w'), indent=1)
print('scrub clips built', manifest['duration'], 's')
