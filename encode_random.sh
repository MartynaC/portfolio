#!/usr/bin/env bash

DIR="/Users/martynachojnacka/local_sites/portfolio/public/images/random"
DONE=0
FAILED=0

encode_video() {
  local src="$1"
  local dst="${src%.*}_enc.mp4"
  ffmpeg -y -i "$src" \
    -vf "scale='min(1080,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2" \
    -c:v libx264 -crf 28 -preset fast -movflags +faststart \
    -c:a aac -b:a 96k \
    "$dst" -loglevel error 2>/dev/null || true
  if [ -s "$dst" ]; then
    rm "$src"
    mv "$dst" "${src%.*}.mp4"
    echo "✓ video: $(basename "$src") → $(basename "${src%.*}.mp4")"
    DONE=$((DONE+1))
  else
    rm -f "$dst"
    echo "✗ FAILED: $(basename "$src")"
    FAILED=$((FAILED+1))
  fi
}

echo "Encoding videos in: $DIR"
echo "────────────────────────────────────"

while IFS= read -r -d '' f; do
  encode_video "$f"
done < <(find "$DIR" -maxdepth 1 -type f \( -iname "*.mov" -o -iname "*.webm" \) -print0)

while IFS= read -r -d '' f; do
  encode_video "$f"
done < <(find "$DIR" -maxdepth 1 -type f -iname "*.mp4" -not -name "*_enc.mp4" -print0)

echo "────────────────────────────────────"
echo "Done: $DONE encoded, $FAILED failed"
