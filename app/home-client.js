"use client";

import Layout from "./components/layout";
import GalleryArt from "./components/GalleryArt";
import Gallery from "./components/Gallery";
import GalleryRandom from "./components/GalleryRandom";
import TruncatedTetraCanvas from "./components/TruncatedTetraCanvas";
import useIsMobile from "./hooks/useIsMobile";

export default function HomePage({ showProjects, showDevelopment, showAbout, showContact, showRandom, randomImages = [] }) {
  const isMobile = useIsMobile();
  const isHomePage = !showProjects && !showDevelopment && !showAbout && !showContact && !showRandom;
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

      {showRandom && (
        <div className="container creative" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <GalleryRandom images={randomImages} />
        </div>
      )}

      {showAbout && (
        <div className="container about-page">
          <div className="row page-description" style={{ marginTop: 0, marginLeft: 0, borderTop: "none", paddingRight: "calc(var(--bs-gutter-x) * 0.5)" }}>
            <div className="col-md-12">
              <p>
                I work with musicians, theatres, and collectives — building live visual systems, installations, and real-time responses to sound and movement.
              </p>
              <p>
                A lot of my recent work starts with travel — field research, recording, absorbing a place — and ends up on stage as generative audiovisual performance.
              </p>
              <p>
                I'm most drawn to collaboration with electronic musicians, and to the specific tension of building systems that have to work live, in front of people, in real time.
              </p>
              <p>I work with code the way others work with material — building systems that respond, generate, and sometimes fail in interesting ways. My practice spans physical computing, machine learning, and real-time audiovisual performance, developed mostly in collaboration with musicians, theatres, and collectives.</p>
              <p>
                I teach Creative Coding at SWPS University in Warsaw, and give workshops and talks on generative art, physical computing, and creative uses of technology.
              </p>
              <p>
                I'm interested in AI as a medium for exploration rather than a productivity tool — something to work with, push against, and misuse deliberately.
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
