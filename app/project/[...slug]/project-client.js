"use client";

import Layout from "../../components/layout";
import Link from "next/link";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const isEmbed = (url) => url && (url.includes("vimeo.com") || url.includes("youtube.com") || url.includes("youtu.be"));

export default function ProjectClient({ project }) {
  if (!project) {
    return (
      <Layout>
        <div className="container">
          <h1>Project not found</h1>
          <p>
            <Link href="/work">Back to work</Link>
          </p>
        </div>
      </Layout>
    );
  }

  const heroMedia = project.gif?.length > 0 ? (
    <img src={project.gif} alt={project.title || ""} style={{ maxHeight: "80%", maxWidth: "70%", objectFit: "contain" }} />
  ) : project.video?.length > 0 ? (
    isEmbed(project.video) ? (
      <div style={{ width: "100%", maxWidth: "70%", aspectRatio: "16/9" }}>
        <ReactPlayer url={project.video} playing loop muted playsinline width="100%" height="100%" />
      </div>
    ) : (
      <video src={project.video} autoPlay muted loop playsInline style={{ maxHeight: "80%", maxWidth: "70%", objectFit: "contain" }} />
    )
  ) : project.image?.length > 0 ? (
    <img src={project.image} alt={project.title || ""} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
  ) : null;

  return (
    <Layout>
      <section className="front-page tetra-hero">
        {heroMedia}
        <div className="tetra-controls" style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link href="/?view=development" style={{ fontSize: "11px", opacity: 0.35, letterSpacing: "0.04em", color: "inherit", textDecoration: "none", paddingRight: "calc(var(--bs-gutter-x) * 0.5)" }}>
            back to the list
          </Link>
        </div>
      </section>

      <div className="container">
        <div className="row page-description home">
          <div className="col-md-12">
            <h1>{project.title}</h1>
            <div className="col-md-10">
              <p>{project.description}</p>
            </div>
          </div>

          <div className="col-md-5 project-data">
            <p>&#91; {project.stack} &#93;</p>
            {project.externalLink ? (
              <p>
                <a target="_blank" rel="noreferrer" href={project.externalLink}>
                  {project.externalLink}
                </a>
              </p>
            ) : null}
            <p>{project.date}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
