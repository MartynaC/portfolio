import Layout from "../components/layout";

export const metadata = { title: "About Martyna Chojnacka" };

export default function AboutPage() {
  return (
    <Layout>
      <div className="container about-page">
        <div className="row row page-description">
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
            <p>I work with code the way others work with material — building systems that respond, generate, and sometimes fail in interesting ways. My practice spans physical computing, machine learning, and real-time audiovisual performance, developed mostly in collaboration with musicians, theatres, and collectives. </p>
            <p>
              I teach Creative Coding at SWPS University in Warsaw, and give workshops and talks on generative art, physical computing, and creative uses of technology. 
              </p>
              <p>
              I'm interested in AI as a medium for exploration rather than a productivity tool — something to work with, push against, and misuse deliberately.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
