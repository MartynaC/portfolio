import Layout from "../components/layout";
import GalleryArt from "../components/GalleryArt";

export const metadata = { title: "Visual Arts and Physical Computing Portfolio" };

export default function ArtPage() {
  return (
    <Layout>
      <div className="container creative">
        <div className="row page-description">
          <h1>Creative coding | Visual Arts</h1>
          <p>
            Working with music visualization is like creating a playground for the spectator's imagination.
            Approached well, it can be conceived as an extra layer to the sound.
          </p>
        </div>
        <GalleryArt />
      </div>
    </Layout>
  );
}
