"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import useIsMobile from "../hooks/useIsMobile";

const ResponsiveMasonry = dynamic(
  () => import("react-responsive-masonry").then((m) => m.ResponsiveMasonry),
  { ssr: false }
);
const Masonry = dynamic(
  () => import("react-responsive-masonry").then((m) => m.default),
  { ssr: false }
);

const imgStyle = { display: "block", width: "100%", height: "auto" };

export default function Items({ data }) {
  const itemRefs = useRef([]);
  const lastY    = useRef(0);
  const isMobile = useIsMobile();

  // ── Parallax on odd items (desktop only) ──────────────────────────
  useEffect(() => {
    if (isMobile) return;
    lastY.current = window.scrollY;

    const onScroll = () => {
      lastY.current = window.scrollY;
      itemRefs.current.forEach((el, i) => {
        if (!el || i % 2 === 0) return;
        el.style.transform = `translateY(${(lastY.current * 0.06).toFixed(2)}px)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [data, isMobile]);

  return (
    <div style={{ width: "100%" }}>
      <ResponsiveMasonry columnsCountBreakPoints={{ 0: 1, 700: 2, 900: 2 }}>
        <Masonry gutter="0px" style={{ gap: 0 }}>
          {data.map((value, i) => {
            const { image, gif, video, title, link } = value;
            const isInternal = link?.startsWith("/");

            // On mobile: always use static image (skip video + gif)
            const media = isMobile ? (
              <Image
                src={image}
                alt={title || ""}
                width={0}
                height={0}
                sizes="100vw"
                style={imgStyle}
              />
            ) : gif ? (
              <img src={gif} style={imgStyle} alt={title || ""} />
            ) : video ? (
              <video src={video} autoPlay muted loop playsInline style={imgStyle} />
            ) : (
              <Image
                src={image}
                alt={title || ""}
                width={0}
                height={0}
                sizes="50vw"
                style={imgStyle}
              />
            );

            const card = isInternal ? (
              <Link href={link} style={{ display: "block", lineHeight: 0 }}>{media}</Link>
            ) : link ? (
              <a href={link} target="_blank" rel="noreferrer" style={{ display: "block", lineHeight: 0 }}>{media}</a>
            ) : (
              <div style={{ lineHeight: 0 }}>{media}</div>
            );

            return (
              <div
                key={link || title}
                ref={(el) => (itemRefs.current[i] = el)}
                style={{ margin: 0, padding: 0, lineHeight: 0, willChange: isMobile ? "auto" : "transform" }}
              >
                {card}
              </div>
            );
          })}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
}
