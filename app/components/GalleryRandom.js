"use client";

import Image from "next/image";

const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm"]);
const CDN = "https://media.martynachojnacka.com/images/random";
const FEATURED = ["banch_1.png"];
const INJECT_EVERY = 17;
const PRIORITY_COUNT = 8;

function isVideo(filename) {
  return VIDEO_EXTS.has(filename.slice(filename.lastIndexOf(".")).toLowerCase());
}

function buildList(images) {
  const result = [];
  let featuredIdx = 0;
  images.forEach((filename, i) => {
    if (i > 0 && i % INJECT_EVERY === 0) {
      result.push({ filename: FEATURED[featuredIdx % FEATURED.length], key: `featured-${i}` });
      featuredIdx++;
    }
    result.push({ filename, key: filename });
  });
  return result;
}

export default function GalleryRandom({ images = [] }) {
  const list = buildList(images);
  return (
    <div className="gallery-random-grid">
      {list.map(({ filename, key }, i) => {
        const src = `${CDN}/${encodeURIComponent(filename)}`;
        if (isVideo(filename)) {
          return (
            <video
              key={key}
              src={src}
              autoPlay
              muted
              loop
              playsInline
              style={{ display: "block", width: "100%", height: "auto" }}
            />
          );
        }
        return (
          <Image
            key={key}
            src={src}
            alt=""
            width={0}
            height={0}
            sizes="25vw"
            priority={i < PRIORITY_COUNT}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        );
      })}
    </div>
  );
}
