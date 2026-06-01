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
          <TruncatedTetraCanvas view={showAbout ? "about" : showProjects ? "projects" : showDevelopment ? "development" : showContact ? "contact" : showRandom ? "random" : "home"} />
        </section>
      )}

      {isHomePage && (
        <div className="row page-description home">
          <div className="col-md-11">

          </div>
        </div>
      )}

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
               I work with code as material — building responsive systems that generate, react and sometimes fail in interesting ways. My practice spans physical computing, machine learning, and real-time audiovisual performance, developed mostly in collaboration with musicians, theatres, and collectives. A lot of my work starts with travel — absorbing a place, recording it — and ends up on stage as a live trip.
               </p>
              <p>
                I'm most drawn to collaboration with musicians, dancers, performers, and to the specific tension of building systems that have to work live, in front of people, in real time.
              </p>
              <p>
                I teach Creative Coding at SWPS University in Warsaw, and give workshops and talks on generative art, physical computing, and creative uses of technology.
                I'm interested in AI as a medium for exploration rather than a productivity tool — something to work with, push against, and misuse deliberately.
              </p>
              <p>I completed the Data Science, ML & AI bootcamp in Berlin in 2026, adding machine learning pipelines, LLMs, and Python-based data work to a toolkit that already included TouchDesigner, Max MSP, Arduino, WebGL, Processing and many others. 
                </p>
                <p>My way in was Sinology — a degree and a semester in Chongqing. Learning Mandarin from scratch prepared me for code more than any tutorial. Both demand patience, constant updating, and comfort with never being fully fluent.</p>
            </div>
          </div>
      <div className="row" style={{ marginTop: "2rem" }}>
  <div className="col-md-6">
    <p><strong>Upcoming</strong></p>
    <div>5 June 2026 — <em>AI as a Brainstorming Partner, AI as a Muse</em> — ZID Theater, Amsterdam</div>
    <div>9 June 2026 — Creative Flip Conference — Talk on <em>M.oving O.thers</em>, Brussels</div>
    <div>November 2026 — Audiovisual concert — Ignis, Studio Koncertowe Polskiego Radia im. Witolda Lutosławskiego, Warsaw</div>
    <div>2026/2027 — <em>Dancing the Mask</em> — Interactive installation advocating for the repatriation of an indigenous Kwakwaka'wakw mask, Victoria BC & Berlin</div>
  </div>
  <div className="col-md-6">
    <p><strong>Selected Recent</strong></p>
    <div>2026 — <em>Mother</em> — Gallus Theatre, Frankfurt</div>
    <div>2025 — <em>Enantiodromia</em> — Berlin New Media Week, MaHalla</div>
    <div>2025 — <em>Mother</em> — BASE, Milan</div>
    <div>2025 — <em>M.oving O.thers</em> — Uferstudios, Berlin</div>
    <div>2025 — <em>The Doors of Perception</em> — Stefan Żeromski Theatre, Kielce</div>
    <div>2025 — <em>Amulet</em> — AV concert w/ Teoniki Rożynek, Museum of Modern Art Warsaw</div>
    <div>2025 — <em>The Blob</em> — ARTINTELL, Wrocław</div>
    <div>2024 — <em>Mother</em> — Uferstudios, Berlin / Venere in Teatro, Venice</div>
    <div>2024 — <em>Positive Disintegration</em> — AV concert w/ Teoniki Rożynek, Panke Gallery Berlin</div>
    <div>2024 — <em>Night Cultural Trail</em> — live AV, CKN Centrala, Gorzów</div>
    <div>2024 — <em>The Blob</em> — ARTINTELL, Warsaw</div>
    <div>2023 — <em>Positive Disintegration</em> — AV concert w/ Teoniki Rożynek, LYNC & CO Berlin</div>
    <div>2022 — <em>Run with me through the forest paths</em> — AV w/ Teoniki Rożynek, SPATiF Warsaw</div>
    <div>2022 — live AV w/ Joanna Duda Solo — Warsaw Political Criticism Community Centre</div>
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
