#!/usr/bin/env python3
import os
import subprocess

DIR = "/Users/martynachojnacka/local_sites/portfolio/public/images/random"
VIDEO_EXTS = {'.mov', '.mp4', '.m4v', '.avi', '.mkv', '.webm', '.mts', '.flv', '.wmv', '.3gp'}

def fmt(n):
    for unit in ['B','KB','MB','GB']:
        if n < 1024 or unit == 'GB':
            return f"{n:.0f}{unit}" if unit == 'B' else f"{n/1:.1f}{unit}"
        n /= 1024

def fmt(n):
    if n >= 1024**3: return f"{n/1024**3:.1f}GB"
    if n >= 1024**2: return f"{n/1024**2:.1f}MB"
    if n >= 1024:    return f"{n/1024:.1f}KB"
    return f"{n}B"

def compress(input_path):
    filename = os.path.basename(input_path)
    base, _ = os.path.splitext(filename)
    output_path = os.path.join(DIR, base + ".mp4")
    tmp_path = os.path.join(DIR, f".web_tmp_{os.getpid()}.mp4")

    orig_size = os.path.getsize(input_path)
    print(f"\n[{fmt(orig_size)}] {filename}", flush=True)

    cmd = [
        "ffmpeg", "-i", input_path,
        "-map", "0:v:0",
        "-map", "0:a:0?",
        "-c:v", "libx264", "-crf", "23", "-preset", "fast",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
        "-y", tmp_path
    ]

    result = subprocess.run(cmd, capture_output=True)

    if result.returncode == 0:
        new_size = os.path.getsize(tmp_path)
        os.replace(tmp_path, output_path)
        if os.path.normpath(input_path) != os.path.normpath(output_path):
            os.remove(input_path)
        pct = (1 - new_size / orig_size) * 100
        print(f"  -> {fmt(new_size)}  ({pct:.0f}% smaller)", flush=True)
        return True
    else:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        print(f"  FAILED: {result.stderr.decode()[-300:]}", flush=True)
        return False

files = []
for fname in os.listdir(DIR):
    fpath = os.path.join(DIR, fname)
    if os.path.isfile(fpath):
        _, ext = os.path.splitext(fname)
        if ext.lower() in VIDEO_EXTS:
            files.append((os.path.getsize(fpath), fpath))

files.sort()  # smallest first — quick wins first, big files last
print(f"Found {len(files)} video files")

ok, fail = 0, 0
for _, fpath in files:
    if compress(fpath):
        ok += 1
    else:
        fail += 1

print(f"\nFinished: {ok} ok, {fail} failed")
