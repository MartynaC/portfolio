import Layout from "../components/layout";
import GalleryArt from "../components/GalleryArt";
import Gallery from "../components/Gallery";

export const metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <Layout>
      <div className="container creative">
        <div className="row page-description">
          <h1>Projects</h1>
        </div>
        <GalleryArt />
        <Gallery />
      </div>
    </Layout>
  );
}
