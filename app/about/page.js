import Layout from "../components/layout";

export const metadata = { title: "About Martyna Chojnacka" };

export default function AboutPage() {
  return (
    <Layout>
      <div className="container about-page">
        <div className="row row page-description">
          <div className="col-md-12">
            <p>
              Martyna Chojnacka is a Berlin-based programmer and creative coder with over ten years of experience building software — from web applications and digital products to interactive installations and physical computing systems. She has worked as a freelancer and within digital studios, developing across the full stack for clients and institutions alike.
            </p>
            <p>
              Alongside her programming practice, Martyna holds a diploma in Creative Coding (Warsaw, 2022) and has consistently operated at the intersection of code and art — building reactive video installations, kinetic sculptures, and real-time audiovisual systems exhibited at venues including the Museum of Modern Art Warsaw, the Szczecin Philharmonic, TEDx Warsaw, as well as festivals such as Unsound, Transmediale, and Berlin New Media Week 2025.
            </p>
            <p>
              Currently, she is deepening her expertise in data science, machine learning, and AI through the Le Wagon bootcamp, while already applying AI in artistic contexts — most recently in The Mother Project, a touring performance piece using real-time AI video generation and motion-responsive systems. She also teaches creative coding at SWPS University in Warsaw, extending her practice into education and mentorship.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
