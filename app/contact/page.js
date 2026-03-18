import Layout from "../components/layout";

export const metadata = { title: "Contact me" };

export default function ContactPage() {
  return (
    <Layout>
      <div className="container contact-page">
        <div className="row row page-description">
          <div className="col-md-12">
            <h1>
              <strong>hello</strong>@martynachojnacka.com
            </h1>

            <p>
              <a target="_blank" rel="noreferrer" href="https://www.instagram.com/martyna_chojnacka/">
                INSTAGRAM
              </a>              {" "}
              <a target="_blank" rel="noreferrer" href="https://github.com/MartynaC">
                GITHUB
              </a>

            </p>
            <p>

              <a target="_blank" rel="noreferrer" href="https://vimeo.com/user21520909">
                VIMEO
              </a>
              {" "}
              <a target="_blank" rel="noreferrer" href="https://www.linkedin.com/in/martynachojnacka/">
                LINKEDIN
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
