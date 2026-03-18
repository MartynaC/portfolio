"use client";

import * as React from "react";
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

export default function Items({ data }) {
  return (
    <div className="row image-grid">
      <ResponsiveMasonry columnsCountBreakPoints={{ 0: 1, 700: 2, 900: 2 }}>
        <Masonry gutter="8px">
          {data.map((value) => (
            <div className="grid-img" key={value.id || value.title}>
              <div className="gradient-making">
                <WebGLTile
                  src={value.image} alt={value.title || ""} className="img-fluid" style={{ height: "100%" }}
                  title={value.title} description={value.description} stack={value.stack} role={value.role}
                  video={value.video} gif={value.gif} externalLink={value.externalLink} date={value.date}
                />
              </div>
            </div>
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
}
