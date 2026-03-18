"use client";

import { useEffect, useRef, useMemo } from "react";
import artData from "../data/art.json";
import projectsData from "../data/projects.json";

function getEmbedUrl(externalLink) {
  if (!externalLink) return null;
  const yt = externalLink.match(/[?&]v=([^&]+)/);
  if (yt) {
    return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}`;
  }
  const vimeo = externalLink.match(/vimeo\.com\/(?:manage\/videos\/)?(\d+)/);
  if (vimeo) {
    return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=1&loop=1&background=1`;
  }
  return null;
}

function buildItems() {
  const items = [];

  for (const p of [...artData, ...projectsData]) {
    if (p.video && p.video.length > 0) {
      items.push({ id: `local-${p.id}-${p.title}`, type: "local", src: p.video });
    }
    const embed = getEmbedUrl(p.externalLink);
    if (embed) {
      items.push({ id: `embed-${p.id}-${p.title}`, type: "embed", src: embed });
    }
  }

  return items;
}

export default function MediaWall() {
  const items = useMemo(() => buildItems(), []);
  const videoRefs = useRef([]);

  useEffect(() => {
    const observers = [];

    videoRefs.current.forEach((video) => {
      if (!video) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!video.src && video.dataset.src) {
                video.src = video.dataset.src;
                video.load();
              }
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { rootMargin: "200px 0px", threshold: 0 }
      );

      observer.observe(video);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [items]);

  let videoIndex = 0;

  return (
    <div className="video-wall">
      {items.map((item) => {
        if (item.type === "embed") {
          return (
            <div key={item.id} className="video-wall-item">
              <iframe
                src={item.src}
                allow="autoplay; fullscreen"
                allowFullScreen
                frameBorder="0"
              />
            </div>
          );
        }

        const idx = videoIndex++;
        return (
          <div key={item.id} className="video-wall-item">
            <video
              ref={(el) => (videoRefs.current[idx] = el)}
              data-src={item.src}
              muted
              loop
              playsInline
            />
          </div>
        );
      })}
    </div>
  );
}
