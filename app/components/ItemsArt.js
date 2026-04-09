"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import WebGLTile from "./WebGLTile";

const ResponsiveMasonry = dynamic(
  () => import("react-responsive-masonry").then((m) => m.ResponsiveMasonry),
  { ssr: false }
);
const Masonry = dynamic(
  () => import("react-responsive-masonry").then((m) => m.default),
  { ssr: false }
);

// Mounts WebGLTile only when scrolled within 300px of the viewport
function LazyTile({ value }) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setMounted(true); observer.disconnect(); } },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid-img">
      <div className="gradient-making">
        {mounted ? (
          <WebGLTile
            src={value.image} src2={value.image2} alt={value.title || ""} className="img-fluid" style={{ height: "100%" }}
            title={value.title} description={value.description} stack={value.stack} role={value.role}
            video={value.video} gif={value.gif} noAudio={value.noAudio} externalLink={value.externalLink} date={value.date}
          />
        ) : (
          <img
            src={value.image}
            alt={value.title || ""}
            loading="lazy"
            style={{ width: "100%", display: "block" }}
          />
        )}
      </div>
    </div>
  );
}

export default function Items({ data }) {
  return (
    <div className="row image-grid">
      <ResponsiveMasonry columnsCountBreakPoints={{ 0: 1, 700: 2, 900: 2 }}>
        <Masonry gutter="8px">
          {data.map((value) => (
            <LazyTile key={value.id || value.title} value={value} />
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
}
