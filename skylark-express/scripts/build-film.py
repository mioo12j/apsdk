#!/usr/bin/env python3
"""Assembles "The handover" (42 s, 24 fps) in 16:9 and 9:16, the six-second hero cut, the
journey scrub clip, posters and audio from the generated shots in media-src/clips and the
editable graphics in media-src/work/ov.   Usage: python3 scripts/build-film.py"""
import subprocess, os, wave, sys
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = f'{ROOT}/media-src/clips'; OV = f'{ROOT}/media-src/work/ov'; W = f'{ROOT}/media-src/work'; OUT = f'{ROOT}/public/media'
os.makedirs(OUT, exist_ok=True)
FPS = 24
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-3000:]); sys.exit(1)

# (clip, in-point s, duration s)  — total 42.0 s. Vehicles travel left to right throughout.
EDIT = [('01', 0.0, 4.0),                    # 00:00 Pickup
        ('02', 0.0, 3.2), ('03', 0.6, 1.8),  # 00:04 First mile
        ('04', 0.0, 3.0), ('05', 0.2, 3.0),  # 00:09 Hub
        ('06', 0.0, 6.0),                    # 00:15 Road / hero take (one continuous take)
        ('07', 0.0, 5.0),                    # 00:21 Rail option
        ('08', 0.0, 4.0), ('09', 0.4, 3.0),  # 00:26 Air option
        ('10', 0.2, 3.0), ('POD', 0, 2.0),   # 00:33 Delivery + illustrated record
        ('12', 0.0, 4.0)]                    # 00:38 Close
# overlay name, start, end (fades 0.35 s)
TITLES = [('note', 0.4, 3.6), ('c1', 0.5, 3.7), ('c2', 4.3, 8.7), ('c3', 9.3, 14.7), ('mode', 15.2, 18.6),
          ('road', 18.4, 20.8), ('rail', 21.3, 25.7), ('air', 26.3, 32.7), ('c4', 33.3, 35.8), ('end', 39.0, 42.1)]

def build(tag, prefix, w, h):
    segs = []
    for i, (clip, ss, d) in enumerate(EDIT):
        o = f'{W}/{tag}_seg{i:02d}.mp4'; n = round(d * FPS)
        if clip == 'POD':
            run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', str(FPS), '-i', f'{OV}/{tag}_pod.png', '-frames:v', str(n),
                 '-vf', f"scale={int(w*1.04)}:{int(h*1.04)}:flags=lanczos,zoompan=z='1.04-0.04*on/{n}':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d=1:s={w}x{h}:fps={FPS},format=yuv420p",
                 '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', o])
        else:
            vf = f"fps={FPS},scale={w}:{h}:flags=lanczos:force_original_aspect_ratio=increase,crop={w}:{h}"
            if clip != '06' or tag == 'p': vf += ",unsharp=5:5:0.45:5:5:0.0"   # upscaled 720p shots get a light sharpen
            run(['ffmpeg', '-v', 'error', '-y', '-ss', str(ss), '-i', f'{C}/{prefix}{clip}.mp4', '-frames:v', str(n), '-vf', vf + ',format=yuv420p', '-an',
                 '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', o])
        segs.append(o)
    with open(f'{W}/{tag}_list.txt', 'w') as f: f.write(''.join(f"file '{s}'\n" for s in segs))
    base = f'{W}/{tag}_base.mp4'
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{W}/{tag}_list.txt', '-c', 'copy', base])
    # titles
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', base]; fc = []; last = '0:v'
    for k, (name, a, b) in enumerate(TITLES):
        cmd += ['-loop', '1', '-framerate', str(FPS), '-t', '42.2', '-i', f'{OV}/{tag}_{name}.png']
        fo = '' if name == 'end' else f",fade=out:st={b-0.35}:d=0.35:alpha=1"
        fin = 0.9 if name == 'end' else 0.35
        fc.append(f"[{k+1}:v]format=rgba,fade=in:st={a}:d={fin}:alpha=1{fo}[o{k}]")
        fc.append(f"[{last}][o{k}]overlay=0:0:enable='between(t,{a},{b})':shortest=0[v{k}]"); last = f'v{k}'
    master = f'{W}/{tag}_master.mp4'
    run(cmd + ['-filter_complex', ';'.join(fc), '-map', f'[{last}]', '-frames:v', str(42 * FPS), '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', '-pix_fmt', 'yuv420p', master])
    return master

# ── original, synthesised sound design (no third-party audio) ────────────────
def audio(path):
    sr = 48000; T = 42.0; n = int(sr * T); t = np.arange(n) / sr; rng = np.random.default_rng(7)
    def lp(x, a):  # one-pole low-pass
        y = np.empty_like(x); acc = 0.0
        for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
        return y
    def env(a, b, fi=0.4, fo=0.6):
        e = np.clip((t - a) / fi, 0, 1) * np.clip((b - t) / fo, 0, 1); return np.clip(e, 0, 1)
    noise = rng.standard_normal(n)
    low = lp(noise, 0.006); low /= np.abs(low).max()
    mid = lp(noise, 0.06); mid /= np.abs(mid).max()
    out = np.zeros(n)
    out += 0.10 * low * env(0, 42, 1.0, 2.5)                                   # yard / road ambience bed
    def beep(at, f=1870, d=0.09, g=0.16):
        m = (t >= at) & (t < at + d); out[m] += g * np.sin(2 * np.pi * f * (t[m] - at)) * np.hanning(m.sum())
    def burst(at, d, g, src):
        m = (t >= at) & (t < at + d); out[m] += g * src[m] * np.hanning(m.sum()) ** 0.5
    burst(0.35, 0.55, 0.22, noise - mid)                                       # tape tear
    beep(2.5)                                                                  # first scan
    eng = np.sin(2 * np.pi * 62 * t + 0.6 * np.sin(2 * np.pi * 31 * t)) + 0.4 * np.sin(2 * np.pi * 124 * t)
    out += 0.07 * eng * env(4.0, 8.9, 0.5, 0.5)                                # van engine
    m = (t >= 8.75) & (t < 9.15); out[m] += 0.35 * np.sin(2 * np.pi * 70 * (t[m] - 8.75)) * np.exp(-(t[m] - 8.75) * 16)  # door closes into hub
    out += 0.09 * mid * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t)) * env(9.4, 15.2, 0.4, 0.8)   # trolley / pallet-jack wheels carry to truck
    beep(11.6)
    eng2 = np.sin(2 * np.pi * 44 * t + 0.8 * np.sin(2 * np.pi * 22 * t)) + 0.5 * np.sin(2 * np.pi * 88 * t)
    out += 0.11 * eng2 * env(15.0, 21.2, 1.2, 0.6)                             # truck eases out
    for k in np.arange(21.2, 26.0, 0.62):                                      # rail rhythm
        for off in (0.0, 0.14):
            a = k + off; m = (t >= a) & (t < a + 0.09); out[m] += 0.20 * mid[m] * np.exp(-(t[m] - a) * 40)
    out += 0.06 * low * env(21.0, 26.2, 0.3, 0.5)
    whine = np.sin(2 * np.pi * (520 + 60 * np.clip((t - 29.5) / 3.5, 0, 1)) * t) * 0.25 + (noise - mid) * 0.5
    out += 0.05 * whine * env(26.2, 33.4, 1.5, 1.8)                            # aircraft, fading into dock ambience
    beep(34.4); beep(34.56, 2240, 0.07)                                        # final scan completes the motif
    for f, g in ((220.0, 0.05), (329.63, 0.04), (440.0, 0.03), (554.37, 0.02)):  # closing note
        out += g * np.sin(2 * np.pi * f * t) * env(38.6, 42.0, 0.9, 2.2)
    out = np.tanh(out * 1.6) * 0.7
    st = np.stack([out, np.roll(out, 90)], 1)
    with wave.open(path, 'wb') as wv:
        wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(sr); wv.writeframes((st * 32767).astype('<i2').tobytes())

aud = f'{W}/audio.wav'; audio(aud)
X = ['-movflags', '+faststart', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '128k', '-ac', '2']
L = build('l', 'c', 1920, 1080); Pm = build('p', 'p', 720, 1280)
enc = lambda src, vf, crf, maxr, o, a=True: run(['ffmpeg', '-v', 'error', '-y', '-i', src] + (['-i', aud] if a else []) + ['-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-maxrate', maxr, '-bufsize', '8M', '-g', '48'] + (X if a else ['-movflags', '+faststart', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-an']) + ['-shortest', o])
enc(L, 'null', 21, '6M', f'{OUT}/the-handover-1080p.mp4')
enc(L, 'scale=1280:720:flags=lanczos', 23, '2800k', f'{OUT}/the-handover-720p.mp4')
enc(Pm, 'null', 23, '2800k', f'{OUT}/the-handover-portrait-720x1280.mp4')
# hero cut: the continuous road take at 00:15–00:21, silent
hero = f'{W}/l_seg05.mp4'; herop = f'{W}/p_seg05.mp4'
enc(hero, 'null', 23, '4500k', f'{OUT}/hero-dispatch-1080p.mp4', False)
enc(hero, 'scale=1280:720:flags=lanczos', 25, '2200k', f'{OUT}/hero-dispatch-720p.mp4', False)
enc(herop, 'crop=720:900:0:300', 25, '1800k', f'{OUT}/hero-dispatch-4x5.mp4', False)
# posters
run(['ffmpeg', '-v', 'error', '-y', '-i', hero, '-frames:v', '1', '-q:v', '1', f'{ROOT}/src/assets/img/hero-poster.png'])
run(['ffmpeg', '-v', 'error', '-y', '-sseof', '-0.1', '-i', hero, '-frames:v', '1', '-update', '1', '-q:v', '2', f'{ROOT}/src/assets/img/hero-settle.jpg'])
run(['ffmpeg', '-v', 'error', '-y', '-ss', '41', '-i', L, '-frames:v', '1', '-q:v', '2', f'{ROOT}/src/assets/img/film-end.jpg'])
run(['ffmpeg', '-v', 'error', '-y', '-ss', '41', '-i', Pm, '-frames:v', '1', '-q:v', '2', f'{ROOT}/src/assets/img/film-end-portrait.jpg'])
run(['ffmpeg', '-v', 'error', '-y', '-ss', '16.5', '-i', L, '-frames:v', '1', '-q:v', '2', f'{ROOT}/src/assets/img/film-poster.jpg'])
run(['ffmpeg', '-v', 'error', '-y', '-ss', '16.5', '-i', Pm, '-frames:v', '1', '-q:v', '2', f'{ROOT}/src/assets/img/film-poster-portrait.jpg'])
# journey scrub clip for the pinned home sequence: every frame a keyframe so scroll can seek freely
J = [('01', 0.4, 2.5), ('04', 0.0, 2.5), ('06', 1.0, 3.0), ('10', 0.2, 2.5)]
js = []
for i, (c, ss, d) in enumerate(J):
    o = f'{W}/j{i}.mp4'; js.append(o)
    run(['ffmpeg', '-v', 'error', '-y', '-ss', str(ss), '-t', str(d), '-i', f'{C}/c{c}.mp4', '-vf', 'fps=12,scale=960:540:flags=lanczos,format=yuv420p', '-an', '-c:v', 'libx264', '-crf', '14', o])
with open(f'{W}/j_list.txt', 'w') as f: f.write(''.join(f"file '{s}'\n" for s in js))
run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{W}/j_list.txt', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-g', '1', '-keyint_min', '1', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', '-an', f'{OUT}/journey-scrub.mp4'])
print('film built')
