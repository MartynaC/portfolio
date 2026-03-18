"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

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
        <Masonry>
          {data.map((value) => {
            const { id, image, title, link, stack, role, description } = value;

            const isInternal = link?.startsWith("/");

            const Card = (
              <>
                <img src={image} className="img-fluid" style={{ height: "100%" }} alt={title || ""} />
                <div className="project-short-desc">
                  <h3>{title}</h3>
                  {stack && <p>{stack}</p>}
                  {role && <p>{role}</p>}
                </div>
              </>
            );

            return (
              <div className="grid-img" key={link || title}>
                <div className="gradient-making">
                  {isInternal ? (
                    <Link href={link}>{Card}</Link>
                  ) : link ? (
                    <a href={link} target="_blank" rel="noreferrer">
                      {Card}
                    </a>
                  ) : (
                    Card
                  )}
                </div>
              </div>
            );
          })}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
}
