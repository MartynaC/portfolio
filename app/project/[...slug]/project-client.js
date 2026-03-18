"use client";

import Layout from "../../components/layout";
import Link from "next/link";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

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

  const backLink = project.slug.startsWith("creative/") ? "/art" : project.slug.startsWith("commercial/") ? "/work" : "/";

  return (
    <Layout>
      <div className="container">
        <div className="row page-description">
          <div className="col-md-12">
            <h1>{project.title}</h1>
            <div className="col-md-10">
              <p>{project.description}</p>
            </div>
          </div>

          <div className="col-md-7">
            {project.video?.length > 0 && (
              <ReactPlayer
                url={project.video}
                playing
                loop
                muted
                playsinline
                className="img-fluid project-main"
              />
            )}

            {project.gif?.length > 0 && <img src={project.gif} className="img-fluid project-main" alt="" />}
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

            <div className="back-btn">
              <Link href={backLink}>Back to the list</Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
