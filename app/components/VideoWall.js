"use client";

import { useEffect, useRef } from "react";
import artData from "../data/art.json";

const videos = artData.filter((p) => p.video && p.video.length > 0);

const portraitIndices = new Set([2, 5, 8]);

export default function VideoWall() {
  const videoRefs = useRef([]);

  useEffect(() => {
    const observers = [];

    videoRefs.current.forEach((video, i) => {
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
        { rootMargin: "300px 0px", threshold: 0 }
      );

      observer.observe(video);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="video-wall">
      {videos.map((project, i) => (
        <div
          key={project.id}
          className={`video-card ${portraitIndices.has(i) ? "portrait" : "landscape"}`}
        >
          <video
            ref={(el) => (videoRefs.current[i] = el)}
            data-src={project.video}
            muted
            loop
            playsInline
          />
          <div className="video-title">{project.title}</div>
        </div>
      ))}
    </div>
  );
}
