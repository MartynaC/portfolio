import commercialProjects from "../../data/projects.json";
import artProjects from "../../data/art.json";
import ProjectClient from "./project-client";

const projects = [...commercialProjects, ...artProjects];

export function generateStaticParams() {
  return projects.filter((p) => p.slug).map((p) => ({ slug: p.slug.split("/") }));
}

export const dynamicParams = false;

export default function ProjectPage({ params }) {
  const slug = Array.isArray(params.slug) ? params.slug.join("/") : String(params.slug || "");
  const project = projects.find((p) => p.slug === slug);
  return <ProjectClient project={project} />;
}
