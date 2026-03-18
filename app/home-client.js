"use client";

import Layout from "./components/layout";
import GalleryArt from "./components/GalleryArt";
import Gallery from "./components/Gallery";
import TruncatedTetraCanvas from "./components/TruncatedTetraCanvas";

export default function HomePage({ showProjects }) {
  return (
    <Layout>
      <section className="front-page tetra-hero">
        <TruncatedTetraCanvas />
      </section>

      <div className="row page-description home" />

      {showProjects && (
        <div className="container creative">
          <GalleryArt />
          <Gallery />
        </div>
      )}
    </Layout>
  );
}
