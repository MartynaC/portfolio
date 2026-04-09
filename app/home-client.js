"use client";

import Layout from "./components/layout";
import GalleryArt from "./components/GalleryArt";
import Gallery from "./components/Gallery";
import TruncatedTetraCanvas from "./components/TruncatedTetraCanvas";
import useIsMobile from "./hooks/useIsMobile";

export default function HomePage({ showProjects, showDevelopment, showAbout, showContact }) {
  const isMobile = useIsMobile();
  const isHomePage = !showProjects && !showDevelopment && !showAbout && !showContact;
  return (
    <Layout>
      {(!isMobile || isHomePage) && (
        <section className="front-page tetra-hero">
          <TruncatedTetraCanvas />
        </section>
      )}

      {isHomePage && <div className="row page-description home" />}

      {showProjects && (
        <div className="container creative" style={{ paddingRight: "calc(var(--bs-gutter-x) * 0.5)" }}>
          <GalleryArt />
        </div>
      )}

      {showDevelopment && (
        <div className="container creative" style={{ paddingRight: "calc(var(--bs-gutter-x) * 0.5)" }}>
          <Gallery />
        </div>
      )}

      {showAbout && (
        <div className="container about-page">
          <div className="row page-description" style={{ marginTop: 0, marginLeft: 0, borderTop: "none", paddingRight: "calc(var(--bs-gutter-x) * 0.5)" }}>
            <div className="col-md-12">
              <p>
                Martyna Chojnacka is a Berlin-based programmer and creative coder with over ten years of experience building software — from web applications and digital products to interactive installations and physical computing systems. She has worked as a freelancer and within digital studios, developing across the full stack for clients and institutions alike.
              </p>
              <p>
                Alongside her programming practice, Martyna holds a diploma in Creative Coding (Warsaw, 2022) and has consistently operated at the intersection of code and art — building reactive video installations, kinetic sculptures, and real-time audiovisual systems exhibited at venues including the Museum of Modern Art Warsaw, the Szczecin Philharmonic, TEDx Warsaw, as well as festivals such as Unsound, Transmediale, and Berlin New Media Week 2025.
              </p>
              <p>
                Currently, she is deepening her expertise in data science, machine learning, and AI through the Le Wagon bootcamp, while already applying AI in artistic contexts — most recently in The Mother Project, a touring performance piece using real-time AI video generation and motion-responsive systems.
              </p>
            </div>
          </div>
        </div>
      )}

      {showContact && (
        <div className="container contact-page">
          <div className="row page-description" style={{ marginTop: 0, marginLeft: 0, borderTop: "none" }}>
            <div className="col-md-12">
              <h1>
                <strong>hello</strong>@martynachojnacka.com
              </h1>
              <p>
                <a target="_blank" rel="noreferrer" href="https://www.instagram.com/martyna_chojnacka/">INSTAGRAM</a>
                {" || "}
                <a target="_blank" rel="noreferrer" href="https://github.com/MartynaC">GITHUB</a>
                {" || "}
                <a target="_blank" rel="noreferrer" href="https://vimeo.com/user21520909">VIMEO</a>
                {" || "}
                <a target="_blank" rel="noreferrer" href="https://www.linkedin.com/in/martynachojnacka/">LINKEDIN</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
