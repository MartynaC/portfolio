"use client";

const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm"]);

function isVideo(filename) {
  return VIDEO_EXTS.has(filename.slice(filename.lastIndexOf(".")).toLowerCase());
}

export default function GalleryRandom({ images = [] }) {
  return (
    <div className="gallery-random-grid">
      {images.map((filename) => {
        const src = `https://media.martynachojnacka.com/images/random/${encodeURIComponent(filename)}`;
        return isVideo(filename) ? (
          <video
            key={filename}
            src={src}
            autoPlay
            muted
            loop
            playsInline
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        ) : (
          <img
            key={filename}
            src={src}
            alt=""
            style={{ display: "block", width: "100%", height: "auto" }}
            loading="lazy"
          />
        );
      })}
    </div>
  );
}
