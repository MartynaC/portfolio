"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useMemo } from "react";

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

function LazyVideo({ src, eager }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || eager) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.src = src;
          el.load();
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src, eager]);

  return (
    <video
      ref={ref}
      src={eager ? src : undefined}
      autoPlay
      muted
      loop
      playsInline
      preload={eager ? "auto" : "none"}
      style={{ display: "block", width: "100%", height: "auto" }}
    />
  );
}

export default function GalleryRandom({ images = [] }) {
  const list = useMemo(() => buildList(images).sort(() => Math.random() - 0.5), [images]);
  const [cols, setCols] = useState(0);

  useEffect(() => {
    const update = () => setCols(window.innerWidth <= 768 ? 2 : 4);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (cols === 0) return null;

  const EAGER_ROWS = 3;
  const columns = Array.from({ length: cols }, () => []);
  list.forEach((item, i) => columns[i % cols].push({ ...item, rowIndex: Math.floor(i / cols) }));

  return (
    <div className="gallery-random-grid">
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="gallery-column">
          {col.map(({ filename, key, rowIndex }) => {
            const src = `${CDN}/${encodeURIComponent(filename)}`;
            if (isVideo(filename)) {
              return <LazyVideo key={key} src={src} eager={rowIndex < EAGER_ROWS} />;
            }
            return (
              <Image
                key={key}
                src={src}
                alt=""
                width={0}
                height={0}
                sizes="25vw"
                priority={rowIndex < 2}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}