import Layout from "../components/layout";

export const metadata = { title: "About Martyna Chojnacka" };

export default function AboutPage() {
  return (
    <Layout>
      <div className="container about-page">
        <div className="row row page-description">
          <div className="col-md-12">
            <h1>
              I create artistic and commercial projects that live both online and in physical spaces. My approach is rooted in curiosity and driven by technology — exploring how emerging tools can transform ideas into meaningful experiences.
            </h1>
            <p>
              My name is Martyna, and I am a creative technologist, programmer, and visual artist. I began as a self-taught coder working on small CMS projects, which quickly grew into a versatile practice spanning front-end development, generative art, and interactive installations.
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 left-column">
            <p>
              Over the years, I’ve built expertise across multiple platforms and tools, adapting my skills to the needs of each collaboration — from brands and institutions to musicians, theaters, and museums.
            </p>
            <ul>
              <strong>Web:</strong>
              <li>HTML5</li>
              <li>sass/scss/css</li>
              <li>javascript / jQuery</li>
              <li>java</li>
              <li>php</li>
              <li>mySQL</li>
              <li>graphQL</li>
              <li>react.js</li>
              <li>WordPress / Woocommerce</li>
              <br />
              <strong>Other</strong>
              <li>Laser Cutting</li>
              <li>Android Studio</li>
            </ul>
            <br />
            <p>
              I speak in four human languages, currently learning another one. I believe that code is the most efficient language in the world and I am constantly seeking to push the boundaries of what can be achieved with it.
            </p>
            <p>
              I am an avid traveler and South America is my favorite place in the world. In my free time, I enjoy going on adventures with my dog, Buster.
            </p>
          </div>

          <div className="col-md-6 right-column">
            <p>
              In 2019, I graduated from SWPS University of Social Sciences and Humanities with a postgraduate degree in Creative Coding.
            </p>
            <br />
            <ul>
              <strong>Tools:</strong>
              <li>Creative coding :</li>
              <li>Processing</li>
              <li>p5.js</li>
              <li>Max/MSP/Jitter</li>
              <li>TouchDesigner</li>
              <li>Arduino</li>
              <li>Teensy</li>
              <li>Creative Software :</li>
              <li>Adobe Creative Suite</li>
              <li>Blender</li>
              <li>Cinema4D</li>
              <li>Resolume Avenue</li>
              <li>MadMapper</li>
              <li>VDMX</li>
            </ul>
            <p>
              I have a particular passion for working with musicians, art institutions, theaters, and museums. I seamlessly blend my programming skills with my artistic capabilities to create unique and impactful projects.
            </p>
            <p>
              I am able to participate in different stages of projects - from the conceptual parts to technical development. I create artistic experiments and execute commercial projects.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
