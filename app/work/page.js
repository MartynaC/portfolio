import Layout from "../components/layout";
import Gallery from "../components/Gallery";

export const metadata = { title: "Frontend Development Portfolio" };

export default function WorkPage() {
  return (
    <Layout>
      <div className="container commercial">
        <div className="row page-description">
          <h1>Frontend development</h1>
          <p>
            I have extensive experience working with various web tools. I specialize in creating web content,
            platforms, apps, and e-commerce websites. I assist businesses in improving their online visibility
            and provide clear solutions to navigate the digital landscape.
          </p>
        </div>
        <Gallery />
      </div>
    </Layout>
  );
}
